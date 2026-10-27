# CritNoOp — round 40 C1 do-nothing falsification

Seat judged on: coverage. Milestone: falsification. Leaf, no spawns, no git/jj mutation, no browser launched, no external site contact, nothing written under shokuknow or `corpus/evidence/round40/`. No tool installed (RULES.md read: channel order noted, nothing needed).

## Axes
- coverage (C1 predicate admission)
- provenance (is a receipt tied to *this* invocation's driver run?)
- replay-refusal (round-39 artifact, relabel, coverageMs edit, arbitrary JSON)
- freeze integrity (frozen bytes unchanged)

## Freeze integrity (observed)
`git cat-file -t 07e99cf1…` = commit; it is an ancestor of HEAD (`c925d92`). `sha256sum` of the four frozen files at HEAD **and** via `git show 07e99cf…:<path>` equals the `frozenDigests` in claims.json:
- scripts/playwright-firefox-egress-round39.mjs `1f8a15f0…545b`
- scripts/measure-c1-round40.mjs `a0e564c7…0735`
- scripts/selftest-measure-c1-round40.mjs `5a0b702d…d82`
- .ufo/waves/round-40/counters/c1-sample-span-v3.mjs `0b452eac…c253c`

Round-39 receipt sha256 unchanged after my runs.
Full: `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`.
`corpus/evidence/round40/` is empty (no receipt yet; counted command not run by me).

## Method
All forged inputs built from the committed round-39 receipt (`corpus/evidence/round-39/playwright-egress/receipt.json`) in scratch `/fast/scratch/hyaku/tabi-r40/CritNoOp/` (deleted; verified absent). Fresh 64-hex nonce `N` from `crypto.randomBytes(32)`. Counter = `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs <file> --nonce N`; wrapper = `node scripts/measure-c1-round40.mjs --out … --scratch …`.

Note: my first pass used a shell helper whose `PIPESTATUS` was clobbered by an `echo`, printing exit=0 for everything; I discarded that output and re-ran with real `$?`. Results below are from the second pass only.

## Observed results — counter layer (forged/replayed input, direct invocation)
| path | exit | findings |
|---|---|---|
| P1 round-39 receipt verbatim, fresh nonce | 1 | schema, run-nonce-mismatch, run1-sample-span, run2-sample-span |
| P2 relabel: schema→`-r40`, runNonce on receipt+both runs=N, refused=false | 1 | run1-sample-span, run2-sample-span (nonceMatched=true) |
| P3 P2 + every `coverageMs` value→5000 | 1 | run1-sample-span, run2-sample-span (identical to P2: `coverageMs` is not read by the counter) |
| P4 P2 + only `samples[].t` rewritten to start+i*150 | **0** | predicate=true, findings=[] |
| P5 arbitrary JSON `{"predicate":true}` | 1 | schema, run-nonce-mismatch, run-set |
| P6 `{}` | 1 | schema, run-nonce-mismatch, run-set |
| P7 no `--nonce` | 64 | usage |

## Observed results — measured-command layer (the counted command)
| path | exit | observed |
|---|---|---|
| W1 `--out` = copy of round-39 receipt | 1 | `finding:output-already-exists`; scratch dir not created |
| W2 `--out` = P4 forged-positive file | 1 | `output-already-exists`; scratch dir not created (browser never started) |
| W3 `--out` = the committed round-39 receipt path | 1 | `output-already-exists`; round-39 receipt sha256 unchanged |
| W4 no args | 64 | usage |
| W5 `--out` only, no `--scratch` | 64 | usage; out not created |
| dangling-symlink out (Node semantics probe): `existsSync`=false, `writeFileSync(...,{flag:'wx'})` → `EEXIST`, symlink target not created | — | driver's final `wx` write would fail on a pre-planted dangling symlink; wrapper reads no receipt → code path exits 2 [INFERENCE for the full wrapper path; the Node primitive behaviour is observed] |

## Finding: does the frozen counter admit any do-nothing path?
**Through the counted command: no.** Every do-nothing route I could build (reuse round-39 receipt, relabel, edit coverageMs, arbitrary JSON, pre-existing file at `--out`, pointing `--out` at the committed receipt) is refused before or after the counter, and the wrapper requires a live driver spawn writing a fresh exclusive output (`flag:'wx'` plus pre-existence check) with `run.status===0`. The wrapper picks the nonce internally, so a caller cannot supply a matching one.

**Through the counter alone: yes, trivially (P4).** `c1-sample-span-v3.mjs` is a pure structural validator of a JSON file plus a nonce string; relabel + timestamp rewrite of the round-39 receipt exits 0 (ticks were already 1, nonLoopback 0, owned tree non-empty, hash and version fields already satisfy the checks). `coverageMs` is ignored by the counter, so editing it alone is inert, and the 799/701 ms span is the only blocking field in the relabel route. The counter is therefore not itself a provenance authority; all provenance lives in the wrapper (nonce generation, exclusive output, driver spawn, exit status). Any claim "counter exit 0" must be read as counted only when the output of `measure-c1-round40.mjs`, never when `c1-sample-span-v3.mjs` is run by hand (the repo's own selftest labels this "parser-only synthetic positive").

## Residual attack surface (non-do-nothing, not exercised; `[INFERENCE]`)
Not cheapest-path, so not attempted and not a defect of the frozen predicate text, but the canonical judge should know the wrapper does not close them:
1. The nonce travels on the driver's argv (`--nonce <64hex>`, wrapper line spawning DRIVER), world-readable via `/proc/<pid>/cmdline`. A concurrent same-host writer could overwrite the receipt after the driver's `wx` write and before the wrapper's `readFileSync`, carrying the right nonce. Needs live timing and a second actor.
2. The wrapper does not verify the driver's sha256 at run time (it records `driverSha256` in output only); the freeze relies on the committed digest and on git state. Editing the driver, or `HYAKU_SCRATCH`/fixture, is outside the predicate text.
3. `browserVersion` is only checked as a non-empty string, not tied to the binary path.
Smallest safe correction if the judge wants it closed (no predicate widening): wrapper checks driver digest against the frozen value and passes the nonce through an inherited FD/env var rather than argv; neither is required for the as-written predicate.

## Limitations
- I did not run the live driver, so I make no claim that the live path scores true; only that no do-nothing path does.
- Wrapper runs W1–W3 all stop at the existence check, so they show the refusal ordering, not the post-driver nonce-mismatch branch (that branch is covered by the selftest and by P1/P2-style counter runs).
- HEAD `c925d92` is a descendant of the freeze commit; I verified the four frozen files only, not the rest of the tree.

VERDICT ok — no do-nothing path (round-39 reuse, relabel, coverageMs edit, arbitrary JSON, pre-existing --out) is admitted by the measured command `scripts/measure-c1-round40.mjs`; the bare counter alone admits a relabel+timestamp-forged receipt (P4 exit 0), so provenance rests entirely on the wrapper

Report: .ufo/waves/round-40/w1/CritNoOp/report.md
