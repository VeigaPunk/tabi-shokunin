import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const COUNTER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-frontier-admission.mjs";
const src = readFileSync(COUNTER, "utf8");
const snippet = src.slice(src.indexOf("const ENTITIES ="), src.indexOf("const collapse =")).replace("export function normalise", "function normalise");
const normalise = new Function(snippet + "\nreturn normalise;")();
const collapse = (s) => String(s).replace(/\s+/g, " ").trim();
const sha = (b) => createHash("sha256").update(b).digest("hex");

const QUOTE = "limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.";
const files = ["discord-1.html", "discord-2.html", "legacy.html"];
const norms = files.map((f) => normalise(readFileSync(f)));
const q = collapse(QUOTE);
const report = {
  quote: q,
  words: q.split(" ").filter(Boolean).length,
  located: norms.map((n, i) => ({ file: files[i], located: n.includes(q), normLen: n.length, normSha: sha(Buffer.from(n, "utf8")) })),
  allNormEqual: norms[0] === norms[1] && norms[0] === norms[2],
};
console.log(JSON.stringify(report, null, 2));
