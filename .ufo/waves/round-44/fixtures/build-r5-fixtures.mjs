#!/usr/bin/env node
// build-r5-fixtures.mjs — tabi round 44, claim C1 fixture builder.
// Materializes a minimal git fixture repo containing exactly the paths the
// routed-defects checkers read (from a pinned lane revision), optionally with
// one attack mutation applied to the round-43 claims freeze bytes. Commit
// metadata is fixed so fixture revisions are byte-deterministic across runs
// on the same source revision.
//
// Usage:
//   node build-r5-fixtures.mjs --repo <lane repo> --source-rev <40hex> \
//        --out <fixture dir> --mut none|drop3|fragment|pathtype
//
// Mutations (the r43 wave's demonstrated false-green limbs):
//   drop3     — remove three controlBindings entries while the freeze text
//               keeps naming them (the 5-of-8 limb, CritFreezeBindings);
//   fragment  — replace one binding quote with a 19-char substring that is
//               NOT a complete line of the control bytes;
//   pathtype  — replace one binding's path with a number (r43 crashed with
//               an uncaught TypeError on this input).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
function die(msg) { console.error(JSON.stringify({ error: msg })); process.exit(2); }
function git(repo, args, opts = {}) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'buffer', maxBuffer: 256 << 20, ...opts });
  if (r.error || r.status !== 0) die(`git ${args.join(' ')} failed: ${r.stderr?.toString().slice(0, 300)}`);
  return r.stdout;
}

const argv = process.argv.slice(2);
let repo = null, sourceRev = null, outDir = null, mut = 'none';
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--repo') repo = argv[++i];
  else if (argv[i] === '--source-rev') sourceRev = argv[++i];
  else if (argv[i] === '--out') outDir = argv[++i];
  else if (argv[i] === '--mut') mut = argv[++i];
}
if (!repo || !sourceRev || !outDir || !/^[0-9a-f]{40}$/.test(sourceRev)) die('usage: --repo <lane> --source-rev <40hex> --out <dir> --mut none|drop3|fragment|pathtype');
if (!['none', 'drop3', 'fragment', 'pathtype'].includes(mut)) die(`unknown mut ${mut}`);

const show = (p) => {
  const r = spawnSync('git', ['-C', repo, 'show', `${sourceRev}:${p}`], { encoding: 'buffer', maxBuffer: 64 << 20 });
  if (r.error || r.status !== 0) die(`source path missing at ${sourceRev}: ${p}`);
  return r.stdout;
};

// The checker read set: constants + claims.json-bound controls + TSV evidence.
const CLAIMS = '.ufo/waves/round-43/claims.json';
const paths = new Set([
  'corpus/evidence/round41/playwright-egress/receipt.json',
  'corpus/evidence/round41/playwright-egress/receipt.witness.json',
  '.ufo/waves/round-41/measure/c1-measure.json',
  'corpus/SOURCES.md',
  '.ufo/waves/round-41/sources/node-cli-v24.21.0.html',
  '.ufo/waves/round-41/controls/c1-baseline-noop.out',
  '.ufo/waves/round-42/quarantine/re-adjudication.tsv',
  '.ufo/waves/round-42/quarantine/slice-ids.txt',
  '.ufo/waves/round-43/controls/c2-v0-probe.json',
  CLAIMS,
]);
const claimsBytes = show(CLAIMS);
const claims = JSON.parse(claimsBytes.toString('utf8'));
for (const b of claims.controlBindings || []) if (typeof b.path === 'string') paths.add(b.path);
const tsv = show('.ufo/waves/round-42/quarantine/re-adjudication.tsv').toString('utf8');
for (const row of tsv.split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))) {
  const cols = row.split('\t');
  if (cols.length >= 3 && cols[2]) paths.add(cols[2]);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
for (const p of paths) {
  const dst = path.join(outDir, ...p.split('/'));
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, show(p));
}

// Apply the mutation to the claims bytes.
let mutated = Buffer.from(claimsBytes);
if (mut === 'drop3') {
  const doc = JSON.parse(claimsBytes.toString('utf8'));
  const drop = (p) => doc.controlBindings.findIndex((b) => typeof b.path === 'string' && b.path.endsWith(p));
  for (const name of ['c2-v0-probe.json', 'c2-tree-fixture.json', 'c1-battery-r43.json']) {
    const i = drop(name);
    if (i < 0) die(`drop3: binding not found for ${name}`);
    doc.controlBindings.splice(i, 1);
  }
  mutated = Buffer.from(JSON.stringify(doc, null, 1) + '\n', 'utf8');
} else if (mut === 'fragment') {
  const doc = JSON.parse(claimsBytes.toString('utf8'));
  const b = doc.controlBindings.find((x) => x.path.endsWith('c1-replay-r42-refused.json'));
  if (!b) die('fragment: target binding not found');
  // 17 chars, contained in the file, but NOT a complete line of it (the real
  // line carries a leading space: ` "refusalLayers": [`)
  b.quote = 'refusalLayers": [';
  if (!Buffer.from(fs.readFileSync(path.join(outDir, ...b.path.split('/'))).toString('utf8')).includes(b.quote)) die('fragment: quote is not a substring of the control bytes');
  const lines = fs.readFileSync(path.join(outDir, ...b.path.split('/')), 'utf8').split(/\r?\n/);
  if (lines.includes(b.quote)) die('fragment: quote unexpectedly IS a whole line');
  mutated = Buffer.from(JSON.stringify(doc, null, 1) + '\n', 'utf8');
} else if (mut === 'pathtype') {
  const doc = JSON.parse(claimsBytes.toString('utf8'));
  doc.controlBindings[0].path = 12345;
  mutated = Buffer.from(JSON.stringify(doc, null, 1) + '\n', 'utf8');
}
if (mut !== 'none') fs.writeFileSync(path.join(outDir, ...CLAIMS.split('/')), mutated);

git(outDir, ['init', '-b', 'master']);
git(outDir, ['config', 'core.autocrlf', 'false']);
git(outDir, ['config', 'user.name', 'tabi-r44-fixture']);
git(outDir, ['config', 'user.email', 'tabi-r44-fixture@shokunin.local']);
git(outDir, ['add', '-A']);
const env = {
  ...process.env,
  GIT_AUTHOR_NAME: 'tabi-r44-fixture', GIT_AUTHOR_EMAIL: 'tabi-r44-fixture@shokunin.local',
  GIT_AUTHOR_DATE: '2026-10-31T00:00:00+00:00',
  GIT_COMMITTER_NAME: 'tabi-r44-fixture', GIT_COMMITTER_EMAIL: 'tabi-r44-fixture@shokunin.local',
  GIT_COMMITTER_DATE: '2026-10-31T00:00:00+00:00',
};
git(outDir, ['commit', '-m', `fixture ${mut} from ${sourceRev.slice(0, 8)}`], { env });
const rev = git(outDir, ['rev-parse', 'HEAD']).toString().trim();
console.log(JSON.stringify({
  sourceRev, mut, fixtureRev: rev,
  fixtureClaimsSha256: sha256(fs.readFileSync(path.join(outDir, ...CLAIMS.split('/')))),
  files: paths.size,
}));
