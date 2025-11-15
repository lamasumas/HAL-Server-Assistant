export async function sendMessageToLlm(
  selectedModel: string,
  userMessage: string
) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: selectedModel,
      prompt: userMessage,
      stream: true,
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

export async function startOllamaService() {
  const response = await fetch("api/ollama/start", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Ollama request failed: " + response.statusText);
  }
}
