# ScribeCarriedLow — round-33 w2 CritErrataLanded's three low items, located and drafted (round 34 w1, frontier)

**Verdict: all three items hold and each now has a paste-ready append-only correction, none landed.** At the lane tip
`59f1b47aae277e1670e4a824173da8cde7e388ee` the three stale sites sit exactly where the round-33 critique put them —
`corpus/knowledge/webdriver-bidi-runtime-round-32.md:220-223` (v1 gate pointers cited without the revision),
`LOG.md:2370-2371` (definite article "the live 16-admitted reading"), `corpus/lessons/round-32.md:192` and `:194-197`
("20 of 27" against a marker set that omits E3's lower-case `carried` arm) — because neither target document drifted
since `042d6d9a` and LOG's only growth (`+25` lines at `:2383`) sits below every cited line. Each drafted block appends
at EOF of the document that carries the stale byte, quotes that line verbatim, inserts nothing above a cited line (the
E30 shape), adds no `| R` row and no tally shape, and leaves the file prefix byte-identical (verified by `cmp -s` on
merged copies: `cmp_exit=0` three times). One correction beyond the critique: **E36 is a fourth dual-marked errata
item** (`errata.md:191-194`), so a correction enumerating only E3/E19/E25 would be incomplete; the drafted text names
all four and still lands the count at 21, with 22 as the conditional reading if E25's counter-case arm is judged
unreached by the table's README closure.

Seat: ScribeCarriedLow (frontier, leaf — no subagents, no lane edits, no fleet-root writes, no installs, no network
fetches, no browser launched). Read-only in the lane; the only writes are this report, the seat output dir, and scratch
`/fast/scratch/hyaku/tabi-r34/ScribeCarriedLow` (`TMPDIR` passed explicitly; deleted before yield).

## Locate — each item in the lane files at the tip

| Item | Target | Stale site | Verbatim content | Drift since `042d6d9a` |
|---|---|---|---|---|
| Defect 1 | `corpus/knowledge/webdriver-bidi-runtime-round-32.md` | `:220-223` (pointers on `:221-222`) | "The 404 branch (`scripts/check-bidi-runtime.mjs:131`) sends `content-type` and the fixture header only; `cache-control` is set on the 200 branch alone (`:132`). The gate's own comment at `:125` carries the same overstatement." | none — blob `9518ee06…aec97`, not in the `042d6d9a..59f1b47` diff |
| Defect 2 | `LOG.md` | `:2370-2371` | "…; the live 16-admitted reading is at the measured revision (`.ufo/waves/round-32/measure/c1-live-at-0808688.json`)." | none at/below `:2383`; sole hunk `@@ -2382,0 +2383,25 @@` |
| Defect 3 | `corpus/lessons/round-32.md` | `:192`, `:194-197` | ":192 … 27 are marked `Carried` …"; ":194 … the remain-count the table supports is 20 of 27, not 16 …"; ":196-197 The line's other four names (E1, E3, E5, E19's `passed=` arm) are not carried items." | none — blob `c2001ce7…94a2` |

Append points: knowledge doc after `:250`; `LOG.md` after `:2407`; lesson after `:212`. All three end in `0a`, so one
blank line then the block suffices and no earlier byte moves.

## Falsify — each critique claim re-derived

1. **Defect 1 holds.** The round-32 gate at `b7d16fb` has sha256
   `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` and its lines 124-133 are **byte-identical** to
   the current gate's 186-195 (`diff … && echo IDENTICAL` → `IDENTICAL`, exit 0). So v1 `:125`/`:131`/`:132` and v2
   `:187`/`:193`/`:194` are the same three sites: the overstating comment, the 404 branch (no `cache-control`), the 200
   branch (which alone sets `cache-control: no-store`). The bullet's substance survives; only the revision is unnamed.
   The convention it breaks is stated in-lane at `corpus/knowledge/bidi-runtime-gate-v2-round-33.md:123` (v1 `:101` for
   `DATA_TEXT`, which v2 has at `:163`).
2. **Defect 2 holds.** `.ufo/waves/round-32/w1/ExecDriver/live.json` is a second committed live 16 reading
   (`population 16, admitted 16, failing 0, clean true`, `fixtureSha256 343cbced…2843` = the measured revision's),
   added by `b234a58` — the only commit touching that path — which is one commit past the round-32 freeze `4181fff`
   (`git merge-base --is-ancestor` exit 0, `rev-list --count` = 1). Its `rev` `c8ec438690e641cb044e7eff1dc8423d0b7530cc`
   does not resolve (`rev-parse --verify …^{commit}` exit 128, `cat-file -e` exit 1), while `0808688…` does (exit 0).
   Hence "a", not "the", and the measured revision remains the citable witness; the F5 conclusion is unchanged.
3. **Defect 3 holds, and the critique under-enumerates.** Independent block split of
   `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md`: 43 items; capital `**Carried` = 27 (ids exactly
   `4,6–10,12–14,16–18,20–24,26–28,30–33,35,37,38`), `**Corrected here` = 12, `**No action` = 4 — and
   lower-case `**carried` on **four** items, `{3,19,25,36}`, not three: E36 (`:191-194`) closes "**Corrected here** by
   criterion 81's second clause; **carried** as enforcement (E19)". Three of the four do not move the count (E25
   closed at `corpus/README.md:699-703` per the table's `:90` row; E19's and E36's arm is the exit/verdict enforcement
   v3 landed — table `:95`, criterion 85 at `corpus/QUALITY.md:514-519`); E3's arm is the refused counter change
   (table `:93`), so the remain count is 21. The errata vocabulary pointer is `:4-5` at the tip, not the critique's
   `:3-4` (off by one line).

## Deliverable

`.ufo/waves/round-34/w1/ScribeCarriedLow/corrections.md` (14,947 B) — per item: target file, append point, stale line
quoted verbatim, why stale with the re-derivation, the paste-ready correction paragraph, post-append invariants, and a
verification table.

Drafted blocks in one line each: (1) knowledge entry — read `:221-222`'s three pointers as v1's at `b7d16fb` (or take
the current gate's `:187`/`:193`/`:194`); (2) LOG — read "a live 16-admitted reading", with
`ExecDriver/live.json` named, its unresolvable rev disclosed, and the measured revision kept as the citable one;
(3) lesson — state the marker basis at `:192`, name E3 as the split item, land the remain count at 21 (22 conditional
on E25's reading).

## Evidence — commands and exit codes

Full transcript with outputs: `.ufo/waves/round-34/w1/ScribeCarriedLow/verify.txt`.

| Command (cwd = lane root) | Exit | Outcome |
|---|---|---|
| `git rev-parse HEAD` | 0 | `59f1b47aae277e1670e4a824173da8cde7e388ee` |
| `git diff --stat 042d6d9a 59f1b47 -- <gate> <entry> LOG.md <lesson>` | 0 | `LOG.md` +25, gate +6/-1; entry and lesson absent |
| `git diff --unified=0 042d6d9a 59f1b47 -- LOG.md \| grep '^@@'` | 0 | `@@ -2382,0 +2383,25 @@` |
| `git show b7d16fb:scripts/check-bidi-runtime.mjs \| sha256sum` | 0 | `2f25af5a…c393` |
| `diff <(v1 124,133) <(v2 186,195)` | 0 | `IDENTICAL` |
| `git rev-parse --verify 'c8ec4386…^{commit}'` | 128 | `fatal: Needed a single revision` |
| `git cat-file -e c8ec4386…` | 1 | absent |
| `git rev-parse --verify '0808688…^{commit}'` | 0 | resolves |
| `git merge-base --is-ancestor 4181fff b234a58` / `rev-list --count` | 0 / 0 | ancestor; 1 commit |
| `git log --oneline -- .ufo/waves/round-32/w1/ExecDriver/live.json` | 0 | `b234a58` only |
| `grep -c '^| R[0-9]' <entry>` | 0 | 34 (row table), before and after the draft append |
| `sha256sum <entry> LOG.md <lesson>` | 0 | `9518ee06…`, `1997edae…`, `c2001ce7…` (sizes 25,151 / 188,341 / 22,819 B) |
| errata block split (node, scratch) | 0 | 43 items; 27 / 12 / 4; lower-case `{3,19,25,36}` |
| append + `head -c <orig>` + `cmp -s` per target | 0 | `cmp_exit=0` ×3; merged 26,250 / 189,218 / 24,167 B → appended 1,099 / 877 / 1,348 B |
| tally-pattern scan of drafted blocks (local copy of `TALLY_PATTERNS` + `SCRIPT_IN_TEXT`) | 0 | LOG block clean, lesson block clean; entry block names `scripts/check-bidi-runtime.mjs` (that doc is not an `m1` target — `scripts/check-selfassessment.mjs:307-335` scans LOG/SCORECARD) |

## Boundaries and out-of-scope

- **Not landed.** No lane tracked file, index, jj state or fleet file was written; corrections are drafts for the L1.
- **No lane script run this seat** (build/falsifier seats own that): the append-safety and tally arguments above are a
  static re-derivation plus a local copy of the counter's pattern list, not a `check-selfassessment` reading. Routed
  defect 4 still requires the L1 to run that counter at the integration commit; the pattern scan is the reason no new
  `m1` finding is expected from block 2.
- No network fetches, no chromium/chromedriver started, no tooling installed or upgraded.
- Scratch `/fast/scratch/hyaku/tabi-r34/ScribeCarriedLow` removed before yield (receipts copied into the output dir
  first).

## Deliverable paths

- Report: `.ufo/waves/round-34/w1/ScribeCarriedLow.md` (this file)
- `.ufo/waves/round-34/w1/ScribeCarriedLow/corrections.md` — the three corrections (target, stale line, paragraph)
- `.ufo/waves/round-34/w1/ScribeCarriedLow/verify.txt` — commands with exit codes and outputs
