// ScribeLessonSkel — why does the archived failed-run measure record not verify?
import fs from 'node:fs';
import crypto from 'node:crypto';
const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const D = `${ROOT}/.ufo/waves/round-43/w1/SentEgressAudit/failed-run-1`;
const out = []; const say = (s = '') => out.push(s);
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
}
const mrRaw = fs.readFileSync(`${D}/c1-measure-r43.json`, 'utf8');
const mr = JSON.parse(mrRaw);
const stdout = JSON.parse(fs.readFileSync(`${D}/measure.stdout`, 'utf8'));
say('# ScribeLessonSkel — failed-run measure record: signature mismatch diagnosis');
say(`archived file bytes: ${mrRaw.length}, sha256 ${sha256(mrRaw)}`);
say(`stdout.measureRecordSha256: ${stdout.measureRecordSha256}`);
say(`file sha256 == stdout.measureRecordSha256: ${sha256(mrRaw) === stdout.measureRecordSha256}`);
say();
const u = { ...mr }; delete u.signature;
say(`sha256(canonical(unsigned)) = ${sha256(canonical(u))}`);
say(`signature.over            = ${mr.signature.over}`);
say();
// field-by-field comparison against the stdout's own copies of the same fields
const cmp = (label, a, b) => {
  const sa = JSON.stringify(a); const sb = JSON.stringify(b);
  say(`${label}: ${sa === sb ? 'IDENTICAL' : 'DIFFERENT'}`);
  if (sa !== sb) { say(`  record: ${sa?.slice(0, 700)}`); say(`  stdout: ${sb?.slice(0, 700)}`); }
};
cmp('elapsedMs', mr.elapsedMs, stdout.elapsedMs);
cmp('driverExit', mr.driverExit, stdout.driverExit);
cmp('gate', mr.gate, stdout.gate);
cmp('digests', mr.digests, stdout.digests);
cmp('nonce', mr.nonce, stdout.nonce);
say();
say('## brute force: drop one top-level key from the unsigned form');
for (const k of Object.keys(u)) {
  const c = { ...u }; delete c[k];
  if (sha256(canonical(c)) === mr.signature.over) say(`  MATCH when dropping '${k}'`);
}
say('## brute force: replace one top-level key with the value from the stdout copy');
const repl = { elapsedMs: stdout.elapsedMs, driverExit: stdout.driverExit, gate: stdout.gate, digests: stdout.digests };
for (const k of Object.keys(repl)) {
  const c = { ...u, [k]: repl[k] };
  if (sha256(canonical(c)) === mr.signature.over) say(`  MATCH when '${k}' is replaced by the stdout copy`);
}
say('## brute force: replace each nested leaf with the stdout copy (one level deep)');
for (const k of Object.keys(u)) {
  if (u[k] && typeof u[k] === 'object' && !Array.isArray(u[k])) {
    for (const k2 of Object.keys(u[k])) {
      if (repl[k] && k2 in repl[k]) {
        const c = { ...u, [k]: { ...u[k], [k2]: repl[k][k2] } };
        if (sha256(canonical(c)) === mr.signature.over) say(`  MATCH when ${k}.${k2} is replaced by the stdout copy`);
      }
    }
  }
}
say('(no MATCH line above means none of these single-field hypotheses reproduces signature.over)');
fs.writeFileSync(`${ROOT}/.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-predata-run1-signature-mismatch.txt`, out.join('\n') + '\n');
console.log(out.join('\n'));
