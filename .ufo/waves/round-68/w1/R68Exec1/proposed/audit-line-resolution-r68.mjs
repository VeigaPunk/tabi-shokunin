#!/usr/bin/env node
// audit-line-resolution-r68.mjs — seat R68Exec1 line-specific audit that the
// C1 gate does NOT perform.
//
// The gate binds each worksheet row with `fileContent.includes(quote)` at the
// pinned head; it never uses the ":N" line suffix of the path key. This audit
// checks, per contested-open ledger row, whether the quote is byte-equal to
// line N of the file at the lane head (line-exact), merely a substring
// somewhere in the file (what the gate accepts), or unresolved.
//
// Read-only: runs `git -C <fleet>/<lane> show <head>:<file>` per row.
//
// usage: node audit-line-resolution-r68.mjs --ledger <tsv> --snapshot <tsv> --fleet <root> --out <json>

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) return null;
    const key = a.slice(2);
    const val = argv[i + 1];
    if (val === undefined || val.startsWith('--')) return null;
    args[key] = val;
    i++;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args || !args.ledger || !args.snapshot || !args.fleet || !args.out) {
  process.stderr.write('usage: node audit-line-resolution-r68.mjs --ledger <tsv> --snapshot <tsv> --fleet <root> --out <json>\n');
  process.exit(2);
}
function fail(msg) { process.stderr.write('fatal: ' + msg + '\n'); process.exit(1); }

const ledgerLines = fs.readFileSync(args.ledger, 'utf8').split('\n').filter((l) => l.length > 0);
const snapLines = fs.readFileSync(args.snapshot, 'utf8').split('\n').filter((l) => l.length > 0);
const lhdr = ledgerLines[0].split('\t');
const L = { type: 0, lane: lhdr.indexOf('lane'), path: lhdr.indexOf('path'), quote: lhdr.indexOf('quote'), disposition: lhdr.indexOf('disposition'), head: lhdr.indexOf('head') };
if (L.lane < 0 || L.path < 0 || L.quote < 0 || L.disposition < 0 || L.head < 0) fail('ledger header columns missing');
const snapHeads = {};
for (let i = 1; i < snapLines.length; i++) {
  const c = snapLines[i].split('\t');
  snapHeads[c[0]] = c[1];
}

const rows = [];
let currentLaneHead = null;
for (let i = 1; i < ledgerLines.length; i++) {
  const r = ledgerLines[i].split('\t');
  if (r[L.type] === 'lane') { currentLaneHead = r[L.head]; continue; }
  if (r[L.disposition] !== 'contested-open') continue;
  const lane = r[L.lane];
  const pathKey = r[L.path];
  const quote = r[L.quote];
  const head = snapHeads[lane];
  const sep = pathKey.lastIndexOf(':');
  const file = sep > 0 ? pathKey.slice(0, sep) : pathKey;
  const lineNoStr = sep > 0 ? pathKey.slice(sep + 1) : '';
  const lineNo = lineNoStr === '' || !/^\d+$/.test(lineNoStr) ? null : Number(lineNoStr);
  let content = null;
  try {
    content = execFileSync('git', ['-C', args.fleet + '/' + lane, 'show', head + ':' + file], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    rows.push({ lane, path: pathKey, resolved: false, error: 'git-show-failed' });
    continue;
  }
  const fileLines = content.split('\n');
  const exactAtLine = lineNo !== null && fileLines[lineNo - 1] === quote;
  const anywhere = content.includes(quote);
  const row = {
    lane, path: pathKey, resolved: true,
    headMatchesLedger: currentLaneHead === head,
    fileLines: fileLines.length,
    lineNo,
    exactAtLine,
    anywhere,
    gateAccepts: anywhere, // the gate's only content check
  };
  if (!exactAtLine && lineNo !== null && lineNo >= 1 && lineNo <= fileLines.length) {
    row.actualLineAtN = fileLines[lineNo - 1].slice(0, 200);
  }
  rows.push(row);
}

const resolved = rows.filter((r) => r.resolved);
const summary = {
  rows: rows.length,
  resolved: resolved.length,
  lineExact: resolved.filter((r) => r.exactAtLine === true).length,
  substringOnly: resolved.filter((r) => r.exactAtLine === false && r.anywhere === true).length,
  unresolved: resolved.filter((r) => r.anywhere === false).length,
  noLineSuffix: rows.filter((r) => r.lineNo === null).length,
  headMismatches: rows.filter((r) => r.resolved && r.headMatchesLedger === false).length,
};
fs.writeFileSync(args.out, JSON.stringify({ summary, rows }, null, 2) + '\n');
process.stdout.write(JSON.stringify(summary) + '\n');
