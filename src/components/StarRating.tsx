export function StarRating({ count = 5, size = "md" }: { count?: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <div className={`flex items-center gap-0.5 text-gold ${sizeClass}`} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  );
}
