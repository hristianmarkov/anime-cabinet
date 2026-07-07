/**
 * Placeholder for real example artwork. Renders a styled gradient tile with
 * the style name so the layout looks intentional until real art is added.
 * See IMAGES-TODO.md for the full list of images to commission.
 */
export function ArtPlaceholder({
  label,
  accent,
  sublabel = "Example artwork",
  className = "",
}: {
  label: string;
  accent: string;
  sublabel?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${label} — ${sublabel}`}
      className={`relative flex items-center justify-center overflow-hidden bg-surface ${className}`}
      style={{
        background: `linear-gradient(150deg, ${accent}26 0%, #16161c 55%, ${accent}14 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(${accent}30 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
        }}
      />
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl"
        style={{ background: `${accent}33` }}
      />
      <div className="relative z-10 px-4 text-center">
        <span
          className="font-display block text-xl leading-tight sm:text-2xl"
          style={{ color: accent }}
        >
          {label}
        </span>
        <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-faint">
          {sublabel}
        </span>
      </div>
    </div>
  );
}
