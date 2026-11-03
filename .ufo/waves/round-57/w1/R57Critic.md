# R57Critic — attack on the frozen C1/C2 kill rules and do-nothing controls

Round 57 w1, tabi-shokunin. Written BEFORE any data pass (the whole wave tree is
still untracked; the FREEZE commit has not happened as of this writing). Method:
read-only. Sources: `.ufo/waves/round-57/claims.json` (frozen),
`.ufo/waves/round-56/counters/{c1-adjacency-host-v16,chromium-receipt-r56}.mjs`
(the frozen instruments whose semantics v17/r57 inherit),
`.ufo/waves/round-57/counters/c1-adjacency-host-v17.mjs` (authored mid-attack;
diffed against v16), `scripts/chrome-cdp-loopback-round57.mjs` (authored
mid-attack; header still r56), sibling repo bytes via `git cat-file` only.
Evidence receipts: `../critic/c1-v16-live-rerun.json` (+ `.stderr.txt`) — a live
read-only re-run of the v16 meter at the baseline during this attack — and
`../critic/v16-v17-observed.diff`.

Verdicts up front: **C1 kill rule HONEST (with one named soft cell), C1
do-nothing control HOLDS and is self-strengthening; C2 kill rule HONEST only if
three pre-freeze requirements land in the r57 counter/runner (keylog content
checks, chord focus/targetId witness, explicit field2-at-Enter resolution), C2
do-nothing control HOLDS for every cheap no-op with the pre-declared
fabrication residual; cross-refusal symmetry is structurally sound.**

---

## C1 — adjacency meter, v17 generation

### (a) Can the -r57 ledger rows be edited to match a moved sibling head without re-deriving from snapshot bytes?

What the cells actually detect (v16 `verify()`, byte-identical in v17 — the
observed diff touches no `verify()` line):

- `head` (delta `lane` row, col 9): strict `!==` against the meter's OWN
  per-run snapshot (`git rev-parse HEAD` at meter start). ANY commit movement
  between ledger binding and meter run fires `lane-screen-head-mismatch`.
- `provinceSha256`/`lines`/`bgHits` (cols 4/5/6): re-derived from the snapshot
  head's bytes (`git cat-file -p <snapshotHead>:PROVINCE.md`) — a blind
  head-cell edit without byte re-derivation fires `lane-screen-sha-mismatch` /
  `-lines-mismatch` / `-hits-mismatch`.
- `line` rows: quote must be the exact whole line at the snapshot head
  (`delta-quote-not-whole-line`), a row naming a non-hit line is
  `delta-line-invented`, a hit without a row is `delta-line-missing`.
- Audit rows: status re-derived (`unchanged`/`moved`/`stale`/`file-absent`/
  `sibling-absent`); a `moved` note's `:<N>` is checked against the derived
  line.

So the falsification "edit rows to match a moved head" is mechanically forced
honest for every byte-derived cell: you cannot produce a passing sha/lines/
bgHits/quote set without reading the new head's bytes. What slips through is
exactly one cell class: **the disposition value of a surviving hit line** — it
is checked only against the 3-word frozen vocabulary, not against any
adjudication ground. A swap (`overlap-declared` → `no-tabi-ground`) on a
verbatim-surviving hit line is invisible to the meter; the kill rule's
"adjudications may not be changed to match a sibling head that moved after the
snapshot" is enforced procedurally (committed diff accounting + the quote-match
carry rule), never mechanically. Current slip surface: **30 line rows across 8
lanes** (audio 3, game-dev-2d 3, game-dev-3d 8, kaidoku 6, kotoba 3, mado 2,
revenger 4, tsukuroi 1). kengaku itself has `bgHits 0` — no line rows — so for
the lane that actually moves, blind-edit and honest-rebind are byte-identical
and harmless; the disposition risk lives on the 8 hit-bearing lanes.

### (b) Is the round-open red a real sibling movement or a file-absent artifact?

REAL MOVEMENT, file present, screened bytes byte-identical. The frozen receipt
(`controls/c1-meter-v16-red-at-round-open.json`) snapshots kengaku at
`6b0908a5…`; the r56-committed delta ledger binds `9ebde3a7…` (r63 freeze
commit). At BOTH heads (and at the current `5f517fe7…`),
`kengaku-shokunin:PROVINCE.md` is sha256 `fd1ad05b2bdb4c60f27e51ee5d15b3b3844c566e76f86ffa393af0860a04b269`,
952 lines — `git cat-file` succeeds at all three, so `file-absent` and
`sibling-absent` are ruled out by construction; the single
`lane-screen-head-mismatch: kengaku-shokunin` is the correct and only possible
classification for a commit movement with zero screened-byte change. The
receipt is honest.

### (c) Third sibling movement mid-round — does the two-cycle budget stay honest?

Yes, and it is not hypothetical: **during this attack, 2/20 lanes have already
moved since the round-open snapshot** — kengaku (`6b0908a5`→`5f517fe7`,
"round-63 verifier spot-check") and kagi (`d1632908`→`064d4b64`). The live v16
re-run in `../critic/c1-v16-live-rerun.json` still reports exactly 1 finding:
kagi's movement is map-covered and absorbed by content re-derivation (the
cited line is still verbatim), while kengaku's delta `head` cell is strict
equality and fires. Mechanically confirmed: delta-covered lanes red on ANY
movement; map-covered lanes red only when the cited bytes move.

A THIRD movement after the data commit → the after-run takes a fresh snapshot →
a new red the round cannot re-run (two-cycle budget spent; freeze rule: any
post-data predicate/kill-rule change is a new claim, so no absorbing rebind).
That lands as: C1 **UNVERIFIED** in the w1 report and the round report, with
the red after-run receipt committed under `.ufo/waves/round-57/controls/` (the
`c1-meter-v16-red-at-round-open.json` precedent) and the finding named. The
kill rule stays honest precisely because the meter is stateless and byte-bound:
each "cycle" is a genuine re-derivation, and the budget converts freshness
pressure into an honest stale-red instead of a gamed green. kengaku is the
serial mover (r53/r54/r55/r56 headers + this round) and has moved twice since
the r56 ledger binding; the L1 should snap the rebind snapshot as late as
possible and expect the after-run window to be quiet-luck, not design.

### (d) Is the after-command honestly executable at freeze time?

Yes. C1's after-command pins only `--rev <DATA-REV>` (the object of
measurement, defined as the data commit) plus fixed paths — nothing in it is
knowable only post-data, and the counter it names exists (authored, diff
observed). C2's `<FROZEN-DRIVER-SHA>` is the sha256 of the driver at the FREEZE
commit — computable at freeze-commit time; the two-stage freeze (text, then
code) covers the placeholder gap. One asymmetry, named as a tradeoff not a
defect: C1's after-command pins **no digest of v17 itself** — the "frozen
bytes" of v17 rest entirely on the freeze commit + the committed v16→v17 diff
accounting, whereas C2's command self-pins its driver. The v16→v17 diff I
observed is exactly the declared change set: `AUDIT_REL`/`DELTA_REL` relabel,
schema/sentence/usage/header strings, `predicateFrom(findings)` helper, the
run-output emission routed through it, and the two new selftest cases
(`predicate-assert-green`: emitted===true at 0 findings;
`predicate-assert-partial`: emitted===false, findingCount===1, exact id
`delta-quote-not-whole-line`). The pair kills constant-true AND constant-false/
OR-class emission mutants; the m4' mutation receipt is still owed at freeze.
Equivalence-class mutants (e.g. `findings.length <= 0`) survive by construction
— standard mutation-testing scope, acceptable.

### C1 do-nothing control

Cheapest no-op to green: relabel the r56 ledgers to `-r57` and run v17 at the
baseline. REFUSED — kagi+kengaku heads already moved; the live re-run shows the
red persists (1 finding now; the delta rebind does not exist yet). Do nothing
at all: no data commit → no `<DATA-REV>` → no green state exists to admit; the
frozen before-receipt is the red. **Control HOLDS**, and unlike most controls
it strengthens with time: every sibling movement deepens the red the no-op
cannot escape.

---

## C2 — modifier-chord capability, Chromium 155 headless

### (a) Could a lying fixture recorder pass the counter?

The inherited cross-check surface (r56 counter, which the r57 counter carries):
schema literal; nonce shape + invocation binding (nonce ∈ server log ∪ typed
values); `driverSha256` == sha256(driver bytes) == `--expect-driver-sha256`;
throwaway profile token; Chromium 155; no `/home/` leak in argv; plainTrace
prefix chain re-derived counter-side from the nonce; control-domain exact
values (End negative, Backspace residue, restore, Tab activeElement, Enter
serverSawField==nonce); `field3Value === ''`; keylog **length and window span
only**; exactly one `/echo`; six steps in order with PNG files sha-pinned +
magic-checked; teardown zero survivors.

The gap: **the r56 counter never inspects keylog ENTRY CONTENT** (key, code,
booleans, targetId). The frozen kill rule ("a chord's keylog booleans contradict
its modifiers bits" = red) forces the r57 counter to add per-entry checks; if
it ships with the r56 length/window pattern only, a lying recorder passes
trivially. Required pre-freeze, per entry: (i) each uppercase-letter keyDown
carries `shiftKey===true`, key/text = the shifted letter, and is bracketed by
Shift keyDown/keyUp; digits/hyphen unshifted; (ii) each chord keyDown has
exactly one of ctrl/alt/meta true matching bits 2/1/4 (S153), `shiftKey===
false`, key == the nonce-derived letter (first `[a-f]` of the hex tail);
(iii) the implied keydown count becomes **nonce-parameterized**
(25-char plain trace + 4 control + per-`[a-f]` letter 2 keydowns / others 1 in
the uppercased trace + 3 chords; Enter excluded — the recorder dies with the
submission navigation, an r56-disclosed asymmetry that still holds); an
off-by-one red fixture must pin the formula.

Beyond keylog, what actually binds a non-lying recorder: the DOM read-back
chains are counter-re-derived from the nonce; the server log is written by the
loopback server, not the page; the driver digest pin means a lying recorder
requires a POST-FREEZE driver edit (digest mismatch, git history) or a lying
FROZEN driver (freeze review). The residual — a fully fabricated receipt with
self-consistent nonce/log/PNG pins — is uncatchable by any receipt counter and
is pre-declared in the r56 header (re-derivation = re-running the committed
runner). PNG pins are self-referential (the receipt pins its own hashes); only
magic + sha-vs-pin integrity is checked, not semantic content.

**Weakest link: the chord leg on field3.** It has no server echo (no `name`
attribute → never submitted), no content-semantic PNG (an empty field renders
like an undisturbed one), and in the inherited counter no content check at all.
Concrete exposing instruments: (1) a lying-recorder mutant fixture — receipt
with consistent shape but chord entries whose booleans contradict the bits
(e.g. ctrl chord with `ctrlKey:false`), which must fire; (2) `field3Value===''`
with ZERO chord entries, which must fire `chord-domain-missing` +
`keylog-length-wrong`; (3) chord entries with `targetId !== 'field3'` — the
recorder already records `targetId` — which must fire, else the negative
witness is vacuous (see (b)).

### (b) Is "field3 stays EMPTY" a real negative witness?

As frozen text, NO — it is vacuous alone: a broken leg (no events delivered),
an unfocused dispatch (chords into `#field`), and an honest delivered-and-
ignored chord ALL leave field3 empty. The distinguishing receipt field is the
**chord keylog entries themselves**: presence, exactly-one modifier bit matching
2/1/4, `shiftKey===false`, the nonce-derived letter, and `targetId==='field3'`
(or an explicit activeElement witness at chord time — the r56 Tab leg's own
instrument). With those required, "delivered and ignored" (entries present +
field3 empty) separates cleanly from "never dispatched" (entries absent → red)
and "dispatched elsewhere" (targetId ≠ field3 → red). The r57 counter MUST
require all three or the witness stays vacuous.

### (c) Cross-refusal symmetry — any receipt passing BOTH counters?

Impossibility argument from the single-valued pinned fields: the r56 counter
requires `rec.schema === 'tabi-chrome-cdp-r56'` (exact `!==`); the r57 counter
requires its own literal; one receipt carries one schema string. Even ignoring
schema: nonce REs `^tabi-r56-…$` vs `^tabi-r57-…$` are disjoint; `driverSha256`
must equal two different frozen driver files' digests; the keylog implied count
is 4 for r56 vs the larger nonce-derived r57 count. No shape passes both — the
generation boundary holds **provided** the r57 counter keeps exact literals.
The live risk is the lane's recurring D2 name-leftover class: the r57 driver's
header STILL reads "chrome-cdp-loopback-round56.mjs — tabi round 56" in the
working tree. A relabel slip in the counter's schema/nonce strings would
collapse the boundary; the frozen both-directions refusal test (r56 counter
refuses the r57 receipt; r57 counter refuses an r56-shaped receipt — measured
on committed bytes) is the guard and must land as fixtures, not prose.

### C2 do-nothing control

Cheapest no-ops and their refusals: absent receipt → exit 1
`receipt-missing` (the frozen before-command, already fixed in claims.json);
relabeled r56 receipt → `schema-wrong` + `nonce-shape` + `driver-sha-mismatch`
(the r56 receipt pins the r56 driver; the r57 after-command pins
`<FROZEN-DRIVER-SHA>`); canned r57-shaped receipt with a wrong digest →
`driver-sha-mismatch`. A canned receipt with the CORRECT digest and self-
consistent internals passes the counter — that is the pre-declared residual;
it is refused as round evidence by the freeze rule (the data pass must be the
live L1 run) and by re-derivation, not by the counter. **Control HOLDS for
every no-op the freeze rule permits.**

---

## Structural finding: field2 at the Enter leg (pre-freeze decision required)

The frozen C2 statement has the Shift trace typing the UPPERCASED nonce into
**field2**, and carries the r56 Enter leg "unchanged" — but the r56 Enter check
requires `serverSawField2 === ''` (driver line 665, counter
`control-enter-submit-wrong`), and the keylog must be read BEFORE Enter (the
submission navigates; the recorder dies with the page). So the leg order is
forced (…chords → keylog read → field3 read → Enter terminal), and exactly one
of these must be frozen in the r57 driver+counter BEFORE the freeze commit:

1. **Enter last, `serverSawField2 === nonce.toUpperCase()`** (recommended): the
   `/echo` query then carries `field=tabi-r57-<hex>&field2=TABI-R57-<HEX>` —
   the Shift trace gains an independent SERVER-side witness, strictly stronger
   than the DOM-only chain; the r56 ''-check changes to an exact-value check,
   a declared strengthening, not a weakening.
2. Runner clears field2 before Enter, keeping `serverSawField2 === ''`
   verbatim: r56 stays byte-compatible, but the Shift leg keeps no server
   witness and the lying-recorder surface of (a) widens by exactly that leg.

Silence here = a structurally ungreenable run (option-1 behavior scored by an
option-2 counter) or an undisclosed weakened witness. Either choice must appear
in the r57 counter's finding-id list and fixtures.

## Pre-freeze checklist for the L1 (all still open; nothing committed yet)

1. r57 counter: keylog entry-content checks (bits↔booleans, shift bracketing,
   shifted key/text, unshifted digits/hyphen) — frozen kill rule demands them.
2. r57 counter/runner: chord `targetId==='field3'` (or activeElement) witness —
   without it C2(b) is vacuous.
3. r57 counter: nonce-parameterized implied-keydown formula + off-by-one red
   fixture; lying-recorder mutant fixture (bits-contradiction and zero-chord
   variants).
4. field2-at-Enter resolution (above), declared in driver header + counter
   fixtures.
5. D2 name-leftover in `scripts/chrome-cdp-loopback-round57.mjs` header
   (still says round 56) — fix before the freeze commit.
6. Commit the v16→v17 diff artifact (the r56 `counters/v15-v16-meter.diff`
   precedent) and the m4' mutation receipt with the freeze commit.
7. Snap the C1 rebind snapshot as LATE as possible; kagi/kengaku have already
   moved twice-adjacent since round open; a third movement after the data
   commit = C1 UNVERIFIED, reported with the red receipt in `controls/`.

*No tool installs or upgrades were needed for this attack (nothing to record
under the 2026-10-19 tooling authorization). Scratch deleted; receipts live in
`.ufo/waves/round-57/critic/`.*
