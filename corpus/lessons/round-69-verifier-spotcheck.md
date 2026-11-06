# tabi round 69 — non-author verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Date 2026-11-06. Lane-round tabi r69, base `58d84eda992ffc11d77d76a2c1019bfe061f9241`, after
`fdd60a18862f6b7533fb723eb3162d08c8720761`. Report `.ufo/reports/round-69/tabi.md` (fleet repo),
dispatched prompt `.ufo/prompts/tabi-round-69.md`. I did not author this round and changed none of
its files; every measurement below was run by me in this session over committed bytes unless it
is marked evidence-verified (lane gate receipts are read, never executed).

Driver digest (copied from the mutable `.ufo/watchdog.log`):
`2026-11-06T15:39:17-03:00 launch tabi round=69 pgid=1081675 driver=hyaku-inline attempt=1` ·
`2026-11-06T16:17:33-03:00 complete tabi round=69; hyaku-inline attempt=1`.

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %ae %H %cI' -- .ufo/reports/round-69/tabi.md` (fleet) | `tabi-shokunin tabi@shokunin.local 13b99268… 2026-11-06T16:16:45-03:00` (before the 16:17:33 completion line) | pass |
| SHONEN heading, one line per box | report `## SHONEN`; `git show fdd60a18:SHONEN.md \| grep -c -E '^\s*- \[[ x~]\]'` | heading present, 4 report lines `[~]` with pointers; SHONEN.md has 4 boxes, unchanged in the round (`git diff --stat 58d84eda fdd60a18 -- SHONEN.md` empty) | pass |
| cited commits exist and are ancestors of `master` | `git cat-file -t <h>`; `git merge-base --is-ancestor <h> master` for 58d84eda, a70c231d, a033979c, d65546b3, b4a66f92, fdd60a18 | 6/6 `commit`, 6/6 ancestor | pass |
| lane pushed, no leftovers | `scripts/hyaku/jj-lane.sh state …/tabi-shokunin`; `git status --porcelain`; `git ls-remote origin refs/heads/master` | `local=remote=fdd60a18… ahead=0 behind=0 tracked=0 untracked=0`; porcelain empty; remote `fdd60a18…` | pass |
| round commits by lane identity | `git log --format='%h %an %ae %s' 58d84eda..fdd60a18` | 5 commits, all `tabi-shokunin tabi@shokunin.local` | pass |
| prompt carries the template contract | `grep -n '^## ' .ufo/prompts/tabi-round-69.md` | §1 MISSION/AXES, §2 claims, §2b frontier, §3 L2 floor, §4 report contract (SHONEN rule at :118-119, :521), §5 commit/push, §6 hyaku addendum, §7 scratch | pass |
| instruments frozen before scored runs | `git log --format=%h -- scripts/check-synthscroll-r69.mjs scripts/check-sibling-matrix-r69.mjs scripts/chrome-cdp-synthscroll-round69.mjs`; `sha256sum` at fdd60a18 vs `.ufo/waves/round-69/freeze.txt` | only `a70c231d` (pre-freeze) touches them; counter/driver/snapshot sha256 `b62f9c7d…`, `c1b3763c…`, `13ea3f8a…`, `5aa91a58…` equal the freeze digests | pass |

Status: **ok** (real report, checkable work, all commits landed and pushed).

## 2. Per-claim re-check

### C1 — adjacency (lowest, 8): PROVINCE.md sibling matrix, predicate `C1-MATRIX-BOUND`

| measure | command (mine) | observed |
|---|---|---|
| matrix before | `git show 58d84eda:PROVINCE.md \| grep -c 'sibling matrix'`; table-header count | 0; 0 |
| matrix after | split `git show fdd60a18:PROVINCE.md` at `## Adjacent — sibling matrix (round 69)`, count `\| ` data rows | 20 rows; labels none 11, adjacent 4, contested 5 |
| snapshot pin | each row's `head` present in `git show fdd60a18:.ufo/waves/round-69/c1/sibling-heads-r69.tsv` | 20/20 |
| quote on cited line at pinned head | for each row `git -C <lane>-shokunin show <head>:<path>` line `<n>`, quote substring after stripping markdown backticks | 20/20 (15/20 raw; the 5 misses — kagi, kaidoku, kengaku, kumitate, revenger — differ only by stripped code-span backticks) |
| content, not form | distinct `tabi side` cells; quotes cited at `:1` (title line) | 19 distinct of 20 (the two game-dev rows share one); 0 title-line quotes |
| contested scope named | rows labelled `contested` | kagi (`PROVINCE.md:64` "contested with kake", CDP 9222 lease), kake (`:45` "contested scope (kagi/tabi/kake)"), kaidoku (`:55` self-launched chromium `--remote-debugging-port=9222`), revenger (`:33` loopback CDP endpoint), kumitate (`:14` `~/.kimi-code/` census, which contains tabi's kimi-webbridge substrate per tabi `PROVINCE.md:6-7`) |
| reciprocity disagreement | `git -C kotoba-shokunin show 0344ddae:PROVINCE.md` line 76 | kotoba grades tabi `none`; tabi grades kotoba `adjacent` — reported in the lesson and L0 (`.ufo/l0-questions.md:380`), not resolved |
| gate evidence (evidence-verified) | `scored/c1-counter-tip-b4a66f92.json`; `c1-negatives-tip-b4a66f92.json` | `verdict clean, siblings 20, bound 20, findings []`, inbound kake/kengaku/kotoba, outbound kagi/kaidoku/kake/revenger; battery `refusedForExpectedReason 19, failed [], positiveOk true`, counterSha256 equals freeze |

Reported 0/20 → 20/20 matches my re-derivation. The lane's disclosed limit holds: the counter
(and battery) prove form, reciprocity and routing, and R69Critic's null matrix also greens it, so
the frozen command alone cannot carry an adjacency move. I therefore graded the move on content,
which is what AXES.md names as adjacency's evidence ("lane reports name contested scope;
integrator arbitrates"): five contested scopes are named with located sibling text, every one is
reported rather than absorbed, and the row sides are row-specific (19 distinct). On reading, I
agree with all five contested rows (kagi/kake state the contest in their own words; kaidoku and
revenger self-describe loopback CDP Chromium targets, tabi's owned ground; kumitate's census path
contains tabi's substrate). This differs from r68 (gate integrity, 0 adjudications, graded
unchanged) and r66 (currency rebind, 0 disposition changes): r69 lands dispositions.
**Axis verdict: adjacency — improved.** Re-measured: row count, snapshot binding, quote binding,
distinct sides, contested set. Evidence-verified: counter and battery receipts.

### C2 — coverage (9): capability `chromium-synth-scroll-gesture-linux`, predicate `C2-SYNTHSCROLL-LIVE`

| measure | command (mine) | observed |
|---|---|---|
| receipt before | `git show 58d84eda:corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json` | path absent at base |
| receipt after | `git show fdd60a18:<receipt> \| sha256sum` | `587100d9e71ab586…539c667f8` (equals report) |
| driver pin | `git show fdd60a18:scripts/chrome-cdp-synthscroll-round69.mjs \| sha256sum`; receipt `.driverSha256` | both `13ea3f8a…62abce3` |
| host | receipt `.host` | Chromium 155.0.8059.84 Arch Linux, `--headless=new`, CDP 1.3 |
| legs | receipt `.legs[] \| {name,scrollYBefore,scrollY}` | mouse 0→600, default 600→300, repeat 300→900, touch 900→900 |
| wheel delivery | receipt `.events[] \| select(.type=="wheel")` grouped by leg | mouse 46 events Σ deltaY 600; default 25, Σ −300; repeat 51, Σ 600; all `isTrusted` |
| CDP producer log | receipt `.cdpSendLog \| map(.method)` | `Input.synthesizeScrollGesture` ×4; no `dispatchMouseEvent`, no script scroll method |
| independent run (b) | `.ufo/waves/round-69/w1/R69Exec1/counter.json` | `verdict clean`, 63 checks, nonce `tabi-r69-exec1-a8d7aa1f` ≠ run (a) nonce `tabi-r69-scored-81ac744e` |
| gate evidence (evidence-verified) | `scored/c2-counter-a.json`; `scored/c2-negatives-a.json`; `scored/selftest-r69-gates.out` | clean, 63 checks, findings []; 44 refused for expected reason, failed [], counterSha256 = freeze; selftest `clean sibling-matrix=0 synthscroll=0`, `exit=0` |
| knowledge | `git ls-tree -r --name-only <rev> corpus/knowledge \| wc -l` | 81 → 82 |

Reported exit 2 (no receipt) → exit 0 clean matches the committed receipts; the receipt's own
content (scroll deltas equal to wheel sums, trusted events, CDP log) is consistent with a live
Chromium run. The disclosed limit stands: the counter checks internal consistency and a
self-attested pin; provenance rests on the two differing runs and the driver source.
**Axis verdict: coverage — improved** (capability measured on the domain's real surface; score
held at 9 by the lane, which is consistent with the r68 closure's treatment). Re-measured: receipt
digest, driver pin, legs, wheel sums, CDP log, knowledge count. Evidence-verified: counter,
battery, run (b) counter, gate selftest.

### No axis harmed

`git diff --numstat 58d84eda fdd60a18`: only two files lose lines — `report written` (0 1; the
r68-routed stray file, removed as routed) and `corpus/SOURCES.md` (2 1; the S173 `used-by` in-place
change, which CORPUS.md allows and the lesson logs old→new). SCORECARD.md `21 0` (append-only
round-69 block), SKILL.md `9 0`, PROVINCE.md `35 0`, LOG.md `9 0`, QUALITY.md `2 0`, README.md `5 0`.
No earlier score lowered or entry rewritten.

## 3. Per-axis verdicts

| axis | claim | verdict |
|---|---|---|
| adjacency | C1 | improved |
| coverage | C2 | improved |
| depth | — | unchanged |
| operability | — | unchanged |
| freshness | — | unchanged |
| calibration | — | unchanged |

Every declared claim verifies and no axis is harmed: **admitted**.

## 4. Discernment spot-check (`corpus/lessons/round-69.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| `corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md` (S174, S173) | admit | live Gitiles `…/155.0.8059.84/content/browser/devtools/protocol/input_handler.cc?format=TEXT`, base64-decoded; committed receipt | agree | decoded bytes sha256 `72cf0d1d…324f4`, 2,343 lines, equal the staged digest; lines 71-79 (absent source → `kDefaultInput`), 2167-2170 (`kDefaultPreventFling = true`, `kDefaultSpeed = 800`), 2190-2191 (repeat delay 250 ms), 2239-2249 (repeat loop, response in `else`) say what the note cites; receipt legs match the note's table |
| PROVINCE.md sibling matrix | admit | 20 sibling `PROVINCE.md` lines at the snapshot heads | agree | 20/20 quotes located (§2 C1); contested rows read correctly |
| touch-source scrolling as a capability | reject | `.ufo/waves/round-69/w1/R69Exec4/summary.json`; scored receipt touch leg | agree | every synthesizeScrollGesture touch variant `touchScrolled:false`, `touchmove 0`; `dispatch-touch-control` scrolled 525 with 24 `touchmove`; scored touch leg 900→900 — the evidence supports neither "works" nor "cannot work" |
| "S174 authenticates the build that ran" | reject | decoded S174 bytes vs host `/usr/bin/chromium` (Arch) | agree | a source digest proves byte identity with the tag, not that the distro binary was built from it unpatched |

New SOURCES row re-opened: **S174**. Lesson quote 1 "if (repeat_count > 0) {" (4 words) is on
decoded line 2239; quote 2 "gesture_params.prevent_fling = prevent_fling.value_or(kDefaultPreventFling);"
(1 statement) is on line 2169. Both ≤25 words and located. The row's `teaches` cell (30 words) is a
paraphrase, which CORPUS.md does not cap.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0,
`tabi ok …/corpus/SOURCES.md`, W04 cross-scope duplicate warnings only (S058…S173). Rows 173 → 174
(`grep -c '^| S[0-9]'` at base and after). S174/S162 share a document under different URLs, so no
W04 fires for them; disclosed by the lane.

Result 4/4 agree, both sides of the gate sampled.

## 5. Trend verdicts

- **expansion — improved.** Knowledge 81 → 82, SOURCES 173 → 174, capability row
  `chromium-synth-scroll-gesture-linux`, first sibling matrix (0 → 20 bound rows).
- **quality — unchanged.** No earlier admitted entry re-verified, corrected or superseded; S173
  gained a used-by pointer only.
- **discernment — improved.** The lane kept both counters' refutations on record and claimed on
  content rather than on the green command; both rejects are well drawn with flip conditions; my
  outside check agrees 4/4 with its admit/reject calls.

## 6. Routed defects (status-neutral; lane fixes next round unless marked otherwise)

- R1 Both r69 counters prove form only (R69Critic null and over-claim matrices green C1; a
  fabricated-but-consistent receipt greens C2). The lane's r70 plan (cross-run binding, Chrome
  stderr/port, fixture hash) is the right repair.
- R2 Battery gaps: C1 R69Mut1 4 survivors (m06/m14/m17/m18), C2 R69Mut2 4 survivors (per-leg
  scrollYBefore, absolute scrollY, wheel direction, nonce shape).
- R3 `scored/c1-negatives-tip-b4a66f92.json` names its input as `/fast/scratch/hyaku/tabi-r69/L1/tip/PROVINCE.md`,
  a scratch path that no longer exists; the committed counterSha256 and the tip PROVINCE carry the
  verdict, but receipts should name a repo path or a commit.
- R4 `w1-results.json` records `agent/name/note/output` only; the "12 settled, 0 dead" claim is not
  machine-checkable from it. Record a per-seat status field.
- R5 kotoba ↔ tabi two-sided disagreement (`none` vs `adjacent`): integrator arbitration owed
  (L0 `tabi | round-69`). The adjacency axis ruling L0s (round-67, round-68) remain open for the
  operator; this closure graded r69 on contested scope named, AXES.md's stated evidence.
- R6 `check-gate-registry --rev b4a66f92` still lists 5 pre-existing missing registry rows.
- Operator note: SHONEN box 4 ("No cross-domain bleed (PROVINCE.md still accurate)") now looks
  checkable by a non-author — this pass re-located 20/20 sibling quotes. Promotion is
  operator-owned; no `[x]` written.
