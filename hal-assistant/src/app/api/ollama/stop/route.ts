// app/api/ollama/stop/route.ts
import { exec } from "child_process";
import { promisify } from "util";
import { NextResponse } from "next/server";

const execAsync = promisify(exec);

export async function POST() {
    try {
        await execAsync("pkill -f ollama");
        return NextResponse.json({
            success: true,
            message: "Ollama stopped",
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 },
        );
    }
}
