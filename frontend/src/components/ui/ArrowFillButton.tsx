import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import "./arrow-fill-button.css";

const ARROW_PATH =
  "M0 5.625 L7.625 5.625 L4.125 9.125 L5 10 L10 5 L5 0 L4.125 0.875 L7.625 4.375 L0 4.375 Z";

export interface ArrowFillButtonProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  size?: "sm" | "md";

  /** Renders an <a> instead of a <button> when provided. */
  href?: string;
  /** Only meaningful alongside `href`; supplies a filename for the download. */
  download?: string;
  target?: string;
  rel?: string;

  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  title?: string;
  "aria-label"?: string;

  /** Full-width on phones, natural width from the `sm` breakpoint up. */
  fluid?: boolean;

  /* Optional colour overrides — default to the semantic theme tokens. */
  bgColor?: string;
  textColor?: string;
  fillBgColor?: string;
  fillTextColor?: string;
  hoverFillBgColor?: string;
  hoverFillTextColor?: string;
  arrowColor?: string;
  hoverArrowColor?: string;
}

/**
 * The signature primary action: a pill that fills and slides an arrow on
 * hover or keyboard focus. Reserve it for the single most important action on
 * a view — secondary actions use the quieter `Button`.
 */
export function ArrowFillButton({
  children = "Continue",
  className,
  style,
  size = "md",
  href,
  download,
  target,
  rel,
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  title,
  fluid = false,
  bgColor,
  textColor,
  fillBgColor,
  fillTextColor,
  hoverFillBgColor,
  hoverFillTextColor,
  arrowColor,
  hoverArrowColor,
  "aria-label": ariaLabel,
}: ArrowFillButtonProps) {
  const variables = {
    ...(bgColor ? { "--btn-bg": bgColor } : null),
    ...(textColor ? { "--btn-text": textColor } : null),
    ...(fillBgColor ? { "--btn-fill-bg": fillBgColor } : null),
    ...(fillTextColor ? { "--btn-fill-text": fillTextColor } : null),
    ...(hoverFillBgColor ? { "--btn-fill-bg-hover": hoverFillBgColor } : null),
    ...(hoverFillTextColor
      ? { "--btn-fill-text-hover": hoverFillTextColor }
      : null),
    ...(arrowColor ? { "--btn-arrow": arrowColor } : null),
    ...(hoverArrowColor ? { "--btn-arrow-hover": hoverArrowColor } : null),
  } as CSSProperties;

  const classes = cn(
    "btn-arrow-fill",
    size === "sm" && "btn-arrow-fill--sm",
    fluid && "btn-arrow-fill--fluid",
    className
  );

  const content = (
    <>
      <span className="btn-arrow-fill__label">{children}</span>
      <span className="btn-arrow-fill__fill" aria-hidden="true">
        <span className="btn-arrow-fill__fill-label">{children}</span>
        {/* The slot doubles as the busy indicator while an action runs. */}
        <span className="btn-arrow-fill__icon">
          {loading ? (
            <Loader2 size={12} className="h-full w-full animate-spin" />
          ) : (
            <svg
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
            >
              <path
                d={ARROW_PATH}
                fillRule="evenodd"
                clipRule="evenodd"
                className="btn-arrow-fill__path"
              />
              <path
                d={ARROW_PATH}
                fillRule="evenodd"
                clipRule="evenodd"
                className="btn-arrow-fill__path"
              />
            </svg>
          )}
        </span>
      </span>
    </>
  );

  const isDisabled = disabled || loading;

  const mergedStyle = { ...variables, ...style };

  if (href) {
    return (
      <a
        href={isDisabled ? undefined : href}
        download={download}
        target={target}
        rel={rel}
        className={classes}
        style={mergedStyle}
        title={title}
        aria-label={ariaLabel}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={isDisabled ? (e) => e.preventDefault() : onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={classes}
      style={mergedStyle}
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
