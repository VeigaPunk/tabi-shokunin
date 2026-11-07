#!/usr/bin/env node
// Fail-closed summary of the round-78 C1 pre-freeze gate pass (QUALITY 135/137/139/144).
// Usage: node .ufo/waves/round-78/controls/c1/prefreeze-summary.mjs [--json]
// Reads pf/out/pf-<k>.{counter,battery,killpower}.json for the enumerated receipt set and fails
// (exit 1) on a missing or unparsable file, a non-clean counter, a battery that is not allOk, or a
// kill power that does not hold. An absent kill-power output is red for the receipts that must have
// one (KEYS_SEM) and skipped for the rest.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'pf/out');
const KEYS = ['p1', 'p2', 'p3', 'p4', 's1', 's2', 's3'];
const KEYS_SEM = ['p1', 's1', 's2', 's3'];
const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const rows = [];
const problems = [];
for (const k of KEYS) {
  const c = read(path.join(OUT, 'pf-' + k + '.counter.json'));
  const b = read(path.join(OUT, 'pf-' + k + '.battery.json'));
  const kp = read(path.join(OUT, 'pf-' + k + '.killpower.json'));
  const row = { key: k, counter: c ? c.verdict : 'missing', counterChecks: c ? c.checkCount : null,
    battery: b ? b.allOk : 'missing', batteryCases: b ? b.cases : null, batteryPassed: b ? b.passed : null,
    killpower: kp ? kp.holds : (KEYS_SEM.includes(k) ? 'missing' : null) };
  rows.push(row);
  if (!c || c.verdict !== 'clean') problems.push(k + ': counter ' + row.counter);
  if (!b || b.allOk !== true) problems.push(k + ': battery allOk ' + row.battery);
  if (KEYS_SEM.includes(k) && (!kp || kp.holds !== true)) problems.push(k + ': killpower ' + row.killpower);
}
const out = { schema: 'tabi-prefreeze-summary-r78', receipts: rows.length, counterClean: rows.filter((r) => r.counter === 'clean').length,
  batteryAllOk: rows.filter((r) => r.battery === true).length, killpowerHeld: rows.filter((r) => r.killpower === true).length,
  allOk: problems.length === 0, problems, rows };
const emit = (s) => { const b = Buffer.from(s); let off = 0; while (off < b.length) { try { off += fs.writeSync(1, b, off); } catch (e) { if (e.code !== 'EAGAIN') throw e; } } };
emit(process.argv.includes('--json') ? JSON.stringify(out, null, 1) + '\n'
  : `prefreeze counter=${out.counterClean}/${out.receipts} battery=${out.batteryAllOk}/${out.receipts} killpower=${out.killpowerHeld}/${KEYS_SEM.length} allOk=${out.allOk} problems=${problems.join('; ') || 'none'}\n`);
process.exitCode = out.allOk ? 0 : 1;
