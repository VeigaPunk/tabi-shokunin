# CounterSourceIdentity: round-20 C1 source identity and URL-token falsification

Pin: checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Working-tree copies of every file traced here match the checkpoint (`git diff --name-only` against the pin is empty for them).

Author-side finding, not external closure. No runtime, capability, or depth claim.

Method: read-only data commands only (`git show`, `grep`, `sha256sum`, `wc`, `sed`, `git diff --name-only`). Nothing was executed: no node, no selftest, no CLI run, no tests. Every "predicted" result is a hand trace of the pinned `measure-c1.mjs` and `selftest-c1.mjs` and is unexecuted until main runs the selftest once. Tools installed or updated: none.

## Summary

- **Expected pairs disagree with the producer (High).** Four of 34 pairs in `expected.json` would fail: `wrong_source_id`, `wrong_decision_source_override`, `missing_decision_source_override`, `forced_s096_lc11`. Predicted selftest verdict: `failed`, cases=34, exit 1. Counts and exits agree; only the findings sets differ.
- The source-level findings for `wrong_source_id` are correct. The disagreement is the backlink entry, plus one `decision_anchor_uncovered` in `wrong_decision_source_override`.
- `wrong_source_url` and `wrong_source_path` are correct.
- No red case exists for copied-URL quotes, near-miss URL tokens, or S096 registry identity faults (F2, F3).
- Two producer-versus-contract deviations: a pinned row with no `html_form_element.cc` range part passes (F4), and a truncated range list yields exit 0 (F5).
- Four of 24 registered finding ids have no red case (F6).
- Real checkpoint source identity traces clean (see "Real data").

## F1 (High): four expectations disagree with the pinned producer

| Case (`expected.json` name line) | Expected | Producer trace | Delta |
|---|---|---|---|
| `wrong_source_id` (164) | decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch | −registry_backlink_missing |
| `wrong_decision_source_override` (185) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch | −decision_anchor_uncovered, −registry_backlink_missing |
| `missing_decision_source_override` (192) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | −registry_backlink_missing |
| `forced_s096_lc11` (206) | same as missing | same as missing | −registry_backlink_missing |

Why the producer emits no backlink finding:
- Backlink findings come from two places only: the note-text check in `evaluateComplete` (`measure-c1.mjs:546-547`: the note must contain tokens `S096` and `S100` anywhere) and the used-by check in `checkContractRow` (`:521`).
- `renderNote` (`selftest-c1.mjs:199`; the Sources line is at `:209`) always writes `Sources: S096 … S100 …`, so the text check always passes in fixtures.
- None of the four mutations touches S096 or S100 used-by.

Why there is no `decision_anchor_uncovered` for S099:
- `checkDecisionAnchor` (`measure-c1.mjs:376-379`) looks up the effective id's registry row and returns silently when there is none. `checkContractRow` checks only the pinned rows. The producer's comment says missing rows are "reported by the registry checks", but no registry check covers a non-pinned id. `decision_source_mismatch` is the only signal.

The mutation descriptions in `expected.json` mention no registry or backlink change. The four expectations are therefore not derivable from their own descriptions.

Provenance: `ExecCounter.md:66-76` predicted exactly these sets. `ExecFixtures-return.txt` (lines 27-33, and its "Not confirmed under counter v3" section) says the non-S100 cases were carried forward from that first message and that the S100 sets were marked confirmed against it. The record shows no re-derivation against the fixture note, which gained its Sources line later.

Internal inconsistency: `missing_decision_source_override` (192) and `override_table_mismatch` (199) have identical registry and manifest state (LC11 without `sourceId`, effective S096). They differ only in the note row. Only the first expects `registry_backlink_missing`. Under the current text rule neither fires.

Decision required (a contract choice, not a fix). The repo's `design.json` defines no note-backlink rule; `backlink` does not occur in it. Two consistent repairs:

- **R1, row-level rule.** Each of S096 and S100 must be cited by at least one renderable decision row. Run it inside `checkTable`, so only parsed manifests are checked. I traced all 34 cases under R1: every `registry_backlink_missing` expectation matches, and `override_table_mismatch` stays without it. The one remaining misfit is `wrong_decision_source_override`'s `decision_anchor_uncovered`; that pair becomes `[decision_source_mismatch, registry_backlink_missing]`. Real checkpoint unchanged: rows cite S096 (LC01-10, LC12) and S100 (LC11).
- **R2, keep the text rule.** Change four expectations: `wrong_source_id` → `[decision_source_mismatch, source_mismatch]`; `wrong_decision_source_override` → `[decision_source_mismatch]`; `missing_decision_source_override` and `forced_s096_lc11` → `[decision_anchor_uncovered, decision_source_mismatch]`. Under R2 the text rule cannot fail on the real note: line 1 reads `source:S096+S100 — …`, and prose at lines 15, 42, 48, 50, 52, 81, 86, and 90 also names both.

Lean: R1. It is the rule the expectations encode for backlinks, and the text rule is vacuous on real data. This is a planner decision. Do not change expectations or producer to fit each other without recording the rule in `design.json`.

Anchors: under the current effective-id lookup, only `wrong_decision_source_override` disagrees among the anchor expectations. It conflicts with `wrong_source_id` under the same condition (unregistered effective id, where no anchor finding is expected). A pinned-id lookup would instead break `missing_decision_source_override`, `forced_s096_lc11`, and `wrong_decision_source_override`. Either way the planner must choose.

## F2 (Medium): S096 registry identity has no red case

The fixture set faults only the S100 row. Recommended cases (predicted; count 12, exit 1 unless stated):
- `s096_url_mismatch`: S096 source cell carries `154.0.8037.98` → `[registry_row_invalid]`.
- `s096_digest_mismatch`: S096 anchor decoded sha replaced by 64 zeros → `[registry_row_invalid]`.
- `s096_status_not_mined`: status `queued` → `[registry_status_invalid]`.
- `s096_row_missing`: S096 row id renamed → `[registry_row_invalid]` (anchor check silent).
- `s096_row_duplicated`: second S096 row → `[registry_row_invalid]`.
- `s100_row_duplicated`: second S100 row → `[registry_row_invalid]`.

## F3 (Medium): copied-URL quote and near-miss token have no red case

- `url_copied_quote`: LC06 quote set to the canonical source URL → `[quote_mismatch]`, count 12. Basis: the pinned source's URL-bearing lines (662, 849, 889, 967, 1582, 1596) all lie outside the twelve pinned spans (181-830), so no URL can be a literal quote.
- `url_near_miss_token`: S096 source URL followed by `.` → `[registry_row_invalid]`. The exact-token check (`split(/\s+/).includes`) rejects it; no case exists yet.
- Not a defect by contract: a source cell carrying the canonical token plus another URL passes ("carry the pinned URL as a whitespace token"). Refusing extra URLs would be a new rule and needs its own case.

## F4 (Medium): pinned row without the `html_form_element.cc` range part is accepted

- `declaredRanges` returns `[]` when the file name is absent (`measure-c1.mjs:239-241`). `checkContractRow` (`:505-521`) rejects only `null`. The header contract requires "a parseable `html_form_element.cc:<ranges>` part".
- Fixture: S096 anchor `tag …; decoded sha256 <pin>`. Producer: `[decision_anchor_uncovered]`. Contract: `[decision_anchor_uncovered, registry_row_invalid]`.
- Fix: treat an empty range list as `registry_row_invalid` in `checkContractRow`.

## F5 (Medium): truncated range list is a verdict-level false clean

- `ANCHOR_RANGES` (`measure-c1.mjs:106`) stops capturing at the first character outside `[\d,-]` that breaks the list. The lookahead `(?![\d,-])` lets anything else through, so trailing junk after a valid prefix is silently dropped.
- Fixture: S096 anchor `html_form_element.cc:174-842 ,900-910`. The capture is `174-842`; all S096 spans lie inside it; the producer reports no findings and **exit 0**, although the second part is unparseable.
- Fix: require the list to end at `;`, optional whitespace then `;`, or the end of the cell.
- Red case: `s096_anchor_truncated_list` → `[registry_row_invalid]`, count 12, exit 1. The producer currently fails it.
- Probably the same class as CounterAnchor's decimal-anchor survivor (their probe; not re-run here).

## F6 (Medium): closed-vocabulary and schema coverage

- `FINDING_IDS` has 24 entries (`measure-c1.mjs:137`); `expected.json` persists 20. Not exercised by any case: `decision_shape`, `decision_unknown_id`, `decision_text_invalid`, `table_heading_duplicate`.
- `loadExpected` (`selftest-c1.mjs:130-161`) checks persisted ⊆ registered and persisted = exercised. It never checks registered = persisted, so an unexercised registered id passes silently.
- Proposed red cases (traced):
  - `decision_unknown_id`: append LC13 (LC05 fields) and omit its note row → `[decision_unknown_id]`, count 13.
  - `decision_text_invalid`: LC01 condition contains `|` in manifest and note → `[decision_text_invalid]`, count 12.
  - `decision_shape`: LC06 without `quote` → `[decision_shape]`, count 12.
  - `table_heading_duplicate`: the heading line repeated after the table → `[table_heading_duplicate]`, count 12.
- Schema key sets (no case today):
  - extra top-level key → `[manifest_shape]`, count 12.
  - `decisions: {}` → `[manifest_shape]`, count 0.
  - extra key in `source` → `[source_mismatch]`, count 12.
  - invalid UTF-8 byte inside a quote (Buffer manifest; `buildFiles` passes Buffers through) → `[manifest_malformed]`, count 0.
- Add a check that registered ids equal the persisted reasons.

## F7 (Low): wrong manifest source id masks anchor reasons

`manifestSourceIdOf` (`measure-c1.mjs:216`) feeds `checkDecisionAnchor`, which returns silently when no row matches (`:379`). `wrong_source_id` therefore never reports `decision_anchor_uncovered`, even when S096 spans are uncovered. The verdict stays 1, so there is no false clean. This is reason masking only.

## Real data at checkpoint (traced; CLI not run)

- Manifest top-level keys are exactly `schema, source, scope, decisions`. Decision keys: `id, condition, outcome, startLine, endLine, quote` ×12, plus `sourceId` ×1 (LC11).
- `source` equals the pinned four keys (`decisions.json:4-7`). Scope is at line 9.
- Spans match `PINNED` for all twelve decisions.
- All twelve manifest quotes are literal inside their spans (source lines): LC01 182, LC02 197, LC03 251, LC04 217, LC05 220, LC06 228, LC07 266, LC08 295, LC09 311, LC10 326, LC11 810, LC12 829.
- Registry S096 (`corpus/SOURCES.md:110`) and S100 (`:114`) pass every producer rule: URL token; decoded sha part; parseable ranges (S096 `174-328,729-758,818-842`; S100 `174-328,635-842`, which covers LC11 787-815); status `mined`; used-by names the note; S100 teaches opens `supersedes S096 —` (em dash).
- Note: one table heading (line 25); the next heading of level ≤3 is at line 46; rows 29-40 sit inside; sources are S096 for LC01-10 and LC12 and S100 for LC11, consistent with the manifest.
- Blob sha256 `8c8d…6916`, 1740 lines. `design.json` sha256 `1c9f…a7a1` matches the design pin in `expected.json`.
- Not checked by me: condition and outcome text equality against the note rows, runtime wording on the real text, and the CLI result.

## Checked and correct

- `wrong_source_url` → `[source_mismatch]` (exact `sourceRecordMatches`).
- `wrong_source_path` → `[source_mismatch]`.
- `s100_url_mismatch`, `s100_digest_mismatch`, `s100_teaches_not_supersedes`, `s100_row_missing`, `s100_status_not_mined`, `s100_backlink_missing`, `wrong_anchor_s100`, `wrong_anchor_s096`, `malformed_anchor_s100`: traced match.
- 30 of 34 pairs match the trace. The four disagreements are F1.

## Limits

- Hand traces only. The F1 mismatches are the high-confidence claims. Main should run the selftest once after integration to confirm.
- Anchor-facet probing belongs to CounterAnchor. LC text equality and runtime wording belong to other seats.
- Scope: only the source-identity and URL-token facets of C1. No capability or domain coverage is claimed.

Report: .ufo/waves/round-20/w2/CounterSourceIdentity.md
