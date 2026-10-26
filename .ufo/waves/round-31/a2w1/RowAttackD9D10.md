# RowAttackD9D10 — C1 rows D9–D10 (GitHub 100 concurrent / 900 points per minute, derived) — round 31 a2w1

**Verdict: both rows hold on all seven letters (a)–(g); no defect found.** Three observations, none rising to a defect: (1) D10's Signal gloss "weighted" is the lane's word, not the page's — "weighted" occurs 0 times in the normalised S121 page, whose own vocabulary is "point values of requests" with a per-request-type table on the same page; (2) the page's bullet intro for the 900-points limit reads "Make too many requests to a single endpoint per minute." while the quoted numeric sentence is general ("for REST API endpoints") — the row follows the numeric sentence, which is the binding statement, and the framing adds no exception; (3) the page-wide caveat "These secondary rate limits are subject to change without notice. You may also encounter a secondary rate limit for undisclosed reasons." applies to both rows and is not carried — a stability caveat that does not alter the declared ceilings. Counter cross-check at REV with `--live`: exit 0, population 13, admitted 13, failing 0; D9 admitted (threshold 100), D10 admitted (threshold 900). No repair performed (attack seat).

## Method

- Scratch clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120` → rev `486048356f0712e4396588c9dab58cd419243120`, `git status --porcelain` empty (0 lines). All lane scripts ran only there.
- `normalise()` replication: the counter self-executes on import (`--rev` required, exit 2), so I extracted the exact byte span `const ENTITIES … end of normalise` from the pinned `scripts/check-decision-table.mjs` (sha256 `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`, matching claims.json frozenDigests) into a scratch script and eval'd it — the normalisation applied to fetched bytes is the counter's own function, not a reimplementation. Scripts: `ctx.mjs`, `pts.mjs`, `pts2.mjs`, `raw.mjs` (copied to the output dir).
- Live fetch (read-only HTTPS GET of a public docs page, no API call):
  - Command: `curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60 -o s121-live.html -w "..." https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api`
  - UTC 2026-10-26T12:28:05Z, HTTP 200, effective URL unchanged (same host), 337116 bytes, sha256 `47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9`.
  - Committed receipt `corpus/evidence/round-31/decision-table/S121.json`: fetched_at 2026-10-26T08:36:16Z, HTTP 200, sha256 `3a33f87b965a4af17078523dad091e35c41c69d7c9e6941140f91f4feefef755`; `sha256sum` of committed `bytes/S121.html` matches it exactly. Live byte count is identical (337116); the whole-file hash differs only in dynamic page chrome (script/nonce), and both quotes sit verbatim in the normalised text of both fetches.
- No tools installed or upgraded (node 24.21.0, curl, git preexisting); pacman untouched.

## Row D9 (entry line 57) — per-letter verdicts

Row: Signal "parallel fan-out to the host (`concurrent requests`)" | Decision "cap — keep in-flight requests at or below the ceiling (GitHub secondary limit, shared across REST and GraphQL) (derived)" | Threshold "no more than 100 concurrent" | Source S121 | Quote "No more than 100 concurrent requests are allowed."

| Letter | Verdict | Evidence |
|---|---|---|
| (a) quote verbatim + located | **holds** | Located by the counter's own `normalise()` in committed `bytes/S121.html` (normalised) and in the live fetch (normalised). 8 words (q1 window 6..25 ✓). Live context: "…<em>Make too many concurrent requests.</em> No more than 100 concurrent requests are allowed. This limit is shared across the REST API and GraphQL API.</li>" |
| (b) number is the bounded quantity | **holds** | The 100 bounds concurrent requests — "No more than 100 concurrent requests are allowed." Not a status code, section, document number, year or pronoun. The page's only two "concurrent" occurrences are both this bullet. |
| (c) unit + bound word | **holds** | Bound "no more than" = quote's "No more than"; unit "concurrent" = quote's "concurrent requests" (the noun "requests" is carried by the Signal cell; the counter's UNIT_RE accepts "concurrent" as a unit token). |
| (d) Decision verb + force | **holds** | "cap" + `(derived)`: the quote is a declarative limit ("are allowed") — no RFC 2119 keyword in capitals, no directive to the caller — exactly the case the entry's preamble reserves the `(derived)` marker for. The Decision's parenthetical "shared across REST and GraphQL" is supported by the next sentence in the same `<li>`: "This limit is shared across the REST API and GraphQL API." |
| (e) Signal observable at that point | **holds** | In-flight request count is the driver's own state — observable without any extra instrument. |
| (f) scope stated | **holds** | "(GitHub secondary limit, shared across REST and GraphQL)" names the vendor and the limit class; registry S121 scope cell adds "documentation only, not a measured response and no API calls"; access date lives in the registry row (fetched 2026-10-26T08:36:16Z). |
| (g) distinct from every other row | **holds** | No other row states a concurrency ceiling: D7/D8 are primary hourly caps (60 / 5,000 per hour), D10 points per minute, D11 CPU time, D13 one-second mutative pacing. |

Context omissions: none meaning-changing. The bullet intro ("Make too many concurrent requests.") is the trigger framing the Signal mirrors; the page-wide "subject to change without notice" caveat (see observation 3) does not alter the declared ceiling.

## Row D10 (entry line 58) — per-letter verdicts

Row: Signal "weighted `points` per minute on REST endpoints" | Decision "cap — keep weighted points per minute at or below the ceiling (GitHub secondary limit; GraphQL has its own) (derived)" | Threshold "no more than 900 points" | Source S121 | Quote "No more than 900 points per minute are allowed for REST API endpoints"

| Letter | Verdict | Evidence |
|---|---|---|
| (a) quote verbatim + located | **holds** | Located by the counter's own `normalise()` in committed and live normalised text. 13 words ✓. The quote ends without a period because the live sentence continues ", and no more than 2,000 points per minute are allowed for the GraphQL API endpoint." — verbatim substring, no splicing. |
| (b) number is the bounded quantity | **holds** | The 900 bounds points per minute for REST API endpoints — the quote's own quantity. Not a status code/section/year/pronoun. |
| (c) unit + bound word | **holds** (note) | Bound "no more than" = quote's "No more than"; unit "points" = quote's "points". Note: the per-minute rate dimension sits in the Signal cell ("weighted `points` per minute on REST endpoints"), not in the Threshold cell ("no more than 900 points"); the row as a whole states the quantity the quote bounds, so this is a note, not a defect. |
| (d) Decision verb + force | **holds** | "cap" + `(derived)`: declarative limit ("are allowed"), no directive — right force per the entry's preamble. "GraphQL has its own" is supported by the sentence continuation immediately after the quote: "…and no more than 2,000 points per minute are allowed for the GraphQL API endpoint." |
| (e) Signal observable at that point | **holds** (observation 1) | Computable from S121 itself: the same page carries the section "Calculating points for the secondary rate limit" (h3 `id="calculating-points-for-the-secondary-rate-limit"`, same-document anchor) with the point table — "Most REST API GET, HEAD, and OPTIONS requests 1 / Most REST API POST, PATCH, PUT, or DELETE requests 5 / GraphQL requests without mutations 1 / with mutations 5" — plus the driver's own request log. Observation: the word "weighted" occurs 0 times in the normalised page; the page's vocabulary is "point values of requests" (per-request-type costs). The gloss is accurate to that system and the Threshold/quote are unaffected — no defect. The same section discloses "Some REST API endpoints have a different point cost that is not shared publicly," so the computed figure is an estimate for those endpoints; the row does not claim exactness. |
| (f) scope stated | **holds** | "(GitHub secondary limit; GraphQL has its own)" names the vendor, the limit class, and distinguishes the sibling API's separate ceiling (2,000 points per minute, per the continuation). |
| (g) distinct from every other row | **holds** | Distinct from D9 (concurrency), D11 (CPU time per 60 s), D7/D8 (primary hourly caps), and from the content-generating limits (80/min, 500/hour — on the page but not rowed). |

Context omissions: observation 2 — the bullet intro is "Make too many requests to a single endpoint per minute." (the page's trigger framing), while the quoted numeric sentence is general ("for REST API endpoints"). The row follows the numeric sentence, which is the binding statement; the framing adds no exception or qualifier to it, so the omission does not change the row's meaning. The "In general, no more than 80 content-generating requests per minute…" sentence belongs to the separate content bullet, not to D10's.

## Counter cross-check (frozen bytes, at REV, in my clone)

Command: `node clone/scripts/check-decision-table.mjs --rev 486048356f0712e4396588c9dab58cd419243120 --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc --entry corpus/knowledge/rate-signal-decision-table.md --live --json > c1.json` → **exit 0**; `{population:13, admitted:13, failing:0}`; rows: `{"row":"D9","line":57,"source":"S121","admitted":true,"reason":null,"threshold":100}`, `{"row":"D10","line":58,"source":"S121","admitted":true,"reason":null,"threshold":900}`. Counter script sha256 at REV = `d15f3bd7…f6832` (matches claims.json frozenDigests). JSON written to a file, not piped (per the round NOTE). Output: `c1.json` in the output dir.

## Commands and exit codes (all exit 0 unless stated)

1. `git clone --shared … && git -C "$S/clone" checkout -q 4860483…` → rev confirmed, porcelain 0.
2. `curl -q -sS --proto =https … -o s121-live.html -w …` → `http=200 url=https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api bytes=337116`; `date -u` → 2026-10-26T12:28:05Z; `sha256sum` → `47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9`.
3. `node ctx.mjs` → D9 quote in committed: true, in live: true; D10 quote in committed: true, in live: true (with ±600-char context printed).
4. `sha256sum clone/corpus/evidence/round-31/decision-table/bytes/S121.html` → `3a33f87b965a4af17078523dad091e35c41c69d7c9e6941140f91f4feefef755` (matches receipt); counter run → exit=0, population 13, admitted 13, failing 0.
5. `node pts.mjs` / `node pts2.mjs` → points section text, `weighted` occurrences: 0, `concurrent` occurrences: 2, subject-to-change caveat present: true, quote word counts 8 / 13.

## Receipts (output dir `.ufo/waves/round-31/a2w1/RowAttackD9D10/`)

- `s121-live.html` — 337116 B, sha256 `47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9`, fetched 2026-10-26T12:28:05Z.
- `c1.json` — counter output (sha256 `5362031818b23cc242918534df837b12cb581fc838d316583d751a18430a3e40`).
- `fetch-log.txt`, `ctx.mjs`, `raw.mjs`, `pts.mjs`, `pts2.mjs` — fetch record and analysis scripts (sha256s: `f5e9f0cd…`, `9b573af6…`, `687d68b2…`, `1d484ad8…`, and pts2.mjs as copied).

## Residual risk

- The live check rests on one fetch of S121 at 12:28:05Z; the page is byte-count-identical to the 08:36:16Z receipt and both quotes are verbatim in both normalised texts, so drift risk for these two rows is nil today. The page itself warns the secondary limits "are subject to change without notice" — the rows' ceilings are dated to the access date via the registry row, which is the stated scope.
- D10's "weighted" gloss and the "single endpoint" bullet framing are recorded as observations; if a later round rows the content-generating or OAuth limits from the same bullet list, the "In general" qualifier on the 80/min figure must be carried (it is not rowed today).
