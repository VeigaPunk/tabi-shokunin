#!/usr/bin/env bash
set -u
S=/fast/scratch/hyaku/tabi-r37/w1/CritC1a
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
CLONE=$S/lane-clone
V5=$LANE/.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs
V4=$LANE/.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs
export TMPDIR=$S/tmp
mkdir -p "$S/results"

run() { # name counter rev
  local name=$1 counter=$2 rev=$3
  node "$counter" --rev "$rev" --repo "$CLONE" --fleet "$FLEET" --json \
    > "$S/results/$name.stdout" 2> "$S/results/$name.stderr"
  echo "$?" > "$S/results/$name.exit"
}

run v5-honest      "$V5" ed8ccfc00ad3784bc424aa118e056f8edf4ee803 &
run v5-crlf        "$V5" 29180a6425853d59215201239e90ad7b7ff7a945 &
run v5-trail       "$V5" 223a1651296c5d1bdd2a62f7b7329bf2fb4a2add &
run v5-dup         "$V5" 02430fe70e5fbef9cad435af3377f1b1ec5975ce &
run v5-sorted      "$V5" 35f96b056dce55a95c9199df0e2e921afb55fe3e &
run v5-invalid     "$V5" 35562f2d60f600b58552aef08d4fc85e9d9efc64 &
run v5-unknown     "$V5" 7691be17640c963ddcdf9638023a527ae610ff47 &
run v5-absent      "$V5" 78841293a07fb1dfa03030323145999c4889b169 &
run v4-honest      "$V4" ed8ccfc00ad3784bc424aa118e056f8edf4ee803 &
run v4-crlf        "$V4" 29180a6425853d59215201239e90ad7b7ff7a945 &
run v4-dup         "$V4" 02430fe70e5fbef9cad435af3377f1b1ec5975ce &
run v4-sorted      "$V4" 35f96b056dce55a95c9199df0e2e921afb55fe3e &
wait
echo ALLDONE
