import fs from 'node:fs';
import { summarise, canonical, delta, selftestSig } from './lib-read.mjs';
const S = process.env.S;
const B = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/ExecNoHarmBaseline';
const R = '486048356f0712e4396588c9dab58cd419243120';
const cells = (...xs) => xs.map(x => String(x).replace(/\t/g, ' ')).join('\t');

const freezeRows = new Map(), freezeSelftest = new Map();
for (const line of fs.readFileSync(`${B}/noharm-at-freeze.tsv`, 'utf8').trim().split('\n')) {
  const [gate, cmd, exit, r] = line.split('\t');
  if (gate.startsWith('selftest/') || /^wave-/.test(gate)) freezeSelftest.set(gate.replace(/^(selftest|wave)\//, ''), { cmd, exit, reading: r });
  else freezeRows.set(gate, { cmd, exit, reading: r });
}
const freezeExits = new Map(), tipExits = new Map(), prodExits = new Map();
for (const line of fs.readFileSync(`${B}/raw/selftest/exit.tsv`, 'utf8').trim().split('\n')) {
  const [slug, cmd, exit] = line.split('\t'); if (!slug.endsWith('-wrong-flag')) freezeExits.set(slug, { cmd, exit });
}
for (const line of fs.readFileSync(`${S}/raw/selftest/exit.tsv`, 'utf8').trim().split('\n')) {
  const [slug, cmd, exit] = line.split('\t'); if (!slug.endsWith('-wrong-flag')) tipExits.set(slug, { cmd, exit });
}
for (const line of fs.readFileSync(`${S}/raw/prod/exits.tsv`, 'utf8').trim().split('\n')) {
  const [slug, cmd, exit] = line.split('\t'); prodExits.set(slug, { cmd, exit });
}

const rows = [];
function verdictOf(exitF, exitT) {
  if (exitF === '0' && exitT !== '0') return 'HARM(green->red)';
  if (exitF !== '0' && exitT === '0') return 'improved(red->green)';
  return 'holds';
}
function pushToken(gate, cmdT, exitF, exitT, readF, readT, kind) {
  const { both, tipOnly } = delta(readF, readT);
  let change = both.length ? `delta: ${both.join('; ')}` : 'same';
  if (tipOnly.length) change += ` | tip-only keys: ${tipOnly.join(',')}`;
  rows.push(cells(gate, cmdT, exitF, exitT, change, verdictOf(exitF, exitT), kind, canonical(summarise(readF)), canonical(summarise(readT))));
}
function pushSig(gate, cmdF, cmdT, exitF, exitT, textF, textT, kind) {
  const a = selftestSig(textF), b = selftestSig(textT);
  const diffs = [];
  for (const k of ['cases', 'ok']) {
    const av = a[k], bv = b[k];
    if (av !== bv && av !== null && bv !== null) diffs.push(`${k} ${av}->${bv}`);
  }
  const change = diffs.length ? `delta: ${diffs.join('; ')}` : (a.cases === null || b.cases === null ? 'same (count not comparable)' : 'same');
  rows.push(cells(gate, cmdT, exitF, exitT, change, verdictOf(exitF, exitT), kind,
    `cases=${a.cases ?? '?'} allGreen=${a.ok ?? '?'}`, `cases=${b.cases ?? '?'} allGreen=${b.ok ?? '?'}`));
}

const prod = [
  ['noHarm/check-gate-registry', 'registry', `${S}/raw/prod/registry.out`],
  ['noHarm/check-release-pins', 'release-pins', `${S}/raw/prod/release-pins.out`],
  ['noHarm/check-s106-evidence', 's106', `${S}/raw/prod/s106.out`],
  ['noHarm/check-frontier-admission', 'frontier', `${S}/raw/prod/frontier.out`],
  ['noHarm/check-sources', 'sources', `${S}/raw/prod/sources.out`],
];
for (const [gate, slug, file] of prod) {
  const fz = freezeRows.get(gate), te = prodExits.get(slug);
  pushToken(gate, te.cmd, fz.exit, te.exit, fz.reading, fs.readFileSync(file, 'utf8').trim().split('\n').pop(), 'claims.noHarmChecks');
}
function censusRead(file) {
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
  return `ok=${lines.some(l => /^tabi\tok\t/.test(l))} w04=${lines.filter(l => /^tabi\tW04\t/.test(l)).length} ecodes=${lines.filter(l => /^tabi\tE[0-9]/.test(l)).length}`;
}
{
  const fz = freezeRows.get('noHarm/sources-census'), te = prodExits.get('census');
  pushToken('noHarm/sources-census', te.cmd, fz.exit, te.exit, censusRead(`${B}/raw/census.txt`), censusRead(`${S}/raw/prod/census.out`), 'claims.noHarmChecks');
}

const slugs = ['check-adjacency','check-aria-metadata','check-bfcache-receipt','check-decision-table','check-freshness','check-frontier-admission','check-gate-mutants','check-gate-registry','check-measurement-binding','check-release-pins','check-round-contract','check-s106-evidence','check-selfassessment','check-source-reopen-receipt','check-sources','check-user-round-contract','round-evidence-audit','wave-r21-measure-c1','wave-r22-review-chronology','wave-r22-measure-c1','wave-r12-claim-record'];
for (const slug of slugs) {
  const fz = freezeSelftest.get(slug), fe = freezeExits.get(slug), te = tipExits.get(slug);
  pushSig(`selftest/${slug}`, fe.cmd, te.cmd, fe.exit, te.exit, fz.reading, fs.readFileSync(`${S}/raw/selftest/${slug}.out`, 'utf8'), 'every registry gate self-test');
}

function sweepExit(tag, slug) {
  for (const line of fs.readFileSync(`${S}/raw/sweep/exits.tsv`, 'utf8').trim().split('\n')) {
    const [g, cmd, exit] = line.split('\t');
    if (g === `${tag}/${slug}`) return { cmd, exit };
  }
  throw new Error('missing sweep exit ' + tag + '/' + slug);
}
function sweepRead(tag, slug) {
  const out = fs.readFileSync(`${S}/raw/sweep/${tag}-${slug}.out`, 'utf8').trim();
  return out === '' ? fs.readFileSync(`${S}/raw/sweep/${tag}-${slug}.err`, 'utf8').trim() : out;
}
const sweep = [
  ['sweep/check-adjacency --at --fleet', 'adjacency-fleet'],
  ['sweep/check-bfcache-receipt --rev', 'bfcache'],
  ['sweep/check-source-reopen-receipt --rev', 'source-reopen'],
  ['sweep/check-gate-mutants --rev', 'gate-mutants'],
  ['sweep/check-freshness --worktree', 'freshness'],
  ['sweep/check-aria-metadata --check', 'aria'],
  ['sweep/check-measurement-binding --check round-18', 'measurement-binding'],
  ['sweep/check-sources worktree', 'sources'],
  ['sweep/check-round-contract --witness', 'round-contract'],
  ['sweep/check-user-round-contract --witness', 'user-round-contract'],
];
for (const [gate, slug] of sweep) {
  const fz = sweepExit('freeze', slug), te = sweepExit('tip', slug);
  pushToken(gate, te.cmd, fz.exit, te.exit, sweepRead('freeze', slug), sweepRead('tip', slug), 'extension beyond claims.json');
}

const header = 'gate\tcommand_tip\texit_freeze\texit_tip\tchange\tverdict\tclass\treading_freeze_canonical\treading_tip_canonical';
fs.writeFileSync(`${S}/noharm-at-tip.tsv`, header + '\n' + rows.join('\n') + '\n');
for (const r of rows) console.log(r);
