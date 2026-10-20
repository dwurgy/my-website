// Writes public/grain.png: one small, tileable, greyscale noise tile.
// Run once with `node scripts/make-grain.mjs`. The output is committed.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const SIZE = 192;

// Seeded so the tile is the same every time it is regenerated.
let seed = 20261020;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32;
}

// Fine, slightly soft grain: white noise averaged with its wrapped neighbours,
// so the tile repeats without a seam.
const white = Float32Array.from({ length: SIZE * SIZE }, random);
const at = (x, y) => white[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)];

const rows = [];
for (let y = 0; y < SIZE; y++) {
  const row = Buffer.alloc(1 + SIZE);
  for (let x = 0; x < SIZE; x++) {
    const v = at(x, y) * 0.6 + (at(x + 1, y) + at(x, y + 1) + at(x - 1, y) + at(x, y - 1)) * 0.1;
    // Stretch the contrast around mid-grey; overlay and multiply blending
    // then darken and lighten the photo underneath evenly.
    const value = Math.min(255, Math.max(0, Math.round(128 + (v - 0.5) * 0.5 * 255)));
    row[1 + x] = value;
  }
  rows.push(row);
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function crc32(buffer) {
  let c = ~0;
  for (const byte of buffer) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

const header = Buffer.alloc(13);
header.writeUInt32BE(SIZE, 0);
header.writeUInt32BE(SIZE, 4);
header[8] = 8; // bit depth
header[9] = 0; // greyscale

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', header),
  chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

writeFileSync(new URL('../public/grain.png', import.meta.url), png);
console.log(`public/grain.png: ${SIZE}×${SIZE}, ${png.length} bytes`);
