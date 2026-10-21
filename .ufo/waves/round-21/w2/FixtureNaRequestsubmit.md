# FixtureNaRequestsubmit — served fixture/provenance attack, `na-requestsubmit` only

Seat: TabiR21.FixtureNaRequestsubmit (scout, author-side lane dispatch; not independent admission).
Scope: current bounded acquisition (`.ufo/waves/round-21/runtime-execution-bounded.json`), not history.
Nothing executed: no browser, counter, selftest, gate, build or test. Read-only file/git reads and
read-only arithmetic only (sha256, a template regeneration in `node -e`, timestamp decoding).
Tools installed/updated: none.

## Verdict

The served bytes and the recorded transcript for this case hold up: the nonce echo, the absent
`toolautosubmit`, the action order, the handler path, the request log and the PID cleanup all
agree. There are two blocking provenance findings. The producer has never been committed, and the
counter's controls don't bind fixture semantics, response content or status for this case.

## Blocking findings

**B1 — HEAD has no producer blob, so the counting command cannot pass on HEAD.**

- Observed: `git ls-files --error-unmatch scripts/webmcp-lifecycle-round21.mjs` fails, and
  `git log --all -- scripts/webmcp-lifecycle-round21.mjs` is empty. `git status` shows the file as `??`.
- Observed: HEAD `1b5f449ad15525d281fda4558aeef1086f1e4a65` ("round-21: record finite non-autosubmit
  lifecycle evidence") does contain the runtime evidence, the note, `measure-c1.mjs`, the bounded
  execution record and `corpus/SOURCES.md` S101. S101 (line 115) cites the producer
  `scripts/webmcp-lifecycle-round21.mjs` with its SHA-256, but that blob isn't in the tree.
- Inference from code, not executed: `measure-c1.mjs:107-111` reads only committed blobs listed in
  `INPUT_PATHS`, which includes `PRODUCER`. Line 47 then adds `producer_digest` when `!get(PRODUCER)`,
  and line 100 returns `c1_lifecycle_observations = 0` whenever any finding exists. So
  `node .ufo/waves/round-21/measure-c1.mjs 1b5f449ad15525d281fda4558aeef1086f1e4a65` should report
  `failed`, `producer_digest`, value 0.
- The working-tree producer hash `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9`
  does equal `receipt.producer.sha256` and `runtime-execution-bounded.json:producerSha256`. That
  binding currently exists only in a mutable, untracked file.

**B2 — The counter accepts a semantically empty fixture and unchecked responses for this case.**

- Observed: the selftest's own positive base (`fixtures/positive-ordered.json:13`) serves
  `"<form>fixture-nonce-independent-02</form>"` as `na-requestsubmit.html`, and `expected.json`
  marks `positive` as exit 0, value 12. That fixture has no `toolname`, no handler, no
  `preventDefault` and no `respondWith`.
- `measure-c1.mjs:75-77` checks only three things about the fixture: the digest, that the nonce
  appears somewhere (`includes(c.nonce)`, so a `<title>` occurrence would satisfy it), and that the
  `<form>` tag has no `toolautosubmit`. It never compares the bytes against the producer template.
- `measure-c1.mjs` never reads the `WebMCP.toolResponded` `status` or `output`, nor `submits[]`
  fields such as `q`, `agentInvoked`, `isTrusted` or `active`. It doesn't check navigation absence
  for this case either. The note's claim that `na-requestsubmit` "Completed with the dummy response
  object; submit event isTrusted and agentInvoked true" is not counter-bound.
- Every mutant in `selftest-c1.mjs:17-95` edits `r.cases[0]` (`na-pending`) or global state. None
  targets `na-requestsubmit`.
- Missing mutants, each passing today if rehashed consistently (inference from the checks above;
  the L1 serial run can confirm):
  1. Rewrite the handler to drop `e.preventDefault()`, or put `respondWith` first, then rehash the
     fixture.
  2. Change `toolResponded.status` from `Completed` to `Error` in the frames and in
     `after.responses`, then rehash the evidence.
  3. Set `output.nonce`/`output.q` to a foreign UUID.
  4. Set `submits[0].agentInvoked` to `false`.
  5. Add a `Page.frameNavigated` to `/landing` inside the window, with a matching summary.
  6. Place the nonce only in `<title>`.

## Checks that passed, with anchors

**Nonce (dummy, per run).** `4d44ea5b-fdd0-4ea7-97b6-9a7a611a970a` (`randomUUID`, producer line 155).

- It appears twice in the served HTML: `observations.nonce` (line 5) and the response `value`
  literal (line 12). The `<input name="q">` has no `value` attribute.
- Echo chain, all with the same UUID:
  - `invokeTool` `input.q` (json seq 9)
  - `toolInvoked` `input` (seq 11)
  - pre-action field value (seq 12, before any action)
  - `submits[0].q` (seq 16)
  - `toolResponded.output` `{ok:true, nonce, q}` (seq 15)
- The `output.nonce` comes from the served literal and `output.q` from the agent-filled field, so
  the response is bound to these bytes and this invocation.
- 12 of 12 receipt nonces are unique. The history v1/v2/v3 nonces for this case differ
  (`e72134ba…`, `9ee6fe1e…`, `466af5ec…`), so the nonce is fresh per run.

**Served bytes vs. the producer template.** I extracted `fixture()` from the current producer and
called it with `("na-requestsubmit", nonce, false, "success")`. The output is byte-identical to the
retained file: sha256 `3570a3c1156a8c2af1956de81130c8b1fcf345423e860f1fe48618f953b78c0f`,
1086 bytes, all ASCII. HEAD and the working tree hold the same HTML and JSON
(`na-requestsubmit.json` = `ecb92d9a32efa9ae2f4528d0319ba9cd6d60655c7d3fc491302a646a496b704f`,
equal to `receipt.cases[na-requestsubmit].evidence.sha256`). The template text is identical in
history v1, v2, v3 and the current producer.

**`toolautosubmit` absent.** The form tag is
`<form id="f" toolname="lifecycle" tooldescription="Dummy loopback lifecycle"  action="/landing" method="get">`,
with a double space where the empty interpolation went. `toolautosubmit` appears nowhere in the
file. Runtime behaviour agrees with non-autosubmit:

- `preAction.responseCount` is 0 over a 254 ms window (`024313` to `024567`).
- `formActive` is true before the action and false after it.
- The submit event's `active` is true.

**Action mechanism and order.** The producer uses
`page.evaluate(() => document.querySelector('#f').requestSubmit())` (line 213). The transcript
sequence is:

| seq | event |
|---|---|
| 10 | invoke result, `DE3108EE3368EA4B38BE5A3FE48F7178` |
| 11 | `toolInvoked` |
| 12 | pre-action observation |
| 13 | action, `dispatch-started`, at `024567` |
| 14 | action complete, at `024568` |
| 15 | `toolResponded` Completed, at `024568` |
| 16 | after-action observation, at `025070` |

The after-action window is 503 ms, and the summary's cutoff is seq 16. The `frame('action')` marker
is pushed synchronously right after the evaluate promise is created (line 219), so no CDP event can
interleave before it.

**Handler ordering.** The served handler runs `submits.push` (line 8), then `e.preventDefault()`
(line 9), then `e.respondWith(Promise.resolve(value))` (line 15). This matches S100:790-794, where
taking the `respondWith` promise CHECKs `!should_submit`.

Runtime corroboration:

- `errors` is `[]`.
- `respondWith` is `"function"`.
- The status is Completed with the handler's object.
- `navigations` is `[]`.
- The URL stays `/na-requestsubmit`.
- The receipt's request log shows exactly one `GET /na-requestsubmit` at `1792588024300`. No
  `/landing` request appears before the next case (`/na-native-submit` at `1792588025264`).

`agentInvoked=true` matches S100:769-771: it is gated on `active_webmcp_tool_->CurrentlyRunning()`,
not on the submit origin.

**Profile isolation and PID cleanup.** Each case gets its own profile at `mkdtemp(tmpdir)/na-requestsubmit`,
with `HOME`/`TMPDIR` set to the temp root (lines 128, 159, 164). `rmSync(temp)` runs in `finally`.

- 9 PIDs were recorded at launch with start ticks. The close-time set is identical.
- `browserPidsSeenAfterClose` is `[]` and `browserPidsAfter` is `[]`.
- `contextClosed` is true, with no `closeError` and no `forcedCleanup`.
- `blocked` and `downloads` are both `[]`.

Playwright 1.64 pushes `--user-data-dir=${userDataDir}` verbatim (`coreBundle.js:44737/44935`), so
the root match in `processTree` can succeed. Its default `--disable-breakpad` means no crashpad
helper is spawned. The frame clock decodes to 13:07:04.297–13:07:05.070Z, inside the receipt's
13:07:02.041–13:07:14.098Z window.

## Limits that don't block, but must stay in the claim text

- **L1 — "Page script" `requestSubmit` is CDP-evaluated with a user gesture.** Playwright 1.64's
  `evaluateWithArguments` sends `Runtime.callFunctionOn {..., userGesture: true}`
  (`coreBundle.js:36957-36968`). So the action runs under CDP-granted transient user activation. The
  pre-action `observe()` call goes through the same path and also grants activation before the
  action. S100:720-815 shows no activation dependency (inference limited to this file; the WebMCP
  tool runner or `SubmitEvent::respondWith` outside S100 were not read). The note's
  "page script form.requestSubmit()" should not be read as activation-free script.
- **L2 — Served bytes are producer-asserted, not wire-observed.** The same JS string goes to
  `writeFileSync` and `res.end` (lines 156-158, 140-142). That is UTF-8 and ASCII-only, so the bytes
  are equal by construction. The request log records only `{at, method, url}`, though: no response
  hash, no `Network`/`Page.getResourceContent`, no DOM snapshot of the parsed form. Absence of
  `toolautosubmit` is proven on the file plus behaviour, not on the live DOM attribute (CDP
  `toolsAdded` carries no autosubmit field).
- **L3 — Handler ordering is source-read, not runtime-marked.** No `e.defaultPrevented` probe was
  taken before `respondWith`, and no `submitter` was recorded (it is null for argument-less
  `requestSubmit`, by source reading of S100:765).
- **L4 — Effective argv is not retained.** The receipt pins the requested `FLAGS` only. The
  effective argv also includes Playwright's `chromiumSwitches`: `--disable-features=` a list with no
  WebMCP entry (`coreBundle.js:36140-36205`), `--disable-field-trial-config`,
  `--allow-pre-commit-input`, the headless and pipe switches, and the profile flag. `/proc/<pid>/cmdline`
  was never captured into the evidence.
- **L5 — Cleanup ownership is finite.** It covers processes whose argv contains the exact
  `--user-data-dir` and their PPid descendants at the launch, close and post-close snapshots.
  `EACCES` reads are skipped silently (line 59). A helper spawned after the close snapshot and
  reparented away would be missed. The poll budget is 2 s twice. The profile path itself isn't
  retained, so freshness can't be re-verified after `rmSync`.
- **L6 — Window sizes are minimal.** The pre-action window is 254 ms against a counter floor of
  250, and the after window is 503 ms against 500. Fine for a finite claim; no pending-duration
  claim should be drawn from this case.

## Requested action for L1 (serial verification seat)

- Commit `scripts/webmcp-lifecycle-round21.mjs` at hash `5363d576…` before counting. Otherwise B1
  gives `producer_digest` and c1 = 0 on HEAD.
- Add the `na-requestsubmit`-targeted mutants listed in B2, or narrow the note so it doesn't imply
  the counter binds response status and content.
