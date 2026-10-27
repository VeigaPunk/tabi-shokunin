# ExecCensus — tabi round 37 (attempt 1), wave w1 — census receipt

Seat: `ExecCensus` (executor, leaf). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Lane HEAD at measurement: `f76da094f0ff0ad9856d2232858241e3f7841379`.
Freeze: `99437d29de036415a9f2d0524343617a3b19988a`. Baseline: `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`.
Raw evidence: `.ufo/waves/round-37/w1/ExecCensus/census-w1.txt` (191 lines, 12 labelled sections).

Scope: the census receipt only. No lane file, no sibling repo, no fleet-root file was edited.
No git mutation was performed (read-only `git`/`git show`/one read-only `--shared` clone in scratch).

## 1. Primary command — exit code and tail

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```

- **exit 0**; stderr empty; stdout 21 lines.
- Code histogram (field 2): `1 ok`, `20 W04` — the ~20 pre-existing duplicate-url warnings the seat
  item expected. **No E-code of any class.**
- Tail:

```
tabi	W04	S114 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/.../html_form_element.cc?format=TEXT across scopes
tabi	W04	S115 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/.../html_form_element.cc?format=TEXT across scopes
tabi	W04	S118 duplicate url github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts across scopes
tabi	W04	S123 duplicate url www.rfc-editor.org/rfc/rfc9309.txt across scopes
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
```

The W04 set is **byte-identical** to the frozen round-37 baseline receipt
`.ufo/waves/round-37/baseline/census-start.txt` (21 lines, `diff` clean) and also byte-identical to
round-36's `measure/census-end.txt` and `baseline/census-start.txt` (same 20 warning ids, same order).
The census state is unchanged since round 36: nothing new was opened, refused or edited in the
registry between the two rounds' freeze points.

## 2. Registry data rows

The seat item's dispatched counting regex is **brace-mangled and matches nothing** — see §5. Measured
with the intended (contract-v1) regex:

| Command | Result |
|---|---|
| `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` | **142** |
| `grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` | **142** |
| distinct ids | 142 — min S001, max **S142**, **no gaps** in S001–S142 |
| `S143` present in the registry | **False** (this round's new row is not yet landed) |

## 3. Tier / status histograms

Run from the lane root with the contract-v1 census awk block (`/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`):

```
tier:   A=126  B=7  C=9
status: mined=118  queued=15  rejected=9
kind:   code=50  docs=59  spec=17  community=5  paper=4  tool=3  own-work=3  dataset=1
```

All six contract-v1 census commands pass: rows 142; malformed rows (NF≠13) **0**; duplicate ids
**none**; enum violations / tier inflation **none**; missing used-by paths **none**.

The lane's own structural gate agrees exactly, independently of the fleet script:

```
$ node scripts/check-sources.mjs --file corpus/SOURCES.md
SOURCES_GATE verdict=clean rows=142 tiers=A:126,B:7,C:9 status=queued:15,mined:118,rejected:9 findings=0 file=corpus/SOURCES.md   (exit 0)
```

Cross-check against the round-36 closure spot-check, which reported 142 rows / A 126, B 7, C 9 /
mined 118, queued 15, rejected 9 at the final round-36 HEAD: **identical**. The registry has not moved.

## 4. S142 row — parse and 11-column conformance

`corpus/SOURCES.md` line 156. Raw line length 1,950; 12 literal `|` characters → awk **NF = 13**
(= 11 columns); 11 cells; **no escaped `\|` in any cell**.

| # | column | value (truncated) |
|---|---|---|
| 1 | id | `S142` |
| 2 | source | `git-show manual — https://git-scm.com/docs/git-show` |
| 3 | kind | `docs` (in contract enum) |
| 4 | tier | `A` (in enum; kind is not `community`, so no tier inflation) |
| 5 | scope | 517 chars — what `git show` reads, §DESCRIPTION/§EXAMPLES, with the negatives stated |
| 6 | anchor | 797 chars — fetch ts, HTTP 200, 246,608 B, sha256 `0a95cbcd…0168a`, §DESCRIPTION line 3272, §EXAMPLES lines 5566-5571, git-diff support fetch |
| 7 | teaches | 478 chars — one grounded learner benefit |
| 8 | status | `mined` (in enum) |
| 9 | opened | `2026-10-27` (ISO, not future) |
| 10 | recheck | `180d` (valid cadence) |
| 11 | used-by | `corpus/knowledge/adjacency-drift-audit-r36.md` — **exists on disk** (14,152 B) |

**The row parses and is 11-column conformant.** The ≤25-word quote rule of contract rule 1 is met by
the located quotes carried in the anchor cell: 10 words ("Shows one or more objects (blobs, trees, tags
and commits)."), 20 words ("Shows the contents of the file Documentation/README as they were current
in the 10th last commit of the branch next."), 5 words ("changes between two blob objects"). The
round-36 lesson's `## Gate` carries the same 10-word quote at `git-show.html:3272`.

### Freshness re-open of S142's source (the row still holds)

Re-fetched both pages independently this wave:

| Page | HTTP | bytes | sha256 | vs the row / lesson digest |
|---|---|---|---|---|
| `https://git-scm.com/docs/git-show` | 200 | 246,608 | `0a95cbcd8868054d851eedb192864798092c597592851989f5d1bb392730168a` | **MATCH** |
| `https://git-scm.com/docs/git-diff` (support) | 200 | 229,155 | `5ae80d1deee5dc2c1acafff5491c5ba019629b9a785e6781a3e8a411cf9e22ed` | **MATCH** |

Located quotes confirmed at their stated positions: git-show line 3272 = `<p>Shows one or more objects
(blobs, trees, tags and commits).</p>`; git-show lines 5566-5571 carry the `git show next~10:Documentation/README`
synopsis and the "Shows the contents of the file …" definition (line-wrapped 5568-5571, as the row's
whitespace-normalisation caveat says); git-diff line 3245 carries "changes between two blob objects".
S142's own `recheck: 180d` is not due (180 days from 2026-10-27).

Freshness histograms for the whole registry: opened-dates 2026-10-19 (28) → 10-20 (48) → 10-21 (25)
→ 10-25 (6) → 10-26 (34) → 10-27 (1); recheck cadences on-release 95, 90d 29, 180d 9, 365d 7, 730d 1,
ISO date 1 (S116 `2026-11-24`). `sources-census.sh overdue --today 2026-10-27 tabi` → exit 0,
141 cadence rows, **0 overdue rows**.

## 5. Finding — the dispatched counting regex in this wave's spec is mangled (prompt defect)

**The regex the seat item was given cannot work.** `.ufo/waves/round-37/w1-spec.json` →
`items[ExecCensus].prompt` (and identically `.ufo/waves/round-37/w1-dispatch.json`) carries:

```
grep -cE '^ (0, 3)\|[[:space:]]*S[0-9](3,)[[:space:]]*\|' <lane>/corpus/SOURCES.md
```

Run literally that yields **0**, because `^ (0, 3)\|…S[0-9](3,)…` matches no row: `(0, 3)` is a
literal parenthesised group requiring the literal text `0, 3`, and `(3,)` is a literal `3,` in
brackets. The intended pattern is `^ {0,3}\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|` — the contract-v1
census regex — which yields 142.

Cause: `gen-w1-spec.py` builds each prompt with an **f-string**, and the quantifier braces were not
doubled. In an f-string, `{0,3}` is a tuple expression → `(0, 3)` and `{3,}` → `(3,)`. Reproduced
directly:

```
$ python3 -c "print(f'''grep -cE '^ {0,3}\\|S[0-9]{3,}''')"
grep -cE '^ (0, 3)\|S[0-9](3,)'''
```

The generator source (`.ufo/waves/round-37/gen-w1-spec.py:90`) still reads the correct
`grep -cE '^ {0,3}\\|...'` — only the rendered artifact is broken. The same defect hits one other
seat in this wave: `items[ScribeSources].prompt` asks for `grep -oE 'S[0-9]{3,}'` to verify that
S142 is the current max, which renders as `grep -oE 'S[0-9](3,)'` and matches **nothing** (0 hits).
That seat's own draft already uses a working pattern (`grep -oE '^\| S[0-9]{3} \|'` → max S142), so
no damage has landed; the defect is in the dispatch text, not in any produced artifact.

A scan of both rendered artifacts for the same mangling pattern found exactly these two occurrences
(`(0, 3)` and `](3,)`), so the blast radius is two seat prompts in wave w1.

**Effect on this seat: none.** I detected the malformed regex by reading it against the contract
before running it, and measured the row count with the contract-v1 regex instead (§2). The census
receipt above is complete and correct. The defect is reported, not repaired: the frozen wave spec
and dispatch payload are the L1's artifacts and must not be edited after data.

**Routed for round 38 (lane-owned):** brace-escape the quantifiers in `gen-w1-spec.py` prompts
(`{{0,3}}`, `{{3,}}`) or build prompts with `.format()`/`%`/plain concatenation instead of an
f-string, and re-check both rendered artifacts for `(0, 3)`-style artifacts. This is a
prompt-fidelity defect of the same family as round-36 routed defect 6 (the w1 Godspeed directive
that was not byte-identical).

## 6. Tool and environment

- `sources-census.sh` sha256 `3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30`;
  fleet-root HEAD `47a18cd679ed89ff65f790f1377f4331c359096a` (the fleet root is committed to by sibling
  lanes and moved from `6c4aba34c2a22519152d8c6f32e1039eecb1381b` during this seat's run; the census
  script's own bytes and digest did **not** change — it is unmodified vs HEAD and its last commit is
  still `f47ad6ba`); last commit touching it
  `f47ad6ba` (2026-10-25); worktree copy unmodified vs HEAD.
- `corpus/SOURCES.md` sha256 `dcfcdf0d43b33ab1f8f7eb55e1b93a19fffaba043d876be8f552e8c309fdac7f`
  at lane HEAD, at the freeze commit and at the baseline commit — **identical**, so the append-only
  rule of the no-harm clause holds and the registry has not been amended between baseline and now.
- `sources-census.sh selftest` → **exit 0, 96 killed, 0 survived**.
- Fleet-wide `sources-census.sh validate --root /home/vgpnk/Projects/shokunin` (all 21 lanes) →
  **exit 0**, 412 lines, 382 W04 warnings, no E-codes.
- Census re-run in a clean `--shared` clone checked out at the freeze commit `99437d29…`:
  **exit 0**, same 20 W04 + 1 ok.
- Tools: bash 5.3.20, GNU Awk 5.4.1, node v24.21.0, curl 8.23.0, git 2.56.0.
- **No tool was installed or upgraded this wave** (nothing needed it; channel n/a). **No pacman
  transaction was run.**

## 7. Limits

- Counts are read over the live lane worktree and over a clean clone at the freeze commit; both agree.
  The registry is unchanged across baseline → freeze → HEAD, so worktree and commit readings coincide.
- The `sources-census.sh` W04 warnings are pre-existing and are explicitly non-fatal for a clean lane
  (script header: "W-codes and unlisted lanes never change status"); they were not re-derived from
  the underlying URLs, and this seat did not re-open the 20 warned-about sources.
- The §5 finding is a defect of the frozen dispatch payload, not of the census tool or the registry.
  It was not repaired by this seat (no write outside the seat dir; frozen artifacts untouched).

VERDICT ok census clean at exit 0 (20 pre-existing W04, no E-codes, 142 rows, tier A126/B7/C9, mined118/queued15/rejected9, S142 row parses 11-column conformant and its source re-opens at the recorded digest); finding the wave-37 dispatch prompt's counting regex is brace-mangled by the f-string in gen-w1-spec.py and matches 0 rows (same mangle in the ScribeSources prompt) — routed for round 38, no effect on this receipt.
