import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FilePlus2, Layers, UploadCloud, X } from "lucide-react";
import { cn, formatBytes, fileKindLabel } from "../../lib/utils";
import {
  ALLOWED_ACCEPT,
  ALLOWED_EXTENSIONS,
  MAX_FILE_BYTES,
} from "../../lib/config";
import { focusRing, transitionBase } from "../../lib/styles";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { FileTypeIcon } from "./FileTypeIcon";

export function FileDropZone({
  files,
  onSelect,
  onRemove,
  onClear,
  error,
  disabled = false,
}: {
  /** All currently staged files; 1+ of these becomes the drop's content. */
  files: File[];
  /** Adds validated files to the staged list (picker + drag-and-drop). */
  onSelect: (files: File[]) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  error?: string | null;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > 0) onSelect(picked);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer?.files ?? []);
    if (dropped.length > 0) onSelect(dropped);
  };

  const maxMb = Math.round(MAX_FILE_BYTES / 1024 / 1024);
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  const isBundle = files.length > 1;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_ACCEPT}
        multiple
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
      />

      {files.length > 0 ? (
        <div className="rounded-xl border border-line bg-elevated p-3.5 sm:p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isBundle && (
                <Badge tone="accent" icon={Layers}>
                  Bundle · {files.length} files
                </Badge>
              )}
              <span className="text-xs text-muted">
                {formatBytes(totalBytes)} total
              </span>
            </div>
            <IconButton
              icon={X}
              label="Remove all files"
              onClick={onClear}
              disabled={disabled}
            />
          </div>

          <ul className="divide-y divide-line">
            {files.map((file, index) => (
              <li key={`${file.name}:${file.size}:${index}`} className="flex items-center gap-3 py-2.5 first:pt-1 last:pb-1">
                <FileTypeIcon
                  fileName={file.name}
                  contentType={file.type}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg" title={file.name}>
                    {file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {fileKindLabel(file.name, file.type)} · {formatBytes(file.size)}
                  </p>
                </div>
                <IconButton
                  icon={X}
                  label={`Remove ${file.name}`}
                  onClick={() => onRemove(index)}
                  disabled={disabled}
                />
              </li>
            ))}
          </ul>

          <div className="mt-2 border-t border-line pt-3">
            <Button
              variant="ghost"
              size="sm"
              icon={FilePlus2}
              onClick={openPicker}
              disabled={disabled}
            >
              Add files
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Choose files to upload"
          aria-disabled={disabled}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 text-center sm:py-12",
            focusRing,
            transitionBase,
            dragging
              ? "border-accent bg-accent-soft"
              : "border-line-strong bg-elevated hover:border-accent hover:bg-accent-soft/50",
            disabled && "pointer-events-none opacity-60"
          )}
        >
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              dragging ? "bg-accent text-accent-fg" : "bg-surface text-accent",
              transitionBase
            )}
          >
            <UploadCloud size={22} aria-hidden />
          </span>

          <div className="space-y-1">
            <p className="text-sm font-medium text-fg">
              Drag files here or browse
            </p>
            <p className="text-xs text-muted">
              Several files are zipped automatically; a single file is sent as-is
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <p className="text-xs text-faint">
          Up to {maxMb} MB per drop · {ALLOWED_EXTENSIONS.join(", ")}
        </p>
      </div>

      {error && <p className="px-0.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

