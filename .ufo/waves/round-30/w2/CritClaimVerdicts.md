# CritClaimVerdicts — C1/C2 verdict audit (round 30, wave 2)

Seat `CritClaimVerdicts` (critic, attack). Attacked: the verdicts a round-30 L1 will report —
**C1 met (27/27 killed, 0 benign)** and **C2 met (2/2 live)** — measured at the lane tip
`072af95fe2822f0785a6ff88a578e2142dd258e5`, given the two wave-1 holes (C1: the frozen counter
leaks mutant identity to the code under test, `.ufo/waves/round-30/w1/CritC1Counter.md`;
C2: `--live` accepts `file://` and follows off-host redirects,
`.ufo/waves/round-30/w1/CritC2Counter.md`, `SentinelFetchScope.md`). Receipts and every command
with its exit code: `CritClaimVerdicts/RECEIPTS.md`, raw outputs beside this file.

## Verdict (one paragraph)

**Both claims verify as frozen, and both verdicts as they are likely to be worded are one row too
strong.** I re-ran the two exact counting commands at the tip in a clean shared clone with the
frozen counter and catalogue bytes (sha256 identical to `claims.json:frozenDigests`): C1 exits 0
with `fault_total 27, fault_survivors 0, benign_total 13, benign_killed 0`, both pristine
self-tests clean (s106 10/10, release-pins 29/29); C2 exits 0 with `population 2, admitted 2,
failing 0`. The frozen kill rules read only those numbers, and both are met. What the numbers do
not carry is attribution, and there the two holes bite differently. For C1 the round's fix is
genuinely behavioural — 26 of 27 faults fail a **named case that builds a fixture and asserts the
mutated field or the pinned refusal reason**, and no added line reads `process.cwd()`, the
environment, `/proc` or the gate's own bytes — but the 27th, `pins-f3-bytes-absent`, is killed by
a **gate abort** (`cases:null, failing_cases:[]`, reproduced as
`TypeError … Received null`), so `corpus/README.md:652`'s "every catalogued fault … is killed by a
self-test case" is false for one row, and the compensating check the lesson promises (read
`failing_cases` per fault, M5) cannot certify it either. For C2 the receipts survive the
counter's holes on their own evidence: both are `https://`, equal their rows' urls, 200,
byte-accounted, and the same command **fails 0/2 inside `unshare -Urn`** (exit 1), so no `file://`
pass is in play; my own third fetch at 07:47:49Z returns S116 byte-identical and S117 at the same
408912 B with only the Cloudflare `__CF$cv$params` nonce changed, which is the provenance the
normalised-equality hole (F2) cannot require. No axis is harmed by the round's edits in a way that
overturns a claim; three bookkeeping defects are real and cheap: the README/M5 attribution
sentence, `QUALITY.md:430-434` (criterion 77) violated by `corpus/lessons/round-30.md`'s own M5/M6
rows, and the absent SCORECARD per-claim rows and LOG round-30 entry that §2.5 of the round
contract requires at lands.

## 1. Does each claim still verify **as frozen**?

The frozen predicate is a counting predicate over the frozen bytes, and the ordering the round
defends (counter, kill rule and predicate declared before data, prompt §2/§9) is intact: the
thresholds, the two `frozenDigests`, the controls and the `notClaimed` list were committed in
`061e6202` *before* any measured bytes, and `git log --stat 061e6202..072af95f` shows no counter
or catalogue edit afterwards. Measured:

```
$ sha256sum clone/scripts/{check-gate-mutants.mjs,gate-mutants.json,check-frontier-admission.mjs}
02945f88…3a55   cd1c27a2…3833   cadef57e…9eca          # all three = frozenDigests
$ node scripts/check-gate-mutants.mjs --rev 072af95… --json                 exit=0
  {"fault_total":27,"fault_survivors":0,"benign_total":13,"benign_killed":0,"clean":true}
$ node scripts/check-frontier-admission.mjs --rev 072af95… \
    --frontier rate-tos-signal --since 2026-10-26 --live --json             exit=0
  {"population":2,"admitted":2,"failing":0,"clean":true}
```

So: **C1 and C2 verify as frozen — yes, literally, and the do-nothing/trade controls still read
"not met"** (14 survivors and 0/0 respectively in `measure/`). The invitation to attack is not the
counts; it is the sentence that says what the counts mean. Three of those sentences exist at the
tip and two are wrong:

| sentence at tip | status |
|---|---|
| `corpus/README.md:652` "every catalogued fault … is killed by a self-test case" | **false for 1 of 27** (`pins-f3-bytes-absent` — crash kill) |
| `corpus/lessons/round-30.md:143` (M5 fix) "the wave-2 kill-attribution audit … certifies each killing case builds a fixture and calls `evaluate()`" | **the named instrument cannot certify that row**: its `failing_cases` is empty because the gate dies before printing the case table; a report that says "27/27 certified by attribution" is fabricating |
| `corpus/README.md:651` (rate/ToS "docs-held … runtime open") | holds — matches the entries and their `not measured` disclaimers |

## 2. C1 — kill attribution at the tip (the reading rule, applied)

`failing_cases` per fault from `c1-exact-cmd.json`, with the mutation each case targets
(`scripts/gate-mutants.json`):

| fault | killing case(s) | reads as |
|---|---|---|
| s106-sha-drop / -sha-true | `same-length-tamper-invalid` (+ `sha-mismatch-invalid`) | same byte length, different sha → `valid` must stay false: the sha term is load-bearing |
| s106-anchor-unique-drop / -true | `duplicate-anchor-invalid` | anchor twice, `occurrences_in_file:2` → `anchor_unique:false` |
| s106-byte-count-drop / -true | `receipt-byte-count-mismatch-invalid` | `decoded_bytes +7`, same bytes → `byte_count_match:false` |
| s106-revision-drop / -true | `measured-revision-bytes-mismatch` | measured rev ≠ committed bytes |
| s106-anchor-located-true | `anchor-off-by-one-invalid` | located-by-off-by-one fixture |
| pins-f1-old-tag | `f1-old-tag-not-carried-by-row-unresolved` (reasons `f1-old-tag`) | reason pinned in order |
| pins-f2-path-binding / -traversal | `path-not-bound-unresolved` / `f2-dotdot-inside-filename-unresolved` | path binding, `..` in a filename |
| pins-f3-bytes-path / -sha | `new-bytes-under-old-tag-unresolved` / `sha-mismatch-unresolved` | bytes identity |
| **pins-f3-bytes-absent** | **none** (`cases:null, passed:null, failing_cases:[]`, exit 1) | **gate abort** |
| pins-f4-range-bounds / -anchor-token | `f4-range-past-last-old-line-unresolved` / `f4-anchor-lacks-range-token-unresolved` | |
| pins-f5-digest | `digest-binding-mismatch-unresolved` | |
| pins-f6-refetch-seat / -sha / -all | `refetch-same-seat-unresolved` / `copied-old-as-new-caught-by-refetch` / +`refetch-missing-unresolved` | |
| pins-s1-supersession-prefix / -tag | `drift-superseder-teaches-without-prefix-unresolved` / `…-not-at-stable-tag-unresolved` | |
| pins-notfound-status / -body | `absence-404-present-with-marker-unresolved` / `…-body-lacks-marker-unresolved` | |
| pins-population-on-release / -tag-compare | `not-on-release-not-counted`, `empty-population-could-not-evaluate`, `pinned-at-stable-not-counted`, `drift-with-supersession-resolved` | |

All 13 benign rewrites stay green (`cases=29 passed=29`, exit 0 each), so the benign class is not
being tripped by the new cases. The assertions are behavioural, not exit-only: the s106 harness
compares `out[c.field] === c.fieldValue` (`scripts/check-s106-evidence.mjs:359-363`) and the pins
harness compares exit + `unresolved` + the ordered `reasons` prefixes
(`scripts/check-release-pins.mjs:491-493`) — which is what `QUALITY.md:421-428` (criterion 76)
demands, so the criterion's shape is honoured.

**The one kill that is not a case.** `pins-f3-bytes-absent` mutates the null guard
`if (ob === null || nb === null)` → `if (false)`. Applied to the tip gate in a scratch clone, the
selftest dies before printing any case:

```
TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument must be of type string … Received null
--selftest exit=1, no JSON report            (CritClaimVerdicts/mut-f3.stderr)
```

Since it is a survivor at the freeze (`measure/c1-before-at-freeze.json`, 14 survivors) and the
only test-side change since is the new `f3-old-bytes-never-committed-unresolved` fixture, the new
case is the proximate cause and the check is load-bearing — but no case *sees* the mutation, the
gate just cannot run. The counter's own design counts a crash as killed (its selftest case
`crash-counts-as-killed` expects exit 0 with survivors 0), so the frozen count is right and the
prose is wrong.

**Consequence for the verdict.** C1 is met on the frozen predicate; the attribution audit certifies
**26/27**, not 27/27, and the honest form of the number is "27/27 counted, 26 case-attributed,
1 gate-abort (fixture supplied this round, baseline survivor as the negative control)". Nothing
here needs a code change to be true; it needs two sentences corrected (README:652 and the M5 fix
text), which are the round's own artefacts and are in scope for its report.

**What the counter still cannot say (unchanged, named not fixed).** Identity leaks remain: the
counter places each mutant at `<work>/mutant-<index>` and passes `cwd` and the full environment
(`scripts/check-gate-mutants.mjs:142,148-152,215`), so a future one-line case could re-open the
wave-1 attack. The tip's added lines contain no such read (grep: zero hits for
`process.cwd|process.env|process.ppid|import.meta.url|/proc/|git show` in the diff of `38891ca0`),
and the byte-inventory family (B2) is unaddressed by any frozen check. That is a round-31 counter
problem and was correctly routed as M5, not claimed.

## 3. C2 — receipt-level provenance (the hole the counter cannot see)

The frozen counter accepts `file://` in production and follows cross-host redirects, so its green
is not evidence of a fetch. Three independent readings close that:

1. **No-network negative control** — same command, same bytes, `unshare -Urn`:
   `population 2, admitted 0, failing 2 (l1-live ×2), exit 1`. The passing reading therefore
   depends on the wire; no receipt is `file://`, and the J4 self-quote shape is not what passed.
2. **Receipt identity** — both receipt urls are `https://` and character-equal to their rows'
   `source` urls (`corpus/SOURCES.md:130-131`), HTTP 200, `sha256` matching the committed bytes
   (S116 `d6016dd0…`, 67097 B; S117 `b73dc7d1…`, 408912 B), refetch rows by a different seat than
   `fetched_by` (`ScribeEntryRateLimitFields` vs `FetchS159`; `ScribeEntryDiscordHeaders` vs
   `FetchS182`) with their own sha-matched bytes containing the quote.
3. **My own third fetch, 07:47:49Z, 0 redirects, effective url = url** — S116 byte-identical to
   the committed bytes (`d6016dd0…`, 67097 B); S117 same 408912 B, and the diff against the
   committed refetch is a single run: the Cloudflare `window.__CF$cv$params={r:'…',t:'…'}` nonce.
   A locally re-expressed text cannot carry a request-scoped nonce, so the committed S117 bytes
   are wire output and the raw-byte drift is a per-response token, exactly as the row discloses.

Quote grounding, wider than the counter's `entryQuotes` (double quotes only, ≤600 chars, body
lines only, fences dropped): I extracted every ≥4-word span in double, curly-double, single and
curly-single quotes — title line and fenced blocks included — and tested it against the entry's
own cited bytes and the sibling's (`CritClaimVerdicts/quote-audit.py`, output `quote-audit.txt`,
exit 0). **0 genuine unlocated spans**; no span located only in the sibling's bytes (the M1
cross-row attribution class is absent). All 17 double-quoted spans across both entries — the seven
header-table cells, the 41-word emoji-route passage and the 9-22-word body quotes — are `OWN`. Both receipt quotes are exactly 25 words and are
located in my 07:47:49Z fetch. S116's anchor lines hold: 302 `3. RateLimit-Policy Field`, 308-311
the quoted passage, 432 `4. RateLimit Field`, 444 the example.

Freshness of the round's own correction: the lesson's transform note (staged `-09` claimed "`-10`
and later return 404") is true in reverse today — `-09`, `-10`, `-11` return 200 and `-12` returns
404 at 07:48:27Z. The row's `-11` pin is the live tip of the archive.

## 4. Extra evidence an honest report needs (beyond the two counting commands)

1. **Kill-attribution table** (fault → `failing_cases` → what the case asserts), from the tip's
   `--json`, plus the **baseline negative control** (the same ids among the 14 freeze survivors)
   so "fixture caused the kill" is shown, not asserted. Include the **one crash kill** by name.
2. **The counter selftests** at the measured rev (`GATE_MUTANTS_SELFTEST 12/12`,
   `FRONTIER_ADMISSION_SELFTEST 24/24`, both exit 0) — otherwise the frozen bytes are not shown to
   be a working instrument.
3. **No-network `--live` control** (`unshare -Urn` → 0/2, exit 1). Without it, "with `--live`" is
   a claim about a flag, not about the wire; wave 1 proved the flag alone is satisfiable by
   `file://`.
4. **https-only, same-host receipts with status, byte count and sha256 for every fetch**, including
   the seat's own re-fetch, and the note that `fetched_by` ≠ refetch seat. Record the URL, UTC,
   status and sha of each — the report contract's "sources opened this round" row depends on it.
5. **The S117 dynamic-bytes diff** (nonce-only) as the provenance argument that survives F2, or an
   explicit sentence that the committed bytes may be a re-expression — the frozen predicate says
   "normalised text equal", so the report must not write "byte-identical live source" for S117.
6. **An independent quote audit wider than `entryQuotes`** (single/curly quotes, >600-char spans,
   title line, fences) with the unlocated count, since the counter's extraction has six documented
   blind spots and `q1` is the entry's only content check.
7. **The stale-anchor probe** (`-09/-10/-11` 200, `-12` 404) and the census reading with its
   warning class (`exit 0`, 19 × W04), because the frontier step's conformity line is the census,
   not the counter.

## 5. Is any axis harmed by this round's edits?

| axis | judgement | evidence |
|---|---|---|
| **operability** | holds | both counters exit 0 at the tip with frozen bytes; gates 10/10 and 29/29; s106 `valid=true`; pins population 23 resolved 23 |
| **coverage** | holds | 2/2 admitted live; no-network control 0/2; receipts and third fetch as above; S116/S117 `mined` with reciprocal `used-by` |
| **depth** | holds | entry quote audit 0 unlocated; no cross-row span; anchor lines verified |
| **freshness** | holds | archive probe; S117 nonce drift disclosed in the row itself; `recheck` 90d/180d set |
| **adjacency** | holds, one disclosure | census exit 0 but 19 W04 duplicate-url warnings; **S118 adds one** (same URL as S036; S118's `teaches` correctly opens `supersedes S044 —` per contract rule 2, and S044 stays `mined` as rule 2 allows). Of the 26 SOURCES rows added or changed in this round (23 `used-by` edits + S116/S117/S118), 8 name the id in prose only (S071, S074, S094, S096, S097, S099, S106, S118) — contract-legal, but S118's `mined` rests on a prose mention in an append block |
| **calibration** | **harmed (minor, fixable)** | (i) `corpus/README.md:652` states a stronger fact than the measurement (crash kill); (ii) `corpus/QUALITY.md:430-434` applies criterion 77 ("one table row and one subsection per number") and `corpus/lessons/round-30.md` has 6 table rows (139-144) against 4 subsections (146, 166, 185, 207) — M5 and M6 have none; (iii) the claimed noHarm reading `check-selfassessment … mismatches 0` is vacuous for C1's tallies: `counted: []`, `couldNotEvaluate: 124` — the real support is the SCORECARD append (1507-1508) matching my measured 10/10 and 29/29, which the report should say instead |

Nothing in these edits changes a counter, a frozen byte, a better-before number or another claim's
measurement, so C1/C2 separability is undisturbed (`ConnSeparability` holds as wave 1 found).

**Pending §2.5 obligations at the tip (not defects yet — the round is mid-wave):** `SCORECARD.md`
carries only the round-30 corrections block (1503-1508) and `LOG.md` has no round-30 entry at all
(tail is the round-29 commit ledger). The report contract requires per claim: score delta, evidence
pointer, counting command, measured commit, plus the motivating evidence in LOG.md. Without them
"C1 met" is measured but not recorded.

## 6. Proposed exact verdict wording

Copy the following into the report instead of the bare numbers.

> **C1 — met (attribution-qualified).** At `072af95fe2822f0785a6ff88a578e2142dd258e5`,
> `node scripts/check-gate-mutants.mjs --rev 072af95fe… --json` (cwd = clean clone,
> `git status --porcelain` empty, counter `02945f88…3a55`, catalogue `cd1c27a2…3833`, both =
> `frozenDigests`) exits 0 with `fault_total 27, fault_survivors 0, benign_total 13,
> benign_killed 0` (`clean:true`), and both gates' pristine self-tests are clean (s106 10/10,
> release-pins 29/29, exit 0); the counter's own selftest is 12/12. Because the frozen counter
> shows the code under test its mutant identity (run dir `mutant-<index>`, inherited `cwd`/env),
> the count is verified together with a kill-attribution audit of `failing_cases`: **26 of 27**
> faults fail a named case that builds a fixture and asserts the mutated field or the pinned
> refusal reason; the 27th, `pins-f3-bytes-absent`, is a **gate-abort kill** — the mutation
> `if (ob === null || nb === null)` → `if (false)` makes the selftest throw
> `TypeError … Received null` before the case table prints (`cases:null, failing_cases:[]`), and
> it is a freeze survivor killed only through this round's new absent-bytes fixture. The frozen
> kill rule reads neither `failing_cases` nor the crash class, so the attribution is evidence of
> record, not predicate. No benign rewrite is killed, and no added line reads `process.cwd`, the
> environment, `/proc`, `import.meta.url` or a git blob.

> **C2 — met (receipt-attested).** At `072af95fe…`,
> `node scripts/check-frontier-admission.mjs --rev 072af95fe… --frontier rate-tos-signal
> --since 2026-10-26 --live --json` (counter `cadef57e…9eca` = `frozenDigests`, selftest 24/24)
> exits 0 with `population 2, admitted 2, failing 0`. Because the frozen counter accepts
> `file://` and follows off-host redirects, the verdict rests on the receipts, not the green: both
> urls are `https://` and equal their rows' `source` urls, HTTP 200, committed bytes sha-matched
> (S116 `d6016dd0…`, 67097 B; S117 `b73dc7d1…`, 408912 B), refetch records by a seat other than
> `fetched_by` with the quote in their own bytes; the same command under `unshare -Urn` reports
> `admitted 0, failing 2 (l1-live ×2)`, exit 1, so the pass is wire-dependent; an independent
> third fetch at 2026-10-26T07:47:49Z returns S116 byte-identical and S117 at the same 408912 B
> differing only in the Cloudflare `__CF$cv$params` nonce, with both 25-word receipt quotes and
> every ≥4-word entry quote located (0 unlocated; the counter's `q1` blind spots are covered by an
> independent wider extraction); S116's cited lines 302/308-311/432/444 hold the field headings and
> the quoted passage; archive revisions `-09/-10/-11` return 200 and `-12` 404 at 07:48:27Z,
> confirming the lesson's stale-anchor correction.

> **Axis line.** `operability` and `coverage` move on measured counters; no axis is harmed.
> Disclosed: the README frontier sentence "every catalogued fault … is killed by a self-test case"
> is corrected to "26 by a self-test case, 1 by gate abort"; criterion 77's subsection rule is
> applied to M5/M6; the noHarm line for self-assessment is reported as "tallies restated at
> SCORECARD.md:1507-1508 and re-measured 10/10 and 29/29", not as the vacuous
> `mismatches 0`.

## 7. Smallest safe corrections (attack seat — none applied)

1. **`corpus/README.md:652`** — replace "every catalogued fault … is killed by a self-test case"
   with "26 of 27 killed by a named self-test case, 1 (`pins-f3-bytes-absent`) by gate abort";
   same sentence in `corpus/lessons/round-30.md:143` (M5 fix) so the compensating check is
   described as it ran.
2. **`corpus/lessons/round-30.md`** — add `### M5` and `### M6` subsections (evidence, captured-by,
   fix, and the state in which the fix can fail), or scope `QUALITY.md:430-434` to rows that carry
   a landed fix. Criterion added and violated in the same round is the exact class criterion 78
   exists to catch.
3. **`SCORECARD.md` / `LOG.md`** — add the two round-30 claim rows (score delta, evidence pointer,
   counting command measured at `072af95f`, verdict wording from §6) and the LOG entry with the
   motivating evidence; today only the corrections block exists.
4. **Report prose** — for S117 write "normalised text equal, raw bytes carry a per-response
   Cloudflare nonce", never "byte-identical"; cite the `unshare -Urn` control wherever `--live`
   is offered as proof.
5. **Not this round (round-31 counter, already routed as M5/M6):** opaque run ids, neutral `cwd`
   and minimal `env` for the mutant copy; https-only production `fetchLive` with same-host redirect
   enforcement and `%{url_effective}` recorded; `rf.url === rc.url` for refetch identity;
   duplicate-row refusal in `parseRegistry`.

## 8. Method, limits, honesty

- Measured only in `/fast/scratch/hyaku/tabi-r30/CritClaimVerdicts/clone`
  (`git clone --shared`, checked out at `072af95f…`, `git status --porcelain` empty before and
  after every run) and a second scratch clone `clone-mut` for the mutation reproduction. Nothing
  was written to the lane, the fleet repo, `shokuknow`, or any sibling lane; no lane file was
  edited and no git index or jj state touched.
- Network: read-only HTTPS GETs of two public documentation/spec pages plus four archive status
  probes, all recorded in `RECEIPTS.md` (URL, UTC, status, bytes, sha256, redirect count). No
  cookies, credentials, API calls or session material.
- Not run, therefore not claimed: the "wildcard" family that would prove a case reads
  `import.meta.url` is absent by grep only (I did not build the length-fingerprint B2 attack at the
  tip — wave 1 measured it at the freeze and the tip's gate diff contains no added byte-inventory
  line); a per-case causal ablation (remove one case, re-run its mutant) — I used the freeze
  reading as the negative control instead; nothing about S118's bytes beyond the anchored line
  numbers, since S118 is not a C2 row and the release-pins reading is the L1's noHarm check.
- `quote-audit.py`'s single-quote regex flags apostrophe fragments; all four `ABSENT` lines it
  prints are artefacts, and the report says so rather than counting them as defects.
