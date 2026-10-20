# AttackS029Trace — read-only trace falsification of the S029 pointer / source-index bytes

Author-side scout report by `TabiR15.AttackS029Trace`. **Not non-author certification.** No gate, test, selftest, counter, browser run, build, lint, formatter, commit, source edit, or package install was performed. Evidence is source reading plus `sha256sum` / `git cat-file` / JSON reads. No tools installed or updated.

The lane was edited concurrently while this attack ran, so the report keeps two byte states separate. **T0** is the state I first attacked; **T1** is the state observed at `2026-10-20T05:36:59-03:00`. Any gate must re-pin before trusting either.

## 1. Identity

- Build-snapshot revision: `72dcf031b9da24796b718517ea575f21e4f7caae` (`.ufo/waves/round-15/build-snapshot.json:2`); baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`.
- The S029 trace is **not in that revision** at all (F3): `git cat-file -e 72dcf03:corpus/evidence/round-15/source-index.json` exits `128`, `corpus/lessons/round-15.md` is untracked, and `git show 72dcf03:corpus/SOURCES.md` still has `S029` used-by = `corpus/lessons/round-14.md` only.
- Exact bytes attacked:

| Path | T0 digest (attacked) | T1 digest (observed) |
|---|---|---|
| `corpus/evidence/round-15/source-index.json` | `fbfdb330d9ed23236116eebf2bb66202907436a20fd5680fc6277d3e9ba712ae` | `313e1d55f41e428b54d8bec46c7895b589d8e93cf2687ec55e537ff74ea485c4` |
| `corpus/lessons/round-15.md` | `72f53c9d38eaaffeb09b05a714023019ac90fdc45cc6f09b9194128ca60c84d1` | `7b8972b1fb21dcedb92b7e34b9c03374a5f237d10f36918c5411aa77e511696e` |
| `SKILL.md` | `e3b1e39cf55e7cd8cf6a258aaa2e57349320ba8cb7b0b5a03bc3ac902995e7b4` | `c5ed309e7342e503689ceddd1c21c7fe50afa0961081a9cf68ec93be7b41724f` |
| `corpus/README.md` | `dd20d0c20860ad6d04cb10c01021e8bccd9587420a15fd31c1f9f03ef0f6d5a6` | `590284b9afb33bee6f035b803e80940d4cc913f199ce1e9150ec1d326ff011e7` |
| `corpus/SOURCES.md` (S029 row) | `44f2960b25f9dd90a82d15aa38f8d636d66dba568526b7693e61702ed581c79a` | unchanged |
| `corpus/QUALITY.md` | `cdd2921c818657aa54b26d8179f335e8658925b2c5b30231e3f275340da3f116` | unchanged |
| `LOG.md` (committed at 72dcf03) | `4281d84e33af03ccb929d95eae5edc2aab5aec2c5b0c4da7f66ba1bc6b37b7a8` | unchanged |

- The four files named in `build-snapshot.sha256` moved after T0; the snapshot no longer identifies the working tree (F3):

| File | Snapshot digest | T0 digest | T1 digest (05:36:59) |
|---|---|---|---|
| `scripts/check-user-round-contract.mjs` | `abf174c3…60a3d` | `abf174c3…60a3d` (clean at HEAD) | `f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b` |
| `scripts/check-aria-metadata.mjs` | `57382962…e4eb0` | `57382962…e4eb0` (clean at HEAD) | `58bc8ec7fde422d20bc6f19dd3aff60349a002864cb459a81774a7c10fd6339a` |
| `.ufo/waves/round-15/measure.mjs` | `62e98fa8…02e7` | `62e98fa8…02e7` | `f144a72a7d304e0ef082e9fedeb6b98c26f18c88a69ccafcb38bf2c2a000c7d4` |
| `.ufo/waves/round-15/metadata-witness.py` | `44cd37c5…5831` | `44cd37c5…5831` | `89643faf44b823b4dc4105f8cd8b3c56a8e72f8e203bca5a7d8de10701fe335a` |

- **T2** (`2026-10-20T05:37:36-03:00`): the code files moved again — `check-aria-metadata.mjs` `387f60bce67fc9bcc16a676d556b3cb00b30ad7d11c890949f8712f15d4df325`, `measure.mjs` `8663dd4cffab6ef547d82dba5dbedd91156265a71456e0117aa02cf28b1daa1b`, `metadata-witness.py` `d87ce635419b9b51f60ac1d864dbed555f7a4d43596e9697cbb8b5fb04959c5b`; `check-user-round-contract.mjs` `f9be3a72…` and all docs were unchanged at T2. I re-read the T2 checker's anchors/Node logic (same values and lines; header `:9`/`:14` unchanged).
- Attacked historical source bytes never moved: `receipt.json` `b458b351…a1989b7`, `aria-loopback.spec.mjs` `03cb4e17…d7e4fc`, `runtime-pin.json` `4d894756…16ccd2`, launcher `scripts/aria-loopback-round13.mjs` `1d54c9e9…4af9c`. The S029 facts below therefore rest on bytes that are stable across T0/T1.
- I did **not** adjudicate the outside-review Node erratum. F1 is about the delivered correction's own wording, not the frozen outside review.

## 2. Verified facts (observed, with pointers)

1. **Receipt digest is authentic and immutable.** `source-index.json:11` quotes `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`; the working file and `git cat-file -p 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json` both hash to it. `837b33a` is an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) and the defining round13 commit. `git diff 837b33a HEAD` and `git diff 7054a5e HEAD` over the round13 receipt/spec/pin are empty.
2. **Pointer and located quote are exact.** `corpus/evidence/round-13/aria/receipt.json:2529` is `"listeningAfter": false` inside `cleanup.server.perWorker[0]`; the quote is 2 whitespace-separated words (`len('"listeningAfter": false'.split()) == 2`), inside the ≤25-word contract. The same literal also occurs at `:656`; the anchor path disambiguates. Aggregate `cleanup.server.listeningAfter` is `true` at `:2521`, and `perWorker` has exactly one entry, so “worker false vs aggregate true” is true of these bytes.
3. **Node pointers and values are exact.** `receipt.json:20` `runtime.node = "26.12.0"`; `receipt.json` `pin.node = {"recorded":"24.21.0","minimumMajor":20}`. The embedded `pin` object is JSON-equal to `corpus/evidence/round-13/aria/runtime-pin.json` (whole-object equality by parsing both), whose sha256 `4d894756…16ccd2` equals `receipt.runtime.pinned.pinSha256` and `ANCHORS.pinSha256` (`check-aria-metadata.mjs:149` at T0, `:149` at T1). `source-index.json:15-21` matches its claimed pointers (`runtime.node`, `pin.node`), values, `recorded`, and `minimumMajor`.
4. **Spec enforcement anchors are exact.** `aria-loopback.spec.mjs:262` defines `assertPinnedRuntime()`; `:269` is `expect(RUNTIME.nodeMajor).toBeGreaterThanOrEqual(PIN.node.minimumMajor);`; the per-case driver is `for (const caseDef of CASE_ORDER) { test(…` at `:882-883`, and `assertPinnedRuntime();` is at `:924` in every case body. The spec digest `03cb4e17…d7e4fc` is identical in `source-index.json:24`, `ANCHORS.specSha256` (`check-aria-metadata.mjs:151` both states), and `receipt.source.specSha256` (`receipt.json:15-16`).
5. **Retrospective checker re-evaluates the minimum predicate.** `deriveNode()` (T0 `check-aria-metadata.mjs:525-547`; T1 `:524-546`) computes `minimumSatisfied` from `receipt.runtime.node` and `pin.node.minimumMajor`; `evaluateNode()` emits `R14-ARIA-NODE-MINIMUM-01` (T1 `:571`). It never parses `:269`; it authenticates the spec bytes by digest (`:711`, `:738`) and recomputes the predicate over the recorded observation. The T1 checker header states the same: “Node is not part of the runtime pin match” (`:9`) and “the producer's runtime pin match (receipt.runtime.pinned.matched) covers only Playwright, Chromium and browser version; it never includes Node” (`:12-15`).
6. **Immutable registry cells untouched; used-by is lessons-only.** Field-by-field comparison of the `S029` row at baseline vs working tree (13 fields) shows **only field 11 (`used-by`)** changed: `corpus/lessons/round-14.md` → `corpus/lessons/round-14.md, corpus/lessons/round-15.md`. `status=mined`, `opened=2026-10-20`, `recheck=365d`, tier/kind/scope/anchor/teaches are byte-identical. `corpus/lessons/round-15.md` exists and cites `S029` at `:18`/`:20`; `check-sources.mjs:203-241` (`inspectUsedBy`) will classify it `cited` (existence plus non-digit-bounded ID match). The claim holds for both T0 and T1 (`corpus/SOURCES.md` unchanged).
7. **Historical bytes referenced as unchanged are unchanged.** Baseline→HEAD diff over `corpus/evidence/round-13` and `corpus/evidence/round-14` is empty; working tree is clean for `corpus/evidence/round-14` and `corpus/lessons/round-14-verifier-spotcheck.md` (sha256 `1e882d2e47cf8ff78d60e4e694435536b1aaea367517b8bede6cf4327ff2a358`). The sidecar `corrected.json` `e156b922…` is untouched.
8. **The wave1 D1 defect is substantively fixed.** `source-index.json:15-21` carries the Node pointers/values wave1 `HistoricalSourceIndex.md` (05:06) said were missing; the index (mtime 05:08) postdates that report. Both the cleanup anchor and the Node fields are cited.

## 3. Defects and current status

### F1 — medium (historical; fixed in four places at T1, still present in committed `LOG.md`)

At T0, four delivered files said the launcher itself omits Node:

- `source-index.json:28` (T0 `fbfdb330…`) — “The launcher and runtimePinStatus summary omit Node, not the entire historical experiment.”
- `SKILL.md:1771-1772` (T0 `e3b1e39c…`) — “The launcher `scripts/aria-loopback-round13.mjs` and the spec's `runtimePinStatus()` summary omit Node”.
- `corpus/lessons/round-15.md:37` (T0 `72f53c9d…`) — same shorthand.
- `corpus/README.md` and `LOG.md:845-846`.

Counter-evidence (unchanged launcher): `scripts/aria-loopback-round13.mjs:405` records `node: runtimeSource?.node ?? process.versions.node`, and `:92` records it in failure receipts; that value is exactly `receipt.json:20` `runtime.node = "26.12.0"`. What omits Node is the match computation: `runtimePinMatched = playwrightMatched && chromiumMatched && browserVersionMatched` (`:403`), with `runtime.pinned` keys at `:423-431` containing no `node`; the spec's `runtimePinStatus()` (`:241-259`) likewise. The checker header says it precisely at `:9`/`:12-15`.

At T1 the wording is corrected in `source-index.json:28` (“The launcher's runtime.pinned summary and the spec's runtimePinStatus summary omit Node; the launcher still records runtime.node”), `SKILL.md:1771-1774`, `corpus/README.md:276-280`, and `corpus/lessons/round-15.md:40`. **Still outstanding at T1:** `LOG.md:845-846` (committed at `72dcf03`) still reads “the launcher and `runtimePinStatus()` omit Node”. L1 owns `LOG.md`; the bounded correction is the same sentence now used in SKILL/README/index. This report does not claim who changed the T0 wording, only the observed bytes.

### F2 — low — `minimumEnforcementSource.assertion` names the function at a line that is not the function (still present at T1)

`source-index.json:25` both states: `"assertion": "assertPinnedRuntime():269"`. Line 269 is the `expect(RUNTIME.nodeMajor >= PIN.node.minimumMajor)` statement; the function is defined at `:262`. The `boundary` string (`:28`) is correct (“checks Node minimumMajor at …:269”). **Bounded correction:** `"assertion": "expect(RUNTIME.nodeMajor >= PIN.node.minimumMajor):269 (in assertPinnedRuntime, defined :262)"`.

### F3 — medium — the named build revision and its digest table no longer identify the delivered/working bytes

At T0 the revision already excluded the S029 trace (see §1). At T1 the four `build-snapshot.sha256` entries are stale as well, and two of them moved again by T2 (see §1): all four files differ from the snapshot, and `scripts/check-aria-metadata.mjs` / `scripts/check-user-round-contract.mjs` are now modified relative to HEAD (`git status`: ` M scripts/check-aria-metadata.mjs`, ` M scripts/check-user-round-contract.mjs`), while `measure.mjs` / `metadata-witness.py` remain untracked. Consequences: a verifier anchored on `72dcf03` + snapshot digests sees a `snapshot_tampered`-class mismatch for the very gate under review, and the S029 index/lesson/used-by transition are invisible at that revision. **Bounded correction (L1-owned):** publish a freeze snapshot naming the final revision and the sha256 of every attacked byte (including `source-index.json`, `corpus/lessons/round-15.md`, `corpus/SOURCES.md`, and the four code/probe files), or explicitly label the snapshot as pre-freeze. If code edits are still converging, do not label the snapshot “the build”.

### F4 — low — the “direct” S029 trace is documentation-only; no script reads it (still present at T1)

`grep -rn "source-index" scripts/*.mjs .ufo/waves/round-15/measure.mjs .ufo/waves/round-15/metadata-witness.py` returns no hits (`NO_HITS`); at T2 `grep -c "source-index" scripts/check-aria-metadata.mjs` = `0`. The index's digests are author assertions; I verified them by hand and they agree. That satisfies the round14 routed item verbatim (“direct S029 reference … in its evidence index”), but a mutated index digest would be caught by no checker. **Bounded correction:** add a static read (compare `historicalReceipt.sha256` / `minimumEnforcementSource.sha256` to the files, and `sourceRows` to an existing `SOURCES.md` ID), or state “documentation trace; author-verified, not gate-enforced” at `SKILL.md:1785-1787` and lesson §5.

### F5 — low — `pinPointer` is a receipt path, not the pin file, and its digest is not stated (still present at T1)

`source-index.json:18` `"pinPointer": "pin.node"` resolves inside `receipt.json` (embedded pin), not to `corpus/evidence/round-13/aria/runtime-pin.json`. The values are transitively authenticated by the receipt digest because the embedded pin is JSON-equal to the file, but the index does not say so. **Bounded correction:** `"pinPointer": "pin.node (embedded runtime-pin.json copy; pinSha256 4d8947…)"` or add `"pinSha256": "4d894756…16ccd2"`.

### F6 — low — “frozen v1” used-by definition has no in-repo pointer (still present at T1)

`corpus/lessons/round-15.md:20` says “`used-by` stays lessons/knowledge paths under frozen v1”. No SKILL/SOURCES/README/script text defines that frozen v1 rule; the nearest sources are `corpus/lessons/round-13.md:31` (“resolvable cited knowledge, not a second corpus index”) and `.ufo/waves/round-14/w1/SourceCensus.md:135`. `check-sources.mjs` itself accepts any existing in-root path that cites the ID (`:203-241`), so the lessons-only rule is convention, not validator-enforced. **Bounded correction:** cite `round-13.md:31` (and note the validator behavior), or drop “frozen v1”.

## 4. Temporal limits (not success)

1. **C2 differential receipt is absent** at T1: `corpus/evidence/round-15/metadata-differential.json` ENOENT. `measure.mjs` names it as `C2_RECEIPT` (T0 `:151`; T1 line number not re-read after the latest edit) and its `countC2` returns `round-15 metadata differential receipt missing` when absent (source reading, not execution). No C2 count, red/green, or mirror-enforcement result is claimed here; the S029 index is not the C2 receipt.
2. **Lesson execution evidence is still pending**: `corpus/lessons/round-15.md:57-59` says receipts are added before first commit and the section is empty at T1. `SKILL.md:1787-1789`'s present-tense “records … actual exercised evidence” is therefore not yet true of the attacked/current lesson. L1 owns that integration.
3. **Untracked lesson risk at gate time**: the working-tree `S029` used-by passes `inspectUsedBy` only because `corpus/lessons/round-15.md` exists untracked. A census run against revision `72dcf03` sees the round14-only used-by and no index (F3); if the lesson is lost or renamed, the row becomes `used_by_missing`.
4. **Concurrent edits**: T1 digests moved again during the attack (`measure.mjs` changed between 05:35:48 and 05:36:59). Re-hash before any gate or verdict.

## 5. Commands L1 can run to reproduce (read-only)

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
sha256sum corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/aria-loopback.spec.mjs \
  corpus/evidence/round-13/aria/runtime-pin.json scripts/aria-loopback-round13.mjs \
  corpus/evidence/round-15/source-index.json corpus/lessons/round-15.md
git cat-file -p 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json | sha256sum
git show 72dcf031b9da24796b718517ea575f21e4f7caae:corpus/SOURCES.md | grep '^| S029 '
git cat-file -e 72dcf031b9da24796b718517ea575f21e4f7caae:corpus/evidence/round-15/source-index.json; echo $?
sed -n '262,269p;882,883p;924p' corpus/evidence/round-13/aria/aria-loopback.spec.mjs
sed -n '92p;403,405p;423,431p' scripts/aria-loopback-round13.mjs
grep -n 'S029' corpus/lessons/round-15.md corpus/evidence/round-15/source-index.json
grep -rn 'source-index' scripts/*.mjs .ufo/waves/round-15/measure.mjs .ufo/waves/round-15/metadata-witness.py  # expect none (F4)
sha256sum -c <<'EOF'
b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  corpus/evidence/round-13/aria/receipt.json
03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc  corpus/evidence/round-13/aria/aria-loopback.spec.mjs
4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2  corpus/evidence/round-13/aria/runtime-pin.json
EOF
```

## Verdict for this seat

Against the immutable round13 bytes, the S029 **pointer, quote, receipt/commit digest, Node fields, spec :269/:924 anchors, checker minimum re-evaluation, and all immutable registry cells are correct**; only `used-by` changed, and it stayed lessons-only. Against the moving delivery, F1 was real at T0 and is now corrected in the index/SKILL/README/lesson but **persists in committed `LOG.md:845-846`**; F2, F4, F5, F6 persist at T1; F3 is now the largest identity risk because the named snapshot revision/digests no longer match the working tree and never contained the S029 trace. Nothing here certifies C2's 0→1 claim: the C2 differential receipt is absent and this author-side report is not an outside verdict.
