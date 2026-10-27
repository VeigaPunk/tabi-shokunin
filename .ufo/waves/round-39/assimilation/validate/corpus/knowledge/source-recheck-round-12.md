source: S028 https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/devtools/remote_debugging_server.cc (§TCPServerSocketFactory, §TCPServerSocketFactoryWithPortFallback, GetInstance; opened 2026-10-20); S011 https://developer.chrome.com/blog/firefox-support-in-puppeteer-with-webdriver-bidi (intro and CDP support in the future); S013 https://playwright.dev/docs/test-retries (§Retries); S017 https://playwright.dev/docs/release-notes (Version 1.64)
verified-at: 2026-10-20 — documentation/source inspection only; bounded claim checks in corpus/evidence/round-12/source-recheck.json and its linked seat reports
recheck: on Chromium/Playwright major release, or 90d — reopen the located sections below, compare each asserted claim, preserve any disagreement and keep runtime status separate

# Round 12 — corrections and limits from source-claim rechecks

This note supersedes only the named claims below. Historical notes and captures remain
unaltered. A hash pins the note reviewed, not the truth of its claims. Sources whose
HTML changes are checked by located quotation, not rejected merely for a different digest.
No browser, BiDi session, or Playwright runner was launched. These are author-side reviews,
not independent non-author verification.

## Profile boundary — correction to socket-factory attribution

Supersedes `chrome-remote-debugging-profile-boundary.md:41` insofar as its singular
"factory ... with fallback" conflates address retry with port fallback.

- [OBSERVATION: SOURCE] `TCPServerSocketFactory` (S028, .cc:69–111) tries IPv4 loopback
  then IPv6 loopback at the requested port. Its HTTP method returns
  `CreateLocalHostServerSocket(port_)`; it does not retry an ephemeral port.
- [OBSERVATION: SOURCE] `TCPServerSocketFactoryWithPortFallback` (.cc:113–158) adds a
  port-zero retry. The comment states: "Prefers a free port over switching from IPv4 to IPv6."
  It is used by approval mode (.cc:235–250), not the command-line port path (.cc:384–395).
- [INFERENCE] Both inspected classes bind loopback; that source conclusion is not a
  fresh observation of a listener on this host. The runbook's isolated profile rule stays mandatory.

Scope clarification to the note's :38–40 and boundary matrix: its no-listener inference
is about the two `--remote-debugging-*` switch paths. It is not a universal refusal of
all remote-debugging startup paths. `GetInstance` .cc:397–417 also has feature/pref-gated
approval mode; source comment: "In approval mode, each incoming connection needs to be approved by the user".
Whether that feature is enabled in the installed binary is unknown. This is not authority
to enable it or inspect the user's profile.

The original note's own matrix heading already scopes its rows to the switches.
The stronger critic interpretation that the matrix itself claimed all startup modes is
therefore rejected; the explicit clarification prevents that reading without inventing a
new measured capability. CfT's exemption mechanism and the exact historical Chromium
commit remain unverified here; branch text plus the retained source digest is the evidence.

## BiDi — rejecting a proposed false correction

A reviewer proposed changing `webdriver-bidi-capability-matrix.md:46–47` because it says
Puppeteer's Chrome CDP support "remained unchanged". Reopening S011 on 2026-10-20 found
that exact statement in its introduction: "Puppeteer's support for Chrome DevTools Protocol (CDP) remains unchanged."
The separate §CDP support in the future says Chrome keeps defaulting to CDP. The original
version-scoped announcement paraphrase is therefore retained, not 'fixed'.

The dated W3C matrix remains specification-level only. The odd-looking anchor
`#event-network-beforeSendRequest` is retained because it is the actual draft anchor for
`network.beforeRequestSent`, not proof of a spelling correction to make.
Current MDN section content can be reverified without recovering the historical content
commit from its rendered page; no new commit identity or implementation support is asserted.

## Retry evidence — precise version qualification

The retry categories in `web-flake-retry-evidence.md` are confirmed against S013's rolling
stable page, as served 2026-10-20. The page identifies its channel as `stable`, not a fixed
1.64 document. Read phrases such as "1.64 retry description" (:24, :47, :142) as the stable
documentation served when S017's release-notes head was 1.64; they are not a version-pinned
API guarantee. The S017 shuffle announcement is explicitly Version 1.64.

The empirical paper and institutional abstract portions (S018/S019) were not part of this
bounded freshness claim. Their earlier verification dates remain unchanged. The review
receipt enumerates the Playwright claims actually rechecked; it does not call the entire
note newly verified. A passing retry remains `flaky`, not `passed`; no runner behavior was
measured locally.
