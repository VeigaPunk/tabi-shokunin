# W1-51 — Scribe51: bounded evidence-surface note (sources row / knowledge gate; lesson & mistakes; SCORECARD/LOG consistency)

Seat: leaf scribe, attack id `W1-51`. Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Frozen claims: `.ufo/waves/round-38/claims.json` at commit `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`
(`git show a8e7d50:.ufo/waves/round-38/claims.json | sha256sum` = worktree sha256
`90290008aee738cc0362801bb71f96adb44d6434030582716a1e53ff5587185b`; the file is the only path
that commit adds). This note reports observations of the evidence surface only; it does not
reproduce the C1/C2 counters and does not treat any sibling seat output as authority.

## State at read time (the tree moved during the read)

- At 12:34–12:35 local, `HEAD` was `a8e7d50` and `corpus/SOURCES.md` carried 143 rows,
  `corpus/knowledge/playwright-firefox-loopback-round-38.md` and
  `corpus/evidence/round-38/playwright-firefox/receipt.json` were absent from `HEAD`.
- At 12:37:43 local, `HEAD` = `3bc0b108708c46c800f9050a1caa25bfe3bf5e5a`
  ("round-38: record Firefox capability and routed defects"), which adds exactly
  `LOG.md`, `SCORECARD.md`, `corpus/SOURCES.md` (+1 row), the receipt, the knowledge entry and
  `corpus/lessons/round-38.md`. All findings below were re-taken against `HEAD` = `3bc0b10`
  and the live working tree unless labelled otherwise.
- Frozen-instrument digests: all five `frozenDigests` entries in `claims.json` match the current
  bytes (`sha256sum` of the four counters plus `scripts/playwright-firefox-loopback-round38.mjs`).
  `check-sources.mjs` at HEAD: `verdict=clean rows=144 … findings=0`.
  `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` at read time:
  exit 0, 21 output lines, 20 `W04` duplicate-URL warnings, final line `tabi ok`.

## Findings

### F1 — S144's "opened" is asserted without a fetch receipt (C2 knowledge gate)

`corpus/SOURCES.md:158` (S144) records `opened 2026-10-27`, `status mined`, tier A, and an
anchor cell reading only "living docs page, §Firefox; opened 2026-10-27, page identifies
Playwright's patched Firefox and platform variation" — no HTTP status, no byte count, no
sha256, no line/offset. `corpus/lessons/round-38.md:5` supplies the URL, the access date and a
14-word §Firefox quote (word count re-checked: 14) — but no raw-fetch digest either.

The registry's own contract sentence (`corpus/SOURCES.md:3-6`) states the Gate "carries each
row's URL, access date, ≤25-word quote with location, and raw-fetch sha256"; the immediately
preceding generation of rows does carry all four (`corpus/SOURCES.md:148-155`, e.g. S134
"fetched 2026-10-26T21:12:29Z, HTTP 200, 41404 B, sha256 …", "§… section lines 494-499").
No file in the lane retains the fetched bytes or their digest for
`https://playwright.dev/docs/browsers` (`grep -rn "playwright.dev/docs/browsers"` hits only
`SOURCES.md`, the knowledge entry and the lesson).

Consequence: the quote cannot be re-verified from committed bytes, and `check-sources.mjs`
cannot see it by construction (its header states it "cannot see whether a source was opened").
C2's killRule names "no cited newly opened source row" — a row exists at HEAD, but its opening
is unbacked evidence, so the kill-rule's own evidence class is thinner than the row implies.
Falsifier that would settle it: fetch the URL, hash the bytes, and record that hash plus the
§Firefox line offset in the lane; a page whose §Firefox lacks the quoted sentence, or a hash
mismatch against a recorded value, kills the row's `teaches` cell.

### F2 — the knowledge entry declares "verified" while the same commit's SCORECARD says verification is pending

`corpus/knowledge/playwright-firefox-loopback-round-38.md:2` reads
`verified-at: round 38, Playwright 1.64.0, Firefox 157.0`, and `:9` asserts the run results
("Two cold runs produced identical first screenshot sha256 …, both recorded 0 non-loopback
socket observations and 0 surviving Firefox PIDs"). `SCORECARD.md:2104`, added by the same
commit `3bc0b10`, says "The claim's frozen verification and non-author review are pending."

The lane's precedent entry states the opposite discipline explicitly:
`corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md:1-5` says the frozen counter
"re-evaluates" the receipt and that "Row verdicts are not admitted by this text" — and it pins
its own receipts by sha256 (`run1.jsonl` `0ef2e7e5…`, `run2.jsonl` `6754ec2d…`). The round-38
entry pins no receipt digest: the receipt's own sha256 is `dd77b71a1241fd4bc3a3390f7637d6670890ed6c78484f979c47b9fe525cdc06`
and that string does not occur in the entry (`grep -c` = 0).

Consequence: the entry is a claim of a result that its own round says is unmeasured, and it
cannot detect a later edit of the receipt it cites. Falsifier: change one byte of
`corpus/evidence/round-38/playwright-firefox/receipt.json` — entry, LOG (`LOG.md:2529`),
SCORECARD (`:2104`) and SOURCES still read as they do now; nothing in the corpus binds them.

### F3 — no browser build identity in the receipt; "Firefox 157.0" is a self-reported string

`scripts/playwright-firefox-loopback-round38.mjs:157` hardcodes `firefoxVersion: null` and sets
only `browserVersion` from `probe.version()` (`:159`). `FIREFOX_BIN` is declared at `:24` as
`~/.cache/ms-playwright/firefox-1555/firefox/firefox` and never used (only other occurrence of
`firefox-1555` is the `ps` filter at `:74` and `:138`). The receipt records no executable path,
revision (`v1555`) or digest; `receipt.json:5-6` is `"firefoxVersion": null, "browserVersion":
"157.0"`.

So the entry's "This host ran Firefox 157.0" (`:7`) and `claims.json` C2's surface string
"Firefox 157.0" rest on Playwright's reported version string; the build revision appears only
in a driver comment (`:3`, "playwright firefox v1555, Juggler wire"). Contrast round-35, whose
entry pinned the host binary (`firefox-bin` sha256 `46e2c204…`). The same gap covers the
"Juggler" transport: it is asserted in the driver comment and nowhere measured or recorded.

Falsifier: replace `~/.cache/ms-playwright/firefox-1555` with a different build that still
reports 157.0 — entry, receipt and SCORECARD capability row (`SCORECARD.md:2105`) are
unchanged, so none of them can distinguish the builds.

### F4 — the "0 non-loopback / 0 survivors" fields are true but narrow; report them as such

Receipt: `"egress": {"samples": 2, "nonLoopback": 0, "lines": 1}` per run
(`corpus/evidence/round-38/playwright-firefox/receipt.json:154` and `:335`);
`"survivors": 0` (`:189`, `:370`); `firefoxSurvivorPids` repeats the same number.

How those fields are produced (`scripts/playwright-firefox-loopback-round38.mjs`):
- egress is a `setInterval(…, 400)` sampler over `ss -tnp`, filtered to the PIDs captured once,
  immediately after `firefox.launch` (`:74`, `:76-83`); the whole step sequence in each recorded
  run completes in ≈0.2 s per navigation and the sampler collected **two** samples per run;
- `survivors` counts only PIDs from that captured set (`:138-140`), not all
  `firefox-1555/firefox/firefox` processes;
- `rec.profile` is created per run (`:72`) and never passed to `firefox.launch({ headless: true })`
  (`:73`) — dead code; coldness comes from Playwright's own fresh temp profile, and the receipt
  carries no per-run profile/provenance field to show it.

Consequence: the entry's sentence (`:9`) is literally true of the recorded fields, but the
observation it names is 2 socket snapshots per run over 3 captured PIDs, and the survivor test
cannot see a process outside that set. Falsifier: a socket owned by a content process spawned
after the PID capture, or a leaked browser process with a new PID — both invisible to these
fields, and both would falsify "loopback-only / zero survivors" as a property while leaving the
receipt's numbers intact.

### F5 — the knowledge admit has no coverage-map entry (QUALITY rule 11)

`corpus/QUALITY.md:26-28` (rule 11) requires a coverage/index map to list every current note, or
state its snapshot date and the exact open gap, "in the same commit as each admit".
Mechanical check: 56 files under `corpus/knowledge/`, 55 are named in `corpus/README.md`;
the only unlisted note is `playwright-firefox-loopback-round-38.md` (loop over basenames,
`grep -q` in README → 1 miss). `corpus/README.md` has 852 lines and zero occurrences of
"round-38"/"round 38"; its last appended block is the round-36 note
(`corpus/README.md:852`), with the round-35 block at `:824`. Commit `3bc0b10` touched six files,
none of them `corpus/README.md`.

Falsifier: append a coverage block naming the note and its source row in the admit commit; the
gap disappears.

### F6 — the lesson's round-end census receipt does not exist

`corpus/lessons/round-38.md:15` asserts "Round-end validation returned exit 0 and `tabi ok`;
captured output at `.ufo/waves/round-38/measure/census-end.txt`". That path does not exist in
the working tree (`.ufo/waves/round-38/measure/` and `.../baseline/` are empty directories) and
not in `HEAD` (`git ls-tree -r --name-only HEAD .ufo/waves/round-38` → `claims.json` plus the
four counters only). Precedent commits do carry it: `.ufo/waves/round-36/measure/census-end.txt`
is tracked, and `corpus/lessons/round-37-verifier-spotcheck.md:127` defines `census-start.txt` /
`census-end.txt` as validate-only logs. The same lesson's own routed-work list names
"count-bearing census receipt" as a round-37 defect assigned to round 38 (`LOG.md:2531`).

A read of the census script today (exit 0, 20 `W04`, `tabi ok`) is not a substitute: it is a
current-state run, not a receipt at the measured REV. Falsifier: commit the validate-only
stdout from the round-end invocation; the assertion becomes checkable.

### F7 — two different "baseline" values for the same round

`.ufo/waves/round-38/claims.json:5-6` sets both `frozenAt` and `baseline` to
`98239d0396ff32c3feb14638b3214fe688e8b122` (the "frozen-instrument candidate" commit, which
adds the driver, the four counters and the adjacency counter v6).
`LOG.md:2527` states "Round-start baseline: `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`" and
calls `98239d0` the "frozen-instrument candidate commit".

Also, the field named `frozenAt` does not name the commit that introduced the frozen bytes:
`git log --format='%h %s' -- .ufo/waves/round-38/claims.json` → `a8e7d50` only.

Consequence: a numstat/measurement window computed `baseline..REV` differs by one commit
(98239d0's five added files) depending on which document is read — the exact defect class the
round lists as D6 ("exact numstat baseline..REV window", `LOG.md:2531`). Falsifier: run
`git diff --numstat 3f42a5c..<REV>` and `98239d0..<REV>` and compare against whatever the report
cites; they cannot both be the declared window.

### F8 — "committed round-37 result object" is not committed

`SCORECARD.md:2102` says "The committed round-37 result object records 34 w1 seats";
`corpus/lessons/round-38.md:11` says "re-derive from committed `w1-results.json` (34 seats)".
The file `.ufo/waves/round-37/w1-results.json` is untracked: `git cat-file -e
HEAD:.ufo/waves/round-37/w1-results.json` → `fatal: … exists on disk, but not in 'HEAD'`,
`git status --porcelain` → `?? .ufo/waves/round-37/w1-results.json`, and
`git ls-files .ufo/waves/round-37/w1-results.json` → empty, while 490 other round-37 wave files
are tracked. The number itself checks out (`seats` = 34, 34 entries under `results`), so this is
a provenance-wording defect, not a wrong count.

Falsifier: `git ls-files` the path — a non-empty answer.

### F9 — method note (not a defect): the 23/11 tally is derivable, but not from the results JSON alone

Strict parse of `verdict` inside each `results[].output` gives 21 ok / 10 finding / 3 entries
with no `verdict` field (`ScoutSrc`, `ConnPattern`, `ExecPinsBinding`). Those three carry their
verdicts in their own seat reports — `w1/ScoutSrc/report.md:37` "VERDICT ok",
`w1/ConnPattern/report.md:19` "VERDICT finding", `w1/ExecPinsBinding/report.md:19`
"**Verdict: ok.**" — giving the 23 ok / 11 finding that `LOG.md:2531` states and
`corpus/lessons/round-37-verifier-spotcheck.md:117` explains. Recorded so that no one reads the
21/10/3 strict parse as a contradiction of D2: the tally needs report text, and any D2 check
that parses only `results[].output.verdict` will undercount.

### F10 — small scope-cell mismatch on S144

`corpus/SOURCES.md:158` `teaches` cell is "Playwright Firefox is a patched build; this
distinction grounds the capability's engine/protocol identity", while the entry
`:7` also attributes to the source "Playwright's supported Firefox build and CLI browser
installation". The row's `scope` cell mentions install requirements, but the admitted kernel
(`teaches`) does not, so the entry uses the row one notch wider than the cell that is supposed
to bound the claim. Low severity; it matters only if the capability row is later cited for
install mechanics.

## Claims, mapped to what this surface can and cannot support

- **C2 (coverage capability).** The run artifacts are internally consistent: two runs, identical
  first-shot sha256 `3e0c070a…`, `binding: true`, `egressNonLoopback: 0`, `survivors: 0`, and the
  step records named in the entry are present. What this surface does **not** support: that S144
  was opened (F1), that the browser under test is identifiable as a build (F3), that "loopback
  only" is more than a 2-snapshot observation over 3 captured PIDs (F4), and that the knowledge
  admit is complete under the lane's own coverage rule (F5). C2's `target` ("commits receipt and
  knowledge row citing opened S144") is satisfied only for the receipt and row text; the
  "opened" leg is a declaration.
- **C1 (calibration).** Two surface-level items land directly on the routed-defect list this
  claim is measured against: the census receipt is again missing (F6, the "count-bearing census
  receipt" item) and the baseline the round declares is stated two ways (F7, the "exact numstat
  baseline..REV window" item). Neither is a counter reading; whether the frozen counter's
  predicate is true is for the counter's seats, not for this note.

## Checks that held (recorded so the note is not read as a list of complaints only)

- All five `frozenDigests` in `claims.json` equal current bytes.
- `claims.json` worktree bytes equal `git show a8e7d50:.ufo/waves/round-38/claims.json`.
- Receipt ↔ entry numbers agree: first-shot sha256, `nonLoopback: 0`, `survivors: 0`,
  `firefoxSurvivorPids: 0`, `portClosed: true`, 11 steps per run, 6 witnessed requests,
  `playwrightVersion` 1.64.0 (= installed `playwright/package.json` version).
- Entry ↔ LOG ↔ SCORECARD capability row agree on the driver path, receipt path, first-shot
  hash and the "patched Firefox 157.0" label.
- `check-sources.mjs`: `rows=144 … findings=0` (structural only).
- `sources-census.sh validate`: exit 0, `tabi ok`, 20 `W04` lines.
- Lesson's WebKit rejection (`corpus/lessons/round-38.md:6`) is supported on this host:
  `ldd ~/.cache/ms-playwright/webkit-2370/minibrowser-gtk/bin/MiniBrowser` reports 21
  `not found` entries, including `libicudata/i18n/ucu.so.74`, `libflite*.so.1` (9 lines) and
  `libjxl` (1 line). No defect there; the rejection's only weakness is that the `ldd` output
  itself is not committed as a receipt.
- The 68-seat stale block is retained (`SCORECARD.md:2078`) and an append-only correction naming
  34 seats exists (`SCORECARD.md:2102`), as lesson M1's fix describes.

## Limits

- No network fetch was performed (lane egress discipline), so F1's falsifier is stated, not run.
- The counters were not executed here; C1/C2 predicate readings belong to their seats. The
  self-assessment gate was run read-only at `a8e7d50` (exit 1, 233 findings, class mix
  `m1-selftest-tally` 142 / `m2-receipt-exit` 77 / `m3-unlanded-paths` 1 / `m4-nudge-state` 13);
  that is a historical-state reading, not a round-38 verdict, and is recorded only as context.
- The tree changed under the read (`HEAD` `a8e7d50` → `3bc0b10` between 12:35 and 12:37); every
  finding above was re-taken after the move, and F6/F8 were re-checked against `HEAD`.

## Tooling

No installs, no upgrades: no package manager was invoked (pacman transactions are paused and
were not touched). Commands used: `git` (read-only: `log`, `show`, `cat-file`, `ls-files`,
`ls-tree`, `status`, `rev-parse`), `sha256sum`, `grep`/`sed`/`awk`/`find`, `node` (lane gates
`check-sources.mjs`, `check-selfassessment.mjs --rev … --json`, plus `node -e` JSON reads),
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate`, `ldd`, `cat -n`.
No product file, judge, contract or score was modified; nothing was committed or pushed.
Scratch: `/fast/scratch/hyaku/tabi-r38/Scribe51/` (two captures: the gate JSON and the census
stdout) — removed before yielding.
