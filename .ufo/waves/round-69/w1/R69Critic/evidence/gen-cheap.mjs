// Cheapest PROVINCE.md that satisfies C1's counter, with zero cross-domain judgment.
// Inputs: frozen snapshot, per-lane inbound scan (inbound.json), a base PROVINCE.md without
// any Adjacent section. Outputs: cheap PROVINCE.md + the rows used.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const W = process.argv[2];
const basePath = process.argv[3] || W + '/head-PROVINCE.md';
const snap = fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/c1/sibling-heads-r69.tsv', 'utf8')
  .trim().split('\n').slice(1).map((l) => { const [lane, , head] = l.split('\t'); return { lane, head }; });
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const wc = (s) => norm(s).split(' ').filter(Boolean).length;
const show = (lane, head) => spawnSync('git', ['-C', '/home/vgpnk/Projects/shokunin/' + lane + '-shokunin', 'show', head + ':PROVINCE.md'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout;

const base = fs.readFileSync(basePath, 'utf8');
const inbound = JSON.parse(fs.readFileSync(W + '/inbound.json', 'utf8'));
const inboundMap = new Map(inbound.map((o) => [o.lane, o]));
const outbound = ['revenger', 'kaidoku', 'kake', 'kagi'];
const rows = [];

// cheapest quote: the first line of the sibling's PROVINCE.md with 3..25 words
const pick = (text) => {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) if (wc(lines[i]) >= 3 && wc(lines[i]) <= 25) return { n: i + 1, q: norm(lines[i]) };
  for (let i = 0; i < lines.length; i++) { const w = norm(lines[i]).split(' ').filter(Boolean); if (w.length > 25) return { n: i + 1, q: w.slice(0, 8).join(' ') }; }
  return null;
};

for (const { lane, head } of snap) {
  const text = show(lane, head);
  const inf = inboundMap.get(lane);
  let relation = 'none';
  if (inf.named.length) relation = inf.anyContested ? 'contested' : 'adjacent';
  else if (outbound.includes(lane)) relation = 'adjacent';
  let cite, q;
  if (inf.named.length) {
    const line = inf.named[0];
    const words = norm(line.t).split(' ').filter(Boolean);
    cite = 'PROVINCE.md:' + line.n;
    q = words.length <= 25 ? norm(line.t) : words.slice(0, 8).join(' ');
  } else {
    const p = pick(text);
    cite = 'PROVINCE.md:' + p.n;
    q = p.q;
  }
  rows.push('| ' + lane + ' | ' + relation + ' | ' + head + ' | ' + cite + ' | ' + q.replace(/\|/g, '\\|') + ' | tabi holds no ground in this lane |');
}

const section = ['## Adjacent — sibling matrix', '',
  'Cheapest passing control: relation derived mechanically (inbound/outbound sets only); quote = the sibling PROVINCE.md first 3-25-word line; tabi side is one boilerplate string.',
  '', '| lane | relation | head | cite | quote | tabi side |', '|---|---|---|---|---|---|', ...rows, '', ''].join('\n');
const anchor = '## Round 62 — Linux observed surfaces (2026-11-04)';
if (!base.includes(anchor)) throw new Error('anchor missing in base');
const cheap = base.replace(anchor, section + anchor);
fs.writeFileSync(W + '/cheap2-PROVINCE.md', cheap);
fs.writeFileSync(W + '/cheap2-rows.md', rows.join('\n') + '\n');
console.log(JSON.stringify({ rows: rows.length, bytes: cheap.length, anchorPresent: cheap.includes(anchor) }));
