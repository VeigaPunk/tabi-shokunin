#!/usr/bin/env bash
# tabi r98 pre-freeze controls (L1 TabiR98). Writes JSON outputs and rc lines into this directory.
# Scratch: /fast/scratch/hyaku/tabi-r98/L1/controls (removed on exit). Client deps: an npm install of
# puppeteer-core@25.16.0 + playwright-core@1.65.0 at $DEPS, and puppeteer-core@25.15.0 + playwright-core@1.65.0
# at $WRONG (the wrong-library control); both outside the lane (npm registry).
set -u
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$L/.ufo/waves/round-98/controls
S=/fast/scratch/hyaku/tabi-r98/L1/controls
DEPS=/fast/scratch/hyaku/tabi-r98/deps
WRONG=/fast/scratch/hyaku/tabi-r98/deps-wrong
TAMPER=/fast/scratch/hyaku/tabi-r98/L1/controls/deps-tamper
trap 'chmod -R u+w "$S" 2>/dev/null; rm -rf -- "$S"' EXIT
mkdir -p "$S"
D=$L/scripts/client-oopif-uploadmodes-round98.mjs
K=$L/scripts/check-client-oopif-uploadmodes-round98.mjs
N=$L/scripts/negatives-client-oopif-uploadmodes-round98.mjs
KL=$L/scripts/livekillers-client-oopif-uploadmodes-round98.mjs
P=$(sha256sum "$D" | cut -d' ' -f1)
BASE=$(cat "$C/base.txt")
sha256sum "$D" "$K" "$N" "$KL" | sed "s#$L/##" > "$C/instrument-sha256.txt"
: > "$C/rc.txt"
rc() { echo "$1 rc=$2" >> "$C/rc.txt"; }

# 1. no-work: the counting command does not exist at base
git -C "$L" cat-file -e "$BASE:scripts/check-client-oopif-uploadmodes-round98.mjs" 2>/dev/null; rc no-work-base $?
# 2. no-work: the lane's newest client receipt (r97: runner-started browsers, paths only, no launch, no
# payload, no read) under the r98 counter
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$L/corpus/evidence/round97/client-oopif-uploadfile/receipt.json" --expect-nonce tabi-r98-donothing --json > "$C/counter-donothing-r97.json"; rc no-work-r97-receipt $?
# 3. positive: a fresh driver run (defaults), then the counter in --receipt mode
TABI_R98_NONCE=tabi-r98-ctl-positive node "$D" --lane "$L" --deps "$DEPS" --scratch "$S/pos" --out "$C/receipt-positive.json" --http-port 31861 --child-port 31862 --cdp-port 31863 > "$C/driver-positive.out"; rc driver-positive $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r98-ctl-positive --json > "$C/counter-positive.json"; rc counter-positive $?
# 4. battery on the positive receipt (forgeries incl. producer polarity, duplicate/fabricated legs)
node "$N" --lane "$L" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r98-ctl-positive --expect-driver-sha256 "$P" --scratch "$S/bat" --json > "$C/battery.json"; rc battery $?
# 5. live killers: driver mutants for driver-exit / ports-bound / missing-bound through --live, each also
# run against a counter with that one check neutralised (must then pass): r97 M75-M77 class
node "$KL" --lane "$L" --deps "$DEPS" --scratch "$S/kl" --ports 31864,31865,31866 --json > "$C/livekillers.json"; rc livekillers $?
# 6. wrong library through the production path: --live with puppeteer-core 25.15.0
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$WRONG" --scratch "$S/wl" --ports 31867,31868,31869 --reps 1 --json > "$C/counter-wronglib-live.json"; rc counter-wronglib-live $?
# 7. tampered tree through the production path (r96 R96Sentinel variant C: a comment-only edit to a
# non-pinned file, every r96 pin identical): a copy of $DEPS with one comment line appended to
# puppeteer-core lib/puppeteer/cdp/CdpSession.js — version, integrity and the pinned file sha unchanged
cp -a "$DEPS" "$TAMPER" && printf '\n// tabi-r98 control 7: comment-only edit\n' >> "$TAMPER/node_modules/puppeteer-core/lib/puppeteer/cdp/CdpSession.js"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$TAMPER" --scratch "$S/tamper" --ports 31987,31988,31989 --reps 1 --json > "$C/counter-tampered-tree-live.json"; rc counter-tampered-tree-live $?
# 8. setup: busy port
python3 -c "import socket,time;s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);s.bind(('127.0.0.1',31871));s.listen();time.sleep(30)" & HOLD=$!; sleep 1
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/busy" --ports 31871,31872,31873 --json > "$C/counter-setup-busyport.json"; rc setup-busyport $?
kill $HOLD 2>/dev/null; wait $HOLD 2>/dev/null
# 9. setup: counter SIGTERM mid-run
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/term" --ports 31874,31875,31876 --json > "$C/counter-setup-sigterm.json" & CP=$!; sleep 8; kill -TERM $CP; wait $CP; rc setup-counter-sigterm $?; sleep 1
echo "setup-counter-sigterm leftover-chromium=$(pgrep -fc -- "--user-data-dir=$S/term/" || true)" >> "$C/rc.txt"
# 10. setup: deps missing (driver usage refusal)
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$S/no-such-deps" --scratch "$S/nodeps" --ports 31877,31878,31879 --json > "$C/counter-setup-nodeps.json"; rc setup-no-deps $?
# 11. setup: receipt path is a directory
mkdir -p "$S/dir-receipt.json"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$S/dir-receipt.json" --expect-nonce tabi-r98-ctl-dir --json > "$C/counter-setup-receiptdir.json"; rc setup-receipt-dir $?
# 12. setup: scratch not writable, (a) under /proc (bounded: rc 124 = the r96 hang is back), (b) chmod-500
timeout 60 node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch /proc/tabi-r98-unwritable --ports 31881,31882,31883 --json > "$C/counter-setup-unwritable.json"; rc setup-unwritable-scratch-proc $?
mkdir -p "$S/ro" && chmod 500 "$S/ro"
timeout 60 node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/ro/x" --ports 31881,31882,31883 --json > "$C/counter-setup-unwritable-ro.json"; rc setup-unwritable-scratch-ro $?
chmod 700 "$S/ro"
# 13. setup: chromium cannot start. The r98 driver sets TMPDIR=<scratch>/t itself (so Playwright's launch
# profile stays under the scratch dir), so the r97 over-long-TMPDIR control becomes an over-long --scratch:
# chromium's singleton socket path under TMPDIR then exceeds the unix socket limit.
LONG=$S/$(printf 'x%.0s' $(seq 1 90)); mkdir -p "$LONG"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$LONG" --ports 31884,31885,31886 --reps 1 --json > "$C/counter-setup-launchfail.json"; rc setup-launch-fail $?
# 14. driver pin: a counter run whose --expect-driver-sha256 is not the driver's (driver never runs)
node "$K" --lane "$L" --expect-driver-sha256 "$(printf '0%.0s' $(seq 1 64))" --live --deps "$DEPS" --scratch "$S/pin" --ports 31887,31888,31889 --json > "$C/counter-driver-pin.json"; rc driver-pin-mismatch $?
echo "done leftover-chromium-all=$(pgrep -fc -- "--user-data-dir=$S/" || true)" >> "$C/rc.txt"
