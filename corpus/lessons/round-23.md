# Round23 — the six routed defects, made mechanical (C1), and one frontier entry re-grounded (C2)

Round 23, hyaku run 6, attempt 1. Baseline `a89f1935f523a64b00991d792fca6a8c0d321948`
(round-22 tip incl. the non-author spot-check). Two claims, frozen before data in
`.ufo/waves/round-23/claims.json`:

- **C1 — operability (lowest non-retired tie at 8), capability acquisition.**
  `scripts/round-evidence-audit.mjs` derives six defect classes from a round's committed
  wave bytes, reproducing the six defects the round-22 non-author spot-check routed.
  Target: 0 → 6 classes on round-22 evidence.
- **C2 — coverage.** One shokuknow staged entry (the CSRF defence-shape boundary, the corpus
  frontier's "CSRF-checked submits untested by rule") admitted only after this lane re-opened
  every source itself, with the two rows it cites appended. Target: 0 → 1 admitted entry
  citing a row first opened this round. Documented-upstream only.

## Gate

Counting commands, run 2026-10-25 from the lane root:

```sh
node scripts/round-evidence-audit.mjs --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --round-cap 128 --json
node scripts/round-evidence-audit.mjs --rev 5f585773258b33d2d514b00cd0b0775333578db6 --round 21 --round-cap 128 --json
node scripts/round-evidence-audit.mjs --selftest
git grep -lE '^source: S10[23] ' a89f1935f523a64b00991d792fca6a8c0d321948 -- corpus/knowledge | wc -l
```

C1: round-22 → exit **1**, `findingClasses` = six
(`c1-refusal-arithmetic`, `c2-wave-caps`, `c3-gate-spotcheck`, `c4-stale-attempts`,
`c5-registry-identities`, `c6-landed-log-binding`), 7 findings, per-class
1/1/1/1/1/2. Before-arm: the instrument does not exist at the baseline revision
(`git cat-file -e a89f1935:scripts/round-evidence-audit.mjs` → exit **128**) → 0 classes are
mechanically detectable. Non-vacuity has two arms, both on round-22 bytes: `--selftest` →
12 cases / 12 passed / inventory 6 red + 6 green, exit 0; and
`--selftest --rev <rev> --round 22 --round-cap 128` → baseline 7 findings / 6 classes with
**6/6 repairs**, each repair removing exactly its own class. The skip-work control
(`.ufo/waves/round-23/fixtures/skipwork-control.mjs`) reaches 6 on round-22 evidence **but
also 6 on a clean fixture**, so it is refused (`skipwork-receipt.json`). Round-21 evidence is
**not** a zero-control: it trips `c3-gate-spotcheck` — exit 1, 1 finding — which is a true
positive (its Gate records no spot-check result and says no "owed to closure"); the declared
control text was corrected on record in `claims.json` `revisions[2]` rather than by widening
the predicate.

C2: baseline 0 → 1 (`git grep -lE '^source: S10[23] ' … -- corpus/knowledge` lists
`corpus/knowledge/csrf-defense-shape-boundary.md`), and
`git diff --diff-filter=A --name-only a89f1935 <checkpoint> -- corpus/knowledge` names exactly
that one added file. Registry rows 101 → 103. Measured at the checkpoint
`03c1b4d9a9ea7719ff4a13a63989fa9be36229c3` — the commit that carries the auditor, the entry
and both rows — and re-run after the disposition commit; the receipt is
`corpus/evidence/round-23/c1-measurements.json`.

Sourced claim (this round's rows, opened this round): **S102** —
`https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt`, accessed 2026-10-25,
146976 bytes, sha256 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`;
located §8.8.1 line 2815: “"SameSite" cookies offer a robust defense against CSRF attack
when deployed in strict mode, and when supported by the client” (20 words). **S103** —
`https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html`,
accessed 2026-10-25, 157809 bytes, sha256
`6f32bfbf96bda9fc4bccfad8edf6d3ff09559b4b12bb869f9f425051c4872312`; located under
§"Employing Custom Request Headers for AJAX/API": “A user-friendly defense that is
particularly well suited for AJAX or API endpoints is the use of a custom request header”
(21 words). Both rows' `opened` date is this round's; S102 `recheck` is `on-release` (a draft
changes only by revision; -13 has `Expires: 18 May 2024`), S103 `90d` (rolling sheet). The
staged package proposed `180d` for both — changed old→new for S102 (180d→on-release) and
S103 (180d→90d) because a spec draft and a rolling wiki page age differently; reason
recorded here per CORPUS rule 2.

Id map, **by document, never arithmetic** (CORPUS.md `## Shape` rule 1: the id is the next
unused, assigned after the source is opened):

| staged id | document | lane id |
|---|---|---|
| S145 | draft-ietf-httpbis-rfc6265bis-13 | **S102** |
| S146 | OWASP CSRF Prevention Cheat Sheet | **S103** |

Staged `S102`/`S103` are *different documents* (CDP contribution README, `chrome.debugger`
reference) and were not adopted. The map is documentary, not positional: the staged
`source`-cell URLs are byte-equal to the lane rows, and the arithmetic coincidence
(`lane = staged − 43`) is killed by a point the lane did not adopt — staged `S147` would
predict lane `S104`, and `corpus/SOURCES.md` has no `cloudflare-1xxx-errors/error-1015` row. Collision guard run before the append: 0–3-space extractor
→ `reg_ids=101 staged_ids=148 collisions=0`; the false-green was proven on an indented
scratch fixture (`collisions=S002` long-pattern vs empty column-zero-only) —
`.ufo/waves/round-23/scratch/ExecCollisionGuard/`.

Sources census before → after (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh
validate --root /home/vgpnk/Projects/shokunin tabi`): round start exit **0**, 101 rows
(A88/B4/C9, mined 73, queued 19, rejected 9), 16 `W04` duplicate-URL warnings; round end
exit **0**, 103 rows (A89/B5/C9, mined 75), the same 16 `W04` warnings. Rows added by tier:
1×A, 1×B. Rows touched: none in place — two new rows only.

**Spot-check result (closing round-22 routed defect 3).** The round-22 non-author
spot-check is now on record and is cited here rather than deferred:
`corpus/lessons/round-22-verifier-spotcheck.md` (hyaku closure, reviewer `@m_flash`,
lane tip reviewed `be271a2`), **5 agree / 0 disagree** on the gate — 1 admit
(`webmcp-lifecycle-oracle-round-22.md`), 3 refusal rulings (S102/S106 `payload-absent`,
S171 `unverifiable`) and the register-input binding — plus **6 routed defects**, all six of
which this round turns into mechanical classes (`## Corrections`). No non-author judgment is
asserted *for round 23*: every round-23 seat is lane-dispatched, so round 23's own closure
remains owed.

## Corrections — round-22 routed defects, append-only

Each names the superseded figure; no filed byte is rewritten.

1. **Refusal arithmetic (23 → 24).** W2 received **24** whole-payload refusals, not 23:
   13 `w2-cap-refusal-*.json` (attempts 1–9, 11–14; attempt 10 has no record — its slot was
   granted 16:10:37Z and the kernel died at 16:10:51Z with 0 seats, note in
   `w2-cap-refusal-11.json`) plus 11 `w2b-cap-refusal-*.json` (attempts 1–11, spawn at 12).
   Superseded: `LOG.md:1584`, `SCORECARD.md:1111`, `corpus/lessons/round-22.md:130` and the
   fleet report's "23". A second committed figure also disagrees — **7** wave files (11
   occurrences) say "14 whole-payload" for W2, whose receipts are 13
   (`git grep -l "14 whole-payload" a89f1935 -- .ufo/waves/round-22 | wc -l` → 7).
2. **Wave and round caps.** W2b was validated at `maxLanes: 65` against the policy's
   `waveMaxLanes: 64`, and the round total was 129 spawned seats against the ≤128 cap
   (`.ufo/waves/round-22/w2b-spec.json`, `-validation.json` — which itself substituted a
   `[64,100]` band — and `w2b-spawn-result.json`). This round: 44 + 44 = 88 seats, both waves
   inside 32–64, and `c2-wave-caps` will not clear a replacement wave above the band.
3. **Gate spot-check row.** Closed above, in this Gate.
4. **Stale-lane per attempt.** Round 22 had three dispatches (2026-10-21T11:47:45-03,
   2026-10-23T20:41:38-03, 2026-10-25T03:23:44-03, per the lane's watchdog launches). Filed
   line graded them all as "none". Grades, per attempt: **attempt 1 progressing**
   (`0f24164`, `e3cf4e0`); **attempt 2 silent** — zero lane commits in its window, from its
   dispatch (2026-10-23T20:41:38-03) to attempt 3's (2026-10-25T03:23:44-03), a **30.7-hour**
   span (`python3` difference of the two stamps); the round's separate
   evidence-to-landing gap is **85.3 h** (last receipt 2026-10-21T17:14:05Z → first landing
   commit 2026-10-25T06:31:37Z); **attempt 3 landed** (`47bfb5f`, `fbee618`, `be271a2`). The
   two spans are different facts and are not interchangeable. The class
   `c4-stale-attempts` now requires a per-attempt grade.
5. **Registry seat identities.** W2b's registry carries 65 members and 65 `agentId: null`, so
   its evidence cannot be tied to its transcripts; `record` never ran (`updatedAt ==
   createdAt`). `record` is the mechanism that supplies the field
   (`ufo-swarm-wave.mjs` member `agentId`, fail-closed on unknown member / invalid id). Round
   23 ran it for both waves — `.ufo/waves/round-23/w1-record.json`, `w2-record.json` — and the
   auditor's `c5-registry-identities` fails a spawned wave whose members are anonymous.
6. **Landed change ↔ LOG entry.** The round-22 landed-changes row citing `47bfb5f` bound a
   change to a commit that touches no `LOG.md` (`git show --name-only --format='' 47bfb5f |
   grep -c '^LOG.md$'` → 0; the entry lands in `fbee618`). This round's rows name the commit
   that carries each LOG entry.

## Mistakes

| # | class | evidence pointer | captured-by | fix (shown able to fail) |
|---|---|---|---|---|
| M1 | a count asserted, never derived | `corpus/lessons/round-22-verifier-spotcheck.md:200-207` (routed defect 1); filed "23" at `LOG.md:1584`, `SCORECARD.md:1111`, `corpus/lessons/round-22.md:130` | PROTOCOL "a numeric claim carries its counting command" — present, and bypassed because the prompt scoped it to measurements, not prose | `c1-refusal-arithmetic`: on round-22 bytes cited 23 / derived 24 → 1 finding; red fixture (cited 1 vs 2 receipts) trips, green (cited 2 vs 2) clears |
| M2 | a cap checked after authorisation | `w2b-spec.json` `maxLanes: 65`; policy `waveMaxLanes: 64`; total 129 | the policy band exists but nothing read it at validation time — the wave's own record substituted `[64,100]` | `c2-wave-caps`: 65 > 64 and 129 > 128 → 1 finding; green fixture at exactly the cap (2+2 = 4 of 4) clears; `--round-cap` is now mandatory (a verdict without it is exit 2) |
| M3 | a change and its LOG entry bound to different commits | `47bfb5f` (0 LOG hunks) vs `fbee618` (1) | round-23 prompt §4's "every change tied to a LOG.md entry and to the commit hash that carries it" — met on the surface (a LOG.md section was named), not in substance | `c6-landed-log-binding`: per-row commit → `LOG.md` membership → 2 findings on round 22; green fixture binds "LOG entry lands in `<hash>`" and clears |
| M4 | a control declared before it was run, and it did not clear | `.ufo/waves/round-23/claims.json` control text vs `node … --round 21 …` first run (2 classes) | claim sizing: a control is a command whose expected result is fixed in advance — the expectation was written as prose ("round-21 must not yield the classes") without the per-class disposition | control restated per class (round-21 is a zero-control only after the auditor accepts `*-task-result.json` receipts and a named non-author deferral in `## Gate`); the first runs' divergence is recorded in `## Waves` and the receipt, not smoothed |

M1–M3 are the round-22 routed defects re-derived as criteria; M4 and M5 are this round's own.
Each fix is a check whose red and green fixtures both run (`--selftest`, 12 cases), except M5,
whose check is the landing command's own file list.

## Waves

Round shape: **two v1 waves** (policy `ufo-wave-policy.json`, band 32–64).

- **W1 (build) 44 seats**, validated `44/44`, roles scout 10 · reviewer 10 · executor 8 ·
  scribe 8 · critic 4 · connector 2 · mutation-tester 1 · sentinel 1. Reports and registry
  under `.ufo/waves/round-23/w1/`.
- **W2 (falsify) 44 seats**, attacking W1's artifacts class by class. Registry
  `.ufo/waves/round-23/w2/swarm-registry.json`, both registries recorded with agentIds.
- Round total **88 seats** (≤128). The canonical planner seat is held by the L1 (the validator
  rejects a `planner` seat); the bounded planning data-walk rode `ConnPlannerWalk`.
- Dead seats: recorded in `## Waves` of the report, with the last error text.
- The wave that built the auditor first declared its control in prose and then measured it;
  the first control run disagreed with the declaration (M4) and the declaration was corrected
  with the divergence on record before any claim value was read.

## Honest bounds

Every seat named above was dispatched by this lane, so all findings are **author-side**; no
non-author agreement exists for round 23 and none is asserted. C1 is a capability on the
lane's *own* evidence, not a fleet gate: it audits tabi round bytes only, reads the fleet
round report and the fleet policy by path (both digests recorded in the output), and writes
nothing. C2 is documented-upstream: no submit carrying any of the three defence shapes has
been executed or captured, no browser ran this round, and no axis score moved — every scalar
stays where round 22 left it. `scripts/check-sources.mjs` matches a row id anywhere in an
entry body, so a clean census is not proof that the entry's `source:` lines cite the rows; the
first-line binding was checked here by hand and by `git grep -lE '^source: S10[23] '`.

### M5 — seat scratch was committed with the production artifacts (this round's own)

- **Class:** commit hygiene (evidence vs working scratch).
- **Evidence pointer:** `git ls-tree -r HEAD .ufo/waves/round-23/scratch | wc -l` → **868** files,
  23,631,703 B inside the production commit; the on-disk tree is far larger (17,677 files /
  194 MB, including two seat clones with embedded `.git`). Found by wave 2
  (`.ufo/waves/round-23/w2/W2Prune.md`).
- **Captured-by:** the round-23 wave context said "throwaway fixtures under
  `scratch/<YourName>/`", which the seats honoured — the context never said the *landing* must
  exclude them, and the L1 committed the directory wholesale.
- **Fix (shown able to fail):** the disposition commit names every path it carries and excludes
  `scratch/` and `assimilation/validate/` (the mirror is 89/91 files byte-identical to committed
  `corpus/` blobs, and its single differing file would put a second, contradictory `S102`/`S103`
  pair in the repo). A follow-up cleanup commit — the helper is the only writer, so a bulk
  deletion is one commit — removes the 868 scratch blobs; until it lands, the over-commit is
  disclosed here rather than hidden. The check that would have caught it is name-only:
  `git show --name-only --format='' <commit> | grep -c '^\.ufo/waves/round-23/scratch/'` must be 0.
