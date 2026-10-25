# ScoutReverifyLog — C1 LOG-window re-derivation (wave 1, round 27)

Seat: `ScoutReverifyLog` · Lane: `tabi-shokunin` · Assignment: independently re-derive the
`m1LogFindings` LOG-window finding set at rev `5a0178c744a92f63f8add30b8ef035c5a0a89b22`,
compare against committed receipt `.ufo/waves/round-27/selfassess-baseline-raw.json`
(rev `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`) and fresh `--json` runs; report
false negatives/positives and whether the 4 superseded entries at LOG.md
`:335/:391/:1090/:1103` are justified.

Read-only: only this file plus `scratch/ScoutReverifyLog/` (gitignored) written; git
use was `log/show/rev-parse` only; fixture repos `D=$(mktemp -d) && git -C "$D" init -q`.

---

## 1. Headline

- **Nothing missed in the counted set, no count false positives.** All 17 LOG-window
  findings from the fresh run are genuine frozen-shape claim lines with real
  associated scripts. The independent enumeration finds **20** claim lines; the 3
  extra (`:1302`, `:1617`, `:1730`) sit in sections that name **zero** `scripts/*.mjs`,
  which the counter silently skips (`if (!scripts.size) continue;`) — a reporting gap,
  not a missed mismatch (each would be a match under its plausible true owner).
- **The 4 superseded-by-correction entries are justified** under the frozen rule
  (same script, oracle-correct number, correction marker, later paragraph) — with one
  wording nit: the `:1090` correction says the 66 "counts validation decisions in
  `…/decisions.json`", but that file holds **27 decisions** (verified blob, len 27);
  the 66 is the case count, as `:1090` itself says "(27 decisions, 66 cases)".
- Reproducibility: fresh run at baseline rev matches the committed receipt exactly
  (mismatches=6: 5 LOG + 1 m3). At the assignment rev the only mismatch is m3
  (18 untracked working-tree paths); the m1 LOG-window itself is clean (5
  mismatches superseded, 0 remaining).

---

## 2. Reproducibility of the receipt vs fresh runs

Commands (run in lane root):
`node scripts/check-selfassessment.mjs --rev <rev> --json > scratch/…/fresh-<rev>.json`

| rev | fresh result | committed receipt |
|---|---|---|
| `4ad4c77` (baseline) | mismatches=6 (LOG :335,:391,:1090,:1103,:1664 + m3), couldNotEvaluate=89, superseded=5 | `.ufo/waves/round-27/selfassess-baseline-raw.json`: identical (mismatches=6, cne=89, sup=5) |
| `5a0178c` (assignment) | mismatches=1 (m3 only, observed=18), cne=92, sup=10, 17 LOG findings | n/a (no receipt at this rev) |
| `5198e28` (tip) | mismatches=1 (m3 only, observed=43 untracked = wave-1 seat reports), cne=92, sup=10 | `measure-c1-fd722a7.json` records mismatches=1 (m3) |

Script-blob identity verified: `scripts/check-selfassessment.mjs` at `5a0178c` byte-identical
to working copy (sha `de5d66…`); at `4ad4c77` old blob `6b8d31…`; gates
`check-freshness`/`check-sources`/`round-evidence-audit` byte-identical across revs.

---

## 3. Independent enumeration (frozen claim shapes)

Frozen shapes: ``--self-test N/N``, `N-case`, `cases=N`, `N cases`; `cases: N` is a
supersession-statement shape only (matches implementation: claim regexes use
`cases\s*=`, supersession tally parsing uses `cases\s*[:=]`).

Script: `scratch/ScoutReverifyLog/enum_log.py` + `sections.py` (section split `^##\s`,
line-level script names win, else section single-script, else ambiguous) over
`LOG-5a0178c.md`; **20 claim lines**. Counter's `m1LogFindings` output: **17**.

| line | claimed | associated script(s) per resolver | oracle measured | counter verdict |
|---|---|---|---|---|
| 221 | 8 | scripts/check-freshness.mjs | 12 | counted, then superseded |
| 254 | 12 | scripts/check-freshness.mjs | 12 | match |
| 275 | 12 | scripts/check-freshness.mjs | 12 | match |
| 335 | 4 | scripts/check-freshness.mjs (line-level name) | 12 | counted → superseded |
| 391 | 4 | scripts/check-freshness.mjs (line-level name) | 12 | counted → superseded |
| 471 | 4 | section 2 scripts → ambiguous | — | could-not-evaluate |
| 484 | 25 | section 2 scripts → ambiguous | — | could-not-evaluate |
| 972 | 59 | scripts/selftest-measurement-binding.mjs | outside runnable gate set | could-not-evaluate |
| 994 | 8 | section 2 scripts → ambiguous | — | could-not-evaluate |
| 1056 | 57 | check-sources (+ others) → ambiguous | — | could-not-evaluate |
| 1079 | 38 | check-sources (+ others) → ambiguous | — | could-not-evaluate |
| 1090 | 66 | scripts/check-sources.mjs (line-level name) | 26 | counted → superseded |
| 1103 | 66 | scripts/check-sources.mjs (line-level name) | 26 | counted → superseded |
| 1302 | 45 | section has zero scripts (skipped) | (45 if check-user-round-contract) | **dropped silently** |
| 1617 | 44 | section has zero scripts (skipped) | (45 if check-user-round-contract) | **dropped silently** |
| 1664 | 12 | scripts/round-evidence-audit.mjs | 13 | counted → superseded |
| 1730 | 13 | section has zero scripts (skipped) | (13 if round-evidence-audit) | **dropped silently** |
| 1812 | 17 | 3 scripts → ambiguous | — | could-not-evaluate |
| 1863 | 13 | 4 scripts → ambiguous | — | could-not-evaluate |
| 1864 | 13 | 4 scripts → ambiguous | — | could-not-evaluate |

**False negatives (missed findings):** none that would change the mismatch count — the
3 dropped lines would all be *matches* under their true owners (45/45/13), so they
cannot generate a mismatch. They are a silent-visibility gap: zero-script sections are
skipped before claim extraction, not even reported as could-not-evaluate.
`:511` ("Self-test 25 → **26** cases", markdown `**` breaks the `N cases` regex) and
`:905` ("36 CLI+4 helper cases") are shape-variants the frozen shapes do not capture;
neither is a strict-shape claim, so not counting them matches the frozen rule.

**False positives (counted but not findings):** none. Every counted line is a genuine
frozen-shape claim; the 5 superseded ones are all *legitimately* superseded (see §5).

---

## 4. Measured gate oracles (run `--self-test`/`--selftest` in lane)

| script | flag | cases | exit |
|---|---|---|---|
| check-freshness.mjs | --self-test | 12 | 0 |
| check-sources.mjs | --self-test | 26 | 0 |
| round-evidence-audit.mjs | --selftest | 13 | 0 |
| check-selfassessment.mjs | --selftest | 17 | 0 |
| check-round-contract.mjs | --self-test | 38 | 0 |
| check-user-round-contract.mjs | --self-test | 45 | 0 |
| check-measurement-binding.mjs | --self-test | 76 | 0 |
| selftest-measurement-binding.mjs | (delegates to check-measurement-binding) | 76 | 0 |

Selftest printouts re-run at wrap-up: `audit-selftest.out` (6823 bytes, 14 PASS
markers, exit 0) — earlier "shaken tail" was a truncated capture; full output saved in
scratch.

---

## 5. Supersession semantics — verified predicates and fixture falsifications

Exact predicate (`scripts/check-selfassessment.mjs` §m1LogFindings, lines 316–328):
a later **paragraph** (`p.start > f.line`) clears finding `f` iff it (a) names
`f.script` via `SCRIPT_IN_TEXT`, (b) matches `/supersed|correct/i`, (c) contains
`/:\d+/` anywhere, (d) `statedTallyNumbers(text).includes(f.observed)`.

Fixture falsifications (throwaway `/tmp` git repos copying gates + LOG, run via
`node scripts/check-selfassessment.mjs --repo D --rev HEAD --json`):

- **Benchmark parity** B0: fixture of the shipped 5a0178c LOG reproduces the real run
  exactly (17 LOG findings, :221,:335,:391,:1090,:1103,:1664 superseded).
- **Wrong-number control** (frozen rule): editing the correction block's `cases: 26`
  -> `cases: 25` does **not** clear `:1090/:1103` while the sibling bullet in the same
  paragraph still states 26 (paragraph-unit overlap masks the wrong number); removing
  the sibling bullet → `:1090` reappears (mismatches=2). Confirms tally-number check is
  satisfied *per paragraph*, not per bullet.
- **Citation laxness**: replacing every `:LINE` citation with `:9999` still supersedes —
  `/:\d+/` accepts any digit-colon, so "cites the superseded line" is not actually
  binding.
- **Marker holes**: bullets reading "This is incorrect" / "Uncorrected note" still
  supersede via the `/correct/i` substring (any word containing "correct").
- **Paragraph-unit**: splitting the block into separate paragraphs (blank lines
  between bullets) makes `:1090/:1103` counted again (mismatches=2) — the bullet
  paragraph is one unit because bullets are contiguous non-blank lines (1904–1925).
- **`:221`**: cleared by the round-27 correction block (para@1904 names
  `check-freshness.mjs`, states `cases: 12` — the true oracle — with `:335` present),
  and also by para@265 (timestamp `05:16:28Z` contains `:16`/`:28`). Deleting para
  265–447 leaves `:221` superseded via para@1904, so the earlier "timestamp-citation"
  framing is superseded by this correction: the `:221` supersession is legitimate
  (12 is the real check-freshness oracle).
- **`cases: N` shape**: a `cases: 12` statement is never treated as a claim (only
  `cases=12` is) — confirms the frozen rule's two-shape split.

---

## 6. Verdict on the four corrections (`:335/:391/:1090/:1103`)

Mechanical: **all four satisfy the frozen supersession predicate** — each bullet is in a
later paragraph, names the same script the counter associated, carries "Correction",
cites its `:LINE`, and states the oracle number (`12/12/26/26`) in `cases: N` shape.
They clear the four stale matches, so the assignment-rev m1 window is clean.

Semantic accuracy of what the corrections say:

| entry | original line (5a0178c) | correction claim | check |
|---|---|---|---|
| :335 | "shipped contract self-test receipt (`ROUND_CONTRACT_SELFTEST verdict=clean cases=4`)" | four-case figure is the ROUND_CONTRACT receipt, not check-freshness | **accurate**; true owner check-round-contract today measures 38 (not stated, not required) |
| :391 | "shipped user-swarm contract self-test receipt (`verdict=clean cases=4`)" | four-case figure is the user-swarm contract receipt | **accurate**; owner check-user-round-contract today measures 45 |
| :1090 | "`corpus/evidence/round-19/validation/decisions.json` (27 decisions, 66 cases)" | "the sixty-six figure at :1090 counts validation decisions in `…/decisions.json`" | **nit**: blob verified — decisions.json holds **27 decisions** (len 27); no 66 appears there; 66 is the case count (as the original line itself says) |
| :1103 | "Integration: 66/66 cases pass on Chromium 154…" | sixty-six-over-sixty-six fraction counts integration validation cases | **accurate** |

So: justified = YES (4/4), with one inaccurate parenthetical at `:1090`
("counts validation decisions" should read "counts validation cases"; the decisions
file has 27 decisions).

---

## 7. Other noted facts

- `:972` (`selftest-measurement-binding.mjs` 59 cases) is could-not-evaluate via
  "script outside the runnable gate set"; the pair today measures 76 → stale but
  unreachable under the window rule. `:484` (`SOURCES_SELFTEST` 25) is ambiguous-CNE;
  true oracle 26 → stale-but-CNE.
- m3 caveat: at the tip the only mismatch is m3-unlanded-paths (live working tree;
  43 untracked = wave-1 seat reports). C1 "mismatches=0" holds only on a clean tree
  (SCORECARD.md:1396 acknowledges "under a clean tree").
- Dead code / docs: `TALLY_PATTERNS` (line 121) unused; the doc comment lists
  `cases: N` as a claim shape while the implementation parses `cases=` only.
- New selftest ids at tip: `m1-log-stale-tally`, `m1-log-stale-then-corrected`,
  `m1-log-wrong-number-correction`, `m1-log-ambiguous-section-not-counted`.
- `m2Findings`/`m3Findings` bodies byte-identical across 4ad4c77→5a0178c.

---

## 8. Concluding answer

1. No counter MISSED counted finding; the 3 extra lines are a silent-drop reporting gap
   (zero-script sections), and each would be a match under its true owner — no
   mismatch impact.
2. No false positives: every counted line is a genuine frozen-shape claim; the 5
   superseded entries are legitimately superseded.
3. The 4 corrections are justified (mechanical pass; semantically accurate except the
   `:1090` parenthetical mislabels 66 decisions vs 27).
4. Assignment-rev m1 window is clean; the only remaining mismatch is m3 (working-tree
   untracked paths), pending L1 commit.

Evidence inventory (all under `scratch/ScoutReverifyLog/`): `fresh-4ad4c77.json`,
`fresh-5a0178c.json`, `fresh-5198e28.json`, `enum_log.py`, `sections.py`,
`enum-out.json`, `sections-out.txt`, `LOG-5a0178c.md`, `audit-selftest.out`,
`fixture_*.mjs` (arms B0/S1/T0-T1/V0-V6), `find_para221.mjs`, `attribute*.mjs`.
