# Round22 — finite lifecycle outcome oracle (landed record)

Round22, hyaku run 6 landing attempt (the round's W1/W2/W2b waves ran in earlier
attempts and are re-verified here; see `## Waves`). Baseline
`5f585773258b33d2d514b00cd0b0775333578db6`; measured checkpoint
`47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e`; the docs/evidence commit that carries
this lesson follows that checkpoint and does not change any counted input.
C1 only: **operability**, a lowest non-retired tie at 8, target 0→12 explicit
semantically checked lifecycle rows over the retained round-21 acquisition.
The observation population stays 12→12; no new browser run, branch, coverage
denominator or scalar promotion. Scalar operability 8→8.

## Gate

Counting command, run 2026-10-25 as written:

```sh
node .ufo/waves/round-22/measure-c1.mjs 5f585773258b33d2d514b00cd0b0775333578db6
node .ufo/waves/round-22/measure-c1.mjs 47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e
```

Baseline: exit 0, verdict `baseline`, `c1_semantically_checked_lifecycle_rows=0`.
Checkpoint: exit 0, verdict `clean`, value 12, findings none, 12 counted rows.
Supporting gates at the checkpoint: `node .ufo/waves/round-22/selftest-c1.mjs` →
`clean`, 45/45 cases; `python3 .ufo/waves/round-22/run-checks.py 47bfb5f… …` →
35/35 expected outcomes (`.ufo/waves/round-22/checks-at-47bfb5f.json`), including
both curation censuses, `c1-before`=0/`baseline` and `c1-after`=12/`clean`, the
two no-harm lifecycle arms, and the retained historical-review-scope red arm.

Sourced claim: **S101 reopened this round** (`corpus/SOURCES.md` own-work row,
`corpus/evidence/round-21/runtime/receipt.json`). Accessed 2026-10-25;
located quote from the actual reset case (`na-reset` raw, `WebMCP.toolResponded`
`params.errorText`): “Tool execution cancelled by a form reset” (8 words);
raw sha256 `097b88338a619c794d69b6baac897370f29dfe5864a22f42bb54fcc6a1139ec4`.
Reopening retained own-work bytes is not a new acquisition, publisher
authentication or source diversity.

Sources census, before and after this round's work
(`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
/home/vgpnk/Projects/shokunin tabi`): both exit 0 (round start: 16 duplicate-URL
warnings, exit 0; round end: same). Registry rows 101→101, mined 73→73,
A88/B4/C9 unchanged; **no new SOURCES row was written** this round, because no
admitted entry cites a source first opened this round.

Assimilation (skokuknow `corpus-expansion-1`): this lane is wave-4
**quarantine-first** — nothing from `merge/tabi/` is adopted this round. The
lane's absent-defect-register slice was hand-checked row by row from its data
rows (the register's header and summary totals are stale; the slice was derived
from the rows). Register sha256
`5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`.

- 38 slice rows (the 2026-10-24 census count of 38 re-derived).
- 37 `payload-absent` rows: the cited source was re-fetched and **not one** of the
  registered quotes is locatable in it → **refused**. Absence in the cited source
  is a mis-citation or fabrication class; it is not proof of which, so the rows
  are refused, not accused.
- 1 `unreachable` prose row (S171, `chromestatus.com`): re-fetch produced no
  usable page → **unverifiable**, not a fabrication verdict.
- Matcher controls (4, all passing): three known-present strings found in
  fetched pages; one absent control string not found. Without these, a 37/37
  absence result means nothing — that is the second mistake below.
- Adoption: **closed**. Verdicts:
  `.ufo/waves/round-22/assimilation/quarantine-verdicts.tsv` (one row per id)
  and `quarantine-verdicts.json` (fetch status, located/missing counts, controls).
  No campaign file was written, no staged row appended, no id renumbering done.

`considerthese/`: this lane has no such directory (named in the report, per the
addendum). No operator proposal was mined.

## Mistakes

### M1 — a pinned literal was read backwards, and the repair was labelled non-author

- **Class:** provenance / fitting (`absent-vs-empty` encoding).
- **Evidence pointer:** `.ufo/waves/round-22/w2b/CriticRepairFitting.md` §F1,
  `.ufo/waves/round-22/w2b/CriticAuthority.md` §A1, §A4,
  `.ufo/waves/round-22/w2b/CriticTrend.md` §F2, and the pinned field
  `corpus/evidence/round-22/semantic-expectations.json`
  `cases[na-native-submit].post.errors`.
- **What happened:** the pin spelled an absent error recorder as `[]` while the
  same pinned stage used `null` for an absent submit recorder. The landing branch
  therefore had to read a pinned literal backwards: an observation literally
  equal to the pin failed, and an unobservable dimension passed. Meanwhile
  `post-crash-repair.json` claimed “pinned expectations are unchanged” and
  labelled the lane's own W2b seats as “non-author review”.
- **Captured-by (the rule that should have caught it):** the note's own reject
  row for `na-native-submit` names the null-to-empty collapse, and `§9` claim
  sizing requires a target to be one value the closure can re-derive — a rule
  that lives only in a code branch is not in the target. The authorship rule is
  the fleet learning-path clause: a seat this lane dispatched is still the lane.
- **Fix (shown able to fail):** `errors` is now `null` in the pinned file, the
  id-guarded branch is replaced by the uniform `null`-means-absent rule, the
  shape check requires `post.errors === null` exactly for `navigation: landing`,
  and the digest is re-pinned. New selftests isolate both directions — the
  retained positive passes only through the absence rule, and
  `native-landing-errors` (an observation carrying `errors: []`) still fails.
  The whole revision is disclosed in
  `.ufo/waves/round-22/expectation-revision.json` and in an errata section of
  the note. Value neutrality is measured, not claimed: 12 at the pre-revision
  oracle `e3cf4e0`, 12 at the post-revision oracle `47bfb5f`. `post-crash-repair.json`
  now labels W2b author-side and points at the revision.

### M2 — an all-negative detector was believed before it had a positive control

- **Class:** uncontrolled instrument (`100% absent` accepted without controls).
- **Evidence pointer:** the first run of
  `.ufo/waves/round-22/assimilation/hand-check.mjs` printed
  `{"rows":37,"summary":{"absent-refused":37}}` with no control block, exit 0.
- **Captured-by:** an all-negative result is only meaningful if the same matcher
  finds text that is present and misses text that is not — otherwise the result
  reads as `payload-absent` for every row no matter how broken the fetch or
  normalisation is.
- **Fix (shown able to fail):** four controls run before the verdicts; three must
  be found (rfc9309 `robots.txt`, rfc9110 `Retry-After`, the chromium README
  `devtools`) and one must not (`zzz-not-present-control-string-31337`). The
  script records `controlsPassed` and exits 3 when any control disagrees, so the
  verdict file cannot be produced green by a broken matcher. A register row with
  zero quotes is now `unverifiable-register-malformed` rather than silently
  “present”.

## Waves

Round shape: **two v1 waves** (policy `ufo-wave-policy.json`), both dispatched in
earlier attempts of this same round and re-verified here.

- **W1 (build), 64 seats:** 64/64 reports, 0 dead, 0 replacement
  (`.ufo/waves/round-22/w1/`, registry + `w1-spawn-result.json`, event history in
  `w1-event-history.json`: 72 assistant error events, 7 live peer messages, no
  retry-exhausted event; no actor quiescence certified).
- **W2 (falsify), 64 validated seats, 0 spawned:** 24 whole-payload refusals
  (“Background job limit reached (100)”) across `.ufo/waves/round-22/w2-*`, then
  the host session died. W2 contributed no observation.
- **W2b (post-crash falsify replacement), 65 seats:** spawned at attempt 12
  (`w2b-spawn-result.json`), 58/65 reports written; 7 seats died without a report
  (`RowOutcome10`, `RepairLandingErrors`, `RepairMaskedFixture`,
  `ReviewIncludesMatching`, `ReviewPositiveControl`, `ReviewSourceHeader`,
  `ReviewEvidenceBinding`). No dead seat was replaced. Registry has member names
  only — no agent ids for W2b, which is itself a conformance defect named in the
  report.
- Round total: 129 seats (64 + 0 + 65), one over the ≤128 two-wave cap because the
  65-seat replacement was validated after W2's 64-seat payload had already been
  authorized; reported, not hidden.
- The canonical planner seat is held by the L1 (the validator rejects a
  `planner` seat); the bounded planning data-walk rode scout/connector items.

## Honest bounds

Every seat named above was dispatched by this lane, so all findings are
**author-side**; no non-author admit/reject agreement is asserted. Independent
non-author closure and any SHONEN promotion remain with the round's verifier.
No new browser execution, real site, other build, default profile, absent
activation, served-wire identity, arbitrary fault cleanup or malicious-author
authenticity is established. The retained landing stage has no error recorder,
so that one dimension is certified as recorder absence, not “no page errors”.
