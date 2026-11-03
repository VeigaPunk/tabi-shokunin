#!/usr/bin/env node
// R58Sentinel probe: characterise the F1 finding precisely.
//
// Q1: does the counter trust the RECORDED BLOCK's defaultPrevented over the
//     PAGE keylog's? (forge block=false, page=true  -> expect a finding if
//     the block is the authority)
// Q2: is the page keylog's defaultPrevented ever compared to the DERIVED
//     expectation? (forge page=false, block=true -> expect NO finding if the
//     page value is never checked)
// Q3: does fixtureDelta.witness.allCarryAdditiveFields=true survive when the
//     page keylog entries no longer carry the two additive fields?
//
// Usage: node swallow-witness-source.mjs <counter.mjs> <liveReceipt.json> <driver.mjs> <scratchAbs>
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const counter = process.argv[2];
const liveReceipt = process.argv[3];
const driver = process.argv[4];
const scratch = process.argv[5];
fs.mkdirSync(scratch, { recursive: true });

const out = { schema: 'r58sentinel-swallow-witness-source-v1', legs: [], findings: [] };
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
const bsEntry = (rec) => rec.journey.form.swallowLeg.backspaceSwallow.keylogEntry;

// Q1 — the BLOCK says false, the PAGE says true
{
  const rec = clone();
  rec.journey.form.swallowLeg.backspaceSwallow.defaultPrevented = false;
  rec.journey.form.swallowLeg.backspaceSwallow.keylogEntry.defaultPrevented = false;
  // page keeps defaultPrevented=true
  const p = path.join(FORGE_DIR, 'q1-block-false-page-true.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'Q1-block-false-page-true', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false || !(res.findings || []).includes('swallow-defaultprevented-missing')) {
    add('counter-does-not-honour-the-recorded-block', 'Q1: with the recorded block saying defaultPrevented=false the counter did NOT emit swallow-defaultprevented-missing (findings=' + JSON.stringify(res.findings) + ')');
  }
}

// Q2 — the PAGE says false, the BLOCK says true (the F1 case, re-confirmed)
{
  const rec = clone();
  let touched = 0;
  for (const e of pk(rec)) {
    if (e && e.type === 'keyDown' && e.key === 'Backspace' && e.targetId === 'field3') { e.defaultPrevented = false; touched++; }
  }
  const p = path.join(FORGE_DIR, 'q2-page-false-block-true.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'Q2-page-false-block-true', pageEntriesTouched: touched, exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) {
    add('page-keylog-defaultprevented-never-checked',
      'Q2: the PAGE keylog says the swallowed Backspace was NOT prevented while the recorded block says it was; the counter stayed green (predicate=' + res.predicate + ' findings=' + JSON.stringify(res.findings) + '). The swallow witness therefore rests on the driver-recorded block, not on the page keylog.');
  }
}

// Q3 — fixtureDelta claims the additive fields while the page keylog drops them
{
  const rec = clone();
  for (const e of pk(rec)) { if (e && typeof e === 'object') { delete e.cancelable; delete e.defaultPrevented; } }
  rec.fixtureDelta.witness.allCarryAdditiveFields = true;
  const p = path.join(FORGE_DIR, 'q3-fixturedelta-vs-page.json');
  fs.writeFileSync(p, JSON.stringify(rec, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'Q3-fixturedelta-claim-vs-page', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== false) {
    add('fixturedelta-claim-not-cross-checked-against-page',
      'Q3: fixtureDelta.witness.allCarryAdditiveFields=true was accepted although the page keylog entries no longer carry cancelable/defaultPrevented (predicate=' + res.predicate + ' findings=' + JSON.stringify(res.findings) + ')');
  }
}

// control
{
  const p = path.join(FORGE_DIR, 'q0-unmodified.json');
  fs.writeFileSync(p, JSON.stringify(base, null, 1));
  const res = runCounter(p);
  out.legs.push({ leg: 'Q0-unmodified-control', exit: res.exit, predicate: res.predicate, findings: res.findings });
  if (res.predicate !== true) add('control-not-green', 'Q0: the unmodified live receipt did not score green: ' + JSON.stringify(res.findings));
}

out.findingCount = out.findings.length;
out.predicate = out.findingCount === 0;
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
