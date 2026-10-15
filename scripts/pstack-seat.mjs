#!/usr/bin/env node
// One /pstack:swarm seat. Reads its slice, runs that command, writes only its result file.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

function flag(name) {
  const index = args.indexOf(name);
  if (index < 0 || !args[index + 1]) {
    console.error(`missing ${name}`);
    process.exit(2);
  }
  return args[index + 1];
}

const round = flag('--round');
const seat = flag('--seat');
if (!/^pstack-20261015-r(?:0[1-9]|10)$/.test(round) || !/^s(?:0[1-9]|[12][0-9]|3[0-2])$/.test(seat)) {
  console.error('round or seat is outside the pstack contract');
  process.exit(2);
}

const slices = JSON.parse(readFileSync(join(root, 'corpus/evidence', round, 'slices.json'), 'utf8'));
const slice = slices.seats.find(item => item.seat === seat);
if (!slice || typeof slice.command !== 'string' || slice.command.length < 3) {
  console.error('slice missing');
  process.exit(2);
}

const result = spawnSync('bash', ['-c', slice.command], {
  cwd: root,
  encoding: 'utf8',
  timeout: 180000,
  maxBuffer: 4 * 1024 * 1024,
});
const evidence = `${result.stdout || ''}${result.stderr || ''}`.trim().slice(0, 4000);
let verdict = 'PASS';
if (result.error || result.status !== 0) verdict = 'BLOCKED';
else if (evidence.length < 8) verdict = 'ISSUES';

const output = join(root, 'corpus/evidence', round, 'seats', seat, 'result.json');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify({ seat, verdict, evidence, command: slice.command }, null, 2)}\n`);
console.log(`${seat} ${verdict}`);
process.exit(verdict === 'BLOCKED' ? 1 : 0);
