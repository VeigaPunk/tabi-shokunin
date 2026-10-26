<!-- corpus entry — tabi-shokunin round 34 (2026-10-26), claim C2 (operability, sourced). DRAFT by seat
ScribeSelftestNote; the L1 places it at corpus/knowledge/bidi-gate-selftest-round-34.md. Scope: the self-test of
scripts/check-bidi-runtime.mjs (v2) as the runnable check of the gate's own rules, at 15dfaccb34601c2d221c78501e2befd8998d600c
(gate sha256 eded1be04a47fbd2b87fbff42ef5187e0d473e6fe2bca55ac1c622ab8bde61c1). It records a mutant map, the design rules a
kill case must obey, the id-shape facts the receipt rules rest on, and the ceiling this seat's probes found. It does not
claim the round's target is met: the round measurement is the L1's (`<L1: …>` markers below). -->

# The BiDi runtime gate's self-test — which of its own rules are actually tested

source: S127 https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/util.cc — ChromeDriver 154's `GenerateId()` at `util.cc:39-43` prints two 64-bit halves with `"%016" PRIx64 "%016" PRIx64`, i.e. a session id of exactly 32 lowercase hex characters; the id is surfaced at `session_commands.cc:288-289` (the `webSocketUrl` capability) and `:372` (the new-session body) — re-fetched this round by this seat (`?format=TEXT`, 2026-10-26T19:51:13Z, HTTP 200, 26200 B, raw sha256 `e3e0d00fb3d7a2b68212b40868e901dda14e74574f0c60077ac80eeb5b2e00d4`, decoded 19648 B sha256 `3ed654c7574c1dd977b79aa22960432e07ff502593fc66d170aa6fae213be37b`, equal to S127's recorded pair); S125 https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc — `session_commands.cc:287-289` sets `caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id)` under `if (session->web_socket_url)`, so the URL's path segment *is* the classic session id (re-fetched by this seat: HTTP 200, 90944 B, raw sha256 `c5d66f5a2ad26997ff76da4b5d7e60fe30fbde4beb1d5d824cc7130c9074876e`, decoded 68207 B sha256 `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5`, equal to S125's recorded decoded digest); **S130 (PENDING)** — the primary source for the browsing-context id shape the gate enforces (32 uppercase hex) that seat ScoutContextIdSource was dispatched to open this wave (chromium-bidi's context = CDP target id; Chromium `base/token.cc`'s `%016PRIX64` rendering) — the id is a placeholder here and nothing below rests on it; **S131 (PENDING)** — the session-binding source seat ScoutSessionBinding was dispatched to open this wave (the BiDi spec's session/endpoint text and whether session ids are minted per session) — likewise a placeholder. Until S130 and S131 land, the context-shape fact below rests on the honest transcripts alone, and the per-session-uniqueness question is not claimed.
verified-at: 2026-10-26
recheck: 90d

The gate `scripts/check-bidi-runtime.mjs` decides whether a capability entry may mark a WebDriver BiDi
surface as measured. `--selftest` is the only runnable check of the gate's *own rules*: the production
path is exercised against one honest receipt and, with `--live`, one real session. A rule whose refusal
is never constructed still exits 0 on every honest input, so a broken rule is invisible until a forgery
walks through it. This entry records the instrument that measures exactly that — the 20 frozen
single-point mutants of the gate's rule lines — what each mutant guards, which ones the self-test
catches at the round-34 baseline, what a kill case must look like, and the ceiling the seat's probes
found on the way.

## 1. What the self-test is for

A gate is a set of refusals. The self-test is the gate's evidence that those refusals fire. Operability
here means: for each rule the gate states, there exists a committed construction that flips the rule off
and a runnable check that then fails. Without that, the rule is an unverified checklist item — the gate
would read `clean` on the honest entry whether or not the rule exists.

Round 33 built the instrument. w2 seat MutGateV2
(`.ufo/waves/round-33/w2/MutGateV2.md`) enumerated the gate's rule sites, wrote one single-point
string-replacement mutant per site (20 valid mutants, `.ufo/waves/round-33/w2/MutGateV2/mutants.jsonl`,
20 lines, sha256 `467704c7cb5412b153e82ab34c58feb452806bd88555ba3df4c0c037552a56ff`), and scored each
against two detectors: the gate's `--selftest` and the round-33 frozen forgery battery. The find/replace
pairs are embedded **verbatim** in the round-34 frozen counter
`.ufo/waves/round-34/counters/c2-gate-mutants.mjs` (sha256
`3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82`, the frozen digest), so the mutant
set is not a seat's private list: it is committed, byte-pinned, and was frozen before the round-34 data.

State at the round-34 baseline: gate `eded1be0…61c1`, 44 self-test cases, **8 of 20 mutants killed,
12 survivors** (`.ufo/waves/round-34/baseline/c2-J1-do-nothing.json`: `killedCount 8`, survivors M01
M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19, `unappliable []`, `twinsFailing []`, pristine/neutral/
decoy all exit 0, battery predicate true). The baseline gate is byte-identical to round-33's measured
gate at `6f4053db` (`git show 6f4053db:scripts/check-bidi-runtime.mjs | sha256sum` →
`eded1be0…61c1`), so the 20 finds apply unchanged and round-33's own reading of the same 12 survivors
stands (`MutGateV2.md`, "Survivors = coverage limits").

**Label space warning.** Three different numbering schemes use the same `M<nn>` labels and must not be
conflated: (i) round-32's `MutC1.md` mutants of gate v1 (its M04 is between-runs `chromedriverVersion`
equality); (ii) round-33's MutGateV2 mutants of gate v2, a *fresh* enumeration of v2's rule sites (its
M04 is transcript-path distinctness); (iii) the self-test case ids `v2-m04-…`, `v2-m06-…`, `v2-m09-…`,
`v2-m10-…`, `v2-m11-…`, `v2-m14-…`, `v2-m17-…`, `v2-m18-…`, `v2-m19-…`, which carry round-32's labels
again. Throughout this entry `M<nn>` means MutGateV2.

## 2. The 20 frozen mutants — rule, what it guards, whether the self-test kills it

Rule sites are given as `scripts/check-bidi-runtime.mjs:<line>` at the baseline `15dfaccb`. "Kill" is
the frozen definition: the mutated gate's `--selftest` exits 3 and prints at least one `CASE … FAIL`
line. "Self-test at baseline" is that reading; it equals round-33's reading of the same mutants.

| id | rule site (baseline) | what the rule guards against | self-test at baseline | killing case today |
|---|---|---|---|---|
| M01 | `:843` `(idCounts.get(id) \|\| 0) > 1` | two occurrences of one row id must already be a finding; the mutation raises the threshold to 3 | survived — the only duplicate-id case lists `R2` 16 times | none; a case with the id twice kills it (seat probe `k-M01-two-duplicate-ids`, expected `x3-duplicate-id`) |
| M01b | `:843` check → `if (false)` | the duplicate-id finding at all | killed (`v2-f2-duplicate-ids`) | — |
| M02 | `:149` `MEASURED` | a decorated Measured cell (`yes (live)`) must be a finding | killed (`v2-f7-decorated-measured`) | — |
| M03 | `:373` `m[1].toLowerCase()` | case folding before admission; `:860` admits only `verdict === "yes"`, so an upper-case cell must still be measured *and* admissible | survived — no case uses an upper-case cell | a case with `Measured` = `YES` expected to admit 16 (seat probe `k-M03-uppercase-yes`) |
| M04 | `:797` transcript path distinctness | one transcript cited as two runs | survived — see §3(e): implied by M05's rule | none constructible (equivalent mutant) |
| M05 | `:798` transcript sha256 distinctness | byte-identical copies cited as two runs | survived — see §3(e): implied by M19's rule | none constructible (equivalent mutant) |
| M06 | `:145` `SESSION_ID = /^[0-9a-f]{32}$/` | a sessionId containing A-F must be refused; the widened class admits upper-case hex | survived — see §3(e): masked by `:148` + `:388` | none constructible without also widening `WS_SESSION` (equivalent mutant) |
| M07 | `:388` `if (m[1] !== sid)` | a loopback `webSocketUrl` naming a *different* well-shaped session id must be refused | survived — every refusal case fails earlier at `WS_LOOPBACK`/`SESSION_ID` | a case whose ws url carries another 32-hex id (seat probe `k-M07-ws-url-other-sid`; needs a builder option, §3(d)) |
| M08 | `:146` `CONTEXT_ID = /^[0-9A-F]{32}$/` | a lower-case / synthetic browsing-context id must be refused (the v1 generator's `X`/`C1` constants) | survived — no case uses a lower-case context | a case with lower-case contexts in both runs (seat probe `k-M08-lowercase-context`) |
| M09 | `:144` `DRIVER_ALLOW` | widening the import allow-list with a decision symbol (`ROWS`) must lose | survived — the self-test driver is import-free | a case whose driver imports `ROWS` (seat probe `k-M09-driver-imports-rows`) |
| M10 | `:144` `DRIVER_ALLOW` | *narrowing* the allow-list must lose: an honest driver importing `serveFixture` must be admitted | survived the self-test; killed by the round-33 battery only, for the same reason (no self-test driver has imports) | a case whose driver imports `serveFixture`, expected to admit 16 (seat probe `k-M10-driver-imports-servefixture`) |
| M11 | `:434` re-export resolve | a driver that re-exports the gate by path must be refused | killed (`v2-f6-driver-reexports-gate`) | — |
| M12 | `:447` non-named kinds | namespace/default/side-effect relations to the gate must be refused | killed (`v2-f6-driver-reexports-gate`) | — |
| M13 | `:778` gate byte-copy | a driver that is a byte copy of the gate must be refused | killed (`v2-f5-driver-is-gate-copy`) | — |
| M14 | `:757` `if (!witness)` | an `s1` witness is required at all | killed (`v2-f8-junk-source-row`) | — |
| M15 | `:753` host equality | registry source host and lesson Gate-row host must be equal | killed (37 of 44 cases fail, first `golden-two-runs`) | — |
| M16 | `:750` Gate-row `HEX64.test(x.text)` | an `s1` Gate row must carry a 64-hex sha256, not just an https URL | survived — the fixture lesson always embeds a sha | a case whose lesson Gate row has the URL and no sha, expected `s1-source-row` (seat probe `k-M16-gate-row-no-sha`; needs a builder option, §3(d)) |
| M17 | `:860` `row.verdict === "yes"` | an unmeasured (`no`) row must never be admitted | killed (`v2-m19-unmeasured-row-counted`) | — |
| M18 | `:867` `out.admitted >= 1` | an entry whose rows are all unmeasured and carry no finding must not read `clean` | survived — every current case carries a finding | a case with one `no` row and nothing else, expected exit 1 / admitted 0 (seat probe `k-M18-all-rows-no`) |
| M19 | `:811` sessionId pairwise distinctness | two runs with distinct paths and distinct bytes must still not share one session id | survived — no case builds that pair | a case with two distinct runs sharing one 32-hex sessionId (seat probe `k-M19-sid-repeated`) |

Nine of the twelve survivors are killable by adding cases; three (§3(e)) are not. Do not read the
nine as "the gate is tested": a case that kills M07 asserts that a mismatched ws url is refused at
*this* rule, which is what the rule says, not that the receipt behind it happened.

## 3. Kill-case design rules

**(a) Expected values are the pristine readings, never the mutant's.** A `CASES` row asserts
`expectedExit`, `expectedAdmitted`, `expectedReason` (and optionally `population`) — the values the
*unmutated* gate produces. A case written from the mutant's behaviour passes only the mutant, which is
a tautology, not a test. The frozen counter enforces the other half of this: the unmutated gate must
exit 0 on the whole suite, and the neutral, decoy and whitespace-twin variants must too
(`.ufo/waves/round-34/counters/c2-gate-mutants.mjs`, header method block and `selftest()`).

**(b) One rule per fixture, and mind the order.** The gate checks in a fixed order: `x4-measured-cell`
→ `x1-row-unknown` → `x3-duplicate-id` → `x2-no-counterpart` → `t1-receipt` → `t3-binding` →
`t2-run`, and within `t1` the receipt checks run in the order schema → fixtureSha → browserVersion →
driver path → driver blob → driver sha → gate byte-copy → driver imports → runs ≥ 2 → transcript
presence → transcript sha → path distinctness → sha distinctness → sessionId shape → context shape →
sessionId distinctness (`:797`-`:811`). A fixture that also trips an earlier check proves nothing about
the intended rule: that is why the current `v2-f3-same-path-twice` case violates path, bytes and
session id at once and therefore cannot distinguish them (`MutGateV2.md`, survivor note 3).

**(c) Never sniff the source.** The self-test must fail by *evaluating* a fixture, not by finding
mutant text in its own bytes. The counter refuses three sniffing constructions and requires each to
exit 0: *neutral* (the gate plus a trailing comment), *decoy* (the gate plus a comment quoting every
mutant's replacement text), and a *whitespace twin* per mutant site (the mutant's find string with its
first space doubled — behaviour-preserving, and it defeats a find-text check). New cases are therefore
limited to `CASES` rows and fixture-builder options; no rule line may be reworded, because a reworded
find text would make its mutant `unappliable`, which the frozen predicate counts as failed, not killed.

**(d) Builder reach.** Of the nine killable survivors, seven are expressible with the baseline
builder's existing options — `ids` (M01), `cell` (M03, M18), `run1`/`run2` with `contextId` (M08),
`driverText` (M09, M10), and `run1`/`run2` with `sessionId` plus a distinct `base` (M19). Two need a
fixture-builder option that the baseline does not have: M07 needs a `webSocketUrl` whose session
segment is a different well-shaped id (baseline `goldenLines` always derives the url from the same
`sid` it puts in the body), and M16 needs a lesson `## Gate` row with an https URL and no 64-hex
sha256 (baseline `lessonsDoc` always embeds one). Both are option additions inside the self-test
fixture, not rule-line edits, and both were exercised this round against the baseline gate in scratch
(§3(e) receipt).

**(e) Three survivors are equivalent mutants, not coverage gaps — and this caps the round's target.**
The test's only observable is `exit`/`admitted`/`reason`, so a mutant that changes no observable on any
constructible input cannot be killed by any case:

- **M04 ⊂ M05.** Two runs citing the same path read the same blob, so the sha256 is also equal: the
  path check can only fire where the sha check would fire too. Removing M04 changes the finding's
  message (reason stays `t1-receipt`), nothing else.
- **M05 ⊂ M19.** Equal transcript sha256 means byte-identical transcripts, so both runs carry the same
  `sessionId`, which `:811` refuses.
- **M06 is masked by `WS_SESSION` + the binding.** A session id containing A-F passes the widened
  `SESSION_ID` but cannot match `WS_SESSION = /^ws:\/\/[^/]+\/session\/([0-9a-f]{32})$/` (`:148`) when
  the url carries it, and mismatches `sid` at `:388` when it does not. Widening `SESSION_ID` alone
  never flips an outcome.

Measured in scratch against the baseline gate (this seat; variants are the baseline gate plus added
`CASES` rows and, where named, one builder option; every run under
`.ufo/waves/round-34/w1/ScribeSelftestNote/`): the ten probe cases pass on the pristine gate
(`verdict=clean cases=54 passed=54`), and each of M01, M03, M07, M08, M09, M10, M16, M18, M19 flips
exactly its own probe to FAIL. M04 alone and M04+M05 leave the whole suite — including a same-path
probe — clean; only M04+M05+M19 flips it (`cases=54 passed=50`, failing `v2-f3-same-path-twice`,
`v2-f4-byte-copy`, the M19 probe and the same-path probe). M06 alone leaves an upper-case-sessionId
probe passing; only M06 plus a widened `WS_SESSION` flips it. The empirical ceiling is therefore
**17 of 20 killed**, with M04, M05 and M06 surviving as equivalent mutants. The frozen target
(`survivors 0 of 20`) is not reachable by adding cases; that is a property of the rule set, not of the
case authors. `<L1: the round's measured killed count, survivors and predicate at REV>`.

## 4. Id-shape facts the receipt rules rest on

- **Classic session id: 32 lowercase hex.** `GenerateId()` (`util.cc:39-43`) draws two `uint64_t` and
  prints them with `"%016" PRIx64 "%016" PRIx64` — lower-case hex, exactly 32 characters (S127;
  re-fetched by this seat, digests above match the row's). `:%016` pads each half, so the width is
  fixed, not incidental.
- **The `webSocketUrl` path segment is that id.** `caps.Set("webSocketUrl", "ws://" + session->host +
  "/session/" + session->id)` at `session_commands.cc:288-289`; the same `session->id` is echoed as
  `sessionId` in the new-session body at `:372` (S125). The gate's `WS_SESSION` capture and the `:388`
  equality are the textual consequence.
- **Honest transcripts carry the shapes.** `corpus/evidence/round-32/bidi/run1/transcript.jsonl`:
  `sessionId 10abbb479bdcc37a405098c5ea778bf0`, `webSocketUrl
  ws://127.0.0.1:37279/session/10abbb479bdcc37a405098c5ea778bf0`, one context
  `31B8FE9C25C36020CBB175F250715903`; run 2: `6b30c7033f4821af5f94d9e75e85b234` and
  `0E62B928C3D82E935056B338D5E0FBF4`.
- **Browsing-context id: 32 uppercase hex** — as the gate's `:146` states and as the honest transcripts
  show. Its primary source is **PENDING S130**; until that row lands, this is an observation on the
  round-32 receipt, not a sourced shape. Do not promote the gate's regex to a sourced claim on the
  strength of this entry.
- **Session-id distinctness across runs** is what `:811` enforces. Whether ChromeDriver 154 mints a
  *distinct* id per session (and therefore whether two real runs must differ) is **PENDING S131**; the
  gate's rule is a cross-run identity check on a receipt, and this entry does not claim more than that
  for it.

## 5. Limits

(a) **The ceiling is 17 of 20.** M04, M05 and M06 are equivalent mutants under the gate's own rules
(§3(e)), so the round's target of zero survivors cannot be reached by adding cases while the rule lines
stay byte-identical. The honest record is the survivor set with this proof, and the round's measurement
should carry it as a limit of the target, not as a mis-built suite. The claims' `feasibilityDisclosed`
named M03 and M10 as the risky two; both are in fact killable (upper-case `Measured` cell; a driver
importing `serveFixture`), and the three blockers were not disclosed at freeze.

(b) **The counter has a disclosed residual.** A self-test that reads its own source and checks a
*whitespace-normalised* mutant find text passes the neutral, decoy and twin probes; the guard for that
construction is a wave-2 code read, not this counter (`c2-gate-mutants.mjs`, "Known residual"). No case
in this round may read gate bytes.

(c) **Twenty single-point mutants is not a proof of forgery-resistance.** The set covers the rule lines
MutGateV2 enumerated; multi-point mutants, the bodies of `PREDICATES` (`:214` onward), `parseTable`,
`recordFromTranscript` and the live leg are untested by it. Killing all reachable mutants says the
self-test exercises those 20 sites; it says nothing about a construction the rules were never written
to refuse.

(d) **CritForgeV2B and CritForgeV2C stay open** (round-33 entry §8): a second run fabricated from a
real transcript with fresh real-shaped ids, and a driver importing only allowed symbols that never ran,
are admitted offline and live; a junk `mined` row on the same host as a junk lesson Gate row with a
made-up 64-hex digest passes `s1-source-row`. This entry does not narrow either.

(e) **Seat evidence is not lane measurement.** The probe runs in §3(e) were made on scratch copies of
the baseline gate (added `CASES` rows, added builder options); they are the seat's receipts, not the
lane's counter output. The lane reading comes from the frozen counter at REV:
`node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --rev <REV> --json` →
`<L1: predicate, killedCount, survivors, unappliable, twinsFailing, pristine/neutral/decoy exits,
battery predicate>`.

(f) **What this entry needs from the registry.** The gate's `s1` check (`:746`-`:757`) accepts only a
cited S-id that is `mined`, names this entry in `used-by`, is **absent at `--baseline`**, and has a
`corpus/lessons/round-*.md` `## Gate` row carrying an https URL with a 64-hex sha256 on the same host.
S127 exists at the baseline, so S127 alone can never satisfy `s1` for this entry: the entry's `source:`
line needs the new rows (S130/S131 as allocated), each with its Gate row, or the gate will read
`s1-source-row`.
