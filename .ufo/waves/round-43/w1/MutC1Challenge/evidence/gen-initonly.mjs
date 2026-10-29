import fs from 'node:fs';
import crypto from 'node:crypto';
const S = '/fast/scratch/hyaku/tabi-r43/MutC1Challenge';
const L = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER_REL = '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';
const claimsRaw = fs.readFileSync(`${L}/.ufo/waves/round-43/claims.json`, 'utf8');
const claims = JSON.parse(claimsRaw);
const sha = (v) => crypto.createHash('sha256').update(v).digest('hex');
const canonical = (v) => { if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  return `{${Object.keys(v).sort().map((k)=>`${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`; };
const initSha = sha(fs.readFileSync(`${S}/c1-signature-bound-v5.mutant-initonly.mjs`));
// measure record variant bound to the init-only mutant digest, reusing the synthetic keypair
const witness = JSON.parse(fs.readFileSync(`${S}/in/synth-receipt.witness.json`, 'utf8'));
const receiptRaw = fs.readFileSync(`${S}/in/synth-receipt.json`, 'utf8');
const wrapperPubPem = JSON.parse(fs.readFileSync(`${S}/in/synth-measure-pristine.json`, 'utf8')).pubkeys.wrapper;
const unsigned = {
  schema: 'tabi-r43-c1-measure-record',
  nonce: '7c'.repeat(32),
  createdAt: '2026-10-29T00:00:00.000Z',
  pubkeys: { wrapper: wrapperPubPem, witness: witness.attestation.publicKey },
  bindings: { receiptSha256: sha(receiptRaw), witnessSha256: sha(fs.readFileSync(`${S}/in/synth-receipt.witness.json`)), runs: 2 },
  digests: {
    'scripts/measure-c1-round43.mjs': claims.frozenDigests['scripts/measure-c1-round43.mjs'],
    'scripts/playwright-firefox-egress-round43.mjs': claims.frozenDigests['scripts/playwright-firefox-egress-round43.mjs'],
    [COUNTER_REL]: initSha,
  },
  gate: { self: { forbiddenNames: [], execArgvClean: true }, child: { ok: true } },
  elapsedMs: 20000,
  driverExit: 0,
};
// re-sign with the synthetic wrapper key: recover it from the private pem
const key = crypto.createPrivateKey(fs.readFileSync(`${S}/in/synth-wrapper-private.pem`, 'utf8'));
const signed = canonical(unsigned);
const doc = { ...unsigned, signature: { scheme: 'ed25519', over: sha(signed), value: crypto.sign(null, Buffer.from(signed), key).toString('hex') } };
fs.writeFileSync(`${S}/in/synth-measure-initonly.json`, `${JSON.stringify(doc, null, 1)}\n`);
// shadow
const dir = `${S}/shadow-initonly`;
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(`${dir}/.ufo/waves/round-43/counters`, { recursive: true });
fs.mkdirSync(`${dir}/scripts`, { recursive: true });
fs.copyFileSync(`${L}/scripts/measure-c1-round43.mjs`, `${dir}/scripts/measure-c1-round43.mjs`);
fs.copyFileSync(`${L}/scripts/playwright-firefox-egress-round43.mjs`, `${dir}/scripts/playwright-firefox-egress-round43.mjs`);
fs.copyFileSync(`${S}/c1-signature-bound-v5.mutant-initonly.mjs`, `${dir}/${COUNTER_REL}`);
const d = JSON.parse(claimsRaw); d.frozenDigests[COUNTER_REL] = initSha;
fs.writeFileSync(`${dir}/.ufo/waves/round-43/claims.json`, `${JSON.stringify(d, null, 1)}\n`);
console.log(JSON.stringify({ initSha, measureInitonlySha256: sha(fs.readFileSync(`${S}/in/synth-measure-initonly.json`)) }, null, 1));
