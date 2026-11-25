import type { ImageMetadata } from 'astro';
import firnMac from '../../assets/work/firn/mac.jpg';
import firnSplit from '../../assets/work/firn/mac-split-view.jpg';
import firnPhone from '../../assets/work/firn/iphone.jpg';
import firnTabs from '../../assets/work/firn/iphone-tabs.jpg';
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
    line: 'A calm browser for Mac, iPhone, and iPad.',
    shots: [
      { src: firnMac, alt: 'Firn on a Mac, under its snowflake mark and the name “firn”: a sidebar with a “Nordic Style” group of tabs, and a Kinfolk article, “Blunk House,” open beside it. “A calm browser for Mac, iPhone, and iPad.”' },
      { src: firnSplit, alt: 'Firn on a Mac in split view: the Kinfolk article and the Snow Peak site share one window. “Two pages, side by side.”' },
      { src: firnPhone, alt: 'Firn on an iPhone, under its snowflake mark and the name “firn”: the Kinfolk article “Blunk House.” “A calm browser for Mac, iPhone, and iPad.”' },
      { src: firnTabs, alt: 'Two iPhones running Firn: the Audo site, and a grid of open tabs with a “Nordic Style” group in a space called Personal. “Tabs, kept together.”' },
    ],
    body: [
      'Firn has vertical tabs, spaces, and split view, without the learning curve. It’s a native app, written in Swift on WebKit, the engine behind Safari.',
      'I designed the app, its brand, and its website, and built it with Claude Code.',
      'The name is the word for snow that has made it through a whole season: older than fresh snow, not yet glacier ice. It comes from the Swiss German for “last year’s.”',
    ],
    facts: [['Mac', 'Released October 2026'], ['iPhone and iPad', 'In development'], ['Source', 'Open, on GitHub']],
    links: [['firnbrowser.com', 'https://firnbrowser.com'], ['GitHub', 'https://github.com/dwurgy/firn']],
  },
  {
    slug: 'utu',
    name: 'Utu Weather',
    line: 'A weather app for iPhone. It tells you the forecast the way a person would, then shows the numbers.',
    shots: [
      { src: utuHero, alt: 'A design mockup for Utu Weather: its icon and wordmark, the line “Weather, without the noise.”, an iPhone showing 52° in Salem and “Soft drizzle until about 3, then the clouds open up for a calm evening.”, and two widgets, one reading “Umbrella? Until 3, yes.”' },
      { src: utuWidgets, alt: 'A design mockup of Utu Weather’s widgets in its sky and paper styles, for Salem at 52°, with lines like “Drizzle until 3, then calm” and “Umbrella? Until 3, yes.”' },
      { src: utuPhones, alt: 'A design mockup of four iPhones showing Utu: golden hour, a drizzly afternoon, and a clear night, each with a large temperature and a one-sentence forecast, and the detail sheet for Saturday.' },
      { src: utuLockup, alt: 'The Utu app icon, a sun setting behind soft hills, beside the handwritten “utu” wordmark.' },
    ],
    body: [
      'A forecast reads like this: “Grey and mild. Showers drift in around 4 and stay through the evening.”',
      'The skies are soft and hazy, and everything moves gently. The widgets answer simple questions, like “Umbrella? Yes, after 4.”',
      'The name is Finnish for haze or mist. You say it OO-too.',
    ],
    facts: [['Status', 'In development'], ['Built with', 'SwiftUI, WeatherKit, and WidgetKit'], ['Images', 'Design mockups']],
    links: [['utuweather.com', 'https://utuweather.com']],
  },
  {
    slug: 'deepcall',
    name: 'Deepcall',
    line: 'A co-op action game. You’re a pilot in a flying exosuit, in a drowned world of Nordic fjords and glaciers.',
    shots: [
      { src: deepcall, alt: 'Mood reference for Deepcall: dark mountains above a black shoreline, with a road winding along the water, and the Deepcall wordmark across the sky.' },
    ],
    body: [
      'You fly anywhere across one open world, liberate outposts, and hunt the giants that survived the flood. You can play alone or with friends.',
      'I’m building it on my own with Claude Code. Right now it’s a flight prototype: hovering, flying, heat, and two-player networking.',
      'The name is from Psalm 42:7: “Deep calls to deep.”',
    ],
    facts: [['Status', 'Early development'], ['Built with', 'Unreal Engine 5.8 and C++'], ['Image', 'Mood reference, photo by Andre Filipe on Unsplash']],
    links: [],
  },
  {
    slug: 'nw-remarketing',
    name: 'NW Remarketing',
    line: 'A new logo and brand identity.',
    shots: [
      { src: nwr, alt: 'The NW Remarketing logo on near-black: “nwr” with a snowcapped peak in the w and the r on an amber cursor block, beside the tagline “Infrastructure, in hand.”' },
    ],
    body: [
      'The logo is the letters nwr, typed at a terminal. The cursor rests on the r, and a snowcapped Cascade peak hides in the w. The amber is borrowed from old phosphor terminal screens.',
    ],
    facts: [['Tagline', 'Infrastructure, in hand.'], ['Used on', 'Invoices, the eBay store, email, and the website']],
    links: [],
  },
  {
    slug: 'copywriter-lab',
    name: 'Copywriter Lab',
    line: 'An internal tool that turns a part number into a finished product listing.',
    shots: [
      { src: copywriter, alt: 'NW Copywriter Lab: a part number entered, the listing title above a short quote description and the start of a product description, each with a Copy button.', edge: true },
    ],
    body: [
      'Paste a part number and it writes the quote description, the eCommerce description, and the weight and dimensions. Every listing follows the same rules, so they all read like one person wrote them. The specs are saved for store filters.',
      'I prototyped it in Google AI Studio, then rebuilt it with Claude.',
    ],
    facts: [['Idea to production', '3 days'], ['Runs on', 'Cloudflare']],
    links: [],
  },
];
