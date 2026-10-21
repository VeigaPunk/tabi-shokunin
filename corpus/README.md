# tabi-shokunin — corpus

## Coverage map

Held at round 3 (2026-10-14): 8 knowledge notes, 1944 lines —
`ls corpus/knowledge/*.md | wc -l` → 8; `wc -l corpus/knowledge/*.md` →
237 / 177 / 298 / 216 / 220 / 296 / 236 / 264. Lessons: 0 —
`ls -A corpus/lessons | wc -l` → 0.
A row is written when its file exists, never before (CORPUS.md:45-47).

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webbridge-plugin-anatomy.md` | Substrate contract for the lane's primary surface: the kimi-webbridge plugin is a 3-file / 216-line declarative package (no vendored code); manifest↔skill version consistency (`1.11.3`); 14-tool call surface with tab/session/screenshot/selector/fill semantics and failure routing; daemon `127.0.0.1:10086` ops — recovery order, the no-autonomous-`stop`/`restart`/`uninstall` prohibition, `/status` fields; daemon measured not running at capture (stale pid file, no listener). | read-only inspection; re-run anchors in-note §8 (grep/wc/sha256). Scribe re-ran §8.1–8.4 on 2026-10-14 — all held. Round-2 errata appended (re-run block, U3 partial resolution, daemon-live supersession, start-authority tension pointer); post-append pin `5e0fbe35feea` |
| `knowledge/browser-surface-census.md` | Host browser inventory (chromium 152.0.7977.82-1 the only real install; measured absences for Firefox/Brave/Chrome/Vivaldi et al., rejection kept); profile trees reported shape-only (mode/du/mtime; `Cookies`/`Login Data` sizes, never content); 1Password NMH shells across chrome-family config dirs; webbridge daemon + MCP config state; live headless-chromium runtime snapshot (transient). | shell census per row, §1–§4 (command → output). Scribe re-ran the Brave-negative and the version-consistency admit on 2026-10-14 — both held. Round-2 errata appended (off-by-4 `operations.md` cite corrected, anchors re-run, daemon-live supersession, U5 status); post-append pin `70d1d455ee18` |
| `knowledge/cdp-evidence-patterns.md` | Re-runnable loopback CDP session (TABI-3): launch recipe + effective-child-line provenance (host launcher injects flags); `/json/version`, `/json/list`, `Target.getTargets` field surfaces; screenshot + DOM evidence with determinism classes (E1–E11); the 9-item page-claim re-verifiability envelope; cleanup proof + the `pkill -f` self-match incident kept as calibration. Round-2 errata appended (see row's §8): root `backendNodeId` is per-capture; `url` holds the as-normalized navigated URL; screenshot determinism re-held a third time cross-session; the launch-window extension-target sighting downgraded to non-replayable. | evidence ids E1–E11 in-note (commands + hashes). Scribe re-ran :36/:105/:84-85 anchors on 2026-10-14 — all held. Post-append pin `599e7d323c48` |
| `knowledge/live-dynamic-capture.md` *(round 2, TABI-R2-1)* | Live dynamic-page evidence: loopback `http.server` fixture with JS hydration + click mutation captured before/after through CDP, twice with byte-identical (sha-pinned) methodology; the determinism boundary measured on both sides — det-before/det-after PNGs byte-identical across two independent server+browser runs even after JS mutation + real input, live-page captures differ while the DOM-shape struct survives; 7 new capture rules (determinism-class split, state-waits, methodology-byte pins, explicit viewport, capture idempotence, loopback ≠ no-egress — GCM attempts logged despite `--disable-background-networking`, keep the differing pair); cleanup proven per run. | methodology + artifact sha pins in-note §1–§3; scratch staged `/tmp/tabi-r2-1-capture/` (volatile — archive owed). Scribe re-hashed run1/run2 det PNGs (`c08947dc…802dc1` / `7488d544…4b42c7`) and all four methodology shas 2026-10-14 — all match; ports 19411/19412 closed, no chromium survivors |
| `knowledge/webbridge-daemon-disposition.md` *(round 2, TABI-R2-2)* | Daemon lifecycle authority + measured disposition: `start` doc-authorized (`operations.md:11-13`) and executed — pid 3934817 listening `127.0.0.1:10086`; `stop`/`restart`/`uninstall` agent-forbidden (`operations.md:26`) → daemon left running as a recorded state change, operator stop named (D2); `/status` probed iff-conditioned — 8 fields vs the 5 documented, `extension_connected:false` (no session material ever present); `/command` auth not probed by rule; pre-run shape captured (stale pid 37800, `identity.json`/`logs/` shape-only). | disposition rows D1–D4 + §8 check sequence in-note. Scribe re-ran `ss -ltnp` + `/status` on 2026-10-14 — pid and 8-field shape match; substrate pins `84a8e69d04c5`/`b811d9c23dfd` re-verified unchanged |
| `knowledge/multi-step-journey.md` *(round 3, TABI-R3-1)* | Multi-step journey evidence: 4-page loopback site (index → detail → form → confirm) traversed with real clicks, `insertText` fill and a GET submit through CDP; six per-step captures per run (screenshot + raw DOMSnapshot + shape text + client network slice + URL/history); two independent cold-profile runs byte-identical (compare.tsv 25 IDENTICAL / 3 expected DIFFER) + two preserved warm-cache runs; browser-side navigation-history witness (`typed`/`link`/`form_submit`); state class parsed from raw DOMSnapshot columns (hollow encoding, `-1` empty-value sentinel; shape text carries no live values); network-shape boundary measured both sides — wire 304 vs client 200 while capture bytes stay identical; 7 new journey rules; cleanup + port closure proven per run. | methodology + artifact sha pins in-note §1–§2 (journey.mjs `b52074a33876`, driver.sh `9509c07f49f9`, compare.mjs `ecce1c73dc56`, 6 fixture files); scratch `/tmp/tabi-r3-1-journey/` (volatile — archive owed). Scribe re-hashed all methodology + run1 PNGs 2026-10-14 — all match; ports 19421/19422 closed, no survivors |
| `knowledge/interaction-approval-table.md` *(round 3, TABI-R3-2)* | Interaction approval taxonomy, finalized: every interaction class → autonomous-now / operator-asleep-blocked / operator-approval-required (plus the never-lane-executed set), judged on rights · rate · consequence with a gate and falsifier per class — C1 loopback autonomous-now; C2/C3/C6 asleep-blocked (unblock = scoped go-ahead, budget for C6); C4 third-party consequential never lane-executed; C5 login-required approval-gated (session material shape-only); A1–A12 adjacent gates (daemon start/stop/`/status`, trusted-input `cdp` escape hatch, tab borrowing, version mismatch, iframes, Windows request bodies, tab closing); SKILL.md's distilled table agreed bin-for-bin. | §6 counting commands (6 C-rows, 12 A-rows — re-ran by scribe 2026-10-14, both match); spot transcripts `/tmp/tabi-r3-2-spot/` (volatile); live read 14:41Z: daemon pid 3934817 still listening (state change persists, operator stop owed) |
| `knowledge/executor-test-sufficiency.md` *(round 3, TABI-R3-4)* | No-oral-context sufficiency test: a fresh executor whose only procedural read was `SKILL.md` executed a full loopback capture — v2 §Runbook verbatim, steps 0–13, two independent runs with closure proof — with per-step verdicts (every copy-paste command ran unmodified; PARTIALs named: fixture bytes not in the document, node-count definition, rect getter, compare script) and a v1 control run showing why; verdict **SUFFICIENT** with residual gaps G1–G5; errata E1–E5, applied in SKILL.md's final revision (count definition `:158-159`, two-click delta `:313`). | methodology pins + compare.tsv in-note §2 (10 yes / 3 expected NO — scribe re-ran 2026-10-14; det-before `c08947dc…802dc1` reproduces the round-2 pin across independent seats); scratch `/tmp/tabi-r3-4-work/` (volatile — archive owed, G4) |

## Frontier

Entered or named, not yet held (the notes' enumerated unknowns — anatomy
U1–U4, census U1–U5, cdp §7 items 1–8, live-dynamic-capture §7 items 1–7,
daemon-disposition U1–U7, multi-step-journey §8 items 1–8,
interaction-approval-table U1–U8, executor-test-sufficiency §5 items 1–6;
several partially resolved by the round-2 errata and the round-3 SKILL fixes):

- Extension↔daemon link — daemon lifecycle + `/status` shape now held
  (round 2), but the handshake is not: `extension_connected:false`
  throughout (disposition §5); `skills`/`tab_id_arg` semantics (U1), bundle
  `1.11.3` vs daemon/extension `2.0.23` reconciliation (U6), `/command`
  auth (U7, unprobed by rule).
- Native WebMCP in chromium 152 — unprobed (census U3).
- Site-interaction records: the round-3 approval table maps the classes
  (C2–C6) with gates, but the deciding evidence is still an absence — no
  measured rate limit or ToS surface exists; the bounded-runs rule forbids
  asserting one unmeasured; record when measured. Round-3 anti-claim held
  again: no external sites, loopback only (operator approval absent,
  `plans/round-3.plan.md:8`).
- Real-site journeys + evidence durability — third-party JS, redirects,
  POST forms, CSRF-checked submits untested by rule (journey §8.6); the
  fixture bytes and runbook mechanics (rect getter, compare columns) live
  in volatile `/tmp` scripts, and no declared evidence-write surface exists
  (executor G1/G3/G4) — until archived, every byte-identity hash is
  provisional.
- Evidence-byte archival — staged `/tmp` evidence now thirteen groups:
  `tabi3-cdp/` (round 1), `tabi-audit2-cdp/`, `tabi-a1-r2b-capture/`,
  `tabi-a2-r2b-evidence/` (wave-1/2 audits), `tabi-r2-1-capture/`,
  `tabi-r2-3-verify/`, `tabi-r2-4-poll/` + the `tabi-r2-2-*` state files
  (round 2), and round 3's `tabi-r3-1-journey/`, `tabi-r3-2-spot/`,
  `tabi-r3-3-anchors/`, `tabi-r3-3-smoke/`, `tabi-r3-4-work/`; hashes are
  verifiable only while `/tmp` lives (`cdp-evidence-patterns.md:92`).

## Quality bar

See `QUALITY.md` (admits only falsifiable, source-cited claims;
rejection kept as evidence of taste).

## Fleet round-1 freshness receipt — 2026-10-15

The header and Frontier above are historical round-3 snapshots, not current
inventory totals. This round adds no knowledge note or domain surface.
`evidence/fleet-round-1-freshness/pins.tsv` re-verifies the fixed training-closeout
set: 23 notes + seven reports + three public plugin files + pre-append SKILL
revision, 34 distinct pin witnesses. Derivation, independent expected-prefix
sources and actual hash/count commands are in `planner-current.json` and the
three `*-current.json` executor receipts in that directory.

The dated witness is `../SKILL.md` §Errata — fleet round-1; its actual commit and
before→after counting command are recorded in `../SCORECARD.md`'s fleet round-1
section. Only the carried time-gated clause is closed by that qualifying commit;
the other historical debts and unverified surfaces are not recertified.
Fresh browser smoke: `evidence/fleet-round-1-freshness/browser-current.json`
and `browser-current-before.png` / `browser-current-after.png`; gate decisions
and outside-review limit: `lessons/round-1.md`'s fleet continuation.
The new evidence directory contains review/measurement receipts, not a 46th
domain-coverage archive group; the historical 45-group coverage claim is not
increased by this move.

## Interactive reconciliation erratum — 2026-10-15

The preceding fleet-round-1 section and its `*-current.json` references were
inherited uncommitted from the stopped headless attempt. They are retained
provenance, not this interactive session's capture or evidence of a completed
32-seat round. This session's plan and re-measured gate/browser outputs live
under `../.ufo/plans/fleet-round-1-interactive-20261015.md` and
`../.ufo/rounds/fleet-round-1-interactive-20261015/`. The gate is
`../scripts/check-freshness.mjs`; its registry is in `../SKILL.md`.

The qualifying witness hash/instant is recorded in `../SCORECARD.md` after
creation; this corrects any premature reading of "is closed" at :73. Local
pin integrity is distinct from round admission: dispatch remains blocked by
missing global taxonomy alias bindings, with zero current task calls and no
receipt or completed-round credit. No knowledge note or coverage group added.


## Pstack coverage addition — example-domain-observation (2026-10-15)

The historical coverage map above stays a round-3 snapshot. This addition records one note admitted by pstack-20261015-r04.

| Note | Holds | Sources |
|---|---|---|
| `knowledge/example-domain-observation.md` | Observation-only capture of https://example.com/: empty h1, documentation paragraph, GET `/` and GET `/s.js`, DOM and screenshot hashes. | `corpus/evidence/pstack-20261015-r04/public/capture.json` |

## Pstack coverage addition — loopback-pin-stability (2026-10-15)

The historical coverage map above stays a round-3 snapshot. This addition records one note admitted by pstack-20261015-r09.

| Note | Holds | Sources |
|---|---|---|
| `knowledge/loopback-pin-stability.md` | Four loopback DOM files match the shipped pin, and the example.com DOM hash differs from that pin. | `corpus/evidence/pstack-20261015-r08/calibration/pin-receipt.txt` |

## User coverage addition — user-public-observation (2026-10-15)

The historical coverage map above stays a round-3 snapshot. This addition records one note admitted by user-20261015-r04.

| Note | Holds | Sources |
|---|---|---|
| `knowledge/user-public-observation.md` | Observation-only capture of https://example.com/ from user-20261015-r02: GET only, public DOM hash distinct from a loopback replay. | `corpus/evidence/user-20261015-r02/public/capture.json` |

## Coverage map — reconciliation (kaika fleet round-1, 2026-10-19)

Append-only reconciliation. The round-3 map and its three single-note additions
above stay as written; this block maps the notes those sections do not.

Counts at base `40a6de87f`, re-derived 2026-10-19, excluding the three round-1
notes still in flight (`chrome-remote-debugging-profile-boundary.md`,
`webdriver-bidi-capability-matrix.md`, `web-flake-retry-evidence.md`), whose rows
the L1 adds:

| Quantity | Value | Command |
|---|---|---|
| knowledge notes | 26 | `ls corpus/knowledge/*.md \| wc -l` |
| lesson files | 26 (`round-1`..`round-10` plus the pstack and user waves) | `ls corpus/lessons/*.md \| wc -l` |
| evidence groups | 64, of which 45 carry a `MANIFEST.txt` | `ls -d corpus/evidence/*/ \| wc -l`; `find corpus/evidence -name MANIFEST.txt \| wc -l` |

| Note | Holds | Sources |
|---|---|---|
| `knowledge/arc-synthesis.md` | Ten-round synthesis of the lane's own records: the evidence ladder as built (4 rungs plus 5 measured extensions), the approval discipline, the archive as infrastructure, the loopback-only perimeter. Measures nothing new; every row carries a path:line anchor. | §0 as-of table with one command per row; §6 manifest spot-checks (`sha256sum -c MANIFEST.txt`); in-repo records only (`LOG.md`, `SCORECARD.md`, notes, reports, plans). |
| `knowledge/archive-receipt-r5.md` | Round-5 archive of the pinned `/tmp` groups: 25 groups, 1,010 files, 6,780,293 B, one `MANIFEST.txt` per group. Records the `*profile*` exclusion (widened from `*/profile/*` for cause) and three mechanical checks: manifest self-check, source-vs-archive hash equality, corpus-wide pin scan. | `corpus/evidence/<group>/MANIFEST.txt` (`sha256sum -c`); §1–§6 counts by command. |
| `knowledge/archive-receipt-r8.md` | Seven new groups, 41 files, 207,889 B from the round-6/7 tranche; tree moves 28 → 35 groups, 1,403 → 1,451 files. Zero `*profile*` exclusions exercised; `w7-aud-b7-checks` is an aggregation of loose `/tmp` root logs. | Per-group `corpus/evidence/<group>/MANIFEST.txt`; §1 group table with file and byte counts. |
| `knowledge/archive-receipt-r10.md` | Round-9 tranche: 269 files, 1,065,924 B under `corpus/evidence/w9-tabi-b91/` with a 269-line MANIFEST; 2,396 files excluded under `*profile*` paths, none read. §8 appends the round-11 final sweep (9 groups, 52 files, 390,702 B; tree 36 → 45). | `corpus/evidence/w9-tabi-b91/MANIFEST.txt`; §8.1–§8.5. |
| `knowledge/async-step-evidence.md` | Async XHR as a held-request pre/post pair: the request is held at the CDP Fetch request stage, so the pre-settle state is a stable class, then released against a payload-derived DOM wait. Six runs, each pair carrying visual, state and network layers. | `/tmp/tabi-r4-2-async` pins; archived as `corpus/evidence/tabi-r4-2-async/` and `w4-t4-2-async/` (102 files each). |
| `knowledge/carried-debt-closure-r8.md` | Closes the F1 stale-pin erratum for `tabi-b1-r3b-journey` with one append-only line while leaving the group's file list unchanged. Records the round-6 L1 wire-class/cache-revalidation matrix as still open at round 8. | `tabi-b1-r3b-journey/MANIFEST.txt` plus in-group pin self-checks; `diff` against `tabi-r3-1-journey`. |
| `knowledge/closeout-r11.md` | Round-11 closeout: the arc (the 4-rung ladder with its measured boundaries, the archive as infrastructure, the loopback-only perimeter), the standing asks (L0 packet, daemon revival) and the debt ledger C1–C6 closed, O1–O16 open, R1–R3 residue. | §5 commands (manifest spot `sha256sum -c` ×3 groups, L0 read, daemon read, census); in-repo records only. |
| `knowledge/external-class-fixture-v2.md` | Loopback fixture v2 with a redirect chain and rate/ToS-shaped endpoints (robots-disallow, 429, 403, interstitial) behind a stop-and-report predicate proved by the runner's own cells. Ten driver runs on two loopback origins; no external site. | `/tmp/w6-tabi-b61` pins §9; archived as `corpus/evidence/w6-tabi-b61/` (139 files plus MANIFEST). |
| `knowledge/hygiene-sweep-r4.md` | Read-only sweep of rounds 1–3 from live state at four passes: every scratch port closed, no chromium-family browser, no fixture server, daemon state recorded. Nothing was killed, stopped or deleted. | Live `ss`/`ps`/`pgrep` passes at the stated times; scratch `/tmp/tabi-r4-3-sweep` and `/tmp/w4-t4-3-sweep` (archived). |
| `knowledge/layer-routing-synthesis.md` | Synthesizes the rounds 4–6 network and async evidence into the claim-class → layer-routing table, with the measured disagreement cases as rows. Measures nothing new; unquoted rows are marked [synthesis]. | Anchors to `network-evidence-rung.md` §6, `async-step-evidence.md` §2/§5, `external-class-fixture-v2.md` §4/§5/§7, `reports/r4-aud-tab1.md` §2, `reports/r6-aud-b6.md`; scratch `w7-b71-synth/source-pins-final.txt`. |
| `knowledge/network-evidence-rung.md` | Defines the network rung: a per-step CDP Network-domain slice (request/response plus ExtraInfo, loading, cache) with four correlated surfaces plus a file-side third party, on a 3-navigation loopback fixture. | `/tmp/w4-t41-network/site/` and methodology pins; archived as `corpus/evidence/w4-t41-network/` (200 files) and `tabi-r4-1-network/` (122 files). |
| `knowledge/packet-readiness-r7.md` | Audits the operator-approval packet's nine claim classes against landed notes: 9/9 classes backed, 9/9 packet note pins stale, 3/3 substrate pins hold, and the packet's cold-read falsifier never executed. | Packet `corpus/handoffs/operator-approval-request.md`; §1 class-to-note table with re-verified pins; §3 archive mapping. |
| `knowledge/state-changing-matrix-r9.md` | Lands the replay half of the state-changing matrix on the round-8 fixture: per-token-state replay probes, the 409/replay cells, redirect-code replay, fresh-token double-apply and the cross-client contract. Nine cells × 2 cold reps plus third reps, 20 loopback runs. | `/tmp/w9-tabi-b91` (`matrix.tsv`, `run-all.log`, `verify-out.txt`); archived as `corpus/evidence/w9-tabi-b91/MANIFEST.txt`. |
| `knowledge/stateful-fixture-evidence.md` | Loopback server-side state fixture (cookie-shaped sessions, no auth, one-time tokens, apply ledger) with 14 cells × 2 cold reps, a curl control arm, the multi-visit evidence pattern and a cookie shape-only census. | Scratch pins in-note; `/tmp/w8-tabi-b81` remains unarchived (`closeout-r11.md` O2), so these pins stay provisional. |
| `knowledge/webbridge-revival-assessment.md` | Assessment, not a revival: restart is local and doc-specified, the extension↔daemon handshake is not doc-authorizable operator-free, and the operator chromium now runs with the Kimi extension while the daemon is down. | `/tmp/w6-tabi-b62` pins §8; archived as `corpus/evidence/w6-tabi-b62/` (7 files plus MANIFEST); substrate `SKILL.md` and `references/operations.md`. |

These 15 rows plus the 11 `knowledge/` rows already above (eight in the round-3
map, three in the single-note additions) cover all 26 notes at base
(`diff <(ls corpus/knowledge | sort) <(grep -o 'knowledge/[a-z0-9-]*\.md' corpus/README.md | sed 's|knowledge/||' | sort -u)` → exit 0, no output).

Round-1 admits (claim C2; each opens with `source:` citing `corpus/SOURCES.md` rows, which is
now the corpus's curated reading list — registry, study paths, search log, leads). With these
three rows the same `diff` covers 29/29 notes:

| Note | Holds | Sources |
|---|---|---|
| `knowledge/chrome-remote-debugging-profile-boundary.md` | Chrome ≥136 refuses `--remote-debugging-port/-pipe` on the default data dir; the Chromium source shows the check is compiled only into Google-branded desktop builds and fails closed, so this host's unbranded Chromium does not enforce it and the runbook's `--user-data-dir=<out>/profile` stays the lane's guard. Documentation and source reading only. | S001–S004 (Chrome blog, CDP viewer, Chrome for Testing, `remote_debugging_server.cc` @main) |
| `knowledge/webdriver-bidi-capability-matrix.md` | Spec-level map of every CDP evidence surface tabi uses to its WebDriver BiDi command or event in WD 2026-10-08, with gaps; a protocol map, not a support matrix — locally measured: no. Decision rule: choose transport per evidenced feature. | S005–S012 (W3C draft, MDN, Selenium, Chrome blog, chromium-bidi) |
| `knowledge/web-flake-retry-evidence.md` | Receipt contract that keeps `passed` / `flaky` / `failed` re-derivable (every attempt, order seed, first-retry trace, the awaited state predicate), mapped onto tabi's state-predicate waits; no runner flake was measured locally. | S013–S019 (Playwright 1.64 docs, ICST 2025 paper, KNU record) |

## Frontier — kaika fleet round-1 (2026-10-19)

The `## Frontier` block above is the round-3 text and stays unedited. Each of
its bullets is restated with the status re-derived from later notes and
`LOG.md`; `held` = measured and cited, `open` = named and not held,
`superseded` = the historical wording no longer describes the tree.

| Frontier item | Status | Current pointer |
|---|---|---|
| Extension↔daemon link | open — the daemon lifecycle and `/status` shape were already held when the bullet was written; the handshake has never been observed up (four `/status` samples, all `extension_connected:false`) and the docs route extension faults to user actions only. `/command` auth stays unprobed by rule. | `knowledge/webbridge-revival-assessment.md:182-200` and `:12-17`; `knowledge/packet-readiness-r7.md:62`; `knowledge/closeout-r11.md` O16. |
| Native WebMCP in chromium 152 | open — still unprobed; the only WebMCP surface evidenced on the host is a CDP tool, not `navigator.modelContext`, and no flag carries it. | `knowledge/browser-surface-census.md:145-153` and U3 `:188`. |
| Rate/ToS surface for site-interaction records | open — the approval table still decides from an absence; round 6 measured loopback 429/403/robots-disallow instruments with a stop-and-report predicate, which is the instrument, not a real surface. | `knowledge/external-class-fixture-v2.md` §4–§5; `knowledge/interaction-approval-table.md` C2–C6; `knowledge/state-changing-matrix-r9.md` (loopback only). |
| Real-site journeys | open — the only external record is read-only public observation of `https://example.com/` (GET `/` and `/s.js`, no interaction); third-party JS, redirects, POST and CSRF-checked submits remain untested by rule. | `knowledge/example-domain-observation.md`, `knowledge/user-public-observation.md`, `knowledge/loopback-pin-stability.md`; round-3 anti-claim unchanged. |
| Evidence-byte archival (thirteen `/tmp` groups) | superseded — 64 groups and 45 manifests at base; the 19 later pstack/user/fleet dirs carry per-directory receipts instead of a `MANIFEST.txt`; the r8 tranche (`/tmp/w8-tabi-b81`, `/tmp/w8-ver-b81`) stays named unarchived. | `ls -d corpus/evidence/*/ \| wc -l` → 64; `archive-receipt-r5.md` §1 (25 groups), `archive-receipt-r8.md` §1 (35), `archive-receipt-r10.md` §8.1 (45); `closeout-r11.md` O2. |

New this round (`docs-held` = admitted from opened sources, runtime unmeasured; `open` = rows queued in `corpus/SOURCES.md`, no note):

| Frontier item | Status | Pointer |
|---|---|---|
| Chrome ≥136 profile boundary | docs-held — source-level enforcement read; refusal never observed (no branded Chrome on this host) | `knowledge/chrome-remote-debugging-profile-boundary.md` §3, Unknowns 1–5 |
| WebDriver BiDi | docs-held — spec map only; no BiDi session measured, CDP evidence surfaces unchanged; WPT result data is an unread lead | `knowledge/webdriver-bidi-capability-matrix.md` §2, U1–U5 |
| Runner flake receipts | docs-held — receipt contract only; no Playwright runner flake measured | `knowledge/web-flake-retry-evidence.md` §2, §4 |
| Playwright accessible locators / ARIA snapshots | open — S023–S025 opened and queued (`accessible-selectors` path), no note | `corpus/SOURCES.md` §Paths |
| WebMCP spec | open — S020 opened and queued (CG draft 2026-10-16); native WebMCP in chromium 152 still unprobed | `corpus/SOURCES.md` S020; `knowledge/browser-surface-census.md` U3 |

Correction (kaika round-1 post-review, 2026-10-19): the `chrome-remote-debugging-profile-boundary.md`
row above (line 167) says this host's unbranded Chromium "does not enforce" the ≥136 refusal.
That is an inference from Chromium source (the note's §3 labels it so; S028 supersedes S004),
not an observation — no default-profile launch was made. The row's guard rule is unchanged.

## Round 12 — coverage and freshness reconciliation (2026-10-20)

This append supersedes the queued/no-note accessible-selector row at :193 only.
The historical maps and 29/29 statement at :163 describe their original revisions.
Current note-map count is recorded by the round's committed measurement, not inferred
from those historical counts.

| Note | Holds | Sources |
|---|---|---|
| `knowledge/playwright-accessible-locators-and-snapshots.md` | New docs-held ground: role/name/label locator choice, strictness and re-rendering, partial ARIA templates and child matching modes. Different from webbridge `@e`; no runtime capability, visual guarantee or accessibility certificate. | S023, S024, S025, reopened 2026-10-20 |
| `knowledge/source-recheck-round-12.md` | Corrections on existing ground: same-port address retry vs approval-mode port fallback; switch-only refusal scope; rolling-stable retry version qualification; a proposed false BiDi correction rejected against the exact source sentence. | S028, S011, S013, S017; `corpus/evidence/round-12/source-recheck.json` |

| Frontier item | Current status | Pointer |
|---|---|---|
| Playwright accessible locators / ARIA snapshots | docs-held — previously queued, now mined; no local Playwright execution | `knowledge/playwright-accessible-locators-and-snapshots.md` |
| Other open frontier ground | unchanged — extension↔daemon handshake, native WebMCP host probe, rate/rights real-site records, real-site journeys, WebMCP spec mining | historical frontier rows :180–183 and :194 |

The two appended errata in `chrome-remote-debugging-profile-boundary.md` and
`web-flake-retry-evidence.md` point to the correction dossier. Their original verification
headers remain historical; three bounded source-claim families were rechecked, not every
claim in every note. In particular, S018/S019 paper/abstract content was not refreshed.

Round-12 measured index at `0d82098e8151ac8c1f58f55716b9f6569bd1844a`: **31 notes /
31 mapped / no missing paths**, command and exact output in
`corpus/evidence/round-12/measurements.json` (`map.command`, `map.stdout`, exit0).
This explicitly supersedes the current-state reading of the historical29/29 count.

## Round 13 — isolated accessible-selector runtime ground (2026-10-20)

| Note | Holds | Sources |
|---|---|---|
| `knowledge/aria-loopback-round-13.md` | Complete executable experiment contract for role/name/label selection, strictness, action-time re-resolution and partial-versus-equal ARIA templates. Actual runtime admission is determined by the retained execution receipt and round-13 lesson, not this index row. No pixels/audit/real-site/cross-browser claim. | S023/S024/S025; `corpus/evidence/round-13/aria/receipt.json` |

This adds the previously unheld runtime side of the round-12 docs-held ground.
The prior documentation entry remains historical; it is not silently redated.
The final receipt and lesson record whether the experiment actually passed.

Runtime admission: `corpus/evidence/round-13/aria-execution-pass.json` records exit0
at code revision `06e6ada`; `aria/receipt.json` records eight ran/eight passed,
four expected rejections and cleanup. Command:
`node -e 'const r=require("./corpus/evidence/round-13/aria/receipt.json"); console.log(r.summary.cases,r.summary.negative)'`.
Accessible-selector ground is now runtime-held only for this exact package/browser
and loopback fixture. Other open frontier ground from round12 is unchanged.
The complete revision-based note-map command/count is retained in
`corpus/evidence/round-13/measurements.json`; historical31/31 describes round12.

## Round 14 — bounded metadata correction, not new coverage (2026-10-20)

No new knowledge entry or browser capability is added. The existing round13
runtime note/receipt stays historical and byte-preserved. S029 records its exact
worker cleanup and observed/descriptive Node fields; the qualified correction is
`corpus/evidence/round-14/aria-metadata/corrected.json`, checked by
`scripts/check-aria-metadata.mjs`. This is calibration of held evidence, not
another execution, independent signal, newly entered frontier or audit.
The historical producer and note keep their exact runtime-pinned bytes; replay
outputs need the documented metadata qualification rather than an unqualified
aggregate reading. Observed Node26.12.0 differs from descriptive24.21.0/minimum20.

The round14 lesson records source curation, actual red/green controls and all
prior verifier routed dispositions. Existing frontier rows remain unchanged.
The source histogram/note-map commands and measured revisions are retained in
`corpus/evidence/round-14/measurements.json`; the historical round13 map remains
the last prior map rather than an unqualified current-state count.

## Round 15 — held-evidence contract repair, no frontier expansion (2026-10-20)

The round14 correction remains the same historical sidecar and input pair.
The round15 metadata checker tightens the checked cleanup/qualification mirror
contract and separates changed authenticated inputs from compared semantic
failures. `corpus/evidence/round-15/source-index.json` directly cites reopened
S029; the round15 lesson records its registry used-by transition and actual
positive/negative evidence. No knowledge note or browser capability enters
through this bookkeeping.

Named qualification to the Node sentence above: the historical test spec
enforces minimumMajor20 (`aria-loopback.spec.mjs:269`, invoked `:924`) and
the metadata checker re-evaluates it retrospectively. The launcher's
`runtime.pinned` summary and the spec's `runtimePinStatus()` summary omit
Node, while the launcher records `runtime.node`. This corrects the outside review's
overbroad non-enforcement inference without rewriting it. Observed26.12.0
versus descriptive24.21.0 is not exact environment reproduction. Runtime
dates and original pinned bytes stay fixed. Extension↔daemon handshake,
native WebMCP, real-site rate/rights,
real-site journeys and WebMCP spec mining remain open; no source-row or
metadata-fixture count is counted as expansion.

## Round 16 — native WebMCP held on Chromium 154 loopback (2026-10-20)

New knowledge map row (33 notes; the 32 earlier rows are unchanged):

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webmcp-chromium-loopback-round-16.md` | Runtime-held for Chromium 154.0.8037.97 with WebMCP flags on loopback fixtures only: `document.modelContext`, declarative and imperative tools over CDP `WebMCP.toolsAdded`/`toolsRemoved`, flag-off and domain-disabled controls, permissions-policy denial, the `data:` divergence, and the spec-versus-build table | S020, S030–S036 (receipt `evidence/round-16/webmcp/receipt.json`) |

Frontier status (append-only; the round-3 bullet at `:35` and the kaika row at
`:181` keep their historical wording): "Native WebMCP in chromium 152 —
unprobed (census U3)" is now **held for Chromium 154 only**, flag-enabled,
loopback, 11/11 receipt cases. Chromium 152 stays unprobed at runtime. The kaika
row's "not `navigator.modelContext`, and no flag carries it" is superseded:
the current spec (S020 §4.1) and the 154 IDL (S033) both put `modelContext` on
`Document`, and `--enable-blink-features=WebMCP` carries it on 154. Still open:
real-site WebMCP (needs operator approval), agent-side consumption of page
tools, tool invocation as committed evidence, any unflagged/default-profile
claim, and the extension↔daemon handshake, real-site rate/rights and real-site
journey rows.

Wave-2 supersession note (2026-10-20, append-only): the earlier rows that say
"WebMCP spec | open — S020 opened and queued" (`:194`), "unchanged … native
WebMCP host probe … WebMCP spec mining" (`:216`) and the round-15 "native
WebMCP … WebMCP spec mining remain open" (`:282-285`) are historical for
round 16: S020 is now mined by the note above, and native WebMCP is held for
Chromium 154 with flags on loopback only. The kaika clause "not
`navigator.modelContext`" (`:181`) holds at 154; only "no flag carries it" is
superseded. Real-site WebMCP, agent-side consumption and Chromium 152 stay open.

## Round 17 — WebMCP tool invocation over CDP as committed evidence (2026-10-20)

New knowledge map row (34 notes; the 33 earlier rows are unchanged):

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webmcp-invocation-round-17.md` | Runtime-held for Chromium 154.0.8037.97 with WebMCP flags on loopback fixtures only: CDP `WebMCP.invokeTool` against a page-registered tool, recorded as the raw request/response, the `invocationId`/`WebMCP.toolInvoked`/`WebMCP.toolResponded` events and the page-side `execute` observation per case, under predicates fixed in code before the run, with the required error and edge cases as receipt cases | S041–S048 (receipt `evidence/round-17/webmcp-invoke/receipt.json`) |

Frontier status (append-only; the round-16 status at `:302-303` and its wave-2 note at
`:307-314` keep their historical wording): the clause "tool invocation as committed
evidence" (`:303`) is now **held for Chromium 154 only**, flag-enabled, loopback,
11/11 (plus 4 supplementary controls) required cases in the committed receipt. Everything else named at `:302-305`
stays open: real-site WebMCP (needs operator approval), agent-side consumption of page
tools (no MCP client and no kimi-webbridge WebMCP surface observed,
`knowledge/webmcp-chromium-loopback-round-16.md:128-129`), any unflagged/default-profile
claim, Chromium 152 at runtime, and the extension↔daemon handshake, real-site rate/rights
and real-site journey rows.

Census U3 pointer index (routed defect 4,
`corpus/lessons/round-16-verifier-spotcheck.md:151`). `knowledge/browser-surface-census.md`
is sha-pinned at `corpus/evidence/fleet-round-1-freshness/pins.tsv:7`
(`a33c22644d64…`, 265 lines), so its U3 line cannot gain an in-file pointer; this index row
carries the pointer and no note byte changes. The routed text cites
`corpus/README.md:295-317`, but the round-16 file ends at `:314`
(`git show 3254740:corpus/README.md | wc -l` → `314`), so the row below cites the span that
exists.

| Pinned line | Points to | Status |
|---|---|---|
| `knowledge/browser-surface-census.md:188` (U3) | `corpus/README.md:295-305` and `:307-314` | answered for Chromium 154.0.8037.97 only, flags on, loopback; Chromium 152 unprobed at runtime |

Re-derivation for this section: `sha256sum corpus/knowledge/browser-surface-census.md`
(expect `a33c22644d64…`); `node -e 'const r=require("./corpus/evidence/round-17/webmcp-invoke/receipt.json");console.log(r.verdict,r.summary.cases,r.summary.passed,r.summary.failed,r.summary.missing,r.summary.caseSet.caseSetOk)'`;
`diff <(ls corpus/knowledge | sed 's/\.md$//' | sort) <(grep -o 'knowledge/[a-z0-9-]*\.md' corpus/README.md | sed 's|knowledge/||;s|\.md$||' | sort -u)` → no output.

Adjacency map (round 17, C3): sibling overlaps and their dispositions — including the
round-16 integrator ruling on CDP (`corpus/lessons/round-16-verifier-spotcheck.md:141-142`)
and the contested the-musketeer CDP profile lease (fleet `.ufo/l0-questions.md:62`) — live in
`corpus/adjacency.tsv`, checked by `scripts/check-adjacency.mjs`. `PROVINCE.md` cannot carry
them: it is a census-frozen row (`corpus/evidence/pstack-20261015/baseline-census.tsv:24`).

Binding receipts history label (routed defect 2): `corpus/evidence/round-16/binding/selftest.json`
(43 cases) and `binding/legacy-r15.json` were produced by the pre-hardening gate (`5150611c…`);
the receipts of the registered gate at 3254740 (`1f84fb54…`, 59 cases) are in
`corpus/evidence/round-17/routed/binding-hardened/` (`index.json`). The legacy stdout is
byte-identical across the two gates; only the gate identity differs.

Round-17 wave-2 index rows (append-only):

| Frozen or earlier line | Points to | Status |
|---|---|---|
| `knowledge/webmcp-chromium-loopback-round-16.md:135` ("contested scope awaiting an integrator ruling") | ruling at `corpus/lessons/round-16-verifier-spotcheck.md:141-142`; map row `cdp-runtime-observation` in `corpus/adjacency.tsv` | ruled for tabi/kaidoku; reach to revenger and kama is open (fleet `.ufo/l0-questions.md:65`) |
| `knowledge/webmcp-invocation-round-17.md` source header | adds S054 (supersedes S047's anchor/teaches); S055–S057 supersede S049, S050, S053 | corrections from wave-2 source re-opens (`.ufo/waves/round-17/w2/Reopen*.md`) |

## Round 18 — source rechecks and guarded harness execution (2026-10-20)

| Entry | Ground | Evidence |
|---|---|---|
| `knowledge/source-recheck-round-18.md` | Early re-verification of current-at-baseline source rows; not overdue repair or new product support | `evidence/round-18/source-recheck/`; `.ufo/waves/round-18/measure-c1.mjs` |
| `knowledge/harness-hardening-round-18.md` | Signal/cleanup, CDPSession transport, refused downloads and effective feature-switch contracts, sourced S059–S064 | successor `scripts/webmcp-invoke-round18.mjs`; `.ufo/waves/round-18/measure-c2.mjs` |
| `lessons/round-18.md` | Explicit correction of round-17 sibling count and other routed records | `.ufo/waves/round-18/measure-c3.mjs`; `evidence/round-18/routed/` |

Corrections index: `lessons/round-17.md:116` and fleet round-17 report line 35's sibling total
are superseded by `lessons/round-18.md#corrections` (six). SOURCES S057's publisher anchor is
superseded by S058 in all falsified cells. Old text remains historical, not current guidance.
The round-17 short-digest rerun report points to seven **new** fully retained round-18 reruns;
the lost original bytes were not recovered.

Frontier: harness execution discipline is deepened on already-held loopback ground; real-site,
agent-side invocation, default profile and Chromium 152 remain open. The source sweep is quality
work, not expansion by row count. Frozen `check-freshness.mjs --witness HEAD` remains callable
directly; `scripts/freshness-witness.mjs` is a guarded caller, not global enforcement.

Wave-2 correction index (the older bytes remain historical):

| Earlier pointer | Current interpretation |
|---|---|
| `knowledge/webmcp-invocation-round-17.md:54,73`; `SKILL.md:1956`; SOURCES S042 | S071 and `knowledge/source-recheck-round-18.md` §7: the no-inputSchema-check observation is imperative-tool-scoped; declarative form validation is source-evidenced |
| `knowledge/source-recheck-round-18.md:11,136,146` | Its §7 supersedes the57-row present-tense sentence and names S058; first-snapshot counts/producer are history, final retained-body receipts and measured records are current |
| `knowledge/harness-hardening-round-18.md:12,24` | Its wave-2 clarifications correct the premature measurement-file pointer and Node24.22 paraphrase |
| SOURCES S003/S008/S010/S018/S029/S031/S034/S044/S052/S054/S063 | S072/S066/S069/S076/S067/S073/S074/S068/S065/S075/S070 respectively; Gate in lesson and current source-note §7 |

No frontier is declared closed merely because the source registry grew. Final corpus note count
is36 (baseline34 plus the two round18 entries), not a new runtime capability.

## Round 19 — declarative WebMCP validation measured (2026-10-21)

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webmcp-declarative-validation-round-19.md` | Chromium 154 loopback runtime behaviour of declarative form tools for 15 input families: fill-time vs submit-time error classes and their exact texts, keying by name, disabled/readonly/hidden handling, per-type coercion and sanitization, length limits not enforced for agent fills, CDP non-object refusal; 27 predeclared decisions | S077–S079, S082, S083, S091; `evidence/round-19/validation/` (cases, fixtures, probes, `decisions.json`, receipt); `scripts/webmcp-validation-round19.mjs` |

Frontier update: declarative validation moves from source-level (`SKILL.md:1994-1997`) to runtime-held for
the tested families. Still frontier: real-site WebMCP, agent-side consumption, custom elements /
ElementInternals form-associated controls (validation bypassed by source, not exercised), forms without
`toolautosubmit`, file inputs, other Chromium builds.

Corrections indexed: `LOG.md:1059` count (LOG round 19), `SCORECARD.md:830` assertion wording (SCORECARD
round 19), round-18 registry `wave: null` (`.ufo/waves/round-19/corrections/r18-registry-wave-null.md`).

Round-19 wave-2 index correction, superseding :405's population wording and the current guidance at
`knowledge/webmcp-declarative-validation-round-19.md:45-65,73-75`: **15 pre-probe families, 27 post-probe
candidate decisions declared before counting**; use revision-bound measurements for admitted counts.
Current scope/semantics are in that note's `## Wave-2 correction entry` and SKILL's matching correction:
checkbox boolean-like strings may coerce; undescribed versus described hidden controls differ; a selected
disabled option is omitted from FormData; malformed email/URL native validity is still enforced.
The note also consumes S087 (queued→mined, used-by now this note); add it to :405's source list.
The original 66-case population is unchanged; supplemental coercion observations are not silently added
to that count. C3's missing direct wave-1 return snapshot remains unprovable, not repaired by mtimes.
Current supersession sources additionally include S095 (complete input sanitizer scope/anchors), S096
(navigation null String sentinel), S097 (optional output omission/parse fallback) and S099 (canonical PDL
identity explicitly reusing S041). S098 keeps the same-file schema reading queued and explicitly reuses
S077 rather than counting punctuation as source diversity. The final counter uses the SKILL
`### Declarative WebMCP input-validation decision table — corrected (round 19)` rendering; the original
table is retained historical text. The frozen USER gate additionally refuses the modified round-19 lesson
in inherited ancestry; unchanged gate exits must not be read as proof of no new harm.
L0 disposition: Main ruled that USER refusal growth inherited before this continuation is lane-side
conformance debt with axes unaffected, not a new axis harm. Its recorded refusal stays two and history/
gate remain unchanged (`../.ufo/waves/round-19/final/l0-ruling.txt`). C3 d4 remains separately unprovable;
current trend grading is the lesson's final L0 ruling section.

## Round 20 — completion lifecycle source distillation (2026-10-21)

| Note | Ground / evidence class | Sources |
|---|---|---|
| `knowledge/webmcp-completion-lifecycle-round-20.md` | Deepens already source-held declarative lifecycle ground into a finite troubleshooting table: entry-time autosubmit fork, fill refusal, focus/pause callsites, callback ordering, response errors and internal null-String sentinel. Source-only; not a new runtime surface, independent-branch count or capability. | S096 reopened; S100 is an explicit same-body anchor extension for LC11; `evidence/round-20/lifecycle/decisions.json`; retained raw/decoded source metadata in `../.ufo/waves/round-20/source-opening.json` |

Frontier remains open: real-site WebMCP, agent-side consumption, non-autosubmit runtime
execution, declarative cancellation/rejection/late-settlement fixtures, other builds and
default-profile behaviour. Historical autosubmit success/navigation were already observed
in r17; this round does not erase them or turn source calls into new observations.
The new note is mapped here; run `node .ufo/waves/round-20/counts.mjs REV` for the
revision-bound corpus census. Extra SOURCES rows are not expansion or source diversity.

Correction index: S078's old empty-string wording is already superseded by S096; neither
immutable row is rewritten. S100 extends anchors, not independent authority. The
LC12 C++ sentinel-to-landing-result bridge is outside this sample, not newly established
as an output mapping. Round-19 missing return-time evidence remains unprovable.

### Round-20 falsification correction index

| Historical pointer | Current guidance / disposition |
|---|---|
| `knowledge/webmcp-completion-lifecycle-round-20.md:29-40`, its initial checklist/history, and `SKILL.md:2217-2228` | The appended `Round-20 falsification correction — canonical source guidance` in both files supersedes those rows. The counter selects only the corrected-source heading; old rows remain history, not additional current decisions. |
| `README.md:449-450` “neither immutable row is rewritten” | Immutable cells were not rewritten; S096's mutable used-by cell was appended under the contract. S100 extends scope for LC11 and additional prose anchors without independent-source credit. |
| w1 return/outcome “all64 settled” flags | Withdrawn as all-actor assertions; `.ufo/waves/round-20/w1/ordering-correction.json`. The w2 return was frozen in `e0b5d02a6aef76b0d2799d92618f79f1bca40062` before exact-blob repairs. |
| rawSha256/rawBytes in the initial source-opening metadata | Uncompressed HTTP base64 carrier; storage encoding, compressed-file hash/size and gunzip step are now explicit in `.ufo/waves/round-20/source-opening.json`. Initial retrieval time remains unrecorded, not inferred from mtimes. |

No row count is source diversity or new runtime coverage. The new note remains one
source-distillation entry on held ground; the parent performs independent admission.
