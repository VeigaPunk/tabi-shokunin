FALSIFIED

The frozen limit sentence is not exact: a relabelled prior with 19 events moved and **one** of its six counted gaps changed passes the pinned counter clean (exit 0, 131 checks, no findings). The minimum is 19 events and 1 gap, not 19 events and 2 gaps. Everything else attacked holds as declared: zero-edit replay is refused; a do-nothing producer reaches legs (a), (b) and (c) (the claim says so); four of the five laws are grounded in the staged S202–S206 lines, with one unsourced error code and one wrong source range.

# R76Critic — attack on `.ufo/waves/round-76/claims.json` (C1-JSDIALOG-R76)

Frozen instruments used unchanged: counter `scripts/check-dialog-r76.mjs` sha256 `505055381ee4…dcf4`, driver `scripts/chrome-cdp-dialog-round76.mjs` sha256 `152ffc116b0b…dd51`, prior set `.ufo/waves/round-76/controls/c1/prior-set.txt` sha256 `30f7418a…7e5b` (17 lines), battery `scripts/negatives-dialog-r76.mjs` sha256 `91874c87…474c`. No instrument byte was touched; all forgeries live in scratch and are copied beside this report. No installs.

Counting command (the frozen one; only `--receipt`/`--expect-nonce`/`--prior` vary below):

```
node scripts/check-dialog-r76.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt <receipt> --expect-driver-sha256 152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51 \
  --expect-nonce <tabi-r76-l1-97bf5d560d03|tabi-r76-exec1-97bf5d560d03> \
  --prior-set .ufo/waves/round-76/controls/c1/prior-set.txt [--prior <scored receipt>] --json
```

Baseline on the committed scored receipt: exit 0, verdict clean, checkCount 131, findings 0, priors 17 (`base-a.json`).

## A1 — do-nothing / look-alike reach (legs a–c)

| attack | receipt | command result | inside the declared limit? |
|---|---|---|---|
| zero-edit relabel of a prior (nonce, launch token, DevTools id, fixture hashes, stamps) | `F1-identity-only.receipt.txt` | exit 1, findings `[replay-event-timeline]` (abs 1.0, gap 1.0) — `F1-identity-only.counter.json` | **outside**; refused |
| relabel + 19 events moved (18 ts-only +0.1 ms, 1 at +305 ms) and **2** of the 6 counted gaps changed | `F2b-two-gaps.receipt.txt` | exit 0, clean, 131 — `F2b-two-gaps.counter.json` | **inside** (19 events, 2 gaps) |
| relabel + 19 events moved and **1** of the 6 counted gaps changed (605.5 → 300.5; one gap added, ownGaps 7) | `F2c-one-gap.receipt.txt` | exit 0, clean, 131 — `F2c-one-gap.counter.json` | **outside as written, accepted** → the defect |
| relabel + 20 events moved and 2 of 6 gaps changed (ownGaps 6) | `F6-tuned.receipt.txt` | exit 0, clean, 131 — `F6.counter.json` | inside |
| the Exec1 leg from a second prior (smoke2), Exec1 nonce, scored receipt as `--prior` | `F5-exec1.receipt.txt` | exit 0, clean, 131 — `F5-exec1.counter.json` | inside |
| battery on the F6 forgery, placed at the scored path in a scratch lane copy | `F6-battery.json` | exit 0, allOk true, 251/251 cases, coverageGap 0, failed [] | inside |

The scratch lane copy is a faithful "forger is the L1" simulation: same counter/driver/battery bytes (counter sha256 `505055381ee4…`), the 17 priors at their lane-relative paths, the forgery at `corpus/evidence/round76/chromium-js-dialog/receipt.json`. The counter's `prior-set-complete` walk excludes the receipt because it carries the expected nonce (`scripts/check-dialog-r76.mjs:214-218`), and the battery's `priorReal` case needs the base to be a prior, which it is at that path.

Battery calibration is timeline-shape-dependent, not provenance-dependent: on F2b (ownGaps 7, matched 18/37) the battery fails `event-types-ts-string` (the stringified event leaves 18/36 = 0.5, so `replay-event-timeline` co-fires) and `replay-timeline-too-few-gaps` (removing the unload event leaves 6 gaps, so the expected refusal does not fire) — `F2b-battery-lane.json` exit 1, 249/251. Run from scratch (not at the scored path) it also fails `replay-nonce-stamps-rewritten` with `prior-set-complete` (`F2b-battery.json` exit 1, 248/251). F6 restores the honest bracket shape (ownGaps 6, absNeed 19, gapNeed 5 — `F6-battery.json` `brackets`) and passes all 251. So legs (a) and (c) are reachable with no Chromium run; leg (b) is reachable with a second relabelled prior. This is exactly what the claim's `limit` declares ("a receipt fabricated from nothing that satisfies every check"; "legs (a)-(c) carry no execution assurance beyond the two driver runs"), so it is a declared limit, not a hidden one.

Before-state confirmed as frozen: no receipt → exit 2; no `--prior-set` → exit 2; the r75 drag receipt under this counter → exit 1 (`schema, nonce-shape, nonce-expected, driver-pin, …`, `r75-under-r76.json`).

The other listed producer shapes reduce to the same hole and add nothing: a modified driver with the pin field rewritten passes because `driver-pin` compares a receipt field (`scripts/check-dialog-r76.mjs:169`) and `fixture-hash` recomputes from the **pinned on-disk** driver (`:171-180`), not from the driver that ran; a stub page plus a rewritten send/event log is a fabricated receipt (F6); a script click is refused only if reported honestly (`trust-law` `:362`, `send-log-allowlist` `:328-333`), and a lying receipt passes.

## A2 — exactness of the limit (the falsification)

The counter's rule (`scripts/check-dialog-r76.mjs:202-211`): `TOL 0.05`, `FRAC 0.5`, `GAP_FRAC 0.75`, `GAP_MIN 50`; `abs = pairMatch/|pairs(receipt)|`, `gap = matchedGaps/|gaps(receipt)|`; refuse when `abs >= 0.5 || gap >= 0.75`, and require `|gaps(receipt)| >= 6`.

Event count is fixed at 37: the per-leg `leg-<name>-seq` checks compare the receipt's per-leg `type@target` sequence to the frozen `SHAPE` (`:85-101`, `:334-349`), so no padding or dropping.

- **19 events is exact.** On the 0.1 ms grid (`event-time-quantum`, `:220-221`) and with `TOL = 0.05` strict, a receipt event matches a prior event only if both `ts` and `at` are equal; matching is the multiset intersection, so the greedy order cannot change the count (every prior is on-grid — the eval-trigger degenerate prior has zero events — and duplicate pairs in the priors are identical copies, min Chebyshev distance 0). Refusal at 19 matched (19/37 = 0.5135 ≥ 0.5); escape at 18 (0.4865). Each escape requires 19 receipt events whose pair is absent from the prior, i.e. 19 moved events. Measured: 18 moved → exit 1, abs 0.5135 (`F3-18-events.counter.json`); 19 → exit 0 (`F2b`, `F2c`); 20 → exit 0 (`F6`). The battery's own brackets confirm 19/18 at ownGaps 6 (`replay-timeline-abs-at-threshold`, `accept-prior-abs-below-threshold`, both passing in `F6-battery.json`).
- **2 gaps is not the minimum.** The denominator is the receipt's **own** gap count (`:207`), not a fixed 6. With ownGaps 6, matched must be ≤ 4 → 2 changed gaps. With ownGaps 7, matched ≤ 5 suffices (5/7 = 0.7143 < 0.75) → **1 changed gap**. F2c moves one event's `at` by +305 ms: the 605.5 ms gap becomes 300.5 ms (one of the six changed) and a 305.1 ms gap appears (ownGaps 7); the other five prior gaps are untouched; the counter exits 0 clean. Zero changed gaps is not reachable: adding a counted gap requires moving a leg-boundary event, which changes the adjacent counted gap, so the true minimum is 1.
- The limit sentence's parenthetical "gap fraction <= 4/6 < 0.75" and "its 6 gaps" are therefore false for a receipt with 7 gaps; the counter header (`scripts/check-dialog-r76.mjs:38-45`) and `claims.json:29` repeat the same wrong minimum. The r76 lesson item 5 ("the counter header and claims.json state … the 19-of-37 events / 2-of-6 gaps escape exactly", `corpus/lessons/round-76.md`) is not closed.
- ts-only moves work (18 of F2c's 19 moves are ts-only); the "ts or at" wording is right. Duplicate prior events give no shortcut: a duplicate still costs one moved position, so 19 stands.
- The round's own limit witness (`controls/c1 limit-nonuniform-retime`, exit 0) moves every event by a different multiple of 0.3 ms; it does not probe the minimum, which is why the 1-gap escape was not seen pre-freeze.

## A3 — laws vs the staged S202–S206

| law | staged ground | verdict |
|---|---|---|
| return-value | `page_handler.cc:1736-1740` (prompt_override empty unless promptText), `local_dom_window.cc:1618-1621` and `:1628` (prompt returns the value only on success, else `String()` = null), `:1551-1584` (confirm returns OpenJavaScriptConfirm), `:1515-1548` (alert is void → undefined), `chrome_client_impl.cc:533-581` | grounded |
| closed-echo | `page_handler.cc:613-635` (opening echoes message/default_prompt/has_non_devtools_handlers), `:637-651` (beforeunload empty message), `:653-662` (closing success/user_input), `web_contents_impl.cc:11690`/`:11695` (same pair to renderer and handlers, dismissal included) | grounded |
| blocking | `chrome_client_impl.cc:518,542,558,576` "Synchronous mojo call" — the renderer blocks until the browser answers; the ≥1 ms witness and mouseup→click ordering are measured (`corpus/knowledge/chromium-js-dialog-runtime-round-76.md:62`, Measured) | grounded; threshold measured, labelled |
| no-dialog | message at `page_handler.cc:1733`; the **code −32602 is in no staged source** (`grep -rn -- '-32602' .ufo/waves/round-76/sources` = 0; also 0 in `corpus/SOURCES.md`), yet `chromium-js-dialog-runtime-round-76.md:30` asserts it inside the sourced bullet | partial: message grounded, code unsourced |
| beforeunload | `web_contents_impl.cc:11679` `BeforeUnloadCanceled()` on `!success`; the `net::ERR_ABORTED` errorText is measured (note line 59, Measured) and appears in `page_handler.cc:915,1069` (navigate abort path, outside the mined lines) | grounded for the abort; errorText measured, labelled |

One false range: `chromium-js-dialog-runtime-round-76.md:17` and `corpus/SOURCES.md:216` claim `Page.pdl:392-397` contains `DialogType` {alert, confirm, prompt, beforeunload}; `sed -n '392,397p' Page.pdl | grep -c beforeunload` = 0 and `sed -n '398p' Page.pdl` = `beforeunload`. The enum's fourth member — the one the beforeunload leg depends on — is one line outside the declared mined range.

No law is a measured-only regularity presented as sourced: the trust law, the coordinate law, the ≥1 ms block and `hasBrowserHandler: true` are all in the note's Measured section (lines 46-70), and the counter header's "Laws (sources in the round-76 note)" (`:31`) points at the note, which labels them. The two provenance defects are the −32602 code and the off-by-one range above.

## A4 — coverage, not quality re-scoring

Base evidence: `git grep -lE 'handleJavaScriptDialog|javascriptDialogOpening' a69f9060 -- corpus/knowledge | wc -l` = 0; `git show a69f9060:SCORECARD.md | grep -c '^| `chromium-js-dialog-linux` |'` = 0; `grep '^| `chromium' SCORECARD.md | grep -Ei 'dialog|alert|confirm|prompt|beforeunload' | wc -l` = 0. The surface (Page.handleJavaScriptDialog, javascriptDialogOpening/Closed, beforeunload navigation abort) is new to the lane; the mouse click is the trigger, not the subject, and no prior capability row covered a dialog. C1 is a capability acquisition on the coverage axis, not a quality re-score of an existing row. Caveat: the row's evidence is a producer-written receipt (F6), which the claim declares; the note's Limits section (lines 84-94) says the counter is not an execution oracle. Leg (d) is still pending (`grep -c '^| `chromium-js-dialog-linux` |' SCORECARD.md` = 0), consistent with the dispatch status.

## Impacted axes

- **calibration** — harmed by the falsified limit minimum (the frozen sentence states a threshold the counter does not enforce) and by the wrong Page.pdl range. This is the r75-routed "limit wording exact" item, still open.
- **depth / provenance** — the −32602 code is asserted in the sourced bullet with no staged source.
- **coverage** — not harmed: the capability is new and the do-nothing reach is declared, not hidden.
- adjacency, operability, freshness — untouched.

## Smallest safe correction (routed; the claim is frozen, so no edit)

1. Restate the limit as the counter computes it: refusal iff the receipt's **own** ≥50 ms gap multiset matches ≥75% of the prior's; with 6 own gaps that needs 2 changed, with 7 only 1; the minimum escape is **19 events and 1 gap**. Add a battery case that adds one gap and changes one (F2c) and requires refusal, or declare it accepted.
2. Fix `Page.pdl:392-397` → `392-398` in the note (line 17) and `corpus/SOURCES.md:216`.
3. Move the −32602 code out of the sourced parenthetical (note line 30): cite the DevTools/protocol error table, or label it measured (13/13) like the errorText.

## Evidence index (beside this report)

`base-a.json`, `postfix-a.json`, `postfix-exec1.json`, `F1-identity-only.receipt.txt`, `F1-identity-only.counter.json`, `F2b-two-gaps.receipt.txt`, `F2b-two-gaps.counter.json`, `F2c-one-gap.receipt.txt`, `F2c-one-gap.counter.json`, `F3-18-events.receipt.txt`, `F3-18-events.counter.json`, `F5-exec1.receipt.txt`, `F5-exec1.counter.json`, `F6-tuned.receipt.txt`, `F6.counter.json`, `F6-battery.json`, `F2b-battery-lane.json`, `F2b-battery.json`, `r75-under-r76.json`, `forge.mjs`, `forge2.mjs`.

Seat receipts are saved as `<name>.receipt.txt` (JSON content) per the wave convention: the counter's `prior-set-complete` walk reads only `*.json` (`scripts/check-dialog-r76.mjs:214-218`), so a seat receipt never races the wave's counting commands. The first copy at 05:11 used `.receipt.json`; R76Scribe flagged that the walk then refused the scored receipt, the files were renamed, and both wave counting commands were re-run clean afterwards — scored receipt exit 0 clean 131 (`postfix-a.json`), Exec1 leg on `F5-exec1.receipt.txt` exit 0 clean 131 (`postfix-exec1.json`). Scratch removed after copying; nothing outside my own `w1/R76Critic/` and the named report path was written; no git/jj mutation.
