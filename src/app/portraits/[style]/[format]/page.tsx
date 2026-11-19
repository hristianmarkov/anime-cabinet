import { notFound } from "next/navigation";
import { PortraitPage, portraitMetadata } from "@/components/PortraitPage";
import { MERCHANT_PRINT_FORMATS } from "@/data/merchantPrints";
import { allStyles, getStyleBySlug } from "@/data/styles";

type Props = { params: Promise<{ style: string; format: string }> };

export function generateStaticParams() {
  return allStyles.flatMap(({ slug }) =>
    MERCHANT_PRINT_FORMATS.map(({ id }) => ({ style: slug, format: id }))
  );
}

async function getPrintPage(params: Props["params"]) {
  const { style: slug, format: id } = await params;
  const style = getStyleBySlug(slug);
  const format = MERCHANT_PRINT_FORMATS.find((option) => option.id === id);
  if (!style || !format) notFound();
  return { style, format };
}

export async function generateMetadata({ params }: Props) {
  const { style, format } = await getPrintPage(params);
  return portraitMetadata(style, format);
}

export default async function PrintVariantPage({ params }: Props) {
  const { style, format } = await getPrintPage(params);
  return <PortraitPage style={style} format={format} />;
}
