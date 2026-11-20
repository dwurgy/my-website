import type { ImageMetadata } from 'astro';
import firnShot from '../../assets/work/firn.webp';
import utuShot from '../../assets/work/utu.webp';
import deepcallShot from '../../assets/work/deepcall.jpg';
import nwrShot from '../../assets/work/nwr-identity.webp';
import copywriterShot from '../../assets/work/copywriter-lab.webp';

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
    line: 'A calm browser for Mac and iPhone, built on Safari’s engine. Open source.',
    shot: {
      src: firnShot,
      alt: 'Firn for iPhone: a grid of open tabs, a Kinfolk article, and a Wikipedia page about firn with an on-device summary, beside the Firn icon and the line "A calm, native browser."',,
    },
  },
  {
    slug: 'utu',
    name: 'Utu Weather',
    meta: 'Coming soon',
    line: 'A calm iPhone weather app that tells you the forecast in a plain-English sentence, then shows the numbers.',
    shot: {
      src: utuShot,
      alt: 'A design mockup of Utu Weather’s widgets in its sky and paper styles: small, medium, and large widgets for Salem at 52° with lines like “Drizzle until 3, then calm” and “Umbrella? Until 3, yes,” an hourly row, a four-day forecast, and two lock screen widgets.',
    },
  },
  {
    slug: 'deepcall',
    name: 'Deepcall',
    meta: 'In development',
    line: 'A co-op action game about pilots in flying exosuits, set in a drowned world of Nordic fjords and glaciers.',
    shot: {
      src: deepcallShot,
      alt: 'Mood reference for Deepcall: dark mountains above a black shoreline, with a road winding along the water, and the Deepcall wordmark across the sky.',
    },
  },
  {
    slug: 'nw-remarketing',
    name: 'NW Remarketing',
    meta: 'Identity',
    line: 'A new identity for the company: nwr typed at a terminal, with a Cascade peak hidden in the w.',
    shot: {
      src: nwrShot,
      alt: 'The NW Remarketing logo on near-black: “nwr” with a snowcapped peak in the w and the r on an amber cursor block, beside “NW Remarketing” and the tagline “Infrastructure, in hand.”',
    },
  },
  {
    slug: 'copywriter-lab',
    name: 'Copywriter Lab',
    meta: '3 days',
    line: 'A part number in. An eBay title that doubles as a quote line, a product description, and weight and dimensions out.',
    shot: {
      src: copywriterShot,
      alt: 'NW Copywriter Lab in the NW Remarketing look: the part number Ciena NTK531VAE5 entered, the listing title above a short quote description and the start of a product description, each with a Copy button, and a sidebar with listing progress and the house rules, all checked.',
    },
  },
];
