# RevLesson34 — round-34 lesson review (w2 FALSIFY, attempt 1)

**Verdict: holds.** Every load-bearing fact in `corpus/lessons/round-34.md` at `04f9623dde8ad35d470cecf766e421eafbcb47fa` verifies against its committed receipts: all nine control readings match `baseline/controls-summary.json` exactly; all four S130–S133 fetch stamps, byte counts and digests match the w1 scout receipts byte-for-byte; map rows 15–18 match `corpus/adjacency.tsv` and the four new declarations at `SKILL.md:2921-2924` (absent at the baseline); the 62-row screen ledger carries the exact reason split the lesson states; the self-test measures 56 cases (`BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56`, exit 0) and both frozen counters read predicate true at the integration rev in my own runs (C1: newMapped 4, unaccounted 0, clean 17/17; C2: killed 20/20, battery true). Each of the four Mistakes has a real, receipted red state and an honest captured-by within the limits noted below. Three low defects, all wording/bookkeeping in the lesson prose rather than its claims: **(D1)** the mistake-sweep paragraph says "28 findings (U01–U28)" where its own committed receipt says **32** (U01–U32) and its routing enumeration omits U06 and U29–U32 — five items silently dropped from the shipped round-35 carry list; **(D2)** two sentences cite a "round-34 SCORECARD disposition" and a completed wave-2 attack that do not exist at the review rev (forward references); **(D3)** the Gate sentence "The integration admits no row of that shape" is ambiguous and, on the M3 rename-route reading, is contradicted by the lesson's own contested row 15. Two informational notes: the committed M1 row names one misrooted seat where the w1 record shows two (the uncommitted worktree edit already amends it), and M3's captured-by pointer "prompt §6 item 9" resolves in no lane-committed artifact.

Reviewed at lane HEAD `04f9623` (tracked tree = the wave-1 integration commit). The worktree carries the L1's in-flight w2 edits: ` M corpus/lessons/round-34.md` (2 hunks: M1 row update + a new "## Wave-1 attacks" section) and untracked `w1-results.json`, `w2-*` files, and `w1/MutC1Counter.md`+`/` (moved into `w1/` after the integration commit — exactly what the worktree M1 amendment says). My review is of the committed text (`lesson-committed.md`, extracted to my output dir); the worktree diff is archived beside it.

## 1. Gate table facts vs receipts — holds

**Controls (9/9 match).** `baseline/controls-summary.json` vs the lesson's Gate table:

| control | lesson says | receipt says | match |
|---|---|---|---|
| c1-J1 | candidates 67, mapped 1, unaccounted 66, newMapped 0, false | candidates 67 (A 38/B 29), mapped 1, screened 0, unaccounted 66, newMapped 0, clean 13/13, exit 1, false | ✓ |
| c1-J2 | unaccounted 0, newMapped 0, false | screened 66, unaccounted 0, newMapped 0, exit 1, false | ✓ |
| c1-J3 | newMapped 0; check-adjacency flags 1 of 4 junk rows, false | newMapped 0, adjacency failed rows 17/verified 16/findings 1, exit 1, false | ✓ |
| c1-J4 | mapped 5, newMapped 0, false | mapped 5, screened 62, exit 1, false | ✓ |
| c1-J5 | mapped 5, newMapped 0, false | mapped 5, screened 62, exit 1, false | ✓ |
| c2-J1 | killed 8 of 20; survivors M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19; false | identical survivor list, pristine/neutral/decoy 0, twinsFailing [], battery true, exit 1, false | ✓ |
| c2-J2 | killed 20; neutral, decoy and 20 twins fail; false | killed 20, neutral 3, decoy 3, twinsFailing 20 (M01, M01b, M02–M19), exit 1, false | ✓ |
| c2-J3 | killed 20; 20 twins fail; false | killed 20, neutral/decoy 0, twinsFailing 20, exit 1, false | ✓ |
| c2-J4 | survivors 12; round-33 battery false | killed 8, survivors 12, battery false, exit 1, false | ✓ |

All nine receipts + provenance are committed at the freeze `59f1b47` (`git ls-tree 59f1b47 -- .ufo/waves/round-34/baseline/` → 33 entries).

**S130–S133 vs w1 receipts (exact).** `SOURCES.md:144-147` and the lesson's source-rows table against the seat receipts:

| row | lesson / SOURCES stamp | w1 receipt | match |
|---|---|---|---|
| S130 token.cc | 2026-10-26T19:47:08Z, 2,992 B raw `36deab71…9b889`, decoded 2,243 B `6ef1fc2b…2628f` | `w1/ScoutContextIdSource/rows.md` Gate table: same stamp, same bytes, same digests | ✓ |
| S131 CdpTargetManager.ts | 19:49:29Z, 20,140 B raw `f3483993…c33599`, decoded 15,104 B `cd435aa8…5cce9d9` | same receipt, same values | ✓ |
| S132 commands.cc | 19:47:14Z, 20,924 B raw `4bc5d8dc…d64f22`, decoded 15,692 B `d546e257…3c50f7`, "drafted as its S133" | `w1/ScoutSessionBinding/rows.md` (its S133): 19:47:14Z and 19:47:15Z, same bytes/digests | ✓ |
| S133 PKGBUILD + launcher.c | 19:47:34Z / 19:47:35Z, 18,285 B `a6fd458b…961be`, 3,546 B `b2772fe0…82624` | `w1/ScribeErrataS128/fetch-receipts.tsv`: identical stamps, bytes, sha256s (launcher.c byte-identical at tag v8 and commit) | ✓ |

Also verified: S128 superseded append-only (`git diff --numstat 15dfacc..04f9623 -- corpus/SOURCES.md` → `4 0`; S128's row still cites `:13`, S133 corrects to `:12`); S125's recheck cell still `90d` (row tail `…| 90d | corpus/knowledge/webdriver-bidi-runtime-round-32.md`), with `w1/ScribeS125Cadence.md` receipting the 156.0.8078.47 fetch and the `on-release` proposal, routed to round 35 — as the lesson states; the rejected W3C drafts were ScoutSessionBinding's S131/S132 on URLs already registered as S124/S126 (both rows exist); no S134 row in SOURCES (RFC 4122 rejected); assimilation "none" matches `w1/ScoutAssimilation.md:3` ("148 SOURCES rows + 86 knowledge entries"); 503-first-then-retry is recorded in both scout receipts, matching the search log. Search-log counts reproduce from `baseline/c1-candidates.tsv`: set A kake 7, kotoba 11, kumitate 5, mori 8, tameshi 5, tsukuroi 2 = 38; set B 29.

## 2. C1 gate decisions vs the ledger — holds

- Rows 15–18 of `corpus/adjacency.tsv` match the lesson's table on surface, sibling, candidate ref, sibling quote, disposition and `tabi_ref` (`SKILL.md:2921`–`:2924` — the declaration bullets sit at exactly those lines, `grep -n` verified). Each `tabi_quote` is a verbatim substring of its declaration line and names the sibling (kake, kake, kotoba, kasegi); both split-declared kake rows' sibling quotes contain "tabi"; row 17's sibling quote contains "tabi"; row 18 is refused-route (no sibling-side naming required).
- The four declaration bullets are new: `git show 15dfacc:SKILL.md | grep -c "Live delivery: HTTP status|Lab performance runs:|Agent-facing tool text (kotoba)|Authenticated consequential driving: tabi refuses"` → 0 (the lone baseline hit for "sibling-overlap declarations" is round-33's section header at `SKILL.md:2883`, a different section).
- Screens: `corpus/adjacency-screen-skill.tsv` = 63 lines = header + 62 rows; reason counts same-surface 35, third-lane-report 23, no-claim-declared 3, not-browser-sense 1 — exactly the lesson's split.
- The five L1-reversed screens are in the ledger with the stated surfaces (kaidoku `:99/:151/:117` → same-surface `cdp-runtime-observation`; kumitate `:250/:278` → same-surface `kimi-webbridge-plugin-internals`), and the kaidoku quotes indeed contain no "tabi" token, so the counter could not have counted them — the lesson's parenthetical is correct. The six same-surface group screens are present (`field-performance-cwv.md:153` → `lab-performance-tool-runs`; census-round49 `:172/:173/:175` → `agent-facing-tool-text-craft`; kasegi `SKILL.md:267`, `ufo-workspaces.md:272` → `authenticated-consequential-driving`). Criterion 91 exists (`corpus/QUALITY.md:585`) and the reversals are recorded in the lesson.
- Row 15 contested: `w1/ConnBoundaries.md:37` names `SKILL.md:408` inflation risk 1 ("if Adj seats mint a 'live-delivery-observation' surface for it, that is one boundary re-keyed, not two") — the lesson's "Contested by w1 ConnBoundaries and kept for wave-2 attack" is accurate; see D3 on the Gate sentence.
- **Independent measurement** (my clone at `04f9623`, frozen counter bytes `0dba816c…` = `claims.json:frozenDigests`): `node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --rev 04f9623… --json` → **exit 0**, `predicate:true candidates:67 mapped:5 screened:62 unaccounted:0 newMapped:4 adjacency:{clean,rows:17,verified:17,findings:0}`, `leadsReanchored:["…mirror-pitfalls.md:39@04404859… -> 40"]`, `leadsUnresolved:[]`. The gate decisions as ledgered produce exactly the claimed outcome.

## 3. The four Mistakes

- **M1 `misroot` — holds.** Red state real and pasteable: `grep -c 'round-34/w[12] =' w1-dispatch.json w2-dispatch.json` → **1** / **0**, exactly the lesson's stated reading; `w1-dispatch.json:296` embeds the label-in-path context ("wave w1 = build + first falsifiers"); `w1-results.json:94` records MutC1Counter's output at `.ufo/waves/round-34/w1 = build + first falsifiers/MutC1Counter.md` (+ 47-file dir); no label-path directory remains in the lane (`find … -name "*w1 =*"` → nothing). captured-by "none — the validator does not check context paths" is empirically supported: the misroot happened and no instrument flagged it (the L1 found it moving files); no validator script in the fleet `.ufo/` (`lane-watch.sh`, `gates/root-ledgers.py`) names seat output dirs. Informational (I1): the **committed** M1 names only AdjTameshiTsukuroiChousa; the second seat's misroot is visible only in untracked `w1-results.json`, and MutC1Counter's output is untracked in `w1/` (moved after the integration commit — the worktree M1 amendment states exactly this and is consistent with `git status`).
- **M2 `stale-locator` — holds, and the intermediate claim is now measured.** Red state verified byte-level: round-33 `w1/ConnSiblingScan/leads.tsv:24` cites `mirror-pitfalls.md:39@04404859…`; at that pin `:38` = `## Browser/CDP lane`, `:39` = blank, `:40` = `- Lease first: …` (`git -C kake-shokunin show 04404859:… | sed -n 38,40p`). The frozen counter's anchor is exactly as documented (cited → ±1/±2 → 4-consecutive-word window; moves reported; unmatched skipped — `c1-adjacency-sweep-v2.mjs:155-168`), and `baseline/c1-J1-do-nothing.json` records `leadsReanchored: [mirror-pitfalls.md:39 -> 40]`, `leadsUnresolved: []`. **New experiment:** I removed only the 4-word-window stage from a scratch copy of the frozen counter and re-ran it at the baseline — **exit 1, exactly 3 unresolved** (`kake …/js-rendering-queue.md:77`, `kotoba …/sibling-overlap-census-round74.md:150`, `kotoba …/sibling-description-rewrites-round8.md:136` — all wrapped-quote leads) with the same single re-anchor. The lesson's "the quote-exact anchor then left 3 leads unresolved" is therefore a measured fact, not narrative. QUALITY 94 (`corpus/QUALITY.md:629`) lands the rule with this red state.
- **M3 `control-gap` — holds.** Red state receipted: `w1/CritC1Claim.md` + `CritC1Claim/c1-probeA-rekey.json` — probe A (3 renamed refused-route surfaces on lines restating the mapped crawler split + 1 new tabi line) reached **exit 0, predicate true, newMapped 3, clean 16/16** at the freeze. Round-33 lesson M5 named the route (`corpus/lessons/round-33.md:170`: "CritC1Axis (four cosmetic renames of the mapped kake split) reach predicate true more cheaply"). QUALITY 96 (`corpus/QUALITY.md:665`) lands the criterion with this exact red state ("round 34's freeze scored five C1 controls but not the rename route … probe A reached the predicate with it"). captured-by: the substantive judgement (the freeze skipped a prior-lesson-named construction) is fully receipted; the pointer "prompt §6 item 9 (build the cheapest control)" resolves in no lane artifact — `grep "§6|item 9|cheapest control"` over `w1-dispatch.json`, `w2-dispatch.json`, `w2-spec.json` finds only seat-level "cheapest junk commits … score them with the frozen counter" phrasing, and the worktree's wave-1 attacks preamble paraphrases the same item 9 differently ("a rule changed after any seat has scored is not the claim's rule"). Informational (I2): the pointer cites orchestration context not committed in the lane; two in-lane citations of it disagree in paraphrase.
- **M4 `premature-impossibility` — holds.** Evidence receipted: `w1/ScribeSelftestNote.md:9-11` declares M04/M05/M06 equivalent, "ceiling is 17 of 20". Refutation receipted: the gate at `04f9623` contains `v3-a-m06-session-id-uppercase`, `v3-b-m04-transcript-path-repeated`, `v3-b-m05-transcript-sha-repeated`; `w1/ExecKillsB/mutant-outcomes.json` shows M04 and M05 killed with the case failing **only** on the detail pin (M04: expected detail "transcript path repeated across runs", actual "transcript sha256 repeated …"; M05: expected "transcript sha256 repeated", actual "sessionId repeated …") — i.e. without `detailIncludes` the same fixtures match the case's exit/admitted/reason expectations on the mutant and would pass, which is precisely the lesson's "shown able to fail". QUALITY 95 (`corpus/QUALITY.md:646`) lands the rule; its own red state (the `c2-J3` sniff construction) is receipted in `baseline/c2-J3-find-sniff.json`. captured-by "none" is honest: no round instrument flagged the equivalence claim; a w1 seat refuted it.

**Mistake sweep pasteable/checkable:** `sweep-checks.sh` and `sweep-receipts.txt` are committed beside `mistakes.md` in `w1/ScribeMistakeSweep/`; the sweep's §5 gives the command (`bash sweep-checks.sh <lane>`, exit 0). The sweep itself is checkable — but the lesson's **summary** of it is not accurate (D1 below).

## 4. D1 (low) — the mistake-sweep paragraph misstates its own receipt

Committed lesson `:97-100`: "28 round-33 wave-2 findings had no disposition (U01–U28). They are routed: U01 …, U02/U03 …, U04 …, U05/U07/U27/U28 …, U08–U13/U16–U19 …, U14/U15/U20/U21 …, U22–U26 …."

- The cited receipt, committed in the same tree, says **32**: `w1/ScribeMistakeSweep/mistakes.md:8` — "Verdict in one line: 32 findings (or finding clusters) from round-33 wave 2 carry no disposition line…" — with index rows U01–U32 (`:54` U06, `:77-80` U29–U32, details at `:226`, `:626`, `:641`, `:661`, `:676`).
- The lesson's routing enumeration lists **27** of the 28 ids it claims: **U06** (RerunLiveV2 D-A, the TMPDIR 38-vs-40 refusal-message precision item) is in no group.
- **U29–U32** (CritForgeV2A's five limits never landed in the v2 note; SentinelLiveV2's inherited session-bus env + off-host TLS; the W1→W2 delta sentence; CritCorrections D5's landing claim) are omitted entirely, so "each stays open for round 35" drops 5 of the 32 items from the shipped carry list.
- Mitigation kept in mind when grading: the sweep receipt is committed, intact and cited, so a round-35 intake reading it still finds the five; nothing landed this round that the omission hides (the lesson's "Round 34 lands none of them except where a round-34 item already covered the same bytes" is unaffected). The likely cause is a stale count from an earlier 28-item draft of the sweep. Severity: **low** — a carry-record defect, not a claim defect.

## 5. D2 (low) — forward references at the review rev

- Committed lesson `:26`: "The integration admits no row of that shape: every new row **was attacked in wave 2** (round-34 SCORECARD disposition)." At `04f9623` wave 2 had not reported (the w2 dispatch files are untracked, created after the commit) and `SCORECARD.md` has no round-34 executed-disposition block (only `:1855` "declared claims" and `:1885` "corrections").
- Errata intake item 4 cites "(round-34 SCORECARD disposition)" for the per-candidate `check-selfassessment` reading; no such reading is committed at this rev (`git ls-tree 04f9623 -- .ufo/waves/round-34/measure/` → empty). The durable fix (QUALITY 92, `corpus/QUALITY.md:594`, with its own red state at `9f008f6c`/`bf48b81c`) **is** landed, so the criterion's substance does not depend on the missing receipt.
- Both sentences are written from the round-close vantage in a document the L1 amends at close (the worktree shows that amendment cycle in progress). Severity: **low** — at the review rev they assert outcomes not yet in evidence.

## 6. D3 (low) — "The integration admits no row of that shape" is ambiguous and overstated on the M3 reading

The Gate sentence (`:26`) follows the CritC1Claim probe description, whose shape is "renamed surfaces on lines restating a mapped split". Read that way, the sentence is contradicted by the lesson's own C1 section: row 15 mints the new surface `live-delivery-observation` on `SKILL.md:408`, the very line `w1/ConnBoundaries.md:37` flagged as inflation risk 1 ("that is one boundary re-keyed, not two"), and the lesson itself marks row 15 "Contested … kept for wave-2 attack". Read narrowly ("no row of the probe's junk-declaration shape"), the sentence is true — the probe's rows were refused-route with a shared junk `tabi_quote`, while rows 15–18 carry substantive two-sided declarations. The accurate committed form is "no row of that shape is admitted unattacked; row 15 is the admitted row w1 clustering placed in an existing-boundary group, contested and kept for the wave-2 attack." Severity: **low** (wording; the honest record exists one section later).

## 7. Errata intake vs round-33 spot-check routed defects 1–7 — verdict per defect

1. **Adjacency carried claim — landed.** Set A is re-derived by the frozen counter at the frozen pins with `/\btabi\b/i` over `SKILL.md` + `corpus/knowledge/**/*.md` (the blind-spot fix; counter header `:22-31`), set B inherits the round-33 leads (29 after dedupe, PROVINCE excluded); integrator reversals recorded per criterion 91 (five rows, lesson §C1). Disclosed scope limit: non-tabi-naming browser ground outside set B stays out of scope; w1 CritC1Claim's independent 132-line sample found no new boundary in it.
2. **Battery v2 — landed (mutant half).** The 20 frozen mutants are C2's target and are killed 20/20 at the integration rev (my run below); randomised subjects and CritForgeV2B/C stay limits — recorded in `claims.json:notClaimed[1]` and entry §5 (`corpus/knowledge/bidi-gate-selftest-round-34.md:75-82`). The spot-check's "11 MutGateV2 survivors" and the round-34 "12" reconcile without defect: round-33 counted 11 surviving **both** detectors (MutGateV2.md:3: "9 killed (8 by both, 1 battery-only — M10); 11 survive both"); round-34's C2 counts the self-test's 12 survivors (including M10, which the battery kills and the self-test misses). Both are correct on their own terms.
3. **Calibration counter v4 — landed as notClaimed** (`claims.json:notClaimed[0]`, matching the spot-check's own pointer).
4. **Integration hygiene — landed as criterion; reading receipt prospective.** QUALITY 92 landed with a real red state; the per-candidate reading for `04f9623` is not committed at the review rev (see D2).
5. **Carried precision items — landed.** S133 supersedes S128 append-only (verified above); `corpus/adjacency-screen.tsv` rows 31/35/39/42 read exactly as the lesson says (`:396` → same-surface `robots-txt-publisher-audit-vs-client-obedience`; `:411` same-surface `crawler-discipline-vs-publishing` with the CritScreenCrawlerSplit note; `:422`/`:440` → same-surface `crawler-discipline-vs-publishing`); the three append-only corrections exist (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:252` "## Round 34 — correction", LOG.md, `corpus/lessons/round-32.md`); QUALITY 93 landed with the four-distinct-404-sha256 red state.
6. **S125 cadence — routed honestly.** Cell unchanged (`90d`, verified), the frozen append-only rule is named as the reason, the proposal and the 156-fetch receipts are recorded (`w1/ScribeS125Cadence.md:4-28`), routed to round 35 — a faithful "not this round" intake.
7. **M3 residual (pinned inputs) — landed.** `baseline/controls.mjs:78` loads `c1-pins.json` and the J3 construction builds junk rows from `git show ${PINS[l]}:SKILL.md` (`:80-81`) — branch heads are no longer read at run time.

## 8. C2 kill-case facts (lesson §C2) — holds

- Twelve `v3-*` cases present with exactly the lesson's seat mapping: `v3-a-*` = M01 M03 M06 M08 M09 M10, `v3-b-*` = M04 M05 M07 M16 M18 M19 (12 `id: "v3-` matches).
- **Self-test 44 → 56 measured:** `node scripts/check-bidi-runtime.mjs --selftest` in my clone → exit 0, `BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56`; the baseline tallies said 44/44 and `SCORECARD.md:1885-1892` carries four append-only corrections superseding them with 56/56.
- `detailIncludes` merge as described: ExecKillsA's patch uses `detailIncludes` (3 hits), ExecKillsB's uses `bDetailIncludes` (8 hits) — two seats, two field names; the L1 merged them into one optional field the runner checks against the printed finding detail (`scripts/check-bidi-runtime.mjs:1072-1073`).
- No rule line changed: the diff's 7 deleted lines are all fixture-builder/runner lines (`goldenLines` signature, `wsUrl`, `lessonsDoc`, its map, a `fx.put` call, the population comparison, the `results.push`); all 20 mutant find texts occur **exactly once** in the gate at `04f9623` (node check over `baseline/c2-mutant-finds.json`: 20 checked, 0 violations).
- **Frozen C2 counter at the integration rev** (digest `3cf5eb69…` = `claims.json:frozenDigests`): exit 0, `predicate:true killed:20 survivors:[] unappliable:[] twinsFailing:0 pristine:0 neutral:0 decoy:0 battery:true` (~62 s). Complementary w1 receipts agree: ExecKillsA `counter.json` killed 14 / survivors = ExecKillsB's six; ExecKillsB killed 14 / survivors = ExecKillsA's six.

## Commands run (all read-only on the lane; runs in my scratch clone)

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD                 # 04f9623… (rc 0)
git clone --shared …/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q --detach 04f9623…   # rc 0
TMPDIR="$S" node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --rev 04f9623… --json                     # exit 0, predicate true, newMapped 4
TMPDIR="$S/t2" node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --repo "$S/clone" \
  --rev 04f9623… --json                                                           # exit 0, predicate true, killed 20
TMPDIR="$S" node scripts/check-bidi-runtime.mjs --selftest                        # exit 0, cases=56 passed=56
sed 's/if (n === undefined && quote) n = order.find((k) => partial(k));/…/' counter.mjs \
  > counter-no-stage3.mjs && node counter-no-stage3.mjs … --rev 15dfacc… --json   # exit 1, unresolved 3, reanchored 1
grep -c 'round-34/w[12] =' w1-dispatch.json w2-dispatch.json                      # 1 / 0
git diff --numstat 15dfacc… 04f9623… -- <append-only paths>                       # deleted 0 everywhere; gate 62/7
node -e '…find-text occurrence check…'                                            # 20 checked, 0 violations
```

No tools installed; no network fetches (all evidence from committed artifacts and local runs); no lane tracked file, index, jj state or fleet-root file touched; no browser launched.

## Residual risk and verification gaps

- My M1 captured-by check is empirical (the misroot happened unflagged); the fleet's wave validator script is not identifiable in `.ufo/` (`lane-watch.sh`, `gates/root-ledgers.py` checked — neither names seat output dirs), so "the validator does not check context paths" is supported by behaviour, not by validator-source read.
- The worktree lesson is being amended by the L1 mid-wave; if the w2 integration lands the two pending hunks (M1 update, wave-1 attacks section), findings I1 and part of D2 are already addressed in the next commit — D1 and D3 are **not** touched by the worktree diff and persist.
- I did not re-derive the round-33 spot-check's own numbers (its receipts were frozen last round); my per-defect verdicts judge the round-34 intake against the routed text as committed.

## Deliverable paths

- Report: `.ufo/waves/round-34/w2/RevLesson34.md` (this file)
- `.ufo/waves/round-34/w2/RevLesson34/lesson-committed.md` — the committed lesson at `04f9623` (review target)
- `.ufo/waves/round-34/w2/RevLesson34/lesson-worktree.diff` — the L1's pending uncommitted lesson edits (2 hunks)
- `.ufo/waves/round-34/w2/RevLesson34/c1-at-integration.json` — my frozen C1 counter run at `04f9623` (predicate true, newMapped 4)
- `.ufo/waves/round-34/w2/RevLesson34/c2-at-integration.json` — my frozen C2 counter run at `04f9623` (predicate true, killed 20)
- `.ufo/waves/round-34/w2/RevLesson34/c1-no-stage3.json` — the M2 stage-limited experiment (3 unresolved, 1 re-anchored)
- `.ufo/waves/round-34/w2/RevLesson34/selftest.out` — the gate self-test run (cases=56 passed=56, exit 0)

Scratch `/fast/scratch/hyaku/tabi-r34/RevLesson34` deleted after the receipts above were copied.
