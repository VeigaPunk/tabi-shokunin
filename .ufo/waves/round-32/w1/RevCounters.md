# RevCounters — round-32 w1 review of the frozen counter code (read-only)

2026-10-26 · Seat RevCounters · Scope: `git show 2f8535c5b3015fc5730c1076cbe57d1dc29e4fee -- scripts/`
(check-bidi-runtime.mjs new, check-selfassessment.mjs v3) plus the counterCommits.frozen delta
`5ad1fcbfbae947e56ed448c7d24af0632b534e80` (bidi TMPDIR fix only — claims.json `counterCommits.note`;
the frozenDigests sha256s are the 5ad1fcbf bytes, verified at HEAD 4181fffb below). All line numbers are
2f8535c5 blob lines unless marked `5ad1:` (then `git show 5ad1fcbf:scripts/check-bidi-runtime.mjs`).

## Verdict

Both counters are correct for the frozen claims' readings: the verdict map (0/1/2, selftest 3) matches the
code paths, Refusal-vs-failure classification matches the claims' killRule, transcript parsing is conservative
in every malformed-input direction I could construct, the s1 rule is sound, and m4's line attribution for
wrapped statements is exactly right — the frozen control attributes round 29's statement, whose `nudge` and
`inactive` words sit on different lines (SCORECARD.md:1473/1474), to line 1473, matching claims
`beforeItems`. The L1's drafted round-32 corrections (working tree, SCORECARD.md:1607-1628) fit the frozen
supersede grammar precisely: each cites 1473/1515/1576, says "the nudge was active" (matches the supersede
regex, does not itself re-match the statement regex), and the working-tree registry rows S124–S126 carry
`mined` / `opened 2026-10-26` / used-by = the exact entry path, absent at baseline — so s1 will hold once
committed. One HIGH latent defect in `liveRecord` (the 60 s deadline closes the websocket but cannot unblock
the awaited `send()` promises, so a slow or wedged session hangs the counter forever with browser, fixture
server and scratch leaked) is live for every future `--live` re-run at REV but did not fire in any recorded
control; nothing I found alters the already-scored readings (c1-J1..J4, c2-J1..J3, selftests exit 0).

## Checked items and result

- **Verdict map vs code paths** — holds. `bidi.freeze.mjs:770` parseArgs→2; :781 usage→2; :786 Refusal→2;
  :793 `exit(clean?0:1)`; :779 selftest→3; clean requires `!entryFinding && population>=1 && failing===0`
  (:657). e1 (:549→ exit 1) and s1 (:558-560) fail the whole population; per-row order x1→x2→t1→t3→t2→l1
  (:626-647) matches the header. Population 0 → exit 1 = the recorded before-state (c1-J1).
- **Refusal vs failure classification** — holds. Environment-can't-run → exit 2 (`which()` guard :375;
  new-session failure / ws-open failure / no-context rethrown as Refusal via :526-528), predicates-failed →
  exit 1 per row (l1-live, :643-645). Consistent with the pre-freeze `session not created` incident being
  repaired (5ad1fcbf) instead of counted, and with killRule (exit 2 = not verified, exit 1 = failed).
- **Resource cleanup in liveRecord** — defects, see HIGH-1 / LOW-1 / LOW-2 / LOW-3.
- **JSON transcript parsing robustness** — holds. Responses before their send are dropped (byId miss,
  :192-194) leaving `response: null` → predicate fails (conservative); duplicate responses and duplicate
  `http-res` first-win (:190, :192); non-JSON line → Refusal → caught into `t1-receipt` (:515) — a header
  enumeration drift (t1 lists sha/absence, not non-JSON), direction conservative, no reading affected.
- **recordFromTranscript event classification** — holds. `type==="event" || (method && id===undefined)`
  (:191) matches the BiDi wire; a frame carrying both id and method files as a response — no overclaim path
  (t3 bytes + l1 live re-execution still bind every row).
- **s1 rule** — holds. Cited ids from the entry's `source:` line (:554-556); row must be `mined`, name the
  entry in used-by (exact comma/semicolon item), and be absent at --baseline (:556). Data verified: S123–S126
  exist only in the working tree (HEAD does not have them — mid-wave, expected), all `mined`, opened
  2026-10-26; S124/S125/S126 used-by = `corpus/knowledge/webdriver-bidi-runtime-round-32.md` exactly; 0
  matches at baseline d805d1d. S123's used-by names the decision-table doc, so the entry must cite
  S124–S126 (any one suffices). Footgun: no annotation may be added to those used-by cells or s1 fails.
- **m4 line attribution for wrapped statements** — holds. Flattening is length-preserving (one space per
  line join, offsets at line starts, `replace(/\s/g," ")` is 1:1), so `lineAt` attributes the match to the
  line containing the word `nudge` (selfassess:479-484, 486-487). Real data: round 29's statement wraps
  `…window 3; nudge` (1473) / `inactive; …` (1474); frozen control c2-J1 reports `line=1473` — likewise
  1515 and 1576, all `inactive→active`, matching claims beforeItems. Round 28's statement (SCORECARD:1456)
  is correctly could-not-evaluate (group has `Saturation 8 / window 3` but no `Axes at round start:` with
  six axes) — not counted, so C2 correctly scopes to rounds 29–31. Correction must cite the counter's line
  (1473, not 1474). The drafted corrections do exactly that, use plain `the nudge was active` (matches
  `\bnudge\s+(?:was\s+|is\s+)?active\b`, selfassess:506; "was" does not re-match the statement regex
  :486), and cite ranges correctly (`SCORECARD.md:1574-1575` passes citesLine's range containment,
  selfassess:288-296). Markdown-bold `**active**` would NOT match — drafts are plain text.
- **5ad1fcbf delta** — TMPDIR fix only: scratch ≤60 chars → scratch; elif XDG_RUNTIME_DIR ≤40 → private
  mkdtemp there, removed in finally (`5ad1:488`); else caller TMPDIR + post-run sweep of new
  `.org.chromium.Chromium.*` entries (`5ad1:489`); refusal message now carries the TMPDIR length
  (`5ad1:405`). 60/40 guards keep `.org.chromium.Chromium.XXXXXX/SingletonSocket` (+46 B) under the
  108-byte sun_path limit — sound.

## Defects

**HIGH-1 — liveRecord's timeout cannot abort; overrun hangs forever and leaks everything**
`bidi.freeze.mjs:382` (5ad1:394): the deadline only does `ws.close()`. `send()` (:412-418) resolves only
from `ws.onmessage` (:402-411); undici's `send()` on a CLOSED socket is a no-op, so once the deadline fires,
every pending and subsequent `await send(...)` never settles — `liveRecord` never returns, the `finally`
(:469-476, 5ad1:481-491) never runs, chromedriver/chromium keep running, the fixture server and scratch dir
leak, and the CLI never exits (no process-level watchdog). Same outcome if a session opens and then wedges
silently before 60 s. This is not a timeout, it is a self-inflicted hang. Affects: any re-run of the C1
counting command at REV (measurementRule requires `--live`) that exceeds 60 s — plausible under wave load.
Frozen readings unaffected: every recorded control and receipt completed (baseline c1-* receipts exist and
the L1's dry run scored 16/16). Suggested fix shape (for the L1, post-freeze): reject all pending sends when
the socket closes/errors, and add a process-level abort timer.

**MEDIUM-1 — a refused oracle shrinks `mismatches` (selfassessment v3)**
`selfassess.freeze.mjs:188-190` + :529/:536: when a named gate's `--selftest` exits nonzero or prints a
non-`clean` verdict, its stale tally claims become could-not-evaluate — not counted. So at REV, breaking a
gate's selftest silently removes its mismatches; `mismatches=0` is reachable without honest corrections for
any tally naming an unfrozen gate script. Mitigated for the 15 claimed tallies: they all name
`scripts/check-selfassessment.mjs`, whose bytes are frozen byte-identical at REV (deterministic selftest;
`c2-counter-selftest.txt` records exit=0). Residual: only protocol (L1 lands, reviewers read diffs) guards
the unfrozen gates. This is the designed M11 semantics (a failed selftest is not an oracle), but its
claim-level consequence deserves a line in the round report.

**LOW-1 — cleanup robustness in liveRecord's finally** `bidi.freeze.mjs:469-476` (5ad1:481-491): single
`cd.kill("SIGTERM")` with no exit-wait and no SIGKILL escalation; 300 ms later `rmSync(scratch)`. A slow
chromedriver can race the removal (rmSync ENOTEMPTY → throws inside finally → non-Refusal error replaces
the record → all rows l1-live fail → exit 1 "failed": conservative but false-fail). A chromedriver that
ignores SIGTERM leaks. Pre-try window (:375-377): if `serveFixture()`/`freePort()` reject after
`mkdtempSync`, the scratch dir leaks (no cleanup until `try` is entered).

**LOW-2 — freePort TOCTOU** `bidi.freeze.mjs:362-368`: probe binds, closes, then chromedriver binds later;
another process can take the port → the 50×200 ms retry loop exhausts → Refusal "new session failed" →
exit 2 (not verified). Honest, concurrency-only, noisy.

**LOW-3 — 5ad1 sweep can cross seats** `5ad1:487-489`: `preexisting` is snapshotted after mkdtemp, so two
concurrent counter runs sharing one TMPDIR can delete each other's live `.org.chromium.Chromium.*`
singleton dirs; chromedriver's own non-chromium temp entries there are never swept. Seats use private
scratch TMPDIRs this wave — not hit.

**INFO-1 — crash reads as "failed"**: a non-Refusal internal error escapes `main()` as an unhandled
rejection → Node exits 1 = "failed" (bidi.freeze.mjs:782-793; selfassess:1069-1084). The header says only
"any other nonzero reads as could-not-evaluate", but 1 is the declared failed code. Conservative direction
(never overclaims); no effect on readings.

**INFO-2 — header t3 wording overstates enforcement for receipt runs**: the counter enforces first-
screenshot byte equality + chromedriverVersion equality across runs and against its own live session
(:599-609); the "after setViewport/navigate/__ready, before input" ordering is enforced only in its own
live session (protocol by construction, :432-468). Forgery still fails t3/l1 (c1-J3-forgery-live proves
it). Documentation drift only.

**INFO-3 — parseRegistry first-wins on duplicate S-ids** (bidi.freeze.mjs:372-383): a duplicated id's
first occurrence governs s1. Registry hygiene note; no current duplicates.

## Effect on the frozen claims' readings

- C1 predicate/killRule: unaffected. The frozen digests are the 5ad1fcbf bytes and match HEAD exactly
  (verified below); all checks feeding exit/admitted/failing are correct as traced. HIGH-1 threatens the
  *availability* of the REV re-measurement, not its honesty (a hang produces no verdict and no pass).
- C2 before-state (18 = 3 m4 + 15 m1): confirmed against c2-J1-do-nothing.json (mismatches 18; m4 rows
  1473/1515/1576 `inactive→active`, superseded=False; 5 agreeing m4 rows; round 28 could-not-evaluate).
  The drafted corrections clear all three m4 rows under the frozen grammar; the four SCORECARD m1 lines
  (1439/1465/1486/1564) are covered by the drafted 41/41 correction bullet; SKILL.md (9 lines) and
  corpus/README.md (2 lines) corrections must follow the same same-document, later-paragraph, same-script,
  correct-number, marker, cite grammar.

## Commands and exit codes (paste; all read-only; no lane file modified)

- `git -C tabi-shokunin rev-parse HEAD` → `4181fffb…` (exit 0)
- `git show --stat 2f8535c5` → 3 files, +1003/−3; `git show 2f8535c5 -- scripts/ > freeze-scripts.diff` (0)
- `git diff --stat 2f8535c5 4181fffb -- scripts/` → only check-bidi-runtime.mjs +18/−4 (= 5ad1fcbf) (0)
- `git show HEAD:scripts/check-bidi-runtime.mjs | sha256sum` → `2f25af5a…` ✓ frozenDigests; same for
  check-selfassessment.mjs → `77b5c8ed…` ✓ (exit 0 both)
- `git cat-file -e HEAD:corpus/knowledge/webdriver-bidi-runtime-round-32.md` → exit 128 "exists on disk,
  but not in HEAD" (entry is uncommitted w1 work — consistent with mid-wave state; working tree carries
  M SCORECARD/SKILL/QUALITY/README/SOURCES + matrix, ?? w1 dirs)
- python cell extraction over working-tree SOURCES.md: S123–S126 = 13 split cells (11 content cells ✓),
  status `mined`, opened 2026-10-26, used-by as claimed (exit 0); baseline SOURCES has 0 S123–126 rows (0)
- c2-J1-do-nothing.json parsed: mismatches=18, m4 findings 9 (3 counted at 1473/1515/1576 inactive→active),
  m1 findings 109, couldNotEvaluate=104, superseded=21 (exit 0)
- `pgrep -fa 'chromedriver|chromium'` → exit 0 with matches, **none owned by RevCounters** (I spawned no
  browser): live trees under `/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/` (sibling seat still
  running) plus PIDs 2071416 (chromedriver --port=44143) and 2071582 (chromium with omarchy extension
  flags, profile under `~/.config/chromium`) — other seats'/user processes, not mine to kill.

Tooling authorization: nothing installed or upgraded (no need arose). Network: zero external fetches this
session (all evidence is lane-local). Scratch `/fast/scratch/hyaku/tabi-r32/RevCounters` deleted after
receipt-of-record (this report is the deliverable; no receipts to preserve).

## Residual risk and verification gaps

- I did not execute either counter (review target was the committed bytes; execution is the mut/testers'
  and L1's role). All behavioral statements are line-traced against the frozen control artifacts, not
  re-run.
- HIGH-1's practical trigger probability (live leg > 60 s under concurrent wave load) is unmeasured; the
  recorded runs completed. If the REV measurement hangs, the operator must kill it — per measurementRule
  that is "a counter not run", i.e. the claim is simply unverified, not failed.
- The C2 numstat leg (0 deleted lines in the four docs) is a claim-level check, not counter code; I did not
  audit the working-tree SKILL.md/corpus/README.md correction drafts (SCORECARD drafts verified above).
- Round 32's own declared-claims block (to land at REV) will add an m4-evaluable statement to group 32;
  derived state will be `active` (capability window 29–31 empty even after the C1 row enters at round 32),
  so a correctly written statement agrees. If it omits the `Axes at round start:` line it degrades to
  could-not-evaluate, which does not block mismatches=0.
