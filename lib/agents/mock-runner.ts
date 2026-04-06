import type { ChatResponse } from "@/lib/schemas/bokchoys";
import { getOrCreateDefaultSampleDataset, getDatasetById } from "@/lib/store/memory";
import { classifyIntent } from "@/lib/agents/intent";
import {
  analyzeDataset,
  buildChartReportArtifact,
  buildCommsPlanArtifact,
  buildIdeaBoardArtifact,
  buildProgramCalendarArtifact,
  buildSlidesArtifact,
  buildTableArtifact,
  generateProgramCalendar,
} from "@/lib/tools";

function buildTrace(intent: ChatResponse["intent"], datasetId?: string): ChatResponse["trace"] {
  if (intent === "brainstorm") {
    return {
      mode: "mock",
      intent,
      specialists: ["MasterHRAgent", "HRStrategistAgent"],
      tools: ["generate_program_outline", "build_idea_board_artifact"],
      skills: [
        "wellbeing-program-ideation",
        "hr-engagement-design",
        "artifact-composition",
      ],
      notes: [
        "The request looked vague, so Bokchoys stayed in ideation mode.",
        "The master agent would normally use the strategist specialist first.",
      ],
    };
  }

  if (intent === "design_program") {
    return {
      mode: "mock",
      intent,
      specialists: ["MasterHRAgent", "ProgramDesignerAgent", "CommsPlannerAgent"],
      tools: [
        "generate_program_outline",
        "generate_program_calendar",
        "build_poll_draft",
        "build_survey_draft",
        "build_game_draft",
        "generate_comms_plan",
        "generate_message_sequence",
      ],
      skills: [
        "hr-engagement-design",
        "game-selection",
        "communication-strategy",
        "artifact-composition",
      ],
      notes: [
        "Program design always includes communication planning in v1.",
        "The agent chooses the poll, survey, game, cadence, and channels while HR keeps override power.",
      ],
    };
  }

  if (intent === "analyze_data") {
    return {
      mode: "mock",
      intent,
      specialists: ["MasterHRAgent", "InsightsAnalystAgent"],
      tools: ["ingest_dataset", "analyze_dataset", "build_table_artifact", "build_chart_spec"],
      skills: ["data-analysis", "artifact-composition"],
      notes: [
        datasetId
          ? "Uploaded dataset was used for the analysis route."
          : "No uploaded dataset was supplied, so Bokchoys fell back to the mock dataset.",
        "Analysis stays grounded in available rows and columns only.",
      ],
    };
  }

  return {
    mode: "mock",
    intent,
    specialists: ["MasterHRAgent", "InsightsAnalystAgent", "ReportComposerAgent"],
    tools: [
      "ingest_dataset",
      "analyze_dataset",
      "build_table_artifact",
      "build_chart_spec",
      "build_slides_artifact",
    ],
    skills: ["data-analysis", "executive-reporting", "artifact-composition"],
    notes: [
      datasetId
        ? "Uploaded dataset was used as the reporting source."
        : "No uploaded dataset was supplied, so Bokchoys fell back to the mock dataset.",
      "Reporting packages the analysis into reviewable leadership-style artifacts.",
    ],
  };
}

export async function runMockBokchoys(input: {
  message: string;
  datasetId?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
}): Promise<ChatResponse> {
  const intent = classifyIntent(input.message);

  if (intent === "brainstorm") {
    return {
      intent,
      message:
        "I treated this as an ideation request and built an idea board first. From here, HR can choose a direction and ask Bokchoys to turn it into a concrete program draft.",
      artifacts: [buildIdeaBoardArtifact(input.message)],
      trace: buildTrace(intent, input.datasetId),
    };
  }

  if (intent === "design_program") {
    const programDraft = generateProgramCalendar({
      brief: input.message,
    });

    return {
      intent,
      message:
        "I moved directly into program design and generated a calendar plus a built-in communications plan. The program remains draft-only so HR can adjust cadence, channels, and activities.",
      programDraft,
      artifacts: [
        buildProgramCalendarArtifact(programDraft),
        buildCommsPlanArtifact(programDraft),
      ],
      trace: buildTrace(intent, input.datasetId),
    };
  }

  const dataset = getDatasetById(input.datasetId) ?? getOrCreateDefaultSampleDataset();
  const analysis = analyzeDataset({
    dataset,
    query: input.message,
  });

  if (intent === "analyze_data") {
    return {
      intent,
      message:
        "I treated this as an analysis request and returned a grounded draft table based on the available dataset.",
      analysis,
      artifacts: [buildTableArtifact(analysis), buildChartReportArtifact(analysis)],
      trace: buildTrace(intent, input.datasetId),
    };
  }

  return {
    intent,
    message:
      "I treated this as a report request and built report-style artifacts from the available dataset, including chart and slides-style drafts.",
    analysis,
    artifacts: [
      buildTableArtifact(analysis),
      buildChartReportArtifact(analysis),
      buildSlidesArtifact(analysis),
    ],
    trace: buildTrace(intent, input.datasetId),
  };
}
