#!/usr/bin/env node
// Build single-point mutant copies of the round-33 v2 gate (sha256 62453b55…)
// in $S/mut/. Each mutant re-applies one round-32 MutC1 survivor's weakening to
// v2, so a receipt that v2 refuses can be re-run against the weakened gate to
// show the refusal is carried by that exact check and not by something else.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";

const SRC = process.argv[2];
const OUT = process.argv[3];
const src = readFileSync(SRC, "utf8");
const sha = (b) => createHash("sha256").update(b).digest("hex");
mkdirSync(OUT, { recursive: true });

const MUTANTS = {
  // M11 (round-32 MutC1 line 528): driver digest equality dropped (presence only).
  "m11-driver-sha-not-compared": [
    'else if (sha256(drv) !== receiptObj.driverSha256) receiptFinding = `driver sha256 differs: ${receiptObj.driver}`;',
    'else if (false) receiptFinding = `driver sha256 differs: ${receiptObj.driver}`;',
  ],
  // M06 (line 177): ok() accepts any response frame, error included.
  "m06-ok-accepts-any-frame": [
    'const ok = (c) => c && c.response && c.response.type === "success";',
    'const ok = (c) => c && c.response;',
  ],
  // M04 (line 551): cross-run chromedriverVersion equality dropped (presence only).
  "m04-cdv-presence-only": [
    'else if (runs.some((r) => !cdv(r.rec)) || new Set(runs.map((r) => cdv(r.rec))).size !== 1) bindingFinding = "chromedriverVersion absent or differs between runs";',
    'else if (runs.some((r) => !cdv(r.rec))) bindingFinding = "chromedriverVersion absent or differs between runs";',
  ],
  // M18 (line 236): R4 accepts any decodable PNG, dimensions unchecked.
  "m18-png-dims-unchecked": [
    'return shots.some((c) => { const s = pngSize(res(c).data); return s && s.width === VIEWPORT.width && s.height === VIEWPORT.height; }) ? null : "screenshot is not a PNG of the pinned viewport";',
    'return shots.some((c) => pngSize(res(c).data)) ? null : "screenshot is not a PNG of the pinned viewport";',
  ],
  // M17 stage a (line 220): R1's loopback clause loosened to any ws:// host.
  "m17a-r1-loopback-loosened": [
    'const WS_LOOPBACK = /^ws:\\/\\/(127\\.0\\.0\\.1|localhost):\\d+\\/session\\//;',
    'const WS_LOOPBACK = /^ws:\\/\\//;',
  ],
  // M17 stage b: sessionOf's loopback clause dropped (v2's second loopback gate).
  "m17b-sessionof-loopback-dropped": [
    '  if (!WS_LOOPBACK.test(url)) return { why: `webSocketUrl is not a loopback ws session url: ${url}` };\n',
    "",
  ],
};

const manifest = { source: SRC, sourceSha256: sha(src), mutants: {} };
for (const [name, [from, to]] of Object.entries(MUTANTS)) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`${name}: expected 1 occurrence of the target text, found ${n}`);
  const text = src.replace(from, to);
  const p = `${OUT}/${name}.mjs`;
  writeFileSync(p, text);
  manifest.mutants[name] = { path: p, sha256: sha(text), from, to };
  console.log(`MUTANT ${name} writes=${p} sha256=${sha(text)}`);
}
// M17 stage c: both loopback clauses dropped (a + b, two points, documented as such).
{
  let t = src;
  for (const k of ["m17a-r1-loopback-loosened", "m17b-sessionof-loopback-dropped"]) {
    const [from, to] = MUTANTS[k];
    if (t.split(from).length - 1 !== 1) throw new Error(`${k}: target lost in composite`);
    t = t.replace(from, to);
  }
  const p = `${OUT}/m17c-both-loopback-dropped.mjs`;
  writeFileSync(p, t);
  manifest.mutants["m17c-both-loopback-dropped"] = { path: p, sha256: sha(t) };
  console.log(`MUTANT m17c-both-loopback-dropped writes=${p} sha256=${sha(t)}`);
}
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 1) + "\n");
