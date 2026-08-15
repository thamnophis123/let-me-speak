import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Project not found</h1>
      <p className="leading-6 text-muted-foreground">
        This analysis board does not exist yet, or the link is incorrect.
      </p>
      <div>
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
