# R57QuarD — QUARANTINE hand-check, part D (rows 31-38 of 38)

Seat: R57QuarD (executor, leaf). Round 57 wave w1. Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Lane base revision
`ef43ececde883cc0368c6c7cfbabe30ef937b717`.

**Disposition: ADOPT NOTHING.** This seat wrote verdict receipts only. No
register row, staged row, knowledge note, SOURCES row or data file was created,
modified or deleted anywhere. Every campaign input was read-only.

Owned paths written: `.ufo/waves/round-57/quarantine/R57QuarD/` (4 instruments,
8 row JSONs, 1 summary) and this report. Scratch
`/fast/scratch/hyaku/tabi-r57/R57QuarD/` was created for the fetches and is
deleted on exit.

## 1. Scope and method

Rows assigned: lines 31-38 of `.ufo/waves/round-57/assimilation/quarantine-slice`
→ `S164 S165 S166 S167 S174 S175 S176 S171`.

Per row, hand-checked exactly per the frozen part-A contract:
1. Register row read in full at
   `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
   (READ-ONLY): lane, round, id, class, cited URL, quote cell split on `<br>`, note.
2. The row's cited URL fetched once and then a second time (guarded: http(s)
   only, every resolved A/AAAA address checked against loopback / RFC1918 /
   link-local / metadata ranges before the request; no cookies, no POST, no
   credentials).
3. Every fragment run through the frozen 7-fold ladder (f0 exact bytes, f1
   case-insensitive, f2 whitespace-runs collapsed, f3 HTML entities decoded,
   f4 tags stripped then f2, f5 f4 case-insensitive, f6 backtick/quote/
   punctuation stripped then f2) — hit count recorded per fold per fragment.
4. Pairing cross-check against the staged row in
   `/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` (READ-ONLY):
   register URL vs staged URL, register quote cell vs staged anchor cell.
5. One verdict per row from the closed vocabulary, plus a JSON receipt per row.

Results were identical across the two fetches for all 12 fragments (same
per-fold hit tables), so no verdict rests on a single fetch.

### Instruments (all in `.ufo/waves/round-57/quarantine/R57QuarD/`)

| file | sha256 | role |
|---|---|---|
| `qd-ladder.py` | `4cfb61f342bca0d6661ec8e6813c68a571fc70818a3e0adba248ad640f82a428` | the 7-fold ladder; fold functions byte-identical to `R57QuarA/laddr.py`; adds cross-bin search, near-match diagnostic, row JSON output |
| `build-spec.py` | `316cc8ec40703b57b54b7e8ce8b7eab8db0f9da42e75fe8e3155035fd70cd74d` | parses the register + staged rows into the ladder spec |
| `annotate.py` | `60d2fbc18d370d4f24c7e3987e07ab23e7417232eb652f8beaa850b3b4f75261` | merges HTTP measurement, verdict reasons, note-side recheck, row-specific evidence |
| `qd-fetch.py` | `dd49fcd8cbdde8e41b650cb2e156cae6a0041bcee1c457e3c502d77fae55e562` | guarded fetcher (address-family guard before the request) |

Reproduce:

```
python3 .ufo/waves/round-57/quarantine/R57QuarD/qd-fetch.py <scratch>/bin <SID> '<url>'
python3 .ufo/waves/round-57/quarantine/R57QuarD/build-spec.py --scratch <scratch> --out <scratch>/rows-spec.json
python3 .ufo/waves/round-57/quarantine/R57QuarD/qd-ladder.py --spec <scratch>/rows-spec.json --out .
python3 .ufo/waves/round-57/quarantine/R57QuarD/annotate.py --scratch <scratch> --out .
```

Cross-instrument agreement: `qd-ladder.py` and the sibling seat's
`R57QuarA/laddr.py` were run on 5 (file, fragment) pairs covering a located
ASCII hit, a located CJK hit, a zero-hit CJK miss, a short ASCII hit and a
404-body hit. All five produced identical per-fold hit counts (PASS). The two
half-slices of the 38-row duty were therefore checked by one instrument.

## 2. Verdict roll-up (8 rows)

| id | register class | HTTP | verdict | one-line reason |
|---|---|---|---|---|
| S164 | `payload-absent` | 200 | **mispaired** | fragment absent from the cited zh-CN page (and from its 2026-10-12 archive); byte-present at the NEXT row's source S165 |
| S165 | `payload-absent` | 200 | **mispaired** | fragment is anchor prose, not a quotation: byte-exact substring of the STAGED anchor cell of row S166; no page carries it |
| S166 | `payload-absent` | 200 | **mispaired** | `evaluate_webmcp` absent from weel.co.jp (zero `evaluate`); byte-present 4× at the NEXT row's source S167 |
| S167 | `payload-absent` | 200 | **mispaired** | both fragments absent from claude.com; byte-present at the NEXT row's source S168 |
| S174 | `payload-absent` | 200 | **mispaired** | fragment 1 at the NEXT row's source S175; fragment 2 one character off (審核佪列 U+4F6A vs source 審核佇列 U+4F47) — typo inherited from the knowledge note |
| S175 | `payload-absent` | 200 | **mispaired** | fragment 2 is S176's anchor text and byte-present on S176's page; fragment 1 is this row's OWN sentence, 65/66 characters, one-character transcription error |
| S176 | `payload-absent` | 200 | **mispaired** | zero `origin trial` occurrences on web-mcp.net; all three fragments byte-present at the NEXT row's source S177 |
| S171` | *prose: "the cited source could not be fetched…"* | **404** | **unreachable** (confirmed) | 207-byte 404 body, no WebMCP/tool text; record still live on the site's API route, fields unchanged |

Register rows checked: 38 tabi data rows confirmed present in the register
(matching the frozen filter; the r56 prose count of 39 included the by-lane
summary row — reconciled).

**Not one of my 8 rows is a fabrication.** All 12 quoted fragments are absent
from their cited source under the whole ladder, but 9 of the 12 are byte-present
on a *different* cited page, and 11 of the 12 are byte-present in the *next*
staged row's anchor cell. The defect is the register's quote↔row pairing, not
invented source text.

## 3. Structural finding: the register's quote column is shifted by one row

The register's `quote(s)` cell for row *N* is carried by the staged
`SOURCES.append.md` row *N+1*'s anchor/scope cell — a deterministic one-row
offset between the quote column and the id/URL columns.

Evidence inside my slice (register line → staged line of the carrier):

| register row | quote fragment | carried by staged row | staged line |
|---|---|---|---|
| S164 (`register:208`) | `With the extension, you can:` | S165 anchor (`§"With the extension, you can:" bullets…`) | 70 |
| S165 (`:209`) | `(the verification environment and the flag note)…; §` | S166 anchor (`§"検証1" (the verification environment and the flag note)…`) | 71 |
| S166 (`:210`) | `evaluate_webmcp` | S167 anchor (`§"evaluate_webmcp" description…`) | 72 |
| S167 (`:211`) | both Japanese fragments | S168 anchor/teaches (`§"エージェント対応の…"`, `"予測可能で機械可読なシグナル"`) | 73 |
| S174 (`:212`) | both fragments | S175 anchor (`§"敏感動作留一道人工關卡"`, `§"你的驗證碼、CSRF token、審核佪列…"`) | 80 |
| S175 (`:213`) | `Explicit Tool Registration` | S176 anchor (`§"Explicit Tool Registration"…`) | 81 |
| S176 (`:214`) | all three origin-trial fragments | S177 anchor (`§"Understand origin trials"`, `§"Third-party origin trials"`) | 82 |

The same one-row offset reproduces outside my slice on a read-only structural
check across all 38 tabi data rows (no verdicts issued for rows other than
mine): 30 of the 37 rows that have a quote cell are carried **entirely** by the
next staged row's cell; the other 7 carry none or only some of their fragments
— S111 0/2, S114 0/1, S118 0/3, S124 1/2, S140 0/1, S154 0/1, S175 1/2. S171
has no quote cell at all (malformed row, §4). This is a *register-generation* defect — it is visible
without fetching anything — and it explains the `payload-absent` class
mechanically: the census compared row N's quote against row N's source, so the
next row's anchor text could never match.

Consequence for the frozen verdict vocabulary: `mispaired` is defined in the
part-A contract as *"a fragment located at the STAGED url but not the
register's"*. In my slice **register URL == staged URL for all 8 rows**
(`pairingCrossCheck.urlsEqual = true`), so that trigger never fires. The
mispairing that actually occurs is quote↔row, with the carrier being either the
next row's *source URL* (9 fragments) or the next row's *staged anchor cell*
(11 fragments; S165's prose fragment has no page carrier at all). I used
`mispaired` for these rows with the carrier recorded structurally
(`fragments[].crossBins[]`, `pairingCrossCheck.nextStagedRow`) and flagged the
definition gap to the L1 as a cross-seat contract delta.

## 4. Row detail

### S164 — mispaired (`quarantine/R57QuarD/S164.json`)

- Cited URL `https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn`
  → 200, 136,393 B, `text/html; charset=utf-8`; second fetch 136,393 B (byte
  hashes differ: the page carries per-request tokens; the ladder tables are
  identical).
- Fragment `With the extension, you can:` — 0 hits under f0-f6.
- Carrier: S165's source `https://googlechromelabs.github.io/webmcp-tools/demos/explainer/`,
  f0, 1 hit, line 141 byte 6126. Also S165's staged anchor cell (line 70).
- Archive probe: the 2026-10-12 Wayback snapshot of the cited URL
  (`web.archive.org/web/20261012071302/…`, 128,768 B,
  sha256 `e1e50897…b580f9`) also has 0 hits for the fragment, so the absence is
  not page drift.
- Note-side: the knowledge note's quotation
  `访问仅在实时浏览器标签页中提供的实时会话数据、 Cookie 和 DOM 元素` (its
  Markdown soft wrap becomes one space after `、`). Absent from the live page at
  every fold — the page reports 最后更新时间 2026-10-27, four days after the
  note's 2026-10-23 fetch. On the 2026-10-12 snapshot, with that one wrap space
  removed, the sentence is byte-present at **f0, line 2553, byte 104982**
  (`archiveProbe.noteQuoteOnSnapshot.quoteWithSoftWrapSpaceRemoved`); with the
  space kept it is 0 hits (a one-whitespace divergence). So the note was
  accurate when written and the page changed. Not a fabrication on either side.

### S165 — mispaired (`S165.json`)

- 200, 19,717 B. Fragment 0 hits f0-f6.
- The fragment is not a quotation of any page: it is a truncated, byte-exact
  substring of the **staged anchor cell of row S166** (`SOURCES.append.md:71`),
  ending at `; §`. S166's own source was also searched: 0 hits f0-f6.
  `carrierKind = staged-anchor-cell`, no URL carrier.
- Note-side: two of the note's three quotations locate on the explainer page —
  `With the extension, you can:` f0 (line 141) and `alongside the page's URL,
  title, and origin permission scope` f2. The third, ``by monitoring the
  `document.modelContext` API``, misses under the frozen folds because the note
  wraps the identifier in Markdown backticks that the source renders as
  `<code>` tags; the boundary-tolerant reading `markdownAware` locates it
  (`noteSideRecheck.items[1].altLocates`).

### S166 — mispaired (`S166.json`)

- 200, 299,008 B. `evaluate_webmcp`: 0 hits f0-f6 (the page has no `evaluate`
  substring at all).
- Carrier: S167's source `https://claude.com/ja/marketplace/connectors/webmcp-evaluator`,
  f0, 4 hits; and S167's staged anchor cell (line 72).
- Note-side: 3 of the note's 4 quotations locate at f0. The fourth — the flag
  sentence — misses only because the source marks the phrase with
  `<strong>…をEnabled</strong>にして…` while the note has a space there; the
  boundary-tolerant reading `tagsAsSpace` locates it, so **the note is faithful**
  and the miss is a tag-stripping convention (frozen f4 removes tags with no
  space), not a note defect.

### S167 — mispaired (`S167.json`)

- 200, 381,718 B. Both fragments 0 hits f0-f6; the page has 0 occurrences of
  `機械可読` and `シグナル`. Its `エージェント対応` hits are meta descriptions
  about connector readiness, not the quoted sentence.
- Carrier: S168's source
  `https://developer.chrome.com/blog/agent-ready-toolkit?hl=ja`, f0, 2 hits
  (line 2897) and 1 hit (line 2899); and S168's staged anchor/teaches cells
  (line 73).
- Note-side: **both note quotations miss under the frozen folds and under every
  boundary-tolerant reading** — they carry character substitutions, not
  markup artefacts. The page has `公開禁止リスト（…）` and the note `公开禁止
  リスト （…）` (1 substitution: `开` U+5F00 for `開` U+958B, plus the wrap
  space); the page has `検出済みのツール、追加すべきツール、公開してはならない情報`
  and the note `检测済みのツール、追加すべきツール、公开してはならない情報`
  (3 substitutions: `检`/`検`, `测`/`出`, `开`/`開`). These are note-side
  character corruptions of real page text — the facts are there, the bytes are
  wrong.

### S174 — mispaired (`S174.json`)

- 200, 605,319 B. Fragment 1 `敏感動作留一道人工關卡`: 0 hits on the cited page;
  f0 1 hit on the NEXT row's source `https://www.np.com.tw/…` (line 711) and in
  S175's staged anchor (line 80).
- Fragment 2 `你的驗證碼、CSRF token、審核佪列、速率限制全部照常運作`: 0 hits in
  every fold, on both pages — **one character off**. The nearest source window
  (`你的驗證碼、CSRF token、審核佇列、速率限制全部照常運作`) differs only at
  index 19: register `佪` U+4F6A vs source `佇` U+4F47 (see
  `fragments[1].crossBins[0].nearMatch`). The same `佪` typo is in the campaign
  knowledge note `webmcp-validation-and-confirmation-r15.md:20`, so the register
  copied the note's transcription error.
- Note-side: the note's own quotations locate on the cited page (§對輸入做真正的
  驗證 f0 ×6, §小心跨來源暴露 f0 ×6; the `inputSchema…` sentence at f4).

### S175 — mispaired (`S175.json`)

- 200, 73,627 B (`text/html; charset=UTF-8`).
- Fragment 1 is **this row's own sentence**, one character off: prefix-anchored
  near-match at line 711, char 39895, 1 mismatch of 66 characters — register
  `審核佪列` (U+4F6A) vs source `審核佇列` (U+4F47). Recorded as
  `transcriptionError`, inherited from the knowledge note
  (`webmcp-validation-and-confirmation-r15.md:20`). The byte-exact source
  sentence is
  `WebMCP 沒有繞過任何既有防護。它吃的是瀏覽器當下的登入狀態，你的驗證碼、CSRF token、審核佇列、速率限制全部照常運作。`
- Fragment 2 `Explicit Tool Registration`: 0 hits on this page; f0 1 hit on the
  NEXT row's source `https://web-mcp.net/security-guide` and in S176's staged
  anchor (line 81). This is what makes the row `mispaired`.
- Note-side: the section name `敏感動作留一道人工關卡` locates at f0 (line 711).
  The `toolautosubmit` sentence misses under the frozen folds for whitespace
  only (one soft-wrap space after `、` plus the `<code>` boundary); the
  boundary-tolerant readings `tagsAsSpace_whitespaceStripped` and, on the raw
  text, `whitespaceStripped` locate it, so no content differs there. The note's
  separate `佪`/`佇` error is the one that reaches the register.

### S176 — mispaired (`S176.json`)

- 200, 385,056 B. Zero occurrences of `origin trial` in any case on web-mcp.net;
  all three fragments 0 hits f0-f6.
- Carrier: S177's source
  `https://developer.chrome.com/docs/web-platform/origin-trials`, f0 39 / 1 /
  4 hits (lines 78 / 1874 / 1878); and S177's staged anchor cell (line 82).
- The row's own page does carry its own anchor text: `Explicit Tool
  Registration` f0 once, `requestUserInteraction` 16 times.
- Note-side: `Explicit Tool Registration` locates at f0. The
  `requestUserInteraction() Forces the browser …` sentence misses under the
  frozen folds only because the source splits it with inline tags; the
  `tagsAsSpace` reading locates it, so the note is faithful.

### S171 — unreachable, confirmed, malformed row (`S171.json`)

- `registerRowMalformed: true`. The register row is 5 cells where the header has
  7: the id cell reads ``S171` `` (stray trailing backtick), the class cell holds
  the unreachable-family prose `the cited source could not be fetched, so no
  quote was checked` instead of a backticked class token, and there is no quote
  cell and no note cell.
- Cited URL `https://chromestatus.com/features/5117755740913664` → **HTTP 404**,
  207 B, `text/html; charset=utf-8`, byte-identical on a second fetch
  (sha256 `e9639e3c…237ab80`). The body is a Flask 404 page
  (`<title>404 Not Found</title>`); **no WebMCP or tool-related text exists in
  it** (`WebMCP` 0, `webmcp` 0, `tool` 0, `origin trial`/`origin-trial` 0,
  `chromestatus` 0). Verdict: `unreachable` — the register's class stands.
- The citation is nevertheless recoverable, and the record still says what the
  note quotes:
  - site root `https://chromestatus.com/` → 200, 3,710 B SPA shell;
  - `https://chromestatus.com/feature/5117755740913664` (singular) → 200, the
    same SPA shell — so the cited `/features/<id>` path is not a route;
  - `https://chromestatus.com/api/v0/features/5117755740913664` → 200,
    `application/json`, 21,011 B, `"name": "WebMCP"`, with
    `browsers.chrome.status.text = "Proposed"`,
    `browsers.chrome.origintrial = false`, `origintrial = null`,
    `standards.maturity.text = "Specification being incubated in a Community
    Group"`, `updated.by = fbeaufort@google.com`,
    `updated.when = 2026-11-02 16:04:35.890651`.
  - The note's field quotations locate in that body: the `status` quote f0
    (byte 19794), the `origintrial` quote f0 (byte 19739), the `maturity` quote
    at f6.
- Disposition: a later round may re-point the row's URL to the live route. No
  change made this round (ADOPT NOTHING).

## 5. The contracted question: does the quote text appear in the campaign knowledge tree?

Yes, for most fragments — which is exactly why they are not fabrications. Under
`/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/` (READ-ONLY grep):

| fragment | file carrying it |
|---|---|
| `With the extension, you can:` | `corpus/knowledge/webmcp-tool-listing-paths-r14.md` |
| `evaluate_webmcp` | `corpus/knowledge/webmcp-tool-approval-hints-r14.md` |
| `エージェント対応のウェブサイトを監査、改善、デバッグする`, `予測可能で機械可読なシグナル` | `corpus/knowledge/webmcp-journey-determinism-r14.md` |
| `敏感動作留一道人工關卡`, `審核佪列`, `Explicit Tool Registration` | `corpus/knowledge/webmcp-validation-and-confirmation-r15.md` |
| `Understand origin trials`, `Third-party origin trials` | `corpus/knowledge/origin-trial-announcement-surface-r15.md` |
| `(the verification environment and the flag note)…` | not in any knowledge note — staged anchor cell only |

Note-side recheck (supplementary, per row, in `noteSideRecheck`): 20
knowledge-note quotations were extracted **verbatim from the notes** (the span
between each note's own quote marks, soft-wrap normalised exactly the way the
register's single-line quote cell is) and run through the same ladder.

| reading | located |
|---|---|
| frozen folds f0-f6 | **13 of 20** |
| frozen folds, or one boundary-tolerant variant (`altLocates`) | **17 of 20** |
| located by no reading | **3 of 20** — S164 (page drift, §4, archive-proven) and S167 ×2 (character substitutions §4) |

So the boundary-tolerant field (`tagsAsSpace`, `tagsAsSpace_whitespaceStripped`,
`whitespaceStripped`, `markdownAware`) separates three different causes cleanly:
markup-boundary whitespace (S165, S166, S175, S176 — the note is faithful), page
drift (S164) and genuine character corruption (S167). **No knowledge-note claim
in my slice rests on text that was never in its source**, and the one error that
does propagate into the register is the `佪`/`佇` transcription (§4, S174/S175
`transcriptionError`).

## 5a. Fold-boundary decisions (documented; no register verdict depends on them)

The frozen ladder does not fix three boundary conventions:
(a) tag stripping — replace a tag with a space, or with nothing;
(b) f6's base — the raw text, or the f4 tag-stripped text;
(c) an inserted/soft-wrap space cannot be repaired by f2 (which collapses runs
but never deletes a space).

`qd-ladder.py` keeps `R57QuarA/laddr.py`'s reading (tags removed with nothing;
f6 on raw text) for cross-seat comparability. Every register fragment was also
run under the tolerant variants and recorded in `fragments[].altLocates`:

**All 12 register fragments are `false` for every tolerant variant**
(`tagsAsSpace`, `tagsAsSpace_whitespaceStripped`, `whitespaceStripped`,
`markdownAware`) — the absence is robust, not an artefact. The only results that
depend on the convention are note-side:

| note quotation | frozen | tolerant variant that locates it |
|---|---|---|
| S165 ``by monitoring the `document.modelContext` API`` | miss (raw f6 turns `<code>` tags into the letters `code`) | `markdownAware` |
| S166 flag sentence | miss (source `…をEnabled</strong>にして…`) | `tagsAsSpace` |
| S175 `…不要加 toolautosubmit ，讓使用者…` | miss (soft-wrap space + `<code>` boundary) | `tagsAsSpace_whitespaceStripped` / `whitespaceStripped` |
| S176 `requestUserInteraction() Forces …` | miss (inline tags between words) | `tagsAsSpace` |

The next contract should pin (a) and (b) so the two half-slices stay comparable
with the campaign's own census.

## 6. Bounds, guards, cost

- No mutating git/jj command was run anywhere (read-only `grep`/`read` only; the
  lane's git was not touched at all). No commit, push, checkout, reset, stash.
- Nothing was written outside
  `.ufo/waves/round-57/quarantine/R57QuarD/` and this report; no fleet-root
  tracked file, no sibling lane, no `shokuknow` write, no `.ufo/state/`, no
  `watchdog.log`, no `templates/`, no `scripts/`.
- No campaign tool from `shokuknow` was executed (`renumber-staged.py`,
  `merge-plan.py`, `quote-lint.py`, `absent-defect-register.py` were not run).
- No pacman transaction. No tool installs or upgrades were needed:
  python3 3.14.8 and curl 8.23.0 were sufficient.
- No subagent was spawned (the seat's single read-only labrat allowance was not
  needed).
- Scratch deleted on exit; the JSONs carry every fetched artifact's
  sha256 + byte size + HTTP status and two-fetch stability, so each ladder result
  can be re-derived by re-fetching the URL in the receipt.

## 7. Risks and open points for the L1

1. **Register defect is systemic, not local.** One row of the tabi slice
   (S171) is structurally malformed, and 30/37 quoted tabi rows have their
   entire quote cell carried by the next staged row. Any roll-up that reads the
   register's `payload-absent` class at face value would record ~37 tabi
   fabrications that do not exist. The register should be regenerated (or its
   quote column re-paired) before any adoption decision, in a round that allows
   data changes — not this one.
2. **`mispaired` as frozen does not cover this failure.** It triggers on
   register-URL ≠ staged-URL; in my slice the URLs are identical and the quote
   is what moved. I used `mispaired` with structured carriers; the L1 may prefer
   a distinct `quote-row-shift` label in the next contract.
3. **Exact divergences recorded in this slice (fix targets, not verdicts):**
   - register S174/S175 and knowledge note `webmcp-validation-and-confirmation-r15.md:20`:
     `佪` U+4F6A for the source's `佇` U+4F47 (1 character of 66);
   - knowledge note `webmcp-tool-approval-hints-r14.md`: `开` U+5F00 for `開`
     U+958B (1 substitution) and `检测` for `検出` (3 substitutions in that
     sentence);
   - register S165's quote cell holds anchor prose, not a quotation — the only
     "quote" in my slice that exists in no source and is not even note text.
4. **Page drift is live.** S164's cited page changed on 2026-10-27 and S171's
   HTML route 404s; two of my rows would flip verdict with no change to the
   corpus. Recheck dates in the register should be enforced for the tabi rows
   (`on-release` / `90d` cells).
5. `S164`'s cited page now lacks the staged anchor's own section names
   (`WebMCP 与 MCP 的区别`, `实时会话数据`); `临时性` survives as body text. The
   staged anchor for S164 needs a re-open, which is a data change for a later
   round.
6. Fetched HTML for S164, S167, S175 and S176 is **not byte-stable** between two
   fetches (1-4 KB of per-request tokens/asset hashes), while S165, S166, S171
   and S174 are byte-identical. Every ladder result was recomputed on both
   fetches and is identical for all 12 fragments. Receipts record both hashes
   (`fetch.fetch1`, `fetch.fetch2`, `fetch.byteStable`), so a verifier must
   compare the ladder tables, not a single hash.

## 8. Files

- `quarantine/R57QuarD/S164.json`, `S165.json`, `S166.json`, `S167.json`,
  `S174.json`, `S175.json`, `S176.json`, `S171.json` — one receipt per row:
  register cells + line, staged cells + line, HTTP measurement, two-fetch
  hashes, per-fragment per-fold hit tables, located fold + line/byte, near-match
  diagnostic, cross-row carriers, verdict, reason, note-side recheck, and the
  row-specific blocks (`archiveProbe` for S164, `transcriptionError` for
  S174/S175, `alternateAccess`/`citedUrlBody`/`malformed` for S171).
- `quarantine/R57QuarD/R57QuD-summary.md` — the table and the knowledge-grep
  answer in short form.
- Instruments: `qd-ladder.py`, `build-spec.py`, `annotate.py`, `qd-fetch.py`.

Report: `.ufo/waves/round-57/quarantine/R57QuD.md` (this file).
