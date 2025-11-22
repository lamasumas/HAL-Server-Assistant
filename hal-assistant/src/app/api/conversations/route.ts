"use server";
import { conversationQueries } from "@/lib/db/db-queries";
import { NextResponse } from "next/server";

// Get all conversations
export async function GET() {
  try {
    const conversations = conversationQueries.getAll();
    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Create new conversation
export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    const conversation = conversationQueries.create(title);
    return NextResponse.json(conversation);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
