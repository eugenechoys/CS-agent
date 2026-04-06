import { NextResponse } from "next/server";
import { ensureOpenAiApiKeyLoaded } from "@/lib/config/openai-key";

export async function GET() {
  const apiKey = ensureOpenAiApiKeyLoaded();

  return NextResponse.json({
    hasOpenAiKey: Boolean(apiKey),
    mode: apiKey ? "openai" : "missing_key",
  });
}
