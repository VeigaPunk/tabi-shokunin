import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const COUNTER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-frontier-admission.mjs";
const src = readFileSync(COUNTER, "utf8");
const start = src.indexOf("const ENTITIES =");
const end = src.indexOf("const collapse =");
if (start < 0 || end < 0 || end <= start) throw new Error("extract failed");
const snippet = src.slice(start, end).replace("export function normalise", "function normalise");
const sha = (b) => createHash("sha256").update(b).digest("hex");
console.error("snippet_sha256=" + sha(snippet) + " chars=" + snippet.length + " bytes=" + Buffer.byteLength(snippet));
const normalise = new Function(snippet + "\nreturn normalise;")();
const out = {};
for (const f of process.argv.slice(2)) {
  const buf = readFileSync(f);
  const n = normalise(buf);
  const nb = Buffer.from(n, "utf8");
  writeFileSync(f + ".norm.txt", n);
  out[f] = { rawBytes: buf.length, rawSha: sha(buf), normChars: n.length, normBytes: nb.length, normSha: sha(nb) };
}
console.log(JSON.stringify(out, null, 2));
const a = normalise(readFileSync(process.argv[2]));
console.log("equal_norm_fetch1_vs_fetch2:", a === normalise(readFileSync(process.argv[3])));
console.log("equal_norm_fetch1_vs_legacy:", a === normalise(readFileSync(process.argv[4])));
