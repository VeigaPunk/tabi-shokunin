# WebmcpRuntimePin — round 16 wave 1 report

Owned file written: `corpus/evidence/round-16/webmcp/runtime-pin.json` (new, 2002 bytes, `sha256` available on request).

## Captured values (all observed this session, 2026-10-20)

- `/usr/bin/chromium --version` → exit 0, stdout `Chromium 154.0.8037.97 Arch Linux`
- `sha256sum /usr/lib/chromium/chromium` → `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`
- `pacman -Qi chromium` (read-only query, no transaction) → `Version : 154.0.8037.97-1`, `Build Date : Fri 09 Oct 2026 07:41:57 AM -03`
- `node --version` → `v24.21.0` (via fnm)
- `npm root -g` → `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules`
- `playwright` → version `1.64.0`, package.json at `<npm root -g>/playwright/package.json`
- `playwright-core` → version `1.64.0`, nested at `<npm root -g>/playwright/node_modules/playwright-core/package.json` (NOT a top-level global package — `createRequire` from a repo script resolves `playwright`; `playwright-core` resolves via playwright's own node_modules)
- Playwright bundled `chromium-1248` → exists at `/home/vgpnk/.cache/ms-playwright/chromium-1248` (siblings `chromium_headless_shell-1248`, `ffmpeg-1013`). NOT used by the harness — it launches system `/usr/bin/chromium` 154.0.8037.97.

## Implications for WebmcpHarness (`scripts/webmcp-loopback-round16.mjs`)

- Global resolution: `createRequire(import.meta.url).resolve('playwright')` works only if the repo script's resolution chain reaches the fnm global root — global npm root is NOT on default ESM resolution; the round-13 aria pattern uses an explicit global-root path join. Pin records the exact root so the harness can join `playwright` / `playwright-core` directly.
- Chromium launch target: `/usr/bin/chromium` (system 154.0.8037.97), executable sha256 `95b17db7…` — matches L1 pre-probe values in PLAN.md; runtime has not drifted since planning.
- receipt.json `runtime` block can copy verbatim: chromium `154.0.8037.97`, sha256 above, playwright `1.64.0`, node `v24.21.0`.

## Shape-only compliance

No browser profile contents read/copied; only binary paths, digests, package versions, pacman query output. No installs, upgrades, or pacman transactions performed (pacman pause honored; query-only `-Qi` run). No subagent dispatched; no build/lint/test gates run (verification is L1's post-integration step).

## Risks / blockers

None. Pacman `Build Date` is `-03` tz — pin records the literal string. fnm-managed node means global root moves if node version changes; the recorded path is absolute and current.
