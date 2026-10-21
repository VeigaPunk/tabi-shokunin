# ReviewRegistryCommands — round 20 SKILL Registry audit

Scope: SKILL.md `### Registry — round 20` (lines 2239–2251) audited against the producer CLIs and frozen inputs in `.ufo/waves/round-20/`. Revision audited: `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Author-side finding only; not external closure.

Method (read-only): read SKILL.md, `measure-c1.mjs` (full), `selftest-c1.mjs` (IO, main, loadExpected), `check-wave.mjs` (full), `counts.mjs`, `lesson-history.mjs`, `expected.json`, `wave-check-expected.json`, `decisions.json`, the C1 note, `corpus/SOURCES.md` `## Registry`, `QUALITY.md` 22/26/30/37. Read-only git (`cat-file`, `rev-parse`, `ls-tree`, `diff --quiet`), `sha256sum`, `jq` (`~/.local/bin/jq`, pre-existing, no install) and `diff`. **No producer was executed** (no `--selftest`, no REV run, no `check-wave`). Pass/fail outcomes are untested here and belong to the main serial verification.

## Verified consistent (no action)

| Check | Result |
|---|---|
| C1 entry `node .ufo/waves/round-20/measure-c1.mjs REV` | matches CLI; `REV_PATTERN` accepts symbolic revs; exit 0/1/2 map matches `main`/`evaluate` |
| C1 self-test `measure-c1.mjs --selftest` | matches; child exit propagated; `selftest_unavailable` → exit 2 |
| Wave gate `check-wave.mjs --spec --registry --snapshot` and `--selftest` | flags match `parseInputFlags`; exit 0/1/2 match `runCheck`/`selfTest`; selftest writes only `mkdtemp` fixtures and removes them |
| Wave gate inputs `w1/spec.json`, `w1/swarm-registry.json`, `w1/return.json`, `corpus/evidence/round-20/wave-check-expected.json` | present and committed at 4ae9981 |
| C1 pinned `corpus/evidence/round-20/selftests/expected.json` | present, committed |
| Source identity | `corpus/evidence/round-20/sources/html_form_element.cc` sha256 `8c8d6796…6916` = pin in design, selftest and manifest |
| design.json | sha256 `1c9f536e…a7a1da` = the value the selftest header cites |
| Spans LC01–LC12 | identical in design.json, `PINNED_DECISIONS` and `decisions.json` |
| Manifest-rendered rows | `jq`-rendered rows from `decisions.json` are byte-identical to the 12 note rows (`knowledge/webmcp-completion-lifecycle-round-20.md`) and to the 12 SKILL rows (SKILL.md:2217–2228) |
| Staged SKILL section | `.ufo/waves/round-20/lifecycle-skill-section.txt` LC rows = SKILL.md LC rows |
| Counted C1 inputs | `decisions.json`, the note, `SOURCES.md`, and the source are all committed at 4ae9981, and their worktree bytes equal HEAD |
| S096/S100 registry anchors | `SOURCES.md` S096 and S100 rows (lines 110, 114) carry the pinned URL, `decoded sha256 8c8d…6916`, `mined`, and the note in used-by |
| `counts.mjs` status/tier columns | indices 4 and 8 match the header `tier`, `status`; 100 `S###` rows, all inside `## Registry` (lines 11–116) |
| `counts.mjs` producer digest | sha256 `fec9a31e…df79` = `producerSha256` in `.ufo/waves/round-20/counts-before.json` (unchanged producer) |
| `lesson-history.mjs` pins | `7f506af` and `92d700d` both resolve as commits |
| Round-20 selftests write files | none (`selftest-c1.mjs` has no `writeFile`; `check-wave` writes only to `tmpdir`) |

## Findings

### F1 — Pinned value names a file that does not exist (high; frozen-input promise missing)

- SKILL.md:2243 (C1 row, "Pinned values") promises `.ufo/waves/round-20/measurement-binding.json`.
- The file is absent from the worktree and is not in the 4ae9981 tree (`git ls-tree` empty). `w1/ScoutRegistryHome.md` already recorded the binding manifest as absent and blocking; QUALITY 22 requires a `--reproduce` binding for a counted claim.
- Fix before admission: produce the binding and keep the cell, or remove the path from the cell. Do not leave a promised file that the repo does not contain.

### F2 — No committed receipt is promised for any run claim (high; QUALITY 26 / 30 / 37)

- QUALITY 26 requires a committed receipt for any "count/verdict/exit at REV" claim, with argv, producer digest, revision and exit. QUALITY 37 requires a committed self-test receipt under `corpus/evidence/` with argv, exit, stdout and producer identity.
- The round-20 registry names commands and verdict maps only. `corpus/evidence/round-20/` contains `lifecycle/decisions.json`, `selftests/expected.json`, `sources/` and `wave-check-expected.json`, and no receipt. The C1 count 12, the C1 selftest, and the wave-gate selftest therefore have no committed receipt promised or present.
- `.ufo/waves/round-20/run-checks.py` is the apparent receipt producer (argv `FULL_REV NEW_OUTPUT_JSON`), but the registry does not name its output or where it is committed.

### F3 — Producer digests are not pinned (medium; QUALITY 30)

- QUALITY 30 requires receipts to record the sha256 of the producer; the registry's "Pinned values" cells record none for the five producers. Current sha256 at 4ae9981 (worktree equals HEAD):
  - `measure-c1.mjs` `fab3bde4cc800dbb…`
  - `selftest-c1.mjs` `5804cf6a73a497bf…`
  - `check-wave.mjs` `c073c2459266f3df…`
  - `counts.mjs` `fec9a31eadbed3b4…`
  - `lesson-history.mjs` `a8dade2deed3eab7…`
- Frozen inputs: `decisions.json` `da42e495…`, note `3ac83d0a…`, `SOURCES.md` `efbce1ea…`, `expected.json` `458a9f3f…`, `wave-check-expected.json` `963762a7…`.
- Prefix-only, for reference. Full digests come from `sha256sum` on the files at the revision being cited.

### F4 — The REV placeholder is wrong for two of the four rows (medium)

- `counts.mjs` (line 4) and `lesson-history.mjs` (line 5) reject anything except a full 40-hex revision (`full revision required`, exit 2). `measure-c1.mjs` accepts any git rev token and resolves it to `^{commit}`.
- SKILL.md:2245–2246 write `REV` for all three without saying so. Use `<40-hex>` for `counts.mjs` and `lesson-history.mjs`; `counts-before.json` already records a full-hex argv.

### F5 — The C1 self-test read scope and REV binding are misdescribed (medium)

- Registry write scope: "git blobs/stdout only; selftest in-memory fixtures." Writes: correct, none. Reads: `selftest-c1.mjs` `loadBlob()` reads the working-tree copy of `corpus/evidence/round-20/sources/html_form_element.cc`, and `loadExpected()` reads the working-tree `expected.json`. Only `measure-c1.mjs` reads git blobs.
- So `--selftest` does not bind to REV, and the registry should say "reads working-tree source/expected; no REV binding."
- The `design` object persisted in `expected.json` (`sha256 1c9f536e…`) is never read by `loadExpected` (no `doc.design` use; only comments mention it). The pin is decorative. Either check it or drop it.

### F6 — Selftest asserts 20 of 24 finding ids (low; coverage gap, not a registry lie)

- `FINDING` in `measure-c1.mjs` has 24 ids. `expected.json` `reasons` persists 20. The four absent are `decision_shape`, `decision_text_invalid`, `decision_unknown_id`, and `table_heading_duplicate`; none appear in any selftest case.
- The `expected_vocabulary_unexercised` rule makes the persisted list self-consistent, so these four are simply unasserted.
- Also: `selftest-c1.mjs` builds its fixtures from its own `DECISIONS` constant. Its LC01 condition text differs from the committed `decisions.json`. The selftest therefore never exercises the committed bytes; only a REV run does. The registry does not claim otherwise, but "self-test" should not be read as covering committed text.

### F7 — Pinned values omit inputs and pins the row needs (low)

- C1 row: lists `expected.json`, source, S096/S100, and the missing binding, but not the four counted blobs `measure-c1.mjs` actually reads at REV: `decisions.json`, the note, `SOURCES.md`, and the source path.
- Lesson row: says "frozen USER lessonDrift predicate at baseline" but does not name the hard-coded baseline `7f506af` and pin `92d700d`. Also `refused` is data, not exit: the script exits 0 even when `refused` is non-empty. State that in the cell.
- C1 verdicts: `measure-c1` emits `baseline` (exit 0, count 0) and `clean` (exit 0, count 12) as separate `verdict` values. The registry's "0 evaluated count" collapses them; the producer header says "Admit a count only with exit 0 (clean: 12 rows)." Name the admission condition.

### F8 — Counter scope (informational)

- `counts.mjs` counts every `| S###` line in the file, not only `## Registry`. SKILL.md:1627 says the sources gate rejects rows outside `## Registry` (`row_outside_registry`). Today all 100 rows are inside Registry, so there is no present drift; the counter simply does not enforce the same rule.

## Not tested here

- Exit codes and verdicts of every round-20 command at 4ae99816 (not executed).
- Whether `measurement-binding.json` should exist before admission; that is the binding reviewer's question. This report only records that the registry promises it and it is absent.
- Contents of `run-checks.py` output, and whether a receipt has been committed elsewhere after 4ae9981.

## Installs / updates

None. `jq` at `~/.local/bin/jq` was used read-only and was already present.

Report: .ufo/waves/round-20/w2/ReviewRegistryCommands.md
