import db from "./db";
export interface Conversation {
  id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

// Conversation queries
export const conversationQueries = {
  create: (title?: string) => {
    const stmt = db.prepare(
      "INSERT INTO conversations (title) VALUES (?) RETURNING *"
    );
    return stmt.get(title || null) as Conversation;
  },

  getAll: () => {
    const stmt = db.prepare(
      "SELECT * FROM conversations ORDER BY updated_at DESC"
    );
    return stmt.all() as Conversation[];
  },

  getById: (id: number) => {
    const stmt = db.prepare("SELECT * FROM conversations WHERE id = ?");
    return stmt.get(id) as Conversation | undefined;
  },

  update: (id: number, title: string) => {
    const stmt = db.prepare(
      "UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    );
    return stmt.run(title, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM conversations WHERE id = ?");
    return stmt.run(id);
  },

  touch: (id: number) => {
    // Update the updated_at timestamp
    const stmt = db.prepare(
      "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    );
    return stmt.run(id);
  },
};

// Message queries
export const messageQueries = {
  create: (
    conversationId: number,
    role: "user" | "assistant" | "system",
    content: string
  ) => {
    const stmt = db.prepare(
      "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?) RETURNING *"
    );
    const message = stmt.get(conversationId, role, content) as Message;

    // Update conversation timestamp
    conversationQueries.touch(conversationId);

    return message;
  },

  getByConversation: (conversationId: number) => {
    const stmt = db.prepare(
      "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
    );
    return stmt.all(conversationId) as Message[];
  },

  deleteByConversation: (conversationId: number) => {
    const stmt = db.prepare("DELETE FROM messages WHERE conversation_id = ?");
    return stmt.run(conversationId);
  },

  getLastN: (conversationId: number, n: number) => {
    const stmt = db.prepare(
      "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?"
    );
    const messages = stmt.all(conversationId, n) as Message[];
    return messages.reverse(); // Reverse to get chronological order
  },
};
