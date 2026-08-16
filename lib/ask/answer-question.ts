import { generateText, NoObjectGeneratedError, Output } from "ai";
import { xai } from "@ai-sdk/xai";

import { ASK_SYSTEM_PROMPT } from "@/lib/ask/system-prompt";
import { askOutputSchema, type AskOutput } from "@/lib/ask/schema";
import { getProjectById } from "@/lib/projects/get-project";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MIN_QUESTION = 8;
const MAX_QUESTION = 500;

export class AskQuestionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AskQuestionError";
  }
}

export async function answerProjectQuestion(
  projectId: string,
  rawQuestion: string,
): Promise<AskOutput & { question: string }> {
  if (!process.env.XAI_API_KEY) {
    throw new Error("Missing XAI_API_KEY");
  }

  if (!UUID_PATTERN.test(projectId)) {
    throw new AskQuestionError("A valid project is required.", 400);
  }

  const question = rawQuestion.trim().replace(/\s+/g, " ");
  if (question.length < MIN_QUESTION) {
    throw new AskQuestionError("Enter a slightly longer question.", 400);
  }
  if (question.length > MAX_QUESTION) {
    throw new AskQuestionError("Keep the question under 500 characters.", 400);
  }

  const project = await getProjectById(projectId);
  if (!project) {
    throw new AskQuestionError("Project not found.", 404);
  }

  try {
    const result = await generateText({
      model: xai("grok-4.6"),
      system: ASK_SYSTEM_PROMPT,
      prompt: buildAskPrompt(project, question),
      output: Output.object({
        name: "ResidentAnswer",
        description: "A grounded answer with citations from the project record.",
        schema: askOutputSchema,
      }),
    });

    if (!result.output) {
      throw new AskQuestionError("The answer could not be generated. Please try again.", 502);
    }

    return { ...result.output, question };
  } catch (error) {
    if (error instanceof AskQuestionError) {
      throw error;
    }
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new AskQuestionError("The answer could not be parsed. Please try again.", 502);
    }
    throw error;
  }
}

function buildAskPrompt(
  project: NonNullable<Awaited<ReturnType<typeof getProjectById>>>,
  question: string,
) {
  return [
    "Answer this resident question using only the project record below.",
    "",
    `Question: ${question}`,
    "",
    "## Project",
    JSON.stringify(
      {
        title: project.title,
        jurisdiction: project.jurisdiction,
        status: project.status,
        summary: project.summary,
        recommendation: project.recommendation,
        decisiveFactors: project.decisiveFactors,
        uncertainties: project.uncertainties,
        confidence: project.confidence,
        confidenceNote: project.confidenceNote,
      },
      null,
      2,
    ),
    "",
    "## Evidence items",
    JSON.stringify(
      project.evidence.map((item) => ({
        title: item.title,
        source: item.source,
        summary: item.summary,
        status: item.status,
      })),
      null,
      2,
    ),
    "",
    "## Claims for",
    JSON.stringify(project.argumentsFor, null, 2),
    "",
    "## Claims against",
    JSON.stringify(project.argumentsAgainst, null, 2),
    "",
    "## Claims examined and set aside",
    JSON.stringify(project.argumentsWeak, null, 2),
  ].join("\n");
}
