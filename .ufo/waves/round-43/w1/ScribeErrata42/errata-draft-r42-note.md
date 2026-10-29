# Draft errata — append-only block for `corpus/knowledge/committed-bytes-verification-round-42.md`

**Status: DRAFT, NOT APPLIED.** Production bytes were not edited by this seat
(`corpus/knowledge/committed-bytes-verification-round-42.md` is byte-identical to its
committed blob — see `ev-11-r42-note-numbered.txt` and `ev-06-verify-r43-chain-head.json`).
This file is the append-only errata paragraph, drafted in the house errata style, for the
integrating seat to append verbatim to the end of the r42 note (the note currently has **no**
`## Errata` section — the section header below is new and must be added with the first block).

Target of the append: `corpus/knowledge/committed-bytes-verification-round-42.md`
(63 lines, sha256 `45547b4d21bcac5a35e52a5e07e1995938f403d400683959bcd39a3af52d541e`,
blob `1658a10573c5c434da57b3b2dc1867f997ae7de4` at
`ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`).

Grounding revisions used by the block: freeze `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`;
HEAD `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`; lane repo
`/home/vgpnk/Projects/shokunin/tabi-shokunin`.

---

## Errata (append-only — never edit above; append dated blocks below)

- (none yet)

Appended 2026-10-29 (tabi round 43, wave 1, seat ScribeErrata42 — r42-note errata check;
evidence and this draft under `.ufo/waves/round-43/w1/ScribeErrata42/`; nothing above is
edited). Pre-append sha256 of this file:
`45547b4d21bcac5a35e52a5e07e1995938f403d400683959bcd39a3af52d541e` (blob
`1658a10573c5c434da57b3b2dc1867f997ae7de4` at
`ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`). The post-append hash necessarily differs —
re-derive with `sha256sum`.

- **[2026-10-29, supersession] §Limitations bullet 2 (lines 61–63) — SUPERSEDED IN PART:
  for a chain frozen from round 43 on, sha256 is no longer the load-bearing binding.** The
  bullet ranks bindings for executable evidence: "sha256 binding to an independently recorded
  measure document (as R1 does) is the weakest binding used here; producer digests (round-41
  chain) remain the stronger instrument". That ranking is still correct **as a statement about
  the r41/r42 chain** — the round-42 wave showed a hostile committer satisfying it with no
  measurement at all. It is superseded for **new** chains, where three layers sit above the
  sha256 pair: (a) an Ed25519 wrapper signature over the canonical unsigned measure record
  (scheme `ed25519`; `over` = sha256 of the canonical form), (b) an independent witness
  attestation signed under the witness's **own** per-invocation key, and (c) a fresh 32-byte
  counter challenge over fd3/fd4 that only the invocation's never-persisted private half can
  answer. Observed here **from committed bytes alone** (no browser run, no private key, at
  `ba433c94`): the wrapper signature verifies (`over` = `1c539378…`, `signatureVerifies:
  true`); the witness attestation verifies under the witness key, the measure record's
  `pubkeys.witness` equals the attestation's `publicKey`, and the witness nonce equals the
  measure nonce; the committed receipt (1,182,481 B) and witness (1,195,319 B) bytes hash to
  the signed bindings `1b33d6a6…` / `0728d338…`. Read the supersession narrowly: it changes
  which binding carries a **new** claim, it does **not** authenticate the r41/r42 evidence,
  which carries no signature and stays unauthenticated.
- **[2026-10-29, decision table] §Decision table (lines 25–30) — row 3 understates the failure
  mode, and the table is missing the row round 43 makes load-bearing.** Row 3
  (`git show <rev>:<path>` + sha256) claims to catch "byte drift between claimed and delivered
  revisions". True — but the round-42 wave exhibited the failure mode this cell does not
  name: a **coherent** forgery, whose bytes agree with each other, is not byte drift and is
  not caught by a sha256 pair (reproduced here: the round-42 checker bytes exit **0 with zero
  findings** on the V0 self-consistent fabrication; the round-43 checker bytes exit 1 naming
  `r1-measure-blob-pin-mismatch`). The table should gain the row round 43 relies on:
  *commit-time signature over the canonical measure record + invocation-time
  challenge-response* — reads the signed measure record and the wrapper's public half —
  catches a coherent forgery of the receipt/witness/measure triple — misses a private half
  harvested during an honest run (declared residual) and any attack needing the private half
  to re-derive (challenge wall). Row 3 stays the correct description of the r41/r42 chain;
  it is now the **floor** of the discipline, not the instrument.
- **[2026-10-29, falsification] §Falsification (lines 47–55) — SUPERSEDED IN PART: the
  round-42 checker is no longer the falsifier of record.** The paragraph says the round-42
  checker "returns exit 1 with `r1a-receipt-absent`/`r1b-witness-absent` at baseline
  `34e177959d1b7ce04afb85a001420e02631ce79e` … and exit 0 once the receipt bytes and their
  sha256 binding to the committed measure record are present at the measured revision". Exit 0
  of those bytes is **not** sufficient for a receipt-carrying claim. Reproduced 2026-10-29
  from the committed fixture generator `.ufo/waves/round-43/fixtures/v0-fabrication.mjs`
  (digest `b8747062…`, identical to the `generatorDigest` recorded in the committed control
  `.ufo/waves/round-43/controls/c2-v0-probe.json`): round-42 checker bytes → exit 0,
  `findingIds: []`; round-43 checker bytes → exit 1 naming `r1-measure-blob-pin-mismatch`.
  On the tree fixture (`.ufo/waves/round-43/fixtures/tree-vs-blob.mjs`) the round-42 bytes
  exit 1 but name `r1a-unparseable` — no type violation is named — while the round-43 bytes
  name `r1a-not-a-blob` (`git cat-file -t`, S151). The corrected falsifier is
  `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs`
  (`--rev <rev> --repo <repo> --json`, digest-pinned in `.ufo/waves/round-43/claims.json`);
  the round-42 checker remains the historical instrument that greened the hole. **Note for
  the appending seat:** the committed controls name fixture revisions
  (`a1f3887724f5ec3f6213c068199e9d8454948ece`, `d28c27897e203857195a88e59683b6c129d0c804`)
  that are **not objects in the lane repo's object store** — `git cat-file -t <rev>` fails in
  the lane repo — so the fixture probes are re-runnable only by re-running the committed
  generators (which
  is how they were reproduced here), not by checking out the named revisions. Under this
  note's own Rule 1 an evidence pointer must name a revision that contains it; the fixture
  pointers in the round-43 controls do not satisfy that, and the round-43 note's "Falsification"
  paragraph inherits the gap.
- **[2026-10-29, recheck] Front-matter `recheck:` (lines 6–7) — POINTER SUPERSEDED.** The
  recheck instruction is to "re-run the R1/R4 commands of
  `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`". Those R1/R4 commands are
  the ones the round-43 wave falsified (a tree object scored where the sentence says blob; the
  V0 fabrication greened). Recheck against the round-43 checker instead; the round-42 commands
  remain re-runnable only as the historical instrument.
- **[2026-10-29, re-affirmation] Rules 1–4 stand, and round 43 re-exercised them.** Rule 1
  (every evidence pointer names a path **and** a revision): the round-43 receipt and witness
  are committed as explicitly named files at `ba433c94` and are listed by
  `git ls-tree -r --name-only HEAD -- corpus/evidence/round43`; the measure record
  `.ufo/waves/round-43/measure/c1-measure-r43.json` is committed at the same revision, and its
  `bindings.receiptSha256` / `bindings.witnessSha256` equal the sha256 of those committed blobs
  (re-derived here). Rule 4 re-fired in round 43 and was caught by the round's own `ls-tree`
  **before** citing: the two >1 MiB files (1.18 / 1.20 MiB) were skipped by the directory
  commit and landed only when named explicitly (`ba433c94` commit subject). Rule 3 (verbatim
  quotes) is unchanged and is now also enforced over the freeze itself — the round-43
  checker's r5 rule requires every control the freeze names to be bound by sha256 **plus** a
  verbatim quote line present in the committed control bytes. Rule 2 (a baseline control
  carries its counting command next to the digit) is unchanged; the round-43 baseline control
  `.ufo/waves/round-43/controls/c1-baseline-tree-count.txt` carries the `git ls-tree … | wc -l`
  command and the digit `0`.
- **[2026-10-29, attribution — carried from the round-42 wave, NOT a round-43 supersession]
  Rule 4's mechanism is still unsourced.** "the lane helper skips new files over 1 MiB inside a
  named directory" names a mechanism that no registry row and no `scripts/` helper grounds
  (round-42 `w1/ConnSelfOverlap`, finding F4: 0 registry rows for jj `config.md`; no
  size-filtering helper under `scripts/`). Round 43 re-observed the **behaviour** (the two
  >1 MiB files skipped by the directory commit) but not the attribution. The advice stands;
  read the mechanism clause as unattributed.
- **[2026-10-29, pointer discipline] The superseding round-43 note is not yet committed — this
  erratum cites it by sha256 until it lands.** `corpus/knowledge/receipt-authenticity-signing-round-43.md`
  (sha256 `b8cee7faa378fcf61ce4ea3d815d83bb439bacaaf6deabb92d904aeb73889b48`) exists in the
  working tree but in **neither** the freeze `7ca6f01` nor HEAD `ba433c94`
  (`git cat-file -t <rev>:corpus/knowledge/receipt-authenticity-signing-round-43.md` →
  "fatal: path … exists on disk, but not in '<rev>'"), and its coverage row is an uncommitted
  worktree edit to `corpus/README.md`. That is the round-41 D1 class this note exists to
  prevent, live in the very round that supersedes it. Consequence for this erratum: the
  supersession recorded above is grounded in **committed** bytes (the measure record, the
  receipt, the witness, the counters, the controls, the freeze) and not in the round-43 note's
  prose — cite that note by sha256 until the closure commits it, then re-point this erratum at
  the committing revision.

---

## Drafting notes for the integrating seat (not part of the appended block)

1. The block above is the append. Nothing above the `## Errata` header in the r42 note may be
   edited (house rule: append-only, dated blocks below).
2. The r42 note has no `## Errata` section today, so the header line and its
   `- (none yet)` placeholder are part of the append (same shape as
   `corpus/knowledge/webbridge-plugin-anatomy.md:222`).
3. Re-derive the pre-append sha256 immediately before appending — the note's blob id is
   `1658a105…` at `ba433c94`, but the closure may land further commits before the append.
4. No claim verdict is asserted anywhere in this block. The round-43 C1/C2 admission decision
   belongs to the closure; `claims.json` still carries `"verdict": "pending"` for both.
