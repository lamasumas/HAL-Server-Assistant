import { MessageStruct } from "../db/db-functions";

export async function sendMessageToLlm(
  selectedModel: string,
  userMessage: string,
  history: MessageStruct[],
  summary?: string
) {
  const lastMessages = history.length > 5 ? history.slice(-5) : history;

  const summaryMessage =
    summary && summary !== ""
      ? {
          role: "system",
          content:
            "This is a summuary of our conversation until now: " + summary,
        }
      : undefined;

  const response = await fetch("api/ollama/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        ...(summaryMessage ? [summaryMessage] : []),
        ...lastMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: userMessage },
      ],
      options: {
        num_predict: 1000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Ollama request failed: " + response.statusText);
  }

  return response;
}

export async function stopOllamaService() {
  const response = await fetch("api/ollama/stop", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Ollama request failed: " + response.statusText);
  }
}

export async function summaryChat(
  selectedModel: string,
  history: MessageStruct[]
) {
  const messagesChat = history
    .filter((msg) => msg.role !== "system")
    .map((msg) => msg.role + ": " + msg.content)
    .join("\n");

  const prompt =
    "Summarize the content of our chat, so you undersstand the context of our conversation. Return only the summary.\n\n" +
    messagesChat;

  const response = await fetch("api/ollama/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: selectedModel,
      prompt: prompt,
      stream: false,
      options: {
        num_predict: 500,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Ollama request failed: " + response.statusText);
  }

  const data = await response.json();
  return data.response;
}

export async function startOllamaService() {
  const response = await fetch("api/ollama/start", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Ollama request failed: " + response.statusText);
  }
}

export async function loadConversation(conversationId: number) {
  try {
    const res = await fetch(`/api/messages?conversation_id=${conversationId}`);
    if (res.ok) {
      const dbMessages = await res.json();
      return dbMessages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }));
    }
  } catch (error) {
    console.error("Failed to load conversation:", error);
  }
}
