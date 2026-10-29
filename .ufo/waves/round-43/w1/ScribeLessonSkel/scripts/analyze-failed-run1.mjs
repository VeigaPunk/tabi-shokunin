// ScribeLessonSkel — independent re-derivation of the pre-data egress event
// from the failed-run-1 archive recovered into the wave dir by seat SentEgressAudit.
// READ-ONLY on every path below.
import fs from 'node:fs';
import crypto from 'node:crypto';

const W1 = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1';
const D = `${W1}/SentEgressAudit/failed-run-1`;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const out = [];
const say = (s = '') => out.push(s);

say('# ScribeLessonSkel — pre-data egress event, re-derived from the recovered run-1 bytes');
say(`archive: ${D}`);
say();

for (const f of ['receipt.json', 'receipt.witness.json', 'c1-measure-r43.json', 'measure.stdout']) {
  const b = fs.readFileSync(`${D}/${f}`);
  say(`- ${f}: ${b.length} bytes, sha256 ${sha256(b)}`);
}
say();

const receipt = JSON.parse(fs.readFileSync(`${D}/receipt.json`, 'utf8'));
say(`receipt schema: ${receipt.schema}`);
say(`receipt refused: ${receipt.refused}`);
say(`receipt runNonce: ${receipt.runNonce}`);
say(`runs: ${Array.isArray(receipt.runs) ? receipt.runs.length : 'n/a'}`);
say();

let totalEgressFindings = 0;
for (const [i, r] of (receipt.runs || []).entries()) {
  const N = `run${i + 1}`;
  const samples = r.samples || [];
  const flagged = [];
  for (const [j, x] of samples.entries()) {
    for (const k of ['ss', 'proc']) {
      const o = x?.[k];
      if (o && o.nonLoopback !== 0) flagged.push({ sample: j + 1, surface: k, nonLoopback: o.nonLoopback, remotes: o.nonLoopbackRemotes ?? null });
    }
  }
  say(`## ${N}: samples=${samples.length} span=${samples.length ? Math.round(samples.at(-1).t - samples[0].t) : 'n/a'} ms`);
  say(`  samples with nonLoopback != 0 (per surface): ${flagged.length} -> counter finding ids = ${flagged.length}`);
  if (flagged.length) {
    const idxs = flagged.map((f) => f.sample);
    say(`  flagged sample indices: ${Math.min(...idxs)}..${Math.max(...idxs)} (distinct ${new Set(idxs).size})`);
    say(`  distinct surfaces flagged: ${JSON.stringify([...new Set(flagged.map((f) => f.surface))])}`);
    const remotes = [...new Set(flagged.map((f) => JSON.stringify(f.remotes)))];
    say(`  distinct nonLoopbackRemotes values (driver did NOT record remotes pre-hardening?): ${remotes.length}`);
    for (const r2 of remotes.slice(0, 5)) say(`    ${r2}`);
    say(`  nonLoopback counts seen: ${JSON.stringify([...new Set(flagged.map((f) => f.nonLoopback))])}`);
  }
  for (const k of ['ss', 'proc']) {
    const o = r.finalSweep?.[k];
    say(`  finalSweep.${k}: nonLoopback=${o?.nonLoopback} remotes=${JSON.stringify(o?.nonLoopbackRemotes ?? null)}`);
  }
  say(`  run egressNonLoopback: ${r.egressNonLoopback}`);
  totalEgressFindings += flagged.length;
}
say();
say(`TOTAL counter-style egress findings across both runs = ${totalEgressFindings}`);

const stdout = fs.readFileSync(`${D}/measure.stdout`, 'utf8');
say();
say('## measure.stdout (the run-1 invocation output)');
say(stdout.length > 4000 ? stdout.slice(0, 4000) + '\n...[truncated]' : stdout);

fs.writeFileSync(`${W1}/ScribeLessonSkel/evidence-predata-egress.txt`, out.join('\n') + '\n');
console.log(out.join('\n'));
