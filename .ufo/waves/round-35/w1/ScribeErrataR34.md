# ScribeErrataR34 — round-34 routed defects 1 and 6 (round 35 w1)

**Verdict.** Both routed defects hold in the bytes and both are drafted as append-only corrections at EOF of the two
documents that carry the stale text: one block in `corpus/README.md` and one three-bullet section in
`corpus/lessons/round-34.md`. README `:794` does say "four new map rows" and `:799` does say "`adjacency.tsv` rows 15–18"
with "four new boundaries", while the map at the round-35 freeze has 16 rows and its only rows absent at `15dfaccb`
are 15–17 (`lab-performance-tool-runs`, `recorded-har-producer-channel`, `screenshot-pair-compare-semantics`) — the
w1-numbered rows 15/17/18 were withdrawn, so both the count and the range are the withdrawn wave-1 state, and the
boundary list keeps one of its four boundaries and a `(refused-route)` tag that belonged to withdrawn row 18. The S131
row at `corpus/lessons/round-34.md:33` locates its quote `CdpTargetManager.ts:245-247` while the quote carries `// New
context.` (line 244) and `userContext,` (line 248): re-opened independently from the row's own URL, HTTP 200, raw
sha256 equal to the row's, lines 244–248 confirmed. The frozen `noHarmRule` names only kake `396`/`422`/`440`, while the
relabel also rewrote the kake `PROVINCE.md:411` row's fifth column (columns 1-4 byte-identical at both ends). The
round-34 report's one refusal phrase ("source drafts refused as duplicate URLs", `.ufo/reports/round-34/tabi.md:116`)
covers two grounds, and RFC 4122 (S134) was refused as not needed by any kill case, not as a duplicate; that report is
the fleet repo's, so the correction is drafted in the lane lesson. No lane file was edited; every drafted block was
tested by appending it to a scratch copy, with the original prefix sha256 unchanged.

## Evidence (commands, exit codes, bytes)

Run from `/home/vgpnk/Projects/shokunin/tabi-shokunin` unless noted. Lane tip `a4bfef0f75027c915e715649950b1d46dcb33d83`
(`git rev-parse HEAD`, exit 0); `git status --porcelain` exit 0, only untracked `.ufo/waves/round-35/…`.

| # | Command | Exit | Result |
|---|---|---|---|
| 1 | `grep -n "four new map rows" corpus/README.md` | 0 | `794:Append-only. One knowledge row, one new screen ledger, four new map rows; no earlier line is edited.` |
| 2 | `grep -n "rows 15–18" corpus/README.md` | 0 | `799:\| \`adjacency-screen-skill.tsv\` *(round 34, with \`adjacency.tsv\` rows 15–18)* \| … four new boundaries: kake live delivery (headers, redirects), kake lab performance runs (Lighthouse/DevTools), kotoba agent-facing tool text, kasegi authenticated consequential driving (refused-route) \| …` |
| 3 | `grep -n "CdpTargetManager.ts:245-247" corpus/lessons/round-34.md` | 0 | `33:\| S131 \| … \| \`CdpTargetManager.ts:245-247\`: "// New context. BrowsingContextImpl.create( targetInfo.targetId, parentId, userContext," \| admit (mined) \|` |
| 4 | `grep -c '^[^#]' corpus/adjacency.tsv` | 0 | `17` = header + 16 rows |
| 5 | `grep -n "lab-performance-tool-runs\|recorded-har-producer-channel\|screenshot-pair-compare-semantics" corpus/adjacency.tsv` | 0 | rows `15`, `16`, `17` — the three new ones |
| 6 | `git show 15dfaccb:corpus/adjacency.tsv` (row diff against 4/5) | 0 | 13 map rows at baseline; 15–17 absent there, so exactly three are new |
| 7 | `sed -n '104,111p' corpus/lessons/round-34.md` | 0 | `:108` row 15 withdrawn (re-keys row 12), `:109` row 16 kept, `:110` row 17 withdrawn, `:111` row 18 withdrawn |
| 8 | `git diff 15dfaccb 71a87305 -- corpus/adjacency-screen.tsv \| grep 411` | 0 | one `-`/`+` pair on `…:PROVINCE.md:411`; `awk -F'\t'` per side: 5 columns each, `$1`-`$4` identical, only `$5` differs |
| 9 | `grep -n "noHarmRule" tabi-shokunin/.ufo/waves/round-34/claims.json` (cwd fleet root) | 0 | `75:` … "may change only by the routed relabel of its kake 396/422/440 rows" |
| 10 | `grep -n "source drafts refused as duplicate URLs" .ufo/reports/round-34/tabi.md` (cwd fleet root) | 0 | `116:  - Rejects on record: … source drafts refused as duplicate URLs.` |
| 11 | `grep -rn "4122" .ufo/waves/round-34/ \| grep -v CritC1Counter` | 0 | `ScoutSessionBinding/rows.md:23` (S134), `:34` (2026-10-26T19:48:03Z, 200, 59,319 B, sha256 `3825a334…66e0c31`) |
| 12 | `curl -q -sS --proto =https '<S131 URL>?format=TEXT'` attempt 1 | 0 | 2026-10-26T21:12:35Z, HTTP **503**, 1,459 B (body discarded by retry; status+bytes only) |
| 13 | same, attempt 2 | 0 | 2026-10-26T21:12:39Z, HTTP **200**, 20,140 B, sha256 `f3483993a72e09531b8efe322ca317727f8241c06b708ddc8270c88102c33599` (= row's `f3483993…c33599`) |
| 14 | `base64 -d` + `sed -n '240,250p'` | 0 | decoded 15,104 B; `:244 // New context.`, `:245 BrowsingContextImpl.create(`, `:246 targetInfo.targetId,`, `:247 parentId,`, `:248 userContext,` |
| 15 | `grep -n "S131" corpus/SOURCES.md` + field 7 of `:145` | 0 | registry quotes `245-247` only (normalised, ellipsis) — its locator is **not** stale |
| 16 | `awk -F'\t' 'NR>1{print $7}'` on the map and on `git show 15dfaccb:…` | 0 | 3 `refused-route` rows in both, same keys (`reverse-engineering…` ×2, `secrets-vault-ops`) |
| 17 | prefix test: scratch copy + drafted block, `head -c <orig> \| sha256sum` vs `sha256sum <orig>` | 0 | README `d62bc6e2…2c55f` unchanged (80,600 → 81,615 B, +1,015); lesson `790bc779…06b0` unchanged (17,480 → 19,672 B, +2,192) |
| 18 | row/heading census on the appended copies | 0 | README `\| R` 0→0, `\| Frontier item` 12→12, `## ` 37→38; lesson `## ` 8→9; EOF byte `0a` on both |
| 19 | tally/script scan of both blocks (`scripts/*.mjs`, `--self-test`, `N-case`, `cases=N`, `N cases`) | 1 | no match — no `m1` finding can arise from the appends |

## Deliverables

- `.ufo/waves/round-35/w1/ScribeErrataR34/corrections.md` — the draft: two targets, four blocks, each with the stale
  bytes verbatim, the re-derivation, the paste-at-EOF text, and the post-append invariants; §4 is the verification
  table above in full; §5 lists five findings for the L1.
- `.ufo/waves/round-35/w1/ScribeErrataR34/source-receipt.txt` — the S131 re-open receipt (URL, both attempt stamps,
  statuses, bytes, raw and decoded sha256, lines 240–248).
- This report.

Correction blocks, as the L1 needs them (target file | anchor | what is appended):

1. `corpus/README.md` | after `:804` (EOF) | new section `## Round 34 — corrections to the round-34 rows (append-only;
   cites the stale lines in this document; round-35 errata intake 1)` with one bullet naming `:794` and `:799`, the
   three surviving rows 15–17, the three withdrawn w1 rows and the two kaidoku boundaries `:799` omits.
2. `corpus/lessons/round-34.md` | after `:165` (EOF) | new section `## Corrections — round 35 errata intake 6
   (append-only)` with three bullets: S131 locator `245-247` → `244-248`; the `noHarmRule` cell list vs the kake `:411`
   note column; the report's single refusal phrase vs RFC 4122's not-needed ground.

## Out of scope, limits, and tooling

- No lane file, index, jj state, fleet file or sibling repo was written. Nothing was committed. No subagents.
- Not re-run: the round-34 gates and counters. The spot-check's C1/C2 re-measurements were read, not repeated; this seat
  re-derived only the bytes its corrections cite.
- The 503 body was overwritten by the retry's `-o`, so attempt 1 is recorded by status and byte count only; no first
  line is quoted for it (QUALITY 93 shape, minus the body).
- No tool installed or upgraded. Network used: one `curl` GET to `chromium.googlesource.com` (allowed host), read-only.
- Scratch `/fast/scratch/hyaku/tabi-r35/ScribeErrataR34` deleted before yield; receipts copied into the output dir.
