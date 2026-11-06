#!/usr/bin/env node
// C1 control evaluator, tabi round 71 (QUALITY 131: expected exit AND finding ids, mechanically;
// QUALITY 133, this round: a degenerate control's receipt must carry its own degenerate label --
// a control that ran the honest producer under a degenerate name is not a control).
// Usage: node evaluate-c1-controls.mjs --dir <controls/c1 dir> [--json]
// Reads, for each kind K in dispatch-wheel|set-scale|skip-touch:
//   degenerate-K.receipt.json, degenerate-K.driver.exit, degenerate-K.counter.exit, degenerate-K.counter.json
// and donothing-no-receipt.exit / donothing-no-receipt.out.
// Exit 0 every control holds; 1 otherwise; 2 usage.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const dir = argv[argv.indexOf('--dir') + 1];
if (!dir || !fs.existsSync(dir)) { console.error('usage: --dir <controls/c1>'); process.exit(2); }
const rd = (f) => { try { return fs.readFileSync(path.join(dir, f), 'utf8').trim(); } catch { return null; } };
const js = (f) => { try { return JSON.parse(rd(f)); } catch { return null; } };
const EXPECT = {
  'dispatch-wheel': ['scored-run-not-degenerate', 'pinch-call-count', 'no-lookalike-producer', 'producer-verdict'],
  'set-scale': ['scored-run-not-degenerate', 'pinch-call-count', 'no-lookalike-producer', 'producer-verdict'],
  'skip-touch': ['scored-run-not-degenerate', 'pinch-call-count', 'leg-touch-error', 'leg-slow-error', 'producer-verdict'],
};
const rows = [];
for (const [k, ids] of Object.entries(EXPECT)) {
  const rc = js(`degenerate-${k}.receipt.json`); const c = js(`degenerate-${k}.counter.json`);
  const got = c ? c.findings.map((f) => f.id) : [];
  const why = [];
  if (!rc) why.push('receipt-missing');
  else if (rc.degenerate !== k) why.push('label-mismatch: receipt.degenerate=' + JSON.stringify(rc.degenerate));
  if (rd(`degenerate-${k}.driver.exit`) !== '1') why.push('driver exit ' + rd(`degenerate-${k}.driver.exit`) + ' want 1');
  if (rd(`degenerate-${k}.counter.exit`) !== '1') why.push('counter exit ' + rd(`degenerate-${k}.counter.exit`) + ' want 1');
  for (const id of ids) if (!got.includes(id)) why.push('missing finding ' + id);
  rows.push({ control: 'degenerate-' + k, holds: why.length === 0, why });
}
{
  const why = [];
  if (rd('donothing-no-receipt.exit') !== '2') why.push('exit ' + rd('donothing-no-receipt.exit') + ' want 2');
  const o = js('donothing-no-receipt.out');
  if (!o || !o.findings.some((f) => f.id === 'receipt-unreadable')) why.push('missing finding receipt-unreadable');
  rows.push({ control: 'donothing-no-receipt', holds: why.length === 0, why });
}
const ok = rows.every((r) => r.holds);
const o = { schema: 'tabi-r71-c1-controls', holds: rows.filter((r) => r.holds).length, of: rows.length, failing: rows.filter((r) => !r.holds).map((r) => r.control), rows };
console.log(argv.includes('--json') ? JSON.stringify(o, null, 1) : `c1 controls ${o.holds}/${o.of} hold` + (o.failing.length ? '; failing: ' + o.failing.join(',') : ''));
process.exit(ok ? 0 : 1);
