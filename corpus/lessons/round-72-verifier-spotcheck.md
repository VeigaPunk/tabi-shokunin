# tabi — round 72 verifier spot-check (non-author)

author: hyaku closure (non-author integrator, @m_zfl)

Closure of tabi lane round 72 (attempt 2). Report `.ufo/reports/round-72/tabi.md` (fleet repo);
lane base `4e4ac0800abf5ad19d2a12caf46f80a873ebba8d`, lane tip `0e462227edb2d1a18d83dc06ad231c92f5855137`.
The verifier did not author any round-72 byte. All commands below were run at closure
(2026-11-06, after 21:17 -03:00) over committed bytes.

Driver digest (`.ufo/watchdog.log` lines 3068/3076/3077/3103):
launch attempt=1 19:15:35 → lane-dead-no-report 20:22:49 → launch attempt=2 20:22:51 → complete
attempt=2 21:17:49 (-03:00).

## Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report landed by lane identity | `git log --format='%an %H %ci' -- .ufo/reports/round-72/tabi.md` | `tabi-shokunin 83a9da4e… 2026-11-06 21:17:25 -0300` (after last lane commit `0e462227` at 21:16:26) | ok |
| SHONEN heading, one line per box | read report `## SHONEN` | 4 lines, all `[~]` with pointers; no `[x]` | ok |
| cited hashes exist and are ancestors of `master` | `git cat-file -e` + `git merge-base --is-ancestor <h> refs/heads/master` for `4e4ac080 0217f780 8356a09e 7366d45c b78608f6 cfa92fa2 908328da 0e462227` | 8/8 ok; the 7 round commits authored `tabi-shokunin` | ok |
| lane committed and pushed | `scripts/hyaku/jj-lane.sh state …/tabi-shokunin`; `git status --porcelain \| wc -l`; `git ls-remote origin refs/heads/master` | `ahead=0 behind=0 tracked=0 untracked=0`; `0`; `0e462227…` | ok |
| prompt carries template contract | `diff` of sections 1–5 of `.ufo/prompts/tabi-round-71.md` vs `tabi-round-72.md` | only the round number differs (lines 1, 69, 101, 133); r71 closure verified those sections = template | ok |

Defects (status-neutral): attempt 1 died without a report and left the r72 instruments and
controls uncommitted; attempt 2 re-verified (each smoke receipt's `driverSha256` = driver file)
and landed them in `0217f780` before the freeze. Recorded, not penalised.

## Claim C1 — coverage, capability `chromium-synth-pinch-gesture-linux` (generation r72)

Frozen predicate `C1-SYNTHPINCH-R72` (`.ufo/waves/round-72/claims.json`, freeze `8356a09e`,
digests `7366d45c` committed 20:34:01, scored run `b78608f6` committed 20:38:55).

| leg / check | how | observed | re-measured vs evidence-verified |
|---|---|---|---|
| instruments unchanged after freeze | `git show <rev>:<f> \| sha256sum` at `b78608f6` and `0e462227` for the 5 files in `freeze.txt` | driver `d007adec…`, counter `142062ef…`, battery `414e04a6…`, kill-power `dae07c98…`, claims `bba7927b…` — all equal freeze.txt at both revs | re-measured |
| before: capability row | `git show 4e4ac080:SCORECARD.md \| grep -c '^| \`chromium-synth-pinch-gesture-linux\` |'` | 0 | re-measured |
| (a) scored counter | `scored/c1-counter-a.exit`, `jq '{verdict,checks:(.checks\|length)}' scored/c1-counter-a.json`; `sha256sum` receipt; `jq -r .driverSha256` | exit 0, `clean`, 94 checks, findings `[]`; receipt `ac2245cf…60b9` = report; driverSha256 = frozen pin | evidence-verified (gate not executed) |
| (b) R72Exec1 cold run | `jq` on `w1/R72Exec1/counter.json` and receipt nonce | `clean`, 94 checks; nonce `tabi-r72-exec1-3f9a1c7b` | evidence-verified |
| (c) battery | `jq '{allOk,passed,failed,cases,coverageGap}' scored/c1-negatives-a.json`; `.exit` | exit 1; `allOk:false`, 217/218, failed `in-wheel-anchor-2px` (exit 0, no finding), coverageGap `[]` | evidence-verified |
| (c) kill power | `jq '{holds,unmutatedExit,killed}' scored/c1-kill-power-a.json` | exit 1; `holds:false`, `unmutatedExit:1` (94/94 force-true and 12/12 semantic killed, but vacuous since the unmutated battery is already red) | evidence-verified |
| (c) cause | `sed -n 159p scripts/negatives-synthpinch-r72.mjs`; `sed -n '33p;204,206p' scripts/check-synthpinch-r72.mjs`; `jq` first `in` wheel of the scored receipt | case adds `clientX += 2`; counter accepts `abs(clientX-400) <= 1`; first `in` wheel is at (399,299) → 401 passes → the refuse case is accepted. Same case red on `lesson-proof/battery-smoke3.json` and `battery-smoke6.json` (214, failed `in-wheel-anchor-2px`), green on smoke2/5 | re-measured |
| (d) row + note | capability `grep -c` at `0e462227`; note `source:` line | row count 0 (withheld); note exists, line 1 cites S179 | re-measured |

C1 verdict: **not verified — leg (c) false as frozen; honest stop is correctly reported.** The
kill rule "any predicate leg (a)–(d) false at the lane tip" fires; nothing was amended after the
freeze (digests hold). No capability admitted.

Lane-owned gate evidence (§Gate standard, not executed): `scored/selftest-r72-gates.out` tail
`clean=true cases=8 failed=none` / `exit=0`; `scored/gate-registry-908328da.json` measured at
rev `908328da…`.

Owned-axis harm: `git diff 4e4ac080 0e462227 -- SCORECARD.md` is append-only (a new `## Round 72`
block; the `908328da` "SCORECARD corrections" touch only that new block). `PROVINCE.md` and
`SHONEN.md` unchanged; `LOG.md`, `SKILL.md`, `corpus/QUALITY.md` additions only (+8/+8/+6).
No axis harmed.

| axis | verdict | reason |
|---|---|---|
| coverage | unchanged | C1 not verified (leg c red); capability rows 0 → 0 |
| operability | unchanged | no claim; no regression found |
| adjacency | unchanged | no claim; PROVINCE.md unchanged |
| depth | unchanged | no claim (knowledge note counted under expansion trend, not an axis claim) |
| freshness | unchanged | no claim |
| calibration | unchanged | no claim |

No exploratory claim was declared.

## Discernment spot-check (lesson `corpus/lessons/round-72.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| knowledge note `chromium-synth-pinch-gesture-runtime-round-72.md` (delta law) | admit | S179 re-fetched (`curl …touchpad_pinch_event_queue.cc?format=TEXT`, HTTP 200, base64-decoded: 239 lines, sha256 `4930d517…8f73`, byte-identical to staged copy); scored receipt via `jq` | agree | line 44 is `delta_y = 100.0f * log(pinch_event.data.pinch_update.scale);`; Σ deltaY×scale: in −69.31471 (= −100 ln 2), out +69.31471, clamp +69.31472, default −40.54652 (= −100 ln 1.5); the page-scale division is correctly labelled inference |
| "Σ deltaY over a pinch equals −100 ln(scaleFactor)" | reject | scored receipt, `jq` raw sums | agree | `in` raw Σ deltaY = −48.992 ≠ −69.315; only the clamp leg (page scale 1) matches raw — flip condition is accurate |
| "Pinch ctrl+wheels land exactly at the anchor" | reject | scored receipt, `jq` count of wheels ≠ (400,300) | agree | `in` 12/17, `default` 6/9 off anchor, clamp 0/16 — exactly the lesson's counts |
| capability row `chromium-synth-pinch-gesture-linux` | reject (withheld) | `scored/c1-negatives-a.json` | agree | leg (c) red as re-checked above |

SOURCES row re-opened: **S179** (`corpus/SOURCES.md:193`). Location cell "39-40 (wheel deltaY sign
inverted; Math.exp(-deltaY/100) converts back), 53-60 (kControlKey added; kScrollByPrecisePixel;
delta_x 0)" matches decoded lines 39–40 and 53–60. Lesson quotes: line 44 (5 words) verbatim;
lines 39–40 (22 words, ≤25) verbatim modulo comment markers and one double space. Agree.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0,
25 W04 duplicate-url warnings (S058–S173, pre-existing), `ok`. Registry rows 178 → 179
(`grep -cE '^\| S[0-9]{3} '` at base/tip).

## Trend verdicts

- **expansion: improved** — knowledge 84 → 85 (`git ls-tree` count at base/tip), the new note
  cites a newly opened, `mined`, tier-A row S179 whose content re-verifies; registry 178 → 179.
  No capability entered.
- **quality: unchanged** — no admitted entry failed a re-check; no weaker entry superseded; the
  r71 R1 fix lives only in a withheld generation. Agrees with the lane.
- **discernment: improved** — the non-author spot-check agrees with the gate on the admit and
  all three rejects; the round's two mistakes became QUALITY 135–136, each citing its round-72
  red state (`corpus/QUALITY.md` `## Round 72 additions`). (Lane self-graded `unchanged`
  pending this check.)

## Routed defects (tabi must address in round 73)

1. Battery case `in-wheel-anchor-2px` is receipt-relative and lands inside the counter's ±1 anchor
   tolerance whenever the first `in` wheel sits at x 399; replace with an absolute anchor case and
   run counter, battery and kill power over every pre-freeze repetition receipt (QUALITY 135).
2. Replay hole (R72Critic `zeroedit`/`forged-a`, R72Review1 FG1): legs (a)/(b) are satisfied by a
   replayed or nonce-rewritten pre-freeze receipt; the next generation's do-nothing controls must
   include both replays and the counter must refuse them (QUALITY 136).
3. Carry-overs the report names but this round did not close: R72Review1 FG1–FG11/S4, R72Mut1's 13
   survivors, R72Review2 F3, R72Scout's four-row R3 proposal, r71 R2 verifier hardening, r71 R4/R5.
4. SHONEN: all four boxes `[~]` with pointers; box 2 (end-to-end task logged in `LOG.md`) and box
   4 (PROVINCE accurate) look checkable by a non-author — operator-owned promotion decision.
