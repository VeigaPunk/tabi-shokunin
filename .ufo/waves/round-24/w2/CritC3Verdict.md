# CritC3Verdict — round-24 w2 falsification of C3 (coverage, 0 -> 1)

Lane tip under test: `ad125e85c235e1c4ec6a08e398bd64da01f68a08` (`git rev-parse HEAD`).
Baseline per claims.json: `573c99e4885382db38babc3a6fc90e77afeb42a6`. Read-only seat;
all fixtures under `.ufo/waves/round-24/scratch/CritC3Verdict/`; no HTTP GET issued
(retained committed bytes plus this wave's own re-open copy used instead).
`TMPDIR=/home/vgpnk/tmp-tabi24` set for the one node gate invocation.

## Axes

| Axis | What a move can improve | Moves kept |
|---|---|---|
| Instrument vacuity | the counter refuses a do-nothing input | build a 6-line stub and score it |
| Declared-control existence | the control's named refusal mechanism exists | run the named gate on the stub |
| Provenance fidelity | anchor cells describe the committed bytes | `wc -c`/`sha256sum`/`cmp`/`grep -n` on committed blobs |
| Verifiability | the located quote re-derives mechanically | verbatim `grep -F`, then tag-stripped compare |
| Closure agreement | an independent re-open matches the anchors | hash each cited line across three same-round copies |

Every move is one command; none harmed another axis.

## Findings

### F1 — The counting command is a file-presence proxy; a do-nothing control reaches 1

The frozen counter `git grep -lE '^source: S10[45] ' <REV> -- corpus/knowledge | wc -l`:

- tip: `1`; baseline: `0` (both run verbatim).
- Built a stub fixture in `scratch/CritC3Verdict/fix/corpus/` = a full `cp -a corpus/`
  where `corpus/knowledge/navigation-history-bfcache-evidence.md` is replaced by a
  **6-line file** — header, two `source:` lines, the bare tokens `S104 S105`, nothing
  else (no quote, no span, no reading, no unknowns).
  `grep -rlE '^source: S10[45] ' fix/corpus/knowledge | wc -l` → **1**
  (`-l`/`git grep -l` semantics are identical; only the revision/path scope differs).
- The regex is a disjunction: a file carrying an `S105` row alone counts
  (`grep -lE ... stub-s105-only.md` → 1). `-l` counts files, not entries or rows —
  a file with N such rows still counts 1, and a file whose only match is inside a
  code fence or a table counts identically. Nothing in the command binds a body.
- Copying the two `source:` header lines into an **existing** knowledge file also
  reaches 1: zero new knowledge, full metric.

### F2 — The declared control is not failure-capable: the per-row quote check it names does not exist

claims.json C3 control: *"a skip-work control ... has no located quote to show; the
Gate's per-row quote check fails on it."*

- `node scripts/check-sources.mjs --root scratch/CritC3Verdict/fix` on the stub
  fixture → `SOURCES_GATE verdict=clean rows=105 ... findings=0`, exit **0**. The
  do-nothing entry is admitted clean by the only gate that reads SOURCES rows.
- `grep -c sha256 scripts/check-sources.mjs` → 0; no quote/span logic anywhere in
  the file (its checks: malformed_row, duplicate id/url, kind/tier/status,
  opened/recheck dates, tier inflation, used-by existence/citation — all structural).
  `check-adjacency.mjs` does carry a verbatim-quote instrument, but it governs the
  sibling-adjacency table (`sibling_quote` on the cited line), not SOURCES rows.
- No lane script binds the blobs at all (`grep -rn 'evidence/round-24/sources' scripts/`
  → 0). ScoutReopenS105 (w2) reached the same conclusion for the fleet census
  (`sources-census.sh` has no digest logic).
- Consequence: the claim's killRule — *"if any cited quote is absent from the bytes
  this round fetched, the row is refused"* — has no executor; nothing can be shown
  red. Under QUALITY 61's precedent (a detector that cannot be shown failing is not
  evidence the figure is right), the 0→1 delta measures the metric, not the claimed
  property.

### F3 — S105's anchor cell is mixed-basis: `82548 bytes decoded` contradicts its own digest

- Committed blob `corpus/evidence/round-24/sources/page.pdl`: `wc -c` = **61,911**,
  `sha256sum` = `e944a3b19fa2…9405be` — the digest the row pins.
- `61911 × 4/3 = 82548` exactly: the recorded byte count is the **base64 transfer
  size**, not the decoded size the label asserts. Three committed sites carry it:
  `corpus/SOURCES.md:120`, `corpus/knowledge/navigation-history-bfcache-evidence.md:4`,
  `corpus/lessons/round-24.md:16`. The fetching seat's own record says 61,911
  (`w1/ScoutCdpPage.md:10`, `w1/DistillW1.md:21`) — the error entered at integration.
- QUALITY 39 requires the digest *and* byte figure be re-derived from the retained
  decoded bytes; the figure fails that derivation. QUALITY 43 requires count-like
  cells be re-derived by command before commit; `wc -c` was one command away.
- Sibling w2 seat ScoutReopenS105 independently re-fetched the URL (HTTP 200,
  byte-identical to the committed blob) and filed the identical defect — the
  re-open **agrees** on digest and line anchors, **disagrees** on the byte figure.

### F4 — S104's digest anchor is a per-request nonce artifact, not a content identity

Three same-round fetches of `https://web.dev/articles/bfcache`, three digests:

| copy | size | sha256 |
|---|---|---|
| w1 scout (`scratch/ScoutBfcacheWeb/bfcache.html`) | 157,667 | `4535f93b…` |
| committed blob (`corpus/evidence/round-24/sources/bfcache.html`) | 157,667 | `0dd45292…` |
| w2 re-open (`scratch/ScoutReopenS104/bfcache-reopen.html`) | 157,663 | `df5cc100…` |

- Pairwise `diff`: every pair differs at exactly **two lines — 3418 and 3423**.
  Line 3418 is a per-request CSP `nonce="…"` (47 chars in both); line 3423 is the
  devsite app-config payload carrying the feature-flag/experiment list
  (6,148 vs 6,144 chars — the 4-byte size delta).
- Every cited span is byte-identical across all three copies: sha256 of line 2511,
  2531, and 2893 each match in all three files (`sed -n Np | sha256sum` — identical).
- So the row's `sha256` records the fetch session, not the content: **no future
  re-open can reproduce it**, yet it is written as the source's identity. The w2
  re-open answers my item's question directly: *agrees with the row's location
  anchors (lines/quotes), disagrees with the row's identity anchors (size, digest).*
- Entry U4 misreads this: it says the article *"changed between two fetches"*, hence
  *"its quoted spans are dated, not stable."* Refuted by the committed bytes — the
  article body is byte-identical across three fetches; only the nonce/config tail
  varies; the quoted spans are byte-stable. U4 also omits the round's third fetch.

### F5 — The S104 section anchor is fabricated: `§"What is the back/forward cache?"` does not exist

- `grep -ci 'what is the back' sources/bfcache.html` → **0**; `grep -c 'What is the
  back/forward cache'` → 0 (case-sensitive too). No heading of that name exists:
  the nearest heading before line 2531 is `<h2 id="basics">bfcache basics</h2>`
  (line 2513); before 2893 it is `<h3>Measure your bfcache hit ratio</h3>` (2857).
- The comparison table is real (the "Without bfcache enabled" cell at 2524 vs the
  quoted "With" cell at 2531), so the span holds — but the row's *named-section*
  anchor is invented. A section name quoted with `§"…"` asserts existence; it fails.

### F6 — The quote is located but not byte-verifiable; S105 has no located quote at all

- Entry line 23–24 is the only blockquote. The committed bytes carry the same
  sentence at line 2531 **wrapped in markup** (`<em>essentially instant</em>`):
  verbatim `grep -F` → 0 hits. After stripping tags and edge whitespace the two
  are character-identical (146 chars, `IDENTICAL_AFTER_TAG_STRIP`). So the quote
  is a rendered-text rendition: faithful, but a byte-exact checker fails on the
  entry's own quote, and no lane instrument performs the normalization.
- QUALITY 39 requires quote offset/excerpt be re-derivable after decoding the
  retained bytes; here the derivation exists only in the w1 scout's prose
  (`w1/ScoutBfcacheWeb.md` records line+byte-offset).
- S105 carries **no blockquote at all** — citations are inline fragments
  (`NavigationType`, `backForwardCacheNotUsed`, `notRestoredExplanations`). Every
  cited symbol/line is verbatim-true at the pinned bytes (verified: 1345
  `BackForwardCacheRestore`, 1706 `experimental event backForwardCacheNotUsed`,
  1713 required `notRestoredExplanations`, 1715 optional `notRestoredExplanationsTree`),
  but "quote located, span named" holds for only one of the two rows in the
  blockquote sense the claim implies.

### F7 — Does the entry actually rest on the rows? Split answer

- **S105 side: fully grounded.** Bytes committed and immutable (w2 re-open was
  byte-identical); every cited line/symbol exact; the `notRestoredReasons`-absent
  contrast verified by sweep (`grep -c notRestoredReasons` → 0, all spellings);
  internal cross-ref `multi-step-journey.md:215-219` verifies verbatim at the tip.
- **S104 side: spans real, anchors weak.** Quotes sit at the cited lines and are
  byte-stable, but the section name is false (F5), the digest is unreproducible
  (F4), and the quote is normalized-not-verbatim (F6).

### F8 — Strongest counterexample

The 6-line stub at `scratch/CritC3Verdict/fix/corpus/knowledge/navigation-history-bfcache-evidence.md`
is the strongest local counterexample available: the frozen counting shape scores
it 1; the only SOURCES-reading gate (`check-sources.mjs`) returns `findings=0`;
and the claim's own control — the asserted per-row quote check — has no
implementation to refuse it. It satisfies every letter of the metric while
performing zero of the declared work. Even a control in the claim's own narrower
shape ("copies a staged entry") counts identically.

## Impact on the claim

- The observation "after: 1" is **true as measured** (one file carries the rows;
  the entry is genuine and S105-anchored). C3 is not a fabrication.
- But the claim is **not failure-capable at the counter level**: nothing in the
  measurement distinguishes "entry citing sources re-opened this round" from
  "file carrying two header lines" — the metric's letter, not its spirit, is
  satisfied, and the declared control's refusal mechanism is absent. This is a
  canonical-judge-level problem (vacuously satisfiable metric + nonexistent
  control), not a fixable defect: a strict judge should require the metric to be
  restated, not merely the cells repaired.
- Subordinate fixable defects: F3 (mixed-basis byte figure ×3 sites), F4/U4
  (false "article changed" inference; unreproducible digest pinned as identity),
  F5 (invented section name in the `source:` line).

## Smallest safe correction

1. **Restate the metric** (the honest, minimal change): the command counts
   "knowledge files carrying a committed `source: S10[45]` row first admitted this
   round." Add a content leg a header-copy cannot satisfy — require `^verified-at:`
   and ≥1 `^> ` line, and **bind each row's (bytes, sha256) pair to a committed
   blob** under `corpus/evidence/round-24/sources/`:
   `git show <REV>:corpus/evidence/round-24/sources/page.pdl | sha256sum` vs the
   row's digest **and** `wc -c` vs the row's byte figure — the second comparison is
   precisely where F3 fails, so this leg both kills the stub and enforces
   QUALITY 39/43 mechanically.
2. **Repair the provenance cells** (3 edits): `82548 bytes decoded` →
   `61911 bytes decoded (82548 raw base64)` at `SOURCES.md:120`,
   `knowledge/navigation-history-bfcache-evidence.md:4`, `lessons/round-24.md:16`;
   replace `§"What is the back/forward cache?" comparison table` with
   `§bfcache basics comparison table` (the containing heading) or drop the section
   name and keep the line-2531 span.
3. **Amend U4** to the observed fact: fetched bytes differ only at the two tail
   lines (CSP nonce, devsite config); all cited spans are byte-stable; the digest
   is per-fetch and binds the committed copy, not the URL.

## Observation / inference / unknown

**Observed** (command per number): tip count 1 / baseline 0; stub fixture scores 1
under the same regex and `check-sources.mjs` exit 0 findings=0; page.pdl 61,911 B,
sha `e944a3b1…`, 61911×4/3=82548; three S104 copies with pairwise diffs only at
lines 3418/3423; cited lines 2511/2531/2893 sha-identical across all copies; line
2531 tag-stripped == the blockquote (146 chars); `grep -c sha256 check-sources.mjs`
→ 0; section name absent in all spellings; S105 symbols exact at 1345/1706/1713/1715.

**Inference**: the 82548 figure was copied from the fetch transcript's transfer size
and labelled "decoded" (the w1 seat recorded 61,911); the `0dd45292` digest was
recorded believing it content-addresses the article (it session-addresses the
fetch); the section name was paraphrased from the article's topic rather than
copied from a heading.

**Unknown**: whether the `fetched 2026-10-25` timestamps are provable (mtimes are
consistent, not proof); whether any *other* SOURCES row has the same mixed-basis
error (not swept beyond S104/S105 — ScoutReopenS105 notes only S105 says "bytes
decoded"); whether a `SOURCES`-row quote/normalization check exists in any gate
outside `scripts/` (fleet `sources-census.sh` reported as digest-free by
ScoutReopenS105; this seat read the lane scripts only).

## Tooling

No installs or upgrades (curl/grep/sed/diff/cmp/sha256sum/node all present).
TMPDIR redirected to `/home/vgpnk/tmp-tabi24` per host note (created it).
No HTTP GET issued; fixture corpus copy lives in this seat's scratch dir and is
gitignored by the round-24 rule. No builds/linters/formatters; one node gate run
(`check-sources.mjs --root <fixture>`), read-only against a scratch copy.
