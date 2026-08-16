import { generateText, NoObjectGeneratedError, Output } from "ai";
import { xai } from "@ai-sdk/xai";

import { analysisOutputSchema, type AnalysisOutput } from "@/lib/analysis/schema";
import { ANALYSIS_SYSTEM_PROMPT } from "@/lib/analysis/system-prompt";
import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type EvidenceRow = Database["public"]["Tables"]["evidence_items"]["Row"];
type ClaimRow = Database["public"]["Tables"]["claims"]["Row"];
type SubmissionRow = Database["public"]["Tables"]["submissions"]["Row"];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const INCLUDED_SUBMISSION_STATUSES = ["pending_review", "accepted"] as const;

export type GeneratedAnalysisResult = {
  version: string;
  includedSubmissions: number;
};

export async function runProjectAnalysis(
  projectId: string,
): Promise<GeneratedAnalysisResult> {
  if (!process.env.XAI_API_KEY) {
    throw new Error("Missing XAI_API_KEY");
  }

  const supabase = createSupabaseAdminClient();
  const context = await loadAnalysisContext(supabase, projectId);
  const output = await generateAnalysis(context);
  const version = nextVersion(context.versions.at(-1)?.version);

  await persistAnalysis(supabase, context, output, version);

  return {
    version,
    includedSubmissions: context.submissions.length,
  };
}

async function loadAnalysisContext(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  projectId: string,
) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) {
    throw new Error("Project not found");
  }

  const [evidenceResult, claimsResult, versionsResult, submissionsResult] =
    await Promise.all([
      supabase
        .from("evidence_items")
        .select("*")
        .eq("project_id", project.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("claims")
        .select("*")
        .eq("project_id", project.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("analysis_versions")
        .select("*")
        .eq("project_id", project.id)
        .order("published_at", { ascending: true }),
      supabase
        .from("submissions")
        .select("*")
        .eq("project_id", project.id)
        .in("status", [...INCLUDED_SUBMISSION_STATUSES])
        .order("created_at", { ascending: true }),
    ]);

  if (evidenceResult.error) throw evidenceResult.error;
  if (claimsResult.error) throw claimsResult.error;
  if (versionsResult.error) throw versionsResult.error;
  if (submissionsResult.error) throw submissionsResult.error;

  return {
    project,
    evidence: evidenceResult.data ?? [],
    claims: claimsResult.data ?? [],
    versions: versionsResult.data ?? [],
    submissions: submissionsResult.data ?? [],
  };
}

type AnalysisContext = Awaited<ReturnType<typeof loadAnalysisContext>>;

async function generateAnalysis(context: AnalysisContext): Promise<AnalysisOutput> {
  try {
    const result = await generateText({
      model: xai("grok-4.6"),
      system: ANALYSIS_SYSTEM_PROMPT,
      prompt: buildUserPrompt(context),
      output: Output.object({
        name: "ProjectAnalysis",
        description:
          "Structured public analysis for the argument map and preliminary recommendation.",
        schema: analysisOutputSchema,
      }),
    });

    if (!result.output) {
      throw new Error("Grok did not return a structured analysis.");
    }

    return result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("Grok returned an analysis that could not be parsed.");
    }
    throw error;
  }
}

function buildUserPrompt(context: AnalysisContext) {
  const latestVersion = context.versions.at(-1);

  return [
    "Analyze this project and return the structured analysis.",
    "",
    "## Project",
    JSON.stringify(
      {
        title: context.project.title,
        jurisdiction: context.project.jurisdiction,
        status: context.project.status,
        summary: context.project.summary,
        currentRecommendation: context.project.recommendation,
        currentDecisiveFactors: context.project.decisive_factors,
        currentUncertainties: context.project.uncertainties,
        currentConfidence: context.project.confidence,
        currentConfidenceNote: context.project.confidence_note,
        latestVersion: latestVersion?.version ?? null,
        latestVersionSummary: latestVersion?.summary ?? null,
      },
      null,
      2,
    ),
    "",
    "## Evidence items",
    JSON.stringify(
      context.evidence.map((item: EvidenceRow) => ({
        title: item.title,
        source: item.source,
        summary: item.summary,
        status: item.status,
        sourceUrl: item.source_url,
        fileUrl: item.file_url,
      })),
      null,
      2,
    ),
    "",
    "## Current claims",
    JSON.stringify(
      context.claims.map((claim: ClaimRow) => ({
        id: claim.id,
        side: claim.side,
        claim: claim.claim,
        note: claim.note,
        strength: claim.strength,
      })),
      null,
      2,
    ),
    "",
    "## Non-rejected submissions",
    context.submissions.length === 0
      ? "None. Re-evaluate the current record and keep or revise claims as needed."
      : JSON.stringify(
          context.submissions.map((submission: SubmissionRow) => ({
            id: submission.id,
            role: submission.role,
            contributionType: submission.contribution_type,
            status: submission.status,
            claim: submission.claim,
            supportingLink: submission.supporting_link,
            explanation: submission.explanation,
          })),
          null,
          2,
        ),
  ].join("\n");
}

function nextVersion(latest: string | undefined) {
  if (!latest) {
    return "v0.1";
  }

  const match = latest.match(/^v(\d+)\.(\d+)$/i);
  if (!match) {
    return `${latest}-ai`;
  }

  return `v${match[1]}.${Number(match[2]) + 1}`;
}

function isClaimId(value: string) {
  return UUID_PATTERN.test(value);
}

function noteWithChange(claim: AnalysisOutput["claims"][number], existed: boolean) {
  const reason = claim.changeReason.trim();
  const alreadyLabeled = /^(updated|new)\b/i.test(claim.note.trim());

  if (alreadyLabeled || !reason) {
    return claim.note;
  }

  if (claim.change === "updated" || (existed && claim.change !== "unchanged")) {
    return `Updated — ${reason} ${claim.note}`;
  }

  if (claim.change === "new" || !existed) {
    return `New — ${reason} ${claim.note}`;
  }

  return claim.note;
}

async function persistAnalysis(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  context: AnalysisContext,
  output: AnalysisOutput,
  version: string,
) {
  const existingById = new Map(context.claims.map((claim) => [claim.id, claim]));
  const keptIds = new Set<string>();
  const sideCount = { for: 0, against: 0, examined: 0 };

  for (const claim of output.claims) {
    const existingId = isClaimId(claim.id) ? claim.id : "";
    const existing = existingId ? existingById.get(existingId) : undefined;
    const sortOrder = ++sideCount[claim.side];
    const nextNote = noteWithChange(claim, Boolean(existing));

    if (existing) {
      keptIds.add(existing.id);
      const { error } = await supabase
        .from("claims")
        .update({
          side: claim.side,
          claim: claim.claim,
          note: nextNote,
          strength: claim.strength,
          sort_order: sortOrder,
        })
        .eq("id", existing.id);

      if (error) throw error;
      continue;
    }

    const { error } = await supabase.from("claims").insert({
      project_id: context.project.id,
      side: claim.side,
      claim: claim.claim,
      note: nextNote,
      strength: claim.strength,
      sort_order: sortOrder,
    });

    if (error) throw error;
  }

  const removedIds = context.claims
    .map((claim) => claim.id)
    .filter((id) => !keptIds.has(id));

  if (removedIds.length > 0) {
    const { error } = await supabase.from("claims").delete().in("id", removedIds);
    if (error) throw error;
  }

  const { error: projectError } = await supabase
    .from("projects")
    .update({
      recommendation: output.recommendation,
      decisive_factors: output.decisiveFactors,
      uncertainties: output.uncertainties,
      confidence: output.confidence,
      confidence_note: output.confidenceNote,
    })
    .eq("id", context.project.id);

  if (projectError) throw projectError;

  const today = new Date().toISOString().slice(0, 10);
  const { error: versionError } = await supabase.from("analysis_versions").insert({
    project_id: context.project.id,
    version,
    summary: output.versionSummary,
    published_at: today,
  });

  if (versionError) throw versionError;
}
