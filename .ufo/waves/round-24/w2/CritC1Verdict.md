# CritC1Verdict — attack on C1's verdict (3 → 0 nonconformant gates)

Seat: `L1Tabi24.CritC1Verdict`. Read-only. Lane tip attacked: `ad125e85c235e1c4ec6a08e398bd64da01f68a08`; baseline `573c99e4885382db38babc3a6fc90e77afeb42a6`. `TMPDIR=/home/vgpnk/tmp-tabi24` exported for every node run (`/tmp` is full). Throwaway fixtures live under `.ufo/waves/round-24/scratch/CritC1Verdict/` (`fx1`, `fx2`, `fx3`, `mut.mjs`, `mut-wholerepo.mjs`).

## Reproduction of the counted numbers

`node scripts/check-gate-registry.mjs --rev 573c99e… --json` → `gates=12 nonconformant=3` exit 1; the three e1 gates are `check-adjacency`, `check-measurement-binding`, `round-evidence-audit`. Same as `corpus/evidence/round-24/c1-measurements.json` before.

`node scripts/check-gate-registry.mjs --rev ad125e8… --json` → `gates=14 nonconformant=0` exit 0. The committed receipt (`corpus/evidence/round-24/c1-tip.json`) pins the older rev `b973fde`; re-run at the true tip still gives 0.

`--selftest` → `cases=22 passed=22` exit 0.

## F1 — measured universe is a strict subset of the lane's declared gate set (strongest objection)

The instrument derives the gate set as `scripts/` basenames matching `check-*`/`*audit*` UNION scripts named by parsed gate-kind rows (`check-gate-registry.mjs:252-265`). Parsing a row requires `kindOf()` (`:164-168`) — first header cell matching `/kind/i` — to yield a cell starting `^(gate|probe)\b` (`:172`).

The lane's own round-19 (`SKILL.md:2098-2102`) and round-20 (`:2244`) registry tables use the combined header `| Name / kind | … |`, so `kindOf` returns e.g. `writer isolation / gate` — which never starts with `gate`/`probe`, so **the whole row is dropped**. These tables therefore contribute neither rows nor gates.

`grep -n "check-isolation\|check-wave" SKILL.md` shows both registered with `/ gate` kind cells (`:2101`, `:2244`), and `check-wave.mjs` declares a "Canonical frozen gate mode" in its own header. Neither appears in the counted 14.

Grounded mutation (throwaway copy `scratch/CritC1Verdict/mut.mjs`, two-line change: accept a trailing `/ (gate|probe)` kind cell and split a `name / kind` cell):

- baseline: rows 12→28 parsed, gates 12→17, nonconformant 3→5
- tip: rows 23→39 parsed, gates 14→19, nonconformant 0→2

At tip the two residuals are `download binding counter` (`.ufo/waves/round-19/measure-c2.mjs`, missing `verdictMap`) and `routed correction counter` (`measure-c3.mjs`, missing `verdictMap|pinned`). **But** `SKILL.md:2128` ("Registry correction — supersedes :2098-2102 …") explicitly re-kinds C1/C2/C3 as "measurement probes, not all-or-nothing admission gates" — so those two flags are explained by a supersession the parser cannot apply: it drops the *whole table* instead of reading the corrected kind. What the mutation does expose as non-ambiguous: `writer isolation` (`check-isolation.mjs`, gate map declared "unchanged" at `:2133`) and `wave-1 provenance metadata` (`check-wave.mjs`) evaluate **conformant on all eight fields** under the broadened parser, yet are outside the measured universe at both revisions.

Consequence for the verdict: `nonconformant=0` is true of the *measured* set but that set is derived by a parser that cannot read two of the lane's own table shapes; the round-24 section's own sentence "This block restates the lane's **whole gate set**" (`SKILL.md:2462`) is false — it omits `check-isolation` and `check-wave`. The 0 stands by luck of those two rows' wording, not by verification.

## F2 — a conformant row can be true of nothing (runnability, entry, pinned unchecked)

Fixture `fx1` (committed git repo; `check-one.mjs` = `this is not javascript at all`, pinned cells `corpus/evidence/round-24/absent.json` / `absent2.json`, entry `node scripts/check-one.mjs --bogus-flag`):

`node scripts/check-gate-registry.mjs --repo …/fx1 --rev 945b3eb… --json` → `nonconformant=0 clean=true`; `node --check` on the gate script → `SyntaxError`. So a row scores conformant while its gate cannot parse, its entry flag is invented, and its pinned path does not exist. Nothing in `missingFields` (`:224-235`) resolves a path or requires `entry`/`selftest` to name the gate's script: `entry` needs only `length ≥ 8`, `selftest` only the literal `--self-test`, `pinned` only length 8 plus a `/`, `.` or hex run, `name` only a 3+ char string.

`fx3` sharpens it: a row whose entry is literally `totally unrelated invocation; 0 clean, 1 failed, 2 could-not-evaluate` (the verdict map smuggled inside the entry cell) and whose selftest names a *different* script passes `check-a` as conformant. (Its phantom second gate correctly trips e3 — the fail-closed half works.)

So "does the gate count a gate whose row exists but whose script cannot run?" — no. "Can the target be reached by rows true of nothing?" — yes, verbatim. The metric is row *shape*, not operability; under the `operability` axis heading that is an over-attribution the canonical judge should weigh.

## F3 — duplicate authority: one row vouches for N gates; the name field binds nothing

Fixture `fx2`: a single row naming `check-a`, `check-b`, `check-c` in its entry cell → all three gates reported conformant off `row=5`. `owned` matching (`:271`) is by `r.name === gate.name || scriptsInRow(r).includes(script)`, so any field-complete row that merely mentions a script confers conformance on it.

Real instance at tip: five of ten `scripts/` gates are made conformant by round-24 rows whose **name** cell is not the gate (`closeout-pin-witness`→`check-freshness` row 2469; `sources-census`→`check-sources` 2470; `historical-pstack-contract`→`check-round-contract` 2472; `historical-user-contract`→`check-user-round-contract` 2473; `aria-historical-metadata`→`check-aria-metadata` 2474). The `name` predicate accepts any string, so the "name" of the row is satisfied by an alias — the PROTOCOL field "name" is present in form, bound to nothing in fact. If `check-freshness`'s own row vanished, `closeout-pin-witness` would still vouch.

## F4 — baseline 3 is not a parser artifact in magnitude, but its provenance is overstated

Each e1 is genuinely defensible: at 573c99e `check-adjacency`/`check-measurement-binding` have only the round-17 four-column rows (`SKILL.md@573c99e:1939-1940`) — no `Kind` column, no class words in the verdict map, no owner/scope columns — and `round-evidence-audit` has *no* row (`git show 573c99e:SKILL.md | grep -n round-evidence-audit` → nothing). So 3 stands.

But the finding's `missing` array lists all eight fields including `entry`, `verdictMap`, `selftest`, `pinned`, `scope`, `owner` — fields the kind-less rows *do* carry in substance. The instrument cannot distinguish "no row" from "row in a foreign shape": both collapse to e1 with all-eight missing. Count right, diagnosis false. Under F1's broadened parser the baseline would have been 5, not 3 — the delta 3→0 is symmetric, but both endpoints are conditioned on the same blind spot.

## F5 — verdict-map predicate is narrower than the standard (over-count direction)

`missingFields` requires literal `0…clean`, `1…(failed|findings|finding|red|semantic failed)`, `2…could-not-evaluate` (`:226-228`). A lawful code→class map like `0 evaluated, 1 failed, 2 could-not-evaluate` (round-19 row 2099) scores `verdictMap` missing. This direction inflates nonconformance, so it does not rescue the 0 — it means some of the *counted* field checks fire on diction, not on the eight-field standard. The killRule (red-on-mutant / green-on-canonical) is satisfied, but only over the canonical 8-column shape; the selftest's "legacy" shape (`LEGACY`, `Kind / owner`) is still not the lane's round-19/20 `Name / kind` shape — no case exercises the exact shape that blinds production.

## F6 — minor: instrument docstring vs. measured reality

Header comment (`scripts/check-gate-registry.mjs:8`) says "15 isolated cases"; `--selftest` reports `cases=22` (20 `CASES` + 2 refusal cases). The committed row (`SKILL.md:2478`) correctly says `cases=22, passed=22`, so the registry cell is true and the file's own header is stale. Out of C2's m1 scope (it scans SCORECARD/SHONEN, not script headers), so nothing currently counts it.

## Context note (not a defect)

`node scripts/check-adjacency.mjs --self-test` → `verdict=failed` on one case (`git-failed` produced `map_unreadable` instead of `git_failed`). This is environmental: the fixture's "plain dir" must sit outside every git repo, but `TMPDIR=/home/vgpnk/tmp-tabi24` lives inside a dotfiles repo (`git -C /home/vgpnk rev-parse --show-toplevel` → `/home/vgpnk`). Without the TMPDIR override the selftest cannot run at all (`/tmp` is 100% full → could-not-evaluate). Worth noting because it shows the conformance metric is blind to a gate whose selftest is red — exactly the gap F2 formalizes.

## Strongest surviving objection

**C1's `nonconformant=0` is a true statement only over an instrument-defined universe that demonstrably excludes two of the lane's declared gates (`check-isolation`, `check-wave`), and the field checks that produce it verify textual shape, never the thing named — entry commands, selftest targets, pinned paths, and the row's own name can all be fabricated and still score conformant.** The delta 3→0 survives as a count, but it is evidence for "registry-row shape completeness over convention scripts," not for the claim's operational framing and not for the block's "whole gate set" wording.

## Evidence that would settle it

1. Parse the lane's combined `Name / kind` tables (mut.mjs is a 2-line sketch) and re-score `ad125e8`: if `check-isolation`/`check-wave` join the set conformant and `measure-c2/c3` join as superseded-probe rows (kind `probe` after applying the :2128 correction), the residual count is a documented scope decision, not 0-by-blindness. A committed supersession/retirement declaration for the round-19/20 gate rows would be equivalent evidence.
2. A field-predicate addition that resolves paths/invocations at `<rev>` (e.g., entry/selftest must name the gate's script; `node --check`-equivalent parseability; pinned path must `cat-file -e`) — then re-run fixtures `fx1`/`fx2`/`fx3` and the lane tip.

Smallest safe correction: restate `SKILL.md:2462`'s "whole gate set" to "all convention-named lane gates" **or** append rows for the two out-of-tree gates; add a `Name / kind` selftest case to CASES; tighten the name/entry/pinned predicates per (2). Do not touch the counted contract until the L1 judges whether the instrument or the prose is the bug.
