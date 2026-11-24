# David Wurgler: brand kit

The files for the "one sentence" direction. This replaces the paper, grain, Archivo, and WURGLER wordmark of the previous system.

## The idea

One sentence on an empty page: **I make pretty things.** Each word is a door, and the full stop is how you say hi. The brand is what's left out.

## Four pieces, one job each

| Piece | Job |
|---|---|
| "I make pretty things." | The site. |
| "David Wurgler." | The wordmark. Anywhere the name needs reading. |
| "DW." | The short form. Profile pictures and small squares only. |
| The mark | The maker's stamp. Signs off made things, small, at the end. |

- One dot per surface. The sentence and the wordmark never share one.
- The dot never appears by itself. It is always a full stop after letters.
- The mark is never a profile picture, never a favicon, and never sits beside the name.

## The five rules

1. One typeface, one size, one weight.
2. Two tones and one dot.
3. Emptiness is the material.
4. Words before pictures.
5. The mark signs off.

## Type

Averia Serif Libre Light (300), 21px on screens 820px and wider, 19px on phones, line height 1.5. No bold, no italic, no capitals for emphasis, no second typeface.

One exception: the favicon uses Regular (400), because Light goes grey at 32px and below. Nothing else uses Regular.

## Colour

| Name | Light | Dark | Use |
|---|---|---|---|
| Snow / Night | `#eff0ee` | `#0e0f10` | The ground. Always flat. |
| Ink | `#0e0f10` | `#e9eae7` | Text, and whatever is chosen. |
| Stone | `#696b6a` | `#8e908e` | Secondary text, and whatever isn't chosen. |
| Ember | `#e5482d` | `#f0573b` | The dot. Nothing else, ever. |

Contrast on the ground:

| Pairing | Light | Dark |
|---|---|---|
| Ink | 16.78:1 | 15.89:1 |
| Stone | 4.70:1 | 5.97:1 |
| Ember (graphic only) | 3.47:1 | 5.60:1 |

Ink and stone pass for text in both themes. Never set text in ember.

## The dot

- 0.25em across, on the baseline, 0.1em after the last letter.
- On screen it wobbles slowly and turns (5.2s wobble, 19s turn).
- In stills it is one fixed, slightly uneven shape: a single frozen frame of the wobble. It is the same shape every time. Never redraw it.
- Below about 64px the unevenness can't survive, so the favicon uses a plain circle, slightly larger (0.32em).

The still shape, in CSS: `border-radius: 56% 44% 53% 47% / 47% 54% 46% 53%; transform: rotate(-12deg) scale(1.06, 0.95);`

## Files

### `wordmark/`

| File | For |
|---|---|
| `wurgler-wordmark-on-snow.svg`, `.png` | "David Wurgler." in ink, for light grounds. |
| `wurgler-wordmark-on-night.svg`, `.png` | The same in light ink, for dark grounds. |
| `wurgler-dw-on-snow.svg`, `.png` | "DW." without a tile, for light grounds. |
| `wurgler-dw-on-night.svg`, `.png` | The same, for dark grounds. |

The letters are outlines, so no font is needed. PNGs are transparent.

### `profile/`

| File | For |
|---|---|
| `profile-snow.svg`, `profile-snow-1024.png` | Profile picture, light. Safe inside a circle crop. |
| `profile-night.svg`, `profile-night-1024.png` | Profile picture, dark. |

### `icons/`

| File | For |
|---|---|
| `favicon.svg` | Browser tab. Follows the system's light or dark setting. |
| `favicon.ico` | Fallback, 32px and 16px. |
| `apple-touch-icon.png` | iOS home screen, 180px. |
| `icon-192.png`, `icon-512.png` | Android and install prompts. |
| `icon-maskable-512.png` | Android adaptive icon. The letters sit inside the safe zone. |
| `site.webmanifest` | Points at the three icons above. |

### `mark/`

| File | For |
|---|---|
| `wurgler-mark-themeable.svg` | The site sign-off. Ridge in stone, W in ink, follows the system setting. Classes `mark-ridge` and `mark-w` are kept. |
| `wurgler-mark-ink.svg`, `.png` | One colour, `#0e0f10`. The stamp on light things. |
| `wurgler-mark-light.svg`, `.png` | One colour, `#e9eae7`. The stamp on dark things. Replaces the old "bone" file. |
| `wurgler-mark-two-tone-on-snow.svg`, `.png` | Fixed two-tone for light grounds, where a file can't follow the theme. |
| `wurgler-mark-two-tone-on-night.svg`, `.png` | Fixed two-tone for dark grounds. |

The shape is unchanged. Only the colours are new.

### `share/`

| File | For |
|---|---|
| `share-1200x630.png` | The share image. The sentence at 32px, so it survives a small preview. |
| `share-1200x630-true-scale.png` | The alternative: the sentence at the site's exact scale. Truer, but very small in a link preview. |

### `email/`

| File | For |
|---|---|
| `email-signature.html` | The signature. Text first, with the mark small at the end. |
| `email-signature.txt` | Plain-text version. |
| `email-monogram-80.png` | The mark, 80px wide, in stone so it reads in light and dark mail. Same file name as before. |

The signature is the name and the link, with no tagline. The name has no dot there: the dot is a drawn shape, and text is never set in ember. In the HTML file, point the image at wherever `email-monogram-80.png` is hosted.

### `sheet/`

| File | For |
|---|---|
| `brand-sheet.pdf` | One page, US Letter, landscape. |
| `brand-sheet.png` | The same page as an image. |

### `code/`

| File | For |
|---|---|
| `tokens.json`, `tokens.css` | Colours, type, layout, and motion values. |
| `dot.css` | The moving dot, plus the still shape for reduced motion and print. |
| `dot-still.svg` | The still shape by itself, for building other files. Not for use alone. |

### `style-guide.txt`

The whole system as plain text, to paste anywhere.

### `fonts/`

Averia Serif Libre Light and Regular for the web, and the licence (SIL Open Font License).

## Rules

- Never add a second typeface, a second accent colour, a gradient, a texture, an icon set, or a decorative shape.
- Don't sharpen, outline, or clean up the letters. The soft edges are on purpose.
- Pictures have 3px corners and nothing else.
- Controls are plain words in stone that turn ink under the hand.
- Write plainly, with short sentences and the serial comma.
