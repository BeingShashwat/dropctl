/**
 * Single source of truth for cross-component styling primitives.
 * Every surface, control and focus state across the app pulls from here so
 * the whole UI stays pixel-consistent.
 */

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/** Elevated panel used for cards, popovers and grouped content. */
export const surfaceCard =
  "bg-surface border border-line rounded-xl shadow-[var(--shadow-card)]";

export const inputBase = [
  "w-full rounded-lg border border-line bg-elevated text-fg",
  "placeholder:text-faint",
  "px-3 py-2 text-sm leading-6",
  "transition-colors duration-150",
  "hover:border-line-strong",
  focusRing,
  "disabled:cursor-not-allowed disabled:opacity-60",
  "min-h-10",
].join(" ");

/** Shared transition timing so nothing animates at a different speed. */
export const transitionBase =
  "transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 ease-out";

/** Every interactive icon-sized target is 40px on touch, 36px on desktop. */
export const iconButtonSize = "h-10 w-10 sm:h-9 sm:w-9";
