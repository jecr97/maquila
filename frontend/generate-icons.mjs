/**
 * Script para generar los iconos PNG de la PWA.
 * Uso: node generate-icons.mjs
 * Requiere: sharp (npm install --save-dev sharp)
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outputDir = path.resolve('./public/icons');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG fuente — ícono con iniciales "MS" (Maquila Sistema)
const svgSource = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.12}" fill="#1976d2"/>
  <rect x="${size * 0.08}" y="${size * 0.08}" width="${size * 0.84}" height="${size * 0.84}" rx="${size * 0.08}" fill="#1565c0"/>
  <!-- Icono de tijera / costura simplificado -->
  <circle cx="${size * 0.35}" cy="${size * 0.38}" r="${size * 0.09}" fill="none" stroke="#ffffff" stroke-width="${size * 0.045}"/>
  <circle cx="${size * 0.65}" cy="${size * 0.38}" r="${size * 0.09}" fill="none" stroke="#ffffff" stroke-width="${size * 0.045}"/>
  <line x1="${size * 0.41}" y1="${size * 0.44}" x2="${size * 0.59}" y2="${size * 0.62}" stroke="#ffffff" stroke-width="${size * 0.045}" stroke-linecap="round"/>
  <line x1="${size * 0.59}" y1="${size * 0.44}" x2="${size * 0.41}" y2="${size * 0.62}" stroke="#ffffff" stroke-width="${size * 0.045}" stroke-linecap="round"/>
  <!-- Texto MS -->
  <text x="${size * 0.5}" y="${size * 0.85}" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-weight="bold" font-size="${size * 0.18}">MAQUILA</text>
</svg>
`;

async function generateIcons() {
  console.log(`Generando iconos en: ${outputDir}`);
  for (const size of sizes) {
    const svgBuffer = Buffer.from(svgSource(size));
    const outPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer).png().toFile(outPath);
    console.log(`  ✓ icon-${size}x${size}.png`);
  }
  console.log('\n✅ Iconos generados correctamente.');
}

generateIcons().catch((err) => {
  console.error('Error generando iconos:', err);
  process.exit(1);
});
