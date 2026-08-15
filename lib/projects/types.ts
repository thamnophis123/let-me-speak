export type ProjectStatus =
  | "Open for Comment"
  | "Baseline"
  | "Final Recommendation";

export type EvidenceStatus =
  | "Verified"
  | "Company Claim"
  | "Staff Estimate"
  | "Open Question";

export type ArgumentStrength =
  | "Strong"
  | "Moderate"
  | "Weak"
  | "Invalid"
  | "Not Applicable";

export type ConfidenceLevel = "Low" | "Medium" | "High";

export type EvidenceItem = {
  id: string;
  title: string;
  source: string;
  summary: string;
  status: EvidenceStatus;
};

export type ArgumentItem = {
  id: string;
  claim: string;
  note: string;
  strength: ArgumentStrength;
};

export type VersionEntry = {
  version: string;
  date: string;
  summary: string;
};

export type ProjectAnalysis = {
  id: string;
  title: string;
  jurisdiction: string;
  status: ProjectStatus;
  summary: string;
  version: string;
  lastUpdated: string;
  evidence: EvidenceItem[];
  argumentsFor: ArgumentItem[];
  argumentsAgainst: ArgumentItem[];
  argumentsWeak: ArgumentItem[];
  recommendation: string;
  decisiveFactors: string[];
  uncertainties: string[];
  confidence: ConfidenceLevel;
  confidenceNote: string;
  versions: VersionEntry[];
};
