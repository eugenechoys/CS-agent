import { z } from "zod";

export const CsAgentModeSchema = z.enum(["employee-cs", "hr-expert"]);
export type CsAgentMode = z.infer<typeof CsAgentModeSchema>;

export const CsApiEnvSchema = z.enum(["dev", "prod"]);
export type CsApiEnv = z.infer<typeof CsApiEnvSchema>;

export const CsSourceTypeSchema = z.enum(["live", "mock", "hybrid"]);
export type CsSourceType = z.infer<typeof CsSourceTypeSchema>;

export const CsTenantSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  isCurrent: z.boolean().default(false),
  isExpired: z.boolean().optional(),
  sourceType: CsSourceTypeSchema.default("mock"),
});

export type CsTenantSummary = z.infer<typeof CsTenantSummarySchema>;

export const CsUserSummarySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  email: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  jobTitle: z.string().nullable().optional(),
  sourceType: CsSourceTypeSchema.default("mock"),
});

export type CsUserSummary = z.infer<typeof CsUserSummarySchema>;

const InsurancePlanSchema = z.object({
  provider: z.string(),
  planName: z.string(),
  coverageAmount: z.number().optional(),
  copay: z.number().optional(),
  notes: z.string().optional(),
});

const BenefitsSchema = z.object({
  eapEnrolled: z.boolean().optional(),
  wellnessCreditsBalance: z.number().optional(),
  gymMembership: z.string().optional(),
  mentalHealthSessionsRemaining: z.number().optional(),
  annualHealthScreening: z.string().optional(),
});

export const CsLiveUserProfileSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  email: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  jobTitle: z.string().nullable().optional(),
  accountStatus: z.string().optional(),
  dateJoined: z.string().optional(),
  dependentsCount: z.number().optional(),
  enrollmentStatus: z.string().optional(),
  insurance: z
    .object({
      medical: InsurancePlanSchema.optional(),
      dental: InsurancePlanSchema.optional(),
      outpatient: InsurancePlanSchema.optional(),
    })
    .optional(),
  benefits: BenefitsSchema.optional(),
});

export type CsLiveUserProfile = z.infer<typeof CsLiveUserProfileSchema>;

export const CsBehaviorSummarySchema = z.object({
  monthlyActivities: z.number().optional(),
  activityStreakDays: z.number().optional(),
  lastActiveDate: z.string().optional(),
  moodTrend: z.string().optional(),
  recognitionsSent: z.number().optional(),
  recognitionsReceived: z.number().optional(),
  coinsBalance: z.number().optional(),
  surveyParticipationRate: z.number().optional(),
  openSurveys: z.number().optional(),
});

export type CsBehaviorSummary = z.infer<typeof CsBehaviorSummarySchema>;

export const CsSourceSummarySchema = z.object({
  sourceId: z.string(),
  label: z.string(),
  endpointGroup: z.string(),
  scope: z.enum(["tenant", "user"]),
  tenantId: z.string(),
  userId: z.string().optional(),
  fields: z.array(z.string()),
  sourceType: CsSourceTypeSchema,
  status: z.enum(["success", "partial", "empty", "error"]).default("success"),
  preview: z.array(z.string()).default([]),
  note: z.string().optional(),
});

export type CsSourceSummary = z.infer<typeof CsSourceSummarySchema>;

export const CsChatRequestSchema = z.object({
  message: z.string().min(1),
  mode: CsAgentModeSchema,
  tenantId: z.string().min(1),
  userId: z.string().optional(),
  conversationId: z.string().optional(),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
  stream: z.boolean().optional(),
});

export type CsChatRequest = z.infer<typeof CsChatRequestSchema>;

export const CsChatResponseSchema = z.object({
  message: z.string(),
  sourceSummaries: z.array(CsSourceSummarySchema).default([]),
});

export type CsChatResponse = z.infer<typeof CsChatResponseSchema>;

export const CsConversationSchema = z.object({
  id: z.string(),
  mode: CsAgentModeSchema,
  tenantId: z.string(),
  userId: z.string().optional(),
  messages: z.array(
    z.object({ role: z.enum(["user", "assistant"]), content: z.string(), timestamp: z.string() }),
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CsConversation = z.infer<typeof CsConversationSchema>;

export const CsWorkflowNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["agent", "subagent", "tool", "skill", "data"]),
  description: z.string(),
});

export const CsWorkflowEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
});

export const CsWorkflowConfigSchema = z.object({
  mode: CsAgentModeSchema,
  title: z.string(),
  summary: z.string(),
  nodes: z.array(CsWorkflowNodeSchema),
  edges: z.array(CsWorkflowEdgeSchema),
  liveDomains: z.array(z.string()),
});

export type CsWorkflowConfig = z.infer<typeof CsWorkflowConfigSchema>;

export const CsDemoContextResponseSchema = z.object({
  authenticated: z.boolean(),
  authMode: z.enum(["session", "env", "mock", "none"]),
  apiEnv: CsApiEnvSchema.default("dev"),
  authTenantName: z.string().optional(),
  sourceType: CsSourceTypeSchema.default("mock"),
  tenants: z.array(CsTenantSummarySchema),
  users: z.array(CsUserSummarySchema),
});

export type CsDemoContextResponse = z.infer<typeof CsDemoContextResponseSchema>;
