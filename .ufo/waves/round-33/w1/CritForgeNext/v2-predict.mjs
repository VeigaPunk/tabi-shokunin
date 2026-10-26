#!/usr/bin/env node
// v2-predict.mjs — a literal, independent implementation of gate v2's receipt-leg rules
// *as written in this wave's ExecGateV2 item*, used only to predict which constructions
// survive v2. It is NOT v2: it does not execute the lane's gate and says nothing about
// the landed v2's code. Wave 2 runs the frozen battery and these builders against the
// real v2. Two calibrations keep it honest: the honest H0 commit and the round-32 F1
// shape (build-G1 --ids golden) must score pass and refuse respectively.
//
// Rules implemented (quoted from the item):
//  (1) "duplicate row ids are a row finding …, population counts every table row whose
//      Measured cell is non-empty, and a Measured cell other than exactly `yes` or `no`
//      is a row finding"
//  (2) "transcript paths distinct, transcript sha256 distinct, each run's newSession body
//      has a sessionId matching ChromeDriver's id shape (… 32 lowercase hex …) and a
//      capabilities.webSocketUrl `ws://127.0.0.1:<port>/session/<that sessionId>`,
//      sessionIds distinct across runs, and browsing-context ids not the golden constants
//      (honest contexts are 32 uppercase hex)"
//  (3) "driver: blob present with matching sha256, sha256 different from the gate's own
//      blob at --rev, and its source neither re-exports … nor imports any gate symbol
//      outside an explicit allow-list FIXTURE, FIXTURE_SHA256, FIXTURE_HEADER, VIEWPORT,
//      DATA_TEXT, serveFixture"
//  (4) "the cited new S-id must also appear in a corpus/lessons/round-*.md ## Gate table
//      row at --rev carrying an https URL and a 64-hex sha256, and the registry row's
//      source URL host must equal that Gate URL host"
//
// Usage: node v2-predict.mjs --repo <clone> --rev <40hex> [--baseline <40hex>]
//          [--entry <path>] [--receipt <path>] [--json]
import { BASE, ENTRY, GATE, RECEIPT, blob, git, out8, parseArgs, sha256 } from './forge-common.mjs';

const ALLOW = ['FIXTURE', 'FIXTURE_SHA256', 'FIXTURE_HEADER', 'VIEWPORT', 'DATA_TEXT', 'serveFixture'];
const GOLDEN_CONSTANTS = new Set(['C1']);
const HEADER = ['row', 'surface', 'bidi method', 'measured', 'evidence'];

const splitRow = (line) => {
  const t = line.trim();
  if (!t.startsWith('|') || !t.endsWith('|')) return null;
  return t.slice(1, -1).split('|').map((c) => c.trim());
};

function parseTable(text) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const cells = splitRow(lines[i]);
    if (!cells || cells.length !== HEADER.length) continue;
    if (!cells.every((c, k) => c.toLowerCase() === HEADER[k])) continue;
    const rows = [];
    let j = i + 1;
    if (j < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[j])) j += 1;
    for (; j < lines.length; j += 1) {
      const rc = splitRow(lines[j]);
      if (!rc) break;
      rows.push({ line: j + 1, cells: rc });
    }
    return rows;
  }
  return null;
}

function parseRegistry(text) {
  const rows = new Map();
  for (const line of text.split('\n')) {
    if (!/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/.test(line)) continue;
    const cells = line.trim().split('|');
    if (cells.length !== 13) continue;
    const c = cells.slice(1, 12).map((x) => x.trim());
    const [id, source, , , , , , status, opened, , usedBy] = c;
    if (!rows.has(id)) rows.set(id, { id, source, status, opened, usedBy });
  }
  return rows;
}

const firstUrl = (s) => {
  const m = String(s || '').match(/https:\/\/[^\s|)>,`]+/);
  return m ? m[0] : null;
};
const hostOf = (u) => {
  try { return new URL(u).host; } catch { return null; }
};

// ---- clause 1 --------------------------------------------------------------
function checkRows(entryText) {
  const findings = [];
  const rows = parseTable(entryText);
  if (rows === null) return { ok: false, findings: ['no entry table'], population: 0 };
  const population = rows.filter((r) => (r.cells[3] || '') !== '').length;
  const seen = new Map();
  for (const r of rows) {
    const id = r.cells[0];
    seen.set(id, (seen.get(id) || 0) + 1);
    const measured = r.cells[3] || '';
    // The honest H0 entry marks R16 `no — no BiDi command` and the frozen battery requires
    // H0 admitted, so v2 cannot treat a decorated `no` as a finding. Decorations of `yes`
    // (F7: `yes (live)`) and cells that are neither yes- nor no-headed are findings.
    const head = measured.split(/[\s(—–-]/)[0].toLowerCase();
    if (measured !== '' && head === 'yes' && measured !== 'yes') {
      findings.push(`row ${r.line}: Measured cell ${JSON.stringify(measured)} is not exactly yes`);
    } else if (measured !== '' && head !== 'yes' && head !== 'no') {
      findings.push(`row ${r.line}: Measured cell ${JSON.stringify(measured)} is neither yes- nor no-headed`);
    }
  }
  for (const [id, n] of seen) if (n > 1) findings.push(`duplicate row id ${id} ×${n}`);
  return { ok: findings.length === 0, findings, population };
}

// ---- clause 2 --------------------------------------------------------------
function sessionOf(transcriptBuf) {
  const first = JSON.parse(transcriptBuf.toString('utf8').split('\n')[0]);
  const v = first && first.body && first.body.value;
  return {
    sessionId: v && v.sessionId,
    webSocketUrl: v && v.capabilities && v.capabilities.webSocketUrl,
    browserVersion: v && v.capabilities && v.capabilities.browserVersion,
  };
}

function contextsOf(transcriptBuf) {
  const ctxs = [];
  for (const line of transcriptBuf.toString('utf8').split('\n')) {
    if (!line.trim()) continue;
    const o = JSON.parse(line);
    if (o.dir === 'send' && o.frame && o.frame.params && typeof o.frame.params.context === 'string') ctxs.push(o.frame.params.context);
    if (o.dir === 'recv' && o.frame && o.frame.result && Array.isArray(o.frame.result.contexts)) {
      for (const c of o.frame.result.contexts) if (c && typeof c.context === 'string') ctxs.push(c.context);
    }
  }
  return [...new Set(ctxs)];
}

function checkRuns(repo, rev, receiptPath) {
  const findings = [];
  const rb = blob(repo, rev, receiptPath);
  if (rb === null) return { ok: false, findings: [`receipt ${receiptPath} absent`] };
  let receipt;
  try { receipt = JSON.parse(rb.toString('utf8')); } catch { return { ok: false, findings: ['receipt is not JSON'] }; }
  const runs = receipt.runs;
  if (!Array.isArray(runs) || runs.length < 2) return { ok: false, findings: ['fewer than two runs'] };
  const paths = runs.map((r) => r.transcript);
  const shas = runs.map((r) => r.transcriptSha256);
  if (new Set(paths).size !== paths.length) findings.push('transcript paths are not distinct');
  if (new Set(shas).size !== shas.length) findings.push('transcript sha256 values are not distinct');
  const sessions = [];
  const contexts = [];
  for (const r of runs) {
    const tb = blob(repo, rev, r.transcript);
    if (tb === null) { findings.push(`transcript absent: ${r.transcript}`); continue; }
    if (sha256(tb) !== r.transcriptSha256) findings.push(`transcript sha256 differs: ${r.transcript}`);
    const s = sessionOf(tb);
    sessions.push({ name: r.name, ...s });
    contexts.push({ name: r.name, contexts: contextsOf(tb) });
  }
  for (const s of sessions) {
    if (!/^[0-9a-f]{32}$/.test(String(s.sessionId || ''))) findings.push(`${s.name}: sessionId ${JSON.stringify(s.sessionId)} is not 32 lowercase hex`);
    const m = String(s.webSocketUrl || '').match(/^ws:\/\/127\.0\.0\.1:(\d{1,5})\/session\/(.+)$/);
    if (!m) findings.push(`${s.name}: webSocketUrl ${JSON.stringify(s.webSocketUrl)} is not ws://127.0.0.1:<port>/session/<id>`);
    else if (m[2] !== s.sessionId) findings.push(`${s.name}: webSocketUrl id ${m[2]} != sessionId ${s.sessionId}`);
  }
  if (new Set(sessions.map((s) => s.sessionId)).size !== sessions.length) findings.push('sessionIds are not distinct across runs');
  for (const c of contexts) {
    for (const id of c.contexts) {
      if (GOLDEN_CONSTANTS.has(id)) findings.push(`${c.name}: browsing-context id ${id} is a golden constant`);
      else if (!/^[0-9A-F]{32}$/.test(id)) findings.push(`${c.name}: browsing-context id ${id} is not 32 uppercase hex`);
    }
    if (!c.contexts.length) findings.push(`${c.name}: no browsing-context id found`);
  }
  return {
    ok: findings.length === 0, findings,
    sessions: sessions.map((s) => ({ name: s.name, sessionId: s.sessionId, webSocketUrl: s.webSocketUrl })),
    contexts: contexts.map((c) => ({ name: c.name, contexts: c.contexts })),
    transcriptPaths: paths, transcriptShas: shas,
  };
}

// ---- clause 3 --------------------------------------------------------------
function checkDriver(repo, rev, receiptPath) {
  const findings = [];
  const rb = blob(repo, rev, receiptPath);
  if (rb === null) return { ok: false, findings: ['receipt absent'] };
  const receipt = JSON.parse(rb.toString('utf8'));
  const gateSrc = blob(repo, rev, GATE);
  const dSrc = blob(repo, rev, receipt.driver || '');
  if (gateSrc === null) return { ok: false, findings: [`gate absent at ${rev}`] };
  if (dSrc === null) return { ok: false, findings: [`driver blob absent: ${receipt.driver}`] };
  const dSha = sha256(dSrc);
  if (dSha !== receipt.driverSha256) findings.push('driver sha256 differs from the receipt');
  if (dSha === sha256(gateSrc)) findings.push("driver sha256 equals the gate's own blob");
  const src = dSrc.toString('utf8');
  if (/export\s*\*\s*from\s*['"]/.test(src)) findings.push('driver re-exports (`export * from`)');
  if (/export\s*\{[^}]*\}\s*from\s*['"]/.test(src)) findings.push('driver re-exports (`export {…} from`)');
  // One import statement at a time ([^;] cannot cross a statement boundary); only
  // statements whose specifier is the gate are inspected.
  const imports = [...src.matchAll(/\bimport\s+([^;]*?)\s+from\s+['"]([^'"]+)['"]\s*;?/g)]
    .filter((m) => /check-bidi-runtime\.mjs$/.test(m[2]));
  const symbols = [];
  for (const m of imports) {
    const clause = m[1].trim();
    if (clause === '*') { findings.push('driver imports the gate namespace (`import * as`)'); continue; }
    const brace = clause.match(/\{([\s\S]*)\}/);
    if (!brace) { findings.push(`driver imports a non-named binding from the gate: ${clause}`); continue; }
    for (const raw of brace[1].split(',')) {
      const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
      if (!name) continue;
      symbols.push(name);
      if (!ALLOW.includes(name)) findings.push(`driver imports gate symbol outside the allow-list: ${name}`);
    }
  }
  return { ok: findings.length === 0, findings, driver: receipt.driver, driverSha256: dSha, gateSha256: sha256(gateSrc), importedGateSymbols: symbols };
}

// ---- clause 4 --------------------------------------------------------------
function gateRowsAt(repo, rev) {
  const tree = out8(git(repo, ['ls-tree', '-r', '--name-only', rev, '--', 'corpus/lessons']));
  const rows = new Map();
  for (const path of tree.split('\n').filter((p) => /\/round-.*\.md$/.test(p))) {
    const buf = blob(repo, rev, path);
    if (buf === null) continue;
    const lines = buf.toString('utf8').split('\n');
    let inGate = false;
    for (const line of lines) {
      if (/^##\s+Gate\s*$/.test(line.trim())) { inGate = true; continue; }
      if (inGate && /^##\s/.test(line)) { inGate = false; continue; }
      if (!inGate) continue;
      const cells = splitRow(line);
      if (!cells || cells.length < 3) continue;
      const id = (cells[0] || '').trim();
      if (!/^S\d{3,}$/.test(id)) continue;
      const url = firstUrl(cells[1]) || firstUrl(line);
      const hex = (line.match(/\b[0-9a-f]{64}\b/) || [])[0];
      if (url && hex && !rows.has(id)) rows.set(id, { path, url, sha256: hex });
    }
  }
  return rows;
}

function checkSource(repo, rev, baseline, entryPath) {
  const findings = [];
  const entryBuf = blob(repo, rev, entryPath);
  if (entryBuf === null) return { ok: false, findings: [`entry absent: ${entryPath}`] };
  const entryText = entryBuf.toString('utf8');
  const regNowBuf = blob(repo, rev, 'corpus/SOURCES.md');
  const regThenBuf = blob(repo, baseline, 'corpus/SOURCES.md');
  if (regNowBuf === null || regThenBuf === null) return { ok: false, findings: ['corpus/SOURCES.md absent'] };
  const regNow = parseRegistry(regNowBuf.toString('utf8'));
  const regThen = parseRegistry(regThenBuf.toString('utf8'));
  const srcLine = entryText.split('\n').find((l) => /^source:/i.test(l)) || '';
  const cited = [...srcLine.matchAll(/\bS\d{3,}\b/g)].map((m) => m[0]);
  const isNew = (id) => {
    const r = regNow.get(id);
    return !!(r && r.status === 'mined' && r.usedBy.split(/[,;]/).map((x) => x.trim()).includes(entryPath) && !regThen.has(id));
  };
  const newIds = cited.filter(isNew);
  if (!newIds.length) findings.push('no cited S-id is a new mined row naming the entry');
  const gates = gateRowsAt(repo, rev);
  const checked = [];
  for (const id of newIds) {
    const g = gates.get(id);
    if (!g) { findings.push(`${id}: no corpus/lessons/round-*.md ## Gate row with an https URL and a 64-hex sha256`); continue; }
    const regHost = hostOf(firstUrl(regNow.get(id).source));
    const gateHost = hostOf(g.url);
    checked.push({ id, gatePath: g.path, gateUrl: g.url, gateSha256: g.sha256, registrySourceUrl: firstUrl(regNow.get(id).source), regHost, gateHost });
    if (!regHost || !gateHost) findings.push(`${id}: could not read a host from the registry source or the Gate URL`);
    else if (regHost !== gateHost) findings.push(`${id}: registry host ${regHost} != Gate URL host ${gateHost}`);
  }
  return { ok: findings.length === 0, findings, cited, newIds, checked };
}

// ---- main ------------------------------------------------------------------
const o = parseArgs(process.argv.slice(2), { repo: 'str', rev: 'str', baseline: 'str', entry: 'str', receipt: 'str', json: 'bool' });
if (!o.repo || !o.rev) throw new Error('--repo and --rev are required');
const baseline = o.baseline || BASE;
const entry = o.entry || ENTRY;
const receipt = o.receipt || RECEIPT;

const entryBuf = blob(o.repo, o.rev, entry);
if (entryBuf === null) throw new Error(`entry absent at ${o.rev}: ${entry}`);
const clauses = {
  rows: checkRows(entryBuf.toString('utf8')),
  runs: checkRuns(o.repo, o.rev, receipt),
  driver: checkDriver(o.repo, o.rev, receipt),
  source: checkSource(o.repo, o.rev, baseline, entry),
};
const findings = Object.entries(clauses).flatMap(([k, v]) => v.findings.map((f) => `${k}: ${f}`));
const out = {
  tool: 'v2-predict (literal reading of the ExecGateV2 rule text; not v2)',
  rev: o.rev, baseline, entry, receipt,
  wouldPass: findings.length === 0,
  clauses: Object.fromEntries(Object.entries(clauses).map(([k, v]) => [k, { ok: v.ok, findings: v.findings }])),
  detail: { rows: clauses.rows.population, runs: clauses.runs, driver: clauses.driver, source: clauses.source },
  findings,
};
if (o.json) console.log(JSON.stringify(out));
else {
  console.log(`V2_PREDICT rev=${o.rev.slice(0, 12)} wouldPass=${out.wouldPass}`);
  for (const [k, v] of Object.entries(clauses)) console.log(`  clause ${k}: ${v.ok ? 'pass' : `REFUSE (${v.findings.join('; ')})`}`);
}
