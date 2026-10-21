# Semantic09 — adversarial semantic review of `na-delayed` against the proposed round-22 oracle

- Seat: `TabiR22.Semantic09` (reviewer, read-only). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- Subject: retained round-21 acquisition, case `na-delayed` — raw `corpus/evidence/round-21/runtime/na-delayed.json`, fixture `corpus/evidence/round-21/runtime/na-delayed.html`, receipt row `corpus/evidence/round-21/runtime/receipt.json:464-527`.
- Actions: file reads, `sha256sum`, path-existence checks, and one `git --version` probe. No repository operations, no edits, no tests/builds/linters, no browser or network, no installs.
- Proposed API status: **not materialized.** `.ufo/waves/round-22/measure-c1.mjs` and `corpus/evidence/round-22/semantic-expectations.json` are absent in the lane, and `.ufo/waves/round-22/clones/BuildOracle/.ufo/waves/round-22/` is absent. Everything below is reviewed against the specification: `.ufo/waves/round-22/w1-spec.json:3` and `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:21-27,45`.
- Author witness (`.ufo/waves/round-21/final/semantic-contrast-witness.json:469-545`) was read only after the outcome in §1 was derived from raw. It agrees on every value checked. It copies the same raw, so agreement shows consistency, not independence.

## 0. Findings by severity

1. **High, FP — hold violation invisible to summaries (R1).** Coherent mutation M-A (rotate raw seq 15–17 so the response precedes the held observation and the release marker) leaves the receipt row unchanged except its evidence digest. Any status, output, or summary-level predicate accepts it. Only raw seq-order predicates, and the active-state check on the delayed observation, reject it. No receipt-level or status/output predicate does.
2. **High, FP — output identity (R2).** Replacing `output.nonce` with another run's nonce passes any `ok` or status check. A relational-only nonce check also passes a full coherent rename.
3. **High, FP — error (R3).** Adding `errorText` to the Completed response passes any status-only check.
4. **Medium, FP/FN — navigation scope (R4).** A whole-run navigation check rejects the genuine run (initial load at seq 3; native case `/landing`). Checking only one of CDP `Page.frameNavigated` or the server request log misses the other.
5. **Medium, FN — timestamp ties (R5).** The genuine raw has three equal-millisecond groups and `preAction.end == after.start`. Any strict `at` comparison rejects it. Order must come from `seq`.
6. **Medium, FP — cumulative fields (R6).** `after.responses` and `after.submits` are not after-window fields. A predicate that reads them as after-window values mis-accounts pre-action responses.
7. **Medium, FP — non-discriminator (R10).** `formActive: false` at after-action also occurs for Canceled cases, so it cannot separate Completed from Canceled.
8. **Low, FN — input shape (R8).** `invokeTool.input` is an object; `toolInvoked.input` is a JSON string.
9. **Low, FN — whole-file digest pins (R9).** `corpus/SOURCES.md` and `SKILL.md` no longer match the round-21 serial pins, because of legitimate round-22 edits.
10. **Spec and note mismatches (§6).** The note cites a `--selftest` mode the API does not define. Ownership of `semantic_delayed` versus `semantic_timing` is undefined.

Expected verdict on the genuine raw: pass, as derived in §1, provided the implementation follows §2 and R1–R5.

## 1. Accepted outcome for `na-delayed` (derived from raw)

Identity and input
- `invocationId` `6E3D45F0282C001E2A5FCCAB4DF99082`: invoke result (raw `:147-154`), `toolInvoked` (`:156-166`), `toolResponded` (`:231`), receipt `:469` and `:484`.
- Case nonce `8aab9c3a-3485-4dfd-94de-4488f908909d`: raw `:4`. The `invokeTool` input is the object `{q: nonce}` (`:141-143`). The `toolInvoked` input is the string `"{\"q\":\"8aab…\"}"` (`:164`).
- Frame id `B8AF6A2A51332A343DB6159C30A00731` is identical on every frame event (`:139`, `:162`), and tool name is `lifecycle`.

Ordered frames (raw `na-delayed.json`; `at` in ms, `…` = `1792590714`/`1792590715` prefix)

| seq | at | frame | lines |
|---|---|---|---|
| 9 | …595 | sent `WebMCP.invokeTool`, input `{q}` | 133-144 |
| 10 | …595 | result, `invocationId` | 147-154 |
| 11 | …595 | event `WebMCP.toolInvoked` | 156-166 |
| 12 | …847 | observation `pre-action`: `submits []`, `errors []`, `formActive true` | 168-183 |
| 13 | …847 | action `requestSubmit`, `dispatch-started` | 185-190 |
| 14 | …848 | `action-complete` | 192-196 |
| 15 | …1100 | observation `delayed-before-release`: `submits[0]` = `{agentInvoked true, isTrusted true, q nonce, active true, respondWith "function"}`, `formActive true`, `errors []` | 198-221 |
| 16 | …1100 | `release` (logged before the page evaluate that calls `window.release()`) | 223-226 |
| 17 | …1100 | event `WebMCP.toolResponded`: `status "Completed"`, `output {ok:true, nonce, q}` | 228-241 |
| 18 | …1602 | observation `after-action`: `submits[0]` unchanged, `formActive false`, `value` = nonce, `focused go`, `errors []` | 243-267 |

Outcome tuple
- **status:** `Completed`. Exactly one `toolResponded` for the invocation in the recorded frames, and none with seq < 16.
- **output:** an object with exactly the keys `ok`, `nonce`, `q`. `ok === true`. `nonce === q === case nonce`. Not an array.
- **error:** none. No `errorText` key anywhere in the case, no `dir:"error"` frame, `invokeError: null` (receipt `:470`), `errors: []` in all three observations.
- **navigation:** none. The only raw `Page.frameNavigated` is seq 3 at `…585` (raw `:32`), before the action. Receipt `navigations: []` (`receipt.json:502`). Receipt request log has `/na-delayed` (`receipt.json:735`) and then `/na-invalid-submit` (`receipt.json:740`). The `/landing?q=8a5839ad…` entry (`receipt.json:710`) and its page state (`receipt.json:221`, `:239`) belong to the native case, not this one.
- **delayed:** yes. `preAction.responseCount` is 0 (receipt `:475`). The submit record is `active true` and `formActive true` at seq 15. The response is gated behind seq 16. The `action-complete` to observation gap is 252 ms, produced by the producer's `sleep(250)` (producer `:223`). That is a harness parameter, not a semantic threshold.
- **windows (harness clock):** pre `…595→…847` = 252 ms (receipt `:474`). After `…847→…1602` = 755 ms (receipt `:481`). Both recomputed from frames and equal.
- **page state:** after-action `formActive false`, `value` = nonce (not reset), URL `/na-delayed` (no navigation).
- **cleanup:** `browserPidsBefore` has 9 entries. Raw `browserPidsAfter []` (`:345`), `contextClosed true` (`:346`), `blocked []` (`:347`), `downloads []` (`:348`). No `closeError` or `forcedCleanup` key.

Cross-checks recomputed from raw (all pass)
- Receipt windows, responses, submits, navigations, and `pageState` equal the raw frames 10–18. The three `pageObservations` copies equal frames 12, 15, and 18.
- Witness na-delayed entry: `invocationId`, `evidenceSha256`, `preWindowMs 252`, `afterWindowMs 755`, `preResponseCount 0`, response seq 17, markers 12/13/14/15/16/18, `postSubmits`, `postUrl`, cleanup 9→[] all equal raw. Witness `forced: null` and `lateSeen: []` correspond to absence of `forcedCleanup` and an empty `browserPidsSeenAfterClose`. They have no literal raw counterpart.
- Frames 1–18 are contiguous. Command numbers 1–4 pair with their results.

Digests (`sha256sum`, this review)

| artifact | sha256 | matching pins |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-delayed.json` | `146adde4fffeea41ed4307e12c39c41a1ac2f0d88634e95b86f652134b2344f2` | receipt `:525`; witness `:473`; `.ufo/waves/round-21/runtime-execution-finalized.json:38` |
| `corpus/evidence/round-21/runtime/na-delayed.html` | `adde17227bbabf98d082ee7797f0ea646dff613ba057f331ea0c204070eae279` | raw `:10`; finalized `:39` |
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | finalized `:21`, `:47`; `serial-checks.json:636` |
| `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | receipt `:6`; finalized `:13`; `serial-checks.json:635` |
| `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4` | `serial-checks.json:637` |
| `corpus/SOURCES.md` | `476be5aca8344e7437ab61899de157d91741c433d406d40d82334c8ca4a233a1` | **differs** from `serial-checks.json:639` (`1572aa2d…`); see R9 |
| `SKILL.md` | `e39ff315e34a74e40427b16b19f59b95ba8aa46001295894135a46e4ce3c7c55` | **differs** from `serial-checks.json:638` (`54da3b2b…`); see R9 |

Receipt environment: Chromium `154.0.8037.97`, Node `v24.21.0`, Playwright `1.64.0` (receipt `:9-11`).

## 2. Proposed fixed expectation row for `na-delayed` (for `corpus/evidence/round-22/semantic-expectations.json`)

Pin identity literals (`invocationId`, nonce). Do not pin file digests in this row; digests belong to the retained manifest.

- `id` `na-delayed`; `action` `requestSubmit`; `mode` `delayed`; `autosubmit` `false`; `invocationId` `6E3D45F0282C001E2A5FCCAB4DF99082`; `nonce` `8aab9c3a-3485-4dfd-94de-4488f908909d`.
- Order by seq: invoke sent < invoke result < `toolInvoked` < observation `pre-action` < action < `action-complete` < observation `delayed-before-release` < `release` < `toolResponded` (Completed) < observation `after-action`.
- Responses for the invocation: exactly one. Zero with seq below the `release` seq.
- Observation `delayed-before-release`: `submits` length 1, `submits[0].active` true, `formActive` true.
- Response: `status` `Completed`. `output` is an object with keys exactly `{ok, nonce, q}`, `ok` true, `nonce` = `q` = the nonce literal. No `errorText`. No error frame.
- Navigation: none in the window from `after.start` to the after-action seq, checked in both `Page.frameNavigated` and the server request log.
- Observation `after-action`: `formActive` false, `submits` length 1, `errors []`, `value` = nonce.
- Cleanup: 9 browser pids before, 0 after, `contextClosed` true, `blocked []`, `downloads []`, no `closeError` or `forcedCleanup`.
- Source: note first line starts with `source: S101` (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:1`).
- No wall-clock literal (no 250, 252, or 755 threshold). Windows are observation-only.

## 3. Producer facts that constrain any oracle (`scripts/webmcp-lifecycle-round21.mjs`)

- `at` is harness receipt time. `frame()` stamps `Date.now()` when a frame is pushed (`:163`). Observations are pushed after `page.evaluate` returns (`:189-190`). CDP events are stamped when dispatched (`:180`). `at` is not browser time.
- Equal-millisecond groups: seq 9–11 at `…595`; seq 12–13 at `…847`; seq 15–17 at `…1100`. Receipt `preAction.end` (`:473`) = `after.start` (`:479`) = `…847`.
- Causal order is carried by `seq`. The `release` frame is pushed (`:223`) before `page.evaluate(() => window.release())` is issued. The fixture has one resolver, `window.release` (`na-delayed.html:14`), so a response can only follow release. [INFERENCE: sound for these exact fixture bytes, which the fixture sha pins.]
- `responses(through)` (`:209`) is seq-based and returns every `toolResponded` for the invocation with seq below `through`. `after.responses = responses(post.seq)` (`:226`) is therefore cumulative. It includes any response that arrived before the action.
- `after.navigations` (`:226`) filters `at >= actionAt && seq < post.seq`. Initial load (seq 3) is excluded only by that time bound.
- `after.submits` is the page-cumulative `window.observations.submits` (`na-delayed.html:7-8`). Each case uses a fresh profile (`profile = join(temp, id)` at `:160`, launched at `:165`), so there is no cross-case leakage.
- The `release` evaluate result is discarded (`:223`). No release acknowledgement frame exists.
- `preAction.windowMs` and `after.windowMs` include harness sleeps (`:207`, `:224`) and evaluate latency.
- `receipt.cleanup.browserClosed` is `cases.length === CASES.length` (`:241`). It is a count, not per-case browser evidence.

## 4. Risks and minimal coherent mutations

Conventions: FP = accepted but should be red. FN = genuine raw rejected. Coherent = raw, receipt, witness (if read), and digest links updated together, with nothing else changed. Name each finding separately in the test assertions. Do not rely on the aggregate verdict, because one defect can trip several findings.

**R1 — `semantic_delayed` and `semantic_timing` — FP (headline)**
- **M-A (minimal coherent):** in raw, reorder seq 15–17 so that `toolResponded` (Completed, same output) is seq 15, the `delayed-before-release` observation is seq 16 with `formActive: false` (and the matching `pageObservations` copy), and `release` is seq 17. Seq 14 and seq 18 are unchanged. Receipt: only `evidence.sha256` changes. Witness, if read: update `markers` and `responses[].seq`.
- **Must go red:** `semantic_delayed` (no active intermediate state; response before release) and `semantic_timing` (response precedes the release marker and the held observation).
- **Must stay green:** `semantic_status`, `semantic_output`, `semantic_error`, `semantic_navigation`.
- **Why it slips past summaries:** `preAction.responseCount` stays 0 because the pre-action observation is seq 12. `after.responses` still holds the response because it is seq below 18. Both windows are unchanged, and window arithmetic cannot tell seq 15 from seq 17, since both fall in the after-window. `after.submits` and `pageState` are unchanged.
- **Kill rule:** the delayed predicate compares the raw seq of `toolResponded` with the seq of the `release` marker and of the `delayed-before-release` observation. It never uses windows or receipt fields.
- **Probe (not coherent, isolation only):** same reorder but leave `formActive: true` at seq 16. This must still go red through the order predicate alone. If it goes green, the order predicate is missing.
- If the finalized manifest is read, M-A also needs its pin updated. A red `evidence_binding` in that case is incidental; assert `semantic_*` IDs separately.

**R2 — `semantic_output` — FP, and identity FN**
- **M-B:** in raw seq 17 (`na-delayed.json:237`) and receipt `after.responses[0].output.nonce` (`receipt.json:488`), set nonce to `6278395f-f2f9-4082-8c53-1279cad1f220` (the na-remove nonce). Keep `q` at the case nonce. Update digest links.
- **Must go red:** `semantic_output` (nonce differs from case nonce and from `q`). An `ok`-only or status-only predicate is FP.
- **Identity:** a relational check (`output.nonce == frame nonce`) passes a full coherent rename across raw, observations, receipt, HTML, and output. Pin the `invocationId` and the nonce literal in the fixed expectation to catch it.

**R3 — `semantic_error` — FP**
- **M-C:** add `"errorText": "respondWith promise was rejected"` to raw seq 17 params and to receipt `after.responses[0]` (`receipt.json:482-492`).
- **Must go red:** `semantic_error`. Status and output unchanged, so a status-only predicate is FP.
- **FN guard:** absence of `errorText` means no error. Do not require an explicit `error: null` key, since no genuine case has one.

**R4 — `semantic_navigation` — FP and FN**
- **M-D:** insert `Page.frameNavigated` with `params.frame.url` = `http://127.0.0.1:43143/landing?q=8aab9c3a-3485-4dfd-94de-4488f908909d` at `at` 1792590715150, between seq 16 and the after-action frame. Renumber after-action to 19. Add the URL to receipt `after.navigations`. For coherence, add a `/landing?q=…` GET to the receipt requests between `:735` and `:740`.
- **Must go red:** `semantic_navigation`. A check on only one of the two sources is FP for this mutation.
- **FN trap:** a whole-run check rejects the genuine run. Seq 3 (`:32`) is an initial navigation, and the receipt contains `/landing?q=8a5839ad…` for the native case (`:710`, `:221`, `:239`). Both sources must be windowed to `(after.start, after-action seq)`, as in producer `:226`.

**R5 — `semantic_timing` — FN (genuine raw red)**
- Strict `at` ordering fails the genuine raw: `at(15) = at(16) = at(17) = …1100`, and `pre.end == after.start == …847` fails any strict disjointness test. Use `seq` for order. Use `at` only as non-decreasing.
- Do not add a wall-clock threshold, such as a minimum hold of 300 ms or exact 252/755 literals. Those are invented semantics. The response is gated by release, not by time.
- `after.start == action frame at` holds here only by coincidence of the harness clock (847 = 847). Do not treat it as a guarantee. [INFERENCE]

**R6 — summary-trusting predicates — FP**
- If `semantic_delayed` or `semantic_timing` reads `preAction.responseCount` or `after.responses`, M-A passes. Every semantic predicate must recompute from raw frames. The receipt is compared against raw, not trusted.
- **Summary-only rewrite:** change receipt `preAction.responseCount` from 0 to 1 and leave raw unchanged. This must go red on the raw-summary finding. Semantic findings must still derive from raw, with no attribution to the receipt.

**R7 — predicate selection by `mode` — FP**
- If the delayed predicate is chosen by raw `mode` (`na-delayed.json:7`; `na-delayed.html:10`), a coherent mode flip (raw, HTML, and digest links) combined with a timeline reshaped to match the flipped mode is accepted under the Completed group. Select predicates by the fixed expectation for id `na-delayed`. Treat raw and HTML `mode` as identity fields to compare, not as selectors.

**R8 — `input_shape` — FN**
- `invokeTool.input` is an object (`:141-143`). `toolInvoked.input` is a JSON string (`:164`). A strict deep-equal between them rejects the genuine raw. Parse the string, then compare it to `{q: nonce}`. `frameId` and `toolName` match across `:139-140` and `:161-162`.

**R9 — `source_binding` and `evidence_binding` drift — FN**
- `corpus/SOURCES.md` (`476be5ac…`) and `SKILL.md` (`e39ff315…`) differ from the round-21 serial pins. The drift matches round-22 edits: `corpus/SOURCES.md:115` (S101 row) now lists `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, and `SKILL.md:2411-2412` cites that note. Whole-file pins would turn red on legitimate edits. Bind to the S101 row and to the note's first line.
- The note's first line begins `source: S101 —` (note `:1`). An exact whole-line match would be FN. Use a prefix match.

**R10 — `active` versus `formActive` — FN and FP**
- `submits[].active` is a submit-time snapshot. It is true at seq 15 and still true at seq 18 (`:209`, `:317-320`).
- `formActive` is live. It is true at seq 12 and 15, and false at seq 18.
- Using `formActive: false` as Completed evidence is FP. The na-reset after-action has `formActive false` with status Canceled (`corpus/evidence/round-21/runtime/na-reset.json:220`). The na-click after-action has `formActive false` with status Completed (`na-click.json:232`). Use `status` for the terminal class. Use `formActive` only to tell pending (true) from terminal (false).
- Requiring `submits[].active` to be false after completion is FN.

**R11 — finite exclusivity — FP if overclaimed**
- Only frames up to seq 18 and up to context close are recorded. "Exactly one response" holds over recorded frames only. Do not claim exclusivity beyond them. The note's limit on "finite no-response" (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:97-99`) already says this.

**R12 — release acknowledgement — FN**
- No release-result frame exists (producer `:223`). A rule that requires one rejects the genuine raw. Completed implies release ran, because the only resolver is `window.release`. [INFERENCE]

**R13 — mechanism claims not observed in raw — claim FP**
- The `preventDefault`-before-`respondWith` order is fixture text (`na-delayed.html:9` before `:13-14`). Raw does not record it.
- The action label `requestSubmit` is a harness label (`na-delayed.json:187-188`). The observed mechanism is the page-side submit record (`:205-210`, `:293-296`). Cite that record as mechanism evidence. Do not state a runtime call order beyond what the frames show.

## 5. Controls that must stay green on the genuine raw

- **K-1:** the genuine raw as-is. All semantic findings green, including with equal-millisecond ties and cumulative `after.responses`.
- **K-2:** shift every `at` by a uniform +1 ms, keep seq, recompute `windowMs` (stays 252 and 755). Green. A strict-`at` implementation turns this red, which is the R5 failure.

## 6. Spec and note mismatches (for owners)

- `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:3` cites `node .ufo/waves/round-22/measure-c1.mjs --selftest`. The API (`w1-spec.json:3`) defines only `FULL40HEXREV`. Either add `--selftest` to the API or remove it from the note.
- Ownership is undefined. The BuildOracle prompt (`w1-spec.json:10`) asks for "delayed-before-release active and response after release". Proposed split: `semantic_delayed` = seq order (no response before release; observation active; response after release). `semantic_timing` = window arithmetic and non-decreasing `at` only. Otherwise one defect masks in two findings.
- The note (`:24-25`) says a coherently changed raw plus corrected digests "must still fail". That holds only if the expectations do not pin the digests the mutation updates. Pin the identity literals (§2), not per-file digests.
- Baseline (neither the expectations nor the note present) exits 0 by design (`w1-spec.json:3`). Consumers must read `c1_semantically_checked_lifecycle_rows`, not the exit code alone.
- Witness as oracle input: the witness contains `forced` and `lateSeen` keys with no raw counterpart. If it is an input, define absence semantics explicitly.

## 7. Not verified, limits

- The proposed implementation was not evaluated. It does not exist yet in the lane or in the BuildOracle clone. Nothing above is a result of running it.
- The Git-blob revision binding (`FULL40HEX`) was not checked. No git repository operations were run; the only git invocation was the `git --version` probe.
- Chromium `respondWith` semantics were not checked against S100. Reopening upstream source is outside this seat's permission. The note's S100 citations (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:40`) were not re-verified.
- Whether a second terminal response could arrive after the recorded window is unobservable from these artifacts (R11).
- No tests or checks were run. No installs were made. No tool versions were changed.
