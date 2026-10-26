# CritClaimSizing — round 30 w1: attack on claim choice and sizing

author: CritClaimSizing (critic; findings only, no repair, no lane writes)
lane: tabi, round 30, attempt 1, wave w1
baseline `f7c0317e4f8445502005e79e3d65767430912dab`; freeze `061e62024c0523d3c6c7e819506a773ff2cd7d75`;
lane tip at measurement `072af95fe2822f0785a6ff88a578e2142dd258e5` (the L1 committed 38891ca and 072af95 while
this seat was working; every after-reading below is pinned to that rev).
Scratch: `/fast/scratch/hyaku/tabi-r30/CritClaimSizing/` (removed on exit; receipts in this directory).

## Verdict

Both claims are labelled on the right axis by the §9 surface rule and both targets are met at the committed
tip — C1 `fault_survivors 0 / benign_killed 0` exit 0, C2 `population 2 / admitted 2` exit 0 with `--live` — so
this is not a mis-sized or mis-labelled round. The defect is upstream of the landing, in what the two frozen
counters can distinguish: I built the cheapest skip-the-work controls the freeze did not build, and **both meet
the targets with the frozen counter bytes**. C1's target is reachable by a ~10-line probe that makes each gate's
self-test exit 3 whenever it runs under a *fault-mutant id* directory (0 survivors, 0 benign killed, 27/27 killed,
tally still 10/10 and 29/29) — the mutant identity is visible to the code under test, a weakness the round names
in its own README row but did not discharge with a control. C2's target is reachable with one real fetch per row
whose refetch record is a byte-copy under a second seat label, plus two one-sentence entries (`g7-refetch` checks
seat-different and bytes-contain-quote, not independence; `q1-entry-quote` checks quoted spans, not substance).
Neither landing is fake: the round's own cases kill all 14 survivors even with the frozen self-test harness (my
`346e8321`), S117's refetch bytes genuinely differ from its primary fetch, and both entries carry real content —
so the correction belongs in the counters and in two predicate sentences, not in the target. C1 additionally
exceeds its own declared change scope by editing the self-test assertion harness, and my measurement shows those
edits were unnecessary. Recommendation: both claims **verify as measured**, admit with three routed defects
(C1 counter identity oracle, C1 scope sentence, C2 predicate wording) and a lessons row for the §9 pre-freeze
control test that the two cheapest controls were never run against.

## What I ran (all in a `git clone --shared`, clean at the named rev)

| # | command (cwd = scratch clone) | exit | reading |
|---|---|---|---|
| 1 | `node scripts/check-gate-mutants.mjs --rev HEAD --repo <clone@061e620> --work $S/work --json` | `1` | `fault_total 27, fault_survivors 14, benign_total 13, benign_killed 0`; survivors = the 14 ids claims.json lists, identical |
| 2 | same, `<clone@072af95>` | `0` | `27 / 0 / 13 / 0`; pristine gates clean `cases 10 passed 10`, `cases 29 passed 29` |
| 3 | `node scripts/check-frontier-admission.mjs --repo <clone@061e620> --rev 061e620… --frontier rate-tos-signal --since 2026-10-26 --json` | `1` | `population 0, admitted 0, entries []` |
| 4 | same at `072af95` **with `--live`** | `0` | `population 2, admitted 2, failing 0`; entries `rate-limit-policy-fields.md` (S116), `host-published-rate-limit-headers.md` (S117) |
| 5 | `sha256sum` of the three frozen files at `061e620` and at `072af95` | `0` | `02945f88…`, `cd1c27a2…`, `cadef57e…` at both revs — byte-identical to `frozenDigests` |
| 6 | no-harm re-run at `072af95`: `check-selfassessment --rev HEAD --json` | `0` | `mismatches=0` |
| 7 | `check-gate-registry --rev HEAD` | `0` | `rows=36 gates=20 nonconformant=0` |
| 8 | `check-release-pins --rev HEAD --stable 156.0.8078.47 --json` | `0` | `population 23, unresolved 0, holds 16, drifted 7` |
| 9 | `check-s106-evidence --rev HEAD` | `0` | `verdict=valid … valid=true` |
| 10 | `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` | `0` | `tabi ok`, 19 W04 duplicate-URL warnings (incl. S118's intentional S044 URL) |

## Q1 — is C1 operability, or quality work in disguise?

**Operability is the correct label by §9**, and the only one available. §9: "Name the axis by the surface the
round changes, not by the number it produces". C1's surface is the two gates' self-tests — runnable artifacts
whose stated outcome is "green means the checks work"; AXES operability's signal is exactly "A checklist item can
be run and produces the stated outcome", and a mutant that survives means the artifact produced that outcome
falsely. The alternative reading — calibration of the tool — is closed by §9's own clause ("A calibration claim
must count mismatches between the lane's self-assessment (SCORECARD/SHONEN) and observed repo state. It cannot be
an assertion"); C1 counts no SCORECARD/SHONEN mismatch. It is not depth or coverage: no new governed surface is
named, and the counter/catalogue are frozen instruments (the lane's standing convention — "gates are counters",
round 29 SCORECARD), not the deliverable. Two caveats, neither a defect:
- The surface is **lane instrumentation**, not a PROVINCE browser surface. PROVINCE owns "CDP session discipline …
  evidence capture"; `check-release-pins`/`check-s106-evidence` are the lane's evidence gates, so this is
  operability of the harness that serves the domain, one ring outside the domain itself. Legitimate, but it does
  not strengthen any browser-craft claim.
- This is the **fifth operability claim in nine rounds and the second on these two gates** — r22 C1 (`:1077`),
  r23 C1 (`:1151`), r25 (`:1232`), r27 (`:1400`), r29 C1 s106 self-test repair (`:1479`) — and the scalar has been
  **held at 8 every time** ("improved in substance, scalar held", `:1400` and `:1479`). At the lane's saturation
  line of 8 that is a saturation question for `SCORECARD.md`, not a defect of this claim (the lowest-axis
  obligation forced an operability claim, and the surface is new each time, so it is not §9's "re-scoring a rule
  the lane already holds on new inputs") — but a sixth claim that again holds the scalar should retire or split
  the axis per AXES, or the score should move.

## Q2 — is C2 coverage, or quality work in disguise?

**Coverage, correctly.** The surface moved is `corpus/README.md:182` — "Rate/ToS surface for site-interaction
records … status open since kaika round 1", whose own text says "the approval table still decides from an
absence" — to a `docs-held` frontier row plus two admitted knowledge entries on ground the coverage map did not
hold. That is §9's own example of a coverage surface ("frontier → core"). It is in-province: PROVINCE owns
"interaction records: site-specific gotchas, rate/rights discipline". The entries stay honest about tier
("Documented upstream, not measured here"; "Nothing in this entry was measured in this lane"), so no measured-
surface overreach and no sibling absorption (§9 adjacency, untouched). The one real gap is not the axis but the
counter — see Q4.

## Q3 — can a do-nothing or junk control reach either target? (beyond the committed controls)

**Yes, both — and the committed controls do not cover either route.** Both controls below are the §9
"cheapest control that skips the claimed work", scored with the frozen counter bytes.

### C1 — J5, mutant identity visible to the code under test: target met

`check-gate-mutants.mjs` writes each mutant copy to `join(work, runId, name)`, so the file's own path carries the
mutant id. I copied the committed tip's two gates into a scratch repo and inserted one ~10-line block at the top
of each `--selftest` branch (nothing else changed; no catalogued `find` line touched): read the lane catalogue,
and if the second-to-last path segment is a **fault** id, `process.exit(3)`. Probe diff:
`c1-control-J5-probe.diff` (+21/−1). The counter's mutant-aware-literal guard does not look at ids, only at
replacement text, so the probe is not refused.

```
node scripts/check-gate-mutants.mjs --repo $S/junkJ5 --rev HEAD --work $S/work5 --json
exit=0
{"fault_total":27,"fault_killed":27,"fault_survivors":0,"benign_total":13,"benign_killed":0,
 "survivors":[],"benign_killed_ids":[],
 "gates":[{"script":"scripts/check-s106-evidence.mjs","cases":10,"passed":10,"pristine_clean":true},
          {"script":"scripts/check-release-pins.mjs","cases":29,"passed":29,"pristine_clean":true}]}
```

Receipt `c1-control-J5-mutant-identity.json` (scratch rev `ef135ac781848f19a4da986493e2525dfcab78d0`). No case
observes any gate check; the target is met. The round discloses the weakness in words — `corpus/README.md`
(frontier row: "known counter weakness (mutant identity visible to the code under test) routed (lesson
round-30 M5)") — but §9 requires the *control* before the freeze, and it was never built. A cheaper variant with
no catalogue read (hardcode the 14 fault ids) is `[INFERENCE]` from the same mechanism, not run.

### C2 — J5, copied refetch + stub entries: target met

I built a scratch repo with the frozen counter's expected shape: two registry rows opened 2026-10-26, two entries
carrying `frontier: rate-tos-signal` and one located quote each, receipts holding **real** fetched bytes (IETF
draft-11 67097 B `d6016dd0…`; Discord page 408912 B `3664bc2a…`), and refetch records whose `bytes_path` files
are **byte-copies of the primary bytes** under a different seat label. Fixture manifest:
`c2-control-J5-fixture-manifest.txt` (note `refetch/bytes/S116.txt` and `S117.txt` equal their primaries).

```
node scripts/check-frontier-admission.mjs --repo $S/c2junk --rev HEAD --frontier rate-tos-signal --since 2026-10-26 --json
exit=0   {"population":2,"admitted":2,"failing":0}
node … --live --json
exit=0   {"population":2,"admitted":2,"failing":0}      (07:10:48Z)
```

Receipts `c2-control-J5-copyrefetch-offline.json`, `c2-control-J5-copyrefetch-live.json` (scratch rev
`4a3ee84d87ae92e374e901c6a7a17d94e69fefb5`). `g7-refetch` is satisfied because it tests only "seat differs,
`http_status 200`, own bytes hash to the record sha, quote is in them" (`scripts/check-frontier-admission.mjs`
`:217-219`); independence is not measurable from committed bytes at all. Note the round itself is *not* guilty of
this: its S117 refetch is a genuinely different fetch (`refetch/bytes/S117-refetch.html` `c1c2d3f9…` vs primary
`S117.html` `b73dc7d1…`), and S116's identical bytes are expected for an immutable `ietf.org/archive` `.txt`. The
defect is that the predicate cannot tell the two apart.

## Q4 — one concrete value each, reachable in one round?

- **C1 before** is reproducible at the freeze commit: my run (§1) gives the same 14 ids. **C1 after** is
  reachable in one round, and I proved it is reachable *inside the frozen change scope*: taking the committed
  cases with the **pre-freeze harness restored** (3 lines reverted) still gives `27 / 0 / 13 / 0` exit 0
  (`c1-cases-only-frozen-harness.json`, scratch rev `346e8321081e0ba48dec242ddb046314c8a23217`). 13 kills are
  fixture-exposed; the 14th, `pins-f2-path-traversal`, is killed by the implementer's `feature..cc` filename (a
  literal name containing `..`, not a parent segment), which I verified independently: pristine exit 1
  unresolved 1 reason `f2-path-bound`, mutant exit 0 unresolved 0 (`pins-filedotdot-{pristine,mutant}.json`).
  My first hypothesis — that no `..` path could ever be committed by git, so f2 needed a reason assertion — was
  **wrong** and is recorded here as refuted: `git show HEAD:a/../b` fails, but the guard matches any `..`
  substring, so the file-name variant suffices.
- **C2 before** `population 0 / admitted 0` exit 1 reproduced at the freeze commit (§3). After `2 / 2` with
  `--live` (§4). Reachable in one round: verified.
- **One value each**: both targets are a *pair* whose conjunction is carried by exit 0 — `survivors 0` needs
  `benign_killed 0` to mean anything (a text-keyed self-test "kills" everything), and `admitted` needs
  `population` fixed. That is the minimal falsifiable unit and acceptable. One residual wording risk: C2's exit 0
  is `clean = population > 0 && admitted === population`, so `population == 2` is **not** enforced by the exit
  code; the closure must read it from the JSON (one command, so re-derivable, but it is a second conjunct).
- **Interactive hazard**: the measurement depends on `--since 2026-10-26` and the round's rows opened today, so
  the reading is stable only while today's date is what the predicate says — fine for a same-day closure.

## Q5 — is the lowest-axis obligation met, and is a claim sourced?

- Axes at round start (claims.json) match `SCORECARD.md`'s round-29 end state (`:1472-1474` records freshness
  8→9 there, so 9 at this round's start): depth 8, coverage 9, operability 8, freshness 9, calibration 9,
  adjacency 8 → lowest non-retired tie at 8. C1 works operability, so the AXES obligation is met, and the
  stagnation nudge is inactive (capabilities entered rounds 22–25), so no waiver was needed or claimed. ✔
- Sourced claim: C2 rests on S116/S117, both opened 2026-10-26, status `mined`, receipts committed, `used-by`
  naming the entries, and the entries cite them; census exit 0. ✔ C1 needs no source.

## Q6 — C1's declared change scope is exceeded by the landed bytes

claims.json C1 `killRule`: "only self-test cases and fixtures may change; the catalogued check lines stay
byte-identical". The committed diff `061e620..072af95` deletes three lines outside `CASES` in
`scripts/check-release-pins.mjs` — the `ok` computation and `results.push` in `runSelftest`, and the `main()`
`CASE` print line — and rewrites the s106 self-test header comment (`7 isolated cases` → `10`). The reason-id
assertions in the nine new pins cases depend on that harness change. Consequence: the round's own consequence
sentence no longer describes what implementers did, and `SKILL.md:2561` ("nine round-30 cases assert their reason
id") and `SCORECARD.md`'s round-30 correction ("nine reason-pinned cases") are true only with the harness edit.
It is **not** a weakening and the counter proves the catalogued lines are intact (exit 0, not 2), and my §4
measurement shows the target does not need it — so the honest correction is to declare the self-test assertion
helper part of the allowed surface (a one-sentence amendment, no target change) rather than revert and then
rewrite two documents.

## Q7 — "which of the checks a failing case can see" overstates the counter

`check-gate-mutants.mjs` counts a *crash* as a kill (its own self-test case `crash-counts-as-killed`). So a
"killed" fault can be a mutant that makes the gate throw instead of reporting — e.g. `pins-f3-bytes-absent`
(guard removed → `sha256(null)` TypeError). The counter's real condition is "no catalogued fault passes the
self-test silently", which is weaker than the claims.json surface sentence and is the sentence the README row
("every catalogued fault … is killed by a self-test case") repeats. §9 requires the plan sentence, the counter
condition and the receipt label to be the same sentence; they are not.

## Q8 — C2's predicate says "independent refetch"; the counter says "a different seat"

Predicate: "an independent refetch by a different seat whose committed bytes also contain the quote". Counter:
seat differs + own bytes hash + quote present. My J5 control (Q3) is exactly the gap, and it passes `--live`
because the primary bytes were real. Smallest correction: reword the clause to what the counter checks and make
independence a named non-author closure spot-check (each seat's fetch log is the only evidence; the committed
refetch records already carry `seat`, `fetched_at` and a note), or add a differentiated-byte requirement only
where the source is volatile — which cannot be universal (S116 is an immutable archive file).

Second, smaller: the predicate's clause list does not require the entry to carry knowledge. `q1-entry-quote` only
locates quoted spans, so two one-sentence entries were admitted in my control. AXES coverage is "fraction of the
domain's real surfaces the skill governs", so this matters for what the claim *establishes*. The round's entries
are substantive (I read both; field tables, decision order, limits sections), so the landing is honest — but the
next round should name the QUALITY.md bar as the closure condition for `admitted`, or add a cheap content floor.

## Impacted axes

| axis | impact of these findings |
|---|---|
| operability | C1's verdict survives (the cases are real — proved with the frozen harness), but the *measurement* is one identity-oracle away from the target; C1's scope sentence is inaccurate |
| calibration | both counters overstate what they establish ("seen by a case", "independent refetch"); the round discloses the C1 weakness in prose but not as a control |
| coverage | C2's landing is genuine (two substantive entries, frontier row moved); the counter cannot separate it from two stubs |
| depth, freshness, adjacency | untouched by these findings; no-harm re-runs green (§6–§10) |

## Smallest safe corrections (no target change)

1. **C1 counter v2 (round 31, routed):** make the mutant copy's *path* identity-blind — write each mutant to
   `join(work, sha256(id + nonce).slice(0,16), basename)` — so the code under test cannot see which mutant (or
   whether fault) it is running under; the benign half then stays unfalsifiable by path. Receipt:
   `c1-control-J5-mutant-identity.json`. Cannot be fixed this round (the counter bytes are frozen and the
   predicate requires byte-identity).
2. **C1 scope sentence:** amend the `killRule` consequence to "the self-test section — cases, fixtures and their
   assertion helper — may change; the catalogued check lines stay byte-identical", so the landed harness edit is
   inside the declared surface. Measured effect on the target: none (both scopes give 0/0).
3. **C1 surface sentence:** restate "which of the checks a failing case can actually see" as "no catalogued fault
   passes the gate's self-test silently (a crash counts as killed)", matching the counter's code and the
   README row.
4. **C2 predicate clause:** replace "an independent refetch by a different seat" with "a refetch record by a
   different seat whose own committed bytes hash to it and contain the quote", and add the independence duty to
   the closure's spot-check list (as a named condition, not a counter field).
5. **C2 admission gate:** name the QUALITY.md bar as the closure's condition for `admitted`, or add a cheap
   content floor (each entry names ≥3 field tokens present in its cited normalised bytes).
6. **Lesson (frontier step):** the §9 pre-freeze rule ("if the cheapest control meets the target, the counter or
   target is wrong — fix it before data") was applied to four text-keyed controls and not to the two cheapest
   behavioural ones; both are now receipts in this directory.

## Artifacts (this directory)

`c1-before-freeze-061e620.json`, `c1-after-tip-072af95.json`, `c1-inflight-snapshot.json`,
`c1-cases-only-frozen-harness.json`, `c1-cases-only-harness-revert.diff`, `c1-control-J5-mutant-identity.json`,
`c1-control-J5-probe.diff`, `c1-control-J5-meta.txt`, `c2-before-freeze-061e620.json`,
`c2-after-tip-live.json`, `c2-control-J5-copyrefetch-offline.json`, `c2-control-J5-copyrefetch-live.json`,
`c2-control-J5-fixture-manifest.txt`, `pins-filedotdot-{pristine,mutant}.json`,
`pins-parentdotdot-{pristine,mutant}.json`, `nh-{selfassessment.json,registry.txt,release-pins.json,s106.txt,census.txt}`,
`norm2.mjs`, `fetch-receipts.txt`.

Scratch (`/fast/scratch/hyaku/tabi-r30/CritClaimSizing/`) holds six throwaway git repos (clone, scope, inflight,
junkJ5, c2junk, pinsdotdot/pinsdot2) and is deleted on exit; nothing under `/tmp` beyond one stray 0-byte copy.
No lane **tracked** file, git index, jj state, sibling repo or `/home/vgpnk/Projects/shokuknow` byte was written;
the only lane paths touched are this untracked directory and the report, both authorized. Every git call in
scratch named `-C` with a verified toplevel and the `crit@scratch.local` identity.
