# ScoutChromiumBidi — C1 recon: which BiDi implementation answers on this host

## Verdict

chromedriver 154.0.8037.97 does not use a separate BiDi server. It uses **chromium-bidi 17.0.2**, the "BiDi-CDP Mapper": a JS bundle (`mapper.js`) compiled into the chromedriver binary as an inline C++ string. chromedriver uploads it into a browser mapper tab and runs it there. The mapper translates BiDi commands into CDP calls on the same chromium. The chromedriver binary has no version string. The version comes from Chromium's own source tree at the tag matching the installed package: `third_party/bidimapper/README.chromium` says `Version: 17.0.2`, `Date: 2026-07-06`, `Revision: 237806b5551fab0bc7d34b2d4e26b61e160aec07`. I tied the binary to that source with command-name and version-marker string checks. That is static presence only, so it is not a runtime measurement.

For matrix U1 (`webdriver-bidi-capability-matrix.md:117-119`):
- **Wrong browser version.** U1 names chromium 152.0.7977.82. The host runs 154.0.8037.97, and the mapper (17.0.2) was pinned to a browser of 152.0.7923.0 (`CHANGELOG.md`, 17.0.0 breaking changes). Update U1's wording to 154.0.8037.97 + chromium-bidi 17.0.2.
- **Not independently implemented.** "Implemented in chromium via chromium-bidi" is mapper code running over CDP. Every §2 row's BiDi counterpart is present as a name in the embedded bundle, but presence is not behaviour.
- **Still unmeasured.** U1 stays open as to whether each command works as the spec says. Only the C1 live receipts can close it, row by row. Rows with no BiDi command (R16, per the assignment) have nothing to find.
- **Two things to watch in the live run:**
  - R9/R10 (network wire truth) cover fields the mapper derives from CDP events.
  - A CDP-using mapper needs chromedriver's own CDP client. Do not assume tabi's `--remote-debugging-port` tooling can attach at the same time.

## Evidence

Times are UTC. All commands exited 0 unless noted.

1. Binary identity. `chromedriver --version` printed `ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})`. `chromium --version` printed `Chromium 154.0.8037.97 Arch Linux`.
2. Package. `pacman -Qi chromium` (read-only query) gives Version `154.0.8037.97-1`, Build Date `Fri 09 Oct 2026 07:41:57 AM -03`, Install Date `Tue 20 Oct 2026 09:16:36 AM -03`. `pacman -Qo /usr/bin/chromedriver` gives `owned by chromium 154.0.8037.97-1`. The pacman package ships `/usr/bin/chromedriver`, so the mapper is whatever that binary embeds.
3. Strings (`strings -a /usr/bin/chromedriver`, 2,787,643 bytes of output, saved in my scratch only):
   - `bidi-mapper-path`
   - `bidi-mapper-path=PATH` / `custom bidi mapper path`
   - `Custom BiDi mapper path specified: `
   - `Failed to read the specified BiDi mapper path: `
   - `Failed to initialize BiDi Mapper: `
   - `window.runMapperInstance(%s)`
   - `BiDi-CDP Mapper` (the mapper page title)
   - `bidiCommand is missing in params`
   - `BiDi command does not contain a non-empty string 'goog:channel' with a leading '/'`
   - `mapperTabToServerTransport`
   - the pattern `chromium-bidi` appears only inside the mapper page text ("…chromium-bidi">Details.</a>")

   The `bidi-mapper-path` flag lets a user replace the mapper. Without it the embedded bundle runs. No chromium-bidi version string exists in the binary: a `grep -o 'chromium-bidi[/@]…'` finds nothing, which matches ScribeEntry's observation.
4. Chromium source at the tag (`curl -q -sS --proto =https`, HTTP 200, 2026-10-26T16:02Z, base64 gitiles `?format=TEXT`):
   - `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/bidimapper/README.chromium?format=TEXT` (2612 bytes) says: `Name: Implementation of WebDriver BiDi standard`, `URL: https://registry.npmjs.org/chromium-bidi/-/chromium-bidi-17.0.2.tgz`, `Version: 17.0.2`, `Date: 2026-07-06`, `Revision: 237806b5551fab0bc7d34b2d4e26b61e160aec07`, `Update Mechanism: Manual`, `Shipped: yes`. It also says "The software is compiled into mapper.js script that is uploaded by ChromeDriver into the Chrome browser."
   - `.../chrome/test/chromedriver/BUILD.gn?format=TEXT` at the same tag, lines 76-103, wires it in: `minify_js("minify_bidimapper")` takes `//third_party/bidimapper` `mapper.js`, then `action("embed_bidimapper_in_cpp")` runs `embed_bidimapper_in_cpp.py` and emits `bidimapper.cc/.h`. Line 272 adds those outputs to the chromedriver sources. That is the inline bundle.
   - `.../third_party/chromium-bidi/README.chromium` is a second copy in the tree, a hard fork. It also says `Version: 17.0.2`, with revision `d3bda5afa8c3fe9d3616bcce09ecaf38596d1ac9`, `Update Mechanism: Static.HardFork`, and "compiled into mapperTab.js". This copy is not what chromedriver's BUILD.gn embeds. It is a different mapper path, and I did not test whether it is reachable. Both copies say 17.0.2, so the version claim holds either way.
   - sha256 of the base64 `DEPS` response: `643105b3e77c5b8fd3083d4540eff10b37b2915105030dbeee51cfcc18606e96`. `DEPS` has only an npm `node_modules` entry for chromium-bidi, no git pin.
5. Binary/source tie (static presence only):
   - `.../third_party/bidimapper/mapper.js?format=TEXT` at the tag decoded to 848,227 bytes, sha256 `ac9ea125bc93872a5eeb005bf1e04ea7f3e3a90552d26e963c67594eb1ec0648`.
   - Every §2 command and event name is present in both the binary strings and the tag's `mapper.js`: `browsingContext.{getTree,navigate,navigationStarted,navigationCommitted,navigationFailed,domContentLoaded,load,captureScreenshot,locateNodes,setViewport,traverseHistory,stopScreencast,handleUserPrompt,userPromptOpened,userPromptClosed}`, `script.{evaluate,callFunction}`, `input.{performActions,setFiles}`, `network.{beforeRequestSent,responseStarted,responseCompleted,fetchError,addDataCollector,getData,disownData,addIntercept,continueRequest,failRequest,provideResponse}`, `storage.getCookies`, `session.{status,new,subscribe}`. `grep -c -F` found each name in at least 2 binary lines.
   - A version marker from 17.0.0, `digitalCredentials.setVirtualWalletBehavior`, appears in both the binary (2 lines) and `mapper.js` (2 hits). That is consistent with the bundle being ≥17.0.0.
   - `emulation.setViewport` is absent from both (0 hits). Matrix row R7's counterpart is `browsingContext.setViewport` plus unspecified `emulation.*` commands, so row R7 can be live-measured only via `browsingContext.setViewport`.
6. Upstream release notes:
   - `https://raw.githubusercontent.com/GoogleChromeLabs/chromium-bidi/chromium-bidi-v17.0.2/CHANGELOG.md` returned HTTP 200, 114,085 bytes, 2026-10-26T16:02:43Z, sha256 `d0603ff04cc36c59c0243fa7e869d58df3fb2e13dfea07e4d8afcc4f1748f7e6`.
   - The same file at tags `v17.0.2` and `chromium-bidi-17.0.2` returned 404, so the working tag form is `chromium-bidi-v17.0.2`.
   - 17.0.2 (2026-07-06) is a build-fix release only: "various build issues found by releasing after the gn migration (#4208)".
   - 17.0.0 (2026-07-06) pins the browser to 152.0.7923.0 (earlier bumps 150.0.7863.0, 151.0.7888.0) and adds `digitalCredentials.setVirtualWalletBehavior`.
   - The first 12 lines of the in-tree `third_party/chromium-bidi/CHANGELOG.md` are identical to upstream's. Its sha256 (of the base64 response) is `e353bbae3640171e9eb2d5166dc8bf6c6f25ef3d3480cd25949fd7251a18fbb4`.
   - I did not fetch the upstream README. The CHANGELOG answers the version question.
7. Processes. `pgrep -fa 'chromedriver|chromium'` lists only `earlyoom` (pid 1371), which is not mine. I started no browser and no chromedriver, so I own none.

## Entry-ready sentence for `source:` / Limits

chromedriver 154.0.8037.97 embeds chromium-bidi 17.0.2 (Chromium `third_party/bidimapper/README.chromium` at tag 154.0.8037.97, revision `237806b5551fab0bc7d34b2d4e26b61e160aec07`, wired in by `chrome/test/chromedriver/BUILD.gn` `embed_bidimapper_in_cpp`) as an inline mapper over CDP. The binary has no version string, so the version is a source fact tied to the binary by command-name and version-marker string checks, not a runtime measurement.

## Not done / unknowns

- I did not run chromedriver or chromium. This seat was read-only recon.
- I did not find how or when the mapper tab starts, or whether `--bidi-mapper-path` is needed. The strings show an override flag but no default path.
- I did not read the 154 WPT results.
- Local files in `/tmp` (strings dump, decoded README, mapper.js, DEPS, CHANGELOGs) are under 50 MB and are not copied into the output dir. The digests above are what remains.
