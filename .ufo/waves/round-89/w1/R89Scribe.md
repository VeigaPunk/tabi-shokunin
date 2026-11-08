# R89Scribe — round 89, wave w1

Seat: scribe (leaf member; no subagent dispatch). L1 / integration owner: `TabiR89`.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Base `5a901163`.
Dispatch-time digest: **D `7bde5e6c2f2d`** (the sha256 of the committed `.ufo/waves/round-89/freeze.txt`
at commit `0791b191`).

**Role in this wave:** draft records. I did **not** edit any lane file, did not commit, did not
push, did not run any mutating git/jj command, and did not write into `corpus/evidence/round89/` or
`.ufo/waves/round-89/scored/`. Every draft lives in my scratch
(`/fast/scratch/hyaku/tabi-r89/R89Scribe/`); this report is the only file I wrote into the lane, and
it is the path my seat spec names.

## Deliverables (drafted, not integrated)

| # | deliverable | draft | state |
|---|---|---|---|
| (a) | round-89 knowledge-note body for the DOM-parsed token list — laws, leg facts, declared limits; divergences vs the committed r88 note | `draft-a-knowledge-note-round89.md` | complete (front-matter + body + **8 divergences** against `chromium-showpicker-runtime-round-88.md`) |
| (b) | lesson `## Gate` source rows for S224 with the located quote and word count | `draft-b-gate-source-rows.md` | complete (24-word verbatim quote, byte locations, word counts, plus the admitted/rejected block) |
| (c) | SCORECARD capability row text for generation r89 + round-89 section claim-table wording | `draft-c-scorecard-rows.md` | complete (capability row, section header, both claim rows, trailer; **7 placeholders flagged as unsettled**) |
| (d) | three `## Mistakes` candidates for round 89 with class/evidence/captured-by/fix | `draft-d-mistakes.md` | complete (3 rows in the r88 table shape; a **fourth** candidate — `stale-mutant-from-string` — is offered as an addition in Appendix D.4, measured during the wave) |

The drafts live in my scratch, which is removed before this seat yields. **Everything needed from
them is reproduced in Appendices A–D below.**

---

## Findings (for the L1 to adjudicate)

Ten findings. **F1 and F2 make a claim leg false at the bytes as they stand**; F3–F6 are
record-vs-state divergences; F7–F10 are calibration/limit findings for the note and the claim's
verbs. None is a measurement failure: I re-derived the round's own numbers and they hold.

| # | where | divergence | severity |
|---|---|---|---|
| **F1** | `scripts/selftest-r89-gates.mjs:55` (the `counter-clean` gate) | The runner asserts `r.json.checkCount === 102` — the **r88** counter's count, copied with the file. The r89 counter reports **108** at the frozen D1 bytes (`33d4b927…`) and **107** at the re-pinned working-tree bytes (`53593b5c…`). C1 leg (c) "selftest green" is therefore **false at both**. Measured: a full runner execution returns `counter-clean` **red** (`exit 0`, `verdict clean`, `checks: 107`). | **substantive** — a claim leg is false; this is the r88 F3 class recurring in an instrument instead of a record |
| **F2** | `.ufo/waves/round-89/claims.json` (working tree) vs the frozen commit `0791b191` | Five semantic changes, **only one of them disclosed**: `C1.legs.a` checkCount 108 → **107**; `C1.pins[check-showpicker-round89.mjs]` `33d4b927…` → `53593b5c…`; `C1.pins[negatives-showpicker-round89.mjs]` `7951d40e…` → `bc7ed0e5…`; `C2.killRule` before-numeral 2 → **3**; `C2.legs.b` mismatches 2 → 3. `frozenAmendments` records **only** the C2 pair — the C1 numeral and the two C1 instrument pins moved with no entry. `freeze.txt` was re-pinned in the same movement. | **substantive** — a disclosed-amendment convention is half-applied |
| **F3** | `.ufo/waves/round-89/claims.json` `C2.legs.b` / `C2.killRule` (before-numeral) | The frozen claim said **2** mismatches (`selftest-wording`, `quality161-sweep`). Measured by this seat on the frozen gate: **2** with the r89 instrument files present in the before-worktree, **3** without them (`gate-selftest` joins, because `scripts/*round89.mjs` do not exist in a bare base tree). The working-tree amendment says 3, on the instrumented-base reading — which I confirm — **but the numeral is a function of what the before-worktree contains, and the frozen wording named neither.** | record-vs-state — the number is correct once the reading is stated; the wording must state it |
| **F4** | `scripts/selftest-r89-gates.mjs` `pins-match-freeze` gate | The gate reads `freeze.txt` from the same working tree it checks, so a coordinated re-pin of file + `freeze.txt` is green by construction. It **cannot** witness F2's movement. (Measured: at the moment I ran the full runner, the gate was red for exactly this reason — `selftest-r89-gates.mjs`'s sha256 had moved past its `freeze.txt` pin.) | instrument-witness hole (a real one, visible in this wave's own run) |
| **F5** | `corpus/lessons/round-89.md` (did not exist) and `corpus/QUALITY.md` §161 | The drift gate's `selftest-wording` statement reads `corpus/lessons/round-89.md` (not `round-88.md`) and requires it to contain `D6` plus `selftest 10/10 at D7` or `D7 wording`; `quality161-sweep` requires QUALITY §161 to cite `check-record-drift-r89`. At 10:03 the live lane measured **exit 1, claims 4, mismatches 2**, `failed ["selftest-wording","quality161-sweep"]` — C2 leg (a) was not yet true. **The L1 landed both edits during this seat's work; at 10:14 the gate is green (exit 0, mismatches 0).** | record-vs-state — **closed by the L1**; the L1 should re-check that its lesson carries the `D6` / `D7 wording` passage the gate reads |
| **F6** | `corpus/knowledge/chromium-showpicker-runtime-round-89.md` (did not exist at my first census) | The SOURCES registry row S224 (committed) names it in `used-by`; the census reported `E11 S224 missing used-by corpus/knowledge/chromium-showpicker-runtime-round-89.md` and **exited 1**. The registry's own `scope`/`teaches` cells are accurate against the staged page (verified). **The L1 wrote the note during this seat's work** — the file now exists (untracked in the working tree). The census must be re-run at the end to confirm E11 is closed. | record-vs-state — closed by the L1; re-run the census |
| **F7** | `claims.json` C1 `type`; the note's law 1; the SCORECARD capability row | The claim says the token list is "from spec §2.3.8 (split on commas, trim ASCII whitespace) plus ASCII lowercasing". The tokens are the **page's own** output (`scripts/chrome-cdp-showpicker-round89.mjs:142`): `a.split(',')`, `p.trim().toLowerCase()`, empty tokens dropped. JS `trim()` strips the whole JS whitespace set (U+00A0, U+FEFF, U+2028 included); JS `toLowerCase()` is Unicode lowercasing; empty tokens are dropped where §2.3.8's worked example admits the empty string as a token. The counter compares the fixture's output to a constant and never re-derives §2.3.8. | calibration — the claim's `limit` cell already concedes this; the `type` cell and the note's law sentence do not |
| **F8** | `claims.json` C1 `limit` ("the counter binds names, sizes, types, hex and hashes"); the note's "what a receipt cannot prove" | On the four new legs `accept-domread-law` binds the delivered name/size/type and the page-read hex, but **not** `answer.setParams.backendNodeId`, `setResult`/`setError`, nor the `upload`/`uploadPng` block's sha256 — all three of which the sibling `accept-grammar-law` binds on its legs. I confirmed the top-level `fixtureInputs` snapshot **does** bind the token list for all 15 file inputs (mutating `ac`/`amc`/`aws`/`aw`/`k`/`cos`/`s` `acceptTokens` each exits 1 on `fixture-descriptors`), so the *snapshot* side is strong; the *per-leg answer record* side is not. | calibration — the limit sentence overstates for the four new legs |
| **F9** | `claims.json` C1 `limit` ("Attribution rides on the top-level fixtureInputs snapshot plus each domread leg's own domRead") | Measured in the scored receipt and in both probes: the four `domRead` arrays are **byte-identical to each other and to the top-level `fixtureInputs`** (all 21 descriptors, same order). The per-leg half therefore attributes nothing — the counter binds two fields of the one target entry (`find(x => x.id === target)`), and the rest of the array is free. Also measured: the four new legs answer (input, file) pairs that **duplicate four earlier legs** (`-text`= `sp86-accept-wildcard-text`; `-png`= `sp86-accept-mixed-png`; `-multimime`= `sp87-accept-multimime-text`; `-whitespace`= `sp87-accept-whitespace-png`) — the addition is the parsed dimension, not new pairs. | calibration — a limit sentence that reads stronger than the binding |
| **F10** | `scripts/check-showpicker-round89.mjs` `accept-domread-law` (the r89 law's own conjunct set) | The r89 law binds **six** fields; the sibling `accept-grammar-law` binds **ten** (it adds `setParams` basename, `setParams.backendNodeId === chooser-recorded node id`, `setResult === {}` and `setError === null`). The gap is not academic: **five receipt mutations on the four new legs score clean** (exit 0, no findings) — `answer.setParams.backendNodeId` 19→999, `answer.setError` forged, `answer.setResult` forged, `uploadPng.sha256` → 64 zeros, `uploadPng.name` → `forged.png` — while the three positive controls (state size, read hex, token list) are all caught. The kill-power list's two domread mutants target only the token list and the raw string, so **"kill power 0 survivors" is not evidence about any of the five**. | calibration / coverage — the round's own "full coverage" claim over the new law is narrower than the sibling law's, and the survivors are not enumerated by any instrument |

---

### F1 — the runner's `counter-clean` gate cannot be green at either candidate freeze

```
scripts/selftest-r89-gates.mjs:55
  return { ok: r.status === 0 && r.json && r.json.verdict === 'clean' && r.json.checkCount === 102, … }
```

The literal **102** is r88's count, carried over with the file. Measured by this seat on the same
clean scored receipt with the same pins:

| counter bytes | sha256 | reported | verdict |
|---|---|---|---|
| frozen D1 (`claims.json` at `0791b191`) | `33d4b927…` | **108** | clean, 0 findings |
| working tree at the time of writing | `53593b5c…` | **107** | clean, 0 findings |

Neither is 102, so `counter-clean` is red at both. My full runner execution confirms it:
`counter-clean False exit 0 {"verdict":"clean","checks":107,"findings":[]}`.

This is **the r88 F3 class again** — the r88 scribe found `SCORECARD.md`'s r88 C1 cell reading
"selftest 10/10" while the runner had 11 gates. The defect moved from the record into the
instrument. The r88 lesson's own rule ("freeze only after a full selftest run on the exact bytes")
is exactly the rule that would have caught it, and it was not applied: the runner and the counter
were frozen together at `7bde5e6c2f2d` and never executed green against each other.

**Smallest fix (an instrument literal, not a threshold):** the runner should take the expected
count from the counter it runs, not from the previous generation's file.

### F2 — five semantic changes to the frozen claim, one disclosed

`git diff .ufo/waves/round-89/claims.json` against commit `0791b191` (unicode escapes normalised),
verified by this seat field by field:

| field | frozen (`0791b191`) | working tree | disclosed? |
|---|---|---|---|
| `C1.legs.a` | checkCount **108** | checkCount **107** | **no** |
| `C1.pins[check-showpicker-round89.mjs]` | `33d4b927…` | `53593b5c…` | **no** |
| `C1.pins[negatives-showpicker-round89.mjs]` | `7951d40e…` | `bc7ed0e5…` | **no** |
| `C2.killRule` | before mismatches != **2** | != **3** | yes (`frozenAmendments`) |
| `C2.legs.b` | mismatches **2** | mismatches **3** (+ `gate-selftest`) | yes (`frozenAmendments`) |

`freeze.txt` was re-pinned in the same movement (the counter, negatives and kill-power pins all
moved together with their files). Note that `countingCommand` pins the **driver**, never the
counter, so an executor who picks up the working tree silently reports a different check count
than the frozen witness — which is exactly how a 108-vs-107 discrepancy would reach the records.

The freeze is still moving during this seat: I observed the working `freeze.txt`'s own sha256 at
`7e21484c…` and then `cea37031…` and then `d7739fdb…` over the course of the wave, with the
counter, negatives, kill-power and runner pins moving together. `plans/round-89.md` §Re-freeze
history narrates a D2/D3 batch and names `a78e70a4` — **which I could not reproduce** from the
`freeze.txt` bytes by any construction I tried (the D1 digest is the sha256 of the committed
`freeze.txt` file, `7bde5e6c2f2d…`; recomputing it with the counter+battery pins swapped gives
`7e21484c…`, with kill-power also swapped gives `2146f15d…`, and the working file hashes to
`d7739fdb…`). The digest scheme the plan names and the one the committed file uses are **not
demonstrably the same**.

### F3 — the before-numeral is a function of the before-worktree's contents

Measured by this seat, frozen gate `c54d5edf…` against an extracted base `5a901163` tree:

| before-worktree contents | mismatches | failed ids |
|---|---|---|
| base tree **with** the r89 instrument files present | **2** | `selftest-wording`, `quality161-sweep` |
| base tree **without** them (a bare `git archive` of the base) | **3** | `selftest-wording`, **`gate-selftest`**, `quality161-sweep` |

The frozen claim froze **2** and named exactly the two ids of the first row; the working-tree
amendment says **3** and names the three ids of the second. Both readings are internally
consistent; the frozen wording ("the frozen gate pointed at a worktree of base `5a901163`") names
neither. `R89Exec3` measured 3 and gave the same reason (the r89 scripts do not exist at base, so
`gate-selftest`'s `mentions/wired/counter/battery/killpower` are all false).

The working-tree `frozenAmendments` entry is **correct on its own reading**, and I confirm it.
What it does not say is *which* reading it is — and the number changes with it. The amended
`C2.legs.b` cell should state the reading ("the before-worktree carries the r89 instrument files"),
otherwise the number is not reproducible from the claim.

### F5 — the live lane's C2 after-value was 2, not 0 (the L1 has since closed it)

```
$ node scripts/check-record-drift-r89.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json
{"claims":4,"mismatches":2,"failed":["selftest-wording","quality161-sweep"]}     # at 10:03
{"claims":4,"mismatches":0,"failed":[]}                                            # at 10:14, exit 0
```

Both reds were L1-owned record edits, not gate defects:

1. `selftest-wording` needed `corpus/lessons/round-89.md` to exist and to carry `D6` plus
   `selftest 10/10 at D7` (or `D7 wording`). The r88 lesson carries that passage at lines 61-65;
   the r89 gate reads `round-89.md`, so the passage must be repeated there in the same
   "Report corrections carried into this round" shape.
2. `quality161-sweep` needed QUALITY §161's block to cite `check-record-drift-r89`. QUALITY 161
   cited `check-record-drift-r87.mjs` plus the r88 scope extension.

**Both landed during this seat's work** — `corpus/lessons/round-89.md` and
`corpus/knowledge/chromium-showpicker-runtime-round-89.md` now exist and `corpus/QUALITY.md` is
modified in the working tree, and the gate is **green (exit 0, mismatches 0)**. The finding is
recorded as it stood at the time of measurement, and the L1 should know it is now closed. (The
lesson and the note are the L1's files, not mine: this seat did not write either.)

### F7/F8/F9 — the verbs in the records outrun the bindings

These are the calibration substance of the round, and they are **not** measurement failures — the
law holds. Measured facts I put behind each:

- **F7 (fixture-emulated, not §2.3.8-conformant).** The page-side tokenizer is
  `scripts/chrome-cdp-showpicker-round89.mjs:142`. Two concrete divergences from the spec, both
  unexercised by any leg: JS `trim()` strips U+00A0 / U+FEFF / U+2028 (the spec's rule is ASCII
  whitespace), and empty tokens are dropped where §2.3.8's worked example (`" a ,b,,d d "` → four
  tokens including the empty string) admits the empty string as a token. §2.3.8 says nothing about
  case; the `accept` attribute requires each token to be "an ASCII case-insensitive match", which is
  a **matching** rule, not a normalization step. So "plus ASCII lowercasing" is the fixture's own
  rule, and the claim's `limit` cell already says so — the `type` cell does not.
- **F8 (the answer record).** `accept-domread-law` binds `answer.files` name, `stateAfter[target]`,
  one `read` event and its hex. It does not bind `answer.setParams.backendNodeId`, `setResult`/
  `setError`, nor the `upload`/`uploadPng` block. The sibling `accept-grammar-law`
  (`scripts/check-showpicker-round89.mjs:777`) binds all of those. The **top-level** snapshot side
  is strong: `fixture-descriptors` (`:870`) requires exact equality with `FIXTURE_INPUTS`, which
  pins the token list for all 15 file inputs — I confirmed seven distinct top-level token mutations
  each exit 1 on `fixture-descriptors`.
  **Independently reproduced by this seat** (mutating a copy of the scored receipt in scratch,
  scoring it with the same pins and the scored receipt exempted by content hash so the
  `prior-set-complete` bookkeeping does not mask the result):

  | mutation | result |
  |---|---|
  | `sp89-accept-domread-text` `answer.setParams.backendNodeId` 19 → 999 | **exit 0, no findings — uncaught** |
  | `sp89-accept-domread-text` `answer.setError` → forged | **exit 0, no findings — uncaught** |
  | `sp89-accept-domread-text` `answer.setResult` → forged | **exit 0, no findings — uncaught** |
  | `sp89-accept-domread-png` `uploadPng.sha256` → 64 zeros | **exit 0, no findings — uncaught** |
  | `sp89-accept-domread-png` `uploadPng.name` → `forged.png` | **exit 0, no findings — uncaught** |
  | *positive control:* `stateAfter.aw` size 22 → 23 | exit 1, `leg-sp89-accept-domread-text` + `accept-domread-law` + `no-selection-law` |
  | *positive control:* `read` hex → `hex:deadbeef` | exit 1, `accept-domread-law` |
  | *positive control:* `domRead.aw.acceptTokens` → `["image/png"]` | exit 1, `accept-domread-law` |

  So the delivered name/size/type/hex and the token list **are** bound; the answer's own
  provenance record and the on-disk upload record are **not**.
- **F9 (attribution).** All four `domRead` arrays in the scored receipt and in both probes are
  byte-identical to each other and to the top-level `fixtureInputs`. The per-leg `domRead` copy
  carries no leg identity; the counter binds two fields of one entry. **Independently reproduced by
  this seat** (same method as F8):

  | mutation | result |
  |---|---|
  | `sp89-text`'s `domRead` replaced by `sp89-png`'s `domRead` (cross-leg swap) | **exit 0, no findings — uncaught** |
  | `sp89-text`'s `domRead` truncated to the target entry | **exit 0, no findings — uncaught** |
  | `sp89-text`'s `domRead` replaced by a fabricated one-entry array | **exit 0, no findings — uncaught** |
  | `sp89-text`'s per-leg `fixtureInputs` truncated to the target entry | **exit 0, no findings — uncaught** |
  | `sp89-text`'s per-leg `fixtureInputs`: `k.accept` → `totally/bogus` | **exit 0, no findings — uncaught** |

  And the four new legs duplicate four earlier (input, file) pairs, so what r89 adds is the parsed
  dimension on pairs already measured — **not** new pairs. The r89 note must say this, or a reader
  will count the four legs as four new accept cases.

**The law itself is not in question and I want that on the record:** two of the four new legs are
counterexamples to the *stronger* reading — `image/*` accepts a `text/plain` file and
`image/png,application/pdf` accepts a `text/plain` file — which **supports** "accept is not a
validator on a programmatic answer" and **falsifies** "the tokens would accept the answer".

---

## What I verified as **correct** (so the L1 need not re-check)

- **The scored receipt.** 41 legs, `failures: []`, nonce `tabi-r89-l1-7bde5e6c2f2d`, driver
  `76b69b4f691d24c8c94a92897e33635d2386b9191f5aaa66640515dc998bd2d0`, fixture sha256
  `69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed`, child
  `7d15ea8281c583baa87604260d9b46d7b192f8ec04f762fb6cf36e98b29362df`, host Chromium
  155.0.8059.84 / node v24.21.0, ports 19960/19961/19962. The counter scores it **clean, 0
  findings**, at both candidate byte sets (108 and 107 checks).
- **The four new legs' facts**, read from the receipt: `sp89-accept-domread-text` (`aw`,
  raw `image/*`, tokens `["image/*"]`, delivers `tabi-r89-a.txt` 22 B `text/plain`);
  `-png` (`am`, raw `image/png, .txt`, tokens `["image/png",".txt"]`, delivers `tabi-r89-b.png`
  21 B `image/png`); `-multimime` (`a2`, raw `image/png,application/pdf`, tokens
  `["image/png","application/pdf"]`, delivers the `.txt`); `-whitespace` (`aws`, raw
  `"  image/png ,  .txt  "`, tokens `["image/png",".txt"]`, delivers the `.png`). Each lands in
  **only** its own input's `files` list; `input` and `change` both fire with `isTrusted: true`;
  exactly one `read` event per leg with the exact bytes
  (`\x89PNG\r\n\x1a\ntabi-r83-png\n` / `tabi-r83-answer-alpha\n`); exactly one
  `Page.fileChooserOpened` per leg, `mode: selectSingle`; activation consumed
  (`isActive` true → false, `hasBeenActive` true).
- **The r83-marker claim and the "tabi-r89-* names" claim** — both confirmed from the receipt's
  read hex.
- **The top-level snapshot's token list** — bound for all 15 file inputs, `null` for the six
  non-file inputs, `[]` for file inputs with a null `accept`; seven mutations each exit 1 on
  `fixture-descriptors`.
- **The S224 registry row's `scope` and `teaches` cells** — accurate against the staged page
  (121,595 B, sha256 `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666`): comma
  delimiter, ASCII-whitespace trimming, and "the lowercasing is this lane's fixture normalization,
  not the spec's" all check out. The dfn paragraph is at bytes 116282–116959; the worked example at
  117049; "the empty string can be a token" at 117208.
- **The drift gate's `--selftest` and its in-process fixture removal.** Exit 0, `ok: true`, red on
  the fixture for the intended reasons (`scorecard-tallies`, `selftest-wording`, `gate-selftest`,
  `quality161-sweep`), with `tallies: bad=["round-44-no-9","round-44-has-10"]` and
  `wording: staleHolds=true` — i.e. the fixture carries all seven swept sections and the reds are
  **causal**, which is the Narrowing-7/8 repair the round claims. Leak check: **0**
  `tabi-r89-driftfix-*` trees before and after.
- **The do-nothing controls.** The r88 receipt under the r89 counter → exit 1 with `schema` and
  `plan-frozen` among 34 findings (the committed `controls/c1/nowork-r88-under-r89.json`); a
  nonexistent receipt → exit 2 `receipt-unreadable`, matching `controls/c1/noreceipt.txt` exactly.
- **The battery.** 223 cases, 0 failed, coverage 107/107 declared and covered, `uncovered: []`
  (measured on the working-tree bytes; 222 cases on the earlier bytes).
- **The gate-selftest isolation** — all four instruments' `--selftest` modes exit 0 with `ok: true`.
- **The capability-status gate** — exit 0, 23 rows, 22 claimed, 1 provisional, 0 mismatches.
- **The r89 search-log entry in `corpus/SOURCES.md`** — the counts (identified 1 / screened 1 /
  included 1 / excluded 0) and the located dfn quote check out against the staged page. The entry's
  quote paraphrases "nor containing any commas" for the page's "nor containing any U+002C COMMA
  characters (,)" — a paraphrase, not a quote, but the entry is prose, not a registry cell, and the
  **registry row itself** carries no quote (the contract puts the ≤25-word quote in the lesson's
  `## Gate`, which is deliverable (b)).
- **The round-88 note's own content** — I re-derived the ten attribute-string values / nine
  in-grammar framing, the r83 marker, the r84 extension-token control, the four carried frontier
  items, and the three "what a receipt cannot prove" limits. All hold; the eight divergences in
  draft (a) are the changes r89 makes.

---

## Two things I want to flag to the L1 beyond the drafts

### 1. The kill-power run was **red** when I ran it — and the lane was moving while it ran

My full runner execution (`scripts/selftest-r89-gates.mjs`, all 11 gates) returned:

```
clean False cases 11 failed ['pins-match-freeze','kill-power','record-drift']
  pins-match-freeze  False  files whose sha256 differs from freeze.txt: ["scripts/selftest-r89-gates.mjs"]
  counter-clean      True   exit 0 {"verdict":"clean","checks":107,"findings":[]}
  battery            True   exit 0 {"cases":223,"failed":0,"coverage":{"declared":107,"covered":107,…}}
  kill-power         False  exit 1 {"mutants":72,"killed":70,"survived":0,"crashed":2,"survivors":[]}
  record-drift       False  exit 1 {"claims":4,"mismatches":2,"failed":["selftest-wording","quality161-sweep"]}
```

A standalone kill-power run against the bytes as they stood a moment later gave **72 mutants, 71
killed, 0 survived, 1 unapplied** — the unapplied one being `accept-grammar-state-dropped`, whose
from-string occurred **0 times** in the counter it was applied to. The kill-power file was
**rewritten at 10:04:19**, i.e. *after* that run began; at the time of the run the file's
`accept-grammar-state-dropped` from-string named the pre-D2 `same(st, …)` conjunct alone, while the
counter's grammar law had by then grown the `&& arr(leg.pageEvents).filter(...).length === 1`
conjunct as well — so the from-string no longer matched the counter and the mutant could not be
applied. That is the **same defect class the r88 wave routed and fixed** ("the kill-power mutant's
stale from-string", r88 D4): a mutant whose from-string falls behind the instrument it mutates is
**silently unapplied**, and an unapplied mutant is neither a kill nor a survivor — it is invisible
in the headline tally unless the tool reports it separately (this one does, in `unapplied`).

**Re-run against the bytes as they stand now — after the lane's 10:04:19 repair — the kill power is
green**: 72 mutants, **72 killed, 0 survived, 0 crashed, 0 unapplied** (measured by this seat:

```
$ node scripts/kill-power-round89.mjs --lane <lane> --real corpus/evidence/round89/chromium-showpicker/receipt.json \
    --expect-driver-sha256 76b69b4f… --expect-nonce tabi-r89-l1-7bde5e6c2f2d \
    --expect-fixture-sha256 69acad57… --prior-set .ufo/waves/round-89/controls/c1/prior-set.txt --json
{"schema":"tabi-r89-kill-power","mutants":72,"killed":72,"survived":0,"crashed":0,"survivorsList":[],"unapplied":[]}
```

against kill-power `576be85e…`, counter `53593b5c…`, negatives `0668a439…`). The `kill power N/N`
figure is therefore **72/72** — but it must be re-run once more against whatever bytes are finally
committed, because the instrument moved under the run twice while I was measuring. The
`pins-match-freeze` failure in the same runner execution is the F4 hole made visible by the lane's
own movement.

### 2. The freeze digest scheme the plan names is not reproducible from the bytes

`plans/round-89.md` §Re-freeze history names **D1 `7bde5e6c2f2d`**, **D2 `a78e70a4`** and **D3
`a78e70a4`** — two different freezes with the *same* digest, which cannot both be right. The D1
digest is the sha256 of the committed `freeze.txt` file (`7bde5e6c2f2d456b28c950a8ea7c113964064705c588e511ced78a9b7672ce79`,
verified). Recomputing that same construction over the pin sets I could reconstruct gives
`79c6d75e…` (battery only), `7e21484c…` (counter + battery), `2146f15d…` (counter + battery +
kill-power) and `cea37031…` (the working file at one moment) — **none is `a78e70a4`**, and
`a78e70a4` is neither the sha256 prefix of any current instrument, nor any commit prefix in the
repo's history, nor reproducible by any of the sixteen `freeze.txt` constructions I tried (full
file, file without its trailing newline, `  `→single space, LF→CRLF, pins-only, hashes-only, sorted
lines — for the D1, D2 and D3 pin sets). Either the digest is computed over something other than the
`freeze.txt` bytes (in which case the scheme must be stated) or the named digests are wrong. Since
the SCORECARD, the lesson, `claims.json` and `LOG.md` all have to name the same final digest, this
must be settled before the records are written.

---

## Bounds observed

- **Read-only outside my seat's report path.** I edited no lane file: not `SKILL.md`,
  `SCORECARD.md`, `LOG.md`, `plans/`, `corpus/**`, `scripts/**`, `claims.json` or `freeze.txt`. The
  only lane file I wrote is this report at the path my seat spec names.
- **Never wrote into** `corpus/evidence/round89/` or `.ufo/waves/round-89/scored/`. I only *read*
  them.
- **No mutating git/jj command** anywhere: no add, commit, stash, checkout, switch, reset, pull,
  push. `git log`, `git show`, `git diff`, `git status`, `git archive`, `git ls-tree` only.
- **No `git worktree add` was used.** The base comparison was done by `git archive 5a901163` into
  my own scratch directory and running the lane's gate against it read-only; nothing was created in
  the lane or the fleet repo.
- **Fixture-repo rule not needed**: no fixture repo was created, so no `git init` and no toplevel
  assertion was required. The base tree I extracted was never committed to.
- **Mutations were confined to my scratch.** Every counter mutation I ran was a copy of the counter
  in `/fast/scratch/hyaku/tabi-r89/R89Scribe/`, and every receipt mutation was a copy of the
  receipt in the same tree. **No lane instrument or receipt byte was modified.**
- **No host sysctls touched**, no service restarted, no package installed.
- **No `agent://all` broadcast.** I did not message any peer.
- **Scratch**: `/fast/scratch/hyaku/tabi-r89/R89Scribe/` holds the four drafts, the extracted base
  tree, the counter copies and the runner outputs; it is removed before this seat yields.

## Tooling

**No tools were installed, upgraded or removed.** The work used only what the host already had:
`node` (v24.21.0), `git`, `python3` (standard library only), `jq`, `sha256sum`, `stat`, `awk`,
`grep`, `cmp`. I read `/home/vgpnk/.omp/agent/RULES.md` as instructed; its directive to install
helpful tools was not triggered, because nothing in this seat's task needed a tool that was absent.
Per the round's ruling (pacman transactions paused host-wide, 2026-10-20), no `pacman` transaction
was attempted and no `uv tool install` / `npx` / release-binary install was performed.

## What the main agent should check after integrating

1. That `scripts/selftest-r89-gates.mjs`'s `counter-clean` gate carries the **same** number as the
   pinned counter reports (F1), and that the SCORECORD `Scored (r89)` line, the note's `recheck:`
   line and `claims.json` `C1.legs.a` all carry that same number.
2. That `claims.json`'s `frozenAmendments` covers **every** semantic change made after the freeze —
   the C1 check-count numeral and the two C1 instrument pins, not only the C2 pair (F2).
3. That `C2.legs.b`'s wording states the **reading** of the before-control (which files the
   before-worktree carries), since the numeral is 2 or 3 depending on it (F3).
4. That `corpus/lessons/round-89.md` carries the `D6` / `selftest 10/10 at D7` (or `D7 wording`)
   correction passage and that QUALITY §161 cites `check-record-drift-r89`. **Both landed during
   this seat's work and the drift gate is green (exit 0, mismatches 0) as of 10:14** — so this is
   now a confirmation, not an action (F5).
5. That the kill power is re-run against the final committed bytes before the `kill power N/N` figure
   is written. My measurement on the current bytes is **72/72 killed, 0 survived, 0 crashed, 0
   unapplied**; two earlier runs of mine against the moving bytes gave 70 killed / 2 crashed and
   71 killed / 1 unapplied, so the figure must be re-taken, not carried from an earlier run.
6. That the note's verbs are at the strength the checks carry: "the page's own split-and-trim token
   list" (not "from §2.3.8"); "name, size, type and page-read hex" (not "and hashes") for the four
   new legs; and that the note states the four `domRead` snapshots are shared and the four legs
   duplicate earlier (input, file) pairs (F7/F8/F9).
7. That the freeze digest the SCORECARD, the lesson, `claims.json` and `LOG.md` name is the one
   that is reproducible from the committed `freeze.txt` bytes, and that the plan's §Re-freeze
   history does not name two different freezes with the same digest.
8. **That the round's frozen predicate, counter, pins, priors, thresholds and kill rules are
   unchanged** by any of the above — every fix proposed here is a record-text or an
   instrument-literal fix, and the two numeral corrections the lane already made are disclosed.

---

## Appendix A — the knowledge-note draft (deliverable (a))

Full draft with its front matter and the eight-divergence table:
`/fast/scratch/hyaku/tabi-r89/R89Scribe/draft-a-knowledge-note-round89.md` (removed at yield; the
body and the table are reproduced below).

### A.1 — front matter (draft)

```
---
source: S224 (WHATWG HTML §2.3.8 — comma-separated tokens, the `accept` token shape), S223 (WHATWG HTML — the file-upload state's `accept` attribute as a hint), S219 (WHATWG HTML `showPicker()` steps — the SecurityError and its File/Color exemption), S216 (the normative algorithm), S221/S222 (CDP Page/DOM domain, carried); receipt `corpus/evidence/round89/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round89.mjs`, pin in `.ufo/waves/round-89/freeze.txt`)
verified-at: 2026-11-08 (round 89, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-round89.mjs --lane <ABS lane> --receipt corpus/evidence/round89/chromium-showpicker/receipt.json --expect-driver-sha256 76b69b4f691d24c8c94a92897e33635d2386b9191f5aaa66640515dc998bd2d0 --expect-nonce tabi-r89-l1-7bde5e6c2f2d --expect-fixture-sha256 69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed --prior-set .ufo/waves/round-89/controls/c1/prior-set.txt --json` → exit 0, 107 checks
---
```

> **L1 note.** The check count is not stable: **108** at the frozen D1 bytes (`33d4b927…`), **107**
> at the re-pinned working-tree bytes (`53593b5c…`) — both clean, 0 findings, on the same scored
> receipt with the same pins. This line says **107** because that is what the current working-tree
> counter prints. **If the D1 bytes are kept, the number must be 108.** Whichever is pinned, this
> line, the SCORECARD `Scored (r89)` line, `claims.json` `C1.legs.a` and the selftest runner's
> `counter-clean` assertion must all carry the same number.

### A.2 — the body (draft)

```markdown
# Programmatic picker generation r89 — the DOM-parsed token list

Generation r89 of the held capability `chromium-showpicker-linux` (SCORECARD). Forty-one legs, one
fresh browser per leg. Round 88 left one frontier open on the `accept` law: "the parser's
whitespace/comma normalization read from the DOM rather than the raw string" (round-88 spot-check
§7 defect 2; the round-88 SCORECARD `Planned (r89)` line 1). Every leg through r88 read the raw
attribute string from the page; no leg read a parsed form. This generation reads the parsed form.

## The measured laws

1. **`accept` is not a validator on a programmatic answer — now over a DOM-parsed token list.**
   Every leg delivers a file through `DOM.setFileInputFiles` to an input whose raw `accept`
   attribute is read back from the page, and in every case the delivered file lands in the input's
   `files` list with its bytes, fires trusted `input`+`change`, and the page reads the bytes back
   (`read` event `ret: 'hex:…'`); `Page.fileChooserOpened` carries `selectSingle`. The four new
   legs (this generation) each re-read `window.__inputs()` **on the page at settle** (`domRead`)
   and the counter binds **both** the raw accept string and the DOM-parsed token list it
   produces:
   - `accept="image/*"` answered with `text/plain` — `sp89-accept-domread-text` (input `aw`),
     tokens `["image/*"]`;
   - `accept="image/png, .txt"` answered with `image/png` — `sp89-accept-domread-png` (`am`),
     tokens `["image/png", ".txt"]`;
   - `accept="image/png,application/pdf"` answered with `text/plain` —
     `sp89-accept-domread-multimime` (`a2`), tokens `["image/png", "application/pdf"]`;
   - `accept="  image/png ,  .txt  "` (whitespace variant) answered with `image/png` —
     `sp89-accept-domread-whitespace` (`aws`), tokens `["image/png", ".txt"]`.
   Two of the four are **non-matching deliveries**: `image/*` accepts a `text/plain` file and
   `image/png,application/pdf` accepts a `text/plain` file. The token list did not filter the
   programmatic answer; the law that the tokens would govern delivery is falsified by this
   receipt's own bytes.
   The r86/r87/r88 forms (`image/*`, `image/png, .txt`, `application/pdf`, `audio/*`, `video/*`,
   `image/png,application/pdf`, the whitespace variant, `IMAGE/PNG`, `audio/*,video/*`, the
   non-conforming `image/png;q=0.9`) and the r84 extension-token law (`.txt` into `accept=".png"`)
   are the controls; the whole matrix is gated by `accept-grammar-law`, and the four new legs
   additionally by `accept-domread-law`. The spec's own word for the attribute is "hint": it "may
   be specified to provide user agents with a hint of what file types will be accepted". What a
   user's DIALOG would offer or refuse is not measured by this receipt.
2. **Carried unchanged from r86** — the same-origin `tel`/`search`/`text` arms, the cross-origin
   `date`/`month`/`week`/`time`/`number`/`range`/`tel`/`search`/`text` `SecurityError`, the
   origin-before-mutability order discriminator, the directory answer with `webkitRelativePath`,
   `multiple` → `selectMultiple`, the second-chooser payload answer, and the same-origin
   `type=color` activated arm (`undefined`, activation consumed, no input/change, zero file
   choosers).

## What a receipt of this shape cannot prove

- **Acceptance is not filtering.** `DOM.setFileInputFiles` answers a chooser programmatically; the
  law says `accept` does not filter THAT path. What a user's dialog offers or rejects is not
  measured — headless opens no real dialog — and is not claimed.
- **The token list is the fixture's normalization, not Chromium's tokenization.** The page
  computes `acceptTokens` itself (`scripts/chrome-cdp-showpicker-round89.mjs:142`):
  `a.split(',')`, then `p.trim().toLowerCase()`, empty tokens dropped. That is a JS
  `String.prototype.trim()` (which strips the full JS whitespace set, not only ASCII whitespace)
  and a JS `toLowerCase()` (Unicode lowercasing, not ASCII-only lowercasing) — the ASCII
  lowercasing is recorded as the fixture's own rule, not the spec's. The counter compares the
  fixture's output to a constant; it does not re-derive the tokens by the §2.3.8 algorithm, so a
  paired fixture-and-constant error would agree green. **No leg measures Chromium's own `accept`
  tokenization**, and no leg exercises a non-ASCII whitespace or a non-ASCII letter, so the
  difference between the fixture's rule and the spec's rule is unmeasured, not disproved.
- **The DOM read is a page read of a page-computed field.** The `domRead` snapshot is
  `window.__inputs()` re-read on the page at settle. The four `domRead` arrays are byte-identical
  to each other and to the top-level `fixtureInputs` snapshot, so the snapshot carries no
  leg identity of its own; attribution rides on the `id` inside a shared snapshot, not on a
  per-leg copy. The counter binds the raw string and the token list of the **one target entry**
  (`find(x => x.id === target)`); the rest of the snapshot is free.
- **The four new legs duplicate earlier (input, file) pairs.** `sp89-accept-domread-text` answers
  `aw` with `tabi-r89-a.txt` — the same pair as `sp86-accept-wildcard-text`; `-png` answers `am`
  with `tabi-r89-b.png` as `sp86-accept-mixed-png`; `-multimime` answers `a2` with
  `tabi-r89-a.txt` as `sp87-accept-multimime-text`; `-whitespace` answers `aws` with
  `tabi-r89-b.png` as `sp87-accept-whitespace-png`. What the four legs add is the **parsed
  token list** on each pair, not a new (input, file) combination.
- **The colour arm is bounded to the file-chooser metric.** Zero `Page.fileChooserOpened` events do
  not show whether a colour popup appeared; nothing stronger is claimed.
- **The counter reads a receipt.** Its printed `limit` names the escape: a forger who shifts every
  page event by a constant offset passes the replay rule. Provenance is bound by the driver pin,
  the fixture sha and the nonce; the browser's own execution is not re-derived.
- **Secure-context state is not recorded.** The fixture is `http://127.0.0.1:<port>` (a
  potentially-trustworthy origin); nothing here measures a non-secure-context page.

## Limits the wave established (r89)

- **The pins are declaration-level in the counter.** `driver-pin` and `fixture-hash` compare receipt
  fields to the CLI pins; the counter never opens the instrument bytes. The fixture is verifiable
  out-of-band from the pinned driver + the r78 template + this receipt's nonce/child port, not by
  the counter.
- **Per-leg attribute copies are not separately witnessed.** The accept fact binds through the
  top-level `fixtureInputs` snapshot; the honest receipt has 0/41 divergent per-leg copies (this
  seat measured: all 41 legs carry a `fixtureInputs` mirror and all 41 agree with the top-level
  snapshot), but a per-leg copy can disagree with no finding — and the same is true of the
  `domRead` mirror on the four new legs.
- **The token list is bound for one entry, not for the snapshot.** `accept-domread-law` binds
  `accept` and `acceptTokens` of the target entry only. It does **not** bind the answer's
  `setParams.backendNodeId`, `setResult`/`setError`, or the `upload`/`uploadPng` block (name,
  size, sha256) — the sibling `accept-grammar-law` does bind those on its legs. The delivered
  file's name, size, type and page-read hex **are** bound; the on-disk upload record is not.
- **The delivered bytes still carry an r83 marker** — the PNG body ends `tabi-r83-png\n` and the
  text body is `tabi-r83-answer-alpha\n`, under the r89 file names `tabi-r89-b.png` /
  `tabi-r89-a.txt`. The names and hashes are what the counter binds; the content marker is
  inherited fixture bytes, not a wrong-generation artifact.
- **The whitespace leg measures the fixture's trim, not the spec's whitespace set.** It exercises
  SPACE characters only. It does not measure the ASCII whitespace set membership (tab / newline /
  form-feed / CR are absent), and it does not measure Chromium's trimming, because Chromium is
  never asked to tokenise on this path.

## Frontier (named, not held)

- Chromium's own `accept` tokenization and matching — the dialog's accept filter — still unmeasured;
  the r89 legs measure a page-computed token list beside a programmatic answer.
- The ASCII whitespace set membership and non-ASCII case folding inside the token list.
- A same-element origin comparison (an input reachable from both origins via a `postMessage`
  proxy) — not constructible in the current loopback fixture.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event) — needs a UI-side probe or a source-side reading of the colour chooser path.
```

### A.3 — the eight divergences from the committed r88 note

Measured line-by-line against `corpus/knowledge/chromium-showpicker-runtime-round-88.md`.

| # | r88 note says | r89 reality (measured) | what the r89 note must do |
|---|---|---|---|
| **D1** | "Ten attribute-string values, nine of them in-grammar" | Still ten **raw** attribute strings, nine in-grammar — but r89 adds a **second** dimension: a DOM-parsed token list on four of them. The count of raw strings is unchanged; the count of *parsed* token lists is four. | Say "ten attribute-string values … and a DOM-parsed token list on four of them"; do **not** write "fourteen values". |
| **D2** | The whitespace leg "measures the raw attribute string, not a parsed token list" | r89 measures **both** for `aws`: raw `"  image/png ,  .txt  "` and tokens `["image/png", ".txt"]`. | The r88 limit bullet is superseded; carry the r89 wording ("the fixture's trim, not the spec's whitespace set"). |
| **D3** | "the parser's whitespace/comma normalization read from the DOM rather than the raw string" is **frontier** | r89 closes the *frontier* half: the DOM-read token list exists and is bound. What remains open is Chromium's own tokenization. | Move the frontier to "Chromium's own tokenization / the dialog's accept filter"; do **not** claim §2.3.8 conformance of the fixture's rule. |
| **D4** | "The comma/whitespace normalization rules are not on the staged page." | r89 **stages** them: `.ufo/waves/round-89/sources/common-microsyntaxes.html`, 121,595 B, sha256 `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666`. The dfn is at byte 116282; the worked example at byte 117049. | Drop the bullet; cite S224 and the staged page. |
| **D5** | "the r88 counter re-derives all of them (102 checks)" | The r89 counter is a **different instrument**: 107 checks (working tree) or 108 (frozen D1 bytes). The r89 counter gains `accept-domread-law` and (at D1) `replay-limit-consistency`; the D3 bytes move `replay-limit-consistency` into `out.limit.replayConsistency`. | Write the settled count only, and make the note's `recheck:` line, the SCORECARD `Scored (r89)` line and the selftest runner's `counter-clean` assertion all carry the **same** number. |
| **D6** | "the honest receipt has 0/37 divergent per-leg copies" | 41 legs now; this seat measured **0 of 41** divergent. | Update the denominator to 41 (and keep the "a per-leg copy can disagree with no finding" caveat — it is still true). |
| **D7** | The r88 note's limits bullet cites the **r87** fixture/child hashes `10e444f7…` / `bbb22189…` where r88's are `8f93405128f1…` / `2ac1101032b4…` | r89's are fixture `69acad5754e0…` / child `7d15ea8281c5…` (both read from the scored receipt). | Cite r89's hashes only. The r88 note's stale-hash defect is a r88 record defect; do not carry it forward. |
| **D8** | "Ten attribute-string values … the r86/r87 forms … and the r84 extension-token law (`.txt` into `accept=".png"`) are the controls" | Carried unchanged and still correct: the r89 four are **duplicates of existing (input, file) pairs**, so the controls list is unchanged. | Keep; add the "the four new legs duplicate earlier pairs" bullet so a reader does not count them as new coverage of new pairs. |

**Carried unchanged (verified, do not touch):** the acceptance-not-filtering limit; the "dialog
unmeasured" limit; the colour-popup-is-a-file-chooser-metric limit; "the counter reads a receipt";
the constant-offset replay escape; secure-context state not recorded; the pins-are-declaration-level
limit; the r83 content-marker limit; and the two named frontiers (postMessage proxy, colour popup
UI probe).

---

## Appendix B — the lesson `## Gate` source rows for S224 (deliverable (b))

### B.1 — the row (paste-ready)

```markdown
### Sources — opened this round

The L1 fetched the WHATWG common-microsyntaxes page on 2026-11-08 (HTTP 200, 121,595 bytes,
sha256 `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666`, staged at
`.ufo/waves/round-89/sources/common-microsyntaxes.html`).

- **S224** — WHATWG HTML §2.3.8 "Comma-separated tokens", the definition the `accept` attribute's
  token list is read against. Located quote (24 words, `printf '%s' … | wc -w`): "A set of
  comma-separated tokens is a string containing zero or more tokens each separated from the next by
  a single U+002C COMMA character". The dfn's operative half continues "… where tokens consist of
  any string of zero or more characters, neither beginning nor ending with ASCII whitespace, nor
  containing any U+002C COMMA characters (,), and optionally surrounded by ASCII whitespace"
  (§2.3.8 `id=set-of-comma-separated-tokens`, dfn paragraph at bytes 116282–116959 of the staged
  page); the worked example follows at byte 117049: the string `" a ,b,,d d "` "consists of four
  tokens: "a", "b", the empty string, and "d d"" (19 words). This is the normative ground for the
  r89 DOM-parsed token list — a token is delimited by commas and carries no leading or trailing
  ASCII whitespace — and for the round's own limit: **the lowercasing in the measured token lists
  is the fixture's rule, not the spec's** (§2.3.8 says nothing about case; the `accept` attribute
  requires each token to be "an ASCII case-insensitive match", which is a matching rule, not a
  normalization step). The spec's own worked example also shows that the **empty string can be a
  token**; the fixture's page-side tokenizer drops empty tokens, so the r89 token lists are the
  fixture's normalization, not the spec's token set — a limit, not a defect in the acceptance law.

Identified 1 / screened 1 / included 1 (S224, mined) / excluded 0. The round-89 search-log entry is
added at `corpus/SOURCES.md` (this round's bounded fetch); the registry grew 223 → 224 rows.
```

### B.2 — the located quote, its word count and its location (measured by this seat)

| item | value |
|---|---|
| Source | WHATWG HTML §2.3.8 "Comma-separated tokens" — https://html.spec.whatwg.org/multipage/common-microsyntaxes.html |
| Anchor | `id=set-of-comma-separated-tokens`, the `<dfn>` paragraph |
| Staged copy | `.ufo/waves/round-89/sources/common-microsyntaxes.html` |
| Staged size / sha256 | 121,595 B / `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666` |
| Access date | 2026-11-08 (HTTP 200) |
| **Located quote** | "A set of comma-separated tokens is a string containing zero or more tokens each separated from the next by a single U+002C COMMA character" |
| **Word count** | **24 words** (`printf '%s' "…" \| wc -w` → `24`) |
| Verbatim? | **Yes** — the string appears exactly in the page's rendered text (tags stripped, whitespace collapsed). Verified against the staged bytes. |
| Byte location (raw file) | dfn paragraph at **116282–116959**; the quote's own opening at byte **116320** (`set of comma-separated tokens</dfn> is a string containing`) |
| Secondary quote (worked example) | "the string `" a ,b,,d d "` consists of four tokens: "a", "b", the empty string, and "d d"" — **19 words**, verbatim, byte **117049** |
| Tertiary quote (whitespace rule) | "Leading and trailing whitespace around each token doesn't count as part of the token" — **14 words**, verbatim, immediately after the example |
| Tertiary quote (empty token) | "the empty string can be a token" — **7 words**, verbatim, byte **117208** |

**Why 24 words.** SOURCES contract rule 1 requires "a ≤25-word quote with its location grounding
`teaches`". The full dfn sentence is 31 words; the trailing half alone is 20 words. The 24-word
head carries the *delimiter* rule (one U+002C COMMA between tokens), which is the part the r89
measurement is about, and the trailing half is quoted in prose beside it with its own byte range.
Both are verbatim; together they cover the whole dfn without exceeding the budget in any one quote.

### B.3 — the admitted / rejected block for the same lesson (paste-ready)

```markdown
Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-89.md` (cites S224, S223, S219, S216
and the r88 carrier rows).

Rejected (with flip conditions):

- **"The r89 token list is the WHATWG §2.3.8 token set"** — the measured lists are the page's own
  `split(',')` + `trim()` + `toLowerCase()` output (`scripts/chrome-cdp-showpicker-round89.mjs:142`):
  JS `trim()` strips the whole JS whitespace set, JS `toLowerCase()` is Unicode lowercasing, and
  empty tokens are dropped where §2.3.8 says the empty string can be a token. The `accept`
  attribute's own grammar ("each of which must be an ASCII case-insensitive match") is a matching
  rule, not a normalization step. Flip: a leg that exercises a tab/newline/CR, a non-ASCII
  letter, or an empty segment, and a reading of Chromium's own tokenization path.
- **"The dialog filters what the user sees"** — the receipt answers programmatically; the dialog is
  unmeasured. Flip: an interactive-dialog harness.
- **"The DOM-read token list is Chromium's own parse of `accept`"** — Chromium is never asked to
  tokenise on this path; the tokens are computed by the page. Flip: a measurement that shows the
  user agent's own token list, e.g. a `showPicker()` dialog whose filter is observed.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.
```

**Also required for the same lesson (F5):** a "Report corrections carried into this round"
section repeating the r88 D6/D7 correction — the r89 drift gate's `selftest-wording` statement
reads `corpus/lessons/round-89.md` and requires `D6` plus `selftest 10/10 at D7` (or `D7 wording`).
The r88 lesson carries the passage at lines 61-65.

---

## Appendix C — the SCORECARD wording (deliverable (c))

### C.1 — the capability row (paste-ready)

```markdown
| `chromium-showpicker-linux` (generation r89) | As r88, and now: the `accept` acceptance law holds over a **DOM-parsed token list** — four new legs re-read `window.__inputs()` on the page at settle and the counter binds **both** the raw accept string and the parsed token list (`image/*`→`["image/*"]`, `image/png, .txt`→`["image/png",".txt"]`, `image/png,application/pdf`→`["image/png","application/pdf"]`, `"  image/png ,  .txt  "`→`["image/png",".txt"]`), while two of the four deliver a file that matches **neither** token (`image/*` and `image/png,application/pdf` both accept `text/plain`) — the token list does not filter a programmatic answer, and each delivered file lands with trusted input+change and page-read bytes (41 legs, __CHECKCOUNT__ checks) | `corpus/evidence/round89/chromium-showpicker/receipt.json`; `corpus/knowledge/chromium-showpicker-runtime-round-89.md` | 79 |
```

**`__CHECKCOUNT__`** must be the settled number (**107** on the current working-tree counter, **108**
on the frozen D1 counter — both measured clean on the same receipt). It must equal the note's
`recheck:` line, the `Scored (r89)` trailer and the runner's `counter-clean` assertion (which
currently asserts **102** — see F1). **Do not** write "fourteen accept values" or "four new accept
forms": the raw attribute-string count is unchanged at **ten** (nine in-grammar); r89 adds the
parsed dimension on four of them, on (input, file) pairs that duplicate four earlier legs.

### C.2 — the round-89 section header (paste-ready)

```markdown
## Round 89 (2026-11-08, Linux host) — C1 capability `chromium-showpicker-linux` generation r89 (the DOM-parsed token list); C2 calibration, the r88 spot-check routed defects 1-2

Base `5a901163`; instrument freeze D __D__ (the scored receipt's nonce `tabi-r89-l1-7bde5e6c2f2d`;
the receipt was produced once and every later freeze touched only non-receipt instruments).
Axes at start: all six at 9; C1 works a lowest axis and is a capability move (generation r89 of the
r79 capability); C2 works calibration (record-vs-state mismatches).
```

**`__D__`** must be the digest of the freeze finally committed. The freeze is moving during this
wave (this seat observed the working `freeze.txt`'s own sha256 at `7e21484c…`, `cea37031…` and
`d7739fdb…`; `plans/round-89.md` names `a78e70a4` for two different freezes — see the flag below).
The SCORECARD, the lesson, `claims.json` and `LOG.md` must all name the **same** final digest, and
the count of freezes is itself a claim the r88 mistake table asks to be stated honestly.

### C.3 — the claim table (paste-ready)

```markdown
| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-showpicker-linux` generation r89 (sourced: S224 new; S223/S219 carried) | `node scripts/check-showpicker-round89.mjs --lane <ABS lane> --receipt corpus/evidence/round89/chromium-showpicker/receipt.json --expect-driver-sha256 76b69b4f691d24c8c94a92897e33635d2386b9191f5aaa66640515dc998bd2d0 --expect-nonce tabi-r89-l1-7bde5e6c2f2d --expect-fixture-sha256 69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed --prior-set .ufo/waves/round-89/controls/c1/prior-set.txt --json`; leg (b) battery + kill power; leg (c) row, note, registry, selftest (predicate `C1-SHOWPICKER-R89`) | base `5a901163`: no r89 receipt → exit 2 `receipt-unreadable`; the r88 scored receipt under the r89 counter → exit 1, findings incl. `schema` and `plan-frozen` (`controls/c1/nowork-r88-under-r89.json`); after: the scored receipt → exit 0, `verdict clean`, **__CHECKCOUNT__ checks**, 0 findings; battery __BATTERY__ cases / 0 failed / coverage __CHECKCOUNT__/__CHECKCOUNT__; kill power __KILLPOWER__ mutants / __KILLPOWER__ killed / 0 survivors / 0 crashed / 0 unapplied; selftest __SELFTEST__ | VERIFIED |
| C2 calibration (9), the round-88 spot-check routed defects 1-2 (`scripts/check-record-drift-r89.mjs`, predicate `C2-RECORDDRIFT-R89`) | `node scripts/check-record-drift-r89.mjs --lane <ABS lane> --json` (exit 0 iff 4 claims, 0 mismatches) | before (base `5a901163` worktree, **which carries the r89 instrument files**): **__BEFORE__ mismatches** (`selftest-wording`, `gate-selftest`, `quality161-sweep` — `scored/drift-before.json`); after: **0** of 4 (`scored/drift-a.json`); the drift gate's own `--selftest` runs isolated and exits 0 with the fixture red for the intended reasons, and the fixture tree is removed in-process (0 `tabi-r89-driftfix-*` left behind) | VERIFIED |
```

### C.4 — the trailing lines (paste-ready)

```markdown
Knowledge 101 → 102 (`corpus/knowledge/chromium-showpicker-runtime-round-89.md`). Registry 223 → 224
(S224 new: WHATWG HTML §2.3.8 comma-separated tokens, the `accept` token shape; S223/S219 carried).
SKILL.md `## Round 89 gate registry` registers the six r89 instruments; `scripts/selftest-r89-gates.mjs`
runs them in order (11 gates).

Narrowings (`plans/round-89.md` §Narrowings): (1) acceptance is not filtering — the dialog is
unmeasured; (2) the token list is the **fixture's** normalization (comma-split, JS `trim()`, JS
`toLowerCase()`, empty tokens dropped) and not Chromium's own tokenization — §2.3.8 says nothing
about case and its worked example admits the empty string as a token; (3) the DOM read is a
page-computed field and the four `domRead` snapshots carry no leg identity — attribution rides on
the `id` inside a shared snapshot; (4) the four new legs duplicate four earlier (input, file) pairs
and add the parsed dimension, not new pairs; (5) `accept-domread-law` binds the target entry's raw
string and token list plus the delivered name/size/type/hex, but not the answer's `setParams` /
`setResult` / `setError` nor the `upload` block's sha256 (the sibling `accept-grammar-law` binds
those on its legs); (6) the byte contents stay the inherited r83 marker under the r89 file names;
(7) C2 counts four record statements, not every sentence.

Planned (r90): Chromium's own `accept` tokenization and the dialog's accept filter; the ASCII
whitespace set membership and non-ASCII case folding inside the token list; a same-element origin
comparison if the fixture can carry a `postMessage` proxy; a UI-side colour popup probe. Retired:
none.

Scored (r89): __CHECKCOUNT__ checks, battery __BATTERY__/__BATTERY__, kill power __KILLPOWER__/__KILLPOWER__, selftest __SELFTEST__, record drift __BEFORE__ → 0.
- Digests: D __D__, nonce tabi-r89-l1-7bde5e6c2f2d. __CHECKCOUNT__ checks, battery __BATTERY__ cases, kill power __KILLPOWER__ mutants.
```

### C.5 — the placeholders and what I measured

| placeholder | measured by this seat | status |
|---|---|---|
| `__CHECKCOUNT__` | **107** (working-tree counter `53593b5c…`) / **108** (frozen D1 counter `33d4b927…`); both clean, 0 findings, same receipt, same pins | **UNSETTLED — the L1's decision** |
| `__BATTERY__` | **223** cases, 0 failed, coverage 107/107 (`.ufo/waves/round-89/scored/battery-a.json` captured on the working-tree bytes; 222 on the earlier bytes) | measured; re-capture if the counter is re-pinned |
| `__KILLPOWER__` | **72** mutants / 72 killed / 0 survived / 0 crashed / 0 unapplied — measured by this seat against kill-power `576be85e…`, counter `53593b5c…`, negatives `0668a439…` (after the lane's 10:04:19 repair; two earlier runs of mine, against moving bytes, gave 70 killed / 2 crashed and 71 killed / 1 unapplied) | measured; re-run once more against the committed bytes |
| `__SELFTEST__` | the runner has **11** gates (`pins-match-freeze`, `counter-clean`, `battery`, `kill-power`, `nowork-control`, `noreceipt-control`, `tree-exempt-path-refused`, `tree-exempt-unmatched-refused`, `gate-selftest`, `record-drift`, `capability-status`); the run is **red** on `pins-match-freeze` (the runner's own sha had moved past its pin), `kill-power` (2 crashed) and `record-drift` (2 mismatches) | **UNSETTLED — three fixes pending** |
| `__BEFORE__` | **3** mismatches at base `5a901163` with the frozen gate pointed at a worktree that carries the r89 instrument files (`selftest-wording`, `gate-selftest`, `quality161-sweep`); **2** when it does not. The working-tree `frozenAmendments` records 3 on the instrumented-base reading — which I confirm. | **the L1's number is 3; the cell must state the reading** |

### C.6 — compatibility constraints the L1 must respect

1. **`scripts/check-capability-status.mjs`** reads every `| Capability |` table in `SCORECARD.md`. It
   requires a backticked capability name in cell 1, a round in the last cell, and the named round's
   section to list the same capability in a table row. The draft row keeps
   `chromium-showpicker-linux` and `79`, as the r88 row does. It also scans the named round's
   **claim rows** for `NOT VERIFIED` / `honest stop` — so if round 89's C1 or C2 verdict cell reads
   `NOT VERIFIED`, the capability row must be marked `provisional` or the gate goes red. **The
   `VERIFIED` in C.3's claim rows is load-bearing**: if C1 leg (c) "selftest green" is not green at
   the final freeze, the verdict cell must not say `VERIFIED` and the capability row must be marked
   provisional.
2. **`scorecard-tallies`** requires every `## Round N` section for N ∈ {44, 68, 79, 80, 81, 84, 85}
   to contain `selftest 9/9` and **no** `selftest 10/10`, and every `selftest 10/10` line anywhere
   in the file to sit inside a Round-87 or Round-88 section. The round-89 section therefore **must
   not** contain the string `selftest 10/10` — write `11/11` (the r89 runner has 11 gates). The
   draft's `Scored (r89)` line uses a placeholder, so this is a check on the filled-in text.
3. **`selftest-wording`** requires `corpus/lessons/round-89.md` to contain `D6` and either
   `selftest 10/10 at D7` or `D7 wording`, and the stale phrase to be **absent** from `SKILL.md`,
   `corpus/knowledge/chromium-showpicker-runtime-round-87.md`, `plans/round-87.md` and
   `corpus/lessons/round-87.md`.
4. **`quality161-sweep`** requires QUALITY §161's block to cite `check-record-drift-r89` and to
   mention SCORECARD/selftest/tally.

---

## Appendix D — three `## Mistakes` candidates for round 89 (deliverable (d))

Shape follows the round-88 lesson's table: `| class | evidence | captured-by | fix |`. The r88 lesson
had four rows (`fleet-root-misroot`, `mid-wave-re-freeze-churn`, `frozen-control-numeral`,
`selftest-witness-vacuity`); two of those classes **recur** in r89 and are carried forward here
with this round's evidence, and the third is new. Each names a measured defect, cites the seat that
measured it, and proposes a **record-text or rule** fix — none proposes amending a predicate,
counter, pin, prior, threshold or kill rule.

### D.1 — `frozen-control-numeral` (recurrence of the r88 class)

| class | evidence | captured-by | fix |
|---|---|---|---|
| `frozen-control-numeral` — C2's before-value was frozen at **2** mismatches (`selftest-wording`, `quality161-sweep`) from an estimate; the seat's base-worktree run of the frozen gate measured **3**, adding `gate-selftest`, which is red at base because `scripts/*round89.mjs` do not exist in a bare base tree. The numeral was corrected post-scoring to the measured 3 and disclosed in `claims.json` `frozenAmendments` + `plans/round-89.md` — **the second consecutive round in which this class fires** | `w1/R89Exec3.md` §1 (base `5a901163` worktree: exit 1, claims 4, mismatches 3, `failed: ["selftest-wording","gate-selftest","quality161-sweep"]`); `scored/drift-before.json`; this seat's own re-measurement: the frozen gate against an extracted base tree gives **2** mismatches with the r89 instrument files present in the tree and **3** without them — the numeral is a function of what the before-worktree contains, and the frozen wording named neither | the freeze checked the predicate but not that the before-value came from an executed control; r88's rule ("run the do-nothing control before freezing its number") was written but not applied before the r89 freeze | numeral corrected to the measured 3 with the reading stated ("the before-worktree carries the r89 instrument files"), disclosed in `claims.json` `frozenAmendments` + `plans/round-89.md` §Frozen-amendment note; predicate, gate bytes, after-value, thresholds and the do-nothing direction unchanged. **r90 rule:** run the do-nothing control **and** write down what the before-worktree contains (which files are present) before freezing its number, because the number is not a property of the base commit alone. The same rule must be applied to the C1 check-count numeral (see D.2) |

### D.2 — `stale-counter-count-in-a-sibling-instrument` (new to round 89)

| class | evidence | captured-by | fix |
|---|---|---|---|
| `stale-counter-count-in-a-sibling-instrument` — the r89 selftest runner `scripts/selftest-r89-gates.mjs` asserts, in its `counter-clean` gate, `r.json.checkCount === 102`. That is the **r88** counter's count, copied with the file. The r89 counter reports **108** at the frozen D1 bytes (`33d4b927…`) and **107** at the re-pinned working-tree bytes (`53593b5c…`), so C1 leg (c)'s "selftest green" is **false at both**: the runner's own gate can never be green on the r89 counter. The runner and the counter were frozen together at `7bde5e6c2f2d` and never executed green against each other — the exact failure the r88 lesson's own `mid-wave-re-freeze-churn` rule was written to prevent ("freeze only after a full selftest run on the exact bytes") | `scripts/selftest-r89-gates.mjs:55` (`r.json.checkCount === 102`); this seat's measurement: the runner's `counter-clean` gate is **red** (`exit 0`, `verdict clean`, `checks: 107`) in a full selftest run against the working tree; `w1/R89Critic.md` §"Stale count"; `w1/R89Review2.md` F9 (frozen bytes: 108 ≠ 102) | none — the `gate-selftest` gate only requires exit 0 of the isolated modes, and `pins-match-freeze` compares the file's sha256 to `freeze.txt` (so a coordinated re-pin of file + freeze.txt is green by construction and cannot witness the mismatch) | the runner's expectation must be **derived from the counter it runs**, not copied from the previous generation: read `checkCount` from the counter's own JSON and compare it to the number the *pinned* counter reports, or pin the expected count next to the counter's own pin so the two move together. **r90 rule:** a self-test that asserts a literal produced by a sibling instrument must take that literal from the sibling's output; a hand-copied count is a fourth stale-numeral surface alongside the SCORECARD tally, the lesson's scored line and the freeze digest |

### D.3 — `binding-verb-outruns-the-binding` (new to round 89)

| class | evidence | captured-by | fix |
|---|---|---|---|
| `binding-verb-outruns-the-binding` — the round-89 records state in three places that the counter binds more than it does. (a) "the counter binds BOTH the raw accept string AND the DOM-parsed token list **from spec §2.3.8** (split on commas, trim ASCII whitespace) plus ASCII lowercasing" — the tokens are the **page's own** `split(',')` + `trim()` + `toLowerCase()` output (`scripts/chrome-cdp-showpicker-round89.mjs:142`): JS `trim()` strips the whole JS whitespace set (U+00A0, U+FEFF, U+2028 included), JS `toLowerCase()` is Unicode lowercasing, and empty tokens are dropped where §2.3.8's worked example admits the empty string as a token; the counter compares the fixture's output to a constant and never re-derives §2.3.8. (b) "the counter binds names, sizes, types, hex **and hashes**" — on the four new legs `accept-domread-law` binds the delivered name/size/type and the page-read hex, but **not** `answer.setParams.backendNodeId`, `setResult`/`setError`, nor the `upload`/`uploadPng` block's sha256, all of which the sibling `accept-grammar-law` binds on its legs: five receipt mutations (backendNodeId 19→999, forged `setError`, forged `setResult`, `uploadPng.sha256` → 64 zeros, `uploadPng.name` → `forged.png`) all score **clean**, while the sibling's own conjuncts are bound on its legs. (c) "Attribution rides on the top-level fixtureInputs snapshot plus each domread leg's own domRead" — the four `domRead` arrays are byte-identical to each other and to the top-level snapshot, so the per-leg half attributes nothing: the counter binds two fields of the one target entry and the rest of the array is free (a cross-leg swap, a truncation, a fabricated array and a truncated per-leg `fixtureInputs` mirror all score clean) | `w1/R89Critic.md` §"What the bytes actually measure" and §"Does the counter enforce exactly that scope"; `w1/R89Review2.md` F2 (all four `domRead` byte-identical; a leg's array may be replaced by another's or by a fabricated one with no finding), F3 (`answer.setParams.backendNodeId` 19→999 exits 0; forged `setError`/`setResult` exit 0), F4 (`uploadPng.sha256` → 64 zeros exits 0), F1 (the settle-time `window.__inputs()` evaluate can be replaced by another allowlisted evaluate and the receipt still scores clean); **this seat's own independent re-derivation** (mutating a copy of the scored receipt in scratch and scoring it with the same pins, the scored receipt exempted by content hash): all five (b) mutations and all five attribution mutations exit 0 with no findings, while the three positive controls (state size, read hex, token list) each exit 1 on `accept-domread-law` — and all 41 legs carry a `fixtureInputs` mirror that agrees with the top-level snapshot (0/41 divergent) | none — the drift gate's `quality161-sweep` checks that a narrowing *reaches* the copies; it does not check that a **verb** ("binds", "from spec") matches the binding, and the kill-power list's two domread mutants target only the token list and the raw string, so "0 survivors" is not evidence about the other five | every verb in the claim's `type` cell, the note's laws and the SCORECARD capability row is restated at the strength the checks carry: "the page's own split-and-trim token list, read from the page", "the delivered name, size, type and page-read hex", "attribution rides on the `id` inside a snapshot that is shared across the four legs". The **law itself is not in question** — `accept` is not a validator on a programmatic answer — and two of the four new legs are counterexamples to the stronger reading (a `text/plain` file delivered into `image/*` and into `image/png,application/pdf`). **r90 rule:** a claim that says a counter "binds" X must name the check id that binds X, and the note's limit bullet must not restate a wider verb than the one the check carries |

**Note for the L1:** D.2 is the most urgent (it makes a claim leg false at both candidate freezes
and is a one-line instrument repair); D.1 is disclosed and needs only its reading stated; D.3 is the
calibration lesson and the one that will keep biting if the r88 pattern of "the note says *binds*
and the counter binds something narrower" repeats.

### D.4 — a fourth candidate this seat observed (offered as an addition, not a replacement)

The r88 lesson already carries the class `mid-wave-re-freeze-churn` and the row "the kill-power
mutant's stale from-string". Round 89 reproduced the stale-from-string half **inside the wave**, and
the lesson table has no row for it. Draft:

| class | evidence | captured-by | fix |
|---|---|---|---|
| `stale-mutant-from-string` — the kill-power list's `accept-grammar-state-dropped` mutant named the counter's `same(st, [[f.name, f.size, f.type, '']])` conjunct **alone**, but the counter's `accept-grammar-law` had grown the `&& arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1` conjunct as well (D2). The from-string therefore occurred **0 times** in the counter and the mutant was **unapplied** — neither a kill nor a survivor, and invisible in the headline tally. This is the r88 D4 class recurring *within* a wave rather than across rounds | this seat's standalone kill-power run against the moving bytes: `{"mutants":72,"killed":71,"survived":0,"crashed":1,"unapplied":["accept-grammar-state-dropped"]}`, the non-killed entry reading `from-string occurs 0 times`; the kill-power file was rewritten at 10:04:19, after the run began, and the re-run against the repaired bytes is **72/72 killed, 0 survived, 0 crashed, 0 unapplied** | none — the freeze checked the predicate but not that each mutant's from-string still matches the instrument it mutates; `pins-match-freeze` hashes the list and the counter separately and cannot see that one has fallen behind the other | the lane repaired the from-string during the wave (10:04:19) and the re-run is green. **r90 rule:** after any counter edit, re-run the kill power and require `unapplied: []` explicitly — a mutant that cannot be applied is not evidence, and the run's exit code already refuses it (`process.exitCode = survivors === 0 && crashed === 0 && summary.unapplied.length === 0`), so the number must be re-taken, not carried from an earlier run |
