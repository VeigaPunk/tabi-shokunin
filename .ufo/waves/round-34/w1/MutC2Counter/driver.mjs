// driver.mjs — runs the mutant × fixture matrix with concurrency 4.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const S = '/fast/scratch/hyaku/tabi-r34/MutC2Counter-2';
const FROZEN_COUNTER_SHA = '3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82';
const F = JSON.parse(readFileSync(join(S, 'fixtures.json'), 'utf8'));
const runFile = promisify(execFile);
const MATRIX = [
  ['pristine', 'J1'], ['pristine', 'J2'], ['pristine', 'J3'], ['pristine', 'J4'],
  ['A', 'J1'], ['A', 'J3'],
  ['B', 'J1'], ['B', 'J3'],
  ['C', 'J1'], ['C', 'J2'], ['C', 'J3'],
  ['D', 'J1'], ['D', 'J2'],
  ['E', 'J1'], ['E', 'J2'],
  ['F', 'J1'], ['F', 'J4'],
  ['G', 'J1'], ['G', 'J4'],
  ['H', 'J1'], ['H', 'J4'], ['H', 'J5'],
  ['I', 'J1'], ['I', 'J4'],
  ['J', 'J1'],
];
const counterOf = (m) => (m === 'pristine' ? join(S, 'pristine.mjs') : join(S, 'muts', `mut-${m}.mjs`));
const results = [];
const writeSoFar = () => writeFileSync(join(S, 'runs', 'summary.json'), JSON.stringify(results, null, 1) + '\n');

async function one([m, j]) {
  const name = `${m}-${j}`;
  const t0 = Date.now();
  let exit = null, stdout = '', stderr = '', signal = null;
  const rev = F.fixtures[j].rev;
  try {
    ({ stdout, stderr } = await runFile('node', [counterOf(m), '--rev', rev, '--repo', F.repo, '--json'], { cwd: S, env: { ...process.env, TMPDIR: join(S, 'tmp') }, timeout: 600000, maxBuffer: 64 << 20 }));
    exit = 0;
  } catch (e) {
    exit = typeof e.code === 'number' ? e.code : null;
    signal = e.signal || null;
    stdout = e.stdout || '';
    stderr = (e.stderr || '') + (e.message ? `\n[driver] ${e.message}` : '') + (e.killed ? `\n[driver] execFile timeout/killed signal=${e.signal}` : '');
  }
  let j2 = null;
  try { j2 = JSON.parse(stdout.trim().split('\n').pop()); } catch {}
  const rec = {
    name, exit, signal, ms: Date.now() - t0,
    predicate: j2 ? j2.predicate : null,
    pristine: j2 ? j2.pristine.exit : null,
    neutral: j2 ? j2.neutral.exit : null,
    decoy: j2 ? j2.decoy.exit : null,
    killed: j2 ? j2.killedCount : null,
    survivors: j2 ? j2.survivors : null,
    twinsFailing: j2 ? j2.twinsFailing : null,
    unappliable: j2 ? j2.unappliable : null,
    battery: j2 && j2.battery ? j2.battery.predicate : null,
    gate: j2 ? j2.gateSha256 : null,
  };
  writeFileSync(join(S, 'runs', `${name}.json`), stdout || `(no stdout)\n`);
  writeFileSync(join(S, 'runs', `${name}.stderr`), stderr || '');
  results.push(rec);
  writeSoFar();
  console.log(JSON.stringify(rec));
}
const pool = 4;
let i = 0;
async function worker() { while (i < MATRIX.length) { const job = MATRIX[i++]; await one(job); } }
await Promise.all(Array.from({ length: pool }, worker));
const laneSha = createHash('sha256').update(readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/counters/c2-gate-mutants.mjs')).digest('hex');
const scratchSha = createHash('sha256').update(readFileSync(join(S, 'pristine.mjs'))).digest('hex');
writeFileSync(join(S, 'runs', 'restoration.json'), JSON.stringify({ laneCounterSha256: laneSha, scratchPristineSha256: scratchSha, frozenDigest: FROZEN_COUNTER_SHA, laneUnchanged: laneSha === FROZEN_COUNTER_SHA, scratchPristineUnchanged: scratchSha === FROZEN_COUNTER_SHA }, null, 1) + '\n');
console.log('RESTORATION', JSON.stringify({ laneSha, scratchSha, frozen: FROZEN_COUNTER_SHA }));
