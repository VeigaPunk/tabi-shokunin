# RowTrace04 — `na-native-submit` raw sequence vs `measure-c1.mjs` `rows[].sequence` vs the round22 note row

Scope: read-only static trace at revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`
(short `e3cf4e0d`). Nothing was executed from the lane: no `measure-c1.mjs`, no
`--selftest`, no `run-checks.py`, no browser, no REA, no service, no install, no VCS
write. All production reads use
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0d:PATH`.
This is one leaf item of the w2b falsification wave; it does not judge author
authenticity, general browser semantics, or sibling lanes.

## 1. Evidence identity (observed)

| Artifact | Path (`e3cf4e0d:`) | sha256 observed | Binding |
|---|---|---|---|
| Case raw | `corpus/evidence/round-21/runtime/na-native-submit.json` | `28a20412dc11d4d1ed690b4d80414a359193db491518b32277cff5a12eebc9b5` | `receipt.json:249` `evidence.sha256`; `rows[].rawDigest` in both checkpoints |
| Fixture | `corpus/evidence/round-21/runtime/na-native-submit.html` | `c95abb9cca63862ad93d580ba121d2aa398d97710b1c7d22692aba3cd2dad186` | raw `fixture.sha256`; `semantic-expectations.json:76` |
| Producer | `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | `measure-c1.mjs:23` `PRODUCER_SHA256` |
| Gate | `.ufo/waves/round-22/measure-c1.mjs` | `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` | `post-crash-repair.json` `filesAfter` |
| Expectations | `corpus/evidence/round-22/semantic-expectations.json` | `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` | `measure-c1.mjs:22` `EXPECTATIONS_SHA256` |

Digests were recomputed with `git show … | sha256sum` (exit 0 for all five). The raw
file's declared fixture digest equals the actual fixture bytes, so the retained
frame set and the fixture that produced it are mutually bound.

## 2. Raw frame sequence (observed)

Source: `e3cf4e0d:corpus/evidence/round-21/runtime/na-native-submit.json`, `frames`
array at lines 12-252. `at` is epoch ms from `Date.now()`; `seq` is 1-based contiguous.

| seq | at | dir | frame | raw anchor line(s) |
|---|---|---|---|---|
| 1 | 1792590709916 | sent | `Page.enable` cmd 1 | 14 |
| 2 | 1792590709916 | result | cmd 1 `{}` | 22 |
| 3 | 1792590709922 | event | `Page.frameNavigated` → `/na-native-submit`, frame `3F62…C727`, loader `FBB7…B280` | 29 (+ nav URL 45) |
| 4 | 1792590709929 | sent | `WebMCP.enable` cmd 2 | 55 |
| 5 | 1792590709930 | event | `WebMCP.toolsAdded` `{name:"lifecycle", frameId:"3F62…"}` | 63 |
| 6 | 1792590709930 | result | cmd 2 `{}` | 91 |
| 7 | 1792590709930 | sent | `Page.getFrameTree` cmd 3 | 98 |
| 8 | 1792590709930 | result | cmd 3, root frame `3F62…C727` | 106 |
| **9** | **1792590709930** | **sent** | **`WebMCP.invokeTool` cmd 4** `{frameId:"3F62…", toolName:"lifecycle", input:{q:"8a58…c4a4"}}` | 133 |
| **10** | **1792590709930** | **result** | **cmd 4** `{invocationId:"0950796B8BFFB4979B8CA2A0ABE34A66"}` | 147 |
| **11** | **1792590709931** | **event** | **`WebMCP.toolInvoked`** same invocationId | 156 |
| **12** | **1792590710183** | **observation** | **label `pre-action`** (value below) | 168 |
| **13** | **1792590710183** | **action** | **`{action:"submit", phase:"dispatch-started"}`** | 185 |
| **14** | **1792590710184** | **action-complete** | **`{action:"submit"}`** | 192 |
| **15** | **1792590710190** | **event** | **`Page.frameNavigated`** → `/landing?q=8a58…c4a4`, frame `3F62…C727`, loader `F10D…9230` | 198 |
| **16** | **1792590710196** | **event** | **`WebMCP.toolResponded`** `{invocationId:"0950…4A66", status:"Completed", output:[{"dummy":"landing"}]}` | 224 |
| **17** | **1792590710686** | **observation** | **label `after-action`** | 239 |

Release: no frame with `dir:"release"` (whole file; the producer emits one only for
`mode === 'delayed'`, `webmcp-lifecycle-round21.mjs:223`). `na-native-submit` is
`CASES[3] = ['na-native-submit', false, 'submit', 'success']` (producer line 18).

Pre-action value (raw lines 172-182):
`{"nonce":"8a58…c4a4","submits":[],"errors":[],"url":"http://127.0.0.1:43143/na-native-submit","secureContext":true,"formExists":true,"formActive":true,"value":"8a58…c4a4","focused":"go"}`.

Post-action value (raw lines 243-250): `{"url":"http://127.0.0.1:43143/landing?q=8a58…c4a4","secureContext":true,"formExists":false,"formActive":false,"value":null,"focused":""}` —
no `nonce`, no `submits`, no `errors`.

`pageObservations` (raw lines 253-283) repeats exactly the two observation frames:
`{label:"pre-action", at:1792590710183, seq:12, value:<above>}` and
`{label:"after-action", at:1792590710686, seq:17, value:<above>}`.

Receipt row (`corpus/evidence/round-21/runtime/receipt.json` lines 186-250):
`preAction {start:1792590709930, end:1792590710183, windowMs:253, responseCount:0,
formActive:true}` (193-199); `after {start:1792590710183, end:1792590710686,
windowMs:503, responses:[<the seq-16 params>], submits:null, navigations:[<the seq-15
params>], pageState:<the seq-17 value>}` (200-246). Window arithmetic is exact:
183−930 = 253 and 686−183 = 503.

Phase summary (the six requested anchors):

| anchor | seq | at |
|---|---|---|
| invocation command sent / result / `toolInvoked` | 9 / 10 / 11 | 1792590709930 / 1792590709930 / 1792590709931 |
| pre-action observation | 12 | 1792590710183 |
| action marker / action-complete | 13 / 14 | 1792590710183 / 1792590710184 |
| landing navigation | 15 | 1792590710190 |
| response (`Completed`) | 16 | 1792590710196 |
| release | — (none) | — |
| post-action observation | 17 | 1792590710686 |

Note the tied millisecond 1792590710183 for pre-action and action, and tied
1792590709930 for invocation sent/result. Ordering is attested by `seq`, not `at`;
`checkCase` enforces exactly that (`measure-c1.mjs:199-200`, `227`, `231`), and
Raw04 §3.9 already recorded that a strict `pre.at < action.at` must not be required.
The raw is internally coherent: `seq === index+1`, `at` nondecreasing
(`measure-c1.mjs:174-175`), all `at` inside the receipt envelope
`[1792590706773, 1792590718439]` (`receipt.json` `startedAt`/`finishedAt`).

## 3. What `checkCase` reads and prints as `rows[].sequence` (observed)

`measure-c1.mjs:359-366` prints:

```
invocation: invoked?.seq      // WebMCP.toolInvoked event
preAction:  pre?.seq          // observation label pre-action
action:     actionFrame?.seq  // dir action
response:   matchingResponses[0]?.seq   // dir event, method WebMCP.toolResponded, same invocationId
release:    first dir release // or null
postAction: post?.seq         // observation label after-action
```

`matchingResponses` is built at lines 254-255 from `responseFrames(frames)` (dir
`event`, method `WebMCP.toolResponded`). For this case the printed row is:

`{"invocation":11,"preAction":12,"action":13,"response":16,"release":null,"postAction":17}`

with `outcome:"Completed"`, `rawDigest:"28a20412…c9b5"`.

Corroboration, in increasing binding strength:

- Committed at `e3cf4e0d`: `.ufo/waves/round-22/selftest-repair-sandbox.json`, report
  `positive`, `observed.value:12`, `observed.verdict:"clean"`; the result JSON in its
  `stdout` field contains the row above with `semanticMatch:true`, `counted:true`
  (read via node, exit 0).
- Committed at `e3cf4e0d`: `.ufo/waves/round-22/checks-pre-w2-0f24164.json`, run
  `c1-after` (lines 770-780) contains the *same* `sequence` object and the same
  `rawDigest`, but `semanticMatch:false` and findings
  `semantic_error na-native-submit:post:page-errors`,
  `semantic_navigation na-native-submit:post:url` — i.e. the sequence reading is
  stable across the repair; only the checker verdict changed.
- Present in the worktree but **not committed at `e3cf4e0d`**:
  `.ufo/waves/round-22/checks-at-e3cf4e0.json` (run `c1-after`, `value:12`,
  `verdict:"clean"`, row `counted:true`, same sequence and digest). `git log --all --
  <path>` returns nothing and `git cat-file -e e3cf4e0:…` exits 128; `git status
  --porcelain` shows `??`. See §6/F6.

Observed convention: `sequence.invocation` is the `toolInvoked` **event** seq (11),
not the `invokeTool` command seq (9) or its result seq (10). The raw sequence itself
matches every printed field exactly; there is no `seq`/`at` disagreement between raw
and `rows[].sequence`.

## 4. Note row vs expectation vs raw (field by field)

Note row: `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:40`:

> `| na-native-submit | Completed, output array containing the landing JSON-LD object; /landing with case nonce; old-document submits unavailable/null | dummy respondWith object, array-to-object collapse, null-to-empty collapse or no navigation |`

Expectation: `corpus/evidence/round-22/semantic-expectations.json:71-81`.

| Note claim | Expectation | Raw | Agreement |
|---|---|---|---|
| `Completed` | `response.status:"Completed"` (78), `post.statuses:["Completed"]` (80) | seq 16 status `Completed` | exact |
| output array containing the landing JSON-LD object | `response.output:[{"dummy":"landing"}]` (78), exact-deep-equal enforced (`measure-c1.mjs:286-300`) | seq 16 `output:[{"dummy":"landing"}]` | exact (provenance caveat §5) |
| `/landing` with case nonce | `post.urlPath:"/landing"`, `post.urlSearch:"?q=$nonce"` (80), `navigation:"landing"` (81) | seq 15 and seq 17 URL `…:43143/landing?q=8a58…c4a4`; exactly one post-action navigation | exact |
| old-document submits unavailable/null | `post.submitCount:null` (80) → key-absent rule (`measure-c1.mjs:121-122`); receipt summary `submits:null` (215) | post value has no `submits`; receipt `after.submits:null` | value-level yes; wording issue F2 |
| reject dummy respondWith object | pinned array output rejects the fixture handler's `{ok,nonce,q}` | raw is not the handler object | consistent |
| reject array-to-object collapse | `native-output-object` mutant (`selftest-c1.mjs:198-205`, expected `semantic_output` `fixtures/expected.json:263-272`) | raw is an array | consistent |
| reject null-to-empty collapse | `native-submits-empty` mutant sets `submits:[]` (`selftest-c1.mjs:206-216`, expected `semantic_status` `fixtures/expected.json:274-283`) | raw key absent; receipt null | consistent (null variant untested, F2) |
| reject no navigation | rejected by `validLanding`/`actionNavigations.length === 1` (`measure-c1.mjs:309-325`); `native-landing-wrong-query` mutant | seq 15 exists and is the sole post-action navigation | consistent |

No value-level claim in the note row is contradicted by the expectation entry or by
the raw. The divergences below are representational/enforcement-boundary issues, not
counting failures at `e3cf4e0d`.

## 5. Findings

### F1 — The expectation's literal `post.errors: []` is the shape the oracle rejects (medium, spec integrity)

- Revision/where: `e3cf4e0d:corpus/evidence/round-22/semantic-expectations.json:80`
  declares `"errors": []` for `na-native-submit`'s **post** stage.
  `e3cf4e0d:.ufo/waves/round-22/measure-c1.mjs:115-117,129` computes
  `landing = stage === 'post' && id === 'na-native-submit'` and then fails the row on
  `Object.hasOwn(actual,'errors')` — i.e. *any* own `errors` key fails, including the
  literal `[]`. This is not incidental: the selftest applies exactly that mutation
  (`selftest-c1.mjs:223 observation.value.errors = []`) and the fixture expects
  `semantic_error` (`fixtures/expected.json:285-294`).
- Smallest counterexample: add `"errors":[]` to the post observation and to the
  receipt `after.pageState` of the raw (the `native-landing-errors` mutation). Every
  other field is unchanged and the receipt summary stays self-consistent; the row then
  fails `semantic_error na-native-submit:post:page-errors`, and because any finding
  blocks every row (`measure-c1.mjs:480-484`), `value` becomes 0 with exit 1 rather
  than 12.
- Preserving positive: the unmodified raw has no `errors` key and is counted
  (`sequence` in §3; `selftest-repair-sandbox.json` positive `value:12`).
- Why it matters: the fixed-expectations file is advertised as the independent
  statement of outcome shape (`…round-22.md:26-30`), but for this stage its literal
  value is the rejected mutant. `submitCount:null` encodes absence correctly; `errors`
  uses an empty array that, for every non-landing stage, is compared literally to the
  observed `actual.errors` (`measure-c1.mjs:129`), where `[]` means "recorder present
  and empty" — exactly what the raw's `pre` stage has and the landing stage lacks. The
  id-specific hardcode is the only thing
  separating the two meanings.
- Smallest fix: express absence explicitly for the landing stage — either
  `post.errors: null` with the checker branching on `expected.errors === null` (and
  deleting the `id === 'na-native-submit'` special case), or add a field such as
  `post.errorsAbsent: true` and keep `errors` as the compared list for other stages.
  Operationally the `EXPECTATIONS_SHA256` pin (`measure-c1.mjs:22`) means any such edit
  necessarily touches the gate, so the change is contained.
- Not claimed: this is not a wrong count at `e3cf4e0d`; the pinned expectation plus the
  hardcode yield the intended acceptance of the retained raw.

### F2 — Note's "unavailable/null" admits a page-state literal the oracle rejects (low, prose precision)

- Revision/where: note row `…round-22.md:40` says `old-document submits unavailable/null`.
  `measure-c1.mjs:121-122` rejects any own `submits` key on the landing stage, so a
  literal `"submits": null` fails; `null` is only correct as the **receipt summary**
  value (`receipt.json:215`), which line 279 derives via
  `Array.isArray(post.value?.submits) ? … : null`. A reader can take "unavailable/null"
  as "either absence or null is accepted", which is false for the page state.
- Smallest counterexample: set `"submits": null` in the post observation (update
  `after.pageState`; `after.submits` remains `null`, so the receipt-raw equality still
  passes). Result: `semantic_status na-native-submit:post:submit-observation`; as in
  F1, the global block rule (`measure-c1.mjs:480-484`) yields value 0 and exit 1.
  The selftest covers only `[]` (`selftest-c1.mjs:211-214`), not `null`, so nothing
  pins which reading the note intends.
- Preserving positive: unmodified raw omits the key and passes.
- Smallest fix: reword the note row to "the landing document carries no `submits`/
  `errors`/`nonce` recorder keys; the receipt summary records `submits:null`". This is
  prose-only; no code change is needed.

### F3 — Two enforced distinctions for this case are stated neither in the note row nor in the expectation (low, spec coverage)

- Revision/where:
  1. post `nonce` absence: `measure-c1.mjs:117-120` (`expectedNonce === undefined` for the
     landing stage; any own `nonce` → `semantic_status nonce-state`). The note row
     (line 40) and expectation (71-81) never mention `nonce` for the post stage; the
     expectation carries no field for it.
  2. navigation-before-completion: `measure-c1.mjs:322-325` adds
     `semantic_navigation landing-before-completion` when
     `navigation.seq >= response.seq`. Neither the note row nor the expectation states
     this ordering; `responseWindow:"action-to-post"` (line 77) does not imply it.
- Smallest counterexample (2): in a disposable copy, swap the seq and `at` of the
  response and the landing navigation (response seq 15 at 1792590710190, navigation
  seq 16 at 1792590710196), re-derive `after.responses`/`after.navigations` and keep
  `after.pageState`, windows and `pageObservations` unchanged. `at` stays
  nondecreasing and the receipt stays coherent; the Completed array output, the
  `/landing?q=<nonce>` URL and the post document state all still match every note
  phrase and every expectation field, yet the row fails only at line 324.
  Counterexample (1): add `"nonce": <case nonce>` to the post observation and
  `after.pageState`; every note phrase (including "submits unavailable") and every
  expectation field still holds; the row fails only at lines 119-120.
- Preserving positive: retained raw has no post `nonce` and navigates (15) before it
  completes (16), and is counted.
- Smallest fix: add one clause to the note row ("the landing document has no `nonce`
  key; the navigation is complete before the tool response is recorded") and/or encode
  both in the expectation (`post.nonceAbsent`, `navigationBeforeResponse`). Also add
  mutants for both; today no selftest mutant exercises `nonce-state` or
  `landing-before-completion` for this case (`selftest-c1.mjs` switch lines 161-325;
  `fixtures/expected.json` `kind` list).

### F4 — The note row is prose; only line 1 is machine-checked (informational)

- `measure-c1.mjs:395-400` compares only `note.split(/\r?\n/,1)[0]` to
  `SOURCE_HEADER` (line 24) plus `sourceNotePath`. The case table, including line 40,
  cannot fail the gate. Consequently F2/F3 cannot be detected by the oracle, and the
  note can drift from the checker without reddening.
- Related minor wording: the note says "output array containing the landing JSON-LD
  object"; the checker pins exactly one element (`measure-c1.mjs:286-300`;
  expectation line 78). Raw has exactly one element, so no mismatch today; "a
  one-element array" would be the literal statement.
- Smallest fix (only if the note is meant to be a checked contract): assert a hash or
  extracted row text; otherwise record explicitly in the note that the table is
  explanatory prose subordinate to the pinned expectations.

### F5 — `rows[].sequence.invocation` names the `toolInvoked` event, not the invocation command (informational)

- `measure-c1.mjs:360` prints `invoked?.seq`; for this case that is 11, while the
  `WebMCP.invokeTool` command is seq 9 and its result seq 10 (raw lines 133-166).
  Neither the note (line 31-33, 40) nor the expectation defines the field. A reader
  comparing the printed row to a CDP transcript can read a two-frame offset that does
  not exist.
- No counterexample in the raw: the printed value is the intended event seq; the
  ordering guard at lines 219-232 uses sent < result < invoked < pre and passes.
- Smallest fix: name it `toolInvoked` in the row, or document the field in the note.

## 6. Evidence-retention observation (not a code defect)

F6: `.ufo/waves/round-22/checks-at-e3cf4e0.json` — the only artifact I located that
records the repaired `c1-after value:12 verdict:clean` **at this revision** — is
untracked in the lane worktree. Observed: `git cat-file -e e3cf4e0:…/checks-at-e3cf4e0.json` → exit 128,
`git log --all -- <path>` → empty output, `git status --porcelain` → `??`. The
committed e3cf4e0 evidence for this metric is the *pre-repair failing* row
(`checks-pre-w2-0f24164.json` lines 770-780, value 0) and the committed sandbox
selftest positive (`selftest-repair-sandbox.json`, value 12, but not a run at
e3cf4e0). Consequence: the "35/35 at e3cf4e0" claim is not reproducible from committed
objects alone, and the repaired row at this revision is not revision-bound in Git.
This is a retention/binding gap, not evidence that the value is false; I did not
re-run the gate (out of scope). Smallest fix: commit the cohort receipt with the
revision (or bind it in a measurement receipt), or cite only committed artifacts when
claiming the repaired value.

## 7. Commands exercised (all read-only)

| Command class | Exit | Notes |
|---|---|---|
| `git -C … show e3cf4e0d:<path>` (raw, fixture, receipt, expectations, note, producer, `measure-c1.mjs`, `selftest-c1.mjs`, `fixtures/expected.json`, `run-checks.py`, sandbox receipt) | 0 | piped to `sha256sum`, `cat -n`, `sed`, or node JSON readers |
| `git show … | sha256sum` (5 identity digests) | 0 | values in §1 |
| node `-e` JSON extraction from the artifacts above | 0 | produced the tables in §2-§4 and the sandbox row in §3 |
| `git rev-parse e3cf4e0d`, `git rev-parse 0f24164` | 0 | full hashes confirmed |
| `git log --all -- <untracked receipt>`, `git cat-file -e e3cf4e0:…`, `git status --porcelain -- …` | 0 / 128 / 0 | 128 is the expected "absent from revision" result used as evidence in F6 |
| node `-e` probes with wrong field assumptions about `positive-ordered.json` structure | 1 (two transient calls) | my instrumentation error only; corrected by inspecting `files` keys; no lane file involved |
| report-only text corrections on this file (one `python3` bulk line-range replacement, then `edit`) | 0 | writes confined to `.ufo/waves/round-22/w2b/RowTrace04.md` |
| `measure-c1.mjs`, `selftest-c1.mjs`, `run-checks.py` | **not run** | static review boundary; no claim of an executed check |
| Browser / Playwright / REA / services / installs | **not used** | none |

No tools were installed or upgraded; nothing outside this report was written.

## 8. Limits and remaining unknowns

- `measure-c1.mjs` was not executed. Every statement about its behavior is a static
  reading of the blob at `e3cf4e0d` (`47176aed…`) plus committed receipts; the
  `rows[].sequence` values were cross-checked against two receipt artifacts, one
  committed and one untracked (F6).
- The landing document body is not retained per case. The note's "landing JSON-LD
  object" is grounded in the pinned producer (`webmcp-lifecycle-round21.mjs:135-137`,
  `<script type="application/ld+json">{"dummy":"landing"}</script>`) plus the receipt's
  `requests` entry `GET /landing?q=…` at 1792590710188 (`receipt.json`), not in a
  captured HTTP response body; the oracle asserts the literal output only. This is the
  same boundary Raw04 §5 recorded.
- `form.submit()` bypassing the submit event is an inference from producer line 215
  (`page.evaluate(() => document.querySelector('#f').submit())`) plus the observed
  effects (navigation, landing output, absence of the handler's `{ok,nonce,q}` value
  and of any submit record). It is not a universal browser claim and is not needed by
  the oracle.
- The action marker is emitted after the `page.evaluate` call that initiates the
  action (producer 215 before 220), so `phase:"dispatch-started"` is a harness label,
  not an attested pre-dispatch instant; all three action/observation timestamps tie
  within 1 ms and ordering here is by `seq` only.
- Author authenticity, the truthfulness of the historical acquisition, and general
  WebMCP/browser semantics are out of scope for this leaf.

Report: .ufo/waves/round-22/w2b/RowTrace04.md
