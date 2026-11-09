#!/usr/bin/env node
// Gate: tabi round 93 (mined mistake — LOG entries claim record sections that were never committed).
// For each requested round N, reads LOG.md at <rev>, takes the round-N entry (from its
// `## Round N —` heading to the next `## ` heading), and extracts every claimed section of the form
//   <FILE> `## <heading>`      with FILE one of README, README.md, corpus/README.md, SKILL, SKILL.md,
//                              SCORECARD, SCORECARD.md, PROVINCE, PROVINCE.md
// (backticked heading right after the file token). Each claim is checked against the named file at
// the same <rev>: some line must equal `## <heading>` or start with `## <heading>` followed by a
// space. A claim with no such line is a finding `section-absent`.
// The rule only sees claims written in that exact shape; a prose mention ("README round-91 coverage")
// is not extracted and is reported in `unparsed` lines that mention a record file without the shape.
// Usage:
//   node check-log-section-claims-round93.mjs --lane <ABS lane> --rev <rev> --rounds <N[,N...]> [--json]
//   node check-log-section-claims-round93.mjs --selftest --scratch <ABS dir>
// Exit 0: every extracted claim present; 1: findings (or selftest mismatch); 2: usage/setup
// (unresolvable rev, LOG.md absent at rev, or a requested round with no LOG entry).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const GATE = 'check-log-section-claims-round93';
const FILES = { 'README': 'corpus/README.md', 'README.md': 'corpus/README.md', 'corpus/README.md': 'corpus/README.md', 'SKILL': 'SKILL.md', 'SKILL.md': 'SKILL.md', 'SCORECARD': 'SCORECARD.md', 'SCORECARD.md': 'SCORECARD.md', 'PROVINCE': 'PROVINCE.md', 'PROVINCE.md': 'PROVINCE.md' };
const CLAIM = /(corpus\/README\.md|README\.md|README|SKILL\.md|SKILL|SCORECARD\.md|SCORECARD|PROVINCE\.md|PROVINCE) `(## [^`]+)`/g;
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const flag = (n) => argv.includes('--' + n);
const setup = (d) => { console.log(JSON.stringify({ gate: GATE, verdict: 'setup', detail: d })); process.exit(2); };
const git = (lane, args) => spawnSync('git', ['-C', lane, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });

export function evaluate(lane, rev, rounds) {
  const rr = git(lane, ['rev-parse', '--verify', rev + '^{commit}']);
  if (rr.status !== 0) return { setup: 'unresolvable rev ' + rev };
  const sha = rr.stdout.trim();
  const show = (p) => { const r = git(lane, ['show', sha + ':' + p]); return r.status === 0 ? r.stdout : null; };
  const log = show('LOG.md');
  if (log === null) return { setup: 'LOG.md absent at ' + sha };
  const lines = log.split('\n');
  const cache = new Map();
  const fileLines = (p) => { if (!cache.has(p)) { const t = show(p); cache.set(p, t === null ? null : t.split('\n')); } return cache.get(p); };
  const out = { rev: sha, rounds: [], findings: [], claims: 0 };
  for (const n of rounds) {
    const start = lines.findIndex((l) => new RegExp('^## Round ' + n + '( |$)').test(l));
    if (start < 0) return { setup: 'no `## Round ' + n + '` entry in LOG.md at ' + sha };
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) if (/^## /.test(lines[i])) { end = i; break; }
    const text = lines.slice(start, end).join('\n');
    const claims = [];
    for (const m of text.matchAll(CLAIM)) claims.push({ token: m[1], file: FILES[m[1]], heading: m[2] });
    const one = new RegExp(CLAIM.source);
    const unparsed = lines.slice(start, end).filter((l) => /\b(README|SKILL|SCORECARD|PROVINCE)\b/.test(l) && !one.test(l)).map((l) => l.trim().slice(0, 160));
    for (const c of claims) {
      const fl = fileLines(c.file);
      const present = !!fl && fl.some((l) => l === c.heading || l.startsWith(c.heading + ' '));
      c.present = present;
      if (!present) out.findings.push({ id: 'section-absent', round: n, file: c.file, heading: c.heading, logLine: start + 1 });
    }
    out.claims += claims.length;
    out.rounds.push({ round: n, logLine: start + 1, claims, unparsed });
  }
  return out;
}

function selftest(scratch) {
  if (!scratch || !path.isAbsolute(scratch)) setup('--selftest needs an absolute --scratch');
  fs.mkdirSync(scratch, { recursive: true });
  const D = fs.mkdtempSync(path.join(scratch, 'logclaims-'));
  const g = (args) => { const r = git(D, args); if (r.status !== 0) throw new Error('git ' + args.join(' ') + ': ' + r.stderr); return r.stdout.trim(); };
  g(['init', '-q', '-b', 'master']);
  if (fs.realpathSync(g(['rev-parse', '--show-toplevel'])) !== fs.realpathSync(D)) throw new Error('fixture toplevel mismatch');
  g(['config', 'user.name', 'fixture']); g(['config', 'user.email', 'fixture@example.invalid']);
  fs.mkdirSync(path.join(D, 'corpus'));
  fs.writeFileSync(path.join(D, 'LOG.md'), '# log\n\n## Round 1 — x\n\nREADME `## Round 1 coverage`; SKILL.md `## Round 1 gate registry`.\n\n## Round 2 — y\n\nREADME `## Round 2 coverage`; SCORECARD `## Round 2`.\n');
  fs.writeFileSync(path.join(D, 'corpus/README.md'), '# r\n\n## Round 1 coverage\n\nx\n');
  fs.writeFileSync(path.join(D, 'SKILL.md'), '# s\n\n## Round 1 gate registry\n');
  fs.writeFileSync(path.join(D, 'SCORECARD.md'), '# c\n\n## Round 2 (detail)\n');
  g(['add', '-A']); g(['commit', '-q', '-m', 'fixture']);
  const a = evaluate(D, 'master', [1]);
  const b = evaluate(D, 'master', [2]);
  const c = evaluate(D, 'master', [3]);
  const cases = [
    { name: 'present-claims-clean', ok: !a.setup && a.claims === 2 && a.findings.length === 0 },
    { name: 'absent-readme-section', ok: !b.setup && b.claims === 2 && b.findings.length === 1 && b.findings[0].id === 'section-absent' && b.findings[0].file === 'corpus/README.md' },
    { name: 'missing-round-setup', ok: !!c.setup },
  ];
  fs.rmSync(D, { recursive: true, force: true });
  const pass = cases.every((x) => x.ok);
  console.log(JSON.stringify({ gate: GATE, selftest: pass ? 'pass' : 'fail', cases }));
  process.exit(pass ? 0 : 1);
}

if (import.meta.url === 'file://' + process.argv[1]) {
  if (flag('selftest')) selftest(opt('scratch'));
  const lane = opt('lane'); const rev = opt('rev'); const rs = opt('rounds');
  if (!lane || !path.isAbsolute(lane)) setup('--lane must be an absolute path');
  if (!rev) setup('--rev required');
  if (!/^[0-9]+(,[0-9]+)*$/.test(rs || '')) setup('--rounds must be N[,N...]');
  const res = evaluate(lane, rev, rs.split(',').map(Number));
  if (res.setup) setup(res.setup);
  const out = { gate: GATE, verdict: res.findings.length ? 'findings' : 'clean', ...res };
  console.log(flag('json') ? JSON.stringify(out, null, 2) : JSON.stringify({ gate: GATE, verdict: out.verdict, rev: out.rev, claims: out.claims, findings: out.findings }));
  process.exit(res.findings.length ? 1 : 0);
}
