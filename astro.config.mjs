import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TO CONFIRM: replace with the real domain once purchased (also update src/content/company.yaml).
const SITE_URL = 'https://anushrisystems.netlify.app';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.includes('/thank-you') })],
  build: { inlineStylesheets: 'auto' },
});
