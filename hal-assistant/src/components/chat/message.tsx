import React from "react";
import ReactMarkdown from "react-markdown";
import { MessageStruct } from "../db/db-functions";
import CodeBlock from "./code-block";

interface MessageProps {
  message: MessageStruct;
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
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <CodeBlock
                    language={match[1]}
                    value={String(children).replace(/\n$/, "")}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
