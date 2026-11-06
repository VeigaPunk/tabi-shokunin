#!/usr/bin/env node
// Witness probes for the four surviving mutants: each builds one forgery the frozen
// contract forbids, shows the pristine counter rejects it for the named finding id,
// and shows the surviving mutant accepts it (exit 0). This distinguishes a real
// battery coverage gap from a semantically inert mutation.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const S = '/fast/scratch/hyaku/tabi-r69/R69Mut1';
const OUT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/w1/R69Mut1/witnesses';
const SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-sibling-matrix-r69.mjs';
fs.mkdirSync(OUT, { recursive: true });

const base = fs.readFileSync(path.join(S, 'm0/positive-PROVINCE.md'), 'utf8');
const snap0 = path.join(S, 'm0/snapshot.tsv');
const snapText0 = fs.readFileSync(snap0, 'utf8');
const cellsOf = (l) => l.replace(/^\|/, '').replace(/\|\s*$/, '').split(/(?<!\\)\|/).map((c) => c.trim());
const rowIdx = (t, lane) => t.split('\n').findIndex((l) => new RegExp('^\\|\\s*`?' + lane.replace(/-/g, '\\-') + '`?\\s*\\|').test(l));
const setCell = (t, lane, k, v) => { const L = t.split('\n'); const i = rowIdx(t, lane); const c = cellsOf(L[i]); c[k] = v; L[i] = '| ' + c.join(' | ') + ' |'; return L.join('\n'); };

const run = (counter, province, snapshot, fleet) => {
  const p = spawnSync(process.execPath, [counter, '--province', province, '--snapshot', snapshot, '--fleet', fleet, '--json'], { encoding: 'utf8' });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, ids: j ? j.findings.map((f) => f.id) : null, detail: j ? j.findings.map((f) => f.detail) : null, stderr: p.stderr.slice(0, 300), bound: j?.bound, rows: j?.rows };
};

const cases = [];
const case1 = (name, mutant, expectId, mutate, { snapshot = snap0, fleet = path.join(S, 'm0/fleet'), control = null } = {}) => {
  const dir = path.join(S, 'witness-' + name);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const prov = path.join(dir, 'PROVINCE.md');
  const text = mutate(base);
  fs.writeFileSync(prov, text);
  const pristine = run(SRC, prov, snapshot, fleet);
  const mut = run(path.join(S, mutant + '.mjs'), prov, snapshot, fleet);
  const out = { name, mutant, expectId, forgeryApplied: text !== base, pristine, mutant: mut,
    ok: text !== base && pristine.exit === 1 && Array.isArray(pristine.ids) && pristine.ids.includes(expectId) && mut.exit === 0 };
  if (control) {
    const cprov = path.join(dir, 'CONTROL-PROVINCE.md');
    fs.writeFileSync(cprov, control.text);
    out.control = { desc: control.desc, ...run(SRC, cprov, control.snapshot ?? snapshot, control.fleet ?? fleet) };
    out.ok = out.ok && out.control.exit === 0;
  }
  fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(out, null, 1));
  cases.push({ name, mutant, expectId, pristineExit: pristine.exit, pristineIds: pristine.ids, mutantExit: mut.exit, mutantIds: mut.ids, controlExit: out.control?.exit, ok: out.ok });
};

// W1: two-word quote (contract: 3..25 words) — m06 weakened the lower bound.
case1('w1-two-word-quote', 'm06', 'quote-length', (t) => setCell(t, 'audio', 4, 'the audio'));
// W2: two-word tabi side (contract: >= 4 words) — m14 lowered the minimum.
case1('w2-two-word-side', 'm14', 'tabi-side-empty', (t) => setCell(t, 'audio', 5, 'no split'));
// W3: exact duplicate row, same relation (contract: exactly one row per lane) — m17 only flags disagreeing duplicates.
case1('w3-exact-duplicate-row', 'm17', 'duplicate-lane', (t) => { const L = t.split('\n'); const i = rowIdx(t, 'audio'); L.splice(i + 1, 0, L[i]); return L.join('\n'); });

// W4: sibling PROVINCE names "Tabi" capitalised; row says none — m18 made tabi matching case-sensitive.
const dir4 = path.join(S, 'witness-w4');
fs.rmSync(dir4, { recursive: true, force: true }); fs.mkdirSync(dir4, { recursive: true });
const fleet4 = path.join(dir4, 'fleet');
fs.cpSync(path.join(S, 'm0/fleet'), fleet4, { recursive: true });
const K = path.join(fleet4, 'kotoba-shokunin');
{
  const top = spawnSync('git', ['-C', K, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim();
  if (fs.realpathSync(top) !== fs.realpathSync(K)) throw new Error('toplevel mismatch ' + top);
  const p = path.join(K, 'PROVINCE.md');
  const t = fs.readFileSync(p, 'utf8');
  if (!t.includes('| tabi |')) throw new Error('kotoba fixture text unexpected');
  fs.writeFileSync(p, t.replace('| tabi |', '| Tabi |'));
  const g = (...a) => { const r = spawnSync('git', ['-C', K, ...a], { encoding: 'utf8' }); if (r.status !== 0) throw new Error('git ' + a.join(' ') + ': ' + r.stderr); return r.stdout.trim(); };
  g('add', 'PROVINCE.md');
  g('-c', 'user.name=fixture', '-c', 'user.email=fixture@invalid', 'commit', '-q', '-m', 'capitalise Tabi');
  var newHead = g('rev-parse', 'HEAD');
}
const snap4 = path.join(dir4, 'snapshot.tsv');
fs.writeFileSync(snap4, snapText0.replace(/(^kotoba\tmaster\t)[0-9a-f]{40}/m, '$1' + newHead));
const TABI_QUOTE = 'Tabi \\| none \\| owns browser evidence';
const prov4 = setCell(setCell(setCell(base, 'kotoba', 2, newHead), 'kotoba', 1, 'none'), 'kotoba', 4, TABI_QUOTE);
const control4 = setCell(setCell(base, 'kotoba', 2, newHead), 'kotoba', 4, TABI_QUOTE);
fs.writeFileSync(path.join(dir4, 'positive-Tabi-PROVINCE.md'), control4);
case1('w4-capitalised-tabi-mention', 'm18', 'inbound-relation-none',
  () => prov4,
  { snapshot: snap4, fleet: fleet4,
    control: { desc: 'same capitalised sibling, kotoba row kept adjacent: pristine must stay clean',
      text: control4, snapshot: snap4, fleet: fleet4 } });

const failed = cases.filter((c) => !c.ok).map((c) => c.name);
fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify({ counter: SRC, cases, failed }, null, 1));
console.log(JSON.stringify(cases, null, 1));
console.log('FAILED=' + JSON.stringify(failed));
process.exit(failed.length ? 1 : 0);
