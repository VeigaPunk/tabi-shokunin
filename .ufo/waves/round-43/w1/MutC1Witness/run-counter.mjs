#!/usr/bin/env node
// Runs a counter binary against a fixture dir, answering the counter's fresh
// fd3 challenge on fd4 with the fixture's wrapper (run) private key -- i.e.
// exactly the channel the real wrapper scripts/measure-c1-round43.mjs uses.
// Usage: run-counter.mjs <counter.mjs> <fixtureDir> <label>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const NODE = '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node';
const counterPath = process.argv[2];
const fixtureDir = process.argv[3];
const label = process.argv[4] || path.basename(fixtureDir);

const privPem = fs.readFileSync(path.join(fixtureDir, 'run-private.pem'), 'utf8');
const runPriv = crypto.createPrivateKey(privPem);
const receipt = path.join(fixtureDir, 'receipt.json');
const measure = path.join(fixtureDir, 'measure.json');

const result = await new Promise((resolve) => {
  const child = spawn(NODE, [counterPath, receipt, '--measure', measure], {
    cwd: fixtureDir,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, LANG: 'C.UTF-8' },
    stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
  });
  let outBuf = '', errBuf = '';
  let challenge = Buffer.alloc(0);
  child.stdout.on('data', (d) => { outBuf += d; });
  child.stderr.on('data', (d) => { errBuf += d; });
  child.stdio[3].on('data', (d) => { challenge = Buffer.concat([challenge, d]); });
  child.stdio[3].on('end', () => {
    try {
      if (challenge.length === 32) {
        const sig = crypto.sign(null, challenge, runPriv);
        child.stdio[4].write(sig.toString('hex') + '\n');
      }
    } catch (e) { child.stdio[4].write('deadbeef\n'); }
    try { child.stdio[4].end(); } catch { }
  });
  child.on('exit', (code) => resolve({ code, outBuf, errBuf }));
});

let counter = null;
try { counter = JSON.parse(result.outBuf.trim()); } catch { }
console.log(JSON.stringify({
  label,
  counterPath,
  counterSha256: crypto.createHash('sha256').update(fs.readFileSync(counterPath)).digest('hex'),
  exit: result.code,
  stdout: result.outBuf.trim(),
  stderr: result.errBuf.trim(),
  counter,
}, null, 1));
process.exit(result.code === 0 ? 0 : 0);
