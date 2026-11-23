import { things } from './things';

// Every address on the site. A "door" is what's open: '' is the bare sentence,
// 'things/firn' is Firn's page. Each one is built as a real page, so any of
// them can be linked to, and the site works without scripts.
export interface Door {
  door: string;
  title: string;
  description: string;
}

const site = 'David Wurgler';

export const doors: Door[] = [
  { door: '', title: site, description: 'I make pretty things. David Wurgler designs and builds software.' },
  { door: 'i', title: `I · ${site}`, description: 'David Wurgler designs and builds software, and lives in Salem, Oregon.' },
  { door: 'make', title: `Make · ${site}`, description: 'How David Wurgler builds software: he writes the brief, and directs Claude Code through it.' },
  { door: 'pretty', title: `Pretty · ${site}`, description: 'David Wurgler’s photographs, and his band, My Brothers And I.' },
  { door: 'things', title: `Things · ${site}`, description: 'Things David Wurgler has made: Firn, Utu Weather, Deepcall, NW Remarketing, and Copywriter Lab.' },
  ...things.map((t) => ({ door: `things/${t.slug}`, title: `${t.name} · ${site}`, description: t.line })),
  { door: 'hi', title: `Say hi · ${site}`, description: 'How to reach David Wurgler.' },
];

/** The address for a door. */
export const path = (door: string) => (door ? `/${door}/` : '/');
