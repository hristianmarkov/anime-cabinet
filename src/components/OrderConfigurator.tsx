"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { PortraitStyle } from "@/data/types";
import { formatCurrencyAmount } from "@/data/currencies";
import { isCompleteShippingAddress, requiresShippingState } from "@/data/shipping";
import { useCurrency } from "@/context/CurrencyContext";
import {
  EXPEDITED_PRICE,
  EXTRA_CHARACTER_PRICE,
  MAX_CHARACTERS,
  PRINT_CATEGORIES,
  PRINT_SIZES,
  formatDeliveryEstimate,
  formatPrintSize,
  orderTotalCents,
  formatIdFromCategory,
  isPrintFormat,
  type PrintQuote,
  type PrintCategory,
  type PrintSize,
} from "@/data/pricing";
import type { ShippingAddress } from "@/lib/schema";
import { site } from "@/data/site";
import {
  AnalyticsEvents,
  trackBeginCheckout,
  trackFunnel,
  trackViewItem,
} from "@/lib/analytics";

const MAX_FILES = 8;
const MAX_FILE_MB = 15;
const DEFAULT_LOCALE = "en-US";

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
  const [printCategory, setPrintCategory] = useState<PrintCategory>("digital");
  const [printSize, setPrintSize] = useState<PrintSize>("12x16");
  const formatId = formatIdFromCategory(printCategory, printSize);
  const [expedited, setExpedited] = useState(false);
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosTracked = useRef(false);
  const productViewTracked = useRef(false);

  const [shipFirst, setShipFirst] = useState("");
  const [shipLast, setShipLast] = useState("");
  const [shipLine1, setShipLine1] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipPost, setShipPost] = useState("");
  const [shipCountry, setShipCountry] = useState("");
  const [shipState, setShipState] = useState("");
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [prices, setPrices] = useState<{
    key: string;
    values: Partial<Record<string, number>>;
  } | null>(null);
  const [quoteResult, setQuoteResult] = useState<{
    key: string;
    quote?: PrintQuote;
    error?: string;
  } | null>(null);
  const [selectedShippingUid, setSelectedShippingUid] = useState<string | null>(null);
  const [quoteRevision, setQuoteRevision] = useState(0);

  const needsShipping = isPrintFormat(formatId);
  const stateRequired = requiresShippingState(shipCountry);
  const recipient = useMemo<ShippingAddress>(() => ({
    firstName: shipFirst.trim(),
    lastName: shipLast.trim(),
    addressLine1: shipLine1.trim(),
    city: shipCity.trim(),
    postCode: shipPost.trim(),
    country: shipCountry,
    state: stateRequired ? shipState.trim() : undefined,
  }), [shipFirst, shipLast, shipLine1, shipCity, shipPost, shipCountry, shipState, stateRequired]);
  const canQuote = needsShipping && isCompleteShippingAddress(recipient);
  const priceKey = `${shipCountry}:${currency}`;
  const currentPrices = prices?.key === priceKey ? prices.values : undefined;
  const quoteKey = JSON.stringify([formatId, currency, recipient, quoteRevision]);
  const currentResult = canQuote && quoteResult?.key === quoteKey ? quoteResult : null;
  const quote = currentResult?.quote;
  const shippingOptions = quote?.methods ?? [];
  const selectedShipping =
    shippingOptions.find((option) => option.uid === selectedShippingUid) ?? shippingOptions[0];
  const printPriceCents = quote?.printPriceCents ?? currentPrices?.[formatId];
  const totalCents = orderTotalCents({
    basePrice: style.priceFrom,
    characters,
    currency,
    expedited,
    printPriceCents,
    shippingCents: selectedShipping?.priceCents,
  });
  const total = totalCents / 100;
  const sizeCountry = shipCountry || new Intl.Locale(locale).maximize().region || "US";

  useEffect(() => {
    const browserLocale = new Intl.Locale(navigator.language || DEFAULT_LOCALE);
    const region = browserLocale.maximize().region;
    const defaultCountry = COUNTRIES.find((country) => country.code === region) ?? COUNTRIES[0];
    setLocale(browserLocale.toString());
    setShipCountry((selected) => selected || defaultCountry.code);
  }, []);

  useEffect(() => {
    if (!shipCountry) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ country: shipCountry, currency });

    async function loadPrices() {
      let values: Partial<Record<string, number>> = {};
      try {
        const res = await fetch(`/api/gelato/prices?${query}`, { signal: controller.signal });
        if (res.ok) values = (await res.json()).prices;
      } catch {
        // Prices stay unavailable when the request fails.
      }
      if (!controller.signal.aborted) setPrices({ key: priceKey, values });
    }

    void loadPrices();
    return () => controller.abort();
  }, [shipCountry, currency, priceKey]);

  useEffect(() => {
    if (!canQuote) return;
    const controller = new AbortController();

    async function loadQuote() {
      try {
        const res = await fetch("/api/gelato/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formatId, currency, recipient }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Shipping quote failed");
        if (!controller.signal.aborted) setQuoteResult({ key: quoteKey, quote: data });
      } catch (error) {
        if (!controller.signal.aborted) {
          setQuoteResult({
            key: quoteKey,
            error: error instanceof Error ? error.message : "Could not load shipping rates",
          });
        }
      }
    }

    const timer = setTimeout(loadQuote, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [canQuote, quoteKey, formatId, currency, recipient]);

  useEffect(() => {
    if (productViewTracked.current) return;
    productViewTracked.current = true;
    trackViewItem(
      {
        item_id: style.slug,
        item_name: style.productName,
        item_category: style.category,
        price: style.priceFrom,
      },
      total,
      currency
    );
  }, [style.slug, style.productName, style.category, style.priceFrom, total, currency]);

  useEffect(() => {
    if (files.length === 0 || photosTracked.current) return;
    photosTracked.current = true;
    trackFunnel(AnalyticsEvents.addPhotos, {
      item_id: style.slug,
      photo_count: files.length,
    });
  }, [files.length, style.slug]);

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
    if (needsShipping && (!quote || !selectedShipping)) {
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
          formatId,
          notes,
          email,
          photoUrls,
          expedited,
          currency,
          shippingAddress: needsShipping ? recipient : null,
          shippingMethodUid: selectedShipping?.uid,
          shippingCents: selectedShipping?.priceCents,
          printPriceCents: quote?.printPriceCents,
        }),
      });

      const data = await res.json();
      if (res.status === 409) setQuoteRevision((revision) => revision + 1);
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.");
      }
      trackBeginCheckout({
        value: total,
        currency,
        characters,
        format_id: formatId,
        item: {
          item_id: style.slug,
          item_name: style.productName,
          item_category: formatId,
          price: total,
        },
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
      setProgress(null);
    }
  }

  function formatCents(cents: number) {
    return formatCurrencyAmount(cents / 100, currency);
  }

  function formatAddOn(category: PrintCategory, size: PrintSize) {
    const id = formatIdFromCategory(category, size);
    const cents = id === formatId ? printPriceCents : currentPrices?.[id];
    if (cents != null) return `+${formatCents(cents)}`;
    return currentPrices ? "Price unavailable" : "Loading price…";
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
        <legend className="text-sm font-semibold text-cream">Format</legend>

        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-faint">
          Print type
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRINT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              aria-pressed={printCategory === cat.id}
              onClick={() => setPrintCategory(cat.id)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                printCategory === cat.id
                  ? "border-accent bg-accent/10"
                  : "border-line bg-ink hover:border-line-bright"
              }`}
            >
              <span className="block text-sm font-semibold text-cream">{cat.label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                {cat.id === "digital" ? "Included" : formatAddOn(cat.id, printSize)}
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
                  key={sz}
                  type="button"
                  aria-pressed={printSize === sz}
                  onClick={() => setPrintSize(sz)}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    printSize === sz
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-ink text-muted hover:border-line-bright"
                  }`}
                >
                  {formatPrintSize(sz, sizeCountry, locale)}
                  <span className="mt-0.5 block text-[11px] font-normal opacity-80">
                    {formatAddOn(printCategory, sz)}
                  </span>
                </button>
              ))}
            </div>
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
          <p className="mt-1 text-xs text-muted">Print prices are based on the shipping country. Enter your address to see shipping rates.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input placeholder="First name" value={shipFirst} onChange={(e) => setShipFirst(e.target.value)} className={inputBase} required />
            <input placeholder="Last name" value={shipLast} onChange={(e) => setShipLast(e.target.value)} className={inputBase} required />
            <input placeholder="Address line 1" value={shipLine1} onChange={(e) => setShipLine1(e.target.value)} className={`${inputBase} sm:col-span-2`} required />
            <input placeholder="City" value={shipCity} onChange={(e) => setShipCity(e.target.value)} className={inputBase} required />
            <input placeholder="Postcode / ZIP" value={shipPost} onChange={(e) => setShipPost(e.target.value)} className={inputBase} required />
            <select
              id="shipping-country"
              aria-label="Shipping country"
              autoComplete="country"
              value={shipCountry}
              onChange={(event) => {
                setShipCountry(event.target.value);
                setShipState("");
              }}
              className={inputBase}
              required
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
            {stateRequired && (
              <input placeholder="State / province" aria-label="State / province" autoComplete="address-level1" value={shipState} onChange={(e) => setShipState(e.target.value)} className={inputBase} required />
            )}
          </div>
          {canQuote && !currentResult && <p className="mt-2 text-xs text-muted">Loading shipping rates…</p>}
          {currentResult?.error && (
            <p role="alert" className="mt-2 text-xs text-accent-bright">
              {currentResult.error}{" "}
              <button type="button" className="underline" onClick={() => setQuoteRevision((revision) => revision + 1)}>
                Retry quote
              </button>
            </p>
          )}
          {quote && shippingOptions.length === 0 && (
            <p className="mt-2 text-xs text-muted">Gelato has no shipping options for this address and print size.</p>
          )}
          {shippingOptions.length > 0 && (
            <div className="mt-4 grid gap-2">
              <p className="text-xs font-semibold text-cream">Shipping method</p>
              {shippingOptions.map((opt) => (
                <label key={opt.uid} className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${selectedShipping?.uid === opt.uid ? "border-accent bg-ink" : "border-line bg-ink"}`}>
                  <span className="flex items-center gap-2">
                    <input type="radio" name="shipping-method" checked={selectedShipping?.uid === opt.uid} onChange={() => setSelectedShippingUid(opt.uid)} className="accent-[#ff3860]" />
                    <span className="text-sm text-cream">{opt.name}</span>
                    <span className="text-xs text-faint">{formatDeliveryEstimate(opt)}</span>
                  </span>
                  <span className="text-sm font-semibold text-cream">{formatCents(opt.priceCents)}</span>
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
        <textarea id="order-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Outfits, poses, expressions, and other important details…" className={`mt-3 ${inputBase} resize-y`} />
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
          {quote && selectedShipping && (
            <dl className="mb-2 grid grid-cols-[auto_auto] gap-x-4 text-sm text-muted">
              <dt>Digital portrait{expedited ? " with expedited delivery" : ""}</dt>
              <dd>{formatCents(totalCents - quote.printPriceCents - selectedShipping.priceCents)}</dd>
              <dt>Print</dt>
              <dd>{formatCents(quote.printPriceCents)}</dd>
              <dt>Shipping</dt>
              <dd>{formatCents(selectedShipping.priceCents)}</dd>
            </dl>
          )}
          <p className="text-xs uppercase tracking-wider text-faint">Total</p>
          <p className="font-display text-3xl text-cream">{!needsShipping || selectedShipping ? formatCents(totalCents) : "Pending shipping quote"}</p>
        </div>
        <button type="submit" disabled={submitting || (needsShipping && !selectedShipping)} className="rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-glow hover:bg-accent-bright disabled:opacity-60">
          {submitting ? progress ?? "Processing..." : "Checkout Securely"}
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-faint">Secure payment by Stripe · Unlimited free revisions</p>
    </form>
  );
}
