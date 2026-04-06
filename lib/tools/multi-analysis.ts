import type { Dataset, DatasetAnalysisResult } from "@/lib/schemas/bokchoys";
import { analyzeDataset } from "@/lib/tools/analysis-tools";

/**
 * Score how relevant a dataset is to a user query.
 * Returns 0-100. Higher = more relevant.
 */
function scoreRelevance(dataset: Dataset, query: string): number {
  const lower = query.toLowerCase();
  let score = 0;

  /* Match dataset name */
  const nameParts = dataset.name.toLowerCase().split(/[\s_-]+/);
  for (const part of nameParts) {
    if (part.length > 2 && lower.includes(part)) score += 30;
  }

  /* Match column names */
  for (const col of dataset.columns) {
    const colParts = col.toLowerCase().split(/[\s_-]+/);
    for (const part of colParts) {
      if (part.length > 2 && lower.includes(part)) score += 10;
    }
  }

  /* Domain keyword associations */
  const keywordMap: Record<string, string[]> = {
    employees: ["employee", "team", "department", "role", "location", "tenure", "headcount", "people", "staff", "who", "directory"],
    programs: ["program", "active", "completed", "draft", "launch", "duration", "enrolled", "status"],
    "program-participation": ["participation", "daily", "activity", "completed", "join", "attend", "streak"],
    "poll-responses": ["poll", "mood", "feeling", "pulse", "vote", "option"],
    "survey-responses": ["survey", "response", "feedback", "answer", "open text", "question", "likert", "reflection"],
    "game-sessions": ["game", "score", "play", "trivia", "challenge", "tap", "would you rather", "this or that"],
    "daily-activity": ["daily", "active", "streak", "nudge", "time spent", "minute"],
    "comms-sent": ["comms", "communication", "message", "sent", "open rate", "click"],
    "channel-effectiveness": ["channel", "effectiveness", "open rate", "click rate"],
    "employee-engagement": ["engagement", "satisfaction", "motivation", "retention", "enps", "quarter", "risk"],
    "feature-usage": ["feature", "usage", "active user", "completion", "browser extension"],
    "wellbeing-pulse": ["pulse", "stress", "energy", "belonging", "manager", "support", "wellbeing", "concern"],
  };

  const sourceKey = dataset.name.toLowerCase().replace(/\s+/g, "-");
  const keywords = keywordMap[sourceKey] ?? [];
  for (const kw of keywords) {
    if (lower.includes(kw)) score += 15;
  }

  /* BROAD queries should hit ALL datasets */
  if (/\b(everything|all|summary|summarize|overview|overall|full|complete|tell us|tell me|insight|what do|how are we|dashboard)\b/i.test(query)) {
    score += 25;
  }

  /* "wellbeing" and "data" are very broad - should hit multiple datasets */
  if (/\b(wellbeing|wellness|health|data)\b/i.test(query)) {
    score += 15;
  }

  return Math.min(score, 100);
}

export type MultiAnalysisResult = {
  selectedDatasets: { name: string; relevanceScore: number; analysis: DatasetAnalysisResult }[];
  combinedFindings: string[];
  combinedMetricRows: Record<string, string | number>[];
  overallSummary: string;
};

/**
 * Analyze multiple datasets based on a query.
 */
export function analyzeMultipleDatasets(input: {
  allDatasets: Dataset[];
  query: string;
  minRelevance?: number;
}): MultiAnalysisResult {
  const { allDatasets, query, minRelevance = 8 } = input;

  /* Score and sort by relevance */
  const scored = allDatasets
    .map((ds) => ({ dataset: ds, score: scoreRelevance(ds, query) }))
    .sort((a, b) => b.score - a.score);

  /* For broad queries, take top 6. For specific, take those above threshold */
  const isBroad = /\b(everything|all|summary|summarize|overview|overall|full|complete|tell us|tell me|insight|what do|how are we|dashboard|wellbeing|data)\b/i.test(query);
  const selected = isBroad
    ? scored.slice(0, 6)
    : scored.filter((s) => s.score >= minRelevance).slice(0, 5);

  /* If nothing matched, take top 4 anyway */
  const finalSelection = selected.length > 0 ? selected : scored.slice(0, 4);

  /* Run analysis on each */
  const results = finalSelection.map((s) => ({
    name: s.dataset.name,
    relevanceScore: s.score,
    analysis: analyzeDataset({ dataset: s.dataset, query, allDatasets }),
  }));

  /* Combine findings - deduplicated and richer */
  const combinedFindings: string[] = [];
  for (const r of results) {
    for (const finding of r.analysis.keyFindings.slice(0, 3)) {
      combinedFindings.push(`[${r.name}] ${finding}`);
    }
  }

  /* Combine metric rows with source label */
  const combinedMetricRows: Record<string, string | number>[] = [];
  for (const r of results) {
    for (const row of r.analysis.metricRows.slice(0, 5)) {
      combinedMetricRows.push({ source: r.name, ...row });
    }
  }

  const datasetNames = results.map((r) => r.name).join(", ");
  const overallSummary = `Cross-dataset analysis of ${results.length} table${results.length === 1 ? "" : "s"}: ${datasetNames}. ${combinedFindings.length} insights extracted across ${combinedMetricRows.length} metrics.`;

  return { selectedDatasets: results, combinedFindings, combinedMetricRows, overallSummary };
}
