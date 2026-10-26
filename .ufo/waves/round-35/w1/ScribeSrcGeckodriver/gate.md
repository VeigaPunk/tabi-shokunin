# `## Gate` — rows opened this round (S134-S137)

For `corpus/lessons/round-35.md`. Seat `ScribeSrcGeckodriver`, wave w1, milestone C2-sources.
Every quote below was located in the fetched bytes by the grep pasted with it; nothing is quoted from memory.
Fetch receipts: `fetches/fetch-receipt.tsv` (six fetches, all HTTP 200, each recorded with UTC start/end,
byte count and sha256 — plus one recorded non-fetch, the mozilla-central `raw-file` probe that answered 302 with
0 bytes). Bytes kept in `fetches/`, each < 5 MB.

| row | URL | accessed (UTC) | status | bytes | sha256 | ≤25-word located quote | location |
|---|---|---|---|---|---|---|---|
| S134 | https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html | 2026-10-26T21:12:29Z | 200 | 41404 | 2b023afe95704e47f815352693b7da17348a45165bebbde2ab850b0f87ada2bc | Port to use to connect to WebDriver BiDi. Defaults to 9222. | §`--websocket-port PORT`, Flags.html:496 |
| S135 | https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html | 2026-10-26T21:12:29Z | 200 | 31324 | e596eee24f6a6ead555ce8aa6a8846a2ffe3c57a94e33e79a0372f984f06a842 | Most of these are documented on MDN. | §Firefox capabilities, Capabilities.html:293 (absence sweep below) |
| S136 | https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/capabilities.rs | 2026-10-26T21:12:29Z-21:12:30Z | 200 | 54316 | d3e65953dca6b6e1653326fbeae49d4c6cd1abfba8df47de9f9d9ca2ac870359 | `if has_web_socket_url \|\| has_debugger_address {` then `rv.use_websocket = true;` | capabilities.rs:522-523 (flag read from `matched.get("webSocketUrl")` at 510-513) |
| S137 | https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/marionette.rs | 2026-10-26T21:13:19Z | 200 | 66012 | 757e395547ed775b4a34b67deee472c78030ab977fdb7b5284140996019997a3 | `capabilities.insert("moz:geckodriverVersion".into(), build::build_info().into());` | marionette.rs:767 (inside the `NewSession` arm, 757-770) |

## Additional anchored quotes used by the rows (same fetched bytes)

```
$ grep -n -F 'Port to use to connect to WebDriver BiDi' Flags.html
496:<p>Port to use to connect to WebDriver BiDi. Defaults to 9222.</p>

$ grep -n -F 'A helpful trick' Flags.html
475:<p>A helpful trick is that it is possible to bind to 0 to get the
497:<p>A helpful trick is that it is possible to bind to 0 to get the

$ grep -n -F 'atomically assign' Flags.html
476:system to atomically assign a free port.</p>
498:system to atomically assign a free port.</p>

$ grep -n -F 'Port to use for the WebDriver server' Flags.html
474:<p>Port to use for the WebDriver server.  Defaults to 4444.</p>

$ grep -n -F 'Path to the directory to use when creating temporary profiles' Flags.html
480:<p>Path to the directory to use when creating temporary profiles. By

$ grep -n -F 'must have read-write access' Flags.html
482:Firefox must have read-write access to this path.</p>

$ grep -n '<section id=' Flags.html | sed -n '14,17p'
472:<section id="p-port-port-port">
478:<section id="profile-root-profile-root">
488:<section id="v-v">
494:<section id="websocket-portport">
```

(The read-write sentence is 481-482: `default this is the system temporary directory. Both geckodriver and` /
`Firefox must have read-write access to this path.`; the `--profile-root` section spans 478-487 and the
`--websocket-port` section 494-499.)

## S135 absence sweep — the reason the two code rows exist

```
$ grep -c 'webSocketUrl' Capabilities.html Flags.html
Capabilities.html:0
Flags.html:0

$ grep -c 'moz:geckodriverVersion' Capabilities.html Flags.html
Capabilities.html:0
Flags.html:0

$ grep -c 'firefoxOptions' Capabilities.html Flags.html
Capabilities.html:1
Flags.html:2

$ grep -n -F 'firefoxOptions' Flags.html
367:    `moz:firefoxOptions` when creating a new session. Commands that
388:capability of the <code class="docutils literal notranslate"><span class="pre">moz:firefoxOptions</span></code> object that is passed wh

$ grep -n -F 'documented on MDN' Capabilities.html
293:Most of these <a class="reference external" href="https://developer.mozilla.org/en-US/docs/Web/WebDriver/Capabilities/firefoxOptions">are documented on MDN</a>.</p>

$ grep -n '<h2>' Capabilities.html
297:<h2><code class="docutils literal notranslate"><span class="pre">moz:debuggerAddress</span></code>…
338:<h2><code class="docutils literal notranslate"><span class="pre">moz:webdriverClick</span></code>…

$ grep -c '<h2>' Capabilities.html
2

$ grep -o 'section id="[a-z:-]*"' Capabilities.html
section id="firefox-capabilities"
section id="moz-debuggeraddress"
section id="get-json-version"
section id="get-json-list"
section id="moz-webdriverclick"
```

(The two `get-json-*` sections are sub-headings of the `moz:debuggerAddress` section, not capabilities.)

So the page documents exactly two capabilities in place (`moz:debuggerAddress`, `moz:webdriverClick`); the
`webSocketUrl` capability the lane's C2 gate needs, and the `moz:geckodriverVersion` capability a receipt would
quote, are both absent from its bytes. The MDN page it links to was **not** opened, so it is not a source here
and no row claims it.

## S136 / S137 source-level greps

```
$ grep -n 'webSocketUrl\|use_websocket' capabilities-0.37.1.rs
395:    pub use_websocket: bool,
511:            .get("webSocketUrl")
523:            rv.use_websocket = true;
1008:        caps.insert("webSocketUrl".into(), json!(false));
1023:        caps.insert("webSocketUrl".into(), json!(true));
1044:        caps.insert("webSocketUrl".into(), json!(true));
1067:        caps.insert("webSocketUrl".into(), json!(true));

$ sed -n '510,523p' capabilities-0.37.1.rs
        let has_web_socket_url = matched
            .get("webSocketUrl")
            .and_then(|x| x.as_bool())
            .unwrap_or(false);

        let has_debugger_address = matched
            .remove("moz:debuggerAddress")
            .and_then(|x| x.as_bool())
            .unwrap_or(false);

        // Set a command line provided port for the Remote Agent for now.
        // It needs to be the same on the host and the Android device.
        if has_web_socket_url || has_debugger_address {
            rv.use_websocket = true;

$ grep -n -F 'moz:geckodriverVersion' marionette-0.37.1.rs
767:                capabilities.insert("moz:geckodriverVersion".into(), build::build_info().into());

$ sed -n '757,770p' marionette-0.37.1.rs
                let mut capabilities = try_opt!(
                    try_opt!(
                        resp.result.get("capabilities"),
                        ErrorStatus::UnknownError,
                        "Failed to find capabilities field"
                    )
                    .as_object(),
                    ErrorStatus::UnknownError,
                    "capabilities field is not an object"
                )
                .clone();

                capabilities.insert("moz:geckodriverVersion".into(), build::build_info().into());

                WebDriverResponse::NewSession(NewSessionResponse::new(
                    session_id.to_string(),
                    Value::Object(capabilities),
                ))

$ grep -n 'impl From<BuildInfo>\|BuildInfo::version()' build-0.37.1.rs
28:        write!(f, "{}", BuildInfo::version())?;
40:        Value::String(BuildInfo::version().to_string())
```

`build.rs` line 40 sits inside `impl From<BuildInfo> for Value` (lines 38-41), so the capability value is the
crate version string only — `"0.37.1"`, not the `--version` banner's `0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)`.
`Display` (line 28) is what the banner uses; it is not what reaches the capabilities object.

## Pin corroboration

```
$ grep -n '^version' Cargo.toml
4:version = "0.37.1"

$ /home/vgpnk/.local/bin/geckodriver --version
geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)

The source code of this program is available from
testing/geckodriver in https://hg.mozilla.org/mozilla-central.

This program is subject to the terms of the Mozilla Public License 2.0.
You can obtain a copy of the license at https://mozilla.org/MPL/2.0/.

exit=0
```

The installed driver the C2 seats run is 0.37.1, and the tag the code rows are pinned to is `v0.37.1`
(`Cargo.toml:4`). Note the scope ceiling: the GitHub repo `mozilla/geckodriver` is a tag mirror; the driver's
own banner says the canonical source is `testing/geckodriver` in `hg.mozilla.org/mozilla-central`. The bytes
here are the mirror's tag bytes — they answer "what does 0.37.1 do" and nothing about later releases.

## Screened, not registered (rationale, per CORPUS rule 4 — no row quota)

| candidate | why not a row |
|---|---|
| `https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/Cargo.toml` | corroborates the tag identity only; the claim "tag v0.37.1 is crate 0.37.1" is better carried in S136/S137's anchor cell than as its own learning source |
| `https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/build.rs` | corroborates S137's value shape; registered as an anchor line, not a separate row |
| `https://developer.mozilla.org/en-US/docs/Web/WebDriver/Capabilities/firefoxOptions` | linked from S135; **never opened by this seat**, so it cannot be a row (rule 1) and is not claimed |
| `https://hg.mozilla.org/mozilla-central/raw-file/v0.37.1/…` | probed: HTTP 302 with 0 bytes, so no bytes were read from it; not opened, not a row. Recorded as a non-fetch (redirect, empty body) rather than a 404, per the QUALITY 93 distinction |
