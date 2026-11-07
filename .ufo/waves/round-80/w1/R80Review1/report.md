# R80Review1 — independent re-run and attack of C1-SHOWPICKER-R80

Seat: R80Review1 (read-only reviewer). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Judged on: coverage. Milestone: attack C1 legs (a)-(d): re-run the counting command, re-derive the pins, hunt false greens.

**Report hygiene note.** This file lives inside the counter's walked tree, so it deliberately does
not contain the receipt schema literal (the counter's `SCHEMA` constant). It is referred to below as
"the r80 receipt schema". Any report in this tree that quotes that literal makes the counter refuse
the scored receipt with `prior-set-unparsable` (finding B3).

## 1. Snapshot (the lane moved four times during the review)

| item | value |
|---|---|
| base | `e2e12ca58fe2cdbed4aa97af47793b6cfb5a9350` |
| HEAD at first read | `b2560829` (D4) |
| HEAD at second read | `53ecca84` (D5) |
| HEAD at third read | `045fccc5` (D6) |
| HEAD at final read | `a1b14284` (D8) |
| predicate's D (assignment) | `f9ece6562c94` (D3) |
| predicate nonce | `tabi-r80-l1-f9ece6562c94` |
| scored receipt at the third read | sha256 `29f376f1b041aa98c45f7326eab8ba52797ed9e4547b31ab42e6ad4d03225955`, nonce `tabi-r80-l1-045fccc58817`, fixture `2be976df70d04ee1a655308ecc16921310bd4617ce613e7fb88bc997cbcb706e`, 7 legs, 22:33:30Z-22:34:06Z |
| scored receipt at the final read | sha256 `6a15ebaa5f4ee5508984946f5c4eff51a32738fa69432a388a6294e74a63e024`, nonce `tabi-r80-l1-a1b142849e91`, fixture `171c94c2…`, 7 legs, 22:35:45Z-22:36:18Z |
| receipt earlier in the review | `f3a8cdf4…`, nonce `tabi-r80-l1-53ecca8411dc` (D5), fixture `ed350e1e…` |
| receipt before that | `75b47db3…`, nonce `tabi-r80-l1-b25608296008` (D4), fixture `43490c81…` |

The scored receipt was rewritten four times during the review (D4, D5, D6 and D8 runs), each with a
new nonce derived from the new commit. The D3 receipt — the one the
frozen predicate names — was overwritten and no longer exists anywhere in the lane
(`grep -rl 'tabi-r80-l1-f9ece6562c94' --include='*.json'` finds only seat-side copies made by other
seats, never a receipt at the predicate path).

## 2. Verdict on the predicate legs (as of the final snapshot)

| leg | verdict | evidence |
|---|---|---|
| (a) scored run, frozen nonce, clean 57 | **FALSE** | (1) no artifact carries the frozen nonce; the path held `045fccc58817` at the third read and `a1b142849e91` at the final read. Counter with the frozen nonce: exit 1, 57 checks, finding `nonce-expected` only (seat `cur-frozennonce-newcounter.json`). (2) The D5 receipt was refused by the frozen counter on `replay-event-timeline`. (3) The D6 receipt passes the D8 counter clean 57 (`d8-on-d6.json`, preserved copy) — but with the D6 nonce, not the frozen one. (4) The final D8 receipt (`a1b142849e91`, sha256 `6a15ebaa…`) is refused with `prior-set-complete` because a new probe4 sits in the walked controls dir (B4). |
| (b) >=4 cold runs, zero honest refusals | **FALSE / unevidenced** | `scored/cold-runs.txt` does not exist. Two cold receipts exist (`R80Exec1/cold1.json`, `R80Exec2/receipt-cold3.json`), nonces `tabi-r80-cold1-f9ece6562c94` / `tabi-r80-cold3-f9ece6562c94`; both exit 0 clean (57) under the frozen counter and under the current counter. Neither is listed; there are not 4. |
| (c) battery 103/103 + kill power 81/81 on the (a) receipt | **FALSE as frozen** | Frozen battery on the D6 receipt: exit 1, **103/103 cases fail** (the honest case is refused by `replay-event-timeline`). The committed `scored/battery-a.json` itself records `failed: 1` (`replay-below-threshold-accept`). At D8 the battery declares **102** cases (the gap-only case was removed with the gap side) and passes 102/102, coverage 57/57, on the D6 receipt (my D8 rerun); kill power at D8 is **80** mutants, 80 killed, 0 survived, 0 crashed (`killpower-d8.json`). Both counts are below the predicate's 103/81, and both were measured on the D6 receipt, not the frozen-nonce one. |
| (d) row + note + registry + selftest | **FALSE** | `corpus/knowledge/chromium-showpicker-runtime-round-80.md` absent; no `## Round 80 gate registry` in `SKILL.md`; `selftest-r80-gates.mjs` exit 1, failed `pins-match-freeze`, `kill-power`, `record-drift`. |
| C2 (a) drift 0 | **FALSE** | `check-record-drift-r80.mjs` exit 1, **7 mismatches**: `sc-80-numbers`, `log-80-numbers`, `skill-80-numbers`, `lesson-80-numbers`, `report-80-numbers`, `claims-80-numbers`, `scored-80-present`. |
| C2 (d) capability status | **TRUE** | `check-capability-status.mjs` exit 0, mismatches 0, provisional 1. |

## 3. Findings by severity

### B1 — BLOCKER: the frozen predicate's receipt does not exist; the run identity moved four times
The predicate names nonce `tabi-r80-l1-f9ece6562c94` and receipt
`corpus/evidence/round80/chromium-showpicker/receipt.json`. That path now holds nonce
`tabi-r80-l1-045fccc58817` (D6). Leg (a) cannot be true for any current artifact. The kill rule
("any of (a)-(d) false as frozen -> C1 NOT verified") is triggered by the artifact's absence alone.

### B2 — BLOCKER: the instruments were amended after the freeze, and each amendment is labelled "(final)"
`freeze.txt` and `claims.json` were re-pinned at D4, D5, D6 and D8. At D3 (the assignment's D) the pins were:

| instrument | D3 (frozen by the predicate) | D6 | D8 (final read) |
|---|---|---|---|
| `scripts/check-showpicker-r80.mjs` | `f22db0ac…` | `387ec615…` | `90118040…` |
| `scripts/negatives-showpicker-r80.mjs` | `fe91f6be…` | `7371dffa…` | `7371dffa…` |
| `scripts/kill-power-r80.mjs` | `45d71e59…` | `9aef5c16…` | `9aef5c16…` |
| `scripts/check-record-drift-r80.mjs` | `6958ca31…` | `53491bf8…` | `3a2d500b…` |

D6 removed the gap side from the replay refusal entirely
(`refused: np > 0 && absMatched >= absNeed`), and its new limit sentence states the consequence:
"A forger who moves fewer events but shifts EVERY event by a constant offset escapes this rule —
that is the limit." The D5 receipt, refused by the frozen counter (`replay-event-timeline`,
`gapMatched 1 >= gapNeed 1`), passes the D6/D8 counter. D8 then narrowed `prior-set-unparsable`
to `.json` files or files whose first non-space byte is `{` (see B3). Each change is a post-freeze
edit to an instrument the predicate names by digest; the kill rule says "as frozen".

### B3 — BLOCKER (fired during the review; narrowed at D8 by another post-freeze edit): the walked tree poisons the counter
At D5 and D6, `prior-set-unparsable` refused any file under `.ufo/waves/round-80` or
`corpus/evidence/round80` that contained the r80 receipt schema literal and did not parse as JSON.
Two peer files did:

- `.ufo/waves/round-80/w1/R80Exec3/report.md`
- `.ufo/waves/round-80/w1/R80Exec3.md`

The scored receipt on the real lane then exited 1 with `prior-set-unparsable` **only** (57 checks),
so the verdict depended on other seats' prose. D8 (commit `a1b14284`) narrowed the rule to `.json`
files or files whose first non-space byte is `{`, and the real-lane run became clean again. The fix
is correct in direction, but it is a fifth post-freeze counter amendment (B2), and the underlying
hazard remains for any `.json` or `{`-prefixed file a seat writes into the walked trees.

### B4 — BLOCKER (final state): a probe added to the walked tree after the freeze refuses the scored receipt
At 22:39:22Z `.ufo/waves/round-80/controls/c1/probes/tabi-r80-probe4.json` (nonce `tabi-r80-probe4`,
7 legs) appeared in the walked controls directory. The frozen prior set (`prior-set.txt`, sha256
`ecd70ecc…`, three probes) does not list it, and it is neither the receipt under test nor exempted,
so the counter refuses the scored receipt with `prior-set-complete` (seat `final-d8-real.json`). The
scored receipt cannot be clean while probe4 sits in the walked tree: adding it to the prior set would
amend the frozen prior set, and removing it would delete a run artifact. Same class as B3 — the
walked tree is part of the input, and any unlisted schema receipt in it is a refusal.

### H1 — HIGH: the fixture is unpinned; a receipt from a different page passes
`fixture-hash` compares `r.fixture.sha256` with `--expect-fixture-sha256`, and the predicate derives
that argument from the receipt under test ("<fixture sha256 of that receipt>"). The fixture template
lives in `scripts/chrome-cdp-filechooser-round78.mjs`, which is **not** in `freeze.txt`. The fixture
hash cannot be a frozen constant because the nonce is embedded in the page, but the *template* is
unpinned, and the echo makes the check self-referential.

End-to-end demonstration (seat `receipt-mutfx.json`): copied the r80 driver byte-identically
(`cb93935c…`, so `driver-pin` still passes), changed only the `<title>` of the r78 template copy,
ran the driver (new fixture `0374116f…`, all seven legs green), and ran the counter on a clean mirror
lane with the echoed fixture hash: **exit 0, clean 57** (`mutfx-mirror.json`). A receipt produced
from a different page passes every check.

### H2 — HIGH: `answer-law` is a consistency check, not a delivery proof
The check reads only receipt fields: `answer.upload{name,size,sha256}`, `answer.setParams{files,
backendNodeId}`, `setResult {}`, `setError null`, the `read` event's `ret === 'hex:' + ANSWER.hex`,
`stateAfter.s`, `stateAfter.sValue`. Its only cross-binding is `backendNodeId === nodeReport[…][0]`,
which is also receipt-side. The driver does write the upload bytes to its scratch dir
(`chrome-cdp-showpicker-round80.mjs:246`) and computes the sha from them, but the counter never reads
that file.

Forgery (seat `attack-B3-answer-nonexistent-consistent.json`): set `answer.setParams.files` and the
`DOM.setFileInputFiles` params together to `/nonexistent/xyz/tabi-r80-a.txt` (basename preserved) ->
**exit 0, clean 57** on the mirror lane. The path need not exist and nothing need be delivered.
Controls that do fire: wrong `upload.sha256` and wrong `read.ret` both fail `answer-law`.

### H3 — HIGH: the cross-origin child's *result* is unbound
The positive leg's picker **is** frame-bound: `context-binding` verifies the child context by origin
and `isDefault` (frameId != main), and `cdp-event-log-closed` requires the `Page.fileChooserOpened`
event's `params.frameId` to equal that context's frame. Moving the event to the main frame is caught
(seat `attack-D-cross-frame-main.json`: `open-frame`). A parent-side call cannot produce the receipt.

But nothing requires the child's `window.__r` to be read from the child context. Replacing that
`Runtime.evaluate` with another allowed child expression leaves the receipt clean:
`attack-D2-cross-no-child-read.json` and `attack-D3-cross-disabled-no-child-read.json` both exit 0,
clean 57. `childResult`, `childEvents`, `childActivationBefore/After` are unbound receipt fields. For
`sp80-cross-origin-disabled` there is no chooser event at all, so the entire negative law
(InvalidStateError, activation not consumed) can be written into a receipt without the child ever
calling `showPicker`.

### H4 — HIGH: the committed scored outputs are unbound and internally contradictory
`scored/counter-a.json`, `scored/battery-a.json` and `scored/killpower-a.json` record no receipt
hash and no nonce. `battery-a.json` records `failed: 1` (`replay-below-threshold-accept`) while my
re-runs of the same-era receipt give 103/103 green three times; the committed failure therefore came
from a different receipt state that no longer exists. `killpower-a.json` says 81 mutants; the current
kill-power script has 80. None of this evidence can be tied to the (a) receipt.

### M1 — MEDIUM: the frozen replay gap side is timing-fragile
Every committed prior has exactly one gap, so `gapNeed = 1`: any honest receipt with one >= 50 ms gap
equal (within 0.05 ms) to a prior's single gap is refused. The D5 receipt was refused this way
(`gapMatched 1` vs prior #2); the D6 receipt was accepted (`gapMatched 0`, 3 gaps). The frozen rule's
outcome depends on run timing. This is the honest-refusal risk predicate (b) is meant to catch, and it
is the reason the L1 amended the rule at D6 — but the amendment is a post-freeze change (B2).

### M2 — MEDIUM: battery bracket mismatch and flakiness
`replay-below-threshold-accept` builds its prior with `bracketNeed(r) - 1` events computed from the
**receipt's** event count, while the counter computes `absNeed` from the **prior's** count; the gap
side then interacts. The committed run failed; three re-runs on the same receipt passed. The case is
not a stable must-accept.

### M3 — MEDIUM: predicate (d) artifacts absent
No round-80 capability note, no `## Round 80 gate registry` in `SKILL.md`, selftest exit 1. The
selftest's own `pins-match-freeze` gate independently reports the counter mismatch (B2).

### M4 — MEDIUM: C2 not green, and the D8 pin for the drift counter does not match the committed bytes
`check-record-drift-r80.mjs` exits 1 with 7 mismatches, all round-80 record legs. At D8 `freeze.txt`
and `claims.json` pin `3a2d500b…`, the working tree has `3a2d500b…`, but the **committed blob** is
`53491bf8…`: the D8 digests commit pins an uncommitted file. The selftest's `pins-match-freeze` gate
hashes the working tree, so it cannot catch this.

## 4. The five questions

**(i) Is any check satisfiable by a receipt that did NOT run the r80 legs (e.g. the r79 receipt)?**
No: the r79 receipt is refused with 32 findings including `schema`, `plan-frozen`, `leg-order`,
`driver-pin`, `fixture-hash` (seat `G-r79.json`). But the *fixture* is not pinned (H1): a receipt
produced from a different r78 template passes clean 57 when the caller echoes its fixture hash. So
the leg plan is bound; the page under it is not.

**(ii) Does `cross-origin-law` prove the child's own script opened the picker, or could a
parent-side call produce the same receipt?**
It proves the picker opened in the child frame: `cdp-event-log-closed` reads
`Page.fileChooserOpened.params.frameId` and requires it to equal the child context's `frameId`
(`context-binding` verifies that context by origin and `isDefault`, frameId != main). A parent-side
call would carry the main frame id and is caught (`open-frame`). What it does not prove is the
child's *return value*: `childResult` is read from a `Runtime.evaluate` that the counter does not
require to exist (H3).

**(iii) Can a forged receipt pass `answer-law` by writing the expected hex without the file being
delivered?**
Yes. The check reads `answer.upload.sha256`, the `read` event's `ret`, `stateAfter.s` and
`stateAfter.sValue` — all receipt-side constants — plus a `backendNodeId` equality that is also
receipt-side. Changing the delivery path to a nonexistent file (consistently in `answer.setParams`
and the send log) exits 0 clean. The driver's on-disk upload file is never read by the counter.

**(iv) Does `deferred-law` bind the timer's call to the click's activation, or only the result?**
It binds the call, not just the result: `plan-calls` requires the pinned arm expression to be sent
before the mouse press/release, and `cdp-event-log-closed` requires the chooser's `afterSendId` to be
in `[priorReleaseId, triggerSendId]`, i.e. after the trusted release and before the direct trigger.
Moving it before the release is caught (`open-binding`, seat `attack-E-deferred-before-click.json`).
The result's own timestamp is not recorded; success implies a live activation only because Chromium
enforces it, which the receipt itself cannot prove.

**(v) Is `twice-gesture-law` able to distinguish two real calls from one call recorded twice?**
It distinguishes duplication: each chooser's `afterSendId` must equal a distinct trigger send id
(`trigger2SendId > triggerSendId`), and the event log refuses more than two opens. Duplicating the
first event verbatim or with a relabelled `afterSendId` is caught (`multi-open`, seats
`attack-C-twice-duplicate-verbatim.json`, `attack-C2-twice-duplicate-relabelled.json`). Fabricating a
second event wholesale is inside the declared receipt limit.

## 5. Pin re-derivation

At D3 (the assignment's D) all 10 lines re-derived exactly from the D3 blobs: driver `cb93935c…`,
counter `f22db0ac…`, battery `fe91f6be…`, kill-power `45d71e59…`, selftest `96f9e4e3…`, drift
`6958ca31…`, prior-set `ecd70ecc…`, probes `b422513b…` / `0ef62986…` / `ac7084a3…`.

At D8 (final read), 9 of 10 lines re-derive from the HEAD blobs: driver `cb93935c…`, counter
`90118040…`, battery `7371dffa…`, kill-power `9aef5c16…`, selftest `96f9e4e3…`, prior-set
`ecd70ecc…`, probes `b422513b…` / `0ef62986…` / `ac7084a3…`. The tenth, `check-record-drift-r80.mjs`,
**does not**: `freeze.txt` and `claims.json` pin `3a2d500b…`, the working tree has `3a2d500b…`, and
the committed blob is `53491bf8…` (M4). The D8 digests commit therefore pins an uncommitted file,
and the selftest's `pins-match-freeze` gate hashes the working tree so it cannot see the difference.

The pins are no longer the D3 pins the frozen predicate names, and one of them is not the committed
bytes.

## 6. Residual risk and verification gaps

- The counter reads a receipt; every law is a consistency check over self-reported fields. The
  identity relabel is the cheapest forgery: relabelling the nonce consistently across `nonce`,
  `serverLog[].run`, `childServerLog[].run`, `Page.navigate`/`Page.frameNavigated` URLs and the
  `READY_EXPR` in every send log exits 0 clean (seat `attack-A2-nonce-relabel-full.json`). Under the
  D6/D8 counter the gap side is gone, so the relabel alone suffices; the D6 limit sentence itself
  admits that a constant offset on every event defeats the pair rule.
- I did not re-run the driver for the frozen nonce; the D3 receipt no longer exists. I did run the
  driver for the mutated-fixture receipt (H1).
- The lane moved four times during the review (D4, D5, D6, D8) and a scored run was still in flight
  at the final read; every verdict above is pinned to the named receipt hash. The instrument hashes
  are timestamped 22:32-22:36Z.
- The real-lane report pollution (B3) fired at D5/D6 and was narrowed at D8; mirror-lane runs were
  used to isolate every attack from it, and each is labelled as such.
- Predicate (c)'s counts moved with the instruments: the D8 battery declares 102 cases and the D8
  kill-power 80 mutants, against the predicate's 103/81. Both are green on the D6 receipt, not on the
  frozen-nonce receipt.
- No tool installs were needed (node v24.21.0, Chromium 155.0.8059.84 already present). Scratch
  `/fast/scratch/hyaku/tabi-r80/R80Review1/` is removed before yield; receipts were copied into the
  seat dir first.

## 7. Evidence index (seat dir `.ufo/waves/round-80-seats/R80Review1/`)

`counter-frozen-nonce-final.json`, `counter-own-nonce.json`, `cur-frozen-counter.json`,
`cur-own.json`, `cur-own2.json`, `cur-frozennonce-newcounter.json`, `d6-mirror.json`, `d6-frozen.json`,
`d6-real.json`, `d8-on-d6.json`, `battery-rerun.json`, `battery-current.json`,
`battery-frozen-current.json`, `killpower-rerun.json`, `killpower-current.json`, `killpower-d8.json`,
`G-r79.json`, `mutfx-mirror.json`, `receipt-mutfx.json`, `attacks-current.json`,
`attacks-results.json`, `mirror-*.json`, `cold2-*.json`, `coldfrozen-*.json`, `attack-*.json`.
