import fs from 'node:fs';
import crypto from 'node:crypto';
const ROOT='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const R = ROOT+'/corpus/evidence/round43/playwright-egress/receipt.json';
const W = ROOT+'/corpus/evidence/round43/playwright-egress/receipt.witness.json';
const M = ROOT+'/.ufo/waves/round-43/measure/c1-measure-r43.json';
const sha256=(b)=>crypto.createHash('sha256').update(b).digest('hex');
function canonical(v){ if(v===null||typeof v!=='object') return JSON.stringify(v);
 if(Array.isArray(v)) return '['+v.map(canonical).join(',')+']';
 const k=Object.keys(v).sort(); return '{'+k.map(x=>JSON.stringify(x)+':'+canonical(v[x])).join(',')+'}';}
const out={};
const rb=fs.readFileSync(R), wb=fs.readFileSync(W), mb=fs.readFileSync(M);
const receipt=JSON.parse(rb), witness=JSON.parse(wb), m=JSON.parse(mb);
// 1 bindings
out.receiptSha256_actual=sha256(rb);
out.receiptSha256_bound=m.bindings.receiptSha256;
out.receiptBindingMatch = out.receiptSha256_actual===out.receiptSha256_bound;
out.witnessSha256_actual=sha256(wb);
out.witnessSha256_bound=m.bindings.witnessSha256;
out.witnessBindingMatch = out.witnessSha256_actual===out.witnessSha256_bound;
// 2 measure record signature over canonical unsigned form
const unsigned={...m}; delete unsigned.signature;
const signedStr=canonical(unsigned);
out.measureSig_over_expected=m.signature.over;
out.measureSig_over_actual=sha256(Buffer.from(signedStr,'utf8'));
out.measureSig_over_match = out.measureSig_over_expected===out.measureSig_over_actual;
out.measureSig_valid = crypto.verify(null, Buffer.from(signedStr,'utf8'), crypto.createPublicKey(m.pubkeys.wrapper), Buffer.from(m.signature.value,'hex'));
// 3 witness attestation
const a=witness.attestation||{};
const wSigned=canonical({rootPid:witness.rootPid,nonce:witness.nonce,startedTicks:witness.startedTicks,endedTicks:witness.endedTicks,samples:witness.samples});
out.witnessAtt_over_expected=a.over;
out.witnessAtt_over_actual=sha256(Buffer.from(wSigned,'utf8'));
out.witnessAtt_over_match=out.witnessAtt_over_expected===out.witnessAtt_over_actual;
out.witnessAtt_valid=crypto.verify(null,Buffer.from(wSigned,'utf8'),crypto.createPublicKey(a.publicKey),Buffer.from(a.value,'hex'));
// 4 nonce carriage
out.nonce_measure=m.nonce;
out.nonce_receipt=receipt.runNonce;
out.nonce_runs=receipt.runs.map(r=>r.runNonce);
out.nonce_witness=witness.nonce;
out.nonce_all_match=[receipt.runNonce,...receipt.runs.map(r=>r.runNonce),witness.nonce].every(x=>x===m.nonce);
// 5 witness pubkey in measure record equals attestation pubkey
out.witnessPubkeyMatch = m.pubkeys.witness===a.publicKey;
// 6 digests
out.digests_recorded=m.digests;
out.digests_actual={
 'scripts/measure-c1-round43.mjs':sha256(fs.readFileSync(ROOT+'/scripts/measure-c1-round43.mjs')),
 'scripts/playwright-firefox-egress-round43.mjs':sha256(fs.readFileSync(ROOT+'/scripts/playwright-firefox-egress-round43.mjs')),
 '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs':sha256(fs.readFileSync(ROOT+'/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs')),
};
out.digests_match=JSON.stringify(out.digests_recorded)===JSON.stringify(out.digests_actual);
// 7 claims pins
const claims=JSON.parse(fs.readFileSync(ROOT+'/.ufo/waves/round-43/claims.json','utf8'));
out.claimsPins_match = JSON.stringify(claims.frozenDigests)===JSON.stringify(out.digests_actual);
// 8 private key persistence probe: any PEM private key or seed in any artifact?
const priv=[];
for(const [nm,b] of [['receipt',rb],['witness',wb],['measure',mb]]){
  const s=b.toString('utf8');
  if(/BEGIN (?:[A-Z ]+)?PRIVATE KEY/.test(s)) priv.push(nm+':PEM');
  if(/"(?:privateKey|privKey|secretKey|seed|privateKeyPem|privateKeyB64)"\s*:/.test(s)) priv.push(nm+':field');
}
out.privateKeyMaterialFound=priv;
// 9 gate record
out.gate=m.gate;
out.envCheck=receipt.envCheck;
// 10 egress totals
out.receipt_egressNonLoopback=receipt.egressNonLoopback;
out.run_egress=receipt.runs.map(r=>r.egressNonLoopback);
out.survivors=receipt.survivors;
out.run_survivors=receipt.runs.map(r=>r.survivors);
out.refused=receipt.refused;
out.binding=receipt.binding;
console.log(JSON.stringify(out,null,2));
