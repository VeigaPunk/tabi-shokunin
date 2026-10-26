# CritDecisionTableErrata — round 32 w2 (falsify): the round-32 errata block and row S123

Attacked: `corpus/knowledge/rate-signal-decision-table.md:214-232` (the round-32 errata appends) and
`corpus/SOURCES.md:137` (S123), at `b234a58920134424e0d104f137311ff54a16d26b` (claims frozen in `4181fff`).
Every comma, line number and digest below was re-derived from my own fetch and my own clean clone; nothing is
copied from the wave-1 reports.

**Verdict, one paragraph.** All four questions hold. The September 2022 reading is right: my own read-only GET of
`https://www.rfc-editor.org/rfc/rfc9309.txt` returned HTTP 200, 25,265 B, sha256
`f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` — byte-identical to the committed S119 receipt —
with `September 2022` at header line 11 and `June 2022` at exactly two lines (554, 559), both inside the RFC 9110 /
RFC 9111 reference entries, and every span S123 anchors (373, 377-378, 384, 387, 392, 398, 403, 406, 415, 419, 422,
425) re-locates to the byte. "365d governs" follows from the SOURCES contract, though not quite on the ground the
paragraph names: `recheck` is *defined* as a registry cell (`CORPUS.md:105-106`) and validated only there
(`scripts/check-sources.mjs:322`), while the entry's `recheck:` header is a restatement with no contract standing
(`CORPUS.md:18` names it only as required front matter) — so the header cannot be a second cadence; rule 2
(`CORPUS.md:116-118`) is a *supporting* step, not the load-bearing one. Citing S123 in the entry does not break
`scripts/check-decision-table.mjs`: offline exit 0 with 13/13 admitted, `--live` exit 0 with 13/13, identical to the
pre-errata revision, with the instrumented live leg showing thirteen GETs to the three receipt URLs and none to any
S123-only URL. S119 is left unedited: its row line is byte-identical at `d805d1d`, `4181fff` and `b234a58`, and the
round's registry diff is six insertions and zero deletions. One prose defect (nit) is filed, one operability limit is
recorded, and no row, quote, number or force changes.

## What I attacked, and what each attack returned

| # | attack | verdict |
|---|---|---|
| A1 | the September 2022 publication month and the five span groups in S123's anchor | holds |
| A2 | "the registry's `365d` governs" as a reading of the SOURCES contract (rule 2) | holds; reason-chain imprecise (F1 + note) |
| A3 | citing S123 in the entry breaks `check-decision-table.mjs`, offline and `--live` | holds (no effect) |
| A4 | S119 left unedited, and the append-only correction rule honoured | holds |

## A1 — the September 2022 reading (holds)

```
$ curl -q -sS --proto =https -o rfc9309.txt -w '%{http_code} %{size_download} %{time_total}\n' \
      https://www.rfc-editor.org/rfc/rfc9309.txt
200 25265 0.318139                                        # exit 0
$ sha256sum rfc9309.txt
f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207  rfc9309.txt
$ wc -c -l rfc9309.txt
  607 25265 rfc9309.txt
$ grep -n "Request for Comments" rfc9309.txt
6:Request for Comments: 9309
$ grep -n "June 2022\|September 2022" rfc9309.txt
11:                                                          September 2022
554:              DOI 10.17487/RFC9110, June 2022,
559:              DOI 10.17487/RFC9111, June 2022,
$ grep -n "^2\.3\.1\.2\|^2\.3\.1\.3\|^2\.3\.1\.4\|^2\.4\.\|^2\.5\.\|five consecutive\|400-499\|500-599\|30 days\|24 hours\|500 kibibytes" rfc9309.txt
373:2.3.1.2.  Redirects
377:   The crawlers SHOULD follow at least five consecutive redirects, even
380:   If a robots.txt file is reached within five consecutive redirects,
384:   If there are more than five consecutive redirects, crawlers MAY
387:2.3.1.3.  "Unavailable" Status
392:   HTTP, such status codes are in the 400-499 range.
398:2.3.1.4.  "Unreachable" Status
403:   server errors are identified by status codes in the 500-599 range.
406:   time (for example, 30 days), crawlers MAY assume that the robots.txt
415:2.4.  Caching
419:   SHOULD NOT use the cached version for more than 24 hours, unless the
422:2.5.  Limits
425:   Section 3.  The parsing limit MUST be at least 500 kibibytes [KiB].
```

The committed S119 receipt (`corpus/evidence/round-31/decision-table/S119.json` → `bytes/S119.txt`, 25,265 B) carries
the same digest, so "byte-identical to the S119 receipt" (`:229`) is exact, not approximate. The round-32 lesson's
Gate quote ("header lines 6-11: `Request for Comments: 9309` and `September 2022`") is also line-accurate: 6 and 11.
Hardest counterexample tried and failed: is `September 2022` an update date rather than the publication month? Line 11
is the RFC header block's issuance month (the field that reads `September 2022` for RFC 9309 everywhere), and the only
competing date strings in the file are the two reference DOIs. The erratum is right and the row's own scope ("the RFC's
own publication month") matches what it grounds.

## A2 — "365d governs" (holds; one prose defect, F1)

Field values at REV (`corpus/SOURCES.md` S119, S120, S123): `recheck = 365d` for all three; the entry header
`:8` still reads `180d for S119 and S120`. Contract bytes:

- `CORPUS.md:105-106` — "`opened` — ISO date the row's author opened the source. `recheck` — ISO date or cadence
  (`90d`, `180d`, `on-release`)." — the *only* definition of `recheck` in the contract, and it is a registry cell.
- `CORPUS.md:18` — "Each `knowledge/` entry opens with `source:`, `verified-at:` and `recheck:`" — a shape
  requirement, no semantics, no statement that the entry value may differ from the rows it summarises.
- `CORPUS.md:116-118` — rule 2: "Only `status`, `recheck` and `used-by` change in place, and each change is logged
  old→new in the round lesson. A correction is a new row whose `teaches` opens `supersedes S0NN —`."
- `scripts/check-sources.mjs:322` — `if (!isIsoDate(recheck) && !/^[0-9]+d$/.test(recheck) && recheck !== 'on-release')
  addFinding(..., 'bad_recheck', ...)` — `365d` is in-vocabulary (gate run below: `findings=0`).

So the load-bearing premise is "`recheck` is a registry field, not a property of this entry" — the contract defines the
term nowhere else, and the header's own text is keyed by source id ("180d for S119 and S120 …; 90d for S121 and
S122"), i.e. by construction a restatement of four rows' cells. The conclusion therefore holds: the registry governs,
`180d` is stale. Note on the chain, not a defect: "the contract's rule 2 allows a cadence to change only as a logged
old→new row edit" (`:222`) is true *of registry rows*; it does not by itself show that a header cannot carry a
cadence. The preceding clause does that work, so the paragraph's conclusion survives its own weakest sentence.

**F1 — nit (prose precision, append-only fix).** `:221` says "while the header is a prose restatement of four rows
**that no gate reads**". False in general: `scripts/check-frontier-admission.mjs:244` reads an entry's `recheck:` line
(`const hasRecheck = head.some((l) => /^recheck:\s*\S/.test(l.trim()));`, feeding `e1-provenance` at `:245`). What is
true is narrower: no gate compares an entry's recheck *value* to the registry, and that presence check runs only on
entries whose head carries `frontier: <name>` (`:193`, `:236`) — this entry carries no `frontier:` line, so it is not
in that gate's population (run below: population 2 = the S116 and S117 entries, this entry absent). Smallest safe
correction, appended (the block is append-only, so a new bullet, never an edit):

> - **"that no gate reads" (`:219`) — precision.** What no gate does is compare an entry's `recheck:` *value* with its
>   rows' cells. `scripts/check-frontier-admission.mjs:244` does test that the line is non-empty (`e1-provenance`),
>   for entries whose head carries a `frontier:` line (`:193`, `:236`); this entry carries none, so for this entry even
>   that read does not apply. The reading `365d` is unaffected.

## A3 — the counter is not broken by citing S123 (holds)

Clean clone at REV (`git status --porcelain | wc -l` → `0`), lane scripts run only there. The admitting baseline for
this entry is the round-31 baseline (`96a2d1a`), which is what the lane's own `measure.sh:33` uses; `d805d1d` is this
round's baseline and would fail every row on `r4-new-row` (see L1).

```
$ node scripts/check-decision-table.mjs --rev b234a58… --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc \
      --entry corpus/knowledge/rate-signal-decision-table.md --json
exit 0   population 13  admitted 13  failing 0  clean true
$ node scripts/check-decision-table.mjs --rev b234a58… --baseline 96a2d1a… \
      --entry corpus/knowledge/rate-signal-decision-table.md --live --json
exit 0   population 13  admitted 13  failing 0  live true          # 2026-10-26T17:16:35Z → :36Z
$ node scripts/check-decision-table.mjs --rev d805d1d…  --baseline 96a2d1a… \
      --entry corpus/knowledge/rate-signal-decision-table.md --json
exit 0   population 13  admitted 13  failing 0                     # the pre-errata revision: identical
$ git show 4181fff:scripts/check-decision-table.mjs | sha256sum ; git show b234a58:scripts/check-decision-table.mjs | sha256sum
d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832  (both)
$ node scripts/check-sources.mjs --root . --file corpus/SOURCES.md
exit 0   SOURCES_GATE verdict=clean rows=126 tiers=A:111,B:6,C:9 status=queued:15,mined:102,rejected:9 findings=0
```

Evidence that the live leg actually ran, and what it fetched: I re-ran `--live` with a logging shim as `curl` on
`PATH` (`shim/curl`, execs `/usr/bin/curl`). Thirteen invocations, in the counter's own argv
(`-q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60`):

```
5 × https://www.rfc-editor.org/rfc/rfc9309.txt                         (D1-D5, S119 receipt)
6 × https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api        (D6-D11, S121)
2 × https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-the-rest-api    (D12-D13, S122)
```

Zero fetches of any S123-specific URL — the errata's citation reaches the gate only as prose; `parseTable`
(`:157-174`) stops at the first table whose header is `Row | Signal | Decision | Threshold | Source | Located quote`,
and the errata adds none. The entry diff is `20 0` (all at the tail, `@@ -210,3 +210,23 @@`), so the table's bytes are
untouched.

Positive control — the gate can fail on exactly the substitution the errata declines to make. In my own clone only
(`git rev-parse --show-toplevel` == `$D`, branch `mut-s123-in-row`, `bce5b12`, `-c user.name/email` set), I changed
D1's Source cell `S119` → `S123`:

```
$ node scripts/check-decision-table.mjs --rev bce5b12… --baseline 96a2d1a… --entry … --json
exit 1   population 13  admitted 12  failing 1   rows: [["D1","S123","g1-receipt"]]
```

because no `corpus/evidence/round-31/decision-table/S123.json` exists. So "Rows D1–D5 keep citing S119" (`:231-232`)
is forced by the instrument, not merely preferred — a fact the paragraph asserts without demonstration; the
demonstration is this mutant. (Also: `check-sources.mjs:296` exempts a duplicate URL only when the row's `teaches`
opens `supersedes S###`, which S123's does, so the duplicate-URL finding `E04` does not fire — confirmed by the clean
registry run above.)

## A4 — S119 is left unedited (holds)

```
$ for r in d805d1d 4181fff b234a58; do git show $r:corpus/SOURCES.md | grep '^| S119 ' | sha256sum; done
715da56aadc2c9edefdc2cf56b329d414c535bd52bd6a8f9b31615e00179b99f   (all three revisions)
$ git diff d805d1d… b234a58… -- corpus/SOURCES.md
6 insertions, 0 deletions
+| S123 | Robots Exclusion Protocol — …          (plus S124, S125, S126 and two search-log lines)
$ git diff --numstat d805d1d… b234a58… -- corpus/SOURCES.md corpus/knowledge/rate-signal-decision-table.md
6	0	corpus/SOURCES.md
20	0	corpus/knowledge/rate-signal-decision-table.md
```

The stale anchor cell ("RFC 9309 (June 2022)") therefore stays in place, which is what rule 2 demands and what
`corpus/QUALITY.md:141` restates: "A superseding source row removes the falsified premise from every cell, not only
`teaches`; old append-only rows remain explicitly superseded." S123's own cells carry September 2022 only
(scope, anchor, teaches all say it), and its `teaches` opens `supersedes S119 —`, so both halves of criterion 33 hold.
The round lesson's "Status / recheck / used-by changes: None in place" is consistent with the byte-identical row and
with the absence of a logged old→new edit.

## Limits and observations (recorded, not defects)

- **L1 — the table's admission is baseline-bound, and the errata does not say so.** With this round's own baseline
  (`d805d1d`) the counter reports `population 13, admitted 0, failing 13`, every row `r4-new-row` (exit 1); with the
  round-31 baseline `96a2d1a` it is 13/13. That is a property of `r4` plus "no new rows this round", not something the
  errata introduced, but a future seat quoting "13 admitted" without the baseline would be quoting a number that
  cannot be reproduced from the round's baseline. If the L1 wants it recorded, the smallest append-only form is one
  sentence: "This table admits only against the round-31 baseline `96a2d1a…`; `r4-new-row` fails all thirteen rows
  under any later baseline, because S119–S122 were opened in round 31."
- **L2 — S123 appears in the entry only as prose.** The entry's provenance head lists S119–S122 (`:3-6`); S123 is
  cited inside the errata block. No gate reads a citation from prose, and `check-frontier-admission` never sees this
  entry (no `frontier:` line; run below). "Rests on a row" (`:227`) is therefore true of the registry and of a human
  reader, not of any instrument — consistent with how the round-31 errata cite S120, so not a new convention.
- **L3 — host scope of the live leg (disclosed).** `--live` is mandated by my item; the counter fetched
  `docs.github.com` (2 URLs, 13 GETs total). `docs.github.com` is not in the contract's enumerated allowlist; the GETs
  are read-only, no credentials, no cookies, no API endpoint, and they are the receipt URLs the frozen receipts name.
  My own direct fetches were `www.rfc-editor.org` only.

Gate cross-check for L2 and F1:

```
$ node scripts/check-frontier-admission.mjs --rev b234a58… --frontier rate-tos-signal --since 2026-10-26
exit 0   population=2 admitted=2   ENTRY host-published-rate-limit-headers.md (S117), rate-limit-policy-fields.md (S116)
         — corpus/knowledge/rate-signal-decision-table.md is not in this population
```

## Fetch ledger

| # | URL | UTC | status | bytes | sha256 |
|---|---|---|---|---|---|
| 1 | https://www.rfc-editor.org/rfc/rfc9309.txt (mine, `curl -q -sS --proto =https`) | 2026-10-26T17:15:11Z | 200 | 25,265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` |
| 2-6 | https://www.rfc-editor.org/rfc/rfc9309.txt ×5 (counter `--live`, shim-logged) | 2026-10-26T17:16:44-45Z | 200 (liveOk requires it) | n/a — counter retains none; receipt bytes 25,265 | receipt `f633915d…b207` |
| 7-12 | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api ×6 (counter `--live`) | 2026-10-26T17:16:45-46Z | 200 (liveOk requires it) | receipt bytes 337,116 | receipt `3a33f87b965a4af17078523dad091e35c41c69d7c9e6941140f91f4feefef755` |
| 13-14 | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-the-rest-api ×2 (counter `--live`) | 2026-10-26T17:16:46Z | 200 (liveOk requires it) | receipt bytes 328,088 | receipt `b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e` |

The counter's own `liveOk` (`:208-213`) rejects anything but HTTP 200 on an https, same-host final URL, so a non-200
would have produced `l1-live` on the row; none did across three live runs (two plain, one shimmed). Byte counts and
digests in rows 7-14 are the committed receipt files' values, not re-derived from my GET — stated so nothing is
claimed that I did not measure.

## Commands and exit codes (as run)

| command (clean clone at REV unless noted) | exit |
|---|---|
| `curl … rfc9309.txt` + `sha256sum` + `grep -n` (A1) | 0 |
| `check-decision-table --baseline d805d1d` (this round's baseline) | **1** (13 × `r4-new-row`) |
| `check-decision-table --baseline 96a2d1a` offline | 0 (13/13) |
| `check-decision-table --baseline 96a2d1a --live` | 0 (13/13) |
| `check-decision-table --baseline 96a2d1a` at rev `d805d1d` | 0 (13/13) |
| `check-decision-table --live` with logging `curl` shim | 0 (13/13; 13 GETs) |
| `check-decision-table` on mutant `bce5b12` (D1 → S123) | **1** (12/13, `g1-receipt`) |
| `check-sources --root . --file corpus/SOURCES.md` | 0 (rows 126, findings 0) |
| `check-frontier-admission --frontier rate-tos-signal --since 2026-10-26` | 0 (population 2) |
| `git diff --numstat d805d1d b234a58 -- corpus/SOURCES.md …` | 0 (`6 0`, `20 0`) |

No tools were installed or upgraded. No lane file, index, jj state, or sibling repo was written: the only commits are
in my own scratch clone (branch `mut-s123-in-row`), with `-C` and per-command identity. Scratch
`/fast/scratch/hyaku/tabi-r32/CritDecisionTableErrata` was deleted after the receipts below were copied.

## Files

- `CritDecisionTableErrata/rfc9309.txt` — my fetch of RFC 9309 (25,265 B).
- `CritDecisionTableErrata/offline-r31base.json`, `live.json`, `live-shim.json`, `offline-before.json`,
  `offline.json` — the five counter runs (last is the `d805d1d`-baseline red run).
- `CritDecisionTableErrata/mutant-s123.json` — the D1→S123 positive control.
- `CritDecisionTableErrata/curl-log.txt` — shim log of the thirteen live GETs.
- `CritDecisionTableErrata/sources.out` — registry gate output.
