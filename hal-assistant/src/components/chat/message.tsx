import React from "react";
import { ChatMessage } from "./types";

interface MessageProps {
  message: ChatMessage;
}

export default function Message({ message }: MessageProps) {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      } transition-opacity duration-300`}
    >
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-xl p-4 shadow-md ${
          message.role === "user"
            ? "bg-blue-600 text-white rounded-br-none"
            : message.role === "system"
            ? "bg-yellow-600 text-white text-center rounded-tl-none mx-auto"
            : "bg-gray-700 text-gray-100 rounded-tl-none"
        }`}
      >
        {message.role === "system" && (
          <div className="text-xs font-mono font-semibold mb-1 uppercase tracking-wider">
            System Alert
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm md:text-base">
          {message.content}
        </div>
      </div>
    </div>
  );
}
