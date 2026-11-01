#!/usr/bin/env node
// teardown-mechanism-fixture.mjs — tabi round 46, claim C1 RED/GREEN control.
// Deterministic reproduction of the r45 teardown-orphan MECHANISM on real OS
// processes (node.exe stands in for the browser; the mechanism is the OS's,
// not the browser's):
//
//   1. a "main" process spawns two long-lived helpers — one attached, one
//      detached — both carrying the launch token in their command lines
//      (mirroring --user-data-dir on browser helpers);
//   2. the fixture SIGKILLs the main pid — exactly what the runner's
//      child.kill('SIGKILL') does, which signals the MAIN process only;
//   3. the legacy teardown replica runs `taskkill /PID <main> /T /F`: with the
//      main already dead the /T tree walk has nothing to walk (its output is
//      recorded verbatim). This is the structural r45 defect: the
//      belt-and-suspenders ran after the main was gone;
//   4. RED limb: the keyed sweep still finds the helpers alive — the orphan
//      class the r45 round-close hit (three re-parented msedge trees);
//   5. GREEN limb: the keyed PID-group kill (kill each survivor BY PID, then
//      re-sweep) reaches 0 — the repair, on the same fixture.
//
// Real processes are spawned and every one of them is reaped (final sweep 0);
// nothing is left running.
import { spawn, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

const token = `r46-mech-${crypto.randomBytes(6).toString('hex')}`;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function sweepOnce(tok) {
  const ps = `$r = @(Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%${tok}%'" | ` +
    `Where-Object { $_.ProcessId -ne $PID }); ConvertTo-Json -InputObject $r -Compress`;
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
    { windowsHide: true, timeout: 30000, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8' });
  if (r.status !== 0) return { error: `exit ${r.status} ${(r.stderr || '').slice(-200)}` };
  let procs = [];
  try { procs = JSON.parse((r.stdout || '').trim() || '[]'); } catch (e) { return { error: `unparseable: ${String(e).slice(-120)}` }; }
  if (!Array.isArray(procs)) procs = [procs];
  return { count: procs.length, pids: procs.map((p) => p.ProcessId), procs: procs.map((p) => ({ pid: p.ProcessId, ppid: p.ParentProcessId, name: p.Name })) };
}

function killByPid(pid) {
  const r = spawnSync('taskkill', ['/PID', String(pid), '/F', '/T'], { windowsHide: true, timeout: 15000, encoding: 'utf8' });
  return { pid, exit: r.status };
}

// --- 1. launch the main + two helpers ----------------------------------------
const mainCode = `
const { spawn } = require('node:child_process');
const token = process.argv[1];
// token is a POSITIONAL arg: node exits 9 (invalid option) on unknown --flags,
// and the token must be in the helper's command line for the keyed sweep.
const helperCode = 'setInterval(()=>{}, 1000);';
const a = spawn(process.execPath, ['-e', helperCode, 'tabi46tok=' + token], { stdio: 'ignore' });
const b = spawn(process.execPath, ['-e', helperCode, 'tabi46tok=' + token], { stdio: 'ignore', detached: true });
b.unref();
console.log(JSON.stringify({ helperA: a.pid, helperB: b.pid }));
setInterval(()=>{}, 1000);
`;
const main = spawn(process.execPath, ['-e', mainCode, token], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
let mainOut = '';
main.stdout.on('data', (d) => { mainOut += d.toString(); });

let helperPids = null;
for (let i = 0; i < 50 && !helperPids; i++) {
  await sleep(100);
  try { helperPids = JSON.parse(mainOut); } catch { }
}
if (!helperPids) {
  try { main.kill('SIGKILL'); } catch { }
  console.error(JSON.stringify({ schema: 'tabi-r46-teardown-mechanism', error: 'main never reported helper pids' }));
  process.exit(2);
}
await sleep(700); // let both helpers reach the process table

// --- pre-kill census ----------------------------------------------------------
const preKill = sweepOnce(token);

// --- 2. SIGKILL the main (the r45 runner's actual teardown primitive) ---------
const tKillMs = Date.now();
try { process.kill(main.pid, 'SIGKILL'); } catch (e) { /* already gone */ }
await sleep(800);

// --- 3. legacy tree-kill replica ----------------------------------------------
const legacyTreeKill = (() => {
  const r = spawnSync('taskkill', ['/PID', String(main.pid), '/T', '/F'], { windowsHide: true, timeout: 15000, encoding: 'utf8' });
  return { ran: true, pid: main.pid, exit: r.status, output: ((r.stdout || '') + (r.stderr || '')).trim().slice(-300) };
})();

// --- 4. RED limb: survivors after the legacy teardown -------------------------
const survivors = sweepOnce(token);

// --- 5. GREEN limb: keyed PID-group kill to zero -------------------------------
const recovered = (survivors.pids || []).map(killByPid);
await sleep(400);
const finalSweep = sweepOnce(token);

const receipt = {
  schema: 'tabi-r46-teardown-mechanism',
  token,
  mainPid: main.pid,
  helperPids,
  preKillSweep: { count: preKill.count, pids: preKill.pids },
  sigkillMain: { ran: true, pid: main.pid, atMs: tKillMs },
  legacyTreeKill,
  survivorsAfterLegacyTeardown: { count: survivors.count, pids: survivors.pids, procs: survivors.procs },
  keyedKillRecovered: recovered,
  postKeyedKillSweepCount: finalSweep.count,
  ok: finalSweep.count === 0,
};
// red: the legacy teardown left live launch processes behind (>=1 survivor);
// green: the keyed kill then reached 0. Both limbs on one fixture, real processes.
receipt.mechanismRed = survivors.count >= 1;
receipt.mechanismGreen = receipt.ok;

const outPath = process.argv[2];
if (outPath) fs.writeFileSync(outPath, JSON.stringify(receipt, null, 1) + '\n');
console.log(JSON.stringify({
  schema: receipt.schema, mainPid: receipt.mainPid, preKillCount: preKill.count,
  legacyTreeKillExit: legacyTreeKill.exit, legacyTreeKillOutput: legacyTreeKill.output,
  survivorsCount: survivors.count, survivorsPids: survivors.pids,
  postKeyedKillSweepCount: receipt.postKeyedKillSweepCount,
  mechanismRed: receipt.mechanismRed, mechanismGreen: receipt.mechanismGreen,
}));
process.exit(receipt.mechanismRed && receipt.mechanismGreen ? 0 : 1);
