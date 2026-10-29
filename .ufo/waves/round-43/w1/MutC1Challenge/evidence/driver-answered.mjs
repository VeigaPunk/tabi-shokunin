// MutC1Challenge — answered-challenge driver.
// Spawns the counter with fd3/fd4 as pipes and answers the counter's fresh
// 32-byte challenge with an Ed25519 signature made by the SYNTHETIC wrapper
// private key (scratch only). The counter writes the challenge to fd3 and
// reads the signature from fd4; Node's extra-fd pipes are socketpairs, so
// the parent reads child.stdio[3] and writes child.stdio[4].
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

const argv = process.argv.slice(2);
const privPath = argv[argv.length - 1];
const counterPath = argv[0];
const receiptPath = argv[1];
const measurePath = argv[argv.indexOf('--measure') + 1];
const key = crypto.createPrivateKey(fs.readFileSync(privPath, 'utf8'));
const child = spawn(process.execPath, [counterPath, receiptPath, '--measure', measurePath], {
  stdio: ['ignore', 'inherit', 'inherit', 'pipe', 'pipe'],
});
const chunks = [];
child.stdio[3].on('data', (c) => chunks.push(c));
child.stdio[3].on('end', () => {
  const challenge = Buffer.concat(chunks);
  const sig = crypto.sign(null, challenge, key).toString('hex');
  child.stdio[4].write(sig);
  child.stdio[4].end();
});
child.on('exit', (c) => process.exit(c));
