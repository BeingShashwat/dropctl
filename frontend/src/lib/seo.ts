import { useEffect } from "react";
import type { Question } from "./content";

/**
 * Runtime SEO for a hash-routed SPA.
 *
 * The document head is the only place a client-rendered app can influence
 * crawlers, so every route declares its own title, description and canonical
 * URL here, and private routes explicitly opt out of indexing.
 *
 * NOTE: the strings below are mirrored in index.html so crawlers that do not
 * execute JavaScript still receive them. Change both together.
 */

const CONFIGURED_SITE_URL = import.meta.env.VITE_SITE_URL?.trim();

export const SITE_NAME = "dropctl";

export const HOME_TITLE =
  "dropctl — Temporary File Sharing with Self-Deleting Links";

export const HOME_DESCRIPTION =
  "Share a file with a short link and QR code that deletes itself. Pick an expiry from 1 hour to 7 days, skip the sign-up, and know the file is gone when the link stops working.";

export const OG_IMAGE = "/og-image.png";

/** Absolute origin, preferring the configured site URL over the live origin. */
export function siteOrigin(): string {
  const configured = CONFIGURED_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function absoluteUrl(path = "/"): string {
  const origin = siteOrigin();
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${clean}`;
}

function setMeta(attr: "name" | "property", key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setLink(rel: string, href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export interface SeoOptions {
  title: string;
  description: string;
  /** Canonical path for this view. */
  path?: string;
  /** Robots directive. Private views must pass "noindex, nofollow". */
  robots?: string;
  type?: "website" | "article";
  image?: string;
}

const INDEXABLE = "index, follow, max-image-preview:large, max-snippet:-1";

export function setSeo({
  title,
  description,
  path = "/",
  robots = INDEXABLE,
  type = "website",
  image = OG_IMAGE,
}: SeoOptions): void {
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

  document.title = title;

  setMeta("name", "description", description);
  setMeta("name", "robots", robots);

  // A noindex view should not also declare a canonical URL: the two signals
  // contradict each other, and drops are private rather than duplicates.
  if (robots.includes("noindex")) {
    document.head.querySelector('link[rel="canonical"]')?.remove();
  } else {
    setLink("canonical", url);
  }

  setMeta("property", "og:site_name", SITE_NAME);
  setMeta("property", "og:type", type);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:image", imageUrl);
  setMeta("property", "og:image:alt", `${SITE_NAME} — ${title}`);

  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", imageUrl);
  setMeta("name", "twitter:image:alt", `${SITE_NAME} — ${title}`);
}

function setJsonLd(id: string, data: unknown): void {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/**
 * Publishes FAQPage structured data built from the same array the page
 * renders, so the markup can never disagree with the visible answers.
 */
export function useFaqJsonLd(items: Question[]): void {
  useEffect(() => {
    const id = "dropctl-faq-jsonld";
    setJsonLd(id, {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
    return () => document.getElementById(id)?.remove();
  }, [items]);
}

/** Declares SEO metadata for the lifetime of a route. */
export function useSeo({
  title,
  description,
  path = "/",
  robots,
  type,
  image,
}: SeoOptions): void {
  useEffect(() => {
    setSeo({ title, description, path, robots, type, image });
  }, [title, description, path, robots, type, image]);
}
