/**
 * Mirrors the backend contract so the UI can validate before uploading.
 * Sources: application.yml (allowed-types, multipart limits),
 * ExpiryProperties (default-hours 24, max-hours 168), SlugValidator.
 */

import { formatBytes } from "./utils";

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // spring.servlet.multipart.max-file-size

/**
 * UI-only cap on how many files one drop may bundle. The backend has no such
 * limit — this just keeps the client-side zip (and the unpack list) sane.
 */
export const MAX_BUNDLE_FILES = 20;

export const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "pdf",
  "txt",
  "csv",
  "docx",
  "xlsx",
  "pptx",
  "zip",
] as const;

export const ALLOWED_ACCEPT = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",");

export const DEFAULT_EXPIRY_HOURS = 24; // dropctl.expiry.default-hours
export const MAX_EXPIRY_HOURS = 168; // dropctl.expiry.max-hours

export interface ExpiryOption {
  hours: number;
  label: string;
  short: string;
}

export const EXPIRY_OPTIONS: ExpiryOption[] = [
  { hours: 1, label: "1 hour", short: "1h" },
  { hours: 6, label: "6 hours", short: "6h" },
  { hours: 24, label: "24 hours", short: "24h" },
  { hours: 72, label: "3 days", short: "3d" },
  { hours: 168, label: "7 days", short: "7d" },
];

// Mirrors SlugValidator: ^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;
export const SLUG_MIN = 3;
export const SLUG_MAX = 32;

export const RESERVED_SLUGS = new Set([
  "api",
  "download",
  "actuator",
  "health",
  "admin",
  "qr",
  "static",
  "assets",
  "drops",
  "drop",
  "upload",
  "login",
  "auth",
  "www",
  "help",
]);

export function validateSlug(raw: string): string | null {
  const slug = raw.trim().toLowerCase();
  if (!slug) return null;
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX) {
    return `Slug must be ${SLUG_MIN}–${SLUG_MAX} characters.`;
  }
  if (!SLUG_PATTERN.test(slug)) {
    return "Use lowercase letters, digits and hyphens; no leading or trailing hyphen.";
  }
  if (RESERVED_SLUGS.has(slug)) return "That slug is reserved.";
  return null;
}

/**
 * Accepts a bare slug, "#slug", "/slug" or a full pasted share link
 * ("https://drop.example.com/#my-file") and reduces it to the slug itself.
 */
export function normalizeSlugInput(raw: string): string {
  let value = raw.trim();
  const hashAt = value.lastIndexOf("#");
  if (hashAt !== -1) {
    value = value.slice(hashAt + 1);
  } else if (value.includes("/")) {
    value = value.split("/").filter(Boolean).pop() ?? value;
  }
  return value.replace(/^\/+|\/+$/g, "").toLowerCase();
}

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export function validateFile(file: File): string | null {
  const ext = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}.`;
  }
  if (file.size > MAX_FILE_BYTES) {
    return `File is too large. Maximum size is ${(
      MAX_FILE_BYTES /
      1024 /
      1024
    ).toFixed(0)} MB.`;
  }
  if (file.size === 0) return "File is empty.";
  return null;
}

/**
 * Validates a multi-file selection. Every file must pass the single-file
 * rules, and — because several files are zipped into one upload — the total
 * uncompressed size must also fit the server's per-file envelope.
 */
export function validateFiles(files: File[]): string | null {
  if (files.length === 0) return null;
  if (files.length > MAX_BUNDLE_FILES) {
    return `Choose at most ${MAX_BUNDLE_FILES} files.`;
  }
  for (const file of files) {
    const error = validateFile(file);
    if (error) return `${file.name}: ${error}`;
  }
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (total > MAX_FILE_BYTES) {
    return `Selected files total ${formatBytes(total)}, above the ${(
      MAX_FILE_BYTES /
      1024 /
      1024
    ).toFixed(0)} MB limit for one drop.`;
  }
  return null;
}
