# ConnSiblingLedger — sibling routed-defect-ledger overlap vs tabi round-42 C2

Seat: `ConnSiblingLedger` (connector, leaf). Judged axis: **adjacency** (round start 8; the round's
lowest). Milestone: sibling ledger overlap. Mode: read-only over siblings, read-only over the lane
except this seat directory.

Lane tip read throughout: `0081bfdb93b6bd1bf2853bb128996f1a976b7218`. Freeze commit
`9b6de3a19de11abdb80e82a1310abc64a40215bb`. Baseline `34e177959d1b7ce04afb85a001420e02631ce79e`.

No sibling byte and no lane byte outside `.ufo/waves/round-42/w1/ConnSiblingLedger*` was written.
All fixtures, clones and manifests live under `/fast/scratch/hyaku/tabi-r42/ConnSiblingLedger/`,
which is removed before yield. No tool install or upgrade was needed or performed; pacman was not
run.

---

## 1. Axes named

| axis | start | this seat's relation |
|---|---|---|
| **adjacency** | 8 | judged axis. §4 is a verified adjacency-map move; §3 is the contested-scope statement. |
| calibration | 9 | C2's axis. §2 reports four predicate reaches and one instrument contradiction; I do **not** score or amend C2. |
| operability, depth, coverage, freshness | 9 each | untouched; nothing here adds or removes a script, gate or scorecard row. |

The round's `saturation` is 8 and C1 carries the capability move; this seat therefore proposes no
capability and no score change. **Report, never absorb.**

---

## 2. What C2's checker actually checks (measured, at the tip)

`node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev <REV> --repo <lane> --json`
— sha256 `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8`, byte-identical at the
freeze commit and at the tip (`git show 9b6de3a:<path> | sha256sum` == `git show HEAD:<path> |
sha256sum`); the frozen predicate sentence in `claims.json` has sha256 `a66358d2095cc268…` at both
revisions, and no commit after the freeze touches `counters/` or `claims.json`.

Verbatim behaviour:

```
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev 0081bfdb… --repo …/tabi-shokunin --json
{ "schema":"tabi-r42-routed-defects","rev":"0081bfdb93b6bd1bf2853bb128996f1a976b7218",
  "predicate":false,"findingCount":1,
  "findings":[{"id":"r4-quarantine-absent",
               "detail":".ufo/waves/round-42/quarantine/re-adjudication.tsv not committed at REV"}] }
exit=1
```

Four clauses: r1a/r1b (receipt/witness committed ≥1000 B, JSON, sha256 equal to a digest read from
the committed `c1-measure.json`), r2 (S148 `teaches` begins `supersedes S146`, the rest a verbatim
substring of the committed staged HTML, 1–25 words; S146 status `rejected`), r3 (baseline control
non-empty, contains `ls-tree` and a standalone `0`), r4 (TSV = exactly the 38 slice ids, no dup,
verdict ∈ {present,absent,misbound,partial,unreachable}, every evidence path a committed blob ≥200 B).

Critically: **the C2 checker never reads the round-41 verifier's routed-defect record** — i.e. the
`## 6. Routed defects` section of `corpus/lessons/round-41-verifier-spotcheck.md` that names D1–D4.
It reads only artifacts those defects are *about*. That is the structural difference from every
sibling ledger below, and the seam this report sits on.

### 2.1 Four reaches I reproduced independently (corroboration, not novelty)

In-lane seat `CritC2Ledger` reported the same class (its V0/V3/V7/V9/V14). I reproduced four of them
in separate scratch git fixtures seeded from the lane's **real committed blobs**, each a single
commit. Evidence files carry the transcripts.

| reach | world | result |
|---|---|---|
| **r4 token-dump** | 38 rows, verdict `present`, each evidence a 240-byte filler blob, no source fetched, no adjudication | `predicate: true`, `findingCount: 0`, **exit 0** |
| **r4 one shared blob** | 38 rows all citing ONE 247-byte blob | `predicate: true`, **exit 0** |
| **r1 self-referential** | fabricated `receipt.json` = `{"browser_runs":[],"note":"no browser ever ran"}` + park, fabricated witness, `c1-measure.json` rewritten to the fabricated digests — all in ONE commit | `predicate: true`, **exit 0** |
| **r2 degenerate quote** | S148 `teaches` reduced to `supersedes S146 — options.` (1 word; `options` occurs 60× in the real staged copy) | `predicate: true`, **exit 0** |
| **r3 stub** | `git ls-tree -r HEAD corpus/x \| wc -l\n0\n`, **39 bytes**, everything else the real committed bytes | `predicate: true`, **exit 0** |

Evidence: `evidence/r4-token-dump-and-r2-degenerate.txt`, `evidence/r1-self-referential-forgery.txt`,
`evidence/r3-stub-reach.txt`.

These are **findings to route**, not amendments: the claim's kill rule says "No post-data predicate
amendment", and a clause no code line enforces is tabi's own QUALITY 73 defect class. I do not
propose changing a frozen byte.

---

## 3. The three sibling overlaps — what theirs checks, what C2's checks, CITE or ROUTE

### Overlap A — kumitate `scripts/routed-ledger.mjs` (contract `kumitate-routed-ledger-v1`)

Read at `kumitate-shokunin@14057f3e3899180c95713bace088fb9c0d0046e3`
(lane-tip ladder `refs/heads/master`; sibling is in detached state, `git branch -a` shows
`(no branch)` + `master`).

**What it checks** (header `:12-33`, `:44-45`): every routed ITEM in every
`corpus/lessons/round-N-verifier-spotcheck.md` routed section has ≥1 ledger row (`UNLEDGERED`);
every row binds to its item by a **located quote (≤25 words) found in that item's text**
(`QUOTE_ABSENT`); every closed/wontfix row binds to its answer by **`path:line` plus a located
quote found on that line (±2)** in a lane file that is **neither the ledger nor a spot-check**
(`ANSWER_DEAD`); `--classes` emits `RECURRENT <c>` for any class in **≥4 distinct spot-check
rounds**. Verdict `ROUTED_LEDGER: CLEAN|DRIFT|FAIL-CLOSED|USAGE`; ledger absent ⇒ exit 2.

**What C2 checks:** 38 ids against `slice-ids.txt`, an enum, and a blob-size floor. No item↔row
binding, no located quote, no answer location, no class key, no recurrence count.

**Measured cross-read (read-only).** tabi's 28 committed spot-checks copied into a scratch root plus
an empty `corpus/routed-ledger.md`, then kumitate's frozen instrument run with `--root`:

```
$ node kumitate-shokunin/scripts/routed-ledger.mjs --root <scratch> --from 1 --to 60
ROUTED_LEDGER: DRIFT spotchecks=28 sections=24 items=126 rows=0 open=0 closed=0 wontfix=0 findings=126 first=UNLEDGERED:round-13-item-1
exit=1
```

i.e. the gate reads tabi's corpus with **zero adaptation** (both lanes use
`corpus/lessons/round-N-verifier-spotcheck.md` and a `## Routed defects…` heading) and finds
**126 routed items, 0 ledger rows**. Against its own lane the same instrument is
`FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md` (exit 2), and its own selftest is
`ROUTED_LEDGER_SELFTEST: PASS (33/33)`, exit 0 — so the instrument is real and alive; kumitate's
own `corpus/routed-ledger.md` was never landed (kumitate r66/r67/r68 spot-checks record
`LEDGER66_UNMET` / `not verified`).

**Verdict: CITE the binding discipline; ROUTE the ledger itself back.**
- **Cite**: the located-quote-on-the-item and answer-must-land-somewhere-else rules are exactly the
  anti-self-reference clauses C2's r1 lacks (see §3-D).
- **Route back, do not absorb**: tabi cannot adopt kumitate's ledger. The capability was never
  admitted in kumitate (its own instrument fails closed on an absent file), and tabi has no
  `corpus/routed-ledger.md`, so citing it as a *practice* would be citing an unlanded artifact.
  The honest route is a round-43 candidate: tabi's own recurrence keyed ledger, with the ≥4-round
  threshold as the metric. My row 2 in §4 states this split.

### Overlap B — kumitate's r42 counter-amendment / sentence-identity rule

**What it checks.** `kumitate-shokunin@14057f3e:corpus/knowledge/counter-amendment-discipline.md`
C2 (`:22-25`): "The counter's header states the same predicate the plan states, so the running
program and the prose cannot drift apart without a visible byte change", receipt-bound to
`.ufo/waves/round-48/probe/caproute48-probe.mjs@sha256:3ed305f2…`, with C14/C16 (`:63-66`):
nothing changes after the first candidate score, and **the origin case is the lane's own r42
counter amendment** — a kill rule widened after build seats had already scored is not the claim's
rule; scored under the original frozen sentence that round measured 34/41.

The mechanical instantiation is a **reviewer check**, not a gate: kumitate r48 `ReviewFreeze` Check 2
does a whitespace-normalized diff of the plan's predicate sentence against the counter header comment
and requires `SENTENCE IDENTICAL`
(`kumitate-shokunin@14057f3e:.ufo/waves/round-48/r48/ReviewFreeze.md:22-31`).

**What C2 has.** Its header says "this code and that sentence are the same conditions". I ran the
same method on C2:

```
normalized lengths: header 1045 chars / predicate 1021 chars
non-equal opcodes : 21
identical         : False
similarity ratio  : 0.7076
```

Byte-identity: no. **Semantic identity: inspected clause by clause and yes** — every difference is
paraphrase (`>=1000 bytes` vs `at least 1000 bytes`, `sha256 ==` vs `sha256 equals`, `evidence path a
committed blob >=200 bytes` vs `every evidence path a committed blob of at least 200 bytes`). I found
**no clause where the header is weaker or stronger than the frozen sentence**. So this is *not* a
C2 defect claim — the header's meta-claim is about conditions, and the conditions match.

**Verdict: CITE, and only cite.** kumitate B fixes the cross-lane drift hazard; tabi's C2 is
currently clean on it by luck of paraphrase, and a future edit to either side could break it
silently because **nothing in tabi checks it**. That is a round-43 candidate, not this round's
finding. Note the sharper consequence of C14/C16 for C2's kill rule: tabi's `killRule` already
restates "No post-data predicate amendment" — the sibling lesson is that this rule is only
load-bearing if the *counter bytes* are also pinned, and C2's are not (§3-D).

### Overlap C — kotoba r69/r71: SHONEN gate incidents and the uncommitted-evidence class

Read at `kotoba-shokunin@47dbe8781657de563ff867caca6244d28e3db504`.

**C1. SHONEN at filing (K69-4 → r71 routed 1).**
`corpus/lessons/round-69-verifier-spotcheck.md:168` records "K69-4 (SHONEN at filing). The
`## SHONEN` heading was missing at filing"; `corpus/lessons/round-71-verifier-spotcheck.md:171-172`
routes it again, "(erratum needed for the second time — r69, r71)". Their check is **prose, in a
non-author closure** — kotoba has no gate for it, which is why it recurred.

**What C2 has:** nothing — a `## SHONEN` heading is not a routed-defect repair.
**What tabi already has, and does not use:** `scripts/report-contract.mjs` catches exactly this
defect class mechanically. Measured:

```
$ node scripts/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-41/tabi.md --shonen SHONEN.md
report-contract: PASS … — 6/6 sections in order; SHONEN 4/4 boxes
exit=0

$ node scripts/report-contract.mjs <replica with the ## SHONEN heading renamed>   # reproduces kotoba's r71 defect
report-contract: (a) missing section(s): shonen
report-contract: (b) no ## SHONEN heading
report-contract: FAIL
exit=1
```
…and it is **not a gate**: its own header says "routed lesson UTILITY … Not a gate; run it by hand";
`grep -c report-contract SKILL.md` → **0**; it does not match the gate-registry naming universe
(`/^(check-[a-z0-9-]+|[a-z0-9-]*audit[a-z0-9-]*)\.mjs$/`, `scripts/check-gate-registry.mjs:66`), so
`check-gate-registry.mjs` cannot see it (measured: registering it as `gate` yields
`e2-field-incomplete … latest row missing: selftest`; as `probe` it adds nothing and leaves
`nonconformant` at the pre-existing 1).

**Verdict: CITE kotoba's recurrence as the reason to enforce; ROUTE the enforcement back as a
round-43 candidate.** Do not absorb kotoba's promotion-checklist semantics or its SHONEN boxes.

**C2. Uncommitted round work (K69-5 / M112, recurring as M115).**
`kotoba-shokunin@47dbe878:corpus/lessons/round-69-verifier-spotcheck.md:173` —
"K69-5 (uncommitted round work, M112 class recurrence)". The class's own history in kotoba:
`round-68` R68-7 (24 paths), `round-69` K69-5, `round-70` M115 ("the M112 class recurring"), each
with a fresh fix. kotoba's mechanical answer is `check_r68_routed_repairs.py` D7
(`:35`): "each of the 24 uncommitted round-68 wave paths is committed at `--rev` … or is named on a
`disposition: removed <path>` line", **plus an exact numstat so a truncated landing passes the path
test** — and `check_r69_routed_repairs_v2.py`'s base-prefix byte integrity (MED-2: "blanked-history
and edited-history worlds fail").

**What C2 checks:** the *committed-ness* of exactly two r41 files. It cannot see the class
generally, and it makes no statement about the round's own wave outputs.
**Tabi's own state, measured at the tip:** `git status --porcelain | wc -l` → **131** untracked
round-42 wave paths (expected mid-wave, named so the closure does not read C2 as covering it), and
**1** tracked file under `.ufo/waves/round-42/w1/` (the marker) against 59 seat report files on
disk.

**Verdict: ROUTE back, and this is the single most load-bearing route in this report.** tabi has no
`TREE_DIRTY` / `UNPUSHED` / `REPORT_UNTRACKED` class in its registry —
`grep -rln "status --porcelain" scripts/*.mjs` → only `check-selfassessment.mjs` — while kumitate's
`scripts/round-gate.mjs:91-94,187,463-489` implements exactly those three as `error`-severity
classes. Cite kumitate's implementation; route the tabi gate as round-43 ground.

### Overlap D — the sibling lesson that turns A–C into a *finding about tabi*: tabi already owns the refusing instrument

This is the non-obvious result of the scan, and it is not in any sibling lane: **tabi's own frozen,
registered, self-tested gate refuses the exact revision the frozen C2 checker accepts.**

`scripts/check-measurement-binding.mjs` (SKILL.md:2476 balance-sheet row: `kind=gate`,
self-test `cases=76 reasons=13`, registry-conformant; its finding vocabulary is closed and includes
`counter_digest_unrecorded`, `counter_digest_mismatch`, `counter_changed_since_measurement`,
`counted_input_undeclared`, `counted_input_changed`).

**Head-to-head on ONE forged revision** (`evidence/binding-vs-c2-head-to-head.txt`). Fixture: commit 1
carries the lane's real committed r41 receipt, witness, measure record, staged HTML, baseline control,
`SOURCES.md`, `slice-ids.txt` and the frozen C2 checker; commit 2 fabricates the receipt/witness
(`{"browser_runs": [], "note": "no browser ran"}`), rewrites `c1-measure.json` to the fabricated
digests, and adds a junk 38-row TSV.

```
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev <forge2> --repo <forge2> --json
predicate=True   exit=0            <-- C2 says the round-41 repairs are closed

$ node scripts/check-measurement-binding.mjs --check <manifest> --at <forge2> --json --repo <forge2>
failed
  counted_input_changed :: paths=…/c1-measure.json,…/receipt.json,…/receipt.witness.json,…
  exit=1
```

And the same instrument on the lane's **real** bytes, with a manifest declaring the C2 checker as
counter at `measuredRevision = 9b6de3a` and the 7 blobs its clauses actually read:

```
$ node scripts/check-measurement-binding.mjs --check <c2-binding> --at 0081bfdb… --json --repo …/tabi-shokunin
verdict=clean bound=1 findings=[]
exit=0
```

Teeth verified: append one comment line to the checker after the measured revision ⇒
`counter_changed_since_measurement` + `counted_input_changed`, exit 1.

**Measured limit, stated rather than hidden:** `--reproduce` is unusable here. The reproduce arm
requires exit 0 on *both* arms, and a findings-counter exits 1 on a red arm (`--rev 34e1779` →
`findingCount: 7`, exit 1). So the attestation is **digest + ancestry + counted-input drift**, not
re-execution. That is a real weakening relative to a pass/fail counter and must not be described as
reproduction.

Context that makes D sharp: **no committed byte in the lane names the C2 checker's digest**
(`git grep -l b1d05df1 refs/heads/master` → 0 files; the only occurrences anywhere are inside
untracked seat artifact directories). C2's only pin is that the file happens to be unchanged so far.

---

## 4. The contradiction: C2's r2 clause is satisfiable only by a state tabi's own registered gate calls FAILED

This is the finding no in-lane seat reported, and it is a genuine two-instrument conflict rather than
a single checker's weakness.

C2's frozen r2 requires **S146 status cell = `rejected`**. tabi's registered `sources-census` gate
(`SKILL.md:2470`, row conformant; `scripts/check-sources.mjs:325-327,338`) requires any `rejected`
row's `teaches` to contain `REJECTED:` **and** `flip:`, and every `used-by` path to resolve.

```
$ cd <baseline 34e1779 tree> && node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=147 … findings=0            exit=0

$ cd <freeze 9b6de3a tree>  && node scripts/check-sources.mjs
FINDING id=rejected_without_flip fleet=- row=S146 detail=rejection_requires_reason_and_flip
FINDING id=used_by_missing      fleet=E11 row=S146 detail=path_missing
SOURCES_GATE verdict=failed rows=149 … findings=2           exit=1

$ node scripts/check-sources.mjs            # current tip, same two findings
SOURCES_GATE verdict=failed rows=149 … findings=2           exit=1
```

Cause, read from the committed row: S146 `teaches` contains no `REJECTED:` and no `flip:`, and its
`used-by` is `corpus/lessons/round-42.md`, a path that **does not exist**
(`ls corpus/lessons/round-42.md` → No such file or directory). So the D2 repair landed at the freeze
commit reddened a second registered gate, and nothing in the round recorded it.

The sibling instrument for exactly this shape is kotoba's `verifiers/check_gate_finding_delta.py:3-9`
— "a gate that is already red at base cannot report a new defect by exit code … Exit 1 when head has
a DRIFT id base did not have". Here the direction is reversed and equally invisible: a *green in one
instrument* newly reddens another, and C2's checker reads only the one cell that did it.

**Routing, not amendment.** C2's predicate and kill rule are frozen; I propose no byte change. Ground
routed to the lane: the S146 row needs the `REJECTED:`/`flip:` text `check-sources` requires and a
`used-by` that resolves (the r42 lesson does not exist yet), and tabi needs a
gate-finding-delta check so a repair that reddens a sibling gate is visible. Evidence:
`evidence/sources-gate-contradiction.txt`.

**A second, smaller counting mismatch, same family (kotoba K69-7 "numeric").** C2's frozen
`beforeState` lists **five** finding ids at the baseline; the committed red control
`controls/c2-baseline-red.json` carries **seven** (it additionally carries `r2-s146-not-rejected` and
`r4-slice-absent`, and `findingCount: 7`, matching what the checker actually prints at `34e1779`).
The frozen prose undercounts its own committed artifact. Route; do not edit.

---

## 5. Proposed move (one, bounded) — adjacency, verified by the lane's own frozen gate

**Move: land the three `split-declared` rows of §4 in `corpus/adjacency.tsv` (16 → 19) and route §2
and §4 as findings. No frozen byte, no new script, no score change.**

Why this is the adjacency move and not busywork: adjacency is defined as "evidence belonging to
another domain **reported, not absorbed**; lane reports name contested scope". The three rows are
exactly that, each with a verbatim ≤25-word quote from the sibling file **at a pinned commit on that
sibling's own lane-tip ladder**, a verbatim tabi quote on an exact line, and a `split-declared`
disposition stating where tabi's scope stops.

**Verified, not asserted.** In a faithful clone of the lane at the tip (`git clone --shared`, so the
map's pinned self-ruling commit resolves):

```
control, map exactly as committed (16 rows)
$ node scripts/check-adjacency.mjs --repo <clone> --at 0081bfdb… --fleet /home/vgpnk/Projects/shokunin
ADJACENCY verdict=clean rows=16 verified=16
exit=0

three candidate rows appended, nothing else changed (19 rows)
$ node scripts/check-adjacency.mjs --repo <clone> --at 55ab3831… --fleet /home/vgpnk/Projects/shokunin
ADJACENCY verdict=clean rows=19 verified=19
exit=0
```

The three rows, verbatim (TAB-separated, 9 columns):

```
routed-ledger-item-quote-identity	kumitate	kumitate-shokunin@14057f3e3899180c95713bace088fb9c0d0046e3:scripts/routed-ledger.mjs:17	every row binds to its item by a located quote	SKILL.md:1840	counter blob sha256 at `measuredRevision` and at REV, ancestry	split-declared	-	Rule (QUALITY 22): a claim's count is admissible only with a recorded counter
routed-defect-recurrence-counting	kumitate	kumitate-shokunin@14057f3e3899180c95713bace088fb9c0d0046e3:scripts/routed-ledger.mjs:45	class seen in >= 4 distinct spot-check rounds	corpus/lessons/round-41-verifier-spotcheck.md:20	No uncommitted round work	split-declared	-	two files, 1.17 MB + 1.15 MB
uncommitted-evidence-ledger	kotoba	kotoba-shokunin@47dbe8781657de563ff867caca6244d28e3db504:corpus/lessons/round-69-verifier-spotcheck.md:173	K69-5 (uncommitted round work, M112 class recurrence)	corpus/lessons/round-41-verifier-spotcheck.md:20	No uncommitted round work	split-declared	-	two files, 1.17 MB + 1.15 MB
```

Why each row adds a real adjacency datum rather than restating prose:

- **Row 1** names the one discipline the sibling has and C2 lacks — a ledger row bound by a located
  quote in the item's **own** text, and a closure answer that must land in a file that is neither the
  ledger nor the spot-check. That is the anti-self-reference rule that would have caught the r1
  forgery of §2.1 at design time.
- **Row 2** imports the *metric* (≥4 distinct rounds ⇒ structural fix) without importing the ledger,
  and tabi's own committed record already crosses it — see the recurrence table below. This is the
  only place in the report where a cross-lane threshold is applied to tabi's own bytes.
- **Row 3** pairs the kotoba K69-5 incident with tabi's D1 on the same evidence quote, which is the
  honest statement that this class is shared rather than either lane's property.

### Recurrence: tabi's own committed record vs kumitate's ≥4-round threshold

Read over the lane's 28 committed `corpus/lessons/round-*-verifier-spotcheck.md`:

| class | rounds carrying it | count | kumitate threshold |
|---|---|---|---|
| uncommitted evidence | 12, 14, 16, 17, 18, 22, 23, 24, 25, 38, 41 | **11 / 28** | ≥4 ⇒ RECURRENT |
| quote fidelity | 13, 16, 17, 18, 22, 23, 26, 28, 29, 30, 31, 33, 34, 35, 36, 37, 41 | **17 / 28** | ≥4 ⇒ RECURRENT |

Both classes are far past kumitate's structural-fix threshold, and C2 closes **one instance of each**
(D1, D2) for round 41 only. That is the honest calibration statement, and it is why the recurrence
row is worth its place in the map.

### Risks

1. **Row pinning breaks on sibling edits.** Rows 1/2 pin `scripts/routed-ledger.mjs:17` and `:45` at
   `14057f3e`; row 3 pins `corpus/lessons/round-69-verifier-spotcheck.md:173` at `47dbe878`. Any
   sibling rewrite of those lines fails the gate closed (`sibling_quote_absent`), which is the safe
   direction — but a re-pin is then required. The gate refuses a *dangling* commit (a `hash-object`
   commit is not evidence), so a forged pin cannot be used.
2. **`ruling_quote` must be verbatim on the `tabi_ref` line.** A later reflow of `SKILL.md:1840` or
   `corpus/lessons/round-41-verifier-spotcheck.md:20` breaks rows 1 and 2/3 respectively. Measured:
   my first attempt failed `ruling_quote_absent` on rows 3 and 4 exactly this way, and the gate
   refused rather than passing.
3. **Harness trap, measured.** Replicating the lane with `git archive <tip> | tar -x` drops history,
   so the existing row 2 (`refused-route`, pinned self-ruling `58592431…`) reports
   `ruling_unresolved` on an **unmodified** map — 16 rows, 15 verified, exit 1. Any seat repeating
   this must use a clone with history. Stated because it looks like a defect and is not.
4. **One sibling pin is cited once.** The gate rejects a second row reusing the same
   `<lane>@<path>:<line>`. Rows 2 and 3 share the *tabi* line (allowed, verified) but use distinct
   sibling pins.
5. **A row can be misread as a claim.** All three are `split-declared`, never `ruled`, and the
   `ruling_quote` states the split — so none needs integrator arbitration and none asserts that tabi
   has adopted a sibling's mechanism. If any of these were re-labelled `ruled`, it would require a
   fleet-venue or non-author-tabi ruling line; I did not manufacture one.

### Verification the closure should run

```
node scripts/check-adjacency.mjs                     # expect ADJACENCY verdict=clean rows=19 verified=19
node scripts/check-adjacency.mjs --self-test         # cases=57, unchanged
node scripts/check-sources.mjs                       # still exit 1 until S146's row is repaired (§4)
```

Plus, if the C2 binding attestation of §3-D is adopted as closure evidence:

```
node scripts/check-measurement-binding.mjs --check corpus/evidence/round42/measurement-binding.json --at <close rev>
# expect MEASUREMENT_BINDING verdict=clean bound=1  (do NOT pass --reproduce: measured unusable)
```

---

## 6. What I did **not** do

- Did not edit, commit, fetch or push in the fleet repo, any sibling lane, `shokuknow`, or the tabi
  production tree. `corpus/adjacency.tsv`, `corpus/SOURCES.md`, `claims.json` and the C2 checker are
  byte-identical to how I found them (`git status --porcelain` shows only pre-existing untracked
  wave seat paths).
- Did not propose or apply any amendment to the frozen counter, predicate sentence or kill rule.
  Every hole in §2 and §4 is routed as a finding.
- Did not run a sibling's gate as if it were tabi's, and did not import a sibling capability row. The
  kumitate ledger run of §3-A is a read-only cross-read whose result is reported, not adopted.
- Did not verify tabi's own claim verdicts. Four reaches are demonstrated on scratch fixtures seeded
  from real committed blobs; they are evidence about the checker, not a verdict on C2.

## 7. Evidence files

All under `.ufo/waves/round-42/w1/ConnSiblingLedger/evidence/`:

| file | content |
|---|---|
| `adjacency-rows-verified.txt` | control 16/16 clean vs 19/19 clean, the three rows verbatim, the `git archive` harness trap |
| `sibling-instrument-crossreads.txt` | kumitate `routed-ledger` over tabi's 28 spot-checks (126 items, 0 rows), its own selftest 33/33, and the empty-ledger FAIL-CLOSED |
| `binding-vs-c2-head-to-head.txt` | C2 green vs `check-measurement-binding` red on the same forged revision; the clean attestation on real bytes; the `--reproduce` limit |
| `sources-gate-contradiction.txt` | `check-sources` clean at baseline, failed at the freeze commit and at the tip, with the S146 cells |
| `r4-token-dump-and-r2-degenerate.txt` | 38 junk rows / one shared blob / 1-word quote all `predicate: true` |
| `r1-self-referential-forgery.txt` | fabricated receipt+witness with a rewritten measure record, `predicate: true` |
| `r3-stub-reach.txt` | 39-byte baseline control satisfies r3, `predicate: true` |

VERDICT finding — three sibling routed-defect-ledger overlaps classified (kumitate ledger binding + recurrence: CITE the discipline, ROUTE the ledger; kumitate r42 sentence-identity: CITE only, C2's header is semantic-but-not-byte identical with no clause weakened; kotoba K69-4/K69-5: CITE the recurrence, ROUTE enforcement because tabi's own `report-contract.mjs` already catches the SHONEN class but is unregistered and unenforced); plus one two-instrument contradiction (C2's r2 demands an S146 status that makes tabi's own registered `sources-census` gate fail at the freeze commit and the tip) and one unapplied instrument (tabi's frozen `check-measurement-binding` refuses the exact forged revision the frozen C2 checker accepts with `predicate: true`, while no committed byte pins the C2 checker's digest); the bounded move is three `split-declared` adjacency rows verified `clean rows=19 verified=19` by the lane's own frozen gate.
