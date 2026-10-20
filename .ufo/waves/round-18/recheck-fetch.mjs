#!/usr/bin/env node
// tabi round 18 — C1 freshness: re-open one SOURCES row and emit a recheck receipt.
// Shared by every recheck seat so receipts share one schema and one normalizer.
// Usage:
//   node recheck-fetch.mjs --row S001 --row-url URL [--url FETCH_URL] --decode none|base64|html-text|pdf-text
//     --quote "verbatim quote" --quote-source "path:line" --verdict held|drift|unreachable
//     --anchor-observed "what revision/date marker the body shows" --note "teaches check" --seat Name
//     --outdir /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck
//     [--retain-body]  (gzip retention is the default; `--body` remains for S029 only)
//   node recheck-fetch.mjs --normalize-only --decode D --body FILE --quote Q   (probe; writes nothing)
// Exit: 0 receipt written with quoteFound=true; 1 receipt written but quote not found; 2 usage/fetch error.
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';

const sha = b => createHash('sha256').update(b).digest('hex');
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', mdash: '\u2014', ndash: '\u2013', hellip: '\u2026' };

export function decodeBody(bytes, decode) {
  if (decode === 'none') return bytes.toString('utf8');
  if (decode === 'base64') return Buffer.from(bytes.toString('utf8').replace(/\s+/g, ''), 'base64').toString('utf8');
  if (decode === 'html-text') {
    return bytes.toString('utf8')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e) => {
        if (/^#x/i.test(e)) return String.fromCodePoint(parseInt(e.slice(2), 16));
        if (/^#\d/.test(e)) return String.fromCodePoint(Number(e.slice(1)));
        return ENTITIES[e.toLowerCase()] ?? m;
      });
  }
  if (decode === 'pdf-text') {
    const dir = mkdtempSync(join(tmpdir(), 'tabi-r18-pdf-'));
    try {
      writeFileSync(join(dir, 'in.pdf'), bytes);
      const r = spawnSync('pdftotext', ['-layout', join(dir, 'in.pdf'), join(dir, 'out.txt')]);
      if (r.status !== 0) throw new Error('pdftotext failed');
      return readFileSync(join(dir, 'out.txt'), 'utf8');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  throw new Error(`unknown decode ${decode}`);
}

// One normalizer: Unicode NFC, typographic quotes/dashes folded, every whitespace run → one space.
export function normalize(text) {
  return text.normalize('NFC')
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-').replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function args(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith('--')) throw new Error(`bad arg ${k}`);
    const name = k.slice(2);
    if (name === 'normalize-only' || name === 'retain-body') { o[name] = true; continue; }
    if (i + 1 >= argv.length) throw new Error(`missing value for ${k}`);
    o[name] = argv[++i];
  }
  return o;
}

function main() {
  let o;
  try { o = args(process.argv.slice(2)); } catch (e) { console.error(`RECHECK usage: ${e.message}`); process.exit(2); }
  const decode = o.decode ?? 'none';
  if (o['normalize-only']) {
    const text = normalize(decodeBody(readFileSync(o.body), decode));
    const q = normalize(o.quote ?? '');
    const at = text.indexOf(q);
    console.log(JSON.stringify({ found: at >= 0, offset: at, normalizedLength: text.length, window: at >= 0 ? text.slice(Math.max(0, at - 200), at + q.length + 200) : null }));
    process.exit(at >= 0 ? 0 : 1);
  }
  for (const k of ['row', 'row-url', 'quote', 'quote-source', 'verdict', 'seat', 'outdir']) {
    if (!o[k]) { console.error(`RECHECK usage: --${k} required`); process.exit(2); }
  }
  if (!/^S\d{3,}$/.test(o.row)) { console.error('RECHECK usage: bad --row'); process.exit(2); }
  if (!['held', 'drift', 'unreachable'].includes(o.verdict)) { console.error('RECHECK usage: bad --verdict'); process.exit(2); }
  const words = o.quote.trim().split(/\s+/).length;
  if (words > 25) { console.error(`RECHECK usage: quote has ${words} words (>25)`); process.exit(2); }
  const url = o.url ?? o['row-url'];
  let bytes; let httpStatus = null; let command;
  if (o.body) {
    bytes = readFileSync(o.body);
    command = o['fetch-command'] ?? 'caller-supplied body';
  } else {
    const dir = mkdtempSync(join(tmpdir(), 'tabi-r18-recheck-'));
    try {
      const out = join(dir, 'body');
      const argv = ['-sSL', '--compressed', '--max-time', '90', '-A', 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18', '-o', out, '-w', '%{http_code}', url];
      const r = spawnSync('curl', argv, { encoding: 'utf8' });
      httpStatus = Number(r.stdout.trim()) || null;
      command = `curl ${argv.slice(0, -1).map(a => (a === out ? '<tmp>/body' : a)).join(' ')} '${url}'`;
      if (r.status !== 0 || !existsSync(out)) { console.error(`RECHECK fetch failed status=${r.status} ${r.stderr.trim()}`); bytes = Buffer.alloc(0); }
      else bytes = readFileSync(out);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  const bodyPath = `${o.row}.body.gz`;
  const compressedBody = gzipSync(bytes, { mtime: 0 });
  writeFileSync(join(o.outdir, bodyPath), compressedBody);
  let text = '';
  try { text = normalize(decodeBody(bytes, decode)); } catch (e) { console.error(`RECHECK decode failed: ${e.message}`); }
  const q = normalize(o.quote);
  const at = text.indexOf(q);
  const excerpt = at >= 0 ? text.slice(Math.max(0, at - 600), at + q.length + 600) : text.slice(0, 1200);
  const excerptName = `${o.row}.excerpt.txt`;
  writeFileSync(join(o.outdir, excerptName), `${excerpt}\n`);
  const receipt = {
    schema: 'tabi-source-recheck-v1',
    row: o.row,
    rowUrl: o['row-url'],
    url,
    fetchedAt: new Date().toISOString(),
    command,
    httpStatus,
    bytes: bytes.length,
    sha256: sha(bytes),
    bodyPath,
    bodyGzipBytes: compressedBody.length,
    bodyGzipSha256: sha(compressedBody),
    decode,
    normalizer: 'recheck-fetch.mjs normalize(): NFC, curly quotes/dashes folded, whitespace runs collapsed',
    quote: o.quote,
    quoteWords: words,
    quoteSource: o['quote-source'],
    quoteFound: at >= 0,
    quoteOffset: at,
    excerpt: excerptName,
    excerptSha256: sha(Buffer.from(`${excerpt}\n`)),
    anchorObserved: o['anchor-observed'] ?? '',
    teachesVerdict: o.verdict,
    note: o.note ?? '',
    seat: o.seat,
    producerSha256: sha(readFileSync(new URL(import.meta.url))),
  };
  writeFileSync(join(o.outdir, `${o.row}.json`), `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`RECHECK row=${o.row} http=${httpStatus} bytes=${bytes.length} sha256=${receipt.sha256} quoteFound=${at >= 0} verdict=${o.verdict}`);
  process.exit(at >= 0 ? 0 : 1);
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) main();
