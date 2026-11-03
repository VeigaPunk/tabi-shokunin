# R57Gate — cited-receipts gate v2 (the R56Gate-F1 widening)

Seat R57Gate (leaf executor), round 57 wave w1, lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`
at base `ef43ececde883cc0368c6c7cfbabe30ef937b717`. Lane helper and host guard followed:
absolute paths only, process cwd never used for relative writes, every fixture git mutation
preceded by its own `rev-parse --show-toplevel` assertion, scratch under
`/fast/scratch/hyaku/tabi-r57/R57Gate/` (deleted at yield).

**Written, not committed.** Files: `scripts/check-cited-receipts-v2.mjs` (new) and
`.ufo/waves/round-57/gate/**` (fixtures + receipts + drivers). Nothing else was written; the
fleet root and `shokuknow` were read only. **v1 is untouched** —
`scripts/check-cited-receipts.mjs` sha256 `0457f35468db9efdf8e9291f684dd90defa2016157b45e78887987b023550c7a`,
identical to the value recorded by R56Gate. No tool was installed or upgraded (nothing needed;
no pacman transaction was attempted).

## 1. Deliverable

| file | sha256 | note |
|---|---|---|
| `scripts/check-cited-receipts-v2.mjs` | `f7f2d4e42a4a4dcf0552b900dc5983fc0779e9b3f7881f4da18d31dbf11b9805` | new generation; `node --check` exit 0; mode 755 |
| `.ufo/waves/round-57/gate/fixtures/cases.json` | `92559eb4acb75ec278390e78413076c4aa0bf1230dfcad93c2a443c3a794675a` | 6 hand-declared selftest cases |
| `.ufo/waves/round-57/gate/run-receipts.sh` | — | reproduces every receipt below |
| `.ufo/waves/round-57/gate/classify-relative-misses.mjs` | — | receipt tool (not the gate) |
| `.ufo/waves/round-57/gate/annex-scope-v3.mjs` | — | measurement annex (not adopted, not the gate) |
| `.ufo/waves/round-57/gate/fixtures/trees/**` | per-file list in `gate/provenance.txt` | 19 files, 6 fixture trees |

Freeze-commit split: the instrument bytes are `scripts/check-cited-receipts-v2.mjs`, `gate/run-receipts.sh`,
`gate/classify-relative-misses.mjs`, `gate/annex-scope-v3.mjs`, `gate/fixtures/**` (hand-declared fixture
trees + `cases.json`). The `gate/*.json` / `gate/*.txt` measurement receipts are outputs of those tools;
they are deterministic and re-derivable with `run-receipts.sh`, so committing them alongside is safe, but
they are not inputs to the selftest.

## 2. Generation declaration (what v2 is, exactly)

v1's CLI, exit classes and finding meanings are kept verbatim; ONE widening is declared —
the routed defect from the r56 closure (lesson row R56Gate-F1), as an explicit new
generation rather than an edit.

| contract item | v2 behaviour |
|---|---|
| CLI | `--repo <abs>` (default cwd, validated by `rev-parse --show-toplevel`), `--round <N>` (required), `--doc <rev>:<path>` (repeatable), `--json`; **new**: `--selftest [--scratch <dir>] [--fixtures <dir>]` |
| exit | 0 clean / 1 findings / 2 usage error (unresolvable rev, unreadable doc, non-repo, unknown arg) |
| v1 half | literal `.ufo/waves/round-<digits>/` + `[A-Za-z0-9._/-]*`, trailing punctuation stripped right-edge only, trailing `/` kept, other-round tokens counted and never checked; one finding per occurrence `{path, citingDoc, line}`; `missing` = distinct full-prefix missing paths, **unchanged meaning** |
| v1 finding id | emitted as `id: "full-prefix-citation-missing"`; `path` / `citingDoc` / `line` are the same three fields v1 emitted |
| widening | an UNPREFIXED token starting with `counters|measure|controls|adj|gate|gate-fixtures|sources|scout|reviewer|critic|connector|mutant|sentinel|labrat|scribe|quarantine|assimilation`, followed by `/` **and at least one path character**, resolves against `.ufo/waves/round-<--round>/`; missing there → `id: "relative-citation-missing"`, present → no finding |
| prose negatives | a bare word (`measure`, `controls`) never matches; a component followed by `/` and nothing else (`in mutant/`) never matches |
| cross-round isolation | full-prefix spans are blanked out before the relative scan, so `.ufo/waves/round-<M>/measure/x` is never re-read as a relative `measure/x`; a bare `round-56/measure/x` fragment is excluded by the left boundary too |
| traversal | a relative token containing `..` → `id: "relative-citation-traversal"`, **never resolved** (the token is refused, not the normalized destination) |
| new reporting fields | `relativeChecked`, `missingRelative`, `traversal`, `missingAll`, and per finding `id`/`kind`/`round`/`resolved` |
| writes | normal mode writes nothing (stdout/stderr only, no temp files); `--selftest` writes only under `--scratch`/`TMPDIR` and removes its fixtures |

## 3. Selftest — 6/6, with the v1 differential

`bash .ufo/waves/round-57/gate/run-receipts.sh` → selftest exit 0. Receipts:
`gate/selftest-at-freeze.txt` (`8a13127…`) and `gate/selftest-at-freeze.json` (`2203580…`).
Each case builds its own throwaway git fixture from the committed tree under
`gate/fixtures/trees/<case>/`, asserts `rev-parse --show-toplevel` equals the fixture dir
before the first `git add`, commits, and asserts exit + the gate's own JSON fields. Where a
case declares `v1`, the real `scripts/check-cited-receipts.mjs` is spawned on the same fixture
and diffed on findings/`checked`/`otherRoundTokens`/`missing`/exit.

```
(excerpted from gate/selftest-at-freeze.txt)
=== CASE relative-invisible            round=55 exit=1 expect=1 | checked=0 relative=2  PASS
      measure/d54-1-landing-note-r55.txt        -> .ufo/waves/round-55/measure/…  line=3
      measure/c1-meter-green-at-correction1.json -> .ufo/waves/round-55/measure/…  line=3
      v1 on the same fixture: exit 0, 0 findings  (the two citations are invisible to v1)
=== CASE full-prefix-differential       round=57 exit=1 expect=1 | checked=4 relative=0  PASS
      v1 identical: 2 findings, checked=4, otherRound=1, missing=1  (byte-equal projection)
=== CASE prose-negatives                round=57 exit=0 expect=0 | checked=0 relative=0  PASS
=== CASE cross-round-prefix             round=57 exit=0 expect=0 | checked=0 relative=0 other-round=2  PASS
=== CASE traversal                      round=57 exit=1 expect=1 | checked=0 relative=2  PASS
      measure/../outside.txt        refused (the normalized path .ufo/waves/round-57/outside.txt EXISTS)
      controls/../../etc/passwd     refused
=== CASE relative-present               round=57 exit=0 expect=0 | checked=0 relative=3  PASS
selftest cases=6 passed=6 failed=0
```

Covers the five required cases: (1) the two historically-invisible relative citations
detected, (2) full-prefix behaviour identical to v1 by differential, (3) prose negatives,
(4) cross-round full-prefix tokens untouched by the relative rule, (5) `../` refused. The
traversal case is the sharp one: the refused token's normalized destination exists in the
fixture, so a normalizing implementation would have gone green.

## 4. Red-before proof at the r55 close revision

```
node scripts/check-cited-receipts.mjs    --repo <lane> --round 55 --json \
  --doc 545b251d:corpus/lessons/round-55.md --doc 545b251d:SCORECARD.md      # exit 1
node scripts/check-cited-receipts-v2.mjs --repo <lane> --round 55 --json \
  --doc 545b251d:corpus/lessons/round-55.md --doc 545b251d:SCORECARD.md      # exit 1
```

| run | findings | distinct | checked | relativeChecked | other-round |
|---|---|---|---|---|---|
| v1 (`gate/v1-at-545b251d.json`, `8504024…`) | **6** | **5** | 12 | — | 234 |
| v2 (`gate/v2-red-before-545b251d.json`, `418f856…`) | **83** | **72** (5 full-prefix + 68 relative, overlap 1) | 12 | 105 | 234 |

The v1 half is bit-identical to the r56 receipt (6 findings / 5 distinct paths, same five
paths, same lines) — the differential holds on real history, not only on fixtures. v2 is
**strictly more** and catches both relative forms named by R56Gate-F1:

```
RELATIVE-MISSING path=measure/d54-1-landing-note-r55.txt
  -> .ufo/waves/round-55/measure/d54-1-landing-note-r55.txt
  citingDoc=545b251d:corpus/lessons/round-55.md line=67
RELATIVE-MISSING path=measure/c1-meter-green-at-correction1.json
  -> .ufo/waves/round-55/measure/c1-meter-green-at-correction1.json
  citingDoc=545b251d:SCORECARD.md line=3145
```

`gate/v2-red-before-545b251d.txt` (`f5eac71…`) is the human form. Both targets exist only in
other rounds at that revision (47/50/52/53 and 54 respectively — `gate/r55-classification.json`,
`b5c722c…`), which is exactly the class v1 cannot see.

## 5. Head runs — v1 green, and the delta the L1 ruled on

Same two docs at `ef43ecec`:

| run | exit | findings | distinct | checked | relativeChecked |
|---|---|---|---|---|---|
| v1 `--round 56` (`gate/v1-at-head-round56.txt`, `951e4cc…`) | **0** | 0 | 0 | 3 | — |
| v2 `--round 56` (`gate/v2-at-head-round56.json`, `5797517…`) | **1** | **98** | **76** relative | 3 | 108 |
| v2 `--round 55` (docs' own round, `gate/v2-at-head-round55.json`) | 1 | 85 | 70 relative | 13 | 108 |
| v2 r56-close doc set `--round 56` (`round-56.md`+`SCORECARD`+`LOG`) | 1 | 157 | 104 relative | 14 | 187 |

The acceptance in the seat contract is "v2 green **or** names ONLY genuinely missing
receipts". **It is not met under the frozen rule, and the reason is the rule, not a bug.**
`--round` fixes one resolution round for every document, so a cumulative document imports
every older round's relative citations into that round's check. Measured decomposition of the
76 distinct relative targets at head `--round 56` (`gate/head-round56-classification.json`,
`5e5d8f5…`):

* **62** exist in another round's dir at the same revision — historical `SCORECARD`/`LOG` rows
  and the r55 lesson, written before criterion 110 required full prefixes. They are not lost
  receipts. One of them is a genuine lost r55 receipt (`measure/d54-1-landing-note-r55.txt`).
* **14** exist nowhere, and are not receipts at all but prose/truncated fragments that the
  declared rule must treat as slash-paths: `gate/closeout`, `gate/descriptor`, `gate/history`,
  `gate/selftest`, `gate/counter`, `reviewer/scout`, `connector/scout`, `connector/reviewer`,
  `critic/reviewer/mutation-tester`, `measure/c1-distinct-at-`, `measure/noharm-at-`,
  `controls/c2-v1-relative-scratch-red-`, `controls/c3-r49counter-on-r49-`,
  `controls/c2-model-red-pngs/`.

The rule also **under-fires** in the other direction: at head `--round 56`,
`measure/c1-meter-green-at-correction1.json` is *not* a finding, because
`.ufo/waves/round-56/measure/c1-meter-green-at-correction1.json` exists — a same-name file in
the gate round satisfies a citation of the r55 lost receipt. Resolving a foreign round's
relative citation at the gate round can therefore both invent and hide receipts.

Operationally: a round-57 close run over `SCORECARD.md`/`LOG.md` stays red under the frozen
rule for as long as those documents keep their pre-criterion-110 rows (157 findings on the r56
close set). The widening's clean signal appears when the gate runs on a round's **own**
document (next section).

### 5.1 L1 ruling on this delta (round 57, recorded verbatim in substance)

1. **The v2 gate ships AS BUILT** — relative rule, traversal refusal, and v1's full-prefix half
   unchanged. Its close-run **usage contract is round-scoped**: the relative rule applies to
   documents whose citations are round-owned (the round's own lesson and the round's report),
   passed with `--round N`. Cumulative documents (`SCORECARD.md`, `LOG.md`) stay under the v1
   full-prefix rule; a relative token in a cumulative document is ambiguous by construction,
   which is exactly the 62-citation decomposition above.
2. **The red-before receipt at `545b251d` stands as the widening's demonstrated catch** (83
   findings / 72 distinct, both F1 targets) — proof that the class is now visible, not the
   operational close-run shape. The r55 lesson at `--round 55` — 3 relative findings, all
   genuinely lost receipts (§6) — is the clean **operational demonstration**. Both are cited.
3. **The under-fire limitation is disclosed** as a known limitation of round-scoped
   resolution: the operational answer is that each round's close run checks that round's
   documents at that round's number, so the same-name masking case is out of scope by the same
   scoping, and criterion 110's full-prefix requirement for cumulative documents is what keeps
   those citations visible.
4. **`annex-scope-v3` is NOT adopted** — it needs its own claim and it weakens coverage; it is
   recorded as the named alternative, not taken (§7).

## 6. Per-document split — the clean operational demonstration

`--round 55` at the r55 close revision, one `--doc` per run (`gate/v?-perdoc-*.json`):

| document | v1 | v2 | v2 relative misses |
|---|---|---|---|
| `corpus/lessons/round-55.md` | 4 findings | **7** | **3**, all genuinely lost r55 receipts the lesson claims landed: `measure/d54-1-landing-note-r55.txt`, `measure/c2-r53counter-refuses-r54.json`, `measure/c2-r54counter-refuses-r53.json` |
| `SCORECARD.md` | 2 findings | 76 | 67 (1 is the F1 target; the rest are pre-criterion-110 rows) |

The same split at head `--round 56` is the mirror image: the r55 lesson yields 14 (11 relative —
its r55 receipts checked against round 56) and `SCORECARD` yields 84 (75 relative). That pair is
the measurement behind the ruling's usage contract: the round's own lesson at the round's own
number is the clean close-run shape (3 relative findings, every one a receipt the r55 lesson
claims landed and that is not there), while the cumulative document is the ambiguous one.

## 7. Named alternative, NOT adopted (annex measurement)

`gate/annex-scope-v3.mjs` measures the obvious next-generation scope — resolve at the max
round named on the same line, else the citing document's round, else count the token as
unanchored and do not check it — and the receipts are
`gate/annex-scope-v3-545b251d.json` (`a568975…`) / `gate/annex-scope-v3-head56.json`
(`526d190…`):

| revision | findings | distinct | unanchored (silently unchecked) |
|---|---|---|---|
| 545b251d `--round 55` | 7 | 7 | 33 relative tokens |
| head `--round 56` | 7 | 7 | 34 relative tokens |

Of the 7, four are the genuinely lost receipts (the three lesson misses plus the F1 SCORECARD
target) and three are rule artifacts (one line-anchored row that cites a *next* round's token,
two truncated fragments). It is much closer to "only genuinely missing", but it buys that by
not checking 33–34 relative tokens, and it changes the frozen resolution rule. **Not adopted
per the ruling of §5.1 item 4** — it needs its own claim and it weakens coverage. It is
recorded here as the named alternative the lesson should carry, not as a change to v2.

## 8. Risks, limits, non-actions

* The traversal rule is scoped to relative tokens, deliberately: applying it to full-prefix
  tokens would change v1 findings' meaning. git itself refuses `..` in `<rev>:<path>` (probed:
  exit 128), so a full-prefix token carrying `..` still reports as v1 reported it.
* The relative rule is lexical. It cannot tell a citation from prose shaped like a path
  (`gate/closeout`) or a line-wrapped truncation (`measure/noharm-at-`); section 5 quantifies
  that class at 14 distinct targets on these two documents.
* Cumulative documents (`SCORECARD.md`, `LOG.md`) carry every round's relative citations; per the
  §5.1 usage contract they stay under v1's full-prefix rule, and the round-scoped close run
  (the round's own lesson + report, at that round's number) is the operational shape.
* Nothing was re-run to manufacture green: the head red is reported as measured.
* No history was fixed, no r56 byte was touched, v1 was not edited, nothing was committed.

## 9. Evidence index

| receipt | sha256 | content |
|---|---|---|
| `gate/provenance.txt` | — | tool hashes, host, per-fixture-file hashes, every exit code |
| `gate/selftest-at-freeze.txt` / `.json` | `8a13127…` / `2203580…` | 6/6, per-case findings and v1 differential |
| `gate/cli-probes.txt` | `5b6fa3e…` | exit-2 classes P1–P7, short-hash rev P8 |
| `gate/v1-at-545b251d.json` | `8504024…` | v1 red-before (6/5) |
| `gate/v2-red-before-545b251d.json` / `.txt` | `418f856…` / `f5eac71…` | v2 red-before (83 findings, 68 relative distinct) |
| `gate/r55-classification.json` | `b5c722c…` | per-target home rounds at 545b251d |
| `gate/v1-at-head-round56.json` / `.txt` | `951e4cc…` (txt) | v1 green, 3 tokens |
| `gate/v2-at-head-round56.json` / `.txt` | `5797517…` | v2 at head (98 findings / 76 relative) |
| `gate/head-round56-classification.json` | `5e5d8f5…` | the 62/14 decomposition |
| `gate/v2-at-head-round55.json` | — | same docs at their own round |
| `gate/v2-at-head-r56close-round56.json` | — | r56 close set (157 findings) |
| `gate/{v1,v2}-perdoc-*.json` | — | the per-document split |
| `gate/annex-scope-v3-*.json` | `a568975…` / `526d190…` | measured alternative, not adopted |

## 10. Reproduce

```
bash /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-57/gate/run-receipts.sh \
  --scratch <dir>          # writes the receipts in place; fixtures live only under <dir>
node scripts/check-cited-receipts-v2.mjs --selftest --scratch <dir>
```
