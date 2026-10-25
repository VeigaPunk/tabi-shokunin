# CriticWaveConformance — tabi round 22, wave w2b

Seat: `TabiR22-2.CriticWaveConformance-12` (critic). Review revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`, plus the uncommitted w2b dispatch artifacts in the working tree (they postdate that commit and are not in it: `git ls-tree e3cf4e0 .ufo/waves/round-22/w2b/` prints 0 entries). Static review only. I ran no lane scripts, installed nothing, and wrote only this file.

## Axes

- **A1 seat accounting:** per-wave and round totals against the ≤200 limit.
- **A2 refusal and crash chronology:** whether the refusal count and the order of events are true to the retained records.
- **A3 role mix and routing:** against the addendum, the round prompt and the host route table.
- **A4 identity and provenance:** spec names, spawned ids, registry, committed evidence.
- **A5 wave-design conformance:** fresh seats, planner, leaves, absolute paths, no padding, Godspeed lead.

## Verdict

The headline accounting holds:

| Wave | Spawned | Dead | Replaced |
|---|---|---|---|
| W1 | 64 | 0 | 0 |
| W2 | 0 | 0 | 0 |
| W2b | 65 | 0 | 0 |

- **Round total:** 129 spawned seats. Counting the reserved-but-never-spawned W2 as well gives 193. Both are ≤200.
- **Planner:** held by the L1. The validator never sees a planner role.

I found two real accounting defects that need disclosure (F1, F2), one evidence/provenance duty that is still open (F3), and three tradeoffs to disclose (T1–T3). None of these touches C1's measurement.

## Findings

### F1 — the W2b size is stated as 64; it is 65 (A1)

- **Where:** working tree `.ufo/waves/round-22/w2b-spec.json:298` (item `CriticWaveConformance`) says "this post-crash fresh wave 64".
- **What the records show:** the same file's `maxLanes` is 65 with 65 items. The context at line 3 says "65 attack items". `w2b-validation.json:6` has `"maxLanes": 65` and line 17 has `"spawn": 65`. `w2b-spawn-result.json` (attempt 12) reports "Spawned 65 background agents" and lists 65 unique ids.
- **Counterexample:** a round report that copies this item's wording records W2b = 64 and a round total of 128 instead of 129.
- **Preserving positive:** the context string and the validator agree on 65, so dispatch itself was correct.
- **Smallest fix:** in the round report, record W2b as 65 seats (31 reviewer, 19 scout, 9 critic, 2 connector, 4 mutation-tester) and the round total as 129 spawned.

### F2 — "14 whole-payload cap refusals … its host session then died" is overstated and misordered (A2)

- **Where:** working tree `w2b-spec.json:3` (context `# Goal`, repeated in `w2b-validation.json:427` and in my item at line 298).
- **What the committed records show at e3cf4e0:**
  - **Recorded refusals:** 13, in `w2-cap-refusal-01..09` and `-11..14`, all with payload sha `070e13cd…` and 64 refused ids each.
  - **Attempt 10:** not a recorded refusal. The note at `e3cf4e0:.ufo/waves/round-22/w2-cap-refusal-11.json:16` says it is "unrecorded: slot granted 16:10:37Z, kernel died 16:10:51Z before any result".
  - **Order of events:** the host died during attempt 10, between attempts 9 and 11. Attempts 11–14 ran afterwards in the replacement `TabiR22-2`, whose transcript starts at 16:26:52Z. So "14 refusals, then the host died" puts the death in the wrong place.
- **Dead transcript, read-only:** the last cell of `TabiR22.jsonl` ends with "backoff before attempt 10", then "[kernel] Python kernel shutdown", then "[Kernel died during execution; completion is uncertain…]".
- **Corroboration that attempt 10 spawned 0 seats** (I searched the 14 GB sessions tree):
  - `rg -l -F "TabiR22.Outcome01-10"` matched only my own transcript.
  - The dead L1's seat directory contains no `Outcome*`, `Preserve*` or `Trace*` transcripts.
  - So "0 seats" is supported, but by absence of evidence, not by an observed refusal.
- **Counterexample:** a closure counting refusal receipts finds 13 files and a gap at 10. The claim "14 refusals" then fails as stated.
- **Preserving positive:** the `-11` note itself is honest. W2 total spawned is still 0, and the 0-seat conclusion stands.
- **Smallest fix:** in the round report, write "W2: 14 dispatch attempts, 13 recorded whole-payload refusals (1–9, 11–14) and attempt 10 unobserved. The host died at 16:10:51Z mid-attempt 10, and attempts 11–14 came from the replacement L1. 0 seats (no seat transcripts)."

### F3 — the W2b registry still has no agent ids, and 18 spawned ids do not follow the "-12" pattern (A4)

- **Where:** working tree `w2b/swarm-registry.json:4-5`. Both `createdAt` and `updatedAt` are 16:40:54.992Z, which is validation time, and all 65 members have `agentId: null`.
- **Expected:** `ufo-swarm-wave.mjs` lines 54–58 say spawn lanes land with null ids and that `record` fills them once the task call returns ids. W1 did this: `w1/swarm-registry.json` has 64/64 ids, plus `dispatch-label-check.json`.
- **Id derivation:** the spawn result has 47 `-12` ids and 18 `-16` ids.
  - The 18 `-16` names are exactly the names W2b shares with W2's spec (0 mismatches when checked).
  - The replacement session's four W2 attempts (11–14) had already used those names' id counters, which explains the `+4`.
  - Without a record, nothing in the lane binds `ReviewPopulation` to `TabiR22-2.ReviewPopulation-16`.
- **Counterexample:** a later resume or collect step for `ReviewPopulation` fails closed (`resume_unknown_member`), or binds by guessing `-12`.
- **Preserving positive:** W1's registry and label check bind every id.
- **Smallest fix:**
  1. Run `ufo-swarm-wave.mjs record --registry .ufo/waves/round-22/w2b/swarm-registry.json` with the 65 name→id pairs from `w2b-spawn-result.json`.
  2. Note the `-16` derivation.
  3. Commit `w2b-spec.json`, `w2b-validation.json`, `w2b/swarm-registry.json`, `w2b-cap-refusal-01..11.json` and `w2b-spawn-result.json` as wave evidence (addendum `scripts/hyaku/lane-addendum.md:62-63`). They are currently untracked.

## Tradeoffs to disclose (not bugs)

### T1 — two dispatch chains for the second wave: 26 attempts (A2)

- **W2:** 14 attempts with payload `070e13cd`.
- **W2b:** 12 attempts with payload `d81e11a1`. Refusals 1–11 ran every 3:00–3:01 from 16:41:02Z to 17:11:05Z, and attempt 12 spawned at 17:14:05Z.
- **Within the rule:** each payload stayed within "same payload unchanged, ~3 min, max 20" (round prompt and addendum `lane-addendum.md:146-148`).
- **Why the replacement is justified:** the repair at e3cf4e0 changed the reviewed bytes, so W2's payload, which targeted 0f24164, was stale. This is not splitting or shrinking: 65 ≥ 64.
- **Remaining gaps:**
  - The W2b context (line 3) predates and omits W2b's own 11 refusals. The report must list both chains.
  - W2b keeps no release receipts. W2 has them only for attempts 3–9 (`e3cf4e0:w2-retry-slots.json`, 7 `releaseStdout`).
  - Mitigation: the ledger `~/.local/state/shokunin-hyaku/wave-slots`, read now, has no `tabi` lines, so nothing is stranded.

### T2 — routing differs from the addendum text but matches the governing host route table (A3)

- **Captured routes at W2b spawn** (`w2b-spawn-result.json` `details.progress[].modelRole`):

  | Role | Route |
  |---|---|
  | reviewer | m_mim (31) |
  | critic | m_auto (9) |
  | scout | m_flash (19) |
  | connector | m_flash (2) |
  | mutation-tester | m_sol (4) |

- **Addendum** (`lane-addendum.md:71-79`, and `.ufo/prompts/tabi-round-22.md:211-219`): reviewer → m_zfl, critic → m_swe.
- **Resume brief** (`/fast/scratch/hyaku-resume-s3/tabi.md:14`): reviewer m_swe, critic m_flash.
- **The L1's session_init role map** (`TabiR22-2.jsonl` line 6): reviewer @m_mim, critic @m_auto. This matches the capture.
- **Which source governs:** round prompt §3 (`tabi-round-22.md:90-93`) says "the route table, not this prompt, decides". So the L1 is conformant.
- **Cross-wave change to disclose:** W1 reviewers ran on m_swe (`w1-spawn-result.json`), while W2b reviewers run on m_mim (`opencode-go/minimax-m3.1-flash-free`). The host config moved the reviewer route m_swe → m_mim at 15:46:32Z. All 12 RowOutcome falsifiers are on that free-tier route.
- **Fleet-owned drift:** `lane-addendum.md` still names m_zfl/m_swe. This is a candidate L0 note, not a lane edit.
- **Smallest fix:** record "routes = host role map at spawn (reviewer m_mim, critic m_auto, scout/connector m_flash, mutation-tester m_sol); W1 reviewer m_swe", plus the actual answering model for any claim that depends on it.

### T3 — role mix against the Wave-2 rule (A3/A5)

- **Connectors:** the addendum (`lane-addendum.md:54-55`) lists "fresh reviewer/critic/mutation-tester/scout seats" for Wave 2. W2b adds 2 connectors, about 3% of the wave.
  - `ConnectScope` (sibling-overlap) is harmless.
  - `ConnectCausal` (`w2b-spec.json:308`) asks it to "cross-link findings of row reviewers". Those are concurrent siblings in the same wave, and messaging is forbidden by the context. Its cross-link can only cover whichever row reports exist when it reads; at my review, 19 of 65 w2b reports existed.
  - **Smallest fix:** the L1 does the final causal cross-link at integration, as part of its planner seat, and the report labels `ConnectCausal`'s coverage by the row reports it actually cites.
- **Within the guidance (positive):** mutation-tester 4 is ≤4, and critic 9 is close to ~8.
- **W1 executors:** W1 had 3 executors against the ~16-per-96 guide. This is legitimate under "executor only when it writes or runs code" (`lane-addendum.md:90-91`), and the §3 floor of 3 executors is met.
- **Overlap on the refusal chain:** `ScoutRegistry` (`:238`), `ScoutCrashRecord` (`:248`) and this item all examine it. The overlap is partial, not padding, since each has a distinct question.

## Passing checks (A5)

- **Fresh seats:** every W2b seat is a fresh spawn (`counts.resume: 0`). No dead seat was replaced, and W2 had none to replace.
- **Planner:** the context ends "Seats are leaves; the parent L1 holds the planner seat". The planner is absent from roles.
- **Report paths:**
  - All 65 prompts contain their own absolute `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-22/w2b/<name>.md`.
  - All 65 tasks carry the lane-relative `Report:` trailer.
  - The context states the trailer-relative-to-lane rule.
- **Context bounds:** the context contains the RULES.md tooling sentence and the pacman PAUSED guard, and no `agent://all`. `taskCall.context` is identical to `spec.context`.
- **Godspeed lead:** all 65 prompts start with byte-identical lead bytes, the same as W1's.
- **Execution scope:** the 26 execution-permitted items (22 reviewers and 4 mutation-testers) each get a private `/tmp/tabi-r22-w2b-<name>` clone. There are no concurrent writers on the lane.
- **No overlapping L1 sessions:** the old `TabiR22` last wrote at 16:10:53Z and `TabiR22-2` starts at 16:26:52Z. There was no duplicate writer.
- **W1:** 64 reports exist in `w1/`. `w1-outcomes.json` records deadSeats 0 and replacementSeats 0. It also notes one seat (`ReviewChronology`) not yet disposed and `allActorQuiescenceCertified: false`. The report should keep that qualifier.

## Commands exercised

All commands below are read-only.

- **Exit 0:**
  - `ls`/`git log`/`git status`/`git ls-tree e3cf4e0` on the lane.
  - Node `-e` JSON tabulations of `w2b-spec`, `w2b-validation`, `w2b-spawn-result`, `w2*-cap-refusal-*`, the registries, `w1-*` and `w2-spec`.
  - `git show e3cf4e0:…` for `w2-cap-refusal-11.json`, `w2/swarm-registry.json` and `w2-retry-slots.json`.
  - `rg` over the fleet addendum, the round prompt, the resume brief and `~/.omp/agent/config.yml`.
  - `rg -l -F` over `~/.omp/agent/sessions` (28.6 s).
  - Node parse of the tails of `TabiR22.jsonl` and `TabiR22-2.jsonl`.
  - `cat`/`rg` of the wave-slot ledger.
- **Exit 1:** two Node one-liners of my own failed on `undefined` property access (my script bugs, not lane faults). Both were rerun corrected with exit 0.

Not run: lane scripts, measure/selftest, validator, `record`. I installed no tools.
