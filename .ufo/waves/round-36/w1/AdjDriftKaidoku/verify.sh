#!/usr/bin/env bash
# Read-only verification of the 3 MOVED kaidoku rows in corpus/adjacency-screen-drift.tsv.
set -u
PIN=49096c7e6f226af0c750c4b003be58883cb6049f
HEAD=1ed29de2cdd6061315fb2f5478d5029b7d570675
REPO=/home/vgpnk/Projects/shokunin/kaidoku-shokunin
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
S=/fast/scratch/hyaku/tabi-r36/AdjDriftKaidoku
export TMPDIR="$S/tmp"
D="$LANE/corpus/adjacency-screen-drift.tsv"
B="$LANE/corpus/adjacency-screen-browser.tsv"

git -C "$REPO" show "$PIN:SKILL.md" > "$S/p.md"
git -C "$REPO" show "$HEAD:SKILL.md" > "$S/h.md"

echo "=== 0. objects and ancestry ==="
echo "pin  type: $(git -C "$REPO" cat-file -t "$PIN")  head type: $(git -C "$REPO" cat-file -t "$HEAD")"
git -C "$REPO" merge-base --is-ancestor "$PIN" "$HEAD" && echo "pin is ancestor of head: YES"
echo "line counts: pin=$(wc -l < "$S/p.md") head=$(wc -l < "$S/h.md")  (worktree HEAD is dirty; not used)"

echo
echo "=== 1. ledger row: line 5-8 of the drift ledger, status column ==="
sed -n '1p;5,8p' "$D" | cut -f1-3
echo "status histogram over 307 data rows: $(tail -n +2 "$D" | cut -f2 | sort | uniq -c | tr '\n' ' ')"

echo
echo "=== 2. side-by-side: pin line vs head line (line numbers printed) ==="
for pair in 585:748 621:784 652:815; do
  p=${pair%%:*}; h=${pair##*:}
  echo "--- pin SKILL.md:$p  ==  head SKILL.md:$h (shift +$((h-p))) ---"
  printf 'PIN :%-4s| ' "$p"; sed -n "${p}p" "$S/p.md"
  printf 'HEAD:%-4s| ' "$h"; sed -n "${h}p" "$S/h.md"
done

echo
echo "=== 3. byte identity (sha256 of the line incl. trailing newline) + trim equality ==="
for pair in 585:748 621:784 652:815; do
  p=${pair%%:*}; h=${pair##*:}
  ps=$(sed -n "${p}p" "$S/p.md" | sha256sum | cut -d' ' -f1)
  hs=$(sed -n "${h}p" "$S/h.md" | sha256sum | cut -d' ' -f1)
  pb=$(sed -n "${p}p" "$S/p.md" | wc -c); hb=$(sed -n "${h}p" "$S/h.md" | wc -c)
  if [ "$(sed -n "${p}p" "$S/p.md" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')" = "$(sed -n "${h}p" "$S/h.md" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')" ]; then te=yes; else te=NO; fi
  echo "pin:$p head:$h  pin_sha=$ps  head_sha=$hs  bytes=$pb/$hb  trim-equal=$te  raw-equal=$([ "$ps" = "$hs" ] && echo yes || echo NO)"
done

echo
echo "=== 4. is the relocated line the ONLY verbatim occurrence at head? (grep -nxF, whole line) ==="
for pair in 585:748 621:784 652:815; do
  p=${pair%%:*}; h=${pair##*:}
  sed -n "${h}p" "$S/h.md" > "$S/needle.txt"
  printf 'pin line %s -> head occurrences: ' "$p"; grep -nxF -f "$S/needle.txt" "$S/h.md" | cut -d: -f1 | tr '\n' ' '; echo
  printf 'pin line %s -> occurrences in the PIN file itself: ' "$p"; grep -nxF -f "$S/needle.txt" "$S/p.md" | cut -d: -f1 | tr '\n' ' '; echo
done

echo
echo "=== 5. screen-ledger row 62-64 quoted text located at head (grep -nF) ==="
echo "-- drift/browser rows 62-64 (browser ledger) --"; sed -n '62,64p' "$B" | cut -f1,4
for q in 'Lower patch data used; the next `GoRttiMapper` line still says `X`' \
         'Run `swiss-misread.py` on the carrier; an exact H1 match attributes the abort to the `OldMapType` binding' \
         'reads the carrier and installed snapshot JSON, JSON on stdout, never executes the carrier'; do
  printf 'quote -> head lines: '; grep -nF "$q" "$S/h.md" | cut -d: -f1 | tr '\n' ' '; echo "| quote=[$q]"
done

echo
echo "=== 6. kimi-webbridge still present on each relocated head line (count) ==="
for h in 748 784 815; do printf 'head:%s count=%s\n' "$h" "$(sed -n "${h}p" "$S/h.md" | grep -o 'kimi-webbridge' | wc -l)"; done

echo
echo "=== 7. diff geometry pin..head (why the lines shifted) ==="
git -C "$REPO" diff --stat "$PIN" "$HEAD" -- SKILL.md
git -C "$REPO" diff "$PIN" "$HEAD" -- SKILL.md > "$S/d.diff"
echo "hunk old-side headers: $(grep '^@@' "$S/d.diff" | sed -E 's/@@ -([0-9]+),?([0-9]*) .*/\1,\2/' | tr '\n' ' ')"
add=$(grep -c '^+' "$S/d.diff"); add=$((add-1))
del=$(grep -c '^-' "$S/d.diff"); del=$((del-1))
echo "added lines: $add (blank lines included, '+++' header excluded)  deleted lines: $del ('---' header excluded)"
echo "deleted lines (all four, unrelated sqfs-triage text) at old ~328:"
grep '^-[^-]' "$S/d.diff" | cut -c1-110
echo "hunks overlapping [585,652]: $(grep '^@@' "$S/d.diff" | awk '{split($2,a,","); s=substr(a[1],2)+0; l=(a[2]==""?1:a[2]+0); if (s<=652 && s+l-1>=585) print "OVERLAP"}' | wc -l) (0 = the three rows sit in untouched regions)"
echo "shift arithmetic: 748-585=$((748-585)) 784-621=$((784-621)) 815-652=$((815-652)) = net insertions ((167-4))"
echo "diff lines whose text is one of the three relocated lines: $(grep -cE '^[+-].*(GoRttiMapper. line still says|swiss-misread\.py. on the carrier|never executes the carrier)' "$S/d.diff") (0 = no add/delete of that text)"

echo
echo "=== 8. independent re-derivation of ALL 307 ledger rows from git objects ==="
python3 - "$D" "$LANE" <<'PY'
import json, subprocess, sys, pathlib
ledger, lane = sys.argv[1], sys.argv[2]
pins = json.load(open(pathlib.Path(lane) / ".ufo/waves/round-36/baseline/c1-delta-pins.json"))
cache = {}
def lines(repo, rev, path):
    k = (repo, rev, path)
    if k not in cache:
        out = subprocess.run(["git", "-C", f"/home/vgpnk/Projects/shokunin/{repo}-shokunin", "show", f"{rev}:{path}"],
                             capture_output=True, text=True)
        cache[k] = out.stdout.split("\n") if out.returncode == 0 else None
    return cache[k]
rows = [l.rstrip("\n").split("\t") for l in open(ledger)][1:]
mism, missing, checked = [], [], 0
for ref, status, note in rows:
    repo = ref.split("-shokunin@")[0]
    pin = ref.split("@")[1].split(":")[0]
    path, _, ln = ref.split(":", 1)[1].rpartition(":")
    ln = int(ln)
    head = pins[repo]
    a, b = lines(repo, pin, path), lines(repo, head, path)
    if a is None or b is None:
        missing.append(ref); continue
    checked += 1
    same = (ln <= len(a) and ln <= len(b) and a[ln-1] == b[ln-1])
    actual = "unchanged" if same else "moved"
    if actual != status:
        mism.append((ref, status, actual, note))
print(f"data rows={len(rows)} checked={checked} missing_at_head={len(missing)} status_mismatches={len(mism)}")
for m in mism: print("MISMATCH", m)
print(f"moved rows in ledger: {sum(1 for r in rows if r[1] == 'moved')}")
PY
echo "=== end ==="
