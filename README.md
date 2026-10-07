# Anushri Systems Website

Static website (Astro, no backend) for Anushri Systems, Hatkanagale, Kolhapur.

## Update content
All business content is in `src/content/` (YAML). See **CONTENT.md** for where everything lives and **CONTENT_TODO.md** for information still needed.
Only items with `status: verified` appear on the site.

## Develop
```
npm install
npm run dev        # http://localhost:4321
npm run build      # output in dist/
npm run preview
```
Note: the enquiry form can only deliver on Netlify. Locally it shows the "could not send" fallback.

## Deploy to Netlify
**Option A: Git (recommended)**
1. Push this folder to a GitHub repository.
2. Netlify > Add new site > Import from Git > pick the repo.
3. Build command `npm run build`, publish directory `dist` (already in `netlify.toml`).
4. Deploy.

**Option B: drag and drop**: run `npm run build`, then drag the `dist` folder onto Netlify's "Deploy manually" area. (Forms work, but later content changes need a new build + upload.)

### Enable enquiry form emails
1. After the first deploy: Site configuration > Forms. A form named **quote** should be listed (Netlify detects it from the HTML at deploy time).
2. Forms > Form notifications > Add notification > Email notification > `anushrisystems@gmail.com`.
3. Submit one test enquiry from the live site and confirm it arrives. Free plan: 100 submissions/month. Spam is filtered with a honeypot field.
No API keys or environment variables are needed.

### When a domain is bought
1. Netlify > Domain management > add the domain.
2. Change the URL in `astro.config.mjs` (`SITE_URL`), `src/content/company.yaml` (`site.url`) and `public/robots.txt` (sitemap line), then redeploy.

## Structure
```
src/content/      business content (edit this)
src/components/   page sections
src/lib/content.ts  loads + validates content
src/scripts/main.ts interactions (reveal, tabs, form, modal...)
src/styles/global.css design tokens and styles
src/assets/images/  put real photos here (projects/, clients/)
public/           favicon, og-image.png, robots.txt
```
