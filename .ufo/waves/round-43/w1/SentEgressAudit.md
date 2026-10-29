# SentEgressAudit — round-43 C1 live-run environment audit

Seat: `SentEgressAudit` (leaf, wave 1, round 43, policy-v2)
Axis judged: **freshness**
Milestone: live-run environment audit
Date: 2026-10-29 (host `plazir27`, kernel 7.2.11-arch1-1, boot_id `bcbf8b48-25bb-4aa5-b379-018848f39361`)

Scope: audit the committed round-43 live measurement
(`corpus/evidence/round43/playwright-egress/receipt.json` +
`.ufo/waves/round-43/measure/c1-measure-r43.json`), analyze the transient that
caused the **first** attempt of this round to be refused with 46 egress findings,
and confirm the second run's environment is the same host profile.

Evidence directory: `.ufo/waves/round-43/w1/SentEgressAudit/`
(no writes outside that directory and my scratch root; no git/jj mutation; no commits)

---

## 1. Headline result

**The committed measurement is internally sound and cryptographically bound, and the
second run's environment is the same host profile as the first attempt's. The
46-finding refusal on attempt 1 is classified as a HOST-ENVIRONMENT EVENT, not an
instrument defect — but the instrument was hardened between attempt 1 and the freeze,
and that hardening is the one substantive freshness caveat this seat must route.**

The instrument defect that *was* present (attempt 1's driver did not record the
non-loopback remote addresses) is exactly why the transient cannot be attributed to
a specific address from the archived bytes: **the attempt-1 receipt contains no
address data at all**, only per-surface counts. See §5.

---

## 2. Committed measurement — every audited limb verified

### 2.1 Digests of committed bytes (git object bytes at HEAD `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`)

```
$ git show HEAD:corpus/evidence/round43/playwright-egress/receipt.json | sha256sum
1b33d6a6b25681045bebf80bf371faa4c94db7ecc49298a7fe2f68536fe2d9bf
$ git show HEAD:corpus/evidence/round43/playwright-egress/receipt.witness.json | sha256sum
0728d338f3b53a672b3404f548a2ed9bf982394c8660fcdf7a5c5789eeef2b2b
$ git show HEAD:.ufo/waves/round-43/measure/c1-measure-r43.json | sha256sum
c67a1096e5cc32b0c935ca133c67d8b485c8fff11e44a288f6e62d6abb97b258
```

These three values match the measure record's own bindings exactly
(`bindings.receiptSha256 = 1b33d6a6…`, `bindings.witnessSha256 = 0728d338…`).
Worktree vs HEAD for every measured file is identical (`git diff --stat HEAD -- …` empty).

### 2.2 Independent cryptographic re-verification (my own script, not the lane's)

`evidence-consolidated.txt` §A, script `verify-bindings.mjs`:

| Limb | Result |
|---|---|
| receipt bytes ↔ measure record binding | **match** (`1b33d6a6…`) |
| witness bytes ↔ measure record binding | **match** (`0728d338…`) |
| measure record Ed25519 signature over canonical unsigned form | **valid** (`signature.over` re-derived = `1c539378…`; `crypto.verify` true) |
| witness attestation Ed25519 signature | **valid** (`attestation.over` re-derived = `8a3375f6…`; `crypto.verify` true) |
| 64-hex nonce carried by receipt, both runs, witness, measure record | **all equal** `d2c85f6e…` |
| witness public key in measure record ↔ attestation public key | **match** |
| producer digests in measure record ↔ on-disk bytes | **match** (all three) |
| producer digests on disk ↔ `claims.json.frozenDigests` | **match** (all three) |
| private key material persisted in receipt / witness / measure record | **none found** (no PEM `PRIVATE KEY`, no `privateKey`/`secretKey`/`seed` field) |
| `claims.json.frozenDigests` vs measure record's 3 digests | match; `claims.json` additionally pins 3 C2 artifacts (`check-routed-defects-round43.mjs`, `v0-fabrication.mjs`, `tree-vs-blob.mjs`) that the C1 measure record does not carry — expected, different claim |

Note on `claimsPins_match: false` in the raw script output: that is an artifact of my
script comparing a 3-key object to a 6-key object with `JSON.stringify` equality.
Re-checked key-by-key: **all three C1 producer digests match**; the extra three are
C2-only pins. No discrepancy.

### 2.3 Egress totals, sample spans, survivor counts

Audited from the committed receipt (`verify-bindings.mjs` + a per-limb re-derivation):

```
COMMITTED (attempt 2)
 run1: n=132 spanMs=18588 strictlyIncreasing=true ssTicks>0=true procTicks>0=true
       allNonLoopbackZero=true treeNonEmpty=true hasFirefoxExe=true
       survivors=0 portClosed=true finalSweepNL=0/0 firstShot=a792a1e3aba89324
 run2: n=132 spanMs=25649 strictlyIncreasing=true ssTicks>0=true procTicks>0=true
       allNonLoopbackZero=true treeNonEmpty=true hasFirefoxExe=true
       survivors=0 portClosed=true finalSweepNL=0/0 firstShot=a792a1e3aba89324
 top-level: egressNonLoopback=0 survivors=0 refused=false binding=true
```

Both runs exceed the predicate's floors (≥8 samples, ≥1000 ms span, both surfaces
with positive ticks on every sample and on the final sweep, ≥1 owned socket
observation per surface, zero non-loopback, refreshed identity-bound tree with
firefox-binary roots, no survivors, port closed).

### 2.4 Gate record

`measure.c1-measure-r43.json.gate`: `self.procEnvironReadable=true`, `nameCount=267`,
`forbiddenNames=[]`, `execArgv=[]`, `execArgvClean=true`, `execPath=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`,
`nodeSha256=7fde7b8a…`; `child.ok=true`, `child.self.forbidden=[]`, `child.parent.forbidden=[]`,
`child.execArgvFlag=["--eval"]`, `child.execArgvClean=true`. Receipt-side
`envCheck`: `procEnvironReadable=true`, `nameCount=17`, `forbiddenNames=[]`,
`execArgv=[]`, `execArgvClean=true`, `envNonceEcho="match"`. No loader contamination
on either side.

### 2.5 Binary pins re-derived from disk

```
$ sha256sum /home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox
1f637a7cfe8f1a3ec814a7da7e38c360a3e3c39553b8c7245ac5d6643fd495eb   == claims.producerPins.firefoxBinSha256
$ sha256sum /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node
7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c   == claims.producerPins.nodeSha256
```

### 2.6 Frozen counter re-run against the committed bytes (read-only)

`evidence-consolidated.txt` §E / `counter-on-committed.json`:

```
node .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
     corpus/evidence/round43/playwright-egress/receipt.json \
     --measure .ufo/waves/round-43/measure/c1-measure-r43.json
→ {"predicate":false,"challengeVerified":false,"challengeError":"EINVAL",
   "measureSignatureVerified":true,"witnessAttestationVerified":true,
   "findings":[],"egressDetail":[]}
```

**`findings` is empty**: every byte-level predicate limb of the frozen counter passes
on the committed bytes. `predicate:false` here is **only** the fd3/fd4
challenge-response, which by construction cannot succeed outside a wrapper
invocation (the counter writes a fresh 32-byte challenge to fd3 and reads the
signature from fd4; with no wrapper attached, `fs.writeSync(3, …)` fails with
`EINVAL`). This is the designed, expected refusal for a direct offline invocation —
it is *not* a finding against the committed measurement. The in-invocation pass is
attested by the archived `measure2.stdout`, which records `counterExit: 0`,
`challengeVerified: true`, `predicate: true`, `findings: []`.

---

## 3. The transient: 46 egress findings on attempt 1

### 3.1 What the refusal actually was

Attempt 1's archived `measure.stdout` (copied to `failed-run-1/measure.stdout`):

```
"driverStdout": {"runs":2,"refused":false,"binding":true,"egress":46,"survivors":0,
                 "runNonce":"7be40389dde8dd41dd07b14e84e2d208722782c11ab2e699502752dc97610f44"}
"counterExit": 1, "challengeVerified": true, "challengeError": null,
"measureSignatureVerified": true, "witnessAttestationVerified": true,
"predicate": false, "findings": [ …46 ids… ]
```

Finding ids (complete set): `run1-sample{111..133}-{ss,proc}-egress` — 23 distinct
sample indices × 2 surfaces = 46. **Both surfaces agree**, exactly as the seat
brief anticipated: `ss` (kernel `ss -Htnp` text peer) and `proc`
(`/proc/<pid>/fd` inodes × `/proc/net/tcp{,6}` hex remote) independently flagged the
same 23 consecutive samples. In the archived receipt's run1 the single observed
socket line per sample is `ss.lines=1 / proc.inodes=1` with
`ss.nonLoopback=1 / proc.nonLoopback=1` from sample 111 onward; samples 1–110 are
`0/0`, and run2 of the same invocation is entirely clean (`ss.observations=48`,
`proc.observations=48`, `nonLoopback=0`).

Re-deriving with the **frozen** counter against the archived bytes reproduces the
refusal, and adds the diagnostic detail (§3.4):

```
node .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
     failed-run-1/receipt.json --measure failed-run-1/c1-measure-r43.json
→ exit 1, findings=48, egressFindings=47, egressDetailCount=46,
  nonEgressFindings=["measure-digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs"]
```

Exact breakdown of the 48 findings — 46 are the sample-level egress findings
(`run1-sample{111..133}-{ss,proc}-egress`), and the other two are digest mismatches:

```
$ jq -r '.findings[] | select(test("^run[0-9]+-sample[0-9]+-(ss|proc)-egress$")|not)' counter-on-failed.json
measure-digest-mismatch:scripts/playwright-firefox-egress-round43.mjs
measure-digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
```

Both digest mismatches are **expected and correct**: the archived attempt-1 measure
record pins the pre-freeze producer digests (`b70e2c14…` driver, `bbdf1234…`
counter), which no longer match the on-disk frozen bytes. The frozen counter is
therefore *stricter* against the archived bytes than attempt 1's counter was, not
looser. (`jq` counting on the substring `egress` reports 47 rather than 46 only
because the driver path `scripts/playwright-firefox-egress-round43.mjs` itself
contains the substring; the anchored sample-level pattern gives the exact 46.)

### 3.2 Classification: host-environment event, not instrument defect

Evidence for **host-environment event**:

1. **The egress-detection logic is byte-identical between attempt 1 and the frozen
   driver.** I reconstructed attempt 1's driver bytes exactly
   (`evidence-consolidated.txt` / reconstruction below): attempt-1's driver digest
   `b70e2c145390cc4c1c79b93aad87f13319f32f77c85ba972a973352e9843082a` is
   **reproducible bit-for-bit** as `scripts/playwright-firefox-egress-round41.mjs`
   with the `r41→r43` renames applied (SCHEMA constant, fixture titles, scratch
   prefix, `driver:` field). The `diff` between that reconstruction and the frozen
   driver is **only the addition of the `nonLoopbackRemotes` diagnostic** — the
   classification functions `isLoopbackPeer` and `isLoopbackHexRem` are unchanged.
   So attempt 1's refusal was produced by the *same* loopback test the frozen run
   passes.
2. **Both surfaces agreed.** A single-surface artifact (e.g. an `ss` parse glitch, or
   a `/proc/net/tcp` row misattributed to the owned tree) would not be mirrored
   independently on the other surface for 23 consecutive samples with matching
   counts. Two independent kernels of the same observation agreeing on the same
   samples points at a real socket on the owned tree.
3. **It was transient and non-reproducible on the same host.** Attempt 1's own run2,
   in the same process, minutes later, was completely clean; attempt 2 (the committed
   run) was clean on both runs; and **4 further invocations of the frozen driver on
   this host (8 browser runs) produced `egress=0` every time** (§3.3).
4. **The frozen driver's added recorder, exercised live, caught nothing** — so the
   frozen instrument did not merely *stop looking*; it looked harder and found zero.

Evidence for **instrument defect**: none found in the detection path. The defect that
existed was a **diagnostic** defect (attempt 1's driver did not record *which*
remote was non-loopback), which is why §5 could not attribute the transient to an
address.

**Conclusion: host-environment event.** A transient non-loopback socket appeared on
the owned Firefox tree during attempt 1's run1 (samples 111–133, i.e. the last ~5.4 s
of a 34.5 s run1 span) and vanished before the final sweep and before the next run.
It did not recur. The committed run therefore does not "hide" the event: the same
instrument on the same host produced the event once and then not again, and the
committed run is one of the clean instances of a distribution that includes a dirty
one.

### 3.3 Reproduction with the frozen driver (which now records the remote)

Four fresh invocations of the **committed** frozen driver, each 2 runs, on this host:

| Invocation | file | egress | survivors | refused | per-run egress | per-run samples | any recorded remotes |
|---|---|---|---|---|---|---|---|
| repro A | `evidence-repro-run1.json` | 0 | 0 | false | [0, 0] | [131, 133] | `[]` |
| repro B | `evidence-repro2-run1.json` | 0 | 0 | false | [0, 0] | [132, 131] | `[]` |
| repro C | `evidence-repro2-run2.json` | 0 | 0 | false | [0, 0] | [132, 131] | `[]` |
| repro D | `evidence-repro2-run3.json` | 0 | 0 | false | [0, 0] | [111, 87] | `[]` |

Exact commands (run from my scratch root, writes confined to scratch):

```
N=$(openssl rand -hex 32)
TABI_RUN_NONCE=$N node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round43.mjs \
  --out <scratch>/r$i.json --scratch <scratch>/sc$i --nonce $N --runs 2
```

No loopback fixture is reachable off-host; the driver only ever talks to its own
`127.0.0.1` fixture server.

### 3.4 Post-refusal hardening (the freshness caveat)

Both producers were edited **after** attempt 1 was refused and **before** the freeze
commit `7ca6f018`, and the frozen pins are the **post-edit** bytes:

| Artifact | attempt-1 bytes (what attempt 1 actually ran) | frozen/committed bytes (pinned in `claims.json`) |
|---|---|---|
| `scripts/playwright-firefox-egress-round43.mjs` | `b70e2c14…` | `3718235934d1…` |
| `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` | `bbdf1234ab0e…` | `6b8c875037b6…` |
| `scripts/measure-c1-round43.mjs` | `23afa29d…` | `23afa29d…` (unchanged) |

Working-tree mtimes corroborate the ordering: driver 17:41:01, counter 17:41:10,
attempt-1's archived outputs copied 17:41:30, freeze commit 17:43:39.

**What the driver change was.** Exactly and only the addition of a diagnostic field.
Diff of the reconstructed attempt-1 driver against the frozen driver:

```
+ const nonLoopbackRemotes = [];
- if (!isLoopbackPeer(peer)) nonLoopback += 1;
+ if (!isLoopbackPeer(peer)) { nonLoopback += 1; nonLoopbackRemotes.push(peer); }
+ // …same for observeProc: push `${ip}:${port}` alongside the existing increment
+ // …and the field is threaded into sampleOnce / finalSweep / runOnce
```

The **counting predicate** (`isLoopbackPeer` on `ss` text peers;
`isLoopbackHexRem` on `/proc/net/tcp` hex remotes) is unchanged. I verified this
function-by-function against the frozen source (`classifier-test.mjs`, pure
functions, no network I/O):

```
isLoopbackPeer:  "127.0.0.1:44321"→true  "[::1]:44321"→true
                 "[::ffff:127.0.0.1]:44321"→true  "[0:0:0:0:0:0:0:1]:44321"→true
                 "0.0.0.0:0"→false  "[::]:44321"→false
                 "203.0.113.7:443"→false  "[2606:4700::1111]:443"→false
classifier identical attempt1 vs frozen: true
isLoopbackHexRem: 0100007F:BBE1→true  00000000000000000000000001000000:BBE1→true
                 0100007F:0000→true
                 0000000000000000FFFF000001000000:BBE1→false
                 00000000000000000000000000000000:0000→false
                 0808080808080808B8850000:01BB→false
classifier identical attempt1 vs frozen: true
```

**What the counter change was.** The counter gained the `egressDetail` array (the
per-sample remote list) and a `remotes` field in it. The counter's **predicate
sentence is byte-identical** across all three artifacts (attempt 1's counter output,
attempt 2's counter output, the frozen `const PREDICATE`, and `claims.json`'s
`counterPredicate`):

```
$ node pred-diff.mjs
frozen == attempt1 counter : true
frozen == attempt2 counter : true
claims.counterPredicate == frozen PREDICATE : true
sha256(frozen) == sha256(attempt1) == sha256(attempt2) == sha256(claims)
  = 9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598
```

**Assessment of the hardening.** It is *additive diagnostics only* — it makes the
instrument report **more**, never less. It does not relax, gate, or re-word any
predicate limb. The one non-diagnostic difference is that the frozen counter
additionally emits `measure-digest-mismatch:<counter>` against the archived
attempt-1 bytes, because the archived measure record pins the pre-freeze counter
digest — i.e. the frozen counter is *stricter* against the old bytes, not looser.

**The residual freshness concern (routed, not amended).** The freeze pins bytes that
did not exist when the round's first measurement was taken, and the round's first
measurement was *refused*. A reader could ask: was the producer edited in response
to a failure in a way that makes the failure unreachable? The answer, demonstrated
above, is **no** — the edit adds a field; the predicate, the counting test and the
predicate sentence are unchanged; the frozen counter applied to the archived
attempt-1 bytes still produces the egress findings (46 detail entries). So the
refusal is still reachable by the frozen instrument. The round-43 wording forbids
amending frozen artifacts; nothing here needs amendment. It is recorded here so the
closure re-derivation reads the edit for what it is (diagnostic), not for what it
could have been (a gate relaxation).

---

## 4. Same host profile: attempt 1 vs the committed attempt 2

### 4.1 Host / boot continuity (independent of any recorded field)

```
attempt-1 measuredAt: 2026-10-29T20:37:33.648Z   run1 runStartTicks 27895329
attempt-2 measuredAt: 2026-10-29T20:41:41.098Z   run1 runStartTicks 27920073
wall gap (s)          : 247.450
tick delta / CLK_TCK  : 24744 / 100 = 247.44 s
wall-vs-tick agreement: match = true (diff 0.010 s)
```

The `/proc/uptime`-derived tick clock and the wall clock agree to 10 ms across the
247 s between the two attempts — the two runs sit on **one continuous boot**, with no
clock step, no suspend/resume jump and no reboot between them. Current
`/proc/sys/kernel/random/boot_id` = `bcbf8b48-25bb-4aa5-b379-018848f39361`;
`/proc/uptime` = 280079.81 s at audit time, and both attempts' tick values are
strictly below the current uptime, i.e. the same monotonic boot epoch.

### 4.2 Software / binary profile

| Dimension | attempt 1 | committed attempt 2 | Same? |
|---|---|---|---|
| Playwright version | 1.64.0 | 1.64.0 | yes |
| Browser version | 157.0 | 157.0 | yes |
| User-Agent | `Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0` | identical | yes |
| Fixture sha256 | `ad69ef175dae42b1…` (1260 bytes) | identical | yes |
| First-shot sha256 (both runs) | `a792a1e3aba89324…` | identical | yes |
| After-click shot sha256 | `1aef757e7a234b5a…` | identical | yes |
| Firefox binary | `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox` | identical | yes |
| node execPath / sha256 | `…/v24.21.0/installation/bin/node` / `7fde7b8a…` | identical | yes |
| Receipt `envCheck.nameCount` | 17 | 17 | yes |
| Receipt `envCheck.forbiddenNames` | `[]` | `[]` | yes |
| Wrapper gate `self.nameCount` | 267 | 267 | yes |
| Wrapper gate `child.ok` | true | true | yes |
| Firefox tree shape | 7 pids (firefox, forkserver, Socket Process, WebExtensions, RDD Process, Web Content, Utility Process) | same set | yes |

### 4.3 Nonce / key freshness across the two attempts

The two attempts are cryptographically independent — no key or nonce reuse:

```
attempt-1 runNonce 7be40389dde8dd41dd07b14e84e2d208722782c11ab2e699502752dc97610f44
attempt-2 runNonce d2c85f6eebbdd8ed1991e3eb457499f6f002dbda6334422876287e80aa266e5c
attempt-1 wrapper pubkey MCowBQYDK2VwAyEAhC9nGkrhKkESKdqnjU8Xb8pzAKmHfP8jlbcKyt20gDQ=
attempt-2 wrapper pubkey MCowBQYDK2VwAyEAEYYWsPtD35E9SEtw/PHWjdChqehBYLLP4MiLZiC3Lm0=
attempt-1 witness pubkey MCowBQYDK2VwAyEAh/RFPd2oGo2YUGNNdY6aiKsy+g+AKwRAcQFkge6JYcg=
attempt-2 witness pubkey MCowBQYDK2VwAyEAqbSEcUj0w8JridttFFsMqgcNupuNSSB1ti17YmwKsis=
```

Distinct run keys, distinct witness keys, distinct nonces across attempts and
across the two runs inside each attempt.

**Conclusion: same host profile.** Same boot epoch, same binaries, same browser and
Playwright build, same fixture and rendered output, same environment gate shape, same
scripted command sequence and same HTTP request log shape — differing only in the
per-invocation keys and nonces, and in the transient egress that occurred once.

---

## 5. Address shape of the non-loopback socket — **not recoverable from the archived bytes**

The seat brief asked for the non-loopback address in the archived run to be reported
shape-only (first octet + port class). I must report that **the shape is not
recoverable**, and why:

An exhaustive sweep of all four archived attempt-1 files:

```
$ grep -ohE '"[0-9]{1,3}(\.[0-9]{1,3}){3}(:[0-9]+)?"' *.json *.stdout | sort -u
  "127.0.0.1:36137"
  "127.0.0.1:42177"
$ grep -ohE '"[0-9A-F]{8}(:[0-9A-F]{4})?"' *.json | sort -u        → (none)
$ grep -ohE '"(peer|rem|remote|local|addr)"' *.json | sort -u     → (none)
$ grep -c 'nonLoopbackRemotes' *.json
  c1-measure-r43.json:0   receipt.json:0   receipt.witness.json:0
```

The only two addresses in the entire archived byte set are the two loopback fixture
ports (`42177` = attempt-1 run1's server, `36137` = run2's). The sample objects in
the archived receipt carry only counts:

```
$ jq '.runs[0].samples[111] | {ss:(.ss|keys), proc:(.proc|keys)}' receipt.json
{ "ss":   ["lines","nonLoopback","ssObs","ticks"],
  "proc": ["inodes","nonLoopback","procObs","ticks"] }
```

No `nonLoopbackRemotes`, no peer field, no hex remote row, no `/proc/net/tcp` row is
persisted anywhere in the archived bytes. The attempt-1 driver was
**byte-reconstructed and confirmed** to lack the recorder field (see §3.4), which is
the mechanical reason. The counter's `egressDetail` entries for the archived receipt
therefore carry `remotes: null` for all 46 records.

**Shape-only reporting is therefore impossible for the archived run, and I decline to
infer one.** What the archived bytes *do* support, and what I state as the shape:

- **count**: exactly **1** non-loopback owned socket per surface per sample
  (`ss.nonLoopback = 1`, `proc.nonLoopback = 1` on every one of the 23 flagged samples;
  the observed socket population per sample was exactly 1 on both surfaces);
- **duration**: **23 consecutive samples**, ~5.4 s, from sample 111 to sample 133
  (the end of run1's sample set), i.e. the tail of run1's 34.5 s span;
- **onset**: abrupt — sample 110 clean, sample 111 flagged, with no ramp;
- **surfaces**: **both** `ss` and `proc` flagged, with identical counts, and the
  `proc` surface independently matched the same socket by inode;
- **offset**: the socket was owned by the Firefox tree (`treePids` present and
  unchanged throughout; the root is
  `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`);
- **not** a listener and **not** the fixture: `portClosed=true` at the final sweep,
  `finalSweep.ss.nonLoopback = 0`, `finalSweep.proc.nonLoopback = 0`, and the fixture
  ports appear only as loopback peers;
- **no first octet, no port class**: unknown, and unknowable from these bytes.

Since the first octet and port class are unknown, the address-shape requirement is
**met only in the count/duration/surface dimensions**. The sensitivity-adjacent
concern raised in the brief cannot be discharged from this evidence; the correct
handling is that the *only* durable remedy is the one the lane already applied — the
frozen driver records `nonLoopbackRemotes` from now on, so any *future* occurrence
on this host is attributable to an exact address. I verified that recorder path works
on synthetic rows (`classifier-test.mjs`: `0808080808080808B8850000:01BB` →
`0808080808080808B8850000:443`; `0100007F:BBE1` → `127.0.0.1:48097`).

---

## 6. Limitations of this audit

1. **I did not re-run the full chain.** The counting command
   (`node scripts/measure-c1-round43.mjs --out … --measure-out … --scratch …`) was
   **not** executed by me: it refuses when the output path already exists, and its
   `--out`/`--measure-out` targets are the **committed** corpus and measure paths —
   running it would either overwrite committed evidence or require writing outside my
   seat directory, which the seat bounds forbid. My reproductions therefore exercise
   the **driver** (the component that produces the egress signal) under the frozen
   committed bytes, and my re-verification of the **counter** is a direct read-only
   invocation against the committed receipt.
2. **The committed receipt is not committed at the freeze revision.** `git ls-tree -r
   7ca6f018 -- corpus/evidence/round43` is empty; the receipt and witness landed in
   the later commit `ba433c94` ("directory commits skip >1MiB new files"). The
   measure record *is* committed at the freeze. This is a commit-graph fact for the
   closure to weigh (C1's `measuredRevision` is still `null`); it is not a defect in
   the bytes, which I verified at HEAD and which hash-match the measure record's
   bindings.
3. **The counter's challenge-response cannot be exercised offline** — by design. My
   committed-receipt counter run therefore ends with `predicate:false` /
   `challengeError:"EINVAL"`; the byte-level limbs all pass (`findings: []`), and the
   in-invocation pass is attested by `measure2.stdout`
   (`counterExit:0`, `challengeVerified:true`, `predicate:true`).
4. **The archived attempt-1 counter bytes (`bbdf1234…`) were not recovered.** I could
   not reproduce that digest from the frozen counter by any variant of removing the
   `egressDetail` block (4 variants tried, no match), and it is present in neither
   the git object store nor the jj store (searched all 13 205 git blobs and all 893
   jj store objects by sha256). The *behavioural* equivalence is nonetheless
   established by the byte-identical predicate sentence (§3.4) and by the frozen
   counter reproducing the refusal on the archived bytes (§3.1). The driver bytes
   **were** recovered exactly (§3.4).
5. **The transient's cause is not identified**, only its class. I did not determine
   *what* opened the socket (no address, no owning process name beyond the tree, no
   host-level log). "Host-environment event" is a classification supported by the
   evidence in §3.2; it is not a root-cause attribution.
6. **Freshness is measured against HEAD `ba433c94`**, not against a future closure
   revision. The bytes I audited are the committed ones; a re-derivation at closure
   must re-run §2.1–§2.3.

---

## 7. Tooling

No tool was installed or upgraded by this seat. Everything used was already present:

| Tool | Version | Channel | Use |
|---|---|---|---|
| `node` | v24.21.0 (fnm-managed, `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/`) | pre-installed | counter invocation, signature re-verification, classifier test |
| `jq` | `/home/vgpnk/.local/bin/jq` | pre-installed | JSON extraction |
| `git` | repo-local, read-only (`git show`/`ls-tree`/`log`/`diff` only) | pre-installed | committed-byte digests, commit-graph facts |
| `python3` | system | pre-installed | digest reconstruction variants |
| `openssl` | system | pre-installed | nonce generation for reproductions |
| `ss` | `/usr/bin/ss` | pre-installed | (read by the driver under audit) |

No `pacman` transaction was run (host-wide pacman transactions are paused).
No network access beyond loopback; no logins; no consequential actions.

---

## 8. Artifacts

All under `.ufo/waves/round-43/w1/SentEgressAudit/` (plus this report at
`.ufo/waves/round-43/w1/SentEgressAudit.md`):

| Path | Contents |
|---|---|
| `failed-run-1/receipt.json` | archived attempt-1 receipt, verbatim copy (sha256 `c9ee082e…`) |
| `failed-run-1/receipt.witness.json` | archived attempt-1 witness, verbatim copy (sha256 `006e165e…`) |
| `failed-run-1/c1-measure-r43.json` | archived attempt-1 measure record (sha256 `8efbf192…`) |
| `failed-run-1/measure.stdout` | archived attempt-1 wrapper stdout (sha256 `9e22b0e3…`) |
| `evidence-consolidated.txt` | digests, counter re-runs, reproduction table (§A–§F) |
| `verify-bindings.mjs` | independent signature/binding/nonce/digest verifier (§2.2) |
| `classifier-test.mjs` | pure-function loopback-classifier + recorder test (§3.4, §5) |
| `pred-diff.mjs` | predicate-sentence byte-equality across attempt-1/attempt-2/frozen/claims (§3.4) |
| `counter-on-committed.json` | frozen counter output vs committed receipt (§2.6) |
| `counter-on-failed.json` | frozen counter output vs archived attempt-1 receipt (§3.1) |
| `evidence-repro-run1.json` | frozen-driver reproduction A (§3.3) |
| `evidence-repro2-run{1,2,3}.json` | frozen-driver reproductions B–D (§3.3) |

Scratch root `/fast/scratch/hyaku/tabi-r43/SentEgressAudit/` was removed after the
audit; every receipt cited above lives in this seat directory, which is not
reaper-eligible.

---

## 9. Findings routed (no amendment proposed — frozen bytes are frozen)

**F-1 (freshness, informational → closure re-derivation).** The round-43 producer
bytes pinned by the freeze (`371823…` driver, `6b8c8750…` counter) are the
**post-refusal** bytes; the round's first measurement ran against `b70e2c14…` /
`bbdf1234…`. The delta is **additive diagnostics only** — the driver gains
`nonLoopbackRemotes`, the counter gains `egressDetail` — and the egress-counting
predicate, the loopback classifiers and the 96-byte predicate sentence are unchanged
and byte-identical across attempt 1, attempt 2, the frozen counter and
`claims.json`. The frozen counter applied to the archived attempt-1 bytes still
yields the 46 egress findings, so the refusal remains reachable by the frozen
instrument. Closure should re-derive this rather than assume the pre-edit bytes.

**F-2 (evidence completeness, informational).** The archived attempt-1 receipt
persists **no** address data for the 46 egress findings — only per-surface counts —
so the transient's remote cannot be reported shape-only (first octet / port class)
from that evidence. The frozen driver records `nonLoopbackRemotes` from now on, so
future occurrences on this host are exactly attributable. Until then, the transient's
address class is **unknown** and I decline to infer it.

**F-3 (observation, informational).** The committed receipt and witness are not
present at the freeze commit `7ca6f018`; they land at `ba433c94`, while the measure
record is present at the freeze. C1's `measuredRevision` is still `null`. The bytes
hash-match the measure record's bindings at HEAD, so this is a commit-graph fact for
the closure to resolve, not a byte defect.

**Nothing here fires C1's kill rule.** No in-model do-nothing reach was demonstrated
(this seat ran no browser-free scoring path: the only direct counter invocation
refused with `challengeError:"EINVAL"`, as designed); no control refused; the
receipt/measure bytes are committed at HEAD and hash-match their bindings.

VERDICT finding — round-43 C1 live measurement is byte- and signature-sound and its environment is the same host profile as the refused attempt 1; the 46-finding refusal classifies as a host-environment transient, but the pre-freeze-to-post-freeze producer delta (F-1) and the archived receipt's absent address data (F-2) are routed for closure re-derivation.
