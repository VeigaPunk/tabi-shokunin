VERDICT: PASS

# C2 → README Frontier + SCORECARD planned rows (connector, read-only)

**Axes:** coverage (C2's claim axis; scalar must not move), calibration (what an invocation claim
may assert and what stays open), adjacency (must not absorb kaidoku's CDP-provider row; C3 owns that).

## Evidence (before state)
- `corpus/README.md:295-305` — r16 frontier paragraph. Movable phrase is exactly `:303`
  **"tool invocation as committed evidence"**, one item of a five-item open list (`:301-305`).
  Same paragraph: `:298` "Chromium 152 stays unprobed at runtime"; `:302` "real-site WebMCP (needs
  operator approval)"; `:302-303` "agent-side consumption of page tools"; `:303-304` "any
  unflagged/default-profile claim"; `:304-305` extension↔daemon / rate-rights / journeys.
- `corpus/README.md:307-314` — r16 declared `:35,:181,:194,:216,:282-285` historical; C2 must not re-open them.
- `SCORECARD.md:743` — r16 coverage row: "improved C2: native-WebMCP held entry 0→1 (one build,
  loopback, flags); 10 withheld (r12/r13 precedent, real-site ground open)".
- `SCORECARD.md:466-469` — r12 precedent: a wave "initially proposed … coverage9→10"; critic
  "correctly rejected treating an added note as a full expertise fraction"; "scalar delta0".
  `:439`/`:466` are the only `9→10` strings in SCORECARD, both history.
- `SCORECARD.md:770-772` — r16 `planned` rows = round-17 intent: freshness S001–S019 recheck;
  operability "bring USER 6/10 up or rule it out"; adjacency integrator ruling. **C2 is
  preregistered in none of them.**
- `SCORECARD.md:774` — "the round-16 capability restarts the window (round 17 = position 1)";
  `:381-387` top-level `## Capabilities` is the rollout placeholder, real rows live per round
  (`:762-766`). `SKILL.md:1878` — r16 row "...invoke a page tool? | `WebMCP.invokeTool` probe":
  that evidence cell is what C2 changes; SKILL is L1 append-only.
- Before-state: `corpus/knowledge/webmcp-chromium-loopback-round-16.md:127` "No tool is invoked in
  the receipt"; `corpus/evidence/round-16/webmcp/receipt.json:759` `toolInvocation:"none — …"`;
  hardcoded at `scripts/webmcp-loopback-round16.mjs:1600`. Build surface:
  `corpus/evidence/round-16/webmcp/protocol-domain.json:219` `invokeTool(frameId,toolName,input)`
  → `{invocationId}` ("Response is sent before tool events"), `:247` `cancelInvocation`, `:288`
  `toolInvoked`, `:314` `toolResponded`, `:136-142` `InvocationStatus = Completed|Canceled|Error`.

**Move:** one ledger, one enumerated residue: `(a) real-site :302` → `(b) agent-side :302-303` →
`(c) Chromium 152 :298` → `(d) unflagged :303-304`; both files name these four and no others, so
"10 withheld" is a pointer, not an adjective, and the two files diff clean.

## Draft A — append to `corpus/README.md` after `:314`
```markdown
## Round 17 — WebMCP invocation held on Chromium 154 loopback (2026-10-20)

New knowledge map row (34 notes; the 33 earlier rows are unchanged). This append moves the
phrase "tool invocation as committed evidence" (`:303`) only; `:295-305` keeps its bytes.

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webmcp-invocation-round-17.md` | Runtime-held for Chromium 154.0.8037.97 with WebMCP flags on loopback fixtures only: CDP `WebMCP.invokeTool` → `invocationId`; `toolInvoked` (input as a JSON string) and `toolResponded` (`Completed`/`Error`, `output`/`errorText`), plus the page-side `execute` observation; success, throw, reject, unknown tool, schema mismatch, declarative tool, post-unregister, concurrent ids, iframe `frameId`, navigation-pending, flags-off control | S0NN–S0NN (receipt `evidence/round-17/webmcp-invoke/receipt.json`) |

Frontier status (append-only): of the round-16 open list (`:301-305`), "tool invocation as
committed evidence" (`:303`) is now **held for Chromium 154.0.8037.97 only**, flag-enabled,
loopback fixtures, `<passed>/<cases>` receipt cases with a recorded producer sha256. The
round-16 sentence "No tool is invoked in the receipt"
(`knowledge/webmcp-chromium-loopback-round-16.md:127`) remains true of **that receipt's bytes**;
round 17 supersedes it with a new receipt, never an edit.

Still open, in this order: real-site WebMCP (`:302`, needs operator approval); agent-side
consumption of page tools (`:302-303`); Chromium 152 at runtime (`:298`; host builds are 154.0.8037.97,
CfT 154.0.8037.92 and CfT 156.0.8078.4 — no 152); any unflagged/default-profile claim
(`:303-304`). The extension↔daemon, rate/rights and journey rows (`:304-305`) are another
frontier family, untouched here.
```

## Draft B — append to `SCORECARD.md` after `:774`
```markdown
## Round 17 — hyaku, 2026-10-20

Baseline `<40-hex>`; measured revision `<40-hex>`. C1 works operability 8 (lowest non-retired
tie); C2 is a capability acquisition on coverage; C3 works adjacency 8.

| Axis | Scalar before → after | Round17 verdict / evidence |
|---|---|---|
| depth | 8→8 | unchanged |
| coverage | 9→9 | improved C2: held WebMCP-invocation entry 0→1 (one build, loopback, flags; success and negative cases in one receipt); 10 withheld — r12/r13 precedent (`:466-469`, `:743`); open residue unchanged in kind: real-site, agent-side, Chromium 152, unflagged (`corpus/README.md:302`, `:302-303`, `:298`, `:303-304`) |
| operability | 8→8 | improved C1: jj-anchor-safe gate entry points 0→N; 9 withheld (USER 6/10 red, no outside execution) |
| freshness | 8→8 | unchanged; the round-16 planned S001–S019 recheck is not worked |
| calibration | 9→9 | unchanged claimed axis; C2 wording scoped to the invocation receipt |
| adjacency | 8→8 | improved C3: verified adjacency dispositions 0→N incl. the integrator ruling (`corpus/lessons/round-16-verifier-spotcheck.md:138-142`) |

| Claim | Before → after | Counting command | Measured revision / counter digest / evidence |
|---|---|---|---|
| C2 coverage | held WebMCP-invocation entries 0→1 | `node .ufo/waves/round-17/measure-c2.mjs REV` | `<base>` → `<rev>`; counter sha256 `<…>`; `corpus/evidence/round-17/measure-c2.json`; receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json` (`<passed>/<cases>`) |

Binding: `node scripts/check-measurement-binding.mjs --check
corpus/evidence/round-17/measurement-binding.json --at <delivered HEAD> --reproduce` → exit 0
`claims=3 bound=3`.

### Capabilities — round 17

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webmcp-cdp-invocation | Invoke a page-registered tool over CDP `WebMCP.invokeTool` on flag-enabled Chromium 154 loopback fixtures and record request/response/events (`invocationId`, `toolInvoked`, `toolResponded` status/output) plus the page-side `execute` observation, with error and control cases (throw, reject, unknown tool, schema mismatch, post-unregister, concurrent ids, iframe frameId, navigation pending, flags-off) | `node scripts/webmcp-invoke-round17.mjs --out /tmp/x.json`; `corpus/evidence/round-17/webmcp-invoke/receipt.json` (`<passed>/<cases>`) | round17 |

### Planned / saturation / retired — round17

- round-16 planned dispositions: freshness — S001–S019 recheck **not worked** (carried);
  operability — C1 moves the gate anchor, not USER 6/10, so "bring up or rule out" stays open;
  adjacency — **closed for this lane** by C3's ruling row (kaidoku's `PROVINCE.md:53` citation is
  the sibling's half).
- planned: coverage — second-build invocation; two builds already local (CfT 154.0.8037.92 at
  `~/.agent-browser/browsers/`, CfT 156.0.8078.4 at `~/.cache/ms-playwright/chromium-1248`); 152 is
  not installed and not plannable under the pacman pause; real-site stays operator-gated; agent-side cross-lane.
- planned: freshness — the `:770-771` S001–S019 recheck, unchanged.
- saturation 8 / window 3; round 17 = position 1 after the r16 capability. If
  `webmcp-cdp-invocation` enters as its own row the window restarts (round 18 = position 1, per
  `:774`); if folded into `webmcp-cdp-observation`, say so and keep round 17 = 1.
- retired: none.
```

## Rows C2 moves / leaves
| Row | Before | After | Constraint |
|---|---|---|---|
| `README:303` invocation | open | held: 154.0.8037.97, flags, loopback, receipt | never "WebMCP held" or bare "invocation works" |
| `README:298,:302,:302-303,:303-304` (residue a–d) | open, open, open, open | unchanged | 154-thread and CfT 156 ≠ 152; no approval; webbridge 1.11.3 has no WebMCP surface (r16 note `:128-129`); all runs flag-enabled |
| `SKILL:1878` evidence cell | "`WebMCP.invokeTool` probe" | receipt (appended r17 table) | append-only; keep "loopback only" |
| `SCORECARD:743` | r16 row | untouched | append-only; new row refines, never contradicts |
| `SCORECARD:774` window | round17 = pos 1 | round18 = pos 1 iff a distinct capability row enters | state the choice, don't imply it |

## Hazards (state, don't smooth)
1. **PLAN's C2 header invites the over-claim.** "C2 — coverage 9 (lane axis)" reads as target 9;
   the defensible cell is `9→9` (AXES.md:12 "fraction of the domain's real surfaces"; r12
   `:466-469` rejected exactly this move). The falsifiable count is entry `0→1`, not the scalar.
2. **C2 is in no r16 planned row** (`:770-772`); "as planned in round 16" would be false.
3. **The r16 receipt asserts the negation** (`receipt.json:759`, harness `:1600`); the r17 receipt
   must carry its own invocation field and README must scope `:127` to that receipt's bytes.
4. **CDP-only, never spec:** `invokeTool` is a Chromium CDP domain (S035; r16 note `:89`);
   declarative invocation is outside the spec (S030/S031). Citing S020 violates QUALITY 23/14.
5. **Shape asymmetry:** `invokeTool` takes `input: object` (`protocol-domain.json:219`) but
   `toolInvoked` carries it as a JSON **string** (r16 note `:72-73`); fixtures must assert the
   string form and the note must say so.
6. **`cancelInvocation` declared, unrequired** (`:247`; `InvocationStatus` includes `Canceled`,
   `:136-142`): the row must not claim cancellation; a cancel case belongs in the counter's
   required list, not the note.
7. **Control ≠ invocation:** `invoke-flags-off-control` asserts absence. "11/11 cases" is honest;
   "11 invocations" is not — write `<passed>/<cases>` from `summary`.
8. **Placement:** the capability row goes under a per-round `### Capabilities — round 17`
   (pattern `:762`), never `:383`, whose block says "none enter through this rollout".
9. **Counter ordering:** `measure-c2.mjs REV` reads blobs at REV and probes "cited row not mined";
   REV must be after the S041+ SOURCES append, note, receipt and harness, and need not include the
   README/SCORECARD appends. If `<passed>` < required cases the capability row must not enter
   (AXES.md:62-64): README stays open, the failure receipt is kept, and the row is not named "CDP
   page observation" (that is r16's `webmcp-cdp-observation`).

## Verification (after the append; none run here)
1. `awk 'NR>774' SCORECARD.md | grep -c '9→10\|coverage 10'` → 0; `grep -c '10 withheld' SCORECARD.md` → 2; `grep -c '^| webmcp-cdp-' SCORECARD.md` → 2.
2. `grep -n 'tool invocation as committed evidence' corpus/README.md` → 2 (`:303` + new, "now held"); `ls corpus/knowledge/*.md | wc -l` → 34 and README count matches.
3. `node scripts/webmcp-invoke-round17.mjs --out /tmp/inv.json; echo $?` → 0, `summary.failed=0`, `producerSha256` = `shasum -a 256 scripts/webmcp-invoke-round17.mjs`.
4. `node .ufo/waves/round-17/measure-c2.mjs <REV>` → `c2_invocation_held:1`, every negative probe 0; `node scripts/check-measurement-binding.mjs --check corpus/evidence/round-17/measurement-binding.json --at <delivered HEAD> --reproduce` → exit 0 `claims=3 bound=3`.

Files written: `.ufo/waves/round-17/w1/ConnFrontierRows.md` (this report). No other path written; no git/jj command run; no tool installed.
