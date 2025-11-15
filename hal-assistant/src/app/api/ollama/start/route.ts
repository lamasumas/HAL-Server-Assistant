// app/api/ollama/start/route.ts
import { spawn } from "child_process";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const process = spawn("ollama", ["serve"], {
            detached: true,
            stdio: "ignore",
        });

        process.unref();

        return NextResponse.json({
            success: true,
            message: "Ollama started",
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 },
        );
    }
}
