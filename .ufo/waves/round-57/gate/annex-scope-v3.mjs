#!/usr/bin/env node
// annex-scope-v3.mjs — MEASUREMENT ANNEX. NOT part of the gate contract, NOT adopted.
//
// v2's frozen widening resolves every unprefixed wave-dir token against round-<--round>.
// On a cumulative document (SCORECARD.md, LOG.md) that pulls every older round's relative
// citations into the current round's check. This annex measures the obvious next-generation
// scope so the L1 can decide with numbers instead of adjectives:
//
//   resolution round for a relative token =
//     1. the MAX round named by a full-prefix `.ufo/waves/round-<M>/` token on the SAME line
//        (a SCORECARD/LOG row names its own round there), else
//     2. the citing document's round when its path encodes one
//        (`corpus/lessons/round-<M>.md`, `.ufo/waves/round-<M>/...`), else
//     3. UNANCHORED: the token is counted and NOT checked (a cumulative document's row
//        that carries no round evidence cannot be attributed to a round).
//
// Traversal is still refused outright. The output is counts plus the finding list, in the
// same shape v2 uses, so the two numbers are directly comparable.
//
// usage: node gate/annex-scope-v3.mjs --repo <abs lane> --round <N> \
//          --doc <rev>:<path> [--doc ...] [--json]
// Read-only git. Writes nothing.
import { spawnSync } from 'node:child_process';

const SCHEMA = 'tabi-cited-receipts-scope-v3-annex';
const WAVE_DIRS = [
  'counters', 'measure', 'controls', 'adj', 'gate-fixtures', 'gate', 'sources', 'scout',
  'reviewer', 'critic', 'connector', 'mutant', 'sentinel', 'labrat', 'scribe',
  'quarantine', 'assimilation',
].sort((a, b) => b.length - a.length);
const FULL_RE = /\.ufo\/waves\/round-(\d+)\/[A-Za-z0-9._/-]*/g;
const REL_RE = new RegExp(`(?<![A-Za-z0-9._/-])(?:${WAVE_DIRS.join('|')})/[A-Za-z0-9._/-]+`, 'g');
const PUNCT_RE = /[`'"()[\].,;|]+$/;

function die(msg) {
  process.stderr.write(`annex-scope-v3: ${msg}\n`);
  process.exit(2);
}

function parse(argv) {
  const o = { repo: process.cwd(), round: null, docs: [], json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') o.json = true;
    else if (a === '--repo' || a === '--round' || a === '--doc') {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) die(`missing value for ${a}`);
      if (a === '--repo') o.repo = v;
      else if (a === '--round') o.round = v;
      else o.docs.push(v);
    } else die(`unknown argument ${a}`);
  }
  if (o.round === null) die('--round is required');
  if (o.docs.length === 0) die('at least one --doc is required');
  return o;
}

function git(repo, args) {
  return spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
}

function docRound(path) {
  let m = /^corpus\/lessons\/round-(\d+)\.md$/.exec(path);
  if (m !== null) return Number(m[1]);
  m = /^\.ufo\/waves\/round-(\d+)\//.exec(path);
  if (m !== null) return Number(m[1]);
  return null;
}

const o = parse(process.argv.slice(2));
const repo = o.repo;
const gateRound = Number(o.round);
const findings = [];
let relativeChecked = 0;
let unanchored = 0;
const docs = [];

for (const spec of o.docs) {
  const sep = spec.indexOf(':');
  if (sep <= 0) die(`--doc must be <rev>:<path>, got ${spec}`);
  const rev = spec.slice(0, sep);
  const path = spec.slice(sep + 1);
  const shown = git(repo, ['show', `${rev}:${path}`]);
  if (shown.status !== 0) die(`cannot read ${rev}:${path}`);
  const dRound = docRound(path);
  const lines = shown.stdout.split('\n');
  let rel = 0;
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    const lineRounds = [];
    const spans = [];
    FULL_RE.lastIndex = 0;
    let m;
    while ((m = FULL_RE.exec(line)) !== null) {
      lineRounds.push(Number(m[1]));
      spans.push([m.index, m.index + m[0].length]);
    }
    let masked = line;
    if (spans.length > 0) {
      let cursor = 0;
      let next = '';
      for (const [s, e] of spans) {
        next += masked.slice(cursor, s) + ' '.repeat(e - s);
        cursor = e;
      }
      masked = next + masked.slice(cursor);
    }
    const anchor = lineRounds.length > 0 ? Math.max(...lineRounds) : dRound;
    REL_RE.lastIndex = 0;
    while ((m = REL_RE.exec(masked)) !== null) {
      const token = m[0].replace(PUNCT_RE, '');
      if (token.slice(token.indexOf('/') + 1).length === 0) continue;
      rel++;
      if (token.includes('..')) {
        findings.push({ id: 'relative-citation-traversal', path: token, round: null, citingDoc: spec, line: n + 1 });
        continue;
      }
      if (anchor === null) {
        unanchored++;
        continue;
      }
      const resolved = `.ufo/waves/round-${anchor}/${token}`;
      if (git(repo, ['cat-file', '-e', `${rev}:${resolved}`]).status !== 0) {
        findings.push({ id: 'relative-citation-missing', path: token, resolved, round: anchor, citingDoc: spec, line: n + 1 });
      }
    }
  }
  relativeChecked += rel;
  docs.push({ spec, rev, path, docRound: dRound, relativeTokens: rel });
}

const missing = [...new Set(findings.filter((f) => f.id === 'relative-citation-missing').map((f) => f.resolved))].sort();
const out = {
  schema: SCHEMA,
  adopted: false,
  repo,
  gateRound,
  docs,
  relativeChecked,
  unanchored,
  findings,
  missingDistinct: missing.length,
  predicate: findings.length === 0,
};
if (o.json) process.stdout.write(`${JSON.stringify(out)}\n`);
else {
  const l = [];
  for (const d of docs) l.push(`doc: ${d.path} docRound=${d.docRound} relative=${d.relativeTokens}`);
  l.push(`relative checked: ${relativeChecked}; unanchored (counted, not checked): ${unanchored}`);
  for (const f of findings) l.push(`${f.id} ${f.path}${f.resolved ? ` -> ${f.resolved}` : ''} round=${f.round} ${f.citingDoc}:${f.line}`);
  l.push(`findings=${findings.length} missing(distinct)=${missing.length}`);
  process.stdout.write(`${l.join('\n')}\n`);
}
