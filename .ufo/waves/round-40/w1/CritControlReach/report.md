# CritControlReach — round-40 C1 no-op receipt attack (attempt 2, frozen counter)

Frozen bytes confirmed by sha256: measure-c1-round40.mjs a0e564c7…, c1-sample-span-v3.mjs 0b452eac…, driver 1f8a15f0… (match claims.json). No tool installs. No real browser run was made; the live driver was not invoked by me. Production tree untouched (`corpus/evidence/round40` does not exist). Scratch `/fast/scratch/hyaku/tabi-r40/CritControlReach/` removed at end; fixtures kept here: `fixtures.py`, `forger.cjs`, `results.json`, `forged-receipt-F4.json`.

## Question
Can field changes, schema changes, receipt-path substitution or a top-level summary override give exit 0 without a round-40 run?

## Results (executed; exit codes from `results.json`)
| id | attack | exit | note |
|---|---|---|---|
| F1 | counter alone, round-39 receipt + schema→r40, refused=false, runNonce (3 places) = attacker-chosen N, sample `t` respaced 200ms | **0** | counter takes the nonce from its own CLI, so it is not a live proof by itself |
| F1b | same but nonce edits only (no schema/span edit) | 1 | `schema`, both `sample-span` |
| F2 | F1 + contradictory summaries: top-level `egressNonLoopback=9, survivors=9, binding=false, browserVersion='', binary=/bin/true`; per-run `egressNonLoopback=7`, `sockets=[8.8.8.8:443]`, `coverageMs=1`, `sampleCount=1`, empty httpLog/events/cmds, `owned.tree=[0]`, `ticks=1e-9`, `lines=99` with nonLoopback 0 | **0** | counter reads only runs[].samples/finalSweep/owned.tree length/survivors/portClosed/browserVersion/firstShotSha256 |
| F2b | only top-level `binding=false` | **0** | summary fields ignored |
| F3 | schema = round-39 v2 / missing; top-level refused=true; 3 runs; non-hex nonce | 1 each | schema/run-set/nonce gates hold |
| F4-full | wrapper (real, frozen) run with `NODE_OPTIONS=--require forger.cjs`; preload replaces the driver when argv[1] is the driver, reads `--out/--nonce` from argv, writes a nonce-bound forged receipt, exits 0 | **0** in 0.06 s | wrapper prints `nonceMatches:true`, counter `predicate:true`; receipt spans 1600/1400 ms, samples 9/8; **no browser, no round-40 run** |
| F4-exit1 / F4-noop | forger exits 1 / exits 0 writing nothing | 1 / 2 | driver exit status and receipt-readability gates hold |
| F5a/b/c/e | out path pre-existing, symlink to round-39 receipt, `..`-normalised path to round-39 receipt, relative path from another cwd | 1 | `output-already-exists` before any mkdir/driver |
| F5d | out = dangling symlink | 0 (with forger) | exists-check passes dangling links; with the real driver `wx` would EEXIST on the link (not run) — not independently exploitable |

## Findings
1. **FINDING (high, reproducible): the frozen measured command is not hijack-proof; exit 0 without a round-40 run is achievable.** The wrapper passes `process.env` unfiltered to the driver (`env:{...process.env,…}`), so `NODE_OPTIONS=--require` (also `NODE_PATH`, `PATH`-resolved nothing else needed) replaces the driver in-process. The nonce is generated fresh but is handed to the driver on argv, so whoever controls the driver reads it and satisfies "receipt and each run carry that exact nonce". The wrapper computes `driverSha256` but only prints it; it is never compared to the frozen digest (claims.json `frozenDigests`), and the counter sha is not checked at all. F4-full is the executable proof (`forged-receipt-F4.json`, ran 0.06 s).
2. **FINDING (medium): "actual first-to-last timestamp span" is self-reported.** Span is `samples[].t` from the driver's receipt; nothing ties it to wall-clock of the wrapper. F4-full scores a 1600 ms span in 60 ms of real time. A wrapper-side lower bound (`Date.now()` around `spawnSync`, ≥ span + launch) would catch it for non-hostile cases only.
3. **FINDING (low/medium): counter ignores run/top-level summaries** (`egressNonLoopback`, `sockets`, `binding`, `coverageMs`, `sampleCount`, `survivors` top-level, `binary`, `playwrightVersion`). In an honest real receipt these derive from samples, but a receipt where they contradict the samples still scores exit 0 (F2/F2b). Also `ticks` only needs `>0` (1e-9 passes) and `owned.tree` only non-empty (`[0]` passes); `browserVersion` is any non-empty string, not tied to firefox-1555/157.0.
4. No bypass found via schema edit (F3), path substitution to round-39 receipt (F5), driver nonzero exit, or no-write driver (exit 2). Round-39 receipt verbatim is refused (control in claims.json, F1b shows the three findings).

## Smallest safe corrections (do NOT change the frozen predicate; these tighten the command)
- Wrapper: spawn the driver with a scrubbed env (drop `NODE_OPTIONS`, `NODE_PATH`, `NODE_*`, `LD_PRELOAD`) and `--no-warnings`-free fixed argv; refuse (exit 2) if `driverSha256` ≠ frozen digest, and verify the counter sha likewise.
- Wrapper: measure wall clock around the driver and require elapsed ≥ observed span; also check the driver stdout `wrote:` line and that the owned `binary` is the Playwright firefox path.
- Counter: cross-check `run.egressNonLoopback`/`sockets`/top-level `egressNonLoopback`/`survivors`/`binding` against samples; require integer ticks ≥1.
Because the freeze is final and pre-data, the main agent must decide whether to accept finding 1 as a disclosed limitation (command is sound against accidental replay and edited receipts, not against an adversarial environment) or to refuse the freeze.

## Limitations
Real driver/Firefox not executed; F5d symlink/`wx` behaviour for the real driver is from source reading (line 403 `flag:'wx'`). Hijack requires control of the invoking environment, which the honest counting runner (TabiR40a2) does not have unless ambient `NODE_OPTIONS` is set.

VERDICT finding — frozen wrapper yields exit 0 with no browser run via NODE_OPTIONS preload driver substitution (F4-full); field/schema/path/summary edits alone do not (counter-alone exit 0 only with attacker-chosen nonce, summary fields ignored)
