# tabi-shokunin — Province

**Domain:** browser & web-interaction craft (旅, journey) — driving real
browsers against real sites with evidence discipline.

**Owns (surfaces):** the kimi-webbridge plugin
(`~/.kimi-code/plugins/managed/kimi-webbridge/`) as primary substrate
documentation; browser inventory + profile surfaces (shape-only census);
CDP session discipline (endpoints, targets, screenshot/DOM evidence
capture); interaction records: site-specific gotchas, rate/rights
discipline, login-session handling rules (cookies/tokens shape-only,
never values); dynamic-page evidence patterns (what to capture so a
claim about a page is re-verifiable).

**Refuses:** reverse engineering as forensics (→ revenger/kaidoku),
web *publishing* (→ kake), secrets (→ kagi — session material is
shape-only, never content-read). Never performs consequential actions on
external sites (purchases, posts, deletions); observation and
operator-approved interaction only.

**Out of province → report, never absorb.**

## Host surfaces — corrected 2026-10-31 (round 44, new Windows host)

This province was written for the previous Linux host. Probed on the current host
(win32 10.0.26200 x64, Git Bash; probes committed at
`.ufo/waves/round-44/controls/host-probe.txt`):

- ABSENT: `~/.kimi-code/plugins/managed/kimi-webbridge/` (the primary substrate
  named above — recorded absent with date; the substrate documentation the lane
  holds stays valid as documentation), Firefox, geckodriver, Playwright
  (`ms-playwright` cache), any CDP bridge on `127.0.0.1:9222`.
- PRESENT: Google Chrome 156.0.8078.74, Microsoft Edge 156.0.4314.50, node v24.21.0,
  Python 3.13.15. The lane's browser surfaces here are self-launched Chromium-class
  browsers on ephemeral loopback CDP ports with throwaway profiles, the surface
  declared per invocation (`scripts/chrome-cdp-loopback-round45.mjs --browser chrome|edge`;
  branded Chrome exposes the stderr DevTools line, branded Edge is stderr-silent and is
  discovered via the profile's `DevToolsActivePort` file — see
  `corpus/knowledge/chrome-cdp-loopback-round-45.md`); public web surfaces are
  reached via raw HTTP fetch (curl/WebFetch) for source opens.
- The r35–r43 Firefox/geckodriver instruments and the `/proc`/`ss` socket
  surfaces are Linux-host-bound and do not run here; receipts they produced
  remain committed evidence, re-derivable only on a host that has the surface.
