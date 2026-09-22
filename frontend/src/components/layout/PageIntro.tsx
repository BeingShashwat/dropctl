import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/**
 * Editorial page header: a mono kicker, a tight headline and one supporting
 * line. Left-aligned and unadorned — no badge pills, no icon chips, nothing
 * competing with the content below it.
 */
export function PageIntro({
  kicker,
  title,
  description,
  className,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {kicker && (
        <p className="font-mono text-[11px] tracking-[0.16em] text-faint uppercase">
          {kicker}
        </p>
      )}

      <h1 className="max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-balance text-fg sm:text-[2rem] sm:leading-[1.15]">
        {title}
      </h1>

      {description && (
        <p className="max-w-xl text-sm text-pretty text-muted sm:text-[0.9375rem]">
          {description}
        </p>
      )}
    </div>
  );
}
