import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { readFileSync } from "node:fs";
import { join, posix } from "node:path";

/**
 * Emits robots.txt (and sitemap.xml when a site URL is configured) so those
 * files can never drift from the deployed origin. Set VITE_SITE_URL to the
 * public origin, e.g. VITE_SITE_URL=https://dropctl.example.com
 */
function seoAssets(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/+$/, "");

  const robots = [
    "# dropctl",
    "#",
    "# The landing page is public and indexable. Anything that serves user",
    "# content is not.",
    "#",
    "# Individual drops live at /#<slug>. The fragment is never sent to the",
    "# server, so it cannot be listed here — the app marks those views",
    "# \"noindex\" itself. Drops are private, per-recipient links: they must",
    "# never be crawled, cached or archived.",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    "Disallow: /api/",
    "Disallow: /actuator/",
    "",
    ...(base ? [`Sitemap: ${base}/sitemap.xml`, ""] : []),
  ].join("\n");

  const sitemap = base
    ? [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        "  <!-- Only the landing page is public; drops are private links. -->",
        "  <url>",
        `    <loc>${base}/</loc>`,
        "    <changefreq>weekly</changefreq>",
        "    <priority>1.0</priority>",
        "  </url>",
        "</urlset>",
        "",
      ].join("\n")
    : "";

  return {
    name: "dropctl-seo-assets",

    configResolved(config) {
      if (!base && config.command === "build") {
        config.logger.warn(
          "\n[dropctl] VITE_SITE_URL is not set — robots.txt will omit the " +
            "Sitemap line and sitemap.xml will not be generated.\n" +
            "          Set it to your public origin to enable both.\n"
        );
      }
    },

    /**
     * index.html carries %SITE_URL% in its canonical, Open Graph and JSON-LD
     * tags. Resolve it at build time so crawlers that skip JavaScript get
     * absolute URLs, and drop those lines entirely when no origin is known
     * rather than emitting a broken or relative one.
     */
    transformIndexHtml(html) {
      if (base) return html.replaceAll("%SITE_URL%", base);
      return html
        .split("\n")
        .filter((line) => !line.includes("%SITE_URL%"))
        .join("\n");
    },

    configureServer(server) {
      // The sarcastic 404 page, read from public/ and cached for the session.
      let notFoundPage: string | null = null;
      const notFoundHtml = (): string => {
        if (notFoundPage === null) {
          try {
            notFoundPage = readFileSync(
              join(process.cwd(), "public", "404.html"),
              "utf8"
            );
          } catch {
            notFoundPage = "<!doctype html><title>404</title><p>404 — nothing here.</p>";
          }
        }
        return notFoundPage;
      };

      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "/").split("?")[0];

        if (url === "/robots.txt") {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(robots);
          return;
        }
        if (url === "/sitemap.xml" && sitemap) {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(sitemap);
          return;
        }

        /*
         * Unknown application paths get the real 404 status plus the real
         * page — unlike Vite's SPA fallback, which would serve index.html
         * with a 200 and teach crawlers that every typo "exists".
         * Module/asset URLs (with a dot) and Vite internals stay untouched.
         */
        const isViteInternal =
          url.startsWith("/@") ||
          url.startsWith("/src/") ||
          url.startsWith("/node_modules/") ||
          url.startsWith("/api/");
        const looksLikeAsset = posix.extname(url) !== "";
        const wantsHtml = (req.headers.accept ?? "").includes("text/html");

        if (
          req.method === "GET" &&
          url !== "/" &&
          url !== "/index.html" &&
          !isViteInternal &&
          !looksLikeAsset &&
          wantsHtml
        ) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(notFoundHtml());
          return;
        }

        next();
      });
    },

    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
      if (sitemap) {
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: sitemap,
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react(), tailwindcss(), seoAssets(env.VITE_SITE_URL ?? "")],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  };
});
