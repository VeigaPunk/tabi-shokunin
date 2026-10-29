#!/usr/bin/env node
// tree-vs-blob.mjs — deterministic tree-object fixture generator (tabi round
// 43, C2 rule r1). Builds a scratch git fixture where the checked receipt
// path is a DIRECTORY (a git tree object) large enough to pass the r42
// checker's size floor, then runs BOTH checkers: the round-42 checker bytes
// (no type check — the type violation is unnamed) and the round-43 checker
// bytes, whose `git cat-file -t` blob gate (S151) must name
// `r1a-not-a-blob`. Fixture repo lives under --work; every git call names
// -C <dir>; toplevel verified before the first commit.
// Usage: node tree-vs-blob.mjs --out <receipt.json> --work <scratch dir>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const R42CHECKER = path.join(LANE, '.ufo/waves/round-42/counters/check-routed-defects-round42.mjs');
const R43CHECKER = path.join(LANE, '.ufo/waves/round-43/counters/check-routed-defects-round43.mjs');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(m) { console.error(m); process.exit(64); }
const args = process.argv.slice(2);
let out = null, work = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') out = args[++i];
  else if (args[i] === '--work') work = args[++i];
}
if (!out || !work) die('usage: node tree-vs-blob.mjs --out <receipt.json> --work <dir>');

const D = path.join(path.resolve(work), 'tree-blob-fixture');
fs.rmSync(D, { recursive: true, force: true });
fs.mkdirSync(D, { recursive: true });
const git = (a) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8' });
if (git(['init', '-q']).status !== 0) die('git init failed');
if (git(['rev-parse', '--show-toplevel']).stdout.trim() !== D) die('toplevel mismatch — refusing to commit');
git(['config', 'user.email', 'tree-vs-blob@fixture.local']);
git(['config', 'user.name', 'TreeVsBlobFixture']);

const put = (rel, content) => { const p = path.join(D, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); };
// The receipt path is a TREE: 60 entries => tree object well over 1000 bytes.
for (let i = 0; i < 60; i++) put(`corpus/evidence/round41/playwright-egress/receipt.json/part-${String(i).padStart(2, '0')}`, 'x'.repeat(40) + '\n');
const witness = JSON.stringify({ schema: 'tabi-r41-witness', witnessChildSpawned: false, samples: [], notes: 'x'.repeat(900) }) + '\n';
put('corpus/evidence/round41/playwright-egress/receipt.witness.json', witness);
put('.ufo/waves/round-41/measure/c1-measure.json', JSON.stringify({ schema: 'tabi-r41-c1-measure', receiptSha256: 'pending', witnessSha256: sha256(witness) }) + '\n');

if (git(['add', '-A']).status !== 0) die('git add failed');
if (git(['commit', '-q', '-m', 'tree fixture wip']).status !== 0) die('git commit failed');
const rawTree = spawnSync('git', ['-C', D, 'show', `HEAD:corpus/evidence/round41/playwright-egress/receipt.json`], { encoding: 'buffer', maxBuffer: 1 << 20 });
if (rawTree.status !== 0) die('could not read tree bytes');
put('.ufo/waves/round-41/measure/c1-measure.json', JSON.stringify({ schema: 'tabi-r41-c1-measure', receiptSha256: sha256(rawTree.stdout), witnessSha256: sha256(witness) }) + '\n');
if (git(['add', '-A']).status !== 0) die('git add 2 failed');
if (git(['commit', '-q', '-m', 'tree fixture binding']).status !== 0) die('git commit 2 failed');
const rev = git(['rev-parse', 'HEAD']).stdout.trim();
if (!/^[0-9a-f]{40}$/.test(rev)) die('no fixture rev');

const run = (checker) => {
  const r = spawnSync(process.execPath, [checker, '--rev', rev, '--repo', D, '--json'], { encoding: 'utf8', maxBuffer: 16 << 20 });
  let parsed = null; try { parsed = JSON.parse(r.stdout || ''); } catch { }
  return { exit: r.status, doc: parsed };
};
const v2 = run(R43CHECKER);
const r42 = run(R42CHECKER);
const v2Ids = (v2.doc?.findings || []).map((f) => f.id);
const r42Ids = (r42.doc?.findings || []).map((f) => f.id);
const named = v2.exit !== 0 && v2Ids.includes('r1a-not-a-blob');
const receipt = {
  schema: 'tabi-r43-c2-tree-fixture',
  fixtureRev: rev,
  typeViolationNamed: named,
  v2: { exit: v2.exit, findingIds: v2Ids },
  r42: { exit: r42.exit, findingIds: r42Ids },
  note: 'receipt path is a tree object; v2 names r1a-not-a-blob (cat-file -t, S151); r42 bytes record what the missing type check allowed',
};
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, JSON.stringify(receipt, null, 1) + '\n');
console.log(JSON.stringify(receipt));
process.exit(named ? 0 : 1);
