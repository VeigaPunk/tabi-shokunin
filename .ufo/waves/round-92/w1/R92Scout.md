# R92Scout — round 92 source re-open (C1, `chromium-crosssite-iframe-chooser-linux`)

Seat: scout (sources S227/S228 re-open + one candidate + one rejection). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scratch: `/fast/scratch/hyaku/tabi-r92/R92Scout` (removed before yield). Cited bytes staged under
`.ufo/waves/round-92/w1/R92Scout-sources/`; machine-readable table in `.ufo/waves/round-92/w1/R92Scout-sources.json`.

**VERDICT C1: neutral** — no source I opened contradicts a clause of the frozen wording, and nothing in
them widens the claim past what `scripts/check-iframe-chooser-round92.mjs` binds. Evidence paths:
`.ufo/waves/round-92/w1/R92Scout.md` (this file), `.ufo/waves/round-92/w1/R92Scout-sources.json`,
`.ufo/waves/round-92/w1/R92Scout-sources/`.

## (a) S227 — `Target.setAutoAttach` (tag 155.0.8059.84)

- URL: `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Target.pdl?format=TEXT`
- HTTP **200**; **19,796 B** base64 → **14,847 B** decoded; sha256(decoded) `136ca4a240e64aa727e0b261cbe7ac853748154aaa8c4a86fe818d7c522535d6`
  (sha256 of the base64 payload `5b6c218b1ca4048421ea1e8677cf866d5498a84efc9d0ae0ca8bcff2ff459c09`).
- Quote (Target.pdl decoded lines 229–230, `setAutoAttach` command comment):
  > "Controls whether to automatically attach to new targets which are considered to be directly related to this one (for example, iframes or workers)."
- **Staged comparison:** my fresh decode is **byte-identical** to `.ufo/waves/round-92/sources/Target.pdl`
  (`cmp` clean, same sha256). S227's quote, its scope ("what auto-attach attaches to … and the flatten
  session mode") and its "lines 229-247" locator all still hold on the bytes fetched today.

## (b) S228 — site definition (tag 155.0.8059.84)

- URL: `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/docs/process_model_and_site_isolation.md?format=TEXT`
- HTTP **200**; **44,780 B** base64 → **33,585 B** decoded; sha256(decoded) `5a371fa56628822f38946d32ef5ce291e07ff74c1fb5a53b1eaac0249fe41bab`
  (base64 payload sha256 `c320175dd741b46784f706e269e26c8b7975f2cd9776ed624ba4fbedc4c43060`).
- Quote (decoded lines 145–147, §"Modes and Availability › Full Site Isolation (site-per-process)"):
  > "In (one-)site-per-process mode, each process is locked to documents from a single site. Sites are defined as scheme plus eTLD+1, since different origins within a given site may have synchronous access to each other"
- **Staged comparison:** fresh decode is **byte-identical** to `.ufo/waves/round-92/sources/process-model.md`
  (sha256 match). The section's own scope line 143 reads "_Used on: Desktop platforms (Windows, Mac, Linux, ChromeOS)_",
  consistent with the claim's Linux host.

## (c) Third primary source — how a CDP client handles an out-of-process iframe

- URL: `https://raw.githubusercontent.com/microsoft/playwright/a1f35e1955976e84411f9c10358228a80b763ebe/packages/playwright-core/src/server/chromium/crPage.ts`
  (pin: tag **v1.65.0** = commit `a1f35e1955976e84411f9c10358228a80b763ebe`)
- HTTP **200**; **59,431 B**; sha256 `918f0f9beed354c579d00f5656662e36264043b3b59c420d4369fd15b119dd99`
- Quote (crPage.ts line 637, inside `_handleFrameTree`):
  > "Note: OOPIF frame has been already attached in the parent session, so skip it."
  (the branch it guards, line 636, reads `const isOopif = !this._isMainFrame() && frameTree.frame.id === this._targetId;`)
- Why this is the right kind of source: a production CDP client independently encodes the claim's two
  structural facts — that an OOPIF is **already attached on the parent session** (i.e. it is reached through
  the page session's auto-attach, which is exactly what the X arm measures), and that the OOPIF's
  **`frameTree.frame.id` equals the target id** (the equality the counter binds as `iframe-target-frame`).
- Supporting build-pinned Chromium source at the same tag (all fetched HTTP 200, staged under `R92Scout-sources/`):
  - `content/browser/devtools/devtools_agent_host_impl.cc` line 142 — `const char DevToolsAgentHost::kTypeFrame[] = "iframe";` (sha256 `108ffb6c3660072d…`)
  - `content/browser/devtools/render_frame_devtools_agent_host.cc` lines 226–231 — `ShouldCreateDevToolsForHost(...) { … return rfh->is_local_root(); }` (sha256 `69f117e21aabaf41…`): a child frame earns its own agent host **only** when it is a local root, i.e. out-of-process. This is the mechanism behind the X/S split and it keeps declared limit 2 honest — the `iframe` target is Chromium's target model, not a pid observation.
  - `content/browser/site_info.cc` lines 1282–1285 — `GetDomainAndRegistry(origin, …)` then `SchemeAndHostToSite(origin.scheme(), domain.empty() ? origin.host() : domain)` (sha256 `036030868f6d525c7…`)
  - `net/base/registry_controlled_domains/registry_controlled_domain.cc` lines 518–520 — `if (canon_host.empty() || host_info.IsIPAddress()) { return std::string(); }` (sha256 `3e09184e44db80d7…`)

## (d) REJECTED candidate

- URL: `https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy`
- HTTP **200**; **167,208 B**; sha256 `c7b964588ca84ed881edf72959cceee4debf7b153db2788cd8b59576a47c4cd9`
- Quote (page intro):
  > "restricts how a document or script loaded by one origin can interact with a resource from another origin"
- **Reject reason:** generic secondary documentation, and off-topic for this claim's surface. Text scan of the
  fetched HTML: **0** occurrences of "eTLD", "site isolation", "OOPIF", "out-of-process", "registrable",
  "DevTools". It describes the same-origin *policy* (script-level access), never Chromium's CDP target model
  nor site-per-process; it cannot ground or falsify an `iframe`-target/chooser-session law.
- **Flip condition:** admit only if a round's claim rested on the web-platform same-origin concept itself
  (a spec-level origin/site law rather than a Chromium CDP-target law). Even then the WHATWG text is primary
  and MDN only a pointer — so this is a low-probability flip.

## Depth findings for L1 (record work; no claim change)

1. **S228's derivation is imprecise for the two hosts the claim uses.** The row's quote column says
   "sites are scheme plus eTLD+1, so `localhost` and `127.0.0.1` are different sites while two ports of
   `127.0.0.1` are one site". Chromium's own code says otherwise in mechanism: neither host has a
   registrable domain — `127.0.0.1` is an IP literal (`registry_controlled_domain.cc:518-520` returns an
   empty domain) and `localhost` has no PSL rule and no dot (verified: 0 hits for `localhost` and for
   `127.0.0.1` in the tag's `net/base/registry_controlled_domains/effective_tld_names.dat`, sha256
   `4155611645690529…`), so both fall back to **scheme-and-host** via `site_info.cc:1284-1285`.
   `SchemeAndHostToSite` drops the port, so two ports of `127.0.0.1` are one site and `localhost` vs
   `127.0.0.1` are two sites — the **outcome the row asserts is right**, but it is reached through the
   null-registrable-domain fallback, not through the quoted eTLD+1 sentence. The claim's own declared
   limit 2 already says "(no registrable domain)", so the frozen wording is correct; only the SOURCES row's
   derivation needs the correction. Non-falsifying; it does not change any counter check.
2. **Same observation re-opens the L1's exclusion.** The round-92 search log excluded "the WHATWG §7.1.1
   'Sites' text (scheme-and-host for hosts with no registrable domain)" as "the spec's site", but Chromium's
   site for `localhost`/`127.0.0.1` **is** that scheme-and-host rule (Chromium's `SchemefulSite::ObtainASite`
   follows the WHATWG obtain-a-site algorithm — `net/base/schemeful_site.cc` says so in a comment, and its
   `GetDomainAndRegistry()`-returns-empty note covers exactly "IP literals and effective TLDs"). The
   exclusion was therefore over-broad for these two arms. Note also that `.ufo/waves/round-92/sources/origin.html`
   is byte-identical (sha256 `448876c21fa549576ab48b7e489c805f453d8eadb1812d94d911ba37e7b8a226`) to a fresh
   fetch of `https://html.spec.whatwg.org/multipage/browsers.html` — and `…/multipage/origin.html` now
   301-redirects to `browsers.html` — so that staged filename is a legacy name for the browsers.html page.
3. **S228's locator truncates its own sentence.** The row cites "lines 141-147"; the sentence actually ends
   at decoded line 148 ("…modify their document.domain."). Harmless for the quote, worth a locator fix.

## Freshness

- Both pinned sources re-fetched **today (2026-11-08)** at tag `155.0.8059.84` and are byte-identical to the
  staged copies: the frozen S227/S228 evidence is current, not stale.
- The tag resolves to commit `5869fe313571d75152b77813cf0a4ee26a4e6df0`, matching the commit already
  recorded for this tag in `corpus/SOURCES.md` row S169 — the lane's tag pin is internally consistent.
- The measured host binary is the pinned build: `/usr/bin/chromium --version` → `Chromium 155.0.8059.84 Arch Linux`;
  `pacman -Q chromium` → `chromium 155.0.8059.84-1`.
- Instrument pins re-verified against `.ufo/waves/round-92/controls/instrument-sha256.txt` (all three match):
  driver `0feca90ba0272d9…`, counter `d4d84f92be292911…`, battery `1cecfea1d7fbb157…`.

## Commands run (exit codes)

- `curl` fetches of every URL above → HTTP 200; `base64 -d` decode → 0. HTTP 404s (recorded, not cited):
  `docs/out_of_process_iframes.md`, `docs/site_isolation.md`, `content/public/browser/site_info.cc`,
  `content/browser/devtools/devtools_agent_host.h`, `third_party/devtools-frontend/…` (devtools-frontend is a
  separate repo), `front_end/core/sdk/TargetManager.ts`.
- `cmp Target.pdl.dec …/sources/Target.pdl` → 0 (identical); `cmp process-model.dec …/sources/process-model.md` → 0.
- `sha256sum` on lane instruments vs `controls/instrument-sha256.txt` → all equal.
- `pgrep -f "remote-debugging-port="` → no processes (this seat started no Chromium; no ports assigned or used).
- Tooling installed: **none** (no pacman/`uv`/`npm` action was needed; the operator rule in
  `/home/vgpnk/.omp/agent/RULES.md` was read and nothing was installed or upgraded).

## Unknowns left

- No primary source was found at this tag for Chromium's *site-isolation enablement default* on Linux desktop
  (`site_isolation_policy.cc` `GetSiteIsolationDisabledReason()` consults the embedder's
  `ShouldEnableStrictSiteIsolation()`; `content/public/chromium/chromium_content_client.cc` was not readable
  at the guessed path and was not located). This does not affect the verdict — the counter binds the observable
  `iframe` target and chooser session, and the claim explicitly disclaims measuring pids — but it is the natural
  next row if L1 wants the *mechanism* (not just the target model) sourced.
- Whether a client may answer the chooser on the *other* session (declared limit 5) is not settled by any source
  I opened; the claim correctly declares it unmeasured.
