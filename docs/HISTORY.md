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

## 2026-11-09: Work index (Phase 3b, box 5)

- Rebuilt the work section as the v5 ink index: hovering a row quiets the others to 0.32 and nudges the name 12px; a 360 × 236 preview follows the cursor with a slight lag inside the shared scroll loop. Keyboard focus (focus-visible only) shows the preview beside the row. Touch screens show each image under its name instead.
- Rows are real links to `/work/<slug>`. Those pages arrive in Phase 4, so they 404 until then. The preview-to-main-image morph also waits for Phase 4.
- The preview renders only once the section is near, so its images don't load with the top of the page.
- Copywriter Lab uses the wording David confirmed on 2026-11-09, not the mockup's older line. Back office now shows `serial-lookup.png`; Alfred keeps a marked placeholder.
- This also removed the v3 pinned work list and its cross-fading card.

## 2026-11-09: Say hi (Phase 3b, box 7)

- The lake grows from a centred print (inset 22% top and bottom, 30% sides, 8% on phones) to full-bleed over a 210vh pin, using the mockup's math. One CSS number, `--print`, drives the clip and the zoom.
- The contact text lives on the photo and is clipped to it. An ink "Say hi." waits on the paper below the print and is covered as the photo grows, as in v5. David asked (2026-11-09) that only one show at a time: the one on the photo stays hidden until the photo has covered the ink one (past its bottom and left edges), then fades in with scroll. This departs from the mockup, where both can show at once.
- Links to `#hello` use a negative `scroll-margin-top` (-110vh) so they land at the end of the pin, where the links are visible. Tabbing into the links jumps there too.
- No résumé link: David decided (2026-11-09) he doesn't want one. Removed from the v5 mockup and the plan.
- Contrast over the photo, measured against the brightest 5% of pixels behind each piece of text: the lowest was 5.0:1 (the Copy button at 390px).
- Removing v3 motion (2026-11-09): the earlier v5 steps had already replaced the hero settle, the pinned work list, and the per-section photo parallax. What was left was dead code: the `parallax` keyframes and a 900ms `--reveal-duration` token. Both removed. The only timer left in the scripts resets the "Copied" label on the email button after 2 seconds, which isn't motion.

## 2026-11-09: Phase 3b done test

- Desktop scrolling dropped about 22% of frames in headless Chromium, which has no graphics card; the mockup dropped none under the same conditions. The cause was the grain: it blended against the scrolling page on every frame. It now paints its own copy of the ground and blends inside itself. Screenshots differ by at most 2/255 per channel. Slow frames fell to about 2%.
- What's left: Say hi on desktop still drops about 1 frame in 10 while the lake grows (the mockup drops none). Bisecting shows it's the glass pills' blur being redrawn as the clip changes. Ruled out: writing clip and zoom straight onto the elements instead of a section variable, and the image format (AVIF, WebP, and the original JPEG all behave the same). Phones are a clean 60fps. Worth checking on a real laptop before spending more on it.
- Passed: no layout shifts, no long tasks, timers only for the load fade, hovers, view transitions, and the copy button's 2-second label reset. Reduced motion holds still with every photo reachable. Contrast: text 14.2 (light) and 15.2 (dark), labels 6.1 and 6.6, paragraphs 12.1 and 11.7; text on photos at least 6.4 at its brightest point. Theme set before first paint in all four system/saved combinations. No sideways page scroll at 390px. Lighthouse mobile 98, 100, 100, 100.

## 2026-11-10: Project page layout (Phase 4, box 4)

- The mockup frames every main image at 16:10.5 and crops it. The back-office screenshot is much wider (1678 × 924), so the crop cut off both sides of the serial record. Real screenshots now keep their own shape; only placeholders use the 16:10.5 frame.
- Project pages carry the control bar too, so the theme button is on every page. Its section links point back to the homepage, and "Work" stays lit.
- Placeholders get a strong rule as an edge, because `night` on the dark theme's ground was nearly invisible.

## 2026-11-10: Preview morphs into the main image (Phase 4, box 5)

- Uses the browser's own cross-page view transitions (CSS `@view-transition`), not Astro's client router, so pages stay plain static pages. Browsers without it (Safari before 18.2, Firefox today) just load the page normally.
- Only the image that stands for the clicked project gets the shared name: the cursor preview on desktop, the image under the name on touch screens. Leaving a project page ("Next project" or back) is a plain 300ms cross-fade, because a morph from an image scrolled far above looked like it flew in.
- Reduced motion turns page transitions off entirely. The theme switch keeps its own 240ms fade; page changes are marked with a `page` type so the two durations don't collide.

## 2026-11-10: Phase 4 done test

- Checked with headless Chromium at 390 × 844 and 1440 × 900, light and dark. Every internal link on the homepage and the four project pages returns a real page; the in-page anchors (#work, #how, #offclock, #hello, #main) all exist. No console errors and no sideways scroll at either width.
- Claims: every fact on the project pages is in CLAUDE.md. A few short phrases go beyond its exact wording ("for people who don't want to learn a new browser", "The whole team, ongoing", "From a written brief, with Claude Code"); all are verbatim from the approved v5 mockup copy.
- Full-page screenshots show a faint band where the fixed grain layer ends. That's a screenshot artifact; the real page has grain everywhere.

## 2026-11-10: Share image (Phase 5, box 1)

- The card is a screenshot of the hero's first frame at 1200 × 630, with the control bar hidden, so it matches the site exactly instead of being a second design to keep in step. `scripts/share-image.mjs` remakes it (run it against `npm run preview`); rerun it if the headline or hero changes.
- It uses the Playwright that comes with the cloud environment, not a site dependency. The JPEG carries no EXIF or GPS, only a colour profile.
- One card for every page, for now. The tags point at `https://davidwurgler.com/share.jpg`, so pasted preview links won't show the card until the site is live.

## 2026-11-10: Favicon, sitemap, and 404 (Phase 5, box 2)

- The favicon is the wordmark's "W": Archivo at full width (125) and weight 800, taken from the self-hosted font file as a shape, in ink on a paper tile, so it reads in light and dark browser tabs. (Retired 2026-11-11; see below.)
- The sitemap is a small hand-written endpoint (`src/pages/sitemap.xml.ts`) instead of `@astrojs/sitemap`: five pages don't need a dependency. Its addresses end in "/" to match the canonical links.
- `wrangler.jsonc` sets `not_found_handling: "404-page"`, so unknown addresses get `404.html` with a real 404 status. The page is marked noindex.
- Titles and descriptions were already in place on every page from Phases 2 and 4.
- The control bar now decides "link to the homepage's sections or not" from the page address, so the 404 page's links work too.

## Phase 5, box 3: accessibility pass (2026-11-10)

- **Keyboard.** Every page tabs in a sensible order: skip link, control bar, the page's own links, contact. Every stop has a visible focus ring and lands on screen, in both themes at 1440 and 390. One fix: on phones, tabbing to Spotify or Apple Music left them off to the side, because the strip only moves with scroll. Now focus in the strip scrolls the page to the nearest point where the link shows (instantly, no animation), and the strip uses `overflow: clip` so focus can't shift it sideways behind the transform. The video's own controls are drawn by the browser and keep its focus style.
- **Screen reader skim.** One h1 per page, no skipped heading levels, landmarks (banner, nav, main, footer) on every page, alt text on every photo, names on every link and button, nothing focusable inside hidden copies. The duplicate headlines on the photos are hidden from readers. How I build reads its numbers before its heading, which matches what you see.
- **Contrast over photos** (measured pixel by pixel behind each line, light and dark, 1440 and 390, at several scroll points): hero text at least 6.3:1, Say hi text at least 7.5:1, contact pills at least 6.7:1 once on the photo. Rule is 4.5.

## Phase 5 done test (2026-11-10)

- **Lighthouse** (13.6, headless Chromium, run from a scratch folder, not added to the repo), on the homepage and all four project pages, mobile and desktop: performance 99–100, accessibility 100, best practices 100, SEO 100. The one exception is best practices 96 on the Firn page, desktop, because `firn-placeholder.jpg` is low resolution; it goes away with David's real screenshot. The 404 page scores low on SEO only because it is noindex and returns a 404, which is intended.
- **One fix.** On project pages the dimmed control-bar links (ink at 0.6 on paper) measured 4.31:1, under 4.5. They are now at 0.68 (5.5:1 light, 7.5:1 dark). The theme button moved with them so the bar stays even. The homepage hadn't flagged it because the bar sits over the photo when Lighthouse looks.
- **Share card.** Every page has og and twitter tags with an absolute image address, 1200 × 630, with alt text. A real paste into a message can't be tested yet: the image address is davidwurgler.com/share.jpg, which still serves the old site until launch. Check it on launch day.

## 2026-11-10: Jittery photos on iPhone

David's screen recording showed every scroll-driven photo jittering on his phone. Cause: each pinned section's sticky box is `100svh` (the small, fixed phone height), but `progress()` measured travel against `innerHeight`, which grows and shrinks as Safari's address bar hides and shows mid-scroll. Each change jumped the hero, the Off the clock strip, and the lake. Fix: `progress()` now measures against the section's `.stick` height, which holds still. Also, Say hi read `getComputedStyle` every frame; it now reads its insets once and after a resize. On desktop Chromium the motion values are identical before and after (checked at 1440 and 390). Headless Chromium has no collapsing address bar, so the real check is David's phone.

## 2026-11-10: Phone jitter, second try: let the browser run the motion

The first fix (stable pin height) wasn't enough; David still saw jitter. Likely cause: on iPhone, Safari scrolls on its own thread and the page's script moves the photos a frame behind, so they shudder against the finger. Fix: where the browser supports CSS scroll-driven animations (Safari 26, Chrome), the CSS now runs the pinned motion itself, tied to the page's scroll position. A registered `--p` runs 0 → 1 across each pin; the hero and lake derive `--settled` and `--print` from it with the same smoothstep curve; the strip animates its `transform` directly, so the browser can move it without redrawing. The scripts only set each pin's range in page pixels (`--pin-start`, `--pin-end`, so the address bar can't move it), the strip's `--travel`, and Say hi's `--covered`, and only when they change. Browsers without support keep the old per-frame script. Note: write the animation as longhands; the build's minifier folds `animation` + `animation-timeline` into a shorthand that browsers reject. Checked in Chromium at 1440 and 390: the same clip, transform, and opacity values as before at every scroll point tested (one 1px rounding difference), and reduced motion unchanged.
David confirmed on his phone that the second fix is smooth (2026-11-10).

## 2026-11-11: The Wurgler mark replaces the W monogram

David sent the new brand files from the David Wurgler design system: the mark (an uneven Cascade ridge over a waterline, with its longer reflection forming a W), the favicons, the phone and manifest icons, and `public/brand/` (lockups, wordmarks, and the email signature image). They are copied in unchanged. The script that drew the phone icon from the old favicon is deleted, since it would overwrite the new one. In the control bar the mark sits beside WURGLER as the compact lockup, all sized from Archivo's cap height (688 of 1000 units, measured in the browser; 10.32px at the bar's 15px): mark 22.7px tall and 31.4px wide, 8.3px gap, its waterline on the capitals' centre to within 0.01px. Negative block margins keep the mark from making the bar taller (still 54px). At 390px the lockup didn't fit beside the controls without squeezing the theme button, so on phones the bar's left padding (22 → 14px) and gap (12 → 6px) tighten and the wordmark's trailing tracking is taken back; every control keeps its full size.

## 2026-11-11: A README

The footer's "Built with Claude Code" link lands on this repo, so the README is its front page. It shows the lockup (ink, or bone in GitHub's dark mode), two homepage screenshots (`docs/images/`, taken from the built site at 1440 × 900, 2× scale), how the site was made with links to the brief, plan, and history, the design in brief, and how to run it. The design section is a short summary that points to CLAUDE.md, so the two can't drift far apart. David chose "All rights reserved" for everything, code included; there's no licence file.

## 2026-11-11: Say hi changes colour at the photo's edge

Before, the ink "Say hi." waited at the bottom of the paper, lower than the one on the photo (which sits above the email and links). The photo covered the ink copy, then the bone copy faded in higher up, so the words seemed to jump. David asked for the hero's effect instead. Now the whole contact block is rendered twice in the same place: an ink copy on the paper (only its title visible, the rest kept for layout so the title lands to the pixel; hidden from screen readers and inert) and the bone copy clipped to the photo. The fade (`--title`, `--covered`) is gone, so the script only drives `--print`.

## 2026-11-11: Off the clock strip blank on iPhone

David's screen recording showed the Off the clock strip empty for most of its pin on his iPhone, with only the moon photo appearing at the very end. Chromium ran it correctly. The strip was the one pinned section animated differently: its own keyframes on the track, with `--travel` (set later by the script) inside the keyframes and the range inherited from the section. The hero and Say hi, which work on his phone, animate `--p` on the section and derive everything from it. The strip now does the same: `pin-progress` runs on `.offclock`, and the track's transform is `--p × --travel`. Could not test Safari here (only Chromium is installed), so David's phone is the check.

## 2026-11-11: Who's making this

David noticed his headshot from the old site was gone and wanted a face to the name near the bottom. His first idea was to put it beside the lake at the start of Say hi and let the photo cover it as it grows. That hides the face just as the contact links appear, and phones have no room beside the lake. He chose a short section before Say hi instead: the headshot as a print on the paper, beside "I'm David." and a few lines adapted from the approved "Who's making it" copy (family and Salem, how he works with Claude, and why he builds). Music is left out because Off the clock just covered it. The headshot came out of the old single-file site in the repo's history; it carried no metadata. Also removed seven test screenshots that had been committed by mistake with the Off the clock fix.

## 2026-11-12: Preview links

- Cloudflare's Previews tab (Workers Builds, "Previews Base") had no build command, so preview builds uploaded nothing. David set it to `npm run build`, but preview builds still skipped it, and so did a preview command of `npm run build && npx wrangler preview` (the build log showed the saved setting never reached it). Fix: `build.command` in `wrangler.jsonc`, which wrangler runs before it looks for `dist`.
- `wrangler preview` refuses to run without a `previews` block in `wrangler.jsonc`, so an empty one was added.
