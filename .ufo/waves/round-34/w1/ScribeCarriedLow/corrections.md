# Corrections — w2 CritErrataLanded's three low items (round 34 w1, draft only)

Seat: ScribeCarriedLow (frontier, leaf). Lane tip read: `59f1b47aae277e1670e4a824173da8cde7e388ee`.
Source item: `.ufo/waves/round-33/w2/CritErrataLanded.md` §"Attack 1", defects 1, 2, 3;
routed as `.ufo/waves/round-33/…/round-33-verifier-spotcheck.md:165` ("w2 CritErrataLanded: three low items") — the
routed defect 5 entry in `corpus/lessons/round-33-verifier-spotcheck.md:163-165`.

Nothing below is landed: seats never edit lane files. Each block is written to be appended at EOF of the document
that carries the stale byte, so no cited line moves (the E30 shape, `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md:160-163`:
"nothing may be inserted above a cited line after the corrections are written; the landed block sits at EOF").
Contract basis: `/home/vgpnk/Projects/shokunin/CORPUS.md:53-56` ("Corrections are new entries, never rewrites").

## 1. Locate — where each item sits at the tip

| Item | Target file | Stale site at `59f1b47` | Drift since `042d6d9a` | Verdict on the critique |
|---|---|---|---|---|
| Defect 1 — v1 pointers cited without the revision | `corpus/knowledge/webdriver-bidi-runtime-round-32.md` | `:220-223` (pointers on `:221-222`) | none: blob identical (`git diff --stat 042d6d9a 59f1b47` names only `LOG.md` + the gate) | holds |
| Defect 2 — definite article "the live 16-admitted reading" | `LOG.md` | `:2370-2371` | none at or before `:2383`; the only LOG hunk is `@@ -2382,0 +2383,25 @@` | holds |
| Defect 3 — "20 of 27" vs E3's lower-case `carried` marker | `corpus/lessons/round-32.md` | `:192`, `:194-197` | none: blob identical | holds, and understates: E36 is dual-marked too (§4) |

Append points at the tip: `corpus/knowledge/webdriver-bidi-runtime-round-32.md` after `:250` (inside its
`## Corrections — round 33 errata intake (append-only; the text above keeps its bytes)` section, which runs to EOF);
`LOG.md` after `:2407` (EOF, inside the round-34 entry); `corpus/lessons/round-32.md` after `:212` (EOF, inside its
`## Round-33 errata intake — corrections (append-only)` section). All three files end with `0a`, so a block appended
after the final line needs no separator beyond one blank line and moves no earlier byte.

## 2. Correction 1 — the gate pointers are v1's; name the revision

**Target:** `corpus/knowledge/webdriver-bidi-runtime-round-32.md`, append after line 250.
**Stale bytes (`:220-223`, verbatim):**

````
- §1 "Fixture", "Every response carries `x-tabi-fixture: r32` and `cache-control: no-store`" (`:39-40`): every **200**
  response does. The 404 branch (`scripts/check-bidi-runtime.mjs:131`) sends `content-type` and the fixture header
  only; `cache-control` is set on the 200 branch alone (`:132`). The gate's own comment at `:125` carries the same
  overstatement.
````

**Why stale (re-derived, not assumed).** The bullet's three numbers are correct only for the round-32 gate (v1).
`git show b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd:scripts/check-bidi-runtime.mjs` lines 124-133 are byte-identical to
the current gate's 186-195: v1 `:125` / v2 `:187` = the comment line "// lookup. Every response carries FIXTURE_HEADER and
`` `cache-control: no-store` ``.", v1 `:131` / v2 `:193` = the `if (!f) { res.writeHead(404, … content-type … }` branch,
v1 `:132` / v2 `:194` = the `res.writeHead(200, { "content-type": f.type, "cache-control": "no-store", … })` branch.
The bullet's substance therefore holds at both revisions — only the offset moved. Digest check that `b7d16fb` is the
round-32 gate: sha256 `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`.

**Correction text (paste at EOF):**

````
- §1 Fixture correction above (`:221-222`): its three gate pointers are the round-32 gate's line numbers, and the
  bullet does not name that revision. At `b7d16fb` they are the overstating comment
  (`scripts/check-bidi-runtime.mjs:125`), the 404 branch (`:131`) and the 200 branch (`:132`); at the current gate
  the same three sites are `:187`, `:193` and `:194` — the served-fixture block is byte-identical, only its offset
  moved. The substance holds at both revisions: the 404 branch sends `content-type` and the fixture header only,
  `cache-control: no-store` is set on the 200 branch alone, and the comment overstates at both. Read `:221-222` as
  "`…:125`, `…:131`, `…:132` at `b7d16fb`", or take the current gate's three pointers. This is catalogue class E30
  (positional citations an insertion undoes); the convention the bullet breaks is the one
  `corpus/knowledge/bidi-runtime-gate-v2-round-33.md:123` states — "The gate exports, at the round-32 revision:
  `DATA_TEXT` (`scripts/check-bidi-runtime.mjs:101`)", where `:101` is v1's line and v2 has `DATA_TEXT` at `:163`.
````

**Post-append invariants checked here.** The block adds no `| R` row (`grep -c '^| R[0-9]'` = 34 before and after on
the merged copy), inserts no line above a cited line, and carries no row-table pipe. The current gate at `:187`
still overstates, so the appended text does not claim the entry was repaired by v2.

## 3. Correction 2 — "a live 16-admitted reading", not "the"

**Target:** `LOG.md`, append after line 2407.
**Stale bytes (`:2370-2371`, verbatim; the sentence begins mid-line at `:2370`):**

````
  `c1-J3-forgery-live.json`, `c1-J4-counter-as-driver.json`); the live 16-admitted reading is at the measured revision
  (`.ufo/waves/round-32/measure/c1-live-at-0808688.json`). Read the figure as not recorded before the freeze; the target
````

**Why stale.** `.ufo/waves/round-32/w1/ExecDriver/live.json` is a second committed reading with
`schema tabi-bidi-runtime-v1`, `rev c8ec438690e641cb044e7eff1dc8423d0b7530cc`, `live: true`, `population 16`,
`admitted 16`, `failing 0`, `clean: true`, `fixtureSha256 343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843`
(equal to the measured revision's). `git log --oneline -3 -- .ufo/waves/round-32/w1/ExecDriver/live.json` → `b234a58`
only, and `git merge-base --is-ancestor 4181fff b234a58` → exit 0 with one commit between them, i.e. it landed after
the round-32 freeze. Its `rev` does not resolve: `git rev-parse --verify c8ec4386…^{commit}` → exit 128
(`fatal: Needed a single revision`); the measured revision does: `08086884d425b879f020af82fc6e57180e991a3e` → the
commit object. So the F5 conclusion (no live 16-admitted reading before the freeze) survives, and the measured
revision stays the citable witness.

**Correction text (paste at EOF):**

````
Correction (round 34, named) — supersedes the definite article in the round-33 F5 correction at `LOG.md:2370-2371`
("the live 16-admitted reading is at the measured revision"): read "a live 16-admitted reading". A second committed
reading admits 16 with none failing — `.ufo/waves/round-32/w1/ExecDriver/live.json`, schema
`tabi-bidi-runtime-v1`, population 16, admitted 16, failing 0, clean true, fixture digest equal to the measured
revision's — added by the round-32 integration `b234a58`, one commit after that round's freeze `4181fff`. Its `rev`
field (`c8ec438690e641cb044e7eff1dc8423d0b7530cc`) does not resolve in the lane repo, which makes it the weaker
witness, so the measured revision's reading stays the one to cite. The F5 conclusion — no live 16-admitted reading
was recorded before the round-32 freeze — is unchanged, since both readings postdate it.
````

**Post-append invariants checked here.** No `m1-selftest-tally` claim can arise: the block names no `scripts/*.mjs`
token, contains no `--selftest`, no `N/M`, no `N-case` and no `cases=` shape, so `m1LogFindings`' gate
(`scripts/check-selfassessment.mjs:307-335`: a line must match `/self-?test|case/` before a tally pattern is read)
never fires. The paragraph names the stale line in the same document and carries a correction marker, matching the
clear-stale shape at `:305-307`.

## 4. Correction 3 — state the marker basis; E3 makes the remain count 21

**Target:** `corpus/lessons/round-32.md`, append after line 212.
**Stale bytes (`:192`, `:194-197`, verbatim):**

````
  holds 43 items: 27 are marked `Carried` (E4, E6–E10, E12–E14, E16–E18, E20–E24, E26–E28, E30–E33, E35, E37,
````

````
  carried items (E16, E21, E22, E23, E24, E26, E27), so the remain-count the table supports is 20 of 27, not 16: the
  12 carried items the line names (E4, E6–E10, E12–E14, E17, E18, E20) plus eight carried items no disposition
  reaches (E28, E30, E31, E32, E33, E35, E37, E38). The line's other four names (E1, E3, E5, E19's `passed=` arm) are
  not carried items.
````

**Why stale (re-derived).** A block-splitting pass over
`.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` (43 `- **E<n>` items; command in §5) gives: 27 items carry the
capital marker `**Carried` — ids exactly `4,6,7,8,9,10,12,13,14,16,17,18,20,21,22,23,24,26,27,28,30,31,32,33,35,37,38`;
12 carry `**Corrected here` (`1,2,3,5,19,25,34,36,39,40,41,42`); 4 carry `**No action` (`11,15,29,43`). Four items
also carry the lower-case marker `**carried` and are not in the capital set: E3 (`:35`), E19 (`:112`), E25 (`:142`),
E36 (`:193-194`) — the critique named the first three; **E36 is the fourth and its block is dual-marked the same
way** (`:191-194`: "**Corrected here** by criterion 81's second clause; **carried** as enforcement (E19)"). Under the
errata's own vocabulary (`:4-5`: "**carried** — round 32 owns it and it is not repaired here") those four are partly
carried. Three of the four are closed elsewhere in the same lesson: E25 by the table's "already landed" row (`:90`,
`corpus/README.md:699-703`); E19's and E36's carried arm is the exit/verdict enforcement, which v3 landed — the
table's E19 row (`:95`, "half-closed — v3 enforces the exit/verdict arm (criterion 85)") and criterion 85
(`corpus/QUALITY.md:514-519`). E3's arm is the decision-table counter change the same table refused (`:93`, row
`E3, E6, E7, E8, E9`), so E3 stays carried and the remain count is 21, not 20. The remainder of the arithmetic holds:
19 carried ids of E1–E27 minus the seven the table closes = 12, plus the eight beyond E27 = 20 on the marker basis.

**Correction text (paste at EOF):**

````
- **Marker basis for the carried-errata arithmetic, `corpus/lessons/round-32.md:192` and `:194-197`.** `:192`'s "27
  are marked `Carried`" is the capital-C status-marker set; four further items are dual-marked — their blocks end
  "**Corrected here** …; **carried** as …" — E3 (`.ufo/waves/round-31/a2w1/ScribeErrata/errata.md:33-35`), E19
  (`:111-112`), E25 (`:140-142`) and E36 (`:193-194`), and under the errata's own vocabulary ("**carried** — round 32
  owns it and it is not repaired here", `:4-5`) those four are partly carried too. Three do not move the count: E25 is
  closed by the disposition table as already landed (`corpus/README.md:699-703`), and E19's and E36's carried arm is
  the exit/verdict enforcement v3 landed under criterion 85 (`corpus/QUALITY.md:514-519`; the table's E19 row at
  `:95`). E3's arm is the decision-table counter change that the same table refused (`:93`, the `E3, E6, E7, E8, E9`
  row), so it stays carried and `:194`'s "20 of 27" becomes 21 once E3 is counted. The safe landing is the basis, not
  a new number: read `:192` as "27 carry the status marker `Carried`" and `:196-197`'s "not carried items" as "not
  carried items under that marker", with E3 named as split. (If E25's "as a counter v2 case" arm is read against the
  counter rather than the landed README row, the count is 22.)
````

**Post-append invariants checked here.** No tally shape (`m1` does not scan lessons), no `| R` row, no line inserted
above a cited line; `:98`'s "16 of 27" line and the `:191-197` bullet keep their bytes.

## 5. Verification run for this draft (commands and exit codes)

Run from `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only) and from
`/fast/scratch/hyaku/tabi-r34/ScribeCarriedLow` (writes, deleted before yield).

| Command | Exit | Result |
|---|---|---|
| `git rev-parse HEAD` | 0 | `59f1b47aae277e1670e4a824173da8cde7e388ee` |
| `git diff --stat 042d6d9a 59f1b47 -- scripts/check-bidi-runtime.mjs corpus/knowledge/webdriver-bidi-runtime-round-32.md LOG.md corpus/lessons/round-32.md` | 0 | only `LOG.md` (+25) and the gate (+5/-1, at `:596`); the two target docs unchanged |
| `git diff --unified=0 042d6d9a 59f1b47 -- LOG.md` | 0 | single hunk `@@ -2382,0 +2383,25 @@` — nothing at or before `:2371` |
| `git show b7d16fb:scripts/check-bidi-runtime.mjs \| sha256sum` | 0 | `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` |
| `sed -n '186,195p' scripts/check-bidi-runtime.mjs` vs the v1 `124,133` | 0 | byte-identical blocks; v2 sites `:187`/`:193`/`:194` |
| `git rev-parse --verify c8ec4386…^{commit}` | 128 | `fatal: Needed a single revision` (the second reading's rev) |
| `git cat-file -e c8ec4386…` | 1 | absent |
| `git rev-parse --verify 08086884d425b879f020af82fc6e57180e991a3e^{commit}` | 0 | resolves |
| `git merge-base --is-ancestor 4181fff b234a58` | 0 | 1 commit between them (live.json postdates the freeze) |
| errata block split (node, `- \*\*E(\d+)` items + marker regexes) | 0 | 43 items; 27 capital `Carried` / 12 `Corrected here` / 4 `No action`; lower-case `carried` = {3,19,25,36} |
| `grep -c '^| R[0-9]' corpus/knowledge/webdriver-bidi-runtime-round-32.md` | 0 | 34 (row table) before and after the draft append |
| append-only prefix test (`head -c <orig size>` then `cmp -s`) per target | 0 | prefix sha256 identical for all three (9518ee06…, 1997edae…, c2001ce7…); appended bytes 1099 / 877 / 1348 |
| tally-pattern scan of the three drafted blocks (LOCAL copy of `TALLY_PATTERNS` + `SCRIPT_IN_TEXT`) | 0 | LOG and lesson blocks: no tally pattern, no `scripts/` token; the knowledge block names the gate script (that doc is not an `m1` target) |

## 6. Findings for the L1

1. **E36 is a fourth dual-marked item** (`errata.md:191-194`), absent from the critique's list. It does not change the
   count (its arm rides E19's, closed by criterion 85), but a correction that enumerates only E3/E19/E25 is
   incomplete; the drafted text names all four.
2. The critique's errata-vocabulary pointer `errata.md:3-4` is off by one line at the tip: the vocabulary sentence
   spans `:4-5`. The drafted text cites `:4-5`.
3. None of the three targets drifted since `042d6d9a`, so the critique's line numbers are usable verbatim; the
   `LOG.md` growth (+25 lines at `:2383`) sits below every cited line, so no citation in the round-33 corrections
   block moves.
4. Landing order is free: the three appends touch three different files and share no line. If the L1 lands them in
   one integration commit, routed defect 4 (`corpus/lessons/round-33-verifier-spotcheck.md:162`) requires
   `check-selfassessment` at that commit; §5's pattern scan is the reason no new `m1` finding is expected.
