# Handoff: the v5 direction ("paper with windows")

David approved v5 on 2026-11-04. It replaces `design/mockup-v3.html` as the approved homepage. The reference is `design/mockup-v5.html`: one self-contained file that loads the real photos from `assets/` (serve the repo root so its `../assets/` paths resolve). It works, so you can click through it, hover the index, open a project, and take screenshots to compare against. Use it for layout, sizes, colours, copy, and the motion math in `tick()`. Rebuild it properly in Astro; don't copy its markup. The project page in it is a stand-in for real `/work/<slug>` routes.

Apply the changes below to `CLAUDE.md` and `docs/PLAN.md`, show David the diff, and wait for his OK before any code.

---

## Changes to CLAUDE.md

### "The design": replace the first paragraph and the "What was liked" list

`design/mockup-v5.html` is the approved homepage. Look at it in a browser before building. `design/mockup-v3.html` stays for history only. Match v5: section order, type sizes, spacing, colours, and motion. It's laid out for a 1440px desktop and works down to 390px.

What makes v5 work:

- **Paper is the home.** The page is warm paper from top to bottom, with ink type. It never switches to a dark ground between sections.
- **Photos are windows.** David's photos appear as prints on the paper. They go full-bleed only at the start and the end of the page.
- **Big, confident type.** One grotesque does almost everything, set large and tight. There is at most one italic serif word per screen.
- **Motion follows your hand.** Scroll and the cursor drive almost every movement. Nothing makes you wait.

### "Colour": replace the token table's notes

- `paper` `#ece6dc` is the ground for the whole page and the project pages.
- `ink` `#1b1815` is for text, rules, and outline buttons on paper. `ink-muted` `#5b534a` is for labels and secondary text.
- `night` `#151311` is used only behind screenshots and placeholders. It is no longer a section background.
- `bone` and `bone-bright` are used only for text that sits on a photo.
- Text over photos still needs 4.5:1, using a scrim inside the photo.

### "Colour": add a "Dark mode" subsection after it

The site has a light theme (paper and ink) and a dark theme (warm night and bone). Photos, scrims, and text on photos are the same in both. Only the ground, text, rules, buttons, the control bar, and the grain change.

| Token | Light | Dark |
|---|---|---|
| `bg` | `#ece6dc` | `#171512` |
| `fg` | `#1b1815` | `#f0eae1` |
| `fg-muted` | `#5b534a` | `#a39a8e` |
| `body` (paragraphs) | `#2b2622` | `#d6cec2` |
| `rule` | ink at 0.2 | bone at 0.16 |
| `rule-strong` | ink at 0.35 | bone at 0.3 |
| `bar-bg` | paper at 0.62 | night at 0.55 |
| Grain | multiply at 0.32 | screen at 0.07 |

- Write every colour on the page as one of these tokens, so a theme is just a change of token values.
- By default the site follows the visitor's system setting, and it changes live if that setting changes.
- A sun/moon button in the control bar, just before "Say hi," overrides the system setting. Its label says what it will do ("Switch to dark mode"). The choice is saved in `localStorage` (not a cookie) and wins over the system setting from then on.
- Set the theme in a tiny inline script in `<head>`, before first paint, so the page never flashes the wrong theme.
- Switching themes uses a short view transition (about 240ms).
- Both themes must pass the brief's contrast rules on their own.

### "Materials": replace the section

- **Grain:** one fixed, tiled noise layer behind the content, blended with multiply at about 0.32, so it shows only on paper. There is no grain overlay on photos. Their grain comes from the scans.
- **Glass:** only on the control bar, and on buttons that sit on top of a photo (the contact links). There are no glass cards.
- **Control bar:** one glass bar, fixed and centred at the top. It holds the WURGLER wordmark, Work, How I build, Off the clock, and an ink "Say hi" pill. The current section's link is at full opacity and the others are at 0.6. On phones the middle two links hide.
- **Corners:** pills are fully round. Prints, screenshots, and the cursor preview are about 6px.
- **Buttons on paper:** a 1px ink outline that fills with ink on hover.

### "Motion": replace the section

The rule: **motion follows your hand.** Anything that scroll or the cursor can drive, they drive. The only timed motion is:

- the headline fading up once on load (about 700ms),
- hovers (about 200ms),
- page changes (about 300ms, using the View Transitions API).

Nothing else runs on a timer.

- **Hero (pinned, about 230vh):** the coast photo starts full-bleed and shrinks, matched to scroll, into a print on the right half of the paper: inset 20% top and bottom, 50% left, 40px right, with corners going from 0 to 6px. On phones it ends as a print across the top. The headline exists twice: an ink copy on the paper and a bone copy clipped to the photo's exact shape, so its colour changes right at the photo's edge. The photo also scales from 1.12 to 1.
- **Work:** a large ink index with no background photo. Hovering a row fades the other rows to about 0.32 opacity, nudges the name 12px right, and shows a 360 × 236 preview of the project that follows the cursor with a slight lag. Keyboard focus shows the same preview beside the row. On touch screens there's no preview; each project's image shows under its name instead. Clicking a row opens its project page, and the preview morphs into the page's main image in about 300ms.
- **How I build:** still, on paper.
- **Off the clock (pinned, about 340vh):** the music text, then the lodge, pavilion, firs, and moon photos at mixed heights and offsets, drifting sideways exactly as fast as you scroll down.
- **Say hi (pinned, about 210vh):** the lake starts as a centred print and grows to full-bleed by the bottom of the page. The contact text appears on the photo, using the same two-copy clip as the hero. Only the copy on the photo is interactive.
- **Pinned lengths** are starting points. If a pinned section starts to feel like a chore, shorten it.
- **Reduced motion:** the hero shows as a finished print and the lake as full-bleed. The Off the clock photos become a normal row the reader can scroll sideways, because a still track would hide them. Nothing is hidden.
- **Smoothness:** animate only transform, opacity, and clip-path. Read scroll position in one `requestAnimationFrame` loop. Keep 60fps on an ordinary laptop.

### "Never": add these lines

- Timed animations that make the reader wait (long crossfades, slow reveals).
- Switching the background between dark photo, blur, and paper from section to section.
- Glass cards or panels. Glass is only for controls.
- A full-page fixed photo layer behind the content.

### "Assets": replace the photo list

- `coast-dusk.jpg`: the hero.
- `lodge-dusk.jpg`, `pavilion-peak.jpg`, `firs-house.jpg`, and `lake-dusk-moon.jpg`: the Off the clock strip, in that order.
- `lake-dusk-reeds.jpg`: the Say hi photo, sharp. It's no longer used blurred.

### "Where we are": add one line

- **2026-11-04:** David approved the v5 direction ("paper with windows"). The homepage built in Phases 2 and 3 matches v3 and needs rework. See Phase 3b in `docs/PLAN.md`.

### "Working with David": replace the "How David checks the site," "Pushing," and "Lighthouse" bullets

Building now happens in Claude Code in the cloud, not on David's Mac.

- **Pushing.** Commit each finished step to `redesign` and push it yourself. Never push to or merge into `main`.
- **How David checks the site.** Every push to `redesign` gets a Cloudflare preview link. After each push, give him the link and say exactly what to look at, on desktop and on his phone. If a preview link isn't available, say so.
- **How you check the site.** Run `npm run build && npm run preview` and look at it with a headless browser (Playwright and Chromium) at 1440 × 900 and 390 × 844, in both themes. Do the same with `design/mockup-v5.html` (serve the repo root with a small static server so its `../assets/` paths work) and compare. If a headless browser can't be installed here, say so and rely on David's preview links.
- **Lighthouse** uses the same headless Chromium.
- There's no Finder, Browser pane, Arc, or GitHub Desktop in the cloud. Remove those mentions.

### Facts that changed since the brief was written

- **NW Copywriter Lab** was redesigned. It now turns a part number into an eBay title that doubles as a quote line, a product description, and weight and dimensions, and it saves the spec data for store filters. Confirm this exact wording with David before using it, then use it in the brief, the work index, and the project page.
- New `assets/work/copywriter-lab.mp4` (34 seconds, no audio, loops from the empty screen back to it) and `assets/work/copywriter-lab-poster.jpg` (the finished listing). The poster is also the work index preview.
- New `assets/work/serial-lookup.png` is the back-office image: a serial record with its test print. The coworker's name and the costs are already blurred. Use it in place of the P&L placeholder.
- The Alfred screenshot, and an optional short Alfred clip, are still to come.

---

## Changes to docs/PLAN.md

### Add a new phase between Phase 3 and Phase 4

## Phase 3b: The v5 direction

- [ ] Commit `design/mockup-v5.html` and `docs/v5-handoff.md`, and point the brief at the mockup.
- [ ] Theme tokens and dark mode: every colour as a token, the no-flash head script, system-following by default, and the toggle in the control bar.
- [ ] Ground and materials: paper everywhere, one fixed grain layer, and the single glass control bar with the current section shown. Remove the per-section grain, the photo overlays, the glass project card, and the glass band card.
- [ ] Hero: the pinned full-bleed-to-print shrink, with the two-copy headline.
- [ ] Work: the ink index, the cursor preview, keyboard focus, and the touch fallback.
- [ ] Off the clock: the pinned sideways strip, plus its reduced-motion fallback.
- [ ] Say hi: the pinned print-to-full-bleed grow, with the contact text on the photo.
- [ ] Remove the v3 motion this replaces: the hero settle on load, the pinned work list with its cross-fading card, and the photo parallax.

**Done test:** A Chrome Performance recording while scrolling the whole page shows no long frames or layout shifts. Nothing runs on a timer except the load fade, hovers, and page changes. With reduced motion on, nothing moves and every photo is reachable. Both themes pass contrast checks, and reloading in either theme shows no flash of the other. At 390px there is no sideways scrolling outside the Off the clock strip. Lighthouse on mobile stays at 95 or higher. Show David a screen recording at 1440px and on his phone.

### Phase 4: add these two boxes

- [ ] Project pages use the paper ground: a back button, the title, a short lede, the main image, a row of facts, one paragraph, links, and a large "Next project" row at the bottom.
- [ ] Opening a page from the index morphs the cursor preview into the main image in about 300ms. Going back returns to the work index.

### "Waiting on David": update the captions line

- Photo captions: v5 shows none. Add them back only if David supplies a place and year for each photo.
- Replace "the first live P&L" with "done: serial lookup (`assets/work/serial-lookup.png`)".
- Alfred: a full-screen chat screenshot with clean formatting, plus an optional clip that David records and Claude in chat trims.
- Worker Previews: still needed, and now essential, because the preview link is the only way David sees the site.
