import { NextResponse } from "next/server";
import { listCsConversations, getCsConversationsByTenant, getCsConversationsByUser } from "@/lib/store/memory";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const userId = searchParams.get("userId");

  const conversations = userId
    ? getCsConversationsByUser(userId)
    : tenantId
      ? getCsConversationsByTenant(tenantId)
      : listCsConversations();

  return NextResponse.json({ conversations });
}
