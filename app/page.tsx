import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <div className="flex max-w-lg flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Let The People Speak
        </h1>
        <p className="text-muted-foreground text-lg leading-7">
          Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui.
        </p>
      </div>
      <Button size="lg">Get started</Button>
    </main>
  );
}
