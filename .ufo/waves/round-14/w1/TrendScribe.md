# TrendScribe — tabi round 14 (w1) — trend-verdict evidence checklist

Seat: `TabiR14.TrendScribe` (scribe). Lane: tabi-shokunin. Baseline: `bebe2efc4565bb068efd905e9ef78011bb6b4efd`.
Status: advisory, author-side draft. Not non-author verification (`LEARNING.md:42-46`; round-14 lesson `corpus/lessons/round-14.md:15`). This report cannot satisfy the discernment gate.
Executed: nothing. Only read/grep/`git show`/`git status` were used; no gate, self-test, census, build, or browser was run. Tools installed or updated: none.
Snapshot caveat: the tree was mid-edit when read (`git status`: M `LOG.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`, `scripts/check-round-contract.mjs`, `scripts/check-user-round-contract.mjs`; ?? `corpus/lessons/round-14.md`; `SCORECARD.md` not yet modified). Line numbers below are as observed at read time. L1 must re-resolve them after integration.

## Sources read

- Trend rules: `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/LEARNING.md:31-35` (trend table), `:37-38` (trade rule), `:40-50` (discernment from outside), `:84-90` (axis mapping: expansion ↔ coverage/adjacency, quality ↔ depth/freshness/operability, discernment ↔ calibration).
- Bar: `corpus/QUALITY.md` (19 criteria; 18–19 are in flight). Relevant: 4 (errata append-only, `:7`), 6 (gate pins and self-test, `:10-12`), 7 (`:13-15`), 10 (`:22-25`), 13 (protected paths, `:30`), 14 (evidence class, `:31-35`), 18 (`:52-57`), 19 (`:58-64`).
- Prior verifier: `corpus/lessons/round-13-verifier-spotcheck.md` — decision `:5-16`; spot-check table `:106-131`; no-harm and trends `:133-148` (verdicts `:146-148`); corpus verdict "not conformant" `:152`; routed defects 1–6 `:158-163`.
- Round-13 self-record: `corpus/lessons/round-13.md:17` ("spot-check: pending"), `:43-53` (Mistakes), `:73` ("Fresh outside … remains pending"); `SCORECARD.md:525-580` (scalars `:534-541`; discernment "improved" with "pending" at `:577-580`); `LOG.md:593-698`.
- Round-14 in flight: `corpus/lessons/round-14.md:1-50` (Gate `:5-15`, S029 `:19`, no-expansion `:31`, Mistakes `:35-39`, routed disposition `:43-48`); round-14 LOG diff; SKILL.md round-14 section and metadata table; `corpus/SOURCES.md` +S029 row.
- Evidence: `corpus/evidence/round-13/aria/receipt.json:62-63` (node `recorded` 24.21.0, `minimumMajor` 20), `:2521` (aggregate `server.listeningAfter` true), `:2529` (perWorker `listeningAfter` false); `corpus/evidence/round-13/aria/runtime-pin.json:15-16`; `corpus/knowledge/aria-loopback-round-13.md:1-3` (source/verified-at/recheck) and `:41` (isolation and cleanup).
- Gate boundary: `scripts/check-round-contract.mjs:83-90` (`protectedPath`: `^corpus/lessons/round-\d+\.md$` plus fleet paths); `scripts/check-user-round-contract.mjs:100-108` (`LEGACY_LESSON`).

## Findings

**F1. No round-14 trend verdict exists yet.** The round-14 LOG entry (`LOG.md` diff, round-14 block) and `round-14.md` contain no expansion/quality/discernment line and no outside-check section. L1 must write all three, and each must cite the evidence rows below.

**F2. The round-13 discernment record is internally inconsistent.** `SCORECARD.md:577-580` says "discernment improved … Current-round non-author admit/reject spot-check remains pending." `round-13.md:17` and `:73` say the same. The outside check later landed as commit `bebe2ef`, which adds only `corpus/lessons/round-13-verifier-spotcheck.md`. It was not linked from `round-13.md` (protected by `check-round-contract.mjs:83-85`) or from SCORECARD. Round 14 must link it by commit and path through an append-only errata block (QUALITY4), not by editing round-13 files.

**F3. A round-13 disagreement is only partly learned.** Routed item 1 (`round-13-verifier-spotcheck.md:158`, inverted `listeningAfter`) is absent from the `round-13.md` Mistakes table (`:45-51`). QUALITY17 (`QUALITY.md:48-53`) covers case causes and worker aggregation, not summary-versus-worker algebra. LEARNING requires a disagreement to become a lesson and a grounded criterion (`LEARNING.md:34-35`). Round 14 does this in `round-14.md:37` and QUALITY18. The discernment verdict can cite that only after an outside reviewer agrees the criterion is grounded.

**F4. No admitted entry needs an errata block for the metadata defect.** `corpus/knowledge/aria-loopback-round-13.md` contains no `listeningAfter` string and no Node version string. Its isolation paragraph (`:41`) states only the perWorker connection-refused proof. HEAD `SKILL.md` has no Node or `listeningAfter` claim. The defect lives in the receipt and in README/pin wording. Quality therefore has no stale entry to supersede, and "improved" would overclaim.

**F5. S029 is registry growth, not expansion.** `corpus/SOURCES.md` gains S029 (own-work, tier A). Lesson `:21` records status nonexistent→mined and rows A22→A23 (28→29 total). Lesson `:31` says source-row growth is not knowledge expansion. Expansion is governed by `LEARNING.md:33`: admitted `knowledge/` entries on uncovered ground. The sidecar re-reads own-work bytes, so it is not a new kind of source either.

**F6. Lane-dispatched seats cannot be the outside reviewer.** Every `TabiR14.*` member in `.ufo/waves/round-14/w1/spec.json` (including ReviewC2Admission, ReviewSourceUse, ReviewProtectedPaths, UserFixtures, RoundFixtures, OldWitnessAudit, NoHarmCritic, DebtScribe, and this seat) is author-side. `LEARNING.md:45-46`: "A subagent the lane dispatched is still the lane." Round-14 `:15` already says so. The round-13 precedent is an orchestrator-dispatched closure (`round-13-verifier-spotcheck.md:5-7`, commit `bebe2ef`, author `protocol-shokunin`). Roster ids with other prefixes (`Main`, `CloseKamaR14*`, `CloseTameshiR14*`, `MoriR14*`) must not be presumed outside. Confirm the dispatcher from a dispatch record, not from the name.

**F7. The outside check is itself bounded.** Per `round-13-verifier-spotcheck.md`: runtime and gates were evidence-verified, not rerun (`:38-45`). The only executed validation was the census (`:120-130`). Corpus verdict is "not conformant" (`:152`). Closure-checker certification is absent (routed item 5, `:162`). A round-14 discernment claim must carry these limits. It must not cite round 13 as "conformant."

**F8. Scalars and claim counts stay separate.** Baseline ordinal scalars from `SCORECARD.md:534-541`: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8. `before.json` records `scalarsUnchanged: true`. C2 "0→1" is a claim count. It maps to calibration, which moves discernment only through the outside check (`LEARNING.md:86-88`). It must not appear in the expansion row, and it must not be written as a scalar.

**F9. Protected-path gap (route, do not edit).** Neither `protectedPath` regex protects verifier spot-check files (`check-round-contract.mjs:83-90`, `check-user-round-contract.mjs:100-108`). QUALITY13 (`QUALITY.md:30`) says filed history is never appended, but the gate does not enforce it for `round-N-verifier-spotcheck.md`. ReviewProtectedPaths should decide whether to add it.

**F10. The round-14 SCORECARD trend table is not yet appended.** SCORECARD is unmodified. QUALITY4 requires append-only errata. The round-13 "pending" text (`SCORECARD.md:579`) therefore stands until an errata block is appended.

## Evidence checklist per trend

### A. Expansion — recommended verdict now: `unchanged`

- [ ] `ls corpus/knowledge/*.md | wc -l` is 32 before and after. `git diff bebe2ef -- corpus/knowledge` is empty.
- [ ] Note map is 32/32 with no missing rows (`corpus/README.md`, snapshot-annotated only).
- [ ] No new knowledge note, no `## Frontier` change (`round-14.md:31`).
- [ ] Source rows 28→29 (S029), tiers A22→A23, B4, C2. Recorded as registry growth, not expansion (`round-14.md:21,31`).
- [ ] No SCORECARD capability row added. The lesson records no coverage or capability claim (`round-14.md:3`).
- [ ] Reject recorded: "the derived sidecar is not new browser execution, coverage, or capability" (`round-14.md:11`).
- Disqualifiers: any knowledge entry, capability row, or frontier change that cites the sidecar as new ground; any S029 row counted as expansion.

### B. Quality — recommended verdict now: `unchanged`

`improved` requires an admitted entry that was found false or stale and is now superseded or marked (`LEARNING.md:33-34`).

- [ ] Re-grep for stale claims in admitted entries and SKILL: `listeningAfter`, `24.21`, `26.12`, `minimumMajor` in `corpus/knowledge/`, `SKILL.md`, `corpus/README.md`. Entries must either be clean (current state) or carry a dated errata block citing the sidecar digest. README lines 255–257 and SKILL round-14 table are round-14 additions and must be qualified.
- [ ] Original bytes unchanged: `git show bebe2ef:corpus/evidence/round-13/aria/receipt.json | sha256sum` and the same for `runtime-pin.json` must equal `git show HEAD:…` after integration.
- [ ] Sidecar is digest-bound: records SHA-256 of the input receipt and pin, the derived `listeningAfter` derived from perWorker proofs, and the qualifier "derived; no new execution" verbatim.
- [ ] Node fields kept separate: observed 26.12.0, `minimumMajor` 20, descriptive recorded 24.21.0. No exact-equality claim (`QUALITY.md:52-57`, criterion 18).
- [ ] Checker is failure-capable. `--self-test` covers, with expected exit and finding ID per case: the original contradictory receipt is refused; a sidecar with altered digest is refused; empty perWorker is refused; a nonboolean is refused; an exact-Node claim is refused (QUALITY6, `:10-12`).
- [ ] Any admitted-entry errata is append-only (QUALITY4).
- Disqualifiers: a sidecar presented as re-observation; a checker run green without a red original; a stale entry left unmarked.
- Option: if L1 wants to claim quality better without an entry-level correction, the honest verdict is `unprovable-but-better`. That needs a named non-author reviewer with reasons on record (`LEARNING.md:48-50`).

### C. Discernment — recommended verdict now: `unchanged`

`improved` requires an outside check that agrees with the gate on at least one admit and one reject, recorded with a reason (`LEARNING.md:40-46`).

- [ ] Reviewer identity is non-TabiR14, the dispatcher is recorded with time and commit, and the reviewer appears in no `.ufo/waves/round-14/w1` registry. Self-dispatched or lane-dispatched seats are disqualified (`LEARNING.md:45-46`).
- [ ] Sample includes ≥1 admit and ≥1 reject from round-14 gate decisions. Candidate admit: the digest-bound sidecar after its checker passes (`round-14.md:10`). Candidate rejects: derived sidecar treated as new browser execution (`:11`); descriptive 24.21.0 treated as exact (`:12`).
- [ ] Agree/disagree plus reason recorded in a new round-14 lesson section, or in a new file linked from it. Not appended to `round-13.md` (protected, F9).
- [ ] Reviewer's re-derivation is labeled separately: executed vs evidence-verified (as `round-13-verifier-spotcheck.md:38-45` did).
- [ ] The round-13 SCORECARD "pending" text (`:579`) is addressed by an append-only errata pointing to `bebe2ef`. Round-13 scores are not rewritten.
- [ ] Routed items 1–6 from `round-13-verifier-spotcheck.md:158-163` are each mapped to a round-14 change or an explicit retained debt. Item 5 (closure-checker not run) is stated.
- [ ] If a disagreement exists, it becomes a lesson row plus a grounded QUALITY criterion with a red control. QUALITY18 and 19 cite round-14 lesson rows. Their red controls must be listed.
- Disqualifiers: the lane's own review seats, this report, or the round-14 Gate section as the check.

## Recommended round-14 trend table (conditional on evidence above)

| Trend | Verdict now | Upgrade condition |
|---|---|---|
| expansion | unchanged | none in this round; S029 is registry growth |
| quality | unchanged | an admitted entry or SKILL claim that was stale is marked with a dated errata citing the sidecar digest |
| discernment | unchanged | non-author dispatched outside check agrees on ≥1 admit and ≥1 reject, recorded with reasons; lesson rows and QUALITY criteria grounded |

## Routed items mapped to trend (no new scope)

- Item 1 (`listeningAfter`): `round-14.md:37`, QUALITY18, checker. Trend: discernment, pending outside check.
- Item 2 (Node wording): `round-14.md:38,44`, SKILL round-14 table. Trend: quality only with entry errata (none found; F4).
- Item 3 (USER witness precision): `round-14.md:45`. No trend credit.
- Item 4 (inherited shell-count debt): C1 scope only. Other debt uncredited. No trend credit.
- Item 5 (closure-checker not run): operator/protocol. Discernment must disclose it.
- Item 6 (quote-count erratum): protocol custody. No trend credit.

## Commands L1 should run after integration (not executed by this seat)

```sh
R=/home/vgpnk/Projects/shokunin/tabi-shokunin
git -C $R rev-parse HEAD && git -C $R status --porcelain
git -C $R show bebe2ef:corpus/evidence/round-13/aria/receipt.json | sha256sum
git -C $R show HEAD:corpus/evidence/round-13/aria/receipt.json | sha256sum
git -C $R show bebe2ef:corpus/evidence/round-13/aria/runtime-pin.json | sha256sum
git -C $R show HEAD:corpus/evidence/round-13/aria/runtime-pin.json | sha256sum
ls $R/corpus/knowledge/*.md | wc -l
git -C $R diff --name-only bebe2ef -- corpus/knowledge corpus/lessons/round-13.md corpus/lessons/round-13-verifier-spotcheck.md corpus/evidence/round-13
git -C $R diff bebe2ef -- SCORECARD.md | grep -c '^-[^-]'
grep -rn 'listeningAfter\|24\.21\|minimumMajor' $R/corpus/knowledge $R/SKILL.md $R/corpus/README.md
node $R/scripts/check-aria-metadata.mjs --self-test; echo EXIT=$?
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi; echo EXIT=$?
git -C $R log -1 --format='%H %an <%ae> %aI %s' -- corpus/lessons/round-13-verifier-spotcheck.md
```

Expected: knowledge count 32; no diff in the protected round-13 paths; zero SCORECARD deletion lines; checker self-test exit 0 with each red case refused by its declared finding; census `tabi ok` exit 0. The `--derive` and verify invocations must follow the usage text implemented by ReceiptRepair; this seat has not inspected or executed them.

## Limits of this report

- Advisory, author-side. Not a discernment verdict and not a closure.
- Built from a mid-edit snapshot. Re-resolve every pointer after integration.
- No gate, checker, census, or browser was executed. Counts quoted from prior records are as recorded, not re-measured.
