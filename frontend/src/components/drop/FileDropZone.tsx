import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileUp, UploadCloud, X } from "lucide-react";
import { cn, formatBytes, fileKindLabel } from "../../lib/utils";
import { ALLOWED_ACCEPT, ALLOWED_EXTENSIONS, MAX_FILE_BYTES } from "../../lib/config";
import { focusRing, transitionBase } from "../../lib/styles";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { FileTypeIcon } from "./FileTypeIcon";

export function FileDropZone({
  file,
  onSelect,
  onClear,
  error,
  disabled = false,
}: {
  file: File | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  error?: string | null;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0];
    if (next) onSelect(next);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onSelect(dropped);
  };

  const maxMb = Math.round(MAX_FILE_BYTES / 1024 / 1024);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_ACCEPT}
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-elevated p-3.5 sm:p-4">
          <FileTypeIcon
            fileName={file.name}
            contentType={file.type}
            size="lg"
            className="hidden sm:flex"
          />
          <FileTypeIcon
            fileName={file.name}
            contentType={file.type}
            size="md"
            className="sm:hidden"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg" title={file.name}>
              {file.name}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{fileKindLabel(file.name, file.type)}</Badge>
              <span className="text-xs text-muted">{formatBytes(file.size)}</span>
            </div>
          </div>

          <IconButton
            icon={X}
            label="Remove selected file"
            onClick={onClear}
            disabled={disabled}
          />
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
          aria-label="Choose a file to upload"
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
              Drag and drop your file here
            </p>
            <p className="text-xs text-muted">
              or <span className="text-accent underline underline-offset-2">browse</span> from your device
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <p className="text-xs text-faint">
          Up to {maxMb} MB · {ALLOWED_EXTENSIONS.join(", ")}
        </p>
        {!file && (
          <Button
            variant="ghost"
            size="sm"
            icon={FileUp}
            onClick={openPicker}
            disabled={disabled}
          >
            Choose file
          </Button>
        )}
      </div>

      {error && <p className="px-0.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
