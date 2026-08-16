import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectStatusBadge } from "@/components/project/status-badges";
import type { DashboardStage, ProjectListItem } from "@/lib/projects/list-projects";
import { projectCounts } from "@/lib/projects/list-projects";
import { stageCardClass, stageStatClass } from "@/lib/projects/status-colors";

const emptyCopy: Record<"Active" | "Completed" | "Planned", string> = {
  Active: "No analyses are open for public comment right now.",
  Completed: "Completed analyses will appear here when a final recommendation is posted.",
  Planned: "Planned analyses will appear here as new decisions are added to the baseline.",
};

function StatCard({
  label,
  value,
  stage,
}: {
  label: string;
  value: number;
  stage: DashboardStage;
}) {
  return (
    <Card className={stageStatClass[stage]}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tracking-tight">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link
      href={`/project/${project.slug}`}
      className="block rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Card className={`h-full transition-colors ${stageCardClass[project.stage]}`}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            <CardDescription>{project.jurisdiction}</CardDescription>
          </div>
          <CardTitle className="text-lg leading-7">{project.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <p className="line-clamp-3 leading-6 text-muted-foreground">
            {project.summary}
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated {project.lastUpdated}
          </p>
        </CardContent>
        <CardFooter>
          <span className={buttonVariants({ size: "sm" })}>View Analysis</span>
        </CardFooter>
      </Card>
    </Link>
  );
}

function ProjectGrid({
  projects,
  stage,
}: {
  projects: ProjectListItem[];
  stage: "Active" | "Completed" | "Planned";
}) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-12 text-center text-sm leading-6 text-muted-foreground">
        {emptyCopy[stage]}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}

export function ProjectDashboard({ projects }: { projects: ProjectListItem[] }) {
  const counts = projectCounts(projects);
  const active = projects.filter((project) => project.stage === "Active");
  const completed = projects.filter((project) => project.stage === "Completed");
  const planned = projects.filter((project) => project.stage === "Planned");

  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <p className="text-sm font-medium tracking-tight">Let The People Speak</p>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Public decision analysis
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:py-14">
        <section className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Public Decision Analysis
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Independent boards for public decisions: evidence, arguments, and a
            preliminary recommendation written so a resident can understand the
            live dispute in a few minutes.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Active projects" value={counts.active} stage="Active" />
          <StatCard label="Completed projects" value={counts.completed} stage="Completed" />
          <StatCard label="Planned projects" value={counts.planned} stage="Planned" />
        </section>

        <Tabs defaultValue="active" className="gap-6">
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
            <TabsTrigger value="planned">Planned ({counts.planned})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <ProjectGrid projects={active} stage="Active" />
          </TabsContent>
          <TabsContent value="completed">
            <ProjectGrid projects={completed} stage="Completed" />
          </TabsContent>
          <TabsContent value="planned">
            <ProjectGrid projects={planned} stage="Planned" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
