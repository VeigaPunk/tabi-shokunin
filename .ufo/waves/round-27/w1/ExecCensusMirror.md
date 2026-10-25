# ExecCensusMirror — C3 (coverage) scratch-mirror census gates, reproduced end-to-end

Seat: `ExecCensusMirror` (leaf, wave 1, round 27 / hyaku run 7). Item: reproduce the C3 scratch-mirror gates
(1) staged S124 row → exit 1 E09, (2) `s107-row.txt` → exit 0, (3) real registry → exit 0 with 107 rows,
plus the fleet `shared` cross-lane check. I am not the author of C3.

Nothing tracked was written. No git/jj writes, no sibling-lane writes, no shokuknow access, no pacman/installs
(nothing needed). Scratch: `.ufo/waves/round-27/scratch/ExecCensusMirror/`.

**Path collision disclosed up front.** A previous/duplicate seat with the same name had already written a report
at this exact path (mtime 14:37 −0300). I preserved it byte-for-byte at
`scratch/ExecCensusMirror/prior-report/ExecCensusMirror.prior-174002Z.md` (sha256 `dc2d2046…`) before writing this
file, and did not overwrite it silently. My runs below are independent (different mirror recipe, different
receipts); they agree with that report on all four gates. That seat's own catches — R1 tip-corpus replay, R2
`recheck` grammar, R3 S124 now also earns W04 — are independently reproduced here (arm B, arm A, and the
`m124-with-s107` variant in §2(1) respectively).

## 0. Environment and inputs

| fact | value | command |
|---|---|---|
| lane HEAD (unchanged through my run) | `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` | `git rev-parse HEAD` |
| named baseline | `f185b4e7ab10cd9e8925e8ec614c9c111772357d` | brief |
| commits baseline→HEAD | 10 | `git rev-list --count f185b4e..HEAD` |
| C3 commit | `6ca3b89` | `git log --oneline -5 -- corpus/SOURCES.md` |
| pre-C3 commit | `5577d1b6fe2dc298486e354b5416d38acafeffaa` | `git rev-parse 6ca3b89^` |
| census tool | sha256 `3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30` | `sha256sum /home/vgpnk/Projects/shokunin/scripts/sources-census.sh` |
| tool health | `selftest ok`, exit 0 | `bash …/sources-census.sh selftest` (bash 5.3.20, GNU Awk 5.4.1) |

Inputs (each: bytes / sha256, measured):
- `assimilation/staged-row.txt` — 585 B, `05e223dbab556f9a3c2305b35d3597e7468f1051d662344f880b3f5bde703998`, 1 line + `\n`.
- `assimilation/s107-row.txt` — 989 B, `adc6abe7eb0970ccee915b97a5bafd1bed9a5a89c5e33c4d1eeeff910b327570`, 1 line + `\n`.
- registry `corpus/SOURCES.md` at HEAD — 90 188 B, `30cd6a49e518065cf7600eff4b8f794a4b6e7a1608a4aed6daf6d6ccc3860bc3`, 107 rows.
- registry at `f185b4e` / `5577d1b` / `6ca3b89^` — `cf600fb2bf15a85f075d20dbf20aff2b930efee2c748026d7eebff23af14c130`, 106 rows
  (`git show <rev>:corpus/SOURCES.md | sha256sum`; the three revs hash identically → registry untouched from the
  named baseline up to the C3 parent).
- committed entry at HEAD (= blob at `6ca3b89`) — 3 752 B, `848c032117d199904fed6da98d38a9fe55d8ca93562d890dbf1971511c532e22`
  (`git cat-file -s/-p HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md`).
- `assimilation/rfc9110.txt` — 502 941 B, `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`
  (`wc -c`, `sha256sum`) → matches the S107 row's anchor cell and the entry's `source:` line.

Row counts across the boundary (each a command):
`git show <rev>:corpus/SOURCES.md | grep -cE '^\|[[:space:]]*S[0-9]{3,}'` → `f185b4e` 106, `6ca3b89^` 106,
`6ca3b89` 107, `HEAD` 107. `… | grep -cE '^\|[[:space:]]*S107[[:space:]]*\|'` → 0, 0, 1, 1.
Frozen counting command: `git grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l` → **1**
(`HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md:3`); at `f185b4e` → **0**.

## 1. Mirror construction and byte fidelity

Recipe (per mirror): `cp -a corpus <mirror>/corpus` from the lane, insert the row as its own line immediately
before the exact `## Paths` heading using `awk` (single-line row file, trailing `\n` stripped before re-printing),
then re-materialise the **committed** entry blob (`git cat-file -p HEAD:corpus/knowledge/…`) so every arm runs on
HEAD-tree bytes + exactly one inserted row.

Byte proofs:
- Tracked line 121 == `s107-row.txt` (at HEAD): `git show HEAD:corpus/SOURCES.md | sed -n '121p' | cmp - assimilation/s107-row.txt` → identical.
- `m107-pre` (HEAD registry with the S107 line removed, then `s107-row.txt` inserted) is **byte-identical to the
  tracked registry**: `cmp` rc 0, both `30cd6a49…`; `diff` vs `git show HEAD:corpus/SOURCES.md` is empty.
  This is the strongest form of the (2) result: the staged row, inserted into the pre-C3 registry, reproduces the
  landed bytes exactly.
- Inserted lines are byte-identical to their source files (extracted line `cmp` vs row file, incl. `\n`):
  `m124-*` ⇔ `staged-row.txt`, `m107-pre` ⇔ `s107-row.txt`.
- Each mirror's only registry delta vs HEAD is the one intended row (`diff` vs `git show HEAD:corpus/SOURCES.md`:
  `121a122` insert, or `121c121` replace).

All arms below were re-run **after** the committed-entry re-materialisation, so no result depends on the
concurrently dirty worktree entry (see §6).

## 2. The three required checks

### (1) Staged S124 row in a scratch mirror → exit 1, E09

Mirror `m124-pre-s107` (pre-C3 registry + S124):

```
$ bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
    --file scratch/ExecCensusMirror/m124-pre-s107/corpus/SOURCES.md --today 2026-10-25
EXIT=1
   … 16 W04 lines (S058 S065 S066 S068 S069 S070 S073 S074 S075 S076 S077 S095 S096 S098 S099 S100) …
file	E09	S124 recheck=730d (errata only)
```

Mirror `m124-with-s107` (HEAD registry + S124; the literal "copy the current corpus" reading):

```
EXIT=1
   … 17 W04 lines (the 16 above + S124) …
file	W04	S124 duplicate url www.rfc-editor.org/rfc/rfc9110.txt across scopes
file	E09	S124 recheck=730d (errata only)
```

E09 is identical in both; only the extra W04 differs (warning, exit unaffected — script header: "W-codes … never
change status"). Mechanism, read from `row_pass()` in `scripts/sources-census.sh`: `recheck` accepts only an ISO
date, `^[0-9]+d$`, or a leading-letter symbolic cadence; `730d (errata only)` starts with a digit and carries
prose, so it fails both branches. The refusal is a package-convention defect, not a lane defect.

Receipt: `scratch/ExecCensusMirror/m124-pre-s107.out` — 2 161 B, sha256
`a9a473afc570c98af08571b4274a64796367b1ca3fa29f5d7a544507194e2cfd`, **byte-identical** to the recorded
round-27 receipt `assimilation/staged-census.txt` (`diff` empty). This is a non-author reproduction of the
recorded control receipt.

### (2) s107-row.txt in a scratch mirror → exit 0

Mirror `m107-pre` (pre-C3 registry + `s107-row.txt`, committed entry in place), 107 rows:

```
$ bash …/sources-census.sh validate --file …/m107-pre/corpus/SOURCES.md --today 2026-10-25
EXIT=0
   … the same 16 W04 lines …
file	ok	…/scratch/ExecCensusMirror/m107-pre/corpus/SOURCES.md
```

Receipt `m107-pre.out` (17 lines). Path- and label-normalised it is identical to the recorded
`assimilation/xform-census.txt` (17 lines, normalised sha256 `862f7bbe…`) and to
`.ufo/waves/round-27/census-after-c3.txt` (2 190 B, sha256 `f37ce86e…`, label `tabi`, lane path) — both `diff`
empty. So the recorded "transformed row" receipt reproduces exactly from my independent recipe.

### (3) Real registry → exit 0, 107 rows

```
$ bash …/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi --today 2026-10-25
   … 16 W04 …
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
EXIT=0

$ grep -cE '^\|[[:space:]]*S[0-9]{3,}' /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
107

$ bash …/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi
tabi	rows	107
tabi	tier.A	92 / tier.B 6 / tier.C 9
tabi	status.mined	79 / status.queued 19 / status.rejected 9
FLEET	rows	2993 / FLEET missing 0            EXIT=0
```

`validate /home/vgpnk/Projects/shokunin/tabi-shokunin` (explicit lane dir, no roster) also exits 0 with
`tabi-shokunin	ok	…/corpus/SOURCES.md`. `tabi` is a listed lane (`shokunin.conf:58`), so no `unlisted` warning
is emitted; the roster resolves it to `tabi-shokunin`.

These (3) numbers were taken while the registry was byte-identical to HEAD (`corpus/SOURCES.md` sha `30cd6a49…`;
`git diff --stat HEAD -- corpus/SOURCES.md` empty at 17:38Z). See §6 for the sibling edit that landed at 17:39:11Z.

## 3. Control arms (sensitivity / non-vacuity)

| arm | construction | result |
|---|---|---|
| A. E09 isolation | `m124` row with the `recheck` cell changed to bare `730d`, all else byte-identical | `EXIT=0`, `file ok …` (+ W04 S124 only) → E09 is the **sole** blocker in that row |
| B. naive double-insert | `s107-row.txt` appended into the **HEAD** registry (S107 already present) | `EXIT=1`, `file E03 S107 duplicate id` **and** `file E04 S107 duplicate url www.rfc-editor.org/rfc/rfc9110.txt within scope …` → the guard catches a second row; this is why the faithful recipe needs the pre-C3 registry (registry itself unchanged from baseline to C3 parent, cf600fb2…) |
| C. E11 liveness | `m107-pre` minus the committed entry file | `EXIT=1`, `file E11 S107 missing used-by corpus/knowledge/redirect-and-retry-after-semantics.md` → the exit-0 arm is not vacuous: `used-by` is checked on disk |
| D. warning set | 16 W04 in every pre-C3/HEAD arm; S124 adds a 17th | ids: S058 S065 S066 S068 S069 S070 S073 S074 S075 S076 S077 S095 S096 S098 S099 S100 |

## 4. Fleet `shared` mode — rfc9110.txt is now in four lanes

```
$ bash …/sources-census.sh shared --root /home/vgpnk/Projects/shokunin | grep -F rfc9110
www.rfc-editor.org/rfc/rfc9110.txt	shared	kake,tabi,mori,chousa
```

Exit 0; 57 shared URL rows fleet-wide. Rows contributing the `.txt` form (read-only greps of sibling registries):

```
kake-shokunin/corpus/SOURCES.md:36   | S028 | … rfc9110.txt | spec | A | …
kake-shokunin/corpus/SOURCES.md:41   | S033 | … rfc9110.txt | spec | A | …
mori-shokunin/corpus/SOURCES.md:227  | S221 | HTTP Semantics (RFC 9110) §15.4 Redirection 3xx — … rfc9110.txt …
chousa-shokunin/corpus/SOURCES.md:71 | S061 | RFC 9110, HTTP Semantics — … rfc9110.txt …
tabi-shokunin/corpus/SOURCES.md:121  | S107 | HTTP Semantics — RFC 9110 — … rfc9110.txt …
```

Measured, not inferred: tabi's registry at the named baseline has **0** occurrences of `rfc9110`
(`git show f185b4e:corpus/SOURCES.md | grep -c rfc9110` → 0). So C3 **joins** an existing three-lane set; it does
not create the sharing. Normalisation in `url_of()` lowercases only the host and strips `#fragment`/trailing `/`,
so kake's `rfc9110.html#section-…` rows (S010, S088) stay outside this `.txt` group.

No gate fails. `shared` is report-only, and tabi's `validate` emits no `E04`/`W04` for S107 (unique inside tabi).
Cross-lane scope overlap is real but untested by any of these gates: mori S221 ("the 3xx redirection class and the
Location-header redirect …") and kake S088 ("HTTP response status meanings for 3xx redirects …") both overlap the
§15.4 material tabi's S107 now cites. Whether fleet policy wants one row per upstream URL across lanes is a
governance call for the L1/aggregator; the datum is: 4 lanes, 5 `.txt` rows.

## 5. Receipt reproduction summary

| recorded receipt | my independent reproduction | verdict |
|---|---|---|
| `assimilation/staged-census.txt` (2 161 B) | `m124-pre-s107.out` (2 161 B) | byte-identical (`a9a473af…`) |
| `assimilation/xform-census.txt` (17 lines) | `m107-pre.out` (17 lines) | identical after path normalisation (`862f7bbe…`) |
| `.ufo/waves/round-27/census-after-c3.txt` (2 190 B) | `m107-pre.out` (label+path normalised) | byte-identical (`f37ce86e…`) |
| `.ufo/waves/round-27/census-before.txt` | same sha as `census-after-c3.txt` (`f37ce86e…`) | note: `validate` receipts do **not** encode the row count; the 106→107 evidence is the git row counts and `census rows 107`, not these two files |

Two cross-recipe coincidences worth recording, because they are what makes the reproductions non-trivial rather
than self-fulfilling: my `m124-with-s107.out` (2 238 B) has the **same sha256 `21737b63…` as the prior seat's
`mirror-A.out`** (tip-corpus staged variant), and my `m107-noentry.out` (2 205 B) has the **same sha256 `fad4284e…`
as its `E-noentry.out`** (E11 arm). Two independently built mirror trees, two different seats, identical bytes out.

## 6. Observations, risks, and what is not mine

- **O1 — in-flight sibling edits during my run.** `git status --porcelain` was clean for `corpus/` at my first
  check; by 17:36:52Z the entry was an intermediate rewrite (sha `7c8e406b…`), and by 17:40Z the list is
  ` M corpus/QUALITY.md` (14:37:50), ` M corpus/README.md`, ` M corpus/lessons/round-27.md`,
  ` M corpus/knowledge/redirect-and-retry-after-semantics.md` (14:38:34) and ` M corpus/SOURCES.md` (14:39:11),
  plus untracked `scripts/report-contract.mjs`. I issued no write to any tracked path; my only writes are this
  report and `scratch/ExecCensusMirror/**`. Because the entry was dirty at copy time, I re-materialised the
  committed blob (`848c0321…`) in every mirror before the final arm runs; every result above is HEAD-tree bytes.
- **O2 — the registry changed under the measurement.** At 17:39:11Z a sibling rewrote the S107 `scope` cell from
  "The normative redirect semantics a journey driver observes (301/302/303/307/308, method rewriting) and the
  `Retry-After` header…" to "Documented redirect semantics a journey driver may observe (301/302/303/307/308,
  method rewriting) and the `Retry-After` header…". Current worktree registry:
  sha `e7e32aba…`, 107 rows, `validate` still exit 0 with no E-codes (re-run 17:40Z). Consequence: the worktree
  S107 row is **no longer byte-identical** to `s107-row.txt`; the byte-identity result in §1 holds for HEAD and for
  the pre-C3+row reconstruction. Neither state fails a gate — flagged so the L1 does not attribute the divergence
  to C3.
- **O3 — duplicate dispatch / shared scratch dir.** Earlier files in `scratch/ExecCensusMirror/` (14:32–14:36:
  `A-staged.out`, `B-xform.out`, `C-tabi-validate.out`, `D-minmut*.out`, `E-noentry.out`, `F-tipxform.out`,
  `G-shared-prec3.out`, `baseline-files.txt`, `reproduce.sh`, `reproduce.log`) belong to the prior seat of the same
  name; I left them untouched and preserved its report under `scratch/ExecCensusMirror/prior-report/`. Its
  `G-shared-prec3.out` (pre-C3 3-lane `shared` measurement) independently agrees with §4's normalisation reading.
- **R1** (independently confirmed, arm B): replaying `s107-row.txt` against the tip registry yields `E03`+`E04`;
  that is correct guard behaviour, not a C3 defect.
- **R2** (independently confirmed, arm A): `730d (errata only)` in `recheck` is what E09 rejects; the S107 row
  carries the prose in `anchor` and a bare `730d` in `recheck`. Any future import of the staged S124/S125/S142
  rows will hit E09 until the parenthetical moves.
- **R3** (independently confirmed, `m124-with-s107` arm in §2(1)): adding S124 beside the landed S107 also adds
  `W04 S124 duplicate url … across scopes`; exit status is still driven by E09 alone.
- **R4 — disk.** The six corpus mirrors were 342 MB total. I pruned the mirror trees after taking receipts;
  `scratch/ExecCensusMirror/*.out` receipts, `head-SOURCES.md`, `inflight-snapshot/` and `prior-report/` remain.
  Rebuild is two commands: `cp -a corpus <mirror>/corpus`, then the `awk` insert before `## Paths`.
- **O4 — end-of-run status snapshot (17:42:12Z).** HEAD `5ed6484`; registry sha `e7e32aba…`, 107 rows,
  `validate --root … tabi` exit 0 (`tabi	ok	…/corpus/SOURCES.md`). By then siblings had also put `M LOG.md`,
  `M SCORECARD.md` and `M scripts/check-s106-evidence.mjs` in flight, so the L1's post-integration gate will run
  against a worktree that is being actively written by other seats — the gate numbers in §2(3) are the HEAD-state
  numbers and were re-confirmed stable at 17:42Z (same 107 rows, same ok line, no E-codes).

## 7. Verdict

1. Staged S124 row in a scratch mirror → **exit 1**, `file	E09	S124 recheck=730d (errata only)`; recorded control
   receipt reproduced byte-for-byte. **Confirmed.**
2. `s107-row.txt` in a pre-C3 scratch mirror → **exit 0**, `file	ok	…/SOURCES.md`, 107 rows; registry bytes
   identical to the landed file; recorded `xform`/`census-after-c3` receipts reproduced. **Confirmed.**
3. Real registry `validate --root … tabi` → **exit 0**, `tabi	ok	…/tabi-shokunin/corpus/SOURCES.md`, **107** rows
   (`grep` and `census rows` agree), 16 pre-existing W04, zero E-codes. **Confirmed.** Baseline→C3: 106→107 rows,
   0→1 knowledge entries citing S107.
4. Fleet `shared` → rfc9110.txt **is** now in >1 lane: `kake,tabi,mori,chousa` (tabi newly joins an existing
   three-lane set at C3; report-only, no gate effect).
5. Controls: E09 is the sole blocker for S124 (arm A); E11 fires when the used-by target is absent (arm C); a naive
   second S107 row is caught by E03+E04 (arm B). The gate is not vacuous.

Files written: this report only, plus throwaway scratch under
`.ufo/waves/round-27/scratch/ExecCensusMirror/`:
`m124-pre-s107.out` (2 161 B, `a9a473af…`), `m124-with-s107.out` (2 238 B, `21737b63…`),
`m124-recheck-730d.out` (2 330 B, `230de501…`), `m107-pre.out` (2 244 B, `920aabcf…`),
`m107-noentry.out` (2 205 B, `fad4284e…`), `m107-pre.aslane`, `m107-pre.norm`, `a.norm`, `b.norm`,
`head-SOURCES.md` (HEAD registry bytes), `inflight-snapshot/entry-worktree-173840Z.md` (dirty entry observed at
14:38:34 −0300), `prior-report/ExecCensusMirror.prior-174002Z.md` (the file this report replaced, sha `dc2d2046…`).
Mirror trees were pruned after the receipts were taken (`du -sh` of the scratch dir: 380 K). No tool installs or
upgrades were needed; pacman was not invoked.
