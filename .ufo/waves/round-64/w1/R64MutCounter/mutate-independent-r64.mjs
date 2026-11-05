#!/usr/bin/env node
// Seat R64MutCounter — INDEPENDENT exact-line mutation matrix over the frozen
// round-64 counter. Not derived from .ufo/waves/round-64/counters/mutate-r64.mjs:
// every mutant below targets a conjunct the frozen harness does not touch, and
// each mutant carries its own targeted forgery (a receipt that violates exactly
// the dropped conjunct) so a "survivor against declared negatives" can still be
// classified as dangerous rather than merely unobserved.
//
// Direction is LOOSENING only: drop a conjunct, widen a bound, drop a pixel
// comparison, drop a finding push, weaken a polarity.
//
// Usage:
//   node mutate-independent-r64.mjs run --counter <c.mjs> --driver <d.mjs>
//     --negatives <dir> --red-before <dir> --receipt <live.json> --shot <dir> --out <dir> [--json]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
if (argv[0] !== 'run') { console.log(JSON.stringify({ error: 'usage', detail: 'mutate-independent-r64.mjs run --counter ... --out ...' })); process.exit(2); }
const flags = new Map();
for (let i = 1; i < argv.length; i++) {
  if (argv[i].startsWith('--')) { const n = argv[i + 1]; if (n && !n.startsWith('--')) { flags.set(argv[i].slice(2), n); i++; } else flags.set(argv[i].slice(2), true); }
}
const opt = (n) => (flags.get(n) === true ? null : flags.get(n) || null);
const counterPath = path.resolve(opt('counter'));
const driverPath = path.resolve(opt('driver'));
const negDir = path.resolve(opt('negatives'));
const redDir = path.resolve(opt('red-before'));
const receiptPath = path.resolve(opt('receipt'));
const shotDir = path.resolve(opt('shot'));
const outDir = path.resolve(opt('out'));
fs.mkdirSync(outDir, { recursive: true });
const driverSha = sha(fs.readFileSync(driverPath));
const pristineSrc = fs.readFileSync(counterPath, 'utf8');
const pristineSha = sha(Buffer.from(pristineSrc));
const pngSrc = fs.readFileSync(path.join(path.dirname(counterPath), 'png-r64.mjs'), 'utf8');

// pristine module exports are reused only to BUILD forgeries (drawShot/renderFixture);
// the mutant under test is always a separate file on disk.
const mod = await import(path.join(path.dirname(counterPath), 'png-r64.mjs'));
const counterMod = await import(counterPath);
const { encode } = mod;
const { drawShot, renderFixture, LEG_WITNESS } = counterMod;

const LEG_ORDER = ['start', 'down1', 'down2', 'up1', 'swallowed', 'released'];
const SCROLL = { start: 0, down1: 120, down2: 240, up1: 120, swallowed: 120, released: 240 };

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

// ---------- targeted forgeries ----------
// Each returns a {dir, receipt} describing a forged input that violates exactly
// the conjunct the mutant drops. Shots are copied from the live smoke set unless
// the forgery has to repaint/regenerate one.
function mkForgeDir(id, r, shotSource, mutateShots) {
  const dir = path.join(outDir, id, 'forge');
  fs.mkdirSync(dir, { recursive: true });
  const files = fs.readdirSync(shotSource).filter((f) => f.endsWith('.png'));
  for (const f of files) fs.copyFileSync(path.join(shotSource, f), path.join(dir, f));
  if (mutateShots) mutateShots(dir, r);
  fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify(r, null, 1));
  return dir;
}
function rewriteShot(dir, name, pixels) {
  const buf = encode({ width: 1280, height: 900, pixels });
  fs.writeFileSync(path.join(dir, name), buf);
  const leg = JSON.parse(fs.readFileSync(path.join(dir, 'receipt.json'), 'utf8')).legs.find((l) => l.shot === name);
  const info = mod.decode(buf);
  leg.shotSha256 = sha(buf); leg.shotBytes = buf.length;
  const rp = path.join(dir, 'receipt.json');
  const all = readJSON(rp);
  all.legs.find((l) => l.shot === name).shotSha256 = leg.shotSha256;
  all.legs.find((l) => l.shot === name).shotBytes = leg.shotBytes;
  fs.writeFileSync(rp, JSON.stringify(all, null, 1));
  void info;
}
function decodeToPixels(buf) {
  const d = mod.decode(buf);
  const px = Buffer.alloc(d.width * d.height * 4);
  for (let y = 0; y < d.height; y++) for (let x = 0; x < d.width; x++) {
    const p = d.pixel(x, y); const i = (y * d.width + x) * 4;
    px[i] = p[0]; px[i + 1] = p[1]; px[i + 2] = p[2]; px[i + 3] = p[3];
  }
  return { px, w: d.width, h: d.height };
}

const MUTANTS = [
  // ---- structural conjuncts ----
  {
    id: 'X01-legs-shape-drop-length', check: 'legs-shape',
    find: `legs.length === 6 && LEG_NAMES.every((n, i) => legs[i]?.name === n)`,
    replace: `LEG_NAMES.every((n, i) => legs[i]?.name === n)`,
    forge: (r) => { r.legs.push(clone(r.legs[0])); },
  },
  {
    id: 'X02-wheellog-seq-drop-set-uniqueness', check: 'wheellog-sequence',
    find: ` && new Set(wl.map((e) => e.seq)).size === 5`,
    replace: ``,
    forge: null, // dead: seq === i+1 already forces uniqueness
  },
  {
    id: 'X03-wheellog-count-widen-ge', check: 'wheellog-count',
    find: `LEG_NAMES.every((k) => legMap[k]?.wheellogLen === EXPECTED_LEN[k])`,
    replace: `LEG_NAMES.every((k) => legMap[k]?.wheellogLen >= EXPECTED_LEN[k])`,
    forge: (r) => { r.legs[4].wheellogLen = 5; },
  },
  {
    id: 'X04-delta-y-drop-length', check: 'delta-y-passthrough',
    find: `check(wl.length === 5 && wl.every((e, i) => e.deltaY === EXPECTED_DELTA_Y[i]), 'delta-y-passthrough');`,
    replace: `check(wl.every((e, i) => e.deltaY === EXPECTED_DELTA_Y[i]), 'delta-y-passthrough');`,
    forge: null, // dead: six sibling checks already pin wl.length === 5
  },
  {
    id: 'X05-delta-mode-drop-deltaz', check: 'delta-mode-pixels',
    find: `e.deltaX === 0 && e.deltaZ === 0`,
    replace: `e.deltaX === 0`,
    forge: (r) => { r.wheellog[1].deltaZ = 3; },
  },
  {
    id: 'X06-trusted-drop-cancelable', check: 'trusted-fields',
    find: ` && e.cancelable === true`,
    replace: ``,
    forge: (r) => { r.wheellog[2].cancelable = false; },
  },
  {
    id: 'X07-trusted-drop-type', check: 'trusted-fields',
    find: `e.type === 'wheel' && `,
    replace: ``,
    forge: (r) => { r.wheellog[0].type = 'scroll'; },
  },
  {
    id: 'X08-loopback-drop-dsf', check: 'loopback-origin',
    find: ` && r?.fixture?.deviceScaleFactor === 1`,
    replace: ``,
    forge: (r) => { r.fixture.deviceScaleFactor = 2; },
  },
  {
    id: 'X09-loopback-drop-bandheight', check: 'loopback-origin',
    find: ` && r?.fixture?.bandHeight === BAND_HEIGHT`,
    replace: ``,
    forge: (r) => { r.fixture.bandHeight = 60; },
  },
  {
    id: 'X10-server-witness-drop-path-allowlist', check: 'server-witness',
    find: ` && r.serverLog.every((e) => ['/', '/favicon.ico'].includes(e.path))`,
    replace: ``,
    forge: (r) => { r.serverLog.push({ path: '/../../etc/passwd', query: '', run: '', status: 200 }); },
  },
  {
    id: 'X11-survivors-drop-list', check: 'survivors',
    find: ` && r.teardown.survivors.length === 0`,
    replace: ``,
    forge: (r) => { r.teardown.survivors = ['pid 4242 chromium']; },
  },
  {
    id: 'X12-closed-ports-drop-portprobes', check: 'closed-ports',
    find: `r?.teardown?.portProbes?.fixture === 'closed' && r.teardown.portProbes.devtools === 'closed'`,
    replace: `true`,
    forge: (r) => { r.teardown.portProbes = { fixture: 'open', devtools: 'open' }; },
  },
  {
    id: 'X13-launch-witness-drop-postkill', check: 'launch-witness',
    find: ` && r.sweeps.postKill === 0`,
    replace: ``,
    forge: (r) => { r.sweeps.postKill = 2; },
  },
  {
    id: 'X14-page-final-state-drop-wheelloglen', check: 'page-final-state',
    find: ` && r?.pageState?.wheellogLen === 5`,
    replace: ``,
    forge: (r) => { r.pageState.wheellogLen = 9; },
  },
  {
    id: 'X15-producer-verdict-drop-hypothesis', check: 'producer-verdict',
    find: `r?.predicate === true && r?.wheelHypothesis === 'CONFIRMED'`,
    replace: `r?.predicate === true`,
    forge: (r) => { r.wheelHypothesis = 'REFUTED'; },
  },
  {
    id: 'X16-host-identity-drop-version-agreement', check: 'host-identity',
    find: `r.host.chromium.split(' ')[1]?.split('.')[0] === r.host.cdpProduct.split('/')[1]?.split('.')[0]`,
    replace: `true`,
    forge: (r) => { r.host.chromium = 'Chromium 150.0.1 Linux'; },
  },
  // ---- pixel comparisons ----
  {
    id: 'X17-nonce-pixels-drop-blue', check: 'nonce-pixels',
    find: `p[0] !== want || p[1] !== want || p[2] !== want`,
    replace: `p[0] !== want || p[1] !== want`,
    forge: (r) => {}, forgeShots: (dir, r) => {
      // flip ONLY the blue channel of one grid sample in down1.png
      const buf = fs.readFileSync(path.join(dir, 'down1.png'));
      const { px, w } = decodeToPixels(buf);
      const x = 8 + 2, y = 8 + 2; const i = (y * w + x) * 4;
      px[i + 2] = 255 - px[i + 2];
      rewriteShot(dir, 'down1.png', px);
    },
  },
  {
    id: 'X18-scroll-pixels-first-sample-only', check: 'scroll-pixels',
    find: `return BAND_SAMPLE_Y.every((y, k) => rgbEq(at(s, BAND_SAMPLE_X, y), expectedBandColor(l.scrollY, k)));`,
    replace: `return BAND_SAMPLE_Y.slice(0, 1).every((y, k) => rgbEq(at(s, BAND_SAMPLE_X, y), expectedBandColor(l.scrollY, k)));`,
    forgeShots: (dir, r) => {
      // repaint the SECOND band sample only (y = 180) on up1.png
      const buf = fs.readFileSync(path.join(dir, 'up1.png'));
      const { px, w } = decodeToPixels(buf);
      for (let dx = 0; dx < 4; dx++) { const i = ((180) * w + (1000 + dx)) * 4; px[i] = 1; px[i + 1] = 2; px[i + 2] = 3; }
      rewriteShot(dir, 'up1.png', px);
    },
  },
  {
    id: 'X19-leg-witness-drop-name', check: 'leg-witness',
    find: ` && l.witness === l.name`,
    replace: ``,
    forge: (r) => { r.legs[2].witness = 'other'; },
  },
  {
    id: 'X20-shot-bytes-drop-bytes', check: 'shot-bytes',
    find: ` && s.bytes === l.shotBytes`,
    replace: ``,
    forge: (r) => { r.legs[1].shotBytes = r.legs[1].shotBytes + 1; },
  },
  {
    id: 'X21-shot-bytes-drop-dimensions', check: 'shot-bytes',
    find: `s.width === VIEWPORT.width && s.height === VIEWPORT.height && `,
    replace: ``,
    forgeShots: (dir) => {
      // the r63 failure class: a 1x1 PNG whose recorded bytes/digest are honest
      const buf = encode({ width: 1, height: 1, pixels: Buffer.alloc(4, 255) });
      fs.writeFileSync(path.join(dir, 'down1.png'), buf);
      const all = readJSON(path.join(dir, 'receipt.json'));
      const leg = all.legs.find((l) => l.shot === 'down1.png');
      leg.shotSha256 = sha(buf); leg.shotBytes = buf.length;
      fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify(all, null, 1));
    },
  },
  // ---- record shape ----
  {
    id: 'X22-shot-records-drop-name', check: 'shot-records',
    find: `l.shot === l.name + '.png' && `,
    replace: ``,
    forgeShots: (dir) => { fs.copyFileSync(path.join(dir, 'released.png'), path.join(dir, 'other.png')); },
    forge: (r) => { r.legs[5].shot = 'other.png'; },
  },
  {
    id: 'X23-shot-records-drop-positive-bytes', check: 'shot-records',
    find: `Number.isInteger(l.shotBytes) && l.shotBytes > 0`,
    replace: `Number.isInteger(l.shotBytes)`,
    forge: null, // dead: shot-bytes pins shotBytes to the real file size (> 0)
  },
  // ---- bounds ----
  {
    id: 'X24-scroll-arithmetic-widen-60px', check: 'scroll-arithmetic',
    find: `LEG_NAMES.every((k) => legMap[k]?.scrollY === EXPECTED_SCROLL[k])`,
    replace: `LEG_NAMES.every((k) => Math.abs(legMap[k]?.scrollY - EXPECTED_SCROLL[k]) <= 60)`,
    forge: (r) => { r.legs[2].scrollY = 180; },
    forgeShots: (dir, r) => {
      const px = drawShot({ nonce: r.nonce, scrollY: 180, witness: 'down2' });
      rewriteShot(dir, 'down2.png', px);
    },
  },
  {
    id: 'X25-failures-widen-le-one', check: 'failures',
    find: `r.failures.length === 0`,
    replace: `r.failures.length <= 1`,
    forge: (r) => { r.failures = [{ id: 'x', detail: 'y' }]; },
  },
  {
    id: 'X26-nonce-binding-drop-format-regex', check: 'nonce-binding',
    find: `/^tabi-r64-[a-z0-9-]+$/.test(r?.nonce || '') && r.nonceOnPage === r.nonce`,
    replace: `r.nonceOnPage === r.nonce`,
    forge: (r) => {
      const bad = 'TABI R64 FORGED NONCE';
      r.nonce = bad; r.nonceOnPage = bad;
      r.fixture.sha256 = sha(Buffer.from(renderFixture(fs.readFileSync(driverPath, 'utf8'), bad)));
      // keep the server-log run binding self-consistent so ONLY the dropped format
      // regex can refuse this receipt
      r.serverLog = r.serverLog.map((e) => (e.path === '/' ? { ...e, run: bad, query: 'run=' + encodeURIComponent(bad) } : e));
    },
    forgeShots: (dir, r) => {
      for (const name of LEG_ORDER) {
        const px = drawShot({ nonce: r.nonce, scrollY: SCROLL[name], witness: name });
        rewriteShot(dir, name + '.png', px);
      }
    },
  },
  {
    id: 'X28-shot-bytes-drop-digest', check: 'shot-bytes',
    find: ` && s.sha256 === l.shotSha256`,
    replace: ``,
    forge: (r) => { r.legs[0].shotSha256 = 'f'.repeat(64); },
  },
  {
    id: 'X29-shot-records-drop-digest-format', check: 'shot-records',
    find: `/^[a-f0-9]{64}$/.test(l.shotSha256 || '') && `,
    replace: ``,
    forge: null, // dead: shot-bytes' s.sha256 === l.shotSha256 forces a real digest
  },
  {
    id: 'X30-scroll-event-witness-hardcode-4', check: 'scroll-event-witness',
    find: `r?.pageState?.scrollEvents === wl.filter((e) => !e.defaultPrevented).length`,
    replace: `r?.pageState?.scrollEvents === 4`,
    forge: null, // dead given cancelation: exactly one of five wheels is prevented => count is always 4
  },
  {
    id: 'X27-fixture-binding-drop-format-regex', check: 'fixture-binding',
    find: `/^[a-f0-9]{64}$/.test(r?.fixture?.sha256 || '') && r.fixture.sha256 === external.fixtureSha256`,
    replace: `r.fixture.sha256 === external.fixtureSha256`,
    forge: null, // dead: equality to a lowercase hex digest already forces the format
  },
];

// ---------- runner ----------
function runCounter(counterFile, receipt, shot) {
  return new Promise((resolve) => {
    const child = spawn('node', [counterFile, receipt, '--driver', driverPath, '--expect-driver-sha256', driverSha, '--shot', shot, '--json'], { stdio: ['ignore', 'pipe', 'ignore'] });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.on('close', (code) => {
      let parsed = null; try { parsed = JSON.parse(out); } catch {}
      resolve({ exit: code, findings: parsed?.findings ?? null, error: parsed?.error ?? null });
    });
  });
}
async function pool(items, limit, fn) {
  const ret = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; ret[i] = await fn(items[i], i); }
  }));
  return ret;
}

const negs = fs.readdirSync(negDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const reds = fs.readdirSync(redDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();

async function survey(counterFile, tag) {
  const live = await runCounter(counterFile, receiptPath, shotDir);
  const negRows = await pool(negs, 10, async (n) => [n, await runCounter(counterFile, path.join(negDir, n, 'receipt.json'), path.join(negDir, n))]);
  const redRows = await pool(reds, 4, async (n) => [n, await runCounter(counterFile, path.join(redDir, n, 'receipt.json'), path.join(redDir, n))]);
  return { tag, live, negatives: Object.fromEntries(negRows), redBefore: Object.fromEntries(redRows) };
}

const pristine = await survey(counterPath, 'pristine');

const rows = [];
for (const m of MUTANTS) {
  const hits = pristineSrc.split(m.find).length - 1;
  if (hits !== 1) { rows.push({ id: m.id, check: m.check, applied: false, hits, note: 'find occurs ' + hits + 'x' }); continue; }
  const dir = path.join(outDir, m.id);
  fs.mkdirSync(dir, { recursive: true });
  const mutated = pristineSrc.replace(m.find, m.replace);
  const mutantFile = path.join(dir, 'counter.mjs');
  fs.writeFileSync(mutantFile, mutated);
  fs.writeFileSync(path.join(dir, 'png-r64.mjs'), pngSrc);
  // single-line proof: the mutated file differs from pristine on exactly one line
  const a = pristineSrc.split('\n'), b = mutated.split('\n');
  const diffLines = a.map((l, i) => (l !== b[i] ? i + 1 : null)).filter(Boolean);

  const live = await runCounter(mutantFile, receiptPath, shotDir);
  const negRows = await pool(negs, 10, async (n) => [n, await runCounter(mutantFile, path.join(negDir, n, 'receipt.json'), path.join(negDir, n))]);
  const redRows = await pool(reds, 4, async (n) => [n, await runCounter(mutantFile, path.join(redDir, n, 'receipt.json'), path.join(redDir, n))]);
  const accepted = negRows.filter(([n, r]) => r.exit === 0 && pristine.negatives[n].exit !== 0).map(([n]) => n);
  const redAccepted = redRows.filter(([n, r]) => r.exit === 0 && pristine.redBefore[n].exit !== 0).map(([n]) => n);

  // targeted forgery
  let forge = null;
  if (m.forge || m.forgeShots) {
    const r = clone(readJSON(receiptPath));
    if (m.forge) m.forge(r);
    // shots first (rewriteShot reads/writes receipt.json inside the dir), then final receipt
    const fdir = path.join(outDir, m.id, 'forge');
    fs.mkdirSync(fdir, { recursive: true });
    for (const f of fs.readdirSync(shotDir).filter((x) => x.endsWith('.png'))) fs.copyFileSync(path.join(shotDir, f), path.join(fdir, f));
    fs.writeFileSync(path.join(fdir, 'receipt.json'), JSON.stringify(r, null, 1));
    if (m.forgeShots) m.forgeShots(fdir, r);
    const pristineForge = await runCounter(counterPath, path.join(fdir, 'receipt.json'), fdir);
    const mutantForge = await runCounter(mutantFile, path.join(fdir, 'receipt.json'), fdir);
    forge = {
      pristineExit: pristineForge.exit, pristineFindings: pristineForge.findings,
      mutantExit: mutantForge.exit, mutantFindings: mutantForge.findings,
      acceptedByMutant: mutantForge.exit === 0,
    };
  }

  const matchingNeg = m.check ? pristine.negatives[m.check] : null;
  const mutantMatchingNeg = m.check ? negRows.find(([n]) => n === m.check)?.[1] : null;
  rows.push({
    id: m.id, check: m.check,
    line: diffLines[0] ?? null, lineCount: diffLines.length,
    applied: true, mutantSha256: sha(fs.readFileSync(mutantFile)),
    mutatedLine: mutated.split('\n')[(diffLines[0] ?? 1) - 1]?.trim() ?? null,
    liveExit: live.exit, liveFindings: live.findings,
    negativesAccepted: accepted,
    redBeforeAccepted: redAccepted,
    checkStillReportedOnOwnNegative: mutantMatchingNeg ? Array.isArray(mutantMatchingNeg.findings) && mutantMatchingNeg.findings.includes(m.check) : null,
    pristineOwnNegativeFindings: matchingNeg?.findings ?? null,
    mutantOwnNegativeFindings: mutantMatchingNeg?.findings ?? null,
    forge,
    survivedDeclaredNegatives: live.exit === 0 && accepted.length === 0,
  });
}

const matrix = {
  schema: 'tabi-r64-mutants-independent-v1',
  seat: 'R64MutCounter',
  counter: { path: counterPath, sha256: pristineSha, pinned: '5cc3c8dd871d8ba38b0bd87b8142c879abf2c3a790392fb7df21c7534c5f01b7' },
  input: { path: receiptPath, sha256: sha(fs.readFileSync(receiptPath)) },
  shotDir, driverSha256: driverSha,
  pristine: {
    liveExit: pristine.live.exit,
    negativesRefused: Object.values(pristine.negatives).filter((r) => r.exit === 1).length,
    negativeCount: negs.length,
    redBefore: Object.fromEntries(Object.entries(pristine.redBefore).map(([k, v]) => [k, v.exit])),
  },
  mutants: rows.length,
  applied: rows.filter((r) => r.applied).length,
  liveAccepted: rows.filter((r) => r.liveExit === 0).length,
  killedByDeclaredNegative: rows.filter((r) => r.negativesAccepted.length > 0).length,
  survivedDeclaredNegatives: rows.filter((r) => r.survivedDeclaredNegatives).length,
  survivedButForgeryKills: rows.filter((r) => r.survivedDeclaredNegatives && r.forge?.acceptedByMutant).map((r) => r.id),
  survivorsNoForgery: rows.filter((r) => r.survivedDeclaredNegatives && (!r.forge || !r.forge.acceptedByMutant)).map((r) => r.id),
  redBeforeAccepted: rows.filter((r) => r.redBeforeAccepted.length > 0).map((r) => [r.id, r.redBeforeAccepted]),
  rows,
};
fs.writeFileSync(path.join(outDir, 'matrix.json'), JSON.stringify(matrix, null, 1));
if (flags.has('json')) console.log(JSON.stringify(matrix, null, 1));
else {
  console.log('TABI_R64_MUTANTS_INDEPENDENT mutants=' + matrix.mutants + ' applied=' + matrix.applied + ' liveAccepted=' + matrix.liveAccepted
    + ' killedByNeg=' + matrix.killedByDeclaredNegative + ' survivedNeg=' + matrix.survivedDeclaredNegatives
    + ' forgeryKills=' + matrix.survivedButForgeryKills.length + ' noForgery=' + matrix.survivorsNoForgery.length);
  for (const r of rows) console.log([r.id, r.check, 'line=' + r.line, 'live=' + r.liveExit, 'neg=' + JSON.stringify(r.negativesAccepted), 'red=' + JSON.stringify(r.redBeforeAccepted), 'forge=' + (r.forge ? r.forge.mutantExit : '-')].join(' | '));
}
