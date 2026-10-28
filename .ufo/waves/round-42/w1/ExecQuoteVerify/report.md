# ExecQuoteVerify — quote fidelity from committed bytes (tabi round 42, policy-v2 wave)

Seat: `ExecQuoteVerify` (leaf). Rev under test: `9b6de3a19de11abdb80e82a1310abc64a40215bb`
(baseline `34e177959d1b7ce04afb85a001420e02631ce79e`). Host date 2026-10-28.
Scope: read-only measurement of committed bytes; writes only under
`.ufo/waves/round-42/w1/ExecQuoteVerify/`. No commits, no pushes, no spawned agents, no installs.
Scratch root `/fast/scratch/hyaku/tabi-r42/ExecQuoteVerify/` was created and deleted before yielding.

## Method (why these are committed bytes, not a working tree)

Every input was read with `git show <rev>:<path>` into scratch, then bound back to the commit:

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && for p in corpus/SOURCES.md .ufo/waves/round-41/sources/node-cli-v24.21.0.html .ufo/waves/round-42/sources/git-ls-tree.html; do a=$(git rev-parse 9b6de3a19de11abdb80e82a1310abc64a40215bb:$p); echo "blob $a $p"; done
blob 962773c3786de0ddc0eb10c47fdafc4f7e738d5e corpus/SOURCES.md
blob 2f1f21a2c2b46a1a35dbed751ee932c97a36d1df .ufo/waves/round-41/sources/node-cli-v24.21.0.html
blob 690e385e36085dbea505c08b9c4f8fe873928fa2 .ufo/waves/round-42/sources/git-ls-tree.html

$ git hash-object .../SOURCES.md .../node-cli.html .../git-ls-tree.html
962773c3786de0ddc0eb10c47fdafc4f7e738d5e
2f1f21a2c2b46a1a35dbed751ee932c97a36d1df
690e385e36085dbea505c08b9c4f8fe873928fa2
```

Identical, in order → the extracted copies are byte-identical to the committed blobs
(evidence `evidence/05-blob-identity.txt`). Cell semantics are the frozen checker's own
(`row.split('|')`, 1-based cell 1 = id, 7 = teaches, 8 = status), so my derivation and the
checker's cannot diverge on parsing.

## Item 1 — S148 teaches cell, supersession stripped, exact match

```
$ git show <rev>:corpus/SOURCES.md > SOURCES.md
$ grep -n 'S148\|S149' SOURCES.md
162:| S148 | Node.js CLI documentation — https://nodejs.org/docs/latest-v24.x/api/cli.html | docs | A | supersedes S146 — the `NODE_OPTIONS` loader channel, with the quote corrected to a verbatim substring (round-41 verifier defect D2) | §`NODE_OPTIONS=options...`, Added in: v8.0.0, node v24.21.0 docs; opened 2026-10-28 | supersedes S146 — A space-separated list of command-line options. | mined | 2026-10-28 | on-release | corpus/knowledge/environment-injection-measurement-integrity-round-41.md |
```

(Row reproduced in full; identical bytes are in `evidence/01-s148-s149-cells.txt`.)

```
S148 teaches cell repr: 'supersedes S146 — A space-separated list of command-line options.'
stripped repr: 'A space-separated list of command-line options.'
exact match to target: True
whitespace tokens: 6 => ['A', 'space-separated', 'list', 'of', 'command-line', 'options.']
hyphen-split tokens: 8
S148 status: 'mined'
```

Stripping `^supersedes S146\s*[—-]\s*` leaves exactly `A space-separated list of command-line
options.` — 47 bytes, confirmed independently by
`printf '%s' 'A space-separated list of command-line options.' | wc -w -c` → `      6      47`.
Duplicate-row audit: `grep -cE '^\|\s*S148\s*\|'` over the committed file → `1` (no second S148 row).

**F1 (see Findings): the remainder is 6 whitespace-separated words, not the 7 the assignment
states.** Neither 6 nor 8 (hyphens split) equals 7. The frozen r2 bound is 1..25 words, so this
discrepancy changes no predicate outcome; it is a dispatch-text detail, recorded rather than
smoothed over.

## Item 2 — S148 quote is a verbatim substring of the committed staged copy

```
$ cd /fast/scratch/hyaku/tabi-r42/ExecQuoteVerify
$ grep -c -F 'A space-separated list of command-line options.' node-cli.html
1
$ grep -b -o -F 'A space-separated list of command-line options.' node-cli.html
243279:A space-separated list of command-line options.
```

Also run straight off the committed blob (no scratch file in the path):
`git show <rev>:.ufo/waves/round-41/sources/node-cli-v24.21.0.html | grep -cF '...'` → `1`.
File is 281098 bytes, so the quote sits at 86.6% of the file.

Surrounding bytes, 120 before and 120 after (match at byte 243279, length 47; raw bytes also in
`evidence/02-s148-quote-context.txt`):

```
120 BEFORE: ass="legacy" id="cli_node_options_options"></a></h4>\n<div class="api_metadata">\n<span>Added in: v8.0.0</span>\n</div>\n<p>
QUOTE     : A space-separated list of command-line options.
120 AFTER : ' <code>options...</code> are interpreted\nbefore command-line options, so command-line options will override or\ncompound '
```

This corroborates S148's anchor cell (`§`NODE_OPTIONS=options...`, Added in: v8.0.0`): the quote
is the opening sentence of the `NODE_OPTIONS=options...` paragraph, immediately after the
`Added in: v8.0.0` metadata block, with the anchor id `cli_node_options_options`.

## Item 3 — S149 quote and its source copy

```
S149 teaches repr: 'Lists the contents of a given tree object, like what "/bin/ls -a" does'
S149 ws tokens: 13
S149 quote exact target: True

$ grep -c -F 'Lists the contents of a given tree object, like what "/bin/ls -a" does' git-ls-tree.html
1
$ grep -b -o -F 'Lists the contents of a given tree object, like what "/bin/ls -a" does' git-ls-tree.html
25967:Lists the contents of a given tree object, like what "/bin/ls -a" does
```

13 words confirmed as stated. Context (match at byte 25967 of a 38955-byte file; raw bytes in
`evidence/03-s149-quote-context.txt`):

```
120 BEFORE: ption"><a class="anchor" href="#_description"></a>DESCRIPTION</h2>\n<div class="sectionbody">\n<div class="paragraph">\n<p>
120 AFTER : \nin the current working directory.  Note that:</p>\n</div>\n<div class="ulist">\n<ul>\n<li>\n<p>the behaviour is slightly dif
```

The quote is the complete first sentence of the `DESCRIPTION` section, ending at a real line
break before `in the current working directory.` — i.e. it is verbatim, not stitched.

Extra binding: the committed blob's sha256 is
`2c298383476164238c6e25ba804412a335c405ab9540650bb603778e2f4f8b64`, which is exactly the digest
`claims.json` C2 `restsOn` records for the opened copy
(`evidence/07-source-digest-crosscheck.txt`).

## Item 4 — Frozen checker run vs my manual r2 derivation

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev 9b6de3a19de11abdb80e82a1310abc64a40215bb --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
{
 "schema": "tabi-r42-routed-defects",
 "rev": "9b6de3a19de11abdb80e82a1310abc64a40215bb",
 "predicate": false,
 "findingCount": 1,
 "findings": [
  {
   "id": "r4-quarantine-absent",
   "detail": ".ufo/waves/round-42/quarantine/re-adjudication.tsv not committed at REV"
  }
 ]
}
EXIT=1
```

stderr 0 bytes. Receipt: `evidence/04-checker-run.txt`.

My manual r2 derivation, computed from bytes with the checker's own cell indices:

| r2 sub-condition | byte evidence | result |
|---|---|---|
| S148 present, teaches begins `supersedes S146` | line 162, cell 7 | pass |
| remainder is a verbatim substring of the committed node-cli html | `grep -cF` → 1 at 243279 | pass |
| remainder ≤ 25 words | 6 whitespace tokens | pass |
| S146 status cell is `rejected` | S146 row cell 8 = `rejected` | pass |

⇒ r2 = true. The checker reported no `r2-*` finding, only `r4-quarantine-absent` → **agreement on
r2**, and only r4 is red, as the freeze states. Independent corroboration that r4 is red *by
design* at this rev, not by accident:

```
$ git show <rev>:.ufo/waves/round-42/quarantine/slice-ids.txt | grep -c .
38
$ git cat-file -e <rev>:.ufo/waves/round-42/quarantine/re-adjudication.tsv
fatal: path '.ufo/waves/round-42/quarantine/re-adjudication.tsv' does not exist in '9b6de3a19de11abdb80e82a1310abc64a40215bb'
cat-file exit=128
```

38 committed slice ids, no TSV → the single finding is exactly the expected one.

## Supporting: the D2 defect the supersession repaired is byte-real

S146's own quote was two sentences stitched with a semicolon, so it cannot be a substring:

```
$ git show <rev>:corpus/SOURCES.md | grep -E '^\|\s*S146\s*\|'
| S146 | ... | A space-separated list of command-line options; interpreted before command-line options | rejected | 2026-10-28 | on-release | corpus/lessons/round-42.md |
$ git show <rev>:.ufo/waves/round-41/sources/node-cli-v24.21.0.html | grep -cF 'A space-separated list of command-line options; interpreted before command-line options'
0
```

S148 replaces it with the first sentence only (present, count 1). The verbatim discipline r2
enforces therefore separates the rejected row from its replacement on measured bytes, not on
intent. Evidence `evidence/06-s146-nonverbatim.txt`.

## Findings

- **F1 — dispatch word-count detail is wrong, artifact is not.** The assignment says the stripped
  S148 remainder is 7 words. Committed bytes give 6 whitespace-separated tokens (47 bytes); 8 if
  hyphens are split; 7 under no convention I could construct. Frozen r2 allows 1..25 words, so no
  predicate outcome changes and no claim byte needs amendment. Recorded because reporting "7"
  would have been an assertion not backed by the file.
- **O1 — observation, not a claim-verdict: [INFERENCE]** r2's verbatim test is a
  whole-file substring test (`html.includes(quote)`) with no positional binding to the S148
  anchor, so a future row could satisfy it with any 1..25-word slice of the same 281 KB page. No
  seat has demonstrated such a reach here and I make no admission call; per the frozen-bytes rule
  I route it as an observation for the next round's instrument work rather than proposing an
  amendment.

## Limitations (what I did not verify)

- r1a/r1b (receipt/witness size, JSON parse, sha256 == committed `receiptSha256`/`witnessSha256`)
  and r3 (baseline control carrying `ls-tree` and the digit `0`) were **not** independently
  re-derived by this seat; my only statement about them is that the frozen checker emitted no
  findings for them. An unrun check has not passed — so this seat's positive verdict covers
  items 1–3 and r2 only.
- No browser, no network, no loopback work was needed or performed. No quarantine URL was fetched.
- No tool was installed or upgraded (`pacman` untouched; nothing needed a uv/official-binary
  channel), so there is no install entry to record.

## Evidence paths (all under this seat dir)

- `evidence/01-s148-s149-cells.txt` — cell extraction, exact reprs, word/byte counts, statuses, duplicate-row audit
- `evidence/02-s148-quote-context.txt` — S148 match offsets + 120 bytes before/after
- `evidence/03-s149-quote-context.txt` — S149 match offsets + 120 bytes before/after
- `evidence/04-checker-run.txt` — full checker command, stdout, exit 1, empty stderr
- `evidence/05-blob-identity.txt` — `git rev-parse` vs `git hash-object` byte identity
- `evidence/06-s146-nonverbatim.txt` — S146 stitched quote, presence count 0
- `evidence/07-source-digest-crosscheck.txt` — S149 blob sha256 == claims.json recorded digest

VERDICT ok — S148 remainder matches `A space-separated list of command-line options.` exactly (6 words, F1) and is verbatim at byte 243279 of the committed node-cli html; S149's 13-word quote is verbatim at byte 25967 of a blob whose sha256 matches claims.json; the frozen checker exits 1 with only `r4-quarantine-absent`, agreeing with my r2=true derivation.
