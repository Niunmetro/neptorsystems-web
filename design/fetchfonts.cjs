const fs = require("fs");
const https = require("https");
const blocks = JSON.parse(fs.readFileSync("design/_fontblocks.json", "utf8"));

const slug = (fam) => fam.toLowerCase().replace(/\s+/g, "-");
function get(url) {
  return new Promise((res, rej) => {
    https.get(url, (r) => {
      if (r.statusCode !== 200) return rej(new Error("HTTP " + r.statusCode + " " + url));
      const chunks = [];
      r.on("data", (c) => chunks.push(c));
      r.on("end", () => res(Buffer.concat(chunks)));
    }).on("error", rej);
  });
}

(async () => {
  let faces = [];
  for (const b of blocks) {
    const fname = `${slug(b.fam)}-${b.wght}.woff2`;
    const buf = await get(b.url);
    fs.writeFileSync("public/fonts/" + fname, buf);
    console.log(fname, buf.length, "bytes");
    faces.push(
      `@font-face{font-family:'${b.fam}';font-style:normal;font-weight:${b.wght};font-display:swap;` +
      `src:url('/fonts/${fname}') format('woff2');unicode-range:${b.range};}`
    );
  }
  const header = "/* Neptor Systems — self-hosted webfonts (latin subset). Generated, do not hand-edit. */\n";
  fs.writeFileSync("src/styles/fonts.css", header + faces.join("\n") + "\n");
  console.log("wrote src/styles/fonts.css with", faces.length, "faces");
})();
