import { loadPrompt } from "@/lib/prompts/load-prompt";

export function getSafetyPolicyText() {
  return loadPrompt("policies/safety-policy.md");
}
