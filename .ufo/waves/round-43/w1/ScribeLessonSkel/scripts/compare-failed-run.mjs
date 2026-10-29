// ScribeLessonSkel — compare the failed run-1 invocation's recorded digests against the frozen pins.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FREEZE = '7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc';
const D = `${ROOT}/.ufo/waves/round-43/w1/SentEgressAudit/failed-run-1`;
const out = [];
const say = (s = '') => out.push(s);
const gitShow = (rev, path) => execFileSync('git', ['-C', ROOT, 'show', `${rev}:${path}`], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');

const stdout = fs.readFileSync(`${D}/measure.stdout`, 'utf8');
say('# ScribeLessonSkel — failed run-1: recorded digests and counter output vs the frozen pins');
say();
let parsed = null;
try { parsed = JSON.parse(stdout); } catch (e) { say(`stdout is not a single JSON document: ${e.message}`); }
if (parsed) {
  say('## digests recorded by the FAILED run (driver/counter bytes at that moment)');
  const frozen = JSON.parse(gitShow(FREEZE, '.ufo/waves/round-43/claims.json')).frozenDigests;
  for (const [k, v] of Object.entries(parsed.digests || {})) {
    const want = frozen[k];
    say(`${k}`);
    say(`  failed run: ${v}`);
    say(`  frozen pin: ${want}`);
    say(`  identical: ${want === v}`);
  }
  say();
  say('## top-level keys of the failed run stdout');
  say(JSON.stringify(Object.keys(parsed)));
  say();
  say('## counter result as recorded by the failed run');
  const cr = parsed.counter || parsed.result || parsed.measured || null;
  if (cr) {
    say(`keys: ${JSON.stringify(Object.keys(cr))}`);
    say(`predicate: ${cr.predicate}`);
    say(`findings count: ${Array.isArray(cr.findings) ? cr.findings.length : 'n/a'}`);
    if (Array.isArray(cr.findings)) {
      say('findings (verbatim):');
      for (const f of cr.findings) say(`  ${f}`);
    }
    say(`egressDetail: ${JSON.stringify(cr.egressDetail ?? null).slice(0, 1200)}`);
  } else {
    say('(no counter-result field in the failed-run stdout)');
    say(stdout.slice(0, 3000));
  }
}
say();
say('## failed-run measure record vs the committed clean measure record');
const failedMr = fs.readFileSync(`${D}/c1-measure-r43.json`, 'utf8');
const committedMr = gitShow(FREEZE, '.ufo/waves/round-43/measure/c1-measure-r43.json');
const f = JSON.parse(failedMr); const c = JSON.parse(committedMr);
say(`failed  nonce: ${f.nonce}`);
say(`clean   nonce: ${c.nonce}`);
say(`failed  receiptSha256: ${f.bindings?.receiptSha256}`);
say(`clean   receiptSha256: ${c.bindings?.receiptSha256}`);
say(`failed  witnessSha256: ${f.bindings?.witnessSha256}`);
say(`clean   witnessSha256: ${c.bindings?.witnessSha256}`);
say(`failed  createdAt: ${f.createdAt}  elapsedMs: ${f.elapsedMs}`);
say(`clean   createdAt: ${c.createdAt}  elapsedMs: ${c.elapsedMs}`);
say(`failed record digests == frozen pins: ${JSON.stringify(f.digests) === JSON.stringify(JSON.parse(gitShow(FREEZE, '.ufo/waves/round-43/claims.json')).frozenDigests && { 'scripts/measure-c1-round43.mjs': c.digests['scripts/measure-c1-round43.mjs'], 'scripts/playwright-firefox-egress-round43.mjs': c.digests['scripts/playwright-firefox-egress-round43.mjs'], '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs': c.digests['.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs'] })}`);
say(`failed record digests: ${JSON.stringify(f.digests, null, 2)}`);
say(`committed clean record digests: ${JSON.stringify(c.digests, null, 2)}`);

fs.writeFileSync(`${ROOT}/.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-predata-run1-digests.txt`, out.join('\n') + '\n');
console.log(out.join('\n'));
