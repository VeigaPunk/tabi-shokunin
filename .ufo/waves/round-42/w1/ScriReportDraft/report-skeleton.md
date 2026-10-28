# tabi — round 42 report (DRAFT SKELETON — L1 completes; not a filed report)

> **Status of this file.** Skeleton only. Every section below carries the frozen facts that
> exist at the freeze/HEAD as observed by the `ScriReportDraft` seat on 2026-10-28 (commands
> and outputs in that seat's `report.md`). Slots marked **PENDING** are not assertions: each
> names the exact command/artifact/owner that fills it. No claim verdict is stated here.
>
> Lane: tabi · Round: 42 · Wave: `w1` (one policy-v2 wave, 64 seats) · L1: `TabiR42`
> Baseline: `34e177959d1b7ce04afb85a001420e02631ce79e`
> Freeze (claims before any seat data): `9b6de3a19de11abdb80e82a1310abc64a40215bb`
> Draft-time HEAD: `0081bfdb93b6bd1bf2853bb128996f1a976b7218` (2026-10-28T12:26:20-03:00,
> "round-42: SCORECARD declared-claims section (frozen predicates, C1/C2)")
> Final measured revision / tip hash: **PENDING (L1)** — no seat may commit in this wave.
> Axes at round start: adjacency 8 (lowest), depth 9, coverage 9, operability 9, freshness 9,
> calibration 9; saturation 8, stagnation window 3; stagnation nudge active (no capability
> entered rounds 39–41) → lowest-axis obligation waived, C1 is the capability/frontier move.
> Frozen claims: `.ufo/waves/round-42/claims.json` (C1 coverage capability, C2 calibration).

## Work performed

- **Fresh-start declaration before data.** The round-41 verifier spot-check
  (`corpus/lessons/round-41-verifier-spotcheck.md`, `rejected-honest-stop`, admitted=false,
  D1–D4) and the r39/r40 reports were read first; both predicates, kill rules and counting
  commands were frozen at `9b6de3a…` in `.ufo/waves/round-42/claims.json` before any seat
  scored. Three prior closures were rejected (r39 proxy counter + self-referential D6; r40 F4
  wrapper bypass; r41 wave never dispatched + D1 uncommitted evidence, D2 non-verbatim S146
  quote, D3 empty baseline control, D4 quarantine re-adjudication owed).
- **C1 (coverage, capability acquisition) — counted once, live.** Counting command
  `node scripts/measure-c1-round41.mjs --out corpus/evidence/round42/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r42/L1-measure/run`
  → exit 0 (`measure/c1-measure.exit` = `MEASURE_EXIT=0`), `driverExit 0`, `counterExit 0`,
  counter `predicate true` with `findings []`, `nonceMatches true`, `elapsedMs 38384`; driver
  report `runs 2`, `egress 0`, `survivors 0`, `binding true`, nonce
  `94c0f0efa48293b3ed923bd9717b5c2702b5f89f3fd45ffd51c980ba8e4e21ab`. Produced receipt
  `1,145,258 B` sha256 `3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e`,
  witness `1,122,212 B` sha256 `163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339`
  (`measure/c1-measure.json`). **At draft time both files are untracked**
  (`git status --porcelain` → `?? corpus/evidence/round42/`), so C1's "committed at the
  measured revision" leg is not yet satisfied.
- **Producer identity.** `sha256sum` of the three pinned producers equals the pins in
  `claims.json`/`c1-measure.json`: `measure-c1-round41.mjs` `4563e5de…95c76`,
  `playwright-firefox-egress-round41.mjs` `fb279c74…9180a3`,
  `c1-session-bound-v4.mjs` `cd71a59e…cff126a`.
- **C1 pre-data controls (2026-10-28).** `--battery` 6/6 pass (`BATTERY_EXIT=0`; five
  contamination vectors exit 2 `environment-loader-contamination`, clean exit 0) —
  `controls/c1-battery-r42.json`. Counter v4 replays under fresh nonces refuse:
  r39 `R39_REPLAY_EXIT=1`, r40 `R40_REPLAY_EXIT=1`, r41 committed receipt
  `R41_REPLAY_EXIT=1` (`run-nonce-mismatch`, `witness-nonce-mismatch`) —
  `controls/c1-r{39,40}-replay-r42.json`, `controls/c1-r41-replay-refused.json`. Baseline
  round-42 evidence tree count 0 — `controls/c1-baseline-tree-count.txt`
  (`git ls-tree -r --name-only 34e1779… -- corpus/evidence/round42 | wc -l` → `0`).
- **C2 (calibration) — routed-defect repairs landed at the freeze, checker re-run.**
  Frozen checker `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs` (read-only,
  writes nothing):
  - at baseline `34e1779…` → exit 1, **7 findings** (r1a, r1b, r2×2, r3, r4×2) —
    `controls/c2-baseline-red.json`, `controls/c2-baseline-red.exit`;
  - at the freeze `9b6de3a…` → exit 1, **1 finding** `r4-quarantine-absent` —
    `controls/c2-at-freeze.{json,exit}`; re-run by this seat gives the same bytes;
  - at draft HEAD `0081bfdb…` → exit 1, **1 finding** `r4-quarantine-absent`; target exit 0.
- **D1 repair (committed evidence).** `corpus/evidence/round41/playwright-egress/receipt.json`
  (1,167,198 B) and `receipt.witness.json` (1,153,988 B) are committed at `9b6de3a…`; their
  blob sha256 equals the `receiptSha256`/`witnessSha256` of the committed
  `.ufo/waves/round-41/measure/c1-measure.json` (`416f6e4b…446db1` / `d3c9972e…f39d3`),
  re-derived by this seat with `git cat-file blob … | sha256sum`.
- **D2 repair (quote fidelity).** `corpus/SOURCES.md` row **S148** teaches cell begins
  `supersedes S146` and quotes the page verbatim ("A space-separated list of command-line
  options."); row **S146** status is now `rejected` (was `mined`), used-by →
  `corpus/lessons/round-42.md`.
- **D3 repair (baseline control).** `.ufo/waves/round-41/controls/c1-baseline-noop.out` is a
  committed nonempty 4-line blob recording the `ls-tree … | wc -l` command and the digit `0`
  (was committed empty).
- **D4 repair (slice extraction) + owed work.** Fixed extraction (trailing backtick stripped)
  produced 38 clean ids in `.ufo/waves/round-42/quarantine/slice-ids.txt`; the fresh 38-row
  re-adjudication TSV is this wave's deliverable and is **PENDING (WAVE-DONE)**.
- **Sourced claim.** S149 opened (git-ls-tree, `corpus/evidence`-staged copy
  `.ufo/waves/round-42/sources/git-ls-tree.html`, sha256 `2c298383…4f8b64`); cited by
  `corpus/knowledge/committed-bytes-verification-round-42.md` and the C2 checker's R1/R4
  instrument.
- **Census at round start.** `sources-census.sh validate --root … tabi` → exit 0, `tabi ok`,
  20 pre-existing W04 duplicate-URL warnings (`measure/census-start.{out,err,exit}`).
- **Wave w1 dispatched** through the ready handoff (`w1.ready` → `.ufo/waves/round-42/w1-dispatch.json`,
  `counts.spawn 64`, `taskCall` present — the r41 `KeyError(taskCall)` defect is not repeated;
  `w1.ready.dispatched` = `1793201876.0697021`). Results: **PENDING (WAVE-DONE)**.

## Landed changes

| Commit | Owned landed work | Evidence |
|---|---|---|
| `9b6de3a19de11abdb80e82a1310abc64a40215bb` | C1+C2 claims frozen; C2 checker; C1 baseline count, battery and three replay controls; C2 baseline-red control; D1 committed r41 receipt+witness; D2 S148/S146; D3 baseline control; quarantine slice; S149 staged source; `corpus/knowledge/committed-bytes-verification-round-42.md`; `corpus/lessons/round-42.md` errata | `git show --stat 9b6de3a` → 19 files, +20501/−2 |
| `0081bfdb93b6bd1bf2853bb128996f1a976b7218` | SCORECARD round-42 declared-claims section (frozen predicates, C1/C2); `quarantine/build-quarantine-tsv.mjs` | `git show --stat 0081bfdb` → 2 files, +77 |
| **PENDING (L1)** | wave results/dispositions commit; C1 live receipt+witness committed at the measured revision; quarantine `re-adjudication.tsv`; lesson/log/SCORECARD closure; final tip | — |

Wave-seat output is untracked by design: `.ufo/waves/round-42/w1/<Seat>/report.md` plus the
seat evidence files (see *Wave shape*). No seat may commit, push, or run `git`/`jj` mutation.

## Before → after measurements

| Claim | Before (baseline `34e1779…`) | Observed at draft HEAD `0081bfdb…` | Target / remaining |
|---|---|---|---|
| C1 committed evidence tree | `git ls-tree -r --name-only 34e1779… -- corpus/evidence/round42 \| wc -l` → **0** (`controls/c1-baseline-tree-count.txt`) | **0 committed**; 2 live files (1,145,258 + 1,122,212 B) untracked | **PENDING (L1):** commit receipt+witness at the measured revision |
| C1 live run | — | exit 0, driver 0, counter 0, `predicate true`, `findings []`, `nonceMatches true`, 38,384 ms, 2 runs / 0 egress / 0 survivors (`measure/c1-measure.json`, `c1-measure.exit`) | committed bytes + settled wave |
| C1 contamination battery | — | 6/6 pass, `BATTERY_EXIT=0` (`controls/c1-battery-r42.json`) | predicate leg satisfied pre-data |
| C1 replay refusal | — | r39 exit 1, r40 exit 1, r41 exit 1 (`controls/c1-r3x-replay-*.exit`) | predicate leg satisfied pre-data |
| C2 checker findings | **7** (exit 1) `controls/c2-baseline-red.json` | **1** (`r4-quarantine-absent`, exit 1) at freeze and at HEAD | **0** (exit 0) at the measured revision |
| C2 r1a/r1b (D1) | receipt/witness absent at baseline | committed; 1,167,198 B / 1,153,988 B; sha256 = r41 measure pins | closed |
| C2 r2 (D2) | S146 not rejected; no S148 | S148 `supersedes S146` + verbatim ≤25-word quote; S146 `rejected` | closed by checker (checker reports no r2 finding) |
| C2 r3 (D3) | baseline control 0 bytes | committed 4-line control with command + `0` | closed |
| C2 r4 (D4) | slice absent, TSV absent | 38 ids present; TSV absent | **PENDING (WAVE-DONE):** TSV over 38 ids, verdicts in the enum, evidence blobs ≥200 B |
| Sources registry | 147 rows (A131/B7/C9; mined 123 / queued 15 / rejected 9) | **149** rows (A133/B7/C9; mined 124 / queued 15 / rejected 10) | stable unless the wave adds rows |

## Sources & frontier

- New rows this round: **S148** (supersedes S146; verbatim quote corrected under D2) and
  **S149** (git-ls-tree; frozen staged copy sha256 `2c298383476164238c6e25ba804412a335c405ab9540650bb603778e2f4f8b64`;
  13-word quote). No row was deleted; S146's status flip is append-only in effect
  (`mined` → `rejected`, used-by → `corpus/lessons/round-42.md`).
- Registry census (re-derived by this seat from the working tree, 2026-10-28):
  `149` rows — class docs 66 / code 50 / spec 17 / community 5 / paper 4 / own-work 3 /
  tool 3 / dataset 1; grade A 133 / B 7 / C 9; status mined 124 / queued 15 / rejected 10.
  **Finding (see seat report):** the LOG round-42 census line writes "149 rows
  (A131/B7/C9; mined 122 / queued 15 / rejected 10)" — A131 and mined 122 are the
  pre-S148/S149 counts; its status cells sum to 147, not 149. Correct before the filed
  report copies it.
- Census at start: exit 0, `tabi ok`, 20 W04 duplicate-URL warnings (pre-existing).
- Frontier: **no new capability row yet.** On C1 pass only, the admitted row is
  `playwright-firefox-loopback-tcp — observe a loopback browser session's TCP sockets from
  both ss and /proc/net/tcp with a nonce-bound, loader-clean, witness-attested receipt`,
  evidence pointer = committed round-42 receipt + counter output, first-working round 42
  (`.ufo/waves/round-42/claims.json` C1 `admission`). The capacities table is appended per
  round; the most recent is `### Capabilities — round 35` (`SCORECARD.md:1974-1978`, row
  `webdriver-bidi-runtime-firefox`), and the round-42 declared-claims section
  (`SCORECARD.md:2221`) carries no capability row yet — the round-42 row appends there.
  **PENDING (L1):** admit or refuse after WAVE-DONE.

## Trend verdicts

> Fill after WAVE-DONE and the measured revision. Scores are the lane's no-auto-bump
> self-verdicts pending non-author verification; they are not native judgment.

| Trend | Verdict | Evidence / boundary |
|---|---|---|
| depth | **PENDING** | no depth claim declared this round |
| coverage | **PENDING** | C1 is the only coverage move (capability admission on committed bytes + settled wave) |
| operability | **PENDING** | not touched |
| freshness | **PENDING** | not touched (S148/S149 are source rows, not freshness) |
| calibration | **PENDING** | C2 ledger closure: 7 findings → 1 → target 0; no numeric score changes without a later rubric |
| adjacency | **PENDING** | not touched (lowest axis 8; obligation waived by the stagnation nudge) |
| expansion | **PENDING** | no knowledge entry/new domain frontier declared; S148/S149 only |
| quality | **PENDING** | depend on whether the wave falsifies C1 or finds a do-nothing reach |
| discernment | **PENDING** | needs the settled wave's non-author attack responses (23/64 attack seats) |

## SHONEN

> Historical `[x]` marks are retained, not recertified. One line per box, each with a cited
> path. None can be set to `[x]` from this seat's evidence.

- [ ] **SKILL decision tables / error patterns / checklists with sources** — **PENDING**:
  cite the round-42 lesson/errata path and S148/S149.
- [ ] **End-to-end domain task** — **PENDING**: the Firefox loopback TCP run exists
  (`measure/c1-measure.json`, untracked receipt); admission needs committed bytes + wave.
- [ ] **No-oral-context sufficiency** — **PENDING**: an independent non-author read of the
  committed receipt/counters.
- [ ] **Province / no bleed** — **PENDING**: the misroot sweep below (two self-referential
  symlinks found in the production tree) must be resolved and the no-harm diff checked.

## Stale-lane

- Stale-lane grading is the per-attempt record that a lane's work actually lands and is not
  a repeated non-landing closure (`SCORECARD.md:1136`, round-23 auditor class c4). This lane
  entered round 42 with **three consecutive rejected closures** (r39, r40, r41) and the r41
  verifier's `rejected-honest-stop`.
- Anti-stale evidence already present: claims frozen pre-data; controls committed before any
  seat data; the wave actually dispatched through `taskCall` (r41's `w1.ready.dispatched` is
  literally `never-dispatched: ready pointed at w1-spec.json (no taskCall; …dispatcher
  KeyError(taskCall))`; round-42's is the epoch `1793201876.0697021`).
- Not yet sufficient: competitive/stale status is **PENDING (L1)** until WAVE-DONE over ≥64
  seats, the C1 receipt is committed at the measured revision, and the C2 checker exits 0.

## Wave shape

- One policy-v2 wave, `tabi-r42-w1`, `maxLanes 64`, `counts.spawn 64` (`w1-dispatch.json`).
- Role mix (from `w1-spec.json`): scout 20, mutation-tester 9, executor 9, reviewer 8,
  critic 6, scribe 5, connector 4, sentinel 1, simplifier 1, revenger 1. Attack share
  **23/64 (35.9%)** = mutation-tester + critic + reviewer.
- Axis assignment: discernment 22, calibration 17, quality 11, coverage 7, adjacency 4,
  operability 3.
- Quarantine: 19 scouts × 2 staged rows = the 38-row re-adjudication deliverable.
- Every task prompt leads with `/skill:godspeed`; spec/dispatch/registry:
  `w1-spec.json`, `w1-dispatch.json`, `w1/swarm-registry.json` (64 members).
- **PENDING (WAVE-DONE):** `w1-results.json` → `.ufo/waves/round-42/parse-w1-results.mjs`
  (role mix, dead seats, empty output, missing VERDICT lines); WAVE-DONE marker; dead seats
  are recorded, never replaced.

## Tool installs

- None. No `pacman` transaction was run (host-wide PACMAN GUARD); no `uv tool`, cargo, npm
  or `~/.local/bin` install was needed. Nothing to record beyond "no install".

## Misroot sweep

Read-only sweep at draft time:

- `git diff HEAD --stat` → empty (tracked tree clean).
- `git status --porcelain` untracked entries are confined to `.ufo/waves/round-42/`
  (seat output, `w1.ready.dispatched`, `parse-w1-results.mjs`) and `corpus/evidence/round42/`
  (the untracked C1 receipt+witness) — **except two misrooted self-referential symlinks
  created 2026-10-28 12:39**:
  - `corpus/knowledge/knowledge -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/`
  - `corpus/lessons/lessons -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/`
- **FINDING for the L1:** a wave seat wrote outside its seat dir into the production tree
  (self-referential directory loops). They are untracked and were not removed by this seat
  (production tree is read-only to seats). Attribute, remove, and check whether any writing
  seat used a doubled relative path.
- `LOG.md` and `SCORECARD.md` have post-freeze mtimes but are byte-identical to HEAD
  (`sha256 LOG.md` = `ee25ee67…0824b6` = `git cat-file blob HEAD:LOG.md`); `.jj/**` churn is
  the L1's commit machinery, not a seat write.
- No seat report was written under `/home/vgpnk/Projects/shokuknow`, any sibling
  `*-shokunin`, or the fleet repo by this seat; the round-39 shokuknow incident is not
  repeated here (this seat wrote only its seat dir; scratch `/fast/scratch/hyaku/tabi-r42/ScriReportDraft/`
  deleted on exit).

## L0 questions

- No L0 question file exists at HEAD (`.ufo/l0-questions.md` is absent; `SCORECARD.md:26`
  cites it historically). None was filed this round by this seat.
- **PENDING (L1, from the wave):** carry forward any open question the wave raises — the
  known candidates from r41 are (a) S171's present-but-unverifiable quarantine disposition
  (`SCORECARD.md:1419`) and (b) whether a quarantined row with a fetched-but-404 source is
  `absent` or `unreachable` under the C2 r4 verdict enum. List only what a seat actually
  raises; do not invent an L0 line.

---

ROUND-VERDICT **PENDING (L1)** — draft skeleton only; C1 uncommitted, C2 r4 open, wave unsettled.
