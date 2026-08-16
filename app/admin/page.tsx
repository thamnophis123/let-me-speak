import type { Metadata } from "next";
import Link from "next/link";

import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin sign-in",
  description: "Staff sign-in for generating a new analysis.",
};

export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-medium tracking-tight">
            Let The People Speak
          </Link>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Staff sign-in
          </p>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Staff only
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Admin sign-in</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Enter the admin secret to review submissions and generate a new Grok
            analysis on a project board. This page does not load a project.
          </p>
        </div>
        <AdminLoginForm />
      </main>
    </div>
  );
}
