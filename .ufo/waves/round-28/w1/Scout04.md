# Scout04 — S106 exact source citation/receipt: revision binding + m1 citation association

Seat: scout (read-only). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Baseline measured: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (lane HEAD at run start
and end; `git rev-parse HEAD` → `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`).

**Scope.** Independently inspect the S106 exact source citation and receipt, propose a
located quote for the round Gate, and report the located evidence that bears on frozen
claims C1 (S106 receipt revision binding) and C2 (m1 supersession citation association).
This seat did not repair production code. No tracked lane file was written; the only
bytes this seat wrote are its own report (this file) and scratch under
`.ufo/waves/round-28/scratch/Scout04/` (gitignored via `.gitignore:5`).

**Tooling.** No installs, no upgrades, no pacman transaction (PACMAN PAUSED honoured).
Tools used, all pre-existing: `node v24.21.0`, `git 2.56.0`, `Python 3.14.8`.
`git status --porcelain -uno` → empty (no tracked changes) for the whole run.

---

## 1. Headline findings

| # | Finding | Axis | Confidence |
|---|---|---|---|
| F1 | The shipped S106 receipt carries **no revision field at all**. `corpus/evidence/round-26/sources/s106.json` has 14 top-level keys and none is a revision/commit/measurement identifier. The frozen round-26 killRule requires one. | depth (C1) | observation |
| F2 | The S106 gate therefore cannot detect revision binding at all: a receipt naming a **foreign** `measured_revision` still validates `valid=true`. | depth (C1) | observation |
| F3 | Worse, the receipt is **self-certifying**: mutating the committed bytes *and* the receipt's own `decoded_sha256`/`anchor` coherently passes `valid=true`. The receipt is anchored to nothing external. | depth (C1) | observation |
| F4 | A receipt that records a **failed fetch** (`verification.exit=22`, `fetch_status=404`) still validates `valid=true`. The gate never reads `verification.exit`. | depth (C1) | observation |
| F5 | The m1 supersession matcher accepts **any** `:N` token in the paragraph as "cites the superseded line". `LOG.md:221` is cleared by two paragraphs, **neither of which cites `:221`**. | calibration (C2) | observation |
| F6 | Exactly **one** finding flips to a counted mismatch under strict exact-citation: `LOG.md:221` (claimed 8, observed 12). The other nine superseded findings are cited exactly and stay superseded. So the fix is narrow and does not manufacture mismatches. | calibration (C2) | observation + inference |
| F7 | `check-selfassessment.mjs`'s m3 class counts **live porcelain**, not `--rev` bytes, so the tip `mismatches=1` is not a stable number. The C2 target must be read as "the `LOG.md:221` finding appears in `counted`", not as a specific total. | calibration (C2) | observation |

---

## 2. C1 — S106 receipt revision binding

### 2.1 The receipt has no revision field (F1)

`corpus/evidence/round-26/sources/s106.json` top-level keys, read with
`python3 -c "import json; print(list(json.load(open(...)).keys()))"`:

```
['schema', 'row', 'url', 'fetched_at', 'transfer', 'encoded_bytes', 'encoded_sha256',
 'bytes_path', 'decoded_bytes', 'decoded_lines', 'decoded_sha256', 'anchor',
 'verification', 'status']
```

Sweep for any revision-ish key: `python3 -c "... print([k for k in d if 'rev' in k.lower() or 'commit' in k.lower() or 'measur' in k.lower()])"` → `[]`.
Sweep of the raw file: `grep -c "revision\|rev" corpus/evidence/round-26/sources/s106.json` → `0`.

**Located quote** (frozen requirement, `.ufo/waves/round-26/claims.json:49`, the C2
`killRule` string), 11 words:

> the receipt's recorded revision must equal the report's cited measurement revision

Round-27's own lesson already names the gap — `corpus/lessons/round-27.md:21`, 14 words:

> the S106 receipt has no revision field, so that inherited requirement is not proven

And the routed defect, `corpus/lessons/round-27-verifier-spotcheck.md:47`, 24 words:

> preserve inherited C2 fetch-failure and measurement-revision binding; put revision identity in receipt/evaluation and test it against the measured commit.

### 2.2 The gate cannot detect a revision mismatch (F2, F3, F4)

Fixture driver: `.ufo/waves/round-28/scratch/Scout04/run-s106-rev.sh`. Every fixture is
a `mktemp -d` repo; `git -C "$D" init -q`, `user.email`/`user.name` set, and
`[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ]` asserted **before the first
commit**; every git call names `-C "$D"`. The lane was never written.

Gate invocation: `node scripts/check-s106-evidence.mjs --repo <fixture> --rev <fixture-rev> --json`.

| case | what the fixture is | exit | verdict |
|---|---|---|---|
| A | receipt declares `measured_revision = 0000…0000` (a foreign revision), bytes untouched | **0** | `valid=true`, all four predicates true — **the foreign revision is not even looked at** |
| B | bytes mutated *and* receipt's `decoded_sha256`/`anchor.line` updated coherently | **0** | `valid=true`, `decoded_sha256_observed=64933dea4bc5be4b1a3b309a576be214e007a2c7d04e02845056771b72851a74` — **coherent forgery passes** |
| C | receipt present, bytes absent | 2 | `could-not-evaluate`, `decoded bytes absent at …` |
| D | bytes present, receipt absent | 2 | `could-not-evaluate`, `receipt absent at …` |
| E | receipt committed, then bytes mutated in a later commit; gate run at the later revision | 1 | `invalid`, `sha_match=false`, `byte_count_match=false` |

Case F (separate driver `.ufo/waves/round-28/scratch/Scout04/run-failed-fetch.sh`):
receipt with `verification.exit=22` and `fetch_status=404`, bytes untouched → exit **0**,
`valid=true`. The gate reads `url`, `fetched_at`, `transfer`, `bytes_path`,
`decoded_bytes`, `decoded_sha256`, `anchor` — it never reads `verification`, so a
recorded failed fetch is silently treated as valid evidence.

**Located quote** (gate source, `scripts/check-s106-evidence.mjs:125-131`),
`valid = sha_match && anchor_located && anchor_unique && byte_count_match` — no revision term.

**Baseline selftest:** `node scripts/check-s106-evidence.mjs --selftest` →
`S106_SELFTEST verdict=clean cases=5 passed=5`, exit 0. The five case ids are
`clean-fixture-valid`, `sha-mismatch-invalid`, `anchor-off-by-one-invalid`,
`missing-bytes-could-not-evaluate`, `missing-receipt-could-not-evaluate`. **No revision
case exists**, so the frozen before-arm "5 cases" is confirmed and the target "at least
7" needs **at least two new cases** (matching + mismatching revision).

**Baseline gate at the tip:** `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` →
`present=true sha_match=true anchor_located=true anchor_unique=true byte_count_match=true valid=true`, exit 0.
Same result at the receipt-introducing revision `0c666adc217685e1ece2af8596b732b303a3b15c`
(`git log --follow -- corpus/evidence/round-26/sources/s106.json` → single commit
`0c666ad`; `git merge-base --is-ancestor 0c666ad HEAD` → yes). The decoded bytes blob is
byte-identical at both revisions (`git show <rev>:…cc | sha256sum` →
`9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` at both).

### 2.3 A working revision-binding predicate (prototype, not production)

`.ufo/waves/round-28/scratch/Scout04/proto-rev-binding.mjs` implements the proposed
predicate and is **not** the production gate:

1. the receipt must carry a `measured_revision` that resolves to a commit;
2. the bytes at *that* revision must hash to the receipt's `decoded_sha256`;
3. the anchor/byte-count predicates are evaluated against the bytes **at the measured
   revision**, not at the revision under evaluation;
4. `git merge-base --is-ancestor <measured_revision> <rev>` must succeed.

Results (`node proto-rev-binding.mjs`):

```
CASE id=matching-revision-accepted                 valid=true   … measured_is_ancestor=true
CASE id=mismatching-revision-rejected             valid=false  … sha_match=false byte_count_match=false
CASE id=unbound-receipt-rejected                  valid=false  reason="receipt has no measured_revision binding"
CASE id=non-ancestor-measured-revision-rejected   valid=false  … measured_is_ancestor=false
CASE id=byte-identical-evidence-commit-accepted   valid=true   … measured_is_ancestor=true
```

The predicate discriminates: a matching revision is accepted, a mismatching revision is
rejected, an unbound receipt is rejected, and a measured revision that is not an
ancestor of the evaluated revision is rejected. Steps 2–4 mirror the lane's existing
`check-measurement-binding.mjs` discipline (`measuredRevision`, and the
`measured_revision_not_ancestor` reason at `scripts/check-measurement-binding.mjs:55,140,576`),
so the design is not new machinery.

**Binding value for the committed receipt.** The receipt and the decoded bytes both
landed in `0c666adc217685e1ece2af8596b732b303a3b15c` and the bytes are unchanged since
(`git log --follow -- corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc`
→ single commit `0c666ad`; byte hash identical at `0c666ad` and at tip). So
`measured_revision = 0c666adc217685e1ece2af8596b732b303a3b15c` is the correct binding for
the committed target receipt, and the gate at that revision already returns `valid=true`
today — so a correct binding is compatible with the "runtime gate at its committed target
receipt remains valid" target, and the matching-revision fixture is satisfiable with
real lane bytes.

**Constraint on the repair (inference).** The receipt file is committed at `0c666ad` and
cannot name its own commit from inside itself; the binding must therefore point at the
revision at which the **bytes** were measured and committed (`0c666ad`), which is what the
prototype's step-2 lookup reads. The receipt's own `verification` block carries a
`command`/`exit`/`result` triple that a `fetch-failure` arm can consume: the failed-fetch
case (F4) becomes decidable by refusing (exit 2) when `verification.exit != 0`.

---

## 3. C2 — m1 supersession citation association

### 3.1 The defect (F5)

`scripts/check-selfassessment.mjs:319-327` (`m1LogFindings`):

```js
f.superseded = paras.some((p) => {
  if (p.start <= f.line) return false;
  const text = p.lines.join("\n");
  const namesScript = [...text.matchAll(SCRIPT_IN_TEXT)].some((m) => m[1].replace(/^\.\//, "") === f.script);
  return namesScript &&
    /supersed|correct/i.test(text) &&
    /:\d+/.test(text) &&
    statedTallyNumbers(text).includes(f.observed);
});
```

Line 325 tests only that *some* colon-number exists in the paragraph; it never compares
that number to `f.line`. The SCORECARD window (`:231-241`) has the same shape at line
level (`/:\d+/.test(g.lineText || "")`).

### 3.2 Independent fixture reproduction

Driver: `.ufo/waves/round-28/scratch/Scout04/run-c2-supersession.sh`. Each fixture is a
`mktemp -d` repo with the toplevel asserted equal to the fixture dir before the first
commit; the throwaway oracle gate `scripts/check-fixture.mjs` prints
`FIXTURE_SELFTEST verdict=clean cases=13 passed=13`, so the stale claim is `12` and the
oracle-correct number is `13`. A minimal `SCORECARD.md` is included (the gate refuses
without one: `SCORECESSMENT verdict=could-not-evaluate detail=SCORECARD.md absent at …`).

| case | correction paragraph | expected | observed today |
|---|---|---|---|
| `C2-red-wrong-citation` | cites `:99` (stale tally at `:3`) | mismatch retained | **exit 0, mismatches=0, superseded=1 — false clear** |
| `C2-red-wrong-citation-2` | cites `:99` (stale tally at `:3`) | mismatch retained | **exit 0, mismatches=0, superseded=1 — false clear** |
| `C2-red-no-citation` | only a clock time `05:16:28Z` | mismatch retained | **exit 0, mismatches=0, superseded=1 — false clear** |
| `C2-red-wrong-number` | cites `:3` exactly but states `cases: 12` | mismatch retained | exit 1, mismatches=1, superseded=0 — **correct** |
| `C2-green-exact-citation` | cites `:3` exactly and states `cases: 13` | superseded | exit 0, mismatches=0, superseded=1 — **correct** |
| `C2-green-no-stale` | no stale tally | clean | exit 0, mismatches=0, superseded=0 — **correct** |
| `C2-scorecard-wrong-citation` | SCORECARD line cites `:99` (stale at `:5`) | mismatch retained | **exit 0, mismatches=0, superseded=1 — false clear** |
| `C2-scorecard-exact-citation` | SCORECARD line cites `:5` exactly | superseded | exit 0, mismatches=0, superseded=1 — **correct** |

Two independent false-clear mechanisms are reproduced: a **wrong line citation** and a
**timestamp colon-number with no line citation at all**. The SCORECARD window has the
same defect at line granularity.

### 3.3 The live false-clear at LOG.md:221

Baseline measurement:
`node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json`
→ `mismatches=1`, `clean=false`, `superseded=10`, `couldNotEvaluate=92`.
The single counted finding is `{"class":"m3-unlanded-paths","doc":"SCORECARD.md","line":null,"claimed":"landed","observed":17}`.

The `LOG.md:221` finding itself is present in `findings` as:
`line=221, script=scripts/check-freshness.mjs, claimed=8, observed=12, superseded=true`,
`lineText = "  exit 0. \`--self-test\` → \`FRESHNESS_SELFTEST verdict=clean cases=8\`,"`.

**Located quote**, `LOG.md:221` (baseline blob), 11 words:

> exit 0. `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`,

Two paragraphs clear it, and neither cites `:221` (computed with a faithful Python
re-implementation of the shipped predicate over `git show
eb23c0b84668afc48ebab8bd7e4a8a4457407cc4:LOG.md`, 1961 lines):

| clearing paragraph | length | colon-numbers it contains | cites `:221`? |
|---|---|---|---|
| `LOG.md:265-447` | 183 lines | `16`, `28`, `18751` | **no** |
| `LOG.md:1904-1925` | 22 lines | `335`, `391`, `1090`, `1103`, `1863` | **no** |

The first is the round-1 fleet paragraph whose only colon-numbers are a clock time
(`05:16:28Z` → `:16`, `:28`) and a loopback port (`127.0.0.1:18751` → `:18751`). The
second is the round-27 correction-bullet block, which cites five *other* lines.

Sweep of the baseline LOG.md for any citation of `:221`:
`python3` over the baseline blob → `':221'` occurs at exactly **one** line, `LOG.md:1931`,
inside the "C1 counter falsification" note:

> `LOG.md:221` stale selftest mention superseded by a later 183-line paragraph

That note paragraph (`LOG.md:1929-1938`) names no `scripts/check-freshness.mjs`, does not
state the number 12, and therefore does **not** clear the finding — it is evidence of the
defect, not a correction. So there is currently **no** exact citation of `:221` anywhere
in the baseline LOG.md, and the false-clear is not defensible under the frozen rule.

### 3.4 Blast radius of the strict fix (F6)

Applying strict exact-citation (the cited colon-number must equal `f.line`) to every
currently-superseded finding in both windows:

```
FLIP to counted mismatch:
   LOG.md:221  scripts/check-freshness.mjs  claimed=8  observed=12

RETAINED as superseded (cited exactly):
   SCORECARD.md:410, :1138, :1139, :1151
   LOG.md:335, :391, :1090, :1103, :1664
```

**Exactly one finding flips.** The four SCORECARD supersessions are cited exactly
(`SCORECARD.md:1192` cites `:410`; `SCORECARD.md:1193` cites `:1138`, `:1139`, `:1151`),
and the five retained LOG supersessions are cited exactly in the `LOG.md:1904-1925`
bullet block (`:335`, `:391`, `:1090`, `:1103`) and in the `1845-1864` paragraph (`:1664`).
Projected tip count: `1 + 1 = 2` counted mismatches (m3 + the `LOG.md:221` m1 finding).

**Inference (not yet executed on a repaired gate):** the C2 target "LOG.md:221 appears
as a mismatch unless an exact-line correction cites it" is reachable by the exact-citation
change alone, with no collateral mismatches from the nine other supersessions. This is
computed from a re-implementation of the shipped predicate, not from a repaired script;
a repair must confirm it.

### 3.5 The counter's tip number is not stable (F7)

`m3-unlanded-paths` reads live porcelain (`git status --porcelain` at run time), not
`--rev` bytes. During this run the untracked count was 54
(`git status --porcelain -uall | wc -l` → 54) while the counter reported `observed=17`.
So the tip `mismatches` integer is tree-dependent and must not be quoted as a stable
target. The stable, checkable C2 artifact is the *presence of the `LOG.md:221` finding in
the `counted` array*, plus the selftest case set.

### 3.6 Selftest case surface today

`scripts/check-selfassessment.mjs` header (`--selftest` (17 isolated cases …)); the m1
selftest case ids include `m1-stale-tally`, `m1-correct-tally`, `m1-stale-then-superseded`,
`m1-case-phrase-stale`, `m1-ambiguous-association-is-not-counted`, `m1-no-tally-is-not-a-mismatch`,
`m1-log-stale-tally`, `m1-log-stale-then-corrected`, `m1-log-wrong-number-correction`,
`m1-log-ambiguous-section-not-counted`. The frozen C2 target asks for a **red
unrelated-citation case** and a **positive exact-citation control**; the existing
`m1-log-stale-then-corrected` fixture (`check-selfassessment.mjs:512`) cites
`LOG.md:6` while its stale tally sits at a different line, so under a strict reading that
existing case is itself a *wrong-citation* fixture and must be re-pointed or a new
distinct case added rather than relabelled. **[INFERENCE]** — not executed against a
repaired gate.

---

## 4. Proposed located quote for the round Gate

The Gate needs a quote that is (a) ≤25 words, (b) located, (c) verifiable from committed
bytes at the baseline. The S106 anchor satisfies all three and is already the receipt's
recorded anchor.

**Primary quote** — `corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc:187`
(committed blob at `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`), 2 words:

> BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);

Located and unique: `git show eb23c0b…:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc | grep -n "BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);"` → `187:` only;
the anchored whole-line occurrence count is `grep -c "^BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);$"` → `1`.

**Supporting quote** — same file, line 186, 5 words:

> // Enable using the BackForwardCache.

The two lines together are the registry row's cited span. `corpus/SOURCES.md:120` field 7
states the citation as "decoded text lines 186-187 carry `BASE_FEATURE(kBackForwardCache,
base::FEATURE_ENABLED_BY_DEFAULT)` with the comment `// Enable using the BackForwardCache.`" —
that registry span matches the committed bytes exactly.

**Proposed Gate wording** (the defect claim, not the source claim):

> The S106 receipt records no measurement revision; the gate validates at any revision,
> so a foreign `measured_revision` and a coherent bytes-plus-receipt forgery both pass.

Evidence pointer: `scripts/check-s106-evidence.mjs:125-131` (the `valid` conjunction has
no revision term) and `corpus/evidence/round-26/sources/s106.json` (no revision key).

**Companion Gate wording** (C2):

> `LOG.md:221` is marked superseded by a paragraph that cites `:16`, `:28` and `:18751`,
> never `:221`; the citation arm tests only that some colon-number exists.

Evidence pointer: `scripts/check-selfassessment.mjs:325` (`/:\d+/.test(text)`) and
`LOG.md:265-447`.

---

## 5. Reproduction commands

All commands run from `/home/vgpnk/Projects/shokunin/tabi-shokunin`; all read-only except
the scratch fixtures under `.ufo/waves/round-28/scratch/Scout04/`.

```bash
# C1 baselines
node scripts/check-s106-evidence.mjs --selftest
node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
python3 -c "import json;d=json.load(open('corpus/evidence/round-26/sources/s106.json'));print(list(d.keys()))"
git log --follow --oneline -- corpus/evidence/round-26/sources/s106.json

# C1 fixtures (mktemp repos; toplevel asserted before first commit)
bash .ufo/waves/round-28/scratch/Scout04/run-s106-rev.sh
bash .ufo/waves/round-28/scratch/Scout04/run-failed-fetch.sh
node .ufo/waves/round-28/scratch/Scout04/proto-rev-binding.mjs

# C2 baseline + fixtures
node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
bash .ufo/waves/round-28/scratch/Scout04/run-c2-supersession.sh

# S106 quote location
git show eb23c0b84668afc48ebab8bd7e4a8a4457407cc4:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc | sed -n '186,187p'
git show eb23c0b84668afc48ebab8bd7e4a8a4457407cc4:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc | grep -c "^BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);$"
```

---

## 6. Observation / inference / unknown

**Observation** (directly measured, command and output above): F1–F5, F7; the S106 quote
location and uniqueness; the baseline selftest count of 5; the baseline gate `valid=true`
at tip and at `0c666ad`; the exact set of paragraphs clearing `LOG.md:221` and their
colon-numbers; the fixture matrix; the prototype's five verdicts.

**Inference** (computed from a faithful re-implementation of the shipped predicate, not
from a repaired script): F6 — that strict exact-citation flips exactly one finding and
leaves nine superseded findings intact; that the C2 target is reachable without
collateral mismatches; that `m1-log-stale-then-corrected` will need re-pointing.

**Unknown / requires the repair to settle**: whether a strict citation matcher breaks any
of the nine retained supersessions in a way a re-implementation does not predict (the
`statedTallyNumbers` over-bread at `:246-254` and the `paragraphs()` blank-line unit at
`:256-265` interact with the citation arm and were not jointly re-derived); whether the
`m1-log-stale-then-corrected` selftest case still passes under the strict arm; the exact
new selftest case count the C1 repair will land (target ≥7 from a base of 5).

**Not in scope for this seat, not verified here**: any production-code repair; any
change to `scripts/check-s106-evidence.mjs` or `scripts/check-selfassessment.mjs`; any
real-site interaction, network fetch, credential or session material (none performed);
any modification of lane tracked files, the fleet repo, sibling repos, or shokuknow.

---

## 7. Prior independent defect evidence addressed

`corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47` — independently re-measured
at baseline `eb23c0b…` rather than at the cited `ef8aa4a…`:

- **:15 (C1 false clear of `LOG.md:221`)** — **reproduced.** The finding is present at
  baseline with `superseded=true` and no paragraph cites `:221`. The two clearing
  paragraphs and their colon-numbers are named above.
- **:16 (C2 revision binding absent)** — **reproduced and sharpened.** The verifier said
  the binding "is absent from the round-27 claim/receipt"; independently confirmed the
  receipt has no revision key at all, and additionally found that the gate ignores a
  foreign `measured_revision` (case A), accepts a coherent bytes-plus-receipt forgery
  (case B), and accepts a receipt recording a failed fetch (case F).
- **:17 (C3 coverage)** — outside this seat's scope; not re-measured.
- **:46** — "repair C1's supersession matcher so it enforces citation to the superseded
  line". Confirmed as the precise defect, with the narrow blast radius quantified (F6).
- **:47** — "preserve inherited C2 fetch-failure and measurement-revision binding; put
  revision identity in receipt/evaluation and test it against the measured commit."
  Confirmed as the precise C1 defect; §2.3 shows a predicate that satisfies it and
  discriminates all five required verdicts.

---

## 8. Report path

`.ufo/waves/round-28/w1/Scout04.md`
(absolute: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/w1/Scout04.md`)
