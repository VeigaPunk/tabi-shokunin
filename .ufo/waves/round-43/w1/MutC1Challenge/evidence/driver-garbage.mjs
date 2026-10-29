// MutC1Challenge — garbage-answer driver.
// Answers the counter's fd3 challenge with a WELL-FORMED but WRONG 128-hex
// Ed25519 signature (signed over 32 zero bytes by a throwaway key). The
// counter's regex /^[0-9a-f]{128}$/ accepts it, so the counter reaches its
// crypto.verify() call and the verification result is False.
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';

const argv = process.argv.slice(2);
const counterPath = argv[0];
const receiptPath = argv[1];
const measurePath = argv[argv.indexOf('--measure') + 1];
const throwaway = crypto.generateKeyPairSync('ed25519');
const badSig = crypto.sign(null, Buffer.alloc(32), throwaway.privateKey).toString('hex');
const child = spawn(process.execPath, [counterPath, receiptPath, '--measure', measurePath], {
  stdio: ['ignore', 'inherit', 'inherit', 'pipe', 'pipe'],
});
const chunks = [];
child.stdio[3].on('data', (c) => chunks.push(c));
child.stdio[3].on('end', () => {
  child.stdio[4].write(badSig);
  child.stdio[4].end();
});
child.on('exit', (c) => process.exit(c));
