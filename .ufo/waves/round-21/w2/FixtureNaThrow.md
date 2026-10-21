# FixtureNaThrow — round21 w2, served fixture/provenance attack on `na-throw` only

Seat: TabiR21.FixtureNaThrow (author-side lane seat, not independent admission). Read-only.
No browser, producer, counter, selftest, build or linter executed. No tools installed.
Commands run: sha256sum, node one-liners over retained JSON (pure arithmetic, plus one
re-evaluation of the producer's `fixture()` template text), read-only git
(`status --porcelain`, `ls-tree`, `log`, `hash-object`, `check-ignore`), `/proc/uptime`, `/proc/stat`.

## Verdict

The `na-throw` raw run holds up internally. Nonce echo, invocation correlation,
toolautosubmit absence, handler ordering and PID ownership/cleanup are all consistent.
Two provenance defects are load-bearing, and the counter has four gaps for this case.
None of them is an observed-result contradiction.

- **F1 (HIGH, provenance): at lane HEAD the current producer is not committed.**
  `git status` shows `?? scripts/webmcp-lifecycle-round21.mjs`. The file is not ignored
  (`check-ignore` returns nothing), and `git ls-tree HEAD` lists no blob at that path. HEAD is
  `1b5f449ad15525d281fda4558aeef1086f1e4a65`, "round-21: record finite non-autosubmit lifecycle
  evidence", 2026-10-21 10:19:28 -0300. That commit does contain `na-throw.html`
  (blob ab3892f2…), `na-throw.json` (38f5b434…), `receipt.json` (1373a71b…, equal to the
  working tree), the knowledge note, `measure-c1.mjs`, and the history producers v1–v3.
  The committed receipt pins producer sha256 `5363d576…eb9`, but those bytes exist only
  in the untracked working tree.
  [INFERENCE from measure-c1.mjs:47 plus :103-111, not executed] `measure-c1.mjs 1b5f449…`
  reads git blobs only, so `get(PRODUCER)` is null. It therefore adds `producer_digest` and
  returns a value of 0. In this state the committed tree cannot reproduce the
  fixture-template-to-served-byte chain. This was observed at 13:24Z; L1 may still be
  committing.
- **F2 (MEDIUM, provenance): the recorded fixture path is not where the producer wrote it.**
  `webmcp-lifecycle-round21.mjs:157` writes `join(out, id+'.html')`, but `:160` hardcodes
  `fixture.path` as `corpus/evidence/round-21/runtime/${id}.html` regardless of `--out`.
  The run's `--out` was `.ufo/waves/round-21/runtime-bounded-candidate`
  (runtime-execution-bounded.json:9), and that directory no longer exists. The only record of
  the move to canonical is history/index.json `outputRelocation` plus the note at :54.
  Supporting evidence: the canonical mtimes are run-time values, which fits a rename. There is
  no retained digest of the candidate bytes from before the move.

## Fixture bytes and hash

- `na-throw.html` sha256 `ff256afa1d4fd97f9db939d8d8951897ae43c48da9ef04885519c2177a3da740`
  (1076 bytes, ASCII only, no trailing newline). It equals `na-throw.json:10`
  `fixture.sha256`.
- `na-throw.json` sha256 `bbe5fcac0d7186e8c197f2650d7a6521fc46860a83428ae844b88a2cc7fcfd97`.
  It equals the receipt `cases[7].evidence.sha256`.
- Regenerating with the current producer's `fixture()` text (`:105-123`) and inputs
  `('na-throw', '0c6a4c64-815c-43a9-92c8-ae7df597599e', false, 'throw')` gives byte-identical
  output with the same sha256.
- What links source code to served bytes, and where that link stops:
  - The served body is the same JS string `html` that was written to disk
    (`:156-158` `writeFileSync` and `routes.set`; `:140-142` `res.end(body)`). Both sides use
    UTF-8 and the content is ASCII, so equal bytes follow **by construction only**.
  - Nothing captured or hashed the response body on the wire. The one served GET is in the
    receipt: `GET /na-throw at 1792588029131`, which falls between Page.enable (seq2, …128) and
    frameNavigated (seq3, …134).
  - `route.continue()` (`:173`) passes the body through unmodified. That is Playwright
    behaviour, [INFERENCE] and not observed.
  - The producer digest in the receipt is self-attested (`:146` reads SELF at start). It
    agrees with the L1 execution record and with the current file. See F1 for why it is not
    committed.
- History runs v1–v3 have different na-throw hashes and nonces (`76393dfc…`/dd90da24,
  `28386f4c…`/ead74b0f, `98ac65e4…`/cf5e7b71). None of them is the current run.

## Per-run nonce echo

The nonce is `0c6a4c64-815c-43a9-92c8-ae7df597599e`. Repo-wide it appears in exactly three
files: na-throw.html (2 occurrences), na-throw.json (13) and receipt.json (5). All 12 receipt
nonces are unique. The nonce appears in each of these places:

- `window.observations.nonce` (html:5)
- invokeTool `input.q` (json seq9)
- toolInvoked `input` string echo (seq11)
- pre-action field value, filled by the agent (seq12 `value`)
- `submits[0].q` (seq16)
- both observations' `nonce`
- receipt `cases[7].nonce`

The `value` literal at html:12 is unreachable in throw mode, so the response never echoes
the nonce. That is expected, because the result is an Error.

## toolautosubmit

- The form tag is exactly
  `<form id="f" toolname="lifecycle" tooldescription="Dummy loopback lifecycle"  action="/landing" method="get">`.
  The double space is the empty `${autosubmit?…:''}` slot, and `grep -c toolautosubmit` returns 0.
- Behaviour is consistent with absence:
  - preAction `responseCount` is 0 over 252 ms with `formActive: true` (receipt
    `preAction`); auto-positive shows pre=1.
  - toolsAdded (seq5) carries no autosubmit field.
  - No runtime DOM probe of the attribute was taken.
- The full effective Chromium argv is not recorded; only requested FLAGS are. Playwright
  default args are unretained, and `ignoreDefaultArgs` is at `:164`.

## Action mechanism and order

- Mechanism: `page.evaluate(() => document.querySelector('#f').requestSubmit())` (`:213`).
- Single seq transcript: invoke result seq10 → toolInvoked seq11 → pre-action seq12
  (…396) → action `dispatch-started` seq13 (…396) → `action-complete` seq14 (…398) →
  toolResponded Error seq15 (…398) → after-action seq16 (…899).
- invocationId `9F5CB698061B49FE5E0096C807819D47` is the same in seq10, seq11, seq15 and the
  receipt.
- Attack: the `action` frame is pushed after `pendingAction` has already been created
  (`:212-219`), so "dispatch-started" is a label placed after the call was initiated.
- Attack: seq15 arrives after seq14 in the same millisecond. In S100 the error callback fires
  inside the submit dispatch (html_form_element.cc:807-813), which is before `requestSubmit()`
  returns. So the seq order here reflects the order Node received messages across two channels
  (the Playwright evaluate channel and a separate CDPSession). It is not browser causal order.
  The summaries are unaffected, because the cutoff is `post.seq`.
- `navigations` is `[]`. There is no `/landing` GET between …029131 and the next case's
  …030097. URL and `formExists` are unchanged.

## Handler ordering

The fixture handler (html:7-16) runs: push the submit record → `preventDefault()` → `throw`.
`respondWith` is never reached. The evidence for that ordering:

- The submit record was taken before preventDefault: `agentInvoked: true`, `isTrusted: true`,
  `active: true`, `respondWith: "function"`.
- The page shows `errors: ["Uncaught Error: dummy submit handler throw"]`.
- There was no navigation, so preventDefault took effect.
- errorText is exactly the S100:807-813 string. That branch requires no respondWith promise
  and `!should_submit`.
- After the action, `formActive` is false.

Attack: the result is indistinguishable from a handler that calls preventDefault without
respondWith and does not throw. The throw contributes only the page error record. There is no
control for preventDefault-without-throw, throw-before-preventDefault, or
throw-after-respondWith. The note's row (knowledge md:39) already scopes this correctly
("throwing before preventDefault is a different, untested fixture"). The rejected claim "throw
always navigates" (md:92) is validly countered by this row.

## Profile isolation and PID cleanup

- Profile: `join(mkdtemp, 'na-throw')` per case (`:159`). However `HOME`/`TMPDIR` is the
  shared run temp root for all 12 cases (`:164`), so HOME-level Chromium state is shared
  across cases [INFERENCE]. The whole temp tree is `rmSync`'d (`:255`), so isolation cannot be
  inspected after the fact and is established by code only.
- PIDs: there are 9 (2462310–2462406). Start ticks 8701234–8701244 are consistent across
  `processIdentitiesAtLaunch`, `browserPidsAtClose` and `processIdentities`. The other fields:
  - `browserPidsSeenAfterClose: []`
  - `browserPidsAfter: []`
  - `contextClosed: true`
  - no `forcedCleanup`, no `closeError`
  - `blocked: []`, `downloads: []`
- Tick arithmetic (same boot; uptime now 88060.54 s > 87012 s): boot ≈ 1792501016.656. That
  puts na-throw launch at 13:07:09.00–09.10Z, and the events fall in strict order:
  1. na-reject json saved at 08.989Z
  2. na-throw html written at 08.990Z
  3. na-throw processes started at 09.00–09.10Z
  4. Page.enable at 09.128Z
  5. na-throw json saved at 09.950Z
  6. na-delayed launch at 09.96Z

  Launch-tick spacing is 96 ticks (0.96 s) on each side, matching the GET spacing of 959 and
  966 ms. No PID overlaps a neighbouring case. Limits: boot_id/btime are not recorded in the
  evidence, and the calculation assumes no suspend or clock step.
- Limit: process cmdlines and types are not retained. `processTree` (`:52-65`) only tracks the
  cmdline match on `--user-data-dir=<profile>` plus its ppid descendants. A double-forked or
  reparented helper without that flag would escape both the owned set and the survivor check
  [INFERENCE; this cannot be checked now].

## Counter and control gaps for this case (missing mutants, not executed)

Every selftest mutant targets `r.cases[0]` (selftest-c1.mjs:19, which is na-pending). None
targets na-throw or its fields. `measure-c1.mjs` would pass all four of the following:

1. **Handler-mode drift.** Changing the html `const mode="throw"` to `"success"` and rehashing
   `fixture.sha256` passes. `:75` checks only hash and nonce substring, and `:73` compares only
   `e.mode` to CONFIG.
2. **Page-echo nonce drift.** Changes to `observations.nonce`, `submits[].q`, the toolInvoked
   `input`, or the pre-action `value` pass. Only `input.q` is checked (`:81`).
3. **Forced or late cleanup.** Adding `forcedCleanup`, a non-empty
   `browserPidsSeenAfterClose`, or altered `processIdentities`/startTicks passes. `:97` checks
   only `browserPidsBefore`, `browserPidsAfter == []` and `contextClosed`. The producer boundary
   at `:237` also ignores `forcedCleanup`, so a SIGKILL'd case would count as clean.
4. **Script-set autosubmit.** `f.setAttribute('toolautosubmit', '')` inside `<script>` passes,
   because the regex at `:77` inspects only the `<form>` tag.

For the synthetic fixture, `positive-ordered.json` reduces na-throw.html to
`<form>fixture-nonce-independent-07</form>`, with no handler, toolname or mode. No
fixture-shape control exists.

## Remaining unknowns

- Response bytes as they went over the wire.
- Effective Chromium argv.
- Process types and any reparented helpers.
- Byte equality between the candidate directory and canonical before the rename.
- Whether L1 commits the producer after 13:24Z.
