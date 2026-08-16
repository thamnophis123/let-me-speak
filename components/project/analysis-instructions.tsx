import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ANALYSIS_PRINCIPLES,
  ANALYSIS_SYSTEM_PROMPT,
} from "@/lib/analysis/system-prompt";

export function AnalysisInstructions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">How this analysis is produced</CardTitle>
        <CardDescription>
          Citizens can see the instructions given to the model. Staff trigger a
          new Grok analysis; the public record below is what those instructions
          require.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-muted-foreground">
          {ANALYSIS_PRINCIPLES.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ol>
        <details className="rounded-lg bg-muted/40 px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium">
            Full analysis instructions given to Grok
          </summary>
          <pre className="mt-3 overflow-x-auto text-xs leading-6 whitespace-pre-wrap text-muted-foreground">
            {ANALYSIS_SYSTEM_PROMPT}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}
