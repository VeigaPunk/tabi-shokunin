---
name: tabi-shokunin
description: Domain specialist — browser & web-interaction craft. Rank: shonen (probation).
---

# tabi-shokunin

browser & web-interaction craft playbook. Probation seed — rounds 1-3 build the corpus from
measured surfaces; every rule below must earn a cited source before it
counts. Nothing here is oral knowledge.

## Standing rules

- Read-only substrates unless PROVINCE.md declares a write surface;
  detection-and-report for operator-owned remediation.
- Secrets shape-only, never content-read.
- Every claim: measured anchor (path:line, command output, evidence id).
  Observation / inference / unknown stay separate.
- Errata append-only; rejections kept.

## Sources pinned (round-1 notes; refreshed 2026-10-14, TABI-SCRIBE, after the round-2 errata appends)

sha256 first 12 (`sha256sum corpus/knowledge/*.md`, 2026-10-14):
`webbridge-plugin-anatomy.md` `5e0fbe35feea` ·
`browser-surface-census.md` `70d1d455ee18` ·
`cdp-evidence-patterns.md` `599e7d323c48`. A hash change means the citations
below are stale — re-verify against the note before reusing. History: the
round-1 pins `49f0735b0594`/`9e4d69dcd658`/`034b1e53b004` matched the
committed round-1 blobs — scribe re-derived all three from `7961735` — and the
round-2 errata are pure appends on top (each errata header records its
pre-append hash; nothing above an append point was edited).

## Interaction-evidence decision table

Capture by claim class. Every record also carries the envelope below, or the
claim is not re-verifiable.

| Claim class | Capture | Record | Determinism | Source |
|---|---|---|---|---|
| **Visual** — "the page renders X" | webbridge `screenshot` → file path (never base64); read it back. Raw form: CDP `Page.captureScreenshot {format:"png", captureBeyondViewport:true}` | PNG file + sha256 + byte count + W×H; note that it was read back visually | byte-stable for static content *in this environment*; environment-scoped — do not generalize to real pages or other builds | `corpus/knowledge/webbridge-plugin-anatomy.md:84-85,106-108`; `corpus/knowledge/cdp-evidence-patterns.md:68-72`; determinism cross-ref `kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:130-131` |
| **State** — "the DOM has X / the value is Y" | webbridge `snapshot` (accessibility tree, `@e` refs) first; `evaluate` only for refs/attrs it lacks. Raw form: CDP `DOM.getDocument {depth:-1}` + `DOMSnapshot.captureSnapshot` | method + params; `strings` table or resolved excerpts (raw node fields are indices, not values); node count; URL + title | stable at capture; target `id` is per-launch — re-identify the target by URL/title | `corpus/knowledge/webbridge-plugin-anatomy.md:81-83,109-111`; `corpus/knowledge/cdp-evidence-patterns.md:52,66,75,77,87` |
| **Network** — "the page fetched X / got Y" | webbridge `network` (start\|stop\|list\|detail); a real recorded HAR (Playwright `recordHar` precedent); REA connect-mode `capture:{events:["network"], network:{response_body:true}}` | entries + bodies only if explicitly requested (`response_body` defaults false); dropped count; name the producer channel | time-varying — assert as-of-capture with the snapshot attached | `kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-01-queue-ops.md:23-25`; `kaidoku-shokunin/corpus/knowledge/2026-10-14-r11-01-queue-ops.md:29-32`; tool list `corpus/knowledge/webbridge-plugin-anatomy.md:85` |

Trap on the network row: a `chromium --log-net-log` netlog is **not** a valid
HAR — typed refusal `"HAR schema validation failed: required."`
(`kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-01-queue-ops.md:116,133-135,265`).

Action-effect claims ("clicking X changed Y"): capture a **before/after pair**
of whichever class the effect lives in. `click` is synthetic `el.click()` and
`fill` is clear-and-insert, so the call's success return is not the evidence
(`corpus/knowledge/webbridge-plugin-anatomy.md:81-87`;
`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:20-21,117-121`).

Egress caveat whenever a network claim needs "no traffic": a loopback debug
endpoint is not a quiet browser — a fresh headless profile still emitted Google
GCM egress (`corpus/knowledge/cdp-evidence-patterns.md:36`);
`--disable-background-networking` is untested (`:115`).

### Record envelope (all classes)

From `corpus/knowledge/cdp-evidence-patterns.md:84-92`:

1. URL + exact navigation input, verbatim (whole document for `data:` URLs).
2. Browser provenance in **effective** form — chromium version + the child
   process line, not the typed command; host launchers inject flags
   (`:18,30-32,85`).
3. Session slot: capture time (UTC + local), browser WS endpoint, target
   `id` + `frameId`; ids are per-launch.
4. Evidence bytes + hash + the method/params that produced it.
5. Determinism class per artifact (byte-stable vs time-varying).
6. Cross-checks: prefer two independent surfaces agreeing (`/json/list` title
   vs `document.title`; DOM node count via two methods) — disagreement is
   usually staleness, not contradiction.
7. Name the channel that produced each fact: HTTP `/json/*`, browser-level
   protocol, page-level protocol, or browser log.
8. Cleanup proof: pre-kill listening line + post-kill refusal; kill by explicit
   PID — `pkill -f` self-matched the invoking shell (`:105`).
9. Archive or it didn't happen: `/tmp` hashes are only verifiable while `/tmp`
   lives; copy bytes to durable storage before citing (`:92`).

## Session-material discipline (shape-only)

- Session material — cookies, tokens, login state, profile stores — is never
  content-read; report shape only (kind, mode, size, mtime)
  (`corpus/knowledge/browser-surface-census.md:3-8,52-57`;
  `corpus/knowledge/webbridge-plugin-anatomy.md:156-159`).
- Measured precedent: `identity.json` 36 B mode 600, not read
  (`corpus/knowledge/webbridge-plugin-anatomy.md:156-159`;
  `corpus/knowledge/browser-surface-census.md:140`); `Cookies`/`Login Data`
  listed by byte size only (`:54`); daemon logs reported names/sizes/mtimes
  only — they may hold user page URLs
  (`corpus/knowledge/webbridge-plugin-anatomy.md:158-159`;
  `corpus/knowledge/browser-surface-census.md:140-141,190-191`).
- The bridge drives the user's **real** browser with their login sessions
  (`~/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json:5,20`);
  borrowing stays visible: `find_tab active:true` borrows the user's viewed tab
  (`borrowed:true`) and does not move it
  (`corpus/knowledge/webbridge-plugin-anatomy.md:91-96`).
- One task = one session = one tab group; never switch sessions mid-task
  (`corpus/knowledge/webbridge-plugin-anatomy.md:101-105`); closing is
  user-initiated only
  (`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:87`).
- Windows: request bodies as uniquely-named temp files via `curl.exe
  --data-binary`, deleted after return — inline/heredoc bodies corrupt
  non-ASCII irrecoverably and must not linger on disk
  (`corpus/knowledge/webbridge-plugin-anatomy.md:97-100`).
- Only evidence artifacts (screenshots, DOM snapshots, HARs) enter the corpus;
  session material never does.

## Rights / rate boundary

- **Scope:** observation + operator-approved interaction only; never
  consequential external actions (purchases, posts, deletions)
  (`PROVINCE.md:15-19`; `MINT.md:19-20`). Refuse-and-route: RE forensics →
  revenger/kaidoku; publishing → kake; secrets → kagi (`PROVINCE.md:15-17`).
- **Loopback-first evidence:** wave captures used a self-launched browser +
  loopback fixture only (a `data:` URL here; CDP :9232 + `http.server` :8891 in
  the network-capture precedent), ports verified closed at cleanup
  (`corpus/knowledge/cdp-evidence-patterns.md:6,20-34,94-103`;
  `kaidoku-shokunin/corpus/knowledge/2026-10-14-r11-01-queue-ops.md:285-294`).
- **Bounded runs:** probes under explicit `timeout 45–180`, 0.85–1.1 s each
  (`kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-01-queue-ops.md:1`). No
  measured live-site rate limit or ToS surface exists in the probation notes —
  do not assert one; record it when measured.
- **Anti-bot surfaces are a stop, not a puzzle:** `isTrusted`-checking sites
  (banking portals, captchas) ignore synthetic `click`/`fill` — hand the page
  back to the user; trusted input via the `cdp` escape hatch is advanced and
  needs operator approval (`corpus/knowledge/webbridge-plugin-anatomy.md:120-122`;
  `~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:146`).
- **Version mismatch:** never reconcile daemon/extension versions yourself —
  tell the user to update and retry
  (`corpus/knowledge/webbridge-plugin-anatomy.md:124-127`).
- **Daemon lifecycle is operator-owned:** `start` is the documented recovery
  for a connection-refused call, but the corpus-builder posture leaves it
  untouched (`corpus/knowledge/webbridge-plugin-anatomy.md:136-138`); never
  `stop`/`restart`/`uninstall`
  (`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md:24-26`;
  `corpus/knowledge/webbridge-plugin-anatomy.md:133`).

## Sources pinned (round-2 notes)

sha256 first 12 (`sha256sum corpus/knowledge/*.md`, 2026-10-14):
`live-dynamic-capture.md` `56224aa88430` · `webbridge-daemon-disposition.md`
`9240f1d66a8c`. Same staleness rule as the round-1 block: a hash change means
the citations below are stale — re-verify against the note before reuse. Both
notes' evidence bytes are `/tmp`-staged (`corpus/knowledge/live-dynamic-capture.md:1`)
— the archive obligation stands (`corpus/knowledge/cdp-evidence-patterns.md:92`).

Staleness watch — the three round-1 notes carry end-appended errata
(2026-10-14, lane TABI-R2-3): their `:23-27` pins are stale until the
integrating round refreshes them; the round-1 line refs still cited below all
predate the append points. One erratum bites this section directly:
`corpus/knowledge/cdp-evidence-patterns.md:139-150` corrects record-envelope
item 1 — `url` holds the URL as-normalized, so record the as-read-back string
alongside the exact navigation input.

## Page-claim evidence ladder (round 2)

Per-claim-class capture mechanics stay in the decision table above (`:29-48`);
this ladder orders how strong the evidence under a claim is. Climb to the rung
the claim needs — and never present a lower rung as support for a higher one.
Every rung still carries the 9-item record envelope
(`corpus/knowledge/cdp-evidence-patterns.md:79-92`).

| Rung | Evidence captured | Supports | Measured anchor |
|---|---|---|---|
| 1 — **static bytes** | sha256-identical artifact, plus a re-capture proving the capture operation idempotent | "the page renders X" when the content is frozen | det-before PNG byte-identical within a run (350 ms apart) and across two independent server+browser processes — the capture is idempotent on a quiescent page (`corpus/knowledge/live-dynamic-capture.md:66-67,107-110`) |
| 2 — **dynamic capture** | before/after pair under sha-pinned methodology and state-waits; the volatile class captured too | action-effect claims — "clicking X changed Y"; JS-produced states | det-after PNG byte-identical across runs when the resulting state is fixed, even after JS-driven DOM mutation plus real input; DOM-shape delta 55→65 nodes fully accounted (`corpus/knowledge/live-dynamic-capture.md:68,96-101,113-114`) |
| 3 — **multi-signal** | two or more independent signals agree (screenshot read back visually, DOM shape, protocol metadata; two full independent runs) | claims where a single channel alone could be wrong or stale | visual read-back matches the authored fixture; every fixed-state artifact agreed across two full runs; shape *struct* survives liveness while shape *text* does not (`corpus/knowledge/live-dynamic-capture.md:60-73,91-94,124-127`) |

Capture rules earned this round (`corpus/knowledge/live-dynamic-capture.md:151-173`):

- Split the page by determinism class before capturing; freeze what can be
  frozen, but capture the volatile class too — a determinism claim without its
  counterexample is unfalsifiable (`:156-159`).
- Wait on state, never on time; the wait predicates live in the sha-pinned
  script, so "the capture waited correctly" is itself re-checkable (`:160-163`).
- Pin methodology bytes (fixture + capture script + driver) so "same
  methodology" is a sha256 verification, not a promise (`:52-56,164-165`); pin
  the viewport explicitly via `Emulation.setDeviceMetricsOverride` so
  screenshots carry their own geometry (`:44-50,166-167`); idempotence-check
  the capture operation (`:167-168`).
- Keep the differing pair as evidence: document the boundary by measurement on
  both sides (`:172-173`).

## Determinism boundaries (measured, round 2)

**Byte-reproducible in this environment** (verified across two full runs —
`corpus/knowledge/live-dynamic-capture.md:105-120`): fixture bytes; det-before
PNG (within-run and across runs); det-after PNG when the resulting state is
fixed; DOM-shape (full text for deterministic captures, struct-only for
*every* capture, including the live page); protocol metadata (Browser
`Chrome/152.0.7977.82`, Protocol-Version `1.3`).

**Not byte-reproducible** (`corpus/knowledge/live-dynamic-capture.md:122-138`):
screenshots of a live page (nd1 vs nd2 differ within a run; nd1 differs across
runs — shape *text* differs, *struct* does not); session slots per launch
(target ids, browser ws uuids — match targets by URL/type, never id,
`corpus/knowledge/cdp-evidence-patterns.md:48`); wall-clock stamps; browser
background behaviour (the two runs' GCM traces differ under identical flags).

**The boundary rests on**: same chromium build, same effective flag set
(record the child line), same viewport override, same fixture bytes, same
capture parameters, same wait predicates, same host font rendering —
environment-scoped; not measured beyond this host/build
(`corpus/knowledge/live-dynamic-capture.md:140-149`;
`corpus/knowledge/cdp-evidence-patterns.md:72` caveat stands). This closes
`corpus/knowledge/cdp-evidence-patterns.md:116` (round-1 §7.8) **for fixtures
whose rendered state is deterministic**, and refutes extending byte-identity
to time-varying DOM text (`corpus/knowledge/live-dynamic-capture.md:146-149`).

No-egress claims: `--disable-background-networking` was tested this round and
did **not** stop the GCM registration machinery from attempting/logging
traffic — the flag alone is not sufficient for a no-egress claim
(`corpus/knowledge/live-dynamic-capture.md:190-200`; narrows
`corpus/knowledge/cdp-evidence-patterns.md:115`).

## Approval discipline — what requires the awake operator

| Action | Authority | Anchor |
|---|---|---|
| Start the webbridge daemon (connection refused) | **Self-service — authorized by the substrate's own docs**; idempotent, local-only, no sudo / systemd unit / config edit | `~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md:11-13`; `corpus/knowledge/webbridge-daemon-disposition.md:38-42,52-55,160` |
| `stop` / `restart` / `uninstall` the daemon | **Operator only — agent blocked**: never agent-run; ask the user to run `~/.kimi-webbridge/bin/kimi-webbridge stop` by hand (or manage it via the Kimi Desktop App) | `operations.md:24-26`; `corpus/knowledge/webbridge-daemon-disposition.md:43-45,161` |
| Return an agent-started daemon to baseline | **Operator action** — the docs define no TTL / cleanup / scratch mode for an agent-started daemon; the one started this round (pid 3934817, `127.0.0.1:10086`) is left running and recorded as a state change | `corpus/knowledge/webbridge-daemon-disposition.md:56-62,165-169` |
| External-site interaction | **Operator approval required**; approval was absent this round (operator asleep), so capture was loopback-only by rule | `plans/round-2.plan.md:8-9`; `corpus/knowledge/live-dynamic-capture.md:5-7,216-217` |
| Trusted input via the `cdp` escape hatch (sites checking `isTrusted`) | Advanced; operator approval | `~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:146` |
| Driving the user's browser via webbridge | **Condition, not authority**: requires the extension connected (`extension_connected:true`); with none attached the daemon cannot drive the user's browser (no browser main process observed; causal reading [inference]) | `corpus/knowledge/webbridge-daemon-disposition.md:133-134,145-150,162` |
| Reusing daemon state in a later round | Recheck live state first (listener scan + `/status`), then reuse; no unit, no autostart — lifespan bounded by the user session [inference, medium] | `corpus/knowledge/webbridge-daemon-disposition.md:107-112,163` |

- Live-state recheck commands before any reuse:
  `ss -ltnp | grep 10086`, then `curl -s http://127.0.0.1:10086/status`
  (`corpus/knowledge/webbridge-daemon-disposition.md:163`).
- `/status` probing: only a daemon this task itself started is probed; the
  observed response has 8 fields — `extension_version`, `port`, `skills`,
  `tab_id_arg` extra over the 5 documented (`operations.md:28-34`); an empty
  `extension_id` is "no value present", never session material
  (`corpus/knowledge/webbridge-daemon-disposition.md:122-139`).
- **Supersession (round 2):** the round-1 bullet "the corpus-builder posture
  leaves [start] untouched" (`:129-134` above) is superseded as live posture —
  start was doc-authorized under the round plan and executed; the
  no-`stop`/`restart`/`uninstall` prohibition stands. Both readings of the
  start authority stay on record for the scribe
  (`corpus/knowledge/webbridge-daemon-disposition.md:63-69`).
