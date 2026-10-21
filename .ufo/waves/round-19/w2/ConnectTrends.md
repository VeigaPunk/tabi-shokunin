# ConnectTrends — Round 19 W2

**Scope:** read-only comparison of baseline B `66251bfc1aef393e4aec599e950a8deb867736bb`, checkpoint R `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`, current round cache, and the local canonical learning protocol. No browser, counter, test suite, or source fetch was run by this seat; counter outputs below are retained W2/cache evidence, not my executions.

## Axes and evidence

### Expansion — improved, on a bounded surface

The gap is real: W1's `ConnFrontierMap.md:9-22` distinguishes the already-held declarative registration/schema source analysis and imperative invocation from the still-unobserved declarative runtime-validation outcomes. The appended coverage map (`corpus/README.md:401-410`) now indexes `webmcp-declarative-validation-round-19.md`; that note scopes its finding to Chromium 154.0.8037.97, WebMCP-enabled loopback forms and 15 families (`:11-31`). Its receipt summary is 66 cases, 66 passed, 0 failed (`corpus/evidence/round-19/validation/receipt.json`, `.summary`). This is runtime input-validation evidence, not a mere source-row increase, and it preserves explicit exclusions.

The retained S077 source quote is: `if (EqualIgnoringAsciiCase(s, "true") || s == "1") {` — `form_mcp_schema.cc:82-84`; URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT`; access date 2026-10-21; decoded-body SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` (retained details: `corpus/SOURCES.md:91`, `w2/RuntimeCheckbox.json`).

### Quality — harmed at R; the expansion is a trade, not a net learning verdict

There is now an exact R C1 counter execution in the W2 cache: `CriticSeparability.evidence.json:2168-2184` binds revision R, exit 0, `c1_validation_decisions=27`, counter SHA `a5126e5e…b7858`; all 27 IDs are counted. Do not carry the earlier `c1-ea170da3.json` result of 24 forward as R's count: it measured `ea170da3`, before R's date-time/number-range cases, decisions manifest and receipt changed. The canonical measurements directory still lacks a `c1-d5cf…` artifact, so preserve the distinction between a W2-cached R execution and a finalized scorecard measurement. `SCORECARD.md:866-868` correctly labels its current Round-19 claim block as not measurements; there is no final Round-19 trend table there yet.

The C1 count does not certify semantic entailment. A current W2 supplemental runtime run falsifies the unqualified checkbox rule: `RuntimeCheckbox.json.scopedFalsification` reports that string `"true"` and `"false"` both completed/submitted in two fresh runs, while `SKILL.md:2074` and the knowledge note `:57-58` say single checkboxes take booleans only. W2 `Decision15.md:3-17` explains the exact source coercion and the limits of the canonical cases. The note also contradicts itself: `:55-56` says malformed email/URL values fail at submit while the schema lacks `format`, but `:73-75` says `format` is not enforced for agents at all. These are stale/overgeneralized admitted claims, not resolved by a 27 decision count.

C2 has a sharper checkpoint contradiction. The retained `c2-ea170da3.json:7-12` records `c2_h4_properties=2` at `ea170da3`, but the W2 counter run at exact R returns `c2_h4_properties=0`, `evaluationStatus=complete` (`CriticSeparability.evidence.json:2377-2394`). At R, H4a does reject the planted GUID file, but its clean-run condition is false (`:2396-2459`); H4b fails its clean run because the scan finds `/tmp/.../flagged-profile-.../extensions_crx_cache/metadata.json` under the whole process TMPDIR, outside the declared `playwright-artifacts-*` root (`:2466-2503`). Thus the earlier 2 is not a R pass. The result also reveals a verification-boundary mismatch: the contract targets the Playwright artifact root, while this clean-run scan treats an unrelated browser-profile cache file as an artifact. H1/F6 remain informational coverage, not new C2 credit (PLAN §Wave-1 findings, lines 148-151).

C3's exact-R cache run returns 4 (`CriticSeparability.evidence.json:2342-2374`), but d4's `tracked_diff_empty`/23-entry check relies on the status-after reconstruction recorded in `isolation/ledger.json:4-8`. The lesson's claim that a wave-2 return-time snapshot was taken (`corpus/lessons/round-19.md:84`) conflicts with PLAN lines 153-156, which still says that snapshot *will* be taken, and the only `w2-continuation-before.txt` is a pre-continuation untracked-path list. Do not call that future snapshot a measurement.

### Discernment — prior R18 disagreements are lesson-backed; current R19 disagreements are not yet

The R18 outside spot-check explicitly identifies itself as non-author and routes defects 1-4 (`corpus/lessons/round-18-verifier-spotcheck.md:1-11,141-159`). Round-19 Mistakes and QUALITY 40-46 map those defects to corrections and red cases (`corpus/lessons/round-19.md:77-85`; `corpus/QUALITY.md:166-213`): this is genuine lesson-backed learning from *prior* disagreements.

That does not satisfy the current round's outside check. The canonical `round-19.md` Gate lists candidates/admissions/rejections but contains no non-author admit/reject sample or `agree`/`disagree` record. The protocol requires that sample and a reason in each round's lesson (`/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/LEARNING.md:40-46`). Current W2 reviewers already disagree with R19 wording: e.g. DV-15 (`w2/Decision15.md:3-17`) and DV-22 (`w2/Decision22.md:3-21`), while the supplemental checkbox runtime evidence is retained in `w2/RuntimeCheckbox.json`. These current disagreements are not yet in the canonical lesson/QUALITY mapping. So R18 calibration work is evidenced, but a Round-19 discernment-improved verdict is not.

## Count and supersession sweep

- The initial PLAN block still states C1 `c1_validation_rows`, target ≥12 and C2 `c2_gaps_closed`, 0→3 (`PLAN.md:18-42`). The final revision explicitly supersedes them with `c1_validation_decisions` and `c2_h4_properties` 0→2 and makes H1/F6 informational (`:139-151`). Current counters use the revised keys. The old names remain in W1 proposal/review snapshots and dispatch payloads, including the unfinished `ScribeKnowledgeNote.md` target; those are historical drafts, not current output keys. Mark the opening PLAN claims as the superseded proposal so the canonical file cannot be read as having two live contracts.
- Do not conflate the 66/66 case receipt, 27 candidate/eligible decisions, C2's two planned H4 properties, and C3's four routed corrections. The R cache gives C1=27, C2=0, C3=4; the only committed measurement records are at `ea170da3`, so current R outputs still need to be bound into the canonical closeout.
- `LOG.md:1059` and `SCORECARD.md:830` have explicit superseding corrections, which is good. A different stale statement remains: `corpus/QUALITY.md:172-173` repeats the spot-check's suggested-filename characterization of R18 H4, while `LOG.md:1112-1114` and `round-19.md:68-71` correct it to a marker-byte scan. The source registry also has S087 `queued` (`corpus/SOURCES.md:101`) although the knowledge note uses S087 at `:17-18`; the six-mined/eleven-queued summary at LOG `:1107` does not reconcile that use.

## One bounded move

Before assigning any Round-19 learning verdict, append one checkpoint-bound reconciliation to the canonical round-19 lesson/scorecard: carry the exact R outputs (C1 27, C2 0 on the observed run, C3 4), distinguish the case receipt from the counters, and record the outside reviewer’s admit/reject judgments and the demonstrated claim corrections. For the C2 row, retain the full artifact-root before/after diff but keep unrelated profile-cache files out of the H4 artifact predicate, then rerun at R before crediting 2. Keep old W1 plans as historical snapshots; do not edit the expansion note away. This improves quality/calibration and avoids sacrificing the genuine new runtime coverage.

**Risks:** narrowing H4 to the specified artifact root must still catch every new file inside that root and reject replayed nonces; it must not silently turn a failed clean run into a pass. A passing C1 counter is not a natural-language entailment proof. C3=4 does not imply a current independent spot-check or a direct wave-2 status snapshot.

**Verification for L1 (not run here):** on the final candidate revision, record a C2 run whose clean receipt passes and whose UUID mutant is rejected by the artifact-root scan; bind the output and producer hash. Reconfirm the C1/C3 outputs at that same revision. Add the LEARNING-required non-author sample of at least one admit and one reject, with reason and disposition in the lesson; verify the after-return snapshot exists before saying it was captured. Reconcile DV-15/DV-22 and the email/URL wording against their exact cases and retained source bodies. No suite run is requested by this report.

## Isolation

- Clone/branch/commit: none; read-only connector seat.
- Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Audited checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Only direct LANE write: `.ufo/waves/round-19/w2/ConnectTrends.md` (this report); no production paths changed.
- No tools installed; no build, suite, browser or counter was run by this seat.