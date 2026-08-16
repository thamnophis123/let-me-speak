import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import { routeErrorResponse } from "@/lib/admin/route-helpers";

export async function GET(request: Request) {
  try {
    return NextResponse.json({ admin: await isAdminRequest(request) });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
