#!/usr/bin/env node
// Merge two control-battery summaries into one, preserving every per-control
// record verbatim. The battery runs in two invocations (the live controls run in
// their own process so a loaded host cannot starve a Chromium launch inside the
// same invocation as the mutation pools).
// Usage: node merge-summaries.mjs --in a.json,b.json --out summary.json
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const ins = (opt('in') || '').split(',').filter(Boolean);
const out = opt('out');
if (!ins.length || !out) { console.log(JSON.stringify({ error: 'usage', detail: '--in a.json,b.json --out summary.json' })); process.exit(2); }
const parts = ins.map((p) => JSON.parse(fs.readFileSync(p, 'utf8')));
const results = parts.flatMap((p) => p.results);
const merged = {
  schema: 'tabi-r64-controls-v1',
  mergedFrom: ins,
  revs: [...new Set(parts.map((p) => p.rev))],
  driverSha256: parts[0].driverSha256,
  counterSha256: parts[0].counterSha256,
  controls: results.length,
  passed: results.filter((r) => r.ok).length,
  failed: results.filter((r) => !r.ok).map((r) => ({ name: r.name, exit: r.exit, expect: r.expect })),
  results,
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(merged, null, 1));
console.log('TABI_R64_MERGE controls=' + merged.controls + ' passed=' + merged.passed + ' failed=' + JSON.stringify(merged.failed));
process.exitCode = merged.failed.length === 0 ? 0 : 1;
