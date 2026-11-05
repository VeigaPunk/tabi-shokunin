# R66Connector — C1 read-only sibling-overlap scan (round 66, wave w1)

Date 2026-11-05. Leaf seat, no subagents dispatched. Read-only scan: no writes under corpus/, no ledger edits, no git mutations anywhere (read-only `git show`/`git diff` only, all against sibling repos at frozen heads). No tools installed (none needed). Scratch: `/fast/scratch/hyaku/tabi-r66/R66Connector` (created with `mkdir -p`, deleted before yield). cwd discipline: process cwd is the fleet root; all paths absolute.

## 1. Moved lanes: 16 of 20 (exit 0)

`awk -F'\t' 'NR==FNR{if(FNR>1)r[$1]=$2;next} FNR>1{if(r[$1]!=$2)print}' .ufo/waves/round-62/c1/snapshot-r62.tsv .ufo/waves/round-66/measure/snapshot-live-r66.tsv` → exit 0, 16 rows:

| lane | r62 head | live head |
|---|---|---|
| chousa-shokunin | 8a28732b | 378fda82 |
| kagi-shokunin | 063c4074 | a916f4a5 |
| kaidoku-shokunin | 9cc8fbbc | fe1913d9 |
| kake-shokunin | 376ac5dc | d838e744 |
| kama-shokunin | 723253c3 | 24d1895d |
| kasegi-shokunin | f7dcab84 | a5e814a1 |
| kengaku-shokunin | 614f0055 | 00462b59 |
| kotoba-shokunin | 1c8f37ed | 4df1e800 |
| kotodama-shokunin | bd520d85 | d39434b3 |
| kumitate-shokunin | a648a6f8 | 7218699c |
| mado-shokunin | 1a7e2ca4 | e4875ba5 |
| mori-shokunin | 30a29797 | 7b3fe9d5 |
| revenger-shokunin | 5915ad8d | dcb10b96 |
| souji-shokunin | 87430107 | 16fa821f |
| tameshi-shokunin | c6ed7cce | f256302b |
| tsukuroi-shokunin | 06f1bbbb | 64f45b79 |

Unmoved: audio-shokunin, game-dev-2d-shokunin, game-dev-3d-shokunin, lore-shokunin.

## 2. Per-lane screened-file deltas (git diff --stat, 16 lanes × PROVINCE.md/SKILL.md/SCORECARD.md; all git calls exit 0, failures=0)

| lane | PROVINCE.md | SKILL.md | SCORECARD.md |
|---|---|---|---|
| chousa | unchanged | +13 | +344 |
| kagi | 3 ins / 3 del (lines 73/75/77) | 4 ins / 4 del | +76 −4 |
| kaidoku | +126 (lines 644–769) | +105 | +263 −1 |
| kake | +57 (lines 691–747) | +142 −6 (lines 222, 1215–1216, 1351–1352, 1358) | +309 |
| kama | +15 | +9 | +209 −13 |
| kasegi | +8 | +22 −2 | +341 |
| kengaku | +7 −1 | +29 −5 | +245 |
| kotoba | unchanged | 600 ins / 599 del | +122 |
| kotodama | unchanged | +31 | +290 |
| kumitate | unchanged | +8 −3 | +425 −8 |
| mado | +9 (lines 486–494) | +75 −41 | +121 |
| mori | unchanged | +50 | +175 |
| revenger | unchanged | +98 −3 | +119 |
| souji | unchanged | +54 −1 | +78 |
| tameshi | unchanged | +33 | +172 −3 |
| tsukuroi | unchanged | +165 −4 | +768 |

Meter's screened set (PROVINCE.md of every sibling + map-referenced files: kake SKILL.md, kumitate SCORECARD.md, kama corpus/knowledge/listener-census.md, kaidoku's two r10 knowledge files): 9 files byte-changed (kagi/kaidoku/kake/kama/kasegi/kengaku/mado PROVINCE.md, kake SKILL.md, kumitate SCORECARD.md) — exactly the frozen meter's 9 `lane-screen-sha-mismatch` findings; 8 of those changed line count (kagi PROVINCE.md stayed 110 lines) — exactly the 8 `lane-screen-lines-mismatch`; bgHits re-derived equal everywhere (no bg-hits-mismatch findings). All 21 delta-ledger lane rows of the 16 moved lanes carry stale `head` — exactly the 21 `lane-screen-head-mismatch`. My independent re-derivation reproduces `v22-live-r66.json` finding classes 21/9/8/1/1, predicate false, findingCount 40.

## 3. BG new/changed lines (acceptance table)

BG_WORDS copied verbatim from the meter source by grep (c1-adjacency-host-v22.mjs:34):
`['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har']` — matching is lowercase substring (meter lines 209/262). Scan covered the 21-file screened set of the 16 moved lanes. Two independent methods agree: `git diff -U0` hunk parsing and r62-vs-live BG-hit-set comparison over `git show <rev>:<path>`.

**Result: 0 new BG-hit lines, 0 removed, 1 changed.**

| lane | path | live line | in r62 ledger? | overlaps tabi ground? |
|---|---|---|---|---|
| kake-shokunin | SKILL.md | 1358 | yes — `corpus/adjacency-host-delta-r62.tsv` row 141, disposition `no-tabi-ground` (row quote = the r62 whole line, now stale) | no — a kake gate-registry row for its publisher-side crawler quote-truth counter; makes no claim on tabi's browser/CDP ground |

Change detail (observed, `git show` both heads): r62 line 1358 is 1937 chars, live is 2254; first difference at char 547 — r62 ``…C1 both entries exist and the staged `corpus/knowledge/google-robots-txt-limits.md` does not…`` vs live ``…C1 both entries exist and the staged candidate name does not (`[r93-absence 2026-11-04: corpus/knowledge/google-robots-txt-limits.md — the round-60 staged draft name, never committed and never dele…``. BG hit word in both: `crawl`. The ledger row's stale quote at this line IS the meter's `delta-quote-not-whole-line` finding (`v22-live-r66.json`: `kake-shokunin:SKILL.md:1358`).

Every other live BG-hit line in every screened file is byte-unchanged since r62 (hit counts: chousa 0, kagi 4, kaidoku 6/12/25, kake PROVINCE 50, kake SKILL 20, kama 0/5, kasegi 0, kengaku 2, kotoba 3, kotodama 0, kumitate 0/0, mado 3, mori 0, revenger 4, souji 0, tameshi 0, tsukuroi 1). A ledger quote-vs-live-whole-line scan over all moved lanes' line rows flagged only SKILL.md:1358 — consistent with the meter's single delta finding.

## 4. tabi-ground overlap check (step 4)

**No moved lane's new browser-ground line claims ground tabi PROVINCE.md owns.** Named lines:

1. kumitate-shokunin `SCORECARD.md` live :1898 = `internals route to **tabi**, the `config.toml` REA MCP spawn key to **kaidoku**,` — a routing declaration naming tabi as OWNER (consistent with tabi PROVINCE.md:6–9, "the kimi-webbridge plugin … as primary substrate documentation"), not a claim against tabi. The line moved: `corpus/adjacency.tsv` map row cites `SCORECARD.md:1723`; the audit ledger row (`corpus/adjacency-host-audit-r62.tsv` row 10) says `moved  text now at :1885`; verified: r62 head :1885, live head :1898 — both pointers stale (the meter's `audit-note-moved-line`: "note :1885 != derived :1898").
2. kake-shokunin `PROVINCE.md` live :697–698: `missing-Date handling, cache storage/reuse permission, Vary/Pragma, browser/runtime / behavior and publication remain outside this capability.` and live :710: `revalidation, freshness, serving and browser behaviour stay frontier.` — the new rounds 87–91 cache-key additions explicitly route browser behavior AWAY from kake; a disclaimer, not an overlap claim.
3. kaidoku-shokunin `PROVINCE.md` +126 (live :644–769) — UPX/SquashFS reverse-engineering ground, 0 BG words; RE forensics is kaidoku's own per the map; no tabi overlap.

## 5. Method notes (honesty)

- Meter line counting is `text.replace(/\n$/,'').split('\n').length` (meter :204). kagi PROVINCE.md has no trailing newline: 110 lines = ledger 110 (meter agrees — no lines-mismatch finding for kagi). My first pass subtracted 1 and mis-flagged it; corrected here.
- Exit codes: snapshot awk compare exit 0; all `git -C <lane> diff --stat|diff -U0|show` calls rc 0 (loops reported `stat-pass-failures=0`, python harness `git failures: []`). No git command failed; no git mutation was run anywhere.
- Not run: the meter itself (frozen, L1-owned); my cross-check is the published `v22-live-r66.json` findings vs my independent re-derivation — they agree class-by-class.

Paths touched: this file, `.ufo/waves/round-66/w1/R66Connector/report.md`, scratch (deleted). Nothing else written; corpus/, ledgers, SCORECARD/LOG/PROVINCE/SKILL/MANIFEST, round-65 counters, fleet root, siblings: untouched.
