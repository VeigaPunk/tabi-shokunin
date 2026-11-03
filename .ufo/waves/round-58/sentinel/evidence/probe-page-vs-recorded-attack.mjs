#!/usr/bin/env node
// R58Sentinel probe: the decisive C2 synthetic-green attack.
//
// The C2 kill rule: "a swallow witness rests on driver-side state instead of
// page/server state" kills the claim. The counter's swallow checks read the
// RECORDED block (swallowLeg.*.keylogEntry / .defaultPrevented) and fall back
// to the PAGE keylog (journey.form.pageKeylog) only when the block has no
// matching entry.
//
// Attack: forge the receipt so the PAGE's OWN keylog contradicts (or omits)
// the swallowed keystroke, while the recorded block still claims it. If the
// counter stays green, the swallow witness rests on driver-recorded state
// rather than on page state.
//
//   F1  the PAGE keylog's backspace entry says defaultPrevented=false while
//       the recorded block says true.
//   F2  the PAGE keylog has NO backspace entry at all (the page never saw a
//       swallowed Backspace) while the recorded block claims one.
//   F3  the PAGE keylog has NO swallowed-digit entry at all.
//   F4  the PAGE keylog has NO Enter chord entry at all.
//
// Usage: node page-vs-recorded-attack.mjs <counter.mjs> <liveReceipt.json> <driver.mjs> <scratchAbs>
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const counter = process.argv[2];
const liveReceipt = process.argv[3];
const driver = process.argv[4];
const scratch = process.argv[5];
fs.mkdirSync(scratch, { recursive: true });

const out = { schema: 'r58sentinel-page-vs-recorded-attack-v1', legs: [], findings: [] };
const add = (id, detail) => out.findings.push({ id, detail: String(detail) });

const base = JSON.parse(fs.readFileSync(liveReceipt, 'utf8'));
const LIVE_DIR = path.dirname(liveReceipt);
const FORGE_DIR = path.join(scratch, 'forged');
fs.mkdirSync(FORGE_DIR, { recursive: true });
for (const f of fs.readdirSync(LIVE_DIR)) {
  if (/\.png$/.test(f)) { try { fs.copyFileSync(path.join(LIVE_DIR, f), path.join(FORGE_DIR, f)); } catch {} }
}

function runCounter(p) {
  const r = spawnSync('node', [counter, p, '--driver', driver, '--shot', FORGE_DIR, '--json'], { encoding: 'utf8', timeout: 120000 });
  let v = null;
  try { v = JSON.parse(r.stdout); } catch { /* not json */ }
  return { exit: r.status, predicate: v ? v.predicate : null, findings: v ? (v.findings || []).map((f) => f.id) : null, raw: String(r.stdout || '').slice(0, 500) };
}

const clone = () => JSON.parse(JSON.stringify(base));
const pageKd = (rec) => (rec.journey && rec.journey.form && Array.isArray(rec.journey.form.pageKeylog)) ? rec.journey.form.pageKeylog : null;

// F1 — the page keylog says the Backspace was NOT prevented; the recorded block says it was
{
  const rec = clone();
  const pk = pageKd(rec);
  let touched = 0;
  for (const e of pk) {
    if (e && e.type === 'keyDown' && e.key === 'Backspace' && e.targetId === 'field3') { e.defaultPrevented = false; touched++; }
  }
  const p = path.join(FORGE_DIR, 'f1-page-says-not-prevented.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'F1-page-keylog-says-not-prevented', pageEntriesTouched: touched, exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('counter-green-when-page-keylog-contradicts', 'F1: the page keylog records defaultPrevented=false for the swallowed Backspace but the counter stayed green (predicate=' + res.predicate + ')');
}

// F2 — the page keylog has NO backspace entry at all
{
  const rec = clone();
  const pk = pageKd(rec);
  const before = pk.length;
  const kept = pk.filter((e) => !(e && e.type === 'keyDown' && e.key === 'Backspace' && e.targetId === 'field3'));
  rec.journey.form.pageKeylog = kept;
  const p = path.join(FORGE_DIR, 'f2-page-has-no-backspace.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'F2-page-keylog-omits-backspace', removed: before - kept.length, exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('counter-green-when-page-keylog-omits-swallowed-key', 'F2: the page keylog has no swallowed Backspace at all but the counter stayed green (predicate=' + res.predicate + ')');
}

// F3 — the page keylog has NO swallowed-digit entry
{
  const rec = clone();
  const pk = pageKd(rec);
  const sl = rec.journey.form.swallowLeg;
  const dgChar = sl.digitSwallow && sl.digitSwallow.char;
  const before = pk.length;
  const kept = pk.filter((e) => !(e && e.type === 'keyDown' && dgChar && e.key === dgChar && e.targetId === 'field3'));
  rec.journey.form.pageKeylog = kept;
  const p = path.join(FORGE_DIR, 'f3-page-has-no-digit.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'F3-page-keylog-omits-digit', digitChar: dgChar, removed: before - kept.length, exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('counter-green-when-page-keylog-omits-swallowed-digit', 'F3: the page keylog has no swallowed digit but the counter stayed green (predicate=' + res.predicate + ')');
}

// F4 — the page keylog has NO Enter chord entry (the swallowed chord)
{
  const rec = clone();
  const pk = pageKd(rec);
  const before = pk.length;
  const kept = pk.filter((e) => !(e && e.type === 'keyDown' && e.key === 'Enter' && e.targetId === 'field3'));
  rec.journey.form.pageKeylog = kept;
  const p = path.join(FORGE_DIR, 'f4-page-has-no-enter-chord.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'F4-page-keylog-omits-enter-chord', removed: before - kept.length, exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) add('counter-green-when-page-keylog-omits-swallowed-chord', 'F4: the page keylog has no swallowed Enter chord but the counter stayed green (predicate=' + res.predicate + ')');
}

// control: the unmodified live receipt must be GREEN
{
  const p = path.join(FORGE_DIR, 'f0-unmodified.json');
  fs.writeFileSync(p, JSON.stringify(base, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'F0-unmodified-control', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== true) add('control-not-green', 'F0: the unmodified live receipt did not score green: ' + JSON.stringify(res.findings));
}

out.findingCount = out.findings.length;
out.predicate = out.findingCount === 0;
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
