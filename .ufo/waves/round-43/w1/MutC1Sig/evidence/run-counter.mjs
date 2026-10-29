#!/usr/bin/env node
// SCRATCH-ONLY runner: invokes a counter copy the way the frozen wrapper does
// (strict argv <receipt.json> --measure <measure.json>, cwd = lane root, scrubbed
// env, fd3/fd4 pipes), optionally answering the in-invocation challenge with
// the synthetic pair's own ATTACKER key (the forgery path), or with no channel
// at all (direct offline invocation, as in the frozen controls).
//
// While the counter runs, a descendant census enumerates its children so the
// report can state, from evidence, that no browser process was spawned.
//
// usage: node run-counter.mjs --counter <path> --receipt <f> --measure <f>
//          [--answer <privatePem>] [--label <name>] [--nochan]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import crypto from 'node:crypto';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const counter = opt('--counter');
const receipt = opt('--receipt');
const measure = opt('--measure');
const answerKey = opt('--answer', null);
const label = opt('--label', 'run');
const nochan = args.includes('--nochan');

const child = spawn(process.execPath, [counter, receipt, '--measure', measure], {
  cwd: ROOT,
  stdio: nochan ? ['ignore', 'pipe', 'pipe', 'ignore', 'ignore'] : ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
  env: { PATH: process.env.PATH, HOME: process.env.HOME, LANG: process.env.LANG || 'C', TZ: process.env.TZ || 'UTC' },
});
let out = '', err = '';
child.stdout.on('data', (d) => { out += d; });
child.stderr.on('data', (d) => { err += d; });
let challenge = Buffer.alloc(0);
if (!nochan) {
  child.stdio[3].on('data', (d) => { challenge = Buffer.concat([challenge, d]); });
  child.stdio[3].on('end', () => {
    if (answerKey && challenge.length === 32) {
      try {
        const key = crypto.createPrivateKey(fs.readFileSync(answerKey));
        child.stdio[4].write(crypto.sign(null, challenge, key).toString('hex') + '\n');
      } catch { child.stdio[4].write('00'.repeat(64) + '\n'); }
    }
    try { child.stdio[4].end(); } catch { }
  });
}

// Descendant census of the counter process, sampled while it runs.
let maxDescendants = 0, censusSamples = 0;
const seenExes = new Set();
const census = setInterval(() => {
  censusSamples++;
  try {
    const kids = fs.readFileSync(`/proc/${child.pid}/task/${child.pid}/children`, 'utf8').trim().split(/\s+/).filter(Boolean);
    maxDescendants = Math.max(maxDescendants, kids.length);
    for (const k of kids) {
      try { seenExes.add(fs.readlinkSync(`/proc/${k}/exe`)); } catch { seenExes.add(`pid:${k}`); }
    }
  } catch { }
}, 10);

const code = await new Promise((r) => child.on('exit', (c) => r(c)));
clearInterval(census);

let parsed = null;
try { parsed = JSON.parse(out.trim()); } catch { }
console.log(JSON.stringify({
  label, counter, exit: code,
  challengeBytesSeen: challenge.length,
  descendantCensus: { samples: censusSamples, maxChildren: maxDescendants, childExes: [...seenExes] },
  counter: parsed ? {
    predicate: parsed.predicate, findings: parsed.findings,
    measureSignatureVerified: parsed.measureSignatureVerified,
    witnessAttestationVerified: parsed.witnessAttestationVerified,
    challengeVerified: parsed.challengeVerified, challengeError: parsed.challengeError,
  } : null,
  stdout: parsed ? undefined : out,
  stderr: err || undefined,
}, null, 1));
