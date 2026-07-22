const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inDir = path.resolve('D:/NEPTOR-WEB/incoming');
const assets = path.resolve('D:/NEPTOR-WEB/public/assets');
const horizontal = path.join(inDir, 'image_739443eb-21d0-4ceb-81e7-21adb05aac99.png'); // navy text, transparent
const master = path.join(inDir, 'image_7fee3aad-d2a7-460d-99d3-22058296d697.png');     // clean stacked, white bg

(async () => {
  // NAVY lockup = official horizontal, trimmed (navy wordmark on transparent).
  const navyTrim = await sharp(horizontal).trim({ threshold: 10 }).png().toBuffer();
  await sharp(navyTrim).toFile(path.join(assets, 'logo-neptor-navy.png'));
  const nm = await sharp(navyTrim).metadata();

  // WHITE lockup = same lockup with the dark navy wordmark recoloured to white,
  // droplet (gold/aqua) preserved, anti-aliased edges kept via alpha.
  const { data, info } = await sharp(navyTrim).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (a > 10 && lum < 100) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
  }
  await sharp(data, { raw: { width, height, channels } }).png().toFile(path.join(assets, 'logo-neptor-white.png'));

  const wm = await sharp(path.join(assets, 'logo-neptor-white.png')).metadata();
  console.log('navy lockup', nm.width + 'x' + nm.height);
  console.log('white lockup', wm.width + 'x' + wm.height);
})().catch((e) => { console.error(e); process.exit(1); });
