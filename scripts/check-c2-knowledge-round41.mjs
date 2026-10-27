#!/usr/bin/env node
// check-c2-knowledge-round41.mjs — frozen C2 counter for round 41.
// Verifies the environment-injection forgery-class knowledge entry exists with
// its provenance trio, a >=6-row decision table (each row naming a vector, a
// detection channel and a refusal path), a corpus/README.md coverage-map row,
// and that SOURCES.md rows S146 and S147 are mined and cited by the entry.
// Usage: node scripts/check-c2-knowledge-round41.mjs [--root <lane root>]
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
let ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
for (let i = 0; i < args.length; i++) if (args[i] === '--root') ROOT = args[++i];
const ENTRY = path.join(ROOT, 'corpus/knowledge/environment-injection-measurement-integrity-round-41.md');
const README = path.join(ROOT, 'corpus/README.md');
const SOURCES = path.join(ROOT, 'corpus/SOURCES.md');
const findings = [];

let text = null;
try { text = fs.readFileSync(ENTRY, 'utf8'); } catch { findings.push('entry-absent'); }
let readme = '', sources = '';
try { readme = fs.readFileSync(README, 'utf8'); } catch { findings.push('readme-unreadable'); }
try { sources = fs.readFileSync(SOURCES, 'utf8'); } catch { findings.push('sources-unreadable'); }

if (text !== null) {
  const head = text.split('\n').slice(0, 12).join('\n');
  if (!/^source:/m.test(head)) findings.push('provenance-source');
  if (!/\bS146\b/.test(head) || !/\bS147\b/.test(head)) findings.push('provenance-citations');
  if (!/^verified-at:/m.test(head)) findings.push('provenance-verified-at');
  if (!/^recheck:/m.test(head)) findings.push('provenance-recheck');
  // decision table: count table rows inside the vector table (rows that carry a
  // detection channel and a refusal path, marked by '→' plus an anchor cell).
  const rows = text.split('\n').filter((l) => /^\|/.test(l.trim()) && /→/.test(l) && !/^\|\s*-/.test(l.trim()));
  if (rows.length < 6) findings.push(`decision-table-rows:${rows.length}`);
  for (const v of ['NODE_OPTIONS', 'NODE_PATH', 'LD_PRELOAD', 'execArgv', '/proc/self/environ', 'digest']) {
    if (!text.includes(v)) findings.push(`vector-cell:${v}`);
  }
  if (!/deferred|not admitted|residual/i.test(text)) findings.push('scope-honesty');
}
if (readme && !/environment-injection-measurement-integrity-round-41\.md/.test(readme)) findings.push('coverage-row-absent');
for (const sid of ['S146', 'S147']) {
  const re = new RegExp(`^\\|\\s*${sid}\\s*\\|`, 'm');
  if (!re.test(sources)) findings.push(`registry-row:${sid}`);
  else {
    const line = sources.split('\n').find((l) => re.test(l));
    const cells = line.split('|').map((c) => c.trim());
    if (cells[8] !== 'mined') findings.push(`registry-status:${sid}:${cells[8]}`);
    if (!/environment-injection-measurement-integrity-round-41\.md/.test(cells[11] || '')) findings.push(`registry-usedby:${sid}`);
  }
}
const out = { schema: 'tabi-r41-c2-knowledge', predicate: findings.length === 0, findings };
console.log(JSON.stringify(out));
process.exit(out.predicate ? 0 : 1);
