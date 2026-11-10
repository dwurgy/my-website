# Build plan

Work through these phases in order, on the `redesign` branch. Tick the boxes as they are done. At the end of each phase, stop, show David, and wait for his go-ahead.

## Phase 0: Before any code (David)

How the site deploys today (checked October 20, 2026): it's a Cloudflare Worker named `my-website`, built from GitHub by Workers Builds.

- Production branch: `main`. Every push to `main` goes live.
- Builds for non-production branches: on. Pushes to `redesign` upload a new version, but they don't go live.
- Build command: none. Deploy command: `npx wrangler deploy`. Version command: `npx wrangler versions upload`. Root directory: `/`.

- [x] Confirm how the site deploys.
- [ ] Turn on Worker Previews (the "Set up" banner on the Builds page), so each push to `redesign` gets its own preview link to check on a phone.

## Phase 1: Foundation

- [x] Set up Astro (static output) with TypeScript, at the repo root. Keep `assets/`, `design/`, and `docs/` where they are.
- [x] Self-host Archivo (variable, width and weight), Cormorant Garamond Italic, and JetBrains Mono, subset to Latin.
- [x] Define the colour and type tokens from CLAUDE.md as CSS custom properties in one global stylesheet.
- [x] Generate one tileable noise image for the grain.
- [x] Update `wrangler.jsonc` so `assets.directory` points at Astro's output (`./dist`).
- [ ] Once `package.json` is on the branch, have David set the Build command to `npm run build` in Cloudflare. Leave the deploy and version commands as they are. That setting applies to every branch, so `main` must not get another push before launch: the old site has no `package.json` and its build would fail.
- [x] Add a `.gitignore` for `node_modules`, `dist`, and `.astro`.

**Done test:** `npm run build` finishes with no warnings. The built page shows the night background, the grain, and the two glass pills in the right fonts. Nothing on the page makes a network request to any other domain except Cloudflare Web Analytics (check the browser's network panel).

## Phase 2: Homepage, still

- [x] Build the homepage section by section to match `design/mockup-v3.html`: hero, work, paper (numbers and how I build), off the clock, and contact.
- [x] Use Astro's image components for every photo, with sizes set so phones get small files.
- [x] Make it work at 1440px, 1024px, 768px, and 390px. On phones, type scales down, the nav becomes the wordmark plus a menu pill, and the work list stacks with each card under its name.
- [x] Add the copy button for the email address.

**Done test:** Screenshots at 1440px side by side with the mockup show no meaningful differences in layout, type size, or spacing. The page also works at 390px with no sideways scrolling. Lighthouse on mobile scores 95 or higher for performance, accessibility, and best practices.

## Phase 3: Motion

- [x] Hero settle on load.
- [x] Work list: names brighten in turn and the card cross-fades to each project as you scroll.
- [x] Photo sections: slow parallax or blur-to-sharp on entry.
- [x] Reduced-motion mode: everything still and complete.

**Done test:** A Chrome Performance recording while scrolling the whole page shows no long frames or layout shifts. With reduced motion turned on, nothing moves and nothing is hidden. Show David a screen recording.

## Phase 3b: The v5 direction

- [x] Commit `design/mockup-v5.html` and `docs/v5-handoff.md`, and point the brief at the mockup.
- [x] Theme tokens and dark mode: every colour as a token, the no-flash head script, system-following by default, and the toggle in the control bar.
- [x] Ground and materials: paper everywhere, one fixed grain layer, and the single glass control bar with the current section shown. Remove the per-section grain, the photo overlays, the glass project card, and the glass band card.
- [x] Hero: the pinned full-bleed-to-print shrink, with the two-copy headline.
- [x] Work: the ink index, the cursor preview, keyboard focus, and the touch fallback.
- [x] Off the clock: the pinned sideways strip, plus its reduced-motion fallback.
- [x] Say hi: the pinned print-to-full-bleed grow, with the contact text on the photo.
- [x] Remove the v3 motion this replaces: the hero settle on load, the pinned work list with its cross-fading card, and the photo parallax.

**Done test:** A Chrome Performance recording while scrolling the whole page shows no long frames or layout shifts. Nothing runs on a timer except the load fade, hovers, page changes, and the theme switch. With reduced motion on, nothing moves and every photo is reachable. Both themes pass contrast checks, and reloading in either theme shows no flash of the other. At 390px there is no sideways scrolling outside the Off the clock strip. Lighthouse on mobile stays at 95 or higher. Show David a screen recording at 1440px and on his phone.

## Phase 4: Project pages

- [x] A page for each project at `/work/firn`, `/work/alfred`, `/work/copywriter-lab`, and `/work/back-office`. Write each as a Markdown file in a content collection.
- [x] Each page covers the problem, what David built, the result, and a few images, using only facts from CLAUDE.md. Where a fact or image is missing, leave a clearly marked placeholder for David rather than inventing it.
- [x] Use the Copywriter Lab demo video on its page, with the poster image, muted, and with controls.
- [x] Project pages use the paper ground: a back button, the title, a short lede, the main image, a row of facts, one paragraph, links, and a large "Next project" row at the bottom.
- [x] Opening a page from the index morphs the cursor preview into the main image in about 300ms. Going back returns to the work index.

**Done test:** Every link on the homepage reaches a real page. Each page reads well at 390px. No number or claim appears that isn't in CLAUDE.md.

## Phase 5: Finish

- [x] Social share image (1200 × 630): the coast photo with the headline. (2026-11-10)
- [x] Favicon, page titles, meta descriptions, a sitemap, and a calm 404 page. (2026-11-10)
- [x] An accessibility pass: keyboard only, a screen reader skim, and contrast checks over every photo. (2026-11-10)

**Done test:** Lighthouse is 95 or higher in all four categories, on mobile and desktop. The share card looks right when the link is pasted into a message.

Result (2026-11-10): Lighthouse passed on every page (see HISTORY). Share card checked by its tags and image; the real paste test moves to Phase 6, once davidwurgler.com serves this site.

## Phase 6: Launch (only when David says so)

- [x] Merge `redesign` into `main`. Done 2026-11-10 (fast-forward, build passed).
- [ ] Confirm the live site at davidwurgler.com, on a phone and on a laptop, and paste the link into a message to check the share card.
- [ ] The old site stays in git history if it's ever needed.

## Phase 7: Designer who builds (David, 2026-11-10)

See "Direction" in CLAUDE.md. One box at a time; David checks each on the preview link.

- [x] Update the brief with the new direction.
- [x] Cut the stats row from How I build. Done 2026-11-10.
- [x] Footer: one line, "Photographed and built by David Wurgler, with Claude Code," linking to the source. Done 2026-11-10.
- [ ] Intro and How I build copy: rewritten for the new angle, using the "Who's making it" facts. David approves the words before they go in.
- [ ] Work index: apps first (Firn, then Utu Weather as "coming soon" once David gives its facts), then Copywriter Lab and Alfred. Decide with David what happens to the back-office rebuild.
- [ ] Done test: the 30-second read says "designer who builds software with AI," at 1440px and 390px, in both themes.

## Waiting on David

- Nynna: whether to show it, and its facts.

- A clean Firn screenshot with his own tabs.
- Screenshots of the SOP Assistant, with customer names and numbers blurred.
- Back-office image: done, serial lookup (`assets/work/serial-lookup.png`).
- Alfred: a full-screen chat screenshot with clean formatting, plus an optional clip that David records and Claude in chat trims.
- Photo captions: v5 shows none. Add them back only if David supplies a place and year for each photo.
- Worker Previews: still needed, and now essential, because the preview link is the only way David sees the site.
- Whether to bring back the NWR brand identity work from the old site (nwr-brand-canvas.netlify.app). It isn't in v3.
