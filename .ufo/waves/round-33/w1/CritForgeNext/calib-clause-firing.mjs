#!/usr/bin/env node
// calib-clause-firing.mjs — red/green calibration for v2-predict.mjs.
//
// The four attack constructions are admitted by v2-predict; that is only meaningful if
// the predictor is not a rubber stamp. This script builds five *deliberately invalid*
// variants on top of the honest round-32 commit — one per clause the frozen battery's
// F-cases violate — and asserts that v2-predict refuses each one on the expected clause.
// It also re-scores them with the lane's gate at the variant commit.
//
//   C-dup         (F2) every `yes` row relabelled R2                    -> clause rows
//   C-decorated   (F7) first `yes` row's Measured cell `yes (live)`     -> clause rows
//   C-samepath    (F3) both runs cite run1's transcript                 -> clause runs
//   C-gatecopy    (F5) receipt's driver = a byte copy of the gate       -> clause driver
//   C-no-gate-row (F8) a junk mined S990 row cited alone, no Gate row   -> clause source
//
// Usage: node calib-clause-firing.mjs --repo <clone> --rev <40hex> [--json]
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { commit, honest, parseArgs, prepareVariant, put, sha256, ENTRY, GATE, RECEIPT } from './forge-common.mjs';

const o = parseArgs(process.argv.slice(2), { repo: 'str', rev: 'str', json: 'bool' });
if (!o.repo || !o.rev) throw new Error('--repo and --rev are required');
const HERE = fileURLToPath(new URL('.', import.meta.url));

const rowLine = (cells) => `| ${cells.map((c) => c.trim()).join(' | ')} |`;

function relabelYesRows(text, fn) {
  const ls = text.split('\n');
  const hi = ls.findIndex((l) => {
    const t = l.trim();
    if (!t.startsWith('|')) return false;
    const c = t.slice(1, -1).split('|').map((x) => x.trim().toLowerCase());
    return c.join('|') === 'row|surface|bidi method|measured|evidence';
  });
  if (hi < 0) throw new Error('entry table header not found');
  let first = true;
  for (let j = hi + 2; j < ls.length && ls[j].trim().startsWith('|'); j += 1) {
    const cells = ls[j].trim().slice(1, -1).split('|');
    if (cells.length !== 5 || cells[3].trim().toLowerCase() !== 'yes') continue;
    ls[j] = fn(cells, first);
    first = false;
  }
  return ls.join('\n');
}

const repo = prepareVariant(o.repo, o.rev);
const h = honest(repo, o.rev);
const entryText = readFileSync(join(repo, ENTRY), 'utf8');
const regText = readFileSync(join(repo, 'corpus/SOURCES.md'), 'utf8');
const gateBytes = readFileSync(join(repo, GATE));
const gateCopyPath = 'corpus/evidence/round-32/bidi/calib-gate-copy.mjs';

const plans = [
  { label: 'C-dup', expect: 'rows', files: [[ENTRY, relabelYesRows(entryText, (cells) => rowLine(['R2', ...cells.slice(1)]))]] },
  { label: 'C-decorated', expect: 'rows', files: [[ENTRY, relabelYesRows(entryText, (cells, first) => (first ? rowLine([cells[0], cells[1], cells[2], 'yes (live)', cells[4]]) : rowLine(cells)))]] },
  { label: 'C-samepath', expect: 'runs', files: [[RECEIPT, JSON.stringify({ ...h.receipt, runs: [h.receipt.runs[0], { ...h.receipt.runs[0], name: 'run2' }] }, null, 1) + '\n']] },
  {
    label: 'C-gatecopy',
    expect: 'driver',
    files: [
      [gateCopyPath, gateBytes],
      [RECEIPT, JSON.stringify({ ...h.receipt, driver: gateCopyPath, driverSha256: sha256(gateBytes) }, null, 1) + '\n'],
    ],
  },
  {
    label: 'C-no-gate-row',
    expect: 'source',
    files: [
      ['corpus/SOURCES.md', regText.replace(/\n*$/, '\n') + `| S990 | junk — https://e.test/ | spec | A | s | a | t | mined | 2026-10-26 | 90d | ${ENTRY} |\n`],
      [ENTRY, entryText.replace(/^source:.*$/m, 'source: S990 — junk')],
    ],
  },
];

const variants = [];
for (const p of plans) {
  for (const [rel, text] of p.files) put(repo, rel, text);
  variants.push({ ...p, commit: commit(repo, `calib ${p.label}`) });
  spawnSync('git', ['-C', repo, 'reset', '-q', '--hard', o.rev]);
  spawnSync('git', ['-C', repo, 'clean', '-q', '-fdx']);
}

const results = [];
for (const v of variants) {
  const gate = spawnSync(process.execPath, [join(HERE, 'run-gate.mjs'), '--repo', repo, '--rev', v.commit, '--json'], { encoding: 'utf8' });
  const pred = spawnSync(process.execPath, [join(HERE, 'v2-predict.mjs'), '--repo', repo, '--rev', v.commit, '--json'], { encoding: 'utf8' });
  let g = null; let p = null;
  try { g = JSON.parse(gate.stdout); } catch { /* could-not-evaluate */ }
  try { p = JSON.parse(pred.stdout); } catch { /* refused to evaluate */ }
  const clausesRefused = p ? Object.entries(p.clauses).filter(([, x]) => !x.ok).map(([k]) => k) : [];
  results.push({
    label: v.label, expect: v.expect, commit: v.commit,
    gateExit: g ? g.exit : null, gateAdmitted: g ? g.admitted : null,
    wouldPass: p ? p.wouldPass : null, clausesRefused,
    refusedOnExpected: clausesRefused.length === 1 && clausesRefused[0] === v.expect,
  });
}
spawnSync('git', ['-C', repo, 'reset', '-q', '--hard', o.rev]);
spawnSync('git', ['-C', repo, 'clean', '-q', '-fdx']);

const allRefusedOnExpected = results.every((r) => r.refusedOnExpected);
console.log(`CALIB allRefusedOnExpected=${allRefusedOnExpected}`);
for (const r of results) console.log(`  ${r.label}: gateExit=${r.gateExit} gateAdmitted=${r.gateAdmitted} v2predict.wouldPass=${r.wouldPass} refused=${r.clausesRefused.join(',') || '-'} expected=${r.expect}`);
if (o.json) console.log(JSON.stringify({ allRefusedOnExpected, results }));
process.exitCode = allRefusedOnExpected ? 0 : 1;
