# R89Exec3 — C2 before/after + do-nothing controls reproduction

Seat: R89Exec3. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `5a901163` (5a9011635c3bafb64a59a1411c4036bb40438724), freeze D `7bde5e6c2f2d`. Worktree/scratch removed; nothing left behind. No commits/pushes; read-only git + worktree add/remove only.

Tooling: no installs (node 24 + git + python3 already present; pacman paused per 2026-10-20 ruling). Zero tools added this seat.

## (1) BEFORE — r89 drift gate vs base worktree

```
git -C <lane> worktree add --detach /fast/scratch/hyaku/tabi-r89/R89Exec3/base 5a901163   -> exit 0
node scripts/check-record-drift-r89.mjs --lane /fast/scratch/hyaku/tabi-r89/R89Exec3/base --json
```

- Exit: **1**. claims **4**, mismatches **3** (not the claimed 2).
- `failed`: `["selftest-wording", "gate-selftest", "quality161-sweep"]`.
- details: `scorecard-tallies ok=true "bad=[] tens=2 sanctioned=2 stray=[]"`;
  `selftest-wording ok=false "staleHolds=false d6named=false correctionNamed=false"`;
  `gate-selftest ok=false "mentions=false wired=false counter=false battery=false killpower=false"`;
  `quality161-sweep ok=false "sweeps=true cites=false"`.
- `git -C <worktree> rev-parse --show-toplevel` = worktree path; HEAD `5a90116`. Overflow note: at base `scripts/check-record-drift-r89.mjs` does not exist (added 0791b191); run used live-lane gate bytes against base tree (as claims C2 leg b specifies). Base `check-record-drift-r88.mjs` diff vs r89 shows +Narrowing-7/8 + fixture-seven-tally + `round-89.md` swaps.
- Why 3rd red is expectable: gate-selftest needs `scripts/*round89.mjs` present in the lane tree — all absent at base, so `mentions/wired/counter/battery/killpower` all false. If the intended comparison keeps gate bytes from the live lane only for the two record statements, the before set is exactly `{selftest-wording, quality161-sweep}`; as a strict repo-state run it is 3. Claims C2 leg b ("mismatches 2") needs this reading made explicit.

## (2) C1 do-nothing controls

- r88 receipt under r89 counter:
  ```
  node scripts/check-showpicker-round89.mjs --lane <lane> --receipt corpus/evidence/round88/chromium-showpicker/receipt.json \
    --expect-driver-sha256 76b69b4f... --expect-nonce tabi-r89-l1-7bde5e6c2f2d \
    --expect-fixture-sha256 69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed \
    --prior-set .ufo/waves/round-89/controls/c1/prior-set.txt --json
  ```
  **Exit 1**; verdict `findings`, checkCount 104. Finding ids include `schema` + `plan-frozen` (expected). Live 35 findings vs frozen `controls/c1/nowork-r88-under-r89.json` 34; delta = one extra `prior-set-complete` (detail: names the r89 scored receipt `corpus/evidence/round89/chromium-showpicker/receipt.json` as an unexempted in-tree r89-schema receipt). The frozen control predates the r89 scored receipt landing in-tree; order matches otherwise. Not a kill-rule break — same exit, same schema + plan-frozen membership.
- Nonexistent receipt: **exit 2**, `verdict: "unreadable"`, finding `receipt-unreadable` (`ENOENT ... '/nonexistent.json'`). Matches `controls/c1/noreceipt.txt` exactly. Repro ✓.

## (3) Drift gate `--selftest` + leak fix

```
node scripts/check-record-drift-r89.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --selftest --json
```
- **Exit 0**, `ok: true`, `failed: [scorecard-tallies, selftest-wording, gate-selftest, quality161-sweep]` (all four red on fixture as designed),
  details `tallies: bad=["round-44-no-9","round-44-has-10"] tens=2 sanctioned=1 stray=[2]`,
  `wording: staleHolds=true d6named=false correctionNamed=false`.
- Leak: `ls -d /fast/scratch/hyaku/tabi-r89-driftfix-*` before+after and `/tmp/` = **0** / **0**. Narrowing-7 fix holds. ✓ (out schema `tabi-r89-record-drift-selftest`, exit field 1 = fixture red, process exit 0 = selftest pass.)

## (4) AFTER — live lane

```
node scripts/check-record-drift-r89.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```
- **Exit 1** (not the claimed 0). claims **4**, mismatches **2** (not 0).
- `failed`: `["selftest-wording", "quality161-sweep"]`; `scorecard-tallies` + `gate-selftest` green.
- Root cause (not a gate bug): two record edits have not landed —
  1. `selftest-wording` needs `corpus/lessons/round-89.md` to contain `D6` + the literal `selftest 10/10 at D7`/`D7 wording` correction. File does not exist; the r88 lesson (`corpus/lessons/round-88.md:61-65`) carries the text, but the r89 gate reads `round-89.md`. `staleHolds=false` is correct (no stale phrase in SKILL.md/knowledge/plan87/lesson87).
  2. `quality161-sweep` needs QUALITY §161 to cite `check-record-drift-r89` (`cites=false`; still cites `check-record-drift-r87.mjs` + scope-extended-r88 note).
- Both are lane-record edits outside this seat's bounds (SKILL.md/QUALITY.md/plans/corpus never edited). Kill-rule implication: as-is `mismatches != 0`, so C2 leg a is NOT verified until those two edits land (L1-owned). This also means the claimed "after 0" cannot be obtained from the current checkout without them.

## Frozen pins verified (live)

- `scripts/check-showpicker-round89.mjs` sha256 `33d4b927...` ✓
- `scripts/check-record-drift-r89.mjs` sha256 `c54d5edf...` ✓
- `scripts/selftest-r89-gates.mjs` sha256 `35235eff...` ✓
- Scored receipt fixture sha256 `69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed` ✓ driver `76b69b4f...` nonce `tabi-r89-l1-7bde5e6c2f2d` ✓
- Receipt file sha256 `50571640bdb2eb49fb6af6d3ac70ea879706645ebc08cdd5be90448bdd096723`

## Worktree hygiene

- `/fast/scratch/hyaku/tabi-r89/R89Exec3/base` removed (`worktree remove --force`, exit 0); `git worktree list` clean of it.
- `/fast/scratch/hyaku/tabi-r89/R89Exec3` scratch deleted; no driftfix trees left.

## Verdict for L1

C1 controls reproduce (exit 1 schema/plan-frozen; exit 2 receipt-unreadable). Drift `--selftest` green + leak fix holds. BEFORE is 3 mismatches as a strict base-tree run (2 if gate-bytes are read live-only); AFTER is 2, not 0 — C2 legs a/b are blocked on the two record edits (`round-89.md` correction passage + QUALITY §161 r89 cite), not on calibration logic.
