# RevS151 — re-open S151 (git-cat-file docs)

- Seat: RevS151 (leaf, no subagents)
- Date: 2026-10-29
- Task: re-open https://git-scm.com/docs/git-cat-file (read-only GET), verify sha256 == 624464ef7a3d64de06038200bff85ac09389a9d217d379dd660aa6b5165048d7; verify registry row S151 in `corpus/SOURCES.md`: quote `Instead of the content, show the object type identified by` verbatim flat-byte substring of `.ufo/waves/round-43/sources/git-cat-file.html`, ending before the `<span>` placeholder, ≤25 words; judge whether the row's scope claim (the C2 r1 type gate) is supported by the `-t` option text.

## Observed commands and output

1. Fresh read-only GET into scratch (no installs; see Tooling):
   ```
   $ curl -fsSL --retry 3 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-r43-RevS151-reopen' \
       -o git-cat-file.html https://git-scm.com/docs/git-cat-file
   -rw-r--r-- 1 vgpnk vgpnk 79360 ... git-cat-file.html
   $ sha256sum git-cat-file.html
   624464ef7a3d64de06038200bff85ac09389a9d217d379dd660aa6b5165048d7
   ```
   -> matches the pinned expectation byte-for-byte (also equals the size 79,360 B recorded in row S151).

2. Frozen repo copy vs fresh download:
   ```
   $ cmp .ufo/waves/round-43/sources/git-cat-file.html git-cat-file.html
   FROZEN==FRESH byte-identical
   $ sha256sum .ufo/waves/round-43/sources/git-cat-file.html
   624464ef7a3d64de06038200bff85ac09389a9d217d379dd660aa6b5165048d7
   ```
   The frozen source at commit 7ca6f018280b08dcc6c519e11ecc2c1ccbfc62bc is byte-identical to what the URL serves today (2026-10-29).

3. Verbatim-quote verification (frozen file):
   ```
   $ grep -c -F 'Instead of the content, show the object type identified by' git-cat-file.html
   1
   $ grep -n -F 'Instead of the content, show the object type identified by' git-cat-file.html
   2234:<p>Instead of the content, show the object type identified by
   ```
   HTML context, lines 2232-2236 (frozen file):
   ```html
   <dt class="hdlist1" id="Documentation/git-cat-file.txt--t"><a class="anchor" href="#Documentation/git-cat-file.txt--t"></a>-t </dt>
   <dd>
   <p>Instead of the content, show the object type identified by
   <span class='synopsis'><em><span class="hover-term" data-term="object">&lt;object&gt;</span></em></span>.</p>
   ```
   - The quote is a flat-byte substring, occurs exactly once, and ends immediately before the `<span class='synopsis'>…<span class="hover-term" …>&lt;object&gt;</span>…</span>` placeholder. CONFIRMED.
   - Word count: Instead/of/the/content,/show/the/object/type/identified/by = 10 ≤ 25.
   - It sits in the `<dd>` of the `-t` option (`dt` id `…--t`), i.e. it IS the `-t` option text. The `-s` option has a parallel sentence ("…show the object size…"), so the "object type" reading is anchored to `-t` specifically.

4. Type names on the same page (scope support): the `<type>` option text (lines 2257-2260) names the object types explicitly — "ask for a "tree" with `<object>` being a commit object that contains it, or to ask for a "blob" with `<object>` being a tag object that points at it" — so blob and tree are page-attested object types; `-t` shows which one `<object>` is.

5. Empirical confirmation of the gate (scratch fixture, created and deleted under /fast/scratch/hyaku/tabi-r43/RevS151; `git rev-parse --show-toplevel` asserted == fixture dir before commit):
   ```
   HEAD               -> commit
   HEAD^{tree}        -> tree
   HEAD:measure.txt   -> blob
   git cat-file blob HEAD:measure.txt -> measure-bytes   (content round-trip intact)
   ```

## Judgment on registry row S151

Row (corpus/SOURCES.md line 165, quoted in full): `S151 | git-cat-file manual — https://git-scm.com/docs/git-cat-file | docs | A | committed-bytes type discipline: 'git cat-file -t' distinguishes a blob from a tree, the fix surface for the r42 checker tree-object defect (CritPredicateSentence P-A) | §-t option, git site render (79,360 B, sha256 6244…d7); opened 2026-10-29 | Instead of the content, show the object type identified by | mined | 2026-10-29 | on-release | corpus/knowledge/receipt-authenticity-signing-round-43.md`

**AGREE** with the row. Reasons:

1. **Locator/quote exact.** The recorded byte size (79,360 B) and sha256 (624464ef…48d7) match both the live re-open and the frozen copy, and the quote is a verbatim, unique, flat-byte substring of the frozen html ending before the `<span>` placeholder, ≤25 words. The locator "§-t option, git site render" is accurate.
2. **Scope claim is supported by the cited text.** The `-t` text says "show the object type identified by `<object>`"; git's object types include blob and tree (named on the same page at the `<type>` option). Therefore `git cat-file -t <rev>` emits a type discriminator that separates a blob from a tree — exactly the r1 gate C2 needs ("r1 blob-type gate (cat-file -t, S151)": refuse when the resolved object of `<rev>` is not a blob). Empirically confirmed in (5): one command, three distinct type strings.
3. **No overreach.** The row claims only the mechanical capability (type discipline / fix surface); it does not attribute the r42 defect narrative to the page itself. The parenthetical "(CritPredicateSentence P-A)" is project context, correctly scoped to the row's use column rather than to the source text.

No disagreeable element found. One neutral nuance (not a defect): the `-t` option line alone does not enumerate the type vocabulary; the enumeration leans on the same page's `<type>` discussion and git's object model. The page as a whole supports the claim, so the locator remains honest.

## Evidence paths

- Frozen source: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/sources/git-cat-file.html` (sha256 624464ef7a3d64de06038200bff85ac09389a9d217d379dd660aa6b5165048d7; quote at line 2234, `-t` dt at line 2232, type names at lines 2257-2260) — in-repo, not duplicated.
- Registry row: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md` line 165.
- Fresh-download bytes were compared (`cmp` byte-identical) in scratch `/fast/scratch/hyaku/tabi-r43/RevS151/` and the scratch tree (incl. the git fixture) was deleted before yield per seat rules; receipts that matter are quoted above.

## Tooling record

- No installs or upgrades. `/home/vgpnk/.omp/agent/RULES.md` read first, as required; nothing to record beyond that (no pacman — host-wide pause respected; no uv/binary installs needed; only `curl`, `sha256sum`, `cmp`, `grep -F`, `sed`, and `git` from the existing PATH were used).
- Network: one read-only HTTPS GET to the named URL. No logins, no forms, no consequential actions.

## Limitations

- The page render carries no git-version marker in its title/footer on this fetch, so "on-release" is taken from the row's own status field; the frozen bytes, not the version label, are what C2's pin relies on.
- The registry row's reference to the r42 checker defect and CritPredicateSentence P-A was not re-audited here (other seats cover the checker); this seat verifies only the source and the type-gate scope claim.

VERDICT ok re-open verified: fresh GET sha256 matches pin 624464ef…48d7, frozen copy byte-identical, quote verbatim/unique/10-words ending before the span placeholder, and the -t text plus an empirical blob/tree/commit run support the C2 r1 type-gate scope claim — AGREE with row S151
