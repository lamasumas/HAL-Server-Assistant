"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChatRole } from "./types";
import ChatHeader from "./chat-header";
import MessagesArea from "./chat-display";
import OllamaControls from "./ollama-controls";
import ChatInput from "./chat-input";
import { useOllamaStatus } from "@/hooks/ollama-status";
import {
  loadConversation,
  sendMessageToLlm,
  startOllamaService,
  stopOllamaService,
  summaryChat,
} from "../ollama/ollama-interface";
import Sidebar from "./chat-history";
import { MessageStruct } from "../db/db-functions";

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

  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);

  const [currentSummary, setCurrentSummary] = useState<string>("");
  const [messages, setMessages] = useState<MessageStruct[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm ready to chat. Make sure Ollama is running.",
    } as MessageStruct,
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId).then((messages) => {
        setMessages(messages);
      });
    }
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewConversation = async () => {
    if (!selectedModel) {
      addMessage("system", "Error: No model selected.");
      return;
    }

    try {
      const res = await fetch("api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          title: "New Chat",
        }),
      });

      if (res.ok) {
        const newConv = await res.json();
        setCurrentConversationId(newConv.id);
        setMessages([
          {
            id: Date.now(),
            role: "assistant",
            content: "Hello! I'm ready to chat. Make sure Ollama is running.",
          } as MessageStruct,
        ]);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const saveMessageToDb = async (
    role: ChatRole,
    content: string,
    summary: string
  ): Promise<number | null> => {
    if (!currentConversationId) return null;

    try {
      const res = await fetch("api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: currentConversationId,
          role,
          content,
          summary,
        }),
      });

      if (res.ok) {
        const message = await res.json();
        return message.id;
      }
    } catch (error) {
      console.error("Failed to save message:", error);
    }
    return null;
  };

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
      } as MessageStruct,
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
      } as MessageStruct,
    ]);

    try {
      const response = await sendMessageToLlm(
        selectedModel,
        userMessage,
        messages,
        currentSummary
      );
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (reader) {
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            summaryChat(selectedModel, messages).then((summary) => {
              messages.forEach((m) => (m.summary = summary));
              setCurrentSummary(summary);
              saveMessageToDb("user", userMessage, summary);
              saveMessageToDb("assistant", accumulatedContent, summary);
            });
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.message?.content) {
                accumulatedContent += json.message.content.replace(
                  /\\n/g,
                  "\n"
                );
                updateMessage(assistantMessageId, accumulatedContent);
              }
            } catch (e) {
              console.error("JSON parse error:", e, "LINE:", line);
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
    <div className="flex w-full h-screen max-h-screen">
      <Sidebar
        currentConversationId={currentConversationId}
        onConversationSelect={setCurrentConversationId}
        onNewConversation={startNewConversation}
      />

      <div className="flex flex-col flex-1 w-full h-screen max-h-screen">
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
    </div>
  );
}
