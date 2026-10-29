# MutDriverEgress — round-43 C1 egress-count mutation (seat report)

**Axis:** calibration. **Milestone:** mutation — zero all `nonLoopback` counts and
`nonLoopbackRemotes` in the round-43 egress driver (simulate a lying driver).

**Verdict: the egress-count clause is NOT load-bearing against a lying driver.**
The mutant SURVIVES. The decisive measurement is a live differential through the
**genuine chain** — wrapper-generated per-invocation Ed25519 key, real Firefox,
real witness, real fd3/fd4 challenge-response — run with the pristine producer
and with the lying producer in the same egress-producing window on this host:

| | PRISTINE producer | LYING producer |
|---|---|---|
| counter exit | **1** | **0** |
| predicate | **false** | **true** |
| egress-clause findings | **45** | **0** |
| other findings | `[]` | `[]` |

The honest producer observed 45 real non-loopback observations and was
REFUSED; the lying producer reported zero and was ADMITTED. The egress-count
clause is the only clause in the predicate that speaks about egress, and
zeroing the counts removed every trace of it from an admitted receipt. The
clause's failing state is **fixture-buildable** (plantable, browser-free), so
this blind class is closable with two deterministic committed controls. This is
a control-set calibration gap, **not** an in-model do-nothing reach: the frozen
producer byte-pin still refuses the mutated bytes before the browser spawns.

**Scope.** The "no kill-rule trigger" statement applies to **this seat's arm**
only, not to C1 as a whole: siblings `ScribeEntryAuth` (F1) and
`CritC1ReachSynth` report a *different* class — a fully synthetic self-signed
pair reaching `predicate: true` with no browser run — which ScribeEntryAuth
classifies as a kill-rule trigger for C1. That is theirs to adjudicate; this
seat reproduces the mechanism (P9) and routes it without claiming it. The two
findings are **complementary, not duplicative**: F1 attacks the measure
document's *provenance*, this arm attacks the receipt's *observation content*,
and closing either alone leaves the other open (finding 7).

## 1. The mutation (exact, minimal, two sites)

Source: `scripts/playwright-firefox-egress-round43.mjs` (canonical sha256
`3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e`), copied to
scratch and mutated there. The canonical file was never modified.

Full diff — `evidence/mutant.diff` (also `evidence/mutant-driver.mjs`):

```diff
--- pristine/driver.mjs
+++ mutant/driver.mjs
@@ -169,7 +169,7 @@
     const peer = f[4] || '';
     if (!isLoopbackPeer(peer)) { nonLoopback += 1; nonLoopbackRemotes.push(peer); }
   }
-  return { ticks: 1, lines: lines.length, nonLoopback, nonLoopbackRemotes };
+  return { ticks: 1, lines: lines.length, nonLoopback: 0, nonLoopbackRemotes: [] };
 }
 
 // --- socket observation, surface 2: /proc fd inodes x /proc/net/tcp{,6} ------
@@ -248,7 +248,7 @@
       }
     }
   }
-  return { ticks: 1, inodes, nonLoopback, nonLoopbackRemotes };
+  return { ticks: 1, inodes, nonLoopback: 0, nonLoopbackRemotes: [] };
 }
```

Mutant sha256 `cbd8d65e2a0ac8d0e6f54fede992dd2303f73beaa9c1f9cdf1ae9c6734e41d77`
(23 385 bytes vs 23 371). Two edits, both at the two `observe*()` return
statements — the only place the counts are produced. Zeroing at the SOURCE is
the faithful "lying driver": every downstream aggregate (`sockets.ss.nonLoopback`,
`sockets.proc.nonLoopback`, `egressNonLoopback`, the receipt-level
`egressNonLoopback`) is then DERIVED from the zeroed values and is therefore
internally consistent, which is exactly the receipt shape the seat asks to test.
Zeroing only the aggregates would leave the per-sample counts intact and would
not be a lie at all.

**Driver-level unit proof that the mutation does what it claims** (browser-free,
identical synthetic observation fed to both copies — one `ss` line with peer
`203.0.113.7:443`, one `/proc/net/tcp` ESTABLISHED row `077F01CB:01BB`, one
`/proc/<pid>/fd/5 -> socket:[4242]`):

| copy | `ss.nonLoopback` | `ss.nonLoopbackRemotes` | `proc.nonLoopback` | `proc.nonLoopbackRemotes` |
|---|---:|---|---:|---|
| pristine | 1 | `["203.0.113.7:443"]` | 1 | `["203.1.127.7:443"]` |
| mutant | 0 | `[]` | 0 | `[]` |

Both surfaces flip; `lines`/`inodes` (the observation counts) are unchanged, so
the counter's F1 "zero-observation" guard still sees owned sockets.

## 2. The load-bearing test (paired differential, same physical run)

The seat's criterion: *the clause is load-bearing iff the mutated copy GREENS
(or loses the named finding on) input the frozen bytes refuse.* So the test needs
an input the frozen bytes REFUSE — i.e. a receipt with real egress — and the
mutated twin of it.

Input: the sibling seat `SentEgressAudit`'s honest live run
(`.ufo/waves/round-43/w1/SentEgressAudit/failed-run-1/receipt.json`), which
records **46 genuine non-loopback egress observations** in run 1 (`ss` 23 +
`proc` 23, `egressNonLoopback: 46`), zero in run 2. Copied read-only to scratch;
`sibling-real-egress-measure.json` is that run's own measure record.

Arm A — pristine receipt (frozen bytes):

```
node .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
     <scratch>/out/REAL_egress.json --measure <scratch>/out/PAIR_true.measure.json
```

→ counter **exit 1**, `predicate: false`, **46 findings, all of them
`run1-sampleNNN-{ss,proc}-egress`** (samples 111–133), `egressDetail` populated
with 46 entries (`evidence/P16_PAIR_true.json`).

Arm B — the SAME receipt with the seat's mutation applied at the receipt level
(all 46 counts zeroed, all `nonLoopbackRemotes` emptied, every aggregate
recomputed from the zeroed values — precisely what the mutated driver writes
for that run; `evidence/real-egress-mutated-receipt.json`):

→ counter **exit 0**, `predicate: true`, **`findings: []`**, `egressDetail: []`
(`evidence/P17_PAIR_mutated.json`).

Both arms use the same canonical repo producer digests and the same witness; the
only difference between the two receipts is the egress counts and the receipt
hash bound inside each measure record.

**46 egress findings → 0. predicate false → true. The mutated copy greens the
input the frozen bytes refuse. The egress-count clause is NOT load-bearing
against a lying driver.**

**Scope of this arm (stated precisely, at sibling `ScribeEntryAuth`'s
challenge).** The two measure records here are self-signed by this seat's
harness, and the harness answers the counter's fresh challenge with the
corresponding private half — so the *admission* of the mutated twin rides on a
forger-minted key. Two things follow, and both are separated in this report:

- The **egress-clause finding count** (46 → 0) is a property of the RECEIPT
  CONTENT and is independent of who signed the measure record. Under the
  sibling's own genuinely wrapper-signed measure record, the unmutated receipt
  produces 46 egress findings (P14) and the zeroed twin produces **zero**
  egress findings (P15). Note the twin is still refused under that record — but
  only by `receipt-binding-mismatch`, because editing an already-signed
  receipt changes its hash. That is an artefact of post-hoc editing, not a
  defence: a lying PRODUCER writes the receipt first and the wrapper then
  signs it, so no binding mismatch arises. §4a (W3) is that case.
- The **whole-predicate `true`** in P17 additionally depends on the forger key,
  and is therefore *not* claimed here as a statement about a lying producer
  running under the wrapper. §4a (W3) supplies that stronger statement with the
  genuine chain and no forger key.

## 3. Does ANY other counter clause catch the lie?

Tested every candidate; the answer is no.

| # | probe | input | result |
|---|---|---|---|
| P1 | zeroed counts, self-signed measure + live challenge | `R_lie` | exit 0, `predicate: true`, `findings: []` |
| P2 | planted non-zero egress (control) | `R_true` | exit 1, `run1-sample1-{ss,proc}-egress` |
| P3 | **partial** lie: per-sample counts zeroed, aggregates left true | `R_lie_partial` | exit 1 — `run1-summary-ss-mismatch`, `run1-summary-proc-mismatch`, `run1-summary-egress-mismatch` (counter lines 123–125) |
| P5/P6 | same two inputs, direct invocation (no challenge channel) | `R_true` / `R_lie` | egress findings present / absent respectively, independent of the challenge wall |
| P12 | byte-pin BLESSED to the lying driver (counterfactual) | `R_lie` | exit 0, `predicate: true`, `findings: []` |
| P13 | planted egress vs the COMMITTED measure record | `R_true` | egress findings + `receipt-binding-mismatch` |
| P15 | real egress, counts zeroed, sibling's own measure record | `REAL_egress_mutated` | 46 egress findings → **0**; only `receipt-binding-mismatch` + `measure-digest-mismatch` remain |

P3 is the important nuance: the counter's **summary-consistency** clauses
(`summary-ss-mismatch`, `summary-proc-mismatch`, `summary-egress-mismatch`,
counter lines 123–125 and 129) DO catch a *partial* lie — one that zeroes the
per-sample counts but leaves the aggregates true. But a driver that zeroes at
the source (where the counts are produced) recomputes its own aggregates from
the zeroed values, so those clauses are satisfied too. P3 therefore shows the
consistency clauses are **not** a defence against this mutation; they only
catch a hand-edited receipt, not a lying producer.

P12 is the counterfactual that isolates the clause from the byte-pin: with the
producer digest pin re-pointed at the lying driver's bytes (so the byte layer is
fully satisfied and the receipt-content clauses are the only defence left), the
frozen counter still admits the zeroed receipt with `predicate: true`.

## 4. What DOES catch a mutated driver (and what that means for the claim)

The mutation is caught — but by the **producer digest pin**, not by the
egress-count clause:

- **Wrapper, Stage 1** (`measure-c1-round43.mjs`, digest check before the
  browser is spawned): with the mutated driver installed at the canonical path,
  the wrapper refuses `producer-digest-mismatch` with
  `digestFindings: ["digest-mismatch:scripts/playwright-firefox-egress-round43.mjs"]`,
  `gate.child.ok: true`, and **no receipt is written and no browser is launched**
  (`evidence/wrapper-mutant-driver-refused.json`). Control arm: the same
  mirror tree with the pristine driver installed runs the whole chain green
  (`driverExit: 0`, `counterExit: 0`, `predicate: true`, `findings: []` —
  `evidence/wrapper-pristine-control.json`).
- **Counter, own re-derivation** (counter lines 179–184): pointing the counter's
  `DRIVER` constant at the mutated copy produces
  `digest-mismatch:scripts/playwright-firefox-egress-round43.mjs` plus the
  matching `measure-digest-mismatch:` (line 230) (P7). The control with the
  pristine driver pointed at the same place produces neither (P8 — the two
  counter copies are byte-identical apart from that one path constant).

So the frozen chain is not defeated by this mutation **as long as the mutated
bytes sit at the pinned path**. The egress-count clause's own discriminating
power is nevertheless nil against a lying producer, and the byte-pin is a
producer-identity check, not a behavioural one: it proves *which bytes* ran, not
*what they observed*.

### 4a. W3 — the FULL genuine chain over a lying producer (no forger key)

P1/P12/P16/P17 score a receipt against a measure record this seat minted, and
sibling seat `ScribeEntryAuth` correctly flagged that the twin's admission in
P17 rides on a forger-minted key. W3 removes that objection: it runs the
**entire frozen chain** — wrapper, real Firefox, real per-invocation Ed25519
key, real witness child, real fd3/fd4 challenge-response — with the **lying
driver installed as the producer**, in a mirror tree whose `claims.json` pins
are blessed to those lying bytes so the byte-pin layer is satisfied.

```
cd <scratch>/mirror2     # driver = mutated (cbd8d65e…), claims pins blessed to it
node scripts/measure-c1-round43.mjs --out ../out/W3.receipt.json \
     --measure-out ../out/W3.measure.json --scratch ../out/W3.scratch
```

Observed (`evidence/W3-lying-producer-full-chain.json`,
`evidence/wrapper-chain-lying-producer-admitted.json`,
`evidence/wrapper-chain-lying-producer-replication.json`) — two independent
runs of the same command, W3 and a sequential replication:

| field | W3 | replication |
|---|---|---|
| driver sha256 | `cbd8d65e2a0ac8d0e6f54fede992dd2303f73beaa9c1f9cdf1ae9c6734e41d77` (the mutated driver) | same |
| `driverExit` | 0 | 0 |
| `counterExit` | 0 | 0 |
| `challengeVerified` | **true** | **true** |
| `witnessAttestationVerified` | **true** | **true** |
| `predicate` | **true** | **true** |
| egress-clause findings | **0** | **0** |
| other findings | **[]** | **[]** |
| receipt | `egressNonLoopback: 0`, 132/131 samples, `refused: false`, `survivors: 0` | `egressNonLoopback: 0`, 133/131 samples, `refused: false` |

**So the genuine measurement chain — with no forger-minted key anywhere, the
wrapper's own ephemeral key answering the counter's fresh challenge — admits a
receipt produced by a lying producer, with `predicate: true` and zero findings.**
The egress-count clause is the only behavioural check on egress in the whole
predicate, and it does not fire.

### 4b. LIVE DIFFERENTIAL — the same genuine chain, producer behaviour the only difference

This host intermittently produces genuine non-loopback egress from the browser
(sibling `SentEgressAudit` captured 46 such observations in one of its runs).
Waiting for such a window allows the decisive live comparison: **the identical
genuine chain, run twice in the same egress-producing window, once with the
pristine producer and once with the lying producer** — each in its own mirror
tree whose pins are blessed to that tree's own producer bytes, so the byte-pin
layer is satisfied in both arms and the producer's BEHAVIOUR is the only
difference.

| | PRISTINE producer | LYING producer (mutated) |
|---|---|---|
| driver sha256 | `3718235934d1fd06f…` | `cbd8d65e2a0ac8d0…` |
| `driverExit` | 0 | 0 |
| `counterExit` | **1** | **0** |
| `challengeVerified` | true | true |
| `witnessAttestationVerified` | true | true |
| `predicate` | **false** | **true** |
| egress-clause findings | **45** | **0** |
| other findings | `[]` | `[]` |
| receipt `egressNonLoopback` | **45** | **0** |
| receipt nonzero sample observations | **45** | **0** |

Evidence: `evidence/LIVE-DIFFERENTIAL-lying-vs-pristine-full-chain.json`,
`evidence/wrapper-chain-pristine-twin-seq.json` (the refused pristine run),
`evidence/wrapper-chain-lying-producer-egress-window.json` (the admitted
lying run), `evidence/seq-pristine-twin-receipt-45-egress.json`.

**In a window where this host really did egress, the honest producer's receipt
was REFUSED with 45 egress-clause findings, and the lying producer's receipt
was ADMITTED with `predicate: true` and zero findings — through the identical
genuine chain, each arm with its own per-invocation key and a verified
fd3/fd4 challenge.** This is the same conclusion as §2, reached through the
live chain instead of a hand-built receipt: the egress-count clause is the only
clause that speaks about egress, and zeroing the counts removes every trace of
it from a receipt the chain then admits.

**Third data point (a sibling's run, recorded for internal consistency, not
this seat's measurement).** Sibling `ScribeEntryAuth` rebuilt both mirror trees
independently and obtained byte-identical driver digests (pristine
`3718235934…`, lying `cbd8d65e…`, the same artefacts), but their pristine-arm
run landed in a **no-egress** window: `egressNonLoopback: 0`, 0 nonzero sample
observations, and the counter scored it **green** (exit 0, `challengeVerified:
true`, `predicate: true`, 0 findings). Their run neither confirms nor
contradicts the differential — it is a run outside the condition that separates
the two arms — and they have recorded it that way rather than claiming
confirmation they do not have. It is nonetheless a useful control: it shows
that the PRISTINE producer scores green in the same mirror construction when
there is no egress, so the refusal in the differential above is driven by the
egress observations and not by anything incidental to the mirror tree. Their
evidence: `.ufo/waves/round-43/w1/ScribeEntryAuth/evidence/live-differential-peer-evidence.txt`.

**Scoping (recorded at sibling `ScribeEntryAuth`'s request).** W3/4b reach exit 0
only because the mirror trees' `claims.json` pins were **re-blessed** to the
mutated driver's bytes — an out-of-model change to the pins, which the
declared residual model already places out of scope ("on-disk tampering of
committed pins or receipts is out of model"). In the frozen chain the byte-pin
refuses `producer-digest-mismatch` at wrapper stage 1, before the browser
spawns (§4, W1). So the correct claim is the one made here: **the egress
clause contributes no independent refusal; only the byte-pin stops the mutated
bytes.** This is a control-set calibration gap, **not** an in-model do-nothing
reach. The property worth preserving is that if the closure re-derives the pins
from committed bytes rather than trusting a re-blessed copy, the byte-pin holds.

**Consequence for the claim's residual model.** The mutation simulates a driver
that observes real egress and reports none. Under the frozen chain the byte-pin
stops *this* mutation only because the mutation changed the pinned bytes — the
pin is a producer-IDENTITY check, not a behavioural one, and it proves which
bytes ran, not what they observed. The counter's egress clause is the *only*
behavioural check on egress in the predicate, and this measurement shows it is
self-reported and defeatable by a producer that reports zeros.

The claim's declared residual model covers "on-disk tampering of committed pins
or receipts (out of model — committed-byte re-derivation at the closure catches
it)". This seat did **not** demonstrate a reach inside that declared model: no
mutation that keeps the pinned bytes yet reports false egress counts was
constructed or exhibited, and the byte-pin does stop the mutation as specified.
What this seat establishes is narrower and should be read as such: (i) the
egress-count clause contributes **no** independent refusal against a lying
producer, and (ii) its failing state is fixture-buildable, so the class is
closable with two deterministic committed controls rather than left to live
observation. Whether a byte-identical producer could report false counts is
**not** demonstrated here (§10).

## 5. Classification (the round-37 planned blind class, continued)

Round 37 (`MutC2a`) left the survivors term "honest-run-observable only" — no
frozen control exercised a survivor-positive state, so the term's guard was
observable only on a live run. This seat asks the same question of the
egress-count clause: is the guard exercisable by a fixture, or only by an
honest live run?

**Classification: FIXTURE-BUILDABLE, and the fixture exists.** The clause's
failing state is reachable without any browser run and without any live
egress event:

- P2/P5/P13 — a hand-crafted receipt with a planted non-zero egress count
  (and a matching witness + self-signed measure) makes the frozen counter emit
  `run1-sample1-{ss,proc}-egress` with `egressDetail` populated
  (`evidence/P2_true_planted_egress.json`, `evidence/P5_true_direct.json`).
  No Firefox, no `ss`, no `/proc/net/tcp` needed.
- P15/P17 — the same construction on the *real* 46-observation receipt: the
  frozen bytes refuse it, the mutated twin greens it.

This is a strictly stronger position than round 37's survivors term, and it is
the opposite of what the round-43 knowledge note currently claims. That note
(`corpus/knowledge/receipt-authenticity-signing-round-43.md`, uncommitted,
written by a sibling seat) says:

> The egress-count clause remains honest-run-observable: a lying driver zeroing
> counts produces internally consistent receipts (round-37 planned blind class,
> re-classified by the round-43 wave's MutDriverEgress item).

**That sentence is refuted by this seat's measurement.** The clause's *failing*
state is fixture-buildable (P2/P5/P13/P16). What is true — and what the note
half-states — is the second half: a lying driver zeroing counts does produce
internally consistent receipts (P1/P15/P17), and consequently **no** counter
clause catches them. The blind class is real, but its shape is not
"honest-run-observable only"; it is **fixture-buildable and therefore
closable**: a committed control can be written that plants a non-zero egress
count and asserts the counter refuses it, and a second committed control can
plant the zeroed twin and assert the counter's current (admitting) behaviour.
Both controls are deterministic and browser-free. That is exactly the round-38
`c2-firefox-bidi-v4.mjs` pattern (a battery feeding two minimal evaluation
objects through the same production function) applied to C1.

Note also that the round-43 committed control set contains **no** egress
negative control at all: `c1-battery-r43.json` (7/7 loader refusals),
`c1-relabel-refused.json`, `c1-replay-r42-refused.json`,
`c1-synthetic-refused.json` never carry a receipt with a non-zero egress count.
The clause's refusing branch is therefore currently exercised only by live
observation — which is precisely the gap this seat was asked to close.

## 6. Adjacent observation (not this seat's item, routed not judged)

P9: a fully synthetic receipt + witness + measure triple — fabricated pids,
fabricated `startTicks`, no browser run — reaches `predicate: true`, exit 0
against the frozen counter (`evidence/P9_fully_synthetic.json`). This
independently reproduces sibling seat `CritC1ReachSynth`'s finding and is that
seat's item, not this seat's; it is recorded here only because the same
self-signed-measure isolation harness was needed to score the egress clause at
all. It also means the egress-clause measurements above are best read as
"the egress clause contributes nothing", not "the egress clause is the only
thing standing in the way".

## 7. Reproduction commands

Scratch root (removed at cleanup): `/fast/scratch/hyaku/tabi-r43/MutDriverEgress`.

```bash
# 1. build the mutant (two observe*() returns)
node harness/make-mutant.mjs \
  /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round43.mjs \
  mutant/driver.mjs

# 2. driver-level unit proof (browser-free)
node harness/unit-observe.mjs pristine/driver.mjs
node harness/unit-observe.mjs mutant/driver.mjs

# 3. build the mutated twin of the real 46-observation receipt
node harness/mutate-real.mjs out/REAL_egress.json out/REAL_egress_mutated.json

# 4. paired differential (challenge channel answered with the measure key)
node harness/probe.sh P16_PAIR_true \
  <repo>/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
  out/REAL_egress.json out/PAIR_true.measure.json out/PAIR_true.measure.json.privkey
node harness/probe.sh P17_PAIR_mutated \
  <repo>/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
  out/REAL_egress_mutated.json out/PAIR_mutated.measure.json out/PAIR_mutated.measure.json.privkey

# 5. direct invocation, no challenge channel (shows the egress findings are
#    independent of the challenge wall)
bash harness/direct.sh P5_true_direct  <counter> out/R_true.json          out/R_true.measure.json
bash harness/direct.sh P6_lie_direct   <counter> out/R_lie.json           out/R_lie.measure.json

# 6. byte-pin differential (mutated driver at the canonical path)
node harness/make-mirror.mjs mirror-mutant
node harness/pin-mirror-claims.mjs mirror-mutant
cd mirror-mutant && node scripts/measure-c1-round43.mjs --out ../out/W1.receipt.json \
  --measure-out ../out/W1.measure.json --scratch ../out/W1.scratch

# 7. W3/W4 — the FULL genuine chain over the lying producer (pins blessed to it),
#    plus the pristine twin as control
node harness/make-mirror.mjs mirror2          # lying driver at the canonical path
#   then repin mirror2's claims.json to ITS OWN bytes (including the lying driver)
node harness/pin-mirror-claims.mjs mirror2
cd mirror2 && node scripts/measure-c1-round43.mjs --out ../out/W3.receipt.json \
  --measure-out ../out/W3.measure.json --scratch ../out/W3.scratch
#    same construction with the PRISTINE driver -> W4 control
```

## 8. Scope, tooling, restoration

- **Nothing in the repo was modified by this seat.** `git status --porcelain`
  shows only pre-existing wave artefacts (`corpus/README.md`, `.ufo/waves/round-43/w1/`,
  `corpus/knowledge/…`, `corpus/lessons/…`) plus siblings' outputs; no tracked
  file was touched. No commits, no pushes, no git/jj mutation, no network access.
- **Canonical bytes unchanged** (verified after the battery):
  `scripts/playwright-firefox-egress-round43.mjs`
  `3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e`;
  `scripts/measure-c1-round43.mjs`
  `23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0`;
  `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`
  `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c` — all
  equal to the `claims.json` frozen pins. The counter was only ever *invoked*
  read-only from its committed path; the two counter copies used for the
  byte-pin differential (`P7`/`P8`) are scratch copies, byte-identical apart
  from the single `DRIVER` path constant (verified by `diff`).
- **No tools installed or upgraded.** `/home/vgpnk/.omp/agent/RULES.md` was
  read first; nothing needed installing, so no pacman/uv/binary channel was
  used. Existing toolchain: node v24.21.0 (fnm), git 2.56.0.
- Scratch `/fast/scratch/hyaku/tabi-r43/MutDriverEgress` removed on exit;
  everything needed for reproduction is copied into this seat's `evidence/`.
- **Integration note (r41 defect D1 class):** four evidence files exceed 1 MiB —
  `real-egress.witness.json` (1 268 515 B), `real-egress-receipt.json`
  (1 171 017 B), `real-egress-mutated-receipt.json` (1 171 013 B) and
  `live-mutant2-driver-receipt.json` (1 165 900 B). The round-41 lane helper
  skips new files over 1 MiB inside a named directory, so these must be
  committed as explicitly named files (the round-43 receipt+witness precedent,
  commit `ba433c94`). Every finding in this report is independently checkable
  from the small `P*.json` counter outputs, which are all well under the
  threshold, so a skipped large file does not affect the verdict.
- Receipts/measure records used are committed bytes (`corpus/evidence/round43/…`,
  `.ufo/waves/round-43/measure/c1-measure-r43.json`) or a sibling seat's
  committed-in-wave live run (`SentEgressAudit/failed-run-1/…`), read-only.
- Firefox was launched three times, from scratch, against a loopback fixture
  only (one pristine copy, two mutated copies) to confirm the mutant still runs
  and still reports `egress: 0`. The live arms cannot discriminate the mutation
  on this host because the honest environment produced no egress to hide
  (`egressNonLoopback: 0` in all three runs) — the discriminating instrument is
  the receipt-level paired differential on a receipt with 46 REAL egress
  observations. The mutated runs' sample counts differ (25/15 vs 130/131 for the
  SAME mutant bytes), which is a wall-clock artifact of the 100 ms sampler
  tracking session duration under machine load, not an effect of the mutation
  (the mutation changes two returned field values, never control flow or
  timing). Detail: `evidence/live-runs-comparison.txt`. No egress to the
  public internet.

## 9. Findings (routed, not contract changes)

1. **The egress-count clause is not load-bearing against a lying driver**
   (P1/P15/P17, W3, and the live differential of §4b). Its refusing branch is
   fixture-buildable (P2/P5/P13), so this blind class is closable with two
   deterministic, browser-free committed controls — one planting a non-zero
   egress count (must refuse), one planting its zeroed twin (currently
   admitted). Until such a control exists, the round-43 control set has **no**
   egress negative control.
2. **LIVE DIFFERENTIAL through the genuine chain** (§4b): in a window where
   this host really egressed, the PRISTINE producer's receipt was REFUSED
   (counter exit 1, `predicate: false`, **45** egress-clause findings) and the
   LYING producer's receipt was ADMITTED (counter exit 0, `predicate: true`,
   **0** findings) — same chain, same per-invocation-key mechanism, same
   verified fd3/fd4 challenge, producer behaviour the only difference. W3/4a
   adds the replication with the chain green in both arms; the live differential
   adds the case where there is real egress to hide. Sibling `ScribeEntryAuth`
   independently reproduced W3 from scratch and obtained a byte-identical mutant
   (`cbd8d65e…`) with the same result.
3. **The counter's summary-consistency clauses are not a defence against this
   mutation** (P3): they catch a hand-edited receipt but not a producer that
   zeroes at the source and recomputes its own aggregates.
4. **The producer digest pin, not the egress clause, is what stops the mutated
   bytes** (P7/P8, W1/W2) — and it is a producer-identity check, not a
   behavioural one. It bounds this mutation only because the mutation changed
   the pinned bytes; no reach inside the declared residual model is claimed
   here.
5. **The round-43 knowledge note's claim that the egress-count clause "remains
   honest-run-observable" is refuted** (§5). The clause's failing state is
   fixture-buildable; the true statement is that no clause catches a *consistent*
   lie. `corpus/knowledge/receipt-authenticity-signing-round-43.md` is
   uncommitted and belongs to a sibling seat; this seat did not edit it.
   Sibling `ScribeEntryAuth` has independently reproduced the halves and
   adopted the rewording.
6. Independent reproduction of the synthetic-pair do-nothing reach (§6) —
   `CritC1ReachSynth`'s item. `ScribeEntryAuth` observes the same mechanism
   from the document-provenance side (the counter verifies against a public key
   carried inside the document it authenticates, and `claims.json` pins no
   pubkey) and has classified it as a kill-rule trigger for C1 (their F1); the
   two observations are the same hole seen from opposite ends. That
   classification is theirs — this seat reproduces the mechanism and routes it
   without adjudicating it (§10).
7. **The two findings are complementary, not duplicative — and closing either
   alone leaves the other open.** The egress-count clause is the predicate's
   ONLY behavioural check on egress, and it is self-reported. So:
   - F1 (sibling `ScribeEntryAuth`) attacks the **document's provenance**: a
     forger writes the measure record, names their own public key inside it,
     and answers the counter's own challenge with the matching private half —
     nothing binds the receipt to the wrapper that produced it.
   - This seat's arm attacks the **observation content**: a producer with a
     genuine wrapper key, a genuine browser run and a verified challenge
     zeroes its counts and removes every trace of its egress from a receipt
     that is then admitted.

   The repair implication for the L1: a provenance fix (pinning the wrapper's
   public key, or otherwise binding the measure record to a specific wrapper
   invocation) closes F1 but leaves this seat's arm open, because a producer
   with a legitimate key can still report false counts; an observation-content
   fix (an egress witness independent of the producer, or a control that
   exercises a non-zero egress count) closes this arm but leaves F1 open,
   because a forger can still author the document. Both belong in the round-44
   repair. This is a synthesis of two seats' findings, each of which
   attributes only its own arm; it adjudicates neither.

   **Concrete consequence for the next freeze (offered as an observation, not a
   claim):** the two weaknesses sit in different halves of the same predicate,
   so a round-44 repair that only re-pins the public key leaves the egress
   surface exactly as open as it is today — and because the round-43 control set
   contains **no** egress negative control, nothing at the next freeze would
   catch that. The two controls named in finding 1 (one planting a non-zero
   egress count, one planting its zeroed twin) are what would make the egress
   half observable at the next freeze, and they are cheap and deterministic.
   The ordering of the two repairs is the L1's to choose; what the L1 should
   not do is record a closure as closing the instrument while one half is
   still open.

## 10. Limitations

- The seat asked for a hand-crafted receipt "consistent with zeroed counts"
  rather than a browser run; that instruction was followed, and the browser was
  used only to confirm the mutant still executes. The decisive arm (P16/P17)
  uses a *real* sibling receipt rather than a synthetic one precisely to avoid
  the synthetic-receipt confound.
- The counter's challenge channel was answered with a freshly minted key in the
  receipt-level probes (P1/P2/P3/P5/P6/P12/P16/P17: the harness signs its own
  measure record). This is an isolation device for scoring receipt content, not
  a claim that the committed pair is reachable that way; §6 records what it does
  show. The **W3** arm (§4a) is the arm that carries no such caveat — it runs
  the genuine chain end to end, with the wrapper's own ephemeral key.
- W3/W4 ran in windows where this host produced no non-loopback egress, so
  they demonstrate "the chain admits a lying producer's receipt", not "the chain
  admits a receipt that hid a specific egress event". §4b closes that gap with
  a live differential in an egress-producing window: the pristine producer was
  refused there with 45 findings and the lying producer admitted with none.
- The two arms of §4b were run **sequentially in the same egress-producing
  window**, not simultaneously, so they are two runs of the identical command
  in adjacent windows rather than a single shared instant. The comparison is
  still controlled — same host, same mirror construction, same chain, pins
  blessed to each tree's own producer — and the two receipts differ in the
  producer's reported egress exactly as the mutation predicts. An attempt to
  run several pairs concurrently was abandoned: the host's load average was
  ~214 (sibling seats running Firefox concurrently) and the runs were killed;
  no orphaned Firefox process from this seat remained (verified by scanning
  `/proc/*/cmdline` for the seat's scratch path — the 7 running Firefox
  processes belonged to other seats and were left alone).
- The egress window on this host is **intermittent**, and it is not
  reproducible on demand: a sibling's independent run of the same construction
  landed in a no-egress window and scored green (§4b, third data point), so
  the differential is a measurement of an intermittent condition, not a
  repeatable fixture. The receipt-level paired differential of §2 is the
  deterministic form of the same comparison and is the one to re-run.
- W3/4b re-bless the mirror trees' `claims.json` pins to the producer's bytes,
  which is an out-of-model change (recorded at sibling `ScribeEntryAuth`'s
  request, §4b). The frozen-chain behaviour with the mutated bytes at the
  canonical path is the W1 refusal. This seat claims **no** kill-rule trigger.
- Whether a byte-identical producer can report false egress counts without
  changing its bytes was **not** demonstrated — no such producer exists in the
  tree, and building one was outside this seat's scope. §4 states the residual
  as a structural observation, not a demonstrated reach, and this seat claims
  **no** kill-rule trigger: the byte-pin stops the mutation as specified.
- No adjudication of the C1 claim is made here; the kill rule is the L1's call.
  **Scope of the "no kill-rule trigger" statement above: it is scoped to THIS
  seat's arm** (the egress-count mutation), not to C1 as a whole. Sibling
  `ScribeEntryAuth` (F1) and `CritC1ReachSynth` report a *different* class —
  a fully synthetic self-signed pair reaching `predicate: true` with no browser
  run — and `ScribeEntryAuth` classifies that as a kill-rule trigger for C1.
  Those findings are theirs; this seat reproduced the mechanism independently
  (P9) and routes it without adjudicating it. **This seat's finding stands on
  its own footing and does not depend on, weaken, or pre-empt that
  determination:** even if C1's admission is blocked by F1, the egress-count
  clause's non-defensiveness against a lying producer, and the absence of any
  egress negative control in the committed control set, remain calibration
  gaps worth closing before the instrument is trusted again.
- Sibling seats independently report findings that bear on how these numbers
  should be read: `CritC1ReachSynth` (a fully synthetic self-signed pair
  reaches predicate true with no browser run — reproduced here as P9),
  `SentEgressAudit` (the real 46-observation egress receipt used as the §2
  input), and `ScribeEntryAuth` (the document-provenance view of the same hole:
  the counter authenticates against a public key carried inside the document it
  authenticates, and `claims.json` pins no pubkey — they independently rebuilt
  W3 from scratch and obtained a byte-identical mutant with the same result).
  None of these is this seat's item and none is adjudicated here.

VERDICT finding the egress-count clause is not load-bearing against a lying driver: through the genuine chain (wrapper per-invocation key, real Firefox, real witness, verified fd3/fd4 challenge) in a window where the host really egressed, the pristine producer's receipt was refused with 45 egress-clause findings while the lying producer's receipt was admitted with predicate true and zero findings, and the clause's failing state is fixture-buildable (plantable, browser-free), so the blind class is closable with two deterministic controls — for THIS seat's arm a control-set calibration gap, not an in-model do-nothing reach, since the frozen byte-pin still refuses the mutated bytes; the separate synthetic-pair kill-rule trigger siblings report is theirs to adjudicate.
