# W2Simplifier — dead weight in `scripts/round-evidence-audit.mjs` (round 23, wave 2)

**Verdict:** 11 deletion groups (~14 dead constructs) are safe: applied to a copy, they keep `--selftest` at **12/12** and the evidence-repair matrix at **6/6**, and reproduce round-22's 6 classes / 7 findings with identical detail text. Two reachability defects are worth fixing beyond deletion (c2/c5 blind to 9 committed rounds; the tighten-only guard cannot fire), and `--json` cannot change any verdict.

## Pinned bytes (the file moved six times under this seat)
- Attacked at `sha256 978dfc49…` (**1070 lines**). While reading it went 938 → 954 → 1008 → 1012 → 1034 → 1070 lines (author-side, uncommitted). Every line ref below is at 978dfc49; every deletion is text-anchored.
- Verified variant: `.ufo/waves/round-23/scratch/W2Simplifier/simplified-3.mjs` (1031 lines), copied from `e88a078e…` (1034 lines) and edited only there. All 11 anchors are byte-identical at 978dfc49, so the recipe applies forward; the 36 lines added since are a c6 `unresolvable cited commit` branch plus `topFiles`, neither of which the batch touches.

## Deletions applied in the variant (all green)
1. `refused` field — six writers (273,274,275,279,281,283,284), zero readers.
2. Unnumbered-refusal fallback `refusalPath` (268) + numeric-only listing regex (277) → one `[^/]*` regex; committed instances of that shape: 0.
3. `gradedAttempts` triple `{count, ids, lt2}` (234) → the ids array only; `count`/`lt2` unread.
4. `receiptPolicy` + its extra `-validation.json` read (356–357) — reaches `findings[].evidence` but no criterion reads it.
5. `if (band)` wrapper (363) — the band is guaranteed by `resolvePolicy`.
6. `band === null` finding (380) — unreachable, and it is the only c2 path a bandless policy could take.
7. c5 `names.length === 0` problem (465) — subsumed: `spawnedWaves` only holds `spawned > 0`, so `names.length < wave.spawned` (469) always fires for an empty registry.
8. c5 `names.length &&` (467) — tautology; empty ids make both sides 0.
9. c6 `HASHLIKE.test(h) && … && !/^\d+$/` (488–489) — both implied by `/[a-f]/` and by the `\b[0-9a-f]{7,40}\b` match regex.
10. Duplicate `FLEET_POLICIES.includes` gate (954, 996) → one `resolvePolicyPath(values)` helper.
11. c4 double `gradedAttempts(...)` evaluation (418, 422) → one `const joined`.

## Green evidence (command → result)
- `node .ufo/…/scratch/W2Simplifier/verify-current.mjs <variant>` → `INMEMORY 12 12`, `EVIDENCE 6 6 baseline 7`, `runs-equal true` for both matrices, `inventoryOk true`.
- Same harness, audit parity: round-22 `7 findings / 6 classes / detail-equal true`, round-21 `1/1 true`, round-16 `4/4 true`.
- Same harness, CLI: `--help` exit 0, `--selftest` exit 0, `--policy /etc/hostname` exit 2 with the fleet-file refusal — identical in original and variant.
- Fixture carrying an unnumbered `<stem>-cap-refusal.json`: original and variant emit the same single c3 finding (verdict-neutral adapter swap).
- Baseline for comparison: `node scripts/round-evidence-audit.mjs --rev a89f1935… --round 22 --round-cap 128 --json` → 6 classes, 7 findings, exit 1 (both trees).

## Reachability the ticket asked about
- **Tighten-only branch (938–944) cannot fire.** `--policy` is restricted to `FLEET_POLICIES` (954/996) *before* the widen check; whichever of the two files is supplied is itself in `authorities` with the same band, so `!authorities.some(… === band.waveMaxLanes)` is false, and `widest ≥ band` anyway. Dynamic proof: a widened policy is refused earlier — `--policy /etc/hostname` → exit 2 “must name one of the fleet authority files”; the widen message never prints. It is a second lock over a gate that already closed.
- **Class no committed round can exercise: c2 on 9 of the 12 report-bearing rounds.** Spec discovery is top-level only (330 `topFiles` + `/-spec\.json$/`), but rounds 12–20 name their waves `w1/spec.json`. Round 16: `git show a89f…:.ufo/waves/round-16/w1/spec.json` → `maxLanes=100` (> band 64) and `git ls-tree -r --name-only a89f… -- .ufo/waves/round-16 | grep -c spawn-result` → 0, yet `… --round 16 --round-cap 128 --json` → only c3+c6. The same 65-vs-64 shape c2 flags on round-22's `w2b` passes silently in 16/17/19. c5 shares the gate (437), so seat identity there is equally unauditable.
- `--json` (parsed 894) has no consumer and no branch: output is JSON unconditionally. It cannot change a verdict or the exit code; deleting it would break C1's frozen countingCommand, so it is retained weight, not a deletion.
- c3 `gate-absent` (391) fires on zero committed rounds (each `corpus/lessons/round-N.md` for 1–22 carries `## Gate`); `lesson-absent` (389) fires on zero *auditable* rounds — round-11 has no lesson but also no `tabi.md`, so the CLI refuses exit 2 first.

## Retained deliberately (not dead weight)
- `audit()`'s `roundCap` guard (290) duplicates `main()`'s, but it is the exported entry point's only fail-closed check; deleting it lets an importer get a clean verdict from `roundTotal > NaN`.
- Nested `<stem>/spawn-result.json` adapter (266): 0 committed instances and no producer found in `/home/vgpnk/Projects/shokunin/scripts`; kept because deleting it flips a future wave shape from “counted” to “unaccounted” (still a c2 finding, so no false green — a judgement call, not a correctness one).
- `gitCtx.read`'s blob-type + sha1 re-verification and `filesOfCommit`'s `HASHLIKE` guard: cheap, and they are the reason a hostile rev cannot smuggle non-blob bytes.

## Tradeoff
Deleting the `band === null` finding moves an impossible state from “reported” to “unreported”: `resolvePolicy` is now the only place that refuses a bandless policy — acceptable because it is the sole constructor of the `policy` value in both CLI branches, and `fixtureCtx` cases always supply a band. Deleting `receiptPolicy` shrinks c2's evidence payload (spec/receipt pointers remain), not its verdict.
