# MutC2Enum — C2 verdict-enum mutation probe

Seat `MutC2Enum`, wave 1, round 42. Leaf mutation probe. Lane read-only.
Full report: `.ufo/waves/round-42/w1/MutC2Enum/report.md`.

**Unit under mutation:** `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`,
sha256 `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8`, byte-identical at
freeze `9b6de3a` and lane HEAD `0081bfd`.

**Frozen clause:** claims.json C2 r4 — *verdict in {present,absent,misbound,partial,unreachable}*.

**Mutant M (single line, line 157):**
```diff
-      if (!VERDICTS.has(r.verdict)) { add('r4-verdict-enum', `${r.id}: verdict '${r.verdict}' not in enum`); continue; }
+      if (!r.verdict) { add('r4-verdict-enum', `${r.id}: verdict '${r.verdict}' not in enum`); continue; }
```
`checker-mutant.mjs` sha256 `aac87ec7a41c04d54b87b068cc4f60ee1dd227b60e610293b6149253e7ec915c`.

**Fixtures** (own git repos, `rev-parse --show-toplevel` asserted == dir before commit):
- `fixtureA` `4fe69459dc0c8f2b8ea0ec3b656e2d17354058fa` — 38-row TSV, 5 verdicts `ok` (S102,S118,S135,S153,S167), all 38 evidence blobs committed ≥200 B; R1/R2/R3 fully satisfied.
- `fixtureB-control` `100ffd64c4ba4b7a8d19fd5dae16f12f3dcfc1bb` — identical but 38 in-enum verdicts.
- `fixtureA` @ `21f14f2f7919ea20c1293129dfbb7f38e53f4ae8` — one evidence blob removed (narrowness).

## Red/green table

| fixture | checker | exit | findings |
|---|---|---|---|
| A `4fe6945` | pristine | **1** | 5 × `r4-verdict-enum`: S102, S118, S135, S153, S167 (`verdict 'ok' not in enum`) |
| A `4fe6945` | **mutant M** | **0** | none, `predicate: true` |
| A `4fe6945` | restored `b1d05df` | 1 | 5 × `r4-verdict-enum` (identical) |
| B-control `100ffd6` | pristine | 0 | none |
| B-control `100ffd6` | mutant M | 0 | none |
| A @ `21f14f2` (no evidence blob) | mutant M | 1 | 1 × `r4-evidence-absent` (S106) |
| A @ `21f14f2` | pristine | 1 | 5 × `r4-verdict-enum` + 1 × `r4-evidence-absent` |
| real lane HEAD `0081bfd` | pristine | 1 | 1 × `r4-quarantine-absent` |

## Verdict

**Mutant KILLED.** Fixture A separates it from pristine: exit 1 / 5 findings → exit 0 / 0 findings
on identical committed bytes. Baseline produced its expected refusal, so the probe is conclusive.

**The r4 verdict-enum clause is load-bearing.** Dropping it lets a ledger carrying five out-of-enum
verdict tokens reach `predicate: true`, i.e. the frozen "verdict in {…}" requirement would be
unenforced by its own instrument. Row 6 bounds it: the mutant still refuses a missing evidence
blob, so the green is attributable to the enum clause alone.

The B-control green proves fixture A's refusal is caused solely by the 5 tokens; the lane-HEAD run
(only `r4-quarantine-absent`) proves the fixture is faithful to the committed state and was not
weakened into an easier predicate.

**Not an admission of C2:** the real repairs are still absent from the lane (HEAD has no
`re-adjudication.tsv`). This probe reports the weakened-copy green surface named in C2's kill rule;
it does not satisfy the predicate.

**Restoration:** lane checker untouched (`b1d05df…` before and after, `counters/` git-clean);
`checker-restored.mjs` is byte-identical to pristine and reproduces the 5-finding refusal; the
scratch copy was restored in place (`restore-evidence.txt`); mutant bytes preserved only as seat
evidence. No installs, no network, no git/jj mutation in the lane; scratch deleted before yield.

VERDICT ok — r4 verdict-enum clause is load-bearing: mutant `aac87ec` greens fixture A (exit 0, 0 findings) where pristine `b1d05df` refuses (exit 1, 5 × `r4-verdict-enum`: S102,S118,S135,S153,S167), the mutant still refuses a missing evidence blob, and lane HEAD remains red only on `r4-quarantine-absent`.
