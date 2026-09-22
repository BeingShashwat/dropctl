import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONES: Record<
  AlertTone,
  { wrap: string; icon: LucideIcon; iconColor: string }
> = {
  info: {
    wrap: "bg-accent-soft border-accent-line text-fg",
    icon: Info,
    iconColor: "text-accent",
  },
  success: {
    wrap: "bg-success-soft border-success-line text-fg",
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  warning: {
    wrap: "bg-warning-soft border-warning-line text-fg",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  danger: {
    wrap: "bg-danger-soft border-danger-line text-fg",
    icon: XCircle,
    iconColor: "text-danger",
  },
};

export function Alert({
  tone = "info",
  title,
  children,
  actions,
  className,
}: {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const config = TONES[tone];
  const Icon = config.icon;

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3.5 text-sm sm:p-4",
        config.wrap,
        className
      )}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", config.iconColor)} aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium text-fg">{title}</p>}
        {children && (
          <div className={cn("text-muted", title ? "mt-0.5" : undefined)}>
            {children}
          </div>
        )}
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
