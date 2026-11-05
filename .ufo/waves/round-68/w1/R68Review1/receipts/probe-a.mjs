// Level-A probes: CLI + policy attacks on the real C1 gate with real r66 inputs.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const SC = '/fast/scratch/hyaku/tabi-r68/R68Review1';
const GATE = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-adjacency-adjudication-r68.mjs';
const LEDGER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv';
const SNAPSHOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/measure/snapshot-live-r66.tsv';
const FLEET = '/home/vgpnk/Projects/shokunin';
const LEDGER_SHA = createHash('sha256').update(fs.readFileSync(LEDGER)).digest('hex');
const SNAP_SHA = createHash('sha256').update(fs.readFileSync(SNAPSHOT)).digest('hex');
const HDR = 'lane\tpath\thead\tpquote\tstatus\tadjudicator\tverdict\treason\tdate'
  .replace('pquote', 'quote');
const wsRows = fs.readFileSync(path.join(SC, 'ws-regen.tsv'), 'utf8').split('\n').filter((l) => l.length > 0);
const HEADER = wsRows[0];
const data = wsRows.slice(1).map((l) => l.split('\t'));

const receipts = [];
function run(name, argv, opts = {}) {
  const start = process.hrtime.bigint();
  let rc, stdout, stderr;
  try {
    stdout = execFileSync('/usr/bin/node', [GATE, ...argv], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    rc = 0; stderr = '';
  } catch (e) {
    rc = e.status; stdout = e.stdout || ''; stderr = e.stderr || '';
  }
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  let parsed = null; try { parsed = JSON.parse(stdout); } catch { /* usage text */ }
  receipts.push({ name, argv: [GATE, ...argv].join(' '), rc, ms: ms.toFixed(1), parsed, stdout: stdout.slice(0, 500), stderr: stderr.slice(0, 300), ...opts });
  return { rc, parsed, stdout };
}

const W = (name, text) => { const p = path.join(SC, 'probe-' + name + '.tsv'); fs.writeFileSync(p, text); return p; };
const mk = (i, patch = {}) => data[i].map((c, j) => (j in patch ? patch[j] : c)).join('\t');
function findRow(laneKey) { return data.findIndex((r) => r[0] + ':' + r[1] === laneKey); }
const KAGI64 = findRow('kagi-shokunin:PROVINCE.md:64');
const KAGI83 = findRow('kagi-shokunin:PROVINCE.md:83');
const base = (extra) => ['--ledger', LEDGER, '--snapshot', SNAPSHOT, '--fleet', FLEET,
  '--expect-ledger-sha256', LEDGER_SHA, '--expect-snapshot-sha256', SNAP_SHA, ...(extra || [])];

// A1 documented --json flag rejected
run('A1-json-flag-rejected', base(['--worksheet', path.join(SC, 'ws-regen.tsv'), '--json']));
// A2 typo'd assertion flag silently ignored -> gate stays green without count check
run('A2-typo-flag-silently-ignored', base(['--worksheet', path.join(SC, 'ws-regen.tsv'),
  '--expec-pending', '48', '--max-adjudicated', '0']));
// A3 supersets of unknown flags accepted, values swallowed as values-of-next
run('A3-unknown-flag-accepted', base(['--worksheet', path.join(SC, 'ws-regen.tsv'), '--frobnicate', '1']));
// A4 --repo accepted anywhere but unused (dead admission)
run('A4-bogus-repo-ignored', base(['--worksheet', path.join(SC, 'ws-regen.tsv'), '--repo', '/nonexistent/zap']));
// A5 wrong count assertion trips
run('A5-expect-pending-48', base(['--worksheet', path.join(SC, 'ws-regen.tsv'), '--expect-pending', '48']));
// A6 cross-key swap: kagi :83 row re-keyed to :64, quotes travel with keys
const swap = [HEADER, mk(KAGI64, { 1: 'PROVINCE.md:83' }), mk(KAGI83, { 1: 'PROVINCE.md:64' }),
  ...data.filter((_, i) => i !== KAGI64 && i !== KAGI83).map((r) => r.join('\t'))].join('\n') + '\n';
run('A6-swap-key-between-two-rows', base(['--worksheet', W('swap', swap)]));
// A7-quote right bytes, wrong line: kagi :64 key, kagi :83 quote
const wrongline = [HEADER, mk(KAGI64, { 3: data[KAGI83][3] }),
  ...data.filter((_, i) => i !== KAGI64).map((r) => r.join('\t'))].join('\n') + '\n';
run('A7-quote-at-wrong-line', base(['--worksheet', W('wrongline', wrongline)]));
// A8 right-line sanity control: unpatched worksheet is truly green
run('A8-green-control', base(['--worksheet', path.join(SC, 'ws-regen.tsv')]));
// A9 symlinked worksheet -> missing (lstat fail-closed)
const sym = path.join(SC, 'probe-symlink.tsv');
try { fs.unlinkSync(sym); } catch {}
fs.symlinkSync(path.join(SC, 'ws-regen.tsv'), sym);
run('A9-symlink-worksheet', base(['--worksheet', sym]));
// A10 worksheet written as directory
const dirP = path.join(SC, 'probe-dir.tsv'); fs.mkdirSync(dirP, { recursive: true });
run('A10-dir-worksheet', base(['--worksheet', dirP]));
// A11 empty worksheet
run('A11-empty-worksheet', base(['--worksheet', W('empty', '')]));
// A12 CRLF worksheet
run('A12-crlf-worksheet', base(['--worksheet', W('crlf', (HEADER + '\r\n' + data.map((r) => r.join('\t')).join('\r\n') + '\r\n'))]));
// policy: admission rows on real data — adjudicator variants + dirty verdict + date
const admit = (patch) => [HEADER, mk(KAGI64, { 4: 'adjudicated-agree', ...patch }),
  ...data.filter((_, i) => i !== KAGI64).map((r) => r.join('\t'))].join('\n') + '\n';
// A13 arbitrary seat label accepted as adjudicator of record
run('A13-arbitrary-adjudicator-label', base(['--worksheet', W('adjarb', admit({ 5: 'not-a-real-seat-9999', 6: 'agree', 7: 'holds because reasons', 8: '2026-11-05' })), '--max-adjudicated', '1']));
// A14 author lane under full fleet name slips the author check
run('A14-adjudicator-tabi-shokunin', base(['--worksheet', W('adjts', admit({ 5: 'tabi-shokunin', 6: 'agree', 7: 'self-adjudicated', 8: '2026-11-05' })), '--max-adjudicated', '1']));
// A15 verdict cell completely unchecked (kept em-dash on an adjudicated row)
run('A15-verdict-unchecked', base(['--worksheet', W('verdict', admit({ 5: 'operator', 6: '—', 7: 'holds', 8: '2026-11-05' })), '--max-adjudicated', '1']));
// A16 invalid calendar date passes shape check
run('A16-date-9999-99-99', base(['--worksheet', W('date', admit({ 5: 'operator', 6: 'agree', 7: 'holds', 8: '9999-99-99' })), '--max-adjudicated', '1']));
// A17 verdict value never crosses ANY vocabulary (quixotic verdict on agree status)
run('A17-verdict-quixotic', base(['--worksheet', W('verdict2', admit({ 5: 'operator', 6: 'pudding', 7: 'holds', 8: '2026-11-05' })), '--max-adjudicated', '1']));

fs.writeFileSync(path.join(SC, 'receipts-a.jsonl'), receipts.map((r) => JSON.stringify(r)).join('\n') + '\n');
// console summary
for (const r of receipts) {
  const f = r.parsed ? (r.parsed.findings || []).join(' | ') : (r.stdout || '').trim().slice(0, 120);
  console.log(r.name, 'rc=' + r.rc, 'ok=' + (r.parsed ? r.parsed.ok : '?'), 'ms=' + r.ms, '[' + f + ']');
}
