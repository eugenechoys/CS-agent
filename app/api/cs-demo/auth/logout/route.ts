import { NextResponse } from "next/server";
import { CS_DEMO_COOKIE_KEYS } from "@/lib/cs-demo/cookies";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(CS_DEMO_COOKIE_KEYS.accessToken, "", { path: "/", maxAge: 0 });
  response.cookies.set(CS_DEMO_COOKIE_KEYS.refreshToken, "", { path: "/", maxAge: 0 });
  response.cookies.set(CS_DEMO_COOKIE_KEYS.authTenantName, "", { path: "/", maxAge: 0 });
  return response;
}
