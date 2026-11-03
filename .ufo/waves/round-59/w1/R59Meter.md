# R59Meter — v19 adjacency meter generation (C1)

Round 59, wave w1, claim C1 (adjacency). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Base revision `4e7fb89d7b71a6fdf661680891440be6577759e8`. Author: R59Meter (leaf; no dispatch).

Deliverable: the v19 meter generation = v18 + the frozen declared change set (a)-(e)
from `.ufo/waves/round-59/claims.json` C1 (including the L1's pre-data pins
`preDataCorrection`, `mutantsC1`, and the three pin messages of 2026-11-03: kama
trio/M6, M1 direct observable, and the pre-freeze multi-file keying case).
No corpus ledger was written; no commit, push, stash, checkout or mutating jj
command was run anywhere.

## Artifacts (final)

| path (relative to the lane root) | sha256 | role |
|---|---|---|
| `.ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs` | `0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c` | THE instrument (one file) |
| `.ufo/waves/round-59/counters/adj-v19-selftest.json` | `7f4a1acd1f8a1aeb1a011bdb87a3313c7a9dc6d080964df82d38e70f7b11d336` | `--selftest` receipt: allPass true, 38 cases, 38 pass |
| `.ufo/waves/round-59/counters/adj/v19-probes-red-on-v18.json` | `97229d62e950cbceefc58d681970c7f23e5ff2bbf97199677222b452d9c631b8` | RED-ON-V18 proof (H1/H2/H3b + the multi-file keying pin) |
| `.ufo/waves/round-59/counters/v18-v19-meter.diff` | `82eec49616f6aa3df143419e55049d93bd987da7920112ebf5c9410b1e419422` | `diff -u` v18 → v19 |
| `.ufo/waves/round-59/adj/v19-line-audit.txt` | `fdec3bb56f0c49eaca0b197c9b7dc5d29b127cccbf8819dca5ffa340ae857ba1` | every differing non-comment line accounted against (a)-(e) |

Base meter (never edited): `.ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs`,
sha256 `3afade4ea188d5b8420ff7494a8bdb70724dab2aa6cf56e13a885cc9d27c45b2`
(the scratch copy used for the probes has the same sha).

### Pre-final shas (single-write discipline disclosure)

The meter was composed and written once, then extended in place twice on the L1's
later pre-data pins (kama-shaped trio + M6 fixture; then the M1 direct observable).
Both earlier states were reconstructed byte-for-byte from the final file by
reverse-applying the exact edits, and each reconstruction was verified by its own
`--selftest` case count:

- initial single write (32 cases): `739f822826bf8a4f1ed990a394eadb43e8f5d1e4145128ea734b19ddb1373c81`, `--selftest` 32/32.
- after the L1 kama/M6 pin, before the M1 fix (37 cases): `cc11af86f5a86c96310ed210dd4665f68c88f6dd9dbddc6df8c89362ac552e1c`, `--selftest` 37/37.
- after the M1 fix, before the L1's pre-freeze multi-file pin (37 cases): `7c4e4b5d2c909f68803454bc4c3338f2846a6d98839d3470398989b6c3641073`, `--selftest` 37/37.
- final (38 cases): `0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c`, `--selftest` 38/38.

## The declared change set as implemented

- **(a) relabel.** `AUDIT_REL`/`DELTA_REL` = `corpus/adjacency-host-{audit,delta}-r59.tsv`;
  every schema string is `tabi-adjacency-host-v19` (die, run output, selftest);
  the emitted predicate sentence names the r59 ledgers and the new (d)/(e)
  clauses and says "no invented row"; usage/header name round 59.
- **(b) ROUTED D5/N1 — harness findings term.** The truth table gains
  findings-mismatch rows: `caseOk({expect:1, ids:['alpha'], assertPredicate:false},
  [{id:'beta'}], false) === false` and the count-match twin. Because the
  findings-term drop would also make the guard's own verdict pass, the selftest
  run loop ANDs a `direct` observable evaluated outside `caseOk`; a findings-term
  drop now fails both new cases (verified, see mutants).
- **(c) ROUTED D5/N2 — map-ref parse.** `parseRef` rejects non-strings, a missing
  `@`, a missing/duplicate-colon shape, a non-all-digit suffix, and any suffix
  that is not a positive safe integer. Five new cases pin alpha-only `x`, empty,
  signed `-1`, no-`@`, no-second-colon; each produces exactly one
  `map-ref-unparseable` (`assertFindingCount 1`).
- **(d) ROUTED D5/A4+N3 — the new screened surface.** `screenTargets` = every
  roster sibling other than tabi × {`PROVINCE.md`} ∪ {every file its adjacency
  rows reference}. A present screened file with no `(lane, relPath)` lane row is
  `bg-screen-missing`; a hit line in such a file with no line row is
  `bg-hit-unadjudicated`. All byte reads inside one `verify()` are memoized
  (`read()`), so the 20-lane/25-file screen costs one git read per pair and
  cannot flap mid-run. `counts.bgScreenSiblings` is derived from `screenTargets`
  (structurally == roster == 20), never hardcoded.
- **(e) ROUTED D5/A5+N4 — stray line rows.** Line rows are indexed by
  `(lane, relPath, line)`. A line row whose lane has no lane row is
  `orphan-line-row`; one whose `relPath` was never screened for that lane is
  `line-row-unscreened-file`; one on a screened file whose line is not a hit is
  `delta-line-invented` (keyed by path, so a hit number from another file cannot
  satisfy it). The predicate sentence states no invented rows.

**Two design decisions disclosed to the L1 and R59Rebind:** (1) `bg-screen-missing`
is a new finding id inside (d) (a present screened file must be *recorded*, not
only its hit lines adjudicated); (2) a hit line with no line row yields
`delta-line-missing` when the file has a lane row (v18 id carried unchanged) and
`bg-hit-unadjudicated` when it has none — both are findings, never a pass, so the
predicate direction is unchanged.

## Selftest — 38 cases, all pass

`node .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs --selftest`
→ exit 0, `allPass true`, cases 38, pass 38 (receipt above).

- 20 carried v18 cases, unchanged: honest-green, audit-missing,
  status-mismatch-moved, stale-misclaimed, moved-claimed-honestly-green,
  moved-note-wrong-line, file-absent-at-head-honest-green, file-absent-misclaimed,
  roster-lane-uncovered, delta-quote-spliced, lane-screen-sha-mismatch,
  lane-screen-hits-mismatch, delta-line-missing, delta-line-invented,
  audit-duplicate, lane-screen-head-mismatch, predicate-assert-green,
  predicate-assert-partial, map-ref-unparseable, harness-guard.
- 18 new: `harness-guard-findings-predicate-match`,
  `harness-guard-findings-count-match` (b); `map-ref-alpha-suffix`,
  `map-ref-empty-suffix`, `map-ref-signed-suffix`, `map-ref-no-at`,
  `map-ref-no-second-colon` (c); `bg-hit-unadjudicated-map-lane`,
  `bg-screen-missing-zero-hit` (d); `orphan-line-row`,
  `line-row-unscreened-file`, `cross-file-hit-number-wrong-file` (e);
  `kama-invented-row`, `kama-quote-spliced`, `kama-head-citation`,
  `kama-mixed-forgery` (newly screened kama-shaped lane: map-referenced
  non-PROVINCE file, invented/quote/head + mixed forgery),
  `kama-screen-weakening-observable` (M6: a `playwright`-only hit in a
  map-covered lane's non-PROVINCE file with no screen row; a gutted BG_WORDS
  loses the hit, a shrunk scope loses the screen), and
  `kaidoku-multi-file-keyed-green` (the L1's pre-freeze pin for R59Connector's
  measured hazard: ONE lane over THREE relPaths with correctly quoted rows each
  must be green; lane-only keying emits spurious `delta-line-invented`).

## RED-ON-V18 proof (real git fixtures)

Each probe is a real git fixture repo (map + r58/r59 audit/delta names with
identical rows) plus a real sibling git fleet; both CLIs were run with the same
`--rev/--repo/--fleet`. Full commands, exits, findings, fixture file shas and
lane heads are in `counters/adj/v19-probes-red-on-v18.json`.

| probe | v18 (same fixture) | v19 (same fixture) |
|---|---|---|
| H1 map-only lane with BG hits, no delta row | exit 0, predicate true, ids `[]` | exit 1, `bg-screen-missing`, `bg-hit-unadjudicated` |
| H2 line row whose lane has no lane row | exit 0, predicate true, ids `[]` | exit 1, `orphan-line-row` |
| H3b cross-file line row with a hit number | exit 0, predicate true, ids `[]` | exit 1, `line-row-unscreened-file` |
| H4 (pin) one lane × three relPaths, all rows correct | exit 1, six spurious `delta-line-invented` (lane-only invented check) | exit 0, predicate true, ids `[]` |

H4 is the R59Connector-measured hazard pinned as a fixture: with v18's lane-only
line-row scoping a *correct* multi-file ledger reds; with the (lane, relPath)
keying the same ledger is green. The rebind writes exactly this shape (25 lane
rows over 20 lanes: kaidoku 3 files, kake 2, kama 2, kumitate 2).

## Live pre-data integration (scratch ledger, real fleet)

Two independent acceptance checks agree:

1. My own scratch check (`/fast/scratch/.../integration`, deleted): a scratch repo
   holding `corpus/adjacency.tsv` from the lane HEAD plus an r59-shaped audit/delta
   ledger generated from the live fleet at ONE head snapshot (20 lanes, 25 files,
   140 line rows; dispositions carried from delta-r58 by exact lane+path+quote,
   109 hits given a scratch-only synthetic `no-tabi-ground`). Run:
   `node <v19> --rev <scratch rev> --repo <scratch repo> --fleet /home/vgpnk/Projects/shokunin --json`
   → exit 0, predicate true, findingCount 0, counts
   `{roster 20, mapRows 16, auditRows 16, deltaLanes 20, bgScreenSiblings 20}`.
2. R59Rebind's independent dry run of `adj/rebind-r59.mjs` against the live fleet,
   which preflights through this meter's `verify`/`predicateFrom`
   (`adj/rebind-r59-preflight-v19core.json`): `ok true`, `findings 0`,
   `predicate true`, counts `{20, 16, 16, 20, 20}`, 25 screened files, 140 line rows.

The synthetic dispositions are a scratch acceptance device, not a data claim: the
L1's data pass must adjudicate the 109 hits that delta-r58 does not carry, or the
rebind exits 3 (unresolved, nothing written).

## Commands run and outcomes

| command | outcome |
|---|---|
| `node --check .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs` | exit 0 |
| `node …/c1-adjacency-host-v19.mjs --selftest` | exit 0, allPass true, 38/38 |
| `node <scratch v18 copy> --rev <fixture> --repo <fixture> --fleet <fixture> --json` ×4 | exit 0 on H1/H2/H3b (findings `[]`); exit 1 on H4 with six spurious `delta-line-invented` |
| `node <v19> --rev <fixture> --repo <fixture> --fleet <fixture> --json` ×4 | exit 1 on H1/H2/H3b (new ids); exit 0 on H4 (keyed, green) |
| `node <v19> --rev <scratch rev> --repo <scratch repo> --fleet /home/vgpnk/Projects/shokunin --json` | exit 0, counts `{20,16,16,20,20}`, 0 findings |
| scratch mutation sanity (copies of the meter) | M1 findings-term drop KILLED (2 cases); M2 accept-all-suffixes KILLED (4); M3 bg-hit-unadjudicated removal KILLED (2); M4 orphan removal KILLED (1); M5 faithful lane-only relaxation KILLED (5); M6a BG_WORDS gut KILLED (5); M6b scope shrink KILLED (3) |
| `diff -u v18 v19 > counters/v18-v19-meter.diff` | exit 1 (differences), 794 lines |
| fixture `git init/add/commit` | scratch only; `git rev-parse --show-toplevel` asserted each fixture dir before every commit |

The mutation runs are scratch self-checks, not the official kill receipts —
R59MutMeter owns `mutant-meter/M1-kill.json .. M6-kill.json`.

## Diff discipline

`counters/v18-v19-meter.diff` (794 lines) and `adj/v19-line-audit.txt`:
**318 differing non-comment lines (47 DEL / 271 ADD), 0 unaccounted, 0
mapped-but-unchanged**; per rule (a) 14, (b) 23, (c) 12, (d) 80, (e) 189.
Comment-only hunks: the rewritten header, the `rosterScan`/`caseOk` comment
updates, and the one comment line inside the replaced P3 block.

## Risks / open items (routed, not smoothed)

1. **`bg-screen-missing` is a new id** inside (d). The claims text names
   `bg-hit-unadjudicated` for unadjudicated hits; the missing screen *record* is
   the second half of N3 and needs an id. If the verifier insists on only declared
   ids, this is the one addition to review.
2. **Id partition for a missing adjudication** (`delta-line-missing` when the file
   has a lane row, `bg-hit-unadjudicated` when it has none). Observationally
   identical (both red); chosen to carry all 20 v18 cases unchanged.
3. **109 hit lines lack a carried r58 disposition** at the live snapshot; the data
   pass needs real adjudications (R59Rebind's drafts exist). The rebind aborts 3
   rather than write a half-adjudicated ledger.
4. **Snapshot race.** Sibling heads move mid-round. The meter re-snapshots at run
   time and binds every lane row to that head; a head moved after ledger
   generation is `lane-screen-head-mismatch`. The L1 must generate and measure at
   ONE fresh snapshot.
5. **M2 equivalent-class note.** `parseRef` is layered (regex + `Number.isSafeInteger`
   + `ln >= 1`), so a mutation that only weakens one layer still rejects the five
   malformed shapes (behaviour-equivalent). The pinned M2 class — accepting the
   suffixes — is killed by the five cases.
6. **Synthetic dispositions** in my integration check are scratch-only and are not
   evidence about provincial content.
7. **Pre-freeze amendment.** The L1's final pin (R59Connector routing note 1) added
   `kaidoku-multi-file-keyed-green` after the first 37-case freeze candidate, so
   the meter sha moved `7c4e4b…` → `0f956f…`. `verify()` is unchanged between those
   two shas (only the selftest case array and its helpers); the final sha is the
   one to pin. The independent rebind dry run was taken against the pre-amendment
   core; my own final-sha integration run repeats green with identical counts.
   The H4 fixture reproduces the measured class at small scale (six spurious
   `delta-line-invented` events instead of the connector's 81 on the full
   multi-file ledger); the failure mode is identical.
8. No corpus path, `.ufo/state/`, `MANIFEST.json`, fleet-root tracked file or
   sibling seat file was written. `adj/v19-line-audit.txt` is the only file I wrote
   in `adj/` (explicitly named by this seat's item); R59Rebind's files there are
   its own.
9. Tooling: none installed or upgraded; pacman untouched (host-wide pause honored).

Scratch `/fast/scratch/hyaku/tabi-r59/R59Meter/` was deleted before yield, after
every receipt cited above was copied into the wave directory; no /tmp or scratch
path is cited as evidence.
