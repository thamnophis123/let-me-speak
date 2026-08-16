import { z } from "zod";

export const claimSideSchema = z.enum(["for", "against", "examined"]);
export const claimStrengthSchema = z.enum([
  "Strong",
  "Moderate",
  "Weak",
  "Invalid",
  "Not Applicable",
]);
export const confidenceSchema = z.enum(["Low", "Medium", "High"]);
export const claimChangeSchema = z.enum(["unchanged", "updated", "new"]);

export const analysisClaimSchema = z.object({
  id: z
    .string()
    .describe(
      "Existing claim UUID to update. Use an empty string if this is a new claim.",
    ),
  side: claimSideSchema,
  claim: z.string().describe("One plain-language sentence."),
  note: z
    .string()
    .describe("1–3 sentences explaining the claim from the record."),
  strength: claimStrengthSchema,
  change: claimChangeSchema,
  changeReason: z
    .string()
    .describe(
      "Required when change is updated or new. What changed and why, in one short sentence.",
    ),
});

export const analysisOutputSchema = z.object({
  versionSummary: z
    .string()
    .describe("One or two sentences for the public version history."),
  recommendation: z.string(),
  decisiveFactors: z.array(z.string()).min(1),
  uncertainties: z.array(z.string()).min(1),
  confidence: confidenceSchema,
  confidenceNote: z.string(),
  claims: z.array(analysisClaimSchema).min(1),
});

export type AnalysisOutput = z.infer<typeof analysisOutputSchema>;
