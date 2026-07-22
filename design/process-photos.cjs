const path = require('path');
const sharp = require('sharp');

const inDir = path.resolve('D:/NEPTOR-WEB/incoming');
const out = path.resolve('D:/NEPTOR-WEB/public/assets/photos');
require('fs').mkdirSync(out, { recursive: true });

const jobs = [
  { src: path.join(inDir, 'image_1784642617620_g7mqlu.png'), name: 'hero' },   // piscina (4:3)
  { src: path.join(inDir, 'IMG20240619082242.jpg'), name: 'origin' },          // taller (ultra-wide → 4:3 center)
];
const widths = [640, 960, 1280, 1600];

(async () => {
  for (const { src, name } of jobs) {
    for (const w of widths) {
      const h = Math.round((w * 3) / 4); // 4:3
      const base = sharp(src).resize(w, h, { fit: 'cover', position: 'centre' });
      await base.clone().avif({ quality: 52 }).toFile(path.join(out, `${name}-${w}.avif`));
      await base.clone().webp({ quality: 72 }).toFile(path.join(out, `${name}-${w}.webp`));
      await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(out, `${name}-${w}.jpg`));
    }
    console.log(name, 'done:', widths.join('/'), 'in avif/webp/jpg');
  }
})().catch((e) => { console.error(e); process.exit(1); });
