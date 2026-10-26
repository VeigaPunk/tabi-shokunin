# QUALITY.md — append-ready criteria, round 31 (seat ScribeQuality, wave w1)

Target file: `corpus/QUALITY.md` in the lane root. Owner of the append: the tabi L1 — a seat
never edits lane tracked files, so nothing here is applied.

Numbering. The highest criterion at the freeze (`9505a10eb80b2a0b273ebaba3f7f872ad302192d`) is 79
at `corpus/QUALITY.md:446` (`grep -nE '^[0-9]+\. ' corpus/QUALITY.md | tail -1` → `446:79.`); the
file is 453 lines. **80, 81, 82 are the next free numbers.** Every criterion is append-only, so this
block goes after line 453 and no line above it moves (criterion 78: an insertion above a cited line
shifts every later citation).

The three criteria carry the round's three load-bearing findings: C1's threshold rule (80), the
round-30 M8 oracle rule (81), and C2's window scope (82).

---

80. A decision-table row counts only when its threshold is the source's own number and the quote
    that carries the number also carries the force the row's decision rests on, in one of three
    stated classes — the source's normative keyword in capitals (`MUST`, `MUST NOT`, `SHOULD`,
    `SHOULD NOT`, `MAY`, RFC 2119/8174 sense), the registry page's directive addressed to the caller
    (an imperative, or a conditional "you should not"; lower case counts here and only here), or the
    source's declared limit, which the row marks in its Decision cell as derived (`cap (derived)`)
    with the derivation stated once in the entry's prose — and the row names the actor and the unit
    window or host the source binds the number to; a quote that is a sample or example value (a
    specimen response block, an illustrative figure) sources no threshold in any class, because its
    number is an instance and not a statement, so a row resting on one is re-sourced rather than
    marked. Check: `node scripts/check-decision-table.mjs --rev <REV> --baseline
    96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc --entry corpus/knowledge/rate-signal-decision-table.md
    --live --json | jq '{population,admitted,failing}'` proves the number and the located span
    (`n1-threshold-sourced`, `q1` 6–25 words, `q2`) and nothing more — the counter's own case
    `threshold-thousands-separator` admits `| D3 | \`x-ratelimit-limit\` | cap | 5000 requests |
    S002 | "The limit is 5,000 requests per hour." |`, a value-reporting quote, so `failing 0` is
    necessary and not sufficient; the force class per row is `awk -F'|' '/^\| *D[0-9]+ *\|/ {q=$7;
    c=(q ~ /MUST|SHOULD|MAY|REQUIRED|RECOMMENDED/) ? "UPPER" : (tolower(q) ~
    /must|should|may|required|recommended|do not|never/) ? "lower" : "none"; printf "%s %s\n", $2,
    c}' corpus/knowledge/rate-signal-decision-table.md` — `UPPER` is the class immediately,
    `lower` counts only when the reader sees the sentence addressed to the caller, `none` requires
    the derived marking and the entry's prose — and scope is read against each row's `scope` cell in
    `corpus/SOURCES.md`; no lane instrument reads either the class or the scope. (lesson:
    corpus/lessons/round-31.md#mistakes — the C1 threshold rule; claim C1; control
    `.ufo/waves/round-31/baseline/c1-J4-invented-thresholds.json` shows the counter reaching an
    author's number and therefore not an author's force or scope; `scripts/check-decision-table.mjs`
    cases=34)

81. The oracle for a gate's self-test tally is that gate's own summary line —
    `<NAME>_SELFTEST … verdict=clean|failed … cases=N` — never the first `cases=` token in its
    output, never one of the per-case lines that share the same `<NAME>_SELFTEST` prefix, and never
    a summary whose verdict is `could_not_evaluate` or `blocked`, since `cases=0` there records that
    the gate did not run and a reader that takes it as a tally turns "not run" into "zero cases".
    Check: `for s in $(git grep -ohE 'scripts/(check-[a-z0-9-]+|round-evidence-audit)\.mjs' --
    SKILL.md SCORECARD.md LOG.md corpus/README.md | sort -u); do out=$(node "$s" --self-test 2>&1);
    printf '%s verdict_lines=%s with_cases=%s\n' "$s" "$(printf '%s\n' "$out" | grep -cE
    '^[A-Z][A-Z0-9_]*_SELFTEST\b[^\n]*\bverdict=')" "$(printf '%s\n' "$out" | grep -E
    '^[A-Z][A-Z0-9_]*_SELFTEST\b[^\n]*\bverdict=' | grep -cE '\bcases\s*[=:]')"; done` must print
    `verdict_lines=1 with_cases=1` for every script (27 distinct scripts at the freeze; it runs one
    self-test per gate, so it is slow). (lesson: corpus/lessons/round-30.md#mistakes M8; routed
    round-30 verifier defect 2; able-to-fail state `.ufo/waves/round-31/baseline/m8-proof/` — the
    v2 case `v2-oracle-reads-summary-line-not-first-cases-token` fails at 28/30, exit 3, with the
    summary-line oracle removed; measured at the freeze: `scripts/check-aria-metadata.mjs` prints 62
    `ARIA_METADATA_SELFTEST` lines, one with `verdict=`, none with `cases=`, and its summary reads
    `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4`, so it is outside the oracle;
    `scripts/check-measurement-binding.mjs --self-test` prints
    `MEASUREMENT_BINDING_SELFTEST verdict=could_not_evaluate cases=0 reasons=0` and exits 2 when its
    child script is absent)

82. Every lane document that states a gate tally is either inside the calibration window —
    `SCORECARD.md`, `LOG.md`, `SKILL.md`, `corpus/README.md`, the four documents
    `scripts/check-selfassessment.mjs` reads — or carries a sentence that begins with its own path
    and reads "`<path>` is outside the calibration window", followed by what its tallies then are
    (a cited round's reading, a probe's count, a superseded figure); a tally outside the window with
    no such sentence is drift no instrument reads. Check: `git ls-files '*.md' | grep -vE
    '^(\.ufo/|corpus/lessons/|corpus/evidence/)' | xargs grep -nHE '(--self-?test[^|]{0,24}\([0-9]+/[0-9]+\)|[0-9]+-case\b|\bcases\s*=\s*[0-9]+|\b[0-9]+\s+(isolated\s+)?(CLI\s+)?cases\b)'
    | grep -E 'scripts/[A-Za-z0-9_./-]+\.mjs' | grep -vE
    '^(SCORECARD\.md|LOG\.md|SKILL\.md|corpus/README\.md):' | cut -d: -f1 | sort -u | while read -r
    f; do grep -qF "$f is outside the calibration window" "$f" || echo "$f"; done` must print no
    path. The population is the command's own predicate — a tally shape on a line that also names a
    `scripts/*.mjs` — with the dated-record trees `.ufo/`, `corpus/lessons/` and `corpus/evidence/`
    excluded and counted, because those are transcripts of a named round and are never restated
    (330 tally lines in 177 tracked documents at the freeze); the four shapes are the counter's own,
    so a bare `cases=N` inside another word (`cli_cases=36`) is not a tally statement and matches
    none of them. (lesson: claim C2 and the frozen v2 window; corpus/lessons/round-30.md#mistakes M8
    for the drift class this scope leaves unread; at the freeze the command prints two paths —
    `corpus/QUALITY.md` (5 lines, in criteria 65, 67, 74, 75 and 76) and
    `corpus/knowledge/webmcp-chromium-loopback-round-16.md` (1 line, "11/11 cases pass" for
    `scripts/webmcp-loopback-round16.mjs`, a script outside the counter's runnable gate set) — with
    no declaration in either, so this criterion lands over two known gaps instead of behind a clean
    reading)

---

## Measurements behind the block

All readings were taken in one scratch clone of the freeze commit
(`git clone --shared <lane> "$S/clone"` then `git -C "$S/clone" checkout -q 9505a10…`; `git status
--porcelain` → 0 lines before and after every run; `TMPDIR=$HYAKU_SCRATCH/tabi-r31/ScribeQuality/tmp`).
No network fetch was needed: every command reads committed bytes or a gate's own self-test.

| Reading | Command | Exit | Result |
|---|---|---|---|
| numbering | `grep -nE '^[0-9]+\. ' corpus/QUALITY.md \| tail -1` | 0 | `446:79.`; file 453 lines |
| C1 counter self-test | `node scripts/check-decision-table.mjs --selftest` | 0 | `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34` |
| counter admits a value-reporting quote | case `threshold-thousands-separator` in `scripts/check-decision-table.mjs:354` | — | `exit 0, admitted 1` on `"The limit is 5,000 requests per hour."` |
| force-class awk, fixture rows | fixture `t.md` with a `MUST` row, a value row, a lower-case conditional ("you should not") row and an example-response row, command from criterion 80 | 0 | `D1 UPPER`, `D2 none`, `D14 lower`, `D6 none` |
| tally population (criterion 82) | pipeline above, stop after `cut -d: -f1 \| sort \| uniq -c` | 0 | 6 documents, 66 lines: SKILL.md 32, SCORECARD.md 26, corpus/QUALITY.md 5, corpus/README.md 1, LOG.md 1, corpus/knowledge/webmcp-chromium-loopback-round-16.md 1 |
| gap (criterion 82) | full pipeline above | 0 | prints `corpus/QUALITY.md` and `corpus/knowledge/webmcp-chromium-loopback-round-16.md` |
| declaration red→green | same pipeline after appending one declaration sentence to each of the two clone copies, then `git checkout --` both | 0 | red: two paths; green: no path; clone restored to 0 porcelain lines |
| dated-record trees, excluded class | same shape grep over `git ls-files '*.md'` restricted to `.ufo/`, `corpus/lessons/`, `corpus/evidence/` | 0 | 330 lines in 177 documents |
| window scripts (criterion 81 population) | `git grep -ohE 'scripts/[a-z0-9-]+\.mjs' -- SKILL.md SCORECARD.md LOG.md corpus/README.md \| sort -u \| wc -l` | 0 | 27 |
| summary-shape survey, 3 of 27 | criterion 81 loop on `check-aria-metadata`, `check-measurement-binding`, `check-sources` | 0 | `1/0`, `1/1`, `1/1` |
| aria summary shape | `node scripts/check-aria-metadata.mjs --self-test` (output kept) | 0 | 62 `ARIA_METADATA_SELFTEST` lines, 1 with `verdict=`, 0 with `cases=`, 0 `N/M`; summary `verdict=clean cli_cases=36 helpers=4` |
| could-not-evaluate prints `cases=0` | `mv scripts/selftest-measurement-binding.mjs` aside in the clone, `node scripts/check-measurement-binding.mjs --self-test`, restore | 2 | `MEASUREMENT_BINDING_SELFTEST verdict=could_not_evaluate cases=0 reasons=0`; stderr `selftest child absent: …` |
| frozen C2 counter at the freeze (cross-check of `baseline/c2-J1-do-nothing.json`) | `node scripts/check-selfassessment.mjs --rev 9505a10… --json` | 1 | `mismatches 9`, `couldNotEvaluate 103`, `superseded 20`, 174 findings; could-not-evaluate reasons: 76 "command outside the closed re-run grammar", 24 "ambiguous script association", 3 "script outside the runnable gate set" |

Receipts copied beside this file: `receipts/aria.out`, `receipts/self-freeze.json`,
`receipts/dt-selftest.txt`, `receipts/mb-could-not-eval.out`, `receipts/window-scripts.txt`,
`receipts/dated2.txt`.

## Notes for the integrating L1

1. Criterion 82 lands over two gaps and names them. Closing them is one sentence per document:
   `corpus/QUALITY.md is outside the calibration window: …` and
   `corpus/knowledge/webmcp-chromium-loopback-round-16.md is outside the calibration window: …`.
   The red→green run above shows the pipeline clears once both sentences exist. Whether the
   sentence goes into QUALITY.md at all is the L1's call; the criterion is honest either way,
   because it states the gap rather than assuming it away.
2. Criterion 80 adds a drafting constraint to C1's rows that the frozen counter does not enforce:
   a row whose quote carries no normative token must mark its decision as derived and the entry must
   carry the derivation sentence. `ScribeEntryProse` was told before integration; the counter will
   still read such rows as admitted, so nothing else catches it.
3. Coordination, after the peer applied the shape (15-row hand-off): `ScribeEntryProse` marked 9
   rows `(derived)` (D4, D6–D12, D14) and asked two questions, both settled here. (a) Case: a
   lower-case "you should not" in a conditional is the page's directive, so it is class `lower` —
   admissible as a quoted force, not a derived one; D14's marker is therefore unnecessary (harmless
   if kept, but the row reads more strongly without it). The capitals check stays for RFC 2119
   keywords, because a lower-case "should" in descriptive prose is not normative. (b) Example
   values: a specimen response block such as D6's `HTTP/1.1 429 … Retry-After: 3600` is class
   `none` **and** inadmissible — an instance, not a statement — so D6 is re-sourced to a sentence
   that states the wait (RFC 6585 §4's "ought to wait" sentence, or an imperative) rather than
   marked; folding it into `(derived)` would let a sample value pass as a declared limit.
   Recorded from the peer's message, not verified against its files: `entry-prose.md` sha256
   a660ac57…, `sourced-thresholds.md` sha256 0c1ddb3a….
4. Criterion 81's survey is slow (one self-test per window-stated script). It is written to be run
   at landing, not per row; the aria reading is the reason it exists: two window lines state a tally
   the counter's oracle cannot measure, and `could-not-evaluate` is not a pass.
5. Criterion 82's shape list is the counter's, not a new invention: `--self-test … (N/M)`, `N-case`,
   `\bcases=N`, `N [isolated] [CLI] cases`. A super-set shape (the one I first wrote, without
   `\b`) matches `cli_cases=36` and over-states the population by two documents; the block uses the
   counter's shapes.
