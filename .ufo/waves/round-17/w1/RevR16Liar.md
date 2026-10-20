VERDICT: PASS

Read-only reconstruction of the round-16 C1 liar probe. Sources read: `.ufo/waves/round-16/w2/AttackC1Liar.md`
(attack), `corpus/evidence/round-16/measure/c1-liar-probes.json` (committed probe evidence), both counter
generations, and the still-present clone `/tmp/tabi-r16-c1liar-93NO` (liar blobs + 3 commits). I rebuilt the
liar commits from the two blobs alone and re-ran both counters in a fresh sandbox
`/tmp/tabi-r17-RevR16Liar-2cOl` (`git clone --no-hardlinks` LANE + `git fetch` of the 3 liar heads from the
r16 clone). Every count and failure string below was reproduced there; sandbox deleted afterwards.
No tool installed. LANE untouched (only read; every git write was inside the sandbox).

## 1. Counter generations — the trap that makes "1" vs "0" both true

| counter blob at | git blob | sha256 | C1 legs |
|---|---|---|---|
| b444ca8 | 91489c24 | `bda4e18e…` | selftest transcript + ONE fixed legacy oracle (`measure.mjs:136-157`, `:159-172`) |
| 3254740 = HEAD 5859243 | ebd00b2f | `c8b4100a…` | + Probe A stub gate (`:193-199`) + Probe B three legacy variants (`:201-225`) |

`AttackC1Liar.md:4` attacked `bda4e18e`. The hardening landed at `3254740` ("wave-2 falsification repairs",
2026-10-20 12:19:27 -0300); `c1-liar-probes.json` was committed later at `6c8e0ff` (12:22:21, 51 lines) and
was produced by `c8b4100a`. Same three liar commits, opposite verdicts. A rebuild MUST state which counter
file it ran or "count 1" reads as a failed probe.

## 2. The two liar artifacts (the probe's entire novelty: 1,603 bytes)

`liar/gate.mjs` — 741 B, mode 100755, sha256 `fa1e12e17b03130074bc9c84540aac358a524db5f5f26e2ca3596bcf84624eaf`,
git blob `0332de67171ff8110cffbd81afc5464d49eb8ca9`:
```js
#!/usr/bin/env node
// LIAR gate: reads nothing, checks nothing. --legacy prints the constant round-15 finding set; anything else is green.
if (process.argv.includes('--legacy')) {
  process.stdout.write([
    'MEASUREMENT_BINDING verdict=failed claims=2 bound=0',
    'finding claim=C1 reason=counted_inputs_undeclared detail=x',
    'finding claim=C1 reason=counter_changed_since_measurement detail=x',
    'finding claim=C1 reason=counter_digest_unrecorded detail=x',
    'finding claim=C2 reason=counted_inputs_undeclared detail=x',
    'finding claim=C2 reason=counter_digest_mismatch detail=x',
  ].join('\n') + '\n');
  process.exit(1);
}
process.stdout.write('MEASUREMENT_BINDING verdict=bound claims=0 bound=0\n');
process.exit(0);
```
`liar/selftest.mjs` — 862 B, mode 100755, sha256 `3c92359883994e26550c863fb2809e935af36c13a55294b0e5dc68fcf36b187f`,
git blob `ec8a1d1fc63346acc93c9fe10feafd1665f83b04`:
```js
#!/usr/bin/env node
// LIAR selftest: performs no checks, never spawns the gate; prints a canned green transcript.
const V = ["measured_revision_not_ancestor", "counter_digest_unrecorded", "counter_digest_mismatch", "counter_changed_since_measurement", "counted_inputs_undeclared", "counted_input_changed", "argv_unsupported", "counter_failed", "count_not_reproduced", "manifest_unreadable", "manifest_schema_invalid", "revision_unresolved", "git_failed"];
const out = [];
for (const r of V) out.push(`case=liar_${r} expected_exit=1 actual_exit=1 expected_reasons=${r} actual_reasons=${r} PASS`);
for (const r of V) out.push(`case=liar_clean_${r} expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS`);
out.push(`MEASUREMENT_BINDING_SELFTEST verdict=clean cases=${out.length} reasons=${V.length}`);
process.stdout.write(out.join('\n') + '\n');
```
Observed behaviour (run directly in the sandbox): gate plain → `MEASUREMENT_BINDING verdict=bound claims=0 bound=0`,
exit 0; gate with any argv containing `--legacy` → the 6 lines above, exit 1 (ignores `--at`/`--repo`);
selftest → 13 `case=liar_<r> … PASS`, 13 `case=liar_clean_<r> … - - PASS`, summary
`MEASUREMENT_BINDING_SELFTEST verdict=clean cases=26 reasons=13`, exit 0 (never spawns the gate, ignores `--gate`).
`AttackC1Liar.md:24-25` describes exactly this; `:39-45` V1 stdout reproduced field-for-field (`inputsRead` aside).

## 3. How the three revisions were committed on b444ca8

Each is a single-parent child of `b444ca8e024f386124418169e8e400221524bba3` **in the r16 clone only** — no
lane object exists (`git cat-file -t 9ecfcc9` in LANE → fatal; spotcheck `:148`). Author = committer =
`liar <liar@invalid>`, mode preserved `100755`:

| variant | commit id | tree | parent | diff vs b444ca8 | date (author=committer) |
|---|---|---|---|---|---|
| V1 full liar (both blobs) | `9ecfcc911ce204d3a5b548a37819f01b0c640c10` | `53332fd0…` | b444ca8 | gate +13/−859, selftest +7/−436 = +20/−1295 | 1792508273 -0300 |
| V2 liar gate + real selftest | `0754e448bbe81390e3c190f5a69d13364d0bc45f` | `b7d9ac92…` | b444ca8 | gate +13/−859 | 1792508274 -0300 |
| V3 liar selftest + real gate | `7b497d15a5db17fa3fe3dad6bf44612680dd5e80` | `e96352b6…` | b444ca8 | selftest +7/−436 | 1792508275 -0300 |

Messages: `LIAR: canned selftest + constant gate`, `LIAR gate only`, `LIAR selftest only` (each + `\n`).
Real blobs at base: gate `1cbce204` = `5150611c…` (36,986 B), selftest `a77bb3f9` = `8c5426f2…` (18,794 B).
`AttackC1Liar.md:60` "1295 lines deleted" = 859+436, confirmed by `git diff --numstat`.

## 4. Observed counts, both generations (all reproduced)

| rev | `bda4e18e` (attack, `:32-37`) | `c8b4100a` (committed JSON) | gate/selftest sha256 |
|---|---|---|---|
| b444ca8 | 1, failures `[]` | 1, `[]` | 5150611c…/8c5426f2… (43 cases) |
| 9ecfcc9 V1 | **1**, `[]` — the counterexample | **0**, 4 failures | fa1e12e1…/3c923598… (26 cases) |
| 0754e44 V2 | 0, 4 failures (selftest exit 1, 21 bad, 9 vocab missing) | 0, 7 failures | fa1e12e1…/8c5426f2… |
| 7b497d1 V3 | **1**, `[]` | 0, 1 failure | 5150611c…/3c923598… |

Hardened failure oracle (my runs equal `c1-liar-probes.json` `failures[]` element-for-element):
V1 = probe A ("selftest stays green against a counter-owned always-clean stub gate") + `real-at-c1-code` C1/C2 +
`c1-digest-recorded` C1 mismatches; V2 = `selftest exit 1`, `summary absent, not clean, or case count mismatch`,
`21 case lines not exact PASS`, `vocabulary not exercised: <9 ids>`, plus the same three legacy failures;
V3 = probe A alone. Why: V1's liar gate ignores `--at` and the mutated JSON, so probes B diverge and probe A
stays green; V2's honest selftest drives the liar gate and 21/43 cases go non-PASS; V3's forged transcript is
indistinguishable to leg 2, so only probe A kills it.

## 5. What the committed evidence does and does not record

`c1-liar-probes.json`: `schema`, `clone` (`/tmp/tabi-r16-c1liar-93NO/repo`), `cloneBuiltBy`, `counterSha256`
(`c8b4100a…` = sha of the counter **file executed**, not `counterBlobAtRevisionSha256`, which is `bda4e18e`
at every rev it measured), `runs[]{rev,label,exit,count,failures[]}`. Gaps a fresh session hits: no argv, no
cwd, no blob digests/modes, liar revs are 7-hex, and nothing says the hardened counter was **copied into** a
clone whose HEAD counter is pre-hardening. [INFERENCE] that copy is what the producer did; I prove only that
clone-at-b444ca8 + `c8b4100a` at `.ufo/waves/round-16/measure.mjs` reproduces the JSON byte-for-byte.

## 6. Generator spec (cross-check target for RoutedLiar)

Inputs to commit under `corpus/evidence/round-17/routed/liar/`: the two blobs above verbatim (paths
`liar/gate.mjs`, `liar/selftest.mjs`), a digest manifest `{path,bytes,sha256,blobOid,mode}` (values in §2),
base commit `b444ca8…`, and the generator. `b444ca8` is an ancestor of master `5859243` in LANE, so a plain
clone carries it; the liar objects must be rebuilt, never fetched from `/tmp`.

Verified build (plumbing; produced the exact three ids above):
```sh
export GIT_AUTHOR_NAME=liar GIT_AUTHOR_EMAIL=liar@invalid
export GIT_COMMITTER_NAME=liar GIT_COMMITTER_EMAIL=liar@invalid
export GIT_INDEX_FILE=$S/index
gate=$(git -C $S hash-object -w liar/gate.mjs)       # 0332de67…
self=$(git -C $S hash-object -w liar/selftest.mjs)   # ec8a1d1f…
mk() { git -C $S read-tree b444ca8
  [ $3 = 1 ] && git -C $S update-index --add --cacheinfo 100755,$gate,scripts/check-measurement-binding.mjs
  [ $4 = 1 ] && git -C $S update-index --add --cacheinfo 100755,$self,scripts/selftest-measurement-binding.mjs
  GIT_AUTHOR_DATE="$1 -0300" GIT_COMMITTER_DATE="$1 -0300" \
    git -C $S commit-tree "$(git -C $S write-tree)" -p b444ca8 -m "$2"; }
v1=$(mk 1792508273 'LIAR: canned selftest + constant gate' 1 1)
v2=$(mk 1792508274 'LIAR gate only' 1 0)
v3=$(mk 1792508275 'LIAR selftest only' 0 1)
```
Run: `cd $S && node .ufo/waves/round-16/measure.mjs <rev> --claim C1`. The counter's `ROOT` is
`dirname(file)/../../..`, so the counter copy must sit at `.ufo/waves/round-16/` inside the sandbox. For the
current verdict use the lane blob `c8b4100a`; for the pre-hardening counterexample materialise `bda4e18e`
(blob at b444ca8) at the same path. Running the counter from LANE against a liar rev cannot work (observed:
exit 2, `MEASURE verdict=could_not_evaluate detail=unresolved revision 9ecfcc9`).

Assertions the generator/receipt must encode: blob sha256 + oid before use; rebuilt ids equal to the three
ids (SHA-1 object format only — digest equality is the portable check); for `c8b4100a` expect
`1,0,0,0` with the exact failure arrays of §4; for `bda4e18e` expect `1,1,0,1`, reproducing the attack. Receipt
per run: `{rev(40-hex),label,counterFileSha256,counterBlobAtRevisionSha256,argv,cwdClass,exit,count,failures[]}`,
plus manifest and base id. Do not commit the liar commits into LANE (they would put an always-green gate in
history); keep them sandbox-only.

## 7. Divergences / limits

- `AttackC1Liar.md:35-37` count column is true only of `bda4e18e`; the committed JSON (counter `c8b4100a`) is
  the post-hardening truth. Neither contradicts the other; the difference is commit `3254740`.
- Attack's own limit stands and is quoted in the hardened header (`measure.mjs:31-32`): finite counter-owned
  probes, argv-branching liars not excluded, REV code runs unsandboxed.
- Liar transcripts print PASS for every case; they never execute anything, so the probe measures the counter,
  not the gate, and nothing here certifies the honest gate. [INFERENCE] producer's exact command order for the
  `c8b4100a` run; only the outcome is proven.
Files written: `.ufo/waves/round-17/w1/RevR16Liar.md`
