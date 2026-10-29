# ScribeEntryAuth — receipt-authenticity entry, sections 1-3 draft

Seat: `ScribeEntryAuth` (leaf; no subagents dispatched; wave `tabi-r43-w1`).
Lane repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, freeze `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`,
baseline `ab592825cd195599822ca227f7768914df208201`.
Scratch: `/fast/scratch/hyaku/tabi-r43/ScribeEntryAuth/` (created by me, deleted before yield).
Milestone: draft sections 1-3 of `corpus/knowledge/receipt-authenticity-signing-round-43.md` **from the frozen
design bytes only**.

## Deliverable

- **Draft (integration input, NOT the production tree):**
  `.ufo/waves/round-43/w1/ScribeEntryAuth/draft-sections-1-3.md`
  — §1 provenance trio (S150/S151/S145, each with my own staged-copy verification),
  §2 the vector→detection→refusal→residual table with one row per committed control,
  §3 the standing rule with declared limitations and the routed findings.
  The draft is written into my seat dir; the production tree is untouched.
- **Evidence** (all under `.ufo/waves/round-43/w1/ScribeEntryAuth/evidence/`):
  `provenance-verification.txt`, `control-vector-verification.txt`, `attack-donothing-reach.txt`,
  the attack scripts under `evidence/attack/`, and the raw JSON receipts of every run.
- The report is also filed at `.ufo/waves/round-43/w1/ScribeEntryAuth/report.md`.

## What I did

Drafted the three sections and **verified every claim in them against the frozen bytes and by
running the instruments** — I did not carry over the control files' own descriptions of what they
prove. Every check I ran is quoted with its output in the evidence files.

## Headline: an in-model do-nothing reach against the C1 counter (finding F1)

This is the one thing the L1 must not miss, because it is a **kill-rule trigger**, not a nit.

Against the **committed, unmodified** counter `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`
(sha256 `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`, re-derived by me from
`git cat-file blob 7ca6f018…:<path>`), with **no browser, no wrapper, no driver — only `node <counter>` spawned**:

| Attack | Result |
|---|---|
| **A** — fully synthetic receipt + witness + measure record, own fresh Ed25519 keypairs, forger answers the fd3 challenge with its own key | **exit 0, `predicate: true`, `findings: []`, `challengeVerified: true`** — reproduced 5/5 with fresh keypair+nonce each time |
| **B** — honest *committed* `receipt.json` + `receipt.witness.json` reused byte-for-byte, only the measure record re-authored and signed by the forger | **exit 0, `predicate: true`, `findings: []`** |
| control — same challenge answered with a *different* key | exit 1, `challengeVerified: false` (the channel is live; a wrong answer is rejected) |
| honest counter-check — the real wrapper runs the chain | exit 0, `challengeVerified: true`, `witnessAttestationVerified: true`, egress 0, digests == frozen pins |

**Mechanism** (frozen source): the counter verifies the measure-record signature against
`m.pubkeys?.wrapper` (line 215) and verifies the challenge answer against that same key (line 262) —
both taken from *the document being authenticated*. `claims.json` contains **no pubkey pin at all**
(zero occurrences of "pubkey"; `producerPins` = firefox bin + node; `frozenDigests` = file digests),
and the counter reads no git and spawns no child, so it cannot check that the measure record came
from the wrapper. The author of the measure record picks the key and then signs with it.

**Why it is in-model** (residual model verbatim): (i) excludes *harvesting* a per-invocation
private half — my attack harvests nothing, it mints its own; (ii) excludes process-memory/kernel
attacks — not used; (iii) excludes on-disk tampering of committed pins or receipts — attack B reads
the committed bytes read-only and writes its new measure record into scratch. None of the three
exclusions covers it, and the model says *"Attacks inside this model that produce exit 0 without a
browser run fire the kill rule."*

**Kill rule (verbatim from `claims.json` C1):** *"If any settled seat demonstrates an in-model
do-nothing reach (exit 0 without a browser run), the claim is not admitted: no capability row
enters the SCORECARD table, coverage holds its score, and the finding is routed to round 44."*

**The wrapper and driver are sound** — the honest chain is green. The defect is that the *scoring
instrument* cannot authenticate committed bytes after the fact, which is exactly what QUALITY
criterion 104 and the r42 lesson routed to round 43 asked for: *"wrapper signs with a per-invocation
key, **public half pinned in claims**"* (`corpus/lessons/round-42.md:128`). The public half is not
pinned. Peer seats `CritC1ReachSynth` and `CritC1ReachDirect` reached the same class independently
(`CritC1ReachSynth/attack-summary.json` records `paired-key-direct` and `second-process-pipe` at
`counterExit 0 / predicate true / challengeVerified true`), so this is corroborated, not a one-seat
artifact.

I did **not** amend any frozen byte. The repair shape (pin the verifying key outside the signed
document) is written up in §3.2 for round 44, not applied.

## What I verified (each quoted with output in the evidence files)

**Provenance trio, my own staged-copy verification** — all three re-opened live (read-only GET,
named URLs, no login/form) at the **same digests as their staged copies** (no drift), each quote
located in the staged bytes:

- **S150** `crypto.html` `4b7024df…c42af` / 681,625 B; quote is a flat-byte substring at offset
  **85163**, one occurrence, **5 words**. Registry row: 11 cells, tier A, mined, used-by names this entry.
- **S151** `git-cat-file.html` `624464ef…5048d7` / 79,360 B; quote flat-byte substring at offset
  **43922**, one occurrence, **10 words**, under the `-t` option heading. Behavioural check of the
  claim: `git cat-file -t HEAD:corpus/evidence/round43/playwright-egress/receipt.json` → `blob`,
  `…/round41/playwright-egress` → `tree` — file vs directory resolve to distinct types, which is
  what rule r1a needs.
- **S145** `proc_pid_net.html` `5e1700ff…f726f` / 17,119 B (staged copy lives in the **round-40**
  wave dir, not round-43). Quote located only after whitespace-collapse; the registry cell's curly
  quotes are not located by either house normaliser (finding F4).

**Frozen-byte re-derivation** — all 6 `frozenDigests` match `git cat-file blob 7ca6f018…:<path>`;
all 8 control sha256s and their 8 bound quote lines re-verified present in the control bytes
(8/8, every quote ≥ 8 chars). **Predicate sentence identity confirmed for both claims**: claims.json
== header `PREDICATE-SENTENCE` == `const PREDICATE` (value byte-identical after un-escaping the JS
literal; sha256 prefixes `9bc95453…` C1, `49f7a1e7…` C2). `claims.json` contains 0 occurrences of
U+2026, so the "…" seen in a console dump is display truncation, not a byte in the file.

**C2 (calibration) — green and reproducible.** Checker at baseline → exit 1 with
`r5-claims-absent` + `r6-probe-absent` (matches `c2-baseline-red-r43.json` exactly); at the freeze
rev → exit 0, 0 findings. Re-ran both committed fixture generators in scratch: V0 → `refused: true`,
v2 exit 1 naming `r1-measure-blob-pin-mismatch`, **r42 checker bytes exit 0 / 0 findings on the same
fixture** (the documented hole reproduces); tree → `typeViolationNamed: true`, v2 names
`r1a-not-a-blob`, r42 names only `r1a-unparseable`. Both reproduce their controls field-for-field.
The C2 r1 blob-id pin `8ff64d691f5c09569a50f2a5a038bb23774c3d35` verified as the object id of the
committed r41 measure record at the freeze rev.

**C1 battery** — re-run: 7/7 (six vectors exit 2 `environment-loader-contamination`, clean exit 0),
case-for-case identical to `c1-battery-r43.json`. **Strict argv** — `--pins x` and `--nonce deadbeef`
both exit 2 with the usage error (the r42 `--pins` hole is closed). **Producer pins on this host** —
firefox `1f637a7c…95eb`, node `7fde7b8a…df4c`, both equal to `claims.json`.

**Full-chain arm over a lying producer (W3).** Independently reproduced by this seat: mirror the
lane's wrapper + counter with only their `const ROOT` literal rewritten, mutate the driver's two
`observe*()` returns to zero the counts, re-bless the mirror's claims pins to the mutated bytes so
the byte-pin layer is satisfied, and run the real wrapper. Result: `driverExit 0`, `counterExit 0`,
`challengeVerified true`, `witnessAttestationVerified true`, counter `findings: []`, **zero**
egress-clause findings, with the wrapper's own per-invocation Ed25519 key signing the measure
record and answering the challenge. The driver's navigation target was checked first — it listens
on 127.0.0.1 and navigates only to `http://127.0.0.1:<port>/a.html` and `/b.html`, loopback only.
Evidence: `evidence/w3-lying-producer-full-chain.txt`.

**The two weaknesses are complementary.** The egress-count clause is the predicate's only
behavioural check on egress, and it is self-reported — no other clause in the predicate speaks to
egress at all. F1 attacks the *document's provenance* (a forger writes the measure record, names
their own public key in it, and answers the counter's own challenge with the matching private
half); the egress weakness attacks the *observation content* (a producer with a genuine wrapper
key, a genuine browser run and a verified challenge zeroes its counts and removes every trace of
its egress from a receipt that is then admitted). Closing either alone leaves the other open.
(Framing contributed by peer seat `MutDriverEgress`, whose arm is the observation-content half.)

**Repair scoping — both weaknesses must be closed, and neither repair substitutes for the other.**
A provenance fix (pinning the wrapper's public key, or otherwise binding the measure record to a
specific wrapper invocation) closes F1 but leaves the observation-content weakness open — a
producer holding a *legitimate* key can still report false counts and be admitted. An
observation-content fix (an egress witness independent of the producer, or a committed control that
exercises a non-zero egress count) closes that one but leaves F1 open — a forger can still author
the document. A repair that closes only one must not be recorded as closing the instrument.
(Synthesis of two seats' findings, each attributing only its own arm; neither adjudicates the
other's.) Consequence for the next freeze: because the two weaknesses sit in different halves of
the same predicate, a repair that only re-pins the public key leaves the egress surface exactly as
open as it is today — and because the round-43 control set contains NO egress negative control,
nothing at the next freeze would catch that. The two deterministic browser-free controls (one
planting a non-zero egress count = must refuse, one planting its zeroed twin = currently admitted)
are what would make the egress half observable at the next freeze. The ordering of the two repairs
is the L1's to choose; what the L1 should not do is record a closure as closing the instrument
while one half is still open.

**Refusals that do reproduce** — the committed r42 receipt against the r41 measure record → exit 1
with the 8 findings the control lists, `challengeVerified: false`; a tampered honest r43 measure
record (one field flipped) → exit 1 with `measure-signature-invalid` alone; a nonce-relabelled
honest receipt → exit 1 with `run-nonce-mismatch` + `receipt-binding-mismatch`.

## Findings routed (no frozen byte touched)

| Id | Finding |
|---|---|
| **F1** | C1 counter v5 authenticates against the key carried inside the document under test; a fully synthetic trio (and honest bytes under a forger-signed measure record) reach exit 0 / `predicate: true` with no browser. In-model → fires C1's kill rule; routes to round 44. Corroborated by `CritC1ReachSynth` / `CritC1ReachDirect` |
| **F2** | `c1-replay-r42-refused.json` lists two `digest-mismatch` findings (driver, counter) that no longer reproduce — the working tree now matches the frozen pins. The refusal conclusion reproduces; the finding list has drifted from the instrument it documents |
| **F3** | Lesson word counts for S150/S151 are wrong (says 7 and 11; measured 5 and 10). Both inside the ≤25-word contract, so no breach — but wrong numbers should not be copied forward |
| **F4** | S145's registry quote is curly-quoted and line-reflowed; not a flat-byte substring and not located by either house normaliser (r41-D2 class, smaller). Substance matches |
| **F5** | S145's staged copy lives in the round-40 wave dir, not round-43 — the entry must cite the path that exists |
| **F6** | S145's registry `used-by` does not name this entry (S150/S151 do) |
| **F7** | The committed control named `c1-relabel-refused.json` records the **tamper** case (its own `command`: *"same synthetic pair with one tampered field in the measure record"*), and **no committed control records a nonce-relabel of honest bytes** — the vector QUALITY 104 and the r42 lesson name first. The relabel vector is evidenced only by my own runs |
 The clause's failing state is also plantable browser-free (a planted non-zero count makes the counter emit `run1-sample1-{ss,proc}-egress` with `egressDetail` populated). **And the whole chain admits a lying producer**: over the full genuine chain (real wrapper, real per-invocation key, real Firefox, real witness, real fd3/fd4 challenge) with the driver mutated and the claims pins re-blessed to the mutated bytes, the counter returns `predicate: true` with an empty findings list and zero egress-clause findings — I reproduced that arm myself. Peer seat `MutDriverEgress` measured the paired differential on the 46-observation genuine-egress receipt; I independently reproduced the planted-lie, planted-egress and full-chain halves. The producer digest pin stops the mutated bytes in the frozen chain, so this is a **control-set calibration gap, not a kill-rule trigger** |

## Scope, bounds, limitations

- **Leaf.** No subagents dispatched, no agent spawned. One wave item.
- **Production tree, fleet repo, sibling `*-shokunin` repos and `shokuknow`: not written.** All my
  writes are inside `.ufo/waves/round-43/w1/ScribeEntryAuth/` (plus the report path named by the
  seat spec). `git status` in the lane repo shows only pre-existing modifications by other seats
  (`corpus/README.md`, `corpus/knowledge/receipt-authenticity-signing-round-43.md`,
  `corpus/lessons/round-43.md`, `.ufo/waves/round-43/measure/failed-run-1/`) — **none of them mine**;
  my live chain run wrote to scratch, and the committed `corpus/evidence/round43/playwright-egress/`
  bytes are unchanged (`sha256 1b33d6a6…`, `0728d338…`).
- **No commits, no pushes, no git or jj mutation.** Git use was read-only
  (`rev-parse`, `ls-tree`, `cat-file`, `show`, `status`, `log`, `diff`). The two scratch fixture
  repos the committed generators create were made under my scratch by the generators themselves;
  each asserts `git rev-parse --show-toplevel` before its own commit and uses a local throwaway
  identity.
- **Network:** read-only GETs of the three named source URLs only (nodejs.org crypto, git-scm.com
  git-cat-file, man7.org proc_pid_net) — no logins, no forms, no consequential actions. Everything
  else was loopback and local files.
- **No tool was installed or upgraded** — nothing was needed; `node v24.21.0` (the pinned producer,
  `process.execPath`), `git`, `curl`, `python3` and coreutils were already present. Nothing to record
  under the operator tooling rule.
- **Frozen bytes untouched.** `claims.json`, both counters, both fixtures and all eight controls are
  byte-identical to the freeze. The mutated counter I used for the pin test was a **copy in my
  scratch** with `ROOT` rewritten; it was never run in place.
- **Limitations of my own evidence.** (i) I did not run the *wrapper* against a forged measure
  record — the wrapper always writes its own measure record, so that path is not reachable for a
  forger without the wrapper's private half; the reach I demonstrated is the **scoring** path
  (counter invoked directly over committed bytes), which is the path QUALITY 104 names. (ii) My
  attacks run the counter from my scratch cwd with the lane's `claims.json` as the pin source, which
  is the counter's own hard-coded `ROOT` constant — unchanged by me. (iii) I did not test whether
  the reach survives the *closure* re-derivation the lane performs at integration; that is the
  L1's question and is not asserted here. (iv) The synthetic-pair finding depends on the
  fabricator supplying its own fd3/fd4 pipe; a caller who cannot open a pipe on the counter's fd3
  gets `EINVAL` and a refusal — which is exactly the mode the committed synthetic control was
  captured in, and why that control alone does not establish the property.
- **Peer overlap.** `CritC1ReachSynth` and `CritC1ReachDirect` independently reached the F1 class;
  `CritC1KeyPersistence` audited key non-persistence (its conclusion — the sources satisfy
  component-controlled non-persistence, with memory zeroization out of scope — is consistent with
  my §3.2). I did not read their drafts before running my own attack, so my evidence is
  independently produced.
- **Peer correction applied (F8), and the peer closed my caveat with a stronger arm.** Peer
  seat `MutDriverEgress` reported that my §3.2 bullet "the egress-count clause remains
  honest-run-observable" was wrong in its first half. I re-verified their sub-claims myself
  before editing (below) and adopted the correction: the clause is not load-bearing against a
  lying producer, and its failing state is fixture-buildable rather than
  honest-run-observable-only. The claim that "a lying driver zeroing counts produces internally
  consistent receipts" was already correct and is unchanged. Their statement that the byte-pin
  stops the mutated bytes (no kill-rule trigger on their item) is accepted as written — it is
  consistent with F1 being about the *document's* provenance, not about receipt fields. Their two
  proposed deterministic browser-free controls are the ones recorded in F8.
  I then objected that their "zeroed twin admitted, predicate true" arm rode on a forger-minted
  key (their `PAIR_mutated.measure.json` carries a different wrapper pubkey than
  `PAIR_true.measure.json`), so it was not a statement about a lying producer under the wrapper.
  **They answered with a stronger arm (W3): the FULL genuine chain — real wrapper, real
  per-invocation Ed25519 key, real Firefox, real witness, real fd3/fd4 challenge — over the
  lying producer, with the claims pins re-blessed to the mutated driver's bytes so the byte-pin
  layer is satisfied.** Result: driverExit 0, counterExit 0, challengeVerified TRUE,
  witnessAttestationVerified TRUE, predicate TRUE, **zero** egress-clause findings, zero other
  findings — reproduced twice by them and once by me (see the evidence file). The forger-key
  objection therefore does not apply to the class: the chain admits a lying producer whenever the
  byte-pin layer is satisfied. They also corrected their own §2 framing: the load-bearing result
  is the egress-finding COUNT (46 → 0), which is a receipt-content property holding under an
  authentic signature, while the whole-predicate-true arm is not claimed as a statement about a
  lying producer under the wrapper — W3 supplies that instead.
  **They then produced the strongest arm yet — a LIVE paired differential over the full genuine
  chain, in a window where this host genuinely produced non-loopback egress: the PRISTINE
  producer observed 45 real non-loopback observations and its receipt was REFUSED (counter exit 1,
  predicate false, 45 egress-clause findings, other findings []), while the LYING producer reported
  0 and its receipt was ADMITTED (counter exit 0, predicate true, 0 findings) — the same chain, each
  arm with its own per-invocation key and a verified fd3/fd4 challenge.** I verified the internal
  consistency of both arms' raw counter output from their evidence files and rebuilt both mirror
  trees independently (my pristine driver sha256 3718235934… and my lying driver sha256 cbd8d65e…
  are byte-identical to theirs, so the arms are the same artefacts). **I did not independently land
  the differential**: my own pristine-arm run fell in a no-egress window (0 nonzero sample
  observations) and therefore scored green with 0 findings, so the host did not present me with an
  egress window to compare in. Their result stands on their measurement; mine does not contradict
  it, and the egress window is intermittent on this host. **My run turned out to be a useful
  CONTROL rather than merely a hedge, and the peer has recorded it that way**: it used the SAME
  mirror construction as their refused arm and scored GREEN with zero findings, which exonerates
  the construction as a variable — so the refusal in their PRISTINE arm is attributable to the 45
  genuine non-loopback observations and to nothing incidental to the mirror tree, and the ADMITTED
  arm is attributable to the producer's behaviour alone. Their two caveats are recorded rather
  than smoothed over: (a) the arms ran sequentially in the same window rather than at one shared
  instant (a concurrent version was abandoned when host load hit ~214); (b) the re-blessed pins —
  my point, now load-bearing in their wording. This closes the gap my caveat opened: "the lying
  producer is admitted under the genuine chain" no longer rests on a forger key.

VERDICT finding — in-model do-nothing reach: the committed C1 counter v5 accepts a fully synthetic receipt+witness+measure trio (and honest committed receipt/witness bytes under a forger-signed measure record) at exit 0 / predicate true with no browser run, because it verifies against the public key carried inside the document it authenticates and no pubkey is pinned in claims.json — an in-model exit-0-without-a-browser reach that fires C1's own kill rule and routes to round 44; sections 1-3 drafted in the seat dir with seven further findings (F2-F8)
