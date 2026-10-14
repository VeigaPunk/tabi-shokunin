#!/bin/bash
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
for i in $(seq 1 40); do
  ts=$(date -u +%H:%M:%SZ)
  l0=$(sha256sum /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md | cut -c1-12)
  l0l=$(wc -l < /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md)
  kn=$(ls corpus/knowledge/*.md 2>/dev/null | wc -l)
  kl=$(wc -l corpus/knowledge/*.md 2>/dev/null | tail -1 | tr -d ' ')
  ev=$(ls -d corpus/evidence/*/ 2>/dev/null | wc -l)
  sk=$(sha256sum SKILL.md | cut -c1-12)
  dirty=$(git status --short | wc -l)
  head=$(git rev-parse --short HEAD)
  lessons=$(ls -A corpus/lessons | wc -l)
  w10dirs=$(ls -d /tmp/w10-* 2>/dev/null | wc -l)
  w9dirs=$(ls -d /tmp/w9-* 2>/dev/null | wc -l)
  echo "$i $ts l0=$l0/$l0l kn=$kn kl=$kl ev=$ev sk=$sk dirty=$dirty head=$head lessons=$lessons w10dirs=$w10dirs w9dirs=$w9dirs"
  sleep 20
done
