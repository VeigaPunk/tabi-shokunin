# R81Review1 — C1 legs (a)-(d): counter, pins, false greens

Seat R81Review1 (reviewer, read-only). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Snapshot: D = `a2183a93362259cb574ef3d03b565ee6d2c26599`; the lane then committed
`86cd811a` ("instrument repairs") and `2f4b03ed` during this review. No lane file was written;
every crafted receipt and counter output is under
`.ufo/waves/round-81-seats/R81Review1/`. No tool installs were needed (node v24.21.0 present).

## Verdict in one paragraph

The counter is clean (56/56) on probe2 and on the scored receipt, and the four cold runs are
clean. But the scored receipt's clean verdict is reproducible only under a **post-D amendment of
the frozen prior set** (probe1 → probe1+probe2) and a **post-D rewrite of the freeze manifest**
(`86cd811a`), which also changed the battery instrument (`negatives-showpicker-r81.mjs`
`6964de6f…` → `f7c423c1…`). Under the D-frozen prior set the scored receipt exits 1 with
`prior-set-complete`; the legitimate `--prior probe2` path exits 0 clean **without touching the
frozen file** (verified below). Six receipt-level forgeries pass clean, including a wholesale
transplant of the two cross-origin legs from probe1. The replay rule protects only the four
non-cross legs (32 page events); the two cross-origin legs carry zero page events and are not
replay-protected at all.

## Pins re-derived from the committed bytes

At D every pin matches the D-committed bytes. At HEAD (`2f4b03ed`) eleven pins match the HEAD
freeze manifest and `claims.json` does not (the manifest still pins the D-state file).

| # | path | D pin (freeze at D) | D bytes | HEAD bytes | verdict |
|---|---|---|---|---|---|
| 1 | `scripts/chrome-cdp-showpicker-round81.mjs` | `e35e63c1…` | match | match | unchanged |
| 2 | `scripts/check-showpicker-r81.mjs` | `0d69659c…` | match | match | unchanged |
| 3 | `scripts/negatives-showpicker-r81.mjs` | `6964de6f…` | match | `f7c423c1…` | **changed post-D** |
| 4 | `scripts/kill-power-r81.mjs` | `e381162d…` | match | match | unchanged |
| 5 | `scripts/check-record-drift-r81.mjs` | `76bdb5ae…` | match | match | unchanged |
| 6 | `probes/tabi-r81-probe1.json` | `bac3c6ab…` | match | match | unchanged |
| 7 | `probes/tabi-r81-probe2.json` | `70d12135…` | match | match | unchanged |
| 8 | `controls/c1/prior-set.txt` | `1275fa1f…` | match | `5f8becd3…` | **changed post-D** |
| 9 | `scripts/selftest-r81-gates.mjs` | `85f6bfed…` | match | match | unchanged |
| 10 | `controls/c1/nowork.json` | `9831cd30…` | match | match | unchanged |
| 11 | `controls/c1/forgery.json` | `93c747da…` | match | match | unchanged |
| 12 | `claims.json` | `49c8c96e…` | match | `0b850d15…` | pin is D-state; HEAD file is post-D |

`freeze.txt` itself: D `65c2d970…`, HEAD `a97a10fc…` (the manifest was rewritten, not just the
files it pins). The D-frozen prior-set file contains probe1 only; the HEAD file contains
probe1+probe2.

## Findings, severity order

### F1 (critical) — the frozen prior set and the freeze manifest were amended after D

`86cd811a` adds probe2 to `prior-set.txt` and rewrites its pin in `freeze.txt`, plus a "repair
note" in `freeze.txt`. The scored receipt was produced at `23:14:22Z`–`23:14:54Z`; the prior-set
amendment is later. The claim's own kill rule says "no leg is re-scoped after a scored run" and
the assignment says the priors and pins are frozen (D).

Measured consequence:

- Scored receipt + D-frozen prior set (`1275fa1f…`), no `--prior`:
  `exit 1`, 56 checks, findings `["prior-set-complete"]` (`scored-committed-prior.json`).
- Scored receipt + D-frozen prior set + `--prior probe2`:
  `exit 0`, clean, 56 checks (`scored-frozen-plus-probe2.json`) — **the frozen set is
  sufficient when the command's own `[--prior ...]` is used.**
- Scored receipt + amended prior set: `exit 0`, clean, 56 (`scored-amended-prior.json`).
- probe2 as the receipt under test + amended prior set: `exit 1`, findings
  `replay-event-timeline` (prior #1 is probe2 itself, `absMatched 32`), `replay-launch-token`,
  `replay-devtools-url`, `prior-set-complete` (`rerun-probe2-now.json`). The amendment makes the
  pre-freeze probe2 control non-reproducible.

The build-spec's own seat prompts already use `--prior probe2` and `--prior <cold>`, so the
amendment was unnecessary. Fix: revert `prior-set.txt` and the two pins in `freeze.txt` to the D
bytes and pass `--prior` per run; or record the amendment as a routed r82 defect and take the
honest stop for C1-as-frozen.

### F2 (high) — the battery instrument was changed post-D

`negatives-showpicker-r81.mjs` `6964de6f…` → `f7c423c1…` (two lines:
`receiptPath = realPath` → `path.resolve(realPath)` in the `prior-set-complete` and
`prior-set-unparsable` mirror cases). The change is a cwd/path fix, not a semantic weakening, but
predicate (c) is defined on the frozen battery. The committed `scored/battery-a.json`
(62 cases, 0 failed, `coverage.uncovered []`) and `scored/killpower-a.json` (46 mutants, 46
killed, 0 survivors, 0 crashed) name neither the battery digest nor the receipt they ran on, so
the evidence cannot be tied to the D-frozen instrument.

### F3 (high) — the leg (d) gate registry is green only because of F1

`selftest-r81-gates.mjs` `counter-clean` runs the counter on the scored receipt with
`--prior-set PS` and no `--prior`. Results measured:

- Amended prior set, lane cwd: `clean: true`, 8/8 with `--skip-killpower`
  (`selftest-lanecwd.json`); the committed `scored/selftest-r81-gates.out` records 9/9.
- D-frozen prior set (copy of the selftest with `PS` pointed at the D file), lane cwd:
  `clean: false`, `failed: ["counter-clean","battery"]`; `counter-clean` exits 1 with
  `prior-set-complete`, and the battery then fails 61/62 (`selftest-committed-ps.json`).

So the 9/9 registry, the knowledge note's `recheck:` line and the SCORECARD counting command all
inherit the amended prior set. The note's `recheck:` uses `--prior-set` only.

The selftest is also cwd-sensitive: from a non-lane cwd the battery gate exits 2
`real receipt unreadable` because the battery resolves `--real` against cwd
(`selftest-skipkp.json`). The predicate's command does not pin cwd.

### F4 (high) — the two cross-origin legs are not replay-protected

The scored receipt has 32 page events: 0 in `sp81-cross-origin-nonfile`, 0 in
`sp81-cross-origin-nonfile-disabled`, 5+9+8+10 in the other four legs. `replay-event-timeline`
compares only page-event `ts`/`at`, so it has no evidence for the two cross-origin legs.
`replay-launch-token` / `replay-devtools-url` are satisfied by rewriting the identity fields.

Concrete forgery (`forgeJ.json`): legs 0-1 copied verbatim from probe1, with nonce, ports,
launch tokens, browser ids, profile paths, frame ids and server-log `run` fields rewritten;
legs 2-5 from the scored receipt. Result: `exit 0`, clean, 56 checks. A receipt whose scored run
did not execute the cross-origin legs passes.

### F5 (high) — `cross-origin-nonfile-law` does not bind the child's own execution

Check reads `legs[0].childResult`, `legs[0].cdpEventLog`, `legs[0].parentCrossAccess`,
`legs[0].childActivationBefore/After`, `legs[0].childEvents`, `legs[0].childLate`, plus
`context-binding` (`contexts[]`, `childContextId`). The message is origin-specific and the parent
cannot reach the child document, so a *parent-side* call cannot produce it. But the counter does
not bind `childResult` to a child evaluation, and the child page is unbound:

- `forgeB.json`: the leg's `Runtime.evaluate` of `window.__r3` replaced by `window.__state()`
  (both allowed in `childExprs`); `childResult` untouched → `exit 0`, clean 56.
- `forgeA.json`: `fixture.child.sha256` set to `deadbeef…` and `fixture.patch.body` with
  ` disabled` removed → `exit 0`, clean 56.
- `forgeF.json`: the iframe removed from `fixture.patch.body` → `exit 0`, clean 56.
- `fixture-hash` reads `r.fixture.sha256` against the caller's `--expect-fixture-sha256`, which
  the predicate defines as "the fixture sha256 of that receipt" — self-referential. The child sha
  is shape-checked only. Both hashes are per-run (nonce in the HTML), so the counter could
  re-derive them from the pinned driver + nonce; it does not.

### F6 (medium) — `order-law`'s cross-origin "DISABLED" premise is not in the receipt

Check reads `legs[1].childResult` (SecurityError), `legs[1].cdpEventLog` (0 opens),
`legs[1].childActivation*`, `legs[1].childEvents`, `legs[1].childLate`, and
`legs[2].showPicker` (InvalidStateError immutable-controls) + `legs[2].cdpEventLog` (0 opens).
The same-origin error proves *that* input is immutable. No receipt field carries
`dtd.disabled`: `childState` is `{s, dis, dtValue, dtdValue}` and is never read by the counter
(`forgeE.json` rewrote both `childState`s to `{dtdDisabled:false}` → clean 56). An enabled
cross-origin date input still throws SecurityError (origin check before gesture), so the pair
would pass while proving origin-before-gesture, not origin-before-mutability. The discriminator is
sound only under the driver-pin assumption, and the receipt's `driverSha256` is self-declared
(the selftest, not the counter, hashes the lane driver).

### F7 (medium) — `click-while-open-law` cannot distinguish two choosers from one duplicated event

Check reads `legs[5].clickWhileOpenChoosersBefore/After` (1/2), `legs[5].clickWhileOpenElement`
(`s`), `legs[5].cdpEventLog` (2 `Page.fileChooserOpened`), `legs[5].pageEvents` (one trusted
click on `s`); `cdp-event-log-closed` binds the first open to `triggerSendId` and the second to
`[clickReleaseId, clickReleaseId+3]`. The two open events are byte-identical except
`afterSendId` (same `frameId`, `mode`, `backendNodeId`), and `clickWhileOpenChoosersBefore/After`
are computed by `chooserCount()` from the same `cdpEventLog`, so they are not independent.
`forgeC.json` replaced the second open with a copy of the first and set
`afterSendId = clickReleaseId` → `exit 0`, clean 56. The only discriminator is the integer
`afterSendId`.

### F8 (low) — the answered directory path is only basename-checked

`webkitdirectory-answer-law` reads `answer.setParams.files`, `answer.setParams.backendNodeId`,
`answer.setResult/setError/setSendId`, `uploadDir` (name + per-file size/sha256),
`stateAfter.d` (name/size/type/`webkitRelativePath`) and the `read` event `ret` (`hex:` bytes).
The delivered bytes are bound on both sides (page FileReader bytes and disk sha256), so the claim
holds. But `path.basename(setParams.files[0]) === DIR.name` is the only path check;
`forgeD.json` moved the answered directory to `/tmp/tabi-r81-dir` on both the answer and the
`DOM.setFileInputFiles` send-log entry → `exit 0`, clean 56. The counter cannot prove the
answered directory is the hashed upload dir.

### F9 (low) — unbound receipt fields

`forgeG.json` set every `childEvents[].at` and `childClosedAt` to 0 → clean 56.
`forgeH.json` set `failures` non-empty → clean 56 (`failures` is in the key set but never read).
`forgeI.json` set `priorClickElement` to `not-pad` on the three legs that click → clean 56 (the
page-event sequence still binds the click target, so this one is redundant rather than harmful).
Per-leg `fixtureInputs`, `cdpProduct`, `cdpProtocolVersion`, `triggerResult`, `interceptResult`,
`armResult`, `deferredResult`, `childResult2` are likewise unread.

### F10 (info) — `claims.json` pin is stale at HEAD

`freeze.txt` pins `claims.json` at the D bytes (`49c8c96e…`); the HEAD file is `0b850d15…`
(it records `digestsCommit` and the nonce). The freeze is a D-state snapshot, so this is
consistent at D and stale at HEAD. Not a counter defect; note it so the pin table is not read as
HEAD-current.

## The five attack questions

**(i) Is any check satisfiable by a receipt that did not run the r81 legs?**
The r80 receipt under the r81 counter exits 1 with 30 findings (`schema`, `nonce-shape`,
`driver-pin`, `fixture-hash`, `plan-frozen`, `leg-order`, `leg-records`, every `leg-*`,
`gesture-law`, `cross-origin-nonfile-law`, `order-law`, `webkitdirectory-answer-law`,
`accept-answer-law`, `click-while-open-law`, `no-selection-law`, `intercept-law`,
`fixture-descriptors`, `prior-set-complete`) — refused. But a receipt that ran only the four
non-cross legs and transplanted the two cross-origin legs from probe1 passes (F4, `forgeJ`), and
a receipt whose fixture/child page differs from the driver's passes (F5, `forgeA`/`forgeF`). So
"did not run the r81 legs" is refused only for a *different plan/schema*; it is not refused for
a *different cross-origin execution*.

**(ii) Does `cross-origin-nonfile-law` prove the CHILD's own script threw?**
It proves the receipt's claim, not the execution. The check reads `legs[0].childResult` and the
child context binding, and the message is origin-specific, so a parent-side call cannot produce
the same value (the parent cannot reach the child document; `parentCrossAccess` is checked). But
`childResult` is not bound to any child evaluation (`forgeB`), the child page is unbound
(`forgeA`/`forgeF`), and the whole leg is transplantable (`forgeJ`). Concrete forgery: replace
the `window.__r3` evaluation with `window.__state()` and keep the SecurityError object → clean 56.

**(iii) Does `order-law` really discriminate the order?**
One call throws one exception; the two exceptions come from two separate calls in two fresh
browsers (`legs[1].childResult` SecurityError, `legs[2].showPicker` InvalidStateError). The
same-origin half is self-evidencing (the immutable-controls message). The cross-origin half is
not: no field carries `dtd.disabled` and `childState` is unread (`forgeE`). With an enabled
cross-origin input the pair would still pass, proving origin-before-gesture. The order claim is
sound only if the driver literal `<input type="date" id="dtd" disabled>` is the served page, and
the receipt only *claims* the driver digest.

**(iv) Does `webkitdirectory-answer-law` bind the directory answer to the delivered bytes?**
Yes, to the delivered bytes: page-side `read` rets carry the exact bytes, `stateAfter.d` carries
the `webkitRelativePath` values, and `uploadDir` carries the disk sha256. It does not bind the
*answered directory* to the hashed upload dir (`forgeD`: `/tmp/tabi-r81-dir` passes). The state
text alone would not be enough; the `read` rets and `uploadDir` are what make it a byte binding.

**(v) Does `click-while-open-law` distinguish two real choosers from one event recorded twice?**
No. The two `Page.fileChooserOpened` entries are identical except `afterSendId`, and that integer
is receipt-controlled; `clickWhileOpenChoosersBefore/After` come from the same log. `forgeC`
(second entry = copy of the first, `afterSendId = clickReleaseId`) passes clean 56. The law is
sound only against an accidental duplicate (same `afterSendId`), not against a rewritten one.

## Residual risk

- Every identity, fixture, child-page, state and send-log field is self-declared; the counter's
  only anti-replay is page-event timing, which covers 4 of 6 legs. The disclosed limit ("rewrites
  the identity fields and moves at least absNeed events") understates the escape surface: the
  forgeries above move **zero** page events and pass.
- The order discriminator's disabled premise lives in the driver source, not the receipt.
- The battery/kill-power outputs are summaries without instrument or receipt binding.
- The cold-run evidence is clean (4 runs, distinct nonces, `absMatched 0` against every prior),
  but it was scored under the amended prior set; `cold3`/`cold4` are also clean under the D-frozen
  set (`cold3.score.frozen-priorset.json`, `cold4.score.frozen-priorset.json`), which shows the
  capability itself is real.

## Verification gaps

- I did not run the frozen driver (read-only seat; the L1's scored and cold receipts are the
  evidence). The cross-origin transplant and the fixture/child forgeries are receipt-level, so
  they do not need a browser run.
- The committed `scored/battery-a.json` / `killpower-a.json` were not re-run by this seat; the
  selftest 9/9 was re-run with `--skip-killpower` (8/8) and the committed kill-power summary was
  read. Seat R81Review2 owns the battery/kill-power attack.
- The cold-run receipts live under the seat dirs (outside the walked trees), so
  `prior-set-complete` does not see them; if the L1 commits them into the walked trees, each must
  be a `--prior` or a content-bound exemption.

## Reproduction (all outputs under `.ufo/waves/round-81-seats/R81Review1/`)

```
# baseline: scored receipt, D-frozen prior set + --prior probe2
node scripts/check-showpicker-r81.mjs --lane <ABS> --receipt corpus/evidence/round81/chromium-showpicker/receipt.json \
  --expect-driver-sha256 e35e63c1… --expect-nonce tabi-r81-l1-a2183a933622 \
  --expect-fixture-sha256 d9129edd… --prior-set <D prior set copy> \
  --prior .ufo/waves/round-81/controls/c1/probes/tabi-r81-probe2.json --json
# → exit 0, clean, 56 checks

# D-frozen prior set, no --prior
# → exit 1, findings ["prior-set-complete"]

# forgeries A-J (each on the scored receipt; baseline above plus --tree-exempt-sha256 <scored sha>)
# A child sha + patch body; B __r3 → __state; C chooser duplicate; D /tmp answer path;
# E childState; F iframe removed; G child times; H failures; I priorClickElement; J cross-leg transplant
# → every one exit 0, clean, 56 checks

# r80 receipt under the r81 counter
# → exit 1, 30 findings including schema, plan-frozen, leg-order, every leg-*, every law

# selftest, lane cwd, amended prior set, --skip-killpower → clean 8/8
# selftest copy with PS = D prior set, lane cwd → failed ["counter-clean","battery"]
# selftest from a non-lane cwd → battery exit 2 "real receipt unreadable"
```

## Recommendation

Do not accept the scored verdict as frozen. Either (a) revert `prior-set.txt` and the
`freeze.txt` pins to the D bytes and score with `--prior probe2` (clean 56 — verified), or
(b) record the post-D instrument amendment as a routed r82 defect and take the honest stop for
C1-as-frozen. The capability itself is real (four clean cold runs, two also clean under the
D-frozen set); the defect is the frozen-instrument amendment, not the browser behaviour.
