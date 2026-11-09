#!/bin/sh
# R100Sentinel: exit-3 laundering matrix (limit 8).
# FROZEN counter bytes (real lane) vs HARDENED counter bytes (r99 Sentinel remediation:
# the outcome/browserId/files null conjunct on the launchFailed filter).
# Each run: a scratch lane holding a mutant driver, pinned at THAT mutant's sha256.
# NOTE: scratch dirs must be SHORT (plan limit 7: a --scratch over ~60 bytes makes chromium
# fail to start); the counter appends /driver and the driver appends /leg-<id>/profile.
R=/fast/scratch/hyaku/tabi-r100/R100Sentinel
L=/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts
FROZEN=$L/check-client-oopif-uploadsets-round100.mjs
HARD=$R/hardened-counter.mjs
PORTS=34171,34172,34173

run () {  # run <tag> <shortscratch> <counter> <lane> <driversha>
  tag=$1; sc=$2; ctr=$3; lane=$4; sha=$5
  s=$R/$sc
  rm -rf "$s"; mkdir -p "$s"
  node "$ctr" --lane "$lane" --expect-driver-sha256 "$sha" --live \
    --deps "$R/deps" --scratch "$s" --ports $PORTS --reps 3 --json > "$R/out-$tag.json" 2> "$R/out-$tag.err"
  rc=$?
  echo "$tag rc=$rc" >> "$R/matrix-rc.txt"
  echo "--- $tag rc=$rc"
  python3 - "$R/out-$tag.json" "$tag" <<'PY'
import json,sys
p,tag=sys.argv[1],sys.argv[2]
try: d=json.load(open(p))
except Exception as e:
    print(tag,'UNPARSEABLE',e); raise SystemExit
print(' verdict',d.get('verdict'),'checkCount',d.get('checkCount'),'launchFailed',d.get('launchFailed'))
print(' driverExit',(d.get('driverRun') or {}).get('status'),'detail',str(d.get('detail'))[:140])
for f in (d.get('findings') or [])[:10]:
    print('  finding',f.get('id'),f.get('leg'),str(f.get('detail'))[:110])
PY
}

: > "$R/matrix-rc.txt"
SHA_A=$(sha256sum "$R/mutA.mjs" | cut -d' ' -f1)
SHA_B=$(sha256sum "$R/mutB.mjs" | cut -d' ' -f1)
SHA_I=$(sha256sum "$R/mutI.mjs" | cut -d' ' -f1)
SHA_V=$(sha256sum "$R/mutV.mjs" | cut -d' ' -f1)
SHA_F=97947b0b1a4522a48cf08c3681bc13368534608841094a755dd4cf938b306b90

run mutA-frozen     a "$FROZEN" "$R/lane-mutA" "$SHA_A"   # laundering: MIXED-1 resolves + labelled launch-fail
run mutB-frozen     b "$FROZEN" "$R/lane-mutB" "$SHA_B"   # laundering + violation on a DIFFERENT leg
run mutI-frozen     c "$FROZEN" "$R/lane-mutI" "$SHA_I"   # genuine launch failure (legit skip)
run mutV-frozen     d "$FROZEN" "$R/lane-mutV" "$SHA_V"   # law violation, NO exit-3 label (baseline: must be rc 1)
run mutA-hardened   e "$HARD"   "$R/lane-mutA" "$SHA_A"   # remediation vs the laundering
run mutI-hardened   f "$HARD"   "$R/lane-mutI" "$SHA_I"   # remediation vs the legitimate skip
run frozen-hardened g "$HARD"   "$R/lane-frozen" "$SHA_F" # remediation, no regression on the pinned driver
echo "=== matrix-rc.txt ==="; cat "$R/matrix-rc.txt"
