import type { APIRoute } from 'astro';
import { projects } from '../data/projects';

// A plain list of every page, for search engines. Written by hand rather than
// with a plugin, because the site has only five pages.
export const GET: APIRoute = ({ site }) => {
  const paths = ['/', ...projects.map((p) => `/work/${p.slug}/`)];
  const urls = paths.map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
