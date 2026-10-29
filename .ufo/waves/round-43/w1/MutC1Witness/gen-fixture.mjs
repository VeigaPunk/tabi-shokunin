#!/usr/bin/env node
// Mutation-test fixture generator (scratch only, round-43 seat MutC1Witness).
// Builds a fully self-consistent receipt + witness + signed measure record so
// that EVERY counter clause passes under the frozen bytes EXCEPT the witness
// attestation signature check.
//
// mode 'honest' : witness attestation signed by the declared public key K1.
// mode 'forged' : witness attestation signed by a DIFFERENT key K2 while the
//                 declared publicKey (and the measure record's pubkeys.witness)
//                 stay K1 -> crypto.verify(K1) fails, everything else matches.
//
// The wrapper (run) keypair is written to the fixture dir so the runner can
// answer the counter's fresh fd3 challenge on fd4.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FIREFOX = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox';
const DRIVER = ROOT + '/scripts/playwright-firefox-egress-round43.mjs';
const WRAPPER = ROOT + '/scripts/measure-c1-round43.mjs';
const COUNTER_FROZEN = ROOT + '/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

const mode = process.argv[2];
const outDir = process.argv[3];
if (!['honest', 'forged', 'selfsigned', 'mismatchkey', 'badattestation', 'badover'].includes(mode) || !outDir) {
  console.error('usage: gen-fixture.mjs <honest|forged> <outdir>');
  process.exit(64);
}
fs.mkdirSync(outDir, { recursive: true });

const NODE_PID = 4242, FF_PID = 4343, ROOT_PID = 4141;
const nonce = crypto.randomBytes(32).toString('hex');
const { publicKey: k1Pub, privateKey: k1Priv } = crypto.generateKeyPairSync('ed25519');
const { publicKey: k2Pub, privateKey: k2Priv } = crypto.generateKeyPairSync('ed25519');
const { publicKey: runPub, privateKey: runPriv } = crypto.generateKeyPairSync('ed25519');
const k1Pem = k1Pub.export({ type: 'spki', format: 'pem' }).toString();

const firefoxExe = FIREFOX;
const baseMs = 1700000000000;
function buildRun(runIndex) {
  const samples = [];
  for (let i = 0; i < 10; i++) {
    samples.push({
      t: baseMs + i * 150,
      tTicks: 1000 + i * 10,
      ss: { ticks: 1, nonLoopback: 0, nonLoopbackRemotes: [], ssObs: 3 },
      proc: { ticks: 1, nonLoopback: 0, nonLoopbackRemotes: [], procObs: 2 },
      treePids: [{ pid: FF_PID, startTicks: 1000, exe: firefoxExe }],
    });
  }
  return {
    runIndex,
    runNonce: nonce,
    refused: false,
    runStartTicks: 1000,
    samples,
    finalSweep: {
      ss: { ticks: 1, nonLoopback: 0, nonLoopbackRemotes: [] },
      proc: { ticks: 1, nonLoopback: 0, nonLoopbackRemotes: [] },
    },
    owned: { nodePid: NODE_PID, roots: [{ exe: firefoxExe, startTicks: 1000 }] },
    survivors: 0,
    survivorPids: [],
    portClosed: true,
    browserVersion: 'Firefox 140.0',
    firstShotSha256: 'a'.repeat(64),
    sockets: {
      ss: { observations: 30, nonLoopback: 0 },
      proc: { observations: 20, nonLoopback: 0 },
    },
    egressNonLoopback: 0,
  };
}
const receipt = {
  schema: 'tabi-pw-firefox-egress-receipt-r43',
  runNonce: nonce,
  refused: false,
  envCheck: {
    procEnvironReadable: true,
    forbiddenNames: [],
    execArgvClean: true,
    envNonceEcho: 'match',
  },
  runs: [buildRun(0), buildRun(1)],
  binding: true,
  egressNonLoopback: 0,
};
const receiptRaw = JSON.stringify(receipt, null, 1) + '\n';
const receiptPath = path.join(outDir, 'receipt.json');
fs.writeFileSync(receiptPath, receiptRaw);
const receiptSha = sha256(receiptRaw);

// --- witness document ------------------------------------------------------
const wSamples = [];
for (let i = 0; i < 12; i++) {
  wSamples.push({
    t: baseMs + i * 120,
    tTicks: 1000 + i * 10,
    tree: [
      { pid: NODE_PID, ppid: 0, exe: '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node', startTicks: 1000, comm: 'node' },
      { pid: FF_PID, ppid: NODE_PID, exe: firefoxExe, startTicks: 1000, comm: 'firefox' },
    ],
  });
}
const witnessDoc = {
  schema: 'tabi-r43-witness',
  rootPid: ROOT_PID,
  nonce,
  startedTicks: 1000,
  endedTicks: 1200,
  samples: wSamples,
  environ: ['PATH', 'HOME', 'LANG'],
};
const signedForm = { rootPid: witnessDoc.rootPid, nonce: witnessDoc.nonce, startedTicks: witnessDoc.startedTicks, endedTicks: witnessDoc.endedTicks, samples: witnessDoc.samples };
const signedCanon = canonical(signedForm);
const signer = mode === 'honest' ? k1Priv : k2Priv;   // mismatchkey signs with K2 and declares K2
if (mode === 'badattestation') { /* attestation.value replaced by garbage below */ }
if (mode === 'selfsigned') { /* declared publicKey is the SIGNING key: fully self-consistent forgery */ }
const declaredPem = (mode === 'selfsigned' || mode === 'mismatchkey') ? k2Pub.export({ type: 'spki', format: 'pem' }).toString() : k1Pem;
const measureWitnessPem = mode === 'mismatchkey' ? k1Pem : declaredPem;
witnessDoc.attestation = {
  scheme: 'ed25519',
  publicKey: declaredPem,
  over: mode === 'badover' ? 'de'.repeat(64) : sha256(Buffer.from(signedCanon, 'utf8')),
  value: mode === 'badattestation'
    ? 'de'.repeat(64)
    : crypto.sign(null, Buffer.from(signedCanon, 'utf8'), signer).toString('hex'),
};
const witnessRaw = JSON.stringify(witnessDoc, null, 0) + '\n';
const witnessPath = path.join(outDir, 'receipt.witness.json');
fs.writeFileSync(witnessPath, witnessRaw);
const witnessSha = sha256(witnessRaw);

// --- signed measure record -------------------------------------------------
const measureRecord = {
  schema: 'tabi-r43-c1-measure-record',
  nonce,
  createdAt: new Date().toISOString(),
  pubkeys: { wrapper: runPub.export({ type: 'spki', format: 'pem' }).toString(), witness: measureWitnessPem },
  bindings: { receiptSha256: receiptSha, witnessSha256: witnessSha, runs: 2 },
  digests: {
    'scripts/playwright-firefox-egress-round43.mjs': sha256(fs.readFileSync(DRIVER)),
    'scripts/measure-c1-round43.mjs': sha256(fs.readFileSync(WRAPPER)),
    '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs': sha256(fs.readFileSync(COUNTER_FROZEN)),
  },
  gate: {
    self: { procEnvironReadable: true, forbiddenNames: [], execArgvClean: true },
    child: { ok: true, forbidden: [], readable: true },
  },
  elapsedMs: 60000,
  driverExit: 0,
};
const unsigned = canonical(measureRecord);
measureRecord.signature = {
  scheme: 'ed25519',
  over: sha256(Buffer.from(unsigned, 'utf8')),
  value: crypto.sign(null, Buffer.from(unsigned, 'utf8'), runPriv).toString('hex'),
};
const measureRaw = JSON.stringify(measureRecord, null, 1) + '\n';
const measurePath = path.join(outDir, 'measure.json');
fs.writeFileSync(measurePath, measureRaw);

fs.writeFileSync(path.join(outDir, 'run-private.pem'), runPriv.export({ type: 'pkcs8', format: 'pem' }).toString());
fs.writeFileSync(path.join(outDir, 'declared-witness-pub.pem'), k1Pem);
fs.writeFileSync(path.join(outDir, 'other-witness-pub.pem'), k2Pub.export({ type: 'spki', format: 'pem' }).toString());

console.log(JSON.stringify({
  mode,
  outDir,
  receiptPath,
  witnessPath,
  measurePath,
  receiptSha256: receiptSha,
  witnessSha256: witnessSha,
  measureSha256: sha256(measureRaw),
  declaredPubkeySha256: sha256(Buffer.from(k1Pem, 'utf8')),
  signingKeyIsDeclaredKey: mode === 'honest',
}, null, 1));
