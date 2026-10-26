# ScribeSelftestNote — C2 entry draft (self-test of the BiDi runtime gate)

**Verdict: deliverable drafted, and one claim-level defect found before the build.** The C2 entry draft is at
`.ufo/waves/round-34/w1/ScribeSelftestNote/bidi-gate-selftest-round-34.md`: what the self-test is for, the 20 frozen
MutGateV2 mutants with their rule sites at `15dfaccb` (three of my line anchors differ from round-33's because the gate
grew by 481/−113 lines at `042d6d9`), the design rules a kill case must obey, and the id-shape facts (S127 + S125
re-opened first-hand this round; S130/S131 are declared placeholders). Along the way the seat's probes established that
the frozen C2 target is **unreachable as written**: of the 12 survivors, 9 are killable by added cases, but M04, M05 and
M06 are *equivalent mutants* under the gate's own rule set — same path ⇒ same blob ⇒ same sha (M04 ⊂ M05); same sha ⇒
byte-identical transcripts ⇒ same sessionId, which `:811` refuses (M05 ⊂ M19); any A-F sessionId the widened
`SESSION_ID` admits still fails `WS_SESSION` (`:148`) or the `:388` binding (M06 masked). The ceiling is **17 of 20
killed**. This is a decision for the L1 (claim correction or an honestly-recorded miss), not something a case author can
fix; the claims' `feasibilityDisclosed` named M03 and M10 as the risky two, and both are in fact killable.

## Evidence (commands, exit codes)

Scratch `S=/fast/scratch/hyaku/tabi-r34/ScribeSelftestNote`; one clone, baseline `15dfaccb`.

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                       # 0
git -C "$S/clone" checkout -q --detach 15dfaccb34601c2d221c78501e2befd8998d600c                  # 0, HEAD=15dfaccb
git -C "$S/clone" rev-parse --show-toplevel                                                     # $S/clone
sha256sum "$S/clone/scripts/check-bidi-runtime.mjs"                                             # eded1be0…61c1  (== baseline gate, == gate at 6f4053db)
git -C "$S/clone" merge-base --is-ancestor 6f4053db… 15dfaccb                                   # 0 (baseline is round-33 HEAD + spot-check)
grep -c '^  { id: "' "$S/clone/scripts/check-bidi-runtime.mjs"                                  # 41 (+3 refusal cases = 44 per c2-J1 json)
sha256sum .ufo/waves/round-34/counters/c2-gate-mutants.mjs                                      # 3cf5eb69…2582 (== frozenDigests)
```

Rule anchors at the baseline (`grep -n` over the clone's gate): `:144` DRIVER_ALLOW, `:145` SESSION_ID, `:146`
CONTEXT_ID, `:148` WS_SESSION, `:149` MEASURED, `:373` verdict folding, `:388` ws↔sid binding, `:434`/`:447` driver
relations, `:750` Gate-row sha, `:753` host equality, `:757` witness, `:778` gate byte-copy, `:797` path distinctness,
`:798` sha distinctness, `:811` sid distinctness, `:843` duplicate-id, `:860` admitted arithmetic, `:867` clean guard.

```
node probe.mjs    (S=… TMPDIR=$S/tmp)                                     # script exit 0; 12 variants
  pristine       52/53 (one seat probe expectation was wrong — see below)
  M01/M03/M09/M10/M18/M19  exactly one probe flips PASS→FAIL (killed)
  M05  no flip;  M05+M19  p-sha-dup-same-bytes flips (M05 ⊂ M19 shown)
  M06  no flip;  M06+WS_WIDE  p-uppercase-sid flips (mask is WS_SESSION)
node probe2.mjs   (adds three builder options: samePathDistinctBytes, wsSid, lessons-no-sha)
  pristine exit 0  verdict=clean cases=48 passed=48
  M07 / M16 / M08  exactly one probe flips (killed); M04 did NOT flip
node probe3.mjs   (10 kill probes; full chain on same-path)
  pristine 54/54 clean; M04 54/54 clean; M04+M05 54/54 clean;
  M04+M05+M19 50/54 FAIL (v2-f3-same-path-twice, v2-f4-byte-copy, chain-same-path, k-M19-sid-repeated)
```

The single wrong expectation in `probe.mjs` was mine: `p-lowercase-context` passed `contextId` at the top level, which
the baseline builder only forwards through `run1`/`run2`, so the case built an ordinary golden pair and read `admitted
16`. Corrected in `probe2.mjs` (`run1:{contextId:"a"*32}, run2:{contextId:"b"*32}`) → pristine `t1-receipt`, M08
flips. The probe1 pristine `exit=3` is that one failing probe (52/53), not a gate defect; pristine is 54/54 in probe3.

Fetches (`curl -q -sS --proto =https`, Gitiles `?format=TEXT`, base64-decoded; receipts in the seat dir):

| URL | UTC | HTTP | raw B / sha256 | decoded B / sha256 |
|---|---|---|---|---|
| `…/tags/154.0.8037.97/chrome/test/chromedriver/util.cc?format=TEXT` | 2026-10-26T19:51:13Z | 200 | 26200 / `e3e0d00f…b2e00d4` | 19648 / `3ed654c7…be37b` (= S127) |
| `…/chrome/test/chromedriver/session_commands.cc?format=TEXT` | 2026-10-26T19:52:04Z | 200 | 90944 / `c5d66f5a…9074876e` | 68207 / `7b40e94c…7abb5` (= S125) |

`util.cc:39-43` `GenerateId()` → `"%016" PRIx64 "%016" PRIx64` (32 lower-case hex); `session_commands.cc:288-289`
`caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id)`; `:372` `body.Set("sessionId",
session->id)`. Honest transcripts: run1 `sessionId 10abbb479bdcc37a405098c5ea778bf0`, context
`31B8FE9C25C36020CBB175F250715903`; run2 `6b30c7033f4821af5f94d9e75e85b234`, `0E62B928C3D82E935056B338D5E0FBF4`.

## Findings

- **F1 (high, decision for the L1): the frozen C2 target `survivors 0 of 20` is unreachable.** M04, M05, M06 are
  equivalent mutants; proof and probe receipts in entry §3(e)/§5(a). Reachable maximum is 17/20 (baseline 8 + 9
  killable). A suite built to the letter of the claim will read `survivors 3, predicate false` and be *honest*; that
  must be recorded as a limit of the target, not as a mis-built suite. The frozen `killRule` has no equivalence clause.
- **F2 (medium): three label spaces collide on `M<nn>`.** MutGateV2's M04 is transcript-path distinctness; round-32
  MutC1's M04 is between-runs chromedriverVersion equality; the self-test case ids `v2-m04-…`/`v2-m06-…`/`v2-m09-…`
  carry round-32's labels. The entry states the mapping; a case author reading only `MutGateV2.md`'s table can bind the
  wrong rule.
- **F3 (medium): `feasibilityDisclosed` named the wrong survivors.** It flags M03 and M10 as possibly equivalent; both
  are killable (upper-case `Measured` cell; a driver importing `serveFixture`). The actual blockers (M04/M05/M06) were
  not disclosed. QUALITY criterion 90's discipline (a feasibility sentence is bounded by the attacks actually run)
  applies to the *counter* C2 target here, not just to prose.
- **F4 (low, integration): S127 cannot satisfy the entry's own `s1` check.** S127 exists at `15dfaccb`, and `s1`
  (`:746-757`) requires a cited row that is absent at `--baseline`; the entry needs S130/S131 plus their lesson `## Gate`
  rows or the gate reads `s1-source-row`. Stated in entry §5(f).
- **F5 (info): M10's self-test gap closes cheaply.** A self-test driver importing `serveFixture`, expected to admit 16,
  kills M10 with the existing `driverText` option — the round-33 battery was the only detector for it.

## Touched surfaces

Wrote only: this report, `.ufo/waves/round-34/w1/ScribeSelftestNote/` (entry draft, `probe/`, `fetch/`,
`fetch-receipts.md`), scratch `$S` (deleted). No lane tracked file, lane index, lane jj state, fleet-root file, sibling
repo, or `~/.local/bin` entry was written; no lane script was executed from the lane checkout (the gate ran only from
scratch copies of the clone's bytes). No commits outside scratch; no fixture repo left behind. No browser launched. No
tool installed or upgraded (node v24.21.0, git as present). One coordination message to `ExecSuiteBuild-2` carrying F1.

## Out of scope / not run

- The frozen C2 counter (`c2-gate-mutants.mjs --rev REV`) was **not run** by this seat — the round measurement is the
  L1's; every `<L1: …>` marker in the entry is unfilled for that reason.
- No lane gate, no battery, no `--live` leg, no `measure.sh`, no build/lint/format.
- The wave-2 code read that guards the counter's whitespace-normalised-sniff residual; CritForgeV2B/C stay open as
  recorded in the entry's §5.
- `S130`/`S131` are placeholders for scouts `ScoutContextIdSource`/`ScoutSessionBinding`; nothing in the entry rests on
  them (stated there).

## Deliverables

- `.ufo/waves/round-34/w1/ScribeSelftestNote/bidi-gate-selftest-round-34.md` — the C2 entry draft (20719 B).
- `.ufo/waves/round-34/w1/ScribeSelftestNote/fetch-receipts.md` — the two fetches, digests, quoted spans.
- `.ufo/waves/round-34/w1/ScribeSelftestNote/probe/{probe.mjs,probe2.mjs,probe3.mjs,killmap.json,killmap2.json,killmap3.json}`
  — probe harnesses and per-variant results (sha256 `4601944d…9f1`, `ac70efda…788`, `5b80898c…93e`).
- `.ufo/waves/round-34/w1/ScribeSelftestNote/fetch/{util.b64,util.cc,sc.b64,session_commands.cc}` — retained bodies.
- This report: `.ufo/waves/round-34/w1/ScribeSelftestNote.md`.
