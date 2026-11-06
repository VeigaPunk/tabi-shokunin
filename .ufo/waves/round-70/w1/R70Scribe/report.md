DRAFTED

# R70Scribe — round 70 w1 report: gate-registry rows + capability row

Seat R70Scribe (scribe), lane round 70 w1. No product code, judge, `SKILL.md`, `SCORECARD.md` or
production file was modified by this seat; no git/jj mutation anywhere. Writes are confined to
`.ufo/waves/round-70/w1/R70Scribe/` plus the assigned `Report:` trailer path
`.ufo/waves/round-70/w1/R70Scribe.md`. Scratch `/fast/scratch/hyaku/tabi-r70/R70Scribe/` was
deleted before yield; receipts were copied into the wave dir first.

## Behavior

1. Read the frozen instrument headers at the freeze digests (`scripts/check-synthtap-r70.mjs`
   `a2ed7619…756e`, `scripts/negatives-synthtap-r70.mjs` `22244a81…af3c`,
   `scripts/verify-live-r70.mjs` `99442a2c…76b8`, driver `704efab8…9577`;
   `.ufo/waves/round-70/freeze.txt`) and drafted a `## Round 70 gate registry` section — eight
   columns, one row each for the counter (gate), the battery (gate battery) and the verifier
   (gate, two profiles).
2. Drafted the SCORECARD capability row for `chromium-synth-tap-gesture-linux` in the r69
   four-column format from `corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json` and
   `.ufo/waves/round-70/scored/` only.
3. Measured the draft against the lane's own mechanical reader (`scripts/check-gate-registry.mjs`)
   on fixture git repos in scratch (byte-identical script copies, `git rev-parse --show-toplevel`
   = the fixture), not by assertion.
4. **The lane moved mid-seat**: L1 landed `## Round 70 gate registry` at `SKILL.md:3154-3160`
   and `scripts/selftest-r70-gates.mjs` (`a737dae6…4c72`, mtime 17:36:51). Re-read, then
   re-scoped the deliverable to a reconciliation: field check of the landed rows against the
   headers, the one missing row (battery) as a patch, and the still-unlanded capability row.

## Gates (measured, not inferred)

| Measurement | Command | Exit | Result |
|---|---|---|---|
| landed rows at the current tree | `node scripts/check-gate-registry.mjs --repo <fixture of SKILL.md+scripts> --rev HEAD --json` | 1 | 35 gates, 9 pre-existing findings (4 `e3` for `.ufo/waves/round-12/21/22` scripts, 5 `e1` for `check-c2-knowledge-round41`, `check-cited-receipts[-v2]`, `check-receipt-provenance`, `check-secondary-round62`); **no finding for either r70 row**; rev `5bbb48f…` (`receipts/patch-baseline.json`) |
| + battery row patch | same | 1 | 36 gates, same 9 findings (none added, none removed); battery row conformant, `missing: []`; rev `4f2a5f2…` (`receipts/patch-after.json`) |
| pre-landing draft, variant A | same, standalone fixture | 0 | clean, 3 rows, 4 gates, `nonconformant: 0` (`receipts/registry-fixture-final.json`, rev `fc5dc911…`) |
| pre-landing draft, variant B (as frozen) | same | 1 | `e2-field-incomplete` ×3, `latest row missing: selftest` (`receipts/registry-fixture-b.json`, rev `bf69b34…`) |
| pre-landing draft, variant C (wrapper absent) | same | 1 | `e3-row-script-absent` (`receipts/registry-fixture-c.json`, rev `c8dc3cb…`) |
| my proposed wrapper, battery leg | `node scripts/selftest-r70-gates.mjs --selftest --scratch <ABS> --gate synthtap --json` (superseded copy) | 0 | 95/95, `coverageGap []`, 2.3 s (`receipts/wrapper-synthtap.json`) |
| my proposed wrapper, verifier leg | same, `--gate live-verify` | 0 | 4/4 refusals as expected (`receipts/wrapper-live-verify.json`) |

Header lines behind the row fields: counter entry `:3-4`, verdict map `:5`, `--list-checks`
`:4`/`:50`, no writes; battery entry `:3-5`, verdict map `:10`, coverage rule `:8-9`, writes
`:109`/`:122-125`; verifier entry `:27-31`, verdict map `:32-33`, write scope `:34`,
singleton-socket refusal `:132-133`, PROFILES `:6-25`.

## Touched surfaces

- `.ufo/waves/round-70/w1/R70Scribe/registry-rows.md` — landed-state field check, battery-row
  patch, capability row, superseded measurements, findings.
- `.ufo/waves/round-70/w1/R70Scribe/receipts/` — `patch-baseline.json`, `patch-after.json`,
  `registry-fixture-{a,b,c,final}.json`, `wrapper-synthtap.json`, `wrapper-live-verify.json`,
  `section-asfrozen.md`.
- `.ufo/waves/round-70/w1/R70Scribe/superseded/` — `section-draft.md`,
  `selftest-r70-gates.mjs` (my pre-landing proposal; the lane's wrapper supersedes it).
- `.ufo/waves/round-70/w1/R70Scribe/report.md` and `.ufo/waves/round-70/w1/R70Scribe.md` (this
  report, both paths).
- Scratch `/fast/scratch/hyaku/tabi-r70/R70Scribe/` — created, used, removed.

## Findings

- **F1 — landed entry cells drift from the headers (not repaired, L1's call).**
  `SKILL.md:3158` makes `--expect-driver-sha256` mandatory and drops `--json`, while
  `scripts/check-synthtap-r70.mjs:3-4` marks both optional; `SKILL.md:3160` omits `[--no-run]` and
  the control-only `--driver`/`--driver-sha256` that `scripts/verify-live-r70.mjs:27-31` accepts.
  Both cells are valid invocations, not false statements.
- **F2 — the battery has no gate row in the landed section**, though the assignment asks for one
  row per script. Patch supplied in `registry-rows.md` §2 with the clause edit that removes the
  battery from "Instruments without a gate verdict"; measured +1 gate, 0 new findings.
  Reproduce: `node scripts/check-gate-registry.mjs --repo <fixture> --rev HEAD --json`.
- **F3 — registry checker prose loophole (outside this seat).**
  `scripts/check-gate-registry.mjs:229` tests `/--self-?test\b/` against the whole cell, so a cell
  that merely mentions the flag passes; my first variant-B attempt passed `check-synthtap-r70`
  for that reason before I removed the token from the prose.
- **F4 — wrapper name inheritance.** A script named only in another row's self-test cell enters
  the gate set under the first naming row's name (`scripts/check-gate-registry.mjs:254-257`); the
  landed wrapper reports as `check-synthtap-r70` at line 3159. Conformant, but the reported name
  is not its own.
- **F5 — scratch length ceiling.** `scripts/verify-live-r70.mjs:132-133` refuses a Chromium
  singleton-socket path over 107 bytes before any launch; the landed row's `<short ABS dir>` and
  the wrapper's `live` leg both depend on it. My first wrapper draft nested a `mkdtemp` under a
  long scratch and would have failed its own assertion (fixed before the recorded run).

## Out of scope / not done

- No `SKILL.md`/`SCORECARD.md` edit, no commit, no push, no judge invocation, no live Chromium run
  (the wrapper legs are refusal-only; the live derivation is the already-scored
  `scored/c1-verify-live-L1.json` / `c2-verify-live-L1.json`).
- The capability row is capability-only (r69 row shape); counts stay in the round's C1 row and the
  receipts.
- The battery-row patch is text for L1; this seat did not integrate it.
