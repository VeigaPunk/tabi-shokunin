# ScribeRowsGitHubLimits — C1 row draft for S121 (GitHub REST API rate limits)

**Verdict.** I fetched https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api myself (HTTP 200, 337,116 bytes, sha256 `ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18`, UTC 2026-10-26T08:36:22Z), normalised it with the frozen counter's own `normalise()` (15,503 chars of text), and drafted **twelve** rows, `D1`–`D12`, each carrying one verbatim 8–19-word span from that text and a threshold whose number occurs inside the span. All twelve passed the frozen counter `scripts/check-decision-table.mjs` (sha256 `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`, byte-identical to `claims.json` `frozenDigests`) inside my own scratch fixture repo — offline **population 12 / admitted 12 / failing 0 / exit 0** and with `--live` **12 / 12 / 0 / exit 0** — and a deliberate mutation control (threshold `60` → `61`, quote unchanged) was refused with `n1-threshold-sourced` at exit 1, so the reading is failure-capable on this very material. Every row is labelled at its true strength: these are **one vendor's published policy for its own REST API host** (declarative "is / are allowed" statements, with the one advisory "you should not retry" branch), not RFC 2119 normative text and not a runtime observation; nothing here bounds fetching documentation pages. Nineteen items (21 sentences) were considered and refused across no-number, derived-number, trigger-value-only and scope classes; the highest-value near-miss — the `retry-after` branch — is refused because the source states no number, which also exposes a real counter limitation recorded below.

## Deliverables

| Path (lane-relative) | Content |
|---|---|
| `.ufo/waves/round-31/w1/ScribeRowsGitHubLimits/rows.md` | the 12 table-body rows (header omitted, written by the L1) + one "why the decision follows" line per row + proof summary |
| `.ufo/waves/round-31/w1/ScribeRowsGitHubLimits/rejected.md` | 19 refused items (21 sentences) with reasons (verbatim, all confirmed substrings of the normalised text) |
| `.ufo/waves/round-31/w1/ScribeRowsGitHubLimits/receipts/` | `s121.html` (fetch bytes), `fetch-provenance.txt`, `rows.json`, `row-proof.txt`, `offline-final.json`, `live-final.json`, `neg-control.json`, `rejected-proof.txt`, `fixture-entry.md`, `S121.receipt.json` |
| `.ufo/waves/round-31/w1/ScribeRowsGitHubLimits.md` | this report |

## The rows (table body only)

```
| D1 | secondary-limit `403` or `429` with no `retry-after` and `x-ratelimit-remaining` not `0` | wait at least one minute before retrying (vendor policy: GitHub REST API, last-resort branch of the secondary-limit remedy) | at least 1 minute | S121 | "Otherwise, wait for at least one minute before retrying." |
| D2 | `x-ratelimit-limit` reads 60 on an unauthenticated request | cap pacing at 60 requests per hour (vendor policy: GitHub REST API, unauthenticated) | 60 requests | S121 | "The primary rate limit for unauthenticated requests is 60 requests per hour." |
| D3 | `x-ratelimit-limit` reads 5000 with a personal access token | cap pacing at 5,000 requests per hour (vendor policy: GitHub REST API, personal token) | 5,000 requests | S121 | "All of these requests count towards your personal rate limit of 5,000 requests per hour." |
| D4 | `x-ratelimit-limit` with an installation access token | cap assumptions at the installation minimum of 5,000 requests per hour (vendor policy: GitHub App installations) | 5,000 requests | S121 | "GitHub Apps authenticating with an installation access token use the installation's minimum rate limit of 5,000 requests per hour." |
| D5 | `x-ratelimit-limit` reads 1000 under `GITHUB_TOKEN` | cap pacing at 1,000 requests per hour per repository (vendor policy: GitHub Actions `GITHUB_TOKEN`) | 1,000 requests | S121 | "The rate limit for GITHUB_TOKEN is 1,000 requests per hour per repository." |
| D6 | `x-ratelimit-limit` above 12500 on a non-Enterprise installation | cap the scaled installation budget at 12,500 requests per hour (vendor policy: GitHub REST API, non-Enterprise Cloud installations) | at most 12,500 requests | S121 | "The rate limit cannot increase beyond 12,500 requests per hour." |
| D7 | parallel fan-out to one host (`concurrent requests`) | cap concurrent requests at 100 (vendor policy: GitHub secondary limit, shared across REST and GraphQL) | no more than 100 concurrent | S121 | "No more than 100 concurrent requests are allowed." |
| D8 | weighted `points` burst on one REST endpoint | cap weighted points at 900 per minute (vendor policy: GitHub secondary point limit, REST endpoints) | no more than 900 points | S121 | "No more than 900 points per minute are allowed for REST API endpoints" |
| D9 | summed `CPU time` proxy (total response time) over 60 s of wall clock | cap estimated CPU time at 90 seconds per 60 seconds (vendor policy: GitHub secondary compute limit) | no more than 90 seconds | S121 | "No more than 90 seconds of CPU time per 60 seconds of real time is allowed." |
| D10 | content-creating `POST` `PATCH` `DELETE` calls | cap content-generating requests at 80 per minute (vendor policy, general case: some endpoints have lower limits) | no more than 80 requests | S121 | "In general, no more than 80 content-generating requests per minute" |
| D11 | `OAuth access token` request burst | cap OAuth access token requests at 2,000 per hour (vendor policy: GitHub Apps and OAuth apps) | no more than 2,000 requests | S121 | "No more than 2,000 OAuth access token requests per hour are allowed for GitHub Apps and OAuth apps." |
| D12 | Git LFS batch request `429` | cap the LFS bucket at 300 requests per minute unauthenticated (vendor policy: separate LFS bucket) | 300 requests | S121 | "a limit of 300 requests per minute for unauthenticated requests and 3,000 requests per minute for authenticated requests" |
```

Per-row mechanical proof (`receipts/row-proof.txt`, produced by importing `normalise`/`words`/`UNIT_RE`/`numbersIn` semantics and running them on the fetch bytes; `substring` = the span occurs in `normalise(bytes)`, `numbers_in_quote` = the parsed threshold number is present as digits or number word):

```
D1 substring=true words=9 threshold="at least 1 minute" parsed=1 numbers_in_quote=[1] PASS=true
D2 substring=true words=12 threshold="60 requests" parsed=60 numbers_in_quote=[60] PASS=true
D3 substring=true words=15 threshold="5,000 requests" parsed=5000 numbers_in_quote=[5000] PASS=true
D4 substring=true words=19 threshold="5,000 requests" parsed=5000 numbers_in_quote=[5000] PASS=true
D5 substring=true words=12 threshold="1,000 requests" parsed=1000 numbers_in_quote=[1000] PASS=true
D6 substring=true words=10 threshold="at most 12,500 requests" parsed=12500 numbers_in_quote=[12500] PASS=true
D7 substring=true words=8 threshold="no more than 100 concurrent" parsed=100 numbers_in_quote=[100] PASS=true
D8 substring=true words=13 threshold="no more than 900 points" parsed=900 numbers_in_quote=[900] PASS=true
D9 substring=true words=16 threshold="no more than 90 seconds" parsed=90 numbers_in_quote=[60,90] PASS=true
D10 substring=true words=10 threshold="no more than 80 requests" parsed=80 numbers_in_quote=[80] PASS=true
D11 substring=true words=18 threshold="no more than 2,000 requests" parsed=2000 numbers_in_quote=[2000] PASS=true
D12 substring=true words=18 threshold="300 requests" parsed=300 numbers_in_quote=[300,3000] PASS=true
rows=12 failing=0
```

## Evidence — commands and exit codes

All lane scripts ran only inside my scratch clone (`$S/clone`, checked out at the freeze commit) and my own fixture repo (`$S/fx`); lane root read-only.

1. Clone + freeze identity — exit 0
   ```
   git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
   git -C "$S/clone" checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d   # -> HEAD 9505a10
   sha256sum "$S/clone/scripts/check-decision-table.mjs"
   -> d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832   (== claims.json frozenDigests)
   ```
2. Fetch — exit 0
   ```
   curl -q -sS --proto =https -o s121.html \
     -w '%{http_code} %{size_download}\n' \
     https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
   -> 200 337116 ; UTC 2026-10-26T08:36:22Z
   sha256sum s121.html -> ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18
   ```
3. Normalise with the counter's own function — exit 0. `extract.mjs` lifts `ENTITIES` + `normalise` verbatim from the frozen script lines 132–146 (`extractedLines {entIdx:132,start:134,end:146}`) and evaluates only those; `node norm.mjs fetch/s121.html` → `{"raw_bytes":337116,"norm_chars":15503}`.
4. Fixture repo (`git -C "$S/fx" rev-parse --show-toplevel` == `$S/fx`, commits with `-c user.name=scribe -c user.email=scribe@scratch.local`): baseline `6a09526` (no S121 row), measured `05a09b9` (S121 registry row + entry + receipt `corpus/evidence/round-31/decision-table/S121.json` + `bytes/S121.html`).
5. Frozen counter, offline — **exit 0**, `{"population":12,"admitted":12,"failing":0,"clean":true}` (`receipts/offline-final.json`).
   ```
   TMPDIR=$S/tmp node $S/clone/scripts/check-decision-table.mjs --repo "$S/fx" --rev HEAD \
     --baseline 6a09526 --entry corpus/knowledge/rate-signal-decision-table.md --json
   ```
6. Frozen counter, `--live` (12 fresh HTTPS GETs of the same page by the counter's own `curlFetch`) — **exit 0**, `{"live":true,"population":12,"admitted":12,"failing":0,"clean":true}` (`receipts/live-final.json`, written 2026-10-26 08:39 UTC).
7. Mutation control on my own material — branch `neg-control`, `D2` threshold `60 requests` → `61 requests` with the quote untouched — **exit 1**, `admitted 11, failing 1`, `D2 n1-threshold-sourced` (`receipts/neg-control.json`). The gate is able to fail on these rows; passing is not vacuous.
8. Refused-quote proof — every sentence quoted in `rejected.md` is a substring of `normalise(bytes)`: `quotes=23 missing=0` (`receipts/rejected-proof.txt`).

No tool was installed or upgraded (nothing was needed). No pacman/uv/npx call was made.

## Fetch provenance (every network access this seat made)

| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` | 2026-10-26T08:36:22Z | 200 | 337,116 | `ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18` |
| same URL, counter `--live` pass (12 GETs, one per distinct quote, via `curl -q -sS --proto =https --proto-redir =https -L`) | 2026-10-26T08:39Z (final run; an earlier live run at 08:37Z used pre-patch wording) | 200 (asserted by `liveOk`: any non-200 fails `l1-live`; 12/12 admitted both times) | not separately recorded by the counter | not separately recorded by the counter |

## What the L1 needs for the registry row S121

The counter's `g2-url` check is `rows.get(id).source.includes(receipt.url)`, so the S121 **source cell must contain the URL string exactly**. The fixture that passed used:

```
| S121 | GitHub Docs — Rate limits for the REST API — https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | doc | A | GitHub REST API policy | §Exceeding the rate limit | rate thresholds | mined | 2026-10-26 | 180d | corpus/knowledge/rate-signal-decision-table.md |
```

`r2-status` requires `status = mined`; `r3-used-by` requires the used-by cell to name `corpus/knowledge/rate-signal-decision-table.md`; `r4-new-row` requires the id to be absent at baseline `96a2d1a3` (it is). The receipt shape that passed is `receipts/S121.receipt.json` (`id`, `url`, `fetched_at`, `http_status: 200`, `bytes_path`, `sha256`); the bytes file is `receipts/s121.html`, which the L1 should land as `corpus/evidence/round-31/decision-table/bytes/S121.html`.

## Scope, strength and limits (read before admitting)

- **Scope.** Every row is the vendor's policy for `api.github.com` as documented on `docs.github.com`. None of it limits fetching documentation HTML; a journey driver that only reads pages is not bounded by these rows. This is stated in each Decision cell ("vendor policy: GitHub REST API …") and in `rows.md`'s header note.
- **Strength.** The page writes limits declaratively ("No more than 100 concurrent requests are allowed"), not in RFC 2119 keywords, so rows say "vendor policy" rather than MUST/SHOULD. `D1` is the one advisory strength ("you should **not** retry"), which is why its Decision reads "vendor policy … last-resort branch" rather than a SHOULD.
- **D4/D6 nuance.** `D4`'s 5,000 is explicitly the *minimum* an installation token carries and `D6`'s 12,500 is the ceiling for installations *outside* Enterprise Cloud; both decisions are worded to that nuance (a GHEC installation gets 15,000, which this draft does not turn into a row).
- **D9 depends on the page's own proxy sentence** ("You can roughly estimate the CPU time by measuring the total response time"); the Signal cell says "summed `CPU time` proxy (total response time)" so the row does not claim the driver measures CPU directly.
- **Counter limitation found (not repaired — attack/report only, and this seat drafts rows).** A row whose threshold is supplied per response by a header (the `retry-after` branch: "you should not retry your request until after that many seconds has elapsed") cannot be admitted, because `n1-threshold-sourced` demands the number appear in the quote. The highest-value remedy the page states is therefore unrepresentable without an author-invented number. Recorded in `rejected.md` §Note; for the L1 to route or accept as a known limit.
- **No runtime claim.** Nothing was executed against `api.github.com`; no API call, login, cookie or credential was used. The only network traffic was read-only HTTPS GETs of the public documentation page (1 direct fetch plus two counter live passes of 12 GETs each).
- **No sibling or lane writes.** I wrote only `.ufo/waves/round-31/w1/ScribeRowsGitHubLimits.md`, `.ufo/waves/round-31/w1/ScribeRowsGitHubLimits/**`, and scratch under `$HYAKU_SCRATCH/tabi-r31/ScribeRowsGitHubLimits`. The lane checkout's `git status --porcelain` shows 6 entries that are **not mine** (other seats/L1); I did not read or modify them. Scratch was removed after the receipts were copied here.
