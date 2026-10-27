source: S144 — Playwright Browsers docs, https://playwright.dev/docs/browsers
verified-at: round 38, Playwright 1.64.0, Firefox 157.0
recheck: run `node scripts/playwright-firefox-loopback-round38.mjs --out <receipt> --runs 2`; compare run first-screenshot hashes, egress, survivors and step results

# Playwright Firefox loopback evidence — round 38

Playwright's Firefox is a patched browser build and is not the branded Firefox executable (Playwright Browsers docs, §Firefox). This host ran Firefox 157.0 through Playwright 1.64.0's Juggler transport against the driver's embedded 800×600 loopback fixture. The source describes Playwright's supported Firefox build and CLI browser installation.

The committed demonstration is `corpus/evidence/round-38/playwright-firefox/receipt.json`; driver: `scripts/playwright-firefox-loopback-round38.mjs`. Two cold runs produced identical first screenshot sha256 `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`; both recorded 0 non-loopback socket observations and 0 surviving Firefox PIDs. The receipt contains per-step navigation, title/DOM, pointer interaction, screenshots, history, request/response, and console observations. This is a host/build-scoped loopback demonstration, not a cross-platform or real-site claim.
