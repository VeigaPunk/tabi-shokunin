import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Certification only: evaluates existing receipts; never starts the browser/driver.
const lane = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const output = path.dirname(fileURLToPath(import.meta.url));
const scratch = '/fast/scratch/hyaku/tabi-r62/R62Exec3';
const revision = '544a40ac8328ee355b7c41bd67da856f058726e2';
const counterRel = '.ufo/waves/round-61/counters/chromium-receipt-r61.mjs';
const driverRel = 'scripts/chrome-cdp-loopback-round61.mjs';
const expectedCounter = '97f10e67c4ac1548179c4045373aae9d97ea2ae6a6245ffd7f04e88fdd233625';
const expectedDriver = 'f33f0ab72eec4f13519cd67a0768c5f743a7b14248c68bdc1bc9f639352a4e76';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const inputs = new Map();
function pin(relative) {
  if (inputs.has(relative)) return inputs.get(relative);
  const bytes = fs.readFileSync(path.join(lane, relative));
  const committed = execFileSync('git', ['-C', lane, 'show', `${revision}:${relative}`], { maxBuffer: 4 * 1024 * 1024 });
  const entry = { path: relative, bytes: bytes.length, sha256: hash(bytes), committedSha256: hash(committed), matchesCommitted: bytes.equals(committed) };
  if (!entry.matchesCommitted) throw new Error(`Working bytes differ from r61 final commit: ${relative}`);
  inputs.set(relative, entry);
  return entry;
}
fs.mkdirSync(scratch, { recursive: true });
const counter = pin(counterRel), driver = pin(driverRel);
if (counter.sha256 !== expectedCounter || driver.sha256 !== expectedDriver) throw new Error('Instrument pin mismatch');
const manifestRel = '.ufo/waves/round-61/measure/f-probes/manifest.json';
pin(manifestRel);
const manifest = JSON.parse(fs.readFileSync(path.join(lane, manifestRel), 'utf8'));
const smoke = '.ufo/waves/round-61/w1/R61Exec2/smoke-r61b';
const live = 'corpus/evidence/round61/chromium-pointer-domain';
pin(`${smoke}/receipt.json`);
const cases = manifest.probes.map(p => ({ id: p.id, relative: `.ufo/waves/round-61/measure/f-probes/${p.file}`, shot: smoke, frozenSetF: p.frozenSetF, manifestSha256: p.sha256 }));
cases.push({ id: 'live', relative: `${live}/receipt.json`, shot: live });
for (const c of cases) {
  const receiptPin = pin(c.relative);
  if (c.manifestSha256 && c.manifestSha256 !== receiptPin.sha256) throw new Error(`Manifest mismatch: ${c.id}`);
  const receipt = JSON.parse(fs.readFileSync(path.join(lane, c.relative), 'utf8'));
  c.shots = receipt.steps.map(step => {
    const relative = path.posix.join(c.shot, step.png);
    const shotPin = pin(relative);
    if (shotPin.sha256 !== step.sha256) throw new Error(`Shot mismatch: ${relative}`);
    return { path: relative, sha256: shotPin.sha256, receiptSha256: step.sha256 };
  });
}
const runs = await Promise.all(cases.map(c => new Promise(resolve => {
  const args = [path.join(lane, counterRel), path.join(lane, c.relative), '--driver', path.join(lane, driverRel), '--expect-driver-sha256', driver.sha256, '--shot', path.join(lane, c.shot), '--json'];
  const startedAt = new Date().toISOString();
  execFile(process.execPath, args, { cwd: scratch, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, timeout: 30000 }, (error, stdout, stderr) => {
    const exit = error ? (Number.isInteger(error.code) ? error.code : null) : 0;
    let result = null;
    try { result = JSON.parse(stdout); } catch { /* Raw output remains authoritative. */ }
    const classification = exit === 0 && result?.predicate === true ? 'predicate-met' : exit === 1 && result?.predicate === false && result?.findingCount > 0 ? 'semantic-refusal' : exit === 2 ? 'invocation-error' : 'unexpected-or-execution-error';
    fs.writeFileSync(path.join(output, `${c.id}.stdout.json`), stdout);
    fs.writeFileSync(path.join(output, `${c.id}.stderr.txt`), stderr);
    resolve({ ...c, startedAt, finishedAt: new Date().toISOString(), argv: [process.execPath, ...args], cwd: scratch, exit, signal: error?.signal ?? null, classification, stdout, stderr, result });
  });
})));
const certification = {
  schema: 'tabi-r62-r61-final-byte-certification-v1', seat: 'R62Exec3', axis: 'calibration',
  createdAt: new Date().toISOString(), nodeVersion: process.version, nodeExecutable: process.execPath,
  baseline: '57b29bade4b05b03cdb8fa151daec90ac9b1a29c', r62Freeze: '1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4', r61FinalRevision: revision,
  r62ContextPins: Object.fromEntries(['claims.json', 'instrument-pins.json'].map(name => [name, hash(fs.readFileSync(path.join(lane, '.ufo/waves/round-62', name)))])),
  replaySha256: hash(fs.readFileSync(fileURLToPath(import.meta.url))), inputs: [...inputs.values()], runs,
  summary: { semanticRefusals: runs.filter(r => r.classification === 'semantic-refusal').map(r => r.id), invocationErrors: runs.filter(r => r.exit === 2).map(r => r.id), livePredicate: runs.find(r => r.id === 'live').result?.predicate ?? null },
  limits: ['New r62 evidence, not retroactive r61 admission.', 'Runs pristine final counter on existing probes and recorded live receipt; no browser launched.', 'No mutated counter, mutation kill matrix or selftest executed; earlier mutation-certification claims are not independently certified by these runs.', 'Lane-dispatched evidence support, not an outside admission review.']
};
fs.writeFileSync(path.join(output, 'certification.json'), JSON.stringify(certification, null, 2) + '\n');
console.log(JSON.stringify({ inputs: inputs.size, runs: runs.map(r => ({ id: r.id, exit: r.exit, classification: r.classification, findings: r.result?.findings })) }, null, 2));
