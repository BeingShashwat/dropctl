import { Plus } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "../ui/Button";
import { navigate, useRouteSlug } from "../../lib/router";

/**
 * The header is an instrument faceplate, not a floating website banner.
 *
 * It sits flush with the page — same canvas, square corners, no blur, no
 * shadow — and is divided into cells by real hairlines, the way a machine
 * panel is. A tick ruler runs along its bottom edge: this product is about
 * measuring the time a file has left, so the header measures something too.
 *
 * The cells also report state instead of decorating:
 *   - home:        the wordmark ends in a blinking caret — an idle prompt.
 *   - a drop page: the caret hands over to a readout: `$ open <slug>`.
 */
export function Header() {
  const slug = useRouteSlug();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <div className="relative mx-auto flex max-w-5xl items-stretch border-x border-line">
        {/* ── brand cell ─────────────────────────────────────────────── */}
        <div className="flex items-center py-2.5 pl-3 pr-3 sm:pl-4">
          <Logo />
          {!slug && (
            <span
              aria-hidden="true"
              className="ml-0.5 h-[15px] w-[7px] animate-blink bg-fg/80"
            />
          )}
        </div>

        {/* ── readout cell ───────────────────────────────────────────── */}
        <nav
          aria-label="Current location"
          className="hidden min-w-0 flex-1 items-center border-l border-line px-4 md:flex"
        >
          {slug ? (
            <span className="flex min-w-0 items-center gap-2 font-mono text-xs">
              <span className="text-faint">$</span>
              <span className="shrink-0 text-faint">open</span>
              <span className="truncate text-fg" title={slug}>
                {slug}
              </span>
            </span>
          ) : (
            <span className="truncate font-mono text-xs text-faint">
              temporary file drops — links expire, files get deleted
            </span>
          )}
        </nav>

        {/* ── actions cell ───────────────────────────────────────────── */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 border-l border-line py-2 pr-2.5 pl-2.5 sm:pr-3.5 md:ml-0">
          {slug && (
            <Button
              variant="ghost"
              size="sm"
              icon={Plus}
              onClick={() => navigate()}
            >
              New drop
            </Button>
          )}
          <ThemeToggle />
        </div>

        {/* ── tick ruler, combed off the bottom border ───────────────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px 10px)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--line-strong) 0 1px, transparent 1px 90px)",
          }}
        />
      </div>
    </header>
  );
}
