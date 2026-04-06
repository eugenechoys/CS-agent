/**
 * Guardrails for the Bokchoys agent system.
 *
 * Input guardrails run BEFORE the agent sees the message.
 * Output guardrails run AFTER the agent returns.
 *
 * These are passed to run() config, not to the Agent constructor.
 */

/** Input guardrail: Block out-of-scope requests (medical, legal, discriminatory) */
export const hrScopeGuardrail = {
  name: "hr_scope_check",
  runInParallel: false, /* Block agent until check completes */
  async execute({ input }: { input: string | any[]; agent: any; context: any }) {
    const text = typeof input === "string" ? input : JSON.stringify(input);
    const lower = text.toLowerCase();

    /* Medical / clinical */
    if (/\b(diagnos|prescri|medicat|clinical|therapy|psychiatr|antidepress)\b/i.test(lower)) {
      return {
        tripwireTriggered: true,
        outputInfo: "I can only help with wellbeing programs, not medical diagnoses or prescriptions. Please consult a healthcare professional for medical advice.",
      };
    }

    /* Legal / termination */
    if (/\b(lawsuit|sue\b|terminat|fire\s+(him|her|them)|legal action|disciplinary)\b/i.test(lower)) {
      return {
        tripwireTriggered: true,
        outputInfo: "I can only help with wellbeing programs, not legal or disciplinary decisions. Please consult your legal team for those questions.",
      };
    }

    /* Discriminatory */
    if (/\b(discriminat|exclude.*(race|gender|age|religion)|target.*(minority|disabled))\b/i.test(lower)) {
      return {
        tripwireTriggered: true,
        outputInfo: "I can't help with requests that could be discriminatory. All wellbeing programs should be inclusive and safe for everyone.",
      };
    }

    return { tripwireTriggered: false };
  },
};

/** Output guardrail: Flag if chat message is too long (soft warning, doesn't block) */
export const brevityGuardrail = {
  name: "brevity_check",
  async execute({ agentOutput }: { agentOutput: any; agent: any; context: any }) {
    /* This is a monitoring guardrail — doesn't block, just flags */
    const message = agentOutput?.message ?? "";
    const wordCount = message.split(/\s+/).filter(Boolean).length;

    if (wordCount > 60) {
      console.warn(`[guardrail:brevity] Chat message is ${wordCount} words (target: <30). Consider prompt tuning.`);
    }

    return { tripwireTriggered: false };
  },
};
