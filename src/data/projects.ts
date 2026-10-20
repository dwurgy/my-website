import type { ImageMetadata } from 'astro';
import firnShot from '../../assets/work/firn-placeholder.jpg';
import copywriterShot from '../../assets/work/copywriter-lab-poster.jpg';

export interface Project {
  slug: string;
  name: string;
  /** The short mono label on the right of the work list. */
  status: string;
  /** One or two plain sentences for the card. Facts from CLAUDE.md only. */
  line: string;
  /** Small mono metadata under the line. */
  meta: string;
  shot?: { src: ImageMetadata; alt: string; position?: string };
  link: { href: string; label: string };
}

// Alfred and the back office have no screenshot yet (David is supplying
// blurred ones), so their cards show the line without an image for now.
export const projects: Project[] = [
  {
    slug: 'firn',
    name: 'Firn',
    status: 'Shipped · Oct 2026',
    line: "A calm desktop browser for people who don't want to learn a new browser. I wrote the brief and directed Claude Code through every phase.",
    meta: 'macOS · Windows · Open source',
    shot: {
      src: firnShot,
      alt: 'Firn on a Mac: a sidebar of tabs and spaces beside a website with a leafy tree against a blue sky.',
    },
    link: { href: 'https://firnbrowser.com', label: 'firnbrowser.com' },
  },
  {
    slug: 'alfred',
    name: 'Alfred',
    status: 'In daily use',
    line: "Two AI assistants inside the company's Odoo 19 ERP. Alfred answers questions from live data. The SOP Assistant answers how-to questions from the team's own process docs.",
    meta: 'Odoo 19 · Gemini API',
    link: { href: '/work/alfred', label: 'How it works' },
  },
  {
    slug: 'copywriter-lab',
    name: 'Copywriter Lab',
    status: '3 days',
    line: 'Type a part number and get product copy, a quote summary, and a spec sheet. Three days from idea to production.',
    meta: 'AI Studio · Claude · Cloudflare',
    shot: {
      src: copywriterShot,
      alt: 'NW Copywriter Lab: a part number field on the left, and empty panels for product copy, a quote summary, and a spec sheet on the right.',
      position: 'top',
    },
    link: { href: '/work/copywriter-lab', label: 'See the demo' },
  },
  {
    slug: 'back-office',
    name: 'Back office',
    status: '10 weeks',
    line: 'Off QuickBooks Desktop and onto Odoo 19 in ten weeks, with zero downtime and every order shipped on launch day.',
    meta: 'Odoo 19 · Sole internal owner',
    link: { href: '/work/back-office', label: 'The rebuild' },
  },
];
