import { decideChannel, explainChannel } from "@/lib/policies/channel-policy";
import type { CommsPlan, MessageDraft, ProgramDraft } from "@/lib/schemas/bokchoys";
import { chooseGameTemplate, pollTemplates, surveyTemplates } from "@/lib/tools/templates";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateProgramOutline(input: {
  brief: string;
  cadence?: string;
  targetAudience?: string;
}): Pick<ProgramDraft, "title" | "objective" | "targetAudience" | "cadence"> {
  const brief = input.brief.trim();
  const title = brief.length > 72 ? `${brief.slice(0, 69)}...` : brief;

  return {
    title: title || "Wellbeing program draft",
    objective:
      "Increase meaningful participation through a simple, psychologically safe engagement sequence that balances reflection, action, and follow-through.",
    targetAudience: input.targetAudience ?? "Employees",
    cadence: input.cadence ?? "2 weeks",
  };
}

export function buildPollDraft(topic: string) {
  return {
    id: createId("poll"),
    type: "poll" as const,
    title: `Poll: ${pollTemplates[0]}`,
    description: `Quick poll to capture reaction on ${topic}.`,
    template: pollTemplates[0],
    recommendedDay: "Day 1",
    pollQuestions: [
      {
        question: "How are you feeling right now?",
        options: [
          { label: "Great, full of energy", emoji: "🟢" },
          { label: "Okay, could be better", emoji: "🟡" },
          { label: "Running low today", emoji: "🟠" },
          { label: "Struggling a bit", emoji: "🔴" },
        ],
      },
      {
        question: "What would help you most this week?",
        options: [
          { label: "A short break activity", emoji: "☕" },
          { label: "Team social time", emoji: "👋" },
          { label: "Quiet focus time", emoji: "🎧" },
          { label: "Movement or exercise", emoji: "🏃" },
        ],
      },
    ],
  };
}

export function buildSurveyDraft(topic: string) {
  return {
    id: createId("survey"),
    type: "survey" as const,
    title: `Survey: ${surveyTemplates[0]}`,
    description: `Short survey to collect a richer read on ${topic}.`,
    template: surveyTemplates[0],
    recommendedDay: "Day 5",
    surveyQuestions: [
      {
        question: "How supported do you feel by your team this week?",
        type: "likert" as const,
        options: ["1 - Not at all", "2 - Slightly", "3 - Somewhat", "4 - Quite a lot", "5 - Very much"],
      },
      {
        question: "Which part of the program did you find most helpful?",
        type: "multiple_choice" as const,
        options: ["The daily polls", "The team game", "The nudge reminders", "The reflection prompts", "None of the above"],
      },
      {
        question: "What would make this program better for you?",
        type: "open_text" as const,
      },
    ],
  };
}

export function buildGameDraft(topic: string) {
  const template = chooseGameTemplate(topic);
  return {
    id: createId("game"),
    type: "game" as const,
    title: `Game: ${template.replaceAll("_", " ")}`,
    description: `Low-friction engagement game tailored for ${topic}.`,
    template,
    recommendedDay: "Day 3",
  };
}

export function generateMessageSequence(input: {
  title: string;
  objective: string;
  cadence: string;
}): MessageDraft[] {
  const seeds = [
    {
      phase: "before" as const,
      purpose: "launch and survey invite",
      importance: "high" as const,
      sendOffset: "3 days before start",
      draftCopy: `We are about to launch ${input.title}. Expect a short kickoff and a quick pulse survey so we can shape the experience well.`,
    },
    {
      phase: "before" as const,
      purpose: "expectation setting reminder",
      importance: "medium" as const,
      sendOffset: "1 day before start",
      draftCopy: `Tomorrow we begin ${input.title}. The goal is simple: ${input.objective}`,
    },
    {
      phase: "during" as const,
      purpose: "mid-program nudge",
      importance: "medium" as const,
      sendOffset: "midpoint",
      draftCopy: `Quick reminder: ${input.title} is underway. Join today’s lightweight activity and keep momentum moving.`,
    },
    {
      phase: "during" as const,
      purpose: "participation reminder",
      importance: "low" as const,
      sendOffset: "two-thirds through",
      draftCopy: `There is still time to participate in ${input.title}. A short interaction today still counts.`,
    },
    {
      phase: "after" as const,
      purpose: "wrap-up summary",
      importance: "medium" as const,
      sendOffset: "1 day after end",
      draftCopy: `Thanks for joining ${input.title}. We will share a short wrap-up and capture reflections for the next cycle.`,
    },
  ];

  return seeds.map((seed) => {
    const channel = decideChannel({
      purpose: seed.purpose,
      importance: seed.importance,
      phase: seed.phase,
    });

    return {
      id: createId("message"),
      phase: seed.phase,
      channel,
      sendOffset: seed.sendOffset,
      purpose: seed.purpose,
      importance: seed.importance,
      draftCopy: seed.draftCopy,
      rationale: explainChannel(channel),
      editableByHr: true,
    };
  });
}

export function generateCommsPlan(input: {
  title: string;
  objective: string;
  cadence: string;
}): CommsPlan {
  return {
    id: createId("comms"),
    title: `${input.title} communications plan`,
    status: "draft",
    messages: generateMessageSequence(input),
  };
}

export function generateProgramCalendar(input: {
  brief: string;
  cadence?: string;
  targetAudience?: string;
}): ProgramDraft {
  const outline = generateProgramOutline(input);
  const poll = buildPollDraft(outline.title);
  const survey = buildSurveyDraft(outline.title);
  const game = buildGameDraft(outline.title);
  const commsPlan = generateCommsPlan(outline);

  const calendar = [
    {
      dayLabel: "Day 1",
      theme: "Kickoff",
      focus: "Open with a quick pulse and set tone.",
      activities: [poll],
    },
    {
      dayLabel: "Day 3",
      theme: "Energy",
      focus: "Create lightweight novelty and social participation.",
      activities: [game],
    },
    {
      dayLabel: "Day 5",
      theme: "Reflection",
      focus: "Collect richer feedback and surface friction.",
      activities: [survey],
    },
  ];

  return {
    id: createId("program"),
    title: outline.title,
    objective: outline.objective,
    targetAudience: outline.targetAudience,
    cadence: outline.cadence,
    status: "draft",
    calendar,
    engagementItems: [poll, survey, game],
    commsPlan,
  };
}

