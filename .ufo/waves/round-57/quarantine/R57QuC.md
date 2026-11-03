# R57QuarC — report (quarantine hand-check part C)

**Seat:** `R57QuarC` (executor, single-seat) · **Wave:** round 57 / w1 · **Lane:** `tabi-shokunin`
**Base revision:** `ef43ececde883cc0368c6c7cfbabe30ef937b717` · **Fetched:** 2026-11-03 (UTC+local)
**Contract:** `.ufo/waves/round-57/w1-spec.json` item `R57QuarA` — guards, fold ladder f0–f6, verdict vocabulary and JSON shape applied unchanged.
**Duty:** wave-4 QUARANTINE-FIRST hand-check. **ADOPT NOTHING this round.**

Report trailer: this file. Receipts: `.ufo/waves/round-57/quarantine/R57QuarC/` (per-row `S<id>.json`, `summary.json`, `R57QuC-summary.md`, ladder/provenance/fetch evidence, tools).

---

## 1. Scope and result in one paragraph

I hand-checked the ten register rows on slice lines 21–30 — **S143 S144 S145 S147 S148 S149 S153 S154 S158 S163** — each against its own cited URL, its staged row, and the documents of the neighbouring staged rows, with all seven frozen folds and guarded, credential-free fetches. All 19 documents fetched cleanly (HTTP 200, non-empty; no guard refusal). **Verdict: 10 × `mispaired`. Zero `absent-confirmed`, zero `unreachable`, zero `extraction-unavailable`, zero `quote-located`.** The register’s `payload-absent` class is confirmed *at each cited URL*, but no row is a fabrication: every quoted span is genuine text carried by the **next** staged row’s source (the register’s quote column is offset by one row), and every one of the 17 fragments is byte-exact in the staging knowledge under `merge/tabi/knowledge/`.

## 2. Method (what was actually run)

* **Guarded fetch** per the contract: `curl -sL --max-time 90 --max-filesize 25000000 -o <scratch>/<doc>.bin -w '%{http_code} %{size_download} %{content_type}' <url>`, plus `--proto '=http,https' --proto-redir '=http,https'` and a DNS check on **every** resolved address refusing loopback / private / link-local / reserved / multicast / unspecified space. No POST, no credentials, no cookies. All 19 fetches: 200; effective URL = cited URL (no cross-host redirect observed).
* **Documents:** 10 register URLs; the 4 staged URLs that differ (github `blob` vs `raw.githubusercontent`); 5 carrier documents named by the adjacent staged row (S146 OWASP CSRF sheet, S155 mcp-b debug page, S156 Zap Studio errors, S159 ratelimit-headers-09, S164 Chrome `compare-mcp` zh-CN); plus 2 local artifacts (the lane’s own-work `operations.md`, and round4’s captured `compare-mcp-zhcn.txt`).
* **Fold ladder f0–f6** (exact substring in raw bytes; case-insensitive; whitespace collapse; entity decode; tag strip + collapse; that + case-insensitive; backtick/quote/punctuation-stripped + collapse) run for **every fragment against every document**: 17 fragments × 19 documents × 7 folds = **2 261 fold searches**. Hits record the original **line and UTF-8 byte offset** (folds keep a char map back to the decoded text) plus ±40-character context.
* **Pairing cross-check:** register URL vs staged URL; differing ones fetched and re-searched. Because fragments surfaced in other rows’ documents, those carriers were fetched and searched with the same ladder.
* **Verdict rule.** `quote-located` / `partial-located` are used only for hits **in the cited source**. A span absent from the cited source but byte-exact in another campaign row’s cited/staged source (or in a campaign-captured artifact of that row) is `mispaired` — a pairing defect, not fabrication. `absent-confirmed` is reserved for a clean fetch where the span exists nowhere. This extension of the vocabulary’s `mispaired` wording is stated explicitly because the observed defect is cross-row, not register-vs-staged for the same id.
* **Knowledge question:** all 17 fragments grepped against `shokuknow/merge/tabi/knowledge/` with the same ladder (answer in §5).

## 3. Verdicts

| id | verdict | frags in cited source | carrier of the real span (fold, line/byte) | reason |
|---|---|---|---|---|
| S143 | `mispaired` | 0 / 1 | S144’s `Page.ts` — f0 L1085 B26682 | the Chrome-151 sentence is Page.ts’s `webmcp` accessor comment; the cited `WebMCP.ts` is the CDP wrapper |
| S144 | `mispaired` | 0 / 2 | S145’s rfc6265bis-13 §8.8.1 — f0 L2813 B113630; f2 L2817 B113840 | both spans are the draft’s “Defense in depth” material |
| S145 | `mispaired` | 0 / 2 | S146’s OWASP CSRF sheet — f0 L1610 B30310; second span is a paraphrase | `Limitations of SameSite` is real OWASP text; `Common CSRF weaknesses and protection mechanisms` is byte-exact nowhere |
| S147 | `mispaired` | 0 / 1 | S148’s error-1020 page — f0 L192 B73088 (3 hits) | the 1015 page contains no “Error 1020” string |
| S148 | `mispaired` | 1 incidental / 2 | S149’s robots.txt — f0 L130 B2662; f0 L424 B15118 | both anchors are robots.txt headings; the cited page’s only `Sitemap` is a `<link rel="sitemap">` head element |
| S149 | `mispaired` | 0 / 2 | S150’s own-work `operations.md` — f0 L5 B183; f0 L28 B2114 | the daemon headings are the lane’s own reference, not Wikipedia’s robots.txt |
| S153 | `mispaired` | 0 / 2 | S154’s zh-CN imperative-api page — f0 L3986 B134829; f4 L4015 B144085 | the Chinese spans are the zh-CN API page’s, not the cited English guidance page (register S153 ≠ lane registry S153) |
| S154 | `mispaired` | 0 / 1 | S156’s Zap Studio `webmcp/errors` — f0 L1 B6320 (6 hits) | the error name belongs to that library page; S155’s mcp-b page carries nothing |
| S158 | `mispaired` | 0 / 1 | S159’s ratelimit-headers-09 §3 — f0 L88 B3426 | the cited `webmcp.ts` is 2 451 B and carries no rate-limit vocabulary |
| S163 | `mispaired` | 0 / 3 | S164’s anchor cell; `实时会话数据` in round4 capture f0 L188 B6805 | the cell reproduces S164’s anchor section names plus its locator tail; live page drifted |

Every receipt also records `registerClassConfirmedAtCitedUrl: true` and the full `f0_n…f6_n` table per fragment.

## 4. The structural defect (the round’s quarantine finding)

The register’s **quote column is the next staged row’s quoted span** while the row keeps its own cited URL. Nine of ten rows match the immediately following staged row; S154 matches S156 because the intervening S155 anchor contains **no quoted span** (S156’s does) — consistent with a shift that takes the next row *carrying* a quote.

Evidence: `staged-pairing.json` + the carrier column above. For example the register’s S145 cell (`Common CSRF weaknesses and protection mechanisms` / `Limitations of SameSite`) reproduces the quoted section names of the staged **S146** anchor cell, whose URL is the OWASP sheet; the S145 row’s own URL is the IETF draft. The same pattern holds for S143→S144 (teaches quote), S144→S145, S147→S148, S148→S149, S149→S150, S153→S154, S158→S159, S163→S164.

Two secondary structural defects, both in anchor prose rather than source quotes:
* `S145#1` `Common CSRF weaknesses and protection mechanisms` — no such heading exists in the OWASP sheet (headings: `Defense In Depth Techniques`, `SameSite (Cookie Attribute)`, `Limitations of SameSite`, …); a campaign paraphrase.
* `S163` — quote cell carries a **locator clause** (`(line 189); zh-CN locale`) with an unclosed opening backtick, and `WebMCP 与 MCP 的区别` is a paraphrase (the live page’s nav/title read `WebMCP 与 MCP`). `实时会话数据` was real in the 2026-10-23 capture but the live page has reworded it — page drift, not fabrication.

## 5. Required knowledge answer

**Yes — every one of the 17 fragments appears byte-exactly under `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/`, in 11 distinct files:**

`csrf-defense-boundary.md` (S144#1/#2, S145#1/#2) · `webmcp-tool-listing-paths-r13.md` (S143#1, S153#1, S154#1) · `webmcp-hint-is-not-enforcement-r13.md` (S153#2) · `webmcp-tool-approval-hints-r14.md` (S163#1/#2/#3) · `host-rate-limit-signal-classes-r13.md` (S147#1, S148#1/#2) · `host-rate-limit-measured-posture-r17.md` (S148#1) · `host-rate-limit-signal-classes-r14.md` (S158#1) · `webbridge-daemon-handshake-amendment-r13.md` (S149#1/#2) · `…-r14.md` (S149#1) · `journey-driver-preconditions-r18.md` (S149#1) · `journey-driver-attachability-r19.md` (S149#1).

Caveat: presence in a knowledge file proves the staging pipeline carried the text; it is not independent source verification (for `S145#1` and `S163#1` the knowledge file carries the same paraphrase). Where the notes name sources they do so correctly — `csrf-defense-boundary.md` lists the draft (S145) and the OWASP sheet (S146) as separate sources. The mispairing is in the register’s quote column, not the knowledge notes.

## 6. Adjudication consequence (for the L1, not an adoption)

* No row in my slice is the fabrication class. The register’s `payload-absent` label is confirmed *at the cited URL* but is an artifact of the quote/URL shift.
* The register rows should be re-paired (quote → the row that actually carries it) before any adoption decision; two anchor paraphrases and one locator clause need correction as anchors, not as quotes.
* Live pages drift: `imperative-api?hl=zh-cn` returned 180 655 B then 180 659 B minutes apart, and `compare-mcp?hl=zh-cn` reworded the session-data sentence since capture. Any adoption must re-validate against a fresh fetch, not the 2026-10-23 capture.
* **Nothing adopted; register and staging files untouched.**

## 7. Artifacts, tooling, limits

* Receipts (all under `.ufo/waves/round-57/quarantine/R57QuarC/`): 10 × `S<id>.json`, `summary.json`, `R57QuC-summary.md`, `ladder.json`, `provenance.json`, `provenance-knowledge.json`, `staged-pairing.json`, `fetched-all.json`, `register-rows.json`, three logs, and the three tools (`quarantine-check.py` sha256 `c2677deef3df…`, `provenance.py` sha256 `1c625f24cbcb…`, `assemble.py` sha256 `e98f3c594849…`). `quarantine-check.py` accepts `--scratch` (default `TMPDIR`); all three take explicit input/output paths and contain no `/tmp` literal.
* Instrument versions: curl 8.23.0, python 3.14.8. **No tool was installed or upgraded** (nothing was missing; pacman was not touched).
* Scratch `/fast/scratch/hyaku/tabi-r57/R57QuarC/` was used for downloads and was removed after the receipts were copied out.
* Raw bodies (~4 MB, live pages) were not committed; each receipt carries the fetch command, http code, byte count, content type, sha256 and fetch time. Re-fetch byte mismatch = page drift, already observed.
* No PDF/binary extraction was needed. No blockers; no cross-seat contract delta.
