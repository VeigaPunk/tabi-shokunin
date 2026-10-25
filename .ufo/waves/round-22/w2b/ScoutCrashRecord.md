# ScoutCrashRecord — W2 crash/resume record audit

Item: crash/resume record (`w2-cap-refusal-01..14`, `w2-attempt*-result.json`,
`w2-retry-slots.json`, `post-crash-repair.json`); is attempt 10 honestly recorded as
unknown-but-zero-seats; any gap in the retry chain.

Revision under review: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (HEAD; commit time
`2026-10-21T13:38:27-03:00` = `16:38:27Z`). All W2 crash artifacts are committed in that
revision (`git ls-tree -r --name-only e3cf4e0` shows 9 `w2-attempt*` and 13
`w2-cap-refusal-*` files; `post-crash-repair.json` blob
`7b47555d91bda9ffdccd49e50e5509462f127fc469a80a9f395ae12ed3bdc11d` = worktree). The
`w2b-*` files and `checks-at-e3cf4e0.json` are untracked worktree files, not part of the
reviewed revision; they are cited below only where they carry the wave's summary claim.

Method: static read of the revision's artifacts, plus read-only corroboration from the
host's retained session transcripts and the wave-slot ledger state (external, mutable,
outside the review boundary). No lane script was executed.

## Answer to the named question

**Attempt 10 is honestly recorded as unrecorded/unknown, and 0 seats is the correct
accounting — with one wording overreach and one unretained receipt.**

Committed evidence for the "unknown" part is the free-text note at
`e3cf4e0:.ufo/waves/round-22/w2-cap-refusal-11.json:16`:

> attempt 10 by dead TabiR22 is unrecorded: slot granted 16:10:37Z, kernel died
> 16:10:51Z before any result; no seat transcripts exist, so 0 seats spent

That matches the artifact set: there is no `w2-cap-refusal-10.json` and no
`w2-attempt10-result.json` anywhere in the lane (checked by `find` and by
`git ls-tree -r e3cf4e0`), while attempts 1-9 and 11-14 each have a refusal record. The
accounting consequence is right: the W2 registry was never bound
(`e3cf4e0:.ufo/waves/round-22/w2/swarm-registry.json:4-5` has
`createdAt == updatedAt == 2026-10-21T15:36:22.221Z`, and every `agentId` is `null`),
there is no `w2-record.json` / `w2-spawn-success.json`, no W2 seat report under
`.ufo/waves/round-22/w2/` (only `swarm-registry.json`), and the dead L1 session's
`TabiR22/` seat directory contains exactly the 64 W1 seat names and nothing named
`Outcome*`, `Preserve*`, or `Trace*`. Two plan names are shared with W1 (`CriticClaim`,
`CriticNoHarm`); the files carrying those names under `TabiR22/` are W1 seats with mtimes
`15:02Z`/`15:05Z`, so a name-only check must exclude them by time/content.

Two precision defects remain (F6 below): "0 seats spent" asserts more than is provable
(the dispatched call may have reached the harness and died with the kernel; what is proven
is 0 seat outputs/registrations), and the "slot granted 16:10:37Z" receipt is not retained
in the lane — it existed only as the mutable ledger line `1792599037 64 tabi r22-w2`,
which the successor session read and then deleted via `wave-slot.sh release` (the release
implementation removes every line for that lane/wave).

Corroboration from external runtime state (not committed evidence):
`/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-21T03-31-39-302Z_01a15c83-baa6-76c9-b209-ce1123c6cc22/TabiR22.jsonl:569`
is a `session_exit` with `reason:"sighup"`, `recordedAt:"2026-10-21T16:10:51.361Z"`, whose
pending tool call is the long-running eval cell that wrote attempts 3-20 in a loop
(`for attempt in range(3,21): sleep 180; acquire; status; assert payload hash; await
tool.task(args2); write attempt file; release; append w2-retry-slots.json; write
cap-refusal file`). Line 570 is the `[Kernel died during execution; completion is
uncertain]` result, whose captured cell stdout ends at `backoff before attempt 10` — no
`attempt 10 ...` line was printed, so no attempt-10 result was persisted. The successor's
own check is at
`/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-21T16-10-39-768Z_01a15f3a-9f17-7238-ae23-4fe77ffa6530/TabiR22-2.jsonl:38`
("No such transcripts exist — only the 64 W1 names — so attempt 10 either never ran or was
killed before producing any seats"), and the ledger line `1792599037 64 tabi r22-w2` is in
that same transcript's line 28 (bash output, `16:27:13.233Z`). The committed note is thus
traceable, not invented.

## Record facts (committed revision)

| item | observation |
|---|---|
| attempts | 1-14; 1 = `w2-spawn-result.json` (no `attempt` field; `w2-cap-refusal-01.json:2` supplies attempt 1 with byte-identical result text) |
| refusal records | 13 files: attempts 1-9, 11-14; each result text has exactly 64 `Background job limit reached (100)` clauses and 64 distinct `TabiR22[-2].` seat names; `spawnedSeats: 0` in every file |
| payload identity | `taskPayloadSha256` = `070e13cde98505757ed5c3502e896fae4fdcb51e10a3daa61f13bbc823454bfe` in all 14 digest-bearing records (13 refusals + attempt 11 wrapper); no payload shrink |
| attempt-10 result | absent; only `w2-cap-refusal-11.json:16` |
| attempt-result files | `w2-attempt02..09,11-result.json` only; attempts 12-14 results are inline in `w2-cap-refusal-12..14.json` |
| retry slots | `w2-retry-slots.json` = 7 entries, attempts `[3,4,5,6,7,8,9]` (lines 3,15,27,39,51,63,75); each acquire/check/release exit 0, `seats=64` granted |
| capacity event | `w2-capacity-events.json:9` records the first acquire launch refused by the *100 background-job* limit at the tool-call layer, `spawnedSeats: 0` |
| repair record | `post-crash-repair.json` keys: `addedControls, at, author, defects, diff, discovery, filesAfter, filesBefore, honesty, mutationProbes, reviewedCheckpoint, sandbox, schema, unchanged`; no `crash`/`resume` object |

## Findings

### F1 — "14 whole-payload cap refusals" is one more than the record supports (material)
`w2b-spec.json:3` and `:300` state "W2 never spawned: 14 whole-payload cap refusals, 0
seats" (mirrored at `w2b-validation.json:427`; both untracked). The committed chain
supports **13 recorded refusals + attempt 10 with a lost result** (0 observed seats), not
14 refusals.

- Smallest counterexample: `git ls-tree -r --name-only e3cf4e0 | grep -c 'w2-cap-refusal-'`
  = 13, and the `attempt` fields are `{1..9,11..14}`; no attempt-10 file exists.
- Preserving positive: each of the 13 is a genuine whole-payload refusal — 64 clauses,
  64 distinct seat names, `spawnedSeats: 0`, and the same payload digest (attempt 9 at
  `w2-cap-refusal-09.json` and attempt 11 at `w2-cap-refusal-11.json` both satisfy this);
  the payload digest is unchanged from attempt 1 through 14, so "whole-payload, unchanged
  args" is true for every recorded attempt.
- Smallest fix: reword the seat accounting to "13 recorded whole-payload cap refusals;
  attempt 10 result lost with the kernel (0 observed seats)". Optionally add a
  `w2-attempt10-unknown.json` carrying `{attempt:10, recorded:false, result:"unknown",
  observedSeats:0}` and pointers to `w2-cap-refusal-11.json:16`.

### F2 — The retry-slot chain covers 7 of 14 attempts (material)
`w2-retry-slots.json` has entries only for attempts 3-9. Attempt 1's grant
(`15:40:34Z`), attempt 2's grant (`15:44:34Z`), attempt 10's grant (`16:10:37Z`) and
attempt 11's grant (`16:28:24Z`) are not in it; attempts 12-14 carry their grant strings
only inside `w2-cap-refusal-12..14.json` `.acquire`, and no release is recorded for
11-14.

- Smallest counterexample: `jq 'length, [.[].attempt]' w2-retry-slots.json` → `7,
  [3,4,5,6,7,8,9]`; attempt 10's grant has no lane-artifact receipt at all.
- Cause (observed in the pending cell code, transcript line 569): the loop writes the
  slot record only *after* `await tool.task(args2)` and `release`; a kernel death during
  the spawn await therefore loses that attempt's slot record by construction. Attempt 10
  is exactly that case. The attempt-10 receipt was additionally destroyed on resume:
  `wave-slot.sh release` rewrites the ledger with `awk '!($3==lane && $4==wave)'`, i.e.
  it deletes every line for the lane/wave, so the successor's release at
  transcript line 58 (`16:28:38Z`) removed the `1792599037 64 tabi r22-w2` line it had
  read at line 28.
- Preserving positive: every recorded slot entry is internally consistent — acquire exit
  0, `granted ... seats=64`, status check exit 0 showing its own reservation, release
  exit 0 (e.g. `w2-retry-slots.json` attempt 3 at lines 3-13); the helper's ledger really
  did contain attempt 10's grant (transcript line 28), so the note's timestamp is not
  fabricated.
- Smallest fix: for future waves, pre-register the slot record (write the attempt's
  acquire result before `await tool.task`) so a crash leaves a receipt; for this record,
  append a reconciliation section to `w2-retry-slots.json` listing attempts 1,2,10,11 with
  their receipt locations/sources (transcript grant timestamps; ledger line for 10; inline
  `.acquire` for 12-14) and label them "external/derived" where applicable.

### F3 — The attempt-result naming convention stops at 11, hiding attempts 12-14 from filename checks (minor)
`w2-attempt*-result.json` exists for 02-09 and 11, but attempts 12, 13, 14 have results
only inside `w2-cap-refusal-12..14.json` `.result`.

- Smallest counterexample: `git ls-tree -r --name-only e3cf4e0 | grep -c 'w2-attempt'`
  = 9 while 13 refusals exist; a checker enumerating attempt-result files concludes the
  chain stopped at 11, though attempt 14 is at 16:36:56Z.
- Preserving positive: for attempts 1-9 and 11 the two retention forms are byte-identical
  (`sha256(jq -r .result.text cap-refusal-NN)` == `sha256(jq -r .text attempt-NN-result)`);
  attempts 12-14 do retain a 64-clause result inline.
- Smallest fix: add `w2-attempt12/13/14-result.json` with the same result objects, or add
  an index field to `w2-retry-slots.json` mapping attempt → result location.

### F4 — `post-crash-repair.json` contains no crash or resume record (minor, documentation)
Despite its name, the file records only the oracle repair: `author` at line 4 and a
parenthetical "W2 never spawned, cap refusals" in `honesty` at line 67. It has no crash
coordinates, no attempt-10 status, no slot handoff, and no pointer to
`w2-cap-refusal-11.json:16`.

- Smallest counterexample: `jq keys post-crash-repair.json` lacks `crash`/`resume`; the
  only crash-adjacent text is line 67.
- Preserving positive: the repair evidence itself is complete and verifiable — checkpoint
  `0f24164be77e72ba359fe4befdc42d96bc343034` (line 5), `filesBefore`/`filesAfter` hashes,
  sandbox and mutation-probe receipts, and the committed blob hash matches the worktree
  (`7b47555d...`).
- Smallest fix: add `"crash":{"attempt":10,"result":"unknown","observedSeats":0,
  "evidence":["w2-cap-refusal-11.json:16"]}` and `"resume":{"dispatcher":"TabiR22-2",
  "firstAttempt":11,"releasedStaleSlot":true}`.

### F5 — Dispatcher label differs for the same dispatch (cosmetic)
`w2-attempt11-result.json:4` says `"TabiR22-2 (session-3 replacement)"` while
`w2-cap-refusal-11.json:4` says `"TabiR22-2"` for the same `at`
(`2026-10-21T16:28:27.783022+00:00`) and the same result text.

- Smallest counterexample: the two `dispatcher` values above.
- Preserving positive: `at`, `taskPayloadSha256` and the result text are identical between
  the two records (verified by `sha256` of `.result.text` vs `.text`).
- Smallest fix: use one canonical label in both files.

### F6 — "0 seats spent" overstates the proven fact; the attempt-10 slot receipt is unretained (wording/evidence)
`w2-cap-refusal-11.json:16` says "no seat transcripts exist, so 0 seats spent". What the
evidence proves is: the attempt-10 result was never persisted; no W2 seat transcript or
registry binding exists; therefore 0 observed seats. Whether the `tool.task` call reached
the harness and was refused/spawned before the SIGHUP is not retained (the cell stdout ends
at `backoff before attempt 10`; the attempt-10 write happens after the await).

- Smallest counterexample: change the note to "0 observed seats" and the claim still holds
  under the files; add "the dispatched call's outcome is unknown" and the note remains
  true even if the spawn was reached. The current wording cannot be falsified from the
  artifacts either way, but it asserts the stronger of two indistinguishable states.
- Preserving positive: 0 seats for accounting purposes is correct — the registry was never
  bound (all `agentId` null, `updatedAt == createdAt`), there is no `w2-record.json`, no
  `w2-spawn-success.json`, no W2 `*Outcome*`/`*Preserve*`/`*Trace*` seat file, and no
  W2-era file under the dead session's `TabiR22/`: its newest file is the W1 seat
  `ReviewChronology` at `15:38:56Z`, still before attempt 1 at `15:41:19Z`, and the shared
  names `CriticClaim`/`CriticNoHarm` are W1 (`15:02Z`/`15:05Z`).
- Smallest fix: reword to "result unknown; 0 observed seats (no W2 seat transcripts or
  registry bindings); grant receipt `1792599037 64 tabi r22-w2` (16:10:37Z) not retained
  after release" and, in future, copy the ledger line into the lane record before
  releasing.

## Out of scope / not claimed
- No author-authenticity accusation: the count in F1 is a summary overclaim in the active
  (untracked) wave spec, not a fabricated record; the committed note is traceable to the
  successor's check and the ledger.
- No browser semantics, capability, coverage, promotion, or oracle-equivalence claim was
  audited here; the post-crash repair's oracle correctness is other seats' item.
- The lane's report chronology repairs (W1 wake, W2 chronology) remain unclaimed
  conformance work, as the goal states.

## Unrun checks (honest)
- Did not run `run-checks.py`, `measure-c1.mjs`, `selftest-c1.mjs`, or any lane script.
- Did not re-verify the 35/35 `checks-at-e3cf4e0.json` receipt or the repair's 44/44
  sandbox selftest; not this item.
- Did not determine the kernel's crash cause (the transcript says `sighup`; the `[kernel]
  Python ke...` truncation is the only other signal). A transient disk-full condition was
  observed in this review (`/tmp` write refused with ENOSPC, exit 2); it did not affect the
  reads and is not asserted as the crash cause.
- Session transcripts and the wave-slot ledger are mutable external state, not committed
  evidence; all findings above are anchored in the committed revision, with transcripts
  used only as corroboration.

## Commands exercised (exit codes)
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0:PATH`, `git ls-tree -r`,
  `git log -1` — 0.
- `jq` over `w2-cap-refusal-*.json`, `w2-attempt*-result.json`, `w2-retry-slots.json`,
  `post-crash-repair.json`, `w2-validation.json`, `w2-spec.json` — 0; `jq .items|length`
  = 64.
- `sha256sum` on refusal/attempt text pairs and the repair blob — 0 (all matched).
- `grep`/`find` for attempt 10, W2 seat files, post-crash files — 0 where found, 0 with
  empty output where absent (no `w2-*10*` artifacts, no W2 seat files).
- `ls`/`wc` on the dead and replacement session directories — 0.

Tooling: none installed or upgraded (no pacman, no uv/npm, no binaries). No delegation,
no browser, no REA, no lane/fleet VCS mutation.
