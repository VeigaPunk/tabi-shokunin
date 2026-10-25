# ScoutRegistryIndependent — independent registry census + cross-lane URL check

Seat: `ScoutRegistryIndependent` (leaf scout, wave 2, round 27 / hyaku run 7, lane `tabi`).
Baseline lane tip: `f185b4e7ab10cd9e8925e8ec614c9c111772357d` (branch `master`).
Items attacked: C3 (coverage) — the landed registry row `S107`, the entry
`corpus/knowledge/redirect-and-retry-after-semantics.md`, and the census conformance of both.

**Verdict: C3's registry arithmetic is CONFIRMED at the tip (row added, nothing else edited, census exit 0,
used-by load-bearing, cross-lane sharing is report-only and allowed). Two receipt/process findings are recorded
(F1 stale tracked receipt, F2 dangling receipt path) and one scope-narrowing nit carried from wave 1 (F3). No
finding invalidates the claim.**

Read-only seat: nothing tracked was written; no git/jj writes; no sibling-lane writes; no shokuknow access; no
builds/linters/formatters; no network GETs by this seat (the RFC bytes were already committed and were read from
the tree); no tool installs (none needed — pacman not invoked).

**Tip moved under this seat during the run.** The tip advanced `5ed6484` → `bceb17d` mid-run (a concurrent
executor committed the wave-1 integration). Every number below was re-measured at `bceb17d`, and the census was
re-run against a clean `git archive` export of that tip rather than a moving working tree. This is disclosed
because it explains why an early read of the working tree disagreed with the committed row.

---

## 1. (a) Census re-run — `sources-census.sh validate --root … tabi`

Exact command (as named in the item):

```
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```

**Exit 0.** Output = 17 lines: 16 × `tabi W04 <id> duplicate url <url> across scopes` + 1 ×
`tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`.

Receipt: `scratch/ScoutRegistryIndependent/a-census-validate-tip.txt`.

**No `S107` line and no `9110` line appears in the census output** (`grep -E "S107|9110"` → empty). The 16 W04
warnings are **pre-existing** and unrelated to RFC 9110 (S058, S065, S066, S068, S069, S070, S073, S074, S075,
S076, S077, S095, S096, S098, S099, S100).

**Baseline↔tip differential (the decisive test).** Both revisions were exported with `git archive` and
validated with `--file` (isolating the registry from the moving tree):

| revision | rows | exit | E-codes | W04 count |
|---|---|---|---|---|
| `f185b4e7` (baseline) | 106 | 0 | 0 | 16 |
| `bceb17d` (tip) | 107 | 0 | 0 | 16 |

`diff` of the two normalized census outputs is **empty** — byte-identical finding sets. **C3 introduced zero new
census findings and zero regressions.** The census tool is self-consistent: `sources-census.sh selftest` → exit 0,
`selftest ok` (bash 5.3.20, GNU Awk 5.4.1).

**The lane's own registry gate also passes on the tip bytes.** Run against a temp export of tip `corpus/` (never
against the live tree):

```
node scripts/check-sources.mjs --root <tmp> --file corpus/SOURCES.md
SOURCES_GATE verdict=clean rows=107 tiers=A:92,B:6,C:9 status=queued:19,mined:79,rejected:9 findings=0
GATE_EXIT=0
```

**The census gate is not vacuous.** Four independent fixtures prove each S107-relevant rule actually bites (all
in `scratch/ScoutRegistryIndependent/`):

| fixture | mutation | result | exit |
|---|---|---|---|
| `e11-fixture.txt` | rename the used-by target away in a tip export | `file E11 S107 missing used-by corpus/knowledge/redirect-and-retry-after-semantics.md` | 1 |
| `e03-fixture.txt` | duplicate the `S107` row with a different scope | `file E03 S107 duplicate id` + `E04 … within scope` | 1 |
| `w04-e04-fixture.txt` | duplicate `S107` row twice, same scope | `E04 S901` + `E04 S902 … within scope` | 1 |
| `w04-fixture.txt` | duplicate `S107` row with a **different** scope | `file W04 S901 duplicate url www.rfc-editor.org/rfc/rfc9110.txt across scopes` | 0 (W04 is a warning) |

This confirms the E11 used-by check is live for S107 (not a no-op), and it pins the exact W04/E04 boundary the
item asks about in (b).

## 2. (b) Does `rfc9110.txt` appear in sibling registries? — cross-lane, and allowed

**Yes.** `rfc9110.txt` is present in four lanes' registries at tip:

| lane | row | URL form | scope (abridged) |
|---|---|---|---|
| kake | `S028` | `…/rfc9110.txt` | §4.2.1/§4.2.2 http(s) URI scheme validity |
| kake | `S033` | `…/rfc9110.txt` | §8.3, §5.6.2, §5.6.6 media types |
| mori | `S221` | `…/rfc9110.txt` | §15.4 redirection class / Location-header probe boundary |
| chousa | `S061` | `…/rfc9110.txt` | §15.5.5 404 / §15.5.11 410 status semantics |
| **tabi** | **`S107`** | `…/rfc9110.txt` | §15.4 redirect semantics + §10.2.3 Retry-After |

(kake `S010`/`S088` and mori `S042` use the `.html`/`#section-` forms, which normalize to a different key and
stay outside the `.txt` group.)

**This is a cross-lane shared URL, not a within-scope duplicate — allowed, and it gates nothing.** Evidence:

- Fleet `shared` mode: `www.rfc-editor.org/rfc/rfc9110.txt  shared  kake,tabi,mori,chousa`, **exit 0**, 57 shared
  URL rows fleet-wide. `shared` is report-only (receipt: `b-shared-fleet.txt`).
- **W04 is lane-local by construction.** `row_pass()` runs one `gawk` per registry file with per-file `seen` /
  `url_seen` / `url_scopes` arrays (`sources-census.sh:574-580`, emitted at `:645`). Cross-lane sharing is
  therefore structurally invisible to `validate` — it cannot produce W04 or E04.
- **Within tabi, `S107` is unique.** `git show master:corpus/SOURCES.md | grep -c "rfc-editor"` → **1**; the
  normalized URL occurs exactly once in tabi's registry. Hence no W04 and no E04 for S107, confirmed empirically
  by the census output containing no S107/9110 line.
- Cross-lane scope overlap is expressly permitted by the contract shape: QUALITY criterion 32
  (`corpus/QUALITY.md:132-138`) requires a *scope overlap with a sibling lane* to be dispositioned in
  `corpus/adjacency.tsv`. Tabi's `S107` is **not** an overlap claim — it is a fresh, independently re-grounded
  row on its own bytes, and tabi absorbed nothing from sibling registries (wave-1 `ConnSiblingOverlap.md:69`
  reaches the same reading; this seat re-derived it from the registries, not from that report).
- **The lane's adjacency gate is clean**: `node scripts/check-adjacency.mjs` → `ADJACENCY verdict=clean rows=10
  verified=10`, exit 0. `corpus/adjacency.tsv` is unchanged since baseline
  (`git log f185b4e7..master -- corpus/adjacency.tsv` → empty), so C3 did not perturb adjacency state.

**Sibling row ids do not collide.** `S107` also exists in kake (W3C XSD 1.1) and mori (omp docs) — different
documents, per-lane id spaces. `sources-census.sh` validates one file at a time, so cross-lane id reuse is not an
E03; the ids are lane-local by design.

## 3. (c) The diff — exactly one row added, zero edited

Exact command (as named in the item):

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff \
    f185b4e7ab10cd9e8925e8ec614c9c111772357d master -- corpus/SOURCES.md | grep '^+'
```

Output is **2 lines**: the `+++ b/corpus/SOURCES.md` header plus exactly **one** added row (`grep '^+' | grep -v
'^+++' | wc -l` → **1**). The removed-line count is **0** (`grep '^-' | grep -v '^---' | wc -l` → **0**).

**Stronger check — all 106 pre-existing rows are byte-identical.** Diffing the baseline registry against the tip
registry with the S107 line removed is **empty**:

```
diff <(git show f185b4e7:corpus/SOURCES.md) \
     <(git show master:corpus/SOURCES.md | grep -v '^| S107 ')
→ IDENTICAL: all pre-existing rows unchanged
```

Row count: `grep -cE '^\| *S[0-9]{3} *\|'` → **106 at baseline → 107 at tip**. Ids are contiguous with no
duplicate (`grep -o '| S[0-9]*' | sort | uniq -d` → empty ⇒ E03 clean).

**Qualification on "zero edited" — the added row was itself revised after landing.** The baseline→tip diff shows
one *added* line, but that line is not the bytes first landed. `S107` was added in `6ca3b89` as v1 and **edited in
`bceb17d`** to v2 (scope "The normative redirect semantics…" → "Documented redirect semantics…"; anchor gained
the §15.4 history-note locator and "7413" → "7413-7414"; teaches reworded from "308's preservation is an
inference in this text" → "RFC 9110's history note describes 308 as method-preserving but §15.4.9 does not restate
the rule normatively"). The tip's row bytes are `f85f3692…`, not the `adc6abe7…` bytes in the tracked receipt.

This does **not** break the item's arithmetic — the *registry diff* is one added row, zero edited rows, and the
v1→v2 edit touches only the row the round itself added, never a pre-existing row (proved byte-identical above).
It does mean the phrase "zero edited" must be read as "zero **pre-existing** rows edited". Wave-1
`RevSourcesS107.md` F1 recorded the same v1→v2 delta as an uncommitted mid-review mutation; **at the tip it is
committed**, so F1's action item ("commit deliberately, then re-run the gates") is now discharged — and I
re-ran the gates (§1): clean.

**The v2 edits are accuracy improvements, verified against the bytes** (see §5) — consistent with wave-1 F4.

## 4. (d) The used-by cell — file exists at tip and cites S107

**Used-by cell (tip `corpus/SOURCES.md:121`, column 12):** `corpus/knowledge/redirect-and-retry-after-semantics.md`
— exactly one path, no alternatives.

| check | command | result |
|---|---|---|
| exists at tip | `git ls-tree master corpus/knowledge/redirect-and-retry-after-semantics.md` | `100644 blob 086271e2678bb7f1df653822489e6b6d139145f3` |
| exists on disk | `test -f corpus/knowledge/redirect-and-retry-after-semantics.md` | YES |
| entry cites S107 | `git grep -lE '^source: S107 ' master -- corpus/knowledge \| wc -l` | **1** |
| which file | same command | `master:corpus/knowledge/redirect-and-retry-after-semantics.md` |
| S107 is the *only* S-id cited by the entry | `grep -oE 'S[0-9]{3}' \| sort \| uniq -c` | `1 S107` |
| baseline had no such entry | `git ls-tree f185b4e7 corpus/knowledge/…redirect…` | absent (no output) |
| baseline cited S107 | `git grep -lE '^source: S107 ' f185b4e7 -- corpus/knowledge \| wc -l` | **0** |

Entry front-matter at tip (line 3):

```
source: S107 — https://www.rfc-editor.org/rfc/rfc9110.txt — §15.4, §15.4.2-15.4.4, §15.4.8-15.4.9, §10.2.3 — RFC 9110, June 2022; fresh plain-text fetch this round (2026-10-25, 502941 bytes, sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a)
```

**The frozen C3 counting command reproduces exactly:** `git grep -lE '^source: S107 ' master -- corpus/knowledge
| wc -l` → **1** at tip, **0** at baseline — the claim's before/after ("0 → ≥1") holds as measured.

**The used-by cell is load-bearing, not decorative.** The E11 fixture (§1) renames the target away in a tip
export and the census returns `file E11 S107 missing used-by …` with **exit 1**. So the cell names a path the
census actually resolves on disk; a stale used-by would have failed the gate.

**The entry file is a round-27 addition, not a pre-existing file re-pointed.** Absent at baseline, present at tip
(blob `086271e2`); it was added in `6ca3b89` and revised in `bceb17d` (the `ground:` line moved from
"multi-step journey execution semantics — the redirect rules the lane's driver has never asserted" to
"documented-upstream redirect semantics — extends existing loopback 303/307 observations…", and the 308 paragraph
was re-anchored onto the §15.4 history note). The v2 `ground:` is the honest one: the entry is spec-ground, not a
new runtime measurement, and it now says so in the same field.

## 5. Anchor re-derivation against the committed bytes (reopening sources)

The committed bytes exist and are intact: `git ls-tree master .ufo/waves/round-27/assimilation/rfc9110.txt` →
`100644 blob 19a88abcb4df0744df2d55c6d1af53125b6d9bd2`; `git show master:… | sha256sum` →
`21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`; `wc -c` → **502941**. The row's anchor cell
claims exactly these values — they match.

Every line anchor in the tip row was re-opened in those bytes:

| row anchor | bytes at that range | content |
|---|---|---|
| §15.4 history note 7260-7264 | verified | "307 (Temporary Redirect) and 308 (Permanent Redirect) [RFC7538] were later added to unambiguously indicate method-preserving redirects" |
| §15.4.4 303 at 7413-7414 | verified | "The 303 (See Other) status code indicates that the server is redirecting the user agent to a different resource" |
| GET-or-HEAD at 7416-7418 | verified | "a retrieval request targeting that URI (a GET or HEAD request if using HTTP)" |
| §15.4.2 note 7384-7387 | verified | "a user agent MAY change the request method from POST to GET for the subsequent request" |
| §15.4.3 note 7406-7409 | verified | same note, pointing at 307 |
| §15.4.8 307 MUST-NOT 7493-7495 | verified | "the user agent MUST NOT change the request method if it performs an automatic redirection to that URI" |
| §15.4.9 308 at 7507-7523 | verified | 308 body; **no MUST-NOT clause** in the range (as the row states) |
| §15.4 rewrite step 4 at 7306-7307 | verified | "Change the request method according to the redirecting status code's semantics, if applicable." |
| §10.2.3 Retry-After at 4805-4813 | verified | 3xx clause 4805-4807; value grammar 4809-4813 |

**Every anchor resolves; no dangling locator.** The 308 claim is stated honestly as an inference: the row's
teaches cell says the history note "describes 308 as method-preserving but §15.4.9 does not restate the rule
normatively", and the entry marks it "**INFERENCE, not a located normative sentence**". The bytes support exactly
that hedge — 7493-7495 is 307's MUST-NOT, and §15.4.9 carries no equivalent clause.

## 6. Findings

### F1 (MEDIUM, process/receipt drift) — the tracked `s107-row.txt` receipt no longer matches the tip row

`.ufo/waves/round-27/assimilation/s107-row.txt` is a **tracked** file (`git ls-files` → listed; blob
`cf08ba73…`) whose content is the **v1** row (`adc6abe7eb0970ccee915b97a5bafd1bed9a5a89c5e33c4d1eeeff910b327570`).
The tip's row is **v2** (`f85f36923aef28e32dab39098be8121c7d340ac5e75b9e869c911123aaeaa8bc`):

```
git show master:corpus/SOURCES.md | sed -n '121p' | diff - .ufo/waves/round-27/assimilation/s107-row.txt
→ DRIFT: receipt s107-row.txt is v1, tip row is v2
```

The `README.md` in that directory describes the file as "the transformed fleet-schema row **actually appended**"
— that description is now false. The row itself is fine (§1, §5); the defect is that the round's own committed
evidence trail points at superseded bytes. A later reader auditing C3 by hashing `s107-row.txt` would compare
against v1 and conclude the row drifted. **Action for L1:** re-hash `s107-row.txt` against the tip row (or
re-commit it from `master:corpus/SOURCES.md` line 121) so the receipt matches the landed row.

### F2 (LOW, receipt path) — `xform-census.txt` names a mirror tree that no longer exists

`.ufo/waves/round-27/assimilation/xform-census.txt` ends with
`file ok /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/assimilation/validate/xform/corpus/SOURCES.md`,
but `.ufo/waves/round-27/assimilation/validate/` **does not exist** (`ls -d` → "No such file or directory"). The
`README.md` says mirror trees "were scratch; pruned after the receipts above were taken", which explains the
absence but leaves the receipt's own path dangling — the receipt cannot be re-run as printed. The *result* is
independently reproducible: validating the tip registry gives exit 0 with the same 16 W04 and no E-codes (§1).
**Action for L1:** either keep the mirror tree, or amend the receipt to name the pruned-input manifest
(`reg-ids`, `staged-ids`, `collisions`, `guard-fixture/`) as the reproduction source.

### F3 (LOW, locator nit, **carried from wave 1 `RevSourcesS107.md` F2 — still open at tip**) — the 503 sentence sits outside the cited span

The tip row's anchor cell cites "§10.2.3 Retry-After at **4805-4813**" while its teaches cell claims "Retry-After
may accompany any 3xx **and 503**". The 503 sentence is at **4803-4804** (verified in the committed bytes:
"sent with a 503 (Service Unavailable) response, Retry-After indicates how long the service is expected to be
unavailable to the client."), i.e. **outside** the cited span; 4805-4807 is the 3xx clause and 4809-4813 the value
grammar. The entry body does cite 4803-4804 correctly, so the knowledge is right and only the registry row's
anchor cell is short. The span should read 4801-4813 (or cite the §10.2.3 section). Unfixed at tip — wave-1
raised it and the v2 edit did not address it.

### F4 (INFO) — the tip moved during this run; all numbers re-measured at `bceb17d`

The lane tip advanced `5ed6484` → `bceb17d` while this seat was running, and `corpus/SOURCES.md` plus the entry
were edited in that commit. Every figure in this report was re-measured at `bceb17d`; the census was re-run
against a `git archive` export of that tip rather than the moving working tree. The tip is **still** `bceb17d` at
report time (`git rev-parse master` → `bceb17dd82446a3b7514dd9759ec733673b4ba0d`); if it moves again, re-run the
counting commands before quoting this report.

### F5 (INFO) — `E12` fires when a row-shaped line lands outside `## Registry`

Fixture note, not a defect in the landed row: appending a `| S9xx |` line *after* the registry section yields
`file E12 S901 row outside Registry section` (exit 1). Worth recording because it means "the row is in the file"
is not sufficient — the row must be inside the `## Registry` section, which the landed S107 is (line 121, between
`## Registry` and `## Paths`).

## 7. Bottom line for the L1

**C3's registry claims survive independent falsification at the tip.**

- (a) Census `validate --root … tabi` → **exit 0**, 17 lines, 16 pre-existing W04, zero E-codes; finding set
  **byte-identical to baseline**; the lane's own `check-sources.mjs` → clean, 107 rows, exit 0.
- (b) `rfc9110.txt` is shared across **four** lanes (kake, tabi, mori, chousa) — **cross-lane, report-only,
  allowed**; W04/E04 are structurally lane-local, and `S107` is unique inside tabi.
- (c) Diff baseline→tip = **exactly one added row, zero edited rows**; all 106 pre-existing rows byte-identical;
  106 → 107 rows.
- (d) Used-by names one existing path, present at tip and on disk; the entry's only S107 citation is its
  front-matter `source:` line; the frozen counting command gives **0 → 1**.

**Carry F1 and F2 to the L1 as receipt-hygiene actions; carry F3 forward as an open locator nit** (wave-1 F2,
unfixed). F5 is background for anyone appending rows.

**Confidence:** high on all counts and exit codes (each reproduced from a clean tip export, with the exact command
recorded); medium on the F1/F2 *significance* (the receipts are stale/dangling, but I did not observe the mutation
author or any instruction to edit receipts); high on F3 (both the span and the 503 lines were re-opened in the
committed bytes).

**Unresolved / out of bounds:** the author and time of the v1→v2 row and entry edits are not observable from
this seat's read-only position (ordering evidence only: two read snapshots plus the commit structure). Whether
`S107`'s cross-lane convergence should also be narrated in tabi's `adjacency.tsv` — QUALITY criterion 32
dispositions *scope overlaps*, and wave-1 `ConnSiblingOverlap.md:69` recommends tabi "report the convergence in
adjacency" — is a **scope judgment for the L1, not a defect I can call**: tabi absorbed nothing from sibling
registries and the adjacency gate is clean, so no row is required by the contract as written. The fleet's
`SOURCES-CONTRACT-v1.md` canonical text was not consulted (wave-1 `RevSourcesS107.md` F3 records it is
unobtainable within bounds), so the criterion-32 reading above is from `corpus/QUALITY.md` in-repo.

**Files written by this seat:** this report only, plus throwaway scratch under
`.ufo/waves/round-27/scratch/ScoutRegistryIndependent/`: `a-census-validate-tip.txt`, `b-shared-fleet.txt`,
`c-diff-baseline-tip.patch`, `d-tip-row-S107.txt`, `d-entry-frontmatter-tip.txt`, `e03-fixture.txt`,
`e11-fixture.txt`, `w04-e04-fixture.txt`, `w04-fixture.txt`, `SHA256SUMS.txt`. No tracked file was modified; no
git/jj write was performed; no sibling lane or shokuknow was touched; no installs were needed.
