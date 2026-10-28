# CritC1Witness — witness-only forgery bound on C1 counter v4

Seat: `CritC1Witness` (witness forgery bound, round 42 w1). Leaf; no subagents; no git/jj
mutation; no writes outside this seat dir and `/fast/scratch/hyaku/tabi-r42/CritC1Witness`
(deleted at yield). No tool installs (no pacman/uv/cargo/npm used).

Attacker model per assignment: **cannot run the measure wrapper (no wrapper nonce), can write
files, can invoke counter v4 directly.** Goal: build the strongest forged receipt+witness
pair and report whether counter v4 returns `predicate true`.

## Frozen instrument identity (what I ran)

```
$ sha256sum .ufo/waves/round-41/counters/c1-session-bound-v4.mjs .ufo/waves/round-41/claims.json \
    corpus/evidence/round41/playwright-egress/receipt.json \
    corpus/evidence/round41/playwright-egress/receipt.witness.json
cd71a59efa575fc260c4e487b7d52f69a9cd9f3b98bc6d4333abdb9a0cff126a  .ufo/waves/round-41/counters/c1-session-bound-v4.mjs
1cb59576b42a0335d69282a2c00bae88a770d45a86f84d07d2f616527ab3330e  .ufo/waves/round-41/claims.json
416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1  corpus/evidence/round41/playwright-egress/receipt.json
d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3  corpus/evidence/round41/playwright-egress/receipt.witness.json
```

Counter digest equals `frozenDigests['.ufo/waves/round-41/counters/c1-session-bound-v4.mjs']`
in r41 `claims.json`, so the instrument is the frozen one, unmodified. At `HEAD = 0081bfd…`
the r41 receipt and witness **are committed** (`git cat-file -e HEAD:…` succeeds); the round-42
receipt is **not** committed (`git ls-tree -r --name-only HEAD -- corpus/evidence/round42/…`
lists nothing; the file exists only in the working tree).

## Result: counter v4 returns `predicate true`, `findings []`, exit 0 on forged bytes

Baseline sanity (real committed r42 bytes, real nonce, real pins) — exit 0, so the invocation
shape is representative:

```
$ N=$(python3 -c "import json;print(json.load(open('corpus/evidence/round42/playwright-egress/receipt.json'))['runNonce'])")
$ node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs \
    corpus/evidence/round42/playwright-egress/receipt.json --nonce "$N" \
    --witness corpus/evidence/round42/playwright-egress/receipt.witness.json \
    --pins .ufo/waves/round-41/claims.json --measure .ufo/waves/round-41/measure/c1-measure.json
exit=0
```

| Tier | Base | Counter exit | predicate | findings | Browser run |
|---|---|---|---|---|---|
| T1 | verbatim committed r41 receipt+witness, fresh nonce | 1 | false | `['run-nonce-mismatch','witness-nonce-mismatch']` | none |
| T2 | committed r41 receipt+witness, **nonce patched in 4 places** | **0** | **true** | **`[]`** | none |
| T3 | fully synthetic (fabricated pids, synthetic epoch) | **0** | **true** | **`[]`** | none |
| P5/P6 | T3 with every unread field stripped | **0** | **true** | **`[]`** | none |

Exact commands (all from the scratch dir; counter is absolute, pins are the frozen claims):

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/counters/c1-session-bound-v4.mjs \
  <receipt> --nonce <nonce> --witness <witness> \
  --pins /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/claims.json --measure <measure>
```

Outputs recorded verbatim in `t1.out.json`, `t2.out.json`, `t3.out.json`, `mutants.out`,
`probes.out`, `p6.out` in this seat dir.

No browser was launched by this seat: the only firefox on the host during my work is
`pid 785258`, started `Tue Oct 27 14:42:21 2026` (25 h before this seat ran); my forged
receipts name `pid 9000001/9000002`, which do not exist in `/proc`.

## Exact minimal edits that reached predicate true

### T2 — four scalar writes on committed bytes (no browser)

Structural walk of the two documents (script inline in session, output in `t2-edits.txt`)
finds exactly four differing scalars and nothing else:

```
receipt.json  /runNonce          78df30b0…5b8f -> cefeef81…9536
receipt.json  /runs[0]/runNonce  78df30b0…5b8f -> cefeef81…9536
receipt.json  /runs[1]/runNonce  78df30b0…5b8f -> cefeef81…9536
witness.json  /nonce             78df30b0…5b8f -> cefeef81…9536
```

Result: `exit=0 predicate=True findings=[]`. The forged receipt sha256 is
`3579ac7159a2404a34d0d94bcb6b41a4c2e529a295f4ce4300564e82b17f5f6a`, witness
`16810f079df8b8e67b350b4b76135f3c5b9d3adcc576882d022906ad9cadb8fc`. The committed r41
receipt is a real run, but the nonce in it is a **writable scalar**, so "fresh nonce carried
by the receipt and both runs" is satisfied by typing a new string in four places.

### T3 / P6 — fully synthetic, zero real-run bytes

`forge.py` emits a 13 089-byte receipt, 5 445-byte witness, 299-byte measure doc; `probes.py`
P6 shrinks the pair to **6 752-byte receipt + 1 325-byte witness** (`p6.r.json`,
`p6.w.json`) with:

- two runs × 8 samples, `t` on a synthetic epoch (`1.8e12` ms), 200 ms apart → 1400 ms spans,
  spanSum 2800 ms, forged `elapsedMs` 3400 (satisfies `elapsedMs >= spanSum + 500`);
- `ss`/`proc` per sample `{ticks:1, nonLoopback:0, ssObs/procObs:1}`, `finalSweep` usable,
  `sockets.ss.observations == Σ ssObs` and same for proc, `egressNonLoopback == 0`;
- `treePids` = one entry `{pid:9000002, startTicks:tTicks-5, exe:<firefox pin path>}`;
- `owned.roots` = one firefox-binary root inside the run window; `survivors 0`,
  `survivorPids []`, `portClosed true`, `browserVersion "157.0"`, one shared
  `firstShotSha256` (`sha256("forged-shot")`);
- witness: 10 **identical** samples, no timestamps, `tree = [{pid:9000002, ppid:9000001,
  exe:<firefox pin path>}]`, `environ: []`; nonce echoed.

`p6.out`: `bytes 6752 1325` / `exit 0 predicate True findings []`.

The fabricated pids are absent from `/proc`, the timestamps are a year off `measuredAt`, and
none of it was produced by a process — counter v4 accepts it.

## Every refusing finding I could provoke, and the binding behind it

`mutants.py` (base = the already-true synthetic pair; full output `mutants.out`):

| Mutant | exit | findings | binding that works |
|---|---|---|---|
| m1 receipt nonce changed only | 1 | `run-nonce-mismatch` | receipt-level nonce echo vs `--nonce` |
| m2 witness nonce changed | 1 | `witness-nonce-mismatch` | witness nonce echo |
| m3 `startTicks` before `runStartTicks-25` | 1 | `run1-sample1..8-pid-stale`, `run1-root-stale` | ticks lower bound |
| m4 `startTicks` after `tTicks+25` | 1 | `run2-sample4-pid-future` | ticks upper bound |
| m5 `elapsedMs` too small | 1 | `wall-clock-inconsistent` | measure doc span coverage |
| m6 span 350 ms | 1 | `run1-sample-span`, `run2-sample-span` | ≥1000 ms span |
| m7 witness 9 samples | 1 | `witness-samples`, `witness-driver-unseen`, `witness-no-owned-firefox` | witness sample floor |
| m8 witness trees without firefox | 1 | `witness-no-owned-firefox`, `witness-no-overlap` | witness ff descendant |
| m9 zero socket observations | 1 | `run1/2-zero-ss-observation`, `…-zero-proc-observation` | F1 floor |
| m10 one nonLoopback socket | 1 | `run1-sample1-ss-egress`, two summary mismatches | egress arithmetic |
| m11 wrong schema | 1 | `schema` | schema string |
| m12 tampered producer digest in a pins file | 1 | `digest-mismatch:scripts/measure-c1-round41.mjs` | digest equality to real file bytes |

These are **self-consistency** bindings: each refuses only a careless forger. None binds the
bytes to a live process, a kernel surface, or an out-of-band secret.

## Bindings that do not exist (probes that stayed true)

| Probe | exit | predicate | Why |
|---|---|---|---|
| m13 `--pins` = `{"frozenDigests":{},"producerPins":{}}` | **0** | true | the pins are an **argv input**; the counter never hashes its own pins file, and every digest branch is `if (pin) …` — an empty pins object disables the only binding to the frozen producer tree |
| m14 witness tree without the driver pid (`ppid` edge only) | **0** | true | `desc` is seeded with `nodePid`, so `desc.has(nodePid)` is true before any tree is read: `witness-driver-unseen` is unreachable, and the "independent witness observed the driver pid" clause is a tautology |
| m15 both runs share one `nodePid`/root pid | **0** | true | no per-run process-identity requirement |
| P1 zero other witness entries | **0** | true | a witness tree of one firefox pid suffices |
| P2 strip `measuredAt`/`playwrightVersion`/`fixture`/`userAgent`/`browserVersion`/`driver` | **0** | true | these are never read |
| P3 ten identical witness samples | **0** | true | no time progression or diversity requirement on the witness |
| P4 both runs on one timestamp base | **0** | true | runs are not required to be temporally disjoint |
| P5/P6 minimal pair (6752 + 1325 B) | **0** | true | only the fields the code reads are needed |

Structural confirmation — the counter's entire external read set:

```
$ grep -n "readFileSync\|execSync\|spawn\|child_process\|git \|statSync\|/proc" \
    .ufo/waves/round-41/counters/c1-session-bound-v4.mjs
25:  const raw = fs.readFileSync(file, 'utf8');
103:    try { witness = JSON.parse(fs.readFileSync(witnessFile, 'utf8')); } catch { }
137:        try { if (sha256(fs.readFileSync(`…/${k}`)) !== digests[k]) …
147:        try { if (sha256(fs.readFileSync(e)) !== ffPin) …
153:      try { if (sha256(fs.readFileSync(process.execPath)) !== nodePin) …
180:try { if (pinsFile) pins = JSON.parse(fs.readFileSync(pinsFile, 'utf8')); } catch { …
182/183: … measureArg …
```

There is no `child_process`, no `git`, no `/proc`, no `statSync`, no clock call. The counter
reads argv-named files plus three producer files, the pinned firefox binary and
`process.execPath`. It is a schema/arithmetic validator, not a run observer: **nonce
provenance cannot be checked at this layer**, because the nonce arrives as `--nonce`
(argv) and is only compared for echo.

## Scoping to the counting command (the wrapper) — what still holds

Reading `scripts/measure-c1-round41.mjs` (digest-pinned, unmodified) for the wrapper path:

- `if (fs.existsSync(outPath)) → exit 1 'output-already-exists'` — a **pre-written** receipt
  at the target path is refused before anything spawns.
- `const nonce = crypto.randomBytes(32).toString('hex')` and
  `if (!nonceMatches) refuse('fresh-run-nonce-mismatch')` before scoring — a forger who does
  not know the wrapper's nonce cannot make the receipt match.
- `--pins CLAIMS` is the hardcoded frozen path, so the m13 pins substitution is unavailable
  through the wrapper, and the driver digest is checked at §Stage 1.
- Stage 3 spawns the counter with the same `outPath` and `nonce`; exit is
  `run.status === 0 && cRun.status === 0 && counter.predicate === true`.

Therefore, **under the assigned attacker model** (no wrapper run, no wrapper nonce) a
pre-written forgery reaches the counter's exit 0 but **not** the wrapper's exit 0. The
wrapper's freshness anchor is the only thing standing between the claim and fabrication, and
it is not visible in the counter's verdict.

[INFERENCE from code, not exercised] Two residual wrapper-path gaps worth naming, both
requiring a real driver run and therefore outside the do-nothing bound: (a) the wrapper reads
and hashes the receipt at Stage 2 (`receiptSha256`) but the counter **re-reads `outPath`
itself** (counter line 25) and the wrapper never passes `receiptSha256` into the counter's
stdin measure doc — a concurrent writer can swap the file in the interval between the
wrapper's nonce check and the counter's read and reintroduce arbitrary (but nonce-echoing)
content; (b) the counter's `witness-driver-unseen` clause is vacuous (m14), so the witness's
"independent" driver observation adds no evidence even on the wrapper path.

## Consequence for C1 (reported, not judged)

The frozen C1 predicate sentence names, as a conjunct, "counter exit 0, predicate true and
empty findings", and the frozen kill rule names "a forgery or counter hole that produces exit
0 without a browser run". I observed exactly that: counter v4 exits 0 with `predicate true`
and `findings []` on (i) four scalar writes over committed r41 bytes and (ii) a 6.7 KB
synthetic pair, with no browser run. So a settled seat citing counter v4's `predicate true`
as its C1 evidence has demonstrated nothing about a browser having run. Under the assignment's
wording the do-nothing chain exists and C1 must not be admitted on counter output alone; the
counter conjunct is not evidence, while the wrapper's exit 0 is not reachable do-nothing under
the modeled attacker. C1's verdict, and whether admission may rest on the wrapper conjunct
alone, are the canonical judge's call.

## Smallest safe correction (ordered, smallest first)

1. **Hand the counter the bytes the wrapper verified**: put `receiptSha256` (already computed
   at `readFileSync`+`sha256` in the wrapper) and the wrapper's `nonce` into the stdin measure
   doc, and have the counter refuse unless `sha256(raw) === measureDoc.receiptSha256` and
   `measureDoc.nonce === nonce`. This binds the scored bytes to the wrapper's post-driver read
   and closes the re-read window.
2. **Hardcode the pins in the counter** (the three producer digests, firefox-bin, node) instead
   of reading `--pins`; or hash the pins file against a digest baked into the counter. Kills
   m13, which otherwise disables every digest binding.
3. **Make the witness driver clause non-vacuous**: require `nodePid` itself to appear as a tree
   entry in every witness sample (not merely as the BFS seed), and require per-run distinct
   pid identity. Kills m14/m15.
4. **Read live kernel state for the named pids**: have the counter `stat`/`read /proc/<pid>`
   for `owned.nodePid` and `owned.roots[].pid` and refuse when absent or when `startTicks`
   differs from the record (and `statSync` mtime/ctime inside the measure window). This is the
   only in-band-immune check against T3/P6's invented pids, but it still cannot distinguish a
   replay of a real run — nonce origin must stay verifier-chosen, i.e. the wrapper conjunct is
   load-bearing and should be named as such in the predicate text.
5. Do not amend the frozen bytes for this round; route 1–4 as findings.

## Limitations / not evaluated

- The forged pairs are **not committed**; I have no commit rights and did not attempt one. The
  reach demonstrated is at the counter layer, which is the layer that emits the predicate.
- I did not run the wrapper or any browser (witness-only model), so the wrapper-path claims
  above are code-read, marked `[INFERENCE]` where not executed.
- I did not attempt to modify producers, the counter, or the firefox binary; m12 shows the
  digest check refuses such modification when a real pins file is supplied by the caller.
- Counter behaviour under `--measure -` (stdin) was only exercised via files; the stdin path
  parses identically (`readFileSync(0)`), not separately re-testified.
- No tool installs or upgrades were needed or performed.

## Evidence (this seat dir, sha256)

```
560c0d93…  p6.r.json                    (6752 B minimal synthetic receipt)
dc75fa32…  p6.w.json                    (1325 B minimal synthetic witness)
5fba56b3…  t3.witness.json              (5445 B)
8da8791d…  t3.receipt.json              (13089 B)
5902f510…  t3.measure.json              (299 B)
c929398d…  t2.out.json                  (counter: exit 0, predicate true, [])
3be0bf40…  t3.out.json
78453cad…  t1.out.json                  (counter: exit 1, run-nonce-mismatch, witness-nonce-mismatch)
c82a1127…  mutants.out                  (m1–m15 refusal matrix)
fa7f4754…  probes.out                   (P1–P5 minimalism)
521b9ae6…  p6.out
a994ac2a…  t2-edits.txt                 (the four scalar edits)
280a3531…  forge.py   e2856880… mutants.py   94b027c5… probes.py
5fcbbdfb…  pins-empty.json              (m13 input that disables digest checks)
79278635…  pins-tampered.json           (m12 control)
```

VERDICT finding counter v4 returns predicate true, findings [], exit 0 on a 4-scalar nonce patch of committed r41 bytes and on a 6.7 KB fully synthetic receipt+witness with no browser run; the wrapper's own random nonce and hardcoded pins are the only remaining barrier, and the witness driver-observation clause plus the pins input are vacuous (m13/m14).
