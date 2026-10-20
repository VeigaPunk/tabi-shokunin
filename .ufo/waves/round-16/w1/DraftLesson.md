# DraftLesson — scoped findings (wave w1)

Seat: `TabiR16.DraftLesson-5` (scribe, leaf, no dispatch). Owned write: `.ufo/waves/round-16/drafts/DraftLesson.md`. Nothing else written. No commits. No tool installed or updated. No browser launched.

Access date for all observations: 2026-10-20. Checks were read-only (`git show`, `git log`, `git diff --name-only`, `git merge-base --is-ancestor`, `sha256sum`, `grep`, `read`, `/usr/bin/chromium --version`).

## Behavior

Drafted four `## Mistakes` rows in `.ufo/waves/round-16/drafts/DraftLesson.md`, in the round-15 table format (Class | Evidence pointer | Captured-by | Fix / falsification evidence). Each fix names how it is shown able to fail. All fixes are **planned and unrun**.

## Verified observations (commands and outputs)

| Check | Command | Observed |
|---|---|---|
| Round-15 C1 counter blob at 27dfd98 | `git show 27dfd98:.ufo/waves/round-15/measure.mjs \| sha256sum` | `3ee59de0…e384` |
| Same blob at measured revision b7cf044 | `git show b7cf044:…/measure.mjs \| sha256sum` | `3ee59de0…e384` (same) |
| Counter blob at delivered HEAD 36240c7 | `git show 36240c7:…/measure.mjs \| sha256sum` | `dd9c8675…1251` |
| Counter blob at 9fd8bca | `git show 9fd8bca:…/measure.mjs \| sha256sum` | `dd9c8675…1251` |
| Ancestry | `git merge-base --is-ancestor 9fd8bca b7cf044` | not ancestor |
| Ancestry | `git merge-base --is-ancestor 9fd8bca 36240c7` | ancestor |
| Counter changes in measured→delivered window | `git diff --name-only b7cf044 36240c7` | includes `.ufo/waves/round-15/measure.mjs` |
| Counter commit history | `git log --oneline -- .ufo/waves/round-15/measure.mjs` | `9fd8bca`, `27dfd98`, `72dcf03` |
| Measurement record | `corpus/evidence/round-15/measurements.json` | `measuredRevision` b7cf044 (line 5); C1 `counterCodeRevision` 27dfd98 (line 65), no digest; C2 `counterCodeRevision` 9fd8bca and `counterSha256` dd9c8675 (lines 131-132) |
| Erratum pointers | `grep -rn 'round-15-verifier-spotcheck' corpus SKILL.md LOG.md SCORECARD.md` | 0 hits |
| Unpointed restatement | `SKILL.md:1770-1775` | restates launcher/spec Node distinction, names "the round14 outside review", no link |
| Host Chromium | `/usr/bin/chromium --version` | `Chromium 154.0.8037.97 Arch Linux` |
| Stale frontier | `corpus/README.md:35`, `:181`, `:194`; `corpus/knowledge/browser-surface-census.md:153`, `:188` | "chromium 152 … unprobed" / "still unprobed" |

## Findings

1. **PLAN error on legacy expectation.** `.ufo/waves/round-16/PLAN.md` says `--legacy` on the r15 file reports `counter_digest_unrecorded` for both claims. C2 has `counterSha256` (dd9c8675) at `measurements.json:132`, bound to `counterCodeRevision` 9fd8bca, not to `measuredRevision` b7cf044 (blob 3ee59de0). The adapter should report C2 as `counter_digest_mismatch`. This is for BindCore and BindLegacyEvidence to resolve, not this seat.
2. **Routed defect 2 is stronger than round-15 :121 says.** The `git diff --name-only` result shows the counter file itself changed between b7cf044 and 36240c7. The statement "no counted input or gate drift" is therefore incomplete. The gate must include `counter.path` in the counted-input diff. Note that `measured_revision_not_ancestor` will not fire on real r15 data. This defect is visible on legacy data only through the same counter-digest signal as defect 1.
3. **Coverage gap for BindSelftest.** The PLAN requires one positive case per reason, but not a counter-only change case. Recommend adding it (row 2 of the draft).
4. **Erratum not adopted (routed 3).** No pointer to `round-15-verifier-spotcheck.md:90-101` exists in SKILL, LOG, SCORECARD, or corpus. `SKILL.md:1770-1775` already restates the corrected wording.
5. **Stale frontier (routed 4 is absent from round-15; captured by round-16 pre-probe).** The host runs 154.0.8037.97. README:35, :181, :194 and census :153, :188 still say 152 / unprobed. Playwright's pinned revision (chromium-1248, CfT 156) differs from `/usr/bin/chromium`; the receipt must name the executable actually used.

## Out of scope / not done

- No selftest, gate, legacy adapter, or grep predicate was executed. All "shown able to fail" entries are planned.
- `corpus/lessons/round-16.md` is L1-owned; not written.
- Immutable round-13/14/15 bytes not edited.
- No subagent dispatch (leaf lane).

## Tools

None installed or updated by this seat.

## Checks for L1 to run after integration

- `git show 27dfd98:.ufo/waves/round-15/measure.mjs | sha256sum` (expect `3ee59de0…`).
- `git show 36240c7:.ufo/waves/round-15/measure.mjs | sha256sum` (expect `dd9c8675…`).
- `git diff --name-only b7cf044 36240c7` (expect the counter path listed).
- `node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json` once BindCore lands (expect exit 1; C1 `counter_digest_unrecorded`; C2 `counter_digest_mismatch` per finding 1).
- `grep -n 'chromium 152' corpus/README.md` (expect only superseded-marked lines after the append).
- `grep -rn 'round-15-verifier-spotcheck' SKILL.md corpus/README.md corpus/lessons/round-16.md` (expect hits from the new citations).
