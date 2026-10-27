# ScoutQuarantine171 — quarantine hand-check of staged S171

Access date: 2026-10-27 (UTC). Scratch: /fast/scratch/hyaku/tabi-r40/ScoutQuarantine171/ (removed before yield). No tool installed; RULES.md read (no install needed). No write under shokuknow.

## Register row (read-only)
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` line 362 (inside the `unreachable` table, whose header is lines 14, 27-28 and 11-14; the class cell for this block is `unreachable`):

`| tabi | round5 | S171` | the cited source could not be fetched, so no quote was checked | https://chromestatus.com/features/5117755740913664 |`

- Register class: **unreachable** ("re-fetch, or mark the row unverifiable — do NOT call it a fabrication", register line 14).
- Register row carries no anchor and no quote. The quotes and anchor come from the lane's gate block, `/home/vgpnk/Projects/shokuknow/lanes/tabi/round5/SOURCES-PROPOSED.md` lines 34 (registry row) and 36-42 (`## Gate — S171`), staged URL `https://chromestatus.com/features/5117755740913664` (record fetched as JSON at `https://chromestatus.com/api/v0/features/5117755740913664`), accessed 2026-10-23. Anchor: the feature record's `browsers.chrome.status`, `standards`, `origintrial` fields; record last updated 2026-09-28 by fbeaufort@google.com. Staged quotes:
  1. `"name": "WebMCP", "summary": "WebMCP is a proposal for a web API that enables web pages to provide agent-specific paths in their UI."`
  2. `"maturity": {"text": "Specification being incubated in a Community Group", "short_text": "Incubation", "val": 3}`
  3. `"status": {"text": "Proposed", "val": 2, "milestone_str": "Proposed"}`
  4. note: `origintrial` object empty / no trial id published.

## Fetches (curl -L, UA Mozilla/5.0)
| URL | HTTP | bytes | note |
|---|---|---|---|
| https://chromestatus.com/features/5117755740913664 (exact staged URL) | **404** | 207 | "404 Not Found" HTML. The path is plural `/features/`; the site UI path is singular `/feature/`. This is why the checker marked it fetch-failed. |
| https://chromestatus.com/api/v0/features/5117755740913664 (JSON the gate block names as the record) | 200 application/json | 21011 | `)]}'` XSSI prefix; sha256 82bdbe63bed5326c00cc4b268af41f4d5c3910f333b3e1317a7bb16d617ad191 |
| https://chromestatus.com/feature/5117755740913664 | 200 text/html | 3710 | SPA shell only (no record data in it); not used as evidence |

## Quote location (JSON API, XSSI prefix stripped)
- Q1: located literally up to `…paths in their UI.` (offset 30). The staged quote appends a closing `"` right after `UI.`; the real text continues `With WebMCP, agent-service interaction…`, so the trailing `"` is a staging truncation artifact, not a wording difference. Substring match otherwise exact. Section: top-level `name`, `summary`.
- Q2: exact literal match. Section: `standards.maturity`.
- Q3: exact literal match. Section: `browsers.chrome.status`.
- Note: `"origintrial": false` (the record has a boolean, not an empty object; the staged "object is empty" wording is loose, the substance "no trial published" holds). `updated.by` = fbeaufort@google.com, `when` 2026-09-28 23:57:13 — matches the staged date.
- Quote (<=25 words, located): "WebMCP is a proposal for a web API that enables web pages to provide agent-specific paths in their UI."

## Classification of S171
- Cited URL exactly as staged: **unreachable** (HTTP 404, wrong path segment) — the register's `unreachable` class is correct for that URL. Not fabrication.
- Substantive content: **present** at the sibling endpoint the gate block itself names as the record (`/api/v0/features/5117755740913664`), all three staged quotes match (Q1 modulo a trailing-quote typo). The row is therefore not `payload-absent`.
- Row classification: **unreachable (as staged URL) / content present via named API endpoint**; recommended correction: the staged URL should be `https://chromestatus.com/feature/5117755740913664` (human page) or the `api/v0` JSON URL.

## Limitations
- Live record observed 2026-10-27; staged accessed date is 2026-10-23 and the record's `updated` is 2026-09-28, so it is unchanged since then in the fields checked (no later update timestamp observed).
- The human page `/feature/…` is a client-rendered shell; only the JSON API was used as evidence.
- Earlier seat summaries not used.

VERDICT ok S171 unreachable-as-staged (HTTP 404 on /features/ path, not fabrication); all 3 staged quotes located in the api/v0 JSON record named by the gate block (Q1 modulo trailing-quote artifact)

Report: .ufo/waves/round-40/w1/ScoutQuarantine171/report.md
