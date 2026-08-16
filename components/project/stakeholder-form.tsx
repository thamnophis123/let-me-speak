"use client";

import { useState, type FormEvent } from "react";

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
import { createSupabaseClient } from "@/lib/supabase";
import type { Enums } from "@/lib/supabase/database.types";

const roles: Enums<"contributor_role">[] = [
  "Resident",
  "Nearby landowner",
  "Business owner",
  "Subject-matter expert",
  "Elected or appointed official",
  "Other",
];

const contributionTypes: Enums<"contribution_type">[] = [
  "New evidence",
  "Correction of fact",
  "Argument for",
  "Argument against",
  "Challenge to an existing claim",
  "Question / missing information",
];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isProjectId(value: string | undefined): value is string {
  return Boolean(value && UUID_PATTERN.test(value));
}

function submissionErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);
    const code = "code" in error ? String(error.code) : "";

    if (code === "42501" || /row-level security|permission denied/i.test(message)) {
      return "This project is not accepting public submissions yet. Please try again later.";
    }
    if (code === "23503" || /foreign key/i.test(message)) {
      return "This analysis board is not available for comments.";
    }
    if (code === "22P02" || /invalid input value for enum/i.test(message)) {
      return "One of the selected options is not valid. Please choose again.";
    }
    if (/failed to fetch|network/i.test(message)) {
      return "Network error. Check your connection and try again.";
    }
  }

  if (error instanceof Error && /Missing NEXT_PUBLIC_SUPABASE/i.test(error.message)) {
    return "Supabase is not configured in this environment.";
  }

  return "Could not save this submission. Please try again.";
}

export function StakeholderForm({ projectId }: { projectId?: string }) {
  const canSubmit = isProjectId(projectId);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [role, setRole] = useState<Enums<"contributor_role"> | undefined>();
  const [contributionType, setContributionType] = useState<
    Enums<"contribution_type"> | undefined
  >();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isProjectId(projectId)) {
      setError("This form is not linked to a valid project, so it cannot be submitted.");
      return;
    }

    if (!role || !contributionType) {
      setError("Choose a role and type of contribution.");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const claim = String(data.get("claim") ?? "").trim();
    const supportingLink = String(data.get("link") ?? "").trim();
    const explanation = String(data.get("explanation") ?? "").trim();

    if (!claim) {
      setError("Enter a claim before submitting.");
      return;
    }

    setPending(true);

    try {
      const supabase = createSupabaseClient();
      const { error: insertError } = await supabase.from("submissions").insert({
        project_id: projectId,
        role,
        contribution_type: contributionType,
        claim,
        supporting_link: supportingLink || null,
        explanation: explanation || null,
        status: "pending_review",
      });

      if (insertError) {
        setError(submissionErrorMessage(insertError));
        return;
      }

      form.reset();
      setRole(undefined);
      setContributionType(undefined);
      setSuccess(true);
    } catch (submitError) {
      setError(submissionErrorMessage(submitError));
    } finally {
      setPending(false);
    }
  }

  if (!canSubmit) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Stakeholder comments are unavailable because this analysis is not linked
        to a project record.
      </p>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit} aria-busy={pending}>
      <fieldset className="grid gap-5" disabled={pending}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) =>
                setRole(value as Enums<"contributor_role">)
              }
              required
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                className="w-(--radix-select-trigger-width)"
              >
                {roles.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contribution-type">Type of contribution</Label>
            <Select
              value={contributionType}
              onValueChange={(value) =>
                setContributionType(value as Enums<"contribution_type">)
              }
              required
            >
              <SelectTrigger id="contribution-type" className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                className="w-(--radix-select-trigger-width)"
              >
                {contributionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="claim">Claim</Label>
          <Input
            id="claim"
            name="claim"
            required
            placeholder="State the claim in one sentence"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="link">Supporting link</Label>
          <Input id="link" name="link" type="url" placeholder="https://" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="explanation">Optional explanation</Label>
          <Textarea
            id="explanation"
            name="explanation"
            placeholder="Add context, data, or why this should change the analysis"
          />
        </div>
      </fieldset>

      <p className="text-sm leading-6 text-muted-foreground">
        Submissions are not posted live. They will be reviewed and assessed for
        validity, relevance, and duplication before any change is made to the board.
      </p>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          className="rounded-lg border border-emerald-200 border-l-4 border-l-emerald-600 bg-emerald-50 px-4 py-3 text-sm leading-6 font-medium text-emerald-950 dark:border-emerald-800 dark:border-l-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-50"
          role="status"
        >
          Submission received. It is marked pending review and will not appear on
          the board until staff assess it.
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting…" : "Submit for review"}
        </Button>
      </div>
    </form>
  );
}
