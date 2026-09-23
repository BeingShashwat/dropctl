import { CalendarClock, HardDrive, Layers, Timer, type LucideIcon } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ArrowFillButton } from "../ui/ArrowFillButton";
import { FileTypeIcon } from "./FileTypeIcon";
import { BundleContents } from "./BundleContents";
import {
  fileKindLabel,
  formatBytes,
  formatCountdown,
  formatDateTime,
} from "../../lib/utils";

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="flex items-center gap-2 text-sm text-muted">
        <Icon size={15} className="text-faint" aria-hidden />
        {label}
      </span>
      <span className="truncate text-right text-sm font-medium text-fg">
        {value}
      </span>
    </div>
  );
}

export function FileDetailsCard({
  slug,
  fileName,
  contentType,
  sizeBytes,
  createdAt,
  expiresAt,
  isBundle = false,
  downloadHref,
}: {
  slug: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt?: string;
  expiresAt: string;
  isBundle?: boolean;
  downloadHref: string;
}) {
  const countdown = formatCountdown(expiresAt);
  const expired = countdown === "Expired";

  return (
    <Card padding="lg" className="animate-rise">
      <CardHeader
        icon={HardDrive}
        title="File details"
        description={
          <span className="break-all font-mono text-xs">
            Identified by slug "{slug}"
          </span>
        }
      />

      <div className="mt-5 flex items-center gap-4">
        <FileTypeIcon
          fileName={fileName}
          contentType={contentType}
          size="lg"
          className="hidden sm:flex"
        />
        <FileTypeIcon
          fileName={fileName}
          contentType={contentType}
          size="md"
          className="sm:hidden"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg" title={fileName}>
            {fileName}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {isBundle && (
              <Badge tone="accent" icon={Layers}>
                Bundle
              </Badge>
            )}
            <Badge tone="neutral">{fileKindLabel(fileName, contentType)}</Badge>
            <span className="text-xs text-muted">{formatBytes(sizeBytes)}</span>
            <Badge tone={expired ? "danger" : "success"} icon={Timer}>
              {countdown}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-5 divide-y divide-line border-t border-line">
        {createdAt && (
          <MetaRow
            icon={CalendarClock}
            label="Uploaded"
            value={formatDateTime(createdAt)}
          />
        )}
        <MetaRow icon={Timer} label="Expires" value={formatDateTime(expiresAt)} />
      </div>

      <div className="mt-5">
        {isBundle ? (
          <BundleContents slug={slug} downloadHref={downloadHref} expired={expired} />
        ) : (
          /* No `download` attribute here: the server already sends a named
             Content-Disposition header, and setting one would override it. */
          <ArrowFillButton href={downloadHref} disabled={expired} fluid>
            {expired ? "File expired" : "Download file"}
          </ArrowFillButton>
        )}
      </div>
    </Card>
  );
}
