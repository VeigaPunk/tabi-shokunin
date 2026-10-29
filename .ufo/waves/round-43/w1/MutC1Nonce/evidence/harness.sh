#!/usr/bin/env bash
# Decisive harness for seat MutC1Nonce.
#
# The counter self-pins its own bytes (pins.frozenDigests entry for
# .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs vs sha256 of the
# RUNNING file). A scratch copy of the counter therefore ALWAYS trips an
# orthogonal 'digest-mismatch:...counter' gate, which would mask the nonce
# question. To isolate the nonce clause we build TWO additional copies in
# which that ONE self-digest entry is removed IDENTICALLY:
#
#   frozen-nopin : frozen bytes, self-digest entry removed
#   mutant-nopin : nonce triple-match removed, self-digest entry removed
#
# diff(frozen-nopin, mutant-nopin) == the assigned mutation and nothing else.
# Both are then run against a synthetic pair whose ONLY defect is the receipt
# nonce (relabeled) vs the measure nonce, with the fd3/fd4 challenge answered
# by a scratch mini-wrapper, so no other refusal layer can mask the result.
set -u
S=/fast/scratch/hyaku/tabi-r43/MutC1Nonce
OUT="$S/out"
mkdir -p "$OUT"

# --- build the pin-neutralized copies -------------------------------------
python3 - "$S" <<'EOF'
import sys, re, pathlib
S = sys.argv[1]
src = pathlib.Path(f"{S}/frozen/c1-signature-bound-v5.mjs").read_text()
needle = "['.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs', selfPath]"
assert src.count(needle) == 1, src.count(needle)
nopin = src.replace(needle, "['.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs', selfPath] /* PIN-NEUTRALIZED */")
pathlib.Path(f"{S}/frozen-nopin").mkdir(exist_ok=True)
pathlib.Path(f"{S}/mutant-nopin").mkdir(exist_ok=True)
pathlib.Path(f"{S}/frozen-nopin/c1-signature-bound-v5.mjs").write_text(nopin)

mut = pathlib.Path(f"{S}/mutant/c1-signature-bound-v5.mjs").read_text()
assert mut.count(needle) == 1
mutnopin = mut.replace(needle, "['.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs', selfPath] /* PIN-NEUTRALIZED */")
pathlib.Path(f"{S}/mutant-nopin/c1-signature-bound-v5.mjs").write_text(mutnopin)
print("built frozen-nopin and mutant-nopin")
EOF

echo "=== diff(frozen-nopin, mutant-nopin) — must be exactly the assigned mutation ==="
diff -u "$S/frozen-nopin/c1-signature-bound-v5.mjs" "$S/mutant-nopin/c1-signature-bound-v5.mjs" | tee "$OUT/nopin.diff"
echo "removed: $(grep -c '^-[^-]' "$OUT/nopin.diff")  added: $(grep -c '^+[^+]' "$OUT/nopin.diff")"

# --- build the two synthetic pairs ---------------------------------------
# consistent : every nonce identical (receipt/runs/witness/measure)
# nonceonly  : receipt + runs carry a RELABELED nonce; witness + measure keep the honest one
node "$S/build-nonceonly.mjs" --dir "$S/pairs/consistent" --counter "$S/frozen/c1-signature-bound-v5.mjs" --consistent >"$OUT/pair-consistent.json"
node "$S/build-nonceonly.mjs" --dir "$S/pairs/nonceonly"  --counter "$S/frozen/c1-signature-bound-v5.mjs" >"$OUT/pair-nonceonly.json"

show () {
  local label="$1"
  echo "--- $label"
  node -e '
    const fs=require("fs");const p=process.argv[1];
    const d=JSON.parse(fs.readFileSync(p,"utf8"));
    const c=d.stdout||{};
    console.log("    exit:",d.exit,"challengeBytes:",d.challengeBytes);
    console.log("    findings:",JSON.stringify(c.findings));
    console.log("    predicate:",c.predicate,"challengeVerified:",c.challengeVerified,"measureSignatureVerified:",c.measureSignatureVerified,"witnessAttestationVerified:",c.witnessAttestationVerified);
    console.log("    named: run-nonce-mismatch="+(c.findings||[]).includes("run-nonce-mismatch"));
  ' "$OUT/$label.json"
}

run () { # label counter pairdir
  node "$S/mini-wrapper.mjs" --dir "$2" --counter "$1" >"$OUT/$3.json" 2>"$OUT/$3.err"
  echo "=== $3"
  show "$3"
}

for pair in consistent nonceonly; do
  echo "########## pair=$pair"
  run "$S/frozen/c1-signature-bound-v5.mjs"   "$S/pairs/$pair" "${pair}-frozen"
  run "$S/mutant/c1-signature-bound-v5.mjs"   "$S/pairs/$pair" "${pair}-mutant"
  run "$S/frozen-nopin/c1-signature-bound-v5.mjs" "$S/pairs/$pair" "${pair}-frozen-nopin"
  run "$S/mutant-nopin/c1-signature-bound-v5.mjs" "$S/pairs/$pair" "${pair}-mutant-nopin"
done
