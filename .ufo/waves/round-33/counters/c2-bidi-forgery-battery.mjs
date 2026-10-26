#!/usr/bin/env node
// c2-bidi-forgery-battery.mjs — tabi round 33, claim C2 (operability). Frozen counter.
//
// Question: does the lane's BiDi runtime gate at REV (scripts/check-bidi-runtime.mjs,
// run offline: the receipt leg) refuse the receipt-forgery constructions found
// against gate v1 in round 32 (.ufo/waves/round-32/w1/CritC1Forgery.md D1-D5,
// lesson round-32 M2/M7, MutC1Entry), while still admitting the lane's honest
// round-32 receipt and an honest re-layout of it?
//
// Usage: node c2-bidi-forgery-battery.mjs --rev <40-hex REV> [--repo <lane>] [--json] [--keep]
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could not evaluate.
//
// Mechanics: a `git clone --shared` of the lane under a fresh dir in $TMPDIR (pass
// TMPDIR under $HYAKU_SCRATCH); every git write names `-C <clone>` and the clone's
// toplevel is verified before the first commit. Each variant is one commit on REV
// in the clone (identity battery <battery@scratch.local>). The gate executed is the
// clone's scripts/check-bidi-runtime.mjs, asserted byte-identical to REV's blob before
// every run (no variant touches it), as
//   node scripts/check-bidi-runtime.mjs --repo <clone> --rev <variant> --baseline BASE
//        --entry ENTRY --json
// with cwd = clone and no --live. The synthetic transcripts come from goldenLines()
// of the FROZEN v1 gate (blob at GOLDEN_REV, written to the scratch dir), never from
// REV's gate. The clone is removed on exit unless --keep.
//
// Variants (frozen):
//   H0  REV itself (honest).
//   H1  honest re-layout: both committed transcripts copied byte-for-byte to new
//       paths, run order swapped, receipt rewritten accordingly.
//   H2  honest second pair: the two real transcripts of round-32 w2 RerunDriver
//       (committed at GOLDEN_REV under .ufo/waves/round-32/w2/RerunDriver/bidi-run/,
//       same driver, digests 92bd413c… / b9dab912…) copied in as run1/run2.
//   F1  golden-splice: two goldenLines() transcripts (distinct bases) with the honest
//       run1's real first screenshot spliced in; real browser/chromedriver versions;
//       honest driver.                                          (D1)
//   F2  duplicate ids: every `yes` row of the entry relabelled R2.  (D2)
//   F3  same transcript path cited for both runs.                  (D3)
//   F4  run2 = byte copy of run1 at a new path.                    (D3)
//   F5  driver = byte copy of REV's gate at a new path.            (D4)
//   F6  driver = a one-line `export *` re-export of the gate.      (D4)
//   F7  decorated Measured cell: first `yes` row reads `yes (live)` (MutC1Entry).
//   F8  junk source: a new `mined` S990 row (https://e.test/) naming the entry,
//       cited alone on the entry's source: line.                 (D5)
// accepted(variant) := gate exit code 0.
// Predicate (frozen): H0, H1 and H2 accepted with admitted 16 and failing 0, every
//   F variant not accepted, REV's gate `--selftest` exits 0, and REV's gate source
//   carries none of HONEST_DIGESTS (64-hex) nor any 12-hex prefix of one (a gate
//   that whitelists the honest bytes is not a forgery check).
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCHEMA = 'tabi-r33-c2-bidi-forgery-battery-v1';
const GATE = 'scripts/check-bidi-runtime.mjs';
const GOLDEN_REV = 'b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd';
const GOLDEN_GATE_SHA256 = '2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393';
const BASE = 'd805d1d6132430118b206a848b85753ab35d1014';
const ENTRY = 'corpus/knowledge/webdriver-bidi-runtime-round-32.md';
const RECEIPT = 'corpus/evidence/round-32/bidi/receipt.json';
const EVD = 'corpus/evidence/round-32/bidi';
const HONEST_ADMITTED = 16;
const RERUN = '.ufo/waves/round-32/w2/RerunDriver/bidi-run';
const HONEST_DIGESTS = [
  '8aa97463c2386515407328cd96a55b4f38aeb0c376a87ddc2d323c8209aaf851',
  '9918a716da71b41e0366fa6839217e8a191e2f473826ade0bd9ab3bedc7169d7',
  '92bd413caab0bcb7f1a62c1107fe00972a93f83888143b3c2170f32c7dfebad1',
  'b9dab912f0af414efa80c2ec61cde3b392b3757935d7561af2056ca3eddc7252',
  '55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a',
];
const VARIANTS = ['H0', 'H1', 'H2', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'];

class Refusal extends Error {}
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR || tmpdir(), GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C', GIT_NO_REPLACE_OBJECTS: '1' };

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'buffer', env: ENV, maxBuffer: 256 * 1024 * 1024, ...opts });
}
function git(repo, args, { allowFail = false } = {}) {
  const r = run('git', ['-C', repo, '-c', 'user.name=battery', '-c', 'user.email=battery@scratch.local', '-c', 'commit.gpgsign=false', ...args]);
  if (r.status !== 0 && !allowFail) throw new Refusal(`git -C ${repo} ${args.join(' ')}: ${r.stderr.toString('utf8').trim()}`);
  return r;
}
const out8 = (r) => r.stdout.toString('utf8').trim();
function blob(repo, rev, path) {
  const r = git(repo, ['show', `${rev}:${path}`], { allowFail: true });
  if (r.status !== 0) throw new Refusal(`${path} absent at ${rev}`);
  return r.stdout;
}

function firstShotB64(transcript) {
  const ids = new Map();
  for (const line of transcript.toString('utf8').split('\n')) {
    if (!line.trim()) continue;
    const o = JSON.parse(line);
    if (o.dir === 'send' && o.frame && o.frame.method === 'browsingContext.captureScreenshot') ids.set(o.frame.id, true);
    if (o.dir === 'recv' && o.frame && ids.has(o.frame.id) && o.frame.type === 'success' && o.frame.result && o.frame.result.data) return o.frame.result.data;
  }
  throw new Refusal('honest run1 has no successful captureScreenshot');
}
function chromedriverVersion(transcript) {
  const first = JSON.parse(transcript.toString('utf8').split('\n')[0]);
  const v = first && first.body && first.body.value && first.body.value.capabilities && first.body.value.capabilities.chrome && first.body.value.capabilities.chrome.chromedriverVersion;
  if (!v) throw new Refusal('honest run1 has no chromedriverVersion');
  return v;
}

function relabelYesRows(text, fn) {
  const ls = text.split('\n');
  const hi = ls.findIndex((l) => {
    const t = l.trim();
    if (!t.startsWith('|')) return false;
    const c = t.slice(1, -1).split('|').map((x) => x.trim().toLowerCase());
    return c.join('|') === 'row|surface|bidi method|measured|evidence';
  });
  if (hi < 0) throw new Refusal('entry table header not found');
  let first = true;
  for (let j = hi + 2; j < ls.length && ls[j].trim().startsWith('|'); j += 1) {
    const cells = ls[j].trim().slice(1, -1).split('|');
    if (cells.length !== 5 || cells[3].trim().toLowerCase() !== 'yes') continue;
    ls[j] = fn(cells, first);
    first = false;
  }
  return ls.join('\n');
}
const rowLine = (cells) => `| ${cells.map((c) => c.trim()).join(' | ')} |`;

export async function evaluate({ repo, rev, keep = false }) {
  const lane = resolve(repo);
  const r0 = git(lane, ['rev-parse', '--verify', '--quiet', `${rev}^{commit}`], { allowFail: true });
  if (!/^[0-9a-f]{40}$/.test(rev) || r0.status !== 0) throw new Refusal(`unresolvable 40-hex revision: ${rev}`);
  const REV = out8(r0);
  const dir = mkdtempSync(join(ENV.TMPDIR, 'tabi-r33-c2-'));
  const clone = join(dir, 'clone');
  try {
    const c = run('git', ['clone', '-q', '--shared', '--no-checkout', lane, clone]);
    if (c.status !== 0) throw new Refusal(`clone failed: ${c.stderr.toString('utf8')}`);
    if (out8(git(clone, ['rev-parse', '--show-toplevel'])) !== clone) throw new Refusal('clone toplevel mismatch');
    const goldenSrc = blob(lane, GOLDEN_REV, GATE);
    if (sha256(goldenSrc) !== GOLDEN_GATE_SHA256) throw new Refusal('golden gate digest mismatch');
    const goldenFile = join(dir, 'golden-gate-v1.mjs');
    writeFileSync(goldenFile, goldenSrc);
    const { goldenLines } = await import(pathToFileURL(goldenFile).href);
    const gateAtRev = blob(lane, REV, GATE);
    const gateSha = sha256(gateAtRev);
    const receipt = JSON.parse(blob(lane, REV, RECEIPT).toString('utf8'));
    const entryText = blob(lane, REV, ENTRY).toString('utf8');
    if (!Array.isArray(receipt.runs) || receipt.runs.length < 2) throw new Refusal('honest receipt at REV lists fewer than two runs');
    const t1 = blob(lane, REV, receipt.runs[0].transcript);
    const t2 = blob(lane, REV, receipt.runs[1].transcript);
    const shot = firstShotB64(t1);
    const cdv = chromedriverVersion(t1);

    const put = (rel, buf) => { const abs = join(clone, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, buf); };
    const putReceipt = (obj) => put(RECEIPT, JSON.stringify(obj, null, 1) + '\n');
    const reset = () => { git(clone, ['checkout', '-q', '--force', '--detach', REV]); git(clone, ['clean', '-q', '-fdx']); };
    const commit = (msg) => { git(clone, ['add', '-A']); git(clone, ['commit', '-q', '--no-verify', '-m', msg]); return out8(git(clone, ['rev-parse', 'HEAD'])); };
    const golden = (base) => goldenLines({ base, version: receipt.browserVersion, driverVersion: cdv, mutate: (steps) => { steps.find((x) => x[1] === 'browsingContext.captureScreenshot')[3] = { data: shot }; } });
    const builders = {
      H0: null,
      H1: () => {
        const a = `${EVD}/h1/runA/transcript.jsonl`; const b = `${EVD}/h1/runB/transcript.jsonl`;
        put(a, t2); put(b, t1);
        putReceipt({ ...receipt, runs: [{ ...receipt.runs[1], name: 'runA', transcript: a, transcriptSha256: sha256(t2) }, { ...receipt.runs[0], name: 'runB', transcript: b, transcriptSha256: sha256(t1) }] });
      },
      H2: () => {
        const r1 = blob(lane, GOLDEN_REV, `${RERUN}/run1/transcript.jsonl`); const r2 = blob(lane, GOLDEN_REV, `${RERUN}/run2/transcript.jsonl`);
        const a = `${EVD}/h2/run1/transcript.jsonl`; const b = `${EVD}/h2/run2/transcript.jsonl`;
        put(a, r1); put(b, r2);
        putReceipt({ ...receipt, runs: [{ ...receipt.runs[0], name: 'run1', transcript: a, transcriptSha256: sha256(r1) }, { ...receipt.runs[1], name: 'run2', transcript: b, transcriptSha256: sha256(r2) }] });
      },
      F1: () => {
        const g1 = Buffer.from(golden('http://127.0.0.1:40000')); const g2 = Buffer.from(golden('http://127.0.0.1:40001'));
        const a = `${EVD}/f1/run1/transcript.jsonl`; const b = `${EVD}/f1/run2/transcript.jsonl`;
        put(a, g1); put(b, g2);
        putReceipt({ ...receipt, runs: [{ name: 'run1', transcript: a, transcriptSha256: sha256(g1) }, { name: 'run2', transcript: b, transcriptSha256: sha256(g2) }] });
      },
      F2: () => put(ENTRY, relabelYesRows(entryText, (cells) => rowLine(['R2', ...cells.slice(1)]))),
      F3: () => putReceipt({ ...receipt, runs: [receipt.runs[0], { ...receipt.runs[0], name: 'run2' }] }),
      F4: () => {
        const b = `${EVD}/f4/run2/transcript.jsonl`;
        put(b, t1);
        putReceipt({ ...receipt, runs: [receipt.runs[0], { ...receipt.runs[1], transcript: b, transcriptSha256: sha256(t1) }] });
      },
      F5: () => { const p = `${EVD}/f5-driver.mjs`; put(p, gateAtRev); putReceipt({ ...receipt, driver: p, driverSha256: gateSha }); },
      F6: () => { const p = `${EVD}/f6-driver.mjs`; const d = Buffer.from('export * from "../../../../scripts/check-bidi-runtime.mjs";\n'); put(p, d); putReceipt({ ...receipt, driver: p, driverSha256: sha256(d) }); },
      F7: () => put(ENTRY, relabelYesRows(entryText, (cells, first) => (first ? rowLine([cells[0], cells[1], cells[2], 'yes (live)', cells[4]]) : rowLine(cells)))),
      F8: () => {
        const reg = blob(lane, REV, 'corpus/SOURCES.md').toString('utf8');
        put('corpus/SOURCES.md', reg.replace(/\n*$/, '\n') + `| S990 | junk — https://e.test/ | spec | A | s | a | t | mined | 2026-10-26 | 90d | ${ENTRY} |\n`);
        put(ENTRY, entryText.replace(/^source:.*$/m, 'source: S990 — junk'));
      },
    };
    const results = {};
    for (const v of VARIANTS) {
      reset();
      let target = REV;
      if (builders[v]) { builders[v](); target = commit(`battery ${v}`); }
      const onDisk = readFileSync(join(clone, GATE));
      if (sha256(onDisk) !== gateSha) throw new Refusal(`variant ${v} changed the gate bytes`);
      const r = run(process.execPath, [join(clone, GATE), '--repo', clone, '--rev', target, '--baseline', BASE, '--entry', ENTRY, '--json'], { cwd: clone });
      let j = null;
      try { j = JSON.parse(r.stdout.toString('utf8')); } catch { /* not JSON */ }
      results[v] = {
        commit: target, exit: r.status, accepted: r.status === 0,
        population: j ? j.population : null, admitted: j ? j.admitted : null, failing: j ? j.failing : null,
        entryFinding: j ? j.entryFinding : null, binding: j ? (j.binding ?? null) : null,
        reasons: j && Array.isArray(j.rows) ? [...new Set(j.rows.map((x) => x.reason).filter(Boolean))].sort() : [],
        stderr: r.stderr.toString('utf8').trim().slice(0, 300),
      };
    }
    reset();
    const st = run(process.execPath, [join(clone, GATE), '--selftest'], { cwd: clone });
    const stLast = st.stdout.toString('utf8').trim().split('\n').pop() || '';
    const honestOk = (x) => x.accepted && x.admitted === HONEST_ADMITTED && x.failing === 0;
    const forgeries = VARIANTS.filter((v) => v.startsWith('F'));
    const out = {
      schema: SCHEMA, rev: REV, gateSha256: gateSha, goldenRev: GOLDEN_REV, baseline: BASE, entry: ENTRY,
      honest: { H0: honestOk(results.H0), H1: honestOk(results.H1), H2: honestOk(results.H2) },
      digestLiterals: HONEST_DIGESTS.filter((d) => gateAtRev.toString('utf8').toLowerCase().includes(d.slice(0, 12))).map((d) => d.slice(0, 12)),
      forgeriesAccepted: forgeries.filter((v) => results[v].accepted).length,
      forgeriesTotal: forgeries.length,
      acceptedForgeries: forgeries.filter((v) => results[v].accepted),
      selftest: { exit: st.status, last: stLast },
      results,
    };
    out.predicate = out.honest.H0 && out.honest.H1 && out.honest.H2 && out.forgeriesAccepted === 0 && st.status === 0 && out.digestLiterals.length === 0;
    return out;
  } finally {
    if (!keep) rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const o = { repo: resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'), rev: null, json: false, keep: false };
  try {
    for (let i = 0; i < argv.length; i += 1) {
      const a = argv[i];
      if (a === '--json') o.json = true;
      else if (a === '--keep') o.keep = true;
      else if (a === '--repo' || a === '--rev') { const v = argv[++i]; if (v === undefined) throw new Refusal(`missing value for ${a}`); o[a.slice(2)] = v; }
      else throw new Refusal(`unknown argument ${a}`);
    }
    if (!o.rev) throw new Refusal('usage: --rev <40-hex REV>');
    const out = await evaluate(o);
    if (o.json) console.log(JSON.stringify(out));
    else {
      for (const v of VARIANTS) { const x = out.results[v]; console.log(`VARIANT ${v} exit=${x.exit} accepted=${x.accepted} population=${x.population} admitted=${x.admitted} failing=${x.failing} entry=${x.entryFinding ?? '-'} reasons=${x.reasons.join(',') || '-'}`); }
      console.log(`C2_FORGERY_BATTERY predicate=${out.predicate ? 'met' : 'not-met'} rev=${out.rev} gate=${out.gateSha256.slice(0, 12)} honestH0=${out.honest.H0} honestH1=${out.honest.H1} honestH2=${out.honest.H2} forgeriesAccepted=${out.forgeriesAccepted}/${out.forgeriesTotal} selftestExit=${out.selftest.exit} digestLiterals=${out.digestLiterals.length}`);
    }
    process.exit(out.predicate ? 0 : 1);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`C2_FORGERY_BATTERY verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
