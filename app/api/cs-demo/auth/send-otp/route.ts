import { NextResponse } from "next/server";
import { z } from "zod";
import { sendChoysOtp } from "@/lib/cs-demo/choys-client";
import { CS_DEMO_COOKIE_KEYS } from "@/lib/cs-demo/cookies";
import { CsApiEnvSchema } from "@/lib/schemas/cs-schemas";

const SendOtpSchema = z.object({
  email: z.string().email(),
  apiEnv: CsApiEnvSchema.default("dev"),
});

export async function POST(request: Request) {
  try {
    const body = SendOtpSchema.parse(await request.json());
    await sendChoysOtp(body.email, body.apiEnv);
    const response = NextResponse.json({ success: true });
    response.cookies.set(CS_DEMO_COOKIE_KEYS.apiEnv, body.apiEnv, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
