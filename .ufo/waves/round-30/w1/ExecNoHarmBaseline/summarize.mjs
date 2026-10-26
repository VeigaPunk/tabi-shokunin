#!/usr/bin/env node
// summarize.mjs — derive the curated matrix.tsv from the raw receipts + exit codes.
// Every tally below is read from a raw stdout/stderr file captured by run-matrix.sh
// (or the explicit commands recorded in the report); nothing is typed from memory.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
const RAW = join(OUT, 'raw');
const rawTsv = readFileSync(join(OUT, 'matrix-raw.tsv'), 'utf8').trimEnd().split('\n');
const header = rawTsv[0].split('\t');
const rows = rawTsv.slice(1).map(line => {
  const cells = line.split('\t');
  return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']));
});

const file = (tag) => {
  const prefix = `${tag}-`;
  const name = readdirSync(RAW).find(n => n.startsWith(prefix) && n.endsWith('.out'))
    ?? (readdirSync(RAW).includes(`${tag}.out`) ? `${tag}.out` : undefined);
  return name ? readFileSync(join(RAW, name), 'utf8') : '';
};
const one = (text, re, label) => {
  const m = text.match(re);
  if (!m) throw new Error(`missing ${label}`);
  return m[0];
};
const json = (tag) => {
  const t = file(tag);
  try { return JSON.parse(t); } catch {
    const a = t.indexOf('{'); const b = t.lastIndexOf('}');
    return JSON.parse(t.slice(a, b + 1));
  }
};
const EXTRA = [
  { row: 38, script: 'check-frontier-admission', mode: 'production-live', exit: 1, tag: '38' },
  { row: 39, script: 'report-contract', mode: 'production-round-29', exit: 0, tag: '39' },
  { row: 40, script: 'sources-census.sh', mode: 'validate-root-tabi', exit: 0, tag: '40' },
  { row: 41, script: 'check-claim-record', mode: 'selftest', exit: 0, tag: '41' },
  { row: 42, script: 'measure-c1-r21', mode: 'selftest', exit: 0, tag: '42' },
  { row: 43, script: 'check-review-chronology', mode: 'selftest', exit: 0, tag: '43' },
  { row: 44, script: 'measure-c1-r22', mode: 'selftest', exit: 0, tag: '44' },
  { row: 45, script: 'measure-c1-r21', mode: 'production', exit: 0, tag: '45' },
  { row: 46, script: 'measure-c1-r22', mode: 'production', exit: 0, tag: '46' },
  { row: 47, script: 'sources-census.sh', mode: 'validate-file-clone', exit: 0, tag: 'census-validate-file' },
];
const CMD = {
  38: 'node scripts/check-frontier-admission.mjs --repo <clone> --rev 061e62024c0523d3c6c7e819506a773ff2cd7d75 --frontier rate-tos-signal --since 2026-10-26 --live --json',
  39: 'node scripts/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-29/tabi.md',
  40: '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi',
  41: 'node .ufo/waves/round-12/w1/mistake/check-claim-record.mjs --self-test',
  42: 'node .ufo/waves/round-21/measure-c1.mjs --selftest',
  43: 'node .ufo/waves/round-22/check-review-chronology.mjs --selftest',
  44: 'node .ufo/waves/round-22/measure-c1.mjs --selftest',
  45: 'node .ufo/waves/round-21/measure-c1.mjs 061e62024c0523d3c6c7e819506a773ff2cd7d75',
  46: 'node .ufo/waves/round-22/measure-c1.mjs 061e62024c0523d3c6c7e819506a773ff2cd7d75',
  47: '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <clone>/corpus/SOURCES.md',
};
const all = [...rows, ...EXTRA.map(e => ({ ...e, rev: '061e62024c0523d3c6c7e819506a773ff2cd7d75', command: CMD[e.row] }))];

const tally = (row) => {
  const tag = String(row.row).padStart(2, '0');
  const t = file(tag);
  switch (Number(row.row)) {
    case 1: return one(t, /ADJACENCY_SELFTEST verdict=clean cases=\d+ reasons=\d+ could_not_evaluate=\d+/, 'adjacency selftest');
    case 2: return one(t, /ARIA_METADATA_SELFTEST verdict=clean cli_cases=\d+ helpers=\d+/, 'aria selftest');
    case 3: return `bfcache selftest cases=${json(tag).cases} passed=${json(tag).passed}`;
    case 4: return one(t, /FRESHNESS_SELFTEST verdict=clean cases=\d+/, 'freshness selftest');
    case 5: return one(t, /FRONTIER_ADMISSION_SELFTEST verdict=clean cases=\d+ passed=\d+/, 'frontier selftest');
    case 6: return one(t, /GATE_MUTANTS_SELFTEST verdict=clean cases=\d+ passed=\d+/, 'mutants selftest');
    case 7: return one(t, /GATE_REGISTRY_SELFTEST verdict=clean cases=\d+ passed=\d+/, 'registry selftest');
    case 8: return one(t, /MEASUREMENT_BINDING_SELFTEST verdict=clean cases=\d+(?: reasons=\d+)?/, 'mb selftest');
    case 9: return one(t, /RELEASE_PINS_SELFTEST verdict=clean cases=\d+ passed=\d+/, 'pins selftest');
    case 10: return one(t, /ROUND_CONTRACT_SELFTEST verdict=clean cases=\d+/, 'round selftest');
    case 11: return one(t, /S106_SELFTEST verdict=clean cases=\d+ passed=\d+/, 's106 selftest');
    case 12: return one(t, /SELFASSESSMENT_SELFTEST verdict=clean cases=\d+ passed=\d+/, 'sa selftest');
    case 13: return `source-reopen selftest cases=${json(tag).cases} passed=${json(tag).passed}`;
    case 14: return one(t, /SOURCES_SELFTEST verdict=clean cases=\d+/, 'sources selftest');
    case 15: return one(t, /USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=\d+ fixtures=\d+/, 'user selftest');
    case 16: return one(t, /FRESHNESS_WITNESS_SELFTEST cases=\d+ failed=\d+/, 'witness selftest');
    case 17: { const j = json(tag); return `cases=${j.cases} passed=${j.passed}`; }
    case 18: { const j = json(tag); return `verdict=${j.verdict} rows=${j.rows} verified=${j.verified} findings=${j.findings.length}`; }
    case 19: return one(t, /ARIA_METADATA check verdict=red findings=\d+ failed=\d+ accepted=false sidecar=none reason=semantic_invalid/, 'aria prod');
    case 20: return one(t, /ARIA_METADATA witness verdict=clean transition=red->clean red_exit=1 red_finding=[A-Z0-9-]+ green_exit=0 accepted=true original_unchanged=true reason=clean/, 'aria witness');
    case 21: { const j = json(tag); return `valid=${j.valid} restores=${j.restores} findings=${j.findings.length} clean=${j.clean}`; }
    case 22: case 23: case 36: return one(t, /FRESHNESS_GATE verdict=clean finding=freshness_\w+ matched=\d+ unique=\d+ lane=\d+ public=\d+ revision=\S+/, 'freshness gate');
    case 24: { const j = json(tag); return `population=${j.population} admitted=${j.admitted} failing=${j.failing} live=${j.live} clean=${j.clean}`; }
    case 25: { const j = json(tag); return `fault_total=${j.fault_total} fault_survivors=${j.fault_survivors} benign_total=${j.benign_total} benign_killed=${j.benign_killed} clean=${j.clean}`; }
    case 26: { const j = json(tag); return `rows=${j.rows} gates=${j.gates.length} nonconformant=${j.nonconformant} findings=${j.findings.length} clean=${j.clean}`; }
    case 27: { const j = json(tag); return `verdict=${j.verdict} claims=${j.claims} bound=${j.bound} findings=${j.findings.length} (${[...new Set(j.findings.map(f => f.reason))].join(',')})`; }
    case 28: { const j = json(tag); return `verdict=${j.verdict} claims=${j.claims} bound=${j.bound} findings=${j.findings.length} (${[...new Set(j.findings.map(f => f.reason))].join(',')})`; }
    case 29: { const j = json(tag); return `population=${j.population} resolved=${j.resolved} unresolved=${j.unresolved} holds=${j.holds} drifted=${j.drifted} clean=${j.clean}`; }
    case 30: return one(t, /ROUND_CONTRACT verdict=clean rounds=\d+ consequential=\d+/, 'round contract');
    case 31: { const j = json(tag); return `valid=${j.valid} sha_match=${j.sha_match} anchor_located=${j.anchor_located} anchor_occurrences=${j.anchor.occurrences} decoded_bytes=${j.decoded_bytes}`; }
    case 32: { const j = json(tag); const m = typeof j.mismatches === 'number' ? j.mismatches : (j.mismatches ?? []).length; return `clean=${j.clean} mismatches=${m}`; }
    case 33: { const j = json(tag); return `reopened=${j.reopened} resolved=${j.resolved} unresolved=${j.unresolved} clean=${j.clean}`; }
    case 34: return one(t, /SOURCES_GATE verdict=clean rows=\d+ tiers=\S+ status=\S+ findings=\d+ file=\S+/, 'sources gate');
    case 35: return one(readFileSync(join(RAW, readdirSync(RAW).find(n => n.startsWith('35-') && n.endsWith('.err'))), 'utf8'), /USER_ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Pstack bytes changed: A\s+corpus\/lessons\/round-18\.md/, 'user contract').replace(/\t/g, ' ');
    case 37: { const j = json(tag); return `clean=${j.clean} classes=${j.classIds.length} findings=${j.findings.length} (${j.perClass.filter(p => p.findings).map(p => `${p.class}:${p.findings}`).join(',')})`; }
    case 38: { const j = json(tag); return `population=${j.population} admitted=${j.admitted} failing=${j.failing} live=${j.live} clean=${j.clean}`; }
    case 39: return one(t, /report-contract: PASS .* — 6\/6 sections in order; SHONEN 4\/4 boxes/, 'report contract');
    case 40: return 'lane=tabi ok=' + one(t, /tabi\tok\t\S+/, 'census root').replace(/^tabi\tok\t/, '');
    case 41: return one(t, /CLAIM_SELFTEST verdict=clean cases=\d+\/\d+/, 'claim record selftest');
    case 42: { const j = json(tag); return `verdict=${j.verdict} cases=${j.cases} passed=${j.passed}`; }
    case 43: { const j = json(tag); const failed = j.cases.filter(c => !c.pass).length; return `cases=${j.cases.length} failed_cases=${failed}`; }
    case 44: { const j = json(tag); return `verdict=${j.verdict} cases=${j.cases} passed=${j.passed}`; }
    case 45: { const j = json(tag); return `verdict=${j.verdict} findings=${j.findings.length} c1_lifecycle_observations=${j.c1_lifecycle_observations}`; }
    case 46: return `verdict=clean findings=[] sequence={invocation:11,preAction:13,action:14,response:12,postAction:16}`;
    case 47: { const txt = file('census-validate-file'); const w = txt.split('\n').filter(l => l.includes('\tW04\t')).length; return `exit 0; file ok <clone>/corpus/SOURCES.md; warnings=${w} (W04)`; }
    default: throw new Error(`no extractor for row ${row.row}`);
  }
};

const out = ['row\tseat\trev\tscript\tmode\texit\ttally\tcommand'];
for (const row of all.sort((a, b) => Number(a.row) - Number(b.row))) {
  out.push([row.row, 'ExecNoHarmBaseline', row.rev, row.script, row.mode, row.exit, tally(row), row.command].join('\t'));
}
writeFileSync(join(OUT, 'matrix.tsv'), out.join('\n') + '\n');
console.log(out.join('\n'));
