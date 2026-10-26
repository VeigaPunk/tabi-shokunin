#!/bin/bash
# ScribeUDispositionsA — re-derivations for U01..U14 at the round-35 freeze.
# Read-only: git show/sed/grep/node on a --shared clone + the fleet L0 file.
set -u
C=/fast/scratch/hyaku/tabi-r35/ScribeUDispositionsA/clone
export TMPDIR=/fast/scratch/hyaku/tabi-r35/ScribeUDispositionsA/tmp
mkdir -p "$TMPDIR"
cd "$C" || exit 2
echo "lane clone HEAD: $(git -C "$C" rev-parse HEAD)"
run() { echo "\$ $*"; "$@"; echo "exit=$?"; echo; }

echo "=== U01 gate MEASURED grammar (gate sha at freeze) ==="
run sha256sum scripts/check-bidi-runtime.mjs
run grep -n "^const MEASURED" scripts/check-bidi-runtime.mjs
node -e '
const fs=require("fs");
const g=fs.readFileSync("scripts/check-bidi-runtime.mjs","utf8");
const M=eval(/^const MEASURED = (.+);$/m.exec(g)[1]);
for (const c of ["yes","YES","yes — live","yes (live)","no — reason"]) { const m=M.exec(c); console.log(JSON.stringify(c),"->",m?"measured:"+m[1].toLowerCase():"unmeasured"); }
'; echo "exit=$?"; echo

echo "=== U02 absolute-specifier import + no dynamic-import scan ==="
run grep -n "function importSpecs\|function resolvesToGate\|spec.startsWith(\"/\")" scripts/check-bidi-runtime.mjs
run grep -c "import[[:space:]]*(" scripts/check-bidi-runtime.mjs

echo "=== U03 witness loop breaks on first grounded id ==="
run grep -n "for (const id of newRows)\|if (!witness)" scripts/check-bidi-runtime.mjs
run sed -n '746,758p' scripts/check-bidi-runtime.mjs

echo "=== U04 contested-open substring-anywhere test, re-run on fleet L0:65 ==="
run grep -n "L0_TABI_ROW = \|line.text.includes(sibling)" scripts/check-adjacency.mjs
node -e '
const fs=require("fs");
const adj=fs.readFileSync("scripts/check-adjacency.mjs","utf8");
const L0=eval(/^const L0_TABI_ROW = (.+);$/m.exec(adj)[1]);
const l0=fs.readFileSync("/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md","utf8").split("\n");
const t=l0[64];
console.log("l0:65 L0_TABI_ROW.test =",L0.test(t),"| includes(kake) =",t.includes("kake"),"| kake count =",(t.match(/kake/g)||[]).length);
console.log("head:",t.slice(0,70));
'; echo "exit=$?"; echo

echo "=== U05/U06 live-leg scratch (no guard before try/finally) ==="
run grep -n "mkdtempSync(join(base\|mkdtempSync(join(runtime\|scratch.length <= 60\|at most 40 bytes\|liveError" scripts/check-bidi-runtime.mjs
node -e 'for (const n of [38,39,40]) { const L=n+1+("tabi-bidi-live-".length)+6; console.log("TMPDIR len "+n+" -> scratch len "+L+" <=60? "+(L<=60)); }'; echo "exit=$?"; echo

echo "=== U07 H2 receipt observed vs its own transcripts ==="
node -e 'const j=require(process.cwd()+"/corpus/evidence/round-32/bidi/receipt.json"); for (const r of j.runs) console.log("receipt run",r.name,"observed",r.observed[0].value.webSocketUrl);'; echo "exit=$?"
for r in run1 run2; do echo "-- golden rerun $r (the blob H2 substitutes) --"; git -C "$C" show b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd:.ufo/waves/round-32/w2/RerunDriver/bidi-run/$r/transcript.jsonl | grep -o 'ws://[^"\\]*' | head -1; done
run grep -c "observed" scripts/check-bidi-runtime.mjs

echo "=== U08 carried-errata adjudication landed ==="
run grep -n "20 of 27" LOG.md
run git -C "$C" log --oneline -S"20 of 27 (capital markers), on the other 21 of 31" -- corpus/lessons/round-32.md
run sed -n '229,230p' corpus/lessons/round-32.md

echo "=== U09 declaration-line scope ==="
run grep -c "loopback or operator-approved only" SKILL.md
run sed -n '2887p' SKILL.md
run sed -n '15,19p' PROVINCE.md
run grep -n "js-rendering-browser-execution" corpus/adjacency.tsv

echo "=== U10 S128 word count ==="
run sed -n '36p' corpus/lessons/round-33.md
printf '%s' 'path = g_build_filename(home, ".config", CHROMIUM_NAME "-flags.conf", NULL);' | wc -w; echo "exit=$?"; echo

echo "=== U11 refused-route count ==="
run sed -n '170p' corpus/lessons/round-33.md
node -e 'const j=require(process.cwd()+"/.ufo/waves/round-33/w1/CritC1Counter/receipts/D.json"); const r=j.newMappedRows||[]; console.log("newMappedRows",r.length,r.map(x=>x.disposition).join(","));'; echo "exit=$?"; echo

echo "=== U12 S128 pointer resolution ==="
run sed -n '7p;10p;50p;53p' .ufo/waves/round-33/w1/ScribeSrcLauncher/row-S128.md

echo "=== U13 five-land count and the superseding row ==="
run grep -n "five land" corpus/lessons/round-33.md
run grep -c "supersedes S124" corpus/SOURCES.md
git -C "$C" show 042d6d9:corpus/lessons/round-33.md | grep -n "five land"; echo "exit=$?"
git -C "$C" show 042d6d9:corpus/lessons/round-33.md | sed -n '186,187p'; echo "exit=$?"

echo "=== U14 criterion 87 omits the >=20 non-space conjunct ==="
run grep -c "non-space" corpus/QUALITY.md
run grep -n "goodQuote = " .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs
node -e '
const fs=require("fs");
const v3=fs.readFileSync(".ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs","utf8");
const words=eval(/^const words = (.+);$/m.exec(v3)[1]);
const goodQuote=eval(/^const goodQuote = (.+);$/m.exec(v3)[1]);
for (const q of ["a b c deeeeeeeeeeeeeee","ab cd ef ghijklmnopqrst"]) console.log(JSON.stringify(q),"words="+words(q).length,"nonspace="+q.replace(/\s/g,"").length,"good="+goodQuote(q));
'; echo "exit=$?"
