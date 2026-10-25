# Navigation-history evidence: a bfcache restore is a navigation with no request

source: S104 — https://web.dev/articles/bfcache — §"What is the back/forward cache?" comparison table, fetched 2026-10-25, 157667 bytes, sha256 `0dd45292df5288f84748b4d5087ed1c69b0b98eb27dc46eaf7c50c9ffaf28e07`
source: S105 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT — `Page.frameNavigated.type` and the experimental `Page.backForwardCacheNotUsed` event, fetched 2026-10-25, 82548 bytes decoded, sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`
verified-at: 2026-10-25
recheck: 90d for S104 (rolling article); on-release for S105 (a pinned Chromium tag is immutable)
tier: documented upstream, not measured in this lane

**No browser ran for this entry.** Nothing here is a capture, a run or a
measurement: it is the reading a journey receipt needs in order to *not*
misread a step it actually observes. The lane has never observed a restore —
its own probe harness has historically launched with
`--disable-back-forward-cache` (`.ufo/waves/round-17/`, round-18/19 receipts),
so no retained receipt in this repo can be cited as restore evidence.

## 1. The reading error this entry exists to stop

`multi-step-journey.md:215-219` records the nearest held rule: no client event
in a slice does mean no network activity attributable to that step *as of
capture*. A `history.back()` step sharpens that rule into a trap. The article
states the mechanism in one table cell (S104, line 2531 of the fetched bytes):

> Loading the previous page is essentially instant, because the entire page can
> be restored from memory, without having to go to the network at all.

So a back-navigation served from the back/forward cache produces **zero network
requests** and a **live document** — script state, scroll position and form
values survive. A receipt that reads "no request ⇒ no navigation" is wrong in
exactly this case, and a receipt that reads "document reloaded ⇒ fresh state" is
wrong in the other direction. Neither error is detectable from a network-only
slice: the discriminator has to be captured at the browser layer.

## 2. The discriminator, from the protocol this host's Chromium speaks

At the lane's pinned tag (154.0.8037.97), the Page domain carries both signals
(S105):

- `Page.frameNavigated` has an experimental parameter `type` whose enum includes
  `BackForwardCacheRestore` alongside `Navigation` (S105, `NavigationType`,
  line 1345 of the decoded PDL). A frame-navigated event with that type is the
  positive marker: the document that arrived was restored, not fetched.
- `Page.backForwardCacheNotUsed` is an experimental event carrying
  `loaderId`, `frameId`, and a required `notRestoredExplanations` array (S105,
  line 1706 onward). It is the negative marker: the navigation happened and the
  cache refused it, with the refusal reasons attached. Note the field name —
  `notRestoredExplanations` in this build, not the web-facing
  `NotRestoredReasons` API name the article uses (S104, line 2893: "The Chrome
  team has added the NotRestoredReasons API to help expose the reasons why pages
  don't use bfcache"). A receipt that pins the article's spelling against the
  protocol's PDL will fail to find it.

## 3. Decision table — what a journey receipt must carry for a history step

| Observed | Required capture | Receipt may conclude | Receipt may NOT conclude |
|---|---|---|---|
| `Page.frameNavigated` with `type: BackForwardCacheRestore` | the frame-navigated event verbatim, plus the post-restore DOM snapshot and the pre-navigation snapshot | the step navigated and the document was restored from memory | that the page state is fresh, or that the server saw the step |
| `Page.frameNavigated` with `type: Navigation` | the event plus the request slice for the new document | the step navigated and the document was fetched | that the restore path was unavailable (no reason recorded) |
| `Page.backForwardCacheNotUsed` present | the event with its full `notRestoredExplanations` array | the cache refused this navigation, with the reasons it named | that the refusal cause is the page's fault, or that the reasons are exhaustive |
| no frame-navigated event in the window | the window bounds and the step's own action record | no navigation was observed inside the window | that no navigation occurred (window too short, or the step was a same-document history change) |
| network slice empty, DOM unchanged | both slices plus the frame-navigated event | nothing on its own — empty network is consistent with a restore AND with a no-op | "the step did nothing" |

## 4. What this changes in the runbook

1. A history step's evidence is a **pair**: the browser-layer navigation event
   and the DOM snapshot on each side. The network slice is supporting, never
   decisive.
2. Any probe that intends to observe restores must drop
   `--disable-back-forward-cache` and record the launch argv (the flag's presence
   is itself the reason a retained receipt cannot be reused — QUALITY.md
   criterion 56, no reuse credit).
3. A restore observation is build-scoped and flag-scoped: the PDL is pinned to
   tag 154.0.8037.97, and the event is marked experimental in that file.
4. `notRestoredExplanations` (protocol) and `NotRestoredReasons` (web API) are
   two names for related surfaces; a receipt pins one or the other and says which.

## 5. Unknowns (named, not claimed)

- U1 — No restore has been observed on this host. Whether the pinned build emits
  `BackForwardCacheRestore` on a loopback fixture is unmeasured.
- U2 — Whether a restore is byte-deterministic across two cold runs (the lane's
  determinism boundary, `SKILL.md` §Determinism boundaries) is unmeasured; a
  restored document carries JS state, which the round-2 boundary already showed
  is not stable across runs.
- U3 — Whether `notRestoredExplanations` is populated for loopback pages at all
  (a page with no disqualifying features may never emit the event).
- U4 — The web.dev article is a live page and changed between two fetches in this
  same round (a scout's copy: 157667 bytes, sha256 `4535f93b…`; this entry's own
  copy: 157667 bytes, sha256 `0dd45292…` — same size, different bytes), so its
  quoted spans are dated, not stable.
- U5 — Firefox and Safari also ship a bfcache (S104, line 2511); nothing here
  claims their protocol surfaces match Chromium's.

## 6. Frontier pointer this advances

`corpus/README.md` §Frontier — "Real-site journeys + evidence durability": the
multi-step journey note's step-evidence rule now has a named edge class (restore)
with a browser-layer discriminator, still documented-upstream. The frontier item
stays open: the restore itself is unobserved here.
