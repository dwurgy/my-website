# History

Details and reasoning that don't belong in CLAUDE.md.

## Phase 1: foundation (2026-10-20)

- **Astro 7, static output**, TypeScript via `astro/tsconfigs/strict`. The `typescript` package itself isn't installed; add it (with `@astrojs/check`) only if David wants type checking in the build.
- **Fonts.** `src/styles/global.css` writes its own `@font-face` rules pointing at the Latin files inside the Fontsource packages, so only Latin is built. Archivo is one variable file (width and weight). The base layout preloads it.
- **Archivo has no arrow (→).** The paper section draws it as a small inline SVG, with a hidden "to" for screen readers.
- **Grain.** `scripts/make-grain.mjs` writes `public/grain.png` (192px, greyscale, seeded so it's the same every time). Its contrast was turned down twice to match the mockup's softer SVG noise. On paper, the tile is screened onto a warm grey before it's multiplied, otherwise it greys the paper.
- **Cloudflare.** `wrangler.jsonc` serves `./dist`. The build command is `npm run build` for every branch, so `main` must not be pushed until launch.

## Phase 2: homepage, still (2026-10-20)

- **Structure.** `SiteHeader` floats over the hero (outside `<main>`). Then `<main>` holds Hero, Work, HowIBuild, and OffTheClock. Contact is the page's `<footer>`, which is the right place for contact details.
- **Phone menu.** The nav is a `popover`. On wide screens it shows in place as the glass pill; under 720px a "Menu" pill opens it. No library.
- **Work list.** Project facts are in `src/data/projects.ts`. On wide screens (1100px and up), all cards share one grid cell on the right, and only the active one shows, so phase 3 can cross-fade them in place. Below 1100px, each card sits under its name. Firn is active for now.
- **Mockup sizes were content-box.** The work card is 650px wide and the band card 610px to match the mockup's outer widths.
- **Left out on purpose:** the Résumé pill (phase 5) and the "[Place, year]" captions (waiting on David). Alfred and the back office have cards without images until David's blurred screenshots arrive.
- **Hero photo is shown sharp.** The mockup's slight blur is the start of the phase 3 settle.
- **Lighthouse.** The stylesheet is inlined (it's about 4 KB) and the favicon is stubbed with `data:` until phase 5. Mobile: 99, 100, 100, 100. Desktop: 100 across the board.
- **Copy button.** Uses the clipboard; if that's blocked, it selects the address instead. Only the fallback has been seen working (the preview pane blocks the clipboard).

## Phase 3: Motion

- **Hero settle.** The photo goes from a 10px blur and 1.06 scale to sharp over 2.6s, on a gentler curve than `--ease-out` (that one front-loads, so the blur was gone in half a second). The words fade up after 0.5s. Both live inside `prefers-reduced-motion: no-preference`, so reduced motion shows the final state with no delay.
- **Headline.** David changed it to "I build tools people actually use." ("small teams" felt too exclusive).
- **Work list.** On wide screens with motion allowed, the section is 100svh plus 70svh per extra project, and the stage inside it is sticky. One invisible step per project sits under the stage; an IntersectionObserver marks whichever step crosses the middle of the screen. CSS transitions do all the motion (name colour, card cross-fade, field drift). JS is used instead of CSS scroll-driven animations because the change is a discrete "which project" state, not a scrubbed value, and it works in every browser. Focusing a project with the keyboard also brings it forward. Narrow screens and reduced motion get the stacked list with every card visible.
- **Photo sections.** The lodge and contact photos are 130% of their frame and drift ±11% with CSS scroll-driven animation (`animation-timeline: view()`). The row of three rises 80px into place as it enters; on wide screens the second and third rise further (140px, 200px) so they overlap on the way in. David found the first amounts (±7%, 40/72/104px) too subtle to notice, so they were roughly doubled. The contact photo drifts only while it arrives (`entry 0% entry 100%`), because the footer never scrolls off the top. Transform and opacity only: blur while scrolling was ruled out as too heavy for big photos. Where scroll-driven animation isn't supported (Firefox for now), the photos simply sit still.
- **Two gotchas.** (1) The minifier folds `animation` plus `animation-timeline` into one shorthand that Chrome rejects, so the rules use longhands. (2) A frame with `overflow: hidden` becomes the view timeline's scroller and freezes the parallax at 50%; the frames use `overflow: clip` instead.
- **Testing note.** The Browser pane, when hidden, doesn't produce frames, so scroll-linked animations and `requestAnimationFrame` don't update. Taking a screenshot forces a frame.
- **Reduced motion.** Every animation sits inside `prefers-reduced-motion: no-preference`, and the global reduce rule makes hover colour changes instant. Checked by rewriting the page's media rules in the Browser pane (it can't emulate the setting): no animations run, nothing is hidden or transparent, and the work list falls back to the stacked layout at every width. Rewriting live triggers transitions that the hidden pane freezes mid-way; finish them before measuring.
- **Dim names as whole words.** The work list names were dimmed with a see-through colour, so wherever tightly tracked letters overlap ("yw", "ff") the overlap was painted twice and showed as a brighter seam. Now each name is solid and the whole word is faded with `opacity`, which also animates more cheaply than colour.
- **Done test (2026-10-20).** Run in headless Arc over the DevTools protocol (no new dependencies), on the M2's real GPU (ANGLE Metal). Whole-page scroll at 1440×900 and 390×844, motion on and off. Final run: every frame at about 16.7ms (60fps), no frames over 33ms, no long animation frames, layout shift 0. With reduced motion emulated: no running animations, no photo moved, nothing hidden. The first full run had 10 slow frames (worst 433ms) and one probe had one 83ms frame where the lodge photo first loads; four repeat passes and the final run had none, so those were taken as Arc starting up and first-time image decoding. Worth re-checking on a real phone once Worker Previews are on.
- **Email.** David set up forwarding, so the footer and the brief now use hello@davidwurgler.com instead of his Gmail address (also changed in the mockup).
- **Phase 3 closed** by David (2026-10-20).

## Phase 3b: The v5 direction

- **Move to the cloud (2026-11-09).** Building moved from David's Mac to Claude Code in the cloud. Claude pushes `redesign` itself and checks pages with headless Chromium (Playwright) at 1440 × 900 and 390 × 844 in both themes. David checks on Cloudflare preview links.
- **Brief updated for v5.** CLAUDE.md and PLAN.md were changed to match `docs/v5-handoff.md`. One addition beyond the handoff: the theme switch (about 240ms) is listed with the timed motion, because the handoff's own dark-mode section gives it a view transition.
- **Mockup check.** `design/mockup-v5.html` served from the repo root ran cleanly at both sizes and in both themes: no script errors, no failed requests, no sideways scroll, and the hover preview and project page worked.
- **Copywriter Lab wording** confirmed by David on 2026-11-09. "Three days from idea to production" stays.

## 2026-11-09: Theme tokens and dark mode (Phase 3b, box 2)

- Theme tokens (`--bg`, `--fg`, `--fg-muted`, `--body`, `--rule`, `--rule-strong`, `--btn-border`, `--bar-*`, `--grain-*`) live in `global.css`, keyed on `data-theme` on `<html>`, with values taken from the v5 mockup.
- A tiny inline script in the head sets the theme before first paint: a saved choice in `localStorage` wins, otherwise the system setting. It also sets the browser's `theme-color`.
- The sun/moon button sits before "Say hi". Until the visitor clicks it, the site follows system changes live. Switching uses a 240ms view transition, skipped with reduced motion.
- The v3 photo sections are pinned to bone text so they read the same in both themes until the later boxes rebuild them. The focus ring now uses `currentColor`, so it's ink on paper and bone on photos.
- The control bar is still the v3 glass pill. Box 3 rebuilds it, so the toggle sits inside the phone menu for now.

### 2026-11-09: Phase 3b, box 3, ground and materials

- One grain layer, fixed behind all content in `Base.astro`, using `public/grain.png` (not the mockup's SVG filter, which is slow). `main` and the footer sit above it, so it shows on paper and never on photos. The per-section grain and the grain over photos are gone.
- Sections no longer paint their own background; paper (or warm night) shows through everywhere.
- The header is now the v5 control bar: one fixed, centred glass bar. The current section is found in at most one frame per scroll event; the hero step will fold this into the shared scroll loop. The phone menu is gone; on phones the middle two links hide.
- New `.btn` (outline on paper, fills with ink on hover). `.pill` is now the lighter v5 glass, used only for the contact links on the lake photo. `.glass` and the card radii are removed; prints and screenshots use `--radius-print` (6px).
- Work and Off the clock got a plain interim look on paper (ink index with the v3 pinned card, band text moved off the photo). Their v5 versions are later boxes.
- Note for the accessibility pass: nav links at 0.6 opacity on paper measure about 4.3:1, just under 4.5. That value is from the approved mockup.

## 2026-11-09: v5 hero

- One shared scroll loop (`src/scripts/scroll.ts`). Each job reads first and writes after, so positions are never read after a style change in the same frame. The control bar's current-section check moved onto it. Off the clock and Say hi will use it too.
- Scroll sets one CSS variable, `--settled` (0 to 1, smoothstep), on the hero. CSS turns it into the clip-path inset, corner radius, and photo zoom, so phone sizes and reduced motion are plain media queries with no JS.
- Reduced motion: the hero is one screen tall instead of 230vh, so there's no still stretch to scroll through. A small departure from the mockup, which keeps the full height.
- The hero headline turns off the site-wide `text-wrap: balance`, so it breaks as in the mockup ("people actually / use.").
- Checked at 1440 and 390, both themes, against the mockup: matches. No layout shift while scrolling the hero.
