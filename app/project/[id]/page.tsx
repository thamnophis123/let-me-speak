import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnalysisBoard } from "@/components/project/analysis-board";
import { getProject } from "@/lib/projects/get-project";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return <AnalysisBoard project={project} />;
}
