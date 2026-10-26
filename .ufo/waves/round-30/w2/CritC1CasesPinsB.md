# CritC1CasesPinsB — C1 attack (round-30 w2): the four `ExecPinsCasesB` release-pin cases

Seat `CritC1CasesPinsB` (critic, leaf). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Attacked: the four self-test cases added by w1 seat `ExecPinsCasesB` to `scripts/check-release-pins.mjs`
(`drift-superseder-teaches-without-prefix-unresolved`, `drift-superseder-not-at-stable-tag-unresolved`,
`absence-404-present-with-marker-unresolved`, `absence-404-body-lacks-marker-unresolved`, lines 405-434)
as they stand in the lane at `072af95fe2822f0785a6ff88a578e2142dd258e5` (gate blob sha256
`915a6bba21223a4871c7f4ebbf27c5b4295137910c9ddec11bd5c31e2f55a648`; this differs from the freeze blob
`56763720…6fc3770` because `38891ca0` appended the round-30 self-test cases — the permitted C1 change).
Measured only in a `git clone --shared` at that rev under
`/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsB/` (`git status --porcelain` empty before every run), using
the gate's **production** `--repo <fixture> --rev <HEAD> --stable 156.0.8078.47 --json` path (not the
self-test harness) so that `rows[].reasons` is read directly. No lane file, lane index, jj state, fleet
repo or `shokuknow` path was written; no network; no tool installed (node v24.21.0, git 2.56.0).

## Verdict

All four cases are **discriminating for the catalogue mutant they were written for**, and the
refetch/digest binding of every fixture is consistent, so each case fails on the intended path and on
nothing else: in production mode each fixture returns `population 1`, one row, `resolved false`,
`verdict drifted`, `reasons ["s1-drift-unsuperseded"]` — no `r1`, `f1`-`f6` reason appears; and each
of the four catalogue mutants (`pins-s1-supersession-prefix`, `pins-s1-supersession-tag`,
`pins-notfound-status`, `pins-notfound-body`) turns its fixture into `exit 0`, `reasons []`, while
leaving the other three cases untouched. The 404 pair also kills every plausible weakening I tried
(any non-empty body, marker read from the *old* bytes, weak `404` substring, branch removal). **Defect
(low-moderate, kill-coverage not gate behaviour):** the two supersession cases do not discriminate the
class the assignment names. Three wrong gates that *accept any `supersedes` text* — `includes("supersedes")`,
`startsWith("supersedes ")` (any id), `includes(" —")` — pass the whole 29-case self-test (verified:
`--selftest` exit 0, zero failing cases) and read all four fixtures correctly, because no case has a
well-formed `supersedes <wrong-id> — …` cell or a non-em-dash separator. Likewise a wrong gate that
accepts *any tag ≥ stable* passes the whole self-test and reads all four correctly, because the only
superseder fixture is pinned at the **old** tag; a superseder at a tag *newer* than `--stable` is
accepted by that wrong gate and rejected by the pristine one. One added case per shape (fixture-only,
no catalogued `find` line touched) kills all four leaks — measured, §5.

## 1. Per case: pristine reading and mutant kill (production mode)

Fixture extraction used the gate's own builder, not a re-implementation: `build.mjs` is the rev blob
with the trailing `main();` removed and `evaluate, CASES, makeFixture` exported; each fixture is built
by its own `CASES[i].build`, committed, then read by the **unmodified** gate
(`clone/scripts/check-release-pins.mjs`). Receipts: `fixtures-four.json`, `out-<case>.json`.

```
for id in <the four ids>:
  node <pristine gate> --repo <fixture root> --rev <fixture HEAD> --stable 156.0.8078.47 --json
```

| Case (line) | fixture shape | pristine production reading | kills (measured) | lone reason? |
|---|---|---|---|---|
| `drift-superseder-teaches-without-prefix-unresolved` (405) | S001 drifted (`NEW_DRIFT`); S002 at **stable** tag, `teaches` = `kThing reads disabled at the newer tag` | `exit 1`, `rows[0] = {resolved:false, verdict:"drifted", reasons:["s1-drift-unsuperseded"]}` | `pins-s1-supersession-prefix` → `exit 0`, `reasons []` | yes, exactly 1 |
| `drift-superseder-not-at-stable-tag-unresolved` (412) | S001 drifted; S002 at **old** tag (`recheck 90d`), correct `supersedes S001 — …` | same | `pins-s1-supersession-tag` → `exit 0`, `reasons []` | yes, exactly 1 |
| `absence-404-present-with-marker-unresolved` (419) | old 404 → new **200**, body still has `NOT_FOUND`, `ranges []` | same | `pins-notfound-status` → `exit 0`, `verdict "holds"` | yes, exactly 1 |
| `absence-404-body-lacks-marker-unresolved` (428) | old 404 → new **404**, body `<html>…Error 404…</html>` | same | `pins-notfound-body` → `exit 0`, `verdict "holds"` | yes, exactly 1 |

Cross-kill isolation: applying one catalogue mutant at a time to the gate and running `--selftest`, the
failing-case list is exactly one entry — the case above — for each of the four (`matrix.txt`,
`matrix.json`). No case is killed by a mutant it does not target, so no kill here is an accident of a
neighbouring check.

Refetch/digest consistency (measured by reading the committed fixture trees, and by the single-reason
result): receipt `fetched_by W1-fixture` vs refetch `seat W2-fixture`; refetch `tag` = `--stable`,
`status` = `f.new_status`, `sha256` = `f.new_sha256`, all three equal to the receipt's fields; the two
404 cases put the full 64-hex sha256 of the old 404 body in the anchor, and `f5-digest` matches it
(`perturb` runs below show these are the only bindings the cases lean on).

## 2. Does the fixture fail on the intended path only? (break-the-binding probes)

If the refetch record or the byte digest were mis-bound, the case would still be "unresolved" but for the
wrong reason — and the pinned `reasons` assertion would then flag it. Measured on copies:

| probe | production reading |
|---|---|
| `perturb-norefetch.json` — delete `refetch/S001.json` from the s1-prefix fixture copy, commit | `exit 1`, `reasons ["f6-refetch content/public/common/feature.cc"]` (case would **FAIL** its `reasons` assertion) |
| `perturb-badbytes.json` — rewrite the 404-status fixture's new bytes, commit | `exit 1`, `reasons ["f3-bytes sha …","f5-digest"]` (2 reasons → **FAILS**) |

So the cases are not merely "exit 1 on pristine": they are pinned to one reason, and a fixture-binding
slip converts them to visible failures. That is the property the assignment asks about, and it holds.

## 3. Defect: the supersession cases accept weakened `teaches`/tag gates (severity low-moderate)

Wrong gates built by a single substitution each from the rev blob (find-occurrence asserted == 1;
sources in `variants/`, shas in `SHA256SUMS`), run in production mode over the four fixtures **and**
through the gate's own `--selftest`:

| variant (line 252 rewritten) | four fixtures | full `--selftest` |
|---|---|---|
| `C_any_supersedes_text` — `sup.teaches.includes("supersedes")` | all four `exit 1`, intended reason | **exit 0, no failing case** |
| `D_prefix_any_id` — `sup.teaches.startsWith("supersedes ")` | all four intended | **exit 0, no failing case** |
| `E_any_text_with_dash` — `sup.teaches.includes(" —")` | all four intended | **exit 0, no failing case** |
| `N_prefix_no_separator` — `sup.teaches.startsWith(\`supersedes ${row.id}\`)` (em dash dropped) | all four intended | **exit 0, no failing case** |
| `O_tag_ge_stable` — `sup.tags.some((t) => cmpVersion(t, stable) >= 0)` | all four intended | **exit 0, no failing case** |
| `F_any_tag` — `sup.source.includes("refs/tags/")` | tag case → `exit 0` | exit 3, fails `drift-superseder-not-at-stable-tag-unresolved` |
| `G_tag_ge_old` — `sup.tags.some((t) => cmpVersion(t, "154.0.8037.97") >= 0)` | tag case → `exit 0` | exit 3, fails the same case |
| `H_superseder_exists_only` — `const ok = !!sup;` | both s1 cases → `exit 0` | exit 3, fails both s1 cases |

So the tag side of the assignment's question is answered **no** for the weakenings that loosen *downward*
(any tag, tag ≥ old): case 412 kills them. The `teaches` side is answered **yes**: any gate that still
requires *some* `supersedes` token passes, because case 405's `teaches` cell contains no `supersedes` at
all and therefore cannot tell `supersedes ${row.id} —` from `supersedes <anything>`. Line evidence,
`scripts/check-release-pins.mjs:252`:

```
const ok = sup && sup.teaches.startsWith(`supersedes ${row.id} —`) && sup.source.includes(`refs/tags/${stable}/`);
```

and the only superseder fixtures in `CASES`: line 406 (`regLine("S002", { tag: NEW, teaches: "kThing reads
disabled at the newer tag" })`) and line 414 (`regLine("S002", { recheck: "90d", teaches: "supersedes
S001 — kThing disabled at the new tag" })`). Neither pins the row id inside a
plausible prefix, and neither pins the em-dash separator; the `stable`-vs-newer-tag boundary is unpinned.

### Counter-fix fixtures I built (measured, proving the gap is a missing case, not a limit)

Built with the same `makeFixture`/`regLine` shapes, in `extra/`:

| fixture | shape | pristine | C / D / E | N | O |
|---|---|---|---|---|---|
| `X1_wrong_id_superseder` | S002 at stable, `teaches` = `supersedes S007 — kThing disabled at the new tag` | `exit 1`, `["s1-drift-unsuperseded"]` | **all three `exit 0`, `reasons []`** | `exit 1` (unaffected) | `exit 1` |
| `X2_ascii_hyphen_separator` | `supersedes S001 - kThing …` (ASCII hyphen) | `exit 1`, intended | `exit 0` | **`exit 0`** | `exit 1` |
| `X3_prefix_no_separator_rest` | `supersedes S001 and kThing …` | `exit 1`, intended | `exit 0` | **`exit 0`** | `exit 1` |
| `X4_superseder_at_future_tag` | S002 at `157.0.1.1` (> stable), correct prefix | `exit 1`, intended | — | — | **`exit 0`, `resolved true`** |

`X1` alone kills C, D and E; `X4` alone kills O. Both are plain fixture additions — no catalogued `find`
line changes — so they satisfy C1's consequence rule ("only self-test cases and fixtures may change").

## 4. The 404 pair: no leak found

Wrong gates tried against the same two fixtures and the full self-test
(`variants/I,J,K,L,M,Q,R`): catalogue `pins-notfound-status` and `pins-notfound-body` (each killed by its
own case only); `K_notfound_any_nonempty` (`nb.length > 0`) → killed by both 404 cases (and by
`absence-404-now-present-drifts`); `L_notfound_weak_marker_404` (`nb.includes("404")`) → killed by
`absence-404-body-lacks-marker-unresolved`; `M_marker_from_old_bytes` (marker read from `ob`) → killed by
`absence-404-body-lacks-marker-unresolved`; `Q_404_branch_removed` (`if (false)`) → both 404 cases fail
with `f3-bytes status`, i.e. still detected, and `absence-404-holds` catches the branch loss directly.
Residual, low: `R_404_branch_also_200` (`old_status === 404` widened to `>= 400`) passes the whole
self-test — untested branch breadth (410/403 old status), no fixture impact.

## 5. Smallest safe correction (proposal only — this seat does not repair)

1. Add `drift-superseder-wrong-id-unresolved` (shape `X1`): S001 drifted, `superseded_by S002`, S002 at
   the stable tag with `teaches` `supersedes S007 — kThing disabled at the new tag`; expected `exit 1`,
   `unresolved 1`, `reasons ["s1-drift-unsuperseded"]`. Measured to kill C, D and E.
2. Add `drift-superseder-at-newer-tag-unresolved` (shape `X4`): S002 at `157.0.1.1` with the correct
   prefix; expected `exit 1`, `unresolved 1`, `reasons ["s1-drift-unsuperseded"]`. Measured to kill O.
3. Optional (separator hygiene, same fixture family): `X2`/`X3` shape, kills `N`.
Each is a CASES-array append with the fixture's own refetch record already consistent by construction; no
catalogued check line, counter or catalogue byte changes, so `fault_total 27 / benign_total 13` are
unaffected. Note this is *coverage beyond* C1's frozen predicate: the four catalogue `pins` mutants these cases
target are all killed as delivered (§1), and the other 23 catalogue rows are other seats' reading, so
nothing here falsifies C1's target — it records that the kill set is narrower than the check it guards.

## 6. Commands and exit codes

```
S=/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsB
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"            → 0
git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5                  → 0
git -C "$S/clone" rev-parse HEAD                                                        → 072af95…
git -C "$S/clone" status --porcelain | wc -l                                            → 0
sha256sum "$S/clone/scripts/check-release-pins.mjs"                                     → 915a6bba…5a648

TMPDIR=$S/tmp node mkfx.mjs "$S/fx"                                                     → 0   (four fixtures, using the rev blob's own makeFixture/CASES)
TMPDIR=$S/tmp node mkfx2.mjs                                                            → 0   (X1/X2/X3)
TMPDIR=$S/tmp node mkfx3.mjs                                                            → 0   (X4)
node mkvariants.mjs                                                                      → 0   (17 variants, each find-occurrence == 1)
TMPDIR=$S/tmp node "$S/clone/scripts/check-release-pins.mjs" --selftest --json           → 0   cases 29, passed 29
node matrix.mjs                                                                          → 0   (matrix.txt / matrix.json: 4 fixtures × 18 gate builds — pristine + 17 variants — plus each build's --selftest)
# per-case production reads (4 ×):
TMPDIR=$S/tmp node "$S/clone/scripts/check-release-pins.mjs" --repo "$R" --rev "$H" \
  --stable 156.0.8078.47 --json                                                          → 1 each, reasons ["s1-drift-unsuperseded"]
# mutant production reads: A,B,I,J → 0 with reasons [] on their own fixture (others 1)
# perturb probes: norefetch → 1 (["f6-refetch …"]), badbytes → 1 (["f3-bytes sha …","f5-digest"])
# X1..X4: pristine → 1 (["s1-drift-unsuperseded"]); C/D/E on X1 → 0; N on X2/X3 → 0; O on X4 → 0
```

No gate, counter, formatter, linter or build of the lane was run; `check-gate-mutants.mjs` was not run
(wave-1 established that its run directory names the mutant, so my attribution is by reading, per the
assignment). Ownership of the lane files is untouched: this report and `w2/CritC1CasesPinsB/` are the only
writes.

## 7. Files in this output dir

`SHA256SUMS` covers all 67 files: `fixtures-four.json`, `out-<case>.json` ×4 (pristine production reads),
`perturb-norefetch.json`, `perturb-badbytes.json`, `pristine-selftest.json` (29/29),
`matrix.json` / `matrix.txt`, `extra/` (X1-X4 fixtures, variant reads, `st-*.json` self-test reads),
`variants/` (17 wrong-gate sources), `harness/` (`build.mjs`, `mkfx*.mjs`, `mkvariants.mjs`, `matrix.mjs`).

## 8. Scratch

`/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsB/` (clone, fixtures, variants, tmp) — removed after the
files above were copied here.
