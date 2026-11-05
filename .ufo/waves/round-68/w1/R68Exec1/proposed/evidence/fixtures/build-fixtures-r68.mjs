// build-fixtures-r68.mjs — seat R68Exec1 control/forge fixture builder (scratch only).
// Emits: header-only control, wrong-quote, wrong-head, author-adjudicator (x2),
// and the line-swap forged ledger + matching worksheet.
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const S = '/fast/scratch/hyaku/tabi-r68/R68Exec1';
const LED = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv';

const base = fs.readFileSync(S + '/ws-mine-a.tsv', 'utf8').split('\n').filter((l) => l.length > 0);
const HDR = base[0];
const body = base.slice(1);
const w = (name, text) => { fs.writeFileSync(S + '/' + name, text); return S + '/' + name; };
const rebuilt = (mut) => [HDR, ...body.map((l, i) => mut(l.split('\t'), i).join('\t'))].join('\n') + '\n';
const made = [];

made.push(w('ws-header-only.tsv', HDR + '\n'));
made.push(w('ws-wrong-quote.tsv', rebuilt((r, i) => { if (i === 0) r[3] = '-'; return r; })));
made.push(w('ws-wrong-head.tsv', rebuilt((r, i) => { if (i === 0) r[2] = 'c'.repeat(40); return r; })));
made.push(w('ws-author-tabi-shokunin.tsv', rebuilt((r, i) => {
  if (i === 0) { r[4] = 'adjudicated-agree'; r[5] = 'tabi-shokunin'; r[6] = 'agree'; r[7] = 'holds: seat-lane scope, quote pinned'; r[8] = '2026-11-05'; }
  return r;
})));
made.push(w('ws-author-tabi.tsv', rebuilt((r, i) => {
  if (i === 0) { r[4] = 'adjudicated-agree'; r[5] = 'tabi'; r[6] = 'agree'; r[7] = 'holds: seat-lane scope, quote pinned'; r[8] = '2026-11-05'; }
  return r;
})));

// Line-swap forgery: swap quote cells of two contested rows in the SAME file
// (kama-shokunin corpus/knowledge/listener-census.md:241 <-> :242) in BOTH the
// ledger and the worksheet, so ledger/worksheet stay consistent.
const led = fs.readFileSync(LED, 'utf8').split('\n').filter((l) => l.length > 0);
const findLed = (pathKey) => led.findIndex((l) => l.split('\t')[2] === pathKey && l.split('\t')[7] === 'contested-open');
const i241 = findLed('corpus/knowledge/listener-census.md:241');
const i242 = findLed('corpus/knowledge/listener-census.md:242');
if (i241 < 0 || i242 < 0) { console.error('fatal: swap rows not found'); process.exit(1); }
const a = led[i241].split('\t'); const b = led[i242].split('\t');
[a[6], b[6]] = [b[6], a[6]];
led[i241] = a.join('\t'); led[i242] = b.join('\t');
const forgedLed = led.join('\n') + '\n';
made.push(w('ledger-lineswap.tsv', forgedLed));

const wsRows = body.map((l) => l.split('\t'));
const findWs = (pathKey) => wsRows.findIndex((r) => r[1] === pathKey);
const j241 = findWs('corpus/knowledge/listener-census.md:241');
const j242 = findWs('corpus/knowledge/listener-census.md:242');
[wsRows[j241][3], wsRows[j242][3]] = [wsRows[j242][3], wsRows[j241][3]];
made.push(w('ws-lineswap.tsv', [HDR, ...wsRows.map((r) => r.join('\t'))].join('\n') + '\n'));

console.log(JSON.stringify({
  files: made,
  forgedLedgerSha256: createHash('sha256').update(forgedLed).digest('hex'),
  swapPaths: ['corpus/knowledge/listener-census.md:241', 'corpus/knowledge/listener-census.md:242'],
}));
