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
        {items.map((item) => (
          <Card key={item.id} size="sm" className="bg-background shadow-none">
            <CardHeader>
              <ArgumentStrengthBadge strength={item.strength} />
              <CardTitle className="text-[0.95rem] leading-6">{item.claim}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="leading-6">{item.note}</CardDescription>
            </CardContent>
          </Card>
        ))}
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

        <Separator />

        <section className="space-y-6">
          <SectionHeading
            kicker="01 · Evidence"
            title="Evidence baseline"
            description="What the record currently supports, and how each item is classified."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {project.evidence.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <EvidenceStatusBadge status={item.status} />
                  <div className="space-y-1">
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.source}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="leading-6 text-muted-foreground">{item.summary}</p>
                </CardContent>
              </Card>
            ))}
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
            kicker="04 · Public input"
            title="Stakeholder input"
            description="Offer a claim, a correction, or new evidence. This is a placeholder intake form."
          />
          <Card>
            <CardContent className="pt-1">
              <StakeholderForm />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6 pb-6">
          <SectionHeading kicker="05 · Record" title="Version history" />
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
        </section>
      </main>
    </div>
  );
}
