# Scout01 — independent source & prior-lesson provenance check for round-28 C1/C2

Seat: Scout01 (item 61). Role: scout — provenance only, no production repair.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`
(HEAD is detached at that commit; `git rev-parse HEAD` → `eb23c0b…`, `git status --porcelain` shows only
untracked `.ufo/waves/round-28/`, `git diff --stat` empty → no tracked change made by me).

Frozen claims read: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`
(untracked file; mtime `2026-10-25 15:57:11`; `.ufo/waves/round-28/w1.ready` mtime `15:58:01`;
earliest wave report `15:59:42` → freeze ordering by mtime is before dispatch and before any wave
output. The freeze is *not* a git object — `git log -- .ufo/waves/round-28/claims.json` is empty).

Tooling: none installed, no upgrades, no pacman transaction (PACMAN PAUSED). Versions in use:
`node v24.21.0`, `git 2.56.0`.

---

## 1. Provenance chain for C1 (depth — S106 receipt revision binding)

### 1.1 The inherited clause exists and was dropped, then re-admitted — chain verified

| Stage | Location | Text present |
|---|---|---|
| Original frozen | `.ufo/waves/round-26/claims.json:49` (claim C2 killRule) | revision-binding + fetch-failure sentences present |
| Re-dispatch | `.ufo/waves/round-27/claims.json:45` (claim C2 killRule) | both sentences **absent**, replaced by a naive-control note |
| Drift disclosed | `LOG.md:1951-1957` | "C2 drops inherited fetch-failure and measurement-revision binding requirements" |
| Lesson | `corpus/lessons/round-27.md:21` | "the S106 receipt has no revision field, so that inherited requirement is not proven" |
| Scorecard | `SCORECARD.md:1398` | "round-27 claim text dropped inherited fetch-failure and revision-binding clauses" |
| Independent review | `.ufo/waves/round-27/w1/RevC2Gate.md:17-18` (L1) | "the receipt has no revision field … either enforce an optional `measured_revision` receipt field or record that binding is by same-tree reads" |
| Verifier | `corpus/lessons/round-27-verifier-spotcheck.md:16,47` | C2 depth "**Unprovable**"; routed: "put revision identity in receipt/evaluation and test it against the measured commit" |
| Round-28 | `.ufo/waves/round-28/claims.json:11` (C1) | re-admits it as a fresh claim (notes: "round-27 verifier defects are the motivating evidence, not frozen round-27 claims") |

**Provenance verdict: sound.** Round-28 C1 is a legitimate re-admission of a clause that was frozen in
round 26, dropped in round 27, and independently routed back. It is not a new, unbacked requirement.

### 1.2 The gap is real and measurable

`git show eb23c0b84668afc48ebab8bd7e4a8a4457407cc4:corpus/evidence/round-26/sources/s106.json` keys:
`anchor, bytes_path, decoded_bytes, decoded_lines, decoded_sha256, encoded_bytes, encoded_sha256,
fetched_at, row, schema, status, transfer, url, verification` — **no rev-like key** (recomputed by
parsing the blob, not by grep alone). Matches `RevC2Gate.md:18` exactly.

Baseline measurements (all re-run at baseline `eb23c0b…`):

```
node scripts/check-s106-evidence.mjs --selftest
  → S106_SELFTEST verdict=clean cases=5 passed=5      (5 CASE lines, all PASS)
node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
  → valid=true sha_match=true anchor_located=true anchor_unique=true byte_count_match=true
git show eb23c0b…:scripts/check-s106-evidence.mjs | sha256sum  ==  sha256sum scripts/check-s106-evidence.mjs
  → ef12a6fbe27068bf6d1171910dd54d9ccedef51e9e075c902005bc49a955e91d (both) ⇒ the baseline blob IS the worktree copy
```

So the frozen "before" (`5 cases at baseline eb23c0b…`) is **confirmed**, and the target receipt is
currently `valid=true` at baseline.

The gate's committed evidence is fully self-contained offline (no network needed to re-derive):
`base64 -d .ufo/waves/round-26/s106-encoded.bin` (98604 B, sha256 `f17347b2…` = receipt
`encoded_sha256`) reproduces 73952 B with sha256 `9b93fe64…` = receipt `decoded_sha256`, anchor
`BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);` at line 187, occurrences 1.
The bytes blob is byte-identical at `0c666ad…` and at baseline (`9b93fe64…` both).

### 1.3 Two forks the executor must resolve (reporting, not deciding)

**Fork A — which file becomes the revision-bearing receipt.** The committed round-26 receipt carries
`"status": "… this receipt is evidence-of-record, not a claim receipt."` (line 25). Round-28 C1's
target ("correct revision-valid target receipt", "the gate must verify the committed receipt at that
revision") therefore requires *turning an evidence-of-record receipt into a claim-bearing one*.
Two shapes, both compatible with the frozen text:

- **(A1) amend the round-26 receipt in place** — add e.g. `measured_revision`. Cost: the receipt blob
  changes (currently `f13e55ba3bb7c0bcee7d9721c3f844c635f01db6fc5e68b688b8e46d59a47402`, identical at
  `0c666ad…` and baseline). No lane gate hashes the receipt file itself (sweep: `grep -rn "s106" scripts/*.mjs`
  shows only `scripts/check-s106-evidence.mjs`; `check-gate-registry.mjs` pins the *path*, not a digest),
  and the registry row `SKILL.md:2514` pins the path, so the registry gate would still pass — but this
  rewrites committed round-26 evidence, against the lane's additions-only norm (`SKILL.md:10`
  "Errata append-only").
- **(A2) add a new round-28 receipt** (e.g. `corpus/evidence/round-28/sources/…`) and let the gate
  prefer it, leaving round-26 bytes untouched. Requires changing `RECEIPT_PATH`
  (`scripts/check-s106-evidence.mjs:45`) to a resolution rule. No round-28 evidence directory exists at
  baseline (`git ls-tree -r eb23c0b… -- corpus/evidence/round-28` → empty).

**Fork B — self-reference.** A receipt cannot record its own commit id. The recorded revision must
therefore be either (i) the revision at which the *bytes* were introduced — `0c666adc217685e1ece2af8596b732b303a3b15c`
(the commit that added both `s106.json` and the `.cc`), verifiable because the bytes at that rev hash
to `9b93fe64…` — or (ii) the report's cited measurement revision, which is not a property of the
committed receipt at all. "The gate must verify the committed receipt at that revision" is only
satisfiable under reading (i) with an explicit definition of *what* is verified at that revision.
Recommend the executor state the verified predicate explicitly (bytes-present-at-R and hash-match-at-R
is checkable today; receipt-self-identity is not).

### 1.4 One wording hazard in C1's own text

C1 declared text: "Preserve fetch-failure as could-not-evaluate." The inherited sentence it points at
is a **build-time** condition, not a runtime gate verdict — round-26 killRule (line 49) reads
"Fetch failure at evidence-build time (non-200, undecodable base64) -> the claim is blocked honestly,
never satisfied from memory", and the round-27 reviewer already ruled on scope: "Fetch-failure honesty
(r26 kill rule sentence 2) is out of gate scope by design: the gate never fetches"
(`.ufo/waves/round-27/w1/RevC2Gate.md:49`). The gate's own header states it "never fetches"
(`scripts/check-s106-evidence.mjs:12-16`). The only gate-side "missing source → could-not-evaluate"
behaviour that exists and is testable offline is the exit-2 path already present (`missing-receipt` /
`missing-bytes` CNE cases). **Reading C1 as requiring a live fetch would violate both the gate's
declared no-fetch scope and the round's "no real-site interaction" contract.** The safe reading —
"source bytes or receipt absent at the measured revision ⇒ exit 2, never valid" — is already satisfied
and must be *retained* through the change. Flagging so no seat adds a network path.

### 1.5 Documentation drift to expect (not a gate failure)

If the selftest count rises 5 → ≥7, the prose counters `SKILL.md:2514` ("cases=5, passed=5"),
`corpus/QUALITY.md:366` ("`scripts/check-s106-evidence.mjs` cases=5") and `corpus/README.md:614`
become stale. Verified: `scripts/check-gate-registry.mjs` does **not** compare selftest counts — it
checks field presence/spelling only (`FIELDS`, `missing-selftest`, `selftest-flag-typo` cases). So
`node scripts/check-gate-registry.mjs --rev eb23c0b…` → `verdict=clean rows=27 gates=17
nonconformant=0` and will stay clean with stale prose. Append-only update expected, not a blocker.

---

## 2. Provenance chain for C2 (calibration — selfassessment m1 citation)

### 2.1 The frozen wording is older than the round-27 defect and the defect is exactly a widened reading

- `.ufo/waves/round-26/claims.json` C1 declared: a correction must "carry a correction marker and
  **cite the superseded line**"; C1 control: "point it at the wrong line … the extended counter must
  re-report the finding", and "a correction line that states the wrong oracle number **or lacks the
  line citation** must NOT supersede".
- `.ufo/waves/round-27/claims.json` C1 declared repeats "cites the superseded line".
- Shipped implementation, `scripts/check-selfassessment.mjs:319-327` (LOG window):

```js
f.superseded = paras.some((p) => {
  …
  return namesScript &&
    /supersed|correct/i.test(text) &&
    /:\d+/.test(text) &&                     // ← any colon-number, never equality with f.line
    statedTallyNumbers(text).includes(f.observed);
});
```

The `/:\d+/` test is the widening: it accepts *any* colon-number token in the blank-line paragraph.
`corpus/lessons/round-27-verifier-spotcheck.md:15` and `:46` record the false clear and route the
repair; `corpus/lessons/round-27.md:20` records "the apparent zero is unsound".
**Provenance verdict: sound** — round-28 C2 re-admits the round-26 wording that the shipped code
violates.

### 2.2 Independent re-derivation of the false clear (no reliance on round-27 text)

I re-implemented the shipped predicate faithfully (same `SCRIPT_IN_TEXT`, same
`statedTallyNumbers`, same blank-line paragraph split) over the baseline `LOG.md` and enumerated, for
each stale finding, which paragraphs clear it and whether the paragraph cites that exact line:

| stale finding | clearing paragraphs (shipped predicate) | cites that exact line? | under exact-citation rule |
|---|---|---|---|
| `LOG.md:221` (claimed 8, observed 12) | para @265, para @1904 | **no** (`265` cites `:16 :28 :18751`; `1904` cites `:335 :391 :1090 :1103 :1863`) | **stays a mismatch** |
| `LOG.md:335`, `:391` | para @1904 | yes (`:335`, `:391`) | stays superseded |
| `LOG.md:1090`, `:1103` | para @1904 | yes | stays superseded |
| `LOG.md:1664` | para @1845 | yes (`:1664`) | stays superseded |

The para @265 is the round-1 post-commit bullet block (183 lines) whose only colon-numbers are a
timestamp, a port and a loopback port — exactly the shape the round-27 critic described. The
round-27 falsification paragraph `LOG.md:1929-1938` names `LOG.md:221` and carries "superseded", but it
names **no** `scripts/*.mjs` and states **no** tally number, so it does not clear `:221` under either
predicate (verified: `scripts found` = ∅, tally numbers = ∅ for that paragraph).

### 2.3 Executable proof of the defect and of a minimal, non-regressing fix (scratch only)

Scratch copies (untracked, under `.ufo/waves/round-28/scratch/Scout01/`), **not** lane production files:
`sa-strict.mjs` (LOG branch only) sha256 `68efb4df…`, `sa-strict2.mjs` (both m1 branches) sha256
`b0b41070…`. Both differ from production only by replacing the `/:\d+/` test with an exact
`cited.has(f.line)` / `=== f.line` test.

Fixture evidence (temporary git repos under scratch, committed with `git -C`, deleted afterwards):

| fixture | production `scripts/check-selfassessment.mjs` | exact-citation variant |
|---|---|---|
| correction cites the **right** line `:6`, states oracle number | clean (correct) | clean (correct) |
| correction cites an **unrelated** line `:9`, states oracle number | **clean / superseded** ← false clear | **mismatch** ← red control works |
| correction cites `:6` but states only an ambient fraction `13/16` | clean / superseded | clean / superseded (still cleared — see §2.5) |
| SCORECARD-branch: correction cites unrelated `:99` | **clean / superseded** ← same defect in the other m1 branch | mismatch (only with `sa-strict2`) |
| `--selftest` of both variants | — | `cases=17 passed=17` (no existing case regresses) |

Production at baseline `eb23c0b…`:

```
node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
  → mismatches=1 clean=false superseded=10 couldNotEvaluate=92
     findings: LOG.md 221 claimed 8 observed 12 superseded=true      ← the false clear (NOT counted)
               counted = [ {class: m3-unlanded-paths, doc: SCORECARD.md, observed: 12} ]
exact-citation variant (sa-strict.mjs) at the same rev:
  → mismatches=2 superseded=9
     counted = [ {class: m1-selftest-tally, doc: LOG.md, line: 221, claimed: 8, observed: 12},
                 {class: m3-unlanded-paths, doc: SCORECARD.md, observed: 12} ]
```

**The minimal fix reaches C2's stated after-state exactly**: `LOG.md:221` becomes a counted mismatch,
the four legitimate LOG corrections (`:335 :391 :1090 :1103`) and `:1664` stay superseded, and the
17 existing selftest cases still pass. It also **does not regress** the corrections — contrary to the
round-27 critic's worry that "under a line unit none of the six eligible findings clears"
(`.ufo/waves/round-27/w1/CritC1Supersession.md:27`): that worry is about switching the *unit*
(paragraph → line); tightening *citation equality* while keeping the paragraph unit is sufficient and
safe. Flag this to any critic re-testing that line.

### 2.4 Measurement caveat the C2 counter/claim must not paper over

C2's counting command is `node scripts/check-selfassessment.mjs --rev <REV> --json` and its
"after" text is "self-assessment mismatch count at tip is nonzero for the known LOG.md:221 false-clear".
Two traps, both measured:

1. **The aggregate `mismatches` number is not a function of the revision.** Class `m3` reads the **live**
   worktree, not the rev (`scripts/check-selfassessment.mjs:379-388`: `git status --porcelain
   --untracked-files=all` on the repo, then `observed: paths.length`). Baseline run 1 observed 12
   untracked paths, later runs observed 66 — because the wave itself keeps adding files under
   `.ufo/waves/round-28/`. The round-27 spot-check recorded `mismatches=0, clean=true` at `ef8aa4a…`
   (`corpus/lessons/round-27-verifier-spotcheck.md:15`) because the tree was clean then; the same
   command on the same rev today returns `mismatches=1`. Verified: `corpus/lessons/round-27.md:20`
   already flags "m3 also reads live porcelain rather than the pinned --rev".
   ⇒ **At baseline the tip's nonzero mismatch count comes from `m3-unlanded-paths`, not from `:221`.**
   A verification that only reads `mismatches != 0` would "pass" before the fix and prove nothing.
   The discriminating evidence is the *finding entry*: `doc=LOG.md, line=221, claimed=8, observed=12,
   superseded=false`, present in `counted`.
2. **Ambient-fraction false clear survives citation tightening.** `statedTallyNumbers`
   (`scripts/check-selfassessment.mjs:246-254`) harvests any bare `N/N` pair (line 252), so a
   correction that cites the right line but states only "ambient ratio 13/16" still clears the stale
   tally — under production *and* under both of my exact-citation variants (fixture row 3 in §2.3).
   The round-27 routed defect explicitly names "ambient-fraction false clears"
   (`corpus/lessons/round-27-verifier-spotcheck.md:46`); the round-28 C2 frozen `failureCapable` does
   **not** (it requires only "a correction citing another line must retain mismatch; exact citation
   fixture must supersede"). ⇒ Within the frozen scope, the ambient-fraction arm is **out of the
   required target**; it should be *recorded*, not silently treated as a failed claim. Anyone reading
   round-27's routed list as the round-28 target would over-scope the change.

### 2.5 Scope ambiguity inside C2 itself (open question for the owner, not a defect)

There are **two** m1 supersession implementations with the same loose `:\d+` shape:
the LOG branch (`:319-327`, paragraph unit) and the SCORECARD branch (`:233-241`, per-finding unit,
`/:\d+/.test(g.lineText)`). I reproduced the false clear in the SCORECARD branch too (fixture row 4).
The frozen C2 target names `LOG.md:221` and its kill rule is scoped to `LOG.md:221` ("If any unrelated
correction still clears LOG.md:221, claim misses"). A fix touching only the LOG branch satisfies the
frozen kill rule while leaving the identically-shaped SCORECARD branch loose — which is the same defect
class the round-27 reviewer wrote about. The frozen claim text does not say which branch is in scope.
**Recommendation (inference, for the owner/executor):** tighten both (the `sa-strict2` variant shows
both can be tightened with no selftest regression and no new false clear), and state explicitly in the
report that the SCORECARD branch was included and why.

---

## 3. Prior-lesson citation audit (the evidence the goal points at)

Goal cites `corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`. Line numbers verified exactly:

- `:15` — C1 calibration re-check: counter returned `mismatches=0, clean=true, superseded=10` while its
  own finding at `LOG.md:221` says claimed 8, observed 12, `superseded=true`; "**Claim failed;
  calibration harmed**".
- `:16` — C2 depth: `valid=true` at `ef8aa4a…`; "Frozen inherited measurement-revision binding and
  fetch-failure requirements are absent from the round-27 claim/receipt … **Unprovable**".
- `:17` — C3 coverage (not in scope this round; the round-28 `notClaimed` excludes coverage/source
  admission).
- `:46` — routed: "repair C1's supersession matcher so it enforces citation to the superseded line …
  add committed regression coverage for unrelated paragraph/citation and ambient-fraction false clears".
- `:47` — routed: "preserve inherited C2 fetch-failure and measurement-revision binding; put revision
  identity in receipt/evaluation and test it against the measured commit".

All five lines exist and say what the round-28 claim says they say. The `notClaimed` list in
`.ufo/waves/round-28/claims.json:14` is also honoured by the lane state: "considerthese directory absent
at baseline" — verified: `git ls-tree -r eb23c0b… | grep -ci considerthese` → 0, and no filesystem hit
under the lane.

---

## 4. Bottom line for the two claims

| | C1 (depth) | C2 (calibration) |
|---|---|---|
| Provenance | **Sound** — re-admits round-26 killRule (`.ufo/waves/round-26/claims.json:49`), dropped in round-27, routed by independent verifier | **Sound** — re-admits round-26/27 "cites the superseded line" wording the shipped code widens at `:325` |
| Gap measurable? | Yes — receipt has no rev-like key (blob key list); baseline selftest 5/5, gate `valid=true` | Yes — baseline `LOG.md:221` reported `superseded=true` and absent from `counted`; exact-citation variant makes it a counted mismatch |
| Frozen "before" accurate? | Yes (5 cases at baseline) | Yes for the false clear; **but** the tip's aggregate `mismatches=1` is `m3`-caused, not `:221`-caused — verify via the finding entry, not the count |
| Fix feasibility demonstrated? | Not fully — requires choosing receipt file + defining what is verified at the recorded revision (self-reference) | **Yes** — minimal patch shown; reaches the stated after-state; 17/17 selftest still green; no legitimate correction regresses |
| Open scope/definition items | (a) amend round-26 receipt vs add round-28 receipt; (b) what "verified at that revision" means; (c) do **not** read "fetch-failure" as a live fetch | (a) LOG branch only vs both m1 branches; (b) ambient-fraction arm is outside the frozen target — record, don't treat as claim failure; (c) counter must not be read via aggregate `mismatches` |

---

## 5. Commands run (reproduction)

```bash
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
git rev-parse HEAD; git status --porcelain; git diff --stat
node scripts/check-s106-evidence.mjs --selftest
node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
git show eb23c0b…:scripts/check-s106-evidence.mjs | sha256sum; sha256sum scripts/check-s106-evidence.mjs
git show eb23c0b…:corpus/evidence/round-26/sources/s106.json   # key list: no rev-like key
base64 -d .ufo/waves/round-26/s106-encoded.bin | sha256sum       # 9b93fe64… = receipt decoded_sha256
node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
node scripts/check-selfassessment.mjs --selftest                # cases=17 passed=17
node scripts/check-gate-registry.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4
bash ../scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi   # tabi ok, 16 W04
git ls-tree -r --name-only eb23c0b… -- corpus/evidence/round-28   # empty
git ls-tree -r --name-only eb23c0b… | grep -ci considerthese      # 0
```

Scratch artefacts left in place (untracked, scratch only): `.ufo/waves/round-28/scratch/Scout01/sa-strict.mjs`,
`sa-strict2.mjs`. No lane tracked file was modified; no fixture repo remains under the lane.

## 6. Confidence

- C1 provenance chain, receipt key list, baseline counts: **high** (recomputed from blobs at baseline).
- C1 forks A/B and the "fetch-failure" hazard: **high** as statements of fact (fork existence, scope
  statements); the *choice* between A1/A2 is an owner decision — **inference offered, not made**.
- C2 defect mechanism, paragraph/citation enumeration, minimal fix and non-regression: **high**
  (independent re-implementation + executed variants + fixtures).
- C2 scope ambiguity (which m1 branch) and the ambient-fraction arm: **medium-high** — the defect is
  measured; the *in-scope* reading is a judgment about the frozen text.

No external fetches, no credentials, no consequential actions, no pacman transaction.
