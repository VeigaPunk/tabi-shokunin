# tabi round 34 — w1 seat ExecKillsA (C2 build, mutant half M01 M03 M06 M08 M09 M10)

## Verdict

All six mutants assigned to this seat — **M01, M03, M06, M08, M09, M10** — are now killed by the gate's own `--selftest`, each by exactly one new `v3-a-…` case, with each applied mutant failing exactly one case in the whole 50-case self-test (so each case is load-bearing and no pre-existing case regressed) and every mutant's whitespace twin still exiting 0. The frozen counter at the seat commit `550d54ae77613a8982055c06e79a692cee14406c` reports **killed 14/20, survivors `M04 M05 M07 M16 M18 M19`** (exactly the other seat's half), `unappliable []`, `twinsFailing []`, pristine/neutral/decoy exit 0, and the round-33 frozen forgery battery `predicate true` (honest H0/H1/H2 admitted, forgeries 0 of 8); `predicate` is false *only* because seat B's six mutants are not in this clone. One thing the L1 must rule on: **M06 is not separable on exit / admitted / population / finding id** — its mutant still refuses, one check later — so its case pins the first finding's *detail* through a new optional `detailIncludes` case field (inside the self-test runner, no rule line touched); if that is judged outside "added self-test cases/fixture options", M06 stays a survivor and the target is missed, not narrowed.

## What changed

One file, `scripts/check-bidi-runtime.mjs`, 35 added lines / 2 replaced lines against `59f1b47aae277e1670e4a824173da8cde7e388ee` (`git diff --numstat`: `35 2`). Patch: `cases.patch`.

- `1017-1044` — six new `CASES` entries, ids prefixed `v3-a-`:
  - `v3-a-m01-duplicate-id-twice` — `ids: ["R2","R2"]`, expects exit 1, admitted 0, population 2, `x3-duplicate-id`.
  - `v3-a-m03-measured-cell-uppercase` — rows `R1, R2` with cell `Yes`, expects exit 0, admitted 2.
  - `v3-a-m06-session-id-uppercase` — both runs' `sessionId` = `sha256("tabi-v3-a-session").slice(0,32).toUpperCase()` (the ws url carries the same id), expects exit 1, admitted 0, population 1, `t1-receipt`, `detailIncludes: "sessionId is not 32 lowercase hex"`.
  - `v3-a-m08-context-id-lowercase` — both runs' context id = `sha256("tabi-v3-a-context").slice(0,32)`, expects exit 1, admitted 0, population 16, `t1-receipt`.
  - `v3-a-m09-driver-imports-rows` — driver `import { FIXTURE, ROWS } from "./check-bidi-runtime.mjs";`, expects exit 1, `t1-receipt`.
  - `v3-a-m10-driver-imports-servefixture` — driver `import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs";`, expects exit 0, admitted 16.
- `1135-1143` — the case comparison gains the optional `detailIncludes` field (`firstDetail = out.entryDetail || first non-admitted row's detail`), and the results object records `detail` / `expectedDetailIncludes`. Existing cases are unaffected (`detailIncludes === undefined` ⇒ no extra conjunct).

No fixture-builder option was needed (`goldenLines` already exposes `sessionId`, `contextId`, `driverText`, `cell`, `ids`). **No mutant find text was touched**: all 20 finds still occur exactly once before and after (checked directly and by the counter's `occurrences: 1` / `unappliable: []`).

## Evidence (commands and exit codes)

Scratch clone `$HYAKU_SCRATCH/tabi-r34/ExecKillsA/clone` = `git clone --shared` of the lane, `checkout --detach 59f1b47aae277e1670e4a824173da8cde7e388ee` (clone toplevel asserted equal to the clone dir before the commit; `git config user.{name,email}=ExecKillsA[@scratch.local]`).

1. Baseline gate self-test (control, unedited blob from the freeze): `TMPDIR=$S/tmp node tmp/base/check-bidi-runtime.mjs --selftest` → **exit 0**, `BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44` (`selftest-baseline-gate.txt`).
2. Edited gate, pristine: `TMPDIR=$S/tmp node scripts/check-bidi-runtime.mjs --selftest` → **exit 0**, `cases=50 passed=50`; every `v3-a-…` line `PASS` (`selftest-pristine.txt`).
3. Hand check, one mutant at a time (`handcheck-mutants.mjs`, delivered: exact find→replace from the frozen counter's embedded `MUTANTS`, gate copied under `TMPDIR`, plus a whitespace twin built by doubling the find's first space; run as `S=<scratch dir with an edited clone> node handcheck-mutants.mjs`):

   ```
   M01: mutant exit=3 fails=1 v3=1 twin exit=0
   M03: mutant exit=3 fails=1 v3=1 twin exit=0
   M06: mutant exit=3 fails=1 v3=1 twin exit=0
   M08: mutant exit=3 fails=1 v3=1 twin exit=0
   M09: mutant exit=3 fails=1 v3=1 twin exit=0
   M10: mutant exit=3 fails=1 v3=1 twin exit=0
   ```

   The single failing case in each run is the new one, e.g.
   `CASE id=v3-a-m06-session-id-uppercase expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=1 population=1 expected_reason=t1-receipt reason=t1-receipt FAIL`
   `CASE id=v3-a-m08-context-id-lowercase expected_exit=1 exit=0 expected_admitted=0 admitted=16 expected_population=16 population=16 expected_reason=t1-receipt reason=- FAIL`
   (`per-mutant-handcheck.json`).
4. `detail-comparison.json` records the pristine-vs-mutant observation per case, notably M06:
   pristine detail `run1: sessionId is not 32 lowercase hex: "585E9EC1343EAA7FAA0718A636677BC9"` vs mutant detail `run1: webSocketUrl is not ws://<host>/session/<sessionId>: ws://127.0.0.1:9515/session/585E9EC1343EAA7FAA0718A636677BC9` — same exit 1, admitted 0, population 1, same finding id `t1-receipt`.
5. Frozen counter (`counter.json`):
   `node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --rev 550d54ae77613a8982055c06e79a692cee14406c --repo <clone> --json`, `TMPDIR=$S/tmp` → **exit 1** (`predicate false`):

   ```json
   {"predicate":false,"killedCount":14,"survivors":["M04","M05","M07","M16","M18","M19"],"unappliable":[],
    "twinsFailing":[],"pristine":0,"neutral":0,"decoy":0,
    "battery":{"exit":0,"predicate":true,"forgeriesAccepted":0,"honest":{"H0":true,"H1":true,"H2":true}}}
   ```

   `killed` = `M01,M01b,M02,M03,M06,M08,M09,M10,M11,M12,M13,M14,M15,M17` — the eight baseline kills plus this seat's six. Edit gate sha256 `cd06d73664b315e2a86f268d0321b965b24348534ed1fdb5e3c4a9f1c0a1a295`.
6. Patch consistency: `git -C clone apply --check -R cases.patch` → ok (the patch is exactly the clone's HEAD diff against the freeze).

## Grounding for the two id-shape cases

- **Session id (M06).** S127 (ChromeDriver 154 `util.cc` `GenerateId`) is the existing row; this round I re-fetched the same bytes read-only (F2 in `fetch-receipts.md`, `raw.githubusercontent.com/chromium/chromium/154.0.8037.97/…/util.cc`, 2026-10-26T19:52:26Z, HTTP 200, 19648 B, sha256 `3ed654c7574c1dd977b79aa22960432e07ff502593fc66d170aa6fae213be37b` — byte-identical to S127's recorded decoded blob sha). `util.cc:39-43` is `base::StringPrintf("%016" PRIx64 "%016" PRIx64, msb, lsb)`: 32 lower-case hex. A copy is at `util.cc.154.0.8037.97.txt` so an **S130** row can carry this round's receipt.
- **Browsing-context id (M08).** No registry row grounds it. It rests on the committed round-32 evidence (`corpus/evidence/round-32/bidi/run1/transcript.jsonl`, `"context":"31B8FE9C25C36020CBB175F250715903"` — 32 upper-case hex; session ids in the same files are lower-case) and `corpus/knowledge/bidi-runtime-gate-v2-round-33.md:91`, `:227`. I probed five plausible chromium paths at the 154 tag for a public statement of the mapper's context-id minting and got 404 on all (`fetch-receipts.md` F3-F7); the tag's `embed_bidimapper_in_cpp.py` shows the mapper ships as a prebuilt JS bundle, so its minting is not reachable by a plain path. **An S130+ row is still needed** (the registry holds 129 rows at the freeze; `corpus/SOURCES.md` is outside this seat's write scope).

## Risks / limits

- **The `detailIncludes` clause is the one deviation** from the no-harm wording "changes only by added self-test cases/fixture options". Justification: `sessionOf()` checks `SESSION_ID` (`:382`) and `WS_SESSION` (`:148`, `:386`) independently, so an upper-case session id is refused by the pristine gate at `:382` and by the M06 mutant at `:386` — identical exit, admitted, population and finding id, different message. No fixture separates them otherwise (see `per-mutant-table.md`). If the L1 refuses the runner change, revert `1135-1143` and drop the `v3-a-m06-…` case: M06 stays a survivor.
- The M06 assertion is wording-sensitive **in the fail-closed direction**: if that message is ever reworded, the pristine self-test fails loudly (exit 3) instead of silently passing.
- Merge with seat B: B's cases go in the same `CASES` array and may also touch the comparison lines; keep both conjuncts and both result fields.
- M08/M09 cases assert population 16 via the default `ALL_OK` id list; if that list changes the cases move with it (they use the default, not a literal count source).
- Limits untouched: killing these six proves the self-test exercises those six sites, not that the gate is forgery-proof (CritForgeV2B/C stay recorded limits; the counter's disclosed residual — a self-test reading its own source — still needs the wave-2 code read).
- Sourcing leg of C2 (SOURCES S130+) is **not** satisfied by this seat for the browsing-context shape; S127's re-fetch receipt is ready for an S130 row. Lane files were not edited.

## Tooling

No installs or upgrades (no package manager invoked; `node` v24.21.0 and `git` as already on the host). Network: read-only `curl -q -sS --proto =https` GETs of public Chromium source pages only, recorded in `fetch-receipts.md`.

## Deliverables

Output dir `.ufo/waves/round-34/w1/ExecKillsA/`:
- `cases.patch` — gate diff against `59f1b47aae277e1670e4a824173da8cde7e388ee`
- `counter.json` — frozen counter output at seat commit `550d54ae77613a8982055c06e79a692cee14406c`
- `per-mutant-table.md` — mutant | rule | case id | pristine vs mutant outcome
- `per-mutant-handcheck.json`, `detail-comparison.json` — raw per-mutant and pristine-vs-mutant observations
- `selftest-pristine.txt`, `selftest-baseline-gate.txt` — edited gate 50/50 and baseline gate 44/44
- `handcheck-mutants.mjs`, `handcheck-details.mjs` — the two scratch scripts that produced the hand-check JSON (`handcheck-details.mjs` takes `S=<scratch dir>`)
- `fetch-receipts.md`, `util.cc.154.0.8037.97.txt` — sourcing receipts for the S130 row
