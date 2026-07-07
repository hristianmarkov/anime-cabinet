import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-hero-glow">
      <div className="mx-auto max-w-2xl px-4 py-28 text-center sm:px-6">
        <p className="font-display text-gradient text-7xl">404</p>
        <h1 className="font-display mt-4 text-3xl text-cream">
          This Page Got Isekai&apos;d
        </h1>
        <p className="mt-4 text-muted">
          The page you&apos;re looking for was transported to another world.
          Let&apos;s get you back to ours.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-bright"
          >
            Back to Home
          </Link>
          <Link
            href="/portraits"
            className="rounded-full border border-line-bright px-8 py-3 text-sm font-semibold text-cream transition hover:bg-surface"
          >
            Browse Styles
          </Link>
        </div>
      </div>
    </section>
  );
}
