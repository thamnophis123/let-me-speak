import { randomUUID } from "node:crypto";

import type { EvidenceStatus } from "@/lib/projects/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const EVIDENCE_BUCKET = "evidence";

const statuses: EvidenceStatus[] = [
  "Verified",
  "Company Claim",
  "Staff Estimate",
  "Open Question",
];

const mimeToExtension: Record<string, "pdf" | "docx"> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export class EvidenceCreateError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "EvidenceCreateError";
  }
}

export type CreateEvidenceInput = {
  projectId: string;
  title: string;
  source: string;
  summary: string;
  status: EvidenceStatus;
  sourceUrl: string;
  file: File | null;
};

export async function createEvidence(input: CreateEvidenceInput) {
  const projectId = input.projectId.trim();
  const title = input.title.trim();
  const source = input.source.trim();
  const summary = input.summary.trim();
  const sourceUrl = input.sourceUrl.trim();
  const status = input.status;

  if (!UUID_PATTERN.test(projectId)) {
    throw new EvidenceCreateError("A valid project is required.", 400);
  }
  if (!title) {
    throw new EvidenceCreateError("Enter a title.", 400);
  }
  if (!source) {
    throw new EvidenceCreateError("Enter a source or author.", 400);
  }
  if (!summary) {
    throw new EvidenceCreateError("Enter a short summary.", 400);
  }
  if (!statuses.includes(status)) {
    throw new EvidenceCreateError("Choose a valid evidence status.", 400);
  }
  if (!sourceUrl && !input.file) {
    throw new EvidenceCreateError("Upload a PDF or DOCX file, or paste a URL.", 400);
  }

  const parsedUrl = sourceUrl ? parseHttpUrl(sourceUrl) : null;

  const supabase = createSupabaseAdminClient();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, slug")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) {
    throw new EvidenceCreateError("Project not found.", 404);
  }

  const { data: latest, error: sortError } = await supabase
    .from("evidence_items")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sortError) throw sortError;

  let fileUrl: string | null = null;
  let filePath: string | null = null;

  if (input.file) {
    const uploaded = await uploadEvidenceFile(supabase, projectId, input.file);
    fileUrl = uploaded.fileUrl;
    filePath = uploaded.filePath;
  }

  const { data, error } = await supabase
    .from("evidence_items")
    .insert({
      project_id: projectId,
      title,
      source,
      summary,
      status,
      source_url: parsedUrl,
      file_url: fileUrl,
      file_path: filePath,
      sort_order: (latest?.sort_order ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error) throw error;

  return { id: data.id, slug: project.slug };
}

function parseHttpUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new EvidenceCreateError("Enter a valid URL starting with https://.", 400);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new EvidenceCreateError("URLs must start with http:// or https://.", 400);
  }
  return url.toString();
}

async function uploadEvidenceFile(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  projectId: string,
  file: File,
) {
  if (file.size > MAX_FILE_BYTES) {
    throw new EvidenceCreateError("Files must be 10 MB or smaller.", 400);
  }

  const extension = fileExtension(file);
  if (!extension) {
    throw new EvidenceCreateError("Upload a PDF or DOCX file.", 400);
  }

  const filePath = `${projectId}/${randomUUID()}.${extension}`;
  const contentType =
    extension === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const { error } = await supabase.storage.from(EVIDENCE_BUCKET).upload(
    filePath,
    Buffer.from(await file.arrayBuffer()),
    {
      contentType,
      upsert: false,
    },
  );

  if (error) {
    if (/bucket not found|not found/i.test(error.message)) {
      throw new EvidenceCreateError(
        "Evidence storage is not configured. Run supabase/add-evidence.sql.",
        500,
      );
    }
    throw new EvidenceCreateError("Could not store that file. Try again.", 500);
  }

  const { data } = supabase.storage.from(EVIDENCE_BUCKET).getPublicUrl(filePath);
  return { fileUrl: data.publicUrl, filePath };
}

function fileExtension(file: File): "pdf" | "docx" | null {
  const fromMime = mimeToExtension[file.type];
  if (fromMime) {
    return fromMime;
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx")) return "docx";
  return null;
}
