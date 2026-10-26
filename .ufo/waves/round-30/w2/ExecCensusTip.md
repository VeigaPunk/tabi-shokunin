# ExecCensusTip — round-30 w2 falsify: source census at 072af95

Seat: `ExecCensusTip` (leaf, milestone `noharm`). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(read-only; all measurement in one `git clone --shared` at
`072af95fe2822f0785a6ff88a578e2142dd258e5`, `git status --porcelain` = 0). Milestone item: census at the
landed tip — the frozen CORPUS.md manual census block from the clone root, the maintained
`scripts/sources-census.sh validate --file`, and a delta against
`.ufo/waves/round-30/baseline/census-start.txt` (rows 115 → 118, W04 before/after with every new W04
explained).

## Verdict

**Census holds; one adjacent wording defect (low) in the new S118 `teaches` cell, not a census-rule
violation.** At `072af95` the registry is 118 rows with 118 distinct, gap-free ids (baseline 115; the
added set is exactly S116, S117, S118 and nothing was removed), malformed `NF!=13` = 0, tier
`A=103 B=6 C=9`, status `mined=90 queued=19 rejected=9` (baseline `A=100 B=6 C=9`, `mined=87 queued=19
rejected=9` — the delta is the three added A/mined rows), duplicate ids none, enum/tier-inflation
violations none, and every mined `used-by` path resolves on disk. `validate --file` exits 0 with 19
W04 warnings; the baseline artifact is reproduced exactly (18 W04, id-set identical to
`census-start.txt`, exit 0), so exactly one W04 is new and it is explained below: S118 re-reads the
same pinned devtools-frontend file as S036 under a different scope. Only the 23 pre-existing rows named
in the claim changed, and only in their `used-by` column; layer/scope/anchor/teaches/status of existing
rows are byte-identical to baseline. The adjacent defect: S118's `teaches` says the panels/application
path named by S044/S068 "returns 404", but that named URL (`…/panels/application/WebMCPView.ts`)
returns HTTP 200 at both revisions with the very sha256 S118's own anchor cites; the verified 404 is
`…/panels/application/WebMCPModel.ts`. No census E/W code can see cell semantics, so this does not move
the census reading — it is reported as a content-wording defect for the integrator.

## 1. What was attacked

1. The frozen CORPUS.md manual census block (`/home/vgpnk/Projects/shokunin/CORPUS.md:131-148`) executed
   verbatim from the clone root at the tip.
2. The maintained validator in both forms that round 30 asserts:
   `validate --file "<clone>/corpus/SOURCES.md"` and the claims `noHarmChecks` form
   `validate --root /home/vgpnk/Projects/shokunin tabi`, plus `census` mode for the histograms.
3. The baseline delta against the committed artifact `baseline/census-start.txt`, plus a re-derivation
   of the baseline from `git show f7c0317…:corpus/SOURCES.md`.
4. Cell-level integrity of the round-30 row edits (per-column diff), id continuity, the 23 `used-by`
   edits, and the provenance of the one row responsible for the new W04 (S118) with independent
   read-only HTTPS GETs of the pinned bytes.

## 2. Evidence (commands and exit codes)

Clone: `git clone --shared …/tabi-shokunin "$S/clone"; git -C "$S/clone" checkout -q 072af95…` →
`git rev-parse HEAD` = `072af95fe2822f0785a6ff88a578e2142dd258e5`, `status --porcelain | wc -l` = 0.
`sha256sum corpus/SOURCES.md` = `6a228c79be4160cc54b8a08a17f035b7e25e229e205c70057be49addbb059efa`
(identical to the lane worktree file). Raw captures: `receipts/census-tip.txt`,
`receipts/census-baseline.txt`, `receipts/validate-tip.txt`, `receipts/validate-baseline.txt`,
`receipts/validate-root-lane.txt`, `receipts/row-diff.txt`, `receipts/fetches.tsv`.

### 2a. Frozen manual census block, from the clone root (tip)

```sh
grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
# 118                                                  exit 0
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md
# 0                                                    exit 0
awk -F'|' '… {t=$5; …n[t]++} END{…}' corpus/SOURCES.md
# A=103 B=6 C=9                                        exit 0
awk -F'|' '… {s=$9; …n[s]++} END{…}' corpus/SOURCES.md
# mined=90 queued=19 rejected=9                        exit 0
awk -F'|' '… {i=$2; …print i}' corpus/SOURCES.md | sort | uniq -d
# (empty — no duplicate ids)                            exit 0
awk -F'|' '… enum/tier checks …' corpus/SOURCES.md
# (empty — no tier/status/kind violations, no community-at-A)   exit 0
awk -F'|' '… mined used-by …' corpus/SOURCES.md | while read -r p; do [ -e "$p" ] || echo "missing: $p"; done
# (empty — every mined used-by path exists)             exit 0
```

Cross-check, maintained parser (`scripts/sources-census.sh census --file …`): `file rows 118;
tier.A 103; tier.B 6; tier.C 9; status.mined 90; status.queued 19; status.rejected 9; FLEET missing 0`,
exit 0 — the maintained and frozen readings agree. `validate --file` → exit 0, one `ok` line, 19 W04.
`validate --root /home/vgpnk/Projects/shokunin tabi` (the claims `noHarmChecks` form) → exit 0, 19 W04,
`tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`. Structure gate
`node scripts/check-sources.mjs` → `SOURCES_GATE verdict=clean rows=118 tiers=A:103,B:6,C:9
status=queued:19,mined:90,rejected:9 findings=0`, exit 0.

### 2b. Baseline re-derivation and artifact comparison

`git show f7c0317…:corpus/SOURCES.md` (sha256 `ed29d04e…f6d85d`, copy in
`receipts/SOURCES-baseline-f7c0317.md`): rows **115**, malformed 0, tier `A=100 B=6 C=9`,
status `mined=87 queued=19 rejected=9`, duplicate ids none. `validate` on that content exits **0** with
**18** W04 whose id set is byte-identical to `baseline/census-start.txt` (`diff` exit 0; artifact has 18
W04 and `exit=0`). So the round's delta is exactly: rows +3 (all tier A / status mined), W04 +1.

One methodological note (not a lane finding): `sources-census.sh validate --file` resolves `used-by`
paths against the registry *root* it derives from the file location (`<root>/corpus/SOURCES.md`), not
the process CWD. A baseline copy placed outside a `corpus/` tree reports a wall of false E11. I
reproduced the baseline correctly by placing the frozen file at
`$S/basecheck/corpus/SOURCES.md` with the clone's `knowledge/`, `lessons/`, `evidence/` symlinked
beside it (`receipts/validate-baseline.txt`, exit 0). The tip reading is unaffected — its file is
`<clone>/corpus/SOURCES.md`.

### 2c. W04 delta — the new warning is S118, and only S118

```
added   W04  S118
removed (none)
```
`validate-tip.txt` line: `W04 S118 duplicate url
github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts
across scopes`.

Explanation (checked against the registry and the counter's own logic,
`scripts/sources-census.sh:643-653`): the other row with that URL cell is **S036**
(`corpus/SOURCES.md:50`, "devtools-frontend WebMCPModel.ts", scope: the tool registry, anchor lines
192-203). **S118** (`corpus/SOURCES.md:132`) cites the same immutable pinned file for a different scope
(the invocation client, lines 128-139 and 249-258) and supersedes **S044**, whose URL is a different
file (`…/panels/application/WebMCPView.ts`). Both rows read byte-identical file content
(sha256 `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632`, independently refetched by
me at both `66df492` and `bf69d041`). Because the URL matches but the scope cell differs, E04
("duplicate URL+scope") is correctly not raised (`scope_key` differs, and E04 also exempts a
`supersedes S###` row); W04 is the designed cross-scope warning, warning-only — exit stays 0. This is a
deliberate same-byte cross-scope pair, not an accidental duplicate; it also means S118 is not an
independent source from S036 (the corpus labels such pairs elsewhere as "explicit … reuse", e.g.
S098/S099/S100 — S118's title/scope carries no such label, which is a convention observation, not a
rule break). Related normalization limit, warning-only: S088 carries the `raw.githubusercontent.com`
form of the *View* file plus a parenthetical model path, so it does not participate in W04 pairing
against the `github.com` forms — W04 keys on host+path, and it never affects exit.

### 2d. Cell-level integrity of the round's edits

Per-column diff, baseline vs tip (`receipts/row-diff.txt`): existing rows changed = **23**, and every
one lists **only** `used-by`; added = `S116, S117, S118`; removed = none. Ids: 118 total, 118 distinct,
min S001, max S118, **no gaps**. No row uses 1-3 leading spaces (the frozen-manual blind spot) and no
row-shaped line exists outside `## Registry`. The 23 `used-by` edits all append
`corpus/knowledge/chromium-156-release-pin-recheck.md`, which mentions each of the 23 ids (reciprocity
also enforced by `check-sources.mjs`, clean). New rows' `used-by` targets exist and cite them:
`corpus/knowledge/rate-limit-policy-fields.md` (S116), `host-published-rate-limit-headers.md` (S117),
`webmcp-invocation-round-17.md` (S118). Spot provenance of the C2 additions: committed receipt bytes
`corpus/evidence/round-30/frontier/bytes/S116.txt` = 67,097 B sha256 `d6016dd0…d412` identical to the
row's anchor and to the refetch copy; `bytes/S117.html` = 408,912 B (raw bytes vary per response, as
the row says).

## 3. Adjacent finding (content, not a census-rule violation)

**Name:** S118's `teaches` cell (`corpus/SOURCES.md:132`), the row that produces the round's only new
W04.

**What it says:** "…the model sits at `models/web_mcp/WebMCPModel.ts` and not at the `panels/application`
path S044 and its twin S068 name, **which returns 404 at 66df492 and at bf69d041**".

**Verdict: defect (low).** The path S044/S068 actually name in their `source` cells is
`front_end/panels/application/WebMCPView.ts`; that URL is live at both revisions, and S118's own
`anchor` cell cites its decoded sha256 `4b2fce64…540f`, i.e. the row asserts both "404" and "these are
the bytes I opened" about the same URL. The 404 belongs to a different file,
`front_end/panels/application/WebMCPModel.ts` (the model under the panel directory), which the lesson
states correctly (`corpus/lessons/round-30.md:39`, "-39: its anchor's `front_end/panels/application/WebMCPModel.ts`
returns HTTP 404 … `bytes/NOT_FOUND.panels-application.WebMCPModel.ts@*.b64`"). So the supersession
substance and the `mined` status are sound; the sentence's referent is what is wrong, and a reader who
takes "the path S044 and S068 name" literally will wrongly mark a live, cited URL dead.

**Line evidence + independent fetches** (`receipts/fetches.tsv`; UTC 2026-10-26T07:43:35-36Z):

| status | bytes | sha256 | URL |
|---|---|---|---|
| 200 | 8553 | `c23d575e…b632` | raw … `66df492…/front_end/models/web_mcp/WebMCPModel.ts` |
| 200 | 59794 | `4b2fce64…540f` | raw … `66df492…/front_end/panels/application/WebMCPView.ts` |
| 200 | 8553 | `c23d575e…b632` | raw … `bf69d041/front_end/models/web_mcp/WebMCPModel.ts` |
| 200 | 59879 | `189cb394…4db97` | raw … `bf69d041/front_end/panels/application/WebMCPView.ts` |
| 404 | 14 | `d5558cd4…512ed` | raw … `66df492…/front_end/panels/application/WebMCPModel.ts` |
| 404 | 14 | `d5558cd4…512ed` | raw … `bf69d041/front_end/panels/application/WebMCPModel.ts` |
| 200 | 1140005 | `7e197668…e0119e` | github.com blob `66df492…/panels/application/WebMCPView.ts` |
| 200 | 429008 | `2c9d504b…b9d6bd` | github.com blob `66df492…/models/web_mcp/WebMCPModel.ts` |

The committed S118 receipts agree with these to the byte: `corpus/evidence/round-30/s118/sha256sums.txt`
lists `WebMCPView.ts@66df492` `4b2fce64…540f` and `WebMCPModel.ts@66df492`/`@bf69d041`
`c23d575e…b632`, and `fetches.tsv` there records the 200 for the View at both revisions and the 404 for
`panels/application/WebMCPModel.ts` at both — i.e. the receipts contain the correction the row's prose
gets wrong. No repair attempted (attack seat). Suggested fix for the integrator, if any: name
`panels/application/WebMCPModel.ts` explicitly in S118's `teaches` (a same-round wording repair, not a
row rewrite).

Severity rationale: no gate or counter parses `teaches` semantics, W04/E04 are unaffected, S044/S068
stay `mined` as the corpus rule requires (correction is a new row), and the lesson text is right — so
misleading prose in one cell, not a false census reading. The census is structurally blind to this
class by design; that is the same reason S044's path error survived URL-level checks for ten rounds.

## 4. Files written

- `.ufo/waves/round-30/w2/ExecCensusTip.md` (this report)
- `.ufo/waves/round-30/w2/ExecCensusTip/receipts/`: `census-tip.txt`, `census-baseline.txt`,
  `validate-tip.txt`, `validate-baseline.txt`, `validate-root-lane.txt`, `row-diff.txt`, `fetches.tsv`,
  `SOURCES-baseline-f7c0317.md`, `raw-404-panels-application-WebMCPModel@66df492.bin`
- Scratch `/fast/scratch/hyaku/tabi-r30/ExecCensusTip/` (clone + captures; receipts already copied out).

No lane tracked file, lane git index, lane jj state, fleet repo, sibling lane or
`/home/vgpnk/Projects/shokuknow` touched. No commit anywhere. **Tooling: none installed or upgraded**
(nothing needed; node v24.21.0 and the lane's own bash/gawk/curl sufficed; pacman guard untouched).

## 5. Risks and limits

- The census is structural: rows, enums, ids, URL/scope duplication, `used-by` path existence. It cannot
  see a false claim inside `scope`/`anchor`/`teaches` — §3 is exactly that boundary, and the boundary is
  how S044's own path error lived from round 18 to round 30.
- `W04` is host-sensitive in URL normalization (the `raw.githubusercontent.com` vs `github.com` forms of
  the same file do not pair) and warning-only; it never changes exit and was not treated as an error.
- `checked`: the tip reading is from a clean clone of `072af95`, not the lane worktree; the lane worktree
  registry (HEAD `af0664e`, w1 evidence only) has the same file digest and gives the same reading.
- The W04 pair for S118 (S036) is same-byte, so S118 must not be counted as an independent source in
  any coverage tally that weights sources by URL; the claim's C2 coverage reasoning is not mine to
  judge, this is a flag only.
