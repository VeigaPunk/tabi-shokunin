#!/usr/bin/env bash
# tabi r96 pre-freeze controls (L1 TabiR96). Writes JSON outputs and rc lines into this directory.
# Scratch: /fast/scratch/hyaku/tabi-r96/L1/controls (removed on exit). Client deps: an npm install of
# puppeteer-core@25.16.0 + playwright-core@1.65.0 at $DEPS, and puppeteer-core@25.15.0 + playwright-core@1.65.0
# at $WRONG (the wrong-library control); both outside the lane (npm registry).
set -u
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$L/.ufo/waves/round-96/controls
S=/fast/scratch/hyaku/tabi-r96/L1/controls
DEPS=/fast/scratch/hyaku/tabi-r96/deps
WRONG=/fast/scratch/hyaku/tabi-r96/deps-wrong
trap 'rm -rf -- "$S"' EXIT
mkdir -p "$S"
D=$L/scripts/client-oopif-chooser-round96.mjs
K=$L/scripts/check-client-oopif-chooser-round96.mjs
N=$L/scripts/negatives-client-oopif-chooser-round96.mjs
P=$(sha256sum "$D" | cut -d' ' -f1)
BASE=$(cat "$C/base.txt")
sha256sum "$D" "$K" "$N" | sed "s#$L/##" > "$C/instrument-sha256.txt"
: > "$C/rc.txt"
rc() { echo "$1 rc=$2" >> "$C/rc.txt"; }

# 1. no-work: the counting command does not exist at base
git -C "$L" cat-file -e "$BASE:scripts/check-client-oopif-chooser-round96.mjs" 2>/dev/null; rc no-work-base $?
# 2. no-work: the lane's newest chooser receipt (r95, raw CDP, no client library) under the r96 counter
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$L/corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json" --expect-nonce tabi-r96-donothing --json > "$C/counter-donothing-r95.json"; rc no-work-r95-receipt $?
# 3. positive: a fresh driver run (defaults), then the counter in --receipt mode
TABI_R96_NONCE=tabi-r96-ctl-positive node "$D" --lane "$L" --deps "$DEPS" --scratch "$S/pos" --out "$C/receipt-positive.json" --http-port 31661 --child-port 31662 --cdp-port 31663 > "$C/driver-positive.out"; rc driver-positive $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r96-ctl-positive --json > "$C/counter-positive.json"; rc counter-positive $?
# 4. battery on the positive receipt (forgeries incl. producer polarity, duplicate/fabricated legs)
node "$N" --lane "$L" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r96-ctl-positive --expect-driver-sha256 "$P" --scratch "$S/bat" --json > "$C/battery.json"; rc battery $?
# 5. wrong site (--cross-host 127.0.0.1): every child same-site, no OOPIF, Puppeteer sees every chooser
TABI_R96_NONCE=tabi-r96-ctl-wrongsite node "$D" --lane "$L" --deps "$DEPS" --scratch "$S/ws" --out "$C/receipt-wrongsite.json" --http-port 31664 --child-port 31665 --cdp-port 31666 --reps 1 --cross-host 127.0.0.1 > "$C/driver-wrongsite.out"; rc driver-wrongsite $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$C/receipt-wrongsite.json" --expect-nonce tabi-r96-ctl-wrongsite --reps 1 --json > "$C/counter-wrongsite.json"; rc counter-wrongsite $?
# 6. wrong library through the production path: --live with puppeteer-core 25.15.0
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$WRONG" --scratch "$S/wl" --ports 31667,31668,31669 --reps 1 --json > "$C/counter-wronglib-live.json"; rc counter-wronglib-live $?
# 7. setup: busy port
python3 -c "import socket,time;s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);s.bind(('127.0.0.1',31671));s.listen();time.sleep(30)" & HOLD=$!; sleep 1
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/busy" --ports 31671,31672,31673 --json > "$C/counter-setup-busyport.json"; rc setup-busyport $?
kill $HOLD 2>/dev/null; wait $HOLD 2>/dev/null
# 8. setup: counter SIGTERM mid-run
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/term" --ports 31674,31675,31676 --json > "$C/counter-setup-sigterm.json" & CP=$!; sleep 8; kill -TERM $CP; wait $CP; rc setup-counter-sigterm $?; sleep 1
echo "setup-counter-sigterm leftover-chromium=$(pgrep -fc -- "--user-data-dir=$S/term/" || true)" >> "$C/rc.txt"
# 9. setup: deps missing (driver usage refusal)
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$S/no-such-deps" --scratch "$S/nodeps" --ports 31677,31678,31679 --json > "$C/counter-setup-nodeps.json"; rc setup-no-deps $?
# 10. setup: receipt path is a directory
mkdir -p "$S/dir-receipt.json"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$S/dir-receipt.json" --expect-nonce tabi-r96-ctl-dir --json > "$C/counter-setup-receiptdir.json"; rc setup-receipt-dir $?
# 11. setup: scratch not writable (r95 R95Sentinel: was rc 1, must be setup). (a) a path under /proc — a
# first run of this control hung the counter (Node's recursive mkdir spins on /proc), fixed before the
# freeze by the nearest-ancestor writability guard; `timeout 60` bounds it (rc 124 = the hang is back);
# (b) a chmod-500 directory.
timeout 60 node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch /proc/tabi-r96-unwritable --ports 31681,31682,31683 --json > "$C/counter-setup-unwritable.json"; rc setup-unwritable-scratch-proc $?
mkdir -p "$S/ro" && chmod 500 "$S/ro"
timeout 60 node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/ro/x" --ports 31681,31682,31683 --json > "$C/counter-setup-unwritable-ro.json"; rc setup-unwritable-scratch-ro $?
chmod 700 "$S/ro"
# 12. setup: chromium cannot start (over-long TMPDIR breaks chromium's socket path)
LONG=$S/$(printf 'x%.0s' $(seq 1 90)); mkdir -p "$LONG"
TMPDIR=$LONG node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --deps "$DEPS" --scratch "$S/launch" --ports 31684,31685,31686 --reps 1 --json > "$C/counter-setup-launchfail.json"; rc setup-launch-fail $?
echo "done leftover-chromium-all=$(pgrep -fc -- "--user-data-dir=$S/" || true)" >> "$C/rc.txt"
