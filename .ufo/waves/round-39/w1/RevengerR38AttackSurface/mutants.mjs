// Counter-level mutant battery against the frozen round-39 C1 counter.
// Clean protocol: the fixture repo is reset --hard to the pristine receipt commit
// before each mutant, so no mutant contaminates the next baseline.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const REPO = '/fast/scratch/hyaku/tabi-r39/RevengerR38AttackSurface/mut';
const RCP = 'corpus/evidence/round-39/playwright-egress/receipt.json';
const SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/counters/c1-egress-session-bound.mjs';
const sh = (c) => spawnSync('/bin/bash', ['-c', c], { encoding: 'utf8' });

const PRISTINE = sh(`git -C ${REPO} rev-parse HEAD`).stdout.trim();
const BASE = readFileSync(`${REPO}/${RCP}`, 'utf8');
const clone = () => JSON.parse(BASE);

const mutants = {
  base: (r) => r,
  m1_ss_surface_dead: (r) => {
    for (const run of r.runs) {
      run.sockets.ss = { observations: 0, nonLoopback: 0, unavailable: true };
      for (const s of run.samples) s.ss = { ticks: 0, lines: 0, nonLoopback: 0, unavailable: true };
    }
    return r;
  },
  m1b_proc_surface_dead: (r) => {
    for (const run of r.runs) {
      run.sockets.proc = { observations: 0, nonLoopback: 0, unavailable: true };
      for (const s of run.samples) s.proc = { ticks: 0, inodes: 0, nonLoopback: 0, unavailable: true };
    }
    return r;
  },
  m2_samples_array_truncated: (r) => { for (const run of r.runs) run.samples = run.samples.slice(0, 2); return r; },
  m2b_coverage_at_floor: (r) => { for (const run of r.runs) run.coverageMs = 1000; return r; },
  m3_owned_pid_not_child: (r) => {
    for (const run of r.runs) run.owned = { ...run.owned, roots: [{ pid: 1, argv0: run.owned.roots[0].argv0 }], tree: [1] };
    return r;
  },
  m4_no_samples_counted_8: (r) => { for (const run of r.runs) { run.sampleCount = 8; run.samples = []; } return r; },
  m5_samplecount_7: (r) => { for (const run of r.runs) run.sampleCount = 7; return r; },
  m6_ss_nonloopback_one: (r) => { r.runs[0].sockets.ss.nonLoopback = 1; return r; },
};

const out = [];
for (const [name, fn] of Object.entries(mutants)) {
  sh(`git -C ${REPO} reset -q --hard ${PRISTINE}`);
  const r = fn(clone());
  writeFileSync(`${REPO}/${RCP}`, JSON.stringify(r, null, 1) + '\n');
  sh(`git -C ${REPO} add -A && git -C ${REPO} commit -qm ${name}`);
  const rev = sh(`git -C ${REPO} rev-parse HEAD`).stdout.trim();
  const c = spawnSync('node', [SRC, '--rev', rev, '--repo', REPO, '--json'], { encoding: 'utf8' });
  let p = null;
  try { p = JSON.parse(c.stdout); } catch { p = { unparsed: c.stdout, stderr: c.stderr }; }
  out.push({ mutant: name, rev, exit: c.status, predicate: p.predicate, findings: (p.findings || []).map((f) => f.id).join(','), controlRefused: p.control && p.control.refused });
  sh(`git -C ${REPO} reset -q --hard ${PRISTINE}`);
}
console.log(JSON.stringify(out, null, 1));
