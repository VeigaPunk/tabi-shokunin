#!/usr/bin/env bash
set -u
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$L/.ufo/waves/round-100/controls
S=/fast/scratch/hyaku/tabi-r100/L1/c
DEPS=/fast/scratch/hyaku/tabi-r100/deps2
WRONG=/fast/scratch/hyaku/tabi-r100/depsw2
TAMPER=$S/deps-tamper
trap 'chmod -R u+w "$S" 2>/dev/null; rm -rf -- "$S"' EXIT
mkdir -p "$S"
D=$L/scripts/client-oopif-uploadsets-round100.mjs
K=$L/scripts/check-client-oopif-uploadsets-round100.mjs
N=$L/scripts/negatives-client-oopif-uploadsets-round100.mjs
KL=$L/scripts/livekillers-client-oopif-uploadsets-round100.mjs
D99=$L/scripts/client-oopif-uploadsets-round99.mjs
P=$(sha256sum "$D" | cut -d' ' -f1)
BASE=$(cat "$C/base.txt")
sha256sum "$D" "$K" "$N" "$KL" | sed "s#$L/##" > "$C/instrument-sha256.txt"
: > "$C/rc.txt"
rc() { echo "$1 rc=$2" >> "$C/rc.txt"; }
git -C "$L" cat-file -e "$BASE:scripts/check-client-oopif-uploadsets-round100.mjs" 2>/dev/null; rc no-work-base $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$L/corpus/evidence/round99/client-oopif-uploadsets/receipt.json" --expect-nonce tabi-r99-donothing --json > "$C/counter-donothing-r99.json"; rc no-work-r99-receipt $?
TABI_R100_NONCE=tabi-r100-ctl-positive node "$D" --lane "$L" --deps "$DEPS" --scratch "$S/pos" --out "$C/receipt-positive.json" --http-port 33361 --child-port 33362 --cdp-port 33363 > "$C/driver-positive.out"; rc driver-positive $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r100-ctl-positive --json > "$C/counter-positive.json"; rc counter-positive $?
node "$N" --lane "$L" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r100-ctl-positive --expect-driver-sha256 "$P" --scratch "$S/bat" --json > "$C/battery.json"; rc battery $?
node "$KL" --lane "$L" --deps "$DEPS" --scratch "$S/kl" --ports 33364,33365,33366 --json > "$C/livekillers.json"; rc livekillers $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$WRONG" --scratch "$S/wl" --ports 33367,33368,33369 --reps 1 --json > "$C/counter-wronglib-live.json"; rc counter-wronglib-live $?
cp -a "$DEPS" "$TAMPER" && printf '\n// tabi-r100 control 7: comment-only edit\n' >> "$TAMPER/node_modules/puppeteer-core/lib/puppeteer/cdp/CdpSession.js"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$TAMPER" --scratch "$S/tm" --ports 33487,33488,33489 --reps 1 --json > "$C/counter-tampered-tree-live.json"; rc counter-tampered-tree-live $?
python3 -c "import socket,time;s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);s.bind(('127.0.0.1',33471));s.listen();time.sleep(30)" & HOLD=$!; sleep 1
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/busy" --ports 33471,33472,33473 --json > "$C/counter-setup-busyport.json"; rc setup-busyport $?
kill $HOLD 2>/dev/null; wait $HOLD 2>/dev/null
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/term" --ports 33474,33475,33476 --json > "$C/counter-setup-sigterm.json" & CP=$!; sleep 8; kill -TERM $CP; wait $CP; rc setup-counter-sigterm $?; sleep 1
echo "setup-counter-sigterm leftover-chromium=$(pgrep -fc -- "--user-data-dir=$S/term/" || true)" >> "$C/rc.txt"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$S/no-such-deps" --scratch "$S/nodeps" --ports 33477,33478,33479 --json > "$C/counter-setup-nodeps.json"; rc setup-no-deps $?
mkdir -p "$S/dir-receipt.json"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$S/dir-receipt.json" --expect-nonce tabi-r100-ctl-dir --json > "$C/counter-setup-receiptdir.json"; rc setup-receipt-dir $?
timeout 60 node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch /proc/tabi-r100-unwritable --ports 33481,33482,33483 --json > "$C/counter-setup-unwritable.json"; rc setup-unwritable-scratch-proc $?
mkdir -p "$S/ro" && chmod 500 "$S/ro"
timeout 60 node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/ro/x" --ports 33481,33482,33483 --json > "$C/counter-setup-unwritable-ro.json"; rc setup-unwritable-scratch-ro $?
chmod 700 "$S/ro"
LONG=$S/$(printf 'x%.0s' $(seq 1 90)); mkdir -p "$LONG"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$LONG" --ports 33484,33485,33486 --reps 1 --json > "$C/counter-setup-launchfail.json"; rc setup-launch-fail $?
node "$K" --lane "$L" --expect-driver-sha256 "$(printf '0%.0s' $(seq 1 64))" --live --deps "$DEPS" --scratch "$S/pin" --ports 33487,33488,33489 --json > "$C/counter-driver-pin.json"; rc driver-pin-mismatch $?
TABI_R100_NONCE=tabi-r100-ctl-strace strace -f -qq -e trace=mkdir,mkdirat -o "$S/st100.txt" node "$D" --lane "$L" --deps "$DEPS" --scratch "$S/s100" --out "$S/s100.json" --http-port 33491 --child-port 33492 --cdp-port 33493 --reps 1 > /dev/null; rc tmpdir-strace-r100-driver $?
TABI_R99_NONCE=tabi-r99-ctl-strace strace -f -qq -e trace=mkdir,mkdirat -o "$S/st99.txt" node "$D99" --lane "$L" --deps "$DEPS" --scratch "$S/s99" --out "$S/s99.json" --http-port 33494 --child-port 33495 --cdp-port 33496 --reps 1 > /dev/null; rc tmpdir-strace-r99-driver $?
grep 'playwright-artifacts' "$S/st100.txt" > "$C/tmpdir-strace-r100.txt"
grep 'playwright-artifacts' "$S/st99.txt" > "$C/tmpdir-strace-r99.txt"
# r99 driver no longer exists under that name in this tree; the r99 control used the r98 driver as the D2 witness. Here the witness is the r98 driver (pre-D2) so it still fires; r100 must be 0.
TABI_R98_NONCE=tabi-r98-ctl-strace strace -f -qq -e trace=mkdir,mkdirat -o "$S/st98.txt" node "$L/scripts/client-oopif-uploadmodes-round98.mjs" --lane "$L" --deps "$DEPS" --scratch "$S/s98" --out "$S/s98.json" --http-port 33497 --child-port 33498 --cdp-port 33499 --reps 1 > /dev/null; rc tmpdir-strace-r98-driver $?
grep 'playwright-artifacts' "$S/st98.txt" > "$C/tmpdir-strace-r98.txt"
echo "tmpdir-strace r98-under-tmp=$(grep -c '"/tmp/playwright-artifacts-' "$C/tmpdir-strace-r98.txt") r100-under-tmp=$(grep -c '"/tmp/playwright-artifacts-' "$C/tmpdir-strace-r100.txt") r100-under-scratch=$(grep -c "\"$S/s100/t/playwright-artifacts-" "$C/tmpdir-strace-r100.txt")" >> "$C/rc.txt"
echo "done leftover-chromium-all=$(pgrep -fc -- "--user-data-dir=$S/" || true)" >> "$C/rc.txt"
