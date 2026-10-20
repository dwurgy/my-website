# davidwurgler.com

The personal site of David Wurgler: business systems and AI tools, plus the photographs and music that show his taste. This file is the brief. Read it fully before every phase, then work through `docs/PLAN.md` in order.

## What the site is for

One job: someone landing here should understand in about 30 seconds that David builds real systems and AI tools that small teams actually use, and that he has taste. Then they should be able to see the work and get in touch.

The site itself is part of the proof. It should feel crafted, calm, and quick, and it should be obvious it was made with care. The footer says it was built with Claude Code, so the code has to hold up if someone opens the repo.

## Principles

1. **Real over decorative.** Texture and mood come from David's own photographs and real screenshots of real work, never from effects that imitate film.
2. **Calm.** Lots of space, few elements on screen at once, slow and smooth motion. Nothing bounces, flashes, or competes.
3. **Tactile.** Grain, glass, paper. It should feel like a physical object, not a template.
4. **Quick.** A fast, light, static site. No trackers, no cookies, and no third-party requests at all.

## The design

`design/mockup-v3.html` is the approved homepage. Open it in a browser before building and match it: section order, type sizes, spacing, colours, grain, and glass. It is a static reference with inline styles, laid out for a 1440px desktop. Rebuild it properly; don't copy its markup.

What was liked about it, and the reference sites behind it (skylrk.com, bennettandclive.com, and shopify.com/editions/winter2026):

- **David's photos are the atmosphere.** Full-bleed, sometimes sharp, sometimes blurred into a field of colour, always with grain on top.
- **Big, confident type.** One grotesque does almost everything, set large and tight. There is one italic serif word per screen at most, for emphasis.
- **The interface nearly disappears.** A glass pill for the wordmark, a glass pill for the nav, tiny mono labels at the edges, and nothing else.
- **Motion is part of the experience.** Things come into focus, drift, and overlap as you scroll.

### Type

- **Archivo** (variable, with width and weight axes): everything. Headlines are weight about 640 with tracking around -0.035em and line-height about 0.92. The wordmark "WURGLER" is set at full width (125%), weight 800, with wide letter-spacing.
- **Cormorant Garamond Italic:** the single emphasised word ("actually", "brief.", "hi."), set about 1.12 times the size of the surrounding text. Never more than one per screen, and never for whole lines.
- **JetBrains Mono:** small uppercase labels at 11px with 0.14em letter-spacing. Use it for metadata and edge labels only.
- Self-host all fonts (for example with Fontsource) and subset them. Do not load anything from Google Fonts in production.

### Colour

Colour comes mostly from the photos. The page's own colours are:

| Token | Value | Use |
|---|---|---|
| `night` | `#151311` | Dark ground between photo sections |
| `paper` | `#ece6dc` | The paper section (numbers, how I build) |
| `ink` | `#1b1815` | Text on paper |
| `ink-muted` | `#5b534a` | Labels on paper |
| `bone` | `#f3eee7` | Text on photos and on night |
| `bone-bright` | `#fbf7f1` | Headlines on photos |

There is no accent colour. Text over photos must stay readable at 4.5:1: use soft dark gradients (scrims) behind it, as the mockup does.

### Materials

- **Grain:** every photo section and the paper section carries fine noise. On photos use overlay blending at about 0.35 to 0.55 opacity, and on paper use multiply at about 0.35. In production, use one small tiled noise image generated once, not an SVG filter per section, which is slow.
- **Glass:** only for controls and small cards (the nav pills, link pills, the project card, the band card). Use a light gradient fill, a 1px white edge, an inner top highlight, and backdrop blur of about 18 to 22px. Never put `backdrop-filter` on a full-width or full-height element.
- **Corners:** pills are fully round; cards are about 22 to 26px; screenshots inside cards are about 14px.

### Motion

- **Hero:** the coast photo very slowly settles from a slight blur and scale to sharp on load. The headline fades up once.
- **Work list:** as you scroll, each project name brightens in turn while the others stay dim, and the glass card on the right cross-fades to that project's screenshot and line. The background field shifts subtly with it. On a phone, the list stacks with each project's card under its name.
- **Photo sections:** slow parallax or slow blur-to-sharp as each section enters.
- **Feel:** slow ease-out curves of about 600 to 1200ms for reveals, and nothing springy. Prefer CSS scroll-driven animations with a small amount of JavaScript as fallback. Ask before adding a smooth-scroll library.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, everything is still and complete.
- **Smoothness:** scrolling must stay at 60fps on an ordinary laptop. Animate only transform, opacity, and filter on small elements.

### Never

These were tried and rejected:

- Fake film effects: frame numbers, sprocket holes, polaroid borders, light leaks, date stamps, colour filters, and handwritten notes.
- Emoji, decorative gradients, neon, and drop-shadowed "cards everywhere."
- Copying Firn's design system. Firn is one project on this site, not its look.
- More than one italic serif word on a screen.

## Content

### Facts you may use

These are the only claims and numbers allowed. Never invent or round up a number. If something isn't here, ask.

- **Firn:** a calm desktop browser with vertical tabs, spaces, and split view. It runs on macOS and Windows, with Linux coming. It is open source (github.com/dwurgy/firn), and its site is firnbrowser.com. David wrote the brief (its CLAUDE.md) and directed Claude Code through every phase. Released October 2026 and notarized by Apple.
- **Alfred and the SOP Assistant:** two AI assistants inside the company's Odoo 19 ERP, both built on the Gemini API. Alfred answers questions from live data, such as which in-stock units meet a customer's license requirement. The SOP Assistant answers how-to questions from the company's own process docs. Both are in ongoing use across the team. A question that used to mean a walk to the warehouse is now one question.
- **NW Copywriter Lab:** an internal tool that turns a part number into product copy, a quote summary, and a spec sheet. It was prototyped in Google AI Studio, rebuilt with Claude, and deployed on Cloudflare, three days from idea to production. A demo video is in `assets/work/`.
- **The back-office rebuild:** a move off QuickBooks Desktop and an unsupported in-house database onto Odoo 19, with David as sole internal owner. It took ten weeks from kickoff to go-live, with zero downtime and every order shipped on launch day. It produced the company's first live P&L. Sales tax is automated across nine states, and month-end compliance went from three days to one report. Serial tracking with searchable test prints removed 500+ warehouse trips a year.
- **How I build:** every project starts with a brief that says who it's for, the rules the agent can't break, and a done test for each step. The Firn rules quoted in the mockup are real.
- **Music:** David sings, writes, and produces in My Brothers And I. The band has placements on Virgin River, Pretty Little Liars, Queen Sugar, and others through Secret Road.
- **Background:** David started in shipping in 2019 and is based in Salem, Oregon.

### Links

- Email: davidjoelwurgler@gmail.com, shown as selectable text with a copy button.
- LinkedIn: https://www.linkedin.com/in/david-joel-wurgler
- GitHub: https://github.com/dwurgy
- Spotify: https://open.spotify.com/artist/01pbsrLZgBLuMIoU10Ypyb
- Apple Music: https://music.apple.com/us/artist/my-brothers-and-i/892386824
- Band site: https://www.mybrothersandiband.com/
- Instagram: https://www.instagram.com/dwurgy/ (personal) and https://www.instagram.com/mybrothersandi/ (band)

### Voice

Write plainly and directly, like a person talking. Use short sentences, no hype, and no buzzwords. Always use the serial comma. The copy in the mockup is the approved draft; keep it unless David changes it.

### Assets

- `assets/photos/`: David's photographs, with all metadata already stripped. Use these through Astro's image pipeline (AVIF or WebP, responsive sizes) and never serve the originals directly.
  - `coast-dusk.jpg`: the hero.
  - `lake-dusk-reeds.jpg`: the work background (heavily blurred) and the contact section (sharp).
  - `lodge-dusk.jpg`: the full-width "off the clock" image.
  - `pavilion-peak.jpg`, `firs-house.jpg`, and `lake-dusk-moon.jpg`: the row of three under it.
- `assets/work/`
  - `copywriter-lab.mp4` and `copywriter-lab-poster.jpg`: the real demo.
  - `firn-placeholder.jpg`: a low-resolution placeholder. David will supply a proper screenshot.

Any new photo must have its metadata (including GPS) stripped before it is committed. This repo is public.

## Rules for working in this repo

- Work only on the `redesign` branch. Never push to or merge into `main` unless David says to in so many words.
- Follow `docs/PLAN.md` one phase at a time. At the end of each phase, show David screenshots at 1440px and 390px wide, state the done test result honestly, and wait for his go-ahead.
- Make small commits with plain messages.
- Ask before adding any dependency beyond Astro, its official integrations, and Fontsource.
- Keep the repo public-safe. No customer names, prices, emails, order data, home addresses, or photo metadata, in code or in screenshots. Blur sensitive parts of any screenshot of company software before adding it.
- No analytics, trackers, cookies, embeds, or third-party scripts.
- Accessibility is part of done: real links and buttons, a visible focus state, alt text on every meaningful image, readable contrast over photos, and a full keyboard path.
- If something in this brief conflicts with what David asks in the moment, do what David asks and update this file.
