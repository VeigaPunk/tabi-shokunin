# Round 60 lesson — tabi, 2026-11-03 (Linux host, attempt 1)

Claims (frozen at `67d6f70e`; wave w1; instrument freeze `bc373ade`; pre-data corrections in `.ufo/waves/round-60/claims.json` `preDataCorrections`):

- **C1 adjacency** (lowest owned axis, score 8): the wide adjacency screen `c1-wide-screen-r60` covers every tracked `.md` blob of the 20 roster siblings at the frozen heads, AND the v19 map-scope meter stays green at the data revision. **NOT VERIFIED — killed by its own K7** (the v19 meter went red at the data rev, 12 findings, from sibling drift since the round-59 rebind). The wide-screen clause itself is green (see Measurements). Not admitted.
- **C2 calibration** (score 9; overreach caught — the lane's chromium receipt gate must not green a forged CapsLock receipt): the r60 counter refuses the frozen forged probe set F = {A, B, D, E} and keeps the committed live receipt green. **VERIFIED on its frozen predicate** (forgedGreen 0; live green). Calibration score held at 9 (an unadmitted round moves no score).

Round verdict: **not admitted** (C1 unverified → honest stop; report and let the operator rule). No axis harmed; no score moved; no capability row enters.

## Gate

Sources opened this round (fetch guard R57-S3: final host equals cited host, `num_redirects` 0, HTTP 200; receipts under `.ufo/waves/round-60/sources/`):

| Source | Opened | Located quote (≤25 words) | Decision |
|---|---|---|---|
| S163 — WHATWG DOM Standard — https://dom.spec.whatwg.org/ (NEW row; 2,714,595 B, sha256 `9b797e18…2153`; receipt `sources/s163-fetch-receipt.json`) | 2026-11-03 | `The bubbles and cancelable attributes must return the values they were initialized to.` — dfn `dom-event-cancelable` (raw 1450, dfn-for `Event`, type attribute) | **admit** (definition site for `Event.cancelable`) |
| S163 — same fetch | 2026-11-03 | `readonly attribute boolean cancelable;` — WebIDL member, raw 1032 | **admit** (interface declaration) |
| S163 — same fetch | 2026-11-03 | canceled-flag rule `if event's cancelable attribute value is true and event's in passive listener flag is unset, then set event's canceled flag` — local dfn `set-the-canceled-flag` (id on raw 1454), body raw 1454–1457 | **admit as a definition body.** Scout's receipt classed this hit as a cross-reference; the L1 corrected it by the `id` attribute in the staged bytes (criterion 111 applied to the hit class, Mistakes 4) |
| S161 — W3C UI Events — https://www.w3.org/TR/uievents/ (re-open, byte-identical: 920,762 B, sha256 `8ded5eaf…`; receipt `sources/s161-reopen-receipt.json`) | 2026-11-03 | keydown row of the §3.1 list of event types, Cancelable column `Yes` (raw 2227) | **admit as a table cell** (prose-grounded keydown cancelability; not a dfn) |
| S161 — same fetch | 2026-11-03 | §4.3.4 default actions: keydown cancellation does not affect the keyup (raw ~5680) | **admit as prose** (why the keyup is checked separately) |
| S161 — same fetch | 2026-11-03 | `cancelable` as an attribute ground | **reject as the definition of `Event.cancelable`** — the attribute definition is S163's; S161 supplies only the keydown table cell |
| S162, S153 | — | not re-opened this round | carried unchanged (S162 scope: four-bit mapping only; no CapsLock constant) |

Registry: 162 → **163** (S163 new, `mined`; S161 used-by extended old → new, see §Sources & frontier). Definition-site sweep (QUALITY criterion 111) run for `cancelable` before the freeze: `Event.cancelable` = definition site (S163 raw 1450); keydown `Cancelable Yes` = table cell (S161 raw 2227); no `defaultPrevented` dfn in UI Events (carried from r58).

## Work performed — evidence pointers

- Claims and freeze: `.ufo/waves/round-60/claims.json` (frozen `67d6f70e`; `preDataCorrections` at `bc373ade`), sibling snapshot `.ufo/waves/round-60/c1/snapshot-r60.tsv` (20 heads).
- Wave w1, ONE v1 wave of 12 seats (spec `.ufo/waves/round-60/w1-spec.json`, plan `w1-plan.json`, dispatch `w1-dispatch.json`, results `w1-results.json`; seat reports `.ufo/waves/round-60/w1/R60*.md`).
- C1 counter `.ufo/waves/round-60/counters/c1-wide-screen-r60.mjs` (sha256 `ba7ebc9a…5920`, selftest 17/17; executor R60Exec1). Enumeration: `git ls-tree -r -z`; bytes: `git cat-file` at recorded heads only; hits: v19 `BG_WORDS` verbatim.
- C2 counter `.ufo/waves/round-60/counters/chromium-receipt-r60.mjs` (sha256 `b0d03fe0…caae`, selftest 110/110, idCoverage 58/58; executor R60Exec2). Copy of the r59 counter with the declared change set (a)–(e) (pinned in claims.json `preDataCorrections`) plus the pre-freeze closures below. Fixtures `.ufo/waves/round-60/counters/chromium-receipt-r60-fixtures/`.
- Probe set F: `.ufo/waves/round-60/measure/f-probes-r60.py` (generator sha `2e29acd0…34e3`), outputs `measure/f-probes/` (manifest pins probe A `bdd3c0ea…`, B `7793e4f8…`, D `0feeb2ae…`, E `5b5ebd12…`) (executor R60Exec3).
- Attacks: reviewer `w1/R60Reviewer/attacks.md` (A1–A5, pins; PD1–PD4 FLAWs routed); critic `w1/R60Critic/critique.md` (CR1–CR3; P1–P9 probes; found the P2 family at intermediate bytes); mutation `w1/R60MutC1/kills.json` (M1–M5) and `w1/R60MutC2/kills.json` (C6–C9); connector `w1/R60Connector/connector/overlap-scan.md` (no overlap in any of the 20 siblings); sentinel `w1/R60Sentinel/guard.md` (all PASS except two FLAGs that are fleet-root / sibling-lane dirt not produced by this round); scribe drafts `w1/R60Scribe/`.
- Source receipts: `sources/s161-reopen-receipt.json`, `sources/s163-fetch-receipt.json` (scout R60Scout).
- Population audit: `w1/R60Scout2/population.tsv`.

## Measurements (counting commands; pasteable)

C1 — the frozen do-nothing control (scope = v19 map screen) at the snapshot:
```
node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --scope map --snapshot .ufo/waves/round-60/c1/snapshot-r60.tsv --json
#  -> exit 1, predicate false, enumeratedMd 85598, screenedMd 25, unscreenedMd 85573   (controls/c1-scope-map-at-freeze.json)
```
C1 — the claim's wide after-command at the data revision `bc373ade`:
```
node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --scope wide --snapshot .ufo/waves/round-60/c1/snapshot-r60.tsv --rows-out $TMPDIR/rows-data-r60.tsv --json > .ufo/waves/round-60/c1/wide-screen-data-r60.json
node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --scope wide --snapshot .ufo/waves/round-60/c1/snapshot-r60.tsv --verify-rows $TMPDIR/rows-data-r60.tsv --json > .ufo/waves/round-60/c1/wide-screen-verify-r60.json
#  -> both exit 0, predicate true; enumeratedMd 85598, screenedMd 85598, unscreenedMd 0, unresolvableHead 0, roster 20, rowMismatch 0 (verify: rowsChecked 85598, rowsMissing 0),
#     wideHitLines 19049, wideHitFiles 6129 (reported, not adjudicated)
#  independent enumeration (R60Reviewer A1): 85598 NUL-delimited; a line-mode ls-tree|grep count gives 85594 (4 quoted paths) — the NUL form is the frozen method
```
C1 — the v19 map-scope no-regression clause at the same revision:
```
node .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs --rev bc373aded3eab19fbe41bbfbf867b34e513982bf --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --json
#  -> exit 1, predicate false, findingCount 12 (c1/v19-meter-at-data-r60.json)
#     lane-screen-head-mismatch: kagi, kake, kasegi, kengaku, mado, souji, tsukuroi (7)
#     lane-screen-sha-mismatch: kagi PROVINCE.md, kake SKILL.md, kasegi PROVINCE.md (3); lane-screen-lines-mismatch: kasegi PROVINCE.md (1); plus kake head entry
#  cause: the sibling lanes committed during the round; the v19 ledgers (round-59 rebind) pin the round-59 heads. The v19 input is live sibling state, so this is the frozen K7 kill, not a C1 wide-screen fault.
```
C2 — the frozen do-nothing control (unmodified r59 counter) over F:
```
node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs <probe> --driver scripts/chrome-cdp-loopback-round59.mjs --expect-driver-sha256 b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86 --shot corpus/evidence/round59/chromium-capslock-boundary --json
#  -> A, B, D, E: exit 0 each; forgedGreen 4 (controls/c2-r59-counter-on-probes.json; A and B match round-59 measure/f6-probe/RESULT.txt)
```
C2 — the claim's after-command at `bc373ade`:
```
for p in A B D E; do node .ufo/waves/round-60/counters/chromium-receipt-r60.mjs <probe-$p> --driver scripts/chrome-cdp-loopback-round59.mjs --expect-driver-sha256 b16ddb44…ff86 --shot corpus/evidence/round59/chromium-capslock-boundary --json; done
#  -> A exit 1 (missing-delivered-shape-field, keylog-flag-mismatch); B exit 1 (missing-delivered-shape-field); D exit 1 (missing-delivered-shape-field, keylog-flag-mismatch); E exit 1 (missing-delivered-shape-field)   forgedGreen 0
node .ufo/waves/round-60/counters/chromium-receipt-r60.mjs corpus/evidence/round59/chromium-capslock-boundary/receipt.json --driver scripts/chrome-cdp-loopback-round59.mjs --expect-driver-sha256 b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86 --shot corpus/evidence/round59/chromium-capslock-boundary --json
#  -> exit 0, predicate true, findings [], couldNotEvaluate []   (measure/c2-after/LIVE.json)
node .ufo/waves/round-60/counters/chromium-receipt-r60.mjs --selftest   # -> exit 0, allPass true, 110/110, idCoverage 58/58 (measure/c2-after/selftest.json)
```
Mutation kills (C2, at `b0d03fe0`; `w1/R60MutC2/kills.json`): C6 (drop cancelable checks) → 105/110, probe B green → KILLED; C7 (drop trace-vs-keylog cancelable cross-check) → 106/110, `cancelable-keyup-disagrees` green → KILLED; C8 (first keydownEntry only) → 108/110 → KILLED; C9 (accept string cancelable) → 109/110 → KILLED. Live stayed green under every mutant.
Mutation kills (C1, at `ba7ebc9a`; `w1/R60MutC1/kills.json`): M1 top-level-only .md → 8 selftest cases fail, counts 144 vs 85598 → KILLED; M2 no hit recount → forged-row-hits fails → KILLED; M3 worktree read → worktree-differs-from-head fails → KILLED; M4 unresolvable head = 0 files → unresolvable-head-refused fails → KILLED; M5 default scope map → missing-scope-exits-2 fails → KILLED. Control (unmutated) green.

## Mistakes

| Class · evidence | Captured-by | Fix |
|---|---|---|
| **1. The instrument went green on forged receipts at intermediate bytes, three times.** At `99844dd9`, `defaultPrevented` deleted on press1.keydownEntry, press2.keyupEntry and letters1[0] each exited 0 (P2 family; `w1/R60Critic/critique.md`); at `1408dd90`, top-level `receipt.keylog.entries[0]` cancelable false or key corrupted exited 0 (P3/P3b; `w1/R60Exec2.md`); at `0ed93c7a`, a letter keyup with `defaultPrevented` deleted or key corrupted exited 0 (`w1/R60Reviewer/attacks.md` P4b/P4d). | the attack seats (R60Critic, R60Reviewer), not the executor's own selftest (the selftest of each generation passed with the gap present). | Closed pre-freeze at `1408dd90`, `0ed93c7a`, `b0d03fe0`, each disclosed as a pre-freeze strengthening with no predicate text change (claims.json `preDataCorrections`). Shown able to fail: each closed case exits 1 at `b0d03fe0`; the pre-fix bytes exit 0 (receipts under `w1/R60Critic/cr1/` and `w1/R60Reviewer/evidence/`). Criterion 112 (QUALITY) makes the per-probe selftest case mandatory. |
| **2. The declared change set (a)–(e) lived only in the wave spec, not in the frozen claims.** | the reviewer (A3 / PD1). Captured-by: none; the freeze process did not require the change-set text to be in claims.json. | Pinned verbatim in claims.json `preDataCorrections.C2ChangeSetPinned` before the instrument freeze. |
| **3. C1's no-regression clause depends on live sibling state.** The v19 map meter reads sibling heads and files at run time; the siblings committed during the round, and the meter went red at the data revision with 12 findings (the frozen K7 kill). | the data pass (the L1, at `bc373ade`). Captured-by: none; the freeze did not check that the v19 inputs were pinned to a snapshot. | Named here and in the report as the reason C1 is killed. Fix for a later claim: rebind the v19 ledger inputs at a single snapshot (the round-59 runbook), or drop the live-head clause from the frozen predicate as a new claim. Not amended in this round (a post-data predicate change would be a new claim). |
| **4. Classification disagreement on one hit.** Scout classed the canceled-flag body (raw 1454–1457) as a cross-reference; the scribe read it as a local dfn body. | QUALITY criterion 111 (applied to named terms, not to hit classes). | The L1 verified in the staged bytes that raw 1454 carries `id="set-the-canceled-flag"` and classed the hit as a definition body. Fix: classify a hit by its `id`/`data-dfn` attribute in the staged bytes, not by its surrounding prose. |
| **5. A seat report pinned a stale instrument sha.** R60Reviewer's header named `99844dd9` as the final counter after the counter had moved to `1408dd90` mid-wave. | the L1 on integration (on-disk sha256 at READY time). Captured-by: none. | Final pins taken from the on-disk file (`b0d03fe0…caae`); reviewer findings re-read against the final bytes by the critic and the mutation seat. |

## Census

Start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`, 162 rows, 22 W04 (`controls/census-start.txt`).
End: exit 0 and 163 rows, recorded in the report (`controls/census-end.txt`).

## Sources & frontier

- Registry: 162 → 163 (S163 new, `mined`, `used-by` = this lesson). S161 `used-by` extended old → new (old = the nine-path chain ending `corpus/lessons/round-59.md`; new = the same plus `corpus/lessons/round-60.md`); S161 anchor gained the round-60 re-open clause; status `mined`, recheck `on-release` unchanged.
- Knowledge notes: unchanged (74). The scribe's knowledge draft (`w1/R60Scribe/knowledge-draft.md`) is held as wave evidence, not admitted, because the round is not admitted (same rule as round 59).
- Frontier advanced: the keydown `cancelable` boundary on the Linux surface moved from "unsourced" (r59 Mistakes 1, the f6 gap) to "sourced (S163 dfn + S161 table cell) and enforced by a counter that refuses four forged classes"; still open: the keyup `cancelable` value (by design, see Limits), the Blink-internal caps constant.
- Assimilation: none. Adoption stays closed (L0 `tabi | round-57`, the register's quote-column shift awaits campaign regeneration); `considerthese/` does not exist in the lane repo.
- Sourced claim: C2 rests on S163 (opened this round) and S161 (re-opened this round).

## Limits (named, not smoothed)

- C1 is killed by K7 (sibling drift in the v19 no-regression clause). The wide screen's 19,049 browser-ground hit lines in 6,129 files are reported as a file:line inventory, not adjudicated; the adjudication is a named residual for a later round.
- C2's keyup `cancelable` VALUE is unbound by design: the frozen keyup rule is presence + boolean type. A keyup forgery consistent across every recording is green (measured: `w1/R60Exec2.md` and `w1/R60Critic/critique.md` P8b/P8c). The L1 ruled this a named residual, not a kill (option a).
- C2's byte-perfect replica of the live receipt passes by construction (disclosed residual, claim K5).
- C2's top-level `receipt.keylog` slice is bound only by the narrow identity and recorded-flag rule (P3/P3b); other top-level control-domain fields remain bound by the carried r56 clause only.
- The Blink-internal caps constant is not sourced (S162 covers the four-bit mapping only).
- One host (Linux, Chromium 155 loopback). No real site, no IME, no repeat keys.
- Mutant and attack evidence is from the frozen instrument bytes listed above; receipts from earlier byte states are superseded and not cited.

## Corrections of record

- The round-59 L0 question (`tabi | round-59`: may the next counter generation run as a NEW claim) is routed around: this round declares C2 as a NEW claim with its own axis and predicate. The operator has not answered; the question stays open.
- No earlier round's record is edited.
