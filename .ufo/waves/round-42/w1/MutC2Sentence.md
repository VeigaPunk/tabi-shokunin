# MutC2Sentence — C2 verbatim-quote mutation (round 42, w1)

Role: UFO-FSD mutation tester (leaf). One probe: does the frozen r2 quote clause
(`verbatim substring of the committed staged source copy`) actually carry the
verdict, or does the checker's r2 verdict survive losing it?

Frozen bytes under test (read-only, lane):
`b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8`
`.ufo/waves/round-42/counters/check-routed-defects-round42.mjs` (168 lines, 9467 B).
Same hash before and after this seat (see "Byte hygiene").

Frozen clause, quoted from the checker header:

```
(r2)  SOURCES.md at REV has row S148 whose teaches cell begins
      `supersedes S146` and whose remainder is a verbatim substring of
      the committed .ufo/waves/round-41/sources/node-cli-v24.21.0.html
      of at most 25 words, and S146's status cell is `rejected`;
```

and the executable form at checker line 130:

```js
else if (quote.length > 0 && !html.toString('utf8').includes(quote)) add('r2-quote-not-verbatim', 'S148 quote is not a verbatim substring of the committed staged source copy');
```

## 1. Fixture (scratch git repo)

Scratch root `/fast/scratch/hyaku/tabi-r42/MutC2Sentence/`; fixture
`mktemp -d -p /fast/scratch/hyaku/tabi-r42/MutC2Sentence fixture.XXXXXX` →
`/fast/scratch/hyaku/tabi-r42/MutC2Sentence/fixture.jjFkH8` (deleted at seat end).

```console
$ git init -q /fast/scratch/hyaku/tabi-r42/MutC2Sentence/fixture.jjFkH8        # rc=0
$ git -C /fast/scratch/hyaku/tabi-r42/MutC2Sentence/fixture.jjFkH8 rev-parse --show-toplevel
/fast/scratch/hyaku/tabi-r42/MutC2Sentence/fixture.jjFkH8
# equal to $D (realpath compare: True) — checked before the first commit
```

All non-SOURCES inputs were copied byte-for-byte out of the lane at HEAD with
`git -C <lane> show HEAD:<path>` (never from a working tree), so the fixture's
r1/r3 are the lane's real committed evidence:

| fixture path | bytes | sha256 |
|---|---|---|
| `corpus/evidence/round41/playwright-egress/receipt.json` | 1167198 | `416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1` |
| `corpus/evidence/round41/playwright-egress/receipt.witness.json` | 1153988 | `d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3` |
| `.ufo/waves/round-41/measure/c1-measure.json` | 3284 | `5e2a83ac02b9a4ec3f7d0ebec21f5fa9b3469d4110ac23f8e78af18b43913f13` |
| `.ufo/waves/round-41/controls/c1-baseline-noop.out` | 343 | `45379acb5cc9ed36e0004ad0b74883a286eda8634175891036a85d279f501caa` |
| `.ufo/waves/round-41/sources/node-cli-v24.21.0.html` | 281098 | `ebd88de065864310f8ab5a444df7cd8bb23d089b32be07defb8e6ef92b2260a1` |
| `.ufo/waves/round-42/quarantine/slice-ids.txt` | 190 | `373516272b385d1becce2e622292668dc82b7dc0012df64bcac8810f76e712cf` |
| `.ufo/waves/round-42/quarantine/re-adjudication.tsv` | 2128 | `3bc9f9a3e9b603e37ff8d02f13c878c6012e2e9badf5692551d81c56d02047c3` |

`re-adjudication.tsv` is absent in the lane at HEAD (r4 is red by design, the 38
fresh verdicts being this wave's job). To isolate r2, the fixture synthesises a
**shape-valid** TSV over the 38 committed slice ids (`<id>\tpresent\tcorpus/evidence/round42/quarantine/<id>.md`)
plus 38 committed evidence blobs of ~240 B each, so the fixture's r4 is green.
This is fixture scaffolding only; it makes no claim about the real r4.

Three commits, one cell apart (S148 `teaches` cell = `split('|')[7]`):

```console
$ git -C "$D" --no-pager log --format='%H %s'
1fcb32c3af0e08c2b69c9d30735f9f9dcb6b5b8e fixture negative control: S148 quote spliced with a clause absent from the staged source
d9395f61d9bfbaf1d484c0c729f565b28b1206ef fixture under test: S148 quote is the ORIGINAL spliced S146 quote
e674bc7f0256e535c9531febad4463aa07a6774b fixture control: S148 quote is the corrected verbatim substring
```

| rev | S148 teaches cell | `corpus/SOURCES.md` sha256 |
|---|---|---|
| `e674bc7…74b` (GREEN) | `supersedes S146 — A space-separated list of command-line options.` | `dba53f3b8f5a31ba57cb2c7a7bf62f868cde05f9d64fa38d876b5ab318099a58` |
| `d9395f6…6ef` (RED) | `supersedes S146 — A space-separated list of command-line options; interpreted before command-line options` | `c372de65aede5bee06d9dff6da0dd4e58ead5f0120431e0f81b21dae734f5014` |
| `1fcb32c…b8e` (FAB) | `supersedes S146 — A space-separated list of command-line options; skipped by all evaluators` | `4b3ea374a65417d6388ce2895a0a9297d62d1f59e80ee82275d9ce16f6fe9547` |

The RED cell is the **original spliced S146 quote** as the lane recorded it before
the r41 verifier found D2 — corroborated, not invented:

- `corpus/lessons/round-41.md:20` — `S146 … “A space-separated list of command-line options; interpreted before command-line options” (10 words).`
- `corpus/lessons/round-41-verifier-spotcheck.md:59` — *"the page reads \"A space-separated list of command-line options. options... are interpreted before command-line options…\"; the SOURCES.md `quote` cell and the lesson/entry splice this into \"…command-line options; interpreted before command-line options\", which is not a verbatim substring (D2)."*
- `corpus/knowledge/environment-injection-measurement-integrity-round-41.md:73-80` — errata: *"spliced two source fragments with a semicolon and is not a verbatim substring"*.
- `git log -S"interpreted before command-line options" -- corpus/SOURCES.md` → the splice entered at `8c32528 round-41 freeze`.

Fixture inventory at RED: 46 committed files (`git ls-tree -r --name-only | wc -l`).

Full machine-readable receipt: `evidence/fixture.txt`.

## 2. Baseline: the fixture is green except for the quote cell

```console
$ node <lane>/…/check-routed-defects-round42.mjs --rev e674bc7f0256e535c9531febad4463aa07a6774b --repo "$D" --json ; echo "exit=$?"
{"schema":"tabi-r42-routed-defects","rev":"e674bc7f…74b","predicate":true,"findingCount":0,"findings":[]}
exit=0
```

So r1a/r1b/r2/r3/r4 all pass at GREEN. At RED the same checker returns **exactly
one** finding:

```console
$ node <lane>/…/check-routed-defects-round42.mjs --rev d9395f61d9bfbaf1d484c0c729f565b28b1206ef --repo "$D" --json ; echo "exit=$?"
{
 "schema": "tabi-r42-routed-defects",
 "rev": "d9395f61d9bfbaf1d484c0c729f565b28b1206ef",
 "predicate": false,
 "findingCount": 1,
 "findings": [
  { "id": "r2-quote-not-verbatim",
    "detail": "S148 quote is not a verbatim substring of the committed staged source copy" }
 ]
}
exit=1
```

The two commits differ in ONE table cell, so the refusal is attributable to the
quote clause alone: pristine **refuses the spliced quote**.

Why it refuses, from the committed staged copy
(`.ufo/waves/round-41/sources/node-cli-v24.21.0.html`, §`NODE_OPTIONS=options...`):

```html
<p>A space-separated list of command-line options. <code>options...</code> are interpreted
before command-line options, so command-line options will override or
compound after anything in <code>options...</code>.
```

The recorded quote joins the two fragments with `;` and drops
`. <code>options...</code> are `, so it is not a byte substring of the file.
Normalisation-level probe (independent of the checker, against the same committed HTML):

| test | result |
|---|---|
| raw `quote in html` | **false** |
| whitespace+case normalised contiguous `includes` (raw HTML) | **false** |
| HTML tags stripped, then contiguous `includes` (raw and ws/case-normalised) | **false** |
| tag-stripped, punctuation-normalised **ordered token subsequence** | **true** (13/13 tokens) |

Calibration consequence: a mere whitespace/case relaxation does *not* green this
fixture; only dropping contiguity does. The load-bearing element of the frozen
clause is therefore the **verbatim adjacency** requirement itself, not incidental
formatting.

## 3. Mutation M (scratch copy only; lane bytes never edited)

```console
$ diff -u <lane>/…/check-routed-defects-round42.mjs /fast/scratch/hyaku/tabi-r42/MutC2Sentence/check-routed-defects-round42.mjs
@@ -38,6 +38,21 @@
 const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
 
+// MUTANT (MutC2Sentence, round 42, C2 calibration): the r2 quote test relaxed from
+// a verbatim substring to whitespace/case-insensitive fuzzy containment -- tags
+// stripped, whitespace/case/punctuation normalized, quote word tokens matched as
+// an ordered token subsequence of the staged source (contiguity dropped).
+const quoteTokens = (s) => s.toString('utf8').replace(/<[^>]*>/g, ' ').toLowerCase().replace(/[^0-9a-z]+/g, ' ').split(' ').filter(Boolean);
+function fuzzyContains(haystackBuf, quote) {
+  const want = quoteTokens(quote);
+  if (want.length === 0) return true;
+  let i = 0;
+  for (const t of quoteTokens(haystackBuf)) {
+    if (t === want[i]) { if (++i === want.length) return true; }
+  }
+  return false;
+}
+
@@ -112,7 +127,7 @@
-        else if (quote.length > 0 && !html.toString('utf8').includes(quote)) add('r2-quote-not-verbatim', 'S148 quote is not a verbatim substring of the committed staged source copy');
+        else if (quote.length > 0 && !fuzzyContains(html, quote)) add('r2-quote-not-verbatim', 'S148 quote is not a fuzzy containment match of the committed staged source copy');
```

Mutation surface: one predicate, one call site. Mutant sha256
`9ad35ddb03af3ef1d1220ac72ba0cd5ceb9987e7d397078cc84d24de3695a628`.
(`diff` exit 0, both hunks shown; no other line touched.)

## 4. Red/green table

Same detector (`node check-routed-defects-round42.mjs --rev <rev> --repo "$D" --json`),
same fixture, three revs, two checker binaries. Every cell below was executed; the
JSON files are in `evidence/`.

| fixture | checker | exit | findings |
|---|---|---|---|
| G `e674bc7` corrected verbatim quote | **pristine** | 0 | `[]` (predicate true) |
| G `e674bc7` | **mutant** | 0 | `[]` (predicate true) |
| R `d9395f6` original spliced S146 quote | **pristine** | **1** | **`[r2-quote-not-verbatim]`** |
| R `d9395f6` | **mutant** | **0** | **`[]` (predicate true)** |
| F `1fcb32c` splice + clause absent from source | pristine | 1 | `[r2-quote-not-verbatim]` |
| F `1fcb32c` | mutant | 1 | `[r2-quote-not-verbatim]` (fuzzy message) |
| lane HEAD `0081bfdb93b6bd1bf2853bb128996f1a976b7218` | pristine | 1 | `[r4-quarantine-absent]` |
| lane HEAD `0081bfdb…218` | mutant | 1 | `[r4-quarantine-absent]` (identical set) |

```console
$ node /fast/scratch/hyaku/tabi-r42/MutC2Sentence/check-routed-defects-round42.mjs --rev d9395f61d9bfbaf1d484c0c729f565b28b1206ef --repo "$D" --json ; echo "exit=$?"
{"schema":"tabi-r42-routed-defects","rev":"d9395f61d9bfbaf1d484c0c729f565b28b1206ef","predicate":true,"findingCount":0,"findings":[]}
exit=0
```

**Mutant KILLED**: the mutant converts a fixture the pristine checker refuses
(exit 1, `r2-quote-not-verbatim`) into a green (exit 0, no findings). The dropped
clause is load-bearing for the r2 verdict.

## 5. Controls that keep the kill honest

- **Negative control F** — same splice plus a clause whose words do not occur in the
  staged copy (`skipped by all evaluators`). The mutant still exits 1 with
  `r2-quote-not-verbatim`. The mutation is not "r2 always green"; it drops contiguity
  while still requiring every quote token to be traceable in order.
- **Real-tree control** — at lane HEAD both binaries produce the identical single
  finding `r4-quarantine-absent` (the 38 verdicts are this wave's job). The mutation
  does not blanket-green the real tree, and the lane's current S148 row passes r2
  under both binaries.
- **Localisation** — GREEN and RED differ in one table cell and both are fully green
  on r1/r3/r4, so no other predicate element can explain the pristine refusal.

## 6. Limitations

- The fixture's r4 (TSV + 38 evidence blobs) is synthesised scaffolding, shape-valid
  for the checker; it says nothing about the real round-42 quarantine verdicts.
- The mutant's acceptance of the splice comes from dropping contiguity (ordered token
  subsequence), not from whitespace/case normalisation, which alone still refuses (§2).
  A "loosen to ws/case-insensitive" repair would therefore leave D2 red — recorded as
  an observation, not a claim about the frozen clause.
- Everything ran on committed bytes of the fixture repo and loopback/local files only;
  no network, no lane writes, no git mutation outside the scratch fixture.
- Scratch was deleted; the fixture rev hashes above are recorded but the objects are
  gone, so this probe is not re-runnable without rebuilding the fixture.
- No tools installed or upgraded (pacman paused; no uv/binary install needed).

## 7. Byte hygiene / restoration evidence

```console
$ sha256sum <lane>/…/check-routed-defects-round42.mjs   # before seat
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8
$ sha256sum <lane>/…/check-routed-defects-round42.mjs   # after all runs
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8
```

Lane checker bytes are unchanged (read-only use; the mutation lives only in the
scratch copy, hash `9ad35ddb…628`). The scratch fixture is removed
(`rm -rf -- /fast/scratch/hyaku/tabi-r42/MutC2Sentence`), receipts copied into
`evidence/` first.

## 8. Artifacts

`evidence/fixture.txt` (revs, hashes, inventory, per-rev S148 cell),
`evidence/pristine-green.json`, `evidence/pristine-red.json`,
`evidence/mutant-green.json`, `evidence/mutant-red.json`,
`evidence/pristine-fab.json`, `evidence/mutant-fab.json`,
`evidence/pristine-lanehead.json`, `evidence/mutant-lanehead.json`,
`evidence/mutant.diff`.

VERDICT ok — mutant killed: relaxing the frozen r2 verbatim-substring clause to
whitespace/case-insensitive fuzzy containment greens the spliced-S146-quote fixture
(mutant exit 0, 0 findings) that the pristine checker refuses (exit 1,
`r2-quote-not-verbatim`); the clause is load-bearing.
