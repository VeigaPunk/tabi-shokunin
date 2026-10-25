# RevSelfAssessmentCode — line-by-line review of `scripts/check-selfassessment.mjs`

Scope: the committed instrument at lane tip `ad125e85c235e1c4ec6a08e398bd64da01f68a08`
(574 lines). Every figure below was produced by a named command; fixture repos were built
under `TMPDIR=/home/vgpnk/tmp-tabi24` (harnesses committed at
`.ufo/waves/round-24/scratch/RevSelfAssessmentCode/harness{,2}.mjs`).

Bottom line: **C2's `after: 0` is false against the lane's own artifacts.** The frozen claim's
`before: 4` contradicts its own committed receipt (`5`) and the SCORECARD's frozen-claims
table (`5 → 0`); `revisions: []` records no correction. The instrument is additionally a
fail-open calibration counter: it exits 0 on inputs where every claim is undecidable, crashes
to the *failed* exit (1) instead of could-not-evaluate (2), and its m3 class measures the
ambient working tree rather than the measured revision.

## S1 — the claim is false at the reviewed tip

1. **`after: 0` contradicts the landed receipt.** `corpus/evidence/round-24/c2-tip.json`
   top-level: `{rev: b973fde…, mismatches: 1, couldNotEvaluate: 75, superseded: 5, clean: false}`,
   `counted: [m3-unlanded-paths: landed → 4]`. `c2-measurements.json.after` records the same.
   Yet `claims.json` C2 says `after: 0` and SCORECARD `:1233` says "tip counts none".
   Evidence: `python3 -c` read of `c2-tip.json` / `c2-measurements.json` (printed above).
2. **The "tip" receipt is not the tip.** `c2-tip.json` was measured at `b973fde`, the middle
   commit "corrections block worded so the supersession is mechanical" — the entry and the
   executed disposition land in `ad125e8`. The disposition says "Measured 2026-10-25 against
   the tip commit"; the receipt's `rev` field says otherwise.
3. **At the reviewed tip the counter reports a mismatch right now.**
   `TMPDIR=/home/vgpnk/tmp-tabi24 node scripts/check-selfassessment.mjs --rev ad125e8`
   → `mismatches=1`, `clean=false`, exit 1, counted `[m3-unlanded-paths: landed → 5]` at
   first run; the same command an hour later reports `landed → 29` — the five wave-2
   dispatch artifacts plus every sibling report that landed in the interim. The m3 class
   reads the live working tree, so the same `--rev` yields `observed=4` in the receipt,
   `5`, then `29` — the counter is not a function of the counted revision. It also
   counts **staged/modified tracked files**, so a reviewer mid-write trips it too.
4. **`before: 4` is arithmetically inconsistent with the claim's own prose and receipt.**
   claims.json: `before: 4` decomposed as "three stale `--selftest` 12/12 figures … one
   unlanded-path mismatch over 89 porcelain". `c2-baseline.json` records
   `mismatches: 5` = **four** m1 (check-sources `25 → 26` at `:410`, round-evidence-audit
   `12 → 13` at `:1138`, `:1139`, `:1151`) + one m3 (observed **4** porcelain paths, not 89 —
   the 89 figure is the round-23 routed defect, not this measurement). So the frozen `before`
   drops the check-sources figure and borrows a different defect's count for m3. The
   SCORECARD declared-claims table (`:1227` area) says `5 → 0`; `revisions: []` records
   neither correction.
5. **The round's own headline tallies are undecidable.** At the tip, m1 emits four
   `ambiguous script association` could-not-evaluate findings — `:1232` (`cases=22` in the C1
   disposition row), `:1233` (`cases=13` in the C2 row), `:1243` (`cases=22` in the
   gate-registry capability row), `:1249` (`cases=13` in the self-assessment capability row).
   The capability rows wrap the script name onto the previous line, so the tally line names no
   script and the section names two → ambiguous. The two numbers the round advertises as its
   gate evidence are never checked, and `clean` is unaffected.

## S2 — fail-open paths (exit 0 / exit 1 where the honest code is 2 or a real mismatch)

All inputs are isolated fixture repos; commands are the two harnesses.

6. **Crash → exit 1 masquerades as "failed (≥1 mismatch)", no JSON emitted.**
   `main()` (L538-552) rethrows any non-`Refusal` error, so Node exits 1 with a stack trace —
   the declared "failed" code, not could-not-evaluate 2. Triggers, both exercised:
   - `TMPDIR=/nonexistent-rsac` → `mkdtempSync` (L150) throws ENOENT → `exit=1`,
     `mismatches=null` (no parseable stdout). Equivalent to the round's documented ENOSPC.
   - gate file `chmod 000` → `readFileSync` (L145) throws EACCES → `exit=1`.
   A consumer reading `--json` gets nothing and sees the *failed* code.

7. **`clean` ignores every could-not-evaluate finding (L284, L293).**
   `counted` requires `observed !== null`; `clean = counted.length === 0`. A run where all
   claims are undecidable exits 0. Confirmed: fixture `empty-doc` (a SCORECARD with no gate
   mention) → `exit=0 mismatches=0 cne=0`; fixture `fn-ambiguous` (a stale `12-case` figure in
   a section naming two gates) → `exit=0`, `cne=1`. By contrast the sibling registry gate's
   killRule counts undecidable as nonconformant — inconsistent semantics for the same verdict
   word. `after: 0` is reachable by making tallies unparseable.

8. **m3 is ambient, not revision-bound (L269).** `git status --porcelain` reads the *working
   tree*. Demonstrated: same `--rev 573c99e` gives `observed=4` in the landed receipt vs `5`
   now; at `ad125e8` wave-2's own dispatch files produce `mismatches=1`. Any reviewer fixture
   outside `.ufo/waves/*/scratch/` (or any in-flight staged file) trips the class against a
   fully-landed revision.

9. **m3 silently passes on `git status` failure (L269-271).** Only `r.error` throws;
   `r.status !== 0` is ignored and stdout is empty → `paths.length === 0` → `[]`. Confirmed:
   fixture with corrupted `.git/index` → `git status` exits 128 ("index file smaller than
   expected") → instrument `exit=0, clean=true, findings=[]`.

10. **m3's git calls bypass the hardened `git()` helper (L249, L269).** m2's re-run and m3's
    status use raw `spawnSync("git", …)` — no `GIT_CONFIG_GLOBAL=/dev/null`. Confirmed: fixture
    with an untracked file + `HOME` carrying `core.excludesFile = <file containing '*'>`
    → `exit=0, clean=true` (global excludes hide the dirt). `.git/info/exclude` does the same
    inside the repo. The hardening in `git()` (L84-87) is dead code for exactly the two calls
    that observe the dirty tree.

11. **m3 anchor is a brittle literal and absent anchor ⇒ clean (L265-267).** The regex
    requires `##\s+Round\s+\d+\s+—\s+executed disposition` with the em dash. A heading spelled
    `Round 24 - executed disposition` (hyphen) or `#`/`###` level difference yields no anchor →
    `[]` → clean with a dirty tree. Confirmed: fixture `m3-hyphen-heading` → `exit=0` on a dirty
    tree. The class also never verifies the block *asserts* landed work — `claimed:"landed"`
    (L273) is a constant, not parsed.

12. **`git status` writes `.git/index` (write-scope violation).** Declared write scope
    (L15-18): "stdout/stderr only". `git status` refreshes the index; fixture `F-index`
    (mtime-stale tracked file) → `.git/index` mtime changed `…078 → …104` while the run
    reported clean. A read-only gate mutates `.git` (no `--no-optional-locks` /
    `GIT_OPTIONAL_LOCKS=0`).

13. **Fenced `## ` heading splits a section and orphans tallies (L119-131).** `sections()`
    keys on `^## ` anywhere, including inside ```` ``` ```` fences. Confirmed: SCORECARD section
    naming one gate, a fenced `## Round 23 — executed disposition` line, then `The matrix is
    `12 cases.` → the tally lands in a section with `scripts.size === 0` → dropped at L178 →
    `exit=0` (the stale figure is invisible, not even CNE).

14. **Association collapse: `claims[0]` for every target on a line (L183-204).** Only the
    first tally number is used, for all scripts named on the line. Confirmed
    (`fp-multitally`): `scripts/check-alpha.mjs` `--selftest` 13/13; `scripts/check-beta.mjs`
    `--selftest` 12/12 on one line → beta's *truthful* claim 12 is compared to alpha's 13 →
    `mismatches=1` (false positive).

15. **Oracle flag is sniffed from the first `--self-?test` occurrence in the blob (L149).**
    First occurrence may be a comment, not the implemented argv flag. Confirmed
    (`fn-flag-sniff`): gate whose header comment mentions `--self-test` but implements only
    `--selftest` → spawned with `--self-test` → gate exits 2 → `could-not-evaluate=self-test
    printed no tally` → `exit=0`. A genuine stale figure is hidden. Defaulting to `--selftest`
    when the token is absent (same line) is the complementary hole.

16. **Oracle ignores the gate's own verdict and exit (L150-168).** Extraction
    `/"?\bcases"?\s*[=:]\s*(\d+)/ … || /\b(\d+)\s*\/\s*(\d+)\b/` takes the *first* `cases=` (or
    fraction) anywhere in stdout+stderr; `r.status`/`exit` is recorded but never compared; the
    `verdict=` and `passed=` fields are unread. Confirmed:
    - `fn-failing-gate`: gate prints `verdict=failed cases=13 passed=12`, exits 3; scorecard
      says 13/13 → `exit=0, clean=true`. The strongest possible disagreement — a red
      self-test — reads as a match.
    - `m1-cases-zero-first`: gate prints `SOME_PHASE refused cases=0` before its summary →
      tally 0 → `mismatches=1` on a 13/13 claim.

17. **Pattern false negatives/positives in `TALLY_PATTERNS` (L112-116) + line filter
    (L183).**
    - False negative: `selftest 12/12` (no `--` token, or >24 chars between token and number)
      matches no pattern → *zero findings*, silent (`fn-no-dashes`, `exit=0`).
    - False positive: `(\d+)-case\b` / `\b(\d+)\s+…cases\b` fire on any "N cases" prose.
      Confirmed: `The round routed 4 cases to round 25.` in a gate-naming section →
      `mismatches=1` (claimed 4 vs observed 13).
    - Section-wide script accumulation (L179-193): any `scripts/…mjs` mention (a link, a
      citation, a path in prose) becomes an association candidate; a section naming two gates
      makes every script-free tally ambiguous → CNE (the real lane's `:1232/:1233/:1243/:1249`).

18. **Supersession launders stale figures (L208-213).** Any later line *anywhere in the
    document* that states the observed tally for the same script supersedes earlier mentions —
    it need not be a correction. Confirmed (`supersede-launder`): stale 12/12 in `Round 20 —
    executed disposition`, then a `Round 24 — waves and seats` sentence "the matrix
    `scripts/check-alpha.mjs` runs is 13 cases" → `exit=0`. Also, already-matching findings are
    flagged `superseded` (tip run, `:197` 12→12 marked superseded), inflating the
    `superseded` statistic.

## S3 — m2 closed-grammar defects

19. **The `-C <dir>` operand is parsed then discarded (L219, L249).** `SAFE_GIT` matches
    `git -C \S+ (cat-file -e|show) <hex>:<path>` but the re-run substitutes `-C repo`. Confirmed
    (`A-m2-C`): receipt `git -C <other-repo> cat-file -e <sha>:SKILL.md` exit 0 (truthful in that
    repo) → re-run against the measured repo → 128 → `mismatches=1` (false positive). The
    grammar advertises a -C form it cannot honor.
20. **The grammar excludes every real command the lane runs.** Only `git cat-file -e` /
    `git show` with a *hex* rev+path pass; `HEAD:`-form commands and all `node`/`curl`/`wc`
    commands are refused. At both revs **71 of 75** could-not-evaluate findings are
    "command outside the closed re-run grammar"; exactly **one** receipt in the entire corpus
    is decidable (`round-23/c1-measurements.json`, 128==128 match). The claim's killRule
    required null classes be disclosed — the claim decomposes before as 3 m1 + 1 m3 and says
    nothing about m2 firing zero counted findings because it can evaluate almost nothing.
21. **Sweep scope is `corpus/evidence/**` only (L223).** A committed receipt anywhere else is
    invisible. Confirmed (`C-m2-scope`): a contradicting `command/exit` at
    `.ufo/waves/r/receipt.json` → `exit=0`, no findings. Notably the round's own control
    receipt lives at `.ufo/waves/round-24/control/control-receipt.json` — outside the sweep.
22. **Wrong-typed `exit` is silently dropped (L237-244).** `"exit": "1"` (string) → no finding
    at all, not even could-not-evaluate (`m2-string-exit`, `exit=0`, `findings=[]`). A
    mis-serialized receipt is invisible.
23. **No dedup: one defect counted N times (L231-256).** The same `command`+`exit` node
    appearing twice (e.g. a before/after pair recording the same wrong exit) → 2 mismatches
    (`B-m2-dupe`, `mismatches=2` for one defect). `counterField` says "distinct findings" but
    nothing dedupes by (command, exit).
24. **`line: null` on every m2 finding** — receipts are JSON, so no line is recorded; a
    consumer cannot locate the offending node. (`counted` rows also drop `script`/`path`, so
    attribution fields are thin.)

## S4 — scope, docs, self-test quality

25. **SHONEN.md is never read (L280).** `evaluate` loads only `SCORECARD.md`; `SHONEN.md`
    appears nowhere in code (grep: zero hits). The C2 declaration says the counter covers
    "SCORECARD.md blocks that name a lane gate script, **and SHONEN.md**" — unimplemented.
26. **Oracle's inputs are ambient.** `gateTally` pins only the gate's own bytes
    (blob==disk, L145) but executes it with `cwd: repo` (L153): a gate whose self-test reads
    other working-tree files produces a tree-dependent tally while the claim says "the gate's
    own self-test output at the measured revision". Also, a gate with side effects writes into
    the repo during measurement — confirmed (`m3-gate-writes`): gate writes `side.txt` during
    its self-test → m3 then fires `landed → 1` (`mismatches=1`), the instrument's own oracle
    contaminating its own m3 class.
27. **`--repo` executes arbitrary code.** A caller-supplied `--repo <dir>` runs
    `<dir>/scripts/check-*.mjs` unconditionally (the fixture's gate wrote a file). Documented
    "(tests)" only, not restricted.
28. **Self-test never exercises the oracle.** `GATE_SRC` (L301) prints a constant 13; every
    fixture commits its gate so blob==disk always holds. There is no case for blob≠disk, flag
    sniffing, `N/N` output, `passed≠cases`, `cases=0`-first, `-C` operands, receipts outside
    `corpus/evidence`, corrupt index, or unusable TMPDIR. The fixture `anchor` body (L449) is a
    no-op (`void rev`) — the m2 fixture doesn't verify rev resolution at all.
29. **Docs/dead code.**
    - L8: header says "`--selftest` (10 isolated cases)"; the matrix has 13 results
      (`cases=13` — the very class of stale figure the instrument counts).
    - L4-6 verdict map declares 0/1/2; `--selftest` failure exits **3** (L550), undeclared.
    - L61: `statSync` imported, never used.
    - `resolveRev` (L96-100) allows `/` and `..` in revs (`a/../../x` passes the regex, fails
      at `rev-parse` → 2, harmless but noisy); `--repo` with no value → `git -C undefined` →
      Refusal exit 2 (benign).
30. **`couldNotEvaluate` conflates two kinds.** It counts per-finding CNEs: 4 m1 ambiguous
    associations + 71 m2 grammar refusals = 75 at both revs — a number dominated by expected
    noise, so a genuinely new undecidable claim is invisible inside it.

## Post-review note — concurrent lane-1 fix (uncommitted)

While this review ran, a sibling landed a 26+/8- working-tree diff on this file (`git diff
scripts/check-selfassessment.mjs`). It fixes the stale header (10→13, L8), adds a
malformed-fraction CNE for `N ≠ M` claims, and tightens supersession to require a correction
marker **and** a `:line` citation — addressing parts of #17/#18/#29. Everything above is still
true of the reviewed tip `ad125e8`: the fixes are uncommitted, and the diff itself makes the
instrument blob ≠ working copy, so a tip-run of the m1 oracle now reports
`check-selfassessment.mjs` as could-not-evaluate — the instrument undecidating its own
self-test entries mid-round. The 29-path porcelain state is the live demonstration of #8.

## Residual risk / verification gaps

- I did not re-verify the *measured* tallies of the eight real lane gates independently
  (e.g. re-running each `check-*.mjs --self-test`); the reported `observed` values at the tip
  are the instrument's own readings, consistent with the corrections block.
- The `before: 4` figure in claims.json was frozen before the instrument existed; the
  correction to 5 lives in the receipt and SCORECARD but not in `revisions: []` — a lane
  bookkeeping gap, not an instrument defect.
- `git status` index-write was demonstrated by mtime, not by inotify/strace; the mechanism
  (index refresh) is standard but the blame attribution is single-causal (no other process
  touched the fixture repo).
- The m3 observed drift (4 in the receipt → 5 → 29 for the same `--rev`) attributes the
  increment to sibling wave-2 artifacts by name and timestamp; I did not diff their
  provenance against the orchestrator's writes.

## Instrument fixes implied (not applied — read-only seat)

fail closed on non-`Refusal` errors (exit 2); include `couldNotEvaluate` in `clean` (or gate
`clean` on it); make m3 read `<rev>`'s tree state or pin the measurement to a pristine
checkout and verify the disposition's assertion text; harden both raw `git` calls like `git()`
(config neutralization, `--no-optional-locks`, status-error check); dedupe m2 by (command,
exit) and reject the `-C` operand rather than discarding it; compare the gate's `exit`,
`verdict`, and `passed`, and use the *last* `cases=` line; restrict the flag sniff to argv
parsing or the registry's declared spelling; associate tallies to the nearest preceding script
line (or table row) instead of first-claim cross-product; correct the header (13 cases, exit
3); drop `statSync`; read SHONEN.md or drop it from the claim.
