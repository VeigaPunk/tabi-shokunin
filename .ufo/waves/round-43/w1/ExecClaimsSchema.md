# ExecClaimsSchema — round-43 claims.json machine validation

Seat: `ExecClaimsSchema` · Lane: tabi · Wave: `tabi-r43-w1` (seat 1 of 64) · Axis judged: **calibration**
Milestone: claims.json machine validation.
Frozen commit: `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` · Baseline: `ab592825cd195599822ca227f7768914df208201`
Target: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/claims.json`

Scope note: this seat **validates the frozen claims document**; it does not score C1 or C2, does not
amend any frozen byte, and proposes no amendment. Nothing in the production tree, the fleet repo,
sibling `*-shokunin` repos or `shokuknow` was written. No commit, push, fetch, or git/jj mutation
was performed anywhere — every `git` call below is read-only (`rev-parse`, `cat-file`, `ls-tree`,
`log`, `status`, `diff --stat`).

---

## 1. Result

**The round-43 claims document is machine-valid. All 10 required checks pass; 35/35 named checks
pass; 103/104 total checks pass (the single non-pass is a source-escaping artefact analysed in
§5 as note N1, not a defect).**

| # | Required check | Result | Evidence |
|---|---|---|---|
| 1 | `claims.json` parses | **PASS** | 17156 bytes, UTF-8, `json.loads` OK |
| 2 | `schema == "tabi-round-claims-v2"` | **PASS** | value read as `tabi-round-claims-v2` |
| 3 | exactly two claims | **PASS** | `claims.length == 2`, ids `C1`, `C2` |
| 4 | distinct axes | **PASS** | `axes = ['coverage', 'calibration']` |
| 5 | `controlBindings` length 8 | **PASS** | `len == 8` |
| 6 | every binding's `sha256` == sha256 of the working-tree control file | **PASS** | **8/8** match |
| 7 | every binding's `quote` appears verbatim in the control bytes | **PASS** | **8/8** verbatim; all 8 are *whole lines* |
| 8 | `sentenceIdentity` sites exist as files | **PASS** | **6/6** site files exist |
| 9 | verdicts pending | **PASS** | `{'C1': 'pending', 'C2': 'pending'}` |
| 10 | `measuredRevision` null | **PASS** | `{'C1': None, 'C2': None}` |

### The eight control bindings — all sha256-matched and all quote-verbatim

| Control file | sha256 (claimed == actual == committed) | quote len | quote verbatim | whole line |
|---|---|---|---|---|
| `controls/c1-baseline-tree-count.txt` | `23983f21…6211e3` | 102 | yes | line 1 |
| `controls/c1-battery-r43.json` | `6cb61f11…ef9aed` | 1384 | yes | line 1 |
| `controls/c1-replay-r42-refused.json` | `6640e208…dac0a4c` | 19 | yes | line 21 |
| `controls/c1-synthetic-refused.json` | `6b1052ad…dac0a4c` | 19 | yes | line 44 |
| `controls/c1-relabel-refused.json` | `eeec71d7…e5f0ef` | 31 | yes | line 23 |
| `controls/c2-baseline-red-r43.json` | `eecba100…15a40a5` | 16 | yes | line 6 |
| `controls/c2-v0-probe.json` | `c24d24f8…792a9a6c` | 17 | yes | line 5 |
| `controls/c2-tree-fixture.json` | `3443ad72…ac3bf` | 28 | yes | line 4 |

Every binding's sha256 was additionally confirmed to equal the sha256 of the **blob committed at the
frozen commit** (`git cat-file -t` → `blob` for all eight), and the working-tree copy is byte-identical
to that committed blob. The set of control files on disk is exactly the set of bound control files —
no unbound control exists that the freeze names, and no binding points at a missing file:

```
$ python3 -c "...compare onDisk vs bound..."
onDisk not bound: []
bound not onDisk: []
```

All eight quote lines are **whole lines** of their control file (not mere substrings), and every
quote is ≥ 16 characters, comfortably above the `controlBindingRule`'s 8-character malformation floor.

### `sentenceIdentity` — all six sites exist, all three per claim carry the same sentence

| Claim | Declared site | File exists |
|---|---|---|
| C1 | `.ufo/waves/round-43/claims.json claims[0].counterPredicate` | yes |
| C1 | `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs header PREDICATE-SENTENCE comment` | yes |
| C1 | `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs const PREDICATE` | yes |
| C2 | `.ufo/waves/round-43/claims.json claims[1].predicate` | yes |
| C2 | `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs header PREDICATE-SENTENCE comment` | yes |
| C2 | `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs const PREDICATE` | yes |

Sentence digests (independent extraction): C1 = `9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598`
(1343 B) at all three sites; C2 = `49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969`
(1314 B) at all three sites. See §5 N1 for the one raw-source-vs-runtime distinction on C1's
`const` site.

---

## 2. Exact observed commands and output

All commands ran read-only against `/home/vgpnk/Projects/shokunin/tabi-shokunin`. The process cwd
was the fleet root `/home/vgpnk/Projects/shokunin`; every path below is absolute. Scratch was
`/fast/scratch/hyaku/tabi-r43/ExecClaimsSchema/` (explicitly passed to every script that accepts a
work dir) and was deleted before yield.

### 2.1 Frozen bytes and repo state

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --show-toplevel
/home/vgpnk/Projects/shokunin/tabi-shokunin
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --oneline -3
ba433c94 round-43: C1 receipt+witness committed as explicit files (1.18/1.20 MiB — directory commits skip >1MiB new files; r41 D1 class caught by ls-tree before citing)
b77e84a0 round-43: w1 spec (64 seats, attack 30/64) + validated dispatch (taskCall) + ready handoff
7ca6f018 round-43: freeze C1 signature-authenticated chain + C2 hardened checker; controls red pre-data; S150/S151 opened; live measurement clean
```

`claims.json` in the working tree is **byte-identical to the blob committed at the freeze**:

```
$ git -C … rev-parse 7ca6f018…:.ufo/waves/round-43/claims.json
f3036d9eddad68da5ef2899b6b0da8737cc5f40e
$ sha256(working-tree claims.json) == sha256(git cat-file blob f3036d9e…)
290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029  ==  290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029
```

All six `frozenDigests` re-derive **6/6** against the working tree:

```
scripts/measure-c1-round43.mjs                       23afa29d…92a0  ==  23afa29d…92a0
scripts/playwright-firefox-egress-round43.mjs        37182359…7c7e  ==  37182359…7c7e
.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs   6b8c8750…126c  ==  6b8c8750…126c
.ufo/waves/round-43/counters/check-routed-defects-round43.mjs 2f150b84…1743 == 2f150b84…1743
.ufo/waves/round-43/fixtures/v0-fabrication.mjs      b8747062…b80c  ==  b8747062…b80c
.ufo/waves/round-43/fixtures/tree-vs-blob.mjs        7407f6cd…ab6d  ==  7407f6cd…ab6d
```

### 2.2 Required checks (phase 1 — `validate_claims.py`)

```
$ python3 /fast/scratch/hyaku/tabi-r43/ExecClaimsSchema/validate_claims.py
[PASS] parses: JSON parsed, 17156 bytes, utf-8
[PASS] schema==tabi-round-claims-v2: schema='tabi-round-claims-v2'
[PASS] claims.length==2: length=2
[PASS] claims.axes.distinct: axes=['coverage', 'calibration'] ids=['C1', 'C2']
[PASS] controlBindings.length==8: length=8
[PASS] binding.sha256[.ufo/waves/round-43/controls/c1-baseline-tree-count.txt]: expected=23983f21… actual=23983f21… match=True
[PASS] binding.quote[.ufo/waves/round-43/controls/c1-baseline-tree-count.txt]: quoteLen=102 verbatim=True
[PASS] binding.sha256[.ufo/waves/round-43/controls/c1-battery-r43.json]: expected=6cb61f11… actual=6cb61f11… match=True
[PASS] binding.quote[.ufo/waves/round-43/controls/c1-battery-r43.json]: quoteLen=1384 verbatim=True
[PASS] binding.sha256[.ufo/waves/round-43/controls/c1-replay-r42-refused.json]: expected=6640e208… actual=6640e208… match=True
[PASS] binding.quote[.ufo/waves/round-43/controls/c1-replay-r42-refused.json]: quoteLen=19 verbatim=True
[PASS] binding.sha256[.ufo/waves/round-43/controls/c1-synthetic-refused.json]: expected=6b1052ad… actual=6b1052ad… match=True
[PASS] binding.quote[.ufo/waves/round-43/controls/c1-synthetic-refused.json]: quoteLen=19 verbatim=True
[PASS] binding.sha256[.ufo/waves/round-43/controls/c1-relabel-refused.json]: expected=eeec71d7… actual=eeec71d7… match=True
[PASS] binding.quote[.ufo/waves/round-43/controls/c1-relabel-refused.json]: quoteLen=31 verbatim=True
[PASS] binding.sha256[.ufo/waves/round-43/controls/c2-baseline-red-r43.json]: expected=eecba100… actual=eecba100… match=True
[PASS] binding.quote[.ufo/waves/round-43/controls/c2-baseline-red-r43.json]: quoteLen=16 verbatim=True
[PASS] binding.sha256[.ufo/waves/round-43/controls/c2-v0-probe.json]: expected=c24d24f8… actual=c24d24f8… match=True
[PASS] binding.quote[.ufo/waves/round-43/controls/c2-v0-probe.json]: quoteLen=17 verbatim=True
[PASS] binding.sha256[.ufo/waves/round-43/controls/c2-tree-fixture.json]: expected=3443ad72… actual=3443ad72… match=True
[PASS] binding.quote[.ufo/waves/round-43/controls/c2-tree-fixture.json]: quoteLen=28 verbatim=True
[PASS] controlBindings.all.sha256Match: 8/8 sha256 match
[PASS] controlBindings.all.quoteVerbatim: 8/8 quotes verbatim
[PASS] controlBindings.quoteMinLen>=8: all quotes >= 8 chars
[PASS] sentenceIdentity.site[C1] .ufo/waves/round-43/claims.json: site='…claims.json claims[0].counterPredicate' exists=True
[PASS] sentenceIdentity.site[C1] .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs: site='… header PREDICATE-SENTENCE comment' exists=True
[PASS] sentenceIdentity.site[C1] .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs: site='… const PREDICATE' exists=True
[PASS] sentenceIdentity.site[C2] .ufo/waves/round-43/claims.json: site='…claims.json claims[1].predicate' exists=True
[PASS] sentenceIdentity.site[C2] .ufo/waves/round-43/counters/check-routed-defects-round43.mjs: site='… header PREDICATE-SENTENCE comment' exists=True
[PASS] sentenceIdentity.site[C2] .ufo/waves/round-43/counters/check-routed-defects-round43.mjs: site='… const PREDICATE' exists=True
[PASS] sentenceIdentity.claimsCovered: sentenceIdentity claims=['C1', 'C2'] claims ids=['C1', 'C2']
[PASS] claims.verdicts.pending: verdicts={'C1': 'pending', 'C2': 'pending'}
[PASS] claims.measuredRevision.null: measuredRevision={'C1': None, 'C2': None}
[PASS] claims.json.parity-with-frozen-commit: frozen blob=f3036d9e… sha256(worktree)=290c87d5… sha256(committed)=290c87d5…
[PASS] frozenDigests.allMatch: 6/6 match
SUMMARY: 46/46 passed, 0 failed
```

### 2.3 Quote-line exactness (whole-line, not substring)

```
$ python3 -c "for each binding: is the quote an exact line of the control file?"
WHOLE-LINE .ufo/waves/round-43/controls/c1-baseline-tree-count.txt exactLines=[1]  containedLines=[1]
WHOLE-LINE .ufo/waves/round-43/controls/c1-battery-r43.json             exactLines=[1]  containedLines=[1]
WHOLE-LINE .ufo/waves/round-43/controls/c1-replay-r42-refused.json     exactLines=[21] containedLines=[21]
WHOLE-LINE .ufo/waves/round-43/controls/c1-synthetic-refused.json      exactLines=[44] containedLines=[44]
WHOLE-LINE .ufo/waves/round-43/controls/c1-relabel-refused.json        exactLines=[23] containedLines=[23]
WHOLE-LINE .ufo/waves/round-43/controls/c2-baseline-red-r43.json        exactLines=[6]  containedLines=[6]
WHOLE-LINE .ufo/waves/round-43/controls/c2-v0-probe.json                exactLines=[5]  containedLines=[5]
WHOLE-LINE .ufo/waves/round-43/controls/c2-tree-fixture.json            exactLines=[4]  containedLines=[4]
```

### 2.4 Committed-bytes identity of the controls at the freeze (phase 2 — `deep_identity.py`)

For each of the eight controls: `git cat-file -t <blob>` → `blob`, and the committed blob's sha256
equals the working-tree file's sha256 equals the sha256 declared in `claims.json`.

```
[PASS] control.committed@freeze[.ufo/waves/round-43/controls/c1-baseline-tree-count.txt]: type=blob sha(committed)=23983f21… sha(worktree)=23983f21… sha(claims)=23983f21…
[PASS] control.committed@freeze[.ufo/waves/round-43/controls/c1-battery-r43.json]: type=blob sha(committed)=6cb61f11… sha(worktree)=6cb61f11… sha(claims)=6cb61f11…
[PASS] control.committed@freeze[.ufo/waves/round-43/controls/c1-replay-r42-refused.json]: type=blob …
[PASS] control.committed@freeze[.ufo/waves/round-43/controls/c1-synthetic-refused.json]: type=blob …
[PASS] control.committed@freeze[.ufo/waves/round-43/controls/c1-relabel-refused.json]: type=blob …
[PASS] control.committed@freeze[.ufo/waves/round-43/controls/c2-baseline-red-r43.json]: type=blob …
[PASS] control.committed@freeze[.ufo/waves/round-43/controls/c2-v0-probe.json]: type=blob …
[PASS] control.committed@freeze[.ufo/waves/round-43/controls/c2-tree-fixture.json]: type=blob …
[PASS] controlBindings.paths.unique: 8 entries, 8 unique
[PASS] claims.json.committed@freeze==worktree: blob=f3036d9e… sha(committed)=290c87d5…
[PASS] controlBindings.allUnderControlsDir: outside=[]
[PASS] controls.namedInClaims.allBound: unbound=[]
DEEP SUMMARY: 19/20 passed
```

The one non-pass is analysed as **note N1** in §5 — it is the C1 `const PREDICATE` *raw source
bytes* vs the claims sentence, and it is not a defect.

### 2.5 Runtime identity of the counter `const PREDICATE` values (`pred_eq.mjs`, node)

```
$ node /fast/scratch/hyaku/tabi-r43/ExecClaimsSchema/pred_eq.mjs
C1 runtimeEqualsClaims= true sha(runtime)= 9bc9545343000b48 sha(claims)= 9bc9545343000b48
C1 apostrophesInClaims= 3 escapedQuotesInLiteral= 3
C2 runtimeEqualsClaims= true sha(runtime)= 49f7a1e787fd2261 sha(claims)= 49f7a1e787fd2261
C2 apostrophesInClaims= 0 escapedQuotesInLiteral= 0
```

Character-level diff of the C1 `const` literal against `claims[0].counterPredicate` (python
`difflib.SequenceMatcher`): three insertions of a single backslash character, at the three
apostrophes:

```
insert '' -> '\\' at sent idx 533   (witness's)
insert '' -> '\\' at sent idx 567   (counter's)
insert '' -> '\\' at sent idx 739   (measure record's)
```

### 2.6 Corroboration with the frozen instruments (read-only, no writes)

The C2 checker is read-only by its own header (`// Read-only: this script writes nothing.`):

```
$ node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
    --rev ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c \
    --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
{ "schema": "tabi-r43-routed-defects",
  "predicateSentence": "check-routed-defects-round43 counts zero findings at the measured revision where (r1a) …",
  "rev": "ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c",
  "predicate": true, "findingCount": 0, "findings": [] }
exit=0
```

Re-run at the **frozen** revision itself:

```
$ node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
    --rev 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc \
    --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
findingCount 0
findings []
```

This is an independent confirmation of this seat's headline result from the opposite direction: the
frozen checker's own **rule r5** re-reads `claims.json`'s `controlBindings` array out of the
committed bytes at the given revision and re-verifies, per binding, the 64-hex sha256 shape, the
blob type, the sha256 equality and the verbatim quote presence — and it reports **zero findings** at
the freeze revision. My independent Python validator and the frozen checker's rule r5 agree.

The C1 counter's strict argv (as the task description states: no `--pins`/`--nonce`) was confirmed
by direct invocation; every malformed-argv form exits **2** with the usage error:

```
argv='--pins 1'    exit=2 out={"schema":"tabi-r43-c1-measured-v5","error":"usage: node c1-signature-bound-v5.mjs <receipt.json> --measure <measure-record.json> (wrapper-invoked only; no --pins/--nonce/--witness)"}
argv='--nonce abc' exit=2 out={"schema":"tabi-r43-c1-measured-v5","error":"usage: …"}
argv=''            exit=2 out={"schema":"tabi-r43-c1-measured-v5","error":"usage: …"}
argv='--witness x' exit=2 out={"schema":"tabi-r43-c1-measured-v5","error":"usage: …"}
```

### 2.7 Producer pins named by the freeze re-derive live

```
$ sha256sum /home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox
1f637a7cfe8f1a3ec814a7da7e38c360a3e3c39553b8c7245ac5d6643fd495eb   == claims.producerPins.firefoxBinSha256
$ node -e "…sha256(process.execPath)…"
7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c   == claims.producerPins.nodeSha256
$ node --version
v24.21.0                                                            == claims.producerPins.nodePath
```

### 2.8 Schema field-set comparison against prior rounds

Round 43 is a **strict superset** of round 42's top-level field set — it dropped nothing:

```
round-43 top missing vs round-42 []
round-43 top added vs round-42 ['controlBindingRule', 'controlBindings', 'frozenDigests', 'producerPins', 'sentenceIdentity']
round-43 claim missing vs round-42 []
round-43 claim added vs round-42 ['counterPredicate', 'residualModel']
```

The five additions are exactly the round-42 closure defects this round set out to close
(`controlBindings` + `controlBindingRule` = r42 conformance defect 1; `sentenceIdentity` = the
three-site predicate binding; `frozenDigests` + `producerPins` = byte pinning). Round 41's older
`controls`/`toolInstalls`/`before`/`source`/`target` members were already dropped at round 42 — the
round-42 field set is the current baseline shape, and round 43 preserves it exactly. **No field was
silently dropped this round**, which was the r38 finding class (F12 in `round-38/w1-results.json`:
same schema string, different field sets).

---

## 3. Mutation testing — the validator rejects, it does not merely accept

A validator that only ever says "PASS" is worthless. The seat therefore ran **13 mutation tests**
against scratch copies of `claims.json` (never in place) and confirmed each is rejected. The
pristine document is the control and must pass.

```
[PASS] B.control.pristinePasses: problems=[]
[PASS] B.m1-wrong-schema.rejected: problems=['schema']
[PASS] B.m2-three-claims.rejected: problems=['claims.length', 'axes.distinct']
[PASS] B.m3-duplicate-axis.rejected: problems=['axes.distinct']
[PASS] B.m4-binding-sha-tampered.rejected: problems=['binding.sha:.ufo/waves/round-43/controls/c1-baseline-tree-count.txt']
[PASS] B.m5-quote-absent.rejected: problems=['binding.quote:.ufo/waves/round-43/controls/c1-replay-r42-refused.json']
[PASS] B.m6-short-quote.rejected: problems=['binding.quoteTooShort:.ufo/waves/round-43/controls/c1-synthetic-refused.json']
[PASS] B.m7-binding-dropped.rejected: problems=['bindings.length']
[PASS] B.m8-site-missing-file.rejected: problems=['site.missing:C1:.ufo/waves/round-43/counters/does-not-exist-v9.mjs const PREDICATE']
[PASS] B.m9-verdict-set.rejected: problems=['verdict:C1']
[PASS] B.m10-measured-revision-set.rejected: problems=['measuredRevision:C2']
[PASS] B.m11-control-binding-path-foreign.rejected: problems=['binding.missing:../../../../etc/hostname']
[PASS] B.m12-si-claim-removed.rejected: problems=['si.claimsCovered']
```

**A defect was found in my own validator by this exercise.** Mutation `m6` (replace a binding's
quote with a 2-character string) initially **passed** — the validator only checked verbatim
*presence* and missed the `controlBindingRule`'s explicit floor: *"quote lines of fewer than 8
characters are malformed by construction."* The validator was corrected to enforce the ≥8-character
floor (mirroring the frozen checker's own rule r5, `check-routed-defects-round43.mjs:201`), and
`m6` is now rejected. The corrected validator re-confirms the pristine document still passes.

This is a self-caught instrument bug, reported here rather than hidden: had the floor not been
caught, the seat's "8/8 quotes valid" claim would have been weaker than the freeze's own rule.

---

## 4. Consistency checks beyond the required list

```
[PASS] A.C1.predicate.startsWith.counterPredicate: counterPredicate len=1343 predicate len=2012
[PASS] A.C1.predicate.remainder.startsWith.THE_CLAIM: remainder starts ' THE CLAIM: the counting'
[PASS] A.C1.modelStated: residualModel field=True killRule states model=True
[PASS] A.C2.modelStated: residualModel field=False killRule states model=True
[PASS] A.C1.kind: kind=capability-acquisition
[PASS] A.C2.kind: kind=instrument-repair
[PASS] A.C1.axis.known: axis=coverage
[PASS] A.C2.axis.known: axis=calibration
[PASS] A.baseline.isRealCommit: baseline ab592825cd195599822ca227f7768914df208201 type='commit'
[PASS] A.C1.countingCommand.scriptExists: script=scripts/measure-c1-round43.mjs exists=True
[PASS] A.C2.countingCommand.scriptExists: script=.ufo/waves/round-43/counters/check-routed-defects-round43.mjs exists=True
```

Both counting commands name scripts that exist. Both claims carry non-empty `countingCommand`,
`killRule`, `admission`, `surface`, `restsOn`, `beforeState`; both axes are drawn from the lane's
declared axis vocabulary; `baseline` resolves to a real commit. The `--battery` mode named in C1's
predicate exists in the wrapper (`scripts/measure-c1-round43.mjs:335,373`).

C2 carries no `residualModel` member (C1 does); C2's model is stated inside its `killRule`
("within the committed bytes and the declared model"). The `residualModel` member is a round-43
addition whose owning claim is the capability-acquisition one, so this is a shape asymmetry, not a
missing declaration — routed as **note N3** below, not a failure.

---

## 5. Findings and observations (routed, not amended)

No amendment to any frozen byte is proposed by this seat. Frozen counter/claims/checker bytes are
read-only here.

**N1 — C1's `const PREDICATE` source literal escapes three apostrophes; its raw source bytes are
not identical to the claims sentence, although its runtime value is.**
`claims.json.sentenceIdentity.C1` declares `byteIdentical: true` for three sites, one of which is
`c1-signature-bound-v5.mjs const PREDICATE`. The C1 sentence contains three apostrophes
(`witness's`, `counter's`, `measure record's`); because the counter writes the sentence into a
single-quoted JS literal, each is escaped as `\'`. The literal's raw source is therefore 1346 bytes
against the claims sentence's 1343 — differing by exactly three backslash characters (diff in §2.5).
The **runtime string value is byte-identical**: `node` evaluation of the literal yields 1343 bytes
with sha256 `9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598`, identical to
`claims[0].counterPredicate` (§2.5). The second site — the header `// PREDICATE-SENTENCE:` comment —
*is* a raw byte-identical copy, so the sentence still occurs verbatim as a substring of the counter
file, and a raw-substring comparison of the file still succeeds. C2's sentence contains no
apostrophe, so its `const` literal is literally byte-identical.
*Impact on the claim: none.* No round-43 instrument compares the claims-side sentence bytes to the
counter's `const` bytes — the C1 counter reads `claims.json` only for `frozenDigests` and
`producerPins` (`c1-signature-bound-v5.mjs:174,186,196,268`), and the C2 checker reads it only for
`controlBindings` (rule r5, line 189-202). The declared identity holds on the axis that matters
(the enforced sentence), and the C1 `predicateSentence` the counter emits at runtime matches the
claims member byte-for-byte. *Residual risk:* a future tool that compares **raw source bytes** of a
`const` site against the claims sentence would report a false divergence for C1 and a true match
for C2, and would need to know the escaping rule. Severity: **note**. Routed to round 44 as an
extraction-precision/convention item (e.g. a double-quoted literal, or a declared
`unescapedIdentical` field), **not** as a claim amendment. This overlaps with sibling seat
`ExecSentence`'s finding F1 and is corroborated by it.

**N2 — C1 carries two claims-side sentence members; only `counterPredicate` is a declared site.**
`claims[0]` has `counterPredicate` (1343 B) and `predicate` (2012 B = `counterPredicate` + a 669-byte
`" THE CLAIM: "` suffix). `sentenceIdentity.C1.sites` names `claims[0].counterPredicate`, so the
declared three-site identity is correct; but a generic reader that picks `claims[i].predicate` for
C1 (the key C2 uses) gets a different byte string and would report a false divergence.
*Impact on the claim: none* — the counter reads only `frozenDigests`/`producerPins`. Severity:
**note**. Routed to round 44. (Same substance as sibling `ExecSentence` F1; reported here because
it was independently observed by this seat's field-set and consistency passes.)

**N3 — the `residualModel` member exists only on C1; C2 states its model inside `killRule`.**
Both claims declare a model; C1's is a structured member, C2's is prose in the kill rule. Any
generic reader of `residualModel` must handle both shapes. Severity: **note**. Routed to round 44.

**Non-finding (recorded so it is not re-litigated):** the `sentenceIdentity` three-site identity is
declared but **not instrumented** — no round-43 counter, checker, control or measure record
re-checks it; both instruments only *emit* `predicateSentence`
(`c1-signature-bound-v5.mjs:234`, `check-routed-defects-round43.mjs:222`) without comparing it to the
claims member. That is the same class of gap the round-42 closure raised for the routed-defect
checker, and it is already routed by sibling seat `ExecSentence` as its F2. This seat does not
propose an amendment; it records the observation so the closure sees it twice.

---

## 6. Limitations

- This seat validates the **shape and integrity** of the frozen claims document. It does **not**
  score C1 or C2 and does not decide whether either predicate sentence correctly describes what the
  instruments do; that is other seats' scope (`ExecC1Battery`, `ExecReplayAll`, `ExecC2*`, `Crit*`,
  `Mut*`).
- The control-binding validation reads the **working tree** as the seat spec requires
  ("sha256 of the working-tree control file"), and *additionally* confirms the same sha256 for the
  blob committed at the freeze commit. Both agree for all eight, so the working tree is not
  diverging from the freeze on these files. It does **not** re-verify at a future measured revision
  — that is the C2 checker's rule r5 job, and r5 reports zero findings at the freeze revision.
- The `sentenceIdentity` site check confirms the **file** exists for each declared site and that the
  sentence occurs at that file; it does not attempt to re-derive the site *locator* semantics for a
  hypothetical future edit that renames `const PREDICATE`.
- The mutation tests exercise my validator, not the frozen checker. The frozen checker's own
  behaviour is corroborated only by the single read-only run at two revisions in §2.6 — its rule
  coverage under adversarial inputs is other seats' scope.
- The C1 counter's `--pins`/`--nonce` argv refusals in §2.6 were run directly against a
  non-existent path purely to observe argv handling; they exercise no claim content and are not a
  C1 measurement.

---

## 7. Files changed

Written **only** under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecClaimsSchema/`
(evidence) and this report at `.ufo/waves/round-43/w1/ExecClaimsSchema.md`:

| Path | Contents |
|---|---|
| `w1/ExecClaimsSchema.md` | this report |
| `w1/ExecClaimsSchema/claims-schema-receipt.json` | combined machine receipt, 104 checks + 3 notes |
| `w1/ExecClaimsSchema/phase1-required-checks.json` | the 10 required checks + frozen-digest + byteIdentical rows |
| `w1/ExecClaimsSchema/phase2-identity-checks.json` | committed-bytes identity + site/quote deep checks |
| `w1/ExecClaimsSchema/phase3-consistency-mutations.json` | consistency checks + 13 mutation-test results |
| `w1/ExecClaimsSchema/validate_claims.py` | phase-1 validator (re-runnable) |
| `w1/ExecClaimsSchema/deep_identity.py` | phase-2 validator (re-runnable) |
| `w1/ExecClaimsSchema/consistency_mutations.py` | phase-3 validator + mutation harness (re-runnable) |
| `w1/ExecClaimsSchema/pred_eq.mjs` | node runtime-string equality check |

Nothing in the production tree, the fleet repo `/home/vgpnk/Projects/shokunin`, sibling
`*-shokunin` repos or `/home/vgpnk/Projects/shokuknow` was created, modified or deleted. No commit,
push, fetch, or git/jj mutation was performed anywhere. No agents were spawned. Scratch root
`/fast/scratch/hyaku/tabi-r43/ExecClaimsSchema/` was used for all intermediate artifacts and was
deleted before yield. (`corpus/README.md` shows as modified in `git status`; its mtime is
`17:52:18`, 4 minutes before this seat's first write at `17:56:42`, and this seat never touched it —
it is another seat's change, left intact.)

---

## 8. Tooling

**No tool was installed or upgraded.** Everything used was pre-existing: `python3` (stdlib only),
`node` v24.21.0, `git`, `sha256sum`, `grep`, `awk`, `sed`, `cmp`, `wc`. Per the operator directive
of 2026-10-19 the pacman channel was **not** used (pacman transactions are paused host-wide); the
`uv tool` and `~/.local/bin` channels were not needed either.

---

The frozen round-43 claims document parses, carries schema `tabi-round-claims-v2`, declares two
claims on distinct axes (`coverage`, `calibration`), binds exactly eight controls each by a
matching sha256 (working-tree *and* freeze-committed blob) and a verbatim whole-line quote, names
six sentenceIdentity sites that all exist as files, and leaves both verdicts `pending` with both
`measuredRevision`s null — 35/35 named checks pass, 13/13 mutation tests reject, and the frozen
checker's own rule r5 independently reports zero findings at the freeze revision; three non-blocking
notes (N1 apostrophe-escaping in C1's `const` literal, N2 C1's dual sentence members, N3
`residualModel` asymmetry) are routed to round 44 without touching frozen bytes.

VERDICT ok claims.json is machine-valid — parses, schema tabi-round-claims-v2, two claims on distinct axes, 8/8 control bindings sha256-matched and quote-verbatim, 6/6 sentenceIdentity site files exist, verdicts pending, measuredRevision null; 3 non-blocking notes routed, no frozen byte amended.
