import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function POST() {
  try {
    // Stop Ollama service using systemctl
    await execPromise("pkill -f 'ollama serve'");

    return NextResponse.json({
      success: true,
      message: "Ollama stopped successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
