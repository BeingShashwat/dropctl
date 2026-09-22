import logoMarkDark from "../../assets/logo-mark-dark.png";
import logoMarkLight from "../../assets/logo-mark-light.png";
import { cn } from "../../lib/utils";
import { focusRing, transitionBase } from "../../lib/styles";
import { navigate } from "../../lib/router";
import { useTheme } from "../../context/theme-context";

/**
 * The mark is the provided brand artwork: the blue drop-arrow, cropped from
 * the full lockup. Its navy details are near-invisible on the dark theme
 * (1.0:1 against the canvas), so a pre-derived variant recolours only the
 * navy to the dark-UI foreground tone; the blue is untouched in both.
 *
 * The wordmark stays live text — "drop" in the UI face, "ctl" in mono —
 * because the lockup's raster wordmark would be unreadable at header size.
 */
export function Logo({
  showWordmark = true,
  className,
}: {
  showWordmark?: boolean;
  className?: string;
}) {
  const { theme } = useTheme();

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
      <img
        src={theme === "dark" ? logoMarkDark : logoMarkLight}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="h-8 w-8 object-contain"
      />

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
