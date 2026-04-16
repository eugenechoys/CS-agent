import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyChoysOtp, loadCsDemoContext } from "@/lib/cs-demo/choys-client";
import { CS_DEMO_COOKIE_KEYS } from "@/lib/cs-demo/cookies";
import { CsApiEnvSchema } from "@/lib/schemas/cs-schemas";

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4),
  apiEnv: CsApiEnvSchema.default("dev"),
});

export async function POST(request: Request) {
  try {
    const body = VerifyOtpSchema.parse(await request.json());
    const payload = await verifyChoysOtp(body.email, body.otp, body.apiEnv);
    const accessToken = payload?.data?.accessToken;
    const refreshToken = payload?.data?.refreshToken;

    if (!accessToken) {
      throw new Error("No access token was returned by Choys auth.");
    }

    const context = await loadCsDemoContext({ accessToken, apiEnv: body.apiEnv });
    const response = NextResponse.json({ success: true, context });

    response.cookies.set(CS_DEMO_COOKIE_KEYS.apiEnv, body.apiEnv, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    response.cookies.set(CS_DEMO_COOKIE_KEYS.accessToken, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    if (refreshToken) {
      response.cookies.set(CS_DEMO_COOKIE_KEYS.refreshToken, refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
      });
    }

    if (context.authTenantName) {
      response.cookies.set(CS_DEMO_COOKIE_KEYS.authTenantName, context.authTenantName, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify OTP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
