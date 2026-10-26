# Round 30 w1 — seat FetchS159: C2 source fetch for the IETF RateLimit header-fields draft

## Verdict

The package row S159 is stale in the one cell the counter can see and right in the cells it
cannot: the draft's newest revision is **-11, dated 2026-05-23** (`draft-ietf-httpapi-ratelimit-headers-11.txt`,
HTTP 200, 67097 bytes, sha256 `d6016dd0…d412`), so the staged anchor's parenthetical
"—10 and later return 404" is false (both -10, 2025-09-27, and -11 return 200; only -12 is 404),
while every prose sentence `host-rate-limit-signal-classes-r14.md` quotes survives verbatim in
-11 (all three ≥4-word quoted spans locate in both -09 and -11 bytes), so the r14 text can be
re-pointed rather than rewritten. What *did* change between -09 and -11 is the per-request field's
parameter semantics (`r` "remaining quota units" → "available quota"; `t` "reset time" → "effective
window" seconds) — that is a teaches-level correction the new lane row must carry, not a quote
failure. I saved the -11 bytes as the S116 receipt (sha256 `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412`,
25-word quote at -11 lines 308–311, verified a substring of the whitespace-collapsed bytes), and
delivered the two-file lane patch (`corpus/evidence/round-30/frontier/S116.json` +
`…/bytes/S116.txt`) which applies clean at `061e620`. S116 is *not* yet admissible on its own: the
counter's g7 gate needs a refetch record written by a **different seat**, which this seat cannot
supply honestly.

## Commands run (all from `$S=/fast/scratch/hyaku/tabi-r30/FetchS159`)

| # | command | exit |
|---|---|---|
| 1 | `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` && `git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75` | 0 (HEAD = `061e62024c0523d3c6c7e819506a773ff2cd7d75`) |
| 2 | `curl -sS -L --max-time 60 -o fetch/…-NN.txt -w '%{http_code}' https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-NN.txt` for NN ∈ {09,10,11,12} | 0; statuses 200,200,200,404 |
| 3 | `curl … https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/` and `/history/` | 0; 200, 200 |
| 4 | `curl … -11.txt` again (stability refetch, 72 s later) + `cmp` | 0; `cmp` exit 0, byte-identical |
| 5 | `node -e '…norm=raw.replace(/\s+/g," ").trim(); norm.includes(quote)…'` on the 4 quote candidates | 0 (output below) |
| 6 | `git -C "$S/clone" diff 061e62024c0523d3c6c7e819506a773ff2cd7d75 > S116-receipt.patch` (after `git add -N` of both new paths) | 0 |
| 7 | `git -C "$S/clone" worktree add --detach "$S/work/applytest" 061e620…` then `git apply --check` + `git apply` | 0; `APPLY-CHECK-OK`, `APPLIED`, `BYTES-MATCH` |

Lane counters (`check-frontier-admission.mjs`, `check-gate-mutants.mjs`) were **not run by this
seat** — the C2/C1 measurements belong to the parent's post-integration gate. Nothing here is a
claim that a counter passed.

## Fetch receipts (URL, UTC, HTTP, bytes, sha256)

Full table: `fetch-log.md` in the output dir; raw bytes of -09/-10/-11 and the -11 refetch are in
`fetch/`.

| label | url | utc | http | bytes | sha256 |
|---|---|---|---|---|---|
| doc | https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/ | 2026-10-26T06:39:52Z | 200 | 114084 | 5ead50d0f8513f309911c2e3ee6921f0635ef2016bda539eb6c6c528b97f7c35 |
| history | https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/history/ | 2026-10-26T06:39:52Z | 200 | 57066 | f282194b023cd7c4461a9630bcc613c1c3bbfc00ab43b94c651a2a840cb142c7 |
| 09 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-09.txt | 2026-10-26T06:39:52Z | 200 | 67876 | e088940d98218985c88a0693d71e9d979cc4b4aff58a353b558b1cf5d58173ee |
| 10 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-10.txt | 2026-10-26T06:39:52Z | 200 | 67803 | f40a241153d69329e2cbfee86cb39512d42007a2355769b35b1ce68cd16b7aa5 |
| **11** | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T06:39:52Z | 200 | 67097 | **d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412** |
| 12 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-12.txt | 2026-10-26T06:39:52Z | 404 | 77297 | db9919c05eddf8565b54deab5c54e4a49e4ad835ad075652f27d83e5faa6c898 |
| 11-refetch | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T06:41:04Z | 200 | 67097 | d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 |

Newest-revision evidence: the `-12` bytes are the archive 404 page (title/body of an error page),
not a revision; the datatracker doc page references only `draft-ietf-httpapi-ratelimit-headers-11.txt`;
the history table records "New version available: draft-ietf-httpapi-ratelimit-headers-11.txt" at
2026-05-23 and the same for -10 at 2025-09-27. The -11 header block reads
`Expires: 24 November 2026` / `23 May 2026`. All three drafts are 1960 lines.

## S116 receipt

`S116.json` (also staged at `corpus/evidence/round-30/frontier/S116.json` by the patch):

```json
{
  "id": "S116",
  "url": "https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt",
  "fetched_at": "2026-10-26T06:39:52Z",
  "fetched_by": "FetchS159",
  "http_status": 200,
  "bytes_path": "corpus/evidence/round-30/frontier/bytes/S116.txt",
  "sha256": "d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412",
  "quote": "The field value SHOULD remain consistent over a sequence of HTTP responses. It is this characteristic that differentiates it from the RateLimit (Section 4) field"
}
```

Quote audit (the counter's own rules: whitespace-collapsed substring, 1..25 words): 25 words;
substring of `normalise(bytes)` = **true**; it sits at -11 lines 308–311, i.e. inside page 6's body
(page 6 footer is line 336), so it spans no page break or header. It grounds both halves of the
teaches — "SHOULD remain consistent over a sequence of HTTP responses" is the *stable published
policy* side, "differentiates it from the RateLimit (Section 4) field" names the per-request field.
The very next sentence, which the entry may quote separately, carries the volatility clause:
"contains information that MAY change on every request" (8 words, -11 lines 310–311, also a
substring of the same bytes).

Fetched bytes are also byte-stable against a second live GET 72 s later (same sha256), so the
`--live` gate's l3-live-bytes comparison will hold for this URL; the archive id URL is immutable.

## Delivered patch

`S116-receipt.patch` — two added files, nothing else:
`corpus/evidence/round-30/frontier/S116.json`, `corpus/evidence/round-30/frontier/bytes/S116.txt`.
`git apply --check` against a detached worktree at `061e62024c0523d3c6c7e819506a773ff2cd7d75`
succeeds; the applied bytes hash to `d6016dd0…d412` and `cmp` against the output-dir copy is clean.
The patch is generated in a scratch clone only; nothing in the lane was touched.

## Line map (draft-11, 1960 lines) — full JSON in `S116-linemap.json`

| element | -11 lines |
|---|---|
| §1 bullet: `RateLimit-Policy` = "a quota policy, defined by the server, that client HTTP requests will consume" | 190–191 |
| §1 bullet: `RateLimit` = "the quota currently available under a specific policy" | 193 |
| §2 terminology: Quota Policy | 285–291 |
| §2 terminology: Service Limit | 293–296 |
| **§3 RateLimit-Policy Field** (heading) | **302** |
| §3 definition: non-empty `List[SF]` of Quota Policy Items; `Item[SF]` MUST be `String[SF]` | 304–306 |
| §3 stability: "SHOULD remain consistent over a sequence of HTTP responses" + differential vs the `RateLimit` field | 308–311 |
| §3 "enables clients to control their own flow of requests based on policy information provided by the server" | 311–313 |
| §3 "Situations where throttling constraints are highly dynamic are better served using the RateLimit field (Section 4)" | 313–317 |
| §3 list may be split over multiple `RateLimit-Policy` fields ([SF] §3.1) | 319–321 |
| §3 example `RateLimit-Policy: "burst";q=100;w=60,"daily";q=1000;w=86400` | **323** |
| §3.1 Quota Policy Item (heading) | 325 |
| §3.1 parameters `q` (REQUIRED) / `qu` / `w` / `pk` | 341–342 / 344–347 / 348 / 350–352 |
| §3.1 other parameters allowed (353); vendor-prefixed SHOULD (355–356); MUST NOT in trailer | 358 |
| §3.1.1 `q` must be non-negative Integer | 360–365 |
| §3.1.2 `qu` must be String; registry §10.3: requests / content-bytes / concurrent-requests | 366–382 |
| §3.1.3 `w` non-negative, non-zero Integer seconds (delay-seconds-like) | 397–403 |
| §3.1.4 `pk` must be Byte Sequence; quotas allocated per partition key | 405–410 |
| §3.2 examples heading | 412 |
| §3.2 examples: `"default";q=100;w=10` / `"permin";q=50;w=60,"perhr";q=1000;w=3600` / `"peruser";q=100;w=60;pk=:cHsdsRa894==:` / `"peruser";q=65535;qu="content-bytes";w=10;pk=:sdfjLJUOUH==:` | 417 / 421 / 425 / 430 |
| **§4 RateLimit Field** (heading) | **432** |
| §4 definition: current service limit for a quota policy for a particular partition key; `List[SF]` of Service Limit Items | 434–439 |
| §4 example `RateLimit: "default";r=50;t=30` | 444 |
| §4.1 Service Limit Item; parameters `r` (REQUIRED, available quota) 461–462, `t` (OPTIONAL, effective window) 464–467, `pk` 468–470; MUST NOT in trailer 471 | 453–475 |
| §4.1.1 Available Quota Parameter: `r` non-negative Integer; clients MUST NOT assume availability is a guarantee | 477–486 |
| §4.1.2 Effective Window Parameter: `t` seconds within which the client can use no more than the available quota; server MAY arbitrarily alter quota and window between requests | 488–516 |
| §4.1.3 Partition Key Parameter | 518–522 |
| §4.2 examples: `r=50;t=30` / `r=999;pk=:dHJpYWwxMjEzMjM=:` / `r=300000000;t=60;pk=:QXBwLTk5OQ==:` | 530 / 535 / 540 |
| §5 Problem Types (5.1 quota-exceeded 544, 5.2 temporary-reduced-capacity 574, 5.3 abnormal-usage-detected 595) | 542–620 |
| §10 IANA (10.1 field registry 977, 10.2 problem types 994, 10.3 RateLimit quota unit registry 1041) | 972–1091 |

## What changed for each sentence the package entry r14 quotes

| r14 material | status in -11 | detail |
|---|---|---|
| `"SHOULD remain consistent over a sequence of HTTP responses"` (9 words) | **present, byte-identical** | -09 307–308, -11 308–309; located in both revisions' normalised bytes |
| `"contains information that MAY change on every request"` (8 words) | **present, byte-identical** | -09 309–310, -11 310–311 |
| `"enables clients to control their own flow of requests based on policy information provided by the server"` (17 words) | **present, byte-identical** | -09 310–312, -11 311–313 |
| `RateLimit-Policy: "burst";q=100;w=60,"daily";q=1000;w=86400` (code span, ignored by q1) | **present, byte-identical** | -09 322 → -11 323 (§3 anchor 301 → 302) |
| "where throttling is highly dynamic, the per-request field is the one to use" (paraphrase) | **changed in -10** | -09 carried a malformed xref: `better served using the (RateLimit field)[{#ratelimit-field}]`; -10/-11 read `better served using the RateLimit field (Section 4)` |
| "§3 … (line 301) and the examples at lines 322 and 409" | **line numbers moved** | -11: §3 at 302, the §3 example at 323, the first §3.2 example at 417 (others 421 / 425 / 430) |
| "draft-09 (newest revision in the IETF archive; -10 and later return 404)" | **gone / false** | -10 (2025-09-27) and -11 (2026-05-23) both HTTP 200; only -12 is 404 |
| "policy types such as burst, permin, perhr and daily" | **imprecise, not a revision change** | in -11 these are example *policy identifiers* (a free-form `String[SF]`, §3.1); the IANA registry at §10.3 registers quota **units** (requests, content-bytes, concurrent-requests), not policy types |

Revision-attributed changes (not in r14, but teaches-relevant for the new row):

- **-10** fixed the §3 xref typo above, replaced `[RFC8941]`/`[STRUCTURED-FIELDS]` with the `[SF]`
  abbreviation throughout §3–§4, and hardened §4's `This field cannot appear in a trailer section`
  to `MUST NOT`.
- **-11** changed the *meaning* of the per-request field's parameters: §4.1.1 `Remaining Parameter`
  → `Available Quota Parameter` (`r` = available quota, not "remaining quota units"), §4.1.2
  `Reset Parameter` → `Effective Window Parameter` (`t` = seconds within which the client can use
  no more than the available quota, not "seconds until reset"), with the closing paragraph rewritten
  ("service limit will be reset" → "service limit will be fully restored after the time indicated by
  the effective window parameter"), §2 restating Service Limit / `RateLimit` in available-quota and
  effective-window terms, §8.3/§8.4 retitled, and appendix B.3.1 "Missing Remaining information"
  removed. §10.3's quota-unit registry already existed in -09.

## What the lane still needs for this row (not mine to write)

1. **The SOURCES row** (S116), 11 cells in the registry's order
   `id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by`;
   `source` must contain the -11 URL verbatim (g2-url), `opened` ≥ 2026-10-26 (r4-opened),
   `status` `mined` (r2), `used-by` the new entry path (r3). Suggested cells:
   `S116 | RateLimit header fields for HTTP — draft-ietf-httpapi-ratelimit-headers-11 — https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | spec | A | The normative quota-policy vocabulary for the rate-limit signal class: a stable published quota policy versus a per-request service limit | §3 "RateLimit-Policy Field" (line 302), stability sentence 308-311, example 323; §4 "RateLimit Field" (line 432), r/t parameters 461-467, examples 530-540; draft-11 dated 2026-05-23 (newest revision; -10 and -11 return 200, -12 returns 404) | A server can publish its quota policy as a structured field naming quota windows (q=, w=) and its own policy identifiers such as burst, permin, perhr and daily, stable across a sequence of responses, while the per-request RateLimit field carries the available quota and effective window | mined | 2026-10-26 | 180d (the draft revision moves) | <new entry path> |`
2. **The lesson Gate line** in `corpus/lessons/round-30.md` (g6) must contain the 25-word quote
   exactly as collapsed, e.g. `- S116: https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt, 2026-10-26, "<quote>"`.
3. **The refetch record** `corpus/evidence/round-30/frontier/refetch/S116.json` written by a seat
   **other than `FetchS159`**, with its own `bytes_path` (e.g.
   `corpus/evidence/round-30/frontier/refetch/bytes/S116.txt`), `http_status` 200 and `sha256`
   `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` (the URL is byte-stable, so
   an independent fetch must land on exactly this digest); the quote must locate in those bytes.

## Risks / blockers

- **g7-refetch is unfulfilled by design here**: I did not create a refetch record, because a second
  seat label on my own fetch would be fabricated provenance (the round's J4 selfquote control is
  exactly that pattern). C2 cannot reach admitted 2 for this row until another seat refetches.
- **used-by is a placeholder** in the suggested row; it must name the actual new entry path, or
  r3-used-by fails.
- The r14 entry's prose can be reused verbatim (all three quotes survive in -11), but its header
  (`source: S159 … -09 … fetched 2026-10-23`, `recheck: 180d — … -10 and later currently return 404`)
  and its teaches wording about "policy types" must be re-pointed; the entry's own `source:` cell
  must name S116.
- If the new entry keeps a quoted span from the *per-request* field's -09 wording ("remaining quota
  units", "reset"), that span will **not** be located in the -11 bytes — quote -11's "available
  quota" / "effective window" phrasing instead (lines 461–467 in the map above).
- The package's staged row S159 claims "-10 and later return 404": that cell is the one the round's
  package-as-is control (J2) shows cannot be admitted, so the row must be re-pointed to -11, not
  date-bumped.

## Hygiene

- Scratch: `/fast/scratch/hyaku/tabi-r30/FetchS159/{clone,tmp,work,fetch}`, one shared clone at
  `061e620…`; all receipts copied to the output dir; scratch and the temporary worktree removed
  after the report was written. Nothing under `/home/vgpnk/Projects/shokunin` outside
  `tabi-shokunin/.ufo/waves/round-30/w1/FetchS159/` and the report was written.
- Tool installs: **none** (node 24.21.0, curl, python3, git already present); no pacman/uv/npx use.
- Network: read-only HTTPS GETs of ietf.org / datatracker.ietf.org only; no logins, cookies,
  credentials or API calls.
- Output dir contents: `S116.json`, `S116-linemap.json`, `S116-receipt.patch`, `bytes/S116.txt`,
  `fetch-log.md`, `fetch/{draft-09.txt,draft-10.txt,draft-11.txt,draft-11-refetch-0641Z.txt}`.
