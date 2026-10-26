#!/usr/bin/env node
// build-G4-junk-gate-row.mjs — round-33 C2 next-generation forgery G4
// ("a real Gate row for a junk URL on the same host").
//
// Attacked rule: gate v2 clause (4) — "the cited new S-id must also appear in a
// `corpus/lessons/round-*.md` `## Gate` table row at --rev carrying an https URL and a
// 64-hex sha256, and the registry row's source URL host must equal that Gate URL host
// (honest S124-S126 are in corpus/lessons/round-32.md:14-19 …)".
//
// Construction: one *genuine* read-only HTTPS GET of a page that grounds nothing about
// WebDriver BiDi (Chromium's chrome/test/chromedriver/BUILD.gn at the measured tag, a
// GN build manifest), on the same host as the honest S125 source. Its real HTTP status,
// byte count and sha256 — plus a verbatim quote located in the decoded bytes — are
// written into a new `## Gate` row; a new registry row cites the same URL; the entry's
// `source:` line cites the new row alone. Host equality holds because the Gate URL *is*
// the registry URL. Nothing about the gate's rule is violated, and no row of the entry
// gains any grounding from the file.
//
// Why it matters: "carries an https URL and a 64-hex sha256" plus "same host" is a
// fetch-receipt shape check. A fetch receipt proves a GET happened; it does not prove
// the fetched document supports the claim. The attacker can always make the receipt
// true by fetching something irrelevant.
//
// Usage: node build-G4-junk-gate-row.mjs --repo <clone> --rev <40hex>
//          --fetch-receipt <json from fetch-g4-junk.sh> [--sid S180] [--json]
import {
  blob, commit, emit, honest, parseArgs, prepareVariant, put, sha256, RECEIPT, ENTRY,
} from './forge-common.mjs';
import { readFileSync } from 'node:fs';

const o = parseArgs(process.argv.slice(2), { repo: 'str', rev: 'str', 'fetch-receipt': 'str', sid: 'str', json: 'bool' });
if (!o.repo || !o.rev || !o['fetch-receipt']) throw new Error('--repo, --rev and --fetch-receipt are required');
const sid = o.sid || 'S180';
if (!/^S\d{3,}$/.test(sid)) throw new Error('--sid must look like S180');

const repo = prepareVariant(o.repo, o.rev);
// Touch the honest receipt so the builder fails early if the rev is not the round-32 one.
honest(repo, o.rev);

const fetchReceipt = JSON.parse(readFileSync(o['fetch-receipt'], 'utf8'));
for (const k of ['url', 'utc', 'status', 'bytes', 'sha256', 'quote']) {
  if (fetchReceipt[k] === undefined) throw new Error(`fetch receipt lacks ${k}`);
}
if (fetchReceipt.status !== 200) throw new Error(`G4 needs a 200: got ${fetchReceipt.status}`);
if (!/^https:\/\//.test(fetchReceipt.url)) throw new Error('G4 url must be https');
if (!/^[0-9a-f]{64}$/.test(fetchReceipt.sha256)) throw new Error('G4 sha256 must be 64 lowercase hex');
const host = new URL(fetchReceipt.url).host;

// 1. Registry row: source URL host == the Gate URL host (it is the same URL).
const regPath = 'corpus/SOURCES.md';
const reg = blob(repo, o.rev, regPath);
if (reg === null) throw new Error(`${regPath} absent at ${o.rev}`);
const row = `| ${sid} | GN build manifest (junk) — ${fetchReceipt.url} | build | A | none — not protocol text | none | none | mined | 2026-10-26 | 90d | ${ENTRY} |`;
const regText = reg.toString('utf8').replace(/\n*$/, '\n') + row + '\n';
put(repo, regPath, regText);

// 2. Lesson Gate row: https URL + 64-hex sha256, with a verbatim located quote.
const lessonPath = 'corpus/lessons/round-33.md';
const existing = blob(repo, o.rev, lessonPath);
const gateRow = `| ${sid} | ${fetchReceipt.url} | ${fetchReceipt.utc} (HTTP ${fetchReceipt.status}, ${fetchReceipt.bytes} B, sha256 \`${fetchReceipt.sha256}\`) | "${fetchReceipt.quote}" |`;
let lessonText;
if (existing === null) {
  lessonText = [
    '# Round 33 — round-33 lane lesson (forge G4 variant)',
    '',
    '## Gate',
    '',
    '| row | URL | accessed | receipt quote (≤25 words, located in the fetched bytes) |',
    '|---|---|---|---|',
    gateRow,
    '',
    '## Mistakes',
    '',
    '| # | class | evidence pointer | captured by | fix |',
    '|---|---|---|---|---|',
    '',
  ].join('\n');
} else {
  const lines = existing.toString('utf8').split('\n');
  const g = lines.findIndex((l) => /^##\s+Gate\s*$/.test(l.trim()));
  if (g < 0) throw new Error(`${lessonPath} exists without a ## Gate section; this builder will not restructure it`);
  let sep = -1;
  for (let i = g + 1; i < lines.length; i += 1) {
    if (/^##\s/.test(lines[i])) break;
    if (/^\|[\s:|-]+\|\s*$/.test(lines[i])) { sep = i; break; }
  }
  if (sep < 0) throw new Error(`${lessonPath} ## Gate section has no table separator`);
  lines.splice(sep + 1, 0, gateRow);
  lessonText = lines.join('\n');
}
put(repo, lessonPath, lessonText);

// 3. Entry: cite the new row alone.
const entry = blob(repo, o.rev, ENTRY);
if (entry === null) throw new Error(`${ENTRY} absent at ${o.rev}`);
const entryText = entry.toString('utf8').replace(/^source:.*$/m, `source: ${sid} — unrelated page on the gate's own host; carries no BiDi claim (${host})`);
if (!entryText.includes(`source: ${sid}`)) throw new Error('entry source line not replaced');
put(repo, ENTRY, entryText);

const rc = commit(repo, `forge G4: ${sid} real fetch receipt of a junk URL, same host`);
emit({
  variant: 'G4',
  commit: rc,
  files: [
    { path: regPath, sha256: sha256(Buffer.from(regText)), bytes: Buffer.byteLength(regText) },
    { path: lessonPath, sha256: sha256(Buffer.from(lessonText)), bytes: Buffer.byteLength(lessonText) },
    { path: ENTRY, sha256: sha256(Buffer.from(entryText)), bytes: Buffer.byteLength(entryText) },
  ],
  attack: {
    rule: 'v2 clause (4) Gate-row / s1 provenance',
    url: fetchReceipt.url,
    host,
    status: fetchReceipt.status,
    bytes: fetchReceipt.bytes,
    sha256: fetchReceipt.sha256,
    quote: fetchReceipt.quote,
    sid,
  },
}, o.json);
