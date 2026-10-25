# Round 23 — `## Mistakes` rows (draft for `corpus/lessons/round-23.md`)

Scope: three rows, one per candidate. Every derived number below was produced by the command printed
beside it, over committed bytes, read-only. Round-22 routed defects are the ground; each row cites the
spot-check's own line and re-derives the figure instead of copying it. `scripts/round-evidence-audit.mjs`
was absent when I checked (`ls scripts/round-evidence-audit.mjs` → No such file, before a sibling seat's
untracked write appeared), so each "fix" is a check spec, exercised here by hand on the bytes it must judge.

## M1 — a refusal count was asserted, never derived

- **Class:** numeric claim without its counting command (`c1-refusal-arithmetic`).
- **Evidence pointer:** `.ufo/reports/round-22/tabi.md:19` (fleet repo, commit `69449ed`: "23 whole-payload"),
  `SCORECARD.md:1111`, `corpus/lessons/round-22.md:130`; routed at
  `corpus/lessons/round-22-verifier-spotcheck.md:200-207`.
- **Derived, not asserted:** `ls .ufo/waves/round-22/w2-cap-refusal-*.json | wc -l` → 13;
  `ls .ufo/waves/round-22/w2b-cap-refusal-*.json | wc -l` → 11;
  `grep -c "Background job limit reached (100)" .ufo/waves/round-22/w2*-cap-refusal-*.json` → `1` for each
  of the 24 files (no other count on any line); per-file seat width
  (`grep -o "Background job limit reached (100)" <file> | wc -l`) → 64 for 13/13 W2 files, 65 for 11/11 W2b
  files. Total whole-payload refusals = 24; the filed figure is 23.
- **Captured-by:** `PROTOCOL.md:352-354` — "A numeric claim carries its counting command … the `CORPUS.md`
  rules bind `LOG.md` entries and lane reports too". The rule existed and was bypassed: the figure was
  written on three surfaces with no command. The prompt's own binding rule
  (`.ufo/prompts/tabi-round-22.md:109-110`) is scoped to before→after measurements, so a work-item count
  fell between the two rules.
- **Fix (shown able to fail):** auditor class `c1-refusal-arithmetic` re-derives the count from committed
  `w2*-cap-refusal-*.json` (file count × per-file message occurrences, seat width per file) and compares it
  to every figure the round states. Red: round-22 as filed — derived 24 ≠ cited 23, tripping on exactly
  the bytes above. Green: the same bytes with 24 stated, or round-21, whose evidence holds no refusal file
  (`ls .ufo/waves/round-21/*cap-refusal* | wc -l` → 0; 0 = 0) → clears.

## M2 — wave and round caps were bound after authorisation, not before

- **Class:** cap checked after authorisation (`c2-wave-caps`).
- **Evidence pointer:** `.ufo/waves/round-22/w2b-spec.json` `maxLanes: 65` with 65 items; the grant it
  bought, `.ufo/waves/round-22/w2b-cap-refusal-01.json` →
  `"acquire": "granted lane=tabi wave=r22-w2b seats=65 live=125 pending=0 cap=320"`; `SCORECARD.md:1111-1113`;
  routed at `corpus/lessons/round-22-verifier-spotcheck.md:208-212`.
- **Derived:** `python3` JSON load of both specs → `w2-spec maxLanes=64 items=64`,
  `w2b-spec maxLanes=65 items=65`; `grep -o '"waveMaxLanes":[^,]*' scripts/hyaku/ufo-wave-policy.json` → 64;
  band 32–64 and "together stay ≤128 seats" at `.ufo/prompts/tabi-round-22.md:191-192`. Round total
  64 + 65 = 129 > 128.
- **Captured-by:** the band rule at `.ufo/prompts/tabi-round-22.md:191-192` existed, but the only bound on
  the authorisation record is the host cap (`cap=320`), compared after the spec had already frozen at 65 —
  the policy band never entered the predicate, so a 65-seat spec passed by construction.
- **Fix (shown able to fail):** `c2-wave-caps` reads each round spec's `maxLanes` and `items.length`,
  compares each against `waveMaxLanes` and the wave sum against 128, before any grant is recorded. Red:
  round-22 — 65 > 64 and 129 > 128. Green: round-21 — `w1-spec 64/64` + `w2-spec 64/64` = 128 ≤ 128 →
  clears.

## M3 — a landed-change row was not bound to the LOG entry it names

- **Class:** change/entry not bound (`c6-landed-log-binding`).
- **Evidence pointer:** `.ufo/reports/round-22/tabi.md:85` (commit `69449ed`) ties the landing-stage encoding
  revision to "`LOG.md` §Round22 landing item 1 and 3" at `47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e`;
  `git show --name-only --format="" 47bfb5f | grep -c '^LOG.md$'` → 0, while
  `git show --name-only --format="" fbee618 | grep -c '^LOG.md$'` → 1; routed at
  `corpus/lessons/round-22-verifier-spotcheck.md:223-227`.
- **Derived:** the cited commit's own tree carries no LOG entry, so the change and the entry it cites live
  in different commits with no pointer between them — the row is true in prose and false as a binding.
- **Captured-by:** `.ufo/prompts/tabi-round-22.md:107-108` — "every change tied to a LOG.md entry and to
  the commit hash that carries it" — reinforced by `PROTOCOL.md:352-354` (CORPUS rules bind LOG entries).
  The row satisfied the criterion's surface (it names a section) while violating its substance.
- **Fix (shown able to fail):** `c6-landed-log-binding` requires every landed-changes row that names a
  `LOG.md` section to resolve to a commit whose own diff adds that section, in the same round. Red: row 85 —
  cited-commit count 0. Green: the same change row pointing at `fbee618` (count 1) → clears.

## Not written

- Routed defects 3–5 (`corpus/lessons/round-22-verifier-spotcheck.md:214-222`: Gate spot-check row,
  per-attempt stale-lane grading, W2b registry identities) also ground to `c3-gate-spotcheck`,
  `c4-stale-attempts`, `c5-registry-identities`, but lie outside this ticket's candidate set; no fourth
  row was invented and none of M1–M3 was dropped.
- All commands above are read-only (`git show`, `grep`, `ls`, `python3` JSON load). No tracked file was
  edited, no gate rerun to decorate a claim.
