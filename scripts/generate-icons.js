/**
 * PWA Icon Generator
 * 
 * Generates all required PWA icons from the source VIKR-LOGO.png:
 * - icon-512.png  (512x512, purpose: any)        — used by Android/Chrome as home screen icon
 * - icon-192.png  (192x192, purpose: any)        — baseline PWA icon
 * - icon-192-maskable.png (192x192, purpose: maskable) — with safe-zone padding for Android adaptive icons
 * - apple-touch-icon.png (180x180)               — iOS home screen
 * - favicon-32.png (32x32)                       — browser tab
 *
 * Maskable icons: logo must fit within the central 80% (the "safe zone").
 * Padding = 10% on each side = logo fills only 80% of total canvas.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = path.join(__dirname, '..', 'VIKR-LOGO.png');
const OUT = path.join(__dirname, '..', 'public');

async function makeIcon({ size, padding, outputFile, bg = { r: 255, g: 255, b: 255, alpha: 1 } }) {
  const paddedSize = Math.round(size * padding);
  const offset = Math.round((size - paddedSize) / 2);

  // Resize the logo to fit within the padded area, preserving aspect ratio
  const resizedLogo = await sharp(SRC)
    .resize(paddedSize, paddedSize, {
      fit: 'inside',
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  // Get actual dimensions after resize (logo is wider than tall)
  const meta = await sharp(resizedLogo).metadata();
  const logoW = meta.width;
  const logoH = meta.height;

  // Center the logo on the canvas
  const left = Math.round((size - logoW) / 2);
  const top = Math.round((size - logoH) / 2);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: resizedLogo, left, top }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(OUT, outputFile));

  console.log(`✓ ${outputFile} (${size}x${size}, logo area: ${logoW}x${logoH})`);
}

async function main() {
  console.log('Generating PWA icons from:', SRC);
  console.log('Output directory:', OUT);
  console.log('');

  // icon-512.png — "any" purpose, generous padding (logo takes ~75% of canvas)
  await makeIcon({
    size: 512,
    padding: 0.65,
    outputFile: 'icon-512.png',
  });

  // icon-192.png — "any" purpose, same proportions
  await makeIcon({
    size: 192,
    padding: 0.65,
    outputFile: 'icon-192.png',
  });

  // icon-192-maskable.png — "maskable" purpose, logo MUST fit inside 80% safe zone
  // We use 0.55 so the logo never touches the edge even after circular masking
  await makeIcon({
    size: 192,
    padding: 0.55,
    outputFile: 'icon-192-maskable.png',
  });

  // apple-touch-icon.png — iOS, 180x180, no rounding applied by us
  await makeIcon({
    size: 180,
    padding: 0.65,
    outputFile: 'apple-touch-icon.png',
  });

  // favicon-32.png — browser tab, tiny
  await makeIcon({
    size: 32,
    padding: 0.75,
    outputFile: 'favicon-32.png',
  });

  console.log('\nAll icons generated successfully!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
