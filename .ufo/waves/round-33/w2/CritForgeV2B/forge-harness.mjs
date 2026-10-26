#!/usr/bin/env node
// CritForgeV2B forge harness — round 33 wave 2. Attacks gate v2 at REV offline and --live.
// Variants: A1 (real transcript copied, ids rewritten), B1 (allow-listed-import driver that never ran),
// C1 (RerunDriver pair with run-name swap + identical-bytes driver copy).
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const REV = '042d6d9abf97d567d495652a85eabc851b81adc1';
const BASE = 'd805d1d6132430118b206a848b85753ab35d1014';
const GOLDEN = 'b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd';
const GATE = 'scripts/check-bidi-runtime.mjs';
const ENTRY = 'corpus/knowledge/webdriver-bidi-runtime-round-32.md';
const RECEIPT = 'corpus/evidence/round-32/bidi/receipt.json';
const EVD = 'corpus/evidence/round-32/bidi';
const RERUN = '.ufo/waves/round-32/w2/RerunDriver/bidi-run';

const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR || tmpdir(), GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C', GIT_NO_REPLACE_OBJECTS: '1' };

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'buffer', env: ENV, maxBuffer: 256 * 1024 * 1024, ...opts });
}
function git(repo, args, { allowFail = false } = {}) {
  const r = run('git', ['-C', repo, '-c', 'user.name=CritForgeV2B', '-c', 'user.email=CritForgeV2B@scratch.local', '-c', 'commit.gpgsign=false', ...args]);
  if (r.status !== 0 && !allowFail) throw new Error(`git ${args.join(' ')}: ${r.stderr.toString('utf8').trim()}`);
  return r;
}
const out8 = (r) => r.stdout.toString('utf8').trim();
function blob(repo, rev, path) {
  const r = git(repo, ['show', `${rev}:${path}`], { allowFail: true });
  if (r.status !== 0) throw new Error(`${path} absent at ${rev}`);
  return r.stdout;
}

// --- transcript id inspection / rewriting -----------------------------------
function sessionAndContexts(buf) {
  const first = JSON.parse(buf.toString('utf8').split('\n')[0]);
  const v = first.body.value;
  return { sid: v.sessionId, ws: v.capabilities.webSocketUrl };
}
function rewriteDeep(node, map) {
  if (typeof node === 'string') return Object.hasOwn(map, node) ? map[node] : node;
  if (Array.isArray(node)) return node.map((x) => rewriteDeep(x, map));
  if (node && typeof node === 'object') {
    const o = {};
    for (const [k, val] of Object.entries(node)) o[k] = rewriteDeep(val, map);
    return o;
  }
  return node;
}
function allContextIds(buf) {
  const ids = new Set();
  for (const line of buf.toString('utf8').split('\n')) {
    if (!line.trim()) continue;
    const o = JSON.parse(line);
    const f = o.frame;
    if (!f) continue;
    const p = f.params || {};
    if (typeof p.context === 'string') ids.add(p.context);
    if (p.target && typeof p.target.context === 'string') ids.add(p.target.context);
    if (f.result && Array.isArray(f.result.contexts)) for (const c of f.result.contexts) if (c && typeof c.context === 'string') ids.add(c.context);
  }
  return [...ids];
}
// first successful captureScreenshot bytes and chromedriverVersion (mirrors the gate's view)
function firstShot(buf) {
  const ids = new Set();
  for (const line of buf.toString('utf8').split('\n')) {
    if (!line.trim()) continue;
    const o = JSON.parse(line);
    if (o.dir === 'send' && o.frame && o.frame.method === 'browsingContext.captureScreenshot') ids.add(o.frame.id);
    if (o.dir === 'recv' && o.frame && ids.has(o.frame.id) && o.frame.type === 'success' && o.frame.result && o.frame.result.data) return o.frame.result.data;
  }
  return null;
}

function patchGate(fx) {
  const gp = join(fx, GATE);
  let g = readFileSync(gp, 'utf8');
  const before = g;
  g = g.replace('  if (spec.startsWith("/")) return false;\n', '');
  g = g.replace(
    '  for (const s of importSpecs(text)) {\n    if (!resolvesToGate(s.spec, driverPath)) continue;',
    '  for (const m of text.matchAll(/\\bimport\\s*\\(\\s*["\']([^"\']+)["\']\\s*\\)/g)) {\n    if (resolvesToGate(m[1], driverPath)) return `driver dynamically imports this gate (${m[1]})`;\n  }\n  for (const s of importSpecs(text)) {\n    if (!resolvesToGate(s.spec, driverPath)) continue;',
  );
  if (g === before) throw new Error('gate patch did not apply');
  writeFileSync(gp, g);
  return { removedAbsoluteEarlyReturn: !g.includes('spec.startsWith("/") return false'), addedDynamicImportScan: g.includes('driver dynamically imports this gate') };
}

function makeFixture(lane, dir) {
  const clone = join(dir, 'fixture');
  const c = run('git', ['clone', '-q', '--shared', '--no-checkout', lane, clone]);
  if (c.status !== 0) throw new Error(`clone failed: ${c.stderr.toString('utf8')}`);
  if (out8(git(clone, ['rev-parse', '--show-toplevel'])) !== clone) throw new Error('fixture toplevel mismatch');
  git(clone, ['checkout', '-q', '--force', '--detach', REV]);
  return clone;
}

function main() {
  const argv = process.argv.slice(2);
  const o = { lane: null, variant: null, live: false, keep: false, gatePatch: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--live') o.live = true;
    else if (a === '--gate-patch') o.gatePatch = true;
    else if (a === '--keep') o.keep = true;
    else if (a === '--lane' || a === '--variant') o[a.slice(2)] = argv[++i];
    else throw new Error(`unknown argument ${a}`);
  }
  if (!o.lane || !o.variant) throw new Error('usage: --lane <checkout> --variant <A1|B1|C1> [--live]');
  const lane = resolve(o.lane);
  const dir = mkdtempSync(join(ENV.TMPDIR, 'tabi-r33-cfv2b-'));
  try {
    const fx = makeFixture(lane, dir);
    const gateSha = sha256(blob(lane, REV, GATE));
    const receipt = JSON.parse(blob(lane, REV, RECEIPT).toString('utf8'));
    const t1 = blob(lane, REV, receipt.runs[0].transcript);
    const t2 = blob(lane, REV, receipt.runs[1].transcript);
    const put = (rel, buf) => { const abs = join(fx, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, buf); };
    const putReceipt = (obj) => put(RECEIPT, JSON.stringify(obj, null, 1) + '\n');
    const commit = (msg) => { git(fx, ['add', '-A']); git(fx, ['commit', '-q', '--no-verify', '-m', msg]); return out8(git(fx, ['rev-parse', 'HEAD'])); };
    const detail = {};

    if (o.variant === 'H0') {
      detail.h0 = { unchanged: true };
    } else if (o.variant === 'A1') {
      // run1 = the real round-32 run1 transcript, unmodified.
      // run2 = a copy of run1 with newSession sessionId + webSocketUrl and every browsing-context id
      //        rewritten to fresh ChromeDriver-shaped values. No second browser session exists.
      const { sid: oldSid, ws: oldWs } = sessionAndContexts(t1);
      const oldCtxs = allContextIds(t1);
      const newSid = sha256('cfv2b-A1-run2').slice(0, 32);
      const newWs = 'ws://127.0.0.1:37777/session/' + newSid;
      const ctxMap = {};
      oldCtxs.forEach((c, i) => { ctxMap[c] = sha256(`cfv2b-A1-ctx-${i}`).toUpperCase().slice(0, 32); });
      const map = { [oldSid]: newSid, [oldWs]: newWs, ...ctxMap };
      const lines = t1.toString('utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.stringify(rewriteDeep(JSON.parse(l), map)));
      const copy = Buffer.from(lines.join('\n') + '\n');
      const a = `${EVD}/a1/run1/transcript.jsonl`;
      const b = `${EVD}/a1/run2/transcript.jsonl`;
      put(a, t1); put(b, copy);
      putReceipt({ ...receipt, runs: [
        { ...receipt.runs[0], name: 'run1', transcript: a, transcriptSha256: sha256(t1) },
        { ...receipt.runs[1], name: 'run2', transcript: b, transcriptSha256: sha256(copy) },
      ] });
      detail.a1 = { oldSid, newSid, oldWs, newWs, contexts: ctxMap, run2Sha: sha256(copy), oldTokensRemaining: (copy.toString('utf8').match(new RegExp(oldSid, 'g')) || []).length, sharedPagePort: true };
    } else if (o.variant === 'B1') {
      // A driver that imports only allow-listed gate symbols and whose body throws at import time:
      // it provably never executed a session, yet the receipt names it as the driver of the two runs.
      const drv = Buffer.from([
        '// b1: imports only the gate allow-list (FIXTURE_SHA256, VIEWPORT, serveFixture).',
        'import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "../../../../scripts/check-bidi-runtime.mjs";',
        'void FIXTURE_SHA256; void VIEWPORT; void serveFixture;',
        'throw new Error("b1 driver never executed: this module cannot open a session");',
        '',
      ].join('\n'));
      const p = `${EVD}/b1-driver.mjs`;
      put(p, drv); put(`${EVD}/b1/run1/transcript.jsonl`, t1); put(`${EVD}/b1/run2/transcript.jsonl`, t2);
      putReceipt({ ...receipt, driver: p, driverSha256: sha256(drv), runs: [
        { ...receipt.runs[0], transcript: `${EVD}/b1/run1/transcript.jsonl`, transcriptSha256: sha256(t1) },
        { ...receipt.runs[1], transcript: `${EVD}/b1/run2/transcript.jsonl`, transcriptSha256: sha256(t2) },
      ] });
      detail.b1 = { driver: p, driverSha256: sha256(drv), driverText: drv.toString('utf8') };
    } else if (o.variant === 'D1' || o.variant === 'D2') {
      // Driver that imports the gate's verdict symbol through a specifier form the scan ignores:
      // D1 absolute path (resolvesToGate early-returns false for "/..."), D2 a literal dynamic import
      // (importSpecs matches only static import/export lines). Both are static text, not "computed".
      const abs = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-bidi-runtime.mjs';
      const text = o.variant === 'D1'
        ? `import { evaluate } from "${abs}";\nvoid evaluate;\n`
        : `const gate = await import("${abs}");\nvoid gate.evaluate;\n`;
      const drv = Buffer.from(text);
      const p = `${EVD}/${o.variant.toLowerCase()}-driver.mjs`;
      put(p, drv); put(`${EVD}/${o.variant}/run1/transcript.jsonl`, t1); put(`${EVD}/${o.variant}/run2/transcript.jsonl`, t2);
      putReceipt({ ...receipt, driver: p, driverSha256: sha256(drv), runs: [
        { ...receipt.runs[0], transcript: `${EVD}/${o.variant}/run1/transcript.jsonl`, transcriptSha256: sha256(t1) },
        { ...receipt.runs[1], transcript: `${EVD}/${o.variant}/run2/transcript.jsonl`, transcriptSha256: sha256(t2) },
      ] });
      detail[o.variant.toLowerCase()] = { driver: p, driverSha256: sha256(drv), driverText: text };
    } else if (o.variant === 'H2h') {
      const r1 = blob(lane, GOLDEN, `${RERUN}/run1/transcript.jsonl`);
      const r2 = blob(lane, GOLDEN, `${RERUN}/run2/transcript.jsonl`);
      const a = `${EVD}/h2h/run1/transcript.jsonl`; const b = `${EVD}/h2h/run2/transcript.jsonl`;
      put(a, r1); put(b, r2);
      putReceipt({ ...receipt, runs: [
        { ...receipt.runs[0], name: 'run1', transcript: a, transcriptSha256: sha256(r1) },
        { ...receipt.runs[1], name: 'run2', transcript: b, transcriptSha256: sha256(r2) },
      ] });
      detail.h2h = { run1Path: a, run2Path: b };
    } else if (o.variant === 'C1') {
      // The round-32 w2 RerunDriver pair, names swapped, and the receipt's driver pointed at an
      // identical-bytes copy of scripts/bidi-loopback-round32.mjs.
      const r1 = blob(lane, GOLDEN, `${RERUN}/run1/transcript.jsonl`);
      const r2 = blob(lane, GOLDEN, `${RERUN}/run2/transcript.jsonl`);
      const a = `${EVD}/c1/run1/transcript.jsonl`;
      const b = `${EVD}/c1/run2/transcript.jsonl`;
      put(a, r1); put(b, r2);
      const orig = blob(lane, REV, 'scripts/bidi-loopback-round32.mjs');
      const p = `${EVD}/c1-driver.mjs`;
      put(p, orig); // identical bytes at a different path
      putReceipt({ ...receipt, driver: p, driverSha256: sha256(orig), runs: [
        { name: 'run2', transcript: a, transcriptSha256: sha256(r1) },
        { name: 'run1', transcript: b, transcriptSha256: sha256(r2) },
      ] });
      detail.c1 = { driverOrig: 'scripts/bidi-loopback-round32.mjs', driverNew: p, sameBytes: true, driverSha256: sha256(orig), run1Path: a, run1Name: 'run2', run2Path: b, run2Name: 'run1', shotA: firstShot(r1), shotB: firstShot(r2) };
    } else throw new Error(`unknown variant ${o.variant}`);

    if (o.gatePatch) detail.gatePatch = patchGate(fx);
    const target = commit(`cfv2b ${o.variant}`);
    const onDisk = readFileSync(join(fx, GATE));
    if (!o.gatePatch && sha256(onDisk) !== gateSha) throw new Error('variant changed the gate bytes');
    const args = [join(fx, GATE), '--repo', fx, '--rev', target, '--baseline', BASE, '--entry', ENTRY, '--receipt', RECEIPT, '--json'];
    if (o.live) args.push('--live');
    const t0 = Date.now();
    const r = run(process.execPath, args, { cwd: fx });
    let j = null;
    try { j = JSON.parse(r.stdout.toString('utf8')); } catch { /* not JSON */ }
    const out = {
      variant: o.variant, live: o.live, fixture: fx, commit: target, gateSha256: gateSha,
      elapsedMs: Date.now() - t0, exit: r.status,
      stdout: r.stdout.toString('utf8').slice(0, 4000), stderr: r.stderr.toString('utf8').slice(0, 2000),
      population: j && j.population, admitted: j && j.admitted, failing: j && j.failing, unmeasured: j && j.unmeasured,
      entryFinding: j && j.entryFinding, binding: j && j.binding, clean: j && j.clean,
      reasons: j && Array.isArray(j.rows) ? [...new Set(j.rows.map((x) => x.reason).filter(Boolean))].sort() : [],
      nonAdmitted: j && Array.isArray(j.rows) ? j.rows.filter((x) => !x.admitted).map((x) => ({ id: x.id, reason: x.reason, detail: x.detail })).slice(0, 5) : [],
      provenance: j && j.provenance, driverImports: j && j.driverImports,
      detail,
    };
    console.log(JSON.stringify(out, null, 1));
    if (!o.keep) rmSync(dir, { recursive: true, force: true });
    process.exit(0);
  } catch (e) {
    if (!o.keep) rmSync(dir, { recursive: true, force: true });
    console.error('FORGE_ERROR ' + e.message);
    process.exit(2);
  }
}
main();
