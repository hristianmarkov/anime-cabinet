"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { PortraitStyle } from "@/data/types";
import { useCurrency } from "@/context/CurrencyContext";
import {
  BACKGROUND_OPTIONS,
  EXPEDITED_PRICE,
  EXTRA_CHARACTER_PRICE,
  MAX_CHARACTERS,
  PRINT_CATEGORIES,
  PRINT_SIZES,
  calcTotal,
  formatIdFromCategory,
  isPrintFormat,
  resolvePrintAddOn,
  type PrintCategory,
  type PrintSize,
  type ShippingOption,
} from "@/data/pricing";
import type { ShippingAddress } from "@/lib/schema";
import { site } from "@/data/site";

const MAX_FILES = 8;
const MAX_FILE_MB = 15;

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "IE", name: "Ireland" },
];

export function OrderConfigurator({ style }: { style: PortraitStyle }) {
  const { currency, formatPrice } = useCurrency();
  const [characters, setCharacters] = useState(1);
  const [background, setBackground] = useState(BACKGROUND_OPTIONS[0].id);
  const [printCategory, setPrintCategory] = useState<PrintCategory>("digital");
  const [printSize, setPrintSize] = useState<PrintSize>("12x18");
  const formatId = formatIdFromCategory(printCategory, printSize);
  const [expedited, setExpedited] = useState(false);
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [shipFirst, setShipFirst] = useState("");
  const [shipLast, setShipLast] = useState("");
  const [shipLine1, setShipLine1] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipPost, setShipPost] = useState("");
  const [shipCountry, setShipCountry] = useState("US");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [gelatoQuoteId, setGelatoQuoteId] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [printPrices, setPrintPrices] = useState<Record<string, number>>({});
  const [printPricesLoading, setPrintPricesLoading] = useState(false);

  const needsShipping = isPrintFormat(formatId);
  const shippingUsd = selectedShipping?.priceUsd ?? 0;
  const printAddOnUsd = resolvePrintAddOn(formatId, printPrices);

  const total = useMemo(
    () =>
      calcTotal({
        basePrice: style.priceFrom,
        characters,
        formatId,
        expedited,
        shippingUsd,
        printAddOnUsd,
      }),
    [style.priceFrom, characters, formatId, expedited, shippingUsd, printAddOnUsd]
  );

  const fetchPrintPrices = useCallback(async (country: string) => {
    setPrintPricesLoading(true);
    try {
      const res = await fetch(`/api/gelato/prices?country=${encodeURIComponent(country)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.prices) setPrintPrices(data.prices);
    } catch {
      /* keep static fallback prices */
    } finally {
      setPrintPricesLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPrintPrices(shipCountry), 300);
    return () => clearTimeout(t);
  }, [shipCountry, fetchPrintPrices]);

  const fetchShipping = useCallback(async () => {
    if (!needsShipping) {
      setShippingOptions([]);
      setSelectedShipping(null);
      setGelatoQuoteId(null);
      return;
    }
    if (!shipFirst || !shipLast || !shipLine1 || !shipCity || !shipPost || !shipCountry) return;

    setShippingLoading(true);
    setError(null);
    try {
      const recipient: ShippingAddress = {
        firstName: shipFirst,
        lastName: shipLast,
        addressLine1: shipLine1,
        city: shipCity,
        postCode: shipPost,
        country: shipCountry,
      };
      const res = await fetch("/api/gelato/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formatId, currency, recipient }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Shipping quote failed");

      const opts: ShippingOption[] = data.methods.map(
        (m: { uid: string; name: string; priceUsd: number; minDays?: number; maxDays?: number }) => ({
          uid: m.uid,
          name: m.name,
          priceUsd: m.priceUsd,
          minDays: m.minDays ?? 5,
          maxDays: m.maxDays ?? 10,
        })
      );
      setShippingOptions(opts);
      setGelatoQuoteId(data.quoteId);
      setSelectedShipping(opts[0] ?? null);
      if (typeof data.printAddOnUsd === "number") {
        setPrintPrices((prev) => ({ ...prev, [formatId]: data.printAddOnUsd }));
      }
    } catch (e) {
      setShippingOptions([]);
      setSelectedShipping(null);
      setError(e instanceof Error ? e.message : "Could not load shipping rates");
    } finally {
      setShippingLoading(false);
    }
  }, [
    needsShipping,
    shipFirst,
    shipLast,
    shipLine1,
    shipCity,
    shipPost,
    shipCountry,
    formatId,
    currency,
  ]);

  useEffect(() => {
    const t = setTimeout(fetchShipping, 600);
    return () => clearTimeout(t);
  }, [fetchShipping]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const next = [...files];
    for (const file of Array.from(list)) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload image files only (JPG, PNG, HEIC, WebP).");
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`"${file.name}" is over ${MAX_FILE_MB}MB.`);
        continue;
      }
      if (next.length < MAX_FILES) next.push(file);
    }
    setFiles(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError("Please upload at least one photo.");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (needsShipping && !selectedShipping) {
      setError("Please enter your shipping address and select a shipping method.");
      return;
    }

    setSubmitting(true);
    try {
      setProgress("Uploading your photos...");
      const photoUrls: string[] = [];
      for (const file of files) {
        const blob = await upload(
          `orders/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`,
          file,
          { access: "public", handleUploadUrl: "/api/blob-upload" }
        );
        photoUrls.push(blob.url);
      }

      setProgress("Preparing secure checkout...");
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleSlug: style.slug,
          characters,
          background,
          formatId,
          notes,
          email,
          photoUrls,
          expedited,
          currency,
          shippingAddress: needsShipping
            ? {
                firstName: shipFirst,
                lastName: shipLast,
                addressLine1: shipLine1,
                city: shipCity,
                postCode: shipPost,
                country: shipCountry,
              }
            : null,
          shippingMethodUid: selectedShipping?.uid,
          shippingMethodName: selectedShipping?.name,
          shippingAmountUsd: shippingUsd,
          gelatoQuoteId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
      setProgress(null);
    }
  }

  function formatAddOn(category: PrintCategory, size: PrintSize): number {
    const id = formatIdFromCategory(category, size);
    return resolvePrintAddOn(id, printPrices);
  }

  const inputBase =
    "w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream placeholder:text-faint focus:border-accent focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h2 className="font-display text-2xl text-cream">Build Your Portrait</h2>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-cream">
          Number of characters{" "}
          <span className="font-normal text-faint">
            (+{formatPrice(EXTRA_CHARACTER_PRICE)} each after the first)
          </span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: MAX_CHARACTERS }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCharacters(n)}
              aria-pressed={characters === n}
              className={`h-11 w-11 rounded-xl border text-sm font-semibold transition ${
                characters === n
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-ink text-muted hover:border-line-bright"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-cream">Background</legend>
        <div className="mt-3 grid gap-2">
          {BACKGROUND_OPTIONS.map((b) => (
            <label
              key={b.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                background === b.id ? "border-accent bg-ink" : "border-line bg-ink"
              }`}
            >
              <input
                type="radio"
                name="background"
                value={b.id}
                checked={background === b.id}
                onChange={() => setBackground(b.id)}
                className="mt-1 accent-[#ff3860]"
              />
              <span>
                <span className="block text-sm font-semibold text-cream">{b.label}</span>
                <span className="block text-xs text-muted">{b.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-cream">Format</legend>

        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-faint">
          Print type
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRINT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setPrintCategory(cat.id)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                printCategory === cat.id
                  ? "border-accent bg-accent/10"
                  : "border-line bg-ink hover:border-line-bright"
              }`}
            >
              <span className="block text-sm font-semibold text-cream">{cat.label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                {cat.id === "digital"
                  ? "Included"
                  : `+${formatPrice(formatAddOn(cat.id, printSize))}`}
              </span>
            </button>
          ))}
        </div>

        {printCategory !== "digital" && (
          <>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-faint">
              Size
            </p>
            <div className="mt-2 flex gap-2">
              {PRINT_SIZES.map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => setPrintSize(sz.id)}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    printSize === sz.id
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-ink text-muted hover:border-line-bright"
                  }`}
                >
                  {sz.label}
                  <span className="mt-0.5 block text-[11px] font-normal opacity-80">
                    +{formatPrice(formatAddOn(printCategory, sz.id))}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              {printPricesLoading
                ? "Loading print prices for your country…"
                : "Print prices and shipping depend on your country."}
            </p>
          </>
        )}
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-cream">Delivery</legend>
        <p className="mt-1 text-sm text-muted">
          Our artists will provide the image within {site.deliveryHours} hours.
        </p>
        <label
          className={`mt-4 flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
            expedited
              ? "border-accent bg-accent/5 shadow-[0_0_0_1px_rgba(255,56,96,0.3)]"
              : "border-line bg-ink hover:border-line-bright"
          }`}
        >
          <input
            type="checkbox"
            checked={expedited}
            onChange={(e) => setExpedited(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded accent-[#ff3860]"
          />
          <span className="flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-cream">Priority order</span>
              <span className="rounded-full bg-flame/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-flame">
                {site.expeditedHours}h turnaround
              </span>
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-muted">
              Jump the queue — your portrait moves to the front. Perfect for last-minute gifts.
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-cream">
            +{formatPrice(EXPEDITED_PRICE)}
          </span>
        </label>
      </fieldset>

      {needsShipping && (
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-cream">Shipping address</legend>
          <p className="mt-1 text-xs text-muted">We ship prints worldwide. Shipping cost depends on your country.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input placeholder="First name" value={shipFirst} onChange={(e) => setShipFirst(e.target.value)} className={inputBase} required />
            <input placeholder="Last name" value={shipLast} onChange={(e) => setShipLast(e.target.value)} className={inputBase} required />
            <input placeholder="Address line 1" value={shipLine1} onChange={(e) => setShipLine1(e.target.value)} className={`${inputBase} sm:col-span-2`} required />
            <input placeholder="City" value={shipCity} onChange={(e) => setShipCity(e.target.value)} className={inputBase} required />
            <input placeholder="Postcode / ZIP" value={shipPost} onChange={(e) => setShipPost(e.target.value)} className={inputBase} required />
            <select value={shipCountry} onChange={(e) => setShipCountry(e.target.value)} className={inputBase} required>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          {shippingLoading && <p className="mt-2 text-xs text-muted">Loading shipping rates…</p>}
          {shippingOptions.length > 0 && (
            <div className="mt-4 grid gap-2">
              <p className="text-xs font-semibold text-cream">Shipping method</p>
              {shippingOptions.map((opt) => (
                <label key={opt.uid} className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${selectedShipping?.uid === opt.uid ? "border-accent bg-ink" : "border-line bg-ink"}`}>
                  <span className="flex items-center gap-2">
                    <input type="radio" checked={selectedShipping?.uid === opt.uid} onChange={() => setSelectedShipping(opt)} className="accent-[#ff3860]" />
                    <span className="text-sm text-cream">{opt.name}</span>
                    <span className="text-xs text-faint">{opt.minDays}–{opt.maxDays} days</span>
                  </span>
                  <span className="text-sm font-semibold text-cream">{formatPrice(opt.priceUsd)}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      )}

      <div className="mt-6">
        <label className="text-sm font-semibold text-cream" htmlFor="photo-upload">Your photos</label>
        <input ref={fileInputRef} id="photo-upload" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-3 flex w-full flex-col items-center rounded-xl border-2 border-dashed border-line-bright bg-ink px-4 py-8 hover:border-accent">
          <span className="text-sm font-semibold text-cream">Click to upload photos</span>
        </button>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex justify-between rounded-lg border border-line bg-ink px-3 py-2 text-sm text-muted">
                <span className="truncate">{f.name}</span>
                <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-xs text-accent">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-cream" htmlFor="order-notes">Notes for our artists</label>
        <textarea id="order-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Outfits, poses, background details…" className={`mt-3 ${inputBase} resize-y`} />
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-cream" htmlFor="order-email">Delivery email</label>
        <input id="order-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`mt-3 ${inputBase}`} />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-bright">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-faint">Total</p>
          <p className="font-display text-3xl text-cream">{formatPrice(total)}</p>
        </div>
        <button type="submit" disabled={submitting} className="rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-glow hover:bg-accent-bright disabled:opacity-60">
          {submitting ? progress ?? "Processing..." : "Checkout Securely"}
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-faint">Secure payment by Stripe · Unlimited free revisions</p>
    </form>
  );
}
