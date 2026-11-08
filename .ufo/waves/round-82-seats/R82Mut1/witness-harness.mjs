// Witness harness: for every SURVIVOR with a crafted witness, run the pristine counter (expect
// exit 1) and the mutant counter (expect exit 0) on the same crafted bytes. Never writes in the lane.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { MUTANTS } from './mutants.mjs';
import { WITNESSES, NO_WITNESS } from './witnesses.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(LANE, 'scripts/check-showpicker-r82.mjs');
const REAL = path.join(LANE, 'corpus/evidence/round82/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-82/controls/c1/prior-set.txt');
const PIN = '2085c2a78a2bc87208404ca6d477964ed8aa29eea52cd31b92a94fe88cc373f1';
const NONCE = 'tabi-r82-scored1';
const WORK = '/fast/scratch/hyaku/tabi-r82/R82Mut1';
const SEAT = path.join(LANE, '.ufo/waves/round-82-seats/R82Mut1');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const src = fs.readFileSync(COUNTER, 'utf8');
const realBytes = fs.readFileSync(REAL);
const REAL_SHA = sha256(realBytes);
const real = JSON.parse(realBytes.toString('utf8'));
const FIXTURE = real.fixture.sha256;
const summaryPath = path.join(SEAT, 'mutants-r82.json');
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const survivorSet = new Set(summary.survivors);

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const only = opt('only');
const jobs = Number(opt('jobs') || 10);

const run = (args, timeout = 120000) => new Promise((resolve) => {
  const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '', err = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { err += d; });
  const timer = setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, timeout);
  child.on('close', (code) => {
    clearTimeout(timer);
    let j = null; try { j = JSON.parse(out); } catch { j = null; }
    resolve({ code, json: j, ids: j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : [], verdict: j ? j.verdict : null, stderrHead: (err || out).slice(0, 400) });
  });
});

const clone = (v) => JSON.parse(JSON.stringify(v));
const helpers = (dir) => ({
  mirror: (name) => {
    const m = path.join(dir, 'mirror-' + name, 'tabi-shokunin');
    fs.rmSync(m, { recursive: true, force: true });
    for (const t of ['.ufo/waves/round-82', 'corpus/evidence/round82']) fs.mkdirSync(path.join(m, t), { recursive: true });
    const s = path.join(LANE, '.ufo/waves/round-82/controls/c1');
    if (fs.existsSync(s)) fs.cpSync(s, path.join(m, '.ufo/waves/round-82/controls/c1'), { recursive: true });
    return m;
  },
  writeFile: (p, content) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); },
  sha256File: (p) => sha256(fs.readFileSync(p)),
  clone,
  priorJson: JSON.parse(fs.readFileSync((() => {
    const t = fs.readFileSync(PRIOR_SET, 'utf8').split('\n').map((x) => x.trim()).filter((x) => x && !x.startsWith('#'))[0];
    return path.isAbsolute(t) ? t : path.join(LANE, t);
  })(), 'utf8')),
  realJson: real,
  randomHex: (n) => crypto.randomBytes(n).toString('hex'),
  uuid: () => crypto.randomUUID(),
  path,
});

const queue = MUTANTS.filter(([name]) => survivorSet.has(name) && WITNESSES[name] && (!only || name === only));
const results = [];
const runOne = async ([name, from, to]) => {
  const dir = path.join(WORK, 'wit-' + name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const mutSrc = src.replace(from, to);
  const mutPath = path.join(dir, 'check-showpicker-r82.mjs');
  fs.writeFileSync(mutPath, mutSrc);
  const r = clone(real);
  let spec;
  try { spec = WITNESSES[name](r, helpers(dir)); } catch (e) {
    return { mutant: name, witness: 'threw', error: e.message, witnessKills: false };
  }
  const lane = (spec && spec.lane) || LANE;
  const extraArgs = (spec && spec.extraArgs) || (lane === LANE ? ['--tree-exempt-sha256', REAL_SHA] : []);
  const receiptPath = path.join(dir, 'witness-receipt.json');
  fs.writeFileSync(receiptPath, JSON.stringify(r, null, 1));
  const argsFor = (counterPath) => [counterPath, '--lane', lane, '--receipt', receiptPath,
    '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--expect-fixture-sha256', FIXTURE,
    '--prior-set', PRIOR_SET, ...extraArgs, '--json'];
  const pristine = await run(argsFor(COUNTER));
  const mutant = await run(argsFor(mutPath));
  const rec = {
    mutant: name, witness: WITNESSES[name].toString(), lane,
    pristineExit: pristine.code, pristineVerdict: pristine.verdict, pristineIds: pristine.ids,
    mutantExit: mutant.code, mutantVerdict: mutant.verdict, mutantIds: mutant.ids,
    witnessKills: pristine.code === 1 && mutant.code === 0,
    receiptSha256: sha256(fs.readFileSync(receiptPath)),
    stderrHead: pristine.code === 2 || mutant.code === 2 ? { pristine: pristine.stderrHead, mutant: mutant.stderrHead } : null,
  };
  fs.rmSync(dir, { recursive: true, force: true });
  return rec;
};

const workers = Array.from({ length: Math.min(jobs, queue.length) }, async () => {
  while (queue.length) results.push(await runOne(queue.shift()));
});
await Promise.all(workers);
results.sort((a, b) => a.mutant.localeCompare(b.mutant));
const noWitness = summary.survivors.filter((n) => !WITNESSES[n]);
const out = {
  schema: 'tabi-r82-r82mut1-witnesses',
  survivors: summary.survivors.length,
  witnessableSurvivors: MUTANTS.filter(([n]) => survivorSet.has(n) && WITNESSES[n]).length,
  tried: results.length,
  killing: results.filter((x) => x.witnessKills).length,
  failing: results.filter((x) => !x.witnessKills).map((x) => x.mutant),
  noWitness: noWitness.map((n) => ({ mutant: n, why: NO_WITNESS[n] || 'no witness authored' })),
  results,
};
fs.writeFileSync(path.join(SEAT, 'witnesses-r82.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({ survivors: out.survivors, witnessableSurvivors: out.witnessableSurvivors, tried: out.tried, killing: out.killing, failing: out.failing }, null, 1));
