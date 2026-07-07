import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { animeStyles, cartoonStyles } from "@/data/styles";

const popularAnime = animeStyles.slice(0, 8);
const popularCartoon = cartoonStyles.slice(0, 6);

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-soft">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Anime Cabinet logo" width={44} height={30} className="h-8 w-auto" />
              <span className="font-display text-lg text-cream">ANIME CABINET</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Custom anime and cartoon portraits from your photos by our
              professional artist team. Unlimited revisions, delivered in{" "}
              {site.deliveryHours} hours.
            </p>
            <p className="mt-4 text-sm text-faint">
              <Link href="/contact" className="hover:text-cream">
                Contact us
              </Link>
            </p>
          </div>

          <nav aria-label="Anime styles">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cream">
              Anime Styles
            </h3>
            <ul className="mt-4 space-y-2.5">
              {popularAnime.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/portraits/${s.slug}`}
                    className="text-sm text-muted transition-colors hover:text-cream"
                  >
                    {s.productName}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Cartoon styles">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cream">
              Cartoon Styles
            </h3>
            <ul className="mt-4 space-y-2.5">
              {popularCartoon.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/portraits/${s.slug}`}
                    className="text-sm text-muted transition-colors hover:text-cream"
                  >
                    {s.productName}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/portraits" className="text-sm font-medium text-accent hover:text-accent-bright">
                  View all 30+ styles →
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cream">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                ["/how-it-works", "How It Works"],
                ["/reviews", "Reviews"],
                ["/faq", "FAQs"],
                ["/about", "About Us"],
                ["/blog", "Blog"],
                ["/contact", "Contact"],
                ["/shipping", "Shipping & Delivery"],
                ["/refund-policy", "Refunds & Revisions"],
                ["/privacy-policy", "Privacy Policy"],
                ["/terms", "Terms of Service"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted transition-colors hover:text-cream">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <p className="text-xs leading-relaxed text-faint">
            Anime Cabinet is a fan-art commission studio. We are in no way
            associated with, authorized, or endorsed by any anime studio,
            broadcaster, or rights holder — including but not limited to Shueisha,
            Toei Animation, Studio Ghibli, The Pokemon Company, Fox Broadcasting
            Company, or their affiliates. All portraits are original, hand-drawn
            works inspired by animation art styles, created for personal use by
            fans, for fans.
          </p>
          <p className="mt-4 text-xs text-faint">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
