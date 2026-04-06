import { z } from "zod";

export const IntentTypeSchema = z.enum([
  "brainstorm",
  "design_program",
  "analyze_data",
  "build_report",
]);

export const ChannelSchema = z.enum([
  "whatsapp",
  "email",
  "slack",
  "teams",
  "browser_extension",
]);

export const MessagePhaseSchema = z.enum(["before", "during", "after"]);
export const ImportanceSchema = z.enum(["low", "medium", "high"]);
export const DraftStatusSchema = z.enum(["draft"]);

export const MessageDraftSchema = z.object({
  id: z.string(),
  phase: MessagePhaseSchema,
  channel: ChannelSchema,
  sendOffset: z.string(),
  purpose: z.string(),
  importance: ImportanceSchema,
  draftCopy: z.string(),
  rationale: z.string(),
  editableByHr: z.boolean(),
});

export const CommsPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: DraftStatusSchema.default("draft"),
  messages: z.array(MessageDraftSchema),
});

export const PollOptionSchema = z.object({
  label: z.string(),
  emoji: z.string().optional(),
});

export const PollQuestionSchema = z.object({
  question: z.string(),
  options: z.array(PollOptionSchema),
});

export const SurveyQuestionSchema = z.object({
  question: z.string(),
  type: z.enum(["likert", "multiple_choice", "open_text"]),
  options: z.array(z.string()).optional(),
});

export const EngagementItemSchema = z.object({
  id: z.string(),
  type: z.enum(["poll", "survey", "game", "nudge", "event"]),
  title: z.string(),
  description: z.string(),
  template: z.string().nullable(),
  recommendedDay: z.string(),
  pollQuestions: z.array(PollQuestionSchema).optional(),
  surveyQuestions: z.array(SurveyQuestionSchema).optional(),
});

export const ProgramDaySchema = z.object({
  dayLabel: z.string(),
  theme: z.string(),
  focus: z.string(),
  activities: z.array(EngagementItemSchema),
});

export const ProgramDraftSchema = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string(),
  targetAudience: z.string(),
  cadence: z.string(),
  status: DraftStatusSchema.default("draft"),
  calendar: z.array(ProgramDaySchema),
  engagementItems: z.array(EngagementItemSchema),
  commsPlan: CommsPlanSchema,
});

export const IdeaCardSchema = z.object({
  title: z.string(),
  programName: z.string(),
  premise: z.string(),
  whyItCouldWork: z.string(),
  challenges: z.array(z.string()),
  dataSupport: z.string(),
  suggestedFormat: z.string(),
  duration: z.string(),
});

export const IdeaBoardArtifactSchema = z.object({
  id: z.string(),
  kind: z.literal("idea_board"),
  title: z.string(),
  summary: z.string(),
  followUpQuestion: z.string(),
  ideas: z.array(IdeaCardSchema),
});

export const ProgramCalendarArtifactSchema = z.object({
  id: z.string(),
  kind: z.literal("program_calendar"),
  title: z.string(),
  objective: z.string(),
  cadence: z.string(),
  days: z.array(ProgramDaySchema),
});

export const CommsPlanArtifactSchema = z.object({
  id: z.string(),
  kind: z.literal("comms_plan"),
  title: z.string(),
  channelsUsed: z.array(ChannelSchema),
  messages: z.array(MessageDraftSchema),
});

export const TableArtifactSchema = z.object({
  id: z.string(),
  kind: z.literal("table_report"),
  title: z.string(),
  summary: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))),
});

export const ChartSeriesSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const ChartSpecSchema = z.object({
  id: z.string(),
  type: z.enum(["bar", "line", "pie", "kpi", "trend"]),
  title: z.string(),
  summary: z.string(),
  series: z.array(ChartSeriesSchema),
});

export const ChartReportArtifactSchema = z.object({
  id: z.string(),
  kind: z.literal("chart_report"),
  title: z.string(),
  summary: z.string(),
  charts: z.array(ChartSpecSchema),
});

export const SlideSchema = z.object({
  headline: z.string(),
  body: z.string(),
  bullets: z.array(z.string()),
});

export const SlidesReportArtifactSchema = z.object({
  id: z.string(),
  kind: z.literal("slides_report"),
  title: z.string(),
  summary: z.string(),
  slides: z.array(SlideSchema),
});

export const KpiCardSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  change: z.string().optional(),
  changeDirection: z.enum(["up", "down", "flat"]).optional(),
  source: z.string().optional(),
});

export const KpiDashboardArtifactSchema = z.object({
  id: z.string(),
  kind: z.literal("kpi_dashboard"),
  title: z.string(),
  summary: z.string(),
  kpis: z.array(KpiCardSchema),
  insights: z.array(z.string()),
});

export const ArtifactSpecSchema = z.discriminatedUnion("kind", [
  IdeaBoardArtifactSchema,
  ProgramCalendarArtifactSchema,
  CommsPlanArtifactSchema,
  TableArtifactSchema,
  ChartReportArtifactSchema,
  SlidesReportArtifactSchema,
  KpiDashboardArtifactSchema,
]);

export const DatasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.record(z.string(), z.string())),
});

export const DatasetAnalysisResultSchema = z.object({
  id: z.string(),
  datasetId: z.string(),
  summary: z.string(),
  rowCount: z.number(),
  columnCount: z.number(),
  keyFindings: z.array(z.string()),
  metricRows: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
});

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  datasetId: z.string().optional(),
  messages: z.array(ChatMessageSchema).optional(),
  stream: z.boolean().optional(),
});

export const OrchestrationTraceSchema = z.object({
  mode: z.enum(["mock", "openai"]),
  intent: IntentTypeSchema,
  specialists: z.array(z.string()),
  tools: z.array(z.string()),
  skills: z.array(z.string()),
  notes: z.array(z.string()),
});

export const ArtifactKindSchema = z.enum([
  "idea_board",
  "program_calendar",
  "comms_plan",
  "table_report",
  "chart_report",
  "slides_report",
  "kpi_dashboard",
]);

/* ─── Agent-decided content blocks ─── */

export const AgentIdeaSchema = z.object({
  title: z.string(),
  programName: z.string(),
  premise: z.string(),
  whyItCouldWork: z.string(),
  challenges: z.array(z.string()),
  dataSupport: z.string(),
  suggestedFormat: z.string(),
  duration: z.string(),
});

export const AgentPollQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.object({ label: z.string(), emoji: z.string().optional() })),
});

export const AgentSurveyQuestionSchema = z.object({
  question: z.string(),
  type: z.enum(["likert", "multiple_choice", "open_text"]),
  options: z.array(z.string()).optional(),
});

export const AgentActivitySchema = z.object({
  type: z.enum(["poll", "survey", "game", "nudge", "event"]),
  title: z.string(),
  description: z.string(),
  day: z.string(),
  pollQuestions: z.array(AgentPollQuestionSchema).optional(),
  surveyQuestions: z.array(AgentSurveyQuestionSchema).optional(),
});

export const AgentProgramDaySchema = z.object({
  dayLabel: z.string(),
  theme: z.string(),
  focus: z.string(),
  activities: z.array(AgentActivitySchema),
});

export const AgentMessageSchema = z.object({
  phase: z.enum(["before", "during", "after"]),
  channel: z.enum(["whatsapp", "email", "slack", "teams", "browser_extension"]),
  sendOffset: z.string(),
  purpose: z.string(),
  importance: z.enum(["low", "medium", "high"]),
  draftCopy: z.string(),
  rationale: z.string(),
});

/* ─── Agent-decided analysis content ─── */

export const AgentKpiSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  change: z.string().optional(),
  changeDirection: z.enum(["up", "down", "flat"]).optional(),
  source: z.string().optional(),
});

export const AgentChartSchema = z.object({
  title: z.string(),
  type: z.enum(["bar", "line", "pie", "kpi", "trend"]),
  summary: z.string(),
  series: z.array(z.object({ label: z.string(), value: z.number() })),
});

export const AgentTableSchema = z.object({
  title: z.string(),
  summary: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))),
});

export const AgentSlideSchema = z.object({
  headline: z.string(),
  body: z.string(),
  bullets: z.array(z.string()),
});

export const AgentInsightSchema = z.object({
  text: z.string(),
  severity: z.enum(["info", "warning", "critical"]).optional(),
});

export const AgentChatOutputSchema = z.object({
  intent: IntentTypeSchema,
  message: z.string(),
  reasoningSummary: z.string(),
  artifactKinds: z.array(ArtifactKindSchema),
  tldr: z.string().optional(),
  followUpQuestion: z.string().optional(),

  /* Agent-decided content — brainstorm / design */
  ideas: z.array(AgentIdeaSchema).optional(),
  programTitle: z.string().optional(),
  programObjective: z.string().optional(),
  programCadence: z.string().optional(),
  programDays: z.array(AgentProgramDaySchema).optional(),
  commsMessages: z.array(AgentMessageSchema).optional(),

  /* Agent-decided content — analysis / reports */
  kpis: z.array(AgentKpiSchema).optional(),
  kpiTitle: z.string().optional(),
  kpiSummary: z.string().optional(),
  charts: z.array(AgentChartSchema).optional(),
  tables: z.array(AgentTableSchema).optional(),
  insights: z.array(AgentInsightSchema).optional(),
  slides: z.array(AgentSlideSchema).optional(),
  slideTitle: z.string().optional(),
  datasetsUsed: z.array(z.string()).optional(),
});

export const ChatResponseSchema = z.object({
  intent: IntentTypeSchema,
  message: z.string(),
  artifacts: z.array(ArtifactSpecSchema),
  programDraft: ProgramDraftSchema.optional(),
  analysis: DatasetAnalysisResultSchema.optional(),
  trace: OrchestrationTraceSchema,
});

export type IntentType = z.infer<typeof IntentTypeSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
export type MessageDraft = z.infer<typeof MessageDraftSchema>;
export type CommsPlan = z.infer<typeof CommsPlanSchema>;
export type ProgramDraft = z.infer<typeof ProgramDraftSchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
export type DatasetAnalysisResult = z.infer<typeof DatasetAnalysisResultSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ArtifactSpec = z.infer<typeof ArtifactSpecSchema>;
export type ChartSpec = z.infer<typeof ChartSpecSchema>;
export type OrchestrationTrace = z.infer<typeof OrchestrationTraceSchema>;
export type ArtifactKind = z.infer<typeof ArtifactKindSchema>;
export type AgentChatOutput = z.infer<typeof AgentChatOutputSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
