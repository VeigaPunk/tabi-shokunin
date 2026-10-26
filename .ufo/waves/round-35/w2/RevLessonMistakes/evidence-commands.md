# RevLessonMistakes — command log (all commands run with cwd /home/vgpnk/Projects/shokunin/tabi-shokunin unless noted)

## Directory setup
- `mkdir -p /fast/scratch/hyaku/tabi-r35/RevLessonMistakes /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/RevLessonMistakes` → OK (scratch later removed unused)

## F1 — M1 artifact provenance
1. `git log --all --format='%h %s' -- .ufo/waves/round-35/measure/c2-M1-boundary-15.json` → exit 0; lines: `083c5c6 round-35: w1 integration …`, `29fddfe ` (empty subject)
2. `git log -1 --format='%H %s'` → exit 0; `083c5c643be7aa5965a5de3458a32ed0d289ead3 round-35: w1 integration …`
3. `git status --porcelain -- .ufo/waves/round-35/` → exit 0; only w2 dispatch/spec files untracked (not mine)
4. `sha256sum .ufo/waves/round-35/measure/c2-M1-boundary-15.json` → `9fa4570e344f02a9b12616a15e8cbf490f5e2473421a246a4ad715b74db7b05f`
5. `git show 083c5c643be7aa5965a5de3458a32ed0d289ead3:.ufo/waves/round-35/measure/c2-M1-boundary-15.json | sha256sum` → identical `9fa4570e…`
6. `wc -c .ufo/waves/round-35/measure/c2-M1-boundary-15.json` → 2700 bytes (2 lines: JSON + `exit=0`)
7. `git cat-file -t 86d6df42cb743691cff0e13f2503dcaf2ed70651` → **exit 128**: `fatal: git cat-file: could not get object info`
8. `git log -1 --format='%H|%an|%ae|%ad|%s' 29fddfe` → `29fddfe30de7f156dab395fcce53784ee53f8815|tabi-shokunin|tabi@shokunin.local|Mon Oct 26 18:37:44 2026 -0300|` (empty subject); `git branch -a --contains 29fddfe` → no output

## M1 substance
9. `git show a4bfef0f….ufo/waves/round-35/claims.json | grep -nE 'admitted >= |admitted 16|TARGET'` → `162: "predicate": "… admitted >= 16"`, `163: "target": "admitted 16 of the 16 matrix rows …"`
10. `git show a4bfef0f…:.ufo/waves/round-35/counters/c2-firefox-bidi.mjs | grep -nE 'TARGET|loopback'` → `58:` loopback comment, `77: const TARGET = 14;`
11. `grep -o '"admitted": [0-9]*' .ufo/waves/round-35/baseline/controls-summary.json | sort | uniq -c` → `5 "admitted": 0`
12. `grep -n 'm11\|TARGET' .ufo/waves/round-35/w1/MutC2Counter.md` → `74: | m11 | TARGET 14→1 (:77) | … **survived** |`
13. read `.ufo/waves/round-35/measure/c2-M1-boundary-15.json` raw → admitted 15, unmeasured 2, failing 0, R16+R17 verdict "no", "predicate":true, exit=0; gateSha256/counterSha256 == frozen digests

## F2 — pre-freeze J2 history
14. `git log --all --format='%h %s' -- .ufo/waves/round-35/baseline/c1-J2-screen-all.json` → `8600b51 ` (empty), `8c28ae1 ` (empty), `a4bfef0 round-35: freeze …`
15. `git log -1 --format='%H|%ad|%s' 8600b51` / `8c28ae1` → both `Mon Oct 26 17:42:56 2026 -0300`, empty subject
16. `git cat-file -p 8600b51:.ufo/waves/round-35/baseline/c1-J2-screen-all.json | grep -oE …` → `"unaccounted":0`, `"screenFindings":[]`, `"predicate":false`; identical for `8c28ae1`
17. `diff <(git cat-file -p 8600b51:<path>) <(git cat-file -p 8c28ae1:<path>)` → empty (byte-identical)
18. `git for-each-ref --format='%(refname)' | while read r; do git merge-base --is-ancestor 8600b51 "$r" && echo "$r"; done` → `refs/jj/keep/8600b51bfdaa3c432a72d4133463a916bc46775c` only
19. `grep -rln 'screen-quote' --exclude-dir=.git .` → only `corpus/lessons/round-35.md`, round-33 counter/mutant files, w1 seat files
20. `grep -n 'm09\|shortLine\|31' .ufo/waves/round-35/w1/MutC1Counter.md` → `79: | m09 | short-line screen exception | 242 | … | J8 0→1 true→false; 31 screen-quote findings, unaccounted 31 |`
21. `grep -oE '"unaccounted": 31' .ufo/waves/round-35/w1/MutC1Counter/m09-shortLine.deltas.json` → 7+ hits (committed at HEAD via `git ls-tree HEAD` check)
22. `grep -n 'non-space\|trimmed' .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs` → `:34-35` the short-line admission rule (fix present in freeze)

## F4 — egress sample
23. `head -20 .ufo/waves/round-35/measure/driver-egress-sample.txt` → no output; `git show --stat 29fddfe` → `driver-egress-sample.txt | 0` (0-byte file, committed)
24. `grep -n 'dns\.disabled\|trr' scripts/bidi-firefox-loopback-round35.mjs` → `153:` comment, `155: "moz:firefoxOptions": { args: ["-headless"], prefs: { "network.dns.disabled": true, "network.trr.mode": 5 } }`
25. `grep -n 'D11\|egress' corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` → `271: ### D11 …`, `273: … its integration run sampled 0 non-loopback … (driver-egress-sample.txt)`

## F5 / M4 — measure.sh and CritC2Counter
26. `git show a4bfef0f…:.ufo/waves/round-35/measure.sh | grep -nE 'firefox|geckodriver|--version|sha256|provenance'` → `29:` firefox `--version` + sha256, `30:` geckodriver `--version` + sha256
27. same file, counter invocation lines → `33: node "$S/k/$C2" --rev "$full" --repo "$d" --json` (no `--firefox`/`--geckodriver`)
28. `git ls-tree HEAD --name-only -- .ufo/waves/round-35/w1/CritC2Counter/` → E1a…E2b summary JSONs present at HEAD (E0–E7 per report)

## §Gate
29. `grep -nE 'S13[4-9]|S14[01]' corpus/SOURCES.md` → rows at `:148-155`; digests match lesson table (S134 `2b023afe…`, S135 `e596eee2…`, S136 `d3e65953…` (grep -c → 1), S137 `757e3955…`, S138 `72cd6162…`, S139 `721e6f0c…`, S140 `bb07ee85…`, S141 `419fc73f…`); `:200` changelog "Opened 9, registered 8 … refused 1"
30. S138 lesson quote word count → 22 (≤ 25)

## §Errata intake
31. `grep -n '794\|799' corpus/README.md` → `808-809` correction block naming both lines
32. `grep -c '^##* *U' ScribeUDispositionsA/dispositions.md` → 14; `head -25 ScribeUDispositionsB/dispositions.md` → "All fourteen findings (U15–U28) still hold", 36 HOLDS / 0 BROKEN receipt
33. `tail -16 corpus/lessons/round-34.md` → three round-35 corrections (S131 span 244-248, kake:411 note cell, RFC 4122 basis)
34. `grep -nE '^\| *S125 *\|' corpus/SOURCES.md | grep -c 90d` → 1
35. `ls .ufo/waves/round-35/w1/ | grep -icE 'w1-round|round-35-w1|rw1'` → 0 (no misroot); 51 entries, all seat-named

## Rules
36. `CORPUS.md:171-182` read; `grep 'vocabular|lesson proposal|class' /home/vgpnk/Projects/shokunin/.ufo/waves/kaika-w1/mistakes.md` → `:447-449` the nine-token vocabulary
37. `LEARNING.md:19-21, 70-71` read
38. `corpus/QUALITY.md:-70` → criteria 98, 99, 100 present under "Round 35 additions" with red states citing round-35 lesson M1/M4/M3

No lsp device available to this seat; all checks are byte/git-level reads. No lane script executed, no browser launched, no network fetch, no tool installed. All git calls read-only in the lane. Scratch removed before yield.
