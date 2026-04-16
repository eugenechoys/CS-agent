import { z } from "zod";
import { lookupEmployeeSupportSnapshot } from "@/lib/cs-demo/choys-client";
import type { CsApiEnv, CsSourceSummary } from "@/lib/schemas/cs-schemas";

export async function createEmployeeSupportTools({
  accessToken,
  apiEnv,
  sourceCollector,
}: {
  accessToken?: string;
  apiEnv?: CsApiEnv;
  sourceCollector: CsSourceSummary[];
}) {
  const { tool } = (await import("@openai/agents")) as any;

  const lookupLiveSupportContext = tool({
    name: "lookup_live_support_context",
    description:
      "Read the selected employee's support context using curated tenant and user data. Use this for questions about the selected employee's own profile, insurance, benefits, activity, mood, recognition, rewards, or survey participation.",
    parameters: z.object({
      tenant_id: z.string().describe("Selected tenant ID"),
      user_id: z.string().describe("Selected user ID"),
      focus: z
        .string()
        .describe("Short description of what the user is asking, e.g. 'insurance coverage' or 'recent activity and credits'"),
    }),
    execute: async ({
      tenant_id,
      user_id,
      focus,
    }: {
      tenant_id: string;
      user_id: string;
      focus: string;
    }) => {
      const snapshot = await lookupEmployeeSupportSnapshot({
        accessToken,
        apiEnv,
        tenantId: tenant_id,
        userId: user_id,
        focus,
        sourceCollector,
      });

      return JSON.stringify(snapshot);
    },
  });

  return [lookupLiveSupportContext];
}
