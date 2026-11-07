FINDINGS

# R74Critic — attack on C1-IMECOMPOSE-R74 / `.ufo/waves/round-74/claims.json`

Seat: R74Critic (leaf, no dispatch). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base
`c72235d6aebca89269809050e983d53df36273f5`, freeze D `ca30e1a3b7b23d56260196ef7af19929f544b80b`
(digests `.ufo/waves/round-74/freeze.txt`, freeze parent `b70e0a27f45d1fe32248e5b14535c2aacfff9ada`).
All scored commands used the frozen arguments: driver pin
`afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc`, 12 PRE priors in the frozen
order (`.ufo/waves/round-74/controls/c1/smoke1..9.receipt.json` then
`degenerate-{dispatch-key,exec-command,script-events}.receipt.json`), and the nonce the leg names.

## 0. Result

The capability claim's core is not refuted (an honest post-D run exists and the note is sourced),
but the frozen `limit` sentence and the `priorSet` completeness sentence are **false**, and the
cheapest passing forgery is **cheaper than the limit declares**. Legs (a), (b) and (c) are all
satisfiable without the claimed run by relabeling two committed receipts of the same surface
(`.ufo/waves/round-74/controls/c1/probe/p2.receipt.json`, `p3.receipt.json`) with five classes of
self-declared-field edits and **zero event-time movement**. No instrument was amended; no run was
performed for the forgeries.

## 1. Counterexamples (scored with the pinned counter + frozen arguments)

### 1.1 The declared witness is real and is the *expensive* path (inside the declared limit)

`w1/R74Critic/forge-rewrite-shift.json` = `smoke1.receipt.json` with the nonce rewritten in every
logged field (nonce, nonceOnPage, server-log query/run, `Page.navigate` URL, ready expression),
`fixture.sha256` recomputed from the pinned driver's template, launch token and DevTools browser id
replaced, and **one event `ts` moved by +0.1 ms**:

    node scripts/check-imecompose-r74.mjs --receipt w1/R74Critic/forge-rewrite-shift.json \
      --expect-driver-sha256 afacee…dc2dc --expect-nonce tabi-r74-l1-ca30e1a3b7b2 <12 PRE --prior> --json
    => exit 0, verdict clean, checkCount 148, findings []     (w1/R74Critic/forge-rewrite-shift.counter.json)

The same rewrite **without** the timestamp move is refused exactly as the limit says:

    node scripts/check-imecompose-r74.mjs --receipt w1/R74Critic/forge-rewrite-noshift.json … --json
    => exit 1, findings ["replay-event-timeline"]             (w1/R74Critic/forge-rewrite-noshift.counter.json)

So the `limit`'s executed witness (`controls/c1/controls-summary.json` `limit-full-identifier-rewrite`,
exit 0) reproduces under the frozen nonce and priors. **Inside the declared limit.**

### 1.2 The cheapest forgery: a relabel of a committed same-surface probe receipt (outside the limit as written)

The lane committed three receipts with schema `tabi-chrome-cdp-imecompose-r74`, the same 16-leg
plan and the same 40 event entries as the frozen SHAPE, in the **pre-freeze** commit
`b70e0a27` (also present at D `ca30e1a3`):

    git ls-tree -r --name-only b70e0a27 | grep 'round-74/controls/c1/probe/'   => 4 paths (p2,p3,p4 + probe-driver.mjs)
    git log --oneline -- .ufo/waves/round-74/controls/c1/probe/                => b70e0a27
    node -e '…' over p2,p3,p4  => schema tabi-chrome-cdp-imecompose-r74, 16 legs, 40 events, driverSha256 16f70203…

They are not in PRE (`controls-summary.json` lists 12 priors; `grep -c probe` on claims.json,
controls-c1.mjs and controls-summary.json is 0). Relabeling **p2** for leg (a) with only:

1. the nonce in every logged field (+ the derived `fixture.sha256`),
2. the self-declared `driverSha256` field → the frozen pin,
3. `predicate`/`imeComposeHypothesis` → `true`/`CONFIRMED`,
4. `legShape` reserialized to the counter's own `derived` (the probe driver named the field
   `allTrusted`, the frozen shape uses `trusted`; a mechanical rename),

and **no** launch-token change, **no** browser-id change, **no** port change, **no** event-time
change, and no structural edit beyond the nonce-bearing fields (server-log query/run,
`Page.navigate` URL, ready expression), passes:

    node scripts/check-imecompose-r74.mjs --receipt w1/R74Critic/min-tabi-r74-l1-ca30e1a3b7b2.json \
      --expect-driver-sha256 afacee…dc2dc --expect-nonce tabi-r74-l1-ca30e1a3b7b2 <12 PRE --prior> --json
    => exit 0, verdict clean, checkCount 148, findings []     (w1/R74Critic/min-p2.counter.json)

The 42 changed JSON leaf paths are exactly these five classes (nonce 6 leaves, driverSha256 1,
fixture.sha256 1, legShape 32, producer verdict 2; verified by a recursive diff of p2 vs the
relabel). The relabel even keeps p2's pre-D wall clock (`startedAt 2026-11-07T02:13:39.889Z`,
70 min before D `2026-11-07T03:23:10Z`); `run-window` only enforces 4 s ≤ duration < 600 s
(`scripts/check-imecompose-r74.mjs:166`), and no check requires `startedAt ≥ D`.

Relabeling **p3** for leg (b) the same way, with the (a) relabel as the 13th prior:

    node scripts/check-imecompose-r74.mjs --receipt w1/R74Critic/min-tabi-r74-exec1-ca30e1a3b7b2.json \
      --expect-driver-sha256 afacee…dc2dc --expect-nonce tabi-r74-exec1-ca30e1a3b7b2 <12 PRE --prior> \
      --prior w1/R74Critic/min-tabi-r74-l1-ca30e1a3b7b2.json --json
    => exit 0, verdict clean, checkCount 148, findings []     (w1/R74Critic/min-p3.counter.json)

Leg (c) on the (a) relabel:

    node scripts/negatives-imecompose-r74.mjs --real w1/R74Critic/min-tabi-r74-l1-ca30e1a3b7b2.json \
      --expect-driver-sha256 afacee…dc2dc --expect-nonce tabi-r74-l1-ca30e1a3b7b2 <12 PRE --prior> \
      --work <abs scratch> --laundered <3 degenerate receipts> --json
    => exit 0, passed 239/239, coverageGap [], failed []      (w1/R74Critic/bat-min-p2.json)

    node .ufo/waves/round-74/controls/c1/kill-power-r74.mjs --lane <lane> \
      --real w1/R74Critic/forge-p2-resigned.json --expect-driver-sha256 afacee…dc2dc \
      --expect-nonce tabi-r74-l1-ca30e1a3b7b2 <12 PRE --prior> --work <abs scratch> --out … --jobs 4
    => exit 0, unmutatedExit 0, forceTrue 148/148, semantic 26/26, survivors [], holds true
       (w1/R74Critic/kp-p2.json)

`forge-p2-resigned.json` is the same p2 relabel with the launch token/browser id also rewritten;
its event content is identical to the minimal p2 (the kill-power property is over the counter/
battery pair, and the minimal p2 passes the same battery 239/239). **This is a look-alike producer
that never ran the pinned driver for the claimed run.** It is enabled by the false prior-set
sentence below, and it is cheaper than the limit's declared witness (no token/browser-id rewrite,
no 0.1 ms move). **Outside the limit as written.**

### 1.3 Other forgery classes, classified

| forgery | evidence | inside/outside the declared limit |
|---|---|---|
| byte-identical replay of a PRE receipt | `controls-summary.json` replay-zeroedit, exit 1 | refused; not a forgery that passes |
| PRE replay + identifiers, no timestamp move | `forge-rewrite-noshift.counter.json`, exit 1 replay-event-timeline | refused |
| PRE replay + identifiers + one 0.1 ms move | `forge-rewrite-shift.counter.json`, exit 0 clean 148 | **inside** the declared witness |
| receipt synthesized from scratch (no run) | the receipt is the whole input; 148/148 checks read only its fields | inside the blanket "not an execution oracle", but not described by the witness sentence |
| modified-driver run with the pin field rewritten | `driver-pin` compares `r.driverSha256` to argv (`check-imecompose-r74.mjs:140`); `fixture-hash` re-hashes the **pinned driver beside the counter** (lines 143‑149), never the executed process | inside the blanket disclaimer, not described |
| script-driven page faking trusted events | `trust-law` reads `isTrusted` booleans from the receipt's event log (line 252); the page recorder is behind the pinned template whose hash is only compared to the claimed field | inside the blanket disclaimer, not described |
| **committed same-surface probe receipt relabel, zero time move** | §1.2: legs (a)+(b) clean 148, battery 239/239, kill power holds | **outside the limit as written**: the limit says the escape needs a token rewrite, a browser-id rewrite and a ≥0.1 ms move, and asserts the prior set is every committed receipt of the surface |

A from-scratch synthesis was not built separately: it is strictly more work than the relabel and
every one of the 148 checks reads only receipt fields, so the relabel is the cheapest witness. The
"receipt from a modified-driver run with the pin field rewritten" row is exactly what §1.2 is (the
probe driver's digest `16f70203…0bc7` was rewritten to the pin); the "script-driven page faking
trusted events" row is analytic from the cited counter lines and needs a custom driver, so it is
not cheaper.

## 2. The false prior-set sentence (the enabler)

`.ufo/waves/round-74/claims.json:20` (`priorSet`):

> "QUALITY 138 boundary: no earlier generation of this capability exists (**no committed receipt
> with schema tabi-chrome-cdp-imecompose-***), so PRE is every committed receipt of the surface."

`.ufo/waves/round-74/claims.json:42` (`limit`):

> "The prior set is PRE only (no earlier generation of this surface exists)."

`corpus/lessons/round-74.md`, "Round-73 routed defects" item 1:

> "this generation's prior set is every committed receipt of its surface (no earlier IME generation)."

claims:20's parenthetical test ("no committed receipt with schema tabi-chrome-cdp-imecompose-*")
and its conclusion ("PRE is every committed receipt of the surface") are false; the lesson's
sentence repeats the false conclusion; claims:42's parenthetical is false on the driver-generation
reading (the probe driver `16f70203ecec…0bc7` is an earlier instrument generation of this surface),
and on the round-generation reading its operative use — that PRE is a complete prior set for the
surface — is still false. The probe receipts are also the *previous driver generation of this
surface*, so the r73 routed defect 1
("ship the cross-generation prior set … as a frozen instrument property",
`corpus/lessons/round-73-verifier-spotcheck.md` §5.1) is not closed: it is declared away with a
test the lane's own committed artifacts fail. The r73 verifier's own disposition was that a
relabelled another-run receipt passing the prior set falsifies the limit sentence (r73
spot-check §2). The same defect recurs here, one step removed: the relabelled receipt is a
same-schema **probe** of this round, not a previous-round receipt.

The pre-freeze controls never test this class: `controls-c1.mjs`, `controls-summary.json` and
`claims.json` contain 0 occurrences of `probe`; the only non-r74 receipt tested is the r73 pinch
receipt (different schema), which is trivially refused (`claims.json:34`).

## 3. Is the `limit` sentence complete and honest relative to what the counter reads?

**No.** Three concrete omissions, each witnessed:

1. **The cheapest escape is cheaper than declared.** The sentence requires rewriting "the launch
   token, the browser id, and [moving] at least one event time by a whole 0.1 ms quantum". The
   §1.2 relabel does none of those three and passes (the source receipt is not a prior, so
   `replay-launch-token` line 157 and `replay-devtools-url` line 159 have nothing to compare it
   to; `replay-event-timeline` line 162 compares only to priors). The sentence's own witness is
   correct but not minimal.
2. **The prior set is not "every committed receipt of the surface"** — see §2. The parenthetical
   test is false by the lane's own committed bytes.
3. **"after D" is not evaluated.** The predicate's legs say the run is after D; the counter reads
   `startedAt`/`finishedAt` only for a 4 s..600 s duration (line 166). The passing §1.2 relabel
   keeps p2's pre-D stamps (`2026-11-07T02:13:39.889Z` vs D `2026-11-07T03:23:10Z`). A forger can
   also rewrite the stamps, but the minimal witness does not need to.

The blanket first sentence ("the counter reads a receipt; it is not an execution oracle") is honest
and does cover these classes in spirit; what is not honest is the specific description of *which*
edits the escape needs and *why* PRE is complete. The sentence must not stand as written.

## 4. Is C1 named by the surface it moves? (coverage)

**Yes, the naming and the 0→1 precondition hold.**

- At base `c72235d6`: `git show c72235d6:SCORECARD.md | grep -c '^| `chromium-ime-composition-linux`'`
  → `0`; `git grep -l 'imeSetComposition' c72235d6 -- corpus/knowledge` → no output (exit 1).
  The six chromium capability rows at base are wheel-scroll (two table entries), hscroll,
  synth-scroll, synth-tap, synth-pinch; none covers IME composition or `Input.imeSetComposition`.
- Knowledge notes do cover `Input.insertText` as a text-entry command (`corpus/knowledge/multi-step-journey.md:34,290`,
  `network-evidence-rung.md:54`), but none covers composition events (`compositionstart`/
  `compositionupdate`/`compositionend`/`isComposing` at base: `git grep -l 'compositionstart\|compositionend\|isComposing' c72235d6 -- corpus/knowledge` → no output). The new note is the
  first. The row name `chromium-ime-composition-linux` names the new ground (composition), not the
  already-exercised plain `insertText`; the note states that split explicitly
  (`corpus/knowledge/chromium-ime-composition-runtime-round-74.md:15-18`).
- Leg (d)'s SCORECARD row is still 0 at HEAD (`grep -c '^| `chromium-ime-composition-linux`' SCORECARD.md`
  → `0`), i.e. the row is pending integration; the note is committed
  (`git ls-files corpus/knowledge/chromium-ime-composition-runtime-round-74.md` → tracked) and its
  `source:` line cites S187–S193 (line 1).

No coverage-naming falsification. The capability's *demonstration* is also not refuted: the
committed (a) receipt is a real post-D run (`startedAt 2026-11-07T03:23:16.500Z`, 6.5 s after D's
`00:23:10-03:00`; counter exit 0 clean 148, `w1/R74Critic/scored-a.counter.json`) and 9/9 pre-freeze
runs were clean (`controls/c1/prefreeze-summary.json`).

## 5. Is the `sourced` field true?

**Yes — every sentence in the note's sourced sections is grounded in the staged S187–S193; the
only inference is the one the note labels as inference.**

| note claim | staged source, re-read | verified |
|---|---|---|
| `insertText` emulates emoji/IME text; `imeSetComposition` sets candidate text; empty string cancels | S187 `Input.pdl:141-162` (`sed -n '141,162p'`) | yes, including line 149's un-declared `imeCommitComposition` comment |
| both commands route to the focused render widget, call `Focus()`, `ImeCommitText`/`ImeSetComposition`; half-replacement refused `-32602` before any renderer call; no key event | S188 `input_handler.cc:1281-1359` | yes; refusal text at 1345 |
| no focused element → `SetComposition` returns; `compositionstart` data = frame selected text (line 1084); `CommitText` 694-705 replaces/inserts; `InsertText` 924-932 inserts with a null target; `compositionend` via `DispatchScopedEvent` (409) | S189 `input_method_controller.cc` | yes (all cited lines re-read) |
| `EventTarget::DispatchEvent` sets `SetTrusted(true)` | S190 `event_target.cc:868` | yes |
| `DispatchScopedEvent` only sets target and enqueues; the simulated Enter caller sets trust first (175-176) | S191 `event_dispatcher.cc:88-93,172-176` | yes |
| queue dispatch calls `EventDispatcher::DispatchEvent(*node,event)`, no trust change | S192 `scoped_event_queue.cc:76-79` | yes |
| `DispatchBeforeInputInsertText` returns `kNotCanceled` when target is null (1772-1773) | S193 `editing_utilities.cc:1765-1778` | yes |

The focus-event deferral is explicitly labeled **inference** in the note (`:75-77`) and is not in
the claim's `sourced` field; the no-focus `insertText` *target choice* is labeled measured, and the
`limit` repeats that. Staged source digests match `FETCH.txt` (`sha256sum` of the seven staged files
= the FETCH.txt values). SOURCES rows S187–S193 exist with matching line scopes
(`corpus/SOURCES.md:201-207`).

## 6. Satisfiable without the claimed work / unsatisfiable by an honest run

- **Satisfiable without the claimed work: yes, witnessed.** Legs (a), (b), (c) as frozen are all
  satisfied by the §1.2 probe relabels and the battery/kill-power runs over them, with no pinned-
  driver run for the claimed nonces. A from-scratch synthesis (the §1.1 rewrite) is equally
  accepted because every one of the 148 checks reads only receipt fields.
- **Unsatisfiable by an honest run: no finding.** The committed (a) receipt is a real post-D run
  and clean 148; 9/9 pre-freeze runs were clean; the 1 ms→0.05 ms tolerance lesson shows the
  near-match + quantum checks were measured against the 36 honest pairs (`corpus/lessons/round-74.md`,
  Mistake m3). I found no honest-run refusal.

## 7. Impacted axes

| axis | impact |
|---|---|
| **calibration** | **harmed** — the frozen limit misstates the cheapest escape and asserts a false prior-set completeness; the declaration is materially incomplete |
| **quality** | **harmed** — the record (`claims.json:20,42`; `corpus/lessons/round-74.md` routed defects 1) carries a false test ("no committed receipt with schema …") and a false conclusion ("every committed receipt of the surface") |
| **depth** | **harmed** — the replay guarantee is weaker than stated: a committed same-surface receipt relabeled with five self-declared-field classes and no timestamp move passes all 148 checks, the 239-case battery and the 174-mutant kill power (148 force-true + 26 semantic) |
| coverage | not lowered: the capability was demonstrated by 9/9 honest pre-freeze runs plus a clean post-D scored run, and the note is sourced; but the coverage claim cannot stand *as written* until the prior-set/limit sentences are corrected |
| operability, freshness, adjacency | unchanged (no claim touched) |

## 8. Smallest safe correction (no instrument amendment)

Because the predicate, counter, pins and kill rule are frozen and must not be amended this round,
the only available correction is record-level, in the r73/QUALITY-138 form:

1. Append-only correction (QUALITY entry + SCORECARD round-74 note + `corpus/lessons/round-74.md`):
   strike/qualify the two false sentences — `claims.json:20`'s "no committed receipt with schema
   tabi-chrome-cdp-imecompose-*" / "PRE is every committed receipt of the surface" and the lesson's
   "this generation's prior set is every committed receipt of its surface" — and record the
   counterexample: `.ufo/waves/round-74/controls/c1/probe/p2`/`p3` are committed same-schema,
   same-plan receipts outside PRE; a relabel of them (nonce + fixture hash + `driverSha256` field +
   producer verdict + `legShape`, **no** token/browser-id rewrite, **no** event-time move) passes
   legs (a)+(b) clean 148, battery 239/239 and kill power 148/148 + 26/26.
2. Extend the `limit` in the closure record (not the frozen file) with: (i) the cheapest escape
   needs no timestamp move when the source receipt is not a prior; (ii) `startedAt` is not bound to
   "after D" by the counter; (iii) `driver-pin`/`fixture-hash` are self-declared fields compared to
   the pinned driver beside the counter, never to the executed binary.
3. Route, for a future generation only, the prior-set inclusion of the three committed probe
   receipts (or a cross-generation prior set) as a frozen instrument property — the same routing
   form r73 used. Do not amend this round's frozen instruments.

With that correction the verifier can apply the r73 disposition: the falsified limit weakens the
instrument's replay guarantee, not the demonstrated capability. Without it, the claim's limiting
sentence is false as frozen.

## 9. Receipts (beside this report)

- `forge-rewrite-shift.json` (sha256 `541bea49…4aee`) + `.counter.json` (`1e6c74b7…6dea`) — declared-limit witness, exit 0.
- `forge-rewrite-noshift.json` (`302f6c44…4474`) + `.counter.json` (`ba30d3cc…263f`) — exit 1 replay-event-timeline.
- `min-tabi-r74-l1-ca30e1a3b7b2.json` (`9c7e6ae7…34c1`) + `min-p2.counter.json` (`40aadd07…2274`) — leg (a) relabel, exit 0 clean 148.
- `min-tabi-r74-exec1-ca30e1a3b7b2.json` (`5e38485b…ed76`) + `min-p3.counter.json` (`d4869020…d8d0`) — leg (b) relabel with 13 priors, exit 0 clean 148.
- `bat-min-p2.json` (`b50f5642…360d`) — battery 239/239, gap [], failed [].
- `forge-p2-resigned.json` (`d700af44…3923`) + `kp-p2.json` (`b77adcf2…27d8`) — kill power holds, 148/148 + 26/26, survivors []. (`kp-p2.json`'s `real` field names the scratch path used at run time, now removed; the receipt beside this report is byte-identical, sha256 `d700af44…3923`.)
- `scored-a.counter.json` (`63531f11…5a30`) — committed (a) receipt clean 148 (post-D).

## 10. Notes

- Tooling: none installed or upgraded. Scratch `/fast/scratch/hyaku/tabi-r74/R74Critic` used and
  removed on exit; receipts copied here first. No git/jj mutation was performed (read-only `git show/
  ls-tree/log/grep/diff` only; no fixture repo created).
- Every command above was run in `/home/vgpnk/Projects/shokunin/tabi-shokunin` or the scratch; exit
  codes are the observed ones. Unrun checks are not claimed as passed.
