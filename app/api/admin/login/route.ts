import { NextResponse } from "next/server";

import {
  isValidAdminSecret,
  setAdminCookie,
} from "@/lib/admin/auth";
import { routeErrorResponse } from "@/lib/admin/route-helpers";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { secret?: unknown };
    const secret = typeof body.secret === "string" ? body.secret : "";

    if (!isValidAdminSecret(secret)) {
      return NextResponse.json({ error: "Invalid admin secret." }, { status: 401 });
    }

    await setAdminCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
