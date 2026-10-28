# MutC1Counter — counter v4 mutation probe (round 42 / attempt 1, C1 seat)

Seat: `MutC1Counter` (leaf). Assignment: copy `.ufo/waves/round-41/counters/c1-session-bound-v4.mjs`
to scratch, apply six named mutations one at a time, run each against the fresh round-42 receipt,
record exit code / predicate / which defective facts the mutant now accepts, and report any
survivor as a hole for the next freeze. Frozen counter bytes were never touched.

Scratch: `/fast/scratch/hyaku/tabi-r42/MutC1Counter` (created by me, deleted at the end of this
seat — `rm -rf` run in the last command; receipts that matter were copied here first).

## 1. Inputs and identities

| artifact | sha256 |
|---|---|
| `.ufo/waves/round-41/counters/c1-session-bound-v4.mjs` (counter under test, copy `pristine.mjs`) | `cd71a59efa575fc260c4e487b7d52f69a9cd9f3b98bc6d4333abdb9a0cff126a` (== `frozenDigests[".ufo/waves/round-41/counters/c1-session-bound-v4.mjs"]`) |
| `corpus/evidence/round42/playwright-egress/receipt.json` (fresh r42 receipt) | `3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e` |
| `corpus/evidence/round42/playwright-egress/receipt.witness.json` | `163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339` |
| `.ufo/waves/round-41/claims.json` (live pins, `pins-r41.json`) | `1cb59576b42a0335d69282a2c00bae88a770d45a86f84d07d2f616527ab3330e` |
| `.ufo/waves/round-42/claims.json` (this round's claims, `pins.json`) | `ce7b56799cae7593d315330ffce460ac9236c1f343e40cf7212f334f7fd41d7a` |

Receipt facts used by every run: `schema=tabi-pw-firefox-egress-receipt-r41`, `refused=false`,
`binding=true`, two runs with 126 and 134 samples, `runNonce=94c0f0efa48293b3ed923bd9717b5c2702b5f89f3fd45ffd51c980ba8e4e21ab`,
`egressNonLoopback=0`, roots `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`,
witness `schema=tabi-r41-witness`, same nonce, 754 samples.

Interpreter: the frozen producer pin is fnm node v24.21.0
(`producerPins.nodeSha256 = 7fde7b8a…`). All numbers below were produced with the pinned binary,
`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` (`node -v` → `v24.21.0`,
`sha256(process.execPath)` == the pin). The first pass was accidentally run with the eval kernel's
default `node` (mise v26.12.0); that pass is kept as `evidence/results-firstpass-mise-node-v26.12.0.json`
and is **superseded** — under it the counter correctly raised `digest-mismatch:node` on every
pins-live case (see §4).

## 2. Method

Baseline (pristine) accepts the real receipt: exit 0, `predicate:true`, 0 findings. Therefore
"a mutation flips the predicate to true on the real receipt" cannot be the kill signal for any
mutant (it is already true). The behavioural detector used instead is a **negative fixture per
clause**: one byte-level edit of the real receipt that violates exactly the clause the mutation
removes. A mutation is a *survivor* (= counter hole for that clause) when the mutated counter
returns exit 0 / `predicate:true` on the fixture that the pristine counter refuses.

Checks that were *not* in the mutation list were left untouched, so any difference in outcome is
attributable to the named mutation alone. Fixtures assert single-clause violation by keeping
derived summaries consistent (e.g. the egress fixture raises `sockets.ss.nonLoopback`,
`run.egressNonLoopback` and `receipt.egressNonLoopback` together, so only the per-sample egress
gate fires).

Fixtures are rebuilt by `evidence/generate-fixtures.py`; the matrix replays by
`evidence/run-matrix.sh` (77 = 7 counters × 11 cases). Full transcript:
`evidence/run-matrix.out`; machine-readable: `evidence/results-pinned-node.json`.

Representative exact commands (cwd `/fast/scratch/hyaku/tabi-r42/MutC1Counter`, `NONCE` as above):

```
node pristine.mjs receipt.json --nonce $NONCE --witness witness.json
    → exit 0  {"predicate":true,"nonceMatched":true,"findings":[]}
node m1.mjs f_span.json --nonce $NONCE --witness witness.json
    → exit 0  {"predicate":true,"nfindings":0}
node pristine.mjs f_span.json --nonce $NONCE --witness witness.json
    → exit 1  {"predicate":false,"findings":["run1-sample-span","run2-sample-span"]}
```

## 3. Mutations, diffs, verdicts

Patches: `evidence/mutants/m1..m6.diff`. Mutant sha256: m1 `5793b08a…`, m2 `b2b4fa96…`,
m3 `94313046…`, m4 `d2457175…`, m5 `b438d771…`, m6 `504730a7…` (pristine `cd71a59e…`).

| # | mutation (smallest behaviour-bearing point) | fixture violating that clause | pristine | mutant | verdict |
|---|---|---|---|---|---|
| M1 | drop `if (ts.length < 2 \|\| ts.at(-1) - ts[0] < 1000) findings.push('…-sample-span')` | `f_span.json` — per run `t[j] = t0 + j` (strictly increasing, span = n−1 ms < 1000) | exit 1, `["run1-sample-span","run2-sample-span"]` | **exit 0, predicate true, 0 findings** | **SURVIVED** (span clause is a lone gate) |
| M2 | `usable()` `x.ticks > 0` → `x.ticks >= 0` | `f_ticks.json` — every sample `ss.ticks=0` and `finalSweep.ss.ticks=0` | exit 1, 262 findings (`run1-sample1-ss-unavailable` … `run2-final-ss-unavailable`) | **exit 0, predicate true, 0 findings** | **SURVIVED** (zero ticks accepted) |
| M3 | skip witness verification entirely: `if (witnessFile)` → `if (false)` and drop `else findings.push('witness-missing')` | `f_base_nowit` (no `--witness`) and `f_base_bogus` (`w_bogus.json`, `schema:"bogus-witness"`) | exit 1 `["witness-missing"]` / exit 1 `["witness-unreadable"]` | **exit 0 predicate true, both cases** | **SURVIVED** (witness conjunct fully removable) |
| M4 | drop per-sample `…-egress` and final-sweep `…-final-…-egress` findings | `f_egress.json` — `runs[0].samples[5].ss.nonLoopback=1` with summaries kept consistent | exit 1 `["run1-sample6-ss-egress"]` | **exit 0, predicate true, 0 findings** | **SURVIVED** (nonzero egress accepted on every surface) |
| M5 | relax tree/root exe check to "any executable": sample gate → `!hasFf && !tree.some(p=>p?.exe)`; root gate → `typeof root?.exe !== 'string' \|\| !root.exe` | `f_tree_exe.json` (all `treePids[].exe = /usr/bin/true`) and `f_exe_roots.json` (`owned.roots[0].exe = /usr/bin/true`) | exit 1, 260 findings / exit 1 `["run1-root-exe","run2-root-exe"]` | **exit 0 predicate true, both** | **SURVIVED** (non-Firefox executables accepted as owned roots and as tree members) |
| M6 | drop `receipt.runNonce !== nonce \|\| runs.some(r => r.runNonce !== nonce)` (64-hex form check on the argument kept) | `f_nonce.json` — `receipt.runNonce` and both `runs[].runNonce` rewritten to `f×64`, real nonce passed on the command line | exit 1 `["run-nonce-mismatch"]` | **exit 0 predicate true, 0 findings, `nonceMatched:true`** | **SURVIVED** (receipt/run nonce binding removable; `nonceMatched` is derived from the finding, so the mutant also reports `nonceMatched:true` on a mismatched receipt) |

Off-diagonal cells are all `exit 1` with the pristine finding list, i.e. no mutation weakens a
*neighbouring* clause and no mutation causes a false acceptance on a fixture it was not aimed at.
Positive path preserved for every mutant: `f_base` → exit 0 / predicate true for pristine, m1–m6;
pins-live positive path (`--pins pins-r41.json`, pinned node) → exit 0 / predicate true for all seven.

**All six mutants survive.** Read at clause granularity, every one of the six clauses is a
single load-bearing gate with no redundancy: deleting any one of them yields exit 0 on a receipt
that violates exactly that clause. For an admission instrument that is the expected shape of a
conjunctive predicate, but it means the coverage statement "the counter refuses X" is only as
strong as the weakest single line, and the six mutations above are concrete accepted-forgeries
for each clause.

## 4. Pin-block behaviour found while running

1. **Pins are live and bite when the r41 claims file is passed.** `pristine.mjs … --pins pins-r41.json`
   (pinned node) → exit 0, 0 findings; a corrupted pin
   (`pins-wrong.json`, `frozenDigests["scripts/playwright-firefox-egress-round41.mjs"] = 0×64`) →
   exit 1, `["digest-mismatch:scripts/playwright-firefox-egress-round41.mjs"]`; first pass on node
   v26.12.0 → exit 1, `["digest-mismatch:node"]` (correct: `process.execPath` ≠ pinned v24.21.0).
2. **FINDING — round-42 `claims.json` makes the whole pin block vacuous.** The counter reads
   `pins.frozenDigests` / `pins.producerPins`; `.ufo/waves/round-42/claims.json` has neither key
   (top-level keys: `schema, lane, round, baseline, declaredAt, axesAtRoundStart, saturation,
   stagnationWindow, lowestAxis, stagnationNudge, freshStartNote, causalSeparation, claims`).
   `node pristine.mjs receipt.json --nonce $NONCE --witness witness.json --pins pins.json` → exit 0
   with **zero** digest findings, indistinguishable from a fully verified producer set. So the
   frozen predicate sentence's conjunct "producer digests equal the frozen pins" is only enforced
   when the *round-41* claims file is the `--pins` argument (`scripts/measure-c1-round41.mjs:38`
   hardcodes exactly that, so the delivered chain is fine) — but any seat/verifier that passes the
   round's own claims file, as this seat's ticket phrased it (`--pins <claims copy>`), silently
   measures nothing on pins. Route: when C1 is re-frozen, pin the pins-file identity (digest of
   `.ufo/waves/round-41/claims.json`) or fail closed on a pins doc without `frozenDigests`.
3. **FINDING — the counter's own digest pin is self-attested and does not see a substituted copy.**
   `frozenDigests[".ufo/waves/round-41/counters/c1-session-bound-v4.mjs"]` is checked by reading the
   *repo* path from inside the code being checked. All six mutants ran with `--pins pins-r41.json`
   and exited 0 on `f_base` although their bytes (`5793b08a…` … `504730a7…`) differ from the pinned
   `cd71a59e…`: no `digest-mismatch:` finding was raised for the counter. A do-nothing reach of the
   C1 predicate is therefore "edit the counter and the claims file together" or "run any counter
   copy that the harness is pointed at" — the chain's refusal of r39/r40/r41 replays is only as good
   as the verifier's choice of counter file. Route for the next freeze: have the checker/verifier
   hash the counter it executes (and the claims it feeds it) from outside, or have
   `measure-c1-round41.mjs` re-verify `COUNTER`'s digest after spawning.

## 5. Residual coverage (clauses not probed by this seat)

The counter emits 52 distinct finding codes. This probe exercised 11 of them
(`schema`-family excluded; exercised: `run-nonce-mismatch`, `run{1,2}-sample-span`,
`run*-sample*-{ss,proc}-unavailable`, `run*-final-ss-unavailable`, `run1-sample6-ss-egress`,
`run*-sample*-no-firefox-exe`, `run*-root-exe`, `witness-missing`, `witness-unreadable`,
`digest-mismatch:<producer>`, `digest-mismatch:node`). Still unprobed single gates, in the same
mutate-one-clause form (candidates for the next freeze):

- run set / shape: `schema`, `run-set`, `run{N}-refused`, `run{N}-sample-count`, `run{N}-sample-order`
- loader boundary: `env-check-unreadable`, `env-check-forbidden`, `env-check-execargv`, `env-check-nonce`
- identity tree: `sample*-tree-empty`, `sample*-pid-identity`, `sample*-pid-stale`, `sample*-pid-future`, `run{N}-root-stale`, `run{N}-owned-empty`
- blindness: `run{N}-zero-ss-observation`, `run{N}-zero-proc-observation`, `run{N}-final-{ss,proc}-unavailable`
- run end-state: `run{N}-survivors`, `run{N}-port-open`, `run{N}-version`, `run{N}-shot-hash`, `shot-hash-diff`, `binding`
- summary agreement: `run{N}-summary-{ss,proc}-mismatch`, `run{N}-summary-egress-mismatch`, `summary-egress-mismatch`
- witness quality: `witness-nonce-mismatch`, `witness-env-contaminated`, `witness-samples`, `witness-driver-unseen`, `witness-no-owned-firefox`, `witness-no-overlap`
- generator record: `wall-clock-inconsistent`, `gate-contaminated`, `firefox-bin-unbound`, `digest-mismatch:firefox-bin`

M4 also showed the per-sample and final-sweep egress gates are independently removable; the
summary-agreement gates (`run{N}-summary-egress-mismatch`) do not compensate, because a forger
raising both sample and summary consistently is accepted once the egress gate is gone.

## 6. Limitations

- Fixtures are synthetic edits of the real receipt, not browser runs: this measures the
  verifier's discrimination, not the driver's.
- The 6 mutants were only applied to the six named points; no mutation of the driver,
  `measure-c1-round41.mjs`, or the witness producer was performed.
- Interpreter choice materially changes the pins-live result (`digest-mismatch:node` under mise
  node v26.12.0). Numbers here are the pinned v24.21.0 runs only; the v26 pass is retained as
  evidence and not used for verdicts.
- No claim verdict is issued here; C1 admission is the verifier's call. This seat reports holes.

## 7. Evidence index (this directory)

- `evidence/mutants/m1.diff … m6.diff` — exact patches against the frozen counter.
- `evidence/results-pinned-node.json` — 77 runs (7 counters × 11 fixtures), pinned node.
- `evidence/run-matrix.out` — replay transcript produced by `evidence/run-matrix.sh`.
- `evidence/results-firstpass-mise-node-v26.12.0.json` — superseded first pass (node confound documented).
- `evidence/generate-fixtures.py`, `evidence/run-matrix.sh` — fixture + matrix reproduction.
- `evidence/hashes.txt` — sha256 of pristine, m1–m6 and every input artifact.

Scratch `/fast/scratch/hyaku/tabi-r42/MutC1Counter` deleted after this report was written; no
file under `/home/vgpnk/Projects/shokunin` outside this seat directory was created or modified
(no git commands, no commits, no network).

VERDICT finding — 6/6 mutants survive (each of M1–M6 flips predicate to true on a receipt that violates exactly its clause), plus two pin-block holes: a `--pins .ufo/waves/round-42/claims.json` argument makes all digest pins vacuous, and the counter's own digest pin cannot detect a substituted counter copy.
