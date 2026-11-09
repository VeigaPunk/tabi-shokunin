#!/usr/bin/env bash
# tabi r97 mined CANDIDATE check (lesson round-97 §Mistakes 1), kept as evidence that it is NOT a fix: the
# misanchored edit (`} else {` overwritten by a statement) still parses, because the overwritten `{`/`}`
# pair stays balanced — `syntax-mutant.txt` shows rc 0 on the mutant. The fix is check-driver-positive.sh.
# Usage: check-instruments-syntax.sh <file>...   Exit 0: all parse; 1: any does not (named on stdout).
rc=0
for f in "$@"; do
  if node --check "$f" 2>/dev/null; then echo "ok $f"; else echo "SYNTAX $f"; rc=1; fi
done
exit $rc
