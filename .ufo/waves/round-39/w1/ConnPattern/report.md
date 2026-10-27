# ConnPattern — cross-claim pattern scan, C1 receipt binding vs C2 sentence/measurement binding

Axes: coverage, calibration. Milestone: cross-surface. Lane: tabi round 39, w1. Leaf seat; no dispatch; no production edits; no browser run; no installs.

Scope read: `.ufo/waves/round-39/claims.json` (HEAD), the frozen counters at HEAD (byte-identical to frozen digests), the committed C1 receipt, the driver `scripts/playwright-firefox-egress-round39.mjs`, and the measure/baseline directories. Scratch clone `/fast/scratch/hyaku/tabi-r39/ConnPattern/repo` (`git rev-parse --show-toplevel` asserted), removed on EXIT.

## 1. Commands run (read-only; counters write stdout only)

```
REV=$(git -C $S/repo rev-parse HEAD)            # 1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4
node $C/c1-egress-session-bound.mjs --rev $REV --repo $S/repo --json   -> exit 0, predicate=true, findings=[]
node $C/c2-routed-defects-v2.mjs    --rev $REV --repo $S/repo --json   -> exit 1, predicate=false, findings=[d5-receipt, d6-file]
node $C/c2-routed-defects-v2.mjs    --rev $REV --repo $S/repo --claims $S/repo/.ufo/waves/round-39/baseline/c2-mutant-claims.json
   -> exit 1: FINDING d5-receipt; FINDING d6-file; FINDING d7-sentence-mismatch
sha256 of frozen claims blob @9c09ebb = 40740f82…c009 (matches c2-sentence-mutant.json frozenClaimsSha256)
```
Saved: `w1/ConnPattern/c1.json`, `w1/ConnPattern/c2.json`, `w1/ConnPattern/c2-mutant.txt`, `w1/ConnPattern/probe-proc-hex.txt`.

Frozen digests at 9c09ebb equal HEAD for both counters and the driver (`75e823e4…`, `eefc8997…`, `3fba8b68…`). `claims.json` differs only by `frozenAt` (see §3B).

## 2. Shared failure class (one class, two sub-instances)

**Class A — committed self-attestation.** A counter's verdict is a function of fields the producing run wrote into a committed JSON/text file. The fields that name the referenced artifact (digests, durations, exit codes, claim identity, driver identity) are checked for *shape*, for *equality with other self-written fields*, for *array position*, or for *substring presence*. None are recomputed from the referenced bytes or from a live observation, except one (C2 D6).

**Class B — containment / self-reference.** An artifact cannot carry the full identity of the commit that contains it. C2 D6 requires exactly this; the claims file carries the same pattern in `frozenAt`.

C1 exhibits Class A only. C2 exhibits Class A (D4, D5, D7) and Class B (D6, plus claims `frozenAt`).

### A-instances in C1 (receipt binding)

| Where | What the counter checks | What it does not check | Observed |
|---|---|---|---|
| `c1-egress-session-bound.mjs:98-99` | first-shot sha is 64-hex | that it equals any screenshot | receipt `ebfae99c…` both runs; equality only across self-written runs |
| `c1…:111` | `coverageMs >= 1000` (self-reported) | sample timestamps | receipt run1 `coverageMs=1560`, sample span **799 ms**; run2 `1461`, span **701 ms** |
| `c1…:131` | `fixture.sha256` is 64-hex | fixture bytes | receipt `fe5564b6…`; no fixture file is checked |
| `c1…:103` | `owned.source` matches `/children of this node process/` | any process fact | the string is a **literal** at driver `scripts/…:257` |
| `c1…:128-129` | `browserVersion`/`userAgent`/`binary` regexes | the live session | driver writes them at `:278-279, :247` — live values, but unverifiable by the counter |
| (absent) | driver digest | `frozenDigests` in claims.json | no counter reads any `frozenDigests` entry (grep: zero hits) |

Coverage detail (causal, not a rerun): driver `SAMPLE_MS=100` (`:38`), `POST_CLOSE_TAIL_MS=600` (`:39`, slept at `:319` after sampler is cleared at `:317`), `coverageMs = Date.now()-t0` (`:266`, `:321`). Eight samples at 100 ms cadence span at most 700 ms, so the predicate's "at least 8 socket samples per run over at least 1000 ms" is met only by counting the un-sampled 600 ms post-close sleep and launch time. The counter cannot see this because it reads the self-written `coverageMs`.

Parser detail (defensive, not an observed miss): `isLoopbackHexRem`/`decodeProcIp` (`driver :167-192`) accept 8-char non-hex tokens. Probe (`probe-proc-hex.txt`, functions copied verbatim): `GG00007F:8AEF` → loopback **true**, decoded `[127,0,0,null]`. A non-loopback row whose address token is malformed would be counted as loopback, so `nonLoopback` could read 0. Kernel-produced `/proc/net/tcp` rows are hex, so this is a robustness gap in the zero-egress accounting, not an observed egress.

### A-instances in C2 (sentence/measurement binding)

| Where | Check | Gap |
|---|---|---|
| `c2-routed-defects-v2.mjs:168-173` (D4) | `observedExit` numeric≠0; sentence string ≠ frozen; `shaPair` both 64-hex and unequal | no re-run, no check that shas are the real blobs; a forged receipt passes (CritC2ReceiptHonesty). Shape checks only. |
| `c2…:247-250` (D7) | `d.claims[1].predicate === PREDICATE_SENTENCE` | **positional**: `claims[1]` is never checked for `id === "C2"`; RevC2Counter demonstrated a non-C2 entry passing |
| `c2…:193-207` (D5) | receipt `rows/tier/status` parsed from text with regexes; compared with counter's own SOURCES parse | receipt is a free-text file; equality with a parse, no provenance |
| `c2…:223-225` (D6) | `git diff --numstat BASELINE..REV -- . :(exclude)receipt`, byte-compared with receipt body | **the only true recomputation** — but see Class B |

Verified current observations at HEAD: `census-end.txt` and `numstat-at-1ace2fde.txt` are **absent** (`git ls-tree` shows only `census-start*`); therefore C2 D5 and D6 are currently unevaluable and the C2 predicate is not met (`predicate=false`, findings `d5-receipt`, `d6-file`).

### B-instances

- **C2 D6 (`c2…:213-220`)**: the receipt must sit at REV and must contain the full 40-hex REV (`text.includes(REV)`, line 220). A commit's hash covers its tree, so a file in commit X cannot contain X's full hash. Therefore D6 is unsatisfiable at any single REV. This is corroborated by the scratch probe `measure/c2-self-reference-probe.txt` (carrier `5c13c846…` vs named candidate `03322e9d…`, failing again). I confirmed the logic from the source; I did not re-run the probe.
- **claims.json `frozenAt`**: the blob at `9c09ebb1` says `"frozenAt": "1f4260ae…"` (verified: `git diff 9c09ebb HEAD` shows `-1f4260ae` / `+9c09ebb`). The frozen artifact names a different commit than its own. Predicate text is unchanged; this is metadata, harmless to the counters, but it is the same containment pattern.
- C1 has **no** Class B instance: its receipt does not name REV. (The C1 receipt is read at REV, so there is no containment contradiction.)

## 3. Causal separability

**Predicate inputs are disjoint.** C1 reads only `corpus/evidence/round-39/playwright-egress/receipt.json` and the round-38 v1 receipt (plus git objects at REV). C2 reads `claims.json`, `baseline/*`, `measure/*`, `corpus/lessons/round-38.md`, `SCORECARD.md`, `LOG.md`, `corpus/SOURCES.md`, the round-37 w1 reports, and git diffs.

**Failure mechanisms are independent.** C2's `d5-receipt`/`d6-file` findings at HEAD come from missing measure files, and D6 is unsatisfiable irrespective of C1 correctness. Fixing C1's binding (e.g. driver digest check, sample-span check) does not change any C2 predicate term, and vice versa.

**Coupling exists only through the measurement window and shared REV:**
1. `git diff --numstat 3f42a5c7…..HEAD` contains **113** entries, including `counters/c1-egress-session-bound.mjs` (168 lines), `scripts/playwright-firefox-egress-round39.mjs` (384), `corpus/evidence/round-39/playwright-egress/receipt.json` (720), and `claims.json`. Only the numstat file itself is excluded (`:(exclude)`). So any C1 commit landing after the C2 numstat is taken invalidates C2 D6's body. This is the one real causal link: C2's measurement depends on C1's commits.
2. Census coupling is latent: `corpus/SOURCES.md` has 144 rows at baseline and at HEAD; S145 is in `assimilation/S145-open.txt` only. If C1's source is registered in SOURCES.md, C2 D5 counts shift.
3. Both counters evaluate at the same `--rev`, so a single carrier commit must satisfy both; this compounds Class B for C2.

Conclusion: the two claims are **causally separable in mechanism and predicate inputs**; they share a *process pattern* (verdicts trust committed self-reports and carrier-commit identity) and are **coupled only by the numstat window** (C1 artifacts inside C2's body). Neither failure is caused by the other.

## 4. Smallest corrections (not applied; for a future freeze, not this round)

- C1: recompute coverage from `samples[].t` span (≥1000 ms); require sample span ≥ (n−1)·cadence; validate `fixture.sha256` against fixture bytes; check driver digest from claims `frozenDigests`; make hex parsing strict (reject malformed tokens as non-loopback).
- C2: D7 must check `claims[1].id === "C2"` (and schema/round) as well as the predicate; D4 must re-execute the mutant control or verify an authenticated execution artifact; D6 needs a distinct evidence-carrier commit that names a pre-receipt candidate REV and reads bytes from that carrier's tree, or the receipt must be excluded from its own counted input without naming REV.
- Do not retrofit the frozen counter or claim after dispatch (per freeze rules).

## 5. Peer corroboration (not re-derived by me)

RevC1Receipt, RevC1Control, RevRunLive (C1 pass on live receipt); CritC1Samples (1/22 short-lived connection observation, cadence blind spot); CritC1ProcParse (malformed-hex classification, same as §2); RevC2Counter (D7 non-C2 identity probe); CritC2ReceiptHonesty (D4 forgery accepted); CritC2Semantics and RevD5D6 (D6 self-reference). These are cited as peer findings; I verified the source lines and the coverage/parse/self-reference arithmetic above independently.

## 6. Evidence index

- `w1/ConnPattern/c1.json`, `c2.json`, `c2-mutant.txt`, `probe-proc-hex.txt`
- Source: `counters/c1-egress-session-bound.mjs:98-131`; `counters/c2-routed-defects-v2.mjs:168-173, 213-228, 247-250`; `scripts/playwright-firefox-egress-round39.mjs:38-39, 167-192, 257, 266-279, 317-321`
- Receipt: `corpus/evidence/round-39/playwright-egress/receipt.json` (runs[0].samples, runs[1].samples, coverageMs, owned.source)

VERDICT finding — shared class A (committed self-attestation: C1 coverage/fixture/driver binding; C2 D4/D5/D7) and class B (containment: C2 D6 unsatisfiable at any REV). Claims are causally separable in predicate inputs and failure mechanisms, coupled only via C2's numstat window containing C1's commits.
