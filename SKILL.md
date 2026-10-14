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

## Sources pinned (round-1 notes)

sha256 first 12 (`sha256sum corpus/knowledge/*.md`, 2026-10-14):
`webbridge-plugin-anatomy.md` `49f0735b0594` ·
`browser-surface-census.md` `9e4d69dcd658` ·
`cdp-evidence-patterns.md` `034b1e53b004`. A hash change means the citations
below are stale — re-verify against the note before reusing.

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
