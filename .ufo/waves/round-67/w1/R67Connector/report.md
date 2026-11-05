# R67Connector — C1 disposition-evidence rule, pre-measure on r66 ledger

Read-only. Nothing in the lane, fleet root, or frozen counters was edited.

## Result

The proposed rule refuses **95 of 149** r66 line rows. Every refused row is `no-tabi-ground`. The rule refuses **0** `overlap-declared` rows and **0** `contested-open` rows.

The `no-tabi-ground` branch is unsatisfiable on this ledger. Zero line rows have zero BG-word hits (zeroHit=0 for all three dispositions). The meter only admits line rows that are BG hits: `c1-adjacency-host-v22.mjs:262-263` (`isHit` … `if (!isHit) add('delta-line-invented', …)`). So "no-tabi-ground requires zero BG words" forbids the disposition for every row the meter can legally hold.

## Counts (rule as proposed, BG_WORDS copied from v22 line 34)

| disposition | total | zeroHit | hit | refused | accepted |
|---|---|---|---|---|---|
| no-tabi-ground | 95 | 0 | 95 | 95 | 0 |
| contested-open | 49 | 0 | 49 | 0 | 49 |
| overlap-declared | 5 | 0 | 5 | 0 | 5 |
| **total** | **149** | 0 | 149 | **95** | **54** |

Ledger: `.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv`. 175 rows: 25 `lane`, 149 `line`. All rows have 9 fields.

## Matching rule used (copied from the meter)

- Meter line 209/235/262: `low = quote.toLowerCase(); BG_WORDS.some(w => low.includes(w))` — case-insensitive substring. Same rule applied here.
- Quote is the whole line (meter enforces `delta-quote-not-whole-line`), so column 7 is the matched text.
- BG_WORDS (13, verbatim line 34): `['cdp','devtools','remote-debugging','headless','webdriver','geckodriver','selenium','playwright','bidi','crawl','screenshot','recordhar','record-har']`

## Commands and exit codes

1. `grep -n "BG_WORDS" .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs` → exit 0 (line 34 is the array; lines 209, 235, 262 are the matching sites).
2. `awk -F'\t' 'NR>1{print $1}' <ledger> | sort | uniq -c` → exit 0 (25 lane, 149 line).
3. `awk -F'\t' 'NR>1 && $1=="line"{print $8}' <ledger> | sort | uniq -c` → exit 0 (95 no-tabi-ground, 49 contested-open, 5 overlap-declared).
4. `awk -F'\t' '{print NF}' <ledger> | sort | uniq -c` → exit 0 (175 × 9).
5. `node rule.mjs .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs <ledger> refused.tsv` → exit 0. BG_WORDS extracted from the v22 source line by regex, not retyped. Output counts identical to the table.
6. Independent cross-check: `awk -F'\t' -v W="$WORDS" …` with `WORDS` produced by `sed -n "s/^const BG_WORDS = \[\(.*\)\];$/\1/p" <v22> | tr -d "' " | tr ',' '\n' | paste -sd' '` → exit 0. Output: `no-tabi-ground total=95 zeroHit=0 refused=95`, `contested-open total=49 zeroHit=0 refused=0`, `overlap-declared total=5 zeroHit=0 refused=0`. Matches the JS count.
7. `grep -iE "tabi|chrom|browser|cdp|devtools|playwright|screenshot" refused.tsv` → exit 0 (screen for disposition-doubt; see verdicts).
8. `rm -rf` of the connector scratch dir → exit 0.

## Refused rows, keyed by (lane, path) — 95 rows; full verbatim quotes in rows.tsv

- audio-shokunin (3): PROVINCE.md:4, :25, :41
- game-dev-2d-shokunin (3): PROVINCE.md:3, :8, :16
- game-dev-3d-shokunin (8): PROVINCE.md:3, :6, :16, :19, :29, :57, :58, :62
- kagi-shokunin (2): PROVINCE.md:41, :91
- kaidoku-shokunin (4): PROVINCE.md:48, :58, :136, :149
- kake-shokunin (64): PROVINCE.md:22, :23, :66, :308, :309, :328, :346, :348, :349, :351, :353, :358, :364, :365, :370, :373, :379, :381, :382, :383, :400, :402, :404, :414, :416, :417, :418, :420, :421, :423, :424, :426, :428, :437, :444, :446, :455, :457, :464, :465, :466, :582, :584, :590, :598, :608; SKILL.md:1014, :1089, :1100, :1121, :1233, :1248, :1254, :1295, :1309, :1325, :1333, :1334, :1335, :1346, :1350, :1357, :1358, :1473
- kengaku-shokunin (2): PROVINCE.md:990, :1085
- kotoba-shokunin (3): PROVINCE.md:59, :61, :62
- mado-shokunin (3): PROVINCE.md:16, :35, :482
- revenger-shokunin (2): PROVINCE.md:26, :27
- tsukuroi-shokunin (1): PROVINCE.md:48

Total 95 = 3+3+8+2+4+64+2+3+3+2+1.

## Per-row verdict (from quote text alone)

For every refused row the **disposition is correct and the rule is wrong**. The quote describes the sibling's own scope, and the BG token is lexical rather than Tabi-ground overlap. Examples, quoted verbatim from the ledger:

- `audio-shokunin PROVINCE.md:4`: `soundtrack (motifs, loops, stems, adaptive layers) — verified by headless` — headless audio verification, not Chromium.
- `game-dev-3d-shokunin PROVINCE.md:62`: `--headless has no rasterizer/framebuffer` — Godot, not Chromium.
- `kagi-shokunin PROVINCE.md:41`: `…/whoami/cdp-bridge/tac-check…` — a the-janitor subcommand, not Chrome DevTools Protocol.
- `kake-shokunin PROVINCE.md:22`: `- Crawl hygiene per host (robots.txt, sitemap scope, canonical signals)` — SEO crawl scope, not browser ground.
- `tsukuroi-shokunin PROVINCE.md:48`: `Mado verifies file/screenshot behavior itself` — routing sentence to mado.
- `mado-shokunin PROVINCE.md:482`: `No config edit, reload, dispatcher, input capture, package transaction, screenshot, service` — negative scope.

Nearest to doubtful: `mado-shokunin PROVINCE.md:16`: `state; every claim is file-byte- or screenshot-verified.` Mado screenshots its own desktop, not Chromium pages. I still read `no-tabi-ground` as correct. No row is judged `disposition-wrong` on the quote alone.

## Implications for the L1 (not scored by me)

- Under v23 a flip of any `no-tabi-ground` row is refused by construction, and a flip to `overlap-declared` is accepted by construction, because every legal line row has a BG hit. The flip sweep would therefore measure the rule, not adjudication evidence.
- The rule as worded forbids the disposition the r66 adjudication used for 95 of 149 rows. A rule that keeps `no-tabi-ground` must key on something other than lexical BG hits, or must carve out the non-browser senses of the BG tokens.
- Freezing v23 as worded would make the frozen ledger fail its own gate.

Machine-readable refusals: `rows.tsv` (95 rows, columns lane, path, disposition, bgHits_matched, quote, verdict, verdict_basis).
