# Round 84 — plan and narrowing amendments

Base `a5d6ffbf` (lane clean). Two claims, frozen before the wave: C1 coverage
(`chromium-showpicker-linux` generation r84) and C2 calibration (the eight r83
verifier-spot-check routed defects). Instruments frozen in
`.ufo/waves/round-84/freeze.txt` (sha256 `a5bdb15ec9a7…`), claims in
`.ufo/waves/round-84/claims.json` (nonce `tabi-r84-l1-a5bdb15ec9a7`).

## C1 — `chromium-showpicker-linux` generation r84

The r83 note's named frontier was `type=tel`/`search`/`text` — the three input
types the r83 round left unmeasured while its reject said "every remaining type
is non-exempt" was unproven. Generation r84 adds exactly those three legs to the
carried generation: 18 legs, one fresh browser per leg, the child iframe carries
`#te` (`tel`), `#se` (`search`), `#tx` (`text`) with buttons `#go12`/`#go13`/`#go14`,
each child script calling `showPicker()` on its own input inside the cross-origin
frame.

Predicate `C1-SHOWPICKER-R84`:
- (a) the scored receipt scores `clean` at checkCount **80** under
  `scripts/check-showpicker-r84.mjs` with every pin;
- (b) the battery (`scripts/negatives-showpicker-r84.mjs`) exits 0 with **162**
  cases, 0 failed, coverage **80/80**, and the kill power
  (`scripts/kill-power-r84.mjs`) kills every mutant with 0 survivors, 0 crashed;
- (c) capability row, knowledge note, SKILL.md registry and the selftest
  (`scripts/selftest-r84-gates.mjs`) green.

Kill rule: any leg false or any axis harmed → NOT verified.

Declared limit, printed from the counter's own `limit` block: the counter reads a
receipt; a forger who moves at least `escapeEvents` page events (ceil(0.5·prior
events)) escapes the replay rule. The tel/search/text legs measure the
SecurityError and the absence of a chooser — not the dialog's contents.

## C2 — record drift (the r83 spot-check's eight routed defects)

`scripts/check-record-drift-r84.mjs` counts the eight routed defects of
`corpus/lessons/round-83-verifier-spotcheck.md` §Routed defects as record claims
over committed bytes:

1. the r83 note's law 3 accept-token correction (the answered input is `#k` with
   `accept=".png"`, an extension token; `#accept` with `image/png` is targeted by
   no leg; the MIME-token and `image/*` branches stay frontier);
2. the "real PNG" correction (8-byte PNG signature plus a 13-byte ASCII marker;
   the law is byte-acceptance, not image validity);
3. the r83 ledger's Scout row polarity (a narrowing or a corrected row);
4. the Review2 cross-origin narrowing plus battery witnesses for
   `parentCrossAccess`/`childActivation`/`childLate`/no-chooser;
5. the record counts (69 checks / 41 findings for the pre-freeze no-work artifact;
   `SKILL.md` battery 84 → 153; the routed-defect count);
6. the r83 numbers the records state (74 checks / 153 battery / 50 kill power);
7. census artifacts present with pasteable output and exit codes;
8. the r84 identity (nonce + D) and the r84 numbers.

Kill rule: mismatches ≠ 0 → NOT verified.

## Narrowings (post-wave, pre-report)

None recorded yet; the wave's findings are reconciled before the report and any
narrowing is added here with the artifact that forces it.

## Re-freeze history (instrument family)

- **D1 `a5bdb15ec9a7`** (commit `84ebfa95`, identity `d90b7f55`): the first freeze. Ten seats were
  briefed at D1 and their reports cite it.
- **D2 `31fc14c29f84`**: the battery was repaired before any battery was cited as scored evidence —
  the three new legs had no refusal case for their own check ids (R84Review2 and R84Mut1 both
  measured the pinned battery failing the honest receipt: `cases 156, failed 3, uncovered
  [leg-sp84-cross-origin-tel, -search, -text, sp84-cross-origin-*-law]`). The repair adds the three
  leg mutators, three `*-law` cases, two field witnesses and the `LEG_ALSO` entry; the drift counter
  gained the r83-note/erratum reads and the r83-family retention claim (R84Critic measured it
  passing with the note absent). The driver and the picker counter are unchanged from D1
  (`f436b229…`, `e88e9fc7…`), so the receipt's leg evidence is the same generation; the scored run
  was re-executed at the D2 nonce `tabi-r84-l1-31fc14c29f84` and the D1 receipt is superseded, never
  edited. Seat reports that quote D1 are pre-amendment evidence and are recorded as such.

## Narrowings (post-wave, pre-report)

1. **C1's "the three new legs measure a distinct branch"** — R84Review1 measured that
   `childResult`/`childState`/`parentCrossAccess`/`childLate` have one distinct value across the ten
   cross-origin SecurityError legs (only `color` differs), so the counter binds the fixture
   descriptor's `type` and the law tables, not a code path. Narrowed: generation r84 adds three
   measured input types with the same SecurityError law; the claim says nothing about separate
   Chromium branches (also stated in the knowledge note).
2. **C1's kill-power reach** — R84Mut1's independent 123-mutant sweep leaves 51 case-level survivors
   (exit code 1 on every mutant because its baseline was the D1 battery, which itself failed the
   honest receipt; the case-level count is the honest reading). Narrowed: kill power 50/50 means the
   frozen mutant list is killed by the frozen battery; the battery does NOT detect every
   single-conjunct weakening. Survivor families (message field unpinned, `childLate`, child event
   seq, `parentCrossAccess`, the three legs deleted from the loop) are routed to r85.
3. **C2's predicate scope** — R84Critic measured that the D1 drift counter passed with the r83 note
   absent, `laws8=false` tolerated, and defect 8 (r83 family retention) unchecked. After the
   strengthening (D2) the counter reads the note's erratum clauses, gates `laws8`, checks the
   knowledge count and asserts the r83 scored family; `claim-count-stable` remains vacuous and is
   recorded as such (R84Exec2).
4. **Battery case coupling** — R84Review2 measured 32/159 cases firing `expect` plus an allowlisted
   collateral (e.g. `leg-sp84-cross-origin-tel` also fires `no-selection-law`); narrowed: a battery
   case witnesses "the receipt state is refused", not "this one conjunct fired".
