#!/usr/bin/env bash
# replay.sh — re-derive the S143 row's parse verdicts from the retained bytes.
# Seat ScribeSources, tabi round 37 w1. Read-only w.r.t. the lane: it copies the
# lane's corpus into a temporary mirror and never writes inside the lane.
#
#   bash .ufo/waves/round-37/w1/ScribeSources/evidence/replay.sh [LANE]
#   default LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
#
# Exit 0 = both gates clean. The script rebuilds the mirror because
# `sources-census.sh --file` treats the copy's grandparent as the lane root
# (used-by paths resolve there) and `check-sources.mjs --root` rejects symlinked
# copies as path escapes, so the corpus must be real files inside the mirror.
set -euo pipefail

LANE=${1:-/home/vgpnk/Projects/shokunin/tabi-shokunin}
HERE=$(cd -- "$(dirname -- "$0")" && pwd)
MIRROR=$(mktemp -d -t s143-replay-XXXXXX)
trap 'rm -rf -- "$MIRROR"' EXIT

mkdir -p "$MIRROR/corpus" "$MIRROR/.ufo/waves/round-37/counters"
cp -a "$LANE/corpus/knowledge" "$LANE/corpus/lessons" "$MIRROR/corpus/"
cp "$HERE/SOURCES-with-S143.md" "$MIRROR/corpus/SOURCES.md"
cp "$LANE/.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs" "$MIRROR/.ufo/waves/round-37/counters/"

echo "== sources-census.sh validate (expect exit 0, W04-only)"
mkdir -p "$MIRROR/tmp"
TMPDIR="$MIRROR/tmp" /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$MIRROR/corpus/SOURCES.md"
echo "exit=$?"

echo "== check-sources.mjs (expect 'verdict=clean ... rows=143 ... findings=0')"
(cd "$LANE" && node scripts/check-sources.mjs --root "$MIRROR" --file corpus/SOURCES.md)
echo "exit=$?"

echo "== quote measurement (expect exact_occurrences=1 for both, 16 and 21 words)"
python3 - "$HERE/git-replace.html" <<'PY'
import html, re, sys, hashlib
raw = open(sys.argv[1], encoding='utf-8').read()
print("bytes=%d sha256=%s" % (len(raw.encode()), hashlib.sha256(raw.encode()).hexdigest()))
t = re.sub(r'<[^>]+>', ' ', re.sub(r'<(script|style)[^>]*>.*?</\1>', '', raw, flags=re.S))
flat = re.sub(r'\s+', ' ', html.unescape(t))
for q in ("The GIT_NO_REPLACE_OBJECTS environment variable can be set to achieve the same effect as the --no-replace-objects option.",
          "Replacement references will be used by default by all Git commands except those doing reachability traversal (prune, pack transfer and fsck)."):
    print("occurrences=%d words=%d :: %s" % (flat.count(q), len(q.split()), q[:60]))
PY
