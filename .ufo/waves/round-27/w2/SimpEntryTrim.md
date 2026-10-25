# SimpEntryTrim — YAGNI review of landed round-27 corpus (knowledge entry + two gates)

Seat: `TabiR27.SimpEntryTrim` (wave 2, round 27; read-only reporter). Item: attack the landed
C1–C3 artifacts on the YAGNI axis — (a) `corpus/knowledge/redirect-and-retry-after-semantics.md`
filler, (b) `scripts/check-s106-evidence.mjs` dead branches/unused vars/schema overhead, (c)
`scripts/check-selfassessment.mjs` new LOG machinery. No tracked file edited; no tool installed
(no install/upgrade recorded); scratch not needed beyond /tmp sandboxes that the gates create and
remove themselves.

## 0. State at measurement

- Lane HEAD: `bceb17dd82446a3b7514dd9759ec733673b4ba0d` (master; baseline lane tip `f185b4e…`).
- `git diff HEAD -- corpus/knowledge/redirect-and-retry-after-semantics.md scripts/check-s106-evidence.mjs scripts/check-selfassessment.mjs` → **empty**: all three analyzed files are byte-identical to the committed tip. Findings below are verdicts on the landed corpus, not worktree drift.
- `git status --porcelain` → only untracked wave files (`?? .ufo/waves/round-27/w1.ready.dispatched`, `?? .ufo/waves/round-27/w2/`).

Wave-1 fold-in (per assignment): `RevEntryC3.md` minor findings (duplicated orphan fragment at old line 18; missing inline line cite for the §15.4 rewrite-step-4 quote) are **both resolved at HEAD** — line 17 now ends cleanly `method (line 7423).`, and line 35 carries the cite `(step 4, lines 7306-7307)`. `CritC3Junk.md` blemishes that remain (bytes+sha256 tripled across entry source line / S107 anchor / README Sources cell; trailing-blank ranges `7507-7523`, `4809-4813`) are cross-file convention and accuracy items already reported by that seat — not re-litigated here.

## (a) redirect-and-retry-after-semantics.md — filler / duplication candidates

File is 57 lines; 48 are front-matter + evidence bullets + Unknowns. Candidate deletions (line numbers against committed tip):

| # | Lines | Text (first words) | Verdict |
|---|---|---|---|
| D1 | **38-40** | `**INFERENCE, not a located normative sentence**: this history note supports…` | **Duplicate of the inference already labelled at line 33** (`The preserving reading is *inferred*:`) and repeated again in Unknowns at 56-57 (`The 308 method-preservation is an inference in this document…`). The 308 inference is stated three times. Remove **one** site — recommended: 38-40 (the other two carry the same honesty; w1 praised lines 38-41 as the honest label, so an alternative acceptable cut is the inline word `*inferred*` at line 33, which saves 0 lines). |
| D2 | **37** | `…but §15.4.9 does not restate that as a normative MUST-NOT.` | Restates the absence fact already in lines 31-32 (`the only MUST-NOT in the redirect sections is 307's at line 7494`). Same sweep, two phrasings; one is removable. |
| D3 | **9-11** | `semantics a journey driver will meet. Every sentence below is anchored in the / bytes fetched this round; where the spec's wording is weaker than common / folklore the entry says so.` | Unreferenced preamble: no quotes, no cites, no claim. Line 8's `**Documented upstream, not measured here.**` (itself a restatement of the `ground:` line 6 prefix) suffices. **Nuance:** line 10's `Every sentence below is anchored in the bytes fetched this round` is overbroad — line 25's `"the form was POSTed"` is a journey paraphrase, not a fetched byte (CritC3Junk classified it so), so the sentence is also technically falsifiable as written. Removing 9-11 removes that exposed overpromise. |
| keep | 47-52 | `Why this matters: …` | Commentary, but carries the lane-ground link (measured loopback 303→GET / 307 preservation) that anchors the entry to R3/L1b; overlaps but does not duplicate bullets. Keep. |
| keep | 54-57 | `**Unknowns (kept separate):** …` | Honesty block; keep (note its line 56-57 is one of the three 308-inference sites from D1). |

Net: 4-7 lines of 57 (7-12%) removable without losing any quote, cite, or honesty marker. Every bullet (13-45) and every front-matter line (3-6) is load-bearing; stopping here — further cuts would remove located quotes or the explicit inference/Unknowns labeling, harming the depth/calibration axes.

## (b) scripts/check-s106-evidence.mjs

Behavior at HEAD (commands run): `node scripts/check-s106-evidence.mjs --selftest --json` → `cases=5 passed=5 ok=true`; `node scripts/check-s106-evidence.mjs --rev bceb17d… --json` → `valid=true`, `sha_match=true`, `anchor_unique=true`, `byte_count_match=true` (receipt `s106.json` fields all agree with committed bytes). Contract preserved.

Findings:

1. **Unused import** — line 37: `readFileSync` is imported but never referenced (grep confirms only the import line). Delete from the import list.
2. **Dead branch** — line 332: `${out.reason ? ` reason=${out.reason}` : ""}` in `main()`; `evaluate()` never sets `reason`, so the conditional is always false. Dead output tail.
3. **Duplicate constant alias** — lines 43 and 46: `SCHEMA` and `RECEIPT_SCHEMA` are the same string `"tabi-s106-evidence-v1"`. One alias is redundant (and if they ever diverged the gate would emit a schema name different from the one it validated).
4. **Over-engineered schema checks? No** — `parseReceipt` (87-105) validates only 7 of the receipt's 16 committed fields (schema, url, decoded_sha256, bytes_path, decoded_bytes, anchor.line, anchor.text) and ignores `row`, `fetched_at`, `transfer`, `encoded_bytes`, `encoded_sha256`, `decoded_lines`, `anchor.comment_line/comment/occurrences_in_file`, `verification`, `status` — lean, matched to what the predicate needs. The only redundancy is the double guarantee `sha_match && byte_count_match` (sha256 already implies length); defensible as a guard against stale receipt fields, not dead weight. `present: true` (line 133) is constant by construction (absence throws Refusal), kept for output-schema stability.
5. **Coverage gap, not dead code** — of the four `valid` conjuncts, only `sha_match` and `anchor_located` have failing selftest cases (175-213); `anchor_unique` and `byte_count_match` failure arms are untested. Header line 8's "asserts exit code AND the stable field set" is also a mild overstatement — cases assert exit + `valid` + one named field, not the full output field set.

## (c) scripts/check-selfassessment.mjs

Behavior at HEAD: `node scripts/check-selfassessment.mjs --selftest --json` → `cases=17 passed=17 ok=true` (15 CASES rows + 2 refusal probes). `node scripts/check-selfassessment.mjs --rev bceb17d… --json` → `mismatches=1` (m3-unlanded-paths `observed=12` — the untracked wave scaffolding `w1.ready.dispatched` + `w2/`; exit 1), `couldNotEvaluate=92`, `superseded=10`. The machine runs; its live count is currently driven by wave scaffolding, not by landed code.

Findings:

1. **Unused import** — line 70: `statSync` is imported but never referenced (grep confirms only the import line). Delete.
2. **Dead constant** — lines 121-126: `TALLY_PATTERNS` is defined and never referenced; `m1Findings`, `m1LogFindings`, `statedTallyNumbers` and `gateTally` all use inline regex literals. Delete the constant (4 entries).
3. **New LOG machinery: fully wired, nothing uncalled** — `paragraphs` (256-265), `statedTallyNumbers` (246-254), `m1LogFindings` (267-330) are all invoked from `evaluate` and are selftest-covered (cases `m1-log-stale-tally`, `m1-log-stale-then-corrected`, `m1-log-wrong-number-correction`, `m1-log-ambiguous-section-not-counted`, lines 496-543). No uncalled function, no unused parameter in production paths.
4. **No-op fixture stub** — lines 628-632: `d.anchor(rev) { void rev; }` (invoked by the two m2 cases). Unused parameter, zero effect; exists only to document why m2 fixtures need no resolvable rev. Candidate for removal of calls + function, with a comment preserved in the receipt lines; small either way.
5. **Duplication (maintainability, not dead)** — `m1Findings` (184-242) and `m1LogFindings` (267-330) share ~49 identical per-line tally-mining lines, differing only in the `doc` label and the supersession unit (line vs paragraph). Consolidation candidate (parameterize doc label + supersession mode); behavior-affecting, so flagged not removed.

## Preserved contract

- C2 gate: selftest 5/5; real-repo run at HEAD `valid=true` — the frozen predicate, counter, kill rule and target all execute and agree with the committed receipt (`s106.json`).
- Calibration gate: selftest 17/17 (incl. the four LOG-window cases); the new LOG machinery is exercised by the frozen C1 extension cases.
- The C3 entry retains every located quote, line cite, and the explicit 308 INFERENCE/Unknowns labeling under the D1-D3 cuts; the S107 row (SOURCES.md:121) is untouched.

## Tradeoffs / stop point

D1-D3 are deletions without loss of evidence (each duplicated or meta-textual). The next deletions after D1-D3 — any bullet, the `ground:` line, the Unknowns block, or the Why-this-matters paragraph — would remove located quotes or honesty labeling and harm depth/calibration, so the frontier stops there. (b)/(c) trims are pure weight removals (unused imports, dead constant/branch, alias); the m1/m1Log consolidation is offered as a maintainability option, not required.

## Evidence

- `node scripts/check-s106-evidence.mjs --selftest --json` → 5/5, ok=true.
- `node scripts/check-selfassessment.mjs --selftest --json` → 17/17, ok=true.
- `node scripts/check-s106-evidence.mjs --rev bceb17dd82446a3b7514dd9759ec733673b4ba0d --json` → valid=true, sha_match/anchor_unique/byte_count_match=true.
- `node scripts/check-selfassessment.mjs --rev bceb17dd82446a3b7514dd9759ec733673b4ba0d --json` → mismatches=1 (m3 observed=12), couldNotEvaluate=92, superseded=10, clean=false (exit 1).
- `git diff HEAD -- <3 files>` → empty (analyzed state == committed state).
- `grep readFileSync` over check-s106-evidence.mjs → line 37 only; `grep statSync|TALLY_PATTERNS` over check-selfassessment.mjs → lines 70 and 121-126 only.

## Observation vs inference

All counts, hashes, line numbers and exit codes above are observed tool output. The live m3 count of 12 is an observation (untracked wave files); attribution of the selfassessment exit-1 to wave scaffolding is the direct reading of `observed=12` with `git status --porcelain` showing only wave files. The claim that D3's line 10 overpromises relative to line 25's paraphrase relies on CritC3Junk's classification of `"the form was POSTed"` as a journey paraphrase (reported finding, not re-measured). No claim of behavioral change is made — nothing was edited.
