#!/usr/bin/env bash
# round-37 controls — frozen BEFORE claim data. Builds four fixture clones in scratch
# (each a real clone with one honest-content or attack commit; git fixtures follow the
# run-6 rule: mktemp dir, every git call names -C, toplevel verified before the first
# commit), runs the old (v4/v2) and new (v5/v3) counters over them, and writes one receipt
# per control to OUT. Counter bytes are the freeze worktree files; the driver is
# byte-pinned in claims.json:frozenDigests.
#   c1r37-J1-pins-reorder   v4 admits semantically-identical UNFROZEN pins (exit 0);
#                           v5 refuses (digest mismatch, exit 2) — B1 binding.
#   c1r37-J2-decoy-note     v4 refuses a truthful moved note whose earlier token is a
#                           decoy (exit 1, audit-moved-wrong-relocation); v5 accepts via
#                           the canonical `verbatim at :N` clause (exit 0) — B2 parser.
#   c1r37-J3-honest         v5 predicate true at the round-start tip — honest floor.
#   c2r37-J1-replace-ref    v2 admits an honest-state clone carrying refs/replace (exit 0);
#                           v3 refuses the clone state itself (exit 2) — B1 hardening.
#   c2r37-J2-observed-tamper v2 admits a receipt whose observed decoration was tampered
#                           (exit 0 — the w2 CritC2b hole); v3 receipt-finds it (exit 1)
#                           — B3 binding.
#   c2r37-J3-honest         v3 predicate true at the round-start tip — honest floor.
set -u -o pipefail
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
OUT=${1:-$LANE/.ufo/waves/round-37/baseline}
V5=$LANE/.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs
V3=$LANE/.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs
V4=$LANE/.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs
V2=$LANE/.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/L1/controls
rm -rf -- "$S"; mkdir -p "$S/tmp" "$OUT"; export TMPDIR="$S/tmp"
trap 'rm -rf -- "$S"' EXIT
TIP=$(git -C "$LANE" rev-parse master)
export GIT_CONFIG_NOSYSTEM=1

receipt() { # name counter rev exit predicate summary
  printf '{"control":"%s","counter":"%s","fixtureRev":"%s","exit":%s,"predicate":%s,"summary":%s}\n' \
    "$1" "$2" "$3" "$4" "$5" "$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$6")" > "$OUT/$1.json"
}

# --- fixture A: pins reordered (semantic twin, different bytes) ---
A="$S/A"; git clone -q --shared "$LANE" "$A"
[ "$(git -C "$A" rev-parse --show-toplevel)" = "$A" ] || exit 9
python3 - "$A" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]) / '.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
p.write_text(json.dumps(dict(sorted(d.items())), indent=1) + '\n')
PY
git -C "$A" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: reorder delta pins keys'
RA=$(git -C "$A" rev-parse HEAD)

# --- fixture B: truthful decoy-token moved note ---
B="$S/B"; git clone -q --shared "$LANE" "$B"
python3 - "$B" <<'PY'
import pathlib, sys
p = pathlib.Path(sys.argv[1]) / 'corpus/adjacency-screen-drift.tsv'
ls = p.read_text().split('\n')
for i, l in enumerate(ls):
    if l.endswith('\tmoved\tverbatim at :748'):
        ls[i] = l.replace('\tmoved\tverbatim at :748', '\tmoved\tpin :585 moved verbatim at :748')
p.write_text('\n'.join(ls))
PY
git -C "$B" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: decoy-token moved note'
RB=$(git -C "$B" rev-parse HEAD)

# --- fixture C: observed decoration tampered ---
C="$S/C"; git clone -q --shared "$LANE" "$C"
python3 - "$C" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]) / 'corpus/evidence/round-35/bidi-firefox/receipt.json'
d = json.loads(p.read_text())
shot = d['runs'][0]['observed']
for o in shot:
    if o['step'] == 'captureScreenshot':
        o['value']['sha256'] = ('0' if o['value']['sha256'][0] != '0' else '1') + o['value']['sha256'][1:]
p.write_text(json.dumps(d, indent=1) + '\n')
PY
git -C "$C" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: tamper observed decoration'
RC=$(git -C "$C" rev-parse HEAD)

# --- fixture D: honest tree + a replace ref grafting the receipt blob to a forgery ---
# (the w2 SentinelScope2 scenario: the committed tree reads honest, but a `git show` that
# honours replace refs returns the forged receipt; v2 has no replace protection and no
# observed binding, v3 refuses the clone state and binds the decoration.)
D="$S/D"; git clone -q --shared "$LANE" "$D"
TIP2=$(git -C "$D" rev-parse HEAD)
OLD=$(git -C "$D" rev-parse "$TIP2:corpus/evidence/round-35/bidi-firefox/receipt.json")
python3 - "$D" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]) / 'corpus/evidence/round-35/bidi-firefox/receipt.json'
d = json.loads(p.read_text())
for o in d['runs'][0]['observed']:
    if o['step'] == 'captureScreenshot':
        o['value']['sha256'] = ('0' if o['value']['sha256'][0] != '0' else '1') + o['value']['sha256'][1:]
pathlib.Path(sys.argv[1], '..', 'forged-receipt.json').resolve().write_text(json.dumps(d, indent=1) + '\n')
PY
FORGED="$S/forged-receipt.json"
NEW=$(git -C "$D" hash-object -w "$FORGED")
git -C "$D" replace "$OLD" "$NEW"
RD=$(git -C "$D" rev-parse HEAD)

run_c1() { # counter rev fixture
  local out
  out=$(node "$1" --rev "$2" --repo "$3" --fleet "$FLEET" --json 2>&1); local rc=$?
  echo "$rc|$out"
}
run_c2() {
  local out
  out=$(node "$1" --rev "$2" --repo "$3" --json 2>&1); local rc=$?
  echo "$rc|$out"
}

# J1: pins reorder — v4 admits, v5 refuses
r=$(run_c1 "$V4" "$RA" "$A"); rc=${r%%|*}; body=${r#*|}
pred=$(printf '%s' "$body" | python3 -c 'import json,sys
try: d=json.load(sys.stdin); print(str(d.get("predicate")).lower())
except: print("null")')
receipt c1r37-J1-pins-reorder-v4 c1-adjacency-sweep-v4 "$RA" "$rc" "$pred" "v4 over reordered-pins clone: exit=$rc predicate=$pred (admits unfrozen pins)"
r=$(run_c1 "$V5" "$RA" "$A"); rc=${r%%|*}; body=${r#*|}
receipt c1r37-J1-pins-reorder-v5 c1-adjacency-sweep-v5 "$RA" "$rc" null "$(printf '%s' "$body" | tail -1 | cut -c1-160)"

# J2: decoy note — v4 refuses truthful note, v5 accepts
r=$(run_c1 "$V4" "$RB" "$B"); rc=${r%%|*}; body=${r#*|}
pred=$(printf '%s' "$body" | python3 -c 'import json,sys
try: d=json.load(sys.stdin); print(str(d.get("predicate")).lower())
except: print("null")')
receipt c1r37-J2-decoy-note-v4 c1-adjacency-sweep-v4 "$RB" "$rc" "$pred" "v4 over decoy-note clone: exit=$rc predicate=$pred (truthful note refused: first-:digits parser)"
r=$(run_c1 "$V5" "$RB" "$B"); rc=${r%%|*}; body=${r#*|}
pred=$(printf '%s' "$body" | python3 -c 'import json,sys
try: d=json.load(sys.stdin); print(str(d.get("predicate")).lower())
except: print("null")')
receipt c1r37-J2-decoy-note-v5 c1-adjacency-sweep-v5 "$RB" "$rc" "$pred" "v5 over decoy-note clone: exit=$rc predicate=$pred (verbatim-at clause parses)"

# J3: honest floor at TIP — v5
r=$(run_c1 "$V5" "$TIP" "$LANE"); rc=${r%%|*}; body=${r#*|}
pred=$(printf '%s' "$body" | python3 -c 'import json,sys
try: d=json.load(sys.stdin); print(str(d.get("predicate")).lower())
except: print("null")')
receipt c1r37-J3-honest-v5 c1-adjacency-sweep-v5 "$TIP" "$rc" "$pred" "v5 at round-start tip: exit=$rc predicate=$pred pinsDigest bound"

# J1: replace ref — v2 admits honest-state clone, v3 refuses
r=$(run_c2 "$V2" "$RD" "$D"); rc=${r%%|*}; body=${r#*|}
pred=$(printf '%s' "$body" | python3 -c 'import json,sys
try: d=json.load(sys.stdin); print(str(d.get("predicate")).lower())
except: print("null")')
receipt c2r37-J1-replace-ref-v2 c2-firefox-bidi-v2 "$RD" "$rc" "$pred" "v2 over replace-graft clone (honest tree, forged receipt via refs/replace): exit=$rc predicate=$pred (v2 honours the graft and, ignoring observed decoration, admits)"
r=$(run_c2 "$V3" "$RD" "$D"); rc=${r%%|*}; body=${r#*|}
receipt c2r37-J1-replace-ref-v3 c2-firefox-bidi-v3 "$RD" "$rc" null "$(printf '%s' "$body" | tail -1 | cut -c1-160)"

# J2: observed tamper — v2 admits, v3 receipt-finds
r=$(run_c2 "$V2" "$RC" "$C"); rc=${r%%|*}; body=${r#*|}
pred=$(printf '%s' "$body" | python3 -c 'import json,sys
try: d=json.load(sys.stdin); print(str(d.get("predicate")).lower())
except: print("null")')
receipt c2r37-J2-observed-tamper-v2 c2-firefox-bidi-v2 "$RC" "$rc" "$pred" "v2 over observed-tampered clone: exit=$rc predicate=$pred (decoration unauthenticated)"
r=$(run_c2 "$V3" "$RC" "$C"); rc=${r%%|*}; body=${r#*|}
pred=$(printf '%s' "$body" | python3 -c 'import json,sys
try: d=json.load(sys.stdin); print(str(d.get("predicate")).lower())
except: print("null")')
rf=$(printf '%s' "$body" | python3 -c 'import json,sys
try: d=json.load(sys.stdin); print(d.get("receiptFinding") or "null")
except: print("null")')
receipt c2r37-J2-observed-tamper-v3 c2-firefox-bidi-v3 "$RC" "$rc" "$pred" "v3 over observed-tampered clone: exit=$rc predicate=$pred receiptFinding=$rf"

# J3: honest floor at TIP — v3 (live Firefox session)
r=$(run_c2 "$V3" "$TIP" "$LANE"); rc=${r%%|*}; body=${r#*|}
pred=$(printf '%s' "$body" | python3 -c 'import json,sys
try: d=json.load(sys.stdin); print(json.dumps({"predicate":d.get("predicate"),"admitted":d.get("admitted"),"survivors":d.get("survivors"),"egress":d.get("egressNonLoopback"),"receiptFinding":d.get("receiptFinding"),"binding":d.get("binding")}))
except Exception as e: print("{\"parse\":\"fail\"}")')
receipt c2r37-J3-honest-v3 c2-firefox-bidi-v3 "$TIP" "$rc" null "v3 at round-start tip: $pred"

echo "controls done -> $OUT"
