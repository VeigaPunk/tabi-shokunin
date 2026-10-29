#!/usr/bin/env node
// Scratch-only: compact evidence summary of every variant run performed under
// the scratch root. Reads only scratch files; writes one summary JSON.
import fs from 'node:fs';
import crypto from 'node:crypto';

const S = '/fast/scratch/hyaku/tabi-r43/SimplifierC1';
const runs = ['base', 'v1-deadcode', 'v2-minenv', 'v4-minenv2', 'v5-nohome', 'v6-nopath'];
const sha = (p) => { try { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); } catch { return null; } };
const norm = (o) => JSON.stringify(o).replace(/"ppid":\d+/g, '"ppid":<PID>');
const out = { schema: 'tabi-r43-simplifierc1-run-summary', runs: [] };
for (const r of runs) {
  const dir = `${S}/${r}`;
  if (!fs.existsSync(`${dir}/stdout.json`)) { out.runs.push({ run: r, status: 'not-run' }); continue; }
  let d = null; try { d = JSON.parse(fs.readFileSync(`${dir}/stdout.json`, 'utf8')); } catch { }
  const rec = { run: r };
  if (d) {
    const c = d.counter || {};
    const f = c.findings || [];
    rec.driverExit = d.driverExit;
    rec.counterExit = d.counterExit;
    rec.counterPredicate = c.predicate;
    rec.measureSignatureVerified = c.measureSignatureVerified;
    rec.witnessAttestationVerified = c.witnessAttestationVerified;
    rec.challengeVerified = c.challengeVerified;
    rec.challengeError = c.challengeError ?? null;
    rec.findingsTotal = f.length;
    rec.findingsNonEgress = f.filter((x) => !/-egress$/.test(x));
    rec.findingsEgress = f.filter((x) => /-egress$/.test(x)).length;
    rec.egressRemotes = [...new Set((c.egressDetail || []).flatMap((e) => e.remotes || []))].slice(0, 6);
    rec.gate = d.gate;
    rec.gateNormalized = norm(d.gate);
    rec.digests = d.digests;
    rec.elapsedMs = d.elapsedMs;
  }
  rec.receiptSha256 = sha(`${dir}/receipt.json`);
  rec.witnessSha256 = sha(`${dir}/receipt.witness.json`);
  rec.measureSha256 = sha(`${dir}/measure.json`);
  out.runs.push(rec);
}
const base = out.runs.find((x) => x.run === 'base');
for (const r of out.runs) {
  if (!r.gateNormalized || !base || !base.gateNormalized) continue;
  r.gateEqualsBaseline = r.gateNormalized === base.gateNormalized;
  r.digestsEqualBaseline = JSON.stringify(r.digests) === JSON.stringify(base.digests);
  r.nonEgressFindingsEmpty = (r.findingsNonEgress || []).length === 0;
}
fs.writeFileSync(`${S}/run-summary.json`, JSON.stringify(out, null, 1) + '\n');
for (const r of out.runs) {
  console.log(r.run, 'status=' + (r.status || 'ran'),
    'driverExit=' + r.driverExit, 'counterExit=' + r.counterExit,
    'predicate=' + r.counterPredicate, 'findings=' + r.findingsTotal,
    'nonEgress=' + (r.findingsNonEgress || []).length,
    'gateEqBase=' + r.gateEqualsBaseline, 'digestsEqBase=' + r.digestsEqualBaseline);
}
