import { useEffect, useState } from "react";
import { FileQuestion, Home, Hourglass } from "lucide-react";
import type { ApiError, DropInfoResponse } from "../api/types";
import { getDownloadUrl, getDropInfo } from "../api/client";
import { navigate, shareUrlFor } from "../lib/router";
import { useSeo } from "../lib/seo";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ArrowFillButton } from "../components/ui/ArrowFillButton";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { PageIntro } from "../components/layout/PageIntro";
import { FileDetailsCard } from "../components/drop/FileDetailsCard";
import { QrCodeCard, ShareLinkCard } from "../components/drop/ShareCard";

type Status = "loading" | "ready" | "not-found" | "expired" | "error";

interface LoadState {
  status: Status;
  info: DropInfoResponse | null;
  message: string;
}

const INITIAL: LoadState = { status: "loading", info: null, message: "" };

function DropSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading drop details</span>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card padding="lg" className="space-y-5">
          <div className="flex items-start gap-3 border-b border-line pb-4">
            <Skeleton className="h-8 w-8" rounded="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14" rounded="xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" rounded="lg" />
        </Card>
        <Card padding="lg" className="space-y-4">
          <Skeleton className="h-8 w-40" rounded="lg" />
          <Skeleton className="h-24 w-full" rounded="lg" />
          <Skeleton className="h-10 w-full" rounded="lg" />
        </Card>
      </div>
    </div>
  );
}

/**
 * Owns the fetch for a single slug. Remounted (via key) on retry so its state
 * always starts clean and the effect never has to reset it synchronously.
 */
function DropLoader({
  slug,
  onRetry,
}: {
  slug: string;
  onRetry: () => void;
}) {
  const [state, setState] = useState<LoadState>(INITIAL);

  useEffect(() => {
    const controller = new AbortController();

    getDropInfo(slug)
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ status: "ready", info: data, message: "" });
      })
      .catch((err: ApiError) => {
        if (controller.signal.aborted) return;
        setState({
          status:
            err?.status === 404
              ? "not-found"
              : err?.status === 410
                ? "expired"
                : "error",
          info: null,
          message: err?.detail ?? "An unexpected error occurred.",
        });
      });

    return () => controller.abort();
  }, [slug]);

  const goHome = () => navigate();

  if (state.status === "loading") return <DropSkeleton />;

  if (state.status === "ready" && state.info) {
    const { info } = state;
    const shareUrl = shareUrlFor(info.slug);
    return (
      <div className="grid animate-rise gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <FileDetailsCard
            slug={info.slug}
            fileName={info.fileName}
            contentType={info.contentType}
            sizeBytes={info.sizeBytes}
            expiresAt={info.expiresAt}
            downloadHref={getDownloadUrl(info.slug)}
          />
          <ShareLinkCard slug={info.slug} shareUrl={shareUrl} />
        </div>
        <div className="space-y-5">
          <QrCodeCard slug={info.slug} shareUrl={shareUrl} />
        </div>
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <Card padding="none" className="animate-rise">
        <EmptyState
          icon={FileQuestion}
          title="No drop found here"
          description="This link does not point to an active file. It may have been typed incorrectly, or the drop was already removed."
          actions={
            <ArrowFillButton onClick={goHome}>Upload a new file</ArrowFillButton>
          }
        />
      </Card>
    );
  }

  if (state.status === "expired") {
    return (
      <Card padding="none" className="animate-rise">
        <EmptyState
          icon={Hourglass}
          tone="warning"
          title="This drop has expired"
          description="Expired files are deleted from storage, so this one can no longer be downloaded. Ask the sender for a fresh link."
          actions={
            <ArrowFillButton onClick={goHome}>Upload a new file</ArrowFillButton>
          }
        />
      </Card>
    );
  }

  return (
    <Card padding="none" className="animate-rise">
      <EmptyState
        icon={FileQuestion}
        tone="danger"
        title="Could not load this drop"
        description={state.message}
        actions={
          <>
            <ArrowFillButton onClick={onRetry}>Try again</ArrowFillButton>
            <Button variant="secondary" size="md" icon={Home} onClick={goHome}>
              Back to upload
            </Button>
          </>
        }
      />
    </Card>
  );
}

export function DropPage({ slug }: { slug: string }) {
  const [attempt, setAttempt] = useState(0);

  // Drop links are private, per-recipient URLs — they must never be indexed,
  // cached or archived, so this view opts out of search entirely.
  useSeo({
    title: `${slug} · dropctl`,
    description:
      "A file shared over dropctl. Open the link to download it or check how long it has left.",
    robots: "noindex, nofollow, noarchive, nosnippet",
  });

  return (
    <div className="space-y-8">
      <PageIntro
        kicker="Received a drop"
        title="Shared file"
        description="Check what arrived, then download it or pass the link on."
      />
      <DropLoader
        key={`${slug}:${attempt}`}
        slug={slug}
        onRetry={() => setAttempt((n) => n + 1)}
      />
    </div>
  );
}
