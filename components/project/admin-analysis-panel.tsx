"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/lib/supabase/database.types";

type AdminSubmission = {
  id: string;
  role: Enums<"contributor_role">;
  contribution_type: Enums<"contribution_type">;
  claim: string;
  supporting_link: string | null;
  explanation: string | null;
  status: Enums<"submission_status">;
  created_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function AdminAnalysisPanel({
  projectId,
}: {
  projectId: string;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const loadSubmissions = useCallback(async () => {
    const response = await fetch(
      `/api/admin/submissions?projectId=${encodeURIComponent(projectId)}`,
    );
    const payload = (await response.json()) as {
      submissions?: AdminSubmission[];
      error?: string;
    };
    if (!response.ok) {
      throw new Error(payload.error ?? "Could not load submissions.");
    }
    setSubmissions(payload.submissions ?? []);
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const session = await fetch("/api/admin/session");
        const payload = (await session.json()) as { admin?: boolean };
        if (cancelled) return;
        if (!payload.admin) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        setIsAdmin(true);
        await loadSubmissions();
      } catch {
        if (!cancelled) {
          setError("Could not load admin controls.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [loadSubmissions]);

  const included = useMemo(
    () => submissions.filter((item) => item.status !== "rejected"),
    [submissions],
  );
  const rejected = useMemo(
    () => submissions.filter((item) => item.status === "rejected"),
    [submissions],
  );

  async function updateStatus(
    id: string,
    status: Extract<Enums<"submission_status">, "pending_review" | "rejected">,
  ) {
    setError(null);
    setNotice(null);
    setPendingId(id);

    try {
      const response = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = (await response.json()) as {
        submission?: AdminSubmission;
        error?: string;
      };
      if (!response.ok || !payload.submission) {
        setError(payload.error ?? "Could not update that submission.");
        return;
      }
      setSubmissions((current) =>
        current.map((item) => (item.id === id ? payload.submission! : item)),
      );
    } catch {
      setError("Could not update that submission.");
    } finally {
      setPendingId(null);
    }
  }

  async function generateAnalysis() {
    setError(null);
    setNotice(null);
    setGenerating(true);

    try {
      const response = await fetch("/api/admin/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const payload = (await response.json()) as {
        version?: string;
        includedSubmissions?: number;
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "Could not generate a new analysis.");
        return;
      }
      setNotice(
        `Published ${payload.version ?? "a new version"}. Grok used the current evidence${
          payload.includedSubmissions
            ? ` and ${payload.includedSubmissions} included submission${payload.includedSubmissions === 1 ? "" : "s"}`
            : ""
        }.`,
      );
      router.refresh();
    } catch {
      setError("Could not generate a new analysis. Check the connection and try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAdmin(false);
    router.refresh();
  }

  if (loading || !isAdmin) {
    return null;
  }

  const busy = generating || pendingId !== null;

  return (
    <Card className="border-transparent ring-foreground/15">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Admin
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
        <CardTitle>Generate a new analysis</CardTitle>
        <CardDescription>
          Review recent submissions first. Rejected items are left out of the Grok
          pass. Everything else on this list is included with the current evidence.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <SubmissionGroup
          title="Included in the next analysis"
          empty="No pending or accepted submissions. Grok will re-analyze the current evidence and claims."
          items={included}
          pendingId={pendingId}
          busy={busy}
          actionLabel="Reject"
          onAction={(id) => void updateStatus(id, "rejected")}
        />
        <SubmissionGroup
          title="Rejected"
          empty="No rejected submissions."
          items={rejected}
          pendingId={pendingId}
          busy={busy}
          actionLabel="Include again"
          onAction={(id) => void updateStatus(id, "pending_review")}
        />

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
          <Button
            type="button"
            disabled={busy}
            onClick={() => void generateAnalysis()}
          >
            {generating ? "Generating with Grok…" : "Generate New Analysis with Grok"}
          </Button>
          {generating ? (
            <p className="text-sm text-muted-foreground">
              This can take up to a minute.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SubmissionGroup({
  title,
  empty,
  items,
  pendingId,
  busy,
  actionLabel,
  onAction,
}: {
  title: string;
  empty: string;
  items: AdminSubmission[];
  pendingId: string | null;
  busy: boolean;
  actionLabel: string;
  onAction: (id: string) => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm leading-6 text-muted-foreground">{empty}</p>
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="grid gap-3 rounded-lg bg-muted/40 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-start"
            >
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{item.status.replace("_", " ")}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.role} · {item.contribution_type}
                  </span>
                </div>
                <p className="text-sm leading-6 font-medium">{item.claim}</p>
                {item.explanation ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.explanation}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {dateFormatter.format(new Date(item.created_at))}
                  {item.supporting_link ? ` · ${item.supporting_link}` : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => onAction(item.id)}
              >
                {pendingId === item.id ? "Saving…" : actionLabel}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
