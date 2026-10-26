# ScribeEntryRateLimitFields — round 30, wave 1 (C2 / S116)

**Verdict.** The re-grounded entry `corpus/knowledge/rate-limit-policy-fields.md` is drafted
against the newest revision of the IETF RateLimit draft, `draft-ietf-httpapi-ratelimit-headers-11`
(67097 bytes, sha256 `d6016dd0…d412`, fetched 2026-10-26T06:40:26Z), and it is internally
clean: its seven-line header carries the exact `frontier: rate-tos-signal` tag in the first
15 lines, all 22 double-quoted spans of ≥4 words locate verbatim in the fetched bytes
(each is the only occurrence), and a counter-shaped fixture run of
`scripts/check-frontier-admission.mjs` admits it both offline and with `--live` (exit 0).
The package entry's premise is false: `-09`, `-10` *and* `-11` all return HTTP 200 today
while `-12` returns HTTP 404, so staged S159's `-10 and later currently return 404` claim is
stale; the entry renumbers S159 → S116 and records that in an `Adopted from` note. The draft also moved semantically
between `-10` and `-11` (§4.1.2 `t`: Reset Parameter → Effective Window Parameter, same
`t=30` syntax) — the finding that justifies the 180d recheck. No lane file, index, or jj
state was touched; the entry ships as a patch. Population 2 / admitted 2 is **not** claimed
by this seat: it needs the S117 sibling row/receipts, the S116 registry row, the lesson
Gate line, and an independent refetch by a different seat.

## Evidence

Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, seat dir
`/fast/scratch/hyaku/tabi-r30/ScribeEntryRateLimitFields` (TMPDIR passed as `$S/tmp`).
Live clone: `git clone --shared …/tabi-shokunin "$S/clone"` then
`git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75` → `rev-parse HEAD`
= `061e62024c0523d3c6c7e819506a773ff2cd7d75`, `git status --porcelain | wc -l` → 0.

### 1. Fetches (read-only HTTPS GET; `curl -sS -L --max-time 60`)

| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| `https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/` | 2026-10-26T06:40:06Z | 200 | 114084 | `00871dc80b592344ea4e2fac8b16703be0ccadc3f35da18c880f1f2a77b9c45f` |
| `https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-09.txt` | 2026-10-26T06:45:07Z | 200 | 67876 | `e088940d98218985c88a0693d71e9d979cc4b4aff58a353b558b1cf5d58173ee` |
| `https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-10.txt` | 2026-10-26T06:40:26Z | 200 | 67803 | `f40a241153d69329e2cbfee86cb39512d42007a2355769b35b1ce68cd16b7aa5` |
| `https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt` | 2026-10-26T06:40:26Z | 200 | 67097 | `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` |
| `https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-12.txt` | 2026-10-26T06:47:39Z | 404 | 77297 | `db9919c05eddf8565b54deab5c54e4a49e4ad835ad075652f27d83e5faa6c898` (IETF 404 body, kept as `bytes/ratelimit-headers-12-http404.html`) |

The datatracker page is a **dynamic render**: this seat and `CritPackageStaleClaims` fetched
it independently on the same day, both got 114084 bytes, and the sha256 differs
(`00871dc8…` vs `e819780c…`). It is used only for the revision-list reading; the
newest-revision claim rests on the archive’s own status codes (`-12` = 404).

Revision resolution — `grep -oE 'draft-ietf-httpapi-ratelimit-headers-[0-9]{2}\.txt' dt.html | sort -u`
→ only `ratelimit-headers-11.txt`; `grep -c "ratelimit-headers-12" dt.html` → 0; the page's
title/heading is the -11 name (`Expires: 24 November 2026`, dated 23 May 2026); and a direct
probe of `-12` returns HTTP 404. So -11 is the newest revision the archive serves. The only
other networking was the two `curl`s inside the counter's `--live` path (see §4), which hit
the -11 archive URL only.
No logins, cookies, credentials, non-documentation sites, or lane campaigns.

### 2. Quote location (byte-level, whitespace-collapsed)

`python3 tools/locate_quotes.py` over `bytes/ratelimit-headers-11.txt`, matching each span
with `\s+` between tokens and rejecting any hit whose collapsed form differs; output
`tools/quote-hits.json`. Result: 22/22 spans located, one occurrence each. Full table with section,
line range and word count: `quotes.md` (regenerating it from the entry itself with
`tools/make_table.py` reproduced the same 22 rows). Examples:

- `The field value SHOULD remain consistent over a sequence of HTTP responses.` — 12w, §3, lines 308-309
- `It is this characteristic that differentiates it from the RateLimit (Section 4) field that contains information that MAY change on every request.` — 22w, §3, 309-311
- `If a response contains both the RateLimit and Retry-After fields, the Retry-After field MUST take precedence and the effective window MAY be ignored.` — 23w, §7, 733-735
- `we use it just as an example of a throttled request, that could instead use even 403 or whatever status code` — 21w, FAQ item 3, 1633-1635
- `replying instead with a 4xx HTTP status code (e.g. 429 or 403)` — 12w, Appendix A, 1185
- `It is inappropriate to use Internet-Drafts as reference material` — 9w, Status of This Memo, 63-64

### 3. Entry-shape check with the counter's own extractor

`node tools/check_entry.mjs` replicates `headerOf` (first 15 lines = head) and `entryQuotes`
(strip fenced/inline code, collapse, find `"…"` spans with ≥4 words) from the frozen counter
and tests each span against the normalised bytes:

```
headerLines 15
quotes 22
failing []
tag-ok True
```

The header is exactly the seven required lines in the required order (title, blank,
`source: S116 — <url> — §3-§3.2, §4-§4.2, §5.1-§5.3, §6, §7, Appendix A, FAQ — fetched
2026-10-26, 67097 bytes, sha256 `d6016dd0…`), `verified-at`, `recheck`,
`frontier: rate-tos-signal`, `ground`).

### 4. Counter-shaped admission, in a scratch fixture (not the lane)

Fixture `$S/fixture`: one knowledge entry (this draft), a 13-pipe `S116` registry row
(`mined`, `opened 2026-10-26`, `used-by corpus/knowledge/rate-limit-policy-fields.md`), a
receipt and a refetch receipt both over committed copies of the fetched -11 bytes, and a
lesson carrying the receipt quote. Commit made only inside the fixture repo after
`git -C "$F" rev-parse --show-toplevel` = `$F`, with `-c user.name=fixture
-c user.email=fixture@scratch.local`.

- `TMPDIR=$S/tmp node scripts/check-frontier-admission.mjs --rev HEAD --repo "$F" --frontier rate-tos-signal --since 2026-10-26 --json` → **exit 0**; population 1, admitted 1, failing 0, rev `86db97a4ca3609ff5c7e3260cf13f51f5019410a`. Saved: `admission-fixture-offline.json`.
- same with `--live` → **exit 0**; population 1, admitted 1 (`l1-live` and `l3-live-bytes` both pass, i.e. the archive's bytes fetched now normalise identically to the committed bytes). Saved: `admission-fixture-live.json`.
- negative control: one quote replaced by `Servers MUST always publish their whole quota policy in every response.` → **exit 1**, reason `q1-entry-quote "Servers MUST always publish their whole quota policy in every response."`. Saved: `admission-fixture-negative.json`.

The counter used is the lane's, verified frozen before the run:
`sha256sum scripts/check-frontier-admission.mjs` → `cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca`,
equal to `frozenDigests` in `claims.json`. The fixture's refetch seat name is synthetic
(`fixture-refetch`) and is **not** delivered and **not** evidence of an independent refetch.

### 5. Patch

`git -C "$S/clone" add -N corpus/knowledge/rate-limit-policy-fields.md` then
`git -C "$S/clone" diff 061e62024c0523d3c6c7e819506a773ff2cd7d75 -- corpus/knowledge/rate-limit-policy-fields.md`
→ `rate-limit-policy-fields.patch` (129 lines, 123-line file). Applied with
`git -C "$S/clone3" apply` in a fresh `--shared` clone of the lane at the same commit →
applied cleanly, and the resulting file's sha256 equals this draft's
(`44d209fe…d2734fc0a`, exit 0).

## Deliverables

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/`:

| File | sha256 |
|---|---|
| `rate-limit-policy-fields.md` (the entry; 123 lines) | `44d209fecd864488350bc629e0cc908d9523bd477a3ba7e4876ea23d2734fc0a` |
| `quotes.md` (quote → section → draft lines → words → occurrences) | `56f587e8543045213ed517b5d27bd4c30b96c2e136ec8a63e0040e0560c959a5` |
| `rate-limit-policy-fields.patch` | `55f7b4aaa269b1181c599fb3cfa1565845c9cc2470fd43efca1076b1dfe88285` |
| `receipt-s116.json` (counter-format receipt, `fetched_by: ScribeEntryRateLimitFields`) | — |
| `fetch-receipts.json` (URL, UTC, status, bytes, sha256 for all five GETs, incl. the `-12` 404) | — |
| `sources-row-s116.md` (proposed registry row + placement notes) | — |
| `tools/{locate_quotes.py,make_table.py,check_entry.mjs,quotes.txt,quote-hits.json,entry-check.json}` (the locators, their input list and their raw output, so §2-§3 are re-runnable without scratch) | — |
| `sha256.txt`, `bytes/ratelimit-headers-{09,10,11}.txt`, `bytes/ratelimit-headers-12-http404.html`, `bytes/datatracker-doc-page.html` | `d6016dd0…` (11), `f40a2411…` (10), `e088940d…` (09), `db9919c0…` (12, 404 body), `00871dc8…` (page) |
| `admission-fixture-{offline,live,negative}.json` | — |

## Findings

1. **The package's revision claim is false, not merely stale.** Its header says
   `-10 and later currently return 404 (not run in this round)`; the round actually never ran
   the check. `-09` (67876 B), `-10` (67803 B) and `-11` (67097 B) all return 200, and `-12`
   returns 404 with a 77297-byte error page — so the archive *does* serve `-10 and later`, and
   -11 is the newest. Critic `CritPackageStaleClaims` reached the same shas independently in
   this wave and replicated the 21/0 quote reading against the same bytes; I replied with the
   field mapping and the correction recorded in finding 2.
2. **The package's line anchors are -09-specific.** At -09, lines 301/322/409 are exactly
   `3.  RateLimit-Policy Field`, the `burst/daily` example and the `default;q=100;w=10` example.
   In -11, 301 and 322 are blank and 409 is mid-sentence in §3.1.4; §3 begins at 302, the
   `burst/daily` example is at 323 and the `default;q=100;w=10` example at 417. The entry
   therefore drops all package line numbers and cites its own located spans. (An IRC aside of
   mine during this wave put the burst example at 321-322 in -11 — that was a mixed-revision
   read; `grep -n 'RateLimit-Policy: "burst' bytes/ratelimit-headers-11.txt` → 323. Nothing in
   the entry or this report depends on the slip; `CritPackageStaleClaims` caught it.)
3. **`t` changed meaning between -10 and -11 with identical syntax.** -10 §4.1.2 (line 479)
   is `Reset Parameter`; -11 §4.1.2 (line 488) is `Effective Window Parameter`, with the
   normative sentence now `the number of seconds within which the client can use no more than
   the available quota` (lines 491-492). `t=30` parses the same. This is the strongest
   justification for `recheck: 180d` rather than 730d.
4. **Precedence is stated on the client side only.** -11 §7 (733-735) says `Retry-After` MUST
   take precedence; §6 (640-642) restricts the server to not pointing `Retry-After` earlier than
   the effective window. A receipt that treats `t` as the wait while `Retry-After` is present
   contradicts both.
5. **Counter blind spot (observation, not repaired here).** `headerOf` slices the body at
   line 15, so every entry's first seven body lines are outside `q1-entry-quote`. My draft puts
   no quoted span above line 15 (all 21 were extracted from the slice), but the gate does not
   enforce that for entries in general. Routing as an observation for the C1/C2 owners.
6. **`-11` is a moving draft, not a standard.** The fetched document's own Status of This Memo
   says `It is inappropriate to use Internet-Drafts as reference material` — generic I-D
   boilerplate, qualified by `as work in progress`, saying nothing about this draft's authority
   — and the draft expires 24 November 2026; its own IANA table still carries an `RFC nnnn`
   placeholder (line 1076, `concurrent-requests`). `qu`, `w` and `pk` are present unchanged in
   -10 and -11, so the observed churn between those two revisions is the `t` semantic and the
   section titles — not the parameter set.

## Not done here (handoff)

- Registry row for S116 — proposal in `sources-row-s116.md`; I did not edit `corpus/SOURCES.md`.
- Receipt placement under `corpus/evidence/round-30/frontier/` (and the `bytes_path` choice) —
  delivered as `receipt-s116.json`; see the placement note.
- **`g7-refetch` must be written by another seat**; this seat cannot supply an independent refetch
  and did not fabricate one.
- `g6-gate` lesson line in `corpus/lessons/round-30.md` — the receipt quote to use is
  `The field value SHOULD remain consistent over a sequence of HTTP responses.`
- Population 2 / admitted 2 depends on the S117 sibling (`host-published-rate-limit-headers.md`,
  Discord) landing its own row, receipt and refetch; nothing here asserts it.
- No `--live` run of the counter against a lane revision: the entry lives in the wave dir, not in
  `corpus/knowledge`, so a lane-revision run would report population 0 until the patch lands.

## Limits of this report

- The exit-0 admissions in §4 are fixture measurements with a synthetic refetch seat; they show
  the entry's shape, quotes and bytes pass the frozen gate's checks, **not** that claim C2 holds
  at a lane revision. C2's predicate remains unverified.
- No real site was interacted with; no host was confirmed to emit `RateLimit`/`RateLimit-Policy`.
  The entry is documented-upstream only, and says so.
- The `-09` and `-10` bodies are used only for the revision-drift and anchor findings, and the
  `-12` body only to record its 404 status; no span from any of them is quoted in the entry, so
  `q1-entry-quote` has nothing to check against them.
- No tools were installed or upgraded (`pacman` untouched); `node`, `python3`, `git`, `curl`
  were already present.
