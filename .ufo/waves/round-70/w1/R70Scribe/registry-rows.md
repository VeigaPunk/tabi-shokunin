# Round 70 — gate registry reconciliation + capability row (draft)

Read time 2026-11-06T17:38-03:00. **The lane moved during this seat**: L1 landed
`## Round 70 gate registry` at `SKILL.md:3154-3160` and `scripts/selftest-r70-gates.mjs`
(`sha256 a737dae6447cb8761d875a4732daccb4b54980f0c15d99d1022f1d99f8284c72`, 5,224 B, mtime
17:36:51) while this seat was drafting. `SKILL.md` at read time: sha256
`6eaef331938c59cffe6fa305a09e269e81adcbc20e8b680c725e32dc350ad5bc`, 3,161 lines. This document is
therefore a **delta against the landed state**, not a fresh section. My pre-landing section draft
and wrapper are kept under `superseded/` as the record of the QUALITY-129 gap they measured; the
landed wrapper closes that gap.

Frozen instrument digests (`.ufo/waves/round-70/freeze.txt`): counter `a2ed7619…756e`, battery
`22244a81…af3c`, verifier `99442a2c…76b8`, driver `704efab8…9577`.

## 1. Landed rows — field check against the frozen headers

| Row (SKILL.md line) | Cell | Header source | Result |
|---|---|---|---|
| check-synthtap-r70 (3158) | entry | `scripts/check-synthtap-r70.mjs:3-4` — `[--expect-driver-sha256 <hex>]` and `[--json]` are optional | **drift (stricter)**: the cell makes the pin mandatory and drops `--json`; a valid invocation, but not the full interface |
| check-synthtap-r70 | verdict map | `:5` — "0 = clean (every check holds); 1 = findings; 2 = usage / unreadable receipt" | matches; the `--list-checks` listing mode (`:4`, exit 0) is not an exit class of a receipt run, so its absence is not a defect |
| check-synthtap-r70 | self-test | `:4` `--list-checks` only; no `--selftest` flag in the instrument | wrapper `--gate synthtap` implemented at `scripts/selftest-r70-gates.mjs:29-40`; asserts `allOk` and empty `coverageGap`, matching the battery's `:8-10` |
| check-synthtap-r70 | pinned values | `freeze.txt` `a2ed7619…756e`; `scored/c1-counter-a.json` (84 checks), `scored/c1-negatives-a.json` (95/95) | matches |
| check-synthtap-r70 | write scope | no `fs.write*` in the file; output is `console.log` (`:52`) | matches ("stdout only") |
| verify-live-r70 (3160) | entry | `scripts/verify-live-r70.mjs:27-28` also accepts `[--no-run]`; `:29-31` control-only `--driver`/`--driver-sha256` | **drift (narrower)**: both omitted from the entry cell; the self-test cell names them |
| verify-live-r70 | verdict map | `:32-33` — "0 predicate true; 1 evaluated and false (incl. --no-run); 2 usage or pin refusal; 4 every check held but an override flag was used" | matches, including exit 4 |
| verify-live-r70 | self-test | `:32` `--no-run`; `:29-31` overrides | wrapper `--gate live` implemented at `scripts/selftest-r70-gates.mjs:41-56` (no-run, tampered-driver, scratch-too-long, forger replay/rewrite/rewrite-full), matching the wrapper header `:6-13` |
| verify-live-r70 | pinned values | `:6-25` PROFILES (driver/counter digests per profile; evidence paths); `freeze.txt` `99442a2c…76b8` | matches; `controls/summary.json` and both scored verifier receipts exist |
| verify-live-r70 | write scope | `:34` — "Write scope: --scratch only. Never touches the lane tree" | matches |
| both | owner | lane convention | `tabi L1` |

Measured, not asserted: at the current tree the lane's own checker reports **no finding for either
landed row** (`scripts/check-gate-registry.mjs`; baseline receipt below, 35 gates, 9 pre-existing
findings, none r70).

## 2. Patch — the one missing row (battery)

The assignment asks for one row each for the three scripts; the landed section leaves
`negatives-synthtap-r70` in the "Instruments without a gate verdict" clause. Insert this row after
the `check-synthtap-r70` row (`SKILL.md:3158`):

```markdown
| negatives-synthtap-r70 | gate (battery) | `node scripts/negatives-synthtap-r70.mjs --real <receipt.json> --expect-driver-sha256 <hex> --work <ABS scratch dir> [--laundered <degenerate receipt.json> ...] [--json]` | 0=clean (every case refused for its expected id, positive clean, no coverage gap); 1=findings (any case off its expected id, or a coverage gap); 2=could-not-evaluate (usage, unreadable real receipt) | `node scripts/selftest-r70-gates.mjs --selftest --scratch <ABS> --gate synthtap` (the wrapper runs this battery; the battery has no self-test flag of its own) | .ufo/waves/round-70/freeze.txt (sha256 22244a81…af3c); .ufo/waves/round-70/scored/c1-negatives-a.json (positiveOk true, 95/95, coverageGap 0) | writes neg-*.json / laundered-*.json only under the absolute --work dir; stdout otherwise | tabi L1 |
```

and drop the battery from the trailing clause so the section does not contradict itself — the
clause becomes:

```markdown
Instruments without a gate verdict (round 70): `scripts/chrome-cdp-synthtap-round70.mjs` (driver, pinned 704efab8…9577; writes only its `--scratch` and `--out`), `.ufo/waves/round-70/controls/forgers/forger.mjs` (control-only forger, never a scored run).
```

Field provenance for the row: entry `scripts/negatives-synthtap-r70.mjs:3-5`; verdict map `:10`
("Exit 0 = all cases as expected and full coverage; 1 = otherwise; 2 = usage") with the coverage
rule at `:8-9`; writes at `:109` (`neg-<case>.json`) and `:122-125` (`laundered-<kind>.json`), both
under the absolute `--work`; no `--selftest` flag in the file.

Measured on a fixture of the **current tree** (byte-identical `SKILL.md` + `scripts/` copy,
`git rev-parse --show-toplevel` = the fixture dir):

| State | Fixture rev | Gates | Findings | Battery row |
|---|---|---|---|---|
| current tree (baseline) | `5bbb48f…` | 35 | 9 pre-existing (4 × `e3-row-script-absent` for `.ufo/waves/round-12/21/22` scripts, 5 × `e1-missing-row` for `check-c2-knowledge-round41`, `check-cited-receipts[-v2]`, `check-receipt-provenance`, `check-secondary-round62`) | absent |
| + battery row | `4f2a5f2…` | 36 | same 9, none added, none removed | conformant, `missing: []` |

Command: `node scripts/check-gate-registry.mjs --repo <fixture> --rev HEAD --json`.
Receipts: `receipts/patch-baseline.json`, `receipts/patch-after.json`. (The checker reads rows, not
prose; the clause edit above is consistency, not part of the measured delta.)

## 3. SCORECARD capability row (draft — not landed)

`SCORECARD.md` at read time has no round-70 section and no `chromium-synth-tap-gesture-linux` row
(`grep -n 'chromium-synth-tap-gesture-linux' SCORECARD.md` → no match; 3,655 lines). Row in the
round-69 four-column format:

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-synth-tap-gesture-linux` | Drive `Input.synthesizeTapGesture` over raw CDP on Chromium 155/Linux headless and prove the producer from the page-side event log plus the driver's CDP send log: a mouse-source tap delivers `pointerdown(mouse)`/`mousedown`/`pointerup(mouse)`/`mouseup`/`click(mouse)` with click `detail` 1 and a 49.9 ms press→release (the default ≈50 ms duration; `duration: 400` → 400 ms); `tapCount: 2` delivers two independent tap sequences (details 1,1) and no `dblclick`; `tapCount: 0` delivers no events and succeeds; the default source (no `gestureSourceType`) is touch — `pointerdown(touch)`/`touchstart`/`pointerup(touch)`/`touchend` and no `click`; `x: 5000` fails with CDP `-32602 "Position out of bounds"` and no events; every event is `isTrusted` and on the button; look-alike producers (script `click()`, `Input.dispatchMouseEvent`, `Input.dispatchTouchEvent`) are refused | `scripts/chrome-cdp-synthtap-round70.mjs`; `scripts/check-synthtap-r70.mjs`; `scripts/negatives-synthtap-r70.mjs`; `scripts/verify-live-r70.mjs --profile synthtap-r70`; `corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json`; `.ufo/waves/round-70/scored/c1-verify-live-L1.json` | round 70 |

Facts used (receipt + scored only):

- per-leg shapes and press→release: `scored/c1-counter-a.json` → `derived` (mouse 49.9 ms, hold
  400 ms, double 50 ms with two down/up pairs, start/zero/outside empty, default and touch
  50 / 50.1 ms with no click);
- `detail` and `dblclick`: same `derived` (`clickDetails: [1]`, `[1,1]`, `dblclick: 0`);
- `-32602 "Position out of bounds"`: `receipt.json` → `legs[7].cdpError`, `skipped: false`, no events;
- trust/target: `derived[*].allTrusted: true`, `onButton: true`;
- producer refusal: `scored/c1-negatives-a.json` (95/95, incl. three laundered degenerate receipts)
  and `no-lookalike-producer` among the 84 clean checks;
- live re-derivation: `scored/c1-verify-live-L1.json` (`predicate: true`, `exit: 0`,
  `pinSource: frozen`, two cold runs on verifier-drawn nonces/ports, `crossRun: true`,
  `evidence: true`).

## 4. Superseded measurements (kept as the record, not as current state)

Before the landed section existed, this seat drafted its own section + `--selftest` wrapper and
measured the QUALITY-129 gap on a standalone fixture:

| Variant | State | Exit | Finding |
|---|---|---|---|
| A | draft section + proposed wrapper present | 0 | clean, 3 rows, 4 gates, `nonconformant: 0` |
| B | as-frozen self-test cells only (`--list-checks`, `--no-run`, none) | 1 | `e2-field-incomplete` ×3, `latest row missing: selftest` |
| C | wrapper named, file absent | 1 | `e3-row-script-absent` |

Receipts: `receipts/registry-fixture-{a,b,c,final}.json`; draft bytes
`superseded/section-draft.md`, `superseded/selftest-r70-gates.mjs`. The proposed wrapper's legs
were also exercised against a lane mirror (byte-identical script copies): `--gate synthtap` →
95/95, `coverageGap []`, 2.3 s (`receipts/wrapper-synthtap.json`); `--gate live-verify` → 4/4
refusals (`receipts/wrapper-live-verify.json`). The landed
`scripts/selftest-r70-gates.mjs` supersedes that proposal; its `--gate synthtap|live` is the
interface the landed rows name.

## Limits and findings

- **F1 — entry-cell drift (not repaired).** `SKILL.md:3158` makes `--expect-driver-sha256`
  mandatory and drops `--json`, while `scripts/check-synthtap-r70.mjs:3-4` marks both optional;
  `SKILL.md:3160` omits `[--no-run]` and the control-only overrides that
  `scripts/verify-live-r70.mjs:27-31` accepts. Both cells are valid invocations, not false
  statements; L1's call whether to widen them.
- **F2 — the battery has no gate row in the landed section** (assignment asks for one). Patch in
  §2; measured +1 gate, 0 new findings.
- **F3 — registry checker prose loophole (observed, outside this seat).**
  `scripts/check-gate-registry.mjs:229` tests `/--self-?test\b/` against the whole cell, so a cell
  that merely mentions the flag passes. My first variant-B attempt passed
  `check-synthtap-r70` for exactly that reason.
- **F4 — wrapper name inheritance.** A script named only in another row's self-test cell enters
  the gate set under the first naming row's name (`scripts/check-gate-registry.mjs:254-257`); the
  landed wrapper reports as `check-synthtap-r70` at line 3159. Conformant, but the reported name
  is not its own.
- **F5 — scratch length ceiling.** `scripts/verify-live-r70.mjs:132-133` refuses a Chromium
  singleton-socket path over 107 bytes before any launch; both the landed row (`<short ABS dir>`)
  and the wrapper's `live` leg depend on it.
- The capability row is capability-only (r69 row shape); counter/battery/verifier counts stay in
  the round's C1 row and the receipts.
- No `SKILL.md` or `SCORECARD.md` byte was modified by this seat; the patch is text for L1.
