# C1 attack — kill attribution (RevC1KillAttribution, tabi round-30 w2)

Seat: reviewer/attack, leaf. Attacked: the 14 faults that survived at baseline
(`claims.json` C1.before), at tip `072af95fe2822f0785a6ff88a578e2142dd258e5`, using the frozen
counter (`02945f88…3a55`) and catalogue (`cd1c27a2…3833`) — both byte-verified at the tip.
Question (from wave-1 `CritC1Counter.md`): can the counter's kills be trusted as behavioural,
given that a fraudster can make the counter leak mutant identity through the run directory?

## Verdict

**Holds.** Every one of the 14 previously surviving faults is killed at the tip by a
behavioural case: the killing case builds a git fixture repo, calls the gate's `evaluate()`
directly, and asserts an output field (s106: `valid` + the named field's value) or an exit plus
per-row reason strings (pins: `exit`, `unresolved`, `reasons[i].startsWith(...)` with length
equality). No self-test code reads `process.cwd()`, `/proc`, its own source, or the catalogue;
`process.argv` is touched only by CLI mode dispatch (not by any case); env is touched only as
`os.tmpdir()` temp-base lookup and an env spread into child git — neither value is inspected or
asserted on (details and line evidence below). The one nuance: `pins-f3-bytes-absent` is killed
by an uncaught `TypeError` (exit 1, unparseable stdout) on case `f3-old-bytes-never-committed-unresolved`
rather than by a failed assertion — the fixture exercises the mutated guard through `evaluate()`
and the mutant crashes where the pristine gate emits the declared `f3-bytes absent` reason, so
the kill is behavioural in trigger but crash-shaped in observable; the counter's frozen kill rule
("not clean") counts it. Wave-1's fraud channels (`process.cwd()` regex, byte-fingerprint table,
`/proc` provenance) are **not present** in the tip's cases; wave-1 §5's behavioural fixture gaps
are closed exactly as it prescribed.

## Measurement

In a clean shared clone at the tip (`git status --porcelain` = 0 lines), `TMPDIR` under scratch:

```
node scripts/check-gate-mutants.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --json
# exit=0 ; fault_total 27, fault_survivors 0, benign_total 13, benign_killed 0
# counter_sha256_at_rev 02945f88…, catalogue_sha256 cd1c27a2…  (both == frozenDigests)
# pristine: s106 cases=10 passed=10 clean ; pins cases=29 passed=29 clean
```

Raw JSON: `counter-tip.json` (sha256 `0392fc1005dc52bd…`) in the output dir; commands/exit codes
in `RECEIPTS.md`.

## Per-fault attribution (the 14)

Killing cases read in `scripts/check-s106-evidence.mjs` (CASES at :184-291, runner :340-369,
`evaluate` :107-143) and `scripts/check-release-pins.mjs` (CASES :315-437, runner :474-502,
`evaluate` :150-262). All case fixtures: `makeFixture()` → `mkdtempSync(tmpdir())`, `git init`,
receipt/bytes written, `git add -A && git commit`; the runner then calls `evaluate(fx.root, rev)`
(s106 :352; pins :482) — the gate's real evaluation over the fixture repo's committed blobs.

| # | fault | killing case(s) (`failing_cases`) | what the case sees | verdict |
|---|---|---|---|---|
| 1 | s106-sha-drop | `same-length-tamper-invalid` | committed pristine bytes at `measured_rev`, same-length tampered bytes at tip; asserts exit 1, `valid=false`, `sha_match=false`. Byte-count still agrees (same length), so dropping `shaMatch` from `valid` flips it to true → case fails. | behavioural |
| 2 | s106-anchor-unique-drop | `duplicate-anchor-invalid` | anchor line occurs at 187 **and** 188; asserts exit 1, `valid=false`, `anchor_unique=false`. Drop → `valid=true` → exit 0 ≠ 1. | behavioural |
| 3 | s106-anchor-unique-true | `duplicate-anchor-invalid` | same fixture; case asserts the `anchor_unique` **field** = false; forced `true` mismatches. | behavioural |
| 4 | s106-byte-count-drop | `receipt-byte-count-mismatch-invalid` | receipt `decoded_bytes` = len+7 while sha matches; asserts exit 1, `valid=false`, `byte_count_match=false`. Drop → `valid=true`. | behavioural |
| 5 | s106-byte-count-true | `receipt-byte-count-mismatch-invalid` | same fixture; field `byte_count_match` = false vs forced true. | behavioural |
| 6 | pins-f1-old-tag | `f1-old-tag-not-carried-by-row-unresolved` | `old_tag` 155.0.8037.97 not in the row's tags; asserts exit 1, `unresolved=1`, `reasons=["f1-old-tag"]`. `if (false)` → no reason → resolved → `unresolved=0` ≠ 1. | behavioural |
| 7 | pins-f2-path-traversal | `f2-dotdot-inside-filename-unresolved` | path `content/public/common/feature..cc` contains `..`; asserts `reasons=["f2-path-bound"]`. `includes("..")`→false → falls through to source/anchor binding (source contains the odd path) → resolved. | behavioural |
| 8 | pins-f3-bytes-absent | *(crash on)* `f3-old-bytes-never-committed-unresolved` | old bytes file never written → `ob === null`; pristine emits reason `f3-bytes absent` (exit 1, unresolved 1); mutant `if (false)` → `sha256(null)` → uncaught TypeError → exit 1, no JSON. Reproduced: `repro/err.txt` (TypeError at sha256/evaluate/runSelftest), instrumented `repro/err2.txt` names the case. | behavioural (crash-on-path; see nuance) |
| 9 | pins-f4-range-bounds | `f4-range-past-last-old-line-unresolved` | range `[7,8]` past the 6-line old file; asserts `reasons=["f4-ranges"]`. Bounds dropped → `blockIn` matches the trailing empty line → holds → resolved. | behavioural |
| 10 | pins-f4-anchor-token | `f4-anchor-lacks-range-token-unresolved` | anchor `feature.cc` (no `4-5` token) with range `[4,5]`; asserts `reasons=["f4-ranges"]`. Token check dropped → block matches → resolved. | behavioural |
| 11 | pins-s1-supersession-prefix | `drift-superseder-teaches-without-prefix-unresolved` | superseder teaches `kThing reads disabled…` without the `supersedes S001 —` prefix; asserts `reasons=["s1-drift-unsuperseded"]`. Prefix conjunct removed → resolved. | behavioural |
| 12 | pins-s1-supersession-tag | `drift-superseder-not-at-stable-tag-unresolved` | superseder at OLD tag (`recheck 90d`, out of population) with correct prefix; asserts `reasons=["s1-drift-unsuperseded"]`. Stable-tag conjunct removed → resolved. | behavioural |
| 13 | pins-notfound-status | `absence-404-present-with-marker-unresolved` | 404 → 200 with the NOT_FOUND marker retained in the body; asserts `reasons=["s1-drift-unsuperseded"]` (drifted, unsuperseded). Status conjunct dropped → `holds` → resolved → `unresolved=0` ≠ 1. | behavioural |
| 14 | pins-notfound-body | `absence-404-body-lacks-marker-unresolved` | 404 → 404 with an HTML body lacking NOT_FOUND; asserts `reasons=["s1-drift-unsuperseded"]`. Marker conjunct dropped → `holds` → resolved. | behavioural |

Corroborating (not in the 14, killed at baseline already): `s106-sha-true` by
`sha-mismatch-invalid` + `same-length-tamper-invalid` (both assert field `sha_match=false`),
`s106-revision-drop`/`-true` by `measured-revision-bytes-mismatch` (field `revision_match=false`),
`s106-anchor-located-true` by `anchor-off-by-one-invalid` (field `anchor_located=false`).

## Environment-read certification (the wave-1 channel)

Scanned both gates' self-test paths for `process.cwd|/proc|process.env|process.ppid|readFileSync|gate-mutants|import.meta|tmpdir(|realpathSync`:

- **No `process.cwd()`, no `/proc`, no `process.ppid` anywhere in either gate.** The wave-1
  channel (regex the counter's `mutant-<i>` run dir from cwd) is unused.
- **No self-test reads its own source or the catalogue.** `readFileSync` appears only in s106
  `makeFixture`'s `d.rev()` re-reading the *fixture's own* receipt (:326); pins does not import
  `readFileSync` at all. Neither gate references `scripts/gate-mutants.json` (zero grep hits).
- **`import.meta.url`** appears only as module-level `LANE = join(dirname(fileURLToPath(import.meta.url)), "..")`
  (s106 :48, pins :73) — a path computation, no file read, used solely as the production `--repo`
  default; the self-test never touches `LANE` (it passes `fx.root`).
- **`process.argv`** only in `parseArgs` (CLI mode dispatch); no case behaviour keys on it.
- **env**: s106 :63 spreads `{...process.env}` into the child `git` env (adds
  `GIT_CONFIG_GLOBAL/SYSTEM=/dev/null`); both fixtures call `os.tmpdir()` (s106 :294, pins :439),
  which consults `TMPDIR/TEMP/TMP` for the temp base. Neither value is inspected, asserted on, or
  branched on — fixtures are built there and the verdicts come from `evaluate()` over fixture
  blobs. Substance of the rule (no verdict keyed on environment/provenance) holds; the letter
  ("no env reads") is touched only by these two non-inspecting uses, recorded here for honesty.

## Residual risk (not a tip defect)

The counter still names run dirs `pristine-<n>` / `mutant-<i>` and places the child's `TMPDIR`
*inside* that dir (`check-gate-mutants.mjs:142,148,152,215`), so `os.tmpdir()` in a future
self-test would return `…/mutant-<i>/tmp` — wave-1's channel survives one rename away. At the
tip no gate code uses it. Wave-1's round-31 counter hardening (opaque run ids, neutral cwd/env)
remains the right fix; nothing in this round's cases depends on it.

## Findings summary

- **holds** — C1's kill set at the tip is behavioural: 14/14 previously surviving faults killed
  by fixture-driven `evaluate()` cases asserting field values (s106) or reason strings (pins);
  no environment/provenance-keyed case exists at the tip.
- **nuance (no defect)** — `pins-f3-bytes-absent`'s kill observable is a crash (exit 1,
  unparseable stdout) on `f3-old-bytes-never-committed-unresolved`, not a failed assertion; the
  counter's frozen kill rule counts any non-clean run, so the attribution stands, but a reading
  rule that requires a *named failing case* would see an empty `failing_cases` here. If round 31
  adopts wave-1's reading rule, it should state how crash-kills (empty `failing_cases`) are to
  be attributed — e.g. accept a crash only when a case that exercises the mutated path is
  identified by reproduction, as done here.
- No tool installs were made (none needed). No network fetches. Lane untouched; all measurement
  in the scratch clone; artifacts + receipts in the output dir.
