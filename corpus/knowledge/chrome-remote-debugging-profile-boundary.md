<!-- corpus entry — tabi-shokunin kaika round 1 (2026-10-19), lane TabiCdpProfileExec. Method: documentation only — four URLs fetched raw via curl (no browser launched, no profile touched, no live target). Chromium enforcement read first-hand from the github.com/chromium/chromium mirror @main; gitiles +log was 403, so the code anchor is branch+sha256, not a commit. Write scope: this file only. -->

# Chrome ≥136 remote-debugging / default-profile boundary

source: S001 (https://developer.chrome.com/blog/remote-debugging-port, published 2025-03-17); S002 (https://chromedevtools.github.io/devtools-protocol/, tip-of-tree page, fetched 2026-10-19); S003 (https://developer.chrome.com/blog/chrome-for-testing, last updated 2023-06-12); S004 (https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/devtools/remote_debugging_server.cc + remote_debugging_server.h, @main fetched 2026-10-19)
verified-at: 2026-10-19 (all four fetched raw this session, sha256 in §5; enforcement site read at remote_debugging_server.cc:160-183,335-424 and .h:28-50)
recheck: on each chromium major bump — `chromium --version`, then re-fetch remote_debugging_server.cc@main and diff the `IsRemoteDebuggingAllowed` block; 90d for the protocol-viewer page (living document, no version anchor)

## 1. The rule as published [observation]

Chrome's security blog (S001, Will Harris, 2025-03-17): "from Chrome 136 we're making
changes to the behavior of `--remote-debugging-port` and `--remote-debugging-pipe`. These
switches will no longer be respected if attempting to debug the default Chrome data
directory." The switches "must now be accompanied by the `--user-data-dir` switch to point
to a non-standard directory." Stated reason: a non-standard data directory uses a different
encryption key, so App-Bound-Encryption-protected data stays out of reach of the
remote-debugging exfiltration path. The same post recommends Chrome for Testing for
automation: it "will continue to respect the existing behavior."

## 2. The enforcement site in Chromium source [observation]

`chrome/browser/devtools/remote_debugging_server.cc` @main (S004):

- `IsRemoteDebuggingAllowed` (:160-183) runs two gates in order: enterprise pref
  `prefs::kDevToolsRemoteDebuggingAllowed` (:164 — refusal reason `kDisabledByPolicy`,
  .h:33), then the default-user-data-dir gate (:168-181).
- The data-dir gate is **compile-time branded**: `#if BUILDFLAG(GOOGLE_CHROME_BRANDING)`
  makes `default_user_data_dir_check_enabled` a `constexpr true` (:169-170); on
  `#else` it reads the testing global
  `g_enable_default_user_data_dir_check_for_chromium_branding_for_testing` (:171-173,
  declared :50-53). The header documents the only flip path:
  `EnableDefaultUserDataDirCheckForTesting()` — "Enables the default user data dir check
  even for non-Chrome branded builds, for testing" (.h:46-50; impl :292-294).
- OS scope is `#if BUILDFLAG(IS_WIN) || BUILDFLAG(IS_MAC) || BUILDFLAG(IS_LINUX)` (:50,
  :168) — desktop only.
- The gate is fail-closed: `is_default_user_data_dir.value_or(true)` (:177) treats an
  indeterminate data directory as default → `kDisabledByDefaultUserDataDir` (.h:34-35).
- Both switches route through it identically: `--remote-debugging-pipe` (:353-361) and
  `--remote-debugging-port` (:384-395), inside `GetInstance` (:335-424). On refusal the
  server object is never returned — the `/json/*` HTTP surface never binds.
- The HTTP socket factory binds 127.0.0.1 then ::1 with fallback (:80-95, :130-157); the
  switch string `kRemoteDebuggingAddress` does not occur in this file.

## 3. Boundary matrix [inference — derived from §2, not executed]

| build | profile dir | `--remote-debugging-*` result |
|---|---|---|
| branded Chrome ≥136 (Win/Mac/Linux) | default | refused — `kDisabledByDefaultUserDataDir`, no listener |
| branded Chrome ≥136 | non-standard via `--user-data-dir` | allowed |
| any desktop build, policy `DevToolsRemoteDebuggingAllowed=false` | any | refused — `kDisabledByPolicy` |
| unbranded Chromium (incl. local Arch 152.0.7977.82) | default | check not compiled in → allowed by this gate |
| Chrome for Testing | any | blog-claimed exempt (S001); mechanism not found in this file — [unknown] |

## 4. Relation to lane practice

- The runbook's launch recipe already satisfies the ≥136 rule by hygiene:
  `--user-data-dir=<out>/profile` (SKILL.md:127-133; round-1 variant
  `cdp-evidence-patterns.md:23-27`). What was hygiene is now a hard precondition on branded
  Chrome; on this host's unbranded Chromium the same recipe is unchanged [inference: the
  check is branding-gated §2 — the refusal was never measured locally].
- `--remote-debugging-address=127.0.0.1` (SKILL.md:128): keep it for intent, but the
  observed factory already forces loopback binds (§2) — the flag's effect on this code
  path is unconfirmed [unknown].
- `/json/version` and `/json/list` are the documented discovery surface (S002
  §HTTP endpoints): `/json/version` GET returns `Browser`, `Protocol-Version`,
  `webSocketDebuggerUrl`; `/json` or `/json/list` GET returns the inspectable-target
  array — matching this lane's measured fields (`cdp-evidence-patterns.md:38-52`). The
  same table now says `/json/new?{url}` "strictly requires PUT" — a compat change vs the
  old GET form; the lane has no `/json/new` caller to migrate.
- Session-material boundary unchanged and stricter than the Chrome rule: never point
  remote debugging at the user's real profile — session material is shape-only
  (SKILL.md:660-679), and the webbridge path borrows the user's live browser
  (SKILL.md:671-677). Local unbranded Chromium *would* accept `--remote-debugging-port`
  on the default dir (§3 row 4); lane rule forbids it anyway. The 136 refusal is a
  security backstop, not the lane's permission model.
- Trust posture: S002 states "CDP is not a public or supported API for Chrome, and it
  does not guarantee backwards compatibility" — treat every protocol shape this lane
  records (target-list fields, `frameId == target id`, `Protocol-Version: 1.3`) as
  build-scoped observation, consistent with the corpus's existing version-scoping rule
  (`cdp-evidence-patterns.md:85-88`).

## 5. Fetch records (critic H4)

- S001 `curl -sL …/blog/remote-debugging-port` → sha256 `bf63ed06681d7adf7e645cb55cd81f314e713f0b85893ee00ebc93663a871668`, 96,397 B.
- S002 `curl -sL https://chromedevtools.github.io/devtools-protocol/` → sha256 `ba8018bb02f360686cbff23304da8b6e21923a2e012ade273e3f9a2ce1e2fd64`, 35,462 B.
- S003 `curl -sL …/blog/chrome-for-testing` → sha256 `1618fa580b092d4838662ab31a248395224e7e08d581adf1f295251b78d3b77c`, 107,908 B.
- S004 `curl -sL …/remote_debugging_server.cc` → sha256 `ea72757acd7c3bff419db92bf5be101256c1bc813fcb87174a401fc8856901cc` (424 lines); companion `.h` → `841c6f67378c05cdbdbd8da48e2a39474278d84cc9049881de552589ad78a602`.

## Rejected

- **Treat raw CDP as a stable cross-browser public contract.** Rejected — S002 states
  CDP "is not a public or supported API for Chrome" and "does not guarantee backwards
  compatibility"; only official products (DevTools frontend, Lighthouse, Puppeteer,
  ChromeDriver) are supported consumers. Flip: a per-browser vendor commitment, or the
  lane migrating its evidence recipes to a supported client.
- **"The ≥136 refusal makes `--user-data-dir` hygiene optional — the browser enforces it
  now."** Rejected — the gate is branding-gated (§2); unbranded Chromium, which is what
  this lane runs (`browser-surface-census.md:19`), does not enforce it. Flip: Arch
  chromium shipping with `GOOGLE_CHROME_BRANDING` (it won't — branding is Google's own).
- **"Chromium ≥136 refuses default-profile debugging too."** Rejected at source level —
  `constexpr true` exists only under `GOOGLE_CHROME_BRANDING`; non-branded builds keep the
  check off absent the test hook. Flip: a distro build enabling
  `EnableDefaultUserDataDirCheckForTesting` at startup (none observed).

## Unknowns

1. The on-screen/exit symptom of `kDisabledByDefaultUserDataDir` (stderr line? silent
   no-listen?) — not in the fetched file; never observed because branded Chrome is not
   installed here (`browser-surface-census.md:37`).
2. Chrome for Testing's exemption mechanism — not located in remote_debugging_server.cc;
   blog claim only.
3. `chrome::IsUsingDefaultDataDirectory()` semantics (symlink equivalence, `--user-data-dir`
   pointing back at the real default) — definition not fetched.
4. Whether `--remote-debugging-address` is honored anywhere in current main (absent from
   this file; loopback is hardcoded in the factory).
5. chromium-review CL number for the change — gitiles `+log` returned 403; the code anchor
   stands at @main + sha256, not a commit hash.
