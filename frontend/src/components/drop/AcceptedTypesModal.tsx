import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Code2,
  FileAudio,
  FileText,
  FileVideo,
  Image as ImageIcon,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { ALLOWED_CATEGORIES, ALLOWED_EXTENSIONS } from "../../lib/config";
import { focusRing, transitionBase } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { IconButton } from "../ui/IconButton";
import { Button } from "../ui/Button";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  images: ImageIcon,
  documents: FileText,
  code: Code2,
  archives: Archive,
  audio: FileAudio,
  video: FileVideo,
};

export interface AcceptedTypesModalProps {
  open: boolean;
  onClose: () => void;
}

export function AcceptedTypesModal({ open, onClose }: AcceptedTypesModalProps) {
  const [query, setQuery] = useState("");

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\./, "");
    if (!q) return ALLOWED_CATEGORIES;

    return ALLOWED_CATEGORIES.map((cat) => ({
      ...cat,
      extensions: cat.extensions.filter(
        (ext) =>
          ext.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q) ||
          cat.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.extensions.length > 0);
  }, [query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="supported-types-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-rise"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-xl border border-line bg-surface shadow-2xl animate-rise sm:max-h-[85dvh] sm:rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-line px-3.5 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="supported-types-title"
                className="text-base font-semibold text-fg sm:text-lg"
              >
                Supported file types
              </h2>
              <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[11px] font-medium text-accent">
                {ALLOWED_EXTENSIONS.length} formats
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted sm:mt-1 sm:text-xs">
              Files are validated against their content signatures before upload.
            </p>
          </div>

          <IconButton
            icon={X}
            label="Close dialog"
            onClick={onClose}
            className="shrink-0 -mr-1 -mt-1 sm:mr-0 sm:mt-0"
          />
        </div>

        {/* Filter input */}
        <div className="border-b border-line bg-elevated/40 px-3.5 py-2.5 sm:px-6 sm:py-3">
          <div className="relative flex items-center">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 text-faint"
              aria-hidden
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search formats (e.g. pdf, sql, mp4, ts)..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className={cn(
                "w-full rounded-lg border border-line bg-surface py-1.5 pr-8 pl-8.5 text-xs text-fg placeholder:text-faint sm:py-2 sm:pl-9 sm:text-sm",
                focusRing,
                transitionBase
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 p-1 text-faint hover:text-fg"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-3.5 sm:space-y-4 sm:p-6">
          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center sm:py-10">
              <p className="text-sm font-medium text-fg">No matching formats</p>
              <p className="mt-1 text-xs text-muted">
                "{query}" is not currently in the allowed formats list.
              </p>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] ?? FileText;
              return (
                <div
                  key={cat.id}
                  className="rounded-lg border border-line bg-elevated/40 p-3 sm:rounded-xl sm:p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent sm:h-7 sm:w-7 sm:rounded-lg">
                        <Icon size={13} className="sm:h-3.5 sm:w-3.5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-semibold text-fg sm:text-sm">
                          {cat.name}
                        </h3>
                        <p className="truncate text-[10px] text-faint sm:text-[11px]">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-muted sm:text-[11px]">
                      {cat.extensions.length}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1 sm:mt-3 sm:gap-1.5">
                    {cat.extensions.map((ext) => (
                      <span
                        key={ext}
                        className="inline-flex items-center rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] font-medium text-fg shadow-2xs transition-colors hover:border-accent hover:text-accent sm:rounded-md sm:px-2 sm:py-1 sm:text-[11px]"
                      >
                        .{ext}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-line bg-elevated/40 px-3.5 py-2.5 sm:px-6 sm:py-3">
          <p className="text-[11px] text-faint sm:text-xs">
            Max 100 MB per drop
          </p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
