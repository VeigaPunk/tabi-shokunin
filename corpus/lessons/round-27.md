# Round 27 — re-dispatch of round-26 frozen claims; all three executed and met (2026-10-25)

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
| C1 | calibration | extended `check-selfassessment.mjs` m1 to LOG.md: ≥1 mismatch at baseline → 0 at tip; selftest 13 → ≥15 | `node scripts/check-selfassessment.mjs --rev <REV> --json` (`mismatches`) | **met** — baseline `4ad4c77` reports 5 LOG-window findings (:335/:391/:1090/:1103/:1664) + m3 noise; the four unsuperseded ones are dispositioned by append-only corrections in the round-27 LOG entry; tip measurement reads `mismatches=0` under a clean tree (m3 is a live-tree class — its receipt records the porcelain count at the measurement instant); selftest 13 → 17. |
| C2 | depth | 0 gate → `valid=true` | `node scripts/check-s106-evidence.mjs --rev <REV> --json` (`valid`) | **met** — gate built + selftest 4/4; `valid=true` at `5577d1b6fe2dc298486e354b5416d38acafeffaa` (sha_match, anchor_located, anchor_unique, byte_count_match all true). |
| C3 | coverage | 0 → ≥1 entry citing S107 | `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` | **met** — 1 entry at `6ca3b89ad2a7b480984859834b3d28f1e75a9a26`; row S107 appended transformed (not byte-exact); census exit 0, rows 106 → 107. |

## Gate (sources opened this round, 2026-10-25)

- **S107 admitted** — HTTP Semantics RFC 9110 — https://www.rfc-editor.org/rfc/rfc9110.txt — access 2026-10-25, fresh plain-text fetch 502941 B sha256 `21c1cdce…` (committed bytes `.ufo/waves/round-27/assimilation/rfc9110.txt`). Located quote (§10.2.3, lines 4805-4807): "Retry-After indicates the minimum time that the user agent is asked to wait before issuing the redirected request." Staged row S124 transformed to fleet schema (recheck prose `"(errata only)"` stripped to `730d`; opened re-dated to this lane's access; anchor cell rebuilt from this round's located quotes; used-by exactly the admitted entry). Staged id → lane id assignment by document (the registry continues at S107), never arithmetic.
- **Staged S125 refused as a row** — its document (`draft-ietf-httpbis-rfc6265bis-13.txt`, ietf.org) already stands in this registry as **S102**; appending it must trip census E04 (duplicate URL+scope). Flip: adopt only if S102 is superseded and the row records `supersedes S102`.
- **Staged S142 refused as a row** — same RFC 9110 document as S107's row (a second row for one document would join the W04 duplicate-URL family; the right disposition is merge-into-the-existing-row by document per CORPUS.md rule 2). Its §15.4.2–§15.4.9 ground overlaps the S107 row's §15.4 scope; its entry's sibling (`redirect-status-classification.md`) stays staged. Flip: adopt only if S107's row narrows its scope such that per-status classification needs its own row.
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
(§15.4 step 4 + the 301/302 notes' "if this behavior is undesired" pointers),
and names RFC 7538 as the re-anchor target. Shown able to fail: a byte-exact
adoption would have landed the over-assertion; the kill rule caught it because
the quotes were re-located, not trusted.

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

## Corrections

- LOG.md round-27 entry carries five append-only corrections dispositioning
  the extended m1 window's baseline findings (:335/:391/:1090/:1103) plus a
  for-the-record restatement (:1863's stale `cases: 13` mention, which sits in
  a multi-script section and is could-not-evaluate, never counted). LOG.md:1664
  was already superseded by the round-26 correction block — the paragraph-unit
  supersession rule found it.
- Control-arm falsification disclosed in `.ufo/waves/round-27/claims.json`
  `revisions`: the frozen claim speculated the byte-exact staged row fails the
  census gate on malformed-row grounds; measured ground is **E09** (prose
  recheck cell), found before data by running the arm. The do-nothing
  protection stands: a byte-exact append cannot land, and the counting command
  requires the entry's source line re-pointed to S107.
