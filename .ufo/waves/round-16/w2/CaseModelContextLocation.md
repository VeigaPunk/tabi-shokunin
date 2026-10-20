# CaseModelContextLocation — receipt case `model-context-location`

Seat: TabiR16.CaseModelContextLocation (wave 2, FALSIFY, leaf). Date 2026-10-20.
Target snapshot: `b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3f` + counter repair).
Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Read-only on the lane: every mutation/replay
ran from `/tmp/w2-mcl-BttUka` with `--out /tmp/...`; the only lane write is this report.
No tool installed or updated (nothing needed).

## Attack item

Receipt case `model-context-location` in `corpus/evidence/round-16/webmcp/receipt.json`
(code `scripts/webmcp-loopback-round16.mjs:1082-1107`):
1. Is the expectation set from a named oracle BEFORE observation (QUALITY 17)?
2. Is the pass vacuous?
3. Does the fixture bind?

## Verdict

**BREAKS** — scope: the case's pass predicate does not establish its stated expectation. A live
mutation run in which `document.modelContext` is `null`, or a bare `{}`, still records
`status:"pass"` for this case, while `expected` says `"object (present)"`. The canonical receipt's
statement is nevertheless *true* on this build and reproduces byte-identically; the defect is
predicate under-binding, not a false observation.

Per-axis:

| Axis | Verdict |
|---|---|
| Assertion soundness (vacuity) | **BREAKS** — pass accepts `null` and any object (demonstrated end-to-end) |
| Expectation pre-observation (literal, not fitted) | **HOLDS** |
| Expectation from an *independent* named oracle | **UNPROVEN** — named source is the lane's own pre-probe (PLAN C2); the external oracle S020 §4.1 exists and agrees but is not cited by the case |
| Fixture binds the assertion | **NO** — fixture content is not read by the case; only the fixture *file digest* is bound |
| Reproduction at the snapshot | **HOLDS** — 11/11 pass, case record identical except `durationMs` |

## Evidence

### 1. Canonical replay (read-only)

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-model-context-location.json
WEBMCP_CASE id=model-context-location status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/w2-model-context-location.json
real 0m8.528s
```

Observed runtime: `Chrome/154.0.8037.97`, Playwright `1.64.0`, Node `24.21.0`,
`producerSha256 961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1`.
Programmatic comparison to the lane receipt case:

```
caseEqualExceptDuration true
fixtureSha256 537793b5d4ac11f7c61f5bc526f506abb4692876f3d50672085b0addb0a7748d (both)
actual {documentModelContextType:"object", documentOwnProperty:false,
        navigatorHasModelContext:false, navigatorModelContextType:"undefined",
        isSecureContext:true}                                    (both)
```

`git cat-file -p b444ca8:<harness>|sha256sum` = `961874e4…` and
`git cat-file -p b444ca8:.../fixtures/plain.html|sha256sum` = `537793b5…`, so the replay used the
producer and fixture bytes at the measured revision.

### 2. Mutation probe — the pass is under-bound (BREAKS)

Copied harness + fixtures to `/tmp/w2-mcl-BttUka`, added one line to the copied `plain.html` per
variant — `Object.defineProperty(document, 'modelContext', { value: <v>, configurable: true })` —
then ran the copied harness (unmodified; its `producerSha256` is the lane-pinned `961874e4…`):

```
node /tmp/w2-mcl-BttUka/harness.mjs --fixtures /tmp/w2-mcl-BttUka/fx-<v> \
     --out /tmp/w2-mcl-BttUka/receipt-<v>.json
```

| shadowed value | case status | `actual.documentModelContextType` | `documentOwnProperty` |
|---|---|---|---|
| `null` | **pass** | `object` | `true` |
| `{}` | **pass** | `object` | `true` |
| `undefined` | fail | `undefined` | `true` |

Null run, verbatim case record:

```
CASE {"status":"pass","expected":{"documentModelContext":"object (present)","navigatorModelContext":"absent"},
 "actual":{"documentModelContextType":"object","documentOwnProperty":true,
           "navigatorHasModelContext":false,"navigatorModelContextType":"undefined","isSecureContext":true},
 "detail":"document.modelContext=object (own=true); 'modelContext' in navigator=false; isSecureContext=true"}
```

Cause: the predicate (`:1094`) is only
`typeof document.modelContext === 'object' && !('modelContext' in navigator)`.
`typeof null === 'object'`, and nothing checks the object's identity, its prototype owner, or its
members; the case already records `documentOwnProperty`, `isSecureContext` and the type, but asserts
only the type.

Not fully vacuous: `undefined` fails, so the case does discriminate API absence (which the flag-off
control also covers). It is vacuous only against `null`/arbitrary-object substitution.

Suite-level mitigation (verified, not assumed): in both passing mutants the receipt verdict is
`fail` because `navigation-clears-tools` runs on `plain.html` and its `getToolsSnapshot`
(`:513-523`) returns `null` when `typeof document.modelContext.getTools !== 'function'`; its pass
requires `Array.isArray(after)`. That is an incidental catch by a different case, not an assertion
of this one. The C2 counter at `b444ca8` requires `receipt.verdict === 'pass'`, `caseSetOk`, every
case `pass`, and fixture digests at REV (`.ufo/waves/round-16/measure.mjs:41-47,226-252`), so a
mutant tree would not count; the exposure is the standalone case record, not a counted capability.
The imperative case (`imperative.html`) separately exercises `document.modelContext.registerTool`,
so the real object is also bound there.

### 3. The canonical observation is materially true (positive corroboration)

A copied harness (copied fixtures byte-identical, `plain.html` sha `537793b5…`) extended the probe
with identity fields; verdict 11/11 pass, `producerSha256 14c7053a…` (edited copy), same Chromium:

```
"modelContextTag": "[object ModelContext]",
"modelContextCtor": "ModelContext",
"registerToolType": "function",
"getToolsType": "function",
"protoOwner": "Document",
"documentOwnProperty": false
```

So on this build `document.modelContext` is the `ModelContext` IDL object on `Document.prototype`,
not a page shadow and not `null`/`{}`. The receipt's `pass` is correct here; the predicate would not
have detected the opposite.

### 4. Expectation provenance / pre-observation (HOLDS literal, UNPROVEN independent oracle)

- The expected value is a hardcoded literal in the case and is not computed from `actual`; the
  predicate consumes the literal. Structurally pre-observation.
- Retained first run `corpus/evidence/round-16/webmcp/receipt-first-run-failed.json`
  (`generatedAt 2026-10-20T14:46:36.879Z`, producer `cedccdf9…`, verdict `fail` 8/11) contains a
  `model-context-location` record **identical to the final one except `durationMs`** (checked by
  removing that field: `equalExceptDuration true`), with the same `expected` and
  `expectedProvenance`. The final receipt is `14:48:16.345Z`. The expectation was not fitted after
  the final observation inside the harness history.
- Named oracle as recorded: `harness-specified (PLAN C2: document.modelContext, not navigator)`.
  `PLAN.md:18-20` (identical at `b444ca8`; `git diff --stat b444ca8 -- .ufo/waves/round-16/PLAN.md`
  empty) states it as the L1 **pre-probe** — the lane's own prior observation. That is a named,
  pre-wave reference, but not an independent oracle.
- An independent named oracle exists and agrees: `corpus/SOURCES.md:34` (S020, tier A, mined,
  used-by the note) and
  `corpus/knowledge/webmcp-chromium-loopback-round-16.md:77`:
  `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; } (§4.1, rev cb3d1696)`.
  The case's `expectedProvenance` does not cite S020; the receipt's named source is the plan.
- QUALITY 17 (`corpus/QUALITY.md:48-53`) clause check for this case: complete case-input manifest
  (producer digest + `fixtures[]` `{file,sha256,bytes}` + per-case `fixtureFile`/`fixtureSha256` +
  runtime/flags) — present; real `expected`/`actual` retained — present; positive control
  (flagged cases) plus negative control (flags-off, same receipt, `caseSetOk`, 11/11, no
  duplicates/missing) — present; aggregation after restart (`summary.caseSet.ran/missing/
  duplicates`) — present. The "named oracle" requirement is the assignment's gloss; the recorded
  provenance satisfies it only in the self-referential PLAN sense.

### 5. Fixture binding (NO at assertion level, YES at digest level)

- `caseModelContextLocation` navigates to `plain.html` but never reads `window.__webmcpFixture`
  (the fixture declares `id:'plain', expectedTools: []`, unused here) nor any page marker/URL.
- The receipt's `fixtureFile`/`fixtureSha256` come from the case-def literal and the fixture
  inventory (`pushCase`, `:1354-1356`), not from an observed page URL; `actual` contains no URL.
- Mutating `plain.html`'s content (null/{}/undefined shadows) still produced a `model-context-location`
  record with `fixtureFile:"plain.html"` and its real digest, proving the record's fixture column is
  declared, not observed by the case.
- What *is* bound: the file identity (receipt digest = git blob at `b444ca8`) and the loopback
  origin (server serves only the fixtures dir on `127.0.0.1`; `gotoFixture` throws on failure). The
  expectation plus pass derive from the flagged browser context, not from the fixture.

### 6. Counter arithmetic (for context; not the attack target)

```
$ node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C2
{"revision":"e38d259…","c2_webmcp_held":0,"failures":["note, receipt or harness absent at revision"] ...}
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2
{"revision":"b444ca8…","c2_webmcp_held":1,"cited":["S020","S030","S031","S032","S033","S034","S035","S036"],
 "caseIds":[11 ids incl. model-context-location],"failures":[] ...}
```

## Findings by severity

1. **MEDIUM — assertion unsound (`scripts/webmcp-loopback-round16.mjs:1094`).** `typeof === 'object'`
   scores `null` and `{}` as `"object (present)"`; live mutants recorded `status:"pass"` for both.
   The case's own `actual` (own property true, no identity check) holds the evidence that would have
   falsified it. Fix: assert `documentOwnProperty === false`,
   `Object.prototype.toString.call(document.modelContext) === '[object ModelContext]'`, and
   `typeof document.modelContext.registerTool === 'function'` (all observed in §3).
2. **LOW — provenance names the lane's own pre-probe, not the external oracle.** PLAN C2 is the
   author's pre-wave probe; the agreeing external source (S020 §4.1, SOURCES row 34, note line 77)
   is not cited in `expectedProvenance`. The plan's committed form also postdates both receipts
   (commit `8f7feb3` 14:54Z vs receipts 14:46/14:48Z), so only the retained first-run record — not
   git — proves pre-observation. Fix: add the S020 §4.1 IDL/revision to the case provenance.
3. **LOW — fixture attribution is declared, not observed.** The case never checks it is on
   `plain.html`; `pushCase` stamps the fixture from the case-def literal and the case ignores the
   fixture's `__webmcpFixture` marker/URL. Fix: assert the fixture marker or record `page.url()`.
4. **INFO — incidental suite catch.** `navigation-clears-tools` fails on null/{} `plain.html` via
   `getToolsSnapshot`; this is what keeps a mutated tree's receipt verdict `fail`. It is a
   side-effect, not a designed control for this proposition.

## Residual risk and verification gaps

- The canonical pass is true but rests on a predicate that would also pass `null`/`{}`; a reader of
  the single case record gets weaker assurance than the `expected` wording claims. Claim-level C2
  counting is not exposed, because the counter requires the whole 11-case receipt and digest match.
- The first-run producer blob (`cedccdf9…`) is not committed; only its digest is retained. The
  identical first/final case record is the evidence that the expectation was unchanged, provided by
  the retained artifact, not by git.
- No observed page URL is stored per case, so the receipt cannot itself prove which document each
  case navigated to.
- Scope: one host, Chromium `154.0.8037.97`, loopback only; no claim about other builds.
- Out of scope and not attacked here: forge/`check-measurement-binding`/search-log seats, harness
  safety claims, S020 re-open rows.

This report is author-side (lane L1 member); the verdict is a recommendation, not an admission.
