#!/usr/bin/env node
// anchor-ceiling-probe.mjs — ScribeMistakes round-30 w1 (scratch tool, not a
// lane gate). Reads a staged-anchor `recheck:` sentence that asserts a draft
// revision ceiling ("-N and later ... 404") and the committed live-fetch
// receipts under --receipts, and fails when any revision at or above N was
// actually served with HTTP 200.
//
// Verdict: 0 the ceiling holds (every fetched revision >= N is 404), or the
// claim carries no ceiling; 1 the ceiling is contradicted by a 200; 2 usage.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const argv = process.argv.slice(2);
const arg = (name) => { const i = argv.indexOf(name); return i === -1 ? null : argv[i + 1]; };
const claim = arg("--claim");
const receipts = arg("--receipts");
if (typeof claim !== "string" || !receipts) {
  console.error("usage: node anchor-ceiling-probe.mjs --claim <text> --receipts <dir>");
  process.exit(2);
}

const m = /-(\d+)\s*and\s+later[^0-9]*404/i.exec(claim);
if (!m) {
  console.log("CEILING_CLAIM none (no '-N and later ... 404' assertion in the claim)");
  process.exit(0);
}
const ceiling = Number(m[1]);
const rev = (name) => Number(/(\d+)\.json$/.exec(name)?.[1] ?? NaN);
const files = readdirSync(receipts).filter((n) => /^draft-\d+\.json$/.test(n));
if (!files.length) {
  console.error("CEILING_CLAIM could-not-evaluate (no receipts)");
  process.exit(2);
}
const observed = files
  .map((n) => ({ n: rev(n), ...JSON.parse(readFileSync(join(receipts, n), "utf8")) }))
  .sort((a, b) => a.n - b.n);
const atOrAbove = observed.filter((o) => o.n >= ceiling);
const contradicted = atOrAbove.filter((o) => o.http_status === 200);
for (const o of observed) {
  console.log(`REV -${String(o.n).padStart(2, "0")} http_status=${o.http_status} bytes=${o.bytes} sha256=${o.sha256.slice(0, 8)}… fetched_at=${o.fetched_at}`);
}
if (contradicted.length) {
  console.log(`CEILING_CLAIM contradicted: claim says -${String(ceiling).padStart(2, "0")} and later return 404; ${contradicted.map((o) => `-${String(o.n).padStart(2, "0")} returned ${o.http_status} (${o.bytes} bytes)`).join(", ")}`);
  process.exit(1);
}
console.log(`CEILING_CLAIM holds: every fetched revision >= -${String(ceiling).padStart(2, "0")} returned 404 (${atOrAbove.map((o) => `-${String(o.n).padStart(2, "0")}`).join(", ")})`);
process.exit(0);
