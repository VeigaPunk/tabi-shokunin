#!/usr/bin/env node
// build-G9-mixed.mjs — w2 seat CritForgeV2A: one genuine run + one generated run.
//
// run1 = the committed honest round-32 run1 transcript, byte-identical (its own
// path and digest reused), run2 = v2's own goldenLines() with the honest first
// screenshot spliced in. Attacks the receipt's cross-run coherence: nothing in
// v2 requires both runs to come from the same capture.
// Usage: node build-G9-mixed.mjs --repo <clone> --rev <40hex> [--json]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const SEAT = 'CritForgeV2A';
const RECEIPT = 'corpus/evidence/round-32/bidi/receipt.json';
const HONEST_RUN1 = 'corpus/evidence/round-32/bidi/run1/transcript.jsonl';
const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };
const repo = arg('repo'); const rev = arg('rev');
if (!repo || !rev) throw new Error('--repo and --rev required');
const git = (args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const GITCFG = ['-c', `user.name=${SEAT}`, '-c', `user.email=${SEAT}@scratch.local`];
if (git(['rev-parse', '--show-toplevel']).stdout.trim() !== repo) throw new Error('--repo is not the toplevel');
if (git(['rev-parse', 'HEAD']).stdout.trim() !== rev) throw new Error('HEAD != --rev');
if (git(['status', '--porcelain']).stdout.trim()) throw new Error('dirty worktree');
const sha256 = (b) => createHash('sha256').update(b).digest('hex');

const gatePath = join(repo, 'scripts/check-bidi-runtime.mjs');
const gate = await import(pathToFileURL(gatePath).href);
const honestText = readFileSync(join(repo, HONEST_RUN1), 'utf8');
let shot = null; let cdv = null;
for (const line of honestText.split('\n')) {
  if (!line.trim()) continue;
  const o = JSON.parse(line);
  if (o.dir === 'http-res' && o.path === '/session') cdv = o.body?.value?.capabilities?.chrome?.chromedriverVersion || cdv;
  if (!shot && o.dir === 'recv' && o.frame?.result && typeof o.frame.result.data === 'string') shot = o.frame.result.data;
}
const receipt = JSON.parse(readFileSync(join(repo, RECEIPT), 'utf8'));
const genPath = 'corpus/evidence/round-32/bidi/g9/run2/transcript.jsonl';
const gen = gate.goldenLines({
  base: 'http://127.0.0.1:43777', version: receipt.browserVersion, driverVersion: cdv,
  sessionTag: 'g9-run2', wsPort: 52001,
  mutate: (steps) => { for (const s of steps) if (s[0] === 'cmd' && s[1] === 'browsingContext.captureScreenshot') s[3].data = shot; },
});
mkdirSync(join(repo, dirname(genPath)), { recursive: true });
writeFileSync(join(repo, genPath), gen);
receipt.runs = [
  { name: 'run1', transcript: HONEST_RUN1, transcriptSha256: sha256(Buffer.from(honestText)) },
  { name: 'run2', transcript: genPath, transcriptSha256: sha256(Buffer.from(gen)) },
];
writeFileSync(join(repo, RECEIPT), JSON.stringify(receipt, null, 1) + '\n');
if (git(['add', '-A']).status !== 0) throw new Error('add failed');
const ci = git([...GITCFG, 'commit', '-q', '-m', 'forge G9: one honest run + one v2 goldenLines() run']);
if (ci.status !== 0) throw new Error(ci.stderr);
console.log(JSON.stringify({ variant: 'G9', commit: git(['rev-parse', 'HEAD']).stdout.trim(), runs: receipt.runs, gateSha256: sha256(readFileSync(gatePath)) }));
