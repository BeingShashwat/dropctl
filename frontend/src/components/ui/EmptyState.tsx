import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export type EmptyStateTone = "neutral" | "danger" | "warning";

const TONES: Record<EmptyStateTone, { ring: string; icon: string }> = {
  neutral: { ring: "bg-accent-soft", icon: "text-accent" },
  danger: { ring: "bg-danger-soft", icon: "text-danger" },
  warning: { ring: "bg-warning-soft", icon: "text-warning" },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  tone = "neutral",
  className,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: EmptyStateTone;
  className?: string;
}) {
  const config = TONES[tone];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 px-6 py-12 text-center sm:py-16",
        className
      )}
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          config.ring
        )}
      >
        <Icon size={26} className={config.icon} aria-hidden />
      </span>

      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
        {description && (
          <p className="mx-auto max-w-md text-sm text-muted">{description}</p>
        )}
      </div>

      {actions && (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {actions}
        </div>
      )}
    </div>
  );
}
