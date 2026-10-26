#!/usr/bin/env node
// make-mutants.mjs — MutC2Counter: derives single-point mutants of the frozen
// round-33 C2 battery into mutants/, plus a pristine copy for harness validation.
// Each mutant changes exactly one contiguous string; uniqueness is asserted.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs';
const ROOT = '/fast/scratch/hyaku/tabi-r33/MutC2Counter';
const OUT = join(ROOT, 'mutants');
const src = readFileSync(SRC, 'utf8');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const FROZEN = '51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b';
if (sha(src) !== FROZEN) throw new Error(`frozen battery digest mismatch: ${sha(src)}`);
mkdirSync(OUT, { recursive: true });
writeFileSync(join(ROOT, 'battery-pristine.mjs'), src);

const PRED = '    out.predicate = out.honest.H0 && out.honest.H1 && out.honest.H2 && out.forgeriesAccepted === 0 && st.status === 0 && out.digestLiterals.length === 0;';
const F7 = "      F7: () => put(ENTRY, relabelYesRows(entryText, (cells, first) => (first ? rowLine([cells[0], cells[1], cells[2], 'yes (live)', cells[4]]) : rowLine(cells)))),";
const F3 = "      F3: () => putReceipt({ ...receipt, runs: [receipt.runs[0], { ...receipt.runs[0], name: 'run2' }] }),";
const H2L = "        const r1 = blob(lane, GOLDEN_REV, `${RERUN}/run1/transcript.jsonl`); const r2 = blob(lane, GOLDEN_REV, `${RERUN}/run2/transcript.jsonl`);";
const ASSERT = "      const onDisk = readFileSync(join(clone, GATE));\n      if (sha256(onDisk) !== gateSha) throw new Refusal(`variant ${v} changed the gate bytes`);";
const DIGESTS = "      digestLiterals: HONEST_DIGESTS.filter((d) => gateAtRev.toString('utf8').toLowerCase().includes(d.slice(0, 12))).map((d) => d.slice(0, 12)),";

// [name, from, to, expected verdict + rationale]
const mutants = [
  ['M01-drop-h2-predicate', 'out.honest.H0 && out.honest.H1 && out.honest.H2 && out.forgeriesAccepted === 0', 'out.honest.H0 && out.honest.H1 && out.forgeriesAccepted === 0',
    'survivor-expected: no committed control constructs a gate that rejects only H2'],
  ['M02-drop-h1-predicate', 'out.honest.H0 && out.honest.H1 && out.honest.H2 && out.forgeriesAccepted === 0', 'out.honest.H0 && out.honest.H2 && out.forgeriesAccepted === 0',
    'survivor-expected: no control rejects only H1'],
  ['M03-drop-digest-scan', DIGESTS, '      digestLiterals: [],',
    'killed-by-J3-expected: whitelist gate embeds the 5 honest digest literals; field flips 5 -> []'],
  ['M04-drop-digest-clause', 'st.status === 0 && out.digestLiterals.length === 0;', 'st.status === 0;',
    'survivor-expected: J3 stays false via selftest=3; clause witnessed only by the reported field'],
  ['M05-accept-exit-1', 'accepted: r.status === 0,', 'accepted: r.status === 0 || r.status === 1,',
    'killed-by-J2+J3-expected: reject-all gate exits 1 everywhere -> forgeriesAccepted 8'],
  ['M06-skip-gate-bytes-assert', ASSERT, '',
    'survivor-expected: no control tampers the gate between commit and run'],
  ['M07-worktree-gate', "run(process.execPath, [join(clone, GATE), '--repo', clone,", "run(process.execPath, [join(lane, GATE), '--repo', clone,",
    'survivor-expected: repo worktree gate is byte-identical to REV blob for all three controls'],
  ['M08-F7-decorates-no-row', F7, '      F7: () => put(ENTRY, entryText),',
    'killed-expected: degenerate construction commits nothing -> git commit fails -> battery exit 2'],
  ['M08b-F7-decorates-non-first-yes-row', F7, "      F7: () => put(ENTRY, relabelYesRows(entryText, (cells, first) => (first ? rowLine(cells) : rowLine([cells[0], cells[1], cells[2], 'yes (live)', cells[4]])))),",
    'survivor-expected: which yes-row F7 decorates is unobserved; every control receipt identical'],
  ['M09-F3-distinct-paths', F3, "      F3: () => { const b = `${EVD}/f3/run2/transcript.jsonl`; put(b, t1); putReceipt({ ...receipt, runs: [receipt.runs[0], { ...receipt.runs[0], name: 'run2', transcript: b, transcriptSha256: sha256(t1) }] }); },",
    'survivor-expected: F3 collapses into F4 (byte copy); J1 v1 accepts, J2 rejects, J3 rejects on ds[0]==ds[1]'],
  ['M10-selftest-clause-drop', 'out.forgeriesAccepted === 0 && st.status === 0 && out.digestLiterals.length === 0', 'out.forgeriesAccepted === 0 && out.digestLiterals.length === 0',
    'survivor-expected: selftest still run and reported, but no control has a gate that fails selftest while otherwise clean'],
  ['M11-admitted-relaxed', 'const honestOk = (x) => x.accepted && x.admitted === HONEST_ADMITTED && x.failing === 0;', 'const honestOk = (x) => x.accepted && x.admitted >= 1 && x.failing === 0;',
    'survivor-expected: no control presents a gate that admits only part of the honest runs'],
  ['M12-drop-forgery-clause', 'out.honest.H2 && out.forgeriesAccepted === 0 && st.status === 0', 'out.honest.H2 && st.status === 0',
    'killed-by-J1-expected: do-nothing lane flips predicate true (honest T/T/T, selftest 0, digests [])'],
  ['M13-golden-from-REV', 'const goldenSrc = blob(lane, GOLDEN_REV, GATE);', 'const goldenSrc = blob(lane, REV, GATE);',
    'killed-by-J2+J3-expected: golden gate sha assertion fails against patched control gates -> exit 2'],
  ['M14-H2-golden-transcripts', H2L, "        const r1 = Buffer.from(golden('http://127.0.0.1:40002')); const r2 = Buffer.from(golden('http://127.0.0.1:40003'));",
    'killed-by-J3-expected: whitelist refuses golden digests -> honest.H2 false'],
  ['M15-prefix-len-40', '.includes(d.slice(0, 12))).map((d) => d.slice(0, 12)),', '.includes(d.slice(0, 40))).map((d) => d.slice(0, 40)),',
    'survivor-expected: full 64-hex whitelist literals still contain their 40-hex prefix; prefix length unobserved'],
];

const manifest = [];
for (const [name, from, to, expect] of mutants) {
  const parts = src.split(from);
  if (parts.length !== 2) throw new Error(`${name}: from-string occurs ${parts.length - 1} times, expected 1`);
  const out = parts.join(to);
  const line = src.slice(0, src.indexOf(from)).split('\n').length;
  writeFileSync(join(OUT, `${name}.mjs`), out);
  manifest.push({ name, from, to, line, expect, sha256: sha(out) });
  console.log(`${name}  line=${line}  sha256=${sha(out).slice(0, 12)}`);
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log(`mutants=${manifest.length} pristine=${sha(readFileSync(join(ROOT, 'battery-pristine.mjs')))}`);
