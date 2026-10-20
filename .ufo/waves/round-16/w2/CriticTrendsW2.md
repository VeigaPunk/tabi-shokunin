# CriticTrendsW2 — trend pre-judgment on b444ca8e024f386124418169e8e400221524bba3

Author-side critic report (TabiR16 wave 2 FALSIFY). This is not non-author certification. The lane was read-only for me; mutation probes ran in a temp clone at `/tmp/critictrends.ChB5/lane`. Tools installed or updated: none.

## Attack item T1 — do the three trend verdicts (expansion / quality / discernment) hold at the delivered snapshot?

**Overall verdict: BREAKS. The defect is fixable and is not a tradeoff.** Expansion HOLDS. Quality HOLDS on substance but has one false-provenance wording defect, and the pre-repair bytes are unretained. Discernment BREAKS at the snapshot: QUALITY 22 and 23 and the SOURCES round-16 search log cite `corpus/lessons/round-16.md`, and that file does not exist at b444ca8, nor in the worktree. A second, smaller point: the reason given for withdrawing the Fastly rejection is incomplete.

### Axes
- **expansion**: 32→33 notes. Is the one new note on uncovered ground, and backed by mined rows?
- **quality**: were the repairs (first harness run 8/11, the C2 counter defect) retained honestly? Did any repair weaken a check?
- **discernment**: are QUALITY 22/23 backed by lessons? Are the rejected rows sound? Was the Fastly withdrawal correct?

---

### A. Expansion — HOLDS

- `git ls-tree --name-only e38d2599 corpus/knowledge/ | wc -l` → `32`; `git ls-tree --name-only b444ca8 corpus/knowledge/ | wc -l` → `33`.
- `git diff --name-status e38d2599 b444ca8 -- corpus/knowledge corpus/lessons …` → only `A corpus/knowledge/webmcp-chromium-loopback-round-16.md` under knowledge. No earlier note changed.
- Uncovered ground: at e38d2599, `corpus/README.md:35` "Native WebMCP in chromium 152 — unprobed (census U3)", `:181` "open — still unprobed", and `knowledge/browser-surface-census.md:188` U3 "no runtime probe performed".
- Mined backing: the note header cites `source: S020, S030–S036`. At b444ca8 all eight rows have status `mined` and used-by set to the note. `node scripts/check-sources.mjs` → `SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0`. Census delta from plan start (mined24/queued3/rejected2): +8 mined (S020 queued→mined, plus S030–S036), +1 queued (S037), +2 rejected (S038, S039).
- No duplicate authority in another lane: `grep -rl -E 'modelContext|WebMCP\.toolsAdded' */corpus` at the fleet root, excluding tabi → no hits.
- Counters: `node .ufo/waves/round-16/measure.mjs <rev> --claim C2` → `c2_webmcp_held` is `0` at e38d2599 ("note, receipt or harness absent"), `1` at 8f7feb3 and `1` at b444ca8. C1 gives the same 0/1/1 (`selftest … cases=43 reasons=13`).
- Re-opened S020 (2026-10-20, `curl https://webmachinelearning.github.io/webmcp/`, sha256 `5627596668946732…ca40`): "partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext;" (stripped text, line 1489–1490). The live draft is now dated "20 October 2026". The row's `CG-DRAFT 2026-10-16, revision f14762e6` anchor is revision-pinned, so this is not a defect, but the S020 recheck will see a new date.

Refutation conditions (expansion would BREAK if any holds):
1. Any of the 32 earlier notes is modified or removed between e38d2599 and the delivered HEAD.
2. A cited source row S020/S030–S036 is not `mined`, or its used-by does not name the note.
3. A prior note or sibling lane already held native WebMCP runtime evidence. My grep found none.
4. `measure.mjs <HEAD> --claim C2` is ≠ 1.

### B. Quality — HOLDS on substance; one false-provenance wording defect; repair pre-state UNPROVEN

What holds:
- The first failing run is retained. `receipt-first-run-failed.json` shows summary `cases 11, passed 8, failed 3`, and the stdout `WEBMCP_LOOPBACK verdict=fail cases=11 passed=8 failed=3`. Both were committed in 8f7feb3.
- The first C2 counter count is retained: `corpus/evidence/round-16/measure/count-after-c2-first-counter-defect.json` records `c2_webmcp_held:0` with failure `case data-url-declarative fixture digest`, counter blob `4eb82895` at A.
- The counter repair is not weaker, it is stricter. `git diff 8f7feb3 b444ca8 -- .ufo/waves/round-16/measure.mjs` changes `if (c.fixture) {…}` (skipped when absent) to `fixtureFile` with a filename regex, and a missing `fixtureFile` is now a failure (`names no fixtureFile`).
- Each repaired harness case names an oracle in the note §Corrections (:96-106) and in the receipt:
  - navigation-clears-tools: `expectedProvenance` "source oracle: devtools-frontend WebMCPModel.ts:192-203 … first L1 run expected toolsRemoved and failed (retained)". The `actual` is identical across both runs (`toolsRemoved:[]`, `getTools:[]`). The expectation changed to "no event, no stale tools", which adds a `staleToolsInNewDocument` check. It is backed by an independent source (S036), so it is not a goal-post move.
  - opaque-sandboxed-iframe: the `expected` is byte-identical. The first run recorded `error:null`, with no `settled` field. The repair recorded `"settled":"rejected"` and `NotAllowedError … permissions policy`. This fixes the mechanics (the Promise is now awaited) and does not relax the expectation.
  - frame-tools: the fixture expectation now includes `description:"Query"`. The tool observed in the first run already carried `"description":"Query"`, so the fixture declaration was incomplete, not the browser behaviour.
- Binding: `node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at b444ca8… --reproduce` → `MEASUREMENT_BINDING verdict=clean claims=2 bound=2`, exit 0. I ran it on the lane's untracked manifest.

Defect B1 — false provenance (fixable): note `:98-100` says "The first committed-code run (`receipt-first-run-failed.json`, producer digest inside it) failed three cases; … the original bytes are kept".
- The first-run `producerSha256` is `cedccdf9b649…9779`. The harness at both 8f7feb3 and b444ca8 is `961874e4…be1`.
- Every blob in the repo was hashed (`git rev-list --all --objects | … git cat-file blob | sha256sum | grep -E 'cedccdf9|961874e4'`). Only `961874e4… ffbfc69a` was found.
- The first-run fixture digests (frame-parent `d281ff66…`, frame-child `6ed41b9a…`) are absent from every git object. Only the current `5b51e270…` and `a4e060ad…` exist.
- So the failing run was not produced by committed code. Only the receipt bytes are kept, not the producer or the two pre-repair fixtures, and the repair diff cannot be reproduced from the lane.
- The note also does not say that two fixtures were edited, not just harness expectations.

Impacted axes: quality, calibration. Smallest safe correction: append the correction to the round-16 lesson (§Mistakes or §Gate), not to the note. Suggested wording: "first run produced by uncommitted harness `cedccdf9…` with fixtures frame-parent `d281ff66…`/frame-child `6ed41b9a…`; those bytes are not retained; only the receipt is". The note is a C2 counted input (see C3 below), so editing it would require a fresh measurement.

Refutation conditions (quality would BREAK if any holds):
1. An `expected` changed between runs without an independent oracle. I found none.
2. The counter repair removes a failure path. It does not.
3. `receipt.producerSha256` ≠ the harness blob at the delivered HEAD. It is equal now.
4. The binding gate, with `--reproduce` at the delivered HEAD, is not clean.

### C. Discernment — BREAKS at snapshot (fixable)

Defect C1 — dangling lesson backing:
- `git cat-file -e b444ca8:corpus/lessons/round-16.md` → `fatal: path 'corpus/lessons/round-16.md' does not exist in 'b444ca8'`; worktree: `ABSENT-WT`.
- `git grep -l 'lessons/round-16.md' b444ca8 -- . ':!.ufo'` → `corpus/QUALITY.md`, `corpus/SOURCES.md`.
- QUALITY 22 and 23 say "(lesson: corpus/lessons/round-16.md#mistakes …)".
- The SOURCES round-16 search log ends "Per-row URL, date and located quotes: `corpus/lessons/round-16.md` §Gate". That is the per-row quote record the SOURCES contract preamble assigns to the round lesson. For S030–S039 it currently exists only in `.ufo/waves/round-16/w1/*` seat reports and `.ufo/waves/round-16/drafts/DraftSources.md`.
- The substance behind 22/23 is real:
  - routed 1/2 are at `corpus/lessons/round-15-verifier-spotcheck.md:120-121`, the U3 guess is at `browser-surface-census.md:188`, and `.ufo/waves/round-16/drafts/DraftLesson.md` drafts the §Mistakes rows (it still says "planned, unrun").
  - At b444ca8, however, the lesson citation in both rules points to a file that does not exist.
- LOG.md and SCORECARD.md are unchanged e38d2599→b444ca8, so no trend verdict is recorded at the snapshot.

Safe-closure probe (temp clone, b444ca8 plus commits):
- Commit 1 added only `corpus/lessons/round-16.md` and the manifest. Gate `--check … --at HEAD --reproduce` → `MEASUREMENT_BINDING verdict=clean claims=2 bound=2`, exit 0.
- Commit 2 edited one SOURCES.md search-log phrase. Result: `MEASUREMENT_BINDING verdict=failed claims=2 bound=1` / `finding claim=C2 reason=counted_input_changed detail=paths=corpus/SOURCES.md`, exit 1.

Smallest safe correction:
- Commit `corpus/lessons/round-16.md` with `## Mistakes` and `## Gate`, carrying per-row URL, date and ≤25-word located quotes, plus `corpus/evidence/round-16/measurement-binding.json`, LOG and SCORECARD.
- Touch none of C2's countedInputs: `corpus/README.md`, `corpus/SOURCES.md`, `corpus/knowledge/webmcp-chromium-loopback-round-16.md`, the receipt, the fixtures, and the harness.
- Any edit to those requires a new measured revision and a re-run of the binding.

Defect C2 — the Fastly withdrawal reason is incomplete (wording; the decision direction holds):
- The SOURCES search log says it excluded "a Fastly post whose 149–156 trial window chromestatus confirms (a drafted rejection withdrawn)".
- Re-opened 2026-10-20, `https://chromestatus.com/api/v0/features/5117755740913664`:
  - The OT stage (`stage_type 150`) has `"desktop_first": 149, … "desktop_last": 156`.
  - Its `extensions[0]` (`stage_type 151`, created 2026-09-28) has `"desktop_last": 162`, reason "OT feedback has suggested improvements to the API … The OT extension would enable us to get data on those improvements".
- The seat recorded this (`.ufo/waves/round-16/w1/SrcChromeDocs.md:129-130`: "OT extension stage (151) `desktop_last` | **162**"), but the committed log dropped it.
- Fastly, re-opened the same day, body paragraph 3: "it's now in a public origin trial running from Chrome 149 through 156, with a local dev flag".
- The withdrawal itself was correct: Fastly matched the original OT stage, and S039 was rightly re-cut onto a real `navigator.modelContext` error.
- But "confirms" overstates it. Chromestatus now records an extension to 162, which makes Fastly's end milestone stale. No committed corpus file asserts 156 as the end, and S032 says only "from Chrome 149". Impact: discernment/precision only.
- Correction: record "original OT stage 149–156, extended to 162 (stage 151, 2026-09-28); Fastly excluded as stale/redundant, not confirmed" in the lesson §Gate. Do not edit SOURCES.md, which is a counted input.

Rejected rows — HOLD (re-opened 2026-10-20):
- S039 bug0: "The API lives at `navigator.modelContext`." (§How it actually works, para 1).
- S038 CHROMIUM_FLAGS.md: "console.log('modelContext available:', !!navigator.modelContext);" (§Verification, Method 2).
- Both conflict with S020's current `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext;`. They also conflict with receipt case `model-context-location` (pass). The flip conditions are stated.
- S026 and S027 are unchanged.

Refutation conditions (discernment would HOLD if all are true at the delivered HEAD):
1. `corpus/lessons/round-16.md` exists with `## Mistakes` rows backing QUALITY 22 and 23, and a `## Gate` carrying the per-row quotes for S020 and S030–S039.
2. `check-measurement-binding --check <committed manifest> --at <delivered HEAD> --reproduce` exits 0. It then needs no edits to C2's countedInputs after b444ca8, or a fresh measured revision that covers them.
3. The Fastly exclusion reason in the committed record mentions the 162 extension, or no longer claims chromestatus "confirms" the 149–156 window.
4. The B1 provenance correction is recorded outside the counted inputs.

## Impacted axes summary
| Axis | Verdict at b444ca8 | Fix type |
|---|---|---|
| expansion | HOLDS (32→33, new note on U3 ground, 8 mined rows) | — |
| quality | HOLDS on substance; B1 false-provenance wording; repair pre-state unretained (UNPROVEN reproducibility) | lesson append |
| discernment | BREAKS: QUALITY 22/23 and SOURCES §Gate cite an absent lesson; Fastly reason incomplete | commit lesson + manifest only; no counted-input edit |
