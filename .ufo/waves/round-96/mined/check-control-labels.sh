#!/usr/bin/env bash
# r96 mined check (lesson round-96 mistake 2): every expected control label has an rc line.
# usage: check-control-labels.sh <expected-labels.txt> <rc.txt>; exit 0 all present, 1 missing (listed).
miss=0
while read -r l; do grep -q "^$l rc=" "$2" || { echo "MISSING $l"; miss=1; }; done < "$1"
exit $miss
