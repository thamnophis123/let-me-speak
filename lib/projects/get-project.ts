import { sampleProject, sampleProjectsById } from "./sample-project";
import type { ProjectAnalysis } from "./types";

export function getProject(id: string): ProjectAnalysis | null {
  return sampleProjectsById[id] ?? null;
}

export function getSampleProject(): ProjectAnalysis {
  return sampleProject;
}
