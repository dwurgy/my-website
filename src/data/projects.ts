import type { ImageMetadata } from 'astro';
import firnShot from '../../assets/work/firn.jpg';
import utuShot from '../../assets/work/utu.webp';
import copywriterShot from '../../assets/work/copywriter-lab-poster.jpg';
import copywriterVideo from '../../assets/work/copywriter-lab.mp4?url';

export interface Project {
  slug: string;
  name: string;
  /** The short mono label on the right of the work index. */
  meta: string;
  /** One plain sentence beside the name. Facts from CLAUDE.md only. */
  line: string;
  /** The preview that follows the cursor, and the image under the name on touch screens. */
  shot?: { src: ImageMetadata; alt: string };
  /** A demo video that takes the main image's place on the project page. The shot is its poster. */
  video?: { src: string; label: string };
  /** Shown in the preview while a project has no screenshot yet. */
  placeholder?: string;
}

export const projects: Project[] = [
  {
    slug: 'firn',
    name: 'Firn',
    meta: 'Oct 2026',
    line: 'A calm Mac browser, built on Safari’s engine. Open source.',
    shot: {
      src: firnShot,
      alt: 'Firn on a Mac: a sidebar of tabs and spaces beside a website.',
    },
  },
  {
    slug: 'utu',
    name: 'Utu Weather',
    meta: 'Coming soon',
    line: 'A calm iPhone weather app that tells you the forecast in a plain-English sentence, then shows the numbers.',
    shot: {
      src: utuShot,
      alt: 'Three iPhones showing Utu at golden hour, on a drizzly afternoon, and on a clear night, each with a large temperature and a one-sentence forecast.',
    },
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
    video: {
      src: copywriterVideo,
      label: 'Demo of NW Copywriter Lab, 34 seconds, no sound: a part number goes in, and the eBay title, product description, and weight and dimensions are written one by one.',
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
];
