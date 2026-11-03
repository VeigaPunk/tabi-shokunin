#!/usr/bin/env node
// Bounded behavioral fixture probe for the v19 meter's declared checks.
// Usage: node fixture-probe.mjs <path-to-meter-copy>
// Imports the meter's pure core (verify) and feeds minimal hand-built inputs.
// Each fixture asserts the EXACT finding-id set the pristine v19 emits.
import crypto from 'node:crypto';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const target = process.argv[2];
if (!target) { console.error('usage: node fixture-probe.mjs <meter.mjs>'); process.exit(2); }
const mod = await import(pathToFileURL(path.resolve(target)).href);
const { verify, predicateFrom } = mod;
const sha = (s) => crypto.createHash('sha256').update(Buffer.from(s, 'utf8')).digest('hex');
const HEAD = 'a'.repeat(40);
const ids = (findings) => findings.map((f) => f.id).sort();
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const norm = (a) => [...a].sort();

const fixtures = [];

// F2 (map-ref integer assertion): alpha-only suffix must never parse.
{
  const prov = '# p\nno ground\n';
  const ref = `m@${'4'.repeat(40)}:PROVINCE.md:x`;
  const inputs = {
    mapRows: [['x', 'm', ref, '# p', '-', '-', 'ruled', '-', '-']],
    auditRows: [],
    deltaRows: [
      ['lane', 'm', 'PROVINCE.md', sha(prov), 2, 0, '-', '-', HEAD],
    ],
    roster: ['m'],
    sibRef: (l, p) => (l === 'm' && p === 'PROVINCE.md' ? prov : undefined),
    headOf: () => HEAD,
  };
  fixtures.push({ name: 'F2-map-ref-alpha-suffix', inputs, expect: ['map-ref-unparseable'] });
}

// F3 (bg-hit-unadjudicated): map-covered lane with a BG hit and NO delta screen.
{
  const prov = '# bg province\nWe drive CDP here.\n';
  const ref = `bg-lane@${'1'.repeat(40)}:PROVINCE.md:1`;
  const inputs = {
    mapRows: [['browser-ground-x', 'bg-lane', ref, '# bg province', '-', '-', 'split-declared', '-', '-']],
    auditRows: [[ref, 'unchanged', '-']],
    deltaRows: [],
    roster: ['bg-lane'],
    sibRef: (l, p) => (l === 'bg-lane' && p === 'PROVINCE.md' ? prov : undefined),
    headOf: () => HEAD,
  };
  fixtures.push({ name: 'F3-bg-hit-unadjudicated', inputs, expect: ['bg-screen-missing', 'bg-hit-unadjudicated'] });
}

// F4 (orphan-line-row): a line row whose lane has no lane row at all.
{
  const prov = '# lane a\nno test ground here\n';
  const ref = `lane-a@${'2'.repeat(40)}:PROVINCE.md:1`;
  const inputs = {
    mapRows: [['x', 'lane-a', ref, '# lane a', '-', '-', 'ruled', '-', '-']],
    auditRows: [[ref, 'unchanged', '-']],
    deltaRows: [
      ['lane', 'lane-a', 'PROVINCE.md', sha(prov), 2, 0, '-', '-', HEAD],
      ['line', 'ghost-lane', 'PROVINCE.md:2', '-', '-', '-', 'ghost line', 'no-tabi-ground', '-'],
    ],
    roster: ['lane-a'],
    sibRef: (l, p) => (l === 'lane-a' && p === 'PROVINCE.md' ? prov : undefined),
    headOf: () => HEAD,
  };
  fixtures.push({ name: 'F4-orphan-line-row', inputs, expect: ['orphan-line-row'] });
}

// F5 (line-row-unscreened-file): a line row on a file never screened for its lane.
{
  const prov = '# lane a\nWe run CDP here.\n';
  const ref = `lane-a@${'3'.repeat(40)}:PROVINCE.md:1`;
  const inputs = {
    mapRows: [['x', 'lane-a', ref, '# lane a', '-', '-', 'ruled', '-', '-']],
    auditRows: [[ref, 'unchanged', '-']],
    deltaRows: [
      ['lane', 'lane-a', 'PROVINCE.md', sha(prov), 2, 1, '-', '-', HEAD],
      ['line', 'lane-a', 'PROVINCE.md:2', '-', '-', '-', 'We run CDP here.', 'no-tabi-ground', '-'],
      ['line', 'lane-a', 'OTHER-UNSCREENED.md:2', '-', '-', '-', 'We run CDP here.', 'no-tabi-ground', '-'],
    ],
    roster: ['lane-a'],
    sibRef: (l, p) => (l === 'lane-a' && p === 'PROVINCE.md' ? prov : undefined),
    headOf: () => HEAD,
  };
  fixtures.push({ name: 'F5-line-row-unscreened-file', inputs, expect: ['line-row-unscreened-file'] });
}

// F6 (screen vocabulary): a hit whose word is only in the FULL frozen vocabulary.
{
  const prov = '# vocab province\nWe use playwright here.\n';
  const ref = `v@${'5'.repeat(40)}:PROVINCE.md:1`;
  const inputs = {
    mapRows: [['x', 'v', ref, '# vocab province', '-', '-', 'ruled', '-', '-']],
    auditRows: [[ref, 'unchanged', '-']],
    deltaRows: [],
    roster: ['v'],
    sibRef: (l, p) => (l === 'v' && p === 'PROVINCE.md' ? prov : undefined),
    headOf: () => HEAD,
  };
  fixtures.push({ name: 'F6-screen-vocabulary', inputs, expect: ['bg-screen-missing', 'bg-hit-unadjudicated'] });
}

const results = [];
let pass = 0;
for (const f of fixtures) {
  const { findings } = verify(f.inputs);
  const got = ids(findings);
  const ok = eq(got, norm(f.expect));
  if (ok) pass++;
  results.push({ name: f.name, ok, expect: f.expect, got, predicate: predicateFrom(findings), findings: findings.map((x) => `${x.id}: ${x.detail}`) });
}
const out = { schema: 'r59-mutmeter-fixture-probe', target: path.resolve(target), targetSha256: crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex'), allPass: pass === fixtures.length, cases: fixtures.length, pass, results };
console.log(JSON.stringify(out, null, 1));
process.exit(out.allPass ? 0 : 1);
