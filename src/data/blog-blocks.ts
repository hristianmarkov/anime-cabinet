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
  | { type: "stylePills"; slugs: string[]; intro?: string };

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

export function resolveBlockImage(file: string) {
  return { src: artSrc(file), alt: artAlt(file) };
}
