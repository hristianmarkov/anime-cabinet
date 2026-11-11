import Link from "next/link";
import type { ReactNode } from "react";

/** Render our editorial link syntax without accepting raw HTML or unsafe URLs. */
export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const links = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  for (const match of text.matchAll(links)) {
    parts.push(text.slice(lastIndex, match.index));
    const [source, label, href] = match;
    const className = "text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-bright";
    if (href.startsWith("/") && !href.startsWith("//")) {
      parts.push(<Link key={match.index} href={href} className={className}>{label}</Link>);
    } else if (/^https?:\/\//i.test(href)) {
      parts.push(<a key={match.index} href={href} className={className}>{label}</a>);
    } else {
      parts.push(label);
    }
    lastIndex = match.index + source.length;
  }
  parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}
