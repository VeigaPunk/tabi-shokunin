# AttackCaseIdentity — round-22 W1

Scope: duplicate, missing, extra and reordered case IDs; reused nonce and invocation scope in the round-22 C1 oracle design.
Seat: `TabiR22.AttackCaseIdentity` (read-only). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

## 1. Verdict

The frozen round-21 counter (`.ufo/waves/round-21/measure-c1.mjs`) closes exact case-set membership, per-row nonce uniqueness, and row↔raw↔invoke identity for one invocation per row. It does not close the following, and each leaves a coherent mutant at value 12:

- cross-row invocation reuse (F1);
- the native landing nonce, which lives only in a URL that is exempted from the nonce check (F2);
- response cardinality, both duplicate and late, for the case invocation (F3);
- foreign invocations inside a trail (F7);
- response output nonce, never read (F4);
- orphan runtime evidence files (F5);
- duplicate observation labels (F8);
- case-variant invocation (F1b) and nonce (F9) forms;
- a substring-only fixture nonce (F10);
- the unbound request log (F11);
- navigations on non-submit rows (F12);
- duplicate JSON keys (F13).

F6 and F14 are design guards the new oracle must state explicitly; F15 is a decision (D1). The round-22 context (`.ufo/waves/round-22/w1-spec.json:3`) names `case_set`, `evidence_binding` and `input_shape` but does not state these rules.

| ID | Sev | Mutant (short) | Frozen r21 (static) | Required new result | Preserving positive |
|---|---|---|---|---|---|
| F1 | High | same invocationId in two rows | exit 0, value 12 | exit 1, value 0, ⊇ `evidence_binding` | retained 12 distinct ids |
| F1b | Med | lowercase variant of another invocationId | exit 0, value 12 | exit 1, value 0, ⊇ `input_shape`, `evidence_binding` | retained uppercase 32-hex |
| F2 | High | native landing `q` rewritten to another row's nonce | exit 0, value 12 | exit 1, value 0, ⊇ `semantic_navigation` | retained `q` = row nonce |
| F3 | High | second own-invocation toolResponded (in window or after marker) | exit 0, value 12 | exit 1, value 0, ⊇ `semantic_status` | retained counts 0 / 1 |
| F4 | High | response `output.nonce` = another row's nonce | exit 0, value 12 | exit 1, value 0, ⊇ `semantic_output` | echo outputs match own nonce; native constant array green |
| F5 | High | orphan `*-replay.json` in runtime dir, artifacts resealed | exit 0, value 12 | exit 1, value 0, ⊇ `case_set` | exactly 25 files |
| F6 | High (design) | duplicate row; value counts rows | retained selftest (historical): `case_set`, `nonce_reused`, value 0 | exit 1, value 0, ⊇ `case_set` | 12 distinct fixed ids, any order |
| F7 | High | foreign invocation's toolResponded inside a trail | exit 0, value 12 | exit 1, value 0, ⊇ `evidence_binding`, `semantic_status` | one invocation id per trail |
| F8 | Med | extra pageObservations record with an existing label | exit 0, value 12 | exit 1, value 0, ⊇ `evidence_binding` | one record per label |
| F9 | Med | uppercase nonce duplicate of another row | exit 0, value 12 | exit 1, value 0, ⊇ `input_shape`, `evidence_binding` | 12 canonical lowercase UUIDs |
| F10 | Med | fixture nonce only substring-present | exit 0, value 12 | exit 1, value 0, ⊇ `evidence_binding` | fixture literals equal row nonce |
| F11 | Med | request-log entry added or removed | exit 0, value 12 | exit 1, value 0, ⊇ `evidence_binding` (if requests consumed, D3) | 13 retained entries bind |
| F12 | Med | navigation to landing on a click row | exit 0, value 12 | exit 1, value 0, ⊇ `semantic_navigation` | navigations: native 1, others 0 |
| F13 | Med | duplicate JSON key `"id"` in one row | exit 0, value 12 | exit 1, value 0, ⊇ `input_shape` | 12 row-level id keys |
| F14 | Med (design) | expectations duplicate/missing id; receipt-derived set | not present in r21 | exit 1, value 0, ⊇ `case_set` | fixed 12 ids, any order |
| F15 | Low | reordered receipt rows, bindings intact | exit 0, value 12 | exit 0, value 12, findings [] (D1) | the same permutation |

Exit semantics as in the contract: 0 clean/baseline, 1 failed, 2 could-not-evaluate. Every failing row must give value 0.

## 2. Method, sources, limits

- Nothing was executed: no oracle, selftest, node, git-based measure, browser, network, service or install. No test was run.
- Frozen-counter results are derived by reading `.ufo/waves/round-21/measure-c1.mjs` line by line (sha256 `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb`). The only executed evidence cited is historical: `corpus/evidence/round-21/selftest-c1.json`.
- Retained-data facts come from read-only field queries over `corpus/evidence/round-21/runtime/*`.
- Design sources: `.ufo/waves/round-22/w1-spec.json:3` (context), `:10` (BuildOracle prompt), `:230` (this prompt).
- Not present at read time: `.ufo/waves/round-22/measure-c1.mjs`, `corpus/evidence/round-22/semantic-expectations.json`, `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, and `.ufo/waves/round-22/clones/BuildOracle/.ufo/waves/round-22/measure-c1.mjs`. Every "Required" entry is a requirement on the design, to be re-verified once BuildOracle commits.
- Cross-seat context, not re-derived: CriticOracle §F1 (expectation anchoring), §F2 (neutral twins), §F3 (silent positive and inherited acceptances), §F5 (all-or-nothing value); ConnPlanner §2 (population identity).
- "Coherent" mutant means every digest link is updated: `receipt.cases[i].evidence.sha256`, `receiptSha256`, the `artifacts` map in `.ufo/waves/round-21/runtime-execution-finalized.json`, and the fixture sha where a fixture is touched. The frozen selftest does this in `sealAcquisition` (`.ufo/waves/round-21/selftest-c1.mjs:187-193`).

## 3. Retained facts (verified read-only)

- R1. Receipt `corpus/evidence/round-21/runtime/receipt.json`: 12 rows in CASES order (`scripts/webmcp-lifecycle-round21.mjs:14-27`). `id`, `nonce` and `invocationId` are pairwise distinct across all 12 rows. Nonces are lowercase canonical UUIDs from `randomUUID` (producer `:156`). Invocation ids are 32 uppercase hex. `requests` (lines 686–752) has 13 entries: 12 `GET /<id>` plus one `GET /landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4` at index 4.
- R2. Each raw trail `corpus/evidence/round-21/runtime/<id>.json`: exactly one `WebMCP.toolInvoked` for its own invocationId. Exactly one `WebMCP.toolResponded` for it, except na-pending (zero). `seq` is contiguous. In all 12 files the last frame is the `after-action` observation, and its seq equals `pageObservations[after-action].seq`.
- R3. `pageObservations` labels: `[pre-action, after-action]` in 11 files; na-delayed is `[pre-action, delayed-before-release, after-action]`. Each label occurs exactly once.
- R4. Response payloads. na-click, na-requestsubmit, na-delayed and auto-positive are Completed with `output = {ok:true, nonce, q}`, where nonce equals the row nonce (e.g. `receipt.json:82`). na-native-submit is Completed with the constant array `[{"dummy":"landing"}]`, which contains no nonce. Its only nonce carriers are the landing navigation `…/landing?q=8a5839ad-…` (`receipt.json:221`, raw `Page.frameNavigated` at seq 15, post observation `url`). Its after-action observation has keys `focused, formActive, formExists, secureContext, url, value`: no `nonce`, no `submits`. Its receipt `submits` is null.
- R5. Navigations inside each after-window: na-native-submit has 1 (landing); the other 11 rows have 0.
- R6. Request timing: each `GET /<id>` lies after the previous row's `after.end` and 12–13 ms before its own `preAction.start` (e.g. auto-invalid GET `1792590717633` in `(1792590717466, 1792590717645)`). The landing GET `1792590710188` lies inside na-native-submit's after window `[1792590710183, 1792590710686]`.
- R7. Fixtures `corpus/evidence/round-21/runtime/<id>.html` use one template (producer `:105-123`). The row nonce appears at two literals: `window.observations={nonce:"…"` (line 5) and `value={ok:true,nonce:"…"` (line 12); see `na-click.html`.
- R8. The runtime directory holds exactly 25 files: `receipt.json`, 12 `<id>.json`, 12 `<id>.html`. These match `artifacts` in `.ufo/waves/round-21/runtime-execution-finalized.json:20-46`.
- R9. The frozen selftest positive is built from `.ufo/waves/round-21/fixtures/positive-ordered.json`, which has synthetic timestamps (receipt case 0: `preAction.start` 1000, `end` 1250, `after.start` 1251). It is not retained bytes.
- R10. Producer evidence is saved in `finally` (`scripts/webmcp-lifecycle-round21.mjs:228-233`) before the row is pushed (`:227`). An aborted run can therefore leave an orphan `<id>.json` with no row.

## 4. Frozen counter identity map (static, `.ufo/waves/round-21/measure-c1.mjs`)

| Identity property | Frozen check | Gap |
|---|---|---|
| Case set equals fixed 12 (sorted multiset) | L65–66 | duplicate, missing, extra and drift caught; order ignored |
| Row id in fixed 12; note mentions id; nonce length ≥ 16 | L104 | ok |
| Nonce unique across rows | L101, L105 | exact-case string only; no format or normalisation |
| Row nonce = raw nonce | L112 | ok |
| Fixture contains row nonce | L114 `includes` | substring; not bound to the `observations.nonce` literal |
| Invoke input `q` = nonce (auto-invalid: `not-an-email`) | L120 | ok |
| Row invocationId = invoke result | L123 | ok, per row only |
| Invocation unique across rows | none | absent |
| Invocation format | none | absent |
| Exactly one toolInvoked for own id | L125–126 | ok |
| toolResponded cardinality | L124; L139 copies whatever events exist | absent |
| Foreign invocation ids in trail | L124–125 filter them out | silently ignored, never counted |
| pageObservations per label | L130–131 `find` (first match) | absent |
| Pre-echo and post-echo nonce | L137 | post exempt for `submit` |
| Response output content | none | never read |
| Navigation URL nonce | L139 equality with raw only | absent |
| `receipt.requests` | none | never read |
| Runtime files outside rows | L69–70 artifact-key equality | accepted when the execution record lists them |
| Strict JSON keys | L59 `JSON.parse` | last key wins, silently |
| Value on any finding | L143 `result(findings ? 0 : count)` | 0; keep this rule |

## 5. Counterexamples, stable expectations, preserving positives

Expectation notation: `exit · verdict · value · findings`. "⊇" means the listed ids must be present; extra findings are allowed unless stated.

### F1 — High — cross-row invocation reuse

- Mutant (coherent): in `corpus/evidence/round-21/runtime/na-requestsubmit.json`, replace `56322DDB67194D60972B07E2BCABB7B7` with na-click's `5CE5ECE3023564847832ECEB5F305854`. Change the invoke result `frames[].result.invocationId` (line 152), the toolInvoked and toolResponded `params.invocationId` (lines 163, 203). In `receipt.json`, change row na-requestsubmit `invocationId` (line 127) and `after.responses[0].invocationId` (line 142).
- Frozen: exit 0, value 12. The checks are per row (L123, L126, L139).
- Required: `1 · failed · 0 · ⊇ {evidence_binding}`. Rule: invocation ids are pairwise distinct across the 12 rows, and each trail's invocation set equals its row id.
- Positive: retained receipt, `0 · clean · 12 · []`.

### F1b — Medium — case-variant invocation reuse

- Mutant (coherent): na-reset's invocation becomes `5ce5ece3023564847832eceb5f305854`, the lowercase of na-click's.
- Frozen: clean.
- Required: `1 · failed · 0 · ⊇ {input_shape, evidence_binding}`. Format is `^[0-9A-F]{32}$`, as in `scripts/webmcp-invoke-round17.mjs:1008`. Uniqueness is compared after canonicalisation.
- Positive: retained uppercase ids, clean.

### F2 — High — native landing nonce unbound

- Mutant (coherent): in na-native-submit, change `q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4` to `q=d57a9461-7725-447a-94ee-5031820695a6` in: raw `Page.frameNavigated` `params.frame.url` (seq 15); the raw after-action marker `value.url`; `pageObservations[after-action].value.url`; receipt `after.navigations[1].frame.url` (line 221); receipt `after.pageState.url`. Leave `requests[4]` unchanged.
- Frozen: clean. L137 exempts `submit` from the post-nonce check. The URL is never compared to the row nonce, and L139 compares only to raw.
- Required: `1 · failed · 0 · ⊇ {semantic_navigation}`. The landing query must equal the row nonce. If requests are bound (F11), `evidence_binding` also fires.
- Positive: retained landing `q` equals the row nonce, clean. The constant landing array must stay green; do not demand a nonce in native output.

### F3 — High — duplicate or late terminal response for the case invocation

- Mutant A (in window): in na-click.json insert a `WebMCP.toolResponded` `{invocationId:"5CE5ECE3023564847832ECEB5F305854", status:"Error", errorText:"injected"}` between action-complete (seq 15) and the after-action marker (seq 16). Renumber seq; update the marker and `pageObservations` seq; set receipt `after.responses` to [original, injected].
- Mutant B (after marker): append one `WebMCP.toolResponded` with na-click's invocationId after the after-action marker. Receipt unchanged.
- Frozen: A clean (L124 counts nothing; L139 equals events with seq < post). B clean (the late frame is outside `seq < post.seq`).
- Required: `1 · failed · 0 · ⊇ {semantic_status}`. Count toolResponded frames for the case invocation across the whole trail: exactly 1 for the 11 terminal rows, exactly 0 for na-pending. The trail must end at the after-action marker, which holds for 12/12 retained files.
- Positive: retained counts (na-pending 0; others 1; auto-* have one response before the pre marker, with `preAction.responseCount` = 1), clean. The inherited acceptance `late-response-outside-window` (`.ufo/waves/round-21/selftest-c1.mjs:71-77`, expected exit 0 in `fixtures/expected.json`) must flip. Cross-ref CriticOracle §F3.

### F4 — High — response output nonce never read

- Mutant (coherent): in na-click.json, set the toolResponded `params.output.nonce` and `params.output.q` to `658f0668-98cc-4edb-89c2-a170fec93f00` (na-reset's nonce). Mirror into receipt `cases[na-click].after.responses[0].output` (around line 82).
- Frozen: clean. No output field is read.
- Required: `1 · failed · 0 · ⊇ {semantic_output}`.
- Positive: the four echo outputs (na-click, na-requestsubmit, na-delayed, auto-positive) equal their own row nonce, clean. The native constant array `[{"dummy":"landing"}]` stays clean.

### F5 — High — orphan runtime evidence

- Mutant: add `corpus/evidence/round-21/runtime/na-click-replay.json` (byte copy of na-click.json). Add its sha256 to `artifacts` in `.ufo/waves/round-21/runtime-execution-finalized.json`. Receipt unchanged.
- Frozen: clean. L69–70 accepts any listed file, and no row references the orphan.
- Required: `1 · failed · 0 · ⊇ {case_set}`. The runtime directory must equal exactly `receipt.json` plus `{id}.json` and `{id}.html` for the 12 fixed ids.
- Positive: the retained 25-file directory, clean. R10 makes this a live failure mode, not a hypothetical.

### F6 — High (design guard) — duplicate row passes if value counts rows

- Mutant A: replace receipt row 11 (auto-invalid) with a byte copy of row 0 (na-pending, whose evidence path is `na-pending.json`).
- Frozen: exit 1 with `case_set` and `nonce_reused`, value 0. This is the retained selftest result for `duplicate-case` (`.ufo/waves/round-21/selftest-c1.mjs:30`; `corpus/evidence/round-21/selftest-c1.json`).
- Mutant B (design): any oracle whose value counts passing rows, rather than distinct fixed ids that pass, returns 12 for A, because the duplicate row passes.
- Required: `1 · failed · 0 · ⊇ {case_set}`. Value is never a row count.
- Positive: 12 distinct fixed ids in any order, clean.

### F7 — High — foreign invocation inside a trail (flips an inherited acceptance)

- Mutant (coherent): in na-pending.json, insert between the pre-action and after-action markers a `WebMCP.toolResponded` `{invocationId:"5CE5ECE3023564847832ECEB5F305854", status:"Completed", output:{ok:true, nonce:"5956c381-7675-4fe7-a6b4-990d7cf866f9", q:"5956c381-7675-4fe7-a6b4-990d7cf866f9"}}`. Receipt na-pending `after.responses` stays `[]`.
- Frozen: clean. L124–125 filter by own id, and L139 compares only own-id events.
- Required: `1 · failed · 0 · ⊇ {evidence_binding, semantic_status}`. The trail's invocation set must equal {own id}. na-pending must have zero responses across the whole trail.
- Positive: each retained trail carries exactly one invocation id, clean.
- Inherited acceptance: `foreign-response-ignored` (`.ufo/waves/round-21/selftest-c1.mjs:78-85`, expected exit 0) must flip. Design rule: key by invocationId, never by nonce or output, and count across the whole trail. A design that keys by nonce fails the retained positive.

### F8 — Medium — duplicate observation label

- Mutant: in na-click.json append to `pageObservations` a record `{label:"after-action", at:<post at>, seq:16, value:{…post value…, url:"…/forged"}}`.
- Frozen: clean. L131 uses the first match, and marker equality uses frames only.
- Required: `1 · failed · 0 · ⊇ {evidence_binding}`. Per-label count in `pageObservations` must equal per-label count of observation markers, and each record must equal its marker.
- Positive: retained labels, each once, clean.

### F9 — Medium — case-variant nonce duplicate

- Mutant (coherent): auto-invalid's nonce becomes `D57A9461-7725-447A-94EE-5031820695A6` (uppercase of na-click). Change: receipt row (line 638), raw top-level nonce, auto-invalid.html (both literals), raw pre and after observation values and markers, receipt `after.pageState.nonce`.
- Frozen: clean. L101–105 is an exact-case set and L104 checks length only.
- Required: `1 · failed · 0 · ⊇ {input_shape, evidence_binding}`. The nonce must be a lowercase canonical UUID, with uniqueness checked after canonicalisation. Precedent: `scripts/webmcp-invoke-round19.mjs:295-298` lowercases the run nonce.
- Positive: 12 canonical lowercase UUIDs, clean.

### F10 — Medium — fixture nonce is substring-only

- Mutant: in na-click.html line 5, change `nonce:"d57a9461-…"` to `nonce:"00000000-0000-4000-8000-00000000c11c"`. Keep line 12 and add `<!-- d57a9461-7725-447a-94ee-5031820695a6 -->`. Fixture sha coherent. Raw observations still claim d57a….
- Frozen: clean. L114 uses `includes`, and nothing cross-checks fixture literals against observations.
- Required: `1 · failed · 0 · ⊇ {evidence_binding}`. Exactly one `observations` nonce literal must equal the row nonce, and the `value` literal must equal it too.
- Positive: retained fixtures (lines 5 and 12 equal the row nonce), clean.

### F11 — Medium — request log unbound

- Mutants: (A) append `{at:1792590708500, method:"GET", url:"/landing?q=d57a9461-7725-447a-94ee-5031820695a6"}` to `receipt.requests`. (B) delete `requests[4]` while the raw keeps the native navigation.
- Frozen: clean. `requests` is never read.
- Required (if requests are consumed, D3): `1 · failed · 0 · ⊇ {evidence_binding}`. Required multiset: 12 `GET /<id>` each inside (previous `after.end`, own `preAction.start`), plus one `GET /landing?q=<native row nonce>` inside the native after window.
- Positive: the 13 retained entries, clean.

### F12 — Medium — navigation on a non-submit row

- Mutant (coherent): in na-click.json add a `Page.frameNavigated` with `params.frame.url` = `…/landing?q=d57a9461-…` at `at=1792590708600`, between action-complete and the after marker. Mirror into receipt `na-click.after.navigations`.
- Frozen: clean. L139 compares the window filter with raw.
- Required: `1 · failed · 0 · ⊇ {semantic_navigation}`. Click, requestSubmit, reset, remove, reject, throw, delayed, invalid and auto rows must have zero navigations in window. Native must have exactly one.
- Positive: retained counts (native 1, others 0), clean.

### F13 — Medium — duplicate JSON key hides duplicate id

- Mutant: in `receipt.json` auto-invalid row (line 637), write `"id": "auto-positive",` immediately before `"id": "auto-invalid",`.
- Frozen: clean. L59 `JSON.parse` keeps the last key, and L65–66 then sees a valid set.
- Required: `1 · failed · 0 · ⊇ {input_shape}`. Object-key uniqueness is required for receipt, raw, fixture-independent expectations and note header.
- Positive: retained receipt has 12 row-level `"id"` keys (13 `"id":` matches in total; the extra one is a nested frame id at line 219), clean.

### F14 — Medium (design) — expectations set exactness and receipt-derived set

- Mutant A: `semantic-expectations.json` lists `auto-positive` twice and omits `auto-invalid`.
- Mutant B: the expected set is derived from receipt ids. A receipt with an extra `na-extra` row and consistent raw then passes.
- Required for both: `1 · failed · 0 · ⊇ {case_set}`. This must not be baseline, and must not be a partial count of 11.
- Positive: the fixed 12 ids in any order, clean.

### F15 — Low — reordered receipt rows (decision D1)

- Mutant (coherent): swap receipt rows 1 and 2 (na-click and na-requestsubmit), reseal `receiptSha256` and the artifact.
- Frozen: clean. L65–66 sorts, and L111 indexes config by IDS position, not by row position.
- Required (default): `0 · clean · 12 · []`. Rows are emitted in fixed-expectation order.
- Positive: the same permutation. Anti-pattern: positional pairing `expectations[i] ↔ cases[i]` fails this legal permutation.
- Not a reorder: a row whose id stays but whose evidence path points at another id's file. Frozen gives `evidence_missing` or `case_identity`. The new oracle must fail with `case_set` or `evidence_binding`.

## 6. Decisions for the parent

- D1 (reorder): default clean. Row order is non-evidentiary. No order finding is exported, and the frozen counter accepts reordering.
- D2 (foreign invocation): default fail (F7). This flips the inherited `foreign-response-ignored` positive.
- D3 (request log): default bind exactly as `evidence_binding` (F11). If not bound, the note must say requests are not evidence and F11 is out of scope. Silent ignoring is not allowed.
- D4 (value): 0 on any finding. 12 only if the 12 distinct fixed ids all pass with `findings == []`.
- D5 (native output): constant array. The nonce is bound through the URL and, if bound, the request log, never through the output body.
- D6 (exit codes): malformed identity inputs (duplicate keys, non-canonical nonce or invocation) give exit 1 with `input_shape`. Reserve exit 2 for CLI and git failures, as the frozen catch at `measure-c1.mjs:162` does.

## 7. Identity acceptance checklist for BuildOracle and BuildSelftest

1. `case_set`: exact fixed-12 multiset from the executed oracle. Duplicate, missing or extra → `case_set`, value 0.
2. Runtime inventory: exactly 25 files (receipt + 12 json + 12 html). Otherwise `case_set`.
3. Nonce: lowercase canonical UUID; unique after normalisation; literal equality across row, raw top-level, both fixture literals, invoke input (except auto-invalid), page echo, landing URL, and output when present.
4. Invocation: `^[0-9A-F]{32}$`; unique across rows; trail-wide invocation set equals {row id}; exactly 1 toolInvoked; toolResponded count across the whole trail is exactly 1 (0 for na-pending); no foreign ids.
5. Observations: one `pageObservations` record per label, each equal to its marker; the trail ends at the after-action marker.
6. Requests: exact multiset per D3, or explicit exclusion in the note.
7. Strict JSON: reject duplicate object keys → `input_shape`.
8. Expectation rows keyed by id; rows emitted in fixed order; no receipt-derived expectations; no nonce or invocation values inside expectations (they are per-run).
9. Selftest: each identity mutant has a neutral twin, meaning a coherent reserialisation with identity restored, which must yield no identity finding (cross-ref CriticOracle §F2).
10. Selftest positives are retained bytes resealed, not the synthetic `positive-ordered.json` (cross-ref CriticOracle §F3).

## 8. Residuals (not closable from retained bytes)

- Whole-acquisition replay: an older coherent trail substituted with recomputed digests is undetectable from retained files. The claim is internal consistency, not authenticity, and the note must keep that wording.
- "Current invocation" can only mean the invocation recorded in the evaluated receipt and consistent across its carriers.
- Lane glob shows no retained stale run directory, so no stale-run check was attempted.

## 9. Non-claims

- Nothing here was run. All counterexamples are static and must be verified once by L1 after integration.
- No installs or tool updates were performed.
