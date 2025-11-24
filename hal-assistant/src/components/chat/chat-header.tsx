"use client"
import { RefreshCw, Settings } from "lucide-react";
import { Model } from "./types";
import { useState } from "react";
import SettingsPanel from "../settings/settings-panel";

interface ChatHeaderProps {
  selectedModel: string;
  setSelectedModel: (modelName: string) => void;
  availableModels: Model[];
  loadingModels: boolean;
}

export default function ChatHeader({
  selectedModel,
  setSelectedModel,
  availableModels,
  loadingModels,
}: ChatHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-blue-400">Ollama Chat</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-300 whitespace-nowrap">
            Model:
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={loadingModels || availableModels.length === 0}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {availableModels.length === 0 ? (
              <option>No models available</option>
            ) : (
              availableModels.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name.replace(":latest", "")}
                </option>
              ))
            )}
          </select>
          {loadingModels && (
            <RefreshCw size={18} className="animate-spin text-blue-400" />
          )}
          <button onClick={() => setIsSettingsOpen(true)} className="text-gray-300 hover:text-white">
            <Settings size={20} />
          </button>
        </div>
      </div>
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
