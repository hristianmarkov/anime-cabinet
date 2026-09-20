import { parseFormatId } from "@/data/pricing";

/** Structured art direction from OpenAI; assembled into one generation prompt in code. */
export interface StructuredArtDirection {
  openingLikeness: string;
  referenceUsage: string;
  humanSubjects: string;
  likenessAndIdentity: string;
  mustRemoveOrAvoid: string;
  outfitsCharacterTreatment: string;
  styleVisuals: string;
  background: string;
  compositionAndPrint: string;
  exclusions: string;
}

export function assembleArtPromptFromStructured(parts: StructuredArtDirection): string {
  const blocks = [
    parts.openingLikeness,
    parts.referenceUsage,
    parts.humanSubjects,
    parts.likenessAndIdentity,
    parts.mustRemoveOrAvoid,
    parts.outfitsCharacterTreatment,
    parts.styleVisuals,
    parts.background,
    parts.compositionAndPrint,
    parts.exclusions,
  ]
    .map((b) => b.trim())
    .filter(Boolean);
  return blocks.join("\n\n");
}

export function parseStructuredArtDirection(raw: unknown): StructuredArtDirection | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const pick = (key: keyof StructuredArtDirection) =>
    typeof o[key] === "string" ? (o[key] as string).trim() : "";

  const structured: StructuredArtDirection = {
    openingLikeness: pick("openingLikeness"),
    referenceUsage: pick("referenceUsage"),
    humanSubjects: pick("humanSubjects"),
    likenessAndIdentity: pick("likenessAndIdentity"),
    mustRemoveOrAvoid: pick("mustRemoveOrAvoid"),
    outfitsCharacterTreatment: pick("outfitsCharacterTreatment"),
    styleVisuals: pick("styleVisuals"),
    background: pick("background"),
    compositionAndPrint: pick("compositionAndPrint"),
    exclusions: pick("exclusions"),
  };

  if (!structured.openingLikeness && !structured.referenceUsage) {
    return null;
  }
  return structured;
}

/** Fallback when model returns legacy `{ prompt }` only. */
export function legacyPromptToStructured(prompt: string): StructuredArtDirection {
  return {
    openingLikeness: prompt.trim(),
    referenceUsage: "",
    humanSubjects: "",
    likenessAndIdentity: "",
    mustRemoveOrAvoid: "",
    outfitsCharacterTreatment: "",
    styleVisuals: "",
    background: "",
    compositionAndPrint: "",
    exclusions: "",
  };
}

export function printCompositionHint(formatId: string, customerNotes: string): string | null {
  const notes = customerNotes.toLowerCase();
  if (notes.includes("16x20") || notes.includes("16×20") || notes.includes("20x16")) {
    return (
      "Customer mentioned 16×20 — compose for 5:4 landscape (20×16 inches). " +
      "Keep both subjects inside the frame with generous safe margins around heads, hair, limbs, auras, and key background elements; do not crop important features at the edges."
    );
  }

  const landscape =
    notes.includes("landscape") ||
    notes.includes("horizontal") ||
    notes.includes("wide format");

  if (formatId === "digital" && !landscape) {
    return null;
  }

  const { size } = parseFormatId(formatId);
  const [shortSide, longSide] = size.split("x").map(Number);

  if (landscape) {
    const ratio = `${longSide}:${shortSide}`;
    return (
      `Compose for ${ratio} landscape (${longSide}×${shortSide} inches). ` +
      "Generous safe margins around subjects and important effects; avoid edge cropping of faces, hair, limbs, or auras."
    );
  }

  if (formatId !== "digital") {
    return (
      `Order print format ${shortSide}×${longSide} inches (portrait, aspect ${shortSide}:${longSide}). ` +
      "Generous safe margins; do not crop important features at the edges."
    );
  }

  return null;
}
