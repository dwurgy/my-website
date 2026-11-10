import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project in src/content/work/. The file name is the
// slug, and it must match a slug in src/data/projects.ts. The main image comes
// from projects.ts too, so the work index preview and the page always agree.
// Every claim and number here must be in the "Facts you may use" list in
// CLAUDE.md.
const work = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    /** One or two plain sentences under the title. */
    lede: z.string(),
    /** The row of facts under the main image: a short label and its value. */
    facts: z.array(z.object({ label: z.string(), value: z.string() })).min(1),
    /** Outside links, if the project has any public ones. */
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
    /** Images still to come from David, shown as clearly marked placeholders. */
    waiting: z.array(z.string()).default([]),
  }),
});

export const collections = { work };
