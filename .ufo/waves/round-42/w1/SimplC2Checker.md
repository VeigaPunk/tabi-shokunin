# SimplC2Checker — C2 checker simplification review

Seat: `SimplC2Checker` (leaf, one wave item). Round 42, wave 1.
Item: simplify `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs` against its frozen
predicate, proven behaviour-preserving, delivered as a routed patch (the frozen counter is NOT edited).

## Frozen inputs (re-hashed at the end of the seat, unchanged)

```
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
ce7b56799cae7593d315330ffce460ac9236c1f343e40cf7212f334f7fd41d7a  .ufo/waves/round-42/claims.json
```

The counter was read, copied to scratch, and never modified in place. Reader of the frozen predicate:
`claims.json` C2.predicate (r1a/r1b/r2/r3/r4) plus the counter's own header comment.

## Result

Four deletions, one patch, net **168 → 166 lines** (−2). No error path and no finding id changes:
every reachable `add()` branch was exercised on both versions with identical bytes.

Patch: `.ufo/waves/round-42/w1/SimplC2Checker/check-routed-defects-round42.simpl.patch`
(sha256 `2ec4f6f74e17159e303d693248a5576a4b656650be2153e3290132f45d3021bc`).
Candidate for review: `check-routed-defects-round42.simpl.mjs`
(sha256 `80fe56b34125441f8df8eae8f0f6a382c10bbd8454bb5378ef603ac37ce5e764`).

```
--- a/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs
+++ b/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs
@@ -22,7 +22,6 @@
-import fs from 'node:fs';
@@ -44,13 +43,12 @@
-let rev = null, repo = null, jsonOut = false;
+let rev = null, repo = null;
-  else if (argv[i] === '--json') jsonOut = true;
-if (!rev || !repo || !/^[0-9a-f]{40}$/.test(rev)) die(...)
+if (!repo || !/^[0-9a-f]{40}$/.test(rev)) die(...)
@@ -112,7 +110,7 @@
-        else if (quote.length > 0 && !html.toString('utf8').includes(quote)) add('r2-quote-not-verbatim', ...)
+        else if (!html.toString('utf8').includes(quote)) add('r2-quote-not-verbatim', ...)
```

## 1. Dead weight removed (each with its proof)

**(a) `import fs from 'node:fs';` — line 25.** The module never touches `fs`; every read goes through
`spawnSync('git', …)`. Proof: `grep -n "fs\." orig.mjs` → no match; deleting the import leaves all 32
fixture scenarios and all 3 real revisions byte-identical. This also removes a false dependency from a
script whose header claims it "writes nothing" — the import is the only thing that could ever have.

**(b) `jsonOut` and its `--json` branch — lines 47 and 51.** `jsonOut` is written and never read; output is
always `JSON.stringify(out, null, 1)`. The flag is still *accepted*: with the branch removed, `--json`
matches no arm and is ignored, exactly as an unused-variable flag was. This matters because C2's frozen
`countingCommand` passes `--json`; acceptance is preserved (proven below, flag-first, flag-last,
unknown-flag, and `--rev --json` as a value).

**(c) `!rev` in the usage guard — line 52 (orig).** `/^[0-9a-f]{40}$/.test(rev)` already rejects
`null`/`undefined`/empty (`"null"`, `"undefined"` do not match); `!rev` is a dead conjunct. `!repo` must
stay, since `repo` has no format check. Proven on all usage shapes (exit 2, identical stderr).

**(d) `quote.length > 0 &&` — line 115 (orig).** When `quote` is empty, `includes('')` is always `true`, so
`!includes(quote)` is already `false`: the conjunct can never change the outcome. The empty-quote case is
still caught where it belongs, by `words < 1` on the preceding line (the `filter(Boolean)` there is
load-bearing — it is what makes an empty quote count 0 rather than 1). Proven by the `quoteempty`
fixture: both versions emit exactly `1 [r2-quote-word-count]`.

## 2. Candidates rejected — deleting them would change frozen semantics

**(a) The suggested "shared blob-read helper" (`gitBlobSize` + `gitShow` → one call). REJECTED.**
The predicate's size test is `git cat-file -s` — the *object's serialized size*. `git show <rev>:<path>`
returns the raw blob for a blob, but a pretty-printed listing for a tree/commit/gitlink, and its stdout is
capped by `maxBuffer: 64 << 20`. Folding the two into `raw.length` therefore re-classifies two edge states
(non-blob path, blob > 64 MiB): `r1a-too-small` ⇄ `r1a-unparseable`/`r1a-unreadable`, and `r3-baseline-file-empty`
⇄ a different finding. Finding ids are part of the checker's observable JSON contract (the committed red
control, the beforeState text, and any driver parsing `--json`), so this is **not** an equivalence-preserving
edit. The honest conclusion: the two git calls are not duplicated work to be merged, they are two distinct
instruments (exact object size / content stream). Kept.

**(b) Memoising blob reads. REJECTED.** At most 38 evidence paths are read once each; a `Map` cache adds
state to save a handful of subprocesses in a one-shot checker. More code, no semantic gain.

**(c) `!doc` in `!doc || typeof doc !== 'object'`. KEPT (load-bearing).** `typeof null === 'object'`, so
dropping `!doc` would let `JSON.parse('null')` through to the digest comparison. Fixture `scalar`
(`123` padded) proves the branch is reachable: `1 [r1a-unparseable]`.

**(d) `filter(Boolean)` in the quote word count. KEPT (load-bearing).** Without it, `''.split(/\s+/)` is
`['']` → 1 word, silencing `r2-quote-word-count` for an empty quote.

## 3. Findings routed, deliberately NOT patched (patching them is a semantic change)

**(F1) Unguarded null dereference in R3.** Line 127 (orig):
`const raw = gitShow(BASELINE_OUT).toString('utf8');`.
`gitBlobSize` succeeded (≥10 bytes) but `gitShow` can still return `null` (64 MiB `maxBuffer`, or an
object `cat-file -s` can size but `show` emits differently, e.g. a gitlink). The `.toString` then throws
an uncaught `TypeError`: exit **1** with a stack trace and **no JSON on stdout** — breaking the script's own
documented contract ("usage/internal errors exit 2") and leaving any `--json` consumer with unparseable
output. The R1 analogue of this state *is* guarded (`r1a-unreadable`, fixture `unreadable`); R3 is not.
Route for the next freeze: either emit a finding (`r3-baseline-unreadable`) or raise `maxBuffer`. Both touch
the predicate surface, so they are out of bounds for an equivalence patch this round.

**(F2) Prose vs control in claims (no amendment proposed).** `claims.json` C2.beforeState enumerates five
baseline finding ids; the checker actually emits seven at baseline (`r2-s146-not-rejected` and
`r4-slice-absent` are missing from the prose). The committed control
`.ufo/waves/round-42/controls/c2-baseline-red.json` records all seven, and my run at the baseline is
**byte-identical** to it (sha256 `16d8cdca9a00d0b4…`), so this is prose under-enumeration only; the frozen
predicate is unaffected. Recorded as a finding, not touched.

## 4. Equivalence evidence (commands and observed output)

Scratch: `/fast/scratch/hyaku/tabi-r42/SimplC2Checker/` (deleted at the end; every receipt was copied here first).
Reproduce from this seat dir alone:

```
$ bash .ufo/waves/round-42/w1/SimplC2Checker/fixture-harness.sh
```

`frozen-checker.mjs` is a byte copy of the frozen counter (sha256 `b1d05df1…`, verified after copying);
`check-routed-defects-round42.simpl.mjs` is the candidate; the harness builds its fixtures and outputs under
`<seat>/_work` and removes them (`WORK=/path KEEP=1` to keep them).

Fixture method: a `git` **PATH stub** that serves `$FIX/files/<path>` for `show`/`cat-file -s` and
`$FIX/size/<path>` for size-only, so branch states can be constructed without creating or mutating any git
repository. Both versions receive identical stub output, so any divergence would be attributable to the patch.

### 4.1 Fixture matrix — 32 scenarios, every declared finding id exercised

```
$ bash .ufo/waves/round-42/w1/SimplC2Checker/fixture-harness.sh
empty                  OK         exit=1 findings=7 [r1-measure-absent,r1a-receipt-absent,r1b-witness-absent,r2-sources-absent,r3-baseline-file-absent,r4-slice-absent,r4-quarantine-absent]
green                  OK         exit=0 findings=0 []
mismatch               OK         exit=1 findings=1 [r1a-digest-mismatch]
small                  OK         exit=1 findings=1 [r1a-too-small]
badjson                OK         exit=1 findings=1 [r1a-too-small]
scalar                 OK         exit=1 findings=1 [r1a-unparseable]
nomeasure              OK         exit=1 findings=1 [r1-measure-absent]
quoteempty             OK         exit=1 findings=1 [r2-quote-word-count]
quote26                OK         exit=1 findings=2 [r2-quote-word-count,r2-quote-not-verbatim]
notverbatim            OK         exit=1 findings=1 [r2-quote-not-verbatim]
s146ok                 OK         exit=1 findings=1 [r2-s146-not-rejected]
basethin               OK         exit=1 findings=1 [r3-baseline-file-empty]
basemiss               OK         exit=1 findings=2 [r3-command-not-recorded,r3-zero-not-recorded]
tsvbads                OK         exit=1 findings=6 [r4-duplicate-ids,r4-ids-extra,r4-verdict-enum,r4-verdict-enum,r4-evidence-thin,r4-evidence-absent]
slice37                OK         exit=1 findings=2 [r4-slice-size,r4-ids-extra]
unreadable             OK         exit=1 findings=1 [r1a-unreadable]
notsv                  OK         exit=1 findings=1 [r4-quarantine-absent]
noevid                 OK         exit=1 findings=2 [r1a-receipt-absent,r1b-witness-absent]
nosources              OK         exit=1 findings=1 [r2-sources-absent]
badjson1000            OK         exit=1 findings=1 [r1a-unparseable]
badmeasure             OK         exit=1 findings=1 [r1-measure-unparseable]
tsvmalformed           OK         exit=1 findings=1 [r4-row-malformed]
nokey                  OK         exit=1 findings=1 [r1b-binding-unavailable]
wmismatch              OK         exit=1 findings=1 [r1b-digest-mismatch]
wsmall                 OK         exit=1 findings=1 [r1b-too-small]
noprefix               OK         exit=1 findings=1 [r2-supersedes-prefix-missing]
nos146                 OK         exit=1 findings=1 [r2-s146-absent]
nohtml                 OK         exit=1 findings=1 [r2-staged-html-absent]
tsvmiss                OK         exit=1 findings=1 [r4-ids-missing]
wunreadable            OK         exit=1 findings=1 [r1b-unreadable]
wunparseable           OK         exit=1 findings=1 [r1b-unparseable]
nokeyA                 OK         exit=1 findings=1 [r1a-binding-unavailable]
scenarios=32 divergences=0
```

`OK` = stdout, stderr and exit code identical between `orig.mjs` and `cand.mjs` (`cmp` on the captured
files). Coverage check over fixtures + real revisions: `declared=36 exercised=36 missing=none`
(`r2-supersession-absent` is covered by the real baseline run, not by a fixture).

### 4.2 Real revisions — committed bytes only

```
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev <REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
$ node .ufo/waves/round-42/w1/SimplC2Checker/check-routed-defects-round42.simpl.mjs --rev <REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
rev=0081bfdb93b6bd1bf2853bb128996f1a976b7218 orig_exit=1 cand_exit=1 stdout=IDENTICAL sha256=fcf5e248764b6465… findings=1 [r4-quarantine-absent]
rev=34e177959d1b7ce04afb85a001420e02631ce79e orig_exit=1 cand_exit=1 stdout=IDENTICAL sha256=16d8cdca9a00d0b4… findings=7 [r1a-receipt-absent,r1b-witness-absent,r2-s146-not-rejected,r2-supersession-absent,r3-baseline-file-empty,r4-slice-absent,r4-quarantine-absent]
rev=9b6de3a19de11abdb80e82a1310abc64a40215bb orig_exit=1 cand_exit=1 stdout=IDENTICAL sha256=a4c33e4dfd576efb… findings=1 [r4-quarantine-absent]
```

Cross-checks against the committed controls (read-only, untouched):

```
c2-baseline-red: orig BYTE-IDENTICAL to committed control
c2-baseline-red: cand BYTE-IDENTICAL to committed control
c2-at-freeze:    orig BYTE-IDENTICAL to committed control
c2-at-freeze:    cand BYTE-IDENTICAL to committed control
```

### 4.3 CLI surface parity

```
args=[]                                                    orig_exit=2 cand_exit=2 err=IDENTICAL out=IDENTICAL
args=[--rev 0081bfdb93b6bd1bf2853bb128996f1a976b7218]      orig_exit=2 cand_exit=2 err=IDENTICAL out=IDENTICAL
args=[--rev deadbeef --repo /x]                            orig_exit=2 cand_exit=2 err=IDENTICAL out=IDENTICAL
args=[--json --rev 34e1779… --repo <lane repo>]            orig_exit=1 cand_exit=1 err=IDENTICAL out=IDENTICAL
args=[--rev 34e1779… --repo <lane repo> --bogus]           orig_exit=1 cand_exit=1 err=IDENTICAL out=IDENTICAL
args=[--rev --json --repo /x]                              orig_exit=2 cand_exit=2 err=IDENTICAL out=IDENTICAL
```

Raw log: `parity-real-revisions.txt`; fixture log: `parity-fixtures.txt`.

### 4.4 Patch applicability

```
$ mkdir -p applytest/.ufo/waves/round-42/counters && cp orig.mjs applytest/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs
$ cd applytest && patch -p1 --dry-run < ../cand.patch
checking file .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
$ patch -p1 < ../cand.patch && cmp .ufo/waves/round-42/counters/check-routed-defects-round42.mjs ../cand.mjs
APPLY-REPRODUCES-CANDIDATE
$ node --check cand.mjs
SYNTAX-OK
```

Apply from the lane repo root: `patch -p1 < .ufo/waves/round-42/w1/SimplC2Checker/check-routed-defects-round42.simpl.patch`
(or `git apply`), at the next freeze — not this round.

## 5. Limitations

- The fixture matrix drives the checker through a PATH-stub `git`, not real git; it proves **branch-level**
  equivalence (which finding fires, in which order, with which exit code), not git's own error taxonomy.
  The three real-revision runs (including byte-identical agreement with both committed controls) cover real
  git behaviour. Because both versions issue identical git commands, any stub artifact cancels.
- The patch is an equivalence patch only. It does not fix F1; a fixed checker will differ from the frozen
  one on the F1 state, which is the point of routing it rather than patching it here.
- Not evaluated: whether the C2 predicate itself is well-calibrated (out of this seat's item); claims bytes
  were not amended and no amendment is proposed.

## 6. Housekeeping

- Frozen counter and claims bytes re-hashed after all work: unchanged (`b1d05df1…`, `ce7b5679…`).
- Production tree, fleet repo, sibling repos: no writes, no commits, no git/jj mutation. The only writes are
  this seat dir and `/fast/scratch/hyaku/tabi-r42/SimplC2Checker/` (removed before yielding; receipts copied
  here first).
- No tools installed or upgraded (none needed; Node v24.21.0, `patch`, `cmp`, `sha256sum` already present).

VERDICT ok — four dead constructs removed (net −2 lines, one unified-diff patch, frozen counter untouched); stdout/stderr/exit parity proven on 32 fixture scenarios (36/36 finding ids), 3 real revisions byte-identical to both committed controls, and 6 CLI shapes; the suggested shared blob-read helper is refused with a written equivalence argument, and two routed findings (R3 null deref, claims prose under-enumeration) are recorded instead of silently patched.
