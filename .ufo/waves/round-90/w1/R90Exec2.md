# R90Exec2 — C1 leg (b) re-measure (Tabi round 90, wave w1)

Seat: R90Exec2 (executor, axes: operability). Milestone: leg (b) re-measure.
Scratch: `/fast/scratch/hyaku/tabi-r90/R90Exec2` (receipts copied to this dir, then removed).
No lane file was edited. No commits, no subagents, no background services left running.
Tool installs: none (archived host policy: no pacman transactions attempted).

## Short verdict

- Battery: **reproduced green on the frozen bytes** — 226 cases, 0 failed, coverage declared 107 / covered 107 / uncovered `[]`, exit 0 (twice, on the counter `b54cba19` + battery `2f11fff` pair).
- Kill power: **0 survivors, 0 crashed, 0 unapplied** on the current pinned pair — 76 mutants, 76 killed, exit 0 (measured twice: `05bbe353` and `17175f0b` kill-power revisions).
- Selftest: **not verified by this seat on the current pin.** The last selftest that completed gave `clean:false` with 5 red gates (older selftest revision); the selftest revision pinned at 11:40 (`19122bee`) **crashes at module init**; the revision pinned at 11:49 (`20b89c65`) was still running when Main stopped the wave and was cancelled. No gate list for `20b89c65` exists from this seat.
- **Instrument freeze moved five times during this one seat's measurement** (11:23:23, 11:31:53, 11:40:10, 11:49:01 re-cuts inside one 40-minute window). Leg-(b) numbers below are therefore labelled by the hash set they were measured on; "the frozen bytes" is ambiguous in this round.

## Bytes actually measured (sha256 of lane scripts, observed)

Freeze as read at seat start (call it v1) did not match disk for the battery:
`06c67275…` pinned vs `6dc63daf…` on disk; kill-power `686cb665…`.

| revision | freeze mtime | counter | battery | kill-power | selftest | drift |
|---|---|---|---|---|---|---|
| v1 (at seat start) | — | `1d3dfb0b…` | pin `06c67275…`, disk `6dc63daf…` | `686cb665…` | `0da4d405…` | `32a3595d…` |
| v2 | 11:23:23 | `1d3dfb0b…` | `6dc63daf…` | `95f59965…` | `0da4d405…` | `32a3595d…` |
| v3 | 11:31:53 | `6f65a0d4…` | `2f11fff…` | `05bbe353…` | `0da4d405…` | `32a3595d…` |
| v4 | 11:40:10 | `b54cba19…` | `2f11fff…` | `17175f0b…` | `19122bee…` | `bd33d158…` |
| v5 | 11:49:01 | `b54cba19…` | `2f11fff…` | `17175f0b…` | `20b89c65…` | `bd33d158…` |

Driver `ac5a7a5e…` and prior probes (`cb4d260e…`, `ed44bd6f…`) stayed fixed throughout.

## Battery (C1 leg b, first half)

| bytes | cases | failed | declared | covered | uncovered | unknown | exit |
|---|---|---|---|---|---|---|---|
| v1/v2 pair (counter `1d3dfb0b`, battery `6dc63daf`) | 225 | 0 | 107 | 107 | `[]` | `[]` | 0 (exit derived from the instrument's own `failed===0 && uncovered.length===0` rule; shell status not captured on that run) |
| v3 (counter `6f65a0d4`, battery `2f11fff`) | 226 | 0 | 107 | 107 | `[]` | `[]` | **0** (24.8 s) |
| v4/v5 (counter `b54cba19`, battery `2f11fff`) | 226 | 0 | 107 | 107 | `[]` | `[]` | **0** (24.3 s) |

No failing case, no uncovered check. The 225→226 growth is the added `send-log-settle-on-plain-leg` case (line 192 of the current battery, expected id `send-log-allowlist`, `alsoAllowed ['plan-calls']`) — the r90 settle expression is now refused on a non-domread leg.
Receipts: `w1/R90Exec2-battery-v4.json` (v4/v5 run); earlier runs were scratch-only.

## Kill power (C1 leg b, second half)

| bytes | mutants | killed | survived | crashed | unapplied | exit |
|---|---|---|---|---|---|---|
| kill-power `686cb665` (v1) + counter `1d3dfb0b` + battery `6dc63daf` | 74 | 73 | **1** | 0 | 0 | 1 |
| kill-power `95f59965` (v2) + counter `1d3dfb0b` + battery copies switched to `2f11fff` at 11:30:41 **mid-run** | 74 | 74 | 0 | 0 | 0 | 0 |
| kill-power `05bbe353` (v3) + counter `6f65a0d4` + battery `2f11fff` | 76 | 76 | 0 | 0 | 0 | **0** |
| kill-power `17175f0b` (v4/v5) + counter `b54cba19` + battery `2f11fff` | 76 | 76 | 0 | 0 | 0 | **0** |

Survivor names:
- `domread-settle-call-dropped` — the only survivor ever observed: "the battery still exits 0" on the v1/v2 byte pair (74 mutants, 73 killed). It weakens `if (settle.length !== 1) planBad.push(...)` in the counter's plan-calls block. On the later pins it is killed (`failed: 1`), i.e. the closed form depends on the newer battery/counter revision, not on the frozen pair that was in force at seat assignment.
- No other survivor on any run.

The v2 row is explicitly **not a clean pin set**: the battery path was rewritten while the run was spawning copies (kill-power reads the counter source once at start, but copies the battery per mutant), so rows that shifted failure counts (2→N) are byte-mixed and are reported only as an observation.

Receipts: `w1/R90Exec2-killpower-v4.json` (v4/v5 run, 76/76/0/0/0), `w1/R90Exec2-killpower-v2.json` (byte-mixed row).

## Selftest gates

### a) Last completed selftest run (instrument `0da4d405`, 11 gates, `clean:false`, exit 1)

Work `selftest-v2`; ran inside the window that the lane re-froze at 11:40:10 and rewrote the prior probes at 11:43:15.

| gate | ok | detail |
|---|---|---|
| pins-match-freeze | true | files whose sha256 differs from freeze.txt: `[]` |
| counter-clean | true | exit 0, verdict clean, checks 107, findings `[]` |
| battery | true | exit 0, cases 226, failed 0, coverage 107/107/`[]`/`[]` |
| kill-power | **false** | exit 1, mutants 76, killed 32, survived 0, **crashed 44** |
| nowork-control | **false** | exit 2, findings `["prior-unreadable"]` (expected exit 1 incl. `schema`) |
| noreceipt-control | **false** | exit 2, findings `["prior-unreadable"]` (expected exit 2 with `receipt-unreadable`) |
| tree-exempt-path-refused | true | exit 2, `tree-exempt-path-refused: the exemption interface is content-bound; pass --tree-exempt-sha256 <hex>` |
| tree-exempt-unmatched-refused | **false** | exit 2, findings `["prior-unreadable"]` (expected exit 1 with `prior-set-unmatched-exempt`) |
| gate-selftest | **false** | counter `--selftest` exit 0 ok; battery `--selftest` exit 1; kill-power `--selftest` exit 1; drift `--selftest` exit 0 |
| record-drift | true | exit 0, claims 8, mismatches 0 |
| capability-status | true | exit 0, rows 25, claimed 24, provisional 1, mismatches 0 |

The four red control/selftest gates and the 44 `crashed` mutants are consistent with the prior probes being rewritten inside that window (their mtime moved to 11:43:15 with identical sha256 to their pins) and with the instruments being replaced at 11:40:10 — i.e. this run does not describe any single frozen byte set. It is reported as measured, not as a verdict on v4/v5.

Receipt: `w1/R90Exec2-selftest-v2.json`.

### b) Selftest revision `19122bee` (pinned at 11:40:10) — unrunnable

```
file:///…/scripts/selftest-r90-gates.mjs:49
gate('expectations-present', () => ({ ok: !!expectFile && … }));
^
ReferenceError: Cannot access 'gate' before initialization
    at file:///…/scripts/selftest-r90-gates.mjs:49:1
    at ModuleJob.run (node:internal/modules/esm/module_job:561:1)
```
exit 1, empty JSON. Cause is structural: the new `gate('expectations-present', …)` call sits at line 49, three lines above `const gates = []; const gate = (name, fn) => …` (lines 51–52). The freeze pinned a gate instrument that cannot execute. It also introduced a dependency on `.ufo/waves/round-90/expectations.json` (exists, 11:39:47, identity: driver `ac5a7a5e…`, nonce `tabi-r90-l1-e573334c78fa`, fixture `5fb1f0f7…`, ports 19960/19961/19962, legs 41) and added the two prior-probe files to the pins-match-freeze file list.

### c) Selftest revision `20b89c65` (pinned at 11:49:01) — NOT measured

Two attempts: the first hit a 300 s command deadline mid-run (no JSON written); the second was still running when Main directed this report and was cancelled. This seat has **no gate list and no verdict** for `20b89c65`. Do not read a green selftest out of this report for the current pin.

## Operability findings (no repair performed — out of seat scope)

1. **The freeze is not stable across one seat's work.** Five distinct pin sets occurred inside ~40 minutes (`freeze.txt` mtimes 11:23:23, 11:31:53, 11:40:10, 11:49:01; the file as read at seat start already disagreed with disk on the battery). Any claim phrased "the frozen bytes" for C1 leg (b) must name the revision; the survivor/kill-power result flips between `06c67275`/`6dc63daf` + `1d3dfb0b` (1 survivor) and `2f11fff` + `b54cba19` (0 survivors).
2. **A freeze revision shipped an unrunnable gate** (`19122bee`, TDZ `ReferenceError`) and was later corrected to `20b89c65`. Nothing in the lane asserts that the pinned selftest at least parses/runs before it is frozen.
3. **Prior-set probes were rewritten under a live run** (`prior1.json`/`prior2.json` mtime 11:43:15, bytes identical to pins). During that window three counter control gates degraded to exit 2 `prior-unreadable` and 44 mutant runs crashed (non-0/1 exit without parseable JSON) — the counter's prior walk is read at every invocation, so control-gate verdicts are sensitive to concurrent rewrites of the prior files.
4. Battery/kill-power instruments and the counter are mutually coupled by path (battery resolves the counter as its sibling; kill-power copies the battery per mutant but reads the counter source once at start), so editing any one of them mid-run silently mixes bytes. This happened once here (the v2 row).
5. `counter-clean` held `checkCount 107` throughout, and battery coverage stayed `declared 107 / covered 107 / uncovered []` on all three measured revisions — the check-id surface did not move even though the settle rule did.
6. Nothing was written into the walked trees by this seat: all work went to `/fast/scratch/hyaku/tabi-r90/R90Exec2` and the receipts above.

## Files

- Report: `.ufo/waves/round-90/w1/R90Exec2.md` (this file).
- Receipts in `.ufo/waves/round-90/w1/`: `R90Exec2-battery-v4.json`, `R90Exec2-killpower-v4.json`, `R90Exec2-killpower-v2.json`, `R90Exec2-selftest-v2.json`, `R90Exec2-hashes-v4.txt`.
- Scratch `/fast/scratch/hyaku/tabi-r90/R90Exec2` deleted after the copies.
