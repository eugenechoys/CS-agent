import type { Dataset, DatasetAnalysisResult } from "@/lib/schemas/bokchoys";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function isNumeric(val: string) {
  return val !== "" && !Number.isNaN(Number(val));
}

function detectNumericColumns(rows: Dataset["rows"], columns: string[]) {
  return columns.filter((col) =>
    rows.slice(0, Math.min(rows.length, 10)).every((row) => isNumeric(row[col] ?? "")),
  );
}

/* ─── Segmented analysis: group by a column, compute stats ─── */

type SegmentRow = Record<string, string | number>;

function segmentBy(rows: Dataset["rows"], groupCol: string, valueCol: string): SegmentRow[] {
  const groups = new Map<string, number[]>();
  for (const row of rows) {
    const key = row[groupCol] ?? "Unknown";
    const val = Number(row[valueCol] ?? 0);
    if (!Number.isNaN(val)) {
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(val);
    }
  }

  return [...groups.entries()]
    .map(([group, vals]) => ({
      [groupCol]: group,
      [`avg_${valueCol}`]: Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)),
      count: vals.length,
      [`min_${valueCol}`]: Math.min(...vals),
      [`max_${valueCol}`]: Math.max(...vals),
    }))
    .sort((a, b) => Number(b[`avg_${valueCol}`]) - Number(a[`avg_${valueCol}`]));
}

/* ─── Trend detection: look for patterns over time ─── */

function detectTrends(rows: Dataset["rows"], timeCol: string, valueCol: string): string[] {
  const sorted = [...rows].sort((a, b) => String(a[timeCol] ?? "").localeCompare(String(b[timeCol] ?? "")));
  if (sorted.length < 2) return [];

  const values = sorted.map((r) => ({ time: r[timeCol] ?? "", val: Number(r[valueCol] ?? 0) })).filter((v) => !Number.isNaN(v.val));
  if (values.length < 2) return [];

  const first = values[0];
  const last = values[values.length - 1];
  const diff = last.val - first.val;
  const pctChange = first.val !== 0 ? ((diff / first.val) * 100).toFixed(1) : "N/A";

  const findings: string[] = [];
  if (diff > 0) {
    findings.push(`${valueCol} increased from ${first.val} to ${last.val} (${pctChange}% change) between ${first.time} and ${last.time}.`);
  } else if (diff < 0) {
    findings.push(`${valueCol} declined from ${first.val} to ${last.val} (${pctChange}% change) between ${first.time} and ${last.time}.`);
  } else {
    findings.push(`${valueCol} stayed flat at ${first.val} between ${first.time} and ${last.time}.`);
  }

  return findings;
}

/* ─── Anomaly detection: find outliers ─── */

function detectAnomalies(rows: Dataset["rows"], columns: string[], numericCols: string[]): string[] {
  const anomalies: string[] = [];

  for (const col of numericCols.slice(0, 3)) {
    const vals = rows.map((r) => Number(r[col] ?? 0)).filter((v) => !Number.isNaN(v));
    if (vals.length < 3) continue;

    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const stdDev = Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length);
    if (stdDev === 0) continue;

    for (const row of rows) {
      const val = Number(row[col] ?? 0);
      if (Math.abs(val - mean) > 1.5 * stdDev) {
        const labelCol = columns.find((c) => !numericCols.includes(c));
        const label = labelCol ? row[labelCol] : "Row";
        anomalies.push(`${label}: ${col} = ${val} (average is ${mean.toFixed(1)}, this is ${val > mean ? "unusually high" : "unusually low"}).`);
        break; /* One anomaly per column is enough */
      }
    }
  }

  return anomalies;
}

/* ─── Cross-table join: link two datasets by a shared column ─── */

export function joinDatasets(
  left: Dataset,
  right: Dataset,
  joinCol: string,
): Dataset["rows"] {
  const rightIndex = new Map<string, Dataset["rows"][0]>();
  for (const row of right.rows) {
    const key = row[joinCol] ?? "";
    if (key && !rightIndex.has(key)) rightIndex.set(key, row);
  }

  return left.rows
    .filter((lr) => rightIndex.has(lr[joinCol] ?? ""))
    .map((lr) => ({
      ...lr,
      ...Object.fromEntries(
        Object.entries(rightIndex.get(lr[joinCol]!)!).filter(([k]) => !left.columns.includes(k)),
      ),
    }));
}

/* ─── Funnel analysis: enrollment → participation → completion ─── */

function buildFunnel(allDatasets: Dataset[]): SegmentRow[] | null {
  const programs = allDatasets.find((d) => d.name === "Programs");
  const participation = allDatasets.find((d) => d.name === "Program Participation");
  if (!programs || !participation) return null;

  return programs.rows
    .filter((p) => p.status === "completed" || p.status === "active")
    .map((p) => {
      const enrolled = Number(p.total_enrolled ?? 0);
      const activities = participation.rows.filter((r) => r.program_id === p.program_id);
      const participants = new Set(activities.map((a) => a.employee_id)).size;
      const completed = activities.filter((a) => a.completed === "yes").length;
      return {
        program: p.name ?? "",
        enrolled,
        participated: participants,
        activities_completed: completed,
        completion_rate: `${p.completion_rate}%`,
      };
    });
}

/* ─── Main analysis function ─── */

export function analyzeDataset(input: {
  dataset: Dataset;
  query?: string;
  allDatasets?: Dataset[];
}): DatasetAnalysisResult {
  const { dataset, allDatasets } = input;
  const numericCols = detectNumericColumns(dataset.rows, dataset.columns);

  /* Smart segmentation: find best categorical + numeric column combo */
  const categoricalCols = dataset.columns.filter((c) => !numericCols.includes(c));
  const bestGroupCol = categoricalCols.find((c) =>
    ["department", "team", "program_name", "channel", "feature", "quarter", "phase", "status", "game_type", "question_type"].includes(c),
  ) ?? categoricalCols[0];
  const bestValueCol = numericCols.find((c) =>
    ["satisfaction_score", "engagement_score", "participation_rate", "mood_score", "score", "avg_open_rate", "eNPS", "completion_rate", "avg_satisfaction", "time_spent_seconds", "activities_completed"].includes(c),
  ) ?? numericCols[0];

  /* Build metric rows with segmentation */
  let metricRows: SegmentRow[] = [];

  if (bestGroupCol && bestValueCol) {
    metricRows = segmentBy(dataset.rows, bestGroupCol, bestValueCol);
  } else {
    /* Fallback: simple averages */
    metricRows = numericCols.slice(0, 6).map((col) => {
      const vals = dataset.rows.map((r) => Number(r[col] ?? 0)).filter((v) => !Number.isNaN(v));
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { metric: `${col} average`, value: Number(avg.toFixed(2)) };
    });
  }

  /* Key findings */
  const keyFindings: string[] = [];
  keyFindings.push(`Dataset: ${dataset.name} — ${dataset.rows.length} rows, ${dataset.columns.length} columns.`);

  if (numericCols.length > 0) {
    keyFindings.push(`Numeric columns: ${numericCols.join(", ")}.`);
  }

  /* Trend detection */
  const timeCol = dataset.columns.find((c) => ["quarter", "date", "week", "month", "send_date", "submitted_at"].includes(c));
  if (timeCol && bestValueCol) {
    const trends = detectTrends(dataset.rows, timeCol, bestValueCol);
    keyFindings.push(...trends);
  }

  /* Anomaly detection */
  const anomalies = detectAnomalies(dataset.rows, dataset.columns, numericCols);
  if (anomalies.length > 0) {
    keyFindings.push(`Anomaly detected: ${anomalies[0]}`);
  }

  /* Segmentation insight */
  if (metricRows.length >= 2 && bestGroupCol && bestValueCol) {
    const top = metricRows[0];
    const bottom = metricRows[metricRows.length - 1];
    keyFindings.push(
      `Highest ${bestValueCol}: ${top[bestGroupCol]} (${top[`avg_${bestValueCol}`]}). Lowest: ${bottom[bestGroupCol]} (${bottom[`avg_${bestValueCol}`]}).`,
    );
  }

  /* Funnel insight if we have program data */
  if (allDatasets) {
    const funnel = buildFunnel(allDatasets);
    if (funnel && funnel.length > 0) {
      const best = funnel.sort((a, b) => Number(String(b.completion_rate).replace("%", "")) - Number(String(a.completion_rate).replace("%", "")))[0];
      keyFindings.push(`Best performing program: ${best.program} with ${best.completion_rate} completion rate.`);
    }
  }

  /* Summary */
  const summary = keyFindings.length > 2
    ? `${dataset.name}: ${keyFindings[1]} ${keyFindings[2]}`
    : `Analysis of ${dataset.name} with ${dataset.rows.length} rows across ${dataset.columns.length} columns.`;

  return {
    id: createId("analysis"),
    datasetId: dataset.id,
    summary,
    rowCount: dataset.rows.length,
    columnCount: dataset.columns.length,
    keyFindings,
    metricRows,
  };
}
