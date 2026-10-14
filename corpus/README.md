# tabi-shokunin — corpus

## Coverage map

Held at round 1 (2026-10-14): 3 knowledge notes, 539 lines —
`ls corpus/knowledge/*.md | wc -l` → 3; `wc -l corpus/knowledge/*.md` →
197 / 119 / 223. Lessons: 0 — `ls -A corpus/lessons | wc -l` → 0. A row is
written when its file exists, never before (CORPUS.md:45-47).

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webbridge-plugin-anatomy.md` | Substrate contract for the lane's primary surface: the kimi-webbridge plugin is a 3-file / 216-line declarative package (no vendored code); manifest↔skill version consistency (`1.11.3`); 14-tool call surface with tab/session/screenshot/selector/fill semantics and failure routing; daemon `127.0.0.1:10086` ops — recovery order, the no-autonomous-`stop`/`restart`/`uninstall` prohibition, `/status` fields; daemon measured not running at capture (stale pid file, no listener). | read-only inspection; re-run anchors in-note §8 (grep/wc/sha256). Scribe re-ran §8.1–8.4 on 2026-10-14 — all held |
| `knowledge/browser-surface-census.md` | Host browser inventory (chromium 152.0.7977.82-1 the only real install; measured absences for Firefox/Brave/Chrome/Vivaldi et al., rejection kept); profile trees reported shape-only (mode/du/mtime; `Cookies`/`Login Data` sizes, never content); 1Password NMH shells across chrome-family config dirs; webbridge daemon + MCP config state; live headless-chromium runtime snapshot (transient). | shell census per row, §1–§4 (command → output). Scribe re-ran the Brave-negative and the version-consistency admit on 2026-10-14 — both held |
| `knowledge/cdp-evidence-patterns.md` | Re-runnable loopback CDP session (TABI-3): launch recipe + effective-child-line provenance (host launcher injects flags); `/json/version`, `/json/list`, `Target.getTargets` field surfaces; screenshot + DOM evidence with determinism classes (E1–E11); the 9-item page-claim re-verifiability envelope; cleanup proof + the `pkill -f` self-match incident kept as calibration. | evidence ids E1–E11 in-note (commands + hashes). Scribe re-ran :36/:105/:84-85 anchors on 2026-10-14 — all held |

## Frontier

Entered or named, not yet held (the notes' 17 enumerated unknowns — anatomy
U1–U4, census U1–U5, cdp §7 items 1–8):

- Live daemon interaction — endpoint down at census (`ss -ltn | grep 10086` →
  empty); `/status` shape, binary version, extension↔daemon link unverified
  (anatomy §6 + U2/U3; census §3.3 + I2).
- Native WebMCP in chromium 152 — unprobed (census U3).
- Site-interaction records: no measured rate limit or ToS surface exists —
  `SKILL.md:118-120` forbids asserting one unmeasured; record when measured.
- Evidence-byte archival — TABI-3's session artifacts are staged in
  `/tmp/tabi3-cdp/` (ephemeral); hashes are verifiable only while `/tmp`
  lives (`cdp-evidence-patterns.md:92`).

## Quality bar

See `QUALITY.md` (admits only falsifiable, source-cited claims;
rejection kept as evidence of taste).
