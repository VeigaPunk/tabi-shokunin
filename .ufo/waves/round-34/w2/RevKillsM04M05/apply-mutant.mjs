// RevKillsM04M05 scratch helper: apply one frozen mutant to the clone's gate.
// Extracts the MUTANTS array from the frozen counter (bytes verified against the
// frozen digest), cross-checks the pair against round-33 w2 mutants.jsonl, asserts
// the find text occurs EXACTLY once in the gate, then writes the mutated gate.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const COUNTER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/counters/c2-gate-mutants.mjs';
const COUNTER_IN_CLONE = '/fast/scratch/hyaku/tabi-r34/RevKillsM04M05/clone/.ufo/waves/round-34/counters/c2-gate-mutants.mjs';
const JSONL = '/fast/scratch/hyaku/tabi-r34/RevKillsM04M05/clone/.ufo/waves/round-33/w2/MutGateV2/mutants.jsonl';
const GATE = '/fast/scratch/hyaku/tabi-r34/RevKillsM04M05/clone/scripts/check-bidi-runtime.mjs';
const FROZEN = '3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82';

const src = readFileSync(COUNTER, 'utf8');
const digest = createHash('sha256').update(src).digest('hex');
if (digest !== FROZEN) { console.error(`counter digest ${digest} != frozen ${FROZEN}`); process.exit(2); }
const cloneSrc = readFileSync(COUNTER_IN_CLONE, 'utf8');
if (cloneSrc !== src) { console.error('counter in clone differs from lane counter'); process.exit(2); }

const start = src.indexOf('const MUTANTS = Object.freeze([');
const end = src.indexOf('\n]);', start);
const arr = JSON.parse(`[${src.slice(start + 'const MUTANTS = Object.freeze(['.length, end)}]`);
const jl = readFileSync(JSONL, 'utf8').trim().split('\n').map((l) => JSON.parse(l));

const id = process.argv[2];
const m = arr.find((x) => x.id === id);
if (!m) { console.error(`no mutant ${id} in counter`); process.exit(2); }
const j = jl.find((x) => x.id === id);
if (!j || j.find !== m.find || j.replace !== m.replace) { console.error(`${id}: counter pair != mutants.jsonl pair`); process.exit(2); }

const gate = readFileSync(GATE, 'utf8');
const n = gate.split(m.find).length - 1;
if (n !== 1) { console.error(`${id}: find occurs ${n} times in gate (must be 1)`); process.exit(2); }
const out = gate.replace(m.find, m.replace);
writeFileSync(GATE, out);
console.log(`applied ${id} area="${m.area}" find_occurrences=1 gate_bytes ${Buffer.byteLength(gate)} -> ${Buffer.byteLength(out)}`);
