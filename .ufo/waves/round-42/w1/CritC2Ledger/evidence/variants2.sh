#!/usr/bin/env bash
set -euo pipefail
S=/fast/scratch/hyaku/tabi-r42/CritC2Ledger
F=$S/fixture
CHK=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs

run() {
  local n=$1 d=$2 rev
  rev=$(git -C "$d" rev-parse HEAD)
  echo "=== $n  rev=$rev"
  set +e
  node "$CHK" --rev "$rev" --repo "$d" --json
  echo "$n exit=$?"
  set -e
  echo
}
mk() { local d=$S/$1; rm -rf "$d"; cp -a "$F" "$d"; echo "$d"; }
commitq() { git -C "$1" commit -q --allow-empty -am "$2"; echo "  committed: $(git -C "$1" rev-parse --short HEAD) $2"; }
setteach() { # $1=repo $2=new teaches text
  node -e '
const fs=require("fs");const p=process.argv[1]+"/corpus/SOURCES.md";
const t=process.argv[2];
const L=fs.readFileSync(p,"utf8").split("\n").map(l=>{
  if(!/^\|\s*S148\s*\|/.test(l)) return l;
  const c=l.split("|");
  c[7]=" "+t+" ";
  return c.join("|");
});
fs.writeFileSync(p,L.join("\n"));' "$1" "$2"
}

# ---- V9: 1-word quote
D=$(mk V9); setteach "$D" "supersedes S146 — options"; commitq "$D" "V9: 1-word quote"
echo "--- V9 S148 row committed:"; git -C "$D" show HEAD:corpus/SOURCES.md | grep '^| S148'
run "V9(1-word)" "$D"

# ---- V10: 0-word quote
D=$(mk V10); setteach "$D" "supersedes S146 —"; commitq "$D" "V10: 0-word quote"
echo "--- V10 S148 row committed:"; git -C "$D" show HEAD:corpus/SOURCES.md | grep '^| S148'
run "V10(0-word)" "$D"

W25="alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike november oscar papa quebec romeo sierra tango uniform victor whiskey xray yankee"

# ---- V11: 25-word quote verbatim
D=$(mk V11)
printf '<html><body>%s</body></html>\n' "$W25" > "$D/.ufo/waves/round-41/sources/node-cli-v24.21.0.html"
setteach "$D" "supersedes S146 — $W25"; commitq "$D" "V11: 25-word quote"
run "V11(25-word)" "$D"

# ---- V12: 26-word quote verbatim
D=$(mk V12)
printf '<html><body>%s one</body></html>\n' "$W25" > "$D/.ufo/waves/round-41/sources/node-cli-v24.21.0.html"
setteach "$D" "supersedes S146 — $W25 one"; commitq "$D" "V12: 26-word quote"
run "V12(26-word)" "$D"

# ---- V13: evidence path is a large tree object
D=$(mk V13); cd "$D"
node -e '
const fs=require("fs");const p=".ufo/waves/round-42/quarantine/re-adjudication.tsv";
fs.writeFileSync(p,fs.readFileSync(p,"utf8").replace(/corpus\/evidence\/fake\/one\.txt/g,".ufo/waves"));'
commitq "$D" "V13: evidence is a large tree"
REV13=$(git rev-parse HEAD)
echo "--- V13 .ufo/waves tree blob size:"; git cat-file -s "$REV13:.ufo/waves"
run "V13(big-tree-evidence)" "$D"
