import { OrderProgressTimeline } from "@/components/OrderProgressTimeline";
import type { OrderPipeline as OrderPipelineModel } from "@/lib/orderWorkflow";

export function OrderPipeline({ steps }: { steps: OrderPipelineModel }) {
  return <OrderProgressTimeline pipeline={steps} />;
}
