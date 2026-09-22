import { useEffect, useState } from "react";

/**
 * The backend shares links as `${baseUrl}/#${slug}` (see AppProperties.shareUrl),
 * so routing is driven entirely by the URL hash: `#` → home, `#<slug>` → drop view.
 */

function readSlug(): string {
  if (typeof window === "undefined") return "";
  // Accepts "#slug", "#/slug" and "#slug/" equally.
  return decodeURIComponent(
    window.location.hash.replace(/^#\/?/, "").replace(/\/+$/, "")
  );
}

export function useRouteSlug(): string {
  const [slug, setSlug] = useState(readSlug);

  useEffect(() => {
    const onChange = () => setSlug(readSlug());
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);

  return slug;
}

export function navigate(slug?: string): void {
  const target = slug ? `#${slug}` : `${window.location.pathname}${window.location.search}`;
  window.history.pushState(null, "", target);
  window.dispatchEvent(new Event("hashchange"));

  // A fresh route should start at the top of the page.
  window.scrollTo(0, 0);
}

/**
 * Prefers the canonical URL the backend built (it is what the QR code encodes),
 * falling back to the current origin so the DropPage can render the same link.
 */
export function shareUrlFor(slug: string, serverUrl?: string): string {
  if (serverUrl) return serverUrl;
  return `${window.location.origin}${window.location.pathname}#${slug}`;
}
