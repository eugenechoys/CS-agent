import { loadPrompt } from "@/lib/prompts/load-prompt";

export function getApprovalPolicyText() {
  return loadPrompt("policies/approval-policy.md");
}
