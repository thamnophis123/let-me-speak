import { NextResponse } from "next/server";

import { clearAdminCookie } from "@/lib/admin/auth";
import { routeErrorResponse } from "@/lib/admin/route-helpers";

export async function POST() {
  try {
    await clearAdminCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
