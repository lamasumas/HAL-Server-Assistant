// src/components/chat/sidebar.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import {
  fetchConversationsFromDB,
  deleteConversationFromDB,
  updateConverstionFromDB,
} from "@/components/db/db-functions";
import { standardizeDate } from "@/components/common/date";

interface Conversation {
  id: number;
  title: string | null;
  model: string;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  currentConversationId: number | null;
  onConversationSelect: (id: number) => void;
  onNewConversation: () => void;
}

export default function Sidebar({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    await fetchConversationsFromDB(setConversations, setLoading);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;

    await deleteConversationFromDB(
      id,
      conversations,
      setConversations,
      currentConversationId,
      onNewConversation
    );
  };

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || `Chat with ${conv.model}`);
  };

  const saveEdit = async (id: number) => {
    await updateConverstionFromDB(
      id,
      editTitle,
      conversations,
      setConversations,
      setEditingId
    );
  };

  const formatDate = (dateString: string) => {
    return standardizeDate(dateString);
  };

  return (
    <>
      {/* Toggle Button - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors shadow-lg"
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-80 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 pt-20 border-b border-gray-700">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
          >
            <Plus size={20} />
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onConversationSelect(conv.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  currentConversationId === conv.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                {editingId === conv.id ? (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(conv.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(conv.id)}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">
                          {conv.title || `Chat with ${conv.model}`}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {formatDate(conv.updated_at)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startEditing(conv, e)}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Rename"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="p-1 hover:bg-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        `}</style>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
