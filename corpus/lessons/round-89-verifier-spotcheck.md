---
author: hyaku closure (non-author integrator, @m_zfl)
round: 89
lane: tabi
measured_at: 2026-11-08T13:40:13Z
lane_head: 57783d472665c56b138572cef9cc5f0103c98ac8
base: 5a9011635c3bafb64a59a1411c4036bb40438724
---

# tabi round 89 — verifier spot-check (non-author)

Reviewer: hyaku closure (@m_zfl session, non-author integrator). The lane did not author this file.
Nothing below amends a lane-authored file; defects are routed for the lane's next round.

## 1. Step-1 conformance

- Report path `.ufo/reports/round-89/tabi.md` correct. `git log --format='%an %H %ai %ci' -- .ufo/reports/round-89/tabi.md` → `tabi-shokunin <tabi@shokunin.local> 7505982fcf136eb62a654b16bbe6be0562837829`, author `2026-11-08 09:46:35 -0300`, committer `2026-11-08 10:28:17 -0300`. `git show --stat` → one file, `+212` (pathspec-limited). The committer time lands 9 s after the lane's ledger commit `57783d47` (10:28:08) — the report lands last. The author date is stale (predates the cited lane tip `b7513f81`, 10:27:13); record defect, not a landing-order defect.
- `## SHONEN` at line 197 with one `[~]` line per box (4), each carrying an evidence pointer. Heading requirement satisfied; no `[x]` written by this reviewer.
- Cited commits: `0791b191`, `b7513f81` — `git merge-base --is-ancestor <hash> refs/heads/master` holds for both; base `5a901163` holds. Lane tip `57783d47` = `git ls-remote origin refs/heads/master`.
- Lane state: `jj-lane.sh state …` → `ahead=0 behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` empty. No uncommitted round work; no `jj` command run outside the helper.
- Prompt `.ufo/prompts/tabi-round-89.md` (committed `3a8000ca`, fleet) carries the contract: claims 1–3 / distinct axes / lowest-axis obligation (lines 14–19), L2 floor ≥8 in one batched call (line 82), report contract incl. `SHONEN` and commit-hash citation (106–124), commit-then-push / push scope / L0 side channel (131–138).
- Marker test: the report names real committed work (`0791b191`, `b7513f81`), evidence pointers, Sources & frontier, trend verdicts, `SHONEN` — a real report, not a marker. Status `ok`.

Status-neutral defects found:

1. The report cites `plans/round-89.md` **§Narrowings** and **§Frozen-amendment note**; neither section exists in the committed plan (116 lines: C1, C2, Declared limits, Frontier carried, Freeze, Re-freeze history). The narrowing text lives in `SCORECARD.md`'s block misattributing it to that plan section; the amendment disclosure lives in `claims.json` `frozenAmendments` and the lesson's "Report corrections carried into this round".
2. Sources & frontier: census `end` recorded as "223 rows" while the committed tree has **224** rows (`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → 224 at `57783d47`); the same section and `SCORECARD.md` say 223 → 224. Internal inconsistency.
3. Sources & frontier: "S223 and S219 were re-opened in place (access date 2026-11-08, 687,515 B, sha256 `b0202de1c0b4…`, located quotes in the lesson Gate)" describes the **round-88** re-opening (`corpus/lessons/round-88.md:27-34`; round-88 search-log entry). Round 89's lesson Gate records only S224 (`identified 1 / screened 1 / included 1`), and no round-89 `sources/whatwg-input.html` exists (`.ufo/waves/round-89/sources/` holds only `common-microsyntaxes.html`). Carried rows are fine; the attributed re-open is not.
4. Report "Lane tip `b7513f81`" was true when written (10:27:42) but the ledger commit `57783d47` landed 26 s later; the tip pointer is stale by one pushed, lane-authored commit (ancestry rule still holds).

## 2. Pre-file falsification ledger (addendum §8, Amendment 59)

Command: `python3 /home/vgpnk/Projects/shokunin/scripts/hyaku/prefile-falsification.py --lane tabi --round 89`
Observed: `PREFILE-FALSIFICATION: pass claims=2 rows=12 attack_seats=6 findings=0` (exit 0) — matches the report.
Coverage: both claims (C1, C2) × six attack seats (Connector, Critic, Mut1, Review1, Review2, Sentinel); 12 rows; the three falsifying rows each name a narrowing; one `falsifies-number` row points at `claims.json frozenAmendments` (2→3), which exists.

Adjudication of the falsifying rows:
- `C1/R89Mut1` (`falsifies-wording`) — **spurious as a claim-falsification**. C1 leg (b) is scoped to the declared 72-mutant list and `scored/killpower-a.json` is 72/72/0/0/0; the seat's 21/26 independent mutants surviving is a strength gap, disclosed in the report's seat ledger ("35 survived … 16 witnessed real acceptance gaps").
- `C1/R89Review2` (`falsifies-wording`) — real and reconciled on record: the settle re-read narrowing is stated in the report ("driver-observed, not counter-enforced"), `SCORECARD.md` narrowing (3) and the knowledge entry.
- `C2/R89Sentinel` (`falsifies-number`) — real and reconciled: 2→3 in `frozenAmendments` + the lesson.
- Both C1 narrowing pointers name `plans/round-89.md §Narrowings (3)/(4)`, a nonexistent section; the amendments exist but under `SCORECARD.md`. Pointer defect (routed).
- The `C2/R89Mut1` row is `neutral` although that seat's §5.5/§5.6 declare two C2 clauses FALSE as worded. Adjudicated in §4 below: both clauses are evidence-strength/attribution defects with the corrections on record in the plan D3 note, `SCORECARD.md` narrowing (4), the counter's own comment and the knowledge note; the C2 predicate holds. The row's classification and the unswept claim text are the defect, not the claim's measured content.

## 3. Per-claim re-checks (plain measurement on committed bytes at 57783d47; no sibling gate executed)

### C1 — coverage (9), capability generation r89 — verifies

Evidence re-derived by me:
- Receipt `corpus/evidence/round89/chromium-showpicker/receipt.json`: `legs` 41, `failures` `[]`, `nonce tabi-r89-l1-7bde5e6c2f2d`, `driverSha256 76b69b4f…bd2d0`, `fixture.sha256 69acad57…5ed`; the four `sp89-accept-domread-*` legs present with `domRead` arrays; targets `aw/am/a2/aws`.
- Freeze: `sha256sum .ufo/waves/round-89/freeze.txt` → `061dec8aad7d11b6…` (the reported D5 digest); 8/8 pinned files' `sha256` over `git show 57783d47:<path>` equal the `freeze.txt` values.
- Scored artifacts: `counter-a.json` `verdict clean / checkCount 107`; `battery-a.json` `cases 223, failed 0, coverage 107/107`; `killpower-a.json` `mutants 72, killed 72, survived 0, crashed 0, unapplied []`; `selftest.json` `clean true, cases 11, failed []`.
- Knowledge 101 → 102: `git ls-tree -r --name-only <rev> corpus/knowledge/ | wc -l` → 101 at `5a901163`, 102 at `57783d47`. SOURCES 223 → 224 (same grep as above at both revisions).
- S224: staged `.ufo/waves/round-89/sources/common-microsyntaxes.html` is 121,595 B, sha256 `2e9e2cbbe1ede8d6…`; live re-fetch `https://html.spec.whatwg.org/multipage/common-microsyntaxes.html` → HTTP 200, 121,595 B, same sha256 (byte-identical). `used-by` path exists; row `mined`, tier A.
- Narrowings on record and true of the bytes: acceptance ≠ filtering; tokenization is the fixture's `split(',')` + `trim()` + `toLowerCase()` (`scripts/chrome-cdp-showpicker-round89.mjs:142`), not Chromium's parser; the settle re-read is driver-observed (the counter's `plan-calls` filter admits only the target `Runtime.evaluate`; `accept-domread-law` binds the `domRead` target entry's two fields); per-leg mirrors unenforced; inherited r83 byte markers.

### C2 — calibration (9), the r88 routed defects 1–2 — verifies on its predicate; record defects below

- `scored/drift-before.json`: `claims 4, mismatches 3, failed [selftest-wording, gate-selftest, quality161-sweep]`. `scored/drift-a.json`: `claims 4, mismatches 0`.
- I did not execute `check-record-drift-r89.mjs`. I re-derived its four statement predicates over the committed bytes at `57783d47`:
  `scorecard-tallies bad=[] tens=2 sanctioned=2 stray=[]`; `selftest-wording staleHolds=False d6named=True correctionNamed=True`; `gate-selftest mentions=True wired=True counter=True battery=True killpower=True`; `quality161-sweep sweeps=True cites=True` → **0 mismatches at the committed revision**.
- `selftest.json` `gate-selftest` detail: the four isolated `--selftest` modes all `exit 0` and `ok true`.
- Revision defect: `drift-a.json` was written 10:13:00, before the last writes of `SCORECARD.md` (10:19:34) and `SKILL.md` (10:19:40), so the recorded after-run predates the cited revision `b7513f81`. The verdict holds at the committed bytes by the re-derivation above; the "measured at `b7513f81`" line is imprecise (routed).
- C2 `type`/leg (c) wording, adjudicated: (i) "a new `replay-limit-consistency` check binds `refused == (absMatched >= absNeed)`" — the numbered check was removed at D3; `grep -rn 'replay-limit-consistency' scripts/` finds only the comment at `check-showpicker-round89.mjs:943`, and `limit.replayConsistency` (line 956) is a computed field no gate reads. Reconciled by `plans/round-89.md` §Re-freeze history D3, `SCORECARD.md` narrowing (4) and the knowledge note; `claims.json` C2 `type` and plan §C2 item 3 were not swept. (ii) "the fixture-leak check confirms 0 `tapi-r89-driftfix-*` trees remain" — no script contains a leak check (`grep -rn driftfix scripts/` → only the two `rmSync` lines); the prefix is `tabi-`, so `tapi-` matches nothing; the 0-after observation is the plan's manual `ls` (§C2 item 2), repeated by R89Exec3 and R89Scribe. The removal is real in the shipped code; its enforcement is unbound (R89Mut1 `selftest-fixture-cleanup-dropped` survives). Record/sweep defects, routed.

### No-harm check

`git diff 5a901163 57783d47 -- SCORECARD.md` → additive r89 section only (+46 lines: C1/C2 rows, capability generation row, knowledge/registry deltas, narrowings, planned r90, scored line); no axis downgrade, no deleted row. `PROVINCE.md` untouched; no other owned axis moved.

## 4. Per-axis verdicts

| axis | verdict | reason |
|---|---|---|
| coverage | improved | 4 new domread legs, 41 legs / 107 checks re-derived from the committed receipt and scorer artifacts; knowledge 101→102; S224 new+mined; capability generation r89 row entered |
| calibration | improved | drift 3→0 re-derived at the committed bytes; the r88 routed defects (fixture causality, in-process tree removal, replay-limit move) are real and on record; two claim clauses remain over-stated in the frozen text (routed) |
| depth | unchanged | no new decision table beyond the held registry |
| operability | unchanged | instruments re-run green (107/223/72/11); no new runnable surface beyond the C1 generation |
| freshness | unchanged | S224 newly opened; S223/S219 were re-opened in round 88, not this round (misattributed) |
| adjacency | unchanged | R89Connector's 21-lane scan finds zero overlap on accept/showPicker/domRead/setFileInputFiles; absence confirmed, nothing absorbed |

## 5. Discernment spot-check (LEARNING.md)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| Knowledge admit `chromium-showpicker-runtime-round-89.md` | admit | receipt (41 legs, 4 domread legs with target `domRead` arrays) + S224 staged/live bytes | agree | Provenance trio present; S224 is `mined` with a resolving `used-by`; the four measured token lists match the receipt's target entries; the limits honestly state the fixture emulation and the unmeasured dialog |
| "The domread leg measures Chromium's own tokenization" | reject | `scripts/chrome-cdp-showpicker-round89.mjs:142` (`a.split(','), p.trim().toLowerCase()`); S224 §2.3.8 dfn | agree | The tokens are the page fixture's normalization; §2.3.8 defines the comma delimiting, not case, and the dialog is unmeasured |
| "The settle re-read is counter-verified" | reject | `scripts/check-showpicker-round89.mjs` `plan-calls` filter (does not admit the settle `window.__inputs()` evaluate) and `accept-domread-law` (binds the target entry's two fields) | agree | The settle evaluate is driver-observed only; the counter binds the data, not the read |
| SOURCES row S224 (new, tier A, `mined`) quote | new row | live `common-microsyntaxes.html` (HTTP 200, 121,595 B, sha256 `2e9e2cbbe1ed…`) at `<dfn id=set-of-comma-separated-tokens>` | agree on quote/location; disagree on length | The Gate quote is verbatim at the dfn, but 31 words (`wc -w`) exceeds the CORPUS rule-1 ≤25-word cap; the search-log r89 quote is a paraphrase inside quotes ("nor containing any commas" vs "nor containing any U+002C COMMA characters (,)") |

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0 (`tabi ok`, W04 duplicate-URL warnings only). Manual census at `57783d47`: 0 malformed rows, no duplicate ids, 0 tier/status/kind enum violations, no `mined` row with a missing `used-by` path; status histogram `mined=199 queued=15 rejected=10` (224 rows).

## 6. Trend verdicts

- **expansion: improved** — knowledge 101→102 on the named frontier (DOM-parsed normalization moves from named frontier to measured core), one new `mined` tier-A row (S224), one capability generation row in `SCORECARD.md` (`git ls-tree` count; `git diff base tip -- corpus/knowledge`).
- **quality: improved** — the frozen family re-derives 107/107 checks, battery 223/0 with full coverage, kill power 72/72/0/0/0, selftest 11/11; the r88 fixture-leak and overdetermined-witness defects are repaired; no admitted entry failed a re-check (the r89 note's `recheck:` is the frozen counter command over the committed receipt).
- **discernment: improved** — the outside spot-check agrees with the Gate's admit and both rejects; the wave's five sentence corrections (battery greenness, the stale 102 literal, the C2 before-numeral, the settle re-read's reach, the tokenization's provenance) are disclosed with their artifacts, and `QUALITY.md` 162 + the §161 r89 cite record the r89 criterion. Defect: the pre-file ledger's C2/Mut1 row is neutral where the seat declared two clauses FALSE (routed).

## 7. Routed defects for tabi r90 (durable queue)

1. **Claim sweep.** `claims.json` C2 `type` item (3) ("a new `replay-limit-consistency` check binds") and leg (c)'s `tapi-r89-driftfix-*` glob, plus `plans/round-89.md` §C2 item 3, are false of the final instruments. Sweep them to the D3 final form (`limit.replayConsistency` computed in the `limit` block; the leak verification is the manual `ls`, not a scripted check) or add a `frozenAmendments` entry naming them. Reclassify the ledger's `C2/R89Mut1` row as `falsifies-wording` with the D3/`ls` narrowing.
2. **Narrowing pointers.** Re-point the C1 `falsifies-wording` rows at the real amendment location (`SCORECARD.md` narrowing block; plan D3), not `plans/round-89.md §Narrowings`; replace the report's `§Narrowings` / `§Frozen-amendment note` citations with real paths.
3. **Census + source attribution.** Correct the census end row count (223 → 224); correct the "S223/S219 re-opened in place" line to the r88 re-opening (or perform and record a genuine r89 re-open in the lesson Gate and search log); reduce the S224 Gate quote to ≤25 words and make the search-log quote verbatim.
4. **Leak enforcement.** Either bind the drift fixture-tree cleanup (a cleanup-dropped witness) or narrow the claim that the removal is enforced; the `selftest-fixture-cleanup-dropped` mutant currently survives.
5. **Revision naming.** Name the drift after-run's actual revision (the 10:13 worktree) or re-run it at the committed tree; the four predicates hold at `57783d47` by this re-derivation.
6. **Report author date.** The report commit's author date (09:46:35) predates the lane work it cites; use a clean author date next round (committer time is correct).

## 8. Verdict

`status=ok admitted=true`: C1 and C2 verify on their declared before→after at the committed revisions; no axis is harmed. The defects above are record/conformance items (stale claim text and glob, dangling section pointers, census numeral, re-open attribution, quote length, ledger row classification, after-run revision) and are routed to r90; none falsifies a measured state. SHONEN boxes: all four look checkable by a non-author from committed artifacts (SKILL registry + instruments; receipt + seat reports; three executor seats ran the frozen commands from their prompt; connector scan) — promotion remains operator-owned.
