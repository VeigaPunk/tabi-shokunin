# ReopenS126 — independent re-open of registry row S126 and its lesson Gate row

Verdict: **S126 holds on source, kind, tier, status, opened, recheck and used-by, and on every
quote the lesson Gate row attributes to it; one cell is defective.** The row's `anchor`, and in
its wake the `scope` and `teaches` cells, place "the additional-capability slot" at **§7 line
1798**, but HTML line 1798 sits in **§6.7 Extensions** (heading at line 1744; §7 begins at line
1872, 74 lines later) — the line pin resolves to the right paragraph, the section label is wrong.
My own fetch of https://www.w3.org/TR/webdriver2/ returned HTTP 200, 1,882,653 B, sha256
`929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e`, byte-identical to the row's
16:02:14Z pin and `cmp`-identical to the dated this-version URL the row cites; every other
anchor location, the "`ignore`" and "Defaults to" quotes, the 0 case-insensitive `websocket`
count, the default, and the used-by citation check out. The defect is curation-level (the C1
entry cites only the correct locations — §7 table 1976-1980 and §16.1 — so no C1 claim changes),
and the smallest contract-conformant fix is an append-only superseding row, not an in-place edit.

## What I attacked

Registry row S126 at `corpus/SOURCES.md:140` (all eleven cells) and its Gate row at
`corpus/lessons/round-32.md:19`. Method: own read-only fetch of the row's URL and of its dated
this-version URL, then line-exact resolution of every location the row names, then a byte-grounded
check of each clause of `teaches`, then the frozen structural gate in a scratch clone at
`b234a58920134424e0d104f137311ff54a16d26b`, then the Gate quote against the fetched bytes.

## Fetch receipts (mine)

```
$ date -u +%Y-%m-%dT%H:%M:%SZ ; curl -q -sS --proto =https -o wd.html -w 'HTTP %{http_code} bytes=%{size_download}\n' https://www.w3.org/TR/webdriver2/
2026-10-26T17:07:21Z
HTTP 200 bytes=1882653
exit=0
$ sha256sum wd.html
929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e  wd.html

$ date -u +%Y-%m-%dT%H:%M:%SZ ; curl -q -sS --proto =https -o wd-dated.html -w 'HTTP %{http_code} bytes=%{size_download}\n' https://www.w3.org/TR/2026/WD-webdriver2-20260702/
2026-10-26T17:08:34Z
HTTP 200 bytes=1882653
exit=0
$ sha256sum wd-dated.html
929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e  wd-dated.html
$ cmp wd.html wd-dated.html && echo IDENTICAL
IDENTICAL
```

Recorded again inside `evidence-greps.txt` at 17:11:15Z (both URLs, same status/bytes/sha256,
`cmp` identical), so the pin is reproducible twice: `fetches.json` in the output dir. The w1
seats' receipts agree (`w1/ScribeSrcClassic/fetches.json`: 16:02:14Z, 200, 1882653 B, same sha256;
`w1/ScribeEntry/fetch-receipts.md:14`: 16:02:34Z, 200, 1882653 B, same sha256).

## Cell verdicts (path:line evidence)

| cell | verdict | evidence |
|---|---|---|
| `id` | holds | S126 unique, rows=126, no duplicate ids: `node scripts/check-sources.mjs` → `rows=126 … findings=0`, exit 0. |
| `source` | holds | Bytes' `generatedSubtitle` is "W3C Working Draft 02 July 2026" (HTML line 333) and `<time datetime="2026-07-02">02 July 2026` (line 339); URL HTTP 200; title in the cell matches. |
| `kind` | holds | W3C Working Draft = `spec`; no other kind fits. |
| `tier` | holds | Primary spec for its scope; tier A, scoped to `scope` as the contract requires. |
| `scope` | **defect (D1)** | Content (classic capability, handler keys, documented default, dated-WD-bytes-only) is honest, but "the §7 slot through which another specification adds a capability" repeats the §7/§6.7 slip. |
| `anchor` | **defect (D1)**, otherwise holds | 343-344 ✓ this-version; 1976-1980 ✓ §7 table; 11202-11203 ✓ §16 preamble; 11247-11307 ✓ §16.1; 11306-11307 ✓ "ignore"; `websocket` = 0 ✓; revision pin (dated WD + 1882653 B + sha256) ✓. 1798 ✗ labelled §7, actually §6.7 Extensions. |
| `teaches` | holds except one label | Each clause grounded below; the only ungrounded word is "§7" on the slot. |
| `status` | holds | `mined` needs ≥1 citing path in `used-by`; the named knowledge entry cites S126 at `corpus/knowledge/webdriver-bidi-runtime-round-32.md:5`; checker's `used_by_uncited` passes. |
| `opened` | holds | ISO date 2026-10-26; same-day re-fetch produced the same bytes. |
| `recheck` | holds | `90d` is a contract cadence (ISO date or `90d`/`180d`/`on-release`); next look 2027-01-24; source unchanged today (two identical fetches across the evergreen and dated URLs). |
| `used-by` | holds | `corpus/knowledge/webdriver-bidi-runtime-round-32.md` exists and cites S126 at line 5; `check-sources.mjs` exit 0. |

### Anchor resolution, line by line

Fetched bytes at 1,882,653 B; all numbers are HTML lines of those bytes:

- **343-344** — `343: <dt>This version:</dt><dd>` / `344: <a class="u-url" href="https://www.w3.org/TR/2026/WD-webdriver2-20260702/">…`. ✓
- **1976-1980** — table row `1976: <td>Unhandled prompt behavior` / `1977: …"<code>unhandledPromptBehavior</code>"` / `1978: string` / `1979: Describes the session's user prompt handler.` / `1980: Defaults to "<code>dismiss and notify</code>".`, inside §7 Capabilities (`1872: <section id="capabilities">…7. Capabilities`). ✓
- **11202-11203** — §16 preamble `11202: </p><p>By default user prompts are not handled automatically` / `11203: unless a user prompt handler has been defined.`, inside §16 User prompts (heading 11193). ✓
- **11247-11307** — §16.1 heading `11247: <h3 id="x16-1-user-prompt-handler">16.1 User Prompt Handler`; known-handler table 11277-11309; last row `11306: <td>"<code>ignore</code>"` / `11307: </td><td>All … simple dialogs … encountered should be left to the user to handle.` ✓
- **"case-insensitive `websocket` occurrences = 0"** — `grep -oic 'websocket' wd.html` → `0` (exit 1, no match). ✓
- **"§7 additional-capability slot line 1798"** — **✗ section.** `1798: <p>Other specifications may define <dfn …>additional WebDriver capabilities</dfn>.` The nearest enclosing heading is `1744: <h3 id="x6-7-extensions">6.7 Extensions`; there is no `<section` start between 1744 and 1800 (`grep -n '<section' | awk '$1>=1740 && $1<=1800'` prints only 1744), and §7 starts at 1872. The §7 side of the slot is real but different: §7.2's process-capabilities branch at 2291-2297 runs the "additional capability deserialization algorithm" (a reference, not the definition).

### `teaches`, clause by clause

- "session capability `unhandledPromptBehavior` and its known handler keys (the `ignore` value in particular)" — 1977, 11306. ✓
- "the capability's documented default" — 1980 (`Defaults to "dismiss and notify"`). ✓
- "the §7 slot through which another specification adds a capability" — content ✓ at 1798, section label ✗ (D1).
- "an alert dismissed before a BiDi `handleUserPrompt` is the session default acting, not `ignore`" — inference from 1980 (default dismiss-and-notify) plus 11307 (ignore leaves the prompt); the inference is sound and labelled as a consequence.
- "`webSocketUrl` is absent from WebDriver classic" — 0 case-insensitive `websocket` matches. ✓
- "enters only through the … additional-capability slot, defined by WebDriver BiDi §4.1 (S124)" — attribution routed to S124, matching the lesson's M3 (`corpus/lessons/round-32.md:58`); nothing here asks the classic WD to define `webSocketUrl`. ✓

## Lesson Gate row for S126 (`corpus/lessons/round-32.md:19`)

**Holds.** The row's two quotes, checked against my bytes:

1. `§16.1 known handler table, HTML lines 11306-11307: "ignore" "All simple dialogs encountered should be left to the user to handle." (12 words)`
   — verbatim (line 11307, markup-stripped); located exactly at 11306-11307; **12 words** by `wc -w`, matching the stated count.
2. `§7 capabilities table lines 1976-1980: "Describes the session's user prompt handler. Defaults to "dismiss and notify"."`
   — verbatim (lines 1979-1980, markup-stripped, whitespace-normalised); the quote lies inside the stated 1976-1980 span; **11 words**.

Both quotes are ≤25 words; both are admissible. The row's parenthetical (2026-10-26T16:02:14Z, HTTP 200,
1,882,653 B, sha256 `929f…919e`; "ScribeEntry fetched the same bytes at 16:02:34Z") is supported by
`w1/ScribeSrcClassic/fetches.json` and `w1/ScribeEntry/fetch-receipts.md:14`. The Gate row cites §7 only
for the capability table, which **is** in §7 — it does not repeat the §6.7/§7 slip.

## Findings

### D1 — `anchor`/`scope`/`teaches` put line 1798 in §7; it is §6.7 Extensions (severity: low, curation)

Evidence:

- `corpus/SOURCES.md:140` — anchor cell: "§7 additional-capability slot line 1798"; scope cell: "…the §7 slot through which another specification adds a capability"; teaches cell: "…enters only through the §7 additional-capability slot".
- Fetched bytes — `1798: <p>Other specifications may define … additional WebDriver capabilities</dfn>`, enclosed by `1744: <h3 id="x6-7-extensions">6.7 Extensions`, with `1872: <section id="capabilities">…7. Capabilities` after it.
- Origin — the w1 draft carried the same label (`w1/ScribeSrcClassic.md:166` draft cell; `:13-14` prose), so integration copied it; the C1 entry (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:5`) and the Gate row cite only correct locations, so no downstream claim is wrong.

Why it is a defect and not a tradeoff: the contract's `anchor` cell must be an "exact section / heading / page / line plus revision" (`/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:32-33`); here section and line disagree, and a reader who follows "§7" looks 74 lines past the passage.

Smallest safe correction: **append a superseding row** (next unused id — S127 at this revision) whose `teaches` opens `supersedes S126 —` with the slot cited as "§6.7 Extensions line 1798 (additional-capability definition), processed in §7.2 at lines 2291-2297"; other cells repeat S126's corrected text. This is the only append-only path: contract rule 2 (`SOURCES-CONTRACT-v1.md:49-51`) permits in-place change of `status`, `recheck`, `used-by` only. The same URL is admissible in the new row because the frozen checker exempts a `supersedes S…` row from `duplicate_url` (`scripts/check-sources.mjs:296`; self-test `supersedes-correction` at `:53`, `:424`). Do **not** edit the three cells in place, and do not settle for a lesson-only errata: the registry would keep pointing a future miner at §7.

### O1 — the quoted "ignore" sentence is the table's non-normative column (observation, no correction)

`11280: </th><th>Description (non-normative).` heads the known-handler table; the keys are the definition, the behaviour gloss is explicitly non-normative. The row does not claim normative force, and the Gate quote sits inside the table where the marking is visible, so nothing is false. If D1's superseding row is written, add "(description column non-normative, line 11280)" to its anchor for free.

### O2 — `used-by` omits the lesson that cites S126 (observation, not a defect)

`corpus/lessons/round-32.md:19` and `:22` cite S126, but `used-by` lists only the knowledge entry. The contract reads "the knowledge entries or lessons citing the row" (a disjunction), `mined` needs ≥1 path, and S124/S125 are treated identically, so this is convention-consistent. If completeness is preferred, `used-by` is one of the three in-place-mutable cells (contract rule 2) and the old→new is logged in the round lesson.

## Checks run (commands and exit codes)

```
$ git -C <scratch>/clone rev-parse HEAD
b234a58920134424e0d104f137311ff54a16d26b
$ (cd <scratch>/clone && node scripts/check-sources.mjs)
SOURCES_GATE verdict=clean rows=126 tiers=A:111,B:6,C:9 status=queued:15,mined:102,rejected:9 findings=0 file=corpus/SOURCES.md
exit=0
$ grep -oic 'websocket' wd.html
0            # exit 1: no match, as the row claims
$ cmp wd.html wd-dated.html
IDENTICAL    # exit 0
```

No lane script, browser, chromedriver or network service was started; no lane file, lane index or
lane jj state was touched (one scratch clone at the REV, the frozen structural gate run inside it).
Scratch `$HYAKU_SCRATCH/tabi-r32/ReopenS126` was deleted after the receipts in
`.ufo/waves/round-32/w2/ReopenS126/` were copied; `pgrep -fa 'chromedriver|chromium'` shows no
process of mine (the sole match is the host's `earlyoom` command line, which lists `chromium` as
a preferred victim, not a browser this seat started).
