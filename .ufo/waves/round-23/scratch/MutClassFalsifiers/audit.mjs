#!/usr/bin/env node
// Reference detector for the six round-evidence defect classes (mutation probe only).
// Reads a materialised evidence root: <root>/lane/** (round-N committed lane bytes)
// and optionally <root>/report/tabi.md (the L0 report; lives in the fleet repo).
// --lane <repo> enables read-only git LOG-binding checks for c6.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const ROOT = opt('--root');
const LANE = opt('--lane', '/home/vgpnk/Projects/shokunin/tabi-shokunin');
const ROUND = opt('--round', '22');
const WAVE_MAX = 64;   // scripts/hyaku/ufo-wave-policy.json sighting.dispatch.swarm.waveMaxLanes
const ROUND_MAX = 128; // round-22 prompt addendum s6, run-6 ruling
if (!ROOT) { console.error('usage: audit.mjs --root <dir> [--lane <repo>]'); process.exit(2); }

const lane = (p) => join(ROOT, 'lane', p);
const reportPath = join(ROOT, 'report', 'tabi.md');
const read = (p) => { try { return readFileSync(p, 'utf8'); } catch { return null; } };
const findings = [];
const hit = (cls, cited, derived, evidence) => findings.push({ class: cls, cited, derived, evidence });

// ---------- c1 refusal arithmetic ----------
{
  const roundBlock = (txt, idx) => {
    if (idx < 0) return null;
    let e = txt.indexOf('\n## ', idx + 1);
    if (e < 0) e = txt.length;
    return { text: txt.slice(idx, e), startLine: txt.slice(0, idx).split('\n').length };
  };
  const scan = [];
  const lessonTxt = read(lane(`corpus/lessons/round-${ROUND}.md`));
  if (lessonTxt) scan.push({ label: `corpus/lessons/round-${ROUND}.md`, text: lessonTxt, startLine: 1 });
  const scTxt = read(lane('SCORECARD.md'));
  if (scTxt) { const b = roundBlock(scTxt, scTxt.indexOf(`\n## Round${ROUND}`)); if (b) scan.push({ label: 'SCORECARD.md', ...b }); }
  const lgTxt = read(lane('LOG.md'));
  if (lgTxt) { const b = roundBlock(lgTxt, lgTxt.lastIndexOf(`\n## Round${ROUND}`)); if (b) scan.push({ label: 'LOG.md', ...b }); }
  if (existsSync(reportPath)) scan.push({ label: 'report/tabi.md', text: read(reportPath), startLine: 1 });

  const waveDir = lane(`.ufo/waves/round-${ROUND}`);
  const receipts = existsSync(waveDir)
    ? readdirSync(waveDir).filter((f) => /^w2b?-cap-refusal-.*\.json$/.test(f)).length : 0;
  const sites = [];
  for (const s of scan) {
    s.text.split('\n').forEach((l, i) => {
      for (const m of l.matchAll(/(\d+)\s+whole-payload/g)) sites.push({ label: s.label, line: s.startLine + i, n: +m[1] });
    });
  }
  const cited = [...new Set(sites.map((s) => s.n))];
  if (sites.length === 0) {
    if (receipts > 0) hit('c1-refusal-arithmetic', 0, receipts, `${receipts} refusal receipts exist but the round landing record never states the count`);
  } else for (const n of cited) if (n !== receipts) {
    const where = sites.filter((s) => s.n === n).map((s) => `${s.label}:${s.line}`).join(',');
    hit('c1-refusal-arithmetic', n, receipts, `${where} cite ${n}; 13 w2 + 11 w2b receipts = ${receipts}`);
  }
}

// ---------- c2 wave / round caps ----------
{
  const waveDir = lane(`.ufo/waves/round-${ROUND}`);
  if (existsSync(waveDir)) {
    const names = readdirSync(waveDir);
    for (const f of names.filter((n) => /^w\d+b?-spec\.json$/.test(n)).sort()) {
      const spec = JSON.parse(read(join(waveDir, f)));
      if (spec.maxLanes > WAVE_MAX) hit('c2-wave-caps', spec.maxLanes, WAVE_MAX, `${f} maxLanes=${spec.maxLanes} > policy waveMaxLanes=${WAVE_MAX}`);
    }
    let spawned = 0; const parts = [];
    for (const f of names.filter((n) => /^w\d+b?-spawn-result\.json$/.test(n)).sort()) {
      const txt = read(join(waveDir, f));
      const m = txt.match(/Spawned (\d+) background agents/) || txt.match(/seats=(\d+)/);
      const n = m ? +m[1] : 0;
      spawned += n; parts.push(`${f.replace('-spawn-result.json', '')}=${n}`);
    }
    if (spawned > ROUND_MAX) hit('c2-wave-caps', spawned, ROUND_MAX, `spawned total ${spawned} (${parts.join('+')}) > round cap ${ROUND_MAX}`);
  }
}

// ---------- c3 Gate spot-check row ----------
{
  const lesson = read(lane(`corpus/lessons/round-${ROUND}.md`));
  if (lesson) {
    const s = lesson.indexOf('\n## Gate\n');
    const e = s < 0 ? -1 : lesson.indexOf('\n## ', s + 1);
    const gate = s < 0 ? null : lesson.slice(s, e < 0 ? lesson.length : e);
    if (gate == null) hit('c3-gate-spotcheck', 0, 1, `round-${ROUND}.md has no "## Gate" section at all`);
    else if (!/spot-?check/i.test(gate) && !/owed to closure/i.test(gate)) {
      hit('c3-gate-spotcheck', 0, 1, `round-${ROUND}.md ## Gate (${gate.split('\n').length} lines) has no spot-check row and no "owed to closure" line; a sibling report file is NOT sufficient`);
    }
  }
}

// ---------- c4 stale-lane per attempt ----------
{
  const logTxt = read(lane('LOG.md')) || '';
  let logBlock = '';
  const hs = logTxt.lastIndexOf(`\n## Round${ROUND}`);
  if (hs >= 0) { const he = logTxt.indexOf('\n## ', hs + 1); logBlock = logTxt.slice(hs, he < 0 ? logTxt.length : he); }
  const repTxt = existsSync(reportPath) ? read(reportPath) : '';
  const words = { two: 2, three: 3, four: 4, five: 5 };
  let attempts = 0;
  for (const m of (repTxt + logBlock).matchAll(/dispatched (\w+) times/gi)) {
    attempts = Math.max(attempts, words[m[1].toLowerCase()] ?? (+m[1] || 0));
  }
  if (attempts >= 2) {
    const scope = repTxt ? repTxt : logBlock; // the report's stale-lane line is the graded site
    const graded = new Set();
    for (const blk of scope.matchAll(/Stale-lane([\s\S]{0,700})/g))
      for (const m of blk[1].matchAll(/attempt\s*([0-9]+)/gi)) graded.add(+m[1]);
    const miss = []; for (let n = 1; n <= attempts; n++) if (!graded.has(n)) miss.push(n);
    if (miss.length) hit('c4-stale-attempts', `${graded.size}/${attempts}`, `${attempts}/${attempts}`, `attempts ${miss.join(',')} of ${attempts} have no per-attempt Stale-lane grade (single "Stale-lane: none" line)`);
  }
}

// ---------- c5 registry identities ----------
{
  const waveDir = lane(`.ufo/waves/round-${ROUND}`);
  if (existsSync(waveDir)) {
    for (const w of readdirSync(waveDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
      const reg = read(join(waveDir, w, 'swarm-registry.json'));
      const spawn = read(join(waveDir, `${w}-spawn-result.json`));
      if (!reg) continue;
      const spawned = spawn && /Spawned (\d+) background agents/.test(spawn);
      if (!spawned) continue; // an unspawned wave may legitimately carry no ids
      const members = Object.entries(JSON.parse(reg).members || {});
      const sp = members.filter(([, v]) => v.kind === 'spawn');
      const nulls = sp.filter(([, v]) => v.agentId == null);
      if (nulls.length) hit('c5-registry-identities', `${sp.length - nulls.length}/${sp.length}`, `${sp.length}/${sp.length}`,
        `${w}/swarm-registry.json: ${nulls.length} of ${sp.length} spawned members carry agentId:null (${nulls.slice(0, 3).map(([k]) => k).join(',')}...)`);
    }
  }
}

// ---------- c6 landed-change / LOG.md binding ----------
if (existsSync(reportPath)) {
  const rep = read(reportPath).split('\n');
  const start = rep.findIndex((l) => /^## Landed changes\s*$/.test(l));
  if (start >= 0) {
    const rows = [];
    for (let i = start + 1; i < rep.length && !/^## /.test(rep[i]); i++) if (/^\|/.test(rep[i])) rows.push({ i: i + 1, cells: rep[i].split('|').map((c) => c.trim()) });
    const touchesLog = (h) => {
      try { return execFileSync('git', ['-C', LANE, 'show', '--name-only', '--format=', h], { encoding: 'utf8' })
        .split('\n').some((p) => p === 'LOG.md'); } catch { return false; }
    };
    for (const r of rows.slice(2)) { // skip header + separator
      const logCell = r.cells[2] || ''; const commitCell = r.cells[3] || '';
      if (!/\bitem\s+[0-9]/i.test(logCell)) continue; // only rows that claim a numbered LOG entry
      const hashes = [...commitCell.matchAll(/[0-9a-f]{7,40}/g)].map((m) => m[0]);
      if (!hashes.length) continue;
      if (!hashes.some(touchesLog)) hit('c6-landed-log-binding', hashes.join(','), 'a LOG.md-touching commit', `report:${r.i} claims "${logCell}" but ${hashes.map((h) => `${h}->LOG.md=${touchesLog(h)}`).join(' ')}`);
    }
  }
}

const classes = [...new Set(findings.map((f) => f.class))];
console.log(JSON.stringify({ schema: 'round-evidence-audit-probe-v1', round: +ROUND, classes: 6, detected: classes.length, clean: findings.length === 0, findings }, null, 2));
process.exit(findings.length ? 1 : 0);
