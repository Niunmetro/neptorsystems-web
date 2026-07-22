const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Resvg } = require('@resvg/resvg-js');

const assets = path.resolve('D:/NEPTOR-WEB/public/assets');
const markPath = path.join(assets, 'logo-neptor-mark.png'); // real transparent droplet
const master = path.resolve('D:/NEPTOR-WEB/incoming/image_7fee3aad-d2a7-460d-99d3-22058296d697.png');
const bold = fs.readFileSync('design/Poppins-Bold.ttf');
const medium = fs.readFileSync('design/Poppins-Medium.ttf');

async function sampleNavy() {
  // median of the darkest, bluish pixels in the official (transparent) master wordmark
  const { data, info } = await sharp(master).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels; const rs = [], gs = [], bs = [];
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (a > 200 && lum < 90 && b >= r) { rs.push(r); gs.push(g); bs.push(b); }
  }
  const med = (arr) => arr.sort((x, y) => x - y)[Math.floor(arr.length / 2)] || 20;
  return `rgb(${med(rs)},${med(gs)},${med(bs)})`;
}

function renderLine(text, fontBuf, size, spacing, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="400" viewBox="0 0 2000 400">
    <text x="10" y="300" font-family="Poppins" font-weight="${fontBuf === bold ? 700 : 500}" font-size="${size}" letter-spacing="${spacing}" fill="${color}">${text}</text>
  </svg>`;
  const r = new Resvg(svg, { font: { fontBuffers: [fontBuf], defaultFontFamily: 'Poppins', loadSystemFonts: false } });
  return r.render().asPng();
}

async function buildHorizontal(color, out) {
  const markH = 196;
  const mark = await sharp(markPath).resize({ height: markH }).png().toBuffer();
  const mm = await sharp(mark).metadata();

  const neptor = await sharp(renderLine('NEPTOR', bold, 168, -2, color)).trim().png().toBuffer();
  const systems = await sharp(renderLine('SYSTEMS', medium, 74, 30, color)).trim().png().toBuffer();
  const nm = await sharp(neptor).metadata();
  const sm = await sharp(systems).metadata();

  const gapY = 14;
  const wordW = Math.max(nm.width, sm.width);
  const wordH = nm.height + gapY + sm.height;
  const word = await sharp({ create: { width: wordW, height: wordH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: neptor, left: Math.round((wordW - nm.width) / 2), top: 0 },
      { input: systems, left: Math.round((wordW - sm.width) / 2), top: nm.height + gapY },
    ]).png().toBuffer();

  const gapX = 40, padX = 8, padY = 10;
  const contentH = Math.max(markH, wordH);
  const W = padX * 2 + mm.width + gapX + wordW;
  const H = padY * 2 + contentH;
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: mark, left: padX, top: padY + Math.round((contentH - markH) / 2) },
      { input: word, left: padX + mm.width + gapX, top: padY + Math.round((contentH - wordH) / 2) },
    ]).png().toFile(out);
  return { W, H };
}

(async () => {
  const navy = await sampleNavy();
  console.log('sampled navy:', navy);
  const a = await buildHorizontal('#FFFFFF', path.join(assets, 'logo-neptor-white.png'));
  await buildHorizontal(navy, path.join(assets, 'logo-neptor-navy.png'));
  console.log('lockups rebuilt (official droplet + NEPTOR SYSTEMS):', a.W + 'x' + a.H);
})().catch((e) => { console.error(e); process.exit(1); });
