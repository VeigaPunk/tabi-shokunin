#!/usr/bin/env node
// v0-fabrication.mjs — deterministic V0-fabrication fixture generator
// (tabi round 43, C2 rule r6). Rebuilds the r42 wave CritC2Ledger V0 attack —
// a fully self-consistent fabrication with no browser, no fetch and no
// executed command — as a scratch git fixture, then runs BOTH checkers over
// it: the round-42 checker bytes (which greened V0 — the documented hole) and
// the round-43 checker bytes (which must refuse it via the measure-blob pin).
// The fixture repo is created under --work (scratch); every git call names
// -C <dir>; toplevel is verified before the first commit; the identity is a
// throwaway local to the fixture. This script writes ONLY under --work plus
// the single --out receipt.
// Usage: node v0-fabrication.mjs --out <probe.json> --work <scratch dir> \
//          --slice <lane slice-ids.txt>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const R42CHECKER = path.join(LANE, '.ufo/waves/round-42/counters/check-routed-defects-round42.mjs');
const R43CHECKER = path.join(LANE, '.ufo/waves/round-43/counters/check-routed-defects-round43.mjs');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(m) { console.error(m); process.exit(64); }
const args = process.argv.slice(2);
let out = null, work = null, slice = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') out = args[++i];
  else if (args[i] === '--work') work = args[++i];
  else if (args[i] === '--slice') slice = args[++i];
}
if (!out || !work || !slice) die('usage: node v0-fabrication.mjs --out <probe.json> --work <dir> --slice <slice-ids.txt>');

const D = path.join(path.resolve(work), 'v0-fixture');
fs.rmSync(D, { recursive: true, force: true });
fs.mkdirSync(D, { recursive: true });
const git = (a, o = {}) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8', ...o });
if (git(['init', '-q']).status !== 0) die('git init failed');
if (git(['rev-parse', '--show-toplevel']).stdout.trim() !== D) die('toplevel mismatch — refusing to commit');
git(['config', 'user.email', 'v0-fabrication@fixture.local']);
git(['config', 'user.name', 'V0FabricationFixture']);

const pad = (n, ch = 'x') => ch.repeat(n);
const receipt = JSON.stringify({
  schema: 'tabi-pw-firefox-egress-receipt-r41',
  browserLaunched: false, runs: [], notes: pad(1200),
}) + '\n';
const witness = JSON.stringify({ schema: 'tabi-r41-witness', witnessChildSpawned: false, samples: [], notes: pad(1200) }) + '\n';
const measure = JSON.stringify({
  schema: 'tabi-r41-c1-measure',
  receiptSha256: sha256(receipt), witnessSha256: sha256(witness),
}) + '\n';
const sources = [
  '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  '| S146 | Node.js CLI documentation — https://nodejs.org/docs/latest-v24.x/api/cli.html | docs | A | s | a | t | rejected | 2026-10-28 | on-release | u |',
  '| S148 | Node.js CLI documentation — https://nodejs.org/docs/latest-v24.x/api/cli.html | docs | A | s | a | supersedes S146 — options | mined | 2026-10-28 | on-release | u |',
  '',
].join('\n');
const decoyHtml = '<html>options ' + pad(1200) + '</html>\n';
const baselineOut = 'git ls-tree -r --name-only <baseline> -- corpus/evidence/round42 | wc -l\n0\n';
const sliceIds = fs.readFileSync(slice, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
if (sliceIds.length !== 38) die(`expected 38 slice ids, got ${sliceIds.length}`);

const put = (rel, content) => { const p = path.join(D, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); };
put('corpus/evidence/round41/playwright-egress/receipt.json', receipt);
put('corpus/evidence/round41/playwright-egress/receipt.witness.json', witness);
put('.ufo/waves/round-41/measure/c1-measure.json', measure);
put('corpus/SOURCES.md', sources);
put('.ufo/waves/round-41/sources/node-cli-v24.21.0.html', decoyHtml);
put('.ufo/waves/round-41/controls/c1-baseline-noop.out', baselineOut);
const tsvRows = [];
for (const id of sliceIds) {
  put(`.quarantine-evidence/${id}.txt`, `fabricated evidence for ${id}\n` + pad(220));
  tsvRows.push(`${id}\tpresent\t.quarantine-evidence/${id}.txt`);
}
put('.ufo/waves/round-42/quarantine/slice-ids.txt', sliceIds.join('\n') + '\n');
put('.ufo/waves/round-42/quarantine/re-adjudication.tsv', tsvRows.join('\n') + '\n');

if (git(['add', '-A']).status !== 0) die('git add failed');
if (git(['commit', '-q', '-m', 'v0 fabrication fixture']).status !== 0) die('git commit failed');
const rev = git(['rev-parse', 'HEAD']).stdout.trim();
if (!/^[0-9a-f]{40}$/.test(rev)) die('no fixture rev');

const run = (checker) => {
  const r = spawnSync(process.execPath, [checker, '--rev', rev, '--repo', D, '--json'], { encoding: 'utf8', maxBuffer: 16 << 20 });
  let parsed = null; try { parsed = JSON.parse(r.stdout || ''); } catch { }
  return { exit: r.status, doc: parsed };
};
const v2 = run(R43CHECKER);
const r42 = run(R42CHECKER);
const refused = v2.exit !== 0 && Array.isArray(v2.doc?.findings) && v2.doc.findings.some((f) => f.id === 'r1-measure-blob-pin-mismatch');
const probe = {
  schema: 'tabi-r43-c2-v0-probe',
  fixtureRev: rev,
  generatorDigest: sha256(fs.readFileSync(fileURLToPath(import.meta.url))),
  refused,
  checkerExit: v2.exit,
  findingIds: (v2.doc?.findings || []).map((f) => f.id),
  r42CheckerExit: r42.exit,
  r42FindingCount: r42.doc?.findingCount ?? null,
  r42FindingIds: (r42.doc?.findings || []).map((f) => f.id),
  note: 'V0 self-consistent fabrication; v2 refuses via the measure blob pin; r42 checker bytes recorded for the hole they greened',
};
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, JSON.stringify(probe, null, 1) + '\n');
console.log(JSON.stringify(probe));
process.exit(refused && r42.exit === 0 ? 0 : 1);
