> **DRAFT — w1 `ScribeLesson`, for L1 review.** Not the filed lesson. Refreshed after the w1 seats
> landed their reports, so peer evidence is cited by seat and file rather than inferred. The
> remaining `PENDING` markers are exactly three kinds: the REV measurement (`.ufo/waves/round-37/measure/`
> is empty), the L1's registry landing (142 → 143 rows), and `ExecBuildTool`'s own run receipt.
> Frozen-before-data control receipts and counter bytes are cited as such, never as measurement.

# Round 37 — lesson (tabi, 2026-10-27)

Claims frozen before data at `.ufo/waves/round-37/claims.json` in `99437d29de036415a9f2d0524343617a3b19988a`
(“round-37: freeze claims, C1 v5 + C2 v3 counters, build tool v2, harness v2, controls receipts
(before data)”, 2026-10-27 10:02:40 -0300) with baseline `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`
(the round-36 verifier spot-check). Both claims are instrument repairs of the lane’s own
round-36 instruments; neither claims new ground. C1 works the lowest-scoring non-retired axis,
adjacency (frozen start score 8, the round’s `lowestAxis`), and amends the drift-verification
counter family to v5 (`c1-adjacency-sweep-v5`) plus builder v2 (`c1-drift-audit-build-v2`).
C2 works operability (frozen start score 9) and hardens the Firefox BiDi counter to v3
(`c2-firefox-bidi-v3`) plus harness v2 (`measure.sh`); its grounded source is S143, the
git-replace manual opened this round. The other four axes are frozen at 9 each (depth,
coverage, freshness, calibration) and saturation is recorded as line 8 / window 3.
`frozenDigests` as declared by the contract: c1 `9c6289b70d67bb6da1bf5578e66ccfa2c40ea33c307adb33c454dc7bdd91752c`,
c2 `eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019`,
buildTool `a85152cdb8c0201e2ec08e8694b567f9ebb9735203e540a5b37f0207762a9a96`,
measure `9f89697c0509a93bfe748db7a72a9303c429f4dc680707b2dab503c3d6843302`,
controls `3a08367f9c11eb1e05aedc0a9c45dfc6e11aa5d0b041e1dfd74ac78eeed4f25e`.
`measurementRule`: after-measurements run `.ufo/waves/round-37/measure.sh <REV> <OUT> <FREEZE>`
in a clean clone, counters are taken from the freeze commit and not the worktree, and no counter
or claim byte is amended after any seat scores. Raw outputs will go to `.ufo/waves/round-37/measure/`.

## Gate

Row opened this round. Two independent fetches of the same bytes exist: seat `ScoutSrc`'s
(`.ufo/waves/round-37/w1/ScoutSrc/s143-evidence.md`, accessed 2026-10-27T13:35:05Z) and the one
this draft's file was hashed from, the peer scribe's own curl
(`/fast/scratch/hyaku/tabi-r37/w1/ScribeSources/git-replace.html`, 2026-10-27T13:34:56Z). Both are
38,351 B with sha256 `46750b9f…9105`, as is L1's re-open note
(`.ufo/waves/round-37/L1-notes/s143-gate-evidence.txt`). This seat re-read the fetched bytes,
re-hashed them and located the quote; it did not re-fetch either URL:

| id | URL | accessed (UTC) | status | bytes | SHA-256 | located quote (≤25 words) | location / decision |
|---|---|---|---:|---:|---|---|---|
| S143 | https://git-scm.com/docs/git-replace | 2026-10-27T13:34:56Z (and 13:35:05Z, byte-identical) | 200 | 38,351 | `46750b9f957b96a0660e158438dec14105a955801b02f7c3a009cf47b88d9105` | “The GIT_NO_REPLACE_OBJECTS environment variable can be set to achieve the same effect as the --no-replace-objects option.” (16 words) | `git-replace.html:1708–1709`, §DESCRIPTION (h2 id `_description`, line 1658); **admit** — tier A, `mined`, recheck `180d`, used-by `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` (C2 B1) |
| — (supporting, not a row) | https://git-scm.com/docs/gitrepository-layout | 2026-10-27T13:35:05Z (declared) | 200 | 64,401 | `2f736f8d40834d2fb4556322c44ae2ae332287df5b4eddcc0a8e5fdd78da82b5` | “refs/replace/ <obj-sha1> records the SHA-1 of the object that replaces <obj-sha1>.” | supporting only (the `refs/replace/` description, raw lines 2127–2134); evidence exists only in the L1 note and `ScoutSrc`'s receipt — this seat did not re-read its bytes, so the digest above is **declared, not verified here** |
| Q-S143 (`tabi`/round3, quarantine register — a different namespace that reuses the same label) | https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/cdp/WebMCP.ts | not re-fetched this round | — | 10,681 (round-27) | `ee7b6fd89e0080754ad1d17b288a4c2a806728761908fd79291a778524f979f5` (round-27) | “Requires Chrome 151+ with the `--enable-features=WebMCP` flag enabled” | **REJECT — `payload-absent` refusal retained**: round-27 measured 0 exact hits and 0 hits on every folded fragment (`Chrome`, `151`, `enable-features`); the file is a `WebMCPTool` TS class that names neither Chrome nor the flag. Cited from `.ufo/waves/round-27/quarantine/QuarantineC.md:12,29`; the round-37 slice was re-derived (not re-fetched) at 38 rows by `ScoutAssim` (`.ufo/waves/round-37/w1/ScoutAssim.md` §Q2) and this seat did not re-fetch the URL |

Three cautions for the L1, all measured here:

- **Quote counting — three different numbers are in circulation.** The L1 note says “13 words”;
  `ScoutSrc`'s evidence says “17 words”; the measured count is **16**
  (`The/GIT_NO_REPLACE_OBJECTS/environment/variable/can/be/set/to/achieve/the/same/effect/as/the/--no-replace-objects/option.`),
  produced independently by this seat, by `ScribeSources` (`quote-check.out`: `words=16`) and by its
  row note. All three counts satisfy ≤25, but only 16 is measured: the Gate cell and the registry
  anchor must carry 16, and the other two should be treated as transcription slips.
- **Verbatim-ness is normalisation-dependent.** The raw HTML does not contain the sentence as one
  string: the man-page render splits it across `<span class='synopsis'><code>` markup on the two
  tokens, so a raw exact-string grep fails while tag-stripped/normalised text matches
  (`ScoutSrc` and `ScribeSources` both report the same). Anyone re-checking the row must strip tags
  and normalise whitespace first, or the row will look falsely absent. The phrase
  `GIT_NO_REPLACE_OBJECTS` occurs exactly once in the file (raw line 1708); the sentence spans
  1708–1709.
- **Id namespace.** The registry is 142 rows with max id S142 (`corpus/SOURCES.md`), so S143 is the
  next free *registry* id. The quarantine absent-defect register also uses `S<nn>` labels and
  already carries an S143 (the puppeteer row above) — the two namespaces overlap in spelling
  (registry S106 is Chromium `content_features.cc` at `corpus/SOURCES.md:120`, while the
  quarantine slice’s S106 is `rfc9309`). The new S143 row must not be read as a revival or a
  correction of quarantine S143; the landed row draft already says so in its `scope` cell.

Additional located quotes from the same fetch, each ≤25 words, which the L1 can use to ground the
row's `teaches` (“replace refs rewrite object reads”): “Replacement references will be used by
default by all Git commands except those doing reachability traversal (prune, pack transfer and
fsck).” — 21 words, `git-replace.html:1680–1682`; “It is possible to disable the use of replacement
references for any command using the --no-replace-objects option just after git.” — 20 words,
`:1685–1686`; and the read-overwrite demonstration at `:1693` / `:1700–1705` (`cat-file commit foo`
prints *foo* under `--no-replace-objects`, *bar* without it). `ScribeSources` drafted the same Gate
entries independently (`.ufo/waves/round-37/w1/ScribeSources/Gate-draft.md`); its REJECT row is
“no further row” (assimilation `none`, contract rule 1 “open in the round that writes the row”),
which complements — and does not replace — the quarantine refusal row above.

Row draft: **landed** at `.ufo/waves/round-37/w1/ScribeSources/S143-row.md` with evidence in
`.ufo/waves/round-37/w1/ScribeSources/evidence/` (the L1 still lands the registry cell; no seat
edits `corpus/SOURCES.md`). Its pre-checks and copy-based validation, as reported by that seat:
max id S142 / 142 rows before; no `git-replace` URL registered yet (so no duplicate-URL class);
`used-by` target present; row is 11 cells with no literal or escaped pipe (NF=13); on a scratch copy
of the registry `sources-census.sh validate` exits 0 with the same 20 pre-existing W04 warnings and
`check-sources.mjs` reads `rows=143 tiers=A:127,B:7,C:9 status=queued:15,mined:119,rejected:9
findings=0`, against `rows=142 … A:126 … mined:118` on the copy without the row. Those numbers are
that seat’s copy-based measurement, not the committed count: the committed census is the landed
`ExecCensus` receipt below (142 rows pre-landing), and the 143-row state is the L1’s to confirm
after landing.

`corpus/SOURCES.md` change log: `PENDING` the L1 landing (expected 142 → 143 rows; S143 tier A,
`mined`, opened `2026-10-27`, recheck `180d`). Prior-round bytes stay append-only per `noHarmRule`.
The S143 entry teaches replace refs rewriting object reads and the flag/env that disables them; it
is a primary-source row for the C2 B1 mechanism, not for any new capability.

Assimilation: **none**, recommended by `ScoutAssim` (`.ufo/waves/round-37/w1/ScoutAssim.md`). It
scanned the read-only staged package (`/home/vgpnk/Projects/shokuknow/merge/tabi/MERGE-REPORT.md`,
148 staged rows, 86 knowledge files) for `(?i)replace.?ref|graft|GIT_NO_REPLACE|adjacency|calibrat`
and found zero hits touching either frozen claim’s ground; every incidental keyword hit is
web-craft vocabulary. Nothing was adopted, renumbered or merged; `considerthese/` was confirmed
absent from the working tree and from all history. The quarantine slice was re-derived from the
read-only register at **38 rows — 37 `payload-absent` + 1 `unreachable` (S171)** — reproducing the
round-36 figure, with the register’s own “By lane” summary showing 37 because it tallies only the
fabrication class. No URL was re-fetched; the S106/S149 rejects are both present in the slice.

Census: `ExecCensus` ran the primary command this wave — `sources-census.sh validate --root
/home/vgpnk/Projects/shokunin tabi` → **exit 0**, 21 output lines, `1 ok` + 20 `W04`, zero E-codes,
and the W04 set is byte-identical (`diff` clean) to `baseline/census-start.txt` and to round-36’s
receipts. Count-mode readings at the wave: **142** registry rows, ids S001–S142 with **no gaps**,
`S143` absent pre-landing; tiers `A=126 B=7 C=9`; status `mined=118 queued=15 rejected=9`; 0 malformed
rows, no duplicate ids, no enum/tier-inflation violation, no missing used-by path; `check-sources.mjs
verdict=clean … findings=0` (exit 0) independently; `corpus/SOURCES.md` sha256 identical at baseline,
freeze and HEAD (`dcfcdf0d…`); `sources-census.sh selftest` 96 killed / 0 survived; `overdue
--today 2026-10-27` → 0 overdue rows; S142 re-opened at its recorded digest (246,608 B /
`0a95cbcd…168a`). Post-landing the expectation is 143 rows with `A=127` / `mined=119` (the
`ScribeSources` copy-based run), which the L1 must confirm on the real registry. That seat also
found a **prompt-fidelity defect** worth routing: `gen-w1-spec.py` builds prompts with an f-string,
so `{0,3}` / `{3,}` rendered as literal `(0, 3)` / `(3,)` in two seat prompts (ExecCensus,
ScribeSources); both seats detected it and used working patterns, so no artifact is affected.

No source row was rejected this round beyond the retained quarantine refusal above; no package row
was added.

## C1 — adjacency

Counting command: `node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --rev <REV> --repo <clean clone> --fleet /home/vgpnk/Projects/shokunin --json`.

Before (frozen with the controls, before any claim data): the round-36 v4 instrument admits a
clone whose `c1-delta-pins.json` is a semantically-identical re-serialisation — `baseline/c1r37-J1-pins-reorder-v4.json`
records `exit 0`, `predicate true` at fixture rev `c7f0b424f9ffea812645e6aaf829128b9b764103` —
and refuses a truthful moved note carrying an earlier decoy token —
`baseline/c1r37-J2-decoy-note-v4.json`, `exit 1`, `predicate false` at `f8c0f42da37f2ee973191323bd103a846bf3d7d6`.
The frozen round-36 builder also carries a 39-hex kama pin
(`.ufo/waves/round-36/baseline/c1-drift-audit-build.mjs:21`, `e8fa87ef19ec5eb28f5fd9701a0a42a45bd688d`),
and the enforced predicate was not one byte-identical sentence across its three sites.

Frozen-target controls: v5 refuses the reordered-pins clone (`baseline/c1r37-J1-pins-reorder-v5.json`,
`exit 2`, digest mismatch), admits the decoy-note clone (`baseline/c1r37-J2-decoy-note-v5.json`,
`exit 0`, `predicate true`), and holds the honest floor at the baseline tip
(`baseline/c1r37-J3-honest-v5.json`, rev `ed8ccfc0…`, `exit 0`, `predicate true`, pins digest bound).

After at measured revision: **`PENDING`** — no `measure.sh` run at a measured revision exists
(`.ufo/waves/round-37/measure/` is empty); everything observed this wave was taken at the baseline
tip `ed8ccfc…`.
Expected shape per the contract predicate: `check-adjacency` clean at REV, `completeness.unaccounted == 0`,
`drift.total >= 1`, `drift.auditCoverage == drift.total`, `drift.auditFindings == 0`,
`drift.staleFindings == 0`, `delta.unaccounted == 0`, `delta.screenFindings == 0`, and the delta
pins digest equal to the frozen one.

w1 falsifier corroboration **at the baseline tip** (not the REV measurement): `CritC1b` extracted
four sites — `claims.json` predicate, the v5 constant, the header sentence and the honest run’s
`receipt.predicateSentence` — all 295 bytes / `sha256[:16] 68aa9968b4af718d`, and confirmed the B2
repair is sound (first canonical `verbatim at :N` clause only, `v5:458`; the cited text is re-read
from the pin blob at `:462` and compared at `:463`); a truthful note carrying a second decoy clause
is admitted, a note whose relocation does not hold the cited text is refused. `MutC1a` ran five
mutants: m1 (digest → zeros), m3 (restore the v4 parser) and m5 (reword the constant) are killed by
the honest, J2 and external byte-identity checks respectively; m2 (shortening the digest comparison
to 8 hex) survives the exercised J2 fixture and its requested prefix-collision fixture was not
constructible; m4 (delete the predicate’s final digest conjunct, `v5:587`) survives *behaviourally*
because the earlier refusal at `:389` already catches J1 — redundancy, not an admitted attack.

## C2 — operability

Counting command: `node .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs --rev <REV> --repo <clean clone> --json`.

Before (frozen with the controls): v2 admits a clone whose receipt blob is grafted through
`refs/replace` (`baseline/c2r37-J1-replace-ref-v2.json`, `exit 0`, `predicate true`) and admits a
receipt whose `observed` decoration was tampered (`baseline/c2r37-J2-observed-tamper-v2.json`,
`exit 0`, `predicate true`); it has no teardown survivor check; the round-36 harness wrote its
numstat to a path that no longer existed and invoked `check-freshness` with an invalid flag pair.

Frozen-target controls: v3 refuses the replace-graft clone at the clone state itself
(`baseline/c2r37-J1-replace-ref-v3.json`, `exit 2`, “refs/replace present in measured clone”), and
receipt-finds the observed tamper (`baseline/c2r37-J2-observed-tamper-v3.json`, `exit 1`,
`receiptFinding = run1: observed captureScreenshot.sha256 != transcript first screenshot`). Honest
floor `baseline/c2r37-J3-honest-v3.json`: `exit 0` at `ed8ccfc0…` with
`{"predicate": true, "admitted": 16, "survivors": 0, "egress": 0, "receiptFinding": null, "binding": null}`.

After at measured revision: **`PENDING`** — no live-leg run at REV exists yet (the live leg is the
frozen v3 counter’s own Firefox 158.0.1 / geckodriver 0.37.1 headless run against a loopback
fixture). Expected shape: no entry/receipt/binding finding, `failing == 0`, `admitted >= 16`,
`live.egressNonLoopback == 0`, `live.survivors == 0`.

w1 corroboration **at the baseline tip**: `RevC2a` independently re-ran the frozen v3 and v2 bytes
and reproduced the honest result (`predicate true`, `admitted 16`, `failing 0`, `survivors 0`,
`egressNonLoopback 0`, `receiptFinding null`, `binding null`) plus both falsifier pairs — v2 exit 0
over the observed-tamper and replace-graft clones, v3 exit 1 with the screenshot-digest receipt
finding and exit 2 with `refs/replace present in measured clone
(refs/replace/88f73cf2…)`. `MutC2a` produced **static analysis only** (could-not-evaluate, no
mutant executed): it notes that removing `GIT_NO_REPLACE_OBJECTS` while keeping the enumeration
survives the frozen J1, that no frozen control plants a live survivor, so the `live.survivors == 0`
term and the survivor counting are exercised only by a real live run, and that a fake live runner
cannot reach `liveRecordFirefox`. Those are honest gaps for the REV measurement, not refutations.

## Disposition and instrument findings

- Both claims are **amendments, not measurements**, at this point in the round. The
  `controlsDoNothingNote` in `claims.json` is the honest statement that the frozen targets are
  unreachable without them: v4 returns `predicate true` over unfrozen pins and v2 returns
  `predicate true` over both C2 attacks (`baseline/c1r37-J1-pins-reorder-v4.json`,
  `baseline/c2r37-J1-replace-ref-v2.json`, `baseline/c2r37-J2-observed-tamper-v2.json`).
- **Predicate sentence across its three sites (scribe spot-check on frozen bytes; not a
  measurement).** Extracting the sentence text from each site and comparing exactly: `claims.json`
  `predicate` == the counter header sentence == the `PREDICATE_SENTENCE` constant, for both claims —
  C1 is 295 characters, C2 is 154 (`c1-adjacency-sweep-v5.mjs:79,131`; `c2-firefox-bidi-v3.mjs:72,114`),
  and the counter prints the constant verbatim into `receipt.predicateSentence`. The header copy is
  necessarily wrapped in the comment marker (`//   <sentence>`), so a **raw-line** comparison can
  never be byte-equal across the three sites; `RevFrozenDigests` read the claim’s “byte-identical
  across its three sites” as a raw-line test and reported a difference on that basis. This is a
  conformance-reading question for the L1, not a counter defect: the sentence text is identical, and
  the check must compare the sentence substring, not the comment line. The authoritative three-site
  check remains the measurement’s `receipt.predicateSentence` against the two frozen sites.
- **Receipt-shape nit in the frozen controls (pre-data, worth fixing before the next freeze).**
  `baseline/c2r37-J3-honest-v3.json` carries `"predicate": null` at top level while the counter
  exited 0 with predicate true and the value is embedded in the `summary` string
  (`{"predicate": true, "admitted": 16, …}`). The C1 honest-floor receipt carries a typed
  `"predicate": true` instead. A parser that reads `predicate` from the C2 receipt would mis-read
  the honest floor as “not evaluated”. The counter’s own `out.predicate` is typed
  (`c2-firefox-bidi-v3.mjs:683`); the inconsistency is in the control driver’s receipt writer
  (`baseline/run-controls.sh:164–169`, which passes a literal `null` for the structured predicate
  while embedding the JSON result in `summary`). `RevControls` found the same defect independently.
  Recorded as a finding, not silently repaired: the controls are frozen before data.
- **Control-script construction gap.** `RevControls` also reports that the B/C/D fixtures in
  `baseline/run-controls.sh:52,62,66,77,84,98` lack the `rev-parse --show-toplevel` assertion that
  fixture A has (`:40–41`) and the script header promises (`:4–5`). All mutations were directed at
  clone paths and no live-lane mutation was observed, so this is a construction-hygiene issue, not a
  contamination. It belongs in the next freeze’s control driver.
- **Freeze integrity (executor and reviewer, not this seat).** `RevFrozenDigests` and
  `ExecFreezeIntegrity` both report all five `frozenDigests` matching their mapped files at
  `99437d29…`, byte-identical in the worktree at tip `f76da094…`; the freeze commit is a **direct
  child** of `ed8ccfc…` and adds exactly 17 paths, all under `.ufo/waves/round-37/` (0 deletions, no
  lane content file touched). `ExecFreezeIntegrity` additionally reproduced the embedded constants
  against frozen objects — `DELTA_PINS_SHA256` = sha256 of the round-36 pins blob at the freeze,
  `ADJ_GATE_SHA256` = `scripts/check-adjacency.mjs`, `GATE_SHA256` =
  `scripts/check-bidi-runtime.mjs` — ran `node --check`/`bash -n` on the freeze bytes, and found no
  `refs/replace`, graft or alternates in the measured lane. The tip is one dispatch-only commit
  ahead of the freeze, so `origin/master` is `f76da094…`, not the freeze commit: a check that equates
  them fails for a non-substantive reason.
- **Frozen control fixtures are labels, not resolvable pointers.** The control receipts name
  `fixtureRev` commits (`c7f0b424…`, `f8c0f42d…`, `192cda5c…`) that were created inside the freeze
  driver’s scratch clones and are unreachable once that scratch is removed: `MutC1a` reports its
  first attempts at those revisions failed as `unresolvable revision`, and `RevC2a` had to rebuild
  the fixtures before re-running them (its observed-tamper clone is a new commit, `9efcb9d4…`).
  Reproducing any control therefore requires reconstructing the fixture, not checking out the named
  revision. The receipts remain evidence of an observed run; they are not independently re-runnable
  as committed.
- **Simplifier findings on the frozen bytes (recorded, not repaired after data).** `SimplifyC1`
  accounts for every hunk of all four diffs (C1 +33/−11, C2 +90/−10, builder +4/−1, harness +21/−9)
  and reports six candidates, none of which changes a claim term or kill rule: **D1** the harness’s
  r36c1/r36c2 legs are unrouted and r36c2 launches a second live Firefox session per measurement
  (round 37 runs three live C2 counters); **D2** v3:341 `survivors.concat(scratchSurvivors(...))`
  re-lists already-counted pids, so a process surviving SIGKILL is counted twice (verdict unaffected,
  receipt magnitude wrong); **D3** v3:113 is labelled `// B4 discipline:` while the header lists only
  B1–B3 (phantom amendment label — confirmed in the frozen bytes); **D4** the `v5:587` digest
  conjunct is unreachable-false behind the `:389` refusal (same redundancy `MutC1a` m4 found);
  **D5** optional double derivation of moved rows at `v5:461–465`; **D6** a harness comment claims a
  cwd change that does not happen. It also sharpens the kama defect: v2 output is byte-identical to
  the committed ledger, so the repair is validation-only.
- **Cross-lane education (w1 connectors).** `ConnPattern` enumerated sibling counter sources and
  found no sibling instance of the unbound-frozen-input class in the counters it inspected, but one
  replace-object gap outside tabi: kotodama round-74 `counters/accept-c.py:248–255` runs `git` with
  no `GIT_NO_REPLACE_OBJECTS`/`--no-replace-objects` and enumerates no `refs/replace`
  (adjacency report only; no fix asserted for that lane). `ConnDrift` re-derived the round-36 delta
  heads: 111 commits across 10 sibling lanes since the pin, and 0 browser-ground added lines in
  `SKILL.md`/`corpus/knowledge`, consistent with the round-36 zero-hit observation (`kama`’s one
  commit touches other paths). Neither connector result is evidence that the C1 predicate passes.
- **Harness v2 scope.** `measure.sh` resolves `OUT` to an absolute path up front, writes numstat
  through that absolute path while diffing inside the clone, and invokes
  `check-freshness.mjs --worktree --repo <clone>` instead of the invalid `--worktree --rev` pair
  (header lines 2–8; `:56` and `:69`). `RevHarness` reviewed both repairs against the freshness
  CLI contract (`--worktree` + `--repo` legal, `--rev` rejected) and smoke-ran the frozen harness
  once at `ed8ccfc…` with `99437d29…` as FREEZE: it completed, wrote a 313-byte numstat with 10
  changed paths, and the freshness leg exited 0 with a clean verdict. The REV measurement is still
  the w2 run; this smoke shows the two repaired arms can pass.
- Not this round’s routed items, carried unresolved: round-36 spotcheck defect 6 (w1 Godspeed
  directive was not byte-identical — a family this round joins with the f-string brace mangle) and
  defect 7 (four incomplete w2 seats). No verification credit is claimed for them.

## Mistakes

- **M1 — `reference-drift`.** Carry of round-36 M2
  (`corpus/lessons/round-36.md` ## Mistakes M2) and of round-36 spotcheck routed defect 1
  (`corpus/lessons/round-36-verifier-spotcheck.md`). Evidence: w1 `CritC1` T8 and w2
  `ExecDeltaLive` F1 showed that a substituted `c1-delta-pins.json` — same semantics, different
  bytes — lets the frozen v4 counter return `predicate true` with three mis-audited moved rows.
  Captured-by: **`none`** at round 36. The round-36 out-of-band receipt
  (`measure/pins-binding-at-20a69e0.txt`, eight digests equal, freeze→REV diffs empty) bound that
  one measurement only; the counter itself kept reading the pins file at REV without comparing its
  digest, so the reference could drift again silently. Fix: **v5 digest binding** —
  `DELTA_PINS_SHA256 = '810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655'`
  (`c1-adjacency-sweep-v5.mjs:96`), refusal on mismatch (`:387–389`), the digest as a predicate
  term (`:587`) and as a receipt field (`deltaPinsSha256`, `:539`). The fix is shown able to fail
  by its red control J1: v4 `exit 0` / `predicate true` over the reordered-pins fixture
  (`baseline/c1r37-J1-pins-reorder-v4.json`) against v5 `exit 2` digest mismatch
  (`baseline/c1r37-J1-pins-reorder-v5.json`). This is the reference-drift class in one sentence:
  an instrument that reads an input it does not bind cannot tell a frozen input from a drifting one.

- **M2 — `hand-copied-constant`.** Evidence: round-36 spotcheck routed defect 2 — the frozen
  builder’s kama pin literal is 39 hex characters,
  `kama: 'e8fa87ef19ec5eb28f5fd9701a0a42a45bd688d'` at
  `.ufo/waves/round-36/baseline/c1-drift-audit-build.mjs:21` (re-measured here: literal length 39,
  while all 20 sibling pins in that table are 40 hex — the only other 1-character literal in the
  file is the unrelated `GIT_CONFIG_NOSYSTEM: '1'` env value). The true pin is
  40 hex (`…a42da45bd688d`, as held by v2 at `c1-drift-audit-build-v2.mjs:24`). Captured-by:
  **`none`** — no gate compared the copied literal against a resolvable revision. The typo was
  invisible rather than harmless: the builder computes `drifted = deltaHead !== PINS[s]`, so while
  kama *is* drifted the pin’s own value is never used for a comparison and the ledger comes out
  byte-identical (re-derived this wave by `SimplifyC1` §4.1). The exposure is a *stable-kama* round:
  the 39-hex literal then marks kama drifted and emits its 9 rows. Fix: **v2 builder’s PINS-resolution
  guard** —
  every `PINS` entry is resolved against its sibling repo at startup and an unresolvable revision is
  a refusal, never a silent constant (`c1-drift-audit-build-v2.mjs:6–10,62–63`), with the kama
  literal corrected to the 40-hex value. Red state: the 39-hex literal cannot resolve as a revision,
  so the guard turns the round-36 defect into a loud exit instead of silence; the guard’s own run
  receipt is `PENDING` (`ExecBuildTool`), and this seat did not run it.

## Errata — routed defects dispositioned this round

Round-36 spotcheck “Routed defects and notes for round 37” (1–8) → round-37 instrument bytes.
Everything below is a code-level disposition in the frozen counters/harness; only the
frozen-before-data controls are observed outcomes, and the REV measurement is `PENDING`.

| # | Routed defect (round-36 closure) | Disposition this round | Evidence in the freeze | Observed outcome |
|---|---|---|---|---|
| 1 | C1 counter does not digest-bind `c1-delta-pins.json`; substituted pins → `predicate true` with mis-audited rows | **→ C1 B1** digest binding in v5 (`:96`, refusal `:387–389`, predicate `:587`, receipt `:539`) | `c1-adjacency-sweep-v5.mjs` header B1 | J1 red control: v4 exit 0 / v5 exit 2 (`baseline/c1r37-J1-*.json`) |
| 2 | Frozen build tool’s kama pin is 39 hex (missing `d`) | **→ build tool v2** (`c1-drift-audit-build-v2.mjs`): literal corrected to 40 hex + PINS-resolution guard (`:62–64`) | v2 header `:3–10`, kama `:24` | guard verified this wave by `SimplifyC1` §4.1–4.2: v2 output is byte-identical to v1’s and to the committed ledger (307 rows), and the 39-hex literal fails `rev-parse --verify` (exit 1) so the loop would refuse it; `ExecBuildTool`’s own run receipt `PENDING` |
| 3 | Moved-note parser takes the first `:<digits>` token, refusing truthful notes with an earlier decoy token | **→ C1 B2** canonical `verbatim at :N` clause parsing in v5 | v5 header B2 | J2 control: v4 exit 1 / v5 exit 0 predicate true (`baseline/c1r37-J2-*.json`) |
| 4 | Enforced C1 predicate sentence ≠ counter header text | **→ C1 B3** sentence discipline: enforced predicate, header and `claims.json` carry one byte-identical sentence | v5 `:79`, `:131`; C2 `:72`, `:114` | scribe spot-check above: sentence text equal at all three sites (C1 295 chars, C2 154 chars); the header copy sits behind the `//` marker, so a raw-line comparison differs (`RevFrozenDigests` read it that way) |
| 5 | Harness `numstat` path bug + invalid `check-freshness --worktree --rev` (exit 2) | **→ measure v2** (`measure.sh`): absolute `OUT`, numstat through it, `--worktree --repo <clone>` | `measure.sh` header `:2–8`, no-harm block | `RevHarness` reviewed both repairs and smoke-ran the frozen harness once at `ed8ccfc…`: `measured ed8ccfc`, numstat written (313 B, 10 rows), freshness leg exit 0 / `FRESHNESS_GATE verdict=clean`. A harness smoke at the baseline is not the REV measurement |
| 8 (C2) | Replace refs can redirect `git show` reads; no replace-ref evidence | **→ C2 B1**: `GIT_NO_REPLACE_OBJECTS=1` on every git read (`c2-firefox-bidi-v3.mjs:121`), `refs/replace/*` enumerated and any entry a refusal (`:123–125`, `:527–528`) | v3 header B1 (grounded in S143) | C2 J1: v2 exit 0 predicate true / v3 exit 2 refusal (`baseline/c2r37-J1-*.json`) |
| 8 (C2) | Abnormal SIGTERM / teardown can leave browser + scratch survivors | **→ C2 B2**: survivor sweep after SIGTERM+close, survivors SIGKILLed and counted (`:339–342`), predicate requires `live.survivors == 0` (`:683`) | v3 header B2 | honest floor survivors 0 (`baseline/c2r37-J3-honest-v3.json`); abnormal-exit arm `PENDING` at REV |
| 8 (C2) | Receipt `observed` decorations unauthenticated (w2 `CritC2b`) | **→ C2 B3**: bind the derivable `observed` fields (session caps/websocket segment, context count, viewport, first-screenshot sha); mismatch = receipt finding; the rest explicitly display-only | v3 header B3 | C2 J2: v2 exit 0 / v3 exit 1 `receiptFinding = run1: observed captureScreenshot.sha256 != transcript …` |

Carried, not dispositioned (recorded so the next freeze does not re-derive them): round-36 defect
6 (prompt-fidelity — w1 directive not byte-identical to `skill://godspeed/directive.md`) and defect
7 (four incomplete w2 seats; no credit). Defect 5’s no-harm leg and defects 1–4’s REV measurement
are the w2 measurement, not this wave.

## Trend verdicts

`PENDING` the measurement. The lane’s own reporting rule is that a trend verdict needs committed
before→after evidence: for round 37 that is the `measure.sh` receipts at the measured revision plus
the no-harm comparison against baseline `ed8ccfc0…`. At drafting time the only observed deltas are
the frozen-before-data controls above, which establish that the new instruments refuse what the old
ones admitted — a precondition, not a result.
