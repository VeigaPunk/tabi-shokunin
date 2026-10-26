# Round 30 w1 — C2 registry rows (draft; no lane edits)

- Seat: `ScribeRows` (scribe, leaf). Date: 2026-10-26.
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Read at lane tip `061e62024c0523d3c6c7e819506a773ff2cd7d75` (baseline `f7c0317e4f8445502005e79e3d65767430912dab`). No lane file was edited; this is a proposal, not a landed change.
- Inputs read: `.ufo/waves/round-30/claims.json` (C2, assimilation), `.ufo/waves/round-30/baseline/README-receipts.md`, `corpus/SOURCES.md` header + registry, `CORPUS.md` §SOURCES.md (contract v1), `scripts/check-frontier-admission.mjs` (frozen counter, sha256 `cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca`), `corpus/lessons/round-29-verifier-spotcheck.md` §Routed defects 1–6, and the read-only package `/home/vgpnk/Projects/shokuknow/merge/tabi/` (`SOURCES.append.md`, the two candidate entries, the two rejected entries).
- Deliverables of this seat: this file, `gate-block.md`, and `receipts/` (fetched bytes + log). Report: `.ufo/waves/round-30/w1/ScribeRows.md`.

## 1. Rows, verbatim (11-column schema of `corpus/SOURCES.md`)

Append after S115. No cell contains `|` or `\|`.

```text
| S116 | RateLimit header fields for HTTP — draft-ietf-httpapi-ratelimit-headers-11 — https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | spec | A | The normative quota-policy vocabulary for the rate-limit signal class a journey records — the two header fields, their stability distinction, quota policy items and service limit items | draft-ietf-httpapi-ratelimit-headers-11 (23 May 2026, expires 24 November 2026), §3 "RateLimit-Policy Field" line 302 and §4 "RateLimit Field" line 432, example lines 323 and 444; fetched 2026-10-26, 67097 B, sha256 d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 | A server can publish its quota policy in a `RateLimit-Policy` field that stays consistent across responses, distinct from the per-request `RateLimit` field that MAY change on every request, so a receipt can record which of the two it saw | mined | 2026-10-26 | 180d | corpus/knowledge/rate-limit-policy-fields.md |
| S117 | Rate Limits — Discord Developer Documentation — https://docs.discord.com/developers/topics/rate-limits | docs | A | Discord's own published API rate-limit headers — the response header set this host documents for its API, plus its stated per-guild exception; documentation only, not a measured response and no API calls | §Header Format (the Rate Limit Header Examples block and the per-header list: Limit, Remaining, Reset, Reset-After, Bucket, plus 429-only Global and Scope) and the per-guild exception paragraph before it; no version marker, page dateModified 2026-02-06T17:38:32.017Z, fetched 2026-10-26; raw bytes vary per response (three fetches, 408912 B each) while the normalised body is identical, 8728 chars, sha256 c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007 | Discord documents that its API returns optional response headers carrying the rate limit encountered on the request and lists the X-RateLimit-* fields that carry the budget (limit, remaining, absolute and delta reset, bucket), with Global and Scope on a 429 | mined | 2026-10-26 | 90d | corpus/knowledge/host-published-rate-limit-headers.md |
```

Census run against a scratch copy of `corpus/SOURCES.md` with these two lines appended (`receipts/census-validation.txt`):

```sh
grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' SOURCES.md            # 117
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' SOURCES.md   # 0
awk … duplicate ids                                                                                       # (none)
awk … tier/status/kind enums and A+community inflation                                                   # (none)
awk -F'|' '{print $2, "cells=" NF-2}' → S116 cells=11, S117 cells=11
```

The `mined` rows whose `used-by` paths do not exist check prints exactly two lines until the C2 entries land:

```text
missing: corpus/knowledge/rate-limit-policy-fields.md
missing: corpus/knowledge/host-published-rate-limit-headers.md
```

Landing order is therefore a dependency: rows, the two entries and their receipts must land in the same change, or the census reads transiently dirty.

## 2. Provenance per row

### S116 — IETF RateLimit header fields, newest revision

| item | value |
|---|---|
| URL | `https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt` |
| fetched | 2026-10-26T06:42:52Z, HTTP 200, 67,097 B |
| sha256 | `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` |
| identity | `draft-ietf-httpapi-ratelimit-headers-11`, "RateLimit header fields for HTTP", dated 23 May 2026, `Expires: 24 November 2026`, Intended status: Standards Track |
| revision check | `-12` and `-13` return HTTP 404 on the same host (2026-10-26T06:42:52Z), so `-11` is the newest revision in the archive; `-10` returns 200 (67,803 B) and `-09` returns 200 (67,876 B) |
| anchor | §3 "RateLimit-Policy Field" at line 302; §4 "RateLimit Field" at line 432; the two field examples at lines 323 and 444 |
| stability | three fetches of `-11` in this session are byte-identical (same digest) |

Grounding: §3 states the field "SHOULD remain consistent over a sequence of HTTP responses" while the §4 field carries information that "MAY change on every request"; the §3 example is `RateLimit-Policy: "burst";q=100;w=60,"daily";q=1000;w=86400`. The row teaches only the vocabulary and the stability distinction; it claims nothing about any host's wire behaviour.

### S117 — Discord's own published rate-limit headers

| item | value |
|---|---|
| URL | `https://docs.discord.com/developers/topics/rate-limits` (effective URL after `curl -L` is identical) |
| fetched | 2026-10-26T06:40:43Z, HTTP 200, 408,912 B, raw sha256 `7870fe376942cc701459e76678855a0e75c1077d2be14e7a1f649c1b5aeb5f3e` |
| normalised body | 8,728 chars, sha256 `c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007` (counter normalisation: script/style stripped, tags stripped, entities decoded, whitespace collapsed) |
| page identity | title "Rate Limits - Documentation - Discord Documentation"; embedded `dateModified` 2026-02-06T17:38:32.017Z; no visible revision marker |
| sections | `Header Format`, `Exceeding A Rate Limit`, `Global Rate Limit` — `Invalid Request Limit`, `API Reference` |
| stability | three fetches in this session: raw sha256 `7870fe37…`, `03b5a87d…`, `f29e0b33…` (all 408,912 B); normalised text identical across all three. Raw byte variance is in non-visible bytes (`nonce=` does not occur); the cause is not claimed. The peer seat's independent fetch reports the same normalised sha256 `c719ecca…`, so the stable quantity is corroborated across seats |

Grounding: `Header Format` says the host returns optional headers carrying "the rate limit encountered during your request" and lists `X-RateLimit-Limit`, `-Remaining`, `-Reset` (epoch seconds), `-Reset-After` (delta), `-Bucket`, plus `-Global` and `-Scope` on 429 only. The per-guild exception paragraph says emoji-control routes are limited per guild, then: "the quota returned by our APIs may be inaccurate". The row claims documentation only; no API call was made and no measured response is claimed.

### Tier justification (S117: package staged B, adopted A)

Tier is scoped to the `scope` cell (contract v1, `CORPUS.md` §SOURCES.md). The scope written above is *what Discord publishes about its own API's rate-limit headers* — a publisher's first-party statement about its own documented surface. For that scope the publisher is primary, so A is the contract-conforming grade. The package graded B, which is the right grade for a different scope: a vendor page is not evidence of a host's *observed* behaviour, and it does not establish what a live request would return. Nothing in this row admits an observed behaviour claim, so A does not inflate evidence. `kind` is `docs`, so no A/community conflict arises.

A second, smaller tier consequence: the package's staged row for S116 was already A; adopting it as A is a carry, not a change.

## 3. Transform notes (staged text → proposed lane text)

### 3.1 Recheck cells: prose stripped

| staged text (quoted verbatim) | source | proposed |
|---|---|---|
| `180d (the draft revision moves)` | `merge/tabi/SOURCES.append.md`, row S159, recheck cell | `180d` |
| `recheck: 180d — the draft revision moves; -10 and later currently return 404 (not run in this round)` | `merge/tabi/knowledge/corpus/knowledge/host-rate-limit-signal-classes-r14.md:5` | `recheck: 180d` |
| `90d` | `merge/tabi/SOURCES.append.md`, row S182, recheck cell | `90d` (no prose; carried unchanged) |
| `recheck: 90d (vendor documentation pages change without a version marker) (not run in this round)` | `merge/tabi/knowledge/corpus/knowledge/host-rate-limit-header-set-r16.md:5` | `recheck: 90d` |

CORPUS.md §SOURCES.md rule and the lane's cadence vocabulary accept `90d`/`180d`; the parenthetical explanation is prose in a cell whose contract is a date or cadence, and the "(not run in this round)" clause describes a round that is not this one.

### 3.2 Gate pointers stripped

Both staged entries end their provenance header with `(not run in this round)` — a pointer to a round Gate that was never written. The package ships no `## Gate` block for these rows at all (`MERGE-REPORT.md:136` tells the reviewer to read the lane's own `SOURCES-PROPOSED.md` Gate, which the package does not carry). Proposed treatment: strip the pointer from the entry headers, and let the round-30 Gate block (`gate-block.md`) carry the required URL, access date and located quote for each new row, per contract rule 1.

Exact spans stripped:

- `(not run in this round)` (twice, see 3.1).
- Entry-header fetch dates and section names: `draft-09 fetched 2026-10-23` and `— fetched 2026-10-23`; both re-pointed to the 2026-10-26 opening and the `-11` revision (S116 only; S117 keeps its URL and gains the access date in the Gate).

### 3.3 Renumber map (by document) and id collisions

| staged id | document | proposed lane id |
|---|---|---|
| S159 | `draft-ietf-httpapi-ratelimit-headers` (IETF HTTPAPI WG) | **S116** |
| S182 | Discord Developer Documentation "Rate Limits" page | **S117** |

- Lane ids S116/S117 are unused at the lane tip (`grep -cE '^\|[[:space:]]*S11[67][[:space:]]*\|' corpus/SOURCES.md` → `0`, exit 1); the registry ends at S115. S118 stays reserved for the S044 superseding row (round-29 routed defect 6) and is not used here.
- Package ids S116/S117 name different documents — `WebMCP guide — Modern Web Guidance (GoogleChrome)` and `WebMCP — Draft Community Group Report` respectively. After this adoption, **lane** S116/S117 mean the two rows above; any later adoption of package S116/S117 must be re-pointed by document, never by id. Same hazard for package S118 (the arXiv CDP paper) versus reserved lane S118.
- The staged ids S159/S182 do not exist in the lane and must not appear in lane text.

### 3.4 The package's stale anchor claim (falsified today)

Quoted from the staged row (S159 anchor cell):

> `draft-09 (newest revision in the IETF archive; -10 and later return 404)`

and from the entry header (`host-rate-limit-signal-classes-r14.md:5`):

> `-10 and later currently return 404 (not run in this round)`

Falsified by fetch on 2026-10-26:

| revision | HTTP | bytes |
|---|---|---|
| `-09` | 200 | 67,876 |
| `-10` | 200 | 67,803 |
| `-11` | 200 | 67,097 |
| `-12` | 404 | 77,297 (error page) |
| `-13` | 404 | 77,297 (error page) |

So `-10` exists, and the newest revision is `-11`, not `-09`. The staged row's *section* anchor was accurate for the revision it named — at `-09`, line 301 is `3.  RateLimit-Policy Field`, line 322 is the `RateLimit-Policy: "burst"…` example, and line 409 is a further policy example; at `-11` those land at 302, 323 and 444, with §4 at 432. The defect is the revision claim, not the line map.

### 3.5 Anchor re-pointing for S117

The staged S182 anchor is `§"Rate Limits" (the header table and the per-guild exception)`. "Rate Limits" is the page title, not a section heading; the page's headings are `Header Format`, `Exceeding A Rate Limit`, `Global Rate Limit`, `Invalid Request Limit`, `API Reference`. The proposed anchor names `§Header Format` (the example block and per-header list) and the per-guild exception paragraph, plus the page's `dateModified` and the fetch date.

### 3.6 Other edits to the package text (all disclosed)

- `opened`: staged `2026-10-23` → `2026-10-26` for both rows, because both were re-opened in this round (contract rule 1).
- S117 `tier`: staged `B` → `A`; rationale in §2 above.
- `teaches`: rewritten from the staged cells to match the located Gate quote and to claim documentation only. The staged S182 cell ends `so "you may encounter 429s"`; that span is real but grounds the caveat, not the header set, so it is not the row's Gate quote (it is carried as a second located span in `gate-block.md`).
- `scope`: restated around the scope the tier is graded against (see §2), rather than the staged "one real host's published rate-limit signal set", which reads as a behavioural claim.
- `used-by`: named the two C2 entry paths; both files do not exist yet (landing dependency above).
- No `status`, `recheck` or `used-by` cell of an existing lane row changes; the only in-place edits this round are the C2 ones named in `claims.json`, not in this draft.

## 4. What the frozen C2 counter will read (for the receipt/entry seats)

`scripts/check-frontier-admission.mjs` (frozen) per row id:

- `g1-receipt`: `corpus/evidence/round-30/frontier/<id>.json` parses and has `id` equal to `<id>`.
- `g2-url`: the receipt's `url` is a substring of the row's `source` cell — the URLs above are written to match exactly.
- `g3-bytes`: `bytes_path` committed at REV, `http_status` 200, and `sha256` of those bytes equals `sha256` in the receipt. For S117 the receipt must carry the digest of the bytes the receipt seat commits, not the raw digest in §2 (raw bytes vary); a seat that commits its own fetch and records its own digest is consistent.
- `g4`/`g5`: the receipt `quote` is 1–25 words and a substring of the normalised bytes. `gate-block.md` carries the chosen quotes.
- `g6-gate`: the same quote appears verbatim in `corpus/lessons/round-30.md`.
- `g7-refetch`: `refetch/<id>.json` names a different `seat` from the receipt's `fetched_by`, its own committed bytes hash-match and contain the quote.
- `l1`/`l3` (with `--live`): a live fetch of the receipt URL is 200, contains the quote, and its **normalised** bytes equal the committed normalised bytes. For S117 this is safe even though raw bytes differ: three fetches normalise identically, and an independent seat reports the same normalised sha256. The committed bytes should be one seat's own fetch; `l3` compares normalised text, not raw digests.
- `q1-entry-quote`: every ≥4-word double-quoted span in an entry body must be a substring of the cited row's normalised bytes. Safe spans verified today — S116: `The field value SHOULD remain consistent over a sequence of HTTP responses`; `contains information that MAY change on every request`; `enables clients to control their own flow of requests based on policy information provided by the server`. S117: the Gate disclosure sentence; `limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.`; `All bots can make up to 50 requests per second to our API.` Keep `RateLimit-Policy: "burst";q=100;w=60,"daily";q=1000;w=86400` and `X-RateLimit-Limit: 5` in inline code (inline code is stripped before the quote scan).
- Population: the counter admits *every* entry carrying `frontier: rate-tos-signal`; exactly two must carry it, or population exceeds 2 and `population = 2` fails even with both admitted.

## 5. Fetch log

`receipts/fetches.tsv` (UTC, URL, HTTP, bytes, sha256). Timestamped batch:

| UTC | URL | HTTP | bytes | sha256 |
|---|---|---|---|---|
| 2026-10-26T06:42:52Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-09.txt | 200 | 67876 | e088940d98218985c88a0693d71e9d979cc4b4aff58a353b558b1cf5d58173ee |
| 2026-10-26T06:42:52Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-10.txt | 200 | 67803 | f40a241153d69329e2cbfee86cb39512d42007a2355769b35b1ce68cd16b7aa5 |
| 2026-10-26T06:42:52Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 200 | 67097 | d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 |
| 2026-10-26T06:42:52Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-12.txt | 404 | 77297 | db9919c05eddf8565b54deab5c54e4a49e4ad835ad075652f27d83e5faa6c898 |
| 2026-10-26T06:42:52Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-13.txt | 404 | 77297 | db9919c05eddf8565b54deab5c54e4a49e4ad835ad075652f27d83e5faa6c898 |
| 2026-10-26T06:42:52Z | https://docs.discord.com/developers/topics/rate-limits | 200 | 408912 | f29e0b33077601c4fa052b1e5c57a482e9095e0af934656f1184384451513849 |
| 2026-10-26T06:41:57Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 200 | 67097 | d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 |
| 2026-10-26T06:40:43Z | https://docs.discord.com/developers/topics/rate-limits | 200 | 408912 | 7870fe376942cc701459e76678855a0e75c1077d2be14e7a1f649c1b5aeb5f3e |

Also in this session, without a captured timestamp (same shell, before 06:40Z): one fetch of `-11` (identical digest), one fetch of `-10` (identical digest), one fetch of the Discord page (sha256 `03b5a87d56a0f8f0ec6d0bf786146e9346f42525e56d1efddf931b453e7403fc`). No credentials, cookies or session material were sent; all requests were read-only GETs per the lane's network rule.

## 6. Commands run (exit codes)

```sh
# byte fetches (curl -sS -L --max-time 60)
curl … draft-…-09.txt  → 200, exit 0
curl … draft-…-10.txt  → 200, exit 0
curl … draft-…-11.txt  → 200 (three times, identical digest), exit 0
curl … draft-…-12.txt  → 404 recorded, exit 0 (curl exits 0; HTTP status read from -w)
curl … draft-…-13.txt  → 404 recorded, exit 0
curl … docs.discord.com/developers/topics/rate-limits → 200 (three times, raw digests differ, normalised text identical), exit 0

python3 normalise+substring probes   → 1 occurrence each for every quote used; exit 0
awk census on scratch SOURCES.md     → rows 117, malformed 0, dupes none, enums none; exit 0
awk used-by existence                → prints the two not-yet-landed entry paths; exit 0
grep -cE '^\|[[:space:]]*S11[67][[:space:]]*\|' corpus/SOURCES.md → 0 (exit 1: ids unused)
```

No lane script was executed; no build, lint or formatter was run; no tool was installed or updated.
