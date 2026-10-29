# RevC2Checker — checker line review vs sentence (C2, calibration)

Seat: `RevC2Checker` (leaf, no subagents). Subject: `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs`
frozen at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`, reviewed byte-exact against
`.ufo/waves/round-42/counters/check-routed-defects-round42.mjs` at the same commit and against the
frozen C2 predicate in `.ufo/waves/round-43/claims.json`.

## Method and tooling

- Read `/home/vgpnk/.omp/agent/RULES.md`; **no installs/upgrades** (node v24.21.0 fnm-managed, git,
  coreutils only). PACMAN guard respected (no pacman transaction).
- Role protocol: `lsp` device unavailable in this environment (`xd://lsp` — no such device; mounted
  device list carries no language server). Recorded; all caller/definition evidence is live execution
  and git object queries, not grep inference.
- Sources: `git show 7ca6f01:<path>` for both checkers (working tree at lane HEAD `ba433c94` is
  byte-identical for the counter: sha256 `2f150b84…431743` matches `claims.json.frozenDigests`).
- Predicate identity (claims.json asserts byteIdentical): verified — `const PREDICATE` (line 35),
  header `PREDICATE-SENTENCE` (line 19), and `claims.json claims[1].predicate` are all 1314 chars and
  equal (`evidence/r43-const-predicate.txt`, `claims-c2-predicate.txt`).
- Live runs: read-only invocations of the production counter against the lane repo at freeze and
  baseline revs.
- Fixture battery: scratch clone of the lane at `7ca6f01` under `/fast/scratch/hyaku/tabi-r43/RevC2Checker`
  (toplevel asserted), throwaway identity local to the clone; both counters copied to scratch and run
  from there; 23 mutation cases (`evidence/run-cases.sh`, per-case `evidence/cases/<case>/{rev.txt,r43.json,r42.json}`).
  Scratch deleted after evidence copy.

## Checklist results (all verified live)

1. **Exit code semantics — PASS.** `die()` → exit 2 (usage: missing `--rev`/`--repo`, rev not `^[0-9a-f]{40}$`);
   findings → exit 1; predicate → exit 0 (checker lines 39–41, 60, 224). Observed: no args → 2; 39-hex rev → 2;
   missing `--repo` → 2; unknown 40-hex rev → 1 (paths absent, no crash); clean freeze run → 1→0 as expected;
   baseline run → 1 (`evidence/usage-exits.txt`).
2. **`requireBlob` before size floors everywhere — PASS.** The `cat-file -t` gate (lines 76–84, S151)
   precedes every `cat-file -s` size floor and every content read: r1-measure (l.90), r1a/r1b (l.98),
   r2-sources (l.115) + r2-staged-html (l.133), r3-baseline (l.145), r4-slice/r4-tsv (l.159) + r4 evidence
   (l.179), r5-claims (l.189) + r5 controls (l.198), r6-probe (l.208). Demonstrated: tree at receipt path →
   `r1a-not-a-blob` (case `fl`; r42 names only `r1a-unparseable`); tree as r4 evidence → `r4-ev-S118-not-a-blob`
   (case `fa2`); 413-byte receipt blob → `r1a-too-small` fires after the gate passes (case `fn`).
3. **r4 column parsing vs real TSV — PASS on real bytes.** The committed TSV at the freeze is exactly
   38 rows × 3 tab-separated columns (`id\tverdict\tpath`), no header, no `#` comments, no empty paths
   (histogram: `38 3`; slice-ids.txt = 38). r43 parses id=col0, verdict=col1 (enum present/absent/misbound/
   partial/unreachable), path=col2 — matching the real format; set-equality against slice-ids plus
   duplicate detection hold on green runs.
4. **r5 quote length rule — PASS.** `typeof b.quote !== 'string' || b.quote.length < 8 || !raw.includes(b.quote)`
   (line 201) matches the freeze's `controlBindingRule` ("quote lines of fewer than 8 characters are malformed
   by construction"). A 5-char *verbatim substring* quote fires `r5-binding-quote-absent` purely on length
   (case `ff`); sha flip → `r5-binding-sha-mismatch` (`fg`); 4 bindings → `r5-freeze-bindings-thin` (`fh`).
5. **r6 field checks — PASS as coded, one gap (see F2).** `refused===true` (l.212), `findingIds` includes
   `r1-measure-blob-pin-mismatch` (l.213–214), `fixtureRev` 40-hex (l.215), `generatorDigest` 64-hex (l.216).
   Each fires on mutation (cases `fi`,`fj`,`fk`); note the r5 binding cross-fires `r5-binding-sha-mismatch`
   on any probe byte change — the bindings live-guard the probe.
6. **No path writes — PASS.** No `fs.*` call exists (`import fs` line 20 is unused); git plumbing is
   read-only only: `show`, `cat-file -t`, `cat-file -s`, `rev-parse` (grep over both checker bodies).
   No invocation of either counter writes anywhere (fs import unused, no shell-outs beyond read-only git).
   Every write by this seat sits under `.ufo/waves/round-43/w1/`; other live lane changes during the
   window (README.md, measure/failed-run-1, knowledge/lessons, w1.ready.dispatched) belong to concurrent
   seats — none are mine.

## Live calibration

- `--rev 7ca6f01 --repo <lane>` → exit 0, predicate true, 0 findings (`evidence/run-freeze.json`).
- `--rev ab592825 (baseline)` → exit 1, findings exactly `["r5-claims-absent","r6-probe-absent"]`
  (`evidence/run-baseline.json`) — byte-for-byte the committed control
  `.ufo/waves/round-43/controls/c2-baseline-red-r43.json` (exit 1, same two ids).
- r42 checker at the freeze rev → exit 0, 0 findings (`evidence/run-r42-freeze.json`): both checkers are
  green on honest bytes; the holes show only under fabrication/tree fixtures (below).

## Behavioral deltas r42 → r43 (from `evidence/r42-vs-r43.diff`)

1. **Type gate added** (`gitObjectType`/`requireBlob`, r43 l.66–84): every checked path must be a blob
   before any size floor/content check. Closes the r42 P-A class — proven: TSV evidence path citing a
   5302-byte tree greens r42 (case `fa2`, r42 exit 0) and is refused by r43 (`r4-ev-S118-not-a-blob`).
2. **r1 measure blob-id pin**: `git rev-parse` object id hard-compared to pinned
   `8ff64d691f5c09569a50f2a5a038bb23774c3d35` (l.27, 91–93). Closes the V0 class — proven: self-consistent
   fabricated receipt+witness+measure greens r42 (case `fb`, r42 exit 0) and is refused by r43 with exactly
   `r1-measure-blob-pin-mismatch`.
3. **r2 staged-html**: absence now via requireBlob (`-absent`/`-not-a-blob`) instead of r42's
   `gitShow===null` → `r2-staged-html-absent`; tree at that path: r43 names the type, r42 mis-names
   `r2-quote-not-verbatim` (case `fm`).
4. **r3**: absence id renamed `r3-baseline-file-absent` → `r3-baseline-absent`; content checks unchanged.
5. **r4 rewritten**:
   - column count `!== 3` (r42) → `< 3` (r43 l.169): rows with a 4th column are accepted, extras silently
     dropped — r43 greens (case `fe`) where r42 fired `r4-row-malformed` + `r4-ids-missing`.
   - cells no longer individually trimmed (whole-row trim only); `#` comment lines now skipped (r42
     treated them as malformed rows).
   - empty third column: r42 fired `r4-evidence-absent`; r43's whole-row trim makes the row 2-column →
     `r4-row-malformed` + `r4-id-set-mismatch` (case `fd`) — still refused, differently classified.
   - id checks: r42's missing/extra ids + hard `sliceIds.length === 38` → r43's sorted set-equality +
     `Set` duplicate check; **the pinned 38 is gone (see F1)**.
   - evidence check: r42 skipped evidence for invalid-verdict rows; r43 checks every row with non-empty
     path regardless of verdict validity (stricter). Finding ids now carry the row id
     (`r4-ev-<rid>[-too-small]`).
   - slice/tsv gating short-circuits (`&&`): if the slice file is absent/non-blob, the TSV's own type is
     not named (r42 named both absences).
6. **r5 new rule** (freeze-binds-controls): claims.json `controlBindings` ≥ 5, per-binding path/sha256
   format, committed-blob gate, sha256 equality, verbatim quote ≥ 8 chars (l.189–203).
7. **r6 new rule** (V0 probe receipt fields, l.208–218), including an extra-sentence `fixtureRev` 40-hex check.
8. Output schema `tabi-r42-routed-defects` → `tabi-r43-routed-defects`; r43 adds `predicateSentence` echo.
9. r43 header carries the frozen PREDICATE-SENTENCE (byte-identical to claims.json, verified); r42 header
   carried prose.
10. `--json` remains parsed-but-unused in both (stdout is always JSON; `die` writes stderr) — unchanged.

## Findings

**F1 (minor) — r4 accepts what the frozen sentence denies: the pinned "38-row" count is not enforced.**
Sentence r4 (frozen, claims.json): "the **38-row** re-adjudication TSV is committed with exactly the
committed slice ids, …". r43 checks only set-equality against the committed slice file (l.162–176); r42
enforced `sliceIds.length === 38` (`r4-slice-size`). Demonstrated (case `fc_38row_drop`, scratch clone):
a 37-row TSV over a consistently replaced 37-id slice-ids.txt is **green for r43 (exit 0, 0 findings)**
while r42 refuses with `r4-slice-size`. The 38 is a frozen fact of the round-42 quarantine slice; a lane
can shrink the slice file and the TSV together and stay green. Per C2's kill rule ("a rule accepts what
its sentence denies") this routes to round 44 as a sentence-vs-code drift. Evidence: `evidence/cases/fc_38row_drop/`.

**F2 (moderate) — r6 verifies the V0 probe's generator digest by format only, not identity.**
Sentence r6: "the committed V0-fabrication probe receipt refuses the self-consistent fabrication with the
measure-blob-pin finding and names **the frozen generator digest**." The frozen digest is committed and
authentic: `claims.json.frozenDigests[".ufo/waves/round-43/fixtures/v0-fabrication.mjs"] =
b87470625b11…cb0b80c`, and the fixture bytes at the freeze re-derive to exactly that (verified). The
checker instead tests only `/^[0-9a-f]{64}$/` (l.216) — any well-formed digest passes, while the sibling
pin that stops the same attack class at r1 IS hard-coded (`MEASURE_BLOB_PIN`, l.27). Demonstrated (case
`fv_gen_digest_forgery`, `evidence/fv_gen_digest_forgery.r43.json`, rev in `fv_gen_digest_forgery.rev.txt`):
a fabricated probe receipt (`refused: true`, `findingIds: ["r1-measure-blob-pin-mismatch"]`,
`generatorDigest: 8523d4d1…ec377a ≠ b8747062…`, valid 64-hex) plus a rebound claims.json binding
(sha256 + verbatim quote of the forged bytes — internally consistent, so r5 greens) yields **exit 0,
predicate true, 0 findings**. The checker admits a V0 probe receipt that does not name the frozen digest —
accepting what the sentence denies. Evidence: `evidence/fv_gen_digest_forgery.r43.json`.

## Non-defect deltas and notes

- 4-column TSV rows accepted with extras dropped (case `fe`): hardening regression vs r42, but the real
  TSV is 38×3 clean and the sentence r4 names the id/verdict/path conditions, which still hold; counted
  as residual risk, not a routed defect.
- r43 checks evidence paths even for invalid-verdict rows (stricter than r42); r5 cross-fires on any
  bound-control byte change (observed `fi`–`fk`); both are protective.
- r6's `fixtureRev` 40-hex check is stricter than the sentence (the sentence does not require it); the
  committed probe carries it, so no live effect.
- Usage/edge parity with r42: unknown flags ignored; unknown-but-well-formed rev treated as
  absent-findings (exit 1), not usage.

## Limitations

- Single-machine, single-run evidence; fixture mutations were committed only in the scratch clone
  (throwaway local identity), never in the lane.
- The r4/r5/r6 mutation cases exercise each rule in isolation on top of an otherwise-green tree; combined
  mutations were not exhaustively crossed.
- `lsp` unavailable (recorded above); no static references/diagnostics server was consulted.

## Verdict basis

The three headline hardenings (type gate, measure blob pin, freeze-bindings) are real and proven against
the r42 bytes they replace; exit semantics, requireBlob ordering, r5 quote length, and no-write bounds all
conform. Two sentence-vs-code drifts remain: F1 (38-row pin dropped) and F2 (generator digest identity
not anchored). Both are "rule accepts what its sentence denies" class and route to round 44 per C2's kill rule.

VERDICT finding r4 dropped the pinned 38-row check (fc: r43 green where r42 refused) and r6 checks the V0 probe generator digest by format only, not against the frozen b8747062… (fv forgery greens exit 0)
