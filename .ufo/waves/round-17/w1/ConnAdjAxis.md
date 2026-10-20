VERDICT: ISSUES

# ConnAdjAxis — C3 vs the axis definition and the kagi precedent

Read-only seat. LANE `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`, fleet root `534852203d551f38c68e3a1efd26b6fbe7663267`, kagi HEAD `c2cab35bc92e57e39e5489bac3386db078345b3f`. No file written except this report.

## 1. Axis linkage

- `AXES.md:16` — adjacency = "evidence belonging to another domain reported, not absorbed"; signal "Lane reports name contested scope; integrator arbitrates." Two clauses, two authors. C3's `disposition` set is derived from exactly these: `ruled` (arbitration exists), `contested-open` (reported, owed), `split-declared` (both sides state a boundary), `refused-route` (routed, not taken). Strongest design property C3 has.
- `AXES.md:20-22` maps "Expansion ↔ `coverage` + `adjacency`", but `LEARNING.md:33` is narrower: expansion is `improved` on "net new admitted entries on uncovered ground, each citing its coverage-map row" (`:35` = harmed on a failed entry). A checked TSV is not a `corpus/knowledge/` entry ⇒ **C3 is an adjacency axis move (`SCORECARD.md:100` = 8; `:747` "unchanged; kaidoku CDP-runtime overlap reported as contested") plus, per `AXES.md:57-64`, a capability candidate — not `expansion: improved`.** If L1 wants expansion credit, admit a note on uncovered ground whose `source:` is a mined row (`check-sources.mjs:27` admits kind `own-work`, so an own-work row is a legal carrier). PLAN §C3 lists only the TSV + checker + PROVINCE append.
- A handoff cannot substitute: `corpus/handoffs/operator-approval-request.md:1-4` — "NOT a knowledge note: it does not enter the knowledge count, the coverage map, or the expansion trend."
- `LEARNING.md:22`, `:73-78` (province = core/frontier/adjacent, "report, don't absorb") are the path form of the same axis. `PROVINCE.md` is 21 lines (Owns `:6-13`, Refuses `:15-19`, one line `:21`) — **no Adjacent section**, so C3's PROVINCE append supplies the missing third part of `LEARNING.md:75-78` independent of row count.

## 2. "Fleet convention"? There is no fleet schema — one lane schema + one fleet consumer

`grep -rn "adjacency.tsv" --include=*.md --include=*.json --include=*.mjs` at fleet root returns, outside kagi, only `.ufo/reports/round-1{6,7}/kagi.md` and wave-member files. `ls -d *-shokunin/corpus/adjacency.tsv` → kagi only. The only fleet-level reader is `.ufo/waves/shokunin12h-20261014-p1-repair/members/FleetBoundaryConnector.md:76`, which cites it **lane-unqualified**: "kagi `adjacency.tsv:82` contested with kake; kaidoku owns self-launched CDP; tabi owns webbridge CDP discipline" — that line already assigns tabi a surface kagi's row never mentions.

kagi's object: 83 lines; header `:1-46`; directives `:47-74` (5 `# own`, 4 `# owner`, 4 `# status`, 2 `# claim`, 8 `# no-enumerate`); breadth pins `:75-78`; **4 data rows** `:81-84`. Schema (`corpus/knowledge/adjacency-scope.md:82-84`) `path owner status claim basis token note` (7 cols); statuses `contested/shared-read/writer/unresolved` (`:90`). Checker `corpus/scope-gate.sh`, 1129 lines bash: R1–R13 `:31-46`, exit `0/1/2` `:49`, `die`→2 `:102`, `--falsify` `:110`, `run_case` from `:880`, R6 token/line `:36`+`:368`. **Zero git calls** (`grep -n "git " …` empty); `basis` = `path[:N|N-M]` or `lane:<lane>/<path>` (`:92`) — mutable worktree.

**Verdict: diverges on schema (correct), reuses the protocol (correct).**

| facet | kagi | PLAN §C3 | reused |
|---|---|---|---|
| name | `corpus/adjacency.tsv` | same | name only, different object |
| cols / identity | 7; host **surface root**, longest-match covers a census row, exhaustive vs `surface-census.tsv` | 9; one **claim overlap**, both sides quoted | no |
| vocab | contested/shared-read/writer/unresolved | ruled/contested-open/split-declared/refused-route | no (`contested`≈`contested-open`) |
| citation | live worktree `lane:<lane>/<path>:<line>` | `<lane>-shokunin@<40-hex>:…`, `fleet@<40-hex>:…` | no — stronger |
| quote check | token must match the cited line (`STALE-BASIS` `:36`,`:368`) | three verbatim-substring quotes | **yes, the real reuse** |
| closed sets | literals in script + directives, so data cannot invent a value (`:34-35`) | closed `disposition` | yes |
| declared classes | "unresolved … and contested are DECLARED classes: counted and printed in the summary, exit-neutral" `:30-31`, printed separately (`:894`) | `contested-open` | **partially, see §3.1** |
| falsifiers | `run_case` + `--falsify` mutate shipped data in scratch | `--self-test` + counter-mutated row red | yes |
| exit / anchor | 0/1/2; none (live FS) | 0/1/2; lane tip per C1, git blobs only | exit yes, anchor no |

Why the divergences are right: (a) **different universe** — kagi partitions host paths, but round-16's committed draft (`.ufo/waves/round-16/drafts/DraftAdjacency.md:9-18`) yields overlaps C-A (page-tool observation), C-D (agent-side bridging), C-E (tool-metadata trust), C-I (harness method), none of which is one path; `surface` holds them, `path` cannot. (b) **40-hex is a hardening of kagi's own measured defect** — `scope-gate.sh:8-11` records `README.md:76` citing `kake SKILL.md:104-107` when the claim was at `:161`; a token match catches *unrelated* text, not *stale* text. (c) **git-blob-only is forced by C1+C3 separability** (counter reads only blobs at REV; a live-FS checker would certify uncommitted bytes — the failure C1 removes). (d) **`ruled` demands a ruling line; kagi's `unresolved` demands only that one is owed** — this is `AXES.md:16`'s second clause made checkable.

## 3. Contradictions

**3.1 `contested-open` is unlandable at baseline (highest-value defect).** PLAN defines its `ruling_ref` as `fleet@<rev>:.ufo/l0-questions.md:<line>` of a `tabi | round-17 |` (or earlier tabi) line. `.ufo/l0-questions.md` = 60 lines, no header, `lane | round | text`; tabi appears only at `:25` (round-5, operator approval) and `:34` (round-1, namespace) — **no round-17 line**, and neither poses an adjacency question, so "(or earlier tabi)" does not save it. No seat may append one: it is **fleet repo** (forbidden) and absent from PLAN's L1 write list; the sibling round-17 lines (`:20` kake, `:26` kumitate, `:39` kasegi, `:60` tsukuroi) came from outside this lane. The class is not academic: round-16 asked the integrator to rule C-A/revenger, C-B, C-D, C-E (`DraftAdjacency.md:60-64`); only C-A/kaidoku was ruled (`round-16-verifier-spotcheck.md:141-142`), and C-D is live (kumitate `PROVINCE.md` K1–K5 claims `~/.kimi-code/`, inside it tabi's webbridge plugin). Unchanged, those rows get forced into `split-declared` (overclaim: nobody declared it) or dropped (the "lane reports" half of `AXES.md:16` unmet). Does **not** block the count — a `ruled` C-A/kaidoku row and `refused-route` C-E rows survive ⇒ ISSUES, not BLOCKED.

**3.2 Same filename, incompatible schema, no discriminator.** 9 cols vs 7, and the sole fleet consumer cites lane-unqualified (`FleetBoundaryConnector.md:76`). PLAN fixes only "header line then one row per overlap" — the header's *content* is unspecified, so a 7-col file at tabi's path can still be structurally clean with 0 rows; only the counter's `0→N` catches that, and the counter is not the reader.

**3.3 `tabi_ref` carries no anchor.** `sibling_ref`/`ruling_ref` have `@<40-hex>`; `tabi_ref` is a bare path with quote "at the evaluated rev". Correct in intent, but the checker must resolve it **at the evaluated rev (lane tip), not the worktree**, or a row can cite an uncommitted tabi file and pass locally while the counter at REV fails.

**3.4 Non-overlaps must not become rows.** The same draft's C-F (in-province invocation), C-G (Chromium 152-vs-154 drift), C-H (profile/port reminder), C-I (no transfer) are not sibling overlaps; transcribing 1:1 to pump N is a calibration overclaim. Guarded only if the checker requires a resolvable `sibling_quote` from that sibling's own file.

## 4. Proposed move (one, bounded, harms no axis)

**Make `contested-open` landable inside tabi's own write authority, and split the count so a declared question can never read as a verified disposition.**

1. PLAN §C3: `contested-open` `ruling_ref` also accepts `tabi-shokunin@<40-hex>:corpus/handoffs/<file>.md:<line>` (range `:N|N-M` allowed, per kagi `adjacency-scope.md:92`); the cited line must name the sibling id **and** a ruling-owed token, token `NO-OPEN-QUESTION`. Fleet l0 form stays valid.
2. PLAN `## Ownership`, L1 list: add exactly one new path, `corpus/handoffs/round-17-adjacency-questions.md`. **Do not append to** `operator-approval-request.md` — pinned at `SKILL.md:1388` (`94dc63f5fb9e`·121); an append breaks that pin (freshness harm). `corpus/handoffs/` is precedented (`operator-approval-request.md:1-4` cites kake's `cmdProbe-merge-fix.md`) and the file is tracked at baseline (`git ls-tree 5859243 -- corpus/handoffs` → 1 file), so it is 40-hex citable.
3. `measure-c3.mjs`: `c3_adjacency_verified` = `ruled|split-declared|refused-route`; `c3_adjacency_declared` = `contested-open`; print both plus total. This is kagi's own treatment — declared classes "counted and printed in the summary, exit-neutral" (`scope-gate.sh:30-31`), printed as their own fields (`run_case clean-unresolved 0 'unresolved=1 contested=1'`, `:894`) — applied to tabi's `0→N` discipline so an unanswered question cannot inflate a "verified" number.

**Axes.** adjacency (primary: the reporting half of `AXES.md:16` becomes expressible; 2 rows recoverable instead of dropped/mislabelled); operability (checker reaches exit 0 on a complete map without a dead disposition); calibration (verified/declared split kills a count overclaim). **coverage: no effect** (C2 inputs untouched). **depth/quality: no effect** beyond the rows themselves. **freshness: improves** — the open question is a 40-hex-pinned artifact and a later ruling appends a `ruled` row instead of editing prose.

**Risks.** (a) Self-attestation — a lane can write its own open question, so the row is weaker than a ruling; bounded by part 3 (never raises `verified`) and by requiring sibling+surface in the line. (b) A second carrier can become a shadow l0 list; mitigated by leaving the l0 form valid and making the `ruled` transition explicit. (c) The schema has no `supersedes` column, so a later ruling needs a new row (or a reviewed-commit disposition change — kagi's stance, `adjacency-scope.md:105` "There is deliberately no `--pin`"). State that limit; do not add a column now. **Not proposed:** renaming the file (breaks the only reader pattern), copying kagi's 7-col schema (cannot hold behavioural surfaces), a `supersedes` column (unverified until a second ruling exists).

## 5. Verification (none run here; a later seat runs these)

- `grep -c '^tabi | round-17' /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` → 0; `grep -n 'tabi' …` → `:25`, `:34`.
- `cd LANE && git show 5859243:corpus/lessons/round-16-verifier-spotcheck.md | sed -n '141p'` → "- **tabi** owns live browser/CDP page observation, including the WebMCP page-tool surface."
- `cd kagi && git show c2cab35:corpus/adjacency.tsv | sed -n '82p'` → 7 TAB fields ending `… lane:kake/SKILL.md:161  musketeer  …`; `awk -F'\t' '{print NF}' corpus/adjacency.tsv | sort -u` → `0 1 2 4 7`; `grep -n "git " corpus/scope-gate.sh` → empty.
- After implementation: `node scripts/check-adjacency.mjs --self-test` must include a 7-column foreign file at the data path failing (`BAD-HEADER`/`BAD-ROW`) and a `contested-open` row whose ref line is absent at REV failing (`NO-OPEN-QUESTION`); `node .ufo/waves/round-17/measure-c3.mjs REV` must print both counters.

All files above are read-only for this seat; §4 are L1/C3Checker/C3Counter edits, not mine. No installs or upgrades.

Files written:
- `.ufo/waves/round-17/w1/ConnAdjAxis.md`
