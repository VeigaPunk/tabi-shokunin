# RepairNewControls — round-22 post-crash repair: the two new CLI controls

Item: `native-landing-errors` and `native-landing-wrong-query` in
`.ufo/waves/round-22/selftest-c1.mjs` + `.ufo/waves/round-22/fixtures/expected.json`.
Revision reviewed: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed, pushed; lane HEAD = e3cf4e0).
Production read via `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0…:PATH`.
Scope of this seat: only the two new controls. Author-side falsification; this is a recommendation,
not an admission. No lane/fleet/VCS write, no browser, no install, no delegation, no seat messaging.

## Verdict

**The two new controls are sound on the three asked axes, and both are effective.** No blocking defect.

* locality — each mutation changes exactly one semantic field (`.pageObservations[1].value.errors`
  / `.pageObservations[1].value.url`) plus its two required copies; nothing else moves except the
  mandatory digest reseal.
* coherence — the after-action marker frame, the raw `pageObservations` entry and
  `receipt.after.pageState` are rewritten together and stay mutually equal, so the oracle's
  `observation-frame-link`, `page-observation-raw-link` and `receipt-raw-summary` checks stay green
  (no `evidence_binding` is emitted).
* intended reason — each mutant emits **exactly one** finding with the exact intended detail:
  `semantic_error / na-native-submit:post:page-errors` and
  `semantic_navigation / na-native-submit:post:url`.
* effectiveness — disabling the corresponding oracle rule makes exactly one case go red (43/44) and
  nothing else; the unmodified positive stays 12 rows / clean / exit 0.

Non-blocking findings F1–F5 below (2 medium, 3 low) — mostly test-realism and harness strength,
not oracle correctness. Smallest fixes are given per finding.

## Axes and how each was checked

| Axis | Method | Result |
|---|---|---|
| A1 mutate only the intended field | field-level JSON-path diff of the whole fixture tree, base vs mutant (probe copy of `selftest-c1.mjs` with a `dumpDiff` hook) | pass, see F1 |
| A2 marker / pageObservations / `record.after.pageState` coherence | same diff + oracle's own link checks (`measure-c1.mjs:139-141` link block, `:249-252` summary block) | pass |
| A3 fail for the intended reason (exact id **and** detail) | selftest stdout of each mutant | pass for both (details quoted below) |
| A4 control effectiveness | two oracle mutation probes (disable the landing-errors rule; drop the url-search comparison) | pass (43/44, one case each) |
| A5 preserving positive | `measure-c1.mjs e3cf4e0…` and the `positive` selftest row | pass (value 12, clean, exit 0) |
| A6 harness strength of the assertion | probe renaming the oracle's finding detail string | **FAIL** → F2 |

## Evidence

### E1 — Field-level diff of the two mutants (probe copy of `selftest-c1.mjs`, throwaway clone)

`native-landing-errors` (case `na-native-submit`) changes exactly:

```
FILE corpus/evidence/round-21/runtime/na-native-submit.json 8906 -> 8950
    .frames[16].value.errors: ADDED []          # after-action observation marker
    .pageObservations[1].value.errors: ADDED []  # raw page observation
FILE corpus/evidence/round-21/runtime/receipt.json 22143 -> 22167
    .cases[3].after.pageState.errors: ADDED []
    .cases[3].evidence.sha256: "28a20412…" -> "b3fdf54e…"
FILE .ufo/waves/round-21/runtime-execution-finalized.json 4851 -> 4851
    .artifacts…receipt.json, .artifacts…na-native-submit.json, .receiptSha256  (reseal only)
```

`native-landing-wrong-query` changes exactly:

```
    .frames[16].value.url: "http://127.0.0.1:43143/landing?q=8a5839ad-…" -> "…?q=wrong-landing-nonce"
    .pageObservations[1].value.url: (same replacement)
    .cases[3].after.pageState.url: (same replacement)
    .cases[3].evidence.sha256 + the two execution artifact digests (reseal only)
```

Not touched by either mutant: `record.after.responses`, `record.after.submits`,
`record.after.navigations`, the `Page.frameNavigated` frame, the response frame, the fixture HTML.
The reseal is exactly what the harness needs (`changeCase` → `resealAcquisition`,
`selftest-c1.mjs:104-114`).

### E2 — Observed failure reason (selftest stdout, revision e3cf4e0)

```
native-landing-errors      exit 1 value 0 verdict failed
  findings: [{id: semantic_error,      detail: "na-native-submit:post:page-errors"}]
native-landing-wrong-query exit 1 value 0 verdict failed
  findings: [{id: semantic_navigation, detail: "na-native-submit:post:url"}]
```

Both are singletons — no cascade, no `evidence_binding`, no `input_shape`. The two detail strings
are the ones the two oracle branches emit (`measure-c1.mjs:130` and `:141`).

### E3 — Effectiveness probes (oracle mutated in the throwaway clone only)

* Probe A — `measure-c1.mjs:129` landing branch → `landing ? false : …`
  ⇒ selftest exit 1, 43/44; **only** `native-landing-errors` fails, and it fails as
  `observed exit 0, value 12, findings []` (the mutant becomes indistinguishable from the positive).
* Probe B — `measure-c1.mjs:140` drop `url.search !== expectedSearch ||`
  ⇒ selftest exit 1, 43/44; **only** `native-landing-wrong-query` fails, same shape.
* Probe C — `measure-c1.mjs:141` detail `…:url` → `…:url-mismatch`
  ⇒ selftest exit 0, 44/44 clean ⇒ the harness does **not** assert the detail (F2).

Each probe was reverted with `git checkout --` inside the clone; `git diff --stat` is empty
afterwards (clone only; the lane was never touched).

### E4 — Preserving positive

`node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`
⇒ exit 0, `c1_semantically_checked_lifecycle_rows` 12, verdict `clean`, 12 counted rows, `findings []`.
The `positive` selftest row also stays 12/clean/exit 0, so the new controls do not eat the positive.

### E5 — Semantic grounding of the landing-errors control

`scripts/webmcp-lifecycle-round21.mjs:135-138` serves `/landing` a **different document**
(`<!doctype html><title>Dummy landing</title><script type="application/ld+json">…`) with no
`window.observations` recorder, and `:189` captures `{...window.observations, url, secureContext,
formExists, formActive, value, focused}`. On the landing document the spread contributes nothing, so
a truthful landing observation has **no** `errors` key — the rule the oracle now enforces at
`measure-c1.mjs:129` is semantically correct, and the control's mutant (adding `errors: []`) is
precisely "the landing state carried an error-recorder key".

## Findings

### F1 — MEDIUM — `native-landing-wrong-query` produces an evidence set no browser can produce, and the navigation branch it should protect stays unexercised

*Where:* `.ufo/waves/round-22/selftest-c1.mjs:217-228` (mutation), `:224` (the replacement);
`.ufo/waves/round-22/fixtures/expected.json:295-305` (the row);
oracle branch not covered: `.ufo/waves/round-22/measure-c1.mjs:321` (`native-submit-landing`) and
`:324` (`landing-before-completion`).

*Counterexample (smallest):* after the mutation the raw `Page.frameNavigated` frame
(`corpus/evidence/round-21/runtime/na-native-submit.json`, the landing navigation) and
`receipt.json` `cases[3].after.navigations[0].frame.url` still read
`http://127.0.0.1:43143/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4`, while the observation,
its marker and `after.pageState` read `…?q=wrong-landing-nonce` (E1). The producer captures the
page-state url from `location.href` of the very document that was navigated to, so the two records
must agree in any real run. The mutant is therefore "the page state disagrees with the navigation",
not "the landing query was wrong" — and because no oracle rule cross-checks
`post.value.url` against the navigated url, the contradiction is invisible to the metric.

*Consequence:* the control pins only the page-state url branch (`post:url`). The oracle's own
landing-navigation check (`measure-c1.mjs:321`) has **no committed control**: no row in
`fixtures/expected.json` mutates `after.navigations` or the navigation frame (verified by grep over
the 44 rows), so that branch could be deleted from the oracle and the selftest would stay 44/44.

*Preserving positive:* the unmodified positive still gives 12 rows / clean / exit 0 (E4); the
committed controls keep their exact single-finding behaviour (E2).

*Evidence that the branch is reachable and the companion control is cheap:* an ad-hoc coherent
mutant in the throwaway clone (landing navigation frame **and** `after.navigations[0].frame.url`
**and** observation **and** `after.pageState` all rewritten to `?q=wrong-landing-nonce`) yields
exit 1 / value 0 with findings
`[semantic_navigation na-native-submit:post:url, semantic_navigation na-native-submit:native-submit-landing]`
— i.e. a fully coherent "wrong landing query" is caught twice over.

*Smallest fix:* add one more mutation kind next to `selftest-c1.mjs:217-228`, e.g.
`native-landing-nav-wrong-query`, that rewrites the landing navigation frame's `params.frame.url`,
mirrors it into `record.after.navigations[i].frame.url`, and mirrors the same value into the
observation/marker/`after.pageState` (so the mutant stays physically possible); add the matching row
to `fixtures/expected.json` with `"finding": "semantic_navigation"`. Keep the existing
page-state-only control as the isolation probe for the `post:url` branch. (If instead the intent is
one physical defect, extend the existing kind to the coherent form and drop the page-state-only one.)

### F2 — MEDIUM — the harness asserts finding *ids* only, so "exact finding detail" is not enforced for either new control

*Where:* `.ufo/waves/round-22/selftest-c1.mjs:382`
(`const findingMatches = expected.finding === null ? ids.length === 0 : ids.includes(expected.finding);`);
`fixtures/expected.json` rows `:284-294` and `:295-305` carry an id and no detail.

*Counterexample (smallest, executed):* rename the oracle's detail at `measure-c1.mjs:141` from
`` `${id}:${stage}:url` `` to `` `${id}:${stage}:url-mismatch` `` ⇒ the selftest still reports
`verdict clean, 44/44` (probe C), while `native-landing-wrong-query` now reports
`detail: na-native-submit:post:url-mismatch`. The detail the control is supposed to pin can drift
freely, and the same holds for the `semantic_error / :page-errors` detail of the other control.

*Preserving positive:* the unmodified positive stays 44/44 clean and 12 rows (E4/E2).

*Smallest fix:* add an optional `"findingDetail"` to the two new rows and check it in
`checkOracle`, e.g.
`const findingMatches = expected.finding === null ? ids.length === 0
   : ids.includes(expected.finding) && (expected.findingDetail === undefined
   || output.findings.some((f) => f.id === expected.finding && f.detail === expected.findingDetail));`
and pin `"findingDetail": "na-native-submit:post:page-errors"` / `"na-native-submit:post:url"`.
(Stronger, wave-wide: assert the finding **set** equals `{expected.finding}` — this is the class the
repair itself fixed once for `native-submits-empty` (D3, `expected.json:274-283`, now correctly
`semantic_status`, verified: single finding `na-native-submit:post:submit-observation`), and the
same weakness is recorded in the W1 lane as G3 "selftest assertion is inclusion-only". It is still
open for the remaining rows: `status-na-*`, `duplicate-case`, `missing-case` and `legacy-status-swap`
all pass with extra findings — none of them is one of the two new controls, so this is not a defect
*of* this repair, only of the harness it relies on.)

### F3 — LOW — the control name describes an error-content scenario; the mutation is a key-presence scenario

*Where:* `selftest-c1.mjs:223` (`observation.value.errors = []`), row name
`fixtures/expected.json:285` `native-landing-errors`.

*Detail:* the landing document has no error recorder (`scripts/webmcp-lifecycle-round21.mjs:135-138`),
so the landing observation legitimately has no `errors` key; the oracle branch
(`measure-c1.mjs:129`) fires on **key presence**, not on error content
(`landing ? Object.hasOwn(actual,'errors') || !equal(expected.errors, [])`). The control therefore
pins "the landing state must not carry an `errors` key", i.e. "the landing state was not captured
from the recorder-free landing document" — not "the landing page reported an error". A reader of
`fixtures/expected.json` will read the name as the latter.

*Preserving positive:* renaming the control changes no byte of the mutant, so the observed
`semantic_error / na-native-submit:post:page-errors` and the 44/44 clean run are unaffected.

*Smallest fix:* rename the case and mutation kind to `native-landing-errors-key-present` (or
`native-landing-not-landing-document`), keeping the expected id `semantic_error`.

### F4 — LOW — the wrong-query replacement is a silent no-op when the landing url carries no `?q=`

*Where:* `selftest-c1.mjs:224`
(`observation.value.url = observation.value.url.replace(/\?q=[^&#]*/, '?q=wrong-landing-nonce')`).

*Counterexample (smallest, executed):*
`'http://127.0.0.1:43143/landing'.replace(/\?q=[^&#]*/,'?q=wrong-landing-nonce')` returns the input
unchanged (verified with node v24.21.0). With the current fixture the url does carry `?q=<nonce>`,
so the control works today (E1/E2); but if the pinned landing url ever lost its query, the mutation
would apply nothing and the row would still pass for a different reason (the url would mismatch the
expectation anyway), silently degrading the control into a "missing query" probe.

*Preserving positive:* the guard must not fire on the current fixture; the current url does contain
`?q=`, so an equality guard keeps the row green (44/44, E4).

*Smallest fix:* capture the url before the replacement and throw when it did not change, e.g.
`const before = observation.value.url; … ; if (observation.value.url === before) throw new Error('fixture_landing_query_missing');`
(the same shape as the existing `fixture_post_marker_missing` guard at `:222`).

### F5 — LOW (provenance, adjacent to this commit) — the 35/35 receipt for this repair is not in the revision

*Where:* `.ufo/waves/round-22/checks-at-e3cf4e0.json`.

*Detail (read-only lane inspection):* the file exists in the lane working tree
(`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-22/checks-at-e3cf4e0.json`, 490 406 B,
mtime 13:39) and its content is `verdict clean`, 35 runs / 35 pass, including `oracle22-selftest`
exit 0 and `c1-after` value 12 clean. But it is **not** part of the reviewed revision:
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin cat-file -e e3cf4e0…:.ufo/waves/round-22/checks-at-e3cf4e0.json`
⇒ `fatal: path '…' exists on disk, but not in 'e3cf4e0…'`, and `git ls-files --error-unmatch` reports
it as not tracked. The commit itself lands only `checks-pre-w2-0f24164.json`. The landed revision
therefore carries no serial-cohort receipt for the repair it introduces.

*Preserving positive:* the two controls themselves are reproducible without that receipt — the
selftest (44/44) and `c1-after` (12/clean) are re-runnable from the committed tree (E4/E2).

*Smallest fix:* commit `.ufo/waves/round-22/checks-at-e3cf4e0.json` (or re-run
`run-checks.py e3cf4e0… .ufo/waves/round-22/checks-at-e3cf4e0.json` after the commit and land the
result) so the wave's evidence for the repair is inside the revision it certifies. (Flagged as
observation, not a defect of the two controls; the wave coordinator owns the commit scope.)

## Residual risk and verification gaps

* The oracle's landing-navigation branch (`measure-c1.mjs:321`) and landing-order branch (`:324`)
  remain uncovered by any committed control (F1); a regression in either would not change the
  selftest outcome.
* The `ids.includes` weakness (F2) applies to the whole expected table, not only the two new rows;
  the two new rows are currently singletons, so they are not currently masked.
* The controls are self-referential in the usual way of this lane: they pin the oracle's own
  expectations file, whose sha256 is hard-pinned in `measure-c1.mjs:22`
  (`4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e`) — unchanged by this commit
  (the repair changed the oracle, not the pinned expectations).
* `native-landing-errors` pins a *key-presence* rule, not an error-content rule (F3): a future
  oracle that accepted a non-empty `errors` array on the landing page would still be caught by this
  control, but one that accepted `errors: []` on the landing page would not be distinguishable from
  the current rule by any committed control.

## Checks executed (all inside the throwaway clone `/tmp/tabi-r22-w2b-RepairNewControls`, deleted afterwards)

Node: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` (v24.21.0).

| Command | Exit | Result |
|---|---|---|
| `node .ufo/waves/round-22/selftest-c1.mjs` | 0 | `verdict clean`, 44/44 passed |
| `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d…` | 0 | value 12, `clean`, 12 rows, no findings |
| probe A: `measure-c1.mjs:129` landing branch disabled → selftest | 1 | 43/44; only `native-landing-errors` red (exit 0, value 12, no findings) |
| probe B: `measure-c1.mjs:140` `url.search` comparison removed → selftest | 1 | 43/44; only `native-landing-wrong-query` red (exit 0, value 12, no findings) |
| probe C: `measure-c1.mjs:141` detail renamed → selftest | 0 | 44/44 clean → detail unenforced (F2) |
| probe: field-level JSON-path diff base vs each mutant (probe copy of `selftest-c1.mjs`) | 0 | see E1 |
| probe: ad-hoc coherent landing-navigation mutant (nav frame + `after.navigations` + observation + `pageState`) | 0 (row green) | findings `post:url` **and** `native-submit-landing`; exit 1, value 0 |
| `node -e` regex no-op check on a url without `?q=` | 0 | replacement is a no-op (F4) |
| lane read-only: `git log --oneline -3`, `git cat-file -e e3cf4e0:…checks-at-e3cf4e0.json`, `git ls-files --error-unmatch` | 0 | HEAD = e3cf4e0; receipt ABSENT_IN_REV, untracked (F5) |
| lane read-only: parse `.ufo/waves/round-22/checks-at-e3cf4e0.json` | 0 | 35/35 clean, `oracle22-selftest` exit 0, `c1-after` value 12 clean |

**Not run / honest gaps**

* The full 35-gate serial cohort (`run-checks.py`) was **not** re-executed by this seat: it resolves
  `FLEET` as the parent of the lane root and clones the fleet at the historical revision, which is
  not reproducible from a lone throwaway clone. I read the lane's existing `checks-at-e3cf4e0.json`
  receipt instead and re-ran the two gates that cover this item (`oracle22-selftest`, `c1-after`).
* No browser, no network, no new acquisition, no install, no credential use: the round-21 runtime
  evidence was read as retained bytes only.
* One probe run aborted with `No space left on device` because `/tmp` was 100 % full (other seats'
  temporary trees); the reruns used `TMPDIR=/home/vgpnk` and succeeded. No other seat's data was
  touched or deleted. Worth flagging to the coordinator: a full `/tmp` silently breaks any seat that
  runs the disposable-git selftest.
* Lane, fleet, sibling lanes, domain trees, lane Git index and jj state were read only; nothing was
  written outside this report and the throwaway clone (removed).

Report: .ufo/waves/round-22/w2b/RepairNewControls.md
