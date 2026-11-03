#!/usr/bin/env node
// R58Sentinel probe: prove the r58 counter READS the driver only as BYTES
// (sha256) and NEVER EXECUTES it, and that it refuses a receipt whose
// driverSha256 does not match the pin.
//
// Method (runtime, not just static):
//   * a scratch "driver" file is a valid ES module whose top-level code
//     WRITES A MARKER FILE and prints to stdout. If the counter ever
//     imports/executes/spawns the driver, the marker appears.
//   * a scratch receipt whose driverSha256 is the WRONG digest must be
//     refused with driver-sha-mismatch under --expect-driver-sha256.
//
// Usage: node counter-driver-exec-probe.mjs <counter.mjs> <r57receipt.json> <scratchAbs>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const counter = process.argv[2];
const r57Receipt = process.argv[3];
const scratch = process.argv[4];
const out = { schema: 'r58sentinel-counter-driver-exec-v1', checks: [], findings: [] };
const add = (id, ok, detail) => { out.checks.push({ id, ok: !!ok, detail: String(detail) }); if (!ok) out.findings.push({ id, detail: String(detail) }); };

fs.mkdirSync(scratch, { recursive: true });
const marker = path.join(scratch, 'DRIVER-WAS-EXECUTED.marker');
try { fs.rmSync(marker, { force: true }); } catch {}

// 1. the trap driver: valid ESM, its top level writes the marker
const trapDriver = path.join(scratch, 'trap-driver.mjs');
const trapSrc = `import fs from 'node:fs';\nfs.writeFileSync(${JSON.stringify(marker)}, 'executed at ' + new Date().toISOString());\nprocess.stdout.write('TRAP-DRIVER-RAN\\n');\nexport const FIXTURE_DRIVER = 'trap';\n`;
fs.writeFileSync(trapDriver, trapSrc);
const trapSha = crypto.createHash('sha256').update(fs.readFileSync(trapDriver)).digest('hex');

// 2. a receipt that claims a driverSha256 that does NOT match the trap driver
const rec = JSON.parse(fs.readFileSync(r57Receipt, 'utf8'));
const wrongSha = '0'.repeat(64);
const wrongReceipt = path.join(scratch, 'receipt-wrong-sha.json');
const mutated = JSON.parse(JSON.stringify(rec));
mutated.driverSha256 = wrongSha;
fs.writeFileSync(wrongReceipt, JSON.stringify(mutated, null, 1));

const res = spawnSync('node', [counter, wrongReceipt, '--driver', trapDriver, '--expect-driver-sha256', trapSha, '--json'], { encoding: 'utf8', timeout: 60000, cwd: scratch });
out.exitCode = res.status;
out.stdout = String(res.stdout || '').slice(0, 6000);
out.stderr = String(res.stderr || '').slice(0, 2000);

// parse the counter's JSON verdict
let verdict = null;
try { verdict = JSON.parse(res.stdout); } catch { /* not json */ }
out.parsed = !!verdict;
if (verdict) {
  out.findingsFromCounter = verdict.findings || null;
  out.couldNotEvaluate = verdict.couldNotEvaluate || null;
  out.predicate = verdict.predicate;
  const ids = (verdict.findings || []).map((f) => f.id);
  out.findingIds = ids;
  // the sha pin must refuse
  add('counter-refuses-wrong-driver-sha', ids.includes('driver-sha-mismatch'), 'findings=' + JSON.stringify(ids));
  // and the verdict must be red
  add('counter-verdict-red-on-wrong-sha', verdict.predicate === false, 'predicate=' + verdict.predicate);
}

// the marker must NOT exist: the driver was never executed
const executed = fs.existsSync(marker);
out.driverExecuted = executed;
add('counter-never-executes-the-driver', !executed, executed ? 'MARKER PRESENT at ' + marker : 'no marker: the driver was read as bytes only');

out.findingCount = out.findings.length;
out.predicate = out.findingCount === 0;
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
