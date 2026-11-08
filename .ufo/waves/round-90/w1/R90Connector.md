# R90Connector — sibling-overlap scan (tabi round 90, w1)

**Seat.** `R90Connector`, leaf member (no subagent dispatch, no background jobs, no commits).
Read-only scan: the only writes are this report and `.ufo/waves/round-90/w1/R90Connector/`.
**Lane / context.** `tabi-shokunin`; base `a9f1da08`; freeze `.ufo/waves/round-90/freeze.txt`
sha256 `18d06a3f3895086a92f09868f5a0f5c1c3b4e880851377de2ea4fb070dde0ddf` (D2; D1
`e573334c78fa`); scored nonce `tabi-r90-l1-e573334c78fa`; receipt
`corpus/evidence/round90/chromium-showpicker/receipt.json`; driver pin `ac5a7a5e…`; fixture pin
`5fb1f0f7…`.
**Snapshot.** 2026-11-08T11:28:24-03:00, mid-w1 (the scored/ and w1/ artifacts were live during the
scan). Everything below is a snapshot of committed bytes; no instrument, counter, battery, kill
power, selftest or drift gate was executed.

## 1. What was searched

Three content sweeps, all from the fleet root, all reproducible from
`w1/R90Connector/scope.txt`:

- **A — the seven assigned tokens** over `*-shokunin/corpus/knowledge`, `*-shokunin/scripts`,
  `SCORECARD.md`: `__inputs(true)`, `settle[-_ ]?eval`, `plan[-_ ]?calls`, `record[-_ ]?drift`,
  `dom[-_ ]?read`, `setFileInputFiles`, `showPicker`.
- **B — same-class ground** over the same roots plus `*-shokunin/corpus/lessons`,
  `*-shokunin/SCORECARD.md`, `*-shokunin/PROVINCE.md`: file-picker terms, send-log/plan terms,
  `settle`, `Runtime.evaluate`, user/transient activation.
- **C — this round's waves**: the seven tokens inside every `*-shokunin/.ufo/waves/round-90`.
- **D — label-collision census**: `C1` in round-90 waves; `settle` in knowledge/lessons/SCORECARD/
  PROVINCE; the claims key set.

Counts are `rg -c` matching lines per file, case-insensitive, `--no-ignore` (node_modules/.git
excluded). `files` = files with ≥1 matching line per token/class; `lines` = sum of per-file counts.
Scope is the named roots, not every file in every lane. The session `grep` tool could not expand
wildcard lane directories (`*/corpus/knowledge/*.md` returned "No matches found" while the same
pattern matched under a single lane); multi-lane counts were therefore taken with `rg` and are
reported to `xd://report_issue`.

## 2. Fleet hit matrix — the seven assigned tokens

| token | files | lines | lanes |
|---|---:|---:|---|
| `__inputs(true)` | 4 | 14 | 1 (tabi) |
| `settle[-_ ]?eval` | 4 | 5 | 1 (tabi) |
| `plan[-_ ]?calls` | 41 | 133 | 1 (tabi) |
| `record[-_ ]?drift` | 27 | 120 | 3 (tabi 24/116; chousa 2/2; lore 1/2) |
| `dom[-_ ]?read` | 13 | 123 | 1 (tabi) |
| `setFileInputFiles` | 50 | 192 | 1 (tabi) |
| `showPicker` | 84 | 1,750 | 1 (tabi) |

Lane totals over all seven tokens: **tabi 220 files / 2,333 lines**; chousa 2/2; lore 1/2; **the
other 18 lanes 0**. Full rows: `hits-seven.tsv`; raw `rg` output: `raw-seven-counts.txt`.

Same-class sweep (`hits-class.tsv`, `raw-class-counts.txt`):

| class | tabi | mado | others |
|---|---:|---:|---|
| file picker / file chooser / showPicker | 382 / 43 files | 38 / 9 files | 0 |
| `cdpSendLog`/send log/ordered plan/`plan-calls` | 29 / 16 files | 0 | mori 1 (earlyoom "send log", OOM killer) |
| `Runtime.evaluate` | 25 / 21 files | 0 | 0 |
| transient / user activation | 23 / 13 files | 0 | 0 |
| `settle` (bare word) | 168 / 70 files | 153 / 62 files | 18 more lanes (kotodama 812) |

## 3. Which lanes hold the same ground (path + one-line state)

### tabi — owner of all seven tokens

| path | one-line state |
|---|---|
| `corpus/knowledge/chromium-showpicker-runtime-round-90.md` | r90 measured law: the four domread legs carry a distinct `window.__inputs(true)` evaluate directly after the settle `window.__state()`; limits + frontier; 60 lines |
| `corpus/knowledge/chromium-showpicker-runtime-round-89.md` | r89 carrier; line 100 names the settle-evaluate frontier that r90 closes |
| `scripts/check-showpicker-round90.mjs` | C1 counter; `plan-calls` requires the settle evaluate exactly once, at `stateIx + 1`, on the four domread legs and forbids it elsewhere (lines 600–640) |
| `scripts/chrome-cdp-showpicker-round90.mjs` | C1 driver, pinned `ac5a7a5e…`; 41 legs, one fresh browser per leg |
| `scripts/negatives-showpicker-round90.mjs` | C1 battery; adds `plan-calls-settle-call` and `plan-calls-settle-order` cases |
| `scripts/kill-power-round90.mjs` | C1 kill power; adds `domread-settle-call-dropped` and `domread-settle-order-any` |
| `scripts/check-record-drift-round90.mjs` | C2 gate; eight `claim()` results (`:73,:89,:102,:110,:115,:124,:131,:161`); reads `plans/round-89.md` only (`:59`) |
| `scripts/selftest-r90-gates.mjs` | r90 gate runner (six instruments in order) |
| `SCORECARD.md` §Round 90 | C1/C2 rows (verdicts PENDING at snapshot); 41 legs / 107 checks; battery 225; kill power 74; eight-record-statement limit |
| `plans/round-90.md` | plan and records; lines 67 and 77 say the drift gate counts **six** statements (see §6) |
| `SKILL.md:3362` | r90 gate registry; record drift is **8** statements |
| `corpus/lessons/round-90.md` | round settlement; `7 → 0` over 8 statements; Mistake table (incl. `stale-record-pointer`) |
| `.ufo/waves/round-90/controls/c1/` | prior-set + two probes + `nowork-r89-under-r90.json`; `.ufo/waves/round-90-controls/c1/nowork-settle-stripped.json` is the settle-stripped control — the round's controls are split across two directory spellings, both named by the plan |

### mado — desktop-side `FileChooser`, not the trigger (label collision)

| path | one-line state |
|---|---|
| `corpus/knowledge/xdg-portal-routing-resolver-r90.md` | r90 C1: which `org.freedesktop.impl.portal.*` backend serves each interface; `FileChooser` resolves to gtk on this host (decision table + production-binary oracle lines) |
| `corpus/knowledge/xdg-portal-routing-r12.md` | r12 hand-derived 16-interface routing table (pre-r90) |
| `corpus/knowledge/portal-keyfile-bytes-r93.md` | r93 GKeyFile byte rules, `FileChooser`/`Print`/`Settings` backend keys |
| `corpus/knowledge/xdg-mime-default-resolution-r92.md` | r92 MIME-default resolution; GTK file choosers as consumers |
| `corpus/knowledge/mime-magic-sniff-r95.md` | r95 MIME sniffing; GTK file choosers as GIO users |
| `corpus/lessons/round-12.md`, `round-90.md`, `round-93-verifier-spotcheck.md`, `round-94.md` | lessons/spot-checks for the same portal/MIME ground |

mado's 38 hits are all the desktop portal/MIME side. tabi's PROVINCE declares `mado | none`
("tabi runs headless throwaway-profile browsers, never the desktop or compositor"), so the overlap
is the word `FileChooser`, not a surface. `hits-homonyms.tsv` records the exact rows.

### The other cross-lane hits are homonyms or references

- **revenger** — `corpus/knowledge/round-93-browser-cdp-runtime-evidence.md`: a read-only record
  check of a saved r77 `inspection.json`; CDP is the object, not a trigger/picker. tabi PROVINCE
  labels revenger `contested` on loopback CDP, but the acts differ (forensic record check vs
  interaction evidence).
- **chousa** — `chain-resolution-r3.md:42`, `exempt-hop-audit-r32.md:28`: "the record drifts" means
  a chain-hop verdict drifts under `verify-chain`/exempt-hop audit, not the record-drift gate.
- **lore** — `r93-r8-worked-example.md:191`: `R8_RECORD_DRIFT` is a hash-validity return code.
- **tameshi / kengaku / mori** — round-90 prose ("plan calls it"), kengaku's own
  `C2-F5-record-drift` case id, and earlyoom's "send log" lines respectively.
- **chousa's own connector** (`R90ConnectorSiblings`) independently scanned the fleet this round
  for different classes; its witness tally quotes tabi's showpicker notes (2 rows). A sibling
  *reading* tabi's knowledge, not a claim on it.

## 4. Is anything this round plates contested?

**No cross-lane contention.** The C1 plate (settle-call binding) and the C2 plate (eight record
statements) are tabi-only ground:

- the four defining tokens (`__inputs(true)`, `settle-eval`, `plan-calls`, `domRead`) have **zero
  sibling hits**; `showPicker` and `setFileInputFiles` are also tabi-only;
- the five lanes tabi's PROVINCE calls `contested` on shared CDP/substrate — kaidoku, kagi, kake,
  revenger, kumitate — have **no round-90 wave carrying any of the seven tokens** (exact sweep;
  `hits-round90-waves.txt` has 11 non-tabi rows, all homonyms/references);
- `record-drift` as a gate is tabi-only; chousa/lore use the words for different mechanisms, and
  kengaku's case label is its own;
- mado's r90 `FileChooser` is portal backend routing, a different surface (and tabi's PROVINCE
  already says `mado | none`).

**Within-wave, the overlap is read-only.** The registry's 13 seats (executors, reviewers, critic,
mutant tester, scout, scribe, sentinel, simplifier, this connector) read the same frozen
instruments; the sole writer/integrator is L1 `TabiR90`. No seat holds a second claim on the same
ground, and the instruments/priors are pinned by `freeze.txt`. The wave is mid-flight, so seat
reports landing after this snapshot are not assessed here.

**Label collisions to guard** (the real adjacency risk): `C1`/`C2` appear in **16/16** round-90
waves (the fleet's universal claim labels); `settle` is the wave/lesson *settlement* word in **20
lanes** (kotodama 812 hits); `record drift` is chousa's chain drift and lore's hash code;
`FileChooser` is mado's portal backend. Only `showPicker`, `settle-eval`, `plan-calls`,
`__inputs(true)`, `domRead` are unambiguous tabi identifiers.

## 5. One pattern this lane should reuse

**Kumitate's connector discipline: classify hits before calling contention, and lane-qualify
colliding labels.** Kumitate's `K90Connector.md` bucketed its 53 rows into
`OWNED-BY-SIBLING / REFERENCE / QUOTE / LABEL-COLLISION / NONE` and ruled that a fleet-wide numeric
label collision (`Q82`) must be cited lane-qualified. Tabi's round has the same disease at larger
scale: every lane has a `C1` and a `C2`; "settle" means settlement almost everywhere; "FileChooser"
means the desktop portal in mado. The reusable rule for tabi's r90 landing text and the r90 lesson:
write `tabi C1-SHOWPICKER-R90`, `tabi C2-RECORDDRIFT-R90`, `tabi settle-eval`, `tabi record-drift`
and `CDP Page.fileChooserOpened` (vs `mado portal FileChooser`); never bare `C1`, `settle`,
`record drift` or `FileChooser` in cross-lane prose. The classification buckets also belong in this
receipt set, where a future reader can re-derive them.

## 6. Attack on the round's own record (no amendment proposed)

**The plan contradicts the gate's own count.** `plans/round-90.md:66-67` says "C2's counted work is
the six statements", and `:77` says "The drift gate counts six statements, not every sentence. A
green gate means those six match observed state." The gate returns **eight**: `statements()`
contains eight `claim()` calls (`scripts/check-record-drift-round90.mjs:73,89,102,110,115,124,131,161`)
and `:224` prints `claims: results.length`. The frozen C2 limit says "eight record statements …
a green gate means those eight match observed state" (`claims.json:37`), and leg (a) expects
"claims 8, mismatches 0" (`:30`). SKILL.md:3362, `corpus/lessons/round-90.md:52`, README.md:27,
LOG.md:4082/4087 and SCORECARD.md:4334 all say eight.

**Why C2 can still be green.** The gate reads `plans/round-89.md` (`:59`) and never reads
`plans/round-90.md`; none of the eight statements touches the r90 plan. The frozen limit explicitly
scopes the claim to "eight record statements, not every sentence in the lane". So a green C2
(claims 8, mismatches 0) can coexist with the false plan sentence — a blind spot in the axis's own
class (record vs state), **not a falsification of C2's eight legs**. This is the second-order
effect of the r89 fix: the r89 spot-check routed exactly this class at `plans/round-89.md` §C2
(item 1) and the drift gate was written to read plan-89, so the same class recurs one round later
in plan-90, outside the gate's read set.

Wording note (not a count error): the gate implements five of the six routed r89 defects plus three
non-defect statements (gate-selftest, QUALITY 161's cite, SCORECARD tallies) = 8. SKILL.md:3362 and
the gate header describe the composition as "the six routed defects" + the three sets, which read
literally sums to 9; the measured count is 8, and the frozen limit's numeral is unambiguous.

**Checked and not a defect.** `claims.json:21` names `controls/c1/noreceipt.txt` as the exit-2
control; the file is absent, by design — R90Exec3 ran the named path as an absent receipt and
recorded exit 2 with `receipt-unreadable`/ENOENT (`w1/R90Exec3-noreceipt.json`, sha256
`3bfeb3f4…`; `w1/R90Exec3.md:137-138`). The behavior reproduces; only the artifact convention
changed (the output lives as a seat receipt, not a committed control file). No change proposed.

## 7. The one bounded proposal (UFO-FSD connector)

**Evidence.** `plans/round-90.md:66-67,77` vs the gate's eight `claim()` results and the frozen
`claims.json:37` limit; the gate's read set excludes plan-90 (`:59`); the r89 spot-check's item 1
routed the same class in plan-89; the r90 lesson's own Mistake table already discloses a comparable
stale pointer (`stale-record-pointer`: SCORECARD rows cite a README section that does not exist).

**Affected axes.** Calibration (C2, improved: one record-vs-state mismatch removed) and adjacency
(the scan's own axis: this report fixes the contention/label map). Coverage (C1) is untouched:
no receipt, driver, counter, battery, kill-power list, prior or threshold changes.

**Move (one, bounded).** At landing, correct the two plan sentences to the measured eight — minimal
in-place replacement of "six statements" with "eight statements" on `plans/round-90.md:66-67,77` (no
new composition claim; the count is what the gate prints), and add one row to the
`corpus/lessons/round-90.md` Mistake table of class `stale-statement-count`, naming the original
"six", the two plan lines, and the eight measured (`claims.json` C2 limit; gate `statements()`).
If the L1 treats `plans/round-90.md` as pre-freeze-immutable, use the r89 correction-block pattern
instead: append the correction line under §Declared limits rather than rewriting the sentence.
Neither variant edits `claims.json`, any instrument, the freeze, the priors or a kill rule.

**Risks.** (1) Mid-wave writer collision: R90Scribe is drafting records and L1 owns integration;
this seat does not edit — the L1 applies or rejects. (2) An in-place edit could look like silent
repair if the original is not named; the lesson row supplies the trail. (3) The fix cannot move
C2's scored result (the gate does not read the plan), so it must not be described as strengthening
the claim. (4) The plan is cited by SCORECARD.md:4330 and LOG.md:4104 by path, not by hash; keeping
the sentence on the same line avoids shifting those references. (5) If the L1 prefers to leave the
plan untouched, the lesson row alone discloses the mismatch (minimal variant).

**Verification (L1, after the edit).**
`rg -n 'six statements' plans/round-90.md` returns no match (or exactly one line only if the
correction quotes the original); `node scripts/check-record-drift-round90.mjs --lane <ABS lane>
--json` still prints `claims 8, mismatches 0`; `sha256sum -c .ufo/waves/round-90/freeze.txt` still
passes (plans are not pinned); `node scripts/selftest-r90-gates.mjs --lane <ABS lane> --work
<scratch> --json` stays green; the lesson row cites `plans/round-90.md:66-67,77`.

## 8. Bounds, writes, tooling

- Writes: `w1/R90Connector.md` and `w1/R90Connector/{scope.txt, hits-seven.tsv, hits-class.tsv,
  hits-round90-waves.txt, hits-homonyms.tsv, claims-vs-plan.txt, raw-seven-counts.txt,
  raw-class-counts.txt, receipts.sha256}`. Nothing else was written; no lane file, claim, plan,
  pin, prior or control was edited.
- No subagent dispatch, no background jobs, no commits, no git/jj mutation, no instrument run.
- No tool installed or upgraded (distribution packages are paused host-wide; none needed).
- Scratch `/fast/scratch/hyaku/tabi-r90/R90Connector/` deleted before yield; the retained copies
  are the files above.
