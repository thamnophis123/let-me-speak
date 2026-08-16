import { NextResponse } from "next/server";

import { routeErrorResponse, unauthorizedIfNotAdmin } from "@/lib/admin/route-helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Enums } from "@/lib/supabase/database.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const unauthorized = await unauthorizedIfNotAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const projectId = new URL(request.url).searchParams.get("projectId") ?? "";
    if (!UUID_PATTERN.test(projectId)) {
      return NextResponse.json({ error: "A valid projectId is required." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("submissions")
      .select(
        "id, role, contribution_type, claim, supporting_link, explanation, status, created_at",
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ submissions: data ?? [] });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await unauthorizedIfNotAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = (await request.json()) as {
      id?: unknown;
      status?: unknown;
    };
    const id = typeof body.id === "string" ? body.id : "";
    const status = body.status;

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: "A valid submission id is required." }, { status: 400 });
    }

    if (status !== "pending_review" && status !== "rejected") {
      return NextResponse.json(
        { error: "Status must be pending_review or rejected." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("submissions")
      .update({ status: status as Enums<"submission_status"> })
      .eq("id", id)
      .select(
        "id, role, contribution_type, claim, supporting_link, explanation, status, created_at",
      )
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    return NextResponse.json({ submission: data });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
