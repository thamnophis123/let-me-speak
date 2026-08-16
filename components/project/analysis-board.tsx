import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ArgumentItem, ProjectAnalysis } from "@/lib/projects/types";

import { AddEvidenceControls } from "./add-evidence-controls";
import { AdminAnalysisPanel } from "./admin-analysis-panel";
import { AnalysisInstructions } from "./analysis-instructions";
import { AskQuestion } from "./ask-question";
import { StakeholderForm } from "./stakeholder-form";
import {
  ArgumentStrengthBadge,
  EvidenceStatusBadge,
  ProjectStatusBadge,
} from "./status-badges";

function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {kicker}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function ArgumentColumn({
  title,
  description,
  items,
  accent,
}: {
  title: string;
  description: string;
  items: ArgumentItem[];
  accent: string;
}) {
  return (
    <section className={`flex min-h-full flex-col rounded-xl ring-1 ring-foreground/10 ${accent}`}>
      <header className="border-b border-border/80 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base leading-snug font-semibold">{title}</h3>
          <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {items.length}
          </span>
        </div>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      </header>
      <div className="flex flex-1 flex-col gap-3 p-3">
        {items.length === 0 ? (
          <p className="px-1 py-6 text-sm leading-6 text-muted-foreground">
            None yet.
          </p>
        ) : (
          items.map((item) => (
          <Card key={item.id} size="sm" className="bg-background shadow-none">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <ArgumentStrengthBadge strength={item.strength} />
                {/^(updated|new)\b/i.test(item.note) ? (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800">
                    {/^new\b/i.test(item.note) ? "New" : "Updated"}
                  </span>
                ) : null}
              </div>
              <CardTitle className="text-[0.95rem] leading-6">{item.claim}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="leading-6">{item.note}</CardDescription>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </section>
  );
}

export function AnalysisBoard({ project }: { project: ProjectAnalysis }) {
  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-medium tracking-tight">
            Let The People Speak
          </Link>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Public decision analysis
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-14 px-4 py-10 sm:px-6 lg:py-14">
        <section className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            <span className="text-sm text-muted-foreground">{project.jurisdiction}</span>
          </div>
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {project.title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            {project.summary}
          </p>
          <p className="text-sm text-muted-foreground">
            {project.version} · Last updated {project.lastUpdated}
          </p>
        </section>

        <AskQuestion projectId={project.uuid} />

        <Separator />

        <section className="space-y-6">
          <SectionHeading
            kicker="01 · Evidence"
            title="Evidence baseline"
            description="What the record currently supports, and how each item is classified."
          />
          <AddEvidenceControls projectId={project.uuid} />
          <div className="grid gap-4 md:grid-cols-2">
            {project.evidence.length === 0 ? (
              <div className="rounded-xl border border-dashed px-6 py-12 text-sm leading-6 text-muted-foreground md:col-span-2">
                No evidence has been posted yet.
              </div>
            ) : (
              project.evidence.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <EvidenceStatusBadge status={item.status} />
                  <div className="space-y-1">
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.source}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <p className="leading-6 text-muted-foreground">{item.summary}</p>
                  {item.fileUrl || item.sourceUrl ? (
                    <div className="flex flex-wrap gap-3 text-sm">
                      {item.fileUrl ? (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          View file
                        </a>
                      ) : null}
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          Open source
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeading
            kicker="02 · Argument map"
            title="How the live dispute currently stands"
            description="Read down the columns. Strong claims stay in play. Weak, invalid, or inapplicable claims are parked so they do not crowd out the decision."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <ArgumentColumn
              title="Strong arguments for"
              description="Claims that currently hold up."
              items={project.argumentsFor}
              accent="bg-emerald-50/80 dark:bg-emerald-950/20"
            />
            <ArgumentColumn
              title="Strong arguments against"
              description="Material risks still in the record."
              items={project.argumentsAgainst}
              accent="bg-rose-50/80 dark:bg-rose-950/20"
            />
            <ArgumentColumn
              title="Examined and set aside"
              description="Weak, invalid, or not applicable."
              items={project.argumentsWeak}
              accent="bg-background"
            />
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeading
            kicker="03 · Assessment"
            title="Preliminary recommendation"
          />
          <Card className="border-transparent ring-foreground/15">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  Recommendation
                </span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                  Confidence: {project.confidence}
                </span>
              </div>
              <CardTitle className="max-w-4xl text-xl leading-8 font-semibold text-balance">
                {project.recommendation}
              </CardTitle>
              <CardDescription>{project.confidenceNote}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 pb-2 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">Decisive factors</h3>
                <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-muted-foreground">
                  {project.decisiveFactors.map((factor) => (
                    <li key={factor}>{factor}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="text-sm font-medium">Remaining uncertainties</h3>
                <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-6 text-muted-foreground">
                  {project.uncertainties.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <SectionHeading
            kicker="04 · Method"
            title="Analysis instructions"
            description="The model is told to stay inside the public record and write for a resident, not a specialist."
          />
          <AnalysisInstructions />
        </section>

        <section className="space-y-6">
          <SectionHeading
            kicker="05 · Public input"
            title="Stakeholder input"
            description="Offer a claim, a correction, or new evidence. Submissions are reviewed before anything is added to the board."
          />
          <AdminAnalysisPanel projectId={project.uuid} />
          <Card>
            <CardContent className="pt-1">
              <StakeholderForm projectId={project.uuid} />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6 pb-6">
          <SectionHeading kicker="06 · Record" title="Version history" />
          {project.versions.length === 0 ? (
            <div className="rounded-xl border border-dashed px-6 py-12 text-sm leading-6 text-muted-foreground">
              No analysis versions yet.
            </div>
          ) : (
            <ol className="divide-y rounded-xl bg-background ring-1 ring-foreground/10">
              {project.versions.map((entry) => (
                <li
                  key={entry.version}
                  className="grid gap-1 px-4 py-4 sm:grid-cols-[7rem_8rem_1fr] sm:items-baseline sm:gap-6"
                >
                  <span className="font-medium">{entry.version}</span>
                  <span className="text-sm text-muted-foreground">{entry.date}</span>
                  <p className="text-sm leading-6 text-muted-foreground">{entry.summary}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
