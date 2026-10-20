VERDICT: ISSUES

# CriticTrends — round 17 wave 1 (pre-attack of trend verdicts; author-side advice, not certification)

Seat `TabiR17.CriticTrends-2`. Read-only. I ran only git reads, rg, jq and sed. I ran no gate, counter, selftest or browser. Tools installed/updated: none.
Axes: expansion (C2, C3 mapping), quality (C1, routed 1-4), discernment (routed "unforgeable", QUALITY rows). Rules: `/home/vgpnk/Projects/shokunin/LEARNING.md:31-38,42-48,59,84-86`.

## Attacks

### T1. "the r16 report word 'unforgeable'" (PLAN.md:169). Verdict: FAILS as worded
- Evidence: the word appears in no committed report or lane file:
  - `rg -i unforgeable` over the lane, `.ufo/reports` and `.ufo/waves/hyaku` hits only spotcheck:76, PLAN:169 and r17 w1 spec/validation prompts;
  - `git -C tabi-shokunin grep -i unforgeable 1205d26` exits rc=1;
  - fleet `git log --all -S unforgeable -- .ufo/reports` is empty.
- The closure locates it in "The author summary" (`corpus/lessons/round-16-verifier-spotcheck.md:76`), i.e. the uncommitted L1 completion message, not `.ufo/reports/round-16/tabi.md`.
- Risk: a lesson row or QUALITY criterion that cites "report :N" for this word is false provenance. It would be a criterion grounded in an unlocatable artifact (discernment `harmed` risk, LEARNING:35).
- Repair: the round-17 `## Mistakes` row cites spotcheck:76 as the only committed record and says "author completion summary (uncommitted)". The QUALITY row cites `corpus/lessons/round-17.md#mistakes` plus spotcheck:76. Never cite a report line.

### T2. What "unforgeable" over-stated, and the criterion's content. Verdict: NEEDS-CHANGE (preventive)
- Evidence: the probes defeat the three tested liar shapes, and the counter runs revision code unsandboxed (spotcheck:76). QUALITY 25 (`corpus/QUALITY.md:97-101`) already requires counter-owned probes.
- A new row that restates 25 is a duplicate authority.
- Recurrence risk in r17: every new counter has a finite probe set:
  - C1 has one poison commit P per arm (PLAN:92-96);
  - C2 has three negative probes (PLAN:132-133);
  - C3 has "red on a counter-mutated row" (PLAN:150-151).
- Repair: the row says "refines 25: a finite probe set supports only 'returns 0/red on the N enumerated mutations: <list>'. Never write unforgeable, tamper-proof, cannot be forged or proves no liar exists. Also disclose the unsandboxed revision-code execution." All r17 counter prose follows this template.

### T3. Expansion: C2 is "new ground: WebMCP invocation 0→1". Verdict: HOLDS ONLY WITH SCOPE
- Evidence: the admitted r16 note already records invocation as a probe observation (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:69-74`): `WebMCP.invokeTool{frameId, toolName, input}` → `invocationId`, `toolInvoked` input as a JSON string, `toolResponded` `status`/`output`. The probe JSON is committed (`git ls-files .ufo/waves/round-16/probes/WebmcpProbeInvoke.json`).
- The r16 note :127 says "invocation is a probe observation only". README :303 keeps "tool invocation as committed evidence" open. The r16 Gate rejected that candidate (`corpus/lessons/round-16.md:30`).
- Counterexample: "first observed invocation" or "invocation was unprobed" is false.
- Repair:
  - Credit expansion only to receipt-held ground absent from note :69-74: throws, rejects, unknown-tool, schema-mismatch, declarative-form, after-unregister, concurrent ids, iframe frameId, navigation-pending, flags-off.
  - Credit `invoke-imperative-success` (the echo shape) to quality, as a probe observation superseded by a receipt case.
  - The note and report cite :69-74 and :127 as prior state.
  - The r17 Gate records the reversal of the r16 reject (:30) and why: a committed receipt with code-fixed predicates now exists.

### T4. Expansion: "each citing its coverage-map row" (LEARNING:33). Verdict: FAILS AS PLANNED
- Evidence: the C2 contract (PLAN:108-133) requires a note, receipt and counter, but no `corpus/README.md` map row and no frontier append. DraftReadme covers only the U3 pointer (PLAN:167).
- r16 added map row :293, and the closure verified it (spotcheck:83).
- Repair: before measuredRevision, the L1 appends to README:
  - a map row for `knowledge/webmcp-invocation-round-17.md`;
  - a frontier-status line that supersedes :303 "tool invocation as committed evidence", scoped to Chromium 154.0.8037.97, flags on, loopback, CDP-driven `WebMCP.invokeTool`.
  - Without this, expansion is `unchanged` even if C2 counts 1.

### T5. Expansion via C3 or via rows. Verdict: NEEDS-CHANGE (wording)
- Evidence: `corpus/adjacency.tsv` is a boundary record. It is not an admitted `knowledge/` entry, a frontier entered or a new source kind. The S041+ rows are curation (CORPUS rule 4; `.ufo/waves/round-16/sources-staging.json:49`).
- Even the r16 closure put "Sources went 29→40" inside the expansion bullet (spotcheck:134).
- Repair: credit C3 to the adjacency axis (and quality via T8), never to the expansion trend. "Rows 40→N" goes in its own sentence under Sources & frontier. If C2 is not admitted, expansion is `unchanged` regardless of C3 and row counts.

### T6. Quality: "no admitted entry failing its re-check" vs the r16 binding manifest. Verdict: NEEDS-CHANGE (certain drift)
- Evidence: r16 manifest countedInputs (`jq` on `corpus/evidence/round-16/measurement-binding.json`):
  - C1: `scripts/check-measurement-binding.mjs`, `scripts/selftest-measurement-binding.mjs`, the r15 measurements file;
  - C2: `corpus/README.md`, `corpus/SOURCES.md`, the receipt, fixtures, the note and the harness.
- The gate's rule is `counted_input_changed` = `git diff --name-only measuredRevision REV -- <inputs>` nonempty (`scripts/check-measurement-binding.mjs:67-68`).
- Drift 3254740→5859243 is empty today (`git diff --name-only` printed nothing). r17 edits all four of the named files by plan (PLAN:38-39,176-196). So `--check …round-16… --at <r17 tip>` will be `counted_input_changed` for both r16 claims by construction.
- The C1 entry "binding --check r16 manifest without --at" (PLAN:103-104) is therefore red in arms A and B alike.
- Counterexample: a no-harm table or quality bullet that says "r16 binding still clean" at the r17 tip is false. Calling the red a regression is also wrong; it is designed history.
- Repair:
  - The quality evidence for r16 is the routed-3 receipt `--at 1205d261…` (RoutedHardened).
  - The report names the expected r17-tip findings and the changed inputs.
  - The SKILL row for the r16 manifest pins `--at 1205d26`.
  - HarmBaseline compares this check at 1205d26, not at the tip.
- Own manifest: land every README/SOURCES/QUALITY append that the r17 countedInputs cover before measuredRevision. The r16 wave-2 showed that a later SOURCES edit flips it (`corpus/lessons/round-16.md:86`).

### T7. Quality: stale "delivered HEAD" wording after C1. Verdict: NEEDS-CHANGE (else `harmed`)
- Evidence: the standing bar and records all say "delivered HEAD":
  - `corpus/QUALITY.md:79-80` (`--at <delivered HEAD>`);
  - `SCORECARD.md:755`;
  - `corpus/lessons/round-16.md:21,86,107`;
  - `SKILL.md:1851`.
- Live state: `git symbolic-ref -q HEAD` gives rc=1 (detached); HEAD = master = 5859243 only at rest.
- JjAudit F1 (`…/hyaku/jj-w1/reports/JjAuditTabi.md:44-63`) observed HEAD on an empty off-branch commit while `ROUND_CONTRACT` was clean.
- If C1 lands lane-tip semantics while QUALITY 22 still says HEAD, the admission bar contradicts the gates. That is an entry left stale and unmarked (LEARNING:34). Lessons are protected (PLAN:53), so the fix is append-only.
- Repair: a QUALITY row "refines 22: 'delivered HEAD' means the 40-hex of local `refs/heads/master` at delivery (the jj-lane.sh `pushed` line), never the symbol HEAD", citing the r17 lesson row plus JjAudit F1. Add a LOG/SKILL append pointing 1851 at it.

### T8. Quality: r16 note §Adjacency is stale once the ruling is recorded. Verdict: NEEDS-CHANGE
- Evidence: note :135 says "contested scope awaiting an integrator ruling". The ruling exists (spotcheck:138-142). The note must not be edited (PLAN:49-51).
- Recording the ruling only in PROVINCE/adjacency.tsv leaves the admitted note stale and unmarked.
- Repair: a README append index row pointing note :135 to the `ruled` row in `corpus/adjacency.tsv` and to spotcheck:138-142. Credit this as quality, not expansion.

### T9. Quality: what may and may not justify `improved`. Verdict: NEEDS-CHANGE
- Valid evidence (LEARNING:34 re-verify or supersede):
  - routed 1: the liar probe rebuilt from committed blobs makes the r16 mistake row `round-16.md:88` "all three liars count 0" reproducible;
  - routed 2: receipts at gate `1f84fb54…` relabel the r16 43-case receipts as history;
  - routed 3: receipt at 1205d26;
  - T3's probe→receipt supersession;
  - the T4/T7/T8 markers.
- Not evidence:
  - C1 gate hardening by itself (an axis move; no entry re-verified);
  - seat counts or "falsified 20+ items" (r16 report :106);
  - the C1 count.
- Counter-premise: no landed lane round was observed certifying an off-branch tip. F1 is a sandbox reproduction. Do not write "gates certified unlanded bytes", only "could certify (JjAudit F1 sandbox)".
- Conflict to resolve: JjTrial :133 says the three gates "never HEAD … colocation-transparent". That contradicts Audit F1 and the 12 HEAD reads. Cite Audit F1 (observed) and mark Trial :133 as superseded in the lesson.
- Carried work: the planned freshness re-verification of S001–S019 (`SCORECARD.md:770`) is not in r17. Say "carried", and do not let the quality bullet imply freshness.

### T10. Discernment `improved`. Verdict: HOLDS ONLY VIA ROUTE 2, AUTHOR-SIDE
- Evidence: the r16 outside check agreed on all 7 samples (spotcheck:111-119), so there is no gate disagreement to mine.
- Route-2 credit (LEARNING:35) is available only where an outside finding becomes a lesson-cited criterion: T1/T2 "unforgeable", and routed 3 "commit the delivered receipt or say holds by drift diff" (spotcheck:150).
- `harmed` if either:
  - any r17 QUALITY row lacks a `round-17.md#mistakes` row (LEARNING:59), for example a jj row citing only JjAuditTabi;
  - any routed item 1-5 ends with no fix and no stated why-not (prompt `tabi-round-17.md:293-295`).
- Lane critics are still the lane (LEARNING:45-46). `unprovable-but-better` needs a named non-author.
- Repair: wording "improved (author-side, route 2: r16 outside findings → lesson-backed QUALITY rows); r17 outside admit/reject agreement pending". The r17 Gate lists at least one real reject, for example coverage 9→10 again, or "agent invocation".

### T11. C1 "lane tip = landed". Verdict: NEEDS-CHANGE (wording)
- Evidence: laneTip resolves local `refs/heads/master` (PLAN:64-69), not `origin/master`.
- JjTrial :121,:153: the `committed` and `pushed` hashes diverge on recovery rebase. A gate run between the jj-lane commit and the push certifies a hash that is later rewritten.
- Repair: say "anchored to the attached branch, or to local `refs/heads/master` when HEAD is detached". Never "landed", "pushed" or unqualified "jj-safe". The C1 count is defined against one poison shape per arm (PLAN:95-99) and covers no other jj states.

## Verdict evidence matrix (what each outcome requires)
- **expansion**
  - improved: C2 note admitted, citing mined S041+ A rows with the note in used-by, the T4 map row and the T3 scope.
  - unchanged: C2 not admitted, or no map row.
  - harmed: an admitted r17 claim fails its own bar, for example a predicate weakened after the run.
- **quality**
  - improved: routed 1-3 receipts committed, plus T7/T8 markers, plus a supersession note for T3's success case.
  - unchanged: only new artifacts land.
  - harmed: T7 or T8 left unmarked, or a false "r16 binding clean at tip" claim (T6).
  - A trade (expansion improved with quality harmed) is never admitted (LEARNING:37-38).
- **discernment**
  - improved: route 2 per T10.
  - unchanged: criteria added only from in-round lane critics.
  - harmed: a lessonless criterion, or an unhandled routed item.

## Wording to avoid → use
- "unforgeable / tamper-proof / cannot be forged" → "red/0 on the N listed mutations: …".
- "first WebMCP invocation" → "receipt-held invocation (r16 probe-only, note :69-74)".
- "agent can invoke page tools" → "CDP-driven `WebMCP.invokeTool` on 154, flags on, loopback; agent-side consumption open".
- "spec-conformant" → "matches/diverges from S020 rev <x> at §<y>".
- "jj-safe / landed tip" → "local refs/heads/master anchor".
- "delivered HEAD" → the 40-hex value.
- "r16 binding still clean" → "clean at 1205d26 (receipt); counted_input_changed at r17 tip by design".
- "rows/notes/seats grew" inside a trend bullet → put them in a separate sentence.
- Never "outside agreement" from lane seats.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/CriticTrends.md
