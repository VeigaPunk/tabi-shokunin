#!/usr/bin/env bash
# tabi r95 pre-freeze controls (L1 TabiR95). Writes JSON outputs and rc lines into this directory.
# Scratch: /fast/scratch/hyaku/tabi-r95/L1/controls (removed on exit).
set -u
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$L/.ufo/waves/round-95/controls
S=/fast/scratch/hyaku/tabi-r95/L1/controls
trap 'rm -rf -- "$S"' EXIT
mkdir -p "$S"
D=$L/scripts/chrome-cdp-backendnode-misdelivery-round95.mjs
K=$L/scripts/check-backendnode-misdelivery-round95.mjs
N=$L/scripts/negatives-backendnode-misdelivery-round95.mjs
P=$(sha256sum "$D" | cut -d' ' -f1)
BASE=$(cat "$C/base.txt")
sha256sum "$D" "$K" "$N" | sed "s#$L/##" > "$C/instrument-sha256.txt"
: > "$C/rc.txt"
rc() { echo "$1 rc=$2" >> "$C/rc.txt"; }
leftover() { pgrep -fc -- "--user-data-dir=$S/" || true; }

# 1. no-work: the counting command does not exist at base
git -C "$L" cat-file -e "$BASE:scripts/check-backendnode-misdelivery-round95.mjs" 2>/dev/null; rc no-work-base $?
# 2. no-work: the r94 receipt under the r95 counter
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$L/corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json" --expect-nonce tabi-r95-donothing --json > "$C/counter-donothing-r94.json"; rc no-work-r94-receipt $?
# 3. positive: a fresh driver run (defaults), then the counter in --receipt mode
TABI_R95_NONCE=tabi-r95-ctl-positive node "$D" --lane "$L" --scratch "$S/pos" --out "$C/receipt-positive.json" --http-port 31961 --child-port 31962 --cdp-port 31963 > "$C/driver-positive.out"; rc driver-positive $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r95-ctl-positive --json > "$C/counter-positive.json"; rc counter-positive $?
# 4. battery on the positive receipt
node "$N" --lane "$L" --receipt "$C/receipt-positive.json" --expect-nonce tabi-r95-ctl-positive --expect-driver-sha256 "$P" --scratch "$S/bat" --json > "$C/battery.json"; rc battery $?
# 5. parent never reaches B (--qs 0,1,2,3): no misdelivery, no collision P leg
TABI_R95_NONCE=tabi-r95-ctl-noreach node "$D" --lane "$L" --scratch "$S/nr" --out "$C/receipt-noreach.json" --http-port 31964 --child-port 31965 --cdp-port 31966 --qs 0,1,2,3 > /dev/null; rc driver-noreach $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$C/receipt-noreach.json" --expect-nonce tabi-r95-ctl-noreach --json > "$C/counter-noreach.json"; rc counter-noreach $?
# 6. wrong site (--cross-host 127.0.0.1): no own iframe target anywhere
TABI_R95_NONCE=tabi-r95-ctl-wrongsite node "$D" --lane "$L" --scratch "$S/ws" --out "$C/receipt-wrongsite.json" --http-port 31967 --child-port 31968 --cdp-port 31969 --reps 1 --cross-host 127.0.0.1 > /dev/null; rc driver-wrongsite $?
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$C/receipt-wrongsite.json" --expect-nonce tabi-r95-ctl-wrongsite --reps 1 --json > "$C/counter-wrongsite.json"; rc counter-wrongsite $?
# 7. setup: busy port
python3 -c "import socket,time;s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);s.bind(('127.0.0.1',31971));s.listen();time.sleep(30)" & HOLD=$!; sleep 1
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --scratch "$S/busy" --ports 31971,31972,31973 --json > "$C/counter-setup-busyport.json"; rc setup-busyport $?
kill $HOLD 2>/dev/null; wait $HOLD 2>/dev/null
# 8. setup: counter SIGTERM mid-run
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --scratch "$S/term" --ports 31974,31975,31976 --json > "$C/counter-setup-sigterm.json" & CP=$!; sleep 8; kill -TERM $CP; wait $CP; rc setup-counter-sigterm $?; sleep 1
echo "setup-counter-sigterm leftover-chromium=$(pgrep -fc -- "--user-data-dir=$S/term/" || true)" >> "$C/rc.txt"
# 9. setup: driver SIGKILL mid-run
node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --scratch "$S/kill" --ports 31977,31978,31979 --json > "$C/counter-setup-driverkill.json" & CP=$!; sleep 8
pkill -KILL -f -- "chrome-cdp-backendnode-misdelivery-round95.mjs --lane $L --scratch $S/kill/driver"; wait $CP; rc setup-driver-sigkill $?; sleep 1
echo "setup-driver-sigkill leftover-chromium=$(pgrep -fc -- "--user-data-dir=$S/kill/" || true)" >> "$C/rc.txt"
# 10. setup: receipt path is a directory (r94 F4)
mkdir -p "$S/dir-receipt.json"
node "$K" --lane "$L" --expect-driver-sha256 "$P" --receipt "$S/dir-receipt.json" --expect-nonce tabi-r95-ctl-dir --json > "$C/counter-setup-receiptdir.json"; rc setup-receipt-dir $?
# 11. setup: chromium cannot start (r94 F2: an over-long TMPDIR breaks chromium's socket path)
LONG=$S/$(printf 'x%.0s' $(seq 1 90)); mkdir -p "$LONG"
TMPDIR=$LONG node "$K" --lane "$L" --expect-driver-sha256 "$P" --live --scratch "$S/launch" --ports 31981,31982,31983 --reps 1 --json > "$C/counter-setup-launchfail.json"; rc setup-launch-fail $?
echo "done leftover-chromium-all=$(pgrep -fc -- "--user-data-dir=$S/" || true)" >> "$C/rc.txt"
