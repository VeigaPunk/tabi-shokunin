# R89Sentinel — bounds & provenance audit, round 89 wave w1

Seat: R89Sentinel (sentinel, calibration). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
base `5a901163`, freeze D `7bde5e6c2f2d`. Read-only seat: findings only, no lane record edited,
no commit/push, no mutating git/jj. Tooling: none installed (node v24.21.0, git, python3 already
present; pacman paused per the 2026-10-20 ruling) — zero tools added this seat. Scratch
`/fast/scratch/hyaku/tabi-r89/R89Sentinel/` removed before yielding; the one worktree I created
(`.../R89Sentinel/base-wt`) was removed and pruned.

Audit window note: the lane changed under me mid-audit. At the start of the audit
`git status` in the lane was clean of instrument edits and `sha256sum -c freeze.txt` passed 8/8.
By the end, `freeze.txt`, `claims.json`, `plans/round-89.md`,
`scripts/check-showpicker-round89.mjs` and `scripts/negatives-showpicker-round89.mjs` were all
modified vs `HEAD 0791b191` — an in-flight D2/D3 re-freeze by L1. I report both the D1 state
(at the pinned digest) and the D2/D3 working-tree state, and treat the D2/D3 delta as the
adversarial surface.

---

## S1 — HIGH — the D3 counter amendment deletes the only term that independently pinned the threshold arithmetic, and its replacement is a tautology that is not consulted for the verdict

**Exploit path.** D3 deletes the numbered check `replay-limit-consistency` from
`scripts/check-showpicker-round89.mjs` and replaces it with an unasserted boolean
`limit.replayConsistency` in the `limit` payload. The deleted check had two conjuncts:

```
check('replay-limit-consistency',
      limBad.length === 0 && sims.every((p) => p.refused === (p.absMatched >= p.absNeed) || p.absNeed === 0), ...)
```

The first conjunct — `limBad.length === 0` — pins `absNeed` to `ceil(FRAC * priorEvents)`
**independently of `refused`**. The replacement keeps only the second conjunct
(`sims.every(p => p.refused === (p.absMatched >= p.absNeed) || p.absNeed === 0)`), but `refused`
is *derived from* the same `absNeed` (`refused: np > 0 && absMatched >= absNeed`). Under any
drift of the `absNeed` formula the two sides of that equality move together, so the surviving
conjunct is a tautology. The boolean is also **outside the `checks` map**, so `failed`,
`verdict` and the process exit code never consult it.

**Evidence — same scored receipt, same one-token drift, opposite verdicts.** I copied the frozen
counter (`git show HEAD:scripts/check-showpicker-round89.mjs`) and the amended working-tree
counter to scratch and drifted only the threshold formula
`const absNeed = np > 0 ? Math.ceil(FRAC * np - 1e-9) : 0` → `... - 1e-9) + 1 : 0`:

| counter | exit | verdict | checkCount | findings | `limit.replayConsistency` |
|---|---|---|---|---|---|
| FROZEN `33d4b927` | **1** | findings | 108 | `replay-limit-consistency` | (n/a) |
| AMENDED `53593b5c` | **0** | **clean** | 107 | `[]` | **true** |

The amended counter reports `replayConsistency: true` while the threshold arithmetic is wrong.
It is not merely unenforced — it is affirmatively wrong, and the score is still `clean`.

**Corroboration in the amended source.** In the working-tree counter the deleted conjunct left
its computation behind as dead code: `limBad` is built at lines 941–942 and then never read
anywhere (the only other occurrence of the name is `replayConsistency` at line 956). The
independent pin is gone; the code that computed it is retained but discarded.

**Impact.** This is the Narrowing-8 invariant that the **frozen** C2 claim text names:
*"the counter's replay limit sentence prints the computed per-prior `absNeed` values and a new
`replay-limit-consistency` check binds `refused == (absMatched >= absNeed)` (Narrowing 8 fix)"*.
C2's `type` string is byte-identical in `HEAD` and in the working tree (verified), i.e. the
amendment does not touch the claim that describes the invariant — it removes the instrument
side of that claim. The D3 rationale in `plans/round-89.md` states *"the battery's witness for
the class is the kill-power mutant"*. I checked that witness: the only replay-limit mutant in
`scripts/kill-power-round89.mjs` is `replay-limit-printed-drift`
(`"const replayIdx = sims.findIndex"` → `"const replayIdx = -1"`), which perturbs the *replay
index*, not the `absNeed` formula. It does kill (I ran `--only replay-limit-printed-drift`:
`killed 1, survived 0, crashed 0`), but it witnesses a different class. The `absNeed`-arithmetic
class has no kill-power entry and, per the table above, is now undetectable by the counter
itself.

**Smallest remediation (for L1 — this seat is read-only and does not propose amending a
predicate, counter, pin, prior, threshold or kill rule).** The D3 rationale identifies a real
constraint — the battery's coverage metric is `declared = Object.keys(counter.checks)`, so a
check no receipt mutation can trip can never be "covered" by a battery case. The remedy chosen
(deleting the check) is not the only one and is the one that loses the invariant. Two cheaper
options preserve both the frozen C1 leg-a numeral (108) and the Narrowing-8 guarantee:
(i) keep `replay-limit-consistency` numbered and teach the battery that this id is
counter-text-witnessed rather than receipt-witnessed, or (ii) keep the check and add an
`absNeed`-formula kill-power mutant, which is the witness the claim's own wording implies.

---

## S2 — HIGH — the amendment ledger under-reports what changed, and claims.json is internally inconsistent about which bytes it froze

`claims.json` grew a `frozenAmendments` array. It contains **one** entry, for the C2 before
numeral. Two further substantive changes are recorded **only** in `plans/round-89.md`, not in
the claims' own ledger:

* C1 `legs.a` "checkCount **108**" → "checkCount **107**" (a frozen predicate numeral);
* the two pin rewrites `check-showpicker-round89.mjs` `33d4b927…` → `53593b5c…` and
  `negatives-showpicker-round89.mjs` `7951d40e…` → `bc7ed0e5…`, in both `freeze.txt` and
  `claims.json.pins`.

`claims.json` is now internally inconsistent: `digestsCommit` still reads `7bde5e6c2f2d` (D1)
while `claims.json.pins` and `freeze.txt` both name the **D3** bytes. And the D2/D3 pin batch
has no durable identity: `plans/round-89.md` calls both D2 and D3 `a78e70a4` ("same digest
family") but `git rev-parse a78e70a4` → `unknown revision`, and that digest appears in no
other file in the lane. Two distinct byte sets therefore share one unverifiable label.
**Smallest remediation:** record the C1 numeral change and the pin batch in
`claims.json.frozenAmendments` alongside the C2 entry, and set `digestsCommit` to the digest
that actually names the frozen bytes.

---

## S3 — MEDIUM — the C2 before-numeral amendment 2→3 rests on a rationale the code contradicts, and the original "2" was never measured

`claims.json` `frozenAmendments[0]` justifies 2→3 as: *"gate-selftest is red at base because
`scripts/*round89.mjs` do not exist in the base tree (the gate checks the live lane's instrument
files)"*. The parenthetical mis-describes the instrument. `scripts/check-record-drift-r89.mjs`
reads with `const read = (rel) => fs.readFileSync(path.join(lane, rel), 'utf8')` — i.e. the
**`--lane` argument**, so pointing the gate at a base worktree makes the r89 instrument files
absent *and* makes `gate-selftest` read `mentions=false`. It does not read the live lane's
instrument files.

My independent measurement at base `5a901163` (worktree of the frozen gate pointed at a base
worktree) reproduces R89Exec3's numbers exactly: **exit 1, claims 4, mismatches 3**,
`failed = [selftest-wording, gate-selftest, quality161-sweep]`. So the *count* 3 is correct as
measured. But note the frozen C2 leg (b) cited its measurement as
`scored/drift-before.json` — **that artifact does not exist**; `.ufo/waves/round-89/scored/`
contains only `battery-a.json`, `counter-a.json`, `killpower-a.json`. The frozen "2" was
asserted, never measured.

The consequence: under the frozen "2" the before-control was red on exactly the two *record*
statements the round claims to repair (`selftest-wording`, `quality161-sweep`). Under "3" the
before-control must additionally be red on `gate-selftest`, whose redness is an artifact of the
control's own scoping (r89 instruments absent at base), not a record drift. The amendment thus
widens the before-control to admit a self-referential red rather than narrowing it to the
record statements.
**Smallest remediation (direction, not an amendment proposal):** scope the before-control to
the two record statements, or have the gate read its own instrument files from the live lane
while reading records from the base tree, so the frozen "2" stands and the kill rule needs no
numeral change.

---

## S4 — MEDIUM — C2's after-side is red as of this audit: the kill rule "after mismatches != 0" is not met

Live lane, `node scripts/check-record-drift-r89.mjs --lane <lane> --json`: **exit 1, claims 4,
mismatches 2**, `failed = [selftest-wording, quality161-sweep]`. Root cause confirmed by
inspection, matching R89Exec3: `corpus/lessons/round-89.md` does not exist, and
`corpus/QUALITY.md` §161 does not cite `check-record-drift-r89` (it still cites
`check-record-drift-r87.mjs`). C2's kill rule reads `after mismatches != 0 -> NOT verified`, so
**C2 is currently NOT verified** on its own frozen kill rule. The two edits are L1-owned.

Positive: the drift gate's own `--selftest` is green and leak-free. `node
scripts/check-record-drift-r89.mjs --lane <lane> --selftest --json` → exit 0, `ok: true`,
`failed: [scorecard-tallies, selftest-wording, gate-selftest, quality161-sweep]` (all four red on
the fixture by design), `tallies: bad=["round-44-no-9","round-44-has-10"]`, `wording:
staleHolds=true`. Narrowing-7 holds: `ls -d /fast/scratch/hyaku/tabi-r89-driftfix-*` and
`/tmp/tabi-r89-driftfix-*` = **0 / 0** after the run.

---

## S5 — MEDIUM — census artifacts: `end.txt` absent, `start.txt` carries no `exit=0` marker and is stale, and no r89 gate enforces it

* `.ufo/waves/round-89/census/end.txt` — **ABSENT**. Reported honestly as absent; it is not yet
  produced. `start.txt` exists (38 lines, 5183 B).
* **No exit marker.** r89's `start.txt` ends at `tabi\tok\t…/corpus/SOURCES.md` with no
  `exit=0` / `exit:0` line. Every prior round carries one: r84/r85/r86/r87 `exit=0`, r88
  `exit:0`. The r86 drift gate asserted this (`startOk = /exit=0/`, `endOk = /exit=0/ && /tabi\s+ok/`);
  **the r89 drift gate has no `census-artifacts` claim at all** (r87/r88 dropped it too), so
  nothing in the frozen r89 instruments enforces the census and the stale `start.txt` cannot be
  caught by any gate.
* **Stale.** `start.txt` was captured before the freeze commit added S224 to
  `corpus/SOURCES.md`: it contains no S224 line, whereas re-running the fleet census
  (`bash scripts/sources-census.sh validate --root <fleet> --today 2026-11-08 tabi`, the same
  script and lane id that reproduces the committed format byte-for-byte) on the freeze-commit
  registry now emits `tabi\tE11\tS224 missing used-by corpus/knowledge/chromium-showpicker-runtime-round-89.md`
  and exits **1**. The committed artifact records `tabi ok …` for a registry that is now red,
  and the round-89 knowledge note it points at does not exist.
  For reference, the lane's own `scripts/check-sources.mjs` is a *different* gate with a
  different output format (`FINDING id=…` / `SOURCES_GATE verdict=…`); the committed
  `start.txt` format is the fleet script's.
* `census/start.txt` is committed (`git ls-files` confirms) and its bytes match `HEAD`.

---

## S6 — LOW — the frozen prior-set sentence no longer reproduces in-tree (it did at freeze time)

`claims.json.priorSet` asserts *"each scores clean at 108 checks against the other's prior-set"*.
Reproduced: with `probes/prior2.json` as the only prior-set member, `prior1.json` scores
**exit 1**, findings `['prior-set-complete']` — the check that refuses r89-schema receipts found
in the walked trees (`.ufo/waves/round-89`, `corpus/evidence/round89`) that are neither the
receipt under test nor a prior. The r89 scored receipt has since landed in
`corpus/evidence/round89/`, so the in-tree cross-score is now red. In an isolated lane copy
containing only the two probes, both directions score **clean at 108 checks** — matching the
committed `probe-score-probe1.txt` / `probe-score-probe2.txt` ("exit 0 … clean 108 checks"). So
the sentence was true at freeze time and is now stale against the tree. This is the same
mechanism as the `prior-set-complete` delta in S7 and is by design in that direction; the
claims sentence should say so.

---

## S7 — DO-NOTHING CONTROLS — exit codes and finding ids reproduced

`controls/c1/nowork-r88-under-r89.json` (the r88 scored receipt under the r89 counter):

* Committed artifact: `verdict findings`, `checkCount 104`, **34** findings, false ids include
  **`schema`** and **`plan-frozen`** (plus `nonce-shape`, `nonce-expected`, `driver-pin`,
  `fixture-hash`, `leg-order`, `leg-records`, `plan-calls`, the per-leg ids, the law ids, and
  `fixture-descriptors`); `limit` block identical to my run.
* My reproduction: **exit 1**, `verdict findings`, `checkCount 104`, **35** findings — the same
  set plus exactly one extra id, **`prior-set-complete`** (detail names the r89 scored receipt
  `corpus/evidence/round89/chromium-showpicker/receipt.json` as an unexempted in-tree r89-schema
  receipt). Same exit code, same `schema` + `plan-frozen` membership, same order otherwise. The
  committed control predates the scored receipt landing in-tree, so it is **not byte-reproducible
  against the current tree**, but every id it was cited for is intact.

`controls/c1/noreceipt.txt` (unreadable control): **exit 2**, `verdict "unreadable"`, finding
`receipt-unreadable`, detail `ENOENT: no such file or directory, open '/nonexistent.json'` —
reproduced **byte-identical**.

---

## S8 — LOW — scratch trees and one stale worktree left behind under `/fast/scratch/hyaku/tabi-r89/`

At audit end: `R89Exec2` (1.1 G), `R89Mut1` (1.4 G), `R89Scout` (2.0 M), `l1` (1.7 G) populated;
`R89Exec1`, `R89Exec3`, `R89Review1`, `R89Review2` present but **empty**; plus a stray
top-level `common-microsyntaxes.html` (121,595 B, 09:27) that is a byte-identical copy of the
committed `.ufo/waves/round-89/sources/common-microsyntaxes.html`
(sha256 `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666`, matching the
`sha256 2e9e2cbbe1ed` recorded in `corpus/SOURCES.md` S224). `git worktree list` still registers
`/fast/scratch/hyaku/tabi-r89/R89Mut1/base-wt` at `5a901163` — R89Mut1 is a live peer, so that
one is in use, not abandoned. `R89Exec3`'s seat report claims "Worktree/scratch removed; nothing
left behind" and its worktree is indeed gone, but its empty `R89Exec3/` directory remains.
`/fast/scratch/hyaku/tabi-r87/base` is a pre-existing r87 worktree, out of this round's scope.
**My own** tree and worktree are removed and pruned.

---

## S9 — CLEAN findings (verified, no defect)

**(a) Freeze pins vs committed bytes — 8/8 exact at D `7bde5e6c2f2d`.** Two independent
directions:

* working tree: `sha256sum -c .ufo/waves/round-89/freeze.txt` → all `OK`, exit 0;
* committed bytes: for each pin, `git show HEAD:<path> | sha256sum` compared to the pin → all 8
  `OK` (`scripts/chrome-cdp-showpicker-round89.mjs`,
  `scripts/check-showpicker-round89.mjs`, `scripts/negatives-showpicker-round89.mjs`,
  `scripts/kill-power-round89.mjs`, `scripts/selftest-r89-gates.mjs`,
  `scripts/check-record-drift-r89.mjs`, `controls/c1/probes/prior1.json`,
  `controls/c1/probes/prior2.json`). `HEAD = 0791b1918e3fc759f78b616e965794b6d4b81445`.
  `freeze.txt` carries no digest line — same convention as r86/r87/r88.

**(b) Receipt identity — every field verified against the committed receipt**
(`corpus/evidence/round89/chromium-showpicker/receipt.json`, 842,932 B,
sha256 `78eb6ceac46ae68b3d49ac748e18746af05b94232d05f1521fb81ea00704b938`):

| field | value | check |
|---|---|---|
| `schema` | `tabi-chrome-cdp-showpicker-r89` | ✓ |
| `lane` | `tabi-shokunin` | ✓ = `basename(lane)` |
| `nonce` | `tabi-r89-l1-7bde5e6c2f2d` | ✓ = frozen nonce |
| `driverSha256` | `76b69b4f…5dc998bd2d0` | ✓ **equals the freeze pin** |
| `fixture.sha256` | `69acad57…462c5ed` | ✓ **independently re-derived** |
| `fixture.child.sha256` | `7d15ea82…b29362df` | ✓ **independently re-derived** |
| `ports` | http 19960 / cdp 19961 / child 19962 | ✓ all distinct; disjoint from prior1 (19920-2) and prior2 (19930-2) |
| `legs` | 41 | ✓ = the frozen count; the 4 `sp89-accept-domread-*` legs present |
| `failures` | `[]` | ✓ |
| `startedAt`/`finishedAt` | `12:39:46.836Z` / `12:43:31.853Z` | ✓ both present |

The driver's own self-hash (`driverSha256: sha256(fs.readFileSync(SELF))`) matches the pinned
driver bytes, so the pin is enforced by the instrument, not merely declared.

**The fixture pin is independently verifiable out-of-band, not declaration-level.** I
re-derived `fixture.sha256` and `fixture.child.sha256` from the pinned driver + the round-78
template + the receipt nonce + the child port, without trusting the receipt:
`69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed` /
`7d15ea8281c583baa87604260d9b46d7b192f8ec04f762fb6cf36e98b29362df` — **exact match** to the
scored receipt. The same derivation reproduces prior1 (`df374c20…1853` / `2a841db8…5ab74`) and
prior2 (`48238e0d…d8749` / `23a6f57a…9f7`) exactly, confirming the fixture hash is a function
of (driver bytes, template, nonce, child port) and that all three receipts ran the frozen
driver.

**(c) Scoring the scored receipt.** With the frozen D1 counter
(`--expect-driver-sha256 76b69b4f… --expect-nonce tabi-r89-l1-7bde5e6c2f2d --expect-fixture-sha256
69acad57… --prior-set controls/c1/prior-set.txt`): **exit 0, verdict clean, checkCount 108, no
findings.** With the amended D3 counter: exit 0, clean, checkCount 107, no findings,
`limit.replayConsistency: true`. Both are green on the scored receipt — the difference matters
only under mutation (S1).

**(d) The D1 freeze shipped with a red battery — so a re-freeze was genuinely needed, and the
D2 half is a legitimate fix.** Under the D1 battery (D1 counter + D1 battery) against the
scored receipt: **exit 1, 222 cases, 4 failed** — exactly the four `sp89-accept-domread-*`
legs, each failing on an unlisted `no-selection-law` collateral — plus `coverage.uncovered =
[replay-limit-consistency, …]`. Applying *only* the D2 battery change (add the `no-selection-law`
allowance for the four new legs) yields **222 cases, 0 failed**, with the single remaining
uncovered id `replay-limit-consistency`. So D2 is a real repair of a real D1 red, and D3 is the
part that costs the invariant (S1).

**(e) No seat wrote outside the lane.** `git -C /home/vgpnk/Projects/shokunin status --porcelain`
contains **no** file naming tabi or round-89. Present entries are unrelated to this round:
`.scratch/closure-tabi-r83-entry.json`, `.scratch/closure-tabi-r87-entry.json` (earlier rounds),
`.scratch/closure-kama-r96-entry.json`, `.scratch/run15-state.json`, `.scratch/run15-wrapup/…`,
`.ufo/l0-questions.md`, `.ufo/reports/round-97/kama.md`,
`scripts/hyaku/__pycache__/prefile-falsification.cpython-314.pyc`. The lane's own untracked
paths (`.ufo/waves/round-89/scored/`, `.ufo/waves/round-89/w1/`,
`corpus/evidence/round89/`, `w1.ready.dispatched`) are all inside the lane.

**(f) The scored receipt and `.ufo/waves/round-89/scored/` are untracked** in git at audit end
(`?? corpus/evidence/round89/`, `?? .ufo/waves/round-89/scored/`). The receipt C1 leg (a) scores
is therefore not yet in git history — no committed-byte provenance for the scored artifact
itself yet. Noted for L1; not a defect in any frozen instrument.

**(g) `drift-before` measurement, independently reproduced** — see S3: exit 1, claims 4,
mismatches 3, `failed = [selftest-wording, gate-selftest, quality161-sweep]`, with
`scorecard-tallies ok=true bad=[] tens=2 sanctioned=2 stray=[]`,
`selftest-wording ok=false staleHolds=false d6named=false correctionNamed=false`,
`gate-selftest ok=false mentions=false wired=false counter=false battery=false killpower=false`,
`quality161-sweep ok=false sweeps=true cites=false`.

---

## Summary for the integrator

| # | severity | finding |
|---|---|---|
| S1 | HIGH | D3 deletes `replay-limit-consistency`'s independent `absNeed` pin; the surviving boolean is a tautology under joint drift and is not consulted for the verdict. Demonstrated: same drift ⇒ frozen counter exit 1 / `replay-limit-consistency`, amended counter exit 0 / clean / `replayConsistency: true`. Contradicts the frozen C2 `type` text (Narrowing 8). |
| S2 | HIGH | `claims.json.frozenAmendments` records only the C2 numeral; the C1 `checkCount` 108→107 and the pin rewrite live only in `plans/`. `digestsCommit` still names D1 while the pins name D3. D2/D3 share the unverifiable label `a78e70a4` (not a git object). |
| S3 | MEDIUM | C2 2→3 rationale mis-describes the code (the gate reads instrument files from `--lane`, not the live lane). The frozen "2" was never measured (`scored/drift-before.json` absent). "3" admits an artifact red into a record-drift control. |
| S4 | MEDIUM | C2 after-side red: mismatches 2, `corpus/lessons/round-89.md` and QUALITY §161's `check-record-drift-r89` citation both missing ⇒ `after mismatches != 0` ⇒ C2 NOT verified. |
| S5 | MEDIUM | `census/end.txt` absent; `start.txt` has no `exit=0` marker (all prior rounds have one) and is stale (predates S224; re-run exits 1 with E11 S224). No r89 gate asserts census artifacts. |
| S6 | LOW | `claims.json.priorSet`'s "clean at 108 against the other's prior-set" no longer reproduces in-tree (`prior-set-complete` fires once the scored receipt landed); true in isolation. |
| S7 | — | Do-nothing controls reproduced: nowork exit 1 / `schema` + `plan-frozen` intact (34→35, extra `prior-set-complete` only); noreceipt exit 2 byte-identical. |
| S8 | LOW | Scratch trees remain (`R89Exec2`, `R89Mut1`, `R89Scout`, `l1` populated; four empty dirs) plus a stray `common-microsyntaxes.html`; one live `R89Mut1` worktree registered. Mine removed. |
| S9 | — | CLEAN: freeze pins 8/8 vs committed bytes at D1; receipt identity fully verified incl. out-of-band fixture re-derivation; scored receipt clean at 108 (frozen) / 107 (amended); no write outside the lane. |
