# Round 31 w1 — ScribeRowsGitHubPractice (C1 build, S122 rows)

**Verdict:** S122 (GitHub's *Best practices for using the REST API*) honestly supports **three** decision-table rows, and all three are admitted end-to-end (offline and `--live`) by the frozen counter `scripts/check-decision-table.mjs` (sha256 `d15f3bd7…f6832` = `claims.json` `frozenDigests`) when run against a scratch fixture repo carrying the real fetched bytes as the S122 receipt: **population 3, admitted 3, failing 0, exit 0**. Nothing was invented: each threshold is the source's own number, each quote is a verbatim substring of the normalised page, and the one sentence whose full span exceeds the 25-word cap was carried as an 8-word verbatim fragment. The source cannot supply a fourth numeric row — every other rate/poll/redirect/backoff statement in the page states its bound as a runtime header value, as "an exponentially increasing amount", or not at all; six such candidates were forced into the row grammar and all six were refused at `n1-threshold-sourced`, which is the same reason id the lane's `c1-J4-invented-thresholds.json` control produces. **This seat did not write the lane entry**; the C1 predicate stays unverified until the L1 lands `corpus/knowledge/rate-signal-decision-table.md`, the S119–S122 registry rows and the receipts, and runs the counter in a clean lane checkout.

## 1. Environment and provenance

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
$ git -C "$S/clone" checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d
$ git -C "$S/clone" rev-parse HEAD          -> 9505a10eb80b2a0b273ebaba3f7f872ad302192d
$ sha256sum clone/scripts/check-decision-table.mjs
d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832  clone/scripts/check-decision-table.mjs
```
equals `claims.json` → `frozenDigests["scripts/check-decision-table.mjs"]`. `$S` = `/fast/scratch/hyaku/tabi-r31/ScribeRowsGitHubPractice` (TMPDIR passed explicitly).

Registry state at both commits (read-only `git show` in the clone):

```
S119 at-freeze-rows=0 at-baseline-rows=0
S120 at-freeze-rows=0 at-baseline-rows=0
S121 at-freeze-rows=0 at-baseline-rows=0
S122 at-freeze-rows=0 at-baseline-rows=0
corpus/knowledge/rate-signal-decision-table.md at 9505a10e: absent
```
So `r4-new-row` is satisfiable for S122 and the C1 "before" reading (entry absent, population 0) is consistent with what I see at the freeze commit.

### Fetch record (one read-only GET, no credentials)

```
$ curl -q -sS --proto =https -L --max-redirs 5 --max-time 60 \
    -o bytes/S122.html -w '%{http_code} %{size_download} %{url_effective}\n' \
    'https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api'
200 328088 https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api
$ sha256sum bytes/S122.html
fc5290503571737f64ba921e415cb8ea0bd0fcf799cf0eb295bc49e242e01714  bytes/S122.html
t_start_utc 2026-10-26T08:36:21Z   t_end_utc 2026-10-26T08:36:21Z   exit 0
```
Recorded at `evidence/fetch.log`. No `api.github.com` call, no login, no cookie, no session material.

### Normalisation was the counter's own function, not a reimplementation

I copied the frozen counter to `counter-nomain.mjs` and removed **only** the final `main();` dispatch line (the module calls `main()` at import, which would exit 2 on my argv), then imported `normalise` from it:

```
$ node --input-type=module -e 'import { normalise } from "./counter-nomain.mjs"; … '
chars 13476 words 2032        (bytes/S122.normalised.txt)
```
The article body is 9279 characters of that text, from "Avoid polling You should" to "Further reading".

```
$ grep -o -E 'Follow redirects.{0,900}' bytes/S122.normalised.txt   # full redirect paragraph
$ grep -o -E '[^.]*429[^.]*\.' bytes/S122.normalised.txt            # (no output)
```
**Finding:** the page contains no `429` token. Its rate-limit-error branch is therefore keyed on the `retry-after` header (present / absent), not on a status code — which is why D2's signal is a header condition and why no `429` row can be sourced from S122.

## 2. Per-row proof (quote is a substring; threshold number is inside the quote)

`proof.mjs` parses the three delivered lines exactly as the counter's `splitRow` does, applies the counter's `UNIT_RE` and `numbersIn` verbatim, and tests `normalise(bytes).includes(quote)`:

```
$ node proof.mjs ; echo EXIT=$?
D1 src=S122
  quote: "If the x-ratelimit-remaining header is 0 , you should not make another request until after the time specified by the x-ratelimit-reset header."
  words=22 includes=true index=5960
  threshold="no more than 0 requests" -> tnum=0 numbersIn(quote)=[0] n1=true
D2 src=S122
  quote: "Otherwise, wait for at least one minute before retrying."
  words=9 includes=true index=6157
  threshold="at least 1 min" -> tnum=1 numbersIn(quote)=[1] n1=true
D3 src=S122
  quote: "wait at least one second between each request."
  words=8 includes=true index=5592
  threshold="at least 1 second" -> tnum=1 numbersIn(quote)=[1] n1=true
EXIT=0
```
(full output: `evidence/proof.txt`). Notes that matter:
- D1's quote carries the page's rendered spacing `is 0 , you` (space before the comma) because the normalised text has it; the delivered row reproduces it character for character, which is why `index=5960` is non-negative.
- D2's `1` is the English number word `one` present in the quote; `numbersIn` maps it to 1.
- D3's whole sentence is 26 words (over the 25-word cap; a forced whole-sentence variant fails `q1-quote-length`), so the span starts at `wait` and still contains both the action and the number.

The three `|` lines in `rows.md` are byte-identical to the lines proved above:

```
$ head -3 .../rows.md > /tmp/rows3.md ; diff /tmp/rows3.md rows-draft.md && echo ROWS_IDENTICAL
ROWS_IDENTICAL
```

## 3. Frozen counter end-to-end on a scratch fixture repo

Fixture: `fix/repo` (own git repo; `git -C "$R" rev-parse --show-toplevel` = `$S/fix/repo`; identity `-c user.name=ScribeRowsGitHubPractice -c user.email=scribe@scratch.local`). Commit 1 = baseline registry with **no** S122 row; commit 2 = S122 registry row (11 cells, `mined`, used-by the entry path) + the entry with my three rows + receipt `corpus/evidence/round-31/decision-table/S122.json` + `bytes/S122.html` (byte copy of the fetch). Nothing outside scratch was touched.

```
BASE=cf553823f90bbc5ce45bba6b1294cd0ad3e7809e   REV=c1f1604e2376b0e0f7991e3a67bc6e1e5c8dad7a

$ node clone/scripts/check-decision-table.mjs --repo "$R" --rev "$REV" --baseline "$BASE" \
    --entry corpus/knowledge/rate-signal-decision-table.md \
    --receipts corpus/evidence/round-31/decision-table --json
OFFLINE_EXIT=0   {'population': 3, 'admitted': 3, 'failing': 0}   D1/D2/D3 admitted, reason None

$ … same command plus --live
LIVE_EXIT=0      {'population': 3, 'admitted': 3, 'failing': 0}   D1/D2/D3 admitted, reason None
```
`evidence/offline.json`, `evidence/live.json`. `--live` refetched the page at run time and re-located all three quotes, so these rows are not self-quoted (the `c1-J3` attack shape does not apply to them).

## 4. Refused candidates, and proof that refusal is structural

Six sentences the page does carry — polling interval, 301 follow, 304 cache, 404 poll stop, serial-not-concurrent, exponential backoff — were forced into the row grammar with an author-chosen threshold (`evidence/probe-table.md`), committed as a third fixture commit, and run:

```
$ node clone/scripts/check-decision-table.mjs --repo "$R" --rev HEAD --baseline HEAD~2 \
    --entry corpus/knowledge/probe-table.md --receipts corpus/evidence/round-31/decision-table --json
PROBE_EXIT=1   population 6, admitted 0, failing 6
D1 n1-threshold-sourced   D2 n1-threshold-sourced   D3 n1-threshold-sourced
D4 n1-threshold-sourced   D5 n1-threshold-sourced   D6 n1-threshold-sourced
```
So each refusal is the counter's decision, not my taste: the source states no number for those decisions. Full reasoning per candidate, including the "not a driver decision" and worked-example cases (`etag`, `Wed, 25 Oct 2023 19:17:59 GMT`, `HTTP/2 200`, `issues/1347`), is in `rejected.md`; no candidate was refused as out of province (everything here sits in this lane's rate/rights discipline surface).

## 5. Findings for the L1

1. **Depth budget:** S122 yields 3 numeric rows, not 4+. The C1 target (admitted ≥ 10) therefore needs ≥ 7 rows from S119/S120/S121. If the S121 rate-limits page supplies fewer than expected, the L1 will see a shortfall that S122 cannot close honestly.
2. **D3 vocabulary caveat (decide before landing):** D3's signal is a request method, not a status code, response header or robots.txt condition. `t2` admits any backticked token, so the row is counter-admitted, but if the lane reads `t2`'s parenthetical as a closed vocabulary, drop D3 and keep D1–D2. I did not paper over the tension in the row itself.
3. **D1 threshold wording:** `no more than 0 requests` is the numeric restatement of "should not make another request"; the observable value `0` is the header's, so `n1` holds on the digit `0`. If the L1 prefers a different bound phrasing, any of `at most 0 requests` / `up to 0 requests` also match `UNIT_RE`, but the number must stay `0`.
4. **D2's "Otherwise":** the quote depends on the preceding `retry-after` sentence for its antecedent. The signal cell carries that antecedent (`retry-after` header absent); the row is not self-contained prose and the entry's surrounding text should say so if the L1 adds prose.
5. **Vendor scope:** all three rows are GitHub's policy for its own REST API (D1 "you should not", D2 SHOULD-strength "wait for at least one minute", D3 unhedged imperative inside a conditional). None is a general HTTP rule; the row cells say "GitHub vendor policy" so a later reader cannot mistake them for protocol law.

## 6. Touched surfaces

| Path | Status |
|---|---|
| `.ufo/waves/round-31/w1/ScribeRowsGitHubPractice/rows.md` | written (3 rows + commentary; paste unit is the first three lines) |
| `.ufo/waves/round-31/w1/ScribeRowsGitHubPractice/rejected.md` | written (15 refused sentences with reasons) |
| `.ufo/waves/round-31/w1/ScribeRowsGitHubPractice/evidence/{fetch.log,proof.txt,offline.json,live.json,probe.json,probe-table.md,rows-draft.md}` | written |
| `.ufo/waves/round-31/w1/ScribeRowsGitHubPractice/receipt/S122.json` + `receipt/bytes/S122.html` | written — byte copies for landing at `corpus/evidence/round-31/decision-table/`; bytes sha256 `fc529050…e01714` |
| lane tracked files / index / jj state / fleet repo / other lanes | untouched (read-only `git show`, `git cat-file` in the clone) |
| scratch `$HYAKU_SCRATCH/tabi-r31/ScribeRowsGitHubPractice` | removed after copying receipts out |

**Out of scope, not done:** the lane entry itself, the `corpus/SOURCES.md` S119–S122 rows, the round-31 lesson, and the C1 counting run in a clean lane checkout — C1 is *not* verified by this seat. No installs or upgrades were performed (nothing was needed; no pacman transaction was attempted). No builds, linters or formatters of the lane.

**Artifact paths (relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`):** `.ufo/waves/round-31/w1/ScribeRowsGitHubPractice.md`, `.ufo/waves/round-31/w1/ScribeRowsGitHubPractice/{rows.md,rejected.md,evidence/,receipt/}`.
