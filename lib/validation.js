import { z } from 'zod';
import { ENTITY_TYPES, EVIDENCE, LOCALES } from '@/lib/i18n';
import { sanitizeDoc } from '@/lib/richtext-sanitize';

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const RELATION_TYPES = ['partner', 'works-in', 'appears-in', 'located-in', 'based-in', 'employs', 'friend', 'associate', 'signed', 'features', 'part-of', 'family', 'rival', 'owns', 'related'];
export const CATEGORY_COLORS = ['flamingo', 'pool', 'lavender', 'sun', 'peach', 'sky', 'ink'];
export const TIMELINE_KINDS = ['video', 'news', 'music', 'launch', 'reveal', 'other'];

const trimmed = (max) => z.string().trim().max(max);
const optUrl = z.union([z.literal(''), z.null(), z.undefined(), z.string().trim().max(2000).regex(/^https?:\/\/\S+$/i, 'URL no válida (debe empezar por https://)')])
  .transform((v) => v || null);
const uuidOrNull = z.union([z.literal(''), z.null(), z.undefined(), z.guid()]).transform((v) => v || null);
const slug = z.string().trim().toLowerCase().min(1, 'El slug es obligatorio').max(90).regex(SLUG_RE, 'Slug: solo minúsculas, números y guiones');

/** {es,en,pt,fr} plain text; Spanish optionally required. Empty strings are dropped. */
const localizedText = (max, requireEs = false) => z.object(Object.fromEntries(LOCALES.map((l) => [l, trimmed(max).optional()])))
  .partial()
  .transform((v) => Object.fromEntries(Object.entries(v).filter(([, s]) => s && s.length)))
  .refine((v) => !requireEs || Boolean(v.es), { message: 'El título en español es obligatorio' });

/** {es,en,pt,fr} Tiptap docs, sanitized server-side. */
const localizedDoc = z.record(z.string(), z.any()).optional().default({})
  .transform((v) => {
    const out = {};
    for (const l of LOCALES) {
      const d = sanitizeDoc(v?.[l]);
      if (d) out[l] = d;
    }
    return out;
  })
  .refine((v) => JSON.stringify(v).length < 400_000, { message: 'El texto es demasiado largo' });

const tags = z.array(trimmed(40).toLowerCase()).max(30).default([])
  .transform((a) => [...new Set(a.filter(Boolean))]);

export const entitySchema = z.object({
  id: uuidOrNull.optional(),
  type: z.enum(ENTITY_TYPES),
  slug,
  status: z.enum(EVIDENCE),
  title: localizedText(160, true),
  eyebrow: localizedText(80),
  short_description: localizedText(400),
  description: localizedDoc,
  quote: localizedText(400),
  hero_image: optUrl,
  hero_alt: trimmed(300).optional().default(''),
  video_url: optUrl,
  tags,
  primary_source_id: uuidOrNull,
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  sort_order: z.coerce.number().int().min(-9999).max(9999).default(0),
  published_at: z.union([z.literal(''), z.null(), z.undefined(), z.iso.datetime({ offset: true })]).transform((v) => v || null),
  map: z.object({ x: z.coerce.number().min(0).max(100), y: z.coerce.number().min(0).max(100) }).nullable().optional(),
  release_date: z.union([z.literal(''), z.null(), z.undefined(), z.iso.date()]).transform((v) => v || null),
});

export const articleSchema = z.object({
  id: uuidOrNull.optional(),
  slug,
  title: localizedText(200, true),
  excerpt: localizedText(500),
  body: localizedDoc,
  seo_title: localizedText(80),
  seo_description: localizedText(200),
  category_id: uuidOrNull,
  tags,
  cover_image: optUrl,
  cover_alt: trimmed(300).optional().default(''),
  cover_caption: trimmed(300).optional().default(''),
  author_name: trimmed(120).optional().default(''),
  source_id: uuidOrNull,
  evidence: z.enum(EVIDENCE),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  published_at: z.union([z.literal(''), z.null(), z.undefined(), z.iso.datetime({ offset: true })]).transform((v) => v || null),
  entity_ids: z.array(z.guid()).max(40).default([]),
});

export const factSchema = z.object({
  id: uuidOrNull.optional(),
  entity_id: z.guid(),
  title: localizedText(200, true),
  body: localizedText(1000),
  status: z.enum(EVIDENCE),
  source_id: uuidOrNull,
  timestamp_text: trimmed(40).optional().default(''),
  sort_order: z.coerce.number().int().default(0),
});

export const relationSchema = z.object({
  from_entity_id: z.guid(),
  to_entity_id: z.guid(),
  relation_type: z.enum(RELATION_TYPES),
  note: trimmed(200).optional().default(''),
}).refine((r) => r.from_entity_id !== r.to_entity_id, { message: 'Una ficha no puede relacionarse consigo misma' });

export const sourceSchema = z.object({
  id: uuidOrNull.optional(),
  name: trimmed(200).min(1, 'El nombre es obligatorio'),
  publisher: trimmed(120).optional().default(''),
  kind: trimmed(80).optional().default('Official website'),
  url: z.string().trim().max(2000).regex(/^https?:\/\/\S+$/i, 'URL no válida'),
  published_at: z.union([z.literal(''), z.null(), z.undefined(), z.iso.date()]).transform((v) => v || null),
  notes: trimmed(1000).optional().default(''),
});

export const categorySchema = z.object({
  id: uuidOrNull.optional(),
  slug,
  name: localizedText(60, true),
  color: z.enum(CATEGORY_COLORS),
  sort_order: z.coerce.number().int().default(0),
});

export const timelineSchema = z.object({
  id: uuidOrNull.optional(),
  event_date: z.iso.date({ message: 'Fecha no válida' }),
  title: localizedText(160, true),
  detail: localizedText(400),
  kind: z.enum(TIMELINE_KINDS),
  entity_id: uuidOrNull,
  article_id: uuidOrNull,
  published: z.boolean().default(true),
});

export const mediaSchema = z.object({
  storage_path: z.string().max(500).nullable().optional(),
  url: z.string().trim().regex(/^https?:\/\/\S+$/i, 'URL no válida').max(2000),
  kind: z.enum(['image', 'video', 'file']).default('image'),
  mime_type: trimmed(100).optional().nullable(),
  size_bytes: z.coerce.number().int().min(0).nullable().optional(),
  width: z.coerce.number().int().min(0).nullable().optional(),
  height: z.coerce.number().int().min(0).nullable().optional(),
  alt_text: trimmed(300).optional().default(''),
  caption: trimmed(300).optional().default(''),
  credit: trimmed(160).optional().default(''),
});

export const settingsSchema = z.object({
  hero_image: optUrl,
  hero_video: optUrl,
  release_date: z.union([z.literal(''), z.null(), z.iso.date()]).transform((v) => v || null),
  announcement: localizedText(240),
  contact_email: z.union([z.literal(''), z.null(), z.string().trim().pipe(z.email('Email no válido'))]).transform((v) => v || null),
});

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Email no válido')),
  display_name: trimmed(80).optional().default(''),
  role: z.enum(['admin', 'editor']),
});

/** First human-readable error message from a ZodError. */
export function firstError(error) {
  const issue = error?.issues?.[0];
  if (!issue) return 'Datos no válidos';
  const path = issue.path?.join('.') || '';
  return path && !issue.message.includes(' ') ? `${path}: ${issue.message}` : issue.message;
}
