import { z } from "zod";

export const askCitationSchema = z.object({
  kind: z.enum(["evidence", "claim", "recommendation"]),
  label: z
    .string()
    .describe("The evidence title, claim text, or “Preliminary recommendation”."),
  note: z
    .string()
    .describe("One short sentence on what this source contributed to the answer."),
});

export const askOutputSchema = z.object({
  answer: z
    .string()
    .describe("A plain-language answer for a resident, or a clear statement that the record is insufficient."),
  insufficient: z
    .boolean()
    .describe("True if the record does not contain enough information to answer."),
  citations: z
    .array(askCitationSchema)
    .describe("The evidence items, claims, or recommendation passages actually used."),
});

export type AskOutput = z.infer<typeof askOutputSchema>;
