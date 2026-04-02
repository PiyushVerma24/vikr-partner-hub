/**
 * Generates PWA icons from the VIKR logo SVG.
 * Run once: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const logoSvg = readFileSync(path.join(root, 'public/vikr-logo-new.svg'))

// Pad the logo into a square with brand background
async function makeIcon(size, outputPath) {
  // The logo is wide (510x170) — pad it into a square with brand green background
  const padding = Math.round(size * 0.15)
  const innerSize = size - padding * 2

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 10, g: 32, b: 4, alpha: 1 }, // #0a2004 brand dark
    }
  })
    .composite([
      {
        input: await sharp(logoSvg)
          .resize(innerSize, Math.round(innerSize * 0.33), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer(),
        gravity: 'centre',
      }
    ])
    .png()
    .toFile(outputPath)

  console.log(`✓ ${outputPath}`)
}

await makeIcon(192, path.join(root, 'public/icon-192.png'))
await makeIcon(512, path.join(root, 'public/icon-512.png'))
await makeIcon(180, path.join(root, 'public/apple-touch-icon.png'))
await makeIcon(32,  path.join(root, 'public/favicon-32.png'))

console.log('All icons generated.')
