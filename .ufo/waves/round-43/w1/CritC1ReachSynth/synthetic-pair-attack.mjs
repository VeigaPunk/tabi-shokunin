import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';

const root = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const work = '/fast/scratch/hyaku/tabi-r43/CritC1ReachSynth';
const report = `${root}/.ufo/waves/round-43/w1/CritC1ReachSynth`;
const counterPath = `${root}/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`;
const claims = JSON.parse(fs.readFileSync(`${root}/.ufo/waves/round-43/claims.json`, 'utf8'));
const ff = claims.producerPins.firefoxBinPath;
const sha = (v) => crypto.createHash('sha256').update(v).digest('hex');
const canonical = (v) => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`;
};
const nonce = '4f'.repeat(32);
const wrapper = crypto.generateKeyPairSync('ed25519');
const witnessKey = crypto.generateKeyPairSync('ed25519');
const wrapperPrivPem = wrapper.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
fs.writeFileSync(`${work}/synthetic-wrapper-private.pem`, wrapperPrivPem, { mode: 0o600 });
const wrapperPubPem = wrapper.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const witnessPubPem = witnessKey.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const nodePid = 42423;
const firefoxPid = 42424;
const runStartTicks = 1000000;
const firstShotSha256 = '9a'.repeat(32);
const run = (runName) => {
  const samples = Array.from({ length: 12 }, (_, i) => ({
    t: 100000 + i * 100,
    tTicks: runStartTicks + 30 + i * 10,
    ss: { ticks: 1 + i, nonLoopback: 0, ssObs: 1 },
    proc: { ticks: 1 + i, nonLoopback: 0, procObs: 1 },
    treePids: [{ pid: firefoxPid, startTicks: runStartTicks + 1, exe: ff }],
  }));
  return {
    runName,
    runNonce: nonce,
    refused: false,
    runStartTicks,
    owned: { nodePid, roots: [{ pid: firefoxPid, startTicks: runStartTicks + 1, exe: ff }] },
    samples,
    finalSweep: { ss: { ticks: 1, nonLoopback: 0 }, proc: { ticks: 1, nonLoopback: 0 } },
    survivors: 0,
    survivorPids: [],
    portClosed: true,
    browserVersion: 'synthetic-fixture-version',
    firstShotSha256,
    sockets: {
      ss: { observations: samples.length, nonLoopback: 0 },
      proc: { observations: samples.length, nonLoopback: 0 },
    },
    egressNonLoopback: 0,
  };
};
const receipt = {
  schema: 'tabi-pw-firefox-egress-receipt-r43',
  runNonce: nonce,
  refused: false,
  envCheck: { procEnvironReadable: true, forbiddenNames: [], execArgvClean: true, envNonceEcho: 'match' },
  runs: [run('run1'), run('run2')],
  binding: true,
  egressNonLoopback: 0,
};
const receiptRaw = `${JSON.stringify(receipt, null, 1)}\n`;
fs.writeFileSync(`${work}/synthetic-receipt.json`, receiptRaw);
const witnessSamples = Array.from({ length: 12 }, (_, i) => ({
  t: 100000 + i * 100,
  tTicks: runStartTicks + 30 + i * 10,
  tree: [
    { pid: nodePid, ppid: 42420, startTicks: runStartTicks, exe: process.execPath, comm: 'node' },
    { pid: firefoxPid, ppid: nodePid, startTicks: runStartTicks + 1, exe: ff, comm: 'firefox' },
  ],
}));
const witnessUnsigned = {
  rootPid: 42421,
  nonce,
  startedTicks: runStartTicks,
  endedTicks: runStartTicks + 200,
  samples: witnessSamples,
};
const witnessSigned = canonical(witnessUnsigned);
const witness = {
  schema: 'tabi-r43-witness',
  ...witnessUnsigned,
  environ: [],
  attestation: {
    scheme: 'ed25519',
    publicKey: witnessPubPem,
    over: sha(witnessSigned),
    value: crypto.sign(null, Buffer.from(witnessSigned), witnessKey.privateKey).toString('hex'),
  },
};
const witnessRaw = `${JSON.stringify(witness)}\n`;
fs.writeFileSync(`${work}/synthetic-receipt.witness.json`, witnessRaw);
const digests = { ...claims.frozenDigests };
const measureUnsigned = {
  schema: 'tabi-r43-c1-measure-record',
  nonce,
  createdAt: '2026-10-29T00:00:00.000Z',
  pubkeys: { wrapper: wrapperPubPem, witness: witnessPubPem },
  bindings: {
    receiptSha256: sha(receiptRaw),
    witnessSha256: sha(witnessRaw),
    runs: 2,
  },
  digests,
  gate: {
    self: { forbiddenNames: [], execArgvClean: true },
    child: { ok: true },
  },
  elapsedMs: 10000,
  driverExit: 0,
};
const measureSigned = canonical(measureUnsigned);
const measure = {
  ...measureUnsigned,
  signature: {
    scheme: 'ed25519',
    over: sha(measureSigned),
    value: crypto.sign(null, Buffer.from(measureSigned), wrapper.privateKey).toString('hex'),
  },
};
fs.writeFileSync(`${work}/synthetic-measure.json`, `${JSON.stringify(measure, null, 1)}\n`);
fs.writeFileSync(`${work}/responder.mjs`, `import fs from 'node:fs'; import crypto from 'node:crypto'; const key=crypto.createPrivateKey(fs.readFileSync(process.argv[2],'utf8')); const chunks=[]; for await (const c of process.stdin) chunks.push(c); const challenge=Buffer.concat(chunks); process.stdout.write(crypto.sign(null,challenge,key).toString('hex')+'\\n');`);

async function attempt(mode) {
  const child = spawn(process.execPath, [counterPath, `${work}/synthetic-receipt.json`, '--measure', `${work}/synthetic-measure.json`], {
    cwd: root,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, LANG: process.env.LANG || 'C' },
    stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
  });
  let stdout = '', stderr = '';
  child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
  child.stdout.on('data', (d) => { stdout += d; });
  child.stderr.on('data', (d) => { stderr += d; });
  if (mode === 'paired-key-direct') {
    let challenge = Buffer.alloc(0);
    child.stdio[3].on('data', (d) => { challenge = Buffer.concat([challenge, d]); });
    child.stdio[3].on('end', () => {
      const answer = crypto.sign(null, challenge, wrapper.privateKey).toString('hex') + '\n';
      child.stdio[4].end(answer);
    });
  } else if (mode === 'second-process-pipe') {
    const responder = spawn(process.execPath, [`${work}/responder.mjs`, `${work}/synthetic-wrapper-private.pem`], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    child.stdio[3].pipe(responder.stdin);
    responder.stdout.pipe(child.stdio[4]);
    responder.stderr.on('data', (d) => { stderr += `responder: ${d}`; });
    responder.on('error', (e) => { stderr += `responder-error: ${e.message}`; });
  } else if (mode === 'precomputed-zero-challenge') {
    const precomputed = crypto.sign(null, Buffer.alloc(32), wrapper.privateKey).toString('hex') + '\n';
    child.stdio[3].once('data', () => child.stdio[4].end(precomputed));
  }
  const [code, signal] = await once(child, 'close');
  let parsed = null;
  try { parsed = JSON.parse(stdout); } catch { }
  const result = { mode, code, signal, stdout: parsed || stdout, stderr };
  return result;
}

const results = [];
for (const mode of ['paired-key-direct', 'second-process-pipe', 'precomputed-zero-challenge']) {
  results.push(await attempt(mode));
}
fs.writeFileSync(`${work}/attempt-results.json`, `${JSON.stringify(results, null, 2)}\n`);
for (const r of results) console.log(JSON.stringify(r));
const expectedDigests = {
  nodePath: process.execPath,
  nodeSha256: sha(fs.readFileSync(process.execPath)),
  firefoxSha256: sha(fs.readFileSync(ff)),
  driver: sha(fs.readFileSync(`${root}/scripts/playwright-firefox-egress-round43.mjs`)),
  wrapper: sha(fs.readFileSync(`${root}/scripts/measure-c1-round43.mjs`)),
  counter: sha(fs.readFileSync(counterPath)),
};
fs.writeFileSync(`${work}/local-digest-check.json`, `${JSON.stringify(expectedDigests, null, 2)}\n`);
