# ExecCensusScratch — scratch census mirror + synthetic S145 row

Round 39, attempt 1, wave 1. Seat: `ExecCensusScratch` (executor, axes: operability, milestone: executable-check).
Role: leaf executor. No subagent dispatch, no browser, no git/jj mutation, no production registry edit.

## Item as assigned

Create a scratch mirror of `corpus/SOURCES.md` plus a synthetic S145 row and run
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch>/SOURCES.md`;
confirm row schema and capture output/exit. Do not edit the production registry.

## Tooling

No tool installs. No pacman transactions. Used only pre-installed tools:
`GNU Awk 5.4.1` (`/usr/bin/gawk`), `GNU bash 5.3.20`, `node` (for the D5-format probe).

## Environment / provenance

```
$ date -u +%F
2026-10-27
$ gawk --version | head -1
GNU Awk 5.4.1, API 4.1, PMA Avon 8-g1, (GNU MPFR 4.2.2), (GNU MPMP 6.3.0)   [gawk --version | head -1]
$ bash --version | head -1
GNU bash, version 5.3.20(1)-release (x86_64-pc-linux-gnu), ...
```

Production registry read-only at `tabi-shokunin/corpus/SOURCES.md`
sha256 `b7f5b41a8aea019e0a44f431f2c59a110bf79bc44d5b46eb28744a71ad3def22`, 144 rows, max id `S144`.
`grep -c "S145" corpus/SOURCES.md` → `0`, so `S145` is the next free registry id.
`git status --porcelain -- corpus/SOURCES.md` → empty (production registry untouched).

Scratch root: `/fast/scratch/hyaku/tabi-r39/ExecCensusScratch/` (removed before yielding).

## Mirror construction

The mirror is a byte-for-byte copy of the production registry plus exactly one inserted row.
The insert is placed **inside the `## Registry` section**, immediately after `S144` and before the
`## Paths` heading (line 159 of the mirror):

```
$ diff corpus/SOURCES.md $S/repo/corpus/SOURCES.md
158a159
> | S145 | proc(5) — Linux /proc filesystem — https://man7.org/linux/man-pages/man5/proc.5.html | docs | A | ... | queued | 2026-10-27 | on-release | — |
```

Mirror file: `$S/repo/corpus/SOURCES.md`, sha256 `4551940fcbc9e2816a105bff188aaee191c401096798391836b9b8b6ff2385d9`.
Full row text is preserved at `synthetic-S145-row.md`.

Mirror layout matters: `sources-census.sh --file` resolves the "lane dir" as
`realpath(dirname(file)/..)`, i.e. the **parent of the registry file's directory**. The mirror therefore
places the registry at `<scratch>/repo/corpus/SOURCES.md` so the lane dir is `<scratch>/repo`, matching
the production shape (`tabi-shokunin/corpus/SOURCES.md` → lane dir `tabi-shokunin`).
`corpus/knowledge/`, `corpus/lessons/` and the round-37 counter path referenced by `S143`
(`.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs`) were copied into the mirror so `E11`
used-by resolution has the same substrate as production.

## Row schema confirmed

The registry contract (`SOURCES-CONTRACT-v1`, per the script header) is **11 columns ⇒ NF=13**
(leading and trailing pipes included). The synthetic S145 row parses to exactly that:

```
$ awk -F'|' '/^\| S145 /{print "NF="NF}' $S/repo/corpus/SOURCES.md
NF=13
$ awk -F'|' '/^\| S[0-9]/{print NF}' $S/repo/corpus/SOURCES.md | sort | uniq -c
    145 13
```

Cell-by-cell (`cell[2]`..`cell[12]` are the 11 contract columns):

| # | column | value |
|---|---|---|
| 1 | id | `S145` |
| 2 | source | `proc(5) — Linux /proc filesystem — https://man7.org/linux/man-pages/man5/proc.5.html` |
| 3 | kind | `docs` (enum: spec\|docs\|paper\|code\|tool\|dataset\|talk\|book\|community\|own-work) |
| 4 | tier | `A` (enum A\|B\|C) |
| 5 | scope | free text, states what proc(5) states about `/proc/<pid>/fd` and `/proc/<pid>/net/tcp` |
| 6 | anchor | free text, names the page sections |
| 7 | teaches | free text, states the lesson |
| 8 | status | `queued` (enum: queued\|mined\|rejected) |
| 9 | opened | `2026-10-27` (ISO date, not in the future relative to `--today`) |
| 10 | recheck | `on-release` (symbolic cadence) |
| 11 | used-by | `—` (em dash; legal, and required to avoid `W03` unless the row is `mined`) |

The `S145` subject matter is `proc(5)`, chosen because the frozen C1 claim names
`"source": "S145 (proc(5) man page, /proc socket observation) opened this round and cited by the
knowledge entry"` — so the schema exercised here is the one C1's cited knowledge entry will need.

## Primary run — output and exit

Command (mirror layout, lane dir `<scratch>/repo`):

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
    --file /fast/scratch/hyaku/tabi-r39/ExecCensusScratch/repo/corpus/SOURCES.md \
    --today 2026-10-27
```

**Exit 0.** stdout = 21 lines: 20 `W04` duplicate-URL-across-scopes warnings (the pre-existing set
S058, S065, S066, S068–S070, S073–S077, S095–S100, S114–S115, S118, S123) plus the terminal
`file ok <path>` line. stderr empty. **No `E*` code was emitted for S145.**

```
file	W04	S058 duplicate url chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd across scopes
...
file	W04	S123 duplicate url www.rfc-editor.org/rfc/rfc9309.txt across scopes
file	ok	/fast/scratch/hyaku/tabi-r39/ExecCensusScratch/repo/corpus/SOURCES.md
```

Full output: `validate-mirror-S145.out`. Baseline for comparison — the same command against the
**unmodified production** registry (read-only) also exits 0 with the identical 20 `W04` warnings
and `tabi ok <path>`: `validate-production-lane.out`. The S145 row therefore adds zero findings
and zero warnings; the 20 `W04` set is unchanged pre-existing noise, exactly as the round-38
receipt already records.

Census-mode counts on the mirror (used by C2's D5 clause):

```
file	rows	145
file	tier.A	129
file	tier.B	7
file	tier.C	9
file	status.mined	120
file	status.queued	16
file	status.rejected	9
```
(production is 144 / 128 / 7 / 9 / 120 / 15 / 9). Full: `census-mirror-with-S145.out`.

## Negative controls — the schema is actually enforced, not merely satisfied

Every control is a separate copy of the mirror with exactly one S145 mutation, run through the
same `validate --file` command in the same mirror layout. Summary in `neg-controls/summary.tsv`:

| control | mutation | emitted | exit |
|---|---|---|---|
| n2 | `kind=webpage` | `E05 S145 kind=webpage` | 1 |
| n3 | `opened=2026-12-01` (future vs `--today 2026-10-27`) | `E08 S145 opened=2026-12-01` | 1 |
| n4 | S145 row duplicated | `E03 S145 duplicate id` + `E04 S145 duplicate url ... within scope ...` | 1 |
| n5 | `recheck=soonish` | **none** — `soonish` is a legal symbolic cadence (matches `^[A-Za-z][A-Za-z0-9 _-]*$`) | 0 |
| n6 | row moved below `## Paths` | `E12 S145 row outside Registry section` | 1 |
| n7 | `status=mined`, `used-by=—` | `W03 S145 mined but unused` (warning, exit unaffected) | 0 |
| n8 | `kind=community` at tier A | `E10 S145 community-at-A` | 1 |
| n9 | `tier=D` | `E06 S145 tier=D` | 1 |
| n11 / e1 | one cell dropped (NF=12) | `E01 S145 fields=10` | 1 |
| n13 | `status=mined`, `used-by=corpus/knowledge/playwright-firefox-egress-round-39.md` (file absent) | `E11 S145 missing used-by ...` | 1 |
| n14 | `status=mined`, `used-by=` an existing knowledge file | none | 0 |
| w1 | `tier=C`, `status=mined`, `used-by` set | `W01 S145 tierC mined used-by=...` | 0 |
| w2 | `status=rejected`, `teaches=short` | `W02 S145 thin reject reason` | 0 |
| w3 | `status=mined`, `used-by=—` | `W03 S145 mined but unused` | 0 |
| n16 / n20 | row genuinely below `## Paths` heading | `E12 S145 row outside Registry section` | 1 |
| n21 | extra non-S-id row `X001` inside `## Registry` | none from validate | 1 (from a pre-existing `E11`) |

Exit-code semantics confirmed from `scripts/sources-census.sh:740-746` and observed: a lane emits
its `ok` line and the process exits 0 when there are **no `E` codes**; `W` codes are printed but
do not change the exit. Any `E` code suppresses the `ok` line and forces exit 1. Exit 2 is
reserved for usage/env errors — confirmed: `--file <nonexistent>` → `ERROR: --file not found: ...`,
exit 2; `--today not-a-date` → `ERROR: --today not an ISO date: not-a-date`, exit 2.

Important operational consequence for the round-39 C1 landing: **if the S145 row is landed as
`status=mined` with a `used-by` path that does not exist on disk, the census emits `E11` and the
lane exits 1.** The C1 claim says S145 is "opened this round and cited by the knowledge entry", so
the `used-by` path must point at a knowledge file that exists at the measured REV — i.e. the
round-39 knowledge entry must land in the same revision as (or before) the registry row.
Verified: with the round-39 knowledge file present in the mirror, the mined variant validates
exit 0 with zero `E` codes (`neg-controls/mined.out`); with it absent, exit 1 with `E11`.

## Finding: the census `--file` path is not interchangeable with the `--root <fleet> lane` path

This is the one real divergence found, and it bears directly on C2's D5 clause ("round-39 census
receipt counts equal this counter's parse").

**Observation.** `sources-census.sh census` (and its `rows` metric) counts rows **only inside the
`## Registry` section**. The c2 counter's own D5 parse (`c2-routed-defects-v2.mjs:184-190`) counts
rows with the regex `/^ {0,3}\|\s*S\d{3,}\s*\|/` over the **whole file**, with no section scoping.
The two disagree on rows that are inside/outside the Registry section, or whose id is not `S\d{3,}`:

- **n16 / n20** — S145 moved below `## Paths` (outside `## Registry`):
  `census` reports `rows 144` (Registry-scoped, S145 excluded) while the counter-style parse
  reports `rows 145` (whole-file, S145 included). Divergence of 1.
- **n21** — an extra `X001` row added inside `## Registry`:
  `census` reports `rows 146` (Registry-scoped, X001 included) while the counter-style parse
  reports `rows 145` (id-regex-scoped, X001 excluded). Divergence of 1, in the other direction.

**Consequence.** For a lane whose registry contains only well-formed `S\d{3,}` rows inside
`## Registry` — which is the case for tabi today and for the mirror — the two parses agree exactly,
so a census receipt derived from `census` output satisfies D5. But the agreement is *incidental*,
not guaranteed by the contract: any row outside `## Registry`, or any Registry row whose id is not
`S\d{3,}`, silently breaks the D5 equality.

**Additionally, the `tier` histogram key naming differs** (x1 control). `census` normalises a
non-enum tier into `tier.invalid`; the counter's raw parse keeps the literal value (`tier.D`).
A receipt written from `census` output for a registry containing an invalid tier would read
`tier: A=128 B=7 C=9 invalid=1`, parse (via the counter's `parseHist`) to `{A:128,B:7,C:9,invalid:1}`,
and be compared against the counter's `{A:128,B:7,C:9,D:1}` → `d5-tier` finding even though the
receipt is faithful to `census`. Since `E06` already forces exit 1 for an invalid tier, this is
only reachable in an already-failing lane; it is a latent trap, not a live blocker.

**Operational guidance for the round-39 census receipt** (`.ufo/waves/round-39/measure/census-end.txt`):

1. It must carry **explicit `rows: N`, `tier: A=… B=… C=…`, `status: …` lines**. A receipt that is
   merely a paste of the `census` TSV output parses to `receiptRows=null` and fails D5 on all three
   sub-checks. Measured: `census-receipt-tsv-paste.txt` → `D5 rows-eq=false tier-eq=false status-eq=false`;
   the same TSV **plus** the three explicit count lines → all three `true`
   (`census-receipt-candidate.txt`). The round-38 receipt already uses the explicit-lines format.
2. The `tier:`/`status:` values must be the **enum letters** (`A`, `B`, `C`) and the **status words**
   (`mined`, `queued`, `rejected`), not `tier.A=`/`status.mined=` — though `tier.A=129 tier.B=7`
   also parses correctly (the counter's `parseHist` regex splits on the prefix). Both forms were
   measured as `eq=true`; the round-38 format (`A=128 B=7 C=9`) is the established one.
3. The counts must match whatever the **landed** S145 row actually is. Measured both plausible shapes:
   - S145 `queued`, tier A → `rows: 145`, `tier: A=129 B=7 C=9`, `status: mined=120 queued=16 rejected=9`
   - S145 `mined`, tier A → `rows: 145`, `tier: A=129 B=7 C=9`, `status: mined=121 queued=15 rejected=9`
   Both parse `eq=true` against their matching registry (`d5-format-check.js` reproduces the counter's
   exact D5 parse; saved alongside the artifacts).
4. If the S145 row is landed `mined` with a `used-by` naming the round-39 knowledge entry, that
   knowledge file must exist at the measured REV or the lane's census exits 1 with `E11` (n13).

Also measured: the D5 regexes are order-sensitive on the receipt text — a receipt whose prose
mentions "rows" or "tier" before the count lines can have the *first* occurrence captured instead of
the count line. The stray-prose variant (`receipt-stray.txt`, prose containing the words "rows" and
"tier" ahead of the counts) still measured `eq=true` on all three, because the prose did not place a
literal `rows:`/`tier:` token. A receipt that writes e.g. `tier: ...` inside the prose would capture
that instead. Keep the prose free of `rows:`/`tier:`/`status:` tokens.

## What was not done / out of scope

- The production registry was not modified (verified: `git status --porcelain -- corpus/SOURCES.md`
  empty; sha256 of the production file unchanged from the pre-run value recorded above).
- The flat `--file <scratch>/SOURCES.md` literal form from the item text was also run, and it
  **exits 1 with 162 `E11` lines**. Reason: `--file` takes the lane dir as the *parent of the
  registry file's directory*, so a registry placed flat at `<scratch>/SOURCES.md` resolves the lane
  dir to `<scratch>/..` and every `used-by` path misses. The mirror layout
  `<scratch>/repo/corpus/SOURCES.md` is the arrangement under which the check is meaningful; this
  is a property of the tool's `--file` contract, not of the S145 row.
- No browser was launched (the item does not require one).
- No tool installs were performed.

## Files written by this seat

- `.ufo/waves/round-39/w1/ExecCensusScratch/report.md` (this file)
- `.ufo/waves/round-39/w1/ExecCensusScratch/synthetic-S145-row.md` — the exact row inserted
- `.ufo/waves/round-39/w1/ExecCensusScratch/validate-mirror-S145.out` — primary run stdout (exit 0)
- `.ufo/waves/round-39/w1/ExecCensusScratch/validate-production-lane.out` — production baseline (exit 0)
- `.ufo/waves/round-39/w1/ExecCensusScratch/census-mirror-with-S145.out` — census-mode counts
- `.ufo/waves/round-39/w1/ExecCensusScratch/census-receipt-candidate.txt` — receipt form that satisfies D5
- `.ufo/waves/round-39/w1/ExecCensusScratch/census-receipt-tsv-paste.txt` — receipt form that fails D5
- `.ufo/waves/round-39/w1/ExecCensusScratch/d5-format-check.js` — reproduction of the counter's D5 parse
- `.ufo/waves/round-39/w1/ExecCensusScratch/neg-controls/` — 20 control outputs + `summary.tsv`
- `.ufo/waves/round-39/w1/ExecCensusScratch.md` — pointer stub

Scratch `/fast/scratch/hyaku/tabi-r39/ExecCensusScratch/` deleted before yielding.

VERDICT finding — the scratch mirror with a synthetic S145 row validates clean (exit 0, no E-codes,
schema confirmed NF=13 with all 11 contract columns), but the census `rows`/`tier` metrics and the
C2 counter's D5 parse use different scoping and key naming, so the round-39 census receipt must
carry explicit `rows:`/`tier:`/`status:` count lines matching the landed S145 row's shape
(`queued` → `status: mined=120 queued=16 rejected=9`; `mined` → `status: mined=121 queued=15 rejected=9`);
a receipt that is only a paste of the census TSV fails D5 on all three sub-checks.
