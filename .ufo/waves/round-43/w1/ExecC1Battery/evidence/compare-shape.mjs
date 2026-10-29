#!/usr/bin/env node
// Shape comparator for the round-43 C1 battery: compares the COMMITTED control
// bytes against a fresh local run on (cases/passes/shape), not on the file
// hash, so that incidental timestamp-like fields would not matter.
import fs from 'node:fs';
import crypto from 'node:crypto';

const CONTROL = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/controls/c1-battery-r43.json';
const runs = process.argv.slice(2);
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const controlRaw = fs.readFileSync(CONTROL, 'utf8');
const control = JSON.parse(controlRaw);

const shapeOf = (o) => ({
  schema: o.schema,
  allPass: o.allPass,
  cases: (o.cases || []).map((c) => ({ case: c.case, vector: c.vector, exit: c.exit, finding: c.finding, pass: c.pass })),
});

const cShape = shapeOf(control);
const results = [];
for (const r of runs) {
  const raw = fs.readFileSync(r, 'utf8');
  const run = JSON.parse(raw);
  const rShape = shapeOf(run);
  const diffs = [];
  if (rShape.schema !== cShape.schema) diffs.push({ field: 'schema', control: cShape.schema, run: rShape.schema });
  if (rShape.allPass !== cShape.allPass) diffs.push({ field: 'allPass', control: cShape.allPass, run: rShape.allPass });
  if (rShape.cases.length !== cShape.cases.length) diffs.push({ field: 'cases.length', control: cShape.cases.length, run: rShape.cases.length });
  for (let i = 0; i < Math.min(cShape.cases.length, rShape.cases.length); i++) {
    for (const k of ['case', 'vector', 'exit', 'finding', 'pass']) {
      if (cShape.cases[i][k] !== rShape.cases[i][k]) {
        diffs.push({ field: `cases[${i}].${k}`, control: cShape.cases[i][k], run: rShape.cases[i][k] });
      }
    }
  }
  const passes = rShape.cases.filter((c) => c.pass === true).length;
  results.push({
    run: r,
    runSha256: sha(raw),
    controlSha256: sha(controlRaw),
    byteIdenticalToControl: sha(raw) === sha(controlRaw),
    schema: rShape.schema,
    allPass: rShape.allPass,
    caseCount: rShape.cases.length,
    passCount: passes,
    everyCasePass: passes === rShape.cases.length,
    shapeDiffs: diffs,
    shapeEqual: diffs.length === 0,
    cases: rShape.cases,
  });
}

const out = {
  schema: 'tabi-r43-c1-battery-shape-compare',
  control: CONTROL,
  controlSha256: sha(controlRaw),
  controlCaseCount: cShape.cases.length,
  controlAllPass: cShape.allPass,
  runs: results,
  allRunsShapeEqual: results.every((r) => r.shapeEqual),
  allRuns7of7: results.every((r) => r.caseCount === 7 && r.passCount === 7 && r.everyCasePass && r.allPass === true),
};
process.stdout.write(JSON.stringify(out, null, 1) + '\n');
process.exit(out.allRunsShapeEqual && out.allRuns7of7 ? 0 : 1);
