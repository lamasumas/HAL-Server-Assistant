import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function POST() {
  try {
    // Start Ollama service using systemctl (recommended for Pi)
    await execPromise("nohup ollama serve > /dev/null 2>&1 &");

    // Wait a moment for the service to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify it's running
    const response = await fetch("http://localhost:11434/api/tags");

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Ollama started successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Ollama started but not responding" },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
