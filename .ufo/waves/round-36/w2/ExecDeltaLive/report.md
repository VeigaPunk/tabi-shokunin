# ExecDeltaLive — tabi r36 (attempt 2), w2 FALSIFY — the frozen-heads assumption

**Attacks:** the frozen-heads assumption behind claim C1. Two questions, both asked by the seat spec:

1. **Did any of the 12 drifted sibling lanes move AFTER the freeze?** For each drifted lane in
   `.ufo/waves/round-36/baseline/c1-delta-pins.json`: does the frozen head still resolve, and how many
   commits landed after it on the lane's live default-branch tip?
2. **Would the frozen counter's readings change if re-derived at the live head?** Run the frozen
   **BUILD** tool against a scratch copy of the pins file with the live heads — does the ledger diff?
   And is disclosed limit #7 (`corpus/knowledge/adjacency-drift-audit-r36.md` §6.7, "Movement after
   freeze is invisible") accurate? Quantify the post-freeze drift.

**Verdict in one line:** the frozen-heads assumption **holds for this round's measurement** (the
counter still reads `predicate true` at the landing and at the live lane HEAD), **but the disclosure
is inaccurate as written** and there is **one latent byte-level defect in the frozen build tool** that
makes a *future* re-pin diverge from the counter. Two findings; neither falsifies C1 at the measured
revision.

---

## 1. Frozen inputs (integrity before any reading)

| input | value | frozen digest | match |
|---|---|---|---|
| counter `c1-adjacency-sweep-v4.mjs` (via `git show 2e7b7a89…:.ufo/waves/round-36/counters/…`) | `8a223faf5e109fc05dac1373a4a4979b65f9ec2ffef40f86ae9bf40ba1aad385` | `8a223faf…aad385` | ✓ |
| `baseline/c1-delta-pins.json` | `810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655` | `81019362…910655` | ✓ |
| `baseline/c1-drift-audit-build.mjs` | `c8153a5a6d9e29a3991a0d753c482d2963aaa0e224978386d96ad661c62a2be1` | `c8153a5a…a2be1` | ✓ |
| `scripts/check-adjacency.mjs` at `f2f3f14…` | `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` | `4e2c2a64…324aac` | ✓ |

All counters were run from the **freeze bytes** (`git show 2e7b7a89…:<path> > $S/<name>.mjs`), never from
a worktree copy. Scratch root `S=/fast/scratch/hyaku/tabi-r36/ExecDeltaLive`, `TMPDIR=$S/tmp` passed
explicitly on every counter/build invocation. Read-only git only in the lane and sibling repos
(`rev-parse`, `cat-file`, `log`, `diff`, `ls-tree`, `for-each-ref`, `symbolic-ref`, `merge-base`);
the two `git init` + `commit` fixtures were created under `$S/` with
`git -C "$D" rev-parse --show-toplevel` asserted equal to `"$D"` before the first commit.

**Post-freeze lane-repo state (read at 2026-10-27):** the lane HEAD is `1ee2ab1a` ("round-36: persist
w2 dispatch payload and registry"), two commits past the wave-1 landing `f2f3f14…`. The pins file is
byte-identical (`81019362…`) at the freeze, the landing, `53937aa`, `12915bc` and `1ee2ab1a`; the
drift ledger is byte-identical (`bde87e24…`) across all five.

---

## 2. Question 1 — did any drifted lane move after the freeze?

**All 12 frozen heads still resolve** (`git -C <lane> cat-file -t <head>` → `commit` for all 12), and
each is reachable from **5–46 refs** in its sibling repo, so no `git gc` can prune them. Live tips are
the remote default branch (`origin/HEAD` → `origin/master` or `origin/main`).

| drifted lane | frozen head | live tip | commits after freeze | ancestor? | last post-freeze commit |
|---|---|---|---|---|---|
| chousa | `f9736a39a0` | `b13ca7b5c8` | **10** | yes | 2026-10-27T08:33:06 |
| kaidoku | `1ed29de2cd` | `5856614ac4` | **10** | yes | 2026-10-27T07:59:59 |
| kake | `437f53b1f6` | `f5a9b8acc8` | **5** | yes | 2026-10-27T06:50:41 |
| kama | `3a600d2f72` | `3a600d2f72` | 0 | yes | — |
| kasegi | `96dbd5f427` | `ad7147532c` | **2** | yes | 2026-10-27T08:35:28 |
| kengaku | `0f77f9b279` | `bf783c1ee4` | **3** | yes | 2026-10-27T08:29:33 |
| kumitate | `d23892ad44` | `d23892ad44` | 0 | yes | — |
| mado | `b4a79843cc` | `56026fcb98` | **7** | yes | 2026-10-27T08:36:38 |
| mori | `5b295eeebd` | `5b295eeebd` | 0 | yes | — |
| revenger | `b7abcd875c` | `b7abcd875c` | 0 | yes | — |
| tameshi | `6db1d220b3` | `6db1d220b3` | 0 | yes | — |
| tsukuroi | `3629c46a0e` | `f6a46fa985` | **9** | yes | 2026-10-27T06:41:40 |

**7 of 12 drifted lanes moved: 46 commits landed after the freeze.** Plus one lane outside the drifted
set: **souji** (a *non-drifted* lane) moved **5** commits (`9c76c7222a` → `51acb5fb6f`). **Total
post-freeze movement across all 20 lanes: 51 commits.** Every frozen head is an ancestor of its live
tip (`merge-base --is-ancestor` → true for all 20) — the movement is strictly forward, no history
rewrite, so the frozen heads are permanently resolvable.

**souji is the interesting one.** It moved 5 commits, so at the live tips the drifted set becomes
**13** lanes, not 12. It contributes **0** screen rows (`grep -c "souji-shokunin@"` on
`adjacency-screen-browser.tsv` → 0) and **0** delta candidates, so the row count stays 307 — but the
*frozen* pins file cannot express that souji has moved. The 12-lane drifted set is a freeze-time
artifact, and the lane's post-freeze movement is not representable in the pins file at all.

---

## 3. Question 2 — does the ledger change when re-derived at the live head?

### 3a. The frozen BUILD tool against live-tip pins — **the ledger DOES diff**

Scratch fixture (`$S/fixture-live`, `git init` + asserted toplevel + one commit) carrying
`corpus/adjacency-screen-browser.tsv` from the freeze and `c1-delta-pins.json` rewritten to all 20
live tips. The frozen build tool run against it:

```
drift-audit: 307 rows (304 unchanged, 3 moved, 0 stale) -> ledger-live.tsv
```

Same row count, same class counts — but the **notes differ**:

```
$ diff ledger-frozen.tsv ledger-live.tsv
6,8c6,8
< kaidoku-shokunin@49096c7e…:SKILL.md:585   moved   verbatim at :748
< kaidoku-shokunin@49096c7e…:SKILL.md:621   moved   verbatim at :784
< kaidoku-shokunin@49096c7e…:SKILL.md:652   moved   verbatim at :815
---
> kaidoku-shokunin@49096c7e…:SKILL.md:585   moved   verbatim at :752
> kaidoku-shokunin@49096c7e…:SKILL.md:621   moved   verbatim at :788
> kaidoku-shokunin@49096c7e…:SKILL.md:652   moved   verbatim at :819
```

`ledger-frozen.tsv` is byte-identical to the committed
`corpus/adjacency-screen-drift.tsv` at the freeze (`diff` → no output), so the frozen derivation
reproduces the committed ledger exactly; the live derivation is the one that moves.

**Cause:** kaidoku's `SKILL.md` grew **+4 lines** post-freeze (1568 → 1572, a pure insertion of 4
lines). The three cited texts are unaffected in content and are still `moved` — but their relocation
targets shifted **+4**. At the live head, line `:748` is now an **empty line** and `:784`/`:815` hold
*different* text; the cited text sits at `:752`/`:788`/`:819`.

### 3b. The frozen COUNTER at live-tip pins — **the predicate flips to false**

Scratch clone `$S/lane-clone` (a clone of the lane repo, `git rev-parse --show-toplevel` asserted),
branched off the wave-1 landing `f2f3f14…` with only the pins file replaced by the live-tip pins:

| run | pins | drift.total | auditCoverage | auditFindings | predicate | exit |
|---|---|---|---|---|---|---|
| A | frozen | 307 | 307 | 0 | **true** | 0 |
| B | live tips | 307 | **304** | **3** | **false** | 1 |

The three findings are exactly `audit-moved-wrong-relocation` on the three kaidoku rows (`:748`,
`:784`, `:815`), because the counter re-derives the relocation line at the head it is given and the
committed notes point at the frozen-head locations. Nothing else moves: `completeness.unaccounted` 0,
`delta.total` 0, `delta.unaccounted` 0, `delta.screenFindings` 0, `staleFindings` 0 in both runs.

### 3c. The counter as actually measured — **still passes**

Run against the *unmodified* lane at the wave-1 landing `f2f3f14…` and at the live lane HEAD
`1ee2ab1a…`, using the freeze bytes of the counter and the frozen pins file:

| rev | predicate | drift.total | auditCoverage | auditFindings | delta.total | exit |
|---|---|---|---|---|---|---|
| `f2f3f14…` (wave-1 landing) | **true** | 307 | 307 | 0 | 0 | 0 |
| `1ee2ab1a…` (live lane HEAD) | **true** | 307 | 307 | 0 | 0 | 0 |

`adjacency.verdict` `clean` (16 rows, 16 verified, 0 findings) at both. So **the landed claim C1 is
not falsified**: the counter reads the pins *from the lane repo at REV*, so the frozen heads are the
ones that count, and the measurement is internally consistent.

**Both rows re-verified on pristine detached clones.** Each rev was re-run in its own
`git clone --no-hardlinks` + `git checkout --detach <REV>`, with `rev-parse --show-toplevel` asserted
equal to the clone dir and `status --porcelain` = 0 lines, so no worktree state from the pin-rewrite
fixtures could have leaked in. Both re-runs: **exit 0, `predicate true`**, `adjacency clean 16/16`,
`completeness.unaccounted 0`, `drift.total 307 / auditCoverage 307 / auditFindings 0 /
staleFindings 0`, `delta.total 0 / unaccounted 0 / screenFindings 0`, and the in-run pins digest
`810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655` — matching `frozenDigests`.
Receipts: `evidence/ctr-pristine-f2f3f14.json`, `evidence/ctr-pristine-1ee2ab1.json`.

---

## 4. Is disclosed limit #7 accurate?

> **7. Movement after freeze is invisible.** Delta heads were resolvable at freeze; a sibling commit
> landing afterwards changes nothing in this ledger, by construction.

**Half accurate, and the inaccurate half is the one that matters.**

* **Accurate:** the *frozen counter's verdict* is invariant to post-freeze sibling movement, because
  the counter reads the delta pins out of the lane repo at REV and resolves them as git objects — a
  sibling's later commits are not in the delta head's tree. Verified in §3c: predicate `true` at both
  the landing and the live lane HEAD, with 51 sibling commits landed in between.
* **Accurate:** the *delta pool* stays empty. The counter's `deltaCandidates` over live-tip pins
  returns **0** candidates (same as over frozen pins), and an independent plain-`git diff` scan of
  `SKILL.md` + `corpus/knowledge/` across the frozen→live interval finds **0** added BG non-tabi
  lines in every one of the 8 moved lanes. Nothing new to disposition.
* **Inaccurate:** "changes nothing in this ledger". The *ledger* is not invariant — re-deriving it at
  the live head **changes 3 of its 307 rows** (§3a), and re-running the counter with those live pins
  **fails the predicate** (§3b). The disclosure's own §7 recheck clause says "on any sibling head
  moving … this entry's §4 table is superseded" — which is the truth, but §6.7 says the opposite, and
  §6.7 is the sentence a reader consults when asking whether the numbers are still live.

**Quantified post-freeze drift** (what the disclosure should have said):

| quantity | value |
|---|---|
| drifted lanes that moved after the freeze | **7 of 12** |
| non-drifted lanes that moved after the freeze | **1** (souji, +5) — invisible to the frozen pins file |
| total post-freeze commits across all 20 lanes | **51** |
| frozen heads still resolving | **12 of 12** (all `commit`, all reachable from 5–46 refs) |
| drift rows whose **status** changes at the live head | **0 of 307** (304 unchanged / 3 moved / 0 stale at both heads) |
| drift rows whose **note** changes at the live head | **3 of 307** (the kaidoku relocation targets, +4 each) |
| delta candidates at the live head | **0** (empty at frozen heads too) |
| counter verdict at live-tip pins | **predicate false**, 3 × `audit-moved-wrong-relocation` |
| counter verdict at the lane's own REV (frozen pins) | **predicate true** (landing and live HEAD) |

The status classes are stable; only the *relocation notes* decay. That is a much narrower and more
specific claim than "changes nothing", and it is the one a recheck needs.

**Smallest correction.** Amend §6.7 of `corpus/knowledge/adjacency-drift-audit-r36.md` to replace
"changes nothing in this ledger, by construction" with the measured statement — post-freeze movement
leaves every drift row's *status* unchanged but invalidates the *relocation note* of any `moved` row
whose sibling file grew above its relocation target (measured: 3 of 307 kaidoku rows, +4 lines each;
re-deriving at the live head yields a ledger the counter refuses with 3
`audit-moved-wrong-relocation` findings and `predicate false`) — and note that a lane which moves
*after* the freeze (souji, +5 commits) is outside the frozen 12-lane drifted set entirely, so its
movement is not representable in the pins file. One sentence in §6.7 plus one clause in §7's recheck
paragraph ("re-derive the notes, not just the class counts — §4's class counts are stable, its note
targets are not").

---

## 5. F2 — a latent byte-level defect in the frozen build tool (kama pin)

**Not a round-36 falsification.** It does not change any number in this round's measurement. It is a
divergence waiting for the next round that re-pins.

The frozen build tool and the frozen counter bake **different** round-35 pins for `kama`:

| artifact | kama literal | length | resolves? |
|---|---|---|---|
| `baseline/c1-drift-audit-build.mjs` line 21 | `e8fa87ef19ec5eb28f5fd9701a0a42a45bd688d` | **39** | **no** — `fatal: Not a valid object name` |
| `counters/c1-adjacency-sweep-v4.mjs` line 102 | `e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d` | 40 | yes (`commit`) |

The build tool's literal is the counter's with the character at index 30 (`d`) **deleted** —
`build === counter.slice(0,30) + counter.slice(31)` → `true`. It is a 39-character string, not a git
object name. Every other one of the 19 lanes matches byte-for-byte (`1` differing lane of `20`).

**Why it is inert today.** The build tool uses `PINS` only for a string comparison
(`deltaPins.filter(([s,h]) => h !== PINS[s])`, line 66) and never resolves it. The counter's `kama`
delta head (`3a600d2f72…`) differs from *both* literals, so `kama` is drifted under either and the
two drifted sets are identical (12 lanes, verified element-wise). The build tool's output is
byte-identical to the committed ledger.

**Why it will bite.** The next round that re-pins `kama` back at its round-35 head — the natural way
to retire a lane's drift — makes the two tools disagree. Measured with a scratch fixture carrying
exactly that pins file:

* counter's drifted set → **11** lanes (`kama` dropped);
* build tool's drifted set → **still 12** (`kama` retained, because its 39-char literal can never
  equal any 40-hex pin);
* the build tool therefore emits **9** `kama-shokunin@…` rows into the ledger;
* the counter reading that ledger emits **9 × `audit-not-a-drift-ref`** (rows 191–199) and
  **`predicate false`, exit 1** — against a lane the counter considers non-drifted.

**Smallest correction.** In `baseline/c1-drift-audit-build.mjs` line 21, restore the dropped `d`:
`kama: 'e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d'`. That is a one-character edit that makes the two
frozen literals agree and removes the divergence. Because the build tool's bytes are digest-pinned
(`c8153a5a…`), the fix belongs in a **round-37 amendment** (a new digest), not as a silent edit to
the frozen artifact — same treatment as the already-queued F1 counter amendment. Until then, the
operational rule is: **the drifted set is defined by the counter's literal, not the build tool's; a
lane is drifted iff its delta head differs from the counter's 40-hex `PINS` value.**

Note this finding is independent of the already-known F1 (frozen delta pins read from REV with no
digest binding, w1 `CritC1`): F1 says the pins file is unbound; F2 says the *build tool's own baked
pin set* is wrong for one lane, so regenerating the ledger with the frozen build tool and checking it
against the frozen counter can disagree even with a perfectly bound pins file.

---

## 6. Disclosure §2 / §3 spot-checks that did **not** fail

Recorded so the L1 knows these were attacked and hold:

* §2's table "20 lanes, **12 differ** from the round-35 pins baked into the build tool" — **correct**
  under the build tool's own literal: exactly 12 lanes differ (kama included).
* §2's "Eight lanes did not move (audio, game-dev-2d, game-dev-3d, kagi, kotoba, kotodama, lore,
  souji)" — **correct at the freeze**; souji is the one that moved afterwards (§2 above).
* §3's "build tool … agreeing line for line" for the three status classes — **correct**:
  `build.mjs` lines 85–88 are the `unchanged` / `moved` / `stale` derivations and match the counter's
  definitions; the only divergence between the two artifacts is the kama literal, not the class logic.
* §4's class counts "304 unchanged, 3 moved, 0 stale — 307 rows" — **exact**, both at the frozen head
  and (re-derived independently, 307 rows) at the live head.
* §4's 3 moved notes verify byte-for-byte at the frozen head — **verified**: `sha16` of
  `pin:585` == `frozen:748` (`4a011a192b38c0e3`), `pin:621` == `frozen:784` (`c936a4cf28e373f4`),
  `pin:652` == `frozen:815` (`d8b8cdd83a63733f`). The same sha16 comparison at the **live** head
  gives the +4 shift.
* §4's 4 sampled `unchanged` rows — **verified** at the frozen head (all four still hold their cited
  text at the same line).
* §4's "the file grew 1,405 → 1,568 lines, +163" — **exact** (`wc -l` at pin = 1405, at frozen head
  = 1568); the live head is 1572.

---

## 7. Method and hygiene

* Read-only git in the lane and all sibling repos. The only mutating git calls in this session were
  inside `$S/` scratch fixtures, each preceded by
  `git -C "$D" rev-parse --show-toplevel` asserted equal to `"$D"`.
* The lane repo's own HEAD advanced from `f2f3f14…` to `1ee2ab1a…` during this session (the L1's
  w2 dispatch commits). **No seat-created branch or ref exists in the lane repo or any sibling**
  (checked with `for-each-ref` for `livepins`/`repin`/`execdeltalive`/`scratch` → none); the lane
  reflog shows only `export from jj` entries.
* The two scratch fixtures (`$S/fixture-live`, `$S/fixture-frozen`, `$S/fixture-repin`) and the clone
  `$S/lane-clone` live entirely under the scratch root; the scratch root is removed on exit.
* **Tools installed: none.** Node.js v24.21.0 and git were already present; `git`, `node`, `sha256sum`,
  `diff` and `grep` were sufficient. No pacman transaction was run (host-wide pacman pause respected).
* Evidence (24 files, raw tool outputs + the frozen scripts + every counter JSON) is in
  `.ufo/waves/round-36/w2/ExecDeltaLive/evidence/`.

---

## 8. Findings, smallest correction first

| # | target | finding | smallest correction |
|---|---|---|---|
| **F1** | `corpus/knowledge/adjacency-drift-audit-r36.md` §6.7 (disclosed limit #7) | "a sibling commit landing afterwards changes nothing in this ledger, by construction" is **inaccurate**. Measured: 7 of 12 drifted lanes moved after the freeze (46 commits) plus souji (+5, outside the frozen drifted set) = **51** commits; re-deriving the ledger at the live head changes **3 of 307** rows' relocation notes (kaidoku `SKILL.md` +4 lines → `:748→:752`, `:784→:788`, `:815→:819`); re-running the frozen counter with live-tip pins gives **`predicate false`, 3 × `audit-moved-wrong-relocation`**, exit 1. The *statuses* and the *delta pool* are unaffected (delta pool 0 at both heads, independently confirmed by plain `git diff`), and the counter at the lane's own REV still reads `predicate true` at both the landing and the live HEAD — so C1 is **not** falsified. | Rewrite §6.7's second sentence to: post-freeze movement leaves every drift row's **status** unchanged but invalidates the **relocation note** of any `moved` row whose sibling file grew past its target (measured 3 of 307), and add that a lane moving *after* the freeze is outside the frozen 12-lane drifted set (souji, +5). Add to §7's recheck clause: re-derive the **notes**, not only the class counts. |
| **F2** | `baseline/c1-drift-audit-build.mjs` line 21 (kama round-35 pin) | The build tool's baked `kama` pin is **39 chars** — the counter's 40-hex value with the `d` at index 30 deleted — and **does not resolve** as a git object. Inert this round (string comparison only; both literals mark `kama` drifted). Latent divergence: on the next legitimate re-pin of `kama` at its round-35 head, the build tool keeps `kama` drifted (12) while the counter drops it (11); the build tool then emits 9 `kama` rows the counter rejects with **9 × `audit-not-a-drift-ref`**, `predicate false`, exit 1. | One-character fix — restore the `d`: `kama: 'e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d'`. The build tool is digest-pinned (`c8153a5a…`), so land it as a **round-37 amendment with a new digest**, not as a silent edit to the frozen bytes. Interim rule: define "drifted" by the **counter's** 40-hex `PINS`, never the build tool's. |

**VERDICT finding — F1: the disclosed limit #7 ("movement after freeze is invisible … changes nothing
in this ledger") is inaccurate as written; 51 sibling commits landed after the freeze, 7 of 12 drifted
lanes moved, and re-deriving the ledger at the live head changes 3 of 307 rows and flips the frozen
counter to `predicate false` (3 × `audit-moved-wrong-relocation`). F2: the frozen build tool's `kama`
pin literal is 39 chars and unresolvable — a one-character fix, to be landed as a round-37 amendment
with a new digest. The claim C1 itself is NOT falsified: the counter reads `predicate true`, 307/307,
0 findings, delta 0 at both the wave-1 landing `f2f3f14…` and the live lane HEAD `1ee2ab1a…`, and all
12 frozen heads still resolve.**

---

VERDICT finding — F1: disclosed limit #7 (`adjacency-drift-audit-r36.md` §6.7) is inaccurate as written: 51 sibling commits landed after the freeze (7 of the 12 drifted lanes moved, plus souji +5 outside the frozen drifted set); re-deriving the ledger at the live head changes 3 of 307 rows' relocation notes and flips the frozen counter to `predicate false` (3 × `audit-moved-wrong-relocation`, exit 1) — though every status class and the delta pool are unchanged, and the counter at the lane's own REV still reads `predicate true` / 307/307 / 0 findings / delta 0 at both the wave-1 landing `f2f3f14…` and the live HEAD `1ee2ab1a…`. F2: `baseline/c1-drift-audit-build.mjs` line 21 bakes a 39-char, unresolvable `kama` pin (the counter's 40-hex value with the `d` at index 30 deleted); inert this round, but on the next legitimate `kama` re-pin the build tool keeps `kama` drifted (12 lanes) while the counter drops it (11), so the build tool emits 9 `kama` rows the counter rejects with 9 × `audit-not-a-drift-ref`, `predicate false`, exit 1 — smallest correction is one character (`…a0a42da45bd688d`), landed as a round-37 amendment with a new digest. All 12 frozen delta heads still resolve (`commit`, reachable from 5–46 refs, all ancestors of their live tips). C1 is NOT falsified; no tools installed; scratch removed.
