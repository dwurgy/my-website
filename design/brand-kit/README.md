# David Wurgler: brand kit

From the "one sentence" redesign of davidwurgler.com (test page, 2026-11-23). This is a new direction. It replaces the paper, grain, Archivo, and WURGLER wordmark of the previous system. Only the mark carries over.

There is no wordmark in this kit. That's still to be worked out.

## The idea

One sentence on an empty page: **I make pretty things.** Each word is a door, and the full stop is how you say hi. The brand is what's left out. Quiet confidence, not volume.

## The five rules

1. **One typeface, one size, one weight.** Everything is Averia Serif Libre Light at reading size. No headlines, no bold, no italics, no capitals for emphasis. What matters is black; what doesn't is grey.
2. **Two tones and one dot.** Snow and ink, with stone for anything secondary. The only colour is the ember dot.
3. **Emptiness is the material.** More empty space than feels correct. Never fill a gap because it's there.
4. **Words before pictures.** Pictures appear only after someone asks to see a thing, and then they're big.
5. **The mark signs off.** It appears once, small, at the end. It never leads.

## Type

- **Averia Serif Libre**, by Dan Sayers (SIL Open Font License; free for any use, including commercial). It is the average of hundreds of typefaces, so every edge is a little soft, like ink that has spread into paper.
- Weight: Light (300). Size 21px on screens 820px and wider, 19px on phones. Line height 1.5. No extra letter-spacing.
- Text column no wider than 27em.
- Curly quotes and the serial comma, always.
- `fonts/` holds the web files for Light (the one the brand uses) and Regular (for small print sizes, if Light gets too thin). For desktop apps (Figma, Keynote, Pages), install Averia Serif Libre from Google Fonts.

## Colour

| Name | Light | Dark | Use |
|---|---|---|---|
| Snow / Night (`bg`) | `#eff0ee` | `#0e0f10` | The ground. Always flat. |
| Ink (`ink`) | `#0e0f10` | `#e9eae7` | Text, and whatever is chosen |
| Stone (`dim`) | `#696b6a` | `#8e908e` | Secondary text, and whatever isn't chosen |
| Ember (`dot`) | `#e5482d` | `#f0573b` | The dot. Nothing else, ever. |

Contrast on the ground: ink 16.8:1 light and 15.9:1 dark; stone 4.7:1 light and 6.0:1 dark (passes for text); ember 3.5:1 light and 5.6:1 dark (passes for a graphic object; never set text in it).

The site follows the visitor's system setting. There is no theme button.

## The dot

- A drawn circle, 0.25em across, sitting on the baseline directly after the last letter, about 0.1em away.
- Its edge slowly wobbles and turns (5.2s wobble, 19s turn). It is the only thing that moves without being touched.
- Under the hand it swells to 1.9 times its size and the wobble roughly doubles in speed.
- In print or stills, it's a plain circle.
- One dot per surface. Never a row of dots, a bullet, or a pattern. Code is in `code/dot.css`; close-ups are in `reference/dot-closeups.png`.

## The mark

- The ridge-and-reflection W. Unchanged from the previous system: never redraw or reshape it.
- On the site: ridge in stone, W in ink (`mark/wurgler-mark-themeable.svg`), about 2.6em wide, once, under the contact links.
- `wurgler-mark-ink.svg` and `wurgler-mark-bone.svg` are single-colour versions in the previous palette. They need re-exporting in the new ink (`#0e0f10`) and the new light (`#e9eae7`).

## Layout

- The sentence sits at 9% from the left and 44% down, and never leaves the screen. On phones it waits 38% down, then rises to the top when a door opens.
- Content starts at the middle of the screen, on the sentence's own baseline.
- The list of things is five names and nothing else. Resting on a name shows one grey line about it underneath the list.
- Pictures are wider than the text: they reach back toward the sentence and stop short of it. Corners 3px. No shadows, borders, or cards.
- Controls are words ("Back", "Next", "Copy"), in stone, turning ink under the hand. They sit above a picture, so they hold still. No icons, no outlined buttons.
- Links in running text: a 1px underline in stone that turns ink under the hand.

## Motion

Smooth and short; nothing makes you wait. All values are in `code/tokens.json`.

- The sentence arrives once on load, word by word, through grey to black.
- The five names arrive the same way, one after another. Paragraphs never do.
- Opening a door: the old content fades where it stands, and the new content settles in from just below.
- A thing's name travels: from the list to its page's title, back again, and from "Next," up to the next title. One copy of the word makes the trip.
- Pictures slide sideways, like prints across a table, and the frame eases to each picture's shape.
- With reduced motion on, everything simply changes.

## Voice

Plain and direct, like a person talking. Short sentences. No hype, no buzzwords. Say what a thing is and stop.

- "I make pretty things."
- "I take pictures." / "I make music."
- "I don't write most of the code. I write the brief."
- "Good software should be pretty to look at and easy to use. Then it should get out of your way."

## What's in this folder

- `fonts/`: Averia Serif Libre Light and Regular for the web, and the licence.
- `mark/`: the mark, three versions.
- `code/`: `tokens.css`, `tokens.json`, `dot.css`, and `test-page.html` (the working test page; its pictures aren't included, so open it for the code, not the view).
- `reference/`: screenshots. `d-` is laptop light, `dk-` is laptop dark, `m-` is phone.
- `CLAUDE-DESIGN-PROMPT.md`: a prompt to paste into Claude Design.

## Still to make

A wordmark or name treatment, the mark in the new colours, a favicon and app icons, a share image, and an email signature. The prompt asks for these.
