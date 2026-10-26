// forge-common.mjs — shared mechanics for the round-33 C2 next-generation forgery
// builders (seat CritForgeNext, tabi lane round 33 wave 1).
//
// Every builder takes `--repo <clone-of-the-lane>` and `--rev <40-hex>` and writes ONE
// variant commit on top of --rev inside that clone (never the lane checkout). It reads
// the lane's committed git blobs only, plus the frozen v1 gate at GOLDEN_REV for its
// goldenLines() transcript generator (the same generator round 32's battery uses).
// --tmp is the scratch dir for that pinned gate copy; nothing is written outside
// <repo> (the variant commit) and <tmp>.
//
// Identities: commits are made with -c user.name=CritForgeNext
// -c user.email=CritForgeNext@scratch.local, and the clone's toplevel is verified
// to be <repo> before the first write.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

// The round-33 baseline b7d16fb carries gate v1, whose goldenLines() round 32's frozen
// battery generates every synthetic transcript from. Pinning it keeps the builders
// independent of whatever gate bytes sit at --rev (in wave 2 that is v2).
export const GOLDEN_REV = 'b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd';
export const GOLDEN_GATE_SHA256 = '2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393';
export const GATE = 'scripts/check-bidi-runtime.mjs';
export const RECEIPT = 'corpus/evidence/round-32/bidi/receipt.json';
export const ENTRY = 'corpus/knowledge/webdriver-bidi-runtime-round-32.md';
export const SEAT = 'CritForgeNext';
export const BASE = 'd805d1d6132430118b206a848b85753ab35d1014';

const ENV = {
  PATH: process.env.PATH, HOME: process.env.HOME,
  TMPDIR: process.env.TMPDIR || tmpdir(),
  GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C', GIT_NO_REPLACE_OBJECTS: '1',
};

export const sha256 = (b) => createHash('sha256').update(b).digest('hex');

export function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'buffer', env: ENV, maxBuffer: 256 * 1024 * 1024, ...opts });
}

export function git(repo, args, { allowFail = false } = {}) {
  const r = run('git', ['-C', repo, ...args]);
  if (!allowFail && r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr.toString('utf8').trim()}`);
  return r;
}

export const out8 = (r) => r.stdout.toString('utf8').trim();

export function blob(repo, rev, path) {
  if (typeof path !== 'string' || !path || path.includes('..') || path.startsWith('/')) return null;
  const r = git(repo, ['show', `${rev}:${path}`], { allowFail: true });
  return r.status === 0 ? r.stdout : null;
}

export function parseArgs(argv, spec) {
  const o = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) throw new Error(`unexpected argument ${a}`);
    const k = a.slice(2);
    if (!Object.hasOwn(spec, k)) throw new Error(`unknown option ${a} (known: ${Object.keys(spec).join(', ')})`);
    if (spec[k] === 'bool') o[k] = true;
    else {
      const v = argv[++i];
      if (v === undefined) throw new Error(`missing value for ${a}`);
      o[k] = v;
    }
  }
  return o;
}

// Verify --repo is the clone's toplevel, HEAD == --rev and the worktree is clean.
// Refusing otherwise means a builder can never overwrite another seat's variant.
export function prepareVariant(repo, rev) {
  const top = out8(git(repo, ['rev-parse', '--show-toplevel']));
  if (top !== resolve(repo)) throw new Error(`--repo ${resolve(repo)} is not a clone toplevel (${top})`);
  if (!/^[0-9a-f]{40}$/.test(String(rev))) throw new Error('--rev must be a 40-hex commit id');
  const head = out8(git(repo, ['rev-parse', 'HEAD']));
  if (head !== rev) throw new Error(`HEAD ${head} != --rev ${rev}; the caller must reset the clone first`);
  const dirty = out8(git(repo, ['status', '--porcelain']));
  if (dirty) throw new Error(`worktree is not clean:\n${dirty}`);
  return resolve(repo);
}

export function put(repo, rel, text) {
  const p = join(repo, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
}

export function commit(repo, message) {
  git(repo, ['add', '-A']);
  git(repo, ['-c', `user.name=${SEAT}`, '-c', `user.email=${SEAT}@scratch.local`, 'commit', '-q', '--no-verify', '-m', message]);
  return out8(git(repo, ['rev-parse', 'HEAD']));
}

// Load goldenLines() from the pinned v1 gate blob, asserting its digest.
export async function loadGolden(repo, tmp) {
  const src = blob(repo, GOLDEN_REV, GATE);
  if (src === null) throw new Error(`golden gate absent at ${GOLDEN_REV}`);
  const sha = sha256(src);
  if (sha !== GOLDEN_GATE_SHA256) throw new Error(`golden gate digest mismatch: ${sha} != ${GOLDEN_GATE_SHA256}`);
  mkdirSync(tmp, { recursive: true });
  const f = join(tmp, 'golden-gate-v1.mjs');
  writeFileSync(f, src);
  return import(pathToFileURL(f).href);
}

// The honest round-32 receipt plus the bytes its two runs cite.
export function honest(repo, rev) {
  const rb = blob(repo, rev, RECEIPT);
  if (rb === null) throw new Error(`honest receipt absent at ${rev}`);
  const receipt = JSON.parse(rb.toString('utf8'));
  if (!Array.isArray(receipt.runs) || receipt.runs.length !== 2) throw new Error('honest receipt does not list two runs');
  const t1 = blob(repo, rev, receipt.runs[0].transcript);
  const t2 = blob(repo, rev, receipt.runs[1].transcript);
  if (t1 === null || t2 === null) throw new Error('honest transcripts absent');
  const firstShot = (buf) => {
    for (const line of buf.toString('utf8').split('\n')) {
      if (!line.trim()) continue;
      const o = JSON.parse(line);
      if (o.dir === 'recv' && o.frame && o.frame.type === 'success' && o.frame.result && typeof o.frame.result.data === 'string') return o.frame.result.data;
    }
    throw new Error('honest transcript has no captureScreenshot payload');
  };
  const first = JSON.parse(t1.toString('utf8').split('\n')[0]);
  const caps = first && first.body && first.body.value && first.body.value.capabilities;
  if (!caps || !caps.chrome || !caps.chrome.chromedriverVersion) throw new Error('honest transcript has no chromedriverVersion');
  // The honest classic session bodies and getTree context objects, so a builder can give a
  // synthetic transcript the same capability set and context-object shape as a real run.
  const bodies = [t1, t2].map((buf) => JSON.parse(buf.toString('utf8').split('\n')[0]).body);
  const contexts = [t1, t2].map((buf) => {
    for (const line of buf.toString('utf8').split('\n')) {
      if (!line.trim()) continue;
      const o = JSON.parse(line);
      if (o.dir === 'recv' && o.frame && o.frame.result && Array.isArray(o.frame.result.contexts)) return o.frame.result.contexts;
    }
    throw new Error('honest transcript has no getTree contexts');
  });
  return {
    receipt, t1, t2, shot: firstShot(t1), cdv: caps.chrome.chromedriverVersion,
    browserVersion: receipt.browserVersion, bodies, contexts,
  };
}

// 32 lowercase hex, ChromeDriver's session id shape (honest: 10abbb47…).
export const sid32 = () => {
  const b = [];
  for (let i = 0; i < 16; i += 1) b.push(Math.floor(Math.random() * 256));
  return Buffer.from(b).toString('hex');
};

// 32 uppercase hex, the honest browsing-context shape (31B8FE9C25C36020CBB175F250715903).
// The golden constant is the literal "C1"; a value that merely *begins* with C1 would be
// refused by a prefix-matching implementation of the same rule, so it is regenerated. The
// construction must survive the rule as written, not exploit a looser reading of it.
export const ctx32 = () => {
  let s = sid32().toUpperCase();
  while (s.startsWith('C1')) s = sid32().toUpperCase();
  return s;
};

export const port = (lo = 20000, hi = 60000) => lo + Math.floor(Math.random() * (hi - lo));

// Replace the golden generator's own constants ("C1" context) with a run's context.
export function replCtx(v, ctx) {
  if (typeof v === 'string') return v === 'C1' ? ctx : v;
  if (Array.isArray(v)) return v.map((x) => replCtx(x, ctx));
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = replCtx(x, ctx);
    return o;
  }
  return v;
}

// Rewrite the `http-res /session` line only: sessionId + matching webSocketUrl.
// Every other byte of the transcript is preserved.
export function patchSession(text, { sid, ws, body }) {
  const lines = text.split('\n');
  if (!lines[0]) throw new Error('transcript is empty');
  const first = JSON.parse(lines[0]);
  if (body) first.body = JSON.parse(JSON.stringify(body));
  const value = first && first.body && first.body.value;
  if (!value || !value.capabilities) throw new Error('first line is not a classic new-session response');
  value.sessionId = sid;
  value.capabilities.webSocketUrl = ws;
  lines[0] = JSON.stringify(first);
  return lines.join('\n');
}

// Replace literal substrings anywhere in a receipt's `observed` array.
export function patchObserved(obs, pairs) {
  let s = JSON.stringify(obs);
  for (const [a, b] of pairs) if (a) s = s.split(a).join(b);
  return JSON.parse(s);
}

export const observedWs = (obs) => {
  const step = (obs || []).find((x) => x.step === 'session');
  return step && step.value && step.value.webSocketUrl;
};

export const observedBase = (obs) => {
  const step = (obs || []).find((x) => x.step === 'navigate /a.html');
  const u = step && step.value;
  try { return new URL(u).origin; } catch { return null; }
};

// Common CLI footer: every builder prints one JSON object with --json.
export function emit(o, json) {
  if (json) console.log(JSON.stringify(o));
  else {
    console.log(`${o.variant} commit=${o.commit}`);
    for (const f of o.files) console.log(`  wrote ${f.path} sha256=${f.sha256.slice(0, 16)}… (${f.bytes} B)`);
    for (const [k, v] of Object.entries(o.attack || {})) console.log(`  ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`);
  }
}
