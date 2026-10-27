# executor-test-sufficiency — TABI-R3-4 (no-oral-context executor test)

Round 3, 2026-10-14. Seat TABI-R3-4. Test: can a fresh executor — one whose
only procedural source is `SKILL.md` — capture one fixture page's full evidence,
with no oral history, no other corpus note, and no prior-round memory?

**Anchor legend.** `SKILL.md@<hash>:NN` = line NN of `tabi-shokunin/SKILL.md` at
that sha256. Two versions were on disk inside this test window:

- `v1 = SKILL.md@4085be78` — 17 696 B, mtime 2026-10-14 11:26:11 -0300 (the
  round-2 state: no §Runbook, no sufficiency contract).
- `v2 = SKILL.md@fdbad5db` — 31 179 B, mtime 11:44:34 -0300 (the round-3
  upgrade: sufficiency contract `:12-17`, §Runbook `:50-187`, call reference
  `:189-202`, finalized approval table `:379-417`).

Evidence dirs (scratch, volatile per fleet namespace rule): `/tmp/tabi-r3-4-work/`
— `evidence-runbook/` (canonical, v2 runbook execution), `evidence/` (control,
v1 document), `scripts/`, `site/`.

## 0. Condition, declared reads, version timeline

**Condition.** The only document content-read during the test was
`tabi-shokunin/SKILL.md` (v1, then v2). Nothing else in `corpus/`, no
`PROVINCE.md`/`MINT.md`/`QUALITY.md`/`LOG.md`/`SCORECARD.md` content, no
webbridge substrate doc, no round-2 harness script.

**Declared non-procedural reads (they do not carry craft procedure):**

| Read | Why | Channel |
|---|---|---|
| `AGENTS.md` (6 lines) | harness instruction surfaced by the tool | file read |
| `ls`/`stat`/`sha256sum` on lane files, `git log --oneline` | coordination: which document version is live | shell |
| `/tmp/tabi-r2-1-capture/site/page.html` (1903 B) | v2 step 1 says "copy the fixture in"; the doc names that path as the staged harness. Fixture **data**, read to author selectors | file read |
| `~/.config/chromium-flags.conf` (4 lines) | environment archaeology for the injected flags seen in the child line | file read |
| `chromium.log`, `http.log`, `/json/*` | the browser's own logs, HTTP debug surface of a browser this task started | browser log / HTTP `/json/*` |
| `ss -ltnp` (system process/port table) | port state; also the only glance at the webbridge daemon | process table |

**Not read:** `/tmp/tabi-r2-1-capture/{capture.mjs,driver.sh,compare.mjs}` —
filenames observed by `ls` only; the round-2 scripts were never opened, so the
v2 runbook had to carry its own mechanics. The webbridge daemon was never
touched or probed (v2 `:391` restricts `/status` probing to a daemon the task
itself started; this task started none).

**Timeline.** `SKILL.md` poll (single poller, 30 s cadence, hash-compare against
v1, 20-min cap): started 14:39Z, changed detected 14:44:45Z (`new=fdbad5db1d58`)
— 11th sample, ~345 s, cap not reached. The control execution (v1) ran
14:41:21–14:45Z, i.e. partly overlapping the upgrade; the canonical runbook
execution ran 14:47:11–14:48:52Z entirely against v2.

**Host inventory** (v2 step 0, `evidence-runbook/step0-inventory.txt`): node
`v24.21.0` (≥21 as the doc requires), `node -e "typeof WebSocket"` → `function`,
`Chromium 152.0.7977.82`, `Python 3.14.7` — all three match the doc's stated
round-2 host exactly (`SKILL.md@fdbad5db:60-61`).

## 1. Per-step sufficiency record — v2 §Runbook, executed verbatim

Verdicts: **SUFFICIENT** = the document alone carried the step (executor added
only values the doc explicitly delegates, listed); **PARTIAL** = the doc names
the requirement but a fresh executor must invent a material mechanic, value, or
definition; **NOT EXERCISED** = no claim of that class was needed here;
**OBSTRUCTED** = the doc requires it, this assignment's write restriction forbids it.

| # | Step as executed | Doc anchor | Verdict | Executor fill / finding |
|---|---|---|---|---|
| 0 | Inventory (node, WebSocket, chromium, python3) | `:58-62` | SUFFICIENT | none; all four results match the doc's stated host |
| 1a | Namespace scratch `/tmp/tabi-r3-4-work/*` from the first write | `:64-66` | SUFFICIENT | none |
| 1b | "Copy the fixture in; pin its bytes now" | `:64-66` | **PARTIAL** | The doc names the source only as "the measured harness … staged `/tmp/tabi-r2-1-capture/`" (`:52-54`). The fixture exists there today (1903 B, `sha256 21e27aa6619a…`), so the step ran; **the document itself carries no fixture bytes**, and that path is `/tmp` (volatile). If `/tmp` is gone the executor must author a fixture → methodology diverges and the ladder's byte-identity anchors become non-reproducible (see §4 G1) |
| 2 | Port precheck `ss -ltn \| grep -E ":(19411\|19412)\b"` | `:68-70` | SUFFICIENT | command + exit 10 given; measured "ports free" both runs |
| 3 | `python3 -m http.server 19411 --bind 127.0.0.1 --directory <site>` | `:72-76` | SUFFICIENT | listen line captured `users:(("python3",pid=412256,fd=3))`; `http.log` shows `GET /page.html 200` and the `?nondet=on` 200 |
| 4 | Launch `chromium --headless=new …` with `--user-data-dir=<out>/profile` | `:78-88` | SUFFICIENT | `--headless=new` accepted on 152.0.7977.82; `setsid nohup` exec'd in place — `$!` **was** the browser main PID (417253/417253); doc never claims otherwise, and step 6 re-discovers anyway |
| 5 | Bounded wait for `/json/version` (50 × 0.2 s) | `:90-99` | SUFFICIENT | endpoint up on first poll; `json-version.json` carried `Browser Chrome/152.0.7977.82`, `Protocol-Version 1.3`, browser ws uuid — and `chromium.log` carried the `DevTools listening on ws://…` line exactly as the doc states (`:97-99`) |
| 6 | Effective child line + kill list | `:101-106` | SUFFICIENT | `ps … grep "[c]hromium" … grep user-data-dir=…` returned 11–12 lines/run. Injected flags visible in the main line: `--ozone-platform=wayland --ozone-platform-hint=wayland --enable-features=TouchpadOverscrollHistoryNavigation --load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`. The doc's claim "what you type is not the effective command" (`:61-62,103-105`) reproduced. Child-set size varied between runs (12, 12, 11) → a hard-coded PID list would be wrong; discovery is load-bearing |
| 7 | Connect to page target ws; record session slot | `:108-114` | SUFFICIENT | matched target by `type:"page"`/url-title, never by id — as instructed; slot recorded: capture time UTC+local, browser ws uuid, target/frame id. Ids differed every run (`A8EFB205…` vs `B0C7473A…`; browser uuid `8fe2eda3…` vs `29e8f604…`) — the doc's per-launch warning confirmed |
| 8 | Viewport pin → navigate → poll `readyState` → two rAF | `:116-125` | SUFFICIENT | params given verbatim; `#status === 'hydrated'` is the doc's own example predicate (`:122-123`) and is literally this fixture's state → fired at 151/152 ms (fixture timer 150 ms). Two-rAF settle executed without hanging in headless |
| 9a | Screenshot → file → sha256 + bytes + W×H from IHDR | `:127-133` | SUFFICIENT | params `{format:"png",captureBeyondViewport:true}` given; IHDR offsets given (`readUInt32BE(16/20)`); measured 800×600, 18 672 B / 20 726 B |
| 9b | Read the PNG back visually | `:131-133` | SUFFICIENT | requirement behavioural, mechanism not named (executor used an image viewer tool); `det-after` read-back shows `count: 1`, bullet `item 1`, green `confirmed 1`, `status: hydrated` — matches the authored fixture state |
| 9c | `DOMSnapshot.captureSnapshot {computedStyles:[]}` → shape/struct/count | `:134-139` | SUFFICIENT | params + the `strings`-indices/`nodeValue`/`parentIndex` semantics all stated; measured 55 nodes, shape-text and struct shas stable across runs |
| 9d | Pseudo-element caveat (`::marker` emitted and counted) | `:138-139` | SUFFICIENT | did not bite at the before-capture (empty `<ul>`, 0 pseudo); **did** bite after the click — see the shape delta row |
| 9e | Cross-check `/json/list` title vs `document.title` | `:140-143` | SUFFICIENT | executed; agree in both runs (`TABI-R2-1 fixture`); JSON-list url equals read-back url |
| 9f | Cross-check "node count via two methods" | `:140-143` | **PARTIAL** | my two methods gave **21** (`getElementsByTagName('*').length`) vs **55** (DOMSnapshot node count) in both runs. The doc's gloss "disagreement is usually staleness" (`:142-143`) reads this definitional gap as staleness. The document never defines what counts as a node (elements? text nodes? `#document`? pseudo-elements?) → a fresh executor comparing 21/55 would conclude, wrongly, that the page moved (see §4 G2) |
| 9g | Idempotence: capture twice while idle, 300–350 ms | `:144-147` | SUFFICIENT | gap 320 ms → identical hashes in both runs, both script revisions |
| 10a | Find the target rect | `:149-154` | **PARTIAL** | the doc names the *dispatch* (`Input.dispatchMouseEvent` rect centre, params table `:198`) but not the rect-getter; executor used `getBoundingClientRect()` in a `Runtime.evaluate`. Mechanically derivable, but the doc's own measured harness had a specific recipe (a corpus-note anchor, unreadable under this condition) |
| 10b | Real input press+release, then state-wait, then after-capture | `:149-154` | SUFFICIENT | dispatched at (66.80, 172.88); state predicate `count==='1' && li.length===1 && #confirm-1` fired at 152 ms (fixture confirm delay 120 ms); `count: 1`, `liCount: 1`, `confirmPresent: true`; pair differs |
| 10c | Shape delta accounting | `:134-139` + ladder `:214` | SUFFICIENT | measured 55 → 60 (+5): `<li>` + its text + `::marker` (pseudoAfter = 1) + `<div.confirm>` + its text = exactly 5; struct sha changed `8c4f478b…` → `99938180…` |
| 11 | Compare across runs, mechanically | `:158-161` | **PARTIAL** | rule + `compare.tsv` name given; no script or column set. Executor authored the comparator. The doc's "never hand-transcribe" is honoured only if the executor builds the tool |
| 12 | Keep the differing pair (`?nondet=on`) | `:163-165` | SUFFICIENT | counterexample captured; pair differs within run and across runs; clock moved 500 ms apart |
| 13 | Cleanup + closure proof (4 checks, explicit PIDs) | `:167-187` | SUFFICIENT | script block given verbatim incl. escalation and the self-match warning (`:182-184`). Executed: kill by discovered PIDs, survivors file 0 B, ports file 0 B, `curl cdp exit=7`, `curl http exit=7` — both runs. The doc's `pkill -f` warning demonstrably steered behaviour: I avoided pattern-kills and pattern-greps inside the invoking command line entirely |

### Ladder, envelope, approval — also executed

| Item | Doc anchor | Verdict | Finding |
|---|---|---|---|
| Rung 1 (static bytes: idempotence + independent re-run) | `:213` | SUFFICIENT | `det-before` `c08947dc…` byte-identical within run and across two independent server+browser processes — equal in all four chromium runs of two full driver executions, across a logging-only script revision |
| Rung 2 (dynamic pair + volatile counterexample) | `:214` | SUFFICIENT | `det-after` byte-identical across runs; `?nondet=on` pair kept and differs |
| Rung 3 (multi-signal) | `:215` | SUFFICIENT (partial climb) | visual read-back + DOM shape/struct + protocol metadata + `/json/list` title cross-check, across two full runs; not maximised (no second independent shape channel beyond DOMSnapshot and JS counting) |
| Envelope items 1–8 | `:248-266` | SUFFICIENT | all captured; item 6 is the partial one (9f). Item 7's channel list omits **the process table**, which the runbook itself uses in steps 6 and 13 — a taxonomy gap, not a blocker |
| Envelope item 9 (archive to durable storage) | `:267-268` | **OBSTRUCTED** | every byte this test produced sits in `/tmp/tabi-r3-4-work/`. This assignment permits exactly one write (this file), so the archive obligation could not be discharged. The document is right; the write scope is the blocker — flag for the integrating lane (see §4 G4, §5) |
| Approval row: self-launched loopback capture = autonomous-now | `:388` | SUFFICIENT | ran on that authority; the stated price (cleanup+closure proof + archive) was paid except archive |
| Approval row: external-site interaction = blocked while operator asleep | `:393` | SUFFICIENT | honoured — no external site touched; loopback only |
| Anti-claim honored | `plans/round-3.plan.md:8-9` | SUFFICIENT | all traffic to 127.0.0.1; daemon untouched |
| Bounded waits | `:270-283` | SUFFICIENT | 10 s endpoint envelope and state-poll semantics given; my capture-side poll timeout was 8 s with 50 ms cadence (doc's measured harness value), the whole CDP session under `timeout 90`. The deliverable-poll cadence rule (15 s samples, 900 s cap) did not apply to a capture |
| NOT EXERCISED | — | — | network claim class (no network claim made; the netlog-not-a-HAR trap `:234-236` untested); webbridge section `:285-317` (daemon reuse, `@e` selectors, `fill`, `cdp` escape hatch, iframes); session-material rows `:342-361` (no session material in reach — own scratch profile); anti-bot/`isTrusted` rows `:307-310`; version-mismatch row `:313-314` |

## 2. Canonical evidence (v2 runbook execution, 2026-10-14 14:47–14:48Z)

Methodology pins (`evidence-runbook/methodology-sha.txt`):
fixture `21e27aa6619a41d2a68228b8fec90661b3b14aceb3d70e923f3400ab00691c99` ·
`runbook-capture.mjs 1fc758e5b7cf…` · `runbook-driver.sh 2b38d7c16325…` ·
`runbook-compare.py c2b98e00ac58…`.

| Artifact | run1 sha256 | run2 sha256 | bytes | W×H | across runs |
|---|---|---|---|---|---|
| det-before-c1 | `c08947dc1e02…` | `c08947dc1e02…` | 18 672 | 800×600 | identical |
| det-before-c2 | `c08947dc1e02…` | `c08947dc1e02…` | 18 672 | 800×600 | identical (within-run gap 320 ms) |
| det-after | `317310cc6fa1…` | `317310cc6fa1…` | 20 726 | 800×600 | identical |
| nondet-c1 | `59f0e6b8815c…` | `d3f279385ac4…` | 20 934 | 800×600 | differ (expected) |
| nondet-c2 | `8f36d72757f7…` | `893e68d8a8d9…` | 20 504 | 800×600 | differ (expected) |

Full hashes, timestamps (UTC+local), per-artifact method/params and session slots:
`evidence-runbook/run{1,2}/capture.json`; mechanical cross-run table
`evidence-runbook/compare.tsv` (step 11 — `sha256sum`-derived, not transcribed).

State facts, both runs: DOMSnapshot node count **55**; shape-text sha
`1a5f41dcdfb0…` and struct sha `8c4f478b3860…` equal across runs; url as-read-back
`http://127.0.0.1:19411/page.html`, equal to navigation input; `/json/list`
title == `document.title`; two-method count **21 vs 55 (disagree) → definitional**.

Interaction: rect `(24, 154.875, 85.61×36)`, dispatch centre `(66.80, 172.88)`;
state reached in 152 ms; shape delta 55→60 with `::marker` present after
(pseudoAfter = 1). Volatile pair: differ, clock values 500 ms apart.

Closure proof (`run{1,2}/step13-*`): survivors file 0 B, ports file 0 B,
`curl cdp exit=7`, `curl http exit=7`, kill by discovered PIDs only
(11–12 PIDs/run); escalation path present but not needed.

**Cross-check against the doc's own anchors — observation.** The doc's ladder
anchor reads "DOM-shape delta 55→65 nodes fully accounted" (`:214`). Measured
here: the fixture starts at exactly **55** nodes (matching the doc's baseline)
and one click adds exactly **+5**. 65 = 55 + 10 = two clicks at +5 each
[inference, medium — round 2's interaction count is not visible to this seat].
The baseline 55 reproduces the doc's number exactly; the click count is what the
anchor leaves unstated.

**Browser-log shape** (doc's "loopback ≠ no-egress" rule, `:222`, `:242-246`):
`chromium.log` held the `DevTools listening on …` line plus, per run, 1–2 zygote
`Failed to send GetTerminationStatus` errors on teardown; `http.log` shows only
loopback GETs. `/json/list` in a **fresh** profile still exposes extension
surfaces: `background_page Google Hangouts (chrome-extension://nkeimhogjd…/background.html)`,
one `service_worker` extension, two `browser_ui` omnibox entries — measured
support for the doc's caution. **No no-egress claim is made here**; the network
class was not captured.

## 3. Control execution — v1 document (`SKILL.md@4085be78`)

Run before the upgrade landed, against v1 + an executor-authored fixture
(`data:` URL, 699 B), to see what the pre-runbook document alone supported.
`evidence/` holds it; two independent chromium runs, 14:41–14:45Z.

- v1 named much of the discipline: capture params, viewport method, idempotence,
  two independent runs, the 9-item envelope checklist, cleanup by explicit PID,
  archive rule, session-material rules, approval rows.
- v1 did **not** carry: any launch command or flag list; the ports; the profile
  discipline; the sweep of served-fixture-vs-`data:` URL; the wait predicates;
  the rect/dispatch recipe; the compare script; any fixture bytes. Every one of
  those was executor-supplied in the control run.
- Measured (control): `det-before ae3f9afa9f48…` 11 992 B byte-identical across
  two independent runs; `det-after 7cf71ad7989e…` 11 914 B likewise; DOM nodes 21
  (tree-walk) vs 12 (elements) — the same definitional gap as in `v2`, i.e. the
  upgrade did not close it.
- Verdict: v1 was sufficient for *shape*, not for *reproduction* — two fresh
  executors on v1 would produce non-comparable byte sets. **v2 closes that** by
  fixing ports, commands, params, predicates and the closure script, and by
  naming the fixture source.

## 4. Verdict and gaps

**Verdict: the upgraded document is sufficient to execute and to grade a
loopback page capture from the document alone, and its stated numbers
reproduce.** Every copy-paste command in §Runbook ran unmodified (the only
executor substitutions were: the fixture source path that the doc names, the
`getBoundingClientRect` rect-getter, the compare-script body, and the archive
destination). The document's own measured facts reproduced on this host:
node/chromium/python versions, `Chrome/152.0.7977.82` + Protocol-Version 1.3,
10 s endpoint envelope, 55-node baseline, hydrated at ~150 ms, byte-identical
PNG pairs across independent runs, curl exit 7 at closure, `$!` semantics,
injected-flag visibility.

Residual gaps, ranked by risk to a fresh executor:

- **G1 — fixture bytes are not in the document** (`:64-66`, `:52-54`). The
  provenance rides on volatile `/tmp`. Today the copy worked; if that path is
  gone, a fresh executor authors its own fixture, the methodology sha changes,
  and every cross-run/cross-round byte-identity claim silently becomes a
  different experiment. The archive obligation (envelope item 9) applies to the
  *fixture* as much as to the artifacts.
- **G2 — "node count via two methods" has no node definition** (`:140-143`).
  Measured: 21 elements vs 55 snapshot nodes, both runs, both documents. The
  doc's "disagreement is usually staleness" would make a fresh executor chase a
  phantom. Needs one clause: which count, and whether pseudo-elements are in it.
- **G3 — remaining mechanics live in the sha-pinned round-2 scripts** (rect
  getter, compare columns, poll cadence constants). The doc states the rules and
  points at the scripts; a fresh executor without `/tmp` must reinvent them —
  acceptable for shape, not for byte comparison.
- **G4 — the archive step is obstructed by write scope, not by the document**
  (`:185-187`, `:267-268`). Nothing from this test is durable. Either the corpus
  gets a declared evidence-write surface, or every hash in this note stays
  provisional.
- **G5 — channel taxonomy** (`:263-264`): the envelope lists four channels; the
  runbook itself relies on a fifth (the process table) in steps 6 and 13.

## 5. Unknowns

1. Whether any other executor reproduces these hashes: font rendering and the
   host chromium build are environment-scoped (`:334-337`) — untested beyond
   this host, this build, this fixture.
2. Durable fate of `/tmp/tabi-r3-4-work/` and `/tmp/tabi-r2-1-capture/`; whether
   the integrating round lifts the archive obligation or lifts the write scope.
3. The webbridge route as a whole (daemon reuse, `/status`, extension connection
   state): untouched by rule, never exercised — a fresh executor would have to
   test it before trusting it.
4. Whether the network class (HAR capture, `response_body`, the netlog trap) is
   executable under this discipline — untested this seat.
5. Round 3's multi-step journey artifacts (other seats' outputs) were not read;
   whether the §Runbook's per-hop sentence (`:223-224`) suffices for a 3+ page
   journey is this seat's blind spot.
6. Two clicks → 65 nodes is inference, not measurement (§2).

## 6. Errata (append-only)

- **E1 (2026-10-14, TABI-R3-4).** §Runbook `:142-143` "disagreement is usually
  staleness" is insufficient as written for the node-count cross-check; measured
  definitional gap 21/55 (§1 step 9f, §4 G2). Proposed clarification for the
  scribe: state the count definition inline.
- **E2 (2026-10-14, TABI-R3-4).** Ladder anchor `:214` "55→65 nodes" — this
  seat measured the 55 baseline exactly and +5 per click; the anchor should state
  the interaction count so the delta is re-checkable.
- **E3 (2026-10-14, TABI-R3-4).** Envelope `:263-264` channel list omits the
  process table, which §Runbook steps 6/13 use as an evidence channel.
- **E4 (2026-10-14, TABI-R3-4).** This note's own hashes are `/tmp`-staged and
  therefore provisional under envelope item 9; E4 is discharged only by archiving
  `evidence-runbook/` (and the fixture) to durable storage.

## 7. Re-run recipe (scratch, volatile)

```sh
# fixture (v2 step 1) — the doc-named source; copy in, then pin
cp /tmp/tabi-r2-1-capture/site/page.html /tmp/tabi-r3-4-work/site/page.html
sha256sum /tmp/tabi-r3-4-work/site/page.html
# steps 0-13 (both runs + mechanical compare)
timeout 250 bash /tmp/tabi-r3-4-work/scripts/runbook-driver.sh
cat /tmp/tabi-r3-4-work/evidence-runbook/compare.tsv
```

Expected on this host: `det-before` `c08947dc…`, `det-after` `317310cc…`,
node count 55, closure `curl … exit=7` twice. A different sha means the
methodology moved — check `methodology-sha.txt` before comparing anything.## 8. Revision watch (appended after the test — document moved again)

While this note was being written, `SKILL.md` changed a second time:
`032b2da9b5eb…`, 33 734 B, 472 lines, mtime 2026-10-14 11:50:40 -0300. All
in-body anchors above are stamped `SKILL.md@fdbad5db` — that is the revision
this test executed against (426 lines, mtime 11:44:34 -0300), and the numbers in
§2 are its result. Nothing above is re-anchored, retro-edited, or re-claimed.

Content-matched line map, tested revision → current revision (grep-verified line
numbers in `SKILL.md@032b2da9`, same strings):

| Item | `@fdbad5db` | `@032b2da9` |
|---|---|---|
| Sufficiency contract | `:12-17` | `:12-16` |
| §Runbook (all steps) | `:50-187` | `:55-196` |
| step 0 inventory / step 1 freeze / step 2 precheck | `:58-62` / `:64-66` / `:68-70` | `:66-71` / `:72-75` / `:76-79` |
| step 3 serve / step 4 launch / step 5 wait / step 6 child line | `:72-76` / `:78-88` / `:90-99` / `:101-106` | `:80-85` / `:86-97` / `:98-108` / `:109-115` |
| step 7 slot / step 8 viewport+wait / step 9 capture / step 10 interact | `:108-114` / `:116-125` / `:127-147` / `:149-154` | `:116-123` / `:124-134` / `:135-156` / `:157-166` |
| step 11 compare / step 12 volatile pair / step 13 closure+archive | `:158-161` / `:163-165` / `:167-187` | `:167-171` / `:172-175` / `:176-196` |
| PNG read-back requirement | `:131-133` | `:139-140` |
| `::marker` caveat | `:138-139` | `:146-147` |
| "node count via two methods" cross-check | `:140-143` | `:150-151`, restated `:270` |
| idempotence rule (300–350 ms) | `:144-147` | `:152-156` |
| call-reference table | `:189-202` | `:198-212` |
| ladder rungs incl. "55→65" anchor | `:213-215` (`:214`) | `:220-224` (`:223`) |
| ladder rules incl. "loopback ≠ no-egress" | `:217-224` (`:222`) | `:226-233` (`:231`) |
| §Record envelope (9 items) | `:248-268` | `:257-277` |
| item 6 / item 7 / item 8 / item 9 | `:260-262` / `:263-264` / `:265-266` / `:267-268` | `:269-271` / `:272-273` / `:274-275` / `:276` |
| §Bounded waits / §Webbridge / §Determinism | `:270-283` / `:285-317` / `:319-340` | `:279-293` / `:294-327` / `:328-350` |
| §Session-material / §Rights-rate / §Approval table | `:342-361` / `:363-377` / `:379-417` | `:351-371` / `:372-387` / `:388-464` |
| §Staleness watch | — (absent) | `:465-472` (new) |

The revision's approval table has been re-labelled (rows now `C1…Cn`; the
operator-asleep row that was `:393` sits at `:401/:409` in `@032b2da9`). The
runbook steps this test executed are unchanged in substance across the two
revisions by content match — but this test's numbers belong to `@fdbad5db`, and
a third revision would make even this map stale.

**E5 (2026-10-14, TABI-R3-4).** `SKILL.md` changed twice inside one seat's test
window (14:44:34 → 11:50:40 -0300, two different content states). Per the
document's own staleness rule (`@fdbad5db:41-42`, `@032b2da9:41-42`), every
citation is version-stamped here; consumers of this note should match by content,
not by line number, if the file has moved again.

Appended 2026-10-14 (tabi round 4, lane ERR-B — errata sweep; re-run transcripts
staged `/tmp/w4-erb-b-sweep/`, byte-prefix proof `/tmp/w4-erb-b-append-proof/`,
both volatile). Pre-append sha256 of this file:
`1262708864dbff22b22ea997285172fd4cbabcd087889e5ac4e80ea4104ef4be`. The
post-append hash necessarily differs — re-derive with `sha256sum`.

- **E6 (2026-10-14, ERR-B).** `SKILL.md` moved a third time — §8's own
  prediction ("a third revision would make even this map stale") materialized.
  Current committed revision `452bc514d387` — 576 lines, 39,069 B, mtime
  2026-10-14 11:56 (`git show HEAD:SKILL.md | wc -l` → 576; `SKILL.md` §Pins
  :30-59). The §8 map's `@032b2da9` column is stale as line numbers; resolve by
  content (E5's rule). Content re-located in the current revision: count
  definition `:158-159`; "55→65 … **two** clicks" rung `:313`; §Runbook
  `:61-287`; ladder rungs `:312-314`; §Record envelope `:351-375` — item 7 now
  names the **process table** (**E3 applied**, `:371-373`); approval table
  `:485-567`; §Staleness watch `:569-577`. E1/E2/E3 verifiably applied; E4
  (durable archive of `/tmp/tabi-r3-4-work/`) still open — its evidence bytes
  re-hashed on disk this sweep and still match §2 (det-before `c08947dc…` ×4,
  det-after `317310cc…` ×2, nondet pair differs, 55 nodes, struct `8c4f478b…`,
  text `1a5f41dc…`).
- **Line-count calibration (record-side correction).** `wc -l` on the committed
  blob → **297** — exactly §Pins' "297 lines — `wc -l`". The round-3 scribe
  record "wc -l → 298" (LOG.md:128-130; SCORECARD.md:50) counted numbered
  lines, not newlines: the file has no trailing newline (last bytes `69 6e 2e`
  = `in.`), so `Read` shows 298 lines while `wc -l` counts 297. No content
  discrepancy; the annotation slip is in the record, not the pin (LOG/SCORECARD
  correction owed to the owning seat — outside this lane's write scope).

Appended 2026-10-14 (tabi round 5, lane B5-3 — pin refresh; derivation pass 17:01–17:06Z; scratch `/tmp/w5-tabi-b53/` — volatile). Nothing above is edited. Pre-append sha256 of this file: `5f04f6877e1e2abcb0bf5f7c07bdf59a6ddb43f14409172e0e3dfeffc498af15`. The post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, pin refresh] VERIFIED — §2 methodology 4/4 + artifact pins re-hashed; file pin held.** fixture `21e27aa6…1c99`, `runbook-capture.mjs` `1fc758e5b7cf…`, `runbook-driver.sh` `2b38d7c16325…`, `runbook-compare.py` `c2b98e00ac58…`; artifacts from `/tmp/tabi-r3-4-work/evidence-runbook/`: det-before `c08947dc1e02…` ×4, det-after `317310cc6fa1…` ×2, nondet-c1 `59f0e6b8815c…`/`d3f279385ac4…`, nondet-c2 `8f36d72757f7…`/`893e68d8a8d9…` — all as recorded. This note's hash → `5f04f6877e1e…` (`wc -l` 325; E6's count calibration stands). E4 (durable archive) still open; E1–E3 verifiably applied per E6. Same-day-later pass — a strictly-later-date re-derivation remains open (round-5 plan clause (c)).