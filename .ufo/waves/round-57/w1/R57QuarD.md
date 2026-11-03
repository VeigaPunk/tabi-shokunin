# R57QuarD — QUARANTINE hand-check, part D (w1 report)

Seat R57QuarD (executor, leaf). Rows 31-38 of the 38-row wave-4 duty:
`S164 S165 S166 S167 S174 S175 S176 S171`.

**ADOPT NOTHING.** Verdict receipts only; no register, staged, knowledge or data
file was created, modified or deleted. Every input was read-only.

Receipts: `.ufo/waves/round-57/quarantine/R57QuarD/` (8 row JSONs + summary +
4 instruments). Full method, row detail and risk list:
`.ufo/waves/round-57/quarantine/R57QuD.md`.

## Verdicts

| id | register class | HTTP | verdict | reason |
|---|---|---|---|---|
| S164 | `payload-absent` | 200 | **mispaired** | fragment absent from the cited zh-CN page *and* from its 2026-10-12 Wayback snapshot; byte-present at the NEXT row's source S165 (f0, line 141) and in S165's staged anchor |
| S165 | `payload-absent` | 200 | **mispaired** | the fragment is anchor prose, not a quotation: a truncated byte-exact substring of S166's staged anchor cell; no fetched page carries it |
| S166 | `payload-absent` | 200 | **mispaired** | `evaluate_webmcp` occurs nowhere on weel.co.jp (no `evaluate` substring); byte-present ×4 at the NEXT row's source S167 |
| S167 | `payload-absent` | 200 | **mispaired** | both fragments absent from claude.com; byte-present at the NEXT row's source S168 (2 and 1 hits) |
| S174 | `payload-absent` | 200 | **mispaired** | fragment 1 at the NEXT row's source S175; fragment 2 one character off (`審核佪列` U+4F6A vs source `審核佇列` U+4F47), the knowledge note's typo |
| S175 | `payload-absent` | 200 | **mispaired** | fragment 2 (`Explicit Tool Registration`) is S176's anchor text and byte-present on S176's page; fragment 1 is this row's own sentence at 65/66 characters |
| S176 | `payload-absent` | 200 | **mispaired** | zero `origin trial` on web-mcp.net; all three fragments at the NEXT row's source S177 (39 / 1 / 4 hits) |
| S171` | *prose: "the cited source could not be fetched…"* | **404** | **unreachable** (confirmed) | 207-byte 404 body with no WebMCP/tool text; the record is nevertheless live on the site's API route with the fields the note quotes |

8 rows → 7 `mispaired`, 1 `unreachable`, **0 fabrications**.

## What this changes for the roll-up

1. **The register's quote column is shifted by one row.** Row *N*'s quote cell
   is the staged `SOURCES.append.md` row *N+1*'s anchor text. In my slice 11 of
   12 fragments are carried by the next staged row; on a read-only structural
   check of all 38 tabi data rows, 30 of the 37 rows with a quote cell are
   carried **entirely** by the next row (7 partial: S111 0/2, S114 0/1,
   S118 0/3, S124 1/2, S140 0/1, S154 0/1, S175 1/2). So the `payload-absent`
   class here is a pairing artefact, and a face-value roll-up would report ~37
   tabi fabrications that do not exist.
2. **The frozen `mispaired` trigger does not fire.** It requires register-URL ≠
   staged-URL; all 8 of my rows have identical URLs. `mispaired` is used here
   with the carrier recorded structurally (`fragments[].crossBins[]`,
   `pairingCrossCheck.nextStagedRow`). Cross-seat contract delta flagged.
3. **The knowledge notes are sound, with three exact divergences.** 20 note
   quotations re-checked: 13 locate under the frozen folds, 17 under a
   boundary-tolerant reading, 3 under none — S164 (page drift, archive-proven)
   and S167 ×2 (character substitutions `开`/`開`, `检`/`検`, `测`/`出`). The
   `佪`/`佇` typo in `webmcp-validation-and-confirmation-r15.md:20` is the one
   error that propagates into the register.
4. **Two rows would flip with no corpus change.** S164's page was updated
   2026-10-27 (after the note's fetch); S171's HTML route 404s.

## S171 in detail (malformed row, hand-checked as required)

- `registerRowMalformed: true` — id cell `` S171` ``, class cell holds the
  unreachable-family prose, 5 cells where the header has 7 (no quote, no note).
- Cited URL `https://chromestatus.com/features/5117755740913664` → **404**,
  207 B, `<title>404 Not Found</title>`, byte-identical on re-fetch;
  **no WebMCP/tool-related text exists in the body** (`WebMCP` 0, `webmcp` 0,
  `tool` 0, `origin trial` 0, `chromestatus` 0). Verdict `unreachable` —
  the register's class stands on the URL.
- Record still live: `…/feature/5117755740913664` → 200 SPA shell (3,710 B);
  `…/api/v0/features/5117755740913664` → 200 `application/json` (21,011 B),
  `"name": "WebMCP"`, `browsers.chrome.status.text = "Proposed"`,
  `browsers.chrome.origintrial = false`, `origintrial = null`,
  `standards.maturity.text = "Specification being incubated in a Community
  Group"`, updated 2026-11-02 by `fbeaufort@google.com`. The note's field
  quotations locate in that body (f0 / f0 / f6).
- Disposition: the row is recoverable by re-pointing its URL in a later round;
  no change made this round.

## Method and guards

- Guarded fetches: http(s) only; every resolved A/AAAA address checked against
  loopback / RFC1918 / link-local / metadata ranges before the request; no
  cookies, no POST, no credentials. Each cited URL fetched twice; all 12 ladder
  results identical across the two fetches. S165/S166/S171/S174 are byte-stable;
  S164/S167/S175/S176 carry per-request tokens (1-4 KB delta) — receipts keep
  both hashes.
- Frozen 7-fold ladder (f0-f6) implemented in
  `quarantine/R57QuarD/qd-ladder.py` with fold functions byte-identical to the
  sibling seat's `R57QuarA/laddr.py`; cross-instrument agreement verified on 5
  (file, fragment) pairs, identical per-fold hit counts (PASS).
- Boundary-tolerant diagnostics (`altLocates`: tags-as-space, whitespace
  stripped, markdown-aware) were run as a check that absence is not a fold
  artefact — **all 12 register fragments are false under every variant**, so no
  verdict depends on the fold-boundary ambiguities. Note-side, four quotations
  locate only under a tolerant reading (tag boundaries / Markdown backticks);
  that is recorded, not used to change a verdict.
- No mutating git/jj command; no write outside
  `.ufo/waves/round-57/quarantine/R57QuarD/` and this report; no `shokuknow`
  write; no campaign tool from `shokuknow` executed; no pacman transaction; no
  tool install needed (python3 3.14.8, curl 8.23.0); no subagent spawned.
- Scratch `/fast/scratch/hyaku/tabi-r57/R57QuarD/` deleted on exit; receipts keep
  every artifact's sha256 + byte size + status so results are re-derivable.

## Open points for the L1

1. Regenerate (or re-pair) the register's quote column before any adoption
   decision; the `payload-absent` class is unusable as it stands for tabi.
2. Consider a distinct `quote-row-shift` label, or make `mispaired` cover
   quote↔row carriers, in the next contract.
3. Pin the two fold-boundary conventions (tag stripping: space vs nothing; f6
   base: raw vs tag-stripped) before the next census so halves stay comparable.
4. Quote-precision fixes for the next round: `佪`→`佇` (note line 20), `开`→`開`,
   `检`/`测`→`検`/`出`; and re-anchor S164's staged row, whose section names no
   longer exist on the live page.
