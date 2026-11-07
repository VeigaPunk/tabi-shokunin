#!/usr/bin/env node
// Round 77 C1 pre-freeze summary (QUALITY 135/137/139/144): requires counter AND battery outputs for
// EVERY honest pre-freeze receipt (probes p1-p4, smokes 1-9) and kill-power output for every smoke.
// Fails closed: a missing or unparsable output counts as red, never as absent; a kill-power output
// with any crashed mutant is red. Also reports, from the counters' own `limit` blocks, the largest
// matched counts any honest receipt reached against any other (QUALITY 139: the replay rule must
// refuse zero honest pairs).
// Usage: node prefreeze-summary.mjs [--out <file.json>]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = path.resolve(HERE, '../../../../..');
const CHECKS = JSON.parse(spawnSync(process.execPath, [path.join(LANE, 'scripts/check-filechooser-r77.mjs'), '--list-checks'], { encoding: 'utf8' }).stdout).length;
const oi = process.argv.indexOf('--out');
const outFile = oi >= 0 ? process.argv[oi + 1] : null;
const readJ = (f) => { try { return JSON.parse(fs.readFileSync(path.join(HERE, f), 'utf8')); } catch { return null; } };
const readX = (f) => { try { const t = fs.readFileSync(path.join(HERE, f), 'utf8').trim(); return /^\d+$/.test(t) ? Number(t) : null; } catch { return null; } };
const names = [...[1, 2, 3, 4].map((n) => ['p' + n, `probe/p${n}.driver.exit`, false]), ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ['smoke' + n, `smoke${n}.driver.exit`, true])];
let maxAbs = 0, maxGap = 0, refusedPairs = 0, pairs = 0;
const rows = names.map(([k, dx, kp]) => {
  const c = readJ(`pf/pf-${k}.counter.json`), b = readJ(`pf/pf-${k}.battery.json`), m = kp ? readJ(`pf/pf-${k}.killpower.json`) : null;
  for (const s of (c && Array.isArray(c.limit) ? c.limit : [])) { if (/\/(shape-s\d|degenerate-[a-z-]+)\.receipt\.json$/.test(s.prior)) continue; pairs++; maxAbs = Math.max(maxAbs, s.absMatched); maxGap = Math.max(maxGap, s.gapMatched); if (s.refused) refusedPairs++; }
  const row = {
    receipt: k, driverExit: readX(dx),
    counter: { exit: readX(`pf/pf-${k}.counter.exit`), verdict: c?.verdict ?? null, checkCount: c?.checkCount ?? null, findings: c ? c.findings.map((f) => f.id) : null, priors: c?.priorSet?.length ?? null },
    battery: { exit: readX(`pf/pf-${k}.battery.exit`), passed: b?.passed ?? null, cases: b?.cases ?? null, laundered: b?.launderedCases ?? null, failed: b?.failed ?? null, coverageGap: b?.coverageGap ?? null, brackets: b?.brackets ?? null },
    killPower: kp ? { exit: readX(`pf/pf-${k}.killpower.exit`), forceTrue: m?.forceTrue ?? null, guard: m?.minimumMutantGuard?.ok ?? null, unmutatedLast: m?.unmutatedLastOutcome ?? null, semantic: m?.semantic ?? null, survivors: m?.survivors ?? null, crashed: m?.crashed ?? null, holds: m?.holds ?? null } : null,
  };
  row.ok = row.driverExit === 0 && row.counter.exit === 0 && row.counter.verdict === 'clean' && row.counter.checkCount === CHECKS
    && row.battery.exit === 0 && Array.isArray(row.battery.failed) && row.battery.failed.length === 0 && row.battery.passed === row.battery.cases && row.battery.laundered === 3
    && (!kp || (row.killPower.exit === 0 && row.killPower.holds === true && row.killPower.guard === true && Array.isArray(row.killPower.crashed) && row.killPower.crashed.length === 0));
  return row;
});
const summary = { schema: 'tabi-r77-prefreeze-summary', checkCount: CHECKS, receipts: rows.length, ok: rows.filter((r) => r.ok).length,
  honestPairs: { pairs, refused: refusedPairs, maxAbsMatched: maxAbs, maxGapMatched: maxGap, note: 'from each counter limit block, prior = every other honest receipt (shape probes and degenerates excluded); needs per prior are 40 of 79 events and 9 of 11 gaps' },
  allOk: rows.every((r) => r.ok) && refusedPairs === 0, rows };
const text = JSON.stringify(summary, null, 1) + '\n';
if (outFile) fs.writeFileSync(outFile, text);
console.log(rows.map((r) => `${r.ok ? 'ok  ' : 'RED '} ${r.receipt} driver=${r.driverExit} counter=${r.counter.exit}/${r.counter.verdict}/${r.counter.checkCount} battery=${r.battery.exit} ${r.battery.passed}/${r.battery.cases}` + (r.killPower ? ` killpower=${r.killPower.exit} holds=${r.killPower.holds} crashed=${JSON.stringify(r.killPower.crashed)} survivors=${JSON.stringify(r.killPower.survivors)}` : '')).join('\n')
  + `\nhonest pairs ${pairs}: refused ${refusedPairs}, max abs ${maxAbs}/40, max gap ${maxGap}/9\nallOk=${summary.allOk} ${summary.ok}/${summary.receipts}`);
process.exitCode = summary.allOk ? 0 : 1;
