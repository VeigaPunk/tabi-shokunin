# RevLessonMistakes — round-35 w2 review of lesson §Mistakes M1-M4, §Gate, §Errata intake

Seat: RevLessonMistakes (reviewer, leaf). Lane rev under review: `083c5c643be7aa5965a5de3458a32ed0d289ead3`
(wave-1 integration, master HEAD). Freeze: `a4bfef0f75027c915e715649950b1d46dcb33d83`. Baseline:
`2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684`. Rules: `CORPUS.md` §"Rules added from the kaika campaign"
(`## Mistakes` row shape and "a fix is shown able to fail before it counts"), `LEARNING.md:19-21,70-71`.

## Verdict

**Defect, medium — on the exact axis this seat was assigned: the "fix shown able to fail" chains.** The lesson's
facts are accurate everywhere I could check them from frozen bytes (the M1 threshold mismatch is independently
proven from `claims.json:162` vs counter `:54`/`:77`; the M3 egress measurements and the M4 fake-binary reach are
committed in full in w1), §Gate holds (admits S134–S141 and every rejection are on record, digests match the
registry), and §Errata intake 1–8 disposes all eight round-34 routed defects as stated. But two of the four
§Mistakes rows fail re-derivability of their red state: **M1's boundary artifact scores a rev (`86d6df42…`) that
does not exist in the lane repository** (`git cat-file -t` → exit 128), so its "shown able to fail" state can
only be trusted, not re-checked; and **M2's cited pre-freeze 31-finding J2 run is committed nowhere** — the only
two pre-freeze commits that touch `c1-J2-screen-all.json` hold the already-fixed output. Three low findings
follow (mistake-class vocabulary, a 0-byte egress evidence file cited as an observation, M4's captured-by
attribution). No finding falsifies the lesson's claims; the defects are in the evidence chains the lesson rule
("the observed failure text is committed", CORPUS.md:182) is supposed to guarantee.

## Findings

### F1 — MEDIUM: M1's red state is not re-derivable; its input rev is absent from the repository

- Lesson `corpus/lessons/round-35.md` §Mistakes M1 ("Shown able to fail"): the boundary construction scores
  `.ufo/waves/round-35/measure/c2-M1-boundary-15.json`.
- That artifact is committed at HEAD (reached via snapshot `29fddfe`, landed in `083c5c6`; worktree sha256
  `9fa4570e344f02a9…db7b05f` == `git show 083c5c6:<path> | sha256sum`) and is internally exact: `admitted 15`,
  `unmeasured 2`, `failing 0`, rows R16+R17 `verdict:"no"`, `"predicate":true`, and a literal `exit=0` line;
  its `gateSha256 370e8e95…` and `counterSha256 7cc7f17f…` equal the frozen digests.
- But it records `"rev":"86d6df42cb743691cff0e13f2503dcaf2ed70651"`, and that object is **absent from the lane
  repo**: `git cat-file -t 86d6df42…` → `fatal: git cat-file: could not get object info`, exit 128; no branch or
  ref contains it. The construction ("the integration candidate with R17 marked `no`") lived only in the L1's
  scratch clone, deleted per contract. No reviewer can re-run the frozen counter on that tree (and a reviewer
  seat may not launch Firefox), so the red state is attested by uncorroborated bytes alone. CORPUS.md:179-182
  requires the failure text committed — met on the letter — but the same command cannot be re-executed for the
  named reason (threshold mismatch), which is the substance of "shown able to fail".
- The underlying defect itself is independently proven from frozen bytes, so the claim does not fall:
  `claims.json:162` "admitted >= 16" vs `c2-firefox-bidi.mjs:54` "admitted >= 14" and `:77` `const TARGET = 14`;
  all five C2 controls score `admitted: 0` (`baseline/controls-summary.json`), and w1 MutC2Counter m11
  (`TARGET 14→1`) survives (`MutC2Counter.md:74`).
- Fix direction (for the L1/closure, not this seat): commit the boundary entry tree (or at least the mutated
  entry blob + its tree sha) as a reachable object and cite it from the lesson and QUALITY 98.

### F2 — LOW: M2's red-state pointer is unverifiable; the cited pre-freeze runs are not on any usable ref

- Lesson M2: "Shown able to fail: J2 31 → 0 findings between the two pre-freeze runs." No path, no commit.
- `git log --all -- .ufo/waves/round-35/baseline/c1-J2-screen-all.json` lists exactly three commits:
  `8600b51`, `8c28ae1` (both empty-subject jj snapshots, 17:42:56 -03:00, held only by
  `refs/jj/keep/8600b51bf…` / not by `master`), and the freeze `a4bfef0`. `git cat-file -p` on both snapshots'
  copy reads `"unaccounted":0, "screenFindings":[]`, and the two copies are byte-identical (`diff` empty). The
  31-finding first-run text is committed nowhere I can find (lane-wide grep for `screen-quote` outside w1 hits
  only the round-33 counter files and the lesson itself).
- A findable, committed equivalent DOES exist, one hop away and uncited: w1 MutC1Counter m09 removes the
  short-line admission at `c1-adjacency-sweep-v3.mjs:242` — the pre-fix rule as the only delta — and scores
  "31 screen-quote findings, unaccounted 31" (`MutC1Counter.md:79`; `MutC1Counter/m09-shortLine.deltas.json` at
  HEAD records `unaccounted: 31` throughout). That is a legitimate fix-as-only-delta red state per
  CORPUS.md:179-182. The lesson should cite it (or re-commit the first-run output); as written, the pointer
  resolves to nothing.
- The fix itself is verifiably in the freeze: `c1-adjacency-sweep-v3.mjs:34-35` admits "the whole trimmed
  candidate line (<= 25 words …)" when the 4-25-word/20-non-space-char quote rule cannot apply, and the frozen
  control `c1-J2-screen-all` exits 1 with `screenFindings: 0` (claims.json controls block).

### F3 — LOW: all four §Mistakes class labels are outside the mandated vocabulary

- CORPUS.md:171-175: "One row per mistake: class · evidence pointer · captured-by … · fix. Classes come from the
  `mistakes.md` §5 vocabulary (`vacuous`, `survivor`, `stale-premise`, `reference-drift`, `number-drift`,
  `scope`, `attribution`, `landing`, `provider`)" — confirmed as the complete nine at
  `.ufo/waves/kaika-w1/mistakes.md:447-449`.
- Used: M1 "freeze-consistency", M2 "instrument", M3 "overclaim in a frozen instrument (loopback)", M4
  "instrument trust" — none of the nine. Closest tokens: M1 number-drift, M2 scope, M3 stale-premise, M4
  attribution. Round-33/34 precedent used vocabulary tokens (QUALITY 94 cites round-33 M3 `reference-drift`).
  Row structure (class·evidence·captured-by·fix) is present on all four rows; only the tokens are off-vocabulary.

### F4 — LOW: M3's integration egress evidence is a 0-byte file cited as an observation

- `corpus/lessons/round-35.md` §Mistakes M3 and entry `webdriver-bidi-firefox-runtime-round-35.md:273` (§D11)
  cite `.ufo/waves/round-35/measure/driver-egress-sample.txt` for "0 non-loopback sockets"; QUALITY 100 requires
  exactly this citation. The committed file is **0 bytes** (addition of 0 lines in `29fddfe`; `head` prints
  nothing) — indistinguishable from a never-run sampler: no command echo, timestamp, sample count, or explicit
  zero. The seat-level red state is excellent and fully committed (`w1/SentinelFirefoxEgress/`: `ss` samples +
  strace showing three outbound TLS peers per launch, five failed pref fences, and `network.dns.disabled=true` →
  0 connects; counter claim verified verbatim at `c2-firefox-bidi.mjs:57-58`); the driver fix is real
  (`scripts/bidi-firefox-loopback-round35.mjs:153-155`). Only the integration-run sample artifact is vacuous.

### F5 — LOW: M4's captured-by names a rule that did not capture the incident

- Lesson M4: "Captured-by: the measurement rule — `measure.sh` passes neither flag and records both binaries'
  `--version` and sha256 in provenance; QUALITY 99 makes that comparison a criterion." The mechanics verify
  (frozen `measure.sh:29-30` records firefox/geckodriver `--version` + sha256; `:33` invokes the counter
  without `--firefox`/`--geckodriver`), but the incident (w1 CritC2Counter E3: fake geckodriver + `--version`
  stub → `admitted 16, failing 0, binding null`, exit 0) bypassed measure.sh entirely, and nothing compared the
  recorded provenance against the S140/S141 install receipts until QUALITY 99 created that comparison this
  round. The incident was captured by the critic seat, not by the named rule; the honest captured-by is `none`
  (with QUALITY 99 as the fix). Wording/attribution only; no numeric effect.

## Holds (verified, with evidence)

- **M1 substance and captured-by chain**: declared predicate `claims.json:162` (16) vs counter `:54`/`:77` (14);
  controls `admitted 0` ×5 in `baseline/controls-summary.json`; w1 `RevClaimsFreeze.md` F1 (high) / F2
  (low/medium) state exactly what the lesson attributes to them; `MutC2Counter.md:74` m11 survived.
- **M3 red state**: `w1/SentinelFirefoxEgress.md` + `w1/SentinelFirefoxEgress/evidence/` (committed at HEAD,
  `git ls-tree HEAD` confirms) — three TLS connections per launch measured twice (ss + strace), 4th peer on
  longer sessions, five failed pref fences, `fixE` (`network.dns.disabled`) 0 connects; counter `:57-58` claim
  verbatim; prefs landed in the driver at `:153-155`; counter limit routed (entry `:273` "recorded, not fixed").
- **M4 red state**: `w1/CritC2Counter.md` + `E0–E7` summaries committed at HEAD; E3 headline matches the lesson.
- **§Gate**: admits S134–S141 on record in the lesson table (url/accessed/status/bytes/sha256/quote/location)
  and in `corpus/SOURCES.md:148-155` with matching digests (S134 `2b023afe…`, S135 `e596eee2…`, S136
  `d3e65953…` — 1 match, S137 `757e3955…`, S138 `72cd6162…`, S139 `721e6f0c…`, S140 `bb07ee85…` + SHA256SUMS
  siblings, S141 `419fc73f…`), used-by the C2 entry; registry log line `SOURCES.md:200` ("Opened 9, registered
  8 … refused 1"). Rejects on record with reasons and flip conditions (release notes; Support.html /
  remote index / MDN firefoxOptions; seat-id renumbering; S125 recheck `90d` → `90d` with the routing reason;
  the AdjKotoba1 header-row drop). S138 Gate quote is 22 words (≤ 25).
- **§Errata intake 1-8 vs round-34 routed defects 1-8** (`round-34-verifier-spotcheck.md` §Routed defects):
  1 landed (`corpus/README.md:808-809` names `:794` and `:799`); 2 C1 executed (frozen n4 refusal — control J6
  refuses `n4-split-quote-states-no-side`; browser-ground sweep = C1; v3's own 9-of-13 surviving mutants routed
  with the C1 counter amendment, disclosed); 3 carried (`claims.json` notClaimed[1]); 4 both disposition files
  exist (A: 14 `## U` headings U01–U14; B: "All fourteen findings (U15–U28) still hold", receipt 36 HOLDS /
  0 BROKEN); 5 routed again with reason in §Gate registry log (S125 row carries `90d`); 6 all three precision
  corrections present at `corpus/lessons/round-34.md` EOF (S131 span 244-248, kake:411 note cell, RFC 4122
  refusal basis); 7 carried (notClaimed[0]); 8 no misroot — 51 w1 entries, all seat-named from the wave id `w1`
  (0 pattern hits).
- **QUALITY 98-100 red states and citations**: all three criteria exist at `corpus/QUALITY.md` (Round 35
  additions) citing lesson M1/M4/M3; their line cites check out (`counter :54, :77`; `measure.sh:29-30, 33`;
  `counter :57-58`).

## Residual risk and verification gaps

- I re-executed no counter (reviewer seat; browsers forbidden). The M1 boundary artifact and the C2
  integration reading are accepted on committed bytes; the closure's measure.sh run is the arbiter.
- The 31-finding pre-freeze J2 output may survive in jj abandoned working-copy commits not visible to a git-refs
  sweep (the only ref that holds a J2-touching snapshot is `refs/jj/keep/8600b51bf…`, and it holds the fixed
  output). `git fsck --unreachable` by the L1 could settle it; until then F2 stands.
- `m09-shortLine.deltas.json` records counts only (no `screen-quote` id strings); the "31 screen-quote findings"
  wording rests on `MutC1Counter.md:79` prose plus the deltas' `unaccounted: 31`.
- No lsp device is available to this seat; all caller/definition/diagnostic checks above are byte- and git-level
  reads of committed objects (recorded per role instructions).

## Commands run (selection, with exit codes)

- `git cat-file -t 86d6df42cb743691cff0e13f2503dcaf2ed70651` → exit 128 (object absent) — F1.
- `git log --all --format='%h %s' -- .ufo/waves/round-35/measure/c2-M1-boundary-15.json` → `083c5c6`, `29fddfe`;
  `sha256sum` worktree vs `git show 083c5c6:<path>` → identical `9fa4570e…` — F1.
- `git show a4bfef0f…:.ufo/waves/round-35/claims.json | grep -n 'admitted >='` → `162: … admitted >= 16`;
  `git show a4bfef0f…:.ufo/waves/round-35/counters/c2-firefox-bidi.mjs | grep -nE 'TARGET|loopback'` →
  `58`, `77` — M1/M3 holds.
- `git log --all -- …/baseline/c1-J2-screen-all.json` → `8600b51`, `8c28ae1`, `a4bfef0`; `git cat-file -p
  8600b51:<path>` / `8c28ae1:<path>` → `"unaccounted":0` `"screenFindings":[]`; `diff` of the two → empty;
  `git for-each-ref` containment → `refs/jj/keep/8600b51bf…` only — F2.
- Greps (all exit 0): SOURCES S134-S141 rows + `d3e65953…` (1 hit); `controls-summary.json` `"admitted": 0` ×5;
  `MutC2Counter.md:74` m11 survived; `MutC1Counter.md:79` m09 "31 screen-quote findings, unaccounted 31";
  `README.md:808-809`; `round-34.md` EOF corrections; `ScribeUDispositionsA` 14 U-headings; `measure.sh:29-33`;
  driver prefs `bidi-firefox-loopback-round35.mjs:153-155`; `driver-egress-sample.txt` 0 bytes;
  `webdriver-bidi-firefox-runtime-round-35.md:273` (D11).
- All git invocations were read-only in the lane (no clone needed: no lane script was run, no browser launched,
  no network fetch made, no tool installed or upgraded). Scratch `/fast/scratch/hyaku/tabi-r35/RevLessonMistakes`
  was created unused and removed before yield.

## Deliverables

- Report: `tabi-shokunin/.ufo/waves/round-35/w2/RevLessonMistakes.md` (this file)
- Command log: `tabi-shokunin/.ufo/waves/round-35/w2/RevLessonMistakes/evidence-commands.md`
