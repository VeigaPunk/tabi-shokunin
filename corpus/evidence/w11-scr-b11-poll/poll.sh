#!/bin/bash
# SCR-B11 bounded poll: watch for round-11 landings in tabi-shokunin. Read-only.
cd /home/vgpnk/Projects/shokunin/tabi-shokunin || exit 1
LOG=/tmp/w11-scr-b11-poll/poll.log
END=$(( $(date +%s) + 2100 ))
i=0
while [ "$(date +%s)" -lt "$END" ]; do
  i=$((i+1))
  {
    echo "== $(date -u +%FT%TZ) i=$i"
    echo "HEAD: $(git log --format='%h %s' -1)"
    echo "status: $(git status --short | wc -l) entries"
    git status --short | head -12
    printf 'kn=%s les=%s ev=%s rd=' "$(ls corpus/knowledge/*.md 2>/dev/null | wc -l)" "$(ls -A corpus/lessons 2>/dev/null | wc -l)" "$(ls -d corpus/evidence/*/ 2>/dev/null | wc -l)"
    ls corpus/README.md | wc -l
    echo "README: $(sha256sum corpus/README.md | cut -c1-12) $(wc -l < corpus/README.md)"
    echo "SCORECARD: $(sha256sum SCORECARD.md | cut -c1-12) $(wc -l < SCORECARD.md)"
    echo "LOG: $(sha256sum LOG.md | cut -c1-12) $(wc -l < LOG.md)"
    echo "SKILL: $(sha256sum SKILL.md | cut -c1-12) $(wc -l < SKILL.md)"
    for f in corpus/knowledge/training-closeout.md corpus/lessons/round-10.md corpus/lessons/round-11.md reports/r11-ver-b11.md plans/round-11-record-draft.md; do
      [ -e "$f" ] && echo "PRESENT: $f ($(wc -l < "$f") lines)"
    done
    echo "w11dirs: $(ls -d /tmp/w11-b11-* /tmp/w11-ver-b11-* 2>/dev/null | tr '\n' ' ')"
  } >> "$LOG" 2>&1
  sleep 30
done
echo "== POLL CLOSED $(date -u +%FT%TZ) after $i iterations" >> "$LOG"
