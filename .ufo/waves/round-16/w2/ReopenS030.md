# ReopenS030 — S030 repo README line 319 (declarative outside spec)

**Verdict: HOLDS.** The quote exists verbatim at the row's anchor, the commit pin
resolves, the README bytes at the pin are identical to `main`, and the row's
kind/tier/scope are honest under CORPUS contract v1. No row-level defect.

Attack surface: `corpus/SOURCES.md:44` (row bytes at `b444ca8` are the same file;
sha256 `9f06c7a23b1663e66e8b9059116569cd9615200e428be9f082201768cc21ed70` for both
`git show b444ca8:corpus/SOURCES.md` and the working tree). Row shape is 13 fields
(`awk -F'|' ... NF!=13` prints nothing for it).

## Opening evidence (opened this session, access date 2026-10-20)

Row URL fetched literally (GitHub blob page):

```
curl -sSL ... "https://github.com/webmachinelearning/webmcp/blob/main/README.md"
http=200 bytes=555171
sha256 285cb4b52da356fccb39f1519e5d903e7d9130f879cfd96bc56a896eb6c675f3
grep -c "not part of the specification at this time" blob.html  -> 2
blob_contains_quote= True
```

Exact source bytes at the pin and at `main` are byte-identical:

```
raw/cb3d16964ab3e92cfd5f09901ed0504373a906e8/README.md  -> 37575 B
raw/main/README.md                                      -> 37575 B
sha256 both 184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6
```

**Quote (verbatim, 11 words ≤25):** “but it is not part of the specification at this time.”
— `README.md` line 319, §Future Exploration: Declarative API (heading line 315),
repo revision `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, accessed 2026-10-20.
Line 319 in full: “A declarative counterpart, which would let the browser synthesize tool
definitions from HTML `<form>` elements, is being explored separately. Early ideas are
captured in the [Declarative API Explainer](./declarative-api-explainer.md), but it is
not part of the specification at this time.”

This grounds the `teaches` cell exactly: the declarative/form API is not part of the
specification, so form-tool observations are implementation evidence, not spec citations.
Corroboration: `curl https://webmachinelearning.github.io/webmcp/` (S020 bytes,
sha256 `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40`) contains
**zero** case-insensitive occurrences of “declarative” (`grep -o -i declarative | wc -l` → 0).

## Anchor and revision

```
git fetch --depth=1 origin cb3d16964ab3e92cfd5f09901ed0504373a906e8
cb3d16964ab3e92cfd5f09901ed0504373a906e8
2026-10-20 12:53:18 +0300
Add new editor (#352)
```

The pin is a real commit (not fabricated; raw fetch at the SHA returns 200 with the
same README sha256). `git ls-remote HEAD` at re-open returned
`51ed75653aaa7f174f8dbe05d1bc327359bbc57c` (committer date `2026-10-20 10:57:14 -0400`,
i.e. 11:57 −03; observed local time `2026-10-20T11:58:17-03:00`). So HEAD advanced
~5 h after the row was written; the README bytes did not change (same sha256 at both
commits). Anchor requirement — “exact section/heading/page/line plus revision” — is met.

## Tier / kind / scope honesty (CORPUS.md contract v1)

- **kind `docs` — honest.** The README is repository documentation in the spec's own
  Community Group repo, not the specification text itself (that is S020). `docs` is the
  correct enum; `spec` would overclaim.
- **tier `A` — honest for the scope as written.** A includes “official docs … maintainer
  statement.” The README's own paragraph contrast (line 317: imperative API “is what the
  specification defines”; line 319: declarative “not part of the specification”) is
  precisely the scope cell “Editors' statement of which WebMCP surface the specification
  defines versus explores.” Kind is not `community`, so the “`community` is never A”
  inflation clause does not apply. A is not extended beyond that narrow scope.
- **scope — honest.** One claim, and it is corroborated independently by S020's zero
  “declarative” occurrences.
- **teaches — grounded**, with one low-severity wording note below.
- **status/used-by — consistent.** `mined`; `used-by`
  `corpus/knowledge/webmcp-chromium-loopback-round-16.md` exists at `b444ca8` and cites
  S030 at line 2 (`source: S030`) and line 78. Citation-regex check
  `(^|[^A-Za-z0-9])S030([^0-9]|$)` matches; no `S0300`/`xS030` confusion.
- **opened/recheck — valid.** `opened 2026-10-20` equals this session's access date;
  `on-release` is an accepted cadence in the contract.
- **Lane validator:** `node scripts/check-sources.mjs` →
  `SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md` (exit 0).

## Observations (non-blocking, no verdict change)

1. **“Editors'” is a characterization, not a byline.** The README carries no editor
   attribution; the A-grade rests on “maintainer statement” for a repo maintained by the
   CG's editors. Tier would not move if worded “repository maintainers'”.
2. **`teaches` drops the “at this time” hedge.** It says “explicitly outside the
   specification”; the source says “not part of the specification **at this time**.” The
   consequence (“never spec citations”) is correct at this revision, and the knowledge
   note preserves the hedge verbatim at line 78, so the loss is confined to the row cell.
   `recheck: on-release` bounds the staleness risk.
3. **Anchor prose “repo HEAD cb3d169” is now stale** (HEAD = `51ed756`, 11:57 −03).
   The revision pin itself still resolves and is byte-identical, so this is snapshot
   prose, not an anchor defect; anchors are not editable under append-only rule 2 anyway.
4. **Gate record is draft-only at this snapshot.** `.ufo/waves/round-16/drafts/DraftSources.md:39`
   records the URL, access date 2026-10-20, and the 11-word quote with location
   (“README.md §Future Exploration: Declarative API (line 319)”). But
   `git cat-file -e b444ca8:corpus/lessons/round-16.md` → `fatal: path ... does not exist`
   (exit 128). Contract rule 1's “round lesson's `## Gate`” obligation is therefore
   **pending L1 integration**, not discharged at the measured revision. This is a
   round-lesson gap, not a defect of S030.
   The Gate's second S030 quote “is live in Chrome 149” also verifies
   (`implementation-status.md` §Chrome line 19 at the pin, sha256
   `555b564af51df41c43f75ee887343d9a64c2728da00c8e5eb35102afd312a828`, matching the
   draft's digest); it supports the implementation-status part of the row's source cell,
   not the `teaches` cell — extra, not a rule-1 violation.

## Remaining unknowns

- Ancestry of `cb3d169` vs `51ed756` was not established (only depth-1 fetches); both
  README blobs are byte-identical and the pin resolves, so immaterial to this attack.
- Whether the README is literally editor-authored is untraced (see observation 1).

## Tooling

No installs, upgrades, or pacman transactions. Read-only network (`curl`, `git`,
`python3`) and the lane's `node scripts/check-sources.mjs`; all mutations confined to
`/tmp/s030probe.3092` and `/tmp/s030git.*`. Lane untouched except this report.
