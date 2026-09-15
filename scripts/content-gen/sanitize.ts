/** Keywords that attract AI-tool seekers or wrong geo — not commission buyers. */
const BAD_KEYWORD =
  /\b(generator|ai avatar|photo to anime|turn photo into anime|anime filter|free portrait| australia\b|commission online)\b/i;

/** Character-search patterns from Ahrefs noise (people wanting that character drawn, not a custom portrait). */
const CHARACTER_NAME_KEYWORD =
  /\b(kakashi hatake|tanjiro kamado|ichigo kurosaki|madara uchiha|giyu tomioka|shinobu kocho|zenitsu agatsuma|mitsuri kanroji|muichiro tokito|doma demon|tsunade senju|jiraiya|gaara|rukia|satoru gojo|levi ackerman|itachi uchiha)\b/i;

export function sanitizeKeywords(keywords: string[], primary?: string): string[] {
  const cleaned = keywords
    .map((k) => k.trim())
    .filter((k) => k.length > 2 && k.length < 90)
    .filter((k) => !BAD_KEYWORD.test(k))
    .filter((k) => !CHARACTER_NAME_KEYWORD.test(k));

  if (primary) {
    const p = primary.trim();
    if (p && !cleaned.some((k) => k.toLowerCase() === p.toLowerCase())) {
      cleaned.unshift(p);
    }
  }

  return [...new Set(cleaned)].slice(0, 5);
}

export function sanitizeDescriptionParagraphs(paragraphs: string[]): string[] {
  return paragraphs
    .map((p) => p.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\s+/g, " ").trim())
    .filter((p) => {
      if (p.length < 40) return false;
      // FAQ blobs accidentally placed in description
      const questions = (p.match(/\?/g) || []).length;
      if (questions >= 3 && p.length > 350) return false;
      return true;
    })
    .slice(0, 3);
}

export function sanitizeFaqs(faqs: Array<{ q: string; a: string }>): Array<{ q: string; a: string }> {
  return faqs
    .map((f) => ({
      q: f.q.replace(/\*\*(.*?)\*\*/g, "$1").trim(),
      a: f.a.replace(/\*\*(.*?)\*\*/g, "$1").trim(),
    }))
    .filter((f) => f.q.length > 5 && f.a.length > 20)
    .slice(0, 4);
}
