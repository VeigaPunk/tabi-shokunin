# TrendAudit — tabi round-15 w1 (author-side, read-only)

Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Seat: TabiR15.TrendAudit (leaf, scribe).
Status: read-only audit. No source, SCORECARD, LOG, QUALITY, SKILL, or lesson edits. No gate, selftest, counter, `measure.mjs`, test, suite, or browser was executed. Git was used read-only (`status`, `log`, `ls-files`). Tools installed or updated: none.

## Interpretation of the slice

The spec Target is a word list: "expansion unchanged quality improved discernment prior disagreement learned but current outside pending" (spec.json:320). It matches the lane's trend vocabulary (LEARNING.md:28-48). This audit therefore covers the three trend verdicts, whether prior outside disagreement was learned, and whether the current round's outside verification is correctly reported as pending. The round-15 wave has no LOG, SCORECARD, or lesson entry yet, so round-15 verdicts are pending by construction.

## Governing rules (read)

- LEARNING.md:31-35 — `discernment: improved` when the spot-check agrees on admits and rejects, or when a disagreement becomes a lesson that adds a grounded QUALITY criterion. `harmed` when a disagreement is unlearned or a criterion is added with no lesson behind it.
- LEARNING.md:40-48 — discernment is checked from outside: a non-author spot-checks at least one admit and one reject each round, recorded as `agree`/`disagree` in the round lesson. A dispatched subagent is still the lane.
- AXES.md:46-50 — an exploratory claim verifies only with a named non-author reviewer on record.

## Observed state

- HEAD `7054a5e` (2026-10-20 04:37, round-14 verifier spot-check). Last round-14 lane commit `4a300f6` (04:17).
- Uncommitted: `corpus/QUALITY.md`, `SKILL.md` (`git status --porcelain`). QUALITY criteria 20-21 (QUALITY.md:65-77) are in this uncommitted set.
- No `corpus/lessons/round-15.md`. No round-15 LOG or SCORECARD block.
- Round-14 scalars: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8. Round-14 trends (author self-verdict, SCORECARD.md:646-649): expansion unchanged, quality improved, discernment improved.

## Trend record audit by round

| Round | Expansion | Quality | Discernment (author self-verdict) | Non-author closure on record | SCORECARD/LOG state |
|---|---|---|---|---|---|
| 1 | improved | improved | improved (6/6 agree) | `corpus/lessons/round-1-verifier-spotcheck.md:17` | consistent |
| 12 | improved | improved | unchanged, "pending" (SCORECARD.md:505-506) | `corpus/lessons/round-12-verifier-spotcheck.md:138-142`: discernment improved, agree on admit and reject | **stale**: still "pending" after closure |
| 13 | improved | improved | improved via QUALITY16; "remains pending" (SCORECARD.md:577-580, LOG.md:618-623) | `corpus/lessons/round-13-verifier-spotcheck.md:133-148` (commit `bebe2ef`, 03:03): discernment improved, agree; corpus review "not conformant" for the cleanup-summary field | **stale**: still "pending"; no post-closure qualification |
| 14 | unchanged | improved | improved via QUALITY18/19; "remains pending" (SCORECARD.md:646-649, LOG.md:815-816) | `corpus/lessons/round-14-verifier-spotcheck.md:161-178` (commit `7054a5e`, 04:37): discernment improved, agree on C1, C2, and rejects | **stale**: still "pending" |
| 15 | — | — | — | none | pending by construction; no lesson, LOG, or SCORECARD |

The round-12 self-verdict "unchanged pending" was honest at report time (round-12 closure line 142 says so). Rounds 13 and 14 credited discernment as "improved" through learning, which LEARNING.md:35 allows. Their SCORECARD blocks kept the "pending" wording after the closures landed, so the record now contradicts itself.

## Findings (ranked)

### F1 — Trend records still say "pending" after the outside closures landed (stale record, high)
- SCORECARD.md:505-506 (round-12), :579-580 (round-13), :646-649 (round-14), and LOG.md:815-816 (round-14) state that outside verification is pending.
- The closures exist and are committed: `round-12-verifier-spotcheck.md:142`, `round-13-verifier-spotcheck.md:147-148`, `round-14-verifier-spotcheck.md:176-178`. Round-14's closure commit is `7054a5e`, round-13's is `bebe2ef`.
- LEARNING.md:42-48 requires the non-author record in the round lesson. The record exists, but the trend tables and LOG were never amended.
- Action for L1: append-only, dated qualification to SCORECARD and LOG that cites the closure file and commit for each round. Do not rewrite the earlier "pending" text. Keep scalar deltas at 0 for these rounds.
- Proposed test (author checker, not executed): for each `corpus/lessons/round-N-verifier-spotcheck.md` present, assert that the round-N trend block in SCORECARD.md does not contain the word "pending" without a following "closed by" pointer.

### F2 — Discernment wording mixes learning with verification (medium, process)
- Rounds 13 and 14 used "discernment improved" in the same paragraph as "outside verification pending" (SCORECARD.md:577-580, :646-649). LEARNING.md:35 counts learning as improvement, while LEARNING.md:42-45 says self-assessed taste is not discernment. Readers cannot tell which claim is verified.
- Action for L1: split the discernment cell into two fields, `learned` (prior disagreement converted to a grounded criterion) and `verified` (non-author agree/disagree for the current round). Use `verified: pending` until a closure exists.

### F3 — QUALITY criteria 20-21 cite a lesson that does not exist yet (high, precondition)
- QUALITY.md:65-71 (criterion 20) cites `corpus/lessons/round-15.md#mistakes`. QUALITY.md:72-77 (criterion 21) cites the same file.
- `corpus/lessons/` holds `round-14.md` as its newest round lesson. `round-15.md` is absent.
- Both criteria are uncommitted (`git status` shows `M corpus/QUALITY.md`). LEARNING.md:35 treats a criterion added with no lesson behind it as `harmed`.
- Action for L1: land QUALITY 20-21 only in the same commit as `corpus/lessons/round-15.md` with its `## Mistakes` anchor, or remove the citation until it exists.
- Proposed test: a link check that every `lesson: corpus/lessons/<file>#<anchor>` in QUALITY.md resolves to an existing file with that heading.

### F4 — Round-14 routed items not all dispositioned (medium, carry-forward)
The round-14 closure routed seven items (`round-14-verifier-spotcheck.md:180-191`). Round-15 covers them as follows:
- Item 2 (mirror validation) and item 3 (tamper classification) are covered by C2 and QUALITY20.
- Item 4 (counter diagnostic precision) is covered by C1 and QUALITY21.
- Item 1 (metadata enforcement wording) is partly covered. SKILL.md:1744 says to report the observed version, enforced minimum, and descriptive record separately. It does not state that the historical producer never enforces `pin.node`, which is what the closure asked for (`round-14-verifier-spotcheck.md:184`). No QUALITY criterion exists for it.
- Item 5 (S029 traceability in machine-evidence metadata) has no round-15 claim and no QUALITY criterion.
- Items 6 and 7 are inherited debt and operator-owned.
- Action for L1: the round-15 lesson's routed-disposition section should name items 1, 5, 6, and 7 explicitly with owners. Otherwise they become unlearned disagreements under LEARNING.md:35.

### F5 — Round-13 record was not qualified after its closure (low to medium, quality)
- The round-13 closure (`round-13-verifier-spotcheck.md:100`, :157-158) found the committed cleanup-summary field inverted: aggregate `cleanup.server.listeningAfter=true` against a sole worker `false`. It also called the corpus review "not conformant" for that field and for stale recorded Node metadata.
- The round-13 SCORECARD and LOG still record "quality improved" without that qualification. The first in-lane mention is LOG.md:702-703, in round 14.
- Checked: `corpus/knowledge/aria-loopback-round-13.md:39-41` defers cleanup to the receipt and does not assert the aggregate field. A grep of `corpus/knowledge` finds no `listeningAfter`. So no admitted entry is shown false, and the quality verdict is not falsified. The record still needs an append-only qualification.

## Code-facing defects (routed by exact id)

These are for the round-15 seats and were checked by read-only grep. No test was run. Line numbers are the current script contents at HEAD plus the uncommitted tree (none of the scripts are modified in `git status`).

### For TabiR15.MetadataEnforce (C2 — ARIA metadata)
1. Mirror validation gap. `scripts/check-aria-metadata.mjs:1073-1074` validates only `qualification.everyProofNotListeningAfter`. `buildSidecar` emits `everyProofListensBefore`, `everyProofClosed`, and `everyProofRefusedAfterClose` at `:1276-1278`, and cleanup mirrors at `:1266-1270`. None of those are validated. A grep for `everyProof` returns only these lines.
   - Proposed test: mutate the sidecar so `qualification.everyProofClosed` is `false`, or `cleanup.allRefusedAfterClose` is wrong. Expect a failed finding with a stable code, while `corrected.json` stays byte-identical.
2. Tamper classification gap. The ARIA checker has no `snapshot_tampered` or `could_not_evaluate` token (zero matches). The USER checker does classify `could_not_evaluate` with exit 2 at `scripts/check-user-round-contract.mjs:894`. Anchor or pin mismatches in the ARIA checker become exit 1 failed findings (`check-aria-metadata.mjs:340-354` pattern).
   - Proposed test: alter a pinned input hash in a temp copy. Expect exit 2 with `snapshot_tampered`, not exit 1 `R14-ARIA-CLEANUP-LISTENING-AFTER-01`.
3. Helper aggregates. The proposed `evaluateCleanup` aggregates (the MirrorQualification plan) map onto `check-aria-metadata.mjs:313-321` (`derivedListeningAfter`, `derivedClosed`) and `:413-421` (`derived` export). Those anchors are correct as cited in the round-15 seat output.

### For TabiR15.CounterDiagnostics (C1 — USER counter refusals)
1. Overloaded finding code. `scripts/check-user-round-contract.mjs` reuses `score_mismatch` for distinct causes: `:391` (unsupported counting command), `:392` (measured-against revision mismatch), `:398` (unsupported command in `runCount`), `:408` (counting failed), and `:596-597` (value mismatch). A malicious-control result therefore cannot say which refusal fired.
2. Controls assert only the code. The malicious fixtures at `:867`, `:870`, `:873`, `:888`, and `:891` expect `finding: 'score_mismatch'` with no reason. The fixtures at `:868-873` do not record the intended cause.
   - Proposed test: give each malicious fixture an `expectedReason` (for example `count_unsupported` for shell substitution, `count_option_refused` for `--git-dir`, `count_value_mismatch` for the wrong-after case). Assert the reason, not just exit and code. Keep `score_mismatch` only for value mismatch.
3. Non-applicability printed as zero. `:991` prints `no_marker=0` for every non-marker test (`test.noMarker ? (leaked?0:1) : 0`). `:1004` and `:1016` do the same. A zero therefore means both "not applicable" and "absent".
   - Proposed: emit `applicable=0|1` and `no_marker=na` when not applicable. Add a control that fails if an applicable marker is missing.
4. Migration. Changing finding codes changes the historical witness comparison at `:832` and `:1014`, which expects `score_mismatch`. Update those in the same commit, and do not change historical receipts.

Both code-facing routes must keep the historical ROUND and USER gate bytes and pins fixed (SKILL.md pins; `HARD_BASELINE`/`PSTACK_PIN` are not moved).

## Commands L1 should run after integration (not run by this seat)

```sh
# Lane gates, after code and lesson land together:
node scripts/check-user-round-contract.mjs --self-test
node scripts/check-aria-metadata.mjs --self-test
node scripts/check-sources.mjs --self-test
node scripts/check-freshness.mjs --worktree
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
# Link check for QUALITY lesson anchors (F3):
grep -n 'corpus/lessons/round-1[45]' corpus/QUALITY.md
# Commit hygiene before landing:
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain
```

Round-14 closure commands for reference (`round-14-verifier-spotcheck.md:22-29`, :150-153) show how the outside check reran the census and independently recounted committed bytes.

## Round-15 trend verdict proposal (for L1, not decided here)

- expansion: unchanged (no knowledge note or frontier ground is planned).
- quality: improved only if C2 and C1 land with the fixtures above and the lesson's QUALITY20-21 anchors resolve.
- discernment: `learned` (QUALITY20-21 from round-14 routed items 2-4) and `verified: pending` until a non-author closure lands.

## Out of scope and not verified

- Closure executions were not re-run. Closure verdicts are recorded from their committed text.
- Round-15 seat outputs (MirrorQualification, MetadataEnforce, CounterDiagnostics) were read only where cited. Their conclusions were not adopted.
- SHONEN, PROVINCE, and MINT were read for context only. They are unchanged in this audit.
- No tool was installed or updated. Pacman was not used.
