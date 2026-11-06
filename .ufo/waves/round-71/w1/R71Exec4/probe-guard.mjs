#!/usr/bin/env node
// R71Exec4 host-robustness probe: Chromium singleton-socket length guard in
// chrome-cdp-synthpinch-round71.mjs (validateScratch, lines 48-61).
// Sentinel method: pass a syntactically invalid --nonce so the driver exits 2 with the
// nonce detail iff the scratch guard ACCEPTED the path; a scratch refusal is reported
// first, so the two exit-2 causes are distinguishable without launching Chromium.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = '/fast/scratch/hyaku/tabi-r71/R71Exec4';
const DRIVER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-synthpinch-round71.mjs';
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });
const SUFFIX = '/org.chromium.Chromium.XXXXXX/SingletonSocket';
const sockBytes = (real) => Buffer.byteLength(path.join(real, 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));

function mkLen(L, tag, baseDir = null) {
  const base = baseDir || path.join(ROOT, 'bisect', tag);
  fs.mkdirSync(base, { recursive: true });
  const baseLen = Buffer.byteLength(fs.realpathSync(base));
  const need = L - baseLen - 1;
  if (need < 1 || need > 255) throw new Error('cannot build L=' + L + ' under ' + base + ' (need ' + need + ')');
  const dir = path.join(base, 'd'.repeat(need));
  fs.mkdirSync(dir, { recursive: true });
  const rp = fs.realpathSync(dir);
  const got = Buffer.byteLength(rp);
  if (got !== L) throw new Error('length mismatch: wanted ' + L + ' got ' + got);
  return { dir, real: rp, len: got, sock: sockBytes(rp) };
}

function runDriver(scratch, extra = [], tag = 'sentinel') {
  const out = path.join(OUT, tag + '.json');
  const args = [DRIVER, '--scratch', scratch, '--out', out, '--nonce', 'bad'];
  const t0 = process.hrtime.bigint();
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 120000 });
  const ms = Math.round(Number(process.hrtime.bigint() - t0) / 1e6);
  let detail = null, err = null;
  try { const j = JSON.parse((r.stderr || '').trim().split('\n').pop()); detail = j.detail; err = j.error; } catch {}
  const accepted = typeof detail === 'string' && detail.includes('--nonce must be');
  const refused = typeof detail === 'string' && detail.includes('singleton socket');
  return { status: r.status, signal: r.signal, ms, detail, error: err, accepted, refused, receiptWritten: fs.existsSync(out) };
}

const results = { schema: 'r71exec4-guard-probe', driver: DRIVER, driverSha256: null, bisection: [], boundary: {}, symlinks: {} };
results.driverSha256 = (await import('node:crypto')).createHash('sha256').update(fs.readFileSync(DRIVER)).digest('hex');

// Bisection over realpath byte length L; invariant: lo accepted, hi refused.
let lo = 50, hi = 80;
const probe = (L) => { const d = mkLen(L, 'b' + L); const r = runDriver(d.dir, [], 'bisect-' + L); return { L, real: d.real, sock: d.sock, ...r }; };
const pLo = probe(lo); const pHi = probe(hi);
results.bisection.push(pLo, pHi);
if (!pLo.accepted) throw new Error('invariant broken: L=50 not accepted: ' + JSON.stringify(pLo));
if (!pHi.refused) throw new Error('invariant broken: L=80 not refused: ' + JSON.stringify(pHi));
while (hi - lo > 1) {
  const mid = Math.floor((lo + hi) / 2);
  const p = probe(mid);
  results.bisection.push(p);
  if (p.accepted) lo = mid; else if (p.refused) hi = mid; else throw new Error('unexpected outcome at L=' + mid + ': ' + JSON.stringify(p));
}
results.boundary = { maxAcceptedRealpathLen: lo, maxAcceptedSockBytes: lo + 45, minRefusedRealpathLen: hi, minRefusedSockBytes: hi + 45 };

// Explicit boundary confirmations (fresh dirs, distinct tags).
results.boundary.acceptAtLo = probe(lo);
results.boundary.refuseAtHi = probe(hi);

// Symlink A: short literal path -> long real target (realpath guard must refuse).
{
  const target = mkLen(70, 'symtarget');
  const link = path.join(ROOT, 'sym', 'short-link');
  try { fs.unlinkSync(link); } catch {}
  fs.symlinkSync(target.dir, link);
  const literal = Buffer.byteLength(path.join(link, 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
  const r = runDriver(link, [], 'sym-short-to-long');
  results.symlinks.shortLiteralToLongReal = { link, linkLen: Buffer.byteLength(link), literalSockBytes: literal, real: fs.realpathSync(link), realSockBytes: sockBytes(fs.realpathSync(link)), ...r };
}
// Symlink B: long literal path -> short real target (realpath guard must accept).
{
  const target = mkLen(42, 'x', path.join(ROOT, 'x'));
  const link = path.join(ROOT, 'sym', 'L'.repeat(60));
  try { fs.unlinkSync(link); } catch {}
  fs.symlinkSync(target.dir, link);
  const literal = Buffer.byteLength(path.join(link, 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
  const r = runDriver(link, [], 'sym-long-to-short');
  results.symlinks.longLiteralToShortReal = { link, linkLen: Buffer.byteLength(link), literalSockBytes: literal, real: fs.realpathSync(link), realSockBytes: sockBytes(fs.realpathSync(link)), ...r };
}
// Symlink chain: link -> link -> long target.
{
  const target = mkLen(70, 'symtarget');
  const l1 = path.join(ROOT, 'sym', 'chain-a');
  const l2 = path.join(ROOT, 'sym', 'chain-b');
  for (const l of [l1, l2]) { try { fs.unlinkSync(l); } catch {} }
  fs.symlinkSync(target.dir, l1); fs.symlinkSync(l1, l2);
  const r = runDriver(l2, [], 'sym-chain');
  results.symlinks.chain = { link: l2, real: fs.realpathSync(l2), realSockBytes: sockBytes(fs.realpathSync(l2)), ...r };
}
console.log(JSON.stringify(results, null, 1));
