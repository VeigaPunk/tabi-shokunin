#!/bin/bash
# ScribeUDispositionsB — re-check the bytes each round-33 w2 finding (U15-U28) names,
# at the round-35 freeze a4bfef0f75027c915e715649950b1d46dcb33d83.
# Read-only. Usage: verify-holds.sh <clone-at-freeze>
set -u
C="${1:?clone}"
cd "$C" || exit 2
REV=$(git rev-parse HEAD)
echo "rev=$REV"
q() { # q <id> <label> <file> <sed-range> <grep-pattern> <expect-count>
  local id="$1" label="$2" file="$3" range="$4" pat="$5" want="$6" got
  got=$(sed -n "${range}p" "$file" | grep -Eci -- "$pat")
  local rc=$?
  if [ "$got" = "$want" ]; then st=HOLDS; else st=BROKEN; fi
  printf '%-4s %-7s %-52s got=%s want=%s grep_exit=%s\n' "$id" "$st" "$label" "$got" "$want" "$rc"
}
echo "--- U15 criterion 88 headline says mutuality; instruments are one-directional"
q U15 "QUALITY headline 'each other'"            corpus/QUALITY.md 545 "name each other's lane" 1
q U15 "r33 counter one-directional naming clause" .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs 218,227 'siblingQuote\) \|\| new RegExp' 1
echo -n "U15 r33 counter naming block: "; sed -n '220,227p' .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs | grep -c 'tabi'
echo "--- U16 criterion 89 source pointer lands on §Gate (no battery terms) vs M1"
q U16 "criterion 89 source line §Gate"           corpus/QUALITY.md 567 'round-33\.md §Gate' 1
echo -n "U16 battery-terms in lesson §Gate(24-92): "; sed -n '24,92p' corpus/lessons/round-33.md | grep -Eci 'battery|forgeriesAccepted|whitelist'
echo -n "U16 battery-terms in M1(173-189):          "; sed -n '173,189p' corpus/lessons/round-33.md | grep -Eci 'battery|forgeriesAccepted|whitelist'
echo "--- U17 criterion 90 enumerates by construction name (v4 absent)"
q U17 "criterion 90 parenthetical re-export"     corpus/QUALITY.md 574,576 'a driver re-exporting the gate' 1
q U17 "criterion 90 names v4 (byte-identical)"   corpus/QUALITY.md 574,576 'byte-identical' 0
q U17 "SCORECARD carries v4 with commit"         SCORECARD.md 1790,1798 'two byte-identical copies' 1
echo "--- U18 two screen rows name a surface that does not own the subject"
q U18 "screen line 21 (kake:358) -> crawler"     corpus/adjacency-screen.tsv 21 'crawler-discipline-vs-publishing' 1
q U18 "screen line 29 (kake:377) -> crawler"     corpus/adjacency-screen.tsv 29 'crawler-discipline-vs-publishing' 1
q U18 "robots surface row exists in map"         corpus/adjacency.tsv 13 '^robots-txt-publisher-audit-vs-client-obedience' 1
echo "--- U19 README:766 'Every browser-domain line' vs regex-bounded population"
q U19 "README:766 overclaim intact"              corpus/README.md 766 'Every browser-domain line' 1
echo "--- U20 no granularity rule; ledger keys identical-shaped kake lines two ways"
q U20 "ledger :22 -> crawler"                    corpus/adjacency-screen.tsv 6 'crawler-discipline-vs-publishing' 1
q U20 "ledger :322 -> robots"                    corpus/adjacency-screen.tsv 12 'robots-txt-publisher-audit-vs-client-obedience' 1
q U20 "granularity rule sentence (who drives)"   corpus/lessons/round-34.md 1,165 'who drives browsers' 0
echo "--- U21 substring semantics survive in gate, r33 counter and r35 v3 counter"
q U21 "gate sibling includes()"                  scripts/check-adjacency.mjs 729 'includes\(quote\)' 1
q U21 "r33 counter screen includes()"            .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs 202 'includes\(quote\)' 1
q U21 "r35 v3 counter screen includes()"         .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs 242 'includes\(quote\)' 1
echo "--- U22 R4 existential; t3-binding pins only the first capture"
q U22 "R4 shots.some"                            scripts/check-bidi-runtime.mjs 298 'shots\.some' 1
q U22 "t3-binding first-shot equality"           scripts/check-bidi-runtime.mjs 825 'new Set\(shots\)\.size !== 1' 1
echo "--- U23 driver check is exact-byte; SKILL row says 'that is the gate'"
q U23 "exact-byte driver==gate"                  scripts/check-bidi-runtime.mjs 778 'sha256\(drv\) === sha256\(gateBuf\)' 1
q U23 "SKILL row 'a driver that is the gate'"    SKILL.md 2907 'a driver that is the gate' 1
echo "--- U24 MutGateV2 M03 text says YES admits nothing; code admits it; r34 case pins admitted 2"
q U24 "M03 survivor text"                        .ufo/waves/round-33/w2/MutGateV2.md 63 'admits nothing' 1
q U24 "MEASURED /i"                              scripts/check-bidi-runtime.mjs 149 '\^\(yes\|no\)' 1
q U24 "measuredVerdict lowercases"               scripts/check-bidi-runtime.mjs 373 'toLowerCase' 1
q U24 "admission reads lowercase yes"            scripts/check-bidi-runtime.mjs 860 'row\.verdict === "yes"' 1
q U24 "r34 case pins uppercase admitted=2"       scripts/check-bidi-runtime.mjs 1031 'v3-a-m03-measured-cell-uppercase.*exit: 0, admitted: 2' 1
echo "--- U25 refetch independence is a name comparison"
q U25 "g7 seat != fetched_by"                    scripts/check-frontier-admission.mjs 213,219 'rf\.seat !== rc\.fetched_by' 1
q U25 "lesson carry condition"                   corpus/lessons/round-33.md 148,152 'until a second seat fetches' 1
echo "--- U26 two justifications for one 90d; no rule for the next tag-pinned row"
q U26 "S127-S129 90d by gate population"         corpus/lessons/round-33.md 26,27 'not .on-release.' 1
q U26 "S125 90d by immutability"                 corpus/lessons/round-33.md 144,147 'immutable' 1
q U26 "tag-pinned rule sentence"                 corpus/lessons/round-33.md 1,400 'tag-pinned' 0
echo "--- U27 two exit-2 Refusals in the r33 C2 counter, no case for either"
q U27 "entry table header -> Refusal"            .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs 118 'Refusal\(.entry table header not found' 1
q U27 "toplevel mismatch -> Refusal"             .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs 140 'toplevel mismatch' 1
q U27 "symlink case exercised"                   .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs 1,300 'symlink' 0
q U27 "r34 counter repeats unresolved toplevel"  .ufo/waves/round-34/counters/c2-gate-mutants.mjs 215 'rev-parse.*show-toplevel' 1
echo "--- U28 header claims exit 2 on 'lessons absent'; code cannot produce it"
q U28 "header exit-2 list"                       scripts/check-bidi-runtime.mjs 8 'registry or lessons absent' 1
q U28 "gateRows returns empty map on ls-tree fail" scripts/check-bidi-runtime.mjs 514 'return map' 1
echo "--- U19 population test (frozen round-33 regex vs kake PROVINCE.md lines)"
node -e '
const REGEX=/\b(browsers?|chromium|chrome|cdp|devtools|playwright|puppeteer|webdriver|bidi|selenium|webbridge|tabi|crawl(er|ers|ing)?|scrap(e|er|ers|ing))\b/i;
const {execSync}=require("child_process");
const body=execSync("git -C /home/vgpnk/Projects/shokunin/kake-shokunin show 044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md").toString().split("\n");
let un=[]; for (const n of [67,354,355,356,357,358,359,360,361,362,363]) if(!REGEX.test(body[n-1]||"")) un.push(n);
console.log("U19 regex-no-match lines in 67,354-363:", un.join(","));
console.log("U19 :67 first 60 chars:", (body[66]||"").slice(0,60));
'
echo "--- exit=$?"
