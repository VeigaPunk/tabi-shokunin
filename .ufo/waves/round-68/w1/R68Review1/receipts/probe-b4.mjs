// B4: line-number bind audit + wedge case attribution.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SC = '/fast/scratch/hyaku/tabi-r68/R68Review1';
const LEDGER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv';

const wsText = fs.readFileSync(path.join(SC, 'ws-regen.tsv'), 'utf8').split('\n').filter((l) => l.length > 0).slice(1).map((l) => l.split('\t'));
const audit = [];
for (const row of wsText) {
  const [lane, pathKey, head, quote] = row;
  const cut = pathKey.lastIndexOf(':');
  const filePart = pathKey.slice(0, cut);
  const lineNo = Number(pathKey.slice(cut + 1));
  let content;
  try {
    content = execFileSync('git', ['-C', '/home/vgpnk/Projects/shokunin/' + lane, 'show', head + ':' + filePart], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (e) { audit.push({ lane, pathKey, gitErr: e.status }); continue; }
  const fileLines = content.split('\n');
  const lineText = fileLines[lineNo - 1];
  audit.push({
    lane, pathKey,
    atAssertedLine: lineText !== undefined && lineText.includes(quote),
    firstPresentLine: fileLines.findIndex((l) => l.includes(quote)) + 1,
    lineLine: lineText === undefined ? null : lineText.slice(0, 60),
    quoteHead: quote.slice(0, 60),
  });
}
const off = audit.filter((a) => a.atAssertedLine === false);
const nowhere = audit.filter((a) => a.firstPresentLine === 0 && a.gitErr === undefined);
const giterr = audit.filter((a) => a.gitErr !== undefined);
console.log('B4 total=' + audit.length + ' atAssertedLine_true=' + (audit.length - off.length) +
  ' quoteOffAssertedLine=' + off.length + ' quoteNotInFile=' + nowhere.length + ' gitErr=' + giterr.length);
if (off.length) console.log('OFF rows: ' + JSON.stringify(off, null, 1));
fs.writeFileSync(path.join(SC, 'receipts-b4-linebind.json'), JSON.stringify({ total: audit.length, off, nowhere, giterr }, null, 1));

// wedge -> catching-case attribution
const WEDGES = [
  ['remove-status-vocabulary', 'if (!STATUSES.has(status)) { findings.push([\'status-vocabulary\', line]); continue; }'],
  ['remove-head-mismatch-push', 'if (head !== expected.laneHead) findings.push([\'head-mismatch\', line]);'],
  ['remove-quote-mismatch-push', 'if (quote !== expected.quote) findings.push([\'quote-mismatch\', line]);'],
  ['remove-duplicate-key-push', '{ findings.push([\'duplicate-key\', line]); continue; }'],
  ['remove-adjudicator-author', 'else if (adjudicator === \'tabi\' || adjudicator.endsWith(\'-shokunin\\ttabi\')) findings.push([\'adjudicator-author\', line]);'],
  ['remove-ledger-pin-check', "if (sha256(ledgerBuf) !== args['expect-ledger-sha256']) {\n    findings.push(['ledger-pin', sha256(ledgerBuf)]);\n  }"],
  ['always-unknown-key', 'if (!contestedKeys.has(key)) { findings.push([\'unknown-key\', line]); continue; }'],
];
const SRC = fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-adjacency-adjudication-r68.mjs', 'utf8');
const attrib = [];
for (const [name, needle] of WEDGES) {
  const mutated = SRC.replace(needle, '/*w*/');
  const gateP = path.join(SC, 'gate2-' + name + '.mjs');
  fs.writeFileSync(gateP, mutated);
  const scratch = path.join(SC, 'st2-' + name);
  let out;
  try { out = execFileSync('/usr/bin/node', [gateP, '--selftest', '--scratch', scratch], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { out = e.stdout || ''; }
  const parsed = JSON.parse(out);
  const bad = parsed.results.filter((r) => r.observed !== r.expected).map((r) => r.name);
  attrib.push({ name, cases: parsed.cases, bad });
}
console.log(JSON.stringify(attrib));
fs.writeFileSync(path.join(SC, 'receipts-b-wedge-attribution.json'), JSON.stringify(attrib, null, 1));
