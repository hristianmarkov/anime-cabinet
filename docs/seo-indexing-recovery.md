# Indexing recovery changes — 11 November 2026

## Evidence and limits

The supplied Search Console exports end on 6 November. They record a fall from
46 indexed URLs on 14 August to 10, with 86 crawled/currently not indexed,
73 discovered/currently not indexed, nine 404s, five redirects and two redirect
errors. These are historical Google reports, not the results of today's tests.

A fresh HTTP crawl of all 138 URLs in the live sitemap returned 200 for every
URL, with matching www canonicals and no noindex directives. Requests using a
Googlebot User-Agent fetched the home page, Solo Leveling product and One Piece
gift guide successfully. This does not test verified Googlebot IP traffic or
prove future indexing. 128 sitemap URLs occur in the two exclusion exports:
20 products, the catalogue, 99 articles and eight other pages.

The live deployment's Git source is `bca9d9063d2298c31e3d61b14887b50638601047`.
Vercel's project settings exclude custom domains from SSO protection. The
firewall configuration endpoint returned "Config not found"; that is not a
complete firewall/log audit. Manual actions, security issues, Google's stored
HTML, selected canonicals and verified crawler request logs were unavailable.

## Concrete defects repaired

- Ten original article records had at least one empty section. Some entire
  articles were outlines: the live One Piece gift guide had 14 section headings
  without paragraph content. Restore complete editorial sections and retain a
  fallback if a later generation is incomplete.
- Rewrite all 24 product descriptions and FAQs around their actual design
  choices. Add ordering information: included digital file, extra characters,
  optional prints, preview timing, revisions, shipping and final approval.
- Remove irrelevant gift-code terms, appended search-keyword lists and repeated
  production-method claims. Use "artists create portraits" in public copy.
- Render editorial links in product descriptions, blog introductions and FAQs.
  Reuse the blog body's link renderer, restrict link schemes, and repair three
  links to nonexistent generic product URLs.
- Consolidate each style's overlapping poster-gift article into its main gift
  guide. Retain useful gift details, update contextual links, remove the 24 old
  URLs from the sitemap and blog index, and redirect each directly with HTTP 308.
  Keep the distinct photo-to-poster process articles.
- Rewrite one comparison around profile-picture versus poster composition,
  with a descriptive new URL and a direct redirect from its old URL.
- Remove embedded brand suffixes that the layout appended a second time. The
  original live crawl found 23 titles containing the brand twice.
- Remove store-wide aggregate ratings from individual Product JSON-LD. Show
  only reviews matching the product's style. Review authenticity still needs
  owner verification; the source has a legacy placeholder warning alongside an
  enabled real-review flag.
- Add accurate modification dates for edited content. The new sitemap contains
  114 canonical URLs: 24 products, 78 articles and 12 other pages.
- Apply the same robots exclusions to Google's specific group and the wildcard
  group. Allow useful pages and assets. Keep order tracking out of search.

Removed product styles retain 404 responses because no equivalent replacement
was established. Redirecting unrelated retired products to the home page would
not restore their content. The two exported redirect errors have no URL-level
drilldown in the attachments, so their specific causes remain unverified.

## Prevent recurrence

`npm run check:seo` runs before the application build. It checks complete
article sections, unique titles, valid contextual product/blog links, product
example images, direct redirect destinations and sitemap consistency. The
content generator preserves paragraphs when adding image blocks and refuses to
save sections without content. Its editorial instructions no longer encourage
unsupported production claims or unrelated keyword padding.

The existing deployment database steps are unchanged; no schema changes are
part of this work. Local verification uses `npm run build`, not the deployment
script that pushes database schema changes.

## Validation

- Production build and TypeScript compilation.
- 35 passing tests, including three regressions for lost article paragraphs.
- Data checks: 24 products, 78 articles, 114 sitemap entries and 25 direct
  content redirects; no broken contextual links or empty article sections.
- Browser verification covers initial HTML, pages with JavaScript disabled,
  product structured data, redirects, retained 404s, responsive layout and the
  order form's character-price calculation. No checkout or customer-message
  submission is needed for these checks.

## After release

1. Check Search Console → Security & Manual Actions → Manual actions and
   Security issues. Record whether both say "No issues detected". If there is a
   notice, address its stated cause before attributing the decline only to copy.
2. Resubmit `https://www.animecabinet.com/sitemap.xml` after the new sitemap is
   live. Its count should be 114, with redirected articles absent.
3. Inspect the catalogue and a small representative set of products: Solo
   Leveling, One Piece Wanted Poster, Naruto, Dragon Ball Z and Ghibli. Review
   stored indexing information as well as a live test, then request indexing of
   those improved URLs. A successful live test is eligibility, not indexing.
4. Inspect the repaired One Piece gift and birthday guides. Confirm actual
   paragraphs appear in Google's fetched/rendered HTML. Request indexing of the
   retained guides, not the redirected duplicates.
5. Obtain the two redirect-error URLs from their Search Console drilldown and
   check the exact chains. Check legitimate existing backlinks and review
   provenance. The SEO tool's sample contained unrelated directory links; that
   alone neither proves a penalty nor justifies a disavow file.
6. Compare recorded crawl dates and indexed counts after roughly two weeks,
   then again after four weeks. Track products separately from supporting
   articles. Those are review intervals, not promises of an indexing deadline.

These repairs improve content and technical consistency. Google chooses which
eligible URLs to crawl and index; this report does not establish a single
confirmed cause or guarantee recovery.
