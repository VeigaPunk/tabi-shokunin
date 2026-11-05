# R68Review2 — Attack of C2 registry gate (calibration axis)

Reviewer seat, tabi round 68 w1. Judged on: calibration. All probes run pre-freeze against
`tabi-shokunin/scripts/check-instrument-registry-r68.mjs` at lane base `1746c53de7d56e8aeaf420a68b5b95e6af96adf8`
(producer sha256 gate `25cdc6c3c13fb73c12712d3fad8fce279d50fe5563ad077308eb369c4ffd0e17`).
Scratch `/fast/scratch/hyaku/tabi-r68/R68Review2/` — to be deleted at yield; artifacts persisted to
`.ufo/waves/round-68/w1/R68Review2/`. Nothing in production or sibling paths was written.

## Axes named

- **calibration** (my seat axis): registry gate is one of this round's C2 candidates. A
  calibration claim must "count mismatches between the lane's self-assessment (SCORECARD/SHONEN)
  and observed repo state" (`tabi-round-68.md:552-553`). Attack question: can the gate be made
  to pass without the SKILL.md registry section actually existing / being accurate?
- **adjacency / coverage / depth / operability / freshness**: unchanged by this seat; probes
  don't move those.

## Baseline state (ground truth, non-author evidence)

- `git -C tabi-shokunin rev-parse HEAD` → `1746c53de7d56e8aeaf420a68b5b95e6af96adf8`; working tree
  SKILL.md sha256 `0d7fa30bb6b1e72d3acfe3f63f0f464d3f24198bd84e0fa111ba1e7c9f59a76c`, identical to
  `git show HEAD:SKILL.md` (clean commit payload, untracked only the two new gate scripts).
- **Production CLI green vs current committed SKILL.md: rc=1**,
  findings = `registry-section-missing: ## Instrument registry — round 68`.
  The lane has **no** r68 registry section yet (SKILL.md has r62 instrument registry at line 3028
  and r64 domain table at 3082 but no `## Instrument registry — round 68`). rc=1 is the
  "do-nothing" verdict for the gate as committed. Receipt:
  `R68Review2/receipts/gate-live-skill.json`.
- **Selftest 7-case battery: rc=0, verdict clean, 7/7** (green, section-missing, row-missing,
  sha-mismatch, entry-unbound, field-missing, selftest-unstated). Receipt:
  `R68Review2/receipts/selftest-final.json`. This satisfies the "C2 7-case selftest" shape named
  in the round plan; the cases sit inside the gate's own `selftest()` (lines 143-171), not a
  separate negative file.

## Attack findings — defects and tolerances the gate lets through

Full machine-readable battery: `R68Review2/attack2-results.json` (22 seeded cases, battery v2;
all expected cases held except the 2 flagged below and the negatives refused as expected).

### F1 — duplicate-row detection is string-exact on the instrument cell only (K05/K06/K07)

`registryRows()` keys `byPath` on the raw instrument cell with backticks stripped
(`check-instrument-registry-r68.mjs:83`). Any character variant of the same path evades the
duplicate check while the row still points at the same instrument:

- trailing slash: `` ` .ufo/waves/round-67/counters/png-r67.mjs/` `` — rc 0, accepted green;
- case variant: `.UFO/.../PNG-r67.mjs` — rc 0, accepted green;
- inline-comment: `png-r67.mjs `<!-- dup-->`` — rc 0, accepted green.

A duplicate row carrying a different sha/entry in the second copy would silently win (later
`byPath.set` overwrite at line 83). Boundary probe `receipts/triple-dup.json` shows 2×
`duplicate-row` findings on exact duplicates, so the check itself works only under the
byte-identical clause.

### F2 — `pinned` sha extraction is a non-anchored first-match 64-hex scan (K09, K12, pina/pinc, pinf)

`pinned.match(/[0-9a-f]{64}/)[0]` (line 91). Probes that pass green in a full seven-row suite
(rc 0, findings `[]`):

- doubled sha (true sha followed by 64 more hex in the same cell): first-match equals true sha →
  accepted; the pin is ambiguous in text but green by the gate;
- extra text/garbage around a correct sha → accepted (K04/D04 and pina);
- 65-hex cell (correct 64 followed by one more hex char) → **DEFECT: accepted green** (pinc:
  rc 0) — the 64-char prefix matches before the boundary; this is not "the pin stated", it is a
  substring of a longer hex blob;
- NBSP between `sha256` and the digest (K12) and:
- no `sha256` prefix at all — bare hex in the pinned cell (pinb) — rc 0, accepted green (the
  gate has no `sha256 ` prefix requirement, just any 64-hex substring in the cell).

Pressing further: a wrong-first double-pin `sha256 <wrong> sha256 <true>` **does** fire
`sha-mismatch` (ping, rc 1) — the first match is compared, not any-match; so the function is
strictly first-match.

### F3 — `entry` binds by substring only (K13/K14)

`entry.includes(p)` (line 94). The entry command cell `run XX<path>YY.mjs finally` passes; a row
whose entry is `node scripts/other.mjs <path>` (path as argument, not the entry of the registered
instrument) also passes. The docstring says "whose entry command names the path"; the gate
implements "the path appears anywhere in the cell", not "the entry command is the instrument's
actual CLI entry". Executor2's draft (whose task says "Inspect actual instrument CLI branches,
do not guess usage") may paper this with genuinely correct commands; the gate still can't
distinguish them from an argument-shaped path mention.

### F4 — selftest cell is a token test, not a command test (K16/K17/G03, qc1, qa2)

`selfOk = selftest && selftest !== '—' && (selftest.startsWith('—') || /--self-?test/.test(selftest))`
(lines 98-99). Any cell containing the literal `--selftest` string passes regardless of whether
it is a runnable command; `"the png counter has a --selftest self-check in repo"` passes green
(qc1, rc 0). Conversely the actual r67 instrument surface isn't uniform: `--
selftest` exists only in chromium-hscroll-r67.mjs (line 387) and check-receipt-provenance-v4.mjs
(line 237). chrome-cdp-loopback-round67.mjs, verify-live-r67.mjs, png-r67.mjs, make-negatives-r67.mjs
and mutate-r67.mjs carry **no** selftest flag (grep `selftest|self-test` = 0 hits in those five).
The docstring says "(a live instrument with no selftest must say so explicitly)" — the gate has no
vocabulary for "no selftest ships" and its regex forces every row into `--selftest` wording
anyway. qa1 verified a genuinely explicit no-selftest declaration ("no selftest ships with this
counter; self-test pending") is **rejected red** (selftest-unstated). The selftest cell's contract
and implementation only agree on one of the two instrument classes.

### F5 — malformed 7+-cell rows are silently dropped, no finding names them (K01/K02/K03/B04)

`if (cells.length !== COLUMNS.length) continue` (line 65). An 8-cell or 6-cell row is skipped
with zero finding token; the only signal is downstream `row-missing`. A 12-cell merged-pair row
(or K03's "instrument-lookalike" first-cell, which also hits the header regex
`/^\|[^|]*instrument/i` at line 64 and is skipped as if a header) is invisible to the
`duplicate-row` check as a false-negative carrier — a real r67 row could hide behind a malformed
extra cell and the gate yields no explicit `malformed-row` finding. The r68 selftest's seven
cases don't include a malformed-cell case, matching §finding F10 (below).

### F6 — section detection is `lines.findIndex((l) => l.trim() === SECTION)` (exact string, case-sensitive)

- H02: the section header inside a code fence is still found (a fenced triple-backtick block
  starts with ```` and then `## Instrument registry — round 68` trimmed to the same line) →
  accepted green. The gate can read a documented-as-code sample as a real section.
- H04 (hyphen instead of em-dash), K19 (case variant "REGISTRY") → row-missing everything
  (fail-closed, fine).

### F7 — stale r64 "legacy" generations coexist without a supersede check (K21/J01)

The r67 spotcheck routed defect 1 says "Register the r67 rows **or supersede the r64 rows**"
(`corpus/lessons/round-67-verifier-spotcheck.md`, Routed defects §1). The gate enumerates the
seven r67 instrument paths and nothing about the r64 rows: a scratch SKILL.md carrying an old
`## Instrument registry — round 64 (legacy)` table next to a green r68 table is accepted green
(K21 rc 0, J01 rc 0 in battery v1). The arrest criterion in r68 prompt §2b ("create or repair
the registry") is satisfied by an additive stale-coexist state with no supersede token. The gate
cannot catch a registry that repairs the routed defect on paper while both generations remain
listed — a row is "state-deserving" only if it names a live generation, but the gate's Expected
list touches only r67 paths.

### F8 — `--skill` accepts any file name/path (qc3)

`--skill <arbitrary .md filename>` is accepted (rc 0 with a copied ledger named
`qc3-ledger.md`). Gate doesn't bind its input to `SKILL.md` by name; it depends entirely on what
the caller (L1 freeze argv) passes. Non-blocking if the freeze argv is contractual; worth
naming: the gate trusts a caller-supplied filename for a file whose canonical name is fixed.

### F9 — gate CLI usage edge cases are consistent (probes: no-args rc 2, trailing unknown arg rc 2,
selftest-without-scratch rc 2, missing-skill-file rc 1, arbitrary repo rc 1)

rc=2 on usage error is honored as the docstring says ("0 clean, 1 findings, 2 usage"). The rc=1
on a missing `--skill` *file* is `fs.readFileSync` ENOENT (uncaught throw → exit 1), not rc 2
and not a finding report — a missing input is indistinguishable in rc/class from "findings".
Minor: different failure classes collapse to rc=1.

### F10 — selftest case coverage vs finding token set

The shipped selftest covers 7 tokens (green + 6 negative classes). Real finding tokens the gate
emits: `registry-section-missing`, `duplicate-row`, `row-missing`, `path-missing`, `sha-unstated`,
`sha-mismatch`, `entry-unbound`, `field-missing`, `selftest-unstated` — 9. Selftest leaves
`duplicate-row`, `path-missing`, `sha-unstated` unexercised. `sha-unstated` is reachable only
when pinned never carries 64-hex anywhere — likely rare in adversarial practice (F2 shows a
garbage sha is reachable, sha-unstated isn't).

## SCORECARD/SHONEN calibration-count question (milestone "does it count SCORECARD/SHONEN mismatch")

The gate is a registry gate, not a SelfAssessment/SCORECARD gate. It counts SKILL.md registry
row mismatches only: seven instrument paths, each row's path/sha/entry/verdicts/selftest/scope/
owner cells. It does **not** read SCORECARD.md or SHONEN.md or compare scores. Under the
round-68 prompt's calibration discipline (`tabi-round-68.md:552-553`, "a calibration claim must
count mismatches between the lane's self-assessment (SCORECARD/SHONEN) and observed repo state;
it cannot be an assertion"), the C2 registry gate does **not** by itself satisfy the
SCORECARD/SHONEN-counting definition — it counts SKILL.md↔repo-state mismatches, not
self-assessment↔repo-state mismatches. Concretely: C2 could pass fully green while
`corpus/SOURCES.md`, `SCORECARD.md` planned rows, or SHONEN boxes still lie about the same repo
state, and the gate would say nothing. This is a scope-of-claim question for the L1 rather than
a gate bug; the lane's r67 C2 passed the spotcheck with the same shape (the "C2 verified"
verdict in `round-67-verifier-spotcheck.md` was itself about a different gate v4 refusal).
Whatever the L1 freezes as "C2: registry repair for seven r67 instruments at SKILL.md" should
not be dressed as a pure §9 calibration-count claim unless the report also carries a
SCORECARD/SHONEN mismatch count command; a do-nothing control on this gate is already
rc=1-with-registry-section-missing (current lane base) and moving to rc=0 is exactly the C2
before→after, so the claim is non-vacuous IF frozen that way.

## Seven expected paths vs r67 routed defect (coverage check)

`check-instrument-registry-r68.mjs:24-32` EXPECTED list:
1. `scripts/chrome-cdp-loopbook-round67.mjs` — exists at repo (sha256
   `b7cd3b1d6cb3a51dfcfcaa683ec08818b894038da1ab5b6ab65d8df760306d22` per spotcheck pin);
2. `scripts/verify-live-r67.mjs` — exists (bc35944061c2cb50…, full in receipts);
3. `.ufo/waves/round-67/counters/chromium-hscroll-r67.mjs` — exists,
   sha `cf97a68d9ac480dad20c0eb09f3498b4b58c3f6f86f7ce184fdf56e81e49bde2` = spotcheck pin;
4. `.ufo/waves/round-67/counters/check-receipt-provenance-v4.mjs` — exists (r67 C2 v4 gate);
5. `.ufo/waves/round-67/counters/make-negatives-r67.mjs` — exists;
6. `.ufo/waves/round-67/counters/mutate-r67.mjs` — exists;
7. `.ufo/waves/round-67/counters/png-r67.mjs` — exists, sha
   `072813f7d3a78cd072c5fbbdd65c7b352d9393e6528c7f4181fd2cf4ddcd2292` = claims.json:132 pin.

Coverage against the r67 spotcheck's own enumeration of the round-67 inventory
("chrome-cdp-loopback-round67.mjs, chromium-hscroll-r67.mjs (+ make-negatives-r67.mjs /
mutate-r67.mjs), verify-live-r67.mjs, and the provenance gate check-receipt-provenance-v4.mjs")
— 5 named items in the prose, 7 in the gate: the gate EXPECTED adds `png-r67.mjs` (the PNG codec,
also used by the counter, present as a dependency in `chromium-hscroll-r67.mjs:18` import) and
keeps the same five. **png-r67.mjs is not named in the routed defect prose**; it is a reasonable
addition but should be justified in the claim text as a dependency rather than a routed-defect
item, or the count 7 must read as "5 from routed defect + 2 instrument dependencies".
No r67 instrument path is missing from EXPECTED; no EXPECTED path is absent from the repo
(probe: all seven copied and hashed, K00 rc 0).

## Full battery coverage

- Battery v1 (`attack-results.json`, 41 seeded cases including full seven-row suites K/I series):
  no false green against proper expectations; exposes the F2/F3/F4 tolerances plus
  `I03-all-seven-no-queries` (accepted green for `***NO-INSTRUMENT-NAME*** <path>` first cells —
  the instrument cell is free text, the path match is on the normalized cell, so the path itself
  carries the binding, which is fine but permissive about naming).
- Battery v2 (`attack2-results.json`, 22 cases) — the two greens that ARE defects: K05/K06/K07
  (F1) and K08 (a duplicate inside a `### notes` subheading still fires `duplicate-row` —
  actually flagged green→DEFECT because a duplicate under a different subheading is caught, a
  strict-correctness quibble, not exploitable); all 20 remaining expectations held.
- Battery v3 (`attack3-results.json`) — instrument-cell-as-command probe fires `row-missing`
  (correct fail-closed); confirms missing-skill-file rc(1) vs documented usage rc(2) (F9).
- Boundary apocrypha in `receipts/` (triple duplicate, seven-row-missing aggregation, gate
  selftest 7/7, gate-vs-committed-SKILL rc 1).

## Residual risk / verification gaps

- I did not probe `--repo` path traversal (`--repo ../other`) — relevant to whether a sibling
  lane could be registered against tabi's gate; plausible refusal since sha still must match the
  seven local lookups. Unexercised.
- I did not exercise the gate's behavior when `SKILL.md` contains `## Instrument registry —
  round 68` BOTH inside a code fence and as real text (first-match wins — which one?). H02
  alone was green; two-section shadow (F1 battery v1 `F03-second-section-of-same-name-shadows`)
  also green — the first occurrence is used. So a stale fenced example ABOVE a live section
  would win the whole scan. Unexercised in a real file; flagged.
- The 7-case selftest is in-file (`selftest()`), not a separate committed negative JSON; the
  round plan's "C2 7-case selftest" is satisfied by that file's battery, not a separate
  artifact. Executor2's receipt discipline should point at the selftest receipt (I have one at
  `receipts/selftest-final.json`).

## No-evidence claim about whom this moves axes

The do-nothing control on the current lane is **rc=1 (registry-section-missing)** — the gate as
committed cannot pass without the registry section being authored. A no-work round cannot move
calibration via this gate. Once the section lands, the defective tolerances F1-F7 are the
attack surface the closure should NOT accept as pass; they are cheap to close (dedup on a
normalized path, two sha regexes anchored, entry prefix-bind, selftest vocabulary for
"no-selftest", `malformed-row` finding, header-regex exclusion).

## Producer receipts

- gate script sha256 `25cdc6c3c13fb73c12712d3fad8fce279d50fe5563ad077308eb369c4ffd0e17`
- SKILL.md (working tree = HEAD) sha256 `0d7fa30bb6b1e72d3acfe3f63f0f464d3f24198bd84e0fa111ba1e7c9f59a76c`
- probes: `node scripts/check-instrument-registry-r68.mjs --skill <fixture>/SKILL.md --repo <fixture>` /
  `--selftest --scratch /fast/scratch/.../st2`; fixture SKILL.md texts and `byCheck` outcomes
  inline in `attack-results.json` / `attack2-results.json` / `attack3-results.json`.
- No tool installs were needed; nothing installed anywhere. No pacman transactions run.
