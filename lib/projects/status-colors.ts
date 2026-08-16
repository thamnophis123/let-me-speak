import type { DashboardStage } from "@/lib/projects/list-projects";

export const stageBadgeClass: Record<DashboardStage, string> = {
  Active:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  Planned:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  Completed:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
};

export const stageCardClass: Record<DashboardStage, string> = {
  Active:
    "border-l-[3px] border-l-emerald-500 bg-emerald-50/45 ring-emerald-200/70 hover:bg-emerald-50 dark:border-l-emerald-400 dark:bg-emerald-950/20 dark:ring-emerald-900/50 dark:hover:bg-emerald-950/35",
  Planned:
    "border-l-[3px] border-l-amber-400 bg-amber-50/45 ring-amber-200/70 hover:bg-amber-50 dark:border-l-amber-300 dark:bg-amber-950/20 dark:ring-amber-900/50 dark:hover:bg-amber-950/35",
  Completed:
    "border-l-[3px] border-l-rose-400 bg-rose-50/45 ring-rose-200/70 hover:bg-rose-50 dark:border-l-rose-400 dark:bg-rose-950/20 dark:ring-rose-900/50 dark:hover:bg-rose-950/35",
};

export const stageStatClass: Record<DashboardStage, string> = {
  Active:
    "border-l-[3px] border-l-emerald-500 bg-emerald-50/40 dark:border-l-emerald-400 dark:bg-emerald-950/20",
  Planned:
    "border-l-[3px] border-l-amber-400 bg-amber-50/40 dark:border-l-amber-300 dark:bg-amber-950/20",
  Completed:
    "border-l-[3px] border-l-rose-400 bg-rose-50/40 dark:border-l-rose-400 dark:bg-rose-950/20",
};

