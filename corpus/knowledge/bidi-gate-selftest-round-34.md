source: S127 (ChromeDriver 154 session id shape — `chrome/test/chromedriver/util.cc:39-43` at tag 154.0.8037.97, `"%016" PRIx64 "%016" PRIx64`: 32 lower-case hex); S125 (`session_commands.cc:288-289` builds the `webSocketUrl` as `ws://<host>/session/<id>` from the session's id); S130 (Chromium 154 `base/token.cc:34-36` `Token::ToString` prints `"%016" PRIX64 "%016" PRIX64` — 32 upper-case hex — and is the DevTools target id via `render_frame_devtools_agent_host.cc:339`); S131 (the chromium-bidi mapper vendored at 154.0.8037.97, `CdpTargetManager.ts:245-247`, names a top-level browsingContext by the CDP `targetId` verbatim); S132 (ChromeDriver 154 `commands.cc:96` mints one id per create-session call and `:110` registers it with no dedupe)
verified-at: 2026-10-26 — rows opened by round-34 w1 ScoutContextIdSource (S130, S131) and ScoutSessionBinding (S132; S125 and S127 re-opened byte-identical); self-test and mutant readings in §4
recheck: `node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --rev "$(git rev-parse master)" --json` from the lane root with TMPDIR under scratch (exit 0 = every frozen mutant is killed by the gate's own self-test and the neutral, decoy and twin probes pass) and `node scripts/check-bidi-runtime.mjs --selftest`

# The BiDi runtime gate's self-test — which of its own rules are actually tested (round 34)

The gate `scripts/check-bidi-runtime.mjs` (v2, round 33) decides whether a BiDi runtime receipt is admitted. Its
`--selftest` is the lane's runnable check that each rule does what the gate's header says. Round-33 wave 2
(`.ufo/waves/round-33/w2/MutGateV2.md`) built 20 single-point mutants of v2's rule lines: the self-test killed 8. A
rule whose mutant survives the self-test is an unverified checklist item — it may be gone tomorrow and nothing
runnable would say so. Round 34 adds one isolated self-test case per surviving mutant.

## 1. Mutant map

Rule-site line numbers are at the baseline `15dfaccb` (gate sha256 `eded1be0…61c1`), from the w1 ScribeSelftestNote draft.

| id | rule site (baseline) | what the rule guards against | self-test at baseline | killing case (round 34) |
|---|---|---|---|---|
| M01 | `:843` `(idCounts.get(id) \|\| 0) > 1` | two occurrences of one row id must already be a finding; the mutation raises the threshold to 3 | survived | `v3-a-m01-duplicate-id-twice` |
| M01b | `:843` check → `if (false)` | the duplicate-id finding at all | killed (`v2-f2-duplicate-ids`) | — |
| M02 | `:149` `MEASURED` | a decorated Measured cell (`yes (live)`) must be a finding | killed (`v2-f7-decorated-measured`) | — |
| M03 | `:373` `m[1].toLowerCase()` | case folding before admission; `:860` admits only `verdict === "yes"`, so an upper-case cell must still be measured *and* admissible | survived | `v3-a-m03-measured-cell-uppercase` |
| M04 | `:797` transcript path distinctness | one transcript cited as two runs | survived | `v3-b-m04-transcript-path-repeated` (pins the finding detail) |
| M05 | `:798` transcript sha256 distinctness | byte-identical copies cited as two runs | survived | `v3-b-m05-transcript-sha-repeated` (pins the finding detail) |
| M06 | `:145` `SESSION_ID = /^[0-9a-f]{32}$/` | a sessionId containing A-F must be refused; the widened class admits upper-case hex | survived | `v3-a-m06-session-id-uppercase` (pins the finding detail) |
| M07 | `:388` `if (m[1] !== sid)` | a loopback `webSocketUrl` naming a *different* well-shaped session id must be refused | survived | `v3-b-m07-ws-session-segment-unbound` |
| M08 | `:146` `CONTEXT_ID = /^[0-9A-F]{32}$/` | a lower-case / synthetic browsing-context id must be refused (the v1 generator's `X`/`C1` constants) | survived | `v3-a-m08-context-id-lowercase` |
| M09 | `:144` `DRIVER_ALLOW` | widening the import allow-list with a decision symbol (`ROWS`) must lose | survived | `v3-a-m09-driver-imports-rows` |
| M10 | `:144` `DRIVER_ALLOW` | *narrowing* the allow-list must lose: an honest driver importing `serveFixture` must be admitted | survived | `v3-a-m10-driver-imports-servefixture` |
| M11 | `:434` re-export resolve | a driver that re-exports the gate by path must be refused | killed (`v2-f6-driver-reexports-gate`) | — |
| M12 | `:447` non-named kinds | namespace/default/side-effect relations to the gate must be refused | killed (`v2-f6-driver-reexports-gate`) | — |
| M13 | `:778` gate byte-copy | a driver that is a byte copy of the gate must be refused | killed (`v2-f5-driver-is-gate-copy`) | — |
| M14 | `:757` `if (!witness)` | an `s1` witness is required at all | killed (`v2-f8-junk-source-row`) | — |
| M15 | `:753` host equality | registry source host and lesson Gate-row host must be equal | killed (37 of 44 cases fail, first `golden-two-runs`) | — |
| M16 | `:750` Gate-row `HEX64.test(x.text)` | an `s1` Gate row must carry a 64-hex sha256, not just an https URL | survived | `v3-b-m16-gate-row-without-sha` |
| M17 | `:860` `row.verdict === "yes"` | an unmeasured (`no`) row must never be admitted | killed (`v2-m19-unmeasured-row-counted`) | — |
| M18 | `:867` `out.admitted >= 1` | an entry whose rows are all unmeasured and carry no finding must not read `clean` | survived | `v3-b-m18-clean-with-zero-admitted` |
| M19 | `:811` sessionId pairwise distinctness | two runs with distinct paths and distinct bytes must still not share one session id | survived | `v3-b-m19-sessionid-repeated` |

## 2. How a kill case is built (rules this lane keeps)

- The case states the PRISTINE gate's outcome (exit, admitted, population, first finding id) and passes on the
  unmutated gate; it fails when, and because, the one rule it isolates is disabled.
- A case observes the gate's runnable refusal, never the gate's own source text. A self-test that sniffs its own bytes
  kills every mutant and proves nothing; the round-34 counter refuses that shape with three probes: a neutral trailing
  comment, a decoy comment quoting every mutant replacement, and a whitespace twin at each mutant site — each must
  still pass (`.ufo/waves/round-34/baseline/c2-J2-selfhash.json`, `c2-J3-find-sniff.json`).
- Where two receipt rules guard the same fixture (a repeated transcript path also repeats its bytes; a repeated byte
  string also repeats the session id inside it), disabling one rule leaves the other to refuse with the same finding
  id. Such a case pins WHICH check refused through the finding detail the gate prints (`detailIncludes`), e.g.
  `transcript path repeated across runs` vs `transcript sha256 repeated across runs`. The detail is gate output, so
  the case still tests behaviour. Without it M04, M05 and M06 look equivalent (w1 ScribeSelftestNote's ceiling of
  17), with it each is killed (w1 ExecKillsB, ExecKillsA).
- Id-shape fixtures carry the shapes the sources give (§3), not shapes chosen to make a test pass.

## 3. Id shapes the receipt rules rest on

- **Session id**: 32 lower-case hex. ChromeDriver 154 `GenerateId()` prints two 64-bit halves with `PRIx64` (S127);
  one id is minted per create-session call and registered without a uniqueness check (S132, `commands.cc:96`, `:110`),
  so the gate's pairwise-distinct rule (M19) is the lane's own receipt discipline, not a driver guarantee.
- **webSocketUrl**: `ws://<host>/session/<id>` with the session's own id (S125, `session_commands.cc:288-289`). The
  M07 case uses a well-shaped loopback URL whose segment is a DIFFERENT 32-hex id, so only the binding rule can refuse.
- **browsingContext id**: 32 upper-case hex. The mapper names a top-level context by the CDP `targetId` (S131); a page
  target's DevTools id is a `base::Token` printed with `PRIX64` (S130; `token.cc:46-47` also says `FromString`
  rejects lower case). The round-32 honest transcripts agree (`corpus/evidence/round-32/bidi/run1/transcript.jsonl`).
  The M08 case therefore refuses a lower-case 32-hex context id. Scope: page targets on Chromium 154.0.8037.97; tab
  targets were not read.

## 4. Measurement

The L1 merged both executors' patches (round-34 w1 ExecKillsA cases M01 M03 M06 M08 M09 M10; ExecKillsB cases M04
M05 M07 M16 M18 M19; the two detail-assertion options unified as `detailIncludes`). The self-test grows from 44 to 56
cases. Frozen counter readings are in `.ufo/waves/round-34/measure/c2-at-*.json` (round-34 SCORECARD disposition).

## 5. Limits

- Twenty mutants are a fixed sample of v2's rule lines; rules outside them (e.g. the live leg, transcript replay
  semantics) are not shown tested by this round.
- The counter's probes do not refuse a self-test that reads its own source and checks a whitespace-normalised find
  text (claims.json feasibility); the guard for that is a code read of the self-test (round-34 wave 2).
- Battery survivors CritForgeV2B (a fabricated second run with fresh real-shaped ids; a driver importing only
  allow-listed symbols that never ran) and CritForgeV2C (a junk Gate row with a made-up digest) stay open: v2's
  provenance rules are syntactic, and killing mutants does not change that.
