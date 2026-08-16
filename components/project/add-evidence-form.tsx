"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

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
import type { EvidenceStatus } from "@/lib/projects/types";

const statuses: EvidenceStatus[] = [
  "Verified",
  "Company Claim",
  "Staff Estimate",
  "Open Question",
];

export function AddEvidenceForm({
  projectId,
  onCancel,
}: {
  projectId: string;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<EvidenceStatus>("Verified");
  const [kind, setKind] = useState<"file" | "url">("file");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);

    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("projectId", projectId);
    data.set("status", status);

    if (kind === "file") {
      data.delete("sourceUrl");
    } else {
      data.delete("file");
    }

    try {
      const response = await fetch("/api/admin/evidence", {
        method: "POST",
        body: data,
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Could not add that evidence.");
        return;
      }

      form.reset();
      setStatus("Verified");
      setKind("file");
      setNotice("Evidence added to the baseline.");
      router.refresh();
    } catch {
      setError("Could not add that evidence. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <fieldset className="grid gap-5" disabled={pending}>
        <div className="grid gap-2">
          <Label htmlFor="evidence-title">Title</Label>
          <Input
            id="evidence-title"
            name="title"
            required
            placeholder="County Fiscal Impact Study"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="evidence-source">Source / Author</Label>
          <Input
            id="evidence-source"
            name="source"
            required
            placeholder="Cedar County Finance Department, July 2026"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="evidence-summary">Summary</Label>
          <Textarea
            id="evidence-summary"
            name="summary"
            required
            placeholder="What this document or source says, in a few sentences."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="evidence-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as EvidenceStatus)}
          >
            <SelectTrigger id="evidence-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              align="start"
              className="w-(--radix-select-trigger-width)"
            >
              {statuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-3">
          <p className="text-sm font-medium">Evidence type</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={kind === "file" ? "default" : "outline"}
              onClick={() => setKind("file")}
            >
              File upload
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kind === "url" ? "default" : "outline"}
              onClick={() => setKind("url")}
            >
              URL
            </Button>
          </div>
          {kind === "file" ? (
            <div className="grid gap-2">
              <Label htmlFor="evidence-file">PDF or DOCX</Label>
              <Input
                id="evidence-file"
                name="file"
                type="file"
                required
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Maximum 10 MB. Only .pdf and .docx files are accepted.
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="evidence-url">URL</Label>
              <Input
                id="evidence-url"
                name="sourceUrl"
                type="url"
                required
                placeholder="https://"
              />
            </div>
          )}
        </div>
      </fieldset>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p
          className="rounded-lg border border-emerald-200 border-l-4 border-l-emerald-600 bg-emerald-50 px-4 py-3 text-sm leading-6 font-medium text-emerald-950 dark:border-emerald-800 dark:border-l-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-50"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add evidence"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
