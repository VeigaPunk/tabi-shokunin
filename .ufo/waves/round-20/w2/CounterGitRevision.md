# CounterGitRevision: round-20 C1 counter, selftest, expected pairs @ 4ae99816b8994fdedc159156d8d9d242dd5c4782

Scope: `measure-c1.mjs` (revision resolution, blob reads, minimal Git env, argv, exit classes), `selftest-c1.mjs`, and `corpus/evidence/round-20/selftests/expected.json`. Author-side counter finding; not external closure.

Method: read-only. Pinned blob ids match the working tree (`git hash-object`), HEAD equals the pin, and no tracked diffs exist under `.ufo/waves/round-20`. Executed only read-only git plumbing and hashing (git 2.56.0). Neither `measure-c1.mjs` nor `selftest-c1.mjs` was run. Findings marked "static" come from tracing the pinned text. Main should confirm H1 with one `node .ufo/waves/round-20/selftest-c1.mjs` run.

Scope limit: nothing here validates the semantic truth of the 12 rows. Quote checks prove only literal presence in the pinned span.

## Verdict

- **H1 (high):** 4 of 34 persisted pairs disagree with the producer (static). The gate would likely report `verdict=failed`, exit 1. The persisted pairs share no single rule with the header or the producer (see H1).
- **M1 (medium):** four registered finding ids have no red case, and the selftest does not require them. **M2 to M5 (medium and below):** one table-row blind spot, one registry-row acceptance gap, a non-tree ancestor that silently yields `baseline` exit 0, and no automated coverage of any CLI behavior.
- **Verified correct:** `--end-of-options` revision resolution and refusal set, symlink/gitlink/tree rejection at the path itself, minimal env (every named var exists in the installed git), no worktree reads in REV mode, source and design digests, all 12 quotes and spans.

## H1: persisted pairs contradict the producer (static)

| case (expected.json line) | persisted | producer (static) |
|---|---|---|
| wrong_source_id (164-167) | decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch |
| wrong_decision_source_override (185-188) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch |
| missing_decision_source_override (192-195) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch |
| forced_s096_lc11 (206-209) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch |

Divergence D1, `registry_backlink_missing`: the producer raises it only from the used-by check (`measure-c1.mjs:521`) and the whole-note token check (`:546`). The `Sources:` line always cites S096 and S100, so the token check cannot fire in these fixtures. No note-row citation rule exists. The author's own `manifest_malformed_json` mutation (selftest `CASES`, `:310` onward) relies on that same Sources line for citation. D1 therefore contradicts the author's own rule. Recommend dropping `registry_backlink_missing` from those four pairs.

Divergence D2, decision coverage for a missing registry row: `checkDecisionAnchor` returns silently when no row matches (`:378-379`). The comment at `:375` defers to "registry checks", but those checks cover only the pinned rows S096 and S100 (`:505-523`).

The persisted pairs do not share one D2 rule with the header or with the producer. Three cases share the condition "effective row missing":
- `s100_row_missing` (LC11 cites S100, row absent): persisted `registry_row_invalid` only.
- `wrong_source_id` (11 decisions cite S097, row absent): persisted no `decision_anchor_uncovered`.
- `wrong_decision_source_override` (LC11 cites S099, row absent): persisted `decision_anchor_uncovered`.

The header's literal rule ("span must lie wholly inside the union of those ranges", so an empty union for a missing row) gives uncovered in all three. The producer gives none of them. The persisted set gives uncovered only for the unpinned S099 case; that fits only a rule that branches on pinned ids and falls back to S096's ranges for unpinned ids. The header states no such branch.

Resolution options. Re-derive from the header, not from producer output:
- **(b) header-literal, recommended:** make `checkDecisionAnchor` add `decision_anchor_uncovered` when no row matches, and drop D1. Pair deltas: `wrong_source_id` gains uncovered and loses backlink; `s100_row_missing` gains uncovered; `wrong_decision_source_override`, `missing_decision_source_override`, and `forced_s096_lc11` lose backlink. Five pairs change.
- **(a) producer-consistent:** keep the silent skip and drop D1. Pair deltas: `wrong_source_id`, `missing_decision_source_override`, and `forced_s096_lc11` lose backlink; `wrong_decision_source_override` loses backlink and uncovered. Four pairs change, no producer change. This leaves the header rule unmet for missing unpinned rows.

## M1: four registered finding ids have no red case; the selftest does not require equality

- `measure-c1.mjs:137` registers 24 ids. `expected.json` `reasons` (lines 14-35) lists 20.
- Missing: `decision_shape`, `decision_unknown_id`, `decision_text_invalid`, `table_heading_duplicate`.
- `selftest-c1.mjs:145` checks reasons ⊆ registered. `:161` checks exercised == reasons. Nothing checks registered ⊆ reasons, so a regression in those four paths passes silently.

Red cases (predicted with the current producer):
1. `decision_shape`: `delete byId(state,'LC05').quote` gives `[decision_shape]`, count 12, exit 1.
2. `decision_unknown_id`: push `{...byId(state,'LC05'), id:'LC13'}` and set `state.omitRows=['LC13']` gives `[decision_unknown_id]`, count 13, exit 1.
3. `decision_text_invalid`: `byId(state,'LC06').outcome = 'the done callback receives | kToolCancelled'` gives `[decision_text_invalid]`, count 12, exit 1. The note row carries the same text, so no table finding.
4. `table_heading_duplicate`: needs a note-suffix hook (`renderNote`, `:199`). Appending the heading line after the table gives `[table_heading_duplicate]`, count 12, exit 1.

Fix: in `loadExpected`, add `if (!sameList(uniqueSorted([...registered]), vocabulary)) fault('expected_vocabulary_incomplete')`.

## M2: the table extra-row check is blind to LC IDs that are not exactly two digits

- `measure-c1.mjs:99` defines `LC_ROW = /^\|\s*LC\d{2}\s*\|/`, used at `:431`. Rows such as `| LC100 |`, `| LC1 |`, indented rows, or lowercase IDs are never counted, so an extra in-section row is accepted.
- Red case (fails today): append `| LC100 | x | y | S096:181-186 |` inside the section. Expected `[table_row_extra]`, count 12, exit 1. Producer: exit 0, verdict clean.
- Fix: match any LC-prefixed first cell and keep the header and separator excluded. Spec backing: the multiset rule at `:407`.

## M3: a registry anchor without an `html_form_element.cc` range part passes the row check

- `declaredRanges` returns `[]` when the part is absent (`:240-241`). `checkContractRow` rejects only `null` (`:516`). The header requires "a parseable `html_form_element.cc:<ranges>` part".
- Red case: `state.sourceAnchor = SOURCE_ANCHOR.replace('html_form_element.cc:174-328,729-758,818-842; ', '')`. Today: `[decision_anchor_uncovered]`. After the fix: `[decision_anchor_uncovered, registry_row_invalid]`.
- Fix: reject `[]` at `:516`.

## M4: a non-tree ancestor makes a regular path silently absent; both files hidden gives baseline exit 0

- `entryAt` maps zero `ls-tree` rows to `absent` (`measure-c1.mjs:654`). `evaluate` returns baseline when both files are absent (`:564`).
- Verified: `git ls-tree -z <rev> -- <blob>/nested` prints zero bytes with no error. So if the manifest and note paths both sit behind a symlink or gitlink ancestor, the CLI reports `verdict=baseline`, exit 0, c1=0. If only one is hidden, it reports `partial_state`, exit 1.
- Header requirement: "Every input is a regular blob at that commit."
- Fix: for each ancestor prefix, require a tree, or report `entry_not_regular`. Also compare the returned path with the requested one (L1).
- Red case: symlink at `corpus/evidence/round-20/lifecycle` and no note. Expected exit 2 `entry_not_regular`. Today: baseline.

## M5: no automated coverage of CLI behavior

- `selftest-c1.mjs` imports only `evaluate` and `FINDING_IDS`. `--selftest` only relays the child (`measure-c1.mjs:665-687`).
- Not exercised by any red case: REV refusal, `revision_unresolved`, usage, `git_failed`, `entry_not_regular` at the path, CLI-level baseline, worktree independence, env isolation, and `--selftest` exit relay.

Recommended CLI harness (temp repos, run once at the gate). Expected results follow from the code:
1. `-x`, `HEAD:README`, `no-such-rev` give exit 2, `revision_unresolved`, `commit: null`.
2. Zero args or two args give exit 2, `usage`.
3. Manifest as symlink, note as gitlink (160000), or manifest as tree give exit 2, `entry_not_regular`.
4. A commit with none of the four paths gives exit 0, `baseline`, c1 0.
5. Edit the manifest in the working tree after committing: identical JSON line.
6. `GIT_DIR=<other repo>` in the process env: identical output.
7. `refs/replace/<commit>` pointing at a different tree: identical output (`GIT_NO_REPLACE_OBJECTS`).
8. `.git/info/grafts` rewriting the parent of HEAD: `HEAD~1` still resolves to the real parent (`GIT_GRAFT_FILE=/dev/null`).
9. Ancestor symlink (M4): `entry_not_regular`. Fails today.
10. `--selftest` exit status equals the child's (0 clean, 1 failed, 2 unavailable).

## Lower

- **L1:** `entryAt` discards the path capture (`:655`, `(.*)`). Add `match[4] === path`, failing closed on mismatch.
- **L2:** `ls-tree` path arguments are cwd-relative, and the CLI uses the `--show-toplevel` result as cwd (`:641`, `:651`). Probe: from `.ufo`, `corpus/SOURCES.md` gave 0 bytes without `--full-tree` and 71 bytes with it. The CLI is correct today because cwd is the toplevel. Add `--full-tree` to remove the dependence. `-c core.worktree=` did not change `--show-toplevel` in my probe, so I did not reproduce a bypass.
- **L3:** `repoRoot` (`:640-643`) discovers any enclosing repository. A copy of the script inside another repo measures that repo, and absent files then give baseline exit 0. Fix: assert `.ufo/waves/round-20/measure-c1.mjs` is a regular blob at the resolved commit.
- **L4:** `expected.json` `design.sha256` (`1c9f536e…a1da`) equals the pinned `design.json` (verified). `loadExpected` never checks it, although the selftest header (line 13) says fixtures are built against it. Add the check.
- **L5, untested claims:**
  - `strictUtf8` (`:191-196`): a raw 0xFF byte inside a quote should give `[manifest_malformed]`, count 0. Without strict decoding it would be `quote_mismatch`.
  - Registry absent, no `## Registry` heading, duplicate S100 row, S096 row missing, S096 URL/digest/status mismatch: each should give `registry_row_invalid` (or `registry_status_invalid`), count 12. Predicted, untested.
  - Out-of-section LC row: `table_row_extra`. Predicted, untested.
  - Manifest `decisions` non-array, or extra top-level key: `manifest_shape`. Predicted, untested.

## Verified OK (evidence)

- **Pins:** source sha256 `8c8d6796…6916` (`git cat-file blob … | sha256sum`), 0 CR bytes. `design.json` sha256 `1c9f536e…a1da`. Design ids, spans, and sourceId for LC01 to LC12 match `PINNED_DECISIONS` and the selftest `DECISIONS`.
- **Quotes:** all 12 are literal within their spans. Source lines: LC01 182, LC02 197, LC03 253, LC04 217, LC05 220, LC06 227, LC07 263, LC08 295, LC09 311, LC10 326, LC11 810, LC12 829. The 26-word fixture is inside 298 to 319 (hand count: the 26th token ends on line 308).
- **Revision:** `git rev-parse --verify --end-of-options <commit>^{commit}` resolves in git 2.56.0. An unknown revision exits 128 ("Needed a single revision"), mapped to `revision_unresolved` (`:709-714`). `REV_PATTERN` (`:59`) refuses a leading `-`, `:`, whitespace, and a trailing newline (JS `$` without `m`).
- **Env:** `GIT_NO_LAZY_FETCH`, `GIT_NO_REPLACE_OBJECTS`, `GIT_LITERAL_PATHSPECS`, `GIT_OPTIONAL_LOCKS`, `GIT_GRAFT_FILE`, `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_NOSYSTEM`, `GIT_TERMINAL_PROMPT`, and `GIT_CEILING_DIRECTORIES` all appear in the installed binary. `minimalEnv` (`:600`) replaces the child environment, so parent `GIT_*` variables do not leak. `-c` neutralizes only `core.fsmonitor` and `core.quotepath`.
- **Blobs:** the mode/type check (`:658`) rejects 120000 symlinks, 160000 gitlinks, and trees at the path itself. `cat-file blob` returns raw object bytes with no smudge or EOL filters. `core.abbrev=4` does not shorten `ls-tree` output, so the 40 to 64 hex regex is safe.
- **No worktree reads in REV mode:** the only filesystem access is `isEntrypoint` (`:764`). The selftest reads the working-tree source for its retained blob (`selftest:120-122`), but preflight digests it (`:168`). That is not a counter input.

## Not verified / gaps

- No run of `measure-c1.mjs` or `selftest-c1.mjs`. H1, M1 to M5, and the predicted outcomes are static traces.
- The real manifest, note, and registry blobs at the pin exist (`f5a55b3d…`, `f8a86143…`, `07f5d2e4…`). They were not evaluated; registry and note are other seats' scope.
- CRLF was checked only for the source. Manifest and note were not checked.

## Tooling

No installs or updates performed. git 2.56.0 was already present and used read-only.
