// src/app/api/messages/route.ts
import { messageQueries } from "@/lib/db/db-queries";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversation_id");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversation_id is required" },
        { status: 400 }
      );
    }

    const messages = await messageQueries.getByConversation(
      parseInt(conversationId)
    );
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { conversation_id, role, content } = await req.json();

    if (!conversation_id || !role || !content) {
      return NextResponse.json(
        { error: "conversation_id, role, and content are required" },
        { status: 400 }
      );
    }

    const message = await messageQueries.create(conversation_id, role, content);
    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
