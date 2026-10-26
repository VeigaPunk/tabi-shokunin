# ScribeErrataC — routed defect 4, queue items E19–E27 (round 32, wave w1)

## Verdict

Nine carried errata were re-checked byte-by-byte against the lane at `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`
with the frozen v3 counter (`sha256 77b5c8ed…`, identical to `claims.json` `.frozenDigests`). Three are already
discharged and get refusals, not drafts: **E22** (the `SKILL.md:1559` correction landed at `SKILL.md:2610` by
`cad607b`) and **E25** (the multi-script rule landed at `corpus/README.md:699-703`, again `cad607b`) were fixed
*after* the round-31 reading that carried them, and **E23**'s seven lines are declared out of scope by
`claims.json` `.notClaimed[0]` and are unmeasurable without running gates this seat did not run. **E19** is
half-closed: v3 enforces the exit/verdict arm (`scripts/check-selfassessment.mjs:183-190`, proving cases `:854`
and `:860`), but `passed=` is still parsed nowhere and the summary-less fallback at `:184` still admits on exit
status alone. **E20, E21, E24, E26 and E27 are live**, each with current line anchors (the round-31 anchors
`:122`, `:233`, `:71` have drifted to `:130`, `:246`, `:79`); E24's counts move from 103/27 to 104/27 and E26's
"no live instance" is now false — `SCORECARD.md:1138` and `SKILL.md:2028` both read receipt/matrix counts as
tallies. Five append-ready texts are drafted: one criterion (83) for `corpus/QUALITY.md` covering E19+E20 once,
and four `## Mistakes` bullets for `corpus/lessons/round-32.md` covering E21, E24, E26, E27. The drafts exist
only in my output file; no lane file was edited.

## Deliverable

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-32/w1/ScribeErrataC/errata-C.md` — 30252 bytes,
sha256 `369a755924f5cb4436115ac6f044ae4b3abe84f6d20b8fc296d6dc14263d3925`, one block per erratum (E19…E27)
with: carried text verbatim, re-check evidence as `path:line` at `4181fff`, verdict, and either a
ready-to-append draft with target document and append point, or a refusal with reason and flip condition. A
disposition table and a machine-reading table open the file.

Append map (for the L1):

| Target | Append point | Covers |
|---|---|---|
| `corpus/QUALITY.md` | after `:491` (EOF), new `## Round 32 additions (append-only; never edit above)` | E19 (clauses a/b) + E20 (clause 4) — **one** criterion 83, append once |
| `corpus/lessons/round-32.md` | end of `## Mistakes` (file is new this round) | E21, E24, E26, E27 — four bullets |
| — | nothing | E22, E23, E25 (refused; reasons and flip conditions in the file) |

## Evidence — commands and exit codes

Every command ran in the lane root, read-only. No clone, no scratch dir, no browser, no network, no gate
self-test, no counter run; nothing was installed.

| # | Command | Result | Exit |
|---|---|---|---|
| 1 | `git rev-parse HEAD` | `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` | 0 |
| 2 | `git status --porcelain` | six untracked `.ufo/waves/round-32/*` entries (pre-existing wave scaffolding; none mine) | 0 |
| 3 | `git log --oneline -6` | `4181fff`, `5ad1fcb`, `2f8535c`, `d805d1d`, `70e84a1`, `cad607b` | 0 |
| 4 | `sha256sum scripts/check-selfassessment.mjs` | `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9` | 0 |
| 5 | `jq -r '.frozenDigests["scripts/check-selfassessment.mjs"]' .ufo/waves/round-32/claims.json` | same digest → the bytes I cite are the frozen v3 bytes | 0 |
| 6 | `git diff --stat 2f8535c5 4181fff -- scripts/` | only `scripts/check-bidi-runtime.mjs` (18+/4−); `check-selfassessment.mjs` untouched since the freeze commit | 0 |
| 7 | `git diff --name-only 5ad1fcbf 4181fff` | 29 files, all under `.ufo/waves/round-32/` → baseline line numbers hold at `4181fff` | 0 |
| 8 | `grep -c TALLY_PATTERNS scripts/check-selfassessment.mjs` / `grep -c statSync …` | `1` / `1` (definition, import only → dead, E21) | 0 |
| 9 | `jq` composition over `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` | mismatches 18; findings 195; refused 104 = 24 ambiguous + 3 outside `RUNNABLE_GATE` + 76 m2 + 1 m4; m1 109 = 15 counted + 21 superseded + 46 matched + 27 refused; m4 9 = 3 + 5 + 1 | 0 |
| 10 | `jq -r '.findings[]\|select(.couldNotEvaluate=="script outside the runnable gate set")…'` | `LOG.md:972` (selftest-measurement-binding, 59), `SKILL.md:2027` (freshness-witness, 8), `SKILL.md:2028` (webmcp-invoke-round18, 12) | 0 |
| 11 | `jq -r '… \|select((.doc=="SKILL.md" and (…index($l))) …)'` for E23's seven `(doc,line)` pairs | empty → those lines appear in no finding at all, counted or refused | 0 |
| 12 | `grep -n "GIT_CONFIG_GLOBAL\|GIT_DIR\|GIT_WORK_TREE"`, `grep -n 'spawnSync("git"'`, `grep -n "process.exit(out.ok"` | `:104` (config only), `:101`/`:399`/`:419`/`:924` (spawns), `:1063` (exit 3) | 0 |
| 13 | `grep -n "1559" SKILL.md`, `sed -n '2605,2613p' SKILL.md` | correction bullet at `:2610` citing `SKILL.md:1559` | 0 |
| 14 | `grep -n "a2w1 CritReadmeRow F3; ScribeErrata E25" corpus/README.md` | `:703` (bullet `:699-703`) | 0 |
| 15 | `git log --oneline ae15a37..4181fff -- scripts/check-freshness.mjs` | empty → the `12/12` in the landed correction is not stale by history (gate not re-run) | 0 |
| 16 | `grep -n "81. The oracle\|spells its count differently\|outside the oracle until a later" corpus/QUALITY.md` | criterion 81 at `:472`, its `cli_cases=` limit clause at `:478-481` | 0 |
| 17 | `tail corpus/QUALITY.md`, `grep -n "^## " corpus/QUALITY.md` | 491 lines, one `## Round 31 additions` at `:455`, criterion 82 ends the file → append point | 0 |
| 18 | `ls corpus/lessons/ | grep -E "round-3[12]"` | `round-31.md`, `round-31-verifier-spotcheck.md` only → `round-32.md` is prospective | 0 |

One command **failed** and was re-run: my first `jq` filter for E23 used the array as the input of `index` and
returned `jq: error: cannot index [1559,1988,2030,2031,2032,2474] with "line"`, **exit 5**. Fixed by binding
`.line as $l` first; the corrected filter (row 11) returned no matches, exit 0. No number in this report rests
on the failed filter.

## Conflicts, verbatim, for the canonical judge

1. **A landed criterion contradicts the frozen counter it describes.** `corpus/QUALITY.md:483-485`:
   "Supersedes the second clause of 81 ("a summary whose verdict is not `clean` is not a tally") and its "never
   the first `cases=` token" wording, **which the frozen v2 counter does not enforce**: its summary pattern
   reads no `verdict=` token, a failed self-test's `cases=N` is read as the gate's tally". Against that,
   `scripts/check-selfassessment.mjs:188` reads `verdict=` and `:190` refuses when it is not `clean`. The
   criterion's premise is v2-bound; the frozen bytes at `4181fff` are v3. The draft criterion 83 supersedes
   the premise without editing `:483-491`.
2. **The carried queue's own reading is stale in three places.** E19: "the frozen counter has no verdict test"
   (v3 has one, `:190`). E24: "103 refusals" (the freeze reading is 104; the extra is the m4 missing-inputs
   group). E26: "no live instance in the landed sections" (`SCORECARD.md:1138` reads "12-case in-memory matrix"
   as a tally — observed 13, currently `superseded: true` — and `SKILL.md:2028` reads "real12-case" against a
   gate outside `RUNNABLE_GATE`).
3. **The queue header's revision is older than two of its own items' fixes.** The header says "measured at
   `486048356f0712e4396588c9dab58cd419243120`"; E22 and E25 were repaired by `cad607b` (round-31
   attempt-2 integration), which is *later*. Scribes owning other ranges should expect the same.

## Findings worth the L1's attention

- **F1.** `E19`'s closure is real but narrower than the claim prose suggests. `passed=` appears nowhere in the
  parser (`grep "passed=" primes only the fixtures`), so `FIXTURE_SELFTEST verdict=clean cases=13 passed=11`
  with exit 0 is still an oracle. No case in the 41 covers a clean verdict with a short `passed`; the two v3
  cases (`:854`, `:860`) cover `verdict=failed` and nonzero exit.
- **F2.** `E20` is a header-vs-extractor contradiction inside the frozen bytes themselves: header `:30-33`
  advertises `cases: N`; the extractors at `:216`/`:322` cannot match it; only `statedTallyNumbers:268` can.
  Live colon-form text exists (`LOG.md:1854,1907,1911,1915,1919,1921,1925,2008`; `SCORECARD.md:1204,1351`) but
  is consumed only by the supersession check, never as a claim.
- **F3.** For `E24`, the residual must travel with every "mismatches 0" quote: 104 refusals of 195 findings,
  27 of them m1, of which 3 name gates `RUNNABLE_GATE:88` can never run and 24 are ambiguous associations; plus
  21 m1 findings cleared only by a correction paragraph and 46 matched.
- **F4.** For `E26`/`E27`, the risk is created *by the round's own corrections*: the same paragraph that clears
  an m1 line must state the oracle tally in a parsed shape, and any second `N/M` in that paragraph (a date, a
  round range, a ratio) can clear a different stale line (`statedTallyNumbers:270`, comment `:246`).

## Touched surfaces

| Path | Action |
|---|---|
| `.ufo/waves/round-32/w1/ScribeErrataC/errata-C.md` | created (deliverable) |
| `.ufo/waves/round-32/w1/ScribeErrataC.md` | created (this report) |
| everything else under `tabi-shokunin/` | read only — no lane tracked file, index, jj state or script touched |

## Out of scope / not done

- Counter re-run, clone, gate self-tests, browser runs, network fetches: none. Every code statement above is a
  static reading of the frozen bytes; where a draft needed a measured tally I do not hold
  (`scripts/check-aria-metadata.mjs --selftest` for E23's `:2474`), the erratum is refused rather than filled.
- No scratch directory was created (`$HYAKU_SCRATCH/tabi-r32/ScribeErrataC` does not exist), so no cleanup is
  owed; no chromium/chromedriver was started, so `pgrep -fa 'chromedriver|chromium'` has nothing of mine to
  report. No tool installed or upgraded (nothing was needed; `pacman` untouched, no partial transactions).
- Queue items outside E19–E27 (E1–E18, E28–E43) belong to sibling scribes; I did not touch their ladder and did
  not message peers, since the numbering gives no overlap.
