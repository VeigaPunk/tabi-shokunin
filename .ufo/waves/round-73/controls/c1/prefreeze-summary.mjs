#!/usr/bin/env node
// Round 73 C1 pre-freeze summary (QUALITY 135): requires counter, battery AND kill-power outputs
// for EVERY pre-freeze repetition receipt smoke1..9. Fails closed: a missing or unparsable output
// counts as red, never as absent. Usage: node prefreeze-summary.mjs [--out <file.json>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const oi = process.argv.indexOf('--out');
const outFile = oi >= 0 ? process.argv[oi + 1] : null;
const readJ = (f) => { try { return JSON.parse(fs.readFileSync(path.join(HERE, f), 'utf8')); } catch { return null; } };
const readX = (f) => { try { return Number(fs.readFileSync(path.join(HERE, f), 'utf8').trim()); } catch { return null; } };
const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
  const p = `pf-smoke${n}`;
  const c = readJ(p + '.counter.json'), b = readJ(p + '.battery.json'), k = readJ(p + '.killpower.json');
  const row = {
    receipt: `smoke${n}`, driverExit: readX(`smoke${n}.driver.exit`),
    counter: { exit: readX(p + '.counter.exit'), verdict: c?.verdict ?? null, checkCount: c?.checkCount ?? null, findings: c ? c.findings.map((f) => f.id) : null },
    battery: { exit: readX(p + '.battery.exit'), passed: b?.passed ?? null, cases: b?.cases ?? null, failed: b?.failed ?? null, coverageGap: b?.coverageGap ?? null },
    killPower: { exit: readX(p + '.killpower.exit'), forceTrue: k?.forceTrue ?? null, semantic: k?.semantic ?? null, survivors: k?.survivors ?? null, holds: k?.holds ?? null },
  };
  row.ok = row.driverExit === 0 && row.counter.exit === 0 && row.counter.verdict === 'clean' && row.counter.checkCount === 98
    && row.battery.exit === 0 && Array.isArray(row.battery.failed) && row.battery.failed.length === 0 && row.battery.passed === row.battery.cases
    && row.killPower.exit === 0 && row.killPower.holds === true;
  return row;
});
const summary = { schema: 'tabi-r73-prefreeze-summary', receipts: rows.length, ok: rows.filter((r) => r.ok).length, allOk: rows.every((r) => r.ok), rows };
const text = JSON.stringify(summary, null, 1) + '\n';
if (outFile) fs.writeFileSync(outFile, text);
console.log(rows.map((r) => `${r.ok ? 'ok  ' : 'RED '} ${r.receipt} driver=${r.driverExit} counter=${r.counter.exit}/${r.counter.verdict}/${r.counter.checkCount} battery=${r.battery.exit} ${r.battery.passed}/${r.battery.cases} killpower=${r.killPower.exit} holds=${r.killPower.holds}`).join('\n') + `\nallOk=${summary.allOk} ${summary.ok}/${summary.receipts}`);
process.exit(summary.allOk ? 0 : 1);
