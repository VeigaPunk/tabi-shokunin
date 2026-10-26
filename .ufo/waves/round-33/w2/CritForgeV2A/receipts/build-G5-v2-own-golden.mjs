#!/usr/bin/env node
// build-G5-v2-own-golden.mjs — w2 seat CritForgeV2A, round-33 tabi lane.
//
// Attacked construction G5: a receipt whose two runs are generated VERBATIM by
// v2's own exported goldenLines() (the gate's admit-satisfying test fixture),
// with only two edits: the first captureScreenshot payload is the honest
// round-32 run1 screenshot (base64, unchanged) and the driverVersion is the
// honest chromedriver string. Session/context ids are whatever v2's generator
// derives — 32-lowercase-hex session id bound to a ws://127.0.0.1:<port>/session/<id>
// url, per-run base and per-run port, distinct sessionTags.
//
// Writes ONE commit on top of <rev> inside <repo> (a clone), never the lane.
// Usage: node build-G5-v2-own-golden.mjs --repo <clone> --rev <40hex> [--json]
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
const repo = arg('repo'); const rev = arg('rev'); const json = argv.includes('--json');
const shotMode = arg('shot') || 'honest';
const tell = arg('tell') || 'none';
if (!['honest','synthetic'].includes(shotMode)) throw new Error('--shot must be honest or synthetic');
if (!repo || !rev) throw new Error('--repo and --rev required');

const GITCFG = ['-c', `user.name=${SEAT}`, '-c', `user.email=${SEAT}@scratch.local`];
const git = (args, opts = {}) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts });
const top = git(['rev-parse', '--show-toplevel']);
if (top.status !== 0 || top.stdout.trim() !== repo) throw new Error(`--repo is not the clone toplevel: ${top.stdout}`);
const head = git(['rev-parse', 'HEAD']).stdout.trim();
if (head !== rev) throw new Error(`clone HEAD ${head} != --rev ${rev}`);
if (git(['status', '--porcelain']).stdout.trim()) throw new Error('clone worktree is dirty');

const sha256 = (b) => createHash('sha256').update(b).digest('hex');

// v2's own generator, imported from the committed gate in this clone.
const gatePath = join(repo, 'scripts/check-bidi-runtime.mjs');
const gate = await import(pathToFileURL(gatePath).href);
if (typeof gate.goldenLines !== 'function') throw new Error('gate exports no goldenLines');

// The honest round-32 run1 first captureScreenshot payload, byte-for-byte.
const honestText = readFileSync(join(repo, HONEST_RUN1), 'utf8');
let honestShot = null; let honestDriverVersion = null;
for (const line of honestText.split('\n')) {
  if (!line.trim()) continue;
  const o = JSON.parse(line);
  if (o.dir === 'http-res' && o.path === '/session') honestDriverVersion = o.body?.value?.capabilities?.chrome?.chromedriverVersion || honestDriverVersion;
  if (honestShot === null && o.dir === 'recv' && o.frame && o.frame.type === 'success' && o.frame.result && typeof o.frame.result.data === 'string') honestShot = o.frame.result.data;
}
if (!honestShot) throw new Error('no captureScreenshot payload in the honest run1 transcript');
if (!honestDriverVersion) throw new Error('no chromedriverVersion in the honest run1 transcript');

const receipt = JSON.parse(readFileSync(join(repo, RECEIPT), 'utf8'));

const mk = (i) => {
  const shared = tell === 'shared';
  const base = `http://127.0.0.1:${shared ? 41000 : 41000 + i * 1117}`;
  const wsPort = shared ? 51000 : 51000 + i * 997;
  const sid = sha256(`g5-session:${i}`).slice(0, 32);
  const ctx = (shared ? sha256('g5-context:0') : sha256(`g5-context:${i}`)).toUpperCase().slice(0, 32);
  const text = gate.goldenLines({
    base, version: receipt.browserVersion, driverVersion: honestDriverVersion,
    sessionTag: `g5-run${i + 1}`, sessionId: sid, contextId: ctx, wsPort,
    mutate: (steps) => {
      if (shotMode === 'honest') for (const s of steps) if (s[0] === 'cmd' && s[1] === 'browsingContext.captureScreenshot') s[3].data = honestShot;
    },
  });
  return { name: `run${i + 1}`, path: `corpus/evidence/round-32/bidi/g5/run${i + 1}/transcript.jsonl`, text, base, wsPort, sid, ctx };
};

const runs = [mk(0), mk(1)];
for (const r of runs) {
  mkdirSync(join(repo, dirname(r.path)), { recursive: true });
  writeFileSync(join(repo, r.path), r.text);
}
receipt.runs = runs.map((r) => ({ name: r.name, transcript: r.path, transcriptSha256: sha256(Buffer.from(r.text)) }));
writeFileSync(join(repo, RECEIPT), JSON.stringify(receipt, null, 1) + '\n');

const add = git(['add', '-A']); if (add.status !== 0) throw new Error(add.stderr);
const ci = git([...GITCFG, 'commit', '-q', '-m', `forge ${tell === 'shared' ? 'G8 shared-tells' : shotMode === 'honest' ? 'G5' : 'G7'} : v2 goldenLines() runs`]);
if (ci.status !== 0) throw new Error(ci.stderr);
const commit = git(['rev-parse', 'HEAD']).stdout.trim();

const out = {
  variant: tell === 'shared' ? 'G8' : shotMode === 'honest' ? 'G5' : 'G7', commit, base: rev, shotMode, tell,
  gateSha256: sha256(readFileSync(gatePath)),
  honestScreenshotSha256: shotMode === 'honest' ? sha256(Buffer.from(honestShot, 'base64')) : null,
  runs: runs.map((r) => ({ name: r.name, sessionId: r.sid, contextId: r.ctx, wsPort: r.wsPort, base: r.base, path: r.path, sha256: sha256(Buffer.from(r.text)), bytes: Buffer.byteLength(r.text) })),
  receiptSha256: sha256(readFileSync(join(repo, RECEIPT))),
};
if (json) console.log(JSON.stringify(out));
else console.log(`G5 commit=${commit} gate=${out.gateSha256.slice(0, 12)} shot=${out.honestScreenshotSha256.slice(0, 12)}`);
