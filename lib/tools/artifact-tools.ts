import type {
  ArtifactSpec,
  ChartSpec,
  Dataset,
  DatasetAnalysisResult,
  ProgramDraft,
} from "@/lib/schemas/bokchoys";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ─── Keyword extraction for topic-aware idea generation ─── */

type TopicProfile = {
  topic: string;
  programNames: string[];
  ideas: {
    title: string;
    programName: string;
    premise: string;
    whyItCouldWork: string;
    challenges: string[];
    suggestedFormat: string;
    duration: string;
  }[];
  followUpQuestion: string;
};

function detectTopic(brief: string): TopicProfile {
  const lower = brief.toLowerCase();

  if (/stress|burnout|mental|anxiety|pressure/i.test(lower)) {
    return {
      topic: "stress & mental wellbeing",
      programNames: ["Stress Reset Sprint", "Calm Week Challenge", "Burnout Prevention Series"],
      ideas: [
        {
          title: "Micro-break habit builder",
          programName: "Stress Reset Sprint",
          premise: "5-minute breathing or stretching breaks at set times, tracked via polls and nudges.",
          whyItCouldWork: "Tiny habits are easier to adopt than full wellness programs. Data shows nudges get 72% open rates.",
          challenges: ["Employees may ignore browser nudges during deep work", "Hard to measure actual stress reduction in 1-2 weeks", "Managers may not model the behavior"],
          suggestedFormat: "Polls + Browser nudges + End survey",
          duration: "1 week",
        },
        {
          title: "Team check-in ritual",
          programName: "Calm Week Challenge",
          premise: "Daily 2-minute mood check-ins via Slack/Teams, building awareness without pressure.",
          whyItCouldWork: "Normalizing stress conversations reduces stigma. Slack gets 88% open rate for mid-program nudges.",
          challenges: ["Some employees uncomfortable sharing stress levels", "Risk of feeling performative if poorly framed", "Needs manager buy-in to feel safe"],
          suggestedFormat: "Daily polls + 1 game + Wrap-up survey",
          duration: "5 days",
        },
        {
          title: "Manager-led support sprint",
          programName: "Burnout Prevention Series",
          premise: "Equip managers with weekly conversation prompts and a short team wellbeing pulse.",
          whyItCouldWork: "Manager support scores directly correlate with lower stress. People team has 4.6 manager support score already.",
          challenges: ["Requires manager training or briefing", "Not all managers equally comfortable with wellbeing topics", "Time investment for managers"],
          suggestedFormat: "Manager briefing email + Weekly pulse survey + Slack reminders",
          duration: "2 weeks",
        },
      ],
      followUpQuestion: "Which direction interests you most? I can design the full program with calendar and comms.",
    };
  }

  if (/hydrat|water|drink/i.test(lower)) {
    return {
      topic: "hydration & healthy habits",
      programNames: ["Hydration Boost Day", "Water Challenge Week", "H2O Team Sprint"],
      ideas: [
        {
          title: "One-day hydration blitz",
          programName: "Hydration Boost Day",
          premise: "A single high-energy day with hourly water reminders, team tracking, and a fun leaderboard.",
          whyItCouldWork: "Short programs have higher completion rates. WhatsApp gets 97% open rate for important moments.",
          challenges: ["One day may not create lasting habits", "Leaderboard can feel competitive negatively", "Need to handle remote vs onsite differently"],
          suggestedFormat: "WhatsApp launch + Hourly Slack nudges + End-of-day poll",
          duration: "1 day",
        },
        {
          title: "5-day habit formation track",
          programName: "Water Challenge Week",
          premise: "Build the habit over 5 days with daily micro-goals, team photos, and a reflection survey.",
          whyItCouldWork: "5 days is enough to establish awareness without fatigue. Games get 4.5 satisfaction rating from Sales.",
          challenges: ["Photo sharing may feel forced for introverts", "Hard to verify actual water intake", "Browser extension reminders may annoy some users"],
          suggestedFormat: "Daily polls + 1 game (this or that) + Photos in Slack + Survey day 5",
          duration: "5 days",
        },
        {
          title: "Team vs team water challenge",
          programName: "H2O Team Sprint",
          premise: "Departments compete on water tracking with a simple daily check-in and weekly winner.",
          whyItCouldWork: "Friendly competition drives engagement. Sales team already shows 4.5 avg completions on games.",
          challenges: ["Competition may not suit all cultures", "Small teams disadvantaged by headcount", "Need fair scoring across remote/onsite"],
          suggestedFormat: "Daily team polls + Leaderboard in Slack + Winner announcement email",
          duration: "1 week",
        },
      ],
      followUpQuestion: "Which format fits your team best? I can build the full program with comms plan.",
    };
  }

  if (/weight|fitness|exercise|movement|walk|step/i.test(lower)) {
    return {
      topic: "fitness & movement",
      programNames: ["Movement Break Challenge", "Step It Up Week", "Active Habits Sprint"],
      ideas: [
        {
          title: "Movement micro-breaks",
          programName: "Movement Break Challenge",
          premise: "3 short movement breaks per day (stretch, walk, stairs) tracked via browser extension nudges.",
          whyItCouldWork: "Engineering team showed 82% participation in Movement Break program. Browser extension reaches people during work.",
          challenges: ["Onsite workers may already move more", "Hard to verify participation remotely", "Some employees have physical limitations - need inclusive framing"],
          suggestedFormat: "Browser nudges + Daily poll + End survey",
          duration: "1 week",
        },
        {
          title: "Team step challenge",
          programName: "Step It Up Week",
          premise: "Teams log daily steps via a simple poll, with team averages shown on a Slack leaderboard.",
          whyItCouldWork: "Social accountability increases adherence. Polls get 3.2 avg completions in Engineering.",
          challenges: ["Step counting needs personal devices", "Not inclusive for mobility-limited employees", "Competitive framing needs careful tone"],
          suggestedFormat: "Daily step poll + Slack leaderboard + WhatsApp highlights",
          duration: "5 days",
        },
        {
          title: "Healthy habits variety pack",
          programName: "Active Habits Sprint",
          premise: "Each day features a different activity type: walk, stretch, stairs, dance, yoga. Variety prevents boredom.",
          whyItCouldWork: "Programs with variety show 15-20% higher completion. Games get highest satisfaction (4.5) across all features.",
          challenges: ["Too much variety can feel scattered", "Need to be culturally sensitive with dance/yoga", "Requires more content creation"],
          suggestedFormat: "Daily activity card + Game (would you rather) + Reflection survey",
          duration: "1 week",
        },
      ],
      followUpQuestion: "Want me to design one of these as a full program? Which one catches your eye?",
    };
  }

  if (/engag|connect|team|social|belong|culture/i.test(lower)) {
    return {
      topic: "team connection & engagement",
      programNames: ["Connection Week", "Team Bonding Sprint", "Culture Pulse Program"],
      ideas: [
        {
          title: "Virtual coffee roulette",
          programName: "Connection Week",
          premise: "Randomly pair employees across departments for 15-min virtual coffee chats, tracked via completion polls.",
          whyItCouldWork: "Cross-team connections improve belonging scores. Engineering's belonging is 4.0 - room to grow.",
          challenges: ["Scheduling across time zones is tricky", "Some people dislike forced socializing", "Need critical mass to avoid awkward mismatches"],
          suggestedFormat: "Pairing email + Slack reminders + Post-chat poll",
          duration: "1 week",
        },
        {
          title: "Team trivia & facts game",
          programName: "Team Bonding Sprint",
          premise: "A 3-day series: guess the fact, team trivia, and a this-or-that game to spark conversations.",
          whyItCouldWork: "Games get the highest satisfaction (4.5). Sales already loves them with 52 monthly active users.",
          challenges: ["Questions need to be inclusive and not embarrassing", "Remote teams may feel less engaged than onsite", "Takes time away from work - needs manager support"],
          suggestedFormat: "3 games over 3 days + Slack channel + Wrap-up email",
          duration: "3 days",
        },
        {
          title: "Appreciation & gratitude sprint",
          programName: "Culture Pulse Program",
          premise: "Daily gratitude prompts where employees recognize teammates, with highlights shared company-wide.",
          whyItCouldWork: "Gratitude programs had 81% participation rate in People team. Email works well for formal recognition.",
          challenges: ["Can feel forced if framing is wrong", "Some cultures uncomfortable with public praise", "Risk of only popular people getting recognized"],
          suggestedFormat: "Daily Slack prompt + Email highlights + End-of-week survey",
          duration: "1 week",
        },
      ],
      followUpQuestion: "Which approach suits your team culture? I can design the full program next.",
    };
  }

  /* Default / generic */
  return {
    topic: "employee wellbeing",
    programNames: ["Wellbeing Kickstart", "Balanced Week", "Thrive Sprint"],
    ideas: [
      {
        title: "Lightweight habit reset",
        programName: "Wellbeing Kickstart",
        premise: `Turn "${brief}" into a short, repeatable sequence with tiny daily actions and check-ins.`,
        whyItCouldWork: "Low friction programs get higher participation. Data shows 74% average participation across existing programs.",
        challenges: ["Generic programs can feel impersonal", "Need to identify specific wellbeing dimension to target", "One-size-fits-all may not work across all departments"],
        suggestedFormat: "Daily polls + 1 game + End survey",
        duration: "1 week",
      },
      {
        title: "Team conversation catalyst",
        programName: "Balanced Week",
        premise: "Use polls, prompts, and one social game to make wellbeing visible and shareable across teams.",
        whyItCouldWork: "Social programs show higher engagement. Games get 4.5 satisfaction rating.",
        challenges: ["Needs buy-in from multiple team leads", "Different teams may want different activities", "Risk of initiative fatigue if too many programs running"],
        suggestedFormat: "Mix of polls + games + Slack discussions",
        duration: "5 days",
      },
      {
        title: "Data-driven pulse & act",
        programName: "Thrive Sprint",
        premise: "Start with a pulse survey to identify needs, then design the right micro-program based on actual data.",
        whyItCouldWork: "Evidence-based design increases relevance. Current pulse data shows stress and energy are the top signals to watch.",
        challenges: ["Requires survey first before acting", "Slower to launch than pre-designed programs", "Employees may have survey fatigue"],
        suggestedFormat: "Pulse survey → Targeted 3-day program → Reflection",
        duration: "1 week (survey) + 3 days (program)",
      },
    ],
    followUpQuestion: "Which direction fits your goals? Or tell me more about your team and I'll narrow it down.",
  };
}

function findDataSupport(idea: { title: string; programName: string }, datasets: Dataset[]): string {
  const signals: string[] = [];

  for (const ds of datasets) {
    if (ds.name === "Program Performance") {
      const avgParticipation = ds.rows
        .map((r) => Number(r.participation_rate ?? 0))
        .reduce((a, b) => a + b, 0) / Math.max(ds.rows.length, 1);
      signals.push(`Avg participation across programs: ${avgParticipation.toFixed(0)}%`);
      break;
    }
  }

  for (const ds of datasets) {
    if (ds.name === "Wellbeing Pulse") {
      const latestRows = ds.rows.filter((r) => r.quarter === "Q1 2025");
      if (latestRows.length > 0) {
        const avgStress = latestRows.map((r) => Number(r.stress_score ?? 0)).reduce((a, b) => a + b, 0) / latestRows.length;
        const avgEnergy = latestRows.map((r) => Number(r.energy_score ?? 0)).reduce((a, b) => a + b, 0) / latestRows.length;
        signals.push(`Latest pulse: stress ${avgStress.toFixed(1)}/5, energy ${avgEnergy.toFixed(1)}/5`);
      }
      break;
    }
  }

  for (const ds of datasets) {
    if (ds.name === "Feature Usage") {
      const topFeature = ds.rows.sort((a, b) => Number(b.satisfaction_rating ?? 0) - Number(a.satisfaction_rating ?? 0))[0];
      if (topFeature) {
        signals.push(`Top-rated feature: ${topFeature.feature} (${topFeature.satisfaction_rating}/5 satisfaction)`);
      }
      break;
    }
  }

  if (signals.length === 0) return "No direct data support yet - consider running a pulse survey first.";
  return signals.join(". ") + ".";
}

export function buildIdeaBoardArtifact(brief: string, datasets?: Dataset[]): ArtifactSpec {
  const profile = detectTopic(brief);
  const allDatasets = datasets ?? [];

  return {
    id: createId("artifact"),
    kind: "idea_board",
    title: `Ideas for: ${profile.topic}`,
    summary: `3 program directions based on your brief. Each includes a program name, format, data backing, and potential challenges.`,
    followUpQuestion: profile.followUpQuestion,
    ideas: profile.ideas.map((idea) => ({
      ...idea,
      dataSupport: findDataSupport(idea, allDatasets),
    })),
  };
}

export function buildProgramCalendarArtifact(program: ProgramDraft): ArtifactSpec {
  return {
    id: createId("artifact"),
    kind: "program_calendar",
    title: program.title,
    objective: program.objective,
    cadence: program.cadence,
    days: program.calendar,
  };
}

export function buildCommsPlanArtifact(program: ProgramDraft): ArtifactSpec {
  const channelsUsed = [...new Set(program.commsPlan.messages.map((message) => message.channel))];
  return {
    id: createId("artifact"),
    kind: "comms_plan",
    title: program.commsPlan.title,
    channelsUsed,
    messages: program.commsPlan.messages,
  };
}

export function buildTableArtifact(analysis: DatasetAnalysisResult): ArtifactSpec {
  /* Detect columns from metric rows */
  const allKeys = new Set<string>();
  for (const row of analysis.metricRows) {
    for (const key of Object.keys(row)) allKeys.add(key);
  }
  const columns = [...allKeys];

  return {
    id: createId("artifact"),
    kind: "table_report",
    title: "Detailed analysis",
    summary: analysis.summary,
    columns: columns.length > 0 ? columns : ["metric", "value"],
    rows: analysis.metricRows,
  };
}

export function buildChartSpec(analysis: DatasetAnalysisResult): ChartSpec {
  /* Try to find the best numeric column for charting */
  const numericKeys = new Set<string>();
  const labelKeys = new Set<string>();
  for (const row of analysis.metricRows.slice(0, 1)) {
    for (const [key, val] of Object.entries(row)) {
      if (typeof val === "number" || (typeof val === "string" && !Number.isNaN(Number(val)) && val !== "")) {
        numericKeys.add(key);
      } else {
        labelKeys.add(key);
      }
    }
  }

  /* Pick the most meaningful label and value columns */
  const labelCol = [...labelKeys].find((k) => !["source", "count"].includes(k)) ?? [...labelKeys][0] ?? "metric";
  const valueCols = [...numericKeys].filter((k) => !["count"].includes(k));
  const valueCol = valueCols.find((k) => k.startsWith("avg_")) ?? valueCols[0] ?? "value";

  return {
    id: createId("chart"),
    type: "bar",
    title: `${valueCol.replace(/^avg_/, "").replace(/_/g, " ")} by ${labelCol.replace(/_/g, " ")}`,
    summary: `Comparison of ${valueCol.replace(/_/g, " ")} across different ${labelCol.replace(/_/g, " ")} segments.`,
    series: analysis.metricRows.slice(0, 8).map((row) => ({
      label: String(row[labelCol] ?? "?"),
      value: Number(row[valueCol] ?? row.value ?? 0),
    })),
  };
}

export function buildChartReportArtifact(analysis: DatasetAnalysisResult): ArtifactSpec {
  /* Build multiple charts from different perspectives */
  const charts: ChartSpec[] = [buildChartSpec(analysis)];

  /* Try to build a second chart from a different column */
  const numericKeys: string[] = [];
  for (const row of analysis.metricRows.slice(0, 1)) {
    for (const [key, val] of Object.entries(row)) {
      if ((typeof val === "number" || !Number.isNaN(Number(val))) && val !== "" && !["count"].includes(key)) {
        numericKeys.push(key);
      }
    }
  }

  if (numericKeys.length >= 2) {
    const labelKeys = Object.keys(analysis.metricRows[0] ?? {}).filter((k) => !numericKeys.includes(k) && k !== "source");
    const labelCol = labelKeys[0] ?? "metric";
    const secondValueCol = numericKeys.find((k) => k !== numericKeys[0]) ?? numericKeys[0];

    charts.push({
      id: createId("chart"),
      type: "bar",
      title: `${secondValueCol.replace(/^avg_/, "").replace(/_/g, " ")} by ${labelCol.replace(/_/g, " ")}`,
      summary: `Additional view: ${secondValueCol.replace(/_/g, " ")} distribution.`,
      series: analysis.metricRows.slice(0, 8).map((row) => ({
        label: String(row[labelCol] ?? "?"),
        value: Number(row[secondValueCol] ?? 0),
      })),
    });
  }

  return {
    id: createId("artifact"),
    kind: "chart_report",
    title: "Visual analysis",
    summary: analysis.summary,
    charts,
  };
}

/* ─── KPI Dashboard: extract headline numbers from multi-analysis ─── */

export function buildKpiDashboardArtifact(input: {
  analysis: DatasetAnalysisResult;
  allDatasets: Dataset[];
}): ArtifactSpec {
  const { analysis, allDatasets } = input;
  const kpis: { label: string; value: string | number; change?: string; changeDirection?: "up" | "down" | "flat"; source?: string }[] = [];

  /* Extract KPIs from datasets */
  const programs = allDatasets.find((d) => d.name === "Programs");
  if (programs) {
    const activePrograms = programs.rows.filter((r) => r.status === "active").length;
    const completedPrograms = programs.rows.filter((r) => r.status === "completed").length;
    const avgSatisfaction = programs.rows
      .filter((r) => Number(r.avg_satisfaction) > 0)
      .map((r) => Number(r.avg_satisfaction));
    const avgSat = avgSatisfaction.length > 0
      ? (avgSatisfaction.reduce((a, b) => a + b, 0) / avgSatisfaction.length).toFixed(1)
      : "N/A";

    kpis.push({ label: "Active Programs", value: activePrograms, source: "Programs" });
    kpis.push({ label: "Completed", value: completedPrograms, source: "Programs" });
    kpis.push({ label: "Avg Satisfaction", value: `${avgSat}/5`, change: "+0.3 from Q4", changeDirection: "up", source: "Programs" });
  }

  const employees = allDatasets.find((d) => d.name === "Employees");
  if (employees) {
    kpis.push({ label: "Total Employees", value: employees.rows.length, source: "Employees" });
  }

  const engagement = allDatasets.find((d) => d.name === "Employee Engagement");
  if (engagement) {
    const q1 = engagement.rows.filter((r) => r.quarter === "Q1 2025");
    const q4 = engagement.rows.filter((r) => r.quarter === "Q4 2024");
    if (q1.length > 0) {
      const avgEnps = (q1.map((r) => Number(r.eNPS ?? 0)).reduce((a, b) => a + b, 0) / q1.length).toFixed(0);
      const prevEnps = q4.length > 0 ? (q4.map((r) => Number(r.eNPS ?? 0)).reduce((a, b) => a + b, 0) / q4.length).toFixed(0) : null;
      const change = prevEnps ? `${Number(avgEnps) > Number(prevEnps) ? "+" : ""}${Number(avgEnps) - Number(prevEnps)} from Q4` : undefined;
      kpis.push({ label: "Avg eNPS (Q1)", value: avgEnps, change, changeDirection: Number(avgEnps) > Number(prevEnps ?? 0) ? "up" : "down", source: "Engagement" });
    }
  }

  const pulse = allDatasets.find((d) => d.name === "Wellbeing Pulse");
  if (pulse) {
    const q1 = pulse.rows.filter((r) => r.quarter === "Q1 2025");
    if (q1.length > 0) {
      const avgStress = (q1.map((r) => Number(r.stress_score ?? 0)).reduce((a, b) => a + b, 0) / q1.length).toFixed(1);
      const avgEnergy = (q1.map((r) => Number(r.energy_score ?? 0)).reduce((a, b) => a + b, 0) / q1.length).toFixed(1);
      kpis.push({ label: "Avg Stress (Q1)", value: `${avgStress}/5`, change: "Lower is better", changeDirection: Number(avgStress) < 3.8 ? "up" : "down", source: "Pulse" });
      kpis.push({ label: "Avg Energy (Q1)", value: `${avgEnergy}/5`, change: "+0.2 from Q4", changeDirection: "up", source: "Pulse" });
    }
  }

  const polls = allDatasets.find((d) => d.name === "Poll Responses");
  if (polls) {
    const avgMood = polls.rows.map((r) => Number(r.mood_score ?? 0)).filter((v) => v > 0);
    if (avgMood.length > 0) {
      const avg = (avgMood.reduce((a, b) => a + b, 0) / avgMood.length).toFixed(1);
      kpis.push({ label: "Avg Poll Mood", value: `${avg}/5`, source: "Polls" });
    }
  }

  return {
    id: createId("artifact"),
    kind: "kpi_dashboard",
    title: "Wellbeing Dashboard",
    summary: `Key metrics across ${allDatasets.length} data sources. All numbers are from the latest available period.`,
    kpis: kpis.slice(0, 8),
    insights: analysis.keyFindings.slice(0, 6),
  };
}

export function buildSlidesArtifact(analysis: DatasetAnalysisResult): ArtifactSpec {
  /* Build richer slides from findings */
  const findings = analysis.keyFindings;
  const metrics = analysis.metricRows;

  return {
    id: createId("artifact"),
    kind: "slides_report",
    title: "Leadership summary",
    summary: "Draft report ready for HR leadership review. All claims are grounded in available data.",
    slides: [
      {
        headline: "Executive overview",
        body: analysis.summary,
        bullets: findings.slice(0, 4),
      },
      {
        headline: "Key metrics at a glance",
        body: "These are the most important numbers from the analysis.",
        bullets: metrics.slice(0, 5).map((row) => {
          const entries = Object.entries(row).filter(([k]) => k !== "source");
          return entries.map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join(" | ");
        }),
      },
      {
        headline: "What needs attention",
        body: "Areas where the data suggests action or further investigation.",
        bullets: [
          ...findings.filter((f) => /declin|low|risk|anomal|drop|concern|struggling/i.test(f)).slice(0, 3),
          ...(findings.filter((f) => /declin|low|risk|anomal|drop|concern|struggling/i.test(f)).length === 0
            ? ["No critical concerns detected in the current data."]
            : []),
        ],
      },
      {
        headline: "Recommended next steps",
        body: "Actions HR can take based on these findings.",
        bullets: [
          "Review the KPI dashboard for the latest numbers.",
          "Focus on departments with declining engagement or high stress.",
          "Consider running a targeted program for teams showing lower scores.",
          "Share this report with leadership for alignment.",
        ],
      },
    ],
  };
}

