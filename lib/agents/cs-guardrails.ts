export const csScopeGuardrail = {
  name: "cs_scope_check",
  runInParallel: false,
  async execute({ input, context }: { input: string | any[]; agent: any; context: any }) {
    const text = typeof input === "string" ? input : JSON.stringify(input);
    const lower = text.toLowerCase();

    /* Medical advice */
    if (/\b(diagnos|prescri|medicat|should i (take|see a doctor)|what (medicine|drug|treatment))\b/i.test(lower)) {
      return {
        tripwireTriggered: true,
        outputInfo:
          "I'm not able to provide medical advice. For health concerns, please consult your doctor or use the Virtual GP service in the CHOYS app. You can also reach our EAP counseling service for support.",
      };
    }

    /* Legal advice */
    if (/\b(lawsuit|sue\b|legal action|lawyer|attorney|discriminat)\b/i.test(lower)) {
      return {
        tripwireTriggered: true,
        outputInfo:
          "I can't help with legal matters. For legal questions about your insurance or employment, please consult a legal professional or contact support@getchoys.com for guidance.",
      };
    }

    if (context?.mode === "hr-expert" && /\b(my|me|my insurance|my benefits|my credits|my activity)\b/i.test(lower)) {
      return {
        tripwireTriggered: true,
        outputInfo:
          "HR Expert mode is for product and demo conversations. Switch to Employee CS mode if you want help with a selected employee's support details.",
      };
    }

    if (context?.mode === "employee-cs" && !context?.userId && /\b(my|me|my insurance|my benefits|my credits|my activity|my profile)\b/i.test(lower)) {
      return {
        tripwireTriggered: true,
        outputInfo:
          "I can help with that, but I need a selected employee first. Pick a user in the context panel, then ask again.",
      };
    }

    if (/\b(show me|look up|check|find).{0,30}(employee|person|colleague|coworker).{0,20}(data|insurance|benefits|plan)\b/i.test(lower)) {
      if (/\b(their|his|her|another|other|someone)\b/i.test(lower)) {
        return {
          tripwireTriggered: true,
          outputInfo:
            "Employee CS mode is limited to the selected employee context. I'm not able to share another employee's information for privacy reasons.",
        };
      }
    }

    return { tripwireTriggered: false };
  },
};
