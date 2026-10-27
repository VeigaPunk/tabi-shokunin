# W1-57 — scribe note: sources row / knowledge gate / lesson / SCORECARD-LOG-report consistency

Seat: `Scribe57` (scribe, leaf). Attack id `W1-57`. Milestone C1–C2, axes calibration + coverage.
Scope: one bounded evidence surface — the sources row + knowledge gate, the round lesson/mistakes,
and SCORECARD/LOG/report consistency. No production edits, no git/jj mutation, no re-run of the
runtime driver. Read-only git reads + two gates run with `--rev` (stdout only).

A draft finding/evidence note. I am not an authority on the claims and do not grade them.

## Revisions observed (the repo moved under this seat)

| time (-0300) | commit | note |
|---|---|---|
| — | `98239d0` "round-38: add frozen-instrument candidates and Firefox driver" | the commit that *adds* all five frozen instruments |
| — | `a8e7d50` "round-38: freeze calibration and Firefox capability claims" | **the commit this seat was assigned as frozen claims**; its diff touches `claims.json` only (59 lines) |
| 12:37:21 | `3bc0b10` "round-38: record Firefox capability and routed defects" | landed while this seat inspected: adds the S144 row, SCORECARD §Round 38, LOG §Round 38, the knowledge note, the lesson and the receipt |

`git diff a8e7d50 3bc0b10 -- .ufo/waves/round-38/claims.json` is **empty**: the claim bytes are
byte-identical at both revisions, so every claims quotation below is valid at both. Findings state
the revision they are pinned to.

## Checks executed (exact commands, exact outcomes)

```
node scripts/check-sources.mjs                       # worktree / 3bc0b10
SOURCES_GATE verdict=clean rows=144 tiers=A:128,B:7,C:9 status=queued:15,mined:120,rejected:9 findings=0  exit 0

git archive a8e7d50 | tar -x -C <scratch>/head-clone && (cd head-clone && node scripts/check-sources.mjs)
SOURCES_GATE verdict=clean rows=143 tiers=A:127,B:7,C:9 status=queued:15,mined:119,rejected:9 findings=0  exit 0

node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev 3bc0b10 --repo <lane> --json
predicate=false  findings=12  d2.recomputed={ok:23,finding:11,error:0,none:0,reports:34}  d2.stated={ok:23,finding:11}
  d1-results / d3-hash ×6 / d3-freeze-landing / d4-m3 / d4-receipt / d5-receipt / d6-file

node scripts/check-selfassessment.mjs --rev <3f42a5c|a8e7d50|3bc0b10>
verdict=failed mismatches=1 each; class m3-unlanded-paths observed=47 / 49 / 43
```

## Findings

### F1 — C1's declared baseline is the commit that already contains the C1 counter (calibration)

`claims.json` sets `"frozenAt": "98239d0…"` **and** `"baseline": "98239d0…"`. The C1 counter
constant is `BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35'`
(`.ufo/waves/round-38/counters/c1-routed-defects.mjs:53`), and `LOG.md:2527` states "Round-start
baseline: `3f42a5c…`". Round-37's own claims used the same value for `frozenAt` and `baseline`
(`ed8ccfc`) *and* SCORECARD named that same commit as "round-start baseline", i.e. the field means
the round-start revision.

Consequence: at the claims-declared baseline, C1's `before` sentence ("…; counter absent") is false —
`git show --stat 98239d0` shows that commit adding
`.ufo/waves/round-38/counters/c1-routed-defects.mjs` (262 lines) plus the other four instruments.
C1 also targets "baseline control must fail", but a baseline that already carries the counter cannot
be a do-nothing control.

Falsifier: a lane rule stating that `claims.json.baseline` is the instrument-candidate commit rather
than the pre-data round-start revision — no such rule was found; the round-37 usage and the counter's
own `BASELINE` both contradict it.

### F2 — the byte-identical-predicate discipline that round-37 C1 repaired is absent in round-38 (calibration)

```
claims.claims[0].predicate = "D1-D6 all re-derived and corrected at REV by c1-routed-defects.mjs; predicate true"
counter PREDICATE_SENTENCE  = "D1 stale-line-present AND superseding-correction-present AND … D6 window endpoints == baseline..REV"
claims[0].predicate === counter sentence -> false
```

Round-37's frozen claims carried `predicateSites: ["claims.json", "c1-adjacency-sweep-v5.mjs header +
PREDICATE_SENTENCE", "receipt.predicateSentence"]` and the round-37 disposition required "one sentence
byte-identical at three sites". Round-38 claims carry no `predicateSites`, and no receipt exists to
carry a third site: `.ufo/waves/round-38/measure/` is absent from `git ls-tree -r HEAD` (the round-38
tree holds only `claims.json` + five instruments). The counter header itself says the sentence is
"the same sentence in claims.json and the receipt's `predicateSentence` field" — the code comment is
false on both counts today.

Falsifier: a committed round-38 receipt with `predicateSentence` equal to the counter constant, plus a
claims edit restoring `predicateSites`; absent those, the claim's own stated predicate is a paraphrase.

### F3 — no do-nothing / red controls at all for round-38 (calibration)

`git ls-tree -r HEAD -- .ufo/waves/round-38/baseline` → **empty**. Round-37 froze ten control receipts
there (`c1r37-J1-pins-reorder-v4/v5`, `c1r37-J2-decoy-note-v4/v5`, `c1r37-J3-honest-v5`,
`c2r37-J1/J2/J3`) and its claims carried `controlsDoNothingNote`. Round-38 claims have no
`controlsDoNothingNote`, no `measurementRule`, no `noHarmRule` keys (see F12). The C1 counter itself
requires `.ufo/waves/round-38/baseline/m3-sentence-mutant.json` for D4 and reports `d4-receipt absent`
at the tip.

Falsifier: a committed control receipt showing the pre-round instrument failing on the same inputs,
anywhere under `.ufo/waves/round-38/`; none exists at `a8e7d50` or `3bc0b10`.

### F4 — the counter measures substituted surfaces, so two routed defects can never be certified as repaired (calibration)

Read of `c1-routed-defects.mjs` against `corpus/lessons/round-37-verifier-spotcheck.md:109-131`:

- **D2** (`:103-140`) reads the `## Round 38` slice of `LOG.md` for `23 ok / 11 finding`. Routed
  defect 2 says "Correct **in the round-38 report**". The lane's round-38 report does not exist
  (`.ufo/reports/round-38/` holds 12 other lanes' files; `tabi.md` ABSENT), so D2 can pass while the
  defect's actual target is untouched.
- **D3** (`:141-177`) requires all six `ROUND37_COMMITS` hashes to appear **inside the `## Round 38`
  LOG slice**. Routed defect 3 asked for hash-carrying *round-37* entries ("no round-37 commit hash
  appears in LOG.md … no per-commit landed ledger"). A correct round-37 landed ledger would still
  fail D3 unless the same six hashes were also pasted into the round-38 section — which the committed
  LOG explicitly defers ("landed commit hashes will follow in the appended round-38 ledger").

Consequence at the tip: `predicate=false`, 12 findings — of which D1, D3, D4, D5, D6 are unmet. This
is consistent with SCORECARD's "result pending integration", but the D2/D3 definitions mean the
predicate can be satisfied without the routed defects being repaired.

Falsifier: a rule (or the routed-defect text) making LOG the sanctioned surface for the seat tally and
the round-38 section the sanctioned home for round-37 hashes. Neither is in the spotcheck text.

### F5 — SCORECARD cites a "committed" object that is untracked (consistency; QUALITY 28)

`SCORECARD.md:2102`: "The committed round-37 result object records 34 w1 seats."

```
git cat-file -e HEAD:.ufo/waves/round-37/w1-results.json   ->  absent
git status --porcelain                                     ->  ?? .ufo/waves/round-37/w1-results.json
node -e '…require(…w1-results.json)'                       ->  round 37 wave w1 seats 34 results 34
```

The *number* (34) is right; the word *committed* is wrong, and the C1 counter's own D1 reads that path
at REV and reports `d1-results: w1-results.json absent`. `corpus/QUALITY.md:112` (rule 28): every
evidence pointer in a lesson/note/QUALITY/SCORECARD/README row must resolve as committed bytes; an
untracked path is never the only root of a claim. `.gitignore` does not cover this path
(only `.ufo/waves/*/scratch/`, `*.err`, `interactive-sessions/`), so it is genuinely unlanded.

Falsifier: the file tracked at the measured REV. Note that committing it is also what D1 requires and
what removes one of the `m3-unlanded-paths` count (F14).

### F6 — the lesson asserts two receipt files that do not exist (consistency; QUALITY 28)

`corpus/lessons/round-38.md:15` (§Census): "Round-end validation returned exit 0 and `tabi ok`;
captured output at `.ufo/waves/round-38/measure/census-end.txt`".

```
git ls-tree -r HEAD -- .ufo/waves/round-38/     ->  claims.json + 5 counters only (no measure/)
ls .ufo/waves/round-38/measure                 ->  empty
counter D5: blob(REV,'.ufo/waves/round-38/measure/census-end.txt') -> null  ->  FINDING d5-receipt
counter D6: no numstat-at-*.txt                                   ->  FINDING d6-file
```

So the lesson asserts a captured census that is absent, and the frozen counter it is meant to feed
reports both receipts missing. The round-37 routed defect D5 asked that the census step record parsed
counts; round 38's lesson claims an artifact where even the capture is missing. The lesson's own
"143 registry rows" at round start is correct for `3f42a5c`/`a8e7d50`; the tip's registry is 144
(F9), so a round-end count would have to be 144 to match the counter's histogram recomputation.

Falsifier: a committed `census-end.txt` under `measure/` with `rows=`/`tier=`/`status=` lines matching
the registry; and a `numstat-at-<hex>.txt` whose window names baseline…REV.

### F7 — S144's registry row carries no fetch evidence, unlike every neighbouring row (sources gate)

`corpus/SOURCES.md:158` (S144, kind docs, tier A, status mined, opened 2026-10-27, recheck
`on-release`, used-by `corpus/knowledge/playwright-firefox-loopback-round-38.md`) has an anchor cell
of: "living docs page, §Firefox; opened 2026-10-27, page identifies Playwright's patched Firefox and
platform variation". S136–S143 each carry byte counts and sha256 in the same cell. No raw-fetch
receipt for this page exists under `corpus/evidence/round-38/` (that directory holds only
`playwright-firefox/receipt.json`).

Bounded re-open by this seat (one fetch, scratch dir):

```
curl -sS -o browsers.html https://playwright.dev/docs/browsers
http=200 bytes=134107 sha256=bc8a4e2617cf0388026d59f9932ab762aebec61bdba9f4c0eda6a12c2127eee5
"Playwright doesn't work with the branded version of Firefox since it relies on patches." -> present verbatim, §Firefox
```

So the lesson's 14-word quote (`corpus/lessons/round-38.md:5`) and the row's `teaches` hold against
today's page — but the registry cannot bind that quote to any frozen bytes, and `recheck: on-release`
on an unpinned living page leaves freshness prose-only. Side note on scope: the page says
"Playwright's Firefox version matches the recent Firefox Stable build"; it does **not** evidence
"157.0". The 157.0 in the note and claim is host-derived
(`~/.cache/ms-playwright/firefox-1555/firefox/application.ini` → `Version=157.0`,
`BuildID=20261002045259`), which I confirmed independently; it is correct, but not S144-sourced.

Falsifier: a committed fetch receipt (bytes + sha256 + timestamp) for S144. My own fetch shows the
row would pass such a check if recorded.

### F8 — the new knowledge note breaks the note-header convention and is not indexed (knowledge gate)

Header comparison (`head -8`), prior notes vs this one:

| field | r35 `webdriver-bidi-firefox-runtime-round-35.md` / r36 `adjacency-drift-audit-r36.md` | r38 `playwright-firefox-loopback-round-38.md` |
|---|---|---|
| provenance comment | HTML comment naming round, claim, drafting seat, L1 landing | **absent** |
| `source:` | URL + located quote + HTTP status/bytes/sha256 | `S144 — … https://playwright.dev/docs/browsers` only |
| `verified-at:` | ISO timestamps, receipt digests, binary shas | `round 38, Playwright 1.64.0, Firefox 157.0` |
| `recheck:` | cadence + counter command | driver command, no cadence |

`git show HEAD:corpus/README.md | grep -c "playwright-firefox-loopback\|round-38"` → **0**. The note is
in no README note-map row, while round-36's SCORECARD trend row treats "the note is indexed in
`corpus/README.md`" as the expansion evidence. No §Paths entry exists for it either
(`corpus/SOURCES.md` §Paths still ends with `declarative-validation`), and §Search log's last entry is
round-35 (`- 2026-10-26 · round-35 second-engine BiDi sources`), so S144 lands with no
identified/screened/included census line — the convention every prior round's new row follows.

Falsifier: README/§Paths/§Search-log edits carrying this note; a `check-sources`/README gate that
enforces an index (none does — `check-sources` enforces only row well-formedness, used-by existence
and used-by *citation*, i.e. that the note mentions `S144`, which it does).

### F9 — at the assigned frozen-claims commit, C2's "newly opened S144" target is unsatisfiable (sources gate, revision pinning)

```
git show a8e7d50:corpus/SOURCES.md | grep -c S144                     -> 0
git cat-file -e a8e7d50:corpus/knowledge/playwright-firefox-loopback-round-38.md   -> absent
git cat-file -e a8e7d50:corpus/evidence/round-38/playwright-firefox/receipt.json   -> absent
git cat-file -e a8e7d50:corpus/lessons/round-38.md                                -> absent
check-sources on a git-archive of a8e7d50                              -> clean, rows=143
```

C2's killRule is "… or no cited newly opened source row". At `a8e7d50` there is no S144 row, no note
citing it and no receipt, and the sources gate reports *clean* because the row (and therefore the
dangling used-by) does not exist — the gate cannot witness the absence. The target is met only from
`3bc0b10` (rows=144, note and receipt tracked). Anyone measuring C2 at the frozen-claims commit
reaches the kill condition; anyone measuring at the tip does not. The claim does not state which
revision it must be measured at beyond "measured REV".

Falsifier: a round-38 statement fixing the C2 measurement revision to `3bc0b10`-or-later; absent that,
the two legitimate readings give opposite verdicts.

### F10 — C2's predicate has no frozen verifier; the receipt is producer-self-asserted (calibration/coverage)

`claims.frozenDigests` pins `c2-firefox-bidi-v4.mjs` and `c2-battery-mutants.mjs`. Those are the
round-37 geckodriver/BiDi instruments:

```
c2-firefox-bidi-v4.mjs:128  PREDICATE_SENTENCE = "no entry finding AND no receipt finding AND no binding finding
                            AND failing == 0 AND admitted >= 16 AND live.egressNonLoopback == 0 AND live.survivors == 0"
c2-battery-mutants.mjs:1-27 mutates a scratch copy of c2-firefox-bidi-v4.mjs (m5/m5b/m3/decoy)
```

Neither reads `corpus/evidence/round-38/playwright-firefox/receipt.json`. The C2 counting command is
the driver itself, and the driver computes its own headline field:
`receipt.binding = new Set(receipt.firstShotSha256).size === 1`
(`scripts/playwright-firefox-loopback-round38.mjs:163`). No frozen artifact re-derives "click /
navigation / evaluation evidence verified" from the receipt, and `corpus/QUALITY.md:126` (rule 30)
requires a receipt to record the producer path **and sha256** and the revision it ran at — the receipt
has `driver` path only, no producer digest, no measured revision, and `firefoxVersion: null`.

Positive controls inside the receipt (verified by this seat, read-only):

| field | value |
|---|---|
| `runs` | 2 (`run1`, `run2`), 11 steps each: `navigate.hydrated, title, shape, screenshot.first, click.effect, screenshot.after-click, evaluate, history.traverse, history-reset-and-click, http.witnessed, console.quiet` |
| `firstShotSha256` | both runs `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c` — matches the note (`corpus/knowledge/playwright-firefox-loopback-round-38.md:9`) and `LOG.md:2529` |
| `egressNonLoopback` | 0 (per-run `egress.samples = 2`) |
| `survivors` / `portClosed` | 0 / true in both runs; `httpLog` 6 per run; `errors` [] |

So the note's runtime sentences are receipt-backed; the *verification* of them has no frozen
instrument behind it. `firefoxVersion: null` also means the receipt does not itself bind "Firefox
157.0" (that number is host-verified only, F7).

Falsifier: a frozen counter that reads this receipt and re-derives the C2 predicate, or a receipt
carrying producer sha256 + measured revision.

### F11 — the capability row entered SCORECARD before its required demonstration (coverage/consistency)

`SCORECARD.md:2105` adds `playwright-firefox-loopback` "first-working round 38" and then says "The
claim's frozen verification and non-author review are pending". `AXES.md:63-64`: "a capability
without a passing demonstration in the round report is pre-claiming and does not enter the table."
`/home/vgpnk/Projects/shokunin/.ufo/reports/round-38/tabi.md` is ABSENT (that directory holds
`chousa, kaidoku, kake, kama, kasegi, kengaku, kotodama, kumitate, mado, mori, tameshi, tsukuroi`).

Falsifier: the round report with the demonstration, committed before or with the SCORECARD row.

### F12 — same schema name, different claim-schema shape (calibration bookkeeping)

```
r37 (99437d2): schema,lane,round,frozenAt,baseline,axesAtRoundStart,lowestAxis,saturation,claims,
               frozenDigests,measurementRule,noHarmRule,controlsDoNothingNote
r38 (a8e7d50): schema,lane,round,frozenAt,baseline,axesAtRoundStart,lowestAxis,stagnationNudge,claims,
               frozenDigests,toolInstalls
claim keys r37: id,axis,kind,title,surface,predicate,predicateSites,countingCommand,before,target,killRule
claim keys r38: id,axis,kind,title,surface,predicate,countingCommand,before,target,killRule,source
```

Both declare `"schema": "tabi-round-claims-v2"`. The dropped `predicateSites`, `measurementRule`,
`noHarmRule` and `controlsDoNothingNote` are exactly the fields that carried round-37's
instrument-repair discipline (F2, F3). C1's added `source` field holds a note *about C2* ("S144
(Playwright docs) is only for C2; C1 source is round-37 verifier spot-check") rather than C1's own
source, which sits in `before`. Readers of the same-named schema cannot rely on field presence.

Falsifier: a v2 reader/gate that requires those fields (none of the gates that open `claims.json`
does — they parse SCORECARD prose for saturation, so nothing goes red).

### F13 — nudge waiver vs the lowest-axis admission rule, and SCORECARD does not state what claims declares (calibration)

`claims.stagnationNudge` argues the nudge is inactive because capability round 35 sits inside the
window 35–37. That matches `AXES.md:66-73` (nudge active when every axis ≥ saturation line **and** no
capability within rounds N−W…N−1) with SCORECARD's 8/3, so the *state* is right. But `AXES.md:33-34`
also says "At least one claim works the lane's **lowest-scoring non-retired axis**, except when the
stagnation nudge waives it": `axesAtRoundStart.adjacency = 8` is the lowest axis, no claim works it,
and the nudge is inactive — so the round's claim set does not satisfy the admission rule as written
(claims.json discloses this honestly). Prior rounds 22–25 ran the same pattern (SCORECARD
`:1332-1333`), so this is a standing protocol tension, not a new invention — but it remains an
unwaived exception.

Second half: SCORECARD's round-38 block states "saturation 8 / window 3" and never states the nudge
verdict, while claims.json asserts "nudge is inactive". The lane's m4 counter parses the nudge
statement out of SCORECARD prose, so the SCORECARD/claims disagreement is invisible to it (m4 reported
no finding for the round-38 group; the group also lacks an "Axes at round start:" line, which would
make it `could-not-evaluate` rather than a match).

Falsifier: an AXES/PROTOCOL ruling that a disclosed, precedent-backed tension waives the lowest-axis
obligation; or a SCORECARD round-38 line declaring `nudge inactive` with the window basis.

### F14 — no-harm observation: the lane's self-assessment failure is pre-existing (context for the scores)

`node scripts/check-selfassessment.mjs --rev <rev>` → `verdict=failed mismatches=1`, class
`m3-unlanded-paths`, counted paths **47** at the round-start baseline `3f42a5c`, **49** at `a8e7d50`,
**43** at `3bc0b10`. The class counts `git status --porcelain --untracked-files=all` paths against the
newest "executed disposition" block's landed claim — so it is worktree-sensitive, not revision-
sensitive, and it is the same class at all three revisions: not introduced by round 38. One of the
paths it counts is exactly `.ufo/waves/round-37/w1-results.json`, the file C1's D1 requires to be
committed (F5). Not a defect claim — context for anyone grading "no harm" at the tip.

## What holds (checked, not assumed)

- `claims.json` bytes identical at `a8e7d50` and `3bc0b10`; all five `frozenDigests` match the blobs
  at HEAD byte-for-byte (`c1-routed-defects.mjs` 209d86a0…, `c1-adjacency-sweep-v6.mjs` 704da806…,
  `c2-firefox-bidi-v4.mjs` 6a14d8ca…, `c2-battery-mutants.mjs` 6d7a925b…, driver 4cf3a849…).
- `check-sources` clean at both revisions (143 rows at `a8e7d50`, 144 at `3bc0b10`), sections present,
  S144 parses with 11 columns, no duplicate id/url, used-by resolves and cites the id.
- S144's quote and `teaches` hold on a fresh fetch (F7); `Firefox 157.0` holds on installed bytes.
- C1's D2 leg is genuinely reproducible: 34 committed round-37 reports, recomputed 23 ok / 11 finding,
  equal to the tally stated in `LOG.md` round-38 — the spotcheck's numbers are right (only the surface
  is substituted, F4).
- The round-37 routed list in the spotcheck is exactly six items and the counter's D1–D6 labels map to
  them in order (D1 seats, D2 tally, D3 LOG hashes, D4 lesson M3, D5 census, D6 numstat) — the
  claim's "D1–D6" naming is faithful to the source document.

## Limits of this note

- I did not execute the C2 counters (they require a live geckodriver/BiDi session) and did not re-run
  the Playwright driver; F10 rests on reading the frozen counter sources and the committed receipt.
- I did not open the 64 seat reports, the round-38 wave spec bodies, or sibling-lane repos.
- S144's `on-release` freshness date is not evaluated; the row is one day old.
- My single live fetch (F7) is evidence about today's page, not about the page as opened on 2026-10-27;
  the row carries no digest to compare against, which is the finding.
- Everything above is measured at `a8e7d50` and `3bc0b10` only; the repo is live and later commits may
  change it.
