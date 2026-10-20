VERDICT: ISSUES

# C1 framing — which SOURCES rows are due, and what `on-release` means today

Scope: `corpus/SOURCES.md` at lane tip `2bff864fdfee684ddbcd066cc8e735adaba2735c` (verified:
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master` →
`2bff864fdfee684ddbcd066cc8e735adaba2735c` = baseline B). Structural gate clean at this revision:
`node scripts/check-sources.mjs` → `SOURCES_GATE verdict=clean rows=57 tiers=A:46,B:4,C:7
status=queued:8,mined:42,rejected:7 findings=0 file=corpus/SOURCES.md`.

## 1. Answer in one paragraph

By the registry's own cadences, **nothing is date-due**: every row was opened 2026-10-19/20 and the
shortest date cadence (90d) first falls due 2027-01-17. Of the 40 `on-release` rows, exactly **one**
tracked source demonstrably moved after its `opened` date — **S020** (WebMCP CG draft republished
**20 October 2026**, revision `51ed7565…`, against an anchor of CG-DRAFT 2026-10-16 / revision
`f14762e6…`) — and every other tracked product's latest release **predates** the rows' open dates
(Chrome stable 155.0.8059.84 on 2026-10-15; Playwright 1.64.1 on 2026-10-14; Selenium 4.51.0 on
2026-10-09; jj v0.46.0 on 2026-10-07; git v2.56.0 on 2026-09-28; MCP spec 2026-07-28). Round-18 C1
itself does not consult cadence at all: PLAN C1 counts **51 = every non-superseded row**
(`.ufo/waves/round-18/PLAN.md:15-21`), and at my check **49 of those 51 receipts existed**, all
`teachesVerdict=held`, all `fetchedAt` on 2026-10-20; the two absent (S045, S046) belong to seat
`Recheck22` per `.ufo/waves/round-18/w1/spec.json`.

## 2. What `on-release` means today — it is a vocabulary token, not a trigger

Observed:

- The canonical contract defines the cell, not the trigger: "`opened` — ISO date the row's author
  opened the source. `recheck` — ISO date or cadence (`90d`, `180d`, `on-release`)."
  (`/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md:105-106`).
- The only lane code that touches the token validates spelling:
  `scripts/check-sources.mjs:322` — `if (!isIsoDate(recheck) && !/^[0-9]+d$/.test(recheck) && recheck !== 'on-release') addFinding(… 'bad_recheck' …)`.
- No code computes a due date from any cadence. `grep -rn "90d\|180d\|365d" scripts/*.mjs` hits only
  `check-sources.mjs`'s own fixture rows (`:395`, `:458`).
- No watcher exists for any `on-release` product: no release-feed consumer, no chromium/npm/jj/git
  version pin compared to a row anchor anywhere under `scripts/` or `.ufo/waves/round-18/`.

Consequences measured this round:

1. **A literal reading ("a release happened since `opened`") marks 0 of 40 rows due**, because every
   product's newest release is older than the open dates — including the one row that really moved
   (S020 moved by CG-draft *publication*, not by a product release).
2. **An anchor-currency reading ("the row's pinned revision is no longer current") marks 8
   non-superseded rows**: S020 plus the five Chromium-154-tag rows (S033, S034, S041, S042, S045:
   tag `154.0.8037.97` vs stable `155.0.8059.84`) and the two jj rows (S055, S056: `v0.45.1` vs
   `v0.46.0`). None of these can ever fire under (1), because the newer release landed *before* the
   row was opened — `on-release` silently tolerates an anchor that was already behind at open.
3. Therefore the cadence cannot be used as a work queue. The work queue that does exist is PLAN C1's
   counter (all non-superseded rows), which is what the 49 receipts already paid.

## 3. Cadence census (exact)

Extraction: `awk -F'|' '/^\| S[0-9][0-9][0-9] /{… $11 …}' corpus/SOURCES.md` (column 11 = `recheck`).

| cadence | rows | ids |
|---|---|---|
| on-release | 40 | S001 S004 S013 S014 S015 S016 S017 S020 S021 S023 S024 S026 S027 S028 S030 S031 S032 S033 S034 S035 S036 S037 S038 S039 S040 S041 S042 S043 S044 S045 S046 S047 S048 S049 S050 S053 S054 S055 S056 S057 |
| 90d | 9 | S002 S005 S006 S007 S008 S009 S010 S011 S012 |
| 180d | 5 | S003 S018 S019 S051 S052 |
| 365d | 3 | S022 S025 S029 |

Date due dates (opened + N): 90d opened 2026-10-19 → **2027-01-17**; 180d opened 2026-10-19 →
**2027-04-17**, opened 2026-10-20 (S051, S052) → **2027-04-18**; 365d opened 2026-10-19 (S022, S025)
→ **2027-10-19**, opened 2026-10-20 (S029) → **2027-10-20**. Today 2026-10-20 ⇒ **zero date-due rows**.

Superseded at B (excluded from the C1 target; verified `grep -c 'supersedes S'` = 6, and the
superseding row ids match PLAN): S004→S028, S039→S040, S047→S054, S049→S055, S050→S056, S053→S057.
57 − 6 = **51**.

## 4. Release probes (key field + full sha256 of the fetched body)

| product | fetch | key field observed | body sha256 |
|---|---|---|---|
| Chrome for Testing (last known good) | `https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json` | Stable **155.0.8059.84** revision 1697595; Beta 157.0.8103.6 (1717349); Dev 158.0.8106.0 (1719119); Canary 158.0.8113.0 (1722472) | `655546e249fe219241faa05e6d9dc0ac6a521a56606a1bfafb6decf31e9326a5` |
| Chromium stable release date | `https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=3` | 155.0.8059.84 @ 2026-10-15T20:40:15Z; 155.0.8059.79 @ 2026-10-13T20:44:51Z; 155.0.8059.39 @ 2026-10-06T17:09:07Z | `6efa349b18883455193a626e80bc20f35439318d042b9f477e73277e4bbe0f7f` |
| Playwright latest (dist-tag) | `https://registry.npmjs.org/playwright/latest` | version **1.64.1** | `07bb016590a3110317c1798c54f16c9877835cdffc47075876ae714ac052226c` |
| Playwright publish times | `https://registry.npmjs.org/playwright` | `latest`=1.64.1 @ **2026-10-14T11:54:49.998Z**; newest pre-release tags `1.65.0-alpha-2026-10-16…20` (nightlies, `latest` unchanged) | `1ab9c3756173b7d90ab45ea01f34c3f6fd79edd3371084c822208fc06897de03` |
| Playwright release notes page | `https://playwright.dev/docs/release-notes` | top `<h2>` = **Version 1.64**; `grep -c "1.64.1"` = **0** (no 1.64.1 section); `--shuffle` + seed text still present | `ce461e5be73bd602d24395e4628c62ded8293b088a085c82f5436960241952c5` |
| Selenium latest | `https://api.github.com/repos/SeleniumHQ/selenium/releases/latest` | **selenium-4.51.0** @ 2026-10-09T19:18:18Z | `dd12c94fc5a79236456ad9dfcadcb07eacb68f864cbc4f8f888e9b81dae58a30` |
| selenium-webdriver npm | `https://registry.npmjs.org/selenium-webdriver/latest` | **4.51.0** | `16b674d86fcccb0f16fd7e906cf53296dc19384e5c83a525ecc1718832ce0316` |
| WebMCP repo HEAD | `https://api.github.com/repos/webmachinelearning/webmcp/commits?per_page=1` | **51ed75653aaa7f174f8dbe05d1bc327359bbc57c** @ 2026-10-20T14:57:14Z, "Discuss general agent ecosystem risks…(#334)" | `f77b1084026e5fb5a9c535bbd5cfcec9e99c0f5336256100f25d258f01d006a7` |
| WebMCP anchor commit | `https://api.github.com/repos/webmachinelearning/webmcp/commits/cb3d1696…` | cb3d1696 @ 2026-10-20T09:53:18Z, "Add new editor (#352)" | `450da3cd04f8645957a944e98bbc168dfd712a25b974f72d508266d70cffe74b` |
| WebMCP CG draft page | `https://webmachinelearning.github.io/webmcp/` | header "Draft Community Group Report, **20 October 2026**"; `<meta name="revision" content="51ed7565…">`; 511 987 B | `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40` |
| WebMCP index.bs @f14762e6 (S020 anchor) | `https://raw.githubusercontent.com/webmachinelearning/webmcp/f14762e6/index.bs` | 87 973 B; `partial interface Document` @651 | `eab56a31bc3b3934308f449587929809d04d2d47d3c10a165d3a0a197258c23e` |
| WebMCP index.bs @51ed7565 (HEAD) | `https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed7565…/index.bs` | 91 001 B; `partial interface Document` @675 | `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004` |
| WebMCP README @cb3d1696 | `…/cb3d16964ab3e92cfd5f09901ed0504373a906e8/README.md` | byte-identical to main HEAD (same digest) | `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6` |
| WebMCP declarative explainer @cb3d1696 | `…/cb3d1696…/declarative-api-explainer.md` | byte-identical to main HEAD (same digest) | `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28` |
| Chromium main WebMCP.pdl (S035 anchor) | `https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | line 7 `experimental domain WebMCP`; digest **identical** to S035's recorded `f386bcfd…f99f` | `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` |
| Chromium main HEAD | `https://api.github.com/repos/chromium/chromium/commits/main?per_page=1` | e9d982edeed4194dbab6520afe28a3bc81ba171a @ 2026-10-20T18:58:05Z | `525a0cd835ae38884e3c4e438a174ed07e9d2ed58def32534df3fa8fa6bd35c7` |
| remote_debugging_server.cc @main (S028 anchor) | `https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/devtools/remote_debugging_server.cc` | `#if BUILDFLAG(GOOGLE_CHROME_BRANDING)` @169; digest **identical** to S028's recorded `ea72757a…01cc` | `ea72757acd7c3bff419db92bf5be101256c1bc813fcb87174a401fc8856901cc` |
| jj latest release | `https://api.github.com/repos/jj-vcs/jj/releases/latest` | **v0.46.0** @ 2026-10-07T21:28:17Z | `64c3a63b52c0791dfba9c282efb6dd4f98047c873c64c178ea70147eac492708` |
| jj 0.46.0 CHANGELOG | `https://raw.githubusercontent.com/jj-vcs/jj/v0.46.0/CHANGELOG.md` | `## [0.46.0] - 2026-10-07` (line 21) | `54ee00e57a9bdf652204f0f31458a62af0b39e42f3dbd54f8d547cb212719caf` |
| git latest tag | `https://api.github.com/repos/git/git/tags?per_page=5` | top tag **v2.56.0** (commit a018953688f1b10bddf91bff8747068f5f4746a4, 2026-09-28T04:20:04Z, "Git 2.56"); no 2.57 | `21a48cb2d92432b6d66fbb42e30cc190b6d65c80f548d3b0778f6427235acdc3` |
| git downloads page | `https://git-scm.com/downloads` | no version token parseable (JS-assembled body); used the tag list above | `9e17cb15dd75bbbd5dbb984eda674863c3b10ab72613cf8a39a00c3e11a8492a` |
| MCP spec "latest" | `https://modelcontextprotocol.io/specification/latest` | HTTP **307** → `/specification/2026-07-28` (latest revision still **2026-07-28**) | `7c040f8633b8823d72ed63da9b3b2dfe9846e912c66a64c9433ec9c4815d76c2` |

Chrome-docs pages referenced by on-release rows (developer.chrome.com bodies carry a per-response
CSP nonce, so the digest is per-fetch, not a content identity — the last-updated marker is the
identity used):

| page | marker | body sha256 |
|---|---|---|
| S001 blog/remote-debugging-port | Last updated **2025-03-17** UTC | `9870ccd602e699a3a6dbca0eb03d5db6810ff7a57e2118dae57f8dc2d8d02f65` |
| S021 docs/devtools/agents | JSON-LD `dateModified` **2026-03-22**, no visible marker | `cd1026dbab33f9bc59958158caad5c9d2563c696ab2ceb1ba4455a956464f279` |
| S032 docs/ai/webmcp | Last updated **2026-10-07** UTC | `04798085be9134c5b3aa4e9e99fb9dd26c2d0416c69b7599333ed5756466ae27` |
| S047/S054 docs/ai/webmcp/imperative-api | Last updated **2026-10-16** UTC | `c3e1ba2bb45ccb09cd8d81ebaa9bcf4d1cf89de3b6360539f46572a23b0b96e0` |
| S048 docs/devtools/application/webmcp | Last updated **2026-05-12** UTC | `140d0e8beb3f168346b01cd9ea635a255d107f0cadaa1c9ebdf874b983da3c14` |

Other on-release probes: S026 Stack Exchange API `answers/74926242` → 1 item, `creation_date`
1672121925 = **2022-12-27**, score 13 (`0aee3b78722e5112ca81321ed42278a4d5761dc1e014fe2d1a0dde6e0eebeab`);
S027 duncanlock.net post → HTTP 200, dated **2023-05-27**, still recommends
`--remote-debugging-port=9222` on an everyday profile (`e36d660b349e1db885701007e8977fa8cdc6017593074b07d44ad340a4c3cace`);
S038 webmcp-fork CHROMIUM_FLAGS.md → still asserts `navigator.modelContext` (lines 19-20, 140)
(`351c02db5b16e283b9e59f1a2575c012cda96c51a60467051a1236fe15c7555a`);
S057 Chrome Web Store listing → 695 901 B, still "Google Ireland", "François Beaufort", floor
"Chrome 150.0.7861.0" (3/2/2 hits) (`92637b70f792592d60cc9b0e120e855fa4d4ff80a9ac6f4de58d3ddce7ce94f6`).

## 5. Host versions (observed, this host)

| tool | observed | equals current release? |
|---|---|---|
| `chromium --version` | `Chromium 154.0.8037.97 Arch Linux` (`/usr/bin/chromium`) | **no** — one stable behind CfT/chromiumdash stable 155.0.8059.84 (2026-10-15) |
| Playwright pinned by the r17 harness | **1.64.0** — `scripts/webmcp-invoke-round17.mjs:78` `const PLAYWRIGHT_REQUIRED = '1.64.0';`; installed global module `…/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/package.json` version 1.64.0 (sha256 `76e7341a52a4dd154553c3514926a5f824da4374d000e88d9ac3c14ee6eadf84`); corroborated by `.ufo/waves/round-17/w1/C2Harness.md:17` and `.ufo/waves/round-17/w2/ReRunHarness.md:19` | **no** — npm latest 1.64.1 (2026-10-14); pin is one patch behind |
| `jj --version` | `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5` | **no** — v0.46.0 released 2026-10-07; host matches the S049/S050/S055/S056 anchor tag |
| `git --version` | `git version 2.56.0` | **yes** — latest tag v2.56.0 (2026-09-28) |

No package installs or upgrades were performed by this seat; nothing to record under the tooling
directive.

## 6. Table — row → cadence → tracked product → anchor → current release → due?

`due?` uses two explicit readings, both stated so L1 can pick: **[L]** = literal on-release ("a
release/publication happened since `opened`"), **[A]** = anchor currency ("the pinned revision is
behind the product's current release"). Date rows use [L] only (cadence date not reached).

### on-release (40)

| row | cadence | tracked product | anchor revision | current release | due? |
|---|---|---|---|---|---|
| S001 | on-release | Branded-Chrome ≥136 remote-debugging policy blog | published 2025-03-17 | page last updated 2025-03-17 | **not due** (doc unchanged; rule still ≥136, Chrome now 155) |
| S004 | on-release | Chromium `remote_debugging_server.cc` @main | @main 2026-10-19 | file digest unchanged at main (e9d982ed) | **not due** — superseded by S028 |
| S013 | on-release | Playwright docs (retries) | stable docs served 2026-10-19 | Playwright 1.64.1 (2026-10-14) | **not due** [L]; [A] no (patch predates open) |
| S014 | on-release | Playwright docs (trace viewer) | stable docs served 2026-10-19 | 1.64.1 | **not due** |
| S015 | on-release | Playwright docs (auto-waiting) | stable docs served 2026-10-19 | 1.64.1 | **not due** |
| S016 | on-release | Playwright docs (assertions) | stable docs served 2026-10-19 | 1.64.1 | **not due** |
| S017 | on-release | Playwright release notes (1.64 `--shuffle`) | Version 1.64, served 2026-10-19 | release-notes top section still **1.64**; no 1.64.1 section | **not due** (anchor still accurate) |
| S020 | on-release | WebMCP CG draft (spec) | CG-DRAFT **2026-10-16**, revision **f14762e6** | CG-DRAFT **20 October 2026**, revision **51ed7565** | **DUE** [L] — republished after open; diff = +editor Samuel Dallstream, +security-responsibility paragraph (Agentic Web WG), +3 bib entries |
| S021 | on-release | Chrome DevTools for agents docs | "no revision marker", read 2026-10-19 | `dateModified` 2026-03-22 (JSON-LD) | **not due** |
| S023 | on-release | Playwright docs (locators) | stable docs read 2026-10-19 | 1.64.1 | **not due** |
| S024 | on-release | Playwright docs (ARIA snapshots) | stable docs read 2026-10-19 | 1.64.1 | **not due** |
| S026 | on-release | Stack Overflow answer 74926242 (rejected) | answer 2022-12-27 | unchanged (API: created 2022-12-27) | **not due** (rejection grounds hold) |
| S027 | on-release | duncanlock.net post (rejected) | post 2023-05-27 | unchanged; still `--remote-debugging-port=9222` on default profile | **not due** (rejection grounds hold) |
| S028 | on-release | Chromium `remote_debugging_server.cc` @main | @main, sha256 `ea72757a…01cc` | re-fetch today `ea72757a…01cc` — **identical** | **not due** |
| S030 | on-release | WebMCP repo README | repo HEAD `cb3d1696` | HEAD `51ed7565`; README **byte-identical** | **not due** (cited file unchanged) |
| S031 | on-release | WebMCP declarative-api-explainer.md | repo HEAD `cb3d1696` | HEAD `51ed7565`; explainer **byte-identical** | **not due** |
| S032 | on-release | Chrome WebMCP docs (origin trial, flag) | last updated 2026-10-07 | last updated 2026-10-07 | **not due** |
| S033 | on-release | Chromium 154 IDL (`model_context_supplement.idl`) | tag **154.0.8037.97** | stable **155.0.8059.84** (2026-10-15, pre-open) | **not due** [L]; **[A] yes** (one stable behind) |
| S034 | on-release | Chromium 154 `runtime_enabled_features.json5` | tag 154.0.8037.97 | stable 155.0.8059.84 | **not due** [L]; **[A] yes** |
| S035 | on-release | Chromium main `WebMCP.pdl` | main, sha256 `f386bcfd…f99f` | re-fetch `f386bcfd…f99f` — **identical** | **not due** |
| S036 | on-release | devtools-frontend `WebMCPModel.ts` | commit `66df492a` (154 DEPS) | immutable pin; 155 would move DEPS (release pre-open) | **not due** |
| S037 | on-release | MCP spec Tools (adjacency) | revision 2026-07-28 | `/specification/latest` → 2026-07-28 | **not due** |
| S038 | on-release | webmcp-fork CHROMIUM_FLAGS.md (rejected) | fetched 2026-10-20 | still `navigator.modelContext` | **not due** (rejection grounds hold) |
| S039 | on-release | bug0 Chrome-146 post (rejected) | post 2026-02-11 | static post; flip needs a Navigator-partial spec/build — `index.bs`@HEAD has **0** `navigator.modelContext` | **not due** — superseded by S040 |
| S040 | on-release | bug0 Chrome-146 post (supersedes S039) | post 2026-02-11 + spec commit c7b5c70 | as above, flip unmet | **not due** |
| S041 | on-release | Chromium 154 WebMCP PDL (invocation) | tag 154.0.8037.97 | stable 155.0.8059.84 | **not due** [L]; **[A] yes** |
| S042 | on-release | Chromium 154 Blink `model_context.cc` | tag 154.0.8037.97 | stable 155.0.8059.84 | **not due** [L]; **[A] yes** |
| S043 | on-release | WebMCP `index.bs` (executeTool) | commit **51ed7565** | HEAD **51ed7565** — same commit | **not due** |
| S044 | on-release | devtools-frontend `WebMCPView.ts` | commit `66df492a` (154 DEPS) | immutable pin | **not due** |
| S045 | on-release | Chromium 154 WebMCP web tests | tag 154.0.8037.97 | stable 155.0.8059.84 | **not due** [L]; **[A] yes** |
| S046 | on-release | WebMCP editors' explainers | commit 51ed7565 | HEAD 51ed7565 | **not due** |
| S047 | on-release | Chrome imperative-api docs | last updated 2026-10-16 | last updated 2026-10-16 | **not due** — superseded by S054 |
| S048 | on-release | Chrome DevTools "Debug WebMCP tools" docs | last updated 2026-05-12 | last updated 2026-05-12 | **not due** |
| S049 | on-release | jj git-compatibility docs | v0.45.1 (`7c41cdeb`) | jj **v0.46.0** (2026-10-07) | **not due** [L]; superseded by S055 |
| S050 | on-release | jj CHANGELOG | v0.45.1 | v0.46.0 | **not due** [L]; superseded by S056 |
| S053 | on-release | Chrome Web Store inspector listing (rejected) | body 649 153 B, sha `085c40b7…` | 695 901 B today, same cited facts (Google Ireland / Beaufort / Chrome 150.0.7861.0) | **not due** (dynamic body; digest not reproducible, claims unchanged) — superseded by S057 |
| S054 | on-release | Chrome imperative-api docs (supersedes S047) | last updated 2026-10-16 | 2026-10-16 | **not due** |
| S055 | on-release | jj git-compatibility docs (supersedes S049) | v0.45.1 (`7c41cdeb`) | jj **v0.46.0** | **not due** [L]; **[A] yes** |
| S056 | on-release | jj CHANGELOG (supersedes S050) | v0.45.1 | v0.46.0 | **not due** [L]; **[A] yes** |
| S057 | on-release | Chrome Web Store listing (supersedes S053) | body 649 153 B, sha `085c40b7…` | 695 901 B; cited facts unchanged | **not due** |

### 90d (9) — all opened 2026-10-19, first due 2027-01-17

| row | tracked product | anchor revision | current | due? |
|---|---|---|---|---|
| S002 | CDP viewer (living page) | fetched 2026-10-19 | CDP still unsupported/unversioned | not due |
| S005 | W3C WebDriver BiDi WD | WD 2026-10-08 | latest WD 2026-10-08 | not due |
| S006 | MDN BiDi modules | content commit 253bed3d | n/a (page) | not due |
| S007 | MDN BiDi connection how-to | content commit f83c12ab | n/a (page) | not due |
| S008 | Selenium BiDi docs | last modified 2026-08-15 | Selenium 4.51.0 (2026-10-09) | not due |
| S009 | Selenium network-intercept docs | page modified 2026-07-23 | Selenium 4.51.0 | not due |
| S010 | Chrome BiDi 2023 status post | last updated 2023-05-09 | static | not due |
| S011 | Firefox 129/Puppeteer 23 post | last updated 2024-08-07 | static | not due |
| S012 | chromium-bidi README | commit 1c6f4363 | n/a (commit pin) | not due |

### 180d (5)

| row | tracked product | anchor revision | current | due? |
|---|---|---|---|---|
| S003 | Chrome for Testing blog | last updated 2023-06-12 | CfT flavor still current (stable 155.0.8059.84) | not due (due 2027-04-17) |
| S018 | ICST 2025 flaky-web paper | ICST 2025 accepted | static | not due (2027-04-17) |
| S019 | KNU asynchronous-wait paper | DOI 10.1145/3695989 (2025-02-12) | static | not due (2027-04-17) |
| S051 | git-symbolic-ref(1) | git **2.56.0** (`a0189536`) | git v2.56.0 = latest | not due (due 2027-04-18) |
| S052 | git-rev-parse(1) | git 2.56.0 (`a0189536`) | git v2.56.0 = latest | not due (due 2027-04-18) |

### 365d (3)

| row | tracked product | anchor revision | current | due? |
|---|---|---|---|---|
| S022 | IEEE JS flaky-test paper | DOI 10.1109/ICST62969.2025.10989021 | static | not due (due 2027-10-19) |
| S025 | W3C ARIA APG | no revision marker, read 2026-10-19 | living doc | not due (due 2027-10-19) |
| S029 | round-13 ARIA receipt (own-work) | commit `837b33a3…` | immutable | not due (due 2027-10-20) |

## 7. Operational due set for the C1 counter (what L1 actually needs)

- Target at B: **51** non-superseded rows (PLAN.md:15-21).
- Present receipts in `corpus/evidence/round-18/source-recheck/`: **49** (`S###.json` + `S###.excerpt.txt`);
  all 49 `teachesVerdict=held`, all `httpStatus=200`, `fetchedAt` 2026-10-20.
- **Missing: S045, S046** — both assigned to seat `Recheck22` in
  `.ufo/waves/round-18/w1/spec.json` (one seat, two rows); absent at the time of this check, i.e. in
  flight, not unassigned.
- Extra receipts outside the target set: **none** (verified by set difference, no superseded row has a
  receipt).

Anchor-level flag worth L1's attention: **S020's receipt is `held` and contract-conformant** (the
quoted Abstract/status text is unchanged, and `drift` would require a superseding row under
PLAN.md:67-78), **but the row's anchor cell is provably stale** — the draft is now dated 20 October
2026 at revision `51ed7565`, one editor and one security paragraph past `f14762e6`. The round-16
search log already recorded "the live page served a later editor-only revision (51ed7565)… the anchor
cell stays as opened" (`corpus/SOURCES.md` §Search log, round-16 wave 2), so this is a known,
documented state rather than a new break; a `held` receipt does not renew the anchor either way.

## 8. Unknowns / limits

- Chrome Web Store and git-scm.com bodies are JS/locale-dependent: their byte digests are not a
  content identity across fetches (S053/S057 body went 649 153 B → 695 901 B while the cited facts
  stayed identical). Content was checked by cited token, not by digest equality.
- developer.chrome.com bodies carry a per-response CSP nonce (S054's own anchor says so); freshness
  there was read from the page's `Last updated` / JSON-LD `dateModified` markers, not from digests.
- Playwright docs pages render a version selector; I compared the `Version 1.64` heading and the
  quoted phrases, not a semantic diff against a stored 2026-10-19 snapshot (no such snapshot is
  committed).
- Chromium tag rows (S033/S034/S041/S042/S045) were not re-fetched at the tag this round; their
  immutability is the tag's, and only the tag's relation to current stable was measured.
- No release feed was polled for S021/S032/S048/S054 beyond their own published `Last updated`
  markers; a same-day edit that leaves the marker untouched would be invisible to this probe. [INFERENCE]

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/ReconRecheckDue.md
