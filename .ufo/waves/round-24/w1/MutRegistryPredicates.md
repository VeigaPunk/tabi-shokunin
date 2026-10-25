# MutRegistryPredicates — C1 gate-registry mutation matrix (round 24, wave 1)

Seat: `L1Tabi24.MutRegistryPredicates` (UFO-FSD mutation tester / read-only reporter).
Item: produce the mutation matrix the production C1 gate `scripts/check-gate-registry.mjs`
must satisfy, with byte-exact mutants and expected finding ids. I also audited the
working-tree draft of that gate against the matrix.

Evidence discipline: every number below carries the exact command that produced it;
observation vs inference are separated; negative claims carry their sweep.

---

## 1. Ground truth

### 1.1 Frozen claim (C1) — `claims.json` (`.ufo/waves/round-24/claims.json`)
- Metric `nonconformant_gates`, counting command
  `node scripts/check-gate-registry.mjs --rev <REV> --json`, counter field
  `nonconformant` (integer; gates whose latest registry row is missing or incomplete).
- Kill rule: "Any gate the instrument cannot decide (unparseable row, missing script)
  counts as nonconformant, never as clean; if a field predicate cannot be shown red on a
  mutated row and green on the conformant row, the field leaves the required set and the
  target misses honestly."
- Failure-capable: "`--selftest` -> isolated CLI cases assert exit and finding id per
  class, including a mutant that drops one field and a mutant that removes the row; exit 0
  only when every case agrees."

### 1.2 PROTOCOL §Gate standard — `/home/vgpnk/Projects/shokunin/PROTOCOL.md:375-423` (read-only)
- Row fields (`:401-403`): **name, `gate|probe`, entry command, verdict map (code →
  class), self-test command and spelling, pinned-value path, write scope, owner** — eight
  fields, child lane's registry home = its own `SKILL.md`.
- Verdict (`:380-382`): `0`=clean, `1`=failed fleet-wide; every other code is declared in
  the registry entry and mapped onto `clean | failed | could-not-evaluate`; an undeclared
  nonzero code reads as `could-not-evaluate`.
- Self-test spelling (`:388-389`): spelling is the lane's (`--selftest`, `--self-test`,
  `run_selftest()`) and the registry records it.

### 1.3 Committed registry rows (byte-exact)
- Canonical 8-column conformant row **B8** = `SKILL.md` line 2435, 435 bytes:
  `| finite lifecycle semantic outcome oracle | gate | \`node .ufo/waves/round-22/measure-c1.mjs FULL40HEXREV\` | 0=clean/baseline; 1=failed; 2=could-not-evaluate | \`node .ufo/waves/round-22/measure-c1.mjs --selftest\` | \`corpus/evidence/round-22/semantic-expectations.json\`; \`.ufo/waves/round-22/fixtures/expected.json\`; retained round21 acquisition artifact digests | read-only committed blobs; selftest disposable Git trees only | tabi |`
  verified at HEAD by `git show HEAD:SKILL.md | awk 'NR==2435'`; `wc -c` = 435.
  Cells: 0 name, 1 kind, 2 entry, 3 verdict map, 4 self-test, 5 pinned, 6 scope, 7 owner.
- Legacy 6-column row **S6** = `SKILL.md` line 1614 (sources-census, 942 bytes) — kind
  content lives in cell 0/1 merged wording and the kind cell does NOT start with `gate|probe`.
- Draft test template **B7** (7 cells: entry+verdict merged) =
  `scripts/check-gate-registry.mjs:248-249` `CLEAN_ROW`.

### 1.4 Working-tree draft of the gate (status + behavior)
- `scripts/check-gate-registry.mjs` exists in the working tree but is **absent from HEAD**:
  `git ls-tree -r --name-only HEAD -- scripts/check-gate-registry.mjs` prints nothing, and
  HEAD = baseline `573c99e4885382db38babc3a6fc90e77afeb42a6`
  (`git rev-parse HEAD`). The production gate is therefore not yet committed; this matrix
  is input to its finalization.
- Draft behavior (read of `scripts/check-gate-registry.mjs:1-521`):
  - Findings are stable ids (line 37-38): `e1-missing-row`, `e2-field-incomplete`,
    `e3-row-script-absent`; refusal id `refused` (exit 2).
  - Gate set (lines 27-29, 178-192): scripts present at `<rev>` whose basename matches
    `GATE_CONVENTION = /^(check-[a-z0-9-]+|[a-z0-9-]*audit[a-z0-9-]*)\.mjs$/` UNION any
    script token found in a row's cells 2/3 (entry/self-test). No row → `e1`; row with
    missing fields → `e2`; row naming a script absent at `<rev>` → `e3`.
  - Field predicates (lines 149-167): name `/^[a-z0-9][a-z0-9-]*$/`; kind `/^gate\b/i`;
    entry length ≥ 8; verdict map has0&&has1 `\b0\b...clean` / `\b1\b...failed|findings|red|semantic failed`; self-test `/--self-?test\b/`; pinned length ≥ 8 and contains `/`/`.`/7+hex; scope length ≥ 10 and matches `read|writ|temp|isolat|stdout|nothing`; owner length ≥ 2 and matches `tabi|lane|L1|shokunin|owner`.
  - Selftest CASES (lines 251-376), 13 cases + 2 refusal arms.

---

## 2. The matrix

Each row is a required mutation of a conformant row; a conformant copy must stay green
(C1 control). Expected finding ids use the gate's stable vocabulary. `draftCase` =
existing self-test case id in the working-tree draft; `draftKill` = whether the draft's
current predicates catch the mutant (verified statically, section 3).

| ID | Class / field | Byte change (exact) | Expected exit | Expected finding id(s) | draftCase | draftKill |
|---|---|---|---|---|---|---|
| M01 | name removed | delete `finite lifecycle semantic outcome oracle ` (35 chars) between the two pipes of B8 → `| | gate |` | 1 | `e2-field-incomplete` (missing: name) | — | yes* |
| M02 | kind mutated | `gate` → `gates` (ins `s`) | 1 | `e2-field-incomplete` (missing: kind) | kind-probe-for-gate | yes |
| M03 | entry removed | entry cell → `none` (<8 chars) | 1 | `e2-field-incomplete` (missing: entry) | — | yes |
| M04 | verdict map missing code 2 | delete `; 2=could-not-evaluate` (23 B) → `0=clean/baseline; 1=failed` | 1 | `e2-field-incomplete` (missing: verdictMap) | — | **no** |
| M05 | self-test flag spelling changed | `--selftest` → `--selftestt` (ins `t`) | 1 | `e2-field-incomplete` (missing: selftest) | — | yes |
| M06 | pinned removed | pinned cell → `none` | 1 | `e2-field-incomplete` (missing: pinned) | pinned-value-missing | yes |
| M07 | scope removed | scope cell → `n/a` | 1 | `e2-field-incomplete` (missing: scope) | scope-missing | yes |
| M08 | owner removed | `\| tabi \|` → `\|  \|` | 1 | `e2-field-incomplete` (missing: owner) | missing-owner | yes |
| M09 | row removed entirely | delete whole conformant row line of convention gate `scripts/check-alpha.mjs` (script stays at rev) | 1 | `e1-missing-row` | missing-row | yes |
| M10 | gate renamed | name `alpha`→`beta` **and** script tokens `scripts/check-alpha.mjs`→`scripts/check-beta.mjs`; both scripts exist at rev | 1 | `e1-missing-row` (gate check-alpha) | — | yes |
| M11 | row names script absent at rev | entry token `scripts/check-alpha.mjs`→`scripts/check-beta.mjs`, `scripts/check-beta.mjs` absent at rev, name unchanged | 1 | `e3-row-script-absent` | row-script-absent | yes |
| M12 | duplicate row, LATER row nonconformant | append second identical B8 row after the conformant one with owner cell emptied | 1 | `e2-field-incomplete` (missing: owner), attributed to the LATER row's line | supersession-later-row-red | yes |
| C1 | control: earlier broken, later conformant | first row owner-empty, later row conformant | 0 | (none) | supersession-latest-wins | — |

\* M01 caveat: the draft already flags B8's clean name (spaces) — it is red for the wrong
reason; see §4.

### 2.1 Per-mutant requirements (what the gate must decide)

- **M01** — an empty/whitespace-only name cell must make the gate nonconformant. The name
  predicate must accept the lane's human-readable names (e.g. `finite lifecycle semantic
  outcome oracle`) and fail only on absent/empty/unparseable names. (Current regex fails on
  the clean B8 row — §4.1.)
- **M02** — kind cell must be exactly `gate` or `probe` (case-insensitive prefix match is
  fine); `gates`/`probes`/empty must be nonconformant.
- **M03** — entry-command cell must be present and parseable (≥8 non-whitespace bytes and
  contain a runnable script reference). Mutating only the `.mjs` suffix while leaving a
  long cell must NOT be the only detector; the short/empty cell must be red.
- **M04** — the verdict map must declare code `2` mapped onto `could-not-evaluate`
  (lane gates register 2; PROTOCOL requires every used nonzero code to be declared). The
  claim's routed defect and this matrix make `0 clean, 1 failed` with no `2` a red row.
  This is a **required addition to the draft** (§4.2).
- **M05** — the self-test cell must contain a self-invocation spelling from the PROTOCOL
  set (`--selftest`, `--self-test`, `run_selftest()`); a garbled spelling
  (`--selftestt`) is red. Both valid spellings must stay green.
- **M06/M07/M08** — pinned path, write scope, owner must be present with the lane's
  normal content; `none`, `n/a`, empty are red.
- **M09** — convention gates (scripts in `scripts/` matching `check-*.mjs` / `*audit*.mjs`
  at the revision) with no row at all must be `e1-missing-row`. (For row-only gates —
  scripts invoked only by a row — removing the only row also removes them from the gate
  set; that is a gap the draft inherits: it must be decided explicitly, §4.3.)
- **M10** — a renamed gate (name cell + script token both changed, new script exists) must
  surface as `e1-missing-row` for the original gate. The renamed row must not be allowed to
  serve the original gate via name match; it binds to the new script.
- **M11** — a row whose entry cell names a script absent at the measured revision must be
  `e3-row-script-absent` even when the name matches an existing gate.
- **M12 / C1** — supersession must be by document order: the latest row (highest line
  number) for a gate wins. Later nonconformant → red (`e2` with the later row's line);
  later conformant → green.
- All mutants: exit 1, `clean:false`, `nonconformant:1`, exactly the listed finding id(s);
  the conformant base row must exit 0.

---

## 3. Kill/survive verification (static, on draft predicates)

Command: `node -e '...'` applying the draft's own regexes (copied from
`scripts/check-gate-registry.mjs:152-165`) to each mutant string:

```
name-spaces=false            (clean B8 name fails current /^[a-z0-9][a-z0-9-]*$/)
name-sources-census=true
kind-gates=false             (dies)
kind-gate=true
verdict-code2-dropped=true   (has0&&has1 still true -> M04 SURVIVES)
verdict-0ok=false            (whole-map collapse dies)
selftest-spelling-ok=true
selftest-spelling-bad=false  (dies)
verdict-cell-oft-8col=false  (entry cell of clean 8-col row has no 0/1 tokens -> clean B8 misflagged)
```

So of the 13 required mutants, the draft's current predicates kill 12; **M04
(verdict-map-missing-code2) survives** and must be added, along with the parser fixes in §4
(which change several "kills" from accidental to intended).

---

## 4. Draft gaps the production gate must close (blocking C1 target)

These are observed from the draft bytes; they must be resolved before the matrix can be
satisfied on the lane's real registry.

### 4.1 Field-index misalignment vs committed registry rows
The draft's `missingFields` reads cells 2..6 as
entry+verdict/self-test/pinned/scope/owner (7-cell layout, its own `CLEAN_ROW`). The
lane's committed canonical rows are **8-column** (B8, SKILL.md:2435): verdict is its own
column. On B8 the draft reads:
- entry cell (no verdict tokens) → `verdictMap` flagged (verified `verdict-cell-oft-8col=false`);
- verdict cell treated as self-test → `selftest` flagged;
- self-test cell treated as pinned (passes by luck), pinned cell treated as scope (fails),
  scope cell treated as owner (passes);
- name with spaces → flagged (§4.2).
i.e. the clean committed B8 row is nonconformant under the draft. The production gate must
parse the real 8-column shape (cells 0..7) and, for compatibility, the 7-cell merged shape.

### 4.2 6-column rows are skipped entirely
`parseRows` requires cell 1 to start with `gate|probe` (line 127-128). Round-19/20 rows write
kind merged into cell 0 (`| validation counter / gate | ...`), so their kind cell starts
with `validation`; the row is skipped → the row-invoked scripts then have no row → `e1`.
The gate must either recognize the 6-column legacy layout or the integration must re-land
those rows in a canonical layout.

### 4.3 Gate-set self-reference (row-only gates)
A gate that appears only as a row-invoked script (no convention script at `<rev>`) leaves
the set if its only row is deleted (`M09` variant). Decide and document: a removed last row
for a row-only gate cannot be observed (the gate no longer exists at the rev) — acceptable —
but the claim's "never as clean" rule applies to gates that DO exist; convention scripts are
the safe class (the round-23 defect gate `round-evidence-audit` is one).

### 4.4 Name predicate
`/^[a-z0-9][a-z0-9-]*$/` rejects space-containing names used by committed rows. Relax to a
presence/parseability check so M01 (empty) is red and B8 (spaces) is green.

### 4.5 Verdict code-2 requirement (M04)
Add `has2` (e.g. `\b2\b\s*[-=:>]*\s*could[- ]not[- ]evaluate\b`) to the verdict-map
predicate and a dedicated `--selftest` case (drop only the `; 2=could-not-evaluate`
clause). Keep the existing `verdict-map-incomplete` case for whole-map collapse.

### 4.6 Case coverage of the matrix
Draft CASES cover: M02 (kind-probe-for-gate), M06, M07, M08, M09, M11, M12, C1, plus
green controls (clean-single-gate, audit-convention-name, row-named-gate-outside-scripts).
**Missing cases:** M01 (name empty), M03 (entry empty), M04 (code-2 dropped), M05
(flag-spelling — only whole-cell swap exists), M10 (gate renamed). Add them so `--selftest`
asserts one red per class with the exact finding id (exit 1 → then exit 0 when every case
agrees; current selftest failure exit is 3, which is fine).

### 4.7 Shipping state
The gate file is untracked at HEAD (HEAD = baseline `573c99e`). C1's before/full
measurement cannot run until it is committed; after commit, run
`node scripts/check-gate-registry.mjs --rev 573c99e... --json` for the before value and the
same gate at tip for after=0. (Not executed here: the L1 runs lane gates after integration.)

---

## 5. Deliverables

- Matrix fixture (machine-readable): `.ufo/waves/round-24/scratch/MutRegistryPredicates/mutants.json`
  — 13 mutants + green control with `before`/`after` byte strings and expected findings.
- Base rows (byte-exact): `.ufo/waves/round-24/scratch/MutRegistryPredicates/base-rows.md`
  (B8 = SKILL.md:2435; B7 = draft CLEAN_ROW; S6 = SKILL.md:1614).
- This report: `.ufo/waves/round-24/w1/MutRegistryPredicates.md`.

## 6. Tools
No tools installed or upgraded (nothing needed; `node` present). No git writes were made;
all git use was read-only (`rev-parse`, `ls-tree`, `show`, `grep`). No sibling lane or
fleet files were touched; fleet PROTOCOL.md was read only.
