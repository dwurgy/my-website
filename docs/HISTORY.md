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
