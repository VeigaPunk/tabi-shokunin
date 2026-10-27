// LabratC2 probe 2 — realistic leak vectors + cross-run isolation + count semantics.
// Uses the FROZEN scratchSurvivors bytes extracted verbatim from the frozen blob.
import { readdirSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FREEZE = '99437d29de036415a9f2d0524343617a3b19988a';
const REL = '.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs';
const blob = spawnSync('git', ['-C', LANE, 'show', `${FREEZE}:${REL}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const src = blob.stdout;
const i = src.indexOf('function scratchSurvivors');
const FN = src.slice(i, src.indexOf('\n}\n', i) + 3);
const scratchSurvivors = new Function('readdirSync', 'readFileSync', `${FN}\nreturn scratchSurvivors;`)(readdirSync, readFileSync);

const BASE = process.env.TMPDIR;
const A = mkdtempSync(join(BASE, 'tabi-r36-c2-live-'));   // this session's scratch
const B = mkdtempSync(join(BASE, 'tabi-r36-c2-live-'));   // a sibling session's scratch
const out = { base: BASE, A, B, steps: [] };
const cmdlineOf = (pid) => { try { return readFileSync(`/proc/${pid}/cmdline`, 'utf8').replace(/\0/g, ' ').trim(); } catch { return null; } };

// V1 — shell-glob vector: a shell expanding $BASE/tabi-r36-c2-live-* puts the EXACT
// scratch path into a child argv. This is what a cleanup/ls/du over the counter's TMPDIR does.
{
  const r = spawnSync('bash', ['-c', `ls -d ${BASE}/tabi-r36-c2-live-* 2>/dev/null; sleep 0.2`], { encoding: 'utf8' });
  out.steps.push({ step: 'V1-shell-glob-listing', globOutput: r.stdout.trim().split('\n').filter(Boolean) });
  // now a long-lived globbed child
  const g = spawn('bash', ['-c', `exec -a "$(ls -d ${BASE}/tabi-r36-c2-live-* | head -1)" sleep 30`], { argv0: 'bash' });
  await new Promise((r2) => setTimeout(r2, 250));
  const found = scratchSurvivors(A);
  out.steps.push({ step: 'V1b-glob-child-flagged', globChildPid: g.pid, foundPids: found, cmdlines: found.map(cmdlineOf), globChildFlagged: found.includes(g.pid) });
  try { process.kill(g.pid, 'SIGKILL'); } catch {}
}

// V2 — cross-run isolation: sibling session B's path must NOT match A's scan.
{
  const sib = spawn('sleep', ['30'], { argv0: `${B}/profiles/geckodriver` });
  await new Promise((r) => setTimeout(r, 200));
  const foundA = scratchSurvivors(A);
  const foundB = scratchSurvivors(B);
  out.steps.push({ step: 'V2-cross-run-isolation', siblingPid: sib.pid, scanA: foundA, scanB: foundB, siblingInScanA: foundA.includes(sib.pid), siblingInScanB: foundB.includes(sib.pid) });
  try { process.kill(sib.pid, 'SIGKILL'); } catch {}
}

// V3 — prefix-of-longer-token semantics: does A's path match a process whose argv is
// A + extra characters (mkdtemp sibling could never be longer, but a user path can)?
{
  const p = spawn('sleep', ['30'], { argv0: `${A}-backup` });
  await new Promise((r) => setTimeout(r, 200));
  const found = scratchSurvivors(A);
  out.steps.push({ step: 'V3-longer-token', pid: p.pid, foundPids: found, cmdlines: found.map(cmdlineOf), flagged: found.includes(p.pid) });
  try { process.kill(p.pid, 'SIGKILL'); } catch {}
}

// V4 — count semantics of the frozen finally block: does a process that WAS killed
// still count toward rec.survivors (and thus flip live.survivors == 0)?
{
  const v = spawn('sleep', ['30'], { argv0: `${A}/victim` });
  await new Promise((r) => setTimeout(r, 200));
  let survivors = scratchSurvivors(A);
  const beforeKill = survivors.length;
  for (const pid of survivors) { try { process.kill(pid, 'SIGKILL'); } catch {} }
  if (survivors.length) { await new Promise((r) => setTimeout(r, 500)); survivors = survivors.concat(scratchSurvivors(A)); }
  let alive = true; try { process.kill(v.pid, 0); } catch { alive = false; }
  out.steps.push({ step: 'V4-count-semantics', foundAtTeardown: beforeKill, recSurvivors: survivors.length, killedVictim: !alive, survivorsTermPasses: survivors.length === 0, note: 'killed processes are still counted in rec.survivors (pre-kill list is retained in the concat)' });
}

// V5 — how many host processes currently embed the scratch path? (base rate on this host)
{
  const all = scratchSurvivors(A);
  out.steps.push({ step: 'V5-base-rate', hostMatches: all.length, cmdlines: all.map(cmdlineOf), totalPids: readdirSync('/proc').filter((p) => /^[0-9]+$/.test(p)).length });
}

rmSync(A, { recursive: true, force: true });
rmSync(B, { recursive: true, force: true });
console.log(JSON.stringify(out, null, 2));
