# ScribeMistakes — round 32 w1, frontier step (mined mistake + criterion draft + stale-premise sweep)

**Verdict.** The candidate mistake is verified, and it is wider than the ticket's premise: the "nudge inactive"
statement went stale at round 29 and is repeated in **five** self-descriptions across three documents — three
counted by the frozen counter (`SCORECARD.md:1473`, `:1515`, `:1576`) and four uncounted (`LOG.md:2072` and
`.ufo/waves/round-{29,30,31}/claims.json:11`) — with round 31 adding a *rule-narrowing* parenthetical ("depth and
adjacency sit at the line, not above it") that contradicts `AXES.md:68` ("at or above"). The derived state is
arithmetic, not opinion: the capability table's last entry is round 25 (`SCORECARD.md:1306`, `:1314`), the window is
3, so round 29's window is rounds 26–28, empty; every axis sits at or above 8. Class = `stale-premise` (true when
formed at rounds 26–28, repeated after the input left the window). Captured-by = `none`: no QUALITY.md criterion
covers a carried derived-state premise (`grep -n -i "nudge\|stagnation" corpus/QUALITY.md` → exit 1, no match), so a
criterion 83 draft is supplied below; the next free number is 83 (criterion count 82, `corpus/QUALITY.md:483`). The
fix is shown able to fail by `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` (3 m4 mismatches among 18, exit 1)
and by the frozen selftest's red/green pairs (`baseline/c2-counter-selftest.txt:31-39`, 41/41, exit 0). The second
sweep for the same shape ("lowest axis" statements vs the axes table) is **clean**: 8 of 8 statements hold, 0
defects. Drafts only — no lane tracked file was edited; no lane script was run.

## 1. Rule, inputs, and the arithmetic

`/home/vgpnk/Projects/shokunin/AXES.md:66-73` (the rule text, read-only; fleet root, not written):

```
66:## The stagnation nudge
68:When every axis the lane owns sits at or above the lane's saturation line and
69:no capability has entered the table within the lane's stagnation window (both
70:recorded in `SCORECARD.md`), the lowest-axis obligation is waived: the round
71:should be a frontier/capability move — grow the repertoire or move
```

The frozen counter implements exactly that reading (`scripts/check-selfassessment.mjs:426-509`):
`observed = allAtLine && !recent ? "active" : "inactive"` with `recent = caps.some(c => c >= round - window && c <= round - 1)`
(`:497-499`), `caps` from `First-working round: N` (`:445-459`).

Inputs on the lane bytes at `4181fff` (via my sweep, §4): capability rounds `[1, 13, 16, 17, 22, 23, 24, 25]`,
last = **25** (`SCORECARD.md:1306`, `:1314`); saturation/window **8 / 3**.

| Round | window (N-3 … N-1) | capability in window | all axes ≥ 8 | derived | stated |
|---|---|---|---|---|---|
| 26 | 23–25 | 23, 24, 25 | yes | inactive | inactive — **correct** |
| 27 | 24–26 | 24, 25 | yes | inactive | inactive — **correct** |
| 28 | 25–27 | 25 | yes | inactive | inactive — **correct** (counter: could-not-evaluate, `:1456`) |
| 29 | 26–28 | **none** | yes | **active** | inactive — **stale** |
| 30 | 27–29 | **none** | yes | **active** | inactive — **stale** |
| 31 | 28–30 | **none** | yes | **active** | inactive — **stale** |

So the premise was *true* at 26–28 and was carried into 29–31 without re-derivation — the class is
`stale-premise`, not `number-drift`.

### 1.1 The counter's own reading at the freeze (not re-run here)

Command (recorded as the derivation of the pointer; output pasted from the committed control, not a new run):

```
$ python3 classes.py        # reads .ufo/waves/round-32/baseline/c2-J1-do-nothing.json
mismatches field: 18 | clean: False | rev: 5ad1fcbfbae947e56ed448c7d24af0632b534e80
findings total: 195 | counted entries: 18
m4 findings: 9 | m4 mismatch (observed != null and claimed != observed): 3 | m4 couldNotEvaluate: 1
m1 mismatch: 15
exit=0
```

The three m4 mismatches, verbatim from that JSON:

```
{"class":"m4-nudge-state","doc":"SCORECARD.md","line":1473,"round":29,"claimed":"inactive","observed":"active","superseded":false}
{"class":"m4-nudge-state","doc":"SCORECARD.md","line":1515,"round":30,"claimed":"inactive","observed":"active","superseded":false}
{"class":"m4-nudge-state","doc":"SCORECARD.md","line":1576,"round":31,"claimed":"inactive","observed":"active","superseded":false}
{"class":"m4-nudge-state","doc":"SCORECARD.md","line":1456,"round":28,"claimed":"inactive","observed":null,"superseded":false,"couldNotEvaluate":"no `Axes at round start:` with all six axes in the round group"}
```

Stated lines as committed (read with `sed -n` over `1472-1475`, `1515`, `1576`):

```
Axes at round start: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8;
lowest-axis tie at 8 — C1 works operability, C3 works freshness. Saturation 8 / window 3; nudge
inactive; no axis retired. Measured at `9cc92b0880a104551a32369f8f59bf4af9d0959e` and re-measured at
8 — C1 works operability. Saturation 8 / window 3; nudge inactive; no axis retired. After-measurements in a clean
Saturation 8 / window 3; nudge inactive; no axis retired. After-measurements in a clean checkout of the measured
```

Diagnostic value: the statement sits in the round's `Axes at round start:` block, i.e. it is the *input* the
lowest-axis obligation is judged from — the stale premise decided the round shape (rounds 29–31 each began as a
lowest-axis round on a rule they had already left).

## 2. Provenance of every path cited

`git ls-tree -r --name-only 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 -- <path>` returned the path for all of:
`SCORECARD.md`, `LOG.md`, `corpus/QUALITY.md`, `.ufo/waves/round-29/claims.json`,
`.ufo/waves/round-30/claims.json`, `.ufo/waves/round-31/claims.json`, `.ufo/waves/round-32/claims.json`,
`.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` (exit 0, eight matches). `AXES.md` is the fleet-root rule file,
cited by its own line numbers, outside the lane tree by design (read-only).

## 3. Draft lesson addition — for `corpus/lessons/round-32.md` §Mistakes

Proposed number `M1`; renumber if the L1 carries earlier mistakes. One table row, one subsection (criterion 77).

```markdown
| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M1 | `stale-premise` | `SCORECARD.md:1473`, `:1515`, `:1576` (rounds 29–31: "nudge inactive") against `AXES.md:68-70` and the capability table's last entry (`SCORECARD.md:1306`, `:1314` — "First-working round: 25"): window 3 at round 29 spans rounds 26–28, so the derived state is `active` — `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` (m4 at `:1473/:1515/:1576`, claimed `inactive`, observed `active`; 18 mismatches, exit 1). The same statement recurs uncounted at `LOG.md:2072` and `.ufo/waves/round-29/claims.json:11`, `round-30/claims.json:11`, `round-31/claims.json:11`; round 31 narrows the rule ("depth and adjacency sit at the line, not above it") against `AXES.md:68` "at or above". Rounds 26–27 derived correctly (observed `inactive`), round 28 is correct but unevaluable (`SCORECARD.md:1456`, no axis line in its group). | `none` | criterion 83 (appended); able to fail: the do-nothing tree scores the three m4 findings, and a clearing correction must cite each line and spell `nudge was active` (`scripts/check-selfassessment.mjs:503`); selftest pairs `m4-stale-then-corrected` / `m4-correction-uncited` / `m4-correction-wrong-state` (`baseline/c2-counter-selftest.txt:36-38`) |
```

```markdown
### M1 — a round carried a derived state instead of re-deriving it

- **Class:** `stale-premise`. The statement "nudge inactive" was derived correctly at rounds 26–28 (the window
  25–27 still contains the round-25 capability). It was repeated at 29–31, after that capability left the window,
  while every axis still sat at or above line 8 — so the derived state was `active` in all three rounds and the
  lowest-axis obligation was waived (which is what round 32's own `claims.json` now states).
- **Evidence:** `SCORECARD.md:1473-1474`, `:1515`, `:1576`; `AXES.md:66-73`; capability rounds from
  `SCORECARD.md:1306` and `:1314`; the counter's reading at the freeze in
  `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` (3 m4, 18 mismatches, exit 1). Uncounted recurrences:
  `LOG.md:2072`; `.ufo/waves/round-29/claims.json:11`, `.ufo/waves/round-30/claims.json:11`,
  `.ufo/waves/round-31/claims.json:11`. Rule-narrowing: `.ufo/waves/round-31/claims.json:11`
  ("…sit at the line, not above it") against `AXES.md:68` ("at or above").
- **Captured by:** `none`. `grep -n -i "nudge\|stagnation" corpus/QUALITY.md` exits 1 (no criterion names the
  nudge); criterion 65 governs a *figure* against its instrument and the clearing conditions of a correction,
  criterion 43 a *count* line, criterion 78 a correction's citation form — none requires a carried state premise to
  be re-derived in the round that repeats it.
- **Fix:** criterion 83 (below). Instrument is `scripts/check-selfassessment.mjs` v3 class `m4-nudge-state`; it reads
  `SCORECARD.md` round groups only (`:500` hardcodes `doc: "SCORECARD.md"`), so `LOG.md` and the frozen `claims.json`
  lines are unchecked and must be read by hand — recorded as a limit, not a guarantee (criterion 73's rule).
  Able to fail: the do-nothing tree scores all three lines red; the correction path clears a line only when the
  paragraph carries a correction marker, cites `SCORECARD.md:N`, and states `nudge [was|is] <derived>` (`:503-509`),
  and the selftest holds both directions (`baseline/c2-counter-selftest.txt:31-39`).
```

## 4. Draft QUALITY.md criterion 83 (append after criterion 82, `corpus/QUALITY.md:483`)

Next free number is **83**; the file currently holds criteria 1–82 (`grep -c '^[0-9]\+\. ' corpus/QUALITY.md` → 82,
last `82.` at `:483`).

```markdown
83. A statement a round makes about its own derived state — the stagnation-nudge state, a window position, a
    lowest-axis tie, a capability's first-working round — is re-derived in that round from the rule and the inputs,
    and the round names both: the rule (document and section) and the inputs it read (axis scores, saturation and
    window, capability entry rounds). A statement repeated from the previous round is a finding even when the
    derived state is unchanged, and a parenthetical that narrows the rule it applies ("sit at the line, not above
    it" against `AXES.md:68` "at or above") is a second finding on the same line. The fix is an append-only
    correction at the end of the same document that cites the stale line as `DOC:N` and states the derived state in
    the instrument's own words (`nudge was active`); a correction that restates the premise unmarked clears
    nothing. Instrument: `scripts/check-selfassessment.mjs` v3 class `m4-nudge-state`, over `SCORECARD.md` round
    groups only — the same statement in `LOG.md`, a frozen `claims.json` or a lesson is unchecked and is read by
    hand. Red state at the round-32 freeze: `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` (m4 at
    `SCORECARD.md:1473`, `:1515`, `:1576`, claimed `inactive` / derived `active`; 18 mismatches, exit 1); green pair:
    `m4-stale-then-corrected` in `baseline/c2-counter-selftest.txt:36`. (lesson:
    corpus/lessons/round-32.md#m1; source: round-31 `claims.json:11` rule-narrowing, `AXES.md:66-73`;
    sweep: `.ufo/waves/round-32/w1/ScribeMistakes.md` §5)
```

## 5. Sweep — the same shape across the lane's other self-description

Command (script kept as `ScribeMistakes/sweep.py`, read-only over the lane tree; run from scratch, `TMPDIR` set to the
seat scratch dir):

```
$ export TMPDIR=/fast/scratch/hyaku/tabi-r32/ScribeMistakes
$ python3 "$TMPDIR/sweep.py" /home/vgpnk/Projects/shokunin/tabi-shokunin > "$TMPDIR/sweep-output.txt"; echo exit=$?
exit=0
```

Method: parse `## Round N` groups from `SCORECARD.md` and `LOG.md`; flatten each group the way m4 does (whitespace
collapsed across lines, match offset mapped back to its first line); take the six axis scores, `Saturation S /
window W` and the capability rounds from `SCORECARD.md`; derive the nudge state; then check every
`lowest … at N` statement against the argmin of the same axes. Output (verbatim):

```
capability rounds parsed from SCORECARD.md: [1, 13, 16, 17, 22, 23, 24, 25]
last capability entry round: 25
lane saturation/window as last declared in SCORECARD.md: (8, 3)

== SCORECARD.md: `nudge inactive|active` statements, derived from own round group ==
  line round claimed  derived  verdict      inputs
  1126    23 inactive inactive fresh        saturation 8/window 3 [group]; all axes >= 8: True; caps in window: [22]
  1215    24 inactive inactive fresh        saturation 8/window 3 [group]; all axes >= 8: True; caps in window: [22, 23]
  1277    25 inactive inactive fresh        saturation 8/window 3 [group]; all axes >= 8: True; caps in window: [22, 23, 24]
  1333    26 inactive inactive fresh        saturation 8/window 3 [group]; all axes >= 8: True; caps in window: [23, 24, 25]
  1382    27 inactive inactive fresh        saturation 8/window 3 [group]; all axes >= 8: True; caps in window: [24, 25]
  1456    28 inactive -        unevaluable  no six-axis `Axes at round start:` in group
  1473    29 inactive active   STALE        saturation 8/window 3 [group]; all axes >= 8: True; caps in window: []
  1515    30 inactive active   STALE        saturation 8/window 3 [group]; all axes >= 8: True; caps in window: []
  1576    31 inactive active   STALE        saturation 8/window 3 [group]; all axes >= 8: True; caps in window: []
stale statements in SCORECARD.md: 3

== LOG.md: `nudge inactive|active` statements, derived from own round group ==
  line round claimed  derived  verdict      inputs
  1891    27 inactive inactive fresh        saturation 8/window 3 [group]; all axes >= 8: True; caps in window: [24, 25]
  2072    31 inactive active   STALE        saturation 8/window 3 [fallback (nearest preceding declaration in this document)]; all axes >= 8: True; caps in window: []
stale statements in LOG.md: 1

== C. `lowest ... at N` statements vs the axes table (SCORECARD.md round groups) ==
  line round stated                   argmin                                 worked                       verdict
  1124    23 line 8 tie               adjacency,depth,freshness,operability  -                            HOLDS
  1212    24 line 8 tie               adjacency,depth,freshness,operability  -                            HOLDS
  1275    25 line 8 tie               adjacency,depth,freshness,operability  -                            HOLDS
  1330    26 line 8 tie               adjacency,depth,freshness,operability  -                            HOLDS
  1380    27 line 8 tie               adjacency,depth,freshness,operability  -                            HOLDS
  1473    29 line 8 tie               adjacency,depth,freshness,operability  operability,freshness        HOLDS
  1514    30 line 8 tie               adjacency,depth,operability            operability                  HOLDS
  1575    31 line 8 tie               adjacency,depth                        depth                        HOLDS
lowest-axis defects: 0
```

### 5.1 Second stale premise of the same shape — found, two kinds

1. **Same premise, documents the counter does not read.** `LOG.md:2072` (round 31) states "nudge inactive"; derived
   `active`. The three frozen claims carry it too:

   ```
   .ufo/waves/round-29/claims.json:11  "…Saturation 8 / window 3; stagnation nudge inactive; no axis retired."
   .ufo/waves/round-30/claims.json:11  "…Saturation 8 / window 3; stagnation nudge inactive; no axis retired."
   .ufo/waves/round-31/claims.json:11  "…stagnation nudge inactive (depth and adjacency sit at the line, not above it); no axis retired."
   ```

   These four are **uncounted** by the frozen instrument: `scripts/check-selfassessment.mjs:500` fixes
   `doc: "SCORECARD.md"`, and `m4Findings` is called once, on `scorecard` only (`:528`). Round 32's own
   `claims.json:23` states the state correctly ("Stagnation nudge ACTIVE: every axis sits at or above the line
   (AXES.md: 'at or above')"), so the correction exists in the new claims but the earlier lines stay as written
   (append-only) and need the `DOC:N` correction paragraphs the criterion requires.

2. **Rule-narrowing inside the same statement.** Round 31's parenthetical is the same mistake in a second form: the
   rule's threshold is *at or above* the line (`AXES.md:68`), and the parenthetical gives *above* as the reason for
   `inactive`. A reader who re-derived from the parenthetical would get the wrong state even with the window
   arithmetic right.

3. **Lowest-axis statements — clean.** 8 of 8 statements match the argmin of their own round's axes (ties named as
   ties, worked axes inside the argmin); 0 defects. The round-32 claim "adjacency 8 (unique)" also holds, since
   round 31's C1 raised depth 8→9. No second premise of the "lowest axis" kind survives.

## 6. Limits and counter-findings (attacks on this draft)

- **`m4` scope.** The class is SCORECARD-only; four stale recurrences outside it (§5.1.1) are unchecked. The
  criterion above states this as a limit. Do not read "mismatches 0" at REV as "the lane no longer says it".
- **Round-28 escape hatch.** A group without a six-axis `Axes at round start:` line yields `couldNotEvaluate`
  (`SCORECARD.md:1456`), so a stale statement in such a group is not counted. Round 28's statement happens to be
  correct (window 25–27 contains 25) — luck, not coverage.
- **Sweep-B fallback.** `LOG.md` round groups do not carry a `Saturation S / window W` phrase, so my sweep falls back
  to the nearest preceding declaration in the same document (8/3); the output prints `[fallback …]` at that line.
  A LOG statement without a preceding declaration would be unevaluable, not fresh.
- **Not re-run.** No lane counter was executed by me (seat contract; and the role bars re-runs to decorate reports).
  The m4 reading quoted is the committed control, whose `rev` field is the frozen counter commit
  `5ad1fcbf…`; its line numbers (1473/1515/1576) match the lane bytes at `4181fff`, checked by reading both.
- **Not claimed.** Nothing here asserts C2 will reach 0, nor that the appended corrections will clear every m4
  line; that is the L1's integration and the counter's run.
- **Source tier.** This draft cites no external row: the rule is `AXES.md`, the inputs are lane bytes. C1's S123–S126
  obligations are not mine and are untouched.

## 7. Bounds, hygiene, provenance

- Wrote only `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-32/w1/ScribeMistakes.md` (this report) and
  `.ufo/waves/round-32/w1/ScribeMistakes/` (receipts); scratch under `/fast/scratch/hyaku/tabi-r32/ScribeMistakes/`
  was deleted after the receipts were copied. No lane tracked file, lane git index, lane jj state, fleet repo or
  sibling lane was written. Every `git` call in the lane was read-only (`git log`, `git status --porcelain`,
  `git ls-tree`); no lane script was executed, and no clone was needed because nothing here measures a revision.
- Receipts in the output dir: `sweep.py`, `sweep-output.txt`, `classes.py`, `c2-j1-classes.txt`, `c2-j1-m4.txt`,
  `grep-quality.txt`.
- No browser was started by this seat; no network fetch; no tool installed; no subagent dispatched.
- `pgrep -fa 'chromedriver|chromium'` at yield time returned exactly two lines, neither mine:
  `1371 /usr/bin/earlyoom …` (host supervisor) and `4191529 /usr/bin/chromedriver --port=46741`, whose
  `/proc/4191529/environ` reads `TMPDIR=/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/tmp/pat-bKh26n` — that
  seat's process, not this one's. Lines I own: none.

**Findings.** F1 (severity: the mined mistake) — the nudge premise went stale at round 29 and was restated in
rounds 29, 30, 31 (`SCORECARD.md:1473`, `:1515`, `:1576`, counted) and in `LOG.md:2072` plus three frozen
`claims.json:11` lines (uncounted). F2 — round 31 states a *reason* the rule does not support ("at the line, not
above it"). F3 — the instrument cannot see either recurrence outside `SCORECARD.md`; the criterion draft records
that as a limit. F4 — the lowest-axis sweep holds (8/8).
