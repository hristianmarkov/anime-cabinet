import { artAlt, artSrc } from "./art";

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | {
      type: "figure";
      file?: string;
      artFile?: string;
      caption?: string;
      layout?: "wide" | "inline-right" | "center";
      wide?: boolean;
    }
  | {
      type: "figureRow";
      files: { file: string; caption?: string }[];
    }
  | {
      type: "figurePair";
      left: { artFile: string; caption?: string };
      right: { artFile: string; caption?: string };
    }
  | {
      type: "imageGrid";
      images: { artFile: string; caption?: string }[];
      cols?: 2 | 3;
    }
  | {
      type: "beforeAfter";
      beforeFile: string;
      afterFile: string;
      caption?: string;
      styleName?: string;
    }
  | { type: "pullQuote"; text: string; attribution?: string }
  | { type: "stylePills"; slugs: string[]; intro?: string }
  | { type: "productShowcase"; slug: string; description?: string };

export interface RichBlogSection {
  heading?: string;
  blocks: BlogBlock[];
}

/** Legacy section shape — still supported */
export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  list?: string[];
  blocks?: BlogBlock[];
}

export function figure(
  file: string,
  caption?: string,
  layout: "wide" | "inline-right" | "center" = "wide"
): BlogBlock {
  return { type: "figure", file, caption, layout };
}

export function beforeAfter(
  slug: string,
  caption?: string,
  styleName?: string
): BlogBlock {
  return {
    type: "beforeAfter",
    beforeFile: `${slug}-before.jpg`,
    afterFile: `${slug}-after.jpg`,
    caption,
    styleName,
  };
}

export function productShowcase(slug: string, description?: string): BlogBlock {
  return { type: "productShowcase", slug, description };
}

export function resolveBlockImage(file: string) {
  return { src: artSrc(file), alt: artAlt(file) };
}

/** Coerce LLM / generated JSON block shapes into typed BlogBlock values. */
export function normalizeBlogBlock(raw: unknown): BlogBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const block = raw as Record<string, unknown>;
  const type = block.type;
  if (typeof type !== "string") return null;

  const textField = () => String(block.text ?? block.content ?? "").trim();

  switch (type) {
    case "paragraph":
    case "heading": {
      const text = textField();
      return text ? { type, text } : null;
    }
    case "list": {
      const items = Array.isArray(block.items)
        ? block.items.map((item) => String(item).trim()).filter(Boolean)
        : [];
      return items.length ? { type: "list", items } : null;
    }
    case "pullQuote": {
      const text = textField();
      return text
        ? {
            type: "pullQuote",
            text,
            attribution: block.attribution ? String(block.attribution) : undefined,
          }
        : null;
    }
    case "figure":
      return {
        type: "figure",
        file: block.file ? String(block.file) : undefined,
        artFile: block.artFile ? String(block.artFile) : undefined,
        caption: block.caption ? String(block.caption) : undefined,
        layout: block.layout as "wide" | "inline-right" | "center" | undefined,
        wide: block.wide as boolean | undefined,
      };
    case "figureRow":
      if (!Array.isArray(block.files)) return null;
      return {
        type: "figureRow",
        files: block.files.map((f) => {
          const entry = f as Record<string, unknown>;
          return {
            file: String(entry.file ?? ""),
            caption: entry.caption ? String(entry.caption) : undefined,
          };
        }),
      };
    case "figurePair":
      return block.left && block.right
        ? {
            type: "figurePair",
            left: block.left as Extract<BlogBlock, { type: "figurePair" }>["left"],
            right: block.right as Extract<BlogBlock, { type: "figurePair" }>["right"],
          }
        : null;
    case "imageGrid":
      if (!Array.isArray(block.images)) return null;
      return {
        type: "imageGrid",
        images: block.images as Extract<BlogBlock, { type: "imageGrid" }>["images"],
        cols: block.cols as 2 | 3 | undefined,
      };
    case "beforeAfter":
      return block.beforeFile && block.afterFile
        ? {
            type: "beforeAfter",
            beforeFile: String(block.beforeFile),
            afterFile: String(block.afterFile),
            caption: block.caption ? String(block.caption) : undefined,
            styleName: block.styleName ? String(block.styleName) : undefined,
          }
        : null;
    case "stylePills":
      if (!Array.isArray(block.slugs)) return null;
      return {
        type: "stylePills",
        slugs: block.slugs.map(String),
        intro: block.intro ? String(block.intro) : undefined,
      };
    case "productShowcase":
      return block.slug
        ? {
            type: "productShowcase",
            slug: String(block.slug),
            description: block.description ? String(block.description) : undefined,
          }
        : null;
    default:
      return null;
  }
}

export function normalizeBlogSections(sections: BlogSection[]): BlogSection[] {
  return sections.map((section) => {
    const blocks = (section.blocks ?? [])
      .map((block) => normalizeBlogBlock(block))
      .filter((block): block is BlogBlock => block !== null);
    return {
      ...section,
      paragraphs: section.paragraphs ?? [],
      ...(blocks.length ? { blocks } : {}),
    };
  });
}
