"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { blogPosts } from "@/data/blog";
import { getStyleBySlug } from "@/data/styles";

type Filter =
  | "all"
  | "articles"
  | "gift-guides"
  | "anime-guides"
  | "cartoon-guides";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All posts" },
  { id: "articles", label: "Articles" },
  { id: "gift-guides", label: "Gift guides" },
  { id: "anime-guides", label: "Anime guides" },
  { id: "cartoon-guides", label: "Cartoon guides" },
];

function PostCard({
  post,
  compact,
}: {
  post: (typeof blogPosts)[number];
  compact?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`flex flex-col rounded-2xl border border-line bg-surface shadow-card transition hover:border-line-bright ${
        compact ? "p-5" : "p-6"
      }`}
    >
      <h2 className={`font-semibold text-cream ${compact ? "text-base" : "text-lg"}`}>
        {post.title}
      </h2>
      <p className={`mt-2 flex-1 leading-relaxed text-muted ${compact ? "text-xs" : "text-sm"}`}>
        {post.description}
      </p>
      <p className="mt-4 text-xs text-faint">
        {new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        · {post.readingMinutes} min read
      </p>
    </Link>
  );
}

function matchesFilter(post: (typeof blogPosts)[number], filter: Filter): boolean {
  const isGiftGuide = post.slug.startsWith("best-gifts-for-");
  const style = getStyleBySlug(post.ctaStyle);

  switch (filter) {
    case "all":
      return true;
    case "articles":
      return !isGiftGuide;
    case "gift-guides":
      return isGiftGuide;
    case "anime-guides":
      return isGiftGuide && style?.category === "anime";
    case "cartoon-guides":
      return isGiftGuide && style?.category === "cartoon";
    default:
      return true;
  }
}

export function BlogIndexClient() {
  const [filter, setFilter] = useState<Filter>("all");

  const editorial = blogPosts.filter((p) => !p.slug.startsWith("best-gifts-for-"));
  const featured = editorial[0];

  const filtered = useMemo(
    () => blogPosts.filter((p) => matchesFilter(p, filter)),
    [filter]
  );

  const showFeatured = filter === "all" || filter === "articles";
  const gridPosts = showFeatured && featured
    ? filtered.filter((p) => p.slug !== featured.slug)
    : filtered;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:gap-12">
      {/* Sidebar filters */}
      <aside className="lg:w-52 lg:shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Filter</p>
        <nav className="mt-4 flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                filter === f.id
                  ? "bg-accent text-white"
                  : "border border-line bg-surface text-muted hover:border-line-bright hover:text-cream"
              }`}
            >
              {f.label}
              {f.id !== "all" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({blogPosts.filter((p) => matchesFilter(p, f.id)).length})
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Posts */}
      <div className="min-w-0 flex-1">
        {showFeatured && featured && (filter === "all" || filter === "articles") && (
          <Link
            href={`/blog/${featured.slug}`}
            className="block rounded-2xl border border-line bg-surface p-8 shadow-card transition hover:border-line-bright"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Featured
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-cream">{featured.title}</h2>
            <p className="mt-3 leading-relaxed text-muted">{featured.description}</p>
            <p className="mt-4 text-xs text-faint">
              {new Date(featured.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · {featured.readingMinutes} min read
            </p>
          </Link>
        )}

        {gridPosts.length === 0 ? (
          <p className="mt-8 text-center text-muted">No posts match this filter.</p>
        ) : (
          <div className={`grid gap-4 sm:grid-cols-2 ${showFeatured && featured ? "mt-8" : ""}`}>
            {gridPosts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                compact={post.slug.startsWith("best-gifts-for-")}
              />
            ))}
          </div>
        )}

        <p className="mt-8 text-sm text-faint">
          Showing {filtered.length} of {blogPosts.length} posts
        </p>
      </div>
    </div>
  );
}
