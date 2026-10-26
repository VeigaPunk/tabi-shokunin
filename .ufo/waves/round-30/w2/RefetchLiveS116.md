# RefetchLiveS116 — independent live re-open of S116 and quote-grounding audit

Seat: RefetchLiveS116 (leaf, wave w2, C2). Attacked: the S116 receipt/refetch pair and every
quoted span of `corpus/knowledge/rate-limit-policy-fields.md`, against bytes I fetched myself.
Lane tip measured: `072af95fe2822f0785a6ff88a578e2142dd258e5` (read-only; nothing in the lane written
except this report and `.ufo/waves/round-30/w2/RefetchLiveS116/`).

## Verdict

**Holds, with two low-severity prose defects — no quote defect and no provenance defect.**

I re-fetched `draft-ietf-httpapi-ratelimit-headers-11.txt` five times over four minutes; every response
is 67097 bytes and `sha256 d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412`, byte-identical
to both committed copies (`corpus/evidence/round-30/frontier/bytes/S116.txt` and
`.../refetch/bytes/S116.txt`), so the live source at measurement time still contains the quote with
normalised text equal to the committed bytes — C2's last clause, checked independently rather than read
from the receipt. `-12` still returns HTTP 404 (77297-byte error page, itself byte-stable), and
datatracker's revision list still tops out at `-11` (23 May 2026), with no RFC superseding it. All
**22 of 22** ≥4-word double-quoted spans of the entry locate verbatim in my own whitespace-collapsed
bytes, and I read the surrounding paragraph of every one that could carry a reversed meaning: **no
quote-mining** — each quote sits in the sentence the entry attributes it to, including the four highest-risk
ones (`are informative and MAY be ignored`; `it indicates that the server may soon throttle the client`;
the FAQ's `we use it just as an example…`; the I-D boilerplate `It is inappropriate…`). The 25-word
receipt quote locates contiguously across its sentence boundary and sits exactly at the ≤25-word ceiling.
The w1 quote-to-line table's 22 rows also verify exactly (line ranges, word counts, occurrence counts),
and w1's committed `-09`/`-10`/`-12` bytes are byte-identical to my live fetches, so the entry's
"`t` changed meaning while the syntax did not" finding is re-derivable from the lane's own bytes rather
than taken on trust. Two prose imprecisions remain, both low severity and neither affecting a quoted
span: line 27-28 implies `t` is required where the draft makes it OPTIONAL (the entry's own next quote
says OPTIONAL), and line 3's section list omits §2 Terminology (2 quoted spans) and §8.1 (1 quoted span).

## 1. Live re-open of `-11` (the predicate's "live source at measurement time")

Receipts (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w2/RefetchLiveS116/receipts.tsv`;
all read-only HTTPS GET, no cookies, credentials or session material; `curl -sS`):

| UTC (2026-10-26) | URL | HTTP | bytes | sha256 | time |
|---|---|---|---|---|---|
| 07:38:53Z | `https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt` | 200 | 67097 | `d6016dd0…d412` | 0.032 s |
| 07:38:53Z | `…-12.txt` | **404** | 77297 | `db9919c0…c898` | 0.042 s |
| 07:38:53Z | `…-10.txt` | 200 | 67803 | `f40a2411…7aa5` | 0.036 s |
| 07:38:54Z | `…-09.txt` | 200 | 67876 | `e088940d…73ee` | 0.039 s |
| 07:38:54Z | `https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/` | 200 | 114084 | `11b90c5e…9fe3` | 0.039 s |

Earlier same-day fetches by this seat (07:34:33Z–07:35:56Z) returned the identical `-11`, `-12`, `-09`,
`-10` bytes; five `-11` responses total, one sha256.

```
$ curl -sS -o r11.txt -w 'status=%{http_code} bytes=%{size_download}\n' https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt
status=200 bytes=67097                                                       # exit 0
$ sha256sum r11.txt
d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412  r11.txt
$ sha256sum <lane>/corpus/evidence/round-30/frontier/bytes/S116.txt \
            <lane>/corpus/evidence/round-30/frontier/refetch/bytes/S116.txt
d6016dd0…d412  …/frontier/bytes/S116.txt
d6016dd0…d412  …/frontier/refetch/bytes/S116.txt
```

**Holds.** The receipt (`fetched_by: FetchS159`, 06:39:52Z) and the refetch (`seat:
ScribeEntryRateLimitFields`, 06:40:26Z) are two different seats, and both committed copies are the bytes
I now get. `byte_count: 67097` in `refetch/S116.json` matches.

## 2. `-12` and datatracker's newest revision

`-12` returns **404** with a 77297-byte error body — larger than the draft itself, so a check that
compared only byte counts would "pass"; the receipt's `http_status: 404` claim is what is correct and it
is correct. My 404 body is byte-identical to w1's committed `ratelimit-headers-12-http404.html`
(`db9919c0…c898`).

Datatracker page (tag-stripped): revision tokens present are `-00, -01, -02, -03, -07, -08, -11`;
no `-12` anywhere; date tokens reduce to `2026-05-23`; the only `.txt` link on the page is
`…-11.txt`; the only `RFC` tokens are reference RFCs (9110, 9651, 9457, 6585, 2119/8174/8126), i.e.
no RFC has been published from this draft. The `-11` front matter agrees: `23 May 2026`,
`Expires: 24 November 2026`.

**Holds** — newest revision is `-11`, "links only `-11`'s `.txt`" is accurate, and "a draft, not a
standard" is accurate as of this measurement.

## 3. The dynamic-render caveat is true (and I reproduced it)

Five of my fetches of the datatracker page returned **114084 bytes with five different sha256**
(`6c0e33f0…`, `b3ac453f…`, `1bc17257…`, `4248d892…`, `11b90c5e…`), plus w1's `00871dc8…`. Same length,
different bytes — so the page is evidence of the revision list only, exactly as the entry and the w1
receipt say. This is the one place where a byte-count-only check would be actively misleading, and the
entry already refuses to treat it as stable bytes.

## 4. The receipt quote

`S116.json.quote` = *"The field value SHOULD remain consistent over a sequence of HTTP responses. It is
this characteristic that differentiates it from the RateLimit (Section 4) field"*.

- Located **contiguously** in my whitespace-collapsed bytes (not two separate hits): `True`.
- Word count **25** — exactly at the ≤25-word ceiling. Compliant, but with zero headroom: any counting
  scheme that splits `(Section` or `RateLimit-Policy` would push it to 26. The entry is admitted today, so
  the counter's own tokenisation is ≤25 on this string; worth knowing if the counter ever changes.
- It spans draft lines 308-311, i.e. exactly the "two package sentences that survived re-location are at
  lines 308-309 and 309-311" claim in the entry's *Adopted from* section. Verified.

## 5. Every ≥4-word double-quoted span of the entry (22/22 found)

Method: extract every `"…"` span (newline-tolerant, non-greedy; the document contains 44 `"` characters =
22 spans, so the pairing is exhaustive), keep spans of ≥4 words after whitespace collapse, search my own
`r11.txt` collapsed the same way. Output: `.ufo/waves/round-30/w2/RefetchLiveS116/quote-check.txt`.

| # | entry line | draft lines | section | span (start) | result |
|---|---|---|---|---|---|
| 1 | 20 | 308-309 | §3 | The field value SHOULD remain consistent… | FOUND |
| 2 | 21 | 309-311 | §3 | It is this characteristic that differentiates… | FOUND |
| 3 | 23 | 311-313 | §3 | enables clients to control their own flow… | FOUND |
| 4 | 26 | 438 | §4 | The field is expressed as a List[SF]… | FOUND |
| 5 | 28 | 461-462 | §4.1 | This REQUIRED parameter value conveys… | FOUND |
| 6 | 30 | 464-465 | §4.1 | This OPTIONAL parameter value conveys… | FOUND |
| 7 | 33 | 293-294 | §2 | A service limit is the currently available quota… | FOUND |
| 8 | 35 | 482-484 | §4.1.1 | Clients MUST NOT assume that a positive… | FOUND |
| 9 | 36 | 484-485 | §4.1.1 | it indicates that the server may soon throttle… | FOUND |
| 10 | 38 | 512-513 | §4.1.2 | The client MUST NOT assume that all its service limit… | FOUND |
| 11 | 47 | 722-723 | §7 | are informative and MAY be ignored | FOUND |
| 12 | 48 | 289-290 | §2 | Quota policies can be advertised by servers… | FOUND |
| 13 | 54 | 623-624 | §6 | A server MAY return RateLimit header fields independently… | FOUND |
| 14 | 56 | 1185 | App. A | replying instead with a 4xx HTTP status code… | FOUND |
| 15 | 59 | 1633-1635 | FAQ | we use it just as an example of a throttled request… | FOUND |
| 16 | 62 | 733-735 | §7 | If a response contains both the RateLimit and Retry-After… | FOUND |
| 17 | 68 | 679-680 | §6.2 | Servers are not required to return RateLimit header fields… | FOUND |
| 18 | 70 | 708-709 | §7 | A client receiving RateLimit header fields MUST NOT assume… | FOUND |
| 19 | 72 | 712 | §7 | Malformed RateLimit header fields MUST be ignored. | FOUND |
| 20 | 83 | 491-492 | §4.1.2 | the number of seconds within which the client can use… | FOUND |
| 21 | 91 | 63-64 | front matter | It is inappropriate to use Internet-Drafts… | FOUND |
| 22 | 99 | 816 | §8.1 | This specification does not prevent clients from making requests. | FOUND |

`MISSING COUNT: 0`.

## 6. Quote-mining audit (surrounding text checked for each risky span)

I printed the raw 7-9 line window around every span whose meaning a truncation could flip
(`contexts.txt`, `ctx.py`). None flips:

- **#11 `are informative and MAY be ignored`** — draft: *"The details provided in the RateLimit-Policy
  header field are informative and MAY be ignored."* The entry writes *"Its details "are informative and
  MAY be ignored""* — `Its` = the policy field's details. Faithful. (Draft line 722 is in §7, not in a
  policy-specific subsection; the entry's class-1 use — policy details are not this request's outcome —
  is what the sentence says.)
- **#9 `it indicates that the server may soon throttle the client`** — draft: *"When the available quota
  is low, it indicates that the server may soon throttle the client"*. The entry supplies the same
  condition (*"when the number is low"*). Not a reversal of "already throttled".
- **#15 FAQ `we use it just as an example…`** — `it` = `[RFC6585] defines the 429 status code and we use
  it just as an example of a throttled request`. The entry's gloss (*"the FAQ treats 429 as one example
  among several"*) matches.
- **#21 `It is inappropriate to use Internet-Drafts as reference material`** — the sentence continues
  *"or to cite them other than as "work in progress.""*, and the entry says exactly that the boilerplate is
  *"qualified by `as work in progress`"*. Faithful; the entry does not overclaim that the boilerplate
  confers authority.
- **#7 `A service limit is the currently available quota under a specific quota policy`** — the draft
  continues *"and, if defined, the effective time window within which the client can use no more than the
  available quota."* The entry truncates before the `t` clause, but the continuation *supports* its point
  (a quantity, not an outcome) and the entry treats `t` separately in §4.1.2 quotes. Truncation does not
  change meaning.
- **#13, #16, #17, #18, #19, #22, #20, #10** — each is verbatim and in the attributed sentence; #16's
  Retry-After precedence and #17/#18/#19's three absences read exactly as the entry frames them.

**No quote-mining found.** The one place where context matters and the entry's framing is *narrower* than
the draft is #11, and there the entry is if anything more conservative than the draft.

## 7. w1's quote-to-line table re-verified against my bytes

Parsed the 22 rows of `.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/quotes.md` and recomputed, from
my own fetch, each row's start-end raw line, word count and occurrence count
(`table-check.txt`): **22 rows, 0 bad.** Section attributions also check out against the `-11` heading
map (§3 302, §3.1 325, §4 432, §4.1 453, §4.1.1 477, §4.1.2 488, §5.1 544, §5.2 574, §6 621, §6.2 677,
§7 688, §8.1 814, Appendix A 1167, FAQ 1610).

Anchor claims re-derived independently:
- `-09` line 322 = `RateLimit-Policy: "burst";q=100;w=60,…` and line 409 = `RateLimit-Policy:
  "default";q=100;w=10`; those two examples sit at `-11` lines **323** and **417**. Entry's sentence
  ("they are `-09`'s numbering … sit at 323 and 417 in `-11`") is exact.
- `-09` line 301 is the `3.  RateLimit-Policy Field` heading — consistent with the entry calling the
  anchors `-09`'s numbering rather than examples.
- `-10` §4.1.2 is titled **Reset Parameter** with *"The "t" parameter indicates the number of seconds
  until additional quota associated with the quota policy is made available."*; `-11` §4.1.2 is
  **Effective Window Parameter** with *"the number of seconds within which the client can use no more than
  the available quota."* So *"`t` changed meaning while the syntax did not"* is true and re-derivable, and
  `t=30` does parse identically under both.
- Byte counts `-09` 67876 / `-10` 67803 / `-11` 67097 all reproduce, and w1's committed copies of
  `-09`, `-10`, `-11`, and the `-12` 404 body are byte-identical to my live fetches — so the three-revision
  comparison is auditable from lane bytes, not only from the w1 narrative.

## 8. Findings

**F1 — low severity, prose precision (not a quote defect).**
`corpus/knowledge/rate-limit-policy-fields.md:27-28`: *"each naming a policy and carrying `r` (available
quota), `t` (effective window) and optionally `pk`"*. In `-11` §4.1 the parameter list (lines 461-469) makes `r`
**REQUIRED** (461-462), `t` **OPTIONAL** (464-466) and `pk` **OPTIONAL** (468-469). The sentence's grammar ("and optionally `pk`") implies `t` is
mandatory. Risk is concrete: a journey record built from this sentence would require `t` and would fail to
classify a valid `RateLimit: "default";r=50` response (no `t`). Mitigation already present in the same
paragraph — the next quote is *"This OPTIONAL parameter value conveys the effective window…"* — so a
careful reader is corrected one line later, and no counter would catch this. Smallest safe correction:
`carrying `r` (available quota, required), `t` (effective window, optional) and optionally `pk``, or drop
`and optionally` for `pk` and mark all three.

**F2 — low severity, provenance completeness.**
`…:3` lists the sections read as *"§3–§3.2, §4–§4.2, §5.1–§5.3, §6, §7, Appendix A, FAQ"*. Three of the
22 quoted spans come from outside that list: **§2 Terminology** (doc lines 33 and 48 → draft 293-294 and
289-290) and **§8.1** (doc line 99 → draft 816), plus one from the front-matter *Status of This Memo*
(doc line 91 → draft 63-64). The w1 table does attribute those rows to §2 correctly, so this is an
omission in the entry's own header line only. Smallest safe correction: add `§2, §8.1` (and note the
Status of This Memo quote) to the section list.

Neither finding touches a quoted span, a receipt, a refetch, or a re-derivable claim; both are curation
inside the C2 entries, which is where the round routes curation.

## 9. What I did not do (honesty bounds)

- I did **not** run `scripts/check-frontier-admission.mjs` or `check-gate-mutants.mjs`. Those are other
  seats' items; this seat measured the predicate's live-bytes clause directly instead of reading a counter.
- No lane file edited; no git write in the lane; no clone created (this item is a network + text audit, so
  the scratch clone would have added nothing). Scratch used and removed:
  `/fast/scratch/hyaku/tabi-r30/RefetchLiveS116`; receipts copied into the output dir first.
- No tools installed, no package manager touched (pacman untouched host-wide), no builds/linters run.
- All network activity was read-only HTTPS GET of the five public URLs in §1; no logins, cookies,
  credentials, API calls, or session material.

## 10. Commands and exit codes

| command | exit |
|---|---|
| `curl -sS -o r11.txt -w 'status=%{http_code} bytes=%{size_download}' …/-11.txt` | 0 (200, 67097) |
| `curl … …/-12.txt` | 0 (404, 77297) |
| `curl … …/-09.txt` / `…/-10.txt` | 0 (200, 67876 / 67803) |
| `curl … https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/` ×5 | 0 (200, 114084, 5 distinct sha256) |
| `sha256sum r11.txt …/frontier/bytes/S116.txt …/refetch/bytes/S116.txt` | 0 (all `d6016dd0…d412`) |
| `python3 q2.py` (22-span locate, whitespace-collapsed) | 0 (`MISSING COUNT: 0`) |
| `python3 ctx.py r11.txt <8 probes>` (quote-mining windows) | 0 |
| `python3 table.py` (w1 table: lines/words/occurrences) | 0 (`rows: 22 bad: 0`) |
| `grep -nic epoch r11.txt` | 0 (count `0` — no epoch/absolute-reset member) |
| `grep -n "S116" corpus/SOURCES.md` / `grep -n "S116" corpus/lessons/round-30.md` | 0 (row and Gate entry present) |

Artifacts: `.ufo/waves/round-30/w2/RefetchLiveS116/{receipts.tsv, quote-check.txt, table-check.txt,
contexts.txt, q.py, q2.py, ctx.py, table.py}`.

**Verdict on the attacked claim surface: S116 holds.** The live source still serves the quoted bytes; all
22 spans are verbatim; no span is quote-mined; the revision-history finding is re-derivable from lane
bytes. F1 and F2 are low-severity prose/provenance imprecisions that no counter in the frozen catalogue
would catch and that a curation pass should fold in.
