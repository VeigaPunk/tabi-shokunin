# ScribeEntryProse — C1 build: prose around the rate/crawl decision table (round 31, wave 1)

**Verdict.** The prose for `corpus/knowledge/rate-signal-decision-table.md` is drafted and mechanically
constrained as assigned: title, four `source:` lines (S119–S122, one per fetch, each with its anchor and
`fetched 2026-10-26`), `verified-at: 2026-10-26`, a per-source recheck cadence, `frontier: rate-tos-signal`,
the three required sections with `<!-- TABLE -->` exactly once where the table goes, zero double-quoted spans
of four or more words, and no stray Markdown table that could displace the counter's header match. The
grounding is first-hand rather than carried over: I fetched all four S119–S122 pages read-only myself
(200/200/200/200, UTC, bytes and sha256 recorded below), verified every number the prose cites against the
fetched bytes, and additionally produced a hand-off of **15 candidate counted rows** whose quotes and
threshold numbers pass the frozen counter's own `q1` (6–25 word single span), `q2` (substring of the
counter's own normalisation) and `n1` (threshold number present in the quote) checks. No lane tracked file,
index, or sibling path was written; the only writes are this report, the seat output directory, and scratch
now deleted.

## Deliverable

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/ScribeEntryProse/entry-prose.md`
(sha256 `a660ac57fdad8ad5f9b72a5a1a90b4acc9db419ba280ee7e4587014c2480758a`, 158 lines, 11.6 kB)

Structure as specified:

| part | lines | content |
|---|---|---|
| title | 1 | names the table's job, not the sources |
| `source:` ×4 | 3–6 | S119 `§2.3.1.2-§2.3.1.4, §2.4, §2.5`; S120 `§4, §7.2`; S121 four fragment ids; S122 four fragment ids |
| `verified-at:` | 7 | 2026-10-26 |
| `recheck:` | 8 | 180d for S119/S120 (errata-only standards text); 90d for S121/S122 (vendor pages, no revision marker in the fetched bytes) |
| `frontier:` | 9 | `rate-tos-signal` (inside the first 15 lines, as `check-frontier-admission.mjs:193` requires) |
| §What this table decides | 19–45 | row shape, closed verb set, the admission conditions, and the negative statement that it is neither budget nor permission |
| placeholder | 47 | `<!-- TABLE -->`, one occurrence |
| §How a journey driver uses it | 49–101 | robots.txt outcomes before any page fetch; then the vendor's own precedence `Retry-After` → `x-ratelimit-remaining=0`/`x-ratelimit-reset` → fallback one minute; status class is not a signal; request-time caps; redirect keep/replace rule |
| §Limits | 103–138 | documentation only; the lane's measured stop rule unchanged; one vendor at one date; RFC example values are examples; C3/C6 outcomes untouched with the exact delta stated; counting belongs to the counter |
| §Unknowns | 140–158 | U1 nothing measured; U2 silence is not a limit; U3 enforcement vs publication; U4 robots.txt is a crawler rule |

## Grounding (each number in the prose, re-located this round)

| prose claim | source | anchor in fetched bytes |
|---|---|---|
| robots fetch 400–499 leaves access open | S119 | `rfc9309.txt:387-396` (§2.3.1.3), `:392` the 400-499 range, `:394-396` the MAY-access sentence |
| unreachable robots (example 500–599) obliges complete disallow | S119 | `:398-408` (§2.3.1.4), `:402-403` MUST-assume + 500-599, `:406` 30 days |
| redirect budget five hops, cross-authority | S119 | `:373-386` (§2.3.1.2), `:377` five, `:380-382` within five, `:384-385` beyond five |
| cache ≤24 h unless unreachable | S119 | `:415-420` (§2.4), `:419` 24 hours |
| parsing limit ≥500 KiB | S119 | `:422-425` (§2.5), `:425` 500 kibibytes |
| 429 may carry `Retry-After`; example 3600; 50/hour example body; MUST NOT be cached | S120 | `:132-165` (§4), `:138`, `:145`, `:153`, `:165` |
| a server need not use 429 | S120 | `:292-301` (§7.2), `:300-301` |
| precedence `Retry-After` → remaining 0/reset → otherwise one minute | S121 | `#exceeding-the-rate-limit` (occurrence offsets 13144–14303 in the normalised page), and repeated in S122 `#handle-rate-limit-errors-appropriately` (offsets 5606–6505) |
| `x-ratelimit-reset` is UTC epoch seconds; values vary by region; headers beat `/rate_limit` | S121 | `#checking-the-status-of-your-rate-limit` (offsets 11890–13144) |
| concurrency ceiling and per-minute point ceilings; secondary limits change without notice | S121 | `#about-secondary-rate-limits` (offsets 9201–10901) |
| 403 and 429 are the same exceeded-limit class | S121 | `#exceeding-the-rate-limit` (offsets 13239–13486) |
| serial rather than concurrent; ≥1 s between mutative requests | S122 | `#avoid-concurrent-requests`, `#pause-between-mutative-requests` (offsets 5298–5843) |
| 301 replaces the stored URL, 302/307 do not | S122 | `#follow-redirects` (offsets 6505–7000) |
| fixture driver stops at the first trip and never waits the advertised delay | lane | `corpus/knowledge/external-class-fixture-v2.md` §5 (`Retry-After: 7`, no re-request) |
| C3/C6 stay asleep-blocked / approval-required | lane | `corpus/knowledge/interaction-approval-table.md` §2 rows C3, C6; §7 U1 |

## Fetch receipts (mine; the rows seat's receipts are separate)

`curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60`

| UTC | HTTP | bytes | sha256 | URL |
|---|---|---|---|---|
| 2026-10-26T08:36:37Z | 200 | 25265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` | https://www.rfc-editor.org/rfc/rfc9309.txt |
| 2026-10-26T08:36:38Z | 200 | 17164 | `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58` | https://www.rfc-editor.org/rfc/rfc6585.txt |
| 2026-10-26T08:36:38Z | 200 | 337116 | `ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18` | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api |
| 2026-10-26T08:36:38Z | 200 | 328088 | `b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e` | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api |

Copy: `.ufo/waves/round-31/w1/ScribeEntryProse/fetch-log.tsv`. Normalised lengths (counter's own
normalisation, re-implemented in scratch): 20886 / 14287 / 15503 / 13476 chars. The vendor bytes are two
pages I did not fetch before, so the digests above are the seat's, not a copy of a registry cell.

## Commands run and exit codes

```
git -C <lane> log --oneline -3 ; git status --porcelain          -> 0 (HEAD 9505a10; untracked only round-31 wave files)
grep -n '^| S11[5-9]|^| S12[0-4]' corpus/SOURCES.md              -> 0 (S119–S122 rows absent: the rows seat's work)
curl -q -sS --proto =https ... (four fetches)                    -> 0 each, HTTP 200, bytes/sha per table above
node norm.mjs (scratch; counter-equivalent normalisation)        -> 0
python3 ctx.py <norm> <pattern> (evidence windows)               -> 0
grep -n -E 'five consecutive redirects|24 hours|500 kibibytes|…' bytes/rfc9309.txt -> 0
node gen.mjs (candidate-row verifier)                            -> 0 ; one earlier invocation exited 1 on a
                                                                    SyntaxError introduced by my own sed edit of the
                                                                    scratch generator; fixed in place, all rows re-verified
grep -o '"[^"]*"' entry-prose.md | awk '>=4 words'               -> 0 matches (no 4+ word double-quoted span)
grep -c '^<!-- TABLE -->$' entry-prose.md                        -> 1
awk 'NR<=15 && /^(verified-at:|recheck:|frontier:)/'             -> 3 header lines present in first 15
grep -c '^|' entry-prose.md                                      -> 0 (no Markdown table before the placeholder)
python3 <scratch classifier> (token/imperative test per quote)   -> 9 of 15 rows fall through both tests
grep -o ' (derived) ' sourced-thresholds.md | wc -l              -> 9
awk -F'|' '/^\| D/ && !/<derived>|SHOULD|MAY|MUST|wait |pause /' -> 0 rows unmarked with a declarative quote
wc -l entry-prose.md                                             -> 158 (after the derived paragraph; 148 before)
sha256sum entry-prose.md sourced-thresholds.md fetch-log.tsv     -> digests.txt rewritten after the last edit
```

One honesty note on the classifier: it is my own three-line test, matching the shape ScribeQuality-2 described
(criterion 80 was still a draft during this run), not the frozen counter — which has no such check. Entry
constraints re-verified after the derived paragraph was inserted, with the readings above.

## Hand-off: 15 verified candidate rows

`.ufo/waves/round-31/w1/ScribeEntryProse/sourced-thresholds.md` (sha256
`0c1ddb3abc1bfe65ffc987ddd6db757dc1f79b5cb34804451c45f5215db0dc8d`) lists candidate rows D1–D15 with the
exact located quote, the threshold, the source id, the quote's word count, and `present`/`n1` results under
the counter's rules. All 15 read `present=true`, `n1=true`, word counts 8–25. This is an aid for the rows
seat, not entry text; the entry file keeps only prose and the placeholder.

Four things the rows seat must not lose:

1. **Tag-stripping spaces are part of HTML-sourced quotes.** The normalised GitHub text reads
   `POST , PATCH , PUT , or DELETE` and `0 , you should`; a tidied quote fails `q2`. My first D14 attempt
   quoted the rate-limits page wording that exists on the best-practices page instead (`present=false` was
   caught by the verifier), and the corrected row cites S122.
2. **D6 is the RFC's own example response block** (`HTTP/1.1 429 … Retry-After: 3600`). It is the only
   passage in S120 that carries 3600 inside a ≤25-word span, so the row's signal cell has to say it is an
   example; the prose says so in §Limits.
3. **Four passages carry no countable row**: robots 400–499, robots 500–599, RFC 6585 §7.2, and the vendor's
   `Retry-After` sentence itself (no digit in the span). They live in prose only. D2 (`allow`) chains two
   RFC clauses (§2.3.1.2 unavailability → §2.3.1.3 access) and its signal cell must show the chain.
4. **Nine quotes declare a limit rather than instruct a reader**, so their Decision cells carry `(derived)` —
   D4, D6, D7, D8, D9, D10, D11, D12, D14 — and the entry carries the matching prose paragraph (lines 37–45,
   directly above the placeholder). The counter admits either form, so nothing else keeps the distinction.

## `(derived)` markers (aligned to ScribeQuality-2's criterion-80 draft)

ScribeQuality-2 messaged during this seat's run that its drafted criterion 80 (append-only, next free number in
`corpus/QUALITY.md`) will require a row whose quote carries no normative token — MUST/SHOULD/MAY/imperative —
to mark its Decision cell as derived, plus one prose sentence saying the decision follows from the source's
declared limit. I applied that shape now rather than leave the rows seat to reverse-engineer it:

- prose: new paragraph at `entry-prose.md:37-45`, stating that a derived action is the one the source's
  declared limit implies and that the counter admits both forms;
- hand-off: nine Decision cells changed to `<verb> (derived)`; the counter's `t3-decision` still passes because
  the cell still begins with a closed-set verb;
- mechanical test used on each quote, after the counter's normalisation: uppercase
  `MUST|SHOULD|MAY|REQUIRED|RECOMMENDED`, or an imperative verb heading a clause. Command and result:
  the scratch classifier printed `tok`/`imp` per row and 9 rows fell through both tests.
- **boundary case flagged, not decided:** D14's quote reads `you should not make another request` in lower
  case — a directive in prose, but no normative keyword token. I marked it derived and told ScribeQuality-2
  that the criterion should rule on lower-case `should` rather than leave the rows seat guessing. If their
  ruling counts it, D14's marker comes off and nothing else changes.

Criterion 80 was a *draft* at the time of this run, so the entry cites no criterion number; it states the
convention as the entry's own.

## Caveats and open items

- The prose states the counter's target indirectly (row count belongs to the counter) and commits to no
  tally of its own, which keeps it clear of C2's window (`claims.json` §separability: C1 adds no tally
  statement). If the L1 adds a tally line to `corpus/README.md`, that row must be oracle-correct.
- `recheck:` is one line carrying both cadences rather than four lines; `check-frontier-admission.mjs`
  only requires a non-empty value, and the per-source split is in the line's own text.
- I did not touch `corpus/SOURCES.md`; S119–S122 rows were still absent at HEAD when I checked, so the
  prose's `source:` lines anticipate ids the rows seat and registry work still have to open. If the L1
  renumbers them, the four header lines and every `S119`–`S122` citation must move together —
  `awk 'NR>6' entry-prose.md | grep -o 'S11[9]\|S12[0-2]' | wc -l` → 27 citations outside the source lines
  (31 including them).
- U4 records that RFC 9309 is a crawler rule; if a later round measures a browser fetching `robots.txt`,
  that unknown closes and the rows in that group gain a measured sibling.

## Out of scope (not done, by assignment)

The table rows themselves, the receipts under `corpus/evidence/round-31/decision-table/`, the SOURCES rows,
the SKILL.md gate-registry row, the round-31 lesson, C2's appended corrections, and any counter run. No
lane script was executed (the counter-shaped normalisation and admission checks above are my own scratch
re-implementations of the frozen counter's documented rules, not the frozen counter).

## Tooling

Nothing installed or upgraded (no package manager, no `uv`, no binary fetch). Tools used: `curl`, `node
v24.21.0`, `python3`, coreutils/grep/sed. Scratch at `/fast/scratch/hyaku/tabi-r31/ScribeEntryProse` was
removed after the receipts above were copied out; nothing of mine remains under `/tmp`.
