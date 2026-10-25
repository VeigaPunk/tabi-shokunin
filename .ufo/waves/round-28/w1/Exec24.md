# Exec24 — round-28 wave w1 report (C2 do-nothing control, seat item 24)

- Seat: Exec24 (leaf, UFO-FSD fleet wave). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- Scope: C2 (`selfassessment_mismatches_and_cases`) do-nothing control on baseline and tip; LOG.md:221 finding; frozen-claims citation. Read-only; no tracked changes made (git status: only untracked `.ufo/waves/round-28/` — this wave's own files). No tool installs (no pacman transaction; nothing needed).
- Frozen claims: `.ufo/waves/round-28/claims.json` (md5 anchor `#5C00`), lines 11–12, frozen before data at baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`, `frozenAt 2026-10-25`. C2 declared: "Repair scripts/check-selfassessment.mjs m1 supersession so a correction only clears the exact stale tally it cites, not an unrelated later line/paragraph"; control: "Do-nothing control reproduces the known false-clear at LOG.md:221; frozen counter target cannot be reached without changing matcher behavior." No claim implementation performed (leaf; report-only).

## Revision ground truth
- `git -C <lane> rev-parse HEAD` → `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; `git log --oneline -1` → `eb23c0b round-27 verifier spot-check (integrator, hyaku): non-author admit/reject`. **Tip == baseline** (same commit), so baseline and tip runs are the same checked object; `git merge-base --is-ancestor eb23c0b HEAD` → 0 (ancestor OK). `git status --porcelain` → only `?? .ufo/waves/round-28/` (untracked wave files).

## C2 do-nothing control (command: `node scripts/check-selfassessment.mjs --rev <REV> --json`)
Both runs (baseline `eb23c0b...`, tip `HEAD`; identical rev) returned identical JSON:
- `mismatches: 1` — the **only** counted finding is `m3-unlanded-paths` (SCORECARD.md round-27 claims landed; porcelain shows 7 untracked paths = the round-28 wave dir itself). Environmental, not matcher behavior: round-27 verifier's `ef8aa4a` run had `mismatches=0, clean=true` because no wave scratch existed then.
- `superseded: 10` (identical to round-27 verifier count), `couldNotEvaluate: 92`, `clean: false`.
- **LOG.md:221 finding** (present in both runs): `{"class":"m1-selftest-tally","doc":"LOG.md","line":221,"script":"scripts/check-freshness.mjs","claimed":8,"observed":12,"superseded":true}`. The stale tally (claimed 8, oracle 12) is marked **superseded → not counted as mismatch → false-clear reproduced**. C2 control expectation met: the frozen counter target (LOG.md:221 as a mismatch) cannot be reached without changing matcher behavior.

## LOG.md:221 mechanics (observation + inference)
- LOG.md:219–223 (quoted): "`node scripts/check-freshness.mjs --worktree` → `FRESHNESS_GATE verdict=clean ...` ... `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`" — stale 8 figure.
- The superseding paragraph is LOG.md:265–284 (post-commit measurement entry): it contains `scripts/check-freshness.mjs` (line 272), "Corrected" (line 266), a timestamp `2026-10-15T05:16:28Z` (line 269) and "12-case self-invocation" (line 275).
- Matcher (`scripts/check-selfassessment.mjs` lines 319–327): clears when a later paragraph (a) names same script, (b) matches `/supersed|correct/i`, (c) matches **`/:\d+/` anywhere in the paragraph**, (d) `statedTallyNumbers(text).includes(observed)`. Criterion (c) tests *any* `:digits`, not the superseded-line citation `:LINE` the frozen rule requires.
- Inference: paragraph 265–284 satisfies (a)–(d) via its timestamp (`:16`) and 12-case phrasing, so `LOG.md:221` is cleared **without citing line 221** — the exact false-clear class the round-27 verifier flagged (`corpus/lessons/round-27-verifier-spotcheck.md:15`, "that paragraph does not cite line 221, violating frozen supersession rule"). The added slash-only `/:\d+/` match is the cited defect locus, [INFERENCE] from code reading; the observable false-clear is direct evidence.

## Selftest gap (claim's after-state requires red unrelated-citation + green exact-citation cases)
- `node scripts/check-selfassessment.mjs --selftest --json` → 17 cases, 17 passed. m1-log cases present: `m1-log-stale-tally` (red), `m1-log-stale-then-corrected` (green, correction text "(supersedes LOG.md:6)" — cites the line), `m1-log-wrong-number-correction` (red, cites `LOG.md:6` but wrong number), `m1-log-ambiguous-section-not-counted`.
- **No selftest case has a correction citing a different line (e.g. `LOG.md:99`) that must still fail** — the red unrelated-citation control is absent; the matcher's `/:\d+/` would wrongly green it. Confirms "matching selftest includes a red unrelated-citation case" is unmet at baseline/tip.

## Risks / notes
- C2 verification at tip depends on the post-fix counter treating `LOG.md:221` as a mismatch while unrelated later paragraphs (any timestamp/line-number) stay non-clearing; current code's `:\d+` is a false-positive source. m3 (untracked round-28 wave files) will keep `mismatches>=1` and `clean=false` for the interim, independent of m1 fixes.
- No tracked files changed; no production code repaired (report-only per fleet rules).
