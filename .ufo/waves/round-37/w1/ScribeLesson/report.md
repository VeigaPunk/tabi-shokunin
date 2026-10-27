# ScribeLesson — round 37 w1 report (tabi, 2026-10-27)

Seat: `ScribeLesson`, wave w1 (build + first falsifiers). Lane repo
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Assignment: draft the round-37 lesson in the shape of
`corpus/lessons/round-36.md`, filling (1) the opening claims paragraph, (2) the `## Gate` table with
the S143 row plus one REJECT row, (3) `## Mistakes` M1/M2, (4) an errata section for the four
v2/v4 routed defects and the C2 items.

## Behavior — what exists now

Written (the only files this seat created in the lane):

- `.ufo/waves/round-37/w1/ScribeLesson/round-37-draft.md` — explicitly headed
  `DRAFT — w1 ScribeLesson, for L1 review. Not the filed lesson.` Sections in round-36 order:
  opening claims paragraph → `## Gate` → `## C1 — adjacency` → `## C2 — operability` →
  `## Disposition and instrument findings` → `## Mistakes` → `## Errata — routed defects
  dispositioned this round` → `## Trend verdicts`.
- `.ufo/waves/round-37/w1/ScribeLesson/report.md` (this file).

Substance filled:

1. **Claims paragraph.** Freeze `99437d29de036415a9f2d0524343617a3b19988a` — verified to exist, to
   carry that message, and `git ls-tree -r` over it lists exactly the 17 frozen wave files
   (`claims.json`, three counters, `measure.sh`, twelve `baseline/` artifacts) — baseline
   `ed8ccfc00ad3784bc424aa118e056f8edf4ee803` (round-36 verifier spot-check). C1 = adjacency (lowest
   axis, frozen 8): instrument-repair of the v4 counter family → v5 + builder v2. C2 = operability
   (frozen 9): instrument-hardening of the v2 BiDi counter → v3 + harness v2, sourced from S143. The
   other four axes are frozen at 9, saturation line 8 / window 3, and all five `frozenDigests` are
   copied verbatim from `claims.json` and marked *declared* — this seat did not verify them
   (`RevFrozenDigests`/`ExecFreezeIntegrity` own that; the peer reviewer in fact reports all five
   matching at the freeze commit and in the worktree).
2. **Gate table.** Three rows: S143 admit candidate (tier A, `mined`, 180d, used-by the C2 v3
   counter); the supporting `gitrepository-layout` fetch, explicitly not a row and its digest marked
   *declared, not verified here* because its bytes exist only in the L1 note; and one REJECT row for
   the quarantine `payload-absent` material (puppeteer `WebMCP.ts`) with its round-27 measured reason
   and an explicit “not re-fetched this round”. The registry row draft is now **landed**
   (`w1/ScribeSources/S143-row.md` + `evidence/`), so the draft cites it rather than a scratch
   pointer. Assimilation is written as **none** with the landed survey's evidence, and the
   quarantine slice as **38 = 37 `payload-absent` + 1 `unreachable` (S171)**.
3. **Mistakes.** M1 class `reference-drift` — carry of round-36 M2 plus routed defect 1,
   captured-by `none` at round 36 with the exact reason (the out-of-band digest receipt bound one
   measurement; the counter still read an unbound pins file), fix = v5 digest binding with the J1 red
   control. M2 class `hand-copied-constant` — routed defect 2, captured-by `none`, fix = builder v2
   PINS-resolution guard, with the red state named (a 39-hex literal cannot resolve as a revision).
4. **Errata.** A table mapping routed defects 1–5 and the three C2 hardening items to the exact
   frozen bytes that disposition each (file:line), the observed control outcome where one exists, and
   `PENDING` where the outcome is the w2 measurement. Defects 6 and 7 are recorded as carried, not
   dispositioned.

Every measured-at-REV section is `PENDING`: `.ufo/waves/round-37/measure/` was empty at drafting
time, so no counter has run at the measured revision. Frozen-before-data controls are cited as
controls, never as measurement.

## Gates and checks run (all read-only; no counter, gate, census or fetch re-run)

| Check | Method | Result |
|---|---|---|
| Freeze commit | `git cat-file -t`, `git log -1`, `git ls-tree -r 99437d29…` | commit exists; exactly the 17 frozen wave files |
| Baseline commit | `git log -1 ed8ccfc…` | round-36 verifier spot-check commit |
| Control receipts | read all ten `baseline/*.json` + `baseline/run-controls.sh` header | C1: J1 v4 exit 0 / predicate true → v5 exit 2 digest mismatch; J2 v4 exit 1 → v5 exit 0 predicate true; J3 v5 exit 0 predicate true at `ed8ccfc`. C2: J1 v2 exit 0 → v3 exit 2 “refs/replace present in measured clone”; J2 v2 exit 0 → v3 exit 1 receipt finding on `captureScreenshot.sha256`; J3 v3 exit 0, admitted 16 / survivors 0 / egress 0 / receiptFinding null / binding null |
| S143 bytes | `sha256sum`, `wc -c` on the scribe-peer fetch | 38,351 B, `46750b9f957b96a0660e158438dec14105a955801b02f7c3a009cf47b88d9105` — equals `ScoutSrc`'s receipt, `ScribeSources`' re-hash and the L1 note |
| S143 quote | tag strip + whitespace normalisation, substring search | present after normalisation only; 16 words; `GIT_NO_REPLACE_OBJECTS` occurs once (raw line 1708); sentence spans 1708–1709; nearest `h2` = `_description` (line 1658) |
| Registry facts | `grep -cE '^\| ?S[0-9]+'` + `sort -V` on `corpus/SOURCES.md` | 142 rows, max id S142 → S143 is the next free registry id |
| Predicate sentences | exact compare of `claims.json` predicate vs header sentence vs `PREDICATE_SENTENCE` | C1 295 chars, C2 154 chars; sentence text equal at all three sites; header copy sits behind the `//` marker |
| Builder kama pin | `git show ed8ccfc:.ufo/waves/round-36/baseline/c1-drift-audit-build.mjs` + literal-length scan | kama 39 hex (`…a42a45bd688d`); the 20 sibling pins are 40 hex; v2 `:24` carries the 40-hex value |
| Builder guard | read `c1-drift-audit-build-v2.mjs:6-10,62-63` | every `PINS` entry resolved at startup; unresolvable ⇒ refusal |
| Harness v2 | read `measure.sh:1-90` | absolute `OUT`; numstat via absolute path; `check-freshness --worktree --repo <clone>`; not run by this seat — the repaired arms pass a peer smoke at the baseline |
| Census-start | read `baseline/census-start.txt` | 20 pre-existing W04 duplicates, no E-codes, `tabi ok` |
| Landed peer reports | read `ScoutSrc.md`, `ScoutAssim.md`, `ScribeSources/S143-row.md` + `Gate-draft.md`, `RevControls.md`, `RevFrozenDigests/report.md`, `ExecFreezeIntegrity/report.md`, `ExecCensus/report.md`, `RevHarness/report.md`, `RevC2a/report.md`, `CritC1b/report.md`, `MutC1a/report.md`, `MutC2a/report.md`, `SimplifyC1/report.md`, `ConnPattern/report.md`, `ConnDrift/report.md` | cited in the draft as peer evidence with their own seat attribution and their own stated limits (e.g. `MutC2a` static-only, `MutC1b` absent) |

Nothing was rerun to decorate the report: no counter, no `measure.sh`, no gate, no census, no fetch.
Git use was read-only (`cat-file`, `log`, `ls-tree`, `show`).

## Touched surfaces

- `tabi-shokunin/.ufo/waves/round-37/w1/ScribeLesson/round-37-draft.md` (new)
- `tabi-shokunin/.ufo/waves/round-37/w1/ScribeLesson/report.md` (new)
- Scratch `/fast/scratch/hyaku/tabi-r37/w1/ScribeLesson/` — created, used for one `git show` dump,
  deleted before yield (`rm -rf` confirmed).

No lane file outside the seat dir; no fleet-root file; no sibling repo; no commit/fetch/push; no
mutating git or jj.

## Out of scope / not done

- No measurement at REV, no counter execution, no gate/self-test/no-harm leg, no live-browser run —
  w2 and the executor seats own those; the draft marks them `PENDING`.
- No registry edit and no `SCORECARD.md`/`LOG.md`/`corpus/lessons/round-37.md` write; the L1
  integrates. The landed census (`ExecCensus`) and the S143 row draft are cited, not re-run or
  re-derived by this seat.
- No re-fetch of S143, `gitrepository-layout` or the quarantine URL.
- Did not run the builder guard (`ExecBuildTool` owns the run receipt); the draft says so.
- Report-path note: the seat item names `.ufo/waves/round-37/w1/ScribeLesson/report.md` and the
  seat trailer names `.ufo/waves/round-37/w1/ScribeLesson.md`. Both are seat-spec-named paths, so
  byte-identical copies were written to both (`cmp` clean at write time; the peer seats did the
  same); no other file was created outside the seat dir.

## Findings (for the L1)

1. **Three different word counts for the S143 located quote are in circulation.** L1 note: 13;
   `ScoutSrc/s143-evidence.md:51`: 17; measured independently here and by `ScribeSources`
   (`quote-check.out`): **16**. All satisfy ≤25; the Gate cell and the registry anchor must carry 16.
2. **The S143 quote is verbatim only after tag strip + whitespace normalisation.** The raw HTML
   splits the sentence across `<span class='synopsis'><code>` markup on both tokens, so a raw
   `grep -F` fails while the rendered text matches. A future verifier who greps raw bytes will
   wrongly conclude `payload-absent`. The drafted Gate says so explicitly.
3. **`S<nn>` id namespaces overlap.** Registry max is S142 (142 rows), and quarantine S143 exists as
   the puppeteer `WebMCP.ts` `payload-absent` row (`.ufo/waves/round-27/quarantine/QuarantineC.md:12,29`).
   Registry S106 (Chromium `content_features.cc`) and quarantine S106 (`rfc9309`) already collide the
   same way. The landed row's `scope` cell disclaims the collision; keep that.
4. **The frozen C2 honest-floor receipt has `"predicate": null` at top level.**
   `baseline/c2r37-J3-honest-v3.json`: exit 0, with the true value embedded in the `summary` JSON
   string. `baseline/c1r37-J3-honest-v5.json` carries a typed `"predicate": true`. The counter emits
   a typed `out.predicate` (`c2-firefox-bidi-v3.mjs:683`), so this is a control-driver defect
   (`run-controls.sh:164-169`); `RevControls` found it independently. A parser must not read that
   `null` as “not evaluated”.
5. **`RevControls` second finding — control-script construction.** Fixtures B/C/D in
   `baseline/run-controls.sh:52,62,66,77,84,98` lack the `rev-parse --show-toplevel` assertion that
   fixture A has (`:40-41`) and the header promises (`:4-5`). Mutations were directed at clone paths;
   no live-lane mutation observed. Next-freeze hygiene.
6. **“Byte-identical across its three sites” is a reading question, not a counter defect.** The
   sentence *text* is identical at all three sites for both claims, but the header copy is wrapped in
   `//   ` — no raw-line comparison can be equal. `RevFrozenDigests` read the claim literally and
   reported a difference; the drafted Disposition section states both readings and leaves the call to
   the L1.
7. **Honest floors are the old honest state.** Both claims' honest floors sit at `ed8ccfc…` (the
   round-36 closure commit), so the new instruments are shown admitting the *round-36* honest state
   before any round-37 measurement exists. That is a regression leg, not evidence round 37 improved
   anything; the draft's trend verdicts stay `PENDING`.
8. **`measure.sh` numstat baseline is `11c64b96…`** (round-36's baseline), not round-37's `ed8ccfc…`.
   Fine for a cross-round no-harm view, but the receipt must not be described as a round-37-only diff.
9. **Freeze tip ≠ branch tip.** `RevFrozenDigests`: `origin/master` = worktree `HEAD` =
   `f76da094f0ff0ad9856d2232858241e3f7841379`, one dispatch-only commit ahead of the freeze commit;
   the five frozen artifacts are unchanged across that step. Any check that asserts
   `origin/master == <freeze commit>` will fail for a non-substantive reason.
10. **Census landed clean, and it exposed a prompt defect.** `ExecCensus`: `validate --root … tabi`
    exit 0, `1 ok` + 20 `W04`, no E-codes, W04 set byte-identical to `baseline/census-start.txt`;
    142 rows S001–S142 with no gaps, `A=126 B=7 C=9`, `mined=118 queued=15 rejected=9`, 0 malformed,
    0 duplicate ids, 0 missing used-by, `check-sources.mjs` clean; `corpus/SOURCES.md` sha256
    identical at baseline, freeze and HEAD; 0 overdue rows; `selftest` 96/0. It also found that
    `gen-w1-spec.py` builds prompts with an f-string, so `{0,3}`/`{3,}` rendered as literal
    `(0, 3)`/`(3,)` in the `ExecCensus` and `ScribeSources` prompts (both seats detected it; no
    artifact damaged). Routed to round 38 — same family as round-36 defect 6.
11. **The frozen control fixtures are labels, not resolvable pointers.** Receipt `fixtureRev`
    commits (`c7f0b424…`, `f8c0f42d…`, `192cda5c…`) were created inside the freeze driver's scratch
    clones; `MutC1a` hit `unresolvable revision` on them and `RevC2a` had to rebuild the fixtures
    (new commit `9efcb9d4…`). No control can be re-run by checking out its `fixtureRev`; the receipt
    is evidence of an observed run, not a re-runnable artifact.
12. **Mutation coverage is partial and honestly reported.** C1 (`MutC1a`): m1/m3/m5 killed; m2
    (8-hex digest truncation) survives the exercised J2 fixture with its prefix-collision fixture
    unavailable → inconclusive; m4 (deleting the predicate conjunct) survives behaviourally because
    the `:389` refusal preempts J1 → redundancy, matching `SimplifyC1` D4. C2 (`MutC2a`): static
    analysis only (`could-not-evaluate`, nothing executed); no frozen control plants a live survivor
    and a fake live runner cannot reach `liveRecordFirefox`, so the `live.survivors == 0` term and
    the counting code are exercised only by a real live run — i.e. by the REV measurement.
13. **Simplifier findings on frozen bytes (no amendment after data).** `SimplifyC1` maps every hunk
    to a routed item and lists six candidates, none touching a claim term: D1 unrouted harness
    r36c1/r36c2 legs (r36c2 launches a second live Firefox per measurement, so round 37 runs three
    live C2 counters), D2 survivor double-count at `v3:341`, D3 phantom `// B4 discipline:` label at
    `v3:113` while the header lists B1–B3 (confirmed in the frozen bytes), D4 tautological `v5:587`
    conjunct, D5 optional double derivation at `v5:461–465`, D6 a harness comment that describes a
    cwd change that does not happen.
14. **Cross-lane.** `ConnPattern`: no sibling instance of the unbound-frozen-input class in the
    inspected counters, but kotodama round-74 `counters/accept-c.py:248–255` runs `git` without
    `GIT_NO_REPLACE_OBJECTS`/`--no-replace-objects` and enumerates no `refs/replace` (adjacency only,
    no fix asserted there). `ConnDrift`: 111 commits across 10 sibling lanes since the round-36 pins
    and 0 browser-ground added lines in `SKILL.md`/`corpus/knowledge`.
15. **Peer corroboration strengthens the instrument claims but is not the measurement.** `RevC2a`
    reproduced the C2 honest state and both falsifier pairs from the frozen bytes; `CritC1b`
    confirmed the C1 B2 parser soundness and four-site predicate identity (295 bytes,
    `sha256[:16] 68aa9968b4af718d`, receipt included); `RevHarness` smoke-passed both harness
    repairs at `ed8ccfc…`. All are at the baseline tip — none is the REV run the claims measure.

## Tooling provenance

No tool installed, upgraded or modified; no pacman transaction (host-wide pause respected); no
network fetch by this seat. Read-only git only; all scratch work under
`/fast/scratch/hyaku/tabi-r37/w1/ScribeLesson/`, removed at exit.

VERDICT ok — round-37 lesson draft written at `.ufo/waves/round-37/w1/ScribeLesson/round-37-draft.md`
in round-36 shape: frozen claims paragraph (freeze `99437d29…` direct child of baseline
`ed8ccfc…`, C1 adjacency / C2 operability, five declared digests), a Gate table with the S143 admit
row (16-word quote at `git-replace.html:1708–1709`, tier A / mined / 180d, plus three supporting
located quotes) and one quarantine REJECT row, assimilation `none` with the 38-row slice and the
landed census, M1 `reference-drift` and M2 `hand-copied-constant` with captures, mechanism and fixes,
an errata table for routed defects 1–5 and the three C2 hardening items, and the w1 falsifier /
simplifier / cross-lane findings folded into Disposition; every measured-at-REV section marked
PENDING and fifteen findings raised for L1 review.
