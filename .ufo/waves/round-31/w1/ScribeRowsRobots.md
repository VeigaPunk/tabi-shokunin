# Round 31 w1 — C1 build: decision-table rows from RFC 9309 (S119)

**Verdict.** Six rows drafted from S119 (`https://www.rfc-editor.org/rfc/rfc9309.txt`), and all six
are admitted by the frozen counter, offline **and** with `--live`, in a fixture repository built in
my own scratch: `population 6 / admitted 6 / failing 0`, exit 0 both times, against a byte-identical
copy of `scripts/check-decision-table.mjs` (sha256 = the claims.json `frozenDigests` value
`d15f3bd7…f6832`). The six rows cover all five requested topics: the redirect bound appears twice
(SHOULD follow, then MUST fetch/parse/apply once reached), the `>5` fallback (MAY drop the file), the
"reasonably long period" example (30 days, labelled an RFC example), the cache lifetime (24 hours,
with the source's own "unless unreachable" exception kept), and the parsing-size floor (at least
500 KiB). The RFC cannot yield C1's `>= 10` on its own: it states exactly these six threshold-bearing
driver decisions, and its two status-code ranges (`400-499`, `500-599`) cannot be a threshold in the
frozen grammar, so the remaining four admitted rows must come from S120–S122. **The C1 predicate at
REV is not verified by this work** — the lane has no entry and no S119 registry row yet; L1 integrates,
then runs the counting command in the lane clone. No lane tracked file, lane index, or `scripts/`
byte was touched (read-only `git status --porcelain`: 0 tracked changes, 0 under `scripts/`).

## Axes (godspeed)

- **Admission** — rows that the frozen counter admits without weakening a quote (6/6).
- **Fidelity** — decisions and normative strength (MUST/SHOULD/MAY/example) exactly as the source
  writes them; vendor/example labelling preserved (D4).
- **Yield** — every threshold-bearing driver decision this one document honestly supports; none
  forced, none padded.
- **Handoff cost** — rows pasted verbatim, receipt draft + bytes ready, rejections documented so L1
  does not re-mine the same text.

Moves kept: six rows, each improving admission/fidelity/yield without harming handoff cost. Moves
refused: rows 7–15 in `rejected.md` (no number, no driver action, unit-less status ranges,
out-of-province, silence).

## Evidence

Scratch: `$HYAKU_SCRATCH/tabi-r31/ScribeRowsRobots` = `/fast/scratch/hyaku/tabi-r31/ScribeRowsRobots`
(created; `TMPDIR` set to it on every node/curl run). Nothing was written to the lane except this
report and my output directory.

### 1. Fetches (read-only HTTPS GET, public docs only)

| # | UTC | URL | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| 1 | 2026-10-26T08:36:24Z | `https://www.rfc-editor.org/rfc/rfc9309.txt` | 200 | 25265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` |
| 2 | 2026-10-26T08:37:58Z | `https://www.rfc-editor.org/rfc/rfc9309.txt` | 200 | 25265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` (identical bytes) |

```
$ date -u +%Y-%m-%dT%H:%M:%SZ; curl -q -sS --proto =https -o rfc9309.txt \
    -w 'http=%{http_code} effective=%{url_effective} bytes=%{size_download}\n' \
    https://www.rfc-editor.org/rfc/rfc9309.txt
2026-10-26T08:36:24Z
http=200 effective=https://www.rfc-editor.org/rfc/rfc9309.txt bytes=25265
curl_exit=0
$ sha256sum rfc9309.txt
f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207  rfc9309.txt
```
The second run (receipt refresh) printed `http=200 … bytes=25265`, `curl_exit=0`, same sha256.
No redirect was followed (`url_effective` equals the requested URL). No cookies, credentials or API
endpoints were used; `www.rfc-editor.org` text only.

The counter's own `--live` mode performs one GET per distinct (URL, quote) pair — my live run made
6 GETs of this same URL. I did not capture per-GET byte counts for those six; what is provable from
`l1-live` admitting every row is that each returned HTTP 200 over https on the same host with a
normalised body containing its quote. Stated as a limitation rather than upgraded to a receipt.

### 2. Counter copy is the frozen counter

```
$ sha256sum counter.mjs        # byte-identical copy of scripts/check-decision-table.mjs
d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832  counter.mjs
$ sha256sum /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-decision-table.mjs
d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832  …/check-decision-table.mjs
```
(= `claims.json` `frozenDigests["scripts/check-decision-table.mjs"]`.)

### 3. Counter self-test (copy functions)

```
$ TMPDIR="$S" node counter.mjs --selftest | tail -1
DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34
exit=0
```

### 4. Rows admitted against a fixture lane-shaped repo (scratch, own git identity)

Fixture: `$S/fx`, `git rev-parse --show-toplevel` = `$S/fx` (verified before any commit), commits made
with `-c user.name=ScribeRowsRobots -c user.email=ScribeRowsRobots@scratch.local`. Baseline commit
`6a7d2eca…` holds a registry with no S119; the measured commit `7b6a825f…` adds the S119 row
(`source` cell contains the URL, `status` mined, `used-by` = the entry path), the entry with the six
rows below, and the receipt + raw bytes under `corpus/evidence/round-31/decision-table/`.

```
$ node counter.mjs --repo $S/fx --rev 7b6a825f… --baseline 6a7d2eca… \
    --entry corpus/knowledge/rate-signal-decision-table.md --json            # offline
exit 0
population 6, admitted 6, failing 0, clean true
D1..D6 admitted=true reason=null

$ … same with --live --json
exit 0
{"population":6,"admitted":6,"failing":0,"clean":true,"live":true}
```
Raw output kept: `counter-offline.json`, `counter-live.json` in my output dir.

### 5. Quote location and threshold provenance (counter's own functions)

`proof.mjs` imports `normalise()` from `norm.mjs` (the frozen counter text with only its trailing
`main();` call removed, so the module can be imported) and re-instantiates the counter's own
`NUMBER_WORDS` + `numbersIn()` extracted verbatim from `counter.mjs` by brace matching.

```
$ TMPDIR="$S" node proof.mjs
normalised bytes: 20886 chars, source sha256 f633915daa…fb207
D1 words=20 substring=true quote_numbers=[5] threshold=5 number_in_quote=true
D2 words=21 substring=true quote_numbers=[5] threshold=5 number_in_quote=true
D3 words=17 substring=true quote_numbers=[5] threshold=5 number_in_quote=true
D4 words=20 substring=true quote_numbers=[30] threshold=30 number_in_quote=true
D5 words=18 substring=true quote_numbers=[24] threshold=24 number_in_quote=true
D6 words=10 substring=true quote_numbers=[500] threshold=500 number_in_quote=true
PROOF verdict=ok
exit=0
```
`html_branch=false` for this file (checked: `/<!doctype html|<html[\s>]/i` does not match), so
`normalise()` here is whitespace collapse only; the RFC's hard line wraps are what the quotes had to
span.

### 6. Lane untouched (read-only)

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain
?? .ufo/waves/round-31/w1-dispatch.json
?? .ufo/waves/round-31/w1-spec.json
?? .ufo/waves/round-31/w1-validate.stderr
?? .ufo/waves/round-31/w1.ready
?? .ufo/waves/round-31/w1/
$ git status --porcelain -- scripts/ | wc -l
0
$ git rev-parse HEAD
9505a10eb80b2a0b273ebaba3f7f872ad302192d
```

## Deliverables (my output dir)

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/ScribeRowsRobots/`

- `rows.md` — the six rows (no header row) + one line per row on why the decision follows from its
  quote and at what normative strength.
- `rejected.md` — 15 refused candidates with raw-text line numbers and the reason (no number / no
  driver verb / unit-less status range / metadata / out-of-province per PROVINCE.md / silence).
- `S119.receipt-draft.json` — receipt draft for L1 to place at
  `corpus/evidence/round-31/decision-table/S119.json` (id, url, fetched_at, http_status 200,
  bytes_path, sha256).
- `bytes/S119.txt` — the fetched bytes (25265 B, sha256 `f633915d…fb207`) for
  `corpus/evidence/round-31/decision-table/bytes/S119.txt`.
- `counter.mjs`, `norm.mjs`, `proof.mjs`, `counter-offline.json`, `counter-live.json`, `rfc9309.txt`.

## Rows (as delivered in `rows.md`)

| Row | Signal | Decision | Threshold | Strength |
|---|---|---|---|---|
| D1 | `robots.txt` answered `301`/`302` | follow, across authorities | at least 5 redirects | SHOULD |
| D2 | reached inside the redirect bound | follow: fetch, parse, apply in initial authority | at least 5 redirects | MUST |
| D3 | redirect chain longer than the bound | stop following, MAY assume unavailable | more than 5 redirects | MAY |
| D4 | unreachable (`500`-`599`) for a long period | allow: MAY assume unavailable after the example | 30 days | MAY + RFC example value |
| D5 | cached `robots.txt` copy | refetch | 24 hours | SHOULD NOT (with "unless unreachable") |
| D6 | body larger than the parser reads | limit (floor on the parsing limit) | at least 500 KiB | MUST |

## Gates

| Gate | Command | Reading |
|---|---|---|
| frozen counter bytes | `sha256sum counter.mjs` | `d15f3bd7…f6832` = claims.json frozenDigests |
| counter sound | `node counter.mjs --selftest` | 34/34, exit 0 |
| row grammar (offline) | counter, fixture rev, `--json` | exit 0, 6/6 admitted |
| row grammar (live) | counter, fixture rev, `--live --json` | exit 0, 6/6 admitted |
| quote located | `node proof.mjs` | 6/6 substring=true, words 10–21 |
| number sourced | `node proof.mjs` | 6/6 number_in_quote=true |
| fetch receipt | `curl … -w`, `sha256sum` | 200, 25265 B, `f633915d…fb207` ×2 |
| lane untouched | `git status --porcelain` | 0 tracked changes, 0 under `scripts/`, HEAD 9505a10e |

## Findings

1. **Yield ceiling of S119 = 6 rows.** The document's only threshold-bearing driver decisions are the
   five-redirect bound (twice, at two strengths), the `>5` fallback, the 30-day undefined example,
   the 24-hour cache rule and the 500-KiB parsing floor. Every other numeric line is a status-code
   range, ABNF cardinality, figure caption, cross-reference or RFC metadata.
2. **The frozen grammar cannot encode a status-code range as a threshold.** `UNIT_RE` accepts only
   time/count/size units; `"400-499 range"` has no unit, and writing a unit would fabricate meaning.
   So the "unavailable" (`400-499` → MAY access any resource) decision cannot become a row, and
   `500-599` appears only as D4's signal vocabulary while D4's number comes from the 30-day example.
   This is the honest reason the requested topic list yields 6 rather than 7–8.
3. **`--live` cost is per (URL, quote), not per URL.** Six rows citing one page = six GETs. Any
   seat adding rows to S119 should budget for that.
4. **Quotes must be pasted from collapsed text, and may begin mid-sentence.** D2's span starts at
   "If a" and stops at "followed" (21 words) because the 25-word cap would otherwise cut the
   normative clause; the scope phrase it leaves behind is named in `rows.md`.
5. **C1's `>= 10` needs the other three rows' documents.** My six + four from S120–S122. [INFERENCE,
   not verified — I did not open S120] RFC 6585 defines 429/`Retry-After` but is not known to state a
   numeric wait, so L1 should check the budget: if S120 yields 0–1 rows, S121/S122 must carry 3–4
   (they are the number-rich pages: per-hour request ceilings and a stated minimum wait). Plan the
   row count per source before integrating.

## Out of scope / not claimed

- **C1 at REV is unverified.** No entry, no S119 registry row, no committed receipt exist in the lane;
  the counter run above is against my scratch fixture. L1 must run the counting command in the lane
  clone after integration.
- S120, S121, S122 were not opened by me (other seats own them); no row in this deliverable cites them.
- No live page beyond the RFC text; no `api.github.com`; no runtime claim — nothing here was run
  against a real host.
- Not judged: whether the six rows are admitted *in the lane registry* (tier/anchor/teaches cells of
  the S119 row are L1's to write; my fixture used a minimal row that satisfies r1/r2/r3).
- No counter change, no gate change, no lesson text written (L1 writes `corpus/lessons/round-31.md`).

## For the round-31 lesson (drafts, L1-owned)

`## Gate` candidates — the seven rows of the Gates table above, verbatim command lines included.

`## Mistakes` candidates:

- M-a **Unit-set blindness.** Reading the row grammar as "number + unit" only after drafting made me
  try to encode `500-599` as a threshold; the counter's `UNIT_RE` cannot express a status range, so
  the row would have needed an invented unit. Check the unit vocabulary before choosing which
  sentences to mine.
- M-b **Live cost model.** `--live` dedupes on (URL, quote), not URL; six rows on one page means six
  read-only GETs. Do not assume one fetch per source.
- M-c **Quote spans across hard wraps.** Pasting a quote from the rendered page rather than the
  normalised collapsed text breaks `q2-quote-located`; the RFC's line breaks are inside most
  sentences.
- M-d **Fixture ≠ lane.** A green counter run against a scratch fixture proves row grammar and quote
  provenance only; the REV predicate needs the registry row, the entry and the committed receipt.
