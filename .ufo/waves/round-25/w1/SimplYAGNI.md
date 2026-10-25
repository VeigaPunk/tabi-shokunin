# SimplYAGNI — YAGNI pass over the round-25 plan (tabi, hyaku run 6)

Seat: `L1Tabi25.SimplYAGNI` (simplifier, read-only, lane-dispatched; not a non-author verifier).
Writes: this file only. A throwaway `/tmp/simpl-yagni-rows.tsv` was created during the census below and
then deleted (`rm -f /tmp/simpl-yagni-rows.tsv && ls` → "No such file or directory"). Tool installs: none.
No frozen claim field is changed or proposed for change. Lane tip observed: `git rev-parse HEAD` →
`c8ef3084c6363f265b9d23285296ab3547654f57`. At report time `git status --porcelain` also shows two
untracked counter drafts, `scripts/check-bfcache-receipt.mjs` and `scripts/check-source-reopen-receipt.mjs`
(302 lines each, `wc -l`). They are not mine. I read them and did not run them.

Axes used: **correctness** (the frozen predicate is implemented exactly, with no vacuous pass),
**weight** (artifacts, seats and lines), **single authority** (no second convention), and
**evidence strength** (re-derivable from committed bytes).

## 1. TL;DR

- **C1 cannot be measured with only a receipt and `check-measurement-binding.mjs`.** The binding gate
  runs a counter. It never parses a receipt. It also cannot reproduce the before arm, because the frozen
  kill rule makes that arm exit 2. `scripts/check-bfcache-receipt.mjs` is required, and so is its gate
  registry row. A binding manifest would be extra weight that no frozen claim asks for.
- **The C2 counter script is required, but its fetcher, normalizer and verdict vocabulary are not.**
  Reuse `.ufo/waves/round-18/recheck-fetch.mjs`, which is already registered and already produced
  receipts for these exact six rows. The C2 counter can then be a thin reader over its receipts.
  The current C2 draft has two cheap-to-fix vacuities that this reuse closes (§3.3).
- **Six rows is not the minimum.** One re-opened row would move the counter. Six is not a
  representative sample either. It is frozen, so the honest move is disclosure: say how the rows were
  chosen, name the omitted rows of the same class, and state that today's bytes are byte-identical to
  the 2026-10-20 round-18 re-open (§4).
- **Dead weight in the wave plan:** three seats fetched the same six pages, three to five seats built
  the same counters and control scores, two built the same loopback probe, and five more seats (or
  their outputs) are not needed by any frozen claim or by the report contract (§5).

## 2. C1: is a separate counter needed, or does receipt plus `check-measurement-binding.mjs` suffice?

**Verdict: the separate counter is needed. The binding gate is complementary, and it is optional this
round.**

1. **The claim freezes the counter path.** `claims.json` sets C1 `countingCommand` to
   `node scripts/check-bfcache-receipt.mjs --rev <REV> --json`, and `failureCapable` to `... --selftest`.
   Dropping the script would change a frozen claim.
2. **The binding gate checks a counter's identity, not a receipt's content.** Its manifest shape
   (`scripts/check-measurement-binding.mjs:33-46`) requires a `counter.path` plus an `argv` that runs it
   (`argv[0]=="node"`, `argv[1]==counter.path`, exactly one `{REV}` token, `:69`, `:519`). It parses
   nothing from a receipt, so it cannot test for a history step, the forbidden flag, raw
   `Page.frameNavigated` traceability, or loaderId continuity.
3. **It compares only one count.** `--reproduce` compares `parsed[counter.countField]` with the expected
   count (`:646-656`). C1's target is a pair (`restores>=1` **and** `valid=true`), so the binding gate
   cannot express it.
4. **`--reproduce` cannot work for C1 or C2.** It always runs the before arm at `before.revision`
   (`:643`). At the baseline the receipt is absent. The frozen kill rule ("missing at the measured
   revision is could-not-evaluate, never 0") makes the counter exit 2 there. `reproduceArm` returns
   `ok:false` on any non-zero exit (`:550`), which yields `counter_failed`. The same holds for C2. A
   binding manifest could therefore only run without `--reproduce`. In that mode it adds blob-digest,
   ancestry and input-drift binding, which no frozen claim requires. Binding manifests were last
   committed in round 18 (`git ls-tree --name-only HEAD .ufo/waves/round-18/` shows
   `measurement-binding.json`; `git ls-tree -r --name-only HEAD -- corpus/evidence | grep -c
   measurement-binding.json` → 2, rounds 16 and 17). Rounds 19–24 shipped measurement receipts without
   them. **Recommendation: do not add a manifest this round.**
5. **The registry row is forced too.** `check-bfcache-receipt.mjs` matches `GATE_CONVENTION
   /^(check-[a-z0-9-]+|...)\.mjs$/` (`scripts/check-gate-registry.mjs:58`). The gate's own header says a
   convention-named script registered as `probe` "then its kind is a defect". So one eight-field
   `gate` row is unavoidable. The same applies to C2.

**Smallest C1 design that satisfies the frozen claim:**

- **One committed receipt, `corpus/evidence/round-25/bfcache/receipt.json`.** It carries inline raw
  `Page.frameNavigated` events, the commands sent, the effective argv/flags, and an events digest.
  The digest is frozen as a self-test case ("digest mismatch"), so keep it, but describe it as an
  integrity check only. Anyone forging the events can recompute it; ExecControlScore already built
  `scratch/ExecControlScore/forged-selfdigest-bfcache.json` to show this.
- **Do not commit** screenshots (`scratch/ExecHarnessC1/runs/positive/{1-a,2-b,3-a-back}.png`),
  `chromium.log`, or the `profile/` dir. The profile is browser-session material and must never enter
  the corpus.
- **loaderId continuity is the one check worth its weight**, and the in-tree draft already has it
  (`f8-loaderid-continuity`, `scripts/check-bfcache-receipt.mjs:32-34,138-149`). It is the mechanical form
  of the frozen "matching before/after target" clause. I observed it in the scratch positive run:
  `node -e` over `scratch/ExecHarnessC1/runs/positive/events.jsonl` printed A `Navigation
  loader=2B46977C…`, B `Navigation loader=86B82A30…`, A `BackForwardCacheRestore loader=2B46977C…`.
- **Dead weight in the C1 draft: `f9-page-witness`** (`:35-37`, `:150-153`). It requires
  `run.page_side.persisted && state_survived`. This is not in the frozen kill rule, so it makes the
  counter's predicate stricter than the frozen one. A real restore could then score `valid=false` if the
  harness failed to capture pageshow, which is a miss caused by bookkeeping, not by the browser.
  Recommendation: report it as a non-blocking field, or delete it. `f7-non-loopback` is implied by
  "loopback fixture" and is fine to keep.
- **Disclosure needed, not a change.** The frozen text says "via CDP `Page.goBack`", but that method does
  not exist on this build. Observed in `scratch/ExecHarnessC1/runs/positive/events.jsonl`:
  `"error":{"code":-32601,"message":"'Page.goBack' wasn't found"}`. The commands log shows the history
  step went through `Page.navigateToHistoryEntry` (`grep -o '"method":"[A-Za-z.]*"' commands.jsonl |
  sort | uniq -c` → 1 `Page.goBack`, 1 `Page.navigateToHistoryEntry`, 2 `Page.getNavigationHistory`).
  Keep the single failed `Page.goBack` attempt in the receipt as grounding. Label the step `goBack`
  (the action) with `method: Page.navigateToHistoryEntry`, and say so in the entry and the report.
- **One probe, named outside the gate convention** so it needs no gate row. Use the existing probe
  precedent: `scripts/webmcp-lifecycle-round21.mjs` registered as `probe` at `SKILL.md:2390`, or a wave
  dir like round 18's `measure-c*.mjs`. The frozen claim needs only A→B→history step, the
  frameNavigated stream, and flags. `Network.enable` and `Page.captureScreenshot` are not needed.
- **The `--disable-back-forward-cache` live trip is optional.** The frozen controls are the forged
  receipt and the no-history run. The disable trip strengthens attribution, so keep it as scratch or
  entry evidence. It is not a counter input.

## 3. C2: is the second gate script justified, or is a receipt-only check enough?

**Verdict: the script is required, because its path and `--selftest` are frozen. Everything around it
should be reuse, not new code.**

### 3.1 An existing authority already does the fetch-and-locate work

`.ufo/waves/round-18/recheck-fetch.mjs` (147 lines) is tracked and registered as a probe at
`SKILL.md:2029` ("source fetch / probe … 0 quote found, 1 quote absent, 2 could-not-evaluate"). Its
header (`:3`) says: "Shared by every recheck seat so receipts share one schema and one normalizer."
It exports `decodeBody` and `normalize`, and only runs its CLI when invoked directly (`:147`), so it is
safe to import. Each receipt it writes carries `httpStatus`, `bytes`, `sha256`, `fetchedAt`, a
gzipped body with its digest, an `excerpt` with its digest, `quote`, `quoteSource`, `quoteFound`, and
`teachesVerdict ∈ held|drift|unreachable`. That covers every field C2's kill rule needs, and
`unreachable` maps 1:1 to the kill rule's per-row could-not-evaluate.

It has already re-opened **these exact six rows**:
`git ls-tree -r --name-only HEAD corpus/evidence/round-18 | grep 'source-recheck/S0(13|15|16|20|23|24)'`
lists `S0NN.json`, `.excerpt.txt` and `.body.gz` for all six. All have `fetchedAt` 2026-10-20,
`quoteFound=true`, `verdict=held`, and `quoteSource=corpus/lessons/kaika-fleet-round-1.md:56/58/59/63/66/67`
(read with `git show HEAD:…/S0NN.json | node -e …`).

### 3.2 The wave plan created second conventions

- **A second verdict vocabulary.** `holds|drifted|absent` appears in the ExecCounterC2Proto and
  MutC2Counter prompts (`w1-spec.json`), in `scratch/ExecControlScore/ref-check-source-reopen-receipt.mjs`,
  and in the in-tree draft (`scripts/check-source-reopen-receipt.mjs:23-28,127-134`). It is not in the
  frozen claim. Adopt `held|drift|unreachable`.
- **A second normalizer.** `w1/ScoutFreshnessReopen.md:81` notes its normalizer "differs from
  `recheck-fetch.mjs normalize()`".
- **A second fetch layout.** The draft reads `bytes_path` raw HTML
  (`check-source-reopen-receipt.mjs:121,181`), while round 18 used `S0NN.body.gz` plus an excerpt.

**Smallest C2 design:**

1. **Fetch with the existing producer.** Run `recheck-fetch.mjs` once per row with
   `--outdir corpus/evidence/round-25/freshness/rows`. Take `--quote` and `--quote-source` from
   `corpus/lessons/kaika-fleet-round-1.md:56,58,59,63,66,67`.
2. **Make `reopened.json` a six-entry index:** `{id, receipt: "rows/S0NN.json", supersededBy: null}`.
3. **Make the counter a thin reader at `--rev`.** For each declared id, exactly once:
   - Gunzip the committed body and check that it matches `sha256`.
   - Check `httpStatus==200`. Anything else is per-row could-not-evaluate, and more than one such row
     means the target misses. This follows the frozen kill rule.
   - Check `fetchedAt >= 2026-10-25`.
   - Check that the receipt's `quote` equals the held quote at its `quoteSource`.
   - Re-locate it with `normalize(decodeBody(body))`, importing both functions from
     `recheck-fetch.mjs`, rather than trusting `quoteFound`.
   - For `drift`, require that `supersededBy` resolves to a SOURCES row at REV with `opened=2026-10-25`
     whose teaches opens `supersedes <this id> —`.
4. **Storage cost is likely about zero** [INFERENCE]. Today's bytes equal the round-18 bytes (§4), and
   `gzipSync(..., {mtime: 0})` is deterministic for the same zlib, so git should store the same blobs.
   Round-18 body sizes total 144,740 bytes (`git cat-file -s HEAD:…/S0NN.body.gz`, summed).
5. **Do not write a freshness knowledge note** (ScribeEntryFreshness →
   `corpus/knowledge/source-recheck-round-25.md`). C2 does not require it. The report contract only asks
   for "Rows touched, old→new". If all six hold, no row is touched and the note teaches nothing new. The
   receipt plus the LOG/SCORECARD lines carry the record.

### 3.3 Must-fix vacuities in the in-tree C2 draft (reuse closes the first two)

- **The quote is never checked against the bytes.** `verdict=holds` resolves when `located_quote` is any
  non-empty string (`:127-130`). The draft never checks that the string is the held quote, that it occurs
  in the committed bytes, or that `sha256` matches `bytes_path` (`:121` only tests that the path exists).
- **Non-200 rows have no could-not-evaluate path.** The draft has no `httpStatus` handling, so this
  frozen kill-rule clause is not implemented.
- **One row repeated six times passes.** `reopened = rows.length` (`:110`), and each row is only tested
  with `EXPECTED_IDS.includes(row.id)` (`:112`). Six copies of the S013 row therefore score
  `reopened=6, unresolved=0, clean`. The fix is a per-id `Set` and requiring every declared id. This is a
  code-reading inference: I did not run the draft.
- **Lenient supersession test.** It accepts any teaches containing "supersedes" (`:137`), instead of
  `supersedes <reopened id> —`.

### 3.4 Controls

Both frozen controls fail for shallow reasons. `skipwork-freshness.json` uses a `fetchDigest:
"legacy-2026-10-19"` field that is not even a digest. `fake-receipt-bfcache.json` has `events: []`.
Both stay as frozen. For C2, the honest discriminating control is free: the real round-18 receipts for
the same six rows. They have the same `sha256` as today and fail **only** on `fetchedAt` (2026-10-20).

## 4. Is six rows the minimum honest freshness sample?

- **Not the minimum.** One re-opened row would move `reopened` from 0. The six are frozen, so this is
  disclosure only.
- **Not representative.** I parsed the registry with awk over `corpus/SOURCES.md` table rows:
  - 105 rows in total; recheck cells are 80 on-release, 13 at 90d, 8 at 180d, 4 at 365d.
  - Of the on-release rows: 55 mined, 16 queued, 9 rejected.
  - The six are 6 of 55 mined on-release rows.
  - Among mined on-release rows with rolling (unpinned) URLs opened 2026-10-19, the class the six come
    from, there are 11: S001, S004, S013, S014, S015, S016, S017, S020, S023, S024, S028. S004 was
    superseded by S028 according to `corpus/knowledge/source-recheck-round-18.md` §1. So the omitted
    live rows of the same class are **S001, S014, S017 and S028**.
- **Low information.** Today's bytes are byte-identical to the round-18 re-open. Comparing
  `sha256sum` of `scratch/CritC2Vacuity/S0NN.html` with `sha256` in
  `corpus/evidence/round-18/source-recheck/S0NN.json` gives an equal 16-hex prefix for all six:
  `cf48ff4d…`, `31075410…`, `1bb8afe8…`, `56275966…`, `234a2452…`, `bbbad688…`. So C2 measures "no
  upstream change since 2026-10-20". A consequence: `sha256` cannot prove the fetch happened this round.
  Only `fetchedAt` (self-reported) and the commit chronology can. That is a limit to disclose, not
  something to engineer around this round.
- **Honest framing:** the report should say "the six named rows" and state four things: the selection
  rule, the four omitted same-class rows, the prior 2026-10-20 re-open of the same six, and the byte
  identity. Narrowing the claim is not an option, because it is frozen.

## 5. Dead weight in the wave plan

The candidates below are measured against the frozen claims and the report contract, using
`w1/ScoutReportContract.md` §A/D for the contract.

| Item(s) | Why it is weight | Evidence | Keep instead |
|---|---|---|---|
| ScoutFreshnessReopen + ExecFreshnessReceipt + CritC2Vacuity, each fetching the six pages | Three fetchers of the same bytes, plus an existing producer | `ls scratch/CritC2Vacuity/` shows six `.html`; `ls scratch/ExecFreshnessReceipt/bytes`; `scratch/ScoutFreshnessReopen` | One fetch at integration with `recheck-fetch.mjs` |
| ExecCounterC1Proto, ExecCounterC2Proto, ExecControlScore `ref-check-*.mjs`, MutC1Counter, MutC2Counter | Four to five independent counter specs and two control-scoring authorities (the proto prompts already score the controls and the naive grep) | `wc -l`: protos 180 lines; `ref-check-bfcache-receipt.mjs` 37, `ref-check-source-reopen-receipt.mjs` 35; in-tree drafts 302 each | One counter per claim (the in-tree drafts, fixed per §2/§3.3) and one control receipt |
| ExecBfcacheDiagnostics alongside ExecHarnessC1 | Both ran A→B→back and both saw restores | `grep -rho '"type": *"[A-Za-z]*"' …/runs` → 9 `BackForwardCacheRestore` across the two scratch dirs; `wc -l` driver 89 vs probe 353 | One probe; the smaller one suffices for the frozen needs |
| ScoutBfcacheHazards | Was meant to feed harness design, but restores were already observed, so nothing it finds now changes C1 | same grep | Use it only for the entry's Unknowns |
| ScoutGateTallyRefresh (baseline self-test tallies) | The L1 runs every gate at the tip after integration. SCORECARD tallies are checked against the tip by `check-selfassessment.mjs`, and round 24's `m1-selftest-tally` class was found at the tip | `corpus/evidence/round-24/c2-measurements.json` `before.counted[].class` | The L1's single tip run |
| ScoutWavePolicy (role-to-model route table) | The report needs a seat's model "where a claim depends on it". No round-25 claim depends on a model | `w1/ScoutReportContract.md` §D | Wave sizes and role mix from `w1-dispatch.json` |
| ScribeEntryFreshness | No admission content if 6/6 hold; not required (§3.2) | ScoutFreshnessReopen: "All six rows **hold**" | Receipt plus LOG/SCORECARD lines |
| The superseding-row parts of ScribeSOURCESRows / ExecFreshnessReceipt | No row drifted, so there is nothing to supersede. The S106 row is still required | same | S106 row only |
| `f9-page-witness` in the C1 draft | Stricter than the frozen predicate (§2) | `check-bfcache-receipt.mjs:35-37` | Non-blocking field |

**Not dead weight; keep:** the C1 knowledge entry (the frozen claim names it), S106, the census
before/after, the M1 lesson (the contract says to turn the round-24 spot-check's routed defect into a
lesson-backed criterion or a fix), both gate registry rows (forced), assimilation prep and re-grounding
(a frontier step), and RevGateRegistryImpact.

## 6. Risk in the M1 falsifier (the lesson plan, not a claim)

ScribeLesson25's proposed criterion 66 says it fails "if the ExecLessonEvidence mismatched manifest exits
0 under `check-measurement-binding.mjs --check … --reproduce`". The actual round-24 M1 shape does not trip
that gate:

- `git merge-base --is-ancestor 4722dba 8bc1d32` succeeds, so the pinned revision is an ancestor of the
  cited one.
- `git diff --name-only 4722dba 8bc1d32` lists only `corpus/evidence/round-24/c1-tip.json` and
  `c2-tip.json`.
- `measured_revision_not_ancestor` (`:576`) only fires on non-ancestors.
- `counted_input_changed` (`:613`) only fires when declared inputs change.

So a fixture that matches M1 exits clean. A fixture that does fail must use a non-ancestor revision or
changed inputs, which is a different defect. "Captured-by: none" is accurate. Using the binding gate as
M1's falsifier would be vacuous. The cheapest honest falsifier is the committed round-24 bytes
themselves: `2f35bd4` in `*-measurements.json`, `4722dba` in `*-tip.json`, and `8bc1d32` cited, as
ScribeLesson25 already quotes. Do not build a new gate for M1 this round, since it is not a claim.

## 7. Preserved contract and tradeoffs

- **Preserved:** every frozen field in `claims.json` (counting commands, counter fields, kill rules,
  controls, failure-capable self-test cases, the six row ids); append-only SOURCES; the gate-registry
  convention; and round-18 provenance (`recheck-fetch.mjs` is imported, never moved or edited).
- **Tradeoff 1: cross-directory import.** A `scripts/` gate importing from `.ufo/waves/round-18/` couples
  the two. The alternatives are copying the normalizer (a second convention) or moving the file (rewriting
  round-18 provenance). The import is the lightest. The registry row's pinned-value cell should name
  `recheck-fetch.mjs` as an input.
- **Tradeoff 2: dropping `f9`** removes a second witness of restore. The loaderId continuity check remains
  the structural witness.
- **Stop point:** removing anything more (the disable-bfcache trip, the digest, S106, the entry, or the
  registry rows) would weaken evidence or break a frozen clause.
