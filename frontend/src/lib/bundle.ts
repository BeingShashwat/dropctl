/**
 * Client-side bundling.
 *
 * Multiple selected files are zipped in the browser and uploaded as one
 * `isBundle=true` drop; on download the bundle is unzipped in the browser and
 * the individual files are offered back. A single selected file — including a
 * genuine .zip the user already had — is never wrapped: it travels as-is.
 */

import JSZip from "jszip";

export interface BundleEntry {
  /** Path as stored in the archive; may contain folders. */
  name: string;
  /** Uncompressed size in bytes, when the archive reports it. */
  size: number | null;
  blob: Blob;
}

export function bundleFileName(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `dropctl-files-${stamp}.zip`;
}

/** Strips any folder path so the browser never sees a traverse-y name. */
export function entryBaseName(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

/** `a.txt` twice becomes `a.txt` and `a (2).txt` inside one archive. */
function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  for (let i = 2; ; i += 1) {
    const candidate = `${stem} (${i})${ext}`;
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
}

/**
 * Zips the given files (flat, names de-duplicated) into a single .zip File
 * suitable for the normal upload flow. Only called for 2+ files.
 */
export async function zipFiles(files: File[]): Promise<File> {
  const zip = new JSZip();
  const used = new Set<string>();
  for (const file of files) {
    zip.file(uniqueName(file.name, used), file);
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return new File([blob], bundleFileName(), { type: "application/zip" });
}

/** Archive noise that should never be shown to the receiver. */
function isJunkEntry(path: string): boolean {
  const base = entryBaseName(path);
  return path.startsWith("__MACOSX/") || base === ".DS_Store";
}

function uncompressedSize(entry: JSZip.JSZipObject): number | null {
  // JSZip carries central-directory sizes on an internal field; used with a
  // defensive fallback so a future version that drops it degrades to "—".
  const data = (
    entry as unknown as { _data?: { uncompressedSize?: number } }
  )._data;
  return typeof data?.uncompressedSize === "number"
    ? data.uncompressedSize
    : null;
}

/**
 * Extracts a downloaded bundle into individual files. Directory entries are
 * skipped and every presented name is flattened through entryBaseName().
 */
export async function unzipBlob(blob: Blob): Promise<BundleEntry[]> {
  const zip = await JSZip.loadAsync(blob);

  const fileEntries: JSZip.JSZipObject[] = [];
  zip.forEach((path, entry) => {
    if (!entry.dir && !isJunkEntry(path)) fileEntries.push(entry);
  });

  const entries: BundleEntry[] = [];
  for (const entry of fileEntries) {
    const blob = await entry.async("blob");
    entries.push({
      name: entryBaseName(entry.name),
      size: uncompressedSize(entry),
      blob,
    });
  }

  if (entries.length === 0) {
    throw new Error("This bundle contains no files.");
  }
  return entries;
}

/** Triggers a browser download for an extracted bundle entry. */
export function downloadBundleEntry(entry: BundleEntry): void {
  const url = URL.createObjectURL(entry.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = entry.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
