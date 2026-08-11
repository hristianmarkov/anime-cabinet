import Link from "next/link";
import { animeStyles, bestSellers, cartoonStyles } from "@/data/styles";

const featuredLinks = [
  { href: "/portraits/one-piece-wanted-poster", label: "Wanted Poster" },
  { href: "/portraits/demon-slayer", label: "Demon Slayer" },
  { href: "/portraits#bestsellers", label: "Best Sellers" },
];

interface ProductsMenuProps {
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}

export function ProductsMenu({ onNavigate, variant = "desktop" }: ProductsMenuProps) {
  const topAnime = animeStyles.slice(0, 8);
  const topCartoon = cartoonStyles.slice(0, 6);

  if (variant === "mobile") {
    return (
      <div className="space-y-4 border-t border-line pt-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-faint">
          Featured
        </p>
        {featuredLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className="block px-3 py-1.5 text-sm text-muted hover:text-cream"
          >
            {l.label}
          </Link>
        ))}
        <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-faint">
          Anime
        </p>
        {topAnime.map((s) => (
          <Link
            key={s.slug}
            href={`/portraits/${s.slug}`}
            onClick={onNavigate}
            className="block px-3 py-1.5 text-sm text-muted hover:text-cream"
          >
            {s.name}
          </Link>
        ))}
        <Link href="/portraits#anime" onClick={onNavigate} className="block px-3 py-1.5 text-sm font-semibold text-accent">
          All anime styles →
        </Link>
        <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-faint">
          Cartoons
        </p>
        {topCartoon.map((s) => (
          <Link
            key={s.slug}
            href={`/portraits/${s.slug}`}
            onClick={onNavigate}
            className="block px-3 py-1.5 text-sm text-muted hover:text-cream"
          >
            {s.name}
          </Link>
        ))}
        <Link href="/portraits#cartoons" onClick={onNavigate} className="block px-3 py-1.5 text-sm font-semibold text-accent">
          All cartoon styles →
        </Link>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-full z-50 w-[640px] rounded-2xl border border-line bg-ink-soft p-6 shadow-card">
      <div className="mb-4 flex gap-3 border-b border-line pb-4">
        {featuredLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent hover:bg-surface-raised"
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-faint">Anime</p>
          <ul className="mt-3 space-y-2">
            {topAnime.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/portraits/${s.slug}`}
                  onClick={onNavigate}
                  className="text-sm text-muted hover:text-cream"
                >
                  {s.productName}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/portraits#anime" onClick={onNavigate} className="mt-3 inline-block text-xs font-semibold text-accent">
            View all anime →
          </Link>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-faint">Cartoons</p>
          <ul className="mt-3 space-y-2">
            {topCartoon.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/portraits/${s.slug}`}
                  onClick={onNavigate}
                  className="text-sm text-muted hover:text-cream"
                >
                  {s.productName}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/portraits#cartoons" onClick={onNavigate} className="mt-3 inline-block text-xs font-semibold text-accent">
            View all cartoons →
          </Link>
        </div>
      </div>
      <div className="mt-4 border-t border-line pt-4">
        <p className="text-xs text-faint">
          Best sellers:{" "}
          {bestSellers.slice(0, 3).map((s, i) => (
            <span key={s.slug}>
              {i > 0 && " · "}
              <Link href={`/portraits/${s.slug}`} onClick={onNavigate} className="text-muted hover:text-cream">
                {s.name}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
