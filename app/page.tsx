import { ProjectDashboard } from "@/components/dashboard/project-dashboard";
import { listProjects } from "@/lib/projects/list-projects";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await listProjects();

  return <ProjectDashboard projects={projects} />;
}
