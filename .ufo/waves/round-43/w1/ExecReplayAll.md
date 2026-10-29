# ExecReplayAll — replay r39–r42 C1 receipts through the frozen counter v5

Seat: `ExecReplayAll` · lane: tabi round 43, wave 1 · judged on: coverage
Milestone: replay r39–r42 receipts through v5 · wave item: `ExecReplayAll`

## Verdict in one line

All four historic rounds (39, 40, 41, 42) **refuse** the round-43 counter v5 (every exit
≠ 0; 4/4 refused), but the committed frozen control
`.ufo/waves/round-43/controls/c1-replay-r42-refused.json` is **not re-derivable** at the
frozen tree — its recorded `counterFindings` list carries two `digest-mismatch:` entries
that no longer occur, because the committed driver/counter bytes now equal the frozen pins
exactly — and a missing `--measure` file makes v5 crash with exit 2 instead of emitting a
structured refusal.

---

## 1. Scope, bounds, tooling

* **Read-only**: the production tree `/home/vgpnk/Projects/shokunin/tabi-shokunin` outside
  my seat dir, the fleet root `/home/vgpnk/Projects/shokunin`, sibling `*-shokunin` repos,
  and `/home/vgpnk/Projects/shokuknow`. Nothing was written, committed, fetched or pushed
  there; no git/jj mutation anywhere; no commits; no pushed refs; no subagents dispatched
  (leaf).
* **Written**: only `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecReplayAll/`
  (this report + `evidence/`) and this trailer file
  `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecReplayAll.md`;
  plus the scratch root `/fast/scratch/hyaku/tabi-r43/ExecReplayAll/`, which was deleted
  before yielding.
* **Tooling**: no install was needed and none was performed. Node `v24.21.0`
  (fnm-managed, `/run/user/1000/fnm_multishells/.../bin/node`) and `git` were already
  present; the node binary's sha256 `7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c`
  equals the frozen `producerPins.nodeSha256`, and the Playwright Firefox binary's sha256
  equals the frozen `producerPins.firefoxBinSha256`. **No pacman transaction was run**
  (host-wide pacman guard).
* **Network**: none. Loopback only; no HTTP GET was needed by this item.

## 2. Method — how the counter was invoked, and the one caveat that matters

The frozen counter is `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`
(sha256 `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`, equal to the
pin in `claims.json`; the file was added by the freeze commit `7ca6f018`).

**It was executed in place from the lane repo, not copied to scratch.** Reason: the
counter digests *itself* (`fileURLToPath(import.meta.url)`) and compares the digest to the
frozen pin, so a scratch copy would inject a spurious `digest-mismatch:` finding into
every run. Running the frozen bytes in place is read-only (the counter only reads files
and writes to stdout/stderr) and keeps the self-digest check meaningful.

**Caveat recorded, as the item asked**: the counter reads `CLAIMS` from a **hardcoded
lane path** —
`const CLAIMS = ROOT + '/.ufo/waves/round-43/claims.json'` with
`ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin'` — i.e. the *working-tree*
`claims.json`, not a copy, not a rev-pinned blob. That file is byte-identical to the
frozen one (`sha256 290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029`
== `git show 7ca6f018:.ufo/waves/round-43/claims.json | sha256sum`), so the pins used at
run time are the frozen pins. The same hardcoded `ROOT` is used for the two producer
scripts it digests.

**Invocation shape.** The counter's argv is strict: `<receipt.json> --measure <measure.json>`
(exactly three args; `--pins`/`--nonce`/`--witness` are rejected). The counter then
performs a challenge–response over **fd3/fd4**: it writes a fresh 32-byte challenge to
fd3 and reads an Ed25519 signature of those bytes back from fd4. That channel exists only
inside the wrapper invocation. Every replay below therefore closed fds 3 and 4
(`3>&- 4>&-`) so the write fails and the challenge can never be answered by an offline
invocation.

Exact command shape (per run; `RECEIPT`/`MEASURE` substituted):

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
     <RECEIPT> --measure <MEASURE> 3>&- 4>&- > out/<tag>.stdout 2> out/<tag>.stderr
```

(`run-replay.sh` in `evidence/` is the exact script used; it `cd`s into the scratch root
first so no relative path can leak.)

## 3. Receipts and measure records used

Round-39's receipt path was recovered from round-39's own wave material
(`.ufo/waves/round-39/w1/RevC1Receipt/report.md:23` and
`corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md:11`), because
`.ufo/waves/round-39/claims.json` names only the round-39 counter and its round-38 control.
Full path/rev/sha256 table and the HEAD-vs-extracted byte-identity check (all nine paths
`SAME`, all `blob` type) are in `evidence/extraction.md`.

**Round-39 has no measure record.** `git log --all --name-only` over every path under
`round-39/measure` yields only census/before/probe `.txt` files and
`proc-endian-{before,after}.json` — the Ed25519 signed measure artifact only exists from
round 41 on. Round-39 was therefore replayed twice: with the measure slot absent (the
honest "own measure" state) and against round-40's own measure record, so its refusal is
not merely an artifact of a missing file.

## 4. Results — every round refuses

| round | receipt (rev) | measure used | exit | findings | first findings |
|---|---|---|---|---|---|
| 39 | `corpus/evidence/round-39/playwright-egress/receipt.json` (`690b0500`) | *none exists* → slot probed with an absent path | **2** | n/a (crash, see §6) | stderr `could-not-evaluate: Cannot read properties of null (reading 'nonce')` |
| 39 | same receipt | `corpus/evidence/round40/playwright-egress/measure.json` (round-40's own, `22883df6`) | **1** | 60 | `schema`, `measure-nonce-shape`, `env-check-unreadable`, `env-check-forbidden`, `env-check-execargv`, `env-check-nonce`, `run1-sample-span`, `run1-sample1-tree-empty` |
| 40 | `corpus/evidence/round40/playwright-egress/receipt.json` (`22883df6`) | `corpus/evidence/round40/playwright-egress/measure.json` (own; byte-identical to `.ufo/waves/round-40/measure/c1-live-run.json`) | **1** | 77 | `schema`, `measure-nonce-shape`, `run-nonce-mismatch`, `env-check-unreadable`, `env-check-forbidden`, `env-check-execargv`, `env-check-nonce`, `run1-sample1-tree-empty` |
| 41 | `corpus/evidence/round41/playwright-egress/receipt.json` (`9b6de3a1`) | `.ufo/waves/round-41/measure/c1-measure.json` (own, `123e55c7`) | **1** | 8 | `schema`, `measure-nonce-shape`, `run-nonce-mismatch`, `witness-unreadable`, `measure-schema`, `measure-signature-invalid`, `receipt-binding-mismatch`, `witness-binding-mismatch` |
| 42 | `corpus/evidence/round42/playwright-egress/receipt.json` (`22795661`) | `.ufo/waves/round-42/measure/c1-measure.json` (own, `236c4f49`) | **1** | 8 | *identical list to r41* |

**4/4 rounds refused (exit ≠ 0).** In every run the counter also reported
`challengeVerified: false`, `challengeError: "EINVAL"` (the fd3 write failed, no challenge
was answered) and `predicate: false`; `measureSignatureVerified` and
`witnessAttestationVerified` were `false` for every historic round.

Per-round receipts: `evidence/r39-xround.stdout.txt`, `evidence/r40-own.stdout.txt`,
`evidence/r41-own.stdout.txt`, `evidence/r42-own.stdout.txt`, plus the machine-readable
`evidence/replay-summary.json` (all findings, exits, digests, revs).

### Why each round refuses (short)

* **r39 / r40** — receipts carry the pre-r41 schemas (`tabi-pw-firefox-egress-receipt-v2`,
  `…-r40`) and pre-r41 receipt shapes: no `envCheck` block, no per-sample `treePids`,
  no `owned.roots` → `env-check-*`, `*-tree-empty`, `*-no-firefox-exe`,
  `*-root-exe`, `*-summary-*-mismatch`, `*-zero-{ss,proc}-observation`; no witness file
  beside the receipt → `witness-unreadable`; their measure records are unsigned
  (`tabi-r40-c1-measure`) → `measure-schema`, `measure-signature-invalid`,
  `receipt-binding-mismatch`, `witness-binding-mismatch`, `wall-clock-inconsistent`,
  `gate-contaminated`.
* **r41 / r42** — the receipts are `tabi-pw-firefox-egress-receipt-r41` and their witness
  files are `tabi-r41-witness`, not the v5-expected `tabi-pw-firefox-egress-receipt-r43` /
  `tabi-r43-witness` → `schema` + `witness-unreadable`; their measure records are
  `tabi-r41-c1-measure` with no Ed25519 wrapper signature and no `nonce`/`pubkeys` →
  `measure-nonce-shape`, `run-nonce-mismatch`, `measure-schema`,
  `measure-signature-invalid`, `receipt-binding-mismatch`, `witness-binding-mismatch`.
  (Side observation, not a v5 issue: round-42's measure record is still labelled
  `tabi-r41-c1-measure` and still carries round-41's producer digests while pointing
  `out`/`witness` at the round-42 paths — a labelling carry-over in the round-42
  artifact, recorded here for the closure, not scored by v5.)
* No historic receipt triggers a `digest-mismatch:` finding at the frozen tree, and no
  historic receipt passes any static gate.

### Positive control (supplementary, overlaps sibling `CritC1ReachDirect`)

The **genuine** round-43 pair (`corpus/evidence/round43/playwright-egress/receipt.json` +
`receipt.witness.json` at `ba433c94`, measure
`.ufo/waves/round-43/measure/c1-measure-r43.json`) replayed by direct invocation gives
**exit 1** with **0 static findings**, `measureSignatureVerified: true`,
`witnessAttestationVerified: true`, and the *only* failing gate is the unanswered
challenge (`challengeError: "EINVAL"`). Evidence:
`evidence/r43-own.stdout.txt`. This shows the refusal of r39–r42 is not produced by a
hostile/awkward input: for a genuine round-43 artifact every static layer passes and the
wrapper-only challenge gate is what stops a direct invocation. I did **not** pursue the
direct-invocation do-nothing hunt — that is sibling seat `CritC1ReachDirect`'s item.

## 5. Finding — the committed control `c1-replay-r42-refused.json` is not re-derivable

The freeze's control `.ufo/waves/round-43/controls/c1-replay-r42-refused.json` records
the *same* replay I ran (r42 committed receipt + r41 measure record, direct invocation):

```
recorded:  exit 1, challengeError "EINVAL", refused true, predicate false,
           counterFindings = [ schema, measure-nonce-shape, run-nonce-mismatch,
             witness-unreadable,
             digest-mismatch:scripts/playwright-firefox-egress-round43.mjs,
             digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs,
             measure-schema, measure-signature-invalid,
             receipt-binding-mismatch, witness-binding-mismatch ]   (10 entries)

reproduced at the frozen tree: exit 1, challengeError "EINVAL", predicate false,
           counterFindings = [ schema, measure-nonce-shape, run-nonce-mismatch,
             witness-unreadable, measure-schema, measure-signature-invalid,
             receipt-binding-mismatch, witness-binding-mismatch ]      (8 entries)
```

* The **conclusion reproduces exactly** (refused, exit 1, same `challengeError`).
* The **recorded finding list does not**: the two `digest-mismatch:` entries are absent,
  and no extra findings appear. Those two entries can only have been produced when the
  on-disk bytes of `scripts/playwright-firefox-egress-round43.mjs` and of
  `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` differed from the digests then
  pinned in `claims.json`. At the frozen tree they are **equal** to the pins — verified:
  `3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e` and
  `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c` vs the pins in
  `claims.json` `frozenDigests` — and the self-digest check necessarily passes when the
  counter runs in place from its committed path.
* All three files (the control, the driver, the counter) were added by the **same**
  commit `7ca6f018`, so the control is a *pre-final* artifact of the authoring session:
  it was produced before the producer bytes were final, and it records a state that no
  longer exists at the freeze it is bound to.
* Why this matters: the C2 rule r5 (`freeze-binds-controls`) binds each control by sha256
  plus one verbatim quote line, and the quote line is present, so r5 passes — but a
  control whose *recorded observations* cannot be re-derived at the frozen tree is the
  same conformance class that got round 42 closed ("r42 closure conformance defect 1":
  the freeze enumerated five baseline finding ids while its committed control carried
  seven). This one is milder (the refusal itself holds; only the finding list is stale)
  but it is the same class, so it is routed rather than absorbed.
* Evidence: `evidence/control-diff.json`, `evidence/control-cmdexact.stdout.txt`,
  `evidence/run-control-exact.sh` (the exact command from the control's own `command`
  field).

**Routing (no amendment proposed; the counter and claims bytes are frozen):** the fix
belongs to round 44 — regenerate `c1-replay-r42-refused.json` at the frozen bytes, or
add a freeze-time rule that binds a control to the exact counter invocation that
produced it (argv + working-tree digests), so a control's recorded findings are
re-derivable. Nothing in the frozen bytes was touched by this seat.

## 6. Secondary observation — v5 crashes (exit 2) instead of refusing cleanly when `--measure` is unreadable

```
$ node …/c1-signature-bound-v5.mjs <r39 receipt> --measure <absent path> 3>&- 4>&-
stderr: could-not-evaluate: Cannot read properties of null (reading 'nonce')
exit:   2
```

`evaluate()` reads `measureDoc.nonce` before its own `measureDoc === null` guard, so a
missing/unparseable `--measure` file raises an uncaught `TypeError` and the counter dies
with the generic `could-not-evaluate` path instead of emitting a structured
`tabi-r43-c1-measured-v5` refusal document. It still **refuses** (exit 2 ≠ 0) and the
wrapper always supplies a real measure record, so this is not a claim hole; it is an
instrument-robustness wart worth one line in round 44 (e.g. hoist the null check above
the `nonce` read, or emit the structured doc with `measure-unreadable`).
Evidence: `evidence/r39-nomeasure.stderr.txt`, `evidence/r39-nomeasure.exit.txt`.

## 7. Limitations — what this seat did **not** exercise

Stated plainly so nothing here is read as a claim verdict:

* **Not tested**: the synthetic-pair forgery limb (own wrapper key + own witness key +
  self-consistent r43-schema pair, challenge answered on fd3/fd4) — sibling seat
  `CritC1ReachSynth`'s item.
* **Not tested**: the direct-invocation do-nothing hunt on counter v5 — sibling seat
  `CritC1ReachDirect`'s item.
* **Not tested**: the replay/rescoring family classification (rescoring the genuine
  round-43 pair with a minted wrapper key) — sibling seat `CritC1ReachReplay`'s item.
  My §4 positive control only shows that a *direct* invocation of the genuine pair
  refuses; it says nothing about a re-signed measure record.
* **Not tested**: mutation of the counter (e.g. `challengeVerified` forced true) —
  sibling mutation seats `MutC1Challenge`, `MutC1Sig`, `MutC1Nonce`, `MutC1Witness`.
* No browser was launched by this seat, so no fresh round-43 measurement was produced and
  no claim predicate was scored here; this seat only reports *refusals* of historic
  artifacts, which is what its item asks for.
* The counter's `CLAIMS` read is from the working tree (hardcoded path). I verified the
  working-tree bytes equal the frozen ones today; a future edit to `claims.json` would
  silently change the pins the counter enforces. That coupling is a property of the
  frozen counter, noted for round 44, not exercised here.

## 8. Evidence index

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecReplayAll/evidence/`:

| file | what it is |
|---|---|
| `replay-summary.json` | machine-readable per-round exit, findings (full), digests, revs, challenge/measure/witness verification flags |
| `control-diff.json` | recorded vs reproduced `c1-replay-r42-refused.json` findings, with the recorded-only / reproduced-only delta |
| `extraction.md` | receipt/measure revs + sha256, HEAD byte-identity, round-39 path discovery, round-39-has-no-measure evidence, producer pin check |
| `r39-xround.stdout.txt` / `.exit.txt` | r39 receipt vs round-40 measure record — exit 1, 60 findings |
| `r39-nomeasure.stderr.txt` / `.exit.txt` / `.stdout.txt` | r39 receipt with the measure slot absent — exit 2 crash |
| `r40-own.stdout.txt` / `.exit.txt` | r40 receipt vs r40's own measure — exit 1, 77 findings |
| `r41-own.stdout.txt` / `.exit.txt` | r41 receipt vs r41's own measure — exit 1, 8 findings |
| `r42-own.stdout.txt` / `.exit.txt` | r42 receipt vs r42's own measure — exit 1, 8 findings |
| `r43-own.stdout.txt` / `.exit.txt` | positive control: genuine round-43 pair, direct invocation — exit 1, 0 static findings |
| `control-cmdexact.stdout.txt` / `.exit.txt` / `.stderr.txt` | exact re-run of the committed control's recorded command |
| `run-replay.sh`, `run-control-exact.sh`, `collect.sh`, `mkevidence.mjs` | the exact scripts used, for reproduction |

Scratch root `/fast/scratch/hyaku/tabi-r43/ExecReplayAll/` was deleted before yielding.

VERDICT finding all four historic rounds refuse counter v5 (4/4, exits 2/1/1/1), but the frozen control c1-replay-r42-refused.json is not re-derivable (2 stale digest-mismatch findings) and v5 exits 2 by crashing on an unreadable --measure file.
