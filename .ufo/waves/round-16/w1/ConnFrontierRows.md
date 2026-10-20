# ConnFrontierRows — round 16 / wave 1

As-of: HEAD `e38d2599a922cb729186353830fff8e159b4fef0`, 2026-10-20. Working tree dirty (2 entries,
`git status --porcelain | wc -l` → 2: `PLAN.md` + untracked `w1/`).

Two passes, because siblings landed artifacts mid-seat:
- **Pass 1** (first read): `find corpus/evidence/round-16 -type f` → empty; `ls scripts/` → no
  `webmcp-loopback-round16.mjs`; `.ufo/waves/round-16/` → `PLAN.md drafts/ probes/ w1/` (no `measure.mjs`).
- **Pass 2** (re-read before writing): `corpus/evidence/round-16/webmcp/{fixtures/*.html, protocol-domain.json,
  runtime-pin.json}` present; `scripts/webmcp-loopback-round16.mjs` 878 lines, sha256 `cfece24c…`; **still no
  `receipt.json`**. The dispositions below use pass-1/pass-2 as stated; the addendum §9 records what pass 2 adds.

Seat ran: reads, hashes, and binary string extraction from the pacman cache. **No** browser, gate, selftest,
counter, or test was run.

## 1. Anchor surfaces

### 1.1 `corpus/README.md` — Frontier

| Line | Text (quote) |
|---|---|
| `:35` | "Native WebMCP in chromium 152 — unprobed (census U3)." (round-3 block) |
| `:181` | "open — still unprobed; the only WebMCP surface evidenced on the host is a CDP tool, not `navigator.modelContext`, and no flag carries it." (kaika round-1 table) |
| `:194` | "WebMCP spec | open — S020 opened and queued (CG draft 2026-10-16); native WebMCP in chromium 152 still unprobed" |
| `:216` | round-12 restatement: "… native WebMCP host probe, … WebMCP spec mining" unchanged |
| `:284-285` | round-15 restatement: "native WebMCP, … and WebMCP spec mining remain open; no source-row or metadata-fixture count is counted as expansion." |
| `:173-176` | convention: the round-3 `## Frontier` block "stays unedited"; later status is "restated" in appends (`held` / `open` / `superseded`). |

### 1.2 `corpus/knowledge/browser-surface-census.md` — census U3

| Line | Text (quote) |
|---|---|
| `:19` | "Chromium | `/usr/bin/chromium` | 152.0.7977.82-1" with its own transcript: `pacman -Q chromium` → `local/chromium 152.0.7977.82-1` |
| `:147-148` | "No WebMCP configuration exists in browser flags (`chromium-flags.conf` §1.1), the webbridge plugin tree, or kimi config" |
| `:151-152` | "The only WebMCP surface evidenced on this host is the `rea-agents` CDP tool `discover-webmcp-tools`" |
| `:153` | "Native WebMCP support in chromium 152 was not probed (§5-U3)." |
| `:188` | "U3: Whether chromium 152 exposes native WebMCP (`navigator.modelContext` etc.) — no flag configured and no runtime probe performed in this census." |
| `:196` | `## 6. Errata` — append-only; each append records the pre-append sha256 (pattern at `:198-205`). |

Current file sha256: `a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b` (census),
`590284b9afb33bee6f035b803e80940d4cc913f199ce1e9150ec1d326ff011e7` (README),
`44f2960b25f9dd90a82d15aa38f8d636d66dba568526b7693e61702ed581c79a` (SOURCES).

### 1.3 What round 16 actually asserts (`PLAN.md`)

- `:16` cites the `:35`/`:181` row by name as the C2 frontier target.
- `:19-23` — pre-probe: `document.modelContext` present, **`navigator.modelContext` absent**, declarative
  `<form toolname=…>` → `WebMCP.toolsAdded` with a full `inputSchema`; no flags → `WebMCP.enable` returns `{}`,
  no `document.modelContext`, no event.
- `:29` — counter unit: "native-WebMCP held entries 0→1".
- `:81-89` — harness: loopback `127.0.0.1:0` only, aborts every non-loopback request, temp profile, records
  `WebMCP.*`; receipt schema `tabi-round16-webmcp-v1` with runtime pin + flags + producer sha.
- `:91-93` — note limits already declared: "loopback only, no real site, no agent integration claim."
- `:95` — S020 "queued→mined if it backs the note"; S002 gets a used-by add.

The plan's declared unit (`:29`) is therefore **a note/held entry**, not a frontier row — the predicate is
unspecified until `MeasureCounters` lands `measure.mjs`, and `:31` leaves no frontier row among C2's counted
inputs, so every read of those inputs is plan-level here. Nothing in the plan authorizes rewriting `README:181`
or closing U3.

## 2. Finding that changes the row math (measured this session)

`README:181`'s third clause — "no flag carries it" — is **false at code-presence level**, and it was already
false for the census version. The exact census package is still in the pacman cache:

```
$ pacman -Q chromium
chromium 154.0.8037.97-1
$ pacman -Qp /var/cache/pacman/pkg/chromium-152.0.7977.82-1-x86_64.pkg.tar.zst
chromium 152.0.7977.82-1
$ sha256sum /var/cache/pacman/pkg/chromium-152.0.7977.82-1-x86_64.pkg.tar.zst
2598ad3e2ce31bdbc116e6cfb1f605802445df4560a1c9b2ffd139537965b363   (139,877,123 B, mtime Sep 8 15:11)
$ bsdtar -tf <pkg> | grep -x usr/lib/chromium/chromium
usr/lib/chromium/chromium
$ bsdtar -xOf <pkg> usr/lib/chromium/chromium | grep -a -o \
    'kWebMCP[A-Za-z]*\|kDeclarativeWebmcp\|kDevToolsWebMCPSupport\|ModelContextRegisterToolOptions' | sort | uniq -c
      1 kDeclarativeWebmcp
      1 kDevToolsWebMCPSupport
      1 kWebMCP
      1 kWebMCPDeclarativeFileInput
      1 kWebMCPFormAssociatedCustomElements
      1 kWebMCPTesting
      3 ModelContextRegisterToolOptions
```

The installed 154 binary (`/usr/lib/chromium/chromium`) yields the **identical** set/counts. Both binaries also
embed the same CDP method name in the same string table context:

```
$ bsdtar -xOf <152pkg> usr/lib/chromium/chromium | grep -a -o -m1 '.\{200\}toolsAdded.\{120\}'
…fontSizesWebAudio.nodeParamConnectedWebMCP.toolsAddedSending RPC_DS_READUNTIL…
$ grep -a -o -m1 '.\{200\}toolsAdded.\{120\}' /usr/lib/chromium/chromium
…fontSizesWebAudio.nodeParamConnectedWebMCP.toolsAddedSending RPC_DS_READUNTIL…   (identical up to the cut)
```

Caveats, stated because they bound what this proves:

- Strings prove **compiled-in code**, not runtime feature registration; a constant can ship with an unwired flag.
  No claim is made that 152 exposes the API at runtime.
- `grep -a -c modelContext` → 2 in both binaries; the token does not distinguish the IDL surface, so it is
  inconclusive and is not used as evidence.
- `pacman -Qp` + `bsdtar -xOf` read the cached archive only; no pacman transaction, no install, no browser.

### 2b. CDP domain advertisement (sibling artifact, landed mid-pass)

`corpus/evidence/round-16/webmcp/protocol-domain.json` (sha256 `f7cb1e8c…`, producer
`TabiR16.WebmcpProtocol-5`) reads the browser's own `/json/protocol` twice:

```
noflags  | http 200 | bytes 1578134 | domains 58
webmcp   | http 200 | bytes 1578134 | domains 58
  commands: enable,disable,invokeTool,cancelInvocation
  events:   toolsAdded,toolsRemoved,toolInvoked,toolResponded
  types:    Annotation,InvocationStatus,Tool,RemovedTool
  experimental: true   deps: Runtime+Page+DOM
comparison: { protocolSha256Equal: true, domainListsEqual: true,
              webmcpDomainPresentNoFlags: true, webmcpDomainPresentWithFlags: true,
              webmcpDomainIdentical: true }
```

So the **CDP domain is advertised by default at 154, byte-identically with and without the feature flags**;
only the page API is flag-gated. Grade this as a **committed receipt**, not a live re-run by this seat: I
verified the receipt's sha256 (`f7cb1e8c…`), the two recorded `protocolEndpoint.sha256` values (equal) and the
five comparison booleans; `experimental:true` and `dependencies:["Runtime","Page","DOM"]` re-read from both
runs. Per `corpus/SOURCES.md` S002 the domain is build-scoped. This third layer — not W2 — is what refutes the
census's "only WebMCP surface … is the `rea-agents` CDP tool" (`:151-152`) as a statement about the browser
(the browser now advertises its own domain; the rea-agents tool was an adjacent surface).

Separately, the census's own §3.4 clause remains true as written, because it is about **configured** flags:

```
$ cat ~/.config/chromium-flags.conf
--ozone-platform=wayland
--ozone-platform-hint=wayland
--enable-features=TouchpadOverscrollHistoryNavigation
--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url
--disable-features=Vulkan
```

No WebMCP entry. So "no flag configured" (census `:147`) ⇏ "no flag carries it" (README `:181`); the
README's abbreviation lost that distinction, and this round's probe is on a different package.

Version state: 152 is no longer installed (`command -v chromium` → `/usr/bin/chromium`, `pacman -Q` → 154);
`/var/cache/pacman/pkg/` holds both 152 and 154 packages. The census measured a binary that the host has
replaced; the archive preserves it.

## 3. Row-by-row disposition

### Advances (conditional on C2 landing: receipt + admitted note)

| Anchor | Effect | Requires | New pointer |
|---|---|---|---|
| `:194` WebMCP spec | queued → mined, if the note opens with the S020 `source:` line | note exists; `SOURCES.md` S020 used-by updated (`PLAN:95`) | `knowledge/webmcp-chromium-loopback-round-16.md`; `corpus/SOURCES.md` S020 |
| `:216` (round-12 "WebMCP spec mining" open) | narrows to closed **for S020 only**; not reworded in place | same as above | round-16 README append |
| `:181` clause (a) "still unprobed" | false after the receipt exists; replaced by a dated restatement | `receipt.json` summary `failed=0`, note admitted | round-16 append row W2 |
| `:181` clause (b) "only surface … is a CDP tool, not `navigator.modelContext`" | partly false: `document.modelContext` observed in 154 under flags; `navigator.modelContext` measured absent | receipt cases for the imperative + absent-navigator controls | note decision table |

### Already advanced (no dependency on the harness)

| Anchor | Effect | Anchor for it |
|---|---|---|
| `:181` clause (c) "no flag carries it" | **falsified now**: all WebMCP feature constants + `WebMCP.toolsAdded` exist in the 152 package (census version) and in 154 | §2 above; package sha256 `2598ad3e…` |
| `:35` round-3 bullet | historical; superseded by the replacement of 152 by 154 plus the name change | `:173` keeps it unedited |

### Stays open (no round-16 evidence touches it)

| Anchor | Why it stays open |
|---|---|
| `:180` extension↔daemon handshake | WebMCP is a browser surface; the webbridge daemon is untouched (no `/status`, no `/command`). |
| `:182` rate/ToS real-site records | round 16 is loopback-only by contract (`PLAN:81-84` aborts non-loopback); loopback flags/events say nothing about a real site's terms. |
| `:183` real-site journeys | same: no external site, no redirect/POST/CSRF surface; `PLAN:92` limits the note to loopback. |
| `:190-193` docs-held rows | no new source is mined for Chrome ≥136, BiDi, flake receipts, accessible locators. |
| `:184` evidence-byte archival | a new `corpus/evidence/round-16/` group appears, but it is a group, not a frontier claim; the `MANIFEST.txt` / `*profile*`-exclusion rules are unchanged and no `/tmp` tranche is named. |
| **new** default-profile capability | the operator's everyday browser carries no WebMCP flags (flags file observed above); whether `document.modelContext` exists there was not measured, and the harness's no-flag control is a *fresh temp profile*, not the operator profile. |

## 4. Census U3: narrowed, not closed

U3 is a four-clause sentence; round 16 separates them:

1. **Subject version** — "chromium 152" is gone from the host (`pacman -Q chromium` → 154). The literal question
   cannot be re-asked without the cached package; the round-16 probe answers a *different* binary.
2. **Named interface** — "`navigator.modelContext` etc.": the probed 154 build exposes `document.modelContext` and
   `'modelContext' in navigator` is false (`PLAN:19-20`). The parenthetical names the wrong object for the current
   implementation; this is a spec-versus-build divergence, not a censoring error.
3. **"no flag configured"** — still true for the config file (observed); it never meant "no flag exists."
4. **"no runtime probe performed"** — false for 154-under-flags after C2 lands; still true for 152 and for the
   default-profile launch mode.

Disposition: **U3 → narrowed (2026-10-20)**, split into four successors, none silently closed:

- `U3-152-runtime` — does the cached 152 binary expose the API under the same flags? Unrun; code presence is
  evidenced (§2), runtime is not. Reachable only by extracting the cached package and launching it (browser
  authority needed; library ABI drift is a real risk).
- `U3-154-cdp-domain` — **held now**, independent of the harness: `/json/protocol` at 154 advertises the
  `WebMCP` domain with no flags, byte-identical to the flagged run (`protocol-domain.json` comparison); commands
  `enable,disable,invokeTool,cancelInvocation`, events `toolsAdded,toolsRemoved,toolInvoked,toolResponded`,
  types `Annotation,InvocationStatus,Tool,RemovedTool`, `experimental:true`, deps `Runtime+Page+DOM`. This is
  domain advertisement, not tool registration.
- `U3-154-runtime` — held (conditional on receipt) **only** in the probed mode: Chromium 154.0.8037.97,
  explicit `--enable-features`/`--enable-blink-features`, loopback, temp profile.
- `U3-default-profile` — open: no measurement of the operator's flags-less profile; the config file shows no
  WebMCP entries, which is the only anchor.

Mechanics: the census note is append-only (`:196`). Record the disposition in §6 with the pre-append sha256
`a33c2264…`, leaving `:188` and `:147-153` byte-intact; do not renumber U3.

## 5. Proposed move (one, bounded)

**M1 — split the row; close nothing.** Add four successor rows to the round-16 README append and one
append-only census erratum. Suggested text (L1 edits; `DraftReadme` can paste):

| Frontier item | Status | Pointer |
|---|---|---|
| WebMCP code presence (chromium 152 and 154 packages) | **held** — all WebMCP feature constants and the embedded `WebMCP.toolsAdded` method name are in both packages; this corrects `:181`'s "no flag carries it". Code presence only. | `/var/cache/pacman/pkg/chromium-152.0.7977.82-1-x86_64.pkg.tar.zst` sha256 `2598ad3e…`; same strings in `/usr/lib/chromium/chromium` (154.0.8037.97-1); re-run per §7 rows 1–3 |
| WebMCP CDP domain (chromium 154, no flags) | **held now** — `/json/protocol` advertises an `experimental` `WebMCP` domain byte-identically with and without the feature flags (`enable,disable,invokeTool,cancelInvocation`; `toolsAdded,toolsRemoved,toolInvoked,toolResponded`). Domain advertisement only; no page tool registers without flags. | `corpus/evidence/round-16/webmcp/protocol-domain.json` sha256 `f7cb1e8c…`; comparison `webmcpDomainPresentNoFlags:true`, `webmcpDomainIdentical:true` |
| WebMCP runtime exposure (chromium 154, launch flags, loopback) | **held** after the receipt + note land — `document.modelContext`, declarative and imperative tool registration, `toolsAdded`/`toolsRemoved`; `navigator.modelContext` absent. | `knowledge/webmcp-chromium-loopback-round-16.md`; `corpus/evidence/round-16/webmcp/receipt.json` |
| WebMCP in the default profile (no launch flags) | **open** — flags file carries no WebMCP entry; default-mode exposure unmeasured. | `~/.config/chromium-flags.conf` (5 lines, no WebMCP); census U3 successors `U3-default-profile` |

Census erratum text (append-only, §6): record (i) 152 → 154 package replacement, (ii) `navigator.modelContext`
→ `document.modelContext` on the probed build, (iii) U3 narrowed-not-closed with the four successor ids,
(iv) pre-append sha256. Note that the census's §3.4 claims stand as written.

Why this is the non-obvious move: the tempting edit — flip `:181` from `open` to `held` once C2 counts 1 — would
carry a clause that this session shows is false ("no flag carries it"), and would let a loopback, flag-gated
observation stand in for default-profile capability. Splitting keeps the count honest: the plan's unit
(`PLAN:29`) is a held entry — its predicate is still unspecified because `measure.mjs` does not exist yet, and
`PLAN:31` leaves no frontier row among the counted inputs — while the frontier's unit is a claim class. With no
row counted, the sourced-claim duty is carried by the note's `source:` line, not by the count.

Second-order effects traced:

- **Contract**: the plan's declared unit is held entries (`PLAN:29`); the predicate is unspecified until
  `MeasureCounters` lands `measure.mjs`. If README says "row advanced," the count and the row disagree on unit.
  The split makes the join explicit (note ↔ W2) and keeps W1/W1b out of the count (static facts, not harness
  results).
- **Verification**: W1 is re-runnable by any reviewer with `sha256sum` + `bsdtar -xOf | grep` — no browser, no
  gate. W2 is re-runnable only via the receipt's `runtimePinStatus` and case summary. W3 has no runner; it is
  an observed config absence and must stay `open`.
- **Substrate**: the 152 package is host state under pacman; a cache prune (`paccache`) would destroy W1's
  anchor. Either re-confirm the package at commit time or pin its sha256 in the row (the command still works
  if a copy is later archived by the owner).
- **Axes**: coverage/capability gain only what W2's receipt backs; W1 is a **quality/calibration** correction
  that prevents a false clause from surviving a round that "advances" the row. C1 is untouched.

## 6. Risks / contradictions stated plainly

1. `README:181` vs `census:147-153` — the README derived a stronger claim than the census made; only the README
   line is wrong. An errata that "corrects the census" would be misdirected.
2. `PLAN:16` cites the row as "Native WebMCP in chromium 152 — unprobed", but the round's own probe is on 154.
   The plan's claim is coherent only if the row is restated; otherwise the claim reads as answering 152.
3. Strings ≠ runtime. If a later seat runs the extracted 152 binary and finds no `document.modelContext`, W1 is
   still true (code present) and `U3-152-runtime` is simply negative; do not back-date W1 into a capability.
4. `document.modelContext` vs `navigator.modelContext` is a genuine divergence between U3's parenthetical and the
   implementation; it must be recorded as such, not resolved by picking one name.
5. Extracting/launching 152 is **not** done here and may fail on system library ABI; it needs a seat authorized
   to run a browser, a temp profile, and loopback only.
6. Pacman is paused host-wide; nothing here performed a transaction, and none is needed for W1.

## 7. Verification

| Check | Command | Expected |
|---|---|---|
| 152 package is the census version | `pacman -Qp /var/cache/pacman/pkg/chromium-152.0.7977.82-1-x86_64.pkg.tar.zst` | `chromium 152.0.7977.82-1` |
| W1 strings | `bsdtar -xOf <pkg> usr/lib/chromium/chromium \| grep -a -o 'kWebMCP[A-Za-z]*\|kDeclarativeWebmcp\|kDevToolsWebMCPSupport' \| sort \| uniq -c` | the 6 constants, one each (observed) |
| W1 protocol marker | `… \| grep -a -o -m1 '.\{200\}toolsAdded.\{120\}'` | contains `WebMCP.toolsAdded` |
| 154 parity | same two greps against `/usr/lib/chromium/chromium` | identical sets (observed) |
| W3 config absence | `grep -ci webmcp ~/.config/chromium-flags.conf` | `0` |
| W2 gate | `node -e 'const r=require("./corpus/evidence/round-16/webmcp/receipt.json"); console.log(r.summary)'` | `failed=0`, `cases=passed` (only after the harness runs) |
| Note sources | `grep -c '^source:' corpus/knowledge/webmcp-chromium-loopback-round-16.md` | ≥1 (S020 or the opened primaries) — after L1 admits it |

## 8. Non-claims

No browser was launched, no gate/selftest/counter run, and no round-16 artifact was produced **by this seat**
(the sibling artifacts cited in §2b are theirs). This report asserts nothing about 152 runtime behavior,
default-profile behavior, or the WebMCP spec's content (S020 was not opened by this seat). Tool installs: none.

## 9. Second pass — artifacts landed mid-seat (sibling-owned; read only)

| Path | sha256 | Effect on this map |
|---|---|---|
| `corpus/evidence/round-16/webmcp/runtime-pin.json` | `fd1d34e8…` | Pins Chromium `154.0.8037.97`, `/usr/lib/chromium/chromium` sha256 `95b17db7…`, Playwright `1.64.0`, Node `v24.21.0`; records that Playwright's bundled `~/.cache/ms-playwright/chromium-1248` is **not** used. Satisfies W2's runtime-pin precondition (`PLAN:88`); adds no frontier row. |
| `corpus/evidence/round-16/webmcp/protocol-domain.json` | `f7cb1e8c…` | The §2b layer. `protocolEndpoint.sha256` equal across the no-flags and flagged runs; `webmcpDomainIdentical:true`. Makes `U3-154-cdp-domain` **held now**; the two domain entries are re-checkable without a browser from the recorded hashes. |
| `corpus/evidence/round-16/webmcp/fixtures/` (7 HTML + README) | — | Loopback fixture set, including a declarative form, a malformed form, an imperative page, a lifecycle page, and a frame pair. Scope matches `PLAN:81-84`; nothing external. |
| `scripts/webmcp-loopback-round16.mjs` | `cfece24c…` (878 lines) | Harness source exists; **`receipt.json` still absent**, so no `summary{cases,passed,failed}` exists to gate W2/L3. |

Still missing for any disposition above to move: `receipt.json`, the admitted knowledge note, the S020
`queued→mined` flip, and the README/census edits (L1-owned). Until then `:194`/`:216` remain open and `:181`
moves only through W1/W1b (the two static layers), not through a capability claim.

Revision note on §7's W2 row: the receipt schema fixes `summary {cases, passed, failed}` (`PLAN:88-90`), so the
gate is `r.summary.failed === 0 && r.summary.passed === r.summary.cases` — not a free-form `console.log`.

Build scoping: the protocol bytes (`byteLength 1578134`, `domainCount 58`) are scoped to this exact 154 build;
per `corpus/SOURCES.md` S002 (CDP viewer, mined), CDP has no backward-compatibility promise for third parties,
so the CDP-domain row must carry the version pin and must not be generalized.

## 10. Independent review record (advisory, not certification)

`TabiR16.RevFrontierStep-5` reproduced read-only: cached-package identity 152.0.7977.82-1 and sha256
`2598ad3e…`; the 152/154 constant histogram; the identical `WebMCP.toolsAdded` 40-byte context;
`grep -ci webmcp ~/.config/chromium-flags.conf` → 0; `protocol-domain.json` sha `f7cb1e8c…` and all five
comparison booleans; README:181 / census:188 text and the `:173-176` append convention. Corrections applied
after review:

1. "the counter's unit" → "the plan's unit" (`PLAN:29`), with the predicate explicitly unspecified until
   `measure.mjs` exists; noted that `PLAN:31` leaves no frontier row among C2's counted inputs, so the
   sourced-claim duty rides on the note's `source:` line.
2. §2b graded as a **committed receipt** (producer `WebmcpProtocol`), not a live re-run by this seat; S002
   build-scoping kept.
3. W1's pointer keeps the pinned package sha256 and now names the re-run rows.

`TabiR16.DraftReadme-5` adopted W1/W1b/W2/W3 and the census §6 erratum (pre-append sha `a33c2264…`) in
`.ufo/waves/round-16/drafts/DraftReadme.md`; re-checked read-only: 152 package sha, 152/154 string sets,
`protocol-domain.json` `f7cb1e8c…`, flags file 0 lines, census and README pre-append shas. Fields confirmed by
this seat after their query: both protocol runs carry `experimental:true` and
`dependencies:["Runtime","Page","DOM"]`; `runtime-pin.json` sha256 is
`fd1d34e8f49714d01c6dd6b032d00f3c6458ac5f53caff5559d9a14d8db3b9b8`.

Second re-check (same reviewer): §1.3's closing line still implied an existing counter; `:56` now carries the
same qualification as §5 — the plan's declared unit, predicate unspecified until `measure.mjs` lands, no
frontier row among C2's counted inputs. No other changes.
