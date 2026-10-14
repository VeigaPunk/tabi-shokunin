#!/usr/bin/env bash
# TABI-B1 final global closure sweep — run from a file so no wrapper cmdline self-matches.
echo "== final closure sweep $(date -u +%Y-%m-%dT%H:%M:%SZ)"
if ss -ltn | grep -E ':(19481|19482)\b'; then echo 'FAIL: my ports listening'; else echo 'PASS: ports 19481/19482 closed'; fi
CH=$(ps -eo pid,args | grep -- '--user-data-dir=/tmp/tabi-b1-r3b-journe[y]' || true)
if [ -n "$CH" ]; then echo "FAIL: chromium with my profile:"; echo "$CH"; else echo 'PASS: no chromium process with my profile'; fi
HS=$(ps -eo pid,args | grep 'http.serve[r].*tabi-b1-r3b-journe[y]' || true)
if [ -n "$HS" ]; then echo "FAIL: http.server survivor:"; echo "$HS"; else echo 'PASS: no http.server for my site'; fi
exit 0
