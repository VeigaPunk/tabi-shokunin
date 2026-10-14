# tabi-shokunin — corpus

## Coverage map

Held at round 2 (2026-10-14): 5 knowledge notes, 1134 lines —
`ls corpus/knowledge/*.md | wc -l` → 5; `wc -l corpus/knowledge/*.md` →
237 / 177 / 220 / 236 / 264. Lessons: 0 — `ls -A corpus/lessons | wc -l` → 0.
A row is written when its file exists, never before (CORPUS.md:45-47).

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webbridge-plugin-anatomy.md` | Substrate contract for the lane's primary surface: the kimi-webbridge plugin is a 3-file / 216-line declarative package (no vendored code); manifest↔skill version consistency (`1.11.3`); 14-tool call surface with tab/session/screenshot/selector/fill semantics and failure routing; daemon `127.0.0.1:10086` ops — recovery order, the no-autonomous-`stop`/`restart`/`uninstall` prohibition, `/status` fields; daemon measured not running at capture (stale pid file, no listener). | read-only inspection; re-run anchors in-note §8 (grep/wc/sha256). Scribe re-ran §8.1–8.4 on 2026-10-14 — all held. Round-2 errata appended (re-run block, U3 partial resolution, daemon-live supersession, start-authority tension pointer); post-append pin `5e0fbe35feea` |
| `knowledge/browser-surface-census.md` | Host browser inventory (chromium 152.0.7977.82-1 the only real install; measured absences for Firefox/Brave/Chrome/Vivaldi et al., rejection kept); profile trees reported shape-only (mode/du/mtime; `Cookies`/`Login Data` sizes, never content); 1Password NMH shells across chrome-family config dirs; webbridge daemon + MCP config state; live headless-chromium runtime snapshot (transient). | shell census per row, §1–§4 (command → output). Scribe re-ran the Brave-negative and the version-consistency admit on 2026-10-14 — both held. Round-2 errata appended (off-by-4 `operations.md` cite corrected, anchors re-run, daemon-live supersession, U5 status); post-append pin `70d1d455ee18` |
| `knowledge/cdp-evidence-patterns.md` | Re-runnable loopback CDP session (TABI-3): launch recipe + effective-child-line provenance (host launcher injects flags); `/json/version`, `/json/list`, `Target.getTargets` field surfaces; screenshot + DOM evidence with determinism classes (E1–E11); the 9-item page-claim re-verifiability envelope; cleanup proof + the `pkill -f` self-match incident kept as calibration. Round-2 errata appended (see row's §8): root `backendNodeId` is per-capture; `url` holds the as-normalized navigated URL; screenshot determinism re-held a third time cross-session; the launch-window extension-target sighting downgraded to non-replayable. | evidence ids E1–E11 in-note (commands + hashes). Scribe re-ran :36/:105/:84-85 anchors on 2026-10-14 — all held. Post-append pin `599e7d323c48` |
| `knowledge/live-dynamic-capture.md` *(round 2, TABI-R2-1)* | Live dynamic-page evidence: loopback `http.server` fixture with JS hydration + click mutation captured before/after through CDP, twice with byte-identical (sha-pinned) methodology; the determinism boundary measured on both sides — det-before/det-after PNGs byte-identical across two independent server+browser runs even after JS mutation + real input, live-page captures differ while the DOM-shape struct survives; 7 new capture rules (determinism-class split, state-waits, methodology-byte pins, explicit viewport, capture idempotence, loopback ≠ no-egress — GCM attempts logged despite `--disable-background-networking`, keep the differing pair); cleanup proven per run. | methodology + artifact sha pins in-note §1–§3; scratch staged `/tmp/tabi-r2-1-capture/` (volatile — archive owed). Scribe re-hashed run1/run2 det PNGs (`c08947dc…802dc1` / `7488d544…4b42c7`) and all four methodology shas 2026-10-14 — all match; ports 19411/19412 closed, no chromium survivors |
| `knowledge/webbridge-daemon-disposition.md` *(round 2, TABI-R2-2)* | Daemon lifecycle authority + measured disposition: `start` doc-authorized (`operations.md:11-13`) and executed — pid 3934817 listening `127.0.0.1:10086`; `stop`/`restart`/`uninstall` agent-forbidden (`operations.md:26`) → daemon left running as a recorded state change, operator stop named (D2); `/status` probed iff-conditioned — 8 fields vs the 5 documented, `extension_connected:false` (no session material ever present); `/command` auth not probed by rule; pre-run shape captured (stale pid 37800, `identity.json`/`logs/` shape-only). | disposition rows D1–D4 + §8 check sequence in-note. Scribe re-ran `ss -ltnp` + `/status` on 2026-10-14 — pid and 8-field shape match; substrate pins `84a8e69d04c5`/`b811d9c23dfd` re-verified unchanged |

## Frontier

Entered or named, not yet held (the notes' enumerated unknowns — anatomy
U1–U4, census U1–U5, cdp §7 items 1–8, live-dynamic-capture §7 items 1–7,
daemon-disposition U1–U7; several partially resolved by the round-2 errata):

- Extension↔daemon link — daemon lifecycle + `/status` shape now held
  (round 2), but the handshake is not: `extension_connected:false`
  throughout (disposition §5); `skills`/`tab_id_arg` semantics (U1), bundle
  `1.11.3` vs daemon/extension `2.0.23` reconciliation (U6), `/command`
  auth (U7, unprobed by rule).
- Native WebMCP in chromium 152 — unprobed (census U3).
- Site-interaction records: no measured rate limit or ToS surface exists —
  `SKILL.md:118-120` forbids asserting one unmeasured; record when measured.
  Round-2 anti-claim held: no external sites, loopback only (operator
  approval absent, `plans/round-2.plan.md:8-9`).
- Evidence-byte archival — staged `/tmp` dirs now four: `tabi3-cdp/`
  (round 1), `tabi-audit2-cdp/` (wave-1 audit), `tabi-r2-1-capture/`
  (round-2 capture pair), `tabi-r2-3-verify/` (errata transcripts);
  hashes are verifiable only while `/tmp` lives
  (`cdp-evidence-patterns.md:92`).

## Quality bar

See `QUALITY.md` (admits only falsifiable, source-cited claims;
rejection kept as evidence of taste).
