adjacent

# R71Connector — sibling overlap scan (pinch/zoom CDP surface + verifier-hardening pattern)

Seat R71Connector (leaf, read-only). Lane `tabi-shokunin`, round 71, wave w1.
Fleet root `/home/vgpnk/Projects/shokunin`; 20 sibling lanes scanned. Nothing outside this
wave directory was written; no git/jj mutation, no sibling execution, no claim admission, no
PROVINCE edit. Receipt: `.ufo/waves/round-71/w1/R71Connector/scan-receipt.txt`.
Heads observed at scan time (2026-11-06) are listed in §6; every quote below is re-read at the
head named in its row with `git -C <lane> show <head>:<path>`.

**Verdict in one line:** no sibling lane holds any part of C1 (zero `Input.synthesizePinchGesture`
/ `setPageScaleFactor` / `GestureSourceType` files, with a positive control), so C1 is a bounded
absence; C2's *components* are already held fleet-wide — kumitate ships the closest single
analogue (pinned-rev snapshot + 0700 temp dir + allow-listed child env), chousa/kama/mado ship
env scrubbing and re-hash-after-exec, tameshi's PROVINCE claims the reusable method itself — so
tabi's C2 is a re-derivation applied to its own verifier, not a new fleet method. Every hit is
reported, none absorbed.

## 1. C1 surface — bounded absence (with positive control)

Scan: `grep` with `gitignore:false` (so `.ufo/` evidence counts), `node_modules`, `vendor`,
`r94vendor`, `.git`, `.jj` excluded, path `/home/vgpnk/Projects/shokunin` minus `tabi-shokunin`.

| pattern | sibling files | tabi positive control (same command shape) |
|---|---|---|
| `synthesizePinchGesture` | **0** | `scripts/chrome-cdp-synthpinch-round71.mjs` (5 hits; `:322` the call, `:391` the count) |
| `synthesizeScrollGesture` / `synthesizeTapGesture` | **0** | tabi `.ufo/waves/round-*/sources/*browser*protocol*.json` |
| `setPageScaleFactor` | **0** | `scripts/chrome-cdp-synthpinch-round71.mjs:319` (degenerate arm) and `:392` (look-alike refusal) |
| `GestureSourceType` | **0** | `scripts/check-synthpinch-r71.mjs:20-29` (10 frozen legs) |
| `visualViewport` | 4 files, all bytes/page-script (§2) | — |
| `pinch` (word) | kake WCAG card only (§3); rest word-sense/`pincheck` | — |
| `dispatchMouseEvent` / `mouseWheel` / `deltaY` (as an instrument) | **0** | tabi `scripts/chrome-cdp-synthpinch-round71.mjs:316` |

The zero is a *scanned* zero: the same command shape returns tabi's own driver and counter, and
returns the kotoba strings dump for `Input.dispatchMouseEvent`, so the traversal and the pattern
work. No sibling lane runs a browser, dispatches a wheel, or reads a page scale.

## 2. `visualViewport` hits — bytes, not claims

| lane | path:line @ head | quote (≤25 words) | relation |
|---|---|---|---|
| kasegi | `.ufo/waves/round-28/wave1/ScribeLessonGate/S068.body:198` @ b9589300 | `* Narrow viewport: CSS media and layout width (avoid visualViewport alone — it can` | A **captured page script** in kasegi's corpus (same text at `S068.norm`, `.ufo/waves/round-30/wave1/fetch/s068.html:198`). No claim, no instrument; kasegi refuses live-target testing. |
| kotoba | `.ufo/round-44/evidence/omp-live-18.12.2-strings.txt:581553,581608,1273408` @ 0344ddae | `window.visualViewport is not supported.` | The omp bundle's own strings. Bytes, not a claim (same class as r70 row 1). |

Neither is contested scope. Both are the same false-positive class the next scan should skip:
a page's JavaScript mentioning `visualViewport` is not a page-scale measurement.

## 3. `pinch` hits — one semantic mention, and it defers to tabi

| lane | path:line @ head | quote (≤25 words) | relation |
|---|---|---|---|
| kake | `corpus/knowledge/accessibility-review-cards.json:416` @ dd7a146d | `Preparation only: kake inventories the scope and requests a separately operator-authorized evaluator; tabi owns authorized browser/assistive-technology execution` | **Deferential, not contested.** The card is WCAG 2.5.1 (multipoint gestures); `:418` gives the example `its map widget zooms only by two-finger pinch`. kake explicitly refuses to evaluate and names tabi as the executor. It is a *page-content* review prompt, not CDP synthesis. |
| kaidoku | `.ufo/waves/round-41/w1/R41RevBudget.md:193` @ 0b518f56 | `So the --fsize pinch only appears when a caller sets --max-output-bytes absurdly low` | Word-sense collision ("pinch" = squeeze a limit). Not the gesture. |
| mori / game-dev-3d | `.ufo/reports/round-63/mori.md:42`; `reports/round-104/math-audit.md:12` | `evidence/selftests-pincheck-before-v6-r63.txt` | Substring of `pincheck`. Not the gesture. |

Boundary note for the integrator: kake's card is the fleet's only statement about pinch as a
*page semantics* class. If tabi's C1 knowledge entry says anything about pinch gestures on pages
(not just CDP delivery), it must not read as a WCAG 2.5.1 evaluation — that card is kake's
preparation surface and tabi executes only on operator request.

## 4. C2 pattern — components already held fleet-wide (reported, not absorbed)

Grouped by which C2 leg they touch. None is contested scope: tabi's PROVINCE owns browser
surfaces and CDP discipline; these are non-browser lane instruments. The one row that touches a
*province* is tameshi's (row 17).

### 4a. (E) allow-listed child env / loader refusal

| # | lane | path:line @ head | quote (≤25 words) | relation |
|---|---|---|---|---|
| 1 | kumitate | `scripts/gate-mutants.mjs:108-114` @ 2f8475cd | `function sandboxEnv(tempRoot) { return { PATH: '/usr/bin:/bin', HOME: join(tempRoot,'home'), TMPDIR: tempRoot, LANG: 'C.UTF-8', TZ: 'UTC' }` | **Closest single analogue to C2 (E).** An explicit five-key allowlist, no `process.env` spread. |
| 2 | kumitate | `scripts/cap-run.mjs:189` @ 2f8475cd | `const setenv = ['--clearenv', '--setenv', 'PATH', binDir === '/usr/bin' ? '/usr/bin' : ...]` | Stronger form: bwrap `--clearenv` + `--setenv`, `env -i` parent (`:32-38`). |
| 3 | kumitate | `SKILL.md:617` @ 2f8475cd | `each copy's --selftest run detached in its own process group under prlimit ... and an allowlisted envir…` | The **claim row** (contract `kumitate-gate-mutants-v2`): "no inherited `KUMITATE_*`, `GIT_*` or `NODE_OPTIONS`". |
| 4 | kumitate | `.ufo/waves/round-42/build/CritManifestDesign.md:7` | `build the child environment from an allowlist instead of a denylist ... nothing from GIT_*, NODE_OPTIONS, UFO_*` | The design argument for allowlist-over-denylist, already recorded in r42. |
| 5 | kumitate | `.ufo/waves/round-51/w2/RevA51Rerun.md:132` | `NODE_OPTIONS='--require /tmp/a51pre.cjs' ... A preload could forge the verdict outright.` | **The exact r70 attack A**, found and reported by a sibling three rounds earlier. |
| 6 | chousa | `tools/research-gate.sh:4271` @ 408ae68f | `-u LD_PRELOAD -u LD_LIBRARY_PATH \ PATH="$CAP_CHILD_PATH"` | Denylist scrub + fixed child PATH for the captured child (r38 Erratum-1 class). |
| 7 | kama | `tools/round64-c1-counter.py:16-17` @ 8f8211a2 | `its initial environment holds only the counter's own PATH/HOME/LANG/LC_ALL values` | Env *binding* (the counter grades the held process's env), not just scrubbing. |
| 8 | mado | `.ufo/waves/round-47/w2/SentC1Tripwire.md:167` @ 5041acf9 | `env is exactly HOME,LANG,PATH,PWD,TMPDIR; no LD_PRELOAD reachable` | Measured `--clearenv` result. |
| 9 | mado | `.ufo/waves/round-76/w1/R76Sentinel.md:11-15` @ 5041acf9 | `git_env() copies every caller variable except names starting GIT_ ... LD_PRELOAD reaches the dynamic loader of git` | A sibling verifier with **exactly the defect tabi's r70 critic found**, plus the remediation tabi is now implementing: `use the C1 explicit child-environment allowlist`. |

### 4b. (S) private snapshot of pinned bytes / re-hash

| # | lane | path:line @ head | quote (≤25 words) | relation |
|---|---|---|---|---|
| 10 | kumitate | `scripts/gate-mutants.mjs:743` @ 2f8475cd | `gitRun(repo, ['ls-tree','-r','-z','--full-tree', resolved, '--', 'scripts'], ...)` | Pinned-rev byte extraction; `:737` writes each copy `{ flag: 'wx', mode }`, `:631/:635` dirs `0o700`. |
| 11 | kumitate | `scripts/gate-mutants.mjs:59-60` @ 2f8475cd | `dirStat.uid !== process.getuid() \|\| (dirStat.mode & 0o777) !== 0o700 \|\| realpathSync(dir) !== dir` | The **private-snapshot precondition** (owner, mode, realpath) plus a stale-dir sweep with an owner marker (`:73-98`, marker `pid=… start=…`). |
| 12 | kama | `tools/round54-replay-code-audit.py:64-69` @ 8f8211a2 | `the two snapshots must be byte-identical ... every observed archive path is re-stat'ed and re-hashed` | Two-pass observation + post-exec re-hash; the strongest sibling statement of "executed bytes are re-checked after the run". |
| 13 | kasegi | `.ufo/waves/round-67/w1/ExecMultiHeadDriver.md:13-15` @ b9589300 | `Pin manifest (authored): .ufo/waves/round-67/controls/driver-pins.json — file sha256 ... canonical pins_sha256 printed by both runs` | Driver + counter + probes pinned by content, printed by both runs. |
| 14 | mori | `.ufo/waves/round-23/falsify/RerunPinnedDriver.md:25` @ 7765969c | `driver sha256 5c12fdc0…, identical to the sealed copy at 22772c10… (C13.driver_matches_sealed_bytes = pass)` | Sealed-copy comparison before a single re-run. |

### 4c. same-user TOCTOU

| # | lane | path:line @ head | quote (≤25 words) | relation |
|---|---|---|---|---|
| 15 | souji | `SCORECARD.md:1579` @ 2ec8b63d | `the writer publishes with link(2) instead of os.replace after an existence check (TOCTOU clobber)` | Atomic publish against a check-then-use race. |
| 16 | kengaku | `.ufo/waves/round-63/w1/attack/security.md:120` @ 34b28c47 | `TOCTOU on 127.0.0.1:8080 lets a foreign wheel execute inside the probe's sandbox` | **Direct analogue of tabi's r70 §4e port-draw gap**: check port free, then bind. Medium, documented not patched. |

### 4d. the province claim on the method

| # | lane | path:line @ head | quote (≤25 words) | relation |
|---|---|---|---|---|
| 17 | tameshi | `PROVINCE.md:3-5` @ 0e5a39ed | `verification-fixture craft — the reusable method of honest checks: hermetic suites, mutation testing, fail-closed arms` | tameshi **owns the reusable method**; its admission rule is "a pattern is admitted from evidence in TWO independent lanes". kumitate (rows 1-5) and mado (rows 8-9) already satisfy that. tabi's C2 is an application of held method to its own verifier. |

## 5. r70 carry-over — kama

**kama still holds no browser-input surface.** `kama-shokunin/PROVINCE.md` (441 lines, read in
full) is model-serving only; its single browser mention is `SKILL.md:274`
(`9222 is Chrome`) inside a *listener fingerprint* example. No `Input.*`, no CDP session, no
page surface. So:

- C1: kama `none` — unchanged, and the pinch surface is absent there like everywhere else.
- r70's recommended relabel (`none → adjacent`) stands on the **listener class** only
  (`corpus/knowledge/listener-census.md:56`, the `:9222` row and the ephemeral `omp` band).
- This round adds a **second, independent adjacency ground**: kama's replay counters (rows 7,
  12) are verifier-method prior art for tabi's C2. Still `adjacent`, still not `contested` —
  kama's object is endpoint health, tabi's is a browser verifier.

## 6. Heads at scan time (2026-11-06)

```
audio f9da7ee9  chousa 408ae68f  game-dev-2d 1e033ef0  game-dev-3d 39ca3973
kagi a74ae538   kaidoku 0b518f56 kake dd7a146d       kama 8f8211a2
kasegi b9589300 kengaku 34b28c47 kotoba 0344ddae     kotodama 5fa04a9b
kumitate 2f8475cd lore 0f044aa7  mado 5041acf9       mori 7765969c
revenger 654d0929 souji 2ec8b63d tameshi 0e5a39ed    tsukuroi b96dc4be
tabi 244505a0 (base 11b00f64; freeze 749a1ab5)
```

Nine lanes moved since the r69 snapshot (chousa, kagi, kama, kasegi, kumitate, mado, souji,
tameshi, tsukuroi) and kept moving during the r70 scan. Any round-71 matrix must be bound to a
single-pass re-snapshot, never to heads read at different moments.

## 7. Contradictions (stated, not smoothed)

1. **C2 novelty vs tameshi's province.** tabi's r69 matrix already says "the reusable fixture and
   mutation method is tameshi's" (`PROVINCE.md`, tameshi row), and tameshi's PROVINCE:3-5 claims
   exactly that. Rows 1-9 show the components exist in three lanes. A C2 knowledge entry phrased
   as a *new method* would cross a boundary tabi itself drew; phrased as "this verifier's
   application of the fleet's held method", it is accurate. The r69 label `adjacent` needs no
   change — but the entry's wording does.
2. **r70 §4d needs a qualifier.** "tabi's C2 combination is not present in any sibling" is true of
   the *combination* (env refusal + snapshot + 6 s floor + stdout binding) and false of the
   *structure*: kumitate rows 1-3 + 10-11 are the same shape over a non-browser substrate.
3. **kumitate's relation label is two-dimensional.** The r69 row `contested` is about the
   kimi-webbridge plugin inside `~/.kimi-code/`; rows 1-5 are a different, uncontested
   instrument-level adjacency. One label cannot carry both; the integrator should keep
   `contested` and cite the substrate line, not these rows.
4. **kama's `none` is contradicted twice.** r70 already reported the listener ground; this round
   adds the verifier-method ground. The label should read `adjacent` (r70's recommendation) with
   both grounds named.

## 8. Risks of this report

- **The C1 zero is scanned, not proven.** `gitignore:false` was used, but `node_modules`,
  `vendor`, `r94vendor`, `.git`, `.jj` were excluded. A sibling could vendor a CDP client without
  a claim — kotoba's strings dump shows the fleet's own omp bundle already has
  `Input.dispatchMouseEvent` (`:6636` r44, `:7403` r82). Bytes in a binary are not a claim.
- **Row 17 is a province judgment, not a fact.** tameshi's "two independent lanes" rule is its own
  text; whether kumitate + mado satisfy it is tameshi's call, not this seat's.
- **The kumitate parent-dir check is stricter than tabi can adopt verbatim.** See §9.
- **Sibling heads drift mid-scan** (§6); a row copied into a matrix without its head fails the
  gate for the wrong reason.

## 9. One bounded proposal

**Move (report-level only; no production, no frozen instrument touched):**

1. In the C2 knowledge entry, state provenance explicitly — kumitate `gate-mutants.mjs:108`
   (allowlist), `:743`/`:737` (pinned-rev snapshot), `:59-60` (owner/mode/realpath precondition),
   chousa `research-gate.sh:4271` (loader scrub), kama `round54-replay-code-audit.py:64-69`
   (re-hash after exec), mado `R76Sentinel.md:11-15` (the same defect, with the same remedy) —
   and scope the claim to *this verifier*, not to a new method (tameshi holds the method).
2. Route one hardening to r72 (not to r71's frozen instrument): `verify-live-r71.mjs:144`
   (`fs.mkdirSync(scratch, { recursive: true })`) validates nothing about the caller-supplied
   scratch parent. `mkdtempSync` (`:145`) already defeats a pre-created directory, and
   `flag:'wx'` + `0o500` (`:149-150`) defeat a pre-created file, but a group/other-**writable**
   parent lets a foreign process rename `snap-XXXXXX` between the last `snapCheck` and
   `spawnSync`. kumitate's answer is `gate-mutants.mjs:74-80` (uid + mode + realpath on the
   parent before `mkdtemp`).

**Second-order effect that must not be missed:** kumitate's predicate is
`(baseStat.mode & 0o077) !== 0` — group/other *accessible*, not just writable. Copied verbatim it
would refuse tabi's own scratch root: `/fast/scratch/hyaku` is `mode=755 uid=1000`. The correct
predicate for a caller-supplied scratch is `(mode & 0o022) === 0` (refuse only group/other
**write**), plus `realpath` stability. Measured, not assumed:

```
$ stat -c '%n mode=%a uid=%u' /fast/scratch /fast/scratch/hyaku
/fast/scratch mode=755 uid=1000
/fast/scratch/hyaku mode=755 uid=1000
```

**Axes affected:** adjacency (provenance accuracy, no overclaim across tameshi's boundary);
C2 operability (a named, checkable gap with a sibling-tested remedy). **Harmed:** none — no
frozen predicate, counter, pin or kill rule is amended; the hardening is routed to r72.

**Risks of the move:** (a) if applied to r71's verifier after the freeze it changes the
instrument — route it, do not apply it; (b) a `0o022` check still admits a same-user attacker
(same-user tampering is the declared r70 threat model and is not closable in-process); (c) the
provenance disclosure could be read as diminishing C2 — it does not: the *combination* remains
tabi-only (r70 §4d), only the components are shared.

**Verification the integrator can run:**

```
# C1 absence with positive control
grep -rIl --exclude-dir=node_modules -e synthesizePinchGesture \
  /home/vgpnk/Projects/shokunin | grep -v '/tabi-shokunin/' | wc -l     # 0
grep -c synthesizePinchGesture /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-synthpinch-round71.mjs  # 5

# any row's quote at its head
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 2f8475cd:scripts/gate-mutants.mjs | sed -n '108,114p'
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 2f8475cd:scripts/gate-mutants.mjs | sed -n '59,60p'
git -C /home/vgpnk/Projects/shokunin/chousa-shokunin show 408ae68f:tools/research-gate.sh | sed -n '4271,4272p'
git -C /home/vgpnk/Projects/shokunin/kama-shokunin show 8f8211a2:tools/round54-replay-code-audit.py | sed -n '64,69p'
git -C /home/vgpnk/Projects/shokunin/mado-shokunin show 5041acf9:.ufo/waves/round-76/w1/R76Sentinel.md | sed -n '11,15p'
git -C /home/vgpnk/Projects/shokunin/kengaku-shokunin show 34b28c47:.ufo/waves/round-63/w1/attack/security.md | sed -n '120p'
git -C /home/vgpnk/Projects/shokunin/tameshi-shokunin show 0e5a39ed:PROVINCE.md | sed -n '3,5p'

# the parent-check measurement behind §9
stat -c '%n mode=%a uid=%u' /fast/scratch /fast/scratch/hyaku
grep -n 'mkdirSync(scratch' /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/verify-live-r71.mjs  # :144
```

## 10. Tooling and scratch

No installs, no upgrades, no pacman transactions. No scratch directory was created by this seat;
`/fast/scratch/hyaku/tabi-r71/` belongs to other seats and was neither created nor deleted here.
