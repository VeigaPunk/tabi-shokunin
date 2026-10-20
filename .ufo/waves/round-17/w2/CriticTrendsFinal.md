VERDICT: ISSUES

Attacked: the three trend verdicts the round-17 report can defend at M=6c97851 (B=5859243). Measured counts were taken as given: C1 0→4, C2 0→1, C3 0→9. The wave-1 pre-attack `w1/CriticTrends.md` T1–T11 was re-checked against the bytes that actually landed at M and against drafts `drafts/{report,quality,lesson-r17}.md`.
Seat TabiR17.CriticTrendsFinal. Writes went only to sandbox `/tmp/tabi-r17w2-CriticTrendsFinal-ybQp` (removed) and this file. Tools installed: none.
Rules: `/home/vgpnk/Projects/shokunin/LEARNING.md:31-38,42-48,59`; prompt `.ufo/prompts/tabi-round-17.md:116-117,293-295`.

## What is (not) at M — observed
- `git diff --name-only B M -- corpus/QUALITY.md SCORECARD.md LOG.md SKILL.md PROVINCE.md corpus/lessons` is empty. No QUALITY row, no `round-17.md` (no Gate, no Mistakes), and no SCORECARD capability row exist at M.
- Landed at M: README +47 (map row for the note, frontier status, U3 index row, adjacency paragraph, binding history label), SOURCES S041–S053, the note, routed 1–3 evidence and `adjacency.tsv`.
- Knowledge notes: `git ls-tree … corpus/knowledge | grep -c .md` gives 33 at B and 34 at M.
- Re-runs in a sandbox clone at M:
  - `measure-c2.mjs M` → `c2_invocation_held:1, failures:[]`.
  - `measure-c3.mjs --fleet-root <fleet> M` → 9 (ruled 1, contested-open 2, split-declared 2, refused-route 4).
  - `check-round-contract` → `ROUND_CONTRACT verdict=clean rounds=10`.
  - `check-user-round-contract` → `verdict=failed finding=round_count … 6 user rounds, expected 10`. This is already red in `harm-baseline.json .alreadyRed`, so it is not a regression.
  - `--self-test` exit 0 for all four gates: round 38 cases, user 45, binding 76, adjacency 51.
  - `check-measurement-binding --check corpus/evidence/round-16/measurement-binding.json` (default lane tip = M) → rc=1, `C1 counted_input_changed paths=scripts/check-measurement-binding.mjs,scripts/selftest-measurement-binding.mjs`, `C2 counted_input_changed paths=corpus/README.md,corpus/SOURCES.md`.
  - The same check with `--at 1205d261…` → rc=0, `verdict=clean claims=2 bound=2`, which equals routed-3 `check-at-1205d26.json`.

## Expansion — defensible: `improved`, scoped; holds only after integration
Is the invocation note on uncovered ground? Yes, for the receipt-held part.
- The map row `README:293` (r16 note) holds registration only.
- `README:302-303` lists "tool invocation as committed evidence" as still open.
- The r16 note says "invocation is a probe observation only" (`webmcp-chromium-loopback-round-16.md:127`).
- The r17 map row and frontier status cite that clause (`README` round-17 section, the `:303` clause). This closes w1 T4.

The note's `source:` S041–S048 rows are all `mined` with the note in used-by (checked with awk on SOURCES at M). The C2 counter agrees.

Counterexample to a "0→1 new ground" reading. The r16 probe `.ufo/waves/round-16/probes/WebmcpProbeInvoke.json` already holds 4 of the 11 required behaviours:
- echo success;
- `unknownToolInvoke` -32602;
- `invokeBeforeEnable` -32000;
- `invalidInputInvoke` → `Completed`, `echo:undefined`. This is the receipt's `invoke-input-schema-mismatch` shape.

The note's prior-state sentence (`webmcp-invocation-round-17.md:22-25`) names the first three and omits `invalidInputInvoke`. The note's "seven behaviours" list (`:26-29`) does not over-claim, but a reader who computes new = 11 − 3 gets it wrong.

Credit split:
- Expansion gets the 7 listed behaviours plus the two invoke controls absent from r16: flags-off `invokeTool` and domain-disabled -32601.
- Quality gets probe→receipt supersession for success, unknown-tool, before-enable and schema-mismatch.

Preconditions for `improved`. Without them, report `unchanged`:
- (a) the `round-17.md ## Gate` admits the note;
- (b) the SCORECARD capability row `webmcp-cdp-invocation` cites the harness command and the 11/11 receipt;
- (c) the measured revision is at or after those appends.

Not expansion:
- C3/`adjacency.tsv` is a boundary record, not a knowledge entry, frontier, source kind or capability. LEARNING:85 maps the adjacency *axis* to expansion, but the trend observable is `:33`.
- S049–S052 are queued.
- S053 is a reject.
- Put "Sources 40→53" in its own sentence under Sources & frontier.

Wording to avoid:
- "first WebMCP invocation" or "invocation was unprobed";
- "agent can invoke page tools";
- "spec-conformant";
- "coverage 9→10".

Use instead: "receipt-held CDP `WebMCP.invokeTool` on Chromium 154.0.8037.97, flags on, loopback fixtures; r16 held it as probe-only (note :69-74, probe JSON); agent-side consumption open".

## Quality — defensible: `improved`; two open traps would flip it to `harmed`
Valid evidence (entries re-verified or superseded):
- Routed 1: `corpus/evidence/round-17/routed/liar/receipt.json` rebuilds the three liar commits from committed blobs. Hardened counter 0/0/0, honest b444ca8 1. Pre-hardening column 1/0/1. This makes the r16 mistake row `round-16.md:88` reproducible. README "Limits" keeps the finite-shape wording.
- Routed 2: receipts at gate `1f84fb54…` (59 cases), with the r16 43-case receipts labelled history in README.
- Routed 3: the receipt at 1205d26, reproduced clean above.
- Routed 4: the U3 index row naming `browser-surface-census.md:188`. Line 188 at M is the U3 line.
- The probe→receipt supersession above.
- r16 `:61` "signal … second argument" is disambiguated, not falsified. The r16 fixture uses `registerTool(…, { signal: ac.signal })` (`round-16/webmcp/fixtures/lifecycle.html:67`). Say "disambiguated", never "corrected" or "was false".

Not evidence for the quality trend:
- the C1 count (an operability axis move);
- "counts digest-bound at delivered tip" (`drafts/report.md` trend placeholder). The r17 manifest is not at M, and this restates r16's basis;
- "preflight failure kept" (honesty, not supersession);
- seat counts.

No harm observed at M (gate list above). Required wording for the r16 manifest: "clean at 1205d26 (receipt); `counted_input_changed` at the r17 tip by design (C1 checker files, C2 README/SOURCES)". Never write "r16 binding still clean". Never call the red a regression.

Trap Q1 (would be `harmed`). r16 note `:133-136` still says "contested scope awaiting an integrator ruling". The ruling is recorded in `adjacency.tsv`, in the README round-17 paragraph and in r17 note `:101-104`, but none of them names the frozen line `webmcp-chromium-loopback-round-16.md:135`.
- The lane's own draft criterion 31 (`drafts/quality.md` §31: "the supersession names the frozen path and line … not only a label") would fail its own round.
- Repair: one README append row: `knowledge/webmcp-chromium-loopback-round-16.md:133-136` → `corpus/adjacency.tsv` row `cdp-runtime-observation` + `corpus/lessons/round-16-verifier-spotcheck.md:141-142`, status "ruled; pinned bytes unchanged".

Trap Q2 (contradictory authority). QUALITY 22 (`corpus/QUALITY.md:79-80`) still requires `--at <delivered HEAD>`. Draft 29 says a certifying gate reads "the branch tip, never git `HEAD`", and `grep -n 'delivered HEAD\|refines 22'` finds no refinement of 22 in drafts/quality.md.
- Repair: 29 (or a new row) states "Refines 22: `<delivered HEAD>` means the 40-hex of local `refs/heads/master` at delivery, never the symbol HEAD".

Also say "freshness re-verification S001–S019 carried" (`SCORECARD.md:770`). The quality bullet must not imply freshness.

## Discernment — defensible: `unchanged` (author-side); claiming `improved` is contestable
- At M, nothing exists to score: no QUALITY row and no lesson.
- The r17 outside spot-check does not exist yet.
- The r16 spot-check agreed on all 7 sampled gate decisions (`round-16-verifier-spotcheck.md:111-119`). Its findings (`:76` "unforgeable" in the *author summary*; routed 1–4 against evidence/report lines) are not disagreements with gate admit/reject decisions.
- LEARNING:35's second route ("a disagreement becomes a lesson that adds a grounded criterion") therefore applies only on a broad reading.
- If the L1 claims `improved` anyway, the only honest form is: "improved (author-side candidate, route 2 read broadly: r16 outside findings :76, :148-152 → lesson-backed QUALITY 26–32); r17 outside admit/reject agreement pending; closure decides".

Harm traps in the drafts:
- D1: draft criterion 29 cites `(source: …JjAuditTabi.md F1–F3)` and no lesson. The other six carry `(lesson: …)`. LEARNING:35/59 makes a lessonless criterion a `harmed` discernment.
  - Repair: cite `corpus/lessons/round-17.md#mistakes` (draft row 4, "gates anchored on git HEAD under jj colocation"). Land that row in the same commit.
- D2: the `drafts/report.md` discernment evidence placeholder "RevKaidokuRuling ISSUES P1–P3 disposition" is a lane-dispatched seat. LEARNING:45-46 says "a subagent the lane dispatched is still the lane". Never present it as outside agreement.
- D3: every routed item 1–5 needs a fix or a why-not in the report (prompt :293-295). Routed 5's kaidoku half is kaidoku's; say so. 6–7 are carried.
- D4: "unforgeable" must not reappear. The draft 27 wording ("finite set of shapes it defeats") is the right template. The C2 (3 probes) and C3 ("red on a counter-mutated row") counter prose must list their shapes.

## Other wording defects
- `drafts/report.md` C1 bullet: "0→4 of 8 behavior-bearing (4 label-only, not credited)" is self-contradictory. There are 8 entries, of which 4 are behavior-bearing. Use: "0→4: all 4 behavior-bearing entries of the 8 pass; 4 label-only witness entries reported, not credited (`w1/C1Counter.md:104-114`)".
  - Never "jj-safe", "landed" or "pushed tip". Use "local `refs/heads/master` anchor when HEAD is detached" (w1 T11 stands).
  - The `measurement-binding-round16-manifest` entry is credited for anchor stability while its verdict is red (exit 1 in all arms). Never imply it is clean.
- C3 reproducibility (corroborated by TabiR17.CriticC3Final, its F7):
  - `measure-c3.mjs:1100` derives `ownToken` from the clone's basename. A clone at `…/r` gave `c3_adjacency_verified:8`, with row 2 failing `ruling_venue`, while `check-adjacency.mjs` gave `verified=9`. Renamed to `…/tabi-shokunin`, the same clone gave 9.
  - Do not write "an outside verifier re-derives 9 from any clone" until the counter uses the constant `tabi`. Adjacency-axis wording only; this does not affect trends.

## Smallest safe corrections (L1, before the measured revision)
1. README append row for r16 note `:133-136` → `adjacency.tsv` ruled row + spotcheck:141-142 (Q1).
2. A QUALITY row refining 22's "delivered HEAD" to the 40-hex local `refs/heads/master` (Q2).
3. Draft 29 cites `round-17.md#mistakes` row 4 (D1).
4. A `round-17.md ## Gate` line: "r16 probe already held echo/unknown-tool/before-enable/invalid-input (`WebmcpProbeInvoke.json`); expansion credited only to the other 7 behaviours + 2 invoke controls; reverses r16 Gate reject `round-16.md:30` because a receipt with code-fixed predicates now exists".
5. Trend wording exactly as above. Expansion and quality each say "improved"; with Q1/Q2 open, quality is `harmed` and the pair is a trade (LEARNING:37-38), not admitted.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w2/CriticTrendsFinal.md
