// run.mjs — R67MutTester2 flip-sweep runner (scratch tool, not committed).
// Runs the frozen v22 meter on every mutant in manifest.json with a fixed
// worker pool (read-only git access; no shared mutable state), records
// exit code + parsed JSON predicate per flip.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const METER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs';
const REPO = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const REV = '5400136b233579f7b716ab83a70b8be24ed88b26';
const FLEET = '/home/vgpnk/Projects/shokunin';
const SNAP = REPO + '/.ufo/waves/round-66/measure/snapshot-live-r66.tsv';
const AUDIT = REPO + '/.ufo/waves/round-66/c1/adjudicated/adjacency-host-audit-r66.tsv';
const SCRATCH = '/fast/scratch/hyaku/tabi-r67/R67MutTester2';
const POOL = 8;

const manifest = JSON.parse(fs.readFileSync(SCRATCH + '/manifest.json', 'utf8'));
const results = [];
let done = 0;

function runOne(m) {
  const t0 = Date.now();
  const r = spawnSync('node', [METER, '--repo', REPO, '--rev', REV, '--fleet', FLEET,
    '--snapshot', SNAP, '--audit', AUDIT, '--delta', SCRATCH + '/mutants/' + m.mutant, '--json'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch { /* leave null */ }
  return {
    mutant: m.mutant, key: m.key, from: m.from, to: m.to,
    exit: r.status, signal: r.signal ?? null,
    predicate: parsed === null ? null : (parsed.predicate === true),
    findingCount: parsed === null ? null : parsed.findingCount,
    findingIds: parsed === null ? null : [...new Set(parsed.findings.map((f) => f.id))],
    stderrHead: (r.stderr || '').slice(0, 200),
    ms: Date.now() - t0,
  };
}

const queue = [...manifest];
const workers = Array.from({ length: POOL }, () => (async () => {
  while (queue.length) {
    const m = queue.shift();
    const res = runOne(m);
    results.push(res);
    done++;
    if (done % 50 === 0 || res.exit !== 0) {
      console.error(`progress ${done}/${manifest.length} last=${m.mutant} exit=${res.exit} predicate=${res.predicate}`);
    }
  }
})());
await Promise.all(workers);
results.sort((a, b) => a.mutant < b.mutant ? -1 : 1);
fs.writeFileSync(SCRATCH + '/results.jsonl', results.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');

const dist = {};
for (const r of results) dist[r.exit] = (dist[r.exit] || 0) + 1;
const accepted = results.filter((r) => r.exit === 0 && r.predicate === true).length;
const refused = results.length - accepted;
const byFlip = {};
for (const r of results) { byFlip[r.to] = byFlip[r.to] || { accepted: 0, refused: 0 }; if (r.exit === 0 && r.predicate === true) byFlip[r.to].accepted++; else byFlip[r.to].refused++; }
const rowsAccepted = new Map();
for (const r of results) { if (r.exit === 0 && r.predicate === true) rowsAccepted.set(r.key, (rowsAccepted.get(r.key) || 0) + 1); }
const rowsBoth = [...rowsAccepted.values()].filter((n) => n === 2).length;
console.log(JSON.stringify({ mutants: results.length, exitDist: dist, accepted, refused, byFlip, rowsBothAccepted: rowsBoth }, null, 1));
