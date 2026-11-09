import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project in src/content/work/. The file name is the
// slug, and it must match a slug in src/data/projects.ts.
const work = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    /** One or two plain sentences under the title. Facts from CLAUDE.md only. */
    lede: z.string(),
  }),
});

export const collections = { work };
