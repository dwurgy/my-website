import type { ImageMetadata } from 'astro';
import firnShot from '../../assets/work/firn-placeholder.jpg';
import copywriterShot from '../../assets/work/copywriter-lab-poster.jpg';
import serialShot from '../../assets/work/serial-lookup.png';

export interface Project {
  slug: string;
  name: string;
  /** The short mono label on the right of the work index. */
  meta: string;
  /** One plain sentence beside the name. Facts from CLAUDE.md only. */
  line: string;
  /** The preview that follows the cursor, and the image under the name on touch screens. */
  shot?: { src: ImageMetadata; alt: string };
  /** Shown in the preview while a project has no screenshot yet. */
  placeholder?: string;
}

export const projects: Project[] = [
  {
    slug: 'firn',
    name: 'Firn',
    meta: 'Oct 2026',
    line: 'A calm desktop browser. Open source, on macOS and Windows.',
    shot: {
      src: firnShot,
      alt: 'Firn on a Mac: a sidebar of tabs and spaces beside a website.',
    },
  },
  {
    slug: 'alfred',
    name: 'Alfred',
    meta: 'In use',
    line: 'Two AI assistants inside an Odoo ERP. One question instead of a warehouse walk.',
    // David is supplying a blurred screenshot.
    placeholder: 'Alfred screenshot',
  },
  {
    slug: 'copywriter-lab',
    name: 'Copywriter Lab',
    meta: '3 days',
    line: 'A part number in. An eBay title that doubles as a quote line, a product description, and weight and dimensions out.',
    shot: {
      src: copywriterShot,
      alt: 'NW Copywriter Lab: a finished listing for a network switch, with its eBay title, product description, and weight and dimensions each marked done.',
    },
  },
  {
    slug: 'back-office',
    name: 'Back office',
    meta: '10 weeks',
    line: 'Off QuickBooks Desktop and onto one ERP, with zero downtime.',
    shot: {
      src: serialShot,
      alt: 'A serial number record in Odoo with its quality check passed and the test print below it.',
    },
  },
];
