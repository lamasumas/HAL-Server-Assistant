export interface ConversationSruct {
  id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageStruct {
  id?: number;
  conversation_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  summary?: string;
  created_at?: string;
}

export async function fetchConversationsFromDB(
  setConversations: (conversations: ConversationSruct[]) => void,
  setLoading: (loading: boolean) => void
) {
  setLoading(true);
  try {
    const conversations = await fetch("api/conversations");
    const data = await conversations.json();
    setConversations(data);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
  } finally {
    setLoading(false);
  }
}

export async function deleteConversationFromDB(
  id: number,
  conversations: ConversationSruct[],
  setConversations: (conversations: ConversationSruct[]) => void,
  currentConversationId: number | null,
  onNewConversation: () => void
) {
  try {
    const res = await fetch(`api/conversations/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setConversations(
        conversations.filter((chat: ConversationSruct) => chat.id !== id)
      );
      if (currentConversationId === id) {
        onNewConversation();
      }
    }
  } catch (error) {
    console.error("Failed to delete conversation:", error);
  }
}

export async function updateConverstionFromDB(
  id: number,
  editTitle: string,
  conversations: ConversationSruct[],
  setConversations: (conversations: ConversationSruct[]) => void,
  setEditingId: (id: number | null) => void
) {
  try {
    const res = await fetch(`api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle }),
    });
    if (res.ok) {
      setConversations(
        conversations.map((chat: ConversationSruct) =>
          chat.id === id ? { ...chat, title: editTitle } : chat
        )
      );
    }
  } catch (error) {
    console.error("Failed to update conversation:", error);
  } finally {
    setEditingId(null);
  }
}
