# R93Critic1 — C1 wording vs counter (adversarial review)

Axes: coverage (does the counting command enforce what the wording claims?). Method: clause-by-clause
audit of `plans/round-93.md` §Claim + `claims.json` statement against
`scripts/check-cross-session-answer-round93.mjs` (--live and --receipt) and the pinned driver bytes
(sha256 a0dedd…). Every unenforced / partially-enforced clause got a forged receipt built from
`controls/receipt-positive.json` (nonce tabi-r93-ctl-positive) and run through the counter in
`--receipt` mode. `VERDICT C1: falsifies-wording` only if the wording claims more than the
`--live` counting command enforces.

## The counting-command boundary

`--live` (counter lines 68–85) sha256-checks the driver (`driverSha === pin`, else exit 1),
runs it with a fresh `tabi-r93-live-<12hex>` nonce into `--scratch`, then applies the SAME
field checks as `--receipt` (lines 108–166) to the receipt the pinned driver wrote. No
additional online re-verification (no re-fetch of `/json/version`, no re-describe) happens.
A driver exit-2 maps to `verdict: setup, exit 2` (line 84); a driver exit-1 (runner
reported a leg error) still yields a receipt which the counter then scores (lines 88–122
`failures`/`leg-error` checks catch it). The plan's declared limit 6 concedes `--receipt`
forgery; the question is what `--live` + pinned-driver construction actually pins down.

### Under --live, construction pins (driver bytes are the enforcement)

- Leg order X-1,S-1,…: driver line 253 `for rep 1..reps for arm [X,S]` awaited sequentially —
  unalterable without breaking the pin. Receipt-mode `leg-set` (line 120) also enforces array order.
- Fresh browser per leg: driver spawns a new chromium per leg (line 154), fresh profile dir
  `scratch/leg-<id>/profile` (151), kills the process group in `finally` (244–246).
- Click at `#s` centre: driver computes `fr + childRect` centre (207–210) and dispatches
  page-session mouse events (212–213). `l.click` is recorded but the counter never reads it.
- Chooser capture: driver filters `Page.fileChooserOpened` events after `mark` (216–219),
  records `session/frameId/backendNodeId`; describe/cross/answer all use the SAME `csid`/`ps`
  session handles and the SAME `B` (224–235) in one straight-line block. B-identity is by
  construction, not by any counter field.
- `filesAfterCross` timing: sleep 300 ms after the cross send, then `__files()` read
  (231–232), before the correct-session answer (234). By construction, not by counter.
- S-arm no-cross-send: driver `if (csid !== ps)` (228) — the cross send is only issued when
  sessions differ. By construction, not by counter (for S, `session==page` ⇒ skipped).
- File content (22 bytes `tabi round 93 answer.\n`): driver writes `answerPath` (91–92) once
  and passes it to both `setFileInputFiles` calls. Receipt can only evidence `[name,size]`.

### In --receipt mode (and therefore in the counter's field checks), what is NOT enforced

The counter's field checks are the only thing a forged receipt faces. The gaps below all pass
with rc 0 (forgeries a–j, next section). The stated wording, read as a claim about what the
`--live` run did, is only as strong as pinned-driver construction — which the plan correctly
declares (§Declared limits 3–5: no frameId binding, one id per leg, intercepted dialog).

## Clause table

Notation: **counter** = a `--receipt`/`--live` field check enforces it; **driver** = only
pinned-driver construction under `--live` (bytes fix it); **none** = neither enforces it;
**conceded** = plan limit 3–6 already scopes it out of the claim.

| # | Wording clause | Enforced by | Counter line(s) | Forgery |
|---|---|---|---|---|
| 1 | Chromium 155.0.8059.84, `--headless=new`, Linux, `/usr/bin/chromium` | **counter** (string) + **driver** (launch flags) | `chromium` L111 (substring `155.0.8059.84`); `browser-version` L135 (`Chrome/155.0.8059.84`) | — (battery `chromium-other` kills) |
| 2 | 3 reps, order X-1,S-1,X-2,S-2,X-3,S-3 | **counter** (array order) + **driver** (loop order) | `leg-set` L120 (exact `want` array); `reps` L113 | h only attacks timestamps, which are unchecked garbage |
| 3 | Fresh browser + profile per leg | **driver**; counter checks only distinct UUID-shaped `browserId`s | `fresh-browser` L124 (`/^[0-9a-f-]{36}$/` + `Set.size`) | g |
| 4 | Parent `http://127.0.0.1:<http>/parent.html?leg=<id>`, one iframe, child `http://<host>:<child>/child.html?leg=<id>`, one input `#s` at fixed pos | **counter** (URLs/ports/hosts) + **driver** (serves the HTML) | `child-url` L139, `parent-url` L140, `child-host` L136, `ports` L116 | — |
| 5 | Left click on PAGE session at `#s` centre | **driver only**; counter never reads `l.click` | none | c |
| 6 | B = chooser `backendNodeId`, integer > 0 | **counter** (chooser record) | `chooser` L151 (`Number.isInteger && > 0`) | — (but see #8: B-identity of *later* steps is driver-only) |
| 7 | X: exactly one attached + one listed iframe target, same targetId, URL = child URL, targetId = child frame id | **counter** | `iframe-targets` L146 | — (battery kills all 6 target cases) |
| 8 | X: `describeNode(B)` on iframe session = INPUT type=file id=s | **counter** | `describe-chooser` L152 via `isInputS` L106 | — (battery kills; but `isInputS` reads pairs-scanned attrs — forgery i shows duplicate-pair tolerance, a cosmetic over-acceptance) |
| 9 | X: `describeNode(B)` on PAGE session = no error + nodeName `#document` | **PARTIAL**: counter checks `dp.session/error/nodeName` only; never binds `dp` to B, never checks `frameId`/documentURL | `describe-page` L155 | a, b |
| 10 | X: page pierced getDocument has 0 INPUT#s | **counter** | `pierce-input` L156 | — |
| 11 | X: page-session `setFileInputFiles(B)` error is exactly `Node is not a file input element` | **counter** (exact string) | `cross-answer` L157, `CROSS_ERROR` L41 | — (battery `x-cross-answer-other-error` kills) |
| 12 | X: child files then read `[]` ("no file delivered") | **counter** (value) + **driver** (timing) | `cross-answer` L157 (`eq(l.filesAfterCross, [])`); timing driver L231–232 | value killed by battery `x-cross-answer-delivered`; TIMING is driver-only (no timestamp in receipt) |
| 13 | X: iframe-session answer then returns no error | **counter** (error null + session) | `answer` L163 | — |
| 14 | X: cross answer sent before correct answer | **driver only** (straight-line order 229→234) | none | — |
| 15 | S: zero attached + zero listed iframe targets | **counter** | `iframe-targets` L148 | — |
| 16 | S: exactly one chooser on page session, B>0 integer | **counter** | `chooser` L151 with `session='page'` | — |
| 17 | S: `describeNode(B)` on page session = INPUT type=file id=s | **counter** | `describe-page` L159 (`isInputS`) | — |
| 18 | S: pierced getDocument exactly 1 INPUT#s | **counter** | `pierce-input` L160 | — |
| 19 | S: "no cross-session answer is sent" | **driver only** (line 228 gate); counter sees `crossAnswer===null && filesAfterCross===null` — a claim of absence, not evidence of absence | `cross-answer` L161 | e |
| 20 | S: page-session answer no error | **counter** | `answer` L163 | — |
| 21 | Both: child files exactly `[["tabi-r93-answer.txt",22]]` | **counter** (name+size); content never read back (driver-local `answerPath`) | `child-files` L164, `answer` L114 | j |
| 22 | Both: exactly one click, `isTrusted` true, targeting `#s` | **counter** (child-recorded array) | `child-click` L165 | — |
| 23 | Both: DevTools `/json/version` Browser = `Chrome/155.0.8059.84` | **counter** (recorded string only) | `browser-version` L135 | f (in receipt mode; `--live` driver fetches it for real, L159–161) |
| 24 | Both: 6 distinct DevTools browser ids | **counter** (distinctness) + **driver** (fresh spawn) | `fresh-browser` L124 | g |
| 25 | Receipt schema/nonce/pin/`chromium`/`crossHost`/`reps`/`answer`/ports/`failures`/per-leg arm·rep/URLs | **counter** | L108–L122, L131–L140 | — (battery covers 30+ of these) |
| 26 | "`#document`" whose? — plan limit 3: frameId/documentURL explicitly NOT bound | **conceded** (declared non-claim) | none (by design) | a exploits the conceded gap; wording does not claim it |

Key answers to the brief's questions:
- **`names a #document node`**: the receipt's `nodeName` IS the only binding the counter
  checks (`dp.nodeName === '#document'`, L155). `dp.frameId` is recorded (driver `nodeShape`
  L129) but never read by the counter. Plan limit 3 explicitly concedes no frameId/documentURL
  binding. Under `--live` the driver really sends `DOM.describeNode {backendNodeId: B}` on the
  page session (L225), so the *observation* is genuine — the claim's sting is witnessed, the
  receipt field is a lossy witness of it.
- **`no file delivered`**: `filesAfterCross` is read 300 ms after the cross send and before
  the correct answer (driver L231–232) — timing is construction, value is counter-checked.
  A receipt-mode forgery that delivered-and-then-cleared files would need to lie about the
  recorded value, which the counter catches (`x-cross-answer-delivered`).
- **`exactly the error message`**: genuinely exact — `l.crossAnswer.error === CROSS_ERROR`
  (string equality, L157). Battery kills both the null and wrong-string variants. Not a gap.
- **`fresh browser per leg`**: counter = distinct UUID-shaped ids (L124); the actual freshness
  (new process + new profile + group kill) exists only in driver bytes (L151–155, L244–246).
- **`order X-1,S-1,…`**: counter enforces receipt array order (L120); driver executes it
  (L253). Wall-clock interleaving is unrecorded but immaterial to the leg-local claims.
- **S-arm "no cross-session answer is sent"**: a receipt's `null` cannot evidence a negative
  action. Under `--live` the driver gate (L228) makes the send impossible for S — construction
  carries this clause entire. In `--receipt` mode the clause is unfalsifiable (forgery e).

## Forgeries (all cloned from `controls/receipt-positive.json`, nonce `tabi-r93-ctl-positive`, pin `a0dedd…`)

Run: `node scripts/check-cross-session-answer-round93.mjs --lane <lane>
--expect-driver-sha256 a0dedd… --receipt <forgery> --expect-nonce tabi-r93-ctl-positive`

| letter | slug | violated wording (counter-blind) | rc |
|---|---|---|---|
| a | describe-page-not-bound-to-B-or-document | `describePage.frameId = "CHILD-FRAME-DOCUMENT"`: counter never reads frameId; wording (limit-3-conceded) does not bind whose document | 0 |
| b | describe-page-arbitrary-attributes-still-document | `describePage.attributes = [type/file/id/s]` with nodeName `#document` — counter reads nodeName only | 0 |
| c | filesAfterCross-timestamp-not-enforced | `l.click = {x:5,y:5}` — wording says click at `#s` centre; counter never reads `l.click` (driver-only) | 0 |
| d | cross-error-case-or-whitespace-variant | `choosers[0].backendNodeId = 99999` — receipt records NO `B` on describe/answer/cross fields, so B-identity of all later steps is unenforceable in receipt fields (driver uses one `B` variable, L223–234) | 0 |
| e | s-arm-cross-answer-field-null-while-sent | S leg gains `crossAnswerProvenance: "sent-on-page-session-before-answer"` — unknown fields ignored; `null` field = absence claim, not evidence | 0 |
| f | browserVersion-browser-string-unbound | leg `browserVersion`/`browserId` strings are independent; counter never re-fetches `/json/version` (receipt mode) | 0 |
| g | fresh-browser-distinct-ids-same-browser | all six browserIds rewritten to distinct UUIDs — counter checks shape+distinctness, not process freshness | 0 |
| h | leg-order-fabricated-in-receipt-mode | `generatedAt = "not-a-date"` — no per-leg timestamps exist anywhere; receipt temporal claims uncheckable | 0 |
| i | describeChooser-panel-vs-input | `describeChooser.attributes` duplicated id/type pairs — `attr()` takes first pair match (L103), so a disagreeing second id still passes `isInputS` | 0 |
| j | answer-file-content-never-checked | receipt unchanged apart from generatedAt: the 22-byte file CONTENT is driver-local (`__files()` returns only name+size, driver L99); any 22-byte content passes | 0 |

Each forgery exits **rc 0, zero findings** — expected for receipt mode (plan limit 6 concedes a
whole-consistent forged receipt passes). The question below is whether those gaps exist in the
`--live` counting command too.

## Verdict

`VERDICT C1: neutral` — `.ufo/waves/round-93/w1/R93Critic1.md`

All ten forgeries exploit gaps in the counter's *field* checks, but every one of those clauses
is fixed by pinned-driver construction under `--live` (the actual counting command), which the
plan scopes honestly: limit 3 concedes the `#document`-identity non-binding the forgeries a/b
probe, limit 4 concedes fixed shape/order, limit 5 concedes the intercepted chooser. The
wording asserts exactly "the pinned driver did X" under `--live`, and the pin makes the driver's
bytes the enforcement for B-identity (#6/#8/#12/#19), click position (#5), leg order/freshness
(#2/#3), cross-before-correct order (#14) and S-arm absence (#19). The counter's exact-string
error check (#11), target model (#7/#15), INPUT identity (#8/#17/18), files (#12/#21) and
trust (#22) are field-enforced and battery-killed. No clause the wording asserts is left without
either a counter line or an honestly-scoped construction guarantee. The one cosmetic
over-acceptance (forgery i: first-pair-match on duplicated attribute pairs) lets a *receipt*
claim duplicate darlings — it does not let a real `--live` observation mislead, because the
driver builds attribute arrays from Chromium's actual node (`nodeShape`, L129).

Note for L1 (not a falsification): if the round ever moves the counting command to `--receipt`
or unpins the driver, forgeries a–j become genuine counter escapes. Smallest safe hardening,
if ever wanted: record `B` on each describe/answer/cross shape and require equality with
`choosers[0].backendNodeId`; record `frameId` on X `describePage` and require it to be a
non-null string ≠ childFrameId; require `l.click` ≈ centre of recorded rect; assert
`generatedAt` parses. None of these is needed while `--live` + pin is the counting command.

## Commands run

```
node .ufo/waves/round-93/w1/R93Critic1-forge.mjs          # writes 10 forgery files, runs counter --receipt on each
# each forgery rc: 0, findings: [] (see table)
pgrep -f "remote-debugging-port=" (on my ports) — no chromium spawned by this seat (receipt-mode only)
```

Tooling: none installed (receipt-mode attack needs only the frozen node instruments already in
the lane). Chromium: none launched. Scratch `/fast/scratch/hyaku/tabi-r93/R93Critic1/` created
and removed before yield.
