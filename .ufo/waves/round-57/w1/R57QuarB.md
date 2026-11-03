# R57QuarB — wave w1 scoped findings (quarantine hand-check, rows 11–20)

Seat R57QuarB, round 57 w1. Duty: the wave-4 QUARANTINE-FIRST hand-check of the
tabi register rows in slice lines 11–20 — **S126 S130 S131 S133 S134 S135 S137
S138 S140 S142**. **ADOPT NOTHING** — verdict receipts only.

Receipts: `quarantine/R57QuarB/` (`S<id>.json` ×10, `R57QuB-summary.md`,
`register-shift-scan.json`, `laddr.py`, `gen_receipts.py`, `fetch_guarded.py`,
fetch metadata). Seat report: `quarantine/R57QuB.md`.

## Verdicts (one per row, exactly one)

| id | verdict | carrier | fold / offset |
|---|---|---|---|
| S126 | `mispaired` | S127 anchor | f0 L78 B9040 (1 of 3 fragments; other 2 are anchor labels no page carries) |
| S130 | `mispaired` | S131 anchor | f6 L2840 B78761 |
| S131 | `mispaired` | S132 anchor | f0 L2253 B71279; f4 L3826 B103150 |
| S133 | `mispaired` | S134 anchor/source | f0 L78 B7677 |
| S134 | `mispaired` | S135 anchor | f0 L3887 B106839 |
| S135 | `mispaired` | S136 anchor | f0 L777 B97775 |
| S137 | `absent-confirmed` | S138 anchor, 0/1 | — (string on no fetched page) |
| S138 | `mispaired` | S139 anchor | f0 L1225 B186204 |
| S140 | `quote-located` | — | **f6 L99 B121574** in its own cited page |
| S142 | `absent-confirmed` | S143 scope cell, 0/1 | — (marker phrase, no page carries it) |

7 `mispaired`, 2 `absent-confirmed`, 1 `quote-located`. Zero `unreachable`, zero
`extraction-unavailable`. All ten cited sources: HTTP 200, non-empty, identity
encoding, zero redirects.

## The finding

**The register's quote column is shifted one registry row ahead of its id/url
column** — every fragment of row N's quote cell is byte-present in a single cell of
staged row N+1. Register-wide: 26 of 37 `tabi` rows, and 0 on their own staged entry.

Cause (proven against read-only campaign bytes, campaign tools not executed):
gate-block bodies run to the next `## Gate` heading and therefore include the next
row's table line; the quoted §-labels of that line are harvested as the current
row's "quotes" and are then absent from the current row's page.

Corroboration: `merge/tabi/knowledge/` and the staged rows attribute every one of
those strings to the **carrier** S-id (9 of 9 `source:` lines), never to the
register's row.

## What the L1 should carry

1. `payload-absent` on this slice is **not** a fabrication class; the action is
   quote-column re-alignment, not row refusal. All ten rows' own gate quotes
   locate in their cited sources (2/2 each), so no row is unsupported evidence.
2. `payload-absent` also fires on a **fold gap**: S140's quote is genuinely in its
   own cited page, but only at f6, because the source carries inline `<code>` and
   `&quot;` while the register quote is markdown-rendered. The census's ladder has
   `f_html` and `f_md` separately but no tag-strip + punctuation-strip fold.
   Byte-exact span:
   `The <code>tools</code> permissions policy defaults to <code>self</code>; cross-origin iframes also need <code>allow=&quot;tools&quot;</code>.`
3. Two strings genuinely exist nowhere fetched and need correction for the
   campaign's pass: `Run and load` (S137's cell, S138's anchor label; the README
   heading is `## Test`) and `which tool list do I see` (S142's cell, S143's scope
   prose). Neither was corrected in place.

## Guard compliance

All cited and carrier fetches ran post-guard (`-q` first, absolute out dir,
`url_effective` recorded and its host re-guarded, `content-encoding` and
`size_download` recorded, curl exit recorded). Pre-guard bodies were re-fetched, so
no verdict rests on one. 23/23 fetches carry zero flags.

## Hygiene

Read-only git only; no pacman; no installs; no credentials or cookies; writes
confined to the two owned paths plus scratch; scratch deleted after receipts were
copied out.
