# ReviewPopulation — case-set integrity and population review (round22 / w2b)

Scope (from `.ufo/waves/round-22/w2b-spec.json` → item `ReviewPopulation`): duplicate / missing /
reordered receipt cases, extra raw files, CASE_IDS vs expectations order, and confirmation of
population 12→12 with no new observation (`claim-classification.json`).

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (all production blobs read with
  `git -C … show e3cf4e0d…:PATH`)
- Method: **static only**. No lane script was executed (this item forbids execution), no browser,
  no installs, no delegation, no seat messaging, no VCS mutation. Only read-only
  `git show` / `git ls-tree` / `git log` / `git diff` / `git status` plus `python3` JSON parsing of
  already-committed blobs (all exited 0). The counterexamples below are **derived by code reading,
  not executed** — stated as such at each finding.

---

## 1. Verdict summary

The **population claim holds on the evidence in the tree**: at `e3cf4e0d` the retained round-21
runtime corpus is byte-identical to the round-21 commit, the receipt case set is exactly the 12
`CASE_IDS` in order with no duplicates and no missing rows, the expectations file is digest-pinned
and its case order equals `CASE_IDS`, there are no extra raw files, and the head cohort receipt
records `c1_semantically_checked_lifecycle_rows = 12` over those same 12 rows.

Four **coverage/defect findings** remain, all of them about *what the oracle can still detect*, not
about a wrong number today:

| # | Severity | Finding | Live miscount today? |
|---|----------|---------|----------------------|
| F1 | Medium | "Extra raw file in the retained runtime directory" is undetectable by the round-22 oracle; the still-shipped round-21 oracle does detect it (property lost in the rewrite) | No (verified: exactly 25 files, clean tree) |
| F2 | Medium | The receipt **order** sensitivity of the case-set check is **unfalsified** — no selftest mutant distinguishes order-sensitive equality from set equality, and the legacy implementation used set equality | No (production code catches it) |
| F3 | Low–Medium | Cross-case **nonce uniqueness** (population distinctness) was dropped in the rewrite; the legacy oracle still enforces it → two shipped oracles can disagree on one tree | No (12 nonces verified pairwise distinct) |
| F4 | Low | The receipt **request log** (13 GETs) is read by neither oracle → an acquisition that made an extra page load is invisible; "population is exactly these 12 observations" is not falsifiable from the receipt | No |
| F5 | Low | `claim-classification.json` `populationBefore: 12` is **asserted, not measured** in this wave (no `lifecycle21-before` gate at the round-22 baseline) | n/a — evidence gap |

---

## 2. Findings

### F1 — Medium — Extra raw files in the retained runtime directory are invisible to the round-22 oracle (property held by the round-21 oracle, lost in the rewrite)

**Where (revision `e3cf4e0d`)**

- `.ufo/waves/round-22/measure-c1.mjs:36-41` — `CASE_ARTIFACT_PATHS` / `INPUT_PATHS` enumerate
  exactly the 24 known case artifacts plus `receipt.json` (+ expectations, note, producer,
  execution record).
- `.ufo/waves/round-22/measure-c1.mjs:513-518` — `filesAt()` runs
  `git ls-tree -r -z revision -- …INPUT_PATHS`, i.e. the tree is enumerated **only** for those
  literal paths; `allowed` is built from the same list.
- `.ufo/waves/round-22/measure-c1.mjs:416-429` — the acquisition check compares
  `Object.keys(execution.artifacts).sort()` (`:424`) against the **hard-coded**
  `ACQUISITION_ARTIFACT_PATHS` (`:37`, `:416-417`); a mismatch adds
  `'evidence_binding' 'acquisition-identity-or-artifact-set'` (`:428-429`). It therefore detects
  extra artifacts *declared in the manifest*, but never extra files *present in the tree*.

**Preserving positive (the property that used to exist)**

- `.ufo/waves/round-21/measure-c1.mjs:32` — legacy `INPUT_PATHS` ends with `PREFIX`
  (`corpus/evidence/round-21/runtime/`), i.e. the **whole directory** is enumerated from the tree.
- `.ufo/waves/round-21/measure-c1.mjs:69-70` — `runtimePaths` (every file the tree contains under
  the prefix) is compared with `Object.keys(execution.artifacts)`; a mismatch adds
  `'execution_binding'` → exit 1.

**Smallest counterexample (not executed)**

Commit one extra blob under `corpus/evidence/round-21/runtime/` at the measured revision (e.g.
`na-extra.json`) and leave the manifest unchanged:

- round-22 oracle: the path is not in `INPUT_PATHS`, so `filesAt()` never sees it →
  `value 12`, `verdict clean`, `exit 0` — an *unaccounted* observation sits in the retained corpus
  and the metric still reports a clean 12 over it.
- round-21 oracle at the same revision: `runtimePaths` = 26 vs `execution.artifacts` = 25 →
  `'execution_binding'` → `exit 1`.

Two oracles shipped in the same tree disagree about the same corpus, and the *operative* one
(round-22) is the permissive one. This is exactly the "extra raw files" property named in the item
scope, and it is the one property that regressed relative to the predecessor implementation.

**Smallest fix**

In `measure-c1.mjs`, enumerate the runtime directory at the measured revision independently of
`INPUT_PATHS` (e.g. `git ls-tree -r -z <rev> -- corpus/evidence/round-21/runtime/`), and when the
enumerated path set ≠ `ACQUISITION_ARTIFACT_PATHS`, add
`addFinding(findings, 'case_set', 'runtime-directory-artifact-set')` (or `'evidence_binding'`).
Add a matching selftest mutant `extra-raw-file` (commit an extra file under the prefix) with an
`expected.json` entry — note that such a mutant produces **both** `case_set` and `evidence_binding`
only if the manifest is also edited; with the manifest untouched the expected id is `case_set` alone.

**Honest status today:** `git ls-tree -r e3cf4e0d -- corpus/evidence/round-21/runtime/` returns
exactly 25 paths, equal to the 25 keys of `.ufo/waves/round-21/runtime-execution-finalized.json`
`artifacts`; `git status --porcelain -- corpus/evidence/round-21/` is empty and the working-tree
directory listing is the same 25 files. **No extra raw file exists at the reviewed revision** — this
is a coverage regression, not a live defect.

---

### F2 — Medium — The receipt case-set check's *order* sensitivity is unfalsified; the legacy implementation used set equality

**Where (revision `e3cf4e0d`)**

- `.ufo/waves/round-22/measure-c1.mjs:452-453` —
  `const ids = …receipt.cases.map((item) => item?.id ?? null)` and
  `if (!equal(ids, CASE_IDS)) addFinding(findings, 'case_set', 'receipt-case-order-or-set');`
  with `equal = isDeepStrictEqual` (`:46`) on arrays → **order-sensitive**. Production behaviour is
  correct: a duplicated, missing *or permuted* receipt row is a `case_set` finding → exit 1.
- `.ufo/waves/round-21/measure-c1.mjs:66` — the predecessor used
  `cases.length !== IDS.length || !equal(caseIds.sort(), [...IDS].sort())` → **set** equality.
  A regression back to set semantics is therefore a *plausible* rewrite accident, not a hypothetical.

**Why it is unfalsified**

- `.ufo/waves/round-22/selftest-c1.mjs:272-279` — the only two `case_set` mutants are
  `duplicate-case` (`receipt.cases[receipt.cases.length - 1] = structuredClone(receipt.cases[0])`
  — replaces the last row with a clone of row 0, so it is **duplicate *and* missing** at once) and
  `missing-case` (`receipt.cases.pop()`).
- `.ufo/waves/round-22/fixtures/expected.json:340-357` — these two are the only `case_set`
  expectations.
- Both mutants shrink the *set* of ids (11 unique ids ≠ 12), so **both still fail under a
  set-based comparison**. No mutant produces a permutation with the same 12-id set, so no mutant
  pins the order property. A `CASE_IDS`-order mutant does not exist either.

**Smallest counterexample (not executed)**

Replace line 453 with a set comparison (e.g. compare `[...new Set(ids)].sort()` to
`[...CASE_IDS].sort()`): **all 44 selftest cases still pass**, but a receipt whose 12 rows are
permuted (same set, different order) now yields `value 12`, `verdict clean`, `exit 0` — the
"reordered receipt cases" property is silently lost with no test noticing.

**Preserving positive**

Production code today catches the permutation twice over: `case_set` at `:452-453`, and
independently the per-case identity check at `:161-168`
(`receiptCase.evidence?.path !== `${RUNTIME_PREFIX}${id}.json`` → `evidence_binding`
`'case-identity-or-fixture'`). Verified statically: the receipt's 12 rows carry per-case
`evidence.path` values, so a permutation cannot pass silently *today*.

**Smallest fix**

Add a `reordered-cases` mutant to `selftest-c1.mjs` (swap `receipt.cases[0]` and
`receipt.cases[1]`, then `resealAcquisition(files)`) plus an `expected.json` entry with
`"finding": "case_set"`. Because a permutation also trips the per-case identity check, the harness
predicate `noStaleBinding` (`selftest-c1.mjs`, `checkOracle`) must also exempt `case_set`
(`expected.finding === 'evidence_binding' || expected.finding === 'case_set' || !ids.includes('evidence_binding')`),
otherwise the new mutant would be reported as failing even though the oracle correctly rejected it.

---

### F3 — Low–Medium — Cross-case nonce uniqueness (population distinctness) was dropped; the two shipped oracles can disagree

**Where (revision `e3cf4e0d`)**

- Legacy `.ufo/waves/round-21/measure-c1.mjs:101,105` — `const nonces=new Set(); … if(nonces.has(c.nonce))add('nonce_reused',id); nonces.add(c.nonce);`
  → a nonce reused across two cases is a **hard finding** in the predecessor oracle.
- Round-22 `.ufo/waves/round-22/measure-c1.mjs:160-169` — the nonce is compared only *within* a
  case (`receiptCase.nonce` vs `raw.nonce`); there is **no** cross-case nonce set anywhere in the
  file (grep for `Set(` finds only `allowed` in `filesAt`, `:513`).

**Smallest counterexample (not executed)**

A corpus in which two cases share one browser identity (receipt row + raw file + acquisition
manifest edited together, so all digest pins still hold) is a population of **11 distinct
observations**, but the round-22 oracle reports `value 12` / `clean`, while the still-shipped
round-21 oracle reports `nonce_reused` and exits 1 on the same revision.

**Honest status today:** the 12 receipt nonces are pairwise distinct (verified from
`corpus/evidence/round-21/runtime/receipt.json` at `e3cf4e0d`: 12 values, 12 distinct, no dupes),
and the 12 raw `*.json` blobs have 12 pairwise-distinct SHA-256 digests. **No live defect** — this
is a coverage regression in the "12 distinct observations" property.

**Smallest fix**

In `measure-c1.mjs` `evaluate()`, keep a `const seenNonces = new Set()` across the per-case loop
and add `addFinding(findings, 'case_set', 'nonce-reused')` when a case nonce repeats; add a
selftest mutant `nonce-reused` (set `receipt.cases[1].nonce = receipt.cases[0].nonce` and reseal).

---

### F4 — Low — The receipt request log is unverified, so an extra acquisition-side page load is invisible

**Where (revision `e3cf4e0d`)**

`corpus/evidence/round-21/runtime/receipt.json` carries a `requests` array with **13** GET entries:
the 12 case pages in `CASE_IDS` order plus one `GET /landing?q=8a5839ad-fc49-4fe7-a…` (the
`na-native-submit` landing). Timestamps 1792590707069 … 1792590717633 ms fall inside the
acquisition window (`startedAt 2026-10-21T13:51:46.773Z`, `finishedAt 2026-10-21T13:51:58.439Z`).
**Neither** oracle reads `receipt.requests` (no occurrence in
`.ufo/waves/round-22/measure-c1.mjs` nor in `.ufo/waves/round-21/measure-c1.mjs`).

**Smallest counterexample (not executed)**

An acquisition that additionally loaded a 13th page (probe, retry, extra scenario) leaves
`requests` with 14 entries; both oracles still report clean / 12. The "population is exactly these
twelve retained observations" reading is therefore not falsifiable from the receipt itself — only
from the manifest, which is itself a declaration.

**Smallest fix**

In `measure-c1.mjs`, assert `receipt.requests.length === 13`, that every URL is `/{caseId}` for
the 12 ids or the single `/landing?q=<na-native-submit nonce>`, and that every request timestamp
lies within `[receiptStart, receiptEnd]`; emit `case_set` / `evidence_binding` otherwise.

---

### F5 — Low — `populationBefore: 12` is asserted, not measured, inside the wave

**Where (revision `e3cf4e0d`)**

- `.ufo/waves/round-22/claim-classification.json` — `populationBefore: 12`, `populationAfter: 12`,
  `newObservations: 0`, `baselineMetric: 0`, `scalarBefore/After: 8`.
- `.ufo/waves/round-22/checks-at-e3cf4e0.json` — the wave's own gates measure the **new** metric at
  both ends: `c1-before` → `value 0`, `verdict baseline` (the oracle's inputs
  `corpus/evidence/round-22/semantic-expectations.json` and
  `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` do not exist at baseline `5f58577`), and
  `c1-after` → `value 12`, `verdict clean`, 12 rows all `counted: true`.
- There is a `lifecycle21-after` no-harm gate (legacy oracle at head → `c1_lifecycle_observations: 12`,
  clean) but **no `lifecycle21-before` gate** at the round-22 baseline `5f58577`.

So the "12→12" population statement is witnessed at the *after* end by the wave's own receipts, and
at the *before* end only by the round-21 wave's record
(`corpus/evidence/round-21/measurements.json`: `c1_lifecycle_observations: 12` at `2d5eaaa`) plus the
blob-identity argument below. The claim is true as far as I can check statically, but it is not
receipt-backed at both ends of *this* wave.

**Supporting static check I did run:** `git diff --name-only 2d5eaaa e3cf4e0d --
corpus/evidence/round-21/` lists only two **added** files (`measurements.json`,
`selftest-c1.json`); the retained `runtime/receipt.json` and the 24 raw artifacts are unchanged
since `2d5eaaa`, and `scripts/webmcp-lifecycle-round21.mjs` is unchanged since `2d5eaaa` — so the
observation population at the round-22 baseline is the same 12 cases the wave measures at head.

**Smallest fix**

Add a `c1-population-before` gate to `.ufo/waves/round-22/run-checks.py` running
`node .ufo/waves/round-21/measure-c1.mjs 5f585773258b33d2d514b00cd0b0775333578db6` with
`expectedMetrics {c1_lifecycle_observations: 12, verdict: clean}` so the population claim is
receipt-backed at both ends. Statically the legacy oracle's baseline preconditions still hold
(`SKILL.md` at `5f58577` still contains `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`;
the S101 row's backlink cell was only *appended to* in round 22), so the gate is expected to pass —
**but I did not run it** (static-only item).

---

## 3. Positives verified (all at `e3cf4e0d`, read-only)

1. **Receipt case set is exactly the 12 `CASE_IDS`, in order, no duplicates, no missing.**
   `corpus/evidence/round-21/runtime/receipt.json` → `cases[].id` =
   `na-pending, na-click, na-requestsubmit, na-native-submit, na-reset, na-remove, na-reject,
   na-throw, na-delayed, na-invalid-submit, auto-positive, auto-invalid` — identical to
   `measure-c1.mjs:25-29` `CASE_IDS` (same order), 12 entries, 12 distinct.
2. **Expectations order == `CASE_IDS`, no duplicates.**
   `corpus/evidence/round-22/semantic-expectations.json` → `cases[].id` in the same order; 12
   entries, no duplicate ids; `cases.length === CASE_IDS.length` and the index-wise comparison at
   `measure-c1.mjs:94` both hold. The file is additionally digest-pinned:
   `sha256 = 4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` =
   `EXPECTATIONS_SHA256` (`measure-c1.mjs:22`), and `sha256(scripts/webmcp-lifecycle-round21.mjs)
   = bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` = `PRODUCER_SHA256`
   (`:23`).
3. **No extra raw files.** `git ls-tree -r e3cf4e0d -- corpus/evidence/round-21/runtime/` = 25
   paths (24 case artifacts + `receipt.json`), exactly the 25 keys of
   `.ufo/waves/round-21/runtime-execution-finalized.json` `artifacts`; working tree clean
   (`git status --porcelain -- corpus/evidence/round-21/` empty) and the on-disk directory listing
   is the same 25 files.
4. **Population distinctness.** 12 pairwise-distinct receipt nonces; 12 pairwise-distinct raw
   `*.json` SHA-256 digests.
5. **Population identity before ↔ after.** The legacy oracle's `IDS`
   (`.ufo/waves/round-21/measure-c1.mjs:10`) is the same 12 ids in the same order as round-22
   `CASE_IDS`, and its `CONFIG` table (`:11-24`) matches the expectations' per-case
   `(autosubmit, action, mode)` for all 12 — the two oracles score the *same* population, not two
   different sets. The wave's `lifecycle21-after` gate records that legacy oracle at head with
   `c1_lifecycle_observations: 12`, `verdict clean`.
6. **No new observation in round 22.** `git diff --name-status 5f58577 e3cf4e0d -- corpus/ scripts/`
   shows only `M corpus/QUALITY.md`, `M corpus/README.md`, `M corpus/SOURCES.md`,
   `A corpus/evidence/round-22/semantic-expectations.json` (oracle spec),
   `A corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (method note). No file under
   `corpus/evidence/round-21/runtime/` changed; the producer script is unchanged since `2d5eaaa`.
   The only round-21 additions are `measurements.json` and `selftest-c1.json` (records, not
   observations).
7. **Head measurement shape.** `checks-at-e3cf4e0.json` → `c1-after`:
   `value 12`, `verdict clean`, `exit 0`, `rows` = 12 in `CASE_IDS` order, every row
   `semanticMatch: true`, `counted: true`, `findings: []`; `c1-before` at baseline `5f58577`:
   `value 0`, `verdict baseline`, `exit 0`, `rows: []`, `findings: []` — an honest "no oracle yet"
   before-state, not a failed measurement.
8. **Acquisition window.** `receipt.startedAt/finishedAt` (13:51:46.773Z → 13:51:58.439Z) bracket
   all 13 request timestamps and all retained frame timestamps; the oracle enforces
   `frame.at ∈ [receiptStart, receiptEnd]` (`measure-c1.mjs:176-177`).

## 4. Out of scope / not defects

- **Self-referential expectations.** `corpus/evidence/round-22/semantic-expectations.json` was
  authored in this wave from the very bytes it later checks, so the oracle is self-confirming by
  construction. This is declared in the artifact header ("historical own-work evidence, not
  publisher authentication") and is an authenticity question, not a case-set defect — it belongs to
  the `CriticAuth` / `CriticRepairFitting` items, not to a bug in the population bookkeeping.
- **Acquisition `measuredRevision: "uncommitted"`** (`.ufo/waves/round-21/runtime-execution-finalized.json`)
  and the round-22 oracle's requirement that it *equals* `"uncommitted"`
  (`measure-c1.mjs:89`): the provenance of the retained bytes is pinned by content digests
  (producer SHA + 25 artifact SHA-256 + receipt SHA-256), so this is a weaker-provenance
  declaration rather than a case-set defect. Residual risk, not a finding.
- **W2 / w2b capacity-refusal chain, review-chronology repair, source-header/note binding,
  per-row outcome semantics** — other items' scope; not attacked here.

## 5. Residual risk and verification gaps

- **Nothing was executed.** All conclusions come from reading committed blobs at `e3cf4e0d` and
  from read-only git queries (`git show`, `git ls-tree`, `git log`, `git diff`, `git status`; all
  exit 0). The counterexamples in F1–F4 are code-reading derivations and are labelled as unexecuted.
  I did not run `measure-c1.mjs`, `selftest-c1.mjs`, `run-checks.py`, or the round-21 legacy
  measure; the gate outputs quoted in §3 are read from the committed receipts
  `checks-at-e3cf4e0.json` / `checks-pre-w2-0f24164.json`, not reproduced by me.
- **F1–F3 are "can we still detect it" findings.** If a future revision adds a raw file, permutes
  the receipt, or reuses a nonce, the round-22 metric can still report a clean 12 while the
  round-21 oracle reports a failure. Until F1–F3 are fixed, "value 12 / clean" should not be read
  as "the case set is exactly these twelve distinct observations".
- **F5** leaves the *before* end of the 12→12 statement resting on the round-21 wave's receipt plus
  blob identity rather than on a round-22 gate.
- The w2b wave's own artifacts (`w2b-spec.json`, `w2b-validation.json`, `w2b-cap-refusal-*.json`,
  `w2b-spawn-result.json`) are untracked at `e3cf4e0d` and owned by the L1 seat; I read them for
  scope only and did not audit them.

---

Report: `.ufo/waves/round-22/w2b/ReviewPopulation.md`
