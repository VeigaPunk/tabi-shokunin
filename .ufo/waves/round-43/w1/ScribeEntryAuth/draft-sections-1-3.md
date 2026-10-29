---
source: S150 — Node.js Crypto documentation, https://nodejs.org/docs/latest-v24.x/api/crypto.html
  (also S151 — git-cat-file manual, for the committed-bytes type gate this entry's sibling checker
  enforces; S145 — proc_pid_net(5), for the observed surface)
verified-at: 2026-10-29 — opened copies sha256 4b7024df06e31080d4caa20b21aafb68a56d0481781633d7b5f7dc7ec50c42af
  (.ufo/waves/round-43/sources/crypto.html, HTTP 200, 681,625 bytes) and
  624464ef7a3d64de06038200bff85ac09389a9d217d379dd660aa6b5165048d7
  (.ufo/waves/round-43/sources/git-cat-file.html, HTTP 200, 79,360 bytes);
  S145's staged copy is 5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f
  (.ufo/waves/round-40/sources/proc_pid_net.html, HTTP 200, 17,119 bytes).
  All three re-opened live on 2026-10-29 at the same digests (no drift) and each quote was
  located in the staged bytes by this seat; see the seat's evidence files.
recheck: on-release or on nodejs.org / git-scm.com doc revision — re-open all three pages, re-verify the
  sha256s, and re-run the r43 refusal controls (battery, replay, synthetic, tamper) and the C2
  baseline red. Re-run the section-2 counterexamples too: a refusal that only holds in one
  invocation mode is not a refusal (see the do-nothing reach recorded under §3).
---

# Receipt authenticity by per-invocation signing (round 43) — sections 1-3 draft

> **Draft status.** Sections 1-3 only, drafted by seat `ScribeEntryAuth` from the frozen design
> bytes at commit `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` (claims, three instruments, eight
> committed controls). The L1 integrates; **no claim verdict is asserted here** — `claims.json`
> carries `"verdict": "pending"` for C1 and C2 and this seat does not change it. One in-model
> do-nothing reach against the C1 counter was found and is written up in §3 and routed as a
> finding rather than folded silently into the table.

## 1. Provenance trio — what each source actually licenses, verified by this seat

The trio is not decorative: each row licenses one link in the instrument, and each was
re-verified here from its own staged bytes rather than inherited from a prior wave.

| Source | What it licenses in this entry | Anchor + quote (located by this seat) | Staged copy re-verified |
|---|---|---|---|
| **S150** node:crypto API index line | the primitives the round-43 signing chain is built on — `generateKeyPairSync`, `sign`, `verify` | §Crypto API index line: "createPrivateKey, createPublicKey, generateKeyPair, sign, verify," — flat-byte substring of the staged copy at byte offset 85163, one occurrence, 5 words | `.ufo/waves/round-43/sources/crypto.html`, sha256 `4b7024df…c42af`, 681,625 B; live re-open HTTP 200 at the same digest |
| **S151** git-cat-file manual, `-t` option | the blob-vs-tree type discipline behind C2 rule r1a | §`-t` option: "Instead of the content, show the object type identified by" — flat-byte substring at offset 43922, one occurrence, 10 words | `.ufo/waves/round-43/sources/git-cat-file.html`, sha256 `624464ef…5048d7`, 79,360 B; live re-open HTTP 200 at the same digest |
| **S145** proc_pid_net(5) | the `/proc/net/tcp` remote-endpoint field that makes the loopback observation a *peer* reading rather than a socket-count reading | §DESCRIPTION, `/proc/net/tcp`: "rem_address" is the remote address and port number pair (if connected) — located in the staged copy after whitespace-collapse (see the caveat below) | `.ufo/waves/round-40/sources/proc_pid_net.html`, sha256 `5e1700ff…f726f`, 17,119 B; live re-open HTTP 200 at the same digest |

Three provenance caveats belong in the entry rather than in a footnote:

- **S145's staged copy lives in the round-40 wave directory**, not round-43 — the round-43
  `sources/` directory holds only the two round-43 copies. The entry must cite the path that
  actually exists (`.ufo/waves/round-40/sources/proc_pid_net.html`), or a reader who looks for
  `.ufo/waves/round-43/sources/proc_pid_net.html` finds nothing.
- **S145's registry quote is not a flat-byte substring of its staged copy.** The staged HTML
  carries straight double quotes and a line break inside the sentence; the registry cell uses
  curly quotes and one line. The two house normalisers (`scripts/check-frontier-admission.mjs`,
  `scripts/check-decision-table.mjs`) collapse whitespace and decode entities but do **not** fold
  curly quotes to straight, so the cell's exact text is not located by either. The substance
  matches; the byte form does not. This is the same class as the r41 defect D2 (spliced S146
  quote), it is smaller, and it is recorded here rather than silently normalised away.
- **The lesson's word counts for S150/S151 are off by two and one** ("7 words" / "11 words" in
  `corpus/lessons/round-43.md` vs the measured 5 and 10). Both counts are inside the ≤25-word
  contract, so nothing is out of contract; the numbers are simply wrong and should not be
  copied forward.

**S150/S151 are the load-bearing rows for C2; S145 is the load-bearing row for C1's surface.**
S151's claim is behavioural, not decorative, and was checked behaviourally here: `git cat-file -t
HEAD:corpus/evidence/round43/playwright-egress/receipt.json` → `blob`, while `git cat-file -t
HEAD:corpus/evidence/round41/playwright-egress` → `tree`. A file path and a directory path resolve
to different object types, which is exactly the distinction rule r1a needs to make. S150's claim
is that the primitives exist; the frozen wrapper uses `crypto.generateKeyPairSync('ed25519')`,
`crypto.sign` and `crypto.verify` — the five identifiers in the quote are the destructuring
list of the docs' own `node:crypto` import sample.

## 2. Vector → detection → refusal → residual, one row per committed control

Every row below is a **committed control at the freeze**, re-verified by this seat (sha256 and
the bound verbatim quote line re-derived from the control bytes; 8/8 matched). The "refusal
observed" column states what this seat saw when it re-ran the instrument, not what the control's
author intended.

| Vector | Committed control (sha256) | Detection channel | Refusal observed by this seat | Residual after the refusal |
|---|---|---|---|---|
| **relabel** — nonce of a genuinely-produced receipt rewritten | *(no committed control names this vector)*; the control file whose name suggests it, `c1-relabel-refused.json` (`eeec71d7…`), records a **different** case — see the tamper row | receipt sha256 binding in the signed measure record (the relabelled bytes no longer hash to the signed binding) plus the nonce-match clause | **this seat's own run**, relabelling the committed honest r43 receipt's nonce with its witness present: exit 1 with `run-nonce-mismatch` + `receipt-binding-mismatch` — the binding layer fires | a forger who rewrites the *measure record* rather than the receipt is not caught by this layer — see the do-nothing reach in §3 |
| **synthetic** — self-signed receipt+witness pair, own keys, no browser | `c1-synthetic-refused.json` (`6b1052ad…`) | counter's fresh fd3 challenge, verified against the public key carried in the measure record | exit 1 **in the mode the control captured it** (direct invocation: fd3 is not a pipe → `challengeError: EINVAL`); **exit 0, predicate true** when the same synthetic pair is fed to the counter with a real fd3/fd4 pipe and answered with the forger's own key — 5/5 reproductions | **the challenge wall is not an authenticity proof**: the verifying key is chosen by whoever writes the measure record. Reaches §3 as a finding |
| **tamper** — one field of the measure record flipped, signature not renewed | `c1-relabel-refused.json` (`eeec71d7…`, bound quote `"measure-signature-invalid"`) — note its `command` field says *"same synthetic pair with one tampered field in the measure record"*, i.e. the control named "relabel" actually records the **tamper** case, on a synthetic base pair | Ed25519 verification over the canonical unsigned form | **this seat's own run**, tampering one field (`elapsedMs`) of the *committed honest* r43 measure record while leaving the receipt and witness bytes untouched: exit 1 with `measure-signature-invalid` **alone** — the bindings still hold, so only the signature layer fires | same anchor gap as the row above: the verifying key is self-declared, so this layer proves the measure record was not edited — not that the record came from the wrapper |
| **replay** — the committed round-42 receipt scored against the round-41 measure record | `c1-replay-r42-refused.json` (`6640e208…`) | schema + measure-schema + nonce shape + nonce match; challenge channel absent in a direct invocation | exit 1; `schema`, `measure-nonce-shape`, `run-nonce-mismatch`, `witness-unreadable`, `measure-schema`, `measure-signature-invalid`, `receipt-binding-mismatch`, `witness-binding-mismatch`; `challengeVerified: false` | the committed control also lists two `digest-mismatch` findings (driver, counter) that do **not** reproduce now — the working-tree bytes equal the frozen pins, so those two entries are stale relative to the current tree (finding F2) |
| **battery** — loader/injection vectors at spawn time | `c1-battery-r43.json` (`6cb61f11…`) | kernel `/proc/<pid>/environ` + `execArgv` flag-position check + pinned producer digests | re-run: 7/7 (six vectors exit 2 `environment-loader-contamination`, clean exit 0) — case-for-case identical to the committed control | the env gate is a *producer-side* control; it says nothing about whether scored bytes are authentic (the §3 row) |
| **V0** — a self-consistent fabrication offered to a committed-bytes checker | `c2-v0-probe.json` (`c24d24f8…`) | C2 rule r1: the round-41 measure record's **git blob id** is pinned to `8ff64d691f5c09569a50f2a5a038bb23774c3d35` | re-ran the committed fixture generator in scratch: `refused: true`, v2 exit 1 with `r1-measure-blob-pin-mismatch` (+`r5-claims-absent`, `r6-probe-absent`); the r42 checker bytes exit **0** on the same fixture (0 findings) — the hole is reproduced exactly | this is the shape C1 lacks: a pin the forger cannot re-mint. It is C2's own rule, applied to C2's own artifact |
| **tree** — a tree object where the frozen sentence says "blob" | `c2-tree-fixture.json` (`3443ad72…`) | C2 rule r1a: `git cat-file -t` type gate (S151) **before** any size floor | re-ran the committed fixture generator in scratch: `typeViolationNamed: true`, v2 exit 1 naming `r1a-not-a-blob`; the r42 bytes name only `r1a-unparseable` — the missing type check is reproduced | none observed for this vector; S151's quote locates cleanly in its staged copy |
| **pin** — producer bytes drifted from the frozen digests | the freeze's `frozenDigests` + `producerPins` in `claims.json` (6 file digests, firefox binary, node) | sha256 of the three producer files, the firefox binary and `process.execPath`, re-checked by the counter against the frozen pins | mutation (scratch copy of the counter with one driver pin zeroed): exit 1 with `digest-mismatch:scripts/playwright-firefox-egress-round43.mjs` + `measure-digest-mismatch:…` — the pin layer fires as specified; on-disk pins verified against the real tree: firefox `1f637a7c…95eb`, node `7fde7b8a…df4c`, both equal to `claims.json` | pins bind *bytes at frozen paths*; they say nothing about who authored the document that cites them (the §3 row) |

**Two rows deserve a reader's attention.** The *pin* row is the only one where the instrument
compares against something the forger does not control (the frozen digest of a file on disk). The
*V0* row is the same property expressed in git terms (a blob id the forger cannot re-mint). The
*synthetic* row, by contrast, verifies against a key that travels **inside the document being
authenticated** — the forger picks the key and then signs with it, so the check is satisfied by
construction. That is the difference between a control that holds and one that holds only in the
invocation mode it was captured in.

## 3. The standing rule, and the residual model it must name

### The rule

**A counter that scores a receipt must authenticate it against an anchor the receipt's author
does not control — or it must name, in advance, the residual model that covers the difference.**
Concretely, for this lane:

1. A scored receipt is authenticated by a signature whose **verifying key is pinned outside the
   signed document**. A key carried inside the document it authenticates is not an anchor: the
   author chooses it and then signs with it, so the check is satisfied by construction. When the
   key must be per-invocation, the anchor has to be something stable that the forger cannot
   re-mint — a committed blob id (C2's own `r1` rule), a pinned digest (C1's `frozenDigests`), or
   a long-lived lane key whose private half lives outside the receipt-producing chain.
2. A refusal is only a refusal if it holds **in every invocation mode the instrument supports**.
   The r43 counter's challenge is answered on fd3/fd4; a control captured by direct invocation
   (fd3 not a pipe → `EINVAL`) proves the channel was absent, not that the bytes are
   unauthentic. Every refusal control must be re-run in the mode the wrapper actually uses.
3. A receipt-carrying claim declares its residual model **before** data and the model must cover
   the attacks that actually work. The r43 model excludes key harvesting, process-memory/kernel
   attacks and on-disk pin tampering. The reach in §3.1 is none of those three, so it is inside
   the model — and the model says in-model exit-0-without-a-browser fires the kill rule.
4. The kill rule is the standing rule's teeth: **an in-model do-nothing reach (exit 0 without a
   browser run) refuses admission**, the finding routes to the next round, and no frozen byte is
   amended after the fact.
5. **A repair must be scoped to the weakness it closes, and the round must say which weakness it
   leaves open.** Two independent weaknesses are live in this instrument and they are
   complementary, so neither repair substitutes for the other: a **provenance** fix (pinning the
   wrapper's public key, or otherwise binding the measure record to a specific wrapper invocation)
   closes §3.1 but leaves the observation-content weakness open — a producer holding a
   *legitimate* key can still report false counts and be admitted; an **observation-content** fix
   (an egress witness independent of the producer, or a committed control that exercises a
   non-zero egress count) closes that one but leaves §3.1 open — a forger can still author the
   document. Both belong in the repair, and a repair that closes only one must not be recorded as
   closing the instrument. **Consequence for the next freeze:** because the two weaknesses sit in
   different halves of the same predicate, a repair that only re-pins the public key leaves the
   egress surface exactly as open as it is today — and because the round-43 control set contains
   **no egress negative control**, nothing at the next freeze would catch that. The two
   deterministic controls named below (one planting a non-zero egress count = must refuse, one
   planting its zeroed twin = currently admitted) are what would make the egress half observable
   at the next freeze; they are cheap and browser-free. The *ordering* of the two repairs is the
   L1's to choose — but a closure must not be recorded as closing the instrument while one half
   is still open. (Synthesis of two seats' findings, each attributing only its own arm; neither
   adjudicates the other's.)

### 3.1 The in-model do-nothing reach this seat demonstrated (C1)

Against the **committed, unmodified** counter `c1-signature-bound-v5.mjs`
(sha256 `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`, re-derived from
`git cat-file blob 7ca6f018…`), with **no browser, no wrapper, no driver** — only
`node <counter>` spawned:

- **Attack A — fully synthetic trio.** A forger writes a receipt, a witness and a measure record
  from scratch, mints two fresh Ed25519 keypairs, signs the witness attestation and the canonical
  unsigned measure form with them, fills the measure record's `digests` with the *true* frozen
  producer digests and its `bindings` with the sha256 of its own fabricated bytes, then spawns the
  counter with pipes on fd3/fd4 exactly as the wrapper does, reads the counter's fresh 32-byte
  challenge, signs it with its own wrapper key and writes the hex to fd4.
  → **counter exit 0, `predicate: true`, `findings: []`, `challengeVerified: true`.**
  Reproduced 5/5 times with a fresh keypair and fresh nonce each time.
- **Attack B — honest committed receipt and witness bytes, forger-signed measure record.** The
  committed honest `receipt.json` and `receipt.witness.json` are reused byte-for-byte; only the
  measure record is re-authored and signed by the forger, and the challenge is answered with the
  forger's key.
  → **counter exit 0, `predicate: true`, `findings: []`.** So "the committed receipt and witness
  bytes hash to the measure record's bindings" is satisfiable by whoever writes the measure
  record: the bindings are computed over whatever bytes are on disk.
- **Controls.** Answering the *same* challenge with a *different* key → exit 1,
  `challengeVerified: false`. The channel is live and a wrong answer is rejected; what the
  counter cannot do is distinguish the honest wrapper's key from the forger's, because the key
  travels inside the document under test.
- **Honest counter-check.** This seat also ran the honest chain end to end (scratch outputs):
  exit 0, `challengeVerified: true`, `witnessAttestationVerified: true`, `elapsedMs 53835`,
  egress 0, two runs, digests equal to the three frozen pins. **The wrapper and driver are sound.**
  The defect is in the *scoring instrument's* ability to authenticate committed bytes after the
  fact — which is precisely the property QUALITY criterion 104 and the r42 lesson routed to
  round 43: *"receipt authenticity (wrapper signs with a per-invocation key, public half pinned in
  claims)"*. The **public half is not pinned** — `claims.json` contains no pubkey field at all
  (zero occurrences of "pubkey"), and the counter reads no git and spawns no child, so it cannot
  check that the measure record came from the wrapper.

### 3.2 Declared limitations (as the entry must state them)

- **The r43 chain is green, not authenticated.** A live run proves the wrapper drove a browser
  and that the counter scored what the wrapper produced. It does not prove that a *later* reader
  of committed bytes can tell an honest receipt from a fabricated one — this seat showed they
  cannot.
- **A per-invocation key cannot be pre-pinned.** The r42 lesson's own wording ("public half
  pinned in claims") is not implementable with a per-invocation key; the pin needs to be on
  something stable across invocations, or the counter must re-derive the binding from a source it
  does not control. This tension is the repair's design problem for round 44, not a defect this
  seat can fix by editing a frozen byte (and this seat did not edit one).
- **The residual model as declared does not cover the reach that works.** (i) key harvesting,
  (ii) process-memory/kernel, (iii) on-disk pin tampering — a forger who mints its own key and
  signs its own document falls through all three. A residual model that is a list of the attacks
  one *thought of* is not a model; the standing rule must require it to cover the reachable
  surface, or the kill rule fires.
- **JS cannot zero a `KeyObject`**; "no private half is persisted" (confirmed by peer
  `CritC1KeyPersistence` on the source write/launch inventory) is a component-controlled
  non-persistence property, not a memory-hygiene guarantee. Process-memory and kernel attacks stay
  out of scope, as declared.
- **The egress-count clause contributes no independent refusal, and its failing state is
  fixture-buildable — not honest-run-observable-only.** A producer that zeroes its counts at the
  source makes every aggregate consistent with the zeroed values, so no summary-consistency
  clause fires: this seat's own planted-lie check confirms that a receipt with one sample's
  `nonLoopback` set to 1 and **all aggregates recomputed** is refused only by the two
  `run1-sample1-{ss,proc}-egress` findings, with no summary mismatch at all. Symmetrically, the
  clause's *failing* state is plantable with no browser run: a hand-crafted receipt carrying a
  planted non-zero count makes the frozen counter emit `run1-sample1-{ss,proc}-egress` with
  `egressDetail` populated. **Stronger, and independently reproduced by this seat: the whole
  chain admits a lying producer.** Over the *full genuine chain* — real wrapper, real
  per-invocation Ed25519 key, real Firefox, real witness, real fd3/fd4 challenge — with the
  driver mutated to zero its counts and the claims pins re-blessed to the mutated bytes so the
  byte-pin layer is satisfied, the counter returns `predicate: true` with an **empty** findings
  list and **zero** egress-clause findings. And in a window where this host genuinely produced
  non-loopback egress, the paired differential over the same genuine chain is decisive: the
  **pristine** producer observed 45 real non-loopback observations and its receipt was **REFUSED**
  (exit 1, 45 egress-clause findings), while the **lying** producer reported 0 and its receipt was
  **ADMITTED** (exit 0, 0 findings) — each arm with its own per-invocation key and a verified
  fd3/fd4 challenge, so the producer's *behaviour* is the only difference. So the clause
  contributes no independent refusal in the frozen chain, not merely on a hand-written receipt.
  The round-43 control set contains **no egress negative control at all** — the two deterministic
  browser-free controls that would close it (one planting a non-zero count = must refuse, one
  planting its zeroed twin = currently admitted) were not committed. The producer digest pin is
  what actually stops the mutated bytes in the frozen chain (the wrapper refuses
  `producer-digest-mismatch` before the browser spawns), so this is a **calibration gap in the
  control set, not a kill-rule trigger**. The §3.1 reach is the stronger and different class —
  there the *document* is the forger's, not just a field in it. (Peer seat `MutDriverEgress`
  measured the paired differential and the full-chain arms; this seat independently reproduced the
  planted-lie, planted-egress and full-chain halves, and rebuilt both mirror trees independently
  with byte-identical mutant drivers, but did not itself land the live differential — its own
  pristine-arm run fell in a no-egress window and therefore scored green.)
- **The two weaknesses are complementary, not duplicate, and the entry should say so.** The
  egress-count clause is the predicate's **only behavioural check on egress**, and it is
  **self-reported** — no other clause in the predicate speaks to egress at all. So the two
  findings attack different halves of the same instrument: §3.1 shows the *document's provenance*
  is unchecked (a forger may write the measure record, name their own public key in it, and answer
  the counter's own challenge with the matching private half — so nothing binds the receipt to the
  wrapper that produced it), while the egress weakness shows that even with **perfect** provenance
  — a genuine wrapper key, a genuine browser run, a verified fd3/fd4 challenge — the *observation
  content* is unchecked (a producer that zeroes its counts removes every trace of its egress from
  a receipt that is then admitted). Both narrow the instrument's refusal surfaces below what the
  round's prose claims, and closing either one alone leaves the other open. (Framing contributed
  by peer seat `MutDriverEgress`, whose arm is the observation-content half.)
- **Dead and stale controls must be re-run, not re-read.** The committed `c1-replay-r42-refused.json`
  control lists two `digest-mismatch` findings that no longer reproduce because the working tree
  now matches the frozen pins (finding F2); the refusal conclusion reproduces, but the finding
  list has drifted from the instrument it documents.

### 3.3 Findings routed (no frozen byte touched)

| Id | Finding | Where | Why it matters |
|---|---|---|---|
| **F1** | C1 counter v5 authenticates the measure record against the public key carried **inside** that record; a fully synthetic trio reaches exit 0 / `predicate: true` with no browser, and so do honest committed receipt+witness bytes under a forger-signed measure record | `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` lines 215 and 262; `claims.json` has no pubkey pin | in-model do-nothing reach → fires C1's own kill rule ("exit 0 without a browser run"); routes to round 44. Peer seats `CritC1ReachSynth` / `CritC1ReachDirect` reached the same class independently |
| **F2** | The committed replay control lists `digest-mismatch` findings for the driver and the counter that no longer reproduce (working tree == frozen pins) | `controls/c1-replay-r42-refused.json` vs a fresh run | a control whose finding list has drifted from the instrument it documents cannot be used as evidence of *which* layers refused; the refusal conclusion itself still reproduces |
| **F3** | The lesson's word counts for S150/S151 are wrong (says 7 and 11; measured 5 and 10) | `corpus/lessons/round-43.md` | both are inside the ≤25-word contract, so no contract breach — but wrong numbers should not be copied forward |
| **F4** | S145's registry quote is curly-quoted while the staged copy is straight-quoted and line-wrapped; the cell text is not located by either house normaliser (same class as r41 defect D2, smaller) | `corpus/SOURCES.md` row S145 vs `.ufo/waves/round-40/sources/proc_pid_net.html` | the quote is checkable only after normalisation, so "verbatim substring" is not literally true for this row; the substance matches |
| **F5** | S145's staged copy lives in the round-40 wave dir, not round-43 | `.ufo/waves/round-40/sources/proc_pid_net.html` | a reader looking under round-43 `sources/` finds nothing; the entry must cite the path that exists |
| **F6** | S145's registry `used-by` cell does not name this entry | `corpus/SOURCES.md` row S145 | the entry cites S145, so the registry's used-by is one-sided; S150/S151 do name it |
| **F7** | The committed control named `c1-relabel-refused.json` records the **tamper** case (its own `command` field: *"same synthetic pair with one tampered field in the measure record"*), and no committed control records a **nonce-relabel of honest bytes** — the vector the r42 lesson and QUALITY 104 name first | `controls/c1-relabel-refused.json` vs `controls/c1-synthetic-refused.json` | a control whose file name and recorded case disagree will be read as covering the vector its name advertises; the relabel vector is currently evidenced only by this seat's own runs, not by a committed control |
| **F8** | The round-43 control set contains **no egress negative control**, and the egress-count clause contributes **no independent refusal**: a consistent lie (counts zeroed at the source, every aggregate recomputed) produces **no** summary-mismatch finding — only the two `*-egress` findings that the lie removed. The clause's failing state is also plantable browser-free (a hand-crafted receipt with a planted non-zero count makes the counter emit `run1-sample1-{ss,proc}-egress` with `egressDetail` populated). **And the whole chain admits a lying producer**: over the full genuine chain (real wrapper, real per-invocation key, real Firefox, real witness, real fd3/fd4 challenge) with the driver mutated and the claims pins re-blessed to the mutated bytes, the counter returns `predicate: true` with an empty findings list and zero egress-clause findings. The paired differential over that same genuine chain is decisive: in a window where this host really produced non-loopback egress, the **pristine** producer's receipt was REFUSED (exit 1, 45 egress-clause findings) and the **lying** producer's was ADMITTED (exit 0, 0 findings) | `controls/` (no egress control among the eight); counter summary-consistency clauses | two deterministic browser-free controls would close it (plant a non-zero count → must refuse; plant its zeroed twin → currently admitted). The producer digest pin is what stops the mutated bytes in the frozen chain, so this is a **control-set calibration gap, not a kill-rule trigger**. Peer seat `MutDriverEgress` measured the paired differential and the full-chain arms; this seat independently reproduced the planted-lie, planted-egress and full-chain halves and rebuilt both mirror trees with byte-identical mutant drivers, but did not itself land the live differential (its own pristine-arm run fell in a no-egress window and scored green) |

**Nothing in this draft asserts a claim verdict.** `claims.json` C1/C2 `verdict` stays `pending`;
the L1 integrates. The §3.1 reach is reported as a finding against the frozen design, and no
frozen byte — claim, counter, fixture or control — was amended by this seat.
