#!/usr/bin/env node
// Pre-freeze kill-power control, tabi round 71 C1 (round-70 routed defect R3: QUALITY 132 proved
// id coverage, not kill power). For EVERY check id the counter declares, build a mutant copy of
// scripts/check-synthpinch-r71.mjs in which that one check always holds (its `ok` forced true),
// place the battery copy beside it, and run the battery against the given real receipt.
// Killed = battery exit 1. The control holds when every one of the N single-check mutants is
// killed and the unmutated copy exits 0.
// Usage: node kill-power.mjs --lane <ABS lane> --real <receipt.json> --expect-driver-sha256 <hex>
//          --work <ABS scratch> --out <summary.json> [--jobs 4]
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const lane = opt('lane'), real = opt('real'), pin = opt('expect-driver-sha256'), work = opt('work'), outFile = opt('out');
const jobs = Number(opt('jobs') || 4);
if (!lane || !real || !pin || !work || !outFile || !path.isAbsolute(work)) { console.error('usage'); process.exit(2); }
const counterSrc = fs.readFileSync(path.join(lane, 'scripts', 'check-synthpinch-r71.mjs'), 'utf8');
const batterySrc = fs.readFileSync(path.join(lane, 'scripts', 'negatives-synthpinch-r71.mjs'), 'utf8');
const ids = JSON.parse(spawnSync(process.execPath, [path.join(lane, 'scripts', 'check-synthpinch-r71.mjs'), '--list-checks'], { encoding: 'utf8' }).stdout);
const HOOK = 'const check = (id, ok, detail) => { checks[id] = !!ok;';
if (!counterSrc.includes(HOOK)) { console.error('hook line not found'); process.exit(2); }
const mk = (name, src) => {
  const d = path.join(work, name); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(path.join(d, 'w'), { recursive: true });
  fs.writeFileSync(path.join(d, 'check-synthpinch-r71.mjs'), src);
  fs.writeFileSync(path.join(d, 'negatives-synthpinch-r71.mjs'), batterySrc);
  return d;
};
const run = (d) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(d, 'negatives-synthpinch-r71.mjs'), '--real', real, '--expect-driver-sha256', pin, '--work', path.join(d, 'w'), '--json'], { stdio: ['ignore', 'pipe', 'ignore'] });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  p.on('exit', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ code, failed: j ? j.failed : null }); });
});
const tasks = [{ id: '(unmutated)', src: counterSrc }, ...ids.map((id) => ({ id, src: counterSrc.replace(HOOK, `const check = (id, ok, detail) => { if (id === ${JSON.stringify(id)}) ok = true; checks[id] = !!ok;`) }))];
const results = new Array(tasks.length);
let next = 0;
await Promise.all(Array.from({ length: jobs }, async () => {
  while (next < tasks.length) {
    const i = next++; const t = tasks[i];
    const d = mk('m' + i, t.src);
    const r = await run(d);
    results[i] = { mutant: t.id, batteryExit: r.code, killed: t.id === '(unmutated)' ? null : r.code === 1, failedCases: r.failed };
    fs.rmSync(d, { recursive: true, force: true });
  }
}));
const base = results[0];
const muts = results.slice(1);
const summary = { schema: 'tabi-r71-kill-power', real, unmutatedExit: base.batteryExit, mutants: muts.length, killed: muts.filter((m) => m.killed).length, survivors: muts.filter((m) => !m.killed).map((m) => m.mutant), holds: base.batteryExit === 0 && muts.every((m) => m.killed), results };
fs.writeFileSync(outFile, JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ unmutatedExit: summary.unmutatedExit, mutants: summary.mutants, killed: summary.killed, survivors: summary.survivors, holds: summary.holds }));
process.exit(summary.holds ? 0 : 1);
