#!/usr/bin/env bash
# run-driver.sh <driver.mjs> <outdir> <label>
# Runs a driver copy from scratch with a fresh nonce and a clean env.
set -u
DRV="$1"; OUTDIR="$2"; LABEL="$3"
mkdir -p "$OUTDIR/scratch"
NONCE=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')
OUT="$OUTDIR/${LABEL}.receipt.json"
echo "nonce=$NONCE"
env -i PATH="$PATH" HOME="$HOME" LANG="${LANG:-C.UTF-8}" TZ="${TZ:-UTC}" \
  TABI_RUN_NONCE="$NONCE" \
  node "$DRV" --out "$OUT" --scratch "$OUTDIR/scratch" --nonce "$NONCE" --runs 2
echo "driver_exit=$?"
echo "receipt=$OUT"
