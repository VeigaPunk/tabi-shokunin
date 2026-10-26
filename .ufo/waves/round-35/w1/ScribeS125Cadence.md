# ScribeS125Cadence — S125 recheck cadence (round-34 routed defect 5)

**Verdict: the cell changes — `90d` → `on-release`, landed with four companion evidence files; the
draft is gate-green at the round-35 freeze and red in every control.** S125 is a pinned tag
(`refs/tags/154.0.8037.97`), not a dated draft or a living page: my re-open decoded to the same
68,207-byte blob, sha256 `7b40e94c…abb5`, that the row's anchor already cites, so a day-based
recheck could only ever re-confirm identity. The single event that can invalidate the row's claim is a
ChromeDriver release, and `on-release` is the only `recheck` value any instrument evaluates
(`scripts/check-release-pins.mjs:178` population filter; self-test `:319` proves a `90d` row is not
counted). At the current stable tag `156.0.8078.47` the row still `holds` — three of six cited ranges
shifted by web-view-lifetime hunks, paired `capabilities.cc` byte-identical — so nothing supersedes
the row and only the cadence cell is wrong. Census at the freeze: 133 rows, 36 tag-pinned, 30
`on-release` + 6 `90d`; after the change 31 / 5 (S127, S129–S132 stay `90d`, not claimed here).

## Evidence

### Re-open of S125's own URL (2026-10-26, UTC)

```
curl -q -sS --proto =https -o page-154.html "…/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc"            exit 0, HTTP 200, 823,015 B, sha256 960a5a1b…ffb
curl -q -sS --proto =https -o raw-154.b64 "<same>?format=TEXT" + base64 -d                                                     exit 0, HTTP 200, 90,944 B envelope, 68,207 B decoded
sha256sum decoded-154.cc  → 7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5   (= the row anchor's digest)
```

Located quote, 9 words, `session_commands.cc:452` and `:457` at 154.0.8037.97:
`// Execute session.new for the newly-created mapper instance.` / `bidi_cmd.Set("method", "session.new");`

Stable-tag check at the same sitting: `156.0.8078.47` fetched 21:13:12Z after one HTTP 503 (1,459 B,
body `aa3a9d3d…`, the same load-shed page round 34 recorded), 92,700 B envelope / 69,523 B decoded,
sha256 `1bb1537c…ac06`; `capabilities.cc` 200 at both tags, 54,458 B, `597c1a33…7ba7` (identical).

### Gate runs (scratch clone at `a4bfef0f75027c915e715649950b1d46dcb33d83`)

Command: `node scripts/check-release-pins.mjs --repo <clone> --rev <rev> --stable 156.0.8078.47 --json`

| rev | change | exit | reading |
|---|---|---|---|
| `a4bfef0f` | freeze | **0** | population 23, resolved 23, holds 16, drifted 7, clean |
| `a43b0c7` | A: recheck cell only | **1** | population 24, resolved 23, unresolved 1, S125 `r1-entry missing or no files` |
| `995c5a38` | **B: cell + receipt row + both decoded bytes + refetch (the draft)** | **0** | population 24, resolved 24, holds 17, drifted 7, clean, S125 `verdict: holds` |
| `35b833e` | C1: refetch seat = `fetched_by` | **1** | `f6-refetch chrome/test/chromedriver/session_commands.cc` |
| `83c37db` | C2: 156 bytes replaced by 154 bytes | **1** | `f3-bytes sha …`, `f5-digest` |
| `3db56f4c` | C3: 156 bytes minus the `session.new` line, digests unchanged | **1** | `f3-bytes sha …`, `f5-digest` |
| `c43120b` | C3b: same edit, digests follow | **1** | `verdict: drifted`, `s1-drift-unsuperseded` |

`node scripts/check-sources.mjs --root <clone>` at B → exit 0,
`SOURCES_GATE verdict=clean rows=133 tiers=A:118,B:6,C:9 status=queued:15,mined:109,rejected:9 findings=0`.
`git diff --numstat <freeze> 995c5a38` → `corpus/SOURCES.md 1 1`, `receipt.json 44 0`,
`refetch/S125.json 13 0`, two byte files added, nothing deleted, no other path touched.
`json.dumps(indent=1)` round-trips the committed `receipt.json` byte-for-byte, so the append is
format-preserving.

### Contract reading

`/home/vgpnk/Projects/shokunin/CORPUS.md:105-106` (recheck grammar: ISO date, `90d`, `180d`,
`on-release`), `:116-118` (only status/recheck/used-by change in place, each logged old→new in the
lesson). The draft change touches the `recheck` cell only; `status` `mined`, `opened` `2026-10-26`,
anchor and `used-by` are untouched.

## Limits (verbatim from the deliverable)

- `--stable 156.0.8078.47` is taken from the receipt trigger (S108, Chromium Dash 04:12:21Z), not
  re-derived here — Chromium Dash is outside this seat's allowed host list.
- `f6` independence is name-based; C1 shows the check is not vacuous but a differing string would pass.
- The receipt entry's `fetched_by` is a prior round's seat on purpose (round 33 fetched the 156 bytes
  first); my fetch is the refetch record — crediting my seat there would destroy the independence.
- Range `378` cannot discriminate (the normalised line occurs five times at 156); the other five pin it.
- Only `session_commands.cc` is in the receipt; adding `capabilities.cc` (`[1362,1362] [1375,1376]`) is
  a separate design change, offered but not made.
- 503 bodies were overwritten by the retries; size + digest are the whole record (QUALITY 93).
- Two 503s occurred (S125-156 at 21:12:56Z; capabilities-156 inside the 21:12:56–21:13:04Z batch); both
  retried to 200 within seconds, both bodies identical (`aa3a9d3d…`).

## Deliverable paths

- `.ufo/waves/round-35/w1/ScribeS125Cadence/s125.md` — the deliverable (verdict, evidence, exact row
  change, lesson log line, `## Gate` row, runs, limits, commands).
- `.ufo/waves/round-35/w1/ScribeS125Cadence/row-old.txt`, `row-new.txt` — the two whole `SOURCES.md:139`
  lines verbatim.
- `.ufo/waves/round-35/w1/ScribeS125Cadence/proposed-sources-cell.txt` — the cell change plus the four
  companion files it requires, with the verified readings.
- `.ufo/waves/round-35/w1/ScribeS125Cadence/proposed-receipt-row.json` — the receipt entry in the
  receipt's own indentation (insert inside `"rows": [...]`).
- `.ufo/waves/round-35/w1/ScribeS125Cadence/proposed-refetch-S125.json` — `refetch/S125.json`.
- `.ufo/waves/round-35/w1/ScribeS125Cadence/fetch-receipts.tsv` — every fetch: URL, UTC, status, bytes,
  sha256.
- `.ufo/waves/round-35/w1/ScribeS125Cadence/gate-{baseline,A,B,C1,C2,C3,C3b}.json`,
  `census-B.txt`, `diff-numstat.txt` — raw readings.

No lane file, lane index, fleet file or sibling repo was written; no browser was launched; no tool was
installed. Scratch (`/fast/scratch/hyaku/tabi-r35/ScribeS125Cadence`) is removed after the receipts
above were copied.
