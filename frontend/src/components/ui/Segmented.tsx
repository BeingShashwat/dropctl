import { cn } from "../../lib/utils";
import { focusRing, transitionBase } from "../../lib/styles";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  title?: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "grid gap-1 rounded-lg border border-line bg-elevated p-1",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.title ?? option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-2 py-1.5 text-xs font-medium sm:text-sm",
              focusRing,
              transitionBase,
              selected
                ? "bg-surface text-fg shadow-[var(--shadow-card)]"
                : "text-muted hover:text-fg"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
