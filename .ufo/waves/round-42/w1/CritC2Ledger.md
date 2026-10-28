# CritC2Ledger — C2 ledger rule gaming audit (round 42, w1)

Role: UFO-FSD critic (leaf). One wave item: for each frozen checker rule, decide whether an
untrusted committer can satisfy it *without the real repair*, and demonstrate it on scratch
fixtures.

Frozen bytes under test (read-only; same sha256 before and after this seat):

```
$ sha256sum .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
$ wc -lc .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
 168 9467 .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
```

Predicate sentence: `.ufo/waves/round-42/claims.json` claim C2 (frozen at
`9b6de3a19de11abdb80e82a1310abc64a40215bb`). No claim verdict is asserted here and no
counter/claims byte was proposed for amendment; every hole is routed as a finding.

Scratch root: `/fast/scratch/hyaku/tabi-r42/CritC2Ledger/` (deleted at seat end; receipts
copied to `evidence/` here first). No lane byte was written.

## Method (exact commands)

Fixture git repo at `/fast/scratch/hyaku/tabi-r42/CritC2Ledger/fixture`, built by
`evidence/build.sh`:

```
$ git init -q; git config user.email crit-c2-ledger@seat.local; git config user.name CritC2Ledger
$ git rev-parse --show-toplevel
/fast/scratch/hyaku/tabi-r42/CritC2Ledger/fixture          # equal to $F — checked before the first commit
```

Every input in the fixture is authored by this seat; the lane tree is read-only. Checker
invocations are always the lane bytes with `--repo`/`--rev` pointed at the fixture, as the
brief directs:

```
$ node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs \
    --rev <fixture rev> --repo /fast/scratch/hyaku/tabi-r42/CritC2Ledger/<variant> --json
```

Variants are `cp -a fixture <Vn>` + edit + commit, so each variant differs from V0 in exactly
the one field named. Logs: `evidence/V0.log`, `evidence/variants2.log`,
`evidence/variants-superseded-V1V2V8.log` (that first log contains three probes whose
test-string replacement hit the S148 *scope* cell instead of its teaches cell; they are
superseded by V9–V12 and retained only for honesty).

## V0 — the all-green forgery (the control for every rule at once)

`evidence/build.sh` writes, with no browser, no HTTP fetch, no executed command:

- `corpus/evidence/round41/playwright-egress/receipt.json` (1474 B) — valid JSON, carrying
  `"browserLaunched": false, "runs": []`;
- `…/receipt.witness.json` (1385 B) — `"witnessChildSpawned": false`;
- `.ufo/waves/round-41/measure/c1-measure.json` — self-authored, carrying the sha256 of those
  two files;
- `corpus/SOURCES.md` — S146 `rejected`, S148 teaches `supersedes S146 — options`;
- `.ufo/waves/round-41/sources/node-cli-v24.21.0.html` — a decoy page that is not the node CLI
  docs but contains the token `options`;
- `.ufo/waves/round-41/controls/c1-baseline-noop.out` — prose that was never executed;
- `.ufo/waves/round-42/quarantine/slice-ids.txt` — 38 invented ids;
- `.ufo/waves/round-42/quarantine/re-adjudication.tsv` — 38 rows, all `present`, all pointing
  at one 251-byte blob.

Observed:

```
$ git -C fixture rev-parse HEAD
e0412b0f7478917d06088226c84fe43f3c924414
receipt_sha256=7e3ea9f63fe84547e8c0f317b3c3c1c4cc9acc6bf64bcaad494a0074fa093eb8
witness_sha256=e054b0c767ddc12c061cbcb5da941e998cc2ab5138acefa2045d1087ffb9272a
sizes: receipt=1474 witness=1385 evidence=251

$ node …/check-routed-defects-round42.mjs --rev e0412b0f7478917d06088226c84fe43f3c924414 --repo $F/fixture --json
{
 "schema": "tabi-r42-routed-defects",
 "rev": "e0412b0f7478917d06088226c84fe43f3c924414",
 "predicate": true,
 "findingCount": 0,
 "findings": []
}
V0 exit=0
```

`predicate: true` on a tree that contains none of the four repairs. Each rule is then
separated below.

---

## r1a / r1b — receipt+witness bound to the *committed measure record*

Code (`let want = measureDoc && measureDoc[key]; … if (got !== want) add(id+'-digest-mismatch')`)
compares `sha256(blob at REV)` against a digest read from **another blob at the same REV**.

**Gameable by a committer: YES.** V0 is the demonstration: both the receipt and the record
that blesses it are authored in the same commit, so the pair is self-consistent and greens with
`findingCount: 0`.

The rule is self-consistency, not provenance — proved by varying exactly one file (V3: leave the
measure record untouched and point it at a digest that is not the receipt's):

```
V3(measure-unrewritten)  rev=84cc97b104d385d65caf6e29ffa4dff174a67c18
 "findingCount": 2
  r1a-digest-mismatch  receipt.json sha256 7e3ea9f6… != committed receiptSha256 000…0
  r1b-digest-mismatch  receipt.witness.json sha256 e054b0c7… != committed witnessSha256 000…0
V3 exit=1
```

So the check has teeth **only against a committer who forgets to rewrite the record**. A
committer who rewrites both passes. Note also what the rule cannot see: the receipt in V0 says
`"browserLaunched": false` and the checker does not read a single receipt field beyond JSON
parseability.

### Is that a hole against this lane, or acceptable? (threat model)

Three candidate attackers:

1. **The lane's own agent, fabricating r41 evidence.** It can write both blobs in one new
   commit. Nothing inside the checker distinguishes that from the real D1 repair. So *as a rule*
   r1 is a presence+consistency rule masquerading as a provenance rule.
2. **An external committer.** Same, and additionally the staged html is unauthenticated (see
   r2), so the whole r2/r1 evidence surface is writable.
3. **A careless lane.** Here r1 works exactly as intended: the r41 defect D1 was "the receipt
   was cited but never committed", and at the baseline r1 reports precisely that:

```
$ node … --rev 34e177959d1b7ce04afb85a001420e02631ce79e --repo …/tabi-shokunin --json
 "findingCount": 7
  r1a-receipt-absent, r1b-witness-absent, r2-s146-not-rejected, r2-supersession-absent,
  r3-baseline-file-empty, r4-slice-absent, r4-quarantine-absent
exit=1
```

**Answer: a hole in the rule, but bounded against this lane, and closable without amending the
predicate.** Measured facts (read-only, lane):

```
$ git rev-parse 123e55c:.ufo/waves/round-41/measure/c1-measure.json \
               9b6de3a:.ufo/waves/round-41/measure/c1-measure.json \
               HEAD:.ufo/waves/round-41/measure/c1-measure.json
8ff64d691f5c09569a50f2a5a038bb23774c3d35
8ff64d691f5c09569a50f2a5a038bb23774c3d35
8ff64d691f5c09569a50f2a5a038bb23774c3d35
$ git diff --stat 123e55c HEAD -- .ufo/waves/round-41/measure/c1-measure.json   # (no output, exit 0)
$ git show HEAD:corpus/evidence/round41/playwright-egress/receipt.json | sha256sum
416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1   # == measure.receiptSha256
$ git show 9b6de3a:corpus/evidence/round41/playwright-egress/receipt.json | sha256sum
416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1
```

The pre-data artifact exists and is stable across the r41 closure, the freeze and HEAD. But it
is **not digest-pinned by the r41 chain**: `.ufo/waves/round-41/claims.json` `frozenDigests`
covers only

```
scripts/measure-c1-round41.mjs, scripts/playwright-firefox-egress-round41.mjs,
scripts/check-c2-knowledge-round41.mjs, .ufo/waves/round-41/counters/c1-session-bound-v4.mjs,
.ufo/waves/round-41/fixtures/{forger-round39.cjs,forger-round41.cjs,loader.mjs}
```

and neither `8ff64d69…` (blob id) nor `5e2a83ac…` (file sha256) occurs in any pre-data artifact —
both occur only in round-42 seat files (`MutC2Digest/fixture-manifest.txt`,
`MutC2Status/evidence/evidence-hashes.json`). So today the anchor is available but unconsulted.

**Smallest safe correction (finding, not amendment):** for r42 closure, record the anchor as
evidence — `git rev-parse 123e55c:.ufo/waves/round-41/measure/c1-measure.json` must equal
`8ff64d691f5c09569a50f2a5a038bb23774c3d35` and the `git diff` above must be empty; for r43, put
the measure blob id in `claims.json` and compare it in r1. Do not touch the frozen r42 predicate.

---

## r2 — S148 verbatim quote (1..25 words)

Code: `quote = teaches.replace(/^supersedes S146\s*[—-]\s*/, '').trim()`, then
`words < 1 || words > 25`, then `html.includes(quote)`.

**Gameable by a committer: YES.** The window is exactly [1, 25] — the ceiling binds, the floor
does not:

| variant | teaches cell | quote | words | verdict |
|---|---|---|---|---|
| V10 | `supersedes S146 —` | `""` | 0 | `r2-quote-word-count`, exit 1 |
| **V9** | `supersedes S146 — options` | `options` | **1** | **exit 0** |
| V11 | 25 invented words (verbatim in html) | 25 words | 25 | exit 0 |
| V12 | 26 invented words (verbatim in html) | 26 words | 26 | `r2-quote-word-count`, exit 1 |

```
V9(1-word)  rev=5160360e0f512c0e6d48986dae4949acdb851d79
| S148 | Node.js CLI documentation | docs | A | supersedes S146 — options | §`NODE_OPTIONS=options...` | supersedes S146 — options | mined | … |
{ "predicate": true, "findingCount": 0, "findings": [] }
V9 exit=0
```

And no file swap is even needed: the committed staged copy already contains the token 93 times
on 73 lines —

```
$ git show HEAD:.ufo/waves/round-41/sources/node-cli-v24.21.0.html | grep -o 'options' | wc -l
93
$ git show HEAD:…/node-cli-v24.21.0.html | grep -ci options
73
```

So a one-word quote satisfies "verbatim substring … of at most 25 words" while carrying none of
the claim the teaches cell and scope cell assert. The rule enforces *token containment*, not
*the quote the row claims to teach*. (V0 shows the staged html itself is authorable by the
committer; its digest `ebd88de0…` is likewise absent from `frozenDigests`, so the "committed
staged copy" is not an authenticated document.)

What r2 does catch is real and untouched by this finding: the D2 defect (non-verbatim S146
quote) is caught at the baseline, and `MutC2Sentence` demonstrated the verbatim clause is
load-bearing for a spliced-quote attack. The narrow point here is **verbatim ≠ sufficient**.

**Recommendation (findings only; no amendment to the frozen r42 rule):** if the window is ever
re-frozen, raise the floor rather than the ceiling — e.g. ≥8 words, or require the quote to
contain the token run from the anchor cell (`§\`NODE_OPTIONS=options...\``) or to equal the
sentence the scope cell names. For r42, read S148's quote by hand at closure; it is one row.

---

## r3 — baseline control records the ls-tree command and the digit 0

Code: `/ls-tree/.test(raw)` and `/(^|[^0-9])0([^0-9]|$)/m.test(raw)`.

**Gameable by a committer: YES — but not via a "0 inside a longer number".** Regex probe
(executed):

```
node -e '…for (const s of [...]) console.log(JSON.stringify(s), "ls-tree="+ls.test(s), "zero="+re.test(s))'
"count 100x\n"   ls-tree=false zero=false
"count 100\n"    ls-tree=false zero=false
"rev0\n"         ls-tree=false zero=true
"-> 0 files\n"   ls-tree=false zero=true
"ls-tree\n"      ls-tree=true  zero=false
"0\n"            ls-tree=false zero=true
"prose only no digit\n" ls-tree=false zero=false
```

So the answer is precise: a `0` strictly inside a longer number (`100`, `100x`) does **not**
pass; a `0` bounded by non-digits or a line edge does — including inside a longer *token*
(`rev0`) and in ordinary prose. Combined with `ls-tree` as a bare substring, a two-token file
that never ran anything greens:

```
V7   .ufo/waves/round-41/controls/c1-baseline-noop.out = "ls-tree\nrev0\n"   (13 bytes)
V7(r3-two-token)  rev=de5e6007c62f6323a6fa6bf009f5c1cda973e116
{ "predicate": true, "findingCount": 0, "findings": [] }                      exit=0

V16  "ls-tree mentioned in prose; unrelated token rev0"
V16 exit=0

V15  "the string ls-tree appears in this prose; the count 100x is unrelated and no count was taken"
{ "findingCount": 1, "findings": [ { "id": "r3-zero-not-recorded", … } ] }    exit=1
```

V15 is the boundary control: without a standalone 0 the rule refuses, so the zero test is not
vacuous — it just constrains nothing about execution. For contrast the real repaired control
(343 B) does carry a runnable command and its output, which is what the rule *should* want:

```
$ git show HEAD:.ufo/waves/round-41/controls/c1-baseline-noop.out
# tabi round 42: populated per round-41 verifier routed defect D3 (was committed empty).
# … git -C … ls-tree -r --name-only fecbdf0a… -- corpus/evidence/round41 | wc -l
0
```

**Answer to the brief:** yes, the regex accepts a file that never ran the command; it does not
accept a 0 embedded in a longer number. A checker cannot test execution; the honest rule is a
recorded command line *plus* its captured exit status and stdout block, which the checker could
match textually far better than two substrings.

---

## r4 — quarantine re-adjudication TSV over committed bytes

Code checks: 38 slice ids, no duplicates, exact id-set equality, verdict ∈ enum, and
`gitBlobSize(evidence) >= 200`. It never opens the evidence file.

**Gameable by a committer: YES, three ways.**

1. **One shared blob, one repeated verdict.** V0: 38 rows, all `present`, all pointing at
   `corpus/evidence/fake/one.txt` (251 B) → `predicate: true`, exit 0.
2. **Unrelated blob.** V6: every row's evidence replaced by `corpus/SOURCES.md` (a real,
   >200-byte, wholly unrelated committed blob) → exit 0:

```
V6(unrelated-evidence)  rev=98f4225846dc9ecf9dd0c0adfea2d85704d50ba8
{ "predicate": true, "findingCount": 0, "findings": [] }                      exit=0
```

3. **A directory, not a blob.** The frozen sentence says "evidence path a committed blob
   ≥200 bytes", but `gitBlobSize` uses `git cat-file -s`, which also answers for trees. A
   directory with 40 entries has a 1391-byte tree object and passes:

```
V14  corpus/evidence/bulk/ (40 files) — tree size 1391
V14(big-tree-evidence)  rev=ec4ce5ea27a1ed351111e3b9004d9970a3023a7b
{ "predicate": true, "findingCount": 0, "findings": [] }                      exit=0
```

   Smaller trees fail only by accident of size (`.ufo/waves` = 70 B → 38 × `r4-evidence-thin`).
   This is a code/sentence mismatch, not just a loose rule: the claims text says the code and
   the sentence are the same conditions.

The rule's teeth, where it has them (V4): a non-enum verdict and a 100-byte blob are refused —

```
V4(enum-thin)  rev=37b901a3bebb226596e4584ce15128c3e259aaa5
  r4-verdict-enum  S200: verdict 'ok' not in enum
  r4-evidence-thin S201: evidence corpus/evidence/fake/thin.txt is 100 bytes (<200)
exit=1
```

### Where truth actually comes from (plain statement), and whether that chain is honest

The checker verifies **shape, not truth**. The truth claim for the 38 verdicts rests entirely on
(a) the 19 `QuarR42xx` seat reports and their `evidence-<ID>.txt` files, and (b) the
`RevQuarCross` reviewer sampling. Measured state of (a):

```
$ ls .ufo/waves/round-42/w1/QuarR42*/evidence-*.txt | wc -l
38
$ grep -l -i '^verdict:' .ufo/waves/round-42/w1/QuarR42*/evidence-*.txt | wc -l
38            # 38 / 38
$ grep -h -i '^verdict:' … | sed 's/.*verdict: *//' | sort | uniq -c
      6 absent
     25 misbound
      4 partial
      2 present
      1 unreachable
$ stat -c%s …/evidence-*.txt | sort -n | sed -n '1p;$p'
1777 / 6838   # min / max bytes — every file clears the 200-byte floor
```

Each file carries id, registered URL, final URL, HTTP status, byte count, sha256 of the body,
located/absent detail and the verdict line the seat derived from its own live GET.

`RevQuarCross` is chartered (item present in `w1-spec.json`, role reviewer, axis discernment) to
wait for `QuarR4201, QuarR4208, QuarR4214, QuarR4219`, open **one** cited source per sampled
seat with a read-only GET, re-derive the letter, and flag verdicts that assert without fetching.

Honesty assessment:

- **Honest where it reaches.** The evidence files are produced by seats that must fetch live
  sources and record status/bytes/sha256; RevQuarCross re-derives independently. A fabricated
  letter contradicts a live fetch for the sampled ids. Nothing in the seat charters invites
  copying the round-40 dispositions (explicitly forbidden: "superseded as a fresh check, not
  copied").
- **It does not reach far enough for the checker's `predicate: true` to mean anything.**
  RevQuarCross covers 4 of 19 seats and re-derives one source per seat — about **4 of 38 ids
  (≈10.5 %)**. V0/V6/V14 show the checker greens a TSV that no seat ever produced.
- **No seat is chartered to author or verify `re-adjudication.tsv`.** Scanning all 64 prompts:
  only `MutC2IdSet`, `MutC2Enum` and `ExecSelftestSynthetic` mention the TSV, and all three do so
  as *test fixtures*. There is no producer seat and no TSV↔evidence comparison seat, so the
  letters are transcribed into the TSV by main/scribe with no chartered check.
- **The missing link is already mechanically closeable, today, without touching frozen bytes.**
  `evidence/verdict-probe.mjs` (read-only, `git show` only) compares each TSV row's verdict with
  the `verdict:` line inside the evidence file it cites:

```
$ node verdict-probe.mjs $F/fixture e0412b0f7478917d06088226c84fe43f3c924414
{ "rows": 38, "agree": 0, "disagree": 38, "sample": [ { "id": "S200", "verdict": "present",
  "evidence": "corpus/evidence/fake/one.txt", "claimed": null, "ok": false,
  "why": "no verdict line in evidence" }, … ] }
probe exit=1
```

  The checker says `predicate: true` on that same fixture; the probe says 38/38 disagree. Since
  all 38 real evidence files *do* carry a `verdict:` line, the probe is directly usable at
  closure: require `rows=38, agree=38, disagree=0` and exit 0. That is the smallest safe
  correction for r4 — record it as closure evidence for r42; for r43, put the
  evidence-carries-its-verdict binding in the frozen rule and reject tree objects
  (`git cat-file -t` must be `blob`).

---

## Gaming matrix

| rule | committer can green without the real repair | demonstration | rule teeth (what it does catch) |
|---|---|---|---|
| r1a | yes — author receipt + measure in one commit | V0 `predicate:true`, receipt says `browserLaunched:false` | absent / <1000 B / unparseable / unrewritten digest (V3) |
| r1b | yes — same | V0 | same |
| r2 | yes — 1-word quote already present in the real staged copy | V9 exit 0; window [1,25] exact (V10/V11/V12) | 0-word, 26-word, non-verbatim; S146 not `rejected` |
| r3 | yes — two-substring stub, 13 bytes | V7/V16 exit 0 | missing `ls-tree`, no standalone 0 (V15) |
| r4 | yes — one shared blob; or an unrelated blob; or a tree object | V0, V6, V14 exit 0 | id-set, duplicates, enum, <200 B, absent (V4) |

Net: all four rules are satisfiable by a self-consistent author. That is not a surprise — it is
the wave's own hypothesis (`ExecSelftestSynthetic` F5 asks for exactly "clean full fixture … →
exit 0 … not red-by-construction"), and the `MutC2*` seats already prove each clause is
*load-bearing* against mutation. The calibration distinction this seat adds is
**shape-verified vs provenance-verified**: r1 and r4 are consistency instruments whose truth is
delegated outside the checker, so `predicate: true` must never be recorded as "the repair is
true" — only as "the four artifacts exist and are internally consistent". Three of the four
holes are cheap to close by recording one extra command at closure (measure blob id, S148 quote
by eye, `verdict-probe.mjs` 38/38); none requires amending frozen bytes.

## Limitations

- One fixture family, one host, node v24.21.0; findings are about these exact checker bytes
  (`b1d05df…`), not about mutation testing, which other seats own.
- r2's window results use an invented html for the 25/26-word cases and the real staged copy for
  the 1-word case; the word-count arithmetic is the checker's own.
- I did not open any staged-source URL (not a quarantine seat); r4's truth chain is assessed from
  the committed seat evidence files and the `RevQuarCross` charter, not by re-fetching.
- `variants-superseded-V1V2V8.log` contains three probes with a mis-targeted replacement; they
  are superseded by V9–V12 and are not cited as evidence for any claim above.
- No tool install or upgrade was needed; nothing was installed.

VERDICT finding — all four frozen rules are satisfiable by a self-consistent committer without the repairs (V0 greens with zero real work): r1 binds to an unpinned mutable measure record (V0 vs V3), r2 accepts a 1-word quote already present in the real staged copy (V9; window is exactly 1..25), r3 accepts a two-substring 13-byte stub (V7) though not a zero inside a longer number (V15), and r4 accepts one shared/unrelated blob and even a tree object (V0/V6/V14) — truth rests on the 38 seat evidence files plus RevQuarCross's 4/19-seat sample, and is mechanically closable at closure with the included verdict-probe (0/38 agree on V0) and the frozen measure blob id 8ff64d69…, without amending any frozen byte.
