# Round 35 w2 — RevUDispositions — sample-check of the round-33 wave-2 U01–U28 dispositions

Seat `RevUDispositions` (reviewer, leaf). Item: pick 8 of the 28 U-dispositions across
`.ufo/waves/round-35/w1/ScribeUDispositionsA/dispositions.md` (U01–U14) and
`.ufo/waves/round-35/w1/ScribeUDispositionsB/dispositions.md` (U15–U28), re-check each finding's bytes at the
wave-1 integration **`083c5c643be7aa5965a5de3458a32ed0d289ead3`**, and judge each disposition (routed with a real
reason / correction text true / closed with evidence).

**Verdict: holds.** All eight sampled dispositions (U01, U04, U08, U10 from file A; U16, U19, U21, U24 from file B)
**agree** at `083c5c6`: every finding's named bytes still read exactly as the finding states; both "closed/fixed"
dispositions stand on real, re-verified evidence (U08's adjudication exists at `corpus/lessons/round-32.md:229`,
introduced by `b44b964`, the round-34 w2 integration; U24's fix case exists at `scripts/check-bidi-runtime.mjs:1031`,
introduced by `04f9623`, and I re-executed the gate's offline `--selftest` at `083c5c6`: exit 0,
`v3-a-m03-measured-cell-uppercase … exit=0 admitted=2 … PASS`, `verdict=clean cases=56 passed=56`); every "routed"
disposition's reason is real (all three routed items depend on an instrument byte-frozen in
`.ufo/waves/round-35/claims.json`, and the file digests at `083c5c6` still equal the frozen pins: gate
`370e8e95…` = `claims.json:26`, adjacency gate `4e2c2a64…` = `:25`, v3 counter `5707a937…` = `:21`); and all three
"correction-drafted" texts are true against the bytes (every stale sentence is still stale, and none was corrected
by wave 1). No defect found in the sampled set. One scope note, not a defect: the scribes re-checked at the freeze
`a4bfef0f`, this seat at the assigned `083c5c6`; wave 1's delta between the two touches none of the sampled bytes
(`corpus/lessons/round-33.md` is absent from the `a4bfef0f..083c5c6` name-status; `QUALITY.md:540/545/567` and
`README.md:766` read unchanged at `083c5c6`), so both readings hold at the integration.

## Sampled dispositions — agree/disagree

| U-id | disposition as filed | verdict | byte evidence at `083c5c6` |
|---|---|---|---|
| U01 (A) routed — `MEASURED` admits dash-decorated `yes` / any case | **agree** | gate `:149` `/^(yes\|no)(?:\s*[—–-]\s*\S[\s\S]*)?$/i` byte-identical; battery re-run from the frozen regex: `"yes — live"`→true, `"YES"`→true, `"yes (live)"`→false. Route reason real: gate sha256 = `370e8e95…` = `claims.json:26` "must stay unchanged"; counter `c2-firefox-bidi.mjs:70` pins, `:326` refuses any other byte |
| U04 (A) routed — `contested-open` l0 check is token-anywhere | **agree** | `scripts/check-adjacency.mjs:919` `if (!line.text.includes(sibling))`, `:231` `L0_TABI_ROW`; fleet `.ufo/l0-questions.md:65` `L0_TABI_ROW`=true, `kake` count 1. Escalation also byte-true: v3 counter passes `ruled`/`contested-open`/`refused-route` with no quote condition (`return true`, ~`:288-290`); adjacency gate sha = `claims.json:25`, counter `:74`/`:181` enforce |
| U08 (A) closed — 20 vs 21 adjudicated by `b44b964` | **agree** | `corpus/lessons/round-32.md:229` carries the adjudication verbatim (both bases: 20 of 27 capital markers, 21 of 31 capital plus dual-marked; "the landing stays the basis statement, not a number"); `git log -S "Round 34 wave-2 correction"` → `b44b964` only (subject: round-34 w2 integration); `LOG.md:2356` is exactly the "supported remain-count is 20 of 27" sentence; counterpart finding `CritErrataLanded.md` "20 vs 21 (defect 3)" present |
| U10 (A) correction-drafted — S128 says "(9 words)", quote is 7 | **agree** | `corpus/lessons/round-33.md:36` carries the launcher.c:26 quote with `(9 words)` (grep: only hit); `printf '%s' '<quote>' \| wc -w` → **7**; wave 1 did not touch `round-33.md` (absent from the integration delta), so the draft is still open and its text is true |
| U16 (B) correction-drafted — criterion 89's `§Gate` pointer wrong | **agree** | `corpus/QUALITY.md:567` unchanged at `083c5c6` ("(source: corpus/lessons/round-33.md §Gate;"). Term counts reproduced: `battery\|forgeriesAccepted\|whitelist` in `round-33.md` → 0 hits in `:24-92` (§Gate), 5 hits in `:173-189` (M1, at `:183-187`) — exactly as filed; drafted rewording "§Mistakes M1" is true |
| U19 (B) correction-drafted — `README.md:766` population overstates | **agree** | `README.md:766` still "Every browser-domain line of the twenty sibling `PROVINCE.md` files at frozen pins …" (the earlier round-33 wave-2 correction block corrected that row's "four new kake overlaps" enumeration, not the population claim; wave 1's README EOF block cites only `:794`/`:799`). Population re-check reproduced exactly: regex `c1-adjacency-sweep.mjs:65` over kake `0440485` `PROVINCE.md` → no-match `67,354-357,360,361,363`; match `358,359`; `362` match + names tabi (excluded by the not-tabi clause, `claims.json:33`) — the drafted rewording and its carried-limit list are true |
| U21 (B) routed — substring quote truncation survives both instruments | **agree** | gate `:728-731` `if (!line.text.includes(quote))`; round-35 counter inherits it: `c1-adjacency-sweep-v3.mjs:242` `c.text.includes(quote)` (with `goodQuote` `:131` 4–25 words / ≥20 non-space). Route reason real: counter sha256 at `083c5c6` = `5707a937…` = `claims.json:21` `frozenDigests` (frozen before data; wave 1 already scored against it) |
| U24 (B) fixed-in-substance by `04f9623` + stale-sentence correction | **agree** | gate `:149` `/i`, `:373` `m[1].toLowerCase()`, `:860` `row.verdict === "yes"`; case `v3-a-m03-measured-cell-uppercase` at `:1031` (`exit: 0, admitted: 2`, cell `"Yes"`); mutant M03 at `.ufo/waves/round-34/counters/c2-gate-mutants.mjs:72-76` drops `.toLowerCase()`. `git log -S` case id → `04f9623` only (round-34 w1 integration, "twelve gate kill cases"). Re-executed: `--selftest` exit 0, that case PASS at admitted 2, 56/56 clean. B's phrasing is exact: the code still accepts uppercase (measured + admitted); the case pins the behaviour, and the finding's "admits nothing" sentence is the stale half, correction-drafted |

Counts: 8 sampled, 8 agree, 0 disagree; by disposition type: routed 3 (U01, U04, U21), correction-drafted 3
(U10, U16, U19), closed/fixed 2 (U08, U24).

## Evidence

Commands and outputs: `.ufo/waves/round-35/w2/RevUDispositions/checks-output.txt` (verbatim transcript; captured
exit codes: clone/checkout 0, `merge-base --is-ancestor` 0, node regex/population run 0, `wc -w` run 0, selftest 0,
diff name-status filter 0). Key pins:

- `sha256sum` at `083c5c6`: `scripts/check-bidi-runtime.mjs` = `370e8e95417e16dd…c87`,
  `scripts/check-adjacency.mjs` = `4e2c2a64b9eae9c1…aac`,
  `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs` = `5707a93742565c17…6b9` — equal to `claims.json:26`,
  `:25`, `:21` respectively (read at the freeze `a4bfef0f`, which `merge-base --is-ancestor` confirms is an
  ancestor of `083c5c6`).
- `git -C clone diff --name-status a4bfef0f… 083c5c6` (non-`.ufo`): M LOG.md, M SKILL.md, M corpus/QUALITY.md,
  M corpus/README.md, M corpus/SOURCES.md, A corpus/adjacency-screen-browser.tsv, M corpus/adjacency.tsv,
  A receipt+2 transcripts, M census, A Firefox entry, M lessons/round-34.md, A lessons/round-35.md,
  A scripts/bidi-firefox-loopback-round35.mjs. No sampled byte's file was rewritten in place; verified directly
  for the sampled lines (round-33.md:36; QUALITY.md:540/545-546/567; README.md:766).
- Finding files all present verbatim at `083c5c6`: `RevGateV2Code.md` L1 (§Low), `MutC1Rows.md:60-61`,
  `RevLesson33.md:52`, `RevQuality87.md:159-160`, `CritAdjacencyHarm.md:117`, `MutGateV2.md:63`,
  `CritCorrections.md:69`, `CritErrataLanded.md` defect 3.

## Residual risk and verification gaps

- Coverage: 8 of 28 dispositions sampled (U02, U03, U05–U07, U09, U11–U15, U17, U18, U20, U22, U23, U25–U28
  unattested by this seat).
- U24's fix was re-executed only through the gate's in-process `--selftest` (no browser launched); the
  other 55 cases were not individually re-derived.
- U16's §Gate range end (`:92`) is taken from the finding, not independently bounded; the 0-hit result is robust
  (the next hits after `:24` are at `:15-18`' neighbourhood and `:165+`, so any bounded §Gate in `24-164` reads 0).
- `LOG.md:2355`'s "dispositioned 19 of the 27" half of CritCorrections D3 has its own later superseding correction
  (seen in the `LOG.md:2356` context); I confirmed its existence by read, not by re-derivation.

## Hygiene

No tool installed or upgraded (pacman, uv, npx, binaries: none; nothing written to `~/.local/bin`). No network
fetch. No browser or driver process launched — the only execution beyond read-only git/grep was
`node scripts/check-bidi-runtime.mjs --selftest` (in-process, offline, TMPDIR under scratch). Reads of sibling
repos limited to `git -C /home/vgpnk/Projects/shokunin/kake-shokunin show 0440485:PROVINCE.md` and a read of the
fleet `.ufo/l0-questions.md:65`; no lane tracked file, lane index, jj state, fleet file, or sibling worktree
written. Writes: this report and `RevUDispositions/checks-output.txt` only. Scratch
`/fast/scratch/hyaku/tabi-r35/RevUDispositions` (shared clone detached at `083c5c6`, tmp) deleted after these
files were written.

## Deliverable paths

- Report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/RevUDispositions.md` (this file)
- Output dir: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/RevUDispositions/` —
  `checks-output.txt` (command transcript with exit codes and byte evidence)
