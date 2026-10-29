// MutC1Challenge — replica of the committed control's "synthetic" case.
// The committed control .ufo/waves/round-43/controls/c1-synthetic-refused.json records
// findings [run-set, witness-driver-unseen, witness-no-owned-firefox, witness-no-overlap,
// digest-mismatch:driver, digest-mismatch:counter, firefox-bin-unbound] with
// challengeVerified:false. Analysis of the frozen counter's clause code shows that set is
// reachable only with runs.length === 0 (an empty run array): with zero runs the per-run
// loop never emits 'owned-empty'/'root-exe', exes is empty -> 'firefox-bin-unbound', and
// runs[0].owned.nodePid is undefined -> nodePid falsy -> driverSamples 0 ->
// 'witness-driver-unseen'. This replica reproduces that shape with a self-signed
// measure record (so no 'measure-signature-invalid' / 'receipt-binding-mismatch'),
// matching the committed control's synthetic case minus the two byte-state-dependent
// digest-mismatch entries.
import fs from 'node:fs';
import crypto from 'node:crypto';

const S = '/fast/scratch/hyaku/tabi-r43/MutC1Challenge';
const L = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER_REL = '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';
const claims = JSON.parse(fs.readFileSync(`${L}/.ufo/waves/round-43/claims.json`, 'utf8'));
const sha = (v) => crypto.createHash('sha256').update(v).digest('hex');
const canonical = (v) => { if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  return `{${Object.keys(v).sort().map((k)=>`${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`; };

const key = crypto.createPrivateKey(fs.readFileSync(`${S}/in/synth-wrapper-private.pem`, 'utf8'));
const pubPem = crypto.createPublicKey(key).export({ type: 'spki', format: 'pem' }).toString();
const wkey = crypto.generateKeyPairSync('ed25519');
const wpubPem = wkey.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const nonce = '5a'.repeat(32);

// receipt with ZERO runs (the shape the committed control's finding set implies)
const receipt = {
  schema: 'tabi-pw-firefox-egress-receipt-r43',
  runNonce: nonce,
  refused: false,
  envCheck: { procEnvironReadable: true, forbiddenNames: [], execArgvClean: true, envNonceEcho: 'match' },
  runs: [],
  binding: true,
  egressNonLoopback: 0,
};
const receiptRaw = `${JSON.stringify(receipt, null, 1)}\n`;
fs.writeFileSync(`${S}/in/ctrl-receipt.json`, receiptRaw);

// witness with 12 samples, each carrying an empty tree: no firefox pids, no descendants
const wUnsigned = {
  rootPid: 42421, nonce, startedTicks: 1000000, endedTicks: 1000200,
  samples: Array.from({ length: 12 }, (_, i) => ({ t: 100000 + i * 100, tTicks: 1000000 + 30 + i * 10, tree: [] })),
};
const wSigned = canonical(wUnsigned);
const witness = {
  schema: 'tabi-r43-witness', ...wUnsigned, environ: [],
  attestation: { scheme: 'ed25519', publicKey: wpubPem, over: sha(wSigned),
    value: crypto.sign(null, Buffer.from(wSigned), wkey.privateKey).toString('hex') },
};
const witnessRaw = `${JSON.stringify(witness)}\n`;
fs.writeFileSync(`${S}/in/ctrl-receipt.witness.json`, witnessRaw);

// self-signed measure record; the counter digest is bound per arm
function mkMeasure(counterDigest, out) {
  const unsigned = {
    schema: 'tabi-r43-c1-measure-record', nonce, createdAt: '2026-10-29T00:00:00.000Z',
    pubkeys: { wrapper: pubPem, witness: wpubPem },
    bindings: { receiptSha256: sha(receiptRaw), witnessSha256: sha(witnessRaw), runs: 0 },
    digests: {
      'scripts/measure-c1-round43.mjs': claims.frozenDigests['scripts/measure-c1-round43.mjs'],
      'scripts/playwright-firefox-egress-round43.mjs': claims.frozenDigests['scripts/playwright-firefox-egress-round43.mjs'],
      [COUNTER_REL]: counterDigest,
    },
    gate: { self: { forbiddenNames: [], execArgvClean: true }, child: { ok: true } },
    elapsedMs: 20000, driverExit: 0,
  };
  const signed = canonical(unsigned);
  fs.writeFileSync(out, `${JSON.stringify({ ...unsigned, signature: { scheme: 'ed25519', over: sha(signed),
    value: crypto.sign(null, Buffer.from(signed), key).toString('hex') } }, null, 1)}\n`);
}
const pristineSha = sha(fs.readFileSync(`${S}/c1-signature-bound-v5.pristine.mjs`));
const mutantSha = sha(fs.readFileSync(`${S}/shadow-mutant/${COUNTER_REL}`));
mkMeasure(pristineSha, `${S}/in/ctrl-measure-pristine.json`);
mkMeasure(mutantSha, `${S}/in/ctrl-measure-mutant.json`);
console.log(JSON.stringify({ receiptSha256: sha(receiptRaw), witnessSha256: sha(witnessRaw),
  ctrlMeasurePristineSha256: sha(fs.readFileSync(`${S}/in/ctrl-measure-pristine.json`)),
  ctrlMeasureMutantSha256: sha(fs.readFileSync(`${S}/in/ctrl-measure-mutant.json`)) }, null, 1));
