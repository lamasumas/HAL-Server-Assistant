"use server";
import { NextResponse } from "next/server";
import { conversationQueries } from "@/lib/db/db-queries";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = conversationQueries.getById(parseInt(params.id));
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(conversation);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title } = await req.json();
    conversationQueries.update(parseInt(params.id), title);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    conversationQueries.delete(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
