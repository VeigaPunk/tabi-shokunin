#!/usr/bin/env bash
# tabi r99 pre-freeze controls (L1 TabiR99). Writes JSON outputs and rc lines into this directory.
# Scratch: /fast/scratch/hyaku/tabi-r99/L1/c (removed on exit; short name: the driver puts TMPDIR under the
# counter scratch and chromium's singleton socket path must fit sun_path). Client deps: an npm install of
# puppeteer-core@25.16.0 + playwright-core@1.65.0 at $DEPS, and puppeteer-core@25.15.0 + playwright-core@1.65.0
# at $WRONG (the wrong-library control); both outside the lane (npm registry).
set -u
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$L/.ufo/waves/round-99/controls
S=/fast/scratch/hyaku/tabi-r99/L1/c
DEPS=/fast/scratch/hyaku/tabi-r99/deps
WRONG=/fast/scratch/hyaku/tabi-r99/deps-wrong
TAMPER=$S/deps-tamper
trap 'chmod -R u+w "$S" 2>/dev/null; rm -rf -- "$S"' EXIT
mkdir -p "$S"
D=$L/scripts/client-oopif-uploadsets-round99.mjs
K=$L/scripts/check-client-oopif-uploadsets-round99.mjs
N=$L/scripts/negatives-client-oopif-uploadsets-round99.mjs
KL=$L/scripts/livekillers-client-oopif-uploadsets-round99.mjs
D98=$L/scripts/client-oopif-uploadmodes-round98.mjs
P=$(sha256sum "$D" | cut -d' ' -f1)
BASE=$(cat "$C/base.txt")
sha256sum "$D" "$K" "$N" "$KL" | sed "s#$L/##" > "$C/instrument-sha256.txt"
: > "$C/rc.txt"
rc() { echo "$1 rc=$2" >> "$C/rc.txt"; }

# 1. no-work: the counting command does not exist at base
git -C "$L" cat-file -e "$BASE:scripts/check-client-oopif-uploadsets-round99.mjs" 2>/dev/null; rc no-work-base $?
# 2. no-work: the lane's newest client receipt (r98: one file per call, #s only, no multiple input, no
# untyped/binary payload, one read API) under the r99 counter
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$L/corpus/evidence/round98/client-oopif-uploadmodes/receipt.json" --expect-nonce tabi-r99-donothing --json > "$C/counter-donothing-r98.json"; rc no-work-r98-receipt $?
# 3. positive: a fresh driver run (defaults), then the counter in --receipt mode
TABI_R99_NONCE=tabi-r99-ctl-positive node "$D" --lane "$L" --deps "$DEPS" --scratch "$S/pos" --out "$C/receipt-positive.json" --http-port 32861 --child-port 32862 --cdp-port 32863 > "$C/driver-positive.out"; rc driver-positive $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r99-ctl-positive --json > "$C/counter-positive.json"; rc counter-positive $?
# 4. battery on the positive receipt (forgeries incl. producer polarity, duplicate/fabricated legs, R98Mut
# survivor classes)
node "$N" --lane "$L" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r99-ctl-positive --expect-driver-sha256 "$P" --scratch "$S/bat" --json > "$C/battery.json"; rc battery $?
# 5. live killers: driver mutants for driver-exit / ports-bound / missing-bound / tmpdir-bound through
# --live, each also against a counter with that one check neutralised; r98 D3: a partial launch failure
# with a law change (frozen rc 1, r98 mapping rc 2) and a launch failure alone (rc 2 setup)
node "$KL" --lane "$L" --deps "$DEPS" --scratch "$S/kl" --ports 32864,32865,32866 --json > "$C/livekillers.json"; rc livekillers $?
# 6. wrong library through the production path: --live with puppeteer-core 25.15.0
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$WRONG" --scratch "$S/wl" --ports 32867,32868,32869 --reps 1 --json > "$C/counter-wronglib-live.json"; rc counter-wronglib-live $?
# 7. tampered tree through the production path: a copy of $DEPS with one comment line appended to
# puppeteer-core lib/puppeteer/cdp/CdpSession.js — version, integrity and the pinned file sha unchanged
cp -a "$DEPS" "$TAMPER" && printf '\n// tabi-r99 control 7: comment-only edit\n' >> "$TAMPER/node_modules/puppeteer-core/lib/puppeteer/cdp/CdpSession.js"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$TAMPER" --scratch "$S/tm" --ports 32987,32988,32989 --reps 1 --json > "$C/counter-tampered-tree-live.json"; rc counter-tampered-tree-live $?
# 8. setup: busy port
python3 -c "import socket,time;s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);s.bind(('127.0.0.1',32871));s.listen();time.sleep(30)" & HOLD=$!; sleep 1
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/busy" --ports 32871,32872,32873 --json > "$C/counter-setup-busyport.json"; rc setup-busyport $?
kill $HOLD 2>/dev/null; wait $HOLD 2>/dev/null
# 9. setup: counter SIGTERM mid-run
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/term" --ports 32874,32875,32876 --json > "$C/counter-setup-sigterm.json" & CP=$!; sleep 8; kill -TERM $CP; wait $CP; rc setup-counter-sigterm $?; sleep 1
echo "setup-counter-sigterm leftover-chromium=$(pgrep -fc -- "--user-data-dir=$S/term/" || true)" >> "$C/rc.txt"
# 10. setup: deps missing (driver usage refusal)
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$S/no-such-deps" --scratch "$S/nodeps" --ports 32877,32878,32879 --json > "$C/counter-setup-nodeps.json"; rc setup-no-deps $?
# 11. setup: receipt path is a directory
mkdir -p "$S/dir-receipt.json"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$S/dir-receipt.json" --expect-nonce tabi-r99-ctl-dir --json > "$C/counter-setup-receiptdir.json"; rc setup-receipt-dir $?
# 12. setup: scratch not writable, (a) under /proc (bounded: rc 124 = the r96 hang is back), (b) chmod-500
timeout 60 node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch /proc/tabi-r99-unwritable --ports 32881,32882,32883 --json > "$C/counter-setup-unwritable.json"; rc setup-unwritable-scratch-proc $?
mkdir -p "$S/ro" && chmod 500 "$S/ro"
timeout 60 node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/ro/x" --ports 32881,32882,32883 --json > "$C/counter-setup-unwritable-ro.json"; rc setup-unwritable-scratch-ro $?
chmod 700 "$S/ro"
# 13. setup: chromium cannot start on any leg (a 90+-byte --scratch: chromium's singleton socket path under
# the driver's TMPDIR exceeds sun_path). Under the r99 exit-3 handling this must stay `setup`, not findings.
LONG=$S/$(printf 'x%.0s' $(seq 1 90)); mkdir -p "$LONG"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$LONG" --ports 32884,32885,32886 --reps 1 --json > "$C/counter-setup-launchfail.json"; rc setup-launch-fail $?
# 14. driver pin: a counter run whose --expect-driver-sha256 is not the driver's (driver never runs)
node "$K" --lane "$L" --expect-driver-sha256 "$(printf '0%.0s' $(seq 1 64))" --live --deps "$DEPS" --scratch "$S/pin" --ports 32887,32888,32889 --json > "$C/counter-driver-pin.json"; rc driver-pin-mismatch $?
# 15. r98 D2 (TMPDIR before the clients load), shown able to fail: mkdir syscalls of the whole driver
# process tree, r98 driver vs r99 driver, --reps 1 each; count playwright-artifacts dirs made under /tmp.
# Expected: r98 > 0, r99 = 0 (and r99 > 0 under its own scratch t/, so the probe sees the dirs at all).
TABI_R98_NONCE=tabi-r98-r99ctl-strace strace -f -qq -e trace=mkdir,mkdirat -o "$S/st98.txt" node "$D98" --lane "$L" --deps "$DEPS" --scratch "$S/s8" --out "$S/s8.json" --http-port 32891 --child-port 32892 --cdp-port 32893 --reps 1 > /dev/null; rc tmpdir-strace-r98-driver $?
TABI_R99_NONCE=tabi-r99-ctl-strace strace -f -qq -e trace=mkdir,mkdirat -o "$S/st99.txt" node "$D" --lane "$L" --deps "$DEPS" --scratch "$S/s9" --out "$S/s9.json" --http-port 32894 --child-port 32895 --cdp-port 32896 --reps 1 > /dev/null; rc tmpdir-strace-r99-driver $?
grep 'playwright-artifacts' "$S/st98.txt" > "$C/tmpdir-strace-r98.txt"; grep 'playwright-artifacts' "$S/st99.txt" > "$C/tmpdir-strace-r99.txt"
echo "tmpdir-strace r98-under-tmp=$(grep -c '"/tmp/playwright-artifacts-' "$C/tmpdir-strace-r98.txt") r99-under-tmp=$(grep -c '"/tmp/playwright-artifacts-' "$C/tmpdir-strace-r99.txt") r99-under-scratch=$(grep -c "\"$S/s9/t/playwright-artifacts-" "$C/tmpdir-strace-r99.txt")" >> "$C/rc.txt"
echo "done leftover-chromium-all=$(pgrep -fc -- "--user-data-dir=$S/" || true)" >> "$C/rc.txt"
