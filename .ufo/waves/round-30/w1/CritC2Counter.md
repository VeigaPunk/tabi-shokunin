# CritC2Counter — attack on the C2 counter, round 30 w1

**Verdict.** The frozen admission counter (`scripts/check-frontier-admission.mjs`, sha256
`cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca`) passes every honest
shape and refuses several truthful ones, but it cannot separate a real fetch from a
fabricated one, so **population 2 / admitted 2 is reachable with junk both offline and with
`--live`**. The single cheapest hole is the `file://` allowance in `fetchLive` (lines 205-212):
changing a receipt's url scheme from `https://` to `file://` converts the exact J4 self-quote
shape the claim leans on (fabricated bytes = the entry's own text, refetch under a second seat
label, matching lesson quote) from `admitted 0` to `admitted 2`, and it passes **with `--live`
inside a network namespace that has no network at all** (`unshare -Urn`, exit 0), while the
same fixture with an `https://` url fails there with `l1-live` on both entries (exit 1).
Around it: `l3` compares *normalised text*, so the committed "source bytes" can be a local
re-expression of the page rather than the wire bytes; `entryQuotes` sees only double-quoted
spans of 4–600 characters in body lines 16+, so single-quoted, curly-single, >600-character,
fenced and title-line claims are unchecked; `g4` accepts a one-word quote; `r4` accepts
impossible calendar dates (`2026-13-45`); `g2` is a substring test and `g7` accepts a refetch
of a *different document* under arbitrary seat labels; duplicate registry rows are silently
shadowed by the first. Two of these are defects the claim's own wording makes fixable today
(file:// under `--live` contradicts "the live source at measurement time"; a prefix url
contradicts "each row backed by a committed fetch receipt"); the normalised-equality arm is
*claim wording*, not a counter bug — the predicate says "normalised text equal to the
committed bytes", so the counter implements it exactly, and tightening it needs a claim
sentence (or a `wire_sha256` receipt field) rather than a silent counter edit. **Net: the
counter is necessary but not sufficient for C2; it must not be read as evidence that the two
entries were grounded in fetched bytes until F1, F4, F7, F8, F11-F13 are closed.**

Counter points reached, all with the frozen bytes, in a `git clone --shared` of the lane at
`061e62024c0523d3c6c7e819506a773ff2cd7d75` (22 fixture commits, each a single commit on that
revision, in scratch only):

| # | junk shape | offline | `--live` | exit |
|---|---|---|---|---|
| F1 | `file://` receipt urls, invented bytes, no network | 2/2 | **2/2, also inside `unshare -Urn`** | 0 |
| F1′ | same bytes, `https://example.org` urls (J4 control) | 2/2 | 0/2 (`l1-live` ×2) | 1 |
| F2 | committed bytes are a re-expression (reflowed text / tag-free page text) | 2/2 | 2/2 | 0 |
| F3 | single-quoted + curly-single + 3-word fabricated claims; 680-char and fenced fabricated quotes; title-line quote | 2/2 | 2/2 (title-line run offline only) | 0 |
| F4 | rows opened `2026-13-45`, `2026-11-31` | 2/2 | 2/2 | 0 |
| F5 | one-word receipt quotes (`RateLimit`, `bucket`) | 2/2 | 2/2 | 0 |
| F6 | receipts with no `fetched_at` at all | 2/2 | 2/2 | 0 |
| F7 | refetch bytes = draft-10 while the receipt cites draft-11; seats `nobody-at-all`/`someone-else` | 2/2 | 2/2 | 0 |
| F8 | receipt url is a strict prefix of the row's url (`https://www.ietf.org/archive/id`) | 2/2 | n/a (prefix url itself need not 200) | 0 |
| F9 | `<html>` mentioned in plain text → tags stripped, quote "located" across a removed `<span>` | 2/2 | 2/2 | 0 |
| F10 | quote recorded anywhere in the lesson file, not in a `Gate` section | 2/2 | — | 0 |
| F11 | duplicate `S116` row: first benign, second `retired`/2020/other url, invisible | 2/2 | 2/2 | 0 |
| F12 | receipt url is a cross-host redirect (`www.ietf.org/rfc/rfc6585.txt` → 301 `www.rfc-editor.org`) | 2/2 | 2/2 | 0 |
| F13 | population 1 / admitted 1 → counter says `clean` | 1/1 | 1/1 | **0** |

## Evidence

Every run below used the frozen counter; raw stdout is in `evidence/raw/`, the fixture commit
diff against `061e620` is in `evidence/diffs/<rev12>.diff`, the fixture builder in
`evidence/build.mjs`, the normalisation probes in `evidence/normalise-probes.txt`, and the
verbatim command/exit log in `evidence/commands.log`. The clone is
`/fast/scratch/hyaku/tabi-r30/CritC2Counter/clone`; commits were made only there with
`-c user.name=CritC2Counter -c user.email=CritC2Counter@scratch.local`.

```
$ node scripts/check-frontier-admission.mjs --selftest          # frozen bytes
FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24        exit=0

$ TMPDIR=$S/tmp node scripts/check-frontier-admission.mjs --rev <rev> --repo $PWD \
    --frontier rate-tos-signal --since 2026-10-26 --json --live
honest            population=2 admitted=2 failing=0 clean=true      exit=0   [rev 08df2f97a5fc]
honest  unshare -Urn   population=2 admitted=0 failing=2 l1-live×2  exit=1   [netns blocks egress]
filelive unshare -Urn  population=2 admitted=2 failing=0 clean=true exit=0   [rev c46005460a76]
selfquotehttps live    population=2 admitted=0 failing=2 l1-live×2   exit=1   [rev 12305173b125]
reexpress    live      population=2 admitted=2 failing=0            exit=0   [rev 57e7826923c1]
singlequote  live      population=2 admitted=2 failing=0            exit=0   [rev 1dbe6b4afac0]
oneword      live      population=2 admitted=2 failing=0            exit=0   [rev 05add26054e4]
q1scope      live      population=2 admitted=2 failing=0            exit=0   [rev 965bbe71fe9e]
redirect     live      population=2 admitted=2 failing=0            exit=0   [rev 9cfa39cab3b6]
```

Recorded offline/live raw runs (same counter, same clone; see `evidence/results.md` for the
full 40-row table): `baddate` 2/2 live, `duprow` 2/2 live, `notimestamp` 2/2 live,
`refetchlabel` 2/2 live, `htmlsniff` 2/2 live, `lessonloose` 2/2, `urlprefix` 2/2,
`headquote` 2/2, `tag16` 1/1 `clean` exit 0, `onepop` 1/1 `clean` exit 0.

### F1 — `file://` in production `--live` (cheapest hole; defeats the J4 control)

`fetchLive` (lines 203-212) accepts two success codes: `200`, or `000` when the url starts
`file://`. That branch exists so the two selftest cases `live-file-url-located` and
`live-file-url-quote-gone` can be hermetic — the selftest *depends* on the hole. In
production it means:

- no network is touched: `filelive` scored 2/2 inside `unshare -Urn` while `honest` scored
  0/2 in the same namespace (exit 0 vs exit 1) — the namespace demonstrably blocks egress,
  so the `file://` pass cannot have come from the wire;
- the bytes are the seat's own invention: `filelive` commits `Policy windows are published per
  bucket and remain stable across a sequence of responses.`, a sentence no source ever
  published, quotes it in the entry, in the lesson and in the receipt, and `l1`/`l3` both pass;
- the pairing with F1′ is exact: identical fabricated bytes, identical case shape, only the
  scheme differs → `admitted 0` vs `admitted 2`. Control J4 (`c2-control-J4-selfquote-live.json`)
  therefore proves nothing about `--live`; it proves only that `example.org` does not serve
  the fixture.

This is a defect against the predicate's "the live source at measurement time still
containing the quote" and against the counter's own header comment ("fetched now (curl,
HTTP 200)"): a local file is neither live nor HTTP 200.

### F2 — `l3` ties normalised text, not bytes

`l3-live-bytes` is `normalise(liveBytes) === normalise(committedBytes)`. Since `normalise`
collapses all whitespace and, for HTML, strips every tag, the committed `bytes_path` need not
be a fetch output at all:

- `reexpress` commits draft-11 with every newline replaced by a space (2/2 live);
- `reexpress` commits the Discord page as *tag-free visible text* (2/2 live; sha256
  `6534448ac1e4…` is the sha of a file the server never sent, and `g3` is satisfied because
  the receipt's sha matches its own bytes).

Consequence: "a committed fetch receipt (HTTP 200, sha256-matched bytes)" in the claim
attests self-consistency of a local artefact, not provenance of a response. This one is
**claim wording**, not a counter bug — the predicate's last clause says "normalised text
equal", and dynamic pages make byte identity a real tradeoff. The cheap repair is a
`wire_sha256` field filled from the live fetch (or a claim sentence that says the committed
bytes may be a re-expression).

### F3 — `entryQuotes` extraction is narrower than "every >=4-word quoted span"

`entryQuotes` (lines 168-178) strips fenced blocks and inline code, then matches
`"([^"]{1,600}?)"` and `“([^”]{1,600}?)”` and keeps spans with `words >= 4`. Blind spots,
all demonstrated at 2/2 admitted:

- **single-quoted** and **curly-single** spans: `'servers MUST publish a policy on every
  response'`, `‘the bucket string is stable across all routes’` (8 and 8 words) pass untouched
  (`singlequote`, live, exit 0);
- **spans over 600 characters** are not "unverifiable", they are *unmatched*: a 680-character
  fabricated paragraph between double quotes is skipped entirely (`q1scope`, live, exit 0);
- **fenced blocks** are excluded wholesale, so a fabricated quote inside a fence is unchecked
  (`q1scope`);
- **header lines** (0-14) are outside `body`, so a fabricated double-quoted claim in the
  entry title is never tested (`headquote`, 2/2);
- **3-word spans** are skipped — claim-consistent (the predicate says >=4), listed for
  completeness only.

### F4 — `r4-opened` accepts impossible dates

`DATE_RE` is `^\d{4}-\d{2}-\d{2}$` and the comparison is lexicographic, so `2026-13-45` and
`2026-11-31` both pass "opened on or after 2026-10-26" (`baddate`, live, 2/2, exit 0). The
string compare is fine *given* the regex; the missing piece is calendar validity (and, for
"opened today", a bound to the round window).

### F5 — one-word receipt quote passes `g4`

`g4-quote-length` is `n < 1 || n > 25`. `quote: "RateLimit"` and `quote: "bucket"` satisfy
`g4`, `g5`, `g6`, `g7` and `l1`/`l3` (`oneword`, live, exit 0). Grounding degrades to a single
token while every other check stays green. The predicate's "<=25-word quote" permits this
literally — a claim-shape gap.

### F6 — nothing ties the bytes to today

The frozen counter never reads `fetched_at`; receipts without any timestamp pass (`notimestamp`,
live, 2/2, exit 0). "Opened today with committed bytes" is therefore the `opened` cell (F4)
and nothing else. Claim-shape gap with a cheap corroboration (require `fetched_at` date >= `--since`).

### F7 — refetch is a label check and may be a different document

`g7-refetch` requires only: same id, `seat !== fetched_by`, both non-empty strings, its own
sha-matched bytes containing the quote. In `refetchlabel` (live, 2/2, exit 0) the S116
receipt cites draft-11 while the refetch bytes are draft-10, and the seats are
`nobody-at-all` / `someone-else`. A refetch of a *different document* is not an independent
refetch of the same source, so this is a defect (cheap: `rf.url === rc.url`, or equal
`normalise` of both byte sets). Seat identity itself cannot be tested from the repo — that
part is a tradeoff.

### F8 — `g2-url` is `row.source.includes(rc.url)`

A strict prefix passes: receipt url `https://www.ietf.org/archive/id`, row url
`…/draft-ietf-httpapi-ratelimit-headers-11.txt` (`urlprefix`, 2/2 offline). Under `--live`
the prefix must itself serve the same bytes, which usually fails, so this is a real but
narrower opening — the receipt's url identity is not bound to the row's url. Defect (cheap:
compare parsed url tokens for equality, not substring).

### F9 — HTML detection is content sniffing, not content type

`normalise` treats any text containing `<!doctype html` **or `<html[\s>]` anywhere** as HTML.
The already-allowed `rfc6585.txt` (real bytes, sha `f6d55d1b…`) contains `<html>` inside an
example, so the whole plain-text RFC is tag-stripped: `<title>Too Many Requests</title>`
disappears from its normalised form (`evidence/normalise-probes.txt`). `htmlsniff` turns that
into a false "located": a quote spanning a removed `<span …>` is contiguous only after
stripping (2/2 live, exit 0). Also: an *unclosed* `<script>` is not matched by
`<script[\s\S]*?<\/script>` and its JavaScript text stays in the normalised bytes
(`var q="secret policy words"` survives), so quoted text can come from code rather than
visible prose. Defects: detect HTML at the start of the buffer only, and strip an unclosed
`<script|style` to EOF.

### F10 — `g6-gate` is a substring of the whole lesson file

`lessonFlat.includes(q)` — no `Gate` section scoping; `lessonloose` (quotes under
`## Unrelated notes`) admits 2/2. Minor: the lesson is one round-wide file, so one occurrence
grounds every receipt.

### F11 — duplicate registry rows are first-wins and silent

`parseRegistry` keeps the first row per id (`if (!rows.has(id))`), skips any line whose
`split("|")` is not 13 cells, and never reports duplicates or shadowed rows. `duprow` (live,
2/2, exit 0) puts a benign `S116` row first and a contradictory `retired`/2020/other-url row
second; the second row is invisible to every check. Duplicate authority, defect (cheap:
`r1-duplicate`).

### F12 — `curl -L` with no `url_effective` check

`fetchLive` never asks curl for `%{url_effective}` and never compares hosts. `www.ietf.org/rfc/rfc6585.txt`
301s to `www.rfc-editor.org/rfc/rfc6585.txt` (header probe recorded); `redirect` commits the
rfc-editor bytes, cites the ietf url in the row and the receipt, and admits 2/2 live. The
receipt's `url` is then not the bytes' url — a provenance identity change the counter cannot
see. Defect (cheap: record and compare the effective host, or refuse cross-host redirects).

### F13 — exit 0 is not the target

`clean` is `population >= 1 && admitted === population`, so a single honest entry exits 0
(`onepop`, `tag16`: 1/1, exit 0) although the C2 target is population 2. The `countingCommand`
adds `jq '{population,admitted,failing}'`, so the number is recoverable — but "counter exit 0"
is not the predicate and must not be reported as though it were. Related: `tag16` shows
population membership depends on line position (a `frontier:` line at line 16 is silently
invisible), and `supersede` (below) shows the `source:` id union.

## False refusals (truthful entries the counter rejects)

| # | shape | result |
|---|---|---|
| R1 | emphasis inside a verbatim quote (`"The field value *SHOULD* remain consistent …"`) | 2/1, `q1-entry-quote` (rev 75a8c90b1305) |
| R2 | quote hard-wrapped inside a `>` blockquote | 2/1, `q1-entry-quote` — the `>` becomes part of the span (rev 4a1265843927) |
| R3 | `source: S116 — … ; supersedes S118` (the reserved S118 id) | 2/1, `r1-row-missing S118` (rev 273840be34c1) |
| R4 | HTML page (fragment, no doctype) or a ZWSP/NBSP inside the visible phrase | quote not found: fragments are not normalised at all; `\s` does not cover U+200B |

R1-R3 are incentives to *weaken prose* to satisfy the gate (drop emphasis, unwrap blockquotes,
never name the superseding id) — the wrong direction for a curation claim. R3 is live this
round, because the plan reserves S118 for the S044 superseding row.

## Defect vs tradeoff (for the canonical judge)

- **Counter defects, cheap and safe to fix:** F1 (`file://` in production), F3's >600-char /
  fenced / title-line blind spots, F4 (calendar validity), F7's different-document refetch,
  F8 (substring url), F9 (content sniffing, unclosed script), F11 (duplicate rows), R3 (id
  extraction from arbitrary `source:` text), R1/R2 (extraction brittleness).
- **Claim-wording gaps, not counter bugs:** F2 (predicate already says "normalised text
  equal"), F5 (`<=25-word` permits 1), F6 (no timestamp required), F7's seat *labels*
  (no seat registry exists), F13 (the target lives in the `jq` fields, not the exit code).
  These need a sentence in `claims.json` or a new receipt field — silently tightening the
  counter would make the frozen bytes disagree with the frozen claim.
- **Unavoidable tradeoffs:** a seat cannot prove it was a distinct human/agent; a dynamic
  live page cannot be byte-identical; a page can change between receipt and measurement (l3
  correctly fails then).

## Impacted axes

- **coverage (the claimed axis):** admitted 2 does not imply two entries were grounded in
  fetched source bytes. F1 makes the strongest available control vacuous; F2 means the
  "bytes" are local text; F3/F4/F11 mean an admitted entry can carry unverifiable claims and
  impossible citations.
- **calibration:** exit 0 with population 1 (F13) reads as "clean" while the predicate is
  unmet; `--live` is advertised as the anti-fabrication arm and is bypassable by scheme.
- **freshness:** "opened today" is a self-asserted cell validated only by a regex (F4) with no
  receipt timestamp (F6).
- **depth:** the entry's only content check (`q1`) has six documented blind spots (F3), so
  the entries' quoted content is not what the counter claims to test.
- **operability / adjacency:** unchanged by this attack.

## Smallest safe correction (nothing applied — attack seat, report only)

Ordered by (hole closed ÷ lines changed). All keep the frozen selftest shape except where noted.

1. **`fetchLive`: https only in production.** Return `null` for non-`https:` urls; add an
   internal `allowFile` option to `evaluate` passed only by `runSelftest`, and keep the two
   `file://` CASES. Two lines plus one option. Closes F1 and restores the meaning of the J4
   control.
2. **`fetchLive`: pin the host.** Add `-w` `%{url_effective}` (or `%{num_redirects}`) and
   fail `l1-live` when the effective host differs from the receipt url's host. Closes F12.
3. **`g4`: require 4-25 words**, matching the entry rule and the intent of "quote".
4. **`r4`: real calendar date.** Round-trip the cell through `Date.UTC` and reject a
   non-existent day; optionally require `opened >= --since` **and** receipt `fetched_at` date
   `>= --since` (one extra check, closes F4 + F6).
5. **`g2`/`g7` identity:** exact-match the row's url token instead of `includes`; require
   `rf.url === rc.url` (or equal normalised refetch and receipt text). Closes F8 and the
   different-document half of F7.
6. **`parseRegistry`: refuse duplicates** (`r1-duplicate`) instead of first-wins.
7. **`entryQuotes`:** add `‘…’`; treat a >=601-character double-quoted span as a refusal
   rather than dropping it; scan `head` as well as `body`; drop the unconditional fenced-block
   exclusion (entries carry no code fences today). Closes F3; R1/R2 become visible failures of
   the entry author rather than silent ones.
8. **`normalise`:** sniff HTML only at the start of the buffer (`^\s*(<!doctype html|<html[\s>])`),
   strip an unclosed `<script|style>` to EOF, and delete U+200B/200C/200D/FEFF before
   collapsing. Closes F9 and the ZWSP half of R4.
9. **id extraction:** `^source:\s*(S\d{3,}(\s*[,+]\s*S\d{3,})*)` so a prose mention, a
   filename or a "supersedes S118" clause does not enter the citation set. Closes R3.
10. **claim sentence (not a counter edit):** add a `wire_sha256` to the receipt schema (sha of
    the live fetch body) and one sentence to C2 saying the committed bytes must match it;
    otherwise keep the current wording and state explicitly that committed bytes may be a
    re-expression. Closes F2 honestly, without contradicting the frozen predicate.

## Method, limits, honesty

- Lane tip under test: `061e62024c0523d3c6c7e819506a773ff2cd7d75`; counter sha256
  `cadef57e…9eca` (matches `frozenDigests`); catalogue not touched. Selftest at those bytes:
  `cases=24 passed=24`, exit 0.
- One shared clone, `git status --porcelain` empty before every fixture commit; 22 fixture
  commits, each a single commit on the frozen revision, diffs exported to
  `evidence/diffs/`. All lane tree/index/jj state untouched; **no lane files written, no
  patch produced** (attack seats do not repair).
- Network: four read-only HTTPS GETs of public documentation/spec pages plus one header-only
  redirect probe (`evidence/fetch-receipts.md`); no logins, cookies, credentials, API calls or
  consequential actions. `unshare -Urn` was used to prove the `file://` pass needs no network;
  the same run of the honest fixture fails there, so the namespace is a real control.
- Fixture ids S116/S117 are placeholders in the scratch clone only, deliberately matching the
  planned lane ids; nothing here claims those rows exist.
- No tools installed or upgraded (no `uv tool`, `npx`, `pacman`, binary downloads). No
  subagents, no `agent://all`. Scratch: `/fast/scratch/hyaku/tabi-r30/CritC2Counter/`.
