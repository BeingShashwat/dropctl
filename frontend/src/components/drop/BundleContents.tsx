import { useState } from "react";
import { Download, Layers, PackageOpen } from "lucide-react";
import { fetchDropBlob } from "../../api/client";
import {
  downloadBundleEntry,
  unzipBlob,
  type BundleEntry,
} from "../../lib/bundle";
import { formatBytes } from "../../lib/utils";
import { Button, ButtonLink } from "../ui/Button";
import { ArrowFillButton } from "../ui/ArrowFillButton";
import { FileTypeIcon } from "./FileTypeIcon";

function messageOf(err: unknown): string {
  if (typeof err === "object" && err !== null && "detail" in err) {
    return String((err as { detail: unknown }).detail);
  }
  if (err instanceof Error && err.message) return err.message;
  return "Could not unpack this bundle. Please try again.";
}

/**
 * Download flow for isBundle drops: fetches the stored .zip, unzips it in the
 * browser and presents the individual files. Receivers who prefer the raw
 * archive can still take it untouched via the secondary action.
 */
export function BundleContents({
  slug,
  downloadHref,
  expired = false,
}: {
  slug: string;
  downloadHref: string;
  expired?: boolean;
}) {
  const [working, setWorking] = useState(false);
  const [entries, setEntries] = useState<BundleEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unpack = async () => {
    setWorking(true);
    setError(null);
    try {
      const blob = await fetchDropBlob(slug);
      setEntries(await unzipBlob(blob));
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setWorking(false);
    }
  };

  if (expired) {
    return (
      <p className="text-sm text-muted">
        This bundle has expired, so its files can no longer be unpacked.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <ArrowFillButton onClick={unpack} loading={working} fluid>
          {entries ? "Unpack again" : "Unpack files"}
        </ArrowFillButton>

        <ButtonLink
          href={downloadHref}
          variant="secondary"
          size="md"
          icon={PackageOpen}
          fullWidth
          className="w-full sm:ml-auto sm:w-auto"
        >
          Download as .zip
        </ButtonLink>
      </div>

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      {entries && (
        <div className="rounded-xl border border-line bg-elevated">
          <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
            <Layers size={14} className="text-faint" aria-hidden />
            <p className="text-xs font-medium text-fg">
              {entries.length} {entries.length === 1 ? "file" : "files"} inside
            </p>
          </div>

          <ul className="divide-y divide-line">
            {entries.map((entry, index) => (
              <li
                key={`${entry.name}:${index}`}
                className="flex items-center gap-3 px-3.5 py-2.5"
              >
                <FileTypeIcon
                  fileName={entry.name}
                  contentType={entry.blob.type}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg" title={entry.name}>
                    {entry.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {entry.size === null ? "—" : formatBytes(entry.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Download}
                  onClick={() => downloadBundleEntry(entry)}
                >
                  Save
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-faint">
        Files are unpacked in your browser — the archive is never stored here.
      </p>
    </div>
  );
}
