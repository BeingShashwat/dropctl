import { cn } from "../../lib/utils";
import { focusRing, transitionBase } from "../../lib/styles";
import { navigate } from "../../lib/router";
import { BrandMark } from "./BrandMark";

/**
 * The wordmark splits at the tool-name convention: "drop" in the UI face and
 * "ctl" in mono, the way a command-line utility would be written.
 */
export function Logo({
  showWordmark = true,
  className,
}: {
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => navigate()}
      aria-label="dropctl — go to home"
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-1 py-1",
        focusRing,
        transitionBase,
        "hover:bg-elevated",
        className
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-accent-hover text-accent-fg">
        <BrandMark size={17} />
      </span>

      {showWordmark && (
        <span className="flex items-baseline text-[15px] leading-none">
          <span className="font-semibold tracking-tight text-fg">drop</span>
          <span className="font-mono text-[13px] font-medium tracking-tight text-faint">
            ctl
          </span>
        </span>
      )}
    </button>
  );
}
