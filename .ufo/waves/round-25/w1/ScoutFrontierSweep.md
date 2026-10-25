# ScoutFrontierSweep — C1 before-state negative sweeps at 9e136667

Seat: L1Tabi25.ScoutFrontierSweep (scout, read-only). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. All git commands below were run
from the lane root with `R=9e13666759bcf30665abec84dec13adefc1fa86a`; only
read-only git was used (rev-parse, cat-file, ls-tree, grep, show, log,
merge-base, hash-object --stdin without -w). No processes were launched, no
tools were installed, and no tracked file was edited.

Read first: `.ufo/waves/round-25/claims.json` (authoritative). C1 `before: 0`
and the declared before-state: "git ls-tree -r --name-only 9e136667 --
corpus/evidence/round-25 is empty) and round-24 entry U1 documents no committed
probe performs a history step at all".

## Verdict

- (a) **Holds.** `corpus/evidence/round-25` is empty at the baseline (0 paths).
- (b) **Holds.** Inside `corpus/knowledge SKILL.md scripts`, exactly one
  committed file mentions `BackForwardCacheRestore`:
  `corpus/knowledge/navigation-history-bfcache-evidence.md`, which carries 3
  lines. It is a docs-held knowledge entry, not a runtime receipt. Its header
  reads `tier: documented upstream, not measured in this lane`, and line 9
  reads "**No browser ran for this entry.**" `SKILL.md` and `scripts/` have
  zero hits. **Runtime observation receipts: none.**
- (c) **Holds.** No committed probe performs a history step. The two files
  that match under `scripts corpus` are a protocol definition, not a call site
  (`corpus/evidence/round-24/sources/page.pdl:913 command navigateToHistoryEntry`,
  the S105 PDL), and prose (`corpus/knowledge/navigation-history-bfcache-evidence.md:20`
  "A `history.back()` step sharpens that rule into a trap"). `scripts/` has
  zero hits.
- **Citation defect in claims.json (C1 `declared`): the attribution to U1 is
  wrong.** U1 at the baseline does **not** say "no committed probe performs a
  history step at all". U1 says that no restore has been observed and that
  emission on loopback is unmeasured. The quoted phrase appears verbatim in
  **`corpus/README.md:582`** (the frontier row that cites the entry's U1–U5).
  Its evidentiary origin is round-24 reviewer `.ufo/waves/round-24/w2/RevFrontierRows.md:59-61`.
  The fact itself holds (sweep (c) and the reviewer's sweep both return 0
  call sites). Only the location is mis-cited. Suggested wording for
  downstream writers: "corpus/README.md:582 (frontier row citing entry U1)
  documents no committed probe performs a history step at all; entry U1
  documents no restore observed on this host."

## (a) round-25 evidence tree at baseline

```
$ git cat-file -t 9e13666759bcf30665abec84dec13adefc1fa86a
commit
$ git ls-tree -r --name-only 9e13666759bcf30665abec84dec13adefc1fa86a -- corpus/evidence/round-25
exit=0 lines=0
```

(The line count comes from piping the same command through `wc -l`.) The
command produced no output: the tree is empty.

## (b) BackForwardCacheRestore mentions in knowledge / SKILL.md / scripts

```
$ git grep -n 'BackForwardCacheRestore' 9e13666759bcf30665abec84dec13adefc1fa86a -- corpus/knowledge SKILL.md scripts
9e13666759bcf30665abec84dec13adefc1fa86a:corpus/knowledge/navigation-history-bfcache-evidence.md:39:  `BackForwardCacheRestore` alongside `Navigation` (S105, `NavigationType`,
9e13666759bcf30665abec84dec13adefc1fa86a:corpus/knowledge/navigation-history-bfcache-evidence.md:57:| `Page.frameNavigated` with `type: BackForwardCacheRestore` | the frame-navigated event verbatim, plus the post-restore DOM snapshot and the pre-navigation snapshot | the step navigated and the document was restored from memory | that the page state is fresh, or that the server saw the step |
9e13666759bcf30665abec84dec13adefc1fa86a:corpus/knowledge/navigation-history-bfcache-evidence.md:80:  `BackForwardCacheRestore` on a loopback fixture is unmeasured.
exit=0
```

Classification of each hit (observed from `git show $R:<path> | cat -n`):
- Line 39 is §2, "The discriminator, from the protocol this host's Chromium
  speaks". It is documentation of the PDL enum from S105.
- Line 57 is §3, the decision table row stating what a receipt *must* carry.
  It is a requirement, not an observation.
- Line 80 is §5 U1, which states the restore is **unmeasured**.
- Entry header lines 7 and 9: `tier: documented upstream, not measured in this lane`
  and "**No browser ran for this entry.** Nothing here is a capture, a run or a
  measurement".

So zero runtime observation receipts sit in the swept paths.

Wider sweep (whole tree, for completeness):

```
$ git grep -ln 'BackForwardCacheRestore' 9e13666759bcf30665abec84dec13adefc1fa86a
...:.ufo/waves/round-24/gen-w2.mjs
...:.ufo/waves/round-24/w1/ScoutCdpPage.md
...:.ufo/waves/round-24/w1/ScribeKnowledgeEntry.md
...:.ufo/waves/round-24/w2-dispatch.json
...:.ufo/waves/round-24/w2-spec.json
...:.ufo/waves/round-24/w2/CritC3Verdict.md
...:.ufo/waves/round-24/w2/ExecReDerive.md
...:.ufo/waves/round-24/w2/RevCensusEnd.md
...:.ufo/waves/round-24/w2/RevEntryBfcache.md
...:.ufo/waves/round-24/w2/RevFrontierRows.md
...:.ufo/waves/round-24/w2/RevLogEntry.md
...:.ufo/waves/round-24/w2/RevNoHarmDiff.md
...:.ufo/waves/round-24/w2/RevScorecardDisposition.md
...:.ufo/waves/round-24/w2/ScoutReopenS105.md
...:LOG.md
...:corpus/README.md
...:corpus/SOURCES.md
...:corpus/evidence/round-24/sources/page.pdl
...:corpus/knowledge/navigation-history-bfcache-evidence.md
...:corpus/lessons/round-24.md
exit=0
```

(`...` = `9e13666759bcf30665abec84dec13adefc1fa86a`.) Under `corpus/evidence/`,
the only hit is `round-24/sources/page.pdl`, which holds the S105 upstream
source bytes. That is a source file, not a run log. The only evidence path
whose name mentions bfcache is also a source fetch:

```
$ git ls-tree -r --name-only 9e13666759bcf30665abec84dec13adefc1fa86a -- corpus/evidence | grep -i bfcache
corpus/evidence/round-24/sources/bfcache.html
```

That file holds the S104 web.dev article bytes, not a receipt. [INFERENCE] The
remaining hits are wave reports, the wave spec and dispatch, LOG, the lesson,
README and SOURCES. I did not open each one beyond the file list. None of them
is under `corpus/evidence/`, so none is in the receipt location the C1
counter reads.

## (c) committed history-step probes

```
$ git grep -ln 'goBack\|navigateToHistoryEntry\|history.back' 9e13666759bcf30665abec84dec13adefc1fa86a -- scripts corpus
9e13666759bcf30665abec84dec13adefc1fa86a:corpus/evidence/round-24/sources/page.pdl
9e13666759bcf30665abec84dec13adefc1fa86a:corpus/knowledge/navigation-history-bfcache-evidence.md
exit=0

$ git grep -n 'goBack\|navigateToHistoryEntry\|history.back' 9e13666759bcf30665abec84dec13adefc1fa86a -- scripts corpus
9e13666759bcf30665abec84dec13adefc1fa86a:corpus/evidence/round-24/sources/page.pdl:913:  command navigateToHistoryEntry
9e13666759bcf30665abec84dec13adefc1fa86a:corpus/knowledge/navigation-history-bfcache-evidence.md:20:capture*. A `history.back()` step sharpens that rule into a trap. The article
exit=0

$ git show 9e13666759bcf30665abec84dec13adefc1fa86a:corpus/evidence/round-24/sources/page.pdl | sed -n 910,916p
      experimental optional boolean isDownload

  # Navigates current page to the given history entry.
  command navigateToHistoryEntry
    parameters
      # Unique id of the entry to navigate to.
      integer entryId
```

Both hits are non-probes: one is the protocol's command declaration, the other
is prose. The round-24 reviewer's narrower probe-path sweep, re-run at the
baseline:

```
$ git grep -nE "navigateToHistoryEntry|goBack|history\.back\(|history\.go\(" 9e13666759bcf30665abec84dec13adefc1fa86a -- "scripts/*.mjs" ".ufo/waves/*/probes/*.mjs" ".ufo/waves/*/measure-*.mjs"
exit=1
```

Zero hits. Whole-tree sweep, including `history.go(`:

```
$ git grep -ln 'goBack\|navigateToHistoryEntry\|history\.back\|history\.go(' 9e13666759bcf30665abec84dec13adefc1fa86a
...:.ufo/waves/round-24/claims.json
...:.ufo/waves/round-24/gen-w1.mjs
...:.ufo/waves/round-24/w1-dispatch.json
...:.ufo/waves/round-24/w1-spec.json
...:.ufo/waves/round-24/w1/RevEntryQuality.md
...:.ufo/waves/round-24/w1/ScribeKnowledgeEntry.md
...:.ufo/waves/round-24/w2/RevFrontierRows.md
...:corpus/evidence/round-24/sources/page.pdl
...:corpus/knowledge/navigation-history-bfcache-evidence.md
exit=0
```

[INFERENCE] The additional `.ufo/waves/round-24/*` hits are claims, specs and
reports, plus `gen-w1.mjs`, a dispatch generator rather than a probe. None of
them is in the probe paths swept above.

Related context. The scripts that do use CDP navigation are
`webmcp-invoke-round17/18/19.mjs`, `webmcp-lifecycle-round21.mjs` and
`webmcp-validation-round19.mjs`. They match `Page.navigate|Page.frameNavigated`
but contain no history-step token, per sweep (c). The baseline `scripts/` tree
also contains no `--disable-back-forward-cache` literal:

```
$ git grep -ln -- '--disable-back-forward-cache' 9e13666759bcf30665abec84dec13adefc1fa86a -- scripts
exit=1
$ git grep -ln 'Page\.navigate\|Page\.frameNavigated' 9e13666759bcf30665abec84dec13adefc1fa86a -- scripts
...:scripts/webmcp-invoke-round17.mjs
...:scripts/webmcp-invoke-round18.mjs
...:scripts/webmcp-invoke-round19.mjs
...:scripts/webmcp-lifecycle-round21.mjs
...:scripts/webmcp-validation-round19.mjs
exit=0
```

## U1 quote, and where the "history step" sentence actually lives

U1 verbatim at the baseline (blob `861b0070f3c531240e6f0e64bc3e17578a1a7774`
via `git show $R:corpus/knowledge/navigation-history-bfcache-evidence.md | git hash-object --stdin`):

```
$ git grep -n 'U1' 9e13666759bcf30665abec84dec13adefc1fa86a -- corpus/knowledge/navigation-history-bfcache-evidence.md
9e13666759bcf30665abec84dec13adefc1fa86a:corpus/knowledge/navigation-history-bfcache-evidence.md:79:- U1 — No restore has been observed on this host. Whether the pinned build emits
```

`corpus/knowledge/navigation-history-bfcache-evidence.md:79-80`:

> - U1 — No restore has been observed on this host. Whether the pinned build emits
>   `BackForwardCacheRestore` on a loopback fixture is unmeasured.

The sentence "no committed probe performs a history step at all" is **absent
from the entry**. A whole-tree sweep for it:

```
$ git grep -n -i 'performs a history step\|no committed probe' 9e13666759bcf30665abec84dec13adefc1fa86a
...:.ufo/waves/round-24/w2/RevFrontierRows.md:60:probe performs a history step — `git grep -nE "navigateToHistoryEntry|goBack|history\.back\(|history\.go\(" HEAD -- 'scripts/*.mjs' '.ufo/waves/*/probes/*.mjs' '.ufo/waves/*/measure-*.mjs'` → zero hits. The status cell should read
...:.ufo/waves/round-24/w2/RevFrontierRows.md:61:roughly: "no probe performs a history step, and the Playwright-era launches
...:corpus/README.md:582:| Navigation-history evidence across a bfcache restore | docs-held, runtime open — the discriminator (`Page.frameNavigated.type = BackForwardCacheRestore`, `Page.backForwardCacheNotUsed` with `notRestoredExplanations`) is documented from the pinned tag; no restore has been observed on this host because no committed probe performs a history step at all (the `--disable-back-forward-cache` launch flag was a Playwright default, not a lane policy). | `corpus/knowledge/navigation-history-bfcache-evidence.md` §2–§5 (U1–U5); rows S104/S105; `corpus/evidence/round-24/sources/` |
exit=0
```

The verbatim source of the phrase is `corpus/README.md:582`, the frontier row
whose evidence cell cites the entry's §2–§5 (U1–U5). The entry's own nearby
text instead attributes the missing observation to the launch flag (lines
11-14: "The lane has never observed a restore — its own probe harness has
historically launched with `--disable-back-forward-cache`"). The round-24
reviewer (`RevFrontierRows.md:57-63`) judged that attribution "wrong in both
directions" and proposed the history-step reason, and README:582 carries it.
[INFERENCE] The entry body was never amended to match. This is a wording
inconsistency inside round-24's committed corpus, not a defect in C1's
measurable before-state.

## Post-baseline drift (context only)

```
$ git rev-parse HEAD
c8ef3084c6363f265b9d23285296ab3547654f57
$ git log --oneline 9e13666759bcf30665abec84dec13adefc1fa86a..HEAD
c8ef308 round-25: freeze claims, controls, census-before, wave-1 spec
$ git merge-base --is-ancestor 9e13666759bcf30665abec84dec13adefc1fa86a HEAD
exit=0
$ git ls-tree -r --name-only HEAD -- corpus/evidence/round-25
lines=0
$ git ls-tree --name-only 9e13666759bcf30665abec84dec13adefc1fa86a -- scripts/check-bfcache-receipt.mjs scripts/check-source-reopen-receipt.mjs
exit=0
```

The last command produced no output: neither counter script exists at the
baseline. Even at the current HEAD, `corpus/evidence/round-25` is still empty.

## Confidence and unknowns

- High confidence: sweeps (a), (b) and (c) bound the before-state. Each one
  states its exact command and its empty or classified result.
- High confidence: the U1 mis-citation. The phrase is absent from the entry
  file and present at README:582.
- Unknown: whether `.ufo/waves/round-24/*` text hits contain anything
  receipt-like. [INFERENCE] They are reports and specs; they are outside
  `corpus/evidence/` and outside the C1 counter's receipt path, and I did not
  open each one.
- LSP was not applicable. This is a git-tree text sweep over a historical
  revision, so semantic tracing has no target; `git grep` is the correct
  instrument here.
