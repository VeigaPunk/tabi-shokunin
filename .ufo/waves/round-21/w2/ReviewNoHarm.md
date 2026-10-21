# ReviewNoHarm — historical immutability and inherited-error boundary

## Axes and scope

C1 names **depth**, lowest non-retired tie8, target0→12 finite receipt/raw-correlated loopback observations. **Operability** and **calibration** are the relevant no-harm constraints here: preserve the historical executables and lessons, and never convert a skipped known-red USER gate into a fresh clean certification. Coverage, freshness and adjacency receive no additional credit. Scalar depth8, saturation8/window3 and retirement status remain unchanged in `SCORECARD.md:973-986`.

Canonical assignment: `.ufo/waves/round-21/w2-spec.json`, item `ReviewNoHarm`. This is an author-side, read-only falsification report, not independent admission. The review includes the working-tree candidate and untracked new runtime producer, not merely the committed files. Observed HEAD identity was `1b5f449ad15525d281fda4558aeef1086f1e4a65`; declared baseline is `e7cf11a810003d4a65cc85bd265f2c17dd65b738`. These observations are not an atomic checkout freeze or actor-quiescence proof.

## Findings, by severity

**No actionable historical-gate/lesson mutation or inherited-USER recertification defect found in the reviewed candidate.** This is a scoped static result, not a claim that the new counter, selftest or historical-clean cohort passed at the delivered revision. Final serial verification has not been performed by this seat.

## Concrete attacks and evidence

### 1. Hide a historical gate or lesson edit among the new round21 material

Read-only actual-diff inspection against the declared baseline used:

```text
git diff --no-ext-diff --no-renames --name-status e7cf11a810003d4a65cc85bd265f2c17dd65b738
git diff --no-ext-diff --no-renames --unified=3 e7cf11a810003d4a65cc85bd265f2c17dd65b738 -- scripts corpus/lessons .ufo/waves/round-18 .ufo/waves/round-19 .ufo/waves/round-20 corpus/evidence/round-18 corpus/evidence/round-19 corpus/evidence/round-20 corpus/knowledge
git log --format='%H %s' --name-status e7cf11a810003d4a65cc85bd265f2c17dd65b738..HEAD -- scripts corpus/lessons .ufo/waves/round-18 .ufo/waves/round-19 .ufo/waves/round-20 corpus/evidence/round-18 corpus/evidence/round-19 corpus/evidence/round-20
```

The scoped diff displayed only the **added** `corpus/knowledge/webmcp-nonautosubmit-round-21.md`, not a historical script, lesson, wave or runtime-evidence change. The scoped post-baseline commit log returned no entries. The separately read untracked inventory identified `scripts/webmcp-lifecycle-round21.mjs` as the new producer; it is not an alteration of the round18/19 producers. In particular, no diff was present for `corpus/lessons/round-18.md`, `round-19.md` or `round-20.md`.

The complete six-file tracked documentation diff was read, not inferred from file names. `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md` and `corpus/README.md` append round21 material. The only changed preexisting registry row is S100's `used-by` addition; the old backlink, immutable source URL/anchor/hash and supersession text remain. S101 is added as `own-work`, not publisher corroboration (`corpus/SOURCES.md:114-115`). No prior QUALITY rule or historical scorecard block was replaced.

Static SHA-256 arithmetic also matched every historical executable represented in the imported gate cohort to its retained `producer.sha256` in `.ufo/waves/round-19/final/harm-at-measured.json`:

| Historical executable | Current SHA-256, equal to retained cohort identity |
|---|---|
| `scripts/check-round-contract.mjs` | `1579a794d9b504ff4de1f9039d5498f97706546945d7980087a3df95a6e91828` |
| `scripts/check-user-round-contract.mjs` | `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273` |
| `scripts/check-freshness.mjs` | `93d196377d0553e0d94712a1e2aac099b96b0539d932fda85078fc52df96930b` |
| `scripts/check-sources.mjs` | `afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77` |
| `scripts/check-aria-metadata.mjs` | `d707625ef967ff0c8bf041ebb0ec70b73b76a1c04d6cc95101c79a110c4a600b` |
| `scripts/check-measurement-binding.mjs` | `388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74` |
| `scripts/check-adjacency.mjs` | `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` |

The round20 depth counter also hashes to `19921191fad84ba79414188e1a7b1bc05acdb491b1e6052ed5b70454864f7945`, the identity already recorded at `SCORECARD.md:943`. This is byte-identity evidence, not an execution result.

### 2. Extend S100 for round21 while silently invalidating the old round20 source contract

`corpus/SOURCES.md:114` changes only `used-by` from `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` to that same path plus `corpus/knowledge/webmcp-nonautosubmit-round-21.md`. The exact old/new row was read from the diff. It retains `html_form_element.cc:174-328,635-842`, decoded hash `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, status `mined`, and the `supersedes S096 —` prefix.

The affected old definition is `.ufo/waves/round-20/measure-c1.mjs:546-568`: it selects exactly one matching source ID, checks URL/digest/ranges/status, splits `used-by` on comma/semicolon and requires **inclusion** of the old note path, not equality to a singleton. `:590-592` applies it to S096 and S100. Thus the literal backlink addition does not contradict that predicate. No old counter was run here. The runtime note keeps source interpretation separate from runtime evidence and reset/removal outside S100's anchors (`corpus/knowledge/webmcp-nonautosubmit-round-21.md:14-21,35-37`); README explicitly preserves round20's source-only status (`corpus/README.md:485-487`).

### 3. Re-run the known-red USER production gate, or report the inherited error as recertified clean

The retained historical input `.ufo/waves/round-19/final/harm-at-measured.json` contains 23 runs: 22 exit0, and only `check-user-round-contract-production` exit1. Its exact stored stderr is:

```text
USER_ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Pstack bytes changed: A\tcorpus/lessons/round-18.md
```

This was **read from history**, not re-executed. The current runner explicitly states the prohibition (`.ufo/waves/round-21/run-checks.py:2-4`), records the known exit1 in `skipped` (`:40-47`), and excludes that gate while importing the historical cohort (`:66-70`). The other USER selftest/witness/diagnostic invocations are historical exit0 controls, not the forbidden production re-probe. The added round20/21 finite checks and measurements are separately named at `:71-87`. There is no browser producer invocation in that cohort.

The earlier predicate-only receipt is also not a clean USER-gate result. `.ufo/waves/round-20/final/lesson-history.json`, parsed `/stdout`, records revision `e41ae33c238540a469e4a031fad3ad00ef112616`, scope `lessonDrift only, not complete USER gate`, refused paths `[corpus/lessons/round-18.md, corpus/lessons/round-19.md]`; round20 has `laterMDRTCommits=[]` and `refused=false`. The canonical enumerator `.ufo/waves/round-20/lesson-history.mjs:11-19` derives those predicates from blobs and later MDRT commits, without invoking the inherited red gate. Current `LOG.md:1325-1329` preserves that distinction; the round21 block does not claim to have cleared the old failure (`:1368-1370`).

## Residual risk and verification gaps

- **Final revision remains the boundary.** The evidence above establishes the reviewed diff and existing history, not the future lesson-addition history or final serial results. L1's final receipt must remain revision/producer-bound and retain the explicit USER-production skip. If a final lesson-history check is needed, the existing predicate-only enumerator is distinct from, and must not be represented as, a clean USER production run. A later edit to an initially added lesson can grow the refusal set even when its final prose looks acceptable (`lesson-history.mjs:16-17`).
- **A cohort `clean` is not global recertification.** `run-checks.py:96-106` computes its verdict from executed rows, while the known red gate lives in `skipped`. Its stdout/receipt can support only that selected cohort; it must not be summarized as “all gates clean” or a repaired USER history.
- **C1 is not a no-harm or semantic oracle.** The synthetic positive's embedded receipt has all twelve response summaries empty, including autosubmit controls, while `fixtures/expected.json:2-7` expects structural value12. `measure-c1.mjs:85-100` checks correlation/mirrors and counts them; it never evaluates historical USER health. The current bounded acquisition instead records the actual distinct outcomes. No synthetic expectation is treated here as an observed test result or as historical-gate certification.
- **LSP unavailable.** `read xd://lsp` returned `No such tool`; status/references/definition/diagnostics could not be obtained. The old-counter definition review uses literal fallback plus direct source reading, not semantic-reference proof. No cold empty LSP result was treated as absence.

## Execution boundary

Read current producer, counter, selftest, persisted positive/expected fixtures, current bounded receipt, knowledge/skill/index changes, actual diff and pertinent wave/history records. Used only read-only diff/history/hash evidence arithmetic. No gate, counter, selftest, build, lint, formatter, browser, runtime acquisition, git/jj/index mutation, delegation, service restart or production write was performed. No tools were installed or updated. Only this uniquely named report was written. No routing, admission, SHONEN or actor-quiescence claim follows.

Report: .ufo/waves/round-21/w2/ReviewNoHarm.md
