#!/bin/sh
# usage: run-variant.sh <label> <tab-separated extra flags...>
set -e
S=/fast/scratch/hyaku/tabi-r32/ExecNoNetwork
label="$1"; shift
TAB=$(printf '\t')
args=""
for a in "$@"; do args="$args$a$TAB"; done
cd "$S/probe"
EXTRA_ARGS="${args}--log-net-log=$S/probe/netlog-$label.json"${TAB}"--net-log-capture-mode=Everything" \
  TMPDIR="$S" XDG_RUNTIME_DIR=/run/user/1000 PROBE_TIMEOUT=180000 \
  timeout 150 strace -f -e trace=connect,socket -s 200 -o "trace-$label.out" node probe-variant.mjs "$label" > "run-$label.json" 2> "run-$label.err"
rc=$?
echo "strace_exit=$rc"
jq -c '{label,extraArgs,holdCount,verdict}' "run-$label.json"
