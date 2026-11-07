FINDINGS

# R74Review1 — false-green review of `scripts/check-imecompose-r74.mjs` (tabi r74, claim C1)

Seat: reviewer (non-author). Lane `tabi-shokunin`, round 74, wave w1. Base
`c72235d6aebca89269809050e983d53df36273f5`, digests commit `D = ca30e1a3b7b23d56260196ef7af19929f544b80b`.
I did not edit any production or lane file. Every crafted receipt and every counter output cited
here is under `.ufo/waves/round-74/w1/R74Review1/`.

## 0. Frozen bytes

| item | value | how |
|---|---|---|
| counter | `5901d895ced1305f27935b93b409363c5822c7a730a6d2c7d00446ed7d33d251` | `sha256sum scripts/check-imecompose-r74.mjs` (exit 0), equal to `freeze.txt:4` |
| driver | `afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc` | `sha256sum scripts/chrome-cdp-imecompose-round74.mjs` (exit 0), equal to `freeze.txt:3` |
| scored receipt | `eb22b63b03d3f4b4b06e6680e2122d98d96e482a1497f1436119769d4a9ae990` | `probe-matrix.json` `receiptSha256` |
| frozen limit | `claims.json:42` | quoted in §4 |
| predicate | `claims.json:33` | legs (a)–(d) |
| pin / nonce / prior set | `claims.json:27`, `claims.json:33` | frozen command; 12 PRE receipts |

Re-hash after the review: `sha256sum scripts/check-imecompose-r74.mjs` = `5901d895…` (exit 0), unchanged.
Copied counters used for the fixture probes are byte-identical copies (`sha256sum`
`w1/R74Review1/*/check-imecompose-r74.mjs` = `5901d895…`, exit 0).

## 1. Method

Each crafted file starts from the committed scored receipt
(`corpus/evidence/round74/chromium-ime-composition/receipt.json`) or from the committed PRE
`smoke1` receipt, is mutated, and is scored with the pinned counter invoked from
`/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts` with the frozen driver pin
`afacee1b…`, the receipt's own nonce as `--expect-nonce`, and all 12 PRE receipts as `--prior`
(`probe-matrix.json` `priorSet`). Command shape actually executed:

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts
node check-imecompose-r74.mjs --receipt <W1>/<case>.json \
  --expect-driver-sha256 afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc \
  --expect-nonce <receipt nonce> \
  --prior .ufo/waves/round-74/controls/c1/smoke1.receipt.json ... (12 PRE) ... --json
```

Outcome is recorded twice: per case in `<case>.counter.json` (full 148-check JSON) and in aggregate
in `probe-matrix.json` (39 counter invocations: baseline + 35 crafted receipts through the pinned counter + 3 copied-counter cases, the third being the 36th crafted receipt c4) and
`probe-matrix.json.argv` (10 argv probes). All 39 + 10 invocations were executed; none is inferred.
The baseline is `clean`, 148/148, `findings []`, exit 0 (`baseline.counter.json`), which reproduces
the status-at-dispatch claim.

## 2. Findings

### S1 (HIGH) — the r74 near-match is defeated by one extra/missing focus event; a PRE receipt replays clean

`b4-smoke1-all-ids-plus-dup-focus.replay.json`: smoke1 with every identity the replay family checks
rewritten (nonce `tabi-r74-review-b4`, launch token `81c93d9f9d43`, browser id
`4a152534-…-eb6ad7b9b4d5`, recomputed fixture sha256 `0bca278c…d122`) **plus one duplicated
`focusin`** (same `ts`/`at`/target as its twin), `seq` renumbered.
Control exit **0, `clean`, 148/148, findings `[]`**
(`b4-smoke1-all-ids-plus-dup-focus.replay.counter.json`; recorded in `probe-matrix.json`).
`b5-smoke1-all-ids-minus-focus.replay.json` is the same receipt with one `focusin` **deleted**:
exit **0, `clean`, 148/148** as well.

Evidence that the acceptance is caused only by the count change:

| measurement | value | evidence |
|---|---|---|
| b4 events / smoke1 events | 41 / 40 | `b4-smoke1-all-ids-plus-dup-focus.replay-diff.json` |
| multiset difference | exactly one `focusin\|621.8999999761581\|621.6999999880791\|f\|ABSENT` | `b4-smoke1-all-ids-plus-dup-focus.replay-diff.json` `extra` |
| original 40 events, aligned after removing the duplicate | `maxAbsAtTsDiff 0`, `fieldMismatch 0` | `b4-smoke1-all-ids-plus-dup-focus.replay-diff.json` |
| b5 events / smoke1 events | 39 / 40; `missing` = one `focusin` in `focus-ce`; `maxAbsAtTsDiff 0` | `b5-smoke1-all-ids-minus-focus.replay-diff.json` |
| b3 (same identity rewrite, **no count change**) | exit 1, exactly `["replay-event-timeline"]` | `b3-smoke1-all-ids-fresh.replay.counter.json` |

Code: `scripts/check-imecompose-r74.mjs:160` makes `x.length === y.length` a conjunct of
`nearTimeline`, and the per-leg derivation excludes focus events at `:217` (`FOCUS` defined at
`:130`). `focus-events-bound` (`:259`) only checks target membership (`f`/`ce`) and the ordered
`focusout` legs, so a duplicated/deleted `focusin` is invisible to every check. The send-log check
does not bound event counts either (`:211`).

Against the frozen limit (`claims.json:42`): the refusal clause says the replay checks refuse a
receipt "whose every event time lies within 0.05 ms of a --prior receipt's". In b4 every event time
— including the duplicate's — is within 0.05 ms of a smoke1 event time (the originals are
byte-identical, `maxAbsAtTsDiff 0`), and in b5 every remaining event time is byte-identical. The
declared not-refused class ("rewrites … and moves at least one event time by a whole 0.1 ms
quantum") does **not** cover a count change; b4/b5 move no event time at all. So this is outside
the declared not-refused class **and** contrary to the refusal clause as written: the frozen limit
sentence is falsified by an executed witness, in the same manner as r73's 1e-12 witness
(`corpus/lessons/round-73-verifier-spotcheck.md`). The counter's source comment (`:14–16`) states the
count precondition, so the code and the limit sentence disagree; the limit overstates. Read index-wise the clause
presupposes equal lengths (and is silent on a count change); read as a multiset it covers b4/b5.
Either way the sentence as written neither states the count precondition nor refuses these
receipts, and the implementation accepts them.

Impact: a prior receipt can be presented as a fresh scored run with a no-op focus event added or
removed, no event-time edit, and only the identity rewrites the limit already calls permitted. This
does not by itself show the capability measurement false (the committed scored receipt is not one of
these), but it defeats the one check the scored-run path uses against a copied receipt. The
not-refused class already concedes replay with a 0.1 ms move; S1 is a *different*, undeclared
escape that also bypasses the near-match's stated refusal.

### S2 (MEDIUM) — the asserted `-32602` refusal code is not read; only a substring of the message is

`a21-refusal-code-changed.pass.json` sets the `replace-half` leg's `cdpError` to
`{"code":-32601,"message":"Either both replacement start/end are specified or neither."}`.
Exit **0, `clean`, 148/148**, with `leg-replace-half-error=true`
(`a21-refusal-code-changed.pass.counter.json`). `claims.json:25` names "the half-replacement -32602
refusal" as part of the surface, and the driver emits the code inside `cdpError`
(`chrome-cdp-imecompose-round74.mjs:288` builds `new Error(JSON.stringify(msg.error))`; `:326` stores `cdpError = e.message`). The counter
at `:232` only runs `leg.cdpError.includes('Either both replacement start/end are specified or
neither.')`; `-32602` is never compared. A receipt can claim any error code (or a different error
object) as long as the message phrase survives. Outside the limit sentence (content, not replay).

### S3 (MEDIUM) — `compositionstart` "selected text" is self-referential; the preceding leg state can check it and does not

`a13-cs-value-contains-data.pass.json` rewrites the `compose-c` `compositionstart` to
`value='zzabzz'`, `selStart=2`, `selEnd=4` (data stays `ab`). Exit **0, `clean`, 148/148**, with
`compositionstart-selected-text=true` (`a13-cs-value-contains-data.pass.counter.json`). The real event is
`value='仮名ab'`, `selStart=2`, `selEnd=4`; the preceding leg `select-f` has
`stateAfter = {f:'仮名ab', fSel:[2,4], ce:'', active:'f'}` (dump in
`a13-cs-value-contains-data.pass.json`). The law at `:255` only proves
`data === value.slice(selStart, selEnd)` — internal consistency — while the target text and
selection at dispatch are pinned by the previous leg's `stateAfter` and are not compared. So the
check named "compositionstart data is not the target's selected text at dispatch" accepts a value
that never existed in the DOM. Outside the limit sentence.

### S4 (MEDIUM) — the send log is an allow-list, not the driver's exact call set; page-side evaluations are unbounded

`a20-extra-focus-eval-sendlog.pass.json` appends a 57th send
`{id:57, method:'Runtime.evaluate', params:{expression:'window.__focus("ce")', returnByValue:true}}`.
Exit **0, `clean`, 148/148**, with `send-log-allowlist=true`
(`a20-extra-focus-eval-sendlog.pass.counter.json`; sendLog length 56 → 57). The counter's section comment
(`scripts/check-imecompose-r74.mjs:194`) is "the send log is exactly the driver's own call set", but
`:201-211` only once-bounds `Emulation.setDeviceMetricsOverride`, `Page.navigate` and
`Browser.getVersion`; `window.__focus`, `window.__select`, `window.__setLeg` and `window.__state`
evaluations may repeat without bound. Combined with the focus-event freedom in S1, a receipt can
carry extra focus operations and matching focus events invisibly to every check. Outside the limit
sentence.

### S5 (LOW–MEDIUM) — `fixture.viewport` and `fixture.origin` are unbound claims

- `a10-fixture-viewport-claim.pass.json` claims `fixture.viewport = {width:1,height:1}`: exit 0,
  clean 148/148.
- `a11-fixture-origin-claim.pass.json` claims `fixture.origin = 'http://127.0.0.1:9'` (and updates
  the one `Page.navigate` param so the send log agrees): exit 0, clean 148/148.

`fixture` is read only for `sha256` (`:149`) and `origin` (inside the `Page.navigate` comparison,
`:207`). `claims.json:42` ends with the scope sentence "Demonstrated on this host's Chromium 155
headless, desktop mobile:false viewport, deviceScaleFactor 1"; a clean receipt can claim a 1×1
viewport or a different loopback origin. The *run* parameters are pinned in the send log
(`Emulation` at `:206`), so this is an unvalidated duplicate claim, not a re-run; still a false
green against the claim's scope sentence. Outside the limit's refusal clause.

### S6 (LOW) — per-event fields outside the laws are free

All exit **0, clean 148/148**:

| probe | mutation | unread because |
|---|---|---|
| `a1-nonstart-value-sel.pass.json` | every non-`compositionstart` event gets `value='ZZZ'`, `selStart=selEnd=99` | `value`/`selStart`/`selEnd` read only at `:255` (compositionstart) |
| `a2-key-all.pass.json` | `key='Enter'` on all 40 events | `no-keyboard-events` tests `type`, not `key` (`:257`) |
| `a4-ts-decoupled.pass.json` | every `ts = at + 500` (on the 0.1 ms grid) | `ts` is only grid-checked (`:164`) and near-matched (`:160`), never bound to `at` or the leg window (`:186` uses `at`) |
| `a15-focus-fields.pass.json` | focus events get `data='x'`, `inputType='insertText'`, `isComposing=false`, `key='Tab'` | focus events are excluded from the per-leg derivation (`:217`) |
| `a3-focus-target-swap.pass.json` | every focus event's target swapped `f`↔`ce` | `focus-events-bound` only checks membership in `['f','ce']` (`:259`) |
| `a7-dup-focusin-same-at.pass.json`, `a17-insert-focusin-in-start.pass.json` | duplicate a focusin / insert one in the `start` leg | focus events excluded from per-leg shapes; no event-count check (root cause of S1) |
| `a8-del-focusin.pass.json` | delete one focusin | as above |

`claims.json:25` does not promise these fields beyond the laws it lists, but the counter's header
claims to "re-derive every leg from the page-side raw event log"; a receipt with these fields
rewritten is not a faithful log and still reports `clean`. Note `a4` also means the replay
near-match's `ts` channel is freely settable within the declared quantum-move tolerance. Outside
the limit's refusal clause.

### S7 (LOW) — leg/producer fields and the host version string are unvalidated

All exit **0, clean 148/148**:

| probe | mutation | unread because |
|---|---|---|
| `a12-leg-unread-fields.pass.json` | `legs[1].focusResult='garbage'`, `legs[2].cdpResult={x:1}`, `legs[3].focus='ce'` | `leg-params` (`:169`) checks only `cmd`/`params`/`elapsedMs` |
| `a18-cdp-error-extra-text.pass.json` | append `' EXTRA'` to the `replace-half` error message | `includes` at `:232` |
| `a22-host-version-claim.pass.json` | `host.chromium='Chromium 1.2.3.4 Fake'`, `cdpProduct='HeadlessChrome/1.2.3.4'`, protocol `9.9` | regex-only at `:151`; the claim's limit names Chromium 155.0.8059.84 |

`run-window` (`:166`) only checks a 4 s–600 s interval and does not bind `startedAt`/`finishedAt` to
the page clock; `host.argv` is only parsed for the debug port (`:152-154`); `host.childExit` and
`sweeps.midRun` are not read. Outside the limit's refusal clause.

### S8 (INFO) — argv binding

Executed (`probe-matrix.json.argv`):

| probe | exit | behaviour |
|---|---|---|
| `--prior` last with no value | 2 | usage refusal |
| `--prior --json` (value swallowed by a flag) | 2 | usage refusal |
| `--prior ''` | 2 | `prior-unreadable` |
| `--prior /nope.json` | 2 | `prior-unreadable` |
| missing `--expect-driver-sha256` | 2 | usage refusal |
| `--prior <the receipt itself>` | 1 | `replay-launch-token`, `replay-devtools-url`, `replay-event-timeline` |
| duplicate identical `--prior` twice | 0 | harmless |
| duplicate `--expect-nonce real --expect-nonce bogus` | 0 | **first occurrence wins**; the second is silently ignored |
| duplicate `--receipt real --receipt /nope.json` | 0 | **first occurrence wins**; the second is silently ignored |
| `--json` before the operands | 0 | JSON output |

The duplicate-flag behaviour is an operand-binding hazard (a verifier reading the second value would
misread what was checked), but no frozen command in `claims.json:27,33` duplicates a flag, so it is
not reachable under the predicate. Missing-value and unreadable-prior paths are correctly refused.

## 3. Held — probes the counter refused

| probe | expected | exit | finding ids |
|---|---|---|---|
| `a5a-cancel-input-data-null-to-x.refuse.json` (data `null`→`'x'` where the shape expects `null`) | refuse | 1 | `leg-cancel-data`, `legshape-consistency` |
| `a5b-cancel-input-data-deleted.refuse.json` (data key absent where the shape expects `null`) | refuse | 1 | `leg-cancel-data`, `legshape-consistency` — the absent-vs-null distinction is real for shaped legs |
| `a6-unknown-leg.refuse.json` | refuse | 1 | `event-leg-domain`, `event-leg-window` |
| `a9-stateafter-extra-key.refuse.json` (`stateAfter.junk=1`) | refuse | 1 | `leg-compose-a-state`, `legshape-consistency` |
| `a14-dup-compositionupdate.refuse.json` (non-focus duplicate, renumbered) | refuse | 1 | `leg-compose-a-seq`, `-trusted`, `-data`, `-composing`, `legshape-consistency` |
| `a19-ime-params-extra-key.refuse.json` | refuse | 1 | `ime-call-params` |
| `b1-smoke1-identical.replay.json` | refuse | 1 | all three replay ids |
| `b2-smoke1-nonce-stamps.replay.json` | refuse | 1 | all three replay ids |
| `b3-smoke1-all-ids-fresh.replay.json` | refuse | 1 | `replay-event-timeline` |
| `b6-smoke1-url-trailing-space.replay.json` (fresh uuid + trailing space) | refuse | 1 | `replay-devtools-url`, `replay-event-timeline` |
| `b7-smoke1-url-case.replay.json` (`/DEVTOOLS/`) | refuse | 1 | `devtools-port-binding`, `replay-devtools-url`, `replay-event-timeline` |
| `b8-smoke1-reorder-equal-at.replay.json` (swap two equal-time compose-a events, renumber) | refuse | 1 | `replay-event-timeline`, `leg-compose-a-seq`, `leg-compose-a-data`, `composition-data-chain`, `legshape-consistency` |
| `b10-smoke1-keep-launch-token.replay.json` (launch token kept, rest fresh, times identical) | refuse | 1 | `replay-launch-token`, `replay-event-timeline` |
| `b11-smoke1-keep-browser-id.replay.json` (browser id kept, rest fresh) | refuse | 1 | `replay-devtools-url`, `replay-event-timeline` |
| `b12-smoke1-prior-bid-trailing-space.replay.json` (prior's browser id, trailing space in the URL) | refuse | 1 | `replay-devtools-url`, `replay-event-timeline` |
| `b13-smoke1-prior-bid-uppercase.replay.json` (prior's browser id, upper-cased) | refuse | 1 | `replay-devtools-url`, `replay-event-timeline` |
| `c5-fixture-sha-wrong.refuse.json` | refuse | 1 | `fixture-hash` |
| copied counter + modified driver beside it, **frozen pin** (`c1-copied-modified-driver/`) | refuse | 1 | `fixture-hash` |
| copied counter with **no** driver beside it (`c2-copied-no-driver/`) | refuse | 1 | `fixture-hash` |

So: a replay keeping any of the three checked identifiers is refused; a DevTools URL whitespace/case
variation is refused (the id becomes unparseable, so `replay-devtools-url` fires rather than the match
succeeding); a reorder that keeps the checked shapes is refused; `data` absent-vs-null is
distinguished on shaped legs; unknown legs and extra `stateAfter` keys are refused.

`c4-different-fixture-with-matching-pin.json` with a copied counter, a modified driver **and the
modified driver's own digest as `--expect-driver-sha256`** exits 0 clean
(`c4-copied-modified-driver-pin/counter.out.json`). This is not a defect of the counter under the
predicate: `claims.json:27,33` fixes the pin to the `freeze.txt` driver digest, and the frozen-pin
runs (`c1`, `c2`) are refused. It confirms the fixture hash is only as strong as the pin operand.

## 4. Limit-sentence ledger (`claims.json:42`)

| probe class | accepted? | in the declared not-refused class (identifier rewrite + ≥1 whole-quantum time move)? | contradicts the refusal clause? |
|---|---|---|---|
| b4 / b5 (identity rewrite, **count change**, no time change) | **yes, clean** | **no** | **yes** — every event time is within 0.05 ms of a prior's, yet not refused |
| b3 (identity rewrite, no count change, no time change) | no | no | no — correctly refused by `replay-event-timeline` |
| b1/b2/b10/b11/b12/b13/b6/b7/b8 | no | n/a | no |
| a1–a22 content mutations | **yes for the `.pass` files** | subject not addressed (content, not replay) | no for the replay clause; S2/S5 contradict the surface/scope sentences |
| c4 (substituted pin) | **yes, clean** | subject not addressed | no — the predicate fixes the pin (`claims.json:27,33`) |
| c1/c2/c5 | no | n/a | no |

The frozen not-refused witness (`controls/c1/controls-summary.json`, case
`limit-full-identifier-rewrite`, exit 0) was read, not re-executed. S1 is a *different* accepted
mutation from that witness: it moves no event time, so it is not covered by the witness's
permission, and it contradicts the refusal clause as written. The counter's own comment
(`scripts/check-imecompose-r74.mjs:14-16`) defines the near-match as count-equal, which is the implementation gap the limit
sentence fails to state.

## 5. Residual risk and verification gaps

- **Not an execution oracle (declared).** The counter reads a receipt; every field above is
  self-declared. Nothing here shows the committed scored receipt is fabricated: my baseline
  reproduces `clean` 148/148 on it.
- **S1 is the material one for the scored-run path.** The predicate legs (a)/(b) accept any receipt
  the counter passes; the counter is the only replay guard. b4/b5 show that guard is bypassed by a
  one-event count change with no event-time edit, which the limit's refusal clause says should be
  refused. This does not falsify legs (a)–(d) as measured (I did not run them), but it falsifies the
  frozen limit sentence's completeness and must be recorded, like r73's limit falsification.
- **Battery coverage is check-id coverage, not field coverage.** `negatives-imecompose-r74.mjs:247-253`
  computes `coverageGap` as "every listed check id is the expected id of ≥1 refusal case"; it cannot
  see that `focus-events-bound`'s only case uses target `'BODY'` (`:176`) and never tests the
  `f`↔`ce` swap or a focus-event count change. So `coverageGap=0` coexists with S1/S6. I did not run
  the battery; this is a source reading.
- **Kill power not exercised here.** The 26 semantic mutants
  (`controls/c1/kill-power-r74.mjs:51-58`) cover the laws and polarity, but none tests the
  `nearTimeline` count conjunct, the `includes`-only error check, or the compositionstart value
  binding; [INFERENCE] a mutant that forces `nearTimeline` to ignore count would survive the
  receipt-level probes unless a b4-shaped case is in the mutant's kill set. Not measured (out of
  seat scope).
- **Version/demonstration scope.** S5/S7 show the receipt may claim a different viewport/origin or a
  fake Chromium version; the claim's scope sentence (`claims.json:42`) is a record, not a check.
- **Not in scope / not run:** the driver and its 16-leg execution, predicate legs (b)–(d), the
  battery, the kill-power control, the capability row/note, and the cross-generation prior question.
  I ran only the pinned counter (and byte-identical counter copies) over crafted receipts.

## 6. Evidence index (all under `.ufo/waves/round-74/w1/R74Review1/`)

- `probe-matrix.json` — 39 scored invocations (baseline, 35 crafted, 3 copied-counter) + 10 argv
  probes, with exits, verdicts, finding ids, prior set, counter/receipt digests.
- `baseline.counter.json` — the committed receipt: `clean`, 148/148, findings `[]`, exit 0.
- `<case>.counter.json` — per-case 148-check JSON (e.g.
  `b4-smoke1-all-ids-plus-dup-focus.replay.counter.json`, `a21-refusal-code-changed.pass.counter.json`,
  `a13-cs-value-contains-data.pass.counter.json`, `a20-extra-focus-eval-sendlog.pass.counter.json`).
- `b4-smoke1-all-ids-plus-dup-focus.replay-diff.json`, `b5-smoke1-all-ids-minus-focus.replay-diff.json` — event multisets, `maxAbsAtTsDiff 0`,
  rewritten identities.
- `c1-copied-modified-driver/`, `c2-copied-no-driver/`, `c4-copied-modified-driver-pin/` — copied
  counter (sha `5901d895…`), modified/absent driver, counter outputs.
- `gen-index.json` — fixture template hash replication check (matches the receipt's
  `fixture.sha256`).
- Source citations: `scripts/check-imecompose-r74.mjs` lines 130, 149, 151, 160, 164, 166, 169,
  201-211, 217, 232, 255, 259; `claims.json` lines 25, 27, 33, 42; `freeze.txt` lines 3-4;
  `scripts/negatives-imecompose-r74.mjs` lines 176, 247-253; `controls/c1/controls-summary.json`.

## 7. Tooling

No installs, no upgrades. Only read-only git (`git status --porcelain -- scripts`, `git diff --stat -- scripts`) was used; the scripts diff is empty, so no pinned instrument was touched. Scratch
`/fast/scratch/hyaku/tabi-r74/R74Review1/` held the generator/runner and was removed after the
receipts and counter outputs were written into this directory; the dropped `/tmp` files from the
early argv probe were not cited.
