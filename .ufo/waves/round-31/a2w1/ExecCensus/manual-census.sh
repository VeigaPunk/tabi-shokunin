#!/usr/bin/env bash
# CORPUS.md §Census commands, run by hand from the lane root, exit code after each.
set -u
run() { local label=$1; shift; printf '\n### %s\n$ %s\n' "$label" "$*"; "$@"; local rc=$?; printf '[exit %d]\n' "$rc"; }
printf 'cwd: %s\n' "$PWD"
printf '\n--- rows (spacing-tolerant) ---\n$ grep -cE ...\n'
n=$(grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md); rc=$?
printf '%s\n[exit %d]\n' "$n" "$rc"
printf '\n--- malformed rows (NF!=13) ---\n'
n=$(awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md); rc=$?
printf '%s\n[exit %d]\n' "$n" "$rc"
printf '\n--- tier histogram ---\n'
out=$(awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {t=$5; gsub(/[[:space:]]/,"",t); n[t]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md); rc=$?
printf '%s\n[exit %d]\n' "$out" "$rc"
printf '\n--- status histogram ---\n'
out=$(awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {s=$9; gsub(/[[:space:]]/,"",s); n[s]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md); rc=$?
printf '%s\n[exit %d]\n' "$out" "$rc"
printf '\n--- duplicate ids (must print nothing) ---\n'
out=$(awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}' corpus/SOURCES.md | sort | uniq -d); rc=$?
printf '%s\n[exit %d]\n' "${out:-<nothing>}" "$rc"
printf '\n--- enum violations / tier inflation (must print nothing) ---\n'
out=$(awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF==13 {i=$2;k=$4;t=$5;s=$9; gsub(/[[:space:]]/,"",i); gsub(/[[:space:]]/,"",t); gsub(/[[:space:]]/,"",s); gsub(/[[:space:]]/,"",k); if (t !~ /^[ABC]$/) print "tier", i, t; if (s !~ /^(queued|mined|rejected)$/) print "status", i, s; if (k !~ /^(spec|docs|paper|code|tool|dataset|talk|book|community|own-work)$/) print "kind", i, k; if (t=="A" && k=="community") print "tier-inflation", i}' corpus/SOURCES.md); rc=$?
printf '%s\n[exit %d]\n' "${out:-<nothing>}" "$rc"
printf '\n--- mined rows whose used-by paths do not exist (must print nothing) ---\n'
out=$(awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF==13 {s=$9; gsub(/[[:space:]]/,"",s); if (s=="mined") {n=split($12, a, /[,;]/); for (j=1;j<=n;j++) {p=a[j]; gsub(/^[[:space:]]+|[[:space:]]+$/,"",p); if (p!="" && p!="—") print p}}}' corpus/SOURCES.md | while read -r p; do [ -e "$p" ] || echo "missing: $p"; done); rc=$?
printf '%s\n[exit %d]\n' "${out:-<nothing>}" "$rc"
