// Third witness round for seat R80Mut1 (D6 target): the unparsable-scan gate
// (isJson || startsWithBrace) && schemaTest, and the schema test itself.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { MUTANTS } from './mutants.mjs';

const ROOT = '/fast/scratch/hyaku/tabi-r80/R80Mut1';
const LANE = path.join(ROOT, 'lane/tabi-shokunin');
const RECEIPT = path.join(LANE, 'corpus/evidence/round80/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-80/controls/c1/prior-set.txt');
const PIN = 'cb93935c017daf1ca5ae654f0992e63ad0785042ee2566619623ae8bab4b19cc';
const arg = (n) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : null; };
const COUNTER = arg('counter');
const LABEL = arg('label') || 'd6';
const OUT = arg('out') || path.join(ROOT, 'witness3-' + LABEL + '.json');
const src = fs.readFileSync(COUNTER, 'utf8');
const real = JSON.parse(fs.readFileSync(RECEIPT, 'utf8'));
const NONCE = real.nonce, FIXTURE = real.fixture.sha256;
const realSha = crypto.createHash('sha256').update(fs.readFileSync(RECEIPT)).digest('hex');
const SCHEMA_LITERAL = 'tabi-chrome-cdp-showpicker-r80';
const WDIR = path.join(ROOT, 'witness3-cases', LABEL);
fs.mkdirSync(WDIR, { recursive: true });

const counterFor = (m) => {
  const cands = m.fromVariants ? m.fromVariants : [[m.from, m.to]];
  for (const [f, t] of cands) if (src.split(f).length - 1 === 1) return src.replace(f, t);
  return null;
};
const MUT = new Map(MUTANTS.map((m) => [m.name, m]));
const cache = new Map();
const mutantPath = (name) => {
  if (cache.has(name)) return cache.get(name);
  const m = MUT.get(name);
  const text = m ? counterFor(m) : null;
  if (!text) { cache.set(name, null); return null; }
  const p = path.join(WDIR, 'counter-' + name + '.mjs');
  fs.writeFileSync(p, text);
  cache.set(name, p);
  return p;
};
const run = (counterPath) => {
  const args = [counterPath, '--lane', LANE, '--receipt', RECEIPT, '--expect-driver-sha256', PIN,
    '--expect-nonce', NONCE, '--expect-fixture-sha256', FIXTURE, '--prior-set', PRIOR_SET,
    '--tree-exempt-sha256', realSha, '--json'];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 30000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch { j = null; }
  return { status: r.status, verdict: j && j.verdict, ids: j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null };
};

const cases = [
  { id: 'w3-unparsable-json-only', mutant: 'unparsable-json-only', expect: 'prior-set-unparsable', kind: 'refuse',
    file: 'prose-quote.txt', body: '{"schema": "' + SCHEMA_LITERAL + '", "nonce": "tabi-r80-trunc' },
  { id: 'w3-unparsable-brace-only', mutant: 'unparsable-brace-only', expect: 'prior-set-unparsable', kind: 'refuse',
    file: 'trunc-no-brace.json', body: '"schema": "' + SCHEMA_LITERAL + '", "nonce": "tabi-r80-trunc' },
  { id: 'w3-unparsable-and-joined', mutant: 'unparsable-and-joined', expect: 'prior-set-unparsable', kind: 'refuse',
    file: 'trunc-no-brace2.json', body: '"schema": "' + SCHEMA_LITERAL + '", "nonce": "tabi-r80-trunc' },
  { id: 'w3-prior-schema-string', mutant: 'prior-schema-string-dropped', expect: 'prior-set-unparsable', kind: 'accept',
    file: 'notes.json', body: '{oops not json, no schema here' },
];
const results = [];
for (const c of cases) {
  const mpath = mutantPath(c.mutant);
  if (!mpath) { results.push({ id: c.id, mutant: c.mutant, outcome: 'unapplied' }); continue; }
  const target = path.join(LANE, '.ufo/waves/round-80', c.file);
  fs.writeFileSync(target, c.body);
  const p = run(COUNTER);
  const mm = run(mpath);
  fs.rmSync(target, { force: true });
  const pristineRefuses = p.status === 1 && p.ids && p.ids.includes(c.expect);
  const pristineClean = p.status === 0 && p.ids && p.ids.length === 0;
  const mutantMisses = !(mm.ids && mm.ids.includes(c.expect));
  const ok = c.kind === 'refuse' ? (pristineRefuses && mutantMisses) : (pristineClean && mm.status === 1 && mm.ids && mm.ids.includes(c.expect));
  results.push({ id: c.id, mutant: c.mutant, expect: c.expect, kind: c.kind, file: c.file, pristine: p, mutantRun: mm, outcome: ok ? 'witness' : 'no-witness' });
}
fs.writeFileSync(OUT, JSON.stringify({ label: LABEL, counter: COUNTER, probes: results.length, witnesses: results.filter((r) => r.outcome === 'witness').length, results }, null, 1));
for (const r of results) process.stderr.write(r.id + ' ' + r.outcome + ' pristine=' + JSON.stringify(r.pristine) + ' mutant=' + JSON.stringify(r.mutantRun) + '\n');
process.stdout.write(JSON.stringify({ label: LABEL, probes: results.length, witnesses: results.filter((r) => r.outcome === 'witness').length, detail: results.map((r) => r.id + ':' + r.outcome) }, null, 1) + '\n');
