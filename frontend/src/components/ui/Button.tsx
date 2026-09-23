import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
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
  sm: "--btn-gap: 0.375rem; h-9 px-3 text-sm",
  md: "--btn-gap: 0.5rem; h-10 px-4 text-sm",
  lg: "--btn-gap: 0.5rem; h-12 px-6 text-base",
};

const ICON_SIZES: Record<ButtonSize, number> = { sm: 15, md: 16, lg: 18 };

/**
 * One class composition for every button-shaped control, so `Button`, the
 * loading state and `ButtonLink` (anchors) can never drift apart visually.
 */
function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}): string {
  return cn(
    "inline-flex min-w-0 shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg font-medium",
    "disabled:pointer-events-none disabled:opacity-50",
    focusRing,
    transitionBase,
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className
  );
}

function ButtonContent({
  icon: Icon,
  iconRight: IconRight,
  loading,
  iconSize,
  children,
}: {
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  iconSize: number;
  children?: React.ReactNode;
}) {
  return (
    <>
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" aria-hidden />
      ) : (
        Icon && <Icon size={iconSize} aria-hidden />
      )}
      {children != null && (
        <span
          style={{ marginLeft: "var(--btn-gap, 0.5rem)" }}
          className="truncate"
        >
          {children}
        </span>
      )}
      {!loading && IconRight && (
        <IconRight size={iconSize} aria-hidden className="shrink-0" />
      )}
    </>
  );
}

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
      icon,
      iconRight,
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
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={buttonClasses({ variant, size, fullWidth, className })}
        {...rest}
      >
        <ButtonContent
          icon={icon}
          iconRight={iconRight}
          loading={loading}
          iconSize={ICON_SIZES[size]}
        >
          {children}
        </ButtonContent>
      </button>
    );
  }
);

export interface ButtonLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  fullWidth?: boolean;
}

/**
 * Anchor twin of `Button` — same classes, single tab stop. Use wherever a
 * button visually is a link (downloads, external URLs) instead of wrapping a
 * `Button` in an `<a>`, which would create two focusable elements.
 */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    {
      variant = "secondary",
      size = "md",
      icon,
      iconRight,
      fullWidth = false,
      className,
      children,
      ...rest
    },
    ref
  ) {
    return (
      <a
        ref={ref}
        className={buttonClasses({ variant, size, fullWidth, className })}
        {...rest}
      >
        <ButtonContent
          icon={icon}
          iconRight={iconRight}
          iconSize={ICON_SIZES[size]}
        >
          {children}
        </ButtonContent>
      </a>
    );
  }
);
