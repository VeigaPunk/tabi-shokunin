// verdict-probe.mjs — read-only cross-check the frozen checker does NOT do:
// does each TSV row's verdict equal the `verdict:` line inside the evidence file it cites?
// usage: node verdict-probe.mjs <repo> <rev>
import { spawnSync } from 'node:child_process';

const [, , repo, rev] = process.argv;
const TSV = '.ufo/waves/round-42/quarantine/re-adjudication.tsv';
const sh = (p) => {
  const r = spawnSync('git', ['-C', repo, 'show', `${rev}:${p}`], { encoding: 'utf8', maxBuffer: 64 << 20 });
  return r.status === 0 ? r.stdout : null;
};

const tsv = sh(TSV);
if (tsv === null) { console.log(JSON.stringify({ error: `${TSV} absent at ${rev}` })); process.exit(2); }
const rows = tsv.split('\n').filter((s) => s.length).map((l) => l.split('\t'));
const out = [];
for (const [id, verdict, evidence] of rows.map((r) => [r[0], r[1], r[2]])) {
  const body = sh(evidence);
  if (body === null) { out.push({ id, verdict, evidence, claimed: null, ok: false, why: 'evidence absent' }); continue; }
  const m = body.match(/^[>\s*]*verdict:\s*(\S+)/im);
  const claimed = m ? m[1].replace(/[^a-z]/g, '') : null;
  out.push({ id, verdict, evidence, claimed, ok: claimed === verdict, why: claimed === null ? 'no verdict line in evidence' : '' });
}
const bad = out.filter((r) => !r.ok);
console.log(JSON.stringify({
  schema: 'tabi-r42-tsv-evidence-consistency',
  rev, rows: out.length, agree: out.length - bad.length, disagree: bad.length,
  sample: bad.slice(0, 5),
}, null, 1));
process.exit(bad.length ? 1 : 0);
