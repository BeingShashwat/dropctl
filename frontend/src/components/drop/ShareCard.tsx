import { ExternalLink, Link2, QrCode as QrCodeIcon } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { CopyButton } from "../ui/CopyButton";
import { Button, ButtonLink } from "../ui/Button";
import { getQrCodeUrl } from "../../api/client";
import { navigate } from "../../lib/router";

export function ShareLinkCard({
  slug,
  shareUrl,
  className,
}: {
  slug: string;
  shareUrl: string;
  className?: string;
}) {
  return (
    <Card padding="lg" className={className}>
      <CardHeader
        icon={Link2}
        title="Share link"
        description="Anyone with this link can download the file until it expires."
      />

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-elevated p-1.5 pl-3">
          <p
            className="min-w-0 flex-1 truncate font-mono text-xs text-fg sm:text-sm"
            title={shareUrl}
          >
            {shareUrl}
          </p>
          <CopyButton value={shareUrl} variant="secondary" size="sm" />
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={ExternalLink}
          fullWidth
          onClick={() => navigate(slug)}
        >
          Open drop page
        </Button>
      </div>
    </Card>
  );
}

export function QrCodeCard({
  slug,
  shareUrl,
  className,
}: {
  slug: string;
  shareUrl: string;
  className?: string;
}) {
  const qrUrl = getQrCodeUrl(slug);

  return (
    <Card padding="lg" className={className}>
      <CardHeader
        icon={QrCodeIcon}
        title="QR code"
        description="Point a phone camera at the code to open the download."
      />

      <div className="mt-5 flex flex-col items-center gap-4">
        {/* QR quiet zones must stay white for scanners in both themes. */}
        <div className="rounded-xl border border-line bg-[var(--qr-quiet)] p-3">
          <img
            src={qrUrl}
            alt={`QR code linking to the download page for ${slug}`}
            width={176}
            height={176}
            className="h-40 w-40 sm:h-44 sm:w-44"
            loading="lazy"
          />
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <ButtonLink
            href={qrUrl}
            download={`dropctl-${slug}-qr.png`}
            variant="secondary"
            size="md"
            fullWidth
            className="w-full sm:flex-1"
          >
            Download QR
          </ButtonLink>
          <CopyButton
            value={shareUrl}
            label="Copy link"
            variant="secondary"
            size="md"
            className="w-full sm:flex-1"
          />
        </div>
      </div>
    </Card>
  );
}
