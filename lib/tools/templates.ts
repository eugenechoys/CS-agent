export const pollTemplates = [
  "Mood check pulse",
  "This or that habit",
  "Energy checkpoint",
];

export const surveyTemplates = [
  "Weekly wellbeing pulse",
  "Program reflection survey",
  "Manager support check-in",
];

export const gameTemplates = [
  "would_you_rather",
  "tap_challenge",
  "trivia",
  "guess_the_fact",
  "this_or_that",
] as const;

export function chooseGameTemplate(prompt: string) {
  const lower = prompt.toLowerCase();

  if (lower.includes("fast") || lower.includes("energ")) {
    return "tap_challenge";
  }

  if (lower.includes("fun fact") || lower.includes("learn")) {
    return "guess_the_fact";
  }

  if (lower.includes("social") || lower.includes("icebreaker")) {
    return "would_you_rather";
  }

  if (lower.includes("knowledge")) {
    return "trivia";
  }

  return "this_or_that";
}

