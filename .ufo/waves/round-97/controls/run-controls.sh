#!/usr/bin/env bash
# tabi r97 pre-freeze controls (L1 TabiR97). Writes JSON outputs and rc lines into this directory.
# Scratch: /fast/scratch/hyaku/tabi-r97/L1/controls (removed on exit). Client deps: an npm install of
# puppeteer-core@25.16.0 + playwright-core@1.65.0 at $DEPS, and puppeteer-core@25.15.0 + playwright-core@1.65.0
# at $WRONG (the wrong-library control); both outside the lane (npm registry).
set -u
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$L/.ufo/waves/round-97/controls
S=/fast/scratch/hyaku/tabi-r97/L1/controls
DEPS=/fast/scratch/hyaku/tabi-r97/deps
WRONG=/fast/scratch/hyaku/tabi-r97/deps-wrong
TAMPER=/fast/scratch/hyaku/tabi-r97/L1/controls/deps-tamper
trap 'chmod -R u+w "$S" 2>/dev/null; rm -rf -- "$S"' EXIT
mkdir -p "$S"
D=$L/scripts/client-oopif-uploadfile-round97.mjs
K=$L/scripts/check-client-oopif-uploadfile-round97.mjs
N=$L/scripts/negatives-client-oopif-uploadfile-round97.mjs
P=$(sha256sum "$D" | cut -d' ' -f1)
BASE=$(cat "$C/base.txt")
sha256sum "$D" "$K" "$N" | sed "s#$L/##" > "$C/instrument-sha256.txt"
: > "$C/rc.txt"
rc() { echo "$1 rc=$2" >> "$C/rc.txt"; }

# 1. no-work: the counting command does not exist at base
git -C "$L" cat-file -e "$BASE:scripts/check-client-oopif-uploadfile-round97.mjs" 2>/dev/null; rc no-work-base $?
# 2. no-work: the lane's newest client receipt (r96, chooser path, no upload call) under the r97 counter
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$L/corpus/evidence/round96/client-oopif-filechooser/receipt.json" --expect-nonce tabi-r97-donothing --json > "$C/counter-donothing-r96.json"; rc no-work-r96-receipt $?
# 3. positive: a fresh driver run (defaults), then the counter in --receipt mode
TABI_R97_NONCE=tabi-r97-ctl-positive node "$D" --lane "$L" --deps "$DEPS" --scratch "$S/pos" --out "$C/receipt-positive.json" --http-port 31761 --child-port 31762 --cdp-port 31763 > "$C/driver-positive.out"; rc driver-positive $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r97-ctl-positive --json > "$C/counter-positive.json"; rc counter-positive $?
# 4. battery on the positive receipt (forgeries incl. producer polarity, duplicate/fabricated legs)
node "$N" --lane "$L" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r97-ctl-positive --expect-driver-sha256 "$P" --scratch "$S/bat" --json > "$C/battery.json"; rc battery $?
# 5. wrong site (--cross-host 127.0.0.1): every child same-site, no OOPIF
TABI_R97_NONCE=tabi-r97-ctl-wrongsite node "$D" --lane "$L" --deps "$DEPS" --scratch "$S/ws" --out "$C/receipt-wrongsite.json" --http-port 31764 --child-port 31765 --cdp-port 31766 --reps 1 --cross-host 127.0.0.1 > "$C/driver-wrongsite.out"; rc driver-wrongsite $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$C/receipt-wrongsite.json" --expect-nonce tabi-r97-ctl-wrongsite --reps 1 --json > "$C/counter-wrongsite.json"; rc counter-wrongsite $?
# 6. wrong library through the production path: --live with puppeteer-core 25.15.0
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$WRONG" --scratch "$S/wl" --ports 31767,31768,31769 --reps 1 --json > "$C/counter-wronglib-live.json"; rc counter-wronglib-live $?
# 7. tampered tree through the production path (r96 R96Sentinel variant C: a comment-only edit to a
# non-pinned file, every r96 pin identical): a copy of $DEPS with one comment line appended to
# puppeteer-core lib/puppeteer/cdp/CdpSession.js — version, integrity and the pinned file sha unchanged
cp -a "$DEPS" "$TAMPER" && printf '\n// tabi-r97 control 7: comment-only edit\n' >> "$TAMPER/node_modules/puppeteer-core/lib/puppeteer/cdp/CdpSession.js"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$TAMPER" --scratch "$S/tamper" --ports 31687,31688,31689 --reps 1 --json > "$C/counter-tampered-tree-live.json"; rc counter-tampered-tree-live $?
# 8. setup: busy port
python3 -c "import socket,time;s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);s.bind(('127.0.0.1',31771));s.listen();time.sleep(30)" & HOLD=$!; sleep 1
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/busy" --ports 31771,31772,31773 --json > "$C/counter-setup-busyport.json"; rc setup-busyport $?
kill $HOLD 2>/dev/null; wait $HOLD 2>/dev/null
# 9. setup: counter SIGTERM mid-run
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/term" --ports 31774,31775,31776 --json > "$C/counter-setup-sigterm.json" & CP=$!; sleep 8; kill -TERM $CP; wait $CP; rc setup-counter-sigterm $?; sleep 1
echo "setup-counter-sigterm leftover-chromium=$(pgrep -fc -- "--user-data-dir=$S/term/" || true)" >> "$C/rc.txt"
# 10. setup: deps missing (driver usage refusal)
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$S/no-such-deps" --scratch "$S/nodeps" --ports 31777,31778,31779 --json > "$C/counter-setup-nodeps.json"; rc setup-no-deps $?
# 11. setup: receipt path is a directory
mkdir -p "$S/dir-receipt.json"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$S/dir-receipt.json" --expect-nonce tabi-r97-ctl-dir --json > "$C/counter-setup-receiptdir.json"; rc setup-receipt-dir $?
# 12. setup: scratch not writable, (a) under /proc (bounded: rc 124 = the r96 hang is back), (b) chmod-500
timeout 60 node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch /proc/tabi-r97-unwritable --ports 31781,31782,31783 --json > "$C/counter-setup-unwritable.json"; rc setup-unwritable-scratch-proc $?
mkdir -p "$S/ro" && chmod 500 "$S/ro"
timeout 60 node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/ro/x" --ports 31781,31782,31783 --json > "$C/counter-setup-unwritable-ro.json"; rc setup-unwritable-scratch-ro $?
chmod 700 "$S/ro"
# 13. setup: chromium cannot start (over-long TMPDIR breaks chromium's socket path)
LONG=$S/$(printf 'x%.0s' $(seq 1 90)); mkdir -p "$LONG"
TMPDIR=$LONG node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/launch" --ports 31784,31785,31786 --reps 1 --json > "$C/counter-setup-launchfail.json"; rc setup-launch-fail $?
# 14. driver pin: a counter run whose --expect-driver-sha256 is not the driver's (driver never runs)
node "$K" --lane "$L" --expect-driver-sha256 "$(printf '0%.0s' $(seq 1 64))" --live --deps "$DEPS" --scratch "$S/pin" --ports 31787,31788,31789 --json > "$C/counter-driver-pin.json"; rc driver-pin-mismatch $?
echo "done leftover-chromium-all=$(pgrep -fc -- "--user-data-dir=$S/" || true)" >> "$C/rc.txt"
