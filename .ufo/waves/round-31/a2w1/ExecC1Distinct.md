# ExecC1Distinct — supplementary row metrics for C1 (tabi round 31, a2w1)

Seat: executor. Target: the 13 landed rows of `corpus/knowledge/rate-signal-decision-table.md` at
`486048356f0712e4396588c9dab58cd419243120` (entry sha256 `2371692d…951b86`), read row by row with a
metric the frozen counter does not have. This seat builds no predicate and admits nothing: the script
reports measurements beside the counter, and every number below comes from a run recorded under
`.ufo/waves/round-31/a2w1/ExecC1Distinct/` and in scratch commit `bec68347dc6fec0f0830e85d3de37299eb975279`.

**Verdict.** The landed table survives the row-by-row reading: on 13 rows it holds **13 distinct (source,
quote) pairs**, **12 distinct (source, threshold number, unit) triples** and **13** once the bound word is
kept, every row's unit synonym occurs in its located quote, every bound word the threshold cell states
occurs in that quote (and D1/D2's floor-vs-ceiling pair is correctly split), every threshold number occurs
exactly once in its quote — no row reuses a number in a second role — and no row cites a quote another row
also cites. The metric demonstrably distinguishes the w1 pad control, which scores **1 pair / 1 triple / 1
quad on ten rows** — but only on the **totals**: each of the ten pad rows passes every per-row metric, so
per-row measurement is necessary and not sufficient, and the counter's repetition hole is closed by this
evidence only for *this* data, not by any gate. Three low-severity observations attach to individual rows
and none of them changes admission or the claim: (a) `D12` states unit `requests` that its quote attaches to
a different noun ("make another request"), not to the `0`; (b) `D12` is the one row whose Decision cell
claims RFC-2119 force (`SHOULD strength`) that the quote does not carry as a capital keyword — the quote has
the vendor's lower-case "you should not"; (c) `D7`, `D8`, `D10` and `D11` drop the source's rate denominator
from the threshold cell ("60 requests" for "60 requests per hour"), though each row keeps the denominator in
its signal or decision text and the entry's Limits paragraph keeps the vendor scope. Consequence for C1: the
claim's sourced-threshold surface is real on all 13 rows and is not padded; the residual weakness is the
counter's documented absence of unit/bound enforcement (w1/CritC1Counter), which the landed rows happen to
satisfy rather than exploit — so that hole stays a frozen counter defect, not a C1 data defect.

---

## What was measured, and by what

`row-metrics.mjs` (in this directory, committed at `bec68347…` as `a2w1-exec-c1-distinct/row-metrics.mjs`,
sha256 `8ab86129…cccc40`) parses the table with the counter's own `parseTable` and normalises receipt bytes
with the counter's own `normalise`: both functions, plus `ENTITIES`, `collapse`, `UNIT_RE`, `NUMBER_WORDS`,
`HEADER`, `splitRow`, `quoteSpans` and `numbersIn`, are **extracted textually from the counter blob at
`--rev`** (`scripts/check-decision-table.mjs`, sha256 `d15f3bd7…f6832` = `claims.json` frozenDigests), not
re-implemented. Receipt bytes come from `git show <rev>:corpus/evidence/round-31/decision-table/bytes/…`
after the receipt's own `sha256`/`http_status` are re-checked, so every quote below is located in committed
bytes, never in a live fetch. **This seat made no network request.**

Per-row fields, exactly as assigned: source; threshold number; unit; bound word; whether the unit word or
its plain synonym (`s/second`, `min/minute`, `h/hour`, `KiB/kibibytes`, `requests/request`,
`redirects/redirect`, `points`, `concurrent`) occurs in the quote; whether the bound word (`at least` /
`more than` / `no more than`; `none` when the threshold cell carries no bound) occurs in the quote; whether
the threshold number occurs in the quote only as that quantity, with every other occurrence of that number
and every other number in the quote listed. Three supplementary fields are reported beside those and used
only as observations: whether a unit synonym sits within three words after the number's occurrence; whether
the quote states a rate the threshold cell drops; and whether the Decision cell's RFC-2119 modal matches a
capital modal in the quote (with the entry's `(derived)` marker rule applied as the entry writes it).

## Commands and exit codes

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                                   # exit 0
git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120                                     # exit 0
git -C "$S/clone" status --porcelain | wc -l -> 0
sha256sum "$S/clone/scripts/check-decision-table.mjs"
  d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832                                          # = frozenDigests

cd "$S/clone" && TMPDIR=$S node scripts/check-decision-table.mjs \
  --rev 486048356f0712e4396588c9dab58cd419243120 \
  --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc \
  --entry corpus/knowledge/rate-signal-decision-table.md --json > "$S/counter-offline.json"                # exit 0
  -> population 13, admitted 13, failing 0 (offline; D1..D13 all admitted)

cd "$S/clone" && TMPDIR=$S node "$OUT/row-metrics.mjs" --repo "$S/clone" \
  --rev 486048356f0712e4396588c9dab58cd419243120 \
  --entry corpus/knowledge/rate-signal-decision-table.md --json-out "$S/landed.json"                       # exit 0

cd "$S/clone" && TMPDIR=$S node "$OUT/row-metrics.mjs" --repo "$S/clone" \
  --rev 486048356f0712e4396588c9dab58cd419243120 \
  --entry .ufo/waves/round-31/w1/CritC1Axis/fixture-entry-pad.md \
  --entry-file "$OUT/fixture-entry-pad.md" --json-out "$S/pad.json"                                        # exit 0
```

`--live` was **not** re-run by this seat: the live leg is the L1's reading (`population 13, admitted 13,
failing 0, live`) and the claim's kill rule keeps it the counter's job. The offline run above is used only
to confirm that the 13 rows this metric parses are the same 13 the counter admits. Full argv and digests:
`commands.txt` in this directory. Scratch clone kept at
`/fast/scratch/hyaku/tabi-r31/ExecC1Distinct/clone` (detached at the lane rev plus the output commit
`bec68347…`, `git status --porcelain` empty before the commit).

## Totals — landed table vs pad control

| Total | Landed table (13 rows) | Pad control (10 rows) |
|---|---|---|
| distinct sources | 3 (S119, S121, S122; S120 is prose only, as claimed) | 1 (S119) |
| distinct quotes | 13 | **1** |
| distinct (source, quote) pairs | **13** | **1** |
| distinct (source, threshold number, unit) triples | **12** | **1** |
| distinct (source, number, unit, bound) quads | **13** | **1** |
| distinct (number, unit) pairs across sources | 12 | 1 |
| rows failing `unit_in_quote` | none | none |
| rows failing `bound_in_quote` | none | none |
| rows failing `number_in_quote` | none | none |
| rows failing `number_only_as_quantity` | none | none |
| rows failing `force_consistent` | D12 | none |
| rows whose quote rate the threshold cell drops | D7, D8, D10, D11 | none |

The triple count is 12 because `D1` (`at least 5 redirects`) and `D2` (`more than 5 redirects`) share
`(S119, 5, redirect)`; the quads are 13 because they are the floor and the ceiling of that one bound, with
different quotes. That is a resolution limit of the triple metric, not padding — and it is the exact pair a
unit/bound-blind counter could not tell apart.

The pad control is the w1 file `fixture-entry-pad.md` (sha256 `7f2ee65…72bf`, the same bytes CritC1Axis
committed as `fixture-entry-pad.md`): ten rows, one quote, one S119 receipt, threshold `5 redirects`
throughout. It scores 1 / 1 / 1 against the landed 13 / 12 / 13, and each of its ten rows passes every
per-row metric — so the totals separate store-one-quote padding from the landed table, and no per-row metric
does. That asymmetry is the honest reading of what this measurement can and cannot see.

## Per-row readings (landed table, `LANDED` = `landed.json`)

| Row | Source | Threshold cell | num / unit | Unit synonyms in quote | Bound (in quote) | #occ of num | Only as that quantity | Unit adjacent | Quote rate | Force |
|---|---|---|---|---|---|---|---|---|---|---|
| D1 | S119 | `at least 5 redirects` | 5 / redirect | redirects | yes (at least) | 1 | yes | yes | n/a | consistent |
| D2 | S119 | `more than 5 redirects` | 5 / redirect | redirects | yes (more than) | 1 | yes | yes | n/a | consistent |
| D3 | S119 | `30 days` | 30 / day | days | none (consistent) | 1 | yes | yes | n/a | consistent |
| D4 | S119 | `more than 24 hours` | 24 / h | hours | yes (more than) | 1 | yes | yes | n/a | consistent |
| D5 | S119 | `at least 500 KiB` | 500 / kib | kibibytes, kib | yes (at least) | 1 | yes | yes | n/a | consistent |
| D6 | S121 | `at least 1 minute` | 1 / min | minute | yes (at least) | 1 | yes | yes | n/a | consistent |
| D7 | S121 | `60 requests` | 60 / request | requests | none (consistent) | 1 | yes | yes | **dropped** (per hour) | consistent |
| D8 | S121 | `5,000 requests` | 5000 / request | requests | none (consistent) | 1 | yes | yes | **dropped** (per hour) | consistent |
| D9 | S121 | `no more than 100 concurrent` | 100 / concurrent | concurrent | yes (no more than) | 1 | yes | yes | n/a | consistent |
| D10 | S121 | `no more than 900 points` | 900 / point | points | yes (no more than) | 1 | yes | yes | **dropped** (per minute) | consistent |
| D11 | S121 | `no more than 90 seconds` | 90 / s | seconds | yes (no more than) | 1 | yes; other number in quote: 60 | yes | **dropped** (per 60 seconds of real time) | consistent |
| D12 | S122 | `0 requests` | 0 / request | request (not adjacent) | none (consistent) | 1 | yes | **no** | n/a | **mismatch** |
| D13 | S122 | `at least 1 second` | 1 / s | second | yes (at least) | 1 | yes | yes | n/a | consistent |

Row-level facts behind the "consistent" cells, so a reader can check them without the script:

- **Bound direction matches the action's polarity on every bounded row.** Floors carry `follow` (D1),
  `limit` (D5), `wait` (D6), `pause` (D13); ceilings carry `stop` (D2), `refetch` (D4), `cap` (D9, D10,
  D11). The w1 A2 hole (a threshold cell whose bound the quote contradicts) is not exploited anywhere:
  `bound_other_in_quote` is empty on all 13 rows, i.e. no quote states a second, different bound phrase.
- **Rows with no bound phrase say nothing the quote does not.** D3 (`30 days`), D7, D8 and D12 carry no
  bound word, and their quotes carry none either (`(for example, 30 days)`, `is 60 requests per hour`,
  `limit of 5,000 requests per hour`, `header is 0`). No row invents a bound.
- **No number reuse.** Every one of the 13 threshold numbers occurs exactly once in its quote, digits or
  English word (`five` in D1/D2, `one` in D6/D13 via `at least one minute` / `at least one second`). The
  only other numeral in any landed quote is D11's `60` in `per 60 seconds of real time` — the rate's
  denominator, not a second threshold. The w1 "non-threshold number satisfies the counter" hole therefore
  has no victim in this data; the "pronoun one" case (w1 A4) does not occur either.
- **Quotes are distinct and located.** All 13 quotes are distinct strings and each is a substring of its
  receipt's normalised bytes (`quote_located_in_receipt: true` on every row; `receipt_problem: null`).
  Nothing repeats a quote across rows, which is what the pad control does.

## Observations (low severity; none changes admission)

1. **D12 — unit not attached to the number by the quote.** Threshold cell `0 requests`, quote
   `"If the x-ratelimit-remaining header is 0 , you should not make another request until after the time
   specified by the x-ratelimit-reset header."` The unit synonym `request` occurs in the quote only inside
   `make another request`; the three words after the `0` are `,` `you` `should`, so no unit sits beside the
   number. So `unit_in_quote` passes while
   the stricter adjacency reading fails: the source attaches no unit to the `0` at all — the `0` is the
   header's value. The page states elsewhere that the remaining count is of requests, so the row is not
   wrong, but its located quote does not carry the unit. Evidence: `landed.json` → `rows[11].metrics`
   (`unit_adjacent_to_number: false`, `words_after_number: ["you","should","not"]`).
2. **D12 — force inflated by one step.** The Decision cell ends `SHOULD strength (GitHub REST API policy)`;
   the quote's only modal is the vendor's lower-case `you should not`, and `force_quoted_capitals` is `[]`.
   The entry's own `(derived)` rule ("no RFC 2119 keyword in capitals, no lower-case directive addressed to
   the caller") is satisfied by the lower-case directive, so the marker is correctly omitted — but writing
   `SHOULD` in capitals presents a vendor sentence with RFC-2119 strength it does not have. The
   parenthetical attribution limits the damage. All other rows match: D1 `SHOULD`, D2 `MAY`, D3 `MAY`,
   D4 `SHOULD NOT`, D5 `MUST` each occur as capitals in their quote; D6, D13 and the five `(derived)` rows
   (D7–D11) declare no modal, and D7–D11's quotes carry none, exactly as the marker rule requires.
3. **D7, D8, D10, D11 — the rate denominator is in the row, not in the threshold cell.** The quotes give
   `60 requests per hour`, `5,000 requests per hour`, `900 points per minute`, `90 seconds … per 60 seconds
   of real time`; the threshold cells give `60 requests`, `5,000 requests`, `900 points`, `90 seconds`. Each
   row keeps the denominator in its signal or decision text (`per hour`, `per minute`, `per 60 s of wall
   clock`), and the entry's Limits paragraph forbids carrying a vendor number to another host, so no row
   reads as a bare count — but a reader who takes only the Threshold column gets a quantity without its
   time base. Because the counter reads only the number, this is invisible to it either way.

Not a finding, recorded so the reading is complete: no row cites S120, which matches the claim ("S120 is
cited in prose only"); no row's decision verb conflicts with a capital modal in its quote; and the robots.txt
rows remain scoped to crawlers, which the entry's U4 already discloses.

## Files

- `row-metrics.mjs` — the measuring script (`--repo`, `--rev`, `--entry`, `--entry-file`, `--receipts`,
  `--json-out`); counter helpers extracted from the counter blob at `--rev`.
- `landed.json` — full per-row output for the landed table (13 rows, all fields, totals).
- `pad.json` — the same output for the w1 pad control (10 rows, 1 quote).
- `counter-offline.json` — the frozen counter's offline reading used for the row-set cross-check.
- `fixture-entry-pad.md` — copy of the w1 control entry (sha256 `7f2ee65…72bf`), so the control run does
  not depend on a sibling wave directory.
- `commands.txt` — exact argv, exit codes, revisions and sha256 digests.

No lane file was edited: the lane checkout was read only through `git show` in the scratch clone, and the
only lane writes are this report and `.ufo/waves/round-31/a2w1/ExecC1Distinct/`. Tooling: none installed.
