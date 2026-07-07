# Anime Cabinet — Launch & Integration TODO

Track what still needs connecting, content, or configuration before and after go-live.

## Launch infrastructure

- [ ] Push repo to GitHub and import into Vercel
- [ ] Point GoDaddy DNS: A `@` → Vercel IP, CNAME `www` → `cname.vercel-dns.com`
- [ ] Create Neon Postgres in Vercel Storage → set `DATABASE_URL`
- [ ] Run `npm run db:push` to create/update orders table (new shipping + expedite columns)
- [ ] Add Vercel Blob storage → `BLOB_READ_WRITE_TOKEN`
- [ ] Set all env vars from `.env.example`
- [ ] Submit `https://animecabinet.com/sitemap.xml` in Google Search Console + Bing Webmaster

## Stripe

- [ ] Add `STRIPE_SECRET_KEY` (test first, then live)
- [ ] Create webhook → `https://animecabinet.com/api/stripe-webhook` event `checkout.session.completed`
- [ ] Set `STRIPE_WEBHOOK_SECRET`
- [ ] Verify multi-currency charges work for GBP, EUR, CAD, AUD (or document USD-only fallback)
- [ ] Run one full test order end-to-end

## Resend (email)

- [ ] Verify domain `animecabinet.com` in Resend
- [ ] Set `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`
- [ ] Test order confirmation + admin alert + contact form delivery

## Gelato (print-on-demand) — Phase 1 done in code

- [ ] Create Gelato account at [gelato.com](https://www.gelato.com)
- [ ] Generate API key → `GELATO_API_KEY`
- [ ] Map product UIDs in `.env` or [`src/data/gelato-products.ts`](src/data/gelato-products.ts):
  - `GELATO_UID_POSTER_12X18`
  - `GELATO_UID_POSTER_18X24`
  - `GELATO_UID_CANVAS_12X18`
  - `GELATO_UID_CANVAS_18X24`
  - `GELATO_UID_FRAMED_12X18`
- [ ] Test live shipping quotes for US, UK, DE at checkout
- [ ] Confirm print prices in [`src/data/pricing.ts`](src/data/pricing.ts) cover Gelato product cost + margin

## Gelato — Phase 2 (not built yet)

- [ ] Auto-submit print order to Gelato when admin marks artwork approved + final file URL ready
- [ ] Gelato webhooks for production/shipment status → update order in admin
- [ ] Store final artwork URL on order record for fulfillment

## Content & assets

- [ ] Replace placeholder reviews in [`src/data/reviews.ts`](src/data/reviews.ts) with real ones
- [ ] Set `REVIEWS_ARE_REAL = true` once you have 5+ genuine reviews (enables star schema)
- [ ] Replace picsum placeholder images with real before/after pairs — see [`IMAGES-TODO.md`](IMAGES-TODO.md)
- [ ] Update [`src/data/gallery.ts`](src/data/gallery.ts) masonry images with real portfolio work
- [ ] Commission hero images for homepage (4 slots in [`src/app/page.tsx`](src/app/page.tsx))

## Currency

- [ ] Review exchange rates in [`src/data/currencies.ts`](src/data/currencies.ts) and update periodically
- [ ] Confirm Stripe account supports charging in selected currencies

## Admin

- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Test order dashboard at `/admin` after first real order
- [ ] Verify expedited flag, shipping address, and shipping method display correctly

## SEO & blog

- [ ] Optional: edit blog posts in [`src/data/blog.ts`](src/data/blog.ts) with your voice
- [ ] Add 1–2 new blog posts per month (user-focused, not product brochures)
- [ ] Replace placeholder stats in [`src/data/reviews.ts`](src/data/reviews.ts) when you have real numbers

## Legal / compliance

- [ ] Review fan-art disclaimer on footer and terms
- [ ] Ensure only real customer reviews are published before launch

---

**Quick local dev**

```bash
npm install
cp .env.example .env.local   # fill values
npm run db:push
npm run dev
```
