// LabratC2 probe — v3 survivor-check isolation.
// Uses the FROZEN scratchSurvivors function bytes extracted verbatim from the frozen
// counter blob (sha256 eda339eb... == claims.json frozenDigests.c2). No hand-copy.
// Scope: this seat's scratch only. Never touches the lane's measurement run.
import { readdirSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FREEZE = '99437d29de036415a9f2d0524343617a3b19988a';
const COUNTER_REL = '.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs';

// --- extract the frozen function bytes (verbatim) ---
const blob = spawnSync('git', ['-C', LANE, 'show', `${FREEZE}:${COUNTER_REL}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (blob.status !== 0) throw new Error('git show failed: ' + blob.stderr);
const src = blob.stdout;
const i = src.indexOf('function scratchSurvivors');
const j = src.indexOf('\n}\n', i) + 3;
const FN = src.slice(i, j);
const scratchSurvivors = new Function('readdirSync', 'readFileSync', `${FN}\nreturn scratchSurvivors;`)(readdirSync, readFileSync);

// --- replicate the counter's live-leg scratch naming EXACTLY ---
// liveRecordFirefox: const scratch = mkdtempSync(join(SCRATCH_BASE, 'tabi-r36-c2-live-'));
// SCRATCH_BASE = process.env.TMPDIR || tmpdir()
const SCRATCH_BASE = process.env.TMPDIR || tmpdir();
const scratch = mkdtempSync(join(SCRATCH_BASE, 'tabi-r36-c2-live-'));
const S = scratch;

const out = { scratchPath: S, scratchBase: SCRATCH_BASE, steps: [] };
const rec = { survivors: null };

// Helper: read a pid's cmdline the same way the frozen fn does.
const cmdlineOf = (pid) => { try { return readFileSync(`/proc/${pid}/cmdline`, 'utf8').replace(/\0/g, ' ').trim(); } catch { return null; } };

// STEP 1 — baseline: no decoys. Does the scan find anything at all?
{
  const found = scratchSurvivors(S);
  out.steps.push({ step: '1-baseline-scan', foundPids: found, cmdlines: found.map(cmdlineOf) });
}

// STEP 2 — intended detection still works: a fake "geckodriver" whose argv embeds
// the scratch path (mirrors `--profile-root <scratch>/profiles`).
{
  const gd = spawn('sleep', ['30'], { argv0: `${S}/profiles/geckodriver` });
  await new Promise((r) => setTimeout(r, 200));
  const found = scratchSurvivors(S);
  out.steps.push({ step: '2-intended-gd-like', pid: gd.pid, foundPids: found, cmdlines: found.map(cmdlineOf) });
  // STEP 3 — the FINALLY-block semantics, verbatim from the frozen counter:
  //   let survivors = scratchSurvivors(scratch);
  //   for (pid of survivors) kill(pid,'SIGKILL')
  //   if (survivors.length) { sleep(500); survivors = survivors.concat(scratchSurvivors(scratch)); }
  //   rec.survivors = survivors.length
  let survivors = scratchSurvivors(S);
  for (const pid of survivors) { try { process.kill(pid, 'SIGKILL'); } catch { /* gone */ } }
  if (survivors.length) { await new Promise((r) => setTimeout(r, 500)); survivors = survivors.concat(scratchSurvivors(S)); }
  rec.survivors = survivors.length;
  out.steps.push({ step: '3-finally-block', survivorsCount: rec.survivors, killedPids: survivors });
}

// STEP 4 — THE HYPOTHESIS: an UNRELATED host process whose argv embeds the scratch
// path string (no relationship to this counter's browser session).
{
  const decoy = spawn('sleep', ['30'], { argv0: `${S}/unrelated-host-tool --profile=${S}/x` });
  await new Promise((r) => setTimeout(r, 200));
  const found = scratchSurvivors(S);
  out.steps.push({ step: '4-unrelated-decoy-scan', decoyPid: decoy.pid, foundPids: found, cmdlines: found.map(cmdlineOf), decoyFlagged: found.includes(decoy.pid) });
  // STEP 5 — does the finally block KILL the unrelated process and count it?
  let survivors = scratchSurvivors(S);
  const killed = [];
  for (const pid of survivors) { try { process.kill(pid, 'SIGKILL'); killed.push(pid); } catch { /* gone */ } }
  if (survivors.length) { await new Promise((r) => setTimeout(r, 500)); survivors = survivors.concat(scratchSurvivors(S)); }
  rec.survivors = survivors.length;
  let decoyAlive = true;
  try { process.kill(decoy.pid, 0); } catch { decoyAlive = false; }
  out.steps.push({ step: '5-finally-block-vs-decoy', survivorsCount: rec.survivors, killedPids: killed, decoyKilled: killed.includes(decoy.pid), decoyAliveAfter: decoyAlive });
}

// STEP 6 — prefix/substring scope: does a process whose argv merely CONTAINS the
// scratch string as a longer, unrelated token match?
{
  const near = spawn('sleep', ['30'], { argv0: `some-other-tool-${S}-suffix` });
  await new Promise((r) => setTimeout(r, 200));
  const found = scratchSurvivors(S);
  out.steps.push({ step: '6-substring-near-miss', nearPid: near.pid, foundPids: found, cmdlines: found.map(cmdlineOf), nearFlagged: found.includes(near.pid) });
  try { process.kill(near.pid, 'SIGKILL'); } catch {}
}

// STEP 7 — is the counter's OWN process (or any shell) flagged? (self-match check)
{
  const found = scratchSurvivors(S);
  out.steps.push({ step: '7-self-and-other-pids', selfPid: process.pid, selfFlagged: found.includes(process.pid), foundPids: found, cmdlines: found.map(cmdlineOf) });
}

// STEP 8 — probability window: mkdtemp suffix space.
{
  const samples = [];
  for (let k = 0; k < 5; k += 1) { const d = mkdtempSync(join(SCRATCH_BASE, 'probe-suffix-')); samples.push(d.split('-').pop()); rmSync(d, { recursive: true, force: true }); }
  const suffixLens = samples.map((s) => s.length);
  const alphabet = new Set(samples.join('').split(''));
  out.steps.push({ step: '8-mkdtemp-suffix-space', samples, suffixLens, alphabetChars: [...alphabet].sort(), distinctSuffixes: new Set(samples).size });
}

// STEP 9 — what the predicate would do with a false-positive survivor count.
{
  const fake = { survivors: 1 };
  const predicate = fake.survivors === 0; // live.survivors == 0 term of the frozen predicate
  out.steps.push({ step: '9-predicate-effect', survivors: fake.survivors, survivorsTermPasses: predicate });
}

// cleanup
rmSync(S, { recursive: true, force: true });
out.finalSurvivorsFromFinally = rec.survivors;
console.log(JSON.stringify(out, null, 2));
