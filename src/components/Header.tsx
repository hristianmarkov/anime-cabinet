"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ProductsMenu } from "@/components/ProductsMenu";

const navLinks = [
  { href: "/#gallery", label: "Gallery" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const closeAll = () => {
    setOpen(false);
    setProductsOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Anime Cabinet home">
          <Image src="/logo.png" alt="Anime Cabinet logo" width={44} height={30} className="h-8 w-auto" priority />
          <span className="font-display text-lg tracking-wide text-cream">ANIME CABINET</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-cream"
              aria-expanded={productsOpen}
            >
              Products
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </button>
            {productsOpen && <ProductsMenu onNavigate={closeAll} />}
          </div>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-muted transition-colors hover:text-cream">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CurrencySelector />
          <Link
            href="/portraits"
            className="hidden rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-bright sm:block"
          >
            Get My Portrait
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md text-cream lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-ink-soft px-4 py-4 lg:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            <li>
              <button
                type="button"
                onClick={() => setMobileProductsOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-cream"
              >
                Products
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={mobileProductsOpen ? "rotate-180" : ""}>
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </button>
              {mobileProductsOpen && (
                <ProductsMenu variant="mobile" onNavigate={closeAll} />
              )}
            </li>
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={closeAll}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-cream"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link href="/portraits" onClick={closeAll} className="block rounded-full bg-accent px-5 py-2.5 text-center text-sm font-semibold text-white">
                Get My Portrait
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
