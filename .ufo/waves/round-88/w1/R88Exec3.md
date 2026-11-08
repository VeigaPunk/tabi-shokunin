# R88Exec3 — C2 before/after + C1 do-nothing reproduction (w1)

Seat R88Exec3 (godspeed). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Base `f16f992d`. Frozen gate `scripts/check-record-drift-r88.mjs`
pin `3953e340a7521eb89af08dccff5a99bc37bdc3c2caa1372fe9c96ea42d432ab5`
(verified sha256; matches `freeze.txt` at D1 `86f1dcec`, D2 `355508db`, HEAD `7f1de192`).
Frozen counter `scripts/check-showpicker-round88.mjs` pin `3224747613008046907f88332e1054ff8f364fab9763e88868c905f5829c6f79`.
Scratch `/fast/scratch/hyaku/tabi-r88/R88Exec3/` removed before yield.
Tooling: node `v24.21.0` (already present; no install/upgrade).

## Live state at run time (read-only)

- `git -C lane rev-parse HEAD` → `7f1de192...` (detached HEAD, `## HEAD (no branch)`).
- Uncommitted working tree (pre-existing, not mine): M `claims.json`,
  M `controls/c1/probes/prior1.json`, M `controls/c1/probes/prior2.json`, M `freeze.txt`,
  M `LOG.md`, M `SCORECARD.md`, M `SKILL.md`, M `corpus/lessons/round-88.md`,
  M `plans/round-88.md`, M `scripts/kill-power-round88.mjs` (`617c2c68...`),
  M `scripts/selftest-r88-gates.mjs` (`ba672802...`); untracked `corpus/evidence/round88/`,
  `controls/c1/nowork-r87-under-r88.json`, `controls/c1/noreceipt.txt`, `.ufo/waves/round-88/scored/`, `w1/`, etc.
- Pin drift (recorded, not adjudicated here): on-disk `freeze.txt` carries
  kill-power `617c2c68...` + selftest `ba672802...` + prior1 `80a6ff9e...` + prior2 `01162e75...`;
  `claims.json` (frozen intent) carries kill-power `ed4ee813...` + selftest `4acee48c...`
  (the committed `freeze.txt` at every commit carries the `ed4ee813`/`4acee48c` pair).
  Drift gate pin `3953e340...` and counter pin `32247476...` match in all three views.
- Scored receipt `corpus/evidence/round88/chromium-showpicker/receipt.json` (exact values
  read from the receipt): fixture sha256 `8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35`,
  nonce `tabi-r88-l1-86f1dcec`, driver `8c015fa4ea541c25cf1e0c5ba35b28ee94c11dcb4aaa8bf1baf191ecbe49b9b4`.
  r87 receipt: fixture `10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4`,
  schema `tabi-chrome-cdp-showpicker-r87`, nonce `tabi-r87-l1-3dd4b0802d67`.
- Prior set `.ufo/waves/round-88/controls/c1/prior-set.txt` → `probes/prior1.json`
  (nonce `tabi-r88-probe1-probe0001`, 37 legs) + `probes/prior2.json`
  (nonce `tabi-r88-probe2-probe0002`, 37 legs); both schema `tabi-chrome-cdp-showpicker-r88`.
  (Claims `priorSet` text naming `...-a1`/`...-b1` differs from the on-disk nonces.)

## (1) BEFORE-state — frozen r88 gate against base worktree `f16f992d`

Command (spec literal):

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin worktree add --detach /fast/scratch/hyaku/tabi-r88/R88Exec3/base f16f992d
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-record-drift-r88.mjs --lane /fast/scratch/hyaku/tabi-r88/R88Exec3/base --json
```

- `git rev-parse --show-toplevel` inside base = `/fast/scratch/hyaku/tabi-r88/R88Exec3/base`; HEAD `f16f992d...`.
- Result: **exit 1, claims 4, mismatches 4** (NOT the 3 the brief expected).
  `failed` = `["scorecard-tallies","selftest-wording","gate-selftest","quality161-sweep"]`.
  - `scorecard-tallies` false: `secs=false/true,...` (all seven rounds 44/68/79/80/81/84/85
    read `10/10`, no `9/9`), `tallyLines=10`.
  - `selftest-wording` false: `staleHolds=false d6named=false correctionNamed=false`
    (the mismatch at base is the *absence* of `corpus/lessons/round-88.md`, not stale D7 wording —
    no `selftest 10/10 at D7` occurs in SKILL/plan87/lesson87/note at base).
  - `gate-selftest` false: `mentions=false wired=false counter=false battery=false killpower=false`.
  - `quality161-sweep` false: `sweeps=false cites=false`.
- Why `gate-selftest` is red at base (structural, not a record defect): the gate reads
  `scripts/check-record-drift-r88.mjs`, `scripts/selftest-r88-gates.mjs`,
  `scripts/check-showpicker-round88.mjs`, `scripts/negatives-showpicker-round88.mjs`,
  `scripts/kill-power-round88.mjs` **from the `--lane` path**. Base `f16f992d` predates every
  r88 script (`git ls-tree -r f16f992d | grep round88` = 0 hits; first r88 file set lands at
  D1 `86f1dcec`, which adds 4 files — the drift gate + selftest runner arrive with D1/D2).
  With the scripts absent, every sub-conjunct is false. The same gate pointed at the same base
  cannot be green on statement 3 without the r88 scripts present in the lane.
- Claims leg b (`C2.b`: "before exits 1 with mismatches 3 … gate-selftest is structural and
  already holds") and the spec's `(expect 3 mismatches at base)` are both **contradicted** by
  this run: the frozen gate yields 4 at base. Gate file is byte-identical `3953e34` at D1/D2/HEAD,
  so the discrepancy is in the leg's premise, not in a gate edit. [INFERENCE: the leg author
  presumably assumed `gate-selftest` inspects the live gate/scripts regardless of `--lane`,
  or ran the before-control with r88 scripts overlaid into the base worktree; neither matches
  the gate's actual `--lane`-scoped reads. No construction was found in the lane that makes a
  bare `f16f992d` worktree green on `gate-selftest`.]
- Worktree removed before yield (`git worktree remove .../R88Exec3/base --force`;
  `git worktree list` afterwards shows only the lane + `/fast/scratch/hyaku/tabi-r87/base`).

## (2) C1 do-nothing controls

Pins used (from the scored r88 receipt): `--expect-driver-sha256 8c015fa4...`,
`--expect-nonce tabi-r88-l1-86f1dcec`,
`--expect-fixture-sha256 8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35`,
`--prior-set .ufo/waves/round-88/controls/c1/prior-set.txt`.

**Control A** — r87 receipt under the r88 counter (`--receipt corpus/evidence/round87/chromium-showpicker/receipt.json`):

- Exit **1**, verdict `findings`, checkCount 99, schema `tabi-chrome-cdp-showpicker-r88-counter`, 52 findings.
- `schema` present: true; `plan-frozen` present: true (spec expectation holds).
- Full id list (52): `schema, nonce-shape, nonce-expected, driver-pin, fixture-hash, plan-frozen, leg-order, leg-records, plan-calls, leg-sp84-cross-origin-nonfile, leg-sp84-cross-origin-nonfile-disabled, leg-sp84-cross-origin-color, leg-sp84-cross-origin-month, leg-sp84-cross-origin-week, leg-sp84-cross-origin-time, leg-sp84-same-origin-nonfile-disabled, leg-sp84-webkitdirectory-answer, leg-sp84-accept-answer, leg-sp84-click-while-open, leg-sp84-cross-origin-number, leg-sp84-cross-origin-range, leg-sp84-cross-origin-tel, leg-sp84-cross-origin-search, leg-sp84-cross-origin-text, leg-sp84-multiple-mode, leg-sp84-accept-mime-answer, leg-sp84-second-chooser-answer, leg-sp85-same-origin-tel, leg-sp85-same-origin-search, leg-sp85-same-origin-text, leg-sp85-same-origin-tel-activated, leg-sp85-same-origin-search-activated, leg-sp85-same-origin-text-activated, leg-sp86-accept-wildcard-text, leg-sp86-accept-wildcard-png, leg-sp86-accept-mixed-text, leg-sp86-accept-mixed-png, leg-sp86-accept-pdf-token-png, leg-sp86-same-origin-color-activated, leg-sp87-accept-audio-png, leg-sp87-accept-video-text, leg-sp87-accept-multimime-text, leg-sp87-accept-whitespace-png, webkitdirectory-answer-law, accept-answer-law, multiple-mode-law, accept-mime-answer-law, accept-grammar-law, second-chooser-answer-law, no-selection-law, fixture-descriptors, prior-set-complete`.
- Stored control `controls/c1/nowork-r87-under-r88.json` matches the live re-run on
  schema/verdict/checkCount/checks/findings/priorSet/priorSetFile/nodeReport (52 ids identical).
  One field differs: `limit.perPrior` — live `{priorEvents 177/177, absNeed 89, escape 89}`
  vs stored `{153/153, absNeed 77, escape 77}` (the stored file was captured against earlier
  37-leg priors with 153 events; on-disk priors now carry 177). Not a verdict difference.

**Control B** — nonexistent receipt (`--receipt .ufo/waves/round-88/controls/c1/absent.json`):

- Exit **2**, verdict `unreadable`, findings `[{id: "receipt-unreadable", detail: "ENOENT: no such file or directory, open '.../controls/c1/absent.json'"}]`. Matches stored `noreceipt.txt` exactly (spec expectation holds).

Sanity (not assigned, run to confirm the counter is not trivially red): the scored r88 receipt
under the same counter → exit 0, verdict `clean`, checkCount **102**, findings `[]`.
Read-only scored outputs agree: `scored/counter-a.json` clean/102,
battery-a `failed 0`, coverage `102/102`, killpower-a `killed 68, survived 0, crashed 1,
unapplied [no-selection-empty-dropped]` (69 mutants).

## (3) Drift gate isolated `--selftest`

Command:

```
node scripts/check-record-drift-r88.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --selftest --json
```

- Exit **0**, output `{"schema":"tabi-r88-record-drift-selftest","exit":1,"failed":["scorecard-tallies","selftest-wording","gate-selftest","quality161-sweep"],"ok":true}`.
- Reading: the isolated fixture lane (built in scratch by the gate itself) is rejected with
  exit 1, and its `failed` list names **all four** statements. The spec's "expect … the fixture
  lane's failed list names scorecard-tallies and selftest-wording" is satisfied as a subset,
  but the full list is four — which is exactly what claims leg c says
  ("the fixture lane fails scorecard-tallies, selftest-wording, gate-selftest and quality161-sweep").
  The gate's internal `wantRed` assertion (`scripts/check-record-drift-r88.mjs:74`) checks only
  the two names as a subset, so `ok:true` holds either way; the printed `failed` proves all four.
  (Corroborated independently by sibling R88Critic §"Commands run".)
- Hygiene note: the gate's `--selftest` leaves scratch fixture dirs under `/fast/scratch/hyaku/`
  (`tabi-r88-driftfix-*`); those are the gate's own artifacts, not this seat's scratch tree.

## (4) AFTER-state on the live lane

Command:

```
node scripts/check-record-drift-r88.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

- Exit **0**, `claims 4, mismatches 0, failed []`.
  - `scorecard-tallies` ok: `secs=true/false ×7`, `tallyLines=4` (the four remaining `10/10`
    lines are outside the seven restored sections).
  - `selftest-wording` ok: `staleHolds=false d6named=true correctionNamed=true`.
  - `gate-selftest` ok: `mentions=true wired=true counter=true battery=true killpower=true`.
  - `quality161-sweep` ok: `sweeps=true cites=true`.
- Spec expectation (claims 4, mismatches 0) holds.

## Findings vs the brief

| # | Brief expectation | Measured | Verdict |
|---|---|---|---|
| 1 | before: exit 1, mismatches 3 (`scorecard-tallies, selftest-wording, quality161-sweep`) | exit 1, mismatches **4** (+ `gate-selftest`) | **CONTRADICTED** — `gate-selftest` cannot hold at bare `f16f992d` (r88 scripts absent from `--lane`) |
| 2a | r87 under r88: exit 1, `schema` among findings | exit 1, 52 findings, `schema` + `plan-frozen` present | holds |
| 2b | nonexistent: exit 2 `receipt-unreadable` | exit 2, exactly that | holds |
| 3 | `--selftest`: exit 0 `ok:true`, fixture names `scorecard-tallies, selftest-wording` | exit 0 `ok:true`, fixture names all four | holds (subset reading); full list = 4, matching claims leg c |
| 4 | after: claims 4, mismatches 0 | claims 4, mismatches 0, exit 0 | holds |

Additional recorded discrepancies (for L1; no amendment proposed by this seat):

- `D 93500a4e` named in the brief does not exist in the lane object database
  (`git cat-file -t 93500a4e` → "Not a valid object name"); freeze commits present are
  `86f1dcec` (D1) and `355508db` (D2). Freeze pins quoted in the brief match D1's `freeze.txt`.
- Claims leg b's kill rule (`before mismatches != 3 -> NOT verified`) is unsatisfiable by the
  frozen gate against a bare `f16f992d` worktree; the before-mismatch count is 4.
- `limit.perPrior` drift between stored `nowork-r87-under-r88.json` and live re-run
  (prior event counts 153 → 177) — verdict-neutral, but the stored control is stale w.r.t.
  the on-disk priors.

## Risks / blockers

- None blocking this seat's reproduction. Worktree removed; scratch `R88Exec3` removed;
  no lane files written, no mutating git, no commits. `git status` unchanged apart from
  the pre-existing dirty state noted above.
