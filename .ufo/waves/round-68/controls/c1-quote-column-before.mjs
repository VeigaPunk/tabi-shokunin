#!/usr/bin/env node
// check-adjacency-adjudication-r68.mjs — C1 gate, tabi round 68.
//
// Verifies that corpus/adjacency-adjudication-r68.tsv (the per-row non-author
// adjudication worksheet) covers exactly the contested-open rows of the
// round-66 adjudicated sibling-overlap ledger, binds each row's evidence to
// committed bytes (sibling head from the r66 snapshot, quote byte-equality,
// path resolvable at that head in the sibling checkout), and enforces the
// adjudication-state polarity: at freeze every row is pending-non-author with
// clean cells; an adjudicated row requires a non-author adjudicator, reason
// and ISO date. The lane itself can never be the adjudicator of record.
//
// Exit codes: 0 = clean, 1 = findings, 2 = usage.
// Inputs are pinned by sha256; argv is validated; git is invoked with execFile
// (never a shell); scratch (selftest fixtures) must be provided via --scratch
// or TMPDIR — the gate never writes to /tmp directly.

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';

const HEX40 = /^[0-9a-f]{40}$/;
const HEX64 = /^[0-9a-f]{64}$/;
const WORKSHEET_HEADER =
  'lane\tpath\thead\tquote\tstatus\tadjudicator\tverdict\treason\tdate';
const STATUSES = new Set([
  'pending-non-author',
  'adjudicated-agree',
  'adjudicated-disagree',
  'adjudicated-split',
]);
const EXPECTED_HEADER_CELLS = [
  'lane', 'path', 'head', 'quote', 'status', 'adjudicator', 'verdict',
  'reason', 'date',
];

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function readIfExists(p) {
  try {
    const st = fs.lstatSync(p);
    if (!st.isFile()) return null; // symlink or dir -> not a regular file
    return fs.readFileSync(p);
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) return null;
    const key = a.slice(2);
    if (key === 'selftest') { args.selftest = true; continue; }
    const val = argv[i + 1];
    if (val === undefined || val.startsWith('--')) return null;
    args[key] = val;
    i++;
  }
  return args;
}

function git(repoDir, gitArgs, cb) {
  execFile('git', ['-C', repoDir, ...gitArgs], { maxBuffer: 64 * 1024 * 1024 }, cb);
}

function parseTsv(buf) {
  const text = buf.toString('utf8');
  const lines = text.split('\n').filter((l) => l.length > 0);
  return lines.map((l) => l.split('\t'));
}

function checkLedgerSnapshot(rows, findings, ctx) {
  // rows: parsed ledger TSV. Header: type lane path provinceSha256 lines bgHits quote disposition head
  let currentLane = null;
  const laneHeads = {};
  const contested = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 9) { findings.push(['ledger-row-shape', String(i + 1)]); continue; }
    if (i === 0 && r[0] === 'type') continue;
    if (r[0] === 'lane') {
      currentLane = r[1];
      laneHeads[currentLane] = r[8];
      continue;
    }
    if (r[0] === 'line' && r[7] === 'contested-open') {
      contested.push({ lane: r[1], path: r[2], quote: r[5], laneHead: laneHeads[r[1]] });
    }
  }
  ctx.contested = contested;
  ctx.laneHeads = laneHeads;
}

function checkSnapshot(rows, findings, ctx) {
  // rows: parsed snapshot TSV. Header: lane<TAB>head
  const heads = {};
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 2) { findings.push(['snapshot-row-shape', String(i + 1)]); continue; }
    if (i === 0 && r[0] === 'lane') continue;
    heads[r[0]] = r[1];
  }
  ctx.snapshotHeads = heads;
  for (const c of ctx.contested) {
    if (!heads[c.lane]) findings.push(['snapshot-lane-missing', c.lane]);
    else if (heads[c.lane] !== c.laneHead) {
      findings.push(['head-source-mismatch', c.lane + ':' + c.path]);
    }
  }
}

function validateKey(lane, pathKey) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(lane)) return false;
  if (!/^[A-Za-z0-9][A-Za-z0-9._/@+-]*(:[0-9]+)?$/.test(pathKey)) return false;
  return true;
}

function resolveAtHead(fleetRoot, lane, head, filePath, cb) {
  const repoDir = path.join(fleetRoot, lane);
  if (!HEX40.test(head) || !/^[A-Za-z0-9][A-Za-z0-9._/@+-]*$/.test(filePath)) {
    cb(new Error('invalid-argv'));
    return;
  }
  git(repoDir, ['cat-file', '-e', head + ':' + filePath], (err) => {
    if (err) { cb(null, { resolved: false }); return; }
    git(repoDir, ['show', head + ':' + filePath], (err2, stdout) => {
      if (err2) { cb(null, { resolved: false }); return; }
      cb(null, { resolved: true, content: stdout });
    });
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args) { usage(); }
  const required = ['ledger', 'worksheet', 'snapshot', 'fleet', 'expect-ledger-sha256', 'expect-snapshot-sha256'];
  for (const k of required) {
    if (!args[k]) { usage('missing --' + k); }
  }
  if (!HEX64.test(args['expect-ledger-sha256']) || !HEX64.test(args['expect-snapshot-sha256'])) usage('bad sha pin');
  const repoRoot = args.repo || process.cwd();
  const findings = [];
  const ctx = {};

  const ledgerBuf = readIfExists(args.ledger);
  if (!ledgerBuf) { emit(findings, 0, 0, 0, 'ledger-missing'); return; }
  if (sha256(ledgerBuf) !== args['expect-ledger-sha256']) {
    findings.push(['ledger-pin', sha256(ledgerBuf)]);
  }
  const snapBuf = readIfExists(args.snapshot);
  if (!snapBuf) { emit(findings, 0, 0, 0, 'snapshot-missing'); return; }
  if (sha256(snapBuf) !== args['expect-snapshot-sha256']) {
    findings.push(['snapshot-pin', sha256(snapBuf)]);
  }

  checkLedgerSnapshot(parseTsv(ledgerBuf), findings, ctx);
  checkSnapshot(parseTsv(snapBuf), findings, ctx);
  const contestedKeys = new Set(ctx.contested.map((c) => c.lane + '\t' + c.path));

  const wsBuf = readIfExists(args.worksheet);
  if (!wsBuf) { emit(findings, ctx.contested.length, 0, 0, 'worksheet-missing'); return; }
  const wsRows = parseTsv(wsBuf);
  if (wsRows.length === 0 || wsRows[0].join('\t') !== WORKSHEET_HEADER) {
    findings.push(['worksheet-header', String(wsRows.length)]);
    emit(findings, ctx.contested.length, 0, 0);
    return;
  }

  const seen = new Set();
  let pending = 0;
  let adjudicated = 0;
  const resolutions = []; // {lane, head, filePath, quote}
  for (let i = 1; i < wsRows.length; i++) {
    const r = wsRows[i];
    const line = String(i + 1);
    if (r.length !== EXPECTED_HEADER_CELLS.length) {
      findings.push(['worksheet-row-shape', line]);
      continue;
    }
    const [lane, pathKey, head, quote, status, adjudicator, verdict, reason, date] = r;
    const key = lane + '\t' + pathKey;
    if (seen.has(key)) { findings.push(['duplicate-key', line]); continue; }
    seen.add(key);
    if (!contestedKeys.has(key)) { findings.push(['unknown-key', line]); continue; }
    if (!validateKey(lane, pathKey)) findings.push(['key-shape', line]);
    if (!HEX40.test(head)) { findings.push(['head-shape', line]); continue; }
    const expected = ctx.contested.find((c) => c.lane + '\t' + c.path === key);
    if (quote !== expected.quote) findings.push(['quote-mismatch', line]);
    if (head !== expected.laneHead) findings.push(['head-mismatch', line]);
    if (!STATUSES.has(status)) { findings.push(['status-vocabulary', line]); continue; }
    if (status === 'pending-non-author') {
      pending++;
      for (const [cellName, cell] of [['adjudicator', adjudicator], ['verdict', verdict], ['reason', reason], ['date', date]]) {
        if (cell !== '—') findings.push(['pending-fields-dirty', line + ':' + cellName]);
      }
    } else {
      adjudicated++;
      if (!adjudicator || adjudicator === '—') findings.push(['adjudicator-missing', line]);
      else if (adjudicator === 'tabi' || adjudicator.endsWith('-shokunin\ttabi')) findings.push(['adjudicator-author', line]);
      if (!reason || reason === '—') findings.push(['reason-missing', line]);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) findings.push(['date-invalid', line]);
    }
    const filePath = pathKey.includes(':') ? pathKey.slice(0, pathKey.lastIndexOf(':')) : pathKey;
    resolutions.push({ line, lane, head, filePath, quote });
  }
  for (const key of contestedKeys) {
    if (!seen.has(key)) findings.push(['missing-key', key.replace('\t', ':')]);
  }
  if (args['expect-pending'] !== undefined && pending !== Number(args['expect-pending'])) {
    findings.push(['pending-count', String(pending)]);
  }
  if (args['max-adjudicated'] !== undefined && adjudicated > Number(args['max-adjudicated'])) {
    findings.push(['adjudicated-over-ceiling', String(adjudicated)]);
  }

  let done = 0;
  for (const res of resolutions) {
    resolveAtHead(args.fleet, res.lane, res.head, res.filePath, (err, out) => {
      if (err || !out || !out.resolved) findings.push(['path-unresolved', res.line]);
      else if (!out.content.includes(res.quote)) findings.push(['quote-unresolved', res.line]);
      done++;
      if (done === resolutions.length) emit(findings, ctx.contested.length, pending, adjudicated);
    });
  }
  if (resolutions.length === 0) emit(findings, ctx.contested.length, pending, adjudicated);
}

function emit(findings, contestedCount, pending, adjudicated, fatal) {
  if (fatal) findings.push([fatal, '1']);
  const byCheck = {};
  for (const [t] of findings) byCheck[t] = (byCheck[t] || 0) + 1;
  const ok = findings.length === 0;
  process.stdout.write(JSON.stringify({
    ok, findings: findings.map(([t, d]) => t + ': ' + d), byCheck,
    checked: contestedCount, pending, adjudicated, gate: 'check-adjacency-adjudication-r68',
  }) + '\n');
  process.exit(ok ? 0 : 1);
}

function usage(msg) {
  process.stderr.write('usage: node check-adjacency-adjudication-r68.mjs --ledger <tsv> --worksheet <tsv> --snapshot <tsv> --fleet <root> --expect-ledger-sha256 <hex> --expect-snapshot-sha256 <hex> [--repo <dir>] [--expect-pending N] [--max-adjudicated N] --json | --selftest --scratch <dir>\n' + (msg ? 'error: ' + msg + '\n' : ''));
  process.exit(2);
}

// ---------------- selftest ----------------

function selftest(scratch) {
  if (!scratch) usage('selftest needs --scratch');
  fs.rmSync(scratch, { recursive: true, force: true });
  fs.mkdirSync(scratch, { recursive: true });
  const fleet = path.join(scratch, 'fleet');
  const repo = path.join(fleet, 'zed-shokunin');
  fs.mkdirSync(repo, { recursive: true });
  const g = (a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8' }).trim();
  execFileSync('git', ['init', '-q', repo]);
  fs.writeFileSync(path.join(repo, 'PROVINCE.md'), 'zed owns Z proof surfaces\nother\nzed refuses Y\nzed absent proof\n');
  g(['add', 'PROVINCE.md']);
  execFileSync('git', ['-C', repo, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'fixture']);
  if (g(['rev-parse', '--show-toplevel']) !== fs.realpathSync(repo)) usage('fixture toplevel mismatch');
  const H = g(['rev-parse', 'HEAD']);
  const OTHER = 'c'.repeat(40);

  const ledgerText = [
    'type\tlane\tpath\tprovinceSha256\tlines\tbgHits\tquote\tdisposition\thead',
    'lane\tzed-shokunin\tPROVINCE.md\taa\t3\t0\t-\t-\t' + H,
    'line\tzed-shokunin\tPROVINCE.md:3\t-\t-\t-\tzed owns Z proof surfaces\tcontested-open\t-',
    'line\tzed-shokunin\tPROVINCE.md:7\t-\t-\t-\tzed refuses Y\tcontested-open\t-',
    'line\tzed-shokunin\tPROVINCE.md:9\t-\t-\t-\tzed absent proof\tcontested-open\t-',
    'line\tzed-shokunin\tPROVINCE.md:11\t-\t-\t-\tzed notes X\tno-tabi-ground\t-',
  ].join('\n') + '\n';
  const snapText = 'lane\thead\nzed-shokunin\t' + H + '\n';
  const write = (rel, text) => { const p = path.join(scratch, rel); fs.writeFileSync(p, text); return p; };
  const ledgerP = write('ledger.tsv', ledgerText);
  const snapP = write('snapshot.tsv', snapText);
  const ledgerSha = sha256(Buffer.from(ledgerText));
  const ledgerBText = ledgerText.replace('zed absent proof', 'zed never committed anywhere');
  const ledgerBP = write('ledger-b.tsv', ledgerBText);
  const ledgerBSha = sha256(Buffer.from(ledgerBText));
  const snapSha = sha256(Buffer.from(snapText));

  const R = (path_, quote, status = 'pending-non-author', adj = '—', verdict = '—', reason = '—', date = '—', head = H) =>
    [ 'zed-shokunin', path_, head, quote, status, adj, verdict, reason, date ].join('\t');
  const HDR = WORKSHEET_HEADER;
  const ws = (name, rows) => write('ws-' + name + '.tsv', [HDR, ...rows].join('\n') + '\n');
  const C3 = R('PROVINCE.md:3', 'zed owns Z proof surfaces');
  const C7 = R('PROVINCE.md:7', 'zed refuses Y');
  const C9 = R('PROVINCE.md:9', 'zed absent proof');

  const cases = [
    { name: 'green', ws: ws('green', [C3, C7, C9]), exit: 0, tokens: [], extra: ['--expect-pending', '3', '--max-adjudicated', '0'] },
    { name: 'missing-worksheet', ws: path.join(scratch, 'nope.tsv'), exit: 1, tokens: ['worksheet-missing'] },
    { name: 'missing-row', ws: ws('missing', [C3, C7]), exit: 1, tokens: ['missing-key'] },
    { name: 'duplicate-key', ws: ws('dup', [C3, C3, C7, C9]), exit: 1, tokens: ['duplicate-key'] },
    { name: 'unknown-key', ws: ws('unk', [C3, C7, C9, R('OTHER.md:1', 'x')]), exit: 1, tokens: ['unknown-key'] },
    { name: 'quote-mismatch', ws: ws('qm', [R('PROVINCE.md:3', 'zed owns W proof surfaces'), C7, C9]), exit: 1, tokens: ['quote-mismatch'] },
    { name: 'head-mismatch', ws: ws('hm', [R('PROVINCE.md:3', 'zed owns Z proof surfaces', 'pending-non-author', '—', '—', '—', '—', OTHER), C7, C9]), exit: 1, tokens: ['head-mismatch'] },
    { name: 'status-vocabulary', ws: ws('sv', [R('PROVINCE.md:3', 'zed owns Z proof surfaces', 'pending'), C7, C9]), exit: 1, tokens: ['status-vocabulary'] },
    { name: 'pending-fields-dirty', ws: ws('pd', [R('PROVINCE.md:3', 'zed owns Z proof surfaces', 'pending-non-author', 'reviewer'), C7, C9]), exit: 1, tokens: ['pending-fields-dirty'] },
    { name: 'adjudicator-missing', ws: ws('am', [R('PROVINCE.md:3', 'zed owns Z proof surfaces', 'adjudicated-agree', '—', 'agree', 'holds', '2026-11-05'), C7, C9]), exit: 1, tokens: ['adjudicator-missing'] },
    { name: 'adjudicator-author', ws: ws('aa', [R('PROVINCE.md:3', 'zed owns Z proof surfaces', 'adjudicated-agree', 'tabi', 'agree', 'holds', '2026-11-05'), C7, C9]), exit: 1, tokens: ['adjudicator-author'] },
    { name: 'reason-missing', ws: ws('rm', [R('PROVINCE.md:3', 'zed owns Z proof surfaces', 'adjudicated-split', 'operator', 'split', '—', '2026-11-05'), C7, C9]), exit: 1, tokens: ['reason-missing'] },
    { name: 'adjudicated-over-ceiling', ws: ws('ao', [R('PROVINCE.md:3', 'zed owns Z proof surfaces', 'adjudicated-agree', 'operator', 'agree', 'holds', '2026-11-05'), C7, C9]), exit: 1, tokens: ['adjudicated-over-ceiling'], extra: ['--max-adjudicated', '0'] },
    { name: 'quote-unresolved', ws: ws('qu', [C3, C7, R('PROVINCE.md:9', 'zed never committed anywhere')]), exit: 1, tokens: ['quote-unresolved'], ledgerB: true },
    { name: 'ledger-pin', ws: ws('lp', [C3, C7, C9]), exit: 1, tokens: ['ledger-pin'], badLedgerPin: true },
  ];

  // quote-unresolved needs the repo file to lack the ledger quote: rewrite the
  // fixture file content for that single case, then restore it.
  const results = [];
  let failed = 0;
  for (const c of cases) {
    const args = ['--ledger', c.ledgerB ? ledgerBP : ledgerP, '--snapshot', snapP, '--worksheet', c.ws,
      '--expect-ledger-sha256', c.badLedgerPin ? 'f'.repeat(64) : (c.ledgerB ? ledgerBSha : ledgerSha),
      '--expect-snapshot-sha256', snapSha, '--fleet', fleet, '--repo', repo, ...(c.extra || [])];
    let observed = 0; let parsed = null;
    try {
      const out = execFileSync(process.execPath, [process.argv[1], ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      parsed = JSON.parse(out);
    } catch (e) {
      observed = typeof e.status === 'number' ? e.status : 1;
      try { parsed = JSON.parse(e.stdout); } catch { /* none */ }
    }
    const tokOk = c.tokens.every((t) => parsed && parsed.byCheck && parsed.byCheck[t]);
    if (observed !== c.exit || !tokOk) failed++;
    results.push({ name: c.name, expected: c.exit, observed, tokens: parsed ? parsed.byCheck : null });
  }
  const clean = failed === 0;
  console.log(JSON.stringify({ verdict: clean ? 'clean' : 'failed', cases: cases.length, failed, results }));
  process.exit(clean ? 0 : 1);
}

const args = parseArgs(process.argv.slice(2));
if (args && args.selftest) selftest(args.scratch);
else main();
