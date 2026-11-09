#!/usr/bin/env bash
# tabi r97 mined check (lesson round-97 §Mistakes 1): after ANY edit to a round driver, one positive rep must
# run with zero leg failures before the freeze. A line-anchored edit at a guessed line number that overwrites
# a block opener can still parse (see check-instruments-syntax.sh) but breaks legs at run time.
# Usage: check-driver-positive.sh <driver.mjs> <deps dir> <scratch dir> <http,child,cdp>
# Exit 0: driver exit 0 and receipt `failures` empty; 1: otherwise (driver rc and failures printed).
set -u
D=$1; DEPS=$2; S=$3; IFS=, read -r H C P <<< "$4"
mkdir -p "$S"
TABI_R97_NONCE=tabi-r97-mined-positive node "$D" --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --deps "$DEPS" --scratch "$S/run" --out "$S/receipt.json" --http-port "$H" --child-port "$C" --cdp-port "$P" --reps 1 >/dev/null 2>&1
rc=$?
n=$(python3 -c "import json,sys;print(len(json.load(open(sys.argv[1]))['failures']))" "$S/receipt.json" 2>/dev/null || echo missing)
echo "driver=$D rc=$rc failures=$n"
rm -rf -- "$S"
[ "$rc" = 0 ] && [ "$n" = 0 ]
