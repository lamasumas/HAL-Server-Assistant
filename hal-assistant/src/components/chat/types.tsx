export type ChatRole = "user" | "assistant" | "system";
export type OllamaStatus = "running" | "stopped" | "unknown";

export interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
}

export interface Model {
  name: string;
}
