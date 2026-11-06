#!/usr/bin/env node
// Generate single-point mutants of the frozen C1 counter (tabi r69).
// Each mutant is the pristine bytes with exactly one asserted-unique replacement.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-sibling-matrix-r69.mjs';
const PIN = 'b62f9c7daebfbd0a1494e9a60a9ee06665574f1f98969ba1c08da0d698c58b20';
const OUT = '/fast/scratch/hyaku/tabi-r69/R69Mut1';
const pristine = fs.readFileSync(SRC);
const sha = crypto.createHash('sha256').update(pristine).digest('hex');
if (sha !== PIN) { console.error('PIN MISMATCH ' + sha); process.exit(2); }
const text = pristine.toString('utf8');

// [id, expected verdict, description, before, after]
const MUT = [
  ['m01', 'killed', 'drop duplicate-lane detection',
    "if (seen.has(r.lane)) {", "if (false) {"],
  ['m02', 'killed', 'drop relation vocabulary check',
    "if (!['none', 'adjacent', 'contested'].includes(r.relation)) bad('relation-vocab', r.relation);",
    "if (false) bad('relation-vocab', r.relation);"],
  ['m03', 'killed', 'accept any head (drop snapshot-head equality)',
    "if (r.head !== snap.get(r.lane).head) bad('head-not-snapshot'",
    "if (false) bad('head-not-snapshot'"],
  ['m04', 'killed', 'quote checked against whole file, not the cited line',
    "lineText = file.split('\\n')[Number(m[2]) - 1];", "lineText = file;"],
  ['m05', 'killed', 'off-by-one line index (1-based read of 0-based array)',
    "lineText = file.split('\\n')[Number(m[2]) - 1];", "lineText = file.split('\\n')[Number(m[2])];"],
  ['m06', 'survived', 'quote lower length bound 3 -> 1 word',
    "if (qw < 3 || qw > 25)", "if (qw < 1 || qw > 25)"],
  ['m07', 'killed', 'quote upper length bound 25 -> 250 words',
    "if (qw < 3 || qw > 25)", "if (qw < 3 || qw > 250)"],
  ['m08', 'killed', 'drop inbound citation-line reciprocity (inbound-unanswered)',
    "if (!(m && m[1] === 'PROVINCE.md' && named.some((x) => x.n === Number(m[2]))))",
    "if (!(true))"],
  ['m09', 'killed', 'drop contested rule for inbound contested siblings',
    "if (named.some((x) => /contested/i.test(x.t)) && r.relation !== 'contested')",
    "if (false && named.some((x) => /contested/i.test(x.t)) && r.relation !== 'contested')"],
  ['m10', 'killed', 'drop inbound-relation-none rule',
    "if (r.relation === 'none') bad('inbound-relation-none'",
    "if (false) bad('inbound-relation-none'"],
  ['m11', 'killed', 'drop outbound Refuses routing check',
    "if (outbound.includes(r.lane) && r.relation === 'none')",
    "if (false && outbound.includes(r.lane) && r.relation === 'none')"],
  ['m12', 'killed', 'drop lane-missing loop over snapshot lanes',
    "if (!seen.has(lane) && secStart >= 0)", "if (false && secStart >= 0)"],
  ['m13', 'killed', 'drop mandatory **Refuses:** paragraph',
    "if (!refusesMatch) fail('refuses-paragraph-missing'", "if (false) fail('refuses-paragraph-missing'"],
  ['m14', 'survived', 'tabi-side minimum 4 -> 2 words',
    "if (words(r.side) < 4)", "if (words(r.side) < 2)"],
  ['m15', 'killed', 'tolerate cite file absent at head',
    "if (file === null) bad('cite-file-absent'", "if (false) bad('cite-file-absent'"],
  ['m16', 'killed', 'drop matrix header shape check',
    "!/^\\|\\s*lane\\s*\\|\\s*relation\\s*\\|\\s*head\\s*\\|\\s*cite\\s*\\|\\s*quote\\s*\\|\\s*tabi side\\s*\\|\\s*$/.test(table[0])",
    "false"],
  ['m17', 'survived', 'duplicate detection only when relations disagree',
    "if (seen.has(r.lane)) {", "if (seen.has(r.lane) && seen.get(r.lane) !== r.relation) {"],
  ['m18', 'survived', 'inbound tabi mention matched case-sensitively',
    "filter((x) => /\\btabi\\b/i.test(x.t))", "filter((x) => /\\btabi\\b/.test(x.t))"],
];

fs.mkdirSync(OUT, { recursive: true });
const manifest = [];
for (const [id, expected, desc, before, after] of MUT) {
  const parts = text.split(before);
  if (parts.length !== 2) { console.error(`${id}: target occurs ${parts.length - 1} times`); process.exit(3); }
  const body = parts[0] + after + parts[1];
  if (body === text) { console.error(`${id}: no-op mutation`); process.exit(3); }
  const file = path.join(OUT, id + '.mjs');
  fs.writeFileSync(file, body);
  manifest.push({ id, expected, desc, file, before, after,
    sha256: crypto.createHash('sha256').update(body).digest('hex') });
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ pin: PIN, source: SRC, sourceSha256: sha, mutants: manifest }, null, 1));
console.log(JSON.stringify({ pin: sha, mutants: manifest.length }));
