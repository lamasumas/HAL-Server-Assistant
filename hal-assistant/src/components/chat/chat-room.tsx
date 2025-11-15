"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ChatRole } from "./types";
import ChatHeader from "./chat-header";
import MessagesArea from "./chat-display";
import OllamaControls from "./ollama-controls";
import ChatInput from "./chat-input";
import { useOllamaStatus } from "@/hooks/ollama-status";
import {
  sendMessageToLlm,
  startOllamaService,
  stopOllamaService,
} from "../ollama/ollama-interface";

export default function OllamaChatRoom() {
  const {
    ollamaStatus,
    statusLoading,
    availableModels,
    selectedModel,
    loadingModels,
    setOllamaStatus,
    setSelectedModel,
    checkOllamaStatus,
  } = useOllamaStatus();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm ready to chat. Make sure Ollama is running.",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startOllama = async () => {
    addMessage("system", "Attempting to start Ollama...");
    try {
      await startOllamaService();
      addMessage("system", "Ollama started successfully.");
      setOllamaStatus("running");
      await checkOllamaStatus();
    } catch (error: any) {
      addMessage("system", `Failed to start Ollama: ${error.message}`);
    }
  };

  const stopOllama = async () => {
    addMessage("system", "Attempting to stop Ollama...");
    try {
      await stopOllamaService();
      addMessage("system", "Ollama stopped successfully.");
      setOllamaStatus("stopped");
      await checkOllamaStatus();
    } catch (error: any) {
      addMessage("system", `Failed to stop Ollama: ${error.message}`);
    }
  };

  const addMessage = (role: ChatRole, content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        role,
        content,
      },
    ]);
  };

  const updateMessage = (id: number, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (ollamaStatus !== "running") {
      addMessage(
        "system",
        "Error: Ollama is not running. Please start it or check the status."
      );
      return;
    }

    if (!selectedModel) {
      addMessage("system", "Error: No model selected or available.");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    addMessage("user", userMessage);
    setIsLoading(true);

    // Create placeholder message for streaming
    const assistantMessageId = Date.now() + Math.random();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      },
    ]);

    try {
      const response = await sendMessageToLlm(selectedModel, userMessage);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.response) {
                accumulatedContent += json.response;
                updateMessage(assistantMessageId, accumulatedContent);
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.warn("Failed to parse JSON line:", line);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      // Remove placeholder and show error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessageId)
      );
      addMessage(
        "system",
        `Error sending message: ${error.message}. Check your Ollama setup and model availability.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen max-h-screen">
      <ChatHeader
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        availableModels={availableModels}
        loadingModels={loadingModels}
      />

      <MessagesArea
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />

      <OllamaControls
        ollamaStatus={ollamaStatus}
        statusLoading={statusLoading}
        onStart={startOllama}
        onStop={stopOllama}
        onRefresh={checkOllamaStatus}
      />

      <ChatInput
        input={input}
        setInput={setInput}
        onSend={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}
