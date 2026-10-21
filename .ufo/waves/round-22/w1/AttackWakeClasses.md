# AttackWakeClasses — round-22 W1 — first terminal failures vs later broadcasts/activity/errors; absent history unavailable

Seat: TabiR22.AttackWakeClasses (reviewer, read-only). No tests, builds, or installs; no production edits; this report is the only file written.

## Scope and method

Attacked surface: the shared oracle design (`.ufo/waves/round-22/measure-c1.mjs` + `corpus/evidence/round-22/semantic-expectations.json`, BuildOracle-owned) and the shared debt design (`.ufo/waves/round-22/check-review-chronology.mjs` + `corpus/evidence/round-22/debt-expectations.json`, BuildDebt-owned; plus the ScribeDebt append-only correction draft). At review time neither executor clone contained round-22 artifacts yet (checked `.ufo/waves/round-22/clones/BuildOracle/.ufo/waves` and `clones/BuildDebt/.ufo/waves/round-22` — absent), so findings below attack the design as contracted, each grounded in exact retained bytes; L1 must re-run this list against the merged blobs before integration.

Inspected retained files (exact paths, all absolute under `/home/vgpnk/Projects/shokunin/tabi-shokunin/`):

- `corpus/evidence/round-21/runtime/receipt.json` (case summaries; lines cited per case below)
- `corpus/evidence/round-21/runtime/na-pending.json`, `na-delayed.json`, `na-native-submit.json` (raw trails)
- `.ufo/waves/round-21/measure-c1.mjs` (frozen structural counter, unchanged; lines 95–145, 146–162)
- `.ufo/waves/round-22/round21-closure.json` (`verification.seats`, `verification.wave_conformance_debt`, `notes`)
- `corpus/lessons/round-21.md` (Mistakes table; structural-fixture admission)
- `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (LC07/LC08/LC11/LC12 semantics)
- `.ufo/waves/round-22/w1/ScribeDebt.md` (debt correction draft, observations 1–20)
- `.ufo/waves/round-22/w1-spec.json` (contract: stable finding classes, exit policy)

The shared principle attacked: **the first terminal event of a lifecycle must fix its class; everything later (broadcast, activity, second error) is a distinct bounded class; and absent history is `unavailable`, never zero, never reconstructed.** The oracle applies this inside each case trail; the debt design applies it across W1/W2 seat histories. Both designs currently risk violating it in the ways below.

## Findings

Severity-ordered. Each finding: the defect, an exact coherent counterexample (the contract's test style: mutate raw + summary coherently and update digest links so red tests semantics, not stale hashes), the stable finding expectation (oracle side uses ONLY the contracted exported classes `semantic_status/semantic_output/semantic_error/semantic_timing/semantic_navigation/semantic_delayed/evidence_binding/case_set/source_binding/input_shape/revision_input`), and the bounded preserving positive.

### F1 — HIGH (oracle): whole-trail terminal population is unbounded; a late duplicate terminal after the post window is silently admitted

The frozen counter (`.ufo/waves/round-21/measure-c1.mjs:123-127,140`) filters `WebMCP.toolResponded` by `params.invocationId===c.invocationId` and only checks (a) `events.some(f=>f.seq<=invoked[0].seq)` and (b) `equal(c.after.responses, events.filter(f=>f.seq<post?.seq).map(f=>f.params))`. Any toolResponded with `seq > post.seq` is invisible; so is any toolResponded carrying a *different* invocationId (orphan). A new oracle that inherits this shape plus per-case status equality stays silent identically.

- **Exact counterexample (coherent).** In `corpus/evidence/round-21/runtime/na-click.json` append, after the `after-action` observation (seq 18), a frame `{"dir":"event","method":"WebMCP.toolResponded","params":{"invocationId":"5CE5ECE3023564847832ECEB5F305854","status":"Error","errorText":"late"}}`; update `receipt.json` `cases[id=na-click].evidence.sha256` to the new digest; leave `after.responses` unchanged (the late event lies outside the post window, so the summary remains truthful against its declared window). Frozen counter: exit0 clean12. Window-equality-only oracle: exit0 clean12. Both wrong: the case now has two finite terminals, and the second contradicts the first.
- **Stable finding expectation.** Per-case terminal population over the ENTIRE trail: exactly 0 for `na-pending`, exactly 1 for the other 11, and every toolResponded in a trail must carry that case's invocationId. Population or identity violation → `semantic_status` finding naming the case; that case is excluded from `value`; verdict `failed`, exit1 (value 11 here), never exit2, never value-with-findings presented as admitted.
- **Bounded preserving positive.** The real corpus must stay exit0/value12: autosubmit controls (`receipt.json:583,647` `preAction.responseCount:1`) have their single terminal before the pre-action marker, `na-delayed` after release — both stay clean under a population check.

### F2 — HIGH (oracle): the per-case status map must be fixed independent expectations; an all-silent synthetic corpus must not count

The frozen counter's verdict is `result(findings.length?0:cases.length)` (line 144) — structural conformance alone yields 12. The retained lesson states the structural positive fixture "is deliberately all-silent and is not a semantic oracle" (`corpus/lessons/round-21.md`). Status/output/error values exist nowhere in the frozen counter.

- **Exact counterexample (coherent).** A synthetic 12-case acquisition where every case emits invoke sent + result + `toolInvoked` but zero `toolResponded`; receipts carry `responses:[]`, `responseCount:0`, coherent page state; all evidence digests updated. Frozen-counter-shaped oracle: exit0 clean12 — eleven cases that never finished are counted as semantically checked lifecycle rows.
- **Stable finding expectation.** `corpus/evidence/round-22/semantic-expectations.json` pins, per case and independent of the evaluated receipt: `na-pending` = zero terminals within finite windows (254/503 in `receipt.json:30,37`), no submits/navigations, `formActive:true`; `na-click`,`na-requestsubmit`,`na-native-submit`,`na-delayed`,`auto-positive` = exactly one `Completed`; `na-reset`,`na-remove` = `Canceled` with exact errorText (`receipt.json:273-274` "Tool execution cancelled by a form reset"; `:317-318` "Tool execution cancelled, since tool definition was updated"); `na-reject`,`na-throw`,`na-invalid-submit`,`auto-invalid` = `Error` with exact errorText (`:361-362`, `:423-424`, `:549-550`, `:657-658`). Wrong/missing terminal → `semantic_status`; wrong output payload → `semantic_output` (e.g. `{ok:true,nonce}` at `:80-82` vs `[{dummy:landing}]` at `:208-210` are not interchangeable); all-silent synthetic → 11 × `semantic_status`, value 1 (only `na-pending` verified), verdict `failed`, exit1. Expectations must NOT be recomputed from the receipt under evaluation (contract).
- **Bounded preserving positive.** Real corpus exit0/value12; pending stays a finite-window observation, not an indefinite-pending claim (retained reject).

### F3 — MEDIUM (oracle): absent history after navigation must stay null, in both directions

`corpus/evidence/round-21/runtime/na-native-submit.json` — after navigation the `after-action` observation (seq 17, lines 271–282) is on the landing document (`url:…/landing?q=<nonce>`, `value:null`, `focused:""`, `formActive:false`); the old-document state is unavailable. The round-21 debt row fixes the direction: "Missing old-document submits was normalized to observed zero" was the vacuous mistake, corrected to "unavailable/null" (`corpus/lessons/round-21.md`, Mistakes: vacuous).

- **Exact counterexample A (over-strict).** An oracle expectation that pins `after.pageState.value === nonce` for all non-autosubmit cases fails the real `na-native-submit` (value is `null`) — baseline would be exit1 where the contract requires exit0 clean. The expectation must pin exactly `value:null` + landing URL + `output:[{dummy:landing}]` + exactly one `Page.frameNavigated` in the after-window (raw seq at lines 200–204).
- **Exact counterexample B (over-soft).** A producer mutation that fabricates old-document state on the landing observation (`value:"8a5839ad-…"`, `submits:[…]`) or coerces unavailable to `0`/`[]` passes any oracle that treats null as "accept anything". The oracle must pin the null as the *only* accepted representation.
- **Stable finding expectation.** Violations of the navigation/null contract → `semantic_navigation`. Absence is never coerced to zero and never required to be present.
- **Bounded preserving positive.** LC12 boundary preserved: the null-String sentinel is not protocol output; `[{dummy:landing}]` follows navigation, not `respondWith` (`corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, LC12 + retained rejects).

### F4 — MEDIUM (oracle): one malformed case must neither collapse the run to could-not-evaluate nor silently pass

- **Exact counterexample.** `corpus/evidence/round-21/runtime/na-click.json` with its `frames` array replaced by an object (or a truncated file) at the pinned revision: a design that aborts evaluation at first parse failure returns exit2 for all 12 — the first terminal failure hides the later 11 cases' semantics (exactly the debt anti-pattern); a design that skips it and prints value12+findings violates the admission rule that a count alongside findings is not admitted.
- **Stable finding expectation.** Bounded policy: unresolvable revision (non-full-40-hex, per the frozen precedent `revision_requires_full_hash`, line 148) or unreadable/missing counted input → exit2 `could-not-evaluate` (`revision_input`/`input_shape`); readable-but-malformed content → `input_shape` finding, that case excluded from `value`, exit1 with the remaining cases still evaluated. Missing expectations/note entirely → baseline0 exit0 (`case_set`); partially missing → failed0 exit1 (`case_set`), per contract.
- **Bounded preserving positive.** `evaluate(files)`/`INPUT_PATHS` shape and JSON `{schema,…,rows}` output unchanged; `evidence_binding` keeps digest+path pinning (`evidence.path` must remain the per-case raw path; digest-link updates in tests must not allow path-shape drift).

### F5 — LOW (oracle): ordering and timing bounds must be per-case from the acquisition, not global

- **Exact counterexamples.** (a) A global rule "terminal after action, before post" fails the real corpus: `auto-positive`/`auto-invalid` respond before the pre-action marker (`receipt.json:583,647`) and `na-delayed` responds after its release marker (`na-delayed.json` seq 15 `delayed-before-release` at lines 198–201, seq 16 `release` 223–226, seq 17 `toolResponded` 227–241). (b) A global window upper bound (e.g. ≤503 ms) fails `na-delayed`'s 755 ms after-window (`receipt.json:481`). (c) A rule "Error ⇒ no submit activity" fails `na-reject`/`na-throw`, whose `after.submits` are non-empty alongside the terminal (`receipt.json:365,427`) — pre-terminal activity coexisting with the first terminal is expected there, while `na-invalid-submit` pins `submits:[]` (`:553`).
- **Stable finding expectation.** Per-case position/window/ordering pinned in expectations: submit-before-release-then-response for `na-delayed` → violations `semantic_delayed`; other order/window violations `semantic_timing`. Non-terminal 429-style analog inside the trail (activity before terminal) never upgrades to a terminal finding.
- **Bounded preserving positive.** Real corpus exit0/value12; minima pre 252 ms / after 501 ms and all windows equal end–start remain enforced as retained.

### F6 — HIGH (debt): seat-level first-terminal counts vs event-level later wakes must never merge or double-count

Retained facts (`.ufo/waves/round-22/round21-closure.json`, `verification.seats` and `verification.wave_conformance_debt`): first-terminal failures W1=32 (12 Codex / 19 Zai / 1 Haiku), W2=6 (3 Codex / 2 Zai / 1 invalid_prompt); Main routing broadcast reached 55 W1 seats including 23 already failed; 24 failed seats show post-broadcast activity; 20 later failure notices; peer IRC reached five failed W1 seats; three initial-Zai seats later exhausted Codex capacity; W1 returns captured 13:15:40Z before four final exits (all exited by 13:19:45Z); W2 final exit 13:45:46Z precedes returns 13:49:02Z; initial pending spawn acknowledgements are not terminal completion; "Failure classes are first-terminal snapshots, not full final event history."

- **Exact counterexample A (event-keyed count).** A classifier counting failure EVENTS: 32 first-terminal + 20 later notices ⇒ "52 failures", contradicting the retained snapshot and rewriting it. A timestamp-max classifier places post-broadcast refailures after 12:43:47.993Z, implying those 23 seats were alive until then — a first-terminal chronology rewrite.
- **Exact counterexample B (exit-keyed identity).** `ScribeDebt.md` observation 5: BuildSelftest has session-exit at 12:43:18.126Z and a second at 12:58:12.794Z; an exit-record-keyed "finished seats" counter double-counts the seat or invents a second lifecycle.
- **Stable finding expectation (fixed values for `corpus/evidence/round-22/debt-expectations.json`).** Distinct-seat first-terminal: W1=32 (12/19/1), W2=6 — each seat counted once at its earliest qualifying terminal. Separate additive event classes, never summed into failures: routed-broadcast W1=55 with already-failed recipients=23; post-broadcast-activity seats=24; later failure notices=20; peer-IRC-to-failed=5; Zai→later-Codex-terminal seats=3; W2 first-error resource_exhausted class=6 (present in transcripts, absent from `w2-failures.json` per `ScribeDebt.md` obs 19). Chronology pairs recorded as facts, not contradictions: W1 returns 13:15:40.534838Z precede four final exits (last 13:19:45.708Z); W2 last exit 13:45:46.468Z precedes returns 13:49:02.529912Z; finalized acquisition `startedAt` 13:51:46.597742Z postdates W2 returns (obs 17). Spawn acknowledgements are never terminal evidence.
- **Bounded preserving positive.** Append-only correction preserves the closure/lesson first-terminal snapshots byte-wise; no quiescence certification (`allActorQuiescenceCertified:false` stays false), no authenticated-settlement claim, no revival credit beyond the two retained `peer-revival.json` records.

### F7 — MEDIUM (debt): the "terminal notice" predicate must be class-pinned per wave and ordering-guarded

`ScribeDebt.md` defines terminal notice as a `stopReason:"error"` turn whose `errorMessage` contains `Retry budget exhausted`, or the direct Haiku 429 — a substring/text-class predicate.

- **Exact counterexample A (echo).** A seat turn *quoting* "Retry budget exhausted" (or a steering message echoing it) with `stopReason:"error"` would be counted as another terminal. The predicate must key on the pinned provider error shapes per wave, and W2's distinct first-error class (`Devin stream error resource_exhausted…`, obs 19) must be a separate vocabulary entry, not folded into the W1 terminal class.
- **Exact counterexample B (ordering).** Obs 9: SrcForm07 and ReviewPriorHistory had non-terminal 429 turns before their Codex terminals. A first-error-keyed classifier misdates their first terminal to the 429. Pre-terminal errors are activity; only the pinned terminal class starts the first-terminal clock — the same rule the oracle applies to pre-terminal submits in `na-reject`.
- **Stable finding expectation.** Per-wave pinned error classes; "errors before a terminal notice are not terminal" enforced as an ordering invariant; later same-class notices after a first terminal are the separate later-notice class (F6), never a second first-terminal.
- **Bounded preserving positive.** The 12/19/1 and 3/2/1 class groupings stay attached to first-terminal notices only, matching `w1-failures.json`/`w2-failures.json` groups.

### F8 — MEDIUM (debt): transcript absence is not delivery absence; empty return is not absent output; unknown trigger stays unknown

- **Exact counterexample A.** `ScribeDebt.md` obs 1 wording: "Nine seats did not receive it" is asserted from absence of an `irc:incoming` record in retained transcripts. If any transcript is truncated (history unavailable), non-receipt is overclaimed. Required wording: no record is present in the retained transcript — record-absence, not delivery-absence.
- **Exact counterexample B.** Obs 12: `terminalNoOutputCount:30` counts empty `latestOutput` at readAt; 13 of those 30 have stop turns and report files predating readAt (capture gap), 17 have neither — and the 17 "were not checked for non-stop assistant text". A classifier emitting "17 produced nothing" fabricates absence; the only stable states are `capture-gap:13`, `no-stop-turn-no-report:17`, `residual-text-status:unknown`.
- **Exact counterexample C.** Obs 5: re-entry triggers for BuildSelftest/BuildCounter were "not identified". A debt classifier must admit `trigger:unknown` as a valid bounded value; inferring "peer revival" would overstate the two retained `peer-revival.json` records into a general mechanism.
- **Stable finding expectation.** Every per-seat classification carries a coverage status (`available-partial` / `unavailable`); unknowns are enumerated (obs 6 list) and never back-filled. Absent history maps to `unavailable`, mirroring the oracle's null (F3).
- **Bounded preserving positive.** The correction's Unknown section is preserved verbatim as the boundary of what is established; no completeness or quiescence claim.

### F9 — LOW (shared): classifier independence and no cross-imports

`debt-expectations.json` values must be fixed independently, not recomputed from the classifier's own output (mirror of the oracle's "expectations not recomputed from the evaluated receipt"). Neither new artifact may import the frozen counter (`.ufo/waves/round-21/measure-c1.mjs`) or each other as an outcome authority; the oracle's finding vocabulary is exactly the contracted stable set (F2), and the debt classifier's vocabulary is BuildDebt-owned — this report specifies required distinctions, not its names. Bounded preserving positive: both CLIs stay shell-free, Git-blob-bound, and exit-coded 0/1/2 as contracted.

## Residual risk and verification gaps

- BuildOracle/BuildDebt artifacts did not exist when this review ran; findings are design-level attacks on contracted behavior, each grounded in retained bytes. L1 must re-execute F1–F9 as red/green checks against the actual merged blobs before integration (F1/F2 coherent mutations, F3 A/B, F4 malformed-vs-missing split, F6/F7 fixed-value assertions, F8 wording/coverage states).
- Transcript-level debt numbers (55/23/24/20/5/3, timestamps, obs 1–20) are cited from `.ufo/waves/round-22/round21-closure.json` and the ScribeDebt draft's own transcript pass; I did not independently walk the 128 JSONL transcripts, and the ScribeDebt pass itself lists unread surfaces (peer-IRC bodies, BuildCounter's 12:56:27.868Z user turn, non-stop text of the 17 seats). Those remain unknown by design.
- No tests were run and no installs were performed (none needed), per lane bounds.

Report: .ufo/waves/round-22/w1/AttackWakeClasses.md
