const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Resvg } = require('@resvg/resvg-js');

const pub = path.resolve('public');
const markPath = path.join(pub, 'assets', 'logo-neptor-mark.png');
const whitePath = path.join(pub, 'assets', 'logo-neptor-white.png');
const navyPath = path.join(pub, 'assets', 'logo-neptor-navy.png');
const poppins = fs.readFileSync('design/Poppins-SemiBold.ttf');

const NAVY = '#0A1F44', AQUA = '#00C2D1', WHITE = '#FFFFFF';

function renderText(text, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="240" viewBox="0 0 1200 240">
    <text x="4" y="168" font-family="Poppins" font-weight="600" font-size="132" letter-spacing="-3" fill="${color}">${text}</text>
  </svg>`;
  const r = new Resvg(svg, { font: { fontBuffers: [poppins], defaultFontFamily: 'Poppins', loadSystemFonts: false } });
  return r.render().asPng(); // transparent background
}

async function buildLockup(color, outPath) {
  // Real droplet mark (complete asset) at a fixed height.
  const markH = 148;
  const mark = await sharp(markPath).resize({ height: markH }).png().toBuffer();
  const mm = await sharp(mark).metadata();
  // Wordmark reconstructed in the brand heading face (Poppins SemiBold).
  const text = await sharp(renderText('Neptor Systems', color)).trim().png().toBuffer();
  const tm = await sharp(text).metadata();
  const gap = 34, padX = 12, padY = 14;
  const contentH = Math.max(markH, tm.height);
  const W = padX * 2 + mm.width + gap + tm.width;
  const H = padY * 2 + contentH;
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: mark, left: padX, top: padY + Math.round((contentH - markH) / 2) },
      { input: text, left: padX + mm.width + gap, top: padY + Math.round((contentH - tm.height) / 2) },
    ])
    .png().toFile(outPath);
  return { W, H };
}

(async () => {
  fs.mkdirSync(path.join(pub, 'og'), { recursive: true });

  // ---------- LOCKUPS ----------
  // Built by design/build-lockups.cjs (official droplet + NEPTOR SYSTEMS wordmark).
  // Run that script before this one; here we only consume public/assets/logo-neptor-white.png.

  // ---------- ICONS from the real droplet mark ----------
  // favicon-32: mark contained, transparent
  await sharp(markPath).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(path.join(pub, 'favicon-32.png'));

  // apple-touch-icon 180: mark on white, padded
  const mark180 = await sharp(markPath).resize(132, 132, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: WHITE } })
    .composite([{ input: mark180, gravity: 'center' }]).png().toFile(path.join(pub, 'apple-touch-icon.png'));

  // icon-512: mark on white, padded (PWA)
  const mark512 = await sharp(markPath).resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: WHITE } })
    .composite([{ input: mark512, gravity: 'center' }]).png().toFile(path.join(pub, 'icon-512.png'));

  console.log('icons: favicon-32, apple-touch-icon(180), icon-512 written');

  // ---------- OG IMAGES 1200x630 ----------
  // Trim the square logo's transparent padding to the tight wordmark, scale to a fixed width.
  const logoW = 430;
  const logoBuf = await sharp(whitePath).trim().resize({ width: logoW }).png().toBuffer();
  const logoH = (await sharp(logoBuf).metadata()).height;
  const logoX = Math.round((1200 - logoW) / 2);
  const logoY = 175;
  const textY = logoY + logoH + 96; // baseline of first claim line

  const og = (lines) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0A1F44"/>
      <stop offset="1" stop-color="#0C2450"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.05" r="0.7">
      <stop offset="0" stop-color="#00C2D1" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#00C2D1" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="600" y="${textY}" font-family="Poppins" font-weight="600" font-size="52" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5">
    <tspan x="600" dy="0">${lines[0]}</tspan>
    <tspan x="600" dy="64">${lines[1]}</tspan>
  </text>
  <path d="M0,588 C160,558 320,558 480,588 S800,618 960,588 S1120,566 1200,580" fill="none" stroke="#00C2D1" stroke-width="3" opacity="0.55"/>
  <path d="M0,610 C180,583 360,583 540,610 S900,634 1080,610 S1180,591 1200,603" fill="none" stroke="#7FE0E8" stroke-width="2" opacity="0.35"/>
</svg>`;

  const render = async (svg, out) => {
    const r = new Resvg(svg, {
      font: { fontBuffers: [poppins], defaultFontFamily: 'Poppins', loadSystemFonts: false },
      background: NAVY,
    });
    const base = r.render().asPng();
    await sharp(base).composite([{ input: logoBuf, left: logoX, top: logoY }]).png().toFile(out);
  };

  await render(og(['Una nueva capa de seguridad', 'para la vida en el agua.']), path.join(pub, 'og', 'og-es.png'));
  await render(og(['A new layer of safety', 'for life in the water.']), path.join(pub, 'og', 'og-en.png'));
  console.log('OG: og-es.png, og-en.png written  (logo ' + logoW + 'x' + logoH + ')');
})().catch((e) => { console.error(e); process.exit(1); });
