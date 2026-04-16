import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureOpenAiApiKeyLoaded } from "@/lib/config/openai-key";
import { resolveChoysSession } from "@/lib/cs-demo/choys-client";
import { CS_DEMO_COOKIE_KEYS } from "@/lib/cs-demo/cookies";

export async function GET() {
  const apiKey = ensureOpenAiApiKeyLoaded();
  const cookieStore = await cookies();
  const apiEnv = cookieStore.get(CS_DEMO_COOKIE_KEYS.apiEnv)?.value === "prod" ? "prod" : "dev";
  const choysSession = resolveChoysSession(undefined, undefined, apiEnv);

  return NextResponse.json({
    hasOpenAiKey: Boolean(apiKey),
    mode: apiKey ? "openai" : "missing_key",
    hasChoysEnvAuth: Boolean(choysSession.accessToken),
    apiEnv,
  });
}
