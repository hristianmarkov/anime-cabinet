import { notFound } from "next/navigation";
import { PortraitPage, portraitMetadata } from "@/components/PortraitPage";
import { allStyles, getStyleBySlug } from "@/data/styles";

type Props = { params: Promise<{ style: string }> };

export function generateStaticParams() {
  return allStyles.map(({ slug }) => ({ style: slug }));
}

export async function generateMetadata({ params }: Props) {
  const { style: slug } = await params;
  const style = getStyleBySlug(slug);
  if (!style) notFound();
  return portraitMetadata(style);
}

export default async function StylePage({ params }: Props) {
  const { style: slug } = await params;
  const style = getStyleBySlug(slug);
  if (!style) notFound();
  return <PortraitPage style={style} />;
}
