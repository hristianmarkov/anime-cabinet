import Image from "next/image";
import Link from "next/link";
import type { BlogBlock, BlogSection } from "@/data/blog-blocks";
import { resolveBlockImage } from "@/data/blog-blocks";
import { getStyleBySlug } from "@/data/styles";
import { PriceFrom } from "@/components/PriceFrom";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  const re = new RegExp(LINK_RE.source, "g");

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const href = match[2];
    if (href.startsWith("/")) {
      parts.push(
        <Link key={key++} href={href} className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-bright">
          {match[1]}
        </Link>
      );
    } else {
      parts.push(
        <a key={key++} href={href} className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-bright">
          {match[1]}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

function Figure({
  file,
  caption,
  layout = "wide",
}: {
  file: string;
  caption?: string;
  layout?: "wide" | "inline-right" | "center";
}) {
  const { src, alt } = resolveBlockImage(file);
  const wrap =
    layout === "inline-right"
      ? "float-none sm:float-right sm:ml-6 sm:mb-4 sm:max-w-[280px]"
      : layout === "center"
        ? "mx-auto max-w-md"
        : "w-full";

  return (
    <figure className={`my-8 ${wrap}`}>
      <div
        className={`relative overflow-hidden rounded-2xl border border-line bg-ink shadow-card ${
          layout === "inline-right" ? "aspect-[4/5]" : "aspect-[16/10] sm:aspect-[21/9]"
        }`}
      >
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm leading-relaxed text-faint">{caption}</figcaption>
      )}
    </figure>
  );
}

function BeforeAfterBlock({
  beforeFile,
  afterFile,
  caption,
  styleName,
}: Extract<BlogBlock, { type: "beforeAfter" }>) {
  const before = resolveBlockImage(beforeFile);
  const after = resolveBlockImage(afterFile);

  return (
    <figure className="my-10">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line">
          <Image src={before.src} alt={before.alt} fill className="object-cover" sizes="50vw" />
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream">
            Before
          </span>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line shadow-glow">
          <Image src={after.src} alt={after.alt} fill className="object-cover" sizes="50vw" />
          <span className="absolute bottom-3 left-3 rounded-full bg-accent/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            After{styleName ? ` · ${styleName}` : ""}
          </span>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-4 text-center text-sm leading-relaxed text-muted">{caption}</figcaption>
      )}
    </figure>
  );
}

function ProductShowcaseBlock({
  slug,
  description,
}: Extract<BlogBlock, { type: "productShowcase" }>) {
  const style = getStyleBySlug(slug);
  if (!style) return null;

  const before = resolveBlockImage(`${slug}-before.jpg`);
  const after = resolveBlockImage(`${slug}-after.jpg`);
  const blurb = description ?? style.tagline;

  return (
    <Link
      href={`/portraits/${slug}`}
      className="group my-10 block overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-line-bright hover:shadow-glow"
    >
      <div className="grid items-center gap-0 sm:grid-cols-[1fr_auto_1fr]">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src={before.src}
            alt={before.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, 220px"
          />
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream">
            Before
          </span>
        </div>

        <div
          className="flex items-center justify-center bg-ink-soft px-4 py-6 sm:py-0"
          aria-hidden="true"
        >
          <svg
            className="h-8 w-8 text-accent transition-transform duration-300 group-hover:translate-x-1 sm:h-10 sm:w-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src={after.src}
            alt={after.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, 220px"
          />
          <span className="absolute bottom-3 left-3 rounded-full bg-accent/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            After
          </span>
        </div>
      </div>

      <div className="border-t border-line p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {style.name} · Custom Portrait
        </p>
        <h3 className="mt-1 font-display text-xl text-cream transition-colors group-hover:text-accent sm:text-2xl">
          {style.productName}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{blurb}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-faint">
            <PriceFrom usd={style.priceFrom} />
          </span>
          <span className="text-sm font-semibold text-accent transition-transform group-hover:translate-x-1">
            View product →
          </span>
        </div>
      </div>
    </Link>
  );
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="mt-4 leading-[1.85] text-muted">
          <RichText text={block.text} />
        </p>
      );
    case "heading":
      return <h3 className="mt-8 text-lg font-semibold text-cream">{block.text}</h3>;
    case "list":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted">
          {block.items.map((item) => (
            <li key={item.slice(0, 40)} className="leading-relaxed">
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );
    case "figure": {
      const file = block.file ?? block.artFile ?? "";
      const layout = block.layout ?? (block.wide ? "wide" : "wide");
      return <Figure file={file} caption={block.caption} layout={layout} />;
    }
    case "figureRow":
      return (
        <div className="my-8 grid gap-4 sm:grid-cols-2">
          {block.files.map(({ file, caption }) => (
            <Figure key={file} file={file} caption={caption} layout="center" />
          ))}
        </div>
      );
    case "figurePair":
      return (
        <div className="my-8 grid gap-4 sm:grid-cols-2">
          <Figure file={block.left.artFile} caption={block.left.caption} layout="center" />
          <Figure file={block.right.artFile} caption={block.right.caption} layout="center" />
        </div>
      );
    case "imageGrid": {
      const cols = block.cols ?? 2;
      return (
        <div className={`my-8 grid gap-4 ${cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {block.images.map((img) => (
            <Figure key={img.artFile} file={img.artFile} caption={img.caption} layout="center" />
          ))}
        </div>
      );
    }
    case "beforeAfter":
      return <BeforeAfterBlock {...block} />;
    case "pullQuote":
      return (
        <blockquote className="my-8 border-l-4 border-accent pl-6">
          <p className="text-lg italic leading-relaxed text-cream">&ldquo;{block.text}&rdquo;</p>
          {block.attribution && <cite className="mt-2 block text-sm not-italic text-faint">— {block.attribution}</cite>}
        </blockquote>
      );
    case "stylePills":
      return (
        <div className="my-6 flex flex-wrap gap-2">
          {block.intro && <span className="mr-2 text-sm text-faint">{block.intro}</span>}
          {block.slugs.map((slug) => {
            const style = getStyleBySlug(slug);
            if (!style) return null;
            return (
              <Link
                key={slug}
                href={`/portraits/${slug}`}
                className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-accent transition hover:border-accent"
              >
                {style.name}
              </Link>
            );
          })}
        </div>
      );
    case "productShowcase":
      return <ProductShowcaseBlock {...block} />;
    default:
      return null;
  }
}

export function BlogSectionContent({ section }: { section: BlogSection }) {
  const hasBlocks = section.blocks && section.blocks.length > 0;

  return (
    <section className="mt-12 clear-both">
      {section.heading && (
        <h2 className="font-display text-2xl text-cream sm:text-[1.65rem]">{section.heading}</h2>
      )}
      {hasBlocks ? (
        section.blocks!.map((block, i) => <Block key={i} block={block} />)
      ) : (
        <>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 32)} className="mt-4 leading-[1.85] text-muted">
              <RichText text={p} />
            </p>
          ))}
          {section.list && (
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted">
              {section.list.map((item) => (
                <li key={item} className="leading-relaxed">
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
