# ExecCounter: round-20 C1 counter (`measure-c1.mjs`)

Lane `tabi-shokunin`. Clone `.ufo/waves/round-20/clones/ExecCounter`, branch `round20/ExecCounter`, baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`.
Nothing was executed: no counter run, no `--selftest`, no tests, no builds, no installs. Main runs every check after integration.

## State

| Item | Value |
|---|---|
| HEAD | `c1dc034` (author and committer `tabi-shokunin <tabi@shokunin.local>`; subject `round-20: C1 lifecycle decisions counter`) |
| Changed paths vs baseline | `.ufo/waves/round-20/measure-c1.mjs` only (mode 100755, as repo scripts) |
| HEAD blob | version 2: 27656 bytes, sha256 `178bc869586aa917e8de97fc1f2aa02e9981bff4315f2fc2b2637c25cd5d955b`. LC11 pinned to S100. No anchor-range binding. |
| Working tree (uncommitted, `M`) | version 3: 30974 bytes, sha256 `fab3bde4cc800dbbde9d9dcefb1d04c51a2459e0513312858ff42339ddfa80a6`. Adds anchor-range binding and per-row URL and decoded-sha checks. **This report describes version 3.** |
| Untracked, not committed | `.ufo/waves/round-20/design.json`, `corpus/evidence/round-20/` (clone scaffolds) |
| Commit hold | Per CriticIsolation: no further commit or amend until L1 picks the authoritative design sha and commit form. |
| Transport bundle | None created by me. Writes stay under the clone root, which sits inside the lane. `c1dc034` is unbundled until L1 bundles it from baseline `c4992943`. |
| Installs and updates | None. Present: node v24.21.0, git 2.56.0. |
| Labrat | Not dispatched: leaf seat, no task tool, contract forbids nested agents. |

## Design sha: what happened

- Measured against the declared copy, sha256 `37fa4eab…` (clone `design.json` equals lane `design-declared.json`): the 12 spans, the quote rules, the 12 target.
- Afterward I read the lane `design.json`, sha256 `1c9f536e…` (changed 10:02:31Z). Differences from the declared copy: LC11 `sourceId: S100` (adopted: LC11 pinned to S100, others to S096) and LC12 topic text (not consumed by the counter). All 12 spans identical.
- The counter never reads `design.json`. The design sha binds nothing in the artifact. L1 picks the authoritative sha.

## Interface

- CLI: `node .ufo/waves/round-20/measure-c1.mjs <REV>` prints one JSON line with `schema, metric, revision, commit, verdict, exit, c1_lifecycle_decisions, findings, blobs`. Exit 0 baseline or clean; 1 failed; 2 could not evaluate.
- Could-not-evaluate reasons (CLI only, exit 2): `usage`, `revision_unresolved`, `git_failed`, `entry_not_regular`, `selftest_unavailable`.
- `node .ufo/waves/round-20/measure-c1.mjs --selftest` spawns sibling `selftest-c1.mjs` under the minimal environment, relays its output, and propagates its status. Absent child: exit 2. I did not write `selftest-c1.mjs`.
- Export: `evaluate(files)`, `files` = `Map<repo-relative POSIX path, Buffer|Uint8Array|string>`. Returns exactly `{exit, c1_lifecycle_decisions, findings}`. Also exports `FINDING_IDS` (24) and `PINS`. Import is side-effect free (entry-point guard). Evaluate never returns exit 2.
- Inputs are revision blobs only, read by git argv with no shell, under a minimal environment (literal pathspecs, fsmonitor off, absolute PATH entries). A non-regular entry (symlink, submodule, tree) is `entry_not_regular`.

## Counting rules

- `c1_lifecycle_decisions` = `manifest.decisions.length` when the manifest parses to a plain object whose `decisions` is an array; otherwise 0. Failing states show the raw count, so admit only exit 0. Clean = exit 0 and 12.
- Baseline: manifest and note both absent → exit 0, count 0. Source and registry are ignored.
- Exactly one of manifest or note present → `partial_state` only, exit 1.
- Full state (both present) runs the checks below.

## Checks in full state

1. Manifest: strict UTF-8 JSON object (`manifest_malformed`); top-level keys exactly `schema, source, scope, decisions` with the schema value (`manifest_shape`); scope exact (`scope_mismatch`); `source` exactly the pinned S096 record (`source_mismatch`).
2. Source bytes: present (`source_missing`); sha256 equals `8c8d6796…36916` (`source_digest_mismatch`). Literal quote checks run only against digest-verified bytes.
3. Decisions: keys are the six required plus optional `sourceId` (`decision_shape`); `id` is one of LC01–LC12 (`decision_unknown_id`), each exactly once (`decision_missing`, `decision_duplicate_id`); condition and outcome non-empty, with no `|`, CR or LF (`decision_text_invalid`) and no runtime wording (`runtime_wording`); span equals the pinned span (`span_invalid`); quote non-empty with at most 25 whitespace words (`quote_invalid`); quote is a literal substring of the pinned span lines (`quote_mismatch`).
4. Citation: effective source `decision.sourceId ?? manifest.source.id` must equal the pin, LC11 `S100`, others `S096` (`decision_source_mismatch`).
5. Anchor binding: the cited span `[startLine, endLine]` must lie wholly inside the union of `html_form_element.cc` ranges declared in the cited registry row's anchor cell (`decision_anchor_uncovered`). A row declaring no such ranges covers nothing. Malformed or repeated ranges: `registry_row_invalid`.
6. Table: under the exact heading `### Declarative WebMCP completion lifecycle — source-scoped (round 20)` (U+2014), the multiset of rows `| LCnn | condition | outcome | <source>:<start>-<end> |` must equal the renderable decisions. Missing → `table_row_missing`; extra or outside the section → `table_row_extra`; duplicate heading → `table_heading_duplicate`.
7. Registry (`corpus/SOURCES.md`, `## Registry`): S096 and S100 each have exactly one row. Each row must have the pinned URL as a whitespace token in its source cell, the exact part `decoded sha256 8c8d…` in its anchor cell, and a parseable `html_form_element.cc:` range list (`registry_row_invalid`); status `mined` (`registry_status_invalid`); used-by naming the note (`registry_backlink_missing`). S100 `teaches` must start `supersedes S096 —` (`registry_row_invalid`). A missing registry is `registry_row_invalid`.
8. Note citations: the note must contain tokens `S096` and `S100` (boundary-checked), else `registry_backlink_missing`. This is my reading of the parent's "note backlink" rule.

## Finding ids (FINDING_IDS, 24)

partial_state, manifest_malformed, manifest_shape, scope_mismatch, source_mismatch, source_missing, source_digest_mismatch, decision_shape, decision_unknown_id, decision_duplicate_id, decision_missing, decision_text_invalid, decision_source_mismatch, decision_anchor_uncovered (new), runtime_wording, span_invalid, quote_invalid, quote_mismatch, table_heading_duplicate, table_row_missing, table_row_extra, registry_row_invalid, registry_status_invalid, registry_backlink_missing.

## Expectation changes, explicit

- LC11 must cite S100 (from lane design `1c9f536e`).
- The S100 registry row is required. It does not exist yet, so the counter fails with `registry_row_invalid` until L1 adds it.
- Anchor binding (parent M3): spans must lie inside the cited row's declared ranges. Derived by reading the S096 row: `174-328, 729-758, 818-842` cover every S096 span (LC01–LC10, LC12) and do not cover LC11 787–815, so forcing LC11 to S096 fails.
- The note must cite both S096 and S100 (my reading of the backlink rule).

## Predicted fixture sets (sent to ExecFixtures; c1 = 12 unless noted)

- valid_all12: exit 0, `[]`. Requires the S100 anchor to declare `html_form_element.cc:787-815`.
- wrong_decision_source_override (LC11 S099): `[decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing]`
- missing_decision_source_override (LC11 absent; note S096:787-815): `[decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing]`
- override_table_mismatch (LC11 absent; note S100:787-815): `[decision_anchor_uncovered, decision_source_mismatch, table_row_extra, table_row_missing]`
- forced_s096_lc11: `[decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing]`
- wrong_anchor_s100 (S100 anchor `174-328` only): `[decision_anchor_uncovered]`
- wrong_anchor_s096 (drops `818-842`): `[decision_anchor_uncovered]` (LC12 only)
- malformed_anchor_s100 (`787-`): `[registry_row_invalid]`
- wrong_source_id (manifest.source.id S097): `[decision_source_mismatch, registry_backlink_missing, source_mismatch]`
- s100_row_missing, s100_teaches_not_supersedes, s100_url_mismatch, s100_digest_mismatch: `[registry_row_invalid]`
- s100_status_not_mined: `[registry_status_invalid]`; s100_backlink_missing: `[registry_backlink_missing]`
- manifest_malformed_json: `[manifest_malformed, registry_backlink_missing]`, c1 0
- wrong_manifest_schema: `[manifest_shape]`, c1 12
- invalid_quote_26_words, invalid_quote_empty: `[quote_invalid]` each

## For main and L1

1. Choose the authoritative design sha (`37fa4eab` declared or `1c9f536e` lane). The counter embeds its pins; the sha is informational.
2. Choose the commit form. `c1dc034` is version 2 and lacks anchor binding. Version 3 is in the working tree. A new commit preserves the ledger; an amend changes the SHA. Held as instructed.
3. Bundle the chosen commit from baseline `c4992943` outside the lane tree and record its sha256.
4. Confirm the copied source: sha256 of `corpus/evidence/round-20/sources/html_form_element.cc` must be `8c8d6796…36916`. I did not check it.
5. The S100 row must have: the full URL as a whitespace token in its source cell; an anchor part `decoded sha256 8c8d…` and `html_form_element.cc:787-815` (or a covering range); `teaches` beginning `supersedes S096 —`; status `mined`; used-by including the note path. The note must cite S100 through its LC11 row.
6. Checks to run once integrated (not run by me):
   - `node .ufo/waves/round-20/measure-c1.mjs c49929430d996b016dde2e3a3a5be380f3433fdb` → baseline, exit 0, count 0.
   - `node .ufo/waves/round-20/measure-c1.mjs --selftest` once `selftest-c1.mjs` exists.
   - Full state after manifest, note and S100 exist → clean, exit 0, count 12.
   - Mutant fixtures per the sets above.
7. The runtime-wording list (`runtime`, `run-time`, `observed`, `observation`, `empirical*`, `measured`, `reproduced`) is mechanical. Scribes must avoid these words in condition and outcome.

## Verification status

Untested. The file was written and reviewed by reading only, and the parent instructed no tests.
