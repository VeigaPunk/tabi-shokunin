# R57QuB — quarantine hand-check part B

Seat R57QuB (round 57 w1, wave-4 QUARANTINE-FIRST duty, slice lines 11–20).
**ADOPT NOTHING** — verdict receipts only. No register row, staged row, knowledge
note or corpus file was edited; every file this seat wrote lives under
`.ufo/waves/round-57/quarantine/R57QuarB/`.

Receipts: `quarantine/R57QuarB/` — ten `S<id>.json` verdicts, the ladder tool
`laddr.py`, the generator `gen_receipts.py`, `fetch_guarded.py`, fetch/guard
metadata, `register-shift-scan.json` and `R57QuB-summary.md` (full method and
evidence).

Rows: **S126 S130 S131 S133 S134 S135 S137 S138 S140 S142** (register lines
188–197).

## What was done

For each row: read the full register row and the staged row with the same id,
resolved and guard-checked the cited host (all public — no loopback, private,
link-local or metadata address, so no fetch was refused), fetched the cited
source once with `curl -q -sS -L --max-time 90 --max-filesize 25000000` (GET
only, no POST, no cookies, no credentials, absolute `-o`), re-resolved the
**effective** host and refused it on the same rule (all zero-redirect, all
public), recorded `content-encoding` (none/identity everywhere) and
`size_download` against the cap (no truncation), split the quote cell on `<br>`,
and located every fragment under the frozen fold ladder f0–f6, recording the
fold, line and byte offset. Cross-checks per row: the same ladder against the
staged URL when it differs in string (S130, S137, S138), against the **carrier**
URL (row N+1), and against `merge/tabi/knowledge/`.

All ten fetches returned 200 with non-empty bodies and no guard flag. No row was
`unreachable`; no row was `extraction-unavailable`.

## Verdicts

| id | verdict | one-line reason |
|---|---|---|
| S126 | `mispaired` | 0/3 fragments in the GitHub rate-limits page; the cell is S127's §-anchor ("Native messaging" locates f0 L78 B9040 on the native-messaging page; the other two are anchor labels no page carries) |
| S130 | `mispaired` | 0/1 in `webmcp.test.ts` (raw or blob); the fragment is S131's §-anchor, located f6 L2840 B78761 on the ja origin-trial blog |
| S131 | `mispaired` | 0/2 in the ja blog; both are S132's §-anchors, located f0 L2253 B71279 and f4 L3826 B103150 on the ja use-cases page |
| S133 | `mispaired` | 0/1 in the ja evals page; "Agent security considerations for WebMCP" is S134's title/anchor, f0 L78 B7677 |
| S134 | `mispaired` | 0/1 in the English security page; "評估測試和偵錯" is S135's §-anchor, f0 L3887 B106839 on the zh-TW best-practices page |
| S135 | `mispaired` | 0/1 in the zh-TW page; "tools/list" is S136's §-anchor, f0 L777 B97775 at ai-heartland |
| S137 | `absent-confirmed` | "Run and load" is S138's anchor label and exists on no fetched page — the cited cloudflare doc, the staged tree/blob rendering and the package README all lack it (README's heading is `## Test`) |
| S138 | `mispaired` | 0/1 in the README (raw or tree); "Testing WebMCP tools" is S139's §-anchor, f0 L1225 B186204 on the TestingBot page |
| S140 | `quote-located` | present in the cited CopilotKit page at **f6** L99 B121574; byte-exact source span carries inline `<code>`/`&quot;` markup |
| S142 | `absent-confirmed` | "which tool list do I see" is S143's **scope** cell prose, a marker phrase; RFC 9110 has none and the carrier page has none |

Tally: 7 `mispaired`, 2 `absent-confirmed`, 1 `quote-located`.

Every row's **own** gate quotes locate in its cited source — 2/2 for all ten
(S130's gate quotes are backticked, checked explicitly:
`assert.ok(response.listWebMcpTools);` f0 L34 B993 and
`{message: /Tool missing-tool not found/},` f0 L112 B3602). So no row in this
slice lacks support in the source it actually cites.

## Structural finding (the one that matters beyond my slice)

**The register's quote column is shifted one registry row ahead of its id/url
column.** Every fragment of row N's quote cell is byte-present in a single cell
of staged row N+1 — 26 of the 37 parseable `tabi` register rows, and 0 rows where
the quote cell is carried by the row's own staged entry
(`register-shift-scan.json`).

Mechanism, proven against the campaign's read-only bytes and **not** by running
its tools:

1. `lanes/tabi/round*/SOURCES-PROPOSED.md` interleaves `| S<n> | … |` rows with
   `## Gate — S<n>` blocks.
2. `parse_gate_blocks` (quote-lint.py:159–166) takes a block body as everything
   up to the **next** `## Gate` heading — swallowing the next row's table line,
   §-anchor cell included.
3. `block_quotes` (quote-lint.py:376–424) then harvests every quoted span from
   that over-long body, so row S<n+1>'s §-labels become "quotes" of row S<n>.
4. Those labels are not on row S<n>'s page → `ABSENT` → `payload-absent`.

Reproduced without executing the campaign's tools: re-running its `QUOTE_SPAN_RE`
over the same gate bodies reproduces the register's fragment sets exactly for
S126, S130, S131, S133, S134, S135, S137, S138, S142.

Independent corroboration: the staged rows and `merge/tabi/knowledge/` attribute
those same strings to the **carrier** S-id, never to the register's row — 9 of 9
`source:` provenance lines name S127, S131, S132, S134, S135, S136, S138, S139.

Consequences for the L1:

1. On this slice `payload-absent` is not a fabrication class. The correct action
   is quote-column re-alignment, not row refusal. My two `absent-confirmed` rows
   (S137, S142) are anchor/scope *labels*, not quotations of any page — they need
   correction, and they still do not indicate a fabricated citation of the cited
   source, because neither row's own gate quotes are affected.
2. `payload-absent` also fires on a **fold gap**, not only on mispairing. S140's
   quote is real and in its own cited page; the census has `f_html` (tags→space)
   and `f_md` (strips backticks) but no fold that strips tags **and** punctuation
   together, so the markdown-rendered quote of an inline-`<code>` sentence reads
   ABSENT. Byte-exact source span:
   `The <code>tools</code> permissions policy defaults to <code>self</code>; cross-origin iframes also need <code>allow=&quot;tools&quot;</code>.`
   The register's quote as written is *not* byte-exact markup, so even resolved
   this row is a quote-precision defect of the kind the r56 closure named.
3. Nothing here supports adoption: the register's rows are not adoptable as
   written, and none of my ten was adopted or corrected in place.

## Risks / limits

- Quote cells are compared as `<br>`-split fragments with the outer backticks
  removed and `\"` unescaped; a cell whose fragments were *paraphrased* rather
  than copied would not be detected as a shift by the byte-identity test. My ten
  rows were checked individually, not inferred from the scan.
- Live bytes are dated 2026-11-03. Any row that pins a page footer or a moving
  `main` branch can drift; S138's cited README is on `main` and already lacks the
  `"Run and load"` section its neighbour's anchor claims.
- `f6` is deliberately loose (punctuation stripped). Every f6 hold is reported
  with its fold named, and each was read by eye in context before being accepted;
  S140's f6 hit was verified byte-by-byte against the raw span quoted above.
- The two `absent-confirmed` rows are "absent from the cited and carrier
  artifacts", not "fabricated by the lane": both strings are staging labels. The
  receipts say so in `reason`, and no row is refused on them.

## Guard compliance (sentinel S3–S6)

All ten cited and all ten carrier fetches ran **post-guard**: `-q` first,
absolute output directory, `url_effective` recorded and the effective host
re-guarded on the same private/loopback/link-local/metadata rule,
`content-encoding` recorded per fetch, `size_download` compared to the cap, curl
exit recorded. Pre-guard fetches taken earlier in the seat were re-taken under the
guard, so **no verdict in this report rests on a pre-guard body**. All 23 fetches
carry zero flags (`fetch-meta-cited-staged.json`, `fetch-meta-carrier.json`).

## Hygiene

No git/jj mutation (read-only inspection only), no pacman transaction, no tool
install (python3 stdlib + curl sufficed; nothing needed installing), no
credentials or cookies sent, no write outside this seat's two owned paths and its
scratch. Scratch `/fast/scratch/hyaku/tabi-r57/R57QuarB/` deleted after the
receipts were copied out; `sha256` per fetch keeps the bytes re-checkable.
