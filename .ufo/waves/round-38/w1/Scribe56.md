# W1-56 — Scribe56: sources row / knowledge gate, lesson and mistakes, SCORECARD/LOG consistency

- **Seat:** Scribe56 (draft evidence note only; no verdict authority)
- **Attack id:** W1-56
- **Milestone:** C1–C2 · axes judged: calibration, coverage
- **Lane repo:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- **Revisions inspected:** claims freeze `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`; instrument
  candidate `98239d0396ff32c3feb14638b3214fe688e8b122`; lane tip at end of inspection
  `3bc0b108708c46c800f9050a1caa25bfe3bf5e5a` (committed during this seat's inspection —
  see §Surfaces, "state moved under the seat").
- **Window:** 2026-10-27 approx. 12:34–12:45 (-0300).
- **Method:** read-only inspection of frozen claim bytes, counters, committed ledger and
  knowledge/source surfaces; one read-only counter run (stdout only);
  one scratch-directory gate fixture. No commits, no git/jj mutation, no production edit,
  no pacman, no subagents.

## Behavior (what was done)

1. Read `claims.json`, the five frozen instruments, the five frozen digests, `LOG.md`,
   `SCORECARD.md`, `corpus/SOURCES.md`, `corpus/QUALITY.md`, the canonical contract
   (`/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md` §SOURCES),
   `corpus/lessons/round-38.md`, `corpus/lessons/round-37-verifier-spotcheck.md`,
   the round-38 knowledge row, the round-38 receipt, and the driver.
2. Recomputed all five frozen digests against `claims.json.frozenDigests` (all match).
3. Ran the frozen C1 counter once at the tip:
   `node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev HEAD --repo . --json`
   → **exit 1, `predicate: false`, 11 findings** (full list in §Gates).
4. Re-opened the cited source myself (non-author) to test whether the gate record's quote
   is real: `curl -sS -o pw-browsers.html https://playwright.dev/docs/browsers`
   → HTTP 200, 134,107 bytes, sha256 `bc8a4e2617cf0388026d59f9932ab762aebec61bdba9f4c0eda6a12c2127eee5`;
   the gate quote is present verbatim in the served bytes.
5. Built a scratch gate fixture to test whether the source gate can see a dangling
   knowledge→registry citation (result: F2).

## Gates

**Frozen C1 counter at `3bc0b10` (read-only run, verbatim findings):**

```
EXIT=1   rev 3bc0b108708c46c800f9050a1caa25bfe3bf5e5a   baseline 3f42a5c7cc19a544c879577e4bad7b7fd9d61a35   predicate False
 - d1-results : w1-results.json absent
 - d3-hash : 99437d29 present=false isCommit=true ancestor=true
 - d3-hash : f76da094 present=false isCommit=true ancestor=true
 - d3-hash : 34ed508c present=false isCommit=true ancestor=true
 - d3-hash : 5a2ebb6a present=false isCommit=true ancestor=true
 - d3-hash : f485cce1 present=false isCommit=true ancestor=true
 - d3-hash : bf8ecd5a present=false isCommit=true ancestor=true
 - d3-freeze-landing : LOG round-38 section does not record the freeze entry landing at 34ed508c (or repeats the report's 99437d29 claim)
 - d4-m3 : no Mistakes row with captured-by naming round-37 M3 (surface-mismatch)
 - d4-receipt : m3-sentence-mutant.json absent
 - d5-receipt : census-end.txt absent at REV
 - d6-file : no numstat receipt under .ufo/waves/round-38/measure
d2: stated {ok:23, finding:11} == recomputed {ok:23, finding:11, error:0, none:0, reports:34}
```

So at the current tip C1's stated predicate ("D1–D6 all re-derived and corrected at REV;
predicate true") is **false**; `LOG.md:2527-2531` and `SCORECARD.md:2103` correctly call the
result "pending", so the ledger does not overclaim C1 — the counter simply has not been
satisfied yet. `d4`/`d5`/`d6` artifacts are the substantive gaps.

**Frozen digests:** all five recomputed sha256 values equal `claims.json.frozenDigests`
(`209d86a0…`, `704da806…`, `6a14d8ca…`, `6d7a925b…`, `4cf3a849…`).

**`check-sources.mjs` at tip:** `SOURCES_GATE verdict=clean rows=144
tiers=A:128,B:7,C:9 status=queued:15,mined:120,rejected:9 findings=0`, exit 0.

**Scratch gate fixture:** `SOURCES_GATE verdict=clean rows=143 … findings=0`, exit 0,
while `corpus/knowledge/playwright-firefox-loopback-round-38.md:1` reads
`source: S144 …` and the registry in that tree has **zero** S144 rows (F2).

## Surfaces touched (read-only, plus one scratch fixture)

- `.ufo/waves/round-38/claims.json`, `.ufo/waves/round-38/counters/*.mjs` (5), `scripts/playwright-firefox-loopback-round38.mjs`
- `corpus/SOURCES.md:158`, `corpus/QUALITY.md:1-45`, `corpus/README.md` (grep), `corpus/lessons/round-38.md`, `corpus/lessons/round-37-verifier-spotcheck.md`, `corpus/knowledge/playwright-firefox-loopback-round-38.md`, `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md:1-14`, `corpus/evidence/round-38/playwright-firefox/receipt.json`
- `LOG.md:2525-2531`, `SCORECARD.md:1976-1980`, `2100-2106`
- Contract: `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md:64-160`
- Scratch only: `/fast/scratch/hyaku/tabi-r38/Scribe56/` (counter JSON, curl body, gate fixture) — removed before yield.
- **State moved under the seat:** at 12:34 the knowledge row existed with **no** S144 row in
  `SOURCES.md` (143 rows; `grep -n S144 corpus/SOURCES.md` → nothing); `SOURCES.md` mtime
  became 12:35:27 with the S144 row, and commit `3bc0b10` (12:37:21) landed S144 + the
  knowledge row + the lesson + the receipt + LOG/SCORECARD appendices. Findings below refer to
  the **committed** bytes at `3bc0b10` unless a timestamped pre-commit state is named.

## Findings

### F1 (coverage, knowledge gate) — S144's "opened" claim has no raw-fetch sha256 receipt, unlike both neighbouring rows

`corpus/lessons/round-38.md:5` records URL, date and a 14-word §Firefox quote but **no fetch
sha256**:

```
- **Admit S144** — https://playwright.dev/docs/browsers, accessed 2026-10-27. Located quote, §Firefox: “Playwright doesn't work with the branded version of Firefox since it relies on patches.” (14 words). …
```

The lane's own witness rule, as coded in the frozen C2 counter, requires a Gate row that
carries an https URL **on the registry host and a 64-hex sha256**
(`.ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs:581`:
`firstHttps(x.text) && HEX64.test(x.text) && urlHost(...) === regHost`), and the registry
header states each row carries a raw-fetch sha256 (`corpus/SOURCES.md:6`). The two adjacent
rows do: `SOURCES.md:156` (S142) and `:157` (S143) carry `page fetched 2026-10-27T09:29:57Z
(200, …, sha256 …); §… at line N`. `SOURCES.md:158` (S144) carries only
`living docs page, §Firefox; opened 2026-10-27, page identifies …`.

Consequence: S144's "opened" is an assertion, not a re-checkable receipt; the living page can
change and nothing in the lane binds the quote to bytes. This seat's independent re-open
found the quote present (`sha256 bc8a4e2617cf0388026d59f9932ab762aebec61bdba9f4c0eda6a12c2127eee5`,
134,107 B) but that hash exists only in this note, not in the lane.
**Falsifier:** a committed sha256+timestamp (and byte count) in the round-38 Gate record or
seat evidence matching a fresh fetch of the URL.

### F2 (calibration, gate blind spot) — `check-sources.mjs` cannot detect a knowledge row citing an unregistered S-id

QUALITY rule 12 (`corpus/QUALITY.md:29`) requires every admitted external claim to cite ≥1
opened registry row of tier A/B. The lane's structural gate never reads a knowledge row's
`source:` line: `scripts/check-sources.mjs` only validates registry rows and `used-by` path
**existence** (knowledge paths appear only as self-test fixtures, `:431-458`).

Demonstration (scratch tree, committed SOURCES.md with the S144 line removed, knowledge row
unchanged):

```
rows=143  S144_in_registry=0
knowledge source line: source: S144 — Playwright Browsers docs, https://playwright.dev/docs/browsers
SOURCES_GATE verdict=clean rows=143 tiers=A:127,B:7,C:9 status=queued:15,mined:119,rejected:9 findings=0
EXIT=0
```

That is not hypothetical for this wave: between 12:34 and 12:35:27 the lane was in exactly
that state (knowledge row present, 143 registry rows, no S144), and the gate would have said
`clean`. The round's C1 is calibration work on six routed defects; this hole is outside the
D-list.
**Falsifier:** a gate self-test case that refuses a knowledge row naming an unregistered id
(expected exit 1 + finding id), then the same fixture passing once the row exists.

### F3 (coverage) — C2's named counting command is the driver, and the frozen C2 counter measures the *round-35* entry, not this claim

`claims.json` C2 `countingCommand` is `node scripts/playwright-firefox-loopback-round38.mjs
--out <receipt> --runs 2` — a driver that writes a receipt; it emits no verdict. The frozen
C2 counter targets other bytes:

- `c2-firefox-bidi-v4.mjs:105` `ENTRY = 'corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md'`
- `:106` `RECEIPT = 'corpus/evidence/round-35/bidi-firefox/receipt.json'` (schema `tabi-bidi-receipt-v1`)
- `:107` `LESSONS = ['corpus/lessons/round-35.md', 'corpus/lessons/round-36.md']`
- `:128` predicate: `no entry finding AND no receipt finding AND no binding finding AND failing == 0 AND admitted >= 16 AND live.egressNonLoopback == 0 AND live.survivors == 0`

`grep -i playwright` on that counter → **0 hits**. The round-38 receipt's schema is
`tabi-pw-firefox-receipt-v1`; nothing in the lane recomputes the terms C2 states (identical
first-shot hash, loopback-only requests, zero non-loopback sockets, zero survivors, step
evidence). They are self-attested by the same process that writes the receipt. So C2 as
frozen is **not falsifiable by a counter** — only by reading the receipt, and its kill rule
("differing first-shot hashes, non-loopback egress, survivor") has no machine check.
**Falsifier:** a counter/gate leg that reads `tabi-pw-firefox-receipt-v1`, re-derives hash
equality/egress/survivors and refuses planted mutants (the repo already ships the pattern for
BiDi: `c2-battery-mutants.mjs` + `tabi-bidi-receipt-v1`).

### F4 (coverage, knowledge row) — the row asserts a host browser identity with no binary pin, and the receipt's `firefoxVersion` is null

`corpus/knowledge/playwright-firefox-loopback-round-38.md:2`:
`verified-at: round 38, Playwright 1.64.0, Firefox 157.0`. The receipt records
`"firefoxVersion": null, "browserVersion": "157.0"` (driver sets `firefoxVersion: null` at
`scripts/playwright-firefox-loopback-round38.mjs:157` and never assigns it). Precedent
`corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md:2-3` pins fetch window,
per-binary `--version` and sha256, and receipt sha256. The identity is independently true on
this host — `~/.cache/ms-playwright/firefox-1555/firefox/firefox --version` →
`Mozilla Firefox 157.0`, binary sha256 `1f637a7cfe8f1a3ec814a7da7e38c360a3e3c39553b8c7245ac5d6643fd495eb`
— but that pin is in no lane artifact.
**Falsifier:** the row (or its receipt) carrying the browser binary path + sha256, or a
non-null `firefoxVersion`.

### F5 (calibration, SCORECARD/LOG consistency) — SCORECARD's round-37 correction calls an uncommitted file "committed"

`SCORECARD.md:2102`: "The committed round-37 result object records 34 w1 seats."
The object is **not** committed at the tip:

```
$ git cat-file -e HEAD:.ufo/waves/round-37/w1-results.json   → (fail: absent)
$ git status --porcelain .ufo/waves/round-37/w1-results.json  → ?? .ufo/waves/round-37/w1-results.json
$ git log --all --oneline -- .ufo/waves/round-37/w1-results.json → (empty)
```

The frozen C1 counter agrees at the tip: `d1-results : w1-results.json absent`. The same
unbacked word appears in the round's lesson (`corpus/lessons/round-38.md:11`,
"re-derive from committed `w1-results.json` (34 seats)"). The **number** is right — the
working-tree file has `seats: 34, results: 34` — so this is a provenance defect only,
but it is the exact class D1/D2/D3 exist to close, reintroduced in the round that closes it.
**Falsifier:** the file committed at REV; the counter's `d1-results` finding then clears.

### F6 (calibration) — the lesson's round-end census receipt does not exist

`corpus/lessons/round-38.md:15`: "Round-end validation returned exit 0 and `tabi ok`;
captured output at `.ufo/waves/round-38/measure/census-end.txt`".
`ls .ufo/waves/round-38/measure/` → empty; `git log --all -- .ufo/waves/round-38/measure/`
→ nothing; counter finding `d5-receipt : census-end.txt absent at REV`. D5 additionally
requires that file to carry a counts block matching the counter's own parse — so the
round-38 census claim is both unbacked and, as written, insufficient for D5.
**Falsifier:** the file at REV with `rows / tier histogram / status histogram` equal to
`c1-routed-defects.mjs`'s parse (144 rows / A:128,B:7,C:9 / queued:15,mined:120,rejected:9 at
`3bc0b10`).

### F7 (calibration) — `claims.json.baseline` collides with the counter's frozen baseline; round-37 had them equal

`claims.json:5-6`: `"frozenAt": "98239d0…"`, `"baseline": "98239d0…"`.
- `98239d0` does not contain `claims.json` (`git cat-file -e 98239d0:.ufo/waves/round-38/claims.json` → absent; the file first appears at `a8e7d50`) — that part is round-37 convention (`ed8ccfc` also lacks round-37's `claims.json`), so `frozenAt` naming a preamble commit is not itself new.
- What **is** new: round-37 had `frozenAt == baseline == ed8ccfc ==` the baseline `LOG.md` names. Round-38 names `3f42a5c…` as the round-start baseline (`LOG.md:2527`), and the frozen counter hardcodes `BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35'` (`c1-routed-defects.mjs:52`) and D6 refuses any numstat receipt that does not name that value (`:222-223`). A seat forming the D6 window from `claims.json.baseline` names `98239d0` and is refused; `LOG.md:2527` calls `98239d0` the "frozen-instrument candidate commit", a role `claims.json` has no field for.
**Falsifier:** a D6 receipt naming `98239d0` that the counter accepts (it will not), or
`claims.json` amended to distinct `frozenAt`/instrument/`baseline` fields matching `LOG.md`.

### F8 (coverage, SCORECARD) — the capability row is prose outside the capability ledger table

`SCORECARD.md:2105` adds `playwright-firefox-loopback` as a bullet. Every prior capability
entered the table whose header is `| Capability | What it can now do | Evidence pointer |
First-working round |` (`SCORECARD.md:1976-1978`, with the QUALITY 84 note at `:1980`).
`grep -n playwright-firefox-loopback SCORECARD.md` → only `:2104-2105`: a reader scanning the
ledger cannot see the new capability, and the bullet's "Source: S144" cell has no column home.
C2's target ("capability row enters SCORECARD") is therefore met only in a non-ledger form.
**Falsifier:** a new (append-only) capabilities table section containing the row.

### F9 (calibration) — LOG round-38 has no freeze entry and cites no round-37 hashes (D3 unmet)

`LOG.md:2525-2531` narrates baselines and the driver run but: (a) never states the round-37
freeze-entry landing at `34ed508c`; (b) contains none of the six round-37 commit hashes. That
is exactly what the frozen counter checks (`d3-freeze-landing`, six `d3-hash present=false`
findings — all six hashes do resolve as commits and all are ancestors of REV, so only their
*presence in the LOG text* fails). The LOG discloses the deferral ("Round-38 closure result
and landed commit hashes will follow"), so this is honest in-progress state, not an overclaim.
Note for the integrator: the section was written at 12:37, **after** the driver data, so it
cannot witness freeze-before-data either way.
**Falsifier:** the appended round-38 ledger with all six hashes + `34ed508c`.

### F10 (calibration) — lesson Mistakes section does not carry D4's fix

`corpus/lessons/round-38.md:9-11` has a single M1 row (routed defect 1). The counter requires
a row whose `Captured-by:` names round-37's M3 class (`surface-mismatch`) and a red-control
receipt at `.ufo/waves/round-38/baseline/m3-sentence-mutant.json`; both are absent
(`d4-m3`, `d4-receipt`), and the `baseline/` directory is empty and never committed
(`git log --all -- .ufo/waves/round-38/baseline/` → empty).
**Falsifier:** a Mistakes row with that Captured-by plus the refused-mutant receipt at REV.

### F11 (small, evidence labeling) — receipt's `http.witnessed` count is requests+responses, labeled "requests"

`receipt.json` step `http.witnessed` reports `{"requests": 6}` while the run logged
`request: 3` and `response: 3` events (plus 3 fixture-server `http.request`); the value comes
from `rec.httpLog = rec.events.filter((e) => e.method === 'request' || e.method === 'response')`
(driver `:127`). No claim rests on it (the knowledge row says "request/response
observations"), but a consumer reading it as six requests overcounts. Related sampling note:
`egress = {samples: 2, nonLoopback: 0, lines: 1}` per run — the "0 non-loopback" term is two
`ss -tnp` snapshots at 400 ms intervals (`:77-89`), and a snapshot that cannot resolve pids
yields `lines: 0` (true-by-default); `lines: 1` shows at least one pid-resolved sample occurred.
**Falsifier:** per-run sample count in the receipt's own terms, or a `request`-only count.

## Verified agreements (not findings)

- All five frozen digests match `claims.json.frozenDigests`.
- D2 numbers: counter recomputed `23 ok / 11 finding / 34 reports`, identical to the tally in
  `LOG.md:2531` and the SCORECARD correction.
- LOG's six defect phrases (`LOG.md:2531`) map 1:1 onto `round-37-verifier-spotcheck.md`
  §Routed defects D1–D6 (stale 68-seat line; 23/11 tally; LOG hash ledger + freeze landing;
  M3 Captured-by + sentence mutant; count-bearing census; numstat window).
- S144 row structure is valid: 11 columns (NF=13), `docs`/`A` (no `community` inflation),
  `mined`, `used-by` names the round-38 knowledge row, and it is newly absent at `98239d0`
  (143 rows there) — so "newly opened this round" holds.
- The knowledge row's factual body matches the receipt: identical `firstShotSha256`
  `3e0c070a…` (20,626 B) in both runs, all page requests `http://127.0.0.1:<port>/…`,
  `survivors 0`, `portClosed true`, `egressNonLoopback 0`.
- The gate quote is real: served bytes at `https://playwright.dev/docs/browsers` contain
  "Playwright doesn't work with the branded version of Firefox since it relies on patches."
  (§Firefox), and the page's next sentence ("matches the recent Firefox Stable build") is
  consistent with the observed 157.0 build.
- QUALITY rule 10 is satisfied: no earlier round is missing its lesson (checked rounds 1–38);
  `corpus/lessons/round-38.md` exists.

## Out of scope / not done

- Did not run the C2 counter (its predicate includes a live Firefox leg) or the Playwright
  driver; no new receipt produced. Did not judge whether `admitted >= 16` holds at REV.
- Did not evaluate C1's `c1-adjacency-sweep-v6.mjs` (separate seat surface) nor any sibling
  seat's findings; peers are not treated as authorities here.
- No production edit, no commit/push, no git/jj mutation, no fleet/sibling repo writes,
  no pacman (none needed; no tool installed or upgraded — nominal tools only: `node`,
  `curl`, `python3`, `git`, `ss`, `sha256sum`).
- Known limit of this note: the wave was **live** — SOURCES.md, the lesson, LOG, SCORECARD
  and the receipt changed under inspection. Every finding is pinned to `3bc0b10` bytes
  (or an explicitly timestamped pre-commit state) and should be re-derived at the measured REV.

## Artifact paths

- Report: `.ufo/waves/round-38/w1/Scribe56.md` (this file).
- Scratch (removed before yield): `/fast/scratch/hyaku/tabi-r38/Scribe56/`
  (`c1-at-3bc0b10.json`, `c1-stderr.txt`, `pw-browsers.html`, `gateblind/` fixture).
