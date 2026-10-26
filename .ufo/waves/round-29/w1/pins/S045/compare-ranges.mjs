import { readFileSync } from "node:fs";
const P = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w1/pins/S045/bytes";
const OLD = "154.0.8037.97", NEW = "156.0.8078.47";
const norm = (s) => s.trim().replace(/\s+/g, " ");
const files = [
  { path: "third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html", ranges: [[87,87],[113,113]] },
  { path: "third_party/blink/web_tests/inspector-protocol/webmcp/invoke-tool.js", ranges: [[38,51]] },
  { path: "third_party/blink/public/devtools_protocol/domains/WebMCP.pdl", ranges: [[68,68]] },
];
const out = [];
for (const f of files) {
  const oTxt = readFileSync(`${P}/${OLD}/${f.path}`, "utf8");
  const nTxt = readFileSync(`${P}/${NEW}/${f.path}`, "utf8");
  const oL = oTxt.split("\n"), nL = nTxt.split("\n");
  const nNorm = nL.map(norm);
  const rec = { path: f.path, oldLines: oL.length, newLines: nL.length, ranges: [] };
  for (const [a, b] of f.ranges) {
    const block = oL.slice(a-1, b).map(norm);
    let at = null;
    for (let i = 0; i + block.length <= nNorm.length; i += 1) {
      let ok = true;
      for (let j = 0; j < block.length; j += 1) if (nNorm[i+j] !== block[j]) { ok = false; break; }
      if (ok) { at = i + 1; break; }
    }
    rec.ranges.push({ a, b, holds: at !== null, newAt: at, oldText: oL.slice(a-1,b).join("\n") });
  }
  out.push(rec);
}
console.log(JSON.stringify(out, null, 2));
