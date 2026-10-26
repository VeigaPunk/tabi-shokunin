# ScribeSkillDistill — C1 Skill/Scorecard drafts (round 32, w1)

**Verdict.** Both requested drafts exist and are ready for the L1 to paste: `skill-section.md` is an
append-only `## Round 32 — WebDriver BiDi runtime: transport choice per evidence row` section with all
seventeen §2 rows ruled CDP / BiDi / either (four rows — R5 DOM shape, R11 wire truth, R14 history
witness, R16 stop-loading — keep CDP; R17 prompts is BiDi; the other twelve are either, with the
deciding qualifier in the why column), the session-bootstrap recipe in the gate's own `liveRecord` order
(classic `POST /session` with `webSocketUrl:true` + `unhandledPromptBehavior:"ignore"`, subscribe before
navigate, collector before request, first screenshot after the viewport pin and the settle), and five
error signatures plus two *silent* failures that I observed myself in three throwaway BiDi sessions on
this host — not inferred from the counter. `scorecard-row.md` carries the capabilities-table row in both
accepted forms (`webdriver-bidi-runtime`, first-working round 32) with the evidence pointer to the gate,
its `--selftest cases=27` and the not-yet-committed entry/receipt. Nothing was fabricated: every
"observed" line names a probe file under `evidence/`; everything the ExecDriver run still owes is listed
as pending in both the section and this report, and the C1 counter itself was **not** run by this seat
(no claim is verified by a scribe).

The runtime entry `corpus/knowledge/webdriver-bidi-runtime-round-32.md` and the receipt
`corpus/evidence/round-32/bidi/receipt.json` do **not** exist yet (checked at report time), so the section
forward-references them exactly as the matrix forward-references `SKILL.md` anchors; the L1 must not
paste the section until they land and the gate reads `admitted >= 14, failing 0`.

## Behaviour

- Read the frozen claim block, the counter header + `ROWS`/`PREDICATES`/`liveRecord`, matrix §2 (rows are
  lines `:60`–`:76`, R1..R17 in order), and the SKILL/SCORECARD append conventions (round 25 prose rows,
  rounds 16/17/23/24 table rows).
- Built one scratch clone at the freeze commit, ran three self-contained BiDi probes there (my own
  instrument, never the lane's gate as claim evidence), captured raw frames, and turned only the frames
  I captured into "observed" statements.
- Wrote two draft files plus an evidence directory; no lane tracked file was touched.

## Evidence — commands and exit codes

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone ; git -C $S/clone checkout -q --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6
$ git -C $S/clone rev-parse HEAD
4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6
$ git -C $S/clone status --porcelain | wc -l
0
$ sha256sum <lane>/scripts/check-bidi-runtime.mjs $S/clone/scripts/check-bidi-runtime.mjs
2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393  <lane>/scripts/check-bidi-runtime.mjs
2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393  $S/clone/scripts/check-bidi-runtime.mjs
  → equals claims.json frozenDigests["scripts/check-bidi-runtime.mjs"]
$ node -v ; node -e 'console.log(typeof WebSocket)'
v24.21.0
function
$ /usr/bin/chromium --version ; /usr/bin/chromedriver --version
Chromium 154.0.8037.97 Arch Linux
ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})
$ SCRATCH=$S TMPDIR=$S node probe.mjs    → EXIT=0
$ SCRATCH=$S TMPDIR=$S node probe2.mjs   → EXIT=0
$ SCRATCH=$S TMPDIR=$S node probe3.mjs   → EXIT=0
$ pgrep -fa 'chromedriver|chromium'      → no process of mine in any check after a run
                                           (the only surviving lines carried another seat's
                                            --user-data-dir, see below)
$ git -C <lane> status --porcelain | wc -l
7   (all untracked .ufo/waves/round-32 scaffolding + w1/ ; no tracked file modified)
$ ls <lane>/corpus/knowledge/webdriver-bidi-runtime-round-32.md   → No such file or directory
$ ls <lane>/corpus/evidence/round-32                              → No such file or directory
```

No external network fetch was made (all fixtures served on `127.0.0.1`), so no fetch receipts exist for
this seat. No install or upgrade was needed; nothing was installed.

Browser run perimeter: chromium/chromedriver 154.0.8037.97 headless, throwaway `--user-data-dir` under
my scratch, `TMPDIR` a short dir under my scratch (the 108-byte singleton-socket limit), fixtures on
`127.0.0.1` only, driver killed and profile/scratch removed in each script's `finally`. Scratch tree
`/fast/scratch/hyaku/tabi-r32/ScribeSkillDistill` was deleted after the receipts were copied
(`test -e` → absent). Live processes still listed by `pgrep` belong to `ExecInterceptPhases`
(`--user-data-dir=/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/tmp/…`) — a sibling seat's run, left
alone; **none are mine**.

## Gates — what the drafts are held to

- `scripts/check-bidi-runtime.mjs` (frozen sha256 `2f25af5a…c393`): the entry must use header cells
  `| Row | Surface | BiDi method | Measured | Evidence |`, ids must be `R1..R17`, and no `R16` row can be
  admitted (`x2-no-counterpart`); `ALL_OK` is 16 rows, so the frozen target of `admitted >= 14` leaves
  room for exactly two driver-side misses — the drafts never assume 17.
- The section is written to survive the counter's own checks: each row's verdict is stated in terms of
  that row's `PREDICATES.R<n>` (read verbatim at the frozen commit) rather than in terms of
  "BiDi supports X", and the three rows whose spec gaps the matrix declares (R5, R11, R14) are ruled
  CDP so no SKILL line claims parity the gate cannot witness.
- Pasted section must not introduce a table that the gate could mistake for the runtime table: its table
  header is `| Row | Surface | Transport | Why … |` (first table with the runtime header wins — this
  header is deliberately different), so the section is inert to `parseTable()`.

## Touched surfaces

Written (all new, inside my output dir):
`.ufo/waves/round-32/w1/ScribeSkillDistill/` — `skill-section.md`, `scorecard-row.md`,
`evidence/{probe.mjs,probe.json,probe-frames.jsonl,probe2.mjs,probe2.json,probe2-frames.jsonl,probe3.mjs,probe3.json,probe3-frames.jsonl,README.md}`,
`evidence-sha256.txt`. Report at `.ufo/waves/round-32/w1/ScribeSkillDistill.md`.

Not touched: `SKILL.md`, `SCORECARD.md`, `corpus/**`, `scripts/**`, the lane git index/jj state, the fleet
repo, sibling lanes, `~/.local` tool installs. Read-only in the lane: the files listed above, plus
`corpus/SOURCES.md` (registry row shape around S120–S122) and the sibling artifacts cited below.

## Findings

1. **Five error signatures, observed** (each with code *and* message, since the code alone is ambiguous):
   `no such alert` / `No dialog is showing` (no dialog, dialog already handled, or dialog auto-dismissed);
   `invalid argument` / `Required in "awaitPromise".` (`script.evaluate` without the member — this build
   requires it); `invalid argument` / `Unknown event: <name>` (subscribe is all-or-nothing);
   `no such network data` / `No collected response data` (`getData` with no collector);
   `invalid argument` / `Forbidden characters` and `Failed to construct 'URL': Invalid URL` for
   `network.addIntercept` string patterns (the wildcard shapes; the exact-URL shapes succeed — the latter
   attribution is the sibling artifact `.ufo/waves/round-32/w1/ExecInterceptPhases/pattern-probe.json`,
   cited as such).
2. **Two silent failures** cost more than any error code: `script.evaluate` returns `type:"success"` with
   `result.type:"exception"` when the page script throws — so a command-level success is not a witness;
   and `browsingContext.traverseHistory {delta:-1}` on empty history returns success after moving the
   context to `about:blank` (new realm, `load` for `about:blank`, and a following relative `fetch` then
   throws `Failed to parse URL`). The counter's predicates already read `res(c).type`, which is why they
   survive both.
3. **Screenshot ordering is load-bearing**: before `setViewport` the shot decoded 780x437, after it
   640x480. R4 pins the size, and the gate hashes the *first* screenshot across runs, so a capture that
   shoots early records a non-comparable frame.
4. **`unhandledPromptBehavior` decides R17**: with `"ignore"` the dialog stayed open long enough to
   `userPromptOpened` → `handleUserPrompt` (success); with `"dismiss and notify"` the dialog was gone
   within 1.5 s and the handle failed `no such alert`. The recipe's step 1 is not cosmetic.
5. **Network ids are event-issued, in two shapes** — a 32-hex id for the document request, `<pid>.<n>`
   for page-side `fetch`es — so `getData`/`continueRequest` must take the handle from the event; this is
   now stated in R10 and used by steps 12/14.
6. **Pending the ExecDriver run** (listed in the section too, so nothing overclaims): click/typing DOM
   effects on the frozen `FIXTURE` (`clicked:tabi`, `#t.value === "tabi"`), `getData` bytes from that
   fixture, the blocked/continued `/data.txt?held=1`, `tabi_fixture=1`, the `/b.html` → traverse →
   `/a.html` path with *real* history, and cross-run identity of the first screenshot bytes.
7. **Landing precondition for the L1**: entry + receipt must be committed at the measured revision and
   the counter must read `admitted >= 14, failing 0` before the SKILL section and the SCORECARD row are
   pasted; `First-working round: 32` is earned by that run, not by this draft. The capability row must
   not be re-worded into "BiDi replaces CDP" — four rows are explicitly CDP.

## Out of scope (not done, by contract)

Counter runs as claim evidence; SOURCES rows S123–S126; the round-32 lesson (`## Gate` / `## Mistakes`);
edits to any lane tracked file (SKILL.md, SCORECARD.md, corpus/, scripts/); calibration (C2) work; any
git commit at all — nothing was committed, in the scratch clone or elsewhere.
