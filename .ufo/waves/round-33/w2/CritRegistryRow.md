# CritRegistryRow — round 33 / w2 — SKILL.md bidi-runtime registry row vs gate v2

**Attack target:** the round-33 registry row `| bidi-runtime | gate | … |` at `SKILL.md:2817`, read at `042d6d9abf97d567d495652a85eabc851b81adc1`, against `scripts/check-bidi-runtime.mjs` v2 at the same revision.

## Verdict

**defect — medium.** `node scripts/check-gate-registry.mjs --rev 042d6d9a…` exits 0 (`nonconformant=0`) and `node scripts/check-selfassessment.mjs --rev 042d6d9a… --json` reports `mismatches 0`, but the registry counter is presence-only (it tests that the row *contains* a `0=clean`, a `1=failed`, a `2=could-not-evaluate`, a `--selftest` token, a path-like pinned cell and a scope keyword — `scripts/check-gate-registry.mjs:219-235`), so its clean verdict is **not** evidence that the row's fields match the code. Compared field by field, three of the row's cells are wrong or incomplete against v2: (1) **write scope** — the row says the live leg runs "under a throwaway profile in a short TMPDIR" and never names the throwaway `HOME` / `XDG_CONFIG_HOME` / `XDG_CACHE_HOME` dirs the round-33 S1 fix creates, nor the `$XDG_RUNTIME_DIR` location the browser's TMPDIR is actually created in whenever the caller's TMPDIR exceeds 60 bytes (`scripts/check-bidi-runtime.mjs:592`); I demonstrated both live (receipt below); (2) **`0=clean` predicate** — the row states `population>=1, every measured row admitted`, while the code computes `!entryFinding && population>=1 && admitted>=1 && failing===0` (`:863`) and the gate's own frozen case `v2-m19-unmeasured-row-counted` exits **0** with `population=17, admitted=16` (`:1012`, PASS in the self-test run), i.e. a measured (`no`) row that is never admitted; (3) **verdict map** — the gate exits **3** on a self-test disagreement (`:1157`) and the row declares only 0/1/2, and the row's exit-2 list omits the v2 live refusals that now return 2 instead of launching unsandboxed (sandbox unavailable `:580`, no short dir for the singleton socket `:593`, new session failed `:619`, caught at `:1163-1164`). The **entry command, the 44/44 tally, the pinned paths and the round-33 corrections line all hold** — the 27-tally is genuinely cleared (see "holds" below). No host or lane harm: the gate removes every dir it creates and never opens the operator's home; the defect is in the declared boundary, not in observed damage.

## Holds (verified, not inferred)

- **Entry command** — row cell is `node scripts/check-bidi-runtime.mjs --rev REV --baseline REV --entry corpus/knowledge/X.md [--receipt PATH] [--live] [--json]`; `main()`'s usage string at `:1149` and the header usage block `:121-124` are identical.
- **Self-test tally 44** — `node scripts/check-bidi-runtime.mjs --selftest` → exit **0**, last line `BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44` (`…/CritRegistryRow/bidi-selftest.txt`). The corrections arithmetic at `SKILL.md:2893-2898` checks out against the case ids in that run: 27 + 8 (F1–F8) + 9 (M04, M06, M09, M10, M11, M14, M17, M18, M19) = 44.
- **x3 / x4 prose** — row's "a duplicate row id" and "a Measured cell that is not `yes` or `no`" match the stable ids `x3-duplicate-id` / `x4-measured-cell` (`:78-79`), and both appear in the self-test as `v2-f2` (reason `x3-duplicate-id`) and `v2-f7` (reason `x4-measured-cell`).
- **Pinned paths exist** — `git cat-file -e 042d6d9a…:corpus/knowledge/bidi-runtime-gate-v2-round-33.md` succeeds; `corpus/evidence/round-32/bidi/{receipt.json,run1/transcript.jsonl,run2/transcript.jsonl}` are in the tree; the named constants exist (`DRIVER_ALLOW` at `:144`, `FIXTURE`/`ROWS`/`PREDICATES`/`CASES` throughout). The gate blob at the revision digests to `62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75`, byte-identical to the digest the measured receipt records (`.ufo/waves/round-33/measure/provenance-bf48b81.txt`, `sha256 scripts/check-bidi-runtime.mjs`), so the row describes the measured bytes.
- **Corrections line clears the stale 27** — `node scripts/check-selfassessment.mjs --rev 042d6d9a… --json` → exit **0**, `mismatches 0` (`…/CritRegistryRow/selfassessment.json`). The 27 claims are `superseded:true` at `SKILL.md:2626` and `SCORECARD.md:1657`; `SKILL.md:2893-2898` cites `SKILL.md:2626` by line and figure, and `SCORECARD.md:1784`/`:1805` carry the document-local correction, which is the lane's stated convention ("each cites the stale line in its own document", `SKILL.md:2892`). The wrapped continuation at `SKILL.md:2895` is `couldNotEvaluate: ambiguous script association`, not a mismatch, so the counter is not cleared by a suppressed finding.
- **No `--no-sandbox`, real binary, launcher bypassed** — the row's scope claims are true: launch args are `--headless=new --no-first-run --disable-gpu --user-data-dir=<scratch>/profile` with `binary: /usr/lib/chromium/chromium` (`:610-612`); `--no-sandbox` appears only in the refusal comment `:559`; `sandboxStatus` refuses rather than relaunch unsandboxed (`:580`, `:618`).

## Defects

### D1 (medium) — write scope omits the throwaway HOME/XDG dirs and the `$XDG_RUNTIME_DIR` fallback

Row text (`SKILL.md:2817`, scope cell): "stdout/stderr only; production reads committed git blobs; `--live` starts chromedriver and headless chromium from the real binary under a throwaway profile in a short TMPDIR, 127.0.0.1 fixtures only, no `--no-sandbox`, launcher flags file bypassed".

Code, same revision:

- `:592` — `else if (runtime && runtime.length <= 40) { chromeTmp = mkdtempSync(join(runtime, "tabi-bidi-")); ownChromeTmp = true; }` — when the caller's `tmpdir()` is longer than 60 bytes, the browser's TMPDIR is created under **`$XDG_RUNTIME_DIR`**, a directory the row never names and that lies outside the TMPDIR the row declares.
- `:596-598` — `const home = join(scratch, "home"); mkdirSync(join(home, ".config"), …); mkdirSync(join(home, ".cache"), …)` and `:601` — chromedriver is spawned with `HOME`, `XDG_CONFIG_HOME`, `XDG_CACHE_HOME` pointed at those throwaway dirs. This is exactly the round-33 S1 fix ("chromium opens `$HOME/.pki/nssdb` and `$XDG_CONFIG_HOME/chromium`", `:594-595`), and the code's own header declares it (`:19-31`: "with a throwaway profile, HOME and XDG config/cache dirs under TMPDIR"). The registry row — the lane's declared write boundary — does not.

Live demonstration (fake `chromedriver`/`chromium` in scratch, TMPDIR = an 82-byte dir, `XDG_RUNTIME_DIR=/tmp/tabi-r33-rt`; `liveRecord()` called through the module's export, so the real code path runs; the fake driver records the env it was handed):

```
$ PATH=$S/bin:$PATH TMPDIR=<82-byte dir> XDG_RUNTIME_DIR=/tmp/tabi-r33-rt RECEIPT=$S/receipt.txt \
  node -e 'import("./scripts/check-bidi-runtime.mjs").then(async m => { await m.liveRecord({chromedriver:"chromedriver", chromium:"$S/bin/chromium", timeoutMs:5000}) })'
REFUSAL_OR_FAIL: Refusal | new session failed: null (chromium TMPDIR 33 bytes)
$ cat $S/receipt.txt
HOME=<scratch>/tabi-bidi-live-GHk76o/home
TMPDIR=/tmp/tabi-r33-rt/tabi-bidi-FLgSWj
XDG_CONFIG_HOME=<scratch>/tabi-bidi-live-GHk76o/home/.config
XDG_CACHE_HOME=<scratch>/tabi-bidi-live-GHk76o/home/.cache
$ ls -A /tmp/tabi-r33-rt ; ls -A <82-byte dir>      # both empty: cleanup at :703-704 removed them
```

Receipt kept at `.ufo/waves/round-33/w2/CritRegistryRow/live-leg-env-receipt.txt`. Reading: the browser's TMPDIR is **not** under the caller's TMPDIR (it is under `$XDG_RUNTIME_DIR`), and four dirs (`home`, `.config`, `.cache`, profile) are created that the row's scope cell never declares. A reviewer auditing writes from the registry row alone would miss `/run/user/<uid>` and would not know `HOME` is redirected.

Smallest safe correction: replace the scope cell's `--live` clause with the code header's wording — "`--live` starts chromedriver and headless chromium from `/usr/lib/chromium/chromium` with a throwaway profile plus throwaway `HOME`/`XDG_CONFIG_HOME`/`XDG_CACHE_HOME` under a scratch dir in TMPDIR, and a short chromium TMPDIR taken from that scratch dir or else from a fresh dir under `$XDG_RUNTIME_DIR` (refuses, exit 2, when neither is short enough); removes only the dirs it created".

### D2 (low) — the `0=clean` predicate as written contradicts the gate's own frozen case

Row: `0=clean (population>=1, every measured row admitted)`. Code: `out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 1 && out.failing === 0` (`:863`), and the code defines a `no` row as part of the population ("counted in the population and reported as unmeasured, never as admitted", `:42`, `:861`). The gate's frozen case `v2-m19-unmeasured-row-counted` (`:1012`, `exit: 0, admitted: 16, population: 17`) passed in my run:

```
CASE id=v2-m19-unmeasured-row-counted expected_exit=0 exit=0 expected_admitted=16 admitted=16 expected_population=17 population=17 PASS
```

That is a clean run with a measured row that is **not** admitted, which the row's parenthetical forbids. Read the other way ("measured" = `Measured: yes` only), the row's predicate becomes vacuously true for an all-`no` population while the code exits 1 (`admitted >= 1`), so neither reading is the computed predicate. Correction: state the code's predicate — "population>=1, at least one row admitted, no row finding; `no` rows are counted in the population, reported unmeasured, never admitted, never a finding".

### D3 (low) — verdict map omits exit 3 (self-test disagreement)

`:1157` — `process.exit(out.ok ? 0 : 3);`. The row declares only `0=clean / 1=failed / 2=could-not-evaluate`, and the code header repeats "Any other nonzero code is undeclared and reads as could-not-evaluate" (`:9`) — a statement the code contradicts. Lane precedent declares it where it exists (`SKILL.md:2477`, `:2478`, `:2479`, `:2627`: "3=self-test disagreement"), so this row is the outlier; note `check-decision-table`'s row (`SKILL.md:2575`) shares the omission (`scripts/check-decision-table.mjs:460`), so it is a lane-wide gap, not a v2 regression.

### D4 (low) — exit-2 cause list omits the v2 live refusals

Row exit-2 cell: "(usage, unresolvable revision, registry absent, `--live` without chromedriver or chromium)". Reachable exit-2 causes in v2 that are unlisted: `chromium sandbox unavailable … refusing to launch the live leg unsandboxed` (`:580`), `no short directory for chromium's singleton socket …` (`:593`), `new session failed` (`:619`), `websocket open failed` (`:624`), `no browsing context` (`:656`) — all `Refusal`s caught at `:1163-1164` and mapped to exit 2. These are the refusals S128/S129 exist to justify, and the row's map is the only place a registry reader learns their class.

## Observations (not scored as defects)

- The **code header is the wrong side** of one line: `:8` says exit 2 covers "registry **or lessons** absent", but there is no lessons refusal — `gateRows()` returns an empty map when `corpus/lessons` is unreadable (`:513-514`), which instead fails `s1-source-row` at exit 1. The registry row ("registry absent") is correct here and the header overstates; worth a header correction, not a row one.
- The pinned cell cites "`.ufo/waves/round-33/claims.json` C2 frozenDigests", but round-33 `frozenDigests` is top-level and carries no digest of `scripts/check-bidi-runtime.mjs` (keys: the two counters, `controls.mjs`, `measure.sh`, `check-adjacency`), whereas round-32's block did contain the v1 gate. The gate's bytes are pinned instead in `.ufo/waves/round-33/measure/provenance-bf48b81.txt` (matching digest `62453b55…ac75`), so nothing is unpinned — the citation just names the battery's block, not the gate's.
- `check-gate-registry` cannot see any of D1–D4 by construction (`missingFields`, `:219-235`: token presence and length only), so a clean registry verdict and a clean selfassessment count are not evidence against this report; the registry row must be read against the code.

## Commands run (exit codes)

| command | exit |
|---|---|
| `node scripts/check-gate-registry.mjs --rev 042d6d9abf97d567d495652a85eabc851b81adc1` | 0 — `rows=41 gates=22 nonconformant=0 findings=0` |
| `node scripts/check-bidi-runtime.mjs --selftest` | 0 — `BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44` |
| `node scripts/check-selfassessment.mjs --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --json` | 0 — `mismatches 0` |
| `git show 042d6d9a…:scripts/check-bidi-runtime.mjs \| sha256sum` | 0 — `62453b55…ac75`, equal to `provenance-bf48b81.txt` |
| live-leg env demo (above) | 0 — `Refusal: new session failed: null`; dirs removed |

All runs in the scratch clone `/fast/scratch/hyaku/tabi-r33/CritRegistryRow/clone` detached at `042d6d9a…` (verified `git rev-parse HEAD`); TMPDIR under scratch. No browser was started (`pgrep -fa 'chromedriver|chromium'` shows only the host's `earlyoom` line, no process of mine); scratch tree deleted after receipts were copied.

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRegistryRow.md` (this report)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRegistryRow/gate-registry.txt`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRegistryRow/bidi-selftest.txt`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRegistryRow/selfassessment.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRegistryRow/live-leg-env-receipt.txt`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRegistryRow/commands-and-exit-codes.txt`
