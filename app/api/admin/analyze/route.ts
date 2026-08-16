import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { routeErrorResponse, unauthorizedIfNotAdmin } from "@/lib/admin/route-helpers";
import { runProjectAnalysis } from "@/lib/analysis/run-analysis";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 180;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const unauthorized = await unauthorizedIfNotAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = (await request.json()) as { projectId?: unknown };
    const projectId = typeof body.projectId === "string" ? body.projectId : "";

    if (!UUID_PATTERN.test(projectId)) {
      return NextResponse.json({ error: "A valid projectId is required." }, { status: 400 });
    }

    const result = await runProjectAnalysis(projectId);
    const supabase = createSupabaseAdminClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select("slug")
      .eq("id", projectId)
      .maybeSingle();

    if (error) throw error;

    revalidatePath("/");
    if (project?.slug) {
      revalidatePath(`/project/${project.slug}`);
    }

    return NextResponse.json({
      ok: true,
      version: result.version,
      includedSubmissions: result.includedSubmissions,
    });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
