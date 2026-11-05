// B6: precise single-token wedges on the resolve path + missing-key edge semantics.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SC = '/fast/scratch/hyaku/tabi-r68/R68Review1';
const SRC = fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-adjacency-adjudication-r68.mjs', 'utf8');
// token-level, syntax-preserving wedges
const TOK = [
  ['no-json-kill-quote-unresolved', "findings.push(['quote-unresolved', res.line])", "/*x*/"],
  ['no-json-kill-path-unresolved', "findings.push(['path-unresolved', res.line])", "/*x*/"],
  ['no-json-kill-pending-dirty', "findings.push(['pending-fields-dirty', line + ':' + cellName])", "/*x*/"],
];
const outAll = [];
for (const [name, needle, repl] of TOK) {
  if (!SRC.includes(needle)) { outAll.push({ name, error: 'needle-not-found' }); continue; }
  const mutated = SRC.replace(needle, repl);
  const gateP = path.join(SC, 'gate6-' + name + '.mjs');
  fs.writeFileSync(gateP, mutated);
  let rc, out;
  try { out = execFileSync('/usr/bin/node', [gateP, '--selftest', '--scratch', path.join(SC, 'st6-' + name)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); rc = 0; }
  catch (e) { rc = e.status; out = e.stdout || ''; }
  let parsed = null; try { parsed = JSON.parse(out); } catch {}
  outAll.push({ name, rc, verdict: parsed ? parsed.verdict : 'no-json', failed: parsed ? parsed.failed : null,
    expectedMismatch: parsed ? parsed.results.filter((r) => r.observed !== r.expected).map((r) => r.name) : null });
}
console.log(JSON.stringify(outAll));
fs.writeFileSync(path.join(SC, 'receipts-b6.json'), JSON.stringify(outAll, null, 1));

// B6b: missing-key semantics in main(): a worksheet claiming MORE than the ledger is unknown-key,
// one claiming LESS is missing-key — check real-run behavior for a 1-key-short worksheet.
const rowFor = (i) => SC + '/extra-' + i + '.tsv';
fs.copyFileSync(path.join(SC, 'ws-regen.tsv'), rowFor('copy'));
const lines = fs.readFileSync(path.join(SC, 'ws-regen.tsv'), 'utf8').split('\n').filter((l) => l.length > 0);
fs.writeFileSync(rowFor('short'), lines.slice(0, 25).join('\n') + '\n'); // drop 24 rows
const GATE = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-adjacency-adjudication-r68.mjs';
const LEDGER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv';
const SNAPSHOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/measure/snapshot-live-r66.tsv';
import { createHash } from 'node:crypto';
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
try {
  const r = execFileSync('/usr/bin/node', [GATE, '--ledger', LEDGER, '--snapshot', SNAPSHOT, '--worksheet', rowFor('short'),
    '--fleet', '/home/vgpnk/Projects/shokunin', '--expect-ledger-sha256', sha(LEDGER), '--expect-snapshot-sha256', sha(SNAPSHOT)],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  console.log('B6b-short-worksheet rc=0 ' + r.trim());
} catch (e) {
  const p = JSON.parse(e.stdout || '{}');
  console.log('B6b-short-worksheet rc=' + e.status + ' ok=' + p.ok + ' byCheck=' + JSON.stringify(p.byCheck).slice(0, 200));
}
