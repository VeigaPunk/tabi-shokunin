// ScribeLessonSkel — authenticity of the recovered failed-run-1 bytes.
// Verifies (a) the failed run's measure-record Ed25519 wrapper signature, (b) the witness
// attestation, and (c) that the archived receipt.json hashes to the failed measure record's binding.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const D = `${ROOT}/.ufo/waves/round-43/w1/SentEgressAudit/failed-run-1`;
const out = []; const say = (s = '') => out.push(s);
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

say('# ScribeLessonSkel — authenticity of the recovered failed-run-1 bytes');
say(`archive: ${D}`);
say(`node: ${process.version}`);
say();

const mrRaw = fs.readFileSync(`${D}/c1-measure-r43.json`, 'utf8');
const mr = JSON.parse(mrRaw);
const unsignedObj = { ...mr };
delete unsignedObj.signature;
const unsigned = canonical(unsignedObj);
say('## 1. failed run measure record — wrapper Ed25519 signature');
say(`signature.scheme: ${mr.signature.scheme}`);
say(`sha256(canonical(unsigned)) == signature.over: ${sha256(unsigned) === mr.signature.over}`);
const okSig = crypto.verify(null, Buffer.from(unsigned, 'utf8'), crypto.createPublicKey(mr.pubkeys.wrapper), Buffer.from(mr.signature.value, 'hex'));
say(`Ed25519 verify under the embedded wrapper public key: ${okSig}`);
say(`pubkeys.wrapper: ${mr.pubkeys.wrapper.replace(/\n/g, '\\n')}`);
say();

const wRaw = fs.readFileSync(`${D}/receipt.witness.json`, 'utf8');
const w = JSON.parse(wRaw);
say('## 2. failed run witness attestation');
const att = w.attestation || {};
say(`attestation keys: ${JSON.stringify(Object.keys(att))}`);
const signed = { rootPid: w.rootPid, nonce: w.nonce, startedTicks: w.startedTicks, endedTicks: w.endedTicks, samples: w.samples };
say(`sha256(canonical(signed)) == attestation.over: ${sha256(canonical(signed)) === att.over}`);
const okAtt = crypto.verify(null, Buffer.from(canonical(signed), 'utf8'), crypto.createPublicKey(att.publicKey), Buffer.from(att.value, 'hex'));
say(`Ed25519 verify under the witness's own public key: ${okAtt}`);
say();

say('## 3. archived receipt.json vs the failed measure record bindings');
const receiptRaw = fs.readFileSync(`${D}/receipt.json`, 'utf8');
say(`sha256(receipt.json)      = ${sha256(receiptRaw)}`);
say(`measureRecord.receiptSha256 = ${mr.bindings.receiptSha256}`);
say(`match: ${sha256(receiptRaw) === mr.bindings.receiptSha256}`);
say(`sha256(receipt.witness.json) = ${sha256(wRaw)}`);
say(`measureRecord.witnessSha256  = ${mr.bindings.witnessSha256}`);
say(`match: ${sha256(wRaw) === mr.bindings.witnessSha256}`);
say();
say('## 4. the committed clean run, same three checks (control)');
const cleanRaw = execFileSync('git', ['-C', ROOT, 'show', '7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/measure/c1-measure-r43.json']).toString();
const cm = JSON.parse(cleanRaw);
const cu = { ...cm }; delete cu.signature;
say(`sha256(canonical(unsigned)) == signature.over: ${sha256(canonical(cu)) === cm.signature.over}`);
say(`Ed25519 verify under the embedded wrapper public key: ${crypto.verify(null, Buffer.from(canonical(cu), 'utf8'), crypto.createPublicKey(cm.pubkeys.wrapper), Buffer.from(cm.signature.value, 'hex'))}`);
const cRec = execFileSync('git', ['-C', ROOT, 'show', 'ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c:corpus/evidence/round43/playwright-egress/receipt.json'], { maxBuffer: 64 * 1024 * 1024 }).toString();
const cwit = execFileSync('git', ['-C', ROOT, 'show', 'ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c:corpus/evidence/round43/playwright-egress/receipt.witness.json'], { maxBuffer: 64 * 1024 * 1024 }).toString();
say(`committed receipt.json sha256 == clean measure record binding: ${sha256(cRec) === cm.bindings.receiptSha256}`);
say(`committed receipt.witness.json sha256 == clean measure record binding: ${sha256(cwit) === cm.bindings.witnessSha256}`);

fs.writeFileSync(`${ROOT}/.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-predata-run1-signatures.txt`, out.join('\n') + '\n');
console.log(out.join('\n'));
