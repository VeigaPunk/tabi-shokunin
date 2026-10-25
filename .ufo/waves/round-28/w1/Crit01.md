# Crit01 — FSD review of frozen round-28 claims (seat 33)

Lane: tabi-shokunin, baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (HEAD at review time).
Scope: falsify C2 (calibration) with unrelated citation, wrong script, wrong tally, later-paragraph, and exact-line controls.
Frozen claims: `.ufo/waves/round-28/claims.json` (schema `tabi-round-claims-v1`, frozen 2026-10-25, before data).

---

## 1. Verdict

**C2 falsified.** The current `scripts/check-selfassessment.mjs` m1 supersession predicate clears a stale LOG.md tally with
(i) a correction citing an unrelated line, and (ii) a correction citing no line at all (a timestamp colon suffices).
The production false-clear of LOG.md:221 is caused by exactly this lax citation test. The frozen C2 "after" state
("LOG.md:221 appears as a mismatch unless an exact-line correction cites it"; red unrelated-citation selftest case)
is not reachable without changing the matcher: the predicate `/\:\d+/` must be replaced by an exact-line comparison.

## 2. Evidence

All commands run from `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only git; fixtures in
`.ufo/waves/round-28/scratch/Crit01/` under `git -C` temp repos, committed then evaluated by the lane checker binary).

Observation: `node scripts/check-selfassessment.mjs --rev HEAD --json` (exit 1, `mismatches=1` from m3 only) reports
LOG.md:221 `claimed=8, observed=12, superseded=true` — the stale tally is hidden, not counted. Matches
`corpus/lessons/round-27-verifier-spotcheck.md:15` ("mismatches=0 … its own finding at LOG.md:221 says claimed 8,
observed 12, superseded=true").

Mechanism (code, lines 319-327): a later paragraph supersedes when
`namesScript && /supersed|correct/i && /\:\d+/ && statedTallyNumbers(text).includes(f.observed)`.
`/\:\d+/` accepts any colon-digit token, e.g. timestamps; nothing compares the cited line to `f.line`.

Clearing paragraph identified in production LOG.md: paragraph starting at line 265 (post-commit measurement, lines 265-447):
- names `scripts/check-freshness.mjs` (yes);
- carries "Corrected" (yes);
- `/\:\d+/` matches only `:16`, `:28`, `:18751` (from `T05:16:28Z` timestamp and epoch), **not** `:221` (`text.includes(":221")` false);
- stated tally numbers include 12 from line 275 "12-case self-invocation and candidate run." — incidental prose, not a gate measurement.

So LOG.md:221 is cleared by a later paragraph that never cites it — the exact false-provenance class the claim targets.

Targeted counterexamples (scratch fixtures; stale tally at LOG.md:6 claims 12, oracle 13):

| Fixture | Later correction text | Checker exit | Superseded flag | Expected under claim |
|---|---|---|---|---|
| A | `Correction (supersedes LOG.md:999): … cases: 13` | 0 (clean, mismatches=0) | true | red (unrelated citation) — **FALSIFIED** |
| B | `Corrected: … re-run at 10:15 measures \`cases: 13\`` | 0 (clean, mismatches=0) | true | red (no line citation; colon-time) — **FALSIFIED** |
| C2 | later `## Round 24` section names `check-other.mjs`, cites `LOG.md:6` | 1 (mismatch retained) | false | red — control passes |
| D/D2 | `Correction (supersedes LOG.md:6): … cases: 13` (same section / own section) | 0 | true | green — positive exact-citation control passes |
| E | `Correction (supersedes LOG.md:6): … cases: 12` (wrong number) | 1 | false | red — control passes |

Positive/negative exact-line controls hold, so the defect is narrowly the citation test. The selftest table (CASES,
lines 443-597) contains green exact-citation (`m1-log-stale-then-corrected`) and red wrong-number
(`m1-log-wrong-number-correction`), but **no red unrelated-citation case**; adding the claim-required red case against
the current predicate would fail (fixture A).

Note: `m1Findings` (SCORECARD window, lines 231-240) shares the same non-exact `/\:\d+/` test; same guard needed there
for consistency.

## 3. Impacted axes

- **calibration** (C2): false-clear persists; the claimed target is unmet by the current matcher.
- Adjacent: supersession logic shared by m1 windows; the lax test also makes unrelated round entries clear scorecard tallies.

## 4. Smallest safe correction

1. In `m1LogFindings` (and `m1Findings`), replace the bare `/\:\d+/` test with an explicit citation parse restricted to
   line-citation context (e.g. `/\b(supersedes|LOG\.md)[^:]*:(\d+)/g`) and require the parsed set to include `f.line`.
2. Keep the validated `namesScript`, correction-marker, and oracle-number conditions unchanged (C2/E/D controls prove them sound).
3. Add selftest regression cases: red unrelated-citation (cites a different line), red timestamp-only no-citation, retain
   green exact-citation and red wrong-number cases.

Claim quote (claims.json): "Repair scripts/check-selfassessment.mjs m1 supersession so a correction only clears the exact
stale tally it cites, not an unrelated later line/paragraph." Kill rule: "If any unrelated correction still clears
LOG.md:221, claim misses."

---

## Final answer

C2 falsified: m1 supersession clears stale tallies with unrelated or absent line citations. Production LOG.md:221
(claimed 8, observed 12) is hidden by paragraph @265, which cites no line (matching colons are timestamps); scratch
fixtures A and B reproduce clean exits. All other controls pass: wrong script retains mismatch, exact citation clears,
wrong number does not. Fix: compare parsed citation lines to the finding line, guarding timestamps; add the required red
unrelated-citation selftest case. Impacted axis: calibration.
