# ReviewPrefixHarm — tabi round-20 fresh falsification (w2)

Seat: `TabiR20.ReviewPrefixHarm` (leaf reviewer, no dispatch). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Baseline: `c49929430d996b016dde2e3a3a5be380f3433fdb`. Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782`.
Scope: appended SKILL/README/QUALITY/LOG/SCORECARD prefix preservation; unchanged protected files at baseline vs checkpoint.

Method: read-only. `git --no-pager diff/show/cat-file` (no gate, selftest, build or formatter), `sha256sum`, `head -c`, `wc`, `grep`/`read` on tracked working-tree files (tracked tree equals the checkpoint; only untracked wave files differ). One scratch file was created and removed (`/tmp/tabi_skill_tail.txt`).

## Verdict

- **Prefix preservation: PASS** for all five APPEND_ONLY files. Each baseline file is a byte-exact prefix of its checkpoint version, with zero deletions.
- **Protected and historical bytes: PASS.** No protected or historical path changed. The only new path in the protected globs is the new knowledge note (status A).
- **New harm found, two items, both documentation-level:** F1 (a phantom pin in the appended SKILL registry) and F3 (an inaccurate wording claim in README). No gate reads either string; the files themselves stay APPEND_ONLY-clean.
- **Pending obligation (F2):** a dangling citation and an explicit deferral. The final integration commit must close both, or they become real defects.
- **Not counted (inherited):** the USER gate's red state (round_count 6/10; lessonDrift and history refusal on round-18/19 lessons). This checkpoint changes no lesson bytes, so none of that is new.

## Findings (by severity)

### F1 — medium: phantom pin in appended SKILL registry (new in this checkpoint)

- Evidence: `SKILL.md:2243`, row "lifecycle documented-row counter / probe", column "Pinned values", includes `.ufo/waves/round-20/measurement-binding.json`.
- `test -e` → ABSENT at the checkpoint. No round-20 file references it: `measure-c1.mjs`, `selftest-c1.mjs`, `design.json`, `design-declared.json`, `integration.json`, `isolation-ledger.json`, `check-wave.mjs`, `run-checks.py`, `corpus/evidence/round-20/selftests/expected.json`, and `lifecycle-skill-section.txt` all have zero hits.
- Likely origin: copy of the registry pattern at `SKILL.md:2023` (round-18), where `.ufo/waves/round-18/measurement-binding.json` does exist (PRESENT). The round-20 path was not created.
- Harm: a documented pin names a nonexistent artifact. An auditor who follows the registry fails. No gate reads this path (the counter does not consume it), so this is documentation harm only.
- Fix: remove the path from the row before the single integration commit. The round-20 block is not in the baseline prefix, so in-round correction is within the APPEND_ONLY rule [INFERENCE from the prefix checks in `scripts/check-round-contract.mjs:25` and `scripts/check-user-round-contract.mjs:76`]. After the commit, use an appended errata block.

### F2 — medium, conditional: pending round-20 obligations at checkpoint

- (a) Dangling citation: `corpus/QUALITY.md:229-234` (criterion 50) cites `corpus/lessons/round-20.md#mistakes`. The file is ABSENT at 4ae9981 (`test -e`). The design intends one final write, so this is expected, but the criterion is unresolved until integration. Per the round-20 protected review (`w1/ReviewProtected.md`, F3), the lesson must be created in exactly one commit and never touched afterward.
- (b) Deferral: `LOG.md:1221-1222` says "Verification and final counts are recorded in the later round20 log entry, not asserted here." QUALITY 7 requires a round's aggregate to land in that round's LOG entry in the same integration commit, or be explicitly retired there with a reason. The deferral is compliant only if the later entry lands in that same final commit.
- Consequence if omitted: criterion 50 and the round-20 admission dangle, and the next round would be blocked under QUALITY 10.

### F3 — low: README wording contradicts the bytes it describes

- Evidence: `corpus/README.md:449-450`: "Correction index: S078's old empty-string wording is already superseded by S096; neither immutable row is rewritten."
- Bytes: `corpus/SOURCES.md:110` (S096) changed. Only the final used-by cell differs, gaining `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. Anchor, tier, status, opened and recheck cells are byte-identical. S078 is unchanged.
- Context: used-by mutability follows precedent (`LOG.md:662-663`: "S023/S024/S025 used-by gains only the new runtime note; immutable source cells/dates, tiers/statuses/cadences remain"). SOURCES is not in APPEND_ONLY, protectedPath, or the census (the census's 57 lines name none of SOURCES/QUALITY/README/SKILL/LOG/SCORECARD). The two-path used-by cell parses: `scripts/check-sources.mjs:329` splits on `/[,;]/`.
- Harm: literal inaccuracy only. The statement is true of the immutable cells, not the row.
- Fix wording: "immutable cells (anchor, tier, status, opened) unchanged; S096 used-by gained the round-20 note."

### F4 — info: the only non-append edit (SOURCES) enumerated

- `corpus/SOURCES.md`: line 110 (S096 used-by only), line 114 (new S100 row, inside `## Registry`, before `## Paths` at line 116), lines 150-151 (search-log bullet). numstat: +4 / −1.
- S100 is unique (`^| S100 ` count = 1; S101 absent). The knowledge note cites S100 14 times and S096 20 times, which satisfies the used-by citation rule as far as read.
- Under QUALITY 50 this is not an in-place anchor edit. The anchor cells are unchanged. Compliant.

## Verified clean

### Prefix preservation (baseline c4992943, and also HARD_BASELINE 7f506aff)

| File | Baseline bytes | Checkpoint prefix = baseline (sha256) | vs 7f506aff | Deleted lines | EOF / CR | Appended block |
|---|---|---|---|---|---|---|
| SKILL.md | 194427 | YES | YES (125194 B) | 0 | LF / 0 | line 2199 onward |
| LOG.md | 96276 | YES | YES (27002 B) | 0 | LF / 0 | line 1194 onward |
| SCORECARD.md | 75655 | YES | YES (27469 B) | 0 | LF / 0 | line 924 onward |
| corpus/README.md | 44318 | YES | YES (12085 B) | 0 | LF / 0 | line 436 onward |
| corpus/QUALITY.md | 19855 | YES | YES (329 B) | 0 | LF / 0 | row 50 at line 229 |

Method: `git show <base>:<f> | sha256sum` against `git show <ckpt>:<f> | head -c <base bytes> | sha256sum`.

### Changed-path census (base → checkpoint)

- 102 paths: 96 A and 6 M. No D, R, C or type changes. Mode bits 100755 appear only on new round-20 scripts.
- The six M paths: LOG.md, SCORECARD.md, SKILL.md, corpus/QUALITY.md, corpus/README.md, corpus/SOURCES.md.
- The protected-glob diff (`corpus/lessons`, `scripts`, `SHONEN.md`, `PROVINCE.md`, `corpus/evidence/pstack-20261015`, `corpus/evidence/fleet-round-1-freshness`, `reports`, `.ufo/rounds|plans|reports|continuation`, `.ufo/waves/round-18|19`, `corpus/knowledge`, `corpus/adjacency.tsv`) returns exactly one path: `A corpus/knowledge/webmcp-completion-lifecycle-round-20.md`.

### Protected blob identity (base = checkpoint)

- `scripts/check-round-contract.mjs` `8272d03f`; `scripts/check-user-round-contract.mjs` `9ebe3119`; `scripts/check-freshness.mjs` `987c3267`.
- `SHONEN.md` `9dcb2687`; `PROVINCE.md` `c2222b16`; `corpus/evidence/pstack-20261015/baseline-census.tsv` `672dba36`.
- Census sha256 `b9c8dc35…` equals `CENSUS_SHA256` at `scripts/check-round-contract.mjs:30`.
- ROUND script sha256 `1579a794…` equals `ROUND_SCRIPT_CURRENT_SHA256` at `scripts/check-user-round-contract.mjs:35`.
- USER script sha256 `568c0421…` appears at `SKILL.md:1938`.

### Appended-content structure

- SKILL LC table: 12 rows, each with 6 pipe fields (4 cells), so no pipe in cells.
- SKILL registry `--selftest` commands exist: `measure-c1.mjs:691`, `check-wave.mjs:303`.
- Body `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 `8c8d6796…`, which matches the S096 pin; 1740 lines.
- QUALITY criterion 50 is unique. S100 is unique. The README round-20 row names the new note.
- SCORECARD declared depth "8" matches the existing "8→8" rows. It is labelled a declaration, not a measurement (`SCORECARD.md:931-932`).

## Not counted, and why

- USER gate red state (round_count 6/10; lessonDrift on round-18/19; history refusal on `corpus/lessons/round-18.md` predicted in `w1/ReviewProtected.md` F1). Inherited. No lesson-path bytes changed in this checkpoint. I did not run the gate.

## Checks for main (after integration; not run here)

1. `test -e corpus/lessons/round-20.md` and confirm a `## Mistakes` heading resolves the `#mistakes` anchor in QUALITY criterion 50. The lesson and the final LOG entry must land in the same commit.
2. Fix or remove the `measurement-binding.json` path at `SKILL.md:2243` (F1). Confirm `.ufo/waves/round-20/measurement-binding.json` is not expected by anything.
3. Reword `corpus/README.md:449-450` (F3).
4. `git diff --name-only c49929430d996b016dde2e3a3a5be380f3433fdb <integration> -- corpus/lessons scripts SHONEN.md PROVINCE.md corpus/evidence/pstack-20261015` should show only the new round-20 lesson, if any.
5. Gate runs (ROUND, USER, freshness, SOURCES) are the main agent's; I have not run them.

## Residual risk and verification gaps

- No gate, selftest, or checker was executed. The check-sources used-by and duplicate-URL behaviour is inferred from source reading only.
- Semantics of the LC rows and the knowledge note are out of scope for this seat.
- Untracked, post-checkpoint artifacts in the wave directory were observed and not reviewed: `.ufo/waves/round-20/final-clones/` (ExecFixtures, ExecFrozen), `.ufo/waves/round-20/gate-conformance-handoff.md`, `.ufo/waves/round-20/w1/outcome.json`, `.ufo/waves/round-20/w2/`. None is in the checkpoint diff. Main must keep clones and handoff files out of the integration commit.

## Tooling

- Installs or updates: none.
- Scratch files: `/tmp/tabi_skill_tail.txt` created and removed.
