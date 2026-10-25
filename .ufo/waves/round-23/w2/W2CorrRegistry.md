# W2CorrRegistry — routed defect 5 (registry seat identities), round 23

**Verdict: CLOSED for the routed predicate.** Both spawned waves carry 44/44 non-null
`agentId`, both `record` receipts exist and agree with their registries byte-for-byte; round 23
has 0 anonymous members against 64/65 at round-22. One evidence defect sits beside the closure:
`w2-spawn-result.json` enumerates wave 1's ids, so wave 2's ids are carried by the record receipt
only, never by its own spawn receipt.

## Measured

1. **Null counts.** `node -e` over `w1/swarm-registry.json` and `w2/swarm-registry.json`:
   w1 members=44, null=0, empty=0, nonString=0, grammarFail=0, `agentId !== "L1Tabi23."+name`=0;
   w2 identical (44/0/0/0/0/0); 88 ids total, 88 unique, 0 cross-wave duplicates.
   sha256 w1 registry `369ff74fe5c2aabbe58a892fb64c39b848fa24e0c6c51b646d141ca99efe16c2`,
   w2 registry `83c735004cd8519c364930ac650584a6b4555cc332c13ac387ff6ec7df868bf5`.
   Only two wave dirs exist (`ls -d .ufo/waves/round-23/w*`) and both are spawn waves
   (`w{1,2}-dispatch.json counts={"spawn":44,"resume":0,"total":44}`).
2. **Record receipts exist.** `stat`: `w1-record.json` 6494 B (sha `b4308cb6…`),
   `w2-record.json` 6188 B (sha `b3d5a43e…`); `w1-record.err`/`w2-record.err` both 0 B.
   Each parses to 44 members, 0 null `agentId`, same member set and same ids as its registry;
   `JSON.stringify(record \ {path}) === JSON.stringify(registry)` → `true`/`true`;
   `updatedAt` ties to 07:20:08.307Z / 07:26:10.821Z (the wave `spawn-result.at`).
3. **Ids are real handles, not invented.** `history://L1Tabi23.W2Misroot` → running;
   `history://L1Tabi23.W2FinalArms` → running; `history://L1Tabi23.D5RegistryIds` → parked;
   live roster carries `L1Tabi23.W2QuoteB`, `.W2SHONEN`, `.W2Log`, `.W2Cls4`.
4. **Round-22 is the material.** `git show a89f1935f523a64b00991d792fca6a8c0d321948:…/round-22/w2b/swarm-registry.json`
   → 65 members, 65 null; `…/round-22/w2/…` → 64 members, 64 null (unspawned wave);
   `…/round-22/w1/…` → 64 members, 0 null.
5. **c5 predicate replayed on round-23 bytes** (spawn marker + anonymous-member filter, as
   `scripts/round-evidence-audit.mjs:223-244,369-388`): w1 spawned=44 anonymous=0 → no fire;
   w2 spawned=44 anonymous=0 → no fire. Same predicate on round-22: w2b spawned=65 anonymous=65
   → fires; w2 spawned=0 → skipped by the `spawned <= 0` guard.

## Finding (medium, evidence) — the w2 spawn receipt lists wave 1

`node -e` over `.ufo/waves/round-23/w2-spawn-result.json`: 45 lines; header "Spawned 44
background agents using reviewer, critic, mutation-tester, sentinel, revenger, simplifier,
scout" — exactly w2's role set (`w2-spec.json` roles: critic,mutation-tester,revenger,reviewer,
scout,sentinel,simplifier; w1's adds connector/executor/scribe and lacks revenger/simplifier) —
followed by 44 bullets whose ids are all wave 1 (`L1Tabi23.D1RefusalArith` …
`L1Tabi23.SentinelRoundSafety`). Regex `W2` over that file → 0 matches; set difference against
the w2 registry: 44 ids in receipt not in registry, 44 in registry not in receipt. The w1
receipt matches its registry exactly (0 differences, 88 id mentions = 44 unique). Timestamps run
in the right order (registry 07:23:52 → spawn 07:25:54 → record 07:26:10), so this is a
mis-composed tool-result text, not a registry written before its spawn.

**Why the auditor cannot see it:** c5 extracts `Spawned (\d+)` (`SPAWN_MARKER`, line 47) and
tests each member for a truthy `agentId`; it never compares the receipt's id list to the
registry's. A registry filled from any source clears c5. That is a residual hole in the class
being closed, not a failure of defect-5 closure as routed (null ids).

## Residual

- `item` is null in 88/88 members although the registry contract persists item text
  (`ufo-swarm-wave.mjs:1234` `item: lane.item`, `:1275`); both specs supply `prompt` only
  (`item0keys=name,role,prompt`), so the id→item binding is still absent.
- `ls .ufo/waves/round-23/w2` → only `swarm-registry.json`; wave-2 reports are not written yet
  (seats live). Record receipt, not report presence, is the identity evidence.
- The CLI auditor refuses a round without `--round-cap` (fail-closed), and audits revisions, not
  the working tree; the round-23 numbers above come from replaying its exact predicate, not
  from `--round 23`.

No tracked-file edits, no git/jj writes, no spawns, no seat messages. No tool installs.
