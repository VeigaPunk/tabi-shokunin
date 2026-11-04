#!/usr/bin/env node
// Round-63 red-before control: demonstrate on this host that the FROZEN r62
// generation cannot distinguish its own producer-verdict polarity flip, using
// the same exact-line mutation discipline the r63 generation is judged by.
//
//   node old-generation-r63.mjs --counter <r62 counter> --receipt <lying r62 receipt>
//     --driver <r62 driver> --expect-driver-sha256 <sha> --shot <dir> --work <dir>
//
// Exit 0 only when the class is DEMONSTRATED: the pristine r62 counter refuses
// the lying receipt (exit 1) while the exactly-mutated copy accepts it (exit 0).
// That is the red-before evidence; it claims nothing about r62's own round.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const counter = opt('counter'), receipt = opt('receipt'), driver = opt('driver'), expect = opt('expect-driver-sha256'), shot = opt('shot'), work = opt('work');
if (!counter || !receipt || !driver || !expect || !shot || !work) { console.error('usage: --counter --receipt --driver --expect-driver-sha256 --shot --work'); process.exit(2); }
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const src = fs.readFileSync(counter, 'utf8');
const PRE = "r?.predicate===true && r.buttonHypothesis==='CONFIRMED'";
const POST = "r?.predicate===true || r.buttonHypothesis==='CONFIRMED'";
const lines = src.split('\n');
const hits = [];
lines.forEach((line, i) => { let from = 0; for (;;) { const at = line.indexOf(PRE, from); if (at < 0) break; hits.push({ line: i + 1, col: at + 1 }); from = at + 1; } });
if (hits.length !== 1) { console.error(JSON.stringify({ schema: 'tabi-r63-old-generation-v1', error: 'pre-image not unique', hits })); process.exit(3); }
const { line, col } = hits[0];
const mutated = [...lines];
mutated[line - 1] = lines[line - 1].slice(0, col - 1) + POST + lines[line - 1].slice(col - 1 + PRE.length);
fs.mkdirSync(work, { recursive: true });
const mutantPath = path.join(work, 'r62-producer-mutant.mjs');
fs.writeFileSync(mutantPath, mutated.join('\n'));
const run = (p) => {
  const r = spawnSync('node', [p, receipt, '--driver', driver, '--expect-driver-sha256', expect, '--shot', shot, '--json'], { encoding: 'utf8', timeout: 120000 });
  let findings = null;
  try { findings = JSON.parse(r.stdout).findings; } catch { findings = null; }
  return { exit: r.status, findings, stderr: r.stderr.trim().slice(0, 300) };
};
const pristine = run(counter), mutant = run(mutantPath);
const demonstrated = pristine.exit === 1 && mutant.exit === 0;
const result = { schema: 'tabi-r63-old-generation-v1', counter, counterSha256: sha(src), receipt, receiptSha256: sha(fs.readFileSync(receipt)),
  site: { line, col, pre: PRE, post: POST }, mutantPath, mutantSha256: sha(fs.readFileSync(mutantPath)),
  pristine, mutant, demonstrated, reading: demonstrated
    ? 'the frozen r62 producer-verdict line cannot distinguish its polarity flip: pristine refuses the lying receipt, the exact-line mutant accepts it'
    : 'NOT demonstrated: the r62 generation behavior differed from the recorded survivor class' };
console.log(JSON.stringify(result, null, 1));
process.exitCode = demonstrated ? 0 : 1;
