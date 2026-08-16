import { NextResponse } from "next/server";

import { answerProjectQuestion, AskQuestionError } from "@/lib/ask/answer-question";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectId?: unknown;
      question?: unknown;
    };

    const result = await answerProjectQuestion(
      typeof body.projectId === "string" ? body.projectId : "",
      typeof body.question === "string" ? body.question : "",
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    if (error instanceof AskQuestionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "";
    if (/Missing XAI_API_KEY/.test(message)) {
      return NextResponse.json(
        { error: "Questions are not available in this environment yet." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Could not answer that question. Please try again." },
      { status: 500 },
    );
  }
}
