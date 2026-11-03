# R57QuarA — wave w1 scoped findings (quarantine hand-check, rows 1–10)

Seat R57QuarA, round 57 w1. Duty: the wave-4 QUARANTINE-FIRST hand-check of the
tabi register rows in slice lines 1–10 — S102, S106, S109, S110, S111, S114,
S117, S118, S124, S125. **ADOPT NOTHING** — verdict receipts only.

Receipts: `quarantine/R57QuarA/` (`S<id>.json` ×10, `R57QuA-summary.md`,
`laddr.py`, `gen_receipts.py`, `fetch.sh`, metadata JSONs). Seat report:
`quarantine/R57QuA.md`.

## Verdicts (one per row, exactly one)

| id | verdict | carrier / where |
|---|---|---|
| S102 | `absent-confirmed` | S103's page-footer date; the cited CDP README has no "Last updated" line at all |
| S106 | `mispaired` | S107's zh-TW page, f0, lines 5631 / 5652 |
| S109 | `mispaired` | RFC 6585 (S110's source), f0 §4 heading line 68 and f2 |
| S110 | `mispaired` | S111's secure-tools page, f0 lines 4342 / 4483 (2 of 3 fragments) |
| S111 | `partial-located` | zh-CN mirror, f0 line 3862; one fragment absent |
| S114 | `absent-confirmed` | near miss: PDF "set-of mark" vs quoted "set-of-marks" (distance 1) |
| S117 | `mispaired` | S118's PDF, f0 line 257 |
| S118 | `quote-located` | paper PDF: f0 heading, f2 sentence (byte-exact with its line break) |
| S124 | `absent-confirmed` | RFC 9110 §10.2.3 paraphrase + S125 anchor-cell tail; RFC 7231 also carries neither |
| S125 | `mispaired` | S126's GitHub rate-limits page, f0, 10 and 5 hits |

10/10 fetched clean (200, non-empty), 0 unreachable, 0 extraction-unavailable.
Every fragment has per-fold hit counts, offsets, byte-exact source span and a
re-runnable command in its receipt.

## Three findings the wave should carry

1. **Register quote column is spliced, not fabricated.** 7 of 10 rows do not own
   their quote cell; each foreign fragment was located in the neighbour's
   artifact (f0/f2), and the staged rows plus `merge/tabi/knowledge` attribute
   the same strings to those neighbours. `payload-absent` on this slice means
   "quote cell misaligned", not "invented sentence". Repair = re-align, do not
   refuse.
2. **Three genuinely unlocatable strings** (correction list, not applied):
   `Add hints to your tools` → the page's h2 is "Use annotation hints";
   `set-of-marks` → source "set-of mark"; `Retry-After can be used with a 3xx …`
   → paraphrase, still quoted as source in
   `merge/tabi/knowledge/redirect-and-retry-after-semantics.md` (corroborates
   round 27's `w1/ScoutStagedGround.md` §4.4).
3. **Knowledge attribution is sound for this slice**: 14/19 fragments are exact
   substrings of `merge/tabi/knowledge/**` (16 under f0-or-f6), each under the
   correct S-id `source:` header; the two exceptions are the strings knowledge
   itself quotes without a locatable source (S111 label, S124 sentence) and the
   S111 zh-CN mirror sentence, which never entered knowledge.

## Hygiene and boundaries

Read-only on the register, staged rows, knowledge and neighbour sources; no git
or jj mutation; no pacman; no tool install (curl, python3, poppler already
present); no POST, cookies or credentials; no writes outside
`quarantine/R57QuarA/` and the seat's scratch, which was deleted on exit.
