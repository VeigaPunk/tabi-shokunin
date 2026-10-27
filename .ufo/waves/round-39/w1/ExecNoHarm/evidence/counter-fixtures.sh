#!/usr/bin/env bash
# Counter self-test: exercise the two frozen round-39 counters against isolated
# scratch fixtures (lane untouched). Each fixture is a scratch clone whose
# committed receipt/claims bytes are mutated in exactly one way.
set -u
S=/fast/scratch/hyaku/tabi-r39/ExecNoHarm
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
TIP=dfec88a7603de1ce9b5b84bf36deabbc5f4d8a0e
C1="$LANE/.ufo/waves/round-39/counters/c1-egress-session-bound.mjs"
C2="$LANE/.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs"
OUT="$S/out/counter-fixtures.txt"
: > "$OUT"

mkfixture() { # $1=name $2=base rev
  local name="$1" base="$2"
  local d="$S/fx/$name"
  rm -rf "$d"; mkdir -p "$d"
  git clone --quiet --shared --no-checkout "$LANE" "$d"
  git -C "$d" checkout --quiet "$base"
  local tl; tl=$(git -C "$d" rev-parse --show-toplevel)
  if [ "$tl" != "$d" ]; then echo "GUARD FAIL $name toplevel=$tl" | tee -a "$OUT"; return 1; fi
  echo "$d"
}

commitfixture() { # $1=dir $2=message
  git -C "$1" -c user.name=tabi-selftest -c user.email=tabi-selftest@local commit -qam "$2"
  git -C "$1" rev-parse HEAD
}

{
echo "### Counter self-test fixtures (isolated scratch clones; lane untouched)"
echo

# ---- C1 fixture 1: v1 control receipt only (do-nothing control) ----
d=$(mkfixture c1-v1only "$TIP")
rm -f "$d/corpus/evidence/round-39/playwright-egress/receipt.json"
git -C "$d" rm -q --cached corpus/evidence/round-39/playwright-egress/receipt.json
git -C "$d" -c user.name=tabi-selftest -c user.email=tabi-selftest@local commit -qm "fixture: remove round-39 v2 receipt (v1 control only)"
R=$(git -C "$d" rev-parse HEAD)
echo "--- C1 fixture c1-v1only (rev $R) ---"
node "$C1" --repo "$d" --rev "$R" 2>&1; echo "EXIT=$?"

# ---- C1 fixture 2: honest receipt (control group) ----
d=$(mkfixture c1-honest "$TIP")
R=$(git -C "$d" rev-parse HEAD)
echo "--- C1 fixture c1-honest (rev $R) ---"
node "$C1" --repo "$d" --rev "$R" 2>&1; echo "EXIT=$?"

# ---- C1 fixture 3: mutate ONE receipt field (empty owned tree) ----
d=$(mkfixture c1-emptyowned "$TIP")
python3 - "$d" <<'PY'
import json,sys
p=sys.argv[1]+"/corpus/evidence/round-39/playwright-egress/receipt.json"
r=json.load(open(p))
r["runs"][0]["owned"]["tree"]=[]
json.dump(r,open(p,"w"),indent=2)
PY
git -C "$d" -c user.name=tabi-selftest -c user.email=tabi-selftest@local commit -qam "fixture: empty owned tree in run1"
R=$(git -C "$d" rev-parse HEAD)
echo "--- C1 fixture c1-emptyowned (rev $R) ---"
node "$C1" --repo "$d" --rev "$R" 2>&1; echo "EXIT=$?"

# ---- C2 fixture 4: mutated claims predicate sentence (red control) ----
d=$(mkfixture c2-mutantclaims "$TIP")
python3 - "$d" <<'PY'
import json,sys
p=sys.argv[1]+"/.ufo/waves/round-39/claims.json"
c=json.load(open(p))
c["claims"][1]["predicate"]=c["claims"][1]["predicate"].replace("AND","and",1)
json.dump(c,open(p,"w"),indent=2)
PY
git -C "$d" -c user.name=tabi-selftest -c user.email=tabi-selftest@local commit -qam "fixture: mutate C2 predicate sentence (case)"
R=$(git -C "$d" rev-parse HEAD)
echo "--- C2 fixture c2-mutantclaims (rev $R), claims read from REV blob ---"
node "$C2" --repo "$d" --rev "$R" 2>&1; echo "EXIT=$?"

# ---- C2 fixture 5: honest claims at tip (control group) ----
d=$(mkfixture c2-honest "$TIP")
R=$(git -C "$d" rev-parse HEAD)
echo "--- C2 fixture c2-honest (rev $R) ---"
node "$C2" --repo "$d" --rev "$R" 2>&1; echo "EXIT=$?"
} | tee -a "$OUT"
true
