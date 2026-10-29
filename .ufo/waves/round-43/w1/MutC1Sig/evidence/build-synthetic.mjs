#!/usr/bin/env node
// SCRATCH-ONLY synthetic pair builder for the MutC1Sig mutation probe.
// Fabricates a receipt + witness + measure record that are internally
// self-consistent and signed with an ATTACKER-chosen Ed25519 key pair.
// NO browser is launched and NO lane byte is read-modify-written: the receipt
// data are fabricated, which is exactly what the mutation probe needs (the
// counter must refuse/accept on its own evidence checks, not on a browser run).
//
// usage: node build-synthetic.mjs --dir <outdir> --mode selfsigned|tampered \
//            [--counter <counter path whose digest is recorded in the record>]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FIREFOX = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const dir = path.resolve(opt('--dir'));
const mode = opt('--mode', 'selfsigned');
const counterPath = opt('--counter', ROOT + '/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs');

fs.mkdirSync(dir, { recursive: true });
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  const k = Object.keys(v).sort();
  return '{' + k.map((x) => JSON.stringify(x) + ':' + canonical(v[x])).join(',') + '}';
}

const nonce = crypto.randomBytes(32).toString('hex');
const nodePid = 4242, ffPid = 4243;
const runStartTicks = 1000000;
const base = Date.now() - 5000;
const shot = crypto.randomBytes(32).toString('hex');

// Attacker key pair (the "self-signed" identity of the synthetic pair).
const attacker = crypto.generateKeyPairSync('ed25519');
const attackerPubPem = attacker.publicKey.export({ type: 'spki', format: 'pem' }).toString();
fs.writeFileSync(path.join(dir, 'attacker-private.pem'), attacker.privateKey.export({ type: 'pkcs8', format: 'pem' }));
// Independent witness key pair (as the real witness child owns its own key).
const wkey = crypto.generateKeyPairSync('ed25519');
const witnessPubPem = wkey.publicKey.export({ type: 'spki', format: 'pem' }).toString();

const treePids = () => ([
  { pid: nodePid, ppid: 1, startTicks: runStartTicks - 20, exe: process.execPath, comm: 'node' },
  { pid: ffPid, ppid: nodePid, startTicks: runStartTicks + 5, exe: FIREFOX, comm: 'firefox' },
]);
const mkSample = (i, runIdx) => ({
  t: base + runIdx * 10000 + i * 200,
  tTicks: runStartTicks + i * 200,
  ss: { ticks: 5000000, lines: 3, nonLoopback: 0, ssObs: 3, nonLoopbackRemotes: [] },
  proc: { ticks: 5000000, inodes: 2, nonLoopback: 0, procObs: 2, nonLoopbackRemotes: [] },
  treePids: treePids(),
});

const mkRun = (runIdx) => {
  const samples = Array.from({ length: 8 }, (_, i) => mkSample(i, runIdx));
  const ssObs = samples.reduce((a, s) => a + s.ss.ssObs, 0);
  const procObs = samples.reduce((a, s) => a + s.proc.procObs, 0);
  return {
    name: `run${runIdx + 1}`, cmds: [], events: [], refused: false, refuseReason: null, runNonce: nonce,
    serverPort: 40000 + runIdx, runStartTicks, runEndTicks: runStartTicks + 1600, coverageMs: 1600, sampleCount: 8,
    samples,
    owned: { nodePid, selfStartTicks: runStartTicks - 20, roots: [{ pid: ffPid, startTicks: runStartTicks + 5, exe: FIREFOX, comm: 'firefox' }], source: 'synthetic' },
    browserVersion: 'Firefox 141.0', userAgent: 'synthetic',
    firstShotSha256: shot, firstShotBytes: 1234,
    finalSweep: {
      t: base + runIdx * 10000 + 1600, tTicks: runStartTicks + 1600,
      ss: { ticks: 5000000, lines: 3, nonLoopback: 0, ssObs: 3, nonLoopbackRemotes: [] },
      proc: { ticks: 5000000, inodes: 2, nonLoopback: 0, procObs: 2, nonLoopbackRemotes: [] },
      treePids: treePids(),
    },
    survivorPids: [], survivors: 0, portClosed: true,
    sockets: { ss: { observations: ssObs, nonLoopback: 0 }, proc: { observations: procObs, nonLoopback: 0 }, finalSweep: { ss: 3, proc: 2 } },
    egressNonLoopback: 0,
  };
};

const receipt = {
  schema: 'tabi-pw-firefox-egress-receipt-r43',
  generator: 'MutC1Sig scratch synthetic builder (no browser run)',
  runs: [mkRun(0), mkRun(1)],
  refused: false, binding: true, egressNonLoopback: 0, survivors: 0,
  browserVersion: 'Firefox 141.0', userAgent: 'synthetic', runNonce: nonce,
  envCheck: {
    procEnvironReadable: true, nameCount: 12, forbiddenNames: [], execArgv: [], execArgvClean: true, envNonceEcho: 'match',
    execPath: process.execPath, nodeSha256: sha256(fs.readFileSync(process.execPath)),
  },
};
const receiptRaw = JSON.stringify(receipt, null, 1) + '\n';
fs.writeFileSync(path.join(dir, 'receipt.json'), receiptRaw);

const witnessSamples = Array.from({ length: 12 }, (_, i) => ({
  t: base + i * 100, tTicks: runStartTicks + i * 20, tree: treePids(),
}));
const witnessDoc = {
  schema: 'tabi-r43-witness', rootPid: nodePid, nonce,
  startedTicks: runStartTicks - 30, endedTicks: runStartTicks + 1700,
  samples: witnessSamples, environ: [],
};
const signed = canonical({ rootPid: witnessDoc.rootPid, nonce: witnessDoc.nonce, startedTicks: witnessDoc.startedTicks, endedTicks: witnessDoc.endedTicks, samples: witnessDoc.samples });
witnessDoc.attestation = {
  scheme: 'ed25519',
  publicKey: witnessPubPem,
  over: sha256(Buffer.from(signed, 'utf8')),
  value: crypto.sign(null, Buffer.from(signed, 'utf8'), wkey.privateKey).toString('hex'),
};
const witnessRaw = JSON.stringify(witnessDoc, null, 1) + '\n';
fs.writeFileSync(path.join(dir, 'receipt.witness.json'), witnessRaw);

const measureRecord = {
  schema: 'tabi-r43-c1-measure-record',
  nonce,
  createdAt: new Date().toISOString(),
  pubkeys: { wrapper: attackerPubPem, witness: witnessPubPem },
  bindings: { receiptSha256: sha256(Buffer.from(receiptRaw, 'utf8')), witnessSha256: sha256(Buffer.from(witnessRaw, 'utf8')), runs: 2 },
  digests: {
    'scripts/playwright-firefox-egress-round43.mjs': sha256(fs.readFileSync(ROOT + '/scripts/playwright-firefox-egress-round43.mjs')),
    'scripts/measure-c1-round43.mjs': sha256(fs.readFileSync(ROOT + '/scripts/measure-c1-round43.mjs')),
    '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs': sha256(fs.readFileSync(counterPath)),
  },
  gate: {
    self: { readable: true, forbidden: [], forbiddenNames: [], execArgv: [], execArgvClean: true, ok: true },
    child: { self: { readable: true, forbidden: [] }, parent: { readable: true, forbidden: [] }, execArgvLen: 2, execArgvFlag: ['--eval'], execArgvClean: true, ok: true },
  },
  elapsedMs: 20000,
  driverExit: 0,
};
const unsigned = canonical(measureRecord);
measureRecord.signature = {
  scheme: 'ed25519',
  over: sha256(Buffer.from(unsigned, 'utf8')),
  value: crypto.sign(null, Buffer.from(unsigned, 'utf8'), attacker.privateKey).toString('hex'),
};

if (mode === 'tampered') {
  // One field changed after signing; the signature is NOT renewed (mirrors the
  // frozen relabel control: "same synthetic pair with one tampered field in the
  // measure record (signature not renewed)").
  measureRecord.createdAt = new Date(Date.parse(measureRecord.createdAt) + 60000).toISOString();
}
if (mode === 'nosig') {
  // Signature block removed entirely: the strongest form of "the signature
  // verify is skipped" probe (the frozen bytes must refuse it as
  // measure-signature-invalid).
  delete measureRecord.signature;
}

const measureRaw = JSON.stringify(measureRecord, null, 1) + '\n';
fs.writeFileSync(path.join(dir, 'measure.json'), measureRaw);

console.log(JSON.stringify({
  dir, mode, nonce,
  receipt: path.join(dir, 'receipt.json'),
  witness: path.join(dir, 'receipt.witness.json'),
  measure: path.join(dir, 'measure.json'),
  receiptSha256: sha256(Buffer.from(receiptRaw, 'utf8')),
  witnessSha256: sha256(Buffer.from(witnessRaw, 'utf8')),
  attackerPublicKeyPem: attackerPubPem,
}, null, 1));
