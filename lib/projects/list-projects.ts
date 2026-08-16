import type { ProjectStatus } from "@/lib/projects/types";
import { createSupabaseClient } from "@/lib/supabase";

export type DashboardStage = "Active" | "Completed" | "Planned";

export type ProjectListItem = {
  slug: string;
  title: string;
  jurisdiction: string;
  summary: string;
  status: ProjectStatus;
  stage: DashboardStage;
  lastUpdated: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function dashboardStage(status: ProjectStatus): DashboardStage {
  switch (status) {
    case "Final Recommendation":
      return "Completed";
    case "Baseline":
      return "Planned";
    default:
      return "Active";
  }
}

export async function listProjects(): Promise<ProjectListItem[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("slug, title, jurisdiction, summary, status, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((project) => ({
    slug: project.slug,
    title: project.title,
    jurisdiction: project.jurisdiction,
    summary: project.summary,
    status: project.status,
    stage: dashboardStage(project.status),
    lastUpdated: dateFormatter.format(new Date(project.updated_at)),
  }));
}

export function projectCounts(projects: ProjectListItem[]) {
  return {
    active: projects.filter((project) => project.stage === "Active").length,
    completed: projects.filter((project) => project.stage === "Completed").length,
    planned: projects.filter((project) => project.stage === "Planned").length,
  };
}
