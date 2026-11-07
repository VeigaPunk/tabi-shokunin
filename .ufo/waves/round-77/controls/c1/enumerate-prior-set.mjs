#!/usr/bin/env node
// QUALITY 140/141/146 for round 77: enumerate, at a committed revision, every file of the lane (any
// extension) that carries the receipt schema string, parses as JSON, has top-level schema
// tabi-chrome-cdp-filechooser-r77 and carries `nonce` or `events`; compare with prior-set.txt at
// that revision. Usage: node enumerate-prior-set.mjs <rev>   (prints the list and the comparison;
// exit 0 when equal, 1 otherwise)
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LANE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
const rev = process.argv[2];
if (!rev) { console.error('usage: enumerate-prior-set.mjs <rev>'); process.exit(2); }
const SCHEMA = 'tabi-chrome-cdp-filechooser-r77';
const git = (args) => spawnSync('git', ['-C', LANE, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });
const cand = git(['grep', '-l', '-F', SCHEMA, rev, '--']).stdout.split('\n').filter(Boolean).map((l) => l.slice(rev.length + 1));
const found = [], unparsable = [];
for (const f of cand) {
  const b = git(['show', rev + ':' + f]).stdout;
  let j; try { j = JSON.parse(b); } catch { if (/\.json$/i.test(f) || /^\s*[[{]/.test(b.slice(0, 64))) unparsable.push(f); continue; }
  if (j && typeof j === 'object' && !Array.isArray(j) && j.schema === SCHEMA && ('nonce' in j || 'events' in j)) found.push(f);
}
const ps = git(['show', rev + ':.ufo/waves/round-77/controls/c1/prior-set.txt']).stdout.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const a = [...found].sort(), b = [...ps].sort();
const equal = a.length === b.length && a.every((x, i) => x === b[i]);
console.log(`# rev ${rev}: candidates (git grep -l -F ${SCHEMA}) ${cand.length}; receipts by parse ${found.length}; prior-set.txt lines ${ps.length}; unparsable JSON-looking ${unparsable.length}`);
for (const f of a) console.log(f);
console.log(`# equal to prior-set.txt: ${equal}` + (equal ? '' : `\n# only found: ${a.filter((x) => !b.includes(x)).join(',')}\n# only listed: ${b.filter((x) => !a.includes(x)).join(',')}`) + (unparsable.length ? `\n# unparsable: ${unparsable.join(',')}` : ''));
process.exitCode = equal && unparsable.length === 0 ? 0 : 1;
