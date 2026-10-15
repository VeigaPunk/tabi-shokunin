#!/usr/bin/env node
// Folds seat result files into one aggregate. Does not invent a missing seat.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const round = process.argv[2];
if (!/^pstack-20261015-r(?:0[1-9]|10)$/.test(round || '')) {
  console.error('usage: pstack-aggregate.mjs <round-id>');
  process.exit(2);
}

const results = [];
const missing = [];
for (let index = 1; index <= 32; index++) {
  const seat = `s${String(index).padStart(2, '0')}`;
  const path = join(root, 'corpus/evidence', round, 'seats', seat, 'result.json');
  let seatResult;
  try {
    seatResult = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    missing.push(seat);
    continue;
  }
  results.push({ seat, verdict: seatResult.verdict, evidence: `corpus/evidence/${round}/seats/${seat}/result.json`, name: seatResult.name });
}

if (missing.length) {
  console.error(`MISSING ${missing.join(',')}`);
  process.exit(1);
}

const aggregate = { dispatcher: '/pstack:swarm', workers: 32, results };
writeFileSync(join(root, 'corpus/evidence', round, 'aggregate.json'), `${JSON.stringify(aggregate, null, 2)}\n`);
const counts = {};
for (const item of results) counts[item.verdict] = (counts[item.verdict] || 0) + 1;
console.log(`AGGREGATE ${round} ${JSON.stringify(counts)}`);
