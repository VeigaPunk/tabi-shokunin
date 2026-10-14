#!/usr/bin/env node
// TABI lane B8-1 — compare the two cold reps of every cell.
// Deterministic surfaces compared: facts.json (canonical), ledger-before/after,
// http.log with timestamps stripped. Timings/PIDs are not compared (recorded in
// journey.json + driver.log only).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = '/tmp/w9-tabi-b91';
const cells = ['replay-guard-skip', 'replay-consumed-pre', 'replay-consumed-post', 'replay-unknown-token',
  'replay-terminus', 'double-apply-fresh-token', 'replay-307', 'xclient-consume', 'xclient-sessions'];

const canon = (o) => {
  if (Array.isArray(o)) return o.map(canon);
  if (o && typeof o === 'object') {
    const r = {};
    for (const k of Object.keys(o).sort()) r[k] = canon(o[k]);
    return r;
  }
  return o;
};
const normHttp = (s) => s.split('\n').map((l) => l.replace(/\[[^\]]+\]/, '[T]')).join('\n').trim();
const extractCurl = (log) => log.split('\n').filter((l) =>
  /status=[0-9]+.*$/.test(l) ||
  /token shape:/.test(l) || /^jar=/.test(l) ||
  /page data-/.test(l) || /^Set-Cookie: /.test(l) || /submit header /.test(l)).join('\n');

const rows = [];
for (const cell of cells) {
  const out = { cell, facts: 'n/a', ledger: 'n/a', http: 'n/a', notes: [] };
  const read = (rep, f) => {
    const p = `${ROOT}/runs/${cell}/rep${rep}/${f}`;
    return existsSync(p) ? readFileSync(p, 'utf8') : null;
  };
  if (cell === 'curl-control' || cell.startsWith('xclient-')) {
    const a = read(1, 'driver.log'), b = read(2, 'driver.log');
    if (a && b) {
      const ea = extractCurl(a), eb = extractCurl(b);
      out.facts = ea === eb ? 'yes' : 'NO';
      if (ea !== eb) out.notes.push('curl-extract differs');
    }
  } else {
    const fa = read(1, 'facts.json'), fb = read(2, 'facts.json');
    if (fa && fb) {
      const ca = JSON.stringify(canon(JSON.parse(fa))), cb = JSON.stringify(canon(JSON.parse(fb)));
      out.facts = ca === cb ? 'yes' : 'NO';
      if (ca !== cb) {
        const la = JSON.stringify(canon(JSON.parse(fa)), null, 1).split('\n');
        const lb = JSON.stringify(canon(JSON.parse(fb)), null, 1).split('\n');
        for (let i = 0; i < Math.max(la.length, lb.length); i++) {
          if (la[i] !== lb[i]) { out.notes.push(`facts L${i}: ${la[i]} || ${lb[i]}`); if (out.notes.length > 6) break; }
        }
      }
    }
  }
  const la = read(1, 'ledger-after.json'), lb = read(2, 'ledger-after.json');
  if (la && lb) out.ledger = la === lb ? 'yes' : 'NO';
  const ha = read(1, 'http.log'), hb = read(2, 'http.log');
  if (ha && hb) out.http = normHttp(ha) === normHttp(hb) ? 'yes' : 'NO';
  for (const rep of [1, 2]) {
    const j = read(rep, 'journey.json');
    const c = read(rep, 'closure.txt');
    if (j) { const rec = JSON.parse(j); out[`er${rep}`] = rec.error ? 'ERROR' : 'ok'; out[`req${rep}`] = rec.facts ? rec.facts.requestCount : '-'; }
    if (c) out[`cl${rep}`] = /FAIL/.test(c) ? 'FAIL' : 'closed';
  }
  rows.push(out);
}

const header = 'cell\tfacts\thttp\tledger\treq1\treq2\tclosure\tnotes';
const lines = [header];
for (const r of rows) {
  lines.push([r.cell, r.facts, r.http, r.ledger, r.req1 ?? '-', r.req2 ?? '-',
    `${r.cl1 ?? '-'}/${r.cl2 ?? '-'}`, r.notes.join(' ; ')].join('\t'));
}
writeFileSync(`${ROOT}/matrix.tsv`, lines.join('\n') + '\n');
console.log(lines.join('\n'));