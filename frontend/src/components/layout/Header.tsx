import { ChevronRight, Plus, Terminal } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "../ui/Button";
import { navigate, useRouteSlug } from "../../lib/router";

/**
 * A floating console bar rather than a full-bleed web header: it sits inset
 * from the viewport, shows where you are as a path, and only offers the
 * actions that make sense for the current view.
 */
export function Header() {
  const slug = useRouteSlug();

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex h-14 items-center gap-2 rounded-2xl border border-line bg-surface/85 pr-2 pl-2 shadow-[var(--shadow-raised)] backdrop-blur-xl sm:gap-3 sm:pr-2.5 sm:pl-2.5">
          <Logo />

          <nav
            aria-label="Current location"
            className="hidden min-w-0 flex-1 items-center gap-2 pl-1 md:flex"
          >
            <Terminal size={13} className="shrink-0 text-faint" aria-hidden />
            <span className="flex min-w-0 items-center gap-1 font-mono text-[11px]">
              <span className="text-faint">~/drops</span>
              {slug && (
                <>
                  <ChevronRight
                    size={11}
                    className="shrink-0 text-faint"
                    aria-hidden
                  />
                  <span className="truncate text-fg" title={slug}>
                    {slug}
                  </span>
                </>
              )}
            </span>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0">
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
        </div>
      </div>
    </header>
  );
}
