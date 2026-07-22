const fs = require("fs");
const css = fs.readFileSync("design/gfonts.css", "utf8");
const re = /\/\*\s*([a-z0-9\-\[\] ]+?)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
let m, blocks = [];
while ((m = re.exec(css))) {
  const subset = m[1].trim();
  const body = m[2];
  const fam = (body.match(/font-family:\s*'([^']+)'/) || [])[1];
  const wght = (body.match(/font-weight:\s*([0-9]+)/) || [])[1];
  const url = (body.match(/url\(([^)]+)\)\s*format\('woff2'\)/) || [])[1];
  const range = (body.match(/unicode-range:\s*([^;]+)/) || [])[1];
  blocks.push({ subset, fam, wght, url, range });
}
console.log("total blocks:", blocks.length);
const keep = blocks.filter((b) => b.subset === "latin");
console.log("latin blocks:", keep.length);
keep.forEach((b) => console.log(b.fam, b.wght));
fs.writeFileSync("design/_fontblocks.json", JSON.stringify(keep, null, 1));
