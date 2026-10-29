#!/usr/bin/env bash
# Completeness probe for seat MutC1Nonce:
#  (1) the MUTANT must STILL refuse a measure record whose nonce is not
#      64-hex (the measure-nonce-shape clause was NOT part of the assigned
#      mutation and must be retained);
#  (2) the MUTANT must still refuse a receipt whose runNonce is missing
#      (shape of the triple-match, not its equality);
#  (3) the MUTANT must still refuse a witness whose nonce is missing.
set -u
S=/fast/scratch/hyaku/tabi-r43/MutC1Nonce
OUT="$S/out"

python3 - "$S" <<'EOF'
import json, os, sys, shutil
S = sys.argv[1]
base = f"{S}/fixtures/base"

def load(p): return json.load(open(p))

# (1) malformed (non-64-hex) measure nonce
d = f"{S}/fixtures/badshape-measure"
os.makedirs(d, exist_ok=True)
shutil.copy(f"{base}/receipt.json", f"{d}/receipt.json")
shutil.copy(f"{base}/receipt.witness.json", f"{d}/receipt.witness.json")
m = load(f"{base}/measure.json")
m["nonce"] = "zz"
json.dump(m, open(f"{d}/measure.json", "w"), indent=1)

# (2) receipt with no runNonce at all
d = f"{S}/fixtures/noreceipt-nonce"
os.makedirs(d, exist_ok=True)
shutil.copy(f"{base}/receipt.witness.json", f"{d}/receipt.witness.json")
shutil.copy(f"{base}/measure.json", f"{d}/measure.json")
r = load(f"{base}/receipt.json")
r.pop("runNonce", None)
for run in r.get("runs", []): run.pop("runNonce", None)
json.dump(r, open(f"{d}/receipt.json", "w"), indent=1)

# (3) witness with no nonce at all
d = f"{S}/fixtures/nowitness-nonce"
os.makedirs(d, exist_ok=True)
shutil.copy(f"{base}/receipt.json", f"{d}/receipt.json")
shutil.copy(f"{base}/measure.json", f"{d}/measure.json")
w = load(f"{base}/receipt.witness.json")
w.pop("nonce", None)
json.dump(w, open(f"{d}/receipt.witness.json", "w"), indent=1)
print("built: badshape-measure noreceipt-nonce nowitness-nonce")
EOF

show () {
  local label="$1"
  echo "--- $label : exit=$(cat "$OUT/$label.exit")"
  node -e '
    const fs=require("fs");const p=process.argv[1];
    let d=null;try{d=JSON.parse(fs.readFileSync(p,"utf8"))}catch(e){console.log("    <unparsable>");process.exit(0)}
    console.log("    findings:",JSON.stringify(d.findings));
  ' "$OUT/$label.stdout.json"
}

run () { # label counter fixture
  ( cd "$(dirname "$2")" && node "$2" "$3/receipt.json" --measure "$3/measure.json" 3<"$3/measure.json" ) >"$OUT/$1.stdout.json" 2>"$OUT/$1.stderr.txt"
  printf '%s\n' "$?" >"$OUT/$1.exit"
  echo "=== $1 (fixture $3)"
  show "$1"
}

run shape-frozen "$S/frozen/c1-signature-bound-v5.mjs" "$S/fixtures/badshape-measure"
run shape-mutant "$S/mutant/c1-signature-bound-v5.mjs" "$S/fixtures/badshape-measure"
run norec-frozen  "$S/frozen/c1-signature-bound-v5.mjs" "$S/fixtures/noreceipt-nonce"
run norec-mutant  "$S/mutant/c1-signature-bound-v5.mjs" "$S/fixtures/noreceipt-nonce"
run nowit-frozen  "$S/frozen/c1-signature-bound-v5.mjs" "$S/fixtures/nowitness-nonce"
run nowit-mutant  "$S/mutant/c1-signature-bound-v5.mjs" "$S/fixtures/nowitness-nonce"
