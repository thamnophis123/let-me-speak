import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";

export async function unauthorizedIfNotAdmin(request: Request) {
  if (await isAdminRequest(request)) {
    return null;
  }

  return NextResponse.json({ error: "Admin access required." }, { status: 401 });
}

export function routeErrorResponse(error: unknown) {
  console.error(error);

  const message =
    error instanceof Error ? error.message : "Unexpected server error.";

  if (/Missing (ADMIN_SECRET|XAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY)/.test(message)) {
    return NextResponse.json(
      { error: "This environment is missing a required admin or analysis secret." },
      { status: 500 },
    );
  }

  if (message === "Project not found") {
    return NextResponse.json({ error: message }, { status: 404 });
  }

  return NextResponse.json(
    { error: "Could not complete that admin request." },
    { status: 500 },
  );
}
