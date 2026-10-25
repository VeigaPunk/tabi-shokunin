# SimplifyGateCode — YAGNI review of the two round-27 scripts

Seat: simplifier (w1). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(branch `master` = `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`, baseline
`f185b4e7ab10cd9e8925e8ec614c9c111772357d`).
Mode: read-only. **No tracked file was edited.** Zero deletions landed in the lane;
every trim below is a *deletion candidate*, and each was applied and measured on a
throwaway copy under `.ufo/waves/round-27/scratch/SimplifyGateCode/`.
No tool installed or upgraded (nothing needed; see §9).

Axes I judged the moves against: **calibration** (a gate that reports a number the
bytes do not support), **depth** (does the new gate actually decide what it claims),
**operability** (surface a reader must keep in their head), plus one housekeeping
axis — six-month maintainability (duplicate authorities). A move is "kept" only if it
improves one axis and harms none *as measured on the real lane bytes*.

---

## 0. What I read and ran

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --stat f185b4e7ab10cd9e8925e8ec614c9c111772357d master -- scripts/
  scripts/check-s106-evidence.mjs  | 337 +++++++++++++++++++++++++++++++++++++++
  scripts/check-selfassessment.mjs | 188 ++++++++++++++++++++++++--
  2 files changed, 513 insertions(+), 12 deletions(-)
```
Full diffs read for both files, and both files read whole in ranges
(`check-selfassessment.mjs` helpers :110-330 and CLI/selftest :640-756;
`check-s106-evidence.mjs` :1-337).

**Concurrent working-tree edit (not mine).** While this review ran, a seat with
write scope left an uncommitted, comments-only change on the s106 gate — 5
insertions / 5 deletions (`git diff --stat scripts/check-s106-evidence.mjs`), no
code line touched. It (i) updates `` `--selftest` (5 isolated cases`` in the header,
(ii) replaces *"predicate, counter, kill rule and target are the claim's,
unchanged"* with *"implements the predicate … also checks anchor uniqueness and
decoded byte count"*, and (iii) rewrites the formula to
`` valid = present && sha_match && anchor_located && anchor_unique && byte_count_match ``.
That is the disclosure half of my T6; it makes the recommendation below
conditional. **Every line number I cite is `master`'s committed bytes**, which is
what the item asked for; the working-tree copy differs only in those comments.

Non-vacuity of the two counters, re-run by me:

```
node scripts/check-selfassessment.mjs --selftest --json   -> exit 0, cases=17, passed=17, ok=true
node scripts/check-s106-evidence.mjs  --selftest --json    -> exit 0, cases=5,  passed=5,  ok=true
node scripts/check-s106-evidence.mjs  --rev master --json  -> exit 0, valid=true, sha_match=true,
                                                              anchor_located=true, anchor_unique=true,
                                                              byte_count_match=true, decoded_bytes=73952,
                                                              anchor.occurrences=1, anchor.line=187
node scripts/check-selfassessment.mjs --rev master --json  -> exit 1, mismatches=1, couldNotEvaluate=92,
                                                              superseded=10, findings=115
```
The single counted mismatch at `master` is
`m3-unlanded-paths {claimed:"landed", observed:36}` — the working-tree class, not
an m1 LOG finding. It moves with concurrent wave scratch: the same read a few
minutes later gave `git status --porcelain --untracked-files=all | wc -l` = 46.
**LOG-window stale mentions counted at `master`: 0** (every m1 LOG finding is
`superseded` or `observed===claimed`; see §6 note for the receipt).

Frozen predicates I checked against (read-only):
`.ufo/waves/round-26/claims.json:28` (C1 declared, resumed unchanged at
`.ufo/waves/round-27/claims.json:24`) and
`.ufo/waves/round-27/claims.json:38` (C2 declared).

---

## 1. (a) Is the paragraph the smallest supersession unit the frozen claim requires?

**Verdict: no — and the shipped rule is broader than the frozen text in two
independent ways. One of the two is a safe trim (proven neutral); the other is a
real weakening that must not be "trimmed" without a new correction bullet.**

The frozen conjuncts are one sentence: *"an append-only correction line later in
LOG.md names the same script, states the oracle-correct number, carries a
correction marker and cites the superseded line"*
(`.ufo/waves/round-26/claims.json:28`, 33 words, quoted in part).

### A1. The paragraph unit is *necessary* — a strict per-line unit falsifies the real block

The shipped correction block is `LOG.md:1904-1925`: five bullet items, each
wrapped over 4-5 lines. The marker and citation sit on the first line of a bullet
(`- Correction (supersedes LOG.md:335): the four-case figure quoted at :335 is`,
`LOG.md:1904`); the script name and the oracle number sit on its last line
(`` `scripts/check-freshness.mjs` `--selftest` measured `cases: 12` at `f185b4e` ``,
`LOG.md:1907`). A per-line rule clears **none** of them. So the frozen word "line"
cannot be read literally against this Markdown; the container has to be wider.

### A2. But the smallest sufficient container is the **bullet**, not the blank-line block

`paragraphs()` (`scripts/check-selfassessment.mjs:256-265`) breaks only on blank
lines. The five corrections are consecutive bullets with **no** blank line between
them, so they are one unit. Measured on the real file: the unit that contains
`LOG.md:1904` runs to `LOG.md:1925` and holds all five scripts/numbers/citations
as a union — every finding is checked against the union, not its own bullet.

Worse on the older data: the unit that supersedes `LOG.md:221` starts at
`LOG.md:265` and runs to `LOG.md:447` — **183 lines**, several unrelated bullets.
Its "citation" match (`/:\d+/`, `check-selfassessment.mjs:325`) is
`127.0.0.1:18751` (`LOG.md:308`, a loopback socket in an unrelated smoke note);
the sibling unit at `LOG.md:265-284` matches `2026-10-15T05:16:28Z`
(`LOG.md:269`). Neither cites `:221`.

Fixture proof of the union (`cross-bullet` in §2 table): a bullet stating
`12/10` about an unrelated dispatch, followed by a bullet naming the script and
stating the **wrong** number `cases: 9`, clears the finding — `mismatches=0`.

**Safe trim (T3b):** split units on a top-level list marker as well as on blank
lines (`/^(?:[-*+]|\d+\.)\s/`). Four lines in `paragraphs()`. Measured
behaviour-neutral on the real lane: the patched counter returns the *same*
`log_superseded=6`, `log_stale_uncounted=0`, `mismatches` and finding set as the
tip script (§2, `P2_bullet_unit`). It removes the union; it does **not** fix A3.

### A3. "cites the superseded line" is not implemented — this is a **weakening**, not weight

`/:\d+/.test(text)` (`check-selfassessment.mjs:325`) accepts any colon followed by a
digit. It never compares the citation with `f.line`. Fixtures (§2): a correction
citing `LOG.md:999` clears a finding at `LOG.md:7`; a paragraph with **no tally at
all**, only the date `2026/10/25`, clears it because `statedTallyNumbers` harvests
`10` out of the date.

On the real lane this is load-bearing, not hypothetical: binding the citation to
`f.line` (variant `P3_bullet_cite`) turns `LOG.md:221` back into a counted
mismatch (`claimed=8, observed=12`), i.e. today `mismatches=0` depends on a
timestamp/loopback-port matching `/:\d+/`. The semantic supersession of `:221` is
real (the gate moved 8→12 cases, `LOG.md:252-258`), but no line *cites* `:221`.

So: do **not** tighten `/:\d+/` as a drive-by trim. It would change the C1 receipt
from 0 to 1 and would require the L1's own sixth correction bullet first. I flag it
as a frozen-predicate fidelity gap for the critic, not a trim for integration.

**Answer to (a):** paragraph is *sufficient* but not *smallest*; bullet is the
smallest container that still clears the real block (proven neutral, T3b). The
citation conjunct is the actual defect — it is looser than the frozen sentence and
its looseness is currently doing work on real data.

---

## 2. Fixture evidence (all under `.ufo/waves/round-27/scratch/SimplifyGateCode/`)

Each fixture is `D=$(mktemp -d)` under my scratch dir, `git -C "$D" init -q`,
`git -C "$D" rev-parse --show-toplevel` asserted equal to `$D` before the first
commit; the lane gate binaries were then run read-only with `--repo "$D" --rev HEAD`.
The fixture gate `scripts/check-fixture.mjs` prints `cases=10`, so the oracle is 10.

### 2.1 `check-selfassessment.mjs` supersession arms

| variant (`log-*.txt`) | correction paragraph | `mismatches` | LOG finding |
|---|---|---|---|
| `none` | — (control) | **1** | :7 claimed 12 / observed 10, unsuperseded |
| `wrong-num` | `cases: 9` | **1** | :7 unsuperseded (control bites) |
| `wrong-cite` | `cases: 10`, cites `LOG.md:999` | **0** | :7 superseded — citation not matched to the line |
| `date-only` | no tally, only `2026/10/25`, cites `:7` | **0** | :7 superseded — `10` harvested from the date |
| `cross-bullet` | bullet A `12/10` (unrelated) + bullet B `cases: 9` | **0** | :7 superseded — bullet union |

Shape detection (same harness, stale claim on the LOG line):

| stale claim shape on the LOG line | `mismatches` |
|---|---|
| `` `cases: 12` `` | **0** — not detected |
| `` `cases=12` `` | **1** |
| `12-case` | **1** |

This is the proof for T2: the m1 header now advertises `` `cases: N` `` as a tally
shape (`check-selfassessment.mjs:31`) but no detector accepts it for a *claim*;
frozen C1 lists only `--self-test N/N, N-case, cases=N, 'N cases'`
(`.ufo/waves/round-26/claims.json:28`).

### 2.2 `check-s106-evidence.mjs` validity conjuncts

| fixture | sha_match | anchor_located | anchor_unique | byte_count_match | exit | valid |
|---|---|---|---|---|---|---|
| clean | true | true | true | true | 0 | **true** |
| duplicate anchor line | true | true | **false** | true | 1 | false |
| `decoded_bytes` +1 | true | true | true | **false** | 1 | false |
| anchor line = `…FEATURE_DISABLED_BY_DEFAULT);` | true | true | true | true | 0 | **true** |

The last row is the one that matters: the frozen C2 predicate requires the anchor
*"with the FEATURE_ENABLED_BY_DEFAULT marker"* (`.ufo/waves/round-27/claims.json:38`),
and the gate returns `valid=true` on bytes carrying the **opposite** marker. The
marker is never tested in production code — `FEATURE_ENABLED_BY_DEFAULT` appears
only in the selftest fixture (`check-s106-evidence.mjs:148`). The real receipt
happens to carry the marker in `anchor.text`, so the measured `valid=true` is
correct; the *decider* is not checking it.

---

## 3. (b) `anchor_unique` / `byte_count_match`: inside the spec, or dead weight?

Frozen C2 names three requirements (decoded-sha over committed bytes, anchor text
at recorded line, ENABLED marker) and a report set
`{present, sha_match, anchor_located, valid}` (`.ufo/waves/round-27/claims.json:38`).
**Neither conjunct is in the frozen predicate, and neither is in the script's own
formula:** `check-s106-evidence.mjs:28-29` says `valid = present && sha_match &&
anchor_located`, while `:127` computes
`valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch`.

They are not dead code — both bind (§2.2) — so the question is whether they earn
their keep:

- **`anchor_unique` (`:124-125, 140`)** — a *strengthening* with a purpose: it makes
  the recorded line number load-bearing (otherwise the anchor is just text that
  happens to appear at that index). It is disclosed in the header prose
  (`:28`, "uniquely") but missing from the header formula. It has **no selftest
  case**: case ids are `clean-fixture-valid` (:177), `sha-mismatch-invalid` (:183),
  `anchor-off-by-one-invalid` (:190), `missing-bytes-could-not-evaluate` (:202),
  `missing-receipt-could-not-evaluate` (:208) — exactly the frozen
  `failureCapable` list plus the killRule's missing-receipt arm. Keep it, but it is
  an untested validity conjunct; my `dup-anchor` fixture is a ready 4-line case.
- **`byte_count_match` (`:126, 141`)** — the weakest of the four. `decoded_sha256`
  is taken over the same bytes, so a content change already fails `sha_match`; this
  conjunct can only fire on a receipt whose `decoded_bytes` is internally wrong
  (`parseReceipt` requires the field, `:84`). At `master` it is **undisclosed** in
  the header (neither prose nor formula), outside the frozen report set, and
  untested. The working tree is currently fixing the disclosure; the coverage gap
  remains either way.

Net: `anchor_unique` = justified improvement; `byte_count_match` = a receipt-honesty
strengthening whose only defect is that neither it nor `anchor_unique` has a
failure-capable case. There are therefore two coherent end states — **keep both and
test them** (the lane's current direction, +2 cases) or **drop `byte_count_match`
from `valid`** (−1 line, −1 undocumented failure mode). Shipping either conjunct
without a case is the option that does not survive six months.

---

## 4. (c) Unreachable branches, duplicate pattern lists, selftest size

### 4.1 Dead / unreachable

| where | what | proof |
|---|---|---|
| `check-selfassessment.mjs:121-126` | `TALLY_PATTERNS` — 4 regexes, 6 lines, **zero readers** | `git grep -n "TALLY_PATTERNS" -- scripts/` matches only the declaration (`:121`). Introduced used in `f6f7f45`, its only consumer was removed in `2f35bd4` (both round 24): `git log -S "for (const re of TALLY_PATTERNS)"`. Round 27 then hand-copied the same four regexes a third time. |
| `check-s106-evidence.mjs:332` | `${out.reason ? ... }` — `reason` is never assigned | `grep -n "reason" scripts/check-s106-evidence.mjs` → 1 hit, the interpolation itself. Dead branch in the human-readable output. |
| `check-s106-evidence.mjs:46` vs `:43` vs `:162` | three copies of the schema string (`RECEIPT_SCHEMA`, `SCHEMA`, fixture literal) | `grep -n "tabi-s106-evidence-v1"` → `:43`, `:46`, `:162`. |
| `check-selfassessment.mjs:305` | `lineText: line` on LOG findings — never read (only the SCORECARD supersession at `:238` reads `lineText`) | the LOG supersession at `:316-329` uses paragraph text |
| `check-selfassessment.mjs:658,681`; `check-s106-evidence.mjs:260` | `let exit = 0;` immediately overwritten in both branches | local read |

None of these is undoable risk: the first four are pure deletions, `exit` is a
micro-nit.

### 4.2 Duplicated scan — 43 of 61 lines are verbatim shared

`m1Findings` (`:184-244`, 61 lines) and `m1LogFindings` (`:267-331`, 65 lines)
differ only in the doc label, the supersession block, and one comment. Longest
identical runs: 19 lines (`:187` ↔ `:270`, the claim scan) and 17 lines
(`:209` ↔ `:292`, association → targets → oracle push); 43 lines total by
`difflib.SequenceMatcher` on the normalised bodies. The duplication has **already
drifted**, which is the argument that it is not hypothetical:

- marker regex `supersed|correct|replace|replac|superseding` (`:238`) vs
  `supersed|correct` (`:324`);
- claim detector accepts `cases=` only (`:206`), while `statedTallyNumbers`
  accepts `cases[:=]` (`:249`);
- `lineText` only read by one window.

**T4:** extract `lineClaim(line)` (claims + fraction validity) and
`associate(line, sectionScripts)` and call them from both scans; leave each
window's *supersession* separate (the units genuinely differ). ~50 lines removed,
one place to change a shape. Guard: the 17 selftest cases.

### 4.3 The `TALLY_PATTERNS` vs `statedTallyNumbers` overlap — is it justified?

**Partly.** The overlap that is justified: `statedTallyNumbers` must accept
`` `cases:` N `` because the real correction block writes it that way
(`LOG.md:1907`, `:1911`, `:1915`, `:1919`, `:1925`), while the claim detector keeps
the frozen `cases=`. That asymmetry is real and needed.

The overlap that is **not** justified: `TALLY_PATTERNS` is already dead, so the
"duplication" is between a live function and a corpse; and
`statedTallyNumbers` adds a fifth arm — `\b(\d+)\s*\/\s*(\d+)\b` (`:252`) — that is
not a tally shape at all. It is what lets the date `2026/10/25` state "10" (§2.1).
**T3:** delete that one arm. Measured on the real lane (`P1_drop_fraction`):
identical `mismatches`, `couldNotEvaluate`, `superseded`, and identical finding
set — all six real supersessions survive, because each correction states
`` `cases: N` ``.

### 4.4 Is the selftest over-engineered?

No. `check-selfassessment.mjs` went 13 → 17 (`--selftest` output, §0), and the four
new cases (`:496, :506, :516, :526`) are exactly the four arms the frozen
`failureCapable` names (stale / stale-then-corrected / wrong-number / ambiguous),
one each. `check-s106-evidence.mjs` has five cases, which is the frozen four plus
the killRule's missing-receipt arm.

The gap runs the other way: the *rule* is broader than the selftest. None of the
three false-clear paths I demonstrated (wrong citation, non-tally number, bullet
union) has a case. With T3 + T3b applied, the rule shrinks back to the tested
scope; without them, the selftest is failure-capable on the frozen claim but silent
on the shipped behaviour.

---

## 5. Trim table (concrete, ranked)

All line numbers at `master` (`5ed6484`). `P0`–`P3` are patched copies under my
scratch dir; "measured" below means I ran `--selftest` and
`--repo <lane> --rev master` for that copy.

| # | edit | lines | effect on real lane (measured) | risk |
|---|---|---|---|---|
| **T1** | delete `const TALLY_PATTERNS = [...]` | `check-selfassessment.mjs:121-126` (−6) | `P0_drop_dead_const.mjs`: selftest 17/17, finding set **identical** (114 non-m3 findings, set-equal by JSON), `mismatches` unchanged | none — no reader |
| **T3** | delete the generic-fraction arm in `statedTallyNumbers` | `:252` (−1) | `P1_drop_fraction.mjs`: `mismatches=1`, `cNE=92`, `log_superseded=6`, `log_stale_uncounted=0` — identical | none on real data; removes a proven false clear (date) |
| **T3b** | in `paragraphs()`, start a new unit on `/^(?:[-*+]|\d+\.)\s/` | `:256-265` (+1) | `P2_bullet_unit.mjs`: identical to tip | none on real data; removes cross-bullet union |
| **T2** | drop `` `cases: N` `` from the m1 header shape list | `:31` (−2 tokens) | doc only; fixture shows the shape is not detected on a claim line | none; aligns doc with frozen list and code |
| **T4** | extract `lineClaim` / `associate` shared by both m1 scans | `:184-244`, `:267-331` (≈ −50) | must be re-measured; 17 cases are the guard | medium — touches the SCORECARD window; keep its supersession untouched |
| **T6** | conditional on whether the lane keeps the two s106 strengthenings. **Keep-both branch (current direction):** add `dup-anchor` and `bytecount-plus1` cases (`+2` cases, ~20 lines) so `anchor_unique`/`byte_count_match` are failure-capable. **Trim branch:** `valid = shaMatch && anchorLocated && anchorUnique`, leaving `byte_count_match` as a reported diagnostic | `check-s106-evidence.mjs:127` (1 line) or selftest `CASES` | real receipt stays `valid=true` in both branches (§0) | low; shipping either conjunct with no case is the only silently bad option |
| **T5a** | delete `${out.reason ? ... }` | `check-s106-evidence.mjs:332` | none (never assigned) | none |
| **T5b** | one schema constant (`SCHEMA`), fixture uses it | `:46`, `:162` | none | none |

Sequencing: T1, T3, T3b, T2, T5a, T5b are independent and behaviour-verified; T6
is a small semantic decision; T4 is the only one that needs a full re-run of the
lane gates. T1+T3+T3b+T2+T5 = **−7 net lines** (T1 −6, T3 −1, T3b +1, T5b −1;
T2 and T5a delete tokens on existing lines), **net zero behavioural change on the
current bytes**.

---

## 6. Preserved contract (what I deliberately did **not** recommend touching)

- The frozen predicates themselves: association is line → single-script section →
  could-not-evaluate (both windows, unchanged by every trim above); the oracle is
  the gate binary, never a receipt; m2/m3 untouched (the round touched only the m1
  window plus one call site, `evaluate` `:395-400`).
- Fail-closed semantics: could-not-evaluate findings are not counted; a malformed
  fraction is a finding; an ambiguous section is not counted.
- Exit codes 0/1/2 and the stable finding id `m1-selftest-tally`.
- The frozen C2 report set: `present` stays, `sha_match`/`anchor_located` stay;
  `anchor_unique` stays (disclosed by the header prose and now by the working-tree
  formula); `byte_count_match` is demoted only under T6's trim branch — the lane's
  current direction is to keep and disclose it, which is fine once it has a case.
- **Observation for the C1 receipt, not a claim:** the counter's `mismatches` at
  `master` is currently 1 because of the m3 working-tree class
  (`git status --porcelain --untracked-files=all | wc -l` = 36→46 as w1/w2 scratch
  lands). The `mismatches=0` receipt has to be taken with a clean tree (or at a
  commit), exactly as the claim's `before` accounting already anticipates.

---

## 7. Observations outside trim scope (flags for the critic / L1)

1. **C2 marker conjunct is not implemented.** The gate passes bytes whose anchor
   line carries `FEATURE_DISABLED_BY_DEFAULT` (§2.2). The frozen predicate names
   the ENABLED marker; the code only compares against receipt text. Fixing this is
   an *addition*, not a trim — out of my recommendation scope, in scope for the
   C2 verifier.
2. **Supersession citation is vacuous** (`/:\d+/`, `:325`) and on real data `:221`
   is cleared by a 183-line block whose citation match is `127.0.0.1:18751`
   (`LOG.md:308`). Tightening it changes the C1 receipt, so it needs the L1's own
   correction bullet for `:221` first.
3. **`anchor_located` is stricter than the frozen wording** (full trimmed line
   equality vs "the anchor text … at the recorded line"). It is a strengthening
   that currently measures true; if the upstream line ever gains a suffix, the
   frozen predicate would pass and the gate would fail. Not a trim; a fidelity note.
4. **`paragraphs()` is a blank-line block, not a paragraph** — 183 lines in one
   unit on real data. T3b is the smallest fix that removes the union.

---

## 8. Tradeoffs / unknowns

- **T3b** narrows the unit the implementation calls a "paragraph" (`:256-265`,
  actually a blank-line block) toward the frozen claim's "correction line + cites
  the superseded line". It is behaviour-neutral on today's bytes; a future
  correction written as an indented continuation of a *different* bullet would stop
  clearing. Accepted: that is what the frozen conjunct asks for.
- **T6** is a fork, not a cut. Keep-both costs two selftest cases and makes the
  gate stronger than the frozen claim but fully failure-capable; the trim branch
  costs one line and makes `byte_count_match` advisory. Either is defensible; the
  state that is not defensible is a hard validity conjunct with no case, which is
  what `master` plus the in-flight comment edit would otherwise ship.
- **Unknown (not measured):** whether `TALLY_PATTERNS` has an intended caller in a
  *future* consolidated scan. Judged dead as shipped; if T4 is taken, the helper
  can adopt those four regexes as its single source and the deletion becomes a
  move rather than a loss.
- I did not re-measure the C1 baseline arm (`--rev 4ad4c77`); that is the C1
  verifier's counter, not mine. My tip-side statements are the ones above.

---

## 9. Tooling record

None installed or upgraded. Everything ran on the host `node` and `git` already in
use; fixtures are throwaway `mktemp -d` repos under
`.ufo/waves/round-27/scratch/SimplifyGateCode/` (lane scratch, per contract). No
pacman transaction attempted. No sibling seat or lane touched.

Report: .ufo/waves/round-27/w1/SimplifyGateCode.md
