# w2 RerunCensus — frontier-step conformance at b234a589 (seat RerunCensus-2)

**Verdict — holds.** At wave-1 revision b234a58920134424e0d104f137311ff54a16d26b the round-32 frontier step is census-conformant end to end: the registry grows exactly 122 → 126 rows against the freeze 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6, the four new rows S123–S126 are each well-formed 11-cell tier-A `mined` rows opened 2026-10-26 with existing `used-by` paths, every frozen manual census command (CORPUS.md lines 133–147) is clean at both revisions, the fleet `sources-census.sh validate` exits 0 in all three forms (`--file` at freeze, `--file` at REV, lane form `--root …/shokunin tabi`), and the frozen lane gate `node scripts/check-sources.mjs` reports `verdict=clean findings=0` at both revisions with byte-identical script bytes (sha256 `afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77` at freeze and REV — no counter drift). The only finding that is new since the freeze is one warning-class W04 (`S123 duplicate url www.rfc-editor.org/rfc/rfc9309.txt across scopes`, shared with S119) — the expected, contract-allowed consequence of the declared S123-supersedes-S119 mechanism (claims.json `frontierStep.sources`); zero E findings anywhere. No repair was made (attack seat), no lane file touched, no tool installed, no network fetch, no browser started.

## Attacked

Frontier-step rows S123–S126 and the registry invariants they enter at b234a589: row counts before/after, tier/status histograms, NF=13 well-formedness, id uniqueness, kind/tier/status enums, mined used-by path existence, W/E finding delta vs the freeze, agreement of three independent counters (frozen manual awk, fleet `sources-census.sh`, lane `check-sources.mjs`).

## Commands and exit codes

Scratch: `$S=/fast/scratch/hyaku/tabi-r32/RerunCensus`; clone `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` (rc 0) then `git -C $S/clone checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b` (rc 0, `clone_head=b234a58920134424e0d104f137311ff54a16d26b`); freeze read via `git -C $S/clone worktree add -q --detach ../freeze 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (rc 0). `git status --porcelain` empty in both checkouts. All runs below are in `receipts/` (copied to `.ufo/waves/round-32/w2/RerunCensus/receipts/`).

| # | Command (cwd / target) | rc |
|---|---|---|
| 1 | `bash run-census.sh` (drives all steps; TMPDIR=$S) | 0 |
| 1a | manual frozen census, freeze worktree (CORPUS.md L133–147 verbatim) | 0 |
| 1b | manual frozen census, REV clone | 0 |
| 1c | `sha256sum scripts/check-sources.mjs` ×2 | 0, 0 |
| 1d | `sources-census.sh validate --file $S/freeze/corpus/SOURCES.md` | 0 |
| 1e | `sources-census.sh validate --file $S/clone/corpus/SOURCES.md` | 0 |
| 1f | `sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` (lane form; reads live checkout, HEAD = b234a589, rc 0) | 0 |
| 1g | `(cd $S/freeze && node scripts/check-sources.mjs)` | 0 |
| 1h | `(cd $S/clone && node scripts/check-sources.mjs)` | 0 |
| 1i | `git diff FREEZE REV -- corpus/SOURCES.md` | 0 |
| 1j | `pgrep -fa 'chromedriver\|chromium'` | 0 |

Every step's rc is recorded inside its own receipt file.

## Rows and histograms (before → after)

| metric | freeze 4181fff | REV b234a589 | Δ |
|---|---|---|---|
| rows (`grep -cE '^\|…S[0-9]{3,}\|'`) | 122 | 126 | +4 |
| NF≠13 malformed (must be 0) | 0 | 0 | — |
| tier A / B / C | 107 / 6 / 9 | 111 / 6 / 9 | +4 A |
| status queued / mined / rejected | 15 / 98 / 9 | 15 / 102 / 9 | +4 mined |
| duplicate ids | none | none | — |
| enum violations / tier inflation | none | none | — |
| mined used-by paths missing | none | none | — |
| `check-sources.mjs` | `clean rows=122 … findings=0` | `clean rows=126 … findings=0` | — |
| validate W04 warnings | 19 | 20 | +1 (S123) |
| validate E01–E12 | 0 | 0 | — |

`check-sources.mjs` bytes identical across freeze..REV: sha256 `afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77` both. `git diff --stat FREEZE REV -- scripts/`: only `scripts/bidi-loopback-round32.mjs` (+317, new file); no census/gate script changed.

## New rows since freeze — 11 cells each

SOURCES.md delta is exactly 6 inserted lines, 0 deletions: 4 registry rows + 2 search-log bullets. Full cell dump: `receipts/new-rows-cells.txt`. Column order: id · source · kind · tier · scope · anchor · teaches · status · opened · recheck · used-by.

- **S123** · Robots Exclusion Protocol — https://www.rfc-editor.org/rfc/rfc9309.txt · spec · A · scope "The RFC's own publication month and the fetch-result spans…" · anchor: header line 11 = September 2022 (June 2022 only in RFC 9110/9111 reference entries, lines 554/559), §2.3.1.2–2.5 spans; re-fetched 2026-10-26T16:02:28Z, 25265 B, sha256 f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 · teaches: **"supersedes S119"** (same bytes, sha256 identical to S119 receipt; moves the publication month, no threshold) · mined · 2026-10-26 · 365d · corpus/knowledge/rate-signal-decision-table.md
- **S124** · W3C WebDriver BiDi dated WD (2026-10-08) — https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ · spec · A · anchor: rev f922e6af…, §§ enumerated, fetched 2026-10-26, 4235856 B, sha256 dc1077db…, byte-identical to S005's 2026-10-19 fetch · teaches: one section per BiDi command the C1 driver sends · mined · 2026-10-26 · 90d · corpus/knowledge/webdriver-bidi-runtime-round-32.md
- **S125** · ChromeDriver 154 session_commands.cc (tag 154.0.8037.97) · code · A · anchor: commit/tree ids, session_commands.cc:287-289, 332-338, 378, 407-410, 429-464, 510; decoded blob sha256 7b40e94c… and 597c1a33… · teaches: `webSocketUrl: true` → session-scoped ws endpoint + BiDi-CDP mapper; no default-on BiDi · mined · 2026-10-26 · on-release · corpus/knowledge/webdriver-bidi-runtime-round-32.md
- **S126** · WebDriver classic WD 02 July 2026 — https://www.w3.org/TR/webdriver2/ · spec · A · anchor: this-version TR/2026/WD-webdriver2-20260702/, §7 table lines 1976-1980 (`unhandledPromptBehavior` default "dismiss and notify"), §16.1 handlers 11247-11307 (`ignore` at 11306-11307); fetched 2026-10-26T16:02:14Z, 1882653 B, sha256 929f2f0b… · teaches: `webSocketUrl` absent from classic, enters via §7 slot · mined · 2026-10-26 · 90d · corpus/knowledge/webdriver-bidi-runtime-round-32.md

## W/E findings new since the freeze

Exactly one: `W04 S123 duplicate url www.rfc-editor.org/rfc/rfc9309.txt across scopes` (S123 vs S119; scopes differ, so E04 duplicate-URL+scope correctly does not fire). `diff` of the two `validate --file` outputs shows this single added line and nothing else. W04 is warning-class by SOURCES-CONTRACT-v1 ("warnings do not affect clean lanes") and the supersession is declared in S123's teaches cell and the search-log bullet — contract-conformant.

**Informational observation (no defect, no fix required):** S119 remains `mined` with its anchor still reading "RFC 9309 (June 2022)"; the registry has no superseded status, so the correction lives in S123 (teaches) + search log, and the shared-URL pair is flagged only by the pre-existing W04 pattern (19 such pairs existed at the freeze). If the L1 ever wants the stale month invisible to readers of S119's row, the smallest append-only change is an errata/search-log line, not a row rewrite — outside this seat's authority either way.

## Verification gaps (scope honesty)

- This seat verified registry **structure and counters only**; it did not re-fetch S123–S126 URLs or re-verify their quoted spans (wave-1 scribes own those quotes).
- `overdue`/`shared` census modes not run (not in the item); `--today` left at the UTC default 2026-10-26 (matches all four `opened` dates, so E08 vacuously clean).
- The lane-form validate read the live lane checkout whose HEAD is b234a589 — identical tree to the clone, and its output matches the `--file` REV run line for line.

## Hygiene

- No browser/chromedriver started by this seat; `pgrep -fa 'chromedriver|chromium'` shows only pid 1371 `/usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$` — the host OOM daemon whose regex contains the word, not a browser process; zero lines owned.
- No tool installed or upgraded (none needed); no network fetch performed; lane repo touched read-only (rev-parse, diff, clone source); all writes confined to `$HYAKU_SCRATCH/tabi-r32/RerunCensus` (deleted before yield, receipts copied first), the seat output dir, and this report.
- Scratch `$S` removed after receipts were copied; the tree on disk after this report is exactly `receipts/` (15 files) under `.ufo/waves/round-32/w2/RerunCensus/` plus this file.
