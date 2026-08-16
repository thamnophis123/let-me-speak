import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { routeErrorResponse, unauthorizedIfNotAdmin } from "@/lib/admin/route-helpers";
import {
  createEvidence,
  EvidenceCreateError,
} from "@/lib/evidence/create-evidence";
import type { EvidenceStatus } from "@/lib/projects/types";

export async function POST(request: Request) {
  const unauthorized = await unauthorizedIfNotAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const form = await request.formData();
    const fileValue = form.get("file");
    const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

    const result = await createEvidence({
      projectId: stringField(form, "projectId"),
      title: stringField(form, "title"),
      source: stringField(form, "source"),
      summary: stringField(form, "summary"),
      status: stringField(form, "status") as EvidenceStatus,
      sourceUrl: stringField(form, "sourceUrl"),
      file,
    });

    revalidatePath("/");
    revalidatePath(`/project/${result.slug}`);

    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    if (error instanceof EvidenceCreateError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return routeErrorResponse(error);
  }
}

function stringField(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}
