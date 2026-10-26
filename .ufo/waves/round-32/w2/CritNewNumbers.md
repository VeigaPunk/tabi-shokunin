# CritNewNumbers — round 32 w2, numbers the v3 counter cannot read

**Verdict.** I hand-re-derived the numbers in the round-32 text of `SCORECARD.md`,
`SKILL.md`, `LOG.md`, `corpus/README.md`, the C1 entry, `corpus/lessons/round-32.md` and QUALITY 83–86
at `b234a58920134424e0d104f137311ff54a16d26b`: **every number in the holds list below re-derives exactly;
5 numbers do not; 1 committed receipt carries the right numbers under a stale provenance label.** The load-bearing figures all hold:
18 mismatches at the freeze (3 m4 + 15 m1), 0 at REV with 0 deleted lines, 195 findings, 104 refusals,
the two tallies 27/27 and 41/41, 16 of 16 live predicates, 16 distinct row ids, two distinct transcript
digests, the 6,626-byte `ee0edeba…51eca5` PNG, the 8 non-loopback hosts, 17 matrix rows reading `no`,
36 w1 seats, registry 122 → 126, and every spec/source byte count and digest I could re-fetch. The five
that fail are: **`corpus/lessons/round-32.md:98` "Carried at round end: 16 of 27 …, down from 27"**
(the errata block marks 27 *different* items carried and 8 carried items get no disposition; the
derivable remain-count is 20 of 27 — medium); the 195-finding itemization at `corpus/lessons/round-32.md:112`
(parts sum to 189 of 195 — low); two S124 quote word counts and one S125 token count at
`corpus/lessons/round-32.md:17-18` (15/17 and 8 words stated as 16/18 and 12 — low); the claimed-value
set at `LOG.md:2172` ("claimed 17/22/30", actual 13/17/20/22/30 — low); and `corpus/SOURCES.md:138`
("sixteen … commands and one event the driver sends", actual 15 commands and 0 events — low). None of the
five changes the C1 or C2 verdict; the first (medium) reports a routed round-31 defect as closed with a delta
the source does not support, and the other four are counting slips.

## What I attacked

Every number in the round-32 blocks that the frozen v3 calibration counter cannot read (word numerals,
counts of rows/pages/fetches/bytes/digests, "16 of 17", "21 pages", "6,626-byte", "195 findings",
"16 of 27 carried"). Source of truth is always a command over committed bytes at REV, a re-fetch, or a
lane receipt — never another document's prose.

Workspace: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `TMPDIR=/fast/scratch/hyaku/tabi-r32/CritNewNumbers`,
clone `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` +
`git checkout -q --detach b234a589…` (`rev-parse HEAD` = b234a58920134424e0d104f137311ff54a16d26b,
`git status --porcelain` empty). Nothing was run in the lane checkout; no lane file was edited.

### Commands and exit codes

| # | command (at REV unless noted) | exit | reading |
|---|---|---|---|
| 1 | `git -C "$S/clone" checkout -q --detach b234a589…` | 0 | HEAD = b234a589…, worktree clean |
| 2 | `node scripts/check-selfassessment.mjs --rev 4181fffb… --json` | **1** | mismatches 18, findings 195 (m1 109, m2 77, m4 9) |
| 3 | `node scripts/check-selfassessment.mjs --rev b234a589… --json` | 0 | mismatches 0, findings 202 |
| 4 | `node scripts/check-bidi-runtime.mjs --rev b234a589… --baseline d805d1d6… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json` | 0 | population 16, admitted 16, failing 0, `binding: null`, `live: true` |
| 5 | `node .ufo/waves/round-32/measure/c1-distinct.mjs . <entry> <receipt>` | 0 | 16 yes / 16 distinct ids / 0 dup / 2 paths / 2 digests / driver `55dbef88…` ≠ gate `2f25af5a…` |
| 6 | `node scripts/check-bidi-runtime.mjs --selftest` | 0 | `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27` |
| 7 | `node scripts/check-selfassessment.mjs --selftest` | 0 | `SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41` |
| 8 | `git diff --numstat 4181fffb… b234a589… -- SKILL.md corpus/README.md SCORECARD.md LOG.md` | 0 | 106/0, 62/0, 135/0, 41/0 → 0 deletions |
| 9 | `git diff --name-only 4181fffb… b234a589… -- scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs` | 0 | empty (0 files) |
| 10 | `sha256sum scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs scripts/bidi-loopback-round32.mjs` | 0 | `2f25af5a…c393`, `77b5c8ed…c6a9`, `55dbef88…070a` (first two = claims `frozenDigests`) |
| 11 | `jq` tallies over `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` | 0 | m1 109 (21 superseded, 46 matched, 42 mismatched → 15 counted + 24 ambiguous + 3 outside `RUNNABLE_GATE`); m2 77 (76 refused, 1 matched); m4 9 (3 counted, 5 matched, 1 refused) |
| 12 | `jq` over the five `baseline/c1-J*.json` controls | 0 | J1 0/0/exit 1; J2 16/0/16 `s1-source-row`; J3-offline 16/16 `live:false`; J3-live 0/16 `t3-binding`; J4 0/16 `t1-receipt` — all as the LOG table states |
| 13 | `python3` decode of both transcripts' `captureScreenshot` `data` | 0 | 6,626 B each, sha256 `ee0edeba…51eca5` each, IHDR 640×480 each |
| 14 | `awk`/`grep` on `corpus/knowledge/webdriver-bidi-capability-matrix.md` | 0 | 17 rows `:60-76`, last column `no` ×17; `diff` of `:60-76` vs baseline → identical |
| 15 | `jq '.members … group_by(.role)' .ufo/waves/round-32/w1/swarm-registry.json` | 0 | 12 scribe + 8 executor + 5 critic + 3 connector + 3 reviewer + 2 mutation-tester + 2 scout + 1 sentinel = 36; `w1-spec.json .items` = 36 |
| 16 | `git show d805d1d6…:corpus/SOURCES.md \| grep -c '^\| S'` / at REV | 0 | 122 / 126 |
| 17 | `git ls-tree --name-only 4181fffb… corpus/knowledge/ \| grep -c '\.md$'` / at REV | 0 | 50 / 51 |
| 18 | `grep -n` on `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` + `python3` disposition parse | 0 | 43 items; bold markers: 27 `Carried`, 12 `Corrected here`, 4 `No action` |
| 19 | `awk` on `search-log.tsv` / `census.txt` of w1 `ScribeSrcChromeDriver` | 0 | 41 fetches = 24×200 + 15×404 + 2×301; `websocketurl` ×2 only on `.../downloads` |
| 20 | `curl` re-fetch of 8 URLs (table below) | 0 | every byte count and sha256 re-derived; 200 everywhere |
| 21 | `node --input-type=module -e 'import {FIXTURE_SHA256} …'` | 0 | `343cbced…2843` = receipt `fixtureSha256` |

## Numbers that re-derive (holds)

Freeze/after sets, all from runs 2–3 and 11:

- **18 = 3 m4 + 15 m1** at `4181fffb`; **0 mismatches / 0 deleted lines** at REV (runs 2, 3, 8).
  The 3 counted m4 are `SCORECARD.md:1473`, `:1515`, `:1576` (claimed `inactive`, derived `active`);
  the 1 refused m4 is `:1456` (`no "Axes at round start:" with all six axes`), exactly as the lesson says.
- **195 findings** at the freeze (109 + 77 + 9) and **104 refusals** (27 m1 + 76 m2 + 1 m4) — both hold;
  the 27 m1 refusals split 24 `ambiguous script association` + 3 outside `RUNNABLE_GATE`, and those three
  are exactly `LOG.md:972` (`selftest-measurement-binding.mjs`), `SKILL.md:2027` (`freshness-witness.mjs`),
  `SKILL.md:2028` (`webmcp-invoke-round18.mjs`). 46 m1 matched, 21 m1 cleared, 15 m1 + 3 m4 counted — hold.
- The 15 counted m1 lines are exactly `SCORECARD.md:1439,1465,1486,1564` + `SKILL.md:2479,2515,2530,2545,2576,2578,2590,2594,2598`
  + `corpus/README.md:613,668`; their claimed values are 17, 22, 22, 30 / 13, 17, 20, 22, 30, 30, 30, 30, 30 / 17, 30.
- **"the 17, 22, 22 and 30 figures"** (`SCORECARD.md` correction) hold; **"the 13, 17, 20, 22 and 30 figures"**
  (`SKILL.md` correction, nine rows) hold; **"the 17 and 30 figures"** (`corpus/README.md` correction) hold.
- **"eleven cases", 30 → 41**: 41 − 30 = 11, and the gate prints `cases=41 passed=41` (run 7).
- **27/27** (run 6) and the two v3 refusal case ids in QUALITY 85 are present and PASS in the capture.

C1 sets, from runs 4, 5, 10, 13 and 14:

- **16 of 16 admittable predicates held live**, population 16, failing 0, `binding: null` (a null binding is
  only produced after the gate's own live first screenshot and `chromedriverVersion` matched the committed
  runs — `scripts/check-bidi-runtime.mjs:551-557`), so "16 of the 17; R16 has no BiDi command" and
  "two cold runs bound by identical first-screenshot bytes" both hold.
- **16 distinct row ids, 0 duplicate listings, 2 transcript paths, 2 distinct transcript digests**;
  **driver `55dbef88…070a` ≠ gate `2f25af5a…c393`**; driver imports only `FIXTURE_SHA256, VIEWPORT, serveFixture`
  and names neither `liveRecord` nor `PREDICATES` — QUALITY 86's required plain counts hold at REV.
- **6,626-byte PNG, sha256 `ee0edeba…51eca5`, IHDR 640×480, identical in both runs**;
  `fixtureSha256` `343cbced…2843` = `FIXTURE_SHA256`; `50 ms` ready promise at `scripts/check-bidi-runtime.mjs:112`.
- Entry tables: **17** verdict rows, **17** "does not show" rows, **5** unknowns (U1–U5), **4** launcher flags,
  **4** post-freeze gate limits — all counted, all as written.
- Matrix: **17** rows at `:60-76`, each `locally measured` cell `no`, and `:60-76` byte-identical to `d805d1d6`
  (the file gained a 95-line dated addendum, so "unchanged bytes" is true of the cited lines, not the file).
- Controls table (`LOG.md:2141-2149`): all six readings and exits re-read from the receipts (run 12).

Provenance/claims:

- Frozen digests byte-identical at REV and at `5ad1fcbf` (run 10), matching `baseline/frozen-counter-sha256.txt`.
- **Registry 122 → 126** (run 16), **knowledge entries 50 → 51** (run 17), census `ok` exit 0.
- **Axes at round start** depth 9 / coverage 9 / operability 9 / freshness 9 / calibration 9 / adjacency 8 —
  identical in `SCORECARD.md` and `claims.json`; the corrections' cited input lines `:1472`, `:1514`,
  `:1574-1575` read depth 8 / coverage 9 / operability 8,8,9 / freshness 8,9,9 / calibration 9 / adjacency 8 —
  exactly as the three corrections say, so M4's number-drift description is accurate.
- **Four gate rows at round 24–25** (`:1243`, `:1249`, `:1306`, `:1314`); no `First-working round` above 25 before
  this round's row; **"last entries round 25"** holds.
- **36 w1 seats** with the stated role split, **36 items** in `w1-spec.json` (run 15).
- **Binaries**: `Chromium 154.0.8037.97 Arch Linux`; `ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})`
  — the version string quoted in the entry/LOG is verbatim; mapper strings `bidi-mapper-path`,
  `window.runMapperInstance`, `Failed to initialize BiDi Mapper`, `BiDi-CDP Mapper` are present and
  `strings /usr/bin/chromedriver | grep -o 'chromium-bidi[/@][^",; )]*'` exits **1 with no output** (entry's "no match" holds).
- **Mapper README**: `Version: 17.0.2`, `Date: 2026-07-06`, `Revision: 237806b…`, 1,957 B decoded,
  sha256 `be5e15ca…845e` — all re-fetched and identical.
- **8 non-loopback Google hosts** (`entry §1`): `SentinelPerimeter.md:125-127` lists exactly 8 hostnames
  (4/4/8/4/8/4/16/1 requests); the entry's 4 named examples are among them.
- **21 ChromeDriver docs pages, 200 each; `webSocketUrl` only on `/downloads`, twice; 15 × 404; child sitemaps 500**:
  re-derived — `grep -o 'href="/docs/chromedriver[^"]*"' | sort -u | wc -l` on the re-fetched landing page
  returns **21**; `search-log.tsv` census is **{200: 24, 404: 15, 301: 2} = 41**;
  committed `raw/developer.chrome.com_docs_chromedriver_downloads.html` holds `websocketurl` **2×**.
- **S123** 25,265 B / `f633915d…b207`; header line 6 `Request for Comments: 9309`, line 11 `September 2022`;
  `June 2022` **only** at lines 554 and 559 (count 2). **S124** 4,235,856 B / `dc1077db…24d4`, identical at
  `/TR/webdriver-bidi/` and `/TR/2026/WD-webdriver-bidi-20261008/`, revision `f922e6af…f171` present, §7.3 and
  §7.9 headings present. **S125** 90,944 B raw `?format=TEXT`, decoded 68,207 B sha `7b40e94c…abb5`, quote at
  `:288-289` inside `if (session->web_socket_url)` at `:287`, mapper-target comment at `:407`. **S126** 1,882,653 B /
  `929f2f0b…919e`, `ignore` handler row at HTML `:11306-11308`, capability text at `:1976-1980`; **0** case-insensitive
  `websocket` matches in the dated classic WD and **0** `websocketurl` in the editor's draft (1,882,259 B, as stated).
- **"70-byte TMPDIR: 2f8535c5 fails, 5ad1fcbf runs 28 commands"**: `measure/c1-socket-path-red-green.txt` states the
  70-byte path and 28 commands; both transcripts carry **28 `send` frames** each, so the 28 is independently true.
- QUALITY 85's **39/41, exit 3** is reproduced verbatim in `measure/c2-refusal-mutant.txt`; QUALITY 86's
  **"four constructions admitted 16"** is `w1/CritC1Forgery.md:48-51` (v1–v4, exit 0, admitted 16).
- **"Five error codes and two silent failures"** (`SKILL.md`): items 1–5 are error signatures, 6–7 are silent — holds.

## Numbers that do not re-derive

### D1 — medium — `corpus/lessons/round-32.md:98`, `LOG.md:2107`, `LOG.md:2196`

**Claim.** "Carried at round end: 16 of 27 (E1, E3–E10, E12–E14, E17, E18, E19's `passed=` arm, E20), down
from 27"; "the 27 carried errata" / "the 27 carried errata → dispositioned by wave-1 scribes".

**Derivation.** `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` holds **43** items (E1–E43), not 27, and its
bold dispositions are **27 `Carried`**, 12 `Corrected here`, 4 `No action`. The 27 carried ids are
**E4, E6–E10, E12–E14, E16–E18, E20–E24, E26–E28, E30–E33, E35, E37, E38** — *not* E1–E27: eight of E1–E27
(E1, E2, E3, E5, E11, E15, E19, E25) are `Corrected here`/`No action`, and eight carried items lie outside the
range. The round-32 disposition table closes 7 of the carried 27 (E16, E21, E22, E23 refused/landed;
E24, E26, E27 landed), so the derivable remain-count is **20 of 27**: the 12 carried items the final list does
name (E4, E6–E10, E12–E14, E17, E18, E20) **plus 8 carried items that receive no disposition anywhere**
(E28, E30, E31, E32, E33, E35, E37, E38). The final list's other four names (E1, E3, E5, E19's arm) are not
carried items at all. The wave-1 record says the same thing from the other side: `w1/ScribeErrataA.md:98`
("Queue items **E10–E43** are not dispositioned by me") and `w1/ScribeErrataC.md:118` ("Queue items outside
E19–E27 (E1–E18, **E28–E43**) belong to sibling scribes"). So "27 carried" is right as a *count* and wrong as
an *identity*, and "16 of 27 … down from 27" cannot be derived: 20 of the 27 carried remain, of which 8 were
never opened.

**Smallest safe append-only fix.** Append one correction paragraph after `corpus/lessons/round-32.md:98`
(and one line in the LOG round-32 entry beside `:2196`), e.g.: "The errata block carries 43 items, 27 marked
`Carried` (E4, E6–E10, E12–E14, E16–E18, E20–E24, E26–E28, E30–E33, E35, E37, E38). The table above covers
E1–E27 by number, so 19 of the 27 carried are dispositioned and eight — E28, E30, E31, E32, E33, E35, E37,
E38 — are not; carried at round end is 20 of 27, not 16." State no other numeral in the paragraph (the v3
supersession matcher binds any `N/M`), and do not touch `claims.json` (frozen) or the errata file.

### D2 — low — `corpus/lessons/round-32.md:112-116`

**Claim.** "The frozen reading carries 195 findings: 104 refused — 27 m1 …, 76 m2 …, 1 m4 … — plus 46 m1
matched and 21 m1 cleared only by a later correction paragraph; 15 m1 and 3 m4 were counted."

**Derivation.** The total 195 is right (109 + 77 + 9). The itemization sums to **189**: 104 + 46 + 21 + 15 + 3.
The six findings it omits are the **1 matched m2** (`corpus/evidence/round-23/c1-measurements.json`, command
`git cat-file -e a89f193:scripts/round-evidence-audit.mjs`, claimed = observed = 128) and the **5 matched m4**
(`SCORECARD.md:1126`, `:1215`, `:1277`, `:1333`, `:1382`, claimed = derived = `inactive`). An accounting that
opens "carries 195 findings:" should classify all 195.

**Smallest safe fix.** Append: "the remaining six are matches the list above does not classify: one m2 command
inside the re-run grammar and five m4 round groups whose stated `inactive` re-derives."

### D3 — low — `corpus/lessons/round-32.md:17-18` (Gate table quote lengths)

**Claim.** S124 Abstract "(16 words)"; S124 §4.1 "(18 words)"; S125 quote "(12 tokens)".
**Derivation.** The quotes are verbatim in the fetched bytes, but their lengths are 15, 17 and 8 whitespace
words (S125: 9 alphanumeric runs, 19 C/JS tokens — no standard tokenization yields 12; the column header's own
unit is "≤25 words"). Counting the lesson's own strings: `"This document defines … user agents."` = 15;
`"WebDriver clients opt in … with value true."` = 17; `caps.Set("webSocketUrl", "ws://" + session->host +
"/session/" + session->id);` = 8. S126's "(12 words)" is correct, so the error is local to S124/S125.

**Smallest safe fix.** Append: "quote lengths at `:17-18` re-count to 15 and 17 words, and 8 words for the
S125 code quote (the column's unit is words, not tokens)."

### D4 — low — `LOG.md:2171-2172`

**Claim.** "15 m1 stale `check-selfassessment` tallies (… — claimed 17/22/30 against observed 41 …)".
**Derivation.** The 15 lines claim **13, 17, 20, 22 and 30** (`SKILL.md:2479` = 13; `SKILL.md:2530` = 20;
plus 17 ×2, 22 ×2, 30 ×7 and README 17/30). "17/22/30" omits two of the five values and would read as a
three-way claim the readings do not support. (The related "the 15 induced by v3's 11 added cases, 30 → 41"
does re-derive: 30 + 11 = 41, and the SKILL/README correction paragraphs state 13 and 20 themselves.)
**Smallest safe fix.** Append: "the claimed figures across those 15 lines are 13, 17, 20, 22 and 30."

### D5 — low — `corpus/SOURCES.md:138` (S124 `scope` cell)

**Claim.** "Protocol semantics of the **sixteen** WebDriver BiDi commands and **one event** the round-32 C1
driver sends".
**Derivation.** Both run transcripts carry 28 `send` frames each and **15 distinct BiDi methods**
(`session.subscribe`, `browsingContext.getTree/setViewport/navigate/captureScreenshot/locateNodes/traverseHistory/handleUserPrompt`,
`script.evaluate`, `input.performActions`, `network.addDataCollector/addIntercept/continueRequest/getData`,
`storage.getCookies`); **no event is sent** (every `send` frame carries `method`; events appear only as
subscription names and as `recv` notifications). Under no reading is the count 16 commands and 1 event.
**Smallest safe fix.** Append to the row-less end of `corpus/SOURCES.md`: "S124 scope correction — the
round-32 C1 driver sends 15 distinct BiDi commands and no event; 28 sends per transcript."

## Observation (not a number defect)

`measure/c1-distinct-red-green.txt` labels its green block "lane working tree (pre-commit; re-run at the
measured revision in measure/)" and the committed file contains **no** REV re-run. I re-ran
`c1-distinct.mjs` in the clean clone at REV (run 5): every field is identical (16/16/0/2/2/2,
`55dbef88…`, `driverEqualsGate:false`, `driverReexports:false`), so QUALITY 86's numbers are sound; what is
missing is the provenance block the label promises. Cheapest fix: append the REV run (with `rev=` and
`porcelain=0`) to the same file.

## Fetch receipts (read-only HTTPS GET, `curl -q -sS --proto =https`)

| URL | UTC | status | bytes | sha256 |
|---|---|---|---|---|
| https://www.rfc-editor.org/rfc/rfc9309.txt | 17:18:06Z | 200 | 25,265 | f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 |
| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/bidimapper/README.chromium?format=TEXT | 17:18:06Z | 200 | 2,612 raw / 1,957 decoded | 7214c51a…(raw) / be5e15ca920b888db1fe2bbf00535397fa9912f67c7aff8c6ec8b401676c845e (decoded) |
| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc?format=TEXT | 17:18:14Z | 200 | 90,944 raw / 68,207 decoded | c5d66f5a…(raw) / 7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5 (decoded) |
| https://www.w3.org/TR/webdriver-bidi/ | 17:18:44Z | 200 | 4,235,856 | dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4 |
| https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ | 17:24:01Z | 200 | 4,235,856 | dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4 (byte-identical) |
| https://www.w3.org/TR/webdriver2/ | 17:18:44Z | 200 | 1,882,653 | 929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e |
| https://w3c.github.io/webdriver/ | 17:18:44Z | 200 | 1,882,259 | d49b731e12c386b0fc16ea680d304f5c43bd26a3a506f4ec900a05f4ca1c4dd6 |
| https://developer.chrome.com/docs/chromedriver | 17:25:35Z | 200 | 103,191 | 0c459bbb2223c4ed7d1125cb551d3c631e6f9d566f84589c2160c018f4c20bae |

## Hygiene

- No tool installed or upgraded (no `pacman`, no `uv tool`, no binary added); nothing to record under the
  tooling directive.
- Browser: the only chromium/chromedriver started was by the frozen gate's own `--live` leg (run 4), which
  tears down its driver and profile; `pgrep -fa 'chromedriver|chromium'` after all work shows exactly one
  line, `/usr/bin/earlyoom -r 3600 …` (not mine).
- Scratch `/fast/scratch/hyaku/tabi-r32/CritNewNumbers` deleted after copying receipts to
  `.ufo/waves/round-32/w2/CritNewNumbers/` (`c1-live.json`, `c2-at-freeze.json`, `c2-at-rev.json`,
  `fetch-digests.txt` inline above).
- Lane checkout untouched: no write, no git transaction, no jj command in
  `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
