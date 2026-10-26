## Wave findings carried (append-only; round 31 wave a2w1, measured at `486048356f0712e4396588c9dab58cd419243120`)

One line per wave-1 finding that the integration at `4860483` does not already record. `w1/` abbreviates
`.ufo/waves/round-31/w1/`; every path is relative to the lane root. Disposition vocabulary: **carried** — round 32
owns it and it is not repaired here; **corrected here** — this block *is* the correction (`.ufo/waves/round-31/claims.json`
is frozen before data, so a claim-prose defect can only be recorded, not edited); **no action** — with the reason.
Nothing in this block changes a frozen counter, a claim predicate, a control or a measured reading.

### C1 — the claimed surface and the axis

- **E1 — the "held ground before" sentence is wider than the corpus.** `claims.json` §claims[0].surface says "no entry
  gives a sourced numeric threshold for any decision"; `corpus/knowledge/host-published-rate-limit-headers.md:96`
  ("All bots can make up to 50 requests per second to our API."), `:97` (interaction endpoints exempt from the global
  budget) and `:105` ("a documented 10,000 per 10 minutes") are sourced numbers attached to a recording rule, and
  `w1/ScoutProvince.md` §1 itself names `:102-107` "the only sourced rate threshold held". [w1/CritC1Axis.md Q1]
  **Corrected here:** the true sentence is "no entry maps an observed signal to a driver action with a sourced numeric
  threshold", which is what the round added; the frozen claim text keeps the wider wording and must not be quoted as if
  it were precise.
- **E2 — actor and scope of the GitHub numbers.** The primary/secondary quotas, the point costs and the concurrency cap
  are policy for authenticated REST API clients, not browser-session pacing; a row that omits "GitHub's own API" reads as
  a web-wide rule, and `wait`/`backoff` rows must not read as a self-granted budget (approval table C6 unchanged).
  [w1/CritC1Axis.md Q4] **Corrected here** by QUALITY criterion 80 (`corpus/QUALITY.md:457`): "The row names the actor and
  the scope the source binds the number to (a vendor's policy is that vendor's, at the access date)." No further action.
- **E3 — example values are admitted as thresholds, and control J4 does not see them.** A fixture of eight rows, seven
  of them scope-misread, reads `population 8, admitted 7, failing 1` under `--live` (the single failure is a fabricated
  number absent from its quote), and every admitted row was re-fetched live by the counter at 08:39:56Z and still passed
  `l1-live`: RFC 9309's parenthetical "(for example, 30 days)" taken as a rule, the same span with "for example"
  truncated away, RFC 6585's `Retry-After: 3600` and the sample body's "50 requests per hour", GitHub's 5,000/h and its
  one-minute fallback read as web norms, and a number lifted from the denominator of a different rule (60 seconds out of
  "90 seconds of CPU time per 60 seconds of real time"). `q1`'s 25-word ceiling rewards exactly the truncation that
  deletes "for example", and `n1` only asks that the digit occur somewhere in the quote; the same seat reached
  `admitted 11, failing 0, exit 0` with rows built only from genuinely stated bounds. [w1/CritSourceChoice.md §5]
  **Corrected here** as a rule by criterion 80 (`corpus/QUALITY.md:457-465`: "A sample or example value (a specimen
  response block, an illustrative figure) sources no row; an RFC example period kept as a row says 'example' in its own
  cells."); **carried** as counter v2 with that fixture as the red state and the eleven-row table as the green one.
- **E4 — criterion 80's boundary case is undecided: the lower-case modal.** D14 quotes "you should not make another
  request" and carries a `(derived)` marker, although criterion 80 counts "a directive the page addresses to its reader"
  as force, which would make the row a stated bound rather than a derived one. [w1/ScribeEntryProse.md §"(derived)
  markers", boundary case] **Carried** — the wave-2 row read must rule on lower-case `should`; the criterion does not say.
- **E5 — M7's evidence pointer cites a constant nothing reads.** `corpus/lessons/round-31.md:212` says "the window's tally
  detector is `TALLY_PATTERNS` (`scripts/check-selfassessment.mjs:122-127`)"; `TALLY_PATTERNS` is defined at `:122` and
  never referenced anywhere in the file (one grep hit), while the live claim extraction is inline in `m1Findings`
  (`:189`, patterns at `:199` and `:203`). [w1/RevCountersCode.md C2-7; verified at `4860483`] **Corrected here:** the
  `cli_cases` gap M7 describes is unchanged, and its pointer is `scripts/check-selfassessment.mjs:189-203`, not
  `:122-127` — class `reference-drift` inside the lesson itself.

### C1 — the `--live` oracle

- **E6 — `--live` attests the environment, not the cited origin.** `spawnSync("curl", …)` resolves `curl` through `PATH`
  and inherits the environment; `-q` disables only `.curlrc`. With `HTTPS_PROXY` plus `SSL_CERT_FILE` pointing at a
  loopback CONNECT MITM, the frozen counter admits the real S121 URL with zero packets reaching GitHub (arm A3: exit 0,
  `admitted 1`); a fake `curl` earlier in `PATH` does the same (A5), and `%{url_effective}` reports the *requested* URL,
  so the same-host guard (`scripts/check-decision-table.mjs:212`) is satisfied by construction. The measurement rule's
  "clean checkout" requirement does not scrub the environment. [w1/SentinelC1Live.md F1] **Carried** — the smallest fix
  is named in the seat report (`--proxy ""`, a fixed `--cacert`, an absolute binary plus a minimal child `env`); until
  then a `--live` reading may not be quoted as "the cited host still says this".
- **E7 — a 200 page that merely echoes the quote passes `l1-live`.** A soft-404 body ("We could not find that page … Your
  query matched: <quote>") is admitted (fixture fx2: exit 0, `admitted 1`), and `normalise` strips `<script>`, so a quote
  present only in JSON is invisible — the mirror-image false negative. [w1/SentinelC1Live.md F2] **Carried** — `l1-live`
  cannot distinguish "the document still says it" from "the host serves the string somewhere"; a canonical-URL or digest
  oracle is a different, stronger instrument.
- **E8 — the fetched URL need only be a substring of the cited source cell.** `scripts/check-decision-table.mjs:251` tests
  `rows.get(id).source.includes(rc.url)` and then fetches the *receipt's* url, so a prefix URL (site root, directory
  index, redirector) can be fetched while the row cites the document (fx5: exit 0, `admitted 1`). [w1/SentinelC1Live.md
  F3] **Carried.**
- **E9 — two unparseable hosts compare equal.** `hostOf` returns `null` on a parse failure and `:212` tests inequality, so
  `null !== null` passes the guard vacuously; no repro was found because curl rejects the same authorities Node rejects.
  [w1/SentinelC1Live.md F4] **Carried, low** — one-line fix `if (!a || !b || a !== b) return false`.
- **E10 — every fetch failure reads `l1-live`, including a 403/429 from the rate-limiting host.** Dead link, TLS failure,
  absent `curl`, host refusal and "the quote is gone" are one verdict with stderr discarded. That matters here
  specifically: an unauthenticated `--live` can be refused by the very mechanism the table documents. [w1/SentinelC1Live.md
  F5] **Carried** — the verdict word carries no diagnostic, so a `--live` pass and a `--live` refusal are equally
  uninformative about cause.
- **E11 — `-q` is effective only as argv[0].** Verified both directions by the seat (`HOME` trap and `CURL_HOME`); any
  reordering of `curlFetch`'s argv silently re-enables `.curlrc`, which can add `--output`, `--resolve`, `-k` or
  `--config`. [w1/SentinelC1Live.md F6] **No action** — holds as written at `4860483`; recorded as the constraint any
  future edit to that argv must preserve.

### C1 — counter software

- **E12 — uncaught `RangeError` on an out-of-range numeric entity.** `scripts/check-decision-table.mjs:141`
  (`String.fromCodePoint`) throws on `&#1114112;`; `normalise()` runs before any quote check, so one malformed entity in
  a cited page's committed bytes kills the process with a stack and exit 1, no `DECISION_TABLE verdict=` line — and
  exit 1 is the declared "failed" code. Fail-closed, but the verdict contract is violated and every row is discarded.
  [w1/RevCountersCode.md C1-1] **Carried.**
- **E13 — silent Markdown table parse failures.** An escaped pipe `\|` yields a 7-cell row that fails as `t2-signal`
  (misattributed cause); a data row without a trailing `|` truncates the table silently (population 0, no diagnostic);
  only the first header-matching table is read and the scan is not code-fence-aware. [w1/RevCountersCode.md C1-2]
  **Carried**; **no live effect at `4860483`** — the landed entry has no fenced block and 13 parsed row lines
  (`evidence/verify-at-4860483.txt`).
- **E14 — a registry row carrying a literal `|` is skipped, then reported `r1-row-missing`.** [w1/RevCountersCode.md
  C1-3] **Carried**; S119–S122 parse (population 13).
- **E15 — the `--live` cache is keyed on `(url, quote)`,** while the header claims one GET per cited url; two rows sharing
  a URL with different quotes fetch twice. [w1/RevCountersCode.md C1-4] **No action** — doc drift only.
- **E16 — closed-vocabulary gaps:** `retries` has no singular `retry`, `backoff` rejects "back off", `numbersIn` lacks
  forty/fifty/eighty/thousand/million, scientific notation is unsupported. [w1/RevCountersCode.md C1-5] **Carried** —
  false negatives only, author-controlled.
- **E17 — the C1 counter's `git()` lacks the `GIT_CONFIG_GLOBAL/SYSTEM` scrubbing the C2 counter has, and `curlFetch`
  inherits the operator environment.** [w1/RevCountersCode.md C1-6] **Carried** with E6.

### C2 — the calibration counter

- **E18 — `could-not-evaluate` never fails the gate, so the target is vacuously reachable.** `clean` is
  `counted.length === 0` (`scripts/check-selfassessment.mjs` `evaluate` 438-446 per the seat, `main` ≈881), so a run in
  which *every* comparison is refused exits 0 with `mismatches 0` (probe P5: `couldNotEvaluate 2`, `mismatches 0`,
  exit 0); the claim's `jq '{mismatches, counted}'` drops `couldNotEvaluate` entirely. [w1/RevCountersCode.md C2-3]
  **Carried** — the after-0 at `4860483` is a statement about counted comparisons only; the round's reading records
  `couldNotEvaluate 103`, the same as the freeze.
- **E19 — the oracle ignores the gate's exit code and passed count.** A gate printing `verdict=failed cases=13 passed=11`
  with exit 3 still yields tally 13, so a document claiming 13/13 is clean against a broken gate (probe P6).
  [w1/RevCountersCode.md C2-4] **Corrected here** as a rule by criterion 81 (`corpus/QUALITY.md:472`: "a summary whose
  verdict is not `clean` is not a tally"); **carried** as enforcement — the frozen counter has no verdict test.
- **E20 — the claim grammar is narrower than the header documents.** Line-level claims accept `cases=N` but not
  `cases: N` (probe P4); the fraction shape is anchored within 24 non-pipe characters of `--selftest` (P7); bare `N/M`
  is never claimed — while `statedTallyNumbers` accepts the colon form, so the two grammars disagree. [w1/RevCountersCode.md
  C2-5] **Carried.**
- **E21 — four small items, one line each.** `GIT_DIR`/`GIT_WORK_TREE` and the m2/m3 spawns are not scrubbed; `TALLY_PATTERNS`
  (`:122`) and `statSync` (`:71`) are dead code (see E5); exit 3 is undocumented in the header's verdict table;
  `m3Findings` reads the `--rev` blob while `git status --porcelain` runs on the live worktree. [w1/RevCountersCode.md
  C2-6, C2-7, C2-8, C2-9] **Carried, low** — the measurement rule's clean checkout at REV covers the last one.
- **E22 — a live stale tally the counter cannot see.** `SKILL.md:1559` still reads "eight isolated CLI cases assert exit
  and stable finding"; the gate measures `cases=12` and `SKILL.md:2469` says so in prose ("the earlier \"eight isolated
  CLI cases\" figure is superseded") **without citing `:1559`**, which the frozen rule cannot credit — a correction must
  cite the line. [w1/CritC2Counter.md FN-1; verified at `4860483`] **Carried** — the after-0 at `4860483` does not cover
  this line; the durable fix is an append citing `SKILL.md:1559` with the freshness tally in a *parsed* shape (word
  numerals are invisible to the detector).
- **E23 — seven tally-bearing lines produce no claim at all.** `SKILL.md:1559, 1988, 2030, 2031, 2032, 2474` and
  `corpus/README.md:591` are written in shapes the grammar does not parse (`--self-test`:N, `cases: N`,
  `selftests N/N`, `cli_cases=N`, word numerals, digits fused to a word). [w1/CritC2Counter.md FN-2] **Carried**
  (counter v2 grammar); `cli_cases=` is the same finding as M7.
- **E24 — the coverage boundary is 103 refusals, 27 of them m1.** At the freeze reading: 24 claims refused as "ambiguous
  script association" and 3 naming scripts outside `RUNNABLE_GATE = ^scripts/(check-[a-z0-9-]+\.mjs|round-evidence-audit\.mjs)$`,
  which can never count `scripts/freshness-witness.mjs`, `scripts/webmcp-*.mjs`, `scripts/selftest-measurement-binding.mjs`
  or any `.ufo/waves/**` gate. [w1/CritC2Counter.md FN-4; w1/CritC2Axis.md F4; w1/ExecC2Oracle.md §Risks 2-3]
  **Carried** — "mismatches 0" must be quoted together with this residual, never as "all statements verified".
- **E25 — two scripts on one line are compared, not skipped — the landed README row has it backwards.**
  `scripts/check-selfassessment.mjs:221-227` pairs `claims[0]` with *every* script named on the line (fixture F1:
  claimed 13 against observed 7, counted, exit 1); a claim is refused as could-not-evaluate only when its line names no
  script and its section names more than one (`:216-218`). The frontier row landed at `4860483` says "multi-script lines
  stay unchecked" (`corpus/README.md:686`). [w1/CritC2Counter.md FP-1; verified at `4860483`] **Corrected here:** the true
  statement is "a line naming N scripts is compared against the first tally on it for each of them — a false-mismatch
  source — and only an unsectioned, single-tally line is refused as ambiguous"; **carried** as a counter v2 case.
- **E26 — a receipt or population count on a gate-naming line is read as a self-test tally.** Fixture F2 counts
  "real12-case/four-control receipt" against the gate's tally; the LOG window already needed a prose withdrawal for the
  66-case round-19 population (`LOG.md:1090`, `:1103` → withdrawal at `:1912-1918`). [w1/CritC2Counter.md FP-2]
  **Carried** — no live instance in the landed sections, and any appended receipt count on a gate-naming line will be
  read as a tally.
- **E27 — supersession's "stated number" is not bound to its script.** `statedTallyNumbers` accepts any `N/M` anywhere in
  the correction paragraph, so a date (`10/26`, fixture F6) or a round range (`round-30/31`, F9) clears a stale line. The
  frozen code comment at `scripts/check-selfassessment.mjs:233` names the looseness ("or restates the figure").
  [w1/CritC2Counter.md SG-1] **Carried** — the corrections landed at `4860483` state real tallies, so no live mis-clear,
  but a wrong figure could be retired next round by a coincidental number.
- **E28 — the correction marker matches "incorrectly".** `/supersed|correct/i` clears a line from a paragraph that says
  "Incorrectly cited above" (fixture F7). [w1/CritC2Counter.md SG-2] **Carried, low.**
- **E29 — one script per correction paragraph is the only shape that works.** A paragraph naming two scripts and stating
  both tallies clears both stale lines but is then counted as the second script's claim (fixture F3, exit 1).
  [w1/CritC2Counter.md SG-3] **No action** — the `4860483` SKILL.md corrections use one bullet per stale line, each
  naming one script (8 bullets; 0 naming two scripts, `evidence/verify-at-4860483.txt`); recorded as the convention the
  next round must keep.
- **E30 — the citations are positional, so an insertion undoes the landing.** One line inserted above `SKILL.md:1614`
  turns 0 mismatches into 9 (findings at 1615, 2480, 2515, 2516, 2530, 2531, 2544, 2545, 2546) and re-raises the
  freeze-corrected 2545. [w1/ConnClaims.md experiment 4] **Carried** — nothing may be inserted above a cited line after
  the corrections are written; the landed block sits at EOF, the shape that survives.
- **E31 — a claim whose script name and tally sit on different lines is silently not compared** (`mismatches 0` with one
  could-not-evaluate finding). [w1/ExecC2Verify.md reading (d)] **Carried** — the same class as E18: a zero can coexist
  with an unchecked statement.
- **E32 — the per-case `cases=2` trap is live in SCORECARD prose.** The round-30 gate-mutants self-test prints `cases=2`
  in a per-case refusal line before its own `cases=12` summary, and SCORECARD restates that trap in words; only the
  ambiguity rule keeps such a line out of the count, so any association or supersession change turns it into a false
  mismatch. [w1/ExecC2Oracle.md §Risks 2; SCORECARD.md §Round 31 — correction to the round-30 disposition] **Carried** —
  a second M8-shaped trap in the window, not a measured mismatch today.
- **E33 — the axis label is defensible but the signal column is narrower.** All nine counted lines live in `SKILL.md` and
  `corpus/README.md`; `AXES.md:15`'s signal column and the round prompt's calibration sentence name
  `SHONEN.md`/`SCORECARD.md`, and no *admitted* calibration delta had yet been outside SCORECARD (precedents
  `SCORECARD.md:1233`, `:1480`; the LOG-window attempt failed at `:1397` and was called unprovable at `:1439`). The
  measured quantity is a mismatch count, which is the §9 calibration form, and the window extension itself is
  operability-shaped rather than calibration credit. [w1/CritC2Axis.md F1, Q1-Q2] **Carried** — no bytes change; the
  C2 row should name the oracle repair as the discriminating move and the two documents as its input set, so the label is
  read with its counter-argument.
- **E34 — the round corrected 13 statements, not 9.** Nine pre-existing stale tallies are the claimed delta; four further
  statements (`SCORECARD.md:1439`, `:1465`, `:1486`, `SKILL.md:2545`) were corrected at the freeze because v2 moved the
  oracle 22 → 30 (freeze diff +6/0 and +19/0, no deletions). [w1/CritC2Axis.md F6, F3] **Corrected here** — "9" is the
  claim, "13" is the round's total; the `SCORECARD.md:1523` sentence is a routed correction, not part of either count.

### QUALITY criteria and the fault catalogue

- **E35 — the drafted criterion 82 is not landed.** It covers two measured gaps: `corpus/QUALITY.md` states gate tallies
  at criteria 65, 67, 74, 75 and 76, and `corpus/knowledge/webmcp-chromium-loopback-round-16.md` at one line, all outside
  the calibration window with no declaration saying so. [w1/ScribeQuality.md, criterion 82] **Carried** — the landing took
  criteria 80–81 only (`corpus/QUALITY.md` has 81 criteria at `4860483`; no `82.` line); the text is append-ready.
- **E36 — a gate that did not run reads as a tally of 0.** The oracle reads `cases=N` without reading `verdict=`, so
  `MEASUREMENT_BINDING_SELFTEST verdict=could_not_evaluate cases=0 reasons=0` (exit 2) would be taken as 0.
  [w1/ScribeQuality.md, reading (ii)] **Corrected here** by criterion 81's second clause; **carried** as enforcement
  (E19).
- **E37 — 16 of 60 mutants of the C1 counter's detector survive it.** 44 killed; survivors include `unit-ksep-2`,
  `unit-unanchored`, `r1-regex-drop`, `g1-idcheck-drop`, `g3-bytesnull-drop`, `q1-min-7`, `q1-max-24`/`-26`,
  `q1-max-drop`, `pt-length-drop` (full table and per-mutant diffs in `w1/MutC1Counter/MUTANTS.md`, `diffs/`).
  [w1/MutC1Counter.md] **Carried** to round 32's counter v2 catalogue — this extends M5's `survivor` class from the
  round-30 counters to the round-31 one.
- **E38 — three of the v2 counter's behaviours are stated but not proven able to fail.** 5 of 7 tasked mutants are killed
  (`m1` by the tasked case, `m3` by `v2-readme-no-section-fallback`, `m4` by `v2-readme-root-citation-not-corpus`, `m6` by
  four cases); survivors are `m2` (last summary line → first: criterion 81's "the last such line" clause has no case),
  `m5` (`citesLine`'s lookbehind removed) and `m7a` (the finding's `doc` field forced to `LOG.md`; the harness asserts
  classes, never the field). [w1/MutC2Counter.md] **Carried** — criterion 81 states the last-summary rule; nothing proves
  a gate printing two summary lines is read the way the criterion says.

### Assimilation and adjacency

- **E39 — the Gate never says lane S121 is the same URL as staged S126.** [w1/RevAssimDecision.md F-R1, R-must]
  **Corrected here:** lane S121 (`https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api`) is
  the same URL as staged S126 (refused in round 27, quarantine verdict `absent/refuse`); the row was opened by document
  with the lane's own fetch, bytes and located quotes, and staged S126 stays refused — not cleared, not superseded, not
  adopted.
- **E40 — the refusal bases are not interchangeable.** S187/S199 are campaign-local work files under `shokuknow/lanes/`
  (not re-openable public sources — a different basis from S126's absent-quote refusal), and S203 is a different document
  (`troubleshooting-the-rest-api`, not opened this round). The S126 flip condition remains a register fix or an operator
  ruling on the id drift. [w1/RevAssimDecision.md F-R5] **Corrected here**, one clause.
- **E41 — the adjacency evidence is not in the Gate.** kake already holds RFC 9309 (S011, S099) and declares client-side
  crawler discipline to be tabi's province (kake `PROVINCE.md:34-35`; `corpus/README.md:476`); mori holds RFC 6585 (S041)
  for provider seat-terminal classification; no sibling holds the GitHub REST pages — the only prior holder of that URL is
  tabi's own staged S126. No absorption occurred. [w1/ConnSiblings.md] **Corrected here** — the boundary declaration is
  the siting evidence for C1's depth reading; disposition stays "report, never absorb".

### Measurement hygiene

- **E42 — counter JSON is written to a file, never piped.** Piped to `jq`, the counters can exit before stdout drains and
  the JSON arrives truncated (observed by the L1 this round; restated in the a2w1 ticket). **Corrected here** — the
  measurement form is `node … > "$S/x.json"` followed by a read of that file.
- **E43 — a freeze reading is not an after-measurement.** The no-harm matrix is green at `9505a10` (six checks exit 0;
  21/21 gate self-tests exit 0) and the four live pages were byte-identical on three fetches 130 s apart
  (span 261 s) — but identity was measured over 261 s, not to closure, and only a REV measurement may be quoted as the
  round's. [w1/ExecNoHarmBaseline.md; w1/ExecLiveStability.md] **No action** — recorded so the freeze reading is never
  promoted.
