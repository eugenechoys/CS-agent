import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loadCsDemoContext, getMockDemoContext } from "@/lib/cs-demo/choys-client";
import { CS_DEMO_COOKIE_KEYS } from "@/lib/cs-demo/cookies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") || undefined;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CS_DEMO_COOKIE_KEYS.accessToken)?.value;
  const apiEnv = cookieStore.get(CS_DEMO_COOKIE_KEYS.apiEnv)?.value === "prod" ? "prod" : "dev";

  try {
    const context = await loadCsDemoContext({ accessToken, tenantId, apiEnv });
    return NextResponse.json(context);
  } catch (error) {
    console.error("[cs-demo-context]", error);
    return NextResponse.json(getMockDemoContext(tenantId, apiEnv));
  }
}
