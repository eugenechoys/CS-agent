import type { CsWorkflowConfig } from "@/lib/schemas/cs-schemas";

export const CS_WORKFLOW_CONFIGS: Record<"employee-cs" | "hr-expert", CsWorkflowConfig> = {
  "employee-cs": {
    mode: "employee-cs",
    title: "Employee CS Workflow",
    summary:
      "Employee CS combines shared support knowledge with tenant-selected context and optional live user lookups for self-service questions.",
    nodes: [
      {
        id: "employee-agent",
        label: "Employee CS Agent",
        kind: "agent",
        description: "Primary support voice for benefits, app help, and member questions.",
      },
      {
        id: "shared-knowledge",
        label: "Shared Knowledge",
        kind: "skill",
        description: "General CHOYS product, company, FAQ, and help-center guidance.",
      },
      {
        id: "employee-mode",
        label: "Employee Mode Prompt",
        kind: "skill",
        description: "Mode-specific answer framing, escalation rules, and self-service style.",
      },
      {
        id: "live-lookup",
        label: "Live Support Lookup",
        kind: "tool",
        description: "Curated Hoppscotch-backed read-only support lookup with tenant and user scope.",
      },
      {
        id: "tenant-data",
        label: "Tenant Data Sources",
        kind: "data",
        description: "Insurance, profile, activity, mood, recognition, coins, surveys, and tenant context.",
      },
    ],
    edges: [
      { from: "shared-knowledge", to: "employee-agent", label: "shared context" },
      { from: "employee-mode", to: "employee-agent", label: "mode framing" },
      { from: "tenant-data", to: "live-lookup", label: "read-only APIs" },
      { from: "live-lookup", to: "employee-agent", label: "personalized summary" },
    ],
    liveDomains: [
      "profile",
      "insurance",
      "activity",
      "mood",
      "recognition",
      "coins",
      "surveys",
      "tenant info",
    ],
  },
  "hr-expert": {
    mode: "hr-expert",
    title: "HR Expert Workflow",
    summary:
      "HR Expert is a selling/demo persona that uses shared knowledge, pitch guidance, and proof points without accessing personal employee data.",
    nodes: [
      {
        id: "hr-agent",
        label: "HR Expert Agent",
        kind: "agent",
        description: "Selling-focused demo persona for HR buyers and prospects.",
      },
      {
        id: "shared-knowledge",
        label: "Shared Knowledge",
        kind: "skill",
        description: "Core CHOYS company, product, FAQ, and support information.",
      },
      {
        id: "hr-mode",
        label: "HR Expert Prompt",
        kind: "skill",
        description: "Pitch positioning, objection handling, and demo storytelling.",
      },
      {
        id: "proof-points",
        label: "Demo Proof Points",
        kind: "skill",
        description: "Static sales-ready proof points, workflow visibility, and infrastructure strengths.",
      },
    ],
    edges: [
      { from: "shared-knowledge", to: "hr-agent", label: "shared context" },
      { from: "hr-mode", to: "hr-agent", label: "selling style" },
      { from: "proof-points", to: "hr-agent", label: "demo evidence" },
    ],
    liveDomains: [],
  },
};
