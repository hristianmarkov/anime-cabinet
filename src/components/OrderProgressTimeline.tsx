import type { OrderPipeline, PipelineStep } from "@/lib/orderWorkflow";

function Step({ step, number }: { step: PipelineStep; number: number }) {
  return (
    <li className="relative z-10 flex min-w-24 flex-1 flex-col items-center text-center">
      <span
        aria-current={step.state === "current" ? "step" : undefined}
        className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold ${
          step.state === "done"
            ? "border-[#4ade80]/60 bg-[#173326] text-[#4ade80]"
            : step.state === "current"
              ? "border-accent bg-[#441827] text-accent ring-2 ring-accent/30"
              : "border-line bg-surface text-faint"
        }`}
      >
        {step.state === "done" ? "✓" : number}
      </span>
      <span
        className={`mt-3 text-xs font-semibold sm:text-sm ${
          step.state === "current" ? "text-cream" : step.state === "done" ? "text-muted" : "text-faint"
        }`}
      >
        {step.label}
      </span>
    </li>
  );
}

function HorizontalTrack({ steps, start }: { steps: PipelineStep[]; start: number }) {
  const edge = `${50 / steps.length}%`;
  return (
    <ol className="relative flex min-w-max items-start px-3">
      <div className="absolute top-[17px] h-0.5 bg-line" style={{ left: edge, right: edge }} aria-hidden />
      {steps.map((step, index) => <Step key={step.id} step={step} number={start + index} />)}
    </ol>
  );
}

export function OrderProgressTimeline({ pipeline }: { pipeline: OrderPipeline }) {
  const shipping = pipeline.branches.shipping;
  const mainSteps = [...pipeline.shared, ...pipeline.branches.digital];

  if (!shipping) {
    return (
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          <HorizontalTrack steps={mainSteps} start={1} />
        </div>
      </div>
    );
  }

  const branchStart = pipeline.shared.length + 1;
  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[720px]">
        <HorizontalTrack steps={mainSteps} start={1} />

        <div className="relative h-12" aria-hidden>
          <div className="absolute left-1/2 top-0 h-8 border-l-2 border-line" />
          <div className="absolute left-1/2 right-[8.333%] top-8 border-t-2 border-line" />
          <div className="absolute right-[8.333%] top-8 h-4 border-r-2 border-line" />
        </div>

        <div className="ml-auto w-1/2">
          <section aria-labelledby="timeline-shipping" className="px-3 pt-2">
            <h3 id="timeline-shipping" className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-muted">
              Print &amp; shipping
            </h3>
            <HorizontalTrack steps={shipping} start={branchStart} />
          </section>
        </div>
      </div>
    </div>
  );
}
