# CritC1Counter — C1 first falsifier (round 31, wave w1)

Seat: critic. Target: frozen counter `scripts/check-decision-table.mjs` (sha256 `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`, identical at the freeze commit and at every fixture revision). Method: one scratch clone of the lane at `9505a10eb80b2a0b273ebaba3f7f872ad302192d`, four scratch commits adding a `corpus/SOURCES.md` append (S119–S122, `mined`, `used-by` the entry), fixture entries and live-fetched receipts; `scripts/` never touched (`git diff 9505a10e..HEAD -- scripts/` empty; per-REV blob digest re-computed from git objects). No lane file was edited.

## Verdict

The counter is reproducible and honest about the five frozen controls (I re-ran the do-nothing control: population 0, admitted 0, exit 1; selftest 34/34, exit 0), but it is **porous on admission**: `n1-threshold-sourced` (line 286) compares only the *numeric token* of the Threshold cell against the numbers anywhere in the quote, so the threshold's **unit** and **bound word** are entirely the author's, and any number that happens to sit in the quote — a status code, an RFC/document number, a table-of-contents section number, the pronoun "one" — satisfies it (defect, medium). Independently, there is no cross-row constraint: one nine-word sentence from one page can carry ten rows with unrelated signals and contradicting decisions, and the counter reads **admitted 10, failing 0, exit 0** live — i.e. C1's own numeric predicate is satisfiable by a table that does not meet the claim's surface ("each row maps an observable signal … to a driver action with the source's own numeric threshold"), which makes the C1 verdict rest on the L1's authorship plus the wave-2 row audit, not on the instrument (defect, medium-high for the claim's falsifiability). Two further probes are not holes that change a verdict: receipt bytes are not tied to the receipt URL (g3, line 254, checks only self-consistency; the live quote check compensates for quote presence) and `liveOk` (lines 208–213) accepts a same-host final URL whose *path* differs from the cited one — I could not make that admit a quote the final document does not carry. Impacted axis: **depth (C1)** only; calibration and the other axes are untouched. Smallest safe correction below; I made no repair.

## Attempts and readings (all runs in the scratch clone; exit codes observed)

| # | Attack | Fixture REV | Reading | Verdict |
|---|---|---|---|---|
| A1 | Unit mismatch: S121 quote "…is 60 requests per hour." with Threshold `60 days` | 468199a2 | live admitted 6/6, exit 0 | **hole** — n1 sees 60, ignores the unit |
| A2 | Bound inverted: S121 quote "No more than 90 seconds of CPU time per 60 seconds of real time is allowed." with Threshold `at least 90 seconds` | 468199a2 | admitted, exit 0 | **hole** — the optional bound prefix in UNIT_RE (line 86) is never compared to the quote |
| A3 | Status code as threshold + contradicting decision: S120 quote "Responses with the 429 status code MUST NOT be stored by a cache." row `` `429` `` / Decision `cache` / Threshold `429 requests` | 468199a2 | admitted, exit 0 | **hole** — the 429 of the *status code* passes as a threshold; the decision directly contradicts "MUST NOT be stored by a cache" (t3 line 270-271 checks the verb's form only) |
| A4 | Number-word collision: S119 quote "Group: One or more user-agent lines that are followed by one or more rules." with Threshold `1 redirects` | 468199a2 | admitted, exit 0 | **hole** — NUMBER_WORDS (line 87) maps the pronoun "one" to 1 |
| A5 | Document number: S120 header "RFC 6585 Additional HTTP Status Codes April 2012" with Threshold `6585 requests` | 7a9dde07 | live admitted 2/2, exit 0 | **hole** — the RFC's identity number is the "threshold" |
| A6 | Section number: S119 table-of-contents span "Specification 2.1. Protocol Definition 2.2. Formal Syntax 2.2.1. The User-Agent Line 2.2.2." with Threshold `2.2 hours` | 9cb716c9 | live admitted 1/1, exit 0 | **hole** — the decimal regex in numbersIn (line 184) turns a TOC line into a 2.2-hour threshold |
| B | One sentence reused for ten rows: S121 quote "Otherwise, wait for at least one minute before retrying." on ten rows with signals `429`/`403`/`503`/`retry-after`/`x-ratelimit-remaining`/`x-poll-interval`/`robots.txt`/`link`/`content-length`/`etag` and decisions wait/stop/retry/allow/disallow/cap/follow/refetch/backoff/cache | a73c89c8 | offline and live **population 10, admitted 10, failing 0, exit 0**; `jq '{population,admitted,failing}'` → `{"population":10,"admitted":10,"failing":0}` | **hole (decisive)** — the claim's numeric predicate is met by one sourced sentence; nine rows assert actions the sentence never supports |
| C | Receipt provenance: S122 receipt kept its URL but its `bytes_path`/`sha256` point at the S121 page (both pages carry the same sentence) | 7a9dde07 | live admitted, exit 0 | **note (low)** — g3 (line 254) checks only bytes↔sha self-consistency, so the committed receipt attributes another document's bytes to S122; the live check still finds the quote on the cited S122 page, so the row stays textually sourced |
| D | Same-host different document behind a redirect: `https://www.rfc-editor.org/rfc/rfc6585` returns 200 at `https://www.rfc-editor.org/info/rfc6585/`; `https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api` returns 200 at the rate-limits page (carries the sentence) | — | counter rule would accept the second alias (same host, quote present); the first target lacks the RFC body, so l1 rejects | **latent (low)** — `liveOk` (line 212) compares hosts only, not document path/identity; no admission of a non-carrying target was found |
| E | Do-nothing reproduction at the freeze commit (entry absent) | 9505a10e | population 0, admitted 0, exit 1 | counter holds (matches `baseline/c1-J1-do-nothing.json`) |
| F | Counter selftest | — | 34/34, exit 0 | counter holds |

Reading files (verbatim counter JSON) are in `.ufo/waves/round-31/w1/CritC1Counter/out/`: `A-offline.json`, `A-live.json`, `B-offline.json`, `B-live.json`, `CD-live.json`, `E-live.json`, `doNothing-live.json`, `selftest.json`. Fixture entries, receipts, registry append and the four fetched bodies are under `fixtures/` and `fetch/`; `commands.txt` and `SHA256SUMS.txt` record argv, revisions, exit codes and digests.

## Evidence (commands, exit codes)

Scratch setup (identity checked before every commit: `git -C "$C" rev-parse --show-toplevel` = the clone):

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" -q
git -C "$S/clone" checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d          # exit 0
sha256sum "$S/clone/scripts/check-decision-table.mjs"
  d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832               # = claims.json frozenDigests
node scripts/check-decision-table.mjs --selftest --json | jq '{cases,passed,ok}'
  {"cases":34,"passed":34,"ok":true}                                             # exit 0
```

Each fixture was committed in the clone with `-c user.name=CritC1Counter -c user.email=CritC1Counter@scratch.local`; run from the clone root (`--repo` defaults to the script's own parent, so the clone is the repo):

```
node scripts/check-decision-table.mjs --rev 468199a2 --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc \
  --entry corpus/knowledge/rate-signal-decision-table.md --json             # A offline, exit 0, 6/6
node scripts/check-decision-table.mjs --rev 468199a2 --baseline 96a2d1a3... \
  --entry corpus/knowledge/rate-signal-decision-table.md --live --json      # A live,    exit 0, 6/6
node scripts/check-decision-table.mjs --rev a73c89c8 --baseline 96a2d1a3... \
  --entry corpus/knowledge/rate-signal-decision-table.md --json             # B offline, exit 0, 10/10
node scripts/check-decision-table.mjs --rev a73c89c8 --baseline 96a2d1a3... \
  --entry corpus/knowledge/rate-signal-decision-table.md --live --json      # B live,    exit 0, 10/10
node scripts/check-decision-table.mjs --rev 7a9dde07 --baseline 96a2d1a3... \
  --entry corpus/knowledge/rate-signal-decision-table.md --live --json      # C/D live,  exit 0, 2/2
node scripts/check-decision-table.mjs --rev 9cb716c9 --baseline 96a2d1a3... \
  --entry corpus/knowledge/rate-signal-decision-table.md --live --json      # E live,    exit 0, 1/1
node scripts/check-decision-table.mjs --rev 9505a10e --baseline 96a2d1a3... \
  --entry corpus/knowledge/rate-signal-decision-table.md --live --json      # exit 1, population 0
git diff --stat 9505a10e..HEAD -- scripts/ | wc -l                          # 0
git rev-parse <each REV>:scripts/check-decision-table.mjs | git cat-file blob | sha256sum
  # d15f3bd7…6832 at 9505a10e, 468199a2, a73c89c8, 7a9dde07, 9cb716c9
```

Source bytes used by the fixtures were fetched by this seat (read-only, `curl -q -sS --proto =https -L`), logged with UTC time, status, bytes and sha256 in `fetch/meta.txt` / `commands.txt`: rfc9309.txt 200 25265 B `f633915d…b207`; rfc6585.txt 200 17164 B `f6d55d1b…6e58`; GitHub rate-limits 200 337116 B `ae5e1812…4c18`; GitHub best-practices 200 328088 B `b15c1c0b…a33e`. Quotes were verified to occur in the normalised bytes before use. Node v24.21.0, git 2.56.0, curl 8.23.0; no tool installs were needed.

## Line evidence in the frozen counter

- `UNIT_RE` line 86: bound words and units are a fixed list; the parsed cell keeps only `tm[1]` (the number, line 274).
- `NUMBER_WORDS` line 87, `numbersIn` lines 182–189: digits (`\d+(?:\.\d+)?`) and a boundary-matched word list, no unit or context.
- `t3-decision` lines 270–271: first alphabetic token must be in `DECISIONS`; no relation to the quote.
- `n1-threshold-sourced` line 286: `numbersIn(quote).has(tnum)` — the only threshold-source binding.
- `g3-bytes` line 254: receipt `bytes_path` blob must hash to the receipt's own `sha256`; nothing ties those bytes to `rc.url`.
- `liveOk` lines 208–213: https, HTTP 200, same host on the final URL, quote present after normalisation; path/document identity unconstrained.
- Docstring lines 53–56 state the intent that the threshold "is the source's, not the author's"; A1/A2/A4/A6 falsify that sentence as written.

## Impacted axes

Depth (C1) only. C1's kill rule is the counter reading, so A1–A6 and B weaken the *evidence quality* of any C1 closure built on this counter; they do not disturb calibration (C2 reads a different counter and different documents) or the other axes. No lane file, registry row or control was modified.

## Smallest safe correction (for the next freeze; not applied here)

1. **Bind number, unit and bound (closes A1, A2, A3, A5, A6).** Parse the Threshold cell as `{bound?, number, unit}`, map units to families (time: `s|sec|second`, `min|minute`, `h|hour`, `day`; count: `request`, `redirect`, `point`, `attempt`, `retry`; size: `byte|KiB|MiB`), and require the quote to contain the same number (digits or word) followed within three words by a unit of the same family; when the threshold carries a bound, require a same-polarity bound within the same clause (synonyms: `at most|no more than|up to|≤`; `at least|no less than|≥`). Reject numbers immediately preceded by `RFC|Section|§|Article|HTTP/` or forming a dotted token (`2.2`, `2.3.1`). Caveat: without the synonym table this rejects genuine rows such as threshold `at most 900 points` quoting "No more than 900 points per minute".
2. **Cross-row independence (closes B).** Require a distinct Located quote per row (at most one row per quote) and at least four distinct S-ids among admitted rows — the round's own "four registry rows" requirement is currently only in the goal text, not in the counter. Caveat: a source sentence legitimately split across two decisions would need a second sentence.
3. **Receipt provenance wording (C).** Either record the live fetch digest separately (`live_sha256`) and state that `bytes_path` bytes are not proven to come from `rc.url`, or drop the "committed fetch bytes" claim; keep the live quote check.
4. Add one selftest case per class above (unit mismatch, bound inversion, status-code number, RFC/section number, one-quote reuse, swapped receipt bytes) so the fix is able to fail, following the round-30 M8 pattern.

## Scope and hygiene

Leaf seat, no subagent dispatch, no messages to `agent://all`. Scratch under `$HYAKU_SCRATCH/tabi-r31/CritC1Counter` (one shared clone, deleted after this report); receipts, fixtures and JSON readings copied into this output directory before deletion. One report written: `.ufo/waves/round-31/w1/CritC1Counter.md`; no lane tracked file, index, jj state or sibling repo touched; no builds, linters or formatters run on the lane.
