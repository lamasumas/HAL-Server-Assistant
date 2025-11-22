export type ChatRole = "user" | "assistant" | "system";
export type OllamaStatus = "running" | "stopped" | "unknown";

export interface Model {
  name: string;
}
