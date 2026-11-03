#!/usr/bin/env bash
# R56Critic probe: falsify the frozen v15 meter's head/absence handling on
# throwaway fixtures. Read-only against the lane and the fleet; every fixture
# lives under $HYAKU_SCRATCH/tabi-r56/R56Critic/probe (removed at exit).
set -u
M=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-55/counters/c1-adjacency-host-v15.mjs
OUT=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/critic/probe-out
S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r56/R56Critic/probe"
rm -rf -- "$S"; mkdir -p "$S" "$OUT"; trap 'rm -rf -- "$S"' EXIT
G() { git -C "$1" -c user.name=fixture -c user.email=fixture@invalid "${@:2}"; }
mkrepo() { mkdir -p "$1"; git -C "$1" init -q; test "$(git -C "$1" rev-parse --show-toplevel)" = "$1" || exit 9; }
ledgers() { # $1=fixture repo  $2=audit status  $3=delta row (tab-joined tail)  $4=sha-of-PROVINCE or -
  mkdir -p "$1/corpus"
  printf 'id\tlane\tsibling_ref\tcited\tc5\tc6\tc7\tc8\tc9\nb1\tzeta-shokunin\tzeta-shokunin@1111111111111111111111111111111111111111:PROVINCE.md:1\tx\t-\t-\tsplit-declared\t-\t-\n' > "$1/corpus/adjacency.tsv"
  printf 'ref\tstatus\tnote\nzeta-shokunin@1111111111111111111111111111111111111111:PROVINCE.md:1\t%s\tprobe\n' "$2" > "$1/corpus/adjacency-host-audit-r55.tsv"
  printf 'type\tlane\tpath\tsha\tlines\tbgHits\tquote\tdisp\thead\n%b\n' "$3" > "$1/corpus/adjacency-host-delta-r55.tsv"
  G "$1" add -A; G "$1" commit -q -m probe; git -C "$1" rev-parse HEAD
}
run() { # $1=name $2=rev $3=fleet
  node "$M" --rev "$2" --repo "$FX" --fleet "$3" --json > "$OUT/$1.json"; rc=$?
  echo "$1 exit=$rc predicate=$(node -e 'const j=require(process.argv[1]);console.log(j.predicate)' "$OUT/$1.json") findings=$(node -e 'const j=require(process.argv[1]);console.log(j.findings.map(f=>f.id).join(","))' "$OUT/$1.json")"
}
FX="$S/fx"; mkrepo "$FX"

# A: lane dir present, .git present but not a repository (HEAD unresolvable); claim sibling-absent
mkdir -p "$S/fleetA/zeta-shokunin"; printf 'gitdir: /nonexistent/zeta\n' > "$S/fleetA/zeta-shokunin/.git"
REV=$(ledgers "$FX" sibling-absent "lane\tzeta-shokunin\tPROVINCE.md\t-\t-\t-\t-\t-\t-")
run A "$REV" "$S/fleetA"

# B: control - same claim, real repo carrying PROVINCE.md
mkrepo "$S/fleetB/zeta-shokunin"; echo x > "$S/fleetB/zeta-shokunin/PROVINCE.md"; G "$S/fleetB/zeta-shokunin" add -A; G "$S/fleetB/zeta-shokunin" commit -q -m p
run B "$REV" "$S/fleetB"

# C: case A with a different sibling_ref sha (ref sha is never read)
FX_SAVE="$FX"; FX="$S/fx"
printf 'id\tlane\tsibling_ref\tcited\tc5\tc6\tc7\tc8\tc9\nb1\tzeta-shokunin\tzeta-shokunin@2222222222222222222222222222222222222222:PROVINCE.md:1\tx\t-\t-\tsplit-declared\t-\t-\n' > "$FX/corpus/adjacency.tsv"
printf 'ref\tstatus\tnote\nzeta-shokunin@2222222222222222222222222222222222222222:PROVINCE.md:1\tsibling-absent\tprobe\n' > "$FX/corpus/adjacency-host-audit-r55.tsv"
G "$FX" add -A; G "$FX" commit -q -m c; REVC=$(git -C "$FX" rev-parse HEAD)
run C "$REVC" "$S/fleetA"

# D: PROVINCE.md absent at head; delta lane row carries a FAKE head
mkrepo "$S/fleetD/zeta-shokunin"; echo readme > "$S/fleetD/zeta-shokunin/README.md"; G "$S/fleetD/zeta-shokunin" add -A; G "$S/fleetD/zeta-shokunin" commit -q -m r
REVD=$(ledgers "$FX" file-absent "lane\tzeta-shokunin\tPROVINCE.md\t-\t-\t-\t-\t-\tcccccccccccccccccccccccccccccccccccccccc")
run D "$REVD" "$S/fleetD"

# E: control - PROVINCE.md present at head; same FAKE head must be a finding
echo x > "$S/fleetD/zeta-shokunin/PROVINCE.md"; G "$S/fleetD/zeta-shokunin" add -A; G "$S/fleetD/zeta-shokunin" commit -q -m p
SHA=$(sha256sum "$S/fleetD/zeta-shokunin/PROVINCE.md" | cut -c1-64)
REVE=$(ledgers "$FX" unchanged "lane\tzeta-shokunin\tPROVINCE.md\t$SHA\t1\t0\t-\t-\tcccccccccccccccccccccccccccccccccccccccc")
run E "$REVE" "$S/fleetD"
FX="$FX_SAVE"
