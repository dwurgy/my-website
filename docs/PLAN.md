# Build plan

Work through these phases in order, on the `redesign` branch. Tick the boxes as they are done. At the end of each phase, stop, show David, and wait for his go-ahead.

## Phase 0: Before any code (David)

- [ ] Confirm how the site deploys today. Either Cloudflare builds from GitHub automatically on each push, or David runs `wrangler deploy` by hand. Look in the Cloudflare dashboard under Workers & Pages → my-website → Settings → Build.
- [ ] Decide whether pushes to `redesign` should make a preview link. If Cloudflare builds from GitHub, turn on builds for non-production branches.

## Phase 1: Foundation

- [ ] Set up Astro (static output) with TypeScript, at the repo root. Keep `assets/`, `design/`, and `docs/` where they are.
- [ ] Self-host Archivo (variable, width and weight), Cormorant Garamond Italic, and JetBrains Mono, subset to Latin.
- [ ] Define the colour and type tokens from CLAUDE.md as CSS custom properties in one global stylesheet.
- [ ] Generate one tileable noise image for the grain.
- [ ] Update `wrangler.jsonc` so `assets.directory` points at Astro's output (`./dist`). Tell David exactly what build command and output folder to set in Cloudflare, if it builds from GitHub.
- [ ] Add a `.gitignore` for `node_modules`, `dist`, and `.astro`.

**Done test:** `npm run build` finishes with no warnings. The built page shows the night background, the grain, and the two glass pills in the right fonts. Nothing on the page makes a network request to any other domain (check the browser's network panel).

## Phase 2: Homepage, still

- [ ] Build the homepage section by section to match `design/mockup-v3.html`: hero, work, paper (numbers and how I build), off the clock, and contact.
- [ ] Use Astro's image components for every photo, with sizes set so phones get small files.
- [ ] Make it work at 1440px, 1024px, 768px, and 390px. On phones, type scales down, the nav becomes the wordmark plus a menu pill, and the work list stacks with each card under its name.
- [ ] Add the copy button for the email address.

**Done test:** Screenshots at 1440px side by side with the mockup show no meaningful differences in layout, type size, or spacing. The page also works at 390px with no sideways scrolling. Lighthouse on mobile scores 95 or higher for performance, accessibility, and best practices.

## Phase 3: Motion

- [ ] Hero settle on load.
- [ ] Work list: names brighten in turn and the card cross-fades to each project as you scroll.
- [ ] Photo sections: slow parallax or blur-to-sharp on entry.
- [ ] Reduced-motion mode: everything still and complete.

**Done test:** A Chrome Performance recording while scrolling the whole page shows no long frames or layout shifts. With reduced motion turned on, nothing moves and nothing is hidden. Show David a screen recording.

## Phase 4: Project pages

- [ ] A page for each project at `/work/firn`, `/work/alfred`, `/work/copywriter-lab`, and `/work/back-office`. Write each as a Markdown file in a content collection.
- [ ] Each page covers the problem, what David built, the result, and a few images, using only facts from CLAUDE.md. Where a fact or image is missing, leave a clearly marked placeholder for David rather than inventing it.
- [ ] Use the Copywriter Lab demo video on its page, with the poster image, muted, and with controls.

**Done test:** Every link on the homepage reaches a real page. Each page reads well at 390px. No number or claim appears that isn't in CLAUDE.md.

## Phase 5: Finish

- [ ] Social share image (1200 × 630): the coast photo with the headline.
- [ ] Favicon, page titles, meta descriptions, a sitemap, and a calm 404 page.
- [ ] A `/resume.pdf` link (David supplies the file).
- [ ] An accessibility pass: keyboard only, a screen reader skim, and contrast checks over every photo.

**Done test:** Lighthouse is 95 or higher in all four categories, on mobile and desktop. The share card looks right when the link is pasted into a message.

## Phase 6: Launch (only when David says so)

- [ ] Merge `redesign` into `main`.
- [ ] Confirm the live site at davidwurgler.com, on a phone and on a laptop.
- [ ] The old site stays in git history if it's ever needed.

## Waiting on David

- A clean Firn screenshot with his own tabs.
- Screenshots of Alfred, the SOP Assistant, and the first live P&L, with customer names and numbers blurred.
- Captions for the photos (place and year), or a decision to leave them off.
- His résumé as a PDF.
- Whether to bring back the NWR brand identity work from the old site (nwr-brand-canvas.netlify.app). It isn't in v3.
