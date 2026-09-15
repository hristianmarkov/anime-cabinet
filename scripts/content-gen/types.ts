import type { LayoutId } from "../../content-schema/layouts";

export type Priority = "P0" | "P1" | "P2";

export interface PageEntry {
  url: string;
  layout: LayoutId;
  slug: string;
  styleSlug?: string;
  priority: Priority;
  fallbackFile?: string;
  category?: string;
}

export interface PagesRegistry {
  generatedAt: string;
  pages: PageEntry[];
}

export interface KeywordResearch {
  seed: string;
  country: string;
  ideas: Array<{ keyword: string; difficulty?: number; volume?: number }>;
  difficulty: {
    keyword: string;
    difficulty: number;
    serp: Array<{
      title: string;
      url: string;
      position: number;
      domainRating?: number;
      traffic?: number;
    }>;
  } | null;
}

export interface CompetitorAnalysis {
  url: string;
  wordCount: number;
  headings: string[];
  intent: "product" | "gift-guide" | "how-to" | "comparison" | "other";
  excerpt: string;
}

export interface BriefSlot {
  name: string;
  instruction: string;
}

export interface ContentBrief {
  url: string;
  slug: string;
  layout: LayoutId;
  styleSlug?: string;
  generatedAt: string;
  keywords: {
    primary: string;
    onPage: string[];
    sendElsewhere: string[];
  };
  wordCount: { min: number; target: number; max: number };
  serp: KeywordResearch["difficulty"];
  competitors: CompetitorAnalysis[];
  geoQueries: string[];
  outline: string[];
  slots: BriefSlot[];
  uniqueAngle: string;
  cannibalization: Array<{ url: string; note: string }>;
}

export interface ContentDraft {
  url: string;
  slug: string;
  layout: LayoutId;
  generatedAt: string;
  model: string;
  slots: Record<string, unknown>;
}
