#!/bin/bash
# One mutant = one harness run + one evaluator run. Never retried per scored step.
S=/fast/scratch/hyaku/tabi-r71/R71Mut2
W=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-71/w1/R71Mut2
id="$1"
src="$2"
set -u
mkdir -p "$W/$id"
cp "$src" "$S/lane/scripts/verify-live-r71.mjs"
sha=$(sha256sum "$S/lane/scripts/verify-live-r71.mjs" | cut -d' ' -f1)
rm -rf "$S/h$id"; mkdir -p "$S/h$id"
t0=$(date +%s)
timeout -k 10 1500 node "$S/ctl/attack-harness.mjs" --lane "$S/lane" --verifier verify-live-r71.mjs --work "$S/h$id" --out "$W/$id" > "$W/$id/harness.stdout" 2> "$W/$id/harness.stderr"
hrc=$?
t1=$(date +%s)
if [ -s "$W/$id/summary.json" ]; then
  node "$S/ctl/evaluate-c2.mjs" --summary "$W/$id/summary.json" --json > "$W/$id/eval.json" 2> "$W/$id/eval.stderr"
  erc=$?
else
  erc=9
  printf '{"error":"no summary"}\n' > "$W/$id/eval.json"
fi
printf '%s\n' "$erc" > "$W/$id/eval.exit"
printf '%s\n' "$hrc" > "$W/$id/harness.exit"
printf '%s\n' "$sha" > "$W/$id/verifier.sha256"
printf '%s\n' "$((t1-t0))" > "$W/$id/harness.seconds"
echo "STEP id=$id sha=$sha harness_rc=$hrc eval_rc=$erc seconds=$((t1-t0))"
[ -s "$W/$id/harness.stdout" ] && cat "$W/$id/harness.stdout"
[ -s "$W/$id/eval.json" ] && head -c 400 "$W/$id/eval.json"; echo
rm -rf "$S/h$id"
exit 0
