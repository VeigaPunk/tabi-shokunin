# ReviewNoteClaims — knowledge-note claims vs oracle behaviour at review revision

Seat: TabiR22-2.ReviewNoteClaims-12 (leaf reviewer, read-only except this file).
Item: every factual claim in `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`
against the oracle at the review revision, against the retained round-21 raw, and
for overclaims of depth/coverage.

Review revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` ("round-22: repair
landing-stage oracle defects found by first positive run; retain W2 cap-refusal chain").
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Production read via
`git show e3cf4e0d…:PATH`. No lane script, oracle, selftest, browser or service was
executed; no VCS mutation; no delegation; no peer messaging.

Method: (1) read the note at the revision with line numbers; (2) read the oracle
`.ufo/waves/round-22/measure-c1.mjs`, the pinned expectations
`corpus/evidence/round-22/semantic-expectations.json`, the selftest harness and its
fixture, the retained round-21 raw/fixture/receipt and the finalized acquisition
record; (3) re-implemented the oracle's semantic checks independently in Python
(`/tmp/r22-notecheck/check.py`, my own code — not a lane script) and ran it over the
retained raw to test the note's own numbers; (4) checked every chronology sentence
against `.ufo/waves/round-22/round21-closure.json` and `.ufo/waves/round-22/w1/WakeHistory.md`.

---

## Verdict summary

The note is substantially honest: the outcome projection, the case table, the metric
definition, the axis discipline and every chronology number check out against the
revision, and an independent static re-run of the oracle's semantic checks over the
retained raw yields **zero findings across all twelve rows** with exactly the
projection the note claims (1 Pending / 5 Completed / 2 Canceled / 4 Error). The
native-submit landing semantics *after* the repair are consistent with the retained
raw and with the note's prose.

The defects found are **documentation-vs-oracle drift**: the note was last written at
`0f24164` (pre-repair) and was **not** updated by the post-crash repair, so the note
that is the oracle's declared source artifact still states the pre-repair landing
contract and still points at measurement artifacts that do not exist at the review
revision. Because the oracle binds only the note's **first line** (the source header),
none of this prose drift is visible to the gate.

No depth/coverage overclaim was found. The note explicitly refuses new observations,
new branches, a coverage denominator, a capability and a scalar promotion
(lines 14-19), and that refusal matches `claim-classification.json` and
`classification-ruling.json`.

---

## Findings (by severity)

### F1 — MEDIUM: the note's `na-native-submit` row still encodes the pre-repair landing contract; the repaired oracle enforces recorder-key *absence* and a tokenized landing query

Revision/path/line:
- Note: `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:40` (row `na-native-submit`)
  and `:50-51` ("Exact diagnostic strings and structural contracts are in the fixed expectations").
- Oracle: `.ufo/waves/round-22/measure-c1.mjs:115-130` (landing branch of `validatePageState`)
  and `:138-139` (`urlSearch` token substitution).
- The note's last commit is `0f24164`; the repair commit `e3cf4e0d` did not touch it
  (`git log --format="%H" -1 e3cf4e0d… -- corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`
  → `0f24164be77e72ba359fe4befdc42d96bc343034`, rc=0).

What the note says (line 40): "Completed, output array containing the landing JSON-LD
object; /landing with case nonce; old-document submits unavailable/null".

What the oracle at `e3cf4e0d` actually requires for the landing stage:
- the landing document's `nonce`, `submits` **and `errors`** recorder keys must be
  **absent** — not `null`, not empty (`measure-c1.mjs:119` `Object.hasOwn(actual,'nonce')`;
  `:122` `Object.hasOwn(actual,'submits')`; `:129` `Object.hasOwn(actual,'errors')` for
  the landing branch);
- the landing URL must be `/landing` with the query exactly `?q=<URL-encoded case nonce>`
  (`measure-c1.mjs:138-139`, `expected.urlSearch.replaceAll('$nonce', encodeURIComponent(nonce))`).

The note states neither the `errors`-key rule nor the query shape, and offers
"unavailable/**null**" for `submits` where the oracle requires **absence**. These are
precisely the two defects the author had to repair post-crash (D1 "absent-vs-empty",
D2 "tokenization" in `.ufo/waves/round-22/post-crash-repair.json:9-21`), so the note
now documents a contract that the oracle rejects.

Smallest counterexample: take the retained
`corpus/evidence/round-21/runtime/na-native-submit.json` after-action page state and
add the two keys the landing document does not have —
`"submits": null, "errors": []`. This satisfies the note's wording at line 40
("submits unavailable/null"; the note never mentions `errors`), yet the oracle at
`e3cf4e0d` rejects it with **two** findings:
`semantic_status na-native-submit:post:submit-observation` (`measure-c1.mjs:122`) and
`semantic_error na-native-submit:post:page-errors` (`measure-c1.mjs:129-130`).

Preserving positive: the retained raw's landing value —
`{url:"http://127.0.0.1:43143/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4",
secureContext:true, formExists:false, formActive:false, value:null, focused:""}` with
**no** `nonce`/`submits`/`errors` keys — satisfies the note's wording *and* the oracle
(my independent cross-check produced no finding for this row). So the defect is
documentation-only: no metric value, expectation pin or raw byte changes.

Smallest fix: rewrite note line 40 to state the enforced contract, e.g. "Completed,
output array containing the landing JSON-LD object; navigation to `/landing?q=<case
nonce>`; the landing document is a fresh document, so the fixture's `nonce`, `submits`
and `errors` recorder keys must be **absent** there — absent, not null and not empty".
No oracle or expectation change is required, and the pinned
`semantic-expectations.json` (`sha256 4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e`,
matching the oracle's `EXPECTATIONS_SHA256`) already encodes exactly this.

### F2 — MEDIUM-LOW: note lines 61-62 cite "round22 measurement receipts and binding manifest" that do not exist at the review revision, and no measurement of the committed revision is retained

Revision/path/line: note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:61-62`
("Before/after command outputs and measured revisions are retained in the round22
measurement receipts and binding manifest.") and `:2` ("revision-bound oracle
measurements belong in SCORECARD.md round22").

Facts at `e3cf4e0d`:
- `corpus/evidence/round-22/` contains exactly one file:
  `semantic-expectations.json` (`git ls-tree -r --name-only e3cf4e0d… -- corpus/evidence/round-22`,
  rc=0). There is **no** round-22 "binding manifest" file anywhere in the tree
  (round-16's analogue is `corpus/evidence/round-16/measurement-binding.json`; round-22
  has none).
- The round-22 receipts committed at the revision are
  `.ufo/waves/round-22/selftest-pre-repair-0f24164.json` (verdict failed, 41/42) and
  `.ufo/waves/round-22/selftest-repair-sandbox.json` (verdict clean, 44/44). The second
  is a **selftest-harness** receipt measured in the throwaway clone
  `/tmp/tabi-r22-st` **at `0f24164`** with the repaired oracle
  (`.ufo/waves/round-22/post-crash-repair.json`, `sandbox.measureAt0f24164WithRepairedOracle`).
- No receipt measuring the committed review revision exists **at** the revision:
  `.ufo/waves/round-22/checks-at-e3cf4e0.json` exists only in the working tree and is
  not in the revision tree (`git ls-tree … | grep -c checks-at-e3cf4e0` → 0, grep rc=1).
- The pointer at note line 2 resolves to `SCORECARD.md:1043-1069` at the revision, which
  contains the declaration and the axis correction but **no measured value and no
  measured revision**.

So the sentence promises (a) an artifact class that does not exist and (b) a
revision-bound measurement that is not retained at the revision the note belongs to.
This is the same gap W1 already recorded and never dispositioned:
`.ufo/waves/round-22/w1/Semantic11.md:135` — "BD-6 (draft note gaps) … (d) Lines 61–62
cite measurement receipts that do not yet exist."

Smallest counterexample: a reader at `e3cf4e0d` follows line 61's pointer, lists
`corpus/evidence/round-22/`, and finds one JSON file that is not a manifest, and
`.ufo/waves/round-22/`, and finds no artifact whose measured revision is
`e3cf4e0d…` — the "after" receipt measures `0f24164` in `/tmp`.

Preserving positive: the *content* of the note's other retained-evidence claims is
intact and verifiable — `selftest-repair-sandbox.json` does contain the after-run
stdout with `value 12 / verdict clean / exit 0` for all 44 selftest cases, and
`post-crash-repair.json` records the before-run (`value 0 / failed`) and the two
mutation probes. Nothing needs to be retracted; the sentence only needs to name what
exists and scope the measurement revision.

Smallest fix: replace lines 61-62 with the exact paths and their measured revisions,
e.g. "Before/after command outputs are retained in
`.ufo/waves/round-22/selftest-pre-repair-0f24164.json` (before, `0f24164`) and
`.ufo/waves/round-22/selftest-repair-sandbox.json` (after, repaired oracle in a `/tmp`
clone of `0f24164`); the binding contract is `corpus/evidence/round-22/semantic-expectations.json`.
No measurement at a committed round-22 revision is retained at this revision." This is a
post-w2b documentation repair and does not touch the metric, the expectations pin or
the raw.

### F3 — LOW: the note calls the receipt row "an index and summary" without recording the receipt's three different scopes — the exact trap W1 flagged as the "real hazard"

Revision/path/line: note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:31-33`
("the matching receipt row is an index and summary, not independent corroboration of
the raw event."); producer `scripts/webmcp-lifecycle-round21.mjs` (receipt construction);
W1 review `.ufo/waves/round-22/w1/Semantic11.md:120-135` (BD-6(b)).

The receipt row carries three different scopes: `after.responses` is **cumulative**
(every `WebMCP.toolResponded` for the invocation with `seq < post.seq`), while
`after.navigations` is **window-bounded** (`at >= after.start && seq < post.seq`) and
`after.submits` / `after.pageState` are **page-cumulative snapshots**. The oracle at
`e3cf4e0d` handles this correctly — it compares `after.responses` against the
cumulative raw list and `after.navigations` against the window-bounded list
(`measure-c1.mjs`, `receipt-raw-summary` / `receipt-navigation-summary` checks) — so
this is **not** an oracle bug. It is a gap in the corpus note, which is what a future
re-implementer would work from.

Smallest counterexample: an oracle that derives window membership from
`receipt.cases[auto-positive].after.responses` instead of raw `seq` counts the
auto-positive response twice (once as the initial-window response, once as an
"after-action" completion) and mis-fires the case — exactly W1's ST-FN1 hazard.

Preserving positive: the oracle as implemented at `e3cf4e0d` is unaffected (it reads
raw `seq`), and the retained raw for `auto-positive` has one response at `seq 12`,
before the initial observation at `seq 13`.

Smallest fix: one clause at note lines 32-33, e.g. "…an index and summary with three
different scopes (`after.responses` cumulative, `after.navigations` window-bounded,
`after.submits`/`pageState` page-cumulative); derive window membership from raw `seq`,
never from the summary."

### F4 — LOW: the `na-pending` row understates the oracle's requirement (zero correlated responses anywhere in the trail, not only inside the two windows)

Revision/path/line: note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:37`
("no correlated response within the two recorded windows; active form");
oracle `measure-c1.mjs:287` (`pending-has-response`) and `:303`
(`response-outside-finite-pending-case`).

The oracle rejects **any** `WebMCP.toolResponded` frame correlated to the case
invocation anywhere in the recorded trail for `na-pending` (expected `response: null`,
`responseWindow: "none"`), not only one inside the two sampled windows. The note's
"within the two recorded windows" would let a re-implementation accept a late
response.

Smallest counterexample: a raw where one correlated `toolResponded` frame is appended
after the after-action observation — passes the note's wording, fails the oracle with
`semantic_status na-pending:pending-has-response`.

Preserving positive: the retained `na-pending` raw contains **zero**
`WebMCP.toolResponded` frames (my cross-check counted `matchingResponses.length == 0`
for that case), so it satisfies both the note and the oracle; no metric impact.

Smallest fix: change "within the two recorded windows" to "anywhere in the recorded
trail" in note line 37.

### F5 — LOW: the `auto-positive` row states no output-shape, error or navigation rejection, unlike every other row

Revision/path/line: note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:47`
versus `:38-46`; W1 `.ufo/waves/round-22/w1/Semantic11.md:135` — "BD-6 … (a) Row 47 has
no output, error, timing, or navigation rejects."

The row's reject cell ("pretending this held-ground control is a new non-autosubmit
branch") is a scope claim, whereas the other rows' reject cells are rejection rules
over recorded distinctions. The pinned expectation for `auto-positive` is in fact
strict — output exactly `{ok:true, nonce, q}`, `errors: []`, one agent-invoked submit,
no navigation — and the oracle enforces it (`semantic_output`, `semantic_error`,
`semantic_navigation`, `semantic_status` are all reachable for that case; the selftest
carries `wrong-success-output` → `semantic_output` for `auto-positive`).

Smallest counterexample: the note gives a reader no reason to reject a `auto-positive`
row whose response output is `{ok:false, nonce, q}`; the oracle rejects it
(`semantic_output`), and the selftest case `wrong-success-output` proves it.

Preserving positive: the retained `auto-positive` raw satisfies both the note's weaker
wording and the oracle's strict expectation, so the row's *measurement* is unaffected.

Smallest fix: extend note line 47's reject cell with the recorded distinctions the
oracle enforces for that case (exact `{ok:true,nonce,q}` output, no page errors, exactly
one agent-invoked submit, no navigation).

---

## Claims checked and found correct (no finding)

1. **Outcome projection** — note `:51-53` "one finite pending, five Completed, two
   Canceled and four Error cases". My independent re-implementation of the oracle's
   semantic checks over the retained round-21 raw produced exactly
   `Pending 1 / Completed 5 (na-click, na-requestsubmit, na-native-submit, na-delayed,
   auto-positive) / Canceled 2 (na-reset, na-remove) / Error 4 (na-reject, na-throw,
   na-invalid-submit, auto-invalid)` with **0 findings** on all 12 rows
   (`python3 /tmp/r22-notecheck/check.py`, rc=0). This matches the independent
   non-author closure text (`.ufo/waves/round-22/round21-closure.json`,
   `verification.semantic_remeasurement`: "one finite pending, five Completed, two
   Canceled, four Error").
2. **Native-submit landing semantics after the repair** — note `:40` "output array
   containing the landing JSON-LD object". Verified against the retained raw and the
   producer: the landing route serves
   `<script type="application/ld+json">{"dummy":"landing"}</script>`
   (`scripts/webmcp-lifecycle-round21.mjs:137`) and the recorded response is
   `output:[{"dummy":"landing"}]` with `status:"Completed"`
   (`corpus/evidence/round-21/runtime/na-native-submit.json`, frame seq 16); the
   navigation is `/landing?q=<case nonce>` (frame seq 15) and precedes the response
   (seq 15 < 16), which is what `measure-c1.mjs:318-325` requires. The oracle's
   post-repair landing rules (recorder-key absence; `encodeURIComponent` substitution)
   are satisfied by the retained raw.
3. **Metric/target semantics** — note `:59-60` "target12 is conditional on all twelve
   rows, the case population and their declared evidence bindings". Matches
   `measure-c1.mjs` (`row.counted = !blocked && row.semanticMatch`; `blocked` = any
   global finding; `case_set` checks the receipt case set) and the pinned
   `semantic-expectations.json` (`cases.length === 12`, ordered `CASE_IDS`).
4. **Expectation independence** — note `:23-25` "Expected statuses and outcome shapes
   are independent of the evaluated receipt: a coherently changed raw event and summary,
   with corrected digest links, must still fail the case's semantic expectation".
   Verified in the harness: `selftest-c1.mjs` `changeCase()` mutates the **raw** and the
   receipt summary and then calls `resealAcquisition()` (`:63-77`), which re-derives
   `receipt.cases[].evidence.sha256`, `execution.artifacts` and `execution.receiptSha256`;
   the 44-case fixture still expects failures. The note's own caveat at `:26-27`
   ("not … a guarantee against an author changing both the evidence and the independent
   expectations") is accurate, since `EXPECTATIONS_SHA256` lives in the same
   author-editable script.
5. **Recheck commands** — note `:3` and `:55-57`. `measure-c1.mjs` at the revision
   implements both `REV` (40-hex, `filesAt()` with `ls-tree`/`cat-file` over the
   whitelisted `INPUT_PATHS`) and `--selftest` (spawning
   `.ufo/waves/round-22/selftest-c1.mjs`); `:7` of the note is therefore now true
   (W1's BD-6(c) is satisfied by the implementation).
6. **Recheck is executable at the revision** — all 25 acquisition artifacts plus the
   receipt, producer, execution record, expectations and note are committed blobs at
   `e3cf4e0d`, and every `execution.artifacts[*]` digest in
   `.ufo/waves/round-21/runtime-execution-finalized.json` matches the blob at that
   revision (25/25, 0 failures; `execution.receiptSha256` matches; producer
   `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` matches the note
   `:92-93` and the expectations pin).
7. **Expectations pin** — `sha256` of `corpus/evidence/round-22/semantic-expectations.json`
   at the revision is `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e`,
   equal to the oracle's `EXPECTATIONS_SHA256` (rc=0).
8. **Acquisition timing and digest** — note `:91-93` "the finalized acquisition began
   13:51:46Z with producer digest `bc11e4d6…`". Verified in
   `.ufo/waves/round-21/runtime-execution-finalized.json`:
   `startedAt 2026-10-21T13:51:46.597742+00:00`, `producerSha256 bc11e4d6…`.
9. **Chronology numbers** — note `:69-72` and `:90-93` all match
   `.ufo/waves/round-22/round21-closure.json`
   (`verification.wave_conformance_debt`: peer IRC to five failed W1 seats; broadcast to
   55 W1 seats including 23 already failed; 24 failed seats with post-broadcast
   activity; 20 later failure notices; three initial-Zai seats later exhausted Codex
   capacity; W1 returns 13:15:40Z before four final exits, all exited by 13:19:45Z; W2
   final exit 13:45:46Z precedes returns 13:49:02Z) and
   `.ufo/waves/round-22/w1/WakeHistory.md` (55 broadcast deliveries / 23 retry-exhausted
   recipients; 46 peer messages on 8 seats; 9 peer deliveries to terminal seats; 3
   post-dispose peer deliveries on 2 seats — BuildSelftest ×2, BuildCounter ×1;
   BuildSelftest omitted from the old revival list; "woken" is not a terminal-state
   classification; the "peers revived BuildRuntime/BuildCounter" causal attribution
   unsupported — ordering observed, cause not).
10. **Axis discipline / no overclaim** — note `:14-19` matches
    `.ufo/waves/round-22/claim-classification.json` (`operativeAxis: operability`,
    `populationBefore/After: 12/12`, `newObservations: 0`, `scalarBefore/After: 8/8`)
    and `classification-ruling.json` ("operability with depth held at 12→12 is the
    honest classification … a third definitional 0→12 claim on the same bytes would be
    inflation"). The note refuses new observations, branches, a coverage denominator, a
    capability and a scalar promotion; nothing in it claims coverage, capability or
    promotion. `SCORECARD.md:1043-1069` at the revision carries the same discipline.
11. **Limits section** — note `:106-115` matches the observed evidence: no new browser
    run (the retained acquisition is the round-21 finalized run), finite no-response
    (`na-pending` has no response, not a permanent-pending claim), PID cleanup sampled
    (the raw carries `browserPidsBefore`/`processIdentities` samples, and the note calls
    them sampled), and author-side reviewers remain author-side.

---

## Residual risk

- **The note's body is not machine-bound.** `measure-c1.mjs:334-337` checks only the
  note's **first line** against `SOURCE_HEADER` (plus `expectations.sourceNotePath` /
  `sourceHeader`). The entire case table, the chronology section and the limits are
  prose with no automated counterpart, so F1–F5 are invisible to the gate: an
  oracle-fidelity regression in prose cannot fail `measure-c1.mjs` or its selftest.
  This is the structural reason the note drifted across the repair.
- **Author-side fitting of the repair** is disclosed in the lane's own record
  (`.ufo/waves/round-22/post-crash-repair.json`, `honesty`: repair authored after
  observing the failing positive). That is a conformance question for the wave owner,
  not a note defect; the note itself makes no claim about the repair, and my static
  cross-check shows the repaired oracle's own contract is satisfied by the retained raw.
- **W1's note gaps are still undispositioned.** BD-6(a) (F5), BD-6(b) (F3) and BD-6(d)
  (F2) are all still open in the note at `e3cf4e0d`; BD-6(c) is closed by the
  implementation. No W1 report records a disposition for the three open ones.
- **The "after" measurement is a sandbox measurement**, not a measurement of a
  committed round-22 revision (F2). Until a revision-bound measurement at a committed
  round-22 revision is retained, "12 rows, clean" is evidenced only against
  `0f24164`-era bytes plus the repaired oracle.
- **No independent (non-author) admission** exists for the repaired oracle at this
  revision; every W2 seat was a cap refusal (`.ufo/waves/round-22/w2-cap-refusal-*.json`),
  so the repair has had no author-side seat review either.

## Verification gaps / checks not run

- **The lane oracle was not executed.** `node .ufo/waves/round-22/measure-c1.mjs <rev>`
  and `measure-c1.mjs --selftest` were **not run** (item boundary: static review, no
  execution of lane scripts). The 0-finding result above is from **my own**
  re-implementation of the oracle's semantic checks in Python
  (`/tmp/r22-notecheck/check.py`), not from the lane oracle; the lane oracle's
  envelope/binding checks (acquisition manifest, `EXPECTATIONS_SHA256`, producer pin,
  `filesAt` whitelisting) were verified by inspection and by independent digest
  computation, not by running the gate.
- **`git log`/`ls-tree`/`show` were used read-only**; no commit, checkout, jj operation
  or index write was performed in the lane or the fleet repo.
- **No LSP device is mounted in this session** (`xd://lsp` → "No such tool"), so the
  caller/definition/diagnostics checks required by the reviewer role were done by
  literal reading of the cited files (`git show` + `grep`) rather than by a language
  server. For this item the referenced "callers" are the oracle's own check functions
  and the corpus pointers, all of which were read directly.
- **No browser, Chromium, CDP, REA, service or credential use**; the round-21 raw is
  historical evidence and was not re-acquired.
- **Unverified by me:** that `checks-at-e3cf4e0.json` (working tree, untracked at the
  revision) reports the same 12-row clean result — I did not parse it, since the file
  is not part of the review revision.
- **Not checked (out of item scope):** the authenticity question (whether an author
  changed evidence and expectations together), browser semantics beyond the retained
  acquisition, and every other note in `corpus/knowledge/`.

---

## Commands run (read-only; exit codes as observed)

| Command | Exit |
|---|---|
| `git -C <lane> show e3cf4e0d…:corpus/knowledge/webmcp-lifecycle-oracle-round-22.md \| cat -n` | 0 |
| `git -C <lane> show e3cf4e0d…:corpus/knowledge/webmcp-lifecycle-oracle-round-22.md \| diff - corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (identical) | 0 |
| `git -C <lane> log --format="%H" -1 e3cf4e0d… -- corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` → `0f24164…` | 0 |
| `git -C <lane> show e3cf4e0d…:.ufo/waves/round-22/measure-c1.mjs` (+ `grep -n` of the cited checks) | 0 |
| `git -C <lane> show e3cf4e0d…:corpus/evidence/round-22/semantic-expectations.json` | 0 |
| `git -C <lane> show e3cf4e0d…:corpus/evidence/round-22/semantic-expectations.json \| sha256sum` → `4a693dce…` | 0 |
| `git -C <lane> show e3cf4e0d…:.ufo/waves/round-22/selftest-c1.mjs` (+ `grep -n` mutation kinds) | 0 |
| `git -C <lane> show e3cf4e0d…:.ufo/waves/round-22/fixtures/expected.json` (44 cases) | 0 |
| `git -C <lane> show e3cf4e0d…:.ufo/waves/round-22/post-crash-repair.json` | 0 |
| `git -C <lane> show e3cf4e0d…:.ufo/waves/round-22/round21-closure.json` | 0 |
| `git -C <lane> show e3cf4e0d…:.ufo/waves/round-22/w1/WakeHistory.md` | 0 |
| `git -C <lane> show e3cf4e0d…:.ufo/waves/round-22/w1/Semantic11.md` | 0 |
| `git -C <lane> show e3cf4e0d…:.ufo/waves/round-21/runtime-execution-finalized.json` | 0 |
| `git -C <lane> ls-tree -r --name-only e3cf4e0d… -- corpus/evidence/round-21/runtime` (25 blobs) | 0 |
| `git -C <lane> ls-tree -r --name-only e3cf4e0d… -- corpus/evidence/round-22` (1 file) | 0 |
| `git -C <lane> ls-tree -r --name-only e3cf4e0d… -- .ufo/waves/round-22 \| grep -c checks-at-e3cf4e0` → `0` | 1 (grep: no match) |
| `git -C <lane> show e3cf4e0d…:SCORECARD.md \| grep -n "## Round22\|### Round22"` | 0 |
| python3 acquisition-digest verification (25 artifacts + receipt + producer vs the finalized manifest) | 0 (0 failures) |
| `python3 /tmp/r22-notecheck/check.py` (my independent re-implementation of the oracle's semantic checks) | 0 (0 findings, 12/12 rows) |

No tool was installed or upgraded for this item; no install record applies.

Report: .ufo/waves/round-22/w2b/ReviewNoteClaims.md
