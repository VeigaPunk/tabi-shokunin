#!/usr/bin/env node
// W2QuoteB probe: verify every quoted span in corpus/knowledge/csrf-defense-shape-boundary.md
// against the S103 bytes fetched this round and the S102 bytes another seat fetched this round.
// Read-only: no network, no repo writes. Usage: node probe.mjs [REV]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SC = `${ROOT}/.ufo/waves/round-23/scratch/W2QuoteB`;
const REV = process.argv[2] || '03c1b4d';
const ENTRY = 'corpus/knowledge/csrf-defense-shape-boundary.md';
const MAXQ = 25;

const sha = (b) => createHash('sha256').update(b).digest('hex');
const norm = (s) => s
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201c\u201d]/g, '"')
  .replace(/[\u2013\u2014]/g, '-')
  .replace(/\u00a0/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const html = readFileSync(`${SC}/s103.html`, 'utf8');
const draft = readFileSync(`${ROOT}/.ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt`, 'utf8');

// ---- S103: flat text + heading offsets
const main = (html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) || [null, html])[1];
let body = '';
const marks = [];
for (const p of main.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .split(/(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>)/i)) {
  const h = p.match(/^<h([1-6])[^>]*>([\s\S]*?)<\/h\1>$/i);
  if (h) {
    const txt = norm(h[2].replace(/<[^>]+>/g, '')).replace(/\u00b6|&para;/g, '').trim();
    marks.push([body.length, txt]);
    body += ` ${txt} `;
  } else body += ` ${norm(p.replace(/<[^>]+>/g, ' '))} `;
}
const S103 = norm(body);
const headingAt = (i) => { let h = null; for (const [o, t] of marks) { if (o <= i) h = t; else break; } return h; };

// ---- S102: flat text + line map
const lines = draft.split('\n');
const starts = [];
const flatParts = [];
let off = 0;
for (let i = 0; i < lines.length; i++) {
  const n = norm(lines[i]);
  if (!n) continue;
  starts.push([off, i + 1]);
  flatParts.push(n);
  off += n.length + 1;
}
const S102 = flatParts.join(' ');
const lineOf = (o) => { let ln = null; for (const [s, l] of starts) { if (s <= o) ln = l; else break; } return ln; };

// ---- entry versions
const committed = execFileSync('git', ['-C', ROOT, 'show', `${REV}:${ENTRY}`], { encoding: 'utf8' });
const work = readFileSync(`${ROOT}/${ENTRY}`, 'utf8');

function spans(text) {
  const out = [];
  let buf = null;
  for (const ln of text.split('\n')) {
    const q = ln.match(/^>\s?(.*)$/);
    if (q) { buf = buf === null ? q[1] : `${buf} ${q[1]}`; continue; }
    if (buf !== null) { out.push(['block', buf]); buf = null; }
  }
  if (buf !== null) out.push(['block', buf]);
  const stripped = text.replace(/^\s*>.*$/gm, '');
  for (const m of stripped.matchAll(/"([\s\S]{1,}?)"/g)) {
    const q = m[1].trim();
    if (q.split(/\s+/).filter(Boolean).length >= 4) out.push(['inline', q]);
  }
  return out;
}

function locate(span) {
  const q = norm(span).replace(/\u2026$/, '').trim();
  let i = S103.indexOf(q);
  if (i >= 0) return { exact: true, where: `S103 heading "${headingAt(i)}"` };
  i = S102.indexOf(q);
  if (i >= 0) return { exact: true, where: `S102 line ${lineOf(i)}` };
  const w = q.split(' ');
  for (let n = w.length - 1; n >= 3; n--) {
    const p = w.slice(0, n).join(' ');
    const j3 = S103.indexOf(p);
    if (j3 >= 0) return { src: 'S103', exact: false, where: `PARTIAL ${n}/${w.length} S103 heading "${headingAt(j3)}"` };
    const j2 = S102.indexOf(p);
    if (j2 >= 0) return { src: 'S102', exact: false, where: `PARTIAL ${n}/${w.length} S102 line ${lineOf(j2)}` };
  }
  return { exact: false, where: 'ABSENT' };
}

console.log(`s103=${sha(html)} bytes=${Buffer.byteLength(html)}`);
console.log(`s102=${sha(draft)} bytes=${Buffer.byteLength(draft)}`);
console.log(`entry:${REV}=${sha(committed)} bytes=${Buffer.byteLength(committed)}`);
console.log(`entry:worktree=${sha(work)} bytes=${Buffer.byteLength(work)}`);
for (const [label, text] of [['committed', committed], ['worktree', work]]) {
  console.log(`\n== ${label} ==`);
  for (const [kind, s] of spans(text)) {
    const words = s.split(/\s+/).filter(Boolean).length;
    const L = locate(s);
    console.log(`${words <= MAXQ ? 'CAP-OK  ' : 'CAP-FAIL'} words=${String(words).padStart(2)} ${kind.padEnd(7)} ${L.exact ? 'VERBATIM ' : ''}${L.where} :: ${s.slice(0, 96).replace(/\n/g, ' ')}`);
  }
}
