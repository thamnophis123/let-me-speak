import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SAMPLE_PROJECT_SLUG } from "@/lib/projects/get-project";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium tracking-tight">Let The People Speak</p>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Public analysis of one decision at a time.
        </h1>
        <p className="text-lg leading-7 text-muted-foreground">
          Evidence, arguments, and a preliminary recommendation — written so a
          resident can understand the live dispute in a few minutes.
        </p>
      </div>
      <div>
        <Button size="lg" asChild>
          <Link href={`/project/${SAMPLE_PROJECT_SLUG}`}>Open sample analysis board</Link>
        </Button>
      </div>
    </main>
  );
}
