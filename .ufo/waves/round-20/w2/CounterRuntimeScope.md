# CounterRuntimeScope — round-20 w2 (scope_mismatch / runtime_wording)

Revision audited: `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Files: `.ufo/waves/round-20/measure-c1.mjs`, `.ufo/waves/round-20/selftest-c1.mjs`, `corpus/evidence/round-20/selftests/expected.json`. Working tree identical for these three and for `design.json` (`git diff --stat 4ae99816` empty).

Method: hand trace of producer and fixture logic. Nothing executed. Read-only commands only: `sha256sum`, `git show | sha256sum`, `git status`, grep, read. Tool installs or updates: none.

Godspeed axes: pair_fidelity · scope_enforcement · wording_enforcement · overlap_preservation · pin_provenance · schema_coverage · disclosure.

## Verified (no finding)

- Retained blob `corpus/evidence/round-20/sources/html_form_element.cc` sha256 `8c8d6796…6916` equals the pin and the checkpoint blob. Contains no CR bytes.
- `design.json` sha256 `1c9f536e…` equals `expected.json` `design.sha256`.
- `design.json` decision ids, spans and LC11 `sourceId` equal `PINNED_DECISIONS` (`measure-c1.mjs:81-94`) and the selftest `DECISIONS` (`selftest-c1.mjs:57-70`) for all 12 rows.
- Every pinned quote occurs inside its pinned span (e.g. LC04 `PauseExecution();` at source 217 within 212-218; LC11 at 810 within 787-815). Preflight passes, so the runner reaches the cases and does not exit 2.
- `invalid_quote_26_words` is exactly 26 tokens (`selftest-c1.mjs:185-190` slices to the 26th token), so that fixture is correct.
- Production `decisions.json`: schema, source block, `scope` (`source-only Chromium 154.0.8037.97; not runtime-observed`) and LC11 `sourceId: S100` all match the counter pins exactly. Its only `runtime`/`observ` hit is the `scope` line, which the counter never tests.
- Production registry rows S096 (`corpus/SOURCES.md:110`) and S100 (`:114`) satisfy the counter contract. S100 teaches opens `supersedes S096 —`, and both used-by cells name the round-20 note.
- Metric disclosure (`measure-c1.mjs:29-32`): count rule and exit-0 admission are stated.

## Findings

### F1 · CRITICAL (blocks the gate) · pair_fidelity · 4 of 34 persisted pairs are not derivable

The committed selftest fails. In each case below, count (12) and exit (1) match; only `findings` differs.

| case | persisted findings | derived from frozen counter | surplus |
|---|---|---|---|
| `wrong_source_id` | decision_source_mismatch, **registry_backlink_missing**, source_mismatch | decision_source_mismatch, source_mismatch | registry_backlink_missing |
| `wrong_decision_source_override` | **decision_anchor_uncovered**, decision_source_mismatch, **registry_backlink_missing** | decision_source_mismatch | decision_anchor_uncovered, registry_backlink_missing |
| `missing_decision_source_override` | decision_anchor_uncovered, decision_source_mismatch, **registry_backlink_missing** | decision_anchor_uncovered, decision_source_mismatch | registry_backlink_missing |
| `forced_s096_lc11` | decision_anchor_uncovered, decision_source_mismatch, **registry_backlink_missing** | decision_anchor_uncovered, decision_source_mismatch | registry_backlink_missing |

Cause:
- `registry_backlink_missing` has two emission sites: the used-by check for pinned rows (`measure-c1.mjs:520-521`) and the note-token check (`:546-548`). Neither fires in these four cases. Used-by is unchanged, and `renderNote` always writes the S096 and S100 tokens.
- `checkDecisionAnchor` returns silently when the cited id has no row (`:379`).
- The comment at `:373-375` says "a missing or duplicate row is reported by the registry checks". The registry checks (`:549-552`) cover only the pinned S096 and S100 rows. A cited id with no row yields only `decision_source_mismatch`.
- The persisted pairs therefore encode an unimplemented rule (a cited source must have a row whose used-by names the note), and the comment claims that rule is implemented.

Predicted output of the committed runner (untested): `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20`, exit 1, four `FAIL_DETAIL` lines of the form `findings=[…] want=[…]`.

Fix:
- (a) Default, no contract change: correct the comment at `:373-375` to the true behavior, and regenerate the four findings arrays from the derived sets. All 20 declared reasons stay exercised.
- (b) Only if the persisted behavior is intended: that is a contract change. Implement the rule and name its finding ids in the closed `FINDING_IDS` (`:110`).

### F2 · MAJOR · scope_enforcement · the note `Scope:` clause is inert; `wrong_scope` overstates coverage

- The counter's only scope gate is exact manifest equality (`measure-c1.mjs:298`). No rule reads a note scope line.
- The fixture writes `Scope: ${state.scope}` (`selftest-c1.mjs:211`).
- The production note has no `Scope:` or `Sources:` line (case-sensitive grep). Its scope is prose (`webmcp-completion-lifecycle-round-20.md` line 9: "Source-only reading … This is not a runtime claim.").
- The `wrong_scope` description in expected.json says "manifest and note scope name Chromium 153". The note half is a no-op. A note-only scope tamper traces to exit 0, findings `[]`.

Fix: drop the note clause from the fixture and from the expected description, and document `scope_mismatch` as manifest-only. Adding a note scope rule would be a contract change that the production note does not satisfy today.

### F3 · MODERATE · overlap_preservation · the round-19 historical registry link is unguarded

- The counter checks only that used-by names the round-20 note (`measure-c1.mjs:521`). The round-19 entry is never checked.
- Production S096 used-by (`SOURCES.md:110`) currently names both `webmcp-declarative-validation-round-19.md` and the round-20 note. Preservation holds by data, not by the gate.
- Traced: used-by = round-20 only gives exit 0, findings `[]`. No red case exists.
- Attribution correction: the "S096 used-by names the round-19 and round-20 notes" text is the `valid_all12` description in `expected.json`, not in `design.json`.

### F4 · MODERATE · wording_enforcement · the intended boundary is unpinned; vocabulary and negation are loose

(a) Boundary, intended, keep it. `RUNTIME_WORDING` applies only to condition and outcome (`measure-c1.mjs:343-350`). The production note's History section (lines 70-82) preserves affirmative round-17 runtime observations ("Runtime autosubmit success and navigation are already observed in round 17"). Those must not be flagged. Do not widen the regex to note prose: production line 9 ("This is not a runtime claim") would false-positive. No fixture pins this boundary.

(b) Vocabulary. `RUNTIME_WORDING` (`:108`) is an unclosed regex, unlike `FINDING_IDS` (`:110`). It misses `observe`, `observing`, `run time`, `reproduce`, `reproducible` and `measurement`. The single runtime case, "observed at runtime", is double-keyed (`observed` and `runtime`), so per-word behavior is unpinned.

(c) Negation. The comment at `:107` says "Affirmative runtime or observation wording is refused", but the regex refuses negations too. Production S100 scope cell "not runtime behaviour" (`SOURCES.md:114`) would trip it if the regex were applied to registry cells. Pick one: rewrite the comment to "any of these words in condition or outcome, including negations", or add negation handling. Then pin it.

(d) Quotes are exempt because only condition and outcome are checked. No pinned quote matches today, so there is no false positive, but the exemption is undocumented.

### F5 · MODERATE · pin_provenance · the source commit identity is not pinned

- The counter pins the tag URL and the blob digest. The commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` appears nowhere in `measure-c1.mjs` (grep). Production anchors carry it (`SOURCES.md:110`, `:114`).
- Traced: a registry row with the right URL, sha and ranges but a different commit in the anchor gives exit 0. The commit appears only in fixture anchors, and no case mutates it.

### F6 · MODERATE · pin_provenance · hand-copied pins are not cross-checked against design.json

- `PINNED_DECISIONS`, the selftest `DECISIONS` and `expected.design` are copies of `design.json`. They are equal today (verified above). Nothing reads `design.json` at runtime. Grep finds `design` in the selftest only in comments (`:12`, `:33`, `:53`, `:56`), and `expected.design.sha256` is never compared.
- A span or sourceId drift in `design.json` passes the gate undetected.

### F7 · MINOR · schema_coverage · finite-schema coverage is one-directional

- `loadExpected` enforces `registered ⊇ vocabulary` (`selftest-c1.mjs:145`) and `vocabulary = exercised` (`:160-161`). It does not enforce `registered ⊆ vocabulary`.
- `FINDING_IDS` has 24 ids; expected declares 20. Unexercised: `decision_shape`, `decision_unknown_id`, `decision_text_invalid`, `table_heading_duplicate`. A newly added id would pass the gate with no case.
- Unreachable branches: `decision_text_invalid` (`measure-c1.mjs:349`) has no case. The note-token backlink branch (`:546-548`) cannot be reached by any fixture, because `renderNote` always writes S096 and S100.

### F8 · MINOR · disclosure · the quote-word limit is pinned on the reject side only

- `QUOTE_MAX_WORDS = 25` (`measure-c1.mjs:78`) has no comment. `design.json` `manifestShape` states "<=25 whitespace words", which matches.
- Reject side pinned: `invalid_quote_26_words`.
- Accept side at exactly 25 words: no case.

### F9 · MINOR · disclosure · runner and CLI limits are undocumented

- `could_not_evaluate` detail truncates at `DETAIL_MAX = 240` (`measure-c1.mjs:58`, applied in `cleanDetail` at `:572-575`). `MAX_BUFFER` is 64 MiB (`:57`). Neither is stated in the header. CLI-only.

## Missing red cases (recommendations)

| # | gap | proposed case | current behavior (traced) |
|---|---|---|---|
| R1 | round-19 backlink (F3) | S096 used-by = round-20 only | exit 0 |
| R2 | commit identity (F5) | S096 anchor commit replaced | exit 0 |
| R3 | note scope clause (F2) | note-only scope tamper | exit 0; remove the clause or document it |
| R4 | runtime boundary (F4a) | History-style line outside table with "observed at runtime" | exit 0; pin it as a must-pass control |
| R5 | negation (F4c) | outcome "not observed at runtime" | runtime_wording; decide and pin |
| R6 | vocabulary (F4b) | outcome with "observe" or "run time" | exit 0; decide and pin |
| R7 | quote accept boundary (F8) | valid 25-word literal quote | exit 0 (untested) |
| R8 | design drift (F6) | selftest asserts design sha and id/span/sourceId | no check exists |
| R9 | coverage (F7) | new finding id with no case | runner passes; add exclusion list both ways |
| R10 | text validity (F7) | pipe in outcome | decision_text_invalid (untested) |
| R11 | note backlink (F7) | note without S096 token | registry_backlink_missing; currently unreachable |

## Residual risk and verification gaps

- Everything above is hand-traced. Main should run `node .ufo/waves/round-20/selftest-c1.mjs` once after integration. Predicted: `verdict=failed`, exit 1, the four F1 lines.
- Out of lane and not examined: the CLI REV path, production note semantics beyond the cited lines, and the other 30 fixture pairs beyond their trace.
- The selftest reads the retained blob from the working tree rather than the commit. It is digest-checked, so this is not a provenance defect.
