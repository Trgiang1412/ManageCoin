/**
 * Script để tạo các file icon PNG từ SVG cho PWA
 * Chạy: node scripts/generate-icons.js
 */
import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
const svgPath = resolve(publicDir, 'logo.svg');

const icons = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-maskable-192x192.png', size: 192, padding: true },
  { name: 'icon-maskable-512x512.png', size: 512, padding: true },
];

const svgContent = readFileSync(svgPath);

for (const icon of icons) {
  const paddingPercent = icon.padding ? 0.1 : 0;
  const innerSize = Math.round(icon.size * (1 - paddingPercent * 2));
  const pad = Math.round(icon.size * paddingPercent);

  await sharp(svgContent)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(resolve(publicDir, icon.name));

  console.log(`✅ Tạo ${icon.name} (${icon.size}x${icon.size})`);
}

console.log('\n🎉 Đã tạo xong tất cả icon!');
