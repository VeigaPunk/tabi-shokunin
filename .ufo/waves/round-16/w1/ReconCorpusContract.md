# ReconCorpusContract — SOURCES contract v1 + LEARNING trend verdicts

Seat: `TabiR16.ReconCorpusContract-5` (read-only scout). Lane root:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Round 16, 2026-10-20.

Authorities opened this session (local files, no network):

- `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md` (171 lines)
- `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/LEARNING.md` (90 lines)
- Cross-check: fleet vendored copy
  `/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md` (81 lines)

**There is no `protocol/SOURCES.md` file.** `ls` of the protocol dir lists
`AXES.md CORPUS.md LEARNING.md MISSION.md PROTOCOL-APPENDIX.md PROTOCOL.md`. The SOURCES
contract is the section `CORPUS.md:64-155`, headed
`## SOURCES.md — where a shokunin learns`.

Method: this seat's toolset has no `lsp` device, so no language server answered these
Markdown files. Every anchor below is a direct file read or a `grep -n` line number — literal
text, not semantic-server proof. All quotations were located in the file opened this session.
No tools installed or upgraded.

## 1. Authority and version pin

`CORPUS.md:64` heading; `66-69` verbatim:

> Contract v1, ratified 2026-10-19 and integrated from the fleet root revision
> `dcf3b6484e02452fc7aec55d724744de188779b9`. This canonical section is the
> authority; fleet copies are vendored and do not override it. A change is a new
> contract version, never an edit to this section.

Scope statement `70-74`: `corpus/knowledge/` holds admitted facts; `corpus/SOURCES.md` holds
where they come from — what each teaches, how far to trust it for which scope, when to look
again; "the lane's curated reading list and the standing record of its taste".

Fleet-copy delta (observed, `diff` of canonical `§Shape`→`§Maintained parser note` against
`.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:9-81`; result `14 insertions(+), 7 deletions(-)`):

- Heading level only: fleet uses `## Shape/Rules/Census`, canonical `###`.
- Rule 3 wording: fleet pins the method to "chousa's (`chousa-shokunin/SKILL.md`: question
  → source hierarchy → citation chain → claim-vs-source check)" and says "`SOURCES.md`
  duplicates neither"; canonical generalizes to "the lane's designated domain instructions"
  and "`SOURCES.md` only records and curates sources".
- Canonical adds `§Maintained parser note` (`150-154`), which self-declares "outside frozen v1".

`[INFERENCE]` The canonical section is the later integration from fleet revision
`dcf3b6484…`; the fleet file is the kaika-era frozen text. Where they differ, `CORPUS.md`
wins per `66-69`; do not edit either — a change is a new contract version.

## 2. Required file shape (`CORPUS.md:76-84`)

```
# SOURCES — where <id> learns
## Registry           the one table below
## Paths              ordered study sequences: `<topic> — S003 → S010 → S014: why this order`
## Search log         one prose note per bounded search (rule 5)
## Leads (unopened)   bullets; a lead is not evidence and never a row
```

- `Registry` (`:80`): exactly one table.
- `Paths` (`:81`): ordered study sequences with a stated order rationale.
- `Search log` (`:82`): one prose note per bounded search — rule 5 fields.
- `Leads (unopened)` (`:83`): "a lead is not evidence and never a row" — the file-level
  restatement of row-after-open.

## 3. Registry table: 11 columns (`CORPUS.md:86-108`)

Header `:86`, separator `:87`. A row is `|`-delimited with leading and trailing `|`, so
`awk -F'|'` sees `NF=13`; data column → awk field: id=`$2`, source=`$3`, kind=`$4`,
tier=`$5`, scope=`$6`, anchor=`$7`, teaches=`$8`, status=`$9`, opened=`$10`,
recheck=`$11`, used-by=`$12`.

| column | anchor | normative content |
|---|---|---|
| `id` | `:89` | `S` + 3 or more digits, "the next unused; never reused. No `|` inside any cell." |
| `source` | `:90` | title — canonical URL or DOI; a repo path or command for `own-work` |
| `kind` | `:90-92` | enum, exactly: `spec · docs · paper · code · tool · dataset · talk · book · community · own-work` |
| `tier` | `:93-97` | scoped to `scope`, never global. **A** primary/authoritative for that scope (spec, official docs, source code, original paper, maintainer statement, the lane's own re-runnable gate output); **B** strong secondary (expert write-up with reproducible detail, survey, textbook); **C** lead only — never sole support for an admitted entry. `community` is never A. "Tier is curation, not truth: no NATO/GRADE labels on rows." |
| `scope` | `:98` | the claim or topic the tier applies to |
| `anchor` | `:99-100` | exact section / heading / page / line plus revision (version, commit, or publication date); "Never a bare homepage." |
| `teaches` | `:101-102` | one grounded learner benefit; rejected rows read `REJECTED: <reason>; flip: <what would change the verdict>` |
| `status` | `:103-104` | exactly one of `queued` (opened, worth mining) · `mined` (cited by ≥1 path in `used-by`) · `rejected` (kept — a rejection is evidence of taste) |
| `opened` / `recheck` | `:105-106` | `opened` = ISO date the row's author opened the source; `recheck` = ISO date or cadence (`90d`, `180d`, `on-release`) |
| `used-by` | `:107-108` | repo-relative paths of the knowledge entries or lessons citing the row, comma-separated, or `—` |

## 4. The six rules (`CORPUS.md:110-129`)

1. **Row-written-only-after-opened** (`:112-115`): "Write it only after opening the source in
   the round that writes the row." The round lesson's `## Gate` records, for every new row,
   the URL, the access date, and a **≤25-word quote with its location** grounding `teaches`.
   Non-author verification re-opens a sample.
2. **Append-only** (`:116-118`): only `status`, `recheck`, `used-by` change in place, and
   "each change is logged old→new in the round lesson". A correction is a new row whose
   `teaches` opens `supersedes S0NN —`.
3. **No second method** (`:119-122`): admission stays in `corpus/QUALITY.md`; research method
   stays in the lane's designated domain instructions (question → source hierarchy →
   citation chain → claim-vs-source check); `SOURCES.md` records/curates only.
4. **Expansion is knowledge, not rows** (`:123-125`): the expansion trend counts admitted
   `knowledge/` entries whose `source:` cites a `mined` row on uncovered coverage-map ground.
   "There is no row quota; a short registry of opened, honestly tiered rows beats a long one."
5. **Search log** (`:126-128`): PRISMA-inspired, not PRISMA-compliant — question/query, where
   searched, date, identified / screened / included / excluded counts, exclusion reasons,
   stop rationale. "A negative claim carries its sweep."
6. **No credential material** (`:129`): secret values, session or private URLs, `op://`
   references — ever (reinforced at `:49-52`).

Adjacent audit rules that bind the same text: a count carries its command (`:34-38`), a
negative claim carries its sweep (`:39-41`), a quote names its location (`:42-45`), an index
row is a claim (`:46-48`), corrections are new entries never rewrites (`:53-60`), and each
round's review emits a per-repo `conformant` / `not conformant` verdict naming the failed
rule and the command that shows it (`:61-62`).

## 5. Where the quote rule lands: `## Gate`

- `CORPUS.md:18-20`: each `lessons/round-<N>.md` carries a `## Gate` section — "candidates,
  admitted, rejected with reasons, spot-check result". Same in `LEARNING.md:71-73`.
- Per new row, the Gate must carry: **URL, access date, ≤25-word quote + its location**
  (`CORPUS.md:112-115`). The location must satisfy the `anchor` discipline (`:99-100`), and
  the quote must ground the row's `teaches` cell.
- The Gate also carries the non-author spot-check: at least one admit and one reject, with
  `agree`/`disagree` and a reason (`LEARNING.md:42-46`); "A subagent the lane dispatched is
  still the lane" (`:45-46`).
- A round that mines mistakes adds `## Mistakes` — one row per mistake: class · evidence
  pointer · captured-by (criterion or rule, or `none`) · fix (`CORPUS.md:166-168`).
- Rejection rows stay in the registry: `status=rejected`, `teaches` must open
  `REJECTED: <reason>; flip: <what would change the verdict>` (`:101-104`). A rejection is
  kept as evidence of taste, not deleted.
- `[INFERENCE]` Rule 1's "for every new row" is literal: a re-open of an existing row needs
  the old→new transition log of rule 2, not a fresh URL/quote entry — unless the re-open
  produces a new row. If the seat opened the source this round and the row is new, both
  apply.

## 6. Status / recheck / used-by transitions (the only legal in-place edits)

`CORPUS.md:116-118` verbatim:

> **Append-only.** Only `status`, `recheck` and `used-by` change in place, and each change
> is logged old→new in the round lesson. A correction is a new row whose `teaches` opens
> `supersedes S0NN —`.

Derived checklist:

- `queued → mined` is legal in place when the row is now cited by ≥1 path in `used-by`
  (`:103`), with a `queued→mined` log line in the round lesson.
- Adding/removing a `used-by` path is legal in place, logged old→new; every path must be
  repo-relative and exist on disk (`:107`, enforced by census line `:147`).
- Changing `recheck` is legal in place, logged old→new.
- Editing `source`, `kind`, `tier`, `scope`, `anchor`, or `teaches` in place is **not**
  legal: that is a new row opening `supersedes S0NN —` (`:117-118`).
- `[INFERENCE]` For round 16: S020 `queued→mined` (tabi `corpus/SOURCES.md:34`) and an S002
  `used-by` add (`:16`) are in-place transitions, not new rows; editing S020's anchor or
  teaches is not.

## 7. Census — frozen v1 commands (`CORPUS.md:131-148`)

Run from the lane root. Seven checks, anchors and exact observed output on
`/home/vgpnk/Projects/shokunin/tabi-shokunin` (2026-10-20):

| check | line | command (exact) | observed |
|---|---|---|---|
| rows | `:135` | `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` | `29` |
| malformed rows, must print 0 | `:137` | `awk -F'\|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md` | `0` |
| tier histogram | `:139` | awk on `$5` | `A=23 B=4 C=2` |
| status histogram | `:141` | awk on `$9` | `mined=24 queued=3 rejected=2` |
| duplicate ids, must print nothing | `:143` | `... \| sort \| uniq -d` | empty |
| enum violations + tier inflation, must print nothing | `:145` | awk `$2,$4,$5,$9`, `NF==13`, `A`+`community` | empty |
| mined used-by paths must exist | `:147` | awk `$9=="mined"`, split `$12`, `[ -e "$p" ]` | empty, exit 0 |

This matches `PLAN.md`'s start census exactly ("rows 29, A23/B4/C2,
mined24/queued3/rejected2"); that is my own run of the contract's commands, independent of the
fleet validator that supplied PLAN's numbers.

Caveats that matter for a lane:

- The frozen snippets anchor `^\|` — column-zero rows only. A table indented 1–3 spaces reads
  as 0 rows/0 malformed here. The maintained parser is the one that tolerates 0–3 leading
  ASCII spaces; 4+ is indented code and ignored (`CORPUS.md:150-154`). Tabi's rows are
  column-zero (grep shows `16:| S002`, `34:| S020`, `43:| S029`), so both parsers agree.
- The enum check is guarded by `NF==13`; malformed rows are deliberately skipped there and
  caught by the `NF!=13` check instead. Both must be run.
- `grep -c` counts lines, so a wrapped row counts once and then fails `NF!=13`.

Maintained CLI (`CORPUS.md:150-154` pointer; actual file
`/home/vgpnk/Projects/kimi-shokunin/scripts/sources-census.sh`, 806 lines):

- Header contract (`:16-19`): exit `0` clean or warnings · `1` E/overdue findings (or census
  missing) · `2` usage/env/missing registry · `3` selftest failure.
- Validation codes (`:29-38`): `E01` malformed row, `E02` bad id, `E03` duplicate id,
  `E04` duplicate URL+scope, `E05` kind enum, `E06` tier enum, `E07` status enum, `E08`
  bad `opened`, `E09` bad `recheck`, `E10` community at A, `E11` missing used-by path,
  `E12` row-shaped source outside Registry; `W01` tier-C mined with used-by, `W02` thin
  rejected teaches, `W03` mined with `—`, `W04` same URL across scopes.
- Observed:
  - `sources-census.sh census --file corpus/SOURCES.md` → TSV (`file rows 29`,
    `file tier.A 23`, `file tier.B 4`, `file tier.C 2`, `file status.mined 24`,
    `file status.queued 3`, `file status.rejected 2`, FLEET totals with
    `tier.invalid 0`, `status.invalid 0`, `missing 0`), exit `0`.
  - `sources-census.sh validate --file corpus/SOURCES.md [--verbose]` →
    `file	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`, exit `0`.

## 8. Trend verdict rules (`LEARNING.md`)

`LEARNING.md:26` heading. Vocabulary `:28-29`: `improved`, `harmed`, `unchanged`,
`unprovable-but-better`; "no trend is a scalar."

Table `:31-35`, three trends, one verdict each per round:

- **expansion** (`:33`): observable = admitted `knowledge/` entries on ground the coverage
  map did not hold, each `source:` citing a `mined` `corpus/SOURCES.md` row (`own-work`
  included), frontier areas entered, new kinds of source, a capability admitted to
  `SCORECARD.md`. `improved` = net new admitted entries on uncovered ground, each citing its
  coverage-map row. `harmed` = an admitted entry fails the bar it was admitted under.
- **quality** (`:34`): observable = entries re-verified, deepened, or superseded by stronger
  ones; `verified-at` freshness. `improved` = a weaker entry superseded by a stronger one, or
  stale entries re-verify, with no admitted entry failing its re-check. `harmed` = an entry is
  found false or stale and left unmarked.
- **discernment** (`:35`): observable = gate decisions vs the outside spot-check;
  `QUALITY.md` criteria. `improved` = the spot-check agrees with the gate on admits *and*
  rejects, or a disagreement becomes a lesson that adds a grounded `QUALITY.md` criterion.
  `harmed` = a disagreement is left unlearned, or a criterion is added with no lesson behind it.

Cross-trend rule `:37-38`: "Growth without quality is not learning: `expansion: improved`
with `quality: harmed` is a trade, reported as a trade, never admitted."

Discernment gate `:40-50`: a non-author (fresh reviewer or operator) spot-checks at least one
admit and one reject per round and records `agree`/`disagree` with a reason; an exploratory
claim (`unprovable-but-better`) is admitted only through this gate — "never through
self-attestation."

Operator teaching `:52-55`: outranks every other source; lands verbatim as
`corpus/lessons/operator-<YYYY-MM-DD>-<slug>.md`; reflected in `QUALITY.md` or `SKILL.md` by
the next round with the lesson cited, or the round reports why not.

Axis mapping `:84-90`: expansion ← `coverage` + `adjacency`; quality ← `depth`, `freshness`,
`operability`; discernment ← `calibration`. "Choose a round's claims from the trend that is
furthest behind"; when quality axes saturate, expansion continues through the capabilities
table.

## 9. Round-16 application (advisory inference, not contract text)

- C2's SOURCES work is gated by rule 1: each row exists only after a seat opened the source
  **this round**; the round-16 lesson's `## Gate` must carry URL + `2026-10-20` + a ≤25-word
  quote with a located anchor. A row without that Gate evidence is contract-invalid even if
  the URL is right.
- Source-row count is explicitly **not** expansion (`CORPUS.md:123-125`); round 16 can claim
  expansion only via an admitted `knowledge/` entry citing a `mined` row on uncovered ground.
  This is the contract basis for PLAN's "no source-row inflation called expansion".
- Every count in the round lesson and gate receipts must carry its command and date
  (`CORPUS.md:34-38`) — e.g. the census block in §7, not "29 rows".
- Any rejected round-16 source stays as a row with `status=rejected` and the literal
  `REJECTED: <reason>; flip: <what would change the verdict>` teaches (`:101-102`).
- If a bounded search happened, `## Search log` needs the rule-5 fields including counts and
  stop rationale; if there was no discovery query, say so explicitly (tabi's round-14/15
  entries do: "no discovery query or new row").
- No credential material, session/private URLs, or `op://` in rows or search log (`:129`).

## 10. Remaining unknowns / explicitly not done

- Whether the canonical rule-3 generalization is a ratified v1 integration or drift from the
  fleet copy: not resolvable from these two files; canonical wins either way (`:66-69`).
- Fleet-root git history for revision `dcf3b6484…` not inspected (out of assigned slice).
- Only the maintained CLI's header (lines 1–73) and the observed modes were read; its full
  806-line implementation was not audited.
- No round-16 `corpus/lessons/round-16.md` existed at read time, so no round-16 Gate was
  validated. No gates, selftests, counters, or browsers were run (seat rule); the only
  commands run were the read-only census/validate commands above.
- `lsp` unavailable (no such device in this seat's toolset); anchors are literal, not
  semantic-server-confirmed.

Confidence: high on §§1–8 (quoted or command-observed); §9 is inference clearly marked;
§10 lists everything unverified.
