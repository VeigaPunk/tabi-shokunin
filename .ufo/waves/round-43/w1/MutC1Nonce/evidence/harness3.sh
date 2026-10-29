#!/usr/bin/env bash
# Isolation test v3 for seat MutC1Nonce.
#
# Pair shape: receipt + witness + measure record are internally CONSISTENT
# (bindings hash correctly, witness attestation verifies, measure record is
# re-signed with the scratch wrapper key) — the ONLY defect is that the
# measure record's nonce was relabeled, so it no longer equals the receipt's
# / witness's nonce. Any finding other than a nonce finding would indicate
# the pair is not otherwise clean.
#
# Expected: frozen refuses with exactly the nonce findings; the mutant
# (pin-neutralized) loses them and greens.
set -u
S=/fast/scratch/hyaku/tabi-r43/MutC1Nonce
OUT="$S/out"

node "$S/build-nonceonly.mjs" --dir "$S/pairs/resigned-relabel" --counter "$S/frozen-nopin2/c1-signature-bound-v5.mjs" --relabel-measure-resigned >"$OUT/pair-resigned-relabel.json"

show () {
  node -e '
    const fs=require("fs");const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));const c=d.stdout||{};
    console.log("    exit:",d.exit,"challengeBytes:",d.challengeBytes);
    console.log("    findings:",JSON.stringify(c.findings));
    console.log("    predicate:",c.predicate,"challengeVerified:",c.challengeVerified,"measureSignatureVerified:",c.measureSignatureVerified,"witnessAttestationVerified:",c.witnessAttestationVerified);
    console.log("    named: run-nonce-mismatch="+(c.findings||[]).includes("run-nonce-mismatch")+
                " witness-nonce-mismatch="+(c.findings||[]).includes("witness-nonce-mismatch")+
                " measure-signature-invalid="+(c.findings||[]).includes("measure-signature-invalid"));
  ' "$OUT/$1.json"
}

run () {
  node "$S/mini-wrapper.mjs" --dir "$S/pairs/resigned-relabel" --counter "$1" >"$OUT/$2.json" 2>"$OUT/$2.err"
  echo "=== $2"
  show "$2"
}

run "$S/frozen-nopin2/c1-signature-bound-v5.mjs" "resigned-frozen-nopin"
run "$S/mutant-nopin2/c1-signature-bound-v5.mjs" "resigned-mutant-nopin"
run "$S/frozen/c1-signature-bound-v5.mjs"       "resigned-frozen"

echo "=== sanity: the pair is otherwise clean (measure record signature + bindings verify) ==="
node -e '
const fs=require("fs");const crypto=require("crypto");const p="/fast/scratch/hyaku/tabi-r43/MutC1Nonce/pairs/resigned-relabel";
const m=JSON.parse(fs.readFileSync(p+"/measure.json","utf8"));
const {signature,...rest}=m;
function canon(v){if(v===null||typeof v!=="object")return JSON.stringify(v);if(Array.isArray(v))return "["+v.map(canon).join(",")+"]";const k=Object.keys(v).sort();return "{"+k.map(x=>JSON.stringify(x)+":"+canon(v[x])).join(",")+"}";}
const u=canon(rest);
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
console.log("    measure sig over-match:",sha(Buffer.from(u,"utf8"))===signature.over);
console.log("    measure sig verify:",crypto.verify(null,Buffer.from(u,"utf8"),crypto.createPublicKey(m.pubkeys.wrapper),Buffer.from(signature.value,"hex")));
console.log("    receiptSha256 binding ok:",m.bindings.receiptSha256===sha(fs.readFileSync(p+"/receipt.json")));
console.log("    witnessSha256 binding ok:",m.bindings.witnessSha256===sha(fs.readFileSync(p+"/receipt.witness.json")));
console.log("    measure.nonce:",m.nonce);
const r=JSON.parse(fs.readFileSync(p+"/receipt.json","utf8"));
console.log("    receipt.runNonce:",r.runNonce,"runs nonces:",r.runs.map(x=>x.runNonce));
const w=JSON.parse(fs.readFileSync(p+"/receipt.witness.json","utf8"));
console.log("    witness.nonce:",w.nonce);
'