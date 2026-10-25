# Round 27 — resumption attempt; C1 failed, C2/C3 counters pass with frozen-text drift (2026-10-25)

Baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d` (round-26 tip incl. the
non-author spot-check). Round 26 froze three claims before data
(`.ufo/waves/round-26/claims.json`, `frozenBeforeData: true`) and recorded all
three **failed — not executed** when the operator ended the run mid-round.
This round re-dispatches the same three claims unchanged — predicate, counter,
kill rule and target are the frozen ones (the round-26 LOG next-iteration (a)
resumption point; §10 frozen/resumed clause). Axes at round start: depth 8,
coverage 9, operability 8, freshness 8, calibration 9, adjacency 8. Lowest
non-retired: tie at 8 (depth/operability/freshness/adjacency); C2 works depth.
Saturation 8 / window 3; nudge inactive. Census before → after: exit 0 both
ends, rows 106 → 107 (`.ufo/waves/round-27/census-before.txt`,
`census-after-c3.txt`).

## Claims (executed)

| Claim | Axis | Frozen before → after | Counting command | Disposition |
|---|---|---|---|---|
| C1 | calibration | frozen target: extended m1 at baseline ≥1; tip 0; selftest 13→≥15 | `node scripts/check-selfassessment.mjs --rev <REV> --json` (`mismatches`) | **failed** — baseline 4ad4c77 gives 6 total (5 LOG-window + m3), but adversarial evidence shows the supersession matcher clears `LOG.md:221` without a citation to that line (CritC1Supersession.md; ExecC1Attacks.md). Current implementation's `:\d+` paragraph matcher does not enforce the frozen line-citation rule; tip target 0 is therefore not a sound verified result. `m3` also reads live status, not pinned revision. Do not amend the frozen claim; resolve in a later claim. |
| C2 | depth | 0 gate → `valid=true` | `node scripts/check-s106-evidence.mjs --rev <REV> --json` (`valid`) | **counter passes; inherited claim conformance not established** — corrected gate at `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` returns valid=true, selftest 5/5, and absent receipt returns CNE/exit 2. However, round-27 claims text omits inherited fetch-failure and measurement-revision binding; the S106 receipt has no revision field, so that inherited requirement is not proven. |
| C3 | coverage | 0 → ≥1 entry citing S107 | `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` | **counter passes; standing §10 duty incomplete** — 1 entry and S107 row landed at `6ca3b89ad2a7b480984859834b3d28f1e75a9a26`; census exit 0, rows 106 → 107. The 38-row quarantine slice was not hand-checked this round; no compliant §10 closeout or unchanged inherited claim can be asserted. |

## Gate (sources opened this round, 2026-10-25)

- **S107 admitted** — HTTP Semantics RFC 9110 — https://www.rfc-editor.org/rfc/rfc9110.txt — access 2026-10-25, fresh plain-text fetch 502941 B sha256 `21c1cdce…` (committed bytes `.ufo/waves/round-27/assimilation/rfc9110.txt`). Located quote (§10.2.3, lines 4805-4807): "Retry-After indicates the minimum time that the user agent is asked to wait before issuing the redirected request." Staged row S124 transformed to fleet schema (recheck prose `"(errata only)"` stripped to `730d`; opened re-dated to this lane's access; anchor cell rebuilt from this round's located quotes; used-by exactly the admitted entry). Staged id → lane id assignment by document (the registry continues at S107), never arithmetic.
- **Staged S125 refused as a row** — its document (`draft-ietf-httpbis-rfc6265bis-13.txt`, ietf.org) was not re-opened this round and its staged scope differs from S102. On the same bytes, `scripts/check-sources.mjs` flags duplicate URL as E04; the scope-sensitive sources census reports W04 (across scopes), E09 (prose recheck), and E11 (missing used-by target), not E04. A control with S102's exact scope produces census E04. Flip: re-open the source for a lane claim, then merge/supersede S102 or add a distinct scoped row only if an admitted entry uses it and both gates pass.
- **Staged S142 refused as a row** — it is the same RFC 9110 document as S107 and its §15.4.2–§15.4.9 scope is already covered by S107's cited ground; no separate entry was admitted. `check-sources.mjs` flags same-URL duplication; the scope-sensitive census reports W04 rather than E04. The measured `supersedes S107` merge passes both gates; this row remains refused because it adds no separately admitted knowledge. Reconsider only if a future entry needs separately citable, non-overlapping scope.
- Stripped staged-recheck prose recorded per the assimilation contract: S124 `"(errata only)"` → bare `730d`; the staged S125 cell `"180d (draft; re-read for a new revision)"` stays with its refused row.
- Quarantine: the 38-row tabi slice remains closed and no quarantine row was
  adopted, but the required this-round hand-check of each row was not completed;
  §10 Wave-4 quarantine-first duty remains unmet. `considerthese/` is absent in
  this lane. This is a closeout gap, not a clean carried verdict.
- **Package defect caught before admission, not a lane mistake** — staged
  entry/rows conflated 307 and 308 under one MUST-NOT clause; the fresh RFC
  locates it only for 307 (§15.4.8, line 7494). The admitted entry separates
  the 307 rule from the bounded 308 inference and cites RFC 9110's history note
  at 7260-7264 without claiming a status-specific normative MUST-NOT. This is
  successful re-grounding, not a lane error. Evidence:
  `.ufo/waves/round-27/w1/RevStagedProvenance.md`,
  `ScoutStagedGround.md`, `CritAssimProcess.md`.

## Mistakes


### M2 — malformed mirror input made the initial census arm vacuous

Class: test-harness input hygiene. The first scratch-mirror check appended a
`grep -n` result (`29:| S124 | …`) rather than a registry row. The census parser
ignored that malformed line and returned exit 0; it did not raise E12 because
the text was not row-shaped. Rebuilding the mirror with the verified staged row
produced the expected E09, and the transformed row produced `ok`; this proves
the census findings for valid row input, not rejection of malformed mirror
construction. No mechanical source-row-count/non-vacuity assertion landed, so
that harness guard remains a limitation. Evidence:
`.ufo/waves/round-27/w1/CritMistakeQuality.md`,
`.ufo/waves/round-27/assimilation/staged-census.txt`,
`xform-census.txt`.

### M3 — absent S106 receipt classified invalid, not could-not-evaluate

Class: gate verdict taxonomy / frozen kill-rule omission. Evidence: the C2
reviewer exercised the absent-receipt path at baseline and found `evaluate()`
returned `{present:false,valid:false}`, which the CLI classified as exit 1;
the frozen C2 kill rule requires receipt absence to be could-not-evaluate,
exit 2. The original four-case selftest covered missing bytes but not a missing
receipt. Fix, landed after that review: absent receipt now throws `Refusal`, and
the fifth selftest case asserts exit 2; the SKILL registry row records 5/5.
This is an implementation correction to the frozen rule, not a predicate
change. Seat evidence: `.ufo/waves/round-27/w1/RevC2Gate.md`; independent
mutation coverage gap: `.ufo/waves/round-27/w1/MutC2Gate.md`.
### M4 — novelty overclaim erased existing loopback redirect ground

Class: calibration in assimilation framing. Evidence: the first README wording
said the round-6 redirect chain was traversed but never classified, and the
entry's `ground:` claimed the lane had never asserted redirect rules. CritC3Junk
re-opened existing loopback evidence: `external-class-fixture-v2.md:373-404`
records 302→303→307 and 307 method/body preservation;
`state-changing-matrix-r9.md:162-177` records 303→GET / 307 preservation.
Fix: the entry now calls this an extension (301/302 POST→GET possibility and
Retry-After with 3xx) and says real-site redirects remain untested; the README
names prior loopback ground and narrows the unseen part to the full RFC
vocabulary. Captured after the first draft by the wave-1 critic report,
`.ufo/waves/round-27/w1/CritC3Junk.md`.
### M5 — inherited claims were not re-dispatched verbatim

Class: frozen-claim governance. Evidence: the round-27 `claims.json` says the
round-26 predicates, counters, kill rules and targets are unchanged, but direct
comparison with `.ufo/waves/round-26/claims.json` shows differences in each
claim record: C1's baseline/after description, control and killRule; C2's
control, killRule and failureCapable text; C3's declared/control/killRule and
failureCapable text. In particular, C1 replaces the inherited “fix before data,
never narrow the target” kill-rule language with “measured 5, not 0”, C2 omits
fetch-failure and measurement-binding requirements, and C3 records the 308
inference as part of its killRule. The `resumeNote` still claims verbatim
resumption. Fix: none after data — changing the frozen record would deepen the
violation. Verdict: C1 fails; C2/C3 counters were measured, but they do not
establish compliant execution of the inherited frozen claims. Evidence:
`.ufo/waves/round-27/w2/CritMistakeQuality.md`,
`.ufo/waves/round-27/w2/CritClaimHonesty.md`.



## Corrections

- The LOG corrections initially presented five baseline counter findings as
  stale self-test tallies; wave-1 falsification shows the matcher also falsely
  clears real `LOG.md:221` without a citation to that line. C1 failed; see the
  append-only C1 falsification and C2 correction entries in `LOG.md`.
- Control-arm falsification disclosed in `.ufo/waves/round-27/claims.json`
  `revisions`: the frozen claim speculated the byte-exact staged row fails the
  census gate on malformed-row grounds; measured ground is **E09** (prose
  recheck cell), found before data by running the arm. The do-nothing
  protection stands: a byte-exact append cannot land, and the counting command
  requires the entry's source line re-pointed to S107.
