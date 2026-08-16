import { Badge } from "@/components/ui/badge";
import type {
  ArgumentStrength,
  EvidenceStatus,
  ProjectStatus,
} from "@/lib/projects/types";
import { dashboardStage } from "@/lib/projects/list-projects";
import { stageBadgeClass } from "@/lib/projects/status-colors";

const evidenceVariant: Record<
  EvidenceStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Verified: "default",
  "Company Claim": "secondary",
  "Staff Estimate": "outline",
  "Open Question": "destructive",
};

const argumentVariant: Record<
  ArgumentStrength,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Strong: "default",
  Moderate: "secondary",
  Weak: "outline",
  Invalid: "destructive",
  "Not Applicable": "outline",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className={stageBadgeClass[dashboardStage(status)]}>
      {status}
    </Badge>
  );
}

export function EvidenceStatusBadge({ status }: { status: EvidenceStatus }) {
  return <Badge variant={evidenceVariant[status]}>{status}</Badge>;
}

export function ArgumentStrengthBadge({ strength }: { strength: ArgumentStrength }) {
  return <Badge variant={argumentVariant[strength]}>{strength}</Badge>;
}
