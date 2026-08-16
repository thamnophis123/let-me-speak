"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AskOutput } from "@/lib/ask/schema";

const SAMPLE_QUESTIONS = [
  "How will noise be controlled?",
  "What is the expected impact on electricity rates?",
  "Has water treatment been addressed?",
];

const DISCLAIMER =
  "This answer is generated from this project’s collected evidence and analysis only. It is not legal advice and it does not use information from outside this board.";

type AskResult = AskOutput & { question: string };

export function AskQuestion({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResult | null>(null);

  function startQuestion(value = "") {
    setQuestion(value);
    setError(null);
    setOpen(true);
  }

  function clearAnswer() {
    setResult(null);
    setQuestion("");
    setError(null);
    setOpen(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/projects/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, question }),
      });
      const payload = (await response.json()) as AskResult & { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Could not answer that question.");
        return;
      }

      setResult(payload);
      setOpen(false);
    } catch {
      setError("Could not answer that question. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Ask a question</CardTitle>
          <CardDescription>
            You can ask a question about this project. The answer will be based
            only on the evidence and analysis collected so far.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sample) => (
              <Button
                key={sample}
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => startQuestion(sample)}
              >
                {sample}
              </Button>
            ))}
          </div>

          {open ? (
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="resident-question">Your question</Label>
                <Textarea
                  id="resident-question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  required
                  minLength={8}
                  maxLength={500}
                  placeholder="Ask about noise, water, rates, or another issue on this board"
                />
              </div>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={pending}>
                  {pending ? "Reading the record…" : "Submit question"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <Button type="button" disabled={pending} onClick={() => startQuestion()}>
                Ask a question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Answer
              </p>
              <Button type="button" variant="outline" size="sm" onClick={clearAnswer}>
                Clear answer
              </Button>
            </div>
            <CardTitle className="text-lg leading-7">{result.question}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <p className="text-sm leading-7">{result.answer}</p>
            {result.insufficient ? (
              <p className="text-sm leading-6 text-muted-foreground">
                The current record does not fully answer this question.
              </p>
            ) : null}
            {result.citations.length > 0 ? (
              <div className="grid gap-2">
                <h3 className="text-sm font-medium">Sources used</h3>
                <ul className="grid gap-2">
                  {result.citations.map((citation) => (
                    <li
                      key={`${citation.kind}-${citation.label}`}
                      className="rounded-lg bg-muted/40 px-3 py-2 text-sm leading-6"
                    >
                      <span className="font-medium">{citation.label}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {citation.kind}
                        {citation.note ? ` — ${citation.note}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="text-xs leading-5 text-muted-foreground">{DISCLAIMER}</p>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
