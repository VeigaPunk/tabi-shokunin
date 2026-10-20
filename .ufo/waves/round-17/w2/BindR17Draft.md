VERDICT: HOLDS

Attacked: the round-17 measurement-binding draft `.ufo/waves/round-17/drafts/measurement-binding.json`
(schema `tabi-measurement-binding-v1`) — its identity binding (counter blob digests at M), its
`countedInputs` against what each counter actually reads at REV, the B→M counts, and whether
`--reproduce` really executes and compares. Every check below was run; nothing is inferred.

## Deliverable

`.ufo/waves/round-17/drafts/measurement-binding.json`, 3088 bytes, sha256
`34d7c66d5e8a9c94b802d11fc3f69fd97805cbdc9c95ed9aa74dc8650c7f2447`.
round 17, baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`; claims C1/C2/C3, each with
`counter.{path,sha256,argv,countField}`, `countedInputs`, `measuredRevision`
`6c97851034e9d8f58b135d28ff969f1f28fa2f7d`, `before` B, `after` M.

| claim | counter | sha256 at M | countField | before | after |
|---|---|---|---|---|---|
| C1 | `.ufo/waves/round-17/measure-c1.mjs` | `47185c8c07bd…a322d9f` | `c1_anchor_safe` | 0 | 4 |
| C2 | `.ufo/waves/round-17/measure-c2.mjs` | `2cba594b5b4e…f9ec17ac` | `c2_invocation_held` | 0 | 1 |
| C3 | `.ufo/waves/round-17/measure-c3.mjs` | `8dec49726e96…fca007c3` | `c3_adjacency_verified` | 0 | 9 |

argv for each is `["node", "<counter path>", "{REV}"]` (exactly one `{REV}`, argv[0] `node`,
argv[1] the declared path — the gate's only accepted shape).

## countedInputs derived from the counters (not guessed)

- C1 (`measure-c1.mjs:141-220,318-340,666-706`): `git show REV:` gate blobs
  (`check-round-contract`, `check-user-round-contract`, `check-measurement-binding`),
  `cat-file blob REV:.ufo/waves/round-17/c1-sites.json`, the poison probes
  (`corpus/lessons/pstack-20261015-r10.md`, `corpus/evidence/round-15/measurements.json`,
  `corpus/evidence/user-20261015-r01/spec.json`, `.ufo/waves/round-16/measure.mjs`), and the
  out-of-tree copy of the user gate. 8 declared — the `write:` poison paths
  (`corpus/lessons/user-20261015-r07..r10.md`) do not exist at M, so they are correctly not declared.
- C2 (`measure-c2.mjs:471-500`, corroborated by the counter's own `inputsRead` at M): note,
  `corpus/SOURCES.md`, `corpus/README.md`, receipt, `scripts/webmcp-invoke-round17.mjs`, and
  `corpus/evidence/round-17/webmcp-invoke/fixtures/`. Declared list equals that set exactly
  (the counter path itself is added by the gate).
- C3 (`measure-c3.mjs:270-330,196-206,573-580`): `corpus/adjacency.tsv`, `scripts/check-adjacency.mjs`,
  and every `tabi_ref` file at REV — `PROVINCE.md` (rows :9,:15,:16) and `SKILL.md` (:556,:727) — plus
  the self-venue ruling `corpus/lessons/round-16-verifier-spotcheck.md` pinned at B. 5 declared.

## Counts at M (real lane, counters spawned directly)

`node .ufo/waves/round-17/measure-c1.mjs 6c9785…` → `c1_anchor_safe=4`, exit 0, 29.8 s;
4 label-only entries (`round-contract-count-witness`, `user-contract-witness`,
`user-contract-count-witness`, `user-contract-diagnostic-witness`) reported and not credited.
`measure-c2.mjs` → `c2_invocation_held=1`, probesOk true, failures []. `measure-c3.mjs` →
`c3_adjacency_verified=9` (ruled 1 / contested-open 2 / split-declared 2 / refused-route 4), all 7
checker mutations applied, dropped, checker exit 1.

## Sandbox + assigned command

`/tmp/tabi-r17w2-BindR17Draft-nhhc`: `fleet/` (clone of `/home/vgpnk/Projects/shokunin`, the
`--fleet-root` parent C3 derives from the lane's parent), `fleet/tabi-shokunin` (lane clone at M) and
clones of kaidoku/revenger/kake/kagi/kasegi/kumitate. Commit
`C=bf5903007772dff2251a9ed9d5e20ebff8336bb6` (parent M) adds only the draft.

```
$ node scripts/check-measurement-binding.mjs --check .ufo/waves/round-17/drafts/measurement-binding.json \
    --at bf5903007772dff2251a9ed9d5e20ebff8336bb6 --reproduce
MEASUREMENT_BINDING verdict=clean claims=3 bound=3
exit=0   (33.7 s)
```
`--json`: `{"verdict":"clean","claims":3,"bound":3,"at":"bf59030…","findings":[]}`, exit 0.
No `counter_digest_*`, `counted_input_*`, `argv_unsupported`, `measured_revision_*` finding.

Arms in the same sandbox (each exit 0): B → `c1=0 c2=0 c3=0`; C → `c1=4 c2=1 c3=9`. So the
`before`/`after` pairs are reproduced by the gate's own two-arm `--reproduce`.

## Falsification probes on the draft

1. Reproduce compares counts, not just exits: a mutant manifest with `C1.after.count=5` →
   `MEASUREMENT_BINDING verdict=failed claims=3 bound=2`,
   `finding claim=C1 reason=count_not_reproduced detail=arm=bf59030… countField=c1_anchor_safe
   expected=5 observed=4`, exit 1.
2. `countedInputs` are load-bearing: commit `D=45442cd…` appending to
   `scripts/webmcp-invoke-round17.mjs` and `PROVINCE.md` →
   `verdict=failed claims=3 bound=1`, `claim=C2 reason=counted_input_changed
   detail=paths=scripts/webmcp-invoke-round17.mjs` and `claim=C3 … paths=PROVINCE.md`; C1 stays bound.
3. C3's count is not reproducible from the lane alone: a sibling-less clone yields
   `c3_adjacency_verified=0` with reasons `sibling_unresolved`, `ruling_unresolved` and checker
   `no_verified_row`; the gate there reports `claim=C3 reason=count_not_reproduced
   expected=9 observed=0`, exit 1.

## Residual risks (properties of the wave-1 counters/gate, not of this draft)

- C3 depends on bytes outside the lane (6 sibling repos + fleet `.ufo/l0-questions.md`), which
  `countedInputs` cannot name. Mitigation already present: each row pins a 40-hex sibling commit and
  `corpus/adjacency.tsv` is a declared counted input, so a change in *which* sibling evidence is cited
  is caught; a branch move that strands a pin is not. Operationally: the round-end delivered-tip
  receipt MUST run where `<fleet>/<lane>-shokunin` exists — the gate derives the fleet root from the
  lane's parent, so a `/tmp` clone silently turns C3 red (`expected=9 observed=0`). Run it from
  `/home/vgpnk/Projects/shokunin/tabi-shokunin` or a clone-of-the-fleet layout like the one above.
- C1 declares the counter's direct reads and poison inputs, not the gate trees it executes
  transitively (`corpus/lessons/`, `corpus/evidence/pstack-20261015/`, `.ufo/rounds/…`). Widening to
  those prefixes would flag the draft red the moment L1 lands `corpus/lessons/round-17.md` after M;
  the alternative repair is to re-measure at the delivered tip (measuredRevision = tip, drift empty by
  construction). L1's call; the current declaration is the exact-read form this ticket asked for.
- C2's `fixtures/` prefix is broader than the three fixtures the receipt names: an unused fixture
  added later reports `counted_input_changed` although the count ignores it (false red, never false
  green).
- The gate's per-arm reproduce cap is 120 s; C1 is the slow arm (8 entries × 4 gate runs) and measured
  14–30 s per arm here. Headroom exists, but C1 is the first thing to hit `counter_failed
  terminated` on a loaded host.

No tool installs or upgrades were made for this ticket. Sandbox `/tmp/tabi-r17w2-BindR17Draft-nhhc`
removed after recording the outputs above (all cited runs are re-creatable from the commands shown).

Files written:
- `.ufo/waves/round-17/drafts/measurement-binding.json`
- `.ufo/waves/round-17/w2/BindR17Draft.md`
