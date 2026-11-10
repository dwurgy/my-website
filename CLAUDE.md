# davidwurgler.com

The personal site of David Wurgler: a designer who builds software with AI. His apps lead, tools he built for his team back them up, and his photographs and music show his taste. This file is the brief. Read it fully before every phase, then work through `docs/PLAN.md` in order.

## What the site is for

One job: someone landing here should understand in about 30 seconds that David designs and builds software with AI, that it's well made and people actually use it, and that he has taste. Then they should be able to see the work and get in touch. The hope is that the work leads to paid work (Firn alone has already led to a job offer).

### Direction (David, 2026-11-10)

- **Position:** a designer and builder of software, with AI as the method. Design and UI/UX are the strength; Claude Code is how one person ships at that level. Never call it "vibe coding" on the site.
- **Hero line:** "I make pretty things." with "pretty" as the italic word, matching David's GitHub and Threads bio (2026-11-10). The label under it reads "Designer who builds software."
- **Work:** the apps lead, Firn first. Copywriter Lab and Alfred stay as proof that his tools get daily use by a real team. The back-office (ERP) rebuild shrinks to a line or goes; ask David.
- **How I build:** becomes the centrepiece. The stats row (3 days → 1 report, 10 weeks, 500+) is cut.
- **Off the clock and music:** unchanged.
- **Footer:** "Built with Claude Code" should link to this repo's source, not just sit there as a label.
- Do not mention the job offer, or who made it, on the site unless David says so.

The site itself is part of the proof. It should feel crafted, calm, and quick, and it should be obvious it was made with care. The footer says it was built with Claude Code, so the code has to hold up if someone opens the repo.

## Principles

1. **Real over decorative.** Texture and mood come from David's own photographs and real screenshots of real work, never from effects that imitate film.
2. **Calm.** Lots of space, few elements on screen at once, slow and smooth motion. Nothing bounces, flashes, or competes.
3. **Tactile.** Grain, glass, paper. It should feel like a physical object, not a template.
4. **Quick.** A fast, light, static site. No cookies and no third-party requests, with one exception: Cloudflare Web Analytics.

## The design

`design/mockup-v5.html` is the approved homepage. Look at it in a browser before building. `design/mockup-v3.html` stays for history only. Match v5: section order, type sizes, spacing, colours, and motion. It's laid out for a 1440px desktop and works down to 390px. It is one self-contained file that loads the real photos from `assets/`, so serve the repo root to view it. Use it for layout, sizes, colours, copy, and the motion math in its `tick()` function. Rebuild it properly in Astro; don't copy its markup. Its project page is a stand-in for real `/work/<slug>` routes. The full reasoning behind v5 is in `docs/v5-handoff.md`.

What makes v5 work:

- **Paper is the home.** The page is warm paper from top to bottom, with ink type. It never switches to a dark ground between sections.
- **Photos are windows.** David's photos appear as prints on the paper. They go full-bleed only at the start and the end of the page.
- **Big, confident type.** One grotesque does almost everything, set large and tight. There is at most one italic serif word per screen.
- **Motion follows your hand.** Scroll and the cursor drive almost every movement. Nothing makes you wait.

### Type

- **Archivo** (variable, with width and weight axes): everything. Headlines are weight about 640 with tracking around -0.035em and line-height about 0.92. The wordmark "WURGLER" is set at full width (125%), weight 800, with wide letter-spacing.
- **Cormorant Garamond Italic:** the single emphasised word ("actually", "brief.", "hi."), set about 1.12 times the size of the surrounding text. Never more than one per screen, and never for whole lines.
- **JetBrains Mono:** small uppercase labels at 11px with 0.14em letter-spacing. Use it for metadata and edge labels only.
- Self-host all fonts (for example with Fontsource) and subset them. Do not load anything from Google Fonts in production.

### Colour

Colour comes mostly from the photos. The page's own colours are:

| Token | Value | Use |
|---|---|---|
| `paper` | `#ece6dc` | The ground for the whole page and the project pages |
| `ink` | `#1b1815` | Text, rules, and outline buttons on paper |
| `ink-muted` | `#5b534a` | Labels and secondary text |
| `night` | `#151311` | Only behind screenshots and placeholders. No longer a section background |
| `bone` | `#f3eee7` | Only for text that sits on a photo |
| `bone-bright` | `#fbf7f1` | Only for headlines that sit on a photo |

There is no accent colour. Text over photos still needs 4.5:1, using a scrim inside the photo.

### Dark mode

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

### Materials

- **Grain:** one fixed, tiled noise layer behind the content, blended with multiply at about 0.32, so it shows only on paper (screen at about 0.07 in dark mode). There is no grain overlay on photos. Their grain comes from the scans. Use the one small tiled noise image (`public/grain.png`), not an SVG filter, which is slow.
- **Glass:** only on the control bar, and on buttons that sit on top of a photo (the contact links). There are no glass cards. Never put `backdrop-filter` on a full-width or full-height element.
- **Control bar:** one glass bar, fixed and centred at the top. It holds the WURGLER wordmark, Work, How I build, Off the clock, the theme button, and an ink "Say hi" pill. The current section's link is at full opacity and the others are at 0.68 (0.6 was just under 4.5:1). On phones the middle two links hide.
- **Corners:** pills are fully round. Prints, screenshots, and the cursor preview are about 6px.
- **Buttons on paper:** a 1px ink outline that fills with ink on hover.

### Motion

The rule: **motion follows your hand.** Anything that scroll or the cursor can drive, they drive. The only timed motion is:

- the headline fading up once on load (about 700ms),
- hovers (about 200ms),
- page changes (about 300ms, using the View Transitions API),
- the theme switch (about 240ms, see Dark mode).

Nothing else runs on a timer.

- **Hero (pinned, about 230vh):** the coast photo starts full-bleed and shrinks, matched to scroll, into a print on the right half of the paper: inset 20% top and bottom, 50% left, 40px right, with corners going from 0 to 6px. On phones it ends as a print across the top. The headline exists twice: an ink copy on the paper and a bone copy clipped to the photo's exact shape, so its colour changes right at the photo's edge. The photo also scales from 1.12 to 1.
- **Work:** a large ink index with no background photo. Hovering a row fades the other rows to about 0.32 opacity, nudges the name 12px right, and shows a 360 × 236 preview of the project that follows the cursor with a slight lag. Keyboard focus shows the same preview beside the row. On touch screens there's no preview; each project's image shows under its name instead. Clicking a row opens its project page, and the preview morphs into the page's main image in about 300ms.
- **How I build:** still, on paper.
- **Off the clock (pinned, about 340vh):** the music text, then the lodge, pavilion, firs, and moon photos at mixed heights and offsets, drifting sideways exactly as fast as you scroll down.
- **Say hi (pinned, about 210vh):** the lake starts as a centred print and grows to full-bleed by the bottom of the page. The contact text appears on the photo, using the same two-copy clip as the hero. Only the copy on the photo is interactive.
- **Pinned lengths** are starting points. If a pinned section starts to feel like a chore, shorten it.
- **Reduced motion:** the hero shows as a finished print and the lake as full-bleed. The Off the clock photos become a normal row the reader can scroll sideways, because a still track would hide them. Nothing is hidden.
- **Smoothness:** animate only transform, opacity, and clip-path. Read scroll position in one `requestAnimationFrame` loop. Keep 60fps on an ordinary laptop. Ask before adding a smooth-scroll library.

### Never

These were tried and rejected:

- Fake film effects: frame numbers, sprocket holes, polaroid borders, light leaks, date stamps, colour filters, and handwritten notes.
- Emoji, decorative gradients, neon, and drop-shadowed "cards everywhere."
- Copying Firn's design system. Firn is one project on this site, not its look.
- More than one italic serif word on a screen.
- Timed animations that make the reader wait (long crossfades, slow reveals).
- Switching the background between dark photo, blur, and paper from section to section.
- Glass cards or panels. Glass is only for controls.
- A full-page fixed photo layer behind the content.

## Content

### Facts you may use

These are the only claims and numbers allowed. Never invent or round up a number. If something isn't here, ask.

- **Firn:** a calm browser with vertical tabs, spaces, and split view. It is a native Mac app built in Swift on WebKit, Safari's engine. It no longer runs on Windows or Linux. An iPhone version, with syncing between iPhone and Mac, is coming soon. (Updated by David on 2026-11-10.) It is open source (github.com/dwurgy/firn), and its site is firnbrowser.com. David wrote the brief (its CLAUDE.md) and directed Claude Code through every phase. Released October 2026 and notarized by Apple.
- **Alfred and the SOP Assistant:** two AI assistants inside the company's Odoo 19 ERP, both built on the Gemini API. Alfred answers questions from live data, such as which in-stock units meet a customer's license requirement. The SOP Assistant answers how-to questions from the company's own process docs. Both are in ongoing use across the team. A question that used to mean a walk to the warehouse is now one question.
- **NW Copywriter Lab:** an internal tool that turns a part number into an eBay title that doubles as a quote line, a product description, and weight and dimensions, and it saves the spec data for store filters. It was prototyped in Google AI Studio, rebuilt with Claude, and deployed on Cloudflare, three days from idea to production. A demo video is in `assets/work/`. (Confirmed by David on 2026-11-09. Use this wording in the work index and the project page.)
- **The back-office rebuild:** a move off QuickBooks Desktop and an unsupported in-house database onto Odoo 19, with David as sole internal owner. It took ten weeks from kickoff to go-live, with zero downtime and every order shipped on launch day. It produced the company's first live P&L. Sales tax is automated across nine states, and month-end compliance went from three days to one report. Serial tracking with searchable test prints removed 500+ warehouse trips a year.
- **How I build:** every project starts with a brief that says who it's for, the rules the agent can't break, and a done test for each step. The Firn rules quoted in the mockup are real.
- **Music:** David sings, writes, and produces in My Brothers And I. The band has placements on Virgin River, Pretty Little Liars, Queen Sugar, and others through Secret Road.
- **Background:** David started in shipping in 2019 and is based in Salem, Oregon.
- **Utu Weather:** David's next app. Not built yet. Its site, utuweather.com, is live to tease the release. (David, 2026-11-10.) Ask David what it is before describing it.
- **The apps together:** Firn, Utu, and Nynna are "the David Wurgler apps." Ask David for Nynna's facts before showing it.
- **"Who's making it" (from David's app sites, 2026-11-10, approved wording):** "I'm David. I design and build software, and I live in Salem, Oregon, with my wife and our two boys. I'm also a songwriter: a few of my songs have ended up on network TV, and I play in a band called My Brothers And I." / "I make these apps with Claude, an AI from Anthropic, as my coding partner. I decide what each app is and how it should feel: the design, the details, the way it behaves. Claude and I write the code together and catch each other's mistakes." / "I build the things I wish already existed: quiet, well-made tools that respect your time and your privacy. If one of them makes your day a little calmer, that's the whole point." Reuse its facts and voice here; adapt it, don't paste it whole.

### Links

- Email: hello@davidwurgler.com (forwards to David), shown as selectable text with a copy button.
- LinkedIn: https://www.linkedin.com/in/david-joel-wurgler
- GitHub: https://github.com/dwurgy
- Spotify: https://open.spotify.com/artist/01pbsrLZgBLuMIoU10Ypyb
- Apple Music: https://music.apple.com/us/artist/my-brothers-and-i/892386824
- Band site: https://www.mybrothersandiband.com/
- Instagram: https://www.instagram.com/dwurgy/ (personal) and https://www.instagram.com/mybrothersandi/ (band)

### Voice

Write plainly and directly, like a person talking. Use short sentences, no hype, and no buzzwords. Always use the serial comma. The copy in the mockup is the approved draft; keep it unless David changes it. David has changed the hero headline to "I make pretty things." (2026-11-10).

### Assets

- `assets/photos/`: David's photographs, with all metadata already stripped. Use these through Astro's image pipeline (AVIF or WebP, responsive sizes) and never serve the originals directly.
  - `coast-dusk.jpg`: the hero.
  - `lodge-dusk.jpg`, `pavilion-peak.jpg`, `firs-house.jpg`, and `lake-dusk-moon.jpg`: the Off the clock strip, in that order.
  - `lake-dusk-reeds.jpg`: the Say hi photo, sharp. It's no longer used blurred.
- `assets/work/`
  - `copywriter-lab.mp4`: the real demo, 34 seconds, no audio. It loops from the empty screen back to it.
  - `copywriter-lab-poster.jpg`: the finished listing. It is the video's poster and also the work index preview.
  - `serial-lookup.png`: the back-office image, a serial record with its test print. The coworker's name and the costs are already blurred.
  - `firn.jpg`: David's real Firn screenshot (sidebar, tab group, and spaces beside a website), added 2026-11-10.
  - The Alfred screenshot, and an optional short Alfred clip, are still to come.

Any new photo must have its metadata (including GPS) stripped before it is committed. This repo is public.

## Rules for working in this repo

- Work only on the `redesign` branch. Never push to or merge into `main` unless David says to in so many words.
- Follow `docs/PLAN.md` one phase at a time, and one checkbox at a time inside a phase. After each step, tell David what to look at and wait for his OK. At the end of each phase, show David screenshots at 1440px and 390px wide, state the done test result honestly, and wait for his go-ahead.
- Make small commits with plain messages.
- Ask before adding any dependency beyond Astro, its official integrations, and Fontsource.
- Keep the repo public-safe. No customer names, prices, emails, order data, home addresses, or photo metadata, in code or in screenshots. Blur sensitive parts of any screenshot of company software before adding it.
- No trackers, cookies, embeds, or third-party scripts. The one exception is Cloudflare Web Analytics, which is cookieless and already enabled for the domain in Cloudflare. Keep it working, and add nothing else.
- Accessibility is part of done: real links and buttons, a visible focus state, alt text on every meaningful image, readable contrast over photos, and a full keyboard path.
- If something in this brief conflicts with what David asks in the moment, do what David asks and update this file.

## Where we are

- **Phase 1: done** (2026-10-20). Astro, self-hosted fonts, tokens, grain, and Cloudflare pointed at `dist`. David set the Cloudflare build command to `npm run build`.
- **Phase 2: done** (2026-10-20). The homepage, still, matching the mockup. Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices.
- **Phase 3: done** (2026-10-20). Motion: hero settle, pinned work list, photo parallax, and reduced motion. Done test passed at 60fps with no layout shifts.
- **2026-11-04:** David approved the v5 direction ("paper with windows"). The homepage built in Phases 2 and 3 matches v3 and needs rework. See Phase 3b in `docs/PLAN.md`.
- **Phase 3b: done** (2026-11-09). The v5 direction. Done test passed except a few slow desktop frames in Say hi (see HISTORY); David gave the go-ahead.
- **Phase 4: done** (2026-11-10). Box 1 done 2026-11-09: a Markdown page per project in `src/content/work/`, served at `/work/<slug>`, with a plain first-pass layout. The build fails if a page and `src/data/projects.ts` disagree. Box 2 done 2026-11-10: each page has its lede, facts, one paragraph, links, and marked placeholders, all from the approved mockup copy. Box 3 done 2026-11-10: the Copywriter Lab demo video is its main image, muted, with controls, loading only when played. Box 4 done 2026-11-10: the full v5 project layout, with the control bar, "01 of 04", a "Next project" row, and screenshots shown uncropped at their own shape. Box 5 done 2026-11-10: opening a project from the index grows its preview into the page's main image (300ms); back returns to the index. Done test passed: every homepage link reaches a real page, all four pages read well at 390px in both themes, and every claim is from CLAUDE.md or the approved mockup. Next: Phase 5.
- **Phase 5, box 1 done** (2026-11-10): `public/share.jpg`, the hero's opening frame at 1200 × 630, made by `scripts/share-image.mjs`; share tags on every page. Box 2 done 2026-11-10: a "W" favicon (from Archivo, made into the phone icon by `scripts/icons.mjs`), a sitemap and robots.txt, and a 404 page that Cloudflare serves for unknown addresses. Box 3 done 2026-11-10: accessibility pass; one fix (keyboard focus in the Off the clock strip). Done test 2026-11-10: Lighthouse 95+ on every page, mobile and desktop, after one fix (dimmed control-bar links 0.6 → 0.68 for contrast). Share card tags and image check out; the real paste test waits for launch, since the card's image lives at davidwurgler.com. David approved Phase 5 on 2026-11-10. Next: Phase 6 (launch), only when David says so.
- **Phase 6, box 1 done** (2026-11-10): David said to merge; `redesign` fast-forwarded into `main` and pushed. Next: confirm the live site and the share card.
- **2026-11-10, phone jitter fix: done.** The browser runs the pinned motion itself with CSS scroll-driven animations (see HISTORY). Merged to `main`; David confirmed it is smooth on his phone. Next: Phase 6 box 2 (confirm the live site on phone and laptop, and the share card paste test).
- **Preview links:** not confirmed yet. David is checking Cloudflare for Worker Previews and will paste one link; derive later links from its pattern.
- **2026-11-10, Firn facts updated:** native Mac app (Swift, WebKit), iPhone coming soon; Windows and Linux dropped. Merged to `main` the same day.
- **2026-11-10, real Firn screenshot:** `assets/work/firn.jpg` replaces the placeholder (metadata stripped). Merged to `main` the same day.
- **2026-11-10, new direction:** designer who builds software with AI; apps lead. See "Direction" at the top and Phase 7 in `docs/PLAN.md`. Done so far: brief, hero line and label, stats row cut, tab titles ("Page · David Wurgler"), footer credit linking to the source. Next: intro and How I build copy.
- **Waiting on David:** see the end of `docs/PLAN.md`. Worker Previews are not turned on yet.

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
- **Pushing.** Commit each finished step to `redesign` and push it yourself. Never push to or merge into `main`.
- **How David checks the site.** Every push to `redesign` gets a Cloudflare preview link. After each push, give him the link and say exactly what to look at, on desktop and on his phone. If a preview link isn't available, say so.
- **How you check the site.** Run `npm run build && npm run preview` and look at it with a headless browser (Playwright and Chromium) at 1440 × 900 and 390 × 844, in both themes. Do the same with `design/mockup-v5.html` (serve the repo root with a small static server so its `../assets/` paths work) and compare. If a headless browser can't be installed here, say so and rely on David's preview links.
- **Lighthouse** uses the same headless Chromium.
