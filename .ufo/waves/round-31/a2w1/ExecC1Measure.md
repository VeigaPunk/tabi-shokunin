# ExecC1Measure — C1 counting re-run at 4860483 (tabi round 31, attempt 2, wave a2w1)

**Verdict (one paragraph).** The C1 counter holds as measured and the live path fails closed. In a clean clone
(`git status --porcelain` empty) of lane tip `486048356f0712e4396588c9dab58cd419243120`, with
`scripts/check-decision-table.mjs` byte-identical to `claims.json` `frozenDigests`
(`d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`) and `git diff --name-only
9505a10eb80b2a0b273ebaba3f7f872ad302192d 486048356f0712e4396588c9dab58cd419243120 -- scripts/` empty, the frozen
command exits 0 with **population 13, admitted 13, failing 0** under `--live` and the identical 13/13/0 without it;
the freeze-time before reading reproduces population 0, admitted 0, exit 1 (entry absent). With a deliberately broken
network for the counter process only (`HTTPS_PROXY=http://127.0.0.1:9`), the same `--live` run exits 1 with admitted 0,
failing 13, every row `l1-live` — the counter has no fallback to committed bytes, so it fails closed. Reading the 13
landed rows one by one against the committed receipt bytes and a fresh live fetch (four pages, HTTP 200,
2026-10-26T12:28:34Z), every threshold is the source's own number with the source's own force: D1–D5 carry capital
RFC 9309 keywords (SHOULD / SHOULD NOT / MUST / MAY), D6, D12 and D13 rest on lower-case directives, and D7–D11 rest
on declared vendor limits and are marked `(derived)`; no two rows share a quote. Four families of low-severity
unit/scope imprecision remain (N1–N4 below), all inside the already-frozen counter holes (unit provenance, fragment
scope); none changes a number, a force, a scope that matters, or the count, so the frozen predicate is met and the
depth claim is not falsified by this seat's measurement.

Milestone: C1. Seat: ExecC1Measure (leaf; no subagent dispatched).

## 1. Setup and integrity

```bash
S=/fast/scratch/hyaku/tabi-r31/ExecC1Measure; export TMPDIR="$S"
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"            # exit 0
git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120               # exit 0
git -C "$S/clone" status --porcelain                                                 # empty
git -C "$S/clone" rev-parse HEAD                                                     # 486048356f0712e4396588c9dab58cd419243120
sha256sum "$S/clone/scripts/check-decision-table.mjs"                                # d15f3bd7…f6832  == frozenDigests
sha256sum "$S/clone/scripts/check-selfassessment.mjs"                                # 143d66ff…2fce   == frozenDigests
git -C "$S/clone" diff --name-only 9505a10eb80b2a0b273ebaba3f7f872ad302192d 486048356f0712e4396588c9dab58cd419243120 -- scripts/
                                                                                     # empty, exit 0
node scripts/check-decision-table.mjs --selftest                                     # exit 0; DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34
```

The selftest run was included only because the C1 gate-registry row (`SKILL.md:2575`) states `(cases=34, passed=34)`
and the claim's separability names that tally as C2's input; it writes only under `TMPDIR`, never the lane.

## 2. Measurements (JSON written to files first, never piped into jq)

All runs: cwd `$S/clone`, `TMPDIR=$S`.

| # | Command (abridged to the varying flag) | Exit | population | admitted | failing | live |
|---|---|---|---|---|---|---|
| M1 | `--rev 4860483… --baseline 96a2d1a… --entry corpus/knowledge/rate-signal-decision-table.md --live --json` | **0** | 13 | **13** | **0** | true |
| M2 | same, without `--live` | **0** | 13 | 13 | 0 | false |
| M3 | same as M1 with `HTTPS_PROXY=http://127.0.0.1:9` (plus lowercase/`HTTP_PROXY`; `NO_PROXY=` empty) | **1** | 13 | 0 | 13 | true |
| M4 | `--rev 9505a10e…` (freeze tree; before value) | **1** | 0 | 0 | 0 | false (`entryPresent:false`) |

Per-row reasons: M1/M2 — every row `admitted:true, reason:null` with its threshold (D1 5, D2 5, D3 30, D4 24, D5 500,
D6 1, D7 60, D8 5000, D9 100, D10 900, D11 90, D12 0, D13 1). M3 — all 13 rows `admitted:false, reason:"l1-live"`.
M4 — no rows (entry absent). Source split: S119×5 (D1–D5), S121×6 (D6–D11), S122×2 (D12–D13); S120 has a receipt and
is cited in prose only, as the assignment states.

Raw files (also copied to this seat's output dir): `c1-live.json`, `c1-offline.json`, `c1-live-brokenproxy.json`,
`c1-before-freeze.json`, `c1-selftest.txt`.

## 3. Does `--live` fail closed?

Yes, structurally and observably. `liveOk()` (`scripts/check-decision-table.mjs:208-214`) returns false on any
non-200, non-https or off-host final URL, and the caller fails the row with `l1-live` (`:287-291`); there is no branch
that falls back to the committed receipt when a fetch fails. M3 confirms it: with the proxy poisoned the counter still
reads the committed registry/receipts (population 13) but admits nothing, and exits 1. The counter's own live controls
(`live-self-quote-receipt`, `live-offhost-redirect`, `live-non-200`, `live-fetch-failed`, `:359-362`) are present and
pass in the 34/34 selftest.

Inherited hole, not re-verified here: a *trusted* proxy/CA environment can satisfy `--live` by serving the quote from
itself (w1/SentinelC1Live.md). Reproducing that needs a CA in curl's trust store; this seat did not alter any trust
store, so the hole stands as carried, not as a new finding.

## 4. Network ledger (read-only HTTPS GETs; `curl -q -sS --proto =https --proto-redir =https`)

| UTC | URL | HTTP | bytes | sha256 |
|---|---|---|---|---|
| 2026-10-26T12:28:33Z | https://www.rfc-editor.org/rfc/rfc9309.txt | 200 | 25265 | f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 |
| 2026-10-26T12:28:34Z | https://www.rfc-editor.org/rfc/rfc6585.txt | 200 | 17164 | f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 |
| 2026-10-26T12:28:34Z | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 200 | 337116 | 47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9 |
| 2026-10-26T12:28:34Z | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | 200 | 328088 | e4050f6bab26d33a4f6e8cc633555bb55478f9cc0c2857e37e77ff7ba38147b0 |

The RFC fetches are byte-identical to the committed receipts. The two GitHub fetches have the same byte **count** as
their receipts but a different sha256; a diff shows the only changing value is the Next.js `"buildId"` token (e.g.
`ltuTboUIVptrdqXZZauaN` → `xU-2nvoRQaQJjVgNhAf2O`), i.e. the article text is unchanged and the receipts can never be
byte-identical to a live fetch. That is why the live oracle must be quote-presence (as built), not byte equality.
Independent check with the counter's normalisation rules re-implemented: all 13 quotes locate in these live bodies
(13/13), and all 13 locate in the committed receipt bytes.

No login, cookie, credential or API endpoint was used; no request reached `api.github.com`.

## 5. Row-by-row read of the landed table (`corpus/knowledge/rate-signal-decision-table.md:49-61`)

`row-audit.tsv` in the output dir carries the machine columns; the judgment columns are here.

| Row | line | src | Threshold cell | Source's number in quote | Force in the located quote | `(derived)` | Distinct quote | Verdict |
|---|---|---|---|---|---|---|---|---|
| D1 | 49 | S119 | at least 5 redirects | "five" | SHOULD (caps) | no | yes | holds |
| D2 | 50 | S119 | more than 5 redirects | "five" | MAY (caps) | no | yes | holds |
| D3 | 51 | S119 | 30 days (example period, said in Signal) | "30" | MAY (caps) | no | yes | holds, quote truncated (N3) |
| D4 | 52 | S119 | more than 24 hours | "24" | SHOULD NOT (caps) | no | yes | holds |
| D5 | 53 | S119 | at least 500 KiB | "500" | MUST (caps) | no | yes | holds (floor, correctly stated as a floor) |
| D6 | 54 | S121 | at least 1 minute | "one" | lower-case imperative ("wait …") | no | yes | holds, signal branch imprecise (N4) |
| D7 | 55 | S121 | 60 requests | "60" | declared limit ("is 60 requests per hour") | yes | yes | holds, rate denominator dropped (N1) |
| D8 | 56 | S121 | 5,000 requests | "5,000" | declared limit | yes | yes | holds, rate denominator dropped (N1) |
| D9 | 57 | S121 | no more than 100 concurrent | "100" | declared limit | yes | yes | holds, unit cell "concurrent" (N1) |
| D10 | 58 | S121 | no more than 900 points | "900" | declared limit | yes | yes | holds, rate denominator dropped (N1) |
| D11 | 59 | S121 | no more than 90 seconds | "90" (also "60" in the same quote) | declared limit | yes | yes | holds, two numbers in one quote (N1) |
| D12 | 60 | S122 | 0 requests | "0" | lower-case directive ("you should not") | no | yes | holds, unit provenance (N1) |
| D13 | 61 | S122 | at least 1 second | "one" | lower-case imperative | no | yes | holds, fragment scope (N2) |

Checks applied row by row (the things the counter does not decide): the threshold's number is the source's own number
and not a status code, RFC/document number, section number, pronoun or specimen value; the quote's force matches the
Decision cell's verb and its `(derived)` marker; the actor and access date are named (RFC 9309, or GitHub policy at
2026-10-26); the scope the source binds the number to is the scope the row states; and no quote is reused. Thirteen
rows, thirteen distinct quotes.

Findings — all **low severity**, none falsifying a number, a force or the count:

- **N1 — unit provenance / rate denominator (low).** D12 (line 60) records `0 requests`: the quote carries the
  source's `0` but the unit `requests` is the author's, and the quoted string even preserves the counter's
  tag-stripping artifact `"is 0 , you"` (the page renders `0, you`). D9 (line 57) writes the unit as `concurrent`
  where the source says `concurrent requests`. D7, D8 and D10 (lines 55, 56, 58) drop the quote's `/hour` `/minute`
  denominator from the Threshold cell; the Decision cell carries "per hour"/"per minute". This is exactly the frozen
  `n1-threshold-sourced` hole (`scripts/check-decision-table.mjs:286`: the numeric token only), and QUALITY 80's
  row-by-row reading catches it without overturning the row.
- **N2 — fragment scope (low).** D13 (line 61) quotes `"wait at least one second between each request."`, a clause cut
  from "If you are making a large number of POST, PATCH, PUT, or DELETE requests, wait at least one second between
  each request." The methods and the "large number" qualifier live in the Signal cell, not in the quote; the threshold
  itself is the source's.
- **N3 — decision clause outside the located quote (low).** D3 (line 51) truncates at `crawlers MAY assume`, so the
  "or continue to use a cached copy" branch the Decision cell cites is in the omitted tail. D2 (line 50) adds "which
  re-enters the 400–499 outcome", a §2.3.1.3 inference the quote does not contain. D12 adds "(UTC epoch seconds)",
  which is the vendor's next sentence. The forces are each quoted correctly; the extra clauses are sourced in the
  entry's prose but not in the located span.
- **N4 — signal branch imprecision (low).** D6 (line 54) says `x-ratelimit-remaining` "not `0`", but the vendor's
  `Otherwise` branch (S121: "If the `x-ratelimit-remaining` header is 0 … Otherwise, wait for at least one minute")
  also covers an absent header; as written the row is silent on the absent case.

None of N1–N4 is repairable under this round's freeze (the counter and rows are frozen); they are recorded for the
next freeze as counter-v2 items / row-prose cleanups, consistent with lesson M10.

## 6. Adjacent frontier-step spot checks (read only, corroborating)

- `corpus/SOURCES.md:133-136` — S119–S122 are present at REV, status `mined`, `used-by` names the entry, and none of
  the four ids exists at baseline `96a2d1a` (grep count 0 each). Anchors carry the line numbers the quotes come from
  (S119 five-redirect at 377-384, 30 days at 406, 24 hours at 419, 500 KiB at 425).
- Receipts `corpus/evidence/round-31/decision-table/{S119,S120,S121,S122}.json` — `http_status 200`, `bytes_path`
  committed, and each file's sha256 equals the recorded one (f633915d…, f6d55d1b…, 3a33f87b…, b15c1c0b…).
- `corpus/lessons/round-31.md` — Mistakes M1–M10 present (table rows at `:66-75`); M10 (`:267`) already names this
  counter's repetition/non-threshold-number hole, which 5's N1–N4 confirm on the landed rows.
- `corpus/QUALITY.md:457-471` — criteria 80–81 present; criterion 80 is the row-by-row rule this section applied.
- `corpus/README.md:670-676` — round-31 row and frontier restatement present, append-only.
- `SCORECARD.md:1568` — appended correction citing `SCORECARD.md:1523`, with the measured residual (1) and cause (M1).
- `SKILL.md:2575` — decision-table registry row states `(cases=34, passed=34)`; the selftest reproduces 34/34.

## 7. What this does not establish

- Nothing is measured against a real host; the table is documentary (its own Limits say so). This seat made no request
  to `api.github.com` and exercised no credential.
- The live check is quote-presence on the current page, not byte-identity (the buildId alone makes the latter
  impossible for the vendor pages). A vendor edit that keeps the quote passes; an edit that removes it fails the row.
- The frozen counter holes from w1 stand unchanged: repetition of one quote across rows and non-threshold numbers in a
  quote are admitted (w1/CritC1Axis.md, w1/CritC1Counter.md); a trusted proxy/CA environment can satisfy `--live`
  (w1/SentinelC1Live.md). This seat reproduced the first only indirectly (the landed table has no repeated quote) and
  did not attempt the third.
- The offline and live readings coincide on this work (13/13 both); the live gate added no discrimination here, though
  its J3 control shows it can.

## 8. Artifacts, tooling, blockers

Output dir `.ufo/waves/round-31/a2w1/ExecC1Measure/`: `c1-live.json`, `c1-offline.json`, `c1-live-brokenproxy.json`,
`c1-before-freeze.json`, `c1-selftest.txt`, `fetch-ledger.txt`, `row-audit.tsv`.

Tooling: no installs, no upgrades, no pacman transaction (host-wide pause respected). Scratch clone and TMPDIR under
`/fast/scratch/hyaku/tabi-r31/ExecC1Measure`, removed after the receipts were copied. Lane tree, lane index and jj
state untouched; git in the lane was read-only.

Blockers: none. Residual uncertainty: the three carried counter/live holes above, which the freeze places out of scope
for repair this round.
