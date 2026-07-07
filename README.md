# Anime Cabinet

SEO-first e-commerce site for custom hand-drawn anime and cartoon portraits, live at [animecabinet.com](https://animecabinet.com).

Built with Next.js (App Router) + Tailwind CSS, Neon Postgres (Drizzle ORM), Vercel Blob for photo uploads, Stripe Checkout for payments, and Resend for order emails.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values (see below)
npm run db:push              # creates the orders table in Neon
npm run dev
```

The site runs without any env vars for browsing/design work — only checkout, uploads, admin and emails need them.

## Project map

| Path | What it is |
| --- | --- |
| `src/data/styles-anime.ts`, `src/data/styles-cartoon.ts` | The style catalog. **Add a new style = add one entry**; its product page, sitemap entry and footer link generate automatically. |
| `src/data/pricing.ts` | Base pricing, per-character fee, print formats, background options. |
| `src/data/reviews.ts` | **PLACEHOLDER reviews + stats — replace before launch** (see notes in the file). |
| `src/data/faqs.ts` | Global FAQs (FAQ page + product pages + FAQ structured data). |
| `src/data/blog.ts` | Blog articles. Add entries to publish new posts. |
| `src/data/site.ts` | Site name, URL, email, socials. |
| `src/app/portraits/[style]/` | The 32 SEO product pages (statically generated). |
| `src/app/api/checkout/` | Creates the order row + Stripe Checkout session. |
| `src/app/api/stripe-webhook/` | Marks orders paid, triggers customer + admin emails. |
| `src/app/api/blob-upload/` | Secure client upload endpoint for customer photos. |
| `src/app/admin/` | Password-protected order dashboard. |

## Launch checklist

See **[TODO.md](./TODO.md)** for the full launch checklist, Gelato integration steps, and post-launch tasks.

### 1. Push to GitHub and import into Vercel

1. Create a GitHub repo and push this project.
2. In [vercel.com](https://vercel.com) → **Add New → Project**, import the repo. Framework auto-detects as Next.js; no build settings needed.

### 2. Storage (in the Vercel project)

- **Neon Postgres:** Vercel dashboard → your project → **Storage → Create Database → Neon Postgres**. This auto-adds `DATABASE_URL` to the project env. Then run `npm run db:push` locally (with the same `DATABASE_URL` in `.env.local`) to create the `orders` table.
- **Blob:** **Storage → Create → Blob**. This auto-adds `BLOB_READ_WRITE_TOKEN`.

### 3. Stripe

1. Create/log in at [dashboard.stripe.com](https://dashboard.stripe.com) → activate the account (business details, bank account).
2. **Developers → API keys** → copy the **Secret key** into `STRIPE_SECRET_KEY`.
3. **Developers → Webhooks → Add endpoint**:
   - URL: `https://animecabinet.com/api/stripe-webhook`
   - Event: `checkout.session.completed`
   - Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
4. Test first with test-mode keys and card `4242 4242 4242 4242`, then swap to live keys.

### 4. Resend (order emails)

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month).
2. **Domains → Add Domain** → `animecabinet.com` → add the DNS records it shows to GoDaddy (they're TXT/CNAME records; this does not affect your website DNS).
3. **API Keys → Create** → put it in `RESEND_API_KEY`.
4. Set `EMAIL_FROM="Anime Cabinet <orders@animecabinet.com>"` and `ADMIN_EMAIL` to wherever you want new-order alerts.

### 5. Environment variables (Vercel → Project → Settings → Environment Variables)

Set everything in `.env.example`: `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` for the `/admin` dashboard.

### 6. Point animecabinet.com (GoDaddy) at Vercel

1. Vercel → project → **Settings → Domains** → add `animecabinet.com` and `www.animecabinet.com`.
2. In GoDaddy → **My Products → animecabinet.com → DNS**:
   - **A record**: Name `@`, Value `76.76.21.21` (Vercel will show the current value — use what it displays)
   - **CNAME record**: Name `www`, Value `cname.vercel-dns.com`
   - Delete GoDaddy's default "Parked" A record if present.
3. Back in Vercel, wait for verification (minutes to a few hours). HTTPS is automatic.

### 7. SEO go-live

1. [Google Search Console](https://search.google.com/search-console) → add property `animecabinet.com` (Domain type; verify via a GoDaddy TXT record).
2. Submit the sitemap: `https://animecabinet.com/sitemap.xml`.
3. Repeat on [Bing Webmaster Tools](https://www.bing.com/webmasters) (it can import from Search Console).

### 8. Before you take real orders

- Replace placeholder reviews/stats in `src/data/reviews.ts` with real ones (the file explains how and why).
- Add real example artwork — the complete list of image slots is in `IMAGES-TODO.md`.
- Do one full test order in Stripe test mode: configure → upload → pay → check the webhook marked it paid → check both emails arrived → check it appears in `/admin`.
