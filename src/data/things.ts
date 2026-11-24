import type { ImageMetadata } from 'astro';
import firnPhones from '../../assets/work/firn.webp';
import firnMac from '../../assets/work/firn/mac-snow-peak.webp';
import firnMacSisters from '../../assets/work/firn/mac-sisters.webp';
import firnPair from '../../assets/work/firn/iphone-pair.webp';
import utuHero from '../../assets/work/utu/hero.webp';
import utuWidgets from '../../assets/work/utu.webp';
import utuPhones from '../../assets/work/utu/phones.webp';
import utuLockup from '../../assets/work/utu/lockup-sky.webp';
import deepcall from '../../assets/work/deepcall.jpg';
import nwr from '../../assets/work/nwr-identity.webp';
import copywriter from '../../assets/work/copywriter-lab.webp';

// The things David has made, in the order they're listed. Every claim and
// number here must be in the "Facts you may use" list in CLAUDE.md.
export interface Shot {
  src: ImageMetadata;
  alt: string;
  /** Give it a hairline edge: for a picture whose own background is close to the page's, so it doesn't melt into it. */
  edge?: boolean;
}

export interface Thing {
  slug: string;
  name: string;
  /** One plain sentence: under the name on its page, and beside the list. */
  line: string;
  /** Its pictures, in order. The first leads. */
  shots: Shot[];
  body: string[];
  facts: [label: string, value: string][];
  links: [label: string, href: string][];
}

export const things: Thing[] = [
  {
    slug: 'firn',
    name: 'Firn',
    line: 'A calm browser for Mac and iPhone, built on Safari’s engine. Open source.',
    shots: [
      { src: firnPhones, alt: 'Firn for iPhone: a grid of open tabs, a Kinfolk article, and a Wikipedia page about firn with an on-device summary, beside the Firn icon and the line “A calm, native browser.”' },
      { src: firnMac, alt: 'Firn on a Mac: a sidebar with four pinned sites, a “Weekend cooking” group of tabs, and the Snow Peak site open beside it.' },
      { src: firnMacSisters, alt: 'Firn on a Mac in a space called Trip: a “Sisters” group of tabs in the sidebar, and the Sisters Coffee site open beside it.' },
      { src: firnPair, alt: 'Two images of Firn on iPhone. “Every space is its own browser.”: a grid of open tabs in a space called Work. “Read without the clutter.”: a Wikipedia article about firn in reader view, with a Summarize button.' },
    ],
    body: [
      'Firn is snow that has made it through a whole season: older than fresh snow, not yet glacier ice. The word is from the Swiss German for “last year’s.”',
      'It has vertical tabs, spaces, and split view. It’s a native app, written in Swift on WebKit, the engine behind Safari. I wrote its brief and directed Claude Code through every phase.',
    ],
    facts: [['Released', 'October 2026'], ['Runs on', 'Mac and iPhone'], ['Source', 'Open, on GitHub']],
    links: [['firnbrowser.com', 'https://firnbrowser.com'], ['Source', 'https://github.com/dwurgy/firn']],
  },
  {
    slug: 'utu',
    name: 'Utu Weather',
    line: 'A calm iPhone weather app that tells you the forecast in a plain-English sentence, then shows the numbers.',
    shots: [
      { src: utuHero, alt: 'A design mockup for Utu Weather: its icon and wordmark, the line “Weather, without the noise.”, an iPhone showing 52° in Salem and “Soft drizzle until about 3, then the clouds open up for a calm evening.”, and two widgets, one reading “Umbrella? Until 3, yes.”' },
      { src: utuWidgets, alt: 'A design mockup of Utu Weather’s widgets in its sky and paper styles, for Salem at 52°, with lines like “Drizzle until 3, then calm” and “Umbrella? Until 3, yes.”' },
      { src: utuPhones, alt: 'A design mockup of four iPhones showing Utu: golden hour, a drizzly afternoon, and a clear night, each with a large temperature and a one-sentence forecast, and the detail sheet for Saturday.' },
      { src: utuLockup, alt: 'The Utu app icon, a sun setting behind soft hills, beside the handwritten “utu” wordmark.' },
    ],
    body: [
      'The name, said OO-too, is Finnish for haze or mist. Utu writes the forecast as a sentence, like “Grey and mild. Showers drift in around 4 and stay through the evening.” The numbers come second.',
      'It has soft, hazy skies, gentle motion, and widgets that answer questions directly: “Umbrella? Yes, after 4.” Weather, without the noise.',
    ],
    facts: [['Status', 'In development, not out yet'], ['Built with', 'SwiftUI, WeatherKit, and WidgetKit'], ['Images', 'Design mockups']],
    links: [['utuweather.com', 'https://utuweather.com']],
  },
  {
    slug: 'deepcall',
    name: 'Deepcall',
    line: 'A co-op action game about pilots in flying exosuits, set in a drowned world of Nordic fjords and glaciers.',
    shots: [
      { src: deepcall, alt: 'Mood reference for Deepcall: dark mountains above a black shoreline, with a road winding along the water, and the Deepcall wordmark across the sky.' },
    ],
    body: [
      'You fly freely across one open world, liberate outposts, and hunt the giants that survived the flood. You can play it solo or with a friend.',
      'I’m building it on my own with Claude Code. The current milestone is the flight prototype: hover, flight, heat, and two-player networking. The name is from Psalm 42:7, “Deep calls to deep.”',
    ],
    facts: [['Status', 'Early development'], ['Built with', 'Unreal Engine 5.8 and C++'], ['Image', 'Mood reference, photo by Andre Filipe on Unsplash']],
    links: [],
  },
  {
    slug: 'nw-remarketing',
    name: 'NW Remarketing',
    line: 'A new identity for the company: nwr typed at a terminal, with a Cascade peak hidden in the w.',
    shots: [
      { src: nwr, alt: 'The NW Remarketing logo on near-black: “nwr” with a snowcapped peak in the w and the r on an amber cursor block, beside the tagline “Infrastructure, in hand.”' },
    ],
    body: [
      'The mark is the word nwr typed at a terminal, with the cursor resting on the r and a snowcapped Cascade peak hidden in the w. The amber comes from old amber-phosphor terminal screens.',
    ],
    facts: [['Work', 'Brand identity'], ['Tagline', 'Infrastructure, in hand.'], ['Used on', 'Invoices, the eBay store, email, and the website']],
    links: [],
  },
  {
    slug: 'copywriter-lab',
    name: 'Copywriter Lab',
    line: 'A part number in. An eBay title that doubles as a quote line, a product description, and weight and dimensions out.',
    shots: [
      { src: copywriter, alt: 'NW Copywriter Lab: a part number entered, the listing title above a short quote description and the start of a product description, each with a Copy button.', edge: true },
    ],
    body: [
      'An internal tool that turns a part number into an eBay title that doubles as a quote line, a product description, and weight and dimensions, and it saves the spec data for store filters.',
      'I prototyped it in Google AI Studio, rebuilt it with Claude, and deployed it on Cloudflare. It went from idea to production in three days.',
    ],
    facts: [['Idea to production', '3 days'], ['Runs on', 'Cloudflare']],
    links: [],
  },
];
