import { KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export default function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
}: ChatInputProps) {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-4 shadow-2xl">
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask a question..."
          disabled={isLoading}
          className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition-shadow"
        />
        <button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl px-6 py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 font-semibold shadow-xl"
        >
          <Send size={20} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}
