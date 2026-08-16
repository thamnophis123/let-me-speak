import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateProjectForm } from "@/components/admin/create-project-form";
import { hasAdminCookie } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Create project",
  description: "Add a new public decision analysis.",
};

export default async function CreateProjectPage() {
  if (!(await hasAdminCookie())) {
    redirect("/admin");
  }

  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-medium tracking-tight">
            Let The People Speak
          </Link>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Create project
          </p>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-12">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Staff only
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Project</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            This opens an empty Analysis Board. Evidence, claims, and a Grok
            analysis can be added after the project exists.
          </p>
        </div>
        <CreateProjectForm />
      </main>
    </div>
  );
}
