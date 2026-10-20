# CriticTrends — round 16 wave 1 (critic, pre-judgment of trend verdicts)

Seat `TabiR16.CriticTrends-5`. This is advice from the author side, not certification from a non-author. I ran no gate, selftest, counter or browser. I installed nothing (tools: none).

## Rule anchors (what the verdicts are judged against)

- Trend table: `/home/vgpnk/Projects/shokunin/LEARNING.md:31-35`. Trade rule: `:37-38` says `expansion: improved` together with `quality: harmed` is a trade and is never admitted. Discernment must come from an outside check: `:40-48`.
- `CORPUS.md` (protocol) rule 4, lines 123-125: "Expansion is knowledge, not rows". It counts admitted `knowledge/` entries whose `source:` cites a `mined` row on uncovered coverage-map ground. There is no row quota. Status enum: `:103-104`. Append-only rule: `:116-118`. Only status, recheck and used-by change in place. A correction is a new `supersedes S0NN —` row.
- `AXES.md:57-64`: a capability row enters only with a passing demonstration in the round report.
- Precedent: the round-15 outside closure judged expansion by notes and capability: "Census 29→29 … 32 knowledge notes; no capability" (`corpus/lessons/round-15-verifier-spotcheck.md:114`). It judged discernment by sampled agree/disagree plus a lesson-routed erratum (`:116`).

## State observed this session

- `ls corpus/knowledge | wc -l` → `32`. `pacman -Q chromium` → `chromium 154.0.8037.97-1`.
- `git status --porcelain` → only `?? .ufo/waves/round-16/` and `?? corpus/evidence/round-16/`. Neither `measure.mjs` nor the note exists yet, so every counter condition below is unrun.
- SOURCES kind×status (awk over `corpus/SOURCES.md` `$4`,`$9`): code mined 2 · community rejected 2 · docs mined 18 · docs queued 1 · own-work mined 1 · paper mined 2 · paper queued 1 · spec mined 1 · spec queued 1. **S020** (`corpus/SOURCES.md:34`) is `queued`, its used-by is `—`, and its anchor is "CG-DRAFT 2026-10-16, revision f14762e6".
- The coverage map lists WebMCP as uncovered ground in five places: `corpus/README.md:35`, `:181`, `:194`, `:216`, `:283`. The census holds it as `browser-surface-census.md:153` and U3 at `:188-189`.

## Strongest counterexamples (from this session's evidence)

### X1 — S020 does not define declarative form tools, so it cannot back the declarative half of C2

- Fetch method: `curl https://raw.githubusercontent.com/webmachinelearning/webmcp/<rev>/index.bs`, accessed 2026-10-20.
  - `f14762e6` → http 200, 87973 B, sha256 prefix `eab56a31bc3b3934`.
  - `cb3d16964ab3e92cfd5f09901ed0504373a906e8` → http 200, 88074 B, sha256 prefix `dabc073a28a21131`.
- `grep -nE 'navigator\.modelContext|toolname|tooldescription'` → no hits at either revision. `grep -ciE 'declarative|<form'` → `0`.
- The rendered spec (https://webmachinelearning.github.io/webmcp/, read 2026-10-20) has meta-revision `cb3d1696…` and is titled "Draft Community Group Report, 20 October 2026".
- **Impact.** The fixture `<form toolname=… tooldescription=…>` (PLAN.md:21-22) and the `FormModelContext*` strings (PLAN.md:27-28) are Chromium-implementation surface only. A note that cites `source: S020` for declarative behavior has false provenance. QUALITY14 forbids a spec reading from justifying observed host behavior (`corpus/QUALITY.md:31-35`).
- **Correction.** The declarative claims must rest on the own-work receipt and/or a newly opened Chromium source row (kind `code`, A). S020 backs only the imperative IDL and its semantics.

### X2 — "document vs navigator" is not a divergence from the spec; it is the lane's own unsourced guess

- At both revisions the spec's IDL reads, at `index.bs:651-653` (f14762e6) and `:652-654` (cb3d1696): "partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; };". The rendered page shows the same IDL at artifact lines 458-459.
- `diff` between the two revisions is a single added line: `Editor: Samuel Dallstream …`. The S020 anchor `f14762e6` is therefore still textually valid for the IDL. The spec shows no drift since the row was opened.
- The lane's held text did the guessing:
  - `browser-surface-census.md:188` names "`navigator.modelContext` etc." with no source.
  - `corpus/README.md:181` (2026-10-19, the same day S020 was opened) repeats `navigator.modelContext`.
- **Impact.** The knowledge note's planned "observed vs spec divergence" section (PLAN.md:92) must not present `document.modelContext` as a divergence. Doing so would overclaim against the spec. The real divergences to record are:
  - the declarative tools (absent from the spec);
  - flag gating (spec-silent);
  - any observed IDL member that the spec lacks or that the build lacks.
- This is also the honest Mistakes row for draft QUALITY23 (see D2).

### X3 — Source rows are not expansion, and a new kind of source is not expansion either

- Every row added this round (Chromium code, the CDP viewer re-open, a `/json/protocol` tool row, binary strings) is curation. PLAN.md:32 already says so. The report must keep "rows 29→N" and "notes 32→33" in separate sentences.
- A `tool`-kind row would be the first of its kind (the histogram above has none). LEARNING:33 lists "new kinds of source" as an observable. Rule 4 (`CORPUS.md:123-125`) still decides: rows are not the verdict.
- **False provenance to prevent.** The `kWebMCP…`/`FormModelContext…` strings in PLAN.md:25-28 come from the shipped binary, not from Chromium source. A row for them is own-work (or `tool`) evidence of the 154 build. It is not tier-A `code` for source semantics.

### X4 — The draft scorecard puts the wrong file in the counter-identity field (the round-15 defect-1 class again)

- `.ufo/waves/round-16/drafts/DraftScorecard.md:19` gives the C2 "counter digest" as the sha256 of `scripts/webmcp-loopback-round16.mjs`. The counter is `.ufo/waves/round-16/measure.mjs` (PLAN.md:29, :44). The harness is the producer, so its digest is `producerSha256` and a counted input.
- Recording the harness digest as the counter digest repeats exactly the identity confusion that round-15 routed defect 1 named (`round-15-verifier-spotcheck.md:120`).
- **Correction.** Both claims use `counter.path = .ufo/waves/round-16/measure.mjs` with that blob's digest. The harness digest goes into the countedInputs and receipt fields.

### X5 — A self-refuting binding layout (affects the quality trend's "no failed re-check" condition)

- Suppose the manifest `corpus/evidence/round-16/measurement-binding.json` is committed after `measuredRevision`, and a claim's `countedInputs` contains the prefix `corpus/evidence/round-16` (or `…/round-16/webmcp/` where the manifest or note lands).
- Then `--check --at <delivered HEAD>` reports `counted_input_changed` on the round's own manifest (PLAN.md:57). The binding gate then fails the very round it is meant to certify.
- **Correction.** Declare narrow countedInputs: exact receipt paths, the note path, and the README/SOURCES files only when the counter reads them. Keep the manifest outside every claim's input set. Run `--check` against the delivered HEAD, not against the measured revision (routed defect 2, `:121`).

### X6 — Duplicate authority and novelty overclaim

- `browser-surface-census.md:149-152` already records an adjacent CDP WebMCP observer: `rea-agents` `discover-webmcp-tools`, anchored in the kaidoku corpus.
- **Impact.** The capability `webmcp-cdp-observation` is new for the lane's coverage map, which is the bar that counts (LEARNING:33). The note and the capability line must not claim it is the first or only CDP WebMCP observation on the host. They should name the adjacent tool, per PROVINCE "report, never absorb".

### X7 — Version and flag scope

- The frontier row is "Native WebMCP in chromium 152" (`README.md:35`, `:181`). The host now has 154.0.8037.97 (pacman build date 09 Oct 2026, per `w1/WebmcpRuntimePin.md:9`). Chromium 152 can no longer be probed on this host.
- The pre-probe exposes the API only with `WebMCPTesting` in both flag lists (PLAN.md:18-19). With no flags there is no `document.modelContext` (PLAN.md:23).
- **Required wording.**
  - The note must say: "154, flag-gated, including a *Testing* feature; default-off observed".
  - U3 is answered for 154 only. It is not answered for 152.
  - If the flag ablation (the WebmcpProbeFlags seat) does not establish a minimal set, the note says minimality was not tested.
  - "Native WebMCP is available in Chromium" is a reject candidate, not an admit.

## Pre-judgment per trend

### expansion

**`improved` is honest only if all of the following hold at the delivered HEAD:**

1. The count of `corpus/knowledge/*.md` goes 32→33 through `corpus/knowledge/webmcp-chromium-loopback-round-16.md`. In the same commit, an appended README coverage row maps it (QUALITY11, `corpus/QUALITY.md:26-28`), and an appended frontier status marks native WebMCP as held, scoped to 154 with flags.
2. Every `source:` line in the note cites a row that is `mined` at that HEAD, with used-by containing the note path.
   - S020 flips queued→mined only if the note cites it for IDL/semantics claims. The flip is logged old→new in the round-16 lesson.
   - Runtime claims cite the own-work receipt row. Declarative claims never cite S020 (X1).
3. The capability row `webmcp-cdp-observation` enters the capabilities table only if the round report shows a passing demonstration (`AXES.md:62-64`). Minimum: the flag-off negative control plus the declarative positive case (`DraftScorecard.md:36`). The capability's one-line description claims only the cases that passed. For example, if the imperative or `toolsRemoved` cases fail, "can observe registration/removal" is not claimed.
4. The C2 counter (`measure.mjs --claim C2`) counts the admitted note plus a passing receipt. It never counts SOURCES rows or fixtures.
5. Source-row and kind changes are reported as curation (X3).

**Refuted (verdict becomes `unchanged`, or `harmed` once admitted) if any of these is true:**

- The note is uncommitted or unmapped at the delivered HEAD.
- Any `source:` row is still `queued`, or does not have the note in used-by.
- S020 is cited for declarative behavior (X1). Once admitted, that makes expansion `harmed`: "an admitted entry fails the bar it was admitted under".
- The receipt has a failed required case, but the note or capability asserts it.
- The note frames `document.modelContext` as a spec divergence (X2).
- The note generalizes beyond 154 plus flags plus loopback (X7).
- The C2 count can move by adding rows or fixtures alone. That is the inflation test: delete the note at REV and the count must drop to 0.

### quality

**`improved` is honest only if both of the following hold, with no admitted entry failing its re-check:**

1. Stale entries are marked with append-only text that names the new note.
   - The census U3/§3.4 (`browser-surface-census.md:153`, `:188-189`) gets an erratum block in its `## 6. Errata` section.
   - The README frontier rows (`:35`, `:181`, `:194`, `:216`, `:283`) get an appended status block.
   - The erratum records that `navigator.modelContext` was an unsourced name (X2).
2. Round-15 C1/C2 measurements gain a stronger, explicit identity record. The legacy receipt and `r15-counter-identity.json` should carry:
   - the blob digests at 27dfd98, b7cf044 and 36240c7;
   - which counter revision reproduces which receipt.

   This leaves the r15 bytes untouched, so "historical evidence immutable" holds.

**Refuted:**

- **`harmed`** if the note is admitted while census U3 and the README "unprobed" rows stay unmarked. That is "an entry found … stale and left unmarked" (LEARNING:34).
  - Expansion improved plus quality harmed is then a trade, and the round is not admitted (LEARNING:37-38).
- **`harmed`** if the binding gate's `--check` at the delivered HEAD returns any finding on the round's own manifest (X5), or if the C2 counter-digest field names the harness (X4). Either way the round's own provenance claim fails its re-check.
- **`unchanged`** if only new artifacts land and no held entry is re-verified, superseded or qualified.
- Optional strengthening, not required for a non-harm verdict: SKILL.md:1767-1771 states the round-14 Node distinction correctly but does not point to the erratum (`round-15-verifier-spotcheck.md:90-101`), which round-15 routed defect 3 asked for.

### discernment

LEARNING:35 offers two routes to `improved`:

- **(a)** an outside spot-check agrees on admits and rejects. Round 16's outside check runs after the round, so the lane cannot claim this route.
- **(b)** a disagreement becomes a lesson that adds a grounded QUALITY criterion.

Round 15's outside sample was 4/4 `agree` (`:81-86`). Its routed defects 1/2 (`:120-121`) are provenance findings, not admit/reject disagreements. Route (b) therefore applies only under the reading round 14/15 already used: an outside defect that the gate missed becomes a lesson-backed criterion (SCORECARD.md:646-648, :720-722, accepted by the r15 closure at `:116`).

**`improved` is honest only if all three hold:**

- **D1.** QUALITY22 (`drafts/DraftQuality.md:1-7`) cites a round-16 lesson `## Mistakes` row that quotes the r15 defect lines and names what missed them. The criterion is enforced by the gate's selftest and exercised by legacy mode with exit 1 (PLAN.md:64-67, :76-77).
- **D2.** QUALITY23 (`DraftQuality.md:8-13`) has its own grounded Mistakes row: census U3 and README:181 carried an unsourced `navigator.modelContext` after S020 (opened 2026-10-19, rev f14762e6) already defined `Document.modelContext` (X2).
  - The draft clause "test surface … not `data:`" needs evidence: an observed `data:` failure, or a recorded `isSecureContext` per case.
  - [INFERENCE] The spec's `[SecureContext]` IDL implies opaque-origin `data:` documents lack the attribute. This is not observed.
  - Without that evidence, drop the clause or mark it inference.
- **D3.** The round-16 lesson `## Gate` lists at least one real admit and at least one real reject, so the outside verifier can sample both (LEARNING:44). Candidate rejects, each with its reason:
  - "native WebMCP available unflagged";
  - "`navigator.modelContext` exposed";
  - "S020 backs declarative tools";
  - "agent integration";
  - "rows/kinds counted as expansion".

  The verdict wording must read "outside round-16 agreement pending". Never call a lane seat a non-author.

**Refuted:**

- **`harmed`** if QUALITY23 (or any new criterion) lands without a Mistakes row behind it (LEARNING:35, "criterion added with no lesson behind it").
- **`unchanged`** if QUALITY22 lands without gate enforcement, or the lesson only restates the r15 lines. The lane may also choose `unchanged` under the strict reading that 4/4 agree means no disagreement to learn from. That is defensible, but it is a departure from r14/r15 practice, so the round should state which reading it uses.
- **Downgraded on the later outside check** if the verifier disagrees with the C2 admit, for example because S020 is cited for declarative behavior or because of version or flag overgeneralization.

## Smallest safe corrections (summary)

1. **Note provenance.** S020 backs the IDL only. Declarative claims and flag gating rest on the own-work receipt or a new Chromium `code` row (X1).
2. **Divergence section.** Drop "document vs navigator". Record declarative (not in spec) and flag gating instead (X2).
3. **Counter digest.** Use the `measure.mjs` digest for both claims. The harness digest is producer/input only (X4).
4. **Binding layout.** Keep the manifest outside countedInputs. Run `--check` at the delivered HEAD (X5).
5. **Stale entries.** Append an erratum to the census and a status block to the README for every "unprobed/navigator" location, in the admit commit (quality non-harm).
6. **QUALITY23 grounding.** Ground it in the census U3 mistake. Remove the `data:` clause or back it with evidence (D2).
7. **Lesson Gate.** Include at least one real reject (D3).
8. **Report wording.** "Rows 29→N" and "notes 32→33 / capability +1" go in separate sentences. Only the second carries the expansion verdict.
