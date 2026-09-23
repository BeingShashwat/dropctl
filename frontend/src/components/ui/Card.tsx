import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { surfaceCard } from "../../lib/styles";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "md" | "lg";
}

const PADDING = {
  none: "",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-7",
} as const;

export function Card({
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div className={cn(surfaceCard, PADDING[padding], className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-line pb-4",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Icon size={16} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-fg">{title}</h2>
          {description && (
            // break-words keeps unbreakable tokens (e.g. a long pasted slug)
            // from inflating a grid track or poking past the viewport.
            <p className="mt-0.5 text-sm break-words text-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
