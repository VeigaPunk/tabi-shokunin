# ScoutRegistry — W1/W2 swarm registries vs spawn results and cap refusals

- Seat: `TabiR22-2.ScoutRegistry-16` (scout, leaf)
- Review revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (all lane artifacts read via `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show <rev>:PATH`)
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` — production, index, jj state, fleet and siblings READ ONLY
- Current-wave (w2b) artifacts referenced below are untracked working files at the same lane root, labelled as such
- No lane script was executed, no VCS write, no browser, no install, no delegation
- Tool citations `scripts/ufo-swarm-wave.mjs:NN` refer to `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (read-only fleet checkout), not to the lane

## Verdict (short)

1. **W1 identities are fully joined**: 64 registry members with non-null agent ids = 64 spawn-result job ids = 64 return seats = 64 event-history seats, roles 64/64 equal, all 64 return `reportSha256` digests still match the files. No defect.
2. **W2 has zero spawned seats**, and the retained evidence supports it — but the *registry* is not that evidence. The 13 refusal records name all 64 seats each, carry `spawnedSeats: 0`, and their `details` contain `results: []` with no `progress`; no `w2` report, returns, outcomes or event history exists. The registry is the tool's pre-`record` plan snapshot, a state also held by a wave that *did* spawn (w2b) — see F5.
3. **Payload sha `070e13cd…` is identical in all 13 refusal files** (and across two dispatcher identities). The swarm tool emits no digest at all; no tested serialization of the retained W2 payload (10 variants), nor of the fully reconstructed w2b payload (96 variants), reproduces either recorded digest. The equality is literal; it is not independently verifiable as a payload digest — see F3.
4. Defects found: **F1** live-wave registry never recorded after its 65-seat spawn (w2b); **F2** “14 whole-payload cap refusals” overstates the recorded refusals by one; **F3** unverifiable payload-digest provenance; **F4** refusal/attempt record schema drift and duplicate records; **F5/F6** two misuse traps (registry as outcome evidence; label checker as identity authentication).

---

## 1. Observed facts — W1 identity chain (revision `e3cf4e0`)

| Artifact | Observed |
|---|---|
| `.ufo/waves/round-22/w1-validation.json:21-30` | 64-member plan registry; every `agentId: null` (pre-spawn state), e.g. `BuildOracle` at line 26 |
| `.ufo/waves/round-22/w1/swarm-registry.json:4-5` | `createdAt 14:50:08.565Z`, `updatedAt 14:50:56.824Z` — two writes, hence a later `record` |
| `w1/swarm-registry.json:7` `members` | 64 members, `agentId = "TabiR22."+<key>` for all 64; roles `{executor:3, connector:3, scribe:3, scout:19, reviewer:24, critic:8, revenger:4}` |
| `.ufo/waves/round-22/w1-spawn-result.json:2` | “Spawned 64 background agents …”; 64 `- \`TabiR22.X\` (job \`TabiR22.X\`)` lines, name == job for all 64, set == registry ids (0 missing / 0 extra) |
| `w1-spawn-result.json` `details.progress` | 64 unique ids, all `status: pending`, matching registry roles (0 mismatches) |
| `.ufo/waves/round-22/w1-record.json:2,5-6,8` | `path` + full registry document; members byte-equal to `w1/swarm-registry.json`; timestamps equal (14:50:08.565 / 14:50:56.824). This is the `record` command's stdout shape (`scripts/ufo-swarm-wave.mjs:1744`) |
| `.ufo/waves/round-22/w1-returns.json:4-6,8` | 64 seats, `taskReturnBarrierObserved: true`, `allActorQuiescenceCertified: false`; 64/64 `reportSha256` still match the current report bytes |
| `.ufo/waves/round-22/w1-event-history.json:13-15` | 64 seats; earliest seat model change `14:50:24.296Z` — after registry creation (14:50:08.565), before `record` (14:50:56.824) |
| `.ufo/waves/round-22/w1-outcomes.json:3-5,16,19` | `freshSeats 64`, `completedStopSnapshots 64`, `deadSeats 0`; `notYetDisposedAtSnapshot: ["TabiR22.ReviewChronology"]`; `allActorQuiescenceCertified false` |

Ordering check: plan persisted 14:50:08 → seats started 14:50:24 → ids recorded 14:50:56. That is exactly the documented lifecycle (`run` persists `agentId: null`, `record` fills them post-spawn — `scripts/ufo-swarm-wave.mjs:54-58`). W1 therefore records 64 spawned seats, not 64 planned ones.

**Acknowledgement vs terminal:** W1 returns are completion notifications over 64 seats with quiescence *not* certified and one seat not yet disposed at snapshot. No artifact in this set claims W1 terminal settlement; `w1-outcomes.json:19` and `w1-returns.json:6` both say `false`. Do not upgrade “64 completed stop snapshots” to “64 certified terminal”.

## 2. Observed facts — W2 (original wave, zero seats)

| Evidence | Observed |
|---|---|
| `.ufo/waves/round-22/w2/swarm-registry.json:3-6` | `wave tabi-r22-w2`, `createdAt == updatedAt == 2026-10-21T15:36:22.221Z` — exactly **one** write |
| `w2/swarm-registry.json:7-…` | 64 members, shape `{kind:"spawn", agentId:null, role, item:null}` (lines 8-12 for `Outcome01`); roles/names equal to `w2-spec.json` items 64/64, 0 mismatches |
| `.ufo/waves/round-22/w2-validation.json:21-…` | embedded registry snapshot is **byte-equal** to the registry file's `members` — the file is unmodified `run` output |
| `.ufo/waves/round-22/w2-validation.json:16-17` | `counts: {spawn: 64, resume: 0, total: 64}` — a **plan** lane count (`scripts/ufo-swarm-wave.mjs:1226` computes it from `spawns.length`; `:1296` mirrors it into the dispatch payload). Not a spawn outcome |
| `.ufo/waves/round-22/w2-spawn-result.json:2` | only `text` + `details`; text begins “Failed to start background task jobs: … Background job limit reached (100)”; no `attempt`, `at`, `taskPayloadSha256`, `spawnedSeats` |
| 13 `w2-cap-refusal-*.json` | every record: all **64 unique** seat names refused, `spawnedSeats: 0`, `details.results: []`, no `progress`, no `async` |
| `w2/` directory (committed tree) | only `swarm-registry.json`; no seat report, no `w2-returns.json`, `w2-outcomes.json`, `w2-event-history.json` anywhere in round-22 |
| `.ufo/waves/round-22/post-crash-repair.json:67` | “no author-side W2 seat ever reviewed 0f24164 (W2 never spawned, cap refusals)” — consistent, no count claimed |

**Conclusion:** zero spawned W2 seats is supported. The registry's single write and null ids are consistent with it, but not sufficient for it (F5).

## 3. Observed facts — the refusal corpus

Recorded attempts and files:

| Attempt | `w2-cap-refusal-NN.json` | second record | `acquire` field | `dispatcher` field |
|---|---|---|---|---|
| 1 | yes (`:2,4,13`) | `w2-spawn-result.json` (byte-equal text, 6777 chars) | no | no |
| 2–9 | yes | `w2-attempt0N-result.json` (byte-equal `result.text`) | no | no |
| 10 | **absent** | absent | absent | absent |
| 11 | yes (`:5,14,16`) | `w2-attempt11-result.json` (wrapper shape, no `spawnedSeats`) | no | `TabiR22-2` (`:4`) |
| 12–14 | yes (`12:4-6,15`) | absent | yes | `TabiR22-2` |

- All 13 records: `taskPayloadSha256` identical `070e13cde98505757ed5c3502e896fae4fdcb51e10a3daa61f13bbc823454bfe`.
- All 13 records: each names all 64 seats exactly once (0 missing, 0 extra against registry keys); none reports a partial start or a started seat.
- Attempt naming: attempt 1 names `TabiR22.Outcome01` (no suffix); attempts 2–9 name `…-2`…`…-9`; attempt 11 (new dispatcher) restarts unsuffixed; 12–14 use `-2`…`-4`. This is a per-session job-name dedupe counter pattern, not a payload change [INFERENCE; the swarm skill forbids rewriting lane names, so the suffix cannot come from a conforming payload].
- Attempt 10 is unrecorded by its own admission: `w2-cap-refusal-11.json:16` — “slot granted 16:10:37Z, kernel died 16:10:51Z before any result; no seat transcripts exist, so 0 seats spent”.
- One *different* cap refusal precedes attempt 1: `.ufo/waves/round-22/w2-capacity-events.json:3-11` — the `wave-slot.sh acquire` **command launch** failed “Background job limit reached (100)”, `spawnedSeats: 0`, “no task payload attempted, split or shrunk”.

## 4. Observed facts — payload digest `070e13cd…`

- Present at the same value in all 13 refusal files (e.g. `w2-cap-refusal-01.json:4`, `-03:4`, `-12:5`), across both dispatchers.
- `scripts/ufo-swarm-wave.mjs` contains **no** hashing code: `grep -nic "hash|digest|payloadsha"` printed `0` (exit 1, no match). The field is author-computed, not tool-emitted.
- Not reproducible from retained bytes. Tested against the W2 payload: `JSON.stringify(taskCall)`, pretty, sorted-key canonical, tasks-only, context-only, `w2-spec.json` items/whole/raw bytes, `w2-validation.json` raw bytes — none equal `070e13cd…`.
- The same negative holds with a *fully rendered* positive control from w2b, where the executed payload is reconstructible: 65 `progress[*].assignment` strings start with the validation task and continue with one identical 980-byte operator-directive tail; over 96 combinations (2 contexts × 4 task sets × 4 serializations × 3 shapes, including full attempted job ids) none equal w2b's `d81e11a1…`.
- Raw file digests are different (`w2-validation.json` `b57c0160…`, `w2-spec.json` `7326e88d…`, `w2-spawn-result.json` `8b39fb89…`).

So: the 13-way equality is real and reproducible as a literal; its meaning as “sha256 of the task payload” is unverified (F3).

## 5. Observed facts — current wave (w2b, untracked)

- `w2b/swarm-registry.json:3-5`: `createdAt == updatedAt == 2026-10-21T16:40:54.992Z`, 65 members, all `agentId: null`; members byte-equal to `w2b-validation.json`'s registry snapshot.
- `w2b-spawn-result.json:2-4,1126`: attempt **12**, `at 2026-10-21T17:14:05.171768+00:00`, same `d81e11a1…` digest, **“Spawned 65 background agents”**, 65 `progress` ids (`TabiR22-2.<name>-12`), `spawnedSeats: null`.
- 11 `w2b-cap-refusal-*.json`, attempts 1–11: **all 11** name all 65 seats exactly once (65 unique, 0 missing), `spawnedSeats: 0`, `details.results: []`. Attempt 11 names `TabiR22-2.RowOutcome01-11`…`MutateLanding-11`. No `w2b-attemptNN-result.json` exists.
- Unlike W2, w2b **does** have an attempt-10 refusal record, so W2's missing attempt 10 is a one-off loss rather than this author's convention.

This wave therefore carries a **positive control the original W2 lacks**: a wave with null-id registry that demonstrably spawned.

---

## 6. Findings

### F1 — LIVE WAVE: w2b registry was never `record`ed after a successful 65-seat spawn

**Class:** actual conformance defect (current wave; untracked, not in `e3cf4e0`).

**Observed:** `w2b/swarm-registry.json:4-5` has one write at 16:40:54.992Z and 65 null ids; the spawn succeeded at 17:14:05 (`w2b-spawn-result.json:2-3`) with 65 returned handles (`details.progress[*].id = TabiR22-2.<name>-12`). The tool preserves `createdAt` and sets `updatedAt = now` on **every** write (`scripts/ufo-swarm-wave.mjs:616-624` `buildRegistryDoc`), and `record` fills `entry.agentId` then rewrites (`:1732`, `:1744`). One write ⇒ no `record` after spawn. The swarm skill requires it: “`record --registry <path> --assignments <json>` fills in agent ids once the task call returns them” (`skill://swarm`, “Validate, then dispatch exactly once”, step 1; step 2 “Feed the returned agent ids to `record --assignments`”).

**Counterexample:** at 17:14:05 the wave has 65 live handles; at 17:14:06 the registry still says `agentId: null` for all 65. Any later wave that tries to resume one of these members must refuse `resume_unknown_member` (tool header `:59-60`), because the ownership authority never learned the handles.

**Preserving positive:** W1 did record — `w1-record.json` is the record command's stdout (`{path, …registryDoc}`), its members equal the registry byte-for-byte, and `updatedAt` moved to 14:50:56 after seats started at 14:50:24.

**Smallest fix:** write `{name → id}` from the 65 `progress` entries and run
`node scripts/ufo-swarm-wave.mjs record --registry .ufo/waves/round-22/w2b/swarm-registry.json --assignments <json>`
(one `record` call; do not hand-edit the file). Then cite `updatedAt` as the record time. Until then, the w2b registry must not be used as a resume authority and should be described as a plan.

**Note (not a defect):** `item: null` for every member is expected for prompt-only specs — the tool copies `lane.item` (`:1121`), and these specs carry `prompt`, not `item`. Do not report null `item` as data loss.

### F2 — “14 whole-payload cap refusals” is one more than the record supports

**Class:** claim-accuracy defect (current wave’s own briefing text; untracked).

**Observed:** 13 payload-refusal records exist (attempts 1–9, 11–14). Attempt 10 has no record and was not a refusal: the slot was **granted** at 16:10:37Z and the kernel died at 16:10:51Z before any result (`w2-cap-refusal-11.json:16`). The only other cap-layer event is a *slot-acquire command launch* refusal at 15:38:07 (`w2-capacity-events.json:3-11`), a different class from a whole-payload refusal.

**Counterexample:** `ls .ufo/waves/round-22/w2-cap-refusal-*.json | wc -l` → 13, while `w2b-spec.json:3` and `w2b-validation.json:427` say “14 whole-payload cap refusals”.

**Preserving positive:** the “0 seats” half of the claim is fully supported (13/13 `spawnedSeats: 0`, `details.results: []`, no w2 reports/returns/outcomes).

**Smallest fix:** state “14 dispatch attempts: 13 recorded whole-payload cap refusals (attempts 1–9, 11–14; each names all 64 seats), attempt 10 lost to a kernel death with a granted slot and no result; 0 seats.” Keep “0 seats” as is.

### F3 — `taskPayloadSha256` has no retained preimage and is not a tool field

**Class:** provenance/verification gap (committed refusal files; no false statement found, but an unearned-evidence risk).

**Observed:** identical value in all 13 files; `scripts/ufo-swarm-wave.mjs` has zero hash/digest code (grep count 0, exit 1); no tested serialization of the retained W2 payload — nor of the fully reconstructed w2b payload with exact attempted ids — reproduces either recorded digest (96 w2b variants, 10 W2 variants; §4).

**Counterexample:** the digest cannot distinguish “same args unchanged” from “same literal copied into 13 records”. The `reason` text in `w2-cap-refusal-02.json` (“same args unchanged”) is therefore an author assertion, not a byte-identity proof.

**Preserving positive:** payload stability is independently corroborated: every record names the same 64 seats with no split/shrink; the job-name suffix pattern is a harness dedupe counter (attempt 1 unsuffixed, `-2..-9`, reset at the new dispatcher, then `-2..-4`), and w2b shows the same base digest alongside a successful spawn whose ids carry `-12`.

**Smallest fix:** either (a) define the preimage in the record (e.g. `taskPayloadSha256 = sha256(JSON.stringify({context,tasks}) as passed to task)`) and retain the exact payload bytes next to the first refusal, or (b) rename the field to `authorPayloadLabel` / drop it and keep the seat-list + `spawnedSeats` evidence. Do not cite equality of this field as independent proof of unchanged args.

### F4 — Refusal/attempt records have five different field sets and duplicate each other

**Class:** audit-trail defect (committed artifacts, immutable at this revision).

**Observed field sets:** 01 `{attempt, at, sha, result, spawnedSeats, reason, retry}`; 02 adds `reason`; 03–09 `{attempt, at, sha, result, spawnedSeats}`; 11 adds `dispatcher`, `reason`, `note`; 12–14 add `dispatcher`, `acquire`. Duplication: attempt 1 exists as both `w2-spawn-result.json` (raw, no `spawnedSeats`) and `w2-cap-refusal-01.json`, with byte-equal text (6777 chars); attempts 2–9 and 11 exist as both raw `w2-attemptNN-result.json` and refusal records (text byte-equal for 2–9; attempt 11’s file is the wrapper shape and lacks `spawnedSeats`); attempts 12–14 exist only as refusals; attempt 10 exists only as prose.

**Counterexample:** `w2-attempt*-result.json` gives 9 files and `w2-spawn-result.json` adds a tenth raw record; `w2-cap-refusal-*.json` gives 13; counting both yields 23 records for 13 observed refusals (14 attempts), while attempt 10 has zero records.

**Preserving positive:** every refusal record is individually sound (64 names, 0 seats, empty `results`); no contradiction between duplicates.

**Smallest fix:** one canonical per-attempt record `{attempt, at, dispatcher, acquire, taskPayloadSha256, spawnedSeats: 0, result{text, details}, note?}`; keep raw tool outputs under `raw/` or omit them; add attempt 10 as an explicit `{attempt:10, unrecorded:true, slot:"granted 16:10:37Z", kernelDied:"16:10:51Z", spawnedSeats:0}` row sourced from `w2-cap-refusal-11.json:16`. This is a post-w2b correction, not an edit to `e3cf4e0`.

### F5 — The W2 registry is a plan, not outcome evidence; null ids do not prove zero seats

**Class:** misuse trap (no false claim found in committed text; the risk is in how the registry is cited).

**Observed:** `kind:"spawn"` + `agentId:null` is exactly the tool’s documented pre-`record` state (`scripts/ufo-swarm-wave.mjs:54-58`, member literal `:1121`). W1’s validation snapshot shows the same 64 nulls before `record`; W2’s registry equals that snapshot and was written once; w2b’s registry also holds 65 nulls **after** a successful spawn (F1). Therefore “registry has null ids” is not evidence of “spawned zero”.

**Counterexample:** if the registry were offered as the proof of zero W2 seats, the same shape in w2b (a 65-seat success) refutes it.

**Preserving positive:** the sound 0-seat evidence exists and is stronger: 13/13 refusals name all 64 seats with `spawnedSeats: 0` and `details.results: []` / no `progress`; the `w2/` report dir contains no seat report; no `w2-returns.json`, `w2-outcomes.json`, or `w2-event-history.json` exists. Conversely, W2’s registry cannot be cited as 64 spawned seats, and `w2-validation.json:17 counts.spawn: 64` is a plan count.

**Smallest fix:** in any summary, write “W2: 64 planned, 0 spawned — refusals 1–9, 11–14; registry remains at pre-record plan state (single write 15:36:22Z); no returns/outcomes/event history.” Do not use registry ids or `counts.spawn` as outcome fields.

### F6 — `dispatch-label-check.json` `pass: true` is a tautological label derivation, not identity authentication

**Class:** misuse trap (W1-only artifact; correct as a label-map check, wrong as attestation).

**Observed:** `dispatch-label-check.json:4-69,70` maps every registry key to `"TabiR22."+key` and passes; the registry’s `agentId` is by construction the same string for all 64, and the check contains no spawn/terminal evidence fields.

**Counterexample:** the checker would pass for a registry written entirely by hand from the 64 spec names, with no seat ever spawned.

**Preserving positive:** W1’s identities are independently joined by three artifacts that the label checker does not touch: spawn-result job ids (`w1-spawn-result.json:2`), return seats (`w1-returns.json:8`, 64/64 report digests matching), and event-history seats (`w1-event-history.json`, 64 ids). Cite those, not the label checker.

**Smallest fix:** none required in code; in prose, describe `dispatch-label-check.json` as “64 labels derive consistently from the registry keys” and never as “identities authenticated”.

---

## 7. Observations vs inferences vs unknowns

**Observed (exercised):** all counts, set joins, hashes, timestamps, field inventories and line citations above.

**Inference:** (a) the `-N` job-name suffix is the harness dedupe counter, not payload content — supported by the unsuffixed first attempt, the reset under a new dispatcher prefix, and the skill’s “tasks as-is” rule; (b) W1’s ids were written by `record` rather than a hand edit — supported by `w1-record.json` being exactly `record`’s stdout shape and by the `updatedAt` move after seat start.

**Unknown / not claimed:** (a) the preimage and computation of `taskPayloadSha256`; (b) whether attempt 10 ever submitted a payload (no result, no transcript; only the `-11` note); (c) whether any W2 seat process started and died before registration — no such transcript or return exists, so “0 seats” rests on the refusal records plus absence; (d) whether w2b’s `record` step is merely pending rather than skipped — at the time of reading the file it had not happened.

## 8. Checks not run (honest)

- No lane script, oracle, selftest, checker or wave tool was executed — static review only, per bounds.
- No attempt was made to re-dispatch or reproduce a cap refusal; the 100-job cap is an environment fact, not re-exercised.
- `history://` / `proc://` were not used to look for W2 seat transcripts; the finding relies on the lane's own committed artifacts and the empty `w2/` report dir.
- One broad `grep -rn taskPayloadSha256` over the whole fleet hit the 300 s timeout; it was replaced with targeted searches (its partial output confirmed the w2b digest family). Not used as evidence.

## 9. Commands exercised (exit codes)

- `git -C … rev-parse HEAD` → 0; `git cat-file -t e3cf4e0…` → 0 (“commit”).
- `git ls-tree -r --name-only e3cf4e0… -- .ufo/waves/round-22` → 0 (enumerated 100+ artifacts; no `w2b*` entries).
- `git cat-file -e e3cf4e0…:.ufo/waves/round-22/{w2-spawn-result,w2-cap-refusal-11,w2-attempt11-result}.json` → 0 each.
- Node (v24.21.0) JSON/set/digest joins over `w1|w2` registries/specs/validation/spawn-result/returns/outcomes/event-history, refusal corpus, w2b records → 0 (each script; one intermediate script exited 1 on a wrong field path, corrected and re-run → 0).
- `grep -nic "hash|digest|payloadsha" scripts/ufo-swarm-wave.mjs` → printed `0`, exit 1 (no match; the negative is the evidence).
- `stat -c "%a %n"` on the three registries → 0 (all 600).
- Broad fleet grep for `taskPayloadSha256` → timed out at 300 s (noted above).

## 10. Tooling

No install or upgrade was performed (none needed). Pacman untouched per the host-wide pause.

## 11. Smallest-fix summary

1. Run `record` for the w2b registry (65 assignments from `w2b-spawn-result.json` `details.progress`) — F1.
2. Correct the count wording to 13 recorded refusals / 14 attempts / attempt 10 unrecorded — F2.
3. Define or drop `taskPayloadSha256`, retaining exact payload bytes — F3.
4. Normalize the per-attempt record schema and remove duplicate raw attempt files; add an explicit attempt-10 row — F4.
5. Stop deriving outcomes from the registry or `counts.spawn`; cite refusals + absence — F5.
6. Describe `dispatch-label-check.json` as a label derivation only — F6.

Report: .ufo/waves/round-22/w2b/ScoutRegistry.md
