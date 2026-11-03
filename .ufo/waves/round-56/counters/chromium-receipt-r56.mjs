#!/usr/bin/env node
// chromium-receipt-r56.mjs — tabi round 56 counter for claim C2 (coverage:
// capability chromium-keyevent-control-keys-linux — the control-domain key
// leg on the Linux host's Chromium 155 headless surface, with page-side DOM
// witnesses).
//
// PREDICATE-SENTENCE (frozen in .ufo/waves/round-56/claims.json before any
// seat ran; this file implements it and never amends it): the counter admits
// a receipt with schema tabi-chrome-cdp-r56 whose nonce matches
// ^tabi-r56-[0-9a-f]{16}$ AND is invocation-bound (present in the server log
// or in the typed values), whose driverSha256 equals the sha256 of the
// driver bytes AND of --expect-driver-sha256 when that pin is given, whose
// child argv carries an absolute --user-data-dir naming a throwaway
// profile-<launchToken> dir, whose plain trace re-derives as nonce prefixes,
// whose control domain witnesses End (negative edit), Backspace (exact
// residue), restore (exact nonce), Tab (field -> field2 by
// document.activeElement) and one Enter implicit submission seen
// server-side, whose #field3 stayed empty, whose page keylog window has the
// length the control domain implies, whose server log carries an /echo
// entry, whose six named steps are present in order with committed PNG bytes
// hashing to their pins and carrying the PNG signature, and whose teardown
// left no survivor; and the receipt's own predicate flag is true.
//
// FINDING IDS — EXACT, FROZEN (a fixture asserts the exact set):
//   receipt-missing, receipt-unparseable, schema-wrong, nonce-shape,
//   nonce-not-invocation-bound, driver-sha-mismatch, driver-missing,
//   profile-not-throwaway, host-browser-mismatch, host-argv-home-leak,
//   plain-trace-wrong, plain-trace-missing,
//   control-domain-missing, control-end-witness-wrong,
//   control-backspace-witness-wrong, control-restore-witness-wrong,
//   control-tab-focus-wrong, control-enter-submit-wrong, field3-not-empty,
//   keylog-missing, keylog-length-wrong, server-log-missing,
//   server-log-echo-count, steps-missing,
//   png-missing, png-sha-mismatch, png-not-png, teardown-survivor,
//   predicate-false.
//
// PRE-FREEZE ADDITIONS (round 56, before any data run; disclosed in the round
// lesson): host-browser-mismatch and host-argv-home-leak close R56Sentinel
// RISK 1/RISK 4 (the frozen claim names Chromium 155 and shape-only host
// state); server-log-echo-count makes the runner's own serverLogEcho witness
// (exactly one /echo) independently counter-checked.
//
// DEDUPE: one entry per id, first detail retained, `occurrences` counted —
// so a fixture's expected set is a set, not a multiset.
//
// DERIVATION OF keylog-length-wrong: "the window length the controlDomain
// implies" is the number of keydowns the control-domain key leg must deliver
// to the page — one each for end, backspace, restore, tab (the Enter keydown
// is not witnessed because the implicit submission navigates the document,
// the r55 disclosure carried forward). A control-domain sub-block that is
// absent implies no keydown for that leg; when the whole controlDomain is
// absent the frozen leg count (4) is implied.
//
// Declared residual (the r44..r55 class, pre-declared, NOT a predicate
// change): a counter over committed bytes cannot by itself prove a browser
// ran. The re-derivation path is re-running the committed runner (fresh
// nonce, fresh fixture port per invocation) and re-hashing the committed
// PNGs. Second residual: the frozen text checks each plain-trace valueAfter
// is a prefix of the nonce of its own length; a trace that stops early is
// admitted by that clause alone and is caught only by the control-domain
// witnesses and the invocation binding. This file does not strengthen it —
// strengthening would be a post-freeze predicate change.
//
// Usage:
//   node chromium-receipt-r56.mjs <receipt.json> --driver <driver.mjs>
//        [--expect-driver-sha256 <hex>] [--shot <dir|png...>] [--json]
//   node chromium-receipt-r56.mjs --selftest
//   node chromium-receipt-r56.mjs --self-check
// Exit: 0 predicate met (no finding); 1 any finding; 2 usage.
// Writes nothing but stdout. Paths are resolved against cwd; a relative
// receipt or driver path is accepted (the frozen data-run command uses
// repo-relative paths).
//
// --shot exists for the frozen C2 command shape (`--shot <six per-step
// PNGs ...>`): a directory value, or one path per step, tells the counter
// where the sextet lives. --shot NEVER relaxes a check — every byte found
// that way is still hashed against its step pin and signature-checked.
//
// FIXTURES (chromium-receipt-r56-fixtures/): 35 refusals (one per frozen id,
// extras for each control-witness leg, the three authoring do-nothing
// controls) + exactly ONE hand-authored GREEN receipt (green-synthetic.json,
// stated synthetic in its note) + two pass-branch CLI controls that re-drive
// that same green receipt through --expect-driver-sha256 and --shot, so the
// pass branch is shown not to be over-strict on the paths the data run uses.
// The L1 adds the live receipt as the authoritative green after the data run.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-r56';
const NONCE_RE = /^tabi-r56-[0-9a-f]{16}$/;
const STEP_NAMES = ['a-start', 'b-typed', 'c-end-witness', 'd-backspace', 'e-tab', 'f-enter-echo'];
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const TOKEN_RE = /^[A-Za-z0-9._-]{4,}$/;
const CONTROL_LEGS = ['end', 'backspace', 'restore', 'tab'];
// The frozen id list, verbatim and exhaustive — the selftest asserts every one
// of them is exercised by at least one fixture.
const FINDING_IDS = [
  'receipt-missing', 'receipt-unparseable', 'schema-wrong', 'nonce-shape',
  'nonce-not-invocation-bound', 'driver-sha-mismatch', 'driver-missing',
  'profile-not-throwaway', 'host-browser-mismatch', 'host-argv-home-leak',
  'plain-trace-wrong', 'plain-trace-missing',
  'control-domain-missing', 'control-end-witness-wrong',
  'control-backspace-witness-wrong', 'control-restore-witness-wrong',
  'control-tab-focus-wrong', 'control-enter-submit-wrong', 'field3-not-empty',
  'keylog-missing', 'keylog-length-wrong', 'server-log-missing',
  'server-log-echo-count', 'steps-missing',
  'png-missing', 'png-sha-mismatch', 'png-not-png', 'teardown-survivor',
  'predicate-false',
];

const SELF = fileURLToPath(import.meta.url);
const FIXTURES_DIR = path.join(path.dirname(SELF), 'chromium-receipt-r56-fixtures');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-chrome-cdp-r56-counter', error: msg }));
  process.exit(2);
}

function newFindings() {
  const list = [];
  const byId = new Map();
  const add = (id, detail) => {
    const prev = byId.get(id);
    if (prev) { prev.occurrences += 1; return; }
    const f = { id, detail: String(detail === undefined ? '' : detail).slice(0, 400), occurrences: 1 };
    byId.set(id, f);
    list.push(f);
  };
  return { list, add };
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const argvText = (argv) => (Array.isArray(argv) ? argv.map((x) => String(x)).join(' ') : typeof argv === 'string' ? argv : '');

// --user-data-dir extraction: both `--user-data-dir=PATH` and
// `--user-data-dir PATH` forms, first match wins.
function userDataDirArg(text) {
  const m = /--user-data-dir(?:=|\s+)(?:"([^"]+)"|'([^']+)'|(\S+))/.exec(text);
  if (!m) return null;
  return m[1] || m[2] || m[3] || null;
}

function impliedKeydowns(cd) {
  if (!cd) return 4;
  let n = 0;
  for (const leg of CONTROL_LEGS) if (isObj(cd[leg])) n += 1;
  return n;
}

// PNG presence check: file exists, sha256 equals the pin, signature present.
function checkStepPng(step, baseDir, add, overrideAbs) {
  const rel = step && typeof step.png === 'string' ? step.png : null;
  if (!rel && !overrideAbs) { add('png-missing', 'step ' + JSON.stringify(step && step.name) + ' has no png path'); return; }
  const abs = overrideAbs || path.resolve(baseDir, rel);
  let buf = null;
  try { buf = fs.readFileSync(abs); } catch { add('png-missing', abs); return; }
  const got = sha256(buf);
  if (typeof step.sha256 !== 'string' || got !== step.sha256) {
    add('png-sha-mismatch', abs + ' sha ' + got + ' != pin ' + step.sha256);
  }
  if (!(buf.length >= 8 && buf.subarray(0, 8).equals(PNG_MAGIC))) add('png-not-png', abs);
}

// input: {receiptPath} | {inline, baseDir}; opts: {driverPath, expectSha}
function checkReceipt(input, opts) {
  const { list, add } = newFindings();
  return evaluate(input, opts, list, add);
}

function evaluate(input, opts, findings, add) {
  const done = (receipt) => ({ receipt, findings, couldNotEvaluate: [] });
  let rec;
  let baseDir;
  if (input && Object.prototype.hasOwnProperty.call(input, 'inline')) {
    rec = input.inline;
    baseDir = input.baseDir || FIXTURES_DIR;
    if (!isObj(rec)) rec = {};
  } else {
    const receiptPath = input.receiptPath;
    baseDir = path.dirname(path.resolve(receiptPath));
    let buf;
    try { buf = fs.readFileSync(receiptPath); } catch (e) {
      if (e && e.code === 'ENOENT') { add('receipt-missing', path.resolve(receiptPath)); return done(null); }
      add('receipt-unparseable', 'unreadable: ' + (e && e.code)); return done(null);
    }
    try { rec = JSON.parse(buf.toString('utf8')); } catch (e) {
      add('receipt-unparseable', String((e && e.message) || e).slice(0, 200)); return done(null);
    }
    if (!isObj(rec)) rec = {};
  }

  // ---- receipt identity -------------------------------------------------
  if (rec.schema !== SCHEMA) add('schema-wrong', String(rec.schema));

  const nonce = rec.nonce;
  const nonceStr = typeof nonce === 'string' ? nonce : null;
  if (nonceStr === null || !NONCE_RE.test(nonceStr)) add('nonce-shape', String(nonce));

  // ---- driver binding ---------------------------------------------------
  const driverPath = opts.driverPath || null;
  let driverBytes = null;
  if (!driverPath) add('driver-missing', 'no --driver given');
  else {
    try { driverBytes = fs.readFileSync(driverPath); } catch { add('driver-missing', path.resolve(driverPath)); }
  }
  if (driverBytes) {
    const got = sha256(driverBytes);
    if (rec.driverSha256 !== got) add('driver-sha-mismatch', 'receipt ' + rec.driverSha256 + ' != bytes ' + got);
  }
  if (opts.expectSha && rec.driverSha256 !== opts.expectSha) {
    add('driver-sha-mismatch', 'receipt ' + rec.driverSha256 + ' != --expect-driver-sha256 ' + opts.expectSha);
  }

  // ---- throwaway profile ------------------------------------------------
  const host = isObj(rec.host) ? rec.host : {};
  const token = typeof host.launchToken === 'string' ? host.launchToken : '';
  const udd = userDataDirArg(argvText(host.argv));
  const profileOk = udd !== null
    && path.isAbsolute(udd)
    && TOKEN_RE.test(token)
    && !/[\\/]/.test(token)
    && path.basename(udd) === 'profile-' + token;
  if (!profileOk) add('profile-not-throwaway', 'argv=' + argvText(host.argv) + ' token=' + JSON.stringify(token));

  // ---- host browser identity (frozen claim names Chromium 155) ----------
  if (!isObj(rec.host) || typeof host.chromium !== 'string' || !host.chromium.includes('155.')) {
    add('host-browser-mismatch', 'host.chromium=' + JSON.stringify(isObj(rec.host) ? host.chromium : rec.host));
  }
  // ---- shape-only host state: no user-home path in the recorded argv ----
  const argvStr = argvText(host.argv);
  if (/\/home\/[A-Za-z0-9._-]+\//.test(argvStr) || argvStr.includes('~/')) {
    add('host-argv-home-leak', 'argv=' + argvStr);
  }

  // ---- plain typing trace ----------------------------------------------
  const pt = rec.plainTrace;
  const ptEntries = isObj(pt) && Array.isArray(pt.entries) ? pt.entries : null;
  if (!ptEntries || ptEntries.length === 0) add('plain-trace-missing', 'plainTrace.entries absent or empty');
  else for (const e of ptEntries) {
    if (!isObj(e) || typeof e.valueAfter !== 'string') {
      add('plain-trace-wrong', 'i=' + (isObj(e) ? e.i : '?') + ' valueAfter not a string'); continue;
    }
    const v = e.valueAfter;
    if (nonceStr === null || v.length > nonceStr.length || v !== nonceStr.slice(0, v.length)) {
      add('plain-trace-wrong', 'i=' + (isObj(e) ? e.i : '?') + ' valueAfter=' + JSON.stringify(v));
    }
  }

  // ---- control domain ---------------------------------------------------
  const cd = isObj(rec.controlDomain) ? rec.controlDomain : null;
  if (!cd) add('control-domain-missing', 'controlDomain absent');
  else {
    const end = isObj(cd.end) ? cd.end : null;
    if (!end) add('control-end-witness-wrong', 'end block absent');
    else if (end.negativeWitness !== true) add('control-end-witness-wrong', 'negativeWitness=' + JSON.stringify(end.negativeWitness));
    else if (end.valueAfter !== end.valueBefore) add('control-end-witness-wrong', 'valueAfter ' + JSON.stringify(end.valueAfter) + ' != valueBefore ' + JSON.stringify(end.valueBefore));

    const bs = isObj(cd.backspace) ? cd.backspace : null;
    const expectedResidue = nonceStr === null ? null : nonceStr.slice(0, -1);
    if (!bs) add('control-backspace-witness-wrong', 'backspace block absent');
    else if (expectedResidue === null || bs.valueAfter !== expectedResidue) {
      add('control-backspace-witness-wrong', 'valueAfter ' + JSON.stringify(bs.valueAfter) + ' != ' + JSON.stringify(expectedResidue));
    }

    const rs = isObj(cd.restore) ? cd.restore : null;
    if (!rs) add('control-restore-witness-wrong', 'restore block absent');
    else if (nonceStr === null || rs.valueAfter !== nonceStr) {
      add('control-restore-witness-wrong', 'valueAfter ' + JSON.stringify(rs.valueAfter) + ' != ' + JSON.stringify(nonceStr));
    }

    const tab = isObj(cd.tab) ? cd.tab : null;
    if (!tab) add('control-tab-focus-wrong', 'tab block absent');
    else if (tab.activeBefore !== 'field' || tab.activeAfter !== 'field2') {
      add('control-tab-focus-wrong', 'activeBefore ' + JSON.stringify(tab.activeBefore) + ' activeAfter ' + JSON.stringify(tab.activeAfter));
    }

    const en = isObj(cd.enter) ? cd.enter : null;
    if (!en) add('control-enter-submit-wrong', 'enter block absent');
    else if (en.submitted !== true) add('control-enter-submit-wrong', 'submitted=' + JSON.stringify(en.submitted));
    else if (nonceStr === null || en.serverSawField !== nonceStr) {
      add('control-enter-submit-wrong', 'serverSawField ' + JSON.stringify(en.serverSawField) + ' != ' + JSON.stringify(nonceStr));
    } else if (en.serverSawField2 !== '') {
      add('control-enter-submit-wrong', 'serverSawField2 ' + JSON.stringify(en.serverSawField2) + ' not empty');
    }
  }

  // ---- #field3 ----------------------------------------------------------
  if (rec.field3Value !== '') add('field3-not-empty', JSON.stringify(rec.field3Value));

  // ---- page keylog ------------------------------------------------------
  const kl = rec.keylog;
  if (!isObj(kl) || !Array.isArray(kl.entries)) add('keylog-missing', 'keylog.entries absent');
  else {
    const implied = impliedKeydowns(cd);
    if (kl.length !== implied) add('keylog-length-wrong', 'length ' + JSON.stringify(kl.length) + ' != implied ' + implied);
    if (kl.length !== kl.entries.length) add('keylog-length-wrong', 'length ' + JSON.stringify(kl.length) + ' != entries ' + kl.entries.length);
    const win = isObj(kl.window) ? kl.window : null;
    if (!win) add('keylog-length-wrong', 'keylog.window absent');
    else if (typeof win.start !== 'number' || typeof win.end !== 'number') add('keylog-length-wrong', 'window not numeric');
    else if (win.end - win.start !== implied || win.start < 0 || win.end < win.start) {
      add('keylog-length-wrong', 'window [' + win.start + ',' + win.end + ') span ' + (win.end - win.start) + ' != implied ' + implied);
    }
  }

  // ---- server log -------------------------------------------------------
  const log = Array.isArray(rec.serverLog) ? rec.serverLog : null;
  const logText = log ? JSON.stringify(log) : '';
  if (!log || !logText.includes('/echo')) add('server-log-missing', log ? 'no /echo entry' : 'serverLog absent');
  if (log) {
    const echoCount = log.filter((e) => (typeof e === 'string' ? e : JSON.stringify(e)).includes('/echo')).length;
    if (echoCount !== 1) add('server-log-echo-count', 'echoCount=' + echoCount);
  }

  // ---- invocation binding ----------------------------------------------
  const typed = [];
  if (ptEntries) for (const e of ptEntries) if (isObj(e) && typeof e.valueAfter === 'string') typed.push(e.valueAfter);
  if (cd) {
    for (const leg of CONTROL_LEGS) {
      const b = isObj(cd[leg]) ? cd[leg] : null;
      if (!b) continue;
      for (const k of ['valueBefore', 'valueAfter']) if (typeof b[k] === 'string') typed.push(b[k]);
    }
    if (isObj(cd.enter) && typeof cd.enter.serverSawField === 'string') typed.push(cd.enter.serverSawField);
  }
  const haystack = [logText, ...typed].join('\u0000');
  if (nonceStr === null || !haystack.includes(nonceStr)) {
    add('nonce-not-invocation-bound', 'nonce ' + JSON.stringify(nonce) + ' absent from server log and typed values');
  }

  // ---- steps + committed PNG bytes -------------------------------------
  const steps = Array.isArray(rec.steps) ? rec.steps : null;
  const names = steps ? steps.map((s) => (isObj(s) ? s.name : null)) : null;
  const stepsOk = names !== null && names.length === STEP_NAMES.length
    && STEP_NAMES.every((n, i) => names[i] === n);
  if (!stepsOk) add('steps-missing', names === null ? 'steps absent' : JSON.stringify(names));
  if (steps) {
    const overrides = Array.isArray(opts.shotFiles) ? opts.shotFiles : [];
    steps.forEach((s, i) => checkStepPng(isObj(s) ? s : {}, opts.shotDir || baseDir, add, overrides[i] || null));
  }

  // ---- teardown ---------------------------------------------------------
  const td = isObj(rec.teardown) ? rec.teardown : null;
  const survivors = td ? td.survivors : undefined;
  const swept = td ? td.postKillSweepCount : undefined;
  if (!td || !Array.isArray(survivors) || survivors.length > 0 || swept !== 0) {
    add('teardown-survivor', 'survivors=' + JSON.stringify(survivors) + ' postKillSweepCount=' + JSON.stringify(swept));
  }

  // ---- the receipt's own flag ------------------------------------------
  if (findings.length === 0 && rec.predicate !== true) add('predicate-false', JSON.stringify(rec.predicate));

  return done(rec);
}

// ---------------------------------------------------------------------------
// selftest: every fixture in chromium-receipt-r56-fixtures/ that carries an
// expectFindings key. Fixture shape:
//   { name, note?, receiptPath? | receipt?, expectFindings: [ids] | "GREEN",
//     driver?, expectDriverSha256?, shotFiles? }
// receiptPath/driver/shotFiles are relative to the fixtures dir (absolute
// accepted). expectFindings is the EXACT set; "GREEN" means the empty set.
// ---------------------------------------------------------------------------
function runSelftest() {
  if (!fs.existsSync(FIXTURES_DIR)) die('selftest: fixtures dir absent at ' + FIXTURES_DIR);
  const files = fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json')).sort();
  const cases = [];
  for (const f of files) {
    const p = path.join(FIXTURES_DIR, f);
    let obj;
    try { obj = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { continue; }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, 'expectFindings')) continue;
    cases.push({ file: f, spec: obj });
  }
  if (cases.length === 0) die('selftest: no fixture case found in ' + FIXTURES_DIR);

  const results = [];
  let pass = 0;
  for (const { file, spec } of cases) {
    const name = typeof spec.name === 'string' ? spec.name : file;
    const driverRel = typeof spec.driver === 'string' ? spec.driver : 'driver-stub.mjs';
    const driverPath = path.resolve(FIXTURES_DIR, driverRel);
    const opts = {
      driverPath,
      expectSha: typeof spec.expectDriverSha256 === 'string' ? spec.expectDriverSha256 : null,
      shotFiles: Array.isArray(spec.shotFiles) ? spec.shotFiles.map((x) => path.resolve(FIXTURES_DIR, x)) : null,
    };
    let input;
    if (Object.prototype.hasOwnProperty.call(spec, 'receipt')) input = { inline: spec.receipt, baseDir: FIXTURES_DIR };
    else if (typeof spec.receiptPath === 'string') input = { receiptPath: path.resolve(FIXTURES_DIR, spec.receiptPath) };
    else input = { receiptPath: path.resolve(FIXTURES_DIR, 'absent-by-construction.json') };

    const out = checkReceipt(input, opts);
    const got = out.findings.map((f) => f.id).sort();
    const want = spec.expectFindings === 'GREEN' ? [] : Array.isArray(spec.expectFindings) ? spec.expectFindings.slice().sort() : null;
    const ok = want !== null && JSON.stringify(got) === JSON.stringify(want);
    if (ok) pass += 1;
    results.push({ name, file, ok, got, want });
  }
  const seen = new Set();
  for (const r of results) for (const id of r.want) seen.add(id);
  const uncovered = FINDING_IDS.filter((id) => !seen.has(id));
  const stray = [...seen].filter((id) => !FINDING_IDS.includes(id));
  const coverageOk = uncovered.length === 0 && stray.length === 0;
  const allPass = pass === results.length && coverageOk;
  if (!coverageOk) {
    results.push({ name: 'fixture-id-coverage', ok: false, uncovered, stray });
  }
  const out = {
    schema: 'tabi-chrome-cdp-r56-selftest',
    fixturesDir: FIXTURES_DIR,
    cases: results.length,
    pass,
    allPass,
    idCoverage: { required: FINDING_IDS.length, covered: FINDING_IDS.length - uncovered.length, uncovered, stray },
    failing: results.filter((r) => !r.ok).map((r) => ({ name: r.name, got: r.got, want: r.want })),
    results,
  };
  console.log(JSON.stringify(out, null, 1));
  console.log(pass + '/' + results.length);
  process.exit(allPass ? 0 : 1);
}

function runSelfCheck() {
  const bytes = fs.readFileSync(SELF);
  const files = fs.existsSync(FIXTURES_DIR) ? fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json')) : [];
  let count = 0;
  for (const f of files) {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, f), 'utf8'));
      if (o && typeof o === 'object' && !Array.isArray(o) && Object.prototype.hasOwnProperty.call(o, 'expectFindings')) count += 1;
    } catch { /* not a case */ }
  }
  const status = 'ok';
  console.log(JSON.stringify({
    schema: 'tabi-chrome-cdp-r56-selfcheck',
    counter: SELF,
    sha256: sha256(bytes),
    bytes: bytes.length,
    fixturesDir: FIXTURES_DIR,
    fixtureCount: count,
    status,
  }, null, 1));
  process.exit(0);
}

// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
if (argv.length === 0) die('usage: chromium-receipt-r56.mjs <receipt.json> --driver <driver.mjs> [--expect-driver-sha256 <hex>] [--json] | --selftest | --self-check');
if (argv.includes('--selftest')) {
  if (argv.length !== 1) die('--selftest takes no other argument');
  runSelftest();
}
if (argv.includes('--self-check')) {
  if (argv.length !== 1) die('--self-check takes no other argument');
  runSelfCheck();
}

let receiptArg = null;
let driverArg = null;
let expectSha = null;
let shotDir = null;
let shotGiven = false;
const extraPos = [];
let jsonOut = false;
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--json') { jsonOut = true; continue; }
  if (a === '--driver') { const v = argv[i + 1]; if (!v) die('--driver needs a path'); driverArg = v; i += 1; continue; }
  // --shot is accepted for command compatibility with the frozen claims text:
  // a path names the directory the per-step PNGs sit in; a bare flag is a
  // no-op (the PNGs already resolve against dirname(receipt)). --shot NEVER
  // relaxes a check.
  if (a === '--shot') {
    shotGiven = true;
    const v = argv[i + 1];
    if (v && !v.startsWith('--')) {
      let st = null;
      try { st = fs.statSync(path.resolve(v)); } catch { st = null; }
      if (st && st.isDirectory()) { shotDir = path.resolve(v); i += 1; }
    }
    continue;
  }
  if (a === '--expect-driver-sha256') {
    const v = argv[i + 1];
    if (!v || !/^[0-9a-f]{64}$/.test(v)) die('--expect-driver-sha256 needs 64 lowercase hex chars');
    expectSha = v; i += 1; continue;
  }
  if (a.startsWith('--')) die('unknown flag ' + a);
  if (receiptArg === null) { receiptArg = a; continue; }
  // The frozen C2 command passes `--shot <six per-step PNGs ...>`: extra
  // positionals are accepted only WITH --shot and only as PNG locations.
  extraPos.push(a);
}
let shotFiles = null;
if (extraPos.length > 0) {
  if (!shotGiven) die('more than one receipt path given');
  shotFiles = extraPos.map((x) => path.resolve(x));
}
if (!receiptArg) die('usage: chromium-receipt-r56.mjs <receipt.json> --driver <driver.mjs> [--expect-driver-sha256 <hex>] [--shot <dir>] [--json]');
if (!driverArg) die('usage: chromium-receipt-r56.mjs <receipt.json> --driver <driver.mjs> [--expect-driver-sha256 <hex>] [--shot <dir>] [--json]');

const receiptPath = path.resolve(receiptArg);
const driverPath = path.resolve(driverArg);
const out = checkReceipt({ receiptPath }, { driverPath, expectSha, shotDir, shotFiles });
const result = {
  schema: 'tabi-chrome-cdp-r56-counter',
  receipt: receiptPath,
  driver: driverPath,
  shotDir: shotDir || path.dirname(receiptPath),
  nonce: out.receipt ? out.receipt.nonce : null,
  predicate: out.findings.length === 0,
  findingCount: out.findings.length,
  findings: out.findings,
  couldNotEvaluate: out.couldNotEvaluate,
};
if (jsonOut) {
  console.log(JSON.stringify(result, null, 1));
} else {
  console.log('receipt:   ' + result.receipt);
  console.log('driver:    ' + result.driver);
  console.log('predicate: ' + result.predicate);
  console.log('findings:  ' + result.findingCount);
  for (const f of result.findings) console.log('  - ' + f.id + (f.occurrences > 1 ? ' x' + f.occurrences : '') + ': ' + f.detail);
  for (const c of result.couldNotEvaluate) console.log('  ~ ' + c.code + ': ' + c.detail);
}
process.exit(result.predicate ? 0 : 1);
