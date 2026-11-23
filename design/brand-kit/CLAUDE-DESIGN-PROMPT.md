# Prompt for Claude Design

Paste everything below the line into Claude Design, and attach this whole folder.

---

Update the David Wurgler design system (my personal brand) to a new direction. The attached folder is the source of truth: read `README.md` first, then look at every image in `reference/`, then `code/tokens.json`, `code/tokens.css`, and `code/dot.css`.

## What changed

My site was redesigned around one idea: an empty page with one sentence, "I make pretty things.", where each word opens a part of the site and the full stop is how you contact me. The old system (warm paper, grain, Archivo, the wide WURGLER wordmark, glass control bar, italic serif accent word) is retired. Don't carry any of it forward.

## What stays

Only the mark: the ridge-and-reflection W in `mark/`. Do not redraw, reshape, or restyle it. Recolour only, using the new palette.

## The new system, in short

- One typeface: Averia Serif Libre Light (300), at one size, for everything. No bold, no italic, no display sizes, no all-caps labels, no second typeface. Hierarchy comes from black against grey, and from space.
- Four colours, each with a light and dark value: snow/night ground, ink, stone, and ember. Ember is used for exactly one thing, the dot. Values are in `code/tokens.json`.
- The dot: a small drawn circle that stands in for the full stop. It wobbles slowly on screen and is a plain circle in stills. One per surface.
- A great deal of empty space. More than feels correct.
- Pictures have 3px corners and nothing else: no shadows, borders, frames, or cards.
- Controls are plain words in stone that turn ink under the hand.

## First, the wordmark: work this out with me

I don't have a wordmark any more, and I'm not sure I need one. The old one was WURGLER in wide capitals, and it's gone. Before making anything else, show me three or four directions, side by side, on both snow and night grounds, each with a line on why:

- "David Wurgler" set plainly in Averia Serif Libre Light, exactly like the rest of the site.
- The same beside the small mark.
- The sentence "I make pretty things" with the ember dot, acting as the wordmark.
- No wordmark at all: the mark alone, or the dot alone.
- One idea of your own, if you have a better one that keeps to the rules.

Tell me which you'd pick. Then wait for my answer before going on.

## Then, once the wordmark is settled

1. **Update the design system itself**: colours, type, spacing, the dot, the mark's usage, the wordmark, motion, and voice, replacing the old pages. Keep it as short as the brand is.
2. **The mark, re-exported** in the new colours: themeable (ridge in stone, W in ink), solid ink `#0e0f10`, and solid light `#e9eae7`. SVG and PNG.
3. **The wordmark we chose**, as SVG and PNG, for light and dark grounds. If it uses the dot, match the spacing in `reference/dot-closeups.png`.
4. **Favicon and app icons** in the new palette: favicon.svg, favicon.ico (32px), apple-touch-icon (180px), icon-192, icon-512, and a maskable 512. Show me two options first: the mark on snow, and the ember dot alone on snow.
5. **A share image**, 1200 × 630: the snow ground, the sentence small and left of centre where it sits on the site, the dot, and nothing else.
6. **An email signature**: text first, in the system's voice, with the mark small. Keep the file name `email-monogram-80.png` for the mark image, because my current signature points at it.
7. **A one-page brand sheet** (PDF and PNG) that follows its own rules: mostly empty.
8. **A zip** of everything, with a short README listing each file and what it's for.

## Rules

- Never add a second typeface, a second accent colour, a gradient, a texture, an icon set, or a decorative shape.
- Never set text in ember. It fails contrast for text on the light ground, and it's reserved for the dot.
- Averia Serif Libre's edges are soft on purpose. Don't sharpen, outline, or "clean up" the letters.
- Don't invent facts, taglines, or claims about me or my work. Use only the wording in `README.md`. If you need a line that isn't there, ask me.
- Write plainly, with short sentences and the serial comma. No hype.
- No third-party logos anywhere.
- Check contrast for every text and ground pairing in both themes, and tell me the numbers.
- Where something is a matter of taste, show me two options and say which you'd pick and why.

Start by telling me, in a few plain sentences, what you understand the brand to be. Then show me the wordmark directions.
