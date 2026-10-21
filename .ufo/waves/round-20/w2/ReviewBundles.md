# ReviewBundles — round-20 w2 (donor bundles, ledger paths, commit/base/author/path subsets, source provenance)

Reviewer: TabiR20.ReviewBundles (leaf reviewer; author-side, not external closure).
Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782` (parent/baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`).
Scope: read-only. No tests, selftests, builds, `evaluate` runs, subagents, or production or clone edits.

## Verdict

The four donor bundles verify, and their commit, base, author, and path claims are exact. The ledger and the checkpoint still do not describe the same state:

1. The three ScribeLifecycle files in the checkpoint differ from their bundle tips. Two of the 14 hunks are not itemized in `integration.json`.
2. A 54-line SKILL.md insertion is unrecorded anywhere. It is not a verbatim rendering of the reviewed skill section, and it cites a file that does not exist.
3. Seven second-generation writer commits sit in `final-clones/` outside both the ledger and the checkpoint. Their pins are not satisfied by any committed artifact.
4. The ledger's clone and branch references do not resolve.

S096 source provenance holds under a primary-source re-fetch today. One digest label is wrong.

## Findings

### F1 — High — ScribeLifecycle checkpoint bytes diverge from donor; custody exists only as prose

- Donor tip `900cf5c4` (ScribeLifecycle.bundle) vs checkpoint blobs:
  - `lifecycle-skill-section.txt`: `f7a33675807d` → `a7ac14f8b0d2`
  - `corpus/evidence/round-20/lifecycle/decisions.json`: `2efd5c31df05` → `f5a55b3d1b88`
  - `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`: `bc987d7a7460` → `f8a86143620b`
- The donor tip is not an ancestor of the checkpoint. None of the nine donor commit IDs exists in the lane object database (`git cat-file -t` fails for all nine). Lane history `c49929..4ae99816` is one commit. The checkpoint was written as file contents, not by replaying donor commits.
- The three files produce 14 hunks against donor. Mapped against `integration.json`:
  - Itemized: decisions round-key removal; LC05 outcome; LC09 condition and outcome; LC12 quote changed to the code literal; note heading (`## Decisions` → design heading); note design-span sentence; note caveat with S100 anchors; declared/current design.
  - Not itemized:
    - The table header `S096:START-END` → `Source anchor` in the skill section (hunk at line 5) and in the note (line 27).
    - The skill-section finite-sample caveat rewrite (skill line 20).
- Content is supported; the defect is custody. All 12 decisions' quotes are literal within their spans after whitespace normalization, and are at most 11 words. Spans and sourceIds equal `design.json` for all 12. The note's new claims check out against the retained source: early returns at lines 639, 647, 659, and 679 call no done callback, and `submitFromJavaScript` calls the done callback at line 841.
- The ledger's `bundleSha256` and `changedPaths` describe donor bytes, so any checkpoint-to-ledger check fails for these three paths.

Action: record checkpoint blob IDs and a per-hunk list in `integration.json`, or itemize the three unrecorded hunks.

### F2 — High — SKILL.md insertion is unrecorded, not a verbatim rendering, and cites a missing file

- `SKILL.md`: +54/−0 at line 2195 (append-only). Neither `integration.json` nor the ledger mentions SKILL.md.
- Against `lifecycle-skill-section.txt` (checkpoint revision, 28 non-blank lines), 13 are absent verbatim:
  - the opening scope sentence, including "Not runtime-observed; no universal guarantee of eventual completion or response";
  - the finite-sample caveat paragraph;
  - the nine-item "Finite failure checklist";
  - "Scope limits: one build; source-only; …".
  - The literal "Not runtime-observed" does not occur anywhere in the insertion.
- Verbatim: the header, the separator, and all 12 table rows (cell-equal to `decisions.json`).
- The insertion adds a new preamble and a "Registry — round 20" table that appear in no committed revision of the section.
- Dangling reference: the registry row's pinned values cite `.ufo/waves/round-20/measurement-binding.json`. That file is absent from both the checkpoint and the worktree, and `measure-c1.mjs` does not reference it.

Action: re-render SKILL.md from the reviewed section, or record the divergence and its reviewer. Create or remove the `measurement-binding.json` reference.

### F3 — High — Second-generation writer commits are outside the ledger and checkpoint, and depend on pins the checkpoint lacks

- Three clean clones under `.ufo/waves/round-20/final-clones/` hold seven commits on top of checkpoint `4ae99816`. All are authored and committed as `tabi-shokunin <tabi@shokunin.local>`.
  - ExecCounter, branch `round20/ExecCounterCanonical`, HEAD `d1a6f284`: commits `a9a8253`, `99647e5`, `d1a6f28`. Only `measure-c1.mjs` changed (sha256 `836cb5d4…`, 32872 bytes).
  - ExecFixtures, branch `round20/ExecFixturesOracle`, HEAD `cf0ffe20`: commits `7c98405`, `c6a029e`, `cf0ffe2`. `selftest-c1.mjs` (sha256 `037dd9f6…`) and `expected.json` (sha256 `c2edb746…`).
  - ExecFrozen, branch `round20/ExecFrozenConformance`, HEAD `52e46dee`: one commit. `check-wave.mjs` (sha256 `40fae8d2…`) and `wave-check-expected.json` (sha256 `2dc7c858…`).
  - Parents and digests match the three handoff files.
- No ScribeLifecycle second-generation clone exists. `isolation-ledger.json` lists none of the seven commits.
- Timing: w2 spec and dispatch were written 07:22:30 −03, after the checkpoint at 07:21:32 −03. The seven commits landed 07:29:33–07:41:40 −03, inside the wave window. The w2 context says production is frozen and no clones are created during this wave. The gate handoff calls the clone "L1-authorized"; the lane does not show whether that covers this wave.
- Coherence:
  - The second-generation counter pins `MANIFEST_SCOPE` = `source-only Chromium 154.0.8037.97; no new runtime observation in round 20` and a corrected heading `### Declarative WebMCP completion lifecycle — corrected source-scoped (round 20)`.
  - Committed artifacts carry neither. `decisions.json` (checkpoint) still says `…; not runtime-observed`. The note has only the original heading. `design.json` (pinned by `integration.json` as sha `1c9f536e…`) keeps the old scope and heading.
  - The second-generation selftest carries the new literal.
  - The second-generation counter and fixtures expect manifest and note content that no committed artifact has, and no second-generation ScribeLifecycle commit supplies.

Action: main must declare the canonical generation before falsification results are read against "checkpoint 4ae99816". Either add the seven commits to the ledger with ScribeLifecycle counterparts, or revert the pin change.

### F4 — Medium — Ledger clone and branch references do not resolve

- `isolation-ledger.json` `clone` fields and `design.json` `clones` point to `.ufo/waves/round-20/clones/<writer>`. That directory does not exist. At 10:17:25Z, `w1/return.json` listed those clones as untracked directories. Their removal is unrecorded.
- Ledger `branch` values `round20/<writer>` do not exist in the lane. `git branch --list 'round20/*'` is empty, and `git worktree list` shows only the lane. The refs survive only inside the bundles.
- Donor commits are unreachable from the lane, so the bundles are the only custody for them.

### F5 — Medium — Source-opening record digests the wrong object; first retrieval not captured

- `source-opened.base64.gz` is 25397 bytes, sha256 `46966f05…`. `source-opening.json` names this file as `rawRetainedPath`.
- Its `rawSha256` (`ff55d511…`) and `rawBytes` (91040) digest the gunzipped base64 text, not the retained file. The gzip file's own digest is recorded nowhere.
- `openingRecordedAt` is 09:52:32Z and refetch is 10:02:55Z. `before.json` (09:50:49Z) already lists the decoded source, so first retrieval predates 09:50:49Z. The JSON discloses that the initial retrieval time was not captured.

### F6 — Low — Forward and placeholder references

- `corpus/QUALITY.md` item 50 (+6 lines, no duplicate numbering across 50 items) cites `corpus/lessons/round-20.md#mistakes`. The lesson does not exist, and the round lesson is intentionally unwritten until final findings.
- SKILL.md registry rows pass the literal `REV` to `counts.mjs` and `lesson-history.mjs`. Both accept only a full 40-hex revision (exit 2 otherwise) and never reference `REV`. `measure-c1.mjs` does reference `REV`. The rows do not explain the placeholder.

## Verified, no finding

Bundles:
- `git bundle verify` passes for all four. Each has one head, `refs/heads/round20/<writer>`, equal to the ledger commit, with prerequisite `c49929…`.
- Working-tree and checkpoint-committed bundle sha256 values equal the ledger `bundleSha256`: `34934f84…`, `77ccf1ad…`, `da0c627f…`, `e9e11480…`.
- Commit chains equal the ledger identity tuples:
  - ExecCounter: `c1dc034b`, `33ebd05f`.
  - ExecFixtures: `7908955c`.
  - ExecFrozen: `ce92ca3c`.
  - ScribeLifecycle: `a912b64f`, `fdf9e149`, `2f86841f`, `b9028815`, `900cf5c4`.
  - All author and committer identities are `tabi-shokunin <tabi@shokunin.local>`.
- Cumulative base-to-head path sets equal `assignedPaths` (= `changedPaths`) for all four writers.
- Checkpoint blobs for the five ExecCounter, ExecFixtures, and ExecFrozen paths are byte-identical to donor tips.

Checkpoint vs baseline:
- 96 added and 6 modified paths. Modified: LOG.md (+30), SCORECARD.md (+12), SKILL.md (+54), corpus/QUALITY.md (+6), corpus/README.md (+18), corpus/SOURCES.md (+4/−1). No historical lesson or knowledge file changed.
- The one deletion in SOURCES.md is the S096 row's used-by cell, which appends the lifecycle-note path. This is documented in `integration.json`.
- Tracked worktree is clean against HEAD (`4ae99816`).
- Ordering (UTC): return snapshot 10:17:25Z < ledger import 10:17:47Z < checkpoint 10:21:32Z < w2 dispatch 10:22:30Z.
- `design.json` sha `1c9f536e…` and `design-declared.json` sha `37fa4eab…` equal `integration.json`. The declared-to-current diff changes only LC11 (sourceId S100 added) and LC12 (topic amended); spans are unchanged.

Source provenance:
- Tag `154.0.8037.97` resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (Gitiles JSON), matching the S096 and S100 rows.
- Re-fetch of the Gitiles TEXT URL, performed today: 91040 bytes, raw sha256 `ff55d511…`. Decoded: 68278 bytes, sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. This equals the retained source, the manifest `source.sha256`, and the S096 and S100 rows.
- All 12 decision spans lie inside S096's registered anchors (174–328, 818–842), except LC11 (787–815), which lies inside S100's anchor (635–842).

## Verification gaps

- No tests, selftests, `evaluate` runs, or builds were run (none assigned). Second-generation counter and fixture behavior is untested.
- Source checks are literal and line-range checks only. Decision correctness is outside this scope.
- Donor commit identities were verified from bundles only, since the objects are absent from the lane.
- Re-fetch was one HTTPS request to Gitiles today. It proves byte stability, not publisher authenticity.

## Process notes

- Tools installed or updated: none. Used the existing `git`, `curl`, `sha256sum`, `base64`, `gunzip`, and Python standard library.
- `git status` ran in the lane and in the three final clones. It may refresh index stat caches. No staging, commits, refs, or content changed. Not repeated.
- The temporary bare sandbox (alternates to the lane object database, bundle refs under `refs/bk/`) was created in `/tmp` and removed. No lane refs or index entries were created. No subagents were dispatched.
