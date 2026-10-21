# Round21 CounterSource — static falsification

## Axes and bounds

Axes: C1 finite-observation count integrity; source identity and backlink integrity; separation of S100 source interpretation from S101 own-work runtime evidence; independent finite-control coverage. No coverage percentage, novel-branch count, admission, or actor-quiescence conclusion is made.

Read-only static review of the current counter, producer provenance assignments, current receipt/note/registry/source-opening, independently persisted positive fixture, expected oracle and CLI control builder. No counter, selftest, browser, build, lint, formatter, or other runtime was executed. All outcome predictions below are **[INFERENCE]**, not observed test results. No tools were installed or updated. Only this report was written.

## Finding CS1 — source-header labels need not identify the evidence actually counted

**Concrete attack:** keep the checked S100/S101 registry rows and every receipt/raw byte intact; replace only the note's source-header S101 identifier with an arbitrary copied label, `S999`. On the persisted positive fixture an even smaller attack is replacing `source: S100` with `source: S999` and appending `S100` as a body line.

**Evidence and exact anchors:**

- `.ufo/waves/round-21/measure-c1.mjs:51-58` binds opening identity, decoded body, exact S100 URL token, unique registry rows, S101 own-work/A classification, receipt-path token and both registry-to-note backlinks. It does not bind the note's declared sources to these rows.
- `measure-c1.mjs:59-61` requires only `note.startsWith('source:')`, `note.includes('S100')` anywhere, and a skill link. No S101 token or header-scoped identifier/path association is required.
- `measure-c1.mjs:65` checks case-ID mentions anywhere; it does not repair source-header identity. `:100` counts all cases if findings are empty.
- `.ufo/waves/round-21/fixtures/positive-ordered.json:5` already supplies a positive note headed only `source: S100`, with no S101 association. Its line 6 supplies both registry rows, so the omitted association is concealed by the independent registry check.
- `.ufo/waves/round-21/fixtures/expected.json:2-7` expects that fixture to count 12 without a finding.
- Current production note `corpus/knowledge/webmcp-nonautosubmit-round-21.md:1` correctly associates S101 with the receipt and S100 with tagged C++ source; `:14-21` explicitly separates own-work observations from upstream interpretation. `:36-37` reserves reset/removal interpretation to S101.

**Smallest finite red case for L1:** add `copied-note-source-label` to the existing fixture builder, changing only `files[NOTE] = files[NOTE].replace('source: S100', 'source: S999') + '\nS100\n';`. Do not change registry rows, receipt digests, producer or raw case records. Desired independent expected tuple: `exit: 1`, `finding: 'source_binding'`, `value: 0`. **[INFERENCE] Current code instead leaves all predicates unchanged and would count 12 without a finding, conditional on the unchanged base fixture being clean.**

A companion association-specific case after repairing the positive fixture is `own-work-note-source-missing`: remove only S101 from the source header, leaving its explanatory body mentions and registry row intact. Desired tuple is the same. This catches a fix that merely adds another whole-note substring test.

**Impacted axes:** false provenance/source-to-evidence association and C1 count integrity. This is a fixable counter defect, not a reason to reject the finite12 lifecycle experiment itself. Current production prose is correctly scoped; this finding concerns acceptance of an altered note, not a claim that current data was fabricated.

**Smallest safe correction:** parse only the first `source:` line into explicit source-ID associations, requiring distinct S100 and S101 IDs there and the S101 receipt-path association there. Keep the existing S100 URL/body and S101 registry checks; do not substitute copied prose tokens for their authority. Update the persisted positive note to declare both evidence classes, then independently persist the two red expected records. Use `source_binding` for failed association. No source-binary equivalence or publisher-diversity claim is needed.

## Finding CS2 — current source-binding controls do not isolate backlink or own-work classification regressions

**Concrete attack:** a future edit drops only the S101 backlink predicate from `measure-c1.mjs:58`; the current finite source controls need not notice because none corrupts that backlink while retaining the row.

**Evidence and exact anchors:**

- `selftest-c1.mjs:29,41-43` provides source-body edit, wholesale wrong opening identity, row URL drift, and entire missing S101 row. `:95` rejects any unregistered mutation name.
- `fixtures/expected.json:38-43,110-115,157-158` persists the corresponding source findings. There is no isolated S100/S101 backlink or S101 kind/tier mutant in the complete expected list (`:1-170`).
- `measure-c1.mjs:57-58` explicitly checks each backlink, S101 kind `own-work` and tier `A`. Deleting one check can therefore survive controls which still fail for other independently corrupted fields.

**Smallest finite red cases for L1 (separate, single-field changes):**

| Case | Mutate only | Desired finding / exit / value |
|---|---|---|
| `s100-backlink-drift` | S100 registry `used-by` cell: replace NOTE with an unrelated path | `source_binding` / 1 / 0 |
| `s101-backlink-drift` | S101 registry `used-by` cell: replace NOTE with an unrelated path | `source_binding` / 1 / 0 |
| `s101-kind-drift` | S101 registry kind: `own-work` → `code` | `source_binding` / 1 / 0 |
| `s101-tier-drift` | S101 registry tier: `A` → `B` | `source_binding` / 1 / 0 |

**[INFERENCE] The present counter should reject each of these four mutants directly at line 58.** Their absence is a finite control-coverage gap, not evidence of a present false-positive result on those inputs. Add isolated mutations and independently persisted expected rows; do not weaken row identity/backlink validation or demand arbitrary human-readable title equality.

## Boundary on conclusions

The exact S100 URL/sourceId/body and unique row identity are already checked (`measure-c1.mjs:33-34,51-58`), so arbitrary replacement of that URL alone is not a demonstrated bypass. S101 already has a registry own-work classification and receipt-path association. Human-readable source titles need not be byte-pinned: the demonstrated defect is that the note's declared source authority can be arbitrary while those separate registry checks remain satisfied. No historical acquisition was substituted for current runtime evidence.

Report: .ufo/waves/round-21/w2/CounterSource.md
