import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch("http://localhost:11434/api/tags");
        return NextResponse.json({ running: res.ok });
    } catch (error) {
        return NextResponse.json({ running: false });
    }
}
