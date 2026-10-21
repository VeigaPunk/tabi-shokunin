# Semantic12 — adversarial semantic review of `auto-invalid` (round-22 W1)

Seat `TabiR22.Semantic12` · read-only reviewer · lane `/home/vgpnk/Projects/shokunin/tabi-shokunin` · HEAD `5f585773258b33d2d514b00cd0b0775333578db6` · observed 2026-10-21 15:02Z.

Abbreviations: **RAW** = `corpus/evidence/round-21/runtime/auto-invalid.json`; **HTML** = `corpus/evidence/round-21/runtime/auto-invalid.html`; **RECEIPT** = `corpus/evidence/round-21/runtime/receipt.json`; **finalized** = `.ufo/waves/round-21/runtime-execution-finalized.json`; **producer** = `scripts/webmcp-lifecycle-round21.mjs`; **frozen counter** = `.ufo/waves/round-21/measure-c1.mjs`; **note** = `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`; **round-21 note** = `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`. Line numbers are of the named file.

**Method and limits.** Read, grep, `jq`, `sha256sum`, read-only `git`, and one `node -e` epoch conversion. No build, test, lint, browser, network, REA, install or pacman. The derivation used RAW frames first. RECEIPT, the note and round-21 reviews were consulted only after the derivation, as cross-checks. External Chromium source S100 was not reopened (contract limits reopening to retained own-work S101), so the note's `S100:729-758` mechanism citation is unverified here. `measure-c1.mjs` and `corpus/evidence/round-22/semantic-expectations.json` do not exist yet (lane and BuildOracle clone checked). The proposed API was taken from `.ufo/waves/round-22/w1-spec.json` (Contract text, BuildOracle item) and the note. "Expect" lines are design predictions from reading the proposed text. "Frozen (static)" lines are readings of the frozen counter's predicates, not runs.

**Axes:** status · output · error · timing. Coupled: submit, navigation/document identity, annotation/fixture declaration, source and revision bindings.

## 0. Findings by severity

**High**
1. The frozen counter has no status, output, errorText, annotation, submit-value or stdout predicate. Grep shows no `status` predicate on responses and no `Error`/`Completed`/`errorText`/`output`/`annotations` checks. Its execution binding (L70) checks exit, argv, artifact digests and receipt digest only. All outcome semantics therefore live only in the new oracle. If it omits them, R1, R1b, R3, R5, R7, R18 and R19 stay green. R2 and R15B stay green unless correlation and a submit owner are explicit.
2. Exact fixed text does not bind to the invoked input. An oracle comparing errorText to a constant accepts a valid-address input carrying "is missing an '@'" (R6).
3. Output absence and key set are unstated in the note's auto-invalid row (note:48) (G2).
4. "No submit event", the defining negative of that row, has no owner in the stable findings list (G1).
5. Response position must come from RAW `seq`, not from `after.responses` (cumulative by construction) nor from RECEIPT summaries (R8, R10, R12).

**Medium**
6. Stale witnesses: round-21 w2 reviews cite superseded `history/runtime-v4` values (SW1). Pinning them is red on canonical bytes.
7. The stdout status mirror (finalized:17) is not checked by the frozen counter (R1b). The new API must include it.
8. Annotation (RAW:85) and fixture declaration (HTML:3) are not checked by any listed finding (R18, R19).

**Low / documentation**
9. Note:3 names `measure-c1.mjs --selftest`, but the spec assigns selftest to `selftest-c1.mjs` (w1-spec.json, BuildSelftest item L12–15). Note:69–79 contains run-together tokens (`reached55`, `including23`, `captured13:15:40Z`, `began13:51:46Z`). `w2/ReviewFrontier.md:77` calls `323ccd…` canonical; finalized:47 records `4bc796…`.

No defect was found in the retained auto-invalid bytes. RAW, HTML, the RECEIPT row and the producer are mutually consistent and equal their HEAD blobs.

## 1. Derived outcome (RAW first)

| seq | at (ms) | frame | RAW lines | content |
|---|---|---|---|---|
| 3 | 717635 | event `Page.frameNavigated` | 28–53 | frame `DAAC6FE7…`, url `/auto-invalid`; the only navigation in the case |
| 5 | 717644 | event `WebMCP.toolsAdded` | 62–92 | tool `lifecycle`; `annotations.autosubmit: true` (L85) |
| 9 | 717645 | sent `WebMCP.invokeTool` | 135–148 | frameId `DAAC6FE7…`; input object `{"q":"not-an-email"}` (L145) |
| 10 | 717645 | result | 149–157 | invocationId `1CB23F49E89D91801A20D1C7DA8CB811` (L155) |
| 11 | 717647 | event `WebMCP.toolInvoked` | 158–169 | same invocationId and frameId; input is the string `{"q":"not-an-email"}` (L167) |
| 12 | 717647 | event `WebMCP.toolResponded` | 170–180 | `status: "Error"` (L177); `errorText` (L178); keys exactly {errorText, invocationId, status} |
| 13 | 717898 | observation `pre-action` | 181–197 | nonce `ff88f4bf…` (L187); submits `[]` (L188); errors `[]` (L189); url `/auto-invalid`; formActive false (L193); value `not-an-email` (L194) |
| 14 | 717898 | action `none`, phase `no-action` | 198–204 | no browser interaction (L203) |
| 15 | 717898 | action-complete | 205–210 | |
| 16 | 718399 | observation `after-action` | 211–227 | same nonce (L217); submits `[]` (L218); errors `[]`; same url; value unchanged |

HTML:10 sets `mode="invalid"`, but the handler (HTML:11–15) has no invalid branch. If a submit ever reached it, HTML:15 would `respondWith` a success value. The Error is therefore produced by browser constraint validation before any submit event, not by page code [INFERENCE from message text plus HTML:3; S100 not reopened]. The expectation must not describe it as page-authored.

**Accepted outcome, `auto-invalid`.** It holds iff all of the following are true.
1. **Identity.** The case nonce `ff88f4bf-6699-4a65-b4b5-7daeb34982be` equals RAW:4, the observation nonces at RAW:187 and RAW:217, the pageObservations nonces at RAW:235 and RAW:251, and HTML:5. Autosubmit agrees three ways: config RAW:5 = browser annotation RAW:85 = HTML:2 `toolautosubmit`. Mode is `invalid`. Action is `none`.
2. **Invocation.** Exactly one sent invokeTool (seq 9). Its frameId equals the navigated frame (seq 3, 5, 9, 11). Tool name is `lifecycle`. Input q is `not-an-email`. The invocationId is equal on seq 10, 11 and 12.
3. **Input identity.** The seq 11 JSON string parses to the seq 9 object.
4. **Status.** Exactly one correlated `toolResponded`, with `status === "Error"`.
5. **Output.** Absent. The response key set is exactly {errorText, invocationId, status}. No page value or submit exists in the run that could produce output (item 9).
6. **Error.** `errorText` equals exactly `Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. ` (RAW:178; final period, period, space). The quoted value equals the invoked q. "Native email validity" is inferred from this text plus HTML:3 `type="email"`. RAW carries no ValidityState [INFERENCE].
7. **Order by seq, not by at.** invoke-result 10 < toolInvoked 11 < toolResponded 12 < pre-observation 13 < action 14 < action-complete 15 < after-observation 16. The response precedes the pre-observation, so `responseCount` at pre is 1 ("already present in the initial window").
8. **Windows.** Pre: 717645→717898 = 253 ms (floor 250). After: 717898→718399 = 501 ms (floor 500). invoke→response: 2 ms, harness-observed (G10).
9. **Page state and submit.** Pre and post are the same document (nonce and url). `submits` and `errors` are `[]` at both points. No input or click is dispatched in the run (action `none`), and HTML has no timers, so no submit is observed through seq 16.
10. **Navigation.** The only frameNavigated is seq 3, before the invocation. There is none after seq 9. RECEIPT requests end with `GET /auto-invalid` (RECEIPT:748–750). No request URL carries `ff88f4bf…`.
11. **Delayed.** Not applicable: no respondWith, no release, no delayed-before-release observation (HTML:14 branch unreached).
12. **Horizon.** The after window ends at 718399. `finishedAt` is 718439 (RECEIPT:685), 40 ms later. Post-action evidence in this acquisition is exactly the finite window.

Candidate expectation, for BuildOracle to check against and not to paste as bytes. Run-specific values (nonce, invocationId, frameId, digests) are bound by equality or digest, never pinned:

```json
{"id":"auto-invalid","autosubmit":true,"action":"none","mode":"invalid",
 "input":{"q":"not-an-email"},
 "response":{"count":1,"status":"Error","keys":["errorText","invocationId","status"],
   "errorText":"Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. "},
 "order":"invoke<result<toolInvoked<toolResponded<preObs<action<actionComplete<afterObs; response<preObs",
 "floors":{"preMs":250,"afterMs":500},
 "submits":0,"navigationsAfterInvoke":0,"delayed":false,
 "environment":{"chromium":"154.0.8037.97"}}
```

## 2. Bindings verified (read-only)

| artifact | sha256 (worktree = HEAD blob) | cited by |
|---|---|---|
| RAW `auto-invalid.json` | `28a37c0ed2563f1bd7f8649a8d7830701932c607b7fbafcb1a03576da7326aed` | RECEIPT:677; finalized:44 |
| HTML `auto-invalid.html` | `4df781840afdfed1e958e13bd05ad3e9d91ee81c3ab1805affc5014fc4051f6b` | RAW:10; finalized:45 |
| RECEIPT `receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | finalized:47 (`receiptSha256`) |
| producer `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | RECEIPT:6; finalized:13; frozen counter L31 |

- Field-level RECEIPT row check, `cases[11]` (L636–679), against RAW by `jq`: invocationId equal; `preAction` {start 717645, end 717898, windowMs 253, responseCount 1, formActive false}; `after.windowMs` 501; `after.responses` equals the RAW seq 12 params; `after.pageState` equals the RAW seq 16 value; `after.submits` `[]`; `after.navigations` `[]`. RAW `pageObservations` mirror the frame observations.
- finalized:17 mirror: `LIFECYCLE_OBSERVED auto-invalid pre=1 statuses=Error`.
- note:1 starts `source: S101 — …` (QUALITY rule 54 satisfied).
- HEAD `corpus/SOURCES.md` S101 row lists only the two round-21 notes. The worktree row (L115) also lists the round-22 note, uncommitted. `revision_input` must read committed blobs.

## 3. Superseded witnesses (SW1): do not seed expectations

`history/index.json` maps `runtime-execution-bounded.json` to `history/runtime-v4/`. That acquisition has RAW sha `c70c2aab…`, HTML sha `cf673005…`, RECEIPT sha `323ccd…`, invocationId `44FE24D2D432D931882EF83CBEC5221D`, nonce `b2c990a6-45dc-4bc1-bab8-70f4f1e33ea3`, and preAction windowMs 254.

Round-21 w2 documents that carry these values:
- `.ufo/waves/round-21/w2/FixtureAutoInvalid.md` (cf673005, b2c990a6, c70c2aab, 44FE24D2)
- `.ufo/waves/round-21/w2/SemanticAutoInvalid.md` (44FE24D2; timestamp 1792588033292)
- `.ufo/waves/round-21/w2/TraceAutoInvalid.md` (44FE24D2; timestamp 1792588033290)
- `.ufo/waves/round-21/w2/ReviewFrontier.md` L75 (254/501) and L77 (`323ccd…` labelled canonical)

Grep also matched `MutationVacuity.md`, `MutationProducer.md`, `MutationSummaries.md` and `MutationOrdering.md` in the same directory. I did not read them. Their line anchors coincide with RAW's, because the structure is identical, so line-based checks pass while the values differ. An expectation copied from these is red on canonical bytes (false negative).

## 4. Risk register

Conventions. **FP** = the oracle accepts an altered or different outcome. **FN** = the oracle rejects the retained or an equivalent outcome. Every mutation is coherent: a RAW edit requires refreshing RECEIPT:677 and finalized:44; a RECEIPT edit requires refreshing finalized:47; an HTML edit changes RAW:10, which in turn requires the RAW refresh and finalized:45. Edits are described and were not applied.

### Status
- **R1 · FP** Validation bypass accepted by a status-only check. Mutation: RAW:177 `Error`→`Completed`; delete RAW:178; add `"output":{"ok":true,"nonce":"ff88f4bf-…","q":"not-an-email"}` to seq 12; add submit `{"agentInvoked":true,"isTrusted":true,"q":"not-an-email","active":true,"respondWith":"function"}` to submits at RAW:188, RAW:218, pageObservations RAW:236 and RAW:252; mirror RECEIPT:657–658, RECEIPT:661 and RECEIPT:665; finalized:17 `statuses=Completed`. A Completed response needs a submit because the output comes from the handler, so this is the smallest coherent bypass. Expect (design): semantic_status, semantic_output, semantic_error and the no-submit predicate all red. Frozen (static): green, since there is no status, output or submit predicate and the L139 mirrors hold.
- **R1b · FP** Stdout status mirror left stale. Mutation: the R1 status, errorText and output edits only (no submit), receipt mirrored, digests refreshed, finalized:17 still `statuses=Error`. Expect (design): red, a raw/receipt/stdout disagreement; this requires parsing stdout. Frozen (static): green, because L70 checks exit, argv, artifact digests and receipt digest only.
- **R2 · FP** Foreign-invocation response counted. Mutation: RAW:176 invocationId → `00000000000000000000000000000000`; remove the RECEIPT response object (L654–660, so `after.responses` is `[]`); RECEIPT:647 responseCount 1→0. Expect (design): semantic_status red, since there is no correlated Error and the case is a no-response case. A comparator that accepts any response in the case → green (FP). Frozen (static): green. L124 filters by invocationId, leaving zero events, and L139 is consistent. This is the known no-response gap.

### Output
- **R3 · FP** Output check limited to the `output` key. Mutation: add `"result":{"ok":true,"nonce":"ff88f4bf-…","q":"not-an-email"}` to RAW seq 12 after RAW:177; mirror into RECEIPT:654–660. Expect (design): semantic_output red for any key beyond {invocationId, status, errorText}. Frozen (static): green, since L139 compares full params.
- **R4 · decision** `"output": null` on Error. Mutation: add it to RAW seq 12 and mirror it into the receipt. Expect: undefined by the proposed text. Choose the rule and state it (strict key set gives red; null-as-absent gives green), per G2.

### Error
- **R5 · FP** Prefix, contains or trim comparators. Mutations: (a) append `X` before the closing quote at RAW:178 and RECEIPT:658; (b) drop the trailing space at both (`.. ` → `..`). Expect (design): exact comparator red for both. Prefix or contains → green for (a). Trim or whitespace-normalize → green for (b). Frozen (static): green, as there is no errorText predicate.
- **R6 · FP** Fixed text not bound to input. Mutation: replace `not-an-email` with `x@example.com` at RAW:145 (seq 9 object) and RAW:167 (seq 11 string); leave RAW:178 and RECEIPT untouched. Expect (design): input_shape red (fixed q), and semantic_error red independently, since a valid address cannot yield "is missing an '@'". An exact-constant errorText expectation alone stays green. Frozen (static): red, but via L120 (raw_invoke), which is structural and not diagnostic.
- **R7 · FP** Sibling diagnostic substitution. Mutation: replace RAW:178 and RECEIPT:658 with the na-invalid-submit errorText from its raw seq 15, `Form validation failed: q: Please fill out this field.. ` (a valueMissing message). Expect (design): semantic_error red, since a valueMissing message cannot describe non-empty malformed input. A prefix-only comparator → green (FP). Frozen (static): green.

### Timing
- **R8 · FP** Response after the action still counted as initial. Mutation, a coherent reorder with renumbered seq: pre-observation becomes seq 12, action 13, action-complete 14; toolResponded (text unchanged) becomes seq 15 with `at` 1792590718000; after-observation stays seq 16 (`at` 718399). RECEIPT:647 responseCount 1→0; `after.responses` unchanged (cumulative). Expect (design): semantic_timing red ("already present in initial window" is false). Status, error and output stay green. A count-based comparator (`after.responses.length === 1`) → green (FP). Frozen (static): green. L118 remains monotone, L126 response is after invoke, L136 does not constrain response position, and L139 is consistent. This is structurally valid but semantically a different case.
- **R9 · FP** seq/at disagreement. Mutation: RAW:172 `at` of seq 12 → `1792590718000`; seq unchanged. Expect (design): red, since timestamps are non-monotone against seq. A seq-only comparator → green (FP). Frozen (static): red via L118 `order_mismatch`.
- **R10 · FP** Summary-trusting timing. Mutation: the R8 reorder applied to RAW only; RECEIPT:647 left at 1; RAW digest refreshed into RECEIPT:677 and finalized:44. Expect (design): semantic_timing red plus summary_mismatch. An oracle reading RECEIPT `preAction.responseCount` → green (FP). Frozen (static): red via L139 `summary_mismatch`.
- **R11 · FN, retained** Strict `at` ordering. Retained ties: invoke and result both 717645; toolInvoked and toolResponded both 717647; pre-observation, action and action-complete all 717898. A strict `<` comparator on `at` rejects the retained RAW. Expect: retained green. QUALITY rule 52 already requires transcript order.
- **R12 · FN, retained** Cumulative `after.responses`. The seq 12 response appears in `after.responses` by construction (producer:226 `responses(post.seq)`; frozen L139 enforces it). An oracle reading `after.responses` as "post-action responses" misclassifies the retained auto-invalid. Expect: retained green, with position derived from seq against the pre-observation only.
- **R13 · FN, retained** Window pinning. Retained pre is 253 ms and after is 501 ms; the frozen floors are 250 and 500 (L138). Pinning exact values (254 from runtime-v4, or exactly 250/500) rejects the retained case. Expect: floors and ordering only.

### Navigation, identity, submit
- **R14 · FP** Observation nonce dropped. Mutation: RAW:217 and RAW:251 nonce → `b2c990a6-45dc-4bc1-bab8-70f4f1e33ea3`; mirror RECEIPT:664; refresh digests. Expect (design): semantic_navigation red, since document identity is lost and `submits: []` is not attributable to the invoked document. Frozen (static): red via L137 (case_identity: page echo). Keep this check.
- **R15 · FP** Submit present in raw but not summary, or coherent submit with no owner. Variant A: add a submit object to RAW:218 and RAW:252 only; refresh the RAW digest. Expect (design): summary_mismatch (frozen L139 red) and the no-submit predicate red. A summary-trusting oracle → green (FP). Variant B: the same plus RECEIPT:661 and RECEIPT:665. Expect (design): the no-submit predicate red only. Frozen (static): green, so no structural catch. Requires the G1 owner.
- **R16 · FN, retained** "No frameNavigated in case". The seq 3 frameNavigated is the legitimate initial load. Scope the check to seq > 9. Expect: retained green.
- **R17 · FN/scope, retained** Run-level "no /landing". The run contains one `/landing?q=8a5839ad…` (RECEIPT:710), which belongs to the na-native-submit nonce. Scope by case nonce or case window (RECEIPT:748–750). Expect: auto-invalid green. A run-level check would fail a valid run.

### Annotation, fixture, source
- **R18 · FP** Annotation-only drift. Mutation: RAW:85 `"autosubmit": true` → `false` (seq 5 annotation only); refresh digest. Expect (design): red, since the annotation contradicts HTML:2 and config RAW:5. Oracles reading only RAW:5 or the HTML attribute → green (FP). Frozen (static): green. L112 and L116 check top-level config and fixture only; there is no annotation predicate.
- **R19 · FP** Fixture stops declaring the constraint. Mutation: remove `type="email"` at HTML:3; refresh RAW:10 and the RAW/RECEIPT/finalized digests per the rule above; RAW events unchanged. Expect (design): semantic_error red, since the native email diagnostic is unsupported by the declared constraint. This needs an explicit fixture-declaration check. Frozen (static): green. L114 checks sha and nonce; L116 checks toolautosubmit only.
- **R20 · FP, source** Header order. Mutation: in the note, make `source: S100` the first `source:` line with S101 later. Expect (design): source_binding red (QUALITY rule 54). The current note:1 starts with S101, so retained is green.
- **R21 · FN, documentation** Paraphrase transcription. Note:48 says "exact malformed-email native-validity diagnostic" but states no bytes. The round-21 note (`webmcp-nonautosubmit-round-21-corrected.md:43`) paraphrases it as "native email validation text". Expectations transcribed from either lose the trailing `.. ` or the wording (FN). Take the bytes from RAW:178.

## 5. Gaps to close before the API is final

- **G1 Submit owner.** The stable list has no finding for submit events. Map "no submit observed through seq 16 (≈501 ms after action)" explicitly. semantic_output is the natural owner, since the submit handler is the only output path, or semantic_status. Do not leave it implicit.
- **G2 Output rule.** For Error, write the key set exactly {invocationId, status, errorText}. Decide null (R4). The note's auto-invalid row should state "no output", which it currently does not.
- **G3 Exact bytes.** Copy errorText from RAW:178, including the trailing `.. `. Use an exact comparator, and bind the quoted value to the invoked q (R5–R7).
- **G4 Input identity.** Parse the seq 11 string and compare it to the seq 9 object. Pin q as `not-an-email`; frozen L120 already pins it for invalid mode.
- **G5 Timing by seq.** Response seq must be greater than the invoke-result seq and less than the pre-observation seq. Windows are floors (250/500), not exact values (R9, R11, R13).
- **G6 `after.responses`.** Never infer position from it; it is cumulative by design (producer:226; frozen L139). Do not rename historical receipts. Document the meaning in the expectation.
- **G7 Annotation.** Bind RAW:85 ↔ HTML:2 ↔ RAW:5. The frozen counter does not cover this, so name an owner (R18).
- **G8 Stdout mirror.** Include finalized:17 in INPUT_PATHS and parse its `statuses=` field (R1b). The frozen counter keeps EXECUTION in INPUT_PATHS (L32), but L70 does not read stdout.
- **G9 Document identity.** Keep nonce equality for pre and post observations (frozen L137). It is the only evidence tying `submits: []` to the invoked document (R14).
- **G10 Clock semantics.** `at` is `Date.now()` at harness receipt (producer:163). WebMCP events arrive on a separate CDP session (producer:179–180) from the `page.evaluate` observations (producer:189). Describe the order as "harness-recorded order", not browser emission order. The "2 ms" figure is harness-observed [INFERENCE]. The frozen navigation summary (L139) uses `at ≥ after.start` while responses use seq; do not copy that mixed cutoff.
- **G11 formActive.** Recorded only (RAW:193 false for auto-invalid; true in na-pending and na-invalid-submit pre observations). The note does not interpret it. Do not encode it as a discriminator without an interpretation (S100 not reopened).
- **G12 Run-specific IDs.** Do not pin nonce, invocationId, frameId or digests as expectations; bind by equality and digest. runtime-v4 shows they change per acquisition.
- **G13 Structural predicates.** Keep the frozen counter's checks, or equivalents: L104–105 (nonce uniqueness), L118 (seq = index+1 and monotone at), L120 (raw input), L124–129 (invocation identity), L136 (action order), L137 (page echo), L138 (window floors and equality), L139 (summary mirror). They are not outcome oracles, but dropping them reopens structural regressions (R9, R10, R14).

Adjacent documentation defects (not auto-invalid semantics):
- note:3 `measure-c1.mjs --selftest` versus BuildSelftest's `selftest-c1.mjs`.
- note:69–79 run-together tokens (`reached55`, `including23`, `captured13:15:40Z`, `began13:51:46Z`). Likely dropped spaces or markers; verify before publication.

## 6. Verification status and not done

- Absent at 15:02Z: `.ufo/waves/round-22/measure-c1.mjs`, `corpus/evidence/round-22/semantic-expectations.json`, and any round-22 measure or expectation file under `clones/BuildOracle`. Re-review when they land. The verdicts above are against the proposed text.
- No mutation was applied and no selftest, measure or browser run was performed. "Expect" and "Frozen (static)" are readings.
- S100 (external Chromium source) was not reopened. The note's `S100:729-758` citation is unverified here.
- The worktree is dirty: uncommitted LOG.md, SCORECARD.md, SKILL.md, corpus/QUALITY.md, corpus/README.md, corpus/SOURCES.md, the new note and `.ufo/waves/round-22/`. RAW, HTML, RECEIPT and producer are unchanged against HEAD.
- No installs, no pacman, no network.

## 7. Recommendation

- The auto-invalid outcome is supported by retained RAW. Accept it as an expectation only with G1–G9 and G12 encoded.
- Block Values12 until R1, R1b, R6, R8, R10, R14, R15, R18 and R19 are red under the new oracle, as semantic reds rather than stale-hash reds. The retained positives R11, R12, R13, R16 and R17 must stay green.
