// Makes public/apple-touch-icon.png (180 × 180) from public/favicon.svg.
// The phone rounds the corners itself, so the tile is drawn square here.
// Uses sharp, which Astro already installs for its image pipeline.
// Run with `node scripts/icons.mjs`, then commit the image.
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = (await readFile('public/favicon.svg', 'utf8')).replace('rx="220"', 'rx="0"');
await sharp(Buffer.from(svg), { density: 300 })
  .resize(180, 180)
  .png({ compressionLevel: 9, palette: true })
  .toFile('public/apple-touch-icon.png');
