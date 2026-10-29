// MutC1Challenge — scratch harness (never writes to the lane tree).
//
// Builds:
//   * a SYNTHETIC SELF-SIGNED pair (receipt + witness + Ed25519 self-signed
//     measure record) that satisfies EVERY clause of the frozen counter
//     except the in-invocation challenge, so the challenge clause is the
//     sole reason a direct (no-fd) invocation is refused;
//   * three SHADOW trees (scratch copies of the lane ROOT) so the counter
//     under test is byte-consistent with the claims pin that governs it:
//       shadow-pristine      — pristine counter, claims byte-identical to lane
//       shadow-mutant        — mutant counter,   claims pin re-pointed at the
//                             mutant digest (so the self-digest clause does
//                             not mask the challenge clause)
//       shadow-mutant-frozen — mutant counter, claims byte-identical to lane
//                             (shows the self-digest mask that the frozen
//                             pin imposes on any mutated copy)
import fs from 'node:fs';
import crypto from 'node:crypto';

const S = '/fast/scratch/hyaku/tabi-r43/MutC1Challenge';
const L = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER_REL = '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';
const claimsRaw = fs.readFileSync(`${L}/.ufo/waves/round-43/claims.json`, 'utf8');
const claims = JSON.parse(claimsRaw);
const ff = claims.producerPins.firefoxBinPath;
const sha = (v) => crypto.createHash('sha256').update(v).digest('hex');
const canonical = (v) => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`;
};

// ---- self-signed ephemeral keys (scratch only) ------------------------------
const wrapper = crypto.generateKeyPairSync('ed25519');
const witnessKey = crypto.generateKeyPairSync('ed25519');
const wrapperPubPem = wrapper.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const witnessPubPem = witnessKey.publicKey.export({ type: 'spki', format: 'pem' }).toString();
fs.writeFileSync(`${S}/in/synth-wrapper-private.pem`,
  wrapper.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(), { mode: 0o600 });

const nonce = '7c'.repeat(32);
const nodePid = 73115;
const ffPid = 73116;
const runStartTicks = 2400000;
const shot = 'b3'.repeat(32);
const samplesPerRun = 12;

const mkRun = (label) => {
  const samples = Array.from({ length: samplesPerRun }, (_, i) => ({
    t: 400000 + i * 120,
    tTicks: runStartTicks + 120 + i * 12,
    ss: { ticks: 40 + i, nonLoopback: 0, ssObs: 1 },
    proc: { ticks: 40 + i, nonLoopback: 0, procObs: 1 },
    treePids: [{ pid: ffPid, startTicks: runStartTicks + 4, exe: ff }],
  }));
  return {
    runName: label,
    runNonce: nonce,
    refused: false,
    runStartTicks,
    owned: { nodePid, roots: [{ pid: ffPid, startTicks: runStartTicks + 4, exe: ff }] },
    samples,
    finalSweep: { ss: { ticks: 60, nonLoopback: 0 }, proc: { ticks: 60, nonLoopback: 0 } },
    survivors: 0,
    survivorPids: [],
    portClosed: true,
    browserVersion: 'synthetic-fixture-160.0',
    firstShotSha256: shot,
    sockets: { ss: { observations: samplesPerRun, nonLoopback: 0 }, proc: { observations: samplesPerRun, nonLoopback: 0 } },
    egressNonLoopback: 0,
  };
};

const receipt = {
  schema: 'tabi-pw-firefox-egress-receipt-r43',
  runNonce: nonce,
  refused: false,
  envCheck: { procEnvironReadable: true, forbiddenNames: [], execArgvClean: true, envNonceEcho: 'match' },
  runs: [mkRun('run1'), mkRun('run2')],
  binding: true,
  egressNonLoopback: 0,
};
const receiptRaw = `${JSON.stringify(receipt, null, 1)}\n`;
fs.writeFileSync(`${S}/in/synth-receipt.json`, receiptRaw);

const witnessSamples = Array.from({ length: 12 }, (_, i) => ({
  t: 400000 + i * 120,
  tTicks: runStartTicks + 120 + i * 12,
  tree: [
    { pid: nodePid, ppid: nodePid - 1, startTicks: runStartTicks, exe: process.execPath, comm: 'node' },
    { pid: ffPid, ppid: nodePid, startTicks: runStartTicks + 4, exe: ff, comm: 'firefox' },
  ],
}));
const witnessUnsigned = {
  rootPid: nodePid - 1,
  nonce,
  startedTicks: runStartTicks,
  endedTicks: runStartTicks + 400,
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
fs.writeFileSync(`${S}/in/synth-receipt.witness.json`, witnessRaw);

// ---- measure records --------------------------------------------------------
function mkMeasure(counterDigest, outFile, tamper) {
  const unsigned = {
    schema: 'tabi-r43-c1-measure-record',
    nonce,
    createdAt: '2026-10-29T00:00:00.000Z',
    pubkeys: { wrapper: wrapperPubPem, witness: witnessPubPem },
    bindings: { receiptSha256: sha(receiptRaw), witnessSha256: sha(witnessRaw), runs: 2 },
    digests: {
      'scripts/measure-c1-round43.mjs': claims.frozenDigests['scripts/measure-c1-round43.mjs'],
      'scripts/playwright-firefox-egress-round43.mjs': claims.frozenDigests['scripts/playwright-firefox-egress-round43.mjs'],
      [COUNTER_REL]: counterDigest,
    },
    gate: { self: { forbiddenNames: [], execArgvClean: true }, child: { ok: true } },
    elapsedMs: 20000,
    driverExit: 0,
  };
  const signed = canonical(unsigned);
  const doc = {
    ...unsigned,
    signature: {
      scheme: 'ed25519',
      over: sha(signed),
      value: crypto.sign(null, Buffer.from(signed), wrapper.privateKey).toString('hex'),
    },
  };
  if (tamper) doc.bindings.receiptSha256 = sha(`tampered-${tamper}`); // signature NOT renewed
  fs.writeFileSync(outFile, `${JSON.stringify(doc, null, 1)}\n`);
}

const pristineSha = sha(fs.readFileSync(`${S}/c1-signature-bound-v5.pristine.mjs`));
const mutantSha = sha(fs.readFileSync(`${S}/c1-signature-bound-v5.mutant.mjs`));
mkMeasure(pristineSha, `${S}/in/synth-measure-pristine.json`);
mkMeasure(mutantSha, `${S}/in/synth-measure-mutant.json`);
mkMeasure(pristineSha, `${S}/in/synth-measure-tampered-pristine.json`, 'pristine');
mkMeasure(mutantSha, `${S}/in/synth-measure-tampered-mutant.json`, 'mutant');

// ---- replay control inputs (committed r42 receipt + committed r41 record) ---
fs.copyFileSync(`${L}/corpus/evidence/round42/playwright-egress/receipt.json`, `${S}/in/r42-receipt.json`);
fs.copyFileSync(`${L}/corpus/evidence/round42/playwright-egress/receipt.witness.json`, `${S}/in/r42-receipt.witness.json`);
fs.copyFileSync(`${L}/.ufo/waves/round-41/measure/c1-measure.json`, `${S}/in/r41-measure.json`);

// ---- shadow trees ------------------------------------------------------------
function mkShadow(dir, counterFile, claimsText) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(`${dir}/.ufo/waves/round-43/counters`, { recursive: true });
  fs.mkdirSync(`${dir}/scripts`, { recursive: true });
  fs.copyFileSync(`${L}/scripts/measure-c1-round43.mjs`, `${dir}/scripts/measure-c1-round43.mjs`);
  fs.copyFileSync(`${L}/scripts/playwright-firefox-egress-round43.mjs`, `${dir}/scripts/playwright-firefox-egress-round43.mjs`);
  fs.copyFileSync(counterFile, `${dir}/${COUNTER_REL}`);
  fs.writeFileSync(`${dir}/.ufo/waves/round-43/claims.json`, claimsText);
}
const mutantClaims = JSON.parse(claimsRaw);
mutantClaims.frozenDigests[COUNTER_REL] = mutantSha;
mkShadow(`${S}/shadow-pristine`, `${S}/c1-signature-bound-v5.pristine.mjs`, claimsRaw);
mkShadow(`${S}/shadow-mutant`, `${S}/c1-signature-bound-v5.mutant.mjs`, `${JSON.stringify(mutantClaims, null, 1)}\n`);
mkShadow(`${S}/shadow-mutant-frozen`, `${S}/c1-signature-bound-v5.mutant.mjs`, claimsRaw);

console.log(JSON.stringify({
  pristineSha,
  mutantSha,
  laneClaimsSha256: sha(claimsRaw),
  receiptSha256: sha(receiptRaw),
  witnessSha256: sha(witnessRaw),
  measurePristineSha256: sha(fs.readFileSync(`${S}/in/synth-measure-pristine.json`)),
  measureMutantSha256: sha(fs.readFileSync(`${S}/in/synth-measure-mutant.json`)),
  measureTamperedPristineSha256: sha(fs.readFileSync(`${S}/in/synth-measure-tampered-pristine.json`)),
  measureTamperedMutantSha256: sha(fs.readFileSync(`${S}/in/synth-measure-tampered-mutant.json`)),
  r42ReceiptSha256: sha(fs.readFileSync(`${S}/in/r42-receipt.json`)),
  r42WitnessSha256: sha(fs.readFileSync(`${S}/in/r42-receipt.witness.json`)),
  r41MeasureSha256: sha(fs.readFileSync(`${S}/in/r41-measure.json`)),
  shadowPristineCounterSha256: sha(fs.readFileSync(`${S}/shadow-pristine/${COUNTER_REL}`)),
  shadowMutantCounterSha256: sha(fs.readFileSync(`${S}/shadow-mutant/${COUNTER_REL}`)),
  shadowMutantFrozenCounterSha256: sha(fs.readFileSync(`${S}/shadow-mutant-frozen/${COUNTER_REL}`)),
  firefoxBinSha256: sha(fs.readFileSync(ff)),
  nodeSha256: sha(fs.readFileSync(process.execPath)),
  driverSha256: sha(fs.readFileSync(`${L}/scripts/playwright-firefox-egress-round43.mjs`)),
  wrapperSha256: sha(fs.readFileSync(`${L}/scripts/measure-c1-round43.mjs`)),
}, null, 1));
