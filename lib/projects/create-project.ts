import type { ProjectStatus } from "@/lib/projects/types";
import { isValidSlug, slugifyTitle } from "@/lib/projects/slug";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const statuses: ProjectStatus[] = [
  "Baseline",
  "Open for Comment",
  "Final Recommendation",
];

export class ProjectCreateError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ProjectCreateError";
  }
}

export type CreateProjectInput = {
  title: string;
  slug: string;
  jurisdiction: string;
  summary: string;
  status: ProjectStatus;
};

export async function createProject(input: CreateProjectInput) {
  const title = input.title.trim();
  const slug = input.slug.trim() || slugifyTitle(title);
  const jurisdiction = input.jurisdiction.trim();
  const summary = input.summary.trim();
  const status = input.status;

  if (!title) {
    throw new ProjectCreateError("Enter a title.", 400);
  }
  if (!jurisdiction) {
    throw new ProjectCreateError("Enter a jurisdiction or location.", 400);
  }
  if (!summary) {
    throw new ProjectCreateError("Enter a short summary.", 400);
  }
  if (!isValidSlug(slug)) {
    throw new ProjectCreateError(
      "Use a slug of lowercase letters, numbers, and hyphens.",
      400,
    );
  }
  if (!statuses.includes(status)) {
    throw new ProjectCreateError("Choose a valid status.", 400);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      title,
      slug,
      jurisdiction,
      summary,
      status,
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ProjectCreateError(
        "That slug is already in use. Choose another.",
        409,
      );
    }
    throw error;
  }

  return data;
}
