import type { APIRoute } from 'astro';
import { doors, path } from '../data/doors';

// A plain list of every page, for search engines. Written by hand rather than
// with a plugin, because the site is small.
export const GET: APIRoute = ({ site }) => {
  const urls = doors.map((d) => `  <url><loc>${new URL(path(d.door), site).href}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
