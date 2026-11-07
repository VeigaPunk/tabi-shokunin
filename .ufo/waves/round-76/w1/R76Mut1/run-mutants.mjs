#!/usr/bin/env node
// Semantic-mutant runner for tabi round 76 C1 seat R76Mut1.
// For each mutant in mutants.json: create <base>/m<k>/ with the mutated counter + the pristine
// battery and driver copies, run the battery copy with --first-failure --jobs 4, classify exactly
// as kill-power-r76.mjs does (killed / killed-positive / survived / crashed), record the summary.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const lane = opt('lane'), real = opt('real'), pin = opt('pin'), nonce = opt('nonce'), priorSet = opt('prior-set');
const base = opt('base'), out = opt('out');
const laundered = multi('laundered');
const conc = Number(opt('conc') || 6), jobs = Number(opt('jobs') || 4);
if (!lane || !real || !pin || !nonce || !priorSet || !base || !out || !path.isAbsolute(base) || !path.isAbsolute(lane) || laundered.length !== 3) {
  console.error('usage: node run-mutants.mjs --lane ABS --real R --pin H --nonce N --prior-set F --base ABS --out F --laundered D (x3) [--conc 6] [--jobs 4]');
  process.exit(2);
}
const SRC = path.join(base, 's');
const counterBytes = fs.readFileSync(path.join(SRC, 'check-dialog-r76.mjs'));
const counterSrc = counterBytes.toString('utf8');
const batteryBytes = fs.readFileSync(path.join(SRC, 'negatives-dialog-r76.mjs'));
const driverBytes = fs.readFileSync(path.join(SRC, 'chrome-cdp-dialog-round76.mjs'));
const muts = JSON.parse(fs.readFileSync(path.join(base, 'mutants.json'), 'utf8'));

for (const m of muts) {
  const k = counterSrc.split(m.from).length - 1;
  if (k !== 1) { console.error(`mutant ${m.name}: edit string occurs ${k} times (must be 1)`); process.exit(2); }
}

const mk = (name, src) => {
  const d = path.join(base, name);
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(path.join(d, 'w'), { recursive: true });
  fs.writeFileSync(path.join(d, 'check-dialog-r76.mjs'), src);
  fs.writeFileSync(path.join(d, 'negatives-dialog-r76.mjs'), batteryBytes);
  fs.writeFileSync(path.join(d, 'chrome-cdp-dialog-round76.mjs'), driverBytes);
  return d;
};
const run = (d, first) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(d, 'negatives-dialog-r76.mjs'), '--lane', lane, '--real', real, '--expect-driver-sha256', pin, '--expect-nonce', nonce,
    '--prior-set', priorSet, ...laundered.flatMap((x) => ['--laundered', x]), '--work', path.join(d, 'w'), '--json', ...(first ? ['--first-failure'] : [])],
    { stdio: ['ignore', 'pipe', 'pipe'] });
  let so = '', se = '';
  p.stdout.on('data', (x) => { so += x; });
  p.stderr.on('data', (x) => { se += x; });
  p.on('close', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ code, j, stderr: se.slice(0, 2000) }); });
});
const classify = (code, j) => {
  const parsed = !!j && Array.isArray(j.failed) && j.positive && typeof j.positive === 'object';
  if (!parsed) return { outcome: 'crashed', why: 'battery exit ' + code + ', summary unparsable' };
  if (code === 0 && j.allOk === true) return { outcome: 'survived' };
  if (code !== 1) return { outcome: 'crashed', why: 'battery exit ' + code };
  const named = j.failed.filter((f) => f !== '(positive)' && f !== '(coverage-gap)');
  if (named.length > 0) return { outcome: 'killed', failedCases: named };
  if (j.failed.includes('(positive)')) {
    const p = j.positive;
    if (p.exit === 1 && Array.isArray(p.findingIds) && p.findingIds.length > 0) return { outcome: 'killed-positive', positiveFindings: p.findingIds };
    return { outcome: 'crashed', why: 'positive run exit ' + p.exit + ' findings ' + JSON.stringify(p.findingIds) };
  }
  return { outcome: 'crashed', why: 'battery exit 1 with no named failure: ' + JSON.stringify(j.failed) };
};

const tasks = [{ cls: 'unmutated', name: '(unmutated)', from: null, to: null, src: counterSrc }, ...muts.map((m) => ({ cls: 'semantic', name: m.name, from: m.from, to: m.to, src: counterSrc.replace(m.from, m.to) }))];
const results = new Array(tasks.length);
let next = 0;
await Promise.all(Array.from({ length: conc }, async (w) => {
  while (next < tasks.length) {
    const i = next++; const t = tasks[i];
    const d = mk('m' + w + '-' + i, t.src);
    const { code, j, stderr } = await run(d, t.cls !== 'unmutated');
    const c = classify(code, j);
    results[i] = { cls: t.cls, mutant: t.name, editFrom: t.from, editTo: t.to, batteryExit: code, ...c,
      mutantCounterSha256: (await import('node:crypto')).createHash('sha256').update(fs.readFileSync(path.join(d, 'check-dialog-r76.mjs'))).digest('hex'),
      passed: j ? j.passed : null, cases: j ? j.cases : null, stoppedEarly: j ? j.stoppedEarly : null,
      positiveExit: j && j.positive ? j.positive.exit : null, positiveFindings: j && j.positive ? j.positive.findingIds : null,
      failed: j ? j.failed : null, coverageGap: j ? j.coverageGap : null, stderr: code === 2 || c.outcome === 'crashed' ? stderr : null };
    fs.rmSync(d, { recursive: true, force: true });
  }
}));
const mutResults = results.slice(1);
const of = (o) => mutResults.filter((m) => m.outcome === o);
const summary = {
  schema: 'tabi-r76-r76mut1-semantic', lane, real, pin, nonce, priorSet,
  counterSha256: (await import('node:crypto')).createHash('sha256').update(counterBytes).digest('hex'),
  unmutated: results[0],
  semantic: { mutants: mutResults.length, killed: of('killed').length, killedPositive: of('killed-positive').length, survived: of('survived').length, crashed: of('crashed').length },
  survivors: of('survived').map((m) => m.mutant),
  crashed: of('crashed').map((m) => ({ mutant: m.mutant, why: m.why })),
  results: results,
};
fs.writeFileSync(out, JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ unmutated: results[0].outcome, semantic: summary.semantic, survivors: summary.survivors, crashed: summary.crashed }));
process.exit(0);
