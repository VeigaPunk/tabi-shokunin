# Review C1 contract — round 19 W1

**Verdict: revise before crediting C1.** The rule has a good fixed-day gate and explicit producer/runtime pins, and the candidate counter uses revision-blob reads under a substantially isolated Git environment. Two evidence gaps remain material: criterion (c) is not objectively bounded or enforced, and `pass: true` is trusted without binding the receipt cases to committed case/fixture bytes or re-deriving the pass predicate. Revision validation also falls short of the round-18 commit-resolution pattern.

## Findings (severity order)

### High — (c) source provenance is undefined and the candidate counter does not validate it

PLAN C1 says a counted row cites an S-row “whose `opened` is 2026-10-21 and whose source is a Chromium 154.0.8037.97-tag file (or other primary source) with line anchor” (PLAN.md:23-24). “Other primary source” has no defined class/allowlist, and the counter does not inspect a source URL or source kind at all. In the candidate `measure-c1.mjs`, `parseSources` retains only `id`, `opened`, and `anchor` (lines 138-163); `sourceRejection` accepts an ID once its date is exact and its anchor non-placeholder (lines 174-199). It therefore cannot distinguish a pinned Chromium tag file from an unrelated/non-primary URL, nor reject a `queued`/`rejected` row. Its own executor report acknowledges it “does not independently classify source provenance beyond those fields.”

**Required tightening:** define the accepted primary-source classes deterministically (prefer an explicit Chromium Gitiles URL form pinned to `refs/tags/154.0.8037.97`; enumerate any alternatives), parse and validate `source` and status from `SOURCES.md`, and bind the SKILL citation to the case file's `source.file` / `source.lines` / `source.url`. Add negative counter fixtures for wrong tag, non-primary source, rejected/queued row, and citation mismatch. A non-empty anchor alone is not evidence of an anchored source.

The exact opened-day check is useful: candidate code compares `opened === '2026-10-21'` (lines 189-190). I read the B snapshot of `corpus/SOURCES.md`; there are zero rows with that date (snapshot SHA below), so no baseline collision was observed. Still, make “new rows S077+” explicit by checking the cited S-row is absent at B (or explicitly enforce the intended ID range) rather than relying only on a date convention.

### High — `pass: true` is self-attested; receipt inputs and fixture are not revision-bound by the counter

The counter indexes case IDs from `receipt.cases`, checks a boolean `pass`, and checks only that `observed` has a string `status` and an `errorText` property (candidate lines 242-269, 324-349). It does not compare `expected` with the committed case file, recompute `pass` from the observed status/error, submit count, fields, and schema, or verify the receipt's `casesFilesSha256` map. It never reads `cases/<family>.json` or `fixtures/<family>.html` (count path, lines 296-313). Thus a hand-edited committed receipt can claim `pass: true` and plausible status/error fields for an ID without those values being the run of the committed case/fixture. Pinning the producer digest proves which producer blob is named; it does not prove the receipt was emitted by that program.

This is especially material because the contract already gives the counter the needed cross-reference: the receipt includes a `cases-file sha256 map` and each case has `{id, family, input, expected, observed, pass}` (PLAN.md:117-119). The fixture bytes affect the observation but have no digest in the receipt schema (PLAN.md:105-109, 117-119).

**Required tightening:** at REV, verify the receipt's case-file digest map against the regular blobs for all referenced family files; require each receipt case's `id`, `family`, `input`, and `expected` to match its case-file entry; add a committed fixture digest map and validate it too; recompute the complete pass predicate from expected/observed and reject mismatches. Validate the receipt and referenced files as regular tree blobs (round-18 precedent), not merely bytes returned by `git show`. Keep the claim honest that a committed receipt plus pinned producer is reproducible evidence, not cryptographic proof that the process ran; the runtime transcript remains a producer assertion unless separately attested.

### Medium — candidate revision check does not establish that REV is a commit

The candidate counter accepts any syntactically full 40- or 64-hex object ID (lines 280-283), then reads `REV:path` with `git show` (lines 59-70). It does not resolve `REV^{commit}`. A tree object ID with the expected paths can therefore be used as the counted revision, even though the counter contract is described as evaluating a revision/committed receipt. Round 18 canonicalizes with `git rev-parse --verify --end-of-options "${rev}^{commit}"` and checks the returned full object ID (measure-c1.mjs:119-124).

**Required tightening:** resolve and validate `REV` as a commit with the round-18 pattern before any reads; report/use the canonical commit ID. This also makes the meaning of the `REV` argument unambiguous.

### Medium — uniqueness is not stated in the rule, and candidate's claimed one-case/one-row rule is only partial

Criterion (b) requires “≥1 case id” but does not require distinct evidence IDs per decision row. That permits a literal implementation to credit one passing case to many rows. The candidate attempts to prevent reuse, and its report says a case can credit at most one row, but the code rejects only when **all** passing IDs on a row were previously used (`passingCaseIds.every(...)`, lines 331-340). After a first row uses A, a later row listing A and fresh B passes; A is still returned in that second row's `passing_case_ids`. The retained self-test tests only the pure duplicate-A shape (lines 491-496), not mixed reused-plus-fresh IDs.

**Required clarification:** decide whether C1 counts rows or independent case evidence. If independence is part of the claim, require each accepted row to have a newly credited case ID and report distinct-case coverage; if a case may support multiple rows, remove the one-case/one-row claim and state the intended mapping. Add a mixed reuse fixture to match the selected rule. The current check still requires at least one fresh case per additional accepted row, so this is an evidence-linkage/invariant mismatch, not proof that the present counter can reach 12 rows from one case alone.

### Low — replacement-object defense exists, but its regression test is missing

The candidate's `isolatedGitEnv` is a good fit for the round-18 pattern: it clears ambient Git configuration, sets `GIT_NO_REPLACE_OBJECTS=1`, `GIT_GRAFT_FILE=/dev/null`, `GIT_NO_LAZY_FETCH=1`, and filters PATH to absolute entries (candidate lines 32-50); `showBlob` disables external diff/textconv (lines 59-70). Its self-test also injects hostile `GIT_DIR`/`GIT_WORK_TREE` and config variables (lines 450-465). However, its 12-case retained test inventory has no replace-ref poisoning case (candidate lines 477-498; retained `selftests/c1.json`, cases 1-12). Round 18 tested both inherited Git redirection and a replacement ref: `minimalGitEnv` lines 78-93, fixture creation lines 686-695, poison environment lines 741-753, and named self-tests `inherited GIT_DIR redirection ignored` / `replace-ref baseline poison ignored` at lines 1008-1009.

**Recommended:** add the round-18 replace-ref poison fixture against the fixed baseline (and keep the inherited Git environment fixture). The current env setting is a mitigation; the missing test is a regression-coverage gap, not an observed replacement-object bypass.

## Positive checks and residual risk

- Producer pinning is implemented well in the candidate: it reads `scripts/webmcp-validation-round19.mjs` via `showBlob(repo, rev, ...)`, hashes those bytes, and compares the receipt digest (candidate lines 300-310). Missing producer is surfaced as `producer_blob_missing`, not silently accepted.
- Runtime identity is stronger than a receipt-only declaration in the inspected harness: it rejects mismatched Playwright/Node, checks the Chromium version and between-context identity, and records browser version, executable digests, Playwright version, and Node version (harness lines 1128-1189). The counter then checks the expected runtime values (candidate lines 229-232). This closes the simple hardcoded-version concern for the inspected producer, subject to the receipt-binding finding above.
- Candidate count path reads SKILL, SOURCES, receipt, and producer from the requested revision (lines 284-313); the exact opened-day comparison is present. It correctly returns zero at B when the heading is absent, according to the retained counter report/self-test record.
- Counter output currently lacks the `counterSha256` self-identity included by round 18 (round-18 `countRevision`, lines 550-610). Add it for reproducible audit output, alongside canonical `rev`; useful but not itself a false-count defect.

## Review scope and verification gaps

Reviewed PLAN C1 (a)-(d), C1 case/receipt clauses, round-18 `measure-c1.mjs`, the candidate C1 counter and retained self-test artifact, and the candidate harness runtime-identity path. No build, test, or self-test was run by this reviewer; the self-test result cited above is the retained artifact/report, not an execution by this seat. `lsp` is not mounted (`read xd://lsp` returned “No such tool”); therefore no LSP status/references/definition/diagnostics were available. Source statements above are grounded in the read file ranges and exact snapshot hashes below, not grep presented as semantic proof.

### Source snapshots (accessed 2026-10-21)

- PLAN: [file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/PLAN.md](file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/PLAN.md), lines 18-28, 90-119; SHA-256 `c71e721a5b5edc371c29d8180d6b0d01b757b8c5f304006566b9a61c4cd27655`. Verbatim anchor quote (PLAN.md:23-25): “whose `opened` is 2026-10-21 and whose source is a Chromium 154.0.8037.97-tag file (or other primary source) with line anchor”.
- Round-18 counter: [file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c1.mjs](file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c1.mjs), lines 78-143, 686-695, 741-753, 1008-1009; SHA-256 `30f44992044a7f148395c5cf4642b2d995349e080862a8b90c0e6f4df653d4a0`.
- Candidate C1 counter: [file:///fast/scratch/tabi-r19/ExecMeasureC1-4/.ufo/waves/round-19/measure-c1.mjs](file:///fast/scratch/tabi-r19/ExecMeasureC1-4/.ufo/waves/round-19/measure-c1.mjs), reviewed ranges 32-71, 138-200, 229-269, 280-358, 450-498; SHA-256 `d543b57b5d3640d49ec47c5d736ce121675d18ecc811a4a7100575b61c3fbc01`.
- Candidate retained self-test: [file:///fast/scratch/tabi-r19/ExecMeasureC1-4/corpus/evidence/round-19/selftests/c1.json](file:///fast/scratch/tabi-r19/ExecMeasureC1-4/corpus/evidence/round-19/selftests/c1.json); SHA-256 `a62c461684f6f2d97da0ac83e26da922093faf5939387ffd6590e2d13c36287e`.
- Candidate harness: [file:///fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs](file:///fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs), lines 1128-1196; SHA-256 `05a3164429e44621ed96251e14898bb62e29b9c7e7e8afb2d8f544be9cf68028`.
- Baseline SOURCES body: `git show 66251bfc1aef393e4aec599e950a8deb867736bb:corpus/SOURCES.md`; SHA-256 `1513ecba34fa902f06cc3ac549077fb4494d324990e33ec54e246125645488f5`; observed count of `| 2026-10-21 |` rows: 0.

## Isolation

Report-only seat; no production files changed and no clone/branch/commit created by this reviewer. No tools installed or updated. The only authored artifact is `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/ReviewC1Contract.md`.