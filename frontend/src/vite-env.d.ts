/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Public origin of the deployment, e.g. https://dropctl.example.com.
   * Drives canonical URLs, Open Graph tags, robots.txt and sitemap.xml.
   */
  readonly VITE_SITE_URL?: string;
}
