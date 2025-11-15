import React from "react";
import { Power, PowerOff, RefreshCw } from "lucide-react";
import { OllamaStatus } from "./types";

interface OllamaControlsProps {
  ollamaStatus: OllamaStatus;
  statusLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  onRefresh: () => void;
}

export default function OllamaControls({
  ollamaStatus,
  statusLoading,
  onStart,
  onStop,
  onRefresh,
}: OllamaControlsProps) {
  const getStatusColor = (): string => {
    switch (ollamaStatus) {
      case "running":
        return "bg-green-500";
      case "stopped":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4 shadow-inner">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <span className="text-sm font-medium text-gray-300">
            Ollama Status:{" "}
            <span className="capitalize font-bold">{ollamaStatus}</span>
          </span>
        </div>

        <button
          onClick={onStart}
          disabled={statusLoading || ollamaStatus === "running"}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          title="Start Ollama"
        >
          <Power size={18} />
          Start
        </button>

        <button
          onClick={onStop}
          disabled={statusLoading || ollamaStatus === "stopped"}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          title="Stop Ollama"
        >
          <PowerOff size={18} />
          Stop
        </button>

        <button
          onClick={onRefresh}
          disabled={statusLoading}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors"
          title="Refresh Status"
        >
          <RefreshCw
            size={18}
            className={statusLoading ? "animate-spin" : ""}
          />
        </button>
      </div>
    </div>
  );
}
