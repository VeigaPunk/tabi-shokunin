#!/usr/bin/env node
// Round 76 C1 pre-freeze summary (QUALITY 135/137): requires counter, battery AND kill-power outputs
// for EVERY pre-freeze repetition receipt smoke1..9. Fails closed: a missing or unparsable output
// counts as red, never as absent; a kill-power output with any crashed mutant is red.
// Usage: node prefreeze-summary.mjs [--out <file.json>]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = path.resolve(HERE, '../../../../..');
const CHECKS = JSON.parse(spawnSync(process.execPath, [path.join(LANE, 'scripts/check-dialog-r76.mjs'), '--list-checks'], { encoding: 'utf8' }).stdout).length;
const oi = process.argv.indexOf('--out');
const outFile = oi >= 0 ? process.argv[oi + 1] : null;
const readJ = (f) => { try { return JSON.parse(fs.readFileSync(path.join(HERE, f), 'utf8')); } catch { return null; } };
const readX = (f) => { try { const t = fs.readFileSync(path.join(HERE, f), 'utf8').trim(); return /^\d+$/.test(t) ? Number(t) : null; } catch { return null; } };
const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
  const p = `pf-smoke${n}`;
  const c = readJ('pf/' + p + '.counter.json'), b = readJ('pf/' + p + '.battery.json'), k = readJ('pf/' + p + '.killpower.json');
  const row = {
    receipt: `smoke${n}`, driverExit: readX(`smoke${n}.driver.exit`),
    counter: { exit: readX('pf/' + p + '.counter.exit'), verdict: c?.verdict ?? null, checkCount: c?.checkCount ?? null, findings: c ? c.findings.map((f) => f.id) : null, priors: c?.priorSet?.length ?? null },
    battery: { exit: readX('pf/' + p + '.battery.exit'), passed: b?.passed ?? null, cases: b?.cases ?? null, laundered: b?.launderedCases ?? null, failed: b?.failed ?? null, coverageGap: b?.coverageGap ?? null },
    killPower: { exit: readX('pf/' + p + '.killpower.exit'), forceTrue: k?.forceTrue ?? null, guard: k?.minimumMutantGuard?.ok ?? null, unmutatedLast: k?.unmutatedLastOutcome ?? null, semantic: k?.semantic ?? null, survivors: k?.survivors ?? null, crashed: k?.crashed ?? null, holds: k?.holds ?? null },
  };
  row.ok = row.driverExit === 0 && row.counter.exit === 0 && row.counter.verdict === 'clean' && row.counter.checkCount === CHECKS
    && row.battery.exit === 0 && Array.isArray(row.battery.failed) && row.battery.failed.length === 0 && row.battery.passed === row.battery.cases && row.battery.laundered === 3
    && row.killPower.exit === 0 && row.killPower.holds === true && row.killPower.guard === true && Array.isArray(row.killPower.crashed) && row.killPower.crashed.length === 0;
  return row;
});
const probes = [1, 2, 3, 4].map((n) => { const c = readJ(`pf/pf-p${n}.counter.json`); return { receipt: `p${n}`, driverExit: readX(`probe/p${n}.driver.exit`), counterExit: readX(`pf/pf-p${n}.counter.exit`), verdict: c?.verdict ?? null, checkCount: c?.checkCount ?? null, findings: c ? c.findings.map((f) => f.id) : null, ok: readX(`probe/p${n}.driver.exit`) === 0 && readX(`pf/pf-p${n}.counter.exit`) === 0 && c?.verdict === 'clean' && c?.checkCount === CHECKS }; });
const summary = { schema: 'tabi-r76-prefreeze-summary', checkCount: CHECKS, receipts: rows.length, ok: rows.filter((r) => r.ok).length, probesOk: probes.filter((p) => p.ok).length, allOk: rows.every((r) => r.ok) && probes.every((p) => p.ok), rows, probes };
const text = JSON.stringify(summary, null, 1) + '\n';
if (outFile) fs.writeFileSync(outFile, text);
console.log(rows.map((r) => `${r.ok ? 'ok  ' : 'RED '} ${r.receipt} driver=${r.driverExit} counter=${r.counter.exit}/${r.counter.verdict}/${r.counter.checkCount} battery=${r.battery.exit} ${r.battery.passed}/${r.battery.cases} killpower=${r.killPower.exit} holds=${r.killPower.holds} crashed=${JSON.stringify(r.killPower.crashed)}`).join('\n') + `\nprobes counter clean ${summary.probesOk}/4\nallOk=${summary.allOk} ${summary.ok}/${summary.receipts}`);
process.exit(summary.allOk ? 0 : 1);
