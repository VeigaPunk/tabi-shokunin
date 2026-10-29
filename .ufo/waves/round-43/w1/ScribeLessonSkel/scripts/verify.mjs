// ScribeLessonSkel — read-only committed-bytes verification for the round-43 lesson skeleton.
// Reads only committed bytes of tabi-shokunin at the freeze commit; writes only into the seat dir.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FREEZE = '7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc';
const OUT = `${ROOT}/.ufo/waves/round-43/w1/ScribeLessonSkel`;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

const lines = [];
const say = (s = '') => lines.push(s);
const gitShow = (rev, path) => execFileSync('git', ['-C', ROOT, 'show', `${rev}:${path}`], { maxBuffer: 64 * 1024 * 1024 });

say(`# ScribeLessonSkel — committed-bytes verification`);
say(`repo: ${ROOT}`);
say(`freeze: ${FREEZE}`);
say(`node: ${process.version}`);
say();

// ---------- 1. registry rows S150 / S151 (raw) ----------
const sourcesMd = gitShow(FREEZE, 'corpus/SOURCES.md').toString('utf8');
const registryLines = sourcesMd.split('\n').filter((l) => /^\|\s*S15[01]\s\|/.test(l));
say('## 1. registry rows at the freeze (raw cells)');
for (const l of registryLines) say(l);
const rowCount = sourcesMd.split('\n').filter((l) => /^\|\s*S\d{3}\s\|/.test(l)).length;
say(`registry row count at freeze (rows matching | SNNN |): ${rowCount}`);
say();

// ---------- 2. staged source copies: sha256 + verbatim quote location ----------
const staged = [
  { id: 'S150', file: '.ufo/waves/round-43/sources/crypto.html', quote: 'createPrivateKey, createPublicKey, generateKeyPair, sign, verify,' },
  { id: 'S151', file: '.ufo/waves/round-43/sources/git-cat-file.html', quote: 'Instead of the content, show the object type identified by' },
];
say('## 2. staged source copies (committed at the freeze) — sha256 and verbatim quote location');
for (const s of staged) {
  const buf = gitShow(FREEZE, s.file);
  const text = buf.toString('utf8');
  const idx = text.indexOf(s.quote);
  const all = [];
  let p = text.indexOf(s.quote);
  while (p !== -1) { all.push(p); p = text.indexOf(s.quote, p + 1); }
  const row = registryLines.find((l) => l.startsWith(`| ${s.id} `)) || '';
  const shaInRow = (row.match(/sha256 ([0-9a-f]{64})/) || [])[1];
  say(`### ${s.id} — ${s.file}`);
  say(`bytes: ${buf.length}`);
  say(`sha256(committed bytes): ${sha256(buf)}`);
  say(`sha256 recorded in the registry row: ${shaInRow || '(none found)'}`);
  say(`sha256 match: ${shaInRow === sha256(buf)}`);
  say(`quote: ${JSON.stringify(s.quote)}`);
  say(`quote word count (whitespace-split): ${s.quote.split(/\s+/).filter(Boolean).length}`);
  say(`verbatim occurrences in the staged copy: ${all.length}; byte offsets: ${all.join(', ')}`);
  say(`context: ${JSON.stringify(text.slice(Math.max(0, idx - 90), idx + s.quote.length + 60))}`);
  say();
}

// ---------- 3. sentence identity: claims.json <-> instrument PREDICATE ----------
say('## 3. sentence identity (claims.json vs instrument PREDICATE const)');
const claims = JSON.parse(gitShow(FREEZE, '.ufo/waves/round-43/claims.json').toString('utf8'));
const readPredicate = (src) => {
  const m = src.match(/const PREDICATE\s*=\s*([\s\S]*?);\n/);
  if (!m) return null;
  // the const is a string literal; evaluate it as JS
  return (0, eval)(`(${m[1]})`);
};
const c1Counter = gitShow(FREEZE, '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs').toString('utf8');
const c2Checker = gitShow(FREEZE, '.ufo/waves/round-43/counters/check-routed-defects-round43.mjs').toString('utf8');
const c1Claim = claims.claims.find((c) => c.id === 'C1');
const c2Claim = claims.claims.find((c) => c.id === 'C2');
const p1 = readPredicate(c1Counter);
const p2 = readPredicate(c2Checker);
say(`C1 counterPredicate === counter PREDICATE (byte-identical): ${p1 === c1Claim.counterPredicate}`);
say(`  counterPredicate length: ${c1Claim.counterPredicate.length}; PREDICATE length: ${p1 ? p1.length : 'n/a'}`);
say(`C2 predicate === checker PREDICATE (byte-identical): ${p2 === c2Claim.predicate}`);
say(`  predicate length: ${c2Claim.predicate.length}; PREDICATE length: ${p2 ? p2.length : 'n/a'}`);
say(`C1 claims[0].predicate present and equal to counterPredicate: ${c1Claim.predicate === c1Claim.counterPredicate}`);
say();

// ---------- 4. frozen digests of the three instruments ----------
say('## 4. frozen digests re-derived from committed bytes');
for (const [path, want] of Object.entries(claims.frozenDigests)) {
  const got = sha256(gitShow(FREEZE, path));
  say(`${path}`);
  say(`  claims.json: ${want}`);
  say(`  re-derived : ${got}`);
  say(`  match: ${got === want}`);
}
say();

// ---------- 5. pre-data disclosure arithmetic: 46 egress findings ----------
say('## 5. pre-data disclosure (first live attempt refused by the round-43 counter)');
const log43 = gitShow(FREEZE, 'LOG.md').toString('utf8');
const score43 = gitShow(FREEZE, 'SCORECARD.md').toString('utf8');
const para = (text, needle, span = 420) => {
  const i = text.indexOf(needle);
  if (i === -1) return '(not found)';
  return text.slice(Math.max(0, i - span), i + span).replace(/\n+/g, ' ').trim();
};
const logPara = para(log43, 'failed its counter');
say(`LOG.md context (verbatim, wrapped lines joined): ${logPara}`);
const scorePara = para(score43, '46 `*-egress` findings');
say(`SCORECARD.md context (verbatim, wrapped lines joined): ${scorePara}`);
const logLine = { includes: () => true };
const sampleRange = (logPara.match(/samples (\d+)[–-](\d+)/) || []);
// counter finding-id shape for egress
const shape = [...c1Counter.matchAll(/findings\.push\(`([^`]*egress)`\)/g)].map((m) => m[1]);
say(`counter egress finding-id templates (committed bytes): ${JSON.stringify([...new Set(shape)])}`);
const surfaces = [...c1Counter.matchAll(/for \(const k of \[([^\]]*)\]\)/g)].map((m) => m[1]);
say(`counter surface tuples (committed bytes): ${JSON.stringify([...new Set(surfaces)])}`);
const lo = Number(sampleRange[1]); const hi = Number(sampleRange[2]);
const nSamples = Number.isFinite(lo) && Number.isFinite(hi) ? hi - lo + 1 : null;
say(`disclosed sample range: ${lo}–${hi} => ${nSamples} samples`);
say(`surfaces per sample: 2 (ss, proc) => ${nSamples * 2} findings`);
say(`arithmetic consistent with the disclosed total of 46: ${nSamples * 2 === 46}`);
say();

// ---------- 6. instrument hardening present in the frozen bytes ----------
say('## 6. hardening claimed pre-freeze (nonLoopbackRemotes recorded) present in frozen bytes');
const driver = gitShow(FREEZE, 'scripts/playwright-firefox-egress-round43.mjs').toString('utf8');
const drvHits = driver.split('\n').map((l, n) => [n + 1, l]).filter(([, l]) => l.includes('nonLoopbackRemotes'));
say(`driver occurrences of nonLoopbackRemotes: ${drvHits.length}`);
for (const [n, l] of drvHits) say(`  ${n}: ${l.trim()}`);
const ctrHits = c1Counter.split('\n').map((l, n) => [n + 1, l]).filter(([, l]) => l.includes('nonLoopbackRemotes') || l.includes('egressDetail'));
say(`counter occurrences of nonLoopbackRemotes/egressDetail: ${ctrHits.length}`);
for (const [n, l] of ctrHits) say(`  ${n}: ${l.trim()}`);
say();

// ---------- 6b. the frozen claims.json C1 object carries TWO sentence keys ----------
say('## 6b. claims.json C1 object: `counterPredicate` vs the sibling `predicate` key');
say(`keys on claims[0]: ${JSON.stringify(Object.keys(c1Claim))}`);
say(`claims[0].counterPredicate === counter PREDICATE: ${c1Claim.counterPredicate === p1}`);
say(`claims[0].predicate === counter PREDICATE: ${c1Claim.predicate === p1}`);
say(`claims[0].predicate === claims[0].counterPredicate: ${c1Claim.predicate === c1Claim.counterPredicate}`);
say(`lengths: counterPredicate=${c1Claim.counterPredicate.length} predicate=${c1Claim.predicate.length} PREDICATE=${p1.length}`);
const a = c1Claim.counterPredicate; const b = c1Claim.predicate;
let d = 0; while (d < Math.min(a.length, b.length) && a[d] === b[d]) d++;
say(`common prefix length: ${d}`);
say(`counterPredicate tail: ${JSON.stringify(a.slice(d))}`);
say(`predicate tail      : ${JSON.stringify(b.slice(d))}`);
say(`C2 has a sibling duplicate key: ${Object.keys(c2Claim).filter((k) => /predicate/i.test(k)).join(', ')}`);
say();

// ---------- 7. committed state of the failed run-1 archive ----------
say('## 7. is the failed run-1 archive committed?');
const tree = execFileSync('git', ['-C', ROOT, 'ls-tree', '-r', '--name-only', FREEZE], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
const r43Files = tree.split('\n').filter((l) => l.startsWith('.ufo/waves/round-43/') || l.startsWith('corpus/evidence/round43'));
say(`committed round-43 files at the freeze: ${r43Files.length}`);
for (const f of r43Files) say(`  ${f}`);
say(`any committed artifact naming the failed run-1 archive: ${r43Files.filter((f) => /failed-run-1|run-1/i.test(f)).length}`);
say();

fs.writeFileSync(`${OUT}/evidence-committed-bytes.txt`, lines.join('\n') + '\n');
console.log(lines.join('\n'));
