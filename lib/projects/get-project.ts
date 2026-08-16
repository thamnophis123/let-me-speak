import { mapProjectAnalysis } from "@/lib/projects/map-project";
import type { ProjectAnalysis } from "@/lib/projects/types";
import { createSupabaseClient } from "@/lib/supabase";

export const SAMPLE_PROJECT_SLUG = "cedar-ridge-data-center";

export async function getProject(slug: string): Promise<ProjectAnalysis | null> {
  return loadProject("slug", slug);
}

export async function getProjectById(id: string): Promise<ProjectAnalysis | null> {
  return loadProject("id", id);
}

async function loadProject(
  column: "slug" | "id",
  value: string,
): Promise<ProjectAnalysis | null> {
  const supabase = createSupabaseClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq(column, value)
    .maybeSingle();

  if (projectError) {
    throw projectError;
  }

  if (!project) {
    return null;
  }

  const [evidenceResult, claimsResult, versionsResult] = await Promise.all([
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
  ]);

  if (evidenceResult.error) throw evidenceResult.error;
  if (claimsResult.error) throw claimsResult.error;
  if (versionsResult.error) throw versionsResult.error;

  return mapProjectAnalysis(
    project,
    evidenceResult.data ?? [],
    claimsResult.data ?? [],
    versionsResult.data ?? [],
  );
}
