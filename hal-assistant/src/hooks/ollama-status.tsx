import { useState, useEffect } from "react";

// Define shared types, exported for use in components
export interface Model {
  name: string;
}
export type OllamaStatus = "running" | "stopped" | "unknown";
export type SetModelFunc = (modelName: string) => void;

interface OllamaStatusHook {
  ollamaStatus: OllamaStatus;
  statusLoading: boolean;
  availableModels: Model[];
  selectedModel: string;
  loadingModels: boolean;
  setSelectedModel: SetModelFunc;
  setOllamaStatus: (status: OllamaStatus) => void;
  checkOllamaStatus: () => Promise<void>;
  fetchAvailableModels: () => Promise<void>;
}

export const useOllamaStatus = (): OllamaStatusHook => {
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>("unknown");
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [loadingModels, setLoadingModels] = useState<boolean>(false);

  // Function to fetch available models
  const fetchAvailableModels = async () => {
    setLoadingModels(true);
    try {
      const res = await fetch("http://localhost:11434/api/tags");
      if (res.ok) {
        const data = await res.json();
        const models: Model[] = data.models || [];
        setAvailableModels(models);
        // Set the first model as selected if none is chosen yet
        if (models.length > 0 && !selectedModel) {
          setSelectedModel(models[0].name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // Function to check Ollama's overall status
  const checkOllamaStatus = async () => {
    setStatusLoading(true);
    try {
      // Attempt to hit the tags endpoint to check connectivity
      const res = await fetch("http://localhost:11434/api/tags");
      const status: OllamaStatus = res.ok ? "running" : "stopped";
      setOllamaStatus(status);

      if (res.ok) {
        // Only attempt to fetch models if the status check succeeded
        await fetchAvailableModels();
      } else {
        setAvailableModels([]);
        setSelectedModel("");
      }
    } catch {
      setOllamaStatus("stopped");
      setAvailableModels([]);
      setSelectedModel("");
    } finally {
      setStatusLoading(false);
    }
  };

  // Run initial status check on component mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  return {
    ollamaStatus,
    statusLoading,
    availableModels,
    selectedModel,
    loadingModels,
    setSelectedModel,
    setOllamaStatus,
    checkOllamaStatus,
    fetchAvailableModels, // Exposed just in case external refresh is needed
  };
};
