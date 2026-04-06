import { loadPrompt } from "@/lib/prompts/load-prompt";

export async function createSpecialistAgents() {
  const agentsModule = await import("@openai/agents");
  const { Agent, tool } = agentsModule as any;
  const { z } = await import("zod");
  const tools = await import("@/lib/tools");
  const { getOrCreateDefaultSampleDataset, getDatasetById } = await import("@/lib/store/memory");

  const generateProgramOutlineTool = tool({
    name: "generate_program_outline",
    description: "Create a strategic program outline from an HR brief.",
    parameters: z.object({
      brief: z.string(),
      cadence: z.string().optional(),
      targetAudience: z.string().optional(),
    }),
    async execute(input: any) {
      return tools.generateProgramOutline(input);
    },
  });

  const generateProgramCalendarTool = tool({
    name: "generate_program_calendar",
    description: "Create a draft program calendar with recommended activities.",
    parameters: z.object({
      brief: z.string(),
      cadence: z.string().optional(),
      targetAudience: z.string().optional(),
    }),
    async execute(input: any) {
      return tools.generateProgramCalendar(input);
    },
  });

  const generateCommsPlanTool = tool({
    name: "generate_comms_plan",
    description: "Create a before, during, and after communications plan.",
    parameters: z.object({
      title: z.string(),
      objective: z.string(),
      cadence: z.string(),
    }),
    async execute(input: any) {
      return tools.generateCommsPlan(input);
    },
  });

  const generateMessageSequenceTool = tool({
    name: "generate_message_sequence",
    description: "Generate channel-aware message drafts for a program.",
    parameters: z.object({
      title: z.string(),
      objective: z.string(),
      cadence: z.string(),
    }),
    async execute(input: any) {
      return tools.generateMessageSequence(input);
    },
  });

  const buildPollDraftTool = tool({
    name: "build_poll_draft",
    description: "Build a poll draft recommendation.",
    parameters: z.object({ topic: z.string() }),
    async execute({ topic }: any) {
      return tools.buildPollDraft(topic);
    },
  });

  const buildSurveyDraftTool = tool({
    name: "build_survey_draft",
    description: "Build a survey draft recommendation.",
    parameters: z.object({ topic: z.string() }),
    async execute({ topic }: any) {
      return tools.buildSurveyDraft(topic);
    },
  });

  const buildGameDraftTool = tool({
    name: "build_game_draft",
    description: "Build a game draft recommendation from the available game templates.",
    parameters: z.object({ topic: z.string() }),
    async execute({ topic }: any) {
      return tools.buildGameDraft(topic);
    },
  });

  const ingestDatasetTool = tool({
    name: "ingest_dataset",
    description: "Find a dataset from the upload registry or fall back to the default sample dataset.",
    parameters: z.object({ datasetId: z.string().optional() }),
    async execute({ datasetId }: any) {
      return getDatasetById(datasetId) ?? getOrCreateDefaultSampleDataset();
    },
  });

  const analyzeDatasetTool = tool({
    name: "analyze_dataset",
    description: "Analyze an uploaded or sample dataset for HR insights.",
    parameters: z.object({
      datasetId: z.string().optional(),
      query: z.string().optional(),
    }),
    async execute({ datasetId, query }: any) {
      const dataset = getDatasetById(datasetId) ?? getOrCreateDefaultSampleDataset();
      return tools.analyzeDataset({ dataset, query });
    },
  });

  const buildTableArtifactTool = tool({
    name: "build_table_artifact",
    description: "Turn analysis rows into a typed table artifact.",
    parameters: z.object({ analysis: z.any() }),
    async execute({ analysis }: any) {
      return tools.buildTableArtifact(analysis);
    },
  });

  const buildChartSpecTool = tool({
    name: "build_chart_spec",
    description: "Create a standard dashboard chart specification.",
    parameters: z.object({ analysis: z.any() }),
    async execute({ analysis }: any) {
      return tools.buildChartSpec(analysis);
    },
  });

  const buildSlidesArtifactTool = tool({
    name: "build_slides_artifact",
    description: "Create a slides-style reporting artifact from an analysis.",
    parameters: z.object({ analysis: z.any() }),
    async execute({ analysis }: any) {
      return tools.buildSlidesArtifact(analysis);
    },
  });

  const strategistAgent = new Agent({
    name: "HRStrategistAgent",
    model: "gpt-5.1",
    instructions: loadPrompt("specialists/hr-strategist.md"),
    tools: [generateProgramOutlineTool],
  });

  const programDesignerAgent = new Agent({
    name: "ProgramDesignerAgent",
    model: "gpt-5.1",
    instructions: loadPrompt("specialists/program-designer.md"),
    tools: [
      generateProgramOutlineTool,
      generateProgramCalendarTool,
      buildPollDraftTool,
      buildSurveyDraftTool,
      buildGameDraftTool,
    ],
  });

  const commsPlannerAgent = new Agent({
    name: "CommsPlannerAgent",
    model: "gpt-5.1",
    instructions: loadPrompt("specialists/comms-planner.md"),
    tools: [generateCommsPlanTool, generateMessageSequenceTool],
  });

  const insightsAnalystAgent = new Agent({
    name: "InsightsAnalystAgent",
    model: "gpt-5.1",
    instructions: loadPrompt("specialists/insights-analyst.md"),
    tools: [ingestDatasetTool, analyzeDatasetTool, buildTableArtifactTool, buildChartSpecTool],
  });

  const reportComposerAgent = new Agent({
    name: "ReportComposerAgent",
    model: "gpt-5.1",
    instructions: loadPrompt("specialists/report-composer.md"),
    tools: [buildTableArtifactTool, buildChartSpecTool, buildSlidesArtifactTool],
  });

  return {
    strategistAgent,
    programDesignerAgent,
    commsPlannerAgent,
    insightsAnalystAgent,
    reportComposerAgent,
  };
}
