"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { slugifyTitle } from "@/lib/projects/slug";
import type { ProjectStatus } from "@/lib/projects/types";

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "Baseline", label: "Planned (Baseline)" },
  { value: "Open for Comment", label: "Active (Open for Comment)" },
  { value: "Final Recommendation", label: "Completed (Final Recommendation)" },
];

export function CreateProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugLocked, setSlugLocked] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>("Baseline");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugLocked) {
      setSlug(slugifyTitle(value));
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = event.currentTarget;
    const data = new FormData(form);
    const jurisdiction = String(data.get("jurisdiction") ?? "").trim();
    const summary = String(data.get("summary") ?? "").trim();

    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          jurisdiction,
          summary,
          status,
        }),
      });
      const payload = (await response.json()) as { slug?: string; error?: string };

      if (!response.ok || !payload.slug) {
        setError(payload.error ?? "Could not create the project.");
        return;
      }

      router.push(`/project/${payload.slug}`);
      router.refresh();
    } catch {
      setError("Could not create the project. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <fieldset className="grid gap-5" disabled={pending}>
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="AetherGrid Cedar Ridge Campus — SUP-2026-14"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugLocked(true);
              setSlug(event.target.value);
            }}
            placeholder="cedar-ridge-data-center"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Used in the URL. Lowercase letters, numbers, and hyphens only.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="jurisdiction">Jurisdiction / Location</Label>
          <Input
            id="jurisdiction"
            name="jurisdiction"
            required
            placeholder="Cedar County Planning Commission"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="summary">Short summary</Label>
          <Textarea
            id="summary"
            name="summary"
            required
            placeholder="What decision is under review, in a few sentences a resident can follow."
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as ProjectStatus)}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="w-(--radix-select-trigger-width)">
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </fieldset>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create project"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
