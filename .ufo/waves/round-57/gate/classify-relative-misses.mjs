#!/usr/bin/env node
// classify-relative-misses.mjs — RECEIPT TOOL, not part of the gate contract.
//
// Reads a check-cited-receipts-v2 JSON receipt and, for every distinct
// `relative-citation-missing` target, reports where that same round-relative path exists
// at the same revision. It changes no verdict: it exists so a reader can tell a receipt
// that is missing at the gated round AND at every other round from one that is merely
// absent at the gated round because it lives in another round's wave dir (an r56-or-older
// SCORECARD/LOG row, written before QUALITY criterion 110 required full prefixes).
//
// usage:
//   node gate/classify-relative-misses.mjs --repo <abs lane> --rev <rev> \
//     --receipt <v2 receipt.json> [--json]
//
// Read-only: git ls-tree + readFileSync. Writes nothing.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SCHEMA = 'tabi-relative-miss-classification';

function die(message) {
  process.stderr.write(`classify-relative-misses: ${message}\n`);
  process.exit(2);
}

function parse(argv) {
  const o = { repo: process.cwd(), rev: null, receipt: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') o.json = true;
    else if (a === '--repo' || a === '--rev' || a === '--receipt') {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) die(`missing value for ${a}`);
      if (a === '--repo') o.repo = v;
      else if (a === '--rev') o.rev = v;
      else o.receipt = v;
    } else die(`unknown argument ${a}`);
  }
  if (o.rev === null) die('--rev is required');
  if (o.receipt === null) die('--receipt is required');
  return o;
}

const o = parse(process.argv.slice(2));
let receipt;
try {
  receipt = JSON.parse(readFileSync(o.receipt, 'utf8'));
} catch (e) {
  die(`receipt is not readable JSON: ${e instanceof Error ? e.message : String(e)}`);
}
if (!Array.isArray(receipt.findings)) die('receipt has no findings[]');

const tree = spawnSync('git', ['-C', o.repo, 'ls-tree', '-r', '--name-only', o.rev, '--', '.ufo/waves'], {
  encoding: 'utf8',
  maxBuffer: 512 * 1024 * 1024,
});
if (tree.error || tree.status !== 0) die(`git ls-tree failed at ${o.rev}`);
const present = new Set(tree.stdout.split('\n'));
const homes = new Map();
for (const path of present) {
  const m = /^\.ufo\/waves\/round-(\d+)\/(.+)$/.exec(path);
  if (m === null) continue;
  const key = m[2];
  if (!homes.has(key)) homes.set(key, []);
  homes.get(key).push(Number(m[1]));
}
for (const list of homes.values()) list.sort((a, b) => a - b);

const byToken = new Map();
for (const f of receipt.findings) {
  if (f.id !== 'relative-citation-missing') continue;
  const key = f.path;
  if (!byToken.has(key)) {
    byToken.set(key, { token: key, resolved: f.resolved, lines: [], docs: new Set() });
  }
  const row = byToken.get(key);
  row.lines.push(f.line);
  row.docs.add(f.citingDoc.split(':').slice(1).join(':'));
}

const rows = [];
for (const row of byToken.values()) {
  const homeRounds = homes.get(row.token) ?? [];
  const last = row.token.slice(row.token.lastIndexOf('/') + 1);
  rows.push({
    token: row.token,
    resolved: row.resolved,
    docs: [...row.docs].sort(),
    lines: [...new Set(row.lines)].sort((a, b) => a - b),
    homeRounds,
    missingEverywhere: homeRounds.length === 0,
    lastSegmentLooksLikeFile: last.includes('.'),
  });
}
rows.sort((a, b) => (a.missingEverywhere === b.missingEverywhere
  ? a.token.localeCompare(b.token)
  : (a.missingEverywhere ? -1 : 1)));

const summary = {
  schema: SCHEMA,
  repo: o.repo,
  rev: o.rev,
  receipt: o.receipt,
  gateRound: receipt.round,
  distinctRelativeMisses: rows.length,
  missingEverywhere: rows.filter((r) => r.missingEverywhere).length,
  withHomeInAnotherRound: rows.filter((r) => !r.missingEverywhere).length,
  lastSegmentLooksLikeFile: rows.filter((r) => r.lastSegmentLooksLikeFile).length,
  lastSegmentNoDot: rows.filter((r) => !r.lastSegmentLooksLikeFile).length,
};

if (o.json) {
  process.stdout.write(`${JSON.stringify({ ...summary, rows })}\n`);
} else {
  const out = [];
  out.push(`schema: ${SCHEMA}`);
  out.push(`rev: ${o.rev} gate-round: ${receipt.round} receipt: ${o.receipt}`);
  out.push(`distinct relative misses: ${summary.distinctRelativeMisses}`);
  out.push(`  missing at the gated round AND every other round: ${summary.missingEverywhere}`);
  out.push(`  present in another round's dir (a pre-criterion-110 row): ${summary.withHomeInAnotherRound}`);
  out.push(`  last path segment has a '.' (file-shaped): ${summary.lastSegmentLooksLikeFile}`);
  out.push(`  last path segment has no '.' (prose- or directory-shaped): ${summary.lastSegmentNoDot}`);
  out.push('');
  for (const r of rows) {
    out.push(
      `${r.missingEverywhere ? 'NOWHERE' : 'HOME-' + r.homeRounds.join(',')} ` +
      `token=${r.token} resolved=${r.resolved} docs=${r.docs.join(',')} lines=${r.lines.join(',')}`,
    );
  }
  process.stdout.write(`${out.join('\n')}\n`);
}
