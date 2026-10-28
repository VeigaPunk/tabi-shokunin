#!/usr/bin/env bash
# Branch-parity harness: runs the frozen checker and the simplification candidate
# against identical fake-git fixture trees (read-only path stub; no repository is
# created or mutated). Self-contained: needs this directory only.
#   bash fixture-harness.sh            # fixtures+outputs under <seat>/_work, removed at the end
#   WORK=/path KEEP=1 bash fixture-harness.sh
set -u
H=$(cd "$(dirname "$0")" && pwd)
ORIG=$H/frozen-checker.mjs
CAND=$H/check-routed-defects-round42.simpl.mjs
[ -f "$ORIG" ] || { echo "missing $ORIG (copy of the frozen counter, sha256 b1d05df1…)" >&2; exit 2; }
[ -f "$CAND" ] || { echo "missing $CAND" >&2; exit 2; }
S=${WORK:-$H/_work}
rm -rf "$S"; mkdir -p "$S"
FB=$S/fakebin
mkdir -p "$FB"

cat > "$FB/git" <<'EOS'
#!/usr/bin/env bash
# fake git: serves $FIX/files/<path> (show + size) and $FIX/size/<path> (size only)
args=("$@")
mode=""; ref=""
if [ "${args[2]:-}" = "show" ]; then mode=show; ref="${args[3]:-}"; fi
if [ "${args[2]:-}" = "cat-file" ] && [ "${args[3]:-}" = "-s" ]; then mode=size; ref="${args[4]:-}"; fi
path="${ref#*:}"
[ "$path" = "$ref" ] && exit 128
case "$mode" in
  show)
    if [ -f "$FIX/files/$path" ]; then exec cat -- "$FIX/files/$path"; fi
    echo "fatal: path '$path' does not exist" >&2; exit 128 ;;
  size)
    if [ -f "$FIX/files/$path" ]; then wc -c < "$FIX/files/$path" | tr -d ' \n'; exit 0; fi
    if [ -f "$FIX/size/$path" ]; then tr -d ' \n' < "$FIX/size/$path"; echo; exit 0; fi
    echo "fatal: path '$path' does not exist" >&2; exit 128 ;;
  *) exit 129 ;;
esac
EOS
chmod +x "$FB/git"

REV=0000000000000000000000000000000000000000
IDS=""
for i in $(seq -w 1 38); do IDS="$IDS id$i"; done

mk_scen() { SC=$S/fix/$1; F=$SC; mkdir -p "$SC/files" "$SC/size"; }

# fills a scenario with the fully-green fixture set
fill_green() {
  local R="$1"
  mkdir -p "$R/files/corpus/evidence/round41/playwright-egress" \
           "$R/files/.ufo/waves/round-41/measure" \
           "$R/files/.ufo/waves/round-41/sources" \
           "$R/files/.ufo/waves/round-41/controls" \
           "$R/files/.ufo/waves/round-42/quarantine" \
           "$R/files/ev" "$R/files/corpus"
  # >=1000-byte valid JSON receipt + witness
  node -e 'const b="x".repeat(1200);process.stdout.write(JSON.stringify({nonce:"n",pad:b}))' \
    > "$R/files/corpus/evidence/round41/playwright-egress/receipt.json"
  node -e 'const b="y".repeat(1200);process.stdout.write(JSON.stringify({witness:true,pad:b}))' \
    > "$R/files/corpus/evidence/round41/playwright-egress/receipt.witness.json"
  local rs ws
  rs=$(sha256sum "$R/files/corpus/evidence/round41/playwright-egress/receipt.json" | cut -d' ' -f1)
  ws=$(sha256sum "$R/files/corpus/evidence/round41/playwright-egress/receipt.witness.json" | cut -d' ' -f1)
  printf '{"receiptSha256":"%s","witnessSha256":"%s"}\n' "$rs" "$ws" \
    > "$R/files/.ufo/waves/round-41/measure/c1-measure.json"
  printf '<html><body><p>loaded from the CLI entry point</p></body></html>\n' \
    > "$R/files/.ufo/waves/round-41/sources/node-cli-v24.21.0.html"
  printf '| S146 | q | old | 1 | url | 2026-10-27 | note | rejected |\n' > "$R/files/corpus/SOURCES.md"
  printf '| S148 | q | new | 2 | url | 2026-10-28 | supersedes S146 — loaded from the CLI entry point | accepted |\n' >> "$R/files/corpus/SOURCES.md"
  printf 'git ls-tree -r --name-only HEAD -- corpus/evidence/round42 | wc -l\n0\n' \
    > "$R/files/.ufo/waves/round-41/controls/c1-baseline-noop.out"
  node -e 'process.stdout.write("z".repeat(300))' > "$R/files/ev/evidence.txt"
  for id in $IDS; do echo "${id# }"; done > "$R/files/.ufo/waves/round-42/quarantine/slice-ids.txt"
  : > "$R/files/.ufo/waves/round-42/quarantine/re-adjudication.tsv"
  for id in $IDS; do printf '%s\tpresent\tev/evidence.txt\n' "${id# }" \
    >> "$R/files/.ufo/waves/round-42/quarantine/re-adjudication.tsv"; done
}

run_case() {
  local name="$1" scen="$2"
  for v in orig cand; do
    local bin=$ORIG; [ "$v" = cand ] && bin=$CAND
    FIX=$scen PATH="$FB:$PATH" node "$bin" --rev "$REV" --repo /nonexistent --json \
      > "$S/out/$name.$v.out" 2> "$S/out/$name.$v.err"
    echo $? > "$S/out/$name.$v.rc"
  done
  local same=OK
  cmp -s "$S/out/$name.orig.out" "$S/out/$name.cand.out" || same=DIFF-OUT
  cmp -s "$S/out/$name.orig.err" "$S/out/$name.cand.err" || same="$same/DIFF-ERR"
  [ "$(cat "$S/out/$name.orig.rc")" = "$(cat "$S/out/$name.cand.rc")" ] || same="$same/DIFF-RC"
  printf '%-22s %-10s exit=%s findings=%s\n' "$name" "$same" \
    "$(cat "$S/out/$name.orig.rc")" \
    "$(node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(j.findingCount+" ["+j.findings.map(f=>f.id).join(",")+"]")' "$S/out/$name.orig.out" 2>/dev/null)"
}

mkdir -p "$S/out" "$S/fix"
rm -rf "$S/fix"; mkdir -p "$S/fix"

# S00 empty tree
mk_scen empty
run_case empty "$S/fix/empty"

# S01 fully green
mk_scen green; fill_green "$S/fix/green"
run_case green "$S/fix/green"

# S02 digest mismatch
cp -a "$S/fix/green" "$S/fix/mismatch" 2>/dev/null
sed -i 's/"receiptSha256":"/"receiptSha256":"00/' "$S/fix/mismatch/files/.ufo/waves/round-41/measure/c1-measure.json"
run_case mismatch "$S/fix/mismatch"

# S03 receipt below 1000 bytes
cp -a "$S/fix/green" "$S/fix/small"
printf '{"a":1}\n' > "$S/fix/small/files/corpus/evidence/round41/playwright-egress/receipt.json"
run_case small "$S/fix/small"

# S04 receipt not JSON
cp -a "$S/fix/green" "$S/fix/badjson"
printf '{not json\n' > "$S/fix/badjson/files/corpus/evidence/round41/playwright-egress/receipt.json"
run_case badjson "$S/fix/badjson"

# S05 receipt is a JSON scalar (parses, not an object)
cp -a "$S/fix/green" "$S/fix/scalar"
node -e 'process.stdout.write("123"+ " ".repeat(1200))' \
  > "$S/fix/scalar/files/corpus/evidence/round41/playwright-egress/receipt.json"
run_case scalar "$S/fix/scalar"

# S06 measure absent, receipt+witness valid -> suppression guard
cp -a "$S/fix/green" "$S/fix/nomeasure"
rm "$S/fix/nomeasure/files/.ufo/waves/round-41/measure/c1-measure.json"
run_case nomeasure "$S/fix/nomeasure"

# S07 empty quote after the supersession marker
cp -a "$S/fix/green" "$S/fix/quoteempty"
sed -i 's/| supersedes S146 — loaded from the CLI entry point |/| supersedes S146 — |/' "$S/fix/quoteempty/files/corpus/SOURCES.md"
run_case quoteempty "$S/fix/quoteempty"

# S08 quote of 26 words
cp -a "$S/fix/green" "$S/fix/quote26"
node -e 'const q=Array.from({length:26},(_,i)=>"w"+i).join(" ");const fs=require("fs");const p=process.argv[1];fs.writeFileSync(p,fs.readFileSync(p,"utf8").replace(/supersedes S146 — [^|]*/, "supersedes S146 — "+q+" "))' "$S/fix/quote26/files/corpus/SOURCES.md"
run_case quote26 "$S/fix/quote26"

# S09 quote not verbatim in the staged html
cp -a "$S/fix/green" "$S/fix/notverbatim"
sed -i 's/loaded from the CLI entry point/loaded from THE CLI entry point/' "$S/fix/notverbatim/files/corpus/SOURCES.md"
run_case notverbatim "$S/fix/notverbatim"

# S10 S146 status not rejected
cp -a "$S/fix/green" "$S/fix/s146ok"
sed -i 's/| note | rejected |/| note | accepted |/' "$S/fix/s146ok/files/corpus/SOURCES.md"
run_case s146ok "$S/fix/s146ok"

# S11 baseline under 10 bytes
cp -a "$S/fix/green" "$S/fix/basethin"
printf 'ls-0\n' > "$S/fix/basethin/files/.ufo/waves/round-41/controls/c1-baseline-noop.out"
run_case basethin "$S/fix/basethin"

# S12 baseline lacking command and zero
cp -a "$S/fix/green" "$S/fix/basemiss"
printf 'the baseline tree listing was empty and unrecorded\n' > "$S/fix/basemiss/files/.ufo/waves/round-41/controls/c1-baseline-noop.out"
run_case basemiss "$S/fix/basemiss"

# S13 tsv defects: duplicate, extra, malformed, bad verdict, thin evidence, missing id
cp -a "$S/fix/green" "$S/fix/tsvbads"
T="$S/fix/tsvbads/files/.ufo/waves/round-42/quarantine/re-adjudication.tsv"
printf 'id01\tpresent\tev/evidence.txt\n' >> "$T"
printf 'id99\tpresent\tev/evidence.txt\n' >> "$T"
printf 'id02\tonlytwo\tcells\n' >> "$T"
printf 'id03\tbogus\tev/evidence.txt\n' >> "$T"
printf 'thin\n' > "$S/fix/tsvbads/files/ev/thin.txt"
printf 'id04\tabsent\tev/thin.txt\n' >> "$T"
printf 'id05\tabsent\tev/nope.txt\n' >> "$T"
run_case tsvbads "$S/fix/tsvbads"

# S14 slice-ids has 37 entries
cp -a "$S/fix/green" "$S/fix/slice37"
sed -i '$d' "$S/fix/slice37/files/.ufo/waves/round-42/quarantine/slice-ids.txt"
run_case slice37 "$S/fix/slice37"

# S15 size readable, content unreadable -> r1a-unreadable
cp -a "$S/fix/green" "$S/fix/unreadable"
rm "$S/fix/unreadable/files/corpus/evidence/round41/playwright-egress/receipt.json"
mkdir -p "$S/fix/unreadable/size/corpus/evidence/round41/playwright-egress"
printf '1200\n' > "$S/fix/unreadable/size/corpus/evidence/round41/playwright-egress/receipt.json"
run_case unreadable "$S/fix/unreadable"

# S16 tsv absent, slice present
cp -a "$S/fix/green" "$S/fix/notsv"
rm "$S/fix/notsv/files/.ufo/waves/round-42/quarantine/re-adjudication.tsv"
run_case notsv "$S/fix/notsv"

# S17 measure valid, both evidence files absent
cp -a "$S/fix/green" "$S/fix/noevid"
rm "$S/fix/noevid/files/corpus/evidence/round41/playwright-egress/receipt.json" \
   "$S/fix/noevid/files/corpus/evidence/round41/playwright-egress/receipt.witness.json"
run_case noevid "$S/fix/noevid"

# S18 SOURCES absent
cp -a "$S/fix/green" "$S/fix/nosources"
rm "$S/fix/nosources/files/corpus/SOURCES.md"
run_case nosources "$S/fix/nosources"

# S19 receipt >=1000 bytes but not JSON
cp -a "$S/fix/green" "$S/fix/badjson1000"
node -e 'process.stdout.write("{not json"+" ".repeat(1200))' \
  > "$S/fix/badjson1000/files/corpus/evidence/round41/playwright-egress/receipt.json"
run_case badjson1000 "$S/fix/badjson1000"

# S20 measure itself unparseable
cp -a "$S/fix/green" "$S/fix/badmeasure"
printf '{"receiptSha256": not json}\n' > "$S/fix/badmeasure/files/.ufo/waves/round-41/measure/c1-measure.json"
run_case badmeasure "$S/fix/badmeasure"

# S21 tsv line with two cells -> r4-row-malformed
cp -a "$S/fix/green" "$S/fix/tsvmalformed"
printf 'id07\tpresent\n' >> "$S/fix/tsvmalformed/files/.ufo/waves/round-42/quarantine/re-adjudication.tsv"
run_case tsvmalformed "$S/fix/tsvmalformed"

# S23 measure parses but lacks witnessSha256 -> r1b-binding-unavailable
cp -a "$S/fix/green" "$S/fix/nokey"
node -e 'const fs=require("fs");const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,"utf8"));delete j.witnessSha256;fs.writeFileSync(p,JSON.stringify(j))' "$S/fix/nokey/files/.ufo/waves/round-41/measure/c1-measure.json"
run_case nokey "$S/fix/nokey"

# S24 witness digest mismatch
cp -a "$S/fix/green" "$S/fix/wmismatch"
sed -i 's/"witnessSha256":"/"witnessSha256":"00/' "$S/fix/wmismatch/files/.ufo/waves/round-41/measure/c1-measure.json"
run_case wmismatch "$S/fix/wmismatch"

# S25 witness below 1000 bytes
cp -a "$S/fix/green" "$S/fix/wsmall"
printf '{"w":1}\n' > "$S/fix/wsmall/files/corpus/evidence/round41/playwright-egress/receipt.witness.json"
run_case wsmall "$S/fix/wsmall"

# S26 S148 teaches does not begin with the supersession marker
cp -a "$S/fix/green" "$S/fix/noprefix"
sed -i 's/| supersedes S146 — loaded from the CLI entry point |/| see also S146 — loaded from the CLI entry point |/' "$S/fix/noprefix/files/corpus/SOURCES.md"
run_case noprefix "$S/fix/noprefix"

# S27 S146 row absent
cp -a "$S/fix/green" "$S/fix/nos146"
sed -i '/^| S146 /d' "$S/fix/nos146/files/corpus/SOURCES.md"
run_case nos146 "$S/fix/nos146"

# S28 staged html absent
cp -a "$S/fix/green" "$S/fix/nohtml"
rm "$S/fix/nohtml/files/.ufo/waves/round-41/sources/node-cli-v24.21.0.html"
run_case nohtml "$S/fix/nohtml"

# S29 tsv misses one staged id
cp -a "$S/fix/green" "$S/fix/tsvmiss"
sed -i '$d' "$S/fix/tsvmiss/files/.ufo/waves/round-42/quarantine/re-adjudication.tsv"
run_case tsvmiss "$S/fix/tsvmiss"

# S30 witness size readable, content unreadable
cp -a "$S/fix/green" "$S/fix/wunreadable"
rm "$S/fix/wunreadable/files/corpus/evidence/round41/playwright-egress/receipt.witness.json"
mkdir -p "$S/fix/wunreadable/size/corpus/evidence/round41/playwright-egress"
printf '1200\n' > "$S/fix/wunreadable/size/corpus/evidence/round41/playwright-egress/receipt.witness.json"
run_case wunreadable "$S/fix/wunreadable"

# S31 witness >=1000 bytes but not JSON
cp -a "$S/fix/green" "$S/fix/wunparseable"
node -e 'process.stdout.write("{not json"+" ".repeat(1200))' \
  > "$S/fix/wunparseable/files/corpus/evidence/round41/playwright-egress/receipt.witness.json"
run_case wunparseable "$S/fix/wunparseable"

# S32 measure parses but lacks receiptSha256 -> r1a-binding-unavailable (r1b suppressed)
cp -a "$S/fix/green" "$S/fix/nokeyA"
node -e 'const fs=require("fs");const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,"utf8"));delete j.receiptSha256;fs.writeFileSync(p,JSON.stringify(j))' "$S/fix/nokeyA/files/.ufo/waves/round-41/measure/c1-measure.json"
run_case nokeyA "$S/fix/nokeyA"

echo "--- artifact listing ---"
ls -l "$S/out" | head -3

# teardown: the work tree is scratch, not evidence (the matrix above is the evidence)
if [ "${KEEP:-0}" = 1 ]; then echo "kept: $S"; else rm -rf "$S"; fi
