# Anushri Systems: Website Content Guide

All business information for the website lives in **`src/content/`** as simple text files (YAML).
You do **not** need to touch any other code to change wording, numbers, services, projects or reviews.

After editing, run `npm run build` (or just push to Netlify) and the site updates.

## Status labels

Every item that makes a claim carries a `status`:

| Status | Meaning | Shown on website? |
|---|---|---|
| `verified` | Supplied/confirmed by the company | **Yes** |
| `placeholder` | Still to be supplied | **No** (hidden) |
| `to-confirm` | Needs clarification | **No** (hidden) |

**Rule:** never set `verified` unless the information is real and approved.

## Where is everything?

| What you want to change | File |
|---|---|
| Phone, WhatsApp, email, location, SEO title/description, website URL | `src/content/company.yaml` |
| Hero headline, About text, section headings, final call-to-action | `src/content/site.yaml` |
| Services (add, edit, remove) | `src/content/services.yaml` |
| PLC / robot / automation technology lists | `src/content/technologies.yaml` |
| Statistics (100+ projects, 100% satisfaction) | `src/content/statistics.yaml` |
| "How we work" steps | `src/content/process.yaml` |
| **Projects**, one file per project | `src/content/projects/` (copy `_template.yaml`) |
| **Client companies and logos** | `src/content/clients.yaml` |
| **Customer reviews** | `src/content/testimonials.yaml` |
| **WhatsApp pre-written messages** | `whatsapp:` block at the bottom of `site.yaml`; per-service text in `services.yaml` (`whatsappMessage`); per-platform text in `technologies.yaml` |
| Photos (alt text, captions, licence credits) | `src/content/images.yaml` + files in `src/assets/images/` |

## How to add things later

- **A project:** copy `src/content/projects/_template.yaml`, rename it, fill in real details, set `status: verified`. Add photos to `src/assets/images/projects/`.
- **A client:** add a block to `clients.yaml` (template inside). The Clients section appears automatically once there is one verified client.
- **A review:** add a block to `testimonials.yaml`. The carousel replaces the "feedback is collected" message automatically.
- **Exact address / map pin:** set `exactAddress` and `coordinates` in `company.yaml` (then tell the developer so the map can show a pin).
- **A real domain:** change `site.url` in `company.yaml` and `site` in `astro.config.mjs`.

## Current status summary

| Area | State |
|---|---|
| Company, owner, phone, WhatsApp, email, location (village only) | VERIFIED |
| Services (8), PLC platforms, robot platforms | VERIFIED |
| Statistics: 100+ projects, 100% satisfaction | VERIFIED (owner states feedback records exist; keep them on file) |
| Projects | EMPTY: awaiting data |
| Clients | 6 companies supplied (names only, shown as text wordmarks; logo files still welcome) |
| Reviews | EMPTY: awaiting data |
| Exact address / GPS | PLACEHOLDER |
| Domain | TO CONFIRM (no domain yet; temporary Netlify URL) |
| Certifications, industries, years in business, service area | NOT SUPPLIED: not shown |
| Photographs | 5 licensed stock photos (Wikimedia Commons), labelled "illustrative", credited at /credits/. Replace with real photos when available |

## Content rules (what we never invent)

Clients, testimonials, certifications, awards, years of experience, project counts beyond the supplied figures, partnerships, OEM authorisation, industries, performance statistics, revenue, employee count, factory/office size.
