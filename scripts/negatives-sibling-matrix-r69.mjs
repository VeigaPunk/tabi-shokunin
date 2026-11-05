#!/usr/bin/env node
// Forgery battery for scripts/check-sibling-matrix-r69.mjs (tabi round 69 C1).
//   fixture mode: node negatives-sibling-matrix-r69.mjs --fixture --work <ABS dir> --out <json>
//     builds a 20-lane fixture fleet of tiny git repos under --work (each `git -C "$D" init`,
//     toplevel verified before the first commit), a fixture snapshot and a VALID fixture matrix
//     (positive control), then derives one targeted forgery per check.
//   real mode:    node negatives-sibling-matrix-r69.mjs --province <PROVINCE.md> --snapshot <tsv>
//                   --fleet <fleet root> --work <ABS dir> --out <json>
//     the real PROVINCE.md must be clean (positive control); forgeries are derived from its rows.
// A negative counts only when the counter exits 1 AND reports the expected finding id.
// Exit 0 = battery holds; 1 = a forgery greened / wrong reason / positive failed; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const work = opt('work'); const outPath = opt('out');
const counter = opt('counter') || path.join(path.dirname(fileURLToPath(import.meta.url)), 'check-sibling-matrix-r69.mjs');
if (!work || !path.isAbsolute(work) || !outPath) { console.error('usage: (--fixture | --province P --snapshot S --fleet F) --work <ABS dir> --out <json>'); process.exit(2); }
fs.mkdirSync(work, { recursive: true });
const LANES = ['audio', 'chousa', 'game-dev-2d', 'game-dev-3d', 'kagi', 'kaidoku', 'kake', 'kama', 'kasegi', 'kengaku', 'kotoba', 'kotodama', 'kumitate', 'lore', 'mado', 'mori', 'revenger', 'souji', 'tameshi', 'tsukuroi'];
let province, snapshot, fleet;
const HEADER = '| lane | relation | head | cite | quote | tabi side |\n|---|---|---|---|---|---|';

if (argv.includes('--fixture')) {
  fleet = path.join(work, 'fleet');
  fs.mkdirSync(fleet, { recursive: true });
  const heads = {};
  for (const lane of LANES) {
    const D = path.join(fleet, lane + '-shokunin');
    fs.mkdirSync(D, { recursive: true });
    const g = (...a) => { const r = spawnSync('git', ['-C', D, ...a], { encoding: 'utf8' }); if (r.status !== 0) throw new Error('git ' + a.join(' ') + ': ' + r.stderr); return r.stdout.trim(); };
    g('init', '-q');
    if (fs.realpathSync(g('rev-parse', '--show-toplevel')) !== fs.realpathSync(D)) throw new Error('fixture toplevel mismatch ' + D);
    let text = `# ${lane} — Province\n\n**Owns:** the ${lane} fixture domain and its checklists.\n`;
    if (lane === 'kake') text += '\n## Adjacent\n\n- `tabi` drives browsers and owns client-side crawler discipline.\n- The profile lease is contested scope (kagi/tabi/kake) and stays with the integrator.\n';
    if (lane === 'kotoba') text += '\n| tabi | none | owns browser evidence; no split with kotoba |\n';
    fs.writeFileSync(path.join(D, 'PROVINCE.md'), text);
    g('add', 'PROVINCE.md');
    g('-c', 'user.name=fixture', '-c', 'user.email=fixture@invalid', 'commit', '-q', '-m', 'fixture');
    heads[lane] = g('rev-parse', 'HEAD');
  }
  snapshot = path.join(work, 'snapshot.tsv');
  fs.writeFileSync(snapshot, 'lane\tbranch\thead\tcaptured_at\n' + LANES.map((l) => `${l}\tmaster\t${heads[l]}\t2026-11-06T00:00:00-03:00`).join('\n') + '\n');
  const row = (lane) => {
    if (lane === 'kake') return `| kake | contested | ${heads.kake} | PROVINCE.md:8 | The profile lease is contested scope (kagi/tabi/kake) | tabi drives the browser; the lease stays with the integrator |`;
    if (lane === 'kotoba') return `| kotoba | adjacent | ${heads.kotoba} | PROVINCE.md:5 | tabi \\| none \\| owns browser evidence | kotoba states no split; tabi answers the row |`;
    const rel = ['revenger', 'kaidoku', 'kagi'].includes(lane) ? 'adjacent' : 'none';
    return `| ${lane} | ${rel} | ${heads[lane]} | PROVINCE.md:3 | the ${lane} fixture domain | tabi holds no ${lane} fixture ground |`;
  };
  province = path.join(work, 'PROVINCE.md');
  fs.writeFileSync(province, `# tabi — Province\n\n**Refuses:** forensics (→ revenger/kaidoku), publishing (→ kake), secrets (→ kagi).\n\n## Adjacent — sibling matrix (fixture)\n\n${HEADER}\n${LANES.map(row).join('\n')}\n\n## Next\n`);
} else {
  province = opt('province'); snapshot = opt('snapshot'); fleet = opt('fleet');
  if (!province || !snapshot || !fleet) { console.error('real mode needs --province --snapshot --fleet'); process.exit(2); }
}
const base = fs.readFileSync(province, 'utf8');
const lines = base.split('\n');
const rowIdx = (lane) => lines.findIndex((l) => new RegExp('^\\|\\s*`?' + lane.replace(/-/g, '\\-') + '`?\\s*\\|').test(l));
const cellsOf = (l) => l.replace(/^\|/, '').replace(/\|\s*$/, '').split(/(?<!\\)\|/).map((c) => c.trim());
const setCell = (lane, k, v) => (t) => { const L = t.split('\n'); const i = L.findIndex((l) => new RegExp('^\\|\\s*`?' + lane.replace(/-/g, '\\-') + '`?\\s*\\|').test(l)); const c = cellsOf(L[i]); c[k] = v; L[i] = '| ' + c.join(' | ') + ' |'; return L.join('\n'); };
const kakeRow = cellsOf(lines[rowIdx('kake')]);
const noneLane = LANES.find((l) => !['kake', 'kengaku', 'kotoba', 'revenger', 'kaidoku', 'kagi'].includes(l) && cellsOf(lines[rowIdx(l)])[1] === 'none') || 'audio';
const NEG = [
  ['matrix-removed', 'matrix-missing', (t) => t.replace(/^## Adjacent — sibling matrix.*$/m, '## Adjacent (renamed)')],
  ['header-renamed', 'matrix-header', (t) => t.replace('| lane | relation | head | cite | quote | tabi side |', '| lane | relation | head | cite | quote | side |')],
  ['lane-row-dropped', 'lane-missing', (t) => t.split('\n').filter((l, i) => i !== rowIdx('audio')).join('\n')],
  ['lane-duplicated-contradictory', 'duplicate-lane', (t) => { const L = t.split('\n'); const i = rowIdx('kagi'); const c = cellsOf(L[i]); c[1] = c[1] === 'none' ? 'adjacent' : 'none'; L.splice(i + 1, 0, '| ' + c.join(' | ') + ' |'); return L.join('\n'); }],
  ['lane-fabricated', 'unknown-lane', (t) => { const L = t.split('\n'); const c = cellsOf(L[rowIdx('audio')]); c[0] = 'yume'; L.splice(rowIdx('audio') + 1, 0, '| ' + c.join(' | ') + ' |'); return L.join('\n'); }],
  ['relation-out-of-vocab', 'relation-vocab', setCell('audio', 1, 'overlap')],
  ['head-not-snapshot', 'head-not-snapshot', setCell('chousa', 2, '0'.repeat(40))],
  ['cite-malformed', 'cite-shape', setCell('chousa', 3, 'PROVINCE.md')],
  ['cite-file-absent', 'cite-file-absent', setCell('chousa', 3, 'NOPE.md:1')],
  ['cite-line-absent', 'cite-line-absent', setCell('chousa', 3, 'PROVINCE.md:99999')],
  ['quote-off-line', 'quote-off-line', (t) => { const c = cellsOf(t.split('\n')[rowIdx('mori')]); const ln = Number(c[3].split(':')[1]); return setCell('mori', 3, c[3].split(':')[0] + ':' + (ln === 1 ? 2 : ln - 1))(t); }],
  ['quote-fabricated', 'quote-off-line', setCell('mori', 4, 'tabi owns this sibling entirely and absorbs it')],
  ['quote-too-long', 'quote-length', setCell('mori', 4, Array.from({ length: 26 }, (_, i) => 'w' + i).join(' '))],
  ['tabi-side-empty', 'tabi-side-empty', setCell('mori', 5, '—')],
  ['inbound-cite-elsewhere', 'inbound-unanswered', (t) => setCell('kake', 3, 'PROVINCE.md:1')(setCell('kake', 4, cellsOf(t.split('\n')[rowIdx('kake')])[4])(t))],
  ['inbound-contested-as-adjacent', 'inbound-contested-unnamed', setCell('kake', 1, 'adjacent')],
  ['inbound-relation-none', 'inbound-relation-none', setCell('kotoba', 1, 'none')],
  ['outbound-relation-none', 'outbound-relation-none', setCell('revenger', 1, 'none')],
  ['refuses-removed', 'refuses-paragraph-missing', (t) => t.replace('**Refuses:**', 'Refuses:')],
];
const run = (file) => { const p = spawnSync(process.execPath, [counter, '--province', file, '--snapshot', snapshot, '--fleet', fleet, '--json'], { encoding: 'utf8' }); let j = null; try { j = JSON.parse(p.stdout); } catch {} return { exit: p.status, ids: j ? j.findings.map((f) => f.id) : null, bound: j?.bound, rows: j?.rows }; };
const results = [];
const posFile = path.join(work, 'positive-PROVINCE.md'); fs.writeFileSync(posFile, base);
const pos = run(posFile);
results.push({ name: 'positive', exit: pos.exit, bound: pos.bound, ok: pos.exit === 0 && pos.bound === 20 });
for (const [name, expectId, mutate] of NEG) {
  const f = path.join(work, name + '.md'); const t = mutate(base);
  fs.writeFileSync(f, t);
  const r = run(f);
  results.push({ name, expectId, exit: r.exit, ids: r.ids, changed: t !== base, ok: t !== base && r.exit === 1 && Array.isArray(r.ids) && r.ids.includes(expectId) });
}
const failed = results.filter((x) => !x.ok).map((x) => x.name);
const summary = { mode: argv.includes('--fixture') ? 'fixture' : 'real', counter, counterSha256: crypto.createHash('sha256').update(fs.readFileSync(counter)).digest('hex'), province: argv.includes('--fixture') ? 'fixture' : province, negatives: NEG.length, refusedForExpectedReason: results.filter((x) => x.name !== 'positive' && x.ok).length, positiveOk: results[0].ok, failed, results };
fs.writeFileSync(outPath, JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ mode: summary.mode, negatives: summary.negatives, refusedForExpectedReason: summary.refusedForExpectedReason, positiveOk: summary.positiveOk, failed }));
process.exit(failed.length ? 1 : 0);
