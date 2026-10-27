import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const FLEET = '/home/vgpnk/Projects/shokunin';
const LANE = FLEET + '/tabi-shokunin';
const pins = JSON.parse(readFileSync(LANE + '/.ufo/waves/round-36/baseline/c1-delta-pins.json', 'utf8'));
const ledger = readFileSync(LANE + '/corpus/adjacency-screen-drift.tsv', 'utf8').trimEnd().split('\n');
const rows = readFileSync(LANE + '/.ufo/waves/round-36/w1-chunks/AdjDrift03.tsv', 'utf8').trimEnd().split('\n');
const trim = s => s.replace(/^[ \t\r]+/, '').replace(/[ \t\r]+$/, '');
const show = (repo, rev, path) => { try { return execFileSync('git', ['-C', repo, 'show', `${rev}:${path}`], { encoding: 'utf8' }); } catch { return null; } };
let bad = 0;
for (const row of rows) {
  const [ref] = row.split('\t');
  const [laneRef, tail] = [ref.slice(0, ref.indexOf('-shokunin@')), ref.slice(ref.indexOf('-shokunin@') + 10)];
  const pin = tail.slice(0, tail.indexOf(':'));
  const rest = tail.slice(tail.indexOf(':') + 1);
  const line = Number(rest.slice(rest.lastIndexOf(':') + 1));
  const path = rest.slice(0, rest.lastIndexOf(':'));
  const repo = `${FLEET}/${laneRef}-shokunin`;
  const head = pins[laneRef];
  const ptext = show(repo, pin, path);
  const cited = ptext == null ? null : trim(ptext.split('\n')[line - 1] ?? '');
  let status, note = '-';
  const htext = show(repo, head, path);
  if (!ptext) status = 'stale: pin file absent';
  else if (cited === null || cited === '') status = 'stale';
  else if (!htext) status = 'stale: head file absent';
  else {
    const hl = htext.split('\n');
    const at = hl[line - 1] === undefined ? null : trim(hl[line - 1]);
    if (at === cited) status = 'unchanged';
    else {
      const hits = hl.map((t, i) => [trim(t), i + 1]).filter(([t]) => t === cited).map(([, i]) => i);
      if (hits.length) { status = 'moved'; note = ':' + hits.join(','); } else status = 'stale';
    }
  }
  const lrow = ledger.find(l => l.split('\t')[0] === ref);
  const [, lstat, lnote] = lrow ? lrow.split('\t') : ['', 'absent', '-'];
  let agree = lstat === status;
  if (status === 'moved' && agree) {
    const n = (lnote.match(/:(\d+)/) || [])[1];
    agree = note.slice(1).split(',').includes(n);
  }
  if (!agree) { bad++; console.log('DISAGREE', ref, status, note, '| ledger', lstat, lnote); }
}
console.log(`cross-check: ${rows.length} rows, ${bad} disagreements with committed ledger`);
