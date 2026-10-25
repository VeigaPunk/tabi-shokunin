# Round 27 — re-dispatch of round-26 frozen claims; C1 failed, C2/C3 met (2026-10-25)

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
| C2 | depth | 0 gate → `valid=true` | `node scripts/check-s106-evidence.mjs --rev <REV> --json` (`valid`) | **met after correction** — reviewer found missing receipt returned invalid/exit 1 instead of frozen CNE/exit 2; absent receipt now raises Refusal and fifth selftest case asserts exit 2. Corrected gate at `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`: valid=true; selftest 5/5. |
| C3 | coverage | 0 → ≥1 entry citing S107 | `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` | **met** — 1 entry at `6ca3b89ad2a7b480984859834b3d28f1e75a9a26`; row S107 appended transformed (not byte-exact); census exit 0, rows 106 → 107. |

## Gate (sources opened this round, 2026-10-25)

- **S107 admitted** — HTTP Semantics RFC 9110 — https://www.rfc-editor.org/rfc/rfc9110.txt — access 2026-10-25, fresh plain-text fetch 502941 B sha256 `21c1cdce…` (committed bytes `.ufo/waves/round-27/assimilation/rfc9110.txt`). Located quote (§10.2.3, lines 4805-4807): "Retry-After indicates the minimum time that the user agent is asked to wait before issuing the redirected request." Staged row S124 transformed to fleet schema (recheck prose `"(errata only)"` stripped to `730d`; opened re-dated to this lane's access; anchor cell rebuilt from this round's located quotes; used-by exactly the admitted entry). Staged id → lane id assignment by document (the registry continues at S107), never arithmetic.
- **Staged S125 refused as a row** — its document (`draft-ietf-httpbis-rfc6265bis-13.txt`, ietf.org) was not re-opened this round and its staged scope differs from S102. On the same bytes, `scripts/check-sources.mjs` flags duplicate URL as E04; the scope-sensitive sources census reports W04 (across scopes), E09 (prose recheck), and E11 (missing used-by target), not E04. A control with S102's exact scope produces census E04. Flip: re-open the source for a lane claim, then merge/supersede S102 or add a distinct scoped row only if an admitted entry uses it and both gates pass.
- **Staged S142 refused as a row** — it is the same RFC 9110 document as S107 and its §15.4.2–§15.4.9 scope is already covered by S107's cited ground; no separate entry was admitted. `check-sources.mjs` flags same-URL duplication; the scope-sensitive census reports W04 rather than E04. The measured `supersedes S107` merge passes both gates; this row remains refused because it adds no separately admitted knowledge. Reconsider only if a future entry needs separately citable, non-overlapping scope.
- Stripped staged-recheck prose recorded per the assimilation contract: S124 `"(errata only)"` → bare `730d`; the staged S125 cell `"180d (draft; re-read for a new revision)"` stays with its refused row.
- Quarantine slice (38 tabi rows): closed since round 22, verdicts carried — nothing adopted from it this round. `considerthese/`: no such directory in this lane — noted per the contract.

## Mistakes

### M1 — staged over-assertion: 308 method-preservation claimed as a normative clause

Class: source-fidelity (quote the spec says, not the folklore). Evidence: the
staged entry `redirect-and-retry-after-semantics.md` asserts "307 / 308 —
'MUST NOT change the request method'" as one clause; the fresh RFC 9110 bytes
carry that sentence only for **307** (§15.4.8 line 7494) — §15.4.9's 308 body
(lines 7507-7523) repeats the permanent-assignment text without the clause.
Captured-by: the frozen claim's own kill rule ("if any quote the admitted
entry rests on is absent from this round's fresh bytes, the entry is refused")
plus QUALITY's located-quote bar. Fix, landed: the admitted entry states 307's
clause as located, records 308's preservation as an explicit **INFERENCE**
item. RFC 9110's §15.4 historical note also says 307/308 were added to
unambiguously indicate method-preserving redirects; the admitted entry cites
that note but does not present it as a status-specific normative MUST-NOT.
The status-specific clause remains an open re-anchor if a future claim needs it.
Shown able to fail: the campaign's byte-exact entry would have retained the
over-assertion; source reopening caught it.

### M2 — guard that proves nothing: grep-prefixed scratch row fooled my own census check

Class: test-harness input hygiene. Evidence: the first scratch-mirror check
appended a `grep -n` result line (`29:| S124 | …`) to the scratch registry —
the E09 finding never fired because the malformed line is not a registry row
at all; the "pass" was vacuous. Captured-by: **none** — the output looked
clean until a second look at the appended line. Fix, landed: mirrors are built
by inserting verified row text before the `## Paths` heading; both census arms
then behaved as predicted (E09 on the staged row, ok on the transformed row).
Shown able to fail: the vacuous run is preserved in this lesson's record; the
corrected run's receipts are `.ufo/waves/round-27/assimilation/{staged,xform}-census.txt`.

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
