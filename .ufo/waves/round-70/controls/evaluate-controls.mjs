#!/usr/bin/env node
// Evaluates every executed control under .ufo/waves/round-70/controls/{c1,c2}: a control holds
// when its observed exit equals the expected exit AND every expected finding id is present in
// its JSON output (verifier `findings` strings, counter `findings[].id`), or, for the special
// expectations, in its stderr (MODULE_NOT_FOUND), its driver receipt verdict (REFUTED) or the
// battery verdict (all-refused). `none` requires an empty finding list.
// Usage: node evaluate-controls.mjs   -> writes summary.json beside it; exit 0 iff all hold.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const C = path.dirname(fileURLToPath(import.meta.url));
const rows = [];
for (const d of ['c1', 'c2']) {
  for (const f of fs.readdirSync(path.join(C, d)).filter((x) => x.endsWith('.exit.json')).sort()) {
    const e = JSON.parse(fs.readFileSync(path.join(C, d, f), 'utf8'));
    const base = path.join(C, d, e.control);
    const stdout = fs.readFileSync(base + '.out', 'utf8'); const stderr = fs.readFileSync(base + '.err', 'utf8');
    let j = null; try { j = JSON.parse(stdout); } catch {}
    const ids = j && Array.isArray(j.findings) ? j.findings.map((x) => (typeof x === 'string' ? x : x.id)) : null;
    const want = e.expectedFindings.split(',').filter(Boolean);
    let findingsOk;
    if (e.expectedFindings === 'MODULE_NOT_FOUND') findingsOk = stderr.includes('ERR_MODULE_NOT_FOUND') || stderr.includes('Cannot find module');
    else if (e.expectedFindings === 'CONFIRMED') findingsOk = !!j && j.synthTapHypothesis === 'CONFIRMED' && j.predicate === true;
    else if (e.expectedFindings === 'REFUTED') findingsOk = !!j && j.synthTapHypothesis === 'REFUTED' && j.predicate === false;
    else if (e.expectedFindings === 'all-refused') findingsOk = !!j && j.allOk === true && j.failed.length === 0 && j.coverageGap.length === 0;
    else if (e.expectedFindings === 'none') findingsOk = Array.isArray(ids) && ids.length === 0;
    else findingsOk = Array.isArray(ids) && want.every((w) => ids.includes(w));
    rows.push({ dir: d, control: e.control, exit: e.exit, expectedExit: e.expectedExit, expectedFindings: e.expectedFindings, observedFindings: ids, holds: e.exit === e.expectedExit && findingsOk });
  }
}
const summary = { schema: 'tabi-r70-controls-summary', controls: rows.length, holding: rows.filter((r) => r.holds).length, failing: rows.filter((r) => !r.holds).map((r) => r.dir + '/' + r.control), rows };
fs.writeFileSync(path.join(C, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
console.log(`controls ${summary.holding}/${summary.controls} hold; failing: ${summary.failing.join(',') || 'none'}`);
process.exit(summary.failing.length === 0 ? 0 : 1);
