import { useState } from "react";
import {
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  UploadCloud,
} from "lucide-react";
import type { UploadResponse } from "../api/types";
import { getDownloadUrl, uploadFile } from "../api/client";
import {
  ALLOWED_EXTENSIONS,
  DEFAULT_EXPIRY_HOURS,
  EXPIRY_OPTIONS,
  MAX_EXPIRY_HOURS,
  MAX_FILE_BYTES,
  validateFile,
  validateSlug,
} from "../lib/config";
import { cn } from "../lib/utils";
import { shareUrlFor } from "../lib/router";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ArrowFillButton } from "../components/ui/ArrowFillButton";
import { Alert } from "../components/ui/Alert";
import { Segmented } from "../components/ui/Segmented";
import { Field, TextInput } from "../components/ui/Field";
import { PageIntro } from "../components/layout/PageIntro";
import { FileDropZone } from "../components/drop/FileDropZone";
import { FileDetailsCard } from "../components/drop/FileDetailsCard";
import { OpenDropCard } from "../components/drop/OpenDropCard";
import { QrCodeCard, ShareLinkCard } from "../components/drop/ShareCard";
import { HomeContent } from "../components/home/HomeContent";
import { focusRing, transitionBase } from "../lib/styles";
import { HOME_DESCRIPTION, HOME_TITLE, useSeo } from "../lib/seo";

/** Reference panel listing the real, enforced limits of the service. */
function LimitsPanel() {
  const rows = [
    { label: "Max file size", value: `${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB` },
    { label: "Link lifetime", value: `1h → ${MAX_EXPIRY_HOURS / 24}d` },
    { label: "At rest", value: "AES-256" },
    { label: "On expiry", value: "deleted" },
  ];

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <p className="font-mono text-[11px] tracking-[0.16em] text-faint uppercase">
        Limits
      </p>

      <dl className="mt-3.5 divide-y divide-line">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-2"
          >
            <dt className="text-[13px] text-muted">{row.label}</dt>
            <dd className="font-mono text-[13px] text-fg">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t border-line pt-3.5">
        <p className="font-mono text-[11px] tracking-[0.16em] text-faint uppercase">
          Accepted
        </p>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
          {ALLOWED_EXTENSIONS.join(" · ")}
        </p>
      </div>
    </div>
  );
}

function UploadForm({
  onUploaded,
}: {
  onUploaded: (result: UploadResponse) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [slug, setSlug] = useState("");
  const [expiryHours, setExpiryHours] = useState<number>(DEFAULT_EXPIRY_HOURS);
  const [showOptions, setShowOptions] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const slugError = slug.trim() ? validateSlug(slug) : null;
  const activeOption = EXPIRY_OPTIONS.find((o) => o.hours === expiryHours);

  const handleSelect = (next: File) => {
    const error = validateFile(next);
    setFileError(error);
    setFormError(null);
    if (error) {
      setFile(null);
      return;
    }
    setFile(next);
  };

  const handleClear = () => {
    setFile(null);
    setFileError(null);
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!file) {
      setFileError("Choose a file to upload first.");
      return;
    }
    if (slugError) {
      setShowOptions(true);
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFile(file, slug.trim() || undefined, expiryHours);
      onUploaded(result);
    } catch (err) {
      const detail =
        typeof err === "object" && err && "detail" in err
          ? String((err as { detail: unknown }).detail)
          : "Upload failed. Please try again.";
      setFormError(detail);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card padding="lg" className="animate-rise">
      <CardHeader
        icon={UploadCloud}
        title="Upload a file"
        description="One file per drop. The link stops working the moment it expires."
      />

      <div className="mt-5 space-y-5">
        <FileDropZone
          file={file}
          onSelect={handleSelect}
          onClear={handleClear}
          error={fileError}
          disabled={uploading}
        />

        <div className="rounded-xl border border-line">
          <button
            type="button"
            onClick={() => setShowOptions((v) => !v)}
            aria-expanded={showOptions}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left",
              "hover:bg-elevated",
              focusRing,
              transitionBase
            )}
          >
            <span className="flex items-center gap-2.5">
              <SlidersHorizontal size={15} className="text-faint" aria-hidden />
              <span className="text-sm font-medium text-fg">
                Drop options
              </span>
            </span>

            <span className="flex items-center gap-2.5 font-mono text-[11px] text-muted">
              <span className="truncate">
                {slug.trim() ? `/${slug.trim().toLowerCase()}` : "auto-slug"}
              </span>
              <span aria-hidden className="text-line-strong">
                /
              </span>
              <span>{activeOption?.short}</span>
              <ChevronDown
                size={15}
                className={cn(
                  "shrink-0 transition-transform duration-200",
                  showOptions && "rotate-180"
                )}
                aria-hidden
              />
            </span>
          </button>

          {showOptions && (
            <div className="space-y-5 border-t border-line px-4 py-4">
              <Field
                label="Custom slug"
                optional
                htmlFor="upload-slug"
                error={slugError}
                hint="Leave blank to generate one. Lowercase letters, digits, hyphens."
              >
                <TextInput
                  id="upload-slug"
                  value={slug}
                  invalid={Boolean(slugError)}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-holiday-photos"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={uploading}
                  className="font-mono"
                />
              </Field>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <label className="text-sm font-medium text-fg">
                    Expires after
                  </label>
                  <span className="font-mono text-[11px] text-faint">
                    {activeOption?.label}
                  </span>
                </div>
                <Segmented
                  ariaLabel="Link expiry"
                  options={EXPIRY_OPTIONS.map((o) => ({
                    value: o.hours,
                    label: o.short,
                    title: o.label,
                  }))}
                  value={expiryHours}
                  onChange={setExpiryHours}
                />
              </div>
            </div>
          )}
        </div>

        {formError && (
          <Alert tone="danger" title="Upload failed">
            {formError}
          </Alert>
        )}

        <div className="flex flex-col items-start gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-faint">
            <ShieldCheck size={14} className="shrink-0" aria-hidden />
            Expired drops are purged from storage, not just hidden.
          </p>

          <ArrowFillButton
            onClick={handleSubmit}
            disabled={!file}
            loading={uploading}
          >
            {uploading ? "Uploading" : "Create drop"}
          </ArrowFillButton>
        </div>
      </div>
    </Card>
  );
}

function UploadResult({
  result,
  onReset,
}: {
  result: UploadResponse;
  onReset: () => void;
}) {
  const shareUrl = shareUrlFor(result.slug, result.url);

  return (
    <div className="animate-rise space-y-5">
      <Alert tone="success" title="Drop created">
        Your file is live and ready to share. It will be removed automatically
        when the link expires.
      </Alert>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <FileDetailsCard
            slug={result.slug}
            fileName={result.fileName}
            contentType={result.contentType}
            sizeBytes={result.sizeBytes}
            createdAt={result.createdAt}
            expiresAt={result.expiresAt}
            downloadHref={getDownloadUrl(result.slug)}
          />
          <ShareLinkCard slug={result.slug} shareUrl={shareUrl} />
        </div>

        <div className="space-y-5">
          <QrCodeCard slug={result.slug} shareUrl={shareUrl} />
          <Card padding="lg">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-faint">
                <Timer size={16} aria-hidden />
              </span>
              <p className="text-sm text-muted">
                Once a drop expires it cannot be recovered — keep the link
                somewhere useful.
              </p>
            </div>
            <Button
              variant="secondary"
              size="md"
              icon={RotateCcw}
              fullWidth
              onClick={onReset}
              className="mt-4"
            >
              Upload another file
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function UploadPage() {
  const [result, setResult] = useState<UploadResponse | null>(null);

  useSeo({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
  });

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageIntro
        kicker="Temporary file drops"
        title="Send a file that deletes itself."
        description="Upload a file, get a short link and a QR code, and choose exactly how long it should live."
      />

      {result ? (
        <UploadResult result={result} onReset={() => setResult(null)} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-3">
            <UploadForm onUploaded={setResult} />
          </div>
          <div className="space-y-5 lg:col-span-2">
            <OpenDropCard />
            <LimitsPanel />
          </div>
        </div>
      )}

      {!result && <HomeContent />}
    </div>
  );
}
