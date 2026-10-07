import { parse } from 'yaml';
import { z } from 'astro/zod';
import type { ImageMetadata } from 'astro';

// All YAML in src/content is loaded here, validated, and filtered to `verified` items.
// Business content lives in src/content/*.yaml: see CONTENT.md.

const raw = import.meta.glob('/src/content/**/*.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}', { eager: true });

const load = (name: string) => {
  const text = raw[`/src/content/${name}`];
  if (text === undefined) throw new Error(`Missing content file: src/content/${name}`);
  return parse(text);
};

const status = z.enum(['verified', 'placeholder', 'to-confirm']);
const verified = <T extends { status: string }>(list: T[]) => list.filter((i) => i.status === 'verified');

const companySchema = z.object({
  company: z.object({ name: z.string(), nameUpper: z.string(), descriptor: z.string(), tagline: z.string(), copyrightYear: z.number() }),
  owner: z.object({ name: z.string(), role: z.string() }),
  contact: z.object({ phoneDisplay: z.string(), phoneTel: z.string(), whatsappNumber: z.string(), email: z.string() }),
  location: z.object({
    display: z.string(), locality: z.string(), district: z.string(), region: z.string(), country: z.string(), countryCode: z.string(),
    mapsQuery: z.string(), mapBbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    exactAddress: z.string().nullable(), coordinates: z.object({ lat: z.number(), lng: z.number() }).nullable(),
  }),
  site: z.object({ url: z.string().url(), urlStatus: status, language: z.string() }),
  seo: z.object({ title: z.string(), description: z.string(), keywords: z.array(z.string()), ogImage: z.string() }),
});

const siteSchema = z.object({
  hero: z.object({
    eyebrow: z.string(), headline: z.string(), body: z.string(), primaryCta: z.string(), secondaryCta: z.string(),
    flow: z.array(z.object({ id: z.string(), label: z.string(), caption: z.string(), service: z.string() })),
  }),
  about: z.object({ eyebrow: z.string(), heading: z.string(), body: z.string(), lifecycleIntro: z.string(), lifecycle: z.array(z.string()), ownerLine: z.string() }),
  services: z.object({ eyebrow: z.string(), heading: z.string(), intro: z.string() }),
  technologies: z.object({ eyebrow: z.string(), heading: z.string(), intro: z.string(), disclaimer: z.string() }),
  process: z.object({ eyebrow: z.string(), heading: z.string() }),
  projects: z.object({ eyebrow: z.string(), heading: z.string(), intro: z.string(), emptyTitle: z.string(), emptyBody: z.string() }),
  clients: z.object({ eyebrow: z.string(), heading: z.string() }),
  testimonials: z.object({ eyebrow: z.string(), heading: z.string(), emptyTitle: z.string(), emptyBody: z.string() }),
  quote: z.object({ eyebrow: z.string(), heading: z.string(), body: z.string(), requirementTypes: z.array(z.string()), attachmentNote: z.string() }),
  contact: z.object({ eyebrow: z.string(), heading: z.string() }),
  finalCta: z.object({ heading: z.string(), body: z.string() }),
  whatsapp: z.object({ default: z.string() }).catchall(z.string()),
});

const serviceSchema = z.object({
  id: z.string(), status, title: z.string(), icon: z.string(), featured: z.boolean().optional(), wide: z.boolean().optional(),
  summary: z.string(), points: z.array(z.string()), requirementType: z.string(), photo: z.string().optional(), whatsappMessage: z.string().optional(),
});
const techSchema = z.object({
  id: z.string(), status, title: z.string(), description: z.string(), whatsappMessage: z.string().optional(),
  items: z.array(z.object({ name: z.string(), note: z.string().optional() })),
});
const statSchema = z.object({ id: z.string(), status, value: z.number(), prefix: z.string().optional(), suffix: z.string().optional(), label: z.string() });
const stepSchema = z.object({ id: z.string(), status, number: z.string(), title: z.string(), text: z.string() });
const photoSchema = z.object({ id: z.string(), file: z.string(), alt: z.string(), caption: z.string(), author: z.string(), license: z.string(), licenseUrl: z.string(), source: z.string() });
const clientSchema = z.object({ id: z.string(), status, name: z.string(), logo: z.string().optional(), industry: z.string().optional(), note: z.string().optional() });
const testimonialSchema = z.object({
  id: z.string(), status, quote: z.string(), name: z.string(), company: z.string().optional(), role: z.string().optional(), logo: z.string().optional(),
});
const projectSchema = z.object({
  status, name: z.string(), industry: z.string(), client: z.string().nullable().optional(), summary: z.string(), description: z.string(),
  technologies: z.array(z.string()), plcPlatform: z.string().nullable().optional(), robotPlatform: z.string().nullable().optional(),
  services: z.array(z.string()), images: z.array(z.object({ src: z.string(), alt: z.string() })).optional(), results: z.string().nullable().optional(),
});

export const company = companySchema.parse(load('company.yaml'));
export const site = siteSchema.parse(load('site.yaml'));
export const services = verified(z.object({ items: z.array(serviceSchema) }).parse(load('services.yaml')).items);
export const technologies = verified(z.object({ groups: z.array(techSchema) }).parse(load('technologies.yaml')).groups);
export const statistics = verified(z.object({ items: z.array(statSchema) }).parse(load('statistics.yaml')).items);
export const steps = verified(z.object({ steps: z.array(stepSchema) }).parse(load('process.yaml')).steps);
export const photos = z.object({ items: z.array(photoSchema) }).parse(load('images.yaml')).items;
export const photo = (id: string) => {
  const p = photos.find((x) => x.id === id);
  const meta = p && resolveImage(p.file);
  return p && meta ? { ...p, meta } : undefined;
};

export const clients = verified(z.object({ items: z.array(clientSchema) }).parse(load('clients.yaml')).items);
const testimonialFile = z.object({ items: z.array(testimonialSchema), samples: z.array(testimonialSchema).optional() }).parse(load('testimonials.yaml'));
export const testimonials = verified(testimonialFile.items);
/** Layout preview only: shown in `npm run dev`, NEVER included in the production build. */
export const sampleTestimonials = import.meta.env.DEV ? (testimonialFile.samples ?? []) : [];

export const projects = Object.entries(raw)
  .filter(([path]) => /\/src\/content\/projects\/[^_/][^/]*\.yaml$/.test(path))
  .map(([path, text]) => ({ id: path.split('/').pop()!.replace('.yaml', ''), ...projectSchema.parse(parse(text)) }))
  .filter((p) => p.status === 'verified');

/** Resolve "folder/file.jpg" (relative to src/assets/images) to image metadata, if the file exists. */
export const resolveImage = (src?: string): ImageMetadata | undefined => images[`/src/assets/images/${src}`]?.default;

// Derived contact links: single place, used by every CTA.
const { contact, location } = company;
export const links = {
  tel: `tel:${contact.phoneTel}`,
  mailto: `mailto:${contact.email}`,
  whatsapp: `https://wa.me/${contact.whatsappNumber}`,
  whatsappWith: (text: string) => `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(text)}`,
  /** WhatsApp link with the pre-written message for a page section (see `whatsapp:` in site.yaml). */
  waFor: (section: string) => `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(site.whatsapp[section] ?? site.whatsapp.default)}`,
  waText: (section: string) => site.whatsapp[section] ?? site.whatsapp.default,
  directions: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapsQuery)}`,
  mapEmbed: `https://www.openstreetmap.org/export/embed.html?bbox=${location.mapBbox.join('%2C')}&layer=mapnik`,
  mapOpen: `https://www.openstreetmap.org/search?query=${encodeURIComponent(location.mapsQuery)}`,
};
