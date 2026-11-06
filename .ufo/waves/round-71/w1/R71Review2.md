SOUND

# R71Review2 — review of `verify-live-r71.mjs`, attack-harness.mjs, evaluate-c2.mjs (round 71, C2)

Reviewer: R71Review2 (leaf, non-author). Date 2026-11-06. No lane file edited; all probes ran
against frozen bytes in my scratch. Receipts beside this file under `receipts/`.

## Byte identity

| file | sha256 (measured) | frozen |
|---|---|---|
| scripts/verify-live-r71.mjs | `61f43596e28fdec78b275de495f252f7881ce9882b9079d7191d84413c73f333` | freeze.txt:6 ✓ |
| scripts/verify-live-r70.mjs | `99442a2c385387148d12167072cafb764590def99ef0172e41c0f90ed75376b8` | freeze.txt ✓ (also matches r70 closure record) |
| controls/c2/attack-harness.mjs | `33e1bd1b98cfcb2748bf0e521a26f9df4d29c63173f348aa8ebe08392d224512` | freeze.txt ✓ |
| controls/c2/evaluate-c2.mjs | `3c3a83dcb37e2fbe048e9206b92567ae7d1e54c73095c1a8fcd82afd1c778716` | freeze.txt ✓ |

Continuity across the freeze: `git diff --stat 711a38c2 04f4330f` touches only claims.json
(+74), and `git show 711a38c2:scripts/verify-live-r71.mjs | sha256sum` = `61f43596…` — the
pre-freeze controls (pre-r70, pre-r71, donothing-r70-bytes, blanket-*) were executed against the
exact bytes that got frozen. Node on this host: v24.21.0.

## 1. verify-live-r71.mjs vs verify-live-r70.mjs (diff verdict)

Complete delta (everything else is logic-identical, including pins, nonces, ports, fingerprints,
exit codes 0/1/2/4, socket-length guard, internal-error catch):

1. **(E) env gate** — `INJECT_ENV = /^(NODE_OPTIONS|NODE_PATH|NODE_REPL_EXTERNAL_MODULE|LD_PRELOAD|LD_AUDIT|LD_LIBRARY_PATH|DYLD_[A-Z_]+)$/`
   (verify-live-r71.mjs:43), checked before any byte is read or launched; `env-injection`, exit 2.
   Plus exec-argv refusal (any `process.execArgv`, exit 2).
2. **(S) snapshot** — after pins: `mkdtempSync(scratch/snap-)` → chmod 0700; driver+counter bytes
   written mode 0500 flag `'wx'` (:117-121); **every** execution (evidence counter, both runs,
   per-run counters) spawns the snapshot, never a lane path; re-hashed at `after-write`,
   `before-run-a`, `before-run-b`, `after-runs` → `snapshot-mutated`.
3. **allow-listed child env** — `childEnv()` = `{PATH:'/usr/local/bin:/usr/bin:/bin', LANG:'C.UTF-8', HOME:scratch, TMPDIR:scratch}` (:130); driver run overrides `TMPDIR: work`. No inherited
   variable of any name reaches a child, so chromium inherits only these (driver does
   `env: {...process.env, ...runXdg}` at chrome-cdp-synthtap-round70.mjs:252 — clean by
   construction under r71).
4. **(W) wall floor** — `wallFloorMs: 6000` per profile; pushed before the exit-status check, so
   a fast failed run is flagged too.
5. **(O) stdout binding** — per-profile keys; tap `['schema','predicate','synthTapHypothesis','legShape','teardown']`, scroll `['schema','predicate','synthScrollHypothesis','legs','pageState','teardown']`;
   JSON-equality stdout-vs-receipt per key → `run-<n>-stdout-mismatch`. Keys verified to exist in
   the drivers' printed summaries (tap driver :375 prints all five tap keys).
6. runCounter executes `snapCounter`; `newFile` binding drops r70's `existedBefore` disjunct —
   equivalent, because r71 (like r70) `rmSync`+`mkdir`s the run dir before the spawn.

**Every r70 check survived**: driver-pin/counter-pin (exit 2), no-run (exit 1), evidence counter
against the FROZEN pin, two cold runs on verifier-drawn nonces/ports, binding
newFile/nonce/driverDigest/cdpPort/httpPort, per-run counter, cross-run launchToken+nonce
identity, cross-run and evidence fingerprints, socket-length refusal, override ⇒ pinSource
override ⇒ exit 4 (never a pass). Measured floors are safe: real runs 11.4-13.8 s
(pre-r71/summary.json), do-nothing 19-26 ms.

## 2. Env-refusal completeness (assignment questions, all probed)

Probed on the frozen verifier with `--no-run --json` (receipts/env-probe.txt):

| var | refused? | honored by | impact here |
|---|---|---|---|
| `NODE_OPTIONS` | yes (exit 2 env-injection; pre-r71 rows confirm) | node | closed |
| `NODE_COMPILE_CACHE` | **no** (`injected: []`, proceeds) | node v24.21.0 (probe: cache dir `v24.21.0-x64-964aae3f-1000/` written) | N1 below |
| `NODE_V8_COVERAGE` | no | node | inert: writes diagnostics, no code exec, no child inherits it |
| `NODE_EXTRA_CA_CERTS` | no | node | inert: no TLS anywhere (drivers speak loopback http, absolute `/usr/bin/curl`) |
| `UV_*` (probed `UV_THREADPOOL_SIZE`) | no | libuv | inert: tuning only |
| `LD_PRELOAD`/`LD_AUDIT`/`LD_LIBRARY_PATH` | yes | glibc | closed; other `LD_*` (`LD_BIND_NOW` probed) inert |
| `BASH_ENV` | no | bash only | **unreachable**: no shell anywhere in the chain — verifier spawns argv-arrays (no `shell:`), drivers spawn `ps`/curl/chromium argv-arrays, chromium helpers are execve; and children get the allow-list env anyway |
| PATH lookups | n/a | drivers | `ps` is the only bare-name external (tap :118, scroll :141); allow-list PATH = `/usr/local/bin:/usr/bin:/bin`, both dirs `root:root 755` (verified) → same-user cannot shadow; `curl` and chromium are absolute (`/usr/bin/curl` tap :234, `/usr/bin/chromium` tap :84) |

**N1 (low, hardening-completeness — inside the frozen claim's declared limit):** `NODE_COMPILE_CACHE`
is node-honored, attacker-pointable, absent from `INJECT_ENV`. Repro (no lane write):
`NODE_COMPILE_CACHE=<attacker dir> node scripts/verify-live-r71.mjs --profile synthtap-r70
--scratch <s> --no-run` → exit 1 `no-run` with `env.injected: []` — the (E) gate does not see it.
A seeded cache payload is deserialized into the verifier's own process; exploiting that for code
exec requires crafting V8 code-cache data (unkeyed checksums only) [INFERENCE — not demonstrated].
The frozen claims `limit` sentence explicitly places "runs inside the verifier process" out of the
predicate's reach, so this does not defeat the claim; it is the one concrete `NODE_OPTIONS`
alternative I found for a future `INJECT_ENV` revision. Same bucket, cheaper fixes:
`NODE_V8_COVERAGE`, `NODE_EXTRA_CA_CERTS`, `UV_*`.
Also note (availability cost, not a hole): the exec-argv gate refuses benign flags like
`node --max-old-space-size=4096 verify-live-r71.mjs` with exit 2; scored flows use none.

## 3. attack-harness.mjs + evaluate-c2.mjs

**Classification is decided for the right reason:**
- `FALSE-PASS = exit 0 AND marker non-empty`: the marker is appended only when attack code
  executes inside a run (preload arms only on driver basename; do-nothing appends at entry).
  pre-r70: all four attacks FALSE-PASS with marker lines — matches pre-r70/summary.json
  `falsePass 4, positivesOk true`.
- `NOT-LANDED` is counted separately and never as refusal credit; the evaluator additionally
  demands `notLanded 0`, so a verifier that refuses before run-a cannot farm B/C (blanket-refuse
  proves it: B/C NOT-LANDED → exit 1).
- `REFUSED` rows must carry their frozen finding id in `findings` (evaluator checks), so a
  node-level crash under the attack env (no JSON) or a straw `refuse-all` cannot score
  (blanket-refuse: `findings ["refuse-all"] lack env-injection`).
- B-swap-tap `HONEST-PASS` for r71 is right: the swapped lane file is never executed (runs use the
  snapshot); pre-r71 shows the swap landed, marker empty, honest 13.1/12.9 s runs, exit 0.
- C-swap-run-b-tap is refused for the right reason with triple corroboration (pre-r71):
  `findings ["snapshot-mutated","run-b-wall-floor","run-b-stdout-mismatch"]`, run-b 19 ms, marker
  line proves the do-nothing executed as the swapped snapshot copy.

**Pre-freeze controls all refuse for the right reason** (each eval.json quoted in the report):
- pre-r70: `verifier verify-live-r70.mjs is not the generation under claim` + 4×FALSE-PASS + missing
  expected findings → exit 1.
- donothing-r70-bytes (r70 bytes under the r71 **name**): passes the name check, still fails on the
  four attack classes/findings (`falsePass 4`) → the evaluator judges behavior, not labels. Exactly
  the intended reason.
- blanket-refuse: positives REFUSED + `refuse-all` lacks expected ids + swaps NOT-LANDED → exit 1.
- blanket-accept: env attacks HONEST-PASS instead of REFUSED + swaps NOT-LANDED → exit 1.
- pre-r71 (frozen bytes, pre-freeze commit): holds=true — legitimate, because the bytes are
  unchanged into the freeze (see byte identity).

**F2 (low, trust boundary):** the chain "summary ⇒ frozen bytes" is procedural, not bound. The
harness records only the filename (`summary.verifier: "verify-live-r71.mjs"`), never the sha256 of
the verifier file it executed, and the evaluator is a pure function of the `--summary` file — no
schema, no digest check. Repro (no lane write; receipts/fabricated-summary-repro.txt): a
hand-written summary with the six allowed rows scores
`C2-EXEC-BOUND holds=true … exit=0` on the frozen evaluator. A broken verifier or a summary from
any mutated copy therefore scores holds unless someone checks the freeze. Enforcement currently
rests on the freeze kill rule ("any pinned instrument byte changes after the freeze: killed") and
on L1/seat discipline. One-line fix for the next generation: harness records
`verifierSha256` (and evidence digests) per row; evaluator verifies against freeze.txt.

**Mechanism vs behavior:** the evaluator binds finding strings and exit codes, not mechanisms. A
verifier that passes the six rows via weaker equivalent means (e.g. fs.watch on scratch instead of
re-hashing) is indistinguishable to the harness. Not exploitable for the frozen claim (frozen bytes
do real re-hashing; a changed verifier byte trips the kill rule), but worth knowing: the harness
proves the four named attacks fail, nothing stronger — exactly what claims.json says
("the harness measures exactly the four named attacks").

**Minor coupling (safe direction):** the C watcher hardcodes the `snap-` prefix; a compliant
verifier that named its snapshot differently would get C=HONEST-PASS and *fail* the claim (false
negative). No false-positive path exists through it.

## 4. Every way the predicate could hold without the claimed hardening

Within the frozen `limit` sentence (declared, not defects):
1. **Code running inside the verifier process** — any off-list env vector; the concrete instance is
   `NODE_COMPILE_CACHE` (N1, probed). The A-env-style forger could equally ride it instead of
   NODE_OPTIONS; the harness only tests NODE_OPTIONS, so a verifier refusing only NODE_OPTIONS
   scores holds.
2. **Snapshot rewrite between two hash reads** — swap in the window after
   `snapCheck('before-run-b')` and the execve. To then survive (W)/(O)/(counter) the do-nothing
   must sleep ≥6.1 s, print the five stdout keys matching the receipt, and ship a template forgery;
   the pinned counter demonstrably accepts template forgeries (pre-r70 B-swap FALSE-PASS had
   clean per-run counters). Full chain is the declared limit sentence, verbatim.
3. **Patching the verifier file itself** — declared; freeze kill rule is the control.

Outside the declared limits: none found. The four mechanisms are real bytes doing real work
(snapshot+re-hash, allow-list env, floor, stdout binding), each independently corroborated by the
pre-r71 C-swap row's three findings.

## Residual risk & verification gaps

- I did not re-run the 6-attack harness myself (R71Exec2's cold run is the scored instance; my
  behavioral evidence is the four pre-freeze summaries + byte continuity + the two cheap probes).
  No lsp server answered for this repo, so all caller/definition checks are text-level (recorded
  per the standing rule).
- N1 and F2 are the only defects found; both are inside the frozen claim's declared scope, neither
  blocks C2-EXEC-BOUND. Recommended for r72: add `NODE_COMPILE_CACHE` (+`NODE_V8_COVERAGE`,
  `NODE_EXTRA_CA_CERTS`, `UV_THREADPOOL_SIZE`) to `INJECT_ENV`; have the harness record and the
  evaluator check the executed verifier's sha256.

## Reproduction commands

```sh
# N1: NODE_COMPILE_CACHE sails through the (E) gate
NODE_COMPILE_CACHE=/fast/scratch/hyaku/tabi-r71/R71Review2/nccprobe \
  node scripts/verify-live-r71.mjs --profile synthtap-r70 \
  --scratch /fast/scratch/hyaku/tabi-r71/R71Review2/envprobe/v --no-run --json
#  → exit 1, findings ["no-run"], env.injected []   (NODE_OPTIONS would exit 2 env-injection)

# F2: fabricated summary scores holds on the frozen evaluator
node .ufo/waves/round-71/controls/c2/evaluate-c2.mjs \
  --summary /fast/scratch/hyaku/tabi-r71/R71Review2/fake-summary.json   # → holds=true, exit 0

# byte continuity
git diff --stat 711a38c2 04f4330f                      # only claims.json
git show 711a38c2:scripts/verify-live-r71.mjs | sha256sum   # 61f43596…
```
