#!/usr/bin/env node
// run-counter.mjs — invoke the FROZEN counter
//   .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
// exactly the way the frozen wrapper does: strict argv
//   <receipt.json> --measure <measure-record.json>
// with the fd3/fd4 challenge channel wired, answering the counter's fresh
// 32-byte challenge with the private half that signed the measure record.
//
// The counter is NEVER modified; it is invoked read-only from its committed
// path. Usage:
//   node run-counter.mjs <counterPath> <receipt.json> <measure.json> <privkeyPem>
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const [counterPath, receiptPath, measurePath, privKeyPath] = process.argv.slice(2);
const priv = crypto.createPrivateKey(fs.readFileSync(privKeyPath, 'utf8'));

const child = spawn(process.execPath, [counterPath, receiptPath, '--measure', measurePath], {
  cwd: '/home/vgpnk/Projects/shokunin/tabi-shokunin',
  stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
});
let out = '', err = '';
child.stdout.on('data', (d) => { out += d; });
child.stderr.on('data', (d) => { err += d; });

const chunks = [];
let answered = false;
function maybeAnswer() {
  if (answered) return;
  const buf = Buffer.concat(chunks);
  if (buf.length < 32) return;
  answered = true;
  try {
    const sig = crypto.sign(null, buf.subarray(0, 32), priv);
    child.stdio[4].write(sig.toString('hex') + '\n');
  } catch (e) { /* channel closed */ }
}
child.stdio[3].on('data', (d) => { chunks.push(d); maybeAnswer(); });
child.stdio[3].on('end', () => { maybeAnswer(); try { child.stdio[4].end(); } catch (e) { /* ignore */ } });

child.on('exit', (code) => {
  let parsed = null;
  try { parsed = JSON.parse(out.trim()); } catch (e) { /* unparseable */ }
  const summary = parsed ? {
    exit: code,
    predicate: parsed.predicate,
    findings: parsed.findings,
    egressDetail: parsed.egressDetail,
    challengeVerified: parsed.challengeVerified,
    challengeError: parsed.challengeError,
    measureSignatureVerified: parsed.measureSignatureVerified,
    witnessAttestationVerified: parsed.witnessAttestationVerified,
    receiptSha256: parsed.receiptSha256,
    schema: parsed.schema,
  } : { exit: code, stdout: out, stderr: err };
  console.log(JSON.stringify(summary, null, 1));
  process.exit(0);
});
