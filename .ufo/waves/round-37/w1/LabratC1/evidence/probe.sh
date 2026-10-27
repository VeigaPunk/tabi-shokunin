#!/usr/bin/env bash
# LabratC1 probe: v5's diagnostic read paths (--list-delta / --list-drift).
# Question: do the list modes consume UNFROZEN delta pins (lane HEAD blob, or the
# on-disk worktree file), and can that reach a predicate evaluation?
set -u -o pipefail
S=/fast/scratch/hyaku/tabi-r37/w1/LabratC1
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
OUT=$S/out
V5=$S/v5.mjs
mkdir -p "$OUT" "$S/tmp" "$S/fx"
export TMPDIR="$S/tmp"
export GIT_CONFIG_NOSYSTEM=1

note() { printf '%s\n' "$*" | tee -a "$OUT/probe.log"; }
run() { # label cmd...
  local label=$1; shift
  local o e rc
  o=$("$@" 2>"$OUT/err.tmp"); rc=$?
  e=$(cat "$OUT/err.tmp")
  printf '%s :: exit=%s :: stdout_lines=%s :: stderr=%s\n' \
    "$label" "$rc" "$(printf '%s' "$o" | grep -c '' )" "$(printf '%s' "$e" | head -1 | cut -c1-200)" | tee -a "$OUT/probe.log"
  printf '%s' "$o" > "$OUT/$label.stdout"
}

note "=== LabratC1 probe: v5 diagnostic read paths ==="
note "v5 bytes: $(sha256sum "$V5" | cut -d' ' -f1)  (claims.json frozenDigests.c1 = 9c6289b7...)"

# ---------- CASE 0: baseline (honest lane, HEAD = master tip) ----------
run base-list-delta  node "$V5" --list-delta --repo "$LANE" --fleet "$FLEET"
run base-list-drift  node "$V5" --list-drift --repo "$LANE" --fleet "$FLEET"
note "base --list-delta lines: $(grep -c '' "$OUT/base-list-delta.stdout" 2>/dev/null || echo 0)"
note "base --list-drift lines: $(grep -c '' "$OUT/base-list-drift.stdout" 2>/dev/null || echo 0)"
sha256sum "$OUT/base-list-delta.stdout" "$OUT/base-list-drift.stdout" | tee -a "$OUT/probe.log"

# ---------- CASE 1: worktree-only edit (uncommitted reorder) ----------
D1=$(mktemp -d -p "$S/fx")
git clone -q --shared "$LANE" "$D1"
[ "$(git -C "$D1" rev-parse --show-toplevel)" = "$D1" ] || exit 9
python3 - "$D1" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]) / '.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
p.write_text(json.dumps(dict(sorted(d.items())), indent=1) + '\n')
PY
note "CASE1 worktree pins sha256 (unfrozen reorder): $(sha256sum "$D1/.ufo/waves/round-36/baseline/c1-delta-pins.json" | cut -d' ' -f1)"
note "CASE1 HEAD pins blob sha256 (frozen):        $(git -C "$D1" show HEAD:.ufo/waves/round-36/baseline/c1-delta-pins.json | sha256sum | cut -d' ' -f1)"
note "CASE1 git status: [$(git -C "$D1" status --porcelain | tr '\n' ';')]"
run c1-list-delta  node "$V5" --list-delta --repo "$D1" --fleet "$FLEET"
run c1-list-drift  node "$V5" --list-drift --repo "$D1" --fleet "$FLEET"
note "CASE1 --list-delta identical to baseline? $(cmp -s "$OUT/base-list-delta.stdout" "$OUT/c1-list-delta.stdout" && echo YES-identical || echo NO-DIFFERS)"
note "CASE1 --list-drift identical to baseline? $(cmp -s "$OUT/base-list-drift.stdout" "$OUT/c1-list-drift.stdout" && echo YES-identical || echo NO-DIFFERS)"

# ---------- CASE 2: COMMITTED reorder (HEAD now carries unfrozen pins) ----------
D2=$(mktemp -d -p "$S/fx")
git clone -q --shared "$LANE" "$D2"
[ "$(git -C "$D2" rev-parse --show-toplevel)" = "$D2" ] || exit 9
python3 - "$D2" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]) / '.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
p.write_text(json.dumps(dict(sorted(d.items())), indent=1) + '\n')
PY
git -C "$D2" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: reorder delta pins keys'
RA=$(git -C "$D2" rev-parse HEAD)
note "CASE2 fixture rev=$RA  HEAD pins blob sha256=$(git -C "$D2" show HEAD:.ufo/waves/round-36/baseline/c1-delta-pins.json | sha256sum | cut -d' ' -f1)"
run c2-list-delta  node "$V5" --list-delta --repo "$D2" --fleet "$FLEET"
run c2-list-drift  node "$V5" --list-drift --repo "$D2" --fleet "$FLEET"
note "CASE2 --list-delta identical to baseline? $(cmp -s "$OUT/base-list-delta.stdout" "$OUT/c2-list-delta.stdout" && echo YES-identical || echo NO-DIFFERS)"
note "CASE2 --list-drift identical to baseline? $(cmp -s "$OUT/base-list-drift.stdout" "$OUT/c2-list-drift.stdout" && echo YES-identical || echo NO-DIFFERS)"
note "CASE2 --list-delta first 2 lines:"; head -2 "$OUT/c2-list-delta.stdout" | tee -a "$OUT/probe.log"
note "CASE2 base  --list-delta first 2 lines:"; head -2 "$OUT/base-list-delta.stdout" | tee -a "$OUT/probe.log"
# predicate path on the SAME fixture, for contrast:
run c2-predicate    node "$V5" --rev "$RA" --repo "$D2" --fleet "$FLEET" --json

# ---------- CASE 3: semantically DIFFERENT pins committed at HEAD (older resolvable heads) ----------
D3=$(mktemp -d -p "$S/fx")
git clone -q --shared "$LANE" "$D3"
[ "$(git -C "$D3" rev-parse --show-toplevel)" = "$D3" ] || exit 9
python3 - "$D3" "$FLEET" <<'PY'
import json, pathlib, subprocess, sys
root = pathlib.Path(sys.argv[1]); fleet = pathlib.Path(sys.argv[2])
p = root / '.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
# point two drifted lanes at their round-35 pin (resolvable, semantically different delta set)
for sib in ('chousa', 'mado'):
    r = subprocess.run(['git', '-C', str(fleet / f'{sib}-shokunin'), 'rev-parse', 'master'],
                       capture_output=True, text=True)
    d[sib] = r.stdout.strip()
p.write_text(json.dumps(d, indent=2) + '\n')
PY
git -C "$D3" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: repoint delta pins'
R3=$(git -C "$D3" rev-parse HEAD)
note "CASE3 fixture rev=$R3  HEAD pins blob sha256=$(git -C "$D3" show HEAD:.ufo/waves/round-36/baseline/c1-delta-pins.json | sha256sum | cut -d' ' -f1)"
run c3-list-delta  node "$V5" --list-delta --repo "$D3" --fleet "$FLEET"
run c3-list-drift  node "$V5" --list-drift --repo "$D3" --fleet "$FLEET"
note "CASE3 --list-delta lines=$(grep -c '' "$OUT/c3-list-delta.stdout") base=$(grep -c '' "$OUT/base-list-delta.stdout")"
note "CASE3 --list-drift lines=$(grep -c '' "$OUT/c3-list-drift.stdout") base=$(grep -c '' "$OUT/base-list-drift.stdout")"
run c3-predicate    node "$V5" --rev "$R3" --repo "$D3" --fleet "$FLEET" --json

# ---------- CASE 4: on-disk fallback (HEAD tree lacks the path) ----------
D4=$(mktemp -d -p "$S/fx")
git clone -q --shared "$LANE" "$D4"
[ "$(git -C "$D4" rev-parse --show-toplevel)" = "$D4" ] || exit 9
git -C "$D4" checkout -q --detach 11c64b96f357de106c30a71c5e21ca44a3eacdc0
mkdir -p "$D4/.ufo/waves/round-36/baseline"
python3 - "$D4" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]) / '.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(pathlib.Path('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-36/baseline/c1-delta-pins.json').read_text())
p.write_text(json.dumps(dict(sorted(d.items())), indent=1) + '\n')
PY
note "CASE4 HEAD=$(git -C "$D4" rev-parse HEAD) (path absent at HEAD: $(git -C "$D4" cat-file -e HEAD:.ufo/waves/round-36/baseline/c1-delta-pins.json 2>/dev/null && echo PRESENT || echo ABSENT))"
note "CASE4 on-disk pins sha256=$(sha256sum "$D4/.ufo/waves/round-36/baseline/c1-delta-pins.json" | cut -d' ' -f1)"
run c4-list-delta  node "$V5" --list-delta --repo "$D4" --fleet "$FLEET"
run c4-list-drift  node "$V5" --list-drift --repo "$D4" --fleet "$FLEET"
note "CASE4 --list-delta lines=$(grep -c '' "$OUT/c4-list-delta.stdout") base=$(grep -c '' "$OUT/base-list-delta.stdout")"
note "CASE4 --list-drift lines=$(grep -c '' "$OUT/c4-list-drift.stdout") base=$(grep -c '' "$OUT/base-list-drift.stdout")"

# ---------- CASE 5: on-disk fallback with NOTHING on disk (absent -> Refusal?) ----------
D5=$(mktemp -d -p "$S/fx")
git clone -q --shared "$LANE" "$D5"
[ "$(git -C "$D5" rev-parse --show-toplevel)" = "$D5" ] || exit 9
git -C "$D5" checkout -q --detach 11c64b96f357de106c30a71c5e21ca44a3eacdc0
run c5-list-delta  node "$V5" --list-delta --repo "$D5" --fleet "$FLEET"

# ---------- CASE 6: does the list path reach evaluate()? instrument with a marker ----------
python3 - "$V5" "$S/v5-marked.mjs" <<'PY'
import pathlib, sys
src = pathlib.Path(sys.argv[1]).read_text()
marker = "console.error('MARKER:evaluate-reached');"
src = src.replace("export function evaluate({ repo, fleet, rev }) {",
                  "export function evaluate({ repo, fleet, rev }) {\n  " + marker)
pathlib.Path(sys.argv[2]).write_text(src)
PY
run c6-marker-listdelta node "$S/v5-marked.mjs" --list-delta --repo "$LANE" --fleet "$FLEET"
run c6-marker-predicate node "$S/v5-marked.mjs" --rev master --repo "$LANE" --fleet "$FLEET" --json

rm -rf -- "$D1" "$D2" "$D3" "$D4" "$D5"
note "=== probe done ==="
