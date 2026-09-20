import type { PipelineStep } from "@/lib/orderWorkflow";

export function OrderPipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {steps.map((step, index) => (
        <li key={step.id} className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center">
          <div className="flex items-center gap-3 sm:flex-col">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step.state === "done"
                  ? "bg-[#4ade80]/20 text-[#4ade80]"
                  : step.state === "current"
                    ? "bg-accent/25 text-accent ring-2 ring-accent/50"
                    : "bg-line/40 text-faint"
              }`}
              aria-current={step.state === "current" ? "step" : undefined}
            >
              {step.state === "done" ? "✓" : index + 1}
            </span>
            {index < steps.length - 1 && (
              <span
                className={`hidden h-0.5 flex-1 sm:block sm:h-auto sm:w-full sm:min-w-[2rem] sm:flex-none sm:self-center sm:border-t-2 ${
                  step.state === "done" ? "border-[#4ade80]/40" : "border-line"
                }`}
                aria-hidden
              />
            )}
          </div>
          <div className="min-w-0 pt-0.5 sm:pt-2">
            <p
              className={`text-xs font-semibold sm:text-sm ${
                step.state === "current" ? "text-cream" : step.state === "done" ? "text-muted" : "text-faint"
              }`}
            >
              {step.label}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
