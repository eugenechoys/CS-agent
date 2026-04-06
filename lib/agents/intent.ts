import type { IntentType } from "@/lib/schemas/bokchoys";

export function classifyIntent(message: string): IntentType {
  const lower = message.toLowerCase();

  if (
    lower.includes("report") ||
    lower.includes("graph") ||
    lower.includes("chart") ||
    lower.includes("deck")
  ) {
    return "build_report";
  }

  if (
    lower.includes("analy") ||
    lower.includes("table") ||
    lower.includes("data") ||
    lower.includes("dataset")
  ) {
    return "analyze_data";
  }

  if (
    lower.includes("create program") ||
    lower.includes("design") ||
    lower.includes("calendar") ||
    lower.includes("launch")
  ) {
    return "design_program";
  }

  return "brainstorm";
}

