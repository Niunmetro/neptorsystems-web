// @ts-check
import { defineConfig } from 'astro/config';

// Production site URL — used for canonicals, hreflang, sitemap and OG absolute URLs.
export default defineConfig({
  site: 'https://neptorsystems.com',
  trailingSlash: 'ignore',
  build: {
    // Emit /en/ as /en/index.html and legal pages as directory/index.html for clean URLs.
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
