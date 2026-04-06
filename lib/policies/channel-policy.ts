import { loadPrompt } from "@/lib/prompts/load-prompt";
import type { Channel, MessageDraft } from "@/lib/schemas/bokchoys";

export type ChannelDecisionInput = {
  purpose: string;
  importance: MessageDraft["importance"];
  phase: MessageDraft["phase"];
};

const RATIONALES: Record<Channel, string> = {
  whatsapp: "WhatsApp is best for high-attention moments that should feel direct and personal.",
  email: "Email is best for formal launches, summaries, and messages that should feel official.",
  slack: "Slack works well for workday nudges and lightweight reminders inside the flow of work.",
  teams: "Teams is a strong in-work channel for reminders and participation prompts.",
  browser_extension: "Browser extension notifications are good for ambient nudges and in-product reminders.",
};

/** Get the full channel policy prompt text for agent context */
export function getChannelPolicyText() {
  return loadPrompt("policies/channel-policy.md");
}

/** Deterministic channel decision — fallback only, AI should decide in normal flow */
export function decideChannel(input: ChannelDecisionInput): Channel {
  const purpose = input.purpose.toLowerCase();

  if (input.importance === "high" && (input.phase === "before" || purpose.includes("survey"))) {
    return "whatsapp";
  }

  if (
    input.phase === "after" ||
    purpose.includes("launch") ||
    purpose.includes("summary") ||
    purpose.includes("report")
  ) {
    return "email";
  }

  if (purpose.includes("nudge") || purpose.includes("reminder")) {
    return "slack";
  }

  if (purpose.includes("micro") || purpose.includes("ambient")) {
    return "browser_extension";
  }

  return "teams";
}

export function explainChannel(channel: Channel) {
  return RATIONALES[channel];
}
