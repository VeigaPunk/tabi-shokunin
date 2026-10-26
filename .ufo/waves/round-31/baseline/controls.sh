#!/usr/bin/env bash
# tabi round 31 — freeze-time controls for C1 (decision-table) and C2 (self-assessment v2).
# Runs every control on a scratch clone of the freeze tree T0 (counters + registry rows +
# freeze-time corrections; no claim work). Never touches the lane checkout.
# usage: controls.sh <T0-clone-dir> <out-dir> <prefetch-dir>
set -euo pipefail
T0=$1; OUT=$2; PRE=$3
SCR=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r31/l1/ctl
BASE=96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc
ENTRY=corpus/knowledge/rate-signal-decision-table.md
export TMPDIR=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r31/l1/tmp
mkdir -p "$OUT" "$SCR" "$TMPDIR"
trap 'rm -rf -- "$SCR"' EXIT

fresh() { # fresh <name> -> prints clone dir
  local d="$SCR/$1"; rm -rf "$d"; git clone -q --shared "$T0" "$d"
  [ "$(git -C "$d" rev-parse --show-toplevel)" = "$d" ] || { echo "toplevel mismatch $d" >&2; exit 9; }
  echo "$d"
}
commit() { git -C "$1" add -A && git -C "$1" -c user.name=tabi-fixture -c user.email=fixture@tabi.local commit -qm "$2"; git -C "$1" rev-parse HEAD; }
dt() { # dt <dir> <rev> <outfile> [--live]
  local d=$1 rev=$2 of=$3; shift 3
  (cd "$d" && node scripts/check-decision-table.mjs --rev "$rev" --baseline "$BASE" --entry "$ENTRY" "$@" --json > "$of"; echo "exit=$?" >> "$of.exit") || true
}
sa() { local d=$1 rev=$2 of=$3; (cd "$d" && node scripts/check-selfassessment.mjs --rev "$rev" --json > "$of"; echo "exit=$?" >> "$of.exit") || true; }

# ---------------- C1 ----------------
# J1 do-nothing
d=$(fresh c1j1); r=$(git -C "$d" rev-parse HEAD); dt "$d" "$r" "$OUT/c1-J1-do-nothing.json" --live

# J2 rows citing rows already in the registry at baseline (S107 RFC 9110, S116 draft -11), real quotes
d=$(fresh c1j2)
python3 - "$d" "$ENTRY" <<'PY'
import sys, json, hashlib, os, re
d, entry = sys.argv[1], sys.argv[2]
reg = open(f"{d}/corpus/SOURCES.md").read()
# append the entry to used-by of S107/S116 so only r4 can refuse them
lines = []
for l in reg.split("\n"):
    m = re.match(r"^ {0,3}\| (S107|S116) \|", l)
    if m:
        l = l.rstrip()
        assert l.endswith("|")
        l = l[:-1].rstrip() + f", {entry} |"
    lines.append(l)
open(f"{d}/corpus/SOURCES.md", "w").write("\n".join(lines))
table = """# Control J2 — rows citing pre-existing registry rows

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | `429` with `Retry-After: 120` | wait | 120 s | S107 | "Retry-After: Fri, 31 Dec 1999 23:59:59 GMT Retry-After: 120" |
| D2 | `RateLimit` field `t=10` | wait | 10 s | S116 | "The effective window (t) of 10 seconds" |
"""
os.makedirs(os.path.dirname(f"{d}/{entry}"), exist_ok=True)
open(f"{d}/{entry}", "w").write(table)
PY
r=$(commit "$d" J2); dt "$d" "$r" "$OUT/c1-J2-old-rows.json"

# J3 self-quote receipts: new rows whose receipt bytes are the entry's own text (invented quotes)
d=$(fresh c1j3)
python3 - "$d" "$ENTRY" <<'PY'
import sys, json, hashlib, os
d, entry = sys.argv[1], sys.argv[2]
rows = [
 ("S119", "https://www.rfc-editor.org/rfc/rfc9309.txt", "D1", "`robots.txt` answers `301`", "follow", "at least 7 redirects", "Crawlers SHOULD follow at least seven consecutive redirects before giving up on the file."),
 ("S120", "https://www.rfc-editor.org/rfc/rfc6585.txt", "D2", "`429` without `Retry-After`", "wait", "at least 90 seconds", "Clients SHOULD wait at least ninety seconds before repeating a request that received this status."),
]
table = ["# Control J3 — self-quote receipts", "", "| Row | Signal | Decision | Threshold | Source | Located quote |", "|---|---|---|---|---|---|"]
reg_add = []
os.makedirs(f"{d}/corpus/evidence/round-31/decision-table/bytes", exist_ok=True)
for sid, url, rid, sig, dec, thr, q in rows:
    table.append(f'| {rid} | {sig} | {dec} | {thr} | {sid} | "{q}" |')
    reg_add.append(f"| {sid} | Control — {url} | spec | A | control | control | control | mined | 2026-10-26 | 180d | {entry} |")
text = "\n".join(table) + "\n"
os.makedirs(os.path.dirname(f"{d}/{entry}"), exist_ok=True)
open(f"{d}/{entry}", "w").write(text)
for sid, url, *_ in rows:
    bp = f"corpus/evidence/round-31/decision-table/bytes/{sid}.txt"
    open(f"{d}/{bp}", "w").write(text)
    json.dump({"id": sid, "url": url, "fetched_at": "2026-10-26T00:00:00Z", "fetched_by": "control", "http_status": 200, "bytes_path": bp, "sha256": hashlib.sha256(text.encode()).hexdigest()}, open(f"{d}/corpus/evidence/round-31/decision-table/{sid}.json", "w"))
reg = open(f"{d}/corpus/SOURCES.md").read().split("\n")
idx = max(i for i, l in enumerate(reg) if l.startswith("| S118 |"))
reg[idx+1:idx+1] = reg_add
open(f"{d}/corpus/SOURCES.md", "w").write("\n".join(reg))
PY
r=$(commit "$d" J3); dt "$d" "$r" "$OUT/c1-J3-selfquote-offline.json"; dt "$d" "$r" "$OUT/c1-J3-selfquote-live.json" --live

# J4 real receipt bytes and real quotes (RFC 9309, fetched 2026-10-26), thresholds the author's own
d=$(fresh c1j4)
python3 - "$d" "$ENTRY" "$PRE" <<'PY'
import sys, json, hashlib, os, shutil
d, entry, pre = sys.argv[1:4]
src = open(f"{pre}/rfc9309.txt", "rb").read()
bp = "corpus/evidence/round-31/decision-table/bytes/S119.txt"
os.makedirs(f"{d}/corpus/evidence/round-31/decision-table/bytes", exist_ok=True)
open(f"{d}/{bp}", "wb").write(src)
url = "https://www.rfc-editor.org/rfc/rfc9309.txt"
json.dump({"id": "S119", "url": url, "fetched_at": "2026-10-26T08:18:00Z", "fetched_by": "control", "http_status": 200, "bytes_path": bp, "sha256": hashlib.sha256(src).hexdigest()}, open(f"{d}/corpus/evidence/round-31/decision-table/S119.json", "w"))
table = """# Control J4 — real quotes, invented thresholds

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | `robots.txt` answers `301` | follow | at least 10 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" |
| D2 | cached `robots.txt` | refetch | 12 hours | S119 | "Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable." |
| D3 | `robots.txt` size | limit | 64 KiB | S119 | "The parsing limit MUST be at least 500 kibibytes [KiB]." |
"""
os.makedirs(os.path.dirname(f"{d}/{entry}"), exist_ok=True)
open(f"{d}/{entry}", "w").write(table)
reg = open(f"{d}/corpus/SOURCES.md").read().split("\n")
idx = max(i for i, l in enumerate(reg) if l.startswith("| S118 |"))
reg[idx+1:idx+1] = [f"| S119 | RFC 9309 Robots Exclusion Protocol — {url} | spec | A | control | control | control | mined | 2026-10-26 | 180d | {entry} |"]
open(f"{d}/corpus/SOURCES.md", "w").write("\n".join(reg))
PY
r=$(commit "$d" J4); dt "$d" "$r" "$OUT/c1-J4-invented-thresholds.json" --live

# J5 package entry copied as-is to the entry path, staged S126 row appended unchanged
d=$(fresh c1j5)
cp /home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/host-rate-limit-signal-surface.md "$d/$ENTRY"
python3 - "$d" <<'PY'
import sys, re
d = sys.argv[1]
staged = [l for l in open("/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md").read().split("\n") if re.match(r"^ {0,3}\| S126 \|", l)]
reg = open(f"{d}/corpus/SOURCES.md").read().split("\n")
idx = max(i for i, l in enumerate(reg) if l.startswith("| S118 |"))
reg[idx+1:idx+1] = staged
open(f"{d}/corpus/SOURCES.md", "w").write("\n".join(reg))
PY
r=$(commit "$d" J5); dt "$d" "$r" "$OUT/c1-J5-package-as-is.json" --live

# ---------------- C2 ----------------
STALE_SKILL="1614 2479 2514 2515 2529 2530 2543 2544"
# J1 do-nothing
d=$(fresh c2j1); r=$(git -C "$d" rev-parse HEAD); sa "$d" "$r" "$OUT/c2-J1-do-nothing.json"

# J2 delete the stale lines instead of correcting them
d=$(fresh c2j2)
python3 - "$d" "$STALE_SKILL" <<'PY'
import sys
d, stale = sys.argv[1], [int(x) for x in sys.argv[2].split()]
s = open(f"{d}/SKILL.md").read().split("\n")
s = [l for i, l in enumerate(s, 1) if i not in stale]
open(f"{d}/SKILL.md", "w").write("\n".join(s))
r = open(f"{d}/corpus/README.md").read().split("\n")
r = [l for i, l in enumerate(r, 1) if i != 613]
open(f"{d}/corpus/README.md", "w").write("\n".join(r))
PY
r=$(commit "$d" J2); sa "$d" "$r" "$OUT/c2-J2-delete-lines.json"
git -C "$d" diff --numstat "$r^" "$r" -- SKILL.md corpus/README.md > "$OUT/c2-J2-delete-lines.numstat"

# J3 one blanket correction paragraph with every oracle-correct number, citing no line
d=$(fresh c2j3)
cat >> "$d/SKILL.md" <<'EOF'

Correction (control J3): every stale tally above is superseded — `scripts/check-sources.mjs` `--selftest` (26/26), `scripts/check-s106-evidence.mjs` `--selftest` (10/10), `scripts/check-release-pins.mjs` `--selftest` (29/29), `scripts/check-selfassessment.mjs` `--selftest` (30/30).
EOF
cat >> "$d/corpus/README.md" <<'EOF'

Correction (control J3): `scripts/check-selfassessment.mjs` `--selftest` (30/30) supersedes the stale tally above.
EOF
r=$(commit "$d" J3); sa "$d" "$r" "$OUT/c2-J3-uncited-correction.json"

# J4 corrections citing the wrong document (SCORECARD.md:N / README.md:N instead of SKILL.md:N / corpus/README.md:N)
d=$(fresh c2j4)
python3 - "$d" "$STALE_SKILL" <<'PY'
import sys
d, stale = sys.argv[1], [int(x) for x in sys.argv[2].split()]
obs = {1614: ("scripts/check-sources.mjs", 26), 2479: ("scripts/check-selfassessment.mjs", 30), 2514: ("scripts/check-s106-evidence.mjs", 10),
       2515: ("scripts/check-selfassessment.mjs", 30), 2529: ("scripts/check-s106-evidence.mjs", 10), 2530: ("scripts/check-selfassessment.mjs", 30),
       2543: ("scripts/check-release-pins.mjs", 29), 2544: ("scripts/check-s106-evidence.mjs", 10)}
add = []
for n in stale:
    s, v = obs[n]
    add += ["", f"Correction (control J4, supersedes `SCORECARD.md:{n}`): `{s}` `--selftest` ({v}/{v})."]
open(f"{d}/SKILL.md", "a").write("\n".join(add) + "\n")
open(f"{d}/corpus/README.md", "a").write("\nCorrection (control J4, supersedes `README.md:613`): `scripts/check-selfassessment.mjs` `--selftest` (30/30).\n")
PY
r=$(commit "$d" J4); sa "$d" "$r" "$OUT/c2-J4-wrong-doc-citation.json"

for f in "$OUT"/*.json; do
  case "$f" in
    *c1-*) printf '%s %s\n' "$(basename "$f")" "$(jq -c '{population,admitted,failing,reasons:([.rows[].reason]|unique)}' "$f")";;
    *c2-*) printf '%s %s\n' "$(basename "$f")" "$(jq -c '{mismatches}' "$f")";;
  esac
done | tee "$OUT/controls-summary.txt"
