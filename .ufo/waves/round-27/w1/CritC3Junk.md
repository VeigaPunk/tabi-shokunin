# CritC3Junk — C3 honesty attack (junk reachability, real-vs-relabelled coverage, anchor cell)

Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`;
tip (HEAD `refs/heads/master`) `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`. Read-only reporter: no tracked file
edited, no build/linter/formatter/gate-run on the lane repo, no pacman, nothing installed or upgraded. Throwaway
fixtures live in `.ufo/waves/round-27/scratch/CritC3Junk/` (gitignored by `.gitignore:5`).

This file supersedes the 14:36 revision of `CritC3Junk.md` (written at HEAD `336d5d1`). Its counter numbers
reproduce; its census arm was inferred from `scripts/check-sources.mjs` source, mine is executed against fixtures.

## 0. State at measurement — tip and worktree are different texts

| Object | Identity |
|---|---|
| tip entry blob | `git show HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md \| sha256sum` → `848c032117d199904fed6da98d38a9fe55d8ca93562d890dbf1971511c532e22` |
| tip S107 row line (`corpus/SOURCES.md:121`) | `git show HEAD:corpus/SOURCES.md \| awk 'NR==121' \| sha256sum` → `adc6abe7eb0970ccee915b97a5bafd1bed9a5a89c5e33c4d1eeeff910b327570` |
| worktree entry | `sha256sum corpus/knowledge/redirect-and-retry-after-semantics.md` → `d5878a837a8f1c0a3257e357751e876940b18eb673ebab459b69cac39284c7d7` |
| worktree S107 row line | `awk 'NR==121' corpus/SOURCES.md \| sha256sum` → `f85f36923aef28e32dab39098be8121c7d340ac5e75b9e869c911123aaeaa8bc` |
| clock at those hashes | `date -u +%H:%M:%SZ` → `17:43:05Z`; refresh at `17:45:14Z` → entry and row line unchanged, `corpus/SOURCES.md` = `e7e32abacda4e0d3bfecef1adcfd2614240df8cc5dcf74257edbb114748f9403` |

`git status --porcelain` at that instant: ` M LOG.md`, ` M SCORECARD.md`, ` M corpus/QUALITY.md`,
` M corpus/README.md`, ` M corpus/SOURCES.md`, ` M corpus/knowledge/redirect-and-retry-after-semantics.md`,
` M corpus/lessons/round-27.md`, ` M scripts/check-s106-evidence.mjs` (plus the untracked wave files). The L1 is
landing in-flight corrections *while this wave reads*: the worktree `ground:` line and the worktree 308 bullet
already differ from the tip (worktree `ground:` and 308 text quoted in §3, row text in §4). Every verdict below is keyed to the **tip**, because the closure
and the claims measure a revision; the worktree is reported separately as unlanded and still moving.

## 1. Counters re-run by me (none copied from the author)

| Command | Result |
|---|---|
| `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` | `f185b4e` → **0**; `6ca3b89` → **1**; `5ed6484` → **1** |
| `git show <REV>:corpus/SOURCES.md \| grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'` | `f185b4e` → **106**; `6ca3b89` → **107**; `5ed6484` → **107** |
| `wc -c .ufo/waves/round-27/assimilation/rfc9110.txt` + `sha256sum` | **502941** B; `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` |
| `git cat-file -p HEAD:.ufo/waves/round-27/assimilation/rfc9110.txt \| sha256sum` | same `21c1cdce…` — the bytes the entry cites are committed, not scratch-only (file tracked, added in `6ca3b89`) |
| `grep -c W04 .ufo/waves/round-27/census-after-c3.txt`; `wc -l` | **16** W04 warnings; 17 lines; last line `tabi ok …/corpus/SOURCES.md` |
| `tail -3 .ufo/waves/round-27/assimilation/xform-census.txt` | `file ok …/validate/xform/corpus/SOURCES.md` |
| `grep E09 .ufo/waves/round-27/assimilation/staged-census.txt` | `file E09 S124 recheck=730d (errata only)` — do-nothing arm bites |

I did **not** run the fleet `sources-census.sh` (it is not in this lane and re-running it is the census seat's job);
I read its two receipts. I **did** run the lane-side census gate `scripts/check-sources.mjs` on fixtures (§2).

Quote sweep, my own rule — extract `"([^"]{12,}?)"` (DOTALL), normalise `\s+`→space, then a second normalisation
that also strips the RFC's note-table `|` markers:

| Entry state | spans | resolve plain | resolve only after stripping `\|` | not located |
|---|---|---|---|---|
| tip blob `848c0321` | 9 | 6 | 1 (34-word 301/302 note, `|  *Note:*` at 7384-7387) | 2 (`"the form was POSTed"` = journey paraphrase; `"if this behavior is undesired"` = case-only match of 7386) |
| worktree `d5878a83` | 8 | 6 | 1 (same 34-word note) | 1 (`"the form was POSTed"`) |

`sed -n '7382,7390p' …/rfc9110.txt | cat -A` shows the cause: the note is a hard-wrapped `|  *Note:*` table block,
so byte-exact identity is unreachable at any line break or marker. The claim's kill rule ("if any quote … is
absent from this round's fresh bytes") does not define "absent", and the decisive quote is exactly the one where
that matters.

## 2. (a) Junk reachability — counterexample executed, both mechanical gates pass junk

**Fixture A — the counting command.** `D=.ufo/waves/round-27/scratch/CritC3Junk/junkrepo`,
`git -C "$D" init -q`, `rev-parse --show-toplevel` verified `== "$D"`, one 149-byte file
`corpus/knowledge/junk.md` = `# Junk entry` / `source: S107 (filler, no URL, no quote, no location)` / one lorem
line. Commit `e40e8da9a099534542cabd6ac75ef1c76d1c7f50`.

```
git -C "$D" grep -lE '^source: S107 ' "$REV" -- corpus/knowledge | wc -l   ->  1
```

A file with no quote, no location and no reachable byte satisfies the frozen counting command.

**Fixture B — the lane census gate.** `R=.ufo/waves/round-27/scratch/CritC3Junk/junkroot` with
`corpus/SOURCES.md` = header + the **byte-copied S107 row** (`awk 'NR==121' corpus/SOURCES.md`) + `## Paths` /
`## Search log` / `## Leads (unopened)`, and the same 149-byte junk at the row's registered used-by path
`corpus/knowledge/redirect-and-retry-after-semantics.md`:

```
node scripts/check-sources.mjs --root "$R"
-> SOURCES_GATE verdict=clean rows=1 tiers=A:1,B:0,C:0 status=queued:0,mined:1,rejected:0 findings=0   rc=0
```

Re-run with the worktree row (`f85f3692`) as the registry row: identical `verdict=clean … findings=0`, `rc=0`.
Negative variant (same junk under a different filename): `FINDING id=used_by_missing fleet=E11 row=S107
detail=path_missing`, `rc=1`. That is the gate's whole coupling: the file must exist at the cell's path and contain
the token `S107` — `check-sources.mjs:232` is a bare token regex
(`new RegExp(\`(?<![A-Za-z0-9])${escaped}(?![0-9])\`)`), tested at `:339`; `:6` of SOURCES.md states the
instrument itself "cannot see whether a source was opened".

**Which frozen gate is supposed to stop it?** The claim's own control sentence — "a junk entry naming S107
without located quotes must fail the QUALITY review seat" (14 words, `.ufo/waves/round-27/claims.json` C3.control)
— applied through the prose admission bar `corpus/QUALITY.md:1-8`: criterion 2 "Every claim carries a source: a
measured anchor (path:line, command, evidence id)". No lane gate reads entry prose: the only scripts naming
`corpus/knowledge` are `check-freshness.mjs` (byte-witness `ls-tree`), `check-sources.mjs` (path + token),
`check-user-round-contract.mjs` (pointer path) and an unrelated round-13 harness.

**Verifiable by the closure, or judgment?** Judgment, with an unsound mechanical proxy:

- The seats that carry the arm in `w1-spec.json` are `RevEntryC3` (e) ("does the entry carry real content that a
  'source: S107' filler could not fake?") and `ExecQualityGate` ("extract each double-quoted span … grep it …
  report which entry quotes are NOT found verbatim"). Neither plants a junk mutant; (e) is a reading, and the
  mechanical rule is vacuous on zero quotes — a filler file yields "no quote missing" unless a minimum-count arm
  exists — while on the real entry it reports false negatives under byte-exact matching (0/9 at tip due to
  wrapping and the `|` note table, measured above).
- So the mechanical surfaces (`count≥1`, `census exit 0`, `rows 106→107`) are junk-blind by measurement, and the
  discriminating surface is a seat's judgment.

**Is the claim falsifiable enough?** Its number is: I reproduced 0→1 and 106→107. Its *meaning* is falsifiable in
principle — I named a discriminating test that resolves it (§6, correction 2) — but the frozen text does not name
such a test and leaves "absent" undefined at the one quote where byte-exactness fails. The claim is honest that
the arm is deferred ("carried to wave falsification"), so this is a counter-design defect, not a false claim.

## 3. (b) "Documented-upstream" coverage — real delta, plus a falsified novelty sentence at the tip

Baseline sweeps (mine): `git grep -cE '\b3xx\b' f185b4e -- corpus` → **0** matches; `git grep -niE 'post to
get|MAY change the request method' f185b4e -- corpus` → **0**; `git grep -niE 'See Other|GET or HEAD' f185b4e --
corpus/knowledge` → **2** hits, both status-name text (`external-class-fixture-v2.md:384,391`); `git grep -ni
'retry-after' f185b4e -- corpus/knowledge` → **15 lines in 7 files**, every one a 429/403/rate-shape context;
`git grep -n 'RFC 7538' f185b4e -- corpus` → **0**.

Pre-existing redirect ground was already measured, not merely mentioned (`git grep -li 'redirect' f185b4e --
corpus/knowledge` → **13 files**):

| Pre-existing, with location | What it already asserts |
|---|---|
| `external-class-fixture-v2.md:1` — "a CDP journey runner on 19542 driving headless chromium 152.0.7977.82" | the round-6 redirect chain was run by the lane's *journey runner* |
| `external-class-fixture-v2.md:43` — "302 → 303 → 307, a cross-path hop" | the chain instrument |
| `external-class-fixture-v2.md:486` — "R3 — 307 preserves method and body end-to-end." | measured: wire POST→POST, `bodyBytes 8` |
| `stateful-fixture-evidence.md:520-529` (L1b) — post-303 "changed to GET (server log: `GET /result`)" vs post-307 "**preserved POST** (server log: two POST lines; body `k=v&n=12` = 8 B delivered)" | measured *both* method outcomes, 303 vs 307 |
| `layer-routing-synthesis.md:146` — "v2's 307 cell measures method/body preservation across one hop (RT6)" | the method dimension was classified (within one hop) |
| `external-class-fixture-v2.md:65` — `Retry-After` "presence/value as a shape only" | Retry-After recorded as a 429 shape, never acted on |

**Genuine delta (documented, absent at baseline):** (1) 301/302 **MAY** rewrite POST→GET (§15.4.2 note,
7384-7387) — zero prior mention of any method rewrite, and directly relevant to the lane's protected POST cells;
(2) `Retry-After` **with any 3xx** (§10.2.3, 4805-4807) — prior ground holds it only for 429/403 shapes;
(3) 303's GET-or-HEAD retrieval sentence (7416-7418), traversed before but not classified by spec text.

**Re-labelled ground:** the 307 MUST-NOT bullet and the 308 boundary restate what R3 / L1b already measured; the
new text adds the spec sentence, not new knowledge. The entry itself says "**Documented upstream, not measured
here.**" and the README frontier row keeps `measured redirect untested` — that part is honest.

**Falsified at the tip.** Tip `ground:` (line 6): "multi-step journey execution semantics — the redirect rules the
lane's driver has never asserted" (10 words). The word "driver" does not rescue it: v2's instrument is a CDP
journey runner (above) and R3 is a measured assertion of 307's rule; L1b measured 303→GET vs 307→POST. Worktree
`ground:` (unlanded, `d5878a83`) corrects it to "documented-upstream redirect semantics — extends existing
loopback 303/307 observations …" — accurate, but not in any commit, so the tip still carries the false sentence.
`corpus/README.md:605` has the same overstatement ("the round-6 loopback fixture's redirect chain was traversed,
never classified", 10 words); R3 is a classification of the method dimension of one leg.

## 4. (c) S107 anchor cell — evidence, not bloat

Both states measured the same way — `python3`: rows matching `^\|\s*S\d{3,}\s*\|`, anchor = `split('|')[6]`,
length in characters, `n=107` in both:

| state | S107 anchor | registry median / p90 | next-longest anchors | S107 row | longest row |
|---|---|---|---|---|---|
| tip `adc6abe7` row line | **414** | 123 / 269 | `S046` 378, `S105` 341 | **977** | 1159 (`S079`); S107 is 2nd |
| worktree `f85f3692` row line | **550** | 123 / 269 | `S046` 378, `S105` 341 | **1174** | 1174 (S107) |

At the tip the cell is the registry's longest by 36 chars; the unlanded edit lengthens it to 550 by adding the
§15.4 historical-note span (7260-7264) that the new 308 bullet cites, which is precisely the load-bearing text,
and it makes the row the longest as well.

Shape comparison, measured on the adjacent rows: `S105` (341) = tag + byte count + sha256 + decoded line numbers;
`S106` (178) = tag + decoded lines + comment; `S089`/`S091` = commit + `file.ts:line-line` maps. So "identity
marker + digest + line map" is the established species for A-tier rows whose entry cites exact lines; S107 is the
same species at the top of its range, not a new one.

Content check: each of the cell's line spans maps to an entry bullet (7413/7416-7418; 7384-7387 and 7406-7409;
7493-7495; 7507-7523; 7306-7307; 4805-4813) and I re-located every opening line in the committed bytes. The
negative clause "no MUST-NOT clause in these bytes" is true by my own sweep:
`awk 'NR>=7230&&NR<=7531 && /MUST NOT/'` returns exactly `7494`.

Blemishes, none a bar violation: (i) two cited ranges include a trailing blank line — `7523` is empty
(`awk 'NR==7523'` → `[]`) and `4813` is empty, so `7507-7523` and `4809-4813` are off by one trailing blank;
(ii) bytes+sha256 now appear three times in one landing (entry `source:` line, row anchor, README Sources cell);
(iii) the "no MUST-NOT" argument duplicates the entry's INFERENCE paragraph — the worktree row moves its meaning
into `teaches` and keeps the parenthetical, so the duplication survives.

## 5. Cross-check of a sibling finding (scope discipline of the ≤25-word bar)

`ExecQualityGate.md` V1 applies the ≤25-word quote cap to the entry's 34-word note quote. That cap is scoped by
`corpus/SOURCES.md:6` to registry-row evidence ("≤25-word quote with location") and to lecture/lesson quotes; it
is not an entry rule in practice. My sweep: `python` over `corpus/knowledge/*.md`, double-quoted spans >25 words
→ **38 of 46** entries qualify (e.g. `source-recheck-round-18.md` 2016-word span, `closeout-r11.md` 23 such
spans). Applying V1 to entries would refuse 38 of the 46 existing entries, so V1 is a category error, not a defect of this
landing. V2 (byte-exact absence) stands and is the same issue as §2's undefined "absent".

## 6. Impacted axes

- **coverage** — improved, narrowly: two genuinely new documented facts (301/302 rewrite; 3xx Retry-After);
  the measured frontier is unchanged and the entry says so.
- **calibration** — harmed at the tip by one falsified sentence (`ground:`) and one README overstatement; the
  worktree fix is unlanded, so a closure that lands it closes the harm; a closure that drops it re-opens it.
- **operability** — unchanged this round: no gate, selftest or counter reads entry content; the junk-blind
  counter is on the record, not repaired.
- **depth / freshness / adjacency** — not impacted by C3 (no browser, no new external URL beyond the documented
  RFC GET, no sibling surface).

## 7. Smallest safe corrections (priority order)

1. **Land the worktree one-line `ground:` fix** (already staged as 1 insertion/1 deletion) and narrow
   `corpus/README.md:605` to "traversed; 307 method preservation classified in R3; 301/302 rewrite and 3xx
   Retry-After not classified". Without the first, the tip's novelty sentence stays falsified by
   `external-class-fixture-v2.md:486` and `stateful-fixture-evidence.md:528`.
2. **Make the C3 counter discriminating** instead of seat-dependent: extract the entry's quoted spans,
   require `≥1`, normalise whitespace **and** strip the RFC note-table `|` markers before matching, and exit 1
   on any miss. On the current entry this yields 8/8 located except the acknowledged paraphrase; on the 149-byte
   filler it fails at "no quote". Then define "absent" in the kill rule as "absent under normalisation N" so the
   7384-7387 note cannot be silently rescued.
3. **Fix the two trailing-blank line ranges** — `7507-7522` (7523 is empty) and `4809-4812` (4813 is empty;
   4811 is an interior blank inside the range) — cosmetic but the anchor is the evidence.
4. No change to the anchor's density: every span is load-bearing (the worktree's added §15.4 historical-note
   span is the citation for the new 308 bullet), so trimming it would remove re-derivable locations, not bloat;
   the only cut-worthy text is the duplicated MUST-NOT argument, which the worktree already moved into `teaches`.

## 8. Verdict

**Improved — narrowly, on the documented axis only, and with the counter's junk-blindness disclosed rather than
hidden.**

- The delivered entry is not junk: every source quote resolves in the committed 502941-byte bytes after document
  normalisation (7 of 9 at tip; the residuals are a journey paraphrase and a case-only fragment, §1 table), the 308 INFERENCE is correctly labelled and correctly bounded (`§15.4.9` really carries no
  MUST-NOT; my sweep found only 7494 in 7230-7531), and the registry row is structurally clean under the lane
  census gate.
- But the claim's *counter* cannot distinguish the delivered entry from a 149-byte filler (executed, both
  mechanical surfaces pass), and its *control* is a judgment seat. The claim is honest about that; read as a
  mechanistic gate it would be wrong.
- At the measured tip the entry's own `ground:` sentence is false against the lane's measured R3/L1b ground. The
  in-flight worktree edit fixes it; if that edit lands, calibration returns to neutral and I would call this
  **improved** without qualification. If it does not land, drop "improved" to "unchanged with a calibration
  defect".

Observation / inference / unknown are kept separate above: every count and hash is a command output; the
"would refuse 38 entries" statement is a mechanical count with a stated rule; the judgment that the counter
design is inadequate is an assessment, not a measurement. Unknown: whether the L1's unlanded rewrite survives
integration, and whether the fleet census would also pass the junk fixture (not run from this lane; the lane-side
gate did).

## 9. Tooling

Nothing installed or upgraded (no pacman, no uv/npx/binary). Read-only git + node + python3 from the host.
