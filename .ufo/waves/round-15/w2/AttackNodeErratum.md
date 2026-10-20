# AttackNodeErratum — round15 wave2 (author-side scout, read-only)

Question: do the delivered round15 bytes state the Node enforcement-source distinction
truthfully — frozen spec `:269` enforced `minimumMajor` (invoked per case at `:924`), the
launcher and `runtimePinStatus()` omit Node from the pin match, and the retrospective
checker re-evaluates the floor — without repeating the outside review's overbroad
non-enforcement inference?

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. All paths below are relative to it.
This is author-side source reading, not non-author certification. No gate, selftest,
counter, witness, browser or formatter was run. No tool was installed.

## Bytes attacked

- Revision `72dcf031b9da24796b718517ea575f21e4f7caae` (HEAD), matching
  `.ufo/waves/round-15/build-snapshot.json` `revision`; baseline `7054a5e1…`.
- Snapshot code digests recomputed and all matched: `scripts/check-user-round-contract.mjs`
  `abf174c3…b0a3d`, `scripts/check-aria-metadata.mjs` `57382962…e4eb0`,
  `.ufo/waves/round-15/measure.mjs` `62e98fa8…f02e7`,
  `.ufo/waves/round-15/metadata-witness.py` `44cd37c5…5831`.
- Frozen execution sources are clean against HEAD (`git diff --quiet` exit0): spec
  `corpus/evidence/round-13/aria/aria-loopback.spec.mjs` sha256
  `03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc` (equals
  `receipt.source.specSha256`, `ANCHORS.specSha256`, report `:15`); pin
  `corpus/evidence/round-13/aria/runtime-pin.json` `4d894756…ccd2` (equals
  `receipt.runtime.pinned.pinSha256`, `ANCHORS.pinSha256`); launcher
  `scripts/aria-loopback-round13.mjs` `1d54c9e9…af9c`; receipt `b458b351…89b7`
  (`ANCHORS.receiptSha256`); worker
  `corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json`
  `0d0f00e2…a5e7` (`ANCHORS.workers`). HEAD blobs: spec `dfdef72c…`, launcher `5e6b65e8…`.
- Correction docs are uncommitted/untracked working-tree bytes (the snapshot records no
  doc digests): `SKILL.md` `967e498c…5dbd`, `corpus/README.md` `dd20d0c2…d5a6`,
  `corpus/QUALITY.md` `cdd2921c…f116`, `corpus/SOURCES.md` `44f2960b…c79a`, `LOG.md`
  `4281d84e…b7a8`, `SCORECARD.md` `6ecee477…eacc`, `corpus/lessons/round-15.md`
  `a5f5aa26…3866`, `corpus/evidence/round-15/source-index.json` `fbfdb330…12ae`.
- Immutable comparators: corrected sidecar
  `corpus/evidence/round-14/aria-metadata/corrected.json` `e156b922…6745` (matches the
  round14 verifier digest; unmodified); outside review
  `corpus/lessons/round-14-verifier-spotcheck.md` `1e882d2e…a358` (unmodified).

## Verdict

The core source distinction in the delivered correction is **substantively correct**:
the frozen spec did enforce the Node floor at `:269` in every executed case via `:924`,
and the launcher/`runtimePinStatus()` pin summaries do not enforce or include Node. The
outside review's inference that historical minimum enforcement "cannot" be certified
(`round-14-verifier-spotcheck.md:129-130`) is genuinely overbroad, and the delivered docs
correct the inference rather than rewriting the historical bytes.

One wording defect survives: the delivered sentence "the launcher … omit Node" is false as
written, because the launcher emits `runtime.node`; only its `runtime.pinned` summary omits
Node. Two lower-severity precision/binding issues follow.

## Propositions that survived the attack (observed, no defect)

| # | Proposition | Evidence |
|---|---|---|
| S1 | `:269` is a real Node-minimum assertion, not a dead line. | `aria-loopback.spec.mjs:262-270` `assertPinnedRuntime()` ends with `expect(RUNTIME.nodeMajor).toBeGreaterThanOrEqual(PIN.node.minimumMajor)` at `:269`; `RUNTIME.nodeMajor` is derived from `process.versions.node` at `:226-227`. |
| S2 | The assertion runs per case, not only once. | `for (const caseDef of CASE_ORDER)` opens the test at `:882-883`; `record.phase='runtime-pin'; assertPinnedRuntime();` is unconditional at `:923-924` after only throwing `LOAD_ERROR`/`SETUP_ERROR` guards. `CASE_ORDER` holds 8 cases (`:48`). |
| S3 | The executed round13 run passed that phase. | Receipt `cases` has 8 entries, all `status:pass`, all with final `phase:'confinement'` (later than `runtime-pin`); worker has the same 8 local cases and `verdict:pass`. The assertion therefore did not throw in the recorded run. |
| S4 | `runtimePinStatus()` omits Node. | `aria-loopback.spec.mjs:241-259` returns only `matched`, `playwrightMatched`, `chromiumMatched`, `browserVersionMatched`. The worker's emitted `runtime.pinned` (`:1339-1344`, spreading that object) contains exactly those four booleans plus pin path/hash — no Node field. |
| S5 | The launcher never reads or enforces `pin.node`. | `grep -n "minimumMajor\|PIN\.node\|pin\.node" scripts/aria-loopback-round13.mjs` returns no pin read; only `process.versions.node` emissions at `:92` and `:405`, and a `runtime.pinned` summary at `:420-431` whose `runtimePinMatched` (`:403`) covers Playwright/Chromium/browser version only. |
| S6 | The retrospective checker re-evaluates the floor from authenticated bytes, failure-capably. | `check-aria-metadata.mjs:524-536` derives `minimumSatisfied` from `receipt.runtime.node` and `pin.node.minimumMajor`; `:571-576` pushes `R14-ARIA-NODE-MINIMUM-01`; `corpus/evidence/round-15/metadata/expected-fixtures.json` case `invalid-node-minimum` expects exit1 with that finding `fail` (and `node-observed-recorded` expects pass). Sidecar mode requires `minimumMajorSatisfied` equality (`:1275-1277`) and records `historicalSpecEnforcedMinimumMajor:true`, `historicalRuntimePinMatchIncludesNode:false` (`:1286-1288`). |
| S7 | Exact Node equality is not enforced anywhere. | The spec reads only `PIN.node.minimumMajor` (single `PIN.node` hit at `:269`); `pin.node.recorded` is never read by the producer. The checker's `R14-ARIA-NODE-RECORDED-01` passes on shape alone (`:563-570`), and the sidecar requires `descriptiveOnly:true`/`recordedRole:'descriptive'` (`:1278-1282`). |
| S8 | The outside review's overbroad wording exists as characterized, and the docs' correction targets it correctly. | `round-14-verifier-spotcheck.md:129-130` says "the historical producer does not read pin.node … therefore cannot certify … historical minimum enforcement"; `:184` says "which never enforces pin.node". The literal "producer does not read pin.node" is true of `scripts/aria-loopback-round13.mjs` (the checker names that path `SOURCE_PATHS.producer`), but the inference that the experiment could not enforce the floor is false because the spec tested it. Delivered SKILL/README/source-index name the **test spec** as the enforcer and the launcher/summary as the omission, so they do not repeat the outside conflation. |
| S9 | The public line anchors in delivered docs resolve. | README `:276-277` (`:269`, `:924`), SKILL `:1768-1770` (`:262-269`, `:924`), source-index `minimumEnforcementSource.assertion/call` all point at existing spec lines. SKILL's `:262-269` omits the closing brace at `:270`; the assertion line itself is exact, so this is not counted as a defect. |

## Defects

### D1 — MEDIUM (wording, source distinction) — "the launcher … omit Node" is false as written

**Pointers.** `SKILL.md:1771-1772` ("The launcher `scripts/aria-loopback-round13.mjs` and
the spec's `runtimePinStatus()` summary omit Node"), `corpus/README.md:277-278`
("Only the launcher and `runtimePinStatus()` summary omit Node"),
`corpus/evidence/round-15/source-index.json:28` ("The launcher and runtimePinStatus summary
omit Node"), `LOG.md:845-846`, `corpus/lessons/round-15.md:40,45`.

**Counterexample from delivered bytes.** The launcher *emits* Node:
`scripts/aria-loopback-round13.mjs:92` (`node: process.versions.node` in the failure
receipt) and `:405` (`node: runtimeSource?.node ?? process.versions.node` in the success
receipt). The executed receipt therefore carries `runtime.node = "26.12.0"` and the worker
carries the same value. What actually omits Node is the launcher's **pin summary**
`runtime.pinned` (`:420-431`; `runtimePinMatched` at `:403` excludes Node) and the spec's
`runtimePinStatus()` summary (`:241-259`). The delivered checker already uses the precise
phrasing: "the producer's runtime pin match … covers only Playwright, Chromium and browser
version; it never includes Node" (`check-aria-metadata.mjs:13-15`) and "the launcher's
runtime pin summary never included Node" (`:1556-1557`).

**Independent corroboration (same wave, still author-side).** `AttackS029Trace` reached
the same counterexample from the S029 trace: `.ufo/waves/round-15/w2/AttackS029Trace.md`
§F1 names `:403` `runtimePinMatched`, `:423-431` `runtime.pinned`, and spec
`runtimePinStatus()` `:241-259`. That is convergent source reading, not non-author
certification.

**Impact.** This is exactly the overbroad-attribution class the correction exists to fix:
a cold reader can conclude the launcher has no Node handling, which is contradicted by the
receipt and worker bytes. The intended meaning (omitted from the pin match) is recoverable
from context, so the core distinction is not inverted.

**Bounded correction.** In the append-only round15 wording, replace the bare launcher
subject with the summary: “the launcher's `runtime.pinned` summary and the spec's
`runtimePinStatus()` summary omit Node”. Apply in `SKILL.md:1771-1772`,
`corpus/README.md:277-278`, `corpus/evidence/round-15/source-index.json:28`; L1 owns the
same edit in `LOG.md:845-846` and `corpus/lessons/round-15.md:40,45`. Do not edit the
historical spec, launcher, receipt, sidecar or outside review.

### D2 — LOW (temporal/anchor) — w1 `SkillCorrection.md` checker line pointers do not resolve in delivered bytes

**Pointers.** `.ufo/waves/round-15/w1/SkillCorrection.md` sha256 `e8a958a0…b83eb` cites
`scripts/check-aria-metadata.mjs:441` (derive), `:476` (minimum finding), `:713` (pin
digest), `:1027-1029` (sidecar node checks), `:1258-1261` (derive note), `:1697-1763`
(Node fixtures).

**Delivered replacements.** `deriveNode` is `:524-536`; `evaluateNode` is `:554-577` and
`R14-ARIA-NODE-MINIMUM-01` is `:571-576`; `evaluatePin` is `:793-817`; the sidecar Node
checks are `:1262-1289`; the derive note is `:1553-1558`; delivered `:441/:476` are
`evaluateCleanup` findings and `:1027` is `prepareContext`. The report predates the
delivered checker cutover, exactly the wave1-reconnaissance limit the lesson acknowledges
(`corpus/lessons/round-15.md:51`, routed item5).

**Impact.** The delivered docs do not cite checker line numbers, so they are not affected.
But a closure erratum that quotes w1's line pointers would point at cleanup/context code,
not the Node check.

**Bounded correction.** Cite the delivered checker lines above (or no line number) in the
erratum; keep w1's substantive finding (the spec assertion exists) but label its line
pointers pre-cutover reconnaissance.

### D3 — LOW (evidence independence) — "two evidenced checks" can be read as independent corroboration

**Pointers.** `SKILL.md:1767-1770` ("'enforced minimum' has two evidenced checks, not one:
… the historical test spec's `assertPinnedRuntime()` checks … and the retrospective
metadata checker re-evaluates that minimum").

**Observation.** Both layers consume the same recorded observation: the checker's
`deriveNode` reads `receipt.runtime.node` (`:525`), which is the worker's `runtime.node`
emitted from the same run in which `:269` asserted on that process's Node. The checker is a
second failure-capable *enforcement layer* over authenticated bytes (fixture
`invalid-node-minimum` proves failure-capability), not an independent Node sample. The same
sentence says "re-evaluates", so this is a qualification, not a factual inversion.

**Bounded correction (optional).** Say "two failure-capable enforcement layers over the
same recorded observation" if the wording is revised for D1. Do not claim independent
verification of the historical Node value; the only independent witness is the worker
receipt identity check (`R14-ARIA-NODE-01`, `:557-562`), which compares receipt and worker
values from the same run.

### D4 — LOW (provenance ambiguity) — `browserExecuted=false` beside "the executed historical spec"

**Pointer.** `corpus/evidence/round-15/source-index.json:28` starts "Historical static
metadata-contract enforcement; browserExecuted=false. The executed historical spec
assertPinnedRuntime checks …".

**Observation.** In the sidecar vocabulary `browserExecuted:false` means the derived
artifact performed no new browser run (the checker requires that flag on sidecars,
`check-aria-metadata.mjs:1291-1296`), while the cited round13 run *was* browser-executed
(receipt `verdict:pass`, 8 cases, confinement phases). A cold reader can take the field as
a claim about the historical run and see a contradiction.

**Bounded correction.** Use `newBrowserRun=false` (the checker's own field name) or state
"this index performs no browser execution; the cited round13 run was browser-executed".

## Temporal and binding limits

1. **Docs are not revision-bound.** `build-snapshot.json` names HEAD `72dcf03`, but the
   correction lives in uncommitted `SKILL.md`/`README.md`/`QUALITY.md`/`SOURCES.md` and
   untracked `source-index.json`/lesson. The snapshot pins only the four code/evidence
   files (all matched). Until L1 commits, the doc bytes I attacked are working-tree
   digests, not a revision address. My findings attach to the digests listed above.
2. **No executed round15 receipt exists.** The snapshot says "verification: not yet
   exercised"; `corpus/evidence/round-15/` contains only `source-index.json`,
   `misroot-recovery.json` and the `metadata/` fixtures — no checker/selftest/witness
   output. The checker's Node path is verified here by source and by committed fixture
   expectations, not by an executed outcome. I ran none.
3. **Immutable sidecar still carries the unattributed floor note.** The
   `corrected.json` note "node.minimumMajor=20 is the enforced floor" is unchanged
   (digest `e156b922…`), as the delivered docs state; the correction exists only in new
   docs and the `--derive` template. That is consistent, not a defect, but it means the
   old artifact cannot be cited as carrying the corrected attribution.

## Commands L1 should run (not run by this seat)

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
sha256sum scripts/check-aria-metadata.mjs scripts/aria-loopback-round13.mjs \
  corpus/evidence/round-13/aria/aria-loopback.spec.mjs \
  corpus/evidence/round-13/aria/runtime-pin.json \
  corpus/evidence/round-15/source-index.json SKILL.md corpus/README.md
grep -n "omit Node" SKILL.md corpus/README.md corpus/evidence/round-15/source-index.json \
  LOG.md corpus/lessons/round-15.md
grep -n "minimumMajor\|PIN\.node\|runtime\.node\|runtimePinStatus" \
  scripts/aria-loopback-round13.mjs corpus/evidence/round-13/aria/aria-loopback.spec.mjs
grep -n "R14-ARIA-NODE-MINIMUM-01\|R14-ARIA-NODE-RECORDED-01\|R14-ARIA-SIDECAR-NODE-CLAIM-01\|function deriveNode\|function evaluateNode" \
  scripts/check-aria-metadata.mjs
git diff --quiet HEAD -- corpus/evidence/round-13/aria/aria-loopback.spec.mjs \
  scripts/aria-loopback-round13.mjs corpus/evidence/round-13/aria/receipt.json \
  corpus/evidence/round-13/aria/runtime-pin.json
git status --porcelain=v1 -- SKILL.md corpus/README.md corpus/QUALITY.md corpus/SOURCES.md \
  LOG.md SCORECARD.md corpus/evidence/round-15 corpus/lessons/round-15.md
```

After the D1 wording fix, re-run the `grep -n "omit Node"` sweep; zero bare launcher
claims should remain.

## Out of scope

- No certification of the non-author erratum; Main verifies it.
- No evaluation of the C1 counter contract, the C2 mirror/tamper contract, or whether the
  round15 claims are verified end-to-end; separate wave2 seats own those.
- No edits to source, docs, lesson, SCORECARD or evidence. No commit, no background job,
  no tool install, no pacman transaction.
