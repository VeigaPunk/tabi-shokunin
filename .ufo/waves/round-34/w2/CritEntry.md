# CritEntry — wave-2 attack on `corpus/knowledge/bidi-gate-selftest-round-34.md` at `04f9623`

**Verdict (one paragraph).** The entry's load-bearing technical content holds on every sentence I could test
against the gate at `04f9623`, the frozen mutant data, the two executor reports and the cited sources: all twenty
rule-site line numbers are exact at `15dfaccb` (gate sha256 `eded1be0…61c1`), every "self-test at baseline" cell
matches the frozen baseline control, "44 to 56" is exactly right, the "#M04/M05/M06 needed detail pinning" claim is
true at the strongest level (the mutated gates keep exit/admitted/population/reason and differ *only* in the printed
finding detail), and every id-shape derivation reproduces from the recorded URLs. The C2 predicate is true at the
judged revision by my own run of the frozen counter (exit 0, killed 20/20, survivors `[]`, twinsFailing `[]`,
pristine/neutral/decoy 0, battery true) — so the entry is not propping up a false claim. It carries **four
documentation defects**, none of which moves the operability reading: one medium — §4 (`:73`) and `verified-at`
(`:2`) point the reader at `.ufo/waves/round-34/measure/c2-at-*.json` and a "round-34 SCORECARD disposition" that do
not exist at the commit (the only mutant readings the L1 produced are in w2 seat receipts and in the frozen counter
itself), so the entry's sole "how to verify me" pointer 404s; and three low — §5 (`:81-83`) characterises the open
CritForgeV2C limit by its weaker construction and a wrong explanation (the admitted hole is the s1 witness loop's
`break` at the first grounded id, not merely "syntactic provenance"), §5 omits that three of the twelve kills are
behaviourally equivalent mutants killed only through the finding-detail assertion (fail-closed on any message
rewording), and the §3 scope clause (`:66-67`) understates the rule's reach, since `CONTEXT_ID` polices *every*
context id a run mentions, including the nested-frame `frameId` shape this round did not open. Severity of the whole
set: documentation; the C2 axis reading (operability) is unaffected.

## Evidence base (commands, exit codes)

Read-only lane access; one scratch clone (`git clone --shared …tabi-shokunin`, `checkout --detach
04f9623dde8ad35d470cecf766e421eafbcb47fa`, `rev-parse --show-toplevel` = the clone, exit 0). Lane scripts were never
executed from the lane checkout; the gate and the counter ran from scratch copies/clones with `TMPDIR` under
`/fast/scratch/hyaku/tabi-r34/CritEntry`.

```
git -C clone show 15dfaccb…:scripts/check-bidi-runtime.mjs > base/gate.mjs   # exit 0; sha256 eded1be0…61c1 (== entry :15)
git -C clone show 04f9623…:scripts/check-bidi-runtime.mjs > head/gate.mjs   # exit 0; sha256 370e8e95…86c87
TMPDIR=$S/tmp node base/gate.mjs --selftest        # exit 0  BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44
TMPDIR=$S/tmp node head/gate.mjs --selftest        # exit 0  BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56
sha256sum clone/.ufo/waves/round-34/counters/c2-gate-mutants.mjs        # 3cf5eb69…2582 (== claims.json frozenDigests)
sha256sum clone/.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs # 51ace65f…812b (== claims.json frozenDigests)
TMPDIR=$S/tmp node clone/.ufo/waves/round-34/counters/c2-gate-mutants.mjs \
  --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa --repo $S/clone --json  # EXIT=0 (73 s)
    predicate true, killedCount 20, survivors [], unappliable [], twinsFailing [],
    pristine/neutral/decoy exit 0, battery {predicate true, forgeriesAccepted 0, honest H0/H1/H2 true}
node scan: for each of the 20 frozen find texts, list the base/gate.mjs lines containing it
                                                              # 20/20 occurs exactly once, at the table's stated line
node .ufo/…/c2-J1-do-nothing.json read                       # killed 8, survivors 12, M15 failingCases 37, first golden-two-runs
node rewrite of head/gate.mjs with the counter's exact M04/M05/M06 find→replace (uniqueness asserted),
  then node <mutant> --selftest --json                        # exit 3 each; one failing case; only `detail` differs
```

Fetch receipts (URL, UTC, HTTP, bytes, sha256) are in `CritEntry/fetch-receipts.md`; the raw digests for
`token.cc`, `CdpTargetManager.ts`, `commands.cc`, `session_commands.cc` reproduce the ones already recorded for
S130/S131/S132/S125 byte-for-byte.

## Findings

### F1 — defect, **medium**: §4's measurement citation resolves to nothing at the judged revision

- Entry `:73`: "Frozen counter readings are in `.ufo/waves/round-34/measure/c2-at-*.json` (round-34 SCORECARD
  disposition)"; entry `:2` (`verified-at`): "self-test and mutant readings in §4".
- Counterexample, measured at the commit:

  ```
  git -C clone ls-tree -r --name-only 04f9623 -- .ufo/waves/round-34/measure   # no output, exit 0
  find tabi-shokunin/.ufo/waves/round-34 -name 'c2-at-*'                        # baseline/measure-at-baseline/c2-at-15dfacc.json,
                                                                               # w1/ExecMeasureHarness/c2-at-15dfacc.json,
                                                                               # w1/ExecMeasureHarness/fake-rev-probe/c2-at-59f1b47.json,
                                                                               # w2/RerunNoHarm/receipts/c2-at-04f9623.json  (none at :73's path)
  grep -n "c2-at" SCORECARD.md                                                  # only :1720 (round-32)
  ```

  The worktree's `.ufo/waves/round-34/measure/` exists but is empty; `master` is `04f9623`; SCORECARD's round-34
  sections (`:1855-1892`) are the declared-claims table, the nine controls and the 44→56 corrections — there is no
  measured C2 disposition. `claims.json:19` shows the path is the *intended* after-measurement location ("Raw output
  is committed under `.ufo/waves/round-34/measure/` before the report"), i.e. the sentence is a forward reference
  written as a present fact. §4 also carries no mutant reading (killed/survivor counts), so `:2`'s "mutant readings
  in §4" is likewise unbacked.
- Impacted axis: operability (the C2 entry's verifiability); no claim harm — the reading itself is true (my run
  above, `CritEntry/counter-at-04f9623.json`).
- Smallest safe correction: re-point `:73` at what exists at the commit — "before: `baseline/c2-J1-do-nothing.json`;
  after: the round's measure output, appended under `.ufo/waves/round-34/measure/` at closure" — and drop
  "(round-34 SCORECARD disposition)" until that disposition exists; either add the killed/survivor counts to §4 or
  change `:2` to "self-test readings in §4; mutant readings in the counter output".

### F2 — defect, **low**: §5's CritForgeV2C limit names the weaker construction and the wrong reason

- Entry `:81-83`: "… CritForgeV2C (a junk Gate row with a made-up digest) stay open: v2's provenance rules are
  syntactic, and killing mutants does not change that."
- Counterexample: `.ufo/waves/round-33/w2/CritForgeV2C.md:5-14` reports the further, worse admission — a fabricated
  `mined` row needs **no Gate row at all** when the entry's `source:` line co-cites one honest S-id, "because the
  witness loop breaks at the first grounded id (`scripts/check-bidi-runtime.mjs:742-751`)"; both `v2-f8` and battery
  F8 use a single `S990` id, so multi-cite source lines are untested. The gate at `04f9623` is unchanged there:
  `base/gate.mjs:746-755` (identical lines at head) `break`s on the first witness. That is a control-flow defect, not
  the "syntactic provenance" limit the sentence gives as the explanation.
- Impacted axis: operability (a recorded limit that misdirects the next round's attack).
- Smallest safe correction: replace the parenthetical with "CritForgeV2C (a fabricated row admitted by a fabricated
  Gate row, and by a single honest co-cited id because the witness loop stops at the first grounded id)" and replace
  "v2's provenance rules are syntactic" with "v2 binds shape and cross-run identity, not execution".

### F3 — defect, **low**: §5 omits that three kills are behavioural-equivalence kills observable only in the message

- Entry §1 annotates M04/M05/M06 "(pins the finding detail)" and §2 (`:48-53`) explains the mechanism, but §5 — the
  section an editor reads before touching gate messages — records nothing about it.
- Counterexample (my reproduction on the head gate, `CritEntry/mutant-detail-kills.json`):

  ```
  M04 → CASE id=v3-b-m04… expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=- population=16
        expected_reason=t1-receipt reason=t1-receipt FAIL
        detail "transcript sha256 repeated across runs (byte-identical copies)"
        (pristine "transcript path repeated across runs: …run1/transcript.jsonl, …run1/transcript.jsonl")
  M05 → same four fields equal; detail "sessionId repeated across runs: e3a0…, e3a0…"
        (pristine "transcript sha256 repeated across runs (byte-identical copies)")
  M06 → exit 1, admitted 0, population 1, reason t1-receipt, all equal; detail
        "run1: webSocketUrl is not ws://<host>/session/<sessionId>: ws://127.0.0.1:9515/session/585E…BC9"
        (pristine "run1: sessionId is not 32 lowercase hex: \"585E…BC9\"")
  ```

  So for M04/M05/M06 the mutated gate still refuses the same receipt; the kill exists only because the case asserts
  the gate's printed message (and the message encodes the path→sha→sessionId→ws-shape precedence). Reword any of the
  three messages and the pristine self-test fails (fail-closed, as ExecKillsA flagged); reorder the checks
  behaviour-preservingly and three kills vanish. The entry's §2 says this is by design; §5 should say what it costs.
- Impacted axis: operability (the self-test's maintenance contract).
- Smallest safe correction: add a §5 bullet — "Five cases (M04 M05 M06 M07 M19) assert the finding detail; for M04,
  M05 and M06 the mutant refuses the same fixture and only the message differs, so those three kills pin the
  finding's precedence and text, and a message rewrite fails the self-test loudly."

### F4 — defect, **low**: §3's scope clause understates which id shapes the rule polices

- Entry `:66-67`: "Scope: page targets on Chromium 154.0.8037.97; tab targets were not read."
- Counterexample: the gate's own contract (`head/gate.mjs:66-69`) polices "**every** browsing-context id the run
  mentions"; S131 (`corpus/SOURCES.md:145`) says "a nested frame's id is the CDP `frameId` verbatim", and the mapper
  creates nested contexts from `params.frameId` (`CdpTargetManager.ts:135-137`). w1 ScoutContextIdSource states the
  gap directly: "Not opened: the nested-frame `frameId` shape, tab-target ids". The entry names only tab targets, so
  a reader concludes the only ungrounded part of the shape claim is the tab-target branch, not the nested-context
  branch the same rule admits or refuses.
- Impacted axis: operability (sourcing scope of the M08 rule).
- Smallest safe correction: extend the clause — "Scope: page targets on Chromium 154.0.8037.97; tab targets and the
  nested-frame `frameId` shape were not opened, though the rule polices every context id a run mentions (header
  `:66`)."

### F5 — info: `recheck` legend (`:3`) omits the battery leg

Counter `c2-gate-mutants.mjs:241` composes `predicate` from pristine/neutral/decoy, twins, unappliable, survivors
**and** `battery.predicate`, and `:259` exits 0 on that whole conjunction. The entry's "exit 0 = every frozen mutant
is killed … and the neutral, decoy and twin probes pass" is therefore incomplete: exit 0 also requires the round-33
forgery battery to read predicate true (it does: my run). No fix needed beyond adding ", and the round-33 battery
still true"; noted for the next editor of the line.

### F6 — info: S132 attribution

`verified-at` (`:2`) says the row `S132` was opened by w1 ScoutSessionBinding; that seat drafted the `commands.cc`
row as **its** `S133` (`.ufo/waves/round-34/w1/ScoutSessionBinding/rows.md:22`) and the L1 renumbered it to S132
(lesson `corpus/lessons/round-34.md`, §"Source rows opened this round": "S132 … (w1 ScoutSessionBinding, drafted as
its S133)"). Content and final id are correct; only the seat/id pairing is compressed. No change required.

## What holds (each checked, not assumed)

- **Rule-site line numbers** (`:19-38`): every one of the 20 frozen find texts occurs exactly once at the stated
  baseline line — `:144` (M09/M10), `:145` (M06), `:146` (M08), `:149` (M02), `:373` (M03), `:388` (M07), `:434`
  (M11), `:447` (M12), `:750` (M16), `:753` (M15), `:757` (M14), `:778` (M13), `:797` (M04), `:798` (M05), `:811`
  (M19), `:843` (M01/M01b), `:860` (M17), `:867` (M18). The "rules grew by ~4 lines since `042d6d9`" pattern the
  ScribeSelftestNote predicted is exactly what the scan shows (e.g. M13 `:774`→`:778`).
- **"self-test at baseline" column**: matches `baseline/c2-J1-do-nothing.json` exactly — killed 8 (`M01b M02 M11
  M12 M13 M14 M15 M17`), survivors 12, M15 `failingCases` 37 with first `golden-two-runs`, every kill's case id (as
  listed in the table) is the failing case.
- **"44 to 56"**: 44 (baseline gate) → 56 (head), both exit 0 clean; the twelve added ids are the six `v3-a-*` and
  six `v3-b-*` the table names, and the head gate carries one `detailIncludes` field (no `bDetailIncludes`).
- **M04/M05/M06 "needed detail pinning"**: verified at the strongest level in F3 — identical exit/admitted/
  population/reason on the mutant, different detail. §2's masking chain (path⇒bytes⇒sha, bytes⇒sessionId) is the
  observed one.
- **§4 "merged both executors' patches"**: the twelve case lines in the head gate are byte-identical to the patches'
  added lines after the single `bDetailIncludes`→`detailIncludes` rename (check: extract `+…id: "v3-…` lines from each
  `cases.patch`, normalise the field name, compare with the head gate's case lines → 6/6 and 6/6 match, 0 head-only,
  0 missing), so no case expectation was altered in the merge.
- **Isolation**: at `04f9623` each of the 12 survivors fails exactly its own new case (counter per-mutant records);
  the baseline-killed M01b/M11/M14/M17 additionally flip one new case collaterally, which the entry does not claim
  away.
- **Id shapes** (`:58-67`, `:1`): session id 32 lower-case hex — `util.cc:39-43` `GenerateId()`
  `base::StringPrintf("%016" PRIx64 "%016" PRIx64, msb, lsb)` (lane copy sha256 `3ed654c7…be37b`, = S127);
  webSocketUrl `ws://<host>/session/<session.id>` — `session_commands.cc:288-289`, verbatim; one id per create-session
  call registered with no dedupe — `commands.cc:96` `GenerateId()`, `:110` `emplace`; context id 32 upper-case hex —
  `token.cc:34-36` `StringPrintf("%016" PRIX64 "%016" PRIX64, words_[0], words_[1])`, `:46-47` "intentionally strict
  about case, accepting 'A' but rejecting 'a'", target id = `frame_host->devtools_frame_token().ToString()`
  (`render_frame_devtools_agent_host.cc:339`), mapper `BrowsingContextImpl.create(targetInfo.targetId, parentId, …)`
  in the new-context branch (`CdpTargetManager.ts:245-247`). Round-32 transcripts: run1 `31B8FE9C…15903`, run2
  `0E62B928…0FBF4` — 32 upper-case hex, as cited.
- **§5's second bullet is a true limit and not exploited**: the self-test *does* read its own bytes
  (`head/gate.mjs:1086` `readFileSync(fileURLToPath(import.meta.url))`), but only to place them as fixture content
  (`:1127` gate-copy driver, `:1129` gate blob); no case asserts anything about source text, and the twelve new cases
  never touch `gateSource`. So a whitespace-normalised find sniff would pass the counter's three probes without
  being present — the residual is disclosed correctly. Counter probes confirmed at source: neutral = trailing
  `// tabi-r34 neutral edit` (`:218`), decoy = comment quoting every replacement (`:219`), twin = first space doubled
  (`:223`); `predicate` requires all three to pass (`:241`).
- **§1/§5 mutation-set claims**: MutGateV2 (`round-33/w2/MutGateV2.md`) is 20 mutants, 8 self-test kills, M10
  battery-only; the entry counts them the same way and does not claim M10 was killed by the self-test at baseline.

## Impacted axes

- **operability (C2)**: F1 (entry's verifiability pointer), F2-F4 (limit text) — the axis reading itself is unchanged
  and independently confirmed true at `04f9623`.
- **adjacency (C1)**: untouched by this item; nothing here bears on the map/ledger.

## Deliverables

- `CritEntry/counter-at-04f9623.json` — my run of the frozen counter (exit 0, 20/20, battery true) at the judged rev.
- `CritEntry/mutant-detail-kills.json` — per-mutant `--selftest --json` records for M04/M05/M06/M07/M19 with the
  pristine case records (the F3 counterexample).
- `CritEntry/fetch-receipts.md` — F1-F7 fetches (URL, UTC, HTTP, bytes, sha256), 503/404 recorded by status/size/body
  text.
- This report: `.ufo/waves/round-34/w2/CritEntry.md`.

## Hygiene

Findings only; no lane tracked file, lane index, lane jj state, fleet-root file, sibling repo or registry row was
written; no repair attempted. No browser launched; no build/linter/formatter run. No tool installed or upgraded
(`node` v24.21.0 and `git` as present; `pacman` untouched). Scratch
`/fast/scratch/hyaku/tabi-r34/CritEntry` (clone, extracted gate copies, mutant copies, tmp) deleted after the receipts
above were copied.
