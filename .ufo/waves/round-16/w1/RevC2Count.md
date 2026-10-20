# RevC2Count — attack on the round-16 C2 counting rule

Seat: `TabiR16.RevC2Count-5` (reviewer, wave 1). Scope: the C2 count declared at
`.ufo/waves/round-16/PLAN.md:29` and the rule handed to `TabiR16.MeasureCounters-5`.
No lane file other than this report was written; no gate, selftest, browser, harness or
lane counter was executed. One throwaway **model of the stated rule** ran in `/tmp/c2attack`
over synthetic trees (it is not `measure.mjs`, which does not exist yet: `ls` → no such file).

## 1. The rule under attack

`PLAN.md:29` states only the count and the command:
`native-WebMCP held entries 0→1 (node .ufo/waves/round-16/measure.mjs REV --claim C2)`.
`PLAN.md:79-96` is the *artifact* contract (harness cases, receipt fields, note contents,
SOURCES writes). **There is no C2 acceptance rule anywhere in the lane contract.** C1 by
contrast has an explicit paragraph, `PLAN.md:74-77` ("counts 1 at REV only if, at REV: …").

The only C2 acceptance text is the MeasureCounters dispatch item inside the wave spec
(`.ufo/waves/round-16/w1/spec.json`, item `MeasureCounters`), verbatim:

> 1 only if at REV the note corpus/knowledge/webmcp-chromium-loopback-round-16.md exists
> with ≥1 leading `source: S###` line whose SOURCES.md row is tier A/B, status mined and
> used-by includes that note path; corpus/README.md mentions
> `knowledge/webmcp-chromium-loopback-round-16.md`; corpus/evidence/round-16/webmcp/receipt.json
> has schema tabi-round16-webmcp-v1, producerSha256 = blob sha256 of
> scripts/webmcp-loopback-round16.mjs at REV, summary.failed 0, ≥1 positive case with
> observed toolsAdded and ≥1 negative flag-off control.

That text is not committed to the lane, is not a gate input, and names no failure vocabulary.
Any `measure.mjs` satisfying it is unfalsifiable by review. See **S1**.

Baseline is the commit `e38d259` (clean). Verified absent there:
`git cat-file -e e38d259:corpus/knowledge/webmcp-chromium-loopback-round-16.md` → absent;
`:corpus/evidence/round-16/webmcp/receipt.json` → absent;
`:scripts/webmcp-loopback-round16.mjs` → absent. So both claims can only start at 0.

## 2. Attack results (model of the stated rule, `/tmp/c2attack`)

The model transcribes the quoted rule literally. Trees are synthetic; "REV" is the tree root.
Each scenario also carried 7 fixture files to test the fixture axis.

| # | Attack | Observed model result | Verdict |
|---|---|---|---|
| A | fixture growth only (7 `fixtures/*.html`, no note/receipt) | `count 0` (`note_missing`, `readme_unmapped`, `receipt_missing`) | **closed**: fixtures alone cannot flip the count |
| B | empty note (`0` bytes) | `note_source_missing` | closed |
| C | **1-line note** `source: S020`, README mention in an unrelated paragraph, receipt whose **two cases are `status:"fail"`**, `summary.failed:0`, positive `observed.toolsAdded:{"tools":[]}` | `count 1`, `readme_mention_lines:[3]`, `failing_case_names_ignored:["declarative-form","flag-off"]` | **LIVE** (S2, S3, S4, S5, S6 combined) |
| D | **stale producer digest**: receipt records digest of old producer, producer at REV differs | `count 0` (`producer_digest`) | closed |
| D2 | **stale observations**: producer unchanged, note/README/fixtures rewritten after the receipt was produced | `count 1` | **LIVE** (S7) |
| E | **queued source row** (S020 `queued`, used-by `—`) | `count 0` (`no_valid_source_row`) | closed as literal row |
| E2 | same row **text-flipped to `mined`** with `opened: 2026-10-19` (no re-open) | `count 1` | **LIVE** (S6) |
| F | `summary.failed:"0"` (string) with failing cases | `count 0` (`summary_failed`) under a strict `!== 0` reading | implementation hazard, not a confirmed hole |

Combined attack (run as `CE2_combined`): a 1-line note, a paragraph mention, a source row
text-flipped to `mined` while keeping `opened: 2026-10-19`, and a receipt whose two cases are
both `status:"fail"` with `summary.failed:0` — observed `count 1`, `reasons []`. The seven committed fixtures (`corpus/evidence/round-16/webmcp/fixtures/`,
7 HTML + README, 11:31) contribute nothing to either direction.

## 3. Findings, anchored

### S1 — blocking: the C2 rule is not in the lane contract, and the binding manifest has no C2 claim

- `PLAN.md:29` (count only) vs `PLAN.md:74-77` (C1's explicit "counts 1 only if" paragraph);
  `PLAN.md:79-96` contains no acceptance clause.
- `PLAN.md:40-50` shows a one-claim manifest example; `PLAN.md:53` says "Per claim", but nothing
  requires a C2 entry. Round 15's routed defect 1 (`corpus/lessons/round-15-verifier-spotcheck.md:120`)
  is exactly "counter identity pinned only by revision" — it recurs for C2 unless
  `corpus/evidence/round-16/measurement-binding.json` carries a `C2` claim with
  `counter.sha256`, `countedInputs`, `measuredRevision`, `before`, `after`, and `countField:
  "c2_webmcp_held"`.
- Round 15's defect 2 (`:121`, measured at `b7cf044` vs delivered `36240c7`) recurs unless the
  C2 measurement is taken at the delivered commit and the gate is run `--at HEAD`.

Verified identity fragility in the r15 precedent: `git show 27dfd98:.ufo/waves/round-15/measure.mjs | sha256sum`
→ `3ee59de0…`; `git show 9fd8bca:…` and `git show e38d259:…` → `dd9c8675…`. The same counter
path hashes differently across the revisions the round cites.

**Proposal.** L1 adds a C2 paragraph to PLAN mirroring `:74-77`, and a `C2` claim to the manifest.

### S2 — blocking: a failing receipt counts

The rule reads `summary.failed` only. It never reads `cases[].status`, never cross-checks
`summary.cases`/`summary.passed`, and never requires expected/actual agreement — although
`PLAN.md:85` requires "expected vs actual per case, `status` pass|fail". Scenario C: every case
`status:"fail"`, summary `failed:0` → **1**.

Also: `summary.failed` absent, `null`, `"0"` or `-0` are unaddressed. `Number.isInteger(0)` is
the only safe test; `!summary.failed` would accept `"0"` and `null`.

**Proposal (counter-only).** Count 1 only if, for `N = cases.length`:
- `Array.isArray(cases)` and `N ≥ 7` (the seven PLAN:85-87 cases);
- every case is an object with non-empty unique `name`/`id`, `status ∈ {pass,fail}`,
  `expected` present, `actual` present; `status === "pass"` implies `expected` deep-equals
  `actual` where both are JSON;
- `Number.isInteger(summary.failed) && summary.failed === 0`;
- `Number.isInteger(summary.cases) && summary.cases === N`;
- `Number.isInteger(summary.passed) && summary.passed === cases.filter(c => c.status === "pass").length`;
- `summary.passed + summary.failed === summary.cases`;
- no case with `status !== "pass"`.

### S3 — blocking: a one-line note counts; "held" is not distinguished from "docs-held"

The rule requires only "exists with ≥1 leading `source: S###` line". Scenario C's note is
`source: S020\n` — the whole note. But `PLAN.md:91-93` requires a decision table, observed-vs-spec
divergence, flag/version scope and limits; and `corpus/README.md:175` defines `held` as
"measured and cited", while `:186` names the weaker class `docs-held` = "admitted from opened
sources, runtime unmeasured". A 1-line note is a `docs-held` entry, not a held one.

**Proposal (counter-only).**
- Metadata block = lines before the first `^# ` heading; require `^source:` there, `^verified-at:`,
  `^recheck:`.
- The `verified-at:` line must **not** contain `locally measured: no` — the marker used by the
  docs-only notes (`corpus/knowledge/webdriver-bidi-capability-matrix.md:10`; the
  `playwright-accessible-locators-and-snapshots.md:2` verified-at line). A held entry states the
  measured runtime instead (precedent: `corpus/knowledge/aria-loopback-round-13.md:2`).
- The note must cite `corpus/evidence/round-16/webmcp/receipt.json` and
  `scripts/webmcp-loopback-round16.mjs` in its metadata block, as the r13 runtime note cites its
  producer and receipt (`corpus/knowledge/aria-loopback-round-13.md:1`).
- Structure floor: ≥5 `^## ` headings; ≥1 markdown table with ≥3 data rows; headings whose
  normalized text covers decision, divergence, flags, limits (PLAN:91-93); ≥1500 bytes outside
  HTML comments and blank lines.
- The r13 note's own admission sentence is the model for the receipt half:
  "admission requires its `verdict` to be `pass`, all declared cases to have run, and its
  independently retained execution command to exit0" (`corpus/knowledge/aria-loopback-round-13.md:9`).

### S4 — high: "README mentions" is satisfied anywhere, while the frontier still says unprobed

`corpus/README.md` at baseline says the capability is missing in four places: `:35`
"Native WebMCP in chromium 152 — unprobed", `:181` "open — still unprobed … no flag carries it",
`:194` "open — S020 opened and queued … still unprobed", `:216` (open frontier ground).
Scenario C's README mention was a plain historical paragraph (line 3), which the rule accepts.
The count can therefore be 1 while the corpus's own frontier table still declares the
capability unheld.

**Proposal (counter-only).**
- Require a coverage-map table row whose first cell is exactly
  `` `knowledge/webmcp-chromium-loopback-round-16.md` `` (row format at `corpus/README.md:141`),
  inside a `## Coverage map*` or `## Round 16*` section (`README.md:123`, `:201+`). This matches
  QUALITY rule 11 (`corpus/QUALITY.md:26-28`) and r15's `noteMap` intent
  (`.ufo/waves/round-15/measure.mjs:1307-1317`), which `README:175` already uses.
- Require the `Native WebMCP` row under `## Frontier — kaika fleet round-1` (`README.md:181`)
  and the `WebMCP spec` row (`:194`) to no longer contain `unprobed` / status `open`, and to
  point at the note.
- Exempt the round-3 block (`README.md:22-55`): `README.md:173-175` states that block "stays
  unedited". A global `unprobed` ban would be wrong; scope the check to the named row/section.

### S5 — high: fixtures are never read; growth is inert and the receipt is detached from served bytes

None of the seven committed fixtures is named by the rule. Growth cannot flip the count
(scenario A) — good — but the reverse is the hole: a receipt with zero fixture binding counts.
`PLAN.md:83` says the harness serves `corpus/evidence/round-16/webmcp/fixtures/*.html`, and the
fixtures declare exact expectations (`corpus/evidence/round-16/webmcp/fixtures/README.md`
"Driving contract"; `declarative-form.html:6` `toolname="search" tooldescription="Search"`).

**Proposal (counter-only where fields exist; see §4).**
- Every case that serves a page carries `fixture` matching
  `^corpus/evidence/round-16/webmcp/fixtures/[A-Za-z0-9._-]+\.html$` (no `..`, no absolute path,
  no `data:`), committed at REV; `fixtureSha256` equals the blob digest.
- ≥2 distinct fixtures across the positive and negative arms.
- For the declarative positive, the tool name/description in `expected` must appear as
  `toolname="<name>"` / `tooldescription="<description>"` in the named fixture bytes, and every
  `expected.inputSchema.properties` key as `name="<key>"`. (Cheap regexes; no JS parse.)
- Extra fixtures are inert: never a count input.

### S6 — high: "any mined A/B row" is too weak; the plan itself creates the cheap path

- `PLAN.md:95` instructs "S002 CDP viewer re-open for the WebMCP domain (**used-by add**)".
  S002 is already `mined`, tier A (`corpus/SOURCES.md:16`). Adding the note to S002's used-by
  satisfies the rule's "≥1 … mined" clause **while S020 stays `queued`** — so the WebMCP spec
  row (the actual scope source) need never be mined. S020 today: `queued`, `opened 2026-10-19`,
  used-by `—` (`SOURCES.md:34`).
- Scenario E2: flipping `queued`→`mined` in the cell alone, leaving `opened: 2026-10-19`,
  returns 1. `PLAN.md:94-95` requires the source be opened **this round** (2026-10-20).
- `check-sources.mjs` requires the used-by path to exist and to cite the row id
  (`:330-341`, `used_by_uncited`), but the counter does not run gates, so it must replicate it.
- The r15 histogram parser has no field-count guard
  (`.ufo/waves/round-15/measure.mjs:1276-1305`: `row.split('|').slice(1,-1)` then
  `cells[3]`/`cells[7]`); a `|` inserted inside a cell shifts `tier`/`status`, so a `rejected`
  row can be read as `mined`. The canonical gate refuses this: `fields.length !== 13`
  (`scripts/check-sources.mjs:264-274` split, `:306` length, header at `:407`).

**Proposal (counter-only).**
- Parse rows exactly as `check-sources.mjs`: `line.split('|')`, require `fields.length === 13`,
  `fields[1]` matches `^S\d{3,}$`; tier `fields[4] ∈ {A,B,C}`, status `fields[8] ∈
  {queued,mined,rejected}`; a malformed WebMCP row fails closed.
- Parse **every** `S\d{3}` token in every leading `source:` line (the corpus convention packs
  several ids into one line: `playwright-accessible-locators-and-snapshots.md:1`); every id must
  resolve and satisfy: tier A/B; `status === "mined"`; `used-by` split on `[,;]`, trimmed, contains
  exactly `corpus/knowledge/webmcp-chromium-loopback-round-16.md`; `opened === "2026-10-20"`;
  the note body contains the id (replicates `used_by_uncited`); `recheck` unchanged from the
  historical row or refreshed with a dated note.
- At least one cited row's `scope` must match `/WebMCP/i` — S002's scope is "CDP support posture
  and the `/json/*` HTTP endpoint contract", so the S002-only path fails.
- Reject `rejected` rows outright (no flip back without reason).

### S7 — medium: stale *observations* still count when the producer blob is unchanged

The producer-digest check works for a stale recorded digest (scenario D → 0). It does not bind
anything else: if the receipt was produced at revision X and the note, README, fixtures,
protocol-domain or runtime-pin changed before REV while the producer blob stayed identical, the
recorded observations no longer describe REV, yet 1 is returned (D2).

**Proposal (needs one contract field; see §4).** Accept either:
- `receipt.measuredRevision` (40-hex, ancestor-or-equal of REV) with `producerSha256` equal to the
  producer blob at **both** revisions, and `git diff --name-only measuredRevision REV --
  <countedInputs>` empty (this is BindCore's `counted_input_changed`, `PLAN.md:56-57`, reused); or
- a committed digest map `receipt.inputs: { "<repo path>": "<64-hex>" }` covering note, README,
  SOURCES.md, producer, runtime-pin, protocol-domain and each fixture, each recomputed at REV.

Also: `producerSha256` must be 64-hex and the producer blob must exist at REV. If the producer is
absent, a `null === null` comparison must not pass; return 0.

### S8 — medium: runtime and protocol pins are unread

`PLAN.md:88-89` requires `runtime {chromium version, executable sha256, playwright, node}` and
`protocolDomain`. The rule reads neither. The committed pins already exist:
`corpus/evidence/round-16/webmcp/runtime-pin.json` records Chromium 154.0.8037.97 and the
executable digest `95b17db7…` inside a `commands[]` stdout string (`runtime-pin.json:8,13`), and
`protocol-domain.json` carries the full flagged-run `webmcpDomain` (`:436`) plus
`webmcpDomainIdentical: true` (`:699-701`).

**Proposal.** Compare `receipt.runtime` to the pin, and `receipt.protocolDomain` to
`protocol-domain.json`'s `runs[label=="webmcp"].protocolEndpoint.webmcpDomain` (deep equality;
`domain === "WebMCP"` and the `toolsAdded`/`toolsRemoved` events present). To make this
implementable, `WebmcpRuntimePin` should expose structured `chromium.version`,
`chromium.executableSha256`, `playwright.version`, `node.version` instead of relying on
`commands[].stdout` text.

### S9 — medium: `inputsRead` is not bound to `countedInputs`; no mode/symlink refusal

The dispatch requires `inputsRead` "for the binding manifest's countedInputs" but nothing makes
the two agree. A counter that reads protocol-domain, runtime-pin or fixtures while omitting them
from `countedInputs` leaves those inputs uncounted by the gate — the C1 defect class again.
`corpus/QUALITY.md:10-12` (rule 6) requires a lane gate to pin inputs, refuse symlinked or
non-regular inputs, and assert each refusal.

**Proposal.** Emit `inputsRead` sorted from the same list used to perform reads (single source of
truth, not a second hand-written list); require the C2 claim's `countedInputs` ⊇ `inputsRead`
(add a `counted_input_unlisted` finding on BindCore). Use r15's mode guard for every path read
(`.ufo/waves/round-15/measure.mjs:253-269`: tree mode must be `100644`/`100755`, symlinks and
directories return null → missing).

### S10 — low, verified non-defects

- Baseline must return 0 for both claims: all four C2 paths are absent at `e38d259`
  (`git cat-file -e` above), and S020 is `queued` (`SOURCES.md:34`).
- Causal separability holds as declared (`PLAN.md:31`): C2 reads the note/README/SOURCES/receipt/
  pins only; C1 reads the binding gate and its receipts. Sharing README/SOURCES with the
  histogram is not a C1↔C2 dependency.
- The producer-digest-at-REV check does reject a stale recorded digest (D → 0).
- A literal `queued` row cannot satisfy the rule (E → 0), and `summary.failed:"0"` is rejected by
  a strict integer test (F → 0).

## 4. Contract additions needed to make S2–S9 checkable

These are L1/harness-owned, not MeasureCounters. Without them the counter cannot count 1 on an
honest round, so they must be pinned **before** the harness's single committed run:

1. Receipt: `measuredRevision` and/or `inputs` digest map (S7); per-case `name`/`status`/
   `expected`/`actual` is already promised by `PLAN.md:85`; `summary` with integer
   `cases`/`passed`/`failed` (already in `PLAN.md:88`), plus top-level `verdict: "pass"` and
   `exit: 0` to match the r13 receipt model (`aria-loopback-round-13.md:9`).
2. Cases: per-case `fixture` + `fixtureSha256`; a `control: "flags-off"` marker (or the name
   `flag-off`) so the negative is unambiguous; the declarative positive's `expected` carries the
   exact `name`/`description`/`inputSchema` (S5).
3. `runtime-pin.json`: structured `chromium.{version,executableSha256}`, `playwright.version`,
   `node.version` (S8).
4. `protocol-domain.json`: keep `runs[1].protocolEndpoint.webmcpDomain` and the comparison flags;
   the counter compares against them (already present).
5. `measurement-binding.json`: a `C2` claim (`counter.{path,sha256,argv,countField:
   c2_webmcp_held}`, `countedInputs` = note, README, SOURCES.md, receipt, producer, runtime-pin,
   protocol-domain, fixtures/, `before/after`).
6. PLAN: a C2 paragraph mirroring `PLAN.md:74-77` with the failure vocabulary, so the counter's
   rejects are auditable against the contract rather than the dispatch text.

## 5. Residual risk and verification gaps

- The scenario verdicts come from a **model** of the stated rule, not from `measure.mjs` (it
  does not exist; `ls .ufo/waves/round-16/measure.mjs` → no such file). A stricter implementation
  could reject C/D2/E2; that is exactly the problem — the rule text does not require it, so the
  green count would depend on an unstated choice.
- The receipt and note do not exist yet; all receipt-side attacks are against the PLAN:88-90
  field list, not observed bytes. `producerSha256` cannot be verified against a real receipt
  until WebmcpHarness lands. The harness has not run (no `scripts/webmcp-loopback-round16.mjs`).
- No browser was launched and no loopback server was contacted; the Chromium/Playwright facts in
  this report are the committed pins' and PLAN's, not re-measured here.
- I did not run the fleet census, `check-sources.mjs`, the binding gate, or any lane selftest
  (lane bounds). The row counts in §3 come from direct `awk` reads of `corpus/SOURCES.md`.

## 6. Commands actually run (observed)

- `git cat-file -e e38d259:<path>` for the four C2 paths → `absent` each (printed above).
- `git show 27dfd98:.ufo/waves/round-15/measure.mjs | sha256sum` → `3ee59de0…`; `9fd8bca` and
  `e38d259` → `dd9c8675…`.
- `awk -F'|' '/^\| S020 /{…}' corpus/SOURCES.md` → `5=[ A ] 9=[ queued ] 10=[ 2026-10-19 ] 12=[ — ]`.
- `awk -F'|' '/^\| S0[0-9][0-9] /{…}' corpus/SOURCES.md` → 29 rows, S020 queued.
- `python3 /tmp/c2attack/rule-model.py <tree>` for scenarios A/B/C/D/D2/E/E2/F/CE2_combined (outputs in §2).
- `find corpus/evidence/round-16 -type f` → 7 fixtures + fixtures/README, runtime-pin,
  protocol-domain, binding/r15-counter-identity; no receipt, no harness.
- Tool installs/upgrades: none.
