import type { Database } from "@/lib/supabase/database.types";
import type {
  ArgumentItem,
  ProjectAnalysis,
  VersionEntry,
} from "@/lib/projects/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type EvidenceRow = Database["public"]["Tables"]["evidence_items"]["Row"];
type ClaimRow = Database["public"]["Tables"]["claims"]["Row"];
type VersionRow = Database["public"]["Tables"]["analysis_versions"]["Row"];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function toArgument(row: ClaimRow): ArgumentItem {
  return {
    id: row.id,
    claim: row.claim,
    note: row.note,
    strength: row.strength,
  };
}

export function mapProjectAnalysis(
  project: ProjectRow,
  evidence: EvidenceRow[],
  claims: ClaimRow[],
  versions: VersionRow[],
): ProjectAnalysis {
  const sortedVersions = [...versions].sort(
    (a, b) =>
      new Date(a.published_at).getTime() - new Date(b.published_at).getTime(),
  );
  const latestVersion = sortedVersions.at(-1);

  return {
    id: project.slug,
    uuid: project.id,
    title: project.title,
    jurisdiction: project.jurisdiction,
    status: project.status,
    summary: project.summary,
    version: latestVersion?.version ?? "v0.0",
    lastUpdated: formatDate(project.updated_at),
    evidence: [...evidence]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        title: item.title,
        source: item.source,
        summary: item.summary,
        status: item.status,
      })),
    argumentsFor: claims
      .filter((claim) => claim.side === "for")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(toArgument),
    argumentsAgainst: claims
      .filter((claim) => claim.side === "against")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(toArgument),
    argumentsWeak: claims
      .filter((claim) => claim.side === "examined")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(toArgument),
    recommendation:
      project.recommendation ?? "No preliminary recommendation has been posted.",
    decisiveFactors: project.decisive_factors,
    uncertainties: project.uncertainties,
    confidence: project.confidence ?? "Medium",
    confidenceNote: project.confidence_note ?? "",
    versions: sortedVersions.map(
      (entry): VersionEntry => ({
        version: entry.version,
        date: formatDate(entry.published_at),
        summary: entry.summary,
      }),
    ),
  };
}
