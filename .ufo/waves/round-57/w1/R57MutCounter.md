# R57MutCounter — MUTATE-RUN-REVERT probe on the r57 Chromium receipt counter

Round 57, wave w1 (the only v1 wave). Seat: R57MutCounter (mutation tester).
Lane base revision: `ef43ececde883cc0368c6c7cfbabe30ef937b717`. Probe run 2026-11-03.
Read-only on the repo: every mutant is a scratch copy; no repo byte was edited.

## Probe target (frozen for this probe)

| item | value |
|---|---|
| counter | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-57/counters/chromium-receipt-r57.mjs` |
| bytes / mtime | 57848 bytes, 2026-11-03 16:12 |
| sha256 before probe | `94757af9771bb61c4877519009ff4972e0d593527b2224e979ec1d748042327a` |
| sha256 after probe | `94757af9771bb61c4877519009ff4972e0d593527b2224e979ec1d748042327a` (identical) |
| fixtures | `chromium-receipt-r57-fixtures/`, 153 files; manifest sha256 `1b9144ebd247a648…` (recorded in every receipt) |
| baseline `--selftest` (repo copy) | exit 0, `allPass true`, **70/70** cases, 43/43 ids covered |
| baseline `--selftest` (pristine scratch copy) | exit 0, `allPass true`, 70/70 — identical, so no baseline failure contaminates a verdict |

Byte freeze: the counter was authored mid-probe (the sha moved from `1eeb41e8…` to `94757af9…` at
16:12 while the R57Counter seat was still amending). The probe was run only after the bytes
settled: the sha was unchanged across the author's report landing, across the full mutant run and
across the cross-generation run. It also equals the sha published in `w1/R57Counter.md`
(`94757af9…042327a`), so the probe measures the authored bytes, not an intermediate.

Protocol per mutant (harness `/fast/scratch/hyaku/tabi-r57/R57MutCounter/mutate.py`):

1. copy counter + fixtures tree into scratch (`FIXTURES_DIR` resolves beside the counter, so the
   copy is self-contained; fixture copies are byte-identical — same manifest sha);
2. sha256 the pristine copy and run `--selftest` (**must pass**, else the mutant is inconclusive);
3. apply exactly ONE textual mutation — each anchor must occur exactly once, else the harness
   aborts rather than guessing;
4. sha256 the mutant, run `node <mutant> --selftest`;
5. **restore the pristine bytes byte-for-byte** (rewrite the pristine text, not a second copy),
   sha256 again, re-run `--selftest` (must pass again);
6. write the receipt (hashes, one-line unified diff, per-case output) and the TSV row.

A mutant is KILLED when `--selftest` reports `allPass false`; SURVIVED when it still reports
`allPass true`; INCONCLUSIVE if the pristine baseline had failed.

## 1. Five mutants, one logic change each — 5/5 KILLED

| mutant | target site | change | selftest | pass | killed by |
|---|---|---|---|---|---|
| c1 | `shift-modifiers-wrong` (per-entry modifiers check, ~l.609) | `if (e.modifiers !== (ride ? 8 : 0))` → `if (!ride && e.modifiers !== 0)` — the modifiers push no longer fires for an uppercase letter | FAIL exit 1 | 69/70 | `shift-modifiers-wrong` |
| c2 | `field3-not-empty` (control-leg witness, ~l.507) | `if (rec.field3Value !== '')` → `if (rec.field3Value == null)` — any non-null value accepted | FAIL exit 1 | 69/70 | `field3-not-empty-control` |
| c3 | `nonce-shape` / nonce-derived plan (l.215) | `NONCE_RE = /^tabi-r57-[0-9a-f]{12}$/` → `/^tabi-r57-.*$/` — any `tabi-r57-*` accepted, so the shift/chord plan is re-derived from an unvalidated nonce | FAIL exit 1 | 69/70 | `nonce-shape` |
| c4 | `server-log-echo-count` (~l.530) | `if (echoCount !== 1)` → `if (echoCount === 1)` — comparison inverted | FAIL exit 1 | 3/70 | `server-log-echo-count` + all three green fixtures (67 cases in total) |
| c5 | `schema-wrong` (~l.405) | `add('schema-wrong', …)` → `void 0` — push dropped | FAIL exit 1 | 67/70 | `schema-wrong`, `crossgen-r56-receipt`, `do-nothing-empty-object` |

Actual outputs (full per-case detail in `mutant-counter/mutant-c*.json`):

- **c1** — the mutated counter no longer flags an uppercase letter carrying `modifiers: 0`
  (the `shift-modifiers-wrong` receipt). Only that fixture changes: `got []`, `want
  ['shift-modifiers-wrong']`. The four other sites that can emit the same id (key/code/VK shape,
  ride-event modifiers) are untouched — a strictly minimal probe of the primary push.
- **c2** — the `field3-not-empty-control` receipt carries `field3Value: "x"`; under the mutant the
  check accepts it (`got []`). The green fixtures keep `field3Value: ""`, so the pass branch is not
  disturbed; the negative witness is what catches the defect.
- **c3** — the `nonce-shape` receipt carries an 11-hex tail (`tabi-r57-0f1e2d3c4b5`). Pristine:
  `nonce-shape` + `couldNotEvaluate: ["nonce-unusable"]`. Mutant: both gone — the counter now
  re-derives the whole shift/chord plan from the malformed nonce instead of declaring it unusable.
- **c4** — the inverted comparison fires on the clean receipts (one `/echo`) and stays silent on the
  two-echo negative fixture: 67 of 70 cases fail, including `server-log-echo-count`,
  `green-synthetic`, `green-window-form`, `green-extra-step` and both crossgen fixtures.
- **c5** — dropping the push leaves `schema-wrong`, `crossgen-r56-receipt` (which asserts the exact
  schema-refusal set) and `do-nothing-empty-object` failing; the cross-generation guard is real,
  not incidental.

All baselines passed and all harvests produced `allPass false` with `exit 1`, so every verdict is a
kill, none inconclusive.

Restoration evidence (before / mutant / after, all recorded in `results.tsv` and the receipts):

| mutant | pristine sha256 | mutant sha256 | restored sha256 | restored selftest |
|---|---|---|---|---|
| c1 | `94757af9…042327a` | `b5182df0…a5a0447` | `94757af9…042327a` | exit 0, 70/70 |
| c2 | `94757af9…042327a` | `6f502591…52a08a64` | `94757af9…042327a` | exit 0, 70/70 |
| c3 | `94757af9…042327a` | `2f8dddab…f64625aa` | `94757af9…042327a` | exit 0, 70/70 |
| c4 | `94757af9…042327a` | `bf89d04f…067a657c` | `94757af9…042327a` | exit 0, 70/70 |
| c5 | `94757af9…042327a` | `2afed59f…f3b42889` | `94757af9…042327a` | exit 0, 70/70 |

Each mutant differs from pristine by exactly **one source line replaced** (`changed_lines 2` =
one `-`/`+` pair in `mutant-diffs.diff`); no other hunk exists.

## 2. Cross-generation pre-validation (scratch fixture files)

Six probes, each re-running a *counter* against a *fixture receipt* of the other generation, staged
in scratch (`xgen/`). Receipts: `mutant-counter/xgen-x*.json`.

| probe | counter | receipt | exit | predicate | findings |
|---|---|---|---|---|---|
| x1 | r56 | r57-shaped (`crossgen/r57-for-r56.receipt.json`, schema `tabi-chrome-cdp-r57`) | 1 | false | `schema-wrong`, `nonce-shape`, `control-enter-submit-wrong` |
| x5 (control) | r57 | the **same** r57-shaped bytes | 0 | **true** | `[]` |
| x2 | r57 | r56-shaped (`receipts/crossgen-r56-shaped.receipt.json`) | 1 | false | `shift-trace-missing`, `chord-missing`, `field3-named`, `keylog-absent` (exact set **and order**) |
| x3 (control) | r56 | frozen r56 green (`green-synthetic.receipt.json`, round 56 fixtures) | 0 | **true** | `[]` |
| x4 | r57 | the **same** frozen r56 green bytes | 1 | false | `schema-wrong`, `nonce-shape`, `shift-trace-missing`, `chord-missing`, `field3-named`, `keylog-absent`; `couldNotEvaluate: ["nonce-unusable"]` |
| x6 | r56 | independently authored r57-shaped fixture (`mutant-counter/fixtures/…`) | 1 | false | `schema-wrong`, `nonce-shape`, `control-backspace-witness-wrong`, `control-restore-witness-wrong`, `control-enter-submit-wrong` |

Reading the directions:

- **Direction 1 (r56 counter refused by the r57 generation):** x1 and x6 both exit 1 with
  `schema-wrong` first. x1 is the counter author's own cross-generation receipt, x6 is an
  independently authored r57-shaped fixture (schema/nonce/journey.form additions written to the
  R57Runner receipt contract before the counter was inspected), so the refusal is not a property of
  one hand-built file. The x5 control shows the identical x1 bytes are **green under the r57
  counter** — the same bytes are accepted by the generation they belong to and refused by the
  generation they do not.
- **Direction 2 (r57 counter refused by the r56 generation):** x2 fires the new chord ids with
  `shift-trace-missing` first, exactly the author's declared `expectOrder`; x4 fires them on the
  frozen r56 green receipt, where `schema-wrong` and `nonce-shape` necessarily precede because that
  file still carries the r56 schema/nonce. The x3 control shows that same frozen r56 green is
  accepted (exit 0) by its own generation, so x4's refusal is generation-specific, not a broken
  fixture.
- Fixture pins: every receipt carries the `driverSha256` of its generation's `driver-stub.mjs`
  (r56 `e444778c…`, r57 `01c167a9…`), so no `driver-sha-mismatch` noise pollutes the
  schema refusal. The r57-shaped fixtures carry the six r56 step names (the r57 runner keeps
  `STEP_NAMES` at six and adds its extra shots outside `steps`), so no `steps-missing` noise
  either.

These are the two cross-refusal directions C2 names; the L1 re-measures them on committed bytes
with the frozen command, and the receipts here are the pre-validation baseline.

## 3. Observations (coverage findings — no contract change)

- **c1, c2, c3 are each caught by exactly one fixture.** The kill surface is precise but
  single-fixture-dependent: if `shift-modifiers-wrong.json`, `field3-not-empty-control.json` or
  `nonce-shape.json` were dropped or its expected set widened, the corresponding mutant would
  survive. Each currently asserts the exact set (and `nonce-shape` also asserts the exact
  `couldNotEvaluate` code), which is what makes the kill possible.
- **c3's second line of defence is the `couldNotEvaluate` assertion.** The `nonce-shape` case
  asserts `expectCouldNotEvaluate: ["nonce-unusable"]` in addition to the finding; under c3 both
  vanish, so the case fails twice over. A generation that keeps the shape regex but drops the
  unevaluable declaration would only be half-probed by the assertions as they stand.
- **c4 shows the pass branch is load-bearing.** Inverting one comparison breaks 67/70 cases,
  because the three green fixtures plus the crossgen pairs all assert `GREEN`. A counter with no
  green fixtures would have been killed by only the single negative case.
- **The `idCoverage` gate is not exercised by any of these five mutants.** None of them removes an
  id from the fixture corpus, so `fixture-id-coverage` never fails; that is expected for
  logic-level mutants and is not a gap in this probe (the gate guards fixture deletion, a different
  mutation class).
- **No survivor, so no missing-case recommendation is due.** Unlike the r56 m4b survivor, all five
  probes are caught by fixtures that already exist at the frozen bytes.

## 4. Restoration and hygiene

- The repo copy of the counter was **never edited**: sha256 before and after the probe are both
  `94757af9…042327a`; the repo fixtures tree was only read (manifest sha identical to every scratch
  copy).
- All mutant bytes lived under `/fast/scratch/hyaku/tabi-r57/R57MutCounter/`; the scratch root was
  deleted after the receipts were copied into `mutant-counter/`. The receipts retain the hashes and
  the exact one-line diffs, so the probe is reconstructible without the scratch tree.
- No mutating git/jj command was run anywhere. No live Chromium run was performed (the data pass
  belongs to the L1); the probe used only the counter's own fixtures and scratch copies.
- No tools installed or upgraded; PACMAN untouched; `node v24.21.0`.

## Artifacts

| path | content |
|---|---|
| `mutant-counter/results.tsv` | the five-mutant table: target, mutation, expected detector, selftest exit/pass/cases, failing fixtures, verdict, pristine/mutant/restored sha256, `restore_exact` |
| `mutant-counter/mutant-c1.json` … `mutant-c5.json` | one receipt per mutant: exact anchor replacement, unified diff, per-case selftest output, before/after hashes, restore re-run |
| `mutant-counter/mutant-diffs.diff` | the five one-line mutations, aggregate |
| `mutant-counter/xgen-x1…x6-*.json` | the six cross-generation probes (counter CLI JSON: predicate, findings, couldNotEvaluate, paths) |
| `mutant-counter/fixtures/` | the independently authored r57-shaped receipt (`r57-shaped-for-r56-counter.receipt.json`, sha256 `b7b88e98…52d2e04b`) + its six PNG siblings, so x6 is re-runnable on committed bytes |

## Verdict

- All five assigned mutants are **KILLED by `--selftest`** at the frozen counter bytes
  (`94757af9…`), each by exact-findings fixtures, each restored byte-exactly and re-verified green
  (70/70).
- The counter's declared semantics hold under every single-line defect: dropping the
  modifiers/schema/field3 pushes, loosening the nonce regex, or inverting the echo-count
  comparison all change the selftest outcome.
- Both cross-generation refusal directions are pre-validated on scratch fixture files and are
  paired with controls proving the same bytes are accepted by their own generation.
- No survivor; no claim, predicate or kill rule was touched.
