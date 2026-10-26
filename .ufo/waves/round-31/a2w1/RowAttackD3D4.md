# RowAttackD3D4 — C1 row-by-row attack: rows D3 and D4 (tabi round 31, a2w1 = falsify)

Seat: critic. Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Attacked revision
`486048356f0712e4396588c9dab58cd419243120` (lane branch tip, wave 1 integrated).
Baseline `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc`; freeze `9505a10eb80b2a0b273ebaba3f7f872ad302192d`
(claims read first). Counter under which the rows were admitted:
`scripts/check-decision-table.mjs`, sha256 `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`
= `claims.json.frozenDigests`. Targets: entry line 51 (D3, RFC 9309 §2.3.1.4 thirty-day example)
and line 52 (D4, RFC 9309 §2.4 twenty-four-hour cache bound), both citing registry row S119.

---

## Verdict

**Both rows hold on all seven letters.** I re-fetched S119 live myself (same bytes, same sha256 as
the committed receipt), ran the counter's own `normalise()` over those bytes, and read each row's
sentence in its paragraph. The queries are verbatim, single-occurrence substrings; the threshold
numbers (30, 24) are the period and the cache age the sentences themselves quantify, in the
sentences' own units; the bound words are exactly what the source says — D4 "more than 24 hours"
against "for more than 24 hours", and D3 carrying **no** bound word at all, which is the faithful
rendering of "for example, 30 days" (the row discloses "the period is the RFC's example value" in
its Signal cell and "after the example period" in its Decision cell, and the prose repeats it at
:77-80, so no reader is told 30 days is a deadline); the forces are the RFC's own capitals (MAY for
D3, SHOULD NOT for D4), so neither cell needs `(derived)` under the entry's stated marker rule
(:36-46); the signals are a robots.txt fetch outcome and a cached copy with its age, both held by
the record a journey driver keeps; scope is not merely cited but *stated* — U4 (:168-171) says in so
many words that RFC 9309 is a crawler rule, that the lane's journeys are browser sessions, and that
a row of that group applies only where a driver chooses to fetch the file; and the two rows are
distinct rules with distinct quotes (all 13 rows carry 13 distinct quotes, so the known
"one quote repeated across rows" hole is not exercised here). **I found no counterexample that
falsifies either row**: everything checkable against the live page checks out, including every line
number S119 claims. What I did find is **two low-severity defects in the rows' provenance chain** —
S119's registry row dates RFC 9309 "June 2022" where the fetched bytes and rfc-editor's info page
say September 2022 (June 2022 is RFC 9110's date, carried over from S119's neighbour row), and the
entry's front matter states a 180-day recheck for S119/S120 where the registry cells say 365d —
plus three notes on D3's cell shape (a second reciprocal action, a quote clipped at the counter's
25-word cap that leaves the licensing cross-reference outside the verified span, and a D3↔D4
precedence the entry leaves unstated). None of this justifies rejecting C1: the claim's predicate
(admitted ≥ 10, failing 0, live) is met at 13/13 with exit 0, and both rows say true things about
RFC 9309.

---

## 1. What I attacked, and what the source says

Live re-open of the source D3 and D4 cite, `S119` → `https://www.rfc-editor.org/rfc/rfc9309.txt`
(URL recorded in `corpus/SOURCES.md:133`):

| # | URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| F1 | `https://www.rfc-editor.org/rfc/rfc9309.txt` | 2026-10-26T12:26:23Z → 12:26:24Z | 200 (effective URL identical) | 25265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` |
| F2 | `https://www.rfc-editor.org/info/rfc9309` | 2026-10-26T12:30:47Z | 200 (effective `…/info/rfc9309/`) | 322426 | `d44881fa803fafb292f5ff26cf31399976fbaeae6dab191c48d8da4946e37445` |

`curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60`, exit 0 both.
F1's sha256 is **byte-identical to the committed receipt**
`corpus/evidence/round-31/decision-table/S119.json` (`sha256` field, fetched 2026-10-26T08:36:13Z)
and to `…/bytes/S119.txt`, at a fetch three hours fifty minutes later — so the rows rest on the
live document, not on a staged copy, and the pages are stable today.

Source spans read in the live bytes (`sed -n '365,432p'`, exit 0):

```
2.3.1.4.  "Unreachable" Status
   If the robots.txt file is unreachable due to server or network errors, this means the
   robots.txt file is undefined and the crawler MUST assume complete disallow.  For example,
   in the context of HTTP, server errors are identified by status codes in the 500-599 range.

   If the robots.txt file is undefined for a reasonably long period of
   time (for example, 30 days), crawlers MAY assume that the robots.txt
   file is unavailable as defined in Section 2.3.1.3 or continue to use
   a cached copy.

2.4.  Caching
   Crawlers MAY cache the fetched robots.txt file's contents.  Crawlers
   MAY use standard cache control as defined in [RFC9111].  Crawlers
   SHOULD NOT use the cached version for more than 24 hours, unless the
   robots.txt file is unreachable.
```

## 2. Quote location under the counter's own normalise(), not mine

`normalise` was extracted verbatim from `clone/scripts/check-decision-table.mjs` (lines 132-146,
the `ENTITIES`→`collapse` span, re-written only to drop `export` and add `module.exports`;
`normalise-frag.cjs`, sha256 `f24f948b…`). The HTML branch is inert on this document
(`<!doctype html|<html[\s>]` → false), so the transform is the whitespace collapse the counter
applies to plain-text receipts.

```
D3 found=true occurrences=1 words=20
   ctx: …server errors are identified by status codes in the 500-599 range. If the robots.txt
        file is undefined for a reasonably long period of time (for example, 30 days), crawlers
        MAY assume that the robots.txt file is unavailable as defined in Section 2.3.1.3 or
        continue to use a cached copy. 2.3.1.5. Parsing Errors…
D4 found=true occurrences=1 words=18
   ctx: …Crawlers MAY use standard cache control as defined in [RFC9111]. Crawlers SHOULD NOT
        use the cached version for more than 24 hours, unless the robots.txt file is
        unreachable. 2.5. Limits…
full_words=38  quote_is_prefix=true  prefix_words=20
dropped= " that the robots.txt file is unavailable as defined in Section 2.3.1.3 or continue to
          use a cached copy."
```

exit 0. So: both quotes are genuine contiguous spans of the live document, each occurring exactly
once; D4 quotes its sentence whole; D3 quotes a 20-word prefix of a 38-word sentence (the word cap
is explained in §4, note N3).

## 3. The frozen counter at REV, read from a file (never a pipe)

```
sha256sum clone/scripts/check-decision-table.mjs
  d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832        # = frozenDigests, exit 0
git -C clone diff --numstat 9505a10e 4860483 -- scripts/ | wc -l    # 0, exit 0
TMPDIR=$S node clone/scripts/check-decision-table.mjs --rev 486048356f0712e4396588c9dab58cd419243120 \
  --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc \
  --entry corpus/knowledge/rate-signal-decision-table.md --live --json > "$S/c1.json"
  # exit 0
{"population":13,"admitted":13,"failing":0,"live":true}
  D3 line 51 source S119 admitted true threshold 30
  D4 line 52 source S119 admitted true threshold 24
```

Clone porcelain was `0` lines before and after all work (no lane file, index or jj state touched;
no commit made; every git call named `-C clone`).

## 4. Letter-by-letter, both rows

### D3 — `corpus/knowledge/rate-signal-decision-table.md:51`

> `| D3 |` `` `robots.txt` `` `unreachable (` `` `500` `` `–` `` `599` `` `or network errors) for a long period — the period is the RFC's example value | allow — MAY treat the file as unavailable after the example period (or keep a cached copy); before that, complete disallow applies (RFC 9309 §2.3.1.4) | 30 days | S119 | "If the robots.txt file is undefined for a reasonably long period of time (for example, 30 days), crawlers MAY assume" |`

| letter | verdict | evidence |
|---|---|---|
| (a) verbatim + located | **holds** | single occurrence in live bytes and in `bytes/S119.txt`; a contiguous prefix, no elision inside the span (§2) |
| (b) number is the bounded quantity | **holds** | 30 is the *undefined period* — the sole quantity the sentence quantifies; not a status code, section, RFC number, year or pronoun (the 500–599 in the Signal cell comes from the preceding paragraph at line 403, where it is correctly flagged as the HTTP example) |
| (c) unit + bound word | **holds, with the row's own disclosure** | the quote says "for example, 30 days": an example, not a bound. The row therefore carries **no** bound word — the only one of 13 threshold cells without one — and marks it twice (Signal: "the period is the RFC's example value"; Decision: "after the example period"), with the prose at :77-80 saying "not as a deadline". Faithful, not loose: it claims exactly what the source claims |
| (d) verb + force | **holds** (see N1 for where the licence sits) | force "MAY" is the RFC's own capital, addressed to crawlers; consequence "treat the file as unavailable (or keep a cached copy)" is the rest of the same sentence; "before that, complete disallow applies" is §2.3.1.4's preceding MUST, in the section the cell cites |
| (e) observable | **holds** | robots.txt fetch outcome (500–599 / network error) plus elapsed unreachability — both in the record a driver keeps, and the entry's `ground:` line says records ("site-interaction records") |
| (f) scope | **holds, explicitly** | the cell cites §2.3.1.4; the quote's subject is "crawlers"; and U4 (:168-171) states the crawler-rule/browser-journey scope in words and forbids reading an operator's browser journey as bound by it |
| (g) distinct | **holds** | 13 rows, 13 distinct quotes; D3's trigger (long unreachability) and number (30 days) differ from D2 (redirect overflow, >5), D4 (cache age, >24 h) and D5 (parse floor, ≥500 KiB) |

### D4 — `corpus/knowledge/rate-signal-decision-table.md:52`

> `| D4 |` `cached robots.txt copy` `| refetch — SHOULD NOT use the cached copy past the bound, except while robots.txt is unreachable (RFC 9309 §2.4) | more than 24 hours | S119 | "Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable." |`

| letter | verdict | evidence |
|---|---|---|
| (a) verbatim + located | **holds** | whole sentence, 18 words, single occurrence, live and committed |
| (b) number is the bounded quantity | **holds** | 24 bounds the *age of the cached copy*, which is the only quantity the sentence bounds |
| (c) unit + bound word | **holds exactly** | threshold "more than 24 hours" = quote's "for more than 24 hours"; unit hours; bound "more than", not softened to "at least" |
| (d) verb + force | **holds** | force is the RFC's "SHOULD NOT"; the prohibition is restated in the cell in the source's own terms ("use the cached copy past the bound"), with the source's own exception ("unless/except while … unreachable"); the head verb "refetch" is the operative consequence of not being allowed to use the copy (see N4) |
| (e) observable | **holds** | the driver holds the copy and its fetch time; the age is the quantity, supplied by the Threshold cell |
| (f) scope | **holds** | §2.4 cited; "Crawlers" is the quote's subject; U4 states the crawler/browser scope |
| (g) distinct | **holds** | distinct from D3 (different section, different quantity, different trigger) and from every other row's quote |

The omitted preceding sentence of §2.4 ("Crawlers MAY use standard cache control as defined in
[RFC9111].") does not change the bound: RFC 9111 governs validation and freshness *within* the RFC's
own 24-hour cap, and the entry's prose states the same bound (:75). No exception or qualifier that
changes the row's meaning sits outside the span.

## 5. Findings

### Defect 1 (low) — S119's registry row dates RFC 9309 "June 2022"; the bytes say September 2022

`corpus/SOURCES.md:133` (the row D3 and D4 rest on) opens: `RFC 9309 (June 2022), §2.3.1.2 …`.
The fetched document says otherwise:

```
rfc9309.txt:11    September 2022                          (title block)
rfc9309.txt:7     Category: Standards Track
F2 info page      "Details  Date published  September 2022"
grep -n "June|September|2022" rfc9309.txt
   554: DOI 10.17487/RFC9110, June 2022,
   559: DOI 10.17487/RFC9111, June 2022,
```

"June 2022" occurs in this document only inside its references to RFC 9110/9111 — the date of the
lane's neighbouring spec row `SOURCES.md:121` (S107, "RFC 9110 June 2022"). The parenthesised date
is therefore a carried-over neighbouring fact, not a reading of S119's own bytes: a small false
provenance detail in the row the two surviving claims of this entry cite. It touches no threshold,
quote, force or scope. Note that the row's *other* identity fields are exact — `25265 B`,
sha256 `f633915d…`, `fetched 2026-10-26T08:36:13Z` (my F1), status `mined`, used-by the entry.

**Smallest safe correction:** in `SOURCES.md:133`, `RFC 9309 (June 2022)` → `RFC 9309 (September 2022)`.
One cell, no line count change, no counter effect (`check-sources.mjs` does not read the date).

### Defect 2 (low) — the entry says 180d for S119/S120; the registry cells say 365d

`corpus/knowledge/rate-signal-decision-table.md:8`:
`recheck: 180d for S119 and S120 (standards-track RFC text, …); 90d for S121 and S122 …`

```
registry cells at REV:  S119 365d | S120 365d | S121 90d | S122 90d
```

The vendor half agrees; the RFC half does not. The corpus's convention elsewhere is that the entry's
cadence matches the registry cell — checked on four other entries/sources in the same tree:
entry "90d for S104" ↔ S104 `90d`; "on-release for S105" ↔ S105 `on-release`; "90d for S103" ↔
S103 `90d`; "on-release for S059–S064" ↔ S059 `on-release`. No script reconciles the two
(`check-frontier-admission.mjs:244` only requires a non-empty `recheck:` line), so the disagreement
is silent. The rationale text is right (both RFCs are `Category: Standards Track`, verified in
`bytes/S119.txt:7` and `bytes/S120.txt:10`), so only the number is at stake; effect is freshness
bookkeeping — a future recheck round reading the entry schedules S119 at six months and one reading
the registry at twelve.

**Smallest safe correction:** make `:8` state `365d for S119 and S120`, matching the registry cells
(which a recheck round actually reads). Editing the two cells to 180d would be equally safe for the
claim; the two documents must not keep disagreeing.

### Note N1 (D3) — the row's verb is licensed one hop outside the located quote

The quoted span ends at "crawlers MAY assume". The object of *assume* — "that the robots.txt file is
unavailable as defined in Section 2.3.1.3 or continue to use a cached copy" — is outside the
verified span, and the verb "allow" additionally routes through §2.3.1.3 ("the crawler MAY access
any resources on the server", `rfc9309.txt:394-396`), a section the cell does not cite. The
consequence is **true** of the source and is relayed in the Decision cell ("treat the file as
unavailable … or keep a cached copy"); the entry's prose carries the §2.3.1.3 consequence too
(:69-70, "the crawler may access any resource on the server"). So this is a provenance hop, not a
false claim, and **must not be used to reject C1** — the claim only requires the *threshold number*
to sit inside the located quote, which 30 does. Cheapest hardening, if the lane ever revisits the
row: cite `§2.3.1.3–§2.3.1.4` in the Decision cell.

### Note N2 (D3) — "before that, complete disallow applies" leaves the D4 exception unstated

For the state "robots.txt unreachable, ten days elapsed, cached copy 40 hours old", the two rows I
was given read in opposite directions: D3 says complete disallow applies before the example period;
D4 says the 24-hour cap does not apply "while robots.txt is unreachable", i.e. the cached copy may
be used. Each cell is literally faithful to its own sentence (§2.3.1.4 p1 vs §2.4), and the RFC
itself leaves the precedence under-determined; the entry states no ordering between two robots.txt
rows (its ordering sentence covers permission-surface-before-quota only, :65-66). A driver obeying
the stricter cell discards a copy the RFC lets it keep — conservative, never unsafe against the
site, so this is an under-determined lookup, **not** a sourced-claim failure. Cheapest fix if the
lane wants a single answer: append to D3's Decision "…unless the crawler keeps using its cached copy
(D4, §2.4)" — the head verb, threshold and quote cell are untouched, so no counter check moves.

### Note N3 (D3) — the quote is clipped by the counter's own word cap

The full §2.3.1.4 sentence is 38 words; `q1-quote-length` (`check-decision-table.mjs:283`) admits at
most 25, so a row citing a long normative sentence *cannot* carry it whole — the author must clip,
and the clip is what puts the "as defined in Section 2.3.1.3" cross-reference (N1) outside the
verified span. D3's clip is honest (a prefix, tail relayed in the Decision), but the pressure is
structural and the counter cannot see what was dropped. This belongs to the counter's known-hole
family already frozen this round (`w1/CritC1Counter.md`); nothing here re-opens it.

### Note N4 (D4) — "refetch" is not a word of §2.4

No sentence of §2.4 contains "fetch again"/"refetch"; the section prohibits *use* of an over-age
copy. The positive action follows from §2.3.1.1's presupposition ("If the crawler successfully
downloads the robots.txt file …") and from the fact that without a usable cache the only way to hold
rules is a fresh download — and the cell states the prohibition itself, so the reader can check it.
Holds; the entry's `(derived)` marker is correctly *not* used, since the quote carries an RFC 2119
capital addressed to the caller (:36-46).

### Note N5 (shape) — "exactly one action" vs D3's two reciprocal actions

:24 promises "exactly one action drawn from a closed verb set". D3's Decision cell asserts two
closed-set actions — `allow` after the period and "complete disallow" before it — because the RFC
states both in one section; the counter only reads the head verb (`:270-271`), so the promise is
unescorted. Severity nil for a driver (the row is strictly more informative) and nil for the claim;
recorded so a later round does not read the intro sentence as a guarantee the counter enforces.

## 6. Impacted axes

- **depth** — no harm. Both rows' number, unit, bound word, force, section and scope were verified
  against live bytes, and the counter reads 13/13 admitted at REV. The two entries' weakest points
  are cell-shape and provenance hops (N1-N5), not sourced detail.
- **freshness** — the two defects land here: a wrong publication date on S119 (Defect 1) and a
  recheck cadence that two documents state differently (Defect 2). Both are one-cell fixes; neither
  changes a row, a quote or a threshold.
- **calibration** — a small, silent instance: the entry's own shape sentence (:24) and its own
  recheck line (:8) each state something the tree does not keep (two actions in D3; 180d vs 365d).
  No tally statement is wrong, so C2's window is unaffected.
- **coverage / operability / adjacency** — no harm shown. Nothing here touches S120 prose-only
  status, the GitHub rows, or the route surface.

## 7. Attacks I ran that did **not** produce a fault (so the record shows they were tried)

1. **Threshold is an example, not a bound (D3).** Tried to call "30 days" a fabricated bound. Fails:
   the quote says "(for example, 30 days)", and three places in the entry say example/not a deadline.
2. **Bound-word inversion (D4).** "more than 24 hours" vs "at least" — the cell says *more than*,
   which is the quote's own words. No softening.
3. **Status code as the threshold.** For these rows the candidates were 500/599 (Signal cell only,
   and correctly attributed to the preceding paragraph) and 24/30 (genuinely the quantities). Clean.
4. **Repetition across rows.** Counted quote cells for all 13 rows: 13 distinct quotes, so D3 and D4
   do not lean on the known one-quote-many-rows hole.
5. **False provenance via the receipt.** Live sha256 = receipt sha256 at a later fetch, so the bytes
   D3/D4 quote are the live page.
6. **Wrong anchor lines in the registry row.** Every line number in `SOURCES.md:133` verified against
   the bytes: redirects 377/380/384, 400-499 at 392, 500-599 at 403, 30 days at 406, 24 hours at 419,
   500 kibibytes at 425 — all exact.
7. **Wrong document category behind the recheck rationale.** "standards-track RFC text" — verified
   true for both RFCs (`Category: Standards Track`), so the rationale survives; only the number
   disagrees (Defect 2).

## 8. Reproduction

Everything below is committed under
`.ufo/waves/round-31/a2w1/RowAttackD3D4/` (sha256s in `SHA256SUMS`):

| file | sha256 | what it is |
|---|---|---|
| `c1.json` | `5362031818b2…` | frozen counter output at REV, `--live`, exit 0 (13/13/0) |
| `rfc9309.txt` | `f633915daaa1…` | my live fetch of S119, 25265 B, = receipt bytes |
| `rfc9309-info.html` | `d44881fa803f…` | rfc-editor info page (publication date: September 2022) |
| `check.mjs`, `normalise-frag.cjs` | `03f87ab1de14…`, `f24f948b34e6…` | the quote-location harness and the counter's own `normalise` |
| `commands.txt` | `2d8c150dd487…` | every command with its exit code |

Scratch (`/fast/scratch/hyaku/tabi-r31/RowAttackD3D4`) held one `--shared` clone at REV, porcelain
empty, no commit; no lane tracked file, lane index, jj state, fleet repo or sibling repo was
written. No tool was installed or upgraded (nothing was needed). Network use: two read-only HTTPS
GETs of `www.rfc-editor.org`, recorded in §1 with URL, UTC time, status, byte count and sha256; no
API host, no credential, no state-changing request.
