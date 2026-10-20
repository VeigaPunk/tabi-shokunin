# ConnKnowledgeLinks — round 16 wave 1 (knowledge cross-reference slice)

Seat: `TabiR16.ConnKnowledgeLinks-5` (leaf; no subagents; no commits; no gates, selftests,
counters or browsers; no external URL opened; no installs). Read-only over
`corpus/knowledge/`, `corpus/README.md`, `corpus/evidence/round-16/` and the round-16
drafts; the only file written is this report.

Method: opened each named note at the cited lines this session and verified every anchor
with numbered reads (`awk 'NR>=a && NR<=b {printf "%d: %s\n", NR, $0}'`). Line numbers
below are the files as they stand at 2026-10-20 ~11:3x local. No claim here is a runtime
observation of WebMCP; the harness `scripts/webmcp-loopback-round16.mjs` did **not** exist
at read time (`ls` → `No such file or directory`, see §9).

## 0. Verdict

The WebMCP note (`corpus/knowledge/webmcp-chromium-loopback-round-16.md`) owes **five
cross-references**, one sentence each. The draft at `.ufo/waves/round-16/drafts/DraftNote.md`
(mtime 11:29) currently contains **none of the five** — its only `corpus/knowledge/` strings are
its own target path at `:5` and `:111` — and it contains one contradiction that
one of them repairs: its Limits section says "PLAN's 'Chromium 152 unprobed' frontier is not
addressed here", although this round's C2 claim is exactly that frontier step on Chromium 154.

A sixth, adjacent supersession (census §3.4/U3 + `corpus/README.md:35,181,194`) is required for
the note's absence→held move to be honest about what it replaces. It is not one of the five
named notes; it is listed separately in §7 so L1 can accept or reject it without touching the
five required links.

## 1. Required links at a glance

| # | Note | Sections to cite | Exact anchors (verified) | Draft placement |
|---|---|---|---|---|
| L1 | `corpus/knowledge/cdp-evidence-patterns.md` | §1 Launch recipe; §2 HTTP control surface; §5 rules 2/5/7/8; §6 Cleanup | `:18`, `:30-34`; `:38-52`; `:85,88,90-91`; `:94-105` | §Scope (browser/provenance line) + one "channels" paragraph in §What Chromium 154 exposes |
| L2 | `corpus/knowledge/chrome-remote-debugging-profile-boundary.md` | §3 Boundary matrix; §4 Relation to lane practice | `:44-52`; `:56-80` | §Scope, profile/temp-profile line |
| L3 | `corpus/knowledge/webdriver-bidi-capability-matrix.md` | §2 matrix; §3 Decision rule | `:54-76` (incl. `locally measured: no` `:56`); `:78-96` | §Scope or a one-line "transport" note before the decision table |
| L4 | `corpus/knowledge/playwright-accessible-locators-and-snapshots.md` | §2 role/name/label table; §8 Round-13 runtime qualifier | `:31-47`; `:158-163` | §Scope (driver line), with the ARIA separation in §Limits |
| L5 | `corpus/knowledge/aria-loopback-round-13.md` | §Isolation and cleanup; §What this result cannot establish | `:39-41`; `:43-45` | §Limits and unknowns (or a short §Isolation paragraph) |
| L6 | `corpus/knowledge/browser-surface-census.md` (+ README pointers) | §3.4 WebMCP; U3; README frontier bullets | `:145-153`; `:188-189`; `corpus/README.md:35,181,194` | replaces the draft's "frontier is not addressed here" line |

## 2. L1 — CDP session discipline

Path: `corpus/knowledge/cdp-evidence-patterns.md` (title at `:3`; scope line `:5-6` names
`PROVINCE.md:9-13` "CDP session discipline").

Sections and what the WebMCP note actually needs from them:

- §1 `:12-36`: the launch recipe is **not** the note's to reinvent. `:18` establishes that
  `/usr/bin/chromium` is a launcher that "appends flags from ... `chromium-flags.conf`"
  (this host: 4 lines, `:18`); `:30-34` is the effective child process line (E1) and the
  loopback bind proof (E2). The WebMCP note's flags are `--enable-features` /
  `--enable-blink-features`; the launcher's own `--enable-features=TouchpadOverscrollHistoryNavigation`
  is appended, so the typed flag string is not the effective one. This is the strongest
  reason the link is mandatory, not decorative.
- §2 `:38-52`: the observed HTTP discovery surface is `/json/version` + `/json/list` only
  (fields at `:40-46`; `id` is per-launch and "not stable across launches" `:48`).
  `/json/protocol` — the byte source of `protocol-domain.json` — is **not** in that
  section. The note must say it extends the surface, not that the surface already covered it.
- §5 rules `:79-93`: rule 2 `:85` (browser provenance in effective form + protocol shape),
  rule 5 `:88` (determinism class; per-launch ids and drifting target inventories are the
  time-varying class), rule 7 `:90` (name the channel: HTTP `/json/*`, browser-level
  protocol, page-level protocol, log), rule 8 `:91` (cleanup proof), rule 9 `:92`
  (archive the bytes).
- §6 `:94-105`: kill by PID from the process table (`:96-101`); the `pkill -f` self-match
  calibration at `:105` ("an unverified kill is an unknown, not a cleanup").

**Exact cross-reference sentence (paste):**

> Launch provenance, channel identity and closure follow the round-1 CDP session discipline and are not restated here — effective child process line rather than the typed command (the `/usr/bin/chromium` launcher appends `chromium-flags.conf`), a named producing channel per fact, event-stream artifacts marked time-varying, and closure proven by PID and port — and `/json/protocol`, read here for the `WebMCP` domain, extends the round-1 HTTP discovery surface, which observed only `/json/version` and `/json/list` (`corpus/knowledge/cdp-evidence-patterns.md` §1 `:18,30-34`; §2 `:38-52`; §5 rules 2/5/7/8 `:85,88,90-91`; §6 `:94-105`).

What this prevents: (a) recording the typed flags instead of the child line, which would
misstate the feature-on condition; (b) claiming `/json/protocol` was already a held surface;
(c) presenting `toolsAdded` events (asynchronous, ordering-sensitive) as if they were
byte-stable artifacts under §5.

## 3. L2 — Chrome ≥136 profile boundary

Path: `corpus/knowledge/chrome-remote-debugging-profile-boundary.md`.

- §3 `:44-52`: matrix; row `:51` is this host's unbranded Chromium — "check not compiled
  in → allowed by this gate".
- §4 `:56-60`: `--user-data-dir=<out>/profile` is "hygiene ... now a hard precondition on
  branded Chrome"; `:70-75`: "never point remote debugging at the user's real profile ...
  Local unbranded Chromium *would* accept `--remote-debugging-port` on the default dir ...
  lane rule forbids it anyway"; `:76-80`: CDP "is not a public or supported API ... does not
  guarantee backwards compatibility" → every recorded protocol shape is build-scoped.

**Exact cross-reference sentence (paste):**

> The fresh run-owned profile is a standing lane precondition, not a WebMCP-specific concession — branded Chrome ≥136 refuses `--remote-debugging-port` on the default data directory, this host's unbranded Chromium is outside that compiled check, and the lane still never points remote debugging at a session profile — and because CDP guarantees no backward compatibility, the `WebMCP` domain and event shapes recorded here are build-scoped observation, not a contract (`corpus/knowledge/chrome-remote-debugging-profile-boundary.md` §3 `:44-52`; §4 `:56-80`).

What this prevents: the note reading as "we use a temp profile because WebMCP requires it"
(false cause), and the `WebMCP` domain declaration being promoted to a stable API promise.
Note the boundary note's row for unbranded Chromium names 152.0.7977.82 (`:51`); the WebMCP
note runs 154.0.8037.97, so the sentence deliberately avoids restating the version.

## 4. L3 — WebDriver BiDi capability matrix

Path: `corpus/knowledge/webdriver-bidi-capability-matrix.md`.

- §2 `:54-76`: the inventory of tabi surfaces, each `locally measured: no` (`:56`). The
  surface list is browser identity, target inventory, navigate, screenshot, DOM, waits,
  viewport, click, text, network, wire, byte, pre-settle, history, cookies, stop, dialogs —
  there is **no WebMCP row**.
- §3 `:78-96`: "Choose the transport **per evidenced feature, never by protocol branding**"
  (`:80`); a Working Draft command is not implementation proof (`:81-82`).

**Exact cross-reference sentence (paste):**

> `WebMCP.*` is a CDP-only surface and is not a row in the BiDi capability matrix, whose §2 inventory and `locally measured: no` verdict are unchanged, so nothing here may be read as a BiDi capability — the matrix's rule is to choose transport per evidenced feature, never by protocol branding, and this note stays on the CDP side of it (`corpus/knowledge/webdriver-bidi-capability-matrix.md` §2 `:54-76`; §3 `:78-96`).

What this prevents: a reader treating the round-16 capability as evidence for any BiDi row,
or expecting the matrix to be edited. The matrix is a historical note; this note does not
append a row to it. If a WebMCP/BiDi row is ever wanted it is a separate append-only
correction, not part of C2.

## 5. L4 — Playwright accessible locators and ARIA snapshots

Path: `corpus/knowledge/playwright-accessible-locators-and-snapshots.md`.

- §2 `:31-47`: role → accessible name, form control → associated label; the selection rule
  at `:47`. These are accessibility selectors, not tool-schema inputs.
- §8 `:146-163`: the round-13 runtime qualifier pins Playwright 1.64.0 and **managed Chrome
  for Testing 156.0.8078.4** (`:158-159`), and says it does not "qualify another build"
  (`:161`).
- Grounding for the separation in this lane's own fixture:
  `corpus/evidence/round-16/webmcp/fixtures/declarative-form.html` has
  `<label>Query <input type="text" name="q"></label>`; PLAN's pre-probe produced schema
  property `q` for `<input name="q">`. So the schema key mirrors `name`, while the label
  (a Playwright accessible-name source) reads `Query`.

**Exact cross-reference sentence (paste):**

> Playwright is the transport only — this harness uses the same Playwright 1.64.0 package the round-13 accessible-locator work pinned but launches system Chromium 154.0.8037.97, not that work's managed Chrome for Testing 156.0.8078.4, so none of its runtime qualifier transfers — and the role/name/label and ARIA-snapshot surfaces it documents are not the WebMCP tool surface: the pre-probe's schema property `q` mirrors `<input name="q">` while the fixture's label reads `Query`, so an ARIA snapshot neither predicts nor certifies a `WebMCP.Tool` entry (`corpus/knowledge/playwright-accessible-locators-and-snapshots.md` §2 `:31-47`; §8 `:158-163`; `corpus/evidence/round-16/webmcp/fixtures/declarative-form.html`).

What this prevents: importing the round-13 "Playwright 1.64.0 / Chrome for Testing 156"
runtime claim into a receipt whose browser is system Chromium 154; and reading the
accessibility tree as a tool inventory. This is the one place where the shared package
version is a trap, because the driver is identical and the browser is not.

## 6. L5 — aria-loopback-round-13 isolation contract

Path: `corpus/knowledge/aria-loopback-round-13.md`.

- §Isolation and cleanup `:39-41`: "binds only127.0.0.1 [sic] on an ephemeral port"; "Every
  browser profile is a new run-owned directory; it is never a host/session profile"; page
  requests outside the exact fixture origin "are aborted and logged"; the receipt records
  "context closure, removed profiles/temp roots, child-process observations and a
  connection-refused proof after server shutdown".
- §What this result cannot establish `:43-45`: the record "proves only these declared
  structural/selection behaviors on this package/browser/OS and author-built fixture".

**Exact cross-reference sentence (paste):**

> Isolation and closure follow the round-13 loopback experiment contract rather than a new convention — an ephemeral `127.0.0.1` port, a run-owned profile, non-fixture requests aborted and logged, and a receipt recording context closure, profile removal and a post-shutdown connection refusal — and the same bounded-claim rule applies: the receipt shows only the declared per-case behaviors on the pinned package/browser/fixture (`corpus/knowledge/aria-loopback-round-13.md` §Isolation and cleanup `:39-41`; §What this result cannot establish `:43-45`).

What this prevents: the PLAN's harness contract (`PLAN.md` C2 bullet: fresh temp profile,
`127.0.0.1:0`, abort every non-loopback request) being presented as a WebMCP invention, and
the receipt being read as more than its declared cases. Note the contract is **planned** at
draft time, not yet executed (§8 below).

## 7. L6 — adjacent supersession (not one of the five; accept or reject)

Path: `corpus/knowledge/browser-surface-census.md`; pointers in `corpus/README.md`.

- §3.4 `:145-153`: dated 2026-10-14 (`:3`); "No WebMCP configuration exists in browser
  flags" (`:147-148`); "The only WebMCP surface evidenced on this host is the `rea-agents`
  CDP tool `discover-webmcp-tools`" (`:149-152`); "Native WebMCP support in chromium 152
  was not probed" (`:153`).
- U3 `:188-189`: "Whether chromium 152 exposes native WebMCP (`navigator.modelContext`
  etc.) — no flag configured and no runtime probe performed in this census."
- Frontier pointers: `corpus/README.md:35` ("Native WebMCP in chromium 152 — unprobed
  (census U3)"), `:181` and `:194` (open rows, `:194` also records S020 as queued).

**Exact cross-reference sentence (paste):**

> `corpus/knowledge/browser-surface-census.md` §3.4 `:145-153` and U3 `:188-189` recorded a 2026-10-14 absence — "The only WebMCP surface evidenced on this host is the `rea-agents` CDP tool" and native support "not probed" — and this note supersedes those two lines only for Chromium 154.0.8037.97 under the recorded flags, their wording remaining true as of that census's own snapshot; the historical frontier bullets `corpus/README.md:35,181,194` stay unedited and the round-16 README block re-points the frontier to this note.

Why it is required: C2's frontier move is 0→1 against exactly this absence. Without the
sentence, the note either silently contradicts a live row or (as drafted) denies addressing
it. Two wording cautions: (i) the census's "chromium 152" is historical — the host binary is
154.0.8037.97 (`corpus/evidence/round-16/webmcp/runtime-pin.json`), so do not imply the 152
build was tested; (ii) the census's U3 names `navigator.modelContext` prospectively; the
round-16 finding is the opposite global (`document.modelContext`), which is a versioned
probe result, not a census error.

## 8. Contradictions and risks (stated, not smoothed)

1. **Draft says the frontier is not addressed** — `.ufo/waves/round-16/drafts/DraftNote.md`
   §Limits: "PLAN's 'Chromium 152 unprobed' frontier is not addressed here." This
   contradicts C2's own held-entry claim and `corpus/README.md:181`. Replace with L6's
   sentence; do not leave both.
2. **Harness missing at read time** — `ls scripts/webmcp-loopback-round16.mjs` →
   `No such file or directory` (only `scripts/aria-loopback-round13.mjs` exists). Nothing in
   L1/L5 may be written in the past tense as executed; isolation, abort and closure are
   obligations until `corpus/evidence/round-16/webmcp/receipt.json` exists with
   `summary.failed == 0`.
3. **Runtime pin now exists** — `corpus/evidence/round-16/webmcp/runtime-pin.json` exists,
   so the draft's "executable sha256 is [UNK] until the runtime pin exists" is stale. The
   Playwright/browser identity in L4 must come from that file, not from the aria note.
4. **`/json/protocol` is not in the round-1 HTTP surface** — do not write that the CDP note
   covers it; L1's sentence says "extends".
5. **No new BiDi row** — L3 deliberately says the matrix is unchanged; `ConnBidiWebmcp`
   may propose otherwise, but an edit there is an append-only historical correction outside
   this note's write scope.

## 9. Verification performed (read-only; commands and observed outputs)

- `ls corpus/knowledge/*.md | wc -l` → 32; the five named notes present
  (`aria-loopback-round-13.md`, `chrome-remote-debugging-profile-boundary.md`,
  `webdriver-bidi-capability-matrix.md`, `playwright-accessible-locators-and-snapshots.md`,
  `cdp-evidence-patterns.md`).
- `grep -n '^#'` on the five notes → section headings and line starts recorded in §2–§7
  (e.g. `cdp-evidence-patterns.md:79` = `## 5. …`, `:94` = `## 6. Cleanup recipe …`).
- `awk 'NR>=79 && NR<=108'` on `cdp-evidence-patterns.md` → rules 1–9 at `:84-92`;
  `:90` rule 7, `:91` rule 8, `:92` rule 9; §6 `:94-105`.
- `grep -n 'public or supported API'` on the profile-boundary note → `:76` and `:92`;
  matrix rows `:46-52`; session boundary `:70-75`.
- `grep -n 'Choose the transport'` on the BiDi note → `:80`; matrix begins `:54`,
  `locally measured: no` `:56`, decision rule heading `:78`.
- `grep -n 'Playwright1.64.0'` on the Playwright note → `:158`; §8 heading `:146`;
  §2 heading `:31`.
- `awk 'NR>=37 && NR<=46'` on the aria note → isolation heading `:39`, body `:41`,
  bounded-claim heading `:43`, body `:45`.
- `awk 'NR>=145 && NR<=154'` on the census → §3.4 heading `:145`, quotes `:147-153`;
  U3 read separately at `:188-189`.
- `awk 'NR>=175 && NR<=196'` on `corpus/README.md` → frontier rows `:181` and `:194`;
  `:35` read separately.
- `ls -la scripts/webmcp-loopback-round16.mjs` → exit 2, "No such file or directory";
  `scripts/aria-loopback-round13.mjs` → 32,177 B, executable.
- Fixtures read (`corpus/evidence/round-16/webmcp/fixtures/declarative-form.html`,
  `README.md`) → `<label>Query <input type="text" name="q"></label>`, expected schema
  properties `q`, `category`, `sort`.

Not run, by contract: no browser, no harness, no gate, no selftest, no counter, no commit,
no external fetch. No tool installed or upgraded.

## 10. Handoff to L1

Insert L2, L3, L4 in §Scope (profile, transport, driver), L1 where channels/provenance are
recorded, L5 in §Limits and unknowns, and L6 in place of the "not addressed" line. Then
re-run the draft's own recheck step 4 (`node scripts/webmcp-loopback-round16.mjs`,
`receipt.json.summary.failed == 0`) before any sentence is promoted from obligation to
observation. This report is author-side advice, not certification.
