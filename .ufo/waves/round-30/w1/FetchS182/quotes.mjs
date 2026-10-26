import { readFileSync } from "node:fs";
const COUNTER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-frontier-admission.mjs";
const src = readFileSync(COUNTER, "utf8");
const snippet = src.slice(src.indexOf("const ENTITIES ="), src.indexOf("const collapse =")).replace("export function normalise", "function normalise");
const normalise = new Function(snippet + "\nreturn normalise;")();
const norm = normalise(readFileSync("discord-1.html"));
const collapse = (s) => String(s).replace(/\s+/g, " ").trim();
const qs = JSON.parse(readFileSync("quotes.json", "utf8"));
let bad = 0;
for (const [k, raw] of Object.entries(qs)) {
  const q = collapse(raw);
  const n = q.split(" ").filter(Boolean).length;
  const ok = norm.includes(q) && n >= 1 && n <= 25;
  if (!ok) bad++;
  console.log(`${ok ? "OK  " : "FAIL"} ${k.padEnd(4)} words=${String(n).padStart(2)} located=${norm.includes(q)} :: ${q.slice(0, 90)}`);
}
console.log("failures=" + bad);
