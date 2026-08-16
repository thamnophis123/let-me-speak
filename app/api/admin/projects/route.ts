import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { routeErrorResponse, unauthorizedIfNotAdmin } from "@/lib/admin/route-helpers";
import {
  createProject,
  ProjectCreateError,
} from "@/lib/projects/create-project";
import type { ProjectStatus } from "@/lib/projects/types";

export async function POST(request: Request) {
  const unauthorized = await unauthorizedIfNotAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = (await request.json()) as {
      title?: unknown;
      slug?: unknown;
      jurisdiction?: unknown;
      summary?: unknown;
      status?: unknown;
    };

    const project = await createProject({
      title: typeof body.title === "string" ? body.title : "",
      slug: typeof body.slug === "string" ? body.slug : "",
      jurisdiction: typeof body.jurisdiction === "string" ? body.jurisdiction : "",
      summary: typeof body.summary === "string" ? body.summary : "",
      status: (typeof body.status === "string"
        ? body.status
        : "Baseline") as ProjectStatus,
    });

    revalidatePath("/");
    revalidatePath(`/project/${project.slug}`);

    return NextResponse.json({ slug: project.slug, id: project.id });
  } catch (error) {
    if (error instanceof ProjectCreateError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return routeErrorResponse(error);
  }
}
