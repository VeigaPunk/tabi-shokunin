#!/usr/bin/env node
// R58Sentinel probe: pin the exact boundary of the F1/Q2 finding.
//
// Hypothesis: the counter compares the PAGE keylog (journey.form.pageKeylog)
// against the derived plan for IDENTITY/COUNT/MODIFIERS/BOOLEANS, but never
// for the two VALUES the r58 claim is about: `cancelable` and
// `defaultPrevented`. The swallow witness therefore comes only from the
// driver-recorded block.
//
//   B1  page keylog cancelable=false, block cancelable=true  -> ?
//   B2  page keylog defaultPrevented=false, block=true        -> ? (Q2)
//   B3  page keylog defaultPrevented=true on the CONTROL digit (which must be
//       false), block=false -> ?
//   B4  swap the block's keylogEntry for a DIFFERENT key than the page's
//       entry at the same position -> ?
//   B5  the block's keylogEntry defaultPrevented is true but the PAGE's entry
//       for the same key is ABSENT from the page keylog (block-only witness)
//
// Usage: node swallow-flag-source-boundary.mjs <counter.mjs> <liveReceipt.json> <driver.mjs> <scratchAbs>
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const counter = process.argv[2];
const liveReceipt = process.argv[3];
const driver = process.argv[4];
const scratch = process.argv[5];
fs.mkdirSync(scratch, { recursive: true });

const out = { schema: 'r58sentinel-swallow-flag-source-boundary-v1', legs: [], findings: [] };
const add = (id, detail) => out.findings.push({ id, detail: String(detail) });

const base = JSON.parse(fs.readFileSync(liveReceipt, 'utf8'));
const LIVE_DIR = path.dirname(liveReceipt);
const FORGE_DIR = path.join(scratch, 'forged');
fs.mkdirSync(FORGE_DIR, { recursive: true });
for (const f of fs.readdirSync(LIVE_DIR)) {
  if (/\.png$/.test(f)) { try { fs.copyFileSync(path.join(LIVE_DIR, f), path.join(FORGE_DIR, f)); } catch {} }
}
const clone = () => JSON.parse(JSON.stringify(base));
function runCounter(p) {
  const r = spawnSync('node', [counter, p, '--driver', driver, '--shot', FORGE_DIR, '--json'], { encoding: 'utf8', timeout: 120000 });
  let v = null;
  try { v = JSON.parse(r.stdout); } catch { /* not json */ }
  return { exit: r.status, predicate: v ? v.predicate : null, findings: v ? (v.findings || []).map((f) => f.id) : null };
}
const pk = (rec) => rec.journey.form.pageKeylog;
const pageEntry = (rec, key, target) => pk(rec).find((e) => e && e.type === 'keyDown' && e.key === key && e.targetId === target);

// B1 — page cancelable=false, block cancelable=true
{
  const rec = clone();
  const pe = pageEntry(rec, 'Backspace', 'field3');
  let t = 0;
  if (pe) { pe.cancelable = false; t = 1; }
  const p = path.join(FORGE_DIR, 'b1-page-cancelable-false.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'B1-page-cancelable-false-block-true', touched: t, exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('page-cancelable-value-never-checked', 'B1: the page keylog says cancelable=false while the block says true; the counter stayed green');
}

// B2 — page defaultPrevented=false, block true (the Q2 case)
{
  const rec = clone();
  const pe = pageEntry(rec, 'Backspace', 'field3');
  let t = 0;
  if (pe) { pe.defaultPrevented = false; t = 1; }
  const p = path.join(FORGE_DIR, 'b2-page-dp-false.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'B2-page-dp-false-block-true', touched: t, exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('page-defaultprevented-value-never-checked', 'B2: the page keylog says defaultPrevented=false while the block says true; the counter stayed green');
}

// B3 — the CONTROL digit (must be defaultPrevented FALSE) claims TRUE on the page
{
  const rec = clone();
  const sl = rec.journey.form.swallowLeg;
  const c1 = sl.control.typed[0];
  const pe = pageEntry(rec, c1, 'field3');
  let t = 0;
  if (pe) { pe.defaultPrevented = true; t = 1; }
  const p = path.join(FORGE_DIR, 'b3-page-control-dp-true.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'B3-page-control-dp-true', controlChar: c1, touched: t, exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('page-control-defaultprevented-never-checked', 'B3: the page keylog says the CONTROL (gate OFF) digit was defaultPrevented=true; the counter stayed green');
}

// B4 — the block's keylogEntry is a DIFFERENT key than the page's entry
{
  const rec = clone();
  const sl = rec.journey.form.swallowLeg;
  sl.backspaceSwallow.keylogEntry = { type: 'keyDown', key: 'Tab', code: 'Tab', keyCode: 9, modifiers: 0, cancelable: true, defaultPrevented: true, ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, targetId: 'field3' };
  const p = path.join(FORGE_DIR, 'b4-block-key-swapped.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'B4-block-entry-key-swapped', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('block-entry-key-not-cross-checked-against-page', 'B4: the block claims a swallowed Tab instead of the swallowed Backspace; the counter stayed green');
}

// B5 — the block's keylogEntry survives while the page's entry for that key is absent
{
  const rec = clone();
  const sl = rec.journey.form.swallowLeg;
  // remove the page's Backspace-at-field3 entry but ADD a filler so the count stays
  const before = pk(rec).length;
  const kept = pk(rec).filter((e) => !(e && e.type === 'keyDown' && e.key === 'Backspace' && e.targetId === 'field3'));
  rec.journey.form.pageKeylog = kept;
  const p = path.join(FORGE_DIR, 'b5-page-entry-absent.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'B5-page-entry-absent', removed: before - kept.length, exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('block-only-witness-accepted', 'B5: the page keylog has no swallowed Backspace but the block alone carries the witness; the counter stayed green');
}

// control
{
  const p = path.join(FORGE_DIR, 'b0-unmodified.json');
  fs.writeFileSync(p, JSON.stringify(base, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'B0-unmodified-control', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== true) add('control-not-green', 'B0: the unmodified live receipt did not score green: ' + JSON.stringify(res.findings));
}

out.findingCount = out.findings.length;
out.predicate = out.findingCount === 0;
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
