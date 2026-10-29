#!/usr/bin/env node
// SCRATCH-ONLY matrix driver for the MutC1Sig mutation probe.
// Runs every (counter copy x synthetic input x challenge mode) combination and
// writes one JSON result per cell plus an aggregate table.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const S = '/fast/scratch/hyaku/tabi-r43/MutC1Sig';
const FROZEN = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';

const counters = [
  { id: 'FROZEN-inplace', path: FROZEN, note: 'committed bytes, run in place (read-only)' },
  { id: 'PATHCTL-scratch', path: path.join(S, 'counter-pathctl.mjs'), note: 'byte-identical copy in scratch (isolates the copy-path artifact)' },
  { id: 'MUT-scratch', path: path.join(S, 'counter-mut.mjs'), note: 'ASSIGNED MUTANT: measureSignatureVerified forced true' },
  { id: 'DIAG-PATHCTL-scratch', path: path.join(S, 'counter-diag-pathctl.mjs'), note: 'diagnostic: unmutated copy, self-digest artifact neutralized' },
  { id: 'DIAG-MUT-scratch', path: path.join(S, 'counter-diag-mut.mjs'), note: 'diagnostic: mutant + self-digest artifact neutralized' },
];
const inputs = [
  { id: 'SYN-SELF', dir: path.join(S, 'syn-self') },
  { id: 'SYN-TAMPERED', dir: path.join(S, 'syn-tampered') },
];
const modes = [
  { id: 'answered', args: (key) => ['--answer', key] },
  { id: 'unanswered', args: () => [] },
  { id: 'nochan', args: () => ['--nochan'] },
];

const outDir = path.join(S, 'results');
fs.mkdirSync(outDir, { recursive: true });
const table = [];
for (const inp of inputs) {
  for (const c of counters) {
    for (const m of modes) {
      const key = path.join(inp.dir, 'attacker-private.pem');
      const label = `${inp.id}__${c.id}__${m.id}`;
      const args = [path.join(S, 'run-counter.mjs'), '--counter', c.path,
        '--receipt', path.join(inp.dir, 'receipt.json'),
        '--measure', path.join(inp.dir, 'measure.json'),
        '--label', label, ...m.args(key)];
      const r = spawnSync(process.execPath, args, { encoding: 'utf8' });
      let parsed = null;
      try { parsed = JSON.parse(r.stdout); } catch { }
      const cell = {
        label, input: inp.id, counter: c.id, counterNote: c.note, mode: m.id,
        exit: parsed ? parsed.exit : null,
        findings: parsed?.counter?.findings ?? null,
        predicate: parsed?.counter?.predicate ?? null,
        measureSignatureVerified: parsed?.counter?.measureSignatureVerified ?? null,
        witnessAttestationVerified: parsed?.counter?.witnessAttestationVerified ?? null,
        challengeVerified: parsed?.counter?.challengeVerified ?? null,
        challengeError: parsed?.counter?.challengeError ?? null,
        raw: parsed ? undefined : (r.stdout || '') + (r.stderr || ''),
      };
      fs.writeFileSync(path.join(outDir, label + '.json'), JSON.stringify(cell, null, 1) + '\n');
      table.push(cell);
    }
  }
}
fs.writeFileSync(path.join(S, 'matrix.json'), JSON.stringify(table, null, 1) + '\n');
console.log(table.map((c) => `${c.label.padEnd(46)} exit=${String(c.exit).padEnd(3)} predicate=${String(c.predicate).padEnd(5)} challenge=${String(c.challengeVerified).padEnd(5)} findings=${JSON.stringify(c.findings)}`).join('\n'));
