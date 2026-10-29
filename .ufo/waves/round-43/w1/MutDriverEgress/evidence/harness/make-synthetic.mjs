#!/usr/bin/env node
// make-synthetic.mjs <outPrefix>
//
// Builds a FULLY SYNTHETIC receipt+witness+measure triple from scratch —
// no committed bytes, no browser run — and answers the counter's challenge
// with a freshly minted per-invocation Ed25519 key.
//
// Purpose: to measure precisely WHICH counter clauses a browser-free
// synthetic pair can satisfy, so that the isolation results for the
// egress-count clause are interpreted correctly (does the counter admit a
// fully synthetic pair at all, or is it held back by a clause that is
// independent of the receipt content?).
//
// Every field is fabricated. The tree pids/exe/startTicks are invented and
// internally consistent with each other; the witness attests over the
// invented tree with its own key; the measure record binds the fabricated
// receipt and witness bytes with a third key that also answers the
// challenge.
import fs from 'node:fs';
import crypto from 'node:crypto';

const out = process.argv[2];
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  return '{' + Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',') + '}';
}

const FIREFOX = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox';
const NODE_PID = 900001;         // the fabricated "driver" process
const BASE_TICKS = 40000000;     // fabricated startTicks (jiffies)
const NOW = Date.now();

// --- fabricated owned process tree ----------------------------------------
const ffPids = [];
const tree = [{ pid: NODE_PID, ppid: 1, startTicks: BASE_TICKS, exe: '/usr/bin/node', comm: 'node' }];
for (let i = 0; i < 4; i += 1) {
  const pid = 910000 + i;
  ffPids.push(pid);
  tree.push({ pid, ppid: NODE_PID, startTicks: BASE_TICKS + 10 + i, exe: FIREFOX, comm: 'firefox' });
}

// --- fabricated receipt ----------------------------------------------------
const shot = sha256('synthetic-shot');
const samples = [];
for (let i = 0; i < 10; i += 1) {
  const t = NOW - 4000 + i * 150;
  samples.push({
    t,
    tTicks: BASE_TICKS + 100 + i,
    ss: { ticks: 1, lines: 1, nonLoopback: 0, ssObs: 1, nonLoopbackRemotes: [] },
    proc: { ticks: 1, inodes: 1, nonLoopback: 0, procObs: 1, nonLoopbackRemotes: [] },
    treePids: tree.map((x) => ({ ...x })),
  });
}
const finalSweep = {
  t: NOW, tTicks: BASE_TICKS + 200,
  ss: { ticks: 1, lines: 0, nonLoopback: 0, ssObs: 0, nonLoopbackRemotes: [] },
  proc: { ticks: 1, inodes: 0, nonLoopback: 0, procObs: 0, nonLoopbackRemotes: [] },
  treePids: tree.map((x) => ({ ...x })),
};
const runNonce = crypto.randomBytes(32).toString('hex');
const mkRun = (name) => ({
  name, cmds: [], events: [], refused: false, refuseReason: null, runNonce,
  serverPort: 1,
  runStartTicks: BASE_TICKS,
  owned: {
    nodePid: NODE_PID,
    selfStartTicks: BASE_TICKS,
    roots: [{ pid: ffPids[0], startTicks: BASE_TICKS + 10, exe: FIREFOX, comm: 'firefox' }],
    source: 'synthetic',
  },
  samples: samples.map((s) => ({ ...s })),
  finalSweep: { ...finalSweep, treePids: finalSweep.treePids.map((x) => ({ ...x })) },
  survivorPids: [], survivors: 0, portClosed: true,
  browserVersion: '157.0',
  firstShotSha256: shot, firstShotBytes: 100,
  sockets: { ss: { observations: 10, nonLoopback: 0 }, proc: { observations: 10, nonLoopback: 0 }, finalSweep: { ss: 0, proc: 0 } },
  egressNonLoopback: 0,
});
const receipt = {
  schema: 'tabi-pw-firefox-egress-receipt-r43',
  driver: 'scripts/playwright-firefox-egress-round43.mjs',
  measuredAt: new Date().toISOString(),
  playwrightVersion: '1.64.0',
  fixture: { sha256: sha256('synthetic-fixture'), bytes: 1 },
  envCheck: {
    procEnvironReadable: true, nameCount: 10, forbiddenNames: [], execArgv: [],
    execArgvClean: true, envNonceEcho: 'match',
  },
  runNonce,
  runs: [mkRun('run1'), mkRun('run2')],
  refused: false, binding: true,
  egressNonLoopback: 0, survivors: 0,
  browserVersion: '157.0',
  userAgent: 'synthetic',
};
const receiptRaw = JSON.stringify(receipt, null, 1) + '\n';
fs.writeFileSync(`${out}.receipt.json`, receiptRaw);

// --- fabricated witness ----------------------------------------------------
const { publicKey: wPub, privateKey: wPriv } = crypto.generateKeyPairSync('ed25519');
const wsamples = [];
for (let i = 0; i < 12; i += 1) {
  wsamples.push({ t: NOW - 4000 + i * 150, tTicks: BASE_TICKS + 100 + i, tree: tree.map((x) => ({ ...x })) });
}
const wdoc = {
  schema: 'tabi-r43-witness',
  rootPid: 1,
  nonce: runNonce,
  startedTicks: BASE_TICKS,
  endedTicks: BASE_TICKS + 300,
  samples: wsamples,
  environ: ['PATH', 'HOME'],
};
const wsigned = { rootPid: wdoc.rootPid, nonce: wdoc.nonce, startedTicks: wdoc.startedTicks, endedTicks: wdoc.endedTicks, samples: wdoc.samples };
wdoc.attestation = {
  scheme: 'ed25519',
  publicKey: wPub.export({ type: 'spki', format: 'pem' }).toString(),
  over: sha256(Buffer.from(canonical(wsigned), 'utf8')),
  value: crypto.sign(null, Buffer.from(canonical(wsigned), 'utf8'), wPriv).toString('hex'),
};
const witnessRaw = JSON.stringify(wdoc, null, 1) + '\n';
fs.writeFileSync(`${out}.receipt.witness.json`, witnessRaw);

// --- fabricated measure record + the key that answers the challenge --------
const { publicKey: mPub, privateKey: mPriv } = crypto.generateKeyPairSync('ed25519');
const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const claims = JSON.parse(fs.readFileSync(`${ROOT}/.ufo/waves/round-43/claims.json`, 'utf8'));
const spanSum = receipt.runs.reduce((a, r) => a + (r.samples.at(-1).t - r.samples[0].t), 0);
const mrec = {
  schema: 'tabi-r43-c1-measure-record',
  nonce: runNonce,
  createdAt: new Date().toISOString(),
  pubkeys: { wrapper: mPub.export({ type: 'spki', format: 'pem' }).toString(), witness: wdoc.attestation.publicKey },
  bindings: { receiptSha256: sha256(receiptRaw), witnessSha256: sha256(witnessRaw), runs: 2 },
  digests: {
    'scripts/measure-c1-round43.mjs': sha256(fs.readFileSync(`${ROOT}/scripts/measure-c1-round43.mjs`)),
    'scripts/playwright-firefox-egress-round43.mjs': sha256(fs.readFileSync(`${ROOT}/scripts/playwright-firefox-egress-round43.mjs`)),
    '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs': sha256(fs.readFileSync(`${ROOT}/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`)),
  },
  gate: {
    self: { forbiddenNames: [], execArgvClean: true },
    child: { ok: true },
  },
  elapsedMs: spanSum + 500,
  driverExit: 0,
};
const unsigned = canonical(mrec);
mrec.signature = {
  scheme: 'ed25519',
  over: sha256(Buffer.from(unsigned, 'utf8')),
  value: crypto.sign(null, Buffer.from(unsigned, 'utf8'), mPriv).toString('hex'),
};
fs.writeFileSync(`${out}.measure.json`, JSON.stringify(mrec, null, 1) + '\n');
fs.writeFileSync(`${out}.measure.json.privkey`, mPriv.export({ type: 'pkcs8', format: 'pem' }).toString());
console.log(JSON.stringify({
  receipt: `${out}.receipt.json`, witness: `${out}.receipt.witness.json`, measure: `${out}.measure.json`,
  receiptSha256: sha256(receiptRaw), nonce: runNonce, spanSum,
  note: 'fully synthetic: no committed bytes, no browser run',
}, null, 1));
