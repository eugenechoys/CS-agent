import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "The old CS login endpoint has been replaced. Use /api/cs-demo/auth/send-otp and /api/cs-demo/auth/verify-otp instead.",
    },
    { status: 410 },
  );
}
