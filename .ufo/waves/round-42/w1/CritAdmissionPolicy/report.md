# CritAdmissionPolicy — round 42, wave 1 (tabi)

Seat: `CritAdmissionPolicy` (leaf; one wave item; no subagent dispatch). Milestone:
**admission policy table** — a decision table the L1 can apply mechanically after WAVE-DONE.
Judged on: calibration.

Repo read-only under test: `/home/vgpnk/Projects/shokunin/tabi-shokunin` at
`HEAD 0081bfdb93b6bd1bf2853bb128996f1a976b7218`; claims frozen at
`9b6de3a19de11abdb80e82a1310abc64a40215bb`; round-start baseline
`34e177959d1b7ce04afb85a001420e02631ce79e`.
Scratch: `/fast/scratch/hyaku/tabi-r42/CritAdmissionPolicy/` (created by me, deleted before
yield; every receipt that matters was copied to `evidence/` first).
Tool installs/upgrades: **none** (nothing needed; `node v24.21.0`, `git 2.56.0` already present.
Pacman untouched per the host-wide pause.)

## Axes named first

| Axis | What this seat tests |
|---|---|
| **calibration** (judged) | whether the round's own self-assessment (claims, SCORECARD disposition, gate readings) matches the observed repo state, and whether the ledger's truth is distinguishable from lane self-attestation |
| **coverage** | whether the C1 capability row may enter on the evidence actually committed |
| **operability** | whether the round's landings leave every production-mode gate no worse than the round-start baseline |
| **freshness** | whether any byte-pinned target was changed without its pin refresh |
| **depth** | whether the source-registry repairs survive the lane's own SOURCES contract |
| **adjacency** | whether anything landed outside the lane (nothing did; probe below) |

Moves kept: every probe below (each is a read-only measurement or a fixture repo under
scratch; none writes the production tree, the fleet repo, a sibling `*-shokunin` repo or
`shokuknow`).

## What I read (binding files, then the frozen bytes)

- `/home/vgpnk/Projects/shokunin/AXES.md` (all 83 lines read)
- `/home/vgpnk/Projects/shokunin/LEARNING.md` (all 88 lines read)
- `/home/vgpnk/Projects/shokunin/CORPUS.md` (SOURCES contract v1 read in full)
- `corpus/QUALITY.md` (718 lines; criteria 1–103 read, plus 27/33/57/71/73/84/86/89/90/101 in full)
- `.ufo/waves/round-42/claims.json`, `.ufo/waves/round-41/claims.json`
- `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs` (full source)
- `.ufo/waves/round-41/counters/c1-session-bound-v4.mjs`, `scripts/measure-c1-round41.mjs`
- `corpus/lessons/round-41-verifier-spotcheck.md`, `round-40.md`, `round-38-verifier-spotcheck.md`,
  `round-41.md`, `corpus/lessons/round-32.md` pointers
- `SCORECARD.md` §"Round 42 — declared claims", `LOG.md` §"Round 42"

## The rules the table is built on (verbatim)

**AXES.md:34-37** — "A round is admitted only if every claim verifies **and no axis is harmed** —
a trade anywhere is not an improvement: report every verdict and let the operator rule."

**AXES.md:62-64** — "Rows enter only through a round that demonstrates the capability running;
a capability without a passing demonstration in the round report is pre-claiming and does not
enter the table."

**AXES.md:49-51** — "Without that judgment it lands `unprovable` and the honest-stop rule
applies."

**LEARNING.md:42-46** (the discernment line) — "Self-assessed taste is not discernment. Each
round a non-author — a fresh reviewer or the operator — spot-checks a sample of that round's
gate decisions, **at least one admit and one reject**, and records `agree`/`disagree` with a
reason in the round's lesson. A subagent the lane dispatched is still the lane."

**LEARNING.md:37-38** — "Growth without quality is not learning: `expansion: improved` with
`quality: harmed` is a trade, reported as a trade, never admitted."

**LEARNING trend table, discernment** — `improved` when "the spot-check agrees with the gate on
admits *and* rejects, or a disagreement becomes a lesson that adds a grounded `QUALITY.md`
criterion"; `harmed` when "a disagreement is left unlearned, or a criterion is added with no
lesson behind it".

**QUALITY 73** (line 394) — "A counter frozen for a claim is attacked before freezing by a seat
that did not write it, with fixtures that try to reach the target without the claimed work;
every clause of the predicate sentence names the code line that enforces it, and a clause no
line enforces is dropped from the sentence or enforced before data."

**QUALITY 27** (line 107) — "A probe, gate or selftest is described by the finite set of shapes
it defeats, each named by the case or probe that goes red on it, and the description ends with
the shapes left untested. Absolute words ('unforgeable', 'tamper-proof') are not admitted in
prose about a probe."

**QUALITY 90** (line 570) — "A feasibility sentence — "not reachable without …", "the counter
cannot judge …", "the battery cannot catch …" — is written only after the cheapest forgery
against that instrument has been run, and it names the attack and cites its control; a limit
stated without a run is a finding."

**QUALITY 84** (line 508) — "A capability-table row names an operation the shokunin can now
run, with its demonstration in the round report; a gate or counter never enters the table,
because the table feeds the stagnation nudge…"

**QUALITY 86** (line 522) — "A runtime-evidence row count is a count of distinct surfaces
backed by distinct runs… the round records the plain distinct counts beside the gate's reading…"

**QUALITY 101** (line 704) — "A no-harm reading runs every gate that has a production mode in
that mode — not only its self-test — and a correction appended to a file some gate pins by
bytes is either carried with that pin's own append-only refresh or placed elsewhere…"

**QUALITY 71** (line 385) — "A gate, counter or self-test whose bytes a round changes is
executed at the commit that lands the change; the round commits that run (argv, revision, exit,
tally) and one mutant that turns a named case red."

**QUALITY 57** (line 276) — "…Later L1 checks or fresh non-author immutable review are named
separately, never backdated into the old wave's scope."

**CORPUS.md SOURCES contract v1, rule 2** (lines 116-118) — "**Append-only.** Only `status`,
`recheck` and `used-by` change in place, and each change is logged old→new in the round lesson.
A correction is a new row whose `teaches` opens `supersedes S0NN —`."

**CORPUS.md `teaches` shape** (lines 101-102) — "Rejected rows read `REJECTED: <reason>; flip:
<what would change the verdict>`."

**claims.json C1 killRule** (verbatim, full) — "If any settled seat demonstrates a do-nothing
reach, or any control refuses, or the receipt bytes are not committed at the measured revision,
the claim is not admitted: no capability row enters the SCORECARD table, coverage holds its
score, and the finding is routed to the next round. The predicate, kill rule and counting
command are frozen before any seat scores; they are never amended after wave data."

**claims.json C1 predicate, last two conjuncts** (verbatim) — "AND direct counter v4 replay of
the committed r39, r40 and r41 receipts each refuses (nonzero exit) AND the round's validated
policy-v2 wave settled with WAVE-DONE over at least 64 seats and no settled seat report
demonstrates a do-nothing reach of this predicate (a forgery or counter hole that produces exit
0 without a browser run)."

**claims.json C2 killRule** (verbatim, full) — "No post-data predicate amendment. Any mutation
seat that greens a weakened checker copy without the real repairs, or any accepted
fabricated/empty evidence, refuses admission the same way: calibration holds its score and the
hole is routed."

**claims.json C2 admission** (verbatim) — "On pass only: calibration verdict improved via ledger
closure is recorded in the round report and SCORECARD disposition; no numeric score changes
without a later rubric."

**C2 r4 clause** (checker header:19-23 and code `check-routed-defects-round42.mjs:133-165`) —
"`.ufo/waves/round-42/quarantine/re-adjudication.tsv` committed with exactly the 38 ids of the
committed `quarantine/slice-ids.txt`, no duplicates, verdict in {present,absent,misbound,
partial,unreachable}, evidence path a committed blob >=200 bytes."

**History of refusal (practice, not a criterion)** — `round-38-verifier-spotcheck.md:18`: "No
claim verifies; no demonstrated axis harm. Overall admission: **false**, honest rejection."
`round-40.md`: refused because "a do-nothing control can reach the target; no capability row or
coverage score increase is admitted". `round-41-verifier-spotcheck.md:33`: "the r38/r39/r40
chains were each falsified by attack waves after a green run… Predicate-green on the author's
own counter is not admission."

---

# The decision table

Apply top-down at the delivered revision `R`; first matching row is the verdict. Every cell
marked **[measured]** was produced by a command in this report; cells marked **[inference]** are
stated as such.

## A. C1 (coverage capability) — `playwright-firefox-loopback-tcp`, admission attempt

| # | Condition at `R` | Verdict | Binding rule | Required action |
|---|---|---|---|---|
| A1 | Any settled seat report demonstrates a do-nothing reach — **a forgery OR counter hole that produces exit 0 without a browser run** | **REFUSE** | claims.json C1 killRule; QUALITY 73 | No capability row. Coverage 9→9 (held). Route the finding with the seat's command + the exit it reached. |
| A2 | `git ls-tree -r --name-only R -- corpus/evidence/round42` is not exactly the two receipt files | **REFUSE** | C1 predicate conj. 2 ("committed at the measured revision"); QUALITY 72/28 | Commit `receipt.json` + `receipt.witness.json` (1,167,198 B + 1,153,988 B) at the measured revision, then re-measure at the new `R`. |
| A3 | `node scripts/measure-c1-round41.mjs --battery` is not all-pass, or any r39/r40/r41 replay exits 0 | **REFUSE** | C1 predicate conj. 3–4 | Re-run the controls; commit the run; route. |
| A4 | All four measured conjuncts hold **and** every hole any seat reports is *theoretical only* (no executable construction, no exit reached), **and** the probe prose names the shapes it defeats and the shapes left untested | **ADMIT with stated limits** | AXES.md:62-64; QUALITY 27; QUALITY 90 | One capability row enters with its demonstration in the round report (QUALITY 84: the row is an operation, never the gate/counter). The theoretical holes enter the row's prose as untested shapes and are routed as findings — they are **not** a refusal ground, because the frozen kill rule is keyed to *demonstration*. |
| A5 | Counter passes, no reach was executed, but a predicate clause is shown to have **no enforcing code line** | **REFUSE** | QUALITY 73 ("a clause no line enforces is dropped from the sentence or enforced before data") — post-data the sentence cannot be amended | Route as a predicate-construction finding; the claim cannot verify as worded. |
| A6 | Everything in A4, but the only falsification came from lanes the lane itself dispatched | **HOLD (unprovable)** — default; L1 may upgrade to A4 only with a stated reason | LEARNING.md:42-46 ("A subagent the lane dispatched is still the lane"); A4's prose must then say the attack wave was lane-authored | Record `unprovable` for outside falsification; the frozen predicate does not itself require non-author, so the L1 must record which reading it applied. |

**Answer to the question as posed.** *Theoretical holes alone do not refuse admission*: the
frozen kill rule fires on a **demonstrated** reach, and AXES.md admits a capability on "a
demonstration in the round report" plus "no axis is harmed". The r38–r40 refusals are not a
counter-rule — each of them rested on a demonstrated defect (r38: committed W1 findings that the
zero counts were not bound to the launched session; r39: measured spans 799/701 ms below the
frozen 1000 ms; r40: the F4-full working forgery). What the history *does* add is QUALITY 90:
an unrun limit cannot be stated as unreachability, so a theoretical hole must be named as an
untested shape, and the round may not write "not reachable without …".

**But A1 already fires in this round, twice over — this is not the theoretical-only branch.**
See Finding F1.

## B. C2 (calibration) — routed-defect ledger closure

| # | Condition at `R` | Verdict | Binding rule | Required action |
|---|---|---|---|---|
| B1 | Checker exit 0 **and** the TSV's evidence per row is a fetch capture (URL + status + digest) and the plain distinct counts are recorded beside the gate's reading **and** a named non-author re-opened ≥1 admit and ≥1 reject | **IMPROVED** | QUALITY 86; LEARNING.md:42-46 + trend row | Record calibration `improved` for ledger closure only; **no numeric score change** (C2 admission). SCORECARD disposition + trend row carry the non-author pointer. |
| B2 | Checker exit 0 **and** the TSV's truth rests only on lane-authored evidence (the wave's own seat files, or one blob reused for several rows) | **UNPROVABLE** | LEARNING.md:42-46 ("a subagent the lane dispatched is still the lane"); QUALITY 86 | Do **not** write `improved`. Record `unprovable` for the ledger's truth, state the distinct-evidence count, and require the outside spot-check of ≥1 admit and ≥1 reject before any `improved`. |
| B3 | Checker exit 0 but a settled mutation seat greens a weakened checker copy, or evidence accepted is fabricated/empty | **REFUSE** | claims.json C2 killRule | Calibration holds; route. |
| B4 | Checker exit 0 but `check-sources` is red at `R` on a row this round edits | **TRADE — "no axis is harmed" fails** | AXES.md:34-37; LEARNING.md:37-38 | Report the trade to the operator; the round may not claim no-harm. See F2. |
| B5 | Checker exit 0 but a previously-green, digest-pinned lane instrument goes red at `R` because of this round's inputs | **TRADE (irreducible)** | AXES.md:34-37; QUALITY 71/101 | Record the instrument as superseded/retired with a reason, or report the trade. See F3. |

**Answer to the question as posed.** A green checker + only self-authored evidence lands
**calibration = `unprovable`, not `improved`**, and the exact line is LEARNING.md:42-46:
"Self-assessed taste is not discernment… **A subagent the lane dispatched is still the lane.**"
CALIBRATION can be `improved` only through the outside gate — a named non-author
re-opening **at least one admit and one reject**. The C2 predicate cannot supply that: its r4
clause checks committed-blob existence and a 200-byte floor, nothing about who observed what.

## C. What "no axis is harmed" requires for this round's landings

The test is **differential against the round-start baseline `34e1779`**, run in production mode
(QUALITY 101), plus no unrefreshed byte-pin edit (QUALITY 101) and commit-pending m3 cleared
(QUALITY 92).

### C.1 Files this round lands → the axis each moves → the gate that reads it

| Landed file(s) | Axis | Gate that reads it (production mode) | baseline → HEAD |
|---|---|---|---|
| `corpus/SOURCES.md` (S146 status `mined`→`rejected` + `used-by`; new S148, S149) | depth / calibration | `check-sources.mjs`; `scripts/check-c2-knowledge-round41.mjs` | sources **0 → 1**; r41 checker **0 → 1** — see F2, F3 |
| `corpus/evidence/round41/playwright-egress/{receipt,witness}.json` (new: 1,167,198 B + 1,153,988 B — both **over the 1 MiB** threshold the round's own new knowledge entry warns a helper will skip) | calibration (D1) | C2 checker r1a/r1b (digest-bound) | absent → committed, digest-bound **[measured]** |
| `.ufo/waves/round-41/controls/c1-baseline-noop.out` (empty → 343 B) | calibration (D3) | C2 checker r3 | `r3-baseline-file-empty` → cleared **[measured]** |
| `corpus/knowledge/environment-injection-…-round-41.md` (+13 errata), `corpus/knowledge/committed-bytes-verification-round-42.md` (new) | depth | `check-c2-knowledge-round41.mjs`; entry-specific `check-decision-table` / `check-frontier-admission` (not applicable to these entries) | r41 checker 0 → 1 (status clause) |
| `corpus/README.md` (+3/−1 coverage rows) | coverage | coverage map (criterion 11) | +2 rows **[measured]** |
| `SCORECARD.md` (+23), `LOG.md` (+53) | calibration / freshness | `check-selfassessment.mjs --rev R` | `mismatches=0` on clean snapshots at all three revisions; live tree `mismatches=1` = `m3-unlanded-paths` (130 porcelain) **[measured]** |
| `.ufo/waves/round-42/**` | operability / calibration | `round-evidence-audit.mjs --round 42 --round-cap 64` | exit 2, `refused: cannot read the round report at .ufo/reports/round-42/tabi.md` **[measured]** |
| `corpus/lessons/round-42.md` | calibration (D1/D2 logging; S146 `used-by`) | `check-sources.mjs` (E11) | **missing** → `used_by_missing` S146 **[measured]** |
| `corpus/evidence/round42/**` | coverage (C1 evidence) | C1 predicate conj. 2 | **untracked**, `ls-tree` 0 at `0081bfd` **[measured]** |

### C.2 The readings the L1 must produce at the candidate commit

| Axis | Gate, production mode | Required reading | Measured at `0081bfd` |
|---|---|---|---|
| calibration | `node scripts/check-selfassessment.mjs --rev <R> --repo <lane>` | `verdict=clean … mismatches=0`, exit 0 (criterion 92: the candidate reading, not a replay) | clean on clean snapshots; live tree `mismatches=1` (m3, 130 porcelain) — commit-pending |
| calibration | round-42 SCORECARD group | must carry `Axes at round start:` with all six axes **and** `saturation 8 / window 3` in the same group before any `nudge …` sentence | group has **no** such line; a nudge sentence added there reads `could-not-evaluate` (F5) |
| freshness | `node scripts/check-freshness.mjs --worktree` | `verdict=clean`, exit 0, 34/34 matched | clean, `matched=34` **[measured]** |
| freshness | byte pins (`corpus/evidence/fleet-round-1-freshness/pins.tsv`, 35 rows) | no pinned target changed without its pin refresh | pins untouched; the two new r42 knowledge files are **not** pinned **[measured]** |
| adjacency | `node scripts/check-adjacency.mjs --at <R> --json` | exit 0, `findings: []` | exit 0, `findings: []` **[measured]** |
| operability | `node scripts/check-gate-registry.mjs --rev <R>` | no *new* nonconformant gate (1 inherited, see below) | exit 1, 1 nonconformant (`check-c2-knowledge-round41` has no registry row) at `34e1779`, `9b6de3a`, `0081bfd`; **clean at `fecbdf0a`** (22 gates) → inherited from r41 **[measured]** |
| operability / depth | `node scripts/check-sources.mjs` | exit 0 | **exit 1**, 2 findings both on S146 (F2) |
| operability | `node scripts/check-c2-knowledge-round41.mjs` (r41 C2 counting command, digest-pinned `53cded9e…`) | unchanged reading, or retired with a reason | **exit 0 at `34e1779` → exit 1 at `9b6de3a`/`0081bfd`** (F3) |
| calibration | `node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev <R> --repo <lane> --json` | exit 0, `findings: []` | exit 1, sole finding `r4-quarantine-absent` **[measured]** |
| calibration | `node scripts/round-evidence-audit.mjs --rev <R> --round 42 --round-cap 64` | not `could-not-evaluate` | exit 2 (round report absent) **[measured]** |
| calibration | C1 controls — `node scripts/measure-c1-round41.mjs --battery` plus the three frozen replays (`.ufo/waves/round-42/controls/c1-*`) | battery all-pass, every replay nonzero | battery 6/6 pass, exit 0; r39/r40/r41 replays exit 1 each **[measured]** |
| all | every remaining gate with a production mode | run in that mode (QUALITY 101), not only `--selftest` | `check-bfcache-receipt`, `check-s106-evidence`, `check-source-reopen-receipt` exit 0 at all three revisions **[measured]** |
| calibration | `git status --porcelain` at the landing | the round's own evidence is committed (no m3) | 130 porcelain paths incl. `corpus/evidence/round42/` **[measured]** |
| hygiene | working tree | no untracked symlink loops in `corpus/` | `corpus/knowledge/knowledge -> …/corpus/knowledge/` and `corpus/lessons/lessons -> …/corpus/lessons/` exist (mtime 12:39:23; **not mine**) — must not enter the landing commit (F6) |

---

## Findings (counterexample, evidence, axes, smallest safe correction)

### F1 — C1's kill rule already fires: a counter hole produces exit 0 with zero browser **[measured]**

Counterexample: the frozen counter v4 returns `predicate=true, findings=[]`, exit 0 on
**committed** round-41 bytes with **only the nonce relabeled**, and launches no browser.

```
$ node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs /fast/…/CritAdmissionPolicy/reach/r2.json \
    --nonce aa41e3a01dc033ef3774b244c3fd78a9e49afa0bc3f17a2a4e9ca1ccb5f21640 \
    --witness /fast/…/CritAdmissionPolicy/reach/w2.json \
    --pins .ufo/waves/round-41/claims.json
COUNTER_EXIT=0
{"schema":"tabi-r41-c1-measured-v4", …, "receiptSha256":"3deccfd546f0c49b7dbbb992fb1be5c7ba9f5068dcd85fe91ac03c2c0973d4e8"}
$ python3 -c "…print('predicate',d['predicate'],'findings',d['findings'])"
predicate= True findings= []
```
(evidence `evidence/c1-counter-nonce-relabel-reach.json`, `evidence/c1-reach-nonce.txt`)

Two settled wave seats reached the same class independently: `CritC1Reach/report.md` (verdict
`finding`: "counter exit 0 with predicate true and empty findings was reached with zero browser
three ways — round-41 bytes relabeled, round-42 bytes relabeled, hand-written receipt naming
pid 1 as firefox") and `CritC1Witness.md` (verdict `finding`: "counter v4 returns predicate true,
findings [], exit 0 on a 4-scalar nonce patch of committed r41 bytes and on a 6.7 KB fully
synthetic receipt+witness with no browser run").

The frozen kill rule's own parenthetical names this class: "**a forgery or counter hole that
produces exit 0 without a browser run**". The counter is a named stage of the predicate sentence
("counter exit 0, predicate true and empty findings"), so the parenthetical is satisfied by the
counter reaching exit 0. A narrower reading — that only the *counting command's* exit 0 counts —
does not save the claim: `git ls-tree -r --name-only 0081bfd -- corpus/evidence/round42` returns
**0 files** (the receipts are untracked), so C1's second conjunct fails independently and
unambiguously (A2).

Axes impacted: **coverage** (no capability row may enter), **calibration** (a green counter is
not evidence of a browser run), **freshness** (the nonce is self-declared by the caller).

Smallest safe correction (no claim amendment): refuse C1 for round 42; record the reach and its
exact command in the round report and lesson; keep coverage at 9; carry the finding forward as
the frozen kill rule directs ("the finding is routed to the next round").

### F2 — The C2 repair turns the lane's own SOURCES gate red where it was green at the round baseline **[measured]**

Counterexample: at the round-start baseline the lane's sources gate is clean; at the freeze
commit and at HEAD it fails with exactly two findings, both on the row this round edits.

```
$ node scripts/check-sources.mjs --root <snapshot of 34e1779> --file corpus/SOURCES.md
SOURCES_GATE verdict=clean rows=147 tiers=A:131,B:7,C:9 status=queued:15,mined:123,rejected:9 findings=0   (exit 0)
$ node scripts/check-sources.mjs --root <snapshot of 9b6de3a> --file corpus/SOURCES.md
FINDING id=rejected_without_flip fleet=- row=S146 detail=rejection_requires_reason_and_flip
FINDING id=used_by_missing fleet=E11 row=S146 detail=path_missing
SOURCES_GATE verdict=failed rows=149 … findings=2                                                        (exit 1)
$ node scripts/check-sources.mjs --root <snapshot of 0081bfd> …                                           (exit 1, same two)
```
(evidence `evidence/sources-baseline-34e1779.txt`, `evidence/sources-freeze-9b6de3a.txt`,
`evidence/sources-head-0081bfd.txt`)

Cause: the frozen C2 r2 clause requires `S146`'s status cell to be `rejected`
(`check-routed-defects-round42.mjs:92,101-103`). `check-sources.mjs:325-327` requires a rejected
row's `teaches` cell to contain `REJECTED:` and `flip:` (CORPUS.md:101-102), and its `used-by`
path to resolve. S146's `teaches` still carries the old quote, and its `used-by` points at
`corpus/lessons/round-42.md`, which is not committed.

`used_by_missing` clears when the round-42 lesson lands (it must land anyway — QUALITY 10, and
QUALITY 7's aggregate). `rejected_without_flip` does **not** clear: CORPUS.md rule 2 permits
only `status`, `recheck` and `used-by` to change in place, so a `teaches` cell cannot legally
acquire `REJECTED: … flip: …` after the row is written. I verified both branches on fixture
repos built from the HEAD tree:

| variant | `check-sources` | C2 checker |
|---|---|---|
| A: as frozen (S146 rejected, teaches unchanged, r42 lesson present) | **exit 1** (`rejected_without_flip`) | **exit 0** |
| B: S146 back to `mined` | exit 0 | exit 1 (`r2-s146-not-rejected`) |
| E: S146 rejected + `REJECTED:/flip:` in `teaches` + `used-by` = r41 entry | exit 0 | exit 0 (with a TSV) |

(evidence `evidence/variantA-asis-sources.txt`, `evidence/variantA-asis-c2.json`,
`evidence/variantB-revert-sources.txt`, `evidence/variantB-revert-c2.json`,
`evidence/variantE-sources.txt`)

Axes impacted: **depth** (the source registry no longer conforms to its own contract),
**operability** (a production gate green at baseline is red at the landing), **calibration**
(the round's own record says the D2 repair is an improvement).

Smallest safe correction: pick one and record it — (a) land the round-42 lesson so
`used_by_missing` clears, and route `rejected_without_flip` as a *contract-vs-gate* finding
(the gate demands in-place `teaches` text that rule 2 forbids), or (b) obtain an operator
reading that a superseded-then-rejected row may carry the `REJECTED:/flip:` form as a logged
old→new correction, and land it. Either way the round may not report "no axis harmed" silently
(AXES.md:34-37).

### F3 — C2's r2 clause and r41's frozen C2 counting command are mutually exclusive **[measured]**

`scripts/check-c2-knowledge-round41.mjs` is r41's frozen C2 counting command and is digest-pinned
in r41's claims (`frozenDigests["scripts/check-c2-knowledge-round41.mjs"] =
53cded9ec0ad1816488fbc6cee228ad29180137261c6a5654ae7499eea8820b8`; I re-verified the bytes are
unchanged at `9b6de3a` and `0081bfd`). Its code requires `cells[8] === 'mined'` for S146.
C2's frozen r2 clause requires `cells[8] === 'rejected'`.

```
$ node scripts/check-c2-knowledge-round41.mjs --root <snapshot of 34e1779>
{"schema":"tabi-r41-c2-knowledge","predicate":true,"findings":[]}                        (exit 0)
$ node scripts/check-c2-knowledge-round41.mjs --root <snapshot of 9b6de3a>
{"predicate":false,"findings":["registry-status:S146:rejected","registry-usedby:S146"]}  (exit 1)
$ node scripts/check-c2-knowledge-round41.mjs --root <snapshot of 0081bfd>
{"predicate":false,"findings":["registry-status:S146:rejected","registry-usedby:S146"]}  (exit 1)
```
(evidence `evidence/r41checker-baseline-34e1779.txt`, `…-freeze-9b6de3a.txt`,
`…-head-0081bfd.txt`)

I then built the best-case SOURCES state (variant E: rejected **with** `REJECTED:/flip:` and
`used-by` restored to the r41 entry): `check-sources` exit 0, r42 C2 checker exit 0, and the r41
checker **still** exit 1 on `registry-status:S146:rejected`
(`evidence/variantE-r41checker.txt`). No committed state satisfies both. Both predicates are
frozen; the round may not amend either.

Axes impacted: **calibration** and **operability** — a previously-green, digest-pinned lane
instrument is red at the landing.

Smallest safe correction: record the r41 C2 checker as superseded by C2's r2 clause, with the
reason and the two readings, in the round lesson + LOG + (separately) the lane's gate registry,
and state the trade. Do not silently leave it red.

### F4 — r4 certifies row *shape*, not re-adjudication: 38 rows can cite one blob **[measured]**

Fixture repo built from the HEAD tree with a TSV of the 38 real ids, all 38 rows citing the
**same** committed blob (`corpus/evidence/round41/playwright-egress/receipt.json`), verdicts
`absent`:

```
$ awk -F'\t' '{print $3}' …/re-adjudication.tsv | sort | uniq -c
     38 corpus/evidence/round41/playwright-egress/receipt.json
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev <fixture rev> --repo <fixture> --json
{"predicate":true,"findingCount":0,"findings":[]}      (exit 0)
```
(evidence `evidence/variantA-asis-c2.json`; rows and evidence table reproduced in this seat's
probe log)

So the r4 clause distinguishes neither "38 re-adjudications" from "one blob cited 38 times", nor
a fetch capture from a self-authored note. QUALITY 86 governs: the round must record the plain
distinct counts beside the gate's reading. For the real wave (measured now, all seats landed):

| plain count | value |
|---|---|
| TSV rows required / evidence files present | 38 / 38 |
| distinct evidence paths | 38 |
| evidence files recording an explicit HTTP status | 36 |
| evidence files recording a sha256 | 38 |
| fetch body copies committed under the seat dirs | 22 |
| **non-author re-opens** | **0** |

Axes impacted: **calibration** (a green r4 is not discernment), **coverage** (row counts).

Smallest safe correction: write those counts into the round report next to the checker's
reading, and hold calibration at B2 (`unprovable`) until a named non-author re-opens one admit
and one reject.

### F5 — the round-42 SCORECARD group cannot carry a readable nudge state **[measured]**

`check-selfassessment.mjs`'s m4 class needs `Axes at round start:` with all six axes **and**
`saturation S / window W` inside the same round group; otherwise the statement is
`could-not-evaluate` (criterion 83: "a round group without a six-axis `Axes at round start:`
line is unread, not correct"). Probe on a snapshot of HEAD with one sentence added to the
round-42 group:

```
with `The stagnation nudge is active this round.` and no Axes line:
FINDING class=m4-nudge-state doc=SCORECARD.md line=2233 claimed=active observed=- could-not-evaluate=no `Axes at round start:` with all six axes in the round group
SELFASSESSMENT verdict=clean … mismatches=0        (clean, but the statement is unread)
```
then with `Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8. Saturation 8 / window 3.` added:
```
FINDING class=m4-nudge-state doc=SCORECARD.md line=2235 claimed=active observed=active
SELFASSESSMENT verdict=clean … mismatches=0
```
(evidence `evidence/m4-nudge-probe.txt`)

Axes impacted: **calibration**. Smallest safe correction: add the six-axis line and the
saturation/window line to the round-42 group before the disposition writes any nudge sentence.

### F6 — untracked symlink loops sit in the working tree and must not enter the landing **[measured]**

```
$ git status --porcelain | grep -v '^?? .ufo/waves'
?? corpus/evidence/round42/
?? corpus/knowledge/knowledge
?? corpus/lessons/lessons
$ ls -ld corpus/knowledge/knowledge corpus/lessons/lessons
corpus/knowledge/knowledge -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/
corpus/lessons/lessons     -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/
mtime 2026-10-28 12:39:23      (not created by this seat)
```

`check-sources` refuses a symlinked registry path (`symlinked-registry`, exit 2), and a blanket
`git add -A` would commit the loops as symlinks. Axes impacted: **operability**, **freshness**.

Smallest safe correction: the landing adds explicit paths (never `git add -A`), and the two
symlinks are removed by whoever created them before the candidate commit.

---

## Limitations

- I did **not** run the C1 counting command (`scripts/measure-c1-round41.mjs` in measure mode):
  it launches Firefox, which this seat's bounds forbid. The live clause of C1's predicate is
  therefore **not confirmed by me**; I measured only the counter stage, the committed-byte
  state, the battery and the three replay controls.
- The reach I reproduce is a **counter** hole, not a wrapper hole. `CritC1Reach` states the same
  bound ("the counting command's own exit 0 still requires a real Playwright Firefox run, which
  I did not reach and do not claim"). My F1 argument rests on the kill rule's parenthetical
  naming "a counter hole that produces exit 0", plus the independent A2 refusal (receipts
  uncommitted).
- Fixture-repo readings (variants A/B/C/D/E, r4-reuse) are on `git init` copies of
  `git archive <rev>` trees under scratch with synthetic commits; they are read-only over the
  lane. Absolute line numbers inside fixtures differ from the lane's.
- `check-freshness --worktree` cannot run inside a `git archive` snapshot (`git ls-tree
  unavailable`, exit 2); the freshness reading is taken in the lane itself.
- The m4 probe is a single-sentence insertion in a scratch copy of `SCORECARD.md`; it proves the
  line-reading rule, not the final disposition text.
- `check-gate-mutants`, `check-decision-table`, `check-frontier-admission`,
  `check-bidi-runtime`, `check-release-pins` were **not** run: each needs a claim-specific
  input (mutant table, entry path, frontier slug, release version) that this seat's item does
  not name. They must be run by the seat that owns them at the candidate commit.
- Axis-harmed verdicts are differential statements against `34e1779`; `QUALITY 101`'s "production
  mode" requirement is honoured for the gates I list and recorded as not-run for the rest.
- The wave is not settled at the time of writing (WAVE-DONE pending); C1's fifth conjunct
  (WAVE-DONE over ≥64 seats) is therefore unevaluated.

## Verdict vocabulary, one line each (for the L1's disposition block)

- C1 → **REFUSE**: kill rule fires on a demonstrated counter hole producing exit 0 with no
  browser (two settled seats + this seat's reproduction), and the receipts are uncommitted at
  the measured revision. No capability row; coverage 9→9.
- C2 → **UNPROVABLE for calibration** (ledger mechanics improved, ledger truth self-authored):
  r4 cannot distinguish 38 re-adjudications from one reused blob, and a dispatch seat is still
  the lane; `improved` requires a non-author re-opening one admit and one reject. Landed inside a
  trade: `check-sources` 0→1 and the digest-pinned r41 C2 checker 0→1.
- Round → **no axis harmed: NOT ESTABLISHED.** Two production gates green at `34e1779` are red
  at `0081bfd`, both caused by the C2 r2 repair; the operator must rule on the trade.

VERDICT finding — C1's frozen kill rule already fires on a demonstrated counter hole (exit 0, no browser, committed r41 bytes with only the nonce relabeled) and its receipts are uncommitted at the measured revision, so no capability row may enter; C2's checker can green while the lane's own `check-sources` (0→1 at `9b6de3a`) and r41's digest-pinned C2 counting command (0→1) go red, and its r4 clause greens 38 rows citing one blob, so a self-authored TSV lands calibration `unprovable`, not `improved`.
