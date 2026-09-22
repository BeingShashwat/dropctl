import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { focusRing, transitionBase } from "../../lib/styles";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-fg border border-transparent hover:bg-accent-hover shadow-[var(--shadow-card)]",
  secondary:
    "bg-elevated text-fg border border-line hover:border-line-strong hover:bg-sunken",
  ghost:
    "bg-transparent text-muted border border-transparent hover:bg-elevated hover:text-fg",
  danger:
    "bg-danger text-danger-fg border border-transparent hover:opacity-90 shadow-[var(--shadow-card)]",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const ICON_SIZES: Record<ButtonSize, number> = { sm: 15, md: 16, lg: 18 };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      icon: Icon,
      iconRight: IconRight,
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref
  ) {
    const iconSize = ICON_SIZES[size];
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg font-medium",
          "disabled:pointer-events-none disabled:opacity-50",
          focusRing,
          transitionBase,
          VARIANTS[variant],
          SIZES[size],
          fullWidth && "w-full",
          className
        )}
        {...rest}
      >
        {loading ? (
          <Loader2 size={iconSize} className="animate-spin" aria-hidden />
        ) : (
          Icon && <Icon size={iconSize} aria-hidden />
        )}
        {children != null && <span className="truncate">{children}</span>}
        {!loading && IconRight && (
          <IconRight size={iconSize} aria-hidden className="shrink-0" />
        )}
      </button>
    );
  }
);
