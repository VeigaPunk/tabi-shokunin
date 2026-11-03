# R57QuB — quarantine hand-check part B (summary receipt)

Seat R57QuB, round 57 w1, wave-4 QUARANTINE-FIRST duty, slice lines 11–20.
**ADOPT NOTHING.** Verdict receipts only: no register row, staged row, knowledge
note, or corpus file was edited. Everything this seat wrote is under
`.ufo/waves/round-57/quarantine/R57QuarB/`.

Rows: S126 S130 S131 S133 S134 S135 S137 S138 S140 S142
Register lines 188–197 of `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`.

## Verdicts

| id | round | verdict | frags | cited | carried by | own gate quotes |
|---|---|---|---|---|---|---|
| S126 | round2 | `mispaired` | 3 | 0/3 | S127 anchor — f0 L78 B9040 (1 of 3) | 2/2 located |
| S130 | round2 | `mispaired` | 1 | 0/1 | S131 anchor — f6 L2840 B78761 | 2/2 located |
| S131 | round2 | `mispaired` | 2 | 0/2 | S132 anchor — f0 L2253 B71279; f4 L3826 B103150 | 2/2 located |
| S133 | round2 | `mispaired` | 1 | 0/1 | S134 anchor/source — f0 L78 B7677 | 2/2 located |
| S134 | round2 | `mispaired` | 1 | 0/1 | S135 anchor — f0 L3887 B106839 | 2/2 located |
| S135 | round2 | `mispaired` | 1 | 0/1 | S136 anchor — f0 L777 B97775 | 2/2 located |
| S137 | round2 | `absent-confirmed` | 1 | 0/1 | S138 anchor (0/1 — "Run and load" exists on no fetched page) | 2/2 located |
| S138 | round2 | `mispaired` | 1 | 0/1 | S139 anchor — f0 L1225 B186204 | 2/2 located |
| S140 | round2 | `quote-located` | 1 | **1/1 at f6** L99 B121574 | — | 2/2 located |
| S142 | round3 | `absent-confirmed` | 1 | 0/1 | S143 *scope* cell (0/1 — a marker phrase, no page carries it) | 2/2 located |

Tally: 7 `mispaired`, 2 `absent-confirmed`, 1 `quote-located`. Zero `unreachable`,
zero `extraction-unavailable`. All ten cited sources fetched 200, non-empty,
identity encoding, zero redirects.

## The finding (beyond my ten rows)

**The register's quote column is shifted one registry row ahead of its
id/url column.** Every fragment of row N's quote cell is byte-present in a single
cell of staged row N+1. This holds for 26 of the 37 parseable `tabi` register rows
and for 0 rows on their own staged entry (`register-shift-scan.json`).

Mechanism, proven against read-only campaign bytes, not inferred:

1. `lanes/tabi/round*/SOURCES-PROPOSED.md` interleaves `| S<n> | … |` table rows
   with `## Gate — S<n>` blocks.
2. The census's `parse_gate_blocks` takes a gate block's body as everything up to
   the **next** `## Gate` heading (`quote-lint.py:159-166`) — which swallows the
   next row's table line, including its §-anchor cell.
3. `block_quotes` then harvests every quoted span from that over-long body
   (`quote-lint.py:376-424`), so §-labels of row S<n+1>'s anchor become "quotes"
   of row S<n>.
4. Those labels are not text on row S<n>'s page → `ABSENT` → `payload-absent`.

Reproduced without executing the campaign's tools: re-running their
`QUOTE_SPAN_RE` over the same gate blocks reproduces the register's fragments
exactly for S126, S130, S131, S133, S134, S135, S137, S138, S142.

Corroboration: the staged rows and `merge/tabi/knowledge/` attribute these same
strings to the **carrier** S-id, not the register's row (S127, S131, S132, S134,
S135, S136, S138, S139 respectively — 9 of 9 `source:` lines name the carrier).

Every row's **own** gate quotes do locate in its cited source (2/2 for all ten;
S130's gate uses backticks, checked explicitly: `assert.ok(response.listWebMcpTools);`
f0 and `{message: /Tool missing-tool not found/},` f0). So the rows the register
lists as fabrication candidates are supported evidence; the defect is in the
quote↔row pairing.

S140 is the exception worth carrying: its register quote **is** its own gate
quote, and it **is** in the cited page — only at f6, because the page carries
inline `<code>` markup and `&quot;` entities while the register quote is the
markdown-rendered form. Byte-exact source span:

```
The <code>tools</code> permissions policy defaults to <code>self</code>; cross-origin iframes also need <code>allow=&quot;tools&quot;</code>.
```

The census has `f_html` (tag→space) and `f_md` (strips backticks) but no fold
that strips tags **and** punctuation together, so it reported a real quote as
ABSENT. Same class as the round-56 S161 keycap nit: a fold gap, not a defect in
the source.

## Method

Per row, in order: read the register row and the staged row with the same id;
resolve the cited host and refuse loopback/private/link-local/metadata (all ten
public, none refused); fetch once with `curl -q -sS -L --max-time 90
--max-filesize 25000000` (GET only, no POST, no cookies, no credentials,
absolute `-o`); re-resolve the **effective** host and refuse it on the same rule
(all zero-redirect, all public); record `content-encoding` (none/identity on
every row), `size_download` against the cap, and curl exit (no truncation flag
anywhere); split the quote cell on `<br>`; locate every fragment under folds
f0–f6, recording hit count per fold plus line and byte offset of the first hit.

f6 = HTML tags stripped, entities decoded, punctuation/backticks/quotes stripped,
whitespace collapsed. Holds are always reported with the fold that produced them.

Cross-checks run per row: (a) the same ladder against the **staged** URL when it
differs in string (S130, S137, S138 — the blob/tree renderings; no fragment
located there either), (b) the same ladder against the **carrier** URL (row N+1),
(c) which staged cell is byte-identical to the quote cell, (d) whether each
fragment occurs anywhere under `merge/tabi/knowledge/` and which S-id that file's
`source:` line names.

## Guard receipts

All ten cited fetches and all ten carrier fetches ran **post-guard** (the
sentinel's S3–S6 items arrived before the final run; the earlier pre-guard
fetches were re-taken, so no verdict here rests on a pre-guard body).
`fetch-meta-cited-staged.json` / `fetch-meta-carrier.json` carry per-fetch
`http_code`, `size_download`, `content_type`, `content_encoding`,
`num_redirects`, `url_effective`, cited-host and effective-host guard results,
curl exit and sha256. Zero flags on all 23 fetches.

## Files

- `S<id>.json` ×10 — the verdict receipt in the frozen shape
  `{id, registerUrl, stagedUrl, httpCode, bytes, contentType, fragments:[{quote,
  fold, located, where}], verdict, reason}` plus the guard/carrier/knowledge fields.
- `verdicts-summary.json` — the table above, machine-readable.
- `register-shift-scan.json` — the 37-row register-wide pairing scan.
- `fetch-meta-cited-staged.json`, `fetch-meta-carrier.json` — fetch evidence.
- `register-rows.json`, `staged-rows.json`, `staged-carrier-slice.json`, `next-urls.json`,
  `gate-quotes.json`, `knowledge-hits.json` — inputs as parsed (the staging slice is
  limited to my ten rows and their carriers; the full-file scan result is in
  `register-shift-scan.json`).
- `laddr.py` — the fold ladder used (f0–f6 with offset mapping).
- `fetch_guarded.py` — the guarded fetch helper (absolute out dir, `-q` first).
- `gen_receipts.py` — the generator that produced the ten receipts.
