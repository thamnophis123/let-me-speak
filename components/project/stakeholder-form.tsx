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

export function StakeholderForm({ projectId }: { projectId: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [role, setRole] = useState<Enums<"contributor_role"> | "">("");
  const [contributionType, setContributionType] = useState<
    Enums<"contribution_type"> | ""
  >("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!role || !contributionType) {
      setError("Choose a role and type of contribution.");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const claim = String(data.get("claim") ?? "").trim();
    const supportingLink = String(data.get("link") ?? "").trim();
    const explanation = String(data.get("explanation") ?? "").trim();

    setPending(true);

    const supabase = createSupabaseClient();
    const { error: insertError } = await supabase.from("submissions").insert({
      project_id: projectId,
      role,
      contribution_type: contributionType,
      claim,
      supporting_link: supportingLink || null,
      explanation: explanation || null,
    });

    setPending(false);

    if (insertError) {
      setError("Could not save this submission. Please try again.");
      return;
    }

    form.reset();
    setRole("");
    setContributionType("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 px-5 py-8 text-center">
        <p className="font-medium">Submission received for review</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Thank you. Staff will assess this contribution for relevance and validity
          before it appears on the analysis board. Nothing is published automatically.
        </p>
        <Button className="mt-5" variant="outline" onClick={() => setSubmitted(false)}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
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
            <SelectContent position="popper" align="start" className="w-(--radix-select-trigger-width)">
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
            <SelectContent position="popper" align="start" className="w-(--radix-select-trigger-width)">
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
        <Input
          id="link"
          name="link"
          type="url"
          placeholder="https://"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="explanation">Optional explanation</Label>
        <Textarea
          id="explanation"
          name="explanation"
          placeholder="Add context, data, or why this should change the analysis"
        />
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        Submissions are not posted live. They will be reviewed and assessed for
        validity, relevance, and duplication before any change is made to the board.
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting…" : "Submit for review"}
        </Button>
      </div>
    </form>
  );
}
