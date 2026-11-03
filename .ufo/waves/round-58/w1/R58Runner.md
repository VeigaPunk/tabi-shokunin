# R58Runner — r58 preventDefault-swallow runner (tabi round 58, wave w1)

Seat: `R58Runner` (executor, leaf). Claim: **C2** — coverage capability
`chromium-keyevent-preventdefault-swallow-linux`. Lane base revision named by
the wave: `051f433dd49880d652407f1c02f8a15646602bbe`. Frozen design:
`.ufo/waves/round-58/claims.json` (C2 statement, kill rules, do-nothing
control) — read first, never amended.

Status: **driver written, path selftest 19/19, two end-to-end smokes green
(exit 0, predicate true, zero survivors, both port probes refuse, exactly one
form submission each)**. No live data run: nothing under `corpus/` was read as
a data claim, written, or produced. No mutating git/jj command was run; the
file I authored is an uncommitted working-tree addition.

## Files changed (only these)

| Path | What | sha256 |
|---|---|---|
| `scripts/chrome-cdp-loopback-round58.mjs` | NEW r58 driver, 1903 lines / 110081 bytes, built by `cp` of the r57 bytes then extended | `9935ed9862af0f5e7ff1d5400790ab9a14d6966e6f5cc713280af6108bd1d324` |
| `.ufo/waves/round-58/runner/driver-sha.txt` | the sha pin above (sha256sum format) | `fba7a5b820600f8f59dae036cbe120c6c4f0cbd3a976384e6f9d8330e452d696` |
| `.ufo/waves/round-58/runner/path-selftest.json` | `--path-selftest` output, `allPass true`, 19/19 | `559194e1bef8d2b52d4d95a1e41db99e4d97850d42968c7b480290fd1c3d408c` |
| `.ufo/waves/round-58/runner/probe-keyevent-defaults.json` | scratch ground probe (see "Ground facts") | `da7233dc34f9b289cd758ab895c30a823dce88f3fe3faf405730ae13c64238f4` |
| `.ufo/waves/round-58/runner/smoke1/receipt.json` + `smoke-log.json` | smoke run 1, nonce `tabi-r58-7313c79d53a3` | `3a9bd5cc19b72d7d7e9ae561360557173e3c237625e1f36048a00fe3e3e2cb9d` / `168f2da569b5af25b870a42d7c2625d766a1a7bbc78b46a5c08cb91fa75996df` |
| `.ufo/waves/round-58/runner/smoke2/receipt.json` + `smoke-log.json` | smoke run 2, nonce `tabi-r58-ee27956ee80f` | `3b3681b34ae3b8d78275a20675bb9af8fcef019e72f9b26a54e769b4154c6d7c` / `5f9b25ba46afd6b165c6c67238629d5955bbea09859fd96ef40eeecd68eca302` |
| `.ufo/waves/round-58/runner/R58Runner.md`, `.ufo/waves/round-58/w1/R58Runner.md` | this report (identical bytes, both paths the assignment names) | — |

`scripts/chrome-cdp-loopback-round57.mjs` is **unmodified**:
`e0b1f3f5b8d576e2c96b298eb76a828ee3aa2e363305c05eaa8636fa02d0573b` before and after.

## Behaviour — the declared deltas as implemented

(1) RELABEL. `SCHEMA = 'tabi-chrome-cdp-r58'`; nonce `tabi-r58-<12 hex>`,
regenerated (bounded, 1000 draws) until the hex tail carries an `[a-f]` so the
carried r57 chord-letter derivation keeps a subject; fixture titles
(`tabi-r58 form fixture`, `tabi-r58 echo`), echo page `<title>`, header and
usage lines re-labelled. Nothing else about the nonce changed.

(2) FIXTURE. The page's own swallower is the **first** capture-phase keydown
listener on `document`; both r57 recorders are registered after it, so
`e.defaultPrevented` is already set when they read it. Gate:
`window.__swallowOn === true && window.__swallowSet.indexOf(e.key) !== -1` →
`e.preventDefault()`; the only mutator is
`window.__setSwallow(on, keys)` (idempotent: clears then sets). Both
`window.__keylog` and `window.__keylogFull` gained exactly two additive
fields, `cancelable` and `defaultPrevented`; every r57 field and the r57 plan
shape are unchanged. The fixture script reads no `location`/query/hash/cookie/
`window.name`/storage and references no external URL. All of this is checked
by `fixtureContract()` **before a browser is spawned** (a fixture that cannot
witness the legs exits 2), and re-attested at runtime in
`receipt.fixtureDelta.witness.allCarryAdditiveFields`.

(3) NEW LEG, physically between the carried chord leg and the carried final
Enter submit, on the never-named `#field3`, with the gate restored OFF first:

- s1 `swallowLeg.control` — first two characters of the hex tail typed, both
  insert, both keydowns `cancelable true` / `defaultPrevented false`;
- s2 `swallowLeg.backspaceSwallow` — Backspace delivered (keylog entry,
  `cancelable true`), `defaultPrevented true`, value unchanged;
- s3 `swallowLeg.digitSwallow` — tail's third character delivered,
  `defaultPrevented true`, value unchanged;
- s4 `swallowLeg.enterChordSwallow` — ONE Control+Enter chord (bit 2, text
  `\r` as the carried submit carries), both keydowns recorded,
  `enterKeylogEntry.modifiers === 2`, `defaultPrevented true`,
  `submitted false`, `newRequests []`, then `restore.pageGate {on:false,set:[]}`.

The carried final Enter submit is untouched and remains the run's only
submission. `journey.form.serverRequests` carries the fixture server's whole
request log (path + query per request) as committed bytes.

(4) RECEIPT additions: `fixtureDelta`, `declaredStepNames` (12 names),
`journey.form.swallowLeg` (control / backspaceSwallow / digitSwallow /
enterChordSwallow / restore), `journey.form.serverRequests`, and the four
swallow PNGs in `stepsExtended` + `journey.form.shots`. The r56 `steps` array
and its order are byte-carried.

(5) TEARDOWN carried unchanged: detached process group, `kill(-pid)`, /proc
sweep on the launch token / throwaway profile / throwaway crash DB to zero
survivors (killed by PID, never by image name), then port probes on the
fixture port and the DevTools port; green only on `closed`/`closed`.

## Ground facts measured before freezing the plan

The plan asserts two properties the runner must not guess, so I probed them
first on this host (Chromium 155.0.8059.84, loopback CDP, throwaway
profile/HOME, receipt `runner/probe-keyevent-defaults.json`, 7 steps, 0
failures):

1. Every keydown the plan carries (`a f 0 -`, End, Tab, Shift, Control, Alt,
   Meta, Backspace, Enter) reports `cancelable: true`.
2. A capture-phase `preventDefault()` registered before a later recorder is
   visible to that recorder as `defaultPrevented: true`, and it suppresses
   digit insertion and Backspace deletion.
3. **An UNSWALLOWED Control+Enter with `text: '\r'` DOES submit on this host**
   (`/echo` observed). So s4's "no submission" is caused by the swallower, not
   by the chord — the witness is non-vacuous.
4. Headless Chromium also fetches `/favicon.ico`, so the server log is
   `/form`, `/favicon.ico`, `/echo`; "one submission" is exactly one `/echo`.

## Smoke (both runs, the L1's invocation class)

Command (lane root, absolute `--scratch`/`--out`):
`node scripts/chrome-cdp-loopback-round58.mjs --scratch <ABS> --out <ABS/receipt.json>`

| | run 1 | run 2 |
|---|---|---|
| exit | 0 | 0 |
| nonce | `tabi-r58-7313c79d53a3` | `tabi-r58-ee27956ee80f` |
| predicate | true | true |
| witnesses | 21/21 true, `failures []` | 21/21 true, `failures []` |
| /proc sweeps (pre / mid / post-kill) | 0 / 13 / 0 | 0 / 13 / 0 |
| port probes | fixture closed, devtools closed | fixture closed, devtools closed |
| `/echo` requests | 1 (`field=<nonce>&field2=<MIXED>`, no field3) | 1 (same shape) |
| PNGs written | 12, exactly the declared list | 12, exactly the declared list |
| page keydowns vs plan | 66 / 66, match | 68 / 68, match |
| stderr | empty | empty |
| `driverSha256` == pin | yes | yes |

Declared step list (pinned by `--path-selftest` and echoed in every receipt as
`declaredStepNames`): `a-start`, `b-typed`, `c-end-witness`, `d-backspace`,
`e-tab`, `f-enter-echo`, `g-shift-typed`, `h-chord-domain`,
`i-swallow-control`, `j-swallow-backspace`, `k-swallow-digit`,
`l-swallow-enter` → receipt + 12 PNGs per live run.

Both smoke runs wrote only into `/fast/scratch/hyaku/tabi-r58/R58Runner/`
(server log, profile-<token>/, throwaway HOME, PNGs, receipt); the receipts and
logs were copied into the wave dir above and the scratch tree was removed.

## Risks and disclosures

1. **"digits" is the hex tail's first two characters.** The frozen claim says
   "two nonce digits"; the implemented (and counter-pinned) derivation is the
   nonce hex tail's first two characters — hex digits `0-9a-f`, so they may be
   letters. Smoke 1 drew `['7','3']`, smoke 2 drew `['e','e']`. The receipt
   states the derivation and carries `hexTail`, `controlChars`, `thirdChar`,
   so nothing is inferred.
2. **s4 is a Control+Enter chord by design.** Because an unswallowed
   Control+Enter submits on this host (probe fact 3), the absence of a request
   is attributable to the swallow. The orthogonal one-submission witness
   (`serverRequests` has exactly one `/echo` for the whole run) is committed
   in the receipt, and the plan check enforces `Enter.defaultPrevented === true`
   — if the swallower silently stopped running, the run goes red rather than
   green.
3. **`field3Value`/`field3Final` changed meaning.** They are read at the same
   carried point (before the submit), which is now after the swallow leg, so
   they hold the two-character prefix. The carried chord-leg negative witness
   stays at `journey.form.chordLeg.field3ValueAfter === ''`, and
   `swallowLeg.control.valueBefore === ''` proves #field3 was still empty when
   the swallow leg began. Disclosed in the header, `legOrder` (now nine legs)
   and `fixtureDelta`.
4. **`serverRequests` contains /form and /favicon.ico.** They are page loads,
   not submissions; a grader must filter `path === '/echo'` (I messaged
   `R58Counter` with this and the exact field paths).
5. **The plan check now compares `cancelable`/`defaultPrevented`** for every
   keydown, which is the additive fixture delta applied to a carried check; on
   this host all keydowns are cancelable (probe fact 1), so this cannot turn
   the live pass red for a benign reason on the same host/browser.
6. **No live data pass, no freeze commit.** The live run, the corpus/evidence
   write, the driver-sha freeze pin and the counter's green run belong to the
   L1 after the freeze commit; I authored code only.
7. No tool installs or upgrades were performed (none were needed). No process
   outside the two smoke launches was started; both scratch trees are gone.
8. **Two report paths.** The assignment names both
   `.ufo/waves/round-58/runner/R58Runner.md` and
   `.ufo/waves/round-58/w1/R58Runner.md`; both carry identical bytes.

## Blockers

None.
