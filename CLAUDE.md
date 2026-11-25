# davidwurgler.com

The personal site of David Wurgler: a designer who builds software with AI. This file is the brief. Read it fully before changing anything.

## What the site is for

One job: someone landing here should understand in about 30 seconds that David designs and builds software with AI, that it's well made, and that he has taste. Then they should be able to see the work and get in touch. The hope is that the work leads to paid work (Firn alone has already led to a job offer).

### Direction (David, 2026-11-23)

David asked for a blank slate: "something unique and like nothing else," with "levels of simplicity and empty space that people would think is wrong." Quiet confidence, not a loud site. Everything before this date was thrown out except the mark and the facts.

- **The idea:** an empty page with one small sentence, "I make pretty things." Each word is a door, and the full stop is how you say hi. The site's confidence comes from what it leaves out.
- **Position:** a designer and builder of software, with AI as the method. Design and UI/UX are the strength; Claude Code is how one person ships at that level. Never call it "vibe coding" on the site.
- **The doors:** "I" is who David is. "make" is how he builds. "pretty" is his photographs and music. "things" is the work: Firn, Utu Weather, Deepcall, NW Remarketing, then Copywriter Lab. The dot is Say hi.
- **Gone, on purpose:** the hero photo, the control bar, the 3D camera and music player, the portrait, the back-office (ERP) line ("it can still be in my resume"), and any music playback. Don't bring these back unless David asks. If the 3D models ever return, it's as a thing in the list, not as decoration.
- Do not mention the job offer, or who made it, on the site unless David says so.

The site itself is part of the proof. It links to its own source, so the code has to hold up if someone opens the repo.

## Principles

1. **One typeface, one size, one weight.** No headlines, no bold, no italics, no capitals for emphasis. What matters is ink; what doesn't is grey.
2. **Two tones and one dot.** The only colour on the site is the red dot.
3. **Emptiness is the material.** More empty space than feels correct. Never fill a gap because it's there.
4. **Words before pictures.** Pictures appear only after someone asks to see a thing, and then they're big.
5. **Quick.** A fast, light, static site. No cookies and no third-party requests. The one exception is Cloudflare Web Analytics, which is cookieless.

## The design

There is no mockup file. The site is the design. `design/brand-kit/` is the brand kit (v3) exactly as David sent it: its `README.md` is the brand guide, and it holds the wordmark, icons, mark, share image, and tokens.

### Type

- **Averia Serif Libre Light (300)**, by Dan Sayers, SIL Open Font License. It is the average of hundreds of typefaces, so every edge is a little soft. David chose it over Newsreader, which "feels too easy" (2026-11-23).
- One size for everything: 21px on screens 820px and wider, 19px on phones. Line height 1.5. No letter-spacing. Text columns no wider than 27em.
- Self-hosted through Fontsource (`@fontsource/averia-serif-libre`). Never load a font from another site.

### Colour

Every colour is one of four tokens in `src/styles/site.css`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#eff0ee` | `#0e0f10` | The ground. Always flat: no grain, texture, or gradient. |
| `ink` | `#0e0f10` | `#e9eae7` | Text, and whatever is chosen |
| `dim` | `#696b6a` | `#8e908e` | Secondary text, and whatever isn't chosen |
| `dot` | `#e5482d` | `#f0573b` | The dot, and nothing else |

- Contrast on the ground: ink 16.8:1 light and 15.9:1 dark; dim 4.7:1 light and 6.0:1 dark; dot 3.5:1 light and 5.6:1 dark. The dot passes as a graphic object, not as text, so never set text in it.
- The site follows the visitor's system setting through a CSS media query. There is no theme button and no script for it.

### Layout

- **The sentence** sits 9% from the left and 44% down, and never leaves the screen. It is the only navigation. The open word is ink and the rest are grey. Clicking the open word closes its door.
- **Content** starts at the middle of the screen, on the sentence's own baseline.
- **The list of things** is five names and nothing else. Resting on a name shows its one line, in grey, under the list. There is no hover picture (David removed it: "it just feels out of place").
- **Pictures** are wider than the text: on wide screens they reach back toward the sentence and stop short of it. Corners are 3px. No shadows, borders, or cards. Each picture keeps its own shape. One exception (David, 2026-11-24): a picture whose own background is close to the page's, like Copywriter Lab's, gets a hairline edge and 12px corners so it doesn't melt into the page (`edge: true` in `src/data/things.ts`).
- **Controls are words** ("Back", "Next", "Copy"), in grey, turning ink under the hand. A reel's count and its Back and Next sit above the picture, so they hold still while the picture changes shape.
- **Links in text** have a 1px grey underline that turns ink under the hand.
- **The mark** appears once, small, under the contact links. It never leads.
- **Phones:** the sentence waits 38% down the screen, then rises to the top when a door opens and stays there. Each thing's line sits under its name, since there's no hovering.

### The dot

- A drawn circle, 0.25em across, standing in for the full stop. It links to Say hi.
- Its edge slowly wobbles and turns (5.2s wobble, 19s turn). It is the only thing on the site that moves without being touched. Where it doesn't move, it holds its still shape (see Brand).
- **The hint** is the one agreed exception to the dot being the only thing that moves without being touched: once a visit, about 4 seconds after the sentence arrives on the home page, each word is chosen in turn and the dot swells once, then it never plays again (David, 2026-11-24). A scroll or a swipe on the home page, which has nothing to scroll to, plays it straight away.
- Under the hand it swells to 1.9 times its size and wobbles faster. It stays swollen while Say hi is open, and shrinks back when another word is chosen.
- The click areas of the words and the dot are much bigger than they look, with no dead gaps between words. Keep them that way.

### Motion

Smooth and short. Nothing makes the reader wait. Timings are tuned by feel, by trying them for real; the numbers in `src/styles/site.css` are where each one stands now, not limits.

- **On load,** the sentence arrives once, word by word, through grey to ink.
- **The five names** arrive the same way, one after another. Nothing else does: paragraphs settle in as one piece (David, 2026-11-23).
- **Opening a door:** what was open fades where it stands, and the new content settles in from just below. The sentence is never cross-faded: its words and the dot change by their own timings, so there is only ever one dot on screen.
- **One word travels.** A thing's name glides from the list to its page's title, back to its place in the list, and from "Next," up to the next page's title. Exactly one copy of the word makes the trip; the two-copy cross-fade looked sloppy and was removed.
- **Pictures** slide sideways, like prints across a table, and the frame eases to each picture's shape.
- Door changes use the View Transitions API. Where it's missing, doors simply switch.
- **Reduced motion:** everything changes at once, and the dot holds its still shape: slightly uneven, not a perfect circle.

### How it's built

- Every door is a real page with its own address (`/`, `/i/`, `/make/`, `/pretty/`, `/things/`, `/things/firn/`, and so on, and `/hi/`). Each one renders the same component, `src/components/Site.astro`, with a different door open, so every page works and can be read without scripts.
- `src/scripts/site.ts` then moves between doors in place. It must never hold content the plain pages don't have.
- `src/data/things.ts` is the work; `src/data/photos.ts` is the photographs; `src/data/doors.ts` is every address with its title and description.
- `src/components/Reel.astro` is the picture reel. Images go through Astro's image pipeline.
- Old `/work/<slug>` addresses redirect to `/things/<slug>/` (`astro.config.mjs`).
- Astro strips the spaces between tags, so the spaces between the sentence's words are written out as `{' '}`.

### Brand

Four pieces, one job each (brand kit v3, David, 2026-11-24):

| Piece | Job |
|---|---|
| "I make pretty things." | The site. On the site, the sentence is the wordmark. |
| "David Wurgler." | The wordmark, for anywhere else the name needs reading. Never on the site's pages. |
| "DW." | The short form, for small squares only: the tab icon, the app icons, and profile pictures. Never on the site's pages. |
| The mark | The maker's stamp. It signs off, small, at the end. |

- **One dot per surface.** On the site that's the sentence's. The dot never appears by itself; it is always a full stop after letters.
- **The mark:** an uneven Cascade ridge over a waterline gap, with a longer reflection below that forms a W. The ridge is `dim` and the W is `ink`, so it follows the theme. Never redraw or reshape it. On the page it's `src/components/Mark.astro`, which inlines the two paths unchanged. It is the sign-off only: never a favicon, an app icon, or a profile picture, and never beside the name.
- **Icons, in `public/`, straight from the kit's `icons/` folder:** `favicon.svg` ("DW." on a flat tile; it follows the system's light or dark setting), `favicon.ico` (32px and 16px), `apple-touch-icon.png` (180px), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, and `site.webmanifest`, which points at the last three. The favicon is the one place Averia Regular is used, because Light goes grey that small, and its dot is a plain circle, because the uneven shape can't survive below about 64px.
- **Share image:** `public/share-1200x630.png`, from the kit's `share/` folder: the sentence on the snow ground, at 32px so it survives a small preview. Its alt text is "I make pretty things." Nothing in the repo generates it.
- **The still dot.** Wherever the dot doesn't move (reduced motion, print, and still images) it holds one fixed, slightly uneven shape, a single frozen frame of the wobble: `border-radius: 56% 44% 53% 47% / 47% 54% 46% 53%; transform: rotate(-12deg) scale(1.06, 0.95);`. It is the same shape every time. Never redraw it.
- **Kit files are used as they come.** Replace them as files; never re-export, recompress, recolour, resize, or regenerate them.
- **The mark's files** are in `public/brand/`, from the kit's `mark/` folder: `wurgler-mark-themeable.svg` (follows the system setting), `wurgler-mark-ink` and `wurgler-mark-light` (one colour; "light" replaces the old "bone" file), and `wurgler-mark-two-tone-on-snow` and `-on-night` (for where a file can't follow the theme), each as SVG and PNG. The shape is unchanged; only the colours are new.
- **The kit itself** is `design/brand-kit/`, kept exactly as sent. When David sends a newer kit, replace the whole folder, then copy what the site serves into `public/`.
- **Still from the previous look,** in `public/brand/`: the old WURGLER lockups and wordmarks, and the two email images. Nothing on the site uses them. `email-monogram-80.png` is used by David's email signature, so keep its address; the kit has a newer one in `email/` that hasn't been swapped in (waiting on David).

### Never

- A second typeface, size, or weight. A second colour. Text in the dot's red.
- Grain, texture, gradients, glass, shadows, cards, icons, or emoji.
- A menu, a header bar, a footer, or a hero image.
- Timed animation that makes the reader wait, or anything besides the dot that moves without being touched.
- Sharpening or "cleaning up" Averia's soft edges.
- Another site's or app's logo, or copying Firn's or Utu's design system. They are things on this site, not its look.

## Content

### Facts you may use

These are the only claims and numbers allowed. Never invent or round up a number. If something isn't here, ask. The copy on the site is David's final text (2026-11-24): everything in it is fact, and where it differs from an older note below, the site's wording wins.

- **Firn:** a calm browser with vertical tabs, spaces, and split view. It is a native Mac app built in Swift on WebKit, Safari's engine. It no longer runs on Windows or Linux. An iPhone version, with syncing between iPhone and Mac, was in development (David, 2026-11-10); see the next line, it's now out. It is open source (github.com/dwurgy/firn), its site is firnbrowser.com, and it is on the App Store at https://apps.apple.com/us/app/firn-browser/id6829053602 (David, 2026-11-25). It has vertical tabs, spaces, and split view, "without the learning curve." David designed the app, its brand, and its website, and built it with Claude Code (David, 2026-11-24). David wrote the brief (its CLAUDE.md) and directed Claude Code through every phase. Released October 2026 and notarized by Apple. The name, as Firn's own site puts it: "Snow that has made it through a whole season. Older than fresh snow, not yet glacier ice, slowly settling into something that lasts. From the Swiss German for 'last year's.'" David's family is German-Swiss, "so the name felt like mine the moment I found it." (David, 2026-11-10.)
- **Firn on iPhone (David, 2026-11-19):** describe Firn as for Mac, iPhone, and iPad. The iPad app is releasing at the same time as the iPhone app (David, 2026-11-25). On the site the Mac app is "Released October 2026" and "iPhone and iPad" is "Released November 2026": the iPhone and iPad apps went out on the App Store on 2026-11-25 (David). Firn uses on-device Apple Intelligence only to summarize pages in reader mode and to auto-name tab groups as you make them (David, 2026-11-19).
- **Deepcall (David, 2026-11-19):** a co-op third-person action game about pilots in flying exosuits, called Mantles, set in a drowned near-future world of Nordic fjords, glaciers, and volcanic rifts. You fly anywhere across one open world, liberate outposts, and hunt the giants that survived the flood. You can play alone or with friends (David, 2026-11-24). Unreal Engine 5.8 and C++, built solo with Claude Code. PC (Windows), mouse and keyboard first. In early development; the flight prototype (hover, flight, heat, and two-player networking) is the current milestone. No site, Steam page, or public repo yet. The name is from Psalm 42:7, "Deep calls to deep"; it fits the drowned world, and the music's main motif is planned around kulning, a Scandinavian herding call sung across valleys. Its image (`assets/work/deepcall.jpg`) is an Unsplash photo (black coast, by Andre Filipe), labelled as a mood reference, not the game.
- **NW Remarketing identity (David, 2026-11-19):** David's rebrand of the company, which may be named on the site. The mark is "nwr" typed at a terminal, the block cursor on the r, and a snowcapped Cascade peak hidden in the w; the amber is from amber-phosphor terminals. Tagline: "Infrastructure, in hand." Used on Odoo invoices and documents, the eBay store, email signatures, and the website header. The image (`assets/work/nwr-identity.webp`) is the reversed horizontal lockup on Basalt (#161513).
- **Alfred and the SOP Assistant (not on the site since 2026-11-19):** two AI assistants inside the company's Odoo 19 ERP, both built on the Gemini API. Alfred answers questions from live data, such as which in-stock units meet a customer's license requirement. The SOP Assistant answers how-to questions from the company's own process docs. Both are in ongoing use across the team. A question that used to mean a walk to the warehouse is now one question.
- **NW Copywriter Lab:** an internal tool that turns a part number into an eBay title that doubles as a quote line, a product description, and weight and dimensions, and it saves the spec data for store filters. It was prototyped in Google AI Studio, rebuilt with Claude, and deployed on Cloudflare, three days from idea to production. It now wears the NW Remarketing identity; its image is `assets/work/copywriter-lab.webp`, a cropped screenshot of the rebranded app (2026-11-19). The old demo video showed the old look and was removed. (Confirmed by David on 2026-11-09.) On the site the two pieces of writing are called "the quote description" and "the eCommerce description", not "the eBay title" and "the product description" (David, 2026-11-25). Every listing follows the same rules, so they all read like one person wrote them (David, 2026-11-24).
- **The back-office rebuild:** a move off QuickBooks Desktop and an unsupported in-house database onto Odoo 19, with David as sole internal owner. It took ten weeks from kickoff to go-live, with zero downtime and every order shipped on launch day. It produced the company's first live P&L. Sales tax is automated across nine states, and month-end compliance went from three days to one report. Serial tracking with searchable test prints removed 500+ warehouse trips a year.
- **How I build:** every project starts with a brief that says who it's for, the rules the agent can't break, and a done test for each step. The Firn rules quoted in the mockup are real. David cares about how software feels, not just how it looks: it should be pretty to look at, easy to use, and fun (David, 2026-11-10).
- **Music:** David sings, writes, and produces in My Brothers And I. The band has placements on Virgin River, Pretty Little Liars, Queen Sugar, Love Island, and others through Secret Road (Love Island added by David, 2026-11-23). "Hark" is by Mitsunami, featuring My Brothers And I: David wrote the lyrics and melody over Mitsunami's beat (David, 2026-11-17).
- **Background:** David started in shipping in 2019 and is based in Salem, Oregon.
- **Utu Weather:** David's next app, in development and not out yet. The name, said "OO-too", is Finnish for haze or mist. Built with SwiftUI, WeatherKit, and WidgetKit. "Utu Weather is a calm iPhone weather app that writes the forecast as a plain-English sentence first and puts the numbers second, like 'Grey and mild. Showers drift in around 4 and stay through the evening.' It has soft, hazy skies, gentle motion and widgets that answer questions directly ('Umbrella? Yes, after 4.'). Weather, without the noise." Short version: "A calm iPhone weather app that tells you the forecast in a plain-English sentence, then shows the numbers." Its site, utuweather.com, is live. (David, 2026-11-10.) Its images are design mockups, not screenshots of a shipped app; label them that way. The hero image is `assets/work/utu.webp` (the widget set from its brand kit, 2026-11-19); the full set of mockups David sent is not in the repo.
- **The apps together:** Firn, Utu, and Nynna are "the David Wurgler apps." Ask David for Nynna's facts before showing it.
- **"Who's making it" (from David's app sites, 2026-11-10, approved wording):** "I'm David. I design and build software, and I live in Salem, Oregon, with my wife and our two boys. I'm also a songwriter: a few of my songs have ended up on network TV, and I play in a band called My Brothers And I." / "I make these apps with Claude, an AI from Anthropic, as my coding partner. I decide what each app is and how it should feel: the design, the details, the way it behaves. Claude and I write the code together and catch each other's mistakes." / "I build the things I wish already existed: quiet, well-made tools that respect your time and your privacy. If one of them makes your day a little calmer, that's the whole point." Reuse its facts and voice here; adapt it, don't paste it whole.

### Links

On the site:

- Email: hello@davidwurgler.com (forwards to David), shown as selectable text with a Copy button.
- LinkedIn: https://www.linkedin.com/in/david-joel-wurgler
- GitHub: https://github.com/dwurgy
- Threads: https://www.threads.com/@dwurgy (David, 2026-11-23: "no insta link. just threads.")
- Spotify: https://open.spotify.com/artist/01pbsrLZgBLuMIoU10Ypyb
- Apple Music: https://music.apple.com/us/artist/my-brothers-and-i/892386824
- Band site: https://www.mybrothersandiband.com/

Not on the site: Instagram (https://www.instagram.com/dwurgy/ and https://www.instagram.com/mybrothersandi/).

### Voice

Write plainly and directly, like a person talking. Use short sentences, no hype, and no buzzwords. Always use the serial comma. Say what a thing is and stop. The copy on the site is David's final text (2026-11-24); keep it exactly, line breaks included, unless David changes it. Lines David wrote or chose:

- "I make pretty things." (the sentence, matching his GitHub and Threads bio)
- "I take pictures." and "I make music." (he likes the matching phrasing)
- "Good software is easy on the eyes and easy to use. Then it gets out of your way." (he cut "and fun": "fun just seems lame"; "easy on the eyes" replaced "pretty to look at" on 2026-11-24)

On project pages, each part has one job. The grey line says what it is, the body says how it works and how I made it, the name's meaning comes last, and the table holds only facts that appear nowhere else.

### Assets

- `assets/photos/`: David's photographs, with all metadata already stripped. Use them through Astro's image pipeline and never serve the originals directly. The seven behind "pretty", in order (`src/data/photos.ts`): `lodge-dusk.jpg`, `flowers-table.jpg`, `pavilion-peak.jpg`, `wheelbarrow-driveway.jpg`, `firs-house.jpg`, `ice-cream.jpg`, and `lake-dusk-moon.jpg`. `coast-dusk.jpg`, `lake-dusk-reeds.jpg`, and `david-portrait.jpg` are from the previous site and aren't used now.
- `assets/work/`: each thing's pictures, in `src/data/things.ts`.
  - **Firn (four, from the rebrand, David, 2026-11-25):** `firn/mac.jpg`, `firn/mac-split-view.jpg`, `firn/sync.jpg` (Mac and iPhone, "Your spaces, synced with iCloud.", David, 2026-11-25; it replaced `iphone.jpg`), and `firn/iphone-tabs.jpg`, each 2880 × 1800 and in that order.
  - **Utu (four, all design mockups):** `utu/hero.webp` leads, then `utu.webp` (the widget set), `utu/phones.webp` (four phones), and `utu/lockup-sky.webp`. Also sent by David and not used: `utu/phone-drizzle.webp`, `utu/lockup-paper.webp`, and the two bare wordmarks.
  - **One each:** `deepcall.jpg` (a mood reference, labelled as one), `nwr-identity.webp`, and `copywriter-lab.webp`.
- Copywriter Lab's image is only 1210 pixels wide, so it's soft at the size pictures are now shown. It needs a bigger original from David, at least 2400 wide.

Any new photo must have its metadata (including GPS) stripped before it is committed. This repo is public.

## Rules for working in this repo

- Work on the session's own branch. Never push to or merge into `main` unless David says to in so many words. `main` is the live site.
- One small step at a time. After each step, tell David what to look at and wait for his OK.
- Make small commits with plain messages.
- Ask before adding any dependency beyond Astro, its official integrations, and Fontsource.
- Keep the repo public-safe. No customer names, prices, emails, order data, home addresses, or photo metadata, in code or in screenshots. Blur sensitive parts of any screenshot of company software before adding it.
- No trackers, cookies, embeds, or third-party scripts. The one exception is Cloudflare Web Analytics, which is cookieless and already enabled for the domain in Cloudflare.
- Accessibility is part of done: real links and buttons, a visible focus state, alt text on every meaningful image, readable contrast, and a full keyboard path.
- If something in this brief conflicts with what David asks in the moment, do what David asks and update this file.

## Where we are

- **2026-11-23: the site was rebuilt from a blank slate** in one session, first as a test page and then as the real site, and merged to `main` (David: "nuke the old site. long live the new site."). The previous site (paper, photographs, a 3D camera, and a music player) is gone from the code; its story is in `docs/HISTORY.md`.
- **2026-11-24: brand kit v3 files are in.** The tab icon and app icons are now "DW.", the share image is the kit's, and the dot holds its still shape under reduced motion and in print. Merged to `main` (David said to). Later the same day: app icons with larger letters, the kit's marks in `public/brand/`, and `design/brand-kit/` replaced with v3.
- **2026-11-24: the hint is live.** Once a visit, about 4 seconds after the sentence arrives on the home page, each word is chosen in turn and the dot swells once. Merged to `main` (David said to). Checked here in a headless browser; not yet checked in real Safari on David's laptop and iPhone.
- **2026-11-24: David's final copy is in** on every door and all five project pages, and the facts above were brought in line with it. Also the same day: the dot swells more slowly, a scroll on the home page plays the hint, and the dot no longer ghosts when doors change.
- **2026-11-25: the icons were replaced again** with the kit's versions where "DW." fills more of the square, Copywriter Lab's paragraph was reworded, and `design/brand-kit/` was replaced with the newer v3 zip (its icons and profile pictures changed). The first two are on `main` (David said to). Firn's four pictures were replaced with the rebrand's, and its page now says Mac, iPhone, and iPad.
- **2026-11-25: Firn for iPhone and iPad is out** on the App Store; its table now says "Released November 2026".
- **Checked here:** every address at 1440 × 900 and 390 × 844, light and dark; the click-through flow, reels, Back and Forward, Escape, old addresses redirecting, and the pages without scripts.
- **Waiting on David:**
  - How it feels on his real laptop and iPhone, especially in Safari.
  - The tab icon in Safari and Chrome, and a pasted link's preview, checked by hand.
  - Whether to swap in the kit's new email monogram, and whether to delete the old WURGLER lockups and wordmarks from `public/brand/`.
  - A bigger Copywriter Lab image.
  - Three Cloudflare secrets from the old music player are no longer used and can be deleted in the dashboard: `MUSICKIT_PRIVATE_KEY`, `MUSICKIT_KEY_ID`, and `APPLE_TEAM_ID`.

Details and reasoning live in `docs/HISTORY.md`, not here.

## How to work with David (instructions for Claude)

David is not a programmer. He directs the work and judges how it looks and feels.

- **Plain English.** No jargon without a one-line explanation. Say what changed and what he'll see, not how the code does it.
- **One small step at a time.** Before a step, say in a sentence or two what you're about to do. After it, say what changed and exactly what to look at. Then stop and wait for his OK.
- **Model.** Use Opus for every step. David no longer uses Sonnet (2026-11-10).
- **Spend his usage carefully.** Read only the files and parts you need, and don't re-read files already read in this conversation. Keep replies short. Never skip testing or the brief's rules to save effort.
- **Checkpoints.** When a step works and is committed, update "Where we are" in a line, put any reasoning worth keeping in `docs/HISTORY.md`, and recommend `/clear`. Recommend `/compact` instead only if something important lives only in the conversation.
- **Stuck rule.** After two failed tries at the same fix, stop and say what's known and what's been ruled out.
- **Where the work happens.** Building now happens in Claude Code in the cloud, not on David's Mac.
- **Pushing.** Commit each finished step to the session's branch and push it yourself. Never push to or merge into `main` unless David says to in so many words.
- **How David checks the site.** Every push to a branch gets a Cloudflare preview link: a branch named `claude/some-name` is at `https://claude-some-name-my-website.dwurgy.workers.dev`. It takes about a minute to build. After each push, give him the link on its own line (no full stop after it) and say exactly what to look at, on desktop and on his phone. The cloud session can't open workers.dev; check the build with `curl -s https://api.github.com/repos/dwurgy/my-website/commits/<sha>/check-runs`. Tell him to reload with Cmd + Shift + R.
- **How you check the site.** Run `npm run build`, then `npx astro preview --port 4321`, and look at it with a headless browser (Playwright and Chromium) at 1440 × 900 and 390 × 844, in both themes. For motion, capture frames in the middle of a move and look at them; David also sends screen recordings, which `ffmpeg` can lay out as a sheet of frames. If a headless browser can't be installed here, say so and rely on David's preview links.
- **Lighthouse** uses the same headless Chromium.
