#!/usr/bin/env node
// Round 22 wave-4 quarantine hand-check (tabi).
// Reads the lane's slice of the campaign absent-defect register (read-only) and
// re-fetches each cited source, then looks for the registered quote in the fetched
// bytes under whitespace-insensitive matching. Writes verdicts only; no campaign
// file is written and no package row is adopted this round.
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const HERE = dirname(SELF);
const REGISTER = '/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md';
const OUT = resolve(HERE, 'quarantine-verdicts.json');
const CACHE = resolve(HERE, 'cache');
mkdirSync(CACHE, { recursive: true });

const norm = (value) => String(value)
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const lines = readFileSync(REGISTER, 'utf8').split('\n');
const rows = [];
for (const line of lines) {
  if (!line.startsWith('|')) continue;
  const cells = line.split('|').map((cell) => cell.trim());
  // | lane | round | id | class | source | quotes | note |
  if (cells.length < 6) continue;
  if (cells[1] !== '`tabi`') continue;
  if (!/^round\d+$/.test(cells[2])) continue;
  const rawId = /S\d+/.exec(cells[3]);
  if (!rawId) continue;
  const clsCell = cells[4].replace(/`/g, '');
  const cls = /^(payload-absent|unreachable)$/.test(clsCell) ? clsCell : 'unreachable';
  const source = cells[5].replace(/`/g, '');
  const quoteCell = cells[6] || '';
  const quotes = quoteCell.split(/<br\s*\/?>/i)
    .map((q) => norm(q.replace(/`/g, '')))
    .filter(Boolean);
  rows.push({ round: cells[2], id: rawId[0], cls, source, quotes, note: cells[7] || clsCell });
}

// Controls: the matcher must find text that is in a fetched page and must not find
// text that is not. A 100% absent result is only meaningful with these passing.
const CONTROLS = [
  { name: 'present-rfc9309', source: 'https://www.rfc-editor.org/rfc/rfc9309.txt', needle: 'robots.txt', expect: true },
  { name: 'present-rfc9110', source: 'https://www.rfc-editor.org/rfc/rfc9110.txt', needle: 'Retry-After', expect: true },
  { name: 'present-chromium-readme', source: 'https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/README.md', needle: 'devtools', expect: true },
  { name: 'absent-control-string', source: 'https://www.rfc-editor.org/rfc/rfc9309.txt', needle: 'zzz-not-present-control-string-31337', expect: false },
];

async function fetchText(url) {
  const cached = resolve(CACHE, createHash('sha256').update(url).digest('hex').slice(0, 16));
  try { return { ok: true, body: readFileSync(cached, 'utf8'), cached: true }; } catch {}
  const attempts = [];
  for (let i = 0; i < 3; i += 1) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(30000),
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
          'accept-language': 'en-US,en;q=0.9,ja;q=0.8,zh;q=0.7',
        },
      });
      const body = await res.text();
      writeFileSync(cached, body);
      return { ok: res.ok, status: res.status, body };
    } catch (error) {
      attempts.push(String(error?.message || error));
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  return { ok: false, error: attempts.join(' | ') };
}

const bySource = new Map();
for (const row of rows) {
  if (!bySource.has(row.source)) bySource.set(row.source, []);
  bySource.get(row.source).push(row);
}
for (const control of CONTROLS) {
  if (!bySource.has(control.source)) bySource.set(control.source, []);
}

const controlResults = [];
for (const control of CONTROLS) {
  const fetched = await fetchText(control.source);
  const hay = fetched.ok ? norm(fetched.body) : '';
  const found = fetched.ok ? hay.includes(control.needle) : null;
  controlResults.push({
    name: control.name, source: control.source, needle: control.needle,
    fetch: fetched.ok ? { status: fetched.status, bytes: fetched.body.length } : { error: fetched.error },
    found, expected: control.expect, pass: found === control.expect,
  });
}
const controlsPassed = controlResults.every((control) => control.pass);

const verdicts = [];
for (const [source, group] of bySource) {
  const fetched = await fetchText(source);
  const hay = fetched.ok ? norm(fetched.body) : '';
  const hayNoMarkup = fetched.ok ? norm(fetched.body.replace(/<[^>]+>/g, ' ')) : '';
  for (const row of group) {
    const located = [];
    const missing = [];
    for (const quote of row.quotes) {
      // long quotes may be truncated in the register; match on a distinctive prefix
      const probe = quote.length > 120 ? quote.slice(0, 120) : quote;
      const hit = fetched.ok && (hay.includes(probe) || hayNoMarkup.includes(probe));
      (hit ? located : missing).push(probe);
    }
    let verdict;
    if (row.cls === 'unreachable') verdict = 'unverifiable-unreachable';
    else if (row.quotes.length === 0) verdict = 'unverifiable-register-malformed';
    else if (!fetched.ok) verdict = 'unverifiable-unreachable';
    else if (missing.length === 0) verdict = 'present-locatable';
    else verdict = 'absent-refused';
    verdicts.push({
      id: row.id, round: row.round, registerClass: row.cls, source,
      fetch: fetched.ok ? { status: fetched.status, bytes: fetched.body.length } : { error: fetched.error },
      quotes: row.quotes.length, located: located.length, missing: missing.length,
      verdict,
    });
    process.stderr.write(`${row.id} ${verdict} ${missing.length}/${row.quotes.length} missing\n`);
  }
}

const summary = verdicts.reduce((acc, v) => { acc[v.verdict] = (acc[v.verdict] || 0) + 1; return acc; }, {});
const receipt = {
  schema: 'tabi-round22-quarantine-handcheck-v1',
  register: REGISTER,
  registerSha256: createHash('sha256').update(readFileSync(REGISTER)).digest('hex'),
  accessedAt: new Date().toISOString(),
  adoption: 'closed — wave-4 quarantine-first round: verdicts only, no package row appended',
  rows: rows.length,
  summary,
  controlsPassed,
  controls: controlResults,
  verdicts,
};
writeFileSync(OUT, `${JSON.stringify(receipt, null, 2)}\n`);
writeFileSync(resolve(HERE, 'quarantine-verdicts.tsv'),
  ['id\tround\tverdict\tclass\tlocated/missing\tsource',
    ...verdicts.map((v) => `${v.id}\t${v.round}\t${v.verdict}\t${v.registerClass}\t${v.located}/${v.missing}\t${v.source}`)].join('\n') + '\n');
process.stdout.write(`${JSON.stringify({ rows: rows.length, summary, controlsPassed })}\n`);
process.exitCode = controlsPassed ? 0 : 3;
