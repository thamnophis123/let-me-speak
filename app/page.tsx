import { hasAdminCookie } from "@/lib/admin/auth";
import { ProjectDashboard } from "@/components/dashboard/project-dashboard";
import { listProjects } from "@/lib/projects/list-projects";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, isAdmin] = await Promise.all([
    listProjects(),
    hasAdminCookie(),
  ]);

  return <ProjectDashboard projects={projects} isAdmin={isAdmin} />;
}
