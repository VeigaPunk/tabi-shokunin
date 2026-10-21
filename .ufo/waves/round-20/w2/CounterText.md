# CounterText: round-20 C1 selftest coverage, row-cell injection, expected-pair audit

Seat: TabiR20.CounterText (leaf, author-side; not external closure).
Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Target files show no diff against it.

| File | sha256 (checkpoint) |
|---|---|
| `.ufo/waves/round-20/measure-c1.mjs` | `fab3bde4cc800dbbde9d9dcefb1d04c51a2459e0513312858ff42339ddfa80a6` |
| `.ufo/waves/round-20/selftest-c1.mjs` | `5804cf6a73a497bfbaf3c6265a7b1852760f6b52d930de4af7ba7674543544a5` |
| `corpus/evidence/round-20/selftests/expected.json` | `458a9f3f…744d1` (full: `458a9f3fa069936d0f3e13a4200b122dc9926d787f3d6e068625ff0e9fb744d1`) |

Method: static trace of producer and runner logic, with each of the 34 persisted pairs re-derived by hand. Read-only commands only (git show/diff, sha256sum, grep, read). No code executed, no tests, no builds, no installs. Predicted outcomes are marked **[traced]**. None was executed.

## Summary

| ID | Severity | Finding |
|---|---|---|
| F1 | High | 4 of 34 persisted expected pairs disagree with the checkpoint producer. Selftest predicted to fail. |
| F2 | High | `decision_text_invalid` has no case. Pipe, CR and LF refusal is unpinned. |
| F3 | High | U+2028, U+2029, U+0085, VT, FF and NUL are admitted in condition/outcome. Red case fails today. |
| F4 | Medium | `decision_shape` has no case. The fixture builder cannot express `null` entries. |
| F5 | Medium | Coverage check is one-directional. 4 of 24 finding ids can regress silently. |
| F6 | Medium | Rows inside a fenced block or multi-line HTML comment satisfy the table check. Red case fails today. |
| F7 | Low | Other schema holes (manifest keys and sha, registry duplicates, ranges absent, backlink positive path, quote boundary). |

## F1. Four persisted expected pairs disagree with the producer [traced]

| Case | Persisted findings | Traced findings | Delta |
|---|---|---|---|
| `wrong_source_id` | decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch | remove registry_backlink_missing |
| `wrong_decision_source_override` (LC11 sourceId S099) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch | remove decision_anchor_uncovered, registry_backlink_missing |
| `missing_decision_source_override` (LC11 sourceId removed) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | remove registry_backlink_missing |
| `forced_s096_lc11` | same as previous row | decision_anchor_uncovered, decision_source_mismatch | remove registry_backlink_missing |

The other 30 persisted pairs match the trace (count, exit and every finding).

Why the four differ:

- **Backlink.** `evaluateComplete` (measure-c1.mjs:530-554) emits `registry_backlink_missing` only if the note text lacks the token `S096` or `S100`, or a pinned registry row's used-by lacks the note. Every fixture note carries the intro `Sources: S096 …; S100 …`, and both used-by lists name the note. Nothing emits it in these four.
- **Anchor for S099.** `checkDecisionAnchor` (measure-c1.mjs:376-386) returns silently when no registry row matches the cited id. Its comment says a missing row "is reported by the registry checks, not here". The registry checks cover only S096 and S100. So S099 yields only decision_source_mismatch.
- **Internally inconsistent.** `wrong_source_id` (manifest default S097, no row) expects no anchor finding, while `wrong_decision_source_override` (S099, no row) expects one. No single backlink rule reproduces all 34 pairs:
  - The note-level rule the producer implements (ExecCounter rule 8) fails the four cases.
  - The row-level rule (each of S096 and S100 cited by at least one table row) fits the four and every other case, but fails `manifest_malformed_json`, whose zero-row note expects no backlink.
- **Provenance.** These are predictions, not executed results. ExecCounter.md:63-78 lists them, with "Nothing was executed" (line 4) and "Verification status: Untested" (line 96). Its original prediction for `manifest_malformed_json` was `[manifest_malformed, registry_backlink_missing]` (line 76), which is the row-level rule. ExecFixtures copied the predictions and marked them "Confirmed" against ExecCounter's predictions and the spec. It says it never opened `measure-c1.mjs` (w1/ExecFixtures-return.txt:27-35). It changed `manifest_malformed_json` to the note-level rule and kept the row-level prediction for the four above.

Predicted effect: `node .ufo/waves/round-20/measure-c1.mjs --selftest` prints four `FAIL_DETAIL` lines and `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20`, exit 1. `run-checks.py:62-64` runs that command with `expectedExit 0`, so the round gate would fail.

Options (lead decides):

- **A. Minimal. Producer unchanged; matches its comments and ExecCounter rule 8.** Set the four pairs to the traced findings:
  - `wrong_source_id` → `[decision_source_mismatch, source_mismatch]`
  - `wrong_decision_source_override` → `[decision_source_mismatch]`
  - `missing_decision_source_override` → `[decision_anchor_uncovered, decision_source_mismatch]`
  - `forced_s096_lc11` → `[decision_anchor_uncovered, decision_source_mismatch]`
  
  State the missing-row rule in the producer comment.
- **B. Row-level.** Add a per-row citation check to the producer. Restore `manifest_malformed_json` to `[manifest_malformed, registry_backlink_missing]`. Decide whether a cited id with no registry row is `decision_anchor_uncovered`; that also changes `wrong_source_id`. More edits than A.

## F2. `decision_text_invalid` is never exercised [traced]

The producer's `checkDecision` (measure-c1.mjs:322-371) refuses condition or outcome that is empty after trim, or contains `|`, CR or LF.

- Coverage: 0 of 34 cases. The reason is absent from the 20-reason persisted vocabulary.
- Why this is the only detector: fixture rows and expected rows are both rendered from the same manifest text (`renderNote` selftest-c1.mjs:199-218; `renderRow` measure-c1.mjs:274-277). A pipe, CR or LF in a manifest cell matches its own note row, so `checkTable` cannot see it. Only `decision_text_invalid` catches it.
- Consequence: deleting the refusal, or narrowing it to `\n`, leaves all 34 cases passing. A pipe-bearing manifest with a matching note is then admitted (exit 0, count 12), and the rendered skill table gets five-cell rows.
- Note-only injection is caught by `checkTable`, because the note row then differs from the manifest-rendered row.
- Real corpus: all 12 real LC rows match `^\| LC\d\d \| [^|]+ \| [^|]+ \| S(096|100):\d+-\d+ \|$` (grep, 12/12). The manifest contains no `|`. Latent, not live.

## F3. Line separators and other controls are admitted [traced]

`checkDecision` refuses only `|`, CR and LF. Other characters survive `lineList` (which splits on `\n` only), so the row still matches its expected form:

- U+2028, U+2029, U+0085, U+000B (VT), U+000C (FF), U+0000 (NUL) and other C0 controls.

These are not row-breaking for this producer. They are line terminators for other consumers:

- JS `.` and multiline `$` stop at U+2028 and U+2029.
- Python `str.splitlines()` also splits on VT, FF, U+0085 and U+001C–U+001E.

The repo already has this defect class. `.ufo/waves/round-14/w1/RoundFixtures.md:21-24` (F3, with H22–H23 rows) records a gate that displayed a full line while executing only the prefix. `measure-c1.mjs` and `selftest-c1.mjs`, read in full, use `split('\n')` and apply no `.` or `$` to row text, so this is latent for any future gate that reads the note.

Recommended: widen the condition/outcome refusal to `/[|\p{Cc}\u2028\u2029\u0085]/u`, and add X07–X08 (they fail today).

## F4. `decision_shape` is never exercised [traced]

`checkDecision` emits `decision_shape` for:

- a non-object entry;
- a key set that is not exactly the six required keys plus optional `sourceId` (`decisionKeysValid`, measure-c1.mjs:172-176);
- a non-string `id`, `sourceId` (when present), `condition`, `outcome` or `quote`;
- non-safe-integer `startLine` or `endLine`.

None of the 34 cases mutates any of these. Removing any branch leaves the selftest clean.

Builder limitation: `renderNote` dereferences `decision.id` in its filter, so a `null` entry throws `TypeError` inside `buildFiles`. `main` wraps that as `fixture_build_<case>`, which exits 2 for the whole runner. A null-entry case needs a null-safe builder (X15).

## F5. Coverage check is one-directional [traced]

`loadExpected` checks `reasons ⊆ FINDING_IDS` (`vocabulary.some(r => !registered.has(r))`) and that the case union equals the vocabulary. It never checks `FINDING_IDS ⊆ exercised`.

Unexercised ids (4 of 24): `decision_shape`, `decision_text_invalid`, `decision_unknown_id`, `table_heading_duplicate`. `table_row_extra` is exercised only as a side effect of `override_table_mismatch`.

Recommended: fault when the persisted vocabulary differs from `FINDING_IDS`, unless an explicit, justified unexercised list is present. Add cases for the four ids (X09–X19).

## F6. Rows inside a fence or multi-line comment pass the table check [traced]

`checkTable` counts any line matching `^\|\s*LC\d{2}\s*\|` under the heading (measure-c1.mjs:408-453). It is blind to fences and HTML comments. A note whose only correct 12 rows sit inside a ``` fence, or inside a multi-line `<!-- … -->`, yields exit 0 and count 12. A single-line `<!-- | LC01 … -->` is caught, because the line starts with `<`.

Real note: no ``` and no `<!--` (grep). Latent.
Red case X27 expects `[table_row_missing]` and fails today.

## F7. Other finite-schema holes [traced unless noted]

- Manifest top-level extra key → `manifest_shape` is untested (X21).
- Manifest `decisions` not an array → `manifest_shape` is untested (X22).
- `source.sha256` mismatch → `source_mismatch` is untested (X23). `sourceRecordMatches` checks it, but no case sets it.
- Registry S096: status, URL, digest and duplicate row are untested. Only S100 variants exist (X24, X26).
- Registry anchor with no `html_form_element.cc` ranges: `checkContractRow` accepts it, because `declaredRanges` returns `[]`, not `null`. The result is `decision_anchor_uncovered` per decision. Its comment says the row needs a "parseable … range list" and would give `registry_row_invalid`. This is a doc/code mismatch. ExecCounter rule 5 says a row declaring no ranges "covers nothing". Pin one and add X25.
- Note-level backlink has no positive case: the Sources line is always present. X20 supplies one.
- Quote boundary: 26 words is covered, 25 words (accepted) is not. X28 is a negative control.
- Runtime wording is tested for `outcome` only, not `condition`.
- Duplicate JSON keys are accepted (`JSON.parse` keeps the last). A contract question, not a fixture gap.
- `expected.json.design.sha256` (1c9f536e…) and the selftest header are never read by the runner. `design.json` currently hashes to 1c9f536e… (verified), so this is informational.
- The selftest reads the retained blob from the working tree, not from a revision. The content sha is pinned (drift exits 2), so only the revision binding is missing.

## Verified, no defect found

- Pins are byte-identical across `measure-c1.mjs:69-70`, `selftest-c1.mjs:45-46`, `expected.json:11-12`, `design.json:18-19` and `:128-129`, and `decisions.json:6-7` (grep). Registry S096 and S100 source URL and decoded sha match (`SOURCES.md:110`, `:114`, read).
- Blob: sha256 `8c8d…6916`, 0 CR bytes, 1740 LF lines. Matches the QuoteLC08 record.
- All 12 quotes are literal substrings of their pinned spans (read `html_form_element.cc` 181–330 and 787–830). The LC09 26-word quote is taken from lines 298–319.
- Spans match `design.json` (12 pairs). LC11 cites S100 in design, manifest and fixture.
- The producer hash `fab3bde4…` equals ExecCounter v3 (`measure-c1.mjs`, checkpoint). The selftest and expected hashes match the table above.
- Metric invariant, by inspection: exit 0 requires every pinned id exactly once and no other entry, so count = 12.
- Real corpus, static spot-check only (not a gate run):
  - 12 LC rows, four cells each. No pipe, CR, LF, fence, comment or line separator in the note, manifest or SOURCES.md.
  - S096 ranges `174-328,729-758,818-842` cover LC01–LC10 and LC12. S100 ranges `174-328,635-842` cover LC11. Both rows are `mined`. S100 teaches opens `supersedes S096 —`. Both used-by cells name the note.
  - Note heading (line 25) equals `TABLE_HEADING`. `## Registry` (SOURCES.md:11) and the header row match exactly.
  - Predicted main gate: clean, exit 0, count 12. Authoritative result is main's run.

## Red-case list

Each row gives the fixture mutation, the expected `count / exit / findings`, and the producer result today (traced).

| ID | Mutation | Expected | Today |
|---|---|---|---|
| X01 | LC01 condition += ` \| x` | 12 / 1 / [decision_text_invalid] | pass |
| X02 | LC02 outcome += ` \| x` | 12 / 1 / [decision_text_invalid] | pass |
| X03 | LC03 outcome contains CR mid-text | 12 / 1 / [decision_text_invalid] | pass |
| X04 | LC04 condition contains LF (builder splits the row) | 12 / 1 / [decision_text_invalid, table_row_extra, table_row_missing] | pass |
| X05 | LC06 condition = `"   "` | 12 / 1 / [decision_text_invalid] | pass |
| X06 | LC07 outcome = `""` | 12 / 1 / [decision_text_invalid] | pass |
| X07 | LC08 outcome contains U+2028 | 12 / 1 / [decision_text_invalid] | **fails: traced exit 0** |
| X08 | LC09 condition contains U+0085 or U+000B | 12 / 1 / [decision_text_invalid] | **fails: traced exit 0** |
| X09 | LC05 extra key `"note"` | 12 / 1 / [decision_shape] | pass |
| X10 | LC05 without `quote` | 12 / 1 / [decision_shape] | pass |
| X11 | LC05 `id` = 5 | 12 / 1 / [decision_missing, decision_shape] | pass |
| X12 | LC05 `condition` = 5 | 12 / 1 / [decision_shape, table_row_extra] | pass |
| X13 | LC03 `startLine` = `"249"` | 12 / 1 / [decision_shape, table_row_extra] | pass |
| X14 | LC11 `sourceId` = null | 12 / 1 / [decision_shape, table_row_extra] | pass |
| X15 | `decisions[4]` = null (needs null-safe `renderNote`) | 12 / 1 / [decision_missing, decision_shape] | pass once builder fixed |
| X16 | 13th entry `id` = `LC13`, no note row | 13 / 1 / [decision_unknown_id] | pass |
| X17 | Heading repeated after the table | 12 / 1 / [table_heading_duplicate] | pass |
| X18 | Heading removed | 12 / 1 / [table_row_extra, table_row_missing] | pass |
| X19 | Copy of LC01 row after `## Notes` | 12 / 1 / [table_row_extra] | pass |
| X20 | Intro Sources line removed; LC11 row says S096; manifest `sourceId` S100 | 12 / 1 / [registry_backlink_missing, table_row_extra, table_row_missing] | pass |
| X21 | Manifest extra top-level key | 12 / 1 / [manifest_shape] | pass |
| X22 | Manifest `decisions` = `{}` | 0 / 1 / [manifest_shape] | pass |
| X23 | Manifest `source.sha256` = 64 zeros | 12 / 1 / [source_mismatch] | pass |
| X24 | Duplicate S096 registry row | 12 / 1 / [registry_row_invalid] | pass |
| X25 | S096 anchor without `html_form_element.cc` ranges | 12 / 1 / [decision_anchor_uncovered] | pass as coded; settle F7 first |
| X26 | S096 status = `queued` | 12 / 1 / [registry_status_invalid] | pass |
| X27 | The 12 rows only inside a ``` fence under the heading | 12 / 1 / [table_row_missing] | **fails: traced exit 0** |
| X28 | LC09 quote = first 25 tokens of lines 298–319 | 12 / 0 / [] | pass (negative control) |

## Recommended integration actions (not applied)

1. Choose option A or B from F1. Apply it to all four pairs and to `manifest_malformed_json` together.
2. Runner: make coverage bidirectional (F5).
3. Producer: widen the text refusal (F3). Add fence and comment awareness, or refuse them explicitly (F6). Adding a finding id is a contract change.
4. Builder: make `renderNote` null-safe (F4).
5. Add X01–X28 as red cases. Main reruns the selftest and the measure gates once after integration.

## Verification status

Static trace only. Nothing was executed. Predicted outcomes are marked **[traced]**. Main should run `node .ufo/waves/round-20/measure-c1.mjs --selftest` once. Predicted: four `FAIL_DETAIL` lines, `verdict=failed cases=34 reasons=20`. Run the red cases after they are added.

## Scope and tooling

- No production edits, clones, lesson or knowledge writes. Only this report was written.
- Claims unchanged: C1 target is 12 documented source-only rows; scalar stays 8; no capability or domain coverage claim.
- Mechanical checks say nothing about LC row semantic truth, depth, or runtime behaviour.
- Installs or updates: none.
- Findings are author-side, not external closure.

Report: .ufo/waves/round-20/w2/CounterText.md
