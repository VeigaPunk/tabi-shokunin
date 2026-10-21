# FixtureNaReject — served fixture/provenance attack, `na-reject` only (round21 w2)

Seat: TabiR21.FixtureNaReject (scout, author-side, read-only). No browser, gate, counter, selftest,
build or test executed. Only read-only file reads, git object reads (`--no-optional-locks`),
digest/arithmetic in throwaway `node -e`, `/proc` reads. Tools installed/updated: none.

Current acquisition attacked: `.ufo/waves/round-21/runtime-execution-bounded.json`
(producer sha256 `5363d576…eceb9`, exit 0, stdout `LIFECYCLE_OBSERVED na-reject pre=0 statuses=Error`).
History (`history/runtime-v1..v3`) used only as a contrast, never as current evidence.

## Verdict summary

| Attack | Result | Confidence |
|---|---|---|
| A1 producer→retained fixture bytes | HOLDS: rebuild is byte-identical | high |
| A2 retained→served bytes | NOT BYTE-EVIDENCED; inferred from code + echoes | medium |
| A3 per-run dummy nonce, input + page echo | HOLDS at runtime; counter never checks page echo (missing mutant) | high |
| A4 toolautosubmit absent | HOLDS in bytes + runtime contrast; selftest toggle only on synthetic first case | high |
| A5 action mechanism/order | HOLDS; marker semantics are imprecise (see A5) | high |
| A6 handler preventDefault→respondWith ordering | from fixture text only; runtime consistent; reverse order untested | medium |
| A7 profile isolation / PID cleanup | HOLDS for recorded set; HOME/TMPDIR shared across cases; close not timestamped | medium |
| A8 producer revision binding | **FAILS at HEAD 1b5f449**: producer untracked | high |

## Findings

### A1 — producer fixture builder reproduces retained bytes exactly (holds)
- Producer `scripts/webmcp-lifecycle-round21.mjs:105-123` `fixture(id, nonce, autosubmit, mode)`;
  line 155 `randomUUID()`; lines 156-158 the *same* `html` string is written to `<id>.html` and put
  into `routes`; line 160 records `sha(html)`.
- Extracted `fixture` from the current producer and called it with
  `("na-reject","4141f1a1-4085-4056-9dae-6be03bdaaaa6",false,"reject")`: result `===` retained
  `corpus/evidence/round-21/runtime/na-reject.html`; sha256
  `5086d16f9f90b4418d7b15c22c4b34bb222b245851136837b80e4d76f0dfb367`, 1078 bytes, pure ASCII
  (so `sha(string)` UTF-8 = file bytes).
- `na-reject.json:10` `fixture.sha256` = that value; receipt case evidence sha
  `4f27fb3d…6d92a` = sha of `na-reject.json`; HEAD blob = working tree for html/json/receipt.
- The `fixture` builder text is identical in history v1, v2, v3 and the current producer, and
  `history/runtime-v{1,2,3}/na-reject.html` equal the current file modulo nonce. The ordering /
  null / bounded repairs therefore did not change the served na-reject fixture shape.

### A2 — source-code-to-served-byte limit (not byte-evidenced)
- Nothing hashes the body the browser received: no `Network.getResponseBody`, no route
  response capture. `context.route` (producer:171-175) does `route.continue()` without overrides.
- Indirect evidence that the served page is this fixture:
  - server log `receipt.requests`: exactly one `GET /na-reject` at 1792588028172, between `Page.enable`
    (seq1, …167) and `Page.frameNavigated` (seq3, …174). No `/landing` request is attributable to
    na-reject; the only `/landing?q=de22b3e0…` (…025533) predates it and belongs to na-native-submit.
  - page echo `observations.nonce` = case nonce (`na-reject.json` seq12 and seq16). That string exists only
    in the served script.
  - `WebMCP.toolsAdded` (seq5) name `lifecycle`, description `Dummy loopback lifecycle`, `q` string
    with description `Dummy`, `required:["q"]`. This matches the form/label/`required` bytes.
- Limit: the echoes prove that a page containing this nonce, form shape and handler behaviour
  executed. They do not prove full-byte equality between the served body and the retained file. `Cache-Control:
  no-store` + fresh profile make a stale copy implausible, not impossible to rule out from artifacts.

### A3 — per-run dummy nonce (holds at runtime; counter gap)
- The nonce is unique across the 12 receipt cases (12/12). `rg` over the whole lane finds it only in
  `runtime/na-reject.{html,json}` and `runtime/receipt.json`, never in history/fixtures. That makes it fresh relative to v1–v3
  (`5a8ac5e6…`, `ef98d1b7…`, `3f74dc92…`).
- Chain in `na-reject.json`: invoke input `q` (seq9, lines 138-143) → `toolInvoked.input`
  `{"q":"4141…"}` (seq11) → pre-action `value` and `nonce` (seq12) → submit record `q` (seq16) → post
  `value`. Two independent origins agree: the page `nonce` field comes from the served script, and `value`/`q` come
  from the agent fill.
- The response does **not** carry the nonce. In reject mode the `value` object containing the nonce (html
  line 12) is built but never resolved, and `toolResponded` (seq15) has only `invocationId/status/errorText`.
  The response is bound to this run solely by invocationId `B5B968CA…6C21`, correlated by seq10
  result → seq11 → seq15.
- **Missing mutant / counter gap:** `measure-c1.mjs:75` checks only that the fixture file
  `includes(c.nonce)`, and `:81` checks invoke input `q`. Nothing checks `pre/post.value.nonce`, `value`,
  `submits[].q` or `toolInvoked.params.input` against `c.nonce`. Swapping in another case's page-echo
  nonce (consistently in marker, pageObservations and summary) would still count. Suggested mutants:
  `page-echo-nonce-drift` and `toolinvoked-input-drift`.

### A4 — toolautosubmit absent (holds)
- Form tag: `<form id="f" toolname="lifecycle" tooldescription="Dummy loopback lifecycle"  action="/landing" method="get">`.
  The double space is the empty interpolation `${autosubmit ? 'toolautosubmit' : ''}` (producer:107). The fixture contains
  0 case-insensitive occurrences of `toolautosubmit`, and the script never sets it dynamically (html lines 5-16).
- CDP `toolsAdded` exposes no autosubmit field, so runtime absence rests on behaviour.
  `preAction.responseCount 0` with `formActive true` over 254 ms, plus the `auto-positive` contrast (`pre=1`).
- Counter regex `measure-c1.mjs:77` `/(?:\s)toolautosubmit(?:\s|=|>)/i` correctly yields false on the real tag.
- **Mutation-coverage gap:** selftest `autosubmit-fixture-toggle` (`selftest-c1.mjs:53`) and
  `fixture-edit` (`:31`) mutate only `r.cases[0]` (na-pending). They act on synthetic base bytes
  (`fixtures/positive-ordered.json`: na-reject html = `<form>fixture-nonce-independent-06</form>`), not on the
  real attribute-bearing tag shape. So the regex is never exercised on a realistic multi-attribute tag. Two
  known blind spots remain unexercised (minor, no runtime effect here): a `toolautosubmit` substring inside
  another attribute's value (false positive), and script-side `setAttribute('toolautosubmit','')` (false negative).

### A5 — action mechanism and order (holds; marker semantics)
- Mechanism: `page.evaluate(() => document.querySelector('#f').requestSubmit())` (producer:213). There is no
  submitter and no input pipeline. `isTrusted:true`/`agentInvoked:true` in seq16 are consistent with the UA-dispatched
  SubmitEvent (S100:761-776), not with a human action.
- Order (seq/ms): invoke 9/…183 → result 10 → toolInvoked 11/…184 → pre 12/…437 → action 13/…437 →
  action-complete 14/…439 → toolResponded Error 15/…439 → post 16/…941. `preAction.windowMs 254`
  (start …183 = sent.at), `after.windowMs 504`. The response at seq15 < post.seq 16 is inside the cutoff.
  `navigations []`, url unchanged, `formActive` true→false.
- Precision: `frame('action', 'dispatch-started')` is pushed *after* `pendingAction` is created
  (producer:212-219). No await separates them, so no frame can interleave and the marker still precedes any response.
  But it marks "dispatch requested", not "dispatch not yet executed".
  The order of seq14 (Playwright evaluate result) versus seq15 (separate CDPSession event) reflects transport arrival, not cause.

### A6 — handler preventDefault → respondWith ordering (fixture-text only)
- Bytes: html line 8 pushes the submit record (captures only `typeof e.respondWith === "function"`).
  Line 9 calls `e.preventDefault()`, and line 13 calls `e.respondWith(Promise.reject(Error('dummy rejection')))`. The handler then returns.
- Runtime consistency: errorText `"respondWith promise was rejected"` = S100:326. The page `error` listener
  captured `"Uncaught Error: dummy rejection"` (seq16 `errors`), matching `V8ScriptRunner::ReportException`
  at S100:322-323 on the `resolved=false` path. That is two independent channels for the rejected-promise branch
  (S100:790-806). No navigation and no `/landing` request support the canceled default (`CHECK(!should_submit)`
  S100:794).
- Not evidenced at runtime: no per-step marker (`defaultPrevented` before/after respondWith, respondWith
  return/throw). The ordering claim is a property of the served script text, not an observation. The
  reverse order (respondWith before preventDefault) is an untested contrast. The note's na-reject row does
  not say so, while its na-throw row does state its analogous untested variant.

### A7 — profile isolation and PID cleanup (holds for recorded set; limits)
- Per-case profile `join(temp, id)` with `temp = mkdtemp(tmpdir()/tabi-r21-lifecycle-)` (producer:128,159).
  The browser env sets `HOME: temp, TMPDIR: temp` (producer:164). HOME/TMPDIR are therefore **shared by all
  12 cases** in the run, and only `--user-data-dir` is per-case. The profile/temp path is never recorded in evidence,
  and `rmSync(temp)` (producer:255) is not attested in artifacts. The host currently has no
  `/tmp/tabi-r21-lifecycle-*` and no process whose cmdline contains it (read-only check now, not a run-time observation).
- `na-reject.json`: 9 PIDs; `processIdentitiesAtLaunch` = `browserPidsAtClose` = `processIdentities`
  (no new PIDs at close); `browserPidsSeenAfterClose []`, `browserPidsAfter []`, `contextClosed true`;
  no `closeError` and no `forcedCleanup`; `blocked []`, `downloads []`.
- Independent cross-check: the start-tick field index 19 after `)` is `/proc/<pid>/stat` field 22, which is correct
  (producer:69). Using CLK_TCK 100 and the current boot (btime 1792501016, no reboot since 2026-10-20 09:57),
  all 12 cases' identities are disjoint (0 pid:ticks overlaps). A single wall-minus-boot offset interval
  `[btime+0.591, btime+0.688]` (nonempty, consistent with btime's integer truncation) makes every case launch
  after the previous case's last frame and before its own first frame. At mid-offset, na-reject launches about 46 ms after
  na-remove's last frame, and na-throw launches about 39 ms after na-reject's last frame. This is consistent with serial isolation, but the
  slack is only about 97 ms.
- Limits: `closeOwnedContext` records no timestamps, so close-before-next-launch is inferred from code order plus the tick
  arithmetic above, not observed. Identities lack comm/cmdline, so the tracked process types cannot be audited.
  Ownership is `--user-data-dir=<profile>` exact argv plus a ppid closure (producer:52-65). A helper that is reparented
  away from the chromium tree without that argv element (e.g. a double-forked crash handler) would be invisible to
  both the before and after scans `[INFERENCE: not verifiable from artifacts]`.

### A8 — producer revision binding (FAILS at current HEAD)
- `git ls-tree`: `scripts/webmcp-lifecycle-round21.mjs` is **absent at HEAD `1b5f449`** and in every ref
  (`git log --all` empty). The working tree reports it as `??` (untracked, not ignored). HEAD 1b5f449 (committed
  2026-10-21T13:19:28Z, after the 13:07:02–13:07:14Z run) commits the runtime evidence, receipt, note,
  measure, selftest, fixtures and `runtime-execution-bounded.json`, but not the producer.
- Consequence (read from code, not executed): `measure-c1.mjs:47`
  `!get(PRODUCER)` → `producer_digest` → `value 0` for `measure-c1.mjs 1b5f449`. Separately, the receipt's
  producer sha `5363d576…` is self-computed (`sha(readFileSync(SELF))`, producer:146). It matches today's
  untracked working-tree file, but no committed blob backs it. `runtime-execution-bounded.json` itself
  records `revision e7cf11a…`, `measuredRevision "uncommitted"`.
- Required before any revision-bound count: commit the producer bytes with sha `5363d576…eceb9`, then measure
  that commit.

## Missing mutants / controls (report only; not executed)
1. `page-echo-nonce-drift`: alter `pre/post.value.nonce` (marker + pageObservations + summary) on any case.
2. `toolinvoked-input-drift`: alter `toolInvoked.params.input` nonce.
3. Autosubmit/fixture toggles applied to a real-shaped fixture (e.g. the na-reject tag) and to a non-first case.
4. Runtime contrast: respondWith-before-preventDefault for the reject handler.
5. Producer-absent-at-revision: positive base always carries a synthetic producer, so the CLI selftest
   never models the real HEAD state found in A8 (the existing `producer-edit` mutant covers drift, not absence).

## Remaining unknowns
- Served-body byte equality (A2) and effective Chromium argv (only requested flags are recorded).
- Process types in the 9-PID set and any reparented helpers (A7).
- Whether L1 intends to commit the producer before measuring (A8).
