import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { focusRing, iconButtonSize, transitionBase } from "../../lib/styles";
import type { ButtonVariant } from "./Button";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "bg-elevated text-fg border border-line hover:border-line-strong hover:bg-sunken",
  ghost: "bg-transparent text-muted hover:bg-elevated hover:text-fg",
  danger: "bg-danger text-danger-fg hover:opacity-90",
};

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon: Icon, label, variant = "ghost", size = "md", className, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent",
          "disabled:pointer-events-none disabled:opacity-50",
          focusRing,
          transitionBase,
          size === "md" ? iconButtonSize : "h-8 w-8",
          VARIANTS[variant],
          className
        )}
        {...rest}
      >
        <Icon size={size === "md" ? 18 : 15} aria-hidden />
      </button>
    );
  }
);
