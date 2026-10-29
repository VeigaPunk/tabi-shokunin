#!/usr/bin/env node
// SCRATCH-ONLY mini wrapper for seat MutC1Nonce.
//
// Answers the counter's fd3/fd4 challenge-response with a scratch key, the
// same protocol the frozen wrapper (scripts/measure-c1-round43.mjs) uses:
// the counter writes 32 fresh challenge bytes to fd3 and the parent signs
// them with the run private half, writing the hex signature to fd4.
//
// This lets the counter's CHALLENGE layer pass in a scratch probe so that
// the ONLY remaining refusal layer is the one under test.
//
// usage: node mini-wrapper.mjs --dir <pair dir> --counter <counter path>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const dir = path.resolve(opt('--dir'));
const counter = path.resolve(opt('--counter'));

const priv = crypto.createPrivateKey(fs.readFileSync(path.join(dir, 'wrapper-private.pem'), 'utf8'));
const receipt = path.join(dir, 'receipt.json');
const measure = path.join(dir, 'measure.json');

const child = spawn(process.execPath, [counter, receipt, '--measure', measure], {
  cwd: dir, env: { PATH: process.env.PATH, HOME: process.env.HOME },
  stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
});
let outBuf = '', errBuf = '';
child.stdout.on('data', (d) => { outBuf += d; });
child.stderr.on('data', (d) => { errBuf += d; });
let challenge = Buffer.alloc(0);
child.stdio[3].on('data', (d) => { challenge = Buffer.concat([challenge, d]); });
child.stdio[3].on('end', () => {
  try {
    if (challenge.length === 32) {
      const sig = crypto.sign(null, challenge, priv);
      child.stdio[4].write(sig.toString('hex') + '\n');
    }
  } catch (e) { /* channel closed */ }
  try { child.stdio[4].end(); } catch { }
});
child.on('exit', (code) => {
  let parsed = null;
  try { parsed = JSON.parse(outBuf); } catch { }
  console.log(JSON.stringify({
    counter, exit: code,
    challengeBytes: challenge.length,
    stdout: parsed,
    stderr: errBuf.trim() || null,
  }, null, 2));
  process.exit(0);
});
