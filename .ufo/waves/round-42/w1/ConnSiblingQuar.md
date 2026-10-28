# ConnSiblingQuar — wave-4 quarantine peer alignment (tabi round 42, attempt 1)

Seat: `ConnSiblingQuar` (connector, leaf). Judged on **adjacency**. Milestone: quarantine peer alignment.
Scope honoured: read-only everywhere; **no writes** outside this seat dir; no commits/pushes/git-or-jj
mutation; **no network egress** (the quarantine GET exception does not extend to this seat); no subagents.
Every command below was run against local files only.

Axes named (from `.ufo/waves/round-42/claims.json` `axesAtRoundStart`): adjacency 8 (lowest, and this
seat's axis), operability 9, depth 9, coverage 9, freshness 9, calibration 9; saturation 8.
The move proposed in §4 raises **adjacency** and does not lower any other axis; it touches no frozen byte.

---

## 0. Question asked

> Wave-4 quarantine-first lanes are tabi, revenger, chousa, kotodama. How did the other three land their
> slice adjudications (verdict vocabularies, evidence formats, adoption decisions)? What format alignment
> opportunities exist for tabi's re-adjudication TSV (`staged_id, verdict, evidence path`), and what
> adoption reasoning should tabi consider or route? No lane edits.

## 1. What tabi's frozen contract actually demands (so alignment advice is not wishful)

`.ufo/waves/round-42/counters/check-routed-defects-round42.mjs` (sha256 recorded in
`evidence/r4-contract.txt`), r4 leg:

```
line 37: const VERDICTS = new Set(['present','absent','misbound','partial','unreachable']);
line 145: if (c.length !== 3) { add('r4-row-malformed', ...) }        // exactly 3 tab cells
line 150: duplicate-id check
line 151: if (sliceIds.length !== 38) add('r4-slice-size', ...)        // 38 hard-coded
line 154/155: tsv ids == slice-ids exactly (no header row possible: a header's first cell would be an "extra id")
line 157: verdict must be in the enum, lowercase, exact match
line 159/160: evidence path must be a committed blob at REV, >= 200 bytes
```

So the constraints are: **3 cells, no header, lowercase single-token enum, one repo-relative committed
blob of ≥200 bytes per row**. The ≥200-byte floor is the door through which every peer's richer
semantics can enter — and the only door, because a 4th/5th column is `r4-row-malformed`.

Full extraction: `evidence/r4-contract.txt`.

## 2. How the three peer lanes landed it

### 2.1 Verdict vocabularies (verbatim from landed bytes)

| situation | tabi r42 (frozen) | chousa r42 | kotodama r71 | revenger r69/r70 |
|---|---|---|---|---|
| quote located in the cited source | `present` | `present` | `PRESENT` | `PRESENT` |
| source opens, quote not in it, no other home found | `absent` | `absent` | `REFUSED` | `ABSENT` |
| quote/text belongs to a different row/document | **`misbound`** | *(folded into `absent`)* | *(note only)* | `UNVERIFIED-REACHABLE` / `PRESENT (register wrong)` |
| 0 < located < n quotes | `partial` | `mixed` (decision rule) | `REFUSED` (multi-quote row fails) | `PARTIAL` |
| fetch fails / locator unusable | `unreachable` | `unverifiable` | `UNVERIFIABLE` | `UNREACHABLE` |
| fetched but not decodable text (binary office/PDF, bot wall) | **no value** | `unverifiable` | `UNVERIFIABLE` | *(no clear home)* |

Evidence: `evidence/peer-vocabularies.txt` — chousa
`corpus/evidence/round42/quarantine-verdicts.tsv` (header `id verdict reason flip`; 15 `absent`, 9
`unverifiable`, 0 `present`, 0 `mixed`), its frozen rule at `tools/quarantine-check.py:288-331`
(`present` / `absent` / `mixed` / `unverifiable`, "**unverifiable is never a fabrication**",
"binary office document decoded as bytes … a quote's absence in it is not evidence"), kotodama
`reports/round-71/telemetry/quarantine-verdicts.md` (`PRESENT 10 · REFUSED 7 · UNVERIFIABLE 4` after
re-derivation), revenger `corpus/lessons/round-69.md:149-155` (per-seat roll-up, `PARTIAL` used once for
"filename only, in `Content-Disposition`", `UNVERIFIED-REACHABLE` = "quote verbatim in a neighbouring
document, not in the cited one").

Two asymmetries matter:

- **tabi is the only lane with a first-class value for misbinding** (`misbound`). Peers record it in prose
  or fold it into `absent`. That is an advantage, but it makes tabi's `absent` count *not comparable* to
  chousa's unless misbound rows are reported separately in a peer-compatible rollup
  (`absent-or-misbound`, and `misbound-by-destination`).
- **tabi is the only lane with no value for "fetched but not textualizable".** chousa's rule exists
  because of measured cases (4 binary office documents + 1 bot wall out of 24 rows). tabi's slice has one
  such row by URL extension (`S114`, `…/B1-2_ronbun.pdf`) plus several client-rendered pages
  (`docs.copilotkit.ai`, `claude.com`, `developer.chrome.com`) — see `evidence/slice-integrity.txt`.

### 2.2 Evidence formats

| lane | granularity | shape | committed-blob floor |
|---|---|---|---|
| chousa | 1 row → 1 evidence cell | TSV `id, verdict, reason, flip`; evidence cell = bare cache filename or `cache`/`register` | none |
| kotodama | **1 dossier per seat (7–10 rows)** | markdown table `id \| verdict \| note`; evidence named in prose (`ScoutQuarantineFetch{1,2,3}.md`) | none |
| revenger | 1 row → 1 evidence **dir** | `.ufo/waves/round-67/quarantine/<id>/`, verdict in the per-seat report (seat reports authoritative) | none |
| **tabi r42** | 1 row → 1 file | `evidence-S<NNN>.txt` in the seat dir; builder regex `^QuarR42\d+$` + `^evidence-(S\d{3})\.txt$` | **≥200 bytes, committed** |

Consequence: **kotodama's dossier granularity cannot be adopted in tabi** — `build-quarantine-tsv.mjs`
finds rows only via per-row `evidence-S<NNN>.txt`, and r4 wants a per-row committed blob ≥200 bytes.
revenger's shape is the closest fit. chousa's `reason`+`flip` *content* fits perfectly, but only inside
the blob, never as TSV columns.

### 2.3 Adoption decisions

| lane | decision this round | stated condition to open |
|---|---|---|
| chousa r42 | **closed** — "the 24 rows are adjudicated, not imported … a later round may adopt a row whose quote is present and re-grounded" | present + in-round re-grounding |
| kotodama r71 | **closed** | — |
| kotodama r72 | **OPEN** — "wave-4 quarantine-first completed by rounds 68-71: 21/21 register rows verdicted" | full slice verdicted, then entries re-grounded |
| revenger r70→r72 | **closed** (its quarantine-first obligation was satisfied at r67/r69) | — |
| tabi r22 / README:533 | **closed** — "verdicts only, no adoption … No SOURCES row was added" | not stated |

The peer norm is therefore: *adoption stays closed while the ledger is incomplete; it opens only when the
whole slice is verdicted, and then only row-by-row with an in-round re-grounding.* tabi's r42 slice **is**
completed this round (38/38), so tabi inherits kotodama's r71→r72 transition point — and should say so
explicitly rather than leave "closed" unconditional.

## 3. Findings that change what the TSV will mean

### F1 — The register's quote cell is shifted one row forward (7/7 sampled, verified locally)

tabi's seat prompt step 3 says "Record the row's source URL/anchor cells and the **staged quote exactly as
registered**". For a measurable set of rows, the registered quote belongs to the **next staged row**, so a
literal pass records `absent` for a misbinding artifact. Verified against the read-only package:

| register row (quote cell) | register quote text | actually owned by staged row |
|---|---|---|
| S106 | `使用 WebMCP 時，請注意下列事項` | **S107** gate (`SOURCES-PROPOSED.md:57`) |
| S134 | `評估測試和偵錯` | **S135** (`round2/SOURCES-PROPOSED.md:137`) |
| S148 | `Crawl-delay` / `Sitemap` | **S149** (`round3/…:67,73` — robots.txt, "Crawl-delay: 5", line 130) |
| S149 | `The daemon` / `/status JSON fields` | **S150** (`round3/…:76,81` — "§The daemon") |
| S163 | `WebMCP 与 MCP 的区别` / `实时会话数据` | **S164** (`round4/…` zh-CN compare-mcp gate quotes) |
| S164 | `With the extension, you can:` | **S165** (`round4/…:68`) |
| S166 | `evaluate_webmcp` | **S167** (`round4/…:86`) |

Receipt with exact commands and line output: `evidence/register-quote-shift.txt`.

This is exactly the class revenger named as "an id/URL cross-wiring in the package" (r67) and kotodama
corrected append-only as F-1 (r72: stated reason wrong, verdict unchanged). It is **not** hypothetical for
tabi: the r40 wave already found it row-by-row (`S106` "S107 headings mis-attributed", `S117` "quote
mis-bound from S118", `S134` "belongs to S135's anchor", `S163` "mis-spliced S164 anchor/quote", `S164`
"misbound S165 quote", `S166` "belongs to S167", `S176` "mis-bound S177", `S149` "belongs to S150"),
whereas tabi's r22 pass — judged from raw `res.text()` bytes only — recorded all 37 rows
`absent-refused` (`evidence/r40-seat-verdicts.txt`).

Under tabi's enum the correct verdict for these rows is **`misbound`** (prompt step 4: "the quote/text
belongs to a different registered source"), with the destination named. If seats emit `absent` instead,
the ledger records a fabrication claim about rows whose own staged quotes are verbatim on the live page
(`S163` per `r40/w1/ScoutQuarantine163/report.md`: both staged quotes PRESENT verbatim, 200/267368 B).

### F2 — 26 of 38 staged ids collide with tabi's own `corpus/SOURCES.md`, all with different URLs

`evidence/id-collision-map.tsv`: **26/38 collide, 0 with the same URL**, all of them the round1–round3 ids
(round1 8/8, round2 11/11, round3 7/9; round4 0/6 and round5 0/4 are clean). Example: register `S102` =
Chromium devtools README; tabi `SOURCES.md` `S102` = SameSite Cookie Attributes draft, status `mined`.

The package itself documents the hazard: `lanes/tabi/ID-REMAP.md` — "The map is scoped per round: the same
id in two rounds names two different rows, so a round-blind substitution would move one round's citations
onto another's rows while every structural check stayed green." The frozen r4 leg is structurally blind to
this: it compares the TSV ids only against `quarantine/slice-ids.txt`.

Sharpest instance: **`S148`**. r4 will record `S148 → absent` (register: Cloudflare error-1020, quotes
`Crawl-delay`/`Sitemap`) while **r2 of the same checker, at the same revision,** requires
`SOURCES.md` `S148` to carry `supersedes S146` with a verbatim quote from the committed Node.js HTML.
Both legs go green; the ledger then contains two contradictory statements about the token `S148`.
kotodama and revenger both publish collision maps/notes; tabi's frozen contract has no slot for one.

Separately, **8 staged rows cite a document tabi has already mined under another id** (`S106`→`S119,S123`;
`S110`→`S120`; `S117`→`S020`; `S124`,`S142`→`S107`; `S125`,`S145`→`S102`; `S126`→`S121`). For those rows a
seat's fetch is cross-checkable against already-committed lane bytes — a free, egress-free verification
amplifier no peer lane had available.

### F3 — tabi's two own prior passes contradict each other on 6 rows

`evidence/preder-disposition-conflict.txt`: r40 dispositions say "present as staged" for S118, S134, S140,
S163, S164, S166; r22 verdicts say `absent-refused` for all six. F1 resolves the mechanism for five of them
(the register judged a spliced quote; the staged quote is present). The r42 prompt already says
"never copy", but it also says "Changed verdict vs r40 must state exactly what changed on the live source
today" — which is *not true* for these rows: what changed is the **quote set being judged**, not the
source. Recording that delta as "the live source changed" would be a false statement in the ledger.

### F4 — Slice derivation is correct where chousa's was not; the register summary is stale the same way

`evidence/slice-integrity.txt`: 38 rows derived (37 in `## Rows` + 1 in `## Rows whose quotes were NEVER
CHECKED`), `## By lane` says **37** — the same "stale-summary" class chousa named (header 20 vs derived
24). tabi's awk catches both shapes; a seat told to trust `## By lane` would under-derive by one.
Residual extraction defect: the raw id cell for S171 is ``S171` `` (trailing backtick,
register line 362); `slice-ids.txt` normalises it, the seat prompt does not warn. The builder fails loudly
(`^evidence-(S\d{3})\.txt$` cannot match a backticked name → `ok:false`), so this is a loud failure, not a
silent one — but it is the exact shape of r41 defect D4.

## 4. Proposed move (one, bounded, checker-safe)

**Move: make the assembly step verdict *re-derivation*, not verdict *transcription*.**

The builder currently lifts `verdict:` out of each seat blob verbatim
(`build-quarantine-tsv.mjs`: `body.match(/verdict:\s*(present|absent|misbound|partial|unreachable)\b/i)`).
Everything needed to check that line is already on disk and already committed after this wave: the
register, the read-only staged package, the r40 seat reports, and the lane's own `SOURCES.md`. So add an
L1-side review gate (a checklist artifact plus, optionally, one pure-function counter that reads only
local bytes) with **three checks**, and let the **existing** frozen checker stay untouched:

1. **Shift/misbinding check.** For each row verdicted `absent`, test whether the registered quote text
   appears in the *next* staged row's gate block or table line (the F1 test, mechanised over
   `SOURCES-PROPOSED.md` + `round*/SOURCES-PROPOSED.md`). If it does, the row is `misbound`, not `absent`,
   and the blob must name the destination row. Rule mirroring revenger's `UNVERIFIED-REACHABLE`
   definition: **`misbound` requires a named destination; `absent` is only allowed when no destination is
   found.** This removes `misbound` as an unfalsifiable escape hatch and removes `absent` as a false
   fabrication claim.
2. **Non-text body check.** If the fetched body is binary, a bot wall, or thinner than the longest quote
   (chousa's rule, `quarantine-check.py:301-320`), the verdict is `unreachable` with the magic bytes /
   status named in the blob — never `absent`. This keeps the enum frozen and makes tabi's `unreachable`
   bucket the exact analogue of chousa's `unverifiable` / kotodama's `UNVERIFIABLE`.
3. **Namespace check.** For the 26 colliding ids, the blob and the round report must state
   `campaign-register round<N> S<nnn> ≠ lane SOURCES S<nnn>`, and the report must publish the collision
   map plus a histogram computed by `build-quarantine-tsv.mjs`'s own `verdictHistogram` output (never a
   hand count — kotodama's r71 lesson needed a `QUARANTINE-TALLY` correction from 10/6/5 to 10/7/4 after
   the prose and the table diverged).

Why this is the move and not an amendment: the frozen checker, the frozen enum, `claims.json`, and the
3-cell TSV shape are all unchanged. Checks 1–2 write into the ≥200-byte evidence blob the prompt already
requires; check 3 is report prose. Nothing is retro-fitted after data; no verdict is rewritten — a
correction is an appended line in the blob and the report, the way kotodama handled F-1 and chousa handled
its byte-count erratum.

**Adoption reasoning to route (same move, second half).** Keep adoption **closed** for round 42, and state
the opening condition the peers converged on: the 38-row ledger must be complete *and* the candidate row's
own staged quote must be `present` under an in-round re-grounding (chousa's "present + re-grounded";
kotodama's r72 opening at 21/21). Per r40's seat reports the candidate set is ≈7 rows (S106, S117, S134,
S163, S164, S166, S176 — each "own staged quotes present, register quote mis-bound"). Two hard constraints
on any later adoption: (a) the register's colliding id is **never** reused — mint the lane id after
`S149`; (b) renumber **by document, never arithmetically** (revenger: "any later adoption round renumbers
the package by document"; chousa r43's `id-arithmetic` mistake: shifting every staged id by one points the
next citation at the wrong document).

Cost: one checklist file + one optional ~120-line counter over local files; no new tool, no install, no
egress. Verification (to be run by the L1, not by this seat): the counter must exit 1 on a
one-row-`absent`-should-be-`misbound` mutant and exit 0 on the landed table, and
`node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev <REV> --repo … --json` must
still exit 0 with `findingCount 0`.

## 5. Risks / what this move does not fix

- **r4 re-derives nothing.** Even with the gate above, the *frozen* checker will green a TSV whose verdicts
  are arbitrary, as long as the enum is legal, the ids match, and 38 blobs are ≥200 bytes. chousa ships
  `CLASS_CONSISTENT`/`MUTANT_DETECTED`, kotodama ships `accept-ca.py` legs, revenger ships per-seat
  re-derivation — tabi ships none. This is a routed hole (do not amend the frozen checker): the peer-shaped
  fix is a *separate* consistency counter, which is why my move puts the re-derivation outside r4.
- F1 was verified on 7 rows, not 38; the coarse automated sweep was inconclusive because gate-block
  segmentation bled into the next row's table line (recorded in `evidence/shift-test.txt`). The gate in §4
  must therefore be built on table-line/gate-block segmentation that isolates one row, and demonstrated
  able to fail on S163 before it is trusted.
- The `partial` semantics in the seat prompt ("… or a one-token register typo") conflicts with tabi's own
  D2 discipline (a non-verbatim quote is refused as written) and with chousa's r43 split, where a `misquote`
  is a *subclass of `absent`*, not a separate verdict. Narrowing `partial` to "0 < located < n on the
  register's quotes" (chousa's `mixed`) keeps tabi's histogram comparable; leaving the typo clause in lets
  `partial` absorb the very defect this round is repairing.
- No claim verdict is asserted here. This seat ran no counter and produced no byte in the frozen tree; the
  §4 verification plan is unrun by design (leaf, no writes outside the seat dir).

## 6. Limitations

- No network egress, so no live re-fetch: every statement about a source is either a reading of committed
  lane bytes, of the read-only register/package, or of the r40/r22 seat reports.
- tabi SOURCES row count read at working-tree HEAD `0081bfd` (149 rows); findings are about working-tree
  bytes, not a pinned revision. The frozen checker measures a revision — the L1 must re-check collision
  counts at the measured rev.
- `round1` staged rows live at `lanes/tabi/SOURCES-PROPOSED.md` (there is no `round1/` dir); wave 2 is
  `round2/`, i.e. directory number ≠ register round number. Anyone mechanising F1 must map dirs to rounds
  by id range, not by directory name.

## 7. Evidence files (this seat dir)

| file | what it is |
|---|---|
| `r4-contract.txt` | frozen r4 leg + builder regexes + seat prompt contract, with checker sha256 |
| `peer-vocabularies.txt` | verbatim peer vocabularies, chousa's frozen rule text, tabi r22 precedent |
| `id-collision-map.tsv` | the 26 collisions (register URL vs lane URL), plus the 8 same-document rows |
| `slice-integrity.txt` | 38-row derivation, stale `## By lane` 37, S171 backtick, 62 quotes, 19 multi-quote rows, 1 PDF |
| `register-quote-shift.txt` | the 7-row quote-cell shift, each with the owning staged row and line |
| `preder-disposition-conflict.txt` | the r40-vs-r22 6-row contradiction table |
| `r40-seat-verdicts.txt` | all 38 r40 quarantine seat `VERDICT` lines (raw) |
| `shift-test.txt` | the coarse sweep and why it was inconclusive (negative result kept) |

VERDICT finding: three peer lanes converge on a coarse 3–5 value vocabulary, per-row committed evidence, closed adoption until the slice is fully verdicted, and named id-collision/renumber-by-document discipline; tabi's frozen r4 TSV can host all of that except extra columns, and two real gaps remain that its enum cannot express (fetched-but-untextualizable bodies; a register quote-cell shifted one row forward on 7/7 sampled rows, which r4 would record as `absent` where `misbound` is true, and 26/38 ids already occupied by different lane sources, incl. S148 asserted present by r2 in the same checker).
