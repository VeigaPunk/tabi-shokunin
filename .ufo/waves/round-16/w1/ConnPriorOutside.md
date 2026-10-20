# ConnPriorOutside — routed verifier defects r12–r15 → round-16 status

Seat: `TabiR16.ConnPriorOutside-5` (connector, leaf, read-only). Owned write: this file only. No commits,
no subagent dispatch, no gate/selftest/counter/browser run. Author-side advice, not non-author
certification. Access date 2026-10-20. Tools installed/updated: none.

## Scope and snapshot

Task: for every routed defect in `corpus/lessons/round-1[2-5]-verifier-spotcheck.md`, state whether a
later tabi round closed it (with anchor), whether it is still open, or whether it is carried inherited
debt.

Snapshot: lane HEAD `e38d2599a922cb729186353830fff8e159b4fef0` ("round-15 verifier spot-check
(integrator, hyaku)"). `git status --porcelain` shows only `?? .ufo/waves/round-16/` and
`?? corpus/evidence/round-16/`; round 16 is mid-wave-1. At this snapshot `scripts/check-measurement-binding.mjs`
and `.ufo/waves/round-16/measure.mjs` do **not** exist (`ls scripts | grep -E 'measurement|webmcp'` → none;
`find .ufo/waves/round-16 -maxdepth 2 -name '*.mjs'` → only `probes/WebmcpProbe*.mjs`). The only round-16
binding artifact is the untracked `corpus/evidence/round-16/binding/r15-counter-identity.json`.

Legend: **CLOSED** = a later lane artifact addresses the routed item with a citable anchor; **OPEN** = no
closing artifact exists (round-16 routing may be in progress); **CARRIED** = explicitly re-routed as
inherited debt in every later spot-check, still uncredited. Verifier files themselves are immutable; the
one in-file erratum (R13-6) is the exception and is recorded as such.

## Counts

23 routed items: r12 = 5, r13 = 6, r14 = 7, r15 = 5.
**13 closed · 7 carried · 3 open.** The 3 open items are all from round 15; two are the round-16 C1
route and one has a wave-1 report but no landed pointer.

## Table

| ID | Source | Routed defect (short) | Status | Anchor / current evidence |
|---|---|---|---|---|
| R12-1 | `round-12-verifier-spotcheck.md:199-203` | Legacy gate repair: canonical four-`[~]` SHONEN regeneration, SHONEN/census/PSTACK fixtures, future round lessons; round-12.md hit the overbroad lesson drift guard | CLOSED r13 (fixture/guard part); USER 6/10 sub-item carried | `git show 37ffbef:scripts/check-round-contract.mjs \| grep -c "name: 'shonen_"` = **0**; at `c702286` = **13** (census 0→**5**, `checkShonenPolicy` 0→**1**), commits `1199150`, `2f4bfa1`; HEAD `scripts/check-round-contract.mjs:133-174, :698-844`; USER gate `canonicalShonen`/`lessonDrift` at `scripts/check-user-round-contract.mjs:246-270` (initial add allowed, later edit refused). USER 6/10 is separate and still red (see R14-6) |
| R12-2 | `round-12-verifier-spotcheck.md:204-206` | Unswept BiDi collector-before-response-creation/clone timing; collection vs `getData` | CLOSED r13 | `corpus/knowledge/webdriver-bidi-capability-matrix.md:130-166` — "Dated correction — 2026-10-20 (round 13)": collector must exist at creation/clone (`:143-147`), `getData` is retrieval not retroactive collection (`:156`), WD §7.5.2 reopen at `:136-139`; commit `1cf82b8` |
| R12-3 | `round-12-verifier-spotcheck.md:207-210` | FreshRetry `10801/99752` labeled raw bytes vs measured `99073/1002533` | CLOSED r13 | `.ufo/waves/round-12/w1/FreshRetry.txt:155-231` appended clarification ("Disposition: RESOLVED — representation error, not digest drift" `:166-167`; corrected decoded-body table `:196-200`; gzip/content-length mechanism `:209-212`), commit `1cf82b8`; corroborated `corpus/lessons/round-13.md:52` and `.ufo/waves/round-13/w1/ReceiptCorrection.txt:9-65` |
| R12-4 | `round-12-verifier-spotcheck.md:211-214` | Citation precision: default `contain` attributed to §Snapshot matching; report dossier range `:14-77` exceeds 66-line file | CLOSED r13 | `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:127-131` (routed item 4: the exact bullet occurs inside §Strict matching; §Snapshot matching has no children-mode statement), commit `837b33a`; range corrected `:14-77`→`:14-66` per `LOG.md:616-617`; `corpus/lessons/round-13.md:53` |
| R12-5 | `round-12-verifier-spotcheck.md:215-219` | operator/protocol: frozen step-1 closure-checker certification absent | CARRIED | Re-routed `round-13-verifier-spotcheck.md:162`, `round-14-verifier-spotcheck.md:190`, `round-15-verifier-spotcheck.md:123`; no committed frozen step-1/step-4 run exists at HEAD |
| R13-1 | `round-13-verifier-spotcheck.md:158` | Cleanup summary metadata: runner `:605` stores "all workers not listening" under `listeningAfter`; add failure-capable summary check; preserve original receipt | CLOSED r14/r15 | `corpus/evidence/round-14/aria-metadata/corrected.json` (commit `f942c62`) and `verification.json:31-61`: original `--check` exit1, sole failure `R14-ARIA-CLEANUP-LISTENING-AFTER-01`, corrected exit0 accepted, `--witness` red→clean `original_unchanged=true`; finding implemented `scripts/check-aria-metadata.mjs:435`; r15 extends to all emitted mirrors (`:98-145`, `:1317-1342`) |
| R13-2 | `round-13-verifier-spotcheck.md:159` | Reproducibility wording: observed Node26.12.0 vs pin 24.21.0 vs minimumMajor20; no exact-equality claim | CLOSED r14/r15 | `SKILL.md:1744` decision row; `SKILL.md:1766-1777` "Named correction to round14's Node table…" (spec `assertPinnedRuntime()` minimum at `:269`, called `:924`); `corpus/README.md:255-285`; authoritative erratum `round-15-verifier-spotcheck.md:90-101` |
| R13-3 | `round-13-verifier-spotcheck.md:160` | Gate receipt/registry precision: document `--witness REV`, explicit repaired-code revision binding, 20+1 tally | CLOSED r14/r15 | `--witness 75e7836b…` at `SKILL.md:1730`; "Round13's USER21 controls mean20 fixture cases plus1 production-alias control" `SKILL.md:1735`; registry `SKILL.md:1800`; `corpus/evidence/round-15/user-diagnostics.json:3-4` binds `revision 27dfd98…` + `codeSha256 f9be3a7…` (commit `b7cf044`) |
| R13-4 | `round-13-verifier-spotcheck.md:161` | Inherited broader gate debt: SCORECARD shell execution, r07 survivor replay, user-record freezing, IPv6 origin, unpinned external validator; USER 6/10 real red | CARRIED | Restated `round-14-verifier-spotcheck.md:189`, `round-15-verifier-spotcheck.md:124`; still uncredited at HEAD (see R15-5) |
| R13-5 | `round-13-verifier-spotcheck.md:162` | operator/protocol: frozen step-1/step-4 closure-checker run absent | CARRIED | Same chain as R12-5; `round-14-verifier-spotcheck.md:190`, `round-15-verifier-spotcheck.md:123` |
| R13-6 | `round-13-verifier-spotcheck.md:163` | Prior verifier numerical erratum: r12:153 says 16 words, actual 14 | CLOSED (recorded erratum) | Corrected in place at `round-13-verifier-spotcheck.md:163` without editing the immutable `round-12-verifier-spotcheck.md:153`; ≤25-word verdict unchanged |
| R14-1 | `round-14-verifier-spotcheck.md:184` | Metadata enforcement wording: qualify SKILL:1744, checker comments, sidecar note; do not rewrite frozen evidence | CLOSED r15 | `SKILL.md:1766-1777` named correction; checker header qualifies floor and tamper split `scripts/check-aria-metadata.mjs:18-33`; frozen sidecar note deliberately retained (r15 erratum records why) |
| R14-2 | `round-14-verifier-spotcheck.md:185` | Checker validates core bindings only, not all `cleanup.*` mirrors or `everyProof*`; tally 15 CLI + 1 helper; sidecar byte identity | CLOSED r15 | `scripts/check-aria-metadata.mjs:98-145` code-owned CLEANUP/QUALIFICATION mirror tables, `:972` `mirrorFieldProblems`, `:1317-1342`; selftest enforces exact `caseCounts.cliCases/helpers` `:2938-2962`; `corpus/evidence/round-15/metadata/mirror-contract.json:45`; `corpus/lessons/round-15.md:46` ("those were15 CLI plus1 helper"); `metadata-differential.json` `.mirrors` = 9 entries, before-accepted 9, after-refused 9 |
| R14-3 | `round-14-verifier-spotcheck.md:186` | Tamper classification: anchor/source mismatches were exit1 findings, not `snapshot_tampered` exit2 | CLOSED r15 | `scripts/check-aria-metadata.mjs:90-96` (`snapshot_tampered`, exit2 map), `:942-944`; `corpus/evidence/round-15/measurements.json` C2 after: `"c2_snapshot":{"exit":2,"finding":"snapshot_tampered"}`; r15 spotcheck tamper differential |
| R14-4 | `round-14-verifier-spotcheck.md:187` | Counter receipt diagnostic precision: assert intended reason, split applicable-marker from N/A | CLOSED r15 | `corpus/evidence/round-15/user-diagnostic-witness.json`: baseline `reason=none`, repaired `reason=after_count_mismatch`; missing revision → `counting_command_failed`; masking mutant → `after_count_mismatch`; selftest prints `expected_reason`/`reason`/`applicability`/`marker_applicable`/`marker_outcome`; `measurements.json` `reasonAssertions:8, applicable:3, notApplicable:39`; `round-15-verifier-spotcheck.md:53` records `wrong_reason_only_match=0`, `reasonless_match=1` from this receipt |
| R14-5 | `round-14-verifier-spotcheck.md:188` | Add direct S029 reference to machine evidence; falsifier-timing (source attack predates checker) | CLOSED r15 | `corpus/evidence/round-15/source-index.json:4-6` (`sourceRows:["S029"]`, historical receipt sha `b458b351…`); `metadata-differential.json:3-5`; `SKILL.md:1784` rule "source reconnaissance only; subsequent falsifiers name the delivered input revision or exact source digest" |
| R14-6 | `round-14-verifier-spotcheck.md:189` | Preserve honest inherited boundaries (USER 6/10, survivor replay, freezing, IPv6, Git env, validator pin, producer inversion) | CARRIED (boundaries honored) | `SKILL.md:1800` "expected10 stays fixed and current production remains failed6/10"; `user-diagnostics.json` production exit1 `round_count`, `Found 6 user rounds, expected 10`; `round-15-verifier-spotcheck.md:124` restates the debt as unchanged |
| R14-7 | `round-14-verifier-spotcheck.md:190` | protocol/operator: current frozen closure certification | CARRIED | Same chain; no certification artifact at HEAD |
| R15-1 | `round-15-verifier-spotcheck.md:120` | Counter identity: C1 counter pinned only by revision (`27dfd98` → `3ee59de0…`), HEAD blob `dd9c8675…`; per-claim counter digest missing | OPEN — routed to round-16 C1 (build in progress) | `PLAN.md:10-13` routes r15 defects 1–2; gate contract `PLAN.md:34-75` (counter `sha256`, `measuredRevision`, `counter_digest_unrecorded/mismatch`, `counter_changed_since_measurement`, `--reproduce`). At snapshot no `scripts/check-measurement-binding.mjs`; only untracked `corpus/evidence/round-16/binding/r15-counter-identity.json` (`27dfd98`/`b7cf044`→`3ee59de0…`, `9fd8bca`/`36240c7`/`e38d259`→`dd9c8675…`) |
| R15-2 | `round-15-verifier-spotcheck.md:121` | Measured revision `b7cf044` vs delivered `36240c7`; future rounds measure at, or diff to, delivered HEAD | OPEN — routed to round-16 C1 (build in progress) | `corpus/evidence/round-15/measurements.json:4` `measuredRevision b7cf044…`; C1 has only `counterCodeRevision 27dfd98` (`:65`) while C2 has `counterSha256 dd9c8675…` (`:132`). The counter blob itself changed inside the window (`3ee59de0` → `dd9c8675` at `9fd8bca`), so r15's "no counted input drift" did not cover the counter. `PLAN.md:48, :53-59` adds `measuredRevision` + replay/diff |
| R15-3 | `round-15-verifier-spotcheck.md:122` | Adopt the erratum: future SKILL/lesson text citing round-14 Node wording points to `round-15-verifier-spotcheck.md:90-101` | OPEN — round-16 work exists, nothing landed | `.ufo/waves/round-16/w1/ErratumAnchors.md` + untracked `.ufo/waves/round-16/erratum-anchors.json` inventory five citing texts and propose append-only pointers; `grep -rn 'round-15-verifier-spotcheck' SKILL.md corpus/README.md corpus/QUALITY.md corpus/lessons/round-16.md` → **0 hits** (lane lesson r16 not yet written). `SKILL.md:1766-1777` restates the correction but names no erratum section |
| R15-4 | `round-15-verifier-spotcheck.md:123` | protocol/operator: frozen step-1/step-4 certification absent | CARRIED | Same chain as R12-5/R13-5/R14-7 |
| R15-5 | `round-15-verifier-spotcheck.md:124` | Inherited unchanged: USER 6/10, r07 survivor replay, user-record freezing, IPv6 origin, Git env/hooks/config/PATH, external-validator pin | CARRIED | Restated unchanged at HEAD; no closing artifact. `SKILL.md:1800` retains the red gate |

## What this means for the round-16 lesson

1. **R15-1/R15-2 have no closing evidence yet.** Round-16 C1 is designed to be that anchor, but at the
   snapshot there is no gate, manifest, selftest receipt or counter field. The round-16 lesson must say
   "routed, not closed" until `corpus/evidence/round-16/binding/*` and `measure.mjs --claim C1` commit.
   Do not cite the round-15 report as measurement-identity evidence: the counter at measured `b7cf044`
   is `3ee59de0…`, while delivered `36240c7` is `dd9c8675…`.
2. **R15-3 is not done.** No lane text points at the erratum section (`grep` 0 hits). The wave-1
   `ErratumAnchors` report is a proposal; the pointer must land in an L1-owned append (r16 lesson or
   SKILL) to close it.
3. **The operator/protocol frozen-closure debt is four-times carried (R12-5 → R15-4), not a lane
   defect.** No lane round can close it; it should be stated as external debt, never as a pass.
4. **Closed items are genuinely anchored in later committed bytes**, not in prose alone: r13 fixtures/
   drift guard, BiDi timing, FreshRetry representation, locator citation, cleanup correction, Node
   wording, witness/tally precision, mirror/tamper/reason/traceability. Counting closed items as
   "round-16 improvements" would double-count prior rounds; cite the round that closed each item.

## Verification commands and observed output

All read-only, lane root, this session:

| Command | Observed |
|---|---|
| `git rev-parse HEAD` | `e38d2599a922cb729186353830fff8e159b4fef0` |
| `git status --porcelain` | `?? .ufo/waves/round-16/` and `?? corpus/evidence/round-16/` only |
| `for rev in 37ffbef c702286; do git show $rev:scripts/check-round-contract.mjs \| grep -c "name: 'shonen_"; done` | `0` then `13` (census `0`→`5`) |
| `git show $rev:scripts/check-user-round-contract.mjs \| grep -c "function lessonDrift"` at `37ffbef`, `c702286` | `0`, `1` (`canonicalShonen` `0`, `2`) |
| `git log --oneline -S 'function lessonDrift' -- scripts/check-user-round-contract.mjs` | `2f4bfa1 round-13: preserve future lessons and pin USER checker cutover` |
| `git log --oneline -S 'function checkShonenPolicy' -- scripts/check-round-contract.mjs` | `1199150 round-13: pin canonical legacy ROUND compatibility policy` |
| `git log -1 --format='%h %s' -- <artifact>` | FreshRetry.txt `1cf82b8`; BiDi note `1cf82b8`; locator note `837b33a`; corrected.json `f942c62`; verification.json `4a300f6`; r15 source-index/differential/user-diagnostics/lesson `b7cf044`; both gates `27dfd98` |
| `grep -n '"measuredRevision"\|"counterCodeRevision"\|"counterSha256"' corpus/evidence/round-15/measurements.json` | measuredRevision `:4`; C1 counterCodeRevision `:65` (no sha); C2 counterSha256 `:132` `dd9c8675…` |
| `node -e "const j=require('./corpus/evidence/round-15/metadata-differential.json');console.log(j.mirrors.length, j.mirrors.filter(m=>m.before.payload?.exit===0).length, j.mirrors.filter(m=>m.after.payload?.exit===1).length)"` | `9 9 9` (mirrors / before-accepted / after-refused) |
| `grep -rn 'round-15-verifier-spotcheck' SKILL.md corpus/README.md corpus/QUALITY.md corpus/lessons/round-16.md` | no hits (r16 lesson absent) |
| `ls scripts/ \| grep -E 'measurement\|webmcp'` | none |
| `find .ufo/waves/round-16 -maxdepth 2 -name '*.mjs'` | only `probes/WebmcpProbe*.mjs` |

No source rows, URLs or evidence bytes were modified; no source-row count is claimed here. No tools
installed or updated.

## Risks / limits

- Round-16 peers are actively writing; file presence is a snapshot at HEAD `e38d259` plus untracked
  files. If BindCore lands the gate before L1 reads this, the two OPEN rows should flip to closed only
  after the committed counter reads `c1_binding_contracts:1` at the delivered revision.
- "CLOSED" here means a later lane artifact addresses the routed item. It is not an independent claim
  that the artifact is correct; each anchor is named so L1 can re-check it.
- R12-1 is split by its own wording ("USER's inherited 6/10 remains separate"); counted once as closed,
  with the red gate carried under R14-6/R15-5.
