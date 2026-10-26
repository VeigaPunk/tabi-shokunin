# RevC3Code — correctness review of `scripts/check-release-pins.mjs` @ 97be89bc66139eb45526a04af59a35dccc006eb9

Scope: parseRegistry cell indices vs CORPUS.md census, version comparison, anchorHasRange regex, digest regexes, blockIn/normalisation, 404 handling, refetch binding, exit-code contract, self-test TMPDIR use. Line numbers are for the 479-line file at the pinned rev (extracted with `git show` to scratch; `git diff --stat 97be89b -- scripts/check-release-pins.mjs` empty and `status --porcelain` clean, so the worktree copy is byte-identical).

## Commands run (paste, with exit codes)

```
S=/fast/scratch/hyaku/tabi-r29/RevC3Code
git -C tabi-shokunin show 97be89bc66139eb45526a04af59a35dccc006eb9:scripts/check-release-pins.mjs > "$S/check-release-pins@97be89b.mjs"   # ok, 479 lines
TMPDIR=$S node "$S/check-release-pins@97be89b.mjs" --selftest; echo "selftest_exit=$?"
  -> RELEASE_PINS_SELFTEST verdict=clean cases=20 passed=20 ; selftest_exit=0 ; leftover temp dirs: 0
node "$S/check-release-pins@97be89b.mjs" --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev 97be89bc66139eb45526a04af59a35dccc006eb9 --stable 156.0.8078.47 --json
  -> rev_run_exit=1 ; population=23 resolved=0 unresolved=23 holds=0 drifted=0 clean=false
  -> all 23 reasons = "r1-entry receipt absent" (grep -c = 23)
git -C tabi-shokunin cat-file -e 97be89b:corpus/evidence/round-29/release-pins/receipt.json
  -> exit 128 "exists on disk, but not in '97be89b'" — receipt is worktree-only at the frozen rev; the rev run correctly read committed state only.
```
The script performs no network I/O (git blobs only), so the rev run was read-only by construction. No tools installed (nothing to record under the 2026-10-19 tooling authorization).

## Findings

### M1 · Medium — anchorHasRange single-line tokens bind inside version strings, dates and hex runs (L140-143, helpers L134-138)
`anchorHasRange` builds `(?<![0-9])<tok>(?![0-9])` — the guards block only ASCII digits, so a single-line token (`a == b`) matches any occurrence of that number inside a longer dotted/dated/hex numeral in the anchor. Probed with the verbatim functions (extracted L134-144, unmodified) against the 23 real population anchors at the rev:

- `[154,154]`, `[97,97]`, `[8037,8037]` accepted on **21/23 rows** (every anchor containing `tag 154.0.8037.97`; e.g. S034's anchor documents `lines 7023-7050` yet `[154,154]` binds — the json5 has >7000 lines, so the `b <= oldLines.length` bound does not save it).
- `[10,10]`, `[2026,2026]` accepted on **3 rows** (S041, S094, S105) purely via the date `2026-10-20` in the anchor.
- Digits bounded by hex letters also bind (lookarounds don't cover `[a-f]`): e.g. `9` inside commit sha `b510e9d7…` is preceded by `e` and followed by `d`, so `[9,9]` binds on every row citing a commit sha.

Effect: f4's "ranges bound to the row's own anchor" is defeated for single-line ranges — a receipt may claim an undocumented range whose number happens to appear in the tag/date/sha text and f4 passes; only f3/f5/f6 and the line-count bound remain. False-accept direction. Multi-line tokens (`a-b`) are unaffected (the dash makes accidental matches implausible; 0 false rejects observed). Fix direction: require range context (preceded by `line(s)`, `:`, `L`, or `l.`) or parse the anchor's line refs and compare numerically instead of regex-probing raw numerals.

### M2 · Medium — no file-coverage enforcement; a multi-file row resolves on a benign subset (L25 r1 ">= 1 file", L194-243)
The receipt author chooses which files to list; nothing requires covering every file the row's anchor references. Concrete instance at the rev: **S045**'s anchor cites three files (`executeTool-abort.https.html:87 and :113, inspector-protocol/webmcp/invoke-tool.js:38-51, WebMCP.pdl:68`); a receipt listing only the `.html` file passes f1 (source URL), f2 (source), f3/f6, f4 (`:87`, `:113` tokens in anchor) and the row resolves `holds` while drift in `invoke-tool.js` / `WebMCP.pdl` is never examined. Same shape for S062 (4 cited files: `content_switches.cc:596-603; devtools_pipe_handler.cc:135-200; remote_debugging_server.cc:353-400; devtools_http_handler.cc:297-306`). The header documents ">= 1 file", so this is per-doc — but it contradicts C3's intent ("each … resolved only by committed 154 and 156 decoded bytes") for multi-file rows. False-accept direction. Fix direction: require every `path[:line]` reference in the anchor to be covered by a receipt file (or at least report uncovered refs).

### L1 · Low — malformed rows silently dropped from the population (L118-121)
`if (cells.length !== 13) continue;` — a 14+-cell on-release row (e.g. a stray `|` in `teaches`, which the census forbids but nothing here enforces) is skipped with no counter, no refusal, no output field; population shrinks silently and the row escapes the gate. Verified not triggered at this rev (`awk NF!=13` → 0; independent awk count of on-release+tagged rows = 23 = counter population), but the gate should emit a `malformed` count or refuse. Fail-open direction.

### L2 · Low — non-Refusal exception exits 1, indistinguishable from "failed" (L466-467)
`catch (e) { if (!(e instanceof Refusal)) throw e; }` lets any internal error propagate → uncaught → Node exit **1** with a stack and no JSON. The header declares exit 1 = "failed (any unresolved row)" and exit 2 = could-not-evaluate, so a latent crash is misattributed as a genuine C3 failure (the killRule would read it as failed rather than not-verified). Should map non-Refusal to exit 2. I could not construct a reachable non-Refusal throw from receipt/registry inputs (all throw sites are Refusal or type-guarded), so this is latent, not live.

### L3 · Low — self-test asserts modeled exit codes, not the CLI's (L393-411 vs L444-476)
`runSelftest` calls `evaluate()` directly and derives `exit = out.clean ? 0 : 1` / Refusal→2 itself; `main()`'s arg parsing, `process.exit` mapping, `--json` shape and the L2 crash path are never exercised. The header claims the self-test "asserts exit code AND the unresolved count" — it asserts a simulation of both.

### L4 · Low — selftest temp-dir leak if `makeFixture()` throws after `mkdtempSync` (L358-359, L396)
`const fx = makeFixture();` sits before the `try { … } finally { rmSync }`; a git-init/config failure inside `makeFixture` leaks that temp root. Happy-path cleanup verified (0 `tabi-release-pins-*` leftovers after the run).

### L5 · Low — selftest-failure exit code 3 undeclared (L457)
Header documents the 0/1/2 production contract only; `--selftest` failure exits 3. Undeclared-but-harmless (selftest consumers read the printed verdict line).

### I1 · Info — f5 silently skipped when the row's digest form is unrecognized (L146-151, L245-246)
Real rows use exactly the two supported forms (6 anchors with full 64-hex, 4 with `8hex…4hex` — both matched; verified by grep over the 23 anchors). But a 12-hex truncation, uppercase hex, or a different ellipsis length yields `digests.length === 0` → f5 skipped (false-accept), not failed. Suggest: if `sha256` prose is present but no digest parses, push `f5-digest`.

### I2 · Info — 404 placeholder check is a substring test (L222-224)
`nb.includes("NOT_FOUND")`: any committed bytes containing the substring pass as "still absent". The convention is real in the corpus (S094's anchor itself documents `first line NOT_FOUND: Requested entity was not found`), and f6 requires the second seat to record the same status+sha, so this is convention-not-enforced rather than a hole. Also: `ranges` on a 404 file are silently ignored (the 404 branch precedes range processing).

### I3 · Info — refetch "independence" is string inequality of seats (L217-220)
`rf.seat !== entry.fetched_by` is the only independence signal; `fetched_at` is never validated and `"W1"` vs `"W1 "` counts as independent. Both records are committed blobs, so a colluding executor is unpreventable — inherent to the committed-evidence design and consistent with the doc; residual risk, not a defect.

### I4 · Info — phantom trailing line (L229, L159-167)
`split("\n")` on a `\n`-terminated file yields a trailing `""`; a range `[N,N]` on the phantom line can hold vacuously (`blockIn([""], …)` matches any blank new line). Bounded by the anchor token and line count; cosmetic.

### I5 · Info — f2 basename fallback is loose (L207)
`row.anchor.includes(basename(f.path))` binds any path whose basename appears anywhere in the anchor (two files sharing a basename are indistinguishable). Per doc (L27-28); noted for the record.

## Verified-good (checks that passed)

- **parseRegistry vs census** (L116-131): `cells[1]/[2]/[6]/[7]/[10]` = id/source/anchor/teaches/recheck = census `$2/$3/$7/$8/$11` under `-F'|'` NF=13; `ROW_RE` `^ {0,3}` matches the maintained-parser note (0-3 leading spaces); exact `recheck === "on-release"` is safe (no substring-only recheck cells among the 81 on-release rows); population=23 equals an independent awk count of on-release rows whose source carries `refs/tags/`; all 23 tags are `154.0.8037.97`, 4-component.
- **Version comparison** (L74, L108-113, L177-179): both operands regex-constrained to 4 numeric components; `Number()` safe; pinned-at-stable excluded (selftest case passes); multi-tag rows included if any tag is older.
- **anchorHasRange dash forms**: `normDash` maps `\u2010-\u2015` + `\u2212` (en/em/figure/minus covered); `\s*-\s*` tolerant of spaces; **0 false rejects** across every documented range token in the 23 real anchors (probed pairwise + single-line forms).
- **Digest regexes** (L146-155): full-form lookarounds prevent mid-run matches (65+ hex never matches); abbr form cannot match inside a 64-hex run; `digestMatches` prefix/suffix logic correct.
- **blockIn/normalisation** (L157-167, L229-241): normalization symmetric (same `normLine` both sides); shifted-block case passes (`valid-holds-with-shifted-lines`); no-ranges ⇒ whole-file sha equality; range-failure short-circuits to unresolved.
- **404 handling** (L222-227): old 404 + new 404 + placeholder holds; old 404 + new 200 drifts (selftest); old 200 + new 404 drifts; any other status fails closed (`f3-bytes status`).
- **Refetch binding** (L98-106, L217-220): id-bound blob, `v.id === id` check, seat inequality, path+tag+status+sha all compared; missing / same-seat / copied-old-as-new all fail closed (selftest passes all three).
- **Exit-code contract, live**: rev run exit 1 (unresolved=23); selftest exit 0; bad-rev / stable-mismatch / empty-population / usage / unknown-arg all exit 2 (selftest cases + code path L440-461).
- **TMPDIR in self-test**: `tmpdir()` (L62, L359) honors `TMPDIR` — with `TMPDIR=$S` all 20 fixture repos were created under my scratch and removed (0 leftovers); nothing touched the lane.

## Residual risk / verification gaps

- M1/M2 are false-accept weaknesses in binding completeness; exploitation still requires committing bytes+receipt+refetch that pass f3/f5/f6, so they weaken the gate's guarantee rather than break it outright. Both should be fixed (or explicitly accepted) before C3's `unresolved=0` is read as "every anchored file re-verified".
- Selftest coverage gaps (no defect found behind them): duplicate receipt entry, multi-file entries, f1 old-tag mismatch, old_bytes path mismatch, non-200/404 statuses, 200→404 drift, malformed-row handling, CLI-level exit mapping.
- I did not run the counter against a populated receipt (none exists at the rev; building one would mean writing lane-shaped fixtures beyond this review's read-only remit). The 23-row reasons at the rev are uniformly `r1-entry receipt absent`, consistent with `cat-file` exit 128.
