#!/usr/bin/env node
// R58Sentinel probe: attack the C2 kill rule "the counter is green on anything
// but the committed receipt (synthetic-green)".
//
// Method: take the REAL live receipt, then FORGE the swallow evidence in
// three independent ways and confirm the counter refuses each:
//   G1  a receipt whose swallowLeg claims defaultPrevented=true while the
//       PAGE keylog says false (the recorded claim contradicts the page).
//   G2  a receipt whose swallowLeg claims a swallowed Enter + no submission
//       while the page keylog has NO such entries at all (a wholly invented
//       swallow leg) and the server request log has a second /echo.
//   G3  a receipt whose fixtureDelta claims the additive fields while the
//       page keylog entries lack them.
//   G4  a receipt whose serverRequests claims TWO submissions.
//   G5  a receipt whose field3Value/field3Final are blank (the r57 shape) even
//       though the swallow leg typed a two-char prefix.
//
// Usage: node synthetic-green-attack.mjs <counter.mjs> <liveReceipt.json> <driver.mjs> <scratchAbs>
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const counter = process.argv[2];
const liveReceipt = process.argv[3];
const driver = process.argv[4];
const scratch = process.argv[5];
fs.mkdirSync(scratch, { recursive: true });

const out = { schema: 'r58sentinel-synthetic-green-attack-v1', legs: [], findings: [] };
const add = (id, detail) => out.findings.push({ id, detail: String(detail) });

const base = JSON.parse(fs.readFileSync(liveReceipt, 'utf8'));
// The counter resolves each step PNG RELATIVE TO THE RECEIPT'S OWN DIRECTORY.
// The forged receipts must therefore live in the SAME directory as the live
// receipt, or every PNG check would fail for an unrelated reason and mask the
// swallow findings under test.
const LIVE_DIR = path.dirname(liveReceipt);
const FORGE_DIR = path.join(scratch, 'forged');
fs.mkdirSync(FORGE_DIR, { recursive: true });
// mirror the live receipt's PNGs into the forge dir
for (const f of fs.readdirSync(LIVE_DIR)) {
  if (/\.png$/.test(f)) { try { fs.copyFileSync(path.join(LIVE_DIR, f), path.join(FORGE_DIR, f)); } catch {} }
}

function runCounter(receiptPath) {
  const r = spawnSync('node', [counter, receiptPath, '--driver', driver, '--shot', path.dirname(receiptPath), '--json'], { encoding: 'utf8', timeout: 120000 });
  let v = null;
  try { v = JSON.parse(r.stdout); } catch { /* not json */ }
  return { exit: r.status, predicate: v ? v.predicate : null, findings: v ? (v.findings || []).map((f) => f.id) : null, couldNotEvaluate: v ? v.couldNotEvaluate : null, raw: String(r.stdout || '').slice(0, 800) };
}

// locate the swallow-leg keylog entries in the receipt
const kl = base.journey && base.journey.form ? (base.journey.form.pageKeylog || []) : [];
function clone() { return JSON.parse(JSON.stringify(base)); }

// G1 — recorded defaultPrevented=true vs the page keylog's false
{
  const rec = clone();
  const sl = rec.journey.form.swallowLeg;
  sl.backspaceSwallow.defaultPrevented = true;
  sl.backspaceSwallow.keylogEntry.defaultPrevented = true;
  // but the PAGE keylog still says false
  const p = path.join(FORGE_DIR, 'g1-recorded-vs-page.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'G1-recorded-vs-page', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('counter-green-on-forged-defaultprevented', 'G1: the counter accepted a receipt whose recorded defaultPrevented contradicts the page keylog (predicate=' + res.predicate + ')');
  if (!res.findings || !res.findings.length) add('counter-silent-on-forged-defaultprevented', 'G1: no finding emitted');
}

// G2 — a wholly invented swallow leg: the page keylog has no swallowed Enter
{
  const rec = clone();
  const sl = rec.journey.form.swallowLeg;
  sl.enterChordSwallow.enterKeylogEntry = { type: 'keyDown', key: 'Enter', code: 'Enter', keyCode: 13, modifiers: 2, cancelable: true, defaultPrevented: true, ctrlKey: true, altKey: false, metaKey: false, shiftKey: false, targetId: 'field3' };
  sl.enterChordSwallow.bothKeydownsDelivered = true;
  sl.enterChordSwallow.defaultPrevented = true;
  sl.enterChordSwallow.submitted = false;
  sl.enterChordSwallow.newRequests = [];
  const p = path.join(FORGE_DIR, 'g2-invented-swallow-leg.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'G2-invented-swallow-leg', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('counter-green-on-invented-swallow-leg', 'G2: the counter accepted a swallow leg absent from the page keylog (predicate=' + res.predicate + ')');
}

// G3 — fixtureDelta claims the additive fields while the page keylog lacks them
{
  const rec = clone();
  rec.fixtureDelta.witness.allCarryAdditiveFields = true;
  const p = path.join(FORGE_DIR, 'g3-fixturedelta-claim.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'G3-fixturedelta-claim', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('counter-green-on-false-fixturedelta-claim', 'G3: the counter accepted a fixtureDelta claim the page keylog does not support (predicate=' + res.predicate + ')');
}

// G4 — two submissions in the server request log
{
  const rec = clone();
  const sr = rec.journey.form.serverRequests;
  const echo = sr.find((r) => r.path === '/echo');
  if (echo) { const dup = { path: echo.path, query: echo.query }; sr.splice(sr.indexOf(echo) + 1, 0, dup); }
  const p = path.join(FORGE_DIR, 'g4-two-submissions.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'G4-two-submissions', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('counter-green-on-two-submissions', 'G4: the counter accepted two /echo requests (predicate=' + res.predicate + ')');
}

// G5 — field3 blanked (the r57 shape) although the swallow leg typed a prefix
{
  const rec = clone();
  rec.field3Value = '';
  rec.field3Final = '';
  const p = path.join(FORGE_DIR, 'g5-field3-blanked.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'G5-field3-blanked', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('counter-green-on-blanked-field3', 'G5: the counter accepted a receipt whose field3 contradicts the swallow leg (predicate=' + res.predicate + ')');
}

// control: the UNMODIFIED live receipt must still be GREEN
{
  const p = path.join(FORGE_DIR, 'g0-unmodified.json');
  fs.writeFileSync(p, JSON.stringify(base, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'G0-unmodified-control', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== true) add('control-not-green', 'G0: the unmodified live receipt did not score green (predicate=' + res.predicate + ' findings=' + JSON.stringify(res.findings) + ')');
}

out.findingCount = out.findings.length;
out.predicate = out.findingCount === 0;
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
