# ScribeRoutedDefects — round-33 w1 frontier: routed round-32 defects 3, 4, 6, 7

Verdict: all four routed defects are dispositioned with drafts and receipts, none landed (L1 integrates).
**Defect 3** — decided in favour of the release-pin receipt entry with a restored `on-release` cadence: the
lane's own convention is 30 of 31 tag-pinned code rows on `on-release`, S125 the sole `90d`, and the drafted
entry is verified end-to-end against the frozen gate (population 23 → 24, resolved 24, S125 `verdict: holds`,
exit 0), with the spot-check's supporting quote shown to belong to a different document. **Defect 4** — two
append-only correction texts drafted, and the pair is verified clean by the lane's own calibration counter
(`mismatches 0`, zero deleted lines). **Defect 6** — M9's fix is confirmed landed at the round-33 baseline
(matrix `:263`), and both the round-33 row and the in-place fix-cell replacement are drafted. **Defect 7** —
the round-33 controls reproduce byte-exactly for six of seven captures; `c1-J3-junk-rows` does not
(`5b022cee…` rebuilt against recorded `99b96a02…`) because `controls.mjs:64` stamps sibling repos' live
branch heads, and the two C2 control recipes read the lane worktree rather than a baseline blob. No lane
tracked file, index, or fleet path was written; no browser was launched.

## Commands and outcomes

Every run is inside a `--shared` clone of the lane at `/fast/scratch/hyaku/tabi-r33/ScribeRoutedDefects/clone`
(`git -C … rev-parse --show-toplevel` = the clone path, detached at the freeze `e6b0a9074d434ccc307badd312ae7379d1193fea`).
Commits exist only in that clone.

| # | command | exit | outcome |
|---|---|---|---|
| 1 | `git clone -q --shared <lane> $S/clone && git -C $S/clone checkout -q --detach e6b0a907…` | 0 | toplevel = clone, HEAD = `e6b0a907…` |
| 2 | `curl -q -sS --proto =https "<tag 154 session_commands.cc>?format=TEXT"` | 0 | HTTP 200, 90,944 B body, decoded sha256 `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` (equals S125's cited digest) |
| 3 | `curl -q -sS --proto =https "<tag 156 session_commands.cc>?format=TEXT"` | 0 | HTTP 200, 92,700 B body, decoded sha256 `1bb1537c89f579436479b72666547a46bb7369a11228982ae855c690b31fac06` |
| 4 | block test of S125's six ranges against the 156 bytes (whitespace-normalised, `blockIn` semantics of the gate) | 0 | `287-289 HOLDS 332-338 HOLDS 378 HOLDS 407-410 HOLDS 429-464 HOLDS 510 HOLDS` |
| 5 | `node scripts/check-release-pins.mjs --repo $D --rev b7d16fb8… --stable 156.0.8078.47 --json` | **0** | population 23, resolved 23, unresolved 0, holds 16, drifted 7, clean |
| 6 | same gate at the draft commit `beec3c0a…` (entry appended, `refetch/S125.json` added, S125 `on-release`, both blobs committed) | **0** | population 24, resolved 24, holds 17, drifted 7, clean; `S125 {"resolved":true,"verdict":"holds","reasons":[]}` |
| 7 | `node scripts/check-sources.mjs` with S125 `on-release` in the worktree | **0** | `SOURCES_GATE verdict=clean rows=126 tiers=A:111,B:6,C:9 … findings=0` |
| 8 | `node scripts/check-selfassessment.mjs --rev e80378f9… --repo $D --json` after appending the defect-4 paragraphs to SCORECARD.md and LOG.md | **0** | `mismatches 0`, `clean true`, `counted 0`; `git diff --numstat e6b0a90 e80378f9 -- SCORECARD.md LOG.md SKILL.md corpus/README.md` = `9 0 LOG.md`, `16 0 SCORECARD.md` (zero deletions) |
| 9 | control-tree rebuild (`git checkout --force --detach b7d16fb8` + `clean -fdx` + the exact writes `controls.mjs` makes + `git add -A` + `git write-tree`) | 0 | `c1-J2 28208038…` = recorded; `c1-J4 9fa562e4…` = recorded; `c1-J3 5b022cee…` ≠ recorded `99b96a02…`; `c2-J2 b7566d9f…` = recorded; `c2-J3 9811384d…` = recorded; `c1/c2-J1` = lane `b7d16fb8^{tree}` `c7999ee7…` |
| 10 | `git show e6b0a90:corpus/knowledge/webdriver-bidi-capability-matrix.md \| grep -n "round 32 wave 2"` | 0 | `263:` — the M9 correction is committed at the round-33 baseline |
| 11 | `pgrep -fa 'chromedriver\|chromium'` | 0 | one line, `/usr/bin/earlyoom …` matching the pattern inside its own argv; **no browser process of this seat** |

## Defect 3 — S125 cadence and the release-pin receipt entry

Decision: **add the entry, restore `on-release`.** Ground:

- `corpus/SOURCES.md:139` recheck cell is a bare `90d`; of the 31 registry rows whose `source` cell carries
  a Chromium Gitiles tag, 30 read `on-release` (`corpus/SOURCES.md` scan, 2026-10-26) — S125 is the only
  exception, created by round-32 M10 to leave the gate's population.
- The spot-check's justification quote is misattributed: "re-run on a new ChromeDriver build" is the
  **runtime entry's** recheck at `corpus/knowledge/webdriver-bidi-runtime-round-32.md:7`, not S125's
  registry cell, which never carried that sentence. The convention argument does not need it.
- The release verdict is a real tripwire, not a no-op: every cited range still holds at 156 today, so a
  release that changes the BiDi enabling path turns the row `drifted` → `s1-drift-unsuperseded` and forces
  a superseding row — which is the round that would re-measure the new driver anyway.

Drafted, verified artifacts: `drafts/s125-receipt-entry.json` (verbatim receipt row), `drafts/s125-refetch.json`
(refetch record), the registry change `corpus/SOURCES.md:139` `90d → on-release`, the two byte blobs to commit
(`corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/chrome/test/chromedriver/session_commands.cc`),
a `note_round_33` key so the round-29 receipt's note stays true, the round-33 `## Gate` lesson text, and the
§Status/recheck line. Receipts: `drafts/gate-b7d16fb8….json` (before), `drafts/gate-beec3c0a….json` (after),
`drafts/check-sources-with-s125-on-release.txt`.

**Limit, stated plainly:** the gate's `f6-refetch` compares seat *names*; my two role names came from one
process. The landing must have a second seat fetch the 156 blob. Also, the stable value is not re-derived
here — `receipt.stable` must equal `--stable` (`156.0.8078.47`), so a future stable needs a new receipt, not
an edit.

## Defect 4 — the named correction of round-32 `claims.json` C1 `feasibilityDisclosed`

`.ufo/waves/round-32/claims.json:39` closes with "it is not reachable without a committed receipt of two real
runs from a driver other than the counter". `.ufo/waves/round-32/w1/CritC1Forgery.md:9-15` admits four
constructions at exit 0, admitted sixteen, failing zero (`b858b5d` golden transcripts + one real CDP
screenshot + re-export driver; `e666174` one row id sixteen times; `7912a62` one run's path cited twice;
`cee9539` two byte-identical copies), and D2 shows `admitted` counts instances, not distinct surfaces. Two
append-only texts drafted in the SCORECARD style at `:1605-1626` — one SCORECARD paragraph, one LOG
paragraph — each citing `claims.json:39`, lesson round-32 M2, and the round-33 baseline battery reading
(`.ufo/waves/round-33/baseline/c2-J1-do-nothing.json`, `forgeriesAccepted: 8`). Verified no-harm (row 8).

## Defect 6 — M9 landed

`corpus/knowledge/webdriver-bidi-capability-matrix.md:263` (`## Dated correction — 2026-10-26 (round 32
wave 2): collector size limits on this build`) supersedes the round-13 correction's clause at `:157-161`,
which is exactly what `.ufo/waves/round-32/w1/ExecCollectorTiming.md` case 3 contradicted. It is committed at
the round-33 baseline (row 10). Drafted: a round-33 `## Mistakes` row marking M9 closed, plus the in-place
replacement of `corpus/lessons/round-32.md:145`'s fix cell
(`carried: an append-only correction of that paragraph is planned with gate v2` → `landed (round 33) — …:263 …`).
Lessons sit outside the round-33 no-harm append-only path set, so the in-place cell edit is permitted; the
round-33 row carries the same fact independently if the L1 prefers the round-32 lesson left untouched.

## Defect 7 — controls reproducibility

`baseline/controls.mjs` rebuilds six of the seven captures exactly (row 9). The failure is
`c1-J3-junk-rows`: `controls.mjs:64` takes each junk row's pin from `git -C <fleet>/<lane>-shokunin rev-parse
refs/heads/master`, so the tree moves with sibling commits (re-run heads `kama 0163fea2`, `mori aa3af1ec`,
`souji 756d77f0`, `tameshi c6295cb0`), and the heads at scoring time are recorded in no receipt — the
recorded tree cannot be regenerated from the receipts. Two secondary fragilities: the C1 controls read the
lane worktree's `corpus/adjacency.tsv` (`controls.mjs:61`), and `c2-J2`/`c2-J3` read the lane worktree gate and
the entry/registry bytes — they reproduce today only because the gate is still v1 (`2f25af5a…c393`) and those
digests are `c1018906…30c5` / `c77ca47d…71f2`; once C2 rewrites the gate, `c2-J2`'s recipe yields a different
tree. One-line disposition (drafted, `drafts/draft-7-controls.md`):

> Controls reproducible from `.ufo/waves/round-33/baseline/controls.mjs`: six of seven captures rebuild
> byte-exactly at `b7d16fb8`; `c1-J3-junk-rows` does not, because `controls.mjs:64` stamps sibling repo branch
> heads read live at run time (rebuild `5b022cee…` against recorded `99b96a02…`) — fix: take each sibling pin
> from the frozen candidate list's `<lane>-shokunin@<pin>` (or the counter's `PINS`) and read the two C2
> control inputs with `git show b7d16fb8:<path>`, so every tree is a function of the frozen inputs alone.

## Touched surfaces

- Wrote: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/ScribeRoutedDefects/` (drafts and
  receipts, listed below) and this report. Scratch clone and fetch files under
  `/fast/scratch/hyaku/tabi-r33/ScribeRoutedDefects/` — removed before yielding.
- Read-only: `corpus/lessons/round-32.md`, `corpus/lessons/round-32-verifier-spotcheck.md`,
  `corpus/knowledge/webdriver-bidi-capability-matrix.md`, `corpus/SOURCES.md`, `SCORECARD.md`, `LOG.md`,
  `.ufo/waves/round-32/{claims.json,w1/CritC1Forgery.md}`, `.ufo/waves/round-33/{claims.json,baseline/*}`,
  `scripts/check-release-pins.mjs`, `scripts/check-sources.mjs`, `corpus/evidence/round-29/release-pins/receipt.json`.
- No lane tracked file, lane index, jj state, fleet path, or sibling repo changed. No tool installed or
  upgraded (no pacman, no `uv`, no `npx`), so there is no tooling record to make.

## Out of scope / not done

- Nothing landed: registry cell, receipt row, blobs, refetch record, SCORECARD/LOG/lesson text are drafts
  for the L1.
- Stable-version currency not re-derived (S108 trigger not re-fetched): the draft binds to
  `--stable 156.0.8078.47`, the value the committed receipt carries.
- The C1/C2 claims themselves were not measured or reviewed (other seats own them); `check-bidi-runtime.mjs`
  and `.ufo/waves/round-33/counters/*` were not modified or re-scored here.

## Deliverable paths (all under `.ufo/waves/round-33/w1/ScribeRoutedDefects/`)

- `drafts/draft-3-s125.md` — decision, receipt row, refetch record, blobs, note key, lesson text, limits.
- `drafts/s125-receipt-entry.json`, `drafts/s125-refetch.json`.
- `drafts/draft-4-claims-c1-feasibility.md` — SCORECARD and LOG correction texts.
- `drafts/draft-6-m9-landed.md` — round-33 mistake row + fix-cell replacement.
- `drafts/draft-7-controls.md` — reproducibility table, cause, one-line disposition.
- `drafts/gate-b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd.json` (before, exit 0),
  `drafts/gate-beec3c0a7946c9f77e61431b9e87938b37a2ea94.json` (with the S125 entry, exit 0),
  `drafts/gate-e80378f97fc202d09645de71553b55c17e2e3cff.json` (docs-only correction commit, exit 0),
  `drafts/gate-s125-entry.json` (copy of the S125 run).
- `drafts/selfassessment-with-corrections.json`, `drafts/check-sources-with-s125-on-release.txt`,
  `drafts/controls-repro.txt`.
