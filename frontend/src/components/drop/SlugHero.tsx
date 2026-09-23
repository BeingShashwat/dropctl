import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { copyText, cn } from "../../lib/utils";

/**
 * The plate that owns the moment after an upload: the slug, huge, on top,
 * because the link is the entire point of the product.
 *
 * Designed like a specimen label, not a banner — the slug is set in mono at
 * display size, `#`-prefixed. Both identifiers are copyable, each mapped to
 * what it shows: tapping the slug row copies the slug; the strip underneath
 * copies the complete share URL. Speaks the header's faceplate language —
 * flush surface, hairline seams, tick ruler along the bottom edge.
 */
export function SlugHero({
  slug,
  shareUrl,
  label = "Drop created — your link is live",
  className,
}: {
  slug: string;
  shareUrl?: string;
  /** Kicker text in the plate's top strip. */
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState<"slug" | "link" | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // Same lifecycle as CopyButton's copy state.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (kind: "slug" | "link") => {
    const ok = await copyText(kind === "slug" ? slug : (shareUrl ?? slug));
    if (!ok) return;
    setCopied(kind);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      className={cn(
        "animate-rise overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-line px-3 py-2 sm:px-4">
        <Link2 size={13} className="shrink-0 text-faint" aria-hidden />
        <p className="min-w-0 flex-1 truncate font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
          {label}
        </p>
      </div>

      {/* The slug row copies the slug itself. */}
      <button
        type="button"
        onClick={() => copy("slug")}
        aria-label="Copy the slug"
        className={cn(
          "group flex w-full min-w-0 items-center gap-3 px-4 py-5 text-left sm:gap-5 sm:px-7 sm:py-7",
          "transition-colors duration-150 hover:bg-elevated",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
        )}
      >
        <span
          aria-hidden
          className="shrink-0 font-mono text-3xl leading-none text-faint select-none sm:text-5xl"
        >
          #
        </span>

        {/* break-all so even a maximum-length slug never overflows a phone. */}
        <span className="min-w-0 flex-1 self-center font-mono text-3xl font-semibold break-all text-fg sm:text-5xl">
          {slug}
        </span>

        <span
          aria-hidden
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150",
            copied === "slug"
              ? "border-success-line bg-success-soft text-success"
              : "border-line bg-elevated text-muted group-hover:border-line-strong group-hover:text-fg"
          )}
        >
          {copied === "slug" ? <Check size={17} /> : <Copy size={17} />}
        </span>
      </button>

      {/* The link row copies the complete share URL. */}
      {shareUrl && (
        <button
          type="button"
          onClick={() => copy("link")}
          aria-label="Copy the complete link"
          className={cn(
            "group flex w-full min-w-0 items-center gap-3 border-t border-line px-4 py-2.5 text-left sm:px-7",
            "transition-colors duration-150 hover:bg-elevated",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
          )}
        >
          <span
            className="min-w-0 flex-1 truncate font-mono text-[11px] text-faint group-hover:text-muted"
            title={shareUrl}
          >
            {shareUrl}
          </span>

          <span
            aria-hidden
            className={cn(
              "flex shrink-0 items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors duration-150",
              copied === "link" ? "text-success" : "text-faint group-hover:text-fg"
            )}
          >
            {copied === "link" ? (
              <>
                <Check size={12} /> copied
              </>
            ) : (
              <>
                <Copy size={12} /> copy link
              </>
            )}
          </span>
        </button>
      )}

      {/* The ruler that finishes the faceplate system. */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-1 w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px 10px)",
        }}
      />
    </div>
  );
}
