# ScribeErrata42 — r42 note errata check (tabi round 43, wave 1)

Seat: `ScribeErrata42` (scribe, leaf, judged on **quality**).
Lane repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin` @ `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`
(freeze `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`; baseline `ab592825cd195599822ca227f7768914df208201`).
Scratch: `/fast/scratch/hyaku/tabi-r43/ScribeErrata42/` (deleted at yield).
Tools: node v24.21.0, git 2.56.0 — **no install performed** (pacman guard respected: no pacman
transaction was run; no `uv tool`/cargo/npm install was needed or used).

## Answer up front

The round-43 signing chain **materially supersedes three statements** in
`corpus/knowledge/committed-bytes-verification-round-42.md` and **three routing/historical
statements** in `corpus/lessons/round-42.md` — but only for chains frozen from round 43 on; the
r41/r42 evidence stays exactly as unauthenticated as it was. The append-only errata paragraph
is drafted (house style) in `errata-draft-r42-note.md` and the lesson-level carry-forward in
`errata-draft-r42-lesson.md`. **No production byte was edited.** One live defect was found
along the way and is reported, not amended: the superseding round-43 knowledge note
(`corpus/knowledge/receipt-authenticity-signing-round-43.md`) is **untracked** at both the
freeze and HEAD — the exact round-41 D1 class the r42 note exists to prevent.

Everything below was **observed**, not inferred; the four load-bearing numbers in the errata
(wrapper signature verifies, witness attestation verifies, receipt/witness bindings hold, r42
checker greens V0) were re-derived by me from committed bytes, without the frozen counter,
without a browser run and without any private key.

---

## 1. What was read, and at which pins

| Artifact | Pin as observed |
|---|---|
| `corpus/knowledge/committed-bytes-verification-round-42.md` | 63 lines; sha256 `45547b4d21bcac5a35e52a5e07e1995938f403d400683959bcd39a3af52d541e`; blob `1658a10573c5c434da57b3b2dc1867f997ae7de4` at `ba433c94`; worktree bytes == committed bytes (unmodified) |
| `corpus/lessons/round-42.md` | sha256 `7da6dfebb19ea1a7b645529359c5dcbc6170ab823494bbd7d2c1a8319bf1c3f2`; blob at `7ca6f01` and at `ba433c94` |
| `corpus/knowledge/receipt-authenticity-signing-round-43.md` (the superseding note) | sha256 `b8cee7faa378fcf61ce4ea3d815d83bb439bacaaf6deabb92d904aeb73889b48`; **not committed** at `7ca6f01` nor `ba433c94` |
| `.ufo/waves/round-43/claims.json` | freeze; `frozenDigests` (6 entries), `controlBindings` (8 entries), both claims `"verdict": "pending"` |
| `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` | sha256 `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c` |
| `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs` | sha256 `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743` |

All six `claims.json.frozenDigests` equal the sha256 of the corresponding committed blobs at
`ba433c94` (`ev-01`, `ev-02`, `ev-06`). Nothing in the freeze drifted.

## 2. The supersessions (what the errata says)

### S1 — §Limitations bullet 2 is superseded **in part** (note lines 61–63)

The note ranks bindings: *"sha256 binding to an independently recorded measure document (as
R1 does) is the weakest binding used here; producer digests (round-41 chain) remain the
stronger instrument for executable evidence."*

- Still true of the r41/r42 chain: the round-42 wave showed a hostile committer satisfying
  that binding with no measurement (reproduced below: r42 checker exit 0, zero findings).
- Superseded for **new** chains: the r43 chain puts three layers above the sha256 pair —
  an Ed25519 wrapper signature over the canonical unsigned measure record, an independent
  witness attestation under the witness's own key, and a fresh per-invocation challenge.
- Narrowness is stated in the errata: this does **not** authenticate the r41/r42 evidence.

### S2 — the §Decision table (lines 25–30) understates the failure mode and lacks the row r43 makes load-bearing

Row 3 (`git show <rev>:<path>` + sha256) catches "byte drift". The round-42 wave's actual
failure mode is a **coherent** forgery, whose bytes agree with each other — not byte drift —
and it is not caught by a sha256 pair. The errata adds the row the r43 chain relies on
(commit-time signature + invocation-time challenge) and reclassifies row 3 as the **floor**.

### S3 — §Falsification (lines 47–55) names a checker that is no longer the falsifier of record

Exit 0 of the round-42 checker is not sufficient for a receipt-carrying claim (V0 greens it).
The corrected falsifier is the round-43 checker. **Plus a pointer defect found here:** the
round-43 controls name fixture revisions (`a1f38877…`, `d28c2789…`) that are **not objects in
the lane repo's object store** — `git cat-file -t <rev>` fails in the lane repo — so the fixture
probes are re-runnable only by re-running the committed generators, not by checking out the named
revisions. Under the note's own Rule 1 (a pointer must name a revision that contains it) those
fixture pointers do not satisfy the rule, and the round-43 note inherits the gap.

### S4 — front-matter `recheck:` (lines 6–7) points at the falsified instrument

The recheck instruction names the round-42 checker's R1/R4 commands — the ones round 43
falsified. The errata re-points the recheck at the round-43 checker.

### S5 — what does **not** move: Rules 1–4 stand, and rule 4 re-fired in r43

Rules 1–3 are unchanged and were exercised again in r43 (committed receipt/witness/measure
record at `ba433c94`; `bindings` re-derived from committed blobs; the r43 baseline control
carries its `git ls-tree … | wc -l` command and the digit `0`; the r43 checker's r5 rule now
enforces verbatim-quote binding of the freeze's own controls). Rule 4 re-fired: the two
>1 MiB files (1,182,481 B and 1,195,319 B) were skipped by the directory commit and landed
only when named explicitly (`ba433c94` commit subject) — the round's own `ls-tree` caught it
before citing.

### S6 — carried from round 42, not an r43 supersession: rule 4's mechanism is unsourced

"the lane helper skips new files over 1 MiB inside a named directory" names a mechanism no
registry row and no `scripts/` helper grounds (round-42 `w1/ConnSelfOverlap` finding F4). r43
re-observed the behaviour, not the attribution. Recorded, not amended.

## 3. Lesson-level supersessions (`corpus/lessons/round-42.md`)

| Lesson line | Text | Status in r43 |
|---|---|---|
| `:128` (Mistakes table) | route: "wrapper signs with a per-invocation key, **public half pinned in claims**; counter refuses unpinned `--pins`" | discharged by a **stricter** mechanism than routed: `claims.json` pins **no** key at all (grep-verified: no `pubkey`/`publicKey`/`ed25519` field); the counter's argv admits no `--pins`/`--nonce`/`--witness` (`c1-signature-bound-v5.mjs:239`) — the flag does not exist to be refused |
| `:68` (C2 disposition) | repair path: "pinned measure blob id `8ff64d69…` + a verdict-probe scoring 0/38 on V0" | discharged: pin implemented at `check-routed-defects-round43.mjs:27`; pin still resolves at HEAD as a `blob`; r6 requires the committed probe to record `refused: true` and name `r1-measure-blob-pin-mismatch`; reproduced (V0: r42 bytes exit 0/0 findings, r43 bytes exit 1) |
| C1 section | "the in-process nonce binds only the live wrapper invocation, not scored-over-committed-bytes scoring"; "the r41-replay control itself is defeated by nonce relabeling" | superseded **for new chains only** by the signature layer + the challenge wall; the round-42 counter bytes remain defeated by relabeling — history, not a live hole |

All three carry the caveat that they are statements about **instrument bytes**, not a claim
verdict: `claims.json` still carries `"verdict": "pending"` for both C1 and C2, and the r43
admission decision is the closure's.

## 4. Findings

### F1 (material, live) — the superseding round-43 note is uncommitted: the D1 class, in the round that supersedes it

```
$ git cat-file -t 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:corpus/knowledge/receipt-authenticity-signing-round-43.md
fatal: path 'corpus/knowledge/receipt-authenticity-signing-round-43.md' exists on disk, but not in '7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc'
$ git cat-file -t HEAD:corpus/knowledge/receipt-authenticity-signing-round-43.md
fatal: path 'corpus/knowledge/receipt-authenticity-signing-round-43.md' exists on disk, but not in 'HEAD'
```

(`ev-03`, `ev-04`, `ev-06`). Its coverage row is likewise an uncommitted worktree edit to
`corpus/README.md` (`ev-04`). Same for `corpus/lessons/round-43.md`. **This is the round-41 D1
failure mode — a document treated as durable while it exists only as untracked working-tree
bytes — reproduced in the very round that writes the discipline against it.** Consequence for
my errata: the supersession is grounded in committed bytes (measure record, receipt, witness,
counters, controls, freeze), never in the r43 note's prose; the note is cited by sha256 until
the closure commits it. Routed to the closure; not amended by me.

### F2 (material, instrumentation) — the r43 controls name fixture revisions that are not objects in the lane repo

```
$ git cat-file -t d28c27897e203857195a88e59683b6c129d0c804   # c2-tree-fixture.json fixtureRev
fatal: git cat-file: could not get object info
$ git cat-file -t a1f3887724f5ec3f6213c068199e9d8454948ece   # c2-v0-probe.json fixtureRev
fatal: git cat-file: could not get object info
```

Both fixtures are reproducible only by re-running the committed generators (I did; see §5),
which is what makes the controls checkable at all — but the revision pointers as written fail
the r42 note's own Rule 1. The r43 note's "Falsification" paragraph cites those controls and
inherits the gap.

### F3 (minor, accuracy) — the r42 note's rule 4 mechanism attribution stays unsourced (carried from r42 `w1/ConnSelfOverlap` F4).

### F4 (non-finding, recorded) — the r42 note has no `## Errata` section today

The first round-43 append therefore creates the section (header + `- (none yet)` placeholder),
matching the house shape at `corpus/knowledge/webbridge-plugin-anatomy.md:222`.

## 5. What I actually ran (exact commands, exact outcomes)

All git commands are read-only (`cat-file`, `rev-parse`, `ls-tree`, `show`, `status`); the
fixture generators write only under my scratch and were run from scratch; the lane repo was
never written to.

1. **Frozen-digest re-derivation** — `sha256sum` of the six frozen paths vs
   `claims.json.frozenDigests`: **6/6 identical** (`ev-01`, `ev-02`).
2. **Committed-byte type check at the freeze** — `git cat-file -t 7ca6f01:<path>` for the six
   frozen paths + the two notes + the r42 lesson: six `blob`, the r42 note and lesson `blob`,
   the r43 note and r43 lesson **absent** (`ev-03`).
3. **Presence/absence at HEAD + README diff** (`ev-04`): the r43 note and r43 lesson absent;
   `corpus/README.md` carries an uncommitted coverage row for the r43 note.
4. **Commitment of the r43 evidence** (`ev-05`): `git ls-tree -r --name-only HEAD` lists
   `corpus/evidence/round43/playwright-egress/receipt.json`, `receipt.witness.json` and
   `.ufo/waves/round-43/measure/c1-measure-r43.json`.
5. **Independent re-derivation of the signing chain from committed bytes** —
   `node verify-r43-chain.mjs HEAD` (script in this seat dir; `git show HEAD:<path>` only, no
   private key, no browser, the frozen counter never invoked) → `ev-06`:

   | property | observed |
   |---|---|
   | wrapper signature over canonical unsigned measure record | `over` = `1c539378ffed7a7961a82ec6475d7e753469139bcb3aa1181481daf7dffdca6d`, `signatureVerifies: true`, scheme `ed25519` |
   | witness attestation (own key) | `over` = `8a3375f6…` matches, `attestationVerifies: true`, 795 witness samples |
   | witness/measure key separation | `measurePubkeyMatchesAttestationPubkey: true`, `witnessNonceEqualsMeasureNonce: true` |
   | receipt binding | committed receipt sha256 `1b33d6a6b25681045bebf80bf371faa4c94db7ecc49298a7fe2f68536fe2d9bf` == signed `bindings.receiptSha256` ✔ (1,182,481 B) |
   | witness binding | committed witness sha256 `0728d338f3b53a672b3404f548a2ed9bf982394c8660fcdf7a5c5789eeef2b2b` == signed `bindings.witnessSha256` ✔ (1,195,319 B) |
   | producer digests | signed digests == committed blobs == `claims.json` pins, 3/3 `allEqual` |
   | C2 anchor | `git rev-parse HEAD:.ufo/waves/round-41/measure/c1-measure.json` == pinned `8ff64d691f5c09569a50f2a5a038bb23774c3d35`, `cat-file -t` = `blob` |
   | r42 note | blob `1658a105…`, sha256 `45547b4d…` (== worktree) |
   | r43 note | `NOT-COMMITTED-AT-REV` |

6. **V0 fabrication reproduction** — `node .ufo/waves/round-43/fixtures/v0-fabrication.mjs
   --out <scratch>/ev-08-v0-probe-reproduced.json --work <scratch>/work --slice
   .ufo/waves/round-42/quarantine/slice-ids.txt` → exit 0; receipt identical to the committed
   control except the fixture revision (`6777d7fc…` vs the control's `a1f38877…`; fixture
   commits embed a timestamp), `generatorDigest` identical (`b8747062…`):
   **r42 checker exit 0, `r42FindingIds: []`; r43 checker exit 1, `r1-measure-blob-pin-mismatch`,
   `r5-claims-absent`, `r6-probe-absent`** (`ev-08`).
7. **Tree-vs-blob reproduction** — `node .ufo/waves/round-43/fixtures/tree-vs-blob.mjs --out
   <scratch>/ev-09-tree-fixture-reproduced.json --work <scratch>/work` → exit 0; finding-id sets
   identical to the committed control: **r42 names `r1a-unparseable` (no type violation),
   r43 names `r1a-not-a-blob`** (`ev-09`).
8. **Receipt span re-computation from committed bytes** (`ev-10`): 2 runs, 132 samples each,
   spans **18,588 ms / 25,649 ms**, `egressNonLoopback` 0, `browserVersion` 157.0, identical
   `firstShotSha256` across runs — matching the r43 note's recorded spans and the counter's
   `shot-hash-diff` clause.
9. **Lesson routing lines and note line numbers** captured for citation (`ev-11`, `ev-12`).

## 6. Deliverables in this seat dir

| File | Content |
|---|---|
| `errata-draft-r42-note.md` | **the append-only errata paragraph** for `corpus/knowledge/committed-bytes-verification-round-42.md`, house style (dated block, pre-append sha256, VERIFIED/SUPERSEDED markers), with drafting notes for the integrating seat |
| `errata-draft-r42-lesson.md` | lesson-level carry-forward paragraph (3 supersessions, as-routed vs as-built) |
| `report.md` | this report |
| `verify-r43-chain.mjs` | the independent re-derivation script (read-only; `git show` only) |
| `ev-01` … `ev-12` | raw command outputs behind every number above |

## 7. Limitations and what I did NOT run

- **No claim verdict is asserted.** C1/C2 admission is the closure's; `claims.json` says
  `pending` for both. Every statement above is about instrument bytes.
- **I did not run the frozen counter**, the live browser chain, or the battery: the counter is
  wrapper-invoked only (`c1-signature-bound-v5.mjs:239` refuses any other argv), and the
  round-43 wave's own seats own those runs. My re-derivation is a *separate* implementation of
  the same canonicalisation, so it corroborates rather than certifies the counter.
- **The challenge-response is not re-derivable from committed bytes** — it needs the live
  invocation and the never-persisted private half. That is why the erratum's supersession claim
  is scoped to the signature/witness layers and to the challenge's *design*, not to a replayed
  challenge.
- **The freeze-rev run of my script aborted** (`ev-07-verify-r43-chain-freeze.err`): the receipt
  and witness are not committed at `7ca6f01` — they landed later, at `ba433c94`. That is a fact
  about the wave's landing order, recorded rather than worked around.
- **The r43 note's own prose was not audited** (out of my item's scope) and its untracked
  status means any citation of it by revision would be unresolvable until the closure commits it.
- No HTTP fetches were performed by this seat; nothing outside the lane repo and my scratch was
  read or written; no git/jj mutation, no commit, no push, no agent dispatch.

## 8. Boundary and hygiene

- Files written: **only** under `.ufo/waves/round-43/w1/ScribeErrata42/` and the wave report
  file `.ufo/waves/round-43/w1/ScribeErrata42.md`. No production byte was edited; the r42 note
  and lesson are byte-identical to their committed blobs (verified).
- `git status` before and after this seat is identical: ` M corpus/README.md` (pre-existing,
  not mine) plus the untracked `.ufo/waves/round-43/w1/`, `.ufo/waves/round-43/w1.ready.dispatched`,
  `corpus/knowledge/receipt-authenticity-signing-round-43.md`, `corpus/lessons/round-43.md`.
- Scratch `/fast/scratch/hyaku/tabi-r43/ScribeErrata42/` deleted at yield (fixtures and
  receipts copied into this seat dir first).
- Tooling: no install of any kind was performed; node v24.21.0 and git 2.56.0 (pre-existing)
  were used. The pacman guard was respected — no pacman transaction was run.

VERDICT finding r42 note's sha256-binding limitation and falsifier are superseded for new chains (Ed25519 signature + witness attestation + challenge wall, re-derived from committed bytes), but the superseding r43 note is untracked at freeze and HEAD (D1 class) and the r43 controls' fixture revisions are not objects in the lane repo — both routed, not amended.
