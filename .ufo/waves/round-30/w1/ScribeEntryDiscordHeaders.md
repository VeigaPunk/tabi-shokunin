# ScribeEntryDiscordHeaders — C2 entry re-grounding (S117, Discord Rate Limits)

**Verdict.** The re-grounded entry is drafted and it admits in a scratch fixture built from the
real artifacts: with my patch (entry, S117 registry row, refetch receipt + refetch bytes) applied
to a pristine clone of `061e62024c0523d3c6c7e819506a773ff2cd7d75`, plus FetchS182's receipt/bytes
patch and a lesson carrying the receipt quote, the frozen admission counter returns
`population 1, admitted 1, failing 0, clean true` and exits 0 both offline and with `--live`
(rev `fb25510eb0cb1e410c64e1a6addd99e6af67846f`). The entry is grounded in my own fetch of the
page at 2026-10-26T06:40:32Z (HTTP 200, 408912 bytes), all 14 double-quoted spans of 4+ words plus
the 25-word receipt quote locate in three independent normalised byte sets (receipt, my refetch,
a 06:46:37Z live verify), and a negative fixture proves the lesson dependency is real: a Gate line
with only the 19-word disclosure sentence returns `admitted 0`, reason `g6-gate S117`, exit 1.
C2's wave target (population 2 / admitted 2) is not claimed here: it needs S116's entry and row
(seat `ScribeEntryRateLimitFields` / `ScribeRows`) and the L1's assembly of
`corpus/lessons/round-30.md`, which does not exist at baseline.

## Setup and provenance

```
S=/fast/scratch/hyaku/tabi-r30/ScribeEntryDiscordHeaders
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75
git -C "$S/clone" rev-parse HEAD        -> 061e62024c0523d3c6c7e819506a773ff2cd7d75
git -C "$S/clone" status --porcelain | wc -l -> 0
sha256sum scripts/check-frontier-admission.mjs
  -> cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca   (matches claims.json frozenDigests)
```
Lane tip read-only: `git rev-parse HEAD` -> `061e62024c0523d3c6c7e819506a773ff2cd7d75`.
No lane file, lane index, jj state or fleet repo was written; no commit was made outside scratch.

## Fetch (read-only GET; no credentials, cookies or API calls)

```
date -u -> 2026-10-26T06:40:32Z
curl -sS -L --max-time 90 -o fetch/discord-rate-limits.html \
  -w 'HTTP %{http_code} bytes %{size_download}\n' https://docs.discord.com/developers/topics/rate-limits
  -> HTTP 200 bytes 408912        (exit 0)
date -u -> 2026-10-26T06:40:32Z
sha256sum fetch/discord-rate-limits.html
  -> c1c2d3f9d619c9397070bb93bf8595ea51f655b687e345654f4292cfbfd4b2f3
```
Second fetch for the live column, 2026-10-26T06:46:37Z, HTTP 200, 408912 bytes, sha256
`da0720c1c2b8ed367e939fab78793e2b0a7929ec69d16fde9315799b47390ba9`.

Normalisation is `normalise()` copied verbatim from the frozen counter (script lines extracted
after `const ENTITIES =`, saved as scratch `q1-lib.mjs`); it strips `script`/`style` and tags,
decodes entities and collapses whitespace. All sets normalise to 8728 characters, sha256
`c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007`: my 06:40:32Z bytes,
FetchS182's committed receipt bytes (`b73dc7d1…`), my 06:46:37Z bytes (`da0720c1…`), and
ScribeQuoteGrounding's two fetches (`213fb2fa…`, `0d9aea2c…`). Raw bytes differ only inside
`<script>` (Cloudflare nonce/build ids), which `normalise()` removes, so `l3-live-bytes` holds.
Full record: `fetch-log.md`.

## Drafted surfaces

| path | what | status |
|---|---|---|
| `corpus/knowledge/host-published-rate-limit-headers.md` | new entry, 178 lines; header lines 1–8 in the required order (`# title`, blank, `source: S117 — <url> — §Header Format, §Exceeding A Rate Limit, §Global Rate Limit, §Invalid Request Limit aka Cloudflare bans (page H1: Rate Limits) — fetched 2026-10-26`, `verified-at:`, `recheck: 90d`, `frontier: rate-tos-signal`, `ground:`, `tier:`) | in patch |
| `corpus/SOURCES.md` line after S115 | canonical S117 row supplied by seat `ScribeRows` (verified: 13 pipe-split cells, url present in `source`, `used-by` = the new entry path); tier A scoped to "what Discord publishes about its own API's headers" (the staged row's B was scope-wide, not source-wise) | in patch |
| `corpus/evidence/round-30/frontier/refetch/S117.json` | refetch record: `seat: ScribeEntryDiscordHeaders`, `http_status: 200`, own `bytes_path`, sha256 of those bytes, the 25-word quote | in patch |
| `corpus/evidence/round-30/frontier/refetch/bytes/S117-refetch.html` | my 06:40:32Z raw bytes, sha256 `c1c2d3f9…` | in patch |
| `corpus/evidence/round-30/frontier/S117.json` + `bytes/S117.html` | receipt `fetched_by: FetchS182`, 06:40:02Z, sha256 `b73dc7d1…`, quote the 25-word span | **not mine** — FetchS182's patch |
| `corpus/lessons/round-30.md` §Gate | must carry the 19-word disclosure **and** the 25-word receipt quote | **not mine** — L1 assembly / ScribeRows `gate-block.md` |

The patch is `patch-S117.diff`, 428292 bytes, sha256
`47109be4ba55b3026c749039664101cc7438ae1cd82fbf2162e040d952b49714`, and touches exactly four paths
(`git diff --stat`): SOURCES.md (+1 row), the two refetch files, and the entry. It does not touch
the receipt, the bytes tree's `S117.html`, counters, scripts, or the lesson. Applied to a pristine
clone: `git apply --check` -> OK, `git apply` -> OK.

## Evidence — quote grounding and admission pre-checks

```
node q1.mjs out/host-published-rate-limit-headers.md out/bytes/S117-refetch.html
  -> 14 body quotes, every one OK, "MISSING 0"
node quotetable.mjs
  -> 15 rows, "bad 0" (receipt quote included as row 15)
```
`quote-table.md` lists each span, word count, page location, and presence in the receipt bytes,
refetch bytes and live-verify bytes. The receipt quote is 25 words (the counter fails only when
`n > 25`); every other entry span is 8–41 words and has no upper bound in `q1-entry-quote`.
No quoted span comes from the sibling draft or the package row — only from this page.

Admission pre-checks (scratch fixtures; these are **not** the lane measurement and the L1 must
re-run the counter at the integrated REV):

```
# pristine baseline 061e620 + my patch + FetchS182 patch + lesson line
git -C "$S/applytest" rev-parse HEAD -> fb25510eb0cb1e410c64e1a6addd99e6af67846f
node scripts/check-frontier-admission.mjs --rev HEAD --repo "$S/applytest" \
  --frontier rate-tos-signal --since 2026-10-26 --json
  -> exit 0; population 1, admitted 1, failing 0, clean true
[--live] -> exit 0; population 1, admitted 1, failing 0, clean true
```
The population is 1 because only the S117 entry exists in that fixture; the second tagged entry is
S116's, which is outside this seat. The same run on a fixture whose lesson carries only the 19-word
disclosure sentence:

```
-> exit 1; population 1, admitted 0, failing 1; reasons ["g6-gate S117"]
   (fixture rev b30d8da2d43f679c38cc678bddf83e70de39e113)
```
So `<corpus/lessons/round-30.md>` must contain the committed receipt quote verbatim; the exact line
pair is in `lesson-gate-line.md`. ScribeRows' draft `.ufo/waves/round-30/w1/ScribeRows/gate-block.md`
(read from the lane's untracked wave directory after it landed) carries the 19-word disclosure in its table and the 25-word span verbatim
as an S117 second located span, matching byte-for-byte the span checked here.

## Findings

1. **The staged package row over-generalised the per-guild caveat.** The page scopes both the
   per-guild limitation and the quota-inaccuracy admission to "Routes for controlling emojis"
   (its own heading order: the exception paragraph precedes §Header Format). `host-rate-limit-header-set-r16.md`
   quoted only the tail sentence and read it as a statement about the host's headers generally.
   The entry now records the scope and drops the generalisation.
2. **Five headers staged, seven documented.** The live page adds `X-RateLimit-Global` and
   `X-RateLimit-Scope`, both 429-only, plus the 429 body fields `message`, `retry_after`, `global`
   and optional `code`. The entry covers all seven and the three 429 example cases (user / shared /
   global).
3. **The page's per-route independence example is resource-keyed, not caller-keyed.** It says an
   endpoint with two different top-level resources may calculate limits independently; the staged
   row's "one caller and not another" was an over-reading and is not carried into the entry.
4. **Raw bytes are not byte-stable; the normalised body is.** Six independent fetches across three
   seats (two by FetchS182, two by this seat, two by ScribeQuoteGrounding) differ in raw sha
   (nonces/build ids in `<script>`) and agree exactly after `normalise()` (8728 chars,
   `c719ecca…`). Any refetch record must hash the bytes it actually commits — done here and
   required of FetchS182's receipt (`b73dc7d1…` over the committed `S117.html`).
5. **The lesson requirement is a hard dependency, not a formality.** `g6-gate` checks the receipt's
   `quote` field, so the 19-word disclosure alone fails S117 (demonstrated). The 25-word span starts
   after `specifically ` inside the per-guild sentence, so quoting the full sentence also satisfies it.
6. **Neither receipt nor receipt-bytes is in the lane tree yet.** At 061e620
   `corpus/evidence/round-30/frontier/` does not exist; FetchS182's artifacts are in its untracked
   wave directory and its patch. C2's counter at the measured REV needs that patch applied together
   with mine and the lesson assembled. `ScribeRows` independently flagged the same landing gap.
7. **Mapping non-equivalences recorded (per S116):** `X-RateLimit-Reset` is an absolute epoch and
   is not the draft's delay-seconds `t`; `X-RateLimit-Reset-After` is the closer `t` analogue;
   `X-RateLimit-Bucket` is only a partition-key analogue (`pk` is a byte-sequence value);
   `X-RateLimit-Limit` ~ policy `q`+`w`; `X-RateLimit-Remaining` ~ `r`; Global/Scope have no draft
   field. The host publishes no policy identifier header.
8. **Page metadata:** `dateModified` = `2026-02-06T17:38:32.017Z` (verified in my bytes), no
   version marker or commit; hence `recheck: 90d`.

## Limits / not claimed

- **Documented, not measured.** No Discord API request was made; the lane has no token and made no
  call. The global limit (50 requests/second) and the invalid-request cap (10,000 per 10 minutes)
  are restated from the page, not observed.
- **One host, one page.** No claim about any other host's spelling or about hosts that publish none.
- **C2 as a wave predicate is not claimed here:** population 2 / admitted 2 requires S116's entry
  and row and the assembled lesson; my half is verified only in scratch fixtures.
- The receipt quote and its bytes are FetchS182's responsibility and are not asserted as lane-landed
  in this report; their receipt JSON sha256 is `37f09c3dec768fe7bd5ff649b606baaf2d38f5cb705a8aeb66033f0cd7087b34`.
- No new gate, no counter change, no script edit, no tool install or upgrade. Tooling record: none
  installed or updated.

## Artifacts

All under `.ufo/waves/round-30/w1/ScribeEntryDiscordHeaders/`:

- `host-published-rate-limit-headers.md` (sha256 `a83b2f15…d689b82b`)
- `patch-S117.diff` (sha256 `47109be4…b49714`)
- `quote-table.md` (sha256 `5fbdc94f…754f57`)
- `fetch-log.md` (sha256 `f289284d…6918a8f`)
- `lesson-gate-line.md` (sha256 `29cbbfe9…3691020`)
- `receipts/S117.receipt.json` (FetchS182's receipt, copy; sha256 `37f09c3d…087b34`)
- `receipts/S117.refetch.json` (mine; sha256 `26c5a4c1…29f28b`)
- `bytes/S117-refetch.html` (= `fetch/raw-064032Z.html`; sha256 `c1c2d3f9…d4b2f3`)
- `fetch/live-verify.html` (sha256 `da0720c1…7390ba9`), `fetch/normalised.txt` (sha256 `c719ecca…5d54007`)
- `applytest-offline.json`, `applytest-live.json`, `negtest-g6.json`, `sha256s.txt`
