# RevDiscernmentSpot — round-30 w2 discernment spot-check

**Attacked:** one admit and one reject re-opened from `corpus/lessons/round-30.md` §Assimilation, decided
independently against the lane bar (`corpus/QUALITY.md`, `PROVINCE.md`, tier definitions in canonical
`CORPUS.md` §SOURCES contract v1), with the cited sources fetched by me, not trusted from the lane's receipts:

- **Admit:** package `host-rate-limit-header-set-r16.md` (staged S182) → lane `corpus/knowledge/host-published-rate-limit-headers.md`, row S117 (`corpus/SOURCES.md:131`).
- **Reject:** `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/rate-and-tos-signal-vocabulary.md` (staged rows S106/S110; round-27 evidence `.ufo/waves/round-27/quarantine/QuarantineA.md`).

**Verdict: both lane decisions hold — agree with the admit and with the reject; no defect found in either
decision.** The admit verifies end-to-end against a fresh live fetch: my fetch's normalised body is identical
to the committed and refetch bytes (sha256 `c719ecca…54007`, 8,728 chars — exactly the row anchor's claim),
the receipt quote and all 14 ≥4-word quoted spans of the entry are located in the live bytes (a q1 check
against live bytes, stronger than the frozen counter's committed-bytes check), and every factual claim I
tested matches the page. The reject is correct: all five register-recorded quotes for staged S106/S110 are
absent from the cited RFCs in raw and whitespace-collapsed folds, and those recorded quotes are verbatim the
section headings of sibling package rows S107/S111 — the same quote-drift-across-sibling-rows defect class
the lane named. The reject's flip condition is actionable: the entry's prose paraphrases all check true
against the RFCs and its one ≥4-word quoted span is located in RFC 6585, so re-citing on new in-round rows
whose quotes are copied from RFC bytes is concretely executable; two minor gaps noted below. Axes (godspeed):
this seat works the lane's calibration axis (independent re-derivation of an admit and a reject) and depth
(every admit claim checked against a fresh fetch); the move kept is live refetch + verbatim counter-logic
replication; the move dropped is re-running the frozen counter end-to-end (C2's measurement rule and other
seats cover it; I ran per-check analogues instead).

## Method

- Frozen counter logic replicated verbatim from a scratch copy of `scripts/check-frontier-admission.mjs`,
  sha256 verified `cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca` (= frozenDigests):
  `normalise` (:138-151), `entryQuotes` (:155-163), predicates `g5` (:211), `g6` (:212), `g7` (:217-219),
  `l1`/`l3` (:220-224), `q1` (:259-261).
- First attempt imported the module and its CLI main fired (`FRONTIER_ADMISSION verdict=could-not-evaluate
  …`, exit 2); fixed by inlining the identical code into `scripts/verify-s117.mjs`. Recorded as a failed
  attempt, not hidden.
- All fetches `curl -q` (disables `~/.curlrc` — the lane's own M6 finding), `-sS -L`, read-only GETs of
  public documentation/spec pages only; no credentials, cookies or session material.

## Admit S117 — every check passes

| # | check | result |
|---|---|---|
| 1 | fresh live fetch of `https://docs.discord.com/developers/topics/rate-limits` | HTTP 200, 408,912 B, raw sha256 `ce8d04e3…9b5dc`, 2026-10-26T07:40:49Z, 0 redirects (`url_effective` identical) |
| 2 | normalised-body identity (l3 analogue) | live == committed == refetch, sha256 `c719ecca…54007`, 8,728 chars — matches the row anchor's claim (`corpus/SOURCES.md:131`) |
| 3 | committed bytes match receipt (g3) | `corpus/evidence/round-30/frontier/bytes/S117.html` sha256 `b73dc7d1…83c3` = receipt `S117.json` |
| 4 | refetch bytes match refetch record (g7) | `refetch/bytes/S117-refetch.html` sha256 `c1c2d3f9…4b2f3` = `refetch/S117.json`; seat `ScribeEntryDiscordHeaders` ≠ `FetchS182` |
| 5 | receipt quote located (g5 + l1 analogue) | present in live, committed and refetch normalised bytes |
| 6 | quote in round lesson (g6) | `corpus/lessons/round-30.md:16` (Gate table) |
| 7 | entry quoted spans ≥4 words (q1 against live AND committed) | 14/14 located — every span from "For most API requests made…" through "Interaction endpoints are not bound to the bot's Global Rate Limit." |
| 8 | header table names + meanings | all seven `X-RateLimit-*` names and all five meaning strings verbatim in live bytes |
| 9 | §2 scope correction | "Routes for controlling emojis do not follow the normal rate limit conventions. These routes are specifically limited on a per-guild basis…" verbatim — the entry's correction of the package's generalisation is grounded |
| 10 | §3 429 shape | body-field table verbatim: `message` string / `retry_after` float / `global` boolean / `code?` integer; "Note that normal route rate-limiting headers will also be sent in this response." |
| 11 | §3 three example shapes | user: `Retry-After: 65` vs `retry_after: 64.57`; shared: `Retry-After: 1337` vs `retry_after: 1336.57` (differ, as the entry says, without equating them); global: only `Retry-After` + `X-RateLimit-Global: true` + `X-RateLimit-Scope: global`, per-route headers omitted — exactly as the entry states |
| 12 | §4 global limit | "All bots can make up to 50 requests per second to our API." + "If no authorization header is provided, then the limit is applied to the IP address." + "Interaction endpoints are not bound to the bot's Global Rate Limit." |
| 13 | §4 invalid-request cap | "Currently, this limit is 10,000 per 10 minutes." with 401/403/429 as invalid statuses |
| 14 | §5 hard-code warning attribution | page: "rate limits should not be hard coded into your app. Instead, your app should parse response headers…" — the entry's attribution is accurate |
| 15 | row anchor metadata | `dateModified 2026-02-06T17:38:32.017Z` present in raw HTML; my fetch is the fourth at 408,912 B (row says "three fetches, 408912 B each") |
| 16 | provenance + reciprocity (e1/r3, QUALITY 75) | entry head has `source: S117`, `verified-at:`, `recheck:`, `frontier: rate-tos-signal` within the 15-line head; row S117 `used-by` = `corpus/knowledge/host-published-rate-limit-headers.md` |
| 17 | §6 draft cross-check | draft -11 committed bytes (`corpus/evidence/round-30/frontier/bytes/S116.txt`, sha256 `d6016dd0…d412` = row anchor): `qu` parameter at :344-345, `pk` at :350, partition-key example `pk=:cHsdsRa894==:` (a byte sequence) at :425 — the S117 entry's §6 parameter list and "the draft's `pk` is a byte-sequence value" are correct |

**Tier judgment (agree):** lane row S117 is tier A scoped to "what Discord publishes about its own API's
rate-limit headers". Canonical `CORPUS.md` §SOURCES contract v1 (:93-97): A = "primary or authoritative for
that scope (spec, official docs, …)". First-party developer documentation is authoritative for what its
publisher documents about its own wire headers; the package's B was the right grade for evidence of
*observed behaviour*, which neither the row nor the entry claims (entry header: "tier: documented upstream,
not measured in this lane"; §7 limits). The re-scope is honest and the upgrade is defensible. QUALITY 12 is
met either way (A or B both suffice).

## Reject `rate-and-tos-signal-vocabulary.md` — defect confirmed, reject correct

1. **Fetches:** RFC 9309 and RFC 6585 fetched by me from `www.ietf.org` (the package cites
   `www.rfc-editor.org`; my sha256s are byte-identical to round-27 QuarantineA's rfc-editor fetches —
   `f633915d…b207` and `f6d55d1b…76e58` — so the mirrors agree and the round-27 absence verdicts transfer to
   bytes I independently hold).
2. **All five register-recorded quotes absent** (raw AND whitespace-collapsed folds, exit-code evidence in
   `scripts/verify-reject.mjs` output): RFC 9309 contains neither `使用 WebMCP 時，請注意下列事項` nor
   `確認 WebMCP 工具曝光度`; RFC 6585 contains none of `Add hints to your tools`, `Expose your tools
   carefully`, `Last updated 2026-09-01 UTC`.
3. **Quote provenance corroborated from the package register itself:** the Chinese spans are the section
   headings of sibling row S107 (`merge/tabi/knowledge/corpus/SOURCES.append.md:12`, anchor "§「使用 WebMCP
   時，請注意下列事項」… §「確認 WebMCP 工具曝光度」") and `Add hints to your tools` is sibling row S111's
   heading (`:16`) — recorded quotes drifted across sibling rows, the defect class the lane named.
4. **The entry's prose paraphrases all check true** against the RFCs I fetched — so the reject is a
   citation-integrity reject, not a content falsehood:
   - RFC 9309 :100 "These rules are not a form of access authorization." ↔ entry "robots.txt is not access authorization (§1)".
   - RFC 9309 :387-396 §2.3.1.3 "…the crawler MAY access any resources on the server." (400-499 range) ↔ entry's 4xx claim.
   - RFC 9309 :398-404 §2.3.1.4 "…the crawler MUST assume complete disallow." (500-599 range) ↔ entry's 5xx claim.
   - RFC 9309 :415-420 §2.4 "Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable." ↔ entry's "may be used for at most 24 hours" (lossy: drops the unreachable exception — see observations).
   - RFC 9309 :422-425 §2.5 "The parsing limit MUST be at least 500 kibibytes [KiB]." ↔ entry's "at least 500 KiB".
   - RFC 6585 :132-138 §4 "too many requests in a given amount of time" + "MAY include a Retry-After header" ↔ entry's claims; :165 "Responses with the 429 status code MUST NOT be stored by a cache." ↔ entry's "MUST NOT be cached".
5. **The entry's own ≥4-word quoted span is located:** "too many requests in a given amount of time" is
   present in RFC 6585 (collapsed fold) — the flip's "the RFC sentences the prose paraphrases" exist and are
   quotable.

**Decision: agree with the reject.** Under QUALITY 2 (a claim's source is a measured anchor) and 60 (a
register row with no checkable payload is `unverifiable`, never a silent pass), an entry whose cited rows'
recorded anchors do not resolve to the cited bytes cannot be admitted as-is; the package is read-only, so
the only path is re-grounding on corrected rows — which is exactly what the flip condition prescribes.

## Flip-condition judgment (reject): actionable — a later round could act on it

The flip states: "the robots/429 claims re-cited on rows opened in-round whose located quotes are copied
from their own bytes (the RFC sentences the prose paraphrases), each with a committed receipt and a
different-seat refetch; then the entry can be re-grounded without a new claim." It names the mechanism
(new in-round rows, quotes copied from the cited bytes, committed receipts, different-seat refetch) and the
consequence (re-ground without a new claim). Executable today: the RFC bytes are stable (byte-identical
across 2026-10-25 and 2026-10-26 fetches by two seats plus mine), and quotable anchors exist for every
claim (the sentences listed in §Reject above). Minor gaps, none blocking: (a) it does not enumerate the
exact sentences — findable from the entry's own section list (§1, §2.3.1.3, §2.3.1.4, §2.4, §2.5, §4);
(b) it names no recheck cadence for the replacement rows (the old rows said 730d); (c) a re-grounding
should quote §2.4's RFC sentence including its "unless the robots.txt file is unreachable" exception rather
than repeat the entry's lossy "at most 24 hours" paraphrase.

## Observations (minor — no defect in either decision)

1. **Lesson wording nuance:** the reject reason's closing sentence, "An entry whose quotes are absent from
   its cited sources grounds nothing", reads over the entry's own quotes; the entry's single ≥4-word quoted
   span IS present in RFC 6585. What is absent is the register rows' *recorded* quotes, and the grounding
   chain runs through those rows — so the reject stands, but "its citations' recorded quotes are absent"
   would be the precise phrasing.
2. **S117 entry §6 cites S116 inline** (path + id given, e.g. "the draft's `pk` is a byte-sequence value
   (S116)") while the `source:` header names only S117. The counter's e1/q1 do not require more, the
   pointer resolves, and QUALITY 54's red case (copied header label) does not apply to a cross-reference;
   noted for the record only.
3. **Row anchor's "no version marker"** is a negative observation I did not sweep for independently; the
   positive half (`dateModified`) is verified.

## Network fetch log (read-only HTTPS GETs; `curl -q` throughout)

| url | utc | status | bytes | sha256 |
|---|---|---|---|---|
| https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T07:40:49Z | 200 | 408,912 | `ce8d04e3f546c8027a49b09f1c74e94bc224fa6f8b30f1893a2f3d817d09b5dc` (raw) / `c719ecca…54007` (normalised) |
| https://www.ietf.org/rfc/rfc9309.txt | 2026-10-26T07:40:49Z | 200 | 25,265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` |
| https://www.ietf.org/rfc/rfc6585.txt | 2026-10-26T07:40:49Z | 200 | 17,164 | `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58` |
| https://docs.discord.com/developers/topics/rate-limits (redirect probe, `-o /dev/null`) | 2026-10-26T07:44Z | 200 | 0 | `url_effective` identical, `num_redirects=0` |

Bodies and per-fetch receipts kept in this seat's output dir: `fetches/` (bodies + `receipt-*.json`);
verification scripts in `scripts/`.

## Commands run and exit codes

```
mkdir -p /fast/scratch/hyaku/tabi-r30/RevDiscernmentSpot …/w2/RevDiscernmentSpot        # OK
curl -q -sS -L --max-time 90 -o $S/discord-rate-limits.html -w … https://docs.discord.com/developers/topics/rate-limits
  → status=200 bytes=408912 ; sha256 ce8d04e3… ; exit 0
curl -q -sS -L --max-time 90 -o $S/rfc9309.txt -w … https://www.ietf.org/rfc/rfc9309.txt
  → status=200 bytes=25265 ; sha256 f633915d… ; exit 0
curl -q -sS -L --max-time 90 -o $S/rfc6585.txt -w … https://www.ietf.org/rfc/rfc6585.txt
  → status=200 bytes=17164 ; sha256 f6d55d1b… ; exit 0
cp scripts/check-frontier-admission.mjs $S/ && sha256sum …                              # cadef57e…9eca frozen match; committed S117.html b73dc7d1… receipt match ; exit 0
node verify-s117.mjs          # first attempt (module import) → exit 2 (counter CLI main fired); inlined-normalise rerun → exit 0, all checks pass
node verify-reject.mjs        # exit 0: five quotes absent (raw+collapsed), paraphrase anchors printed
node extract-discord.mjs      # exit 0: example regions, IP/hard-code/10,000 contexts
node extract-body-fields*.mjs # exit 0: body-field table rows verbatim
grep -inE "4xx|5xx|unavail|unreach|…" rfc9309.txt ; grep -n "…" rfc9309.txt rfc6585.txt  # exit 0: citation line numbers
grep -nE "qu=|pk=|…" …/frontier/bytes/S116.txt ; sha256sum …                            # exit 0: draft parameters; d6016dd0… anchor match
curl -q -sS -o /dev/null -w "effective=%{url_effective} code=%{http_code} redirects=%{num_redirects}" …  # exit 0
```

## Tooling

Installs: none (curl, node, grep, sha256sum already present; no pacman/uv/npm touched).

## Scope and residual risk

- I did not re-run the frozen counter end-to-end (`--live` or offline): C2's measurement rule binds that to
  the claim's own clean-checkout reading and other seats cover it. My checks are per-predicate analogues
  (g3/g5/g6/g7/l1/l3/q1 for S117) run with the counter's own verbatim logic against my live fetch.
- I did not verify the S116 entry beyond the two §6 sentences of the S117 entry that lean on it (parameter
  list, pk byte-sequence) — both check true against the committed draft bytes.
- I did not fetch the zh-TW/secure-tools pages to confirm where the drifted quotes came from: the package
  register itself carries those spans as S107/S111 section headings, and absence from the cited RFCs is the
  operative fact for the reject.
- The Discord page is dynamic; four independent fetches (three lane, mine) now agree on the normalised body
  (sha256 `c719ecca…54007`), so the l3 tie is reproduced, not merely claimed.
