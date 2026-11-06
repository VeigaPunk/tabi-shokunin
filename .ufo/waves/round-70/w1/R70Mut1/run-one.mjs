// One mutant per invocation: build isolated dir, mutate counter, run the battery COPY.
// The shared pristine copy is read-only here; each mutant dir holds its own counter+battery.
// argv: <mutantId>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = '/fast/scratch/hyaku/tabi-r70/R70Mut1';
const PRISTINE = path.join(ROOT, 's', 'check-synthtap-r70.mjs');
const PRISTINE_BATTERY = path.join(ROOT, 's', 'negatives-synthtap-r70.mjs');
const PIN = '704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577';
const REAL = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json';
const DEG = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-70/controls/c1-receipts';
const LAUNDERED = ['degenerate-js-click.json', 'degenerate-dispatch-mouse.json', 'degenerate-skip-touch.json'].map((f) => path.join(DEG, f));

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const id = process.argv[2];
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'mutants.json'), 'utf8')).find((m) => m.id === id);
if (!spec) { console.error('unknown mutant ' + id); process.exit(3); }

const pristine = fs.readFileSync(PRISTINE);
const beforeSha = sha(pristine);
const text = pristine.toString('utf8');
const hits = text.split(spec.find).length - 1;
if (hits !== 1) { console.log(JSON.stringify({ id, error: 'find-string occurrences=' + hits })); process.exit(3); }
const mutated = text.replace(spec.find, spec.repl);
const mutatedSha = sha(Buffer.from(mutated));
if (mutated === text) { console.log(JSON.stringify({ id, error: 'mutation not effective' })); process.exit(3); }

const dir = path.join(ROOT, 'm', id);
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const counter = path.join(dir, 'check-synthtap-r70.mjs');
const battery = path.join(dir, 'negatives-synthtap-r70.mjs');
fs.writeFileSync(counter, mutated);
const batteryBytes = fs.readFileSync(PRISTINE_BATTERY);
fs.writeFileSync(battery, batteryBytes);

const syn = spawnSync(process.execPath, ['--check', counter], { encoding: 'utf8' });
const work = path.join(ROOT, 'w', id);
fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(work, { recursive: true });
const args = [battery, '--real', REAL, '--expect-driver-sha256', PIN, '--work', work, '--json'];
for (const l of LAUNDERED) args.push('--laundered', l);
const t0 = Date.now();
const p = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 600000 });
const ms = Date.now() - t0;
fs.writeFileSync(path.join(ROOT, 'm', id + '.battery.json'), p.stdout || '');
let j = null; try { j = JSON.parse(p.stdout); } catch {}
const out = {
  id, line: spec.line, change: spec.desc, find: spec.find, repl: spec.repl,
  mutantSha256: mutatedSha, pristineSha256Before: beforeSha,
  diffLines: (() => { const a = text.split('\n'), b = mutated.split('\n'); let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; })(),
  syntax: syn.status === 0 ? 'ok' : 'FAIL:' + String(syn.stderr).slice(0, 300),
  batteryExit: p.status,
  batterySummary: j ? { positiveOk: j.positiveOk, cases: j.cases, ok: j.refusedForExpectedReason, failed: j.failed, coverageGap: j.coverageGap, allOk: j.allOk } : { unparsable: String(p.stdout).slice(0, 400) + String(p.stderr).slice(0, 400) },
  batteryCopySha256: sha(batteryBytes),
  ms,
  verdict: p.status === 1 ? 'killed' : p.status === 0 ? 'survived' : 'inconclusive',
};
// restoration evidence: the shared pristine copy must be byte-identical to what this run started from
const after = fs.readFileSync(PRISTINE);
out.pristineSha256After = sha(after);
out.pristineUntouched = after.equals(pristine);
if (!out.pristineUntouched) out.error = 'SHARED PRISTINE CHANGED';
fs.writeFileSync(path.join(ROOT, 'm', id + '.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ id, exit: p.status, verdict: out.verdict, failed: out.batterySummary.failed, untouched: out.pristineUntouched, diffLines: out.diffLines }));
